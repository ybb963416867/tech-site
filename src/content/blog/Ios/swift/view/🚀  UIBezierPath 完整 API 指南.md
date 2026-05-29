---
title: "UIBezierPath 完整 API 指南"
description: ""
pubDate: 2026-05-29
category: "view"
tags: [iOS, Swift, Array, API, SEO]
draft: false
---
# 🚀  UIBezierPath 完整 API 指南

## 目录
1. [UIBezierPath 概述](#uibezierpath-概述)
2. [创建路径](#创建路径)
3. [基础绘制方法](#基础绘制方法)
4. [几何形状创建](#几何形状创建)
5. [路径操作](#路径操作)
6. [路径信息查询](#路径信息查询)
7. [渲染和填充](#渲染和填充)
8. [Core Graphics 集成](#core-graphics-集成)
9. [实用示例](#实用示例)

---

## UIBezierPath 概述

UIBezierPath 是 UIKit 框架中用于创建和操作贝塞尔曲线路径的类，它提供了一个面向对象的接口来封装 Core Graphics 的路径功能。

### 基本特性
- 基于 Core Graphics CGPath 的高级封装
- 支持直线、曲线、弧线等各种路径元素
- 提供路径变换、合并、查询等操作
- 用于绘制复杂的 2D 图形和动画

---

## 创建路径

### 1. 初始化方法

#### `init()`
创建一个空的路径对象。

```swift
let path = UIBezierPath()
```

#### `init(rect:)`
创建矩形路径。

```swift
let rectPath = UIBezierPath(rect: CGRect(x: 10, y: 10, width: 100, height: 50))

// 使用示例
override func draw(_ rect: CGRect) {
    let rectPath = UIBezierPath(rect: CGRect(x: 20, y: 20, width: 100, height: 60))
    UIColor.blue.setFill()
    rectPath.fill()
}
```

#### `init(ovalIn:)`
创建椭圆或圆形路径。

```swift
let ovalPath = UIBezierPath(ovalIn: CGRect(x: 10, y: 10, width: 100, height: 100))

// 创建圆形
let circlePath = UIBezierPath(ovalIn: CGRect(x: 0, y: 0, width: 50, height: 50))

// 创建椭圆
let ellipsePath = UIBezierPath(ovalIn: CGRect(x: 0, y: 0, width: 100, height: 60))
```

#### `init(roundedRect:cornerRadius:)`
创建圆角矩形路径。

```swift
let roundedRectPath = UIBezierPath(
    roundedRect: CGRect(x: 10, y: 10, width: 100, height: 50),
    cornerRadius: 10
)

// 使用示例
override func draw(_ rect: CGRect) {
    let roundedPath = UIBezierPath(
        roundedRect: CGRect(x: 20, y: 20, width: 120, height: 80),
        cornerRadius: 15
    )
    UIColor.green.setFill()
    roundedPath.fill()
}
```

#### `init(roundedRect:byRoundingCorners:cornerRadii:)`
创建指定角圆角的矩形路径。

```swift
let customRoundedPath = UIBezierPath(
    roundedRect: CGRect(x: 10, y: 10, width: 100, height: 50),
    byRoundingCorners: [.topLeft, .bottomRight],
    cornerRadii: CGSize(width: 15, height: 15)
)

// 示例：只圆化顶部角
let topRoundedPath = UIBezierPath(
    roundedRect: CGRect(x: 0, y: 0, width: 100, height: 50),
    byRoundingCorners: [.topLeft, .topRight],
    cornerRadii: CGSize(width: 20, height: 20)
)
```

#### `init(arcCenter:radius:startAngle:endAngle:clockwise:)`
创建圆弧路径。

```swift
let arcPath = UIBezierPath(
    arcCenter: CGPoint(x: 50, y: 50),
    radius: 30,
    startAngle: 0,
    endAngle: .pi,
    clockwise: true
)

// 创建半圆
let semicirclePath = UIBezierPath(
    arcCenter: CGPoint(x: 100, y: 100),
    radius: 50,
    startAngle: 0,
    endAngle: .pi,
    clockwise: true
)

// 创建四分之一圆
let quarterCirclePath = UIBezierPath(
    arcCenter: CGPoint(x: 50, y: 50),
    radius: 40,
    startAngle: 0,
    endAngle: .pi / 2,
    clockwise: true
)
```

#### `init(cgPath:)`
从 CGPath 创建 UIBezierPath。

```swift
let cgPath = CGMutablePath()
cgPath.addRect(CGRect(x: 0, y: 0, width: 100, height: 100))
let bezierPath = UIBezierPath(cgPath: cgPath)
```

---

## 基础绘制方法

### 1. 路径构建

#### `move(to:)`
移动到指定点（不绘制）。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 50, y: 50))
path.addLine(to: CGPoint(x: 100, y: 100))
```

#### `addLine(to:)`
添加直线到指定点。

```swift
// 绘制三角形
let trianglePath = UIBezierPath()
trianglePath.move(to: CGPoint(x: 50, y: 0))
trianglePath.addLine(to: CGPoint(x: 0, y: 100))
trianglePath.addLine(to: CGPoint(x: 100, y: 100))
trianglePath.close()
```

#### `addCurve(to:controlPoint1:controlPoint2:)`
添加三次贝塞尔曲线。

```swift
let curvePath = UIBezierPath()
curvePath.move(to: CGPoint(x: 0, y: 50))
curvePath.addCurve(
    to: CGPoint(x: 100, y: 50),
    controlPoint1: CGPoint(x: 25, y: 0),
    controlPoint2: CGPoint(x: 75, y: 100)
)

// S 型曲线示例
let sPath = UIBezierPath()
sPath.move(to: CGPoint(x: 20, y: 100))
sPath.addCurve(
    to: CGPoint(x: 120, y: 100),
    controlPoint1: CGPoint(x: 70, y: 20),
    controlPoint2: CGPoint(x: 70, y: 180)
)
```

#### `addQuadCurve(to:controlPoint:)`
添加二次贝塞尔曲线。

```swift
let quadPath = UIBezierPath()
quadPath.move(to: CGPoint(x: 0, y: 100))
quadPath.addQuadCurve(
    to: CGPoint(x: 100, y: 100),
    controlPoint: CGPoint(x: 50, y: 0)
)

// 抛物线示例
let parabolaPath = UIBezierPath()
parabolaPath.move(to: CGPoint(x: 10, y: 150))
parabolaPath.addQuadCurve(
    to: CGPoint(x: 150, y: 150),
    controlPoint: CGPoint(x: 80, y: 50)
)
```

#### `addArc(withCenter:radius:startAngle:endAngle:clockwise:)`
添加圆弧。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 50, y: 50))
path.addArc(
    withCenter: CGPoint(x: 100, y: 100),
    radius: 50,
    startAngle: 0,
    endAngle: .pi / 2,
    clockwise: true
)

// 扇形示例
let sectorPath = UIBezierPath()
sectorPath.move(to: CGPoint(x: 100, y: 100)) // 圆心
sectorPath.addLine(to: CGPoint(x: 150, y: 100)) // 半径线
sectorPath.addArc(
    withCenter: CGPoint(x: 100, y: 100),
    radius: 50,
    startAngle: 0,
    endAngle: .pi / 3,
    clockwise: true
)
sectorPath.close()
```

#### `close()`
闭合路径。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 50, y: 50))
path.addLine(to: CGPoint(x: 100, y: 50))
path.addLine(to: CGPoint(x: 75, y: 100))
path.close() // 自动连接到起始点
```

### 2. 路径属性

#### `lineWidth`
设置线条宽度。

```swift
let path = UIBezierPath(rect: CGRect(x: 0, y: 0, width: 100, height: 100))
path.lineWidth = 5.0
```

#### `lineCapStyle`
设置线条端点样式。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 10, y: 50))
path.addLine(to: CGPoint(x: 100, y: 50))
path.lineWidth = 10

// 可选值：
path.lineCapStyle = .butt    // 平头
path.lineCapStyle = .round   // 圆头
path.lineCapStyle = .square  // 方头
```

#### `lineJoinStyle`
设置线条连接样式。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 50, y: 20))
path.addLine(to: CGPoint(x: 100, y: 50))
path.addLine(to: CGPoint(x: 50, y: 80))
path.lineWidth = 8

// 可选值：
path.lineJoinStyle = .miter  // 尖角
path.lineJoinStyle = .round  // 圆角
path.lineJoinStyle = .bevel  // 斜角
```

#### `miterLimit`
设置尖角限制。

```swift
let path = UIBezierPath()
path.lineJoinStyle = .miter
path.miterLimit = 10.0
```

#### `flatness`
设置曲线平坦度。

```swift
let path = UIBezierPath()
path.flatness = 0.6
```

---

## 几何形状创建

### 1. 复杂形状示例

#### 星形路径
```swift
func createStarPath(center: CGPoint, outerRadius: CGFloat, innerRadius: CGFloat, points: Int) -> UIBezierPath {
    let path = UIBezierPath()
    let angleStep = .pi / CGFloat(points)
    
    for i in 0..<(points * 2) {
        let angle = CGFloat(i) * angleStep - .pi / 2
        let radius = i % 2 == 0 ? outerRadius : innerRadius
        let x = center.x + radius * cos(angle)
        let y = center.y + radius * sin(angle)
        let point = CGPoint(x: x, y: y)
        
        if i == 0 {
            path.move(to: point)
        } else {
            path.addLine(to: point)
        }
    }
    
    path.close()
    return path
}

// 使用示例
let starPath = createStarPath(
    center: CGPoint(x: 100, y: 100),
    outerRadius: 50,
    innerRadius: 25,
    points: 5
)
```

#### 心形路径
```swift
func createHeartPath(center: CGPoint, size: CGFloat) -> UIBezierPath {
    let path = UIBezierPath()
    
    let heartWidth = size
    let heartHeight = size * 0.8
    
    // 心形底部点
    let bottomPoint = CGPoint(x: center.x, y: center.y + heartHeight / 2)
    path.move(to: bottomPoint)
    
    // 左半部分
    path.addCurve(
        to: CGPoint(x: center.x - heartWidth / 2, y: center.y - heartHeight / 4),
        controlPoint1: CGPoint(x: center.x, y: center.y),
        controlPoint2: CGPoint(x: center.x - heartWidth / 2, y: center.y)
    )
    
    path.addCurve(
        to: CGPoint(x: center.x, y: center.y - heartHeight / 2),
        controlPoint1: CGPoint(x: center.x - heartWidth / 2, y: center.y - heartHeight / 2),
        controlPoint2: CGPoint(x: center.x - heartWidth / 4, y: center.y - heartHeight / 2)
    )
    
    // 右半部分
    path.addCurve(
        to: CGPoint(x: center.x + heartWidth / 2, y: center.y - heartHeight / 4),
        controlPoint1: CGPoint(x: center.x + heartWidth / 4, y: center.y - heartHeight / 2),
        controlPoint2: CGPoint(x: center.x + heartWidth / 2, y: center.y - heartHeight / 2)
    )
    
    path.addCurve(
        to: bottomPoint,
        controlPoint1: CGPoint(x: center.x + heartWidth / 2, y: center.y),
        controlPoint2: CGPoint(x: center.x, y: center.y)
    )
    
    return path
}
```

#### 多边形路径
```swift
func createPolygonPath(center: CGPoint, radius: CGFloat, sides: Int) -> UIBezierPath {
    let path = UIBezierPath()
    let angleStep = 2 * .pi / CGFloat(sides)
    
    for i in 0..<sides {
        let angle = CGFloat(i) * angleStep - .pi / 2
        let x = center.x + radius * cos(angle)
        let y = center.y + radius * sin(angle)
        let point = CGPoint(x: x, y: y)
        
        if i == 0 {
            path.move(to: point)
        } else {
            path.addLine(to: point)
        }
    }
    
    path.close()
    return path
}

// 使用示例
let hexagonPath = createPolygonPath(
    center: CGPoint(x: 100, y: 100),
    radius: 50,
    sides: 6
)
```

---

## 路径操作

### 1. 路径变换

#### `apply(_:)`
应用仿射变换。

```swift
let path = UIBezierPath(rect: CGRect(x: 0, y: 0, width: 100, height: 50))

// 旋转
var transform = CGAffineTransform(rotationAngle: .pi / 4)
path.apply(transform)

// 缩放
transform = CGAffineTransform(scaleX: 1.5, y: 2.0)
path.apply(transform)

// 平移
transform = CGAffineTransform(translationX: 50, y: 30)
path.apply(transform)

// 组合变换
let combinedTransform = CGAffineTransform(rotationAngle: .pi / 6)
    .scaledBy(x: 1.2, y: 1.2)
    .translatedBy(x: 20, y: 20)
path.apply(combinedTransform)
```

#### `append(_:)`
合并路径。

```swift
let path1 = UIBezierPath(rect: CGRect(x: 0, y: 0, width: 50, height: 50))
let path2 = UIBezierPath(ovalIn: CGRect(x: 60, y: 0, width: 50, height: 50))

path1.append(path2)
// path1 现在包含矩形和圆形两个形状
```

### 2. 路径修改

#### `removeAllPoints()`
清空路径中的所有点。

```swift
let path = UIBezierPath(rect: CGRect(x: 0, y: 0, width: 100, height: 100))
path.removeAllPoints()
// 路径现在为空
```

#### `reversing()`
反转路径方向。

```swift
let originalPath = UIBezierPath(rect: CGRect(x: 0, y: 0, width: 100, height: 100))
let reversedPath = originalPath.reversing()
```

---

## 路径信息查询

### 1. 边界和包含检测

#### `bounds`
获取路径的边界矩形。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 10, y: 20))
path.addLine(to: CGPoint(x: 100, y: 80))
path.addLine(to: CGPoint(x: 50, y: 150))

let bounds = path.bounds
print("路径边界: \(bounds)")
// 输出: 路径边界: (10.0, 20.0, 90.0, 130.0)
```

#### `contains(_:)`
检查点是否在路径内（填充区域）。

```swift
let circlePath = UIBezierPath(ovalIn: CGRect(x: 0, y: 0, width: 100, height: 100))
let point1 = CGPoint(x: 50, y: 50) // 圆心
let point2 = CGPoint(x: 150, y: 150) // 圆外

if circlePath.contains(point1) {
    print("点1在圆内")
}

if !circlePath.contains(point2) {
    print("点2在圆外")
}
```

#### `contains(_:using:)`
使用指定填充规则检查点包含。

```swift
let path = UIBezierPath()
// 创建复杂路径...

let point = CGPoint(x: 50, y: 50)

// 使用不同的填充规则
let containsEvenOdd = path.contains(point, using: .evenOdd)
let containsNonZero = path.contains(point, using: .nonZero)
```

### 2. 当前点和空路径检测

#### `currentPoint`
获取当前绘制点。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 10, y: 10))
path.addLine(to: CGPoint(x: 50, y: 50))

let current = path.currentPoint
print("当前点: \(current)")
// 输出: 当前点: (50.0, 50.0)
```

#### `isEmpty`
检查路径是否为空。

```swift
let emptyPath = UIBezierPath()
print("路径为空: \(emptyPath.isEmpty)")
// 输出: 路径为空: true

emptyPath.move(to: CGPoint(x: 0, y: 0))
print("路径为空: \(emptyPath.isEmpty)")
// 输出: 路径为空: false
```

---

## 渲染和填充

### 1. 绘制方法

#### `fill()`
填充路径。

```swift
override func draw(_ rect: CGRect) {
    let path = UIBezierPath(ovalIn: CGRect(x: 20, y: 20, width: 100, height: 100))
    UIColor.blue.setFill()
    path.fill()
}
```

#### `stroke()`
描边路径。

```swift
override func draw(_ rect: CGRect) {
    let path = UIBezierPath()
    path.move(to: CGPoint(x: 10, y: 50))
    path.addLine(to: CGPoint(x: 110, y: 50))
    path.lineWidth = 5
    
    UIColor.red.setStroke()
    path.stroke()
}
```

#### `fill(with:alpha:)`
使用指定混合模式和透明度填充。

```swift
override func draw(_ rect: CGRect) {
    let path = UIBezierPath(rect: CGRect(x: 20, y: 20, width: 100, height: 100))
    UIColor.blue.setFill()
    path.fill(with: .multiply, alpha: 0.7)
}
```

#### `stroke(with:alpha:)`
使用指定混合模式和透明度描边。

```swift
override func draw(_ rect: CGRect) {
    let path = UIBezierPath(ovalIn: CGRect(x: 20, y: 20, width: 100, height: 100))
    path.lineWidth = 8
    UIColor.green.setStroke()
    path.stroke(with: .overlay, alpha: 0.8)
}
```

### 2. 填充规则

#### `usesEvenOddFillRule`
设置填充规则。

```swift
let complexPath = UIBezierPath()
// 创建复杂的自相交路径...

complexPath.usesEvenOddFillRule = true  // 奇偶填充规则
// 或
complexPath.usesEvenOddFillRule = false // 非零填充规则（默认）
```

### 3. 虚线模式

#### `setLineDash(_:count:phase:)`
设置虚线模式。

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 10, y: 50))
path.addLine(to: CGPoint(x: 200, y: 50))
path.lineWidth = 3

// 设置虚线：5个点实线，3个点空白
let dashPattern: [CGFloat] = [5, 3]
path.setLineDash(dashPattern, count: 2, phase: 0)

// 复杂虚线模式：长-短-长-短
let complexDash: [CGFloat] = [10, 3, 3, 3]
path.setLineDash(complexDash, count: 4, phase: 0)
```

#### `getLineDash(_:count:phase:)`
获取当前虚线设置。

```swift
var pattern = [CGFloat](repeating: 0, count: 10)
var count: Int = 0
var phase: CGFloat = 0

path.getLineDash(&pattern, count: &count, phase: &phase)
print("虚线模式: \(Array(pattern[0..<count]))")
print("相位: \(phase)")
```

---

## Core Graphics 集成

### 1. CGPath 转换

#### `cgPath`
获取对应的 CGPath。

```swift
let bezierPath = UIBezierPath(rect: CGRect(x: 0, y: 0, width: 100, height: 100))
let cgPath = bezierPath.cgPath

// 在 Core Graphics 中使用
override func draw(_ rect: CGRect) {
    guard let context = UIGraphicsGetCurrentContext() else { return }
    context.addPath(cgPath)
    context.setFillColor(UIColor.blue.cgColor)
    context.fillPath()
}
```

### 2. 路径信息

#### `elementCount`
获取路径元素数量（私有 API，仅供参考）。

```swift
// 注意：这是私有 API，不建议在生产代码中使用
// 可以通过 CGPath 相关方法获取路径信息
```

---

## 实用示例

### 1. 自定义视图绘制

#### 进度环视图
```swift
class CircularProgressView: UIView {
    var progress: CGFloat = 0 {
        didSet {
            setNeedsDisplay()
        }
    }
    
    var progressColor: UIColor = .blue
    var trackColor: UIColor = .lightGray
    var lineWidth: CGFloat = 8
    
    override func draw(_ rect: CGRect) {
        let center = CGPoint(x: bounds.midX, y: bounds.midY)
        let radius = (min(bounds.width, bounds.height) - lineWidth) / 2
        
        // 绘制背景轨道
        let trackPath = UIBezierPath(
            arcCenter: center,
            radius: radius,
            startAngle: -CGFloat.pi / 2,
            endAngle: 3 * CGFloat.pi / 2,
            clockwise: true
        )
        trackPath.lineWidth = lineWidth
        trackColor.setStroke()
        trackPath.stroke()
        
        // 绘制进度
        let progressPath = UIBezierPath(
            arcCenter: center,
            radius: radius,
            startAngle: -CGFloat.pi / 2,
            endAngle: -CGFloat.pi / 2 + 2 * CGFloat.pi * progress,
            clockwise: true
        )
        progressPath.lineWidth = lineWidth
        progressPath.lineCapStyle = .round
        progressColor.setStroke()
        progressPath.stroke()
    }
}

// 使用示例
let progressView = CircularProgressView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
progressView.progress = 0.75
progressView.progressColor = .blue
```

#### 波浪动画视图
```swift
class WaveView: UIView {
    private var waveHeight: CGFloat = 20
    private var waveLength: CGFloat = 100
    private var phase: CGFloat = 0
    
    private var displayLink: CADisplayLink?
    
    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        startAnimation()
    }
    
    func startAnimation() {
        displayLink = CADisplayLink(target: self, selector: #selector(updateWave))
        displayLink?.add(to: .current, forMode: .default)
    }
    
    @objc private func updateWave() {
        phase += 0.1
        setNeedsDisplay()
    }
    
    override func draw(_ rect: CGRect) {
        let path = UIBezierPath()
        
        // 起始点
        path.move(to: CGPoint(x: 0, y: bounds.midY))
        
        // 绘制波浪
        for x in stride(from: 0, through: bounds.width, by: 1) {
            let y = bounds.midY + sin((x / waveLength) * 2 * .pi + phase) * waveHeight
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        // 封闭路径
        path.addLine(to: CGPoint(x: bounds.width, y: bounds.height))
        path.addLine(to: CGPoint(x: 0, y: bounds.height))
        path.close()
        
        // 填充波浪
        UIColor.blue.withAlphaComponent(0.6).setFill()
        path.fill()
    }
    
    deinit {
        displayLink?.invalidate()
    }
}
```

### 2. 路径动画

#### 路径绘制动画
```swift
class PathAnimationView: UIView {
    private let path = UIBezierPath()
    private var shapeLayer: CAShapeLayer!
    
    override func layoutSubviews() {
        super.layoutSubviews()
        setupPath()
        setupLayer()
    }
    
    private func setupPath() {
        path.removeAllPoints()
        
        // 创建复杂路径
        path.move(to: CGPoint(x: 20, y: bounds.midY))
        
        // 添加波浪线
        for i in stride(from: 20, to: bounds.width - 20, by: 20) {
            let controlPoint1 = CGPoint(x: i + 10, y: bounds.midY - 30)
            let controlPoint2 = CGPoint(x: i + 10, y: bounds.midY + 30)
            let endPoint = CGPoint(x: i + 20, y: bounds.midY)
            
            path.addCurve(to: endPoint, controlPoint1: controlPoint1, controlPoint2: controlPoint2)
        }
    }
    
    private func setupLayer() {
        if shapeLayer == nil {
            shapeLayer = CAShapeLayer()
            layer.addSublayer(shapeLayer)
        }
        
        shapeLayer.path = path.cgPath
        shapeLayer.strokeColor = UIColor.blue.cgColor
        shapeLayer.fillColor = UIColor.clear.cgColor
        shapeLayer.lineWidth = 3
        shapeLayer.lineCap = .round
    }
    
    func animateDrawing() {
        let animation = CABasicAnimation(keyPath: "strokeEnd")
        animation.fromValue = 0
        animation.toValue = 1
        animation.duration = 2.0
        animation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        
        shapeLayer.add(animation, forKey: "drawPath")
    }
}
```

### 3. 交互式路径

#### 手势绘制路径
```swift
class DrawingView: UIView {
    private var currentPath: UIBezierPath?
    private var paths: [UIBezierPath] = []
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        
        currentPath = UIBezierPath()
        currentPath?.lineWidth = 3
        currentPath?.lineCapStyle = .round
        currentPath?.lineJoinStyle = .round
        currentPath?.move(to: point)
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first,
              let path = currentPath else { return }
        
        let point = touch.location(in: self)
        path.addLine(to: point)
        setNeedsDisplay()
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let path = currentPath else { return }
        paths.append(path)
        currentPath = nil
        setNeedsDisplay()
    }
    
    override func draw(_ rect: CGRect) {
        // 绘制所有完成的路径
        UIColor.black.setStroke()
        for path in paths {
            path.stroke()
        }
        
        // 绘制当前正在绘制的路径
        UIColor.blue.setStroke()
        currentPath?.stroke()
    }
    
    func clearDrawing() {
        paths.removeAll()
        currentPath = nil
        setNeedsDisplay()
    }
}
```

### 4. 高级路径操作

#### 路径裁剪和遮罩
```swift
class ClippingView: UIView {
    override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
        
        // 创建裁剪路径
        let clippingPath = UIBezierPath(ovalIn: CGRect(x: 50, y: 50, width: 100, height: 100))
        
        // 应用裁剪
        context.saveGState()
        clippingPath.addClip()
        
        // 在裁剪区域内绘制
        let gradientColors = [UIColor.red.cgColor, UIColor.blue.cgColor]
        let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(),
                                colors: gradientColors as CFArray,
                                locations: nil)!
        
        context.drawLinearGradient(gradient,
                                 start: CGPoint(x: 0, y: 0),
                                 end: CGPoint(x: bounds.width, y: bounds.height),
                                 options: [])
        
        context.restoreGState()
        
        // 绘制裁剪路径边框
        clippingPath.lineWidth = 3
        UIColor.black.setStroke()
        clippingPath.stroke()
    }
}
```

#### 路径变形动画
```swift
class MorphingPathView: UIView {
    private var shapeLayer: CAShapeLayer!
    private var isCircle = true
    
    override func layoutSubviews() {
        super.layoutSubviews()
        setupLayer()
    }
    
    private func setupLayer() {
        if shapeLayer == nil {
            shapeLayer = CAShapeLayer()
            layer.addSublayer(shapeLayer)
        }
        
        shapeLayer.fillColor = UIColor.blue.cgColor
        shapeLayer.strokeColor = UIColor.darkBlue.cgColor
        shapeLayer.lineWidth = 2
        
        updatePath()
    }
    
    private func updatePath() {
        let rect = CGRect(x: 20, y: 20, width: bounds.width - 40, height: bounds.height - 40)
        let path = isCircle ? UIBezierPath(ovalIn: rect) : UIBezierPath(rect: rect)
        shapeLayer.path = path.cgPath
    }
    
    func morphShape() {
        let rect = CGRect(x: 20, y: 20, width: bounds.width - 40, height: bounds.height - 40)
        let newPath = isCircle ? UIBezierPath(rect: rect) : UIBezierPath(ovalIn: rect)
        
        let animation = CABasicAnimation(keyPath: "path")
        animation.fromValue = shapeLayer.path
        animation.toValue = newPath.cgPath
        animation.duration = 0.8
        animation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        
        shapeLayer.add(animation, forKey: "morphPath")
        shapeLayer.path = newPath.cgPath
        
        isCircle.toggle()
    }
}
```

### 5. 复杂图形绘制

#### 图表绘制
```swift
class ChartView: UIView {
    var dataPoints: [CGFloat] = [30, 50, 80, 40, 70, 90, 60] {
        didSet {
            setNeedsDisplay()
        }
    }
    
    override func draw(_ rect: CGRect) {
        guard !dataPoints.isEmpty else { return }
        
        let margin: CGFloat = 20
        let chartWidth = bounds.width - 2 * margin
        let chartHeight = bounds.height - 2 * margin
        let maxValue = dataPoints.max() ?? 100
        
        // 绘制坐标轴
        drawAxes(margin: margin, chartWidth: chartWidth, chartHeight: chartHeight)
        
        // 绘制折线图
        drawLineChart(margin: margin, chartWidth: chartWidth, chartHeight: chartHeight, maxValue: maxValue)
        
        // 绘制数据点
        drawDataPoints(margin: margin, chartWidth: chartWidth, chartHeight: chartHeight, maxValue: maxValue)
    }
    
    private func drawAxes(margin: CGFloat, chartWidth: CGFloat, chartHeight: CGFloat) {
        let axesPath = UIBezierPath()
        
        // Y轴
        axesPath.move(to: CGPoint(x: margin, y: margin))
        axesPath.addLine(to: CGPoint(x: margin, y: margin + chartHeight))
        
        // X轴
        axesPath.addLine(to: CGPoint(x: margin + chartWidth, y: margin + chartHeight))
        
        axesPath.lineWidth = 2
        UIColor.black.setStroke()
        axesPath.stroke()
    }
    
    private func drawLineChart(margin: CGFloat, chartWidth: CGFloat, chartHeight: CGFloat, maxValue: CGFloat) {
        let linePath = UIBezierPath()
        let stepX = chartWidth / CGFloat(dataPoints.count - 1)
        
        for (index, value) in dataPoints.enumerated() {
            let x = margin + CGFloat(index) * stepX
            let y = margin + chartHeight - (value / maxValue) * chartHeight
            let point = CGPoint(x: x, y: y)
            
            if index == 0 {
                linePath.move(to: point)
            } else {
                linePath.addLine(to: point)
            }
        }
        
        linePath.lineWidth = 3
        linePath.lineCapStyle = .round
        linePath.lineJoinStyle = .round
        UIColor.blue.setStroke()
        linePath.stroke()
    }
    
    private func drawDataPoints(margin: CGFloat, chartWidth: CGFloat, chartHeight: CGFloat, maxValue: CGFloat) {
        let stepX = chartWidth / CGFloat(dataPoints.count - 1)
        
        for (index, value) in dataPoints.enumerated() {
            let x = margin + CGFloat(index) * stepX
            let y = margin + chartHeight - (value / maxValue) * chartHeight
            let point = CGPoint(x: x - 4, y: y - 4)
            
            let pointPath = UIBezierPath(ovalIn: CGRect(origin: point, size: CGSize(width: 8, height: 8)))
            UIColor.red.setFill()
            pointPath.fill()
            
            UIColor.white.setStroke()
            pointPath.lineWidth = 2
            pointPath.stroke()
        }
    }
}
```

#### 自定义按钮形状
```swift
class CustomShapeButton: UIButton {
    enum ButtonShape {
        case roundedRect(cornerRadius: CGFloat)
        case circle
        case hexagon
        case star(points: Int)
    }
    
    var buttonShape: ButtonShape = .roundedRect(cornerRadius: 8) {
        didSet {
            updateShape()
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        updateShape()
    }
    
    private func updateShape() {
        let path: UIBezierPath
        
        switch buttonShape {
        case .roundedRect(let cornerRadius):
            path = UIBezierPath(roundedRect: bounds, cornerRadius: cornerRadius)
            
        case .circle:
            path = UIBezierPath(ovalIn: bounds)
            
        case .hexagon:
            path = createPolygonPath(sides: 6)
            
        case .star(let points):
            path = createStarPath(points: points)
        }
        
        // 创建 mask layer
        let maskLayer = CAShapeLayer()
        maskLayer.path = path.cgPath
        layer.mask = maskLayer
        
        // 设置边框
        layer.borderWidth = 2
        layer.borderColor = tintColor.cgColor
    }
    
    private func createPolygonPath(sides: Int) -> UIBezierPath {
        let path = UIBezierPath()
        let center = CGPoint(x: bounds.midX, y: bounds.midY)
        let radius = min(bounds.width, bounds.height) / 2 - 2
        let angleStep = 2 * CGFloat.pi / CGFloat(sides)
        
        for i in 0..<sides {
            let angle = CGFloat(i) * angleStep - CGFloat.pi / 2
            let x = center.x + radius * cos(angle)
            let y = center.y + radius * sin(angle)
            let point = CGPoint(x: x, y: y)
            
            if i == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        
        path.close()
        return path
    }
    
    private func createStarPath(points: Int) -> UIBezierPath {
        let path = UIBezierPath()
        let center = CGPoint(x: bounds.midX, y: bounds.midY)
        let outerRadius = min(bounds.width, bounds.height) / 2 - 2
        let innerRadius = outerRadius * 0.5
        let angleStep = CGFloat.pi / CGFloat(points)
        
        for i in 0..<(points * 2) {
            let angle = CGFloat(i) * angleStep - CGFloat.pi / 2
            let radius = i % 2 == 0 ? outerRadius : innerRadius
            let x = center.x + radius * cos(angle)
            let y = center.y + radius * sin(angle)
            let point = CGPoint(x: x, y: y)
            
            if i == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        
        path.close()
        return path
    }
}

// 使用示例
let button = CustomShapeButton(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
button.buttonShape = .star(points: 5)
button.setTitle("★", for: .normal)
button.backgroundColor = .yellow
```

---

## 性能优化建议

### 1. 路径缓存
```swift
class OptimizedDrawingView: UIView {
    private var cachedPath: UIBezierPath?
    private var lastBounds: CGRect = .zero
    
    override func draw(_ rect: CGRect) {
        // 只在尺寸改变时重新创建路径
        if bounds != lastBounds || cachedPath == nil {
            cachedPath = createComplexPath()
            lastBounds = bounds
        }
        
        UIColor.blue.setFill()
        cachedPath?.fill()
    }
    
    private func createComplexPath() -> UIBezierPath {
        // 创建复杂路径的逻辑
        let path = UIBezierPath()
        // ... 复杂的路径创建代码
        return path
    }
}
```

### 2. 使用 CAShapeLayer 替代重绘
```swift
class PerformantShapeView: UIView {
    private let shapeLayer = CAShapeLayer()
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        if shapeLayer.superlayer == nil {
            layer.addSublayer(shapeLayer)
            setupShapeLayer()
        }
    }
    
    private func setupShapeLayer() {
        let path = UIBezierPath(ovalIn: bounds)
        shapeLayer.path = path.cgPath
        shapeLayer.fillColor = UIColor.blue.cgColor
        shapeLayer.strokeColor = UIColor.black.cgColor
        shapeLayer.lineWidth = 2
    }
    
    func updateColor(_ color: UIColor) {
        // 直接更新 layer 属性，无需重绘
        shapeLayer.fillColor = color.cgColor
    }
}
```

---

## 总结

UIBezierPath 提供了完整的 2D 路径创建和操作能力：

### 核心功能
1. **路径创建** - 支持直线、曲线、弧线等基本元素
2. **几何形状** - 内置常用形状的便捷构造器
3. **路径操作** - 变换、合并、反转等操作
4. **绘制渲染** - 填充、描边、虚线等渲染选项
5. **交互查询** - 边界检测、点包含检测等

### 高级特性
- **Core Graphics 集成** - 与底层图形 API 无缝集成
- **动画支持** - 路径变形和绘制动画
- **性能优化** - 支持硬件加速渲染
- **灵活扩展** - 可创建任意复杂的自定义图形

### 最佳实践
1. 合理使用路径缓存避免重复计算
2. 对于动画使用 CAShapeLayer 而非重绘
3. 复杂路径考虑分解为多个简单路径
4. 注意内存管理，避免创建过多临时路径对象

UIBezierPath 是 iOS 开发中实现自定义图形、动画效果和复杂 UI 的重要工具，掌握这些 API 可以创建出丰富多彩的用户界面。
        