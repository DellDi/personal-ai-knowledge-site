# 项目状态快照

更新时间：2026-06-28

## 当前阶段

项目已经从“Astro 静态个人内容站”推进到“前台内容体验完成 + CMS 后台全集合试点 + 发布工作流基础闭环”阶段。

当前主线不是继续堆页面，而是把个人内容站升级成可长期运营的个人内容资产系统：

- 前台负责展示、阅读、搜索、RSS、SEO、静态优先发布和 SSR 草稿预览。
- CMS 负责后续写入、草稿、媒体、审核和内容生命周期。
- 内容契约层负责让 Astro 与 CMS 共享字段、枚举和 Block 类型，降低 schema 漂移风险。

## 已完成

### 前台平台

- `apps/web` Astro 主站已建立，覆盖 `/zh-CN` 与 `/en` 路由。
- 8 个内容集合已建立：podcast、posts、knowledge、topics、projects、resources、glossary、timeline。
- 已有中文 seed 内容，页面能覆盖首页、列表页、详情页、标签页、搜索页、RSS、播客 RSS、Sitemap、404。
- 亮色、黑夜、跟随系统主题已落地。
- Docker 部署配置已落地；前台当前使用 Astro Node server 运行静态优先产物和 SSR 预览端点。

### 内容体验

- 播客详情页支持时间轴和资源链接。
- 知识库支持按区域分组的文档树、移动端折叠菜单、上下篇导航。
- 详情页底部支持相关内容推荐。
- Article、PodcastEpisode、Breadcrumb JSON-LD 已接入。
- 默认 OG 图和 twitter:image 已接入。
- 文档组件系统已建立：Callout、Figure、Steps、StatGrid、CompareTable、Quote、AudioPlayer、Embed、CodeBlock。
- posts / knowledge 已支持 CMS 结构化 Block 的 BlockRenderer 渲染。

### 后台与内容契约

- `packages/content-contract` 已建立，提供共享枚举、collection 字段类型和 Block 契约。
- `apps/cms` 已建立 Payload CMS 3.x 后台基座。
- CMS 当前包含 users、posts、podcast、knowledge、topics、projects、resources、glossary、timeline、media collection。
- `infra/docker-compose.local.yml` 已建立 PostgreSQL + MinIO + CMS 本地开发栈。
- `infra/docker-compose.prod.yml` 已建立 PostgreSQL + CMS + Nginx 前台生产运行栈，生产媒体走阿里云 OSS。
- posts collection 已支持草稿版本、S3 媒体配置和结构化 Block 字段。

## 进行中

### Astro ↔ CMS 全集合试点

- `apps/web/src/lib/cms-loader.ts` 已实现 Astro 7 Loader。
- 8 个集合已支持 `CMS_API_URL` 条件加载：
  - 未设置 `CMS_API_URL`：只使用本地 MDX / Markdown。
  - 设置 `CMS_API_URL`：先使用本地内容，再叠加 Payload published 内容。
- CMS 不可达时 5 秒超时并优雅降级，保留本地内容，不阻塞构建。
- Payload blocks 会在 loader 层规范化为前台 `Block` 契约。

### 发布工作流

- Payload 8 个内容集合已接入发布 hooks。
- `REBUILD_WEBHOOK_URL` 未配置时不影响 CMS 保存；配置后发布、下架、删除会发送 webhook payload。
- Astro 已新增 `/preview/[collection]/[id]` 和 `/preview?collection=&id=` SSR 草稿预览端点。
- 预览端点使用 `CMS_API_URL` / `CMS_API_TOKEN` 读取 CMS 草稿，并保持 noindex。
- `/zh-CN/admin` 已从纯预留壳调整为 noindex 发布运营看板，展示 CMS 跳转、数据源、Webhook、预览端点、搜索索引、构建状态、集合计数和最近发布；`/en/admin` 保留英文看板。
- `/healthz` 已作为 Web 运行时健康检查端点。

## 未完成 / 待验证

- 本地 Docker 后端栈仍需完整验证：`docker compose -f infra/docker-compose.local.yml up --build`。
- 生产 Docker 栈仍需服务器验证：`docker compose -f infra/docker-compose.prod.yml up -d --build postgres cms`。
- CMS 登录、posts CRUD、图片上传、Payload API 读取仍需真实环境联调。
- 使用真实 CMS 数据构建 Astro 页面仍需端到端验收，尤其是 BlockRenderer 和 OSS 媒体 URL。
- Pagefind 目前是基础搜索；集合筛选、标签筛选和内容地图页仍未完成。
- 其余集合虽然已可从 CMS 加载 richText 正文，但 BlockRenderer 暂时只在 posts / knowledge 详情页启用。
- 真实服务器 webhook 重建、评论、Meilisearch、AI RAG 仍是后续目标。

## 当前优先级

### P0

- 让 `infra/docker-compose.local.yml` 在本机完整跑通。
- 打通 Payload CMS 登录、posts 新建、图片上传。
- 用真实 CMS posts 数据验证 Astro 构建、列表页、详情页、RSS、Sitemap、Pagefind。
- 用阿里云 OSS 测一轮生产 S3_* 配置，确认上传 URL 与前台渲染。

### P1

- 补充 CMS 试点使用说明和环境变量说明。
- 在服务器上联调 `REBUILD_WEBHOOK_URL` 到部署脚本或 CI hook。
- 使用真实 `CMS_API_TOKEN` 验证草稿预览读取非公开内容。

### P2

- 设计内容导出 JSON，为后续搜索升级和 AI RAG 做准备。

## 代码状态

- 最新已提交节点：`9db2eca`，引入内容契约层、CMS 后台基座、内容体验增强和 MDX 文档组件系统。
- 当前工作区包含 SPRINT-004/005/006 相关未提交变更：cmsLoader 混合加载、BlockRenderer、全集合 CMS collection、发布 hooks、SSR 草稿预览、admin 发布看板、本地/生产部署拆分和相关文档。
