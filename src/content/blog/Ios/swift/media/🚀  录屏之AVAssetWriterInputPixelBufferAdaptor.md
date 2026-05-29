---
title: "录屏之AVAssetWriterInputPixelBufferAdaptor"
description: "AVAssetWriterInputPixelBufferAdaptor 是 AVFoundation 框架中专门用于向 AVAssetWriterInput 提供像素缓冲区数据的适配器类。它简化了将 CVPixelBuffer 对象..."
pubDate: 2026-05-29
category: "media"
tags: [iOS, Swift, Array, API]
draft: false
---
# 🚀  AVAssetWriterInputPixelBufferAdaptor API 指南

## 概述

AVAssetWriterInputPixelBufferAdaptor 是 AVFoundation 框架中专门用于向 AVAssetWriterInput 提供像素缓冲区数据的适配器类。它简化了将 CVPixelBuffer 对象写入视频文件的过程，特别适用于从图像、Core Graphics 内容或自定义渲染内容创建视频的场景。

## 类的定义

```swift
class AVAssetWriterInputPixelBufferAdaptor : NSObject
```

## 初始化方法

### init(assetWriterInput:sourcePixelBufferAttributes:)
```swift
init(assetWriterInput: AVAssetWriterInput, 
     sourcePixelBufferAttributes: [String : Any]?)
```
- **功能**: 创建像素缓冲区适配器实例
- **参数**: 
  - `assetWriterInput`: 关联的 AVAssetWriterInput 实例
  - `sourcePixelBufferAttributes`: 源像素缓冲区属性字典
- **注意**: `assetWriterInput` 必须配置为视频媒体类型

## 核心属性

### assetWriterInput
```swift
var assetWriterInput: AVAssetWriterInput { get }
```
- **功能**: 获取关联的 AVAssetWriterInput
- **类型**: 只读属性
- **用途**: 访问底层的写入输入对象

### sourcePixelBufferAttributes
```swift
var sourcePixelBufferAttributes: [String : Any]? { get }
```
- **功能**: 获取源像素缓冲区属性
- **类型**: 只读可选字典
- **内容**: 包含像素格式、尺寸等属性

### pixelBufferPool
```swift
var pixelBufferPool: CVPixelBufferPool? { get }
```
- **功能**: 获取像素缓冲区池
- **类型**: 只读可选属性
- **用途**: 用于高效创建兼容的像素缓冲区

## 核心方法

### append(_:withPresentationTime:)
```swift
func append(_ pixelBuffer: CVPixelBuffer, 
           withPresentationTime presentationTime: CMTime) -> Bool
```
- **功能**: 追加像素缓冲区到视频流
- **参数**: 
  - `pixelBuffer`: 要追加的像素缓冲区
  - `presentationTime`: 显示时间戳
- **返回**: 成功返回 true，失败返回 false
- **注意**: 时间戳必须按递增顺序

## 静态方法

### assetWriterInputPixelBufferAdaptor(withAssetWriterInput:sourcePixelBufferAttributes:)
```swift
class func assetWriterInputPixelBufferAdaptor(
    withAssetWriterInput assetWriterInput: AVAssetWriterInput,
    sourcePixelBufferAttributes: [String : Any]?
) -> Self
```
- **功能**: 类方法创建适配器实例
- **参数**: 与 init 方法相同
- **返回**: 新的适配器实例

## 像素缓冲区属性键

### 常用属性键
```swift
// 像素格式类型
kCVPixelBufferPixelFormatTypeKey as String

// 缓冲区尺寸
kCVPixelBufferWidthKey as String
kCVPixelBufferHeightKey as String

// 字节对齐
kCVPixelBufferBytesPerRowAlignmentKey as String

// 内存分配器
kCVPixelBufferMemoryAllocatorKey as String

// 颜色空间
kCVPixelBufferCGImageCompatibilityKey as String
kCVPixelBufferCGBitmapContextCompatibilityKey as String

// OpenGL 兼容性
kCVPixelBufferOpenGLCompatibilityKey as String
kCVPixelBufferOpenGLESCompatibilityKey as String

// Metal 兼容性
kCVPixelBufferMetalCompatibilityKey as String
```

## 使用示例

### 基本视频创建示例

