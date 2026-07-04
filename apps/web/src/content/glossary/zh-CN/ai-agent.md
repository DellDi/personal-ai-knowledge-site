---
title: AI Agent
description: 能够感知环境、自主决策并调用工具完成任务的智能体，通常以 LLM 为推理核心，与单次问答的区别在于多轮规划、工具调用和反馈调整。
lang: zh-CN
translationKey: glossary-ai-agent
slug: glossary-ai-agent
date: 2025-05-10
tags:
  - AI Agent
  - LLM
  - 术语
status: published
featured: false
aliases:
  - 智能体
  - Agent
contentBlocks:
  - type: statGrid
    columns: 4
    items:
      - value: '4'
        label: 关键特征
      - value: '3'
        label: 相关术语
      - value: '2'
        label: 相关内容
      - value: '∞'
        label: 应用场景
  - type: callout
    variant: info
    title: 一句话定义
    content: AI Agent 是能够感知环境、自主决策并调用工具完成任务的智能体，通常以大语言模型（LLM）作为推理核心。它与"单次问答"的区别在于可以多轮规划、调用外部工具、根据反馈调整下一步行动。
  - type: compareTable
    caption: AI Agent 与单次问答对照
    columns:
      - key: dimension
        label: 维度
      - key: qa
        label: 单次问答
      - key: agent
        label: AI Agent
        highlight: true
    rows:
      - dimension: 交互模式
        qa: 一问一答结束
        agent: 多轮规划持续执行
      - dimension: 工具使用
        qa: 无外部工具
        agent: 调用外部工具扩展能力
      - dimension: 反馈调整
        qa: 无法根据结果调整
        agent: 根据工具返回调整下一步
      - dimension: 上下文
        qa: 单次窗口
        agent: 跨轮维护和压缩上下文
      - dimension: 任务复杂度
        qa: 适合简单查询
        agent: 适合多步骤复杂任务
  - type: steps
    title: Agent 的一次完整执行流程
    items:
      - 感知环境：接收用户输入或外部事件，理解当前任务目标。
      - 自主决策：LLM 推理拆解任务，规划需要调用哪些工具、按什么顺序。
      - 调用工具：通过工具调用扩展能力边界，获取外部数据或执行操作。
      - 反馈调整：根据工具返回结果判断是否完成，未完成则调整下一步行动。
      - 上下文管理：在多轮交互中维护和压缩上下文，避免窗口爆炸。
  - type: quote
    content: Agent 不是更强的模型，而是让模型学会用工具的工程结构。模型负责推理，工具负责执行，工程系统负责把两者稳定地串起来。
    author: 本站核心观点
    source: AI Agent 工程化实践
  - type: callout
    variant: tip
    title: 延伸阅读
    content: 想深入了解 AI Agent 工程化，先读《AI Agent 工程化实践》建立四条主线的全局认知，再用《AI Agent 排查手册》作为落地工具书。
---

## 定义

AI Agent 是能够感知环境、自主决策并调用工具完成任务的智能体，通常以大语言模型（LLM）作为推理核心。它与"单次问答"的区别在于：Agent 可以多轮规划、调用外部工具、根据反馈调整下一步行动。

很多人把"接了工具调用的 LLM"等同于"AI Agent"，这其实只看到了表面。真正的 Agent 要解决的是**自主性**——它不是被动等用户指令，而是主动拆解任务、规划步骤、选择工具、判断结果。一个只会"用户说查就查"的系统是工具，不是 Agent；一个能自己判断"先查哪个、再查哪个、查完要不要追问"的系统才是 Agent。

## 关键特征

- **自主性**：能自行拆解任务、规划步骤，不需要用户逐步指令
- **工具调用**：通过外部工具扩展能力边界，不局限于模型自身知识
- **反馈驱动**：根据工具返回结果调整后续行动，不是一次性执行
- **上下文管理**：在多轮交互中维护和压缩上下文，保持长期一致性

这四个特征不是并列的，而是递进的。自主性是前提（不能自主就不算 Agent），工具调用是骨架（没有工具就只能聊天），反馈驱动是血液（没有反馈就是开环），上下文管理是神经系统（没有压缩就会爆窗）。

## 相关术语

- LLM（大语言模型）—— Agent 的推理核心
- Tool Calling（工具调用）—— Agent 扩展能力的机制
- RAG（检索增强生成）—— Agent 获取外部知识的模式
- MCP（模型上下文协议）—— Agent 连接外部上下文的协议

## 相关内容

- [AI Agent 工程化实践](/zh-CN/posts/ai-agent-engineering)——从套壳到可维护的系统
- [AI Agent 排查手册](/zh-CN/knowledge/ai-agent-troubleshooting)——落地排查工具书
- [AI Agent 工程化专题](/zh-CN/topics/topic-ai-agent-engineering)——串联阅读路径
