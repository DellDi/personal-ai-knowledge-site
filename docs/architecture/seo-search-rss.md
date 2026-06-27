# SEO、搜索与 RSS

## SEO

所有页面通过 `BaseLayout` 统一处理：

- title
- description
- canonical
- alternate locale links
- Open Graph 基础信息
- Twitter card 基础信息

中文页面的 title 和 description 必须围绕个人展示、知识沉淀、技能储备和项目实践表达，避免把英文内部概念或泛泛用户定位作为主描述。

## 搜索

Pagefind 在 Astro 构建后运行：

```bash
astro build && pagefind --site dist
```

搜索页在生产构建后加载 `/pagefind/pagefind.js`，并按当前语言过滤结果。

## RSS

Feed：

- `/rss.xml`
- `/podcast/rss.xml`

草稿内容不得进入 RSS。RSS 标题和描述优先中文，技术名词按通用写法保留。