```swift
import AVFoundation
import CoreVideo
import CoreGraphics

class VideoCreator {
    private var assetWriter: AVAssetWriter!
    private var writerInput: AVAssetWriterInput!
    private var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    func setupVideoCreation(outputURL: URL, size: CGSize) throws {
        // 创建 AVAssetWriter
        assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
        
        // 视频输出设置
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: Int(size.width),
            AVVideoHeightKey: Int(size.height),
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 2000000,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
            ]
        ]
        
        // 创建写入输入
        writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        writerInput.expectsMediaDataInRealTime = true
        
        // 像素缓冲区属性
        let pixelBufferAttributes: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
            kCVPixelBufferWidthKey as String: Int(size.width),
            kCVPixelBufferHeightKey as String: Int(size.height),
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
        ]
        
        // 创建像素缓冲区适配器
        pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
            assetWriterInput: writerInput,
            sourcePixelBufferAttributes: pixelBufferAttributes
        )
        
        // 添加输入到写入器
        if assetWriter.canAdd(writerInput) {
            assetWriter.add(writerInput)
        }
        
        // 开始写入
        guard assetWriter.startWriting() else {
            throw assetWriter.error ?? NSError(domain: "VideoCreator", code: -1, userInfo: nil)
        }
        
        assetWriter.startSession(atSourceTime: .zero)
    }
    
    func addFrame(image: UIImage, at time: CMTime) -> Bool {
        guard writerInput.isReadyForMoreMediaData else {
            return false
        }
        
        guard let pixelBuffer = createPixelBuffer(from: image) else {
            return false
        }
        
        return pixelBufferAdaptor.append(pixelBuffer, withPresentationTime: time)
    }
    
    private func createPixelBuffer(from image: UIImage) -> CVPixelBuffer? {
        guard let pool = pixelBufferAdaptor.pixelBufferPool else {
            return nil
        }
        
        var pixelBuffer: CVPixelBuffer?
        let status = CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        defer {
            CVPixelBufferUnlockBaseAddress(buffer, [])
        }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: CVPixelBufferGetWidth(buffer),
            height: CVPixelBufferGetHeight(buffer),
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        guard let cgContext = context else {
            return nil
        }
        
        cgContext.draw(image.cgImage!, in: CGRect(
            x: 0, y: 0,
            width: CVPixelBufferGetWidth(buffer),
            height: CVPixelBufferGetHeight(buffer)
        ))
        
        return buffer
    }
    
    func finishWriting(completion: @escaping (Bool) -> Void) {
        writerInput.markAsFinished()
        assetWriter.finishWriting {
            completion(self.assetWriter.status == .completed)
        }
    }
}
```

### 从图像数组创建视频

```swift
class ImageArrayToVideo {
    func createVideo(from images: [UIImage], 
                    outputURL: URL, 
                    frameRate: Int32 = 30) async throws {
        
        guard !images.isEmpty else { throw VideoError.noImages }
        
        let firstImage = images[0]
        let videoSize = firstImage.size
        
        // 创建视频写入器
        let assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
        
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: Int(videoSize.width),
            AVVideoHeightKey: Int(videoSize.height)
        ]
        
        let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        writerInput.expectsMediaDataInRealTime = false
        
        let pixelBufferAttributes: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
            kCVPixelBufferWidthKey as String: Int(videoSize.width),
            kCVPixelBufferHeightKey as String: Int(videoSize.height)
        ]
        
        let pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
            assetWriterInput: writerInput,
            sourcePixelBufferAttributes: pixelBufferAttributes
        )
        
        assetWriter.add(writerInput)
        assetWriter.startWriting()
        assetWriter.startSession(atSourceTime: .zero)
        
        // 计算帧持续时间
        let frameDuration = CMTime(value: 1, timescale: frameRate)
        
        await withCheckedContinuation { continuation in
            let mediaQueue = DispatchQueue(label: "media.queue")
            
            writerInput.requestMediaDataWhenReady(on: mediaQueue) {
                var frameIndex = 0
                var currentTime = CMTime.zero
                
                while frameIndex < images.count {
                    if writerInput.isReadyForMoreMediaData {
                        let image = images[frameIndex]
                        
                        if let pixelBuffer = self.createPixelBuffer(
                            from: image,
                            size: videoSize,
                            pool: pixelBufferAdaptor.pixelBufferPool
                        ) {
                            let success = pixelBufferAdaptor.append(
                                pixelBuffer,
                                withPresentationTime: currentTime
                            )
                            
                            if !success {
                                print("Failed to append pixel buffer at frame \(frameIndex)")
                            }
                        }
                        
                        currentTime = CMTimeAdd(currentTime, frameDuration)
                        frameIndex += 1
                    } else {
                        Thread.sleep(forTimeInterval: 0.1)
                    }
                }
                
                writerInput.markAsFinished()
                assetWriter.finishWriting {
                    continuation.resume()
                }
            }
        }
    }
    
    private func createPixelBuffer(from image: UIImage, 
                                 size: CGSize, 
                                 pool: CVPixelBufferPool?) -> CVPixelBuffer? {
        
        var pixelBuffer: CVPixelBuffer?
        
        let attributes: [String: Any] = [
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
        ]
        
        let status: CVReturn
        if let pool = pool {
            status = CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
        } else {
            status = CVPixelBufferCreate(
                nil,
                Int(size.width),
                Int(size.height),
                kCVPixelFormatType_32ARGB,
                attributes as CFDictionary,
                &pixelBuffer
            )
        }
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        defer {
            CVPixelBufferUnlockBaseAddress(buffer, [])
        }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: Int(size.width),
            height: Int(size.height),
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        context?.draw(image.cgImage!, in: CGRect(origin: .zero, size: size))
        
        return buffer
    }
}

enum VideoError: Error {
    case noImages
}
```

