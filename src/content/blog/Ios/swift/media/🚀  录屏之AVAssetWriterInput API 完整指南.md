---
title: "录屏之AVAssetWriterInput API 完整指南"
description: "AVAssetWriterInput 是 AVFoundation 框架中用于向 AVAssetWriter 提供媒体数据的类。它负责接收音频、视频或其他媒体样本，并将其编码写入到输出文件中。每个 AVAssetWriterInput..."
pubDate: 2026-05-29
category: "media"
tags: [iOS, Swift, API]
draft: false
---
# 🚀  AVAssetWriterInput API 完整指南

## 概述

AVAssetWriterInput 是 AVFoundation 框架中用于向 AVAssetWriter 提供媒体数据的类。它负责接收音频、视频或其他媒体样本，并将其编码写入到输出文件中。每个 AVAssetWriterInput 实例对应一个媒体轨道。

## 类的定义

```swift
class AVAssetWriterInput : NSObject
```

## 初始化方法

### init(mediaType:outputSettings:)
```swift
init(mediaType: AVMediaType, outputSettings: [String : Any]?)
```
- **功能**: 创建指定媒体类型和输出设置的输入
- **参数**: 
  - `mediaType`: 媒体类型（.video, .audio, .text 等）
  - `outputSettings`: 输出设置字典（可为 nil 表示直通）

### init(mediaType:outputSettings:sourceFormatHint:)
```swift
init(mediaType: AVMediaType, outputSettings: [String : Any]?, sourceFormatHint: CMFormatDescription?)
```
- **功能**: 创建带有源格式提示的输入
- **参数**: 
  - `mediaType`: 媒体类型
  - `outputSettings`: 输出设置字典
  - `sourceFormatHint`: 源格式描述提示

## 核心属性

### mediaType
```swift
var mediaType: AVMediaType { get }
```
- **功能**: 获取媒体类型
- **类型**: 只读属性

### outputSettings
```swift
var outputSettings: [String : Any]? { get }
```
- **功能**: 获取输出设置
- **类型**: 只读可选字典

### sourceFormatHint
```swift
var sourceFormatHint: CMFormatDescription? { get }
```
- **功能**: 获取源格式提示
- **类型**: 只读可选属性

## 样本写入相关

### isReadyForMoreMediaData
```swift
var isReadyForMoreMediaData: Bool { get }
```
- **功能**: 检查是否准备好接收更多媒体数据
- **类型**: 只读布尔值

### append(_:)
```swift
func append(_ sampleBuffer: CMSampleBuffer) -> Bool
```
- **功能**: 追加样本缓冲区到输入
- **参数**: `sampleBuffer`: 要追加的样本缓冲区
- **返回**: 成功返回 true

### markAsFinished()
```swift
func markAsFinished()
```
- **功能**: 标记输入为完成状态，不再接收数据

## 实时处理设置

### expectsMediaDataInRealTime
```swift
var expectsMediaDataInRealTime: Bool { get set }
```
- **功能**: 设置是否期望实时媒体数据
- **默认值**: false
- **用途**: 影响编码器的行为和性能优化

## 请求媒体数据

### requestMediaDataWhenReady(on:using:)
```swift
func requestMediaDataWhenReady(on queue: DispatchQueue, using block: @escaping () -> Void)
```
- **功能**: 当准备好接收数据时在指定队列执行回调
- **参数**: 
  - `queue`: 执行回调的调度队列
  - `block`: 准备好时执行的回调闭包

## 元数据和语言设置

### metadata
```swift
var metadata: [AVMetadataItem]? { get set }
```
- **功能**: 获取或设置轨道的元数据
- **类型**: 可读写的可选数组

### languageCode
```swift
var languageCode: String? { get set }
```
- **功能**: 设置语言代码（ISO 639-2/T 标准）
- **类型**: 可选字符串

### extendedLanguageTag
```swift
var extendedLanguageTag: String? { get set }
```
- **功能**: 设置扩展语言标签（BCP 47 标准）
- **类型**: 可选字符串

### naturalSize
```swift
var naturalSize: CGSize { get set }
```
- **功能**: 设置媒体的自然尺寸（主要用于视频）
- **默认值**: CGSize.zero

## 变换设置

### transform
```swift
var transform: CGAffineTransform { get set }
```
- **功能**: 设置应用于轨道的仿射变换
- **默认值**: CGAffineTransform.identity
- **用途**: 旋转、缩放、平移视频

## 像素缓冲区适配器

### pixelBufferAdaptor
```swift
var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor? { get }
```
- **功能**: 获取关联的像素缓冲区适配器
- **类型**: 只读可选属性

## 多通道音频设置

### audioSettings
```swift
var audioSettings: [String : Any]? { get }
```
- **功能**: 获取音频特定的输出设置
- **类型**: 只读可选字典

