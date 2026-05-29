---
title: "MTKTextureLoader API 完整指南"
description: "MTKTextureLoader 是 MetalKit 框架中的核心类，专门用于从各种数据源（图片文件、CGImage、数据等）创建 MTLTexture 对象。它简化了纹理加载过程，支持多种图像格式，并提供了丰富的配置选项。"
pubDate: 2026-05-29
category: "metal"
tags: [Mac, iOS, Swift, Array, API]
draft: false
---
# 🚀  MTKTextureLoader API 完整指南

## 概述

`MTKTextureLoader` 是 MetalKit 框架中的核心类，专门用于从各种数据源（图片文件、CGImage、数据等）创建 MTLTexture 对象。它简化了纹理加载过程，支持多种图像格式，并提供了丰富的配置选项。

## 初始化方法

### 基本初始化

```swift
// 使用 MTLDevice 初始化
let textureLoader = MTKTextureLoader(device: metalDevice)
```

## 核心加载方法

### 1. 从 CGImage 创建纹理

```swift
// 同步方法
func newTexture(cgImage: CGImage, options: [MTKTextureLoader.Option : Any]?) throws -> MTLTexture

// 异步方法
func newTexture(cgImage: CGImage, options: [MTKTextureLoader.Option : Any]?, completionHandler: @escaping MTKTextureLoader.Callback)

// 使用示例
let textureLoader = MTKTextureLoader(device: device)
let options: [MTKTextureLoader.Option: Any] = [
    .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
    .textureStorageMode: NSNumber(value: MTLStorageMode.shared.rawValue)
]

do {
    let texture = try textureLoader.newTexture(cgImage: cgImage, options: options)
    // 使用纹理
} catch {
    print("纹理加载失败: \(error)")
}
```

### 2. 从 URL 加载纹理

```swift
// 同步方法
func newTexture(URL: URL, options: [MTKTextureLoader.Option : Any]?) throws -> MTLTexture

// 异步方法
func newTexture(URL: URL, options: [MTKTextureLoader.Option : Any]?, completionHandler: @escaping MTKTextureLoader.Callback)

// 使用示例
let imageURL = Bundle.main.url(forResource: "texture", withExtension: "jpg")!
textureLoader.newTexture(URL: imageURL, options: options) { (texture, error) in
    if let texture = texture {
        print("纹理加载成功: \(texture.width)x\(texture.height)")
    } else if let error = error {
        print("纹理加载失败: \(error)")
    }
}
```

### 3. 从文件名加载纹理

```swift
// 同步方法
func newTexture(name: String, scaleFactor: CGFloat, bundle: Bundle?, options: [MTKTextureLoader.Option : Any]?) throws -> MTLTexture

// 异步方法
func newTexture(name: String, scaleFactor: CGFloat, bundle: Bundle?, options: [MTKTextureLoader.Option : Any]?, completionHandler: @escaping MTKTextureLoader.Callback)

// 使用示例
do {
    let texture = try textureLoader.newTexture(
        name: "texture.jpg",
        scaleFactor: 1.0,
        bundle: Bundle.main,
        options: options
    )
} catch {
    print("加载失败: \(error)")
}
```

### 4. 从 Data 创建纹理

```swift
// 同步方法
func newTexture(data: Data, options: [MTKTextureLoader.Option : Any]?) throws -> MTLTexture

// 异步方法
func newTexture(data: Data, options: [MTKTextureLoader.Option : Any]?, completionHandler: @escaping MTKTextureLoader.Callback)

// 使用示例
let imageData = Data() // 你的图像数据
do {
    let texture = try textureLoader.newTexture(data: imageData, options: options)
} catch {
    print("从数据创建纹理失败: \(error)")
}
```

### 5. 创建纹理数组

