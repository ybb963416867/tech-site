---
title: "UIGestureRecognizerDelegate 完全指南"
description: "UIGestureRecognizerDelegate 是 iOS 中用于控制手势识别器行为的协议。通过实现该协议的方法，可以精确控制手势的识别时机、优先级和交互关系。"
pubDate: 2026-05-29
category: "uikt"
tags: [iOS, Swift]
draft: false
---
# 🚀  UIGestureRecognizerDelegate 完全指南

## 概述

`UIGestureRecognizerDelegate` 是 iOS 中用于控制手势识别器行为的协议。通过实现该协议的方法，可以精确控制手势的识别时机、优先级和交互关系。

## 协议方法详解

### 1. gestureRecognizerShouldBegin(_:)

```swift
optional func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool
```

**作用：** 决定手势识别器是否应该开始识别手势

**参数：**
- `gestureRecognizer`: 询问是否应该开始的手势识别器

**返回值：**
- `true`: 允许手势开始识别（默认值）
- `false`: 阻止手势开始识别

**调用时机：** 在手势即将开始识别时调用

**使用场景：**
- 根据当前状态条件性地启用/禁用手势
- 根据触摸位置决定是否激活手势
- 根据其他UI状态控制手势

**示例：**
```swift
func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
    if gestureRecognizer == myPanGesture {
        // 只在特定条件下允许拖拽
        return isEditingMode && !isLocked
    }
    if gestureRecognizer == pinchGesture {
        // 根据内容类型决定是否允许缩放
        return contentType == .image
    }
    return true
}
```

---

### 2. gestureRecognizer(_:shouldReceive:) - Touch

```swift
optional func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool
```

**作用：** 决定手势识别器是否应该接收特定的触摸事件

**参数：**
- `gestureRecognizer`: 请求接收触摸的手势识别器
- `touch`: 待处理的触摸对象

**返回值：**
- `true`: 允许手势接收这个触摸（默认值）
- `false`: 拒绝接收这个触摸

**调用时机：** 在每个触摸开始时调用

**使用场景：**
- 根据触摸位置过滤手势
- 根据触摸的view类型决定是否响应
- 实现复杂的触摸区域控制
- 排除特定子视图的触摸

**示例：**
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
    let point = touch.location(in: self)
    
    if gestureRecognizer == panGesture {
        // 只在边缘区域接收拖拽触摸
        let edgeWidth: CGFloat = 20
        return point.x < edgeWidth || point.x > bounds.width - edgeWidth
    }
    
    // 排除按钮区域的触摸
    if let touchView = touch.view, touchView is UIButton {
        return false
    }
    
    return true
}
```

---

### 3. gestureRecognizer(_:shouldReceive:) - Press

```swift
optional func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive press: UIPress) -> Bool
```

**作用：** 决定手势识别器是否应该接收按压事件（主要用于 Apple TV 遥控器）

**参数：**
- `gestureRecognizer`: 请求接收按压的手势识别器
- `press`: UIPress 对象，包含按压信息

**返回值：**
- `true`: 允许接收按压事件
- `false`: 拒绝接收按压事件

**调用时机：** 在按压事件开始时调用

**使用场景：** 主要用于 tvOS 应用，过滤特定的按键事件

---

### 4. gestureRecognizer(_:shouldRecognizeSimultaneouslyWith:)

```swift
optional func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool
```

**作用：** 决定两个手势识别器是否可以同时识别

**参数：**
- `gestureRecognizer`: 当前手势识别器
- `otherGestureRecognizer`: 另一个手势识别器

**返回值：**
- `true`: 允许同时识别
- `false`: 不允许同时识别（默认值）

**调用时机：** 当两个手势可能冲突时调用

**使用场景：**
- 实现复合手势（如同时缩放和旋转）
- 控制手势冲突
- 创建自定义手势组合
- 保护自己的触摸事件不被阻断

**示例：**
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    
    // 允许缩放和旋转同时进行
    if (gestureRecognizer is UIPinchGestureRecognizer && otherGestureRecognizer is UIRotationGestureRecognizer) ||
       (gestureRecognizer is UIRotationGestureRecognizer && otherGestureRecognizer is UIPinchGestureRecognizer) {
        return true
    }
    
    // 自己的阻断手势不与父容器手势同时识别
    if gestureRecognizer == blockingGesture {
        if let scrollView = otherGestureRecognizer.view as? UIScrollView {
            return false  // 阻断父容器滚动
        }
        return true  // 允许其他手势
    }
    
    return false
}
```

