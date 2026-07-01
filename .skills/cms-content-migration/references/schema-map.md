# CMS Schema Map

## Collections

公开内容集合：

- `posts`
- `podcast`
- `knowledge`
- `topics`
- `projects`
- `resources`
- `glossary`
- `timeline`

共享字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `title` | string | 是 | 标题 |
| `description` | string | 是 | 列表、SEO、搜索摘要 |
| `lang` | `zh-CN` / `en` | 是 | 当前默认 `zh-CN` |
| `translationKey` | string | 是 | 多语言关联键；只有中文也要写 |
| `slug` | string | 是 | URL 路径段，同 collection 内应唯一 |
| `status` | `draft` / `published` / `archived` | 是 | 迁移默认用 `draft` |
| `featured` | boolean | 否 | 默认 `false` |
| `date` | date string | 按 collection | 建议 `YYYY-MM-DD` |
| `updated` | date string | 否 | 有明显修订再写 |
| `tags` | string[] | 否 | 默认 `[]` |

## Collection 字段

### posts

必填：共享字段 + `date` + `category`

可选：

- `series`
- `cover`：图片上传到 `media`
- `bodyMarkdown`：脚本转成 Payload Lexical `content`
- `contentBlocks`

### podcast

必填：共享字段 + `date` + `episode` + `audio` 或 `audioFile`

字段：

- `season`：默认 `1`
- `audio`：兼容本地内容，脚本映射到 CMS `audioFile`
- `audioFile`：音频上传到 `media`
- `duration`
- `cover`：图片上传到 `media`
- `transcript`：默认 `true`
- `hosts`：默认 `[]`
- `guests`：默认 `[]`
- `timeline`：`{ time, label }[]`
- `resources`：`{ label, url?, file?, note? }[]`

### knowledge

必填：共享字段 + `area`

字段：

- `area`：`ai-agent` / `architecture` / `data-engineering` / `frontend` / `product` / `operations` / `management` / `tools`
- `level`：`basic` / `intermediate` / `advanced`，默认 `intermediate`
- `order`
- `bodyMarkdown`
- `contentBlocks`

### topics

必填：共享字段

字段：

- `hero`：图片上传到 `media`
- `items`：关联内容 slug、URL 或 translationKey 数组，默认 `[]`
- `bodyMarkdown`
- `contentBlocks`

### projects

必填：共享字段

字段：

- `cover`：图片上传到 `media`
- `role`
- `stack`：默认 `[]`
- `links`：`{ label, url }[]`
- `bodyMarkdown`
- `contentBlocks`

### resources

必填：共享字段 + `type`

字段：

- `type`：`tool` / `book` / `article` / `video` / `repo` / `course`
- `cover`：图片上传到 `media`
- `url`：外部链接
- `asset`：站内附件上传到 `media`
- `bodyMarkdown`

如果 `url` 是本地文件路径，脚本会改走 `asset` 上传，并移除 `url`。

### glossary

必填：共享字段

字段：

- `aliases`：默认 `[]`
- `bodyMarkdown`

### timeline

必填：共享字段 + `date`

字段：

- `kind`：`milestone` / `release` / `learning`，默认 `milestone`
- `bodyMarkdown`

## Blocks

标准导入 JSON 使用前台契约名，脚本会转换为 Payload blockType：

| 输入 `type` | Payload `blockType` | 关键字段 |
|---|---|---|
| `callout` | `calloutBlock` | `variant`, `title`, `content` |
| `code` | `codeBlock` | `language`, `filename`, `code` |
| `audio` | `audioBlock` | `src` 或 `file`, `title`, `duration`, `download` |
| `image` | `imageBlock` | `src` 或 `image`, `alt`, `caption`, `source` |
| `quote` | `quoteBlock` | `content`, `author`, `source`, `url` |
| `embed` | `embedBlock` | `src`, `title`, `ratio` |
| `steps` | `stepsBlock` | `title`, `items` |
| `statGrid` | `statGridBlock` | `columns`, `items` |
| `compareTable` | `compareTableBlock` | `caption`, `columns`, `rows` |

媒体型 block 的 `src`、`file`、`image`、`download` 如果是本地文件，会上传到 `media`。
