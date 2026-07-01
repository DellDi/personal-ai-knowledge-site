---
name: personal-ai-knowledge-site-deploy
description: 部署、验证或排查本仓库 personal-ai-knowledge-site 的生产环境时使用，尤其适用于 2GB 内存服务器、Docker Compose prod 模式、Payload CMS 初始化、Astro 前台分步构建、web-build/web-runtime、宿主机 Node rebuild-webhook、端口健康检查、CMS API 校验和上线交接。
---

# 生产部署 Skill

## 适用场景

当用户提到以下任务时使用本 skill：

- 线上部署、生产部署、prod 模式、上线验证
- 2GB 内存、swap、构建爆内存、Docker 卡住
- `infra/docker-compose.prod.yml`、`Dockerfile.web-build`、`Dockerfile.web-runtime`
- Payload CMS 初始化、`cms-init`、数据库 schema push
- 前台 `web-build` 分步构建、`rebuild-webhook` 发布重建、健康检查
- 让另一个部署 AI 或服务器自动化工具接手上线

本 skill 只适用于当前项目：`personal-ai-knowledge-site`。

## 基本原则

- 默认中文输出。
- 从仓库根目录执行命令。
- 生产部署必须分步执行，不要一次性 `up --build` 全部服务。
- `postgres`、`cms`、`web` 是 Docker 常驻服务；`rebuild-webhook` 是宿主机 Node 常驻进程；`cms-init` 和 `web-build` 是一次性任务。
- `cms-init` 只用于初始化或内容模型变更后的 schema 同步；常驻 `cms` 必须保持 `NODE_ENV=production`。
- `web-build` 负责生成 `web_dist` volume；`web` 只读取 `web_dist` 并启动 `node dist/server/entry.mjs`。
- `rebuild-webhook` 是 `infra/rebuild-webhook.mjs`，只用 Node 原生 HTTP；它验证 `REBUILD_WEBHOOK_TOKEN` 后串行触发 `web-build` 并重建 `web`。
- 生产端口默认只绑定本机：CMS `127.0.0.1:3000`，Web `127.0.0.1:8080`，Webhook `127.0.0.1:4000`。
- 不打印、复制或提交 `infra/env/production.env` 里的密钥。
- 不要删除生产数据库 volume。只有用户明确要求重置数据时，才使用 `down -v`。
- 不要直接运行 `docker system prune -a --volumes`。磁盘不足时先汇报风险，再选择最小清理动作。

## 部署前检查

先确认上下文：

```bash
pwd
git status --short
docker info
docker compose -f infra/docker-compose.prod.yml config
df -h
docker system df
```

检查生产环境变量文件是否存在，但不要输出完整内容：

```bash
test -f infra/env/production.env && echo "production.env exists"
```

关键变量需要存在：

- `DATABASE_URI`
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_SERVER_URL`
- `PAYLOAD_CORS_ORIGINS`
- `PAYLOAD_CSRF_ORIGINS`
- `CMS_API_URL`
- `CMS_ADMIN_URL`
- `CMS_API_TOKEN`
- `REBUILD_WEBHOOK_URL`
- `REBUILD_WEBHOOK_TOKEN`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

检查端口占用：

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:4000 -sTCP:LISTEN
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

如果是在 Linux 服务器上，也可以用：

```bash
ss -ltnp | grep -E ':3000|:4000|:8080|:5432'
```

## 首次或完整部署流程

按顺序执行，每一步成功后再进入下一步。

1. 启动数据库：

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build postgres
docker compose -f infra/docker-compose.prod.yml ps postgres
```

2. 初始化 Payload 数据库结构和种子数据：

```bash
docker compose -f infra/docker-compose.prod.yml --profile init run --rm --build cms-init
```

3. 启动 CMS：

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build cms
docker compose -f infra/docker-compose.prod.yml ps cms
```

4. 构建前台构建镜像：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
```

