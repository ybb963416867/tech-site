---
title: "MCP_介绍"
description: "Model Context Protocol —— AI 与外部世界的标准化桥梁"
pubDate: 2026-05-29
category: "Ai"
tags: [Git, Mac, iOS, Shell, API, TypeScript]
draft: false
---
# MCP（Model Context Protocol）详细介绍

> Model Context Protocol —— AI 与外部世界的标准化桥梁

---

## 一、什么是 MCP？

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 于 2024 年 11 月发布的**开放标准协议**，旨在为 AI 模型与外部数据源、工具之间的交互提供统一的通信规范。

### 核心定位

传统 AI 应用集成外部服务时，每个服务都需要单独开发接口，维护成本高、扩展性差。MCP 的设计理念是：

> 就像 USB 统一了外设接口，MCP 统一了 AI 与外部工具的连接方式。

| 传统方式 | MCP 方式 |
|---------|---------|
| 每个服务单独写集成代码 | 一套协议，所有服务通用 |
| AI 只能访问训练数据 | AI 可实时访问外部数据 |
| 上下文窗口受限 | 动态获取所需上下文 |
| 工具耦合度高 | 松耦合、可插拔 |

---

## 二、MCP 的架构设计

MCP 采用经典的 **Client-Server 架构**，由三个核心角色组成：

```
┌─────────────────────────────────────────┐
│              MCP Host                   │
│  (Claude Desktop / IDE / AI 应用)        │
│                                         │
│   ┌──────────┐    ┌──────────┐          │
│   │MCP Client│    │MCP Client│  ...     │
│   └────┬─────┘    └────┬─────┘          │
└────────│───────────────│────────────────┘
         │  MCP Protocol │
    ┌────▼─────┐    ┌────▼─────┐
    │MCP Server│    │MCP Server│  ...
    │ (文件系统) │    │ (数据库)  │
    └──────────┘    └──────────┘
```

### 角色说明

**MCP Host（宿主）**
- AI 应用程序本身，如 Claude Desktop、Cursor、自定义应用
- 负责管理与多个 MCP Server 的连接
- 处理 AI 模型的上下文和权限控制

**MCP Client（客户端）**
- 内嵌在 Host 中的协议客户端
- 与 MCP Server 保持一对一连接
- 负责协议层的通信处理

**MCP Server（服务端）**
- 独立的轻量级程序，暴露特定能力
- 可以是本地进程，也可以是远程服务
- 每个 Server 专注于一类功能（文件、数据库、API 等）

---

## 三、MCP 能做什么？

MCP Server 向 AI 提供三类核心能力：

### 3.1 Tools（工具/函数调用）

AI 可以调用工具来执行具体操作，类似函数调用。

**典型场景：**
- 执行 Shell 命令
- 操作文件系统（读写、搜索）
- 调用外部 API（发邮件、创建任务）
- 数据库 CRUD 操作
- 控制浏览器（Web 自动化）

**示例：**
```
用户："帮我查一下数据库中最近7天的订单数量"
AI   → 调用 MCP Tool: query_database(sql="SELECT COUNT(*) FROM orders WHERE ...")
MCP  → 执行 SQL，返回结果
AI   → "最近7天共有 1,234 笔订单"
```

### 3.2 Resources（资源）

AI 可以读取结构化数据资源，类似 REST API 的 GET 请求。

**典型场景：**
- 读取本地文件内容
- 获取数据库记录
- 拉取配置信息
- 访问文档/知识库

**示例：**
```
资源 URI: file:///project/src/main.cpp
资源 URI: database://orders/recent
资源 URI: github://repo/issues
```

### 3.3 Prompts（提示模板）

Server 可以预定义提示模板，让 AI 按标准化方式完成特定任务。

**典型场景：**
- 代码审查提示模板
- 写作风格模板
- 特定领域分析框架

---

## 四、MCP 支持的传输方式

| 传输方式 | 适用场景 | 说明 |
|---------|---------|------|
| **stdio** | 本地进程 | 标准输入输出，最常用 |
| **HTTP + SSE** | 远程服务 | Server-Sent Events，支持流式响应 |
| **WebSocket** | 实时双向通信 | 适合需要实时推送的场景 |

---

## 五、如何使用 MCP？

### 5.1 使用现成的 MCP Server

