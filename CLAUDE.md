# CLAUDE.md

This file is the project brief for Claude, Codex, and other coding agents working on this repository. Read it before changing code or content.

## Project Goal

This project is a personal technical knowledge base, not a marketing website.

The site should feel like a clean, minimal technical notes system for long-term personal engineering accumulation. Prioritize readable notes, stable navigation, searchable content, and reliable deployment over decorative presentation.

Production URL:

```text
https://yangxiandroid.ccwu.cc/
```

## Tech Stack

- Astro static site
- Astro Markdown content collection under `src/content/blog`
- TypeScript
- Pagefind for generated full-text search index
- Giscus for GitHub Discussions comments
- `@astrojs/rss` for RSS
- `@astrojs/sitemap` for sitemap
- Lucide icons
- Cloudflare Pages hosting
- GitHub Actions deployment

## Source of Truth

Content structure must follow the real filesystem under:

```text
src/content/blog
```

Rules:

- Folder names are column/category names.
- Nested folders are nested columns.
- Markdown file names are note titles.
- Existing frontmatter `title` should be synchronized to the current Markdown file name.
- Existing frontmatter `category` should be synchronized to the current parent folder name.
- Renaming folders or Markdown files must update the generated site to match the current real paths.
- Do not keep stale virtual columns from old folder names.
- Ignore pure asset folders when building column navigation.

Resource folders such as `images`, image-only folders, and other non-note asset directories should not appear as columns unless they contain Markdown notes.

## Content Workflow

Authors can add ordinary Markdown files directly under `src/content/blog`.

Before checking or building, Markdown files should be normalized:

```bash
npm run posts:normalize
```

The normalizer should:

- Add missing frontmatter when needed.
- Set `title` from the Markdown file name.
- Set `category` from the parent folder name.
- Preserve article body content.
- Remove unsupported `[TOC]` markers if the project handles TOC automatically.

Markdown image references must point to existing files. The project has a content asset check:

```bash
npm run content:check-assets
```

When an image is missing, report the Markdown file and line number clearly.

## Navigation And UI Rules

The site has two main reading modes:

- Standard article/archive pages.
- Column/category knowledge browsing pages.

Desktop category pages should use a directory tree plus article list.

Mobile category pages should feel like a file browser:

- The top title is the current directory name.
- Child folders appear as folder items.
- Direct notes in the current folder appear as note items.
- Folder and note cards should match the current light/dark theme.
- Avoid sticky selected states, thick focus boxes, and stale pressed styles after returning from a detail page.

Article detail behavior depends on entry source:

- From a mobile category directory, article detail should show the mobile-style top return bar back to the directory.
- From the article/archive list, article detail should keep the standard article layout.

Mobile browser side-swipe/back navigation should not be disturbed by JavaScript scroll restoration. Prefer native browser history and bfcache behavior unless a specific bug requires a minimal fix.

## Search Rules

Home and article archive search should match:

- Article title
- Markdown heading/title text
- Description
- Column path
- Tags
- Slug

Search should tolerate spaces, case differences, and common separators such as `-`, `_`, and `/`.

After production build, Pagefind indexes the generated site:

```bash
pagefind --site dist
```

## Build And Check

Use Node.js 22, matching GitHub Actions.

Common commands:

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

Current important scripts:

```bash
npm run posts:normalize
npm run content:check-assets
npm run check
npm run build
```

`npm run check` should clean Astro cache, normalize posts, check Markdown assets, then run Astro check.

`npm run build` should clean generated build output, normalize posts, check Markdown assets, build Astro, then generate the Pagefind index.

For local network testing, the dev wrapper should pass arguments through to Astro:

```bash
npm run dev -- --host
npm run dev -- --host 0.0.0.0
```

## Deployment

Deployment is handled by GitHub Actions on push to `main`, and can also be triggered manually with `workflow_dispatch`.

The workflow should:

- Checkout the repository.
- Use Node.js 22.
- Run `npm ci`.
- Run `npm run build`.
- Deploy `dist` to Cloudflare Pages.

Cloudflare Pages project name:

```text
my-tech-site
```

Required GitHub Secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Recommended GitHub Repository Variable:

```text
SITE_URL=https://yangxiandroid.ccwu.cc/
```

`SITE_URL` affects canonical URLs, RSS, sitemap, and SEO metadata.

## Git And Commit Rules

Before committing:

- Review `git status --short`.
- Stage only files related to the current task.
- Do not mix unrelated user edits into the commit.
- Do not revert user changes unless the user explicitly asks.
- Run the smallest useful verification for the change.

For code, content-generation, build, or UI changes, prefer:

```bash
npm run check
npm run build
```

For documentation-only changes, a Markdown sanity check is enough unless the user asks for a full build.

Do not push unless the user explicitly asks to push.

## Commit Notification Rule

After each commit, prepare a short notification containing:

- New or changed functionality.
- Pages or local URLs that were checked.
- Check/build results.
- Any important caveats.

Send the notification to:

```text
binbingyang948@gmail.com
```

If no web pages were browsed, say that no web URLs were browsed and list only local verification commands.

## Safety Rules

- Never commit real tokens, API keys, passwords, or private credentials.
- Do not write GitHub PATs into Markdown articles, README files, commit messages, or logs.
- Keep `.env` ignored.
- Keep `.env.example` safe and free of secrets.
- Do not delete large groups of user content unless the user explicitly requests it.
- Treat Markdown notes and local images as user-owned content.