```swift
// 从 CGImage 数组创建
func newTextures(cgImages: [CGImage], options: [MTKTextureLoader.Option : Any]?) throws -> [MTLTexture]

// 从 URL 数组创建
func newTextures(URLs: [URL], options: [MTKTextureLoader.Option : Any]?) throws -> [MTLTexture]

// 异步版本
func newTextures(cgImages: [CGImage], options: [MTKTextureLoader.Option : Any]?, completionHandler: @escaping ([MTLTexture]?, Error?) -> Void)

// 使用示例
let cgImages: [CGImage] = [image1, image2, image3]
do {
    let textures = try textureLoader.newTextures(cgImages: cgImages, options: options)
    print("创建了 \(textures.count) 个纹理")
} catch {
    print("批量创建纹理失败: \(error)")
}
```

## MTKTextureLoader.Option 配置选项

### 纹理使用方式

```swift
// 纹理用途
.textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue)

// 可用的纹理用途：
// - .shaderRead: 着色器读取
// - .shaderWrite: 着色器写入
// - .renderTarget: 渲染目标
// - .pixelFormatView: 像素格式视图
```

### 存储模式

```swift
// 存储模式
.textureStorageMode: NSNumber(value: MTLStorageMode.shared.rawValue)

// 可用的存储模式：
// - .shared: CPU 和 GPU 共享内存
// - .managed: 系统管理内存同步（仅 macOS）
// - .private: GPU 专用内存
// - .memoryless: 无内存存储（仅渲染目标）
```

### CPU 缓存模式

```swift
// CPU 缓存模式
.textureCPUCacheMode: NSNumber(value: MTLCPUCacheMode.defaultCache.rawValue)

// 可用的缓存模式：
// - .defaultCache: 默认缓存
// - .writeCombined: 写合并缓存
```

### 坐标系和方向

```swift
// 纹理原点位置
.origin: MTKTextureLoader.Origin.topLeft

// 可用选项：
// - .topLeft: 左上角为原点
// - .bottomLeft: 左下角为原点（OpenGL 风格）

// 垂直翻转
.generateMipmaps: NSNumber(value: true)
```

### Mipmap 生成

```swift
// 自动生成 mipmap
.generateMipmaps: NSNumber(value: true)

// SRGB 处理
.SRGB: NSNumber(value: true)
```

### 立方体贴图

```swift
// 加载为立方体贴图
.cubeLayout: MTKTextureLoader.CubeLayout.vertical

// 立方体贴图布局选项：
// - .vertical: 垂直排列
// - .horizontal: 水平排列
```

### 分配器

```swift
// 自定义分配器
.allocateMipmaps: NSNumber(value: true)
```

## 完整的配置示例

### 基本 2D 纹理加载

```swift
let options: [MTKTextureLoader.Option: Any] = [
    .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
    .textureStorageMode: NSNumber(value: MTLStorageMode.shared.rawValue),
    .origin: MTKTextureLoader.Origin.topLeft,
    .generateMipmaps: NSNumber(value: true),
    .SRGB: NSNumber(value: false)
]

do {
    let texture = try textureLoader.newTexture(cgImage: cgImage, options: options)
    print("纹理创建成功: \(texture.width)x\(texture.height), mipmap级别: \(texture.mipmapLevelCount)")
} catch {
    print("纹理创建失败: \(error)")
}
```

### HDR/高动态范围纹理

```swift
let hdrOptions: [MTKTextureLoader.Option: Any] = [
    .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
    .textureStorageMode: NSNumber(value: MTLStorageMode.private.rawValue),
    .origin: MTKTextureLoader.Origin.topLeft,
    .SRGB: NSNumber(value: false), // HDR 通常不使用 sRGB
    .generateMipmaps: NSNumber(value: false) // HDR 环境贴图通常不需要 mipmap
]
```

### 立方体环境贴图

```swift
let cubeMapOptions: [MTKTextureLoader.Option: Any] = [
    .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
    .textureStorageMode: NSNumber(value: MTLStorageMode.private.rawValue),
    .cubeLayout: MTKTextureLoader.CubeLayout.vertical,
    .origin: MTKTextureLoader.Origin.topLeft,
    .generateMipmaps: NSNumber(value: true)
]

do {
    let cubeTexture = try textureLoader.newTexture(
        name: "skybox_cube.jpg",
        scaleFactor: 1.0,
        bundle: Bundle.main,
        options: cubeMapOptions
    )
    print("立方体贴图创建成功, 类型: \(cubeTexture.textureType)")
} catch {
    print("立方体贴图创建失败: \(error)")
}
```

