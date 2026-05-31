# Android 进程间通信之 LocalSocket 详解

## 一、概述

`LocalSocket` 是 Android 提供的基于 **Unix Domain Socket（本地域套接字）** 的进程间通信机制。与普通 TCP/UDP Socket 不同，它完全在**内核内部**通过文件系统路径传递数据，不经过网络协议栈，因此具有更低的延迟和更高的安全性。

### 适用场景

- App 与 Native 守护进程（daemon）之间通信
- 同设备上两个进程之间的高效双向通信
- 需要传递文件描述符（FD）的场景
- 不想引入 Binder 复杂性的轻量 IPC 方案

### 与其他 IPC 方案对比

| 方案 | 跨进程 | 传输方式 | 适用场景 | 复杂度 |
|------|--------|---------|---------|--------|
| **LocalSocket** | ✅ | Unix Domain Socket | 双向流式通信、Native 互通 | 中 |
| **Binder/AIDL** | ✅ | 内核 Binder 驱动 | 标准 Android 服务调用 | 高 |
| **Messenger** | ✅ | 基于 Binder | 简单消息传递 | 低 |
| **共享内存** | ✅ | 内存映射 | 大数据量传输 | 高 |
| **Pipe** | ✅（父子进程）| 管道 | 单向数据流 | 低 |
| **BroadcastReceiver** | ✅ | Binder | 一对多事件广播 | 低 |

---

## 二、核心类介绍

### 2.1 `LocalSocket`

客户端 Socket，用于连接到服务端并进行读写。

```kotlin
import android.net.LocalSocket
import android.net.LocalSocketAddress
```

| 方法 | 说明 |
|------|------|
| `connect(address)` | 连接到指定地址的服务端 |
| `getInputStream()` | 获取输入流（读数据） |
| `getOutputStream()` | 获取输出流（写数据） |
| `close()` | 关闭连接 |
| `setReceiveBufferSize(size)` | 设置接收缓冲区大小 |
| `setSendBufferSize(size)` | 设置发送缓冲区大小 |
| `getFileDescriptor()` | 获取底层文件描述符 |
| `setFileDescriptorsForSend(fds)` | 发送文件描述符（辅助数据） |
| `getAncillaryFileDescriptors()` | 接收文件描述符 |

### 2.2 `LocalServerSocket`

服务端 Socket，监听并接受客户端连接。

```kotlin
import android.net.LocalServerSocket
```

| 方法 | 说明 |
|------|------|
| `LocalServerSocket(name)` | 创建并绑定到指定名称 |
| `accept()` | 阻塞等待客户端连接，返回 `LocalSocket` |
| `close()` | 关闭服务端 |
| `getFileDescriptor()` | 获取底层文件描述符 |

### 2.3 `LocalSocketAddress`

封装 Unix Domain Socket 的地址，包含名称和命名空间。

```kotlin
import android.net.LocalSocketAddress
```

#### 命名空间（Namespace）

| 命名空间 | 说明 | 路径前缀 |
|---------|------|---------|
| `FILESYSTEM` | 基于文件系统路径 | 实际文件路径（如 `/data/local/tmp/xxx.sock`） |
| `ABSTRACT` | 抽象命名空间（**推荐**） | 无文件，以 `\0` 开头，进程退出自动释放 |
| `RESERVED` | 系统保留（不建议使用） | — |

> **推荐使用 `ABSTRACT`**：无需文件权限管理，进程退出后自动清理，不会留下残留文件。

---

## 三、通信原理

```
┌─────────────────────────────────────────────────────┐
│                    Linux Kernel                      │
│                                                      │
│  Process A (Client)         Process B (Server)       │
│  ┌──────────────┐           ┌──────────────────┐    │
│  │ LocalSocket  │◄─────────►│LocalServerSocket │    │
│  │              │  双向通信  │                  │    │
│  └──────────────┘           └──────────────────┘    │
│         │                           │                │
│         └──────────┬────────────────┘                │
│                    │                                  │
│           Unix Domain Socket                         │
│        (内核缓冲区，不经过网络栈)                       │
└─────────────────────────────────────────────────────┘
```

数据流转路径：`写入 OutputStream → 内核 Socket 缓冲区 → 对端 InputStream 读取`，整个过程在内核内完成，无需序列化为网络包。

---

## 四、基础用法

