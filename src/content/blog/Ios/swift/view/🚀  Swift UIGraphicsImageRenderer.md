---
title: "Swift UIGraphicsImageRenderer"
description: "UIGraphicsImageRenderer 是 iOS 10+ 中引入的现代图形渲染类，用于替代传统的 UIGraphicsBeginImageContext 系列函数。它提供了更高效、内存安全的图像渲染功能，支持广色域和自动处理..."
pubDate: 2026-05-29
category: "view"
tags: [iOS, Swift, Array, API]
draft: false
---
# 🚀  Swift UIGraphicsImageRenderer 完整 API 指南

## 概述

`UIGraphicsImageRenderer` 是 iOS 10+ 中引入的现代图形渲染类，用于替代传统的 `UIGraphicsBeginImageContext` 系列函数。它提供了更高效、内存安全的图像渲染功能，支持广色域和自动处理不同的设备分辨率。

## 核心类介绍

### UIGraphicsImageRenderer

主要的图像渲染器类，负责创建和管理图像绘制上下文。

### UIGraphicsImageRendererFormat

用于配置渲染器的格式设置类。

### UIGraphicsImageRendererContext

绘制上下文类，提供绘制操作的环境。

***

## UIGraphicsImageRenderer API

### 初始化方法

#### `init(size: CGSize)`

创建指定尺寸的图像渲染器。

```swift
let renderer = UIGraphicsImageRenderer(size: CGSize(width: 200, height: 200))
```

#### `init(size: CGSize, format: UIGraphicsImageRendererFormat)`

创建指定尺寸和格式的图像渲染器。

```swift
let format = UIGraphicsImageRendererFormat()
format.scale = 2.0
let renderer = UIGraphicsImageRenderer(size: CGSize(width: 200, height: 200), format: format)
```

#### `init(bounds: CGRect)`

根据边界矩形创建图像渲染器。

```swift
let bounds = CGRect(x: 0, y: 0, width: 200, height: 200)
let renderer = UIGraphicsImageRenderer(bounds: bounds)
```

#### `init(bounds: CGRect, format: UIGraphicsImageRendererFormat)`

根据边界矩形和格式创建图像渲染器。

```swift
let format = UIGraphicsImageRendererFormat()
let bounds = CGRect(x: 0, y: 0, width: 200, height: 200)
let renderer = UIGraphicsImageRenderer(bounds: bounds, format: format)
```

### 属性

#### `format: UIGraphicsImageRendererFormat` (只读)

获取渲染器使用的格式。

```swift
let format = renderer.format
print("Scale: \(format.scale)")
```

#### `allowsImageOutput: Bool` (只读)

指示渲染器是否允许图像输出。

```swift
if renderer.allowsImageOutput {
    // 可以进行图像渲染
}
```

### 图像生成方法

#### `image(actions: (UIGraphicsImageRendererContext) -> Void) -> UIImage`

执行绘制操作并返回生成的图像。

```swift
let image = renderer.image { context in
    // 绘制代码
    UIColor.red.setFill()
    context.fill(CGRect(x: 0, y: 0, width: 100, height: 100))
}
```

#### `pngData(actions: (UIGraphicsImageRendererContext) -> Void) -> Data`

执行绘制操作并返回 PNG 格式的数据。

```swift
let pngData = renderer.pngData { context in
    // 绘制代码
    UIColor.blue.setFill()
    context.fill(CGRect(x: 0, y: 0, width: 100, height: 100))
}
```

#### `jpegData(withCompressionQuality: CGFloat, actions: (UIGraphicsImageRendererContext) -> Void) -> Data`

执行绘制操作并返回 JPEG 格式的数据。

```swift
let jpegData = renderer.jpegData(withCompressionQuality: 0.8) { context in
    // 绘制代码
    UIColor.green.setFill()
    context.fill(CGRect(x: 0, y: 0, width: 100, height: 100))
}
```

***

## UIGraphicsImageRendererFormat API

### 类方法

#### `default() -> UIGraphicsImageRendererFormat`

返回默认格式。

```swift
let defaultFormat = UIGraphicsImageRendererFormat.default()
```

#### `preferred() -> UIGraphicsImageRendererFormat`

