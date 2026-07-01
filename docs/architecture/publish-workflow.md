# 发布工作流

## 目标

发布工作流负责把 Payload CMS 的写入状态同步到 Astro 前台构建与预览层。第一版保持轻量：CMS 发出通知，部署层负责重建，Astro 负责公开页构建和草稿预览。

## 状态机

```txt
draft
  -> preview     通过 /preview 查看，不进入公开列表
  -> published   进入公开页面、RSS、Sitemap、Pagefind

published
  -> draft       视为下架，触发 unpublish webhook
  -> archived    下架归档，触发 unpublish webhook
  -> deleted     删除，触发 delete webhook

archived
  -> published   重新发布，触发 publish webhook
```

公开页面、RSS、Sitemap 和搜索入口只读取 `status: published`。

## Payload Hooks

`apps/cms/src/hooks/webhook.ts` 负责发出重建通知。

Webhook payload：

```json
{
  "event": "publish",
  "collection": "posts",
  "id": "cms-doc-id",
  "slug": "article-slug",
  "status": "published",
  "timestamp": "2026-06-28T08:00:00.000Z"
}
```

事件规则：

| CMS 操作 | 条件 | event |
|---|---|---|
| create / update | `status: published` | `publish` |
| create / update | `status: draft` 或 `status: archived` | `unpublish` |
| delete | 任意状态 | `delete` |

约束：

- 未设置 `REBUILD_WEBHOOK_URL` 时直接跳过，不影响 CMS 保存。
- Webhook 超时为 10 秒。
- Webhook 非 2xx 或异常只记录 warning，不回滚内容保存。
- `REBUILD_WEBHOOK_URL` 应指向部署编排入口，不直接暴露成公开无鉴权命令执行接口。

## 草稿预览

Astro 预览端点：

```txt
/preview/[collection]/[id]
/preview?collection=<collection>&id=<docId>
```

实现约束：

- `prerender = false`，必须由 Astro Node SSR 运行时处理。
- 使用 `CMS_API_URL` 读取 Payload REST API。
- 如果 CMS 需要认证，使用 `CMS_API_TOKEN` 发送 `Authorization: JWT <token>`。
- 返回页面带 `noindex, nofollow` 和 `X-Robots-Tag`。
- 第一版服务端渲染 richText 与基础 Blocks，保证不用额外客户端脚本也能预览主要内容。

## Admin 看板

`/zh-CN/admin` 和 `/en/admin` 是 noindex 的发布运营看板，不承载写入能力：

- CMS 后台跳转
- CMS 数据源状态
- Webhook 配置状态
- 草稿预览端点状态
- Pagefind 索引状态
- SSR 构建状态
- 8 个集合的中文 published 计数
- 最近发布内容

## 部署关系

前台现在是“静态优先 + SSR 预览”：

```txt
web-build
  -> pnpm -C apps/web build
  -> dist/client 静态页面、RSS、Sitemap
  -> dist/client/pagefind 搜索索引
  -> dist/server SSR 入口

web
  -> node dist/server/entry.mjs
  -> 服务静态页面
  -> 服务 /preview 和 /healthz
```

生产 `web` 使用 `Dockerfile.web-runtime`，不在启动镜像时执行 Astro build；`dist` 只由 `web-build` 写入 `web_dist` volume。

生产 webhook 推荐指向服务器上的受保护重建入口，由它执行：

```bash
docker compose -f infra/docker-compose.prod.yml --profile build run --rm web-build
docker compose -f infra/docker-compose.prod.yml up -d web
```

第一版不在 Astro 运行时内部执行重建命令。
