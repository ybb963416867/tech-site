---
title: "HandleThread"
description: "HandleThread 的技术笔记。"
pubDate: 2026-05-29
category: "Swift"
tags: [Mac, Swift, API]
draft: false
---
```
//
//  HandleThread.swift
//  wscanner
//
//  Created by yunshen on 2025/2/15.
//
import Foundation

/// 专用线程类，内部启动一个 RunLoop 以保持线程活跃
public class HandleThread: NSObject {
    private var isRunning = false

    // 将 thread 定义为 lazy 属性，这样它的初始化会在 init 完成后首次访问时执行
    private lazy var thread: Thread = {
        let thread = Thread {
            // 在这里捕获 self（使用 weak 避免循环引用）
            [weak self] in
            guard let self = self else { return }
            self.isRunning = true
            let runLoop = RunLoop.current
            // 添加一个输入源，确保 RunLoop 不会立即退出
            runLoop.add(NSMachPort(), forMode: .default)
            // 保持 RunLoop 运行，直到 isRunning 被置为 false
            while self.isRunning
                && runLoop.run(mode: .default, before: Date.distantFuture)
            {}
        }
        thread.name = "DedicatedThread"
        return thread
    }()

    public init(name: String) {
        super.init()
        thread.name = name
        thread.start()
    }

    /// 调度任务到这个线程上执行
    public func perform(block: @escaping () -> Void) {
        self.perform(
            #selector(executeBlock(_:)), on: thread, with: block,
            waitUntilDone: false)
    }

    /// 目标方法，参数类型为 Any，然后转换为闭包并执行
     @objc private func executeBlock(_ obj: Any) {
         if let block = obj as? () -> Void {
             block()
         }
     }

    /// 停止线程
    public func stop() {
        isRunning = false
        perform {
            CFRunLoopStop(CFRunLoopGetCurrent())
        }
    }
}

```

