# 基础设施

开发环境的完整后端服务栈。生产部署参考 `docs/architecture/deployment.md`。

## 服务清单

| 服务 | 端口 | 用途 |
|---|---|---|
| postgres | 5432 | PostgreSQL 16，结构化内容存储 |
| minio | 9000 / 9001 | 对象存储（阿里云 OSS 本地替身），9000 API / 9001 控制台 |
| minio-init | - | 一次性初始化，创建 `content-platform` bucket |
| cms | 3000 | Payload CMS 后台 |

## 启动

```bash
docker compose -f infra/docker-compose.yml up --build
```

启动后访问：

- Payload CMS 后台：http://localhost:3000/admin
- MinIO 控制台：http://localhost:9001（minio_admin / minio_admin_password）
- PostgreSQL：localhost:5432（content / content_password / content_platform）

## 环境变量

CMS 服务的对象存储配置通过 S3_* 环境变量传入。生产环境切换阿里云 OSS 时，只需修改这些变量：

```env
S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
S3_REGION=oss-cn-hangzhou
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_FORCE_PATH_STYLE=false
```

Payload 的 storage adapter 走 S3 兼容协议，MinIO 和阿里云 OSS 用同一份配置，切换只改环境变量。

## 与前台的关系

开发时前台 Astro 本地跑：

```bash
pnpm -C apps/web dev
```

前台通过 `CMS_API_URL` 环境变量连接 CMS。默认 `http://localhost:3000`。
