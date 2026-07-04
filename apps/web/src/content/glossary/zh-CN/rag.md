---
title: RAG
description: 检索增强生成，先检索相关知识再交给模型生成答案，用于降低幻觉并支持引用来源，是 AI 问数和知识库问答的核心模式。
lang: zh-CN
translationKey: glossary-rag
slug: glossary-rag
date: 2025-05-15
tags:
  - RAG
  - AI Agent
  - 术语
status: published
featured: false
aliases:
  - 检索增强生成
  - Retrieval-Augmented Generation
contentBlocks:
  - type: statGrid
    columns: 4
    items:
      - value: '4'
        label: 典型流程
      - value: '3'
        label: 解决问题
      - value: '1'
        label: 引用来源
      - value: '↓'
        label: 幻觉率
  - type: callout
    variant: info
    title: 一句话定义
    content: RAG（Retrieval-Augmented Generation，检索增强生成）是一种把检索与生成结合的模式：先从知识库检索与问题相关的内容，再把检索结果作为上下文交给模型生成答案。
  - type: compareTable
    caption: RAG 与纯生成模式对照
    columns:
      - key: dimension
        label: 维度
      - key: pure
        label: 纯生成
      - key: rag
        label: RAG
        highlight: true
    rows:
      - dimension: 知识来源
        pure: 模型训练记忆
        rag: 外部知识库检索
      - dimension: 幻觉风险
        pure: 高（凭记忆编造）
        rag: 低（基于检索事实）
      - dimension: 时效性
        pure: 受训练截止日期限制
        rag: 可接入最新内容
      - dimension: 可引用
        pure: 无法追溯来源
        rag: 可返回答案出处
      - dimension: 适用场景
        pure: 创意写作、通用问答
        rag: 知识库问答、企业问数
  - type: steps
    title: RAG 的典型流程
    items:
      - 文本切 chunk：把知识库文档切成合适大小的语义块。
      - 生成 embedding：用向量化模型把每个 chunk 转成向量。
      - 写入向量库：把向量存入向量数据库，建立检索索引。
      - 提问时检索：把用户问题向量化，检索相关 chunk。
      - 上下文拼接：把检索到的 chunk 作为上下文喂给模型。
      - 生成答案：模型基于检索上下文生成答案并附引用来源。
  - type: callout
    variant: tip
    title: 什么时候用 RAG
    content: RAG 适合"知识库问答"场景——答案存在于已有文档中，模型只需要找到并组织。不适合"数据查询"场景——答案需要实时计算（如上月收缴率），这时要走 AI 问数工作流而非 RAG。
  - type: callout
    variant: warning
    title: 常见误区
    content: 不要以为接了 RAG 就不会有幻觉。RAG 降低的是"凭记忆编造"的幻觉，但如果检索到的 chunk 本身有错或与问题不相关，模型仍可能基于错误上下文生成错误答案。所以 RAG 的质量很大程度取决于检索质量，不是接了就万事大吉。
  - type: quote
    content: RAG 不是让模型变聪明，而是让模型有据可查。它把"凭记忆答"变成"查着答"，这一步就能把企业知识库问答的可用性从 demo 提升到生产。
    author: 本站核心观点
    source: AI 问数与知识库问答
---

## 定义

RAG（Retrieval-Augmented Generation，检索增强生成）是一种把检索与生成结合的模式：先从知识库检索与问题相关的内容，再把检索结果作为上下文交给模型生成答案。

它的核心价值是让模型"有据可查"而不是"凭记忆编造"。模型自身的知识有训练截止日期、有记忆偏差、有幻觉风险，RAG 通过外部检索把事实注入上下文，让生成基于检索到的事实而非模型记忆。

## 它解决什么问题

- **幻觉**：模型凭记忆编造，RAG 让它基于检索到的事实作答
- **时效性**：模型训练数据有截止日期，RAG 可以接入最新内容
- **可引用**：RAG 可以返回答案来源，便于核对和追溯

这三个问题在企业场景里特别关键。企业知识库的内容模型从没见过，纯生成必然幻觉；企业数据每天都在变，模型记忆早已过时；企业问答必须可追溯，不能"模型说的就是对的"。

## RAG 与 AI 问数的区别

很多人把 RAG 和 AI 问数混为一谈，其实它们解决不同问题。RAG 适合"答案在文档里"的场景——模型找到相关段落并组织成答案。AI 问数适合"答案需要实时计算"的场景——模型生成 SQL 查询数据库拿到结果。前者是检索+组织，后者是意图+计算。混淆两者会导致用 RAG 回答数据查询问题（答不了）或用 AI 问数回答知识库问题（杀鸡用牛刀）。

## 典型流程

1. 文本切 chunk——按语义块切分，不是按固定字数
2. 生成 embedding 写入向量库——建立检索索引
3. 提问时检索相关 chunk——向量相似度+关键词混合检索
4. 把 chunk 作为上下文喂给模型生成答案——附引用来源

## 相关术语

- Embedding（向量化）——RAG 的基础能力
- 向量库——RAG 的存储和检索引擎
- AI Agent——RAG 的上层应用之一
- MCP——比 RAG 更通用的上下文获取协议

## 相关内容

- [内容平台前后台分离架构记录](/zh-CN/knowledge/content-platform-architecture)（第三阶段 AI 索引）
- [AI Agent 工程化实践](/zh-CN/posts/ai-agent-engineering)——上下文管理主线
