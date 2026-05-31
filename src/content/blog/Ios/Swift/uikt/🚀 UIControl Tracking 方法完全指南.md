---
title: "UIControl Tracking 方法完全指南"
description: "UIControl 提供了一套完整的触摸追踪（Tracking）方法，用于处理用户与控件的交互。这些方法比底层的 touches 方法更高级，专门为控件的状态管理和事件发送而设计。"
pubDate: 2026-05-29
category: "uikt"
tags: [Swift]
draft: false
---
# 🚀 UIControl Tracking 方法完全指南

## 概述

`UIControl` 提供了一套完整的触摸追踪（Tracking）方法，用于处理用户与控件的交互。这些方法比底层的 `touches` 方法更高级，专门为控件的状态管理和事件发送而设计。

---

## 1. beginTracking(_:with:)

### 方法签名
```swift
func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool
```

### 作用
当用户开始触摸控件时调用，用于决定是否开始追踪这个触摸。

### 调用时机
- 在 `touchesBegan` 之后立即调用
- 每次新的触摸开始时调用一次

### 参数
- **touch**: `UITouch` - 触摸对象，包含触摸位置、时间等信息
- **event**: `UIEvent?` - 可选的事件对象，包含所有相关触摸

### 返回值
- **`true`**: 开始追踪这个触摸
  - 后续会调用 `continueTracking(_:with:)`
  - 最终会调用 `endTracking(_:with:)` 或 `cancelTracking(with:)`
  - 控件可以响应拖拽操作
  
- **`false`**: 不追踪这个触摸
  - 不会调用 `continueTracking(_:with:)`
  - 不会调用 `endTracking(_:with:)`
  - 触摸被忽略，就像没有发生一样

### 默认行为
```swift
// UIControl 的默认实现
override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    return true  // 默认总是追踪触摸
}
```

### 使用场景

#### 场景1：条件性启用拖拽
```swift
override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    // 只在编辑模式下允许拖拽
    if isEditMode && !isLocked {
        return true
    }
    return false
}
```

#### 场景2：限制触摸区域
```swift
override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    let touchPoint = touch.location(in: self)
    let thumbRect = thumbRect(forBounds: bounds, trackRect: trackRect(forBounds: bounds), value: value)
    
    // 只有点击滑块时才追踪
    if thumbRect.contains(touchPoint) {
        print("点击滑块，开始追踪")
        return true
    } else {
        print("点击轨道，不追踪")
        return false
    }
}
```

#### 场景3：点击轨道跳转并允许拖拽
```swift
override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    let touchPoint = touch.location(in: self)
    let thumbRect = thumbRect(forBounds: bounds, trackRect: trackRect(forBounds: bounds), value: value)
    
    if !thumbRect.contains(touchPoint) {
        // 点击轨道：跳转到该位置
        updateValue(for: touchPoint)
        sendActions(for: .valueChanged)
        
        // 返回 true 允许继续拖拽
        return true
    }
    
    return super.beginTracking(touch, with: event)
}
```

---

## 2. continueTracking(_:with:)

### 方法签名
```swift
func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool
```

### 作用
在触摸移动过程中持续调用，用于更新控件状态。

### 调用时机
- 只有当 `beginTracking` 返回 `true` 后才会被调用
- 在 `touchesMoved` 之后调用
- 每次触摸位置改变时调用
- 可能被调用多次

### 参数
- **touch**: `UITouch` - 当前的触摸对象
- **event**: `UIEvent?` - 可选的事件对象

### 返回值
- **`true`**: 继续追踪这个触摸
  - 下次触摸移动时继续调用 `continueTracking`
  - 触摸结束时调用 `endTracking`
  
- **`false`**: 停止追踪这个触摸
  - 立即停止追踪
  - 会调用 `endTracking` 来清理
  - 后续的触摸移动不再响应

### 默认行为
```swift
// UIControl 的默认实现
override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    return true  // 默认总是继续追踪
}
```

### 使用场景

#### 场景1：正常的值更新
```swift
override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    let touchPoint = touch.location(in: self)
    
    // 根据触摸位置更新值
    updateValue(for: touchPoint)
    
    // 发送值改变事件
    sendActions(for: .valueChanged)
    
    // 继续追踪
    return true
}
```

