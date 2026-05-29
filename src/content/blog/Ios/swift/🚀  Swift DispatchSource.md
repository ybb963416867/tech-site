---
title: "Swift DispatchSource"
description: "DispatchSource 是 Grand Central Dispatch (GCD) 的一个重要组件，用于监听和响应系统事件。它提供了一种异步、高效的方式来处理各种系统级事件，如文件系统变化、网络事件、定时器等。"
pubDate: 2026-05-29
category: "swift"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀  Swift DispatchSource 完整API指南

## 概述

`DispatchSource` 是 Grand Central Dispatch (GCD) 的一个重要组件，用于监听和响应系统事件。它提供了一种异步、高效的方式来处理各种系统级事件，如文件系统变化、网络事件、定时器等。

## 核心概念

DispatchSource 基于事件驱动模型，当特定事件发生时会触发相应的处理程序。它们运行在指定的调度队列上，确保线程安全和高性能。

## 主要 API 分类

### 1. 创建 DispatchSource

#### 1.1 makeTimerSource - 定时器源

```swift
static func makeTimerSource(flags: DispatchSource.TimerFlags = [], 
                           queue: DispatchQueue? = nil) -> DispatchSourceTimer
```

**用法示例：**

```swift
import Foundation

// 创建定时器源
let timerSource = DispatchSource.makeTimerSource(queue: DispatchQueue.main)

// 设置定时器参数
timerSource.schedule(deadline: .now(), repeating: .seconds(1))

// 设置事件处理程序
timerSource.setEventHandler {
    print("定时器触发: \(Date())")
}

// 启动定时器
timerSource.resume()

// 运行5秒后取消
DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
    timerSource.cancel()
    print("定时器已取消")
}
```

**输出结果：**

    定时器触发: 2024-01-15 10:30:01 +0000
    定时器触发: 2024-01-15 10:30:02 +0000
    定时器触发: 2024-01-15 10:30:03 +0000
    定时器触发: 2024-01-15 10:30:04 +0000
    定时器触发: 2024-01-15 10:30:05 +0000
    定时器已取消

#### 1.2 makeReadSource - 文件读取源

```swift
static func makeReadSource(fileDescriptor: Int32, 
                          queue: DispatchQueue? = nil) -> DispatchSourceRead
```

**用法示例：**

```swift
import Foundation

func monitorFileReads() {
    // 创建一个管道用于演示
    var pipeFds: [Int32] = [0, 0]
    pipe(&pipeFds)
    
    let readFd = pipeFds[0]
    let writeFd = pipeFds[1]
    
    // 创建读取源
    let readSource = DispatchSource.makeReadSource(fileDescriptor: readFd, 
                                                  queue: DispatchQueue.global())
    
    // 设置读取事件处理程序
    readSource.setEventHandler {
        let availableBytes = readSource.data
        print("可读取字节数: \(availableBytes)")
        
        // 实际读取数据
        var buffer = [UInt8](repeating: 0, count: Int(availableBytes))
        let bytesRead = read(readFd, &buffer, Int(availableBytes))
        
        if bytesRead > 0 {
            let data = Data(buffer[0..<bytesRead])
            if let string = String(data: data, encoding: .utf8) {
                print("读取到数据: \(string)")
            }
        }
    }
    
    // 设置取消处理程序
    readSource.setCancelHandler {
        close(readFd)
        close(writeFd)
        print("读取源已关闭")
    }
    
    // 启动读取源
    readSource.resume()
    
    // 写入一些测试数据
    DispatchQueue.global().async {
        let message = "Hello, DispatchSource!"
        message.withCString { cString in
            write(writeFd, cString, strlen(cString))
        }
        
        // 5秒后关闭写入端
        DispatchQueue.global().asyncAfter(deadline: .now() + 5) {
            readSource.cancel()
        }
    }
}

monitorFileReads()
```

**输出结果：**

    可读取字节数: 21
    读取到数据: Hello, DispatchSource!
    读取源已关闭

#### 1.3 makeWriteSource - 文件写入源

```swift
static func makeWriteSource(fileDescriptor: Int32, 
                           queue: DispatchQueue? = nil) -> DispatchSourceWrite
```

**用法示例：**

