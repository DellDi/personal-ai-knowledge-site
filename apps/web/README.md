# Web 主站

`apps/web` 是 AI 知识实践站的 Astro 公共站点。

## 常用命令

从仓库根目录执行：

```bash
pnpm -C apps/web dev
pnpm -C apps/web check
pnpm -C apps/web build
pnpm -C apps/web preview
```

## 当前能力

- 中文优先，`/zh-CN` 为主入口
- `/en` 为后续国际化预留
- Astro 内容集合
- 编辑式野兽派视觉 token
- 亮色、黑夜和跟随系统主题
- 生产构建后生成 Pagefind 搜索索引
- RSS、播客 RSS 和 Sitemap
- `/admin` 后台管理预留入口

## 文案规则

页面可见文案默认使用中文。技术名词可以保留英文原名，但说明文字、按钮、栏目描述和空状态应优先使用中文表达。
