---
title: AI 知识实践站：个人内容平台
description: 本站本身的项目复盘，记录从需求定位、技术选型到架构演进的完整决策过程。
lang: zh-CN
translationKey: project-knowledge-site
slug: project-knowledge-site
date: 2025-06-27
tags:
  - Astro
  - 内容平台
  - 项目复盘
status: published
featured: true
role: 独立设计与开发
stack:
  - Astro
  - React
  - Tailwind CSS
  - Pagefind
  - PostgreSQL
  - Payload CMS
links:
  - label: 站点首页
    url: /zh-CN/
  - label: 架构记录
    url: /zh-CN/knowledge/content-platform-architecture
---

## 项目背景

我需要一个长期承载个人品牌、知识沉淀和技能储备的内容站。它不是博客，而是个人展示层、知识组织层和未来 AI 检索层的统一底座。

## 我的角色

独立完成需求定位、信息架构、技术选型、UI 设计、前后端开发和部署。后续 CMS 与 AI 索引也由我主导设计。

## 解决方案

### 第一阶段：静态骨架

用 Astro + Content Collections 搭起 8 个内容集合（播客、文章、知识库、专题、项目、资源、术语、时间线），中文优先路由，编辑式野兽派视觉，黑夜模式一等公民，Pagefind 静态搜索，RSS / Sitemap / Docker 部署。

### 第二阶段：前后台分离

引入 Payload CMS 作为写侧，PostgreSQL 存结构化内容，对象存放媒体，Astro 通过自定义 loader 从 CMS 拉内容并复用 schema 校验。动态内容用结构化 Block，前台用 BlockRenderer 渲染。

### 第三阶段：互动与 AI 检索

评论系统走 CMS comments collection，搜索升级到 Meilisearch，AI 索引用 PostgreSQL + pgvector 做 RAG 问答。

## 成果

- 一套中文优先、可长期维护的个人内容底座
- 读写分离、可扩展的前后台架构
- 为后续 AI 知识检索预留了结构化内容基础
