# AI 知识实践站

这是一个以站点所有者本人为中心的 Astro 个人内容站，服务个人品牌展示、知识沉淀、技能储备、项目复盘和长期成长记录。第一阶段覆盖播客、文章、知识库、专题、项目案例、资源库、术语库、搜索、RSS、站点地图、黑夜模式、Docker 部署，以及后续后台管理、CMS、评论和 AI 检索扩展。

## 当前状态

第一版平台骨架已完成：

- Astro 主站位于 `apps/web`
- 中文表达优先，路由固定为 `/zh-CN`；英文 `/en` 先作为后续国际化预留
- 内容集合覆盖播客、文章、知识库、专题、项目、资源、术语和时间线
- 视觉方向为中文内容友好的编辑式野兽派，支持亮色、黑夜和跟随系统
- 生产构建后生成 Pagefind 静态搜索索引
- 提供 `/rss.xml`、`/podcast/rss.xml` 和 Sitemap
- 提供 Docker Compose + Nginx 静态部署配置
- `/admin` 是后台管理预留壳页面，当前不提供登录或写入能力
- 已建立 `AGENTS.md`、项目 Skill、Agile Markdown 和架构文档

## 常用命令

```bash
pnpm install
pnpm -C apps/web dev
pnpm -C apps/web check
pnpm -C apps/web build
pnpm -C apps/web preview
```

## Docker 预览

```bash
docker compose up --build
```

启动后访问：

- `http://localhost:8080/zh-CN/`
- `http://localhost:8080/en/`
- `http://localhost:8080/rss.xml`
- `http://localhost:8080/podcast/rss.xml`

## 目录结构

```txt
apps/web                         Astro 前台（读侧）
apps/cms                         Payload CMS 后台（写侧，Next.js + Payload 3.x）
packages/content-contract        内容契约层（共享类型/枚举/Block 契约，单一事实源）
docs/agile                       Markdown 项目管理：路线图、史诗、故事、迭代
docs/architecture                架构文档和平台决策
infra/docker-compose.yml         开发环境后端服务栈（PostgreSQL + MinIO + CMS）
.skills/astro-content-platform   项目专用 Agent Skill
AGENTS.md                        Agent 开发约束
Dockerfile                       前台生产静态镜像
docker-compose.yml               前台本地生产部署预览
nginx/default.conf               Nginx 静态服务配置
```

## 内容定位

首版内容以个人展示和自我沉淀为主：对外呈现“我是谁、做过什么、在积累什么能力”，对内沉淀可复用的知识资产和技能储备。中文是当前主要表达语言，英文路由保留但不是当前内容主线；新增公开内容时，应优先保证中文标题、摘要、标签和页面描述完整。

## License

MIT
