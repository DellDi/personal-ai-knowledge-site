export const locales = ['zh-CN', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

export const localeLabels: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocalePath(locale: Locale, path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

export function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && isLocale(parts[0])) {
    parts[0] = nextLocale;
    return `/${parts.join('/')}${pathname.endsWith('/') ? '/' : ''}`;
  }
  return `/${nextLocale}/`;
}

type NavItem = {
  label: string;
  href: string;
};

export const ui = {
  'zh-CN': {
    siteName: 'DellDi的信息内容栈',
    siteDescription: '用于呈现个人品牌、项目实践、知识体系与技能储备的个人内容站。',
    skipToContent: '跳到正文',
    brandPrimary: 'DellDi',
    brandSecondary: '信息内容栈',
    footerKicker: '个人内容站',
    nav: [
      { label: '首页', href: '/' },
      { label: '播客', href: '/podcast' },
      { label: '文章', href: '/posts' },
      { label: '知识库', href: '/knowledge' },
      { label: '专题', href: '/topics' },
      { label: '项目', href: '/projects' },
      { label: '资源', href: '/resources' },
      { label: '术语', href: '/glossary' },
      { label: '搜索', href: '/search' },
    ] satisfies NavItem[],
    homeKicker: 'Astro 内容平台',
    homeTitle: 'DellDi的信息内容栈',
    homeIntro:
      '第一版先服务个人展示和自我沉淀：对外呈现我是谁、在做什么、积累了哪些 AI/工程/产品实践，以及后续可复用的知识资产。',
    featured: '精选内容',
    latestPodcast: '最新播客',
    latestPosts: '最新文章',
    knowledgeAreas: '知识库区域',
    knowledgeAreasDescription: 'AI Agent / 工程架构 / 数据工程 / 前端工程 / 产品方法 / 运营管理',
    knowledgeCta: '进入知识库',
    searchCta: '全站搜索',
    projectsTitle: '项目案例',
    timelineTitle: '时间线',
    empty: '当前语言下还没有公开内容。',
    readMore: '阅读全文',
    listen: '收听本期',
    backHome: '返回首页',
    searchPlaceholder: '搜索文章、播客、知识库和项目',
    searchEmpty: '输入关键词后开始搜索。生产构建后会加载 Pagefind 索引。',
    noSearchResults: '没有找到匹配内容。',
    podcastDescription: '音频节目、文字稿、时间轴和本期提到的资源。',
    postsDescription: '围绕 AI、工程架构、数据系统、产品建设和个人知识管理的长文记录。',
    knowledgeDescription: '长期维护的排查手册、方法论、架构记录和实践文档。',
    topicsDescription: '把分散的文章、播客、项目和知识库内容串成连续专题。',
    projectsDescription: '项目复盘、产品实践、架构方案和可复用的落地经验。',
    resourcesDescription: '面向实践的工具、文档、书单、仓库和课程资料。',
    glossaryDescription: '整理 AI、数据、工程、产品和 Agent 相关术语。',
    timelineDescription: '记录内容、产品和平台能力的演进过程。',
    tagDescription: '这个标签下的已发布内容。',
    topicLinkedItems: '关联内容',
    projectFallbackRole: '项目实践',
    openResource: '打开资源',
    podcastRss: '播客 RSS',
    adminTitle: '后台管理预留',
    adminIntro: '这里是未来内容运营后台的预留入口，当前只保留信息架构，不包含登录、写入或管理能力。',
    adminCmsLink: '进入 CMS 后台',
    adminCmsLinkHint: '在 cms 子域独立部署，负责内容编辑、草稿、审核和媒体库。',
    adminStatusTitle: '当前状态',
    adminStatusPosts: '文章',
    adminStatusMode: '数据源',
    adminStatusModeLocal: '本地 MDX',
    adminStatusModeCms: 'CMS API',
    adminStatusModeUnreachable: 'CMS 不可达',
    adminStatusGuide: '设置环境变量 CMS_API_URL 后，posts 集合从 Payload 拉取内容；未设置时使用本地 MDX。',
    relatedTitle: '相关内容',
    knowledgeTreeTitle: '知识库目录',
    knowledgeTreeToggle: '展开 / 收起目录',
    podcastTimeline: '时间轴',
    podcastResources: '本期资源',
    podcastTranscript: '文字稿',
    prevEntry: '上一篇',
    nextEntry: '下一篇',
  },
  en: {
    siteName: "DellDi's Information Content Stack",
    siteDescription: 'A personal content site for brand presence, project practice, knowledge assets, and skill inventory.',
    skipToContent: 'Skip to content',
    brandPrimary: 'DellDi',
    brandSecondary: "Information Content Stack",
    footerKicker: 'Personal content site',
    nav: [
      { label: 'Home', href: '/' },
      { label: 'Podcast', href: '/podcast' },
      { label: 'Posts', href: '/posts' },
      { label: 'Knowledge', href: '/knowledge' },
      { label: 'Topics', href: '/topics' },
      { label: 'Projects', href: '/projects' },
      { label: 'Resources', href: '/resources' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'Search', href: '/search' },
    ] satisfies NavItem[],
    homeKicker: "DellDi's Information Content And Knowledge Stack",
    homeTitle: "DellDi's Information Content And Knowledge Stack",
    homeIntro:
      'This site exists to present the owner, archive personal work, and keep reusable knowledge visible over time.',
    featured: 'Featured',
    latestPodcast: 'Latest podcast',
    latestPosts: 'Latest posts',
    knowledgeAreas: 'Knowledge areas',
    knowledgeAreasDescription: 'AI agents / architecture / data engineering / frontend / product / operations',
    knowledgeCta: 'Knowledge base',
    searchCta: 'Search',
    projectsTitle: 'Project cases',
    timelineTitle: 'Timeline',
    empty: 'No English content yet. Please use the Chinese section first.',
    readMore: 'Read more',
    listen: 'Listen',
    backHome: 'Back home',
    searchPlaceholder: 'Search posts, podcasts, knowledge, and projects',
    searchEmpty: 'Search is available after production build. Chinese content is the primary index.',
    noSearchResults: 'No results found.',
    podcastDescription: 'Audio episodes, transcripts, timelines, and referenced resources.',
    postsDescription: 'Long-form notes on AI, engineering, data systems, product building, and knowledge management.',
    knowledgeDescription: 'Stable playbooks, troubleshooting notes, methods, and architecture records.',
    topicsDescription: 'Topic trails are reserved here; Chinese topic content is maintained first.',
    projectsDescription: 'Project reviews, product practices, architecture plans, and reusable lessons.',
    resourcesDescription: 'Practical tools, docs, books, repos, and courses.',
    glossaryDescription: 'Terms for AI, data, engineering, product, and agent workflows.',
    timelineDescription: 'A dated trail reserved for platform evolution summaries.',
    tagDescription: 'Published content connected by this tag. Chinese tags are maintained first.',
    topicLinkedItems: 'linked items',
    projectFallbackRole: 'Project practice',
    openResource: 'Open resource',
    podcastRss: 'Podcast RSS',
    adminTitle: 'Admin Reserved',
    adminIntro: 'A reserved entry for future editorial operations. Chinese content operations are the priority.',
    adminCmsLink: 'Open CMS admin',
    adminCmsLinkHint: 'Deployed on the cms subdomain. Handles content editing, drafts, review, and media.',
    adminStatusTitle: 'Current status',
    adminStatusPosts: 'Posts',
    adminStatusMode: 'Data source',
    adminStatusModeLocal: 'Local MDX',
    adminStatusModeCms: 'CMS API',
    adminStatusModeUnreachable: 'CMS unreachable',
    adminStatusGuide: 'Set CMS_API_URL to load posts from Payload. Falls back to local MDX when unset.',
    relatedTitle: 'Related content',
    knowledgeTreeTitle: 'Knowledge index',
    knowledgeTreeToggle: 'Toggle index',
    podcastTimeline: 'Timeline',
    podcastResources: 'Episode resources',
    podcastTranscript: 'Transcript',
    prevEntry: 'Previous',
    nextEntry: 'Next',
  },
} as const;
