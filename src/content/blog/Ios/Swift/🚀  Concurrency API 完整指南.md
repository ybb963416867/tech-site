---
title: "Concurrency API 完整指南"
description: "Swift Concurrency 提供了一套完整的现代并发编程工具："
pubDate: 2026-05-29
category: "Swift"
tags: [Swift, API]
draft: false
---
# 🚀  Concurrency API 完整指南

## async/await 基础

### async 函数定义

```swift
// 定义异步函数
func fetchUserData() async -> String {
    // 模拟网络延迟
    try? await Task.sleep(nanoseconds: 1_000_000_000) // 1秒
    return "用户数据已加载"
}

// 抛出错误的异步函数
func fetchDataWithError() async throws -> Data {
    guard Bool.random() else {
        throw URLError(.badServerResponse)
    }
    return Data()
}
```

### await 调用

```swift
// 在异步上下文中调用
Task {
    let userData = await fetchUserData()
    print(userData)
    // 输出: 用户数据已加载
}

// 处理可能抛出错误的异步调用
Task {
    do {
        let data = try await fetchDataWithError()
        print("数据大小: \(data.count) bytes")
        // 输出: 数据大小: 0 bytes (如果成功)
    } catch {
        print("错误: \(error)")
        // 输出: 错误: Error Domain=NSURLErrorDomain Code=-1011 "(null)"
    }
}
```

## Task API

### Task 创建和管理

```swift
// 创建独立任务
let task = Task {
    print("任务开始")
    try? await Task.sleep(nanoseconds: 2_000_000_000)
    print("任务完成")
    return 42
}

// 获取任务结果
Task {
    let result = await task.value
    print("任务结果: \(result)")
    // 输出: 
    // 任务开始
    // 任务完成
    // 任务结果: 42
}
```

### Task 取消

```swift
let cancellableTask = Task {
    for i in 1...5 {
        // 检查是否被取消
        try Task.checkCancellation()
        print("处理步骤 \(i)")
        try? await Task.sleep(nanoseconds: 500_000_000)
    }
    return "完成"
}

// 2秒后取消任务
Task {
    try? await Task.sleep(nanoseconds: 2_000_000_000)
    cancellableTask.cancel()
    print("任务已取消")
}

// 输出:
// 处理步骤 1
// 处理步骤 2
// 处理步骤 3
// 任务已取消
```

### Task.detached

```swift
// 创建分离任务（不继承当前上下文）
Task.detached(priority: .background) {
    print("在后台线程运行")
    print("当前优先级: \(Task.currentPriority)")
    // 输出:
    // 在后台线程运行
    // 当前优先级: TaskPriority.background
}
```

### Task 优先级

```swift
// 设置任务优先级
Task(priority: .high) {
    print("高优先级任务")
}

Task(priority: .low) {
    print("低优先级任务")
}

// 可用的优先级:
// - .high
// - .medium (默认)
// - .low
// - .userInitiated
// - .utility
// - .background
```

## Actor

### 基本 Actor 定义

```swift
actor BankAccount {
    private var balance: Double = 0
    
    func deposit(amount: Double) {
        balance += amount
        print("存入: \(amount), 余额: \(balance)")
    }
    
    func withdraw(amount: Double) throws -> Double {
        guard balance >= amount else {
            throw BankError.insufficientFunds
        }
        balance -= amount
        print("取出: \(amount), 余额: \(balance)")
        return amount
    }
    
    func getBalance() -> Double {
        return balance
    }
}

enum BankError: Error {
    case insufficientFunds
}

// 使用 Actor
Task {
    let account = BankAccount()
    await account.deposit(amount: 1000)
    
    do {
        let withdrawn = try await account.withdraw(amount: 500)
        print("成功取出: \(withdrawn)")
    } catch {
        print("取款失败: \(error)")
    }
    
    let balance = await account.getBalance()
    print("当前余额: \(balance)")
}

// 输出:
// 存入: 1000.0, 余额: 1000.0
// 取出: 500.0, 余额: 500.0
// 成功取出: 500.0
// 当前余额: 500.0
```

### Actor 隔离

