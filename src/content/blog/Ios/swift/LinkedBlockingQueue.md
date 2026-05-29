---
title: "LinkedBlockingQueue"
description: "LinkedBlockingQueue 的技术笔记。"
pubDate: 2026-05-29
category: "swift"
tags: [Swift, API]
draft: false
---
```

//
//  a.swift
//  libmanager
//
//  Created by yunshen on 2025/9/2.
//

//
//  LinkedBlockingQueue.swift
//  wscanner
//
//  Created by yunshen on 2025/9/2.
//

import Foundation

public class YSThread<T>: Thread {
    private var queue: any BlockingQueue<T>
    private var run: (T) -> Void
    private var innerQueue = DispatchQueue.global(qos: .default)
    private var timeout: TimeInterval = 0
    private var onTimeout: (() -> Void)? = nil

    /// - parameters  `queue` 队列
    /// - parameters  `name` 线程的名字
    /// - parameters  `run` 线程的回调
    /// - parameters  `timeout` 线程的超时，如果队列没有数据且在这个时间没没有收到数据则会有超时 如果 timeout 为 0 时 没有超时机制，不为 0 则有超时机制
    public init(
        queue: any BlockingQueue<T>,
        name: String,
        run: @escaping (T) -> Void,
        timeout: TimeInterval = 0,
        onTimeout: (() -> Void)? = nil
    ) {
        self.queue = queue
        self.run = run
        super.init()
        self.name = name
        self.timeout = timeout
        self.onTimeout = onTimeout
    }

    public override func main() {
        while !isCancelled {

            if timeout <= 0 {
                if let element = queue.take() {
                    run(element)
                }
            } else {
                if let element = queue.take(
                    timeout: 2,
                    onTimeout: {
                        self.onTimeout?()
                    }
                ) {
                    run(element)
                }
            }
        }

        print("name = \(name ?? "YSThread") cancel")
    }

    public override func start() {
        if self.isExecuting {
            print("executing ...")
            return
        }
        queue.reset()
        super.start()
    }

    public override func cancel() {
        queue.interrupt()
        super.cancel()
    }

}

// MARK: - 阻塞队列协议
public protocol BlockingQueue<T>: AnyObject {
    associatedtype T

    /// 初始化队列，指定容量、标识和是否打印调试信息
    init(capacity: Int, target: String, isPrint: Bool)

    /// 中断队列，唤醒所有等待的线程
    func interrupt()

    /// 重置中断状态
    func reset()

    /// 检查是否被中断
    var interrupted: Bool { get }

    /// 添加元素，队列满时阻塞，返回是否成功（false 表示被中断）
    @discardableResult
    func put(_ element: T) -> Bool

    /// 获取并移除元素，队列空时阻塞，如果被中断或超时返回 nil 单位秒
    func take(timeout: TimeInterval?, onTimeout: (() -> Void)?) -> T?

    /// 获取并移除元素，队列空时阻塞，如果被中断返回 nil
    func take() -> T?

    /// 尝试添加元素（非阻塞），成功返回 true
    func offer(_ element: T) -> Bool

    /// 尝试获取并移除元素（非阻塞），队列空或被中断返回 nil
    func poll() -> T?

    /// 添加元素，队列满时替换最旧元素并调用回调
    @discardableResult
    func putWithReplace(_ element: T, onReplace: @escaping (T) -> Void) -> Bool

    /// 获取队列当前元素数量
    var size: Int { get }

    /// 检查队列是否为空
    var isEmpty: Bool { get }

    /// 清空队列
    func clear()
}

// MARK: - 可中断的同步阻塞队列
public class LinkedBlockingQueue<T>: BlockingQueue {

    private var target = "LinkedBlockingQueue"
    private class Node {
        var value: T?
        var next: Node?

        init(value: T? = nil) {
            self.value = value
        }
    }

    private var head: Node
    private var tail: Node
    private var count = 0
    private let capacity: Int
    private var isInterrupted = false  // 中断标志

    // 使用同一个锁和两个条件变量
    private let lock = NSLock()
    private let notEmpty = NSCondition()
    private let notFull = NSCondition()
    private var isPrint = false

    required public init(
        capacity: Int = Int.max,
        target: String = "LinkedBlockingQueue",
        isPrint: Bool = false
    ) {
        self.capacity = capacity
        let dummy = Node()
        self.head = dummy
        self.tail = dummy
        self.target = target
        self.isPrint = isPrint
    }

    // MARK: - 中断方法

    /// 中断队列，唤醒所有等待的线程
    public func interrupt() {
        lock.lock()
        isInterrupted = true
        lock.unlock()

        // 唤醒所有等待的线程
        notEmpty.broadcast()
        notFull.broadcast()
    }

    /// 重置中断状态（如果需要重新使用队列）
    public func reset() {
        lock.lock()
        isInterrupted = false
        lock.unlock()
    }

    /// 检查是否被中断
    public var interrupted: Bool {
        lock.lock()
        defer { lock.unlock() }
        return isInterrupted
    }

    // MARK: - 阻塞操作（支持中断）

    /// 添加元素，如果队列满则阻塞，如果被中断则返回 false 慎用会卡线程
    @discardableResult
    public func put(_ element: T) -> Bool {
        notFull.lock()
        defer { notFull.unlock() }

        while count >= capacity && !isInterrupted {
            notFull.wait()
        }

        // 检查是否因为中断而退出
        if isInterrupted {
            if isPrint {
                print("\(target) - put interrupted")
            }
            return false
        }

        lock.lock()
        enqueue(element)
        lock.unlock()
        if isPrint {
            print("\(target) -  put count = \(count)")
        }
        // 通知等待的 take 操作
        notEmpty.signal()
        return true
    }

    public func take(
        timeout: TimeInterval? = nil,
        onTimeout: (() -> Void)? = nil
    ) -> T? {
        notEmpty.lock()
        defer { notEmpty.unlock() }

        let deadline: Date? =
            timeout != nil ? Date().addingTimeInterval(timeout!) : nil

        while count == 0 && !isInterrupted {
            if let deadline = deadline {
                if !notEmpty.wait(until: deadline) {
                    if isPrint {
                        print("\(target) - take timed out")
                    }
                    onTimeout?()
                    return nil
                }
            } else {
                notEmpty.wait()
            }
        }

        if isInterrupted {
            if isPrint {
                print("\(target) - take interrupted")
            }
            return nil
        }

        lock.lock()
        let element = dequeue()
        lock.unlock()
        if isPrint {
            print("\(target) - take count = \(count)")
        }
        notFull.signal()
        return element
    }

    /// 获取并移除元素，如果队列空则阻塞，如果被中断则返回 nil
    public func take() -> T? {
        notEmpty.lock()
        defer { notEmpty.unlock() }

        while count == 0 && !isInterrupted {
            notEmpty.wait()
        }

        // 检查是否因为中断而退出
        if isInterrupted {
            if isPrint {
                print("\(target) - take interrupted")
            }
            return nil
        }

        lock.lock()
        let element = dequeue()
        lock.unlock()
        if isPrint {
            print("\(target) - take count = \(count)")
        }
        // 通知等待的 put 操作
        notFull.signal()

        return element
    }

    // MARK: - 非阻塞操作

    /// 尝试添加元素（非阻塞），成功返回 true
    public func offer(_ element: T) -> Bool {
        lock.lock()
        defer { lock.unlock() }

        if isInterrupted {
            return false
        }

        if count >= capacity {
            return false
        }

        enqueue(element)
        notEmpty.signal()
        return true
    }

    @discardableResult
    public func putWithReplace(_ element: T, onReplace: @escaping (T) -> Void)
        -> Bool
    {
        lock.lock()

        if isInterrupted {
            lock.unlock()
            return false
        }

        var replaced: T? = nil

        if count >= capacity {
            // 队列满，移除最老的元素
            replaced = dequeue()
            // 因为移除一个再添加一个，size不变，但需要通知可能等待的take（如果有新元素）
            notEmpty.signal()
        } else {
            // 通知等待的take
            notEmpty.signal()
        }

        // 添加新元素
        enqueue(element)

        lock.unlock()

        // 如果有替换，在锁外调用回调
        if let old = replaced {
            onReplace(old)
        }
        if isPrint {
            print("\(target) - putWithReplace count = \(count)")
        }

        return true
    }

    /// 尝试获取元素（非阻塞），队列空或被中断返回 nil
    public func poll() -> T? {
        lock.lock()
        defer { lock.unlock() }

        if isInterrupted || count == 0 {
            return nil
        }

        let element = dequeue()
        notFull.signal()
        return element
    }

    // MARK: - 辅助方法

    private func enqueue(_ element: T) {
        let newNode = Node(value: element)
        tail.next = newNode
        tail = newNode
        count += 1
    }

    private func dequeue() -> T? {
        let first = head.next
        let value = first?.value
        head.next = first?.next
        if tail === first {
            tail = head
        }
        count -= 1
        return value
    }

    public var size: Int {
        lock.lock()
        defer { lock.unlock() }
        return count
    }

    public var isEmpty: Bool {
        return size == 0
    }

    /// 清空队列
    public func clear() {
        lock.lock()
        defer { lock.unlock() }

        head.next = nil
        tail = head
        count = 0

        // 通知所有等待的 put 操作
        notFull.broadcast()
    }
}

// MARK: - 简单的可中断阻塞队列（推荐）
public class SimpleBlockingQueue<T>: BlockingQueue {
    private var queue: [T] = []
    private let lock = NSCondition()
    private let capacity: Int
    private var isInterrupted = false  // 中断标志
    private var target = "SimpleBlockingQueue"
    private var isPrint = false

    required public init(
        capacity: Int = Int.max,
        target: String = "SimpleBlockingQueue",
        isPrint: Bool = false
    ) {
        self.capacity = capacity
        self.target = target
        self.isPrint = isPrint
    }

    // MARK: - 中断控制

    /// 中断队列，唤醒所有等待的线程
    public func interrupt() {
        lock.lock()
        isInterrupted = true
        lock.broadcast()  // 唤醒所有等待的线程
        lock.unlock()
        if isPrint {
            print("\(target) - interrupted")
        }
    }

    /// 重置中断状态
    public func reset() {
        lock.lock()
        isInterrupted = false
        lock.unlock()
        if isPrint {
            print("\(target) - reset")
        }
    }

    /// 检查是否被中断
    public var interrupted: Bool {
        lock.lock()
        defer { lock.unlock() }
        return isInterrupted
    }

    // MARK: - 阻塞操作（支持中断）

    /// 添加元素，返回是否成功（false 表示被中断）
    @discardableResult
    public func put(_ element: T) -> Bool {
        lock.lock()
        defer { lock.unlock() }

        while queue.count >= capacity && !isInterrupted {
            lock.wait()
        }

        if isInterrupted {
            if isPrint {
                print("\(target) - put interrupted")
            }
            return false
        }
        if isPrint {
            print("\(target) - put count = \(queue.count + 1)")
        }
        queue.append(element)
        lock.signal()  // 唤醒一个等待的 take
        return true
    }

    public func take(
        timeout: TimeInterval? = nil,
        onTimeout: (() -> Void)? = nil
    ) -> T? {
        lock.lock()
        defer { lock.unlock() }

        let deadline: Date? =
            timeout != nil ? Date().addingTimeInterval(timeout!) : nil

        while queue.isEmpty && !isInterrupted {
            if let deadline = deadline {
                if !lock.wait(until: deadline) {
                    if isPrint {
                        print("\(target) - take timed out")
                    }
                    onTimeout?()
                    return nil
                }
            } else {
                lock.wait()
            }
        }

        if isInterrupted {
            if isPrint {
                print("\(target) - take interrupted")
            }
            return nil
        }

        let element = queue.removeFirst()
        if isPrint {
            print("\(target) - take count = \(queue.count)")
        }
        lock.signal()
        return element
    }

    /// 获取元素，如果被中断返回 nil
    public func take() -> T? {
        lock.lock()
        defer { lock.unlock() }

        while queue.isEmpty && !isInterrupted {
            lock.wait()
        }

        if isInterrupted {
            if isPrint {
                print("\(target) - take interrupted")
            }
            return nil
        }

        let element = queue.removeFirst()
        if isPrint {
            print("\(target) - take count = \(queue.count)")
        }

        lock.signal()  // 唤醒一个等待的 put
        return element
    }

    // MARK: - 非阻塞操作

    /// 尝试添加（非阻塞）
    public func offer(_ element: T) -> Bool {
        lock.lock()
        defer { lock.unlock() }

        if isInterrupted || queue.count >= capacity {
            return false
        }

        queue.append(element)
        lock.signal()
        return true
    }

    /// 尝试获取（非阻塞）
    public func poll() -> T? {
        lock.lock()
        defer { lock.unlock() }

        if isInterrupted || queue.isEmpty {
            return nil
        }

        let element = queue.removeFirst()
        lock.signal()
        return element
    }

    // MARK: - 其他方法

    public var size: Int {
        lock.lock()
        defer { lock.unlock() }
        return queue.count
    }

    public var isEmpty: Bool {
        lock.lock()
        defer { lock.unlock() }
        return queue.isEmpty
    }

    /// 清空队列
    public func clear() {
        lock.lock()
        defer { lock.unlock() }
        queue.removeAll()
        lock.broadcast()
    }

    @discardableResult
    public func putWithReplace(_ element: T, onReplace: @escaping (T) -> Void)
        -> Bool
    {
        lock.lock()

        if isInterrupted {
            lock.unlock()
            return false
        }

        var replaced: T? = nil

        if queue.count >= capacity {
            // 队列满，移除最老的元素
            replaced = queue.removeFirst()
            // 因为移除一个再添加一个，size不变，但需要通知可能等待的take（如果有新元素）
            lock.signal()
        } else {
            // 通知等待的take
            lock.signal()
        }

        // 添加新元素
        queue.append(element)

        lock.unlock()

        // 如果有替换，在锁外调用回调
        if let old = replaced {
            onReplace(old)
        }
        if isPrint {
            print("\(target) - putWithReplace count = \(queue.count)")
        }
        return true
    }
}

```