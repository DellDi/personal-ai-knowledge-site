# 部署

## 本地开发

```bash
pnpm install
pnpm -C apps/web dev
```

## 静态构建

```bash
pnpm -C apps/web build
pnpm -C apps/web preview
```

## Docker Compose

```bash
docker compose up --build
```

Docker 镜像会构建 Astro 静态产物，并通过 Nginx 在 `http://localhost:8080` 服务 `apps/web/dist`。

## 健康检查

Nginx 暴露 `/healthz`。
