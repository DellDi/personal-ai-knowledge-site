---
title: "个人 AI 知识站的第一阶段底座"
description: "记录这个站点第一阶段如何用 Astro、内容集合、多语言预留和 Docker 建立长期可演进的个人内容底座，以及为什么先做骨架而不是先做视觉。"
lang: "zh-CN"
translationKey: "post-astro-content-platform-foundation"
slug: "astro-content-platform-foundation"
date: 2026-06-27
updated: 2026-06-27
tags: ["Astro", "内容平台", "工程架构"]
status: "published"
featured: true
cover: "/images/posts/astro-content-platform-foundation.svg"
category: "工程架构"
series: "个人 AI 知识站"
contentBlocks:
  - type: statGrid
    columns: 4
    items:
      - value: '8'
        label: 内容集合
      - value: '2'
        label: 语言预留
      - value: '0'
        label: 运行时依赖
      - value: '1'
        label: 部署单元
  - type: callout
    variant: info
    title: 这一篇讲什么
    content: 这篇复盘记录个人 AI 知识站第一阶段的底座搭建。核心不是"用了哪些技术"，而是"为什么先固定这些规则"——内容集合、路由、多语言、主题、部署、Agent 约束，这六项一旦定下来，后续每个模块都能在同一套规则里扩展，不用推倒重来。
  - type: compareTable
    caption: 第一阶段优先级取舍
    columns:
      - key: dimension
        label: 维度
      - key: first
        label: 先做
        highlight: true
      - key: later
        label: 后做
    rows:
      - dimension: 内容结构
        first: 集合 schema 定型
        later: 视觉卡片样式
      - dimension: 路由
        first: 多语言占位
        later: 国际化落地
      - dimension: 主题
        first: 设计 token 体系
        later: 动效与微交互
      - dimension: 部署
        first: Docker 静态服务
        later: CMS 动态发布
      - dimension: 协作
        first: Agent 规范约束
        later: 自动化工作流
  - type: steps
    title: 第一阶段底座的搭建顺序
    items:
      - 先用 Content Collections 把八类内容（posts、podcast、knowledge、topics、projects、resources、glossary、timeline）的 schema 定下来，构建期就校验类型，不让脏数据进仓库。
      - 再定路由结构 /zh-CN 与 /en 双语言占位，zh-CN 作为主入口，en 只做国际化预留不反向主导。
      - 然后建立设计 token 体系（颜色、字号、阴影、边框），所有组件只读 token 不写硬编码，黑夜模式作为一等主题维护。
      - 接着用 Docker Compose 提供 Nginx 静态服务，生产环境不依赖 Node 运行时，镜像小、启动快、攻击面窄。
      - 最后把 Agent 工作流约束写进 AGENTS.md，规定页面文案优先中文、内容必须进集合、CMS hooks 只通知不执行命令。
  - type: quote
    content: 第一阶段不是把页面做漂亮，而是把规则做对。规则对了，第二阶段是加法；规则错了，第二阶段是重写。
    author: 本阶段核心取舍
    source: 个人 AI 知识站第一阶段复盘
  - type: callout
    variant: tip
    title: 给同样在搭个人站的同学
    content: 如果你只有一天时间，别去调字体和配色，先把内容集合的 schema 写出来。schema 一旦定型，后面所有视觉、交互、搜索都是在已有结构上加层，而不是重新设计数据模型。
  - type: callout
    variant: warning
    title: 踩过的坑
    content: 最初我把 /en 路由也做了完整内容，结果维护两份中文和英文累到放弃。后来改成 zh-CN 主入口、en 只做预留，维护成本立刻降一半。多语言预留不等于多语言落地，别在第一阶段就背两份内容的债。
---

## 为什么先做平台骨架

这个项目不是一次性页面，也不是只服务文章发布的博客。它要承载文章、播客、知识库、专题、项目、资源、术语表、时间线八类内容，还要支持后续 CMS 写侧接入、搜索索引、AI 向量检索。如果第一阶段就去抠视觉细节，第二阶段接入 CMS 时会发现内容结构没定好、路由没预留、主题 token 没抽出来，每一项都要推倒重来。

所以第一阶段的核心目标只有一个：**把规则固定下来**。内容集合的 schema、路由的多语言占位、主题的设计 token、部署的静态服务、Agent 的工作流约束——这六项一旦定下来，后续每个模块都能在同一套规则里扩展，而不是各写各的、互相冲突。

## 技术边界

第一阶段的技术选型围绕"长期可演进"这个目标展开，每一项都有明确的取舍理由：

- **Astro 负责静态优先的内容渲染**。选 Astro 而不是 Next.js，是因为个人内容站不需要那么多客户端 hydration，静态优先意味着 SEO 好、部署简单、客户端 JavaScript 少。
- **React 只用于主题切换、搜索等交互岛**。岛屿架构让 React 只在真正需要交互的地方加载，其余页面保持纯静态，性能和体验都更好。
- **内容集合负责内容结构、类型安全和构建期校验**。所有内容必须进 Content Collections，schema 在 `content.config.ts` 里统一定义，构建时就能发现脏数据，不让错误内容进生产。
- **Docker Compose 提供 Nginx 静态服务**。生产环境不依赖 Node 运行时，镜像小、启动快、攻击面窄，2GB 内存的小服务器也能稳定跑。

## 内容集合的设计原则

八类内容集合不是随意划分的，每一类都对应一种不同的个人展示需求：posts 是深度复盘、podcast 是对谈取舍、knowledge 是可复用工具书、topics 是串联阅读路径、projects 是项目实践、resources 是外部资源、glossary 是术语对照、timeline 是成长记录。它们共享 `common` 字段（title、description、lang、translationKey、slug、tags、status），再各自扩展专属字段（podcast 的 episode/season/audio、knowledge 的 area/level、projects 的 stack/links 等）。

这样设计的好处是：公开页面、RSS 和搜索入口可以统一只读 `status: published` 的内容，不用为每类集合写一套过滤逻辑；缺点是新增集合时要先想清楚它和已有集合的边界，避免内容类型重叠。

## 下一步

第一阶段底座搭完后，第二轮会增强细分体验和发现能力：播客详情页的时间轴与资源列表、知识库的目录聚合、专题的串联阅读路径、搜索的过滤与高亮、CMS 写侧接入的契约层、AI 向量检索的语义层。每一项都是加法，不需要改动第一阶段的骨架——这正是先做底座再做视觉的回报。
