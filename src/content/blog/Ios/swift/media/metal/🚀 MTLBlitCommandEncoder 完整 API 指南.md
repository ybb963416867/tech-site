---
title: "MTLBlitCommandEncoder 完整 API 指南"
description: "MTLBlitCommandEncoder 是 Metal 框架中用于执行内存操作的编码器，主要用于在 GPU 上执行资源复制、填充和同步操作。它可以高效地在纹理、缓冲区之间传输数据，而不会阻塞 CPU。"
pubDate: 2026-05-29
category: "metal"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀 MTLBlitCommandEncoder 完整 API 指南

## 概述

`MTLBlitCommandEncoder` 是 Metal 框架中用于执行内存操作的编码器，主要用于在 GPU 上执行资源复制、填充和同步操作。它可以高效地在纹理、缓冲区之间传输数据，而不会阻塞 CPU。

## 创建 Blit 编码器

```swift
let commandBuffer = commandQueue.makeCommandBuffer()
let blitEncoder = commandBuffer.makeBlitCommandEncoder()

// 使用描述符创建（iOS 14.0+）
let descriptor = MTLBlitCommandEncoderDescriptor()
let blitEncoder = commandBuffer.makeBlitCommandEncoder(descriptor: descriptor)
```

## 主要 API 分类

### 1. 缓冲区操作

#### 1.1 缓冲区到缓冲区复制

```swift
// 基本复制
func copy(from sourceBuffer: MTLBuffer,
          sourceOffset: Int,
          to destinationBuffer: MTLBuffer,
          destinationOffset: Int,
          size: Int)

// 示例
blitEncoder.copy(from: sourceBuffer,
                 sourceOffset: 0,
                 to: destBuffer,
                 destinationOffset: 0,
                 size: 1024)
```

#### 1.2 填充缓冲区

```swift
// 用固定值填充缓冲区范围
func fill(buffer: MTLBuffer,
          range: Range<Int>,
          value: UInt8)

// 示例：将缓冲区清零
blitEncoder.fill(buffer: myBuffer,
                 range: 0..<bufferSize,
                 value: 0)
```

#### 1.3 更新围栏（Fence）

```swift
// 更新围栏以同步 CPU 和 GPU
func updateFence(_ fence: MTLFence)

// 等待围栏
func waitForFence(_ fence: MTLFence)
```

### 2. 纹理操作

#### 2.1 纹理到纹理复制

```swift
// 完整纹理复制
func copy(from sourceTexture: MTLTexture,
          to destinationTexture: MTLTexture)

// 指定区域复制
func copy(from sourceTexture: MTLTexture,
          sourceSlice: Int,
          sourceLevel: Int,
          sourceOrigin: MTLOrigin,
          sourceSize: MTLSize,
          to destinationTexture: MTLTexture,
          destinationSlice: Int,
          destinationLevel: Int,
          destinationOrigin: MTLOrigin)

// 示例：复制纹理的特定区域
blitEncoder.copy(from: srcTexture,
                 sourceSlice: 0,
                 sourceLevel: 0,
                 sourceOrigin: MTLOrigin(x: 0, y: 0, z: 0),
                 sourceSize: MTLSize(width: 256, height: 256, depth: 1),
                 to: dstTexture,
                 destinationSlice: 0,
                 destinationLevel: 0,
                 destinationOrigin: MTLOrigin(x: 100, y: 100, z: 0))
```

#### 2.2 缓冲区到纹理复制

```swift
func copy(from sourceBuffer: MTLBuffer,
          sourceOffset: Int,
          sourceBytesPerRow: Int,
          sourceBytesPerImage: Int,
          sourceSize: MTLSize,
          to destinationTexture: MTLTexture,
          destinationSlice: Int,
          destinationLevel: Int,
          destinationOrigin: MTLOrigin)

// 示例：从缓冲区复制数据到纹理
blitEncoder.copy(from: pixelBuffer,
                 sourceOffset: 0,
                 sourceBytesPerRow: width * 4,
                 sourceBytesPerImage: width * height * 4,
                 sourceSize: MTLSize(width: width, height: height, depth: 1),
                 to: texture,
                 destinationSlice: 0,
                 destinationLevel: 0,
                 destinationOrigin: MTLOrigin(x: 0, y: 0, z: 0))
```

#### 2.3 纹理到缓冲区复制