#### 场景2：限制拖拽范围
```swift
override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    let touchPoint = touch.location(in: self)
    
    // 如果触摸移出有效区域，停止追踪
    if !validDragArea.contains(touchPoint) {
        print("移出有效区域，停止追踪")
        return false  // 停止追踪
    }
    
    updateValue(for: touchPoint)
    sendActions(for: .valueChanged)
    
    return true
}
```

#### 场景3：条件性停止追踪
```swift
override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    let touchPoint = touch.location(in: self)
    
    // 计算移动距离
    let distance = calculateDistance(from: startPoint, to: touchPoint)
    
    // 如果移动距离太大，停止追踪
    if distance > maxDragDistance {
        print("移动距离超出限制，停止追踪")
        return false
    }
    
    updateValue(for: touchPoint)
    return true
}
```

#### 场景4：完全自定义滑块行为
```swift
class CustomSlider: UISlider {
    private var isTrackingFromTrack = false
    
    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        let touchPoint = touch.location(in: self)
        let thumbRect = thumbRect(forBounds: bounds, trackRect: trackRect(forBounds: bounds), value: value)
        
        if !thumbRect.contains(touchPoint) {
            // 从轨道开始
            isTrackingFromTrack = true
            updateValue(for: touchPoint)
            sendActions(for: .valueChanged)
            return true
        }
        
        isTrackingFromTrack = false
        return super.beginTracking(touch, with: event)
    }
    
    override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        let touchPoint = touch.location(in: self)
        
        if isTrackingFromTrack {
            // 自定义追踪逻辑
            updateValue(for: touchPoint)
            sendActions(for: .valueChanged)
            return true
        }
        
        return super.continueTracking(touch, with: event)
    }
}
```

---

## 3. endTracking(_:with:)

### 方法签名
```swift
func endTracking(_ touch: UITouch?, with event: UIEvent?)
```

### 作用
当触摸正常结束时调用，用于清理状态和发送最终事件。

### 调用时机
- 只有开始追踪后才会被调用
- 在 `touchesEnded` 之后调用
- 用户手指离开屏幕时调用
- 或者 `continueTracking` 返回 `false` 时调用

### 参数
- **touch**: `UITouch?` - 结束的触摸对象（可能为 nil）
- **event**: `UIEvent?` - 可选的事件对象

### 返回值
无返回值（`Void`）

### 默认行为
```swift
// UIControl 的默认实现
override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
    // 发送 touchUpInside 或 touchUpOutside 事件
    // 清理内部状态
}
```

### 使用场景

#### 场景1：发送完成事件
```swift
override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
    print("追踪结束")
    
    // 发送触摸结束事件
    sendActions(for: .touchUpInside)
    
    // 清理状态
    isTracking = false
    
    // 添加触觉反馈
    let feedback = UIImpactFeedbackGenerator(style: .light)
    feedback.impactOccurred()
    
    super.endTracking(touch, with: event)
}
```

#### 场景2：根据触摸位置发送不同事件
```swift
override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
    guard let touch = touch else {
        super.endTracking(touch, with: event)
        return
    }
    
    let touchPoint = touch.location(in: self)
    
    if bounds.contains(touchPoint) {
        print("在控件内结束触摸")
        sendActions(for: .touchUpInside)
    } else {
        print("在控件外结束触摸")
        sendActions(for: .touchUpOutside)
    }
    
    super.endTracking(touch, with: event)
}
```

#### 场景3：保存最终状态
```swift
override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
    print("追踪结束，保存状态")
    
    // 保存最终值
    saveFinalValue(value)
    
    // 执行结束动画
    animateToFinalState()
    
    // 重置临时状态
    resetTemporaryState()
    
    super.endTracking(touch, with: event)
}
```

#### 场景4：完全自定义
```swift
override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
    print("自定义追踪结束")
    
    // 重置标记
    isTrackingFromTrack = false
    
    // 发送自定义事件
    sendActions(for: .touchUpInside)
    
    // 不调用 super，完全自己控制
}
```

---

## 4. cancelTracking(with:)

### 方法签名
```swift
func cancelTracking(with event: UIEvent?)
```

### 作用
当触摸被系统取消时调用（如来电、通知等）。

### 调用时机
- 系统中断导致触摸取消（来电、通知、控制中心等）
- 父视图取消了触摸传递
- 手势识别器取消了触摸
- 在 `touchesCancelled` 之后调用

