---
title: "录屏之AVAssetWriter API 完整指南"
description: "AVAssetWriter 是 AVFoundation 框架中用于创建音视频文件的核心类。它允许开发者将音频、视频和元数据样本写入到各种格式的文件中，如 MP4、MOV、M4A 等。"
pubDate: 2026-05-29
category: "media"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀  AVAssetWriter API 完整指南

## 概述

AVAssetWriter 是 AVFoundation 框架中用于创建音视频文件的核心类。它允许开发者将音频、视频和元数据样本写入到各种格式的文件中，如 MP4、MOV、M4A 等。

## 类的定义

```swift
class AVAssetWriter : NSObject
```

## 初始化方法

### init(outputURL:fileType:)
```swift
convenience init(outputURL: URL, fileType: AVFileType) throws
```
- **功能**: 创建一个 AVAssetWriter 实例
- **参数**: 
  - `outputURL`: 输出文件的 URL
  - `fileType`: 文件类型（如 .mp4, .mov, .m4a）
- **抛出**: 如果无法创建实例则抛出异常

### init(contentType:)
```swift
@available(iOS 14.0, macOS 11.0, *)
convenience init(contentType: UTType) throws
```
- **功能**: 使用 UTType 创建 AVAssetWriter 实例
- **参数**: `contentType`: 内容类型

## 核心属性

### outputURL
```swift
var outputURL: URL { get }
```
- **功能**: 获取输出文件的 URL
- **类型**: 只读属性

### outputFileType
```swift
var outputFileType: AVFileType { get }
```
- **功能**: 获取输出文件类型
- **类型**: 只读属性

### status
```swift
var status: AVAssetWriter.Status { get }
```
- **功能**: 获取当前的写入状态
- **状态值**:
  - `.unknown`: 未知状态
  - `.writing`: 正在写入
  - `.completed`: 完成
  - `.failed`: 失败
  - `.cancelled`: 取消

### error
```swift
var error: Error? { get }
```
- **功能**: 获取错误信息（如果有）
- **类型**: 只读可选属性

## 输入管理

### inputs
```swift
var inputs: [AVAssetWriterInput] { get }
```
- **功能**: 获取所有已添加的输入
- **类型**: 只读数组

### canAdd(_:)
```swift
func canAdd(_ input: AVAssetWriterInput) -> Bool
```
- **功能**: 检查是否可以添加指定的输入
- **参数**: `input`: 要检查的 AVAssetWriterInput
- **返回**: 布尔值

### add(_:)
```swift
func add(_ input: AVAssetWriterInput)
```
- **功能**: 添加一个输入到写入器
- **参数**: `input`: 要添加的 AVAssetWriterInput

## 输入组管理

### inputGroups
```swift
var inputGroups: [AVAssetWriterInputGroup] { get }
```
- **功能**: 获取所有已添加的输入组
- **类型**: 只读数组

### canAdd(_:)
```swift
func canAdd(_ inputGroup: AVAssetWriterInputGroup) -> Bool
```
- **功能**: 检查是否可以添加指定的输入组
- **参数**: `inputGroup`: 要检查的 AVAssetWriterInputGroup
- **返回**: 布尔值

### add(_:)
```swift
func add(_ inputGroup: AVAssetWriterInputGroup)
```
- **功能**: 添加一个输入组到写入器
- **参数**: `inputGroup`: 要添加的 AVAssetWriterInputGroup

## 写入控制

### startWriting()
```swift
func startWriting() -> Bool
```
- **功能**: 开始写入过程
- **返回**: 成功返回 true，失败返回 false

### startSession(atSourceTime:)
```swift
func startSession(atSourceTime startTime: CMTime)
```
- **功能**: 在指定的源时间开始会话
- **参数**: `startTime`: 开始时间

### endSession(atSourceTime:)
```swift
func endSession(atSourceTime endTime: CMTime)
```
- **功能**: 在指定的源时间结束会话
- **参数**: `endTime`: 结束时间

### finishWriting(completionHandler:)
```swift
func finishWriting(completionHandler handler: @escaping () -> Void)
```
- **功能**: 完成写入并执行完成回调
- **参数**: `handler`: 完成时的回调闭包

