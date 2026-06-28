# STORY-021：发布工作流与草稿预览

## 背景

CMS 已经能承载内容写入，但还缺少从草稿到预览、发布、下架和前台重建的基础流程。需要先把轻量可控的发布闭环打通，为后续真实服务器部署和自动化发布做准备。

## 范围

- Payload afterChange / afterDelete hooks
- 发布 webhook payload 契约
- Astro SSR 草稿预览端点
- `/zh-CN/admin` 发布运营看板
- Docker Compose 生产 Web SSR 运行模式
- 发布状态机和部署文档

## 验收标准

- [x] CMS 内容发布时能按状态产生 publish / unpublish / delete webhook payload
- [x] 未配置 webhook 时 CMS 保存不报错
- [x] 草稿预览端点不参与静态预渲染，并带 `noindex`
- [x] 预览端点支持 richText 和基础 Blocks 渲染
- [x] `/zh-CN/admin` 展示 CMS 数据源、webhook、预览端点、构建状态、集合计数、最近发布
- [x] 生产 Web 容器以 Astro Node server 运行，支持 SSR 预览和静态页面
- [x] check / build / 320 / 1440 验收通过

## 技术备注

- Webhook URL 不应该指向 Astro 页面本身，而应该指向部署编排入口，例如服务器脚本、CI/CD deploy hook 或受保护的内部重建服务。
- `CMS_API_TOKEN` 用于草稿预览读取非公开内容，生产环境必须使用最小权限 token。
- 第一版不在 Astro 进程内执行 `git pull`、`pnpm build` 或 `docker compose`，避免把发布页变成远程命令执行入口。
