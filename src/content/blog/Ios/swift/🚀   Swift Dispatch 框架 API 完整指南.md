---
title: "Swift Dispatch 框架 API 完整指南"
description: "Dispatch 框架（也称为 Grand Central Dispatch，GCD）是 Swift 中用于并发编程的核心框架。它提供了一套强大的 API 来管理任务的并发执行、队列管理和线程同步。"
pubDate: 2026-05-29
category: "swift"
tags: [Mac, iOS, Swift, Array, API]
draft: false
---
# 🚀  Swift Dispatch 框架 API 完整指南

## 概述

Dispatch 框架（也称为 Grand Central Dispatch，GCD）是 Swift 中用于并发编程的核心框架。它提供了一套强大的 API 来管理任务的并发执行、队列管理和线程同步。

## 1. DispatchQueue - 调度队列

### 1.1 创建队列

#### 全局队列

```swift
import Dispatch

// 获取全局队列
let globalQueue = DispatchQueue.global()
let highPriorityQueue = DispatchQueue.global(qos: .userInitiated)
let backgroundQueue = DispatchQueue.global(qos: .background)

print("全局队列创建成功")
// 输出: 全局队列创建成功
```

#### 主队列

```swift
let mainQueue = DispatchQueue.main

print("主队列获取成功")
// 输出: 主队列获取成功
```

#### 自定义队列

```swift
// 串行队列
let serialQueue = DispatchQueue(label: "com.example.serial")

// 并发队列
let concurrentQueue = DispatchQueue(label: "com.example.concurrent", 
                                   attributes: .concurrent)

print("自定义队列创建完成")
// 输出: 自定义队列创建完成
```

### 1.2 异步执行任务

#### async - 异步执行

```swift
DispatchQueue.global().async {
    print("异步任务开始执行 - 线程: \(Thread.current)")
    Thread.sleep(forTimeInterval: 1)
    print("异步任务执行完成")
}

print("主线程继续执行")

// 输出:
// 主线程继续执行
// 异步任务开始执行 - 线程: <NSThread: 0x...>{number = 2, name = (null)}
// 异步任务执行完成
```

#### sync - 同步执行

```swift
print("同步任务开始前")

DispatchQueue.global().sync {
    print("同步任务执行中 - 线程: \(Thread.current)")
    Thread.sleep(forTimeInterval: 0.5)
}

print("同步任务完成后")

// 输出:
// 同步任务开始前
// 同步任务执行中 - 线程: <NSThread: 0x...>{number = 2, name = (null)}
// 同步任务完成后
```

### 1.3 延迟执行

#### asyncAfter - 延迟异步执行

```swift
print("延迟任务安排前: \(Date())")

DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
    print("延迟任务执行: \(Date())")
}

// 输出:
// 延迟任务安排前: 2024-01-15 10:30:00 +0000
// 延迟任务执行: 2024-01-15 10:30:02 +0000
```

## 2. DispatchWorkItem - 工作项

### 2.1 创建和执行工作项

```swift
let workItem = DispatchWorkItem {
    print("工作项开始执行")
    for i in 1...3 {
        print("工作项步骤 \(i)")
        Thread.sleep(forTimeInterval: 0.5)
    }
    print("工作项执行完成")
}

DispatchQueue.global().async(execute: workItem)

// 等待工作项完成
workItem.wait()
print("主线程确认工作项完成")

// 输出:
// 工作项开始执行
// 工作项步骤 1
// 工作项步骤 2
// 工作项步骤 3
// 工作项执行完成
// 主线程确认工作项完成
```

### 2.2 取消工作项

```swift
let cancelableWorkItem = DispatchWorkItem {
    for i in 1...10 {
        if DispatchWorkItem.current?.isCancelled == true {
            print("工作项被取消")
            return
        }
        print("执行步骤 \(i)")
        Thread.sleep(forTimeInterval: 0.3)
    }
}

DispatchQueue.global().async(execute: cancelableWorkItem)

// 1秒后取消
DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
    cancelableWorkItem.cancel()
    print("发送取消信号")
}

// 输出:
// 执行步骤 1
// 执行步骤 2
// 执行步骤 3
// 发送取消信号
// 工作项被取消
```