### 使用 Core Graphics 创建动画视频

```swift
class AnimatedVideoCreator {
    private var assetWriter: AVAssetWriter!
    private var writerInput: AVAssetWriterInput!
    private var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    func createAnimatedVideo(outputURL: URL, 
                           size: CGSize, 
                           duration: TimeInterval, 
                           frameRate: Int32 = 30) async throws {
        
        // 设置视频写入器
        try setupVideoWriter(outputURL: outputURL, size: size)
        
        let frameDuration = CMTime(value: 1, timescale: frameRate)
        let totalFrames = Int(duration * Double(frameRate))
        
        await withCheckedContinuation { continuation in
            let mediaQueue = DispatchQueue(label: "animation.queue")
            
            writerInput.requestMediaDataWhenReady(on: mediaQueue) {
                var frameIndex = 0
                var currentTime = CMTime.zero
                
                while frameIndex < totalFrames {
                    if self.writerInput.isReadyForMoreMediaData {
                        let progress = Double(frameIndex) / Double(totalFrames)
                        
                        if let pixelBuffer = self.createAnimatedFrame(
                            size: size,
                            progress: progress,
                            pool: self.pixelBufferAdaptor.pixelBufferPool
                        ) {
                            let success = self.pixelBufferAdaptor.append(
                                pixelBuffer,
                                withPresentationTime: currentTime
                            )
                            
                            if !success {
                                print("Failed to append frame \(frameIndex)")
                            }
                        }
                        
                        currentTime = CMTimeAdd(currentTime, frameDuration)
                        frameIndex += 1
                    } else {
                        Thread.sleep(forTimeInterval: 0.01)
                    }
                }
                
                self.writerInput.markAsFinished()
                self.assetWriter.finishWriting {
                    continuation.resume()
                }
            }
        }
    }
    
    private func setupVideoWriter(outputURL: URL, size: CGSize) throws {
        assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
        
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: Int(size.width),
            AVVideoHeightKey: Int(size.height),
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 3000000,
                AVVideoMaxKeyFrameIntervalKey: 30
            ]
        ]
        
        writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        writerInput.expectsMediaDataInRealTime = false
        
        let pixelBufferAttributes: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
            kCVPixelBufferWidthKey as String: Int(size.width),
            kCVPixelBufferHeightKey as String: Int(size.height),
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
        ]
        
        pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
            assetWriterInput: writerInput,
            sourcePixelBufferAttributes: pixelBufferAttributes
        )
        
        assetWriter.add(writerInput)
        assetWriter.startWriting()
        assetWriter.startSession(atSourceTime: .zero)
    }
    
    private func createAnimatedFrame(size: CGSize, 
                                   progress: Double, 
                                   pool: CVPixelBufferPool?) -> CVPixelBuffer? {
        
        var pixelBuffer: CVPixelBuffer?
        let status = CVPixelBufferPoolCreatePixelBuffer(nil, pool!, &pixelBuffer)
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        defer {
            CVPixelBufferUnlockBaseAddress(buffer, [])
        }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: Int(size.width),
            height: Int(size.height),
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        guard let cgContext = context else {
            return nil
        }
        
        // 清空背景
        cgContext.setFillColor(UIColor.black.cgColor)
        cgContext.fill(CGRect(origin: .zero, size: size))
        
        // 绘制动画内容（例如：移动的圆圈）
        let circleRadius: CGFloat = 50
        let centerY = size.height / 2
        let centerX = circleRadius + (size.width - 2 * circleRadius) * CGFloat(progress)
        
        cgContext.setFillColor(UIColor.red.cgColor)
        cgContext.fillEllipse(in: CGRect(
            x: centerX - circleRadius,
            y: centerY - circleRadius,
            width: circleRadius * 2,
            height: circleRadius * 2
        ))
        
        return buffer
    }
}
```

