#!/usr/bin/env node
// 本地手动部署脚本：通过 rsync 上传本地源码到服务器，再 SSH 执行 docker 重建前台 web。
// 私钥保留在本地 ~/.ssh，不进入仓库、不进入 CI。
// 适用于阿里云 ECS 等无法稳定拉取 GitHub 代码的服务器。
//
// 用法：
//   pnpm deploy:web                      # 全流程：rsync 上传 → build web-build → run web-build → recreate web
//   pnpm deploy:web -- --skip-sync       # 跳过 rsync 上传，用服务器现有代码重建
//   pnpm deploy:web -- --skip-build      # 跳过 docker build web-build（直接 run）
//   pnpm deploy:web -- --only-recreate   # 只 force-recreate web 容器
//   pnpm deploy:web -- --dry-run         # 只打印将执行的命令，不连接服务器
//   pnpm deploy:web -- --no-build-cache  # docker build 加 --no-cache
//   pnpm deploy:web -- --delete          # rsync 删除服务器上本地已不存在的文件（慎用，首次不建议）

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

printPlan({ sshHost, remoteProjectDir, steps, dryRun: flags.dryRun, sshConfigPath, sshConfigExists, syncMethod });

if (flags.dryRun) {
  console.log('\n[dry-run] 未连接服务器，命令已打印完毕。');
  process.exit(0);
}

await runSteps({ steps, stepTimeout, sshBaseArgs, remoteProjectDir });
console.log('\n✅ 部署流程完成。');

function buildSteps({ flags, projectRoot, remoteProjectDir, sshHost, composeFile, rsyncSshShell, sshBaseArgs, syncMethod }) {
  const steps = [];

  if (!flags.skipSync && !flags.onlyRecreate) {
    steps.push(buildSyncStep({ projectRoot, remoteProjectDir, sshHost, deleteFlag: flags.delete, rsyncSshShell, sshBaseArgs, syncMethod }));
  }

  if (!flags.skipBuild && !flags.onlyRecreate) {
    const noCache = flags.noBuildCache ? ' --no-cache' : '';
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

function printPlan({ sshHost, remoteProjectDir, steps, dryRun, sshConfigPath, sshConfigExists, syncMethod }) {
  console.log('━━━ 部署计划 ━━━');
  console.log(`SSH Host    : ${sshHost}`);
  console.log(`服务器目录  : ${remoteProjectDir}`);
  console.log(`SSH 配置    : ${sshConfigExists ? sshConfigPath : '未找到，回退到 ~/.ssh/config'}`);
  console.log(`同步方式    : ${syncMethod === 'rsync' ? 'rsync 增量' : 'tar+ssh 管道（rsync 未安装，自动回退）'}`);
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
  const map = {
    '--skip-sync': 'skipSync',
    '--skip-build': 'skipBuild',
    '--only-recreate': 'onlyRecreate',
    '--dry-run': 'dryRun',
    '--no-build-cache': 'noBuildCache',
    '--delete': 'delete',
  };
  const flags = {
    skipSync: false, skipBuild: false, onlyRecreate: false,
    dryRun: false, noBuildCache: false, delete: false,
  };
  for (const arg of argv) {
    if (arg === '--') continue; // pnpm 传参分隔符
    const key = map[arg];
    if (key) flags[key] = true;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      console.error(`未知参数：${arg}（使用 --help 查看可用参数）`);
      process.exit(2);
    }
  }
  return flags;
}

function printHelp() {
  console.log(`
用法：pnpm deploy:web -- [参数]

参数：
  --skip-sync       跳过 rsync 上传，使用服务器现有代码重建
  --skip-build      跳过 docker build web-build，直接 run（适合无 Dockerfile 变更）
  --only-recreate   只 force-recreate web 容器，不传代码不构建（最快重启）
  --no-build-cache  docker build 时加 --no-cache
  --delete          rsync 删除服务器上本地已不存在的文件（首次部署不建议用）
  --dry-run         只打印将执行的命令，不连接服务器
  --help, -h        显示本帮助

工作流：
  1. rsync 增量上传本地源码到服务器（排除 node_modules/dist/.git/env 等）
  2. docker compose build web-build
  3. docker compose run --rm web-build（生成前台产物）
  4. docker compose up -d --force-recreate --no-deps web

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
