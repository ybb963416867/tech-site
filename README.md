# Notes

一个极简技术风格的 Astro Markdown 博客模板，内置文章自动生成、TOC、深色模式、标签、RSS、Pagefind 搜索、Giscus 评论、SEO、sitemap、robots.txt、Cloudflare Pages 和 GitHub Actions 部署。

## 在线地址

https://yangxiandroid.ccwu.cc/

## 本地开发

```bash
npm install
npm run dev
```

## 写文章

在 `src/content/blog` 下新建 Markdown 文件。推荐按目录组织文章，目录会自动成为专栏：

```text
src/content/blog/Android/系统/HAL/hal体系结构与设计思想-1.md
src/content/blog/Ios/swift/view/SwiftUI Border 完全指南 🚀.md
src/content/blog/ai/codex/codex_cli_guide.md
```

Markdown frontmatter 示例：

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

专栏由 `src/content/blog` 下的目录自动生成，支持多级目录和中文路径：

```text
src/content/blog/Android/系统/HAL/
```

会生成：

```text
/categories/Android/
/categories/Android/系统/
/categories/Android/系统/HAL/
```

`/categories/` 是知识库式浏览页：左侧是目录树，右侧是文章卡片网格。默认只展开顶层目录；进入某个栏目页时，会自动展开当前路径相关的父级目录。点击目录名前的小三角只展开或收起子目录和文章，点击目录名称则进入对应专栏页。

空目录也会显示为专栏。开发服务会监听 `src/content/blog` 下目录的新增和删除，并触发页面刷新。修改 `astro.config.mjs` 后需要重启开发服务。

没有放进目录的旧文章仍会使用 frontmatter 里的 `category` 作为兜底专栏。

手机端的 `/categories/` 会切换成文件浏览器式目录：顶部显示当前目录名，下方优先显示子目录，再显示当前目录直属笔记。从目录进入笔记详情时会显示返回键；从文章列表进入详情时仍保持标准文章页样式。

## 搜索

首页搜索使用 Pagefind，构建后会索引带 `data-pagefind-body` 的文章详情页正文，适合全文搜索。

文章栏目 `/blog/` 使用轻量列表搜索，输入后即时过滤当前文章列表。匹配范围包括文章标题、摘要、专栏路径、标签和 slug；多个关键词按全部命中处理，例如 `OpenAI Codex CLI` 会匹配同时包含这几个词的文章。搜索后可点击“显示全部”清空关键词并恢复完整列表。

## 提交通知

每次提交代码后，需要整理本次新增功能说明和验证/浏览过的页面 URL，并通过邮件发送给：

```text
binbingyang948@gmail.com
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
