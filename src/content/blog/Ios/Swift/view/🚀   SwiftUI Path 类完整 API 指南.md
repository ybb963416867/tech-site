---
title: "SwiftUI Path 类完整 API 指南"
description: "SwiftUI 的 Path 结构体用于创建自定义的矢量图形路径。它提供了一系列方法来构建复杂的形状和线条，可以用于绘制自定义图形、创建动画效果或实现复杂的 UI 元素。"
pubDate: 2026-05-29
category: "view"
tags: [Swift, API]
draft: false
---
# 🚀   SwiftUI Path 类完整 API 指南

## 概述

SwiftUI 的 `Path` 结构体用于创建自定义的矢量图形路径。它提供了一系列方法来构建复杂的形状和线条，可以用于绘制自定义图形、创建动画效果或实现复杂的 UI 元素。

## 初始化方法

### `Path()`

创建一个空的路径。

```swift
let emptyPath = Path()
```

### `Path(_ rect: CGRect)`

创建一个矩形路径。

**参数：**

- `rect`: 矩形的边界框

```swift
let rectPath = Path(CGRect(x: 0, y: 0, width: 100, height: 100))
```

### `Path(_ ellipse: CGRect)`

创建一个椭圆路径。

**参数：**

- `ellipse`: 椭圆的边界框

```swift
let ellipsePath = Path(ellipseIn: CGRect(x: 0, y: 0, width: 100, height: 50))
```

### `Path(_ roundedRect: CGRect, cornerRadius: CGFloat)`

创建一个圆角矩形路径。

**参数：**

- `roundedRect`: 矩形的边界框
- `cornerRadius`: 圆角半径

```swift
let roundedPath = Path(roundedRect: CGRect(x: 0, y: 0, width: 100, height: 100), 
                      cornerRadius: 10)
```

### `Path(_ roundedRect: CGRect, cornerSize: CGSize)`

创建一个具有不同 x、y 圆角半径的矩形路径。

**参数：**

- `roundedRect`: 矩形的边界框
- `cornerSize`: 圆角的尺寸（宽度和高度）

```swift
let customRoundedPath = Path(roundedRect: CGRect(x: 0, y: 0, width: 100, height: 100), 
                            cornerSize: CGSize(width: 15, height: 8))
```

## 基本绘制方法

### `move(to point: CGPoint)`

将当前点移动到指定位置，不绘制线条。

**参数：**

- `point`: 目标位置

```swift
var path = Path()
path.move(to: CGPoint(x: 50, y: 50))
```

### `addLine(to point: CGPoint)`

从当前点绘制直线到指定点。

**参数：**

- `point`: 直线的终点

```swift
var path = Path()
path.move(to: CGPoint(x: 0, y: 0))
path.addLine(to: CGPoint(x: 100, y: 100))
```

### `addLines(_ points: [CGPoint])`

添加一系列连续的直线段。

**参数：**

- `points`: 直线段的端点数组

```swift
var path = Path()
path.move(to: CGPoint(x: 0, y: 0))
path.addLines([
    CGPoint(x: 50, y: 100),
    CGPoint(x: 100, y: 50),
    CGPoint(x: 150, y: 150)
])
```

## 曲线绘制方法

### `addQuadCurve(to end: CGPoint, control: CGPoint)`

添加二次贝塞尔曲线。

**参数：**

- `end`: 曲线的终点
- `control`: 控制点

```swift
var path = Path()
path.move(to: CGPoint(x: 0, y: 100))
path.addQuadCurve(to: CGPoint(x: 200, y: 100), 
                  control: CGPoint(x: 100, y: 0))
```

### `addCurve(to end: CGPoint, control1: CGPoint, control2: CGPoint)`

添加三次贝塞尔曲线。

**参数：**

- `end`: 曲线的终点
- `control1`: 第一个控制点
- `control2`: 第二个控制点

```swift
var path = Path()
path.move(to: CGPoint(x: 0, y: 100))
path.addCurve(to: CGPoint(x: 200, y: 100),
              control1: CGPoint(x: 50, y: 0),
              control2: CGPoint(x: 150, y: 200))
```

## 几何图形方法

### `addRect(_ rect: CGRect)`

添加矩形到路径。

**参数：**

- `rect`: 矩形的边界框

