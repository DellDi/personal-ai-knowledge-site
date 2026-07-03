# 基础设施

本目录区分本地开发和生产部署两套模式。

## 文件说明

| 文件 | 用途 |
|---|---|
| `docker-compose.local.yml` | 本地开发：PostgreSQL + MinIO + Payload CMS |
| `docker-compose.prod.yml` | 生产运行：PostgreSQL + Payload CMS + Astro Node 前台 |
| `docker-compose.yml` | 旧命令兼容入口，等同本地开发栈 |
| `env/local.example.env` | 本地环境变量说明 |
| `env/production.example.env` | 生产环境变量模板 |

## 本地开发

本地使用 MinIO 作为阿里云 OSS 的替身：

```bash
docker compose -f infra/docker-compose.local.yml up --build
```

本地会先运行一次 `cms-init`，用源码版 Payload 通过 `db.push` 同步开发数据库结构；初始化成功后，再启动 production 运行态的 CMS 容器。生产环境不能依赖本地 `db.push` 行为。

如果本机 `3000` 已被其他项目占用，可以临时改 CMS 暴露端口：

```bash
CMS_HOST_PORT=3001 docker compose -f infra/docker-compose.local.yml up --build
```

启动后访问：

- Payload CMS 后台：http://localhost:3000/admin
- MinIO 控制台：http://localhost:9001（minio_admin / minio_admin_password）
- PostgreSQL：localhost:5432（content / content_password / content_platform）

本地 CMS 初始化账号：`875372314@qq.com` / `123456`。该账号只用于本地开发，生产环境必须关闭 `PAYLOAD_ENABLE_AUTOLOGIN` 并创建正式管理员。

如果只想重新同步本地数据库结构，可以单独执行：

```bash
docker compose -f infra/docker-compose.local.yml up --build cms-init
```

前台连接本地 CMS：

```bash
CMS_API_URL=http://localhost:3000/api CMS_ADMIN_URL=http://localhost:3000/admin pnpm -C apps/web dev
```

## 生产部署

生产不启动 MinIO。媒体文件通过 Payload 的 S3 storage adapter 直接写入阿里云 OSS。

1. 准备环境变量：

```bash
cp infra/env/production.example.env infra/env/production.env
```

编辑 `infra/env/production.env`，替换数据库密码、Payload secret、正式域名、OSS bucket 和密钥。

`docker-compose.prod.yml` 的 `production.env` 在 `config` 校验时可缺省，便于本地检查；真实部署前仍必须创建并填写该文件。

2. 启动数据库并初始化 CMS 数据结构：

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build postgres
docker compose -f infra/docker-compose.prod.yml --profile init run --rm cms-init
docker compose -f infra/docker-compose.prod.yml up -d --build cms
```

`cms-init` 会运行 `pnpm db:init && pnpm seed:profile`。首次部署或内容模型变更后需要执行；它只在初始化阶段用 `NODE_ENV=development` 显式执行 schema push，常驻 `cms` 仍使用 `NODE_ENV=production`。

3. 构建前台产物：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
```

`web-build` 会在 compose 网络内用 `CMS_API_URL=http://cms:3000/api` 构建 Astro 前台，并把 `dist/client`、`dist/client/pagefind` 和 `dist/server` 写入 `web_dist` volume。

4. 启动前台 Astro Node server：

```bash
docker compose -f infra/docker-compose.prod.yml build web
docker compose -f infra/docker-compose.prod.yml up -d web
```

5. 在宿主机启动发布重建 webhook：

```bash
pnpm infra:prod:webhook
```

生产容器只绑定本机端口：

- 前台：`127.0.0.1:8080`
- CMS：`127.0.0.1:3000`
- 发布重建 webhook：宿主机 Node 进程，默认 `127.0.0.1:4000`；容器直连宿主机时设为 `0.0.0.0:4000`

用 1Panel / Nginx 再反代：

