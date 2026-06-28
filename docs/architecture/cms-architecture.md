# CMS 架构

## 总览

```
apps/cms（Payload 3.x + Next.js standalone）
  ├── admin UI（/admin）
  ├── REST API（/api/<collection>）
  ├── GraphQL API（/api/graphql）
  ├── collections: users / posts / podcast / knowledge / topics / projects / resources / glossary / timeline / media
  └── storage: S3 兼容（MinIO / 阿里云 OSS）
```

## 技术栈

- Payload CMS 3.x（Code-first TypeScript CMS）
- Next.js 16（admin UI 运行时，由 `@payloadcms/next` 提供）
- PostgreSQL 16（`@payloadcms/db-postgres`）
- S3 storage（`@payloadcms/storage-s3`，MinIO / 阿里云 OSS）
- Lexical 富文本编辑器（`@payloadcms/richtext-lexical`，保留 Slate 历史数据迁移兼容）

## 目录结构

```
apps/cms/
  src/
    payload.config.ts          # Payload 配置（DB、storage、admin）
    collections/
      users.ts                 # 鉴权用户
      posts.ts                 # 文章（含 Block 字段）
      content-collections.ts   # podcast / knowledge / topics / projects / resources / glossary / timeline
      shared-blocks.ts         # 共享 Block 字段定义
      media.ts                 # 媒体库（S3 上传）
    hooks/
      webhook.ts               # 发布 / 下架 / 删除通知
    app/
      (payload)/
        admin/[[...segments]]/ # admin UI 页面
        api/[...slug]/         # REST API 路由
      layout.tsx               # admin 根布局
  next.config.mjs              # withPayload 包裹
  importMap.ts                 # admin 组件映射（withPayload 注入）
  Dockerfile                   # 生产镜像
```

## 内容契约

所有 collection 的字段枚举（lang / status / area / level 等）和 Block 类型定义在 `packages/content-contract`，Payload 和 Astro 各自引用，避免 schema 双写漂移。

## Block 字段

posts、podcast、knowledge、topics、projects 等内容 collection 可使用 `contentBlocks` 字段承载结构化 Block 数组，对齐契约层的 Block 类型清单：

- calloutBlock
- codeBlock
- quoteBlock
- stepsBlock
- statGridBlock
- compareTableBlock

Astro 端的 BlockRenderer 已按 type 映射到 `apps/web/src/components/docs/` 下的文档组件。当前 posts / knowledge 详情页启用 BlockRenderer，其余集合先渲染 richText / Markdown 正文。

## 发布 Hooks

8 个公开内容集合都通过 `withPublishHooks` 接入发布通知：

- `status: published`：发送 `publish`
- `status: draft` / `status: archived`：发送 `unpublish`
- 删除文档：发送 `delete`

Webhook 由 `REBUILD_WEBHOOK_URL` 控制，未配置时跳过，不影响 CMS 保存。

## 访问控制

- 内容集合 read：未登录用户只读 `status: published`，登录用户可读全部
- `media.read`：公开可读（CDN 分发）
- `users.read`：仅登录用户

## 版本管理

posts 启用 `versions.drafts`，支持草稿 / 发布版本切换。其余集合当前通过 `status` 字段管理 draft / published / archived，后续可按需要逐步开启 Payload drafts。
