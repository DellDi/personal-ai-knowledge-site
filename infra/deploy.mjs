#!/usr/bin/env node
// 本地手动部署脚本：通过 rsync/tar 上传本地源码到服务器，再 SSH 执行 docker 重建服务。
// 私钥保留在本地 ~/.ssh，不进入仓库、不进入 CI。
// 适用于阿里云 ECS 等无法稳定拉取 GitHub 代码的服务器。
//
// 用法：
//   pnpm deploy:web                              # 全流程：上传 → 重建 cms + web（默认 --target all）
//   pnpm deploy:web -- --target web              # 只重建前台 web
//   pnpm deploy:web -- --target cms              # 只重建 CMS
//   pnpm deploy:web -- --target cms --with-init  # 重建 CMS 并跑 cms-init 同步 schema
//   pnpm deploy:web -- --skip-sync               # 跳过源码上传，用服务器现有代码重建
//   pnpm deploy:web -- --skip-build              # 跳过 docker build（直接 run/recreate）
//   pnpm deploy:web -- --only-recreate           # 只 force-recreate 目标容器（最快重启）
//   pnpm deploy:web -- --dry-run                 # 只打印将执行的命令，不连接服务器
//   pnpm deploy:web -- --no-build-cache          # docker build 加 --no-cache
//   pnpm deploy:web -- --delete                  # rsync 删除服务器上本地已不存在的文件（慎用）

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const args = process.argv.slice(2);
const flags = parseFlags(args);

const env = loadDeployEnv();
const remoteProjectDir = env.DEPLOY_PROJECT_DIR;
const composeFile = env.DEPLOY_COMPOSE_FILE || 'infra/docker-compose.prod.yml';
const sshHost = env.DEPLOY_SSH_HOST;
const stepTimeout = Number.parseInt(env.DEPLOY_STEP_TIMEOUT || '1800', 10) * 1000;
// 项目内 ssh_config 路径（相对项目根目录或绝对路径）。存在则 ssh/rsync 都用 -F 引用。
const sshConfigRel = env.DEPLOY_SSH_CONFIG || 'infra/env/ssh_config';
const sshConfigPath = isAbsolute(sshConfigRel) ? sshConfigRel : join(projectRoot, sshConfigRel);
const sshConfigExists = existsSync(sshConfigPath);
// ssh 共用参数
const sshBin = 'ssh';
const sshBaseArgs = sshConfigExists ? ['-F', sshConfigPath] : [];
const rsyncSshShell = sshConfigExists ? `${sshBin} -F ${sshConfigPath}` : sshBin;

// 检测 rsync 是否可用，不可用则回退到 tar+ssh 管道（Windows 无需额外安装）
const syncMethod = detectSyncMethod();

// 同步排除规则：与 .dockerignore 对齐，并额外保护服务器本地的生产 env。
// production.env / deploy.env 等敏感配置由服务器自行维护，绝不上传覆盖。
const syncExcludes = [
  '.git',
  '.DS_Store',
  'node_modules',
  'apps/*/node_modules',
  'apps/*/dist',
  'apps/*/.astro',
  'apps/*/.next',
  'apps/*/.cache',
  'apps/*/.pagefind',
  '.cache',
  '.pagefind',
  'coverage',
  '.turbo',
  '*.tsbuildinfo',
  '*.swp',
  '.env',
  '.env.*',
  'infra/env/*.env',
];

const steps = buildSteps({
  flags,
  projectRoot,
  remoteProjectDir,
  sshHost,
  composeFile,
  rsyncSshShell,
  sshBaseArgs,
  syncMethod,
});

printPlan({ sshHost, remoteProjectDir, steps, dryRun: flags.dryRun, sshConfigPath, sshConfigExists, syncMethod, target: flags.target });

if (flags.dryRun) {
  console.log('\n[dry-run] 未连接服务器，命令已打印完毕。');
  process.exit(0);
}

await runSteps({ steps, stepTimeout, sshBaseArgs, remoteProjectDir });
console.log('\n✅ 部署流程完成。');