```swift
actor Counter {
    private var value = 0
    
    func increment() {
        value += 1
    }
    
    func getValue() -> Int {
        return value
    }
    
    // nonisolated 函数可以同步调用
    nonisolated func description() -> String {
        return "This is a counter actor"
    }
}

// 并发访问示例
Task {
    let counter = Counter()
    
    // 创建多个并发任务
    await withTaskGroup(of: Void.self) { group in
        for _ in 1...100 {
            group.addTask {
                await counter.increment()
            }
        }
    }
    
    let finalValue = await counter.getValue()
    print("最终计数: \(finalValue)")
    // 输出: 最终计数: 100 (保证线程安全)
    
    // 同步调用 nonisolated 函数
    print(counter.description())
    // 输出: This is a counter actor
}
```

## 结构化并发

### TaskGroup

```swift
// 使用 TaskGroup 并发执行多个任务
func fetchMultipleURLs() async -> [String] {
    await withTaskGroup(of: String.self) { group in
        let urls = ["url1", "url2", "url3"]
        
        for url in urls {
            group.addTask {
                // 模拟网络请求
                try? await Task.sleep(nanoseconds: UInt64.random(in: 100_000_000...500_000_000))
                return "数据来自 \(url)"
            }
        }
        
        var results: [String] = []
        for await result in group {
            results.append(result)
        }
        return results
    }
}

Task {
    let results = await fetchMultipleURLs()
    print("获取的结果:")
    results.forEach { print("- \($0)") }
}

// 输出:
// 获取的结果:
// - 数据来自 url2
// - 数据来自 url1
// - 数据来自 url3
// (顺序可能不同，取决于任务完成时间)
```

### ThrowingTaskGroup

```swift
func processDataWithErrors() async throws -> [Int] {
    try await withThrowingTaskGroup(of: Int.self) { group in
        for i in 1...5 {
            group.addTask {
                if i == 3 {
                    throw ProcessingError.failed
                }
                return i * 10
            }
        }
        
        var results: [Int] = []
        for try await result in group {
            results.append(result)
        }
        return results
    }
}

enum ProcessingError: Error {
    case failed
}

Task {
    do {
        let results = try await processDataWithErrors()
        print("处理结果: \(results)")
    } catch {
        print("处理失败: \(error)")
        // 输出: 处理失败: failed
    }
}
```

### async let 绑定

```swift
func fetchUserInfo() async -> (name: String, age: Int, email: String) {
    async let name = fetchName()
    async let age = fetchAge()
    async let email = fetchEmail()
    
    // 并发等待所有结果
    return await (name, age, email)
}

func fetchName() async -> String {
    try? await Task.sleep(nanoseconds: 200_000_000)
    return "张三"
}

func fetchAge() async -> Int {
    try? await Task.sleep(nanoseconds: 300_000_000)
    return 25
}

func fetchEmail() async -> String {
    try? await Task.sleep(nanoseconds: 100_000_000)
    return "zhangsan@example.com"
}

Task {
    let startTime = Date()
    let userInfo = await fetchUserInfo()
    let endTime = Date()
    
    print("用户信息: \(userInfo)")
    print("总耗时: \(endTime.timeIntervalSince(startTime))秒")
    // 输出:
    // 用户信息: (name: "张三", age: 25, email: "zhangsan@example.com")
    // 总耗时: 0.3秒 (约等于最长的任务时间，而非累加)
}
```

## AsyncSequence

### 基本 AsyncSequence

```swift
struct Counter: AsyncSequence {
    typealias Element = Int
    let limit: Int
    
    struct AsyncIterator: AsyncIteratorProtocol {
        let limit: Int
        var current = 1
        
        mutating func next() async -> Int? {
            guard current <= limit else { return nil }
            
            let value = current
            current += 1
            
            // 模拟异步操作
            try? await Task.sleep(nanoseconds: 100_000_000)
            return value
        }
    }
    
    func makeAsyncIterator() -> AsyncIterator {
        return AsyncIterator(limit: limit)
    }
}

// 使用 AsyncSequence
Task {
    let counter = Counter(limit: 5)
    
    for await number in counter {
        print("计数: \(number)")
    }
    print("计数完成")
}

// 输出:
// 计数: 1
// 计数: 2
// 计数: 3
// 计数: 4
// 计数: 5
// 计数完成
```

### AsyncStream

