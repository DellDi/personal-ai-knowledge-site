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

## 中文优先规则

- `/zh-CN` 是当前主入口。
- 中文内容的标题、摘要、正文、标签优先中文。
- 标签允许保留 `Astro`、`AI Agent`、`RSS`、`SEO` 等通用技术名词。
- 避免直接暴露内部枚举，例如 `ai-agent`、`intermediate`、`tool`，页面应显示中文标签。

## 翻译规则

不同语言版本通过 `translationKey` 关联。URL 仍保留显式语言前缀：

- `/zh-CN/posts/example`
- `/en/posts/example`
