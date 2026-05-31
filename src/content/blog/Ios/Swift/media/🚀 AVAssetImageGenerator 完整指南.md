---
title: "AVAssetImageGenerator 完整指南"
description: "1. 性能优化： 合理设置 maximumSize 使用适当的时间容差 在后台队列进行生成操作"
pubDate: 2026-05-29
category: "media"
tags: [iOS, Swift, Array, API]
draft: false
---
# 🚀 AVAssetImageGenerator 完整指南

## 概述
AVAssetImageGenerator 是 AVFoundation 框架中用于从视频资源生成静态图像的核心类，常用于视频缩略图生成、视频帧提取、视频预览等场景。

## 类层次结构
```
NSObject
└── AVAssetImageGenerator
```

## 初始化方法

### 1. 基础初始化

```swift
// 主要初始化方法
init(asset: AVAsset)

// 使用示例
let asset = AVAsset(url: videoURL)
let imageGenerator = AVAssetImageGenerator(asset: asset)
```

### 2. 便捷创建

```swift
// 从 URL 创建
let url = URL(fileURLWithPath: "path/to/video.mp4")
let asset = AVAsset(url: url)
let generator = AVAssetImageGenerator(asset: asset)

// 从 AVPlayerItem 创建
let playerItem = AVPlayerItem(url: url)
let generator = AVAssetImageGenerator(asset: playerItem.asset)
```

## 核心属性

### 1. 基础配置属性

```swift
// 关联的资源（只读）
var asset: AVAsset { get }

// 生成图像的最大尺寸
var maximumSize: CGSize

// 应用首选的变换矩阵（处理视频旋转）
var appliesPreferredTrackTransform: Bool

// 视频合成器（用于复杂视频效果）
var videoComposition: AVVideoComposition?

// 自定义视频合成器
var customVideoCompositor: AVVideoCompositing? { get }
```

### 2. 时间容差属性

```swift
// 请求时间的前向容差
var requestedTimeToleranceBefore: CMTime

// 请求时间的后向容差  
var requestedTimeToleranceAfter: CMTime

// 示例设置
imageGenerator.requestedTimeToleranceBefore = CMTime.zero
imageGenerator.requestedTimeToleranceAfter = CMTime.zero // 精确时间定位
```

### 3. 渲染设置 (iOS 16+)

```swift
// 异步渲染模式
@available(iOS 16.0, *)
var prefersAsynchronousImageGeneration: Bool
```

## 图像生成方法

### 1. 同步生成单张图像

```swift
// 生成指定时间的图像
func copyCGImage(at requestedTime: CMTime, actualTime: UnsafeMutablePointer<CMTime>?) throws -> CGImage

// 使用示例
do {
    var actualTime = CMTime.zero
    let cgImage = try imageGenerator.copyCGImage(
        at: CMTime(seconds: 5.0, preferredTimescale: 600),
        actualTime: &actualTime
    )
    let image = UIImage(cgImage: cgImage)
    print("实际时间: \(CMTimeGetSeconds(actualTime))")
} catch {
    print("生成图像失败: \(error)")
}
```

### 2. 异步生成单张图像

```swift
// 异步生成图像
func generateCGImagesAsynchronously(forTimes requestedTimes: [NSValue], 
                                   completionHandler handler: @escaping AVAssetImageGeneratorCompletionHandler)

// 完成回调类型
typealias AVAssetImageGeneratorCompletionHandler = (CMTime, CGImage?, CMTime, AVAssetImageGenerator.Result, Error?) -> Void

// 使用示例
let times = [NSValue(time: CMTime(seconds: 5.0, preferredTimescale: 600))]
imageGenerator.generateCGImagesAsynchronously(forTimes: times) { requestedTime, cgImage, actualTime, result, error in
    DispatchQueue.main.async {
        switch result {
        case .succeeded:
            if let cgImage = cgImage {
                let image = UIImage(cgImage: cgImage)
                // 使用生成的图像
            }
        case .failed:
            print("生成失败: \(error?.localizedDescription ?? "未知错误")")
        case .cancelled:
            print("生成被取消")
        @unknown default:
            print("未知结果")
        }
    }
}
```

