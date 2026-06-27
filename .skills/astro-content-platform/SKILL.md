---
name: astro-content-platform
description: 修改本项目 Astro 个人内容站时使用，包括个人品牌展示、知识沉淀、技能储备、项目案例、内容集合、多语言预留、黑夜模式、播客、文章、知识库、专题、资源库、术语库、SEO、RSS、搜索、Docker 部署、后台管理预留和 UI 组件。
---

# Astro 个人内容站 Skill

## 适用场景

- 新增或调整路由
- 修改内容集合 schema
- 新增 MDX 内容组件
- 建设播客、文章、知识库、专题、项目案例、资源库、术语库或时间线
- 调整 SEO、RSS、Sitemap、Pagefind、主题、Docker 或后台预留
- 重构 UI 组件和页面文案

## 必读参考

编码前先阅读：

- `docs/architecture/content-model.md`
- `docs/architecture/ui-system.md`
- `docs/architecture/i18n.md`
- `docs/architecture/seo-search-rss.md`
- `docs/architecture/deployment.md`
- `docs/architecture/admin-design.md`
- `docs/agile/roadmap.md`

## 开发规则

- 默认中文输出。
- 页面可见内容优先服务个人展示、知识沉淀、技能储备和项目复盘。
- 技术英文可以保留，但解释文案、按钮、栏目说明和空状态必须围绕个人站点定位表达。
- 优先使用 `.astro` 组件。
- `.tsx` 只用于交互岛。
- 所有结构化内容必须放入 Content Collections。
- 新增内容类型时必须同步更新 schema 和文档。
- 每个公开路由必须具备 SEO 基础信息。
- 每个可见模块必须响应式可用。
- 保留 `/zh-CN` 和 `/en` 的显式路径前缀。
- `/admin` 在真实鉴权和写入能力实现前必须保持 noindex。

## 验收

任务完成前必须：

- `pnpm -C apps/web check` 通过
- `pnpm -C apps/web build` 通过
- 修改页面在移动端和桌面端布局稳定
- 相关故事、路线图或架构文档已同步更新