```swift
func copy(from sourceTexture: MTLTexture,
          sourceSlice: Int,
          sourceLevel: Int,
          sourceOrigin: MTLOrigin,
          sourceSize: MTLSize,
          to destinationBuffer: MTLBuffer,
          destinationOffset: Int,
          destinationBytesPerRow: Int,
          destinationBytesPerImage: Int)

// 示例：从纹理复制到缓冲区（用于读取 GPU 渲染结果）
blitEncoder.copy(from: renderTexture,
                 sourceSlice: 0,
                 sourceLevel: 0,
                 sourceOrigin: MTLOrigin(x: 0, y: 0, z: 0),
                 sourceSize: MTLSize(width: texture.width, 
                                    height: texture.height, 
                                    depth: 1),
                 to: readbackBuffer,
                 destinationOffset: 0,
                 destinationBytesPerRow: texture.width * 4,
                 destinationBytesPerImage: texture.width * texture.height * 4)
```

### 3. Mipmap 生成

```swift
// 自动生成纹理的 mipmap 层级
func generateMipmaps(for texture: MTLTexture)

// 示例
if texture.mipmapLevelCount > 1 {
    blitEncoder.generateMipmaps(for: texture)
}
```

### 4. 资源同步

#### 4.1 同步资源（macOS）

```swift
#if os(macOS)
// 同步托管存储模式的资源
func synchronize(resource: MTLResource)

// 同步纹理的特定区域
func synchronize(texture: MTLTexture,
                 slice: Int,
                 level: Int)

// 示例
blitEncoder.synchronize(resource: managedBuffer)
#endif
```

#### 4.2 优化资源（iOS/tvOS）

```swift
#if os(iOS) || os(tvOS)
// 优化纹理内容以提高 GPU 性能
func optimizeContentsForGPUAccess(texture: MTLTexture)
func optimizeContentsForGPUAccess(texture: MTLTexture,
                                  slice: Int,
                                  level: Int)

// 优化 CPU 访问
func optimizeContentsForCPUAccess(texture: MTLTexture)
func optimizeContentsForCPUAccess(texture: MTLTexture,
                                  slice: Int,
                                  level: Int)
#endif
```

### 5. 间接命令缓冲区操作

```swift
// 复制间接命令缓冲区
func copy(from sourceBuffer: MTLBuffer,
          sourceOffset: Int,
          to destinationBuffer: MTLBuffer,
          destinationOffset: Int,
          size: Int)

// 优化间接命令缓冲区
func optimizeIndirectCommandBuffer(_ buffer: MTLIndirectCommandBuffer,
                                   range: Range<Int>)

// 重置命令
func resetCommandsInBuffer(_ buffer: MTLIndirectCommandBuffer,
                           range: Range<Int>)
```

### 6. 查询操作

```swift
// 解析查询结果（iOS 14.0+）
func resolveCounters(_ sampleBuffer: MTLCounterSampleBuffer,
                     range: Range<Int>,
                     destinationBuffer: MTLBuffer,
                     destinationOffset: Int)

// 采样计数器
func sampleCounters(sampleBuffer: MTLCounterSampleBuffer,
                    sampleIndex: Int,
                    barrier: Bool)
```

### 7. 资源使用跟踪

```swift
// 获取 GPU 开始和结束时间（iOS 10.3+）
func getTextureAccessCounters(_ texture: MTLTexture,
                              region: MTLRegion,
                              mipLevel: Int,
                              slice: Int,
                              resetCounters: Bool,
                              countersBuffer: MTLBuffer,
                              countersBufferOffset: Int)
```

## 完整使用示例

### 示例 1：视频帧捕获优化

```swift
class VideoFrameCapture {
    let device: MTLDevice
    let commandQueue: MTLCommandQueue
    var captureBuffer: MTLBuffer?
    
    init(device: MTLDevice) {
        self.device = device
        self.commandQueue = device.makeCommandQueue()!
    }
    
    func captureFrame(from texture: MTLTexture, completion: @escaping (Data?) -> Void) {
        let bufferSize = texture.width * texture.height * 4
        
        // 创建或重用缓冲区
        if captureBuffer == nil || captureBuffer!.length < bufferSize {
            captureBuffer = device.makeBuffer(length: bufferSize, 
                                             options: .storageModeShared)
        }
        
        guard let buffer = captureBuffer,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let blitEncoder = commandBuffer.makeBlitCommandEncoder() else {
            completion(nil)
            return
        }
        
        // 异步复制纹理到缓冲区
        blitEncoder.copy(
            from: texture,
            sourceSlice: 0,
            sourceLevel: 0,
            sourceOrigin: MTLOrigin(x: 0, y: 0, z: 0),
            sourceSize: MTLSize(width: texture.width, 
                               height: texture.height, 
                               depth: 1),
            to: buffer,
            destinationOffset: 0,
            destinationBytesPerRow: texture.width * 4,
            destinationBytesPerImage: bufferSize
        )
        
        blitEncoder.endEncoding()
        
        // 添加完成处理器
        commandBuffer.addCompletedHandler { _ in
            let data = Data(bytes: buffer.contents(), count: bufferSize)
            completion(data)
        }
        
        commandBuffer.commit()
    }
}
```