### 高性能像素缓冲区管理

```swift
class PixelBufferManager {
    private var pixelBufferPool: CVPixelBufferPool?
    private let poolAttributes: [String: Any]
    
    init(width: Int, height: Int, pixelFormat: OSType = kCVPixelFormatType_32ARGB) {
        let poolAuxAttributes: [String: Any] = [
            kCVPixelBufferPoolMinimumBufferCountKey as String: 3,
            kCVPixelBufferPoolMaximumBufferAgeKey as String: 0
        ]
        
        self.poolAttributes = [
            kCVPixelBufferPixelFormatTypeKey as String: pixelFormat,
            kCVPixelBufferWidthKey as String: width,
            kCVPixelBufferHeightKey as String: height,
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
            kCVPixelBufferIOSurfacePropertiesKey as String: [:]
        ]
        
        createPixelBufferPool(auxiliaryAttributes: poolAuxAttributes)
    }
    
    private func createPixelBufferPool(auxiliaryAttributes: [String: Any]) {
        let status = CVPixelBufferPoolCreate(
            nil,
            auxiliaryAttributes as CFDictionary,
            poolAttributes as CFDictionary,
            &pixelBufferPool
        )
        
        if status != kCVReturnSuccess {
            print("Failed to create pixel buffer pool: \(status)")
        }
    }
    
    func createPixelBuffer() -> CVPixelBuffer? {
        guard let pool = pixelBufferPool else {
            return nil
        }
        
        var pixelBuffer: CVPixelBuffer?
        let status = CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
        
        return status == kCVReturnSuccess ? pixelBuffer : nil
    }
    
    func renderToPixelBuffer(_ pixelBuffer: CVPixelBuffer, 
                           renderBlock: (CGContext) -> Void) {
        CVPixelBufferLockBaseAddress(pixelBuffer, [])
        defer {
            CVPixelBufferUnlockBaseAddress(pixelBuffer, [])
        }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(pixelBuffer),
            width: CVPixelBufferGetWidth(pixelBuffer),
            height: CVPixelBufferGetHeight(pixelBuffer),
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        if let cgContext = context {
            renderBlock(cgContext)
        }
    }
}
```

## 常用像素格式

### 支持的像素格式类型

```swift
// RGB 格式
kCVPixelFormatType_32ARGB        // 32-bit ARGB
kCVPixelFormatType_32BGRA        // 32-bit BGRA
kCVPixelFormatType_24RGB         // 24-bit RGB
kCVPixelFormatType_16BE555       // 16-bit BE RGB 555

// YUV 格式
kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange    // 420v
kCVPixelFormatType_420YpCbCr8BiPlanarFullRange     // 420f
kCVPixelFormatType_422YpCbCr8                      // 2vuy
kCVPixelFormatType_444YpCbCr8                      // v308

// 高动态范围格式
kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange   // x420
kCVPixelFormatType_422YpCbCr10                     // v210
```

### 像素格式选择指南

```swift
func choosePixelFormat(for purpose: VideoPurpose) -> OSType {
    switch purpose {
    case .highQuality:
        return kCVPixelFormatType_420YpCbCr8BiPlanarFullRange
    case .webOptimized:
        return kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange
    case .graphics:
        return kCVPixelFormatType_32ARGB
    case .broadcast:
        return kCVPixelFormatType_422YpCbCr8
    case .hdr:
        return kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange
    }
}

enum VideoPurpose {
    case highQuality
    case webOptimized
    case graphics
    case broadcast
    case hdr
}
```

## 性能优化技巧

### 1. 使用像素缓冲区池
```swift
// 优先使用适配器提供的池
if let pool = pixelBufferAdaptor.pixelBufferPool {
    var pixelBuffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
    // 使用 pixelBuffer
}
```

