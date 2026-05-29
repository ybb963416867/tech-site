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
        Thread.setThreadPriority(1.0)
        while !isCancelled {
            if timeout <= 0 {
                if let element = queue.take() {
                    run(element)
                }
            } else {
                if let element = queue.take(
                    timeout: timeout,
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

    init(capacity: Int, target: String, isPrint: Bool)

    func interrupt()
    func reset()

    var interrupted: Bool { get }

    @discardableResult
    func put(_ element: T) -> Bool

    func take(timeout: TimeInterval?, onTimeout: (() -> Void)?) -> T?
    func take() -> T?

    func offer(_ element: T) -> Bool
    func poll() -> T?

    @discardableResult
    func putWithReplace(_ element: T, onReplace: @escaping (T) -> Void) -> Bool

    var size: Int { get }
    var isEmpty: Bool { get }
    func clear()
}

// MARK: - 简单的可中断阻塞队列
/// 使用 DispatchSemaphore + NSLock 替代 NSCondition，
/// 避免高 QoS 线程等待无 QoS 线程时产生的优先级反转警告。
public class SimpleBlockingQueue<T>: BlockingQueue {

    private var queue: [T] = []
    private let mutex = NSLock()                      // 保护队列数据
    private let notEmpty = DispatchSemaphore(value: 0) // 队列非空信号
    private let notFull: DispatchSemaphore?            // 队列未满信号（有界时使用）
    private let capacity: Int
    private var isInterrupted = false
    private var target = "SimpleBlockingQueue"
    private var isPrint = false

    // 用于在 interrupt 时释放所有可能卡在 semaphore.wait 上的等待者
    // 记录当前阻塞在 take 的等待计数，interrupt 时补发信号
    private let waitLock = NSLock()
    private var takeWaiters = 0
    private var putWaiters = 0

    required public init(
        capacity: Int = Int.max,
        target: String = "SimpleBlockingQueue",
        isPrint: Bool = false
    ) {
        self.capacity = capacity
        self.target = target
        self.isPrint = isPrint
        // 有界队列才需要 notFull 信号量，初始值为可用槽位数
        self.notFull = (capacity < Int.max) ? DispatchSemaphore(value: capacity) : nil
    }

    // MARK: - 中断控制

    public func interrupt() {
        mutex.lock()
        isInterrupted = true
        let tc = takeWaiters
        let pc = putWaiters
        mutex.unlock()

        // 唤醒所有阻塞在 take 的等待者
        for _ in 0 ..< tc { notEmpty.signal() }
        // 唤醒所有阻塞在 put 的等待者
        if let nf = notFull {
            for _ in 0 ..< pc { nf.signal() }
        }

        if isPrint { print("\(target) - interrupted") }
    }

    public func reset() {
        mutex.lock()
        isInterrupted = false
        mutex.unlock()
        if isPrint { print("\(target) - reset") }
    }

    public var interrupted: Bool {
        mutex.lock()
        defer { mutex.unlock() }
        return isInterrupted
    }

    // MARK: - 阻塞操作

    @discardableResult
    public func put(_ element: T) -> Bool {
        // 有界队列：等待空槽
        if let nf = notFull {
            mutex.lock()
            if isInterrupted { mutex.unlock(); return false }
            putWaiters += 1
            mutex.unlock()

            nf.wait()   // ← 不再是 NSCondition.wait，无优先级反转警告

            mutex.lock()
            putWaiters -= 1
            if isInterrupted { mutex.unlock(); return false }
            mutex.unlock()
        } else {
            mutex.lock()
            if isInterrupted { mutex.unlock(); return false }
            mutex.unlock()
        }

        mutex.lock()
        if isInterrupted { mutex.unlock(); return false }
        queue.append(element)
        if isPrint { print("\(target) - put count = \(queue.count)") }
        mutex.unlock()

        notEmpty.signal() // 通知 take
        return true
    }

    public func take(
        timeout: TimeInterval? = nil,
        onTimeout: (() -> Void)? = nil
    ) -> T? {
        mutex.lock()
        if isInterrupted { mutex.unlock(); return nil }
        takeWaiters += 1
        mutex.unlock()

        let result: Bool
        if let timeout = timeout {
            // DispatchSemaphore.wait(timeout:) 在后台调度，无优先级反转
            result = notEmpty.wait(timeout: .now() + timeout) == .success
        } else {
            notEmpty.wait()
            result = true
        }

        mutex.lock()
        takeWaiters -= 1

        if !result {
            // 超时
            mutex.unlock()
            if isPrint { print("\(target) - take timed out") }
            onTimeout?()
            return nil
        }

        if isInterrupted {
            mutex.unlock()
            if isPrint { print("\(target) - take interrupted") }
            return nil
        }

        // 正常取出
        guard !queue.isEmpty else {
            // 理论上不会走到这里，保护性处理
            mutex.unlock()
            return nil
        }
        let element = queue.removeFirst()
        if isPrint { print("\(target) - take count = \(queue.count)") }
        mutex.unlock()

        notFull?.signal() // 通知 put 有空槽了
        return element
    }

    public func take() -> T? {
        return take(timeout: nil, onTimeout: nil)
    }

    // MARK: - 非阻塞操作

    public func offer(_ element: T) -> Bool {
        mutex.lock()
        defer { mutex.unlock() }

        if isInterrupted || queue.count >= capacity { return false }

        queue.append(element)
        // 注意：非阻塞 offer 不消耗 notFull，需手动平衡
        // 因为 put 会先 wait notFull，所以 offer 直接写入后要通知 notEmpty
        mutex.unlock()
        notEmpty.signal()
        mutex.lock()
        return true
    }

    public func poll() -> T? {
        mutex.lock()
        if isInterrupted || queue.isEmpty {
            mutex.unlock()
            return nil
        }
        let element = queue.removeFirst()
        if isPrint { print("\(target) - poll count = \(queue.count)") }
        mutex.unlock()
        notFull?.signal()
        return element
    }

    // MARK: - 其他方法

    public var size: Int {
        mutex.lock()
        defer { mutex.unlock() }
        return queue.count
    }

    public var isEmpty: Bool {
        mutex.lock()
        defer { mutex.unlock() }
        return queue.isEmpty
    }

    public func clear() {
        mutex.lock()
        queue.removeAll()
        mutex.unlock()
    }

    @discardableResult
    public func putWithReplace(_ element: T, onReplace: @escaping (T) -> Void) -> Bool {
        mutex.lock()
        if isInterrupted { mutex.unlock(); return false }

        var replaced: T? = nil
        if queue.count >= capacity {
            replaced = queue.removeFirst()
        }
        queue.append(element)
        if isPrint { print("\(target) - putWithReplace count = \(queue.count)") }
        mutex.unlock()

        notEmpty.signal()

        if let old = replaced {
            onReplace(old)
        }
        return true
    }
}

```