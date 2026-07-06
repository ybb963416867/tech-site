# CLAUDE.md

本文件是 Claude、Codex 以及其他 coding agent 在本仓库中工作的项目说明。修改代码或内容前，请先阅读本文件。

## 项目目标

本项目是个人技术知识库，不是营销网站。

网站应当像一个干净、简洁的技术笔记系统，用于长期积累个人工程知识。相比装饰性展示，更应优先保证笔记可读、导航稳定、内容可搜索、部署可靠。

生产环境 URL：

```text
https://yangxiandroid.ccwu.cc/
```

## 技术栈

- Astro 静态站点
- `src/content/blog` 下的 Astro Markdown 内容集合
- TypeScript
- Pagefind，用于生成全文搜索索引
- Giscus，用于 GitHub Discussions 评论
- `@astrojs/rss`，用于 RSS
- `@astrojs/sitemap`，用于 sitemap
- Lucide 图标
- Cloudflare Pages 托管
- GitHub Actions 部署

## 真实来源

内容结构必须遵循以下真实文件系统目录：

```text
src/content/blog
```

规则：

- 文件夹名称就是栏目/分类名称。
- 嵌套文件夹就是嵌套栏目。
- Markdown 文件名就是笔记标题。
- 已有 frontmatter 中的 `title` 应同步为当前 Markdown 文件名。
- 已有 frontmatter 中的 `category` 应同步为当前父文件夹名称。
- 重命名文件夹或 Markdown 文件后，生成的网站必须更新为匹配当前真实路径。
- 不要保留来自旧文件夹名称的过期虚拟栏目。
- 构建栏目导航时，忽略纯资源文件夹。

诸如 `images`、纯图片文件夹以及其他非笔记资源目录，除非其中包含 Markdown 笔记，否则不应显示为栏目。

## 内容工作流

作者可以直接在 `src/content/blog` 下添加普通 Markdown 文件。

检查或构建前，应先规范化 Markdown 文件：

```bash
npm run posts:normalize
```

规范化脚本应当：

- 在需要时补充缺失的 frontmatter。
- 根据 Markdown 文件名设置 `title`。
- 根据父文件夹名称设置 `category`。
- 保留文章正文内容。
- 如果项目已自动处理目录，则移除不支持的 `[TOC]` 标记。

Markdown 图片引用必须指向已存在的文件。项目提供了内容资源检查：

```bash
npm run content:check-assets
```

当图片缺失时，应清楚报告对应的 Markdown 文件和行号。

## 导航和 UI 规则

网站有两种主要阅读模式：

- 标准文章/归档页面。
- 栏目/分类知识浏览页面。

桌面端分类页面应使用目录树加文章列表。

移动端分类页面应像文件浏览器：

- 顶部标题是当前目录名称。
- 子文件夹显示为文件夹项。
- 当前文件夹下的直属笔记显示为笔记项。
- 文件夹卡片和笔记卡片应匹配当前亮色/暗色主题。
- 从详情页返回后，应避免残留的选中状态、过粗的焦点框和过期的按压样式。

文章详情行为取决于入口来源：

- 如果来自移动端分类目录，文章详情页应显示移动端样式的顶部返回栏，用于返回目录。
- 如果来自文章/归档列表，文章详情页应保持标准文章布局。

移动端浏览器的侧滑/返回导航不应被 JavaScript 滚动恢复干扰。除非特定 bug 需要最小修复，否则优先使用浏览器原生 history 和 bfcache 行为。

## 搜索规则

首页和文章归档搜索应匹配：

- 文章标题
- Markdown 标题/标题文本
- 描述
- 栏目路径
- 标签
- Slug

搜索应容忍空格、大小写差异，以及常见分隔符，例如 `-`、`_` 和 `/`。

生产构建后，Pagefind 会为生成的网站建立索引：

```bash
pagefind --site dist
```

## 构建和检查

使用 Node.js 22，与 GitHub Actions 保持一致。

常用命令：

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

当前重要脚本：

```bash
npm run posts:normalize
npm run content:check-assets
npm run check
npm run build
```

`npm run check` 应清理 Astro 缓存、规范化文章、检查 Markdown 资源，然后运行 Astro check。

`npm run build` 应清理生成的构建产物、规范化文章、检查 Markdown 资源、构建 Astro，然后生成 Pagefind 索引。

进行本地网络测试时，开发脚本包装器应将参数透传给 Astro：

```bash
npm run dev -- --host
npm run dev -- --host 0.0.0.0
```

## 部署

部署由 GitHub Actions 在推送到 `main` 时处理，也可以通过 `workflow_dispatch` 手动触发。

工作流应当：

- 检出仓库。
- 使用 Node.js 22。
- 运行 `npm ci`。
- 运行 `npm run build`。
- 将 `dist` 部署到 Cloudflare Pages。

Cloudflare Pages 项目名称：

```text
my-tech-site
```

必需的 GitHub Secrets：

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

推荐的 GitHub Repository Variable：

```text
SITE_URL=https://yangxiandroid.ccwu.cc/
```

`SITE_URL` 会影响 canonical URL、RSS、sitemap 和 SEO 元数据。

## Git 和提交规则

提交前：

- 查看 `git status --short`。
- 只暂存与当前任务相关的文件。
- 不要把无关的用户编辑混入提交。
- 除非用户明确要求，否则不要还原用户改动。
- 针对此次修改运行最小且有用的验证。

对于代码、内容生成、构建或 UI 修改，优先运行：

```bash
npm run check
npm run build
```

对于仅文档修改，做一次 Markdown 基本检查即可，除非用户要求完整构建。

除非用户明确要求 push，否则不要推送。

## 提交通知规则

每次提交后，准备一段简短通知，包含：

- 新增或修改的功能。
- 已检查的页面或本地 URL。
- 检查/构建结果。
- 任何重要注意事项。

将通知发送到：

```text
binbingyang948@gmail.com
```

如果没有浏览网页，应说明未浏览任何 web URL，并只列出本地验证命令。

## 安全规则

- 绝不要提交真实 token、API key、密码或私有凭据。
- 不要把 GitHub PAT 写入 Markdown 文章、README 文件、提交信息或日志。
- 保持 `.env` 被忽略。
- 保持 `.env.example` 安全，不包含任何密钥。
- 除非用户明确要求，否则不要删除大量用户内容。
- 将 Markdown 笔记和本地图片视为用户拥有的内容。
