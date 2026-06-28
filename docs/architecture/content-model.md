# 内容模型

## 内容集合

- `podcast`：播客
- `posts`：文章
- `knowledge`：知识库
- `topics`：专题
- `projects`：项目案例
- `resources`：资源库
- `glossary`：术语库
- `timeline`：时间线

## 公共字段

- `title`
- `description`
- `lang`
- `translationKey`
- `slug`
- `date`
- `updated`
- `tags`
- `status`
- `featured`

## 公开规则

只有 `status: published` 的内容可以出现在公开页面、RSS、搜索入口和标签页。

## 数据源

所有集合支持混合数据源，通过 `CMS_API_URL` 环境变量增强：

- 未设置：只读取本地 MDX（`apps/web/src/content/<collection>/`）
- 已设置：先读取本地 MDX，再叠加 Payload CMS REST API 中的 `status: published` 内容

CMS 不可达时 5 秒超时优雅降级，保留本地内容，不阻塞构建。

## Block 渲染

posts 和 knowledge 集合支持 `contentBlocks` 字段（结构化 Block 数组）。详情页先渲染 Astro 原生 Content，再渲染 BlockRenderer。Block 类型清单在 `packages/content-contract` 统一定义。

## 中文优先规则

- `/zh-CN` 是当前主入口。
- 中文内容的标题、摘要、正文、标签优先中文。
- 标签允许保留 `Astro`、`AI Agent`、`RSS`、`SEO` 等通用技术名词。
- 避免直接暴露内部枚举，例如 `ai-agent`、`intermediate`、`tool`，页面应显示中文标签。

## 翻译规则

不同语言版本通过 `translationKey` 关联。URL 仍保留显式语言前缀：

- `/zh-CN/posts/example`
- `/en/posts/example`