### 参数
- **event**: `UIEvent?` - 可选的事件对象

### 返回值
无返回值（`Void`）

### 默认行为
```swift
// UIControl 的默认实现
override func cancelTracking(with event: UIEvent?) {
    // 发送 touchCancel 事件
    // 清理内部状态
}
```

### 使用场景

#### 场景1：清理状态
```swift
override func cancelTracking(with event: UIEvent?) {
    print("追踪被取消")
    
    // 重置所有追踪状态
    isTracking = false
    isTrackingFromTrack = false
    
    // 恢复到初始状态
    resetToInitialState()
    
    super.cancelTracking(with: event)
}
```

#### 场景2：撤销临时更改
```swift
override func cancelTracking(with event: UIEvent?) {
    print("取消追踪，恢复原始值")
    
    // 恢复到追踪开始前的值
    setValue(originalValue, animated: true)
    
    // 发送取消事件
    sendActions(for: .touchCancel)
    
    super.cancelTracking(with: event)
}
```

#### 场景3：完整的状态管理
```swift
class CustomSlider: UISlider {
    private var originalValue: Float = 0
    private var isTracking = false
    
    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        // 保存原始值
        originalValue = value
        isTracking = true
        
        return super.beginTracking(touch, with: event)
    }
    
    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        print("正常结束")
        isTracking = false
        super.endTracking(touch, with: event)
    }
    
    override func cancelTracking(with event: UIEvent?) {
        print("取消追踪，恢复原始值：\(originalValue)")
        
        // 恢复原始值
        setValue(originalValue, animated: true)
        
        // 重置状态
        isTracking = false
        
        super.cancelTracking(with: event)
    }
}
```

---

## 5. point(_:inside:with:)

### 方法签名
```swift
func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool
```

### 作用
判断一个点是否在指定的视图内，用于精确的触摸区域控制。

### 参数
- **point**: `CGPoint` - 待检测的点，在当前控件的坐标系中
- **view**: `UIView` - 要检测的视图
- **event**: `UIEvent?` - 可选的事件对象

### 返回值
- **`true`**: 点在视图内
- **`false`**: 点不在视图内

### 默认行为
```swift
// UIControl 的默认实现
override func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool {
    // 检查点是否在 view 的 bounds 内
    return view.bounds.contains(view.convert(point, from: self))
}
```

### 与 point(inside:with:) 的区别

```swift
// UIView 的方法 - 检查点是否在自己内部
func point(inside point: CGPoint, with event: UIEvent?) -> Bool

// UIControl 的方法 - 检查点是否在指定视图内部
func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool
```

### 使用场景

#### 场景1：扩大触摸区域
```swift
override func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool {
    // 扩大触摸区域
    let expandedBounds = view.bounds.insetBy(dx: -20, dy: -20)
    let convertedPoint = view.convert(point, from: self)
    
    return expandedBounds.contains(convertedPoint)
}
```

#### 场景2：检测特定子视图
```swift
override func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool {
    if view == customThumbView {
        // 为自定义滑块扩大触摸区域
        let expandedFrame = customThumbView.frame.insetBy(dx: -10, dy: -10)
        return expandedFrame.contains(point)
    }
    
    return super.point(point, inside: view, with: event)
}
```

#### 场景3：自定义形状的触摸检测
```swift
override func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool {
    if view == self {
        // 检测圆形区域
        let center = CGPoint(x: bounds.midX, y: bounds.midY)
        let radius = min(bounds.width, bounds.height) / 2
        let distance = hypot(point.x - center.x, point.y - center.y)
        
        return distance <= radius
    }
    
    return super.point(point, inside: view, with: event)
}
```

---

## 完整的生命周期

### 正常的触摸流程

```
用户触摸控件
    ↓
touchesBegan
    ↓
beginTracking → 返回 true
    ↓
[用户移动手指]
    ↓
touchesMoved
    ↓
continueTracking → 返回 true
    ↓
touchesMoved
    ↓
continueTracking → 返回 true
    ↓
... (重复多次)
    ↓
[用户抬起手指]
    ↓
touchesEnded
    ↓
endTracking
    ↓
触摸结束
```

### 取消的触摸流程

```
用户触摸控件
    ↓
touchesBegan
    ↓
beginTracking → 返回 true
    ↓
touchesMoved
    ↓
continueTracking → 返回 true
    ↓
[系统中断：来电、通知等]
    ↓
touchesCancelled
    ↓
cancelTracking
    ↓
触摸取消
```

