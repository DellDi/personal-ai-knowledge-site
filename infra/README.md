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

2. 启动数据库和 CMS：

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build postgres cms
```

生产环境需要在首次启动或内容模型变更后执行数据库迁移/初始化；不要用本地 `db.push` 代替生产迁移。

3. 构建前台产物：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
```

`web-build` 会在 compose 网络内用 `CMS_API_URL=http://cms:3000/api` 构建 Astro 前台，并把 `dist/client`、`dist/client/pagefind` 和 `dist/server` 写入 `web_dist` volume。

4. 启动前台 Astro Node server：

```bash
docker compose -f infra/docker-compose.prod.yml up -d web
```

生产容器只绑定本机端口：

- 前台：`127.0.0.1:8080`
- CMS：`127.0.0.1:3000`

用 1Panel / Nginx 再反代：

- `www.example.com` → `127.0.0.1:8080`
- `cms.example.com` → `127.0.0.1:3000`
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

CMS 发布 hooks 使用 `REBUILD_WEBHOOK_URL` 通知外部部署入口。这个入口应由服务器脚本、CI/CD 或受保护的内部服务承接，然后执行：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d web
```

Astro 前台进程只负责服务公开页面、`/preview` 和 `/healthz`，不直接执行系统重建命令。