```swift
import Foundation

func monitorFileWrites() {
    // 创建管道
    var pipeFds: [Int32] = [0, 0]
    pipe(&pipeFds)
    
    let readFd = pipeFds[0]
    let writeFd = pipeFds[1]
    
    // 创建写入源
    let writeSource = DispatchSource.makeWriteSource(fileDescriptor: writeFd, 
                                                    queue: DispatchQueue.global())
    
    var messageIndex = 0
    let messages = ["消息1", "消息2", "消息3"]
    
    // 设置写入事件处理程序
    writeSource.setEventHandler {
        if messageIndex < messages.count {
            let message = messages[messageIndex]
            print("准备写入: \(message)")
            
            message.withCString { cString in
                write(writeFd, cString, strlen(cString))
                write(writeFd, "\n", 1) // 添加换行符
            }
            
            messageIndex += 1
        } else {
            writeSource.cancel()
        }
    }
    
    // 设置取消处理程序
    writeSource.setCancelHandler {
        close(writeFd)
        close(readFd)
        print("写入源已关闭")
    }
    
    // 启动写入源
    writeSource.resume()
}

monitorFileWrites()
```

**输出结果：**

    准备写入: 消息1
    准备写入: 消息2
    准备写入: 消息3
    写入源已关闭

#### 1.4 makeSignalSource - 信号源

```swift
static func makeSignalSource(signal: Int32, 
                            queue: DispatchQueue? = nil) -> DispatchSourceSignal
```

**用法示例：**

```swift
import Foundation

func monitorSignal() {
    // 创建信号源监听 SIGTERM
    let signalSource = DispatchSource.makeSignalSource(signal: SIGTERM, 
                                                      queue: DispatchQueue.main)
    
    // 设置信号处理程序
    signalSource.setEventHandler {
        print("接收到 SIGTERM 信号")
        exit(0)
    }
    
    // 忽略默认的 SIGTERM 处理
    signal(SIGTERM, SIG_IGN)
    
    // 启动信号源
    signalSource.resume()
    
    print("信号监听器已启动，等待 SIGTERM 信号...")
    
    // 5秒后发送信号给自己（仅用于演示）
    DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
        kill(getpid(), SIGTERM)
    }
}

monitorSignal()
```

**输出结果：**

    信号监听器已启动，等待 SIGTERM 信号...
    接收到 SIGTERM 信号

#### 1.5 makeProcessSource - 进程源

```swift
static func makeProcessSource(identifier: pid_t, 
                             eventMask: DispatchSource.ProcessEvent, 
                             queue: DispatchQueue? = nil) -> DispatchSourceProcess
```

**用法示例：**

```swift
import Foundation

func monitorProcess() {
    // 获取当前进程ID
    let currentPid = getpid()
    
    // 创建进程源监听退出事件
    let processSource = DispatchSource.makeProcessSource(
        identifier: currentPid,
        eventMask: .exit,
        queue: DispatchQueue.main
    )
    
    // 设置进程事件处理程序
    processSource.setEventHandler {
        print("进程 \(currentPid) 即将退出")
    }
    
    // 启动进程源
    processSource.resume()
    
    print("进程监听器已启动，监听进程 \(currentPid)")
    
    // 模拟程序运行一段时间后退出
    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
        print("程序即将退出...")
        processSource.cancel()
        exit(0)
    }
}

monitorProcess()
```

**输出结果：**

    进程监听器已启动，监听进程 12345
    程序即将退出...

#### 1.6 makeFileSystemObjectSource - 文件系统对象源

```swift
static func makeFileSystemObjectSource(fileDescriptor: Int32, 
                                      eventMask: DispatchSource.FileSystemEvent, 
                                      queue: DispatchQueue? = nil) -> DispatchSourceFileSystemObject
```

**用法示例：**

```swift
import Foundation

func monitorFileSystem() {
    // 创建一个临时文件
    let tempURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("test.txt")
    FileManager.default.createFile(atPath: tempURL.path, contents: nil, attributes: nil)
    
    // 打开文件获取文件描述符
    let fileDescriptor = open(tempURL.path, O_EVTONLY)
    
    guard fileDescriptor != -1 else {
        print("无法打开文件")
        return
    }
    
    // 创建文件系统对象源
    let fsSource = DispatchSource.makeFileSystemObjectSource(
        fileDescriptor: fileDescriptor,
        eventMask: [.write, .delete, .rename],
        queue: DispatchQueue.main
    )
    
    // 设置文件系统事件处理程序
    fsSource.setEventHandler {
        let events = fsSource.mask
        print("文件系统事件触发:")
        
        if events.contains(.write) {
            print("- 文件被写入")
        }
        if events.contains(.delete) {
            print("- 文件被删除")
        }
        if events.contains(.rename) {
            print("- 文件被重命名")
        }
    }
    
    // 设置取消处理程序
    fsSource.setCancelHandler {
        close(fileDescriptor)
        print("文件系统监听器已关闭")
    }
    
    // 启动文件系统源
    fsSource.resume()
    
    print("开始监听文件: \(tempURL.path)")
    
    // 模拟文件操作
    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
        try? "Hello".write(to: tempURL, atomically: true, encoding: .utf8)
        print("写入文件内容")
    }
    
    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
        try? FileManager.default.removeItem(at: tempURL)
        print("删除文件")
        fsSource.cancel()
    }
}

monitorFileSystem()
```