### 提前停止的流程

```
用户触摸控件
    ↓
touchesBegan
    ↓
beginTracking → 返回 true
    ↓
touchesMoved
    ↓
continueTracking → 返回 false
    ↓
endTracking
    ↓
[后续的 touchesMoved 不再调用 continueTracking]
    ↓
touchesEnded
    ↓
触摸结束
```

### 不追踪的流程

```
用户触摸控件
    ↓
touchesBegan
    ↓
beginTracking → 返回 false
    ↓
[不会调用 continueTracking]
    ↓
[不会调用 endTracking]
    ↓
touchesEnded
    ↓
触摸结束（但没有被追踪）
```

---

## 完整示例：自定义滑块

```swift
class AdvancedCustomSlider: UISlider {
    
    // MARK: - Properties
    
    private var isTrackingFromTrack = false
    private var originalValue: Float = 0
    private var trackingStartTime: Date?
    
    // MARK: - Tracking Methods
    
    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        print("🟢 beginTracking 开始")
        
        // 保存原始值
        originalValue = value
        trackingStartTime = Date()
        
        let touchPoint = touch.location(in: self)
        let thumbRect = thumbRect(forBounds: bounds, 
                                 trackRect: trackRect(forBounds: bounds), 
                                 value: value)
        
        if !thumbRect.contains(touchPoint) {
            // 点击轨道
            print("   点击轨道位置")
            isTrackingFromTrack = true
            
            // 立即跳转到点击位置
            updateValue(for: touchPoint)
            sendActions(for: .valueChanged)
            
            // 添加触觉反馈
            let feedback = UIImpactFeedbackGenerator(style: .light)
            feedback.impactOccurred()
            
            // 返回 true 允许继续拖拽
            return true
        } else {
            // 点击滑块
            print("   点击滑块")
            isTrackingFromTrack = false
        }
        
        return super.beginTracking(touch, with: event)
    }
    
    override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        print("🔵 continueTracking 追踪中，值：\(value)")
        
        let touchPoint = touch.location(in: self)
        
        // 检查是否移出太远
        let distance = abs(touchPoint.y - bounds.midY)
        if distance > 100 {
            print("   移动距离过大，停止追踪")
            return false  // 停止追踪
        }
        
        if isTrackingFromTrack {
            // 从轨道开始的自定义追踪
            updateValue(for: touchPoint)
            sendActions(for: .valueChanged)
            return true
        }
        
        return super.continueTracking(touch, with: event)
    }
    
    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        print("🟡 endTracking 结束")
        
        // 计算追踪时长
        if let startTime = trackingStartTime {
            let duration = Date().timeIntervalSince(startTime)
            print("   追踪持续时间：\(duration) 秒")
        }
        
        // 检查触摸结束位置
        if let touch = touch {
            let endPoint = touch.location(in: self)
            if bounds.contains(endPoint) {
                print("   在控件内结束")
                sendActions(for: .touchUpInside)
            } else {
                print("   在控件外结束")
                sendActions(for: .touchUpOutside)
            }
        }
        
        // 重置状态
        isTrackingFromTrack = false
        trackingStartTime = nil
        
        // 添加结束动画
        UIView.animate(withDuration: 0.1) {
            self.transform = CGAffineTransform(scaleX: 1.05, y: 1.05)
        } completion: { _ in
            UIView.animate(withDuration: 0.1) {
                self.transform = .identity
            }
        }
        
        super.endTracking(touch, with: event)
    }
    
    override func cancelTracking(with event: UIEvent?) {
        print("🔴 cancelTracking 取消")
        
        // 恢复原始值
        print("   恢复到原始值：\(originalValue)")
        setValue(originalValue, animated: true)
        
        // 重置所有状态
        isTrackingFromTrack = false
        trackingStartTime = nil
        
        // 发送取消事件
        sendActions(for: .touchCancel)
        
        super.cancelTracking(with: event)
    }
    
    override func point(_ point: CGPoint, inside view: UIView, with event: UIEvent?) -> Bool {
        if view == self {
            // 扩大触摸区域
            let expandedBounds = bounds.insetBy(dx: -10, dy: -20)
            let result = expandedBounds.contains(point)
            print("⚪️ point(inside:) 检测点 \(point)：\(result)")
            return result
        }
        
        return super.point(point, inside: view, with: event)
    }
    
    // MARK: - Helper Methods
    
    private func updateValue(for point: CGPoint) {
        let trackRect = self.trackRect(forBounds: bounds)
        let clampedX = max(trackRect.minX, min(trackRect.maxX, point.x))
        let percentage = (clampedX - trackRect.minX) / trackRect.width
        let newValue = minimumValue + Float(percentage) * (maximumValue - minimumValue)
        setValue(newValue, animated: false)
    }
}
```

