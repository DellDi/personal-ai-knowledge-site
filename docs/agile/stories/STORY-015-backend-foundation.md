# STORY-015：后端基座

## 背景

CMS 接入需要 PostgreSQL、对象存储和 Payload CMS 服务。需要一套开发环境的完整后端服务栈。

## 范围

- 新增 `infra/docker-compose.local.yml`：postgres + minio + minio-init + cms
- 新增 `apps/cms`：Payload 3.x + Next.js standalone + PostgreSQL + S3 storage
- 建 `users` / `posts` / `media` 三个 collection
- posts 含 Block 字段（calloutBlock / codeBlock / quoteBlock / stepsBlock / statGridBlock / compareTableBlock）
- 对象存储开发期用 MinIO，生产切阿里云 OSS

## 验收标准

- [x] `infra/docker-compose.local.yml` 定义 postgres + minio + cms 服务
- [x] `pnpm --filter @personal-ai-knowledge-site/cms typecheck` 通过
- [ ] `docker compose -f infra/docker-compose.local.yml up --build` 起 PG + MinIO + CMS（需本地 Docker）
- [ ] CMS 可登录，posts CRUD + 图片上传可用（需本地 Docker）
