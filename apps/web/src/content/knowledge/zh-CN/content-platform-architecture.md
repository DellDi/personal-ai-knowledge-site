---
title: 内容平台前后台分离架构记录
description: 记录把个人内容站从纯静态升级为 Astro 前台 + CMS 后台 + 数据库 + 对象存储的架构决策与模块边界。
lang: zh-CN
translationKey: content-platform-architecture
slug: content-platform-architecture
date: 2025-06-22
updated: 2025-06-25
tags:
  - Astro
  - 架构
  - CMS
status: published
featured: false
area: architecture
level: intermediate
order: 1
---

## 架构总览

```
Astro 前台（读侧）
  + CMS 后台（写侧）
  + PostgreSQL（结构化内容）
  + 对象存储（媒体资源）
  + Worker（索引同步 / AI 向量）
```

## 模块边界

### 读侧：Astro

- 官网首页、播客页、文章页、知识库页、专题页、项目案例页
- SEO 页面、RSS、Sitemap、静态搜索
- 不承担后台编辑、权限、审核、媒体管理

### 写侧：CMS

- 内容后台、富文本排版、草稿 / 发布 / 下架
- 媒体库、权限、内容审核
- 不承担前台渲染

### 存储层

- PostgreSQL 存结构化内容字段
- 对象存储存音频、图片、附件，内容里只保留 URL 和元数据

### 索引层

- Worker 在内容发布时同步搜索索引和 AI 向量库
- 前台搜索走索引服务，不直接查数据库

## 关键约束

- 内容 schema 必须经 `content-contract` 契约层，不允许两端各自定义
- 动态内容存结构化 Block，不存运行时 MDX
- 公开页面只读 `status: published` 内容
- 中文表达优先，英文路由作为国际化预留

## 演进路径

1. 本地 MDX + Content Collections（已完成）
2. CMS + 数据库接入
3. 混合内容源（本地 MDX 与 CMS 共存）
4. 发布工作流 + 预览
5. 互动系统（评论 / 审核）
6. 搜索升级 + AI 知识索引