---

## 方法对比表

| 方法 | 调用时机 | 返回值 | 用途 |
|------|---------|--------|------|
| `beginTracking` | 触摸开始时 | `Bool` - 是否追踪 | 决定是否开始追踪触摸 |
| `continueTracking` | 触摸移动时 | `Bool` - 是否继续 | 更新控件状态，决定是否继续追踪 |
| `endTracking` | 触摸结束时 | 无 | 清理状态，发送最终事件 |
| `cancelTracking` | 触摸取消时 | 无 | 处理系统中断，恢复状态 |
| `point(_:inside:with:)` | 触摸检测时 | `Bool` - 是否在视图内 | 自定义触摸区域判断 |

---

## 最佳实践

### 1. 状态管理
```swift
class StatefulControl: UIControl {
    private var isTracking = false
    private var originalState: State
    
    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        originalState = currentState
        isTracking = true
        return super.beginTracking(touch, with: event)
    }
    
    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        isTracking = false
        super.endTracking(touch, with: event)
    }
    
    override func cancelTracking(with event: UIEvent?) {
        currentState = originalState
        isTracking = false
        super.cancelTracking(with: event)
    }
}
```

### 2. 总是处理取消情况
```swift
override func cancelTracking(with event: UIEvent?) {
    // 总是实现这个方法来清理状态
    resetState()
    super.cancelTracking(with: event)
}
```

### 3. 合理使用返回值
```swift
override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    // 明确的条件判断
    guard isEnabled && !isLocked else {
        return false
    }
    return true
}

override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    // 检查是否应该继续
    guard isValidTrackingState() else {
        return false
    }
    return true
}
```

### 4. 调试技巧
```swift
override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    print("🟢 BEGIN: \(touch.location(in: self))")
    let result = super.beginTracking(touch, with: event)
    print("   返回: \(result)")
    return result
}

override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
    print("🔵 CONTINUE: \(touch.location(in: self)), value: \(value)")
    return super.continueTracking(touch, with: event)
}

override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
    print("🟡 END: \(touch?.location(in: self) ?? .zero)")
    super.endTracking(touch, with: event)
}

override func cancelTracking(with event: UIEvent?) {
    print("🔴 CANCEL")
    super.cancelTracking(with: event)
}
```

---

## 总结

### 核心要点

1. **beginTracking 返回值决定一切**
   - `true` = 开始追踪，后续方法会被调用
   - `false` = 不追踪，后续方法不会被调用

2. **continueTracking 控制追踪过程**
   - `true` = 继续追踪
   - `false` = 提前结束追踪

3. **endTracking 和 cancelTracking 互斥**
   - 正常结束调用 `endTracking`
   - 被中断调用 `cancelTracking`
   - 两者只会调用其中一个

4. **point(_:inside:with:) 用于精确控制**
   - 自定义触摸区域
   - 可以扩大或缩小响应范围

### 典型使用模式

```swift
// 完整的控件追踪模板
class CustomControl: UIControl {
    private var trackingState: TrackingState = .idle
    
    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        guard shouldBeginTracking(touch) else {
            return false
        }
        
        trackingState = .tracking
        handleTrackingBegan(touch)
        return true
    }
    
    override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        guard shouldContinueTracking(touch) else {
            return false
        }
        
        handleTrackingContinued(touch)
        return true
    }
    
    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        trackingState = .idle
        handleTrackingEnded(touch)
        super.endTracking(touch, with: event)
    }
    
    override func cancelTracking(with event: UIEvent?) {
        trackingState = .idle
        handleTrackingCancelled()
        super.cancelTracking(with: event)
    }
}
```

理解这些方法的调用时机、返回值含义和使用场景，是创建自定义控件的关键。合理使用它们可以实现复杂而流畅的交互体验。