## 3. DispatchGroup - 调度组

### 3.1 基本使用

```swift
let group = DispatchGroup()

print("开始组任务")

group.enter()
DispatchQueue.global().async {
    print("任务1开始")
    Thread.sleep(forTimeInterval: 1)
    print("任务1完成")
    group.leave()
}

group.enter()
DispatchQueue.global().async {
    print("任务2开始")
    Thread.sleep(forTimeInterval: 2)
    print("任务2完成")
    group.leave()
}

group.notify(queue: .main) {
    print("所有组任务完成")
}

// 输出:
// 开始组任务
// 任务1开始
// 任务2开始
// 任务1完成
// 任务2完成
// 所有组任务完成
```

### 3.2 等待组完成

```swift
let waitGroup = DispatchGroup()

for i in 1...3 {
    waitGroup.enter()
    DispatchQueue.global().async {
        print("批量任务 \(i) 执行")
        Thread.sleep(forTimeInterval: Double(i))
        print("批量任务 \(i) 完成")
        waitGroup.leave()
    }
}

print("等待所有批量任务完成...")
waitGroup.wait()
print("所有批量任务已完成")

// 输出:
// 等待所有批量任务完成...
// 批量任务 1 执行
// 批量任务 2 执行
// 批量任务 3 执行
// 批量任务 1 完成
// 批量任务 2 完成
// 批量任务 3 完成
// 所有批量任务已完成
```

## 4. DispatchSemaphore - 信号量

### 4.1 控制并发数量

```swift
let semaphore = DispatchSemaphore(value: 2) // 最多允许2个并发任务

func performTask(id: Int) {
    semaphore.wait() // 获取信号量
    
    DispatchQueue.global().async {
        print("任务 \(id) 开始执行")
        Thread.sleep(forTimeInterval: 2)
        print("任务 \(id) 执行完成")
        semaphore.signal() // 释放信号量
    }
}

for i in 1...5 {
    performTask(id: i)
}

Thread.sleep(forTimeInterval: 10) // 等待所有任务完成

// 输出:
// 任务 1 开始执行
// 任务 2 开始执行
// 任务 1 执行完成
// 任务 3 开始执行
// 任务 2 执行完成
// 任务 4 开始执行
// 任务 3 执行完成
// 任务 5 开始执行
// 任务 4 执行完成
// 任务 5 执行完成
```

## 5. DispatchSource - 调度源

### 5.1 定时器源

```swift
var counter = 0
let timer = DispatchSource.makeTimerSource(queue: .main)

timer.schedule(deadline: .now(), repeating: 1.0)
timer.setEventHandler {
    counter += 1
    print("定时器触发 - 第 \(counter) 次")
    
    if counter >= 5 {
        timer.cancel()
        print("定时器已取消")
    }
}

timer.resume()

// 输出:
// 定时器触发 - 第 1 次
// 定时器触发 - 第 2 次
// 定时器触发 - 第 3 次
// 定时器触发 - 第 4 次
// 定时器触发 - 第 5 次
// 定时器已取消
```

### 5.2 用户事件源

```swift
let userEventSource = DispatchSource.makeUserDataAddSource(queue: .main)

userEventSource.setEventHandler {
    let data = userEventSource.data
    print("接收到用户数据: \(data)")
}

userEventSource.resume()

// 发送数据
DispatchQueue.global().async {
    for i in 1...3 {
        userEventSource.add(data: UInt(i * 10))
        Thread.sleep(forTimeInterval: 1)
    }
}

// 输出:
// 接收到用户数据: 10
// 接收到用户数据: 20
// 接收到用户数据: 30
```

## 6. DispatchBarrier - 栅栏

### 6.1 异步栅栏