### 示例 2：纹理 Mipmap 生成

```swift
func createTextureWithMipmaps(device: MTLDevice, image: UIImage) -> MTLTexture? {
    let textureLoader = MTKTextureLoader(device: device)
    
    let options: [MTKTextureLoader.Option : Any] = [
        .generateMipmaps: true,
        .SRGB: false
    ]
    
    guard let texture = try? textureLoader.newTexture(
        cgImage: image.cgImage!,
        options: options
    ) else { return nil }
    
    // 使用 Blit 编码器生成 mipmaps
    let commandBuffer = device.makeCommandQueue()!.makeCommandBuffer()!
    let blitEncoder = commandBuffer.makeBlitCommandEncoder()!
    
    blitEncoder.generateMipmaps(for: texture)
    blitEncoder.endEncoding()
    
    commandBuffer.commit()
    commandBuffer.waitUntilCompleted()
    
    return texture
}
```

### 示例 3：多缓冲区同步复制

```swift
class BufferSynchronizer {
    func synchronizeBuffers(source: MTLBuffer,
                           destinations: [MTLBuffer],
                           size: Int,
                           commandQueue: MTLCommandQueue) {
        guard let commandBuffer = commandQueue.makeCommandBuffer(),
              let blitEncoder = commandBuffer.makeBlitCommandEncoder() else {
            return
        }
        
        // 批量复制到多个目标
        for destination in destinations {
            blitEncoder.copy(from: source,
                           sourceOffset: 0,
                           to: destination,
                           destinationOffset: 0,
                           size: size)
        }
        
        blitEncoder.endEncoding()
        commandBuffer.commit()
    }
}
```

### 示例 4：纹理区域复制和拼接

```swift
func createTextureAtlas(device: MTLDevice,
                        textures: [MTLTexture],
                        tileSize: Int) -> MTLTexture? {
    let cols = Int(sqrt(Double(textures.count)).rounded(.up))
    let rows = (textures.count + cols - 1) / cols
    let atlasSize = max(cols, rows) * tileSize
    
    // 创建图集纹理
    let descriptor = MTLTextureDescriptor.texture2DDescriptor(
        pixelFormat: .rgba8Unorm,
        width: atlasSize,
        height: atlasSize,
        mipmapped: false
    )
    
    guard let atlasTexture = device.makeTexture(descriptor: descriptor),
          let commandBuffer = device.makeCommandQueue()?.makeCommandBuffer(),
          let blitEncoder = commandBuffer.makeBlitCommandEncoder() else {
        return nil
    }
    
    // 复制每个纹理到图集的相应位置
    for (index, texture) in textures.enumerated() {
        let col = index % cols
        let row = index / cols
        
        blitEncoder.copy(
            from: texture,
            sourceSlice: 0,
            sourceLevel: 0,
            sourceOrigin: MTLOrigin(x: 0, y: 0, z: 0),
            sourceSize: MTLSize(width: tileSize, height: tileSize, depth: 1),
            to: atlasTexture,
            destinationSlice: 0,
            destinationLevel: 0,
            destinationOrigin: MTLOrigin(x: col * tileSize, 
                                        y: row * tileSize, 
                                        z: 0)
        )
    }
    
    blitEncoder.endEncoding()
    commandBuffer.commit()
    commandBuffer.waitUntilCompleted()
    
    return atlasTexture
}
```

## 性能优化建议

### 1. 批处理操作
```swift
// 好的做法：批量操作
let blitEncoder = commandBuffer.makeBlitCommandEncoder()!
for operation in operations {
    blitEncoder.copy(from: operation.source, to: operation.destination)
}
blitEncoder.endEncoding()

// 避免：为每个操作创建新的编码器
```

### 2. 使用合适的存储模式
```swift
// iOS: 使用 .storageModeShared 用于 CPU/GPU 共享访问
let buffer = device.makeBuffer(length: size, options: .storageModeShared)

// macOS: 使用 .storageModeManaged 并同步
let buffer = device.makeBuffer(length: size, options: .storageModeManaged)
blitEncoder.synchronize(resource: buffer)
```

### 3. 避免不必要的同步
```swift
// 使用完成处理器而不是等待
commandBuffer.addCompletedHandler { _ in
    // 处理完成逻辑
}
commandBuffer.commit()

// 避免：commandBuffer.waitUntilCompleted()
```

## 注意事项

1. **线程安全**：MTLBlitCommandEncoder 不是线程安全的，应该在单个线程中使用
2. **编码器生命周期**：调用 `endEncoding()` 后不能继续使用编码器
3. **平台差异**：某些 API 仅在特定平台可用（如 `synchronize` 仅在 macOS）
4. **内存对齐**：复制操作时注意字节对齐要求
5. **性能考虑**：Blit 操作虽然是异步的，但仍会占用 GPU 带宽