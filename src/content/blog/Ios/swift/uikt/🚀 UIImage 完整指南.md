---
title: "UIImage 完整指南"
description: "1. 内存管理：大图像使用 init(contentsOfFile:) 避免缓存 2. 性能优化：在后台队列进行图像处理操作 3. 格式选择：PNG 用于透明图像，JPEG 用于照片 4. 缓存策略：合理使用图像缓存避免内存压力 5...."
pubDate: 2026-05-29
category: "uikt"
tags: [iOS, Swift, Array, API]
draft: false
---
# 🚀 UIImage 完整指南

## 概述
UIImage 是 UIKit 框架中用于表示图像数据的核心类，提供了图像的创建、处理、渲染和操作等功能。

## 类层次结构
```
NSObject
└── UIImage
```

## 初始化方法

### 1. 基础初始化

```swift
// 从应用包中加载图像
init?(named name: String)
init?(named name: String, in bundle: Bundle?, compatibleWith traitCollection: UITraitCollection?)

// 从文件路径创建
init?(contentsOfFile path: String)

// 从数据创建
init?(data: Data)
init?(data: Data, scale: CGFloat)

// 从 CGImage 创建
init(cgImage: CGImage)
init(cgImage: CGImage, scale: CGFloat, orientation: UIImage.Orientation)

// 从 CIImage 创建
init(ciImage: CIImage)
init(ciImage: CIImage, scale: CGFloat, orientation: UIImage.Orientation)
```

### 2. 系统图标 (iOS 13+)

```swift
// SF Symbols
init?(systemName: String)
init?(systemName: String, withConfiguration configuration: UIImage.Configuration?)

// 示例
let heartIcon = UIImage(systemName: "heart.fill")
let starIcon = UIImage(systemName: "star", withConfiguration: UIImage.SymbolConfiguration(pointSize: 24))
```

### 3. 空白和纯色图像

```swift
// 创建空白图像
extension UIImage {
    static func blank(size: CGSize, color: UIColor = .clear) -> UIImage {
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        defer { UIGraphicsEndImageContext() }
        
        color.setFill()
        UIRectFill(CGRect(origin: .zero, size: size))
        
        return UIGraphicsGetImageFromCurrentImageContext() ?? UIImage()
    }
}
```

## 核心属性

### 1. 基本属性

```swift
// 图像尺寸 (点)
var size: CGSize { get }

// 缩放比例
var scale: CGFloat { get }

// 图像方向
var orientation: UIImage.Orientation { get }

// 图像配置 (iOS 13+)
var configuration: UIImage.Configuration? { get }

// 持续时间 (动画图像)
var duration: TimeInterval { get }

// 图像数组 (动画图像)
var images: [UIImage]? { get }
```

### 2. 底层图像数据

```swift
// CGImage 表示
var cgImage: CGImage? { get }

// CIImage 表示
var ciImage: CIImage? { get }

// 图像资产信息 (iOS 9+)
var imageAsset: UIImageAsset? { get }

// 图像渲染模式
var imageRendererFormat: UIGraphicsImageRendererFormat { get }
```

### 3. 渲染和显示属性

```swift
// 渲染模式
var renderingMode: UIImage.RenderingMode { get }

// 调整大小模式 (iOS 6+)
var resizingMode: UIImage.ResizingMode { get }

// 边缘插入 (用于可拉伸图像)
var capInsets: UIEdgeInsets { get }

// 对齐矩形插入
var alignmentRectInsets: UIEdgeInsets { get }

// 基线偏移 (iOS 14+)
var baselineOffsetFromBottom: CGFloat { get }

// 是否有 Alpha 通道
var hasAlpha: Bool { get }
```

## 图像方向

```swift
enum UIImage.Orientation : Int {
    case up            // 正常方向
    case down          // 180度旋转
    case left          // 逆时针90度
    case right         // 顺时针90度
    case upMirrored    // 水平翻转
    case downMirrored  // 垂直翻转 + 水平翻转
    case leftMirrored  // 逆时针90度 + 垂直翻转
    case rightMirrored // 顺时针90度 + 垂直翻转
}
```

## 渲染模式

```swift
enum UIImage.RenderingMode : Int {
    case automatic          // 自动模式
    case alwaysOriginal     // 始终显示原始图像
    case alwaysTemplate     // 始终作为模板图像 (单色)
}

// 设置渲染模式
let templateImage = originalImage.withRenderingMode(.alwaysTemplate)
```

## 调整大小模式

