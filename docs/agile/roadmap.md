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

- 播客详情增强：时间轴、文字稿、资源链接、相关内容
- 知识库增强：文档树、移动端目录抽屉、上一篇/下一篇、区域排序
- 专题聚合：跨文章、播客、项目和知识库串联内容
- Pagefind 搜索增加语言、集合和标签筛选
- 相关内容推荐按语言、标签、专题和集合匹配
- 增加内容地图和标签索引页
- 完善 Article、PodcastEpisode、Breadcrumb JSON-LD
- 设计 OG 图片策略
- 完善发布检查清单
- 决定后台管理方案：独立 `apps/admin`、外部 CMS 或 Git-based CMS
- 设计 AI 检索导出契约：从 Content Collections 输出结构化 JSON
