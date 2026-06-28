# STORY-018：admin 页改为 CMS 跳转 + 状态看板

## 背景

`apps/web/src/pages/[locale]/admin.astro` 是站内发布运营看板。CMS 和发布工作流接入后，需要保持 noindex，并按语言前缀访问。

## 范围

- 展示 CMS 后台跳转链接（`CMS_ADMIN_URL` 环境变量，默认 `http://localhost:3000/admin`）
- 展示当前数据源模式（本地 MDX / CMS API）
- 展示 CMS 数据源、Webhook、预览端点、搜索索引和构建状态
- 展示 8 个集合的已发布内容计数
- 展示最近发布内容
- 保持 noindex

## 验收标准

- [x] admin 页展示 CMS 跳转按钮
- [x] admin 页展示数据源模式 Badge
- [x] admin 页展示 Webhook、预览端点、搜索索引和构建状态
- [x] admin 页展示 8 个集合已发布计数
- [x] admin 页展示最近发布内容
- [x] 320px / 1440px 无溢出
- [x] 保持 noindex
- [x] `/zh-CN/admin` 和 `/en/admin` 可访问
