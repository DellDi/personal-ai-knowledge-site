# STORY-001：初始化工程

## 背景

仓库最初只是最小空壳。平台需要 Astro 主站、统一命令和可持续维护的目录结构。

## 范围

- pnpm workspace
- `apps/web` Astro 主站
- React、MDX、Sitemap、RSS、Tailwind v4、Pagefind、Sharp、reading-time、clsx
- 根目录统一脚本

## 验收标准

- [ ] `pnpm install` 可用
- [ ] `pnpm -C apps/web dev` 可启动本地开发
- [ ] `pnpm -C apps/web build` 可构建静态输出和 Pagefind 索引