**输出结果：**

    开始监听文件: /tmp/test.txt
    写入文件内容
    文件系统事件触发:
    - 文件被写入
    删除文件
    文件系统事件触发:
    - 文件被删除
    文件系统监听器已关闭

### 2. DispatchSource 通用方法

#### 2.1 事件处理设置

```swift
func setEventHandler(handler: DispatchWorkItem?)
func setEventHandler(qos: DispatchQoS = .unspecified, 
                    flags: DispatchWorkItemFlags = [], 
                    handler: @escaping @convention(block) () -> Void)
```

#### 2.2 取消处理设置

```swift
func setCancelHandler(handler: DispatchWorkItem?)
func setCancelHandler(qos: DispatchQoS = .unspecified, 
                     flags: DispatchWorkItemFlags = [], 
                     handler: @escaping @convention(block) () -> Void)
```

#### 2.3 生命周期管理

```swift
func activate()     // 激活源（iOS 10+）
func resume()       // 恢复源
func suspend()      // 暂停源
func cancel()       // 取消源
```

**生命周期示例：**

```swift
import Foundation

func demonstrateLifecycle() {
    let timer = DispatchSource.makeTimerSource()
    
    timer.schedule(deadline: .now(), repeating: .seconds(1))
    
    var counter = 0
    timer.setEventHandler {
        counter += 1
        print("计数器: \(counter)")
        
        if counter == 3 {
            print("暂停定时器")
            timer.suspend()
            
            // 2秒后恢复
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                print("恢复定时器")
                timer.resume()
            }
        }
        
        if counter == 6 {
            print("取消定时器")
            timer.cancel()
        }
    }
    
    timer.setCancelHandler {
        print("定时器已清理")
    }
    
    timer.resume()
}

demonstrateLifecycle()
```

**输出结果：**

    计数器: 1
    计数器: 2
    计数器: 3
    暂停定时器
    恢复定时器
    计数器: 4
    计数器: 5
    计数器: 6
    取消定时器
    定时器已清理

### 3. 特殊用途的 DispatchSource

#### 3.1 makeMemoryPressureSource - 内存压力源

```swift
static func makeMemoryPressureSource(eventMask: DispatchSource.MemoryPressureEvent, 
                                    queue: DispatchQueue? = nil) -> DispatchSourceMemoryPressure
```

**用法示例：**

```swift
import Foundation

func monitorMemoryPressure() {
    let memorySource = DispatchSource.makeMemoryPressureSource(
        eventMask: [.normal, .warning, .critical],
        queue: DispatchQueue.main
    )
    
    memorySource.setEventHandler {
        let event = memorySource.mask
        print("内存压力事件:")
        
        if event.contains(.normal) {
            print("- 内存压力正常")
        }
        if event.contains(.warning) {
            print("- 内存压力警告")
        }
        if event.contains(.critical) {
            print("- 内存压力严重")
        }
    }
    
    memorySource.resume()
    print("内存压力监听器已启动")
    
    // 模拟运行一段时间
    DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
        memorySource.cancel()
        print("内存压力监听器已停止")
    }
}

monitorMemoryPressure()
```

#### 3.2 makeUserDataAdd/Or/Replace - 用户数据源

```swift
static func makeUserDataAddSource(queue: DispatchQueue? = nil) -> DispatchSourceUserDataAdd
static func makeUserDataOrSource(queue: DispatchQueue? = nil) -> DispatchSourceUserDataOr
static func makeUserDataReplaceSource(queue: DispatchQueue? = nil) -> DispatchSourceUserDataReplace
```

**用法示例：**