### audioChannelLayout
```swift
var audioChannelLayout: AVAudioChannelLayout? { get set }
```
- **功能**: 设置音频通道布局
- **类型**: 可读写的可选属性

## 性能和质量设置

### preferredVolume
```swift
var preferredVolume: Float { get set }
```
- **功能**: 设置首选音量
- **范围**: 0.0 到 1.0
- **默认值**: 1.0

### layer
```swift
var layer: Int { get set }
```
- **功能**: 设置轨道的层级
- **默认值**: 0

### mediaTimeScale
```swift
var mediaTimeScale: CMTimeScale { get set }
```
- **功能**: 设置媒体时间刻度
- **默认值**: 0（使用默认值）

## 输出文件格式相关

### marksOutputTrackAsEnabled
```swift
var marksOutputTrackAsEnabled: Bool { get set }
```
- **功能**: 标记输出轨道是否启用
- **默认值**: true

### alternateGroupID
```swift
var alternateGroupID: Int16 { get set }
```
- **功能**: 设置备用组ID
- **默认值**: 0

## 静态方法

### availableOutputSettingsKeys(for:)
```swift
class func availableOutputSettingsKeys(for mediaType: AVMediaType) -> [String]
```
- **功能**: 获取指定媒体类型的可用输出设置键
- **参数**: `mediaType`: 媒体类型
- **返回**: 设置键的字符串数组

## 使用示例

### 视频输入设置

```swift
import AVFoundation

class VideoInputManager {
    private var videoInput: AVAssetWriterInput?
    
    func setupVideoInput() {
        // 视频输出设置
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: 1920,
            AVVideoHeightKey: 1080,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 5000000,
                AVVideoMaxKeyFrameIntervalKey: 30,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
            ]
        ]
        
        videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        
        // 配置属性
        videoInput?.expectsMediaDataInRealTime = true
        videoInput?.transform = CGAffineTransform(rotationAngle: .pi / 2) // 90度旋转
        
        // 设置元数据
        let metadata = AVMutableMetadataItem()
        metadata.key = AVMetadataKey.commonKeyTitle as NSString
        metadata.keySpace = AVMetadataKeySpace.common
        metadata.value = "My Video" as NSString
        videoInput?.metadata = [metadata]
    }
    
    func appendVideoSample(_ sampleBuffer: CMSampleBuffer) -> Bool {
        guard let input = videoInput,
              input.isReadyForMoreMediaData else {
            return false
        }
        
        return input.append(sampleBuffer)
    }
}
```

### 音频输入设置

```swift
class AudioInputManager {
    private var audioInput: AVAssetWriterInput?
    
    func setupAudioInput() {
        // 音频输出设置
        let audioSettings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 2,
            AVEncoderBitRateKey: 128000,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        audioInput = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
        
        // 配置属性
        audioInput?.expectsMediaDataInRealTime = true
        audioInput?.preferredVolume = 0.8
        
        // 设置声道布局（立体声）
        let channelLayout = AVAudioChannelLayout(layoutTag: kAudioChannelLayoutTag_Stereo)
        audioInput?.audioChannelLayout = channelLayout
    }
    
    func appendAudioSample(_ sampleBuffer: CMSampleBuffer) -> Bool {
        guard let input = audioInput,
              input.isReadyForMoreMediaData else {
            return false
        }
        
        return input.append(sampleBuffer)
    }
}
```

### 使用像素缓冲区适配器

```swift
class PixelBufferVideoInput {
    private var videoInput: AVAssetWriterInput?
    private var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor?
    
    func setupWithPixelBufferAdaptor() {
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: 1920,
            AVVideoHeightKey: 1080
        ]
        
        videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        
        // 像素缓冲区属性
        let pixelBufferAttributes: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
            kCVPixelBufferWidthKey as String: 1920,
            kCVPixelBufferHeightKey as String: 1080
        ]
        
        pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
            assetWriterInput: videoInput!,
            sourcePixelBufferAttributes: pixelBufferAttributes
        )
    }
    
    func appendPixelBuffer(_ pixelBuffer: CVPixelBuffer, at presentationTime: CMTime) -> Bool {
        guard let adaptor = pixelBufferAdaptor,
              adaptor.assetWriterInput.isReadyForMoreMediaData else {
            return false
        }
        
        return adaptor.append(pixelBuffer, withPresentationTime: presentationTime)
    }
}
```

### 异步媒体数据写入

