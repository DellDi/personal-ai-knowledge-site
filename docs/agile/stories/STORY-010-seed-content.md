# STORY-010：补齐 8 集合中文 seed 内容

## 背景

第一版平台骨架完成后，8 个内容集合几乎为空，无法验证混合 loader、RSS、搜索和相关推荐的正确性。

## 范围

- posts：2 篇（AI Agent 工程化、内容平台架构演进）
- podcast：1 期（S01E01 AI Agent 工程化对谈，含时间轴和资源）
- knowledge：2 篇（AI Agent 排查手册、内容平台架构记录）
- topics：1 个（AI Agent 工程化专题，串联文章/播客/知识库）
- projects：1 个（本站项目复盘）
- resources：2 个（Astro、系统化思维）
- glossary：2 个（AI Agent、RAG）
- timeline：2 个（平台骨架完成、启动 CMS 接入）

## 验收标准

- [ ] 每集合至少 1 篇 `status: published` 中文内容
- [ ] 播客包含 timeline 和 resources 结构化字段
- [ ] 知识库包含 area、level、order 字段
- [ ] 所有内容通过 Content Collections schema 校验