### 2. 预分配缓冲区
```swift
class BufferPreAllocator {
    private var bufferPool: [CVPixelBuffer] = []
    private let maxPoolSize = 10
    
    func preAllocateBuffers(adaptor: AVAssetWriterInputPixelBufferAdaptor) {
        guard let pool = adaptor.pixelBufferPool else { return }
        
        for _ in 0..<maxPoolSize {
            var buffer: CVPixelBuffer?
            if CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer) == kCVReturnSuccess,
               let pixelBuffer = buffer {
                bufferPool.append(pixelBuffer)
            }
        }
    }
    
    func getBuffer() -> CVPixelBuffer? {
        return bufferPool.popLast()
    }
    
    func returnBuffer(_ buffer: CVPixelBuffer) {
        if bufferPool.count < maxPoolSize {
            bufferPool.append(buffer)
        }
    }
}
```

### 3. 批量处理
```swift
func processBatchFrames(frames: [FrameData], 
                       adaptor: AVAssetWriterInputPixelBufferAdaptor) {
    let batchSize = 10
    
    for i in stride(from: 0, to: frames.count, by: batchSize) {
        let endIndex = min(i + batchSize, frames.count)
        let batch = Array(frames[i..<endIndex])
        
        autoreleasepool {
            for frame in batch {
                if let pixelBuffer = createPixelBuffer(from: frame) {
                    _ = adaptor.append(pixelBuffer, withPresentationTime: frame.time)
                }
            }
        }
    }
}
```

## 错误处理和调试

### 常见错误和解决方案

```swift
class AdaptorErrorHandler {
    func handleAppendError(adaptor: AVAssetWriterInputPixelBufferAdaptor, 
                          pixelBuffer: CVPixelBuffer, 
                          time: CMTime) -> Bool {
        
        // 检查输入状态
        guard adaptor.assetWriterInput.isReadyForMoreMediaData else {
            print("Input not ready for more data")
            return false
        }
        
        // 检查时间戳有效性
        guard time.isValid && time >= CMTime.zero else {
            print("Invalid presentation time: \(time)")
            return false
        }
        
        // 检查像素缓冲区格式
        let formatType = CVPixelBufferGetPixelFormatType(pixelBuffer)
        print("Pixel buffer format: \(formatType)")
        
        // 检查尺寸匹配
        let width = CVPixelBufferGetWidth(pixelBuffer)
        let height = CVPixelBufferGetHeight(pixelBuffer)
        print("Pixel buffer size: \(width)x\(height)")
        
        // 尝试追加
        let success = adaptor.append(pixelBuffer, withPresentationTime: time)
        if !success {
            print("Failed to append pixel buffer")
            if let error = adaptor.assetWriterInput.assetWriter?.error {
                print("Writer error: \(error)")
            }
        }
        
        return success
    }
}
```

### 调试工具

```swift
extension AVAssetWriterInputPixelBufferAdaptor {
    func debugInfo() -> [String: Any] {
        var info: [String: Any] = [:]
        
        info["inputMediaType"] = assetWriterInput.mediaType.rawValue
        info["inputReady"] = assetWriterInput.isReadyForMoreMediaData
        info["writerStatus"] = assetWriterInput.assetWriter?.status.rawValue ?? "unknown"
        
        if let attributes = sourcePixelBufferAttributes {
            info["pixelBufferAttributes"] = attributes
        }
        
        if let pool = pixelBufferPool {
            var poolInfo: [String: Any] = [:]
            
            // 获取池的属性
            if let poolAttributes = CVPixelBufferPoolGetAttributes(pool) as? [String: Any] {
                poolInfo["poolAttributes"] = poolAttributes
            }
            
            if let pixelBufferAttributes = CVPixelBufferPoolGetPixelBufferAttributes(pool) as? [String: Any] {
                poolInfo["pixelBufferAttributes"] = pixelBufferAttributes
            }
            
            info["pixelBufferPool"] = poolInfo
        }
        
        return info
    }
}
```

## 最佳实践

### 1. 内存管理
- 使用 `autoreleasepool` 处理大量帧
- 及时释放不需要的像素缓冲区
- 监控内存使用情况

### 2. 性能优化
- 预分配像素缓冲区池
- 使用适当的像素格式
- 在后台队列处理渲染

### 3. 错误处理
- 检查所有返回值
- 验证时间戳顺序
- 监控写入器状态

