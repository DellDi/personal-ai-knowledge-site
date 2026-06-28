# 路线图

更新时间：2026-06-28

## 状态总览

| 轮次 | 名称 | 状态 | 说明 |
|---|---|---|---|
| 第一轮 | 平台骨架 | 已完成 | Astro 前台、内容集合、多语言、主题、RSS、Sitemap、Docker 静态部署、Agent/Agile 文档已落地 |
| 第二轮 | 内容体验增强 | 已基本完成 | seed 内容、详情增强、知识库树、相关内容、JSON-LD、默认 OG 图已落地；高级搜索筛选仍待做 |
| 第三轮 | CMS 后台基座 | 已完成基础实现 | Payload CMS、PostgreSQL、MinIO、内容契约层已落地；本地 Docker 联调仍需持续验证 |
| 第四轮 | Astro ↔ CMS 试点 | 已完成基础实现 | cmsLoader、5s 超时降级、admin 状态看板已实现 |
| 第五轮 | Block 渲染层与全集合迁移 | 已完成基础实现 | BlockRenderer、全集合条件 loader、本地 + CMS 混合加载已落地，待真实 CMS 数据验收 |
| 第六轮以后 | 发布流、评论、搜索升级、AI 索引 | 未开始 | 作为平台化增强目标保留 |

## 第一轮：平台骨架（已完成）

- 在 `apps/web` 建立 Astro 主站
- 建立 pnpm workspace
- 建立播客、文章、知识库、专题、项目、资源、术语、时间线内容集合
- 固定 `/zh-CN` 和 `/en` 路由；当前内容中文优先，英文作为预留
- 建立亮色、黑夜、跟随系统主题
- 完成首页、列表页、详情页、标签页、搜索页、RSS、播客 RSS、Sitemap、404 和后台预留页
- 使用 Docker Compose + Nginx 提供静态部署方案
- 建立 `AGENTS.md`、项目 Skill、Markdown 项目管理和架构文档

## 第二轮：内容体验增强（已基本完成）

- 8 个内容集合各补中文 seed 内容，覆盖文章、播客、知识库、专题、项目、资源、术语、时间线
- 播客详情增强：结构化时间轴、本期资源链接、文字稿
- 知识库增强：按区域分组的文档树侧边栏、移动端可折叠目录抽屉、同区域上下篇导航
- 相关内容推荐：按语言、标签重叠度、同集合加权计算，所有详情页底部展示
- Article、PodcastEpisode、Breadcrumb JSON-LD 注入，通过 `BaseLayout` 统一输出
- OG 图片策略：默认 OG 图 `public/og-default.svg`，通过 `BaseLayout` 注入 og:image 与 twitter:image
- 发布检查清单已覆盖 SEO、主题、响应式、详情增强和 CMS 试点项

待补：

- Pagefind 搜索增加集合筛选和标签筛选
- 增加内容地图页
- 增加标签索引页
- AI 检索导出契约仍未实现，只保留方向

## 第三轮：CMS 后台基座（基础实现已完成）

- 新增 `apps/cms`（Payload CMS standalone）和 `packages/content-contract` 内容契约层
- 引入 PostgreSQL 和对象存储（开发期 MinIO，生产阿里云 OSS）
- `apps/cms` 已建 users / posts / media collection
- posts collection 已支持 drafts、S3 媒体上传配置和结构化 Block 字段
- `infra/docker-compose.local.yml` 已提供 postgres + minio + minio-init + cms

待验收：

- `docker compose -f infra/docker-compose.local.yml up --build` 在本地完整跑通
- CMS 登录、posts CRUD、图片上传端到端可用

## 第四轮：Astro ↔ CMS 单集合试点（已完成基础实现）

- `apps/web/src/lib/cms-loader.ts` 已实现 Astro 7 Loader 接口
- `posts` 集合已支持 `CMS_API_URL` 条件切换：CMS API / 本地 MDX
- CMS 不可达时 5s 超时并优雅降级，不阻塞构建
- richText content 和结构化 Block 先转换成 Markdown，并继续走 zod schema 校验
- `/admin` 已改为 CMS 跳转入口 + 数据源状态看板

待验收：

- 使用真实 Payload CMS 数据验证 posts 列表、详情、RSS、Sitemap、Pagefind
- 明确 CMS 草稿预览策略
- 补充真实构建状态、搜索索引状态和最近发布内容

## 第五轮：Block 渲染层与全集合迁移（已完成基础实现）

- content-contract 固定 Block 类型清单
- apps/web 已新增 BlockRenderer，并映射到文档组件
- 8 集合已使用条件 loader：本地 glob + CMS loader 混合加载
- Payload CMS 已新增 podcast / knowledge / topics / projects / resources / glossary / timeline collection
- posts / knowledge 详情页已支持 Content + BlockRenderer 组合渲染
- Payload blockType 已在 cmsLoader 层规范化为前台 Block type

待验收：

- 使用真实 CMS 数据验证 8 集合列表页、详情页、RSS、Sitemap、Pagefind
- 使用 OSS 媒体 URL 验证图片、音频、嵌入内容渲染
- 决定是否把 BlockRenderer 扩展到 topics / projects / resources 等详情页

## 第六轮：发布工作流

- 草稿 / 预览 / 发布 / 下架状态机
- Webhook 触发 Astro 重建
- 预览走 Astro SSR 按需渲染
- RSS / Sitemap / 搜索索引随构建更新

## 第七轮：互动系统

- 评论 collection（pending / approved / rejected / spam）
- 前台评论提交 API + 后台审核队列
- 站内评论组件展示 approved 评论

## 第八轮：搜索升级 + AI 知识索引

- Pagefind → Meilisearch（动态内容检索）
- apps/worker 同步搜索索引
- PostgreSQL + pgvector 切 chunk + embedding
- AI 问答 endpoint，引用内容来源
