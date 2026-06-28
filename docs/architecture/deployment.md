# 部署

## 部署原则

- 前台保持静态优先：Astro 构建出 `dist`，由 Nginx 服务。
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
  -> Nginx container
  -> Astro dist

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
docker compose -f infra/docker-compose.prod.yml up -d --build postgres cms
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d web
```

说明：

- `postgres` 与 `cms` 是常驻服务。
- `web-build` 是一次性构建任务，不常驻。
- `web` 是 Nginx 静态服务，读取 `web_dist` volume。
- `cms` 和 `web` 只绑定 `127.0.0.1`，公网入口交给 1Panel / Nginx。

## 环境变量

生产环境变量放在 `infra/env/production.env`，不要提交。

关键变量：

```env
DATABASE_URI=postgres://content:YOUR_PASSWORD@postgres:5432/content_platform
PAYLOAD_SECRET=YOUR_RANDOM_SECRET
PAYLOAD_ENABLE_AUTOLOGIN=false
PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.com
PAYLOAD_CORS_ORIGINS=https://www.example.com,https://cms.example.com
PAYLOAD_CSRF_ORIGINS=https://www.example.com,https://cms.example.com

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

## 健康检查

- 前台 Nginx：`/healthz`
- CMS：`/api/access`
- PostgreSQL：`pg_isready`

## 2C2G 服务器边界

当前生产栈适合 2C2G 轻量服务器：

- Nginx 静态前台
- Payload CMS
- PostgreSQL
- OSS 外部媒体存储

不建议同时常驻：

- MinIO
- Meilisearch
- 向量库
- AI 推理服务
- 大文件本地存储
