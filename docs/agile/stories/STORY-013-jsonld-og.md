# STORY-013：JSON-LD 与 OG 图片

## 背景

详情页缺少结构化数据，搜索引擎无法理解内容类型。社交分享缺少 OG 图。

## 范围

- 新增 `apps/web/src/lib/seo.ts`：buildArticleJsonLd、buildPodcastEpisodeJsonLd、buildBreadcrumbJsonLd
- BaseLayout 新增 `jsonLd` 和 `ogImage` prop
- EntryLayout 按集合类型构造 JSON-LD 并注入
- 新增 `apps/web/public/og-default.svg` 默认 OG 图（1200×630）
- BaseLayout 注入 og:image 和 twitter:image

## 验收标准

- [ ] 文章/知识库/专题/项目/资源/术语/时间线详情页注入 Article + BreadcrumbList JSON-LD
- [ ] 播客详情页注入 PodcastEpisode + BreadcrumbList JSON-LD
- [ ] 所有页面注入 og:image 和 twitter:image
- [ ] JSON-LD 通过 set:html 正确序列化