function buildSteps({ flags, projectRoot, remoteProjectDir, sshHost, composeFile, rsyncSshShell, sshBaseArgs, syncMethod }) {
  const steps = [];
  const target = flags.target; // 'web' | 'cms' | 'all'
  const noCache = flags.noBuildCache ? ' --no-cache' : '';

  // 1. 上传源码（除非 --skip-sync 或 --only-recreate）
  if (!flags.skipSync && !flags.onlyRecreate) {
    steps.push(buildSyncStep({ projectRoot, remoteProjectDir, sshHost, deleteFlag: flags.delete, rsyncSshShell, sshBaseArgs, syncMethod }));
  }

  // 2. CMS 重建（target=cms 或 all）
  //    先于 web，因为 web-build 依赖 cms healthy
  if (target === 'cms' || target === 'all') {
    if (!flags.skipBuild && !flags.onlyRecreate) {
      steps.push({
        label: '构建 cms 镜像',
        kind: 'ssh',
        command: `docker compose -f ${composeFile} build${noCache} cms`,
      });
    }
    if (flags.withInit && !flags.onlyRecreate) {
      steps.push({
        label: '构建 cms-init 镜像',
        kind: 'ssh',
        command: `docker compose -f ${composeFile} --profile init build${noCache} cms-init`,
      });
      steps.push({
        label: '运行 cms-init 同步数据库 schema',
        kind: 'ssh',
        command: `docker compose -f ${composeFile} --profile init run --rm cms-init`,
      });
    }
    steps.push({
      label: '重建 cms 容器',
      kind: 'ssh',
      command: `docker compose -f ${composeFile} up -d --force-recreate --no-deps cms`,
    });
  }

  // 3. web 重建（target=web 或 all）
  if (target === 'web' || target === 'all') {
    if (!flags.skipBuild && !flags.onlyRecreate) {
      steps.push({
        label: '构建 web-build 镜像',
        kind: 'ssh',
        command: `docker compose -f ${composeFile} --profile build build${noCache} web-build`,
      });
    }
    if (!flags.onlyRecreate) {
      steps.push({
        label: '运行 web-build 生成前台产物',
        kind: 'ssh',
        command: `docker compose -f ${composeFile} --profile build run --rm web-build`,
      });
    }
    steps.push({
      label: '重建 web 容器',
      kind: 'ssh',
      command: `docker compose -f ${composeFile} up -d --force-recreate --no-deps web`,
    });
  }

  return steps;
}

function buildSyncStep({ projectRoot, remoteProjectDir, sshHost, deleteFlag, rsyncSshShell, sshBaseArgs, syncMethod }) {
  if (syncMethod === 'rsync') {
    return buildRsyncStep({ projectRoot, remoteProjectDir, sshHost, deleteFlag, rsyncSshShell });
  }
  return buildTarStep({ projectRoot, remoteProjectDir, sshHost, sshBaseArgs });
}

function buildRsyncStep({ projectRoot, remoteProjectDir, sshHost, deleteFlag, rsyncSshShell }) {
  // rsync 通过 ssh 传输；末尾斜杠表示同步目录内容而非把目录本身放进目标。
  const excludeArgs = syncExcludes.flatMap((pattern) => ['--exclude', pattern]);
  const deleteArgs = deleteFlag ? ['--delete'] : [];
  const rsyncArgs = [
    '-avz',
    '--progress',
    ...excludeArgs,
    ...deleteArgs,
    '-e', rsyncSshShell,
    `${projectRoot}/`,
    `${sshHost}:${remoteProjectDir}/`,
  ];

  return {
    label: 'rsync 上传本地源码到服务器',
    kind: 'rsync',
    command: `rsync ${rsyncArgs.join(' ')}`,
    rsyncArgs,
  };
}

function buildTarStep({ projectRoot, remoteProjectDir, sshHost, sshBaseArgs }) {
  // tar+ssh 管道：本地 tar 打包（排除构建产物），通过 ssh 管道在服务器解包。
  // 跨平台后备方案，Windows 无需安装 rsync。
  const excludeArgs = syncExcludes.flatMap((pattern) => ['--exclude', pattern]);
  const tarArgs = ['-czf', '-', ...excludeArgs, '-C', projectRoot, '.'];
  const remoteCmd = `cd ${quote(remoteProjectDir)} && tar -xzf -`;
  const sshArgs = [...sshBaseArgs, sshHost, remoteCmd];

  return {
    label: 'tar+ssh 管道上传本地源码到服务器',
    kind: 'tar',
    command: `tar ${tarArgs.join(' ')} | ssh ${sshArgs.join(' ')}`,
    tarArgs,
    sshArgs,
  };
}