### 3. 批量生成图像

```swift
// 生成多个时间点的图像
func generateMultipleImages() {
    let duration = CMTime(seconds: 60, preferredTimescale: 600) // 假设60秒视频
    var times: [NSValue] = []
    
    // 每5秒生成一个缩略图
    for second in stride(from: 0, to: 60, by: 5) {
        let time = CMTime(seconds: Double(second), preferredTimescale: 600)
        times.append(NSValue(time: time))
    }
    
    imageGenerator.generateCGImagesAsynchronously(forTimes: times) { requestedTime, cgImage, actualTime, result, error in
        switch result {
        case .succeeded:
            if let cgImage = cgImage {
                let image = UIImage(cgImage: cgImage)
                let seconds = CMTimeGetSeconds(actualTime)
                print("生成第 \(seconds) 秒的缩略图")
                // 保存或使用图像
            }
        case .failed:
            print("生成失败: \(error?.localizedDescription ?? "")")
        case .cancelled:
            print("生成被取消")
        @unknown default:
            break
        }
    }
}
```

## 结果枚举

```swift
enum AVAssetImageGenerator.Result : Int {
    case succeeded  // 成功
    case failed     // 失败
    case cancelled  // 取消
}
```

## 操作控制

### 1. 取消操作

```swift
// 取消所有正在进行的图像生成操作
func cancelAllCGImageGeneration()

// 使用示例
imageGenerator.generateCGImagesAsynchronously(forTimes: times) { ... }

// 如果需要取消
imageGenerator.cancelAllCGImageGeneration()
```

## 高级配置

### 1. 时间容差详解

```swift
// 精确时间定位（性能较慢）
imageGenerator.requestedTimeToleranceBefore = CMTime.zero
imageGenerator.requestedTimeToleranceAfter = CMTime.zero

// 允许一定误差（性能较好）
imageGenerator.requestedTimeToleranceBefore = CMTime(seconds: 0.1, preferredTimescale: 600)
imageGenerator.requestedTimeToleranceAfter = CMTime(seconds: 0.1, preferredTimescale: 600)

// 允许任意时间（最佳性能）
imageGenerator.requestedTimeToleranceBefore = CMTime.positiveInfinity
imageGenerator.requestedTimeToleranceAfter = CMTime.positiveInfinity
```

### 2. 图像尺寸控制

```swift
// 设置最大尺寸
imageGenerator.maximumSize = CGSize(width: 1920, height: 1080)

// 按比例缩放
let originalSize = CGSize(width: 3840, height: 2160) // 4K
let scaleFactor: CGFloat = 0.5
imageGenerator.maximumSize = CGSize(
    width: originalSize.width * scaleFactor,
    height: originalSize.height * scaleFactor
)

// 适应屏幕尺寸
let screenSize = UIScreen.main.bounds.size
let screenScale = UIScreen.main.scale
imageGenerator.maximumSize = CGSize(
    width: screenSize.width * screenScale,
    height: screenSize.height * screenScale
)
```

### 3. 视频变换处理

```swift
// 自动处理视频旋转
imageGenerator.appliesPreferredTrackTransform = true

// 手动检查视频方向
func checkVideoOrientation(asset: AVAsset) async {
    do {
        let tracks = try await asset.loadTracks(withMediaType: .video)
        if let videoTrack = tracks.first {
            let transform = try await videoTrack.load(.preferredTransform)
            let size = try await videoTrack.load(.naturalSize)
            
            print("视频尺寸: \(size)")
            print("变换矩阵: \(transform)")
            
            // 根据变换矩阵判断视频方向
            let angle = atan2(transform.b, transform.a)
            let degrees = angle * 180 / .pi
            print("旋转角度: \(degrees)°")
        }
    } catch {
        print("获取视频信息失败: \(error)")
    }
}
```

## 实用扩展和工具

### 1. 便捷生成方法

