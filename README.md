# Kernel Notes

一个极简技术风格的 Astro Markdown 博客模板，内置文章自动生成、TOC、深色模式、标签、RSS、Pagefind 搜索、Giscus 评论、SEO、sitemap、robots.txt、Cloudflare Pages 和 GitHub Actions 部署。

## 本地开发

```bash
npm install
npm run dev
```

## 写文章

在 `src/content/blog` 下新建 Markdown 文件：

```md
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-05-28
category: Swift
tags: [Astro, Notes]
draft: false
---
```

生产环境会隐藏 `draft: true` 的文章。

也可以直接把没有 frontmatter 的普通 Markdown 放进 `src/content/blog`。运行下面命令会自动补齐标题、摘要、日期、标签并移除 `[TOC]`：

```bash
npm run posts:normalize
```

`npm run dev`、`npm run check` 和 `npm run build` 也会先自动执行这一步。

## 专栏

文章可以通过 `category` 字段归入专栏：

```md
category: Swift
```

如果普通 Markdown 没有 frontmatter，自动转换会优先用文件夹名作为专栏。例如：

```text
src/content/blog/Swift/Swift Array API 完整指南.md
```

会自动生成：

```md
category: "Swift"
```

## 构建

```bash
npm run build
```

构建流程会执行 `astro build`，然后用 Pagefind 为 `dist` 生成搜索索引。

## 需要替换的配置

- `src/site.config.ts`：站点名称、描述、作者、站点 URL、Giscus 配置
- `astro.config.mjs`：生产站点地址可通过 `SITE_URL` 环境变量注入
- `.github/workflows/deploy.yml`：把 `my-tech-site` 改成你的 Cloudflare Pages 项目名

## GitHub Secrets

GitHub Actions 部署需要：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

可选 GitHub repository variable：

- `SITE_URL`