- `www.example.com` → `127.0.0.1:8080`
- `cms.example.com` → `127.0.0.1:3000`
- 可选：`deploy.example.com` → `127.0.0.1:4000`，必须保留 Bearer token 鉴权
- `assets.example.com` → 阿里云 OSS / CDN CNAME

## OSS 切换与迁移

改 `S3_*` 环境变量只是切换新的存储目标，不会自动搬迁旧文件。

如果本地 MinIO 里的文件只是测试数据，可以不迁移。生产环境重新上传即可。

如果本地 MinIO 已经有正式内容，需要迁移两部分：

1. PostgreSQL 数据库：保存媒体记录、文件名、尺寸、内容关联。
2. MinIO bucket 对象：保存真实文件。

基本流程：

```bash
# 1. 暂停 CMS 写入

# 2. 导出本地数据库
pg_dump "postgres://content:content_password@localhost:5432/content_platform" > content_platform.sql

# 3. 同步 MinIO bucket 到阿里云 OSS
mc alias set local http://localhost:9000 minio_admin minio_admin_password
mc alias set aliyun https://oss-cn-hangzhou.aliyuncs.com "$OSS_ACCESS_KEY_ID" "$OSS_ACCESS_KEY_SECRET"
mc mirror local/content-platform aliyun/your-production-bucket

# 4. 在生产 PostgreSQL 恢复数据库
psql "postgres://content:YOUR_PASSWORD@YOUR_PROD_HOST:5432/content_platform" < content_platform.sql

# 5. 生产 CMS 使用指向阿里云 OSS 的 S3_* 变量启动
```

只要对象 key 保持一致，Payload 的 media 记录可以继续指向迁移后的 OSS 文件，不需要手工重新上传。

## 运行边界

- 本地 MinIO 只用于开发和验证，不作为生产媒体存储。
- 生产不暴露 PostgreSQL 端口。
- 生产 CMS 关闭 `PAYLOAD_ENABLE_AUTOLOGIN`。
- Docker 日志限制在 `docker-compose.prod.yml` 中控制。
- 2C2G 服务器上不建议再常驻 Meilisearch、向量库或 AI 推理服务。

## 发布重建

CMS 发布 hooks 使用 `REBUILD_WEBHOOK_URL` 通知受保护的宿主机 `rebuild-webhook` 服务。容器直连宿主机时推荐在 `infra/env/production.env` 中使用：

```env
REBUILD_WEBHOOK_URL=http://host.docker.internal:4000/hooks/rebuild-personal-site
REBUILD_WEBHOOK_TOKEN=CHANGE_ME_RANDOM_REBUILD_WEBHOOK_TOKEN
WEBHOOK_HOST=0.0.0.0
```

CMS hook 会用 `Authorization: Bearer $REBUILD_WEBHOOK_TOKEN` 发送通知。`rebuild-webhook` 接收后异步执行：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

Astro 前台进程只负责服务公开页面、`/preview` 和 `/healthz`，不直接执行系统重建命令。

`rebuild-webhook` 在宿主机直接执行固定 compose 命令，不需要挂载 Docker socket。如果需要外部触发，使用 Nginx 反代到 `127.0.0.1:4000`，并保持 token 鉴权。

代码、依赖、Astro 配置或本地 content 变更后，先串行重建镜像，再运行一次 `web-build`：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
docker compose -f infra/docker-compose.prod.yml build web
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

## 本地手动部署（`pnpm deploy:web`）

适用于阿里云 ECS 等无法稳定拉取 GitHub 代码的服务器。脚本通过 **rsync 或 tar+ssh 管道上传本地源码**到服务器，再 SSH 执行 docker 重建前台。**私钥只保留在本地 `~/.ssh`，不进入仓库、不进入 CI**，且只在手动执行时才部署。

### 1. 配置

复制模板并填写：

```bash
cp infra/env/deploy.example.env infra/env/deploy.env
cp infra/env/ssh_config.example infra/env/ssh_config
```

`deploy.env` 关键项：

