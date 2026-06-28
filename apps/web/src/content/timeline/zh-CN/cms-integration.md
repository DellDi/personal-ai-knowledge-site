---
title: 启动 CMS 后台接入
description: 开始把架构从纯静态升级为 Astro 前台 + Payload CMS 后台 + PostgreSQL + 对象存储的前后台分离形态。
lang: zh-CN
translationKey: timeline-cms-integration
slug: timeline-cms-integration
date: 2025-07-01
tags:
  - 里程碑
  - CMS
  - 架构
status: published
featured: false
kind: milestone
---

## 这次要做什么

把平台从“纯静态内容站”升级为“前后台分离的内容平台”：

- 新增 `apps/cms`（Payload CMS standalone）
- 新增 `packages/content-contract`（内容契约层）
- 引入 PostgreSQL 和对象存储
- Astro 通过自定义 loader 从 CMS 拉内容，复用 schema 校验
- 动态内容用结构化 Block，前台用 BlockRenderer 渲染

## 为什么这么做

纯静态在长期维护时遇到硬限制：内容只能在 Git 写、没有草稿预览发布状态机、媒体塞 Git 越来越重、评论搜索 AI 检索没有落点。把读写两侧分开，两边都用最合适的工具。
