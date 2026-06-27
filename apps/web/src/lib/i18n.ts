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
    siteName: 'Personal AI Knowledge Site',
    siteDescription: '面向 AI、工程、产品与个人知识管理的内容平台。',
    skipToContent: '跳到正文',
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
    homeTitle: '把品牌展示、播客、博客和知识库组织成一个可检索的内容系统。',
    homeIntro:
      '这是一个静态优先、双语、支持黑夜模式的内容平台底座，后续可扩展到 CMS、评论、AI RAG 和后台管理。',
    featured: '精选内容',
    latestPodcast: '最新播客',
    latestPosts: '最新文章',
    knowledgeAreas: '知识库区域',
    empty: '当前语言下还没有公开内容。',
    readMore: '阅读全文',
    listen: '收听本期',
    backHome: '返回首页',
    searchPlaceholder: '搜索文章、播客、知识库和项目',
    searchEmpty: '输入关键词后开始搜索。生产构建后会加载 Pagefind 索引。',
    adminTitle: '后台管理预留',
    adminIntro: '这里是未来内容运营后台的静态壳页面，当前不包含登录、写入或管理能力。',
  },
  en: {
    siteName: 'Personal AI Knowledge Site',
    siteDescription: 'A content platform for AI, engineering, product thinking, and personal knowledge.',
    skipToContent: 'Skip to content',
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
    homeKicker: 'Astro Content Platform',
    homeTitle: 'A searchable home for brand, podcast, blog, and long-lived knowledge.',
    homeIntro:
      'A static-first, bilingual platform foundation with a dedicated dark theme and room for CMS, comments, AI retrieval, and admin workflows.',
    featured: 'Featured',
    latestPodcast: 'Latest podcast',
    latestPosts: 'Latest posts',
    knowledgeAreas: 'Knowledge areas',
    empty: 'No published content in this language yet.',
    readMore: 'Read more',
    listen: 'Listen',
    backHome: 'Back home',
    searchPlaceholder: 'Search posts, podcasts, knowledge, and projects',
    searchEmpty: 'Type a query to search. Pagefind loads after a production build.',
    adminTitle: 'Admin Reserved',
    adminIntro: 'This is a static shell for future editorial operations. It does not include auth, writes, or management features yet.',
  },
} as const;
