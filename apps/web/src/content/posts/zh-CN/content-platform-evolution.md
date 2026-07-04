---
title: 个人内容站的架构演进：从静态博客到前后台分离
description: 复盘我把个人站点从纯静态 Astro 升级为 Astro 前台 + CMS 后台 + 数据库 + 对象存储的决策过程和踩坑记录，以及为什么"内容契约层"是整个演进的关键。
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
cover: /images/posts/content-platform-evolution.svg
category: 工程架构
contentBlocks:
  - type: statGrid
    columns: 4
    items:
      - value: '5'
        label: 架构组件
      - value: '2'
        label: 关键决策
      - value: '1'
        label: 契约层
      - value: '0'
        label: 运行时 MDX
  - type: callout
    variant: info
    title: 这一篇讲什么
    content: 这篇复盘记录个人内容站从纯静态 Astro 升级为前后台分离架构的完整决策路径。核心不是"最终架构长什么样"，而是"为什么从纯静态出发、什么时候发现撑不住、用什么方式演进才能不推倒重来"。
  - type: compareTable
    caption: 纯静态与前后台分离对照
    columns:
      - key: dimension
        label: 维度
      - key: static
        label: 纯静态
      - key: hybrid
        label: 前后台分离
        highlight: true
    rows:
      - dimension: 内容写入
        static: 只能在 Git 里写
        hybrid: CMS 后台编辑草稿预览
      - dimension: 状态机
        static: 无草稿预览发布
        hybrid: 草稿预览发布完整状态机
      - dimension: 媒体资源
        static: 塞进 Git 仓库越来越重
        hybrid: 对象存储独立管理
      - dimension: 协作能力
        static: 非技术人员帮不上忙
        hybrid: 编辑通过 CMS 直接发布
      - dimension: 扩展落点
        static: 评论搜索 AI 检索无落点
        hybrid: Worker 同步索引与向量
      - dimension: 前台性能
        static: 极致快零运行时
        hybrid: 仍然静态优先保持快
  - type: steps
    title: 演进的四个关键步骤
    items:
      - 先用纯静态 Astro 跑通首页、文章、播客、知识库，确认静态优先的体验和 SEO 优势值得保留。
      - 识别纯静态的硬限制：内容只能在 Git 写、无状态机、媒体塞仓库、扩展无落点。
      - 把 Astro 重新定位为读侧，另起 Payload CMS 作为写侧，两端通过内容契约层共享类型。
      - 动态内容存成结构化 Block 而不是运行时 MDX，前台用 BlockRenderer 按类型渲染，组件白名单可控。
  - type: quote
    content: Astro 不是不适合做内容平台，它只是不适合单独承担整个动态平台。把读侧和写侧分开，两边都用最合适的工具，才是长期可维护的方向。
    author: 本篇核心论点
    source: 个人内容站的架构演进
  - type: callout
    variant: tip
    title: 给同样在演进个人站的同学
    content: 不要一上来就做前后台分离。先用纯静态跑通核心体验，确认静态优先的优势值得保留，再识别出真正的硬限制。这样演进时你会很清楚"为什么要动"和"什么不能动"，而不是为了架构而架构。
  - type: callout
    variant: warning
    title: 最大的风险
    content: 前后台分离最大的风险是 Astro 的 schema 和 CMS 的 collection 定义两套源漂移。一旦漂移，前台渲染和后台编辑就会出现"明明后台存了字段前台却读不到"的鬼故事。必须用契约层把两端绑住。
---

## 起点是纯静态

最初我选 Astro 做个人内容站，理由很直接：静态优先、SEO 好、部署简单、客户端 JavaScript 少。第一版用 Markdown + Content Collections 就把首页、文章、播客、知识库跑起来了，构建一次几秒钟，部署一个 Docker 镜像就完事，体验非常顺。

但当我真正想长期维护这个站时，发现纯静态有几个硬限制：

- **内容只能在 Git 里写，非技术人员帮不上忙**。我想让朋友帮忙校对文章，但他不会用 Git，更不会提 PR。
- **没有草稿 / 预览 / 发布状态机**。所有内容要么是 Markdown 文件要么不是，没有"草稿可见但 noindex"、"预览链接临时分享"、"发布后进 RSS"这种细粒度状态。
- **媒体资源塞进 Git 仓库会越来越重**。一期播客的音频几十 MB，几张封面图几 MB，半年下来仓库克隆都要等半天。
- **评论、搜索、AI 检索都没有落点**。纯静态没有运行时，这些需要服务端逻辑的能力无处安放。

这些限制在第一版不痛，但越往后越痛。尤其是当我想要接入 AI 向量检索做语义搜索时，发现纯静态根本没有地方跑向量化任务。

## 升级方向：前后台分离

我没有放弃 Astro，而是把它定位成**读侧**，另起一个 CMS 作为**写侧**。最终架构是：

- **Astro 负责前台展示**，保持快、轻、SEO 友好。这一层不动，第一版的体验和部署优势全部保留。
- **Payload CMS 负责后台编辑、草稿、审核、媒体库**。非技术人员也能用，草稿预览发布状态机完整。
- **PostgreSQL 存结构化内容**。CMS 的真实数据源，支持查询、索引、事务。
- **对象存放音频、图片、附件**。Git 仓库只存代码和文本内容，媒体资源走对象存储 CDN 分发。
- **Worker 负责搜索索引和 AI 向量同步**。CMS 发布时通过 webhook 通知 Worker，Worker 跑索引和向量化任务，结果写回前台可读的存储。

## 关键决策：内容契约层

最大的风险是 Astro 的 schema 和 CMS 的 collection 定义两套源漂移。一旦漂移，前台渲染和后台编辑就会出现"明明后台存了字段前台却读不到"的鬼故事——而且这种问题只在特定内容上才暴露，很难在构建期发现。

我加了一层 `content-contract` 包，导出共享类型和字段枚举，两端各自适配，把它当作单一事实源。Astro 的 `content.config.ts` 从这个包导入 `BLOCK_TYPES`、`CONTENT_STATUSES`、`KNOWLEDGE_AREAS` 等枚举，CMS 的 collection 定义也从同一个包导入。改字段时只改契约层，两端构建都会报错，强迫同步更新。

## 关键决策：结构化 Block 而不是运行时 MDX

动态内容不存成 MDX 让前台运行时编译，而是存成结构化 Block（richText / callout / code / audio 等），前台用 BlockRenderer 按类型渲染。这样组件白名单可控、迁移容易、非技术人员也能编辑。

为什么不用运行时 MDX？因为 MDX 在运行时编译意味着前台要带一个 MDX 编译器，性能差、攻击面大、组件白名单难控。结构化 Block 把"能渲染什么组件"这件事从运行时移到构建期——BlockRenderer 只认契约层定义的 block 类型，CMS 里存了未识别的 type 直接渲染成空，不会崩页面。

## 这一阶段我得到的结论

Astro 不是不适合做内容平台，它只是**不适合单独承担整个动态平台**。把读侧和写侧分开，两边都用最合适的工具，才是长期可维护的方向。

这次演进最值得记录的不是最终架构，而是"为什么没有推倒重来"。因为第一阶段的底座（内容集合、路由、设计 token、部署）做对了，第二阶段只是在读侧加 BlockRenderer、在写侧加 CMS、在中间加契约层，每一项都是加法而不是重写。这正是先做底座再做视觉的回报——骨架对了，演进就是叠层；骨架错了，演进就是重写。
