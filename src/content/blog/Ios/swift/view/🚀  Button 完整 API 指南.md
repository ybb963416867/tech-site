---
title: "Button 完整 API 指南"
description: "1. [基础 Button 构造器](基础button构造器) 2. [Button 样式](button样式) 3. [Button 修饰符](button修饰符) 4. [Button 状态和交互](button状态和交互) 5...."
pubDate: 2026-05-29
category: "view"
tags: [Mac, iOS, Environment, Swift, API]
draft: false
---
# 🚀  Button 完整 API 指南

## 目录

1.  [基础 Button 构造器](#基础-button-构造器)
2.  [Button 样式](#button-样式)
3.  [Button 修饰符](#button-修饰符)
4.  [Button 状态和交互](#button-状态和交互)
5.  [自定义 Button 样式](#自定义-button-样式)
6.  [特殊用途 Button](#特殊用途-button)
7.  [实用示例组合](#实用示例组合)

***

## 基础 Button 构造器

### 1. `Button(action:label:)`

最基础的 Button 构造器。

```swift
// 基本文本按钮
Button(action: {
    print("按钮被点击")
}) {
    Text("点击我")
}

// 带图标的按钮
Button(action: {
    print("删除操作")
}) {
    Label("删除", systemImage: "trash")
}

// 自定义视图作为按钮
Button(action: {
    print("自定义按钮")
}) {
    HStack {
        Image(systemName: "heart.fill")
        Text("喜欢")
    }
    .padding()
    .background(Color.red)
    .foregroundColor(.white)
    .cornerRadius(8)
}
```

### 2. `Button(_:action:)`

简化的文本按钮构造器。

```swift
Button("简单按钮") {
    print("简单按钮点击")
}

Button("带参数的按钮") {
    performAction(with: "参数")
}

func performAction(with parameter: String) {
    print("执行操作：\(parameter)")
}
```

### 3. `Button(role:action:label:)`

带角色的按钮（iOS 15+）。

```swift
// 危险操作按钮
Button(role: .destructive, action: {
    deleteItem()
}) {
    Text("删除")
}

// 取消按钮
Button(role: .cancel, action: {
    dismissView()
}) {
    Text("取消")
}

func deleteItem() {
    print("删除项目")
}

func dismissView() {
    print("关闭视图")
}
```

***

## Button 样式

### 1. `.buttonStyle()` 修饰符

#### `.automatic` (默认样式)

```swift
Button("自动样式") {
    print("自动样式按钮")
}
.buttonStyle(.automatic)
```

#### `.plain` 简约样式

```swift
Button("简约样式") {
    print("简约样式按钮")
}
.buttonStyle(.plain)
```

#### `.bordered` 边框样式 (iOS 15+)

```swift
Button("边框样式") {
    print("边框样式按钮")
}
.buttonStyle(.bordered)
```

#### `.borderedProminent` 突出边框样式 (iOS 15+)

```swift
Button("突出样式") {
    print("突出样式按钮")
}
.buttonStyle(.borderedProminent)
```

#### `.borderless` 无边框样式

```swift
Button("无边框样式") {
    print("无边框样式按钮")
}
.buttonStyle(.borderless)
```

### 2. 样式组合示例

```swift
VStack(spacing: 20) {
    Button("自动样式") { }
        .buttonStyle(.automatic)
    
    Button("简约样式") { }
        .buttonStyle(.plain)
    
    Button("边框样式") { }
        .buttonStyle(.bordered)
    
    Button("突出样式") { }
        .buttonStyle(.borderedProminent)
    
    Button("无边框样式") { }
        .buttonStyle(.borderless)
}
.padding()
```

***

## Button 修饰符

### 1. 尺寸控制

#### `.controlSize()`

```swift
VStack(spacing: 10) {
    Button("迷你尺寸") { }
        .buttonStyle(.bordered)
        .controlSize(.mini)
    
    Button("小尺寸") { }
        .buttonStyle(.bordered)
        .controlSize(.small)
    
    Button("常规尺寸") { }
        .buttonStyle(.bordered)
        .controlSize(.regular)
    
    Button("大尺寸") { }
        .buttonStyle(.bordered)
        .controlSize(.large)
}
```

#### `.frame()` 自定义尺寸

```swift
Button("自定义尺寸") {
    print("自定义尺寸按钮")
}
.frame(width: 200, height: 50)
.background(Color.blue)
.foregroundColor(.white)
.cornerRadius(25)
```

### 2. 外观修饰

#### 颜色相关

```swift
VStack(spacing: 15) {
    // 前景色
    Button("红色文字") { }
        .foregroundColor(.red)
    
    // 背景色
    Button("蓝色背景") { }
        .background(Color.blue)
        .foregroundColor(.white)
    
    // 色调（影响按钮样式的主色调）
    Button("绿色色调") { }
        .buttonStyle(.borderedProminent)
        .tint(.green)
    
    // 渐变背景
    Button("渐变背景") { }
        .background(
            LinearGradient(
                colors: [.purple, .pink],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .foregroundColor(.white)
        .cornerRadius(8)
}
```

#### 形状和边框

```swift
VStack(spacing: 15) {
    // 圆角
    Button("圆角按钮") { }
        .padding()
        .background(Color.orange)
        .foregroundColor(.white)
        .cornerRadius(10)
    
    // 胶囊形状
    Button("胶囊按钮") { }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .background(Color.green)
        .foregroundColor(.white)
        .clipShape(Capsule())
    
    // 圆形按钮
    Button("⭐") { }
        .font(.title)
        .frame(width: 50, height: 50)
        .background(Color.yellow)
        .clipShape(Circle())
    
    // 自定义边框
    Button("边框按钮") { }
        .padding()
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.blue, lineWidth: 2)
        )
}
```

#### 阴影和效果

```swift
VStack(spacing: 20) {
    // 阴影
    Button("阴影按钮") { }
        .padding()
        .background(Color.blue)
        .foregroundColor(.white)
        .cornerRadius(8)
        .shadow(color: .blue.opacity(0.3), radius: 5, x: 0, y: 3)
    
    // 发光效果
    Button("发光按钮") { }
        .padding()
        .background(Color.purple)
        .foregroundColor(.white)
        .cornerRadius(8)
        .shadow(color: .purple, radius: 10, x: 0, y: 0)
    
    // 3D 效果
    Button("3D 按钮") { }
        .padding()
        .background(Color.red)
        .foregroundColor(.white)
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.2), radius: 2, x: 2, y: 2)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(
                    LinearGradient(
                        colors: [.white.opacity(0.3), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    lineWidth: 1
                )
        )
}
```

### 3. 字体和文本

```swift
VStack(spacing: 15) {
    Button("大标题字体") { }
        .font(.largeTitle)
        .fontWeight(.bold)
    
    Button("自定义字体") { }
        .font(.custom("Helvetica", size: 18))
        .fontWeight(.medium)
    
    Button("多行按钮文本\n第二行") { }
        .multilineTextAlignment(.center)
        .padding()
        .background(Color.gray.opacity(0.2))
        .cornerRadius(8)
}
```

***

## Button 状态和交互

### 1. 禁用状态

```swift
struct DisabledButtonExample: View {
    @State private var isEnabled = true
    
    var body: some View {
        VStack(spacing: 20) {
            Button("切换状态") {
                isEnabled.toggle()
            }
            .buttonStyle(.borderedProminent)
            
            Button("可能被禁用的按钮") {
                print("按钮被点击")
            }
            .disabled(!isEnabled)
            .buttonStyle(.bordered)
            
            // 自定义禁用样式
            Button("自定义禁用样式") {
                print("自定义按钮点击")
            }
            .padding()
            .background(isEnabled ? Color.blue : Color.gray)
            .foregroundColor(.white)
            .cornerRadius(8)
            .disabled(!isEnabled)
        }
    }
}
```

### 2. 按钮状态检测

```swift
struct ButtonStateExample: View {
    var body: some View {
        Button(action: {
            print("按钮点击")
        }) {
            Text("状态感知按钮")
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
        .scaleEffect(1.0) // 可以在这里添加状态相关的修饰符
        .onLongPressGesture {
            print("长按检测")
        }
    }
}
```

### 3. 异步操作按钮

```swift
struct AsyncButtonExample: View {
    @State private var isLoading = false
    
    var body: some View {
        Button(action: {
            performAsyncOperation()
        }) {
            HStack {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                }
                Text(isLoading ? "处理中..." : "开始操作")
            }
        }
        .disabled(isLoading)
        .buttonStyle(.borderedProminent)
    }
    
    func performAsyncOperation() {
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
            print("异步操作完成")
        }
    }
}
```

***

## 自定义 Button 样式

### 1. 创建自定义 ButtonStyle

```swift
struct CustomButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(configuration.isPressed ? Color.blue.opacity(0.7) : Color.blue)
            )
            .foregroundColor(.white)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// 使用自定义样式
Button("自定义样式") {
    print("自定义样式按钮")
}
.buttonStyle(CustomButtonStyle())
```

### 2. 渐变按钮样式

```swift
struct GradientButtonStyle: ButtonStyle {
    let startColor: Color
    let endColor: Color
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .background(
                LinearGradient(
                    colors: [startColor, endColor],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// 使用渐变样式
VStack(spacing: 15) {
    Button("橙红渐变") { }
        .buttonStyle(GradientButtonStyle(startColor: .orange, endColor: .red))
    
    Button("蓝紫渐变") { }
        .buttonStyle(GradientButtonStyle(startColor: .blue, endColor: .purple))
}
```

### 3. 霓虹灯效果按钮

```swift
struct NeonButtonStyle: ButtonStyle {
    let color: Color
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.black)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(color, lineWidth: 2)
                    )
            )
            .foregroundColor(color)
            .shadow(color: color, radius: configuration.isPressed ? 5 : 10)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// 使用霓虹灯样式
Button("霓虹灯按钮") { }
    .buttonStyle(NeonButtonStyle(color: .cyan))
    .background(Color.black)
```

***

## 特殊用途 Button

### 1. 图标按钮

```swift
VStack(spacing: 20) {
    // 纯图标按钮
    Button(action: {
        print("设置")
    }) {
        Image(systemName: "gear")
            .font(.title2)
    }
    
    // 图标 + 文字按钮
    Button(action: {
        print("收藏")
    }) {
        Label("收藏", systemImage: "heart")
    }
    .buttonStyle(.bordered)
    
    // 自定义图标按钮
    Button(action: {
        print("分享")
    }) {
        Image(systemName: "square.and.arrow.up")
            .font(.title2)
            .foregroundColor(.white)
            .frame(width: 44, height: 44)
            .background(Color.blue)
            .clipShape(Circle())
    }
}
```

### 2. 切换按钮

```swift
struct ToggleButtonExample: View {
    @State private var isSelected = false
    
    var body: some View {
        Button(action: {
            isSelected.toggle()
        }) {
            HStack {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                Text(isSelected ? "已选择" : "未选择")
            }
        }
        .foregroundColor(isSelected ? .green : .gray)
        .buttonStyle(.plain)
    }
}
```

### 3. 计数器按钮

```swift
struct CounterButtonExample: View {
    @State private var count = 0
    
    var body: some View {
        HStack(spacing: 20) {
            Button(action: {
                if count > 0 {
                    count -= 1
                }
            }) {
                Image(systemName: "minus.circle.fill")
                    .font(.title2)
                    .foregroundColor(count > 0 ? .red : .gray)
            }
            .disabled(count <= 0)
            
            Text("\(count)")
                .font(.title)
                .frame(minWidth: 50)
            
            Button(action: {
                count += 1
            }) {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundColor(.green)
            }
        }
    }
}
```

### 4. 浮动操作按钮 (FAB)

```swift
struct FloatingActionButtonExample: View {
    var body: some View {
        ZStack {
            // 主要内容
            ScrollView {
                ForEach(0..<50) { index in
                    Text("项目 \(index)")
                        .padding()
                }
            }
            
            // 浮动按钮
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button(action: {
                        print("添加新项目")
                    }) {
                        Image(systemName: "plus")
                            .font(.title2)
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(Color.blue)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                    }
                    .padding()
                }
            }
        }
    }
}
```

***

## 实用示例组合

### 1. 完整的按钮组合界面

```swift
struct ButtonShowcaseView: View {
    @State private var showAlert = false
    @State private var isLoading = false
    @State private var selectedOption = 0
    
    var body: some View {
        ScrollView {
            VStack(spacing: 30) {
                // 标题
                Text("Button 样式展示")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                // 基础样式组
                VStack(alignment: .leading, spacing: 15) {
                    Text("基础样式")
                        .font(.headline)
                    
                    HStack(spacing: 15) {
                        Button("边框") { }
                            .buttonStyle(.bordered)
                        
                        Button("突出") { }
                            .buttonStyle(.borderedProminent)
                        
                        Button("简约") { }
                            .buttonStyle(.plain)
                    }
                }
                
                Divider()
                
                // 尺寸组
                VStack(alignment: .leading, spacing: 15) {
                    Text("不同尺寸")
                        .font(.headline)
                    
                    VStack(spacing: 10) {
                        Button("迷你尺寸") { }
                            .buttonStyle(.bordered)
                            .controlSize(.mini)
                        
                        Button("小尺寸") { }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        
                        Button("常规尺寸") { }
                            .buttonStyle(.bordered)
                            .controlSize(.regular)
                        
                        Button("大尺寸") { }
                            .buttonStyle(.bordered)
                            .controlSize(.large)
                    }
                }
                
                Divider()
                
                // 特殊效果组
                VStack(alignment: .leading, spacing: 15) {
                    Text("特殊效果")
                        .font(.headline)
                    
                    VStack(spacing: 15) {
                        // 渐变按钮
                        Button("渐变按钮") { }
                            .buttonStyle(GradientButtonStyle(startColor: .purple, endColor: .pink))
                        
                        // 阴影按钮
                        Button("阴影效果") {
                            showAlert = true
                        }
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .shadow(color: .orange.opacity(0.4), radius: 8, x: 0, y: 4)
                        
                        // 异步按钮
                        Button(action: {
                            performAsyncAction()
                        }) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                }
                                Text(isLoading ? "处理中..." : "异步操作")
                            }
                        }
                        .disabled(isLoading)
                        .buttonStyle(.borderedProminent)
                        .tint(.green)
                    }
                }
                
                Divider()
                
                // 功能按钮组
                VStack(alignment: .leading, spacing: 15) {
                    Text("功能按钮")
                        .font(.headline)
                    
                    HStack(spacing: 15) {
                        // 分享按钮
                        Button(action: {}) {
                            Image(systemName: "square.and.arrow.up")
                        }
                        .buttonStyle(.bordered)
                        
                        // 收藏按钮
                        Button(action: {}) {
                            Label("收藏", systemImage: "heart")
                        }
                        .buttonStyle(.bordered)
                        .tint(.red)
                        
                        // 设置按钮
                        Button(action: {}) {
                            Image(systemName: "gear")
                        }
                        .buttonStyle(.bordered)
                    }
                }
                
                Divider()
                
                // 选择器样式按钮
                VStack(alignment: .leading, spacing: 15) {
                    Text("选择器按钮")
                        .font(.headline)
                    
                    HStack {
                        ForEach(0..<3) { option in
                            Button("选项 \(option + 1)") {
                                selectedOption = option
                            }
                            .buttonStyle(.bordered)
                            .tint(selectedOption == option ? .blue : .gray)
                        }
                    }
                }
            }
            .padding()
        }
        .alert("提示", isPresented: $showAlert) {
            Button("确定") { }
        } message: {
            Text("按钮被点击了！")
        }
    }
    
    func performAsyncAction() {
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
        }
    }
}
```

### 2. 自适应按钮布局

```swift
struct AdaptiveButtonLayout: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.dynamicTypeSize) var dynamicTypeSize
    
    var body: some View {
        VStack(spacing: 20) {
            Text("自适应按钮布局")
                .font(.title)
            
            if horizontalSizeClass == .compact {
                // 紧凑布局（iPhone 竖屏）
                VStack(spacing: 15) {
                    Button("主要操作") { }
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity)
                        .controlSize(dynamicTypeSize.isAccessibilitySize ? .large : .regular)
                    
                    HStack(spacing: 15) {
                        Button("取消") { }
                            .buttonStyle(.bordered)
                            .frame(maxWidth: .infinity)
                        
                        Button("确认") { }
                            .buttonStyle(.bordered)
                            .frame(maxWidth: .infinity)
                    }
                }
            } else {
                // 宽松布局（iPad 或 iPhone 横屏）
                HStack(spacing: 20) {
                    Button("取消") { }
                        .buttonStyle(.bordered)
                    
                    Spacer()
                    
                    Button("主要操作") { }
                        .buttonStyle(.borderedProminent)
                    
                    Button("确认") { }
                        .buttonStyle(.bordered)
                }
            }
        }
        .padding()
    }
}
```

***

## 总结

SwiftUI Button 的主要 API 包括：

### 构造器

*   `Button(action:label:)` - 基础构造器
*   `Button(_:action:)` - 简化文本构造器
*   `Button(role:action:label:)` - 带角色的构造器

### 样式系统

*   `.buttonStyle()` - 应用预定义或自定义样式
*   预定义样式：`.automatic`、`.plain`、`.bordered`、`.borderedProminent`、`.borderless`

### 修饰符

*   `.controlSize()` - 控制尺寸
*   `.tint()` - 设置色调
*   `.disabled()` - 禁用状态
*   通用修饰符：`.foregroundColor()`、`.background()`、`.frame()` 等

### 自定义能力

*   `ButtonStyle` 协议 - 创建完全自定义的按钮样式
*   丰富的视觉效果支持
*   状态感知和动画支持

这些 API 提供了从简单到复杂的各种按钮需求解决方案，可以创建出符合 iOS 设计规范且用户体验良好的按钮界面。
