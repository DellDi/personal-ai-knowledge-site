# STORY-017：cmsLoader 实现

## 背景

Astro 前台需要从 Payload CMS 拉取动态内容，但不能绕过 Content Collections 的 schema 校验和 `status: published` 过滤规则。

## 范围

- 实现 `apps/web/src/lib/cms-loader.ts`，符合 Astro 7 的 `Loader` 接口
- 从 Payload REST API 分页拉取 `status: published` 内容
- richText content 转 Markdown，结构化 Block（calloutBlock / codeBlock / quoteBlock / stepsBlock / statGridBlock / compareTableBlock）转 Markdown
- 经 `context.parseData` 走 zod schema 校验
- 经 `context.renderMarkdown` 渲染 HTML
- 5 秒超时 + 优雅降级

## 验收标准

- [x] cmsLoader 实现 Loader 接口（name + load）
- [x] CMS 不可达时记录警告并返回空数据，不阻塞构建
- [x] CMS 内容走同一套 zod schema 校验
- [x] `CMS_API_URL` 环境变量切换数据源
