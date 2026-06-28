# SPRINT-006：发布工作流

## 目标

建立从 CMS 写入到前台发布的基础闭环：发布状态机、发布 webhook、草稿预览、admin 发布看板和 SSR 部署口子。

## 任务

- Payload 内容集合接入发布 hooks：published 触发 `publish`，draft / archived 触发 `unpublish`，删除触发 `delete`
- `REBUILD_WEBHOOK_URL` 作为外部重建通知地址，hook 失败只记录 warning，不阻塞 CMS 保存
- Astro 新增 `/preview/[collection]/[id]` 和 `/preview?collection=&id=` 草稿预览端点
- 预览端点使用 SSR 读取 CMS 草稿，支持 `CMS_API_URL` 和 `CMS_API_TOKEN`
- 预览页保持 `noindex, nofollow`，基础渲染 richText 与 CMS Blocks
- 文档化草稿 / 预览 / 发布 / 下架状态机
- `/zh-CN/admin` 增强为发布运营看板：CMS 数据源、Webhook、预览端点、搜索索引、构建状态、集合计数、最近发布；`/en/admin` 保留英文看板
- 前台部署从纯 Nginx 静态服务调整为 Astro Node SSR 运行时，保留静态优先构建和 Pagefind 索引
- 新增 `/healthz` 作为 Web 运行时健康检查端点

## 退出标准

- [x] `pnpm -C apps/web check` 通过
- [x] `pnpm -C apps/web build` 通过，Pagefind 正常生成到 `dist/client/pagefind`
- [x] `/zh-CN/admin` 在 320px / 1440px 无可见横向滚动，集合计数跨列正常
- [x] `docker compose -f docker-compose.yml config` 通过
- [x] `docker compose -f infra/docker-compose.local.yml config` 通过
- [x] `docker compose -f infra/docker-compose.prod.yml --profile build config` 通过（使用 example env 临时校验）
- [x] 发布工作流、部署模式、admin 看板文档同步

## 待上线验证

- 使用真实 Payload 登录态或服务 token 验证草稿预览读取非公开内容
- 在服务器上把 `REBUILD_WEBHOOK_URL` 指向部署脚本或 CI hook，验证发布 / 下架 / 删除后能触发 `web-build`
- 用生产 OSS 媒体 URL 验证预览页和公开页媒体渲染
