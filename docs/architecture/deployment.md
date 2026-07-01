# 部署

## 部署原则

- 前台保持静态优先：Astro 构建出 `dist/client`、`dist/client/pagefind` 和 `dist/server`，由 Astro Node server 服务。
- 草稿预览需要 SSR：`/preview` 不能只靠 Nginx 静态目录托管。
- CMS 独立常驻：Payload CMS 只负责写入、草稿、媒体、API。
- 数据库只存结构化数据：PostgreSQL 不暴露公网。
- 媒体生产走阿里云 OSS：生产不部署 MinIO。
- 前台构建依赖 CMS 时，必须在 CMS 可访问后再构建。

## 本地开发拓扑

```txt
Astro dev server        http://localhost:4321
Payload CMS            http://localhost:3000/admin
PostgreSQL             localhost:5432
MinIO API / Console    localhost:9000 / localhost:9001
```

启动本地后端：

```bash
docker compose -f infra/docker-compose.local.yml up --build
```

前台连接本地 CMS：

```bash
CMS_API_URL=http://localhost:3000/api CMS_ADMIN_URL=http://localhost:3000/admin pnpm -C apps/web dev
```

## 生产拓扑

```txt
www.example.com
  -> 1Panel / Nginx
  -> 127.0.0.1:8080
  -> Astro Node container
  -> dist/client + dist/server

cms.example.com
  -> 1Panel / Nginx
  -> 127.0.0.1:3000
  -> Payload CMS
  -> PostgreSQL
  -> 阿里云 OSS

assets.example.com
  -> OSS / CDN
```

生产 compose：

```bash
cp infra/env/production.example.env infra/env/production.env
docker compose -f infra/docker-compose.prod.yml up -d --build postgres
docker compose -f infra/docker-compose.prod.yml --profile init run --rm cms-init
docker compose -f infra/docker-compose.prod.yml up -d --build cms
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml build web
docker compose -f infra/docker-compose.prod.yml up -d web
pnpm infra:prod:webhook
```

说明：

- `postgres` 与 `cms` 是常驻服务。
- `cms-init` 是一次性初始化任务，用于创建 Payload 数据库结构和种子内容；首次部署或内容模型变更后运行。它只在初始化阶段使用 `NODE_ENV=development` 并显式执行 schema push，常驻 `cms` 仍使用 `NODE_ENV=production`。
- `web-build` 是一次性构建任务，不常驻；它把 Astro 产物写入 `web_dist` volume。
- `web` 使用 `Dockerfile.web-runtime`，不执行 Astro build，只读取 `web_dist` volume 并启动 `node dist/server/entry.mjs`。
- `rebuild-webhook` 是宿主机上的轻量 Node 原生 HTTP 服务，只接收受保护的 CMS 发布通知，并串行执行前台重建。
- `cms` 和 `web` 只绑定 `127.0.0.1`，公网入口交给 1Panel / Nginx。
- CMS 容器通过 `host.docker.internal` 调用宿主机 webhook；`docker-compose.prod.yml` 已给 `cms` 配置 `host-gateway`。
- 每次 CMS 内容发布后，推荐由 webhook 触发 `web-build`，再重启或滚动更新 `web`。

## 环境变量

生产环境变量放在 `infra/env/production.env`，不要提交。

关键变量：

```env
DATABASE_URI=postgres://content:YOUR_PASSWORD@postgres:5432/content_platform
PAYLOAD_SECRET=YOUR_RANDOM_SECRET
PAYLOAD_ENABLE_AUTOLOGIN=false
PAYLOAD_PUBLIC_SERVER_URL=http://delldiagi.top
PAYLOAD_CORS_ORIGINS=http://delldiagi.top,http://delldiagi.top
PAYLOAD_CSRF_ORIGINS=http://delldiagi.top,http://delldiagi.top

CMS_API_URL=http://cms:3000/api
CMS_ADMIN_URL=http://delldiagi.top/admin
CMS_API_TOKEN=your-preview-token
REBUILD_WEBHOOK_URL=http://host.docker.internal:4000/hooks/rebuild-personal-site
REBUILD_WEBHOOK_TOKEN=your-random-rebuild-webhook-token
WEBHOOK_HOST=0.0.0.0
WEBHOOK_PORT=4000

S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
S3_REGION=oss-cn-hangzhou
S3_BUCKET=your-production-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_FORCE_PATH_STYLE=false
```

## 本地 MinIO 到阿里云 OSS

本地 MinIO 和生产 OSS 都走 S3 兼容协议，但它们是两个不同存储。切换环境变量不会自动迁移旧文件。

如果本地 MinIO 里的内容需要发布，需要同步：

- PostgreSQL 数据：Payload 的 media 记录和内容关联。
- 对象文件：MinIO bucket 里的真实文件。

推荐流程：

```bash
pg_dump "postgres://content:content_password@localhost:5432/content_platform" > content_platform.sql

mc alias set local http://localhost:9000 minio_admin minio_admin_password
mc alias set aliyun https://oss-cn-hangzhou.aliyuncs.com "$OSS_ACCESS_KEY_ID" "$OSS_ACCESS_KEY_SECRET"
mc mirror local/content-platform aliyun/your-production-bucket

psql "postgres://content:YOUR_PASSWORD@YOUR_PROD_HOST:5432/content_platform" < content_platform.sql
```

如果本地只是测试上传，直接丢弃 MinIO 数据，生产重新上传即可。

