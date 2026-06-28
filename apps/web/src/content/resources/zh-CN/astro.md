---
title: Astro：内容驱动的前台框架
description: 本站前台使用的框架，静态优先、局部交互、少客户端 JavaScript，适合内容站。
lang: zh-CN
translationKey: resource-astro
slug: resource-astro
date: 2025-06-10
tags:
  - Astro
  - 前端
  - 工具
status: published
featured: false
type: tool
url: https://astro.build
---

## 为什么选它

Astro 是内容驱动网站框架，适合从文件系统、外部 API 或 CMS 加载内容并生成高性能前台页面。它也支持服务端按需渲染、API endpoints、Content Collections loader。

## 在本站的用法

- `apps/web` 是公开主站，负责读侧
- Content Collections 定义内容结构，schema 校验
- React islands 只用于主题切换、搜索等交互控件
- 自定义 loader 从 CMS 拉内容时，复用同一套 schema

## 推荐理由

静态优先、SEO 好、部署简单、客户端 JavaScript 少。把它定位成读侧，搭配 CMS 写侧，是内容平台长期可维护的组合。