### 4. 质量控制
- 选择合适的像素格式
- 正确设置颜色空间
- 保持帧率稳定

## 注意事项

1. **线程安全**: 在单一队列中操作适配器
2. **时间戳**: 必须按递增顺序提供时间戳
3. **格式匹配**: 像素缓冲区格式必须与设置匹配
4. **内存压力**: 监控内存使用，避免同时持有过多像素缓冲区
5. **池管理**: 优先使用适配器提供的像素缓冲区池
6. **状态检查**: 追加前始终检查输入的准备状态

## 实际应用场景

### 1. 屏幕录制
```swift
class ScreenRecorder {
    private var displayLink: CADisplayLink?
    private var adaptor: AVAssetWriterInputPixelBufferAdaptor!
    private var startTime: CFTimeInterval = 0
    
    func startRecording(view: UIView, 
                       adaptor: AVAssetWriterInputPixelBufferAdaptor) {
        self.adaptor = adaptor
        startTime = CACurrentMediaTime()
        
        displayLink = CADisplayLink(target: self, selector: #selector(captureFrame))
        displayLink?.add(to: .main, forMode: .common)
    }
    
    @objc private func captureFrame() {
        guard adaptor.assetWriterInput.isReadyForMoreMediaData else { return }
        
        let currentTime = CACurrentMediaTime() - startTime
        let presentationTime = CMTime(seconds: currentTime, preferredTimescale: 600)
        
        if let pixelBuffer = captureViewAsPixelBuffer() {
            _ = adaptor.append(pixelBuffer, withPresentationTime: presentationTime)
        }
    }
    
    private func captureViewAsPixelBuffer() -> CVPixelBuffer? {
        guard let pool = adaptor.pixelBufferPool else { return nil }
        
        var pixelBuffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
        
        guard let buffer = pixelBuffer else { return nil }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        defer {
            CVPixelBufferUnlockBaseAddress(buffer, [])
        }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: CVPixelBufferGetWidth(buffer),
            height: CVPixelBufferGetHeight(buffer),
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        if let cgContext = context {
            UIGraphicsPushContext(cgContext)
            // 渲染视图内容
            UIGraphicsPopContext()
        }
        
        return buffer
    }
    
    func stopRecording() {
        displayLink?.invalidate()
        displayLink = nil
        adaptor.assetWriterInput.markAsFinished()
    }
}
```

### 2. 相机预览录制
```swift
class CameraVideoRecorder: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    private var adaptor: AVAssetWriterInputPixelBufferAdaptor!
    private var isRecording = false
    private var recordingStartTime: CMTime = .zero
    
    func startRecording(with adaptor: AVAssetWriterInputPixelBufferAdaptor) {
        self.adaptor = adaptor
        self.isRecording = true
        self.recordingStartTime = .zero
    }
    
    func captureOutput(_ output: AVCaptureOutput, 
                      didOutput sampleBuffer: CMSampleBuffer, 
                      from connection: AVCaptureConnection) {
        
        guard isRecording, 
              adaptor.assetWriterInput.isReadyForMoreMediaData else { return }
        
        let presentationTime = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        
        // 设置起始时间
        if recordingStartTime == .zero {
            recordingStartTime = presentationTime
        }
        
        // 计算相对时间
        let relativeTime = CMTimeSubtract(presentationTime, recordingStartTime)
        
        // 从样本缓冲区获取像素缓冲区
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        
        // 如果需要格式转换，这里进行处理
        if let convertedBuffer = convertPixelBufferIfNeeded(pixelBuffer) {
            _ = adaptor.append(convertedBuffer, withPresentationTime: relativeTime)
        }
    }
    
    private func convertPixelBufferIfNeeded(_ pixelBuffer: CVPixelBuffer) -> CVPixelBuffer? {
        let sourceFormat = CVPixelBufferGetPixelFormatType(pixelBuffer)
        
        // 检查是否需要格式转换
        if let targetAttributes = adaptor.sourcePixelBufferAttributes,
           let targetFormat = targetAttributes[kCVPixelBufferPixelFormatTypeKey as String] as? OSType,
           sourceFormat != targetFormat {
            
            return convertPixelBuffer(pixelBuffer, to: targetFormat)
        }
        
        return pixelBuffer
    }
    
    private func convertPixelBuffer(_ source: CVPixelBuffer, 
                                  to targetFormat: OSType) -> CVPixelBuffer? {
        
        guard let pool = adaptor.pixelBufferPool else { return nil }
        
        var destinationPixelBuffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &destinationPixelBuffer)
        
        guard let destination = destinationPixelBuffer else { return nil }
        
        // 使用 vImage 或 Core Image 进行格式转换
        // 这里简化处理，实际应用中需要具体的转换逻辑
        
        return destination
    }
    
    func stopRecording() {
        isRecording = false
        adaptor.assetWriterInput.markAsFinished()
    }
}
```

