# Agent 工作流

## 规则

- 编码前读取 `AGENTS.md`。
- 平台相关修改读取项目 Skill。
- Astro 行为优先参考官方文档。
- 修改 schema、路由、部署、UI 规则或中文文案策略时，同步更新架构文档。
- 修改任务范围时，同步更新 Agile Markdown。

## 个人站点定位要求

- 默认中文输出。
- 页面文案服务个人展示、知识沉淀、技能储备和项目复盘。
- 技术英文可以保留，但不能让页面看起来像英文模板站或泛泛的开发者社区站。
- README、AGENTS、Skill 和项目文档也应保持中文优先。

## 验证

运行：

```bash
pnpm -C apps/web check
pnpm -C apps/web build
```

涉及部署时，还要运行：

```bash
docker compose up --build
```