```swift
extension AVAssetImageGenerator {
    
    // 便捷生成单张图像
    func generateImage(at time: CMTime, completion: @escaping (UIImage?) -> Void) {
        generateCGImagesAsynchronously(forTimes: [NSValue(time: time)]) { _, cgImage, _, result, _ in
            DispatchQueue.main.async {
                if result == .succeeded, let cgImage = cgImage {
                    completion(UIImage(cgImage: cgImage))
                } else {
                    completion(nil)
                }
            }
        }
    }
    
    // 生成视频缩略图网格
    func generateThumbnailGrid(count: Int, completion: @escaping ([UIImage]) -> Void) {
        Task {
            guard let duration = try? await asset.load(.duration) else {
                DispatchQueue.main.async { completion([]) }
                return
            }
            
            let durationSeconds = CMTimeGetSeconds(duration)
            let interval = durationSeconds / Double(count)
            
            var times: [NSValue] = []
            for i in 0..<count {
                let time = CMTime(seconds: interval * Double(i), preferredTimescale: 600)
                times.append(NSValue(time: time))
            }
            
            var images: [UIImage] = []
            let group = DispatchGroup()
            
            generateCGImagesAsynchronously(forTimes: times) { _, cgImage, _, result, _ in
                group.enter()
                if result == .succeeded, let cgImage = cgImage {
                    images.append(UIImage(cgImage: cgImage))
                }
                group.leave()
            }
            
            group.notify(queue: .main) {
                completion(images.sorted { img1, img2 in
                    // 这里需要根据实际时间排序，简化示例
                    return true
                })
            }
        }
    }
}
```

### 2. 缓存管理

```swift
class ThumbnailCache {
    private let cache = NSCache<NSString, UIImage>()
    private let imageGenerator: AVAssetImageGenerator
    
    init(asset: AVAsset) {
        self.imageGenerator = AVAssetImageGenerator(asset: asset)
        setupImageGenerator()
    }
    
    private func setupImageGenerator() {
        imageGenerator.appliesPreferredTrackTransform = true
        imageGenerator.maximumSize = CGSize(width: 400, height: 300)
        imageGenerator.requestedTimeToleranceBefore = CMTime(seconds: 0.1, preferredTimescale: 600)
        imageGenerator.requestedTimeToleranceAfter = CMTime(seconds: 0.1, preferredTimescale: 600)
    }
    
    func getThumbnail(at time: CMTime, completion: @escaping (UIImage?) -> Void) {
        let key = String(CMTimeGetSeconds(time)) as NSString
        
        // 检查缓存
        if let cachedImage = cache.object(forKey: key) {
            completion(cachedImage)
            return
        }
        
        // 生成新图像
        imageGenerator.generateImage(at: time) { [weak self] image in
            if let image = image {
                self?.cache.setObject(image, forKey: key)
            }
            completion(image)
        }
    }
    
    func clearCache() {
        cache.removeAllObjects()
    }
}
```

### 3. 错误处理

```swift
enum ThumbnailError: Error {
    case assetLoadFailed
    case invalidTime
    case generationFailed(underlying: Error)
    case cancelled
    
    var localizedDescription: String {
        switch self {
        case .assetLoadFailed:
            return "视频资源加载失败"
        case .invalidTime:
            return "无效的时间参数"
        case .generationFailed(let error):
            return "图像生成失败: \(error.localizedDescription)"
        case .cancelled:
            return "操作被取消"
        }
    }
}

extension AVAssetImageGenerator {
    func generateImageSafely(at time: CMTime) async throws -> UIImage {
        // 验证时间有效性
        guard time.isValid && !time.isIndefinite else {
            throw ThumbnailError.invalidTime
        }
        
        // 验证资源状态
        guard await asset.isPlayable else {
            throw ThumbnailError.assetLoadFailed
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            generateCGImagesAsynchronously(forTimes: [NSValue(time: time)]) { _, cgImage, _, result, error in
                switch result {
                case .succeeded:
                    if let cgImage = cgImage {
                        continuation.resume(returning: UIImage(cgImage: cgImage))
                    } else {
                        continuation.resume(throwing: ThumbnailError.generationFailed(underlying: error ?? NSError(domain: "Unknown", code: -1)))
                    }
                case .failed:
                    continuation.resume(throwing: ThumbnailError.generationFailed(underlying: error ?? NSError(domain: "Generation failed", code: -1)))
                case .cancelled:
                    continuation.resume(throwing: ThumbnailError.cancelled)
                @unknown default:
                    continuation.resume(throwing: ThumbnailError.generationFailed(underlying: NSError(domain: "Unknown result", code: -1)))
                }
            }
        }
    }
}
```

