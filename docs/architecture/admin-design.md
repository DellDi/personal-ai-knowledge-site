# 后台管理设计

## 当前状态

后台管理已接入 Payload CMS（`apps/cms`）作为写侧基座。开发环境通过 `infra/docker-compose.local.yml` 启动 PostgreSQL、MinIO 和 CMS；生产环境通过 `infra/docker-compose.prod.yml` 启动 PostgreSQL 和 CMS，媒体走阿里云 OSS。

## 站内发布运营看板的定位

`apps/web/src/pages/[locale]/admin.astro` 当前是 noindex 的发布运营看板，入口为 `/zh-CN/admin` 和 `/en/admin`，不承载真实登录和内容写入：

- 跳转入口：引导到 Payload CMS 后台，地址由 `CMS_ADMIN_URL` 控制，默认 `http://localhost:3000/admin`
- 数据源状态：展示当前数据源模式（本地 MDX / CMS API）
- 发布链路状态：展示 Webhook、草稿预览端点、搜索索引和 SSR 构建状态
- 集合概况：展示 8 个集合的中文 published 内容计数和最近发布内容
- 试点提示：说明 `CMS_API_URL` 存在时在本地内容基础上叠加 CMS published 内容，CMS 不可达时保留本地内容

## CMS 后台能力

Payload CMS 当前提供的能力（`apps/cms`）：

- 内容编辑（posts / knowledge / podcast / topics / projects / resources / glossary / timeline）
- 草稿 / 发布版本管理（`versions.drafts`）
- 媒体库（S3 上传，MinIO / 阿里云 OSS）
- 权限控制（users auth）
- REST / GraphQL API
- 内容 Block 编辑（calloutBlock / codeBlock / quoteBlock 等）
- 发布 hooks（published / draft / archived / delete -> webhook payload）

## 信息架构

- 运营首页（Dashboard）
- 内容日历（后续）
- 集合编辑器（posts / knowledge / podcast / topics / projects / resources / glossary / timeline）
- 媒体库
- 搜索索引状态（后续）
- 发布检查清单（后续）
- 系统设置

## 当前边界

- 当前 8 个集合都已接入条件 loader，生产可以叠加 CMS published 内容；本地 MDX 仍作为轻量底座保留。
- 当前前台是静态优先 + SSR 预览：公开页面主要来自构建产物，`/preview` 运行时读取 CMS 草稿。
- 当前 posts / knowledge 支持 BlockRenderer；其余集合先渲染 richText / Markdown 正文，后续按内容复杂度扩展。
- `/zh-CN/admin` 不是内容编辑后台；真实写入仍然进入 Payload CMS。