## 发布重建

Payload CMS 的发布 hooks 会在内容发布、下架或删除时向 `REBUILD_WEBHOOK_URL` 发送 JSON payload。生产默认指向宿主机上的 `infra/rebuild-webhook.mjs`，由它验证 token 后执行固定的前台重建命令。

推荐把“代码/依赖部署”和“内容发布重建”分开。

代码、依赖、Astro 配置或本地 content 变更后：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
docker compose -f infra/docker-compose.prod.yml build web
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

仅 CMS 内容发布、下架或删除后：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

第一版不让 Astro 进程直接执行重建命令，避免把前台运行时变成远程命令执行入口。

## 健康检查

- 前台 Astro Node server：`/healthz`
- CMS：`/api/access`
- PostgreSQL：`pg_isready`

## 2C2G 服务器边界

当前生产栈针对 2GB 内存服务器做了以下优化：

- PostgreSQL 限制 `shared_buffers=64MB`、`max_connections=50`，内存占用压到 100–150MB
- CMS 和 Web Dockerfile 统一使用 `node:22-alpine`，并固定 `pnpm@11.7.0`，避免 2GB 服务器重复拉取 Node 22 与 Node 24 两套基础镜像层，也减少 Corepack 临时下载的不确定性
- `web-build` 使用预装依赖镜像（`Dockerfile.web-build`），内容发布重建时只跑 `astro build` + `pagefind`，不再执行 `pnpm install`
- `web` 使用运行时镜像（`Dockerfile.web-runtime`），启动时只执行 `node dist/server/entry.mjs`
- CMS、普通前台镜像和 `web-build` 的 Node build 阶段使用 `NODE_OPTIONS=--max-old-space-size=512` 控制 V8 heap 峰值
- `web` 运行时内存限制为 `--max-old-space-size=256`
- 不常驻 MinIO、Meilisearch、向量库、AI 推理服务

### 内存预估

| 服务 | 状态 | 优化后内存 |
|---|---|---|
| PostgreSQL | 常驻 | 100–150 MB |
| Payload CMS | 常驻 | 300–400 MB |
| Astro Web | 常驻 | 100–200 MB |
| Node webhook | 常驻 | 30–60 MB |
| Nginx / 1Panel | 常驻 | 50–100 MB |
| OS + Docker | 常驻 | 300–400 MB |
| **常驻合计** | | **900–1330 MB** |
| web-build（触发时） | 临时 | 400–700 MB |
| **峰值合计** | | **1300–2030 MB** |

### Swap 兜底

2GB 物理内存下，构建峰值可能触及上限。建议确认服务器至少有 2–4GB swap 防止 OOM。没有 swap 时可创建：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

swap 比物理内存慢，但能防止构建时 OOM 杀死进程。构建完成后 swap 会自动释放。

### 前台构建与运行镜像

`Dockerfile.web-build` 把 `pnpm install` 预装到镜像层，内容发布重建时只需要执行 `astro build` + `pagefind`。这样：

- 构建时不需要联网装依赖
- 内容发布重建的峰值内存低于 `pnpm install + astro build` 混跑
- 代码、依赖、Astro 配置或本地 content 变化时需要重新 build 这个镜像：`docker compose -f infra/docker-compose.prod.yml --profile build build web-build`

`Dockerfile.web-runtime` 只安装运行前台 SSR 入口需要的依赖，不执行 `astro build`。生产 `web` 服务通过 `web_dist` volume 读取 `web-build` 生成的 `dist`。

### Webhook 接收端

`rebuild-webhook` 是 [infra/rebuild-webhook.mjs](../../infra/rebuild-webhook.mjs) 单文件 Node 原生 HTTP 服务（约 30–60MB），部署在宿主机上，负责：

1. 接收 CMS 发布通知
2. 验证 `Authorization: Bearer $REBUILD_WEBHOOK_TOKEN`
3. 异步、串行触发 `web-build`
4. 用 `docker compose up -d --force-recreate --no-deps web` 重启前台，使新的 `dist` 生效

在宿主机仓库根目录启动：

```bash
pnpm infra:prod:webhook
```

该服务默认读取 `infra/env/production.env`，也可以通过 `WEBHOOK_ENV_FILE` 指定环境变量文件。线上建议用 systemd 常驻：

```ini
[Unit]
Description=Personal AI Knowledge Site rebuild webhook
After=docker.service network.target

[Service]
WorkingDirectory=/path/to/personal-ai-knowledge-site
Environment=WEBHOOK_ENV_FILE=/path/to/personal-ai-knowledge-site/infra/env/production.env
ExecStart=/usr/bin/node infra/rebuild-webhook.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

CMS 容器直连宿主机时推荐：

```env
REBUILD_WEBHOOK_URL=http://host.docker.internal:4000/hooks/rebuild-personal-site
REBUILD_WEBHOOK_TOKEN=your-random-rebuild-webhook-token
WEBHOOK_HOST=0.0.0.0
```

如果改用 Nginx 反代 `deploy.example.com` 到 `127.0.0.1:4000`，则 `WEBHOOK_HOST` 可以设回 `127.0.0.1`，并把 `REBUILD_WEBHOOK_URL` 改成对应 HTTPS 地址。不要去掉 Bearer token，不要把 4000 端口裸露到公网。

不建议同时常驻：

- MinIO
- Meilisearch
- 向量库
- AI 推理服务
- 大文件本地存储