返回当前设备的首选格式。

```swift
let preferredFormat = UIGraphicsImageRendererFormat.preferred()
```

### 初始化方法

#### `init()`

创建默认格式实例。

```swift
let format = UIGraphicsImageRendererFormat()
```

#### `init(for traitCollection: UITraitCollection)`

根据特征集合创建格式。

```swift
let traitCollection = UITraitCollection(displayScale: 3.0)
let format = UIGraphicsImageRendererFormat(for: traitCollection)
```

### 属性

#### `scale: CGFloat`

设置或获取渲染比例。

```swift
format.scale = 2.0  // 设置为 2x 分辨率
```

#### `opaque: Bool`

设置或获取是否为不透明渲染。

```swift
format.opaque = true  // 不透明渲染，性能更好
```

#### `prefersExtendedRange: Bool`

设置或获取是否使用扩展颜色范围。

```swift
format.prefersExtendedRange = true  // 支持 P3 广色域
```

#### `preferredRange: UIGraphicsImageRendererFormat.Range` (只读)

获取首选的颜色范围。

```swift
let range = format.preferredRange
switch range {
case .automatic:
    print("自动选择")
case .extended:
    print("扩展颜色范围")
case .standard:
    print("标准颜色范围")
@unknown default:
    print("未知范围")
}
```

***

## UIGraphicsImageRendererContext API

### 属性

#### `cgContext: CGContext`

获取底层的 Core Graphics 上下文。

```swift
let cgContext = context.cgContext
cgContext.setLineCap(.round)
```

#### `format: UIGraphicsImageRendererFormat`

获取渲染格式。

```swift
let format = context.format
```

#### `currentImage: UIImage`

获取当前渲染的图像。

```swift
let currentImage = context.currentImage
```

### 绘制方法

#### `fill(_: CGRect)`

填充指定矩形区域。

```swift
context.fill(CGRect(x: 10, y: 10, width: 50, height: 50))
```

#### `fill(_: CGRect, blendMode: CGBlendMode)`

使用指定混合模式填充矩形。

```swift
context.fill(CGRect(x: 10, y: 10, width: 50, height: 50), blendMode: .multiply)
```

#### `stroke(_: CGRect)`

描边指定矩形。

```swift
context.stroke(CGRect(x: 10, y: 10, width: 50, height: 50))
```

#### `stroke(_: CGRect, blendMode: CGBlendMode)`

使用指定混合模式描边矩形。

```swift
context.stroke(CGRect(x: 10, y: 10, width: 50, height: 50), blendMode: .overlay)
```

#### `clip(to: CGRect)`

设置裁剪区域。

```swift
context.clip(to: CGRect(x: 0, y: 0, width: 100, height: 100))
```

***

## 实际应用示例

### 基础绘制示例

```swift
func createSimpleImage() -> UIImage {
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 200, height: 200))
    
    let image = renderer.image { context in
        // 设置背景色
        UIColor.lightGray.setFill()
        context.fill(CGRect(x: 0, y: 0, width: 200, height: 200))
        
        // 绘制红色圆形
        UIColor.red.setFill()
        let circleRect = CGRect(x: 50, y: 50, width: 100, height: 100)
        context.cgContext.fillEllipse(in: circleRect)
        
        // 绘制蓝色边框
        UIColor.blue.setStroke()
        context.cgContext.setLineWidth(3.0)
        context.stroke(CGRect(x: 25, y: 25, width: 150, height: 150))
    }
    
    return image
}
```

### 高级绘制示例

```swift
func createGradientImage() -> UIImage {
    let format = UIGraphicsImageRendererFormat()
    format.scale = 0  // 使用设备原生分辨率
    format.opaque = false
    
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 300, height: 200), format: format)
    
    let image = renderer.image { context in
        let cgContext = context.cgContext
        
        // 创建渐变
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let colors = [UIColor.red.cgColor, UIColor.blue.cgColor]
        let gradient = CGGradient(colorsSpace: colorSpace, colors: colors as CFArray, locations: nil)!
        
        // 绘制线性渐变
        cgContext.drawLinearGradient(gradient, 
                                   start: CGPoint(x: 0, y: 0), 
                                   end: CGPoint(x: 300, y: 200), 
                                   options: [])
        
        // 添加文本
        let text = "Hello, UIGraphicsImageRenderer!"
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.systemFont(ofSize: 20),
            .foregroundColor: UIColor.white
        ]
        
        let textSize = text.size(withAttributes: attributes)
        let textRect = CGRect(x: (300 - textSize.width) / 2, 
                            y: (200 - textSize.height) / 2, 
                            width: textSize.width, 
                            height: textSize.height)
        
        text.draw(in: textRect, withAttributes: attributes)
    }
    
    return image
}
```

