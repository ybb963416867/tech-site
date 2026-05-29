---
title: "DispatchSemaphore 完全指南"
description: ""
pubDate: 2026-05-29
category: "swift"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀 DispatchSemaphore 完全指南

## 目录
1. [概述](#概述)
2. [基本概念](#基本概念)
3. [API 详解](#api-详解)
4. [使用场景](#使用场景)
5. [实战示例](#实战示例)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)
8. [性能对比](#性能对比)

---

## 概述

`DispatchSemaphore` 是 Grand Central Dispatch (GCD) 提供的一个同步原语，用于控制多个线程对共享资源的访问。

### 特点
- ✅ 线程安全
- ✅ 高效的信号量实现
- ✅ 支持超时机制
- ✅ 可用于限流和资源池管理
- ✅ 比 NSLock 更灵活

### 适用场景
- 限制并发数量
- 异步转同步
- 资源池管理
- 任务协调
- 流控（Rate Limiting）

---

## 基本概念

### 信号量原理

信号量维护一个计数器：
- **计数器 > 0**: 资源可用
- **计数器 = 0**: 资源不可用，线程等待
- **signal()**: 计数器 +1
- **wait()**: 计数器 -1（如果为 0 则阻塞）

```
初始值 = 1 (类似互斥锁)
┌──────┐
│  1   │ ← 初始状态，资源可用
└──────┘
   ↓ wait()
┌──────┐
│  0   │ ← 资源被占用
└──────┘
   ↓ signal()
┌──────┐
│  1   │ ← 资源释放
└──────┘
```

---

## API 详解

### 1. 初始化

#### `init(value: Int)`

创建一个信号量，指定初始值。

```swift
// 签名
public init(value: Int)

// 参数
// value: 信号量的初始值（必须 >= 0）
//   - 0: 初始状态阻塞
//   - 1: 类似互斥锁
//   - n: 允许 n 个线程同时访问
```

**示例**

```swift
// 创建一个互斥锁（只允许一个线程访问）
let semaphore = DispatchSemaphore(value: 1)

// 创建一个初始阻塞的信号量
let blockingSemaphore = DispatchSemaphore(value: 0)

// 允许最多 3 个线程同时访问
let poolSemaphore = DispatchSemaphore(value: 3)
```

---

### 2. wait() - 等待信号

#### `wait()`

无限期等待，直到信号量可用。

```swift
// 签名
public func wait()

// 行为
// - 如果计数器 > 0: 计数器 -1，立即返回
// - 如果计数器 = 0: 阻塞当前线程，直到 signal() 被调用
```

**示例**

```swift
let semaphore = DispatchSemaphore(value: 1)

// 线程 1
DispatchQueue.global().async {
    semaphore.wait()        // 计数器: 1 → 0
    print("线程 1 获得资源")
    // 执行任务...
    sleep(2)
    semaphore.signal()      // 计数器: 0 → 1
    print("线程 1 释放资源")
}

// 线程 2
DispatchQueue.global().async {
    semaphore.wait()        // 计数器为 0，阻塞等待
    print("线程 2 获得资源")
    // 执行任务...
    semaphore.signal()
}
```

**输出**
```
线程 1 获得资源
（等待 2 秒）
线程 1 释放资源
线程 2 获得资源
```

---

#### `wait(timeout: DispatchTime)` 

等待指定时间，超时返回结果。

```swift
// 签名
public func wait(timeout: DispatchTime) -> DispatchTimeoutResult

// 返回值
// - .success: 成功获得信号
// - .timedOut: 超时

// 参数
// timeout: 超时时间点
//   - .now(): 立即超时（非阻塞）
//   - .now() + .seconds(5): 5 秒后超时
//   - .now() + .milliseconds(100): 100 毫秒后超时
//   - .distantFuture: 无限等待
```

**示例**

```swift
let semaphore = DispatchSemaphore(value: 0)

// 等待 3 秒
let result = semaphore.wait(timeout: .now() + .seconds(3))

switch result {
case .success:
    print("成功获得信号")
    // 记得释放
    semaphore.signal()
case .timedOut:
    print("等待超时")
}
```

---

#### `wait(wallTimeout: DispatchWallTime)`

使用系统时钟时间等待。

```swift
// 签名
public func wait(wallTimeout: DispatchWallTime) -> DispatchTimeoutResult

// 区别
// - DispatchTime: 基于单调时钟（系统休眠时不计时）
// - DispatchWallTime: 基于系统时钟（系统休眠时继续计时）
```

**示例**

```swift
let semaphore = DispatchSemaphore(value: 0)

// 使用系统时钟时间
let deadline = DispatchWallTime.now() + .seconds(5)
let result = semaphore.wait(wallTimeout: deadline)

if result == .success {
    print("获得信号")
    semaphore.signal()
} else {
    print("超时")
}
```

---

### 3. signal() - 发送信号

#### `signal() -> Int`

增加信号量计数，唤醒一个等待的线程。

```swift
// 签名
@discardableResult
public func signal() -> Int

// 返回值
// - 返回调用前的计数值
// - 如果有线程等待，返回 0
// - 如果没有线程等待，返回非零值

// 行为
// - 计数器 +1
// - 如果有线程在 wait()，唤醒一个线程
```

**示例**

```swift
let semaphore = DispatchSemaphore(value: 0)

// 后台线程
DispatchQueue.global().async {
    print("开始等待...")
    semaphore.wait()
    print("收到信号！")
}

// 主线程，2 秒后发送信号
DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
    print("发送信号")
    let previousValue = semaphore.signal()
    print("之前的值: \(previousValue)")
}
```

**输出**
```
开始等待...
（等待 2 秒）
发送信号
之前的值: 0
收到信号！
```

---

## 使用场景

### 场景 1: 互斥锁（Mutex）

保护共享资源，同一时刻只允许一个线程访问。

```swift
class Counter {
    private var value = 0
    private let semaphore = DispatchSemaphore(value: 1)
    
    func increment() {
        semaphore.wait()        // 获取锁
        defer {
            semaphore.signal()  // 确保释放锁
        }
        
        value += 1
        print("Value: \(value)")
    }
}

let counter = Counter()

// 多线程同时调用
for _ in 0..<10 {
    DispatchQueue.global().async {
        counter.increment()
    }
}
```

---

### 场景 2: 限制并发数量

控制同时执行的任务数量。

```swift
class ConcurrencyLimiter {
    private let semaphore: DispatchSemaphore
    
    init(maxConcurrency: Int) {
        self.semaphore = DispatchSemaphore(value: maxConcurrency)
    }
    
    func execute(_ task: @escaping () -> Void) {
        DispatchQueue.global().async {
            self.semaphore.wait()
            defer { self.semaphore.signal() }
            
            task()
        }
    }
}

// 最多允许 3 个任务同时执行
let limiter = ConcurrencyLimiter(maxConcurrency: 3)

for i in 1...10 {
    limiter.execute {
        print("任务 \(i) 开始")
        sleep(2)
        print("任务 \(i) 完成")
    }
}
```

**输出**（每次执行最多 3 个任务）
```
任务 1 开始
任务 2 开始
任务 3 开始
（等待 2 秒）
任务 1 完成
任务 2 完成
任务 3 完成
任务 4 开始
任务 5 开始
任务 6 开始
...
```

---

### 场景 3: 异步转同步

将异步操作转换为同步等待。

```swift
func fetchDataSync(url: URL) -> Data? {
    let semaphore = DispatchSemaphore(value: 0)
    var result: Data? = nil
    
    // 异步网络请求
    URLSession.shared.dataTask(with: url) { data, response, error in
        result = data
        semaphore.signal()  // 完成后发送信号
    }.resume()
    
    // 等待请求完成
    semaphore.wait()
    return result
}

// 使用
if let data = fetchDataSync(url: URL(string: "https://api.example.com")!) {
    print("获取到数据: \(data.count) 字节")
}
```

**⚠️ 警告**：不要在主线程使用这种方式，会阻塞 UI。

---

### 场景 4: 资源池管理

管理有限的资源（如数据库连接池）。

```swift
class ResourcePool<T> {
    private var resources: [T]
    private let semaphore: DispatchSemaphore
    private let lock = NSLock()
    
    init(resources: [T]) {
        self.resources = resources
        self.semaphore = DispatchSemaphore(value: resources.count)
    }
    
    func acquire() -> T? {
        semaphore.wait()
        
        lock.lock()
        defer { lock.unlock() }
        
        return resources.isEmpty ? nil : resources.removeFirst()
    }
    
    func release(_ resource: T) {
        lock.lock()
        resources.append(resource)
        lock.unlock()
        
        semaphore.signal()
    }
}

// 使用示例：数据库连接池
class DatabaseConnection {
    let id: Int
    init(id: Int) { self.id = id }
}

let pool = ResourcePool(resources: [
    DatabaseConnection(id: 1),
    DatabaseConnection(id: 2),
    DatabaseConnection(id: 3)
])

// 获取连接
if let conn = pool.acquire() {
    print("获得连接 \(conn.id)")
    // 使用连接...
    sleep(1)
    pool.release(conn)
    print("释放连接 \(conn.id)")
}
```

---

### 场景 5: 生产者-消费者模式

协调生产者和消费者线程。

```swift
class ProducerConsumer<T> {
    private var queue: [T] = []
    private let lock = NSLock()
    private let notEmpty = DispatchSemaphore(value: 0)  // 队列非空信号
    private let notFull = DispatchSemaphore(value: 10)  // 队列未满信号（容量10）
    
    func produce(_ item: T) {
        notFull.wait()  // 等待队列有空位
        
        lock.lock()
        queue.append(item)
        print("生产: \(item)，队列长度: \(queue.count)")
        lock.unlock()
        
        notEmpty.signal()  // 通知有新数据
    }
    
    func consume() -> T {
        notEmpty.wait()  // 等待队列有数据
        
        lock.lock()
        let item = queue.removeFirst()
        print("消费: \(item)，队列长度: \(queue.count)")
        lock.unlock()
        
        notFull.signal()  // 通知有空位
        return item
    }
}

let pc = ProducerConsumer<Int>()

// 生产者
DispatchQueue.global().async {
    for i in 1...20 {
        pc.produce(i)
        Thread.sleep(forTimeInterval: 0.1)
    }
}

// 消费者
DispatchQueue.global().async {
    for _ in 1...20 {
        _ = pc.consume()
        Thread.sleep(forTimeInterval: 0.3)
    }
}
```

---

### 场景 6: 倒计时门栓（CountDownLatch）

等待多个任务完成。

```swift
class CountDownLatch {
    private var count: Int
    private let semaphore = DispatchSemaphore(value: 0)
    private let lock = NSLock()
    
    init(count: Int) {
        self.count = count
    }
    
    func countDown() {
        lock.lock()
        count -= 1
        let shouldSignal = count == 0
        lock.unlock()
        
        if shouldSignal {
            semaphore.signal()
        }
    }
    
    func wait() {
        semaphore.wait()
    }
}

// 使用示例：等待 5 个任务完成
let latch = CountDownLatch(count: 5)

for i in 1...5 {
    DispatchQueue.global().async {
        print("任务 \(i) 开始")
        sleep(UInt32.random(in: 1...3))
        print("任务 \(i) 完成")
        latch.countDown()
    }
}

print("等待所有任务完成...")
latch.wait()
print("所有任务已完成！")
```

---

### 场景 7: 流量控制（Rate Limiting）

限制操作频率。

```swift
class RateLimiter {
    private let semaphore: DispatchSemaphore
    private let interval: TimeInterval
    private let queue = DispatchQueue(label: "rate.limiter")
    
    init(maxRequests: Int, perInterval: TimeInterval) {
        self.semaphore = DispatchSemaphore(value: maxRequests)
        self.interval = perInterval
    }
    
    func execute(_ task: @escaping () -> Void) {
        semaphore.wait()
        
        task()
        
        // 在指定时间后释放信号量
        queue.asyncAfter(deadline: .now() + interval) {
            self.semaphore.signal()
        }
    }
}

// 每秒最多 3 个请求
let limiter = RateLimiter(maxRequests: 3, perInterval: 1.0)

for i in 1...10 {
    limiter.execute {
        print("\(Date()) - 请求 \(i)")
    }
}
```

---

## 实战示例

### 示例 1: 图片批量下载器

```swift
class ImageDownloader {
    private let semaphore: DispatchSemaphore
    private let maxConcurrent: Int
    
    init(maxConcurrent: Int = 3) {
        self.maxConcurrent = maxConcurrent
        self.semaphore = DispatchSemaphore(value: maxConcurrent)
    }
    
    func downloadImages(urls: [URL], completion: @escaping ([UIImage]) -> Void) {
        var images: [UIImage] = []
        let lock = NSLock()
        let group = DispatchGroup()
        
        for url in urls {
            group.enter()
            
            DispatchQueue.global().async {
                self.semaphore.wait()  // 限制并发数
                defer {
                    self.semaphore.signal()
                    group.leave()
                }
                
                if let data = try? Data(contentsOf: url),
                   let image = UIImage(data: data) {
                    lock.lock()
                    images.append(image)
                    lock.unlock()
                    print("下载完成: \(url.lastPathComponent)")
                }
            }
        }
        
        group.notify(queue: .main) {
            completion(images)
        }
    }
}

// 使用
let downloader = ImageDownloader(maxConcurrent: 3)
let urls = [
    URL(string: "https://example.com/image1.jpg")!,
    URL(string: "https://example.com/image2.jpg")!,
    // ... 更多 URL
]

downloader.downloadImages(urls: urls) { images in
    print("下载完成，共 \(images.count) 张图片")
}
```

---

### 示例 2: 数据库连接池

```swift
class DatabaseConnectionPool {
    private var connections: [DatabaseConnection]
    private let semaphore: DispatchSemaphore
    private let lock = NSLock()
    
    init(size: Int) {
        self.connections = (0..<size).map { DatabaseConnection(id: $0) }
        self.semaphore = DispatchSemaphore(value: size)
    }
    
    func withConnection<T>(_ block: (DatabaseConnection) throws -> T) rethrows -> T {
        semaphore.wait()
        
        lock.lock()
        let connection = connections.removeFirst()
        lock.unlock()
        
        defer {
            lock.lock()
            connections.append(connection)
            lock.unlock()
            semaphore.signal()
        }
        
        return try block(connection)
    }
}

// 使用
let pool = DatabaseConnectionPool(size: 5)

DispatchQueue.concurrentPerform(iterations: 20) { i in
    pool.withConnection { conn in
        print("线程 \(i) 使用连接 \(conn.id)")
        sleep(1)
        print("线程 \(i) 完成")
    }
}
```

---

### 示例 3: 任务队列

```swift
class TaskQueue {
    private let semaphore = DispatchSemaphore(value: 0)
    private var tasks: [() -> Void] = []
    private let lock = NSLock()
    private var isRunning = false
    
    func start() {
        guard !isRunning else { return }
        isRunning = true
        
        DispatchQueue.global().async {
            while self.isRunning {
                self.semaphore.wait()
                
                self.lock.lock()
                guard !self.tasks.isEmpty else {
                    self.lock.unlock()
                    continue
                }
                let task = self.tasks.removeFirst()
                self.lock.unlock()
                
                task()
            }
        }
    }
    
    func stop() {
        isRunning = false
        semaphore.signal()
    }
    
    func addTask(_ task: @escaping () -> Void) {
        lock.lock()
        tasks.append(task)
        lock.unlock()
        semaphore.signal()
    }
}

// 使用
let queue = TaskQueue()
queue.start()

for i in 1...5 {
    queue.addTask {
        print("执行任务 \(i)")
        sleep(1)
    }
}

// 5 秒后停止
DispatchQueue.main.asyncAfter(deadline: .now() + 6) {
    queue.stop()
}
```

---

## 最佳实践

### 1. 始终使用 defer 释放

```swift
// ✅ 推荐：使用 defer 确保释放
func criticalSection() {
    semaphore.wait()
    defer { semaphore.signal() }
    
    // 即使抛出异常也会释放
    // 执行关键代码...
}

// ❌ 不推荐：手动释放可能遗漏
func criticalSection() {
    semaphore.wait()
    // 如果这里抛出异常，signal() 不会被调用
    semaphore.signal()
}
```

---

### 2. 避免在主线程无限等待

```swift
// ❌ 错误：阻塞主线程
DispatchQueue.main.async {
    semaphore.wait()  // 可能永久阻塞 UI
    // ...
}

// ✅ 正确：使用超时或在后台线程
DispatchQueue.global().async {
    semaphore.wait()
    // ...
}

// ✅ 或使用超时
let result = semaphore.wait(timeout: .now() + .seconds(5))
if result == .timedOut {
    print("超时")
}
```

---

### 3. 注意死锁

```swift
// ❌ 死锁示例
let semaphore = DispatchSemaphore(value: 1)

DispatchQueue.global().async {
    semaphore.wait()
    print("外层获取")
    
    semaphore.wait()  // 死锁！永远无法获取
    print("内层获取")
    
    semaphore.signal()
    semaphore.signal()
}

// ✅ 避免死锁：不要嵌套等待同一个信号量
```

---

### 4. 合理设置初始值

```swift
// 互斥锁：初始值 = 1
let mutex = DispatchSemaphore(value: 1)

// 初始阻塞：初始值 = 0
let blockSemaphore = DispatchSemaphore(value: 0)

// 资源池：初始值 = 资源数量
let pool = DispatchSemaphore(value: 5)

// ❌ 错误：负数会崩溃
// let invalid = DispatchSemaphore(value: -1)  // 崩溃！
```

---

### 5. 超时处理

```swift
// ✅ 推荐：处理超时情况
let result = semaphore.wait(timeout: .now() + .seconds(5))

switch result {
case .success:
    defer { semaphore.signal() }
    // 执行任务...
    
case .timedOut:
    print("等待超时")
    // 不要调用 signal()
}

// ❌ 错误：超时后还释放信号量
if semaphore.wait(timeout: .now() + .seconds(5)) == .timedOut {
    semaphore.signal()  // 错误！会导致计数不平衡
}
```

---

### 6. 性能考虑

```swift
// 对于简单的互斥锁，考虑使用 NSLock
// NSLock 比 DispatchSemaphore 更轻量

// ✅ 简单互斥：使用 NSLock
let lock = NSLock()

// ✅ 需要超时、限流等高级功能：使用 DispatchSemaphore
let semaphore = DispatchSemaphore(value: 3)
```

---

## 常见问题

### Q1: signal() 可以多次调用吗？

**A**: 可以，但要注意计数平衡。

```swift
let semaphore = DispatchSemaphore(value: 1)

semaphore.signal()  // 计数: 1 → 2
semaphore.signal()  // 计数: 2 → 3

// 现在可以 wait() 3 次不阻塞
semaphore.wait()    // 计数: 3 → 2
semaphore.wait()    // 计数: 2 → 1
semaphore.wait()    // 计数: 1 → 0
```

---

### Q2: wait() 和 signal() 必须成对出现吗？

**A**: 是的，否则会导致计数不平衡。

```swift
// ❌ 错误示例
semaphore.wait()
semaphore.wait()
semaphore.signal()  // 只释放一次，另一个 wait() 可能永久阻塞

// ✅ 正确示例
semaphore.wait()
semaphore.signal()

semaphore.wait()
semaphore.signal()
```

---

### Q3: DispatchSemaphore vs NSLock？

**A**: 

| 特性 | DispatchSemaphore | NSLock |
|------|-------------------|--------|
| 用途 | 多种场景 | 简单互斥 |
| 超时支持 | ✅ | ❌ |
| 初始值 | 可配置 | N/A |
| 性能 | 稍慢 | 更快 |
| 灵活性 | 高 | 低 |

**建议**: 简单互斥用 NSLock，需要高级功能用 DispatchSemaphore。

---

### Q4: 为什么不推荐在主线程使用？

**A**: 会阻塞 UI。

```swift
// ❌ 阻塞主线程
DispatchQueue.main.async {
    semaphore.wait()  // UI 冻结
    // 执行耗时操作
    semaphore.signal()
}

// ✅ 在后台线程
DispatchQueue.global().async {
    semaphore.wait()
    // 执行耗时操作
    semaphore.signal()
}
```

---

### Q5: 如何避免死锁？

**A**: 

1. **不要嵌套等待同一个信号量**
2. **使用超时机制**
3. **确保 wait() 和 signal() 成对**
4. **避免循环依赖**

```swift
// ✅ 使用超时避免死锁
let result = semaphore.wait(timeout: .now() + .seconds(10))
if result == .timedOut {
    print("可能发生死锁")
}
```

---

## 性能对比

### 性能测试代码

```swift
import Foundation

func benchmarkLock(iterations: Int, name: String, block: () -> Void) {
    let start = Date()
    for _ in 0..<iterations {
        block()
    }
    let elapsed = Date().timeIntervalSince(start)
    print("\(name): \(elapsed * 1000)ms (\(Int(Double(iterations) / elapsed))/s)")
}

let iterations = 1_000_000

// DispatchSemaphore
let semaphore = DispatchSemaphore(value: 1)
benchmarkLock(iterations: iterations, name: "DispatchSemaphore") {
    semaphore.wait()
    semaphore.signal()
}

// NSLock
let nslock = NSLock()
benchmarkLock(iterations: iterations, name: "NSLock") {
    nslock.lock()
    nslock.unlock()
}

// os_unfair_lock (最快)
var unfairLock = os_unfair_lock()
benchmarkLock(iterations: iterations, name: "os_unfair_lock") {
    os_unfair_lock_lock(&unfairLock)
    os_unfair_lock_unlock(&unfairLock)
}
```

### 性能结果（参考）

```
os_unfair_lock:        150ms  (6,666,667/s)
NSLock:                200ms  (5,000,000/s)
DispatchSemaphore:     350ms  (2,857,143/s)
```

### 选择建议

- **高性能互斥**: `os_unfair_lock`
- **简单互斥**: `NSLock`
- **高级功能**: `DispatchSemaphore`
- **读写锁**: `pthread_rwlock`
- **递归锁**: `NSRecursiveLock`

---

## 总结

### DispatchSemaphore 的优势

✅ **灵活性高**: 可配置初始值，适用多种场景  
✅ **功能丰富**: 支持超时、限流、资源池等  
✅ **线程安全**: GCD 保证  
✅ **跨平台**: 适用 iOS/macOS/watchOS/tvOS  

### 使用建议

1. **互斥锁**: 简单场景用 NSLock，复杂场景用 DispatchSemaphore
2. **限流**: DispatchSemaphore 是最佳选择
3. **资源池**: DispatchSemaphore 完美适用
4. **异步转同步**: 可用但要注意线程阻塞

### 注意事项

⚠️ **避免主线程阻塞**  
⚠️ **确保 wait/signal 平衡**  
⚠️ **使用 defer 确保释放**  
⚠️ **注意死锁风险**  
⚠️ **合理使用超时机制**  

---

## 参考资源

- [Apple Documentation - DispatchSemaphore](https://developer.apple.com/documentation/dispatch/dispatchsemaphore)
- [Swift Concurrency](https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html)
- [Grand Central Dispatch Tutorial](https://www.raywenderlich.com/5370-grand-central-dispatch-tutorial-for-swift-4-part-1-2)
