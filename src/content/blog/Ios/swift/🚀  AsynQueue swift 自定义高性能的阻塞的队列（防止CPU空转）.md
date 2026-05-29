---
title: "AsynQueue swift 自定义高性能的阻塞的队列（防止CPU空转）"
description: "用法"
pubDate: 2026-05-29
category: "swift"
tags: [Swift]
draft: false
---
# 🚀 AsynQueue swift 自定义高性能的阻塞的队列（防止CPU空转）

```

//
//  AsynQueue.swift
//  wscanner
//
//  Created by yunshen on 2025/2/24.
//

import Foundation

public protocol QueueStorageProtocol<T> {
    associatedtype T
    var maxSize: Int { get set }

    func add(_ data: T)
    func take() -> T?
    func cleanupOverflowingData()
    func isEmpty() -> Bool
    func removeAll()
    func count() -> Int
}

open class DefaultStorageImpl<T>: QueueStorageProtocol {
    public func count() -> Int {
        return queue.count
    }
    
    public var queue = [T]()
    public var maxSize: Int

    public init(maxSize: Int) {
        self.maxSize = maxSize
    }

    public func add(_ data: T) {
        cleanupOverflowingData()
        queue.append(data)
    }

    public func take() -> T? {
        return queue.isEmpty ? nil : queue.removeFirst()
    }

    open func cleanupOverflowingData() {
        if queue.count > maxSize {
            //            Log.i("cleanupOverflowingData \(queue.count)")
            let removeCount = queue.count - maxSize
            for _ in 0..<removeCount {
                _ = queue.removeFirst()
            }
        }
    }

    public func isEmpty() -> Bool {
        return queue.isEmpty
    }

    open func removeAll() {
        queue.removeAll()
    }

}

public class DefaultStorage<T>: DefaultStorageImpl<T> {}

public actor AsynQueue<T> {
    private let storage: any QueueStorageProtocol<T>
    private var continuation: CheckedContinuation<Void, Never>?

    public init(
        storage: any QueueStorageProtocol<T> = DefaultStorage<T>(maxSize: 30)
    ) {
        self.storage = storage
    }

    public func add(_ data: T) {
        storage.add(data)
        if let cont = continuation {
            continuation = nil  // 先置空，防止重复恢复
            cont.resume()
        }
    }

    public func take() async -> T? {
        while storage.isEmpty() {
            if Task.isCancelled {
                      print("ImageDecoderHandler Task is cancelled while waiting in take()")
               return nil
            }
            await withCheckedContinuation { continuation in
                self.continuation = continuation
            }
        }
        return storage.take()
    }

    public func removeAll() {
        storage.removeAll()
        // 清空时取消等待的 continuation
        if let cont = continuation {
            continuation = nil
            cont.resume()
        }
    }
    
    public func count() -> Int {
        return storage.count()
    }
}

```

*   用法

```
class ImageDataQueue: DefaultStorageImpl<Int> {
    override func cleanupOverflowingData() {
        if queue.count > maxSize {
            let removeCount = queue.count - maxSize
            for _ in 0..<removeCount {
                queue.removeFirst()
            }
        }
    }
}
    
private var imageDataQueue = AsynQueue(storage: ImageDataQueue(maxSize: 30))
private var task: Task<Void, Never>? = nil
private func start() {
    
    if task?.isCancelled == false {
        Log.i("run...")
        return
    }
    
    Log.i("startProcessing")
    
    task = Task {
        if Task.isCancelled {
            Log.i("Task cancel")
            return
        }
        
        while !Task.isCancelled {
            if let data = await imageDataQueue.take() {
                print("data = \(data)")
            }
        }
        
        Log.i("while 循环结束 退出 task")
    }
    
}

private func stop() {
    task?.cancel()
    task = nil
}

```

