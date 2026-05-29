---
title: "SwiftUI Animation 完整 API 文档"
description: ""
pubDate: 2026-05-29
category: "view"
tags: [iOS, Swift, API, SEO]
draft: false
---
# 🚀 SwiftUI Animation 完整 API 文档

## 目录
1. [Animation 基础概念](#1-animation-基础概念)
2. [Animation 类型](#2-animation-类型)
3. [Animation 修饰符](#3-animation-修饰符)
4. [Transaction API](#4-transaction-api)
5. [Transition API](#5-transition-api)
6. [AnimatableModifier](#6-animatablemodifier)
7. [GeometryEffect](#7-geometryeffect)
8. [实践示例](#8-实践示例)

---

## 1. Animation 基础概念

### Animation 结构体
SwiftUI 中的 `Animation` 是一个描述动画如何随时间变化的结构体。

```swift
@frozen struct Animation: Equatable, Sendable
```

### 基本用法
```swift
// 方式1：使用 .animation() 修饰符
View.animation(_ animation: Animation?, value: some Equatable)

// 方式2：使用 withAnimation
withAnimation(_ animation: Animation?) {
    // 状态改变
}
```

---

## 2. Animation 类型

### 2.1 预设动画

#### default
```swift
static let `default`: Animation
// 默认动画，等同于 easeInOut(duration: 0.35)
```

#### linear
```swift
static func linear(duration: TimeInterval = 0.35) -> Animation
// 线性动画，匀速运动
// duration: 动画持续时间（秒）
```

#### easeIn
```swift
static func easeIn(duration: TimeInterval = 0.35) -> Animation
// 缓入动画，开始慢后快
// duration: 动画持续时间（秒）
```

#### easeOut
```swift
static func easeOut(duration: TimeInterval = 0.35) -> Animation
// 缓出动画，开始快后慢
// duration: 动画持续时间（秒）
```

#### easeInOut
```swift
static func easeInOut(duration: TimeInterval = 0.35) -> Animation
// 缓入缓出动画，开始和结束慢，中间快
// duration: 动画持续时间（秒）
```

### 2.2 弹性动画

#### spring
```swift
static func spring(
    response: Double = 0.5,
    dampingFraction: Double = 0.825,
    blendDuration: Double = 0
) -> Animation

// response: 弹簧的刚度，控制动画速度
// dampingFraction: 阻尼系数 (0-1)，1 表示临界阻尼
// blendDuration: 动画混合持续时间
```

#### interactiveSpring
```swift
static func interactiveSpring(
    response: Double = 0.15,
    dampingFraction: Double = 0.86,
    blendDuration: Double = 0.25
) -> Animation
// 适用于交互式动画的弹簧效果
```

#### interpolatingSpring
```swift
static func interpolatingSpring(
    stiffness: Double,
    damping: Double,
    initialVelocity: Double = 0
) -> Animation

// stiffness: 弹簧刚度
// damping: 阻尼值
// initialVelocity: 初始速度
```

#### smooth
```swift
static func smooth(duration: TimeInterval = 0.35) -> Animation
// iOS 17+
// 平滑动画，Apple 推荐的新动画类型
```

#### snappy
```swift
static func snappy(duration: TimeInterval = 0.35) -> Animation
// iOS 17+
// 快速响应的动画
```

#### bouncy
```swift
static func bouncy(duration: TimeInterval = 0.35) -> Animation
// iOS 17+
// 弹跳效果动画
```

### 2.3 自定义时间曲线

#### timingCurve
```swift
static func timingCurve(
    _ c0x: Double, _ c0y: Double,
    _ c1x: Double, _ c1y: Double,
    duration: TimeInterval = 0.35
) -> Animation

// 贝塞尔曲线控制点
// c0x, c0y: 第一个控制点
// c1x, c1y: 第二个控制点
```

### 2.4 动画修饰方法

#### delay
```swift
func delay(_ delay: TimeInterval) -> Animation
// 延迟执行动画
```

#### speed
```swift
func speed(_ speed: Double) -> Animation
// 调整动画速度，2.0 = 两倍速，0.5 = 半速
```

#### repeatCount
```swift
func repeatCount(_ repeatCount: Int, autoreverses: Bool = true) -> Animation
// repeatCount: 重复次数
// autoreverses: 是否自动反向
```

#### repeatForever
```swift
func repeatForever(autoreverses: Bool = true) -> Animation
// 无限重复
// autoreverses: 是否自动反向
```

---

## 3. Animation 修饰符

### 3.1 animation(_:value:)
```swift
func animation<V>(
    _ animation: Animation?,
    value: V
) -> some View where V : Equatable

// 当 value 改变时应用动画
// animation: nil 时禁用动画
```

### 3.2 animation(_:)（已废弃）
```swift
@available(iOS, deprecated: 15.0)
func animation(_ animation: Animation?) -> some View
// iOS 15 后不推荐使用
```

### 3.3 withAnimation
```swift
func withAnimation<Result>(
    _ animation: Animation? = .default,
    _ body: () throws -> Result
) rethrows -> Result

// 在闭包内的所有状态改变都会应用动画
```

### 3.4 Binding 的动画
```swift
extension Binding {
    func animation(_ animation: Animation? = .default) -> Binding<Value>
}

// 示例
@State private var isOn = false
Toggle("Switch", isOn: $isOn.animation(.spring()))
```

---

## 4. Transaction API

### Transaction 结构体
```swift
struct Transaction {
    var animation: Animation?
    var disablesAnimations: Bool
    var isContinuous: Bool
}
```

### 使用 Transaction
```swift
// 方式1：withTransaction
withTransaction(Transaction(animation: .spring())) {
    // 状态改变
}

// 方式2：transaction 修饰符
.transaction { transaction in
    transaction.animation = .easeInOut(duration: 2)
}
```

---

## 5. Transition API

### 5.1 预设转场

#### opacity
```swift
static let opacity: AnyTransition
// 淡入淡出
```

#### scale
```swift
static func scale(scale: CGFloat = 0) -> AnyTransition
// 缩放效果
```

#### slide
```swift
static let slide: AnyTransition
// 滑动效果
```

#### move
```swift
static func move(edge: Edge) -> AnyTransition
// 从指定边缘移动
// edge: .top, .bottom, .leading, .trailing
```

#### push
```swift
static func push(from edge: Edge) -> AnyTransition
// iOS 16+
// 推入效果
```

#### offset
```swift
static func offset(_ offset: CGSize) -> AnyTransition
static func offset(x: CGFloat = 0, y: CGFloat = 0) -> AnyTransition
// 偏移效果
```

### 5.2 组合转场

#### combined
```swift
func combined(with other: AnyTransition) -> AnyTransition
// 组合两个转场效果
```

#### asymmetric
```swift
static func asymmetric(
    insertion: AnyTransition,
    removal: AnyTransition
) -> AnyTransition
// 不对称转场，插入和移除使用不同效果
```

### 5.3 自定义转场

```swift
extension AnyTransition {
    static func custom<M: ViewModifier>(
        active: M,
        identity: M
    ) -> AnyTransition
}

// 示例
struct CustomTransition: ViewModifier {
    let opacity: Double
    func body(content: Content) -> some View {
        content.opacity(opacity)
    }
}

extension AnyTransition {
    static var customFade: AnyTransition {
        .modifier(
            active: CustomTransition(opacity: 0),
            identity: CustomTransition(opacity: 1)
        )
    }
}
```

### 5.4 使用转场

```swift
// 基本用法
View.transition(_ transition: AnyTransition)

// 示例
if showView {
    Text("Hello")
        .transition(.slide)
}
```

---

## 6. AnimatableModifier

### 协议定义
```swift
protocol AnimatableModifier: Animatable, ViewModifier {
    var animatableData: AnimatableData { get set }
}
```

### 实现示例
```swift
struct AnimatedProgress: AnimatableModifier {
    var progress: Double
    
    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }
    
    func body(content: Content) -> some View {
        content
            .opacity(progress)
            .scaleEffect(progress)
    }
}
```

---

## 7. GeometryEffect

### 协议定义
```swift
protocol GeometryEffect: Animatable, ViewModifier {
    func effectValue(size: CGSize) -> ProjectionTransform
}
```

### 实现示例
```swift
struct RotateEffect: GeometryEffect {
    var angle: Double
    
    var animatableData: Double {
        get { angle }
        set { angle = newValue }
    }
    
    func effectValue(size: CGSize) -> ProjectionTransform {
        let rotation = CGAffineTransform(rotationAngle: angle * .pi / 180)
        let offset = CGAffineTransform(translationX: size.width/2, y: size.height/2)
        return ProjectionTransform(rotation.concatenating(offset))
    }
}
```

---

## 8. 实践示例

### 8.1 基础动画
```swift
struct BasicAnimationView: View {
    @State private var scale = 1.0
    
    var body: some View {
        Circle()
            .scaleEffect(scale)
            .animation(.easeInOut(duration: 1), value: scale)
            .onTapGesture {
                scale = scale == 1.0 ? 1.5 : 1.0
            }
    }
}
```

### 8.2 组合动画
```swift
struct CombinedAnimationView: View {
    @State private var show = false
    
    var body: some View {
        VStack {
            if show {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.blue)
                    .frame(width: 200, height: 200)
                    .transition(
                        .asymmetric(
                            insertion: .scale.combined(with: .opacity),
                            removal: .slide.combined(with: .opacity)
                        )
                    )
            }
            
            Button("Toggle") {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                    show.toggle()
                }
            }
        }
    }
}
```

### 8.3 手势动画
```swift
struct GestureAnimationView: View {
    @State private var offset = CGSize.zero
    @State private var isDragging = false
    
    var body: some View {
        Circle()
            .fill(isDragging ? Color.red : Color.blue)
            .frame(width: 100, height: 100)
            .offset(offset)
            .animation(.spring(), value: offset)
            .animation(.easeInOut, value: isDragging)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        offset = value.translation
                        isDragging = true
                    }
                    .onEnded { _ in
                        offset = .zero
                        isDragging = false
                    }
            )
    }
}
```

### 8.4 连续动画
```swift
struct ChainedAnimationView: View {
    @State private var step = 0
    
    var body: some View {
        Circle()
            .fill(Color.blue)
            .frame(width: 50, height: 50)
            .offset(x: CGFloat(step * 50))
            .animation(.easeInOut(duration: 0.5), value: step)
            .onAppear {
                Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
                    step = (step + 1) % 5
                }
            }
    }
}
```

### 8.5 相位动画 (iOS 17+)
```swift
struct PhaseAnimationView: View {
    @State private var phase = 0
    
    var body: some View {
        Circle()
            .fill(Color.blue)
            .frame(width: 100, height: 100)
            .phaseAnimator([0, 1, 2]) { view, phase in
                view
                    .scaleEffect(1 + Double(phase) * 0.2)
                    .opacity(1 - Double(phase) * 0.2)
            } animation: { phase in
                .easeInOut(duration: 0.5)
            }
    }
}
```

---

## 性能优化建议

1. **使用 value 参数**: 始终使用 `.animation(_, value:)` 而不是废弃的 `.animation(_)`
2. **避免过度动画**: 不要在大型列表或复杂视图层次中使用过多动画
3. **使用 Transaction**: 对于复杂的动画序列，使用 Transaction 来精确控制
4. **动画隔离**: 将动画应用到最小的视图子集
5. **预计算值**: 对于复杂的动画路径，预先计算值以提高性能

---

## 常见问题解决

### 动画不生效
- 确保视图是可动画的（实现了 Animatable 协议）
- 检查是否有多个动画修饰符冲突
- 使用 `.animation(nil)` 显式禁用不需要的动画

### 动画闪烁
- 避免在动画过程中改变视图标识
- 使用 `.id()` 修饰符保持视图身份
- 检查是否有隐式动画干扰

### 性能问题
- 减少动画的复杂度
- 使用 `drawingGroup()` 对复杂动画进行光栅化
- 避免在动画中进行大量计算