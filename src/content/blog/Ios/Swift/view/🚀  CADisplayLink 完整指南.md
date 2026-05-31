---
title: "CADisplayLink 完整指南"
description: "CADisplayLink 是 Core Animation 框架中的一个类，它创建一个与显示器刷新率同步的定时器。它主要用于创建平滑的动画和游戏循环，确保渲染与屏幕刷新同步。"
pubDate: 2026-05-29
category: "view"
tags: [iOS, Swift]
draft: false
---
# 🚀  CADisplayLink 完整指南

## 概述

`CADisplayLink` 是 Core Animation 框架中的一个类，它创建一个与显示器刷新率同步的定时器。它主要用于创建平滑的动画和游戏循环，确保渲染与屏幕刷新同步。

## 基本概念

- **刷新率同步**：CADisplayLink 与设备的屏幕刷新率（通常是 60Hz 或 120Hz）同步
- **垂直同步（VSync）**：避免画面撕裂，确保动画流畅
- **高精度定时**：比 NSTimer 更适合动画和图形渲染

## 创建和初始化

### 基本创建方法

```swift
// 方法1：使用 target-action 模式
let displayLink = CADisplayLink(target: self, selector: #selector(displayLinkCallback))

// 方法2：使用闭包（iOS 10.0+）
let displayLink = CADisplayLink(target: self, selector: #selector(displayLinkCallback))
```

### 完整的创建示例

```swift
class ViewController: UIViewController {
    private var displayLink: CADisplayLink?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupDisplayLink()
    }
    
    private func setupDisplayLink() {
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkCallback))
        displayLink?.add(to: .main, forMode: .default)
    }
    
    @objc private func displayLinkCallback(_ displayLink: CADisplayLink) {
        // 动画或渲染逻辑
        updateAnimation()
    }
}
```

## 核心属性

### 1. timestamp

```swift
var timestamp: CFTimeInterval { get }
```

**说明**：最近一次屏幕刷新的时间戳

**使用示例**：
```swift
@objc private func displayLinkCallback(_ displayLink: CADisplayLink) {
    let currentTime = displayLink.timestamp
    print("当前时间戳: \(currentTime)")
    
    // 计算增量时间
    if lastTimestamp > 0 {
        let deltaTime = currentTime - lastTimestamp
        updateAnimation(deltaTime: deltaTime)
    }
    lastTimestamp = currentTime
}
```

### 2. duration

```swift
var duration: CFTimeInterval { get }
```

**说明**：两次连续屏幕刷新之间的时间间隔

**使用示例**：
```swift
@objc private func displayLinkCallback(_ displayLink: CADisplayLink) {
    let frameDuration = displayLink.duration
    let fps = 1.0 / frameDuration
    print("当前 FPS: \(fps)")
}
```

### 3. targetTimestamp

```swift
var targetTimestamp: CFTimeInterval { get }
```

**说明**：下一次预期屏幕刷新的时间戳

**使用示例**：
```swift
@objc private func displayLinkCallback(_ displayLink: CADisplayLink) {
    let nextFrameTime = displayLink.targetTimestamp
    let timeUntilNextFrame = nextFrameTime - CACurrentMediaTime()
    
    if timeUntilNextFrame > 0.001 {
        // 还有时间做额外的计算
        performOptionalCalculations()
    }
}
```

### 4. isPaused

```swift
var isPaused: Bool { get set }
```

**说明**：控制 DisplayLink 的暂停状态

**使用示例**：
```swift
// 暂停动画
displayLink?.isPaused = true

// 恢复动画
displayLink?.isPaused = false

// 在应用进入后台时暂停
override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    displayLink?.isPaused = true
}
```

### 5. preferredFramesPerSecond

```swift
var preferredFramesPerSecond: Int { get set }
```

**说明**：设置期望的帧率（iOS 10.0+）

**使用示例**：
```swift
// 设置为 30 FPS
displayLink?.preferredFramesPerSecond = 30

// 设置为设备最大帧率
displayLink?.preferredFramesPerSecond = 0 // 默认值

// 设置为 120 FPS（ProMotion 设备）
displayLink?.preferredFramesPerSecond = 120
```

