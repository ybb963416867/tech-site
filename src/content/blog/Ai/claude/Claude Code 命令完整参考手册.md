---
title: "Claude Code 命令完整参考手册"
description: "更新至 v2.1.142 / 2026年5月 涵盖：CLI 启动命令 · Slash 命令 · 键盘快捷键 · CLI Flags · 环境变量 · 自定义命令"
pubDate: 2026-05-29
category: "claude"
tags: [GitHub Actions, Git, Mac, iOS, Shell, Markdown, API]
draft: false
---
# Claude Code 命令完整参考手册

> 更新至 v2.1.142 / 2026年5月  
> 涵盖：CLI 启动命令 · Slash 命令 · 键盘快捷键 · CLI Flags · 环境变量 · 自定义命令

---

## 目录

1. [安装与启动](#1-安装与启动)
2. [CLI Flags（启动参数）](#2-cli-flags启动参数)
3. [Slash命令（会话内命令）](#3-slash命令会话内命令)
   - [会话管理](#会话管理)
   - [上下文 & Token](#上下文--token)
   - [模型 & 性能](#模型--性能)
   - [代码审查 & 分析](#代码审查--分析)
   - [配置 & 权限](#配置--权限)
   - [集成 & 扩展](#集成--扩展)
   - [其他 & 社交功能](#其他--社交功能)
4. [内置 Skills（技能命令）](#4-内置-skills技能命令)
5. [Plugin 命令](#5-plugin-命令)
6. [键盘快捷键](#6-键盘快捷键)
7. [环境变量](#7-环境变量)
8. [自定义命令](#8-自定义命令)
9. [输入前缀](#9-输入前缀)
---

## 1. 安装与启动

```bash
# 安装（推荐：原生二进制）
curl -fsSL https://claude.ai/install.sh | bash

# macOS Homebrew
brew install --cask claude-code

# NPM（已废弃，建议迁移）
npm install -g @anthropic-ai/claude-code

# 验证安装
claude doctor

# 身份认证
claude auth login    # 登录或切换账号
claude auth status   # 查看当前认证状态
claude auth logout   # 退出登录
```

```bash
# 启动方式
claude                              # 交互模式（最常用）
claude "修复 auth 模块的 bug"        # 带初始 prompt 启动
claude -p "分析这段代码"             # 单次查询后退出（Print 模式）
claude -c                           # 继续上次会话
claude -r "auth-refactor"           # 恢复指定名称的会话
```

---

## 2. CLI Flags（启动参数）

| Flag | 说明 | 示例 |
|------|------|------|
| `-p` | Print 模式，单次查询后退出 | `claude -p "列出所有 TODO"` |
| `-c` | 继续最近一次会话 | `claude -c` |
| `-r`, `--resume` | 恢复指定名称或编号的会话 | `claude -r "auth-refactor"` |
| `-n`, `--name` | 启动时设置会话名称 | `claude -n "feature-x"` |
| `--model` | 覆盖本次会话的模型 | `claude --model opus` |
| `--max-turns` | 限制自主执行轮次 | `claude -p "fix lint" --max-turns 10` |
| `--output-format` | 输出格式：`text` / `json` / `stream-json` | `claude -p "count files" --output-format json` |
| `--allowedTools` | 限制可用工具 | `claude -p "fix" --allowedTools "Edit,Bash(npm:*)"` |
| `--permission-mode` | 设置权限模式 | `claude --permission-mode auto` |
| `--enable-auto-mode` | 启动时开启 Auto 模式 | `claude --enable-auto-mode` |
| `--dangerously-skip-permissions` | 跳过所有权限确认（YOLO 模式） | `claude --dangerously-skip-permissions` |
| `--from-pr` | 关联 PR 启动会话（v2.1.27+） | `claude --from-pr 123` |
| `--fork-session` | 从恢复的会话创建分支 | `claude -r base --fork-session` |
| `-w` | 在隔离的 git worktree 中启动 | `claude -w` |
| `--bare` | 脚本模式，跳过 hooks / LSP / 插件 | `claude -p "count" --bare` |
| `--plugin-url <url>` | 从 URL 加载插件 zip（v2.1.129+） | `claude --plugin-url https://example.com/p.zip` |
| `--plugin-dir <path>` | 从本地目录或 zip 加载插件（v2.1.128+） | `claude --plugin-dir ./my-plugin.zip` |
| `--channels` | 将权限提示转发到 Telegram/Discord | `claude --channels` |
| `--debug` | 开启调试日志 | `claude --debug` |
| `--init` | 初始化项目，生成 CLAUDE.md | `claude --init` |
| `--effort` | 设置推理强度 low/medium/high/xhigh/max | `claude --effort high` |
| `--worktree` | 在隔离 worktree 运行 | `claude --worktree` |
| `--remote-control` | 允许通过 claude.ai 远程控制 | `claude --remote-control` |

---

## 3. Slash命令（会话内命令）

在 Claude Code 会话中输入 `/` 触发，支持自动补全。

### 会话管理

| 命令 | 别名 | 说明 |
|------|------|------|
| `/clear` | `/reset`, `/new` | 清空对话历史，重新开始 |
| `/compact [instructions]` | | 压缩对话历史，可指定保留重点 |
| `/resume [session]` | `/continue` | 恢复会话，按 ID、名称或选择器 |
| `/rename [name]` | | 重命名当前会话；不带参数则自动生成名称 |
| `/fork [name]` | | 从当前节点创建会话分支 |
| `/branch` | | 分支会话，用于并行探索 |
| `/rewind` | `/checkpoint` | 回退对话和代码到某个检查点 |
| `/export [filename]` | | 导出对话为纯文本文件 |
| `/plan [description]` | | 进入计划模式 |
| `/goal [condition]` | | 设置完成条件，Claude 持续运行直到满足（v2.1.139+） |
| `/tasks` | | 列出并管理后台任务 |
| `/bashes` | | 列出后台 bash 任务 |
| `/loop [interval] [cmd]` | | 周期性循环任务，如 `/loop 5m /foo` 每 5 分钟执行一次 |
| `/exit` | `/quit` | 退出 CLI |

### 上下文 & Token

| 命令 | 说明 |
|------|------|
| `/context` | 可视化上下文使用情况（颜色网格 + 优化建议） |
| `/usage` | Token 用量、费用、计划使用情况（综合面板） |
| `/cost` | 查看 Token 用量与费用（v2.1.118+ 为 `/usage` 快捷入口） |
| `/stats` | 可视化每日用量、历史会话、连续天数（v2.1.118+ 为 `/usage` 快捷入口） |
| `/copy [N]` | 复制最近回复到剪贴板；有代码块时显示选择器 |

### 模型 & 性能

| 命令 | 参数 | 说明 |
|------|------|------|
| `/model [model]` | opus / sonnet / haiku | 切换模型，立即生效；方向键调整推理强度 |
| `/effort [level]` | low / medium / high / xhigh / max / auto | 设置推理强度；xhigh 仅 Opus 4.7；max 仅当前会话 |
| `/fast [on\|off]` | | 切换 Opus 快速输出模式 |
| `/powerup` | | 交互式功能教学（v2.1.90+） |

### 代码审查 & 分析

| 命令 | 说明 |
|------|------|
| `/diff` | 交互式 diff 查看器（未提交变更 + 每轮变更），方向键导航 |
| `/review` | 代码质量审查 |
| `/security-review` | 分析待提交变更中的安全漏洞（注入/认证/数据暴露） |
| `/pr-comments [PR URL\|number]` | 查看 GitHub PR 评论，自动识别当前 PR |
| `/insights` | 生成会话分析报告（项目区域、交互模式、痛点） |

### 配置 & 权限

| 命令 | 别名 | 说明 |
|------|------|------|
| `/config` | `/settings` | 打开设置界面（主题/模型/输出风格） |
| `/init` | | 初始化项目，生成 CLAUDE.md 引导文件 |
| `/doctor` | | 诊断 Claude Code 安装状态 |
| `/status` | | 查看版本/模型/账号/连接状态 |
| `/permissions` | `/allowed-tools` | 查看或更新工具权限 |
| `/memory` | | 编辑 CLAUDE.md 记忆文件；管理 auto-memory |
| `/hooks` | | 查看 Hook 配置 |
| `/keybindings` | | 打开或创建快捷键配置 |
| `/theme` | | 切换颜色主题（亮/暗，色盲变体，ANSI 主题） |
| `/color [color\|default]` | | 设置提示栏颜色（red/blue/green/yellow/purple/orange/pink/cyan） |
| `/sandbox` | | 切换沙箱模式（支持的平台） |
| `/privacy-settings` | | 查看/更新隐私设置（Pro/Max） |
| `/extra-usage` | | 配置达到速率限制后的额外用量 |
| `/statusline [description]` | | 配置状态栏显示内容 |
| `/terminal-setup` | | 配置终端快捷键（VS Code/Alacritty/Warp 的 Shift+Enter） |
| `/remote-control [name]` | `/rc` | 允许从 claude.ai 或 Claude App 控制当前会话 |
| `/remote-env` | | 配置 web 会话的默认远程环境 |

### 集成 & 扩展

| 命令 | 说明 |
|------|------|
| `/mcp` | 管理 MCP 服务器连接和 OAuth 认证 |
| `/plugin` | 管理插件（安装/卸载/浏览） |
| `/reload-plugins` | 重新加载所有插件，无需重启（v2.1.69+） |
| `/skills` | 列出所有可用 Skills（v2.1.3+） |
| `/agents` | 管理子 Agent 配置和 Agent 团队 |
| `/ide` | 管理 IDE 集成（VS Code/JetBrains）及状态 |
| `/add-dir <path>` | 向当前会话添加额外工作目录 |
| `/install-github-app` | 安装 Claude GitHub Actions App |
| `/install-slack-app` | 安装 Claude Slack App |
| `/chrome` | 配置 Claude in Chrome 设置 |
| `/voice` | 切换语音输入（按住说话）模式 |

### 其他 & 社交功能

| 命令 | 别名 | 说明 |
|------|------|------|
| `/help` | | 显示所有可用命令及说明 |
| `/feedback [report]` | `/bug` | 向 Anthropic 提交反馈 |
| `/login` | | 登录 Anthropic 账号 |
| `/logout` | | 退出当前账号 |
| `/release-notes` | | 查看完整更新日志（v2.0.32+） |
| `/desktop` | `/app` | 在 Claude Code Desktop 中继续会话（macOS/Windows） |
| `/mobile` | `/ios`, `/android` | 显示 Claude 移动端 App 的 QR 码 |
| `/upgrade` | | 打开升级页面 |
| `/passes` | | 向朋友分享一周免费 Claude Code（需符合条件） |
| `/stickers` | | 订购 Claude Code 贴纸 |
| `/buddy` | | 终端宠物（18 种动物，5 个稀有等级） |
| `/btw <question>` | | 提一个不加入主对话上下文的旁白问题 |

---

## 4. 内置 Skills（技能命令）

Skills 是随 Claude Code 附带的内置提示包，作为 Slash 命令使用：

| 命令 | 说明 |
|------|------|
| `/batch` | 跨文件批量操作 |
| `/simplify` | 审查并简化近期代码变更 |
| `/loop` | 交互式迭代开发循环 |
| `/debug` | 系统化 debug 工作流 |
| `/claude-api` | 使用 Claude API / Anthropic SDK 构建应用 |

---

## 5. Plugin 命令

| 命令 | 说明 |
|------|------|
| `/plugin marketplace add <owner/repo>` | 添加 GitHub 上的插件市场 |
| `/plugin marketplace list` | 列出已添加的插件市场 |
| `/plugin marketplace remove <name>` | 移除插件市场 |
| `/plugin install <name>@<marketplace>` | 从市场安装插件 |
| `/plugin list` | 列出已安装插件 |
| `/plugin uninstall <name>` | 卸载插件 |
| `/plugin update <name>` | 更新插件到最新版本 |
| `/plugin enable <name>` | 启用插件 |
| `/plugin disable <name>` | 禁用插件 |
| `/reload-plugins` | 重新加载所有插件（无需重启） |

---

## 6. 键盘快捷键

### 通用控制

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` | 取消当前操作 |
| `Ctrl+D` | 退出会话（EOF） |
| `Ctrl+L` | 清屏（保留历史） |
| `Ctrl+O` | 切换详细输出 |
| `Ctrl+R` | 搜索命令历史 |
| `Ctrl+V` | 从剪贴板粘贴图片 |
| `Ctrl+B` | 后台化当前操作 |
| `Ctrl+X Ctrl+K` | 停止所有 Agent（v2.1.83+ 从 Ctrl+F 改为此） |
| `Ctrl+S` | 暂存当前 prompt 草稿 |
| `Ctrl+G` | 在外部编辑器中打开 |
| `Esc Esc` | 回退（撤销）上一次变更 |

### 模型 & 模式

| 快捷键 | 功能 |
|--------|------|
| `Option+T` / `Alt+T` | 切换 Extended Thinking（深度推理） |
| `Option+P` / `Alt+P` | 打开模型选择器 |
| `Shift+Tab` | 循环切换权限模式（Normal → Auto → Plan → Normal） |

### 多行输入

| 快捷键 | 功能 |
|--------|------|
| `Shift+Enter` | 换行（需配置终端，用 `/terminal-setup`） |
| `\` + `Enter` | 换行输入（通用方式） |

### 导航

| 快捷键 | 功能 |
|--------|------|
| `↑` / `↓` | 浏览历史 prompt |
| `Esc Esc` 后 `↑/↓` | 打开消息选择器，选择某条重新分支 |

---

## 7. 环境变量

在 shell 或 `settings.json` 的 `env` 字段中设置：

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API Key |
| `ANTHROPIC_MODEL` | 默认模型（如 `claude-opus-4-7`） |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 最大输出 Token 数 |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | 设为 `1` 禁用 Claude Code 内置 Auto Memory |
| `CLAUDE_CODE_NO_FLICKER` | 设为 `1` 启用平滑渲染（消除终端闪烁） |
| `DISABLE_TELEMETRY` | 设为 `1` 禁用遥测数据 |
| `CLAUDE_MEM_MODE` | claude-mem 插件工作模式（如 `code--zh`） |
| `CLAUDE_MEM_DATA_DIR` | claude-mem 数据存储路径 |

---

## 8. 自定义命令

创建 Markdown 文件即可定义自定义 Slash 命令：

- **项目级**（通过 git 共享给团队）：`.claude/commands/命令名.md`
- **个人级**（跨所有项目可用）：`~/.claude/commands/命令名.md`

### 示例

```markdown
---
description: 修复 GitHub Issue
allowed-tools: Read, Edit, Bash(git:*)
model: opus
argument-hint: [issue-number]
---

按照编码规范修复 GitHub Issue #$ARGUMENTS。
```

调用：`/fix-issue 123`

### Frontmatter 支持的字段

| 字段 | 说明 |
|------|------|
| `description` | 命令描述（在 `/help` 中显示） |
| `allowed-tools` | 限制可用工具 |
| `model` | 指定使用的模型 |
| `argument-hint` | 参数提示 |
| `user-invocable` | 是否可被用户直接调用 |
| `context` | 上下文策略（`fork` 等） |

参数引用：`$ARGUMENTS`（全部参数）或 `$1`、`$2`（位置参数）

---

## 9. 输入前缀

在提示框中使用特殊前缀：

| 前缀 | 功能 |
|------|------|
| `!command` | 直接执行 shell 命令（如 `!ls -la`） |
| `#tag` | 添加标签（部分版本支持） |
| `@file` | 引用文件路径（快速插入文件内容） |

---

## 附：常用组合速查

```bash
# 非交互模式 + JSON 输出（适合脚本/CI）
claude -p "统计 src/ 下的 TODO 数量" --output-format json

# 自主模式 + worktree 隔离（适合批量任务）
claude --dangerously-skip-permissions -w "重构所有 deprecated API 调用并推送 PR"

# 指定模型 + 高推理强度
claude --model opus --effort xhigh

# 继续上次 + 关联 PR
claude -c --from-pr 456
```

---

> 提示：在会话中输入 `/help` 查看当前版本所有可用命令；部分命令仅在特定套餐（Pro/Max）或平台上可用。
