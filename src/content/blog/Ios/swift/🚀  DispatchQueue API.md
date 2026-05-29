---
title: "DispatchQueue API"
description: "DispatchQueue 是 GCD（Grand Central Dispatch）的核心，用于在多核处理器上执行并发任务。以下是对其 API 的全面介绍及使用示例。"
pubDate: 2026-05-29
category: "swift"
tags: [Swift, API]
draft: false
---
# 🚀  DispatchQueue API 全面指南

`DispatchQueue` 是 GCD（Grand Central Dispatch）的核心，用于在多核处理器上执行并发任务。以下是对其 API 的全面介绍及使用示例。

***

## 1. 创建队列

```swift
let serialQueue = DispatchQueue(label: "com.example.serial")
let concurrentQueue = DispatchQueue(label: "com.example.concurrent", attributes: .concurrent)
```

> 示例输出：队列本身不产生输出，需结合 `async/sync` 执行任务才会看到结果。

***

## 2. 同步执行 `sync`

```swift
let queue = DispatchQueue(label: "com.example.sync")
queue.sync {
    print("同步任务")
}
print("任务结束")
```

> 输出：

    同步任务
    任务结束

***

## 3. 异步执行 `async`

```swift
let queue = DispatchQueue(label: "com.example.async")
queue.async {
    print("异步任务")
}
print("主线程继续")
```

> 可能输出：

    主线程继续
    异步任务

***

## 4. 主队列

```swift
DispatchQueue.main.async {
    print("更新 UI")
}
```

> 输出：在主线程中执行 "更新 UI"，通常在界面更新中看到效果。

***

## 5. 全局队列

```swift
DispatchQueue.global().async {
    print("后台任务")
}
```

> 输出：

    后台任务

***

## 6. 延迟执行 `asyncAfter`

```swift
DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
    print("2 秒后执行")
}
```

> 输出（延迟 2 秒）：

    2 秒后执行

***

## 7. QoS（Quality of Service）

```swift
let queue = DispatchQueue(label: "com.qos", qos: .utility)
queue.async {
    print("Utility 优先级任务")
}
```

> 输出：

    Utility 优先级任务

***

## 8. Barrier 执行

```swift
let queue = DispatchQueue(label: "com.barrier", attributes: .concurrent)

queue.async {
    print("任务 1")
}
queue.async(flags: .barrier) {
    print("Barrier 写操作")
}
queue.async {
    print("任务 2")
}
```

> 输出示例：

    任务 1
    Barrier 写操作
    任务 2

***

## 9. DispatchGroup

```swift
let group = DispatchGroup()
let queue = DispatchQueue.global()

group.enter()
queue.async {
    print("任务 A")
    group.leave()
}

group.enter()
queue.async {
    print("任务 B")
    group.leave()
}

group.notify(queue: .main) {
    print("全部完成")
}
```

> 输出（顺序不固定）：

    任务 A
    任务 B
    全部完成

***

## 10. DispatchWorkItem

```swift
let work = DispatchWorkItem {
    print("任务块执行")
}

DispatchQueue.global().async(execute: work)
```

> 输出：

    任务块执行

***

## 11. 设置特定数据：`setSpecific` / `getSpecific`

```swift
let key = DispatchSpecificKey<String>()
let queue = DispatchQueue(label: "com.specific")
queue.setSpecific(key: key, value: "custom")

queue.async {
    if let val = DispatchQueue.getSpecific(key: key) {
        print("当前是自定义队列: \(val)")
    }
}
```

> 输出：

    当前是自定义队列: custom

***

## 12. autoreleaseFrequency

```swift
let queue = DispatchQueue(label: "com.example.auto", autoreleaseFrequency: .workItem)
queue.async {
    print("有自动释放池包裹")
}
```

> 输出：

    有自动释放池包裹

***

## 13. 设置 target 队列

```swift
let target = DispatchQueue(label: "target")
let queue = DispatchQueue(label: "child")
queue.setTarget(queue: target)
queue.async {
    print("重定向到 target")
}
```

> 输出：

    重定向到 target

***

## 14. 激活 / 挂起 / 恢复

```swift
let inactiveQueue = DispatchQueue(label: "inactive", attributes: [.concurrent, .initiallyInactive])

inactiveQueue.async {
    print("延迟启动的任务")
}

inactiveQueue.activate()
```

> 输出：

    延迟启动的任务

***

## 15. 并发 vs 串行总结

| 队列类型 | 同步 (`sync`) | 异步 (`async`) | 是否并发 |
| ---- | ----------- | ------------ | ---- |
| 主队列  | ✅ 阻塞        | ✅ 不阻塞        | ❌    |
| 串行队列 | ✅ 顺序执行      | ✅ 顺序执行       | ❌    |
| 并发队列 | ✅ 顺序执行      | ✅ 可并发        | ✅    |

> 使用 GCD 时需谨慎线程同步，避免死锁。