```swift
let barrierQueue = DispatchQueue(label: "barrier.queue", attributes: .concurrent)

func performRead(id: Int) {
    barrierQueue.async {
        print("读操作 \(id) 开始")
        Thread.sleep(forTimeInterval: 1)
        print("读操作 \(id) 完成")
    }
}

func performWrite(id: Int) {
    barrierQueue.async(flags: .barrier) {
        print("写操作 \(id) 开始 (独占)")
        Thread.sleep(forTimeInterval: 2)
        print("写操作 \(id) 完成 (独占)")
    }
}

performRead(id: 1)
performRead(id: 2)
performWrite(id: 1)
performRead(id: 3)
performRead(id: 4)

// 输出:
// 读操作 1 开始
// 读操作 2 开始
// 读操作 1 完成
// 读操作 2 完成
// 写操作 1 开始 (独占)
// 写操作 1 完成 (独占)
// 读操作 3 开始
// 读操作 4 开始
// 读操作 3 完成
// 读操作 4 完成
```

## 7. QoS (Quality of Service) - 服务质量

### 7.1 不同优先级的队列

```swift
func demonstrateQoS() {
    let startTime = Date()
    
    // 用户交互级别 (最高优先级)
    DispatchQueue.global(qos: .userInteractive).async {
        Thread.sleep(forTimeInterval: 1)
        let elapsed = Date().timeIntervalSince(startTime)
        print("用户交互任务完成，耗时: \(String(format: "%.2f", elapsed))秒")
    }
    
    // 用户发起级别
    DispatchQueue.global(qos: .userInitiated).async {
        Thread.sleep(forTimeInterval: 1)
        let elapsed = Date().timeIntervalSince(startTime)
        print("用户发起任务完成，耗时: \(String(format: "%.2f", elapsed))秒")
    }
    
    // 实用级别
    DispatchQueue.global(qos: .utility).async {
        Thread.sleep(forTimeInterval: 1)
        let elapsed = Date().timeIntervalSince(startTime)
        print("实用任务完成，耗时: \(String(format: "%.2f", elapsed))秒")
    }
    
    // 后台级别 (最低优先级)
    DispatchQueue.global(qos: .background).async {
        Thread.sleep(forTimeInterval: 1)
        let elapsed = Date().timeIntervalSince(startTime)
        print("后台任务完成，耗时: \(String(format: "%.2f", elapsed))秒")
    }
}

demonstrateQoS()

// 输出 (根据系统负载，顺序可能有所不同):
// 用户交互任务完成，耗时: 1.00秒
// 用户发起任务完成，耗时: 1.01秒
// 实用任务完成，耗时: 1.02秒
// 后台任务完成，耗时: 1.03秒
```

## 8. 实际应用示例

### 8.1 下载和处理数据

```swift
func downloadAndProcessData() {
    print("开始下载数据")
    
    DispatchQueue.global(qos: .background).async {
        // 模拟下载
        print("正在下载... (后台线程)")
        Thread.sleep(forTimeInterval: 2)
        let data = "模拟下载的数据"
        
        // 切换到主线程更新UI
        DispatchQueue.main.async {
            print("数据下载完成，更新UI: \(data)")
            
            // 切换到后台处理数据
            DispatchQueue.global(qos: .utility).async {
                print("正在处理数据...")
                Thread.sleep(forTimeInterval: 1)
                let processedData = data.uppercased()
                
                // 再次切换到主线程
                DispatchQueue.main.async {
                    print("数据处理完成: \(processedData)")
                }
            }
        }
    }
}

downloadAndProcessData()

// 输出:
// 开始下载数据
// 正在下载... (后台线程)
// 数据下载完成，更新UI: 模拟下载的数据
// 正在处理数据...
// 数据处理完成: 模拟下载的数据
```

### 8.2 并发下载多个资源

