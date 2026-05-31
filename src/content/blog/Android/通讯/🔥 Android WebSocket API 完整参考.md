---
title: "Android WebSocket API 完整参考"
description: "整理范围：WebSocket 协议原理（RFC 6455）、OkHttp WebSocket、Java 原生 WebSocket（JSR356 / javax.websocket）、Ktor WebSocket Client，以及常见..."
pubDate: 2026-05-31
category: "通讯"
tags: [Array, API]
draft: false
---
# Android WebSocket API 完整参考

> 整理范围：WebSocket 协议原理（RFC 6455）、OkHttp WebSocket、Java 原生 WebSocket（JSR-356 / javax.websocket）、Ktor WebSocket Client，以及常见第三方库（Socket.IO Android、Scarlet）。

---

## 目录

1. [WebSocket 协议原理（RFC 6455）](#1-websocket-协议原理rfc-6455)
   - [1.1 协议栈位置](#11-协议栈位置)
   - [1.2 握手升级流程](#12-握手升级流程)
   - [1.3 帧结构详解](#13-帧结构详解)
   - [1.4 opcode 类型](#14-opcode-类型)
   - [1.5 掩码机制（Masking）](#masking)
   - [1.6 消息分片](#16-消息分片)
   - [1.7 控制帧规则](#17-控制帧规则)
   - [1.8 关闭握手](#18-关闭握手)
   - [1.9 与裸 TCP / HTTP 对比](#1.9)
2. [OkHttp WebSocket（推荐）](#2-okhttp-websocket推荐)
3. [Java 原生 WebSocket（javax.websocket / Tyrus）](#3-java-原生-websocketjavaxwebsocket--tyrus)
4. [Ktor WebSocket Client](#4-ktor-websocket-client)
5. [Socket.IO Android Client](#5-socketio-android-client)
6. [Scarlet（Tinder 开源）](#6-scarlettinder-开源)
7. [reconnecting-websocket 模式](#7-reconnecting-websocket-模式)
8. [各方案对比](#8-各方案对比)
9. [常见问题 FAQ](#9-常见问题-faq)

---

## 1. WebSocket 协议原理（RFC 6455）

WebSocket 是 HTML5 时代为解决 HTTP 单向通信缺陷而设计的协议，由 IETF 在 2011 年发布为 RFC 6455。

---

### 1.1 协议栈位置

```
┌─────────────────────────────┐
│       应用层数据              │  你的业务消息（JSON / Binary）
├─────────────────────────────┤
│     WebSocket 帧协议         │  RFC 6455 定义的帧格式
├─────────────────────────────┤
│     TLS（wss:// 时）         │  加密层（可选）
├─────────────────────────────┤
│          TCP                │  可靠传输、有序、字节流
├─────────────────────────────┤
│          IP                 │  网络寻址
└─────────────────────────────┘
```

WebSocket 本质是：**在 TCP 连接上，通过 HTTP Upgrade 握手建立的全双工帧协议通道**。

---

### 1.2 握手升级流程

WebSocket 连接建立分两阶段，整个握手复用 TCP 连接，不会重新建立。

**第一步：客户端发送 HTTP Upgrade 请求**

```
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket               ← 要求升级为 WebSocket
Connection: Upgrade              ← 当前连接需要升级
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==   ← Base64 随机 16 字节，用于验证
Sec-WebSocket-Version: 13        ← 协议版本，固定为 13
Sec-WebSocket-Protocol: chat, superchat   ← 可选：子协议协商
Sec-WebSocket-Extensions: permessage-deflate  ← 可选：扩展协商（如压缩）
```

**第二步：服务端返回 101 完成升级**

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=  ← 由 Key 计算得出
Sec-WebSocket-Protocol: chat     ← 服务端选定的子协议
```

`Sec-WebSocket-Accept` 的计算方式：

```
Accept = Base64( SHA1( Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" ) )
```

其中 `258EAFA5-...` 是 RFC 6455 固定的魔数 GUID，防止非 WebSocket 的 HTTP 服务误响应。

**第三步：101 之后 TCP 连接转为 WebSocket 全双工模式**

```
客户端                        服务端
  │                              │
  │──── TCP SYN ────────────────>│
  │<─── TCP SYN-ACK ─────────────│
  │──── TCP ACK ────────────────>│  TCP 三次握手
  │                              │
  │──── HTTP GET (Upgrade) ─────>│
  │<─── HTTP 101 ────────────────│  WebSocket 握手
  │                              │
  │<══════ WebSocket 帧 ══════════│  全双工通信开始
  │══════ WebSocket 帧 ══════════>│
```

---

### 1.3 帧结构详解

RFC 6455 定义的帧格式（每行 32 bit）：

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M|  Payload len|    Extended payload length    |
|I|S|S|S|  (4b) |A|     (7b)    |         (16 or 64 bit)        |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+-------------------------------+
|          Extended payload length continued (if 127)           |
+-------------------------------+-------------------------------+
|        Masking-key (32 bit, 仅当 MASK=1 时存在)               |
+-------------------------------+-------------------------------+
|                     Payload Data                              |
+---------------------------------------------------------------+
```

**各字段说明：**

| 字段 | 位数 | 说明 |
|------|------|------|
| FIN | 1 | 1=当前帧是消息的最后一帧；0=后续还有分片 |
| RSV1/2/3 | 各 1 | 保留位，默认 0；扩展协议可用（如 permessage-deflate 用 RSV1 表示压缩） |
| opcode | 4 | 帧类型（见 1.4） |
| MASK | 1 | 1=Payload 已掩码；客户端→服务端必须为 1，服务端→客户端必须为 0 |
| Payload len | 7 | 0–125=实际长度；126=后续 2 字节为真实长度；127=后续 8 字节为真实长度 |
| Masking-key | 32 | 4 字节随机掩码键，仅 MASK=1 时存在 |
| Payload Data | 变长 | 实际数据，若有掩码则为掩码后的数据 |

**Payload 长度编码示意：**

```
长度 ≤ 125       → 7bit 直接表示
     [MASK | 0~125]

长度 126~65535   → 用额外 2 字节
     [MASK | 126] [len_high] [len_low]

长度 > 65535     → 用额外 8 字节
     [MASK | 127] [len_byte0] ... [len_byte7]
```

**完整帧示例（客户端发送文本 "Hi"）：**

```
字节:  0x81  0x82  0xA3  0xB4  0xC5  0xD6  0xEB  0xD3

0x81 = 1000 0001
       ↑           FIN = 1（完整消息）
         ↑↑↑       RSV1/2/3 = 0
             ↑↑↑↑  opcode = 0x1（文本帧）

0x82 = 1000 0010
       ↑           MASK = 1（客户端必须掩码）
         ↑↑↑↑↑↑↑  Payload len = 2

0xA3 0xB4 0xC5 0xD6  ← Masking-key（4 字节）

0xEB 0xD3            ← 掩码后的 Payload

还原：
  'H'(0x48) = 0xEB XOR 0xA3
  'i'(0x69) = 0xD3 XOR 0xBA
```

---

### 1.4 opcode 类型

| opcode | 十六进制 | 帧类型 | 说明 |
|--------|----------|--------|------|
| 0 | `0x0` | 延续帧 | 分片消息的后续帧 |
| 1 | `0x1` | 文本帧 | UTF-8 编码文本 |
| 2 | `0x2` | 二进制帧 | 任意二进制数据 |
| 3–7 | `0x3–0x7` | 保留 | 非控制帧保留，不可使用 |
| 8 | `0x8` | Close | 关闭连接 |
| 9 | `0x9` | Ping | 心跳探测 |
| 10 | `0xA` | Pong | 心跳响应 |
| 11–15 | `0xB–0xF` | 保留 | 控制帧保留，不可使用 |

---

<a id="masking"></a>
### 1.5 掩码机制（Masking）

**为什么客户端发的帧必须掩码？**

防止"缓存投毒攻击"：早期透明代理/CDN 可能把 WebSocket 数据误识别为 HTTP 响应并缓存，攻击者可以构造特定字节序列污染缓存。掩码使每次传输的字节序列随机化，代理无法识别为合法 HTTP。

**掩码算法：**

```
// 掩码（发送端）
for (int i = 0; i < payloadLen; i++) {
    maskedPayload[i] = payload[i] ^ maskingKey[i % 4];
}

// 解掩码（接收端，算法完全相同）
for (int i = 0; i < payloadLen; i++) {
    payload[i] = maskedPayload[i] ^ maskingKey[i % 4];
}
```

maskingKey 是每帧独立生成的 4 字节随机数，同一连接的不同帧 key 不同。

---

### 1.6 消息分片

一条逻辑消息可以拆分成多个帧发送（适合大消息或流式传输）：

```
帧1: FIN=0, opcode=0x1（文本）, payload="Hel"      ← 第一片，opcode 标明类型
帧2: FIN=0, opcode=0x0（延续）, payload="lo "      ← 中间片，opcode=0x0
帧3: FIN=1, opcode=0x0（延续）, payload="World"    ← 最后片，FIN=1
```

接收端将三帧的 payload 拼接后得到完整消息 `"Hello World"`。

**控制帧可以插入分片之间：**

```
帧1: FIN=0, opcode=Text,       "Hel"
帧2: FIN=1, opcode=Ping,       ""     ← Ping 控制帧，插入分片中间
帧3: FIN=0, opcode=Continuation, "lo"
帧4: FIN=1, opcode=Continuation, " World"
```

---

### 1.7 控制帧规则

Close / Ping / Pong 属于控制帧，有三条强制约束：

1. **FIN 必须为 1**（控制帧不允许分片）
2. **Payload 最多 125 字节**（7bit 长度字段直接表示，不使用扩展长度）
3. **可以插入数据帧分片序列之间**

**Ping / Pong 心跳流程：**

```
客户端                    服务端
  │──── Ping(payload) ──>│
  │<─── Pong(payload) ───│  Pong 必须原样回传 Ping 的 payload
```

服务端也可以主动发 Ping，客户端必须回 Pong。

**Close 帧 Payload 格式：**

```
[status_code (2 bytes, big-endian)] [reason (UTF-8, 可选, 最多 123 字节)]

示例：0x03 0xE8 = 1000 = 正常关闭
```

---

### 1.8 关闭握手

WebSocket 关闭是四次挥手（类比 TCP FIN）：

```
主动关闭方                      被动关闭方
    │──── Close(code, reason) ──>│   发送 Close 帧
    │<─── Close(code, reason) ───│   回应 Close 帧
    │                             │
    └─── TCP 连接断开 ────────────┘
```

规则：
- 收到 Close 帧后必须回应一个 Close 帧（除非已发过）
- 回应后不再发送数据帧
- 底层 TCP 连接由服务端负责关闭（先发 Close 的一方等待回应后关闭）

---

<a id="1.9"></a>
### 1.9 与裸 TCP / HTTP 对比

| 特性 | 裸 TCP | HTTP/1.1 轮询 | HTTP/2 SSE | WebSocket |
|------|--------|--------------|------------|-----------|
| 方向 | 全双工 | 半双工（请求/响应） | 服务端单向推送 | 全双工 |
| 消息边界 | 无（字节流） | HTTP 帧 | 文本行 | WebSocket 帧 |
| 头部开销 | 无 | 每次请求带完整 Header | 每次请求带 Header | 握手后仅 2–10 字节帧头 |
| 浏览器/Android | 不支持 | 支持 | 支持 | 支持 |
| 防火墙穿透 | 难（非标端口） | 好（80/443） | 好 | 好（复用 80/443） |
| 实时性 | 最好 | 差（轮询延迟） | 好（服务端推送） | 好 |
| 连接数 | 自定义 | 每次请求一条 | 一条长连接 | 一条长连接 |
| 适合场景 | 自定义协议 | 低频数据查询 | 服务端单向推送 | 双向实时通信 |

---

## 2. OkHttp WebSocket（推荐）

OkHttp 是 Android 平台最主流的 HTTP/WebSocket 客户端，Square 出品，API 稳定成熟。

### 1.1 依赖引入

```kotlin
// build.gradle.kts
implementation("com.squareup.okhttp3:okhttp:4.12.0")
```

### 1.2 核心类与接口

| 类 / 接口 | 说明 |
|-----------|------|
| `OkHttpClient` | 全局客户端，管理连接池、超时等配置 |
| `Request` | 携带 WebSocket 握手 URL 及自定义 Header |
| `WebSocketListener` | 事件回调接口（抽象类），必须实现 |
| `WebSocket` | 已建立的 WebSocket 连接句柄 |
| `WebSocket.Factory` | 创建 WebSocket 的工厂，`OkHttpClient` 实现了该接口 |

---

### 1.3 WebSocketListener 回调详解

```kotlin
abstract class WebSocketListener {

    /** 握手成功，连接建立。response 是服务端 101 响应 */
    open fun onOpen(webSocket: WebSocket, response: Response) {}

    /** 收到文本消息 */
    open fun onMessage(webSocket: WebSocket, text: String) {}

    /** 收到二进制消息（ByteString 包含原始字节） */
    open fun onMessage(webSocket: WebSocket, bytes: ByteString) {}

    /**
     * 收到对端的 Close 帧。
     * code: WebSocket 关闭码（1000=正常，1001=Going Away 等）
     * reason: 关闭原因字符串
     * 此时连接尚未完全关闭，可以在这里调用 webSocket.close() 完成四次挥手
     */
    open fun onClosing(webSocket: WebSocket, code: Int, reason: String) {}

    /**
     * 连接已完全关闭。
     * 如果是本端主动 close() 后对端确认，则 code/reason 来自对端。
     * 如果是网络断开，此方法不会被调用（只会调用 onFailure）
     */
    open fun onClosed(webSocket: WebSocket, code: Int, reason: String) {}

    /**
     * 连接异常（网络错误、服务端非正常断开、握手失败等）。
     * response 仅在握手阶段失败时非 null（HTTP 错误响应）
     * 连接断开后 OkHttp 不会自动重连，需业务层实现
     */
    open fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {}
}
```

---

### 1.4 WebSocket 接口 — 发送与控制

```kotlin
interface WebSocket {

    /** 返回创建此连接的原始 Request */
    fun request(): Request

    /**
     * 返回当前待发送队列的字节数。
     * 若超过 16MB，OkHttp 会主动断开连接。
     * 可用于流量控制、背压判断
     */
    fun queueSize(): Long

    /**
     * 发送文本消息（UTF-8）。
     * 返回 false 表示连接已关闭或消息队列已满，消息被丢弃
     */
    fun send(text: String): Boolean

    /**
     * 发送二进制消息。
     * ByteString 是 OkHttp 的不可变字节容器
     */
    fun send(bytes: ByteString): Boolean

    /**
     * 发送 Ping 帧，服务端应回复 Pong。
     * payload 可为 null 或最多 125 字节
     * 用于心跳保活
     */
    fun send(bytes: ByteString?): Boolean  // Ping 无专用方法，通过底层实现

    /**
     * 发起优雅关闭（发送 Close 帧）。
     * code: 关闭码，1000 表示正常
     * reason: 关闭原因，UTF-8，最多 123 字节
     * 返回 false 表示连接已关闭
     */
    fun close(code: Int, reason: String?): Boolean

    /**
     * 立即强制关闭，不发送 Close 帧（类似 TCP RST）。
     * 用于超时或资源释放场景
     */
    fun cancel()
}
```

---

### 1.5 OkHttpClient 配置

```kotlin
val client = OkHttpClient.Builder()
    // 握手超时（TCP 连接 + HTTP 101 升级）
    .connectTimeout(10, TimeUnit.SECONDS)
    // 读超时：收到数据帧的最大等待时间（0=不超时，WebSocket 推荐设为 0）
    .readTimeout(0, TimeUnit.SECONDS)
    // 写超时
    .writeTimeout(10, TimeUnit.SECONDS)
    // Ping 间隔：OkHttp 自动定期发送 Ping 保活（0=关闭）
    .pingInterval(20, TimeUnit.SECONDS)
    // TLS 配置（如需自签名证书）
    .sslSocketFactory(sslSocketFactory, trustManager)
    .hostnameVerifier { _, _ -> true } // ⚠️ 仅用于调试
    // 添加拦截器（可用于打印握手日志）
    .addInterceptor(HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.HEADERS
    })
    .build()
```

> **注意**：`OkHttpClient` 实例应全局复用，内部维护线程池和连接池，不要每次连接都创建新实例。

---

### 1.6 建立连接

```kotlin
val request = Request.Builder()
    .url("wss://echo.websocket.org")          // ws:// 或 wss://
    .addHeader("Authorization", "Bearer token") // 自定义握手 Header
    .build()

val listener = object : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: Response) {
        Log.d("WS", "已连接: ${response.code}")
        webSocket.send("Hello Server!")
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
        Log.d("WS", "收到文本: $text")
    }

    override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
        Log.d("WS", "收到二进制: ${bytes.hex()}")
    }

    override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
        Log.d("WS", "对端关闭: $code / $reason")
        webSocket.close(1000, null) // 完成关闭握手
    }

    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
        Log.d("WS", "连接关闭")
    }

    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        Log.e("WS", "连接失败: ${t.message}")
        // TODO: 实现重连逻辑
    }
}

// 异步发起连接（立即返回，不阻塞线程）
val webSocket: WebSocket = client.newWebSocket(request, listener)
```

---

### 1.7 发送消息

```kotlin
// 发送文本
val success = webSocket.send("Hello")

// 发送二进制
val bytes = ByteString.of(0x01, 0x02, 0x03)
webSocket.send(bytes)

// 发送 JSON
val json = """{"type":"ping","timestamp":${System.currentTimeMillis()}}"""
webSocket.send(json)

// 流量控制：检查队列
if (webSocket.queueSize() < 1024 * 1024) { // < 1MB 才发送
    webSocket.send(largeData)
}
```

---

### 1.8 关闭连接

```kotlin
// 优雅关闭（推荐）：发送 Close 帧，等待对端确认
webSocket.close(1000, "Normal Closure")

// 强制关闭：立即断开，不等待对端
webSocket.cancel()

// 关闭整个 OkHttpClient（释放所有连接和线程池）
client.dispatcher.executorService.shutdown()
client.connectionPool.evictAll()
```

---

### 1.9 自动重连实现示例

```kotlin
class ReconnectingWebSocket(
    private val client: OkHttpClient,
    private val url: String,
    private val maxRetries: Int = 5
) {
    private var webSocket: WebSocket? = null
    private var retryCount = 0
    private val handler = Handler(Looper.getMainLooper())

    fun connect() {
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, createListener())
    }

    private fun createListener() = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            retryCount = 0 // 连接成功，重置重试次数
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            scheduleReconnect()
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            if (code != 1000) scheduleReconnect() // 非正常关闭则重连
        }
    }

    private fun scheduleReconnect() {
        if (retryCount >= maxRetries) return
        val delay = minOf(1000L * (1 shl retryCount), 30_000L) // 指数退避，最大 30s
        retryCount++
        handler.postDelayed({ connect() }, delay)
    }

    fun disconnect() {
        handler.removeCallbacksAndMessages(null)
        webSocket?.close(1000, "User disconnect")
    }
}
```

---

### 1.10 WebSocket 关闭码参考

| 代码 | 含义 |
|------|------|
| 1000 | 正常关闭 |
| 1001 | 端点离开（如 server 重启） |
| 1002 | 协议错误 |
| 1003 | 收到不支持的数据类型 |
| 1006 | 连接异常断开（无 Close 帧） |
| 1007 | 数据格式不一致 |
| 1008 | 策略违反 |
| 1009 | 消息过大 |
| 1011 | 服务端内部错误 |
| 3000–3999 | 保留给库/框架使用 |
| 4000–4999 | 应用自定义 |

---

## 3. Java 原生 WebSocket（javax.websocket / Tyrus）

Android 没有内置 `javax.websocket`，需引入 Tyrus（JSR-356 参考实现）。适合需要标准 API 的场景。

### 2.1 依赖

```kotlin
implementation("org.glassfish.tyrus.bundles:tyrus-standalone-client:2.1.5")
```

### 2.2 注解式端点（@ClientEndpoint）

```java
@ClientEndpoint
public class MyWebSocketClient {

    private Session session;

    /** 连接建立后调用 */
    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        try {
            session.getBasicRemote().sendText("Hello");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /** 收到文本消息 */
    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("收到: " + message);
    }

    /** 收到二进制消息 */
    @OnMessage
    public void onBinaryMessage(ByteBuffer buffer, Session session) {
        // 处理二进制数据
    }

    /** 连接关闭 */
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        System.out.println("关闭: " + closeReason.getReasonPhrase());
    }

    /** 连接出错 */
    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }
}
```

### 2.3 连接与发送

```java
WebSocketContainer container = ContainerProvider.getWebSocketContainer();
URI uri = new URI("ws://localhost:8080/ws");

// 建立连接
Session session = container.connectToServer(MyWebSocketClient.class, uri);

// 发送文本（阻塞）
session.getBasicRemote().sendText("Hello");

// 发送二进制
session.getBasicRemote().sendBinary(ByteBuffer.wrap(data));

// 异步发送文本（非阻塞）
session.getAsyncRemote().sendText("Async message");

// 发送 Ping
session.getBasicRemote().sendPing(ByteBuffer.allocate(0));

// 关闭连接
session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Done"));
```

### 2.4 Session 常用 API

```java
// 获取 Session ID
String id = session.getId();

// 是否开启
boolean open = session.isOpen();

// 设置空闲超时（毫秒，0=不超时）
session.setMaxIdleTimeout(30_000);

// 设置最大文本消息长度
session.setMaxTextMessageBufferSize(65536);

// 设置最大二进制消息长度
session.setMaxBinaryMessageBufferSize(65536);

// 获取远端信息
RemoteEndpoint.Basic remote = session.getBasicRemote();
RemoteEndpoint.Async asyncRemote = session.getAsyncRemote();

// 获取所有同路径连接的 Session
Set<Session> sessions = session.getOpenSessions();
```

---

## 4. Ktor WebSocket Client

Ktor 是 JetBrains 出品的 Kotlin 原生网络框架，协程友好，适合 Kotlin 项目。

### 3.1 依赖

```kotlin
implementation("io.ktor:ktor-client-core:2.3.12")
implementation("io.ktor:ktor-client-okhttp:2.3.12") // Android 引擎
implementation("io.ktor:ktor-client-websockets:2.3.12")
```

### 3.2 创建客户端

```kotlin
val client = HttpClient(OkHttp) {
    install(WebSockets) {
        pingInterval = 20_000  // Ping 间隔（毫秒）
        maxFrameSize = Long.MAX_VALUE
        contentConverter = KotlinxWebsocketSerializationConverter(Json) // 可选：自动序列化
    }
}
```

### 3.3 建立连接与收发消息

```kotlin
// 在协程中调用，webSocket 块结束时连接自动关闭
client.webSocket(
    method = HttpMethod.Get,
    host = "echo.websocket.org",
    port = 443,
    path = "/",
    request = {
        url.protocol = URLProtocol.WSS
        header("Authorization", "Bearer token")
    }
) {
    // this: DefaultClientWebSocketSession

    // 发送文本帧
    send("Hello Server")

    // 发送二进制帧
    send(Frame.Binary(true, byteArrayOf(0x01, 0x02)))

    // 发送 Ping
    send(Frame.Ping(byteArrayOf()))

    // 循环接收消息
    for (frame in incoming) {
        when (frame) {
            is Frame.Text   -> println("Text: ${frame.readText()}")
            is Frame.Binary -> println("Binary: ${frame.readBytes().size} bytes")
            is Frame.Ping   -> send(Frame.Pong(frame.data))
            is Frame.Pong   -> println("Pong received")
            is Frame.Close  -> {
                val reason = frame.readReason()
                println("Close: ${reason?.code} ${reason?.message}")
                break
            }
        }
    }
}
```

### 3.4 并发发送（launch + 接收分离）

```kotlin
client.webSocket("wss://example.com/ws") {
    val sendJob = launch {
        repeat(10) { i ->
            send("Message $i")
            delay(1000)
        }
        close(CloseReason(CloseReason.Codes.NORMAL, "Done"))
    }

    // 接收在主协程中
    for (frame in incoming) {
        if (frame is Frame.Text) println(frame.readText())
    }

    sendJob.join()
}
```

### 3.5 DefaultClientWebSocketSession 常用 API

| API | 说明 |
|-----|------|
| `send(content: String)` | 发送文本帧 |
| `send(frame: Frame)` | 发送原始帧（Text/Binary/Ping/Pong/Close） |
| `incoming: ReceiveChannel<Frame>` | 接收帧的通道 |
| `outgoing: SendChannel<Frame>` | 发送帧的通道 |
| `close(reason: CloseReason)` | 发送 Close 帧并关闭 |
| `closeReason: Deferred<CloseReason?>` | 等待关闭原因 |
| `call.request.url` | 当前连接的 URL |

### 3.6 Frame 类型

```kotlin
sealed class Frame {
    class Text(fin: Boolean, data: ByteArray) : Frame()    // 文本帧
    class Binary(fin: Boolean, data: ByteArray) : Frame()  // 二进制帧
    class Ping(data: ByteArray) : Frame()                  // Ping
    class Pong(data: ByteArray) : Frame()                  // Pong
    class Close(data: ByteArray) : Frame()                 // 关闭帧

    // Frame.Text 扩展
    fun Frame.Text.readText(): String

    // Frame.Binary 扩展
    fun Frame.Binary.readBytes(): ByteArray

    // Frame.Close 扩展
    fun Frame.Close.readReason(): CloseReason?
}
```

---

## 5. Socket.IO Android Client

Socket.IO 在 WebSocket 之上构建了自动重连、事件模型、命名空间、房间等高级功能，协议层面和标准 WebSocket 不兼容。

### 4.1 依赖

```kotlin
implementation("io.socket:socket.io-client:2.1.1")
```

### 4.2 Socket 创建与配置

```kotlin
val options = IO.Options().apply {
    // 传输方式，默认 ["polling","websocket"]，可强制只用 WebSocket
    transports = arrayOf(WebSocket.NAME)
    // 重连参数
    reconnection = true
    reconnectionAttempts = Int.MAX_VALUE
    reconnectionDelay = 1000       // 初始重连延迟（ms）
    reconnectionDelayMax = 5000    // 最大重连延迟（ms）
    randomizationFactor = 0.5      // 延迟随机因子
    // 超时
    timeout = 20000
    // 认证
    auth = mapOf("token" to "your-token")
    // 查询参数
    query = "version=1&platform=android"
}

val socket: Socket = IO.socket("https://example.com", options)
// 连接到命名空间
val nspSocket: Socket = IO.socket("https://example.com/chat", options)
```

### 4.3 Socket 生命周期 API

```kotlin
// 连接
socket.connect()

// 断开（不触发重连）
socket.disconnect()

// 完全关闭，移除所有监听器
socket.close()

// 是否已连接
val connected: Boolean = socket.connected()

// 获取 Socket ID（连接成功后可用）
val id: String = socket.id()
```

### 4.4 事件监听

```kotlin
// 系统事件
socket.on(Socket.EVENT_CONNECT) {
    println("Connected, id=${socket.id()}")
}

socket.on(Socket.EVENT_DISCONNECT) { args ->
    val reason = args[0] as String
    println("Disconnected: $reason")
}

socket.on(Socket.EVENT_CONNECT_ERROR) { args ->
    val error = args[0] as Exception
    println("Connect error: ${error.message}")
}

// 自定义事件（接收）
socket.on("message") { args ->
    val data = args[0] as JSONObject  // 或 String/JSONArray
    println("收到消息: ${data.getString("text")}")
}

// 一次性监听
socket.once("welcome") { args ->
    println("只接收一次: ${args[0]}")
}

// 移除特定监听
val listener = Emitter.Listener { args -> /* ... */ }
socket.on("event", listener)
socket.off("event", listener)

// 移除某事件所有监听
socket.off("message")

// 移除所有监听
socket.off()
```

### 4.5 发送事件

```kotlin
// 发送字符串
socket.emit("message", "Hello")

// 发送 JSONObject
val data = JSONObject().apply {
    put("text", "Hello")
    put("timestamp", System.currentTimeMillis())
}
socket.emit("message", data)

// 发送多参数
socket.emit("event", "param1", 42, JSONObject())

// 发送并等待 ACK 回调
socket.emit("message", data, Ack { ackArgs ->
    println("服务端确认: ${ackArgs[0]}")
})

// 发送二进制（byte array 或 ByteArray 包在 JSONObject 中）
socket.emit("binary", byteArrayOf(0x01, 0x02, 0x03))
```

### 4.6 命名空间与房间

```kotlin
// 连接到不同命名空间
val chatSocket = IO.socket("https://example.com/chat")
val adminSocket = IO.socket("https://example.com/admin")

// 服务端控制房间，客户端通过 emit 加入/离开
chatSocket.emit("join", "room-123")
chatSocket.emit("leave", "room-123")

// 向命名空间广播（由服务端处理）
chatSocket.emit("broadcast", data)
```

---

## 6. Scarlet（Tinder 开源）

Scarlet 是 Tinder 开源的响应式 WebSocket 框架，类似 Retrofit 的声明式风格，支持 RxJava、协程、LiveData。

### 5.1 依赖

```kotlin
implementation("com.tinder.scarlet:scarlet:0.1.12")
implementation("com.tinder.scarlet:websocket-okhttp:0.1.12")
implementation("com.tinder.scarlet:message-adapter-gson:0.1.12") // 消息序列化
implementation("com.tinder.scarlet:stream-adapter-rxjava2:0.1.12") // 响应式流
// 或协程版
implementation("com.tinder.scarlet:stream-adapter-coroutines:0.1.12")
```

### 5.2 定义 Service 接口

```kotlin
interface ChatService {

    // 发送消息
    @Send
    fun sendMessage(message: ChatMessage)

    // 接收消息（返回 Flowable/Observable/ReceiveChannel）
    @Receive
    fun observeMessages(): Flowable<ChatMessage>

    // 观察连接状态
    @Receive
    fun observeWebSocketEvent(): Flowable<WebSocket.Event>

    // 发送文本（不经过序列化，直接发 String）
    @Send
    fun sendText(text: String)
}

data class ChatMessage(val id: String, val text: String, val timestamp: Long)
```

### 5.3 构建 Scarlet 实例

```kotlin
val okHttpClient = OkHttpClient.Builder()
    .readTimeout(0, TimeUnit.MILLISECONDS)
    .build()

val scarlet = Scarlet.Builder()
    .webSocketFactory(okHttpClient.newWebSocketFactory("wss://example.com/ws"))
    .addMessageAdapterFactory(GsonMessageAdapter.Factory())
    .addStreamAdapterFactory(RxJava2StreamAdapterFactory())
    // 生命周期感知（自动在 App 前台时连接，后台时断开）
    .lifecycle(AndroidLifecycle.ofApplicationForeground(application))
    .backoffStrategy(ExponentialBackoffStrategy(initialDurationMillis = 1_000, maxDurationMillis = 8_000))
    .build()

val chatService = scarlet.create<ChatService>()
```

### 5.4 使用

```kotlin
// 发送
chatService.sendMessage(ChatMessage("1", "Hello", System.currentTimeMillis()))

// 接收
chatService.observeMessages()
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe { message ->
        println("收到: ${message.text}")
    }

// 观察连接状态
chatService.observeWebSocketEvent()
    .subscribe { event ->
        when (event) {
            is WebSocket.Event.OnConnectionOpened<*> -> println("已连接")
            is WebSocket.Event.OnMessageReceived    -> println("收到帧")
            is WebSocket.Event.OnConnectionClosing  -> println("正在关闭")
            is WebSocket.Event.OnConnectionClosed   -> println("已关闭")
            is WebSocket.Event.OnConnectionFailed   -> println("连接失败: ${event.throwable}")
        }
    }
```

### 5.5 WebSocket.Event 类型

| Event | 说明 |
|-------|------|
| `OnConnectionOpened<*>` | 连接建立，携带底层 WebSocket 对象 |
| `OnMessageReceived` | 收到消息，携带 `Message`（Text 或 Bytes） |
| `OnConnectionClosing` | 收到 Close 帧（对端发起） |
| `OnConnectionClosed` | 连接关闭 |
| `OnConnectionFailed` | 连接失败，携带 `Throwable` |

---

## 7. reconnecting-websocket 模式

无论使用哪个库，生产环境都需要健壮的重连机制。以下是通用的状态机模式：

```kotlin
enum class ConnectionState {
    DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING
}

class RobustWebSocketManager(
    private val client: OkHttpClient,
    private val url: String
) : LifecycleObserver {

    private var webSocket: WebSocket? = null
    private var state = ConnectionState.DISCONNECTED
    private var retryCount = 0
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    // StateFlow 供 UI 观察
    private val _connectionState = MutableStateFlow(ConnectionState.DISCONNECTED)
    val connectionState: StateFlow<ConnectionState> = _connectionState

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 64)
    val messages: SharedFlow<String> = _messages

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun connect() {
        if (state == ConnectionState.CONNECTED || state == ConnectionState.CONNECTING) return
        state = ConnectionState.CONNECTING
        _connectionState.value = state
        doConnect()
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun disconnect() {
        retryCount = Int.MAX_VALUE // 阻止重连
        webSocket?.close(1000, "Lifecycle stop")
    }

    private fun doConnect() {
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                state = ConnectionState.CONNECTED
                retryCount = 0
                _connectionState.value = state
            }

            override fun onMessage(ws: WebSocket, text: String) {
                scope.launch { _messages.emit(text) }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                scheduleReconnect()
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                if (code != 1000) scheduleReconnect()
                else {
                    state = ConnectionState.DISCONNECTED
                    _connectionState.value = state
                }
            }
        })
    }

    private fun scheduleReconnect() {
        if (retryCount == Int.MAX_VALUE) return
        state = ConnectionState.RECONNECTING
        _connectionState.value = state
        val delay = minOf(1000L * (1L shl minOf(retryCount, 5)), 60_000L)
        retryCount++
        scope.launch {
            delay(delay)
            doConnect()
        }
    }

    fun send(message: String): Boolean {
        return webSocket?.send(message) ?: false
    }

    fun release() {
        scope.cancel()
        webSocket?.cancel()
        client.dispatcher.executorService.shutdown()
    }
}
```

---

## 8. 各方案对比

| 特性 | OkHttp WS | Tyrus (javax) | Ktor WS | Socket.IO | Scarlet |
|------|-----------|--------------|---------|-----------|---------|
| 协议标准 | RFC 6455 | JSR-356 | RFC 6455 | 自有协议 | RFC 6455 |
| 协程支持 | 需自行封装 | 否 | ✅ 原生 | 否 | ✅ 插件 |
| 自动重连 | 需自行实现 | 需自行实现 | 需自行实现 | ✅ 内置 | ✅ 内置 |
| 响应式支持 | 需封装 | 需封装 | Flow | RxJava | RxJava/Flow |
| 生命周期感知 | 否 | 否 | 否 | 否 | ✅ 内置 |
| 消息序列化 | 手动 | 手动 | 插件 | JSON 内置 | 插件 |
| 二进制支持 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Android 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**选型建议：**

- **新项目 Kotlin 优先** → Ktor WebSocket + 协程
- **已有 OkHttp 依赖** → OkHttp WebSocket（最轻量）
- **需要高级特性（房间/命名空间/自动重连）** → Socket.IO（但服务端也需用 Socket.IO）
- **响应式架构（RxJava）** → Scarlet
- **纯 Java 项目** → OkHttp 或 Tyrus

---

## 9. 常见问题 FAQ

### Q1: WebSocket 连接在 App 后台后断开？

Android 系统会对后台进程的网络连接进行限制（Doze 模式）。解决方案：
1. 使用 `ForegroundService` 维持 WebSocket 连接
2. 配合 `WorkManager` 做断线重连检测
3. 使用 FCM 推送替代长连接后台消息

### Q2: 如何处理 SSL/TLS 证书问题？

```kotlin
// 开发环境：信任所有证书（严禁用于生产）
val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
    override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
    override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
    override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
})
val sslContext = SSLContext.getInstance("TLS").apply {
    init(null, trustAllCerts, SecureRandom())
}
val client = OkHttpClient.Builder()
    .sslSocketFactory(sslContext.socketFactory, trustAllCerts[0] as X509TrustManager)
    .hostnameVerifier { _, _ -> true }
    .build()
```

### Q3: OkHttp WebSocket 的线程模型是什么？

- `onOpen`、`onMessage`、`onClosing`、`onClosed`、`onFailure` 均在 **OkHttp 内部线程池**的工作线程中调用
- 如需更新 UI，必须切换到主线程：`Handler(Looper.getMainLooper()).post { ... }` 或 `withContext(Dispatchers.Main)`

### Q4: 如何实现心跳检测？

```kotlin
// 方案一：OkHttp 内置 Ping（推荐）
OkHttpClient.Builder().pingInterval(30, TimeUnit.SECONDS)

// 方案二：应用层心跳（更可控）
val heartbeatJob = scope.launch {
    while (isActive) {
        delay(30_000)
        val success = webSocket.send("""{"type":"heartbeat"}""")
        if (!success) break // 发送失败说明连接已断
    }
}
```

### Q5: 消息乱序或丢失怎么办？

WebSocket 基于 TCP，保证消息有序到达，不会乱序。如需可靠投递（断线重连期间的消息不丢失），需业务层实现：
1. 消息序列号（seq）
2. 服务端消息持久化
3. 客户端重连后拉取离线消息

### Q6: 如何限制消息大小？

```kotlin
// OkHttp：默认无限制，但队列 >16MB 自动断开
// 检查队列大小进行背压控制
if (webSocket.queueSize() > 8 * 1024 * 1024) {
    // 暂停发送或丢弃低优先级消息
}

// Ktor：
install(WebSockets) {
    maxFrameSize = 10 * 1024 * 1024L // 10MB
}

// javax.websocket：
session.setMaxTextMessageBufferSize(1024 * 1024)   // 1MB
session.setMaxBinaryMessageBufferSize(1024 * 1024)
```

---

*文档版本：2026-05  
参考：OkHttp 4.12 / Ktor 2.3 / Socket.IO Client 2.1 / Scarlet 0.1.12*