```swift
enum UIImage.ResizingMode : Int {
    case tile      // 平铺
    case stretch   // 拉伸
}

// 创建可拉伸图像
let stretchableImage = image.stretchableImage(withLeftCapWidth: 10, topCapHeight: 10)
let resizableImage = image.resizableImage(withCapInsets: UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10))
```

## 图像配置 (iOS 13+)

### 1. 符号配置

```swift
// 符号配置
class UIImage.SymbolConfiguration {
    // 点大小
    init(pointSize: CGFloat)
    init(pointSize: CGFloat, weight: UIImage.SymbolWeight)
    init(pointSize: CGFloat, weight: UIImage.SymbolWeight, scale: UIImage.SymbolScale)
    
    // 文本样式
    init(textStyle: UIFont.TextStyle)
    init(textStyle: UIFont.TextStyle, scale: UIImage.SymbolScale)
    
    // 权重和缩放
    init(weight: UIImage.SymbolWeight)
    init(scale: UIImage.SymbolScale)
    
    // 字体
    init(font: UIFont)
    init(font: UIFont, scale: UIImage.SymbolScale)
}

// 符号权重
enum UIImage.SymbolWeight {
    case ultraLight, thin, light, regular, medium, semibold, bold, heavy, black
}

// 符号缩放
enum UIImage.SymbolScale {
    case small, medium, large
}
```

### 2. 配置示例

```swift
// 不同配置的系统图标
let smallIcon = UIImage(systemName: "heart.fill", withConfiguration: UIImage.SymbolConfiguration(scale: .small))
let largeIcon = UIImage(systemName: "heart.fill", withConfiguration: UIImage.SymbolConfiguration(pointSize: 30, weight: .bold))
let textStyleIcon = UIImage(systemName: "star", withConfiguration: UIImage.SymbolConfiguration(textStyle: .title1))
```

## 图像处理方法

### 1. 图像变换

```swift
// 应用配置
func withConfiguration(_ configuration: UIImage.Configuration) -> UIImage

// 渲染模式
func withRenderingMode(_ renderingMode: UIImage.RenderingMode) -> UIImage

// 色调颜色 (iOS 13+)
func withTintColor(_ color: UIColor) -> UIImage
func withTintColor(_ color: UIColor, renderingMode: UIImage.RenderingMode) -> UIImage

// 水平翻转
func withHorizontallyFlippedOrientation() -> UIImage

// 对齐矩形插入
func withAlignmentRectInsets(_ alignmentInsets: UIEdgeInsets) -> UIImage

// 基线偏移 (iOS 14+)
func withBaselineOffset(fromBottom baselineOffset: CGFloat) -> UIImage
```

### 2. 图像调整大小

```swift
// 可拉伸图像
func stretchableImage(withLeftCapWidth leftCapWidth: Int, topCapHeight topCapHeight: Int) -> UIImage
func resizableImage(withCapInsets capInsets: UIEdgeInsets) -> UIImage
func resizableImage(withCapInsets capInsets: UIEdgeInsets, resizingMode: UIImage.ResizingMode) -> UIImage

// 自定义调整大小
extension UIImage {
    func resized(to size: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            self.draw(in: CGRect(origin: .zero, size: size))
        }
    }
    
    func aspectFitResized(to size: CGSize) -> UIImage {
        let aspectRatio = self.size.width / self.size.height
        let targetAspectRatio = size.width / size.height
        
        var newSize = size
        if aspectRatio > targetAspectRatio {
            newSize.height = size.width / aspectRatio
        } else {
            newSize.width = size.height * aspectRatio
        }
        
        return resized(to: newSize)
    }
}
```

### 3. 图像绘制

```swift
// 在指定矩形中绘制
func draw(in rect: CGRect)
func draw(in rect: CGRect, blendMode: CGBlendMode, alpha: CGFloat)

// 在指定点绘制
func draw(at point: CGPoint)
func draw(at point: CGPoint, blendMode: CGBlendMode, alpha: CGFloat)

// 绘制平铺图案
func drawAsPattern(in rect: CGRect)
```

## 动画图像

### 1. 创建动画图像