### 3. Core Image 滤镜处理
```swift
class FilteredVideoCreator {
    private let ciContext = CIContext()
    private var adaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    func processVideoWithFilter(sourceImages: [UIImage], 
                               filter: CIFilter,
                               adaptor: AVAssetWriterInputPixelBufferAdaptor) async {
        
        self.adaptor = adaptor
        let frameDuration = CMTime(value: 1, timescale: 30)
        
        await withCheckedContinuation { continuation in
            let processingQueue = DispatchQueue(label: "filter.processing", qos: .userInitiated)
            
            adaptor.assetWriterInput.requestMediaDataWhenReady(on: processingQueue) {
                var frameIndex = 0
                var currentTime = CMTime.zero
                
                for image in sourceImages {
                    while !adaptor.assetWriterInput.isReadyForMoreMediaData {
                        Thread.sleep(forTimeInterval: 0.01)
                    }
                    
                    if let filteredBuffer = self.applyFilterToImage(image, filter: filter) {
                        _ = adaptor.append(filteredBuffer, withPresentationTime: currentTime)
                    }
                    
                    currentTime = CMTimeAdd(currentTime, frameDuration)
                    frameIndex += 1
                }
                
                adaptor.assetWriterInput.markAsFinished()
                continuation.resume()
            }
        }
    }
    
    private func applyFilterToImage(_ image: UIImage, 
                                   filter: CIFilter) -> CVPixelBuffer? {
        
        guard let cgImage = image.cgImage,
              let pool = adaptor.pixelBufferPool else { return nil }
        
        let ciImage = CIImage(cgImage: cgImage)
        filter.setValue(ciImage, forKey: kCIInputImageKey)
        
        guard let outputImage = filter.outputImage else { return nil }
        
        var pixelBuffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
        
        guard let buffer = pixelBuffer else { return nil }
        
        ciContext.render(outputImage, to: buffer)
        
        return buffer
    }
}
```

### 4. Metal 渲染到视频
```swift
import MetalKit

class MetalVideoRenderer {
    private var device: MTLDevice!
    private var commandQueue: MTLCommandQueue!
    private var textureCache: CVMetalTextureCache!
    private var adaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    init() {
        setupMetal()
    }
    
    private func setupMetal() {
        device = MTLCreateSystemDefaultDevice()
        commandQueue = device.makeCommandQueue()
        
        CVMetalTextureCacheCreate(nil, nil, device, nil, &textureCache)
    }
    
    func renderMetalContentToVideo(adaptor: AVAssetWriterInputPixelBufferAdaptor,
                                  frameCount: Int,
                                  renderBlock: @escaping (MTLTexture, Int) -> Void) async {
        
        self.adaptor = adaptor
        let frameDuration = CMTime(value: 1, timescale: 60)
        
        await withCheckedContinuation { continuation in
            let metalQueue = DispatchQueue(label: "metal.render", qos: .userInitiated)
            
            adaptor.assetWriterInput.requestMediaDataWhenReady(on: metalQueue) {
                var frameIndex = 0
                var currentTime = CMTime.zero
                
                while frameIndex < frameCount {
                    if adaptor.assetWriterInput.isReadyForMoreMediaData {
                        if let pixelBuffer = self.createMetalRenderedFrame(frameIndex: frameIndex,
                                                                          renderBlock: renderBlock) {
                            _ = adaptor.append(pixelBuffer, withPresentationTime: currentTime)
                        }
                        
                        currentTime = CMTimeAdd(currentTime, frameDuration)
                        frameIndex += 1
                    } else {
                        Thread.sleep(forTimeInterval: 0.016) // ~60fps
                    }
                }
                
                adaptor.assetWriterInput.markAsFinished()
                continuation.resume()
            }
        }
    }
    
    private func createMetalRenderedFrame(frameIndex: Int,
                                        renderBlock: (MTLTexture, Int) -> Void) -> CVPixelBuffer? {
        
        guard let pool = adaptor.pixelBufferPool else { return nil }
        
        var pixelBuffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
        
        guard let buffer = pixelBuffer else { return nil }
        
        let width = CVPixelBufferGetWidth(buffer)
        let height = CVPixelBufferGetHeight(buffer)
        
        var metalTexture: CVMetalTexture?
        CVMetalTextureCacheCreateTextureFromImage(
            nil,
            textureCache,
            buffer,
            nil,
            .bgra8Unorm,
            width,
            height,
            0,
            &metalTexture
        )
        
        guard let texture = metalTexture,
              let mtlTexture = CVMetalTextureGetTexture(texture) else { return nil }
        
        // 执行 Metal 渲染
        renderBlock(mtlTexture, frameIndex)
        
        return buffer
    }
}
```

