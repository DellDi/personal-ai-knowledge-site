# STORY-014：内容契约层

## 背景

Astro 的 Content Collections schema 和 CMS 的 collection 定义是两套源，极易漂移。需要一层单一事实源统一两端。

## 范围

- 新增 `packages/content-contract`，导出共享枚举（lang / status / area / level / kind / resourceType）
- 导出 Block 类型清单和 union type（richText / callout / code / audio / image / quote / embed / steps / statGrid / compareTable）
- 导出 collection 字段类型（PostFields / KnowledgeFields / PodcastFields 等）
- `apps/web/src/content.config.ts` 改用契约层枚举，消除硬编码
- `apps/cms` 的 collection 定义引用契约层

## 验收标准

- [x] 契约层类型被 web 和 cms 同时引用无报错
- [x] web 的 zod schema 枚举来自契约层
- [x] cms 的 collection 枚举来自契约层
- [x] Block 类型清单对齐 web 的文档组件
