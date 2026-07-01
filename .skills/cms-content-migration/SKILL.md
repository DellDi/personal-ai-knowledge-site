---
name: cms-content-migration
description: 批量迁移 Markdown、MDX、JSON 或外部整理文档到本项目 Payload CMS 时使用。适用于生成标准导入 JSON、校验 posts/podcast/knowledge/topics/projects/resources/glossary/timeline 字段、上传图片/音频/PDF/附件到 media/OSS、把本地资源路径转换为 CMS 链接、dry-run 验证、upsert 创建或更新 CMS 内容。
---

# CMS 内容迁移 Skill

## 核心原则

- 默认中文输出。
- 只适用于当前项目 `personal-ai-knowledge-site`。
- 先生成或整理标准导入 JSON，再调用固定脚本；不要让智能体直接手写随机 Payload API 请求。
- 默认导入 `draft`，确认预览后再发布。批量 `published` 会触发多次 rebuild webhook，不适合小内存服务器。
- 不打印、不提交 `CMS_API_TOKEN`、Payload 登录 token、生产 env 或 OSS 密钥。
- 任何写入前必须先执行 dry-run；只有用户明确要求写入时才加 `--apply`。
- 媒体资源必须走 Payload `media` collection。脚本上传到 CMS 后，由现有 S3/OSS storage 配置落到 MinIO/OSS。

## 读取参考

- 需要字段规则或枚举时读 `references/schema-map.md`。
- 需要整理标准导入 JSON、Markdown/MDX 输入或命令参数时读 `references/import-format.md`。
- 需要执行迁移时用 `scripts/cms-import.mjs`，不要重新写导入脚本。

## 工作流

1. 确认目标 collection：`posts`、`podcast`、`knowledge`、`topics`、`projects`、`resources`、`glossary` 或 `timeline`。
2. 从源文档提取 frontmatter/元数据、正文、图片和附件。
3. 按 `references/schema-map.md` 补齐必填字段，缺失时先汇报，不要臆造关键事实。
4. 输出标准导入 JSON，或直接让脚本从 Markdown/MDX 目录解析。
5. 先 dry-run：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs --input migration.json --dry-run
```

6. 如果 dry-run 只剩可接受 warning，再写入 CMS：

```bash
CMS_API_URL="https://cms.example.com/api" \
CMS_API_TOKEN="***" \
node .skills/cms-content-migration/scripts/cms-import.mjs --input migration.json --apply
```

7. 写入后在 CMS 后台或 `/preview?collection=<collection>&id=<id>` 检查草稿。
8. 发布前确认是否需要一次性重建前台；不要在批量导入阶段默认发布。

## 常用命令

从标准 JSON dry-run：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs --input migration.json --dry-run --print-json
```

从本地 Markdown/MDX 目录 dry-run：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs \
  --from-md apps/web/src/content/posts/zh-CN \
  --collection posts \
  --dry-run
```

写入线上 CMS：

```bash
CMS_API_URL="https://cms.example.com/api" \
CMS_API_TOKEN="$CMS_API_TOKEN" \
node .skills/cms-content-migration/scripts/cms-import.mjs \
  --input migration.json \
  --apply
```

远程图片也要下载并上传到 media 时才使用：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs \
  --input migration.json \
  --upload-remote-media \
  --apply
```

## 媒体处理

- frontmatter 里的 `cover`、`hero`、`asset`、播客 `audio` 会上传到 `media` 并替换为 Payload upload 关系 id。
- Markdown 正文里的本地图片 `![alt](./image.png)` 会上传为 `imageBlock`。
- Markdown 正文里的本地附件链接 `[下载](./file.pdf)` 会上传到 `media`，正文链接替换为 CMS 返回的 URL。
- `/images/...` 这种绝对本地资源从 `apps/web/public` 解析。
- `/zh-CN/...`、`/en/...` 视为站内路由，不上传。
- http(s) 媒体默认不上传；只有加 `--upload-remote-media` 才下载后上传。

## 输入约束

- JSON 输入优先，Markdown/MDX 自动解析用于已有本地内容迁移。
- Markdown frontmatter 支持本项目常见 YAML 子集：标量、内联数组、缩进数组、对象数组。
- Markdown 正文转换为 Payload Lexical richText 的基础结构；复杂展示优先使用 `contentBlocks`。
- 代码围栏会转换为 `codeBlock`，本地图片会转换为 `imageBlock`。
- `resources`、`glossary`、`timeline` 当前 CMS collection 没有 `contentBlocks` 字段，脚本会丢弃传入的 blocks。

## 验证

迁移工具修改后至少执行：

```bash
node --check .skills/cms-content-migration/scripts/cms-import.mjs
python3 /Users/zhouxia/.codex/skills/.system/skill-creator/scripts/quick_validate.py .skills/cms-content-migration
```

涉及项目代码或文档规则变化时，再执行：

```bash
pnpm -C apps/web check
pnpm -C apps/web build
```
