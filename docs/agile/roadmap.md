# 路线图

## 第一轮：平台骨架

- 在 `apps/web` 建立 Astro 主站
- 建立 pnpm workspace
- 建立播客、文章、知识库、专题、项目、资源、术语、时间线内容集合
- 固定 `/zh-CN` 和 `/en` 路由；当前内容中文优先，英文作为预留
- 建立亮色、黑夜、跟随系统主题
- 完成首页、列表页、详情页、标签页、搜索页、RSS、播客 RSS、Sitemap、404 和后台预留页
- 使用 Docker Compose + Nginx 提供静态部署方案
- 建立 `AGENTS.md`、项目 Skill、Markdown 项目管理和架构文档

## 第二轮：内容体验增强

- 8 个内容集合各补中文 seed 内容，覆盖文章、播客、知识库、专题、项目、资源、术语、时间线
- 播客详情增强：结构化时间轴、本期资源链接、文字稿
- 知识库增强：按区域分组的文档树侧边栏、移动端可折叠目录抽屉、同区域上下篇导航
- 相关内容推荐：按语言、标签重叠度、同集合加权计算，所有详情页底部展示
- Article、PodcastEpisode、Breadcrumb JSON-LD 注入，通过 `BaseLayout` 统一输出
- OG 图片策略：默认 OG 图 `public/og-default.svg`，通过 `BaseLayout` 注入 og:image 与 twitter:image
- Pagefind 搜索增加语言、集合和标签筛选
- 相关内容推荐按语言、标签、专题和集合匹配
- 增加内容地图和标签索引页
- 设计 OG 图片策略
- 完善发布检查清单
- 决定后台管理方案：独立 `apps/admin`、外部 CMS 或 Git-based CMS
- 设计 AI 检索导出契约：从 Content Collections 输出结构化 JSON

## 第三轮：CMS 后台接入

- 新增 `apps/cms`（Payload CMS standalone）和 `packages/content-contract` 内容契约层
- 引入 PostgreSQL 和对象存储（开发期 MinIO，生产阿里云 OSS）
- 写 Astro 自定义 cmsLoader，从 CMS 拉内容并复用 Content Collections schema 校验
- 站内 `/admin` 改为 CMS 跳转入口 + 索引/构建状态看板
- 单集合试点（posts）走通 CMS 写入 → Astro 构建生成页面

## 第四轮：Block 渲染层与全集合迁移

- content-contract 固定 Block 类型清单
- apps/web 写 BlockRenderer + 各 Block 组件
- 其余 7 集合迁入 Payload，schema 对齐
- 本地 MDX 与 CMS 内容混合共存

## 第五轮：发布工作流

- 草稿 / 预览 / 发布 / 下架状态机
- Webhook 触发 Astro 重建
- 预览走 Astro SSR 按需渲染
- RSS / Sitemap / 搜索索引随构建更新

## 第六轮：互动系统

- 评论 collection（pending / approved / rejected / spam）
- 前台评论提交 API + 后台审核队列
- 站内评论组件展示 approved 评论

## 第七轮：搜索升级 + AI 知识索引

- Pagefind → Meilisearch（动态内容检索）
- apps/worker 同步搜索索引
- PostgreSQL + pgvector 切 chunk + embedding
- AI 问答 endpoint，引用内容来源