```swift
var path = Path()
path.addRect(CGRect(x: 10, y: 10, width: 80, height: 60))
```

### `addRoundedRect(in rect: CGRect, cornerSize: CGSize)`

添加圆角矩形到路径。

**参数：**

- `rect`: 矩形的边界框
- `cornerSize`: 圆角的尺寸

```swift
var path = Path()
path.addRoundedRect(in: CGRect(x: 0, y: 0, width: 100, height: 100),
                    cornerSize: CGSize(width: 10, height: 10))
```

### `addEllipse(in rect: CGRect)`

添加椭圆到路径。

**参数：**

- `rect`: 椭圆的边界框

```swift
var path = Path()
path.addEllipse(in: CGRect(x: 0, y: 0, width: 100, height: 50))
```

## 弧线绘制方法

### `addArc(center: CGPoint, radius: CGFloat, startAngle: Angle, endAngle: Angle, clockwise: Bool)`

添加圆弧到路径。

**参数：**

- `center`: 圆弧的中心点
- `radius`: 圆弧的半径
- `startAngle`: 起始角度
- `endAngle`: 结束角度
- `clockwise`: 是否顺时针方向

```swift
var path = Path()
path.addArc(center: CGPoint(x: 100, y: 100),
            radius: 50,
            startAngle: .degrees(0),
            endAngle: .degrees(90),
            clockwise: false)
```

### `addArc(tangent1End: CGPoint, tangent2End: CGPoint, radius: CGFloat)`

添加与两条切线相切的圆弧。

**参数：**

- `tangent1End`: 第一条切线的终点
- `tangent2End`: 第二条切线的终点
- `radius`: 圆弧的半径

```swift
var path = Path()
path.move(to: CGPoint(x: 0, y: 100))
path.addArc(tangent1End: CGPoint(x: 100, y: 100),
            tangent2End: CGPoint(x: 100, y: 0),
            radius: 20)
```

## 路径操作方法

### `addPath(_ path: Path)`

将另一个路径添加到当前路径。

**参数：**

- `path`: 要添加的路径

```swift
var mainPath = Path()
mainPath.addRect(CGRect(x: 0, y: 0, width: 50, height: 50))

var secondPath = Path()
secondPath.addEllipse(in: CGRect(x: 60, y: 0, width: 50, height: 50))

mainPath.addPath(secondPath)
```

### `closeSubpath()`

关闭当前子路径，从当前点绘制直线到子路径的起始点。

```swift
var path = Path()
path.move(to: CGPoint(x: 50, y: 0))
path.addLine(to: CGPoint(x: 100, y: 50))
path.addLine(to: CGPoint(x: 0, y: 50))
path.closeSubpath() // 形成三角形
```

## 路径变换方法

### `applying(_ transform: CGAffineTransform)`

对路径应用仿射变换，返回新的路径。

**参数：**

- `transform`: 要应用的仿射变换

```swift
var path = Path()
path.addRect(CGRect(x: 0, y: 0, width: 50, height: 50))

let scaledPath = path.applying(CGAffineTransform(scaleX: 2, y: 2))
```

### `offsetBy(dx: CGFloat, dy: CGFloat)`

创建一个偏移的路径副本。

**参数：**

- `dx`: X 轴偏移量
- `dy`: Y 轴偏移量

```swift
var path = Path()
path.addEllipse(in: CGRect(x: 0, y: 0, width: 50, height: 50))

let offsetPath = path.offsetBy(dx: 100, dy: 50)
```

## 路径信息属性

### `isEmpty: Bool`

检查路径是否为空。

```swift
let path = Path()
print(path.isEmpty) // true
```

### `boundingRect: CGRect`

获取路径的边界矩形。

```swift
var path = Path()
path.addEllipse(in: CGRect(x: 10, y: 10, width: 80, height: 60))
let bounds = path.boundingRect
```

### `currentPoint: CGPoint?`

获取路径的当前点位置。

```swift
var path = Path()
path.move(to: CGPoint(x: 50, y: 50))
print(path.currentPoint) // Optional(CGPoint(50, 50))
```

## 路径检测方法

### `contains(_ point: CGPoint, eoFill: Bool = false)`

检查指定点是否在路径内部。

**参数：**