### 4.1 服务端实现

```kotlin
class LocalSocketServer(private val socketName: String) {

    private var serverSocket: LocalServerSocket? = null
    private var isRunning = false
    private val serverThread = Thread { runServer() }

    fun start() {
        isRunning = true
        serverThread.start()
    }

    fun stop() {
        isRunning = false
        serverSocket?.close()
        serverThread.interrupt()
    }

    private fun runServer() {
        try {
            serverSocket = LocalServerSocket(socketName)
            Log.d(TAG, "Server started: $socketName")

            while (isRunning) {
                // 阻塞等待客户端连接
                val client = serverSocket?.accept() ?: break
                Log.d(TAG, "Client connected")
                // 每个连接开启独立线程处理
                Thread { handleClient(client) }.start()
            }
        } catch (e: IOException) {
            if (isRunning) Log.e(TAG, "Server error", e)
        }
    }

    private fun handleClient(socket: LocalSocket) {
        try {
            val input = socket.inputStream.bufferedReader()
            val output = socket.outputStream.bufferedWriter()

            while (true) {
                val line = input.readLine() ?: break  // 客户端断开时返回 null
                Log.d(TAG, "Received: $line")

                // 回复客户端
                output.write("Echo: $line\n")
                output.flush()
            }
        } catch (e: IOException) {
            Log.e(TAG, "Client handler error", e)
        } finally {
            socket.close()
            Log.d(TAG, "Client disconnected")
        }
    }

    companion object {
        private const val TAG = "LocalSocketServer"
    }
}
```

### 4.2 客户端实现

```kotlin
class LocalSocketClient(private val socketName: String) {

    private var socket: LocalSocket? = null
    private var output: BufferedWriter? = null
    private var input: BufferedReader? = null

    fun connect(): Boolean {
        return try {
            socket = LocalSocket()
            socket!!.connect(
                LocalSocketAddress(socketName, LocalSocketAddress.Namespace.ABSTRACT)
            )
            output = socket!!.outputStream.bufferedWriter()
            input = socket!!.inputStream.bufferedReader()
            Log.d(TAG, "Connected to $socketName")
            true
        } catch (e: IOException) {
            Log.e(TAG, "Connect failed", e)
            false
        }
    }

    fun sendMessage(message: String): String? {
        return try {
            output?.write("$message\n")
            output?.flush()
            input?.readLine() // 读取服务端响应
        } catch (e: IOException) {
            Log.e(TAG, "Send failed", e)
            null
        }
    }

    fun disconnect() {
        try {
            output?.close()
            input?.close()
            socket?.close()
        } catch (e: IOException) {
            Log.e(TAG, "Disconnect error", e)
        }
    }

    companion object {
        private const val TAG = "LocalSocketClient"
    }
}
```

### 4.3 使用示例

```kotlin
// === 进程 B：启动服务端 ===
val server = LocalSocketServer("com.example.myapp.ipc")
server.start()

// === 进程 A：客户端连接并通信（需在子线程执行）===
Thread {
    val client = LocalSocketClient("com.example.myapp.ipc")
    if (client.connect()) {
        val response = client.sendMessage("Hello Server")
        Log.d("IPC", "Response: $response")  // "Echo: Hello Server"
        client.disconnect()
    }
}.start()
```

---

## 五、进阶用法

### 5.1 传递二进制数据（字节流）

```kotlin
// 发送端：写入带长度头的二进制数据
fun sendBytes(data: ByteArray) {
    val out = DataOutputStream(socket.outputStream)
    out.writeInt(data.size)   // 先写 4 字节长度
    out.write(data)           // 再写实际数据
    out.flush()
}

// 接收端：先读长度，再读数据
fun receiveBytes(): ByteArray {
    val input = DataInputStream(socket.inputStream)
    val length = input.readInt()              // 读取 4 字节长度
    val buffer = ByteArray(length)
    input.readFully(buffer)                   // 读取完整数据
    return buffer
}
```

### 5.2 传递 JSON 消息（推荐协议格式）

定义消息协议：

```kotlin
data class IpcMessage(
    val type: String,
    val payload: String
)

// 发送 JSON
fun sendJson(message: IpcMessage) {
    val json = Gson().toJson(message)
    output.write("$json\n")
    output.flush()
}

// 接收 JSON
fun receiveJson(): IpcMessage? {
    val line = input.readLine() ?: return null
    return Gson().fromJson(line, IpcMessage::class.java)
}
```

