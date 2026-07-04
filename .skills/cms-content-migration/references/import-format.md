# Import Format

## 环境变量

脚本读取：

- `CMS_API_URL`：Payload REST API 基址，例如 `http://127.0.0.1:3000/api`
- `CMS_API_TOKEN`：Payload JWT token
- `CMS_API_AUTH_SCHEME`：默认 `JWT`，也可用命令行 `--auth-scheme Bearer`

写入生产时不要把 token 写进文件或提交到 Git。

## 标准 JSON

单 collection：

```json
{
  "collection": "posts",
  "mode": "upsert",
  "defaults": {
    "lang": "zh-CN",
    "status": "draft",
    "featured": false
  },
  "docs": [
    {
      "title": "文章标题",
      "description": "文章摘要",
      "translationKey": "article-key",
      "slug": "article-slug",
      "date": "2026-07-01",
      "tags": ["AI Agent"],
      "category": "工程实践",
      "cover": "./cover.png",
      "bodyMarkdown": "## 小标题\n\n正文内容。"
    }
  ]
}
```

多 collection：

```json
{
  "mode": "upsert",
  "defaults": {
    "lang": "zh-CN",
    "status": "draft"
  },
  "batches": [
    {
      "collection": "posts",
      "docs": []
    },
    {
      "collection": "resources",
      "docs": []
    }
  ]
}
```

也可以传数组，但每条必须包含 `collection`，或命令行提供 `--collection`。

## 语雀导出输入

先用语雀导出脚本生成标准 JSON：

```bash
YUQUE_TOKEN="***" node .skills/cms-content-migration/scripts/yuque-export.mjs \
  --repo-url "https://www.yuque.com/<user-or-group>/<repo>" \
  --collection knowledge \
  --knowledge-area tools \
  --out migrations/yuque
```

然后把生成的 `migration.json` 交给 CMS 导入脚本：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs \
  --input migrations/yuque/migration.json \
  --dry-run \
  --print-json
```

如果输入来自 `yuque-exporter` 的本地 Markdown 导出目录：

```bash
node .skills/cms-content-migration/scripts/yuque-fs-to-migration.mjs \
  --from migrations/yuque-raw \
  --include-dir "综合知识库,AI专题" \
  --collection knowledge \
  --knowledge-area tools \
  --out migrations/yuque-exporter/migration.json
```

`--include-dir` 和 `--exclude-dir` 匹配导出目录的第一层目录名，适合在全量导出后只迁移部分语雀知识库。

如果希望让 LLM 自动判断目标 CMS 模块，先生成复核清单和多 collection migration：

```bash
DEEPSEEK_API_KEY="***" node .skills/cms-content-migration/scripts/yuque-classify.mjs \
  --from migrations/yuque-raw \
  --include-dir "综合知识库,AI专题" \
  --out migrations/yuque-classified/migration.json \
  --review-out migrations/yuque-classified/review.json
```

`yuque-classify.mjs` 默认只输出 `draft`，并生成 `review.json` 供人工检查。确认 `review.json` 中 collection、置信度和理由后，再把 `migration.json` 交给 `cms-import.mjs --dry-run`。

语雀导出脚本默认把文档导入目标设为 `knowledge`，并给所有文档加 `语雀` 和知识库名称作为标签。若要导为文章，传：

```bash
YUQUE_TOKEN="***" node .skills/cms-content-migration/scripts/yuque-export.mjs \
  --namespace "<user-or-group>/<repo>" \
  --collection posts \
  --category "知识沉淀"
```

## Markdown/MDX 输入

从本地内容目录迁移：

```bash
node .skills/cms-content-migration/scripts/cms-import.mjs \
  --from-md apps/web/src/content/posts/zh-CN \
  --collection posts \
  --dry-run \
  --print-json
```

如果路径形如 `apps/web/src/content/<collection>/...`，脚本能推断 collection；显式传 `--collection` 更稳。

frontmatter 会映射为 collection 字段，正文会写入 `bodyMarkdown` 并转换为 Payload Lexical `content`。

## 媒体路径

支持：

- `./image.png`：相对 Markdown 文件目录
- `../assets/file.pdf`：相对 Markdown 文件目录
- `/images/posts/cover.svg`：相对 `apps/web/public`
- `https://example.com/image.png`：默认保留远程链接；加 `--upload-remote-media` 才下载上传

不上传：

- `/zh-CN/...`
- `/en/...`
- `#anchor`
- `mailto:...`
- `tel:...`

## Upsert 规则

写入时按 `lang + slug` 查询已有文档：

- 找到：`PATCH /api/<collection>/<id>`
- 未找到：`POST /api/<collection>`

这可以反复执行同一份导入文件，适合迭代修正。

## 发布策略

默认 `status=draft`。不要在大批量导入时使用 `--publish`，因为 `published` 会触发发布 webhook 和前台重建。

推荐流程：

1. dry-run
2. `--apply` 导入为 draft
3. CMS 后台抽查草稿
4. 用 `cms-status.mjs --status published --dry-run` 检查批量发布计划
5. 用 `cms-status.mjs --status published --apply` 分批改为 published
6. 最后触发一次前台重建

批量状态脚本按 `lang + slug` 查找已导入文档，只 PATCH `status` 字段：

```bash
CMS_API_URL="https://cms.example.com/api" \
CMS_API_TOKEN="$CMS_API_TOKEN" \
node .skills/cms-content-migration/scripts/cms-status.mjs \
  --input migrations/yuque-classified/ai-topic.safe.migration.json \
  --status published \
  --dry-run
```

可用 `--only knowledge,posts` 只处理部分 collection；可用 `--status draft` 把同一批内容回滚为草稿。

## 常见问题

### 播客音频

本地旧字段 `audio` 会映射到 CMS 的 `audioFile`。CMS 要求它是上传关系，所以本地音频文件必须存在；远程音频只有在 `--upload-remote-media` 时才会下载上传。

### Markdown 图片

正文图片会变成 `imageBlock`，不直接塞进 Lexical richText。这样更贴近当前 Payload CMS 的 media/upload 字段设计。

### 附件链接

`[下载 PDF](./file.pdf)` 会上传到 `media`，链接替换为 CMS 返回的 URL。

### 复杂 MDX

脚本只做基础 Markdown 转换。复杂 MDX 组件应由智能体整理成 `contentBlocks`，再用标准 JSON 导入。