```swift
// 创建 AsyncStream
func makeNumberStream() -> AsyncStream<Int> {
    AsyncStream { continuation in
        Task {
            for i in 1...5 {
                continuation.yield(i)
                try? await Task.sleep(nanoseconds: 500_000_000)
            }
            continuation.finish()
        }
    }
}

// 使用 AsyncStream
Task {
    let stream = makeNumberStream()
    
    for await number in stream {
        print("收到数字: \(number)")
    }
    print("流结束")
}

// 输出:
// 收到数字: 1
// 收到数字: 2
// 收到数字: 3
// 收到数字: 4
// 收到数字: 5
// 流结束
```

### AsyncSequence 操作符

```swift
// 使用 map, filter, prefix 等操作符
Task {
    let numbers = AsyncStream<Int> { continuation in
        Task {
            for i in 1...10 {
                continuation.yield(i)
                try? await Task.sleep(nanoseconds: 100_000_000)
            }
            continuation.finish()
        }
    }
    
    let processed = numbers
        .filter { $0 % 2 == 0 }  // 只保留偶数
        .map { $0 * 10 }          // 乘以10
        .prefix(3)                // 只取前3个
    
    for await value in processed {
        print("处理后的值: \(value)")
    }
}

// 输出:
// 处理后的值: 20
// 处理后的值: 40
// 处理后的值: 60
```

## Continuations

### withCheckedContinuation

```swift
// 将基于回调的 API 转换为 async
func legacyAsyncOperation(completion: @escaping (String) -> Void) {
    DispatchQueue.global().asyncAfter(deadline: .now() + 1) {
        completion("传统异步操作完成")
    }
}

func modernAsyncOperation() async -> String {
    await withCheckedContinuation { continuation in
        legacyAsyncOperation { result in
            continuation.resume(returning: result)
        }
    }
}

Task {
    let result = await modernAsyncOperation()
    print(result)
    // 输出: 传统异步操作完成
}
```

### withCheckedThrowingContinuation

```swift
enum NetworkError: Error {
    case requestFailed
}

func legacyNetworkCall(completion: @escaping (Result<Data, Error>) -> Void) {
    DispatchQueue.global().asyncAfter(deadline: .now() + 1) {
        if Bool.random() {
            completion(.success(Data()))
        } else {
            completion(.failure(NetworkError.requestFailed))
        }
    }
}

func modernNetworkCall() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        legacyNetworkCall { result in
            switch result {
            case .success(let data):
                continuation.resume(returning: data)
            case .failure(let error):
                continuation.resume(throwing: error)
            }
        }
    }
}

Task {
    do {
        let data = try await modernNetworkCall()
        print("数据接收成功: \(data.count) bytes")
    } catch {
        print("网络请求失败: \(error)")
    }
}
```

## 全局 Actor

### MainActor

```swift
@MainActor
class ViewModel: ObservableObject {
    @Published var text = "初始文本"
    
    func updateText() {
        text = "更新后的文本"
        print("UI已更新: \(text)")
    }
    
    nonisolated func backgroundWork() async {
        print("在后台执行工作")
        
        // 需要更新 UI 时切换到主线程
        await MainActor.run {
            text = "从后台更新"
            print("从后台更新 UI: \(text)")
        }
    }
}

// 使用示例
Task {
    let viewModel = await ViewModel()
    await viewModel.updateText()
    await viewModel.backgroundWork()
}

// 输出:
// UI已更新: 更新后的文本
// 在后台执行工作
// 从后台更新 UI: 从后台更新
```

### 自定义全局 Actor

```swift
@globalActor
actor DataActor {
    static let shared = DataActor()
    
    private init() {}
}

@DataActor
class DataManager {
    private var cache: [String: String] = [:]
    
    func store(key: String, value: String) {
        cache[key] = value
        print("存储数据: \(key) = \(value)")
    }
    
    func retrieve(key: String) -> String? {
        let value = cache[key]
        print("检索数据: \(key) = \(value ?? "nil")")
        return value
    }
}

// 使用自定义全局 Actor
Task {
    let manager = await DataManager()
    await manager.store(key: "name", value: "Swift")
    let value = await manager.retrieve(key: "name")
    print("获取到的值: \(value ?? "无")")
}

// 输出:
// 存储数据: name = Swift
// 检索数据: name = Swift
// 获取到的值: Swift
```

## Sendable

### Sendable 协议

