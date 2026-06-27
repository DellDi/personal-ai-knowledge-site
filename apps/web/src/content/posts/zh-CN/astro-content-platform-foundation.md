---
title: "Astro 内容平台的第一阶段底座"
description: "记录这个站点第一阶段如何用 Astro、Content Collections、多语言和 Docker 建立长期可演进的内容底座。"
lang: "zh-CN"
translationKey: "post-astro-content-platform-foundation"
slug: "astro-content-platform-foundation"
date: 2026-06-27
updated: 2026-06-27
tags: ["astro", "content-platform", "architecture"]
status: "published"
featured: true
category: "Architecture"
series: "Astro Content Platform"
---

## 为什么先做平台骨架

这个项目不是一次性页面，也不是只服务文章发布的 blog。第一阶段先把内容集合、路由、多语言、主题、部署和 Agent 约束固定下来，后续每个模块都能在同一套规则里扩展。

## 技术边界

- Astro 负责静态优先的内容渲染。
- React 只用于主题切换、搜索等交互岛。
- Content Collections 负责内容 schema、类型安全和构建期校验。
- Docker Compose 提供 Nginx 静态服务，避免生产环境依赖 Node 运行时。

## 下一步

第二轮会增强播客详情、知识库目录、专题聚合、搜索过滤和发布检查。
