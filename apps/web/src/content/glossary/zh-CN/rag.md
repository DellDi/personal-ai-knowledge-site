---
title: RAG
description: 检索增强生成，先检索相关知识再交给模型生成答案，用于降低幻觉并支持引用来源。
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
---

## 定义

RAG（Retrieval-Augmented Generation，检索增强生成）是一种把检索与生成结合的模式：先从知识库检索与问题相关的内容，再把检索结果作为上下文交给模型生成答案。

## 它解决什么问题

- **幻觉**：模型凭记忆编造，RAG 让它基于检索到的事实作答
- **时效性**：模型训练数据有截止日期，RAG 可以接入最新内容
- **可引用**：RAG 可以返回答案来源，便于核对

## 典型流程

1. 文本切 chunk
2. 生成 embedding 写入向量库
3. 提问时检索相关 chunk
4. 把 chunk 作为上下文喂给模型生成答案

## 相关术语

- Embedding（向量化）
- 向量库
- AI Agent

## 相关内容

- [内容平台前后台分离架构记录](/zh-CN/knowledge/content-platform-architecture)（第三阶段 AI 索引）