---

### 5. gestureRecognizer(_:shouldRequireFailureOf:)

```swift
optional func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool
```

**作用：** 决定当前手势是否应该等待另一个手势失败后才能识别

**参数：**
- `gestureRecognizer`: 当前手势识别器
- `otherGestureRecognizer`: 需要等待失败的手势识别器

**返回值：**
- `true`: 当前手势等待其他手势失败
- `false`: 不等待（默认值）

**调用时机：** 在手势识别过程中，当需要确定优先级时调用

**使用场景：**
- 实现手势优先级
- 处理单击/双击冲突
- 创建复杂的手势序列

**示例：**
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    
    // 单击手势等待双击手势失败
    if gestureRecognizer == singleTapGesture && otherGestureRecognizer == doubleTapGesture {
        return true
    }
    
    // 拖拽手势等待长按手势失败
    if gestureRecognizer == panGesture && otherGestureRecognizer == longPressGesture {
        return true
    }
    
    return false
}
```

---

### 6. gestureRecognizer(_:shouldBeRequiredToFailBy:)

```swift
optional func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool
```

**作用：** 决定其他手势是否应该等待当前手势失败后才能识别

**参数：**
- `gestureRecognizer`: 当前手势识别器
- `otherGestureRecognizer`: 可能需要等待的手势识别器

**返回值：**
- `true`: 其他手势等待当前手势失败
- `false`: 不要求等待（默认值）

**调用时机：** 在手势识别过程中，当需要确定优先级时调用

**使用场景：**
- 设置手势优先级
- 阻止父容器手势干扰
- 实现自定义手势层级
- 让当前控件的手势优先于父容器

**示例：**
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    
    // 要求父容器的滚动手势等待当前手势失败
    if gestureRecognizer == myCustomGesture {
        if let scrollView = otherGestureRecognizer.view as? UIScrollView {
            return isParentScrollView(scrollView)
        }
    }
    
    // 双击手势要求其他手势等待
    if gestureRecognizer == doubleTapGesture {
        return otherGestureRecognizer == singleTapGesture
    }
    
    return false
}

private func isParentScrollView(_ scrollView: UIScrollView) -> Bool {
    var parent = superview
    while parent != nil {
        if parent === scrollView {
            return true
        }
        parent = parent?.superview
    }
    return false
}
```

## 手势识别器相关属性

### 重要属性

```swift
// 是否取消触摸事件传递
gestureRecognizer.cancelsTouchesInView = false

// 是否延迟触摸开始
gestureRecognizer.delaysTouchesBegan = false

// 是否延迟触摸结束
gestureRecognizer.delaysTouchesEnded = false

// 手势名称（调试用）
gestureRecognizer.name = "MyCustomGesture"

// 手势状态
gestureRecognizer.state // .possible, .began, .changed, .ended, .cancelled, .failed

// 是否启用
gestureRecognizer.isEnabled = true
```

## 实际应用示例

### 完整的自定义滑块示例