## 性能优化

### 1. 批量处理优化

```swift
class OptimizedThumbnailGenerator {
    private let imageGenerator: AVAssetImageGenerator
    private let serialQueue = DispatchQueue(label: "thumbnail.generation", qos: .utility)
    
    init(asset: AVAsset) {
        self.imageGenerator = AVAssetImageGenerator(asset: asset)
        setupOptimalConfiguration()
    }
    
    private func setupOptimalConfiguration() {
        // 优化配置
        imageGenerator.appliesPreferredTrackTransform = true
        imageGenerator.maximumSize = CGSize(width: 320, height: 240) // 适中尺寸
        
        // 允许适度的时间容差以提高性能
        let tolerance = CMTime(seconds: 0.05, preferredTimescale: 600)
        imageGenerator.requestedTimeToleranceBefore = tolerance
        imageGenerator.requestedTimeToleranceAfter = tolerance
        
        // iOS 16+ 异步渲染
        if #available(iOS 16.0, *) {
            imageGenerator.prefersAsynchronousImageGeneration = true
        }
    }
    
    func generateThumbnails(at times: [CMTime], progress: @escaping (Int, Int) -> Void, completion: @escaping ([UIImage]) -> Void) {
        serialQueue.async { [weak self] in
            guard let self = self else { return }
            
            let nsValueTimes = times.map { NSValue(time: $0) }
            var results: [Int: UIImage] = [:]
            var completedCount = 0
            
            self.imageGenerator.generateCGImagesAsynchronously(forTimes: nsValueTimes) { requestedTime, cgImage, actualTime, result, error in
                
                if result == .succeeded, let cgImage = cgImage {
                    if let index = times.firstIndex(where: { CMTimeCompare($0, requestedTime) == 0 }) {
                        results[index] = UIImage(cgImage: cgImage)
                    }
                }
                
                completedCount += 1
                
                DispatchQueue.main.async {
                    progress(completedCount, times.count)
                    
                    if completedCount == times.count {
                        // 按原始顺序组装结果
                        let orderedResults = (0..<times.count).compactMap { results[$0] }
                        completion(orderedResults)
                    }
                }
            }
        }
    }
}
```

### 2. 内存管理

```swift
class MemoryEfficientGenerator {
    private var imageGenerator: AVAssetImageGenerator?
    private let maxCacheSize = 20
    
    func generateThumbnail(for asset: AVAsset, at time: CMTime, completion: @escaping (UIImage?) -> Void) {
        // 延迟创建生成器
        if imageGenerator?.asset != asset {
            imageGenerator = AVAssetImageGenerator(asset: asset)
            setupGenerator()
        }
        
        imageGenerator?.generateImage(at: time, completion: completion)
    }
    
    private func setupGenerator() {
        imageGenerator?.appliesPreferredTrackTransform = true
        imageGenerator?.maximumSize = CGSize(width: 300, height: 200)
    }
    
    func cleanup() {
        imageGenerator?.cancelAllCGImageGeneration()
        imageGenerator = nil
    }
    
    deinit {
        cleanup()
    }
}
```

## 常见问题和解决方案

### 1. 图像方向问题

```swift
// 解决方案：确保设置变换
imageGenerator.appliesPreferredTrackTransform = true

// 手动处理方向
func correctImageOrientation(cgImage: CGImage, transform: CGAffineTransform) -> UIImage {
    let image = UIImage(cgImage: cgImage)
    
    // 根据变换矩阵调整图像方向
    let angle = atan2(transform.b, transform.a)
    let orientation: UIImage.Orientation
    
    switch angle {
    case .pi / 2: orientation = .left
    case -.pi / 2: orientation = .right  
    case .pi: orientation = .down
    default: orientation = .up
    }
    
    return UIImage(cgImage: cgImage, scale: 1.0, orientation: orientation)
}
```

### 2. 性能问题

