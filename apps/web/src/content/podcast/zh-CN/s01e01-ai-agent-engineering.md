---
title: S01E01｜AI Agent 工程化对谈：从套壳到可维护系统
description: 第一期播客，聊聊我在 AI Agent 项目里踩过的工程化坑，覆盖提示词治理、工具编排、上下文管理和评估闭环。
lang: zh-CN
translationKey: podcast-ai-agent-engineering
slug: s01e01-ai-agent-engineering
date: 2025-05-18
tags:
  - AI Agent
  - 工程化
  - 播客
status: published
featured: true
episode: 1
season: 1
audio: /audio/s01e01-placeholder.mp3
duration: 42:18
cover: /images/podcast/s01e01-cover.svg
transcript: true
hosts:
  - 站长
guests: []
timeline:
  - time: '00:00'
    label: 开场：为什么从套壳聊起
  - time: '05:30'
    label: 提示词治理：把提示词当代码
  - time: '14:12'
    label: 工具编排：读侧 / 写侧 / 检索侧分层
  - time: '23:40'
    label: 上下文管理：长期记忆与当次任务分离
  - time: '31:05'
    label: 评估闭环：用例集与四个核心指标
  - time: '38:50'
    label: 结尾：约束清楚，Agent 才稳定
resources:
  - label: AI Agent 工程化实践（配套文章）
    url: /zh-CN/posts/ai-agent-engineering
    note: 本期对谈的完整文字版
  - label: Agent 工程化排查手册（知识库）
    url: /zh-CN/knowledge/ai-agent-troubleshooting
    note: 沉淀的可复用排查清单
  - label: Astro 官网
    url: https://astro.build
    note: 本站前台使用的框架
---

## 本期简介

这是 AI 知识实践站的第一期播客。我一个人录，没有嘉宾，主题是我最熟悉的 AI Agent 工程化。

录这期的初衷是：我把过去一年在 Agent 项目里的实践整理成了一篇文章，但文章太干，很多“为什么这么做”的取舍没法展开。播客正好补这块——聊聊决策过程，而不是结论本身。

## 时间轴

本期时间轴见右侧（或上方）的结构化时间轴组件，点击任意节点可以跳到对应音频位置（后续版本支持）。

## 文字稿

**开场**：很多人最初写 Agent，都是一段提示词加一个工具调用，跑通了就觉得自己会了。但一旦进真实业务，提示词散在代码里、工具没有边界、上下文越滚越长，没有评估手段——这套东西撑不住。

**提示词治理**：我把提示词从代码里抽出来，按“角色 / 任务 / 约束 / 输出格式”分段，并版本化。这样每次调整都有据可查，也能跑回归用例。提示词不是注释，是逻辑。

**工具编排**：工具不是越多越好。我按“读侧 / 写侧 / 检索侧”分层，每个工具显式声明入参、出参、副作用和失败回退。Agent 走统一编排层调用，而不是各自为政。

**上下文管理**：上下文窗口不是免费的。我把长期记忆和当次任务上下文分开——长期记忆走向量检索按需注入，当次上下文用结构化消息栈管理，每轮结束压缩。

**评估闭环**：没有评估的 Agent 就是玄学。我维护一个用例集，每次改动跑一遍，记录通过率、工具调用次数、平均轮数和成本。这四个指标比“感觉好不好”靠谱得多。

**结尾**：AI Agent 工程化的核心不是模型多强，而是约束做得有多清楚。约束清楚，Agent 就稳定；约束模糊，再强的模型也会乱跑。

## 本期提到的资源

资源链接见右侧（或上方）的结构化资源组件。配套文章和排查手册建议搭配收听。
