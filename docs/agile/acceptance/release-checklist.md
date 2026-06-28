# 发布检查清单

## 基础命令

- [ ] `pnpm install`
- [ ] `pnpm -C apps/web check`
- [ ] `pnpm -C apps/web build`
- [ ] `pnpm --filter @personal-ai-knowledge-site/content-contract typecheck`
- [ ] `pnpm --filter @personal-ai-knowledge-site/cms typecheck`

## 前台预览

- [ ] `docker compose up --build`
- [ ] `/zh-CN/`
- [ ] `/en/`
- [ ] `/rss.xml`
- [ ] `/podcast/rss.xml`
- [ ] `/zh-CN/search`
- [ ] `/zh-CN/admin` 保持 noindex
- [ ] 320px 移动端无横向滚动
- [ ] 1440px 桌面端布局稳定
- [ ] 亮色、黑夜、跟随系统主题可用
- [ ] canonical 和 hreflang 存在
- [ ] 中文页面可见文案不被英文概念主导
- [ ] 详情页 JSON-LD 注入（Article / PodcastEpisode / BreadcrumbList）
- [ ] og:image 和 twitter:image 存在
- [ ] 每集合至少 1 篇 published 内容进入 RSS 与 Pagefind
- [ ] 播客详情页时间轴和资源组件渲染
- [ ] 知识库文档树侧边栏可折叠
- [ ] 知识库详情页上下篇导航展示
- [ ] 详情页底部相关内容推荐展示

## CMS 试点

- [ ] `docker compose -f infra/docker-compose.local.yml up --build`
- [ ] Payload CMS 可登录
- [ ] posts collection 可新建、编辑、发布、下架
- [ ] media collection 可上传图片到 MinIO
- [ ] 8 个 collection 可在 CMS 后台访问
- [ ] 设置 `CMS_API_URL` 后本地 MDX 与 CMS published 内容混合加载
- [ ] CMS 不可达时 5s 超时优雅降级，保留本地内容，不阻塞构建
- [ ] `/zh-CN/admin` 展示 CMS 跳转、数据源模式和发布链路状态
- [ ] 使用真实 CMS posts 数据时，列表页、详情页、RSS、Sitemap、Pagefind 正常
- [ ] posts / knowledge 的 contentBlocks 可通过 BlockRenderer 渲染

## 发布工作流

- [ ] `REBUILD_WEBHOOK_URL` 未配置时，CMS 保存内容不报错
- [ ] 配置 `REBUILD_WEBHOOK_URL` 后，published 发送 `publish` payload
- [ ] draft / archived 发送 `unpublish` payload
- [ ] 删除内容发送 `delete` payload
- [ ] `/preview/[collection]/[id]` 可读取 CMS 草稿
- [ ] 预览页带 `noindex, nofollow`
- [ ] 预览页 richText 和基础 Blocks 可渲染
- [ ] `/zh-CN/admin` 展示 CMS 数据源、Webhook、预览端点、集合计数、最近发布和构建状态
- [ ] `/healthz` 返回 `ok`

## 生产部署

- [ ] 复制 `infra/env/production.example.env` 为 `infra/env/production.env` 并替换密钥
- [ ] `docker compose -f infra/docker-compose.prod.yml config` 通过
- [ ] 生产栈不启动 MinIO
- [ ] Payload CMS 使用阿里云 OSS 上传媒体成功
- [ ] `web-build` 可从 CMS 拉取内容并生成 `dist/client`、`dist/server` 和 Pagefind 索引
- [ ] `web` 使用 Astro Node server 启动，`/preview` SSR 可用
- [ ] 1Panel / Nginx 将 `www` 反代到 `127.0.0.1:8080`
- [ ] 1Panel / Nginx 将 `cms` 反代到 `127.0.0.1:3000`