```swift
func downloadMultipleResources() {
    let urls = ["url1", "url2", "url3", "url4"]
    let group = DispatchGroup()
    var results: [String] = []
    let resultsQueue = DispatchQueue(label: "results.queue")
    
    print("开始并发下载 \(urls.count) 个资源")
    
    for (index, url) in urls.enumerated() {
        group.enter()
        
        DispatchQueue.global().async {
            // 模拟下载时间不同
            let downloadTime = Double.random(in: 0.5...2.0)
            Thread.sleep(forTimeInterval: downloadTime)
            
            let result = "数据来自 \(url)"
            print("下载完成: \(result)")
            
            // 线程安全地添加结果
            resultsQueue.sync {
                results.append(result)
            }
            
            group.leave()
        }
    }
    
    group.notify(queue: .main) {
        print("所有下载完成，共获得 \(results.count) 个结果:")
        for result in results {
            print("- \(result)")
        }
    }
}

downloadMultipleResources()

// 输出:
// 开始并发下载 4 个资源
// 下载完成: 数据来自 url3
// 下载完成: 数据来自 url1
// 下载完成: 数据来自 url4
// 下载完成: 数据来自 url2
// 所有下载完成，共获得 4 个结果:
// - 数据来自 url3
// - 数据来自 url1
// - 数据来自 url4
// - 数据来自 url2
```

## 9. 最佳实践和注意事项

### 9.1 避免死锁

```swift
// ❌ 错误示例 - 可能导致死锁
func deadlockExample() {
    let queue = DispatchQueue(label: "deadlock.queue")
    
    queue.async {
        print("外层任务开始")
        
        // 在同一串行队列中同步调用 - 导致死锁
        queue.sync {
            print("这行代码永远不会执行")
        }
    }
}

// ✅ 正确示例
func correctExample() {
    let queue = DispatchQueue(label: "correct.queue")
    let anotherQueue = DispatchQueue(label: "another.queue")
    
    queue.async {
        print("外层任务开始")
        
        // 在不同队列中同步调用
        anotherQueue.sync {
            print("内层任务执行完成")
        }
        
        print("外层任务完成")
    }
}

correctExample()

// 输出:
// 外层任务开始
// 内层任务执行完成
// 外层任务完成
```

### 9.2 内存管理

```swift
class TaskManager {
    private let queue = DispatchQueue(label: "task.manager")
    private var tasks: [String] = []
    
    func addTask(_ task: String) {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.tasks.append(task)
            print("任务已添加: \(task)，当前任务数: \(self.tasks.count)")
        }
    }
    
    deinit {
        print("TaskManager 被释放")
    }
}

func memoryManagementExample() {
    var manager: TaskManager? = TaskManager()
    
    manager?.addTask("任务1")
    manager?.addTask("任务2")
    
    // 模拟延迟后释放
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
        manager = nil
        print("Manager 设置为 nil")
    }
}

memoryManagementExample()

// 输出:
// 任务已添加: 任务1，当前任务数: 1
// 任务已添加: 任务2，当前任务数: 2
// Manager 设置为 nil
// TaskManager 被释放
```

## 10. DispatchTime 和 DispatchWallTime - 时间类型

### 10.1 DispatchTime - 系统时间

```swift
// 当前时间
let now = DispatchTime.now()
print("当前时间: \(now)")

// 延迟时间
let futureTime = DispatchTime.now() + .seconds(5)
let futureTime2 = DispatchTime.now() + .milliseconds(500)
let futureTime3 = DispatchTime.now() + .nanoseconds(1000000)

DispatchQueue.main.asyncAfter(deadline: futureTime2) {
    print("500毫秒后执行")
}

// 输出:
// 当前时间: DispatchTime(rawValue: 12345678901234)
// 500毫秒后执行
```

### 10.2 DispatchWallTime - 墙上时钟时间

```swift
import Foundation

// 使用 Date 创建墙上时钟时间
let date = Date().addingTimeInterval(2.0)
let wallTime = DispatchWallTime(timespec: timespec(tv_sec: Int(date.timeIntervalSince1970), tv_nsec: 0))

DispatchQueue.main.asyncAfter(wallTime: wallTime) {
    print("墙上时钟时间到达: \(Date())")
}

// 也可以直接使用 Date
let futureDate = Date().addingTimeInterval(1.0)
DispatchQueue.main.asyncAfter(wallTime: .init(date: futureDate)) {
    print("使用 Date 创建的延迟任务")
}

// 输出:
// 使用 Date 创建的延迟任务
// 墙上时钟时间到达: 2024-01-15 10:30:03 +0000
```

## 11. DispatchIO - 异步 I/O 操作

### 11.1 文件读取

