---
title: "Swift CheckedContinuation 完整指南"
description: "CheckedContinuation 是 Swift 5.5 引入的一个重要类型，用于将传统的基于回调的异步代码转换为现代的 async/await 模式。它提供了一种安全的方式来桥接旧的异步 API 和新的并发模型。"
pubDate: 2026-05-29
category: "Swift"
tags: [Git, Swift, Array, API]
draft: false
---
# 🚀  Swift CheckedContinuation 完整指南

## 概述

`CheckedContinuation` 是 Swift 5.5 引入的一个重要类型，用于将传统的基于回调的异步代码转换为现代的 async/await 模式。它提供了一种安全的方式来桥接旧的异步 API 和新的并发模型。

## 核心概念

### CheckedContinuation

`CheckedContinuation` 是一个泛型结构体，用于在 async/await 上下文中等待异步操作的结果。

```swift
public struct CheckedContinuation<T, E> where E : Error
```

*   `T`: 成功时返回的值类型
*   `E`: 失败时抛出的错误类型

## 主要 API

### 1. withCheckedContinuation

用于将不会抛出错误的异步操作转换为 async 函数。

```swift
func withCheckedContinuation<T>(
    function: String = #function,
    _ body: (CheckedContinuation<T, Never>) -> Void
) async -> T
```

### 2. withCheckedThrowingContinuation

用于将可能抛出错误的异步操作转换为 async throws 函数。

```swift
func withCheckedThrowingContinuation<T>(
    function: String = #function,
    _ body: (CheckedContinuation<T, Error>) -> Void
) async throws -> T
```

### 3. Continuation 方法

#### resume(returning:)

恢复 continuation 并返回一个值。

```swift
func resume(returning value: T)
```

#### resume(throwing:)

恢复 continuation 并抛出一个错误。

```swift
func resume(throwing error: E)
```

#### resume(with:)

使用 Result 类型恢复 continuation。

```swift
func resume(with result: Result<T, E>)
```

## 实际使用示例

### 示例 1: 将 URLSession 回调转换为 async/await

```swift
import Foundation

// 传统的回调方式
func fetchDataCallback(url: URL, completion: @escaping (Result<Data, Error>) -> Void) {
    URLSession.shared.dataTask(with: url) { data, response, error in
        if let error = error {
            completion(.failure(error))
        } else if let data = data {
            completion(.success(data))
        } else {
            completion(.failure(URLError(.unknown)))
        }
    }.resume()
}

// 使用 CheckedContinuation 转换为 async/await
func fetchDataAsync(url: URL) async throws -> Data {
    return try await withCheckedThrowingContinuation { continuation in
        fetchDataCallback(url: url) { result in
            continuation.resume(with: result)
        }
    }
}

// 使用示例
Task {
    do {
        let url = URL(string: "https://api.github.com/users/octocat")!
        let data = try await fetchDataAsync(url: url)
        print("获取数据成功: \(data.count) bytes")
        // 运行结果: 获取数据成功: 1234 bytes
    } catch {
        print("获取数据失败: \(error)")
    }
}
```

### 示例 2: 将定时器回调转换为 async

```swift
import Foundation

// 传统的定时器回调
func delayCallback(seconds: TimeInterval, completion: @escaping () -> Void) {
    Timer.scheduledTimer(withTimeInterval: seconds, repeats: false) { _ in
        completion()
    }
}

// 使用 CheckedContinuation 转换
func delay(seconds: TimeInterval) async {
    await withCheckedContinuation { continuation in
        delayCallback(seconds: seconds) {
            continuation.resume(returning: ())
        }
    }
}

// 使用示例
Task {
    print("开始等待...")
    await delay(seconds: 2.0)
    print("等待结束!")
    // 运行结果:
    // 开始等待...
    // (2秒后)
    // 等待结束!
}
```

### 示例 3: 文件读取异步操作

```swift
import Foundation

enum FileError: Error {
    case fileNotFound
    case readError
}

// 模拟文件读取回调
func readFileCallback(path: String, completion: @escaping (Result<String, FileError>) -> Void) {
    DispatchQueue.global().async {
        // 模拟文件读取
        Thread.sleep(forTimeInterval: 1.0)
        
        if path.isEmpty {
            completion(.failure(.fileNotFound))
        } else {
            completion(.success("文件内容: \(path)"))
        }
    }
}

// 转换为 async/await
func readFileAsync(path: String) async throws -> String {
    return try await withCheckedThrowingContinuation { continuation in
        readFileCallback(path: path) { result in
            continuation.resume(with: result)
        }
    }
}

// 使用示例
Task {
    do {
        let content = try await readFileAsync(path: "example.txt")
        print(content)
        // 运行结果: 文件内容: example.txt
    } catch {
        print("读取文件失败: \(error)")
    }
}
```

### 示例 4: 批量操作转换

