export const SITE = {
  title: 'Kernel Notes',
  description: 'A minimal technical blog for engineering notes, systems thinking, and build logs.',
  url: import.meta.env.SITE_URL || 'https://yangxiandroid.ccwu.cc/',
  author: 'yangxi',
  locale: 'zh-CN',
  giscus: {
    repo: 'OWNER/REPO',
    repoId: 'REPLACE_WITH_REPO_ID',
    category: 'Announcements',
    categoryId: 'REPLACE_WITH_CATEGORY_ID',
    mapping: 'pathname',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'bottom',
    lang: 'zh-CN'
  }
} as const;
