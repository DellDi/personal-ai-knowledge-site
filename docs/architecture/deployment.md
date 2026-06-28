# 部署

## 本地开发

### 前台

```bash
pnpm install
pnpm -C apps/web dev
```

前台运行在 http://localhost:4321

### 后台

```bash
docker compose -f infra/docker-compose.yml up --build
```

后台服务：

- PostgreSQL：localhost:5432（content / content_password / content_platform）
- MinIO 控制台：http://localhost:9001（minio_admin / minio_admin_password）
- Payload CMS：http://localhost:3000/admin

## 静态构建（前台）

```bash
pnpm -C apps/web build
pnpm -C apps/web preview
```

## Docker Compose 预览

```bash
docker compose up --build
```

Docker 镜像会构建 Astro 静态产物，并通过 Nginx 在 `http://localhost:8080` 服务 `apps/web/dist`。

## 生产拓扑

| 服务 | 部署形态 | 入口 |
|---|---|---|
| Astro 前台 | 静态产物 → CDN | www.example.com |
| Payload CMS | Node 常驻服务 | cms.example.com |
| PostgreSQL | 托管或自建 | 内网 |
| 阿里云 OSS | 对象存储 | assets.example.com |

前台仍静态部署到 CDN，CMS 单独常驻。环境变量切换开发期 MinIO → 生产 OSS。

## 健康检查

- 前台 Nginx 暴露 `/healthz`
- CMS 暴露 `/api/access`
