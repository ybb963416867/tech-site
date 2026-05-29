---
title: "codex_cli_guide"
description: "Codex CLI 是 OpenAI 推出的终端端 AI 编程 Agent，基于 Rust 构建，完全开源。可直接读取、修改代码文件并执行命令。不同于浏览器端工具，代码始终保留在本地，只有提示词和上下文会发送给模型。 本指南基于 20..."
pubDate: 2026-05-29
category: "codex"
tags: [GitHub Actions, Git, Mac, Shell, Markdown, API, TypeScript, React]
draft: false
---
# OpenAI Codex CLI 使用指南

> Codex CLI 是 OpenAI 推出的终端端 AI 编程 Agent，基于 Rust 构建，完全开源。可直接读取、修改代码文件并执行命令。不同于浏览器端工具，代码始终保留在本地，只有提示词和上下文会发送给模型。
>
> 本指南基于 2026 年 5 月最新版本整理。官方文档：https://developers.openai.com/codex/cli

---

## 目录

1. [产品概述](#产品概述)
2. [安装与配置](#安装与配置)
3. [认证登录](#认证登录)
4. [启动方式](#启动方式)
5. [CLI 子命令](#cli-子命令)
6. [CLI 常用参数](#cli-常用参数)
7. [沙箱模式](#沙箱模式)
8. [审批策略](#审批策略)
9. [Slash 命令（会话内命令）](#slash-命令会话内命令)
10. [键盘快捷键](#键盘快捷键)
11. [AGENTS.md 项目指令文件](#agentsmd-项目指令文件)
12. [配置文件 config.toml](#配置文件-configtoml)
13. [MCP 集成](#mcp-集成)
14. [非交互模式（CI/CD）](#非交互模式cicd)
15. [多模型选择](#多模型选择)
16. [与其他 AI CLI 工具对比](#与其他-ai-cli-工具对比)
17. [常见使用场景示例](#常见使用场景示例)
18. [最佳实践](#最佳实践)

---

## 产品概述

<a id="产品概述"></a>

Codex CLI 于 2025 年 4 月发布，是一款运行在终端的 AI 编程 Agent。核心特性：

- **本地优先**：代码文件不离开本地环境，只发送提示词和上下文
- **Agent 工作流**：不只是生成代码片段，而是规划多步骤、跨文件修改，并执行命令验证结果
- **细粒度权限控制**：三种审批模式，从只读咨询到完全自主操作均可配置
- **会话持久化**：本地保存历史会话，可随时恢复
- **内置代码审查**：`/review` 命令可对比分支差异，直接分析工作区变更
- **OS 级沙箱**：macOS 使用 Seatbelt，Linux 使用 Bubblewrap，安全执行命令

---

## 安装与配置

<a id="安装与配置"></a>

### 系统要求

| 要求 | 说明 |
|------|------|
| Node.js | 22+ （npm 安装方式必需） |
| 操作系统 | macOS / Linux 完整支持；Windows 通过 WSL2 支持 |
| 内存 | 最低 4 GB，大型项目推荐 8 GB |
| 磁盘 | 安装包约 50 MB，会话数据存储在 `~/.codex/` |
| 网络 | API 调用需要网络，代码文件本地处理 |

### 安装

```bash
# 方式一：npm 安装（跨平台推荐）
npm install -g @openai/codex

# 方式二：Homebrew（macOS）
brew install --cask codex

# 升级到最新版本
npm install -g @openai/codex@latest

# 验证安装
codex --version
```

### Windows（WSL2）

```bash
# 在 WSL2 中安装 Node.js 22+，再执行
npm install -g @openai/codex

# Windows 文件路径访问
# 工作目录建议在 WSL 文件系统内（~/projects/），性能更好
# Windows 文件可通过 /mnt/c/ 访问
```

---

## 认证登录

<a id="认证登录"></a>

Codex 支持两种认证方式：

### 方式一：ChatGPT 账户（推荐）

ChatGPT Plus、Pro、Business、Edu、Enterprise 订阅均包含 Codex CLI，无需额外费用。

```bash
# 启动后按提示完成浏览器登录
codex

# 设备码登录（无 GUI 环境/SSH）
codex login --device-auth
```

### 方式二：API Key（适合 CI/CD 自动化）

```bash
# 设置环境变量
export OPENAI_API_KEY="sk-..."

# 或通过 stdin 传入
echo $OPENAI_API_KEY | codex login --with-api-key

# 使用 API Key 时跳过交互
codex exec --no-interactive "fix the tests"
```

> ⚠️ **注意**：对于普通到高频使用，订阅方案比按 token 计费的 API Key 更经济。2026 年 4 月起 Business/Enterprise 计划改为基于 token 的积分消费。

---

## 启动方式

<a id="启动方式"></a>

```bash
# 交互式全屏 TUI（最常用）
codex

# 带初始提示词启动
codex "帮我给 UserService 添加单元测试"

# 指定工作目录启动
codex --cd /path/to/project

# 跨多目录协作（如 monorepo）
codex --cd apps/frontend --add-dir ../backend --add-dir ../shared

# 恢复上一个会话
codex resume --last

# 恢复指定会话
codex resume <SESSION_ID>

# Fork 一个会话（克隆到新线程）
codex fork <SESSION_ID>
```

---

## CLI 子命令

<a id="cli-子命令"></a>

| 命令 | 说明 |
|------|------|
| `codex` | 启动交互式 TUI 会话 |
| `codex exec` / `codex e` | 非交互模式，适合脚本/CI |
| `codex review` | 非交互代码审查 |
| `codex resume` | 恢复上一个或指定会话 |
| `codex fork` | Fork 会话到新线程 |
| `codex apply` / `codex a` | 将最新 diff 以 `git apply` 方式应用 |
| `codex login` | 管理认证 |
| `codex mcp` | 管理 MCP 服务器 |
| `codex mcp-server` | 将 Codex 作为 MCP 服务器运行（stdio） |
| `codex sandbox` | 在 Codex 沙箱内运行命令 |
| `codex features list` | 列出所有 feature flags |
| `codex cloud` | 查看和应用 Codex Cloud 任务 |
| `codex app` | 启动桌面应用（macOS） |
| `codex completion bash` | 生成 Shell 补全脚本 |

---

## CLI 常用参数

<a id="cli-常用参数"></a>

### 核心参数

| 参数 | 说明 |
|------|------|
| `-m, --model <MODEL>` | 指定模型（gpt-5.4, gpt-5.4-mini, gpt-5.3-codex） |
| `-i, --image <FILE>` | 附加图片到初始提示词（截图、线框图等） |
| `-C, --cd <DIR>` | 设置工作根目录 |
| `--add-dir <DIR>` | 添加可写目录（可多次使用） |
| `-p, --profile <NAME>` | 使用指定配置 Profile |
| `--search` | 启用实时网络搜索 |
| `--oss` | 使用本地开源模型（LM Studio / Ollama） |
| `-c, --config <key=value>` | 覆盖 config.toml 中的配置项 |
| `--version` | 显示版本号 |

### 安全与审批参数

| 参数 | 说明 |
|------|------|
| `-s, --sandbox <MODE>` | 沙箱模式：`read-only` / `workspace-write` / `danger-full-access` |
| `-a, --ask-for-approval <MODE>` | 审批策略：`untrusted` / `on-request` / `never` |
| `--full-auto` | 全自动模式（等价于 `workspace-write` + `on-request`） |
| `--yolo` | 无沙箱、无审批（危险，慎用） |

---

## 沙箱模式

<a id="沙箱模式"></a>

Codex 使用操作系统原生沙箱隔离命令执行，保护系统安全。

| 模式 | 文件权限 | 网络 | 适用场景 |
|------|---------|------|---------|
| `read-only` | 只读，不可写 | 禁用 | 安全探索、代码审查 |
| `workspace-write` | 项目目录内读写 | 禁用 | **日常编码（默认）** |
| `danger-full-access` | 完整文件系统访问 | 启用 | 系统管理任务（谨慎使用） |

```bash
# 只读安全探索
codex -s read-only "解释这段代码的架构"

# 默认日常编码
codex -s workspace-write "添加错误处理"

# 全自动（快捷方式）
codex --full-auto "修复所有测试失败"
```

---

## 审批策略

<a id="审批策略"></a>

| 策略 | 行为 |
|------|------|
| `untrusted` | 只有已知安全的只读命令自动通过，其他都需要确认 |
| `on-request` | 由模型决定何时询问（`--full-auto` 默认策略） |
| `never` | 从不询问，失败信息静默返回给模型 |

**常见组合：**

```bash
# 最安全：只读 + 始终询问
codex -s read-only -a untrusted

# 标准开发（git 项目默认）
codex -s workspace-write -a untrusted

# 全自动模式（workspace-write + on-request 的快捷方式）
codex --full-auto

# 无任何限制（危险）
codex --yolo
```

---

## Slash 命令（会话内命令）

<a id="slash-命令会话内命令"></a>

在 TUI 会话中输入 `/` 可弹出命令菜单，支持模糊搜索。

### 会话管理

| 命令 | 说明 |
|------|------|
| `/clear` | 清空 UI 和当前对话 |
| `/compact` | 压缩对话历史，节省 token 空间 |
| `/new` | 在同一会话中开始新对话 |
| `/resume` | 恢复已保存的对话 |
| `/fork` | 将当前对话克隆到新线程 |
| `/copy` 或 `Ctrl+O` | 复制最新 Codex 输出到剪贴板 |
| `/diff` | 显示 git diff（含未跟踪文件） |
| `/status` | 查看会话配置和 token 使用情况 |
| `/exit` / `/quit` | 退出 Codex CLI |

### 模型与配置

| 命令 | 说明 |
|------|------|
| `/model` | 切换模型并调整推理级别 |
| `/fast` | 切换快速模式（GPT-5.4 专用） |
| `/permissions` | 调整 Codex 的自动操作权限 |
| `/theme` | 切换语法高亮主题 |
| `/personality` | 设置交流风格：friendly / pragmatic / none |
| `/statusline` | 配置底部状态栏 |
| `/experimental` | 切换实验性功能 |
| `/debug-config` | 打印配置层级诊断信息 |

### 代码与项目工具

| 命令 | 说明 |
|------|------|
| `/init` | 根据项目上下文自动生成 AGENTS.md 骨架 |
| `/review` | 对工作区变更进行代码审查 |
| `/plan` | 切换到计划模式（只读探索，不修改文件） |
| `/mention` | 向对话附加文件 |
| `/mcp` | 列出已配置的 MCP 工具 |
| `/mcp verbose` | 显示 MCP 服务器详细诊断信息 |
| `/agent` | 切换活跃 Agent 线程 |
| `/ps` | 查看后台终端和输出 |
| `/feedback` | 向维护者提交日志反馈 |
| `/approve` | 重试最近被拒绝的操作 |
| `/raw` | 切换原始文本显示模式 |

---

## 键盘快捷键

<a id="键盘快捷键"></a>

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+C` | 取消当前操作（按两次退出） |
| `Ctrl+D` | 退出 Codex（按两次强制退出） |
| `Ctrl+L` | 清空终端屏幕（不重置对话） |
| `Ctrl+G` | 在外部编辑器中打开提示词（vim 等） |
| `Ctrl+O` | 复制最新 Codex 输出 |
| `Enter` | 在 Agent 运行时注入新指令到当前轮次 |
| `Tab` | 在 Agent 工作时排队下一条提示词 |
| `Esc + Esc` | 编辑上一条消息（composer 为空时） |
| `Esc` | 关闭导航抽屉 |
| `↑ / ↓` | 浏览草稿历史 |
| `@` | 模糊搜索文件并附加到对话 |
| `!` + 命令 | 直接执行本地 Shell 命令（如 `!ls`） |

---

## AGENTS.md 项目指令文件

<a id="agentsmd-项目指令文件"></a>

`AGENTS.md` 是 Codex 的项目级"宪法"，相当于 Claude Code 的 `CLAUDE.md`。每次会话启动时自动加载，为 Codex 提供持久化的项目规范。

### 文件位置

```
项目根目录/
├── AGENTS.md          ← 项目级，优先级最高
├── src/
│   └── AGENTS.md      ← 子目录级，仅在该目录内生效
└── ...

~/.codex/AGENTS.md     ← 全局用户级，所有项目生效
```

### 自动生成

```bash
# 在 TUI 中自动生成骨架（推荐）
/init

# 然后检查并手动调整
```

### AGENTS.md 示例

```markdown
# 我的项目

## 构建命令
- 测试：`npm test`
- 构建：`npm run build`
- 代码检查：`npm run lint -- --fix`
- 启动：`npm run dev`

## 项目结构
- `src/` - 源代码
- `src/api/` - API 路由
- `src/models/` - 数据模型
- `tests/` - 测试文件

## 编码规范
- 所有新文件使用 TypeScript strict 模式
- 每个新函数必须有单元测试
- 禁止直接提交到 main 分支
- 所有 API 端点必须有 OpenAPI 文档注释

## 依赖与框架
- 后端：Express + TypeScript
- 数据库：PostgreSQL（通过 Prisma）
- 测试：Vitest + Supertest

## 注意事项
- 修改数据库 Schema 前必须先写迁移脚本
- 敏感配置从环境变量读取，不要硬编码
```

---

## 配置文件 config.toml

<a id="配置文件-configtoml"></a>

### 文件优先级（从高到低）

```
CLI 参数 > Profile 值 > 项目配置 (.codex/config.toml) > 
用户配置 (~/.codex/config.toml) > 系统配置 (/etc/codex/config.toml) > 默认值
```

### 基础配置示例

```toml
# ~/.codex/config.toml

# 模型与推理
model = "gpt-5.4"
model_reasoning_effort = "high"   # low / medium / high

# 安全默认值
sandbox_mode = "workspace-write"
approval_policy = "on-request"

# 界面
theme = "dark"
personality = "pragmatic"
```

### 多 Profile 配置

```toml
# 日常开发 Profile
[profiles.default]
model = "gpt-5.4"
sandbox_mode = "workspace-write"
approval_policy = "untrusted"

# CI/CD 自动化 Profile（无交互、完全自动）
[profiles.ci]
approval_policy = "never"
sandbox_mode = "workspace-write"
model = "gpt-5.4-mini"

# 高安全 Profile（只读）
[profiles.paranoid]
approval_policy = "untrusted"
sandbox_mode = "read-only"
```

**加载指定 Profile：**

```bash
codex --profile ci
codex --profile paranoid
```

---

## MCP 集成

<a id="mcp-集成"></a>

MCP（Model Context Protocol）允许 Codex 连接外部工具和服务，如 GitHub、数据库、文件系统等。

### 配置 MCP 服务器

```toml
# ~/.codex/config.toml

[[mcp_servers]]
name = "github"
command = "npx"
args = ["-y", "@github/mcp-server"]
env = { GITHUB_TOKEN = "${GITHUB_TOKEN}" }

[[mcp_servers]]
name = "filesystem"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
```

### 会话中管理 MCP

```bash
# 查看已配置的 MCP 工具
/mcp

# 显示详细诊断信息
/mcp verbose

# 通过 CLI 管理
codex mcp list
codex mcp add
codex mcp remove
```

---

## 非交互模式（CI/CD）

<a id="非交互模式cicd"></a>

`codex exec` 命令无需 TUI，适用于脚本自动化和 CI/CD 流水线。

### 基本用法

```bash
# 执行任务（非交互）
codex exec "修复所有测试失败"

# 全自动模式（CI 推荐）
codex exec --full-auto "运行测试并修复失败"

# 输出 JSON（便于脚本解析）
codex exec --json "列出所有 API 端点"

# 保存输出到文件
codex exec -o result.txt "生成架构说明文档"

# 指定模型（节省成本）
codex exec --full-auto -m gpt-5.4-mini "修复 linting 错误"
```

### 代码审查（非交互）

```bash
# 审查当前工作区变更
codex review

# 审查特定分支差异
codex review --base main

# 审查最近一次提交
codex review --commit HEAD
```

### 管道（Pipe）输入

```bash
# 将 git diff 传给 Codex 分析
git diff | codex exec "审查这些变更，找出潜在的 Bug"

# 传入日志文件分析
cat error.log | codex exec "分析这些错误日志，找出根本原因"

# 传入代码文件
cat src/api.ts | codex exec "为这段代码生成单元测试"
```

### GitHub Actions 集成

```yaml
# .github/workflows/codex-review.yml
name: Codex Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Codex CLI
        run: npm install -g @openai/codex

      - name: Run Code Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex review --base ${{ github.base_ref }} \
            --full-auto \
            --non-interactive
```

---

## 多模型选择

<a id="多模型选择"></a>

| 模型 | 适用场景 | 速度 | 成本 |
|------|---------|------|------|
| `gpt-5.4` | 复杂推理、架构设计、跨文件修改 | 较慢 | 较高 |
| `gpt-5.4-mini` | 简单编辑、快速任务、降低成本 | 快 | 低 |
| `gpt-5.3-codex` | 专门的软件工程任务 | 中等 | 中等 |

**在会话中切换：**

```bash
# 会话内使用 slash 命令
/model

# 启动时指定
codex -m gpt-5.4-mini "快速检查语法错误"

# 覆盖配置
codex -c model=gpt-5.4 "重构这个模块"
```

**推理强度（Reasoning Effort）：**

```bash
# 在 config.toml 中设置
model_reasoning_effort = "high"   # 最详细的推理（默认）
model_reasoning_effort = "medium" # 平衡
model_reasoning_effort = "low"    # 快速响应
```

---

## 与其他 AI CLI 工具对比

<a id="与其他-ai-cli-工具对比"></a>

| 特性 | Codex CLI | Claude Code | Gemini CLI |
|------|-----------|-------------|------------|
| 默认模型 | GPT-5.3-Codex | Claude Sonnet | Gemini 2.5 Pro |
| 认证方式 | ChatGPT 账户或 API Key | Anthropic API Key | Google 账户 |
| 审批模式 | Auto / Read-only / Full Access | 自动确认或手动确认 | 沙箱级别 |
| MCP 支持 | ✅（STDIO + HTTP） | ✅ | ✅ |
| 多 Agent | ✅（实验性） | 通过 Task 工具 | ❌ |
| 内置代码审查 | ✅（/review） | 手动工作流 | ❌ |
| 会话恢复 | ✅ | ✅ | ❌ |
| 开源 | ✅（Rust） | ❌ | ✅（TypeScript） |
| Windows 原生 | ✅（WSL2/原生） | WSL2 | WSL2 |
| 图片输入 | ✅ | ✅ | ✅ |

---

## 常见使用场景示例

<a id="常见使用场景示例"></a>

### 1. 日常开发流程

```bash
# 进入项目目录
cd my-project

# 启动 Codex（默认会话）
codex

# 常见任务示例（在 TUI 中输入）
"给 UserService 添加邮件验证功能"
"重构 PaymentController，遵循 SOLID 原则"
"为 auth 模块写全面的单元测试"
"解释 src/core/scheduler.ts 的工作原理"
```

### 2. 图片驱动开发

```bash
# 传入截图或设计稿，生成匹配代码
codex -i design-mockup.png "根据这张设计图实现 React 组件"
codex -i error-screenshot.png "分析这个错误截图并修复"
```

### 3. 跨目录协作（Monorepo）

```bash
codex --cd apps/frontend \
      --add-dir ../backend \
      --add-dir ../shared \
      "在前端和后端之间实现 WebSocket 实时通知功能"
```

### 4. 代码审查（提交前）

```bash
# 启动后使用 slash 命令
/review

# 或非交互方式
codex review --base main
```

### 5. 查看是谁/什么改变了代码

```bash
# 在 TUI 中
"谁修改了 payment.ts 中的计费逻辑？用 git blame 分析"

# 配合管道使用
git log --oneline -20 | codex exec "分析这些提交，总结近期主要变更"
```

### 6. 批量自动化（CI 场景）

```bash
# 修复 linting 错误
codex exec --full-auto -m gpt-5.4-mini "修复所有 ESLint 错误"

# 生成文档
codex exec --full-auto "为所有没有 JSDoc 注释的公共函数生成注释"

# 测试修复
codex exec --full-auto "运行测试，分析失败原因并修复"
```

### 7. 使用会话历史

```bash
# 列出最近的会话
codex resume

# 恢复上次会话继续工作
codex resume --last

# 从某个会话 Fork 新方向
codex fork <SESSION_ID>
```

---

## 最佳实践

<a id="最佳实践"></a>

### 提示词技巧

1. **提供上下文**：说明当前任务背景、相关文件、已有约束

   ```
   ✅ "我在使用 Express + TypeScript，请为 /api/users 路由添加 JWT 中间件，
       中间件配置在 src/middleware/auth.ts"
   ❌ "加个认证"
   ```

2. **分解大任务**：将复杂任务分步执行，逐步审批

3. **使用 `/plan` 先规划再执行**：对于复杂变更，先切换到计划模式探索，再切换到执行模式

4. **附加相关文件**：用 `@` 或 `/mention` 附加相关代码文件，提升上下文准确性

### AGENTS.md 维护建议

- 加入构建、测试、lint 命令（避免 Codex 猜测）
- 写明目录结构和模块职责
- 说明禁止事项（如禁止直接提交 main）
- 定期更新以反映项目变化
- 提交到代码仓库，让团队共享

### 安全建议

- 日常开发使用 `workspace-write` 沙箱（默认），不要随意用 `--yolo`
- 在陌生代码库上先用 `read-only` 模式探索
- 提交前用 `/diff` 或 `/review` 检查变更
- CI 场景用 API Key，避免在自动化脚本中使用个人账户

### 性能优化

- 会话上下文过长时，使用 `/compact` 压缩
- 简单任务用 `gpt-5.4-mini` 降低成本和延迟
- 复杂任务提高 `model_reasoning_effort` 到 `high`
- 在 `.codex/config.toml` 中配置项目专属 Profile

### 文件结构参考

```
~/.codex/
├── config.toml          # 全局用户配置
├── AGENTS.md            # 全局用户级指令
└── sessions/            # 会话历史（本地存储）

项目根目录/
├── .codex/
│   └── config.toml      # 项目级配置（覆盖全局）
└── AGENTS.md            # 项目级 Agent 指令
```

---

## 环境变量速查

| 变量 | 说明 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API Key（API 认证方式） |
| `CODEX_MODEL` | 默认模型（覆盖 config.toml） |
| `CODEX_SANDBOX` | 沙箱模式 |
| `CODEX_APPROVAL_POLICY` | 审批策略 |
| `NO_COLOR` | 禁用颜色输出 |
| `EDITOR` | 外部编辑器（`Ctrl+G` 使用） |

---

*文档版本：1.0 | 基于 Codex CLI 2026 年 5 月版 | 官方文档：https://developers.openai.com/codex*
