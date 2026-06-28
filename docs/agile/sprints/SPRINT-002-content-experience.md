# SPRINT-002：内容体验增强

## 目标

补齐 Phase 1 内容样本，并完成第二轮内容体验增强，为后续 CMS 接入提供校验基准和混合 loader 测试数据。

## 任务

- 8 个集合各补 1-2 篇中文 seed 内容
- 播客详情增强：结构化时间轴、本期资源链接
- 知识库增强：按区域分组的文档树侧边栏、移动端可折叠目录抽屉、同区域上下篇导航
- 相关内容推荐：按语言、标签重叠度、同集合加权
- Article / PodcastEpisode / Breadcrumb JSON-LD 注入
- OG 图片策略：默认 OG 图 + BaseLayout 注入
- podcast schema 扩展 timeline / resources 字段

## 退出标准

- `pnpm -C apps/web check` 通过
- `pnpm -C apps/web build` 通过，Pagefind 索引生成
- `/zh-CN/`、`/en/`、`/rss.xml`、`/podcast/rss.xml`、`/search`、`/admin` 在 320px 和 1440px 无横向溢出
- 每集合至少 1 篇 published 内容进入 RSS 与 Pagefind
- 详情页 JSON-LD 正确注入（Article / PodcastEpisode / BreadcrumbList）
