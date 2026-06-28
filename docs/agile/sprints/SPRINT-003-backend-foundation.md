# SPRINT-003：后端基座

## 目标

建立 CMS 后端基础设施：内容契约层、PostgreSQL、对象存储、Payload CMS 后台，为后续 Astro ↔ CMS 单集合试点提供基础。

## 任务

- 新增 `packages/content-contract`：导出共享枚举、Block 契约、collection 字段类型，作为单一事实源
- `apps/web/src/content.config.ts` 改用契约层枚举，消除硬编码
- 新增 `infra/docker-compose.local.yml`：postgres + minio + minio-init + cms
- 新增 `apps/cms`：Payload 3.x + Next.js standalone + PostgreSQL + S3 storage
- 建 `users` / `posts` / `media` 三个 collection，posts 含 Block 字段（对齐契约层）
- 对象存储开发期用 MinIO，生产切阿里云 OSS，同走 S3 兼容协议

## 退出标准

- [x] `packages/content-contract` 类型被 web 和 cms 同时引用无报错
- [x] `pnpm -C apps/web check` + `build` 通过
- [x] `pnpm --filter @personal-ai-knowledge-site/cms typecheck` 通过
- [ ] `docker compose -f infra/docker-compose.local.yml up --build` 起 PG + MinIO + CMS（需本地 Docker 环境）
- [ ] CMS 可登录，posts CRUD + 图片上传可用（需本地 Docker 环境）

## 注意

Payload 3.x 的 admin UI 基于 Next.js 运行时。所谓 standalone 是"独立的 Next.js 项目"，不是"不需要 Next.js"。`apps/cms` 使用 `@payloadcms/next` + Next.js app router 提供后台界面和 API，与 `apps/web`（Astro）完全解耦，通过 REST API 通信。

完整 build 验证需要本地 Docker 环境运行 PostgreSQL 和 MinIO：
```bash
docker compose -f infra/docker-compose.local.yml up --build
```