```swift
// 从图像数组创建
class func animatedImage(with images: [UIImage], duration: TimeInterval) -> UIImage?

// 从 GIF 数据创建
extension UIImage {
    static func animatedImageWithGIF(data: Data) -> UIImage? {
        guard let source = CGImageSourceCreateWithData(data, nil) else { return nil }
        return animatedImageWithSource(source)
    }
    
    private static func animatedImageWithSource(_ source: CGImageSource) -> UIImage? {
        let count = CGImageSourceGetCount(source)
        var images: [UIImage] = []
        var duration: TimeInterval = 0
        
        for i in 0..<count {
            guard let cgImage = CGImageSourceCreateImageAtIndex(source, i, nil) else { continue }
            let image = UIImage(cgImage: cgImage)
            images.append(image)
            
            // 获取帧持续时间
            let delayTime = getFrameDelay(from: source, at: i)
            duration += delayTime
        }
        
        return UIImage.animatedImage(with: images, duration: duration)
    }
    
    private static func getFrameDelay(from source: CGImageSource, at index: Int) -> TimeInterval {
        guard let properties = CGImageSourceCopyPropertiesAtIndex(source, index, nil) as? [String: Any] else { return 0.1 }
        
        if let gifProperties = properties[kCGImagePropertyGIFDictionary as String] as? [String: Any] {
            if let delayTime = gifProperties[kCGImagePropertyGIFDelayTime as String] as? NSNumber {
                return delayTime.doubleValue
            }
        }
        
        return 0.1
    }
}
```

### 2. 动画属性

```swift
// 动画帧数组
var images: [UIImage]? { get }

// 动画总时长
var duration: TimeInterval { get }

// 检查是否为动画图像
var isAnimated: Bool {
    return images != nil && !images!.isEmpty
}
```

## 图像资产 (iOS 9+)

```swift
// 图像资产
class UIImageAsset {
    // 注册图像
    func register(_ image: UIImage, with traitCollection: UITraitCollection)
    
    // 获取图像
    func image(with traitCollection: UITraitCollection) -> UIImage
    
    // 注销图像
    func unregister(imageWith traitCollection: UITraitCollection)
}

// 使用示例
let asset = UIImageAsset()
asset.register(lightImage, with: UITraitCollection(userInterfaceStyle: .light))
asset.register(darkImage, with: UITraitCollection(userInterfaceStyle: .dark))
```

## 图像缓存

### 1. 系统缓存

```swift
// UIImage.init(named:) 自动缓存
// 大图像建议使用 init(contentsOfFile:) 避免缓存

// 检查图像是否被缓存
extension UIImage {
    static func isCached(named name: String) -> Bool {
        return UIImage(named: name) != nil
    }
}
```

### 2. 自定义缓存

```swift
class ImageCache {
    private let cache = NSCache<NSString, UIImage>()
    
    func setImage(_ image: UIImage, forKey key: String) {
        cache.setObject(image, forKey: key as NSString)
    }
    
    func image(forKey key: String) -> UIImage? {
        return cache.object(forKey: key as NSString)
    }
    
    func removeImage(forKey key: String) {
        cache.removeObject(forKey: key as NSString)
    }
    
    func clearCache() {
        cache.removeAllObjects()
    }
}
```

## 图像压缩和格式转换

### 1. JPEG 压缩

```swift
extension UIImage {
    func jpegData(compressionQuality: CGFloat = 0.8) -> Data? {
        return self.jpegData(compressionQuality: compressionQuality)
    }
    
    func compressedJPEG(quality: CGFloat = 0.8) -> UIImage? {
        guard let data = jpegData(compressionQuality: quality) else { return nil }
        return UIImage(data: data)
    }
}
```

### 2. PNG 数据

```swift
extension UIImage {
    func pngData() -> Data? {
        return self.pngData()
    }
}
```

### 3. WebP 支持 (需要第三方库)

```swift
// 需要集成 WebP 库
extension UIImage {
    static func fromWebP(data: Data) -> UIImage? {
        // WebP 解码实现
        return nil
    }
    
    func webPData() -> Data? {
        // WebP 编码实现
        return nil
    }
}
```

## 图像效果和滤镜

### 1. Core Image 滤镜

```swift
extension UIImage {
    func applyFilter(name: String, parameters: [String: Any]? = nil) -> UIImage? {
        guard let ciImage = CIImage(image: self) else { return nil }
        guard let filter = CIFilter(name: name) else { return nil }
        
        filter.setValue(ciImage, forKey: kCIInputImageKey)
        parameters?.forEach { key, value in
            filter.setValue(value, forKey: key)
        }
        
        guard let outputImage = filter.outputImage else { return nil }
        
        let context = CIContext()
        guard let cgImage = context.createCGImage(outputImage, from: outputImage.extent) else { return nil }
        
        return UIImage(cgImage: cgImage)
    }
    
    // 常用滤镜
    func blurred(radius: CGFloat = 10) -> UIImage? {
        return applyFilter(name: "CIGaussianBlur", parameters: [kCIInputRadiusKey: radius])
    }
    
    func sepia() -> UIImage? {
        return applyFilter(name: "CISepiaTone", parameters: [kCIInputIntensityKey: 0.8])
    }
    
    func noir() -> UIImage? {
        return applyFilter(name: "CIPhotoEffectNoir")
    }
}
```

