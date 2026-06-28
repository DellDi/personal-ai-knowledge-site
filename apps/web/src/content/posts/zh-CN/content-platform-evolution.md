---
title: 个人内容站的架构演进：从静态博客到前后台分离
description: 复盘我把个人站点从纯静态 Astro 升级为 Astro 前台 + CMS 后台 + 数据库 + 对象存储的决策过程和踩坑记录。
lang: zh-CN
translationKey: content-platform-evolution
slug: content-platform-evolution
date: 2025-06-20
tags:
  - Astro
  - 架构
  - CMS
status: published
featured: false
category: 工程架构
---

## 起点是纯静态

最初我选 Astro 做个人内容站，理由很直接：静态优先、SEO 好、部署简单、客户端 JavaScript 少。第一版用 Markdown + Content Collections 就把首页、文章、播客、知识库跑起来了。

但当我真正想长期维护这个站时，发现纯静态有几个硬限制：

- 内容只能在 Git 里写，非技术人员帮不上忙
- 没有草稿 / 预览 / 发布状态机
- 媒体资源塞进 Git 仓库会越来越重
- 评论、搜索、AI 检索都没有落点

## 升级方向：前后台分离

我没有放弃 Astro，而是把它定位成**读侧**，另起一个 CMS 作为**写侧**。最终架构是：

- Astro 负责前台展示，保持快、轻、SEO 友好
- Payload CMS 负责后台编辑、草稿、审核、媒体库
- PostgreSQL 存结构化内容
- 对象存放音频、图片、附件
- Worker 负责搜索索引和 AI 向量同步

## 关键决策：内容契约层

最大的风险是 Astro 的 schema 和 CMS 的 collection 定义两套源漂移。我加了一层 `content-contract` 包，导出共享类型和字段枚举，两端各自适配，把它当作单一事实源。

## 关键决策：结构化 Block 而不是运行时 MDX

动态内容不存成 MDX 让前台运行时编译，而是存成结构化 Block（richText / callout / code / audio 等），前台用 BlockRenderer 按类型渲染。这样组件白名单可控、迁移容易、非技术人员也能编辑。

## 这一阶段我得到的结论

Astro 不是不适合做内容平台，它只是**不适合单独承担整个动态平台**。把读侧和写侧分开，两边都用最合适的工具，才是长期可维护的方向。