## 实际应用示例

### 游戏纹理加载管理器

```swift
class TextureManager {
    private let device: MTLDevice
    private let textureLoader: MTKTextureLoader
    private var textureCache: [String: MTLTexture] = [:]
    
    init(device: MTLDevice) {
        self.device = device
        self.textureLoader = MTKTextureLoader(device: device)
    }
    
    func loadTexture(named name: String, options: [MTKTextureLoader.Option: Any]? = nil) -> MTLTexture? {
        // 检查缓存
        if let cachedTexture = textureCache[name] {
            return cachedTexture
        }
        
        let defaultOptions: [MTKTextureLoader.Option: Any] = [
            .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
            .textureStorageMode: NSNumber(value: MTLStorageMode.shared.rawValue),
            .origin: MTKTextureLoader.Origin.topLeft,
            .generateMipmaps: NSNumber(value: true)
        ]
        
        let finalOptions = options ?? defaultOptions
        
        do {
            let texture = try textureLoader.newTexture(
                name: name,
                scaleFactor: 1.0,
                bundle: Bundle.main,
                options: finalOptions
            )
            
            // 缓存纹理
            textureCache[name] = texture
            return texture
        } catch {
            print("加载纹理 '\(name)' 失败: \(error)")
            return nil
        }
    }
    
    func loadTextureAsync(named name: String, completion: @escaping (MTLTexture?) -> Void) {
        if let cachedTexture = textureCache[name] {
            completion(cachedTexture)
            return
        }
        
        let options: [MTKTextureLoader.Option: Any] = [
            .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
            .textureStorageMode: NSNumber(value: MTLStorageMode.shared.rawValue),
            .origin: MTKTextureLoader.Origin.topLeft
        ]
        
        textureLoader.newTexture(name: name, scaleFactor: 1.0, bundle: Bundle.main, options: options) { [weak self] texture, error in
            DispatchQueue.main.async {
                if let texture = texture {
                    self?.textureCache[name] = texture
                    completion(texture)
                } else {
                    print("异步加载纹理失败: \(error?.localizedDescription ?? "未知错误")")
                    completion(nil)
                }
            }
        }
    }
}
```

### 支持不同格式的纹理加载

```swift
extension MTKTextureLoader {
    func loadTexture(from url: URL) -> MTLTexture? {
        let fileExtension = url.pathExtension.lowercased()
        
        var options: [MTKTextureLoader.Option: Any] = [
            .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
            .textureStorageMode: NSNumber(value: MTLStorageMode.shared.rawValue),
            .origin: MTKTextureLoader.Origin.topLeft
        ]
        
        // 根据文件格式调整选项
        switch fileExtension {
        case "hdr", "exr":
            // HDR 格式
            options[.SRGB] = NSNumber(value: false)
            options[.generateMipmaps] = NSNumber(value: false)
            
        case "jpg", "jpeg":
            // JPEG 通常是 sRGB
            options[.SRGB] = NSNumber(value: true)
            options[.generateMipmaps] = NSNumber(value: true)
            
        case "png":
            // PNG 可能包含透明度
            options[.SRGB] = NSNumber(value: true)
            options[.generateMipmaps] = NSNumber(value: true)
            
        default:
            break
        }
        
        do {
            return try newTexture(URL: url, options: options)
        } catch {
            print("加载纹理失败: \(error)")
            return nil
        }
    }
}
```

### 纹理压缩和优化