### 2. 颜色调整

```swift
extension UIImage {
    func tinted(with color: UIColor) -> UIImage? {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            color.set()
            self.draw(in: CGRect(origin: .zero, size: size))
            context.cgContext.setBlendMode(.sourceAtop)
            context.fill(CGRect(origin: .zero, size: size))
        }
    }
    
    func grayscale() -> UIImage? {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            let rect = CGRect(origin: .zero, size: size)
            self.draw(in: rect)
            
            if let cgImage = UIGraphicsGetImageFromCurrentImageContext()?.cgImage {
                let colorSpace = CGColorSpaceCreateDeviceGray()
                let context = CGContext(data: nil, width: Int(size.width), height: Int(size.height), bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: CGImageAlphaInfo.none.rawValue)
                
                context?.draw(cgImage, in: rect)
                if let grayImage = context?.makeImage() {
                    return UIImage(cgImage: grayImage)
                }
            }
            return self
        }
    }
}
```

## 图像元数据

### 1. EXIF 信息

```swift
extension UIImage {
    var exifData: [String: Any]? {
        guard let cgImage = self.cgImage,
              let data = UIImage.jpegData(self)(compressionQuality: 1.0),
              let source = CGImageSourceCreateWithData(data, nil),
              let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [String: Any] else {
            return nil
        }
        return properties
    }
    
    var gpsInfo: [String: Any]? {
        return exifData?[kCGImagePropertyGPSDictionary as String] as? [String: Any]
    }
    
    var cameraInfo: [String: Any]? {
        return exifData?[kCGImagePropertyExifDictionary as String] as? [String: Any]
    }
}
```

### 2. 图像信息

```swift
extension UIImage {
    var pixelSize: CGSize {
        guard let cgImage = self.cgImage else { return .zero }
        return CGSize(width: cgImage.width, height: cgImage.height)
    }
    
    var aspectRatio: CGFloat {
        return size.width / size.height
    }
    
    var isLandscape: Bool {
        return size.width > size.height
    }
    
    var isPortrait: Bool {
        return size.height > size.width
    }
    
    var isSquare: Bool {
        return size.width == size.height
    }
}
```

## 性能优化

### 1. 图像预加载

```swift
class ImagePreloader {
    private var loadedImages: [String: UIImage] = [:]
    
    func preloadImages(names: [String], completion: @escaping () -> Void) {
        let group = DispatchGroup()
        
        names.forEach { name in
            group.enter()
            DispatchQueue.global(qos: .utility).async {
                if let image = UIImage(named: name) {
                    DispatchQueue.main.async {
                        self.loadedImages[name] = image
                        group.leave()
                    }
                } else {
                    group.leave()
                }
            }
        }
        
        group.notify(queue: .main) {
            completion()
        }
    }
    
    func image(named name: String) -> UIImage? {
        return loadedImages[name]
    }
}
```

### 2. 内存优化

```swift
extension UIImage {
    // 解压图像以避免主线程解压
    func decompressed() -> UIImage? {
        guard let cgImage = self.cgImage else { return nil }
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(
            data: nil,
            width: cgImage.width,
            height: cgImage.height,
            bitsPerComponent: 8,
            bytesPerRow: cgImage.width * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        context?.draw(cgImage, in: CGRect(origin: .zero, size: CGSize(width: cgImage.width, height: cgImage.height)))
        
        guard let decompressedCGImage = context?.makeImage() else { return nil }
        return UIImage(cgImage: decompressedCGImage, scale: scale, orientation: imageOrientation)
    }
    
    // 生成缩略图
    func thumbnail(size: CGSize) -> UIImage? {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            self.draw(in: CGRect(origin: .zero, size: size))
        }
    }
}
```

## 错误处理和调试

### 1. 图像验证

```swift
extension UIImage {
    var isValid: Bool {
        return self.size.width > 0 && self.size.height > 0
    }
    
    static func validate(named name: String) -> ValidationResult {
        guard let image = UIImage(named: name) else {
            return .notFound
        }
        
        if !image.isValid {
            return .invalid
        }
        
        return .valid(image)
    }
}

enum ValidationResult {
    case valid(UIImage)
    case notFound
    case invalid
}
```

