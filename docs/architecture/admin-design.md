# 后台管理设计

## 当前状态

后台管理已接入 Payload CMS（`apps/cms`），子域 `cms.example.com` 独立部署。

## 站内 /admin 的定位

`apps/web/src/pages/admin.astro` 当前是 noindex 静态壳页面。SPRINT-004 会改为：
- 跳转入口：引导到 `cms.example.com`
- 索引状态看板：显示最近发布、构建状态、搜索索引状态

## CMS 后台能力

Payload CMS 提供的能力（`apps/cms`）：

- 内容编辑（posts / knowledge / podcast 等 collection）
- 草稿 / 发布版本管理（`versions.drafts`）
- 媒体库（S3 上传，MinIO / 阿里云 OSS）
- 权限控制（users auth）
- REST / GraphQL API
- 内容 Block 编辑（calloutBlock / codeBlock / quoteBlock 等）

## 信息架构

- 运营首页（Dashboard）
- 内容日历（后续）
- 集合编辑器（posts / knowledge / podcast / topics / projects / resources / glossary / timeline）
- 媒体库
- 搜索索引状态（后续）
- 发布检查清单（后续）
- 系统设置