```swift
class CustomSlider: UISlider {
    private var blockingGesture: UIPanGestureRecognizer!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        setupGestures()
    }
    
    private func setupGestures() {
        // 创建阻断手势，防止父容器滚动
        blockingGesture = UIPanGestureRecognizer(target: self, action: #selector(handleBlockingGesture(_:)))
        blockingGesture.delegate = self
        blockingGesture.cancelsTouchesInView = false  // 关键：不取消自己的触摸事件
        blockingGesture.name = "SliderBlockingGesture"
        addGestureRecognizer(blockingGesture)
    }
    
    @objc private func handleBlockingGesture(_ gesture: UIPanGestureRecognizer) {
        // 空实现，仅用于阻断父容器手势
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        print("✅ CustomSlider touchesBegan")
        sendActions(for: .touchDown)
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        print("✅ CustomSlider touchesMoved")
        sendActions(for: .valueChanged)
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        print("✅ CustomSlider touchesEnded")
        sendActions(for: .touchUpInside)
    }
}

extension CustomSlider: UIGestureRecognizerDelegate {
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        // 阻断手势只在自己的范围内生效
        if gestureRecognizer == blockingGesture {
            let point = touch.location(in: self)
            return bounds.contains(point)
        }
        return true
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        
        if gestureRecognizer == blockingGesture {
            // 检查是否是父容器的滚动手势
            if let scrollView = otherGestureRecognizer.view as? UIScrollView {
                if isParentScrollView(scrollView) {
                    print("❌ 阻断父容器滚动手势")
                    return false
                }
            }
            
            // 允许其他手势同时识别
            print("✅ 允许其他手势同时识别")
            return true
        }
        
        return true
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        
        if gestureRecognizer == blockingGesture {
            // 要求父容器手势等待阻断手势失败
            if let scrollView = otherGestureRecognizer.view as? UIScrollView {
                if isParentScrollView(scrollView) {
                    print("✅ 要求父容器手势等待")
                    return true
                }
            }
        }
        
        return false
    }
    
    private func isParentScrollView(_ scrollView: UIScrollView) -> Bool {
        var parent = superview
        while parent != nil {
            if parent === scrollView {
                return true
            }
            parent = parent?.superview
        }
        return false
    }
}
```

### 复杂手势控制示例

```swift
class InteractiveImageView: UIImageView {
    private var panGesture: UIPanGestureRecognizer!
    private var pinchGesture: UIPinchGestureRecognizer!
    private var rotationGesture: UIRotationGestureRecognizer!
    private var singleTapGesture: UITapGestureRecognizer!
    private var doubleTapGesture: UITapGestureRecognizer!
    
    private var isEditMode = false
    
    override func awakeFromNib() {
        super.awakeFromNib()
        setupGestures()
    }
    
    private func setupGestures() {
        isUserInteractionEnabled = true
        
        // 拖拽手势
        panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        panGesture.delegate = self
        panGesture.name = "ImagePanGesture"
        addGestureRecognizer(panGesture)
        
        // 缩放手势
        pinchGesture = UIPinchGestureRecognizer(target: self, action: #selector(handlePinch(_:)))
        pinchGesture.delegate = self
        pinchGesture.name = "ImagePinchGesture"
        addGestureRecognizer(pinchGesture)
        
        // 旋转手势
        rotationGesture = UIRotationGestureRecognizer(target: self, action: #selector(handleRotation(_:)))
        rotationGesture.delegate = self
        rotationGesture.name = "ImageRotationGesture"
        addGestureRecognizer(rotationGesture)
        
        // 单击手势
        singleTapGesture = UITapGestureRecognizer(target: self, action: #selector(handleSingleTap(_:)))
        singleTapGesture.delegate = self
        singleTapGesture.name = "ImageSingleTapGesture"
        addGestureRecognizer(singleTapGesture)
        
        // 双击手势
        doubleTapGesture = UITapGestureRecognizer(target: self, action: #selector(handleDoubleTap(_:)))
        doubleTapGesture.numberOfTapsRequired = 2
        doubleTapGesture.delegate = self
        doubleTapGesture.name = "ImageDoubleTapGesture"
        addGestureRecognizer(doubleTapGesture)
        
        // 设置单击等待双击失败
        singleTapGesture.require(toFail: doubleTapGesture)
    }
    
    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) { /* 实现拖拽 */ }
    @objc private func handlePinch(_ gesture: UIPinchGestureRecognizer) { /* 实现缩放 */ }
    @objc private func handleRotation(_ gesture: UIRotationGestureRecognizer) { /* 实现旋转 */ }
    @objc private func handleSingleTap(_ gesture: UITapGestureRecognizer) { /* 单击处理 */ }
    @objc private func handleDoubleTap(_ gesture: UITapGestureRecognizer) { /* 双击处理 */ }
}

extension InteractiveImageView: UIGestureRecognizerDelegate {
    
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        // 编辑模式下才允许变换手势
        if gestureRecognizer == panGesture || 
           gestureRecognizer == pinchGesture || 
           gestureRecognizer == rotationGesture {
            return isEditMode
        }
        
        // 点击手势总是允许
        return true
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        // 所有手势都接收触摸
        return true
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        
        // 允许缩放、旋转、拖拽同时进行
        let transformGestures: [UIGestureRecognizer] = [panGesture, pinchGesture, rotationGesture]
        
        if transformGestures.contains(gestureRecognizer) && transformGestures.contains(otherGestureRecognizer) {
            return true
        }
        
        // 点击手势不与其他手势同时进行
        if gestureRecognizer == singleTapGesture || gestureRecognizer == doubleTapGesture {
            return false
        }
        
        return false
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        // 单击等待双击失败
        if gestureRecognizer == singleTapGesture && otherGestureRecognizer == doubleTapGesture {
            return true
        }
        
        return false
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        // 双击优先于单击
        if gestureRecognizer == doubleTapGesture && otherGestureRecognizer == singleTapGesture {
            return true
        }
        
        // 阻止父容器滚动
        if transformGestures.contains(gestureRecognizer) {
            if let scrollView = otherGestureRecognizer.view as? UIScrollView {
                return isParentScrollView(scrollView)
            }
        }
        
        return false
    }
    
    private var transformGestures: [UIGestureRecognizer] {
        return [panGesture, pinchGesture, rotationGesture]
    }
    
    private func isParentScrollView(_ scrollView: UIScrollView) -> Bool {
        var parent = superview
        while parent != nil {
            if parent === scrollView { return true }
            parent = parent?.superview
        }
        return false
    }
}
```

