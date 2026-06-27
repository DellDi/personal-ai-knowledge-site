# SPRINT-001：平台骨架

## 目标

交付第一版中文优先的 Astro 内容平台骨架。

## 任务

- 初始化 Astro 主站
- 增加 workspace 和依赖
- 增加 Content Collections
- 增加中文优先和英文预留路由
- 增加亮色/黑夜主题 token
- 增加公开列表页和详情页
- 增加 RSS、播客 RSS、Sitemap 和搜索页
- 增加 Docker Compose 静态部署
- 增加后台预留页和后台设计文档
- 增加 Agent 和 Markdown 项目管理文档

## 退出标准

- `pnpm -C apps/web check` 通过
- `pnpm -C apps/web build` 通过
- Docker 镜像可服务静态站点