5. 运行前台构建，把产物写入 `web_dist`：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
```

6. 构建前台运行镜像：

```bash
docker compose -f infra/docker-compose.prod.yml build web
```

7. 启动前台：

```bash
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
docker compose -f infra/docker-compose.prod.yml ps
```

8. 在宿主机启动发布重建 webhook：

```bash
pnpm infra:prod:webhook
```

## 内容发布后的轻量重建

只改 CMS 内容，代码和依赖没有变时，运行：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

## 代码或依赖更新后的重建

代码、依赖、Astro 配置、本地 content 或 Dockerfile 变化后，运行：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
docker compose -f infra/docker-compose.prod.yml build web
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

如果改了 Payload collection、字段、迁移或 seed 逻辑，先补跑：

```bash
docker compose -f infra/docker-compose.prod.yml --profile init run --rm --build cms-init
```

## 验收检查

Docker 容器必须健康，宿主机 webhook 必须可访问：

```bash
docker compose -f infra/docker-compose.prod.yml ps
docker stats --no-stream cks-prod-postgres cks-prod-cms cks-prod-web
curl -fsS http://127.0.0.1:4000/healthz
```

核心路由需要返回 200：

```bash
curl -fsS http://127.0.0.1:3000/api/access >/dev/null
curl -fsSI http://127.0.0.1:4000/healthz
curl -fsSI http://127.0.0.1:8080/healthz
curl -fsSI http://127.0.0.1:8080/zh-CN/
curl -fsSI http://127.0.0.1:8080/en/
curl -fsSI http://127.0.0.1:8080/rss.xml
curl -fsSI http://127.0.0.1:8080/podcast/rss.xml
curl -fsSI http://127.0.0.1:8080/zh-CN/search
curl -fsSI http://127.0.0.1:8080/zh-CN/admin
```

CMS API 至少能返回内容结构：

```bash
curl -fsS "http://127.0.0.1:3000/api/posts?limit=1"
curl -fsS "http://127.0.0.1:3000/api/projects?limit=1"
```

预览端点需要 noindex，且能加载一条内容：

```bash
curl -fsSI "http://127.0.0.1:8080/preview?collection=posts&id=2"
```

检查构建日志时，必须确认前台从 CMS 拉到了内容。类似日志是有效信号：

```txt
从 CMS 加载 2 条已发布 posts
从 CMS 加载 7 条已发布 projects
```

如果日志显示 CMS 不可达、API 500、fallback、本地 mock 或 0 条内容，不算完整通过。

本地代码交付前还要跑：

```bash
pnpm --filter @personal-ai-knowledge-site/cms typecheck
pnpm -C apps/web check
pnpm -C apps/web build
git diff --check
```

## 低内存服务器注意点

2GB 内存服务器上优先保证部署动作串行：

- 不要并行构建 CMS 和 Web。
- Node Dockerfile 统一使用 `node:22-alpine`，并通过 `PNPM_VERSION=11.7.0` 固定 pnpm。
- 先让 `postgres`、`cms` 健康，再运行 `web-build`。
- `web-build` 结束后再启动或重启 `web`。
- 内容发布后由 `rebuild-webhook` 合并并串行处理重复触发，不要同时手工跑多个 `web-build`。
- 构建期间用 `docker stats` 观察内存。
- 需要 2GB 到 4GB swap 兜底；swap 是防 OOM，不是性能优化。

当前优化预期：

- PostgreSQL 常驻约 100 到 150MB。
- CMS 常驻约 300 到 400MB，视内容和插件波动。
- Web 常驻约 100 到 200MB。
- `web-build` 构建期临时约 400 到 700MB。

如果仍然 OOM，可以再评估把构建阶段 `NODE_OPTIONS` 从 512 调到 384，但不要盲调。先保留日志和 `docker stats` 峰值证据。

## 常见故障处理

CMS 健康检查失败：

```bash
docker logs --tail=200 cks-prod-cms
docker compose -f infra/docker-compose.prod.yml ps postgres
```

如果日志或 API 报表不存在、relation does not exist、migration 未应用：

```bash
docker compose -f infra/docker-compose.prod.yml --profile init run --rm --build cms-init
docker compose -f infra/docker-compose.prod.yml up -d --build cms
```

确认常驻 CMS 没有误用 development：

```bash
docker exec cks-prod-cms printenv NODE_ENV
```

前台启动失败或找不到 `dist/server/entry.mjs`：

```bash
docker logs --tail=200 cks-prod-web
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
```

前台构建没有加载 CMS 内容：

```bash
docker compose -f infra/docker-compose.prod.yml ps cms
curl -fsS http://127.0.0.1:3000/api/access
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
```

webhook 收到通知但没有重建：

```bash
curl -fsS http://127.0.0.1:4000/healthz
docker exec cks-prod-cms printenv REBUILD_WEBHOOK_URL
ps aux | grep 'infra/rebuild-webhook.mjs'
```

确认 `REBUILD_WEBHOOK_TOKEN` 在 CMS 和 `rebuild-webhook` 中一致，但不要打印 token 明文。

磁盘不足：

```bash
df -h
docker system df
docker builder prune -f
```

只在确认可以删除当前项目数据时，才考虑：

```bash
docker compose -f infra/docker-compose.prod.yml down -v
```

端口不用时释放：

```bash
docker compose -f infra/docker-compose.prod.yml down --remove-orphans
```

这个命令不会删除 volume。

## 交接给部署 AI 的话术

可以把下面内容交给有服务器环境变量的部署工具：

```txt
请在仓库根目录按生产 compose 分步部署，不要一次性 up --build 全部服务。服务器内存只有 2GB、swap 约 4GB，所以必须串行执行：postgres -> cms-init -> cms -> web-build build -> web-build run -> web build -> web up。rebuild-webhook 是宿主机 Node 进程，用 `pnpm infra:prod:webhook` 或 systemd 单独启动。

不要打印或提交 infra/env/production.env。先确认 production.env 存在、REBUILD_WEBHOOK_TOKEN 已配置、docker compose config 通过、磁盘和端口正常。不要删除生产 volume，除非我明确要求重置数据。

部署命令：
docker compose -f infra/docker-compose.prod.yml up -d --build postgres
docker compose -f infra/docker-compose.prod.yml --profile init run --rm --build cms-init
docker compose -f infra/docker-compose.prod.yml up -d --build cms
docker compose -f infra/docker-compose.prod.yml --profile build build web-build
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml build web
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate --no-deps web
pnpm infra:prod:webhook

验收：docker compose ps 里 postgres/cms/web healthy；curl 检查 127.0.0.1:4000/healthz、/healthz、/zh-CN/、/en/、/rss.xml、/podcast/rss.xml、/zh-CN/search、/zh-CN/admin；CMS API 检查 /api/posts?limit=1 和 /api/projects?limit=1；web-build 日志必须显示从 CMS 加载到已发布内容，不能只是 fallback。最后汇报容器状态、关键路由状态码、CMS 内容数量、webhook 健康状态、内存占用和是否有错误日志。
```

## 完成汇报格式

部署或验证结束时，简要说明：

- 执行了哪些步骤。
- `postgres`、`cms`、`web` 是否 healthy。
- 关键路由和 CMS API 是否通过。
- `web-build` 是否从 CMS 拉到内容。
- `rebuild-webhook` 是否健康，且 token 未泄漏。
- 内存和磁盘是否接近上限。
- 容器最后是保持运行还是已经 down 掉。
- 没通过的地方给出具体日志片段和下一步处理建议。