### 5.3 传递文件描述符（FD）

LocalSocket 支持通过辅助数据（ancillary data）在进程间传递文件描述符，这是其独特优势。

```kotlin
// 发送端：附加 FD 一起发送
fun sendWithFileDescriptor(message: String, fd: FileDescriptor) {
    socket.setFileDescriptorsForSend(arrayOf(fd))
    val out = socket.outputStream
    out.write("$message\n".toByteArray())
    out.flush()
    // FD 随下一次写操作一起发出，发送后重置
    socket.setFileDescriptorsForSend(null)
}

// 接收端：读取附带的 FD
fun receiveWithFileDescriptor(): Pair<String, FileDescriptor?> {
    val input = socket.inputStream
    val buffer = ByteArray(1024)
    val len = input.read(buffer)
    val message = String(buffer, 0, len).trim()

    // 获取随消息传来的文件描述符
    val fds = socket.ancillaryFileDescriptors
    val fd = fds?.firstOrNull()
    return Pair(message, fd)
}
```

> **典型应用**：传递打开的摄像头 FD、共享内存 FD（`MemoryFile`）、管道 FD 等，实现零拷贝数据共享。

### 5.4 心跳保活机制

```kotlin
class HeartbeatLocalSocketClient(private val socketName: String) {

    private val heartbeatInterval = 5000L // 5秒
    private var isConnected = false
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    fun connectWithHeartbeat() {
        scope.launch {
            while (isActive) {
                if (!isConnected) {
                    tryConnect()
                }
                delay(heartbeatInterval)
                if (isConnected) {
                    sendHeartbeat()
                }
            }
        }
    }

    private fun tryConnect() {
        try {
            // ... 连接逻辑
            isConnected = true
        } catch (e: IOException) {
            Log.w(TAG, "Reconnect failed, retry in ${heartbeatInterval}ms")
        }
    }

    private fun sendHeartbeat() {
        try {
            // 发送心跳包，检测连接是否存活
            output?.write("PING\n")
            output?.flush()
        } catch (e: IOException) {
            isConnected = false
            Log.w(TAG, "Heartbeat failed, reconnecting...")
        }
    }
}
```

---

## 六、完整封装示例（生产可用）

### 6.1 消息协议定义

```kotlin
// 统一消息格式
data class SocketMessage(
    val id: Long = System.currentTimeMillis(),
    val type: String,
    val data: String = "",
    val error: String? = null
) {
    fun toJson(): String = Gson().toJson(this)

    companion object {
        fun fromJson(json: String): SocketMessage = Gson().fromJson(json, SocketMessage::class.java)
        const val TYPE_PING = "PING"
        const val TYPE_PONG = "PONG"
        const val TYPE_DATA = "DATA"
        const val TYPE_ACK  = "ACK"
    }
}
```

### 6.2 服务端封装

```kotlin
class IpcServer(
    private val socketName: String,
    private val onMessage: (socket: LocalSocket, message: SocketMessage) -> Unit
) {
    private var serverSocket: LocalServerSocket? = null
    private val clients = CopyOnWriteArrayList<LocalSocket>()
    private val executor = Executors.newCachedThreadPool()
    @Volatile private var running = false

    fun start() {
        running = true
        executor.execute {
            try {
                serverSocket = LocalServerSocket(socketName)
                Log.i(TAG, "IPC Server listening on: $socketName")
                while (running) {
                    val client = serverSocket?.accept() ?: break
                    clients.add(client)
                    executor.execute { serveClient(client) }
                }
            } catch (e: IOException) {
                if (running) Log.e(TAG, "Server accept error", e)
            }
        }
    }

    private fun serveClient(socket: LocalSocket) {
        try {
            val reader = socket.inputStream.bufferedReader()
            while (running) {
                val line = reader.readLine() ?: break
                val msg = runCatching { SocketMessage.fromJson(line) }.getOrNull() ?: continue
                when (msg.type) {
                    SocketMessage.TYPE_PING -> sendTo(socket, SocketMessage(type = SocketMessage.TYPE_PONG))
                    else -> onMessage(socket, msg)
                }
            }
        } catch (e: IOException) {
            Log.w(TAG, "Client error: ${e.message}")
        } finally {
            clients.remove(socket)
            socket.runCatching { close() }
        }
    }

    fun sendTo(socket: LocalSocket, message: SocketMessage) {
        try {
            socket.outputStream.bufferedWriter().apply {
                write("${message.toJson()}\n")
                flush()
            }
        } catch (e: IOException) {
            Log.e(TAG, "Send error", e)
        }
    }

    fun broadcast(message: SocketMessage) {
        clients.forEach { sendTo(it, message) }
    }

    fun stop() {
        running = false
        clients.forEach { it.runCatching { close() } }
        clients.clear()
        serverSocket?.runCatching { close() }
        executor.shutdownNow()
    }

    companion object { private const val TAG = "IpcServer" }
}
```