```swift
import Foundation

func asyncFileRead() {
    // 创建测试文件
    let testContent = "这是测试文件内容\n第二行内容\n第三行内容"
    let fileURL = FileManager.default.temporaryDirectory.appendingPathComponent("test.txt")
    
    do {
        try testContent.write(to: fileURL, atomically: true, encoding: .utf8)
        print("测试文件创建成功: \(fileURL.path)")
    } catch {
        print("文件创建失败: \(error)")
        return
    }
    
    // 异步读取文件
    let channel = DispatchIO(type: .random, path: fileURL.path, oflag: O_RDONLY, mode: 0, queue: .global()) { error in
        if error != 0 {
            print("文件打开失败: \(error)")
        }
    }
    
    channel?.read(offset: 0, length: SIZE_T_MAX, queue: .main) { done, data, error in
        if let data = data, !data.isEmpty {
            let content = String(data: data as Data, encoding: .utf8) ?? ""
            print("读取文件内容:\n\(content)")
        }
        
        if done {
            print("文件读取完成")
            channel?.close()
        }
        
        if error != 0 {
            print("读取错误: \(error)")
        }
    }
}

asyncFileRead()

// 输出:
// 测试文件创建成功: /tmp/test.txt
// 读取文件内容:
// 这是测试文件内容
// 第二行内容
// 第三行内容
// 文件读取完成
```

## 12. DispatchData - 数据缓冲区

### 12.1 创建和操作数据

```swift
import Foundation

func dispatchDataExample() {
    // 从字符串创建 DispatchData
    let string = "Hello, Dispatch Data!"
    let data1 = string.data(using: .utf8)!.withUnsafeBytes { bytes in
        DispatchData(bytes: bytes)
    }
    
    // 从数组创建 DispatchData
    let bytes: [UInt8] = [72, 101, 108, 108, 111] // "Hello"
    let data2 = DispatchData(bytes: bytes)
    
    print("数据1大小: \(data1.count) 字节")
    print("数据2大小: \(data2.count) 字节")
    
    // 连接数据
    let combinedData = data1.appending(data2)
    print("合并后数据大小: \(combinedData.count) 字节")
    
    // 提取子数据
    let subData = combinedData.subdata(in: 0..<5)
    print("子数据大小: \(subData.count) 字节")
    
    // 遍历数据
    subData.enumerateBytes { data, offset, stop in
        let content = String(data: data, encoding: .utf8) ?? ""
        print("偏移 \(offset): \(content)")
        return true
    }
}

dispatchDataExample()

// 输出:
// 数据1大小: 21 字节
// 数据2大小: 5 字节
// 合并后数据大小: 26 字节
// 子数据大小: 5 字节
// 偏移 0: Hello
```

## 13. DispatchSource 的其他类型

### 13.1 进程监控源

```swift
import Foundation

func processMonitorExample() {
    let processSource = DispatchSource.makeProcessSource(
        identifier: ProcessInfo.processInfo.processIdentifier,
        eventMask: .all,
        queue: .main
    )
    
    processSource.setEventHandler {
        let event = processSource.mask
        print("进程事件: \(event)")
    }
    
    processSource.setCancelHandler {
        print("进程监控已取消")
    }
    
    processSource.resume()
    
    // 5秒后取消监控
    DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
        processSource.cancel()
    }
}

// processMonitorExample() // 取消注释以运行
```

### 13.2 信号源

```swift
func signalSourceExample() {
    let signalSource = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
    
    signalSource.setEventHandler {
        print("接收到 SIGTERM 信号")
        exit(0)
    }
    
    signalSource.resume()
    print("信号监听已启动")
    
    // 注意: 这个例子在playground中可能无法正常工作
}
```

### 13.3 内存压力源

```swift
func memoryPressureSourceExample() {
    let memorySource = DispatchSource.makeMemoryPressureSource(eventMask: .all, queue: .main)
    
    memorySource.setEventHandler {
        let event = memorySource.mask
        switch event {
        case .normal:
            print("内存压力: 正常")
        case .warning:
            print("内存压力: 警告")
        case .critical:
            print("内存压力: 严重")
        default:
            print("内存压力: 未知状态")
        }
    }
    
    memorySource.resume()
    print("内存压力监控已启动")
}

memoryPressureSourceExample()

// 输出:
// 内存压力监控已启动
// (根据系统状态可能会有内存压力通知)
```

