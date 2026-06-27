# Content Model

## Collections

- `podcast`
- `posts`
- `knowledge`
- `topics`
- `projects`
- `resources`
- `glossary`
- `timeline`

## Common Fields

- `title`
- `description`
- `lang`
- `translationKey`
- `slug`
- `date`
- `updated`
- `tags`
- `status`
- `featured`

## Public Rule

Only `status: published` content can appear in public pages, RSS feeds, search surfaces, and tags.

## Translation Rule

Content translations share a `translationKey`. URLs remain explicit per locale:

- `/zh-CN/posts/example`
- `/en/posts/example`
