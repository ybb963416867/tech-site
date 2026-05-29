---
title: "SwiftUI Button 完整指南"
description: "SwiftUI 的 Button 组件提供了丰富的自定义选项和交互能力。通过合理使用各种修饰符和样式，可以创建出功能强大且用户体验良好的按钮组件。记住始终考虑无障碍性、性能和平台特定的设计准则。"
pubDate: 2026-05-29
category: "view"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀 SwiftUI Button 完整指南

## 概述
SwiftUI 中的 `Button` 是用户界面中最常用的交互组件之一，用于触发动作和响应用户点击。

## 基本语法

### 1. 基础按钮创建

```swift
// 最简单的按钮
Button("点击我") {
    print("按钮被点击了")
}

// 使用闭包创建自定义标签
Button(action: {
    print("执行动作")
}) {
    Text("自定义按钮")
}
```

### 2. 按钮初始化器

```swift
// 主要初始化器
init(_ title: String, action: @escaping () -> Void)
init(action: @escaping () -> Void, @ViewBuilder label: () -> Label)
init(_ titleKey: LocalizedStringKey, action: @escaping () -> Void)

// 角色特定初始化器
init(_ titleKey: LocalizedStringKey, role: ButtonRole?, action: @escaping () -> Void)
init(_ title: String, role: ButtonRole?, action: @escaping () -> Void)
init(role: ButtonRole?, action: @escaping () -> Void, @ViewBuilder label: () -> Label)
```

## Button 角色 (ButtonRole)

```swift
enum ButtonRole {
    case destructive  // 破坏性操作（如删除）
    case cancel      // 取消操作
}

// 使用示例
Button("删除", role: .destructive) {
    deleteItem()
}

Button("取消", role: .cancel) {
    dismissView()
}
```

## 样式修饰符

### 1. 基础样式

```swift
Button("按钮") { }
    .foregroundColor(.blue)           // 前景色
    .background(Color.gray)           // 背景色
    .font(.title)                     // 字体
    .padding()                        // 内边距
    .border(Color.black)              // 边框
    .cornerRadius(8)                  // 圆角
```

### 2. 按钮样式 (ButtonStyle)

```swift
// 内置按钮样式
.buttonStyle(.automatic)      // 自动样式
.buttonStyle(.plain)          // 朴素样式
.buttonStyle(.bordered)       // 边框样式
.buttonStyle(.borderedProminent) // 突出边框样式

// macOS 特有
.buttonStyle(.link)           // 链接样式

// iOS 特有
.buttonStyle(.borderless)     // 无边框样式
```

### 3. 自定义按钮样式

```swift
struct CustomButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .background(configuration.isPressed ? Color.gray : Color.blue)
            .foregroundColor(.white)
            .clipShape(Capsule())
            .scaleEffect(configuration.isPressed ? 1.2 : 1.0)
    }
}

// 使用
Button("自定义样式") { }
    .buttonStyle(CustomButtonStyle())
```

## 状态和交互

### 1. 禁用状态

```swift
@State private var isDisabled = false

Button("按钮") { }
    .disabled(isDisabled)
```

### 2. 按钮配置

```swift
// ButtonStyle 配置参数
struct ButtonConfiguration {
    let label: ButtonStyleConfiguration.Label
    let isPressed: Bool
    let role: ButtonRole?
}
```

## 复杂按钮内容

### 1. 图标按钮

```swift
Button(action: {}) {
    Image(systemName: "heart.fill")
        .foregroundColor(.red)
}

// 图标 + 文字
Button(action: {}) {
    HStack {
        Image(systemName: "star.fill")
        Text("收藏")
    }
}
```

### 2. 多行内容

```swift
Button(action: {}) {
    VStack {
        Image(systemName: "cloud.upload")
            .font(.largeTitle)
        Text("上传文件")
            .font(.caption)
    }
    .padding()
}
```

## 高级用法

### 1. 异步操作

```swift
Button("异步操作") {
    Task {
        await performAsyncOperation()
    }
}
```

### 2. 条件按钮

```swift
@State private var showAlert = false

Button("显示警告") {
    showAlert.toggle()
}
.alert("警告", isPresented: $showAlert) {
    Button("确定") { }
}
```

### 3. 导航按钮

```swift
NavigationView {
    VStack {
        NavigationLink(destination: DetailView()) {
            Text("跳转到详情页")
        }
        .buttonStyle(.bordered)
    }
}
```

## 辅助功能

### 1. 无障碍支持

```swift
Button("按钮") { }
    .accessibilityLabel("这是一个操作按钮")
    .accessibilityHint("点击执行特定操作")
    .accessibilityValue("当前状态")
```

### 2. 键盘快捷键

```swift
Button("保存") {
    save()
}
.keyboardShortcut(.defaultAction)  // Enter 键
.keyboardShortcut("s", modifiers: .command)  // Cmd+S
```

## 动画效果

### 1. 基础动画

```swift
@State private var isPressed = false

Button("动画按钮") {
    withAnimation(.easeInOut(duration: 0.2)) {
        isPressed.toggle()
    }
}
.scaleEffect(isPressed ? 1.2 : 1.0)
```

### 2. 复杂动画

```swift
struct AnimatedButton: View {
    @State private var isPressed = false
    
    var body: some View {
        Button("按我") {
            withAnimation(.spring()) {
                isPressed.toggle()
            }
        }
        .foregroundColor(.white)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(isPressed ? Color.green : Color.blue)
                .shadow(radius: isPressed ? 0 : 5)
        )
        .scaleEffect(isPressed ? 0.95 : 1.0)
    }
}
```

## 平台特定功能

### 1. iOS 特有

```swift
Button("iOS 按钮") { }
    .controlSize(.large)              // 控件大小
    .tint(.blue)                      // iOS 15+ 色调
```

### 2. macOS 特有

```swift
Button("macOS 按钮") { }
    .controlSize(.large)
    .keyboardShortcut(.cancelAction)  // Escape 键
```

## 最佳实践

### 1. 性能优化

```swift
// 避免在按钮动作中进行重计算
Button("优化按钮") {
    // 使用预计算的值
    performOptimizedAction()
}
```

### 2. 状态管理

```swift
@StateObject private var viewModel = ButtonViewModel()

Button("状态管理") {
    viewModel.handleButtonTap()
}
.disabled(viewModel.isLoading)
```

### 3. 错误处理

```swift
@State private var errorMessage: String?

Button("可能失败的操作") {
    do {
        try performRiskyOperation()
    } catch {
        errorMessage = error.localizedDescription
    }
}
.alert("错误", isPresented: .constant(errorMessage != nil)) {
    Button("确定") { errorMessage = nil }
} message: {
    Text(errorMessage ?? "")
}
```

## 常用组合模式

### 1. 确认对话框

```swift
@State private var showingConfirmation = false

Button("删除", role: .destructive) {
    showingConfirmation = true
}
.confirmationDialog("确认删除", isPresented: $showingConfirmation) {
    Button("删除", role: .destructive) {
        deleteItem()
    }
    Button("取消", role: .cancel) { }
}
```

### 2. 加载状态

```swift
@State private var isLoading = false

Button(action: {
    isLoading = true
    performLongOperation {
        isLoading = false
    }
}) {
    if isLoading {
        ProgressView()
            .scaleEffect(0.8)
    } else {
        Text("开始操作")
    }
}
.disabled(isLoading)
```

## 总结

SwiftUI 的 Button 组件提供了丰富的自定义选项和交互能力。通过合理使用各种修饰符和样式，可以创建出功能强大且用户体验良好的按钮组件。记住始终考虑无障碍性、性能和平台特定的设计准则。