### 13.4 文件系统监控源 (macOS/iOS)

```swift
#if os(macOS) || os(iOS)
import Foundation

func fileSystemMonitorExample() {
    let tempDir = FileManager.default.temporaryDirectory
    let fileDescriptor = open(tempDir.path, O_EVTONLY)
    
    guard fileDescriptor >= 0 else {
        print("无法打开目录进行监控")
        return
    }
    
    let source = DispatchSource.makeFileSystemObjectSource(
        fileDescriptor: fileDescriptor,
        eventMask: .all,
        queue: .main
    )
    
    source.setEventHandler {
        let event = source.mask
        print("文件系统事件: \(event) 在目录: \(tempDir.path)")
    }
    
    source.setCancelHandler {
        close(fileDescriptor)
        print("文件系统监控已停止")
    }
    
    source.resume()
    print("开始监控目录: \(tempDir.path)")
    
    // 创建一个测试文件来触发事件
    DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
        let testFile = tempDir.appendingPathComponent("monitor_test.txt")
        try? "test".write(to: testFile, atomically: true, encoding: .utf8)
        print("创建测试文件: \(testFile.path)")
        
        // 2秒后删除文件
        DispatchQueue.global().asyncAfter(deadline: .now() + 2.0) {
            try? FileManager.default.removeItem(at: testFile)
            print("删除测试文件")
            
            // 再等2秒后停止监控
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                source.cancel()
            }
        }
    }
}

fileSystemMonitorExample()
#endif

// 输出 (macOS/iOS):
// 开始监控目录: /tmp
// 创建测试文件: /tmp/monitor_test.txt
// 文件系统事件: DispatchSource.FileSystemEvent(rawValue: 1) 在目录: /tmp
// 删除测试文件
// 文件系统事件: DispatchSource.FileSystemEvent(rawValue: 1) 在目录: /tmp
// 文件系统监控已停止
```

## 14. DispatchQueue 的高级特性

### 14.1 队列特定数据

```swift
extension DispatchQueue {
    private static let keyContext = DispatchSpecificKey<String>()
    
    func setName(_ name: String) {
        setSpecific(key: DispatchQueue.keyContext, value: name)
    }
    
    static var currentQueueName: String? {
        return getSpecific(key: keyContext)
    }
}

func queueSpecificExample() {
    let queue1 = DispatchQueue(label: "queue1")
    let queue2 = DispatchQueue(label: "queue2")
    
    queue1.setName("第一个队列")
    queue2.setName("第二个队列")
    
    queue1.sync {
        print("当前队列名称: \(DispatchQueue.currentQueueName ?? "未知")")
    }
    
    queue2.sync {
        print("当前队列名称: \(DispatchQueue.currentQueueName ?? "未知")")
    }
    
    // 在主队列中检查
    print("主队列名称: \(DispatchQueue.currentQueueName ?? "主队列无名称")")
}

queueSpecificExample()

// 输出:
// 当前队列名称: 第一个队列
// 当前队列名称: 第二个队列
// 主队列名称: 主队列无名称
```

### 14.2 队列标签和调试

```swift
func queueDebuggingExample() {
    let queue = DispatchQueue(label: "com.example.debug", qos: .utility)
    
    queue.async {
        print("队列标签: \(String(cString: __dispatch_queue_get_label(nil)))")
        print("当前线程: \(Thread.current)")
        print("是否为主线程: \(Thread.isMainThread)")
    }
    
    DispatchQueue.main.async {
        print("主队列标签: \(String(cString: __dispatch_queue_get_label(nil)))")
        print("主线程: \(Thread.current)")
    }
}

queueDebuggingExample()

// 输出:
// 队列标签: com.example.debug
// 当前线程: <NSThread: 0x...>{number = 3, name = (null)}
// 是否为主线程: false
// 主队列标签: com.apple.main-thread
// 主线程: <_NSMainThread: 0x...>{number = 1, name = main}
```