## 最佳实践

### 1. 性能优化
- **选择性实现：** 只实现需要的代理方法，避免不必要的方法调用
- **轻量级逻辑：** 代理方法中避免复杂计算，保持逻辑简单快速
- **缓存结果：** 对于重复计算的结果（如父视图查找）可以适当缓存

### 2. 手势冲突解决
- **明确优先级：** 使用 `require(toFail:)` 或代理方法明确手势优先级
- **层级管理：** 通过 `shouldBeRequiredToFailBy` 管理父子容器的手势关系
- **精确控制：** 使用 `shouldReceive` 精确控制手势的触发区域

### 3. 调试技巧
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    print("🤝 Simultaneous check:")
    print("   Current: \(gestureRecognizer.name ?? "Unknown") (\(type(of: gestureRecognizer)))")
    print("   Other: \(otherGestureRecognizer.name ?? "Unknown") (\(type(of: otherGestureRecognizer)))")
    print("   Other's view: \(type(of: otherGestureRecognizer.view))")
    
    // 你的逻辑...
    let result = true
    print("   Result: \(result)")
    return result
}
```

### 4. 常见问题解决

#### 问题1：触摸事件被手势拦截
**解决方案：**
```swift
gesture.cancelsTouchesInView = false
gesture.delaysTouchesBegan = false
```

#### 问题2：父容器滚动干扰
**解决方案：**
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    if gestureRecognizer == myGesture {
        return otherGestureRecognizer.view is UIScrollView
    }
    return false
}
```

#### 问题3：手势识别不准确
**解决方案：**
```swift
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
    let point = touch.location(in: self)
    return activeArea.contains(point)
}
```

### 5. 设计模式

#### 手势管理器模式
```swift
class GestureManager: NSObject {
    weak var targetView: UIView?
    private var gestures: [String: UIGestureRecognizer] = [:]
    
    func setupGestures(for view: UIView) {
        targetView = view
        // 统一管理所有手势
    }
}

extension GestureManager: UIGestureRecognizerDelegate {
    // 统一的手势控制逻辑
}
```

#### 状态机模式
```swift
enum GestureState {
    case idle, editing, transforming, selecting
}

class StatefulGestureView: UIView {
    private var currentState: GestureState = .idle
    
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        return isGestureAllowed(gestureRecognizer, in: currentState)
    }
    
    private func isGestureAllowed(_ gesture: UIGestureRecognizer, in state: GestureState) -> Bool {
        // 根据状态决定手势是否允许
    }
}
```

## 总结

`UIGestureRecognizerDelegate` 是 iOS 手势系统的核心控制接口，掌握这些方法的使用可以：

1. **精确控制手势行为** - 通过6个核心方法实现复杂的手势逻辑
2. **解决手势冲突** - 处理父子容器、同级视图之间的手势竞争
3. **优化用户体验** - 创建流畅、直观的交互效果
4. **提高代码质量** - 通过合理的手势管理提升应用的健壮性

关键在于理解每个方法的调用时机和作用范围，根据具体需求选择合适的控制策略，并通过良好的代码组织和调试手段确保手势系统的稳定性。