- `point`: 要检查的点
- `eoFill`: 是否使用奇偶填充规则

```swift
var path = Path()
path.addEllipse(in: CGRect(x: 0, y: 0, width: 100, height: 100))
let isInside = path.contains(CGPoint(x: 50, y: 50))
```

### `strokedPath(_ style: StrokeStyle)`

创建路径的描边路径。

**参数：**

- `style`: 描边样式

```swift
var path = Path()
path.addEllipse(in: CGRect(x: 0, y: 0, width: 100, height: 100))

let strokeStyle = StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round)
let strokedPath = path.strokedPath(strokeStyle)
```

## 实际应用示例

### 创建自定义形状

```swift
struct CustomShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // 创建一个心形
        let width = rect.width
        let height = rect.height
        
        path.move(to: CGPoint(x: width * 0.5, y: height * 0.25))
        
        path.addCurve(to: CGPoint(x: width * 0.1, y: height * 0.25),
                      control1: CGPoint(x: width * 0.5, y: height * 0.15),
                      control2: CGPoint(x: width * 0.1, y: height * 0.15))
        
        path.addArc(center: CGPoint(x: width * 0.1, y: height * 0.35),
                    radius: height * 0.1,
                    startAngle: .degrees(180),
                    endAngle: .degrees(0),
                    clockwise: false)
        
        path.addCurve(to: CGPoint(x: width * 0.5, y: height * 0.9),
                      control1: CGPoint(x: width * 0.1, y: height * 0.55),
                      control2: CGPoint(x: width * 0.5, y: height * 0.75))
        
        path.addCurve(to: CGPoint(x: width * 0.9, y: height * 0.45),
                      control1: CGPoint(x: width * 0.5, y: height * 0.75),
                      control2: CGPoint(x: width * 0.9, y: height * 0.55))
        
        path.addArc(center: CGPoint(x: width * 0.9, y: height * 0.35),
                    radius: height * 0.1,
                    startAngle: .degrees(0),
                    endAngle: .degrees(180),
                    clockwise: false)
        
        path.closeSubpath()
        
        return path
    }
}
```

### 动画路径示例

```swift
struct AnimatedPath: View {
    @State private var animationProgress: CGFloat = 0
    
    var body: some View {
        Canvas { context, size in
            var path = Path()
            path.move(to: CGPoint(x: 0, y: size.height / 2))
            
            for i in 0...Int(size.width) {
                let x = CGFloat(i)
                let y = size.height/2 + sin(x * 0.02 + animationProgress) * 50
                path.addLine(to: CGPoint(x: x, y: y))
            }
            
            context.stroke(path, with: .color(.blue), lineWidth: 3)
        }
        .onAppear {
            withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                animationProgress = .pi * 2
            }
        }
    }
}
```

### 复杂路径组合

```swift
struct ComplexPath: View {
    var body: some View {
        Canvas { context, size in
            // 主路径
            var mainPath = Path()
            mainPath.addRect(CGRect(x: 50, y: 50, width: 100, height: 100))
            
            // 圆形路径
            var circlePath = Path()
            circlePath.addEllipse(in: CGRect(x: 75, y: 75, width: 50, height: 50))
            
            // 组合路径
            mainPath.addPath(circlePath)
            
            // 应用变换
            let rotatedPath = mainPath.applying(
                CGAffineTransform(rotationAngle: .pi / 4)
            )
            
            context.fill(rotatedPath, with: .color(.red.opacity(0.7)))
            context.stroke(rotatedPath, with: .color(.black), lineWidth: 2)
        }
        .frame(width: 300, height: 300)
    }
}
```

## 注意事项

1. **性能考虑**: 复杂的路径计算可能影响性能，特别是在动画中
2. **坐标系统**: SwiftUI 使用左上角为原点的坐标系统
3. **路径复用**: 可以将复杂路径缓存以提高性能
4. **内存管理**: 大量的路径对象可能消耗较多内存
5. **精度问题**: 浮点数计算可能存在精度误差

## 总结

SwiftUI 的 Path API 提供了强大而灵活的矢量图形绘制能力。通过组合使用这些方法，可以创建复杂的自定义形状、动画效果和交互式图形界面。掌握这些 API 将大大增强你在 SwiftUI 中创建自定义视觉效果的能力。

