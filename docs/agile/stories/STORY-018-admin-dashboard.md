# STORY-018：admin 页改为 CMS 跳转 + 状态看板

## 背景

`apps/web/src/pages/admin.astro` 原是"首版不接 CMS"的静态壳。CMS 接入后需要改为跳转入口和数据源状态看板。

## 范围

- 展示 CMS 后台跳转链接（`CMS_ADMIN_URL` 环境变量，默认 `http://localhost:3000/admin`）
- 展示当前数据源模式（本地 MDX / CMS API）
- 展示已发布 posts 数量
- 保持 noindex

## 验收标准

- [x] admin 页展示 CMS 跳转按钮
- [x] admin 页展示数据源模式 Badge
- [x] admin 页展示已发布 posts 计数
- [x] 320px / 1440px 无溢出
- [x] 保持 noindex
