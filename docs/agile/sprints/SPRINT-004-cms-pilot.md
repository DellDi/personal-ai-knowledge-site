# SPRINT-004：Astro ↔ CMS 单集合试点

## 目标

打通 Astro 前台与 Payload CMS 后台的单集合数据流，验证 cmsLoader、schema 复用、优雅降级和 admin 看板。

## 任务

- 实现 `apps/web/src/lib/cms-loader.ts`：Astro 7 Loader 接口实现，从 Payload REST API 分页拉取 `status: published` 内容
- richText content + 结构化 Block 转 Markdown，经 `context.renderMarkdown` 渲染
- `content.config.ts` 的 posts 集合改用条件 loader：`CMS_API_URL` 存在时用 cmsLoader，否则用 glob loader
- 5 秒超时 + 优雅降级：CMS 不可达时返回空数据，不阻塞构建
- `apps/web/src/pages/[locale]/admin.astro` 改为 CMS 跳转 + 数据源状态看板

## 退出标准

- [x] `pnpm -C apps/web check` 通过
- [x] 无 `CMS_API_URL` 时构建回退到 glob loader，78 页正常
- [x] 有 `CMS_API_URL` 但不可达时 5s 超时后优雅降级
- [x] admin 页 320px / 1440px 无溢出，展示 CMS 跳转和数据源模式
- [x] RSS / Sitemap / Pagefind 对 posts 集合正常工作

## 后续

SPRINT-005 将迁移其余 7 集合到 CMS，并实现 BlockRenderer 替代 Markdown 转换。