```swift
// 问题：生成大量缩略图时性能差
// 解决方案：
// 1. 减少最大尺寸
imageGenerator.maximumSize = CGSize(width: 200, height: 150)

// 2. 增加时间容差
imageGenerator.requestedTimeToleranceBefore = CMTime(seconds: 0.1, preferredTimescale: 600)
imageGenerator.requestedTimeToleranceAfter = CMTime(seconds: 0.1, preferredTimescale: 600)

// 3. 使用后台队列
DispatchQueue.global(qos: .utility).async {
    // 生成缩略图
}
```

### 3. 内存问题

```swift
// 问题：生成大量图像导致内存压力
// 解决方案：
class MemoryAwareThumbnailGenerator {
    private let cache = NSCache<NSString, UIImage>()
    
    init() {
        // 设置缓存限制
        cache.countLimit = 50
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB
        
        // 监听内存警告
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMemoryWarning),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
    }
    
    @objc private func handleMemoryWarning() {
        cache.removeAllObjects()
    }
}
```

## 实际应用场景

### 1. 视频进度条预览

```swift
class VideoScrubberPreview {
    private let imageGenerator: AVAssetImageGenerator
    private var previewCache: [String: UIImage] = [:]
    
    init(asset: AVAsset) {
        self.imageGenerator = AVAssetImageGenerator(asset: asset)
        setupForScrubbing()
    }
    
    private func setupForScrubbing() {
        imageGenerator.appliesPreferredTrackTransform = true
        imageGenerator.maximumSize = CGSize(width: 160, height: 90) // 16:9 缩略图
        imageGenerator.requestedTimeToleranceBefore = CMTime.zero
        imageGenerator.requestedTimeToleranceAfter = CMTime.zero
    }
    
    func getPreviewImage(at time: CMTime, completion: @escaping (UIImage?) -> Void) {
        let key = String(format: "%.2f", CMTimeGetSeconds(time))
        
        if let cached = previewCache[key] {
            completion(cached)
            return
        }
        
        imageGenerator.generateImage(at: time) { [weak self] image in
            if let image = image {
                self?.previewCache[key] = image
            }
            completion(image)
        }
    }
}
```

### 2. 视频缩略图网格

```swift
class VideoThumbnailGrid {
    func generateGrid(for asset: AVAsset, rows: Int, columns: Int, completion: @escaping ([[UIImage]]) -> Void) {
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 150, height: 100)
        
        Task {
            guard let duration = try? await asset.load(.duration) else {
                completion([])
                return
            }
            
            let totalFrames = rows * columns
            let interval = CMTimeGetSeconds(duration) / Double(totalFrames)
            
            var times: [CMTime] = []
            for i in 0..<totalFrames {
                let time = CMTime(seconds: interval * Double(i), preferredTimescale: 600)
                times.append(time)
            }
            
            var images: [UIImage] = []
            let group = DispatchGroup()
            
            for time in times {
                group.enter()
                generator.generateImage(at: time) { image in
                    if let image = image {
                        images.append(image)
                    }
                    group.leave()
                }
            }
            
            group.notify(queue: .main) {
                // 转换为二维数组
                var grid: [[UIImage]] = []
                for row in 0..<rows {
                    let startIndex = row * columns
                    let endIndex = min(startIndex + columns, images.count)
                    if startIndex < images.count {
                        let rowImages = Array(images[startIndex..<endIndex])
                        grid.append(rowImages)
                    }
                }
                completion(grid)
            }
        }
    }
}
```

## 最佳实践

1. **性能优化**：
   - 合理设置 `maximumSize`
   - 使用适当的时间容差
   - 在后台队列进行生成操作

2. **内存管理**：
   - 及时取消不需要的操作
   - 使用缓存但设置合理限制
   - 监听内存警告

3. **用户体验**：
   - 提供生成进度反馈
   - 实现取消机制
   - 处理错误情况

4. **代码组织**：
   - 封装常用功能
   - 使用依赖注入
   - 分离业务逻辑

## 总结

AVAssetImageGenerator 是处理视频帧提取的强大工具，通过合理配置和使用，可以实现高性能的视频缩略图生成、进度条预览等功能。关键是要根据具体需求平衡性能、质量和内存使用。