```swift
import Foundation

// 批量下载文件
func downloadMultipleFiles(urls: [URL]) async throws -> [Data] {
    var results: [Data] = []
    
    for url in urls {
        let data = try await withCheckedThrowingContinuation { continuation in
            URLSession.shared.dataTask(with: url) { data, response, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else if let data = data {
                    continuation.resume(returning: data)
                } else {
                    continuation.resume(throwing: URLError(.badServerResponse))
                }
            }.resume()
        }
        results.append(data)
    }
    
    return results
}

// 使用示例
Task {
    let urls = [
        URL(string: "https://api.github.com/users/octocat")!,
        URL(string: "https://api.github.com/users/defunkt")!
    ]
    
    do {
        let dataArray = try await downloadMultipleFiles(urls: urls)
        print("下载完成，共 \(dataArray.count) 个文件")
        // 运行结果: 下载完成，共 2 个文件
    } catch {
        print("下载失败: \(error)")
    }
}
```

## 相关类型

### 1. UnsafeContinuation

`UnsafeContinuation` 是 `CheckedContinuation` 的不安全版本，不会检查是否重复调用 resume。

```swift
// 使用 UnsafeContinuation (不推荐，除非性能极其重要)
func unsafeDelay(seconds: TimeInterval) async {
    await withUnsafeContinuation { continuation in
        Timer.scheduledTimer(withTimeInterval: seconds, repeats: false) { _ in
            continuation.resume(returning: ())
        }
    }
}
```

### 2. withUnsafeThrowingContinuation

```swift
func withUnsafeThrowingContinuation<T>(
    _ body: (UnsafeContinuation<T, Error>) -> Void
) async throws -> T
```

### 3. AsyncStream 和 AsyncThrowingStream

用于创建异步序列的类型，与 Continuation 配合使用。

```swift
// 创建异步数据流
func createNumberStream() -> AsyncStream<Int> {
    AsyncStream { continuation in
        Task {
            for i in 1...5 {
                await delay(seconds: 1.0)
                continuation.yield(i)
            }
            continuation.finish()
        }
    }
}

// 使用示例
Task {
    for await number in createNumberStream() {
        print("接收到数字: \(number)")
    }
    print("数据流结束")
    // 运行结果:
    // 接收到数字: 1
    // 接收到数字: 2
    // 接收到数字: 3
    // 接收到数字: 4
    // 接收到数字: 5
    // 数据流结束
}
```

## 最佳实践

### 1. 总是确保调用 resume

```swift
// ❌ 错误：可能忘记调用 resume
func badExample() async -> String {
    return await withCheckedContinuation { continuation in
        // 忘记调用 continuation.resume(returning: "result")
        // 这会导致程序挂起
    }
}

// ✅ 正确：确保在所有路径上都调用 resume
func goodExample() async -> String {
    return await withCheckedContinuation { continuation in
        // 确保调用 resume
        continuation.resume(returning: "result")
    }
}
```

### 2. 只调用一次 resume

```swift
// ❌ 错误：多次调用 resume
func badExample() async -> String {
    return await withCheckedContinuation { continuation in
        continuation.resume(returning: "first")
        continuation.resume(returning: "second") // 这会导致崩溃
    }
}

// ✅ 正确：只调用一次 resume
func goodExample() async -> String {
    return await withCheckedContinuation { continuation in
        let result = someCondition ? "first" : "second"
        continuation.resume(returning: result)
    }
}
```

### 3. 错误处理

```swift
func properErrorHandling() async throws -> String {
    return try await withCheckedThrowingContinuation { continuation in
        performAsyncOperation { result, error in
            if let error = error {
                continuation.resume(throwing: error)
            } else if let result = result {
                continuation.resume(returning: result)
            } else {
                continuation.resume(throwing: UnexpectedError())
            }
        }
    }
}
```

## 性能对比

### CheckedContinuation vs UnsafeContinuation

```swift
import Foundation

// 性能测试
func performanceTest() async {
    let iterations = 1000
    
    // 测试 CheckedContinuation
    let checkedStart = Date()
    for _ in 0..<iterations {
        await withCheckedContinuation { continuation in
            continuation.resume(returning: ())
        }
    }
    let checkedTime = Date().timeIntervalSince(checkedStart)
    
    // 测试 UnsafeContinuation
    let unsafeStart = Date()
    for _ in 0..<iterations {
        await withUnsafeContinuation { continuation in
            continuation.resume(returning: ())
        }
    }
    let unsafeTime = Date().timeIntervalSince(unsafeStart)
    
    print("CheckedContinuation: \(checkedTime)s")
    print("UnsafeContinuation: \(unsafeTime)s")
    print("性能差异: \((checkedTime / unsafeTime - 1) * 100)%")
    
    // 运行结果示例:
    // CheckedContinuation: 0.045s
    // UnsafeContinuation: 0.032s
    // 性能差异: 40.6%
}
```

## 总结

`CheckedContinuation` 是 Swift 并发编程中的重要工具，它：

1.  **安全性**: 提供运行时检查，防止常见错误
2.  **易用性**: 简化了回调到 async/await 的转换
3.  **兼容性**: 让旧代码能够与新的并发模型集成
4.  **调试友好**: 提供更好的错误信息和调试体验

使用 `CheckedContinuation` 时，记住：

*   总是调用 `resume`
*   只调用一次 `resume`
*   正确处理错误情况
*   在性能关键场景下考虑使用 `UnsafeContinuation`

通过这些 API，您可以轻松地将现有的异步代码迁移到现代的 Swift 并发模型中。