### finishWritingWithCompletionHandler(_:)
```swift
@available(*, deprecated, renamed: "finishWriting(completionHandler:)")
func finishWritingWithCompletionHandler(_ handler: @escaping () -> Void)
```
- **功能**: 已弃用的完成写入方法

### cancelWriting()
```swift
func cancelWriting()
```
- **功能**: 取消写入过程

## 元数据管理

### metadata
```swift
var metadata: [AVMetadataItem] { get set }
```
- **功能**: 获取或设置文件的元数据
- **类型**: 可读写数组

### availableMediaTypes
```swift
var availableMediaTypes: [AVMediaType] { get }
```
- **功能**: 获取可用的媒体类型
- **类型**: 只读数组

## 时间设置

### movieFragmentInterval
```swift
var movieFragmentInterval: CMTime { get set }
```
- **功能**: 设置电影片段间隔
- **默认值**: kCMTimeInvalid

### movieTimeScale
```swift
var movieTimeScale: CMTimeScale { get set }
```
- **功能**: 设置电影时间刻度
- **默认值**: 600

## 其他属性

### shouldOptimizeForNetworkUse
```swift
var shouldOptimizeForNetworkUse: Bool { get set }
```
- **功能**: 是否为网络使用优化
- **默认值**: false

### directoryForTemporaryFiles
```swift
var directoryForTemporaryFiles: URL? { get set }
```
- **功能**: 临时文件目录
- **类型**: 可选 URL

### overallDurationHint
```swift
var overallDurationHint: CMTime { get set }
```
- **功能**: 总持续时间提示
- **默认值**: kCMTimeInvalid

## 静态方法

### availableOutputFileTypes()
```swift
class func availableOutputFileTypes() -> [AVFileType]
```
- **功能**: 获取所有可用的输出文件类型
- **返回**: 文件类型数组

## 状态枚举

```swift
enum AVAssetWriter.Status : Int, @unchecked Sendable {
    case unknown = 0
    case writing = 1
    case completed = 2
    case failed = 3
    case cancelled = 4
}
```

## 使用示例

### 基本视频写入示例

```swift
import AVFoundation

class VideoWriter {
    private var assetWriter: AVAssetWriter?
    private var videoInput: AVAssetWriterInput?
    
    func setupWriter(outputURL: URL) throws {
        // 创建 AVAssetWriter
        assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
        
        // 配置视频输入
        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: 1920,
            AVVideoHeightKey: 1080
        ]
        
        videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
        videoInput?.expectsMediaDataInRealTime = true
        
        // 添加输入
        if let input = videoInput, assetWriter?.canAdd(input) == true {
            assetWriter?.add(input)
        }
        
        // 开始写入
        if assetWriter?.startWriting() == true {
            assetWriter?.startSession(atSourceTime: .zero)
        }
    }
    
    func finishWriting(completion: @escaping () -> Void) {
        videoInput?.markAsFinished()
        assetWriter?.finishWriting {
            DispatchQueue.main.async {
                completion()
            }
        }
    }
}
```

### 音频写入示例

```swift
func setupAudioWriter(outputURL: URL) throws {
    let assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .m4a)
    
    let audioSettings: [String: Any] = [
        AVFormatIDKey: kAudioFormatMPEG4AAC,
        AVSampleRateKey: 44100,
        AVNumberOfChannelsKey: 2,
        AVEncoderBitRateKey: 128000
    ]
    
    let audioInput = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
    
    if assetWriter.canAdd(audioInput) {
        assetWriter.add(audioInput)
    }
    
    if assetWriter.startWriting() {
        assetWriter.startSession(atSourceTime: .zero)
    }
}
```

## 最佳实践

1. **错误处理**: 始终检查 `status` 和 `error` 属性
2. **内存管理**: 及时释放不需要的输入和写入器
3. **线程安全**: 在后台队列执行写入操作
4. **文件管理**: 写入前检查输出路径的可写性
5. **性能优化**: 合理设置 `movieFragmentInterval` 和相关参数

## 常见错误

- `AVErrorDomain`: 写入过程中的常见错误域
- 确保输出文件路径可写
- 检查磁盘空间是否充足
- 验证输入格式与输出格式的兼容性

## 注意事项

- AVAssetWriter 一次只能写入一个文件
- 必须在开始写入前添加所有输入
- 写入过程中不能修改输入配置
- 完成写入后，AVAssetWriter 实例不能重用