---
title: "MCP"
description: "Model Context Protocol，用于让 Agent 连接文档、工具和外部上下文的协议，是 Agent 工程化中统一上下文入口的关键基础设施。"
lang: "zh-CN"
translationKey: "glossary-mcp"
slug: "mcp"
date: 2026-06-27
updated: 2026-06-27
tags: ["AI Agent", "协议", "工具体系"]
status: "published"
featured: true
aliases: ["Model Context Protocol", "模型上下文协议"]
contentBlocks:
  - type: statGrid
    columns: 4
    items:
      - value: '3'
        label: 连接对象
      - value: '1'
        label: 统一入口
      - value: '0'
        label: 运行时耦合
      - value: '∞'
        label: 可扩展源
  - type: callout
    variant: info
    title: 一句话定义
    content: MCP（Model Context Protocol，模型上下文协议）是一种连接模型、工具和外部上下文的协议。对于内容平台，它可以作为 Agent 读取框架文档、仓库规范和外部知识源的统一入口。
  - type: compareTable
    caption: MCP 与传统工具集成的对照
    columns:
      - key: dimension
        label: 维度
      - key: traditional
        label: 传统工具集成
      - key: mcp
        label: MCP 协议
        highlight: true
    rows:
      - dimension: 接入方式
        traditional: 每个工具单独适配
        mcp: 统一协议一次接入
      - dimension: 上下文来源
        traditional: 硬编码在提示词里
        mcp: 按需检索动态注入
      - dimension: 运行时耦合
        traditional: Agent 与工具强耦合
        mcp: 协议解耦可替换
      - dimension: 扩展成本
        traditional: 每加一个工具改一次 Agent
        mcp: 加 MCP server 即可
      - dimension: 文档同步
        traditional: 手动复制到提示词
        mcp: 实时查询最新文档
  - type: steps
    title: MCP 在本项目中的落地路径
    items:
      - 先预留 Astro Docs MCP 配置，让 Agent 修改 Astro 代码时能查询最新官方文档。
      - 再接入仓库规范 MCP，让 Agent 读取 AGENTS.md 和 content.config.ts 的约束规则。
      - 然后接入外部知识源 MCP，让 Agent 按需检索项目文档和个人知识库。
      - 最后建立 MCP server 白名单，只允许可信源接入，避免 Agent 读取未授权内容。
  - type: callout
    variant: tip
    title: 为什么 Agent 需要 MCP
    content: 没有 MCP 时，Agent 的上下文只能靠提示词硬塞，文档更新了要改提示词，工具换了要改代码。MCP 把上下文获取从提示词里抽出来，变成按需检索的协议调用——Agent 需要什么就查什么，不用提前塞满窗口。
  - type: callout
    variant: warning
    title: 使用边界
    content: MCP 不是万能的。它解决的是"Agent 怎么获取外部上下文"，不解决"Agent 怎么判断上下文是否可信"。所以 MCP server 必须有白名单机制，不能让 Agent 随意接入任意来源，否则会引入不可控的信息污染。
---

## 定义

MCP（Model Context Protocol，模型上下文协议）是一种连接模型、工具和外部上下文的协议。它解决的核心问题是：Agent 怎么在运行时按需获取外部知识，而不是把所有上下文提前塞进提示词。

传统做法是把文档、规范、知识库全部写进提示词，结果提示词越写越长、窗口越来越满、更新一次要改一遍代码。MCP 把这件事变成协议调用——Agent 需要什么上下文就通过 MCP server 查什么，用完即弃，窗口保持干净。

## 在本项目中的作用

项目预留 Astro Docs MCP 配置，后续 Agent 修改 Astro 相关代码时应优先查询最新官方文档。这样 Agent 不会用过时的 API 写代码，也不需要把整个 Astro 文档塞进提示词。

更进一步的规划是接入三类 MCP server：

- **框架文档 MCP**：Astro、Payload、React 等框架的官方文档检索
- **仓库规范 MCP**：本仓库的 AGENTS.md、content.config.ts、UI 设计系统约束
- **外部知识 MCP**：个人知识库、语雀文档、外部技术博客的按需检索

## 为什么 Agent 工程化需要 MCP

Agent 工程化的四条主线里，MCP 主要服务于**上下文管理**和**工具编排**。它让上下文获取从"提前塞满"变成"按需检索"，让工具接入从"逐个适配"变成"协议统一"。这两件事做好，Agent 的窗口利用率和维护成本都会显著改善。

## 相关术语

- AI Agent——MCP 的服务对象
- Tool Calling——MCP 的底层机制
- RAG——另一种获取外部知识的模式（MCP 更通用，RAG 更聚焦检索）

## 相关内容

- [AI Agent 工程化实践](/zh-CN/posts/ai-agent-engineering)——四条主线中的上下文管理
- [AI Agent 工程化专题](/zh-CN/topics/topic-ai-agent-engineering)——串联阅读路径
