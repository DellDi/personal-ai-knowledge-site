# STORY-016：MDX 文档组件系统

## 背景

纯 Markdown 无法满足知识库和复盘文章的反复出现的排版需求（醒目提示、编号步骤、统计数字、对比表等）。需要一套可复用的文档组件库。

## 范围

- 新增 `apps/web/src/components/docs/` 文档组件库（9 个组件）：
  - Callout（info / tip / warning / danger 四种变体）
  - Figure（图片 + caption + source）
  - Steps（编号步骤）
  - StatGrid（统计数字网格，2/3/4 列）
  - CompareTable（对比表，支持高亮列）
  - Quote（增强引用，带作者和来源链接）
  - AudioPlayer（增强音频播放器）
  - Embed（外部嵌入，域名白名单）
  - CodeBlock（增强代码块，带语言标签）
- 统一导出 `apps/web/src/components/docs/index.ts`
- 补 3 篇 MDX seed 内容展示组件能力

## 验收标准

- [x] 9 个文档组件遵循编辑式野兽派风格
- [x] MDX 文件通过显式 import 使用组件
- [x] 组件对齐 `packages/content-contract` 的 Block 契约
- [x] 黑夜模式覆盖
- [x] 320px 移动端无溢出
