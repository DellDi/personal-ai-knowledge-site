# ADR-003：使用 PostgreSQL + 阿里云 OSS 作为存储层

## 状态

已接受。

## 决策

- 结构化内容存储：PostgreSQL 16
- 媒体资源存储：开发期 MinIO，生产阿里云 OSS

## 实现方式

- 开发期 `infra/docker-compose.yml` 起 PostgreSQL 16 + MinIO
- 生产切换阿里云 OSS，通过 S3 兼容协议接入
- Payload 的 S3 storage adapter 用同一份配置，切换只改环境变量
- 后续 pgvector 扩展直接挂载到同一 PostgreSQL 实例，做 AI 向量检索

## 选型理由

### PostgreSQL

- 开发生产同一镜像，避免 SQLite → PostgreSQL 迁移折返
- pgvector 扩展复用同一实例，AI 检索不需要额外向量库（初期）

### 阿里云 OSS

- S3 兼容协议，Payload storage adapter 复用
- 国内访问快，主受众延迟低
- 开发期用 MinIO 本地替身，零成本

## 环境变量

```env
# 开发期（MinIO）
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=content-platform
S3_ACCESS_KEY_ID=minio_admin
S3_SECRET_ACCESS_KEY=minio_admin_password
S3_FORCE_PATH_STYLE=true

# 生产（阿里云 OSS）
S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
S3_REGION=oss-cn-hangzhou
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_FORCE_PATH_STYLE=false
```