```swift
// 符合 Sendable 的结构体
struct User: Sendable {
    let id: Int
    let name: String
}

// 使用 @Sendable 闭包
func processConcurrently(handler: @Sendable () -> Void) {
    Task.detached {
        handler()
    }
}

// 使用 @unchecked Sendable (需要手动保证线程安全)
class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [String: Any] = [:]
    
    func set(_ value: Any, for key: String) {
        lock.lock()
        defer { lock.unlock() }
        storage[key] = value
    }
    
    func get(_ key: String) -> Any? {
        lock.lock()
        defer { lock.unlock() }
        return storage[key]
    }
}
```

### Sendable 约束

```swift
// 泛型约束
func processInBackground<T: Sendable>(_ value: T) {
    Task.detached {
        print("处理值: \(value)")
    }
}

// 条件 Sendable
struct Container<T> {
    let value: T
}

extension Container: Sendable where T: Sendable {}

// 使用示例
Task {
    let user = User(id: 1, name: "李四")
    processInBackground(user)
    
    let sendableContainer = Container(value: 42)
    processInBackground(sendableContainer)
}

// 输出:
// 处理值: User(id: 1, name: "李四")
// 处理值: Container<Int>(value: 42)
```

## 高级模式

### 任务本地值

```swift
enum TaskLocalValues {
    @TaskLocal
    static var requestID: String = "default"
}

func processRequest() async {
    print("请求 ID: \(TaskLocalValues.requestID)")
}

Task {
    await TaskLocalValues.$requestID.withValue("REQ-123") {
        await processRequest()
        
        await withTaskGroup(of: Void.self) { group in
            group.addTask {
                // 子任务继承任务本地值
                await processRequest()
            }
        }
    }
    
    // 在作用域外恢复默认值
    await processRequest()
}

// 输出:
// 请求 ID: REQ-123
// 请求 ID: REQ-123
// 请求 ID: default
```

### 异步序列转换

```swift
extension AsyncSequence {
    func collect() async rethrows -> [Element] {
        var results: [Element] = []
        for try await element in self {
            results.append(element)
        }
        return results
    }
}

// 使用示例
Task {
    let stream = AsyncStream<Int> { continuation in
        for i in 1...3 {
            continuation.yield(i)
        }
        continuation.finish()
    }
    
    let allValues = await stream.collect()
    print("收集的所有值: \(allValues)")
    // 输出: 收集的所有值: [1, 2, 3]
}
```

## 最佳实践

### 1. 避免死锁

```swift
// ❌ 错误: 可能导致死锁
actor BadExample {
    func method1() async {
        await method2()
    }
    
    func method2() async {
        await method1() // 递归调用可能导致死锁
    }
}

// ✅ 正确: 使用 nonisolated 或重新设计
actor GoodExample {
    private var state = 0
    
    func updateState() {
        state += 1
    }
    
    nonisolated func compute() async -> Int {
        // 不访问 actor 状态的计算
        return 42
    }
}
```

### 2. 合理使用取消

```swift
func downloadWithCancellation() async throws -> Data {
    let url = URL(string: "https://example.com/large-file")!
    
    return try await withTaskCancellationHandler {
        // 主要操作
        try await URLSession.shared.data(from: url).0
    } onCancel: {
        // 取消时的清理操作
        print("下载被取消")
    }
}
```

### 3. 错误处理

```swift
func robustAsyncOperation() async {
    do {
        let result = try await riskyOperation()
        print("成功: \(result)")
    } catch is CancellationError {
        print("操作被取消")
    } catch {
        print("发生错误: \(error)")
    }
}

func riskyOperation() async throws -> String {
    try Task.checkCancellation()
    // 执行可能失败的操作
    return "成功"
}
```

## 总结

Swift Concurrency 提供了一套完整的现代并发编程工具：

- **async/await**: 简化异步代码，使其像同步代码一样易读
- **Task**: 创建和管理并发任务
- **Actor**: 提供数据竞争保护，确保线程安全
- **结构化并发**: 通过 TaskGroup 和 async let 管理任务生命周期
- **AsyncSequence**: 处理异步数据流
- **Continuations**: 桥接传统回调 API
- **全局 Actor**: 如 MainActor，简化线程切换
- **Sendable**: 确保跨并发域的数据安全

使用这些 API 时，始终注意：

- 正确处理取消和错误
- 避免过度使用 actors（可能影响性能）
- 优先使用结构化并发而非非结构化任务
- 在适当的地方使用 Sendable 约束确保安全