## 完整的视频创建工作流

```swift
class CompleteVideoCreator {
    private var assetWriter: AVAssetWriter!
    private var videoInput: AVAssetWriterInput!
    private var audioInput: AVAssetWriterInput!
    private var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    func createVideoWithAudio(outputURL: URL,
                             videoSize: CGSize,
                             frameRate: Int32 = 30) async throws {
        
        try setupVideoWriter(outputURL: outputURL, videoSize: videoSize, frameRate: frameRate)
        
        // 同时处理视频和音频
        await withTaskGroup(of: Void.self) { group in
            group.addTask {
                await self.processVideoFrames()
            }
            
            group.addTask {
                await self.processAudioSamples()
            }
        }
        
        // 完成写入
        await finishWriting()
    }
    
    private func setupVideoWriter(outputURL: URL, 
                                videoSize: CGSize, 
                                frameRate: Int32) throws {
        
        assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
        
        // 视频设置
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: Int(videoSize.width),
            AVVideoHeightKey: Int(videoSize.height),
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 5000000,
                AVVideoMaxKeyFrameIntervalKey: frameRate,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
            ]
        ]
        
        videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        videoInput.expectsMediaDataInRealTime = false
        
        // 音频设置
        let audioSettings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 2,
            AVEncoderBitRateKey: 128000
        ]
        
        audioInput = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
        audioInput.expectsMediaDataInRealTime = false
        
        // 像素缓冲区适配器
        let pixelBufferAttributes: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
            kCVPixelBufferWidthKey as String: Int(videoSize.width),
            kCVPixelBufferHeightKey as String: Int(videoSize.height),
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
        ]
        
        pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
            assetWriterInput: videoInput,
            sourcePixelBufferAttributes: pixelBufferAttributes
        )
        
        // 添加输入
        assetWriter.add(videoInput)
        assetWriter.add(audioInput)
        
        // 开始写入
        assetWriter.startWriting()
        assetWriter.startSession(atSourceTime: .zero)
    }
    
    private func processVideoFrames() async {
        // 视频帧处理逻辑
        await withCheckedContinuation { continuation in
            let videoQueue = DispatchQueue(label: "video.processing")
            
            videoInput.requestMediaDataWhenReady(on: videoQueue) {
                // 处理视频帧
                // ...
                self.videoInput.markAsFinished()
                continuation.resume()
            }
        }
    }
    
    private func processAudioSamples() async {
        // 音频样本处理逻辑
        await withCheckedContinuation { continuation in
            let audioQueue = DispatchQueue(label: "audio.processing")
            
            audioInput.requestMediaDataWhenReady(on: audioQueue) {
                // 处理音频样本
                // ...
                self.audioInput.markAsFinished()
                continuation.resume()
            }
        }
    }
    
    private func finishWriting() async {
        await withCheckedContinuation { continuation in
            assetWriter.finishWriting {
                continuation.resume()
            }
        }
    }
}
```

## 总结

AVAssetWriterInputPixelBufferAdaptor 是创建高质量视频内容的强大工具，它提供了：

- **简化的像素缓冲区处理**: 直接处理 CVPixelBuffer 对象
- **高效的内存管理**: 通过像素缓冲区池优化性能
- **灵活的渲染选项**: 支持 Core Graphics、Core Image、Metal 等渲染技术
- **精确的时间控制**: 精确控制每帧的显示时间

通过合理使用这个类，可以创建从简单的图像序列到复杂的实时渲染视频等各种类型的视频内容。关键是要注意内存管理、时间同步和格式兼容性等方面的最佳实践。