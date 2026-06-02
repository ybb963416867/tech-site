# Notes

一个极简技术风格的 Astro Markdown 技术博客，用来沉淀个人技术笔记、工程经验和知识目录。

内置能力：

- Markdown 自动生成文章
- 自动补齐文章 frontmatter
- 多级目录自动生成专栏
- 文章目录 TOC
- 深色模式
- 标签分类
- RSS
- Pagefind 搜索
- Giscus 评论
- SEO
- sitemap
- robots.txt
- Cloudflare Pages 部署
- GitHub Actions 自动部署
- 响应式设计
- 手机端文件浏览器式专栏目录

## 在线地址

https://yangxiandroid.ccwu.cc/

## 依赖与环境

本地环境：

- Node.js 22，和 GitHub Actions 中的版本保持一致
- npm，项目使用 `package-lock.json`

运行依赖：

- `astro`：静态站点框架
- `@astrojs/rss`：生成 RSS
- `@astrojs/sitemap`：生成 sitemap
- `@pagefind/default-ui`：Pagefind 搜索 UI
- `@lucide/astro`：图标组件

开发与构建依赖：

- `@astrojs/check`：Astro 类型检查
- `typescript`：TypeScript 支持
- `pagefind`：构建后生成全文搜索索引

外部服务：

- GitHub：代码仓库
- GitHub Actions：自动构建与部署
- Cloudflare Pages：静态站点托管
- Giscus：文章评论，依赖 GitHub Discussions

## 快速开始

安装依赖：

```bash
npm install
```

启动本地开发服务：

```bash
npm run dev
```

检查项目：

```bash
npm run check
```

构建项目：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 项目怎么使用

### 写文章

在 `src/content/blog` 下新建 Markdown 文件。

推荐按照目录组织文章，目录会自动成为专栏：

```text
src/content/blog/Android/系统/HAL/hal体系结构与设计思想-1.md
src/content/blog/Ios/swift/view/SwiftUI Border 完全指南.md
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

### 自动处理普通 Markdown

也可以直接把没有 frontmatter 的普通 Markdown 放进 `src/content/blog`。

运行下面命令会自动补齐标题、摘要、日期、标签，并移除 `[TOC]`：

```bash
npm run posts:normalize
```

下面这些命令会自动先执行文章规范化：

```bash
npm run dev
npm run check
npm run build
```

### 专栏目录

专栏由 `src/content/blog` 下的目录自动生成，支持多级目录、中文目录和特殊目录名：

```text
src/content/blog/Android/系统/HAL/
src/content/blog/c++/
src/content/blog/工作/
```

会生成对应页面：

```text
/categories/Android/
/categories/Android/系统/
/categories/Android/系统/HAL/
/categories/c++/
/categories/工作/
```

`/categories/` 是知识库式浏览页：

- 桌面端：左侧目录树，右侧文章列表
- 手机端：文件浏览器式目录，顶部显示当前目录名
- 子目录会显示为文件夹
- 当前目录直属文章会显示为笔记卡片
- 从手机端目录进入文章详情时，会显示返回目录的顶部栏
- 从文章列表进入文章详情时，保持标准文章详情页样式

### 搜索

首页和文章页提供轻量文章搜索。

匹配范围包括：

- 文章标题
- Markdown 一级标题
- 摘要
- 专栏路径
- 标签
- slug

多个关键词会按全部命中处理，例如：

```text
OpenAI Codex CLI
```

会匹配同时包含这些关键词的文章。

构建后 Pagefind 会为文章正文生成全文搜索索引，索引输出到：

```text
dist/pagefind
```

### 标签、RSS、评论

标签页：

```text
/tags/
```

RSS：

```text
/rss.xml
```

评论使用 Giscus，需要在 `src/site.config.ts` 中配置 GitHub Discussions 信息：

```ts
giscus: {
  repo: 'OWNER/REPO',
  repoId: 'REPLACE_WITH_REPO_ID',
  category: 'Announcements',
  categoryId: 'REPLACE_WITH_CATEGORY_ID'
}
```

## 编译与检查

类型检查：

```bash
npm run check
```

生产构建：

```bash
npm run build
```

构建流程会执行：

```bash
npm run posts:normalize
astro build
pagefind --site dist
```

构建产物目录：

```text
dist
```

Pagefind 搜索索引目录：

```text
dist/pagefind
```

本地预览构建产物：

```bash
npm run preview
```

## 项目部署

项目通过 GitHub Actions 自动部署到 Cloudflare Pages。

当前部署地址：

```text
https://yangxiandroid.ccwu.cc/
```

### Cloudflare Pages 配置

Cloudflare Pages 项目名需要和 GitHub Actions 中保持一致。

当前 workflow 使用：

```bash
pages deploy dist --project-name=my-tech-site
```

对应项目名：

```text
my-tech-site
```

### GitHub Secrets

GitHub 仓库需要配置下面两个 Secrets：

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

### GitHub Repository Variables

建议配置：

```text
SITE_URL=https://yangxiandroid.ccwu.cc/
```

`SITE_URL` 会影响：

- canonical URL
- sitemap
- RSS
- SEO 链接

### 自动部署流程

当代码 push 到 `main` 分支时，会自动执行：

```text
Checkout
Setup Node 22
npm ci
npm run build
Cloudflare Pages deploy dist
```

也可以在 GitHub Actions 页面手动触发 workflow：

```text
workflow_dispatch
```

## 需要修改的配置

站点信息：

```text
src/site.config.ts
```

包括：

- 站点名称
- 描述
- 作者
- 站点 URL
- Giscus 配置

Astro 站点地址：

```text
astro.config.mjs
```

生产环境推荐通过环境变量注入：

```text
SITE_URL
```

GitHub Actions 部署配置：

```text
.github/workflows/deploy.yml
```

需要确认：

- Node.js 版本
- Cloudflare Pages 项目名
- Secrets 名称
- 构建命令

## 提交通知

每次提交代码后，需要整理：

- 本次新增或修改的功能说明
- 验证过的页面 URL
- 构建和检查结果

并发送邮件到：

```text
xxx@xxx.com
```

## 常用命令

```bash
npm install
npm run dev
npm run posts:normalize
npm run check
npm run build
npm run preview
```
