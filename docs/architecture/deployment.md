# Deployment

## Local

```bash
pnpm install
pnpm -C apps/web dev
```

## Static Build

```bash
pnpm -C apps/web build
pnpm -C apps/web preview
```

## Docker Compose

```bash
docker compose up --build
```

The Docker image builds Astro static output and serves `apps/web/dist` through Nginx on `http://localhost:8080`.

## Health Check

Nginx exposes `/healthz`.
