# 内容 Loader

## 数据源模式

8 个公开内容集合都使用 `collectionLoader(slug, passthroughFields)`：

| 条件 | 行为 | 结果 |
|---|---|---|
| 未设置 `CMS_API_URL` | 只使用本地 glob loader | 读取 `apps/web/src/content/<collection>` |
| 已设置 `CMS_API_URL` | 先加载本地 glob，再叠加 CMS loader | 本地 MDX 与 CMS published 内容混合共存 |
| CMS 不可达 | 保留本地 glob 内容，记录 warning | 构建不中断，公开站点不变空 |

这保证 CMS 是增强数据源，不是前台构建的单点依赖。

## cmsLoader 实现

位于 `apps/web/src/lib/cms-loader.ts`，实现 Astro 7 的 `Loader` 接口：

1. 从 `{CMS_API_URL}/{collection}` 分页拉取 `status: published` 内容。
2. 把 Payload richText content 转成 Markdown。
3. 把 Payload block 的 `blockType` 规范化成前台契约里的 `type`。
4. 把上传关系字段（如 `cover` / `hero`）规范化为 URL 字符串。
5. 用 `context.parseData` 走 zod schema 校验。
6. 用 `context.renderMarkdown` 渲染正文。
7. 写入 `context.store`。

## Block 规范化

Payload 返回的 block 形态类似：

```json
{ "blockType": "calloutBlock", "variant": "tip", "content": "..." }
```

前台 `BlockRenderer` 期望：

```json
{ "type": "callout", "variant": "tip", "content": "..." }
```

所以 loader 负责转换：

| Payload blockType | 前台 type |
|---|---|
| calloutBlock | callout |
| codeBlock | code |
| audioBlock | audio |
| imageBlock | image |
| quoteBlock | quote |
| embedBlock | embed |
| stepsBlock | steps |
| statGridBlock | statGrid |
| compareTableBlock | compareTable |

## 详情页渲染

posts 和 knowledge 详情页使用组合渲染：

```astro
<Content />
{blocks && blocks.length > 0 && <BlockRenderer blocks={blocks} />}
```

- `Content` 渲染本地 MDX 或 CMS richText。
- `BlockRenderer` 渲染 CMS 结构化 blocks。

其余集合当前先渲染 richText / Markdown 正文；后续可按需要扩展 BlockRenderer。

## 环境变量

- `CMS_API_URL`：Payload REST API 基址，如 `http://localhost:3000/api`
- `CMS_API_TOKEN`：可选 JWT token，用于构建期认证读取和 SSR 草稿预览
- `CMS_ADMIN_URL`：admin 跳转地址，默认 `http://localhost:3000/admin`
- `REBUILD_WEBHOOK_URL`：CMS 发布 hook 的外部重建通知地址，由 Payload 环境读取

## 设计约束

- schema 校验不绕过：CMS 内容同样走 zod schema。
- `status: published` 在 CMS 查询和公开页面两侧都过滤。
- 本地内容和 CMS 内容不要使用同一语言、同一集合、同一 slug，否则会产生重复路由。
- `translationKey` 关联逻辑在 `lib/content.ts` 统一处理，对数据源透明。