### 图像合成示例

```swift
func combineImages(_ image1: UIImage, _ image2: UIImage) -> UIImage {
    let size = CGSize(width: max(image1.size.width, image2.size.width),
                     height: max(image1.size.height, image2.size.height))
    
    let renderer = UIGraphicsImageRenderer(size: size)
    
    let combinedImage = renderer.image { context in
        // 绘制第一张图片
        image1.draw(at: .zero)
        
        // 使用混合模式绘制第二张图片
        image2.draw(at: CGPoint(x: 50, y: 50), blendMode: .multiply, alpha: 0.7)
    }
    
    return combinedImage
}
```

### 生成数据格式示例

```swift
func generateImageData() {
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 100, height: 100))
    
    // 生成 PNG 数据
    let pngData = renderer.pngData { context in
        UIColor.red.setFill()
        context.fill(CGRect(x: 0, y: 0, width: 100, height: 100))
    }
    
    // 生成 JPEG 数据
    let jpegData = renderer.jpegData(withCompressionQuality: 0.8) { context in
        UIColor.blue.setFill()
        context.fill(CGRect(x: 0, y: 0, width: 100, height: 100))
    }
    
    // 保存到文件
    let documentsPath = FileManager.default.urls(for: .documentDirectory, 
                                               in: .userDomainMask)[0]
    
    try? pngData.write(to: documentsPath.appendingPathComponent("image.png"))
    try? jpegData.write(to: documentsPath.appendingPathComponent("image.jpg"))
}
```

***

## 最佳实践

### 1. 选择合适的格式

```swift
// 对于不透明图像，设置 opaque = true 以提高性能
let format = UIGraphicsImageRendererFormat()
format.opaque = true

// 对于需要广色域的图像
format.prefersExtendedRange = true
```

### 2. 合理设置分辨率

```swift
// 使用设备原生分辨率
format.scale = 0

// 或明确指定分辨率
format.scale = UIScreen.main.scale
```

### 3. 内存管理

```swift
// 对于大图像，考虑分块处理
func processLargeImage() {
    autoreleasepool {
        let renderer = UIGraphicsImageRenderer(size: largeSize)
        let image = renderer.image { context in
            // 绘制操作
        }
        // 使用图像
    }
}
```

### 4. 错误处理

```swift
func safeImageGeneration() -> UIImage? {
    guard UIGraphicsImageRenderer.allowsImageOutput else {
        print("图像输出不被允许")
        return nil
    }
    
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 100, height: 100))
    return renderer.image { context in
        // 绘制操作
    }
}
```

***

## 与传统 API 的对比

### 传统方式 (已废弃)

```swift
UIGraphicsBeginImageContextWithOptions(size, false, 0)
// 绘制代码
let image = UIGraphicsGetImageFromCurrentImageContext()
UIGraphicsEndImageContext()
```

### 现代方式 (推荐)

```swift
let renderer = UIGraphicsImageRenderer(size: size)
let image = renderer.image { context in
    // 绘制代码
}
```

## 总结

`UIGraphicsImageRenderer` 提供了现代、高效的图像渲染解决方案，具有以下优势：

*   **自动内存管理**：无需手动管理图像上下文
*   **设备适配**：自动处理不同设备的分辨率
*   **广色域支持**：支持 P3 等广色域显示
*   **更好的性能**：优化的渲染流程
*   **类型安全**：Swift 原生 API，减少错误

建议在所有新项目中使用 `UIGraphicsImageRenderer` 替代传统的 `UIGraphicsBeginImageContext` 系列函数。
