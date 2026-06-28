# Block 渲染层

## 总览

CMS 动态内容以结构化 Block 存储，前台用 BlockRenderer 按 type 映射到文档组件渲染。本地 MDX 内容继续走 Astro 的 `Content` 渲染。

## BlockRenderer

位于 `apps/web/src/components/docs/BlockRenderer.astro`，接收 `Block[]`，按 `type` 映射：

| Block type | 文档组件 |
|---|---|
| richText | 内联 HTML（set:html） |
| callout | Callout.astro |
| code | CodeBlock.astro |
| audio | AudioPlayer.astro |
| image | Figure.astro |
| quote | Quote.astro |
| embed | Embed.astro |
| steps | Steps.astro |
| statGrid | StatGrid.astro |
| compareTable | CompareTable.astro |

## 组合渲染模式

posts 和 knowledge 详情页支持正文与结构化 Block 组合渲染：

```astro
<Content />
{blocks && blocks.length > 0 && <BlockRenderer blocks={blocks} />}
```

- 本地 MDX 或 CMS richText → Content（Astro 原生渲染）
- CMS 内容有 `contentBlocks` 字段 → 在正文后追加 BlockRenderer

## schema 对齐

`content.config.ts` 的 `blockSchema` 与 `packages/content-contract` 的 Block union type 对齐。cmsLoader 通过 `passthroughFields` 读取 CMS 的 `contentBlocks`，先把 Payload `blockType` 规范化为前台 `type`，再经 zod schema 校验后存储。

## 设计约束

- Block 类型清单在契约层统一定义，CMS 和 Astro 两端引用
- CMS 的 blocks 定义（`apps/cms/src/collections/shared-blocks.ts`）与 Astro 的 blockSchema 字段对齐
- 不运行时编译 MDX：CMS 内容用结构化 Block，不用 MDX 字符串
