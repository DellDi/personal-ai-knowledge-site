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
9. 批量发布、下架或回滚草稿时使用 `scripts/cms-status.mjs`，仍然必须先 dry-run。

## 常用命令

从语雀知识库导出 Markdown 和标准导入 JSON：

```bash
YUQUE_TOKEN="***" node .skills/cms-content-migration/scripts/yuque-export.mjs \
  --repo-url "https://www.yuque.com/<user-or-group>/<repo>" \
  --collection knowledge \
  --knowledge-area tools \
  --out migrations/yuque
```

导出后先 dry-run：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs \
  --input migrations/yuque/migration.json \
  --dry-run \
  --print-json
```

从 `yuque-exporter` 这类浏览器模拟工具导出的 Markdown 目录生成标准导入 JSON：

```bash
node .skills/cms-content-migration/scripts/yuque-fs-to-migration.mjs \
  --from migrations/yuque-raw \
  --include-dir "综合知识库,AI专题" \
  --exclude-dir "会议文档库,我的简历" \
  --collection knowledge \
  --knowledge-area tools \
  --out migrations/yuque-exporter/migration.json
```

用 DeepSeek 对语雀 Markdown 做自动分类，并生成可审查结果和多 collection 标准导入 JSON：

```bash
DEEPSEEK_API_KEY="***" node .skills/cms-content-migration/scripts/yuque-classify.mjs \
  --from migrations/yuque-raw \
  --include-dir "综合知识库,AI专题" \
  --exclude-dir "会议文档库,我的简历" \
  --out migrations/yuque-classified/migration.json \
  --review-out migrations/yuque-classified/review.json
```

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

批量修改已导入内容状态，例如把一批草稿发布：

```bash
CMS_API_URL="https://cms.example.com/api" \
CMS_API_TOKEN="$CMS_API_TOKEN" \
node .skills/cms-content-migration/scripts/cms-status.mjs \
  --input migrations/yuque-classified/ai-topic.safe.migration.json \
  --status published \
  --dry-run
```

确认后再加 `--apply`：

```bash
CMS_API_URL="https://cms.example.com/api" \
CMS_API_TOKEN="$CMS_API_TOKEN" \
node .skills/cms-content-migration/scripts/cms-status.mjs \
  --input migrations/yuque-classified/ai-topic.safe.migration.json \
  --status published \
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
- 语雀导出脚本只负责源数据获取与标准 JSON 生成，不直接写 CMS。
- Markdown frontmatter 支持本项目常见 YAML 子集：标量、内联数组、缩进数组、对象数组。
- Markdown 正文转换为 Payload Lexical richText 的基础结构；复杂展示优先使用 `contentBlocks`。
- 代码围栏会转换为 `codeBlock`，本地图片会转换为 `imageBlock`。
- `resources`、`glossary`、`timeline` 当前 CMS collection 没有 `contentBlocks` 字段，脚本会丢弃传入的 blocks。

## 语雀源获取

语雀 API 使用 `X-Auth-Token` 认证。Token 获取路径通常是：

1. 登录语雀网页端。
2. 点击右上角头像。
3. 进入 `账户设置`。
4. 找到 `Token`。
5. 点击 `新建`，填写用途，例如 `personal-ai-knowledge-site migration`。
6. 勾选读取知识库/文档所需权限，创建后复制 `Access Token`。

不要把语雀 Token 写入仓库。运行脚本时用环境变量：

```bash
YUQUE_TOKEN="***" node .skills/cms-content-migration/scripts/yuque-export.mjs \
  --namespace "<user-or-group>/<repo>" \
  --collection knowledge
```

`--namespace` 是语雀知识库路径，例如 URL 为 `https://www.yuque.com/zhouxia/my-book/some-doc` 时，namespace 是 `zhouxia/my-book`。也可以直接传 `--repo-url`，脚本会从 URL 前两段路径推断 namespace。

语雀导出脚本会输出：

- `migrations/yuque/migration.json`：给 `cms-import.mjs` 使用的标准导入 JSON。
- `migrations/yuque/<namespace>/*.md`：逐篇导出的 Markdown 备份。
- `migrations/yuque/<namespace>/index.json`：知识库、目录和文档索引摘要。

如果使用非官方 Token 路线，例如 `yuque-exporter` 浏览器模拟导出工具：

1. 先用该工具把 Markdown 导出到本地目录。
2. 再用 `scripts/yuque-fs-to-migration.mjs` 把导出目录转换成标准导入 JSON。已经全量导出但只想迁移部分知识库时，用 `--include-dir` 指定第一层目录名；想排除部分知识库时，用 `--exclude-dir`。
3. 然后继续使用 `scripts/cms-import.mjs --dry-run` 和 `--apply`。

`yuque-fs-to-migration.mjs` 会从 Markdown 一级标题或文件名生成 CMS 标题，从正文提取摘要，并用文件路径生成稳定的 `yuque-*` slug；导入为草稿后建议在 CMS 中人工修正 slug、摘要、领域和标签。

如果需要把不同文档自动分流到 `posts`、`knowledge`、`projects`、`resources`、`glossary`、`timeline`，使用 `scripts/yuque-classify.mjs`。该脚本只调用 DeepSeek 生成分类元数据和标准 JSON，不直接写入 CMS。

DeepSeek 分类脚本会输出：

- `migrations/yuque-classified/review.json`：人工复核用，包含源路径、目标 collection、置信度和分类理由。
- `migrations/yuque-classified/classifications.json`：缓存，方便中断后续跑。
- `migrations/yuque-classified/migration.json`：给 `cms-import.mjs` 使用的多 collection 标准导入 JSON。

推荐先小批量验证：

```bash
DEEPSEEK_API_KEY="***" node .skills/cms-content-migration/scripts/yuque-classify.mjs \
  --from migrations/yuque-raw \
  --include-dir "综合知识库" \
  --limit 10

node .skills/cms-content-migration/scripts/cms-import.mjs \
  --input migrations/yuque-classified/migration.json \
  --dry-run \
  --print-json
```

`review.json` 中 `confidence` 低的内容要人工复核；脚本默认把低置信度内容降级为 `knowledge` 草稿。

## 验证

迁移工具修改后至少执行：

```bash
node --check .skills/cms-content-migration/scripts/cms-import.mjs
node --check .skills/cms-content-migration/scripts/yuque-export.mjs
node --check .skills/cms-content-migration/scripts/yuque-fs-to-migration.mjs
node --check .skills/cms-content-migration/scripts/yuque-classify.mjs
node --check .skills/cms-content-migration/scripts/cms-status.mjs
python3 /Users/zhouxia/.codex/skills/.system/skill-creator/scripts/quick_validate.py .skills/cms-content-migration
```

涉及项目代码或文档规则变化时，再执行：

```bash
pnpm -C apps/web check
pnpm -C apps/web build
```