function printPlan({ sshHost, remoteProjectDir, steps, dryRun, sshConfigPath, sshConfigExists, syncMethod, target }) {
  console.log('━━━ 部署计划 ━━━');
  console.log(`SSH Host    : ${sshHost}`);
  console.log(`服务器目录  : ${remoteProjectDir}`);
  console.log(`SSH 配置    : ${sshConfigExists ? sshConfigPath : '未找到，回退到 ~/.ssh/config'}`);
  console.log(`同步方式    : ${syncMethod === 'rsync' ? 'rsync 增量' : 'tar+ssh 管道（rsync 未安装，自动回退）'}`);
  console.log(`部署目标    : ${target}${target === 'all' ? '（cms + web）' : ''}`);
  console.log(`模式        : ${dryRun ? 'DRY-RUN（不执行）' : '执行'}`);
  console.log(`步骤数      : ${steps.length}`);
  console.log('─'.repeat(50));
  steps.forEach((step, i) => {
    console.log(`[${i + 1}/${steps.length}] ${step.label}`);
    console.log(`    $ ${step.command}`);
  });
  console.log('─'.repeat(50));
  if (!dryRun) {
    console.log('排除规则：');
    syncExcludes.forEach((p) => console.log(`  - ${p}`));
    console.log('  ⚠️ infra/env/*.env 已排除，服务器 production.env 不会被覆盖');
  }
}

async function runSteps({ steps, stepTimeout, sshBaseArgs, remoteProjectDir }) {
  for (const [index, step] of steps.entries()) {
    const tag = `[${index + 1}/${steps.length}]`;
    console.log(`\n${tag} ${step.label}`);

    const exitCode = step.kind === 'rsync'
      ? await runRsync(step.rsyncArgs, stepTimeout)
      : step.kind === 'tar'
      ? await runTarPipe(step.tarArgs, step.sshArgs, stepTimeout)
      : await runSsh(step.command, stepTimeout, sshBaseArgs);

    if (exitCode !== 0) {
      console.error(`\n❌ 步骤失败：${step.label}（退出码 ${exitCode}）`);
      console.error('   后续步骤已中止。可修复后用 --skip-* 参数续跑剩余步骤。');
      process.exit(exitCode);
    }
  }
}

function detectSyncMethod() {
  const result = spawnSync('rsync', ['--version'], { stdio: 'ignore' });
  return result.status === 0 ? 'rsync' : 'tar';
}

function runTarPipe(tarArgs, sshArgs, timeoutMs) {
  return new Promise((resolveExit) => {
    // 本地 tar 打包 → stdout 管道 → ssh stdin → 服务器 tar 解包
    const tar = spawn('tar', tarArgs, { stdio: ['ignore', 'pipe', 'inherit'] });
    const ssh = spawn('ssh', sshArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

    tar.stdout.pipe(ssh.stdin);

    let settled = false;
    let exitCode = 0;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      tar.kill('SIGTERM');
      ssh.kill('SIGTERM');
      setTimeout(() => { tar.kill('SIGKILL'); ssh.kill('SIGKILL'); }, 5000);
    }, timeoutMs);

    const finish = (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveExit(code);
    };

    tar.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      console.error(`\n❌ tar 启动失败：${error.message}`);
      resolveExit(1);
    });

    ssh.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      console.error(`\n❌ ssh 启动失败：${error.message}`);
      resolveExit(1);
    });

    tar.on('close', (code) => {
      // tar 写完后结束 ssh stdin
      ssh.stdin.end();
      if (code !== 0) exitCode = code;
    });

    ssh.on('close', (code) => {
      finish(code ?? exitCode ?? 1);
    });
  });
}

function runRsync(rsyncArgs, timeoutMs) {
  return new Promise((resolveExit) => {
    const child = spawn('rsync', rsyncArgs, { stdio: ['ignore', 'inherit', 'inherit'] });

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, timeoutMs);

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      console.error(`\n❌ rsync 启动失败：${error.message}`);
      console.error('   请确认本地已安装 rsync（Windows 可用 Git Bash 或 WSL 自带）。');
      resolveExit(1);
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveExit(code ?? 1);
    });
  });
}

function runSsh(remoteCommand, timeoutMs, sshBaseArgs = []) {
  return new Promise((resolveExit) => {
    // 用 bash -lc 加载服务器登录 shell 环境（确保 docker 在 PATH 中）。
    // -T 禁用伪终端，避免输出混入控制字符。
    const remote = `cd ${quote(remoteProjectDir)} && set -e && ${remoteCommand}`;
    const child = spawn('ssh', ['-T', ...sshBaseArgs, sshHost, remote], { stdio: ['ignore', 'inherit', 'inherit'] });

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, timeoutMs);

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      console.error(`\n❌ SSH 连接失败：${error.message}`);
      console.error('   请检查 ~/.ssh/config 中 Host 配置与网络。');
      resolveExit(1);
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveExit(code ?? 1);
    });
  });
}

