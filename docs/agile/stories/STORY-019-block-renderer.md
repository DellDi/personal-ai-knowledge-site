# STORY-019：BlockRenderer 渲染层

## 背景

CMS 动态内容以结构化 Block 存储，需要前台渲染层按 type 映射到组件，而不是运行时编译 MDX。

## 范围

- 新增 `apps/web/src/components/docs/BlockRenderer.astro`
- 按 Block type 映射到 9 个文档组件（richText / callout / code / audio / image / quote / embed / steps / statGrid / compareTable）
- 加入 `components/docs/index.ts` 统一导出

## 验收标准

- [x] BlockRenderer 接收 `Block[]` 并按 type 渲染对应组件
- [x] 未知 type 静默跳过
- [x] 类型与 `packages/content-contract` 的 Block union 对齐