### 2. 调试工具

```swift
extension UIImage {
    func debugInfo() -> String {
        var info = "UIImage Debug Info:\n"
        info += "Size: \(size)\n"
        info += "Scale: \(scale)\n"
        info += "Orientation: \(orientation.rawValue)\n"
        info += "Has Alpha: \(hasAlpha)\n"
        info += "Rendering Mode: \(renderingMode.rawValue)\n"
        
        if let cgImage = self.cgImage {
            info += "Pixel Size: \(cgImage.width)x\(cgImage.height)\n"
            info += "Bits Per Component: \(cgImage.bitsPerComponent)\n"
            info += "Bits Per Pixel: \(cgImage.bitsPerPixel)\n"
            info += "Color Space: \(cgImage.colorSpace?.name ?? "Unknown")\n"
        }
        
        return info
    }
}
```

## 常用扩展方法

### 1. 图像生成

```swift
extension UIImage {
    // 从颜色生成图像
    static func from(color: UIColor, size: CGSize = CGSize(width: 1, height: 1)) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            color.setFill()
            context.fill(CGRect(origin: .zero, size: size))
        }
    }
    
    // 从渐变生成图像
    static func gradient(colors: [UIColor], size: CGSize, direction: GradientDirection = .topToBottom) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            let cgColors = colors.map { $0.cgColor }
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            
            guard let gradient = CGGradient(colorsSpace: colorSpace, colors: cgColors as CFArray, locations: nil) else { return }
            
            let startPoint: CGPoint
            let endPoint: CGPoint
            
            switch direction {
            case .topToBottom:
                startPoint = CGPoint(x: 0, y: 0)
                endPoint = CGPoint(x: 0, y: size.height)
            case .leftToRight:
                startPoint = CGPoint(x: 0, y: 0)
                endPoint = CGPoint(x: size.width, y: 0)
            case .topLeftToBottomRight:
                startPoint = CGPoint(x: 0, y: 0)
                endPoint = CGPoint(x: size.width, y: size.height)
            case .topRightToBottomLeft:
                startPoint = CGPoint(x: size.width, y: 0)
                endPoint = CGPoint(x: 0, y: size.height)
            }
            
            context.cgContext.drawLinearGradient(gradient, start: startPoint, end: endPoint, options: [])
        }
    }
}

enum GradientDirection {
    case topToBottom
    case leftToRight
    case topLeftToBottomRight
    case topRightToBottomLeft
}
```

### 2. 图像处理

```swift
extension UIImage {
    // 圆形裁剪
    func circularImage() -> UIImage? {
        let minSize = min(size.width, size.height)
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: minSize, height: minSize))
        
        return renderer.image { _ in
            let rect = CGRect(origin: .zero, size: CGSize(width: minSize, height: minSize))
            UIBezierPath(ovalIn: rect).addClip()
            
            let drawRect = CGRect(
                x: (minSize - size.width) / 2,
                y: (minSize - size.height) / 2,
                width: size.width,
                height: size.height
            )
            self.draw(in: drawRect)
        }
    }
    
    // 圆角裁剪
    func roundedCorners(radius: CGFloat) -> UIImage? {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            let rect = CGRect(origin: .zero, size: size)
            UIBezierPath(roundedRect: rect, cornerRadius: radius).addClip()
            self.draw(in: rect)
        }
    }
    
    // 添加边框
    func withBorder(width: CGFloat, color: UIColor) -> UIImage? {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            let rect = CGRect(origin: .zero, size: size)
            self.draw(in: rect)
            
            context.cgContext.setStrokeColor(color.cgColor)
            context.cgContext.setLineWidth(width)
            context.cgContext.stroke(rect.insetBy(dx: width/2, dy: width/2))
        }
    }
}
```

## 最佳实践

1. **内存管理**：大图像使用 `init(contentsOfFile:)` 避免缓存
2. **性能优化**：在后台队列进行图像处理操作
3. **格式选择**：PNG 用于透明图像，JPEG 用于照片
4. **缓存策略**：合理使用图像缓存避免内存压力
5. **资源管理**：及时释放不需要的图像资源
6. **适配性**：使用资产目录支持不同设备和主题
7. **压缩优化**：根据使用场景选择合适的压缩质量

## 总结

UIImage 是 iOS 开发中处理图像的核心类，提供了丰富的功能用于图像的创建、处理和显示。iOS 13+ 引入的系统图标和配置系统进一步增强了图像的灵活性。合理使用 UIImage 的各种功能可以创建出高质量的用户界面和良好的用户体验。