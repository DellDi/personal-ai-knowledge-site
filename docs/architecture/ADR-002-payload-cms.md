# ADR-002：使用 Payload CMS 作为后台

## 状态

已接受。

## 决策

使用 Payload CMS 3.x 作为内容管理后台，部署形态为独立 Next.js 服务（standalone）。

## 实现方式

- `apps/cms` 是独立的 Next.js + Payload 项目，子域 `cms.example.com`
- 通过 `@payloadcms/next` 提供 admin UI 和 REST/GraphQL API
- 与 `apps/web`（Astro）完全解耦，通过 REST API 通信
- 内容 schema 引用 `packages/content-contract` 契约层，保证两端类型一致

## 选型理由

- Code-first / TypeScript 风格，适合研发背景长期维护
- Block 工程化控制力强，支持结构化内容
- PostgreSQL 原生支持，后续 pgvector 可复用
- S3 兼容 storage adapter，开发期 MinIO / 生产阿里云 OSS 使用同一配置模型；切换后新上传写入新存储，旧对象需要迁移

## 已知限制

Payload 3.x 的 admin UI 深度绑定 Next.js 运行时。所谓 standalone 是"独立的 Next.js 项目"，不是"不需要 Next.js"。这是 Payload 3.x 的技术现实，不影响前后台分离架构的成立。

## 备选方案

- Directus：数据库优先，少写后端代码，但 Block 工程化控制力弱
- Strapi：成熟通用 CMS，但 TypeScript 体验不如 Payload
- Sanity：云服务型，编辑体验强，但资产不自控