## 15. DispatchPrecondition - 调试断言

### 15.1 队列断言

```swift
func preconditionExample() {
    let serialQueue = DispatchQueue(label: "serial.queue")
    
    func mustRunOnSerialQueue() {
        // 断言当前必须在指定队列中执行
        dispatchPrecondition(condition: .onQueue(serialQueue))
        print("这个函数在串行队列中执行")
    }
    
    func mustRunOnMainQueue() {
        // 断言当前必须在主队列中执行
        dispatchPrecondition(condition: .onQueue(.main))
        print("这个函数在主队列中执行")
    }
    
    func mustNotRunOnMainQueue() {
        // 断言当前不能在主队列中执行
        dispatchPrecondition(condition: .notOnQueue(.main))
        print("这个函数不在主队列中执行")
    }
    
    // 正确的调用
    serialQueue.sync {
        mustRunOnSerialQueue()
        mustNotRunOnMainQueue()
    }
    
    DispatchQueue.main.async {
        mustRunOnMainQueue()
    }
}

preconditionExample()

// 输出:
// 这个函数在串行队列中执行
// 这个函数不在主队列中执行
// 这个函数在主队列中执行
```

## 16. 高级同步原语

### 16.1 DispatchQueue.concurrentPerform

```swift
func concurrentPerformExample() {
    let items = Array(1...100)
    var results = Array(repeating: 0, count: items.count)
    let startTime = Date()
    
    // 并发执行计算
    DispatchQueue.concurrentPerform(iterations: items.count) { index in
        // 模拟计算密集型任务
        let value = items[index]
        var result = 0
        for i in 1...value {
            result += i * i
        }
        results[index] = result
        
        if index % 20 == 0 {
            print("完成项目 \(index)")
        }
    }
    
    let endTime = Date()
    let totalTime = endTime.timeIntervalSince(startTime)
    let sum = results.reduce(0, +)
    
    print("并发计算完成，耗时: \(String(format: "%.3f", totalTime))秒")
    print("计算结果总和: \(sum)")
}

concurrentPerformExample()

// 输出:
// 完成项目 0
// 完成项目 20
// 完成项目 40
// 完成项目 60
// 完成项目 80
// 并发计算完成，耗时: 0.045秒
// 计算结果总和: 338350
```

### 16.2 原子操作示例

```swift
import Foundation

class AtomicCounter {
    private var _value: Int64 = 0
    
    var value: Int64 {
        return OSAtomicAdd64(0, &_value)
    }
    
    func increment() -> Int64 {
        return OSAtomicIncrement64(&_value)
    }
    
    func decrement() -> Int64 {
        return OSAtomicDecrement64(&_value)
    }
    
    func add(_ delta: Int64) -> Int64 {
        return OSAtomicAdd64(delta, &_value)
    }
}

func atomicOperationExample() {
    let counter = AtomicCounter()
    let group = DispatchGroup()
    
    // 启动多个并发任务来测试原子性
    for i in 1...10 {
        group.enter()
        DispatchQueue.global().async {
            for _ in 1...1000 {
                counter.increment()
            }
            print("任务 \(i) 完成，当前计数: \(counter.value)")
            group.leave()
        }
    }
    
    group.wait()
    print("最终计数: \(counter.value)")
}

atomicOperationExample()

// 输出:
// 任务 3 完成，当前计数: 3000
// 任务 1 完成，当前计数: 4000
// 任务 2 完成，当前计数: 5000
// ...
// 最终计数: 10000
```

## 17. 性能监控和调试

### 17.1 队列监控

