# 项目状态快照

更新时间：2026-06-28

## 当前阶段

项目已经从“Astro 静态个人内容站”推进到“前台内容体验完成 + CMS 后台单集合试点”阶段。

当前主线不是继续堆页面，而是把个人内容站升级成可长期运营的个人内容资产系统：

- 前台负责展示、阅读、搜索、RSS、SEO 和静态发布。
- CMS 负责后续写入、草稿、媒体、审核和内容生命周期。
- 内容契约层负责让 Astro 与 CMS 共享字段、枚举和 Block 类型，降低 schema 漂移风险。

## 已完成

### 前台平台

- `apps/web` Astro 主站已建立，覆盖 `/zh-CN` 与 `/en` 路由。
- 8 个内容集合已建立：podcast、posts、knowledge、topics、projects、resources、glossary、timeline。
- 已有中文 seed 内容，页面能覆盖首页、列表页、详情页、标签页、搜索页、RSS、播客 RSS、Sitemap、404。
- 亮色、黑夜、跟随系统主题已落地。
- Docker + Nginx 静态部署配置已落地。

### 内容体验

- 播客详情页支持时间轴和资源链接。
- 知识库支持按区域分组的文档树、移动端折叠菜单、上下篇导航。
- 详情页底部支持相关内容推荐。
- Article、PodcastEpisode、Breadcrumb JSON-LD 已接入。
- 默认 OG 图和 twitter:image 已接入。
- 文档组件系统已建立：Callout、Figure、Steps、StatGrid、CompareTable、Quote、AudioPlayer、Embed、CodeBlock。

### 后台与内容契约

- `packages/content-contract` 已建立，提供共享枚举、collection 字段类型和 Block 契约。
- `apps/cms` 已建立 Payload CMS 3.x 后台基座。
- CMS 当前包含 users、posts、media 三个 collection。
- `infra/docker-compose.yml` 已建立 PostgreSQL + MinIO + CMS 开发栈。
- posts collection 已支持草稿版本、S3 媒体配置和结构化 Block 字段。

## 进行中

### Astro ↔ CMS 单集合试点

- `apps/web/src/lib/cms-loader.ts` 已实现 Astro 7 Loader。
- posts 集合已支持 `CMS_API_URL` 条件切换：
  - 未设置 `CMS_API_URL`：使用本地 MDX。
  - 设置 `CMS_API_URL`：从 Payload REST API 拉取 published posts。
- CMS 不可达时 5 秒超时并优雅降级，不阻塞构建。
- CMS richText 和 Block 当前先转换成 Markdown，再走 Content Collections schema 校验。

### /admin 状态页

- `/admin` 已从纯预留壳调整为 noindex 状态页。
- 当前展示 CMS 后台跳转、posts 数量和数据源模式。
- 后续再补真实构建状态、搜索索引状态、最近发布内容和发布检查入口。

## 未完成 / 待验证

- 本地 Docker 后端栈仍需完整验证：`docker compose -f infra/docker-compose.yml up --build`。
- CMS 登录、posts CRUD、图片上传、Payload API 读取仍需真实环境联调。
- 使用真实 CMS 数据构建 Astro 页面仍需端到端验收。
- Pagefind 目前是基础搜索；集合筛选、标签筛选和内容地图页仍未完成。
- 其余 7 个集合仍走本地 glob loader，尚未迁入 CMS。
- CMS Block 到前台正式 BlockRenderer 尚未实现，目前是 Markdown 转换过渡方案。
- 草稿预览、发布 Webhook、重建流程、评论、Meilisearch、AI RAG 仍是后续目标。

## 当前优先级

### P0

- 让 `infra/docker-compose.yml` 在本机完整跑通。
- 打通 Payload CMS 登录、posts 新建、图片上传。
- 用真实 CMS posts 数据验证 Astro 构建、列表页、详情页、RSS、Sitemap、Pagefind。

### P1

- 完善 `/admin` 状态看板：最近发布、构建状态、搜索索引状态。
- 补充 CMS 试点使用说明和环境变量说明。
- 做 posts 的草稿预览策略设计。

### P2

- 设计 SPRINT-005：其余集合迁移、BlockRenderer、CMS 与本地 MDX 混合共存策略。
- 设计内容导出 JSON，为后续搜索升级和 AI RAG 做准备。

## 代码状态

- 最新已提交节点：`9db2eca`，引入内容契约层、CMS 后台基座、内容体验增强和 MDX 文档组件系统。
- 当前工作区包含 SPRINT-004 相关未提交变更：cmsLoader 超时降级、admin 状态页、CMS loader 文档和 Agile 任务。
