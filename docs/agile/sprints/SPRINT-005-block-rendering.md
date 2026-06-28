# SPRINT-005：Block 渲染层与全集合迁移

## 目标

建立 BlockRenderer 渲染层，把全集合迁移到条件 loader，支持 CMS 与本地 MDX 混合共存。

## 任务

- 新增 `BlockRenderer.astro`：按 Block type 映射到 9 个文档组件
- cmsLoader 新增 `passthroughFields` 选项，透传 contentBlocks 等结构化字段
- `content.config.ts` 全集合改用 `collectionLoader`：未设置 `CMS_API_URL` 时只用 glob，设置后先加载 glob 再叠加 cmsLoader
- posts / knowledge schema 新增可选 `contentBlocks` 字段，对齐契约层 Block union
- posts / knowledge 详情页支持组合渲染：Content + BlockRenderer
- Payload CMS 新增 7 集合（podcast / knowledge / topics / projects / resources / glossary / timeline），字段对齐契约层
- 抽取 `shared-blocks.ts` 共享 Block 定义，posts 和 content-collections 复用
- cmsLoader 将 Payload `blockType` 规范化为前台 `type`，并把上传关系字段规范化为 URL

## 退出标准

- [x] `pnpm -C apps/web check` 通过
- [x] `pnpm -C apps/web build` 通过，78 页（无 CMS_API_URL 时回退 glob）
- [x] 有 CMS_API_URL 但不可达时，8 集合全部保留本地内容并优雅降级
- [x] `pnpm --filter @personal-ai-knowledge-site/cms typecheck` 通过
- [x] 10 个详情页 320px 无溢出
- [x] admin 看板正确显示 CMS API 模式

## 后续

SPRINT-006 已接续实现发布工作流基础闭环：webhook 触发重建通知、草稿预览和发布状态机。