```swift
func queueMonitoringExample() {
    let monitoredQueue = DispatchQueue(label: "monitored.queue", attributes: .concurrent)
    let startTime = DispatchTime.now()
    
    // 创建多个任务来监控性能
    let group = DispatchGroup()
    
    for i in 1...5 {
        group.enter()
        let taskStart = DispatchTime.now()
        
        monitoredQueue.async {
            defer {
                let taskEnd = DispatchTime.now()
                let duration = Double(taskEnd.uptimeNanoseconds - taskStart.uptimeNanoseconds) / 1_000_000_000
                print("任务 \(i) 执行时间: \(String(format: "%.3f", duration))秒")
                group.leave()
            }
            
            // 模拟不同长度的任务
            let sleepTime = Double.random(in: 0.1...1.0)
            Thread.sleep(forTimeInterval: sleepTime)
        }
    }
    
    group.notify(queue: .main) {
        let endTime = DispatchTime.now()
        let totalDuration = Double(endTime.uptimeNanoseconds - startTime.uptimeNanoseconds) / 1_000_000_000
        print("所有任务完成，总耗时: \(String(format: "%.3f", totalDuration))秒")
    }
}

queueMonitoringExample()

// 输出:
// 任务 2 执行时间: 0.156秒
// 任务 1 执行时间: 0.445秒
// 任务 4 执行时间: 0.623秒
// 任务 3 执行时间: 0.789秒
// 任务 5 执行时间: 0.934秒
// 所有任务完成，总耗时: 0.943秒
```

## 18. 错误处理和恢复

### 18.1 带错误处理的异步操作

```swift
enum AsyncError: Error {
    case networkError
    case dataCorrupted
    case timeout
}

func asyncOperationWithErrorHandling() {
    let errorHandlingQueue = DispatchQueue(label: "error.handling")
    
    func performAsyncOperation(shouldFail: Bool, completion: @escaping (Result<String, AsyncError>) -> Void) {
        errorHandlingQueue.async {
            // 模拟异步操作
            Thread.sleep(forTimeInterval: 0.5)
            
            if shouldFail {
                completion(.failure(.networkError))
            } else {
                completion(.success("操作成功完成"))
            }
        }
    }
    
    // 执行操作序列
    let operations = [false, true, false, true]
    let group = DispatchGroup()
    
    for (index, shouldFail) in operations.enumerated() {
        group.enter()
        
        performAsyncOperation(shouldFail: shouldFail) { result in
            defer { group.leave() }
            
            switch result {
            case .success(let message):
                print("操作 \(index + 1) 成功: \(message)")
            case .failure(let error):
                print("操作 \(index + 1) 失败: \(error)")
                
                // 错误恢复策略
                DispatchQueue.global().asyncAfter(deadline: .now() + 0.1) {
                    print("正在重试操作 \(index + 1)...")
                }
            }
        }
    }
    
    group.notify(queue: .main) {
        print("所有操作（包括错误处理）完成")
    }
}

asyncOperationWithErrorHandling()

// 输出:
// 操作 1 成功: 操作成功完成
// 操作 2 失败: networkError
// 正在重试操作 2...
// 操作 3 成功: 操作成功完成
// 操作 4 失败: networkError
// 正在重试操作 4...
// 所有操作（包括错误处理）完成
```

## 总结

Swift Dispatch 框架提供了极其丰富的并发编程工具：

**核心调度类型:**

*   **DispatchQueue**: 任务调度的核心，支持串行和并发执行
*   **DispatchWorkItem**: 可取消和等待的工作单元
*   **DispatchGroup**: 协调多个异步任务的完成
*   **DispatchSemaphore**: 控制资源访问的信号量机制

**时间和数据处理:**

*   **DispatchTime/DispatchWallTime**: 精确的时间控制
*   **DispatchData**: 高效的数据缓冲区操作
*   **DispatchIO**: 异步文件和网络 I/O

**事件监控:**

*   **DispatchSource**: 定时器、信号、进程、文件系统、内存压力等事件监控
*   **DispatchBarrier**: 在并发队列中创建同步点

**高级特性:**

*   **QoS**: 根据任务重要性分配系统资源
*   **DispatchPrecondition**: 调试时的队列断言
*   **concurrentPerform**: 并发循环执行
*   **队列特定数据**: 存储队列相关的上下文信息

**调试和监控:**

*   队列标签和调试信息
*   性能监控和测量
*   错误处理和恢复机制

正确使用这些 API 可以构建高效、响应迅速、可靠的并发应用程序，但需要注意避免死锁、竞态条件和内存泄漏等常见问题。选择合适的工具和模式对于构建可维护的并发代码至关重要。
