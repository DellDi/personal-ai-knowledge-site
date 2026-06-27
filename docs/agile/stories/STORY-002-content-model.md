# STORY-002：内容模型

## 背景

所有公开内容都需要经过 Astro Content Collections 校验，并能按语言、集合、标签和状态查询。

## 范围

- 播客
- 文章
- 知识库
- 专题
- 项目案例
- 资源库
- 术语库
- 时间线

## 验收标准

- [ ] 已发布内容必须包含 `lang`、`translationKey`、`slug`、`title`、`description`、`tags` 和 `status`
- [ ] 草稿内容不会进入公开页面、RSS 和搜索入口
- [ ] 每个核心集合都有中文 seed 内容