function parseFlags(argv) {
  const boolMap = {
    '--skip-sync': 'skipSync',
    '--skip-build': 'skipBuild',
    '--only-recreate': 'onlyRecreate',
    '--dry-run': 'dryRun',
    '--no-build-cache': 'noBuildCache',
    '--delete': 'delete',
    '--with-init': 'withInit',
  };
  const valueMap = {
    '--target': 'target',
  };
  const flags = {
    skipSync: false, skipBuild: false, onlyRecreate: false,
    dryRun: false, noBuildCache: false, delete: false, withInit: false,
    target: 'all',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') continue; // pnpm 传参分隔符

    // 支持 --target=value 形式
    const eqIdx = arg.indexOf('=');
    const argName = eqIdx > -1 ? arg.slice(0, eqIdx) : arg;
    const inlineValue = eqIdx > -1 ? arg.slice(eqIdx + 1) : undefined;

    if (argName === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    const boolKey = boolMap[argName];
    if (boolKey) {
      flags[boolKey] = true;
      continue;
    }

    const valueKey = valueMap[argName];
    if (valueKey) {
      const value = inlineValue ?? argv[i + 1];
      if (!value || value.startsWith('--')) {
        console.error(`❌ ${argName} 需要一个值（如 ${argName} web）`);
        process.exit(2);
      }
      if (!inlineValue) i += 1; // 消费下一个参数作为值
      flags[valueKey] = value;
      continue;
    }

    console.error(`未知参数：${arg}（使用 --help 查看可用参数）`);
    process.exit(2);
  }

  // 校验 target 合法性
  const validTargets = ['web', 'cms', 'all'];
  if (!validTargets.includes(flags.target)) {
    console.error(`❌ --target 值无效：${flags.target}（可选：${validTargets.join(', ')}）`);
    process.exit(2);
  }

  return flags;
}

function printHelp() {
  console.log(`
用法：pnpm deploy:web -- [参数]

参数：
  --target <目标>  指定重建目标：web | cms | all（默认 all）
  --with-init      重建 CMS 时同时跑 cms-init 同步数据库 schema（仅 --target cms/all 生效）
  --skip-sync      跳过源码上传，使用服务器现有代码重建
  --skip-build     跳过 docker build，直接 run/recreate（适合无 Dockerfile 变更）
  --only-recreate  只 force-recreate 目标容器，不传代码不构建（最快重启）
  --no-build-cache docker build 时加 --no-cache
  --delete         rsync 删除服务器上本地已不存在的文件（仅 rsync 模式生效）
  --dry-run        只打印将执行的命令，不连接服务器
  --help, -h       显示本帮助

部署目标（--target）：
  web   只重建前台：build web-build → run web-build → recreate web
  cms   只重建 CMS：build cms → [可选 cms-init] → recreate cms
  all   重建 CMS + 前台（默认）：CMS 先于 web，因为 web-build 依赖 cms healthy

工作流（--target all，默认）：
  1. 上传本地源码到服务器（rsync 或 tar+ssh 管道）
  2. docker compose build cms
  3. [若 --with-init] docker compose run --rm cms-init（同步 schema）
  4. docker compose up -d --force-recreate --no-deps cms
  5. docker compose build web-build
  6. docker compose run --rm web-build（生成前台产物）
  7. docker compose up -d --force-recreate --no-deps web

配置：infra/env/deploy.env（从 deploy.example.env 复制后填写）
`);
}

function loadDeployEnv() {
  const envPath = join(currentDir, 'env', 'deploy.env');
  if (!existsSync(envPath)) {
    console.error('❌ 未找到 infra/env/deploy.env');
    console.error('   请先复制模板：cp infra/env/deploy.example.env infra/env/deploy.env');
    console.error('   然后填写 SSH Host 与服务器项目目录。');
    process.exit(1);
  }

  const raw = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }

  const required = ['DEPLOY_SSH_HOST', 'DEPLOY_PROJECT_DIR'];
  for (const key of required) {
    if (!env[key]) {
      console.error(`❌ deploy.env 缺少必填项：${key}`);
      process.exit(1);
    }
  }
  return env;
}

function quote(value) {
  // 远程 bash 用单引号包裹路径，内部单引号先转义。
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