### 6.3 客户端封装

```kotlin
class IpcClient(
    private val socketName: String,
    private val onMessage: (SocketMessage) -> Unit,
    private val onDisconnected: () -> Unit = {}
) {
    private var socket: LocalSocket? = null
    private var writer: BufferedWriter? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    @Volatile var isConnected = false
        private set

    fun connect(timeoutMs: Long = 3000L): Boolean {
        return try {
            socket = LocalSocket().apply {
                connect(LocalSocketAddress(socketName, LocalSocketAddress.Namespace.ABSTRACT))
            }
            writer = socket!!.outputStream.bufferedWriter()
            isConnected = true
            startReceiving()
            Log.i(TAG, "Connected to $socketName")
            true
        } catch (e: IOException) {
            Log.e(TAG, "Connection failed: ${e.message}")
            false
        }
    }

    private fun startReceiving() {
        scope.launch {
            try {
                val reader = socket!!.inputStream.bufferedReader()
                while (isActive && isConnected) {
                    val line = reader.readLine() ?: break
                    val msg = runCatching { SocketMessage.fromJson(line) }.getOrNull() ?: continue
                    withContext(Dispatchers.Main) { onMessage(msg) }
                }
            } catch (e: IOException) {
                Log.w(TAG, "Receive error: ${e.message}")
            } finally {
                isConnected = false
                withContext(Dispatchers.Main) { onDisconnected() }
            }
        }
    }

    fun send(message: SocketMessage): Boolean {
        if (!isConnected) return false
        return try {
            writer?.apply {
                write("${message.toJson()}\n")
                flush()
            }
            true
        } catch (e: IOException) {
            Log.e(TAG, "Send failed", e)
            isConnected = false
            false
        }
    }

    fun disconnect() {
        isConnected = false
        scope.cancel()
        writer?.runCatching { close() }
        socket?.runCatching { close() }
    }

    companion object { private const val TAG = "IpcClient" }
}
```

---

## 七、与 Native（C/C++）层互通

Android 的 LocalSocket 可以与 Native 守护进程通信，这是其最重要的应用场景之一（如 `adbd`、`installd`、`vold` 等系统服务都使用此机制）。

### Native 服务端（C）

```c
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

int create_local_server(const char *socket_name) {
    int fd = socket(AF_UNIX, SOCK_STREAM, 0);

    struct sockaddr_un addr;
    memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;

    // 抽象命名空间：第一个字节为 \0
    addr.sun_path[0] = '\0';
    strncpy(addr.sun_path + 1, socket_name, sizeof(addr.sun_path) - 2);

    socklen_t len = offsetof(struct sockaddr_un, sun_path) + 1 + strlen(socket_name);
    bind(fd, (struct sockaddr *)&addr, len);
    listen(fd, 5);
    return fd;
}
```

### Kotlin 客户端连接 Native 服务端

```kotlin
// Android Java 层使用 ABSTRACT 命名空间，与 Native 的抽象 socket 对应
val socket = LocalSocket()
socket.connect(
    LocalSocketAddress("my_native_daemon", LocalSocketAddress.Namespace.ABSTRACT)
)
```

> **命名空间对应关系**：Native 端 `sun_path[0] = '\0'`（抽象命名空间）对应 Java 端 `Namespace.ABSTRACT`。

---

## 八、权限与安全

### 8.1 进程凭证验证（Credentials）

LocalSocket 支持获取对端进程的 PID、UID、GID，可用于身份验证：