| 变量 | 说明 |
|---|---|
| `DEPLOY_SSH_HOST` | `ssh_config` 中的 Host 别名，脚本执行 `ssh -F ssh_config $HOST ...` |
| `DEPLOY_PROJECT_DIR` | 服务器上项目根目录绝对路径，同步目标、SSH 命令工作目录 |
| `DEPLOY_SSH_CONFIG` | 项目内 SSH 配置路径，默认 `infra/env/ssh_config`；不存在则回退到 `~/.ssh/config` |
| `DEPLOY_COMPOSE_FILE` | compose 文件相对路径，默认 `infra/docker-compose.prod.yml` |
| `DEPLOY_STEP_TIMEOUT` | 单步超时秒数，默认 `1800`（30 分钟，构建较慢时用） |

`ssh_config` 示例（从 `ssh_config.example` 复制后修改）：

```
Host mysite
  HostName 1.2.3.4
  User deploy
  Port 22
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
  ServerAliveInterval 30
```

`deploy.env` 和 `ssh_config` 均被 `.gitignore` 忽略，不会进入版本库。私钥本身保留在 `~/.ssh/`，配置文件只引用路径。

### 2. 同步方式：rsync 与 tar+ssh 管道

脚本**自动检测**本地是否安装 `rsync`：

- **有 rsync**：使用 `rsync -avz --progress -e ssh` 增量同步，只传变更文件，速度快。
- **无 rsync**（如 Windows 未安装）：自动回退到 `tar -czf - ... | ssh ... tar -xzf -` 管道方案，全量压缩传输，无需额外安装。

两种方式共享相同的排除规则，服务器 `infra/env/production.env` 永不被覆盖。

### 3. 前置条件

- **本地**：`ssh` 必须可用（Windows 自带 OpenSSH）；`rsync` 可选（有则增量、无则 tar 回退）；`tar` 在 Windows 10+ 自带。
- **服务器**：`ssh` + `tar` 必须可用（Linux 默认都有）；`rsync` 仅在本地也用 rsync 时需要。
- 服务器上 `DEPLOY_PROJECT_DIR` 的**父目录**需已存在。
- 服务器上需自行维护 `infra/env/production.env`（同步已排除 `infra/env/*.env`，不会被覆盖）。

### 4. 排除规则

与 `.dockerignore` 对齐，并额外保护服务器本地配置：

- 排除：`.git`、`node_modules`、`apps/*/dist`、`apps/*/.astro`、`.cache`、`.pagefind`、`coverage`、`.env*`、`infra/env/*.env` 等
- **保留**：服务器 `infra/env/production.env` 永不被覆盖

### 5. 使用

```bash
# 全流程：上传源码 → build web-build → run web-build → recreate web
pnpm deploy:web

# 跳过源码上传，用服务器现有代码重建
pnpm deploy:web -- --skip-sync

# 跳过 docker build（适合无 Dockerfile 变更，直接 run）
pnpm deploy:web -- --skip-build

# 只 force-recreate web 容器，最快重启（不传代码不构建）
pnpm deploy:web -- --only-recreate

# docker build 加 --no-cache
pnpm deploy:web -- --no-build-cache

# rsync 删除服务器上本地已不存在的文件（仅 rsync 模式生效，首次不建议用）
pnpm deploy:web -- --delete

# 只打印将执行的命令，不连接服务器（验证计划用）
pnpm deploy:web -- --dry-run

# 查看帮助
pnpm deploy:web -- --help
```

### 6. 失败续跑

任一步骤失败脚本会立即中止并返回非零退出码。修复后可用 `--skip-*` 跳过已完成的步骤续跑，例如 `web-build` 已成功但 `web` 容器没起来：

```bash
pnpm deploy:web -- --skip-sync --skip-build
```

### 7. 与 webhook 的关系

- `pnpm deploy:web`：**代码 + 前台**变更时用，从本地主动触发，会先上传最新源码。
- `rebuild-webhook`（`infra/rebuild-webhook.mjs`）：**仅内容发布**时用，由 CMS hook 触发，不上传代码，只重建前台产物。

两者互补：改代码用 `deploy:web`，纯 CMS 发内容用 webhook。