```swift
class AsyncMediaWriter {
    private var videoInput: AVAssetWriterInput?
    private let mediaQueue = DispatchQueue(label: "media.write.queue")
    private var sampleBuffers: [CMSampleBuffer] = []
    
    func startAsyncWriting() {
        guard let input = videoInput else { return }
        
        input.requestMediaDataWhenReady(on: mediaQueue) { [weak self] in
            guard let self = self else { return }
            
            while input.isReadyForMoreMediaData && !self.sampleBuffers.isEmpty {
                let sampleBuffer = self.sampleBuffers.removeFirst()
                
                if !input.append(sampleBuffer) {
                    print("Failed to append sample buffer")
                    break
                }
            }
            
            // 如果没有更多数据，标记完成
            if self.sampleBuffers.isEmpty {
                input.markAsFinished()
            }
        }
    }
    
    func addSampleBuffer(_ sampleBuffer: CMSampleBuffer) {
        mediaQueue.async {
            self.sampleBuffers.append(sampleBuffer)
        }
    }
}
```

## 常用输出设置

### 视频输出设置键值

```swift
// H.264 编码设置
let h264Settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: 1920,
    AVVideoHeightKey: 1080,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 5000000,              // 平均比特率
        AVVideoMaxKeyFrameIntervalKey: 30,              // 最大关键帧间隔
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCAVLC,
        AVVideoExpectedSourceFrameRateKey: 30,          // 预期帧率
        AVVideoAverageNonDroppableFrameRateKey: 30      // 平均不可丢弃帧率
    ]
]

// HEVC 编码设置
let hevcSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.hevc,
    AVVideoWidthKey: 3840,
    AVVideoHeightKey: 2160,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 20000000,
        AVVideoQualityKey: 0.8,
        AVVideoMaxKeyFrameIntervalKey: 60
    ]
]
```

### 音频输出设置键值

```swift
// AAC 编码设置
let aacSettings: [String: Any] = [
    AVFormatIDKey: kAudioFormatMPEG4AAC,
    AVSampleRateKey: 44100,
    AVNumberOfChannelsKey: 2,
    AVEncoderBitRateKey: 128000,
    AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
]

// LPCM 编码设置
let lpcmSettings: [String: Any] = [
    AVFormatIDKey: kAudioFormatLinearPCM,
    AVSampleRateKey: 48000,
    AVNumberOfChannelsKey: 2,
    AVLinearPCMBitDepthKey: 16,
    AVLinearPCMIsFloatKey: false,
    AVLinearPCMIsBigEndianKey: false
]
```

## 最佳实践

### 1. 性能优化
```swift
// 设置实时处理
videoInput.expectsMediaDataInRealTime = true

// 使用适当的队列
let mediaQueue = DispatchQueue(label: "media.queue", qos: .userInitiated)
videoInput.requestMediaDataWhenReady(on: mediaQueue) {
    // 处理媒体数据
}
```

### 2. 错误处理
```swift
func appendSample(_ sampleBuffer: CMSampleBuffer) -> Bool {
    guard videoInput.isReadyForMoreMediaData else {
        print("Input not ready for more media data")
        return false
    }
    
    let success = videoInput.append(sampleBuffer)
    if !success {
        print("Failed to append sample buffer")
    }
    return success
}
```

### 3. 内存管理
```swift
// 及时释放完成的输入
func finishInput() {
    videoInput.markAsFinished()
    videoInput = nil
}
```

### 4. 时间同步
```swift
// 确保音视频时间戳同步
let videoTime = CMSampleBufferGetPresentationTimeStamp(videoSampleBuffer)
let audioTime = CMSampleBufferGetPresentationTimeStamp(audioSampleBuffer)

// 检查时间戳有效性
guard videoTime.isValid && audioTime.isValid else {
    return false
}
```

## 常见问题和解决方案

### 1. 输入未准备好接收数据
```swift
if !videoInput.isReadyForMoreMediaData {
    // 等待或使用 requestMediaDataWhenReady
    videoInput.requestMediaDataWhenReady(on: mediaQueue) {
        // 重试追加操作
    }
}
```

### 2. 样本缓冲区格式不匹配
```swift
// 检查格式描述
let formatDescription = CMSampleBufferGetFormatDescription(sampleBuffer)
let mediaType = CMFormatDescriptionGetMediaType(formatDescription!)

guard mediaType == kCMMediaType_Video else {
    print("Media type mismatch")
    return false
}
```

### 3. 时间戳问题
```swift
// 确保时间戳的连续性和有效性
var previousTimeStamp = CMTime.zero

func validateTimeStamp(_ timeStamp: CMTime) -> Bool {
    guard timeStamp.isValid && timeStamp >= previousTimeStamp else {
        return false
    }
    previousTimeStamp = timeStamp
    return true
}
```

## 注意事项

1. **线程安全**: AVAssetWriterInput 不是线程安全的，应在单一队列中操作
2. **状态管理**: 只能在 AVAssetWriter 开始写入后追加样本
3. **格式兼容**: 确保输入格式与输出设置兼容
4. **内存压力**: 及时处理样本缓冲区，避免内存积压
5. **时间戳顺序**: 样本缓冲区的时间戳必须按递增顺序追加
6. **完成标记**: 写入完成前必须调用 `markAsFinished()`