```kotlin
// 服务端在 accept 后验证客户端身份
fun verifyClient(clientSocket: LocalSocket): Boolean {
    val credentials = clientSocket.peerCredentials
    val pid = credentials.pid
    val uid = credentials.uid

    Log.d(TAG, "Client PID=$pid, UID=$uid")

    // 验证 UID（例如只允许同一应用的进程）
    val myUid = android.os.Process.myUid()
    return uid == myUid
}
```

### 8.2 SELinux 策略

在 Android 5.0+ 中，SELinux 强制模式可能阻止跨进程的 LocalSocket 通信，需要在 SELinux 策略文件中添加：

```
# 允许 app 域连接到 daemon 的 socket
allow appdomain my_daemon_socket_t:sock_file rw_file_perms;
allow appdomain my_daemon:unix_stream_socket connectto;
```

### 8.3 安全建议

- 使用 `ABSTRACT` 命名空间，避免 `FILESYSTEM` 命名空间的文件权限管理问题
- 服务端通过 `peerCredentials` 验证客户端 UID，拒绝非授权进程
- 传输敏感数据时考虑在应用层加密
- Socket 名称不要暴露在公开文档中，避免第三方 App 连接

---

## 九、常见问题与解决

### 9.1 连接被拒绝（ECONNREFUSED）

**原因**：服务端未启动，或 socket 名称不匹配。

```kotlin
// 确保服务端先启动，客户端重试连接
fun connectWithRetry(maxRetries: Int = 5): Boolean {
    repeat(maxRetries) { attempt ->
        if (connect()) return true
        Thread.sleep(500L * (attempt + 1)) // 指数退避
    }
    return false
}
```

### 9.2 `EADDRINUSE`（地址已被占用）

**原因**：上次进程崩溃后 `FILESYSTEM` 类型的 socket 文件残留。

```kotlin
// 使用 ABSTRACT 命名空间可避免此问题
// 若必须用 FILESYSTEM，启动时先清理旧文件
val socketFile = File("/data/local/tmp/my.sock")
if (socketFile.exists()) socketFile.delete()
```

### 9.3 主线程 NetworkOnMainThreadException

LocalSocket 不受 `StrictMode` 网络限制，但 `accept()` / `readLine()` 是阻塞调用，**必须在子线程或协程中执行**：

```kotlin
// 错误：在主线程调用阻塞操作
socket.connect(address) // ❌ ANR 风险

// 正确：在 IO 线程执行
lifecycleScope.launch(Dispatchers.IO) {
    socket.connect(address) // ✅
}
```

### 9.4 数据粘包问题

TCP 流式传输存在粘包问题，需要自定义分包协议：

```kotlin
// 方案一：换行符分隔（适合文本消息）
output.write("message\n")

// 方案二：长度前缀（适合二进制数据）
// [4字节长度][N字节数据][4字节长度][N字节数据]...
val dos = DataOutputStream(socket.outputStream)
dos.writeInt(data.size)
dos.write(data)
```

### 9.5 服务端多客户端并发

`accept()` 是单线程阻塞，每个连接需单独线程处理：

```kotlin
// 使用线程池避免频繁创建线程
private val threadPool = Executors.newCachedThreadPool()

while (running) {
    val client = serverSocket.accept()
    threadPool.execute { handleClient(client) } // ✅ 线程池处理
}
```

---

## 十、注意事项总结

1. **所有 Socket 操作必须在子线程**，`accept()`、`read()` 均为阻塞调用，放在主线程会导致 ANR。
2. **优先使用 `ABSTRACT` 命名空间**，进程退出自动释放，无文件残留问题。
3. **必须处理 `IOException`**，网络断开、对端关闭都会触发异常，需做好重连逻辑。
4. **解决粘包问题**，流式 Socket 不保证一次 `write` 对应一次 `read`，需设计消息边界协议。
5. **及时关闭资源**，`LocalSocket` 和 `LocalServerSocket` 均需在 `finally` 中 `close()`，避免 FD 泄漏。
6. **注意 SELinux 策略**，Android 5.0+ SELinux 强制模式可能阻断跨进程通信，需配置正确策略。
7. **Socket 名称唯一性**，建议使用包名作为前缀（如 `com.example.app.ipc_channel`）避免命名冲突。
8. **传递 FD 需谨慎**，`setFileDescriptorsForSend` 传递的 FD 在接收端使用后需关闭，否则造成 FD 泄漏。
