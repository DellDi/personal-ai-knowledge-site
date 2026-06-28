# AGENTS.md

## 项目定位

默认中文输出。

这是一个以站点所有者本人为中心的 Astro 个人内容站，核心目标是呈现个人品牌、项目实践、知识体系、技能储备和长期成长记录。首版中文表达优先，英文路由仅作为后续国际化预留。

## 常用命令

- 安装依赖：`pnpm install`
- 本地开发：`pnpm -C apps/web dev`
- 类型与 Astro 检查：`pnpm -C apps/web check`
- 生产构建：`pnpm -C apps/web build`
- 本地预览：`pnpm -C apps/web preview`
- Docker 预览：`docker compose up --build`
- 本地后端栈：`pnpm infra:local`
- 生产后端启动：`pnpm infra:prod:up`
- 生产前台构建：`pnpm infra:prod:build-web`
- 生产前台启动：`pnpm infra:prod:web`

## 核心规则

- 页面可见文案优先使用中文，围绕个人展示、知识沉淀和技能储备表达。
- 技术名词可以保留英文原名，但解释、按钮、栏目说明、空状态和文档描述应使用中文。
- 使用 Astro 组件构建静态 UI。
- React 只用于主题切换、搜索等交互岛。
- 所有结构化内容必须进入 Astro Content Collections。
- 内容结构以 `apps/web/src/content.config.ts` 为准，不允许绕过 schema。
- 公开页面、RSS 和搜索入口只能读取 `status: published` 内容。
- `/zh-CN` 是当前主入口；`/en` 只做国际化预留，不应反向主导个人站点表达。
- `/zh-CN/admin` 和 `/en/admin` 当前是 noindex 的发布运营看板，不实现登录、写入或审核；真实写入进入 Payload CMS。
- `/preview` 是 SSR 草稿预览端点，必须保持 noindex，不能进入导航、RSS、Sitemap 或搜索入口。
- CMS 发布 hooks 只能通知外部重建入口，不要让 Astro 运行时直接执行系统命令。

## 内容规则

公开内容必须包含：

- `title`
- `description`
- `lang`
- `translationKey`
- `slug`
- `tags`
- `status: published`

播客内容还必须包含：

- `episode`
- `season`
- `audio`
- `date`

中文内容要求：

- 标题、摘要、正文、标签优先中文。
- 标签可以保留 `Astro`、`AI Agent`、`RSS`、`SEO` 等通用技术名词。
- 避免把内部实现描述当成个人展示卖点；应该说明它如何支撑个人品牌、知识资产或技能储备。
- 避免过多使用 `Content Platform`、`Knowledge Base`、`Project` 等英文栏目概念，除非是在解释技术实现。

## UI 规则

- 遵循 `docs/architecture/ui-system.md`。
- 使用 `apps/web/src/styles/global.css` 中的设计 token。
- 保持编辑式野兽派风格：强排版、硬边框、清晰网格、有限高饱和点缀。
- 正文阅读体验优先于视觉冲击。
- 黑夜模式必须作为一等主题维护。
- 移动端不得出现横向滚动、文字溢出或控件重叠。

## 完成标准

完成实现任务前必须：

- 运行 `pnpm -C apps/web check`。
- 运行 `pnpm -C apps/web build`。
- 检查 `/zh-CN/`、`/en/`、`/rss.xml`、`/podcast/rss.xml`、`/zh-CN/search` 和 `/zh-CN/admin`。
- 修改发布工作流时检查 `/preview/[collection]/[id]`、`/healthz`、`REBUILD_WEBHOOK_URL` 和 `CMS_API_TOKEN` 相关文档。
- UI 变更需检查 320px 移动端和 1440px 桌面端。
- 修改路由、内容模型、部署或开发规则时，同步更新相关架构文档或 Agile Markdown。
