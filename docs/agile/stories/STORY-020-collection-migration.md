# STORY-020：全集合条件 loader 与混合模式

## 背景

posts 集合已支持 CMS / glob 切换。需要把条件 loader 扩展到全部 8 集合，并支持本地 MDX 与 CMS 内容混合共存。

## 范围

- 抽取 `collectionLoader(slug, passthroughFields)` 通用函数
- 8 集合全部改用 `collectionLoader`，设置 `CMS_API_URL` 时本地内容与 CMS published 内容混合加载
- cmsLoader 新增 `passthroughFields` 选项，透传集合特有字段
- posts / knowledge schema 新增可选 `contentBlocks` 字段
- posts / knowledge 详情页支持组合渲染（Content + BlockRenderer）
- Payload CMS 新增 7 集合定义，字段对齐契约层
- 抽取 `shared-blocks.ts` 共享 Block 定义

## 验收标准

- [x] 无 CMS_API_URL 时 8 集合回退 glob，78 页正常
- [x] 有 CMS_API_URL 不可达时 8 集合全部保留本地内容并优雅降级
- [x] posts / knowledge 详情页支持 contentBlocks 走 BlockRenderer
- [x] 本地 MDX 内容不受影响
- [x] cms typecheck 通过
