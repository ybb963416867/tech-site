---
title: "Shape 完整 API 指南"
description: ""
pubDate: 2026-05-29
category: "view"
tags: [Swift, Array, API]
draft: false
---
# 🚀   Shape 完整 API 指南

## 目录
1. [Shape 协议概述](#shape-协议概述)
2. [内置形状](#内置形状)
3. [Shape 修饰符](#shape-修饰符)
4. [自定义形状](#自定义形状)
5. [路径操作](#路径操作)
6. [动画和过渡](#动画和过渡)
7. [实用示例组合](#实用示例组合)

---

## Shape 协议概述

### Shape 协议定义
```swift
protocol Shape: Animatable, View {
    func path(in rect: CGRect) -> Path
}
```

Shape 是 SwiftUI 中用于创建几何图形的协议。所有形状都必须实现 `path(in:)` 方法来定义其几何路径。

### 基本使用模式
```swift
// 基本形状创建
Rectangle()
    .fill(Color.blue)
    .frame(width: 100, height: 100)

// 形状作为遮罩
Text("Hello")
    .font(.title)
    .foregroundColor(.white)
    .background(
        Rectangle()
            .fill(Color.blue)
    )

// 形状作为边框
Circle()
    .stroke(Color.red, lineWidth: 2)
    .frame(width: 50, height: 50)
```

---

## 内置形状

### 1. Rectangle (矩形)

```swift
struct RectangleExamples: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基本矩形
            Rectangle()
                .fill(Color.blue)
                .frame(width: 100, height: 60)
            
            // 带边框的矩形
            Rectangle()
                .stroke(Color.red, lineWidth: 3)
                .frame(width: 100, height: 60)
            
            // 填充和边框组合
            Rectangle()
                .fill(Color.yellow)
                .overlay(
                    Rectangle()
                        .stroke(Color.orange, lineWidth: 2)
                )
                .frame(width: 100, height: 60)
            
            // 渐变填充
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [.purple, .pink],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 100, height: 60)
        }
    }
}
```

### 2. RoundedRectangle (圆角矩形)

```swift
struct RoundedRectangleExamples: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基本圆角矩形
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.green)
                .frame(width: 120, height: 80)
            
            // 不同圆角大小
            RoundedRectangle(cornerRadius: 25)
                .fill(Color.orange)
                .frame(width: 120, height: 80)
            
            // 指定圆角样式
            RoundedRectangle(cornerRadius: 15, style: .continuous)
                .fill(Color.purple)
                .frame(width: 120, height: 80)
            
            RoundedRectangle(cornerRadius: 15, style: .circular)
                .fill(Color.cyan)
                .frame(width: 120, height: 80)
            
            // 边框样式
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.blue, lineWidth: 4)
                .frame(width: 120, height: 80)
        }
    }
}
```

### 3. Circle (圆形)

```swift
struct CircleExamples: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基本圆形
            Circle()
                .fill(Color.red)
                .frame(width: 80, height: 80)
            
            // 圆形边框
            Circle()
                .stroke(Color.blue, lineWidth: 5)
                .frame(width: 80, height: 80)
            
            // 虚线圆形
            Circle()
                .stroke(Color.green, style: StrokeStyle(lineWidth: 3, dash: [5, 3]))
                .frame(width: 80, height: 80)
            
            // 半圆效果
            Circle()
                .trim(from: 0, to: 0.5)
                .stroke(Color.purple, lineWidth: 6)
                .frame(width: 80, height: 80)
            
            // 进度圆环
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                
                Circle()
                    .trim(from: 0, to: 0.75)
                    .stroke(Color.blue, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
            .frame(width: 80, height: 80)
        }
    }
}
```

### 4. Ellipse (椭圆)

```swift
struct EllipseExamples: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基本椭圆
            Ellipse()
                .fill(Color.orange)
                .frame(width: 120, height: 60)
            
            // 椭圆边框
            Ellipse()
                .stroke(Color.purple, lineWidth: 3)
                .frame(width: 100, height: 150)
            
            // 椭圆渐变
            Ellipse()
                .fill(
                    RadialGradient(
                        colors: [.yellow, .orange],
                        center: .center,
                        startRadius: 10,
                        endRadius: 50
                    )
                )
                .frame(width: 120, height: 80)
        }
    }
}
```

### 5. Capsule (胶囊形)

```swift
struct CapsuleExamples: View {
    var body: some View {
        VStack(spacing: 20) {
            // 水平胶囊
            Capsule()
                .fill(Color.blue)
                .frame(width: 120, height: 40)
            
            // 垂直胶囊
            Capsule()
                .fill(Color.green)
                .frame(width: 40, height: 120)
            
            // 胶囊边框
            Capsule()
                .stroke(Color.red, lineWidth: 4)
                .frame(width: 100, height: 50)
            
            // 指定胶囊样式
            Capsule(style: .continuous)
                .fill(Color.purple)
                .frame(width: 120, height: 40)
            
            Capsule(style: .circular)
                .fill(Color.orange)
                .frame(width: 120, height: 40)
        }
    }
}
```

---

## Shape 修饰符

### 1. 填充修饰符

#### `.fill()`
```swift
VStack(spacing: 15) {
    // 纯色填充
    Circle()
        .fill(Color.red)
        .frame(width: 60, height: 60)
    
    // 渐变填充
    Rectangle()
        .fill(
            LinearGradient(
                colors: [.blue, .purple],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .frame(width: 120, height: 60)
    
    // 径向渐变
    Circle()
        .fill(
            RadialGradient(
                colors: [.yellow, .orange, .red],
                center: .center,
                startRadius: 5,
                endRadius: 30
            )
        )
        .frame(width: 60, height: 60)
    
    // 角度渐变
    Circle()
        .fill(
            AngularGradient(
                colors: [.red, .orange, .yellow, .green, .blue, .purple, .red],
                center: .center
            )
        )
        .frame(width: 60, height: 60)
}
```

### 2. 描边修饰符

#### `.stroke()`
```swift
VStack(spacing: 15) {
    // 基本描边
    Rectangle()
        .stroke(Color.blue, lineWidth: 3)
        .frame(width: 100, height: 60)
    
    // 自定义描边样式
    Circle()
        .stroke(
            Color.red,
            style: StrokeStyle(
                lineWidth: 4,
                lineCap: .round,
                lineJoin: .round,
                dash: [10, 5],
                dashPhase: 0
            )
        )
        .frame(width: 80, height: 80)
    
    // 渐变描边
    RoundedRectangle(cornerRadius: 10)
        .stroke(
            LinearGradient(
                colors: [.purple, .pink],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            lineWidth: 5
        )
        .frame(width: 100, height: 60)
}
```

### 3. 变换修饰符

#### `.trim()`
```swift
VStack(spacing: 20) {
    // 部分圆弧
    Circle()
        .trim(from: 0, to: 0.75)
        .stroke(Color.blue, lineWidth: 8)
        .frame(width: 100, height: 100)
    
    // 动态裁剪
    struct AnimatedTrim: View {
        @State private var trimEnd: CGFloat = 0
        
        var body: some View {
            Circle()
                .trim(from: 0, to: trimEnd)
                .stroke(Color.green, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .frame(width: 100, height: 100)
                .rotationEffect(.degrees(-90))
                .onAppear {
                    withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                        trimEnd = 1.0
                    }
                }
        }
    }
}
```

#### `.rotation()` 和 `.scale()`
```swift
VStack(spacing: 20) {
    // 旋转
    RoundedRectangle(cornerRadius: 10)
        .fill(Color.orange)
        .frame(width: 80, height: 40)
        .rotationEffect(.degrees(45))
    
    // 缩放
    Circle()
        .fill(Color.purple)
        .frame(width: 60, height: 60)
        .scaleEffect(1.5)
    
    // 组合变换
    Ellipse()
        .fill(Color.green)
        .frame(width: 100, height: 50)
        .rotationEffect(.degrees(30))
        .scaleEffect(0.8)
}
```

### 4. 尺寸和位置

#### `.frame()`
```swift
VStack(spacing: 15) {
    // 固定尺寸
    Rectangle()
        .fill(Color.blue)
        .frame(width: 100, height: 60)
    
    // 最小/最大尺寸
    Circle()
        .fill(Color.red)
        .frame(minWidth: 50, maxWidth: 100, minHeight: 50, maxHeight: 100)
    
    // 无限制尺寸
    Rectangle()
        .fill(Color.green)
        .frame(maxWidth: .infinity, maxHeight: 50)
}
```

#### `.aspectRatio()`
```swift
VStack(spacing: 15) {
    // 保持纵横比
    Rectangle()
        .fill(Color.purple)
        .aspectRatio(2, contentMode: .fit)
        .frame(width: 120)
    
    // 正方形
    RoundedRectangle(cornerRadius: 10)
        .fill(Color.orange)
        .aspectRatio(1, contentMode: .fit)
        .frame(width: 80)
}
```

---

## 自定义形状

### 1. 基本自定义形状

#### 三角形
```swift
struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.midX, y: rect.minY))
        
        return path
    }
}

// 使用三角形
Triangle()
    .fill(Color.red)
    .frame(width: 100, height: 100)
```

#### 六边形
```swift
struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        
        for i in 0..<6 {
            let angle = Double(i) * .pi / 3
            let x = center.x + radius * cos(angle)
            let y = center.y + radius * sin(angle)
            let point = CGPoint(x: x, y: y)
            
            if i == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        
        path.closeSubpath()
        return path
    }
}

// 使用六边形
Hexagon()
    .fill(Color.blue)
    .frame(width: 100, height: 100)
```

#### 星形
```swift
struct Star: Shape {
    let points: Int
    let innerRadius: Double
    let outerRadius: Double
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let angleStep = .pi / Double(points)
        
        for i in 0..<(points * 2) {
            let angle = Double(i) * angleStep - .pi / 2
            let radius = i.isMultiple(of: 2) ? outerRadius : innerRadius
            let x = center.x + radius * cos(angle)
            let y = center.y + radius * sin(angle)
            let point = CGPoint(x: x, y: y)
            
            if i == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        
        path.closeSubpath()
        return path
    }
}

// 使用星形
Star(points: 5, innerRadius: 30, outerRadius: 60)
    .fill(Color.yellow)
    .frame(width: 120, height: 120)
```

### 2. 参数化形状

#### 可调整的圆角矩形
```swift
struct CustomRoundedRectangle: Shape {
    var topLeft: CGFloat = 0
    var topRight: CGFloat = 0
    var bottomLeft: CGFloat = 0
    var bottomRight: CGFloat = 0
    
    var animatableData: AnimatablePair<AnimatablePair<CGFloat, CGFloat>, AnimatablePair<CGFloat, CGFloat>> {
        get {
            AnimatablePair(
                AnimatablePair(topLeft, topRight),
                AnimatablePair(bottomLeft, bottomRight)
            )
        }
        set {
            topLeft = newValue.first.first
            topRight = newValue.first.second
            bottomLeft = newValue.second.first
            bottomRight = newValue.second.second
        }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let tl = min(min(topLeft, rect.height/2), rect.width/2)
        let tr = min(min(topRight, rect.height/2), rect.width/2)
        let bl = min(min(bottomLeft, rect.height/2), rect.width/2)
        let br = min(min(bottomRight, rect.height/2), rect.width/2)
        
        path.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
        path.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr), 
                   radius: tr, startAngle: Angle(degrees: -90), 
                   endAngle: Angle(degrees: 0), clockwise: false)
        
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
        path.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br), 
                   radius: br, startAngle: Angle(degrees: 0), 
                   endAngle: Angle(degrees: 90), clockwise: false)
        
        path.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
        path.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl), 
                   radius: bl, startAngle: Angle(degrees: 90), 
                   endAngle: Angle(degrees: 180), clockwise: false)
        
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
        path.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl), 
                   radius: tl, startAngle: Angle(degrees: 180), 
                   endAngle: Angle(degrees: 270), clockwise: false)
        
        return path
    }
}

// 使用自定义圆角
CustomRoundedRectangle(topLeft: 20, topRight: 5, bottomLeft: 5, bottomRight: 20)
    .fill(Color.purple)
    .frame(width: 120, height: 80)
```

#### 波浪形状
```swift
struct Wave: Shape {
    var amplitude: Double = 20
    var frequency: Double = 1
    var phase: Double = 0
    
    var animatableData: AnimatablePair<Double, AnimatablePair<Double, Double>> {
        get {
            AnimatablePair(amplitude, AnimatablePair(frequency, phase))
        }
        set {
            amplitude = newValue.first
            frequency = newValue.second.first
            phase = newValue.second.second
        }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let stepSize = rect.width / 100
        
        path.move(to: CGPoint(x: 0, y: rect.midY))
        
        for x in stride(from: 0, through: rect.width, by: stepSize) {
            let relativeX = x / rect.width
            let y = amplitude * sin((relativeX * frequency * 2 * .pi) + phase) + rect.midY
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        return path
    }
}

// 使用波浪形状
struct AnimatedWave: View {
    @State private var phase: Double = 0
    
    var body: some View {
        Wave(amplitude: 30, frequency: 2, phase: phase)
            .stroke(Color.blue, lineWidth: 3)
            .frame(height: 100)
            .onAppear {
                withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                    phase = 2 * .pi
                }
            }
    }
}
```

---

## 路径操作

### 1. Path 基础

#### 创建路径
```swift
struct CustomPath: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基本路径绘制
            Path { path in
                path.move(to: CGPoint(x: 50, y: 50))
                path.addLine(to: CGPoint(x: 150, y: 50))
                path.addLine(to: CGPoint(x: 100, y: 150))
                path.closeSubpath()
            }
            .fill(Color.green)
            .frame(width: 200, height: 200)
            
            // 曲线路径
            Path { path in
                path.move(to: CGPoint(x: 0, y: 100))
                path.addQuadCurve(
                    to: CGPoint(x: 200, y: 100),
                    control: CGPoint(x: 100, y: 0)
                )
            }
            .stroke(Color.purple, lineWidth: 4)
            .frame(width: 200, height: 100)
            
            // 贝塞尔曲线
            Path { path in
                path.move(to: CGPoint(x: 0, y: 50))
                path.addCurve(
                    to: CGPoint(x: 200, y: 50),
                    control1: CGPoint(x: 50, y: 0),
                    control2: CGPoint(x: 150, y: 100)
                )
            }
            .stroke(Color.orange, lineWidth: 3)
            .frame(width: 200, height: 100)
        }
    }
}
```

### 2. 路径组合

#### 路径合并
```swift
struct CombinedPaths: View {
    var body: some View {
        VStack(spacing: 20) {
            // 多个子路径
            Path { path in
                // 第一个圆
                path.addEllipse(in: CGRect(x: 20, y: 20, width: 60, height: 60))
                // 第二个圆
                path.addEllipse(in: CGRect(x: 70, y: 70, width: 60, height: 60))
                // 矩形
                path.addRect(CGRect(x: 120, y: 20, width: 60, height: 60))
            }
            .fill(Color.blue)
            .frame(width: 200, height: 150)
            
            // 路径操作
            ZStack {
                // 背景形状
                Circle()
                    .fill(Color.red.opacity(0.3))
                    .frame(width: 100, height: 100)
                
                // 前景形状
                Rectangle()
                    .fill(Color.blue.opacity(0.3))
                    .frame(width: 100, height: 100)
            }
        }
    }
}
```

### 3. 路径动画

#### 路径绘制动画
```swift
struct AnimatedPath: View {
    @State private var trimEnd: CGFloat = 0
    
    var body: some View {
        VStack(spacing: 30) {
            // 动画路径绘制
            Path { path in
                path.move(to: CGPoint(x: 50, y: 150))
                path.addQuadCurve(
                    to: CGPoint(x: 250, y: 150),
                    control: CGPoint(x: 150, y: 50)
                )
                path.addQuadCurve(
                    to: CGPoint(x: 350, y: 150),
                    control: CGPoint(x: 300, y: 250)
                )
            }
            .trim(from: 0, to: trimEnd)
            .stroke(Color.purple, style: StrokeStyle(lineWidth: 5, lineCap: .round))
            .frame(width: 400, height: 200)
            .onAppear {
                withAnimation(.easeInOut(duration: 3)) {
                    trimEnd = 1
                }
            }
            
            Button("重新绘制") {
                trimEnd = 0
                withAnimation(.easeInOut(duration: 3)) {
                    trimEnd = 1
                }
            }
        }
    }
}
```

---

## 动画和过渡

### 1. 形状变形动画

```swift
struct MorphingShape: View {
    @State private var isCircle = true
    
    var body: some View {
        VStack(spacing: 30) {
            // 形状变形
            RoundedRectangle(cornerRadius: isCircle ? 50 : 10)
                .fill(Color.blue)
                .frame(width: 100, height: 100)
                .animation(.easeInOut(duration: 1), value: isCircle)
            
            Button("变形") {
                isCircle.toggle()
            }
        }
    }
}
```

### 2. 自定义形状动画

```swift
struct AnimatedStar: View {
    @State private var innerRadius: Double = 20
    @State private var outerRadius: Double = 50
    
    var body: some View {
        VStack(spacing: 30) {
            Star(points: 5, innerRadius: innerRadius, outerRadius: outerRadius)
                .fill(Color.yellow)
                .frame(width: 120, height: 120)
                .animation(.easeInOut(duration: 1), value: innerRadius)
                .animation(.easeInOut(duration: 1), value: outerRadius)
            
            VStack(spacing: 10) {
                Button("脉冲效果") {
                    withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                        innerRadius = 30
                        outerRadius = 70
                    }
                }
                
                Button("重置") {
                    innerRadius = 20
                    outerRadius = 50
                }
            }
        }
    }
}
```

### 3. 旋转和缩放动画

```swift
struct RotatingShapes: View {
    @State private var rotation: Double = 0
    @State private var scale: CGFloat = 1
    
    var body: some View {
        VStack(spacing: 30) {
            ZStack {
                // 背景圆环
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 2)
                    .frame(width: 120, height: 120)
                
                // 旋转的形状
                ForEach(0..<6) { i in
                    RoundedRectangle(cornerRadius: 5)
                        .fill(Color.blue)
                        .frame(width: 30, height: 8)
                        .offset(y: -40)
                        .rotationEffect(.degrees(Double(i) * 60 + rotation))
                }
            }
            .scaleEffect(scale)
            .onAppear {
                withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                    rotation = 360
                }
                withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                    scale = 1.2
                }
            }
        }
    }
}
```

---

## 实用示例组合

### 1. 完整的形状展示界面

```swift
struct ShapeShowcaseView: View {
    @State private var selectedShape = 0
    @State private var fillColor = Color.blue
    @State private var strokeWidth: CGFloat = 2
    @State private var cornerRadius: CGFloat = 10
    
    var body: some View {
        VStack(spacing: 30) {
            Text("Shape 展示")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            // 形状选择器
            Picker("选择形状", selection: $selectedShape) {
                Text("矩形").tag(0)
                Text("圆形").tag(1)
                Text("圆角矩形").tag(2)
                Text("椭圆").tag(3)
                Text("胶囊").tag(4)
                Text("三角形").tag(5)
                Text("六边形").tag(6)
                Text("星形").tag(7)
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding(.horizontal)
            
            // 形状显示区域
            ZStack {
                Rectangle()
                    .fill(Color.gray.opacity(0.1))
                    .frame(width: 200, height: 200)
                
                Group {
                    switch selectedShape {
                    case 0:
                        Rectangle()
                    case 1:
                        Circle()
                    case 2:
                        RoundedRectangle(cornerRadius: cornerRadius)
                    case 3:
                        Ellipse()
                    case 4:
                        Capsule()
                    case 5:
                        Triangle()
                    case 6:
                        Hexagon()
                    case 7:
                        Star(points: 5, innerRadius: 40, outerRadius: 80)
                    default:
                        Rectangle()
                    }
                }
                .fill(fillColor)
                .overlay(
                    Group {
                        switch selectedShape {
                        case 0:
                            Rectangle()
                        case 1:
                            Circle()
                        case 2:
                            RoundedRectangle(cornerRadius: cornerRadius)
                        case 3:
                            Ellipse()
                        case 4:
                            Capsule()
                        case 5:
                            Triangle()
                        case 6:
                            Hexagon()
                        case 7:
                            Star(points: 5, innerRadius: 40, outerRadius: 80)
                        default:
                            Rectangle()
                        }
                    }
                    .stroke(Color.black, lineWidth: strokeWidth)
                )
                .frame(width: 160, height: 160)
            }
            
            // 控制面板
            VStack(spacing: 20) {
                // 颜色选择
                HStack {
                    Text("填充颜色:")
                    Spacer()
                    HStack(spacing: 10) {
                        ForEach([Color.blue, Color.red, Color.green, Color.purple, Color.orange], id: \.self) { color in
                            Circle()
                                .fill(color)
                                .frame(width: 30, height: 30)
                                .overlay(
                                    Circle()
                                        .stroke(Color.black, lineWidth: fillColor == color ? 3 : 1)
                                )
                                .onTapGesture {
                                    fillColor = color
                                }
                        }
                    }
                }
                .padding(.horizontal)
                
                // 边框宽度
                VStack {
                    HStack {
                        Text("边框宽度: \(strokeWidth, specifier: "%.1f")")
                        Spacer()
                    }
                    Slider(value: $strokeWidth, in: 0...10, step: 0.5)
                }
                .padding(.horizontal)
                
                // 圆角半径（仅对圆角矩形有效）
                if selectedShape == 2 {
                    VStack {
                        HStack {
                            Text("圆角半径: \(cornerRadius, specifier: "%.0f")")
                            Spacer()
                        }
                        Slider(value: $cornerRadius, in: 0...50, step: 1)
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
            .padding(.horizontal)
            
            Spacer()
        }
    }
}
```

### 2. 进度指示器形状组合

```swift
struct ProgressShapes: View {
    @State private var progress: Double = 0.3
    
    var body: some View {
        VStack(spacing: 40) {
            Text("进度指示器")
                .font(.title)
                .fontWeight(.bold)
            
            // 圆形进度条
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                
                Circle()
                    .trim(from: 0, to: CGFloat(progress))
                    .stroke(
                        AngularGradient(
                            colors: [.blue, .purple, .pink],
                            center: .center
                        ),
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                
                Text("\(Int(progress * 100))%")
                    .font(.title2)
                    .fontWeight(.bold)
            }
            .frame(width: 120, height: 120)
            
            // 线性进度条
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 20)
                
                RoundedRectangle(cornerRadius: 10)
                    .fill(
                        LinearGradient(
                            colors: [.green, .yellow],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: CGFloat(progress) * 250, height: 20)
                    .animation(.easeInOut(duration: 0.5), value: progress)
            }
            .frame(width: 250)
            
            // 胶囊形进度条
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 16)
                
                Capsule()
                    .fill(Color.orange)
                    .frame(width: CGFloat(progress) * 200, height: 16)
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: progress)
            }
            .frame(width: 200)
            
            // 星形评分
            HStack(spacing: 5) {
                ForEach(0..<5) { index in
                    Star(points: 5, innerRadius: 8, outerRadius: 15)
                        .fill(index < Int(progress * 5) ? Color.yellow : Color.gray.opacity(0.3))
                        .frame(width: 30, height: 30)
                }
            }
            
            // 进度控制
            VStack(spacing: 15) {
                Text("调整进度")
                    .font(.headline)
                
                Slider(value: $progress, in: 0...1, step: 0.1)
                    .padding(.horizontal)
                
                HStack(spacing: 20) {
                    Button("0%") { progress = 0 }
                    Button("25%") { progress = 0.25 }
                    Button("50%") { progress = 0.5 }
                    Button("75%") { progress = 0.75 }
                    Button("100%") { progress = 1.0 }
                }
                .buttonStyle(.bordered)
            }
            .padding()
            .background(Color.blue.opacity(0.1))
            .cornerRadius(10)
            .padding(.horizontal)
        }
        .padding()
    }
}
```

### 3. 复杂形状组合 - 图标集

```swift
struct IconShapes: View {
    var body: some View {
        ScrollView {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 30) {
                // 主页图标
                VStack {
                    ZStack {
                        // 房屋底部
                        Rectangle()
                            .fill(Color.brown)
                            .frame(width: 40, height: 30)
                            .offset(y: 10)
                        
                        // 房屋顶部
                        Triangle()
                            .fill(Color.red)
                            .frame(width: 50, height: 25)
                            .offset(y: -5)
                        
                        // 门
                        Rectangle()
                            .fill(Color.white)
                            .frame(width: 12, height: 18)
                            .offset(y: 12)
                    }
                    Text("主页")
                        .font(.caption)
                }
                
                // 设置图标
                VStack {
                    ZStack {
                        Circle()
                            .stroke(Color.gray, lineWidth: 3)
                            .frame(width: 50, height: 50)
                        
                        ForEach(0..<8) { i in
                            Rectangle()
                                .fill(Color.gray)
                                .frame(width: 2, height: 8)
                                .offset(y: -21)
                                .rotationEffect(.degrees(Double(i) * 45))
                        }
                        
                        Circle()
                            .fill(Color.gray)
                            .frame(width: 20, height: 20)
                    }
                    Text("设置")
                        .font(.caption)
                }
                
                // 心形图标
                VStack {
                    HeartShape()
                        .fill(Color.red)
                        .frame(width: 50, height: 45)
                    Text("喜欢")
                        .font(.caption)
                }
                
                // 播放图标
                VStack {
                    Triangle()
                        .fill(Color.green)
                        .frame(width: 40, height: 40)
                        .rotationEffect(.degrees(90))
                    Text("播放")
                        .font(.caption)
                }
                
                // 下载图标
                VStack {
                    ZStack {
                        Rectangle()
                            .fill(Color.blue)
                            .frame(width: 4, height: 30)
                        
                        Triangle()
                            .fill(Color.blue)
                            .frame(width: 20, height: 15)
                            .rotationEffect(.degrees(180))
                            .offset(y: 15)
                        
                        Rectangle()
                            .fill(Color.blue)
                            .frame(width: 40, height: 4)
                            .offset(y: 25)
                    }
                    Text("下载")
                        .font(.caption)
                }
                
                // 搜索图标
                VStack {
                    ZStack {
                        Circle()
                            .stroke(Color.purple, lineWidth: 4)
                            .frame(width: 30, height: 30)
                            .offset(x: -5, y: -5)
                        
                        Rectangle()
                            .fill(Color.purple)
                            .frame(width: 4, height: 15)
                            .rotationEffect(.degrees(45))
                            .offset(x: 10, y: 10)
                    }
                    Text("搜索")
                        .font(.caption)
                }
            }
            .padding()
        }
        .navigationTitle("图标形状")
    }
}

// 心形形状
struct HeartShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let width = rect.width
        let height = rect.height
        
        path.move(to: CGPoint(x: width * 0.5, y: height * 0.9))
        
        path.addCurve(
            to: CGPoint(x: width * 0.1, y: height * 0.3),
            control1: CGPoint(x: width * 0.5, y: height * 0.7),
            control2: CGPoint(x: width * 0.1, y: height * 0.5)
        )
        
        path.addCurve(
            to: CGPoint(x: width * 0.5, y: height * 0.1),
            control1: CGPoint(x: width * 0.1, y: height * 0.1),
            control2: CGPoint(x: width * 0.3, y: height * 0.1)
        )
        
        path.addCurve(
            to: CGPoint(x: width * 0.9, y: height * 0.3),
            control1: CGPoint(x: width * 0.7, y: height * 0.1),
            control2: CGPoint(x: width * 0.9, y: height * 0.1)
        )
        
        path.addCurve(
            to: CGPoint(x: width * 0.5, y: height * 0.9),
            control1: CGPoint(x: width * 0.9, y: height * 0.5),
            control2: CGPoint(x: width * 0.5, y: height * 0.7)
        )
        
        return path
    }
}
```

### 4. 动态背景形状

```swift
struct AnimatedBackground: View {
    @State private var animate = false
    
    var body: some View {
        ZStack {
            // 背景色
            LinearGradient(
                colors: [.purple.opacity(0.3), .blue.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // 浮动形状
            ForEach(0..<15) { index in
                FloatingShape(index: index, animate: animate)
            }
            
            // 前景内容
            VStack {
                Text("动态背景")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Button("切换动画") {
                    withAnimation(.easeInOut(duration: 2)) {
                        animate.toggle()
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(.white)
                .foregroundColor(.purple)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
                animate = true
            }
        }
    }
}

struct FloatingShape: View {
    let index: Int
    let animate: Bool
    
    var body: some View {
        let shapes: [AnyView] = [
            AnyView(Circle()),
            AnyView(RoundedRectangle(cornerRadius: 10)),
            AnyView(Triangle()),
            AnyView(Hexagon())
        ]
        
        shapes[index % shapes.count]
            .fill(Color.white.opacity(0.1))
            .frame(
                width: CGFloat.random(in: 20...60),
                height: CGFloat.random(in: 20...60)
            )
            .position(
                x: animate ? CGFloat.random(in: 50...350) : CGFloat.random(in: 50...350),
                y: animate ? CGFloat.random(in: 100...700) : CGFloat.random(in: 100...700)
            )
            .rotationEffect(.degrees(animate ? Double.random(in: 0...360) : 0))
            .animation(
                .easeInOut(duration: Double.random(in: 2...4))
                .repeatForever(autoreverses: true)
                .delay(Double.random(in: 0...2)),
                value: animate
            )
    }
}

```

### 5. 任意圆角背景

```

extension View {
    func cornersRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundeCorner(radius: radius, corners: corners))
    }
}

struct RoundeCorner: Shape {

    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }

}

Rectangle().fill(Color.red.opacity(0.5)).frame(width: 90, height: 90).cornersRadius(9, corners: [.bottomLeft, .bottomRight])

```

---

## 总结

SwiftUI Shape 系统提供了强大而灵活的图形绘制能力：

### 核心概念
- **Shape 协议**：定义几何路径的基础协议
- **Path**：具体的绘制路径，支持直线、曲线、弧形等
- **内置形状**：Rectangle、Circle、RoundedRectangle、Ellipse、Capsule

### 主要功能
1. **基础形状**：提供常用的几何形状
2. **自定义形状**：通过实现 Shape 协议创建复杂图形
3. **样式系统**：fill、stroke、渐变等丰富的视觉效果
4. **变换操作**：旋转、缩放、裁剪等几何变换
5. **动画支持**：形状变形、路径动画、参数动画

### 高级特性
- **参数化形状**：支持动画的可变参数
- **路径操作**：复杂的贝塞尔曲线和路径组合
- **性能优化**：硬件加速的绘制性能
- **无限创意**：可创建任意复杂的自定义图形

Shape 是 SwiftUI 中实现复杂 UI 效果、图标、图表和动画的重要工具，掌握这些 API 可以大大提升应用的视觉表现力。