### 6. preferredFrameRateRange (iOS 15.0+)

```swift
var preferredFrameRateRange: CAFrameRateRange { get set }
```

**说明**：更精细的帧率控制，支持动态帧率

**使用示例**：
```swift
if #available(iOS 15.0, *) {
    // 设置帧率范围：最小 30fps，最大 120fps，首选 60fps
    displayLink?.preferredFrameRateRange = CAFrameRateRange(
        minimum: 30,
        maximum: 120,
        preferred: 60
    )
}
```

## 运行循环管理

### add(to:forMode:)

```swift
func add(to runloop: RunLoop, forMode mode: RunLoop.Mode)
```

**说明**：将 DisplayLink 添加到指定的运行循环和模式

**常用模式**：
```swift
// 默认模式（推荐）
displayLink?.add(to: .main, forMode: .default)

// 通用模式（在滚动时也能运行）
displayLink?.add(to: .main, forMode: .common)

// 跟踪模式（仅在界面跟踪时运行）
displayLink?.add(to: .main, forMode: .tracking)
```

### remove(from:forMode:)

```swift
func remove(from runloop: RunLoop, forMode mode: RunLoop.Mode)
```

**说明**：从指定运行循环移除 DisplayLink

**使用示例**：
```swift
// 移除 DisplayLink
displayLink?.remove(from: .main, forMode: .default)

// 清理资源
displayLink?.invalidate()
displayLink = nil
```

## 常见使用模式

### 1. 基础动画循环

```swift
class AnimationController {
    private var displayLink: CADisplayLink?
    private var animationView: UIView!
    private var startTime: CFTimeInterval = 0
    
    func startAnimation() {
        animationView = UIView(frame: CGRect(x: 0, y: 0, width: 50, height: 50))
        animationView.backgroundColor = .red
        view.addSubview(animationView)
        
        startTime = CACurrentMediaTime()
        displayLink = CADisplayLink(target: self, selector: #selector(animationLoop))
        displayLink?.add(to: .main, forMode: .default)
    }
    
    @objc private func animationLoop(_ displayLink: CADisplayLink) {
        let elapsed = displayLink.timestamp - startTime
        let progress = sin(elapsed) * 0.5 + 0.5 // 0-1 之间的正弦波
        
        let centerX = view.bounds.width * progress
        animationView.center.x = centerX
    }
    
    func stopAnimation() {
        displayLink?.invalidate()
        displayLink = nil
    }
}
```

### 2. FPS 监控

```swift
class FPSMonitor {
    private var displayLink: CADisplayLink?
    private var frameCount = 0
    private var lastTimestamp: CFTimeInterval = 0
    
    func startMonitoring() {
        displayLink = CADisplayLink(target: self, selector: #selector(fpsCallback))
        displayLink?.add(to: .main, forMode: .common)
    }
    
    @objc private func fpsCallback(_ displayLink: CADisplayLink) {
        frameCount += 1
        
        if lastTimestamp == 0 {
            lastTimestamp = displayLink.timestamp
            return
        }
        
        let elapsed = displayLink.timestamp - lastTimestamp
        
        if elapsed >= 1.0 { // 每秒更新一次
            let fps = Double(frameCount) / elapsed
            print("当前 FPS: \(Int(fps))")
            
            frameCount = 0
            lastTimestamp = displayLink.timestamp
        }
    }
}
```

### 3. 游戏循环

```swift
class GameLoop {
    private var displayLink: CADisplayLink?
    private var lastUpdateTime: CFTimeInterval = 0
    private var gameObjects: [GameObject] = []
    
    func startGame() {
        displayLink = CADisplayLink(target: self, selector: #selector(gameUpdate))
        displayLink?.preferredFramesPerSecond = 60
        displayLink?.add(to: .main, forMode: .default)
        lastUpdateTime = CACurrentMediaTime()
    }
    
    @objc private func gameUpdate(_ displayLink: CADisplayLink) {
        let currentTime = displayLink.timestamp
        let deltaTime = currentTime - lastUpdateTime
        lastUpdateTime = currentTime
        
        // 更新游戏逻辑
        updateGameLogic(deltaTime: deltaTime)
        
        // 渲染游戏画面
        renderGame()
    }
    
    private func updateGameLogic(deltaTime: CFTimeInterval) {
        for gameObject in gameObjects {
            gameObject.update(deltaTime: deltaTime)
        }
    }
    
    private func renderGame() {
        // 渲染逻辑
    }
}
```

