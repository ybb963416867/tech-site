---
title: Astro 技术博客启动笔记
description: 用 Astro、Markdown、RSS、Pagefind 和 Giscus 搭建一个可部署的极简技术博客。
pubDate: 2026-05-28
category: Astro
tags: [Astro, Markdown, Blog]
draft: false
---

## 为什么选 Astro

Astro 很适合技术博客：默认输出静态 HTML，内容可以直接写 Markdown，首屏速度快，部署到 Cloudflare Pages 也很自然。

## 已经内置的能力

- Markdown 文件自动生成文章页面
- 文章页自动目录
- 标签页和标签归档
- RSS、sitemap、robots.txt
- Pagefind 静态搜索
- Giscus 评论占位
- GitHub Actions 部署到 Cloudflare Pages

## 写新文章

在 `src/content/blog` 下新建一个 `.md` 文件，补齐 frontmatter 即可：

```md
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-05-28
tags: [Astro, Notes]
draft: false
---
```

## 下一步

把 `src/site.config.ts` 里的站点地址、作者、Giscus 仓库信息替换成你自己的配置，然后推送到 GitHub。
