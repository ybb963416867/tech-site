---
title: "DispatchQueue 各参数详解（Swift GCD 多线程）"
description: "Swift 的 DispatchQueue 是 GCD (Grand Central Dispatch) 提供的 任务调度管理工具，用于 控制线程执行方式、优先级、执行模式等。"
pubDate: 2026-05-29
category: "Swift"
tags: [Swift]
draft: false
---
# 🚀 DispatchQueue 各参数详解（Swift GCD 多线程）

Swift 的 `DispatchQueue` 是 **GCD (Grand Central Dispatch)** 提供的 **任务调度管理工具**，用于 **控制线程执行方式、优先级、执行模式等**。

***

## 📌 DispatchQueue 构造方法

```swift
let queue = DispatchQueue(
    label: "com.example.queue",
    qos: .userInitiated,               // ✅ 任务优先级
    attributes: .concurrent,            // ✅ 队列类型
    autoreleaseFrequency: .workItem,    // ✅ 自动释放策略
    target: DispatchQueue.global()      // ✅ 目标队列
)
```

***

## ✅ `label: String`（队列标识符）

| **参数**  | **类型**   | **作用**               |
| ------- | -------- | -------------------- |
| `label` | `String` | **唯一标识队列**，用于调试和日志分析 |

### 📌 示例

```swift
let queue = DispatchQueue(label: "com.yourapp.networkQueue")
```

🚀 **推荐：** 使用 **唯一字符串** 作为 `label` 便于调试。

***

## ✅ `qos: DispatchQoS`（队列优先级）

**决定任务的执行优先级，影响 CPU 资源调度。**

| **值**              | **优先级** | **适用场景**         |
| ------------------ | ------- | ---------------- |
| `.userInteractive` | 最高      | 立即执行，如 UI 更新、动画  |
| `.userInitiated`   | 高       | 用户触发的操作，如打开文件    |
| `.default`         | 中等（默认）  | 系统默认级别           |
| `.utility`         | 低       | 长时间任务，如下载、文件 I/O |
| `.background`      | 最低      | 低优先级任务，如数据同步     |
| `.unspecified`     | 不指定     | 继承调用方的 QoS       |

### 📌 示例

```swift
let queue = DispatchQueue(label: "com.example.queue", qos: .userInitiated)
```

✅ **`qos: .userInitiated` 让任务尽快执行，适用于用户触发的任务。**

***

## ✅ `attributes: DispatchQueue.Attributes`（队列类型）

| **值**                | **作用**                            |
| -------------------- | --------------------------------- |
| `.concurrent`        | **并发队列**，多个任务同时执行                 |
| `.initiallyInactive` | **初始暂停队列**，需要 `activate()` 才能开始执行 |

### 📌 示例

#### 1️⃣ 串行队列（默认）

```swift
let serialQueue = DispatchQueue(label: "com.example.serialQueue")
```

✅ **任务按顺序执行**

#### 2️⃣ 并发队列

```swift
let concurrentQueue = DispatchQueue(label: "com.example.concurrentQueue", attributes: .concurrent)
```

✅ **任务同时执行**

#### 3️⃣ 初始暂停队列

```swift
let inactiveQueue = DispatchQueue(label: "com.example.inactiveQueue", attributes: .initiallyInactive)
inactiveQueue.activate()  // ✅ 启动队列
```

✅ **适用于需要控制启动时间的任务**

***

## ✅ `autoreleaseFrequency: DispatchQueue.AutoreleaseFrequency`（自动释放策略）

| **值**       | **作用**                 |
| ----------- | ---------------------- |
| `.inherit`  | **继承上层队列的释放策略（默认）**    |
| `.workItem` | **任务完成后释放内存**（适用于后台队列） |
| `.never`    | **不自动释放（需要手动释放）**      |

### 📌 示例

```swift
let queue = DispatchQueue(label: "com.example.queue", autoreleaseFrequency: .workItem)
```

✅ **适用于高效管理内存的任务**

***

## ✅ `target: DispatchQueue?`（目标队列）

| **值**                    | **作用**          |
| ------------------------ | --------------- |
| `nil`                    | **默认使用全局队列**    |
| `DispatchQueue.global()` | **指定任务在哪个队列执行** |

### 📌 `target: DispatchQueue` 是否可以自定义？

✅ **可以！** `target` 参数允许你 **指定一个 "目标队列"**，让当前 `DispatchQueue` 运行在自定义的 **父队列**（Target Queue）上。

#### **1️⃣ 让队列继承属性**

```swift
let targetQueue = DispatchQueue(label: "com.example.targetQueue", qos: .utility)
let customQueue = DispatchQueue(label: "com.example.customQueue", target: targetQueue)
customQueue.async {
    print("Task running on targetQueue")
}
```

✅ **任务最终在 `targetQueue` 执行，而不是 `customQueue` 自己创建的线程。**

#### **2️⃣ `target` 控制并发任务顺序**

```swift
let serialTargetQueue = DispatchQueue(label: "com.example.serialTargetQueue")
let customConcurrentQueue = DispatchQueue(label: "com.example.concurrentQueue", attributes: .concurrent, target: serialTargetQueue)
customConcurrentQueue.async { print("Task 1") }
customConcurrentQueue.async { print("Task 2") }
```

✅ **即使 `customConcurrentQueue` 是并发队列，任务仍然按顺序执行，因为 `target` 是串行队列**。

#### **3️⃣ 多个队列共享 `target`**

```swift
let sharedQueue = DispatchQueue(label: "com.example.sharedQueue")
let queueA = DispatchQueue(label: "com.example.queueA", target: sharedQueue)
let queueB = DispatchQueue(label: "com.example.queueB", target: sharedQueue)
queueA.async { print("Task A") }
queueB.async { print("Task B") }
```

✅ **任务 `Task A` 和 `Task B` 都会在 `sharedQueue` 上执行**。

***

## 🚀 结论

| **参数**                 | **作用** | **示例**                                           |
| ---------------------- | ------ | ------------------------------------------------ |
| `label`                | 队列标识符  | `DispatchQueue(label: "com.example.queue")`      |
| `qos`                  | 任务优先级  | `qos: .userInitiated`                            |
| `attributes`           | 队列类型   | `.concurrent`（并发队列）                              |
| `autoreleaseFrequency` | 自动释放策略 | `.workItem`                                      |
| `target`               | 目标队列   | `target: DispatchQueue.global(qos: .background)` |

🚀 **推荐**

*   **高效任务执行？✅ 用 `DispatchQueue`**
*   **顺序执行任务？✅ 用 `serial`**
*   **并发任务？✅ 用 `concurrent`**
*   **管理内存？✅ 用 `autoreleaseFrequency`**
*   **任务调度？✅ 用 `qos`**

这样，你就可以 **完全掌控 Swift GCD 任务调度** 了！🚀🚀🚀