## 最佳实践

### 1. 内存管理

```swift
class DisplayLinkManager {
    private var displayLink: CADisplayLink?
    
    deinit {
        // 确保在 deinit 中清理
        stopDisplayLink()
    }
    
    func startDisplayLink() {
        stopDisplayLink() // 先停止现有的
        
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkCallback))
        displayLink?.add(to: .main, forMode: .default)
    }
    
    func stopDisplayLink() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    @objc private func displayLinkCallback(_ displayLink: CADisplayLink) {
        // 动画逻辑
    }
}
```

### 2. 生命周期管理

```swift
class ViewController: UIViewController {
    private var displayLink: CADisplayLink?
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startDisplayLink()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        displayLink?.isPaused = true
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        stopDisplayLink()
    }
    
    // 处理应用状态变化
    @objc private func appDidEnterBackground() {
        displayLink?.isPaused = true
    }
    
    @objc private func appWillEnterForeground() {
        displayLink?.isPaused = false
    }
}
```

### 3. 性能优化

```swift
class OptimizedDisplayLink {
    private var displayLink: CADisplayLink?
    private var needsUpdate = true
    
    @objc private func displayLinkCallback(_ displayLink: CADisplayLink) {
        // 只在需要时更新
        guard needsUpdate else { return }
        
        // 执行更新
        performUpdate()
        
        // 重置标志
        needsUpdate = false
    }
    
    func setNeedsUpdate() {
        needsUpdate = true
    }
    
    private func performUpdate() {
        // 实际更新逻辑
    }
}
```

## 注意事项

### 1. 强引用循环

```swift
// ❌ 错误：可能导致循环引用
displayLink = CADisplayLink(target: self, selector: #selector(callback))

// ✅ 正确：使用弱引用包装器
class WeakTarget {
    weak var target: AnyObject?
    let selector: Selector
    
    init(target: AnyObject, selector: Selector) {
        self.target = target
        self.selector = selector
    }
    
    @objc func performSelector() {
        _ = target?.perform(selector)
    }
}

let weakTarget = WeakTarget(target: self, selector: #selector(callback))
displayLink = CADisplayLink(target: weakTarget, selector: #selector(WeakTarget.performSelector))
```

### 2. 帧率适配

```swift
// 检测设备能力
func setupOptimalFrameRate() {
    if #available(iOS 15.0, *) {
        let maxFrameRate = UIScreen.main.maximumFramesPerSecond
        displayLink?.preferredFrameRateRange = CAFrameRateRange(
            minimum: 30,
            maximum: Float(maxFrameRate),
            preferred: 60
        )
    } else {
        displayLink?.preferredFramesPerSecond = 60
    }
}
```

### 3. 电池优化

```swift
// 根据应用状态调整帧率
func adjustFrameRateForPowerSaving() {
    let lowPowerMode = ProcessInfo.processInfo.isLowPowerModeEnabled
    
    if lowPowerMode {
        displayLink?.preferredFramesPerSecond = 30
    } else {
        displayLink?.preferredFramesPerSecond = 60
    }
}
```

## 总结

CADisplayLink 是创建流畅动画和游戏循环的强大工具。正确使用它需要注意：

1. **及时清理**：避免内存泄漏
2. **生命周期管理**：在合适的时机启动和停止
3. **性能优化**：避免不必要的更新
4. **帧率适配**：根据设备和场景选择合适的帧率
5. **电池友好**：在低电量模式下降低帧率

通过合理使用 CADisplayLink，可以创建出高性能、流畅的用户界面和游戏体验。