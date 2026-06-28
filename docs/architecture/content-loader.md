# 内容 Loader

## 数据源选择

posts 集合支持两种数据源，通过环境变量 `CMS_API_URL` 切换：

| 模式 | 条件 | 数据源 | 适用场景 |
|---|---|---|---|
| 本地 MDX | `CMS_API_URL` 未设置 | `apps/web/src/content/posts/` 下的 `.md`/`.mdx` | 开发期、CMS 未接入 |
| CMS API | `CMS_API_URL` 已设置 | Payload REST API | CMS 已接入、生产 |

其余 7 个集合（podcast / knowledge / topics / projects / resources / glossary / timeline）仍使用 glob loader，后续 SPRINT-005 逐步迁移。

## cmsLoader 实现

位于 `apps/web/src/lib/cms-loader.ts`，实现 Astro 7 的 `Loader` 接口：

1. 从 `{CMS_API_URL}/posts` 分页拉取 `status: published` 内容
2. 把 Payload 的 richText content 转成 Markdown
3. 把结构化 Block（calloutBlock / codeBlock / quoteBlock 等）转成 Markdown
4. 用 `context.parseData` 走 zod schema 校验（复用 Content Collections 的 schema）
5. 用 `context.renderMarkdown` 渲染成 HTML
6. 写入 `context.store`

## 优雅降级

当 CMS 不可达时（5 秒超时），cmsLoader 记录警告并返回空数据，不阻塞构建。这让前台在没有后端的环境下也能正常构建。

## 信号

- `CMS_API_URL`：Payload REST API 基址，如 `http://localhost:3000/api`
- `CMS_API_TOKEN`：可选 JWT token，用于读取草稿
- `CMS_ADMIN_URL`：admin 跳转地址，默认 `http://localhost:3000/admin`

## 站内 /admin 看板

`apps/web/src/pages/admin.astro`（noindex）展示：
- CMS 后台跳转链接
- 当前数据源模式（本地 MDX / CMS API）
- 已发布 posts 数量

## 设计约束

- schema 校验不绕过：CMS 内容同样走 zod schema
- `status: published` 过滤在 CMS 查询和 loader 两端都生效
- `translationKey` 关联逻辑在 `lib/content.ts` 统一处理，对数据源透明
