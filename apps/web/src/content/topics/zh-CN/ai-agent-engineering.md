---
title: AI Agent 工程化专题
description: 把分散在文章、播客和知识库里的 AI Agent 工程化内容串成一条连续的阅读路径，按"入门 → 深入 → 排查"的顺序建立完整认知。
lang: zh-CN
translationKey: topic-ai-agent-engineering
slug: topic-ai-agent-engineering
date: 2025-06-26
tags:
  - AI Agent
  - 工程化
  - 专题
status: published
featured: true
hero: /images/topics/ai-agent-engineering.svg
items:
  - /zh-CN/posts/ai-agent-engineering
  - /zh-CN/podcast/s01e01-ai-agent-engineering
  - /zh-CN/knowledge/ai-agent-troubleshooting
contentBlocks:
  - type: statGrid
    columns: 4
    items:
      - value: '4'
        label: 工程化主线
      - value: '3'
        label: 串联内容
      - value: '1'
        label: 阅读路径
      - value: '∞'
        label: 排查用例
  - type: callout
    variant: info
    title: 适合谁读
    content: 这个专题面向已经写过 demo、正在把 Agent 推向真实业务的同学。如果你还在"一段提示词加一个工具调用"的阶段，建议先读入口文章建立全局观，再回到这里按顺序深入。
  - type: compareTable
    caption: 套壳 demo 与工程化系统的差异
    columns:
      - key: dimension
        label: 维度
      - key: demo
        label: 套壳 demo
      - key: engineered
        label: 工程化系统
        highlight: true
    rows:
      - dimension: 提示词
        demo: 散落在代码注释里
        engineered: 角色任务约束分段版本化
      - dimension: 工具调用
        demo: 各自为政无边界
        engineered: 统一编排层显式声明副作用
      - dimension: 上下文
        demo: 越滚越长无回收
        engineered: 长期记忆与当次任务分离压缩
      - dimension: 评估
        demo: 凭感觉判断好坏
        engineered: 用例集跑通过率与成本
      - dimension: 改动成本
        demo: 改一处崩三处
        engineered: 约束清楚可回滚可观测
  - type: steps
    title: 推荐阅读顺序
    items:
      - 先读文章《AI Agent 工程化实践：从套壳到可维护的系统》，建立"提示词治理 / 工具编排 / 上下文管理 / 评估闭环"四条主线的全局认知。
      - 再听播客 S01E01，理解文章里写不下的取舍逻辑——很多"为什么这么做"只能在对谈里展开。
      - 最后把《AI Agent 排查手册》当作工具书，按故障分类逐项排查，每条都附了定位步骤和常见原因。
      - 遇到具体场景时回到本专题，对照四条主线判断当前问题属于哪一类，再决定深入哪个文档。
  - type: quote
    content: AI Agent 工程化的核心不是模型多强，而是约束做得有多清楚。约束清楚，Agent 就稳定；约束模糊，再强的模型也会乱跑。
    author: 本专题核心论点
    source: AI Agent 工程化实践
  - type: callout
    variant: tip
    title: 阅读建议
    content: 不要跳着读。这三篇内容是按"认知 → 取舍 → 落地"的顺序设计的，跳过中间任何一环都会在排查阶段卡住。如果时间紧，至少按 1 → 3 → 2 的顺序补完播客。
  - type: callout
    variant: warning
    title: 常见误区
    content: 很多团队把"接了工具调用"等同于"工程化完成"。实际上工具编排只是四条主线之一，缺了评估闭环的 Agent 仍然是玄学——你不知道下一次改动会不会让通过率掉 20%。
---

## 这个专题在讲什么

AI Agent 工程化是我过去一年投入最多的方向。最初我也以为接上工具调用、写好提示词就算"做完了 Agent"，直到真实业务把这套结构按在地上摩擦：提示词散落在代码里改一处崩三处、工具调用没有边界互相覆盖、上下文越滚越长直到爆窗、没有评估手段只能凭感觉判断好坏。

这个专题不是教程，是我把过去一年踩过的坑、做过的取舍、沉淀下来的可复用文档串成的一条连续阅读路径。按"入门 → 深入 → 排查"的顺序读完，能形成相对完整的工程化认知，而不是停留在 demo 阶段的兴奋感。

## 为什么需要一条专题路径

单篇文章只能写结论，单期播客只能聊取舍，单篇知识库文档只能给排查步骤。这三类内容各自完整，但拼在一起时缺少一条主线把它们串起来。这个专题就是那条主线——它不重复三篇内容里的细节，而是告诉你**在什么阶段读哪一篇、读完应该建立什么认知、下一步去哪里深入**。

## 推荐阅读顺序

### 1. 先读文章：建立全局认知

[AI Agent 工程化实践：从套壳到可维护的系统](/zh-CN/posts/ai-agent-engineering) 是这个专题的入口。它梳理了四条主线：提示词治理、工具编排、上下文管理、评估闭环。读完它你会知道工程化到底在管什么——以及为什么"接了工具调用"不等于"工程化完成"。

### 2. 再听播客：理解决策取舍

[S01E01｜AI Agent 工程化对谈](/zh-CN/podcast/s01e01-ai-agent-engineering) 是文章的补充。文章只写结论，播客聊的是"为什么这么做"——很多取舍在文章里展开不了，放在播客里讲。比如"为什么把提示词从代码里抽出来而不是用模板字符串"、"为什么评估闭环只看四个指标而不是十个"，这些判断逻辑只有对谈才能讲清楚。

### 3. 最后查手册：落地排查

[AI Agent 排查手册](/zh-CN/knowledge/ai-agent-troubleshooting) 是可复用的工具书。当你的 Agent 出问题时，按故障分类逐项排查，每条都附了定位步骤和常见原因。它不是一次性的阅读材料，而是长期沉淀的排查库——每遇到一个新问题就补一条，越用越厚。

## 这个专题后续会补什么

工程化不是一次性的工程，是持续沉淀。这个专题会随着我后续的实践不断扩展，目前已经规划的方向：

- **工具编排的独立文档**：把"读侧 / 写侧 / 检索侧"三层分层细节拆成单独的知识库文档，每层都附上编排层接口约定和失败回退策略。
- **评估闭环的用例集模板**：把现在散落在多个项目里的用例集抽象成可复用模板，包含用例结构、指标定义、回归脚本和通过率基线。
- **上下文压缩的具体策略**：从"按轮压缩"到"按语义块压缩"再到"长期记忆向量召回"的演进路径，每一步都附上踩坑记录。

如果你也在做类似方向，欢迎对照本专题的阅读路径建立自己的认知框架，再把你的实践反向沉淀回这个专题。