```swift
class OptimizedTextureLoader {
    private let device: MTLDevice
    private let textureLoader: MTKTextureLoader
    
    init(device: MTLDevice) {
        self.device = device
        self.textureLoader = MTKTextureLoader(device: device)
    }
    
    func loadCompressedTexture(named name: String) -> MTLTexture? {
        // 根据设备能力选择最佳选项
        var options: [MTKTextureLoader.Option: Any] = [
            .textureUsage: NSNumber(value: MTLTextureUsage.shaderRead.rawValue),
            .origin: MTKTextureLoader.Origin.topLeft
        ]
        
        // 根据设备选择存储模式
        if device.hasUnifiedMemory {
            options[.textureStorageMode] = NSNumber(value: MTLStorageMode.shared.rawValue)
        } else {
            options[.textureStorageMode] = NSNumber(value: MTLStorageMode.private.rawValue)
        }
        
        // 移动设备优化
        #if os(iOS)
        options[.textureCPUCacheMode] = NSNumber(value: MTLCPUCacheMode.writeCombined.rawValue)
        #endif
        
        do {
            return try textureLoader.newTexture(
                name: name,
                scaleFactor: UIScreen.main.scale,
                bundle: Bundle.main,
                options: options
            )
        } catch {
            print("加载优化纹理失败: \(error)")
            return nil
        }
    }
}
```

## 错误处理和调试

### 常见错误类型

```swift
func handleTextureLoadingError(_ error: Error) {
    if let mtlError = error as? MTLLibraryError {
        print("Metal 库错误: \(mtlError)")
    } else if error.localizedDescription.contains("unsupported") {
        print("不支持的图像格式")
    } else if error.localizedDescription.contains("memory") {
        print("内存不足")
    } else {
        print("未知纹理加载错误: \(error)")
    }
}
```

### 纹理信息调试

```swift
func debugTexture(_ texture: MTLTexture) {
    print("纹理信息:")
    print("- 尺寸: \(texture.width) x \(texture.height)")
    print("- 深度: \(texture.depth)")
    print("- 类型: \(texture.textureType)")
    print("- 像素格式: \(texture.pixelFormat)")
    print("- Mipmap 级别: \(texture.mipmapLevelCount)")
    print("- 数组长度: \(texture.arrayLength)")
    print("- 用途: \(texture.usage)")
    print("- 存储模式: \(texture.storageMode)")
}
```

## 性能优化建议

### 1. 异步加载

```swift
// 在后台队列加载大纹理
func loadLargeTextureAsync(url: URL, completion: @escaping (MTLTexture?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
        do {
            let texture = try self?.textureLoader.newTexture(URL: url, options: nil)
            DispatchQueue.main.async {
                completion(texture)
            }
        } catch {
            DispatchQueue.main.async {
                completion(nil)
            }
        }
    }
}
```

### 2. 纹理缓存

```swift
// 使用 NSCache 进行智能缓存管理
private let textureCache = NSCache<NSString, MTLTexture>()

func cachedTexture(for name: String) -> MTLTexture? {
    if let cached = textureCache.object(forKey: name as NSString) {
        return cached
    }
    
    if let texture = loadTexture(named: name) {
        textureCache.setObject(texture, forKey: name as NSString)
        return texture
    }
    
    return nil
}
```

### 3. 内存管理

```swift
// 清理纹理缓存
func clearTextureCache() {
    textureCache.removeAllObjects()
}

// 监听内存警告
NotificationCenter.default.addObserver(
    forName: UIApplication.didReceiveMemoryWarningNotification,
    object: nil,
    queue: .main
) { _ in
    clearTextureCache()
}
```

## 注意事项

1. **线程安全性**：MTKTextureLoader 是线程安全的，可以在多个线程中同时使用
2. **内存管理**：大纹理会占用大量内存，注意及时释放不用的纹理
3. **格式支持**：不是所有图像格式都被支持，需要处理加载失败的情况
4. **设备兼容性**：某些纹理格式和选项可能不被所有设备支持
5. **性能考虑**：同步加载可能会阻塞主线程，大文件建议使用异步加载

## 相关类型

- `MTLTexture`：Metal 纹理对象
- `MTLDevice`：Metal 设备对象
- `MTKTextureLoader.Origin`：纹理坐标原点枚举
- `MTKTextureLoader.CubeLayout`：立方体贴图布局枚举
- `MTKTextureLoader.Option`：加载选项类型别名
- `MTKTextureLoader.Callback`：异步回调类型别名