```swift
import Foundation

func demonstrateUserDataSources() {
    // Add 源：累加数据
    let addSource = DispatchSource.makeUserDataAddSource(queue: DispatchQueue.main)
    addSource.setEventHandler {
        print("Add 源触发，累计值: \(addSource.data)")
    }
    addSource.resume()
    
    // Or 源：按位或操作
    let orSource = DispatchSource.makeUserDataOrSource(queue: DispatchQueue.main)
    orSource.setEventHandler {
        print("Or 源触发，按位或结果: \(orSource.data)")
    }
    orSource.resume()
    
    // Replace 源：替换数据
    let replaceSource = DispatchSource.makeUserDataReplaceSource(queue: DispatchQueue.main)
    replaceSource.setEventHandler {
        print("Replace 源触发，当前值: \(replaceSource.data)")
    }
    replaceSource.resume()
    
    // 发送数据
    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
        addSource.add(data: 10)
        addSource.add(data: 20)
        
        orSource.or(data: 0b1010)  // 10 in binary
        orSource.or(data: 0b1100)  // 12 in binary
        
        replaceSource.replace(data: 100)
        replaceSource.replace(data: 200)
    }
    
    // 清理
    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
        addSource.cancel()
        orSource.cancel()
        replaceSource.cancel()
    }
}

demonstrateUserDataSources()
```

**输出结果：**

    Add 源触发，累计值: 30
    Or 源触发，按位或结果: 14
    Replace 源触发，当前值: 200

## 实际应用场景

### 1. 网络状态监控

```swift
import Foundation
import SystemConfiguration

class NetworkMonitor {
    private var reachabilitySource: DispatchSourceRead?
    
    func startMonitoring() {
        // 创建网络可达性引用
        var context = SCNetworkReachabilityContext()
        let reachability = SCNetworkReachabilityCreateWithName(nil, "www.apple.com")
        
        guard let reachability = reachability else { return }
        
        // 获取socket
        let socket = SCNetworkReachabilityGetSocketFD(reachability)
        
        // 创建读取源
        reachabilitySource = DispatchSource.makeReadSource(
            fileDescriptor: socket,
            queue: DispatchQueue.main
        )
        
        reachabilitySource?.setEventHandler { [weak self] in
            var flags = SCNetworkReachabilityFlags()
            SCNetworkReachabilityGetFlags(reachability, &flags)
            
            if flags.contains(.reachable) {
                print("网络可达")
            } else {
                print("网络不可达")
            }
        }
        
        reachabilitySource?.resume()
    }
    
    func stopMonitoring() {
        reachabilitySource?.cancel()
        reachabilitySource = nil
    }
}
```

### 2. 文件监控服务

```swift
import Foundation

class FileWatcher {
    private var fileSource: DispatchSourceFileSystemObject?
    
    func watchFile(at path: String) {
        let fileDescriptor = open(path, O_EVTONLY)
        guard fileDescriptor != -1 else {
            print("无法打开文件: \(path)")
            return
        }
        
        fileSource = DispatchSource.makeFileSystemObjectSource(
            fileDescriptor: fileDescriptor,
            eventMask: [.write, .delete, .rename, .attrib],
            queue: DispatchQueue.global()
        )
        
        fileSource?.setEventHandler { [weak self] in
            guard let source = self?.fileSource else { return }
            
            let events = source.mask
            print("文件 \(path) 发生变化:")
            
            if events.contains(.write) { print("- 内容被修改") }
            if events.contains(.delete) { print("- 文件被删除") }
            if events.contains(.rename) { print("- 文件被重命名") }
            if events.contains(.attrib) { print("- 属性被修改") }
        }
        
        fileSource?.setCancelHandler {
            close(fileDescriptor)
            print("文件监控已停止")
        }
        
        fileSource?.resume()
        print("开始监控文件: \(path)")
    }
    
    func stopWatching() {
        fileSource?.cancel()
        fileSource = nil
    }
}
```

## 最佳实践

### 1. 内存管理

*   始终在取消处理程序中释放资源
*   使用弱引用避免循环引用
*   及时取消不再需要的源

### 2. 线程安全

*   选择合适的调度队列
*   避免在多个线程同时操作同一个源
*   使用串行队列确保事件处理的顺序性

### 3. 错误处理

*   检查文件描述符的有效性
*   处理系统调用可能的失败情况
*   提供适当的错误恢复机制

### 4. 性能优化

*   避免在事件处理程序中执行耗时操作
*   使用适当的服务质量级别
*   考虑事件的合并和批处理

## 总结

DispatchSource 是 iOS 和 macOS 开发中处理系统事件的强大工具。它提供了高效、异步的事件处理机制，适用于文件监控、网络状态检测、定时任务等多种场景。正确使用 DispatchSource 可以显著提升应用的响应性和资源利用效率。

关键要点：

*   选择合适的源类型
*   正确管理源的生命周期
*   合理设置事件和取消处理程序
*   注意内存管理和线程安全
*   在适当的队列上处理事件

