---
title: "Agent 开发工作流"
description: "用 AGENTS.md、项目 Skill 和 Markdown 项目管理约束 AI 编程助手的协作边界。"
lang: "zh-CN"
translationKey: "knowledge-agent-workflow"
slug: "ai-agent/agent-workflow"
date: 2026-06-27
updated: 2026-06-27
tags: ["AI Agent", "开发规范", "项目管理"]
status: "published"
featured: true
area: "ai-agent"
level: "intermediate"
order: 10
---

## 工作流目标

Agent 不是随手改代码的自动补全工具，而是需要读取项目约束、理解内容模型、执行验收并更新项目管理文档的协作者。

## 最小约束

- 修改内容模型前必须同步更新架构文档。
- 新增页面时必须包含 SEO 信息、多语言路径和移动端布局。
- 任务完成前必须运行构建检查。

## 验收重点

每次迭代都应该能回答：改了什么、影响哪些路由、如何验证、后续有哪些明确的扩展点。