以 Claude Desktop 为例，配置文件路径：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**配置示例：**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/stone/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/path/to/db.sqlite"]
    }
  }
}
```

### 5.2 常用官方 MCP Server

| Server | 功能 | 安装命令 |
|--------|------|---------|
| `@modelcontextprotocol/server-filesystem` | 文件系统访问 | `npx -y @modelcontextprotocol/server-filesystem` |
| `@modelcontextprotocol/server-github` | GitHub 操作 | `npx -y @modelcontextprotocol/server-github` |
| `@modelcontextprotocol/server-sqlite` | SQLite 数据库 | `npx -y @modelcontextprotocol/server-sqlite` |
| `@modelcontextprotocol/server-brave-search` | 网页搜索 | `npx -y @modelcontextprotocol/server-brave-search` |
| `@modelcontextprotocol/server-puppeteer` | 浏览器控制 | `npx -y @modelcontextprotocol/server-puppeteer` |
| `@modelcontextprotocol/server-postgres` | PostgreSQL | `npx -y @modelcontextprotocol/server-postgres` |

### 5.3 自己开发 MCP Server

MCP 官方提供 Python 和 TypeScript SDK。

- 开发mcp的语言 Python, node
- 对应的启动 Python -> uvx, node -> npx

#### Python 示例（最简单的 MCP Server）

```python
# 安装：pip install mcp

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio

server = Server("my-mcp-server")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="get_weather",
            description="获取指定城市的天气信息",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"}
                },
                "required": ["city"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "get_weather":
        city = arguments["city"]
        # 这里调用真实的天气 API
        return [TextContent(type="text", text=f"{city} 今天晴，25°C")]

async def main():
    async with stdio_server() as streams:
        await server.run(streams[0], streams[1])

if __name__ == "__main__":
    asyncio.run(main())
```

#### TypeScript 示例

```typescript
// 安装：npm install @modelcontextprotocol/sdk

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "my-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "calculate",
    description: "执行数学计算",
    inputSchema: {
      type: "object",
      properties: { expression: { type: "string" } },
      required: ["expression"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate") {
    const result = eval(request.params.arguments?.expression as string);
    return { content: [{ type: "text", text: String(result) }] };
  }
  throw new Error("Unknown tool");
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 六、实际应用场景

### 场景一：AI 辅助编程（结合文件系统 + GitHub）

```
"帮我审查 src/ 目录下所有 .cpp 文件，找出潜在的内存泄漏"

AI 操作流程：
1. filesystem.list_directory("src/")
2. filesystem.read_file("src/main.cpp") × N
3. 分析代码，生成报告
4. github.create_issue("潜在内存泄漏报告", ...)
```

### 场景二：数据分析助手（结合数据库）

```
"分析上个月的销售数据，找出TOP10产品"

AI 操作流程：
1. sqlite.query("SELECT product, SUM(amount) FROM sales ...")
2. 对数据进行分析
3. 生成可视化建议报告
```

### 场景三：自动化运维（结合 Shell）

```
"检查服务器状态，如果 CPU 超过 80% 就重启相关服务"

AI 操作流程：
1. shell.execute("top -bn1 | grep 'Cpu'")
2. 解析 CPU 使用率
3. 条件满足时：shell.execute("systemctl restart myservice")
```

---

## 七、MCP 的安全机制

- **用户授权**：每次连接新 Server 需要用户明确许可
- **权限隔离**：每个 Server 只能访问其声明的资源范围
- **本地优先**：敏感操作默认在本地执行，数据不经过云端
- **沙箱运行**：Server 作为独立进程运行，相互隔离

---

## 八、MCP 生态现状（2026年）

MCP 发布后快速获得行业认可，发展大事记：

| 时间 | 事件 |
| --- | --- |
| 2024.11 | Anthropic 开源发布 MCP 协议 |
| 2025.06 | Claude Desktop 推出 Desktop Extensions（.mcpb 一键安装） |
| 2025.09 | 官方 MCP Registry 上线预览版 |
| 2025.12 | Anthropic 将 MCP 捐赠给 Linux 基金会下的 Agentic AI Foundation（AAIF），OpenAI、Block 共同创立 |
| 2026.01 | Claude.ai 上线 50+ 预置 Connectors，支持 Slack、Figma 等 |
| 2026.02 | Claude API MCP Connector 进入公测 |
| 2026.03 | TypeScript SDK 达到 v1.28.0，36,000+ 依赖包 |

**平台支持：**

-   **IDE 工具**：Cursor、VS Code、JetBrains、Claude Code
    
-   **AI 平台**：Claude Desktop/Web、Amazon Bedrock、各类 AI Agent 框架
    
-   **Server 数量**：社区已有 **20,000+** MCP Server，覆盖开发、数据、办公、AI 等各类场景
    
-   **SDK 语言**：官方 Python / TypeScript；社区支持 Go、Rust、Java、C# 等
    

---

## 九、MCP 市场与目录导航

### 9.1 官方渠道

| 名称 | 地址 | 说明 |
| --- | --- | --- |
| **Anthropic Connectors Directory** | [https://claude.ai/settings/connectors](https://claude.ai/settings/connectors) | Claude 官方审核目录，Claude Desktop / Web 一键安装 |
| **官方 MCP Servers 仓库** | [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Anthropic 维护的官方 Server 集合，含文件系统、GitHub、SQLite 等 |
| **官方协议文档** | [https://modelcontextprotocol.io](https://modelcontextprotocol.io/) | MCP 规范、SDK 文档、快速上手指南 |
| **Claude Code MCP 文档** | [https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp) | Claude Code 中使用 MCP 的专项文档 |

### 9.2 第三方社区市场

| 名称 | 地址 | 规模 | 特点 |
| --- | --- | --- | --- |
| **MCP.so** | [https://mcp.so](https://mcp.so/) | 21,000+ Servers | 最大社区目录，支持分类浏览和 Playground |
| **Glama Registry** | [https://glama.ai/mcp/servers](https://glama.ai/mcp/servers) | 23,000+ Servers | 开源 Server 为主，含质量评级和维护状态 |
| **PulseMCP** | [https://www.pulsemcp.com/servers](https://www.pulsemcp.com/servers) | 15,000+ Servers | 每日更新，含访问量统计，便于发现热门 Server |
| **Awesome MCP Servers** | [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | GitHub 精选 | 人工筛选高质量 Server，分类清晰 |
| **Claude Marketplaces** | [https://claudemarketplaces.com](https://claudemarketplaces.com/) | 持续更新 | 专注 Claude Code 插件、MCP、Skills 的目录 |

### 9.3 按分类查找 Server

| 分类 | 推荐 Server | 安装方式 |
| --- | --- | --- |
| **文件系统** | `@modelcontextprotocol/server-filesystem` | `npx -y` |
| **代码托管** | `@modelcontextprotocol/server-github` / `server-gitlab` | `npx -y` |
| **数据库** | `server-sqlite` / `server-postgres` | `npx -y` |
| **浏览器控制** | `@modelcontextprotocol/server-puppeteer` | `npx -y` |
| **网页搜索** | `server-brave-search` / `server-fetch` | `npx -y` |
| **办公协作** | Google Drive、Notion、Slack | Claude Connectors 目录 |
| **云服务** | AWS Marketplace MCP | [https://docs.aws.amazon.com/marketplace/latest/APIReference/marketplace-mcp-server.html](https://docs.aws.amazon.com/marketplace/latest/APIReference/marketplace-mcp-server.html) |
| **Adobe AEM** | Adobe Experience Manager Connector | Claude Connectors 目录 |

### 9.4 如何提交自己的 MCP Server

1.  **提交到官方目录**：满足 [Anthropic MCP Directory Policy](https://support.anthropic.com/en/articles/11697096-anthropic-mcp-directory-policy) 要求后提交审核
    
2.  **提交到 MCP.so**：在 GitHub Issues 中提交 Server 信息
    
3.  **提交到 Glama**：通过 glama.ai 提交页面注册
    
4.  **提交到 Awesome 列表**：向 GitHub 仓库发 PR
    

> ⚠️ **安全提示**：连接第三方 MCP Server 前，确认来源可信。访问外部内容的 Server 存在 Prompt Injection 风险，建议优先使用官方审核目录中的 Server。

---

## 十、参考资源

| 资源 | 地址 |
| --- | --- |
| 官方协议文档 | [https://modelcontextprotocol.io](https://modelcontextprotocol.io/) |
| Python SDK | [https://github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) |
| TypeScript SDK | [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) |
| 官方 Server 集合 | [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) |
| Anthropic Connectors 目录 | [https://claude.ai/settings/connectors](https://claude.ai/settings/connectors) |
| MCP.so 社区市场 | [https://mcp.so](https://mcp.so/) |
| Glama 开源注册表 | [https://glama.ai/mcp/servers](https://glama.ai/mcp/servers) |
| PulseMCP 每日更新目录 | [https://www.pulsemcp.com/servers](https://www.pulsemcp.com/servers) |
| Awesome MCP Servers | [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) |
| Claude Marketplaces | [https://claudemarketplaces.com](https://claudemarketplaces.com/) |
| MCP Directory 审核政策 | [https://support.anthropic.com/en/articles/11697096-anthropic-mcp-directory-policy](https://support.anthropic.com/en/articles/11697096-anthropic-mcp-directory-policy) |

---

*文档最后更新：2026年5月*
