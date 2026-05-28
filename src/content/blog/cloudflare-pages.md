---
title: Cloudflare Pages 部署要点
description: Astro 静态博客部署到 Cloudflare Pages 时需要关注的环境变量、构建命令和自动部署配置。
pubDate: 2026-05-28
category: Deploy
tags: [Cloudflare, Deploy, GitHub Actions]
draft: false
---

## 构建命令

本项目的构建命令是：

```bash
npm run build
```

它会先执行 `astro build`，再用 Pagefind 为 `dist` 目录生成搜索索引。

## 输出目录

Cloudflare Pages 的输出目录设置为：

```txt
dist
```

## GitHub Actions

仓库里已经包含 `.github/workflows/deploy.yml`。你需要在 GitHub 仓库设置里添加这些 secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

同时在 workflow 里把 `projectName` 改成你的 Cloudflare Pages 项目名。
