---
title: "Swift Thread API 完整指南"
description: "[概述](概述) [创建和启动线程](创建和启动线程) [线程属性](线程属性) [线程状态](线程状态) [线程控制](线程控制) [线程本地存储](线程本地存储) [线程优先级](线程优先级) [线程通知](线程通知) [实际应用..."
pubDate: 2026-05-29
category: "swift"
tags: [Swift, API]
draft: false
---
# 🚀  Swift Thread API 完整指南

## 目录

*   [概述](#概述)
*   [创建和启动线程](#创建和启动线程)
*   [线程属性](#线程属性)
*   [线程状态](#线程状态)
*   [线程控制](#线程控制)
*   [线程本地存储](#线程本地存储)
*   [线程优先级](#线程优先级)
*   [线程通知](#线程通知)
*   [实际应用示例](#实际应用示例)
*   [最佳实践](#最佳实践)

## 概述

`Thread` 是 Foundation 框架中的类，用于创建和管理线程。虽然在现代 Swift 中推荐使用 GCD 或 Swift Concurrency，但 `Thread` 在某些场景下仍然有用。

```swift
import Foundation
```

## 创建和启动线程

### 1. 使用闭包创建线程

```swift
// 方式1：使用闭包初始化
let thread1 = Thread {
    print("线程1执行")
    for i in 1...5 {
        print("Thread 1: \(i)")
        Thread.sleep(forTimeInterval: 0.1)
    }
}
thread1.start()

// 方式2：使用 detachNewThread（立即启动）
Thread.detachNewThread {
    print("分离的线程执行")
}

// 方式3：使用 detachNewThreadSelector（Objective-C 风格）
class Worker: NSObject {
    @objc func doWork() {
        print("通过 selector 执行")
    }
}
let worker = Worker()
Thread.detachNewThreadSelector(#selector(Worker.doWork), 
                               toTarget: worker, 
                               with: nil)
```

### 2. 继承 Thread 类

```swift
class CustomThread: Thread {
    var message: String
    
    init(message: String) {
        self.message = message
        super.init()
    }
    
    override func main() {
        print("自定义线程: \(message)")
        // 检查是否被取消
        while !isCancelled {
            // 执行工作
            Thread.sleep(forTimeInterval: 0.5)
            print("Working...")
            break
        }
    }
}

let customThread = CustomThread(message: "Hello")
customThread.start()
```

## 线程属性

### 基本属性

```swift
let thread = Thread.current

// 线程名称
thread.name = "MyWorkerThread"
print("线程名称: \(thread.name ?? "未命名")")

// 线程标识符（只读）
print("线程ID: \(thread.threadId)")

// 栈大小（必须在启动前设置）
let newThread = Thread {
    print("新线程")
}
newThread.stackSize = 1024 * 1024 * 2  // 2MB
newThread.start()

// 服务质量（QoS）
thread.qualityOfService = .userInitiated
```

### 线程标识符扩展

```swift
extension Thread {
    var threadId: String {
        let pointer = Unmanaged.passUnretained(self).toOpaque()
        return String(describing: pointer)
    }
}
```

## 线程状态

### 状态检查

```swift
let thread = Thread {
    Thread.sleep(forTimeInterval: 2)
}

// 检查是否正在执行
print("执行中: \(thread.isExecuting)")

// 检查是否已完成
print("已完成: \(thread.isFinished)")

// 检查是否已取消
print("已取消: \(thread.isCancelled)")

// 检查是否是主线程
print("是主线程: \(thread.isMainThread)")
print("当前线程是主线程: \(Thread.isMainThread)")

// 检查是否是多线程环境
print("多线程环境: \(Thread.isMultiThreaded())")

thread.start()
```

## 线程控制

### 1. 休眠

```swift
// 休眠指定时间
Thread.sleep(forTimeInterval: 1.0)  // 休眠1秒

// 休眠到指定日期
Thread.sleep(until: Date().addingTimeInterval(2.0))
```

### 2. 取消线程

```swift
class CancellableThread: Thread {
    override func main() {
        while !isCancelled {
            print("工作中...")
            Thread.sleep(forTimeInterval: 0.5)
        }
        print("线程被取消")
    }
}

let thread = CancellableThread()
thread.start()

// 稍后取消
DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
    thread.cancel()  // 设置取消标志，需要线程自己检查
}
```

### 3. 退出线程

```swift
class ExitableThread: Thread {
    override func main() {
        for i in 1...10 {
            if i == 5 {
                Thread.exit()  // 立即终止当前线程（不推荐）
            }
            print("计数: \(i)")
        }
    }
}
```

## 线程本地存储

### Thread Dictionary

```swift
// 在线程中存储数据
Thread.current.threadDictionary["userID"] = "12345"
Thread.current.threadDictionary["userName"] = "John"

// 读取数据
if let userID = Thread.current.threadDictionary["userID"] as? String {
    print("User ID: \(userID)")
}

// 示例：每个线程有自己的存储
class DataThread: Thread {
    override func main() {
        // 每个线程有独立的 threadDictionary
        Thread.current.threadDictionary["threadData"] = "Thread-\(name ?? "")"
        
        if let data = Thread.current.threadDictionary["threadData"] {
            print("线程数据: \(data)")
        }
    }
}

for i in 1...3 {
    let thread = DataThread()
    thread.name = "\(i)"
    thread.start()
}
```

## 线程优先级

### 设置优先级

```swift
let thread = Thread {
    print("执行任务")
}

// 设置线程优先级（0.0 - 1.0）
thread.threadPriority = 0.8  // 高优先级
// 0.0 = 最低优先级
// 0.5 = 默认优先级
// 1.0 = 最高优先级

thread.start()

// 获取当前线程优先级
print("当前线程优先级: \(Thread.current.threadPriority)")
```

### QoS（服务质量）

```swift
let thread = Thread {
    print("QoS 线程")
}

// 设置 QoS
thread.qualityOfService = .userInteractive
// 可选值：
// .userInteractive - 最高优先级，用于 UI 更新
// .userInitiated   - 用户发起的任务
// .utility         - 长时间运行的任务
// .background      - 后台任务
// .default         - 默认

thread.start()
```

## 线程通知

### 线程将退出通知

```swift
// 监听线程退出通知
NotificationCenter.default.addObserver(
    forName: .NSThreadWillExit,
    object: nil,
    queue: nil
) { notification in
    if let thread = notification.object as? Thread {
        print("线程 \(thread.name ?? "未命名") 将要退出")
    }
}

// 创建会退出的线程
Thread.detachNewThread {
    Thread.current.name = "TestThread"
    print("线程开始")
    Thread.sleep(forTimeInterval: 1)
    print("线程结束")
    // 线程结束时会发送 NSThreadWillExit 通知
}
```

## 实际应用示例

### 1. 生产者-消费者模式

```swift
class ProducerConsumer {
    private var buffer: [Int] = []
    private let lock = NSLock()
    private let condition = NSCondition()
    private let maxSize = 5
    private var isRunning = true
    
    func start() {
        // 生产者线程
        let producer = Thread { [weak self] in
            guard let self = self else { return }
            
            for i in 1...20 {
                self.condition.lock()
                
                while self.buffer.count >= self.maxSize {
                    self.condition.wait()
                }
                
                self.buffer.append(i)
                print("📥 生产: \(i), 缓冲区: \(self.buffer.count)")
                
                self.condition.signal()
                self.condition.unlock()
                
                Thread.sleep(forTimeInterval: 0.1)
            }
            
            self.isRunning = false
        }
        producer.name = "Producer"
        
        // 消费者线程
        let consumer = Thread { [weak self] in
            guard let self = self else { return }
            
            while self.isRunning || !self.buffer.isEmpty {
                self.condition.lock()
                
                while self.buffer.isEmpty && self.isRunning {
                    self.condition.wait()
                }
                
                if !self.buffer.isEmpty {
                    let item = self.buffer.removeFirst()
                    print("📤 消费: \(item), 缓冲区: \(self.buffer.count)")
                    self.condition.signal()
                }
                
                self.condition.unlock()
                
                Thread.sleep(forTimeInterval: 0.2)
            }
        }
        consumer.name = "Consumer"
        
        producer.start()
        consumer.start()
    }
}
```

### 2. 后台任务处理器

```swift
class BackgroundTaskProcessor {
    private var workerThread: Thread?
    private var tasks: [() -> Void] = []
    private let lock = NSLock()
    private var shouldStop = false
    
    func start() {
        workerThread = Thread { [weak self] in
            Thread.current.name = "BackgroundWorker"
            self?.processLoop()
        }
        workerThread?.qualityOfService = .background
        workerThread?.start()
    }
    
    private func processLoop() {
        while !shouldStop {
            var task: (() -> Void)?
            
            lock.lock()
            if !tasks.isEmpty {
                task = tasks.removeFirst()
            }
            lock.unlock()
            
            if let task = task {
                task()
            } else {
                Thread.sleep(forTimeInterval: 0.1)
            }
        }
    }
    
    func addTask(_ task: @escaping () -> Void) {
        lock.lock()
        tasks.append(task)
        lock.unlock()
    }
    
    func stop() {
        shouldStop = true
        workerThread?.cancel()
    }
}

// 使用
let processor = BackgroundTaskProcessor()
processor.start()

for i in 1...10 {
    processor.addTask {
        print("执行任务 \(i)")
        Thread.sleep(forTimeInterval: 0.5)
    }
}
```

### 3. 定时器线程

```swift
class TimerThread: Thread {
    var interval: TimeInterval
    var handler: () -> Void
    private var shouldStop = false
    
    init(interval: TimeInterval, handler: @escaping () -> Void) {
        self.interval = interval
        self.handler = handler
        super.init()
        self.name = "TimerThread"
    }
    
    override func main() {
        while !isCancelled && !shouldStop {
            handler()
            Thread.sleep(forTimeInterval: interval)
        }
    }
    
    func stop() {
        shouldStop = true
        cancel()
    }
}

// 使用
let timer = TimerThread(interval: 1.0) {
    print("定时器触发: \(Date())")
}
timer.start()

// 5秒后停止
DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
    timer.stop()
}
```

### 4. 线程池实现

```swift
class SimpleThreadPool {
    private var threads: [Thread] = []
    private var taskQueue: [() -> Void] = []
    private let lock = NSCondition()
    private var isShutdown = false
    
    init(size: Int) {
        for i in 0..<size {
            let thread = Thread { [weak self] in
                Thread.current.name = "PoolThread-\(i)"
                self?.workerLoop()
            }
            threads.append(thread)
            thread.start()
        }
    }
    
    private func workerLoop() {
        while !isShutdown {
            var task: (() -> Void)?
            
            lock.lock()
            while taskQueue.isEmpty && !isShutdown {
                lock.wait()
            }
            
            if !taskQueue.isEmpty {
                task = taskQueue.removeFirst()
            }
            lock.unlock()
            
            task?()
        }
    }
    
    func execute(_ task: @escaping () -> Void) {
        lock.lock()
        taskQueue.append(task)
        lock.signal()
        lock.unlock()
    }
    
    func shutdown() {
        lock.lock()
        isShutdown = true
        lock.broadcast()
        lock.unlock()
        
        threads.forEach { $0.cancel() }
    }
}
```

## 最佳实践

### 1. 线程安全

```swift
class ThreadSafeCounter {
    private var count = 0
    private let lock = NSLock()
    
    func increment() {
        lock.lock()
        defer { lock.unlock() }
        count += 1
    }
    
    func getValue() -> Int {
        lock.lock()
        defer { lock.unlock() }
        return count
    }
}
```

### 2. 线程间通信

```swift
// 在后台线程执行，然后回到主线程更新 UI
Thread.detachNewThread {
    // 后台工作
    let result = "处理结果"
    
    // 回到主线程
    DispatchQueue.main.async {
        // 更新 UI
        print("更新 UI: \(result)")
    }
}
```

### 3. 资源清理

```swift
class ResourceThread: Thread {
    override func main() {
        // 设置线程名称便于调试
        Thread.current.name = "ResourceThread"
        
        // 注册清理通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(cleanup),
            name: .NSThreadWillExit,
            object: Thread.current
        )
        
        // 执行工作
        while !isCancelled {
            // 工作逻辑
            Thread.sleep(forTimeInterval: 0.1)
        }
    }
    
    @objc private func cleanup() {
        print("清理资源")
        // 清理代码
    }
}
```

## 注意事项

1.  **避免使用 Thread.exit()**：会立即终止线程，可能导致资源泄漏
2.  **检查 isCancelled**：在循环中定期检查取消状态
3.  **线程安全**：使用锁或其他同步机制保护共享资源
4.  **避免过多线程**：过多线程会增加上下文切换开销
5.  **优先使用高级 API**：优先考虑 GCD 或 Swift Concurrency

## Thread vs 其他并发方案

| 特性   | Thread | GCD   | Swift Concurrency |
| ---- | ------ | ----- | ----------------- |
| 控制粒度 | 高      | 中     | 低                 |
| 易用性  | 低      | 中     | 高                 |
| 性能   | 中      | 高     | 高                 |
| 现代性  | 旧      | 中     | 新                 |
| 推荐场景 | 特殊需求   | 大多数场景 | 新项目               |

## 总结

虽然 `Thread` 类提供了底层的线程控制能力，但在现代 Swift 开发中，应该优先考虑使用 GCD 或 Swift Concurrency。Thread 类主要用于：

*   需要精确控制线程生命周期的场景
*   与旧代码或 C/C++ 库集成
*   特定的实时处理需求
*   教学和理解线程概念

对于大多数应用场景，使用 `Task`、`async/await` 或 `DispatchQueue` 会是更好的选择。
