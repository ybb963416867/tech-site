---
title: "SwiftUI PreferenceKey 完整指南 🚀"
description: "[概述](概述) [PreferenceKey 协议](preferencekey协议) [核心 API](核心api) [使用场景](使用场景) [完整示例](完整示例) [高级用法](高级用法) [最佳实践](最佳实践)"
pubDate: 2026-05-29
category: "Swift"
tags: [iOS, Environment, Swift, API]
draft: false
---
# SwiftUI PreferenceKey 完整指南 🚀

## 目录

*   [概述](#概述)
*   [PreferenceKey 协议](#preferencekey-协议)
*   [核心 API](#核心-api)
*   [使用场景](#使用场景)
*   [完整示例](#完整示例)
*   [高级用法](#高级用法)
*   [最佳实践](#最佳实践)

***

## 概述

### 什么是 PreferenceKey？

PreferenceKey 是 SwiftUI 中用于**子视图向父视图传递数据**的机制。它实现了**自下而上的数据流**，与 `@Binding`、`@State` 等自上而下的数据流相反。

### 为什么需要 PreferenceKey？

在 SwiftUI 中，数据通常从父视图流向子视图。但有时我们需要：

*   子视图将信息（如尺寸、位置）传递给父视图
*   收集多个子视图的信息
*   在不破坏视图封装的情况下获取子视图的属性

***

## PreferenceKey 协议

### 协议定义

```swift
protocol PreferenceKey {
    associatedtype Value
    
    // 默认值
    static var defaultValue: Value { get }
    
    // 合并多个值的规则
    static func reduce(value: inout Value, nextValue: () -> Value)
}
```

### 必需实现

#### 1. `defaultValue`

*   类型：静态属性
*   作用：当没有子视图设置此 preference 时的默认值
*   必须实现

```swift
static var defaultValue: CGSize = .zero
```

#### 2. `reduce(value:nextValue:)`

*   类型：静态方法
*   作用：定义如何合并来自多个子视图的值
*   参数：
    *   `value`: 当前累积的值（inout 参数）
    *   `nextValue`: 闭包，返回下一个要合并的值
*   必须实现

```swift
static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
    value = nextValue()  // 简单替换
}
```

***

## 核心 API

### 1. `.preference(key:value:)`

**设置 preference 值**

```swift
func preference<K>(key: K.Type, value: K.Value) -> some View where K: PreferenceKey
```

*   在子视图中使用
*   将值向上传递给父视图
*   可以在视图树的任何层级设置

**示例：**

```swift
Text("Hello")
    .background(
        GeometryReader { geometry in
            Color.clear
                .preference(key: SizePreferenceKey.self, value: geometry.size)
        }
    )
```

***

### 2. `.onPreferenceChange(_:perform:)`

**监听 preference 值变化**

```swift
func onPreferenceChange<K>(
    _ key: K.Type, 
    perform action: @escaping (K.Value) -> Void
) -> some View where K: PreferenceKey, K.Value: Equatable
```

*   在父视图中使用
*   当 preference 值改变时触发回调
*   要求 `Value` 遵循 `Equatable` 协议

**示例：**

```swift
VStack {
    childView
}
.onPreferenceChange(SizePreferenceKey.self) { size in
    print("子视图尺寸: \(size)")
}
```

> 完整代码

```swift

struct SizePreferenceKey: PreferenceKey {
    static var defaultValue: CGSize = .zero
    
    static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
        value = nextValue()
    }
    
    typealias Value = CGSize
}

struct ContentView: View {
    @State private var childSize: CGSize = .zero
    
    var body: some View {
        VStack {
            Text("Hello Hello")
                .background(
                    GeometryReader { geometry in
                        Color.clear
                            .preference(key: SizePreferenceKey.self, value: geometry.size)
                    }
                )
            
            Color.blue.frame(width: childSize.width, height: childSize.height)
        }.onPreferenceChange(SizePreferenceKey.self) { size in
            childSize = size
        }
    }
}

```

***

### 3. `.transformPreference(_:_:)`

**转换 preference 值**

```swift
func transformPreference<K>(
    _ key: K.Type, 
    _ callback: @escaping (inout K.Value) -> Void
) -> some View where K: PreferenceKey
```

*   在传递过程中修改 preference 值
*   可以在视图树的任何层级使用
*   用于复杂的数据转换

**示例：**

```swift
someView
    .transformPreference(SizePreferenceKey.self) { size in
        size.width *= 2  // 将宽度翻倍后再向上传递
    }
```

***

### 4. `.backgroundPreferenceValue(_:_:)`

**使用 preference 值创建背景视图**

```swift
func backgroundPreferenceValue<Key, T>(
    _ key: Key.Type,
    @ViewBuilder _ transform: @escaping (Key.Value) -> T
) -> some View where Key: PreferenceKey, T: View
```

*   读取 preference 值并创建背景视图
*   背景视图会响应 preference 值的变化

**示例：**

```swift
struct SizePreferenceKey: PreferenceKey {
    static var defaultValue: CGSize = .zero

    static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
        value = nextValue()
    }

    typealias Value = CGSize
}

struct ContentView: View {
    @State private var childSize: CGSize = .zero

    var body: some View {
        ZStack {
            Text("Hello Hello")
                .background(
                    GeometryReader { geometry in
                        Color.clear
                            .preference(
                                key: SizePreferenceKey.self,
                                value: geometry.size
                            )
                    }
                )

            Color.blue.frame(width: childSize.width, height: childSize.height)
        }.backgroundPreferenceValue(SizePreferenceKey.self) { bounds in
            Rectangle()
                .stroke(Color.blue)
                .frame(width: bounds.width, height: bounds.height)
        }
    }
}
```

***

### 5. `.overlayPreferenceValue(_:_:)`

**使用 preference 值创建覆盖视图**

```swift
func overlayPreferenceValue<Key, T>(
    _ key: Key.Type,
    @ViewBuilder _ transform: @escaping (Key.Value) -> T
) -> some View where Key: PreferenceKey, T: View
```

*   类似 `backgroundPreferenceValue`，但创建的是覆盖层
*   用于在内容上方添加视图

**示例：**

```swift
content
    .overlayPreferenceValue(PointPreferenceKey.self) { point in
        Circle()
            .fill(Color.red)
            .frame(width: 10, height: 10)
            .position(point)
    }
```

***

## 使用场景

### 1. 获取子视图尺寸

```swift
// 定义 PreferenceKey
struct SizePreferenceKey: PreferenceKey {
    static var defaultValue: CGSize = .zero
    
    static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
        value = nextValue()
    }
}

// 使用
struct ContentView: View {
    @State private var childSize: CGSize = .zero
    
    var body: some View {
        VStack {
            Text("Hello, World!")
                .padding()
                .background(
                    GeometryReader { geometry in
                        Color.clear
                            .preference(key: SizePreferenceKey.self, 
                                      value: geometry.size)
                    }
                )
        }
        .onPreferenceChange(SizePreferenceKey.self) { size in
            childSize = size
        }
    }
}
```

***

### 2. 收集多个子视图的数据

```swift
// 定义 PreferenceKey（数组类型）
struct ViewBoundsPreferenceKey: PreferenceKey {
    static var defaultValue: [CGRect] = []
    
    static func reduce(value: inout [CGRect], nextValue: () -> [CGRect]) {
        value.append(contentsOf: nextValue())
    }
}

// 使用
struct MultiChildView: View {
    @State private var childBounds: [CGRect] = []
    
    var body: some View {
        VStack {
            ForEach(0..<5) { index in
                Text("Item \(index)")
                    .background(
                        GeometryReader { geometry in
                            Color.clear
                                .preference(
                                    key: ViewBoundsPreferenceKey.self,
                                    value: [geometry.frame(in: .global)]
                                )
                        }
                    )
            }
        }
        .onPreferenceChange(ViewBoundsPreferenceKey.self) { bounds in
            childBounds = bounds
        }
    }
}
```

***

### 3. 锚点（Anchor）传递

```swift
// 定义锚点 PreferenceKey
struct AnchorPreferenceKey: PreferenceKey {
    static var defaultValue: Anchor<CGRect>?
    
    static func reduce(value: inout Anchor<CGRect>?, 
                      nextValue: () -> Anchor<CGRect>?) {
        value = value ?? nextValue()
    }
}

// 使用
struct AnchorView: View {
    var body: some View {
        VStack {
            Text("Target")
                .anchorPreference(
                    key: AnchorPreferenceKey.self,
                    value: .bounds
                ) { $0 }
        }
        .overlayPreferenceValue(AnchorPreferenceKey.self) { anchor in
            GeometryReader { geometry in
                if let anchor = anchor {
                    let rect = geometry[anchor]
                    Rectangle()
                        .stroke(Color.red, lineWidth: 2)
                        .frame(width: rect.width, height: rect.height)
                        .position(x: rect.midX, y: rect.midY)
                }
            }
        }
    }
}
```

***

## 完整示例

### 示例 1：自适应标签云

```swift
// PreferenceKey 定义
struct TagSizePreferenceKey: PreferenceKey {
    typealias Value = [Int: CGSize]
    
    static var defaultValue: [Int: CGSize] = [:]
    
    static func reduce(value: inout [Int: CGSize], 
                      nextValue: () -> [Int: CGSize]) {
        value.merge(nextValue()) { $1 }
    }
}

// 标签视图
struct TagView: View {
    let id: Int
    let text: String
    
    var body: some View {
        Text(text)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.blue.opacity(0.2))
            .cornerRadius(16)
            .background(
                GeometryReader { geometry in
                    Color.clear
                        .preference(
                            key: TagSizePreferenceKey.self,
                            value: [id: geometry.size]
                        )
                }
            )
    }
}

// 标签云视图
struct TagCloudView: View {
    let tags = ["Swift", "SwiftUI", "iOS", "Xcode", "Apple"]
    @State private var tagSizes: [Int: CGSize] = [:]
    
    var body: some View {
        VStack {
            flowLayout
        }
        .onPreferenceChange(TagSizePreferenceKey.self) { sizes in
            tagSizes = sizes
        }
    }
    
    var flowLayout: some View {
        // 根据 tagSizes 实现流式布局
        // ...
        EmptyView()
    }
}
```

***

### 示例 2：滚动偏移追踪

```swift
// PreferenceKey 定义
struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

// 滚动视图
struct ScrollTrackingView: View {
    @State private var scrollOffset: CGFloat = 0
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ForEach(0..<50) { index in
                    Text("Item \(index)")
                        .frame(height: 50)
                }
            }
            .background(
                GeometryReader { geometry in
                    Color.clear
                        .preference(
                            key: ScrollOffsetPreferenceKey.self,
                            value: geometry.frame(in: .named("scroll")).minY
                        )
                }
            )
        }
        .coordinateSpace(name: "scroll")
        .onPreferenceChange(ScrollOffsetPreferenceKey.self) { offset in
            scrollOffset = offset
        }
        .overlay(
            Text("Offset: \(scrollOffset, specifier: "%.1f")")
                .padding()
                .background(Color.white.opacity(0.8))
                .cornerRadius(8),
            alignment: .top
        )
    }
}
```

***

### 示例 3：视图间连线

```swift
// PreferenceKey 定义
struct ViewPositionPreferenceKey: PreferenceKey {
    typealias Value = [String: CGPoint]
    
    static var defaultValue: [String: CGPoint] = [:]
    
    static func reduce(value: inout [String: CGPoint], 
                      nextValue: () -> [String: CGPoint]) {
        value.merge(nextValue()) { $1 }
    }
}

// 连线视图
struct ConnectedNodesView: View {
    @State private var positions: [String: CGPoint] = [:]
    
    var body: some View {
        ZStack {
            // 节点
            VStack(spacing: 100) {
                NodeView(id: "node1", label: "Node 1")
                NodeView(id: "node2", label: "Node 2")
            }
            
            // 连线
            if let pos1 = positions["node1"],
               let pos2 = positions["node2"] {
                Path { path in
                    path.move(to: pos1)
                    path.addLine(to: pos2)
                }
                .stroke(Color.blue, lineWidth: 2)
            }
        }
        .onPreferenceChange(ViewPositionPreferenceKey.self) { positions in
            self.positions = positions
        }
    }
}

struct NodeView: View {
    let id: String
    let label: String
    
    var body: some View {
        Text(label)
            .padding()
            .background(Color.green.opacity(0.3))
            .cornerRadius(8)
            .background(
                GeometryReader { geometry in
                    Color.clear
                        .preference(
                            key: ViewPositionPreferenceKey.self,
                            value: [id: CGPoint(
                                x: geometry.frame(in: .global).midX,
                                y: geometry.frame(in: .global).midY
                            )]
                        )
                }
            )
    }
}
```

***

## 高级用法

### 1. 泛型 PreferenceKey

```swift
struct GenericPreferenceKey<T>: PreferenceKey {
    static var defaultValue: T? { nil }
    
    static func reduce(value: inout T?, nextValue: () -> T?) {
        value = value ?? nextValue()
    }
}
```

***

### 2. 组合多个 PreferenceKey

```swift
struct CombinedPreferenceKey: PreferenceKey {
    struct Value {
        var size: CGSize = .zero
        var position: CGPoint = .zero
    }
    
    static var defaultValue: Value = Value()
    
    static func reduce(value: inout Value, nextValue: () -> Value) {
        let next = nextValue()
        value.size = next.size
        value.position = next.position
    }
}
```

***

### 3. 条件性 Preference

```swift
struct ConditionalPreferenceKey: PreferenceKey {
    static var defaultValue: CGSize?
    
    static func reduce(value: inout CGSize?, nextValue: () -> CGSize?) {
        // 只保留大于某个阈值的尺寸
        let next = nextValue()
        if let next = next, next.width > 100 {
            value = next
        }
    }
}
```

***

## 最佳实践

### 1. 命名规范

*   使用描述性名称：`SizePreferenceKey` 而不是 `MyKey`
*   遵循驼峰命名：`ViewBoundsPreferenceKey`
*   添加 `PreferenceKey` 后缀以便识别

***

### 2. 性能优化

**避免频繁更新：**

```swift
// ❌ 不好：每帧都更新
.preference(key: SizeKey.self, value: continuouslyChangingValue)

// ✅ 好：只在必要时更新
.preference(key: SizeKey.self, value: stableValue)
```

**使用 Equatable：**

```swift
struct OptimizedPreferenceKey: PreferenceKey {
    struct Value: Equatable {
        var size: CGSize
        var color: Color
    }
    
    static var defaultValue: Value = Value(size: .zero, color: .clear)
    
    static func reduce(value: inout Value, nextValue: () -> Value) {
        value = nextValue()
    }
}
```

***

### 3. 调试技巧

**添加日志：**

```swift
static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
    let next = nextValue()
    print("Reducing: \(value) -> \(next)")
    value = next
}
```

**可视化 Preference 流：**

```swift
.onPreferenceChange(SizePreferenceKey.self) { size in
    print("📏 Size changed: \(size)")
    // 处理尺寸变化
}
```

***

### 4. 常见陷阱

**陷阱 1：忘记实现 reduce**

```swift
// ❌ 只取最后一个值
static func reduce(value: inout [CGSize], nextValue: () -> [CGSize]) {
    value = nextValue()
}

// ✅ 正确合并所有值
static func reduce(value: inout [CGSize], nextValue: () -> [CGSize]) {
    value.append(contentsOf: nextValue())
}
```

**陷阱 2：过度使用 PreferenceKey**

```swift
// ❌ 简单情况不需要 PreferenceKey
// 可以直接使用 @Binding 或回调

// ✅ 复杂的跨层级数据传递才用 PreferenceKey
```

***

## 总结

### PreferenceKey 的优势

✅ 实现子视图到父视图的数据传递\
✅ 不破坏视图的封装性\
✅ 可以聚合多个子视图的数据\
✅ 支持复杂的数据流场景

### 何时使用 PreferenceKey

*   需要获取子视图的布局信息（尺寸、位置）
*   收集多个子视图的数据
*   实现自定义布局容器
*   创建视图间的连接关系

### 何时不使用 PreferenceKey

*   简单的父子通信（用 `@Binding`）
*   全局状态管理（用 `@EnvironmentObject`）
*   单向数据流已足够的场景

***

## 参考资源

*   [Apple 官方文档 - PreferenceKey](https://developer.apple.com/documentation/swiftui/preferencekey)
*   [WWDC 2019 - Building Custom Views with SwiftUI](https://developer.apple.com/videos/play/wwdc2019/237/)
*   [SwiftUI Lab - The Art of Preferences](https://swiftui-lab.com/communicating-with-the-view-tree-part-1/)

***

*最后更新时间：2026-01-22*
