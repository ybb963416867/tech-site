---
title: "AVAsset 完整API文档"
description: "AVAsset 是 AVFoundation 框架中的核心类，用于表示音视频资源的抽象基类。它提供了访问媒体资源元数据、轨道信息和时间属性的接口，但不直接用于播放（播放需要使用 AVPlayerItem 和 AVPlayer）。"
pubDate: 2026-05-29
category: "media"
tags: [Git, Swift, API]
draft: false
---
# 🚀 AVAsset 完整API文档 

## 概述

`AVAsset` 是 AVFoundation 框架中的核心类，用于表示音视频资源的抽象基类。它提供了访问媒体资源元数据、轨道信息和时间属性的接口，但不直接用于播放（播放需要使用 `AVPlayerItem` 和 `AVPlayer`）。

***

## 初始化方法

### init(url:)

从 URL 创建资源对象。

```swift
convenience init(url: URL)
```

**示例:**

```swift
let url = URL(fileURLWithPath: "/path/to/video.mp4")
let asset = AVAsset(url: url)

// 或网络URL
let remoteURL = URL(string: "https://example.com/video.mp4")!
let remoteAsset = AVAsset(url: remoteURL)
```

### init(url\:options:)

使用选项从 URL 创建资源。

```swift
convenience init(url: URL, options: [String : Any]?)
```

**常用选项:**

```swift
let options = [
    AVURLAssetPreferPreciseDurationAndTimingKey: true,  // 精确时长
    AVURLAssetHTTPHeaderFieldsKey: ["User-Agent": "MyApp"],  // HTTP头
    AVURLAssetAllowsCellularAccessKey: false  // 禁止蜂窝网络
]
let asset = AVAsset(url: url, options: options)
```

***

## 核心属性

### duration

```swift
var duration: CMTime { get }
```

资源的总时长。

**示例:**

```swift
let duration = asset.duration
let durationInSeconds = duration.seconds
print("时长: \(durationInSeconds) 秒")

// 检查是否有效
if duration.isValid && !duration.isIndefinite {
    print("有效时长")
}
```

### providesPreciseDurationAndTiming

```swift
var providesPreciseDurationAndTiming: Bool { get }
```

是否提供精确的时长和时间信息。

### naturalSize (已废弃)

```swift
@available(*, deprecated)
var naturalSize: CGSize { get }
```

**替代方案:** 使用 `tracks` 获取视频轨道的自然尺寸。

```swift
// 现代方法
if let videoTrack = try? await asset.loadTracks(withMediaType: .video).first {
    let size = try? await videoTrack.load(.naturalSize)
}
```

### preferredRate

```swift
var preferredRate: Float { get }
```

首选播放速率（通常为 1.0）。

### preferredVolume

```swift
var preferredVolume: Float { get }
```

首选音量（0.0 到 1.0）。

### preferredTransform

```swift
var preferredTransform: CGAffineTransform { get }
```

首选变换矩阵（用于处理视频旋转）。

```swift
let transform = asset.preferredTransform
let isPortrait = transform.a == 0 && abs(transform.b) == 1
```

### isPlayable

```swift
var isPlayable: Bool { get }
```

资源是否可播放。

```swift
if asset.isPlayable {
    print("可以播放")
}
```

### isExportable

```swift
var isExportable: Bool { get }
```

资源是否可导出。

### isReadable

```swift
var isReadable: Bool { get }
```

资源是否可读取。

### isComposable

```swift
var isComposable: Bool { get }
```

资源是否可用于合成。

### hasProtectedContent

```swift
var isProtectedContent: Bool { get }
```

资源是否包含受保护的内容（DRM）。

***

## 轨道相关 API

### tracks

```swift
var tracks: [AVAssetTrack] { get }
```

获取所有轨道（已废弃，建议使用异步方法）。

### loadTracks(withMediaType:)

```swift
func loadTracks(withMediaType mediaType: AVMediaType) async throws -> [AVAssetTrack]
```

**异步加载特定类型的轨道。**

```swift
Task {
    do {
        // 加载视频轨道
        let videoTracks = try await asset.loadTracks(withMediaType: .video)
        
        // 加载音频轨道
        let audioTracks = try await asset.loadTracks(withMediaType: .audio)
        
        print("视频轨道数: \(videoTracks.count)")
        print("音频轨道数: \(audioTracks.count)")
    } catch {
        print("加载轨道失败: \(error)")
    }
}
```

### loadTracks(withMediaCharacteristic:)

```swift
func loadTracks(withMediaCharacteristic mediaCharacteristic: AVMediaCharacteristic) async throws -> [AVAssetTrack]
```

加载具有特定特征的轨道。

```swift
// 加载可视轨道
let visualTracks = try await asset.loadTracks(withMediaCharacteristic: .visual)

// 加载可听轨道
let audibleTracks = try await asset.loadTracks(withMediaCharacteristic: .audible)
```

### track(withTrackID:)

```swift
func track(withTrackID trackID: CMPersistentTrackID) -> AVAssetTrack?
```

根据轨道 ID 获取特定轨道。

```swift
if let track = asset.track(withTrackID: 1) {
    print("找到轨道")
}
```

### loadTrack(withTrackID:)

```swift
func loadTrack(withTrackID trackID: CMPersistentTrackID) async throws -> AVAssetTrack?
```

异步加载特定 ID 的轨道。

### tracksWithMediaType(\_:)

```swift
func tracksWithMediaType(_ mediaType: AVMediaType) -> [AVAssetTrack]
```

获取指定媒体类型的轨道（同步，已废弃）。

### tracksWithMediaCharacteristic(\_:)

```swift
func tracksWithMediaCharacteristic(_ mediaCharacteristic: AVMediaCharacteristic) -> [AVAssetTrack]
```

获取具有特定特征的轨道（同步，已废弃）。

### trackGroups

```swift
var trackGroups: [AVAssetTrackGroup] { get }
```

获取轨道组信息。

***

## 元数据 API

### metadata

```swift
var metadata: [AVMetadataItem] { get }
```

资源的元数据数组。

```swift
for item in asset.metadata {
    if let key = item.commonKey?.rawValue,
       let value = item.value {
        print("\(key): \(value)")
    }
}
```

### commonMetadata

```swift
var commonMetadata: [AVMetadataItem] { get }
```

通用格式的元数据。

### availableMetadataFormats

```swift
var availableMetadataFormats: [AVMetadataFormat] { get }
```

可用的元数据格式列表。

### metadata(forFormat:)

```swift
func metadata(forFormat format: AVMetadataFormat) -> [AVMetadataItem]
```

获取特定格式的元数据。

```swift
let id3Metadata = asset.metadata(forFormat: .id3Metadata)
```

### availableChapterLocales

```swift
var availableChapterLocales: [Locale] { get }
```

可用的章节语言环境。

### chapterMetadataGroups(withTitleLocale\:containingItemsWithCommonKeys:)

```swift
func chapterMetadataGroups(
    withTitleLocale locale: Locale,
    containingItemsWithCommonKeys commonKeys: [AVMetadataKey]?
) -> [AVTimedMetadataGroup]
```

获取章节元数据组。

### chapterMetadataGroups(bestMatchingPreferredLanguages:)

```swift
func chapterMetadataGroups(
    bestMatchingPreferredLanguages preferredLanguages: [String]
) -> [AVTimedMetadataGroup]
```

根据首选语言获取最佳匹配的章节元数据。

***

## 媒体选择 API

### availableMediaCharacteristicsWithMediaSelectionOptions

```swift
var availableMediaCharacteristicsWithMediaSelectionOptions: [AVMediaCharacteristic] { get }
```

具有媒体选择选项的可用特征。

```swift
let characteristics = asset.availableMediaCharacteristicsWithMediaSelectionOptions
if characteristics.contains(.audible) {
    print("有多个音轨可选")
}
```

### mediaSelectionGroup(forMediaCharacteristic:)

```swift
func mediaSelectionGroup(
    forMediaCharacteristic mediaCharacteristic: AVMediaCharacteristic
) -> AVMediaSelectionGroup?
```

获取特定特征的媒体选择组。

```swift
if let audioGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .audible) {
    for option in audioGroup.options {
        print("音轨: \(option.displayName)")
    }
}

if let subtitleGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .legible) {
    for option in subtitleGroup.options {
        print("字幕: \(option.displayName)")
    }
}
```

### preferredMediaSelection

```swift
var preferredMediaSelection: AVMediaSelection { get }
```

首选的媒体选择。

***

## 异步加载 API (Modern Concurrency)

### load(\_:)

```swift
func load<T>(_ property: AVAsyncProperty<AVAsset, T>) async throws -> T
```

**Swift 并发模型中加载属性的现代方法。**

```swift
Task {
    do {
        // 加载单个属性
        let duration = try await asset.load(.duration)
        let isPlayable = try await asset.load(.isPlayable)
        let tracks = try await asset.load(.tracks)
        
        print("时长: \(duration.seconds)")
        print("可播放: \(isPlayable)")
        
        // 加载多个属性
        let (dur, playable) = try await asset.load(.duration, .isPlayable)
        
    } catch {
        print("加载失败: \(error)")
    }
}
```

**可加载的属性:**

*   `.duration`
*   `.isPlayable`
*   `.isExportable`
*   `.isReadable`
*   `.isComposable`
*   `.tracks`
*   `.metadata`
*   `.commonMetadata`
*   `.preferredRate`
*   `.preferredVolume`
*   `.preferredTransform`
*   等等...

***

## 资源状态检查

### statusOfValue(forKey\:error:)

```swift
func statusOfValue(forKey key: String, error outError: NSErrorPointer) -> AVKeyValueStatus
```

检查属性的加载状态（旧方法）。

**状态值:**

*   `.unknown` - 未知
*   `.loading` - 加载中
*   `.loaded` - 已加载
*   `.failed` - 失败
*   `.cancelled` - 已取消

```swift
var error: NSError?
let status = asset.statusOfValue(forKey: "duration", error: &error)

switch status {
case .loaded:
    print("已加载")
case .loading:
    print("加载中")
case .failed:
    print("失败: \(error?.localizedDescription ?? "")")
default:
    break
}
```

### loadValuesAsynchronously(forKeys\:completionHandler:)

```swift
func loadValuesAsynchronously(
    forKeys keys: [String],
    completionHandler handler: (() -> Void)?
)
```

异步加载属性值（旧方法）。

```swift
asset.loadValuesAsynchronously(forKeys: ["duration", "tracks"]) {
    var error: NSError?
    let status = asset.statusOfValue(forKey: "duration", error: &error)
    
    if status == .loaded {
        let duration = asset.duration
        print("时长: \(duration.seconds)")
    }
}
```

***

## 时间范围相关

### unusedTrackID

```swift
func unusedTrackID() -> CMPersistentTrackID
```

获取一个未使用的轨道 ID。

***

## 引用限制 API

### referenceRestrictions

```swift
var referenceRestrictions: AVAssetReferenceRestrictions { get }
```

资源的引用限制。

**选项:**

*   `.forbidNone` - 无限制
*   `.forbidRemoteReferenceToLocal` - 禁止远程引用本地
*   `.forbidLocalReferenceToRemote` - 禁止本地引用远程
*   `.forbidCrossSiteReference` - 禁止跨站引用
*   `.forbidAll` - 禁止所有引用

***

## 完整使用示例

### 示例 1: 获取视频基本信息

```swift
import AVFoundation

func getVideoInfo(url: URL) async {
    let asset = AVAsset(url: url)
    
    do {
        // 使用现代异步API加载属性
        let duration = try await asset.load(.duration)
        let isPlayable = try await asset.load(.isPlayable)
        let tracks = try await asset.load(.tracks)
        
        print("=== 视频信息 ===")
        print("时长: \(duration.seconds) 秒")
        print("可播放: \(isPlayable)")
        print("总轨道数: \(tracks.count)")
        
        // 获取视频轨道信息
        let videoTracks = try await asset.loadTracks(withMediaType: .video)
        if let videoTrack = videoTracks.first {
            let size = try await videoTrack.load(.naturalSize)
            let frameRate = try await videoTrack.load(.nominalFrameRate)
            
            print("\n=== 视频轨道 ===")
            print("分辨率: \(size.width) x \(size.height)")
            print("帧率: \(frameRate) fps")
        }
        
        // 获取音频轨道信息
        let audioTracks = try await asset.loadTracks(withMediaType: .audio)
        print("\n=== 音频轨道 ===")
        print("音轨数量: \(audioTracks.count)")
        
    } catch {
        print("获取视频信息失败: \(error)")
    }
}

// 使用
Task {
    await getVideoInfo(url: videoURL)
}
```

### 示例 2: 读取视频元数据

```swift
func readMetadata(from asset: AVAsset) async {
    do {
        let metadata = try await asset.load(.commonMetadata)
        
        print("=== 元数据 ===")
        for item in metadata {
            if let key = item.commonKey?.rawValue,
               let value = item.value as? String {
                print("\(key): \(value)")
            }
        }
        
        // 读取特定元数据
        let titleItems = AVMetadataItem.metadataItems(
            from: metadata,
            filteredByIdentifier: .commonIdentifierTitle
        )
        
        if let title = titleItems.first?.stringValue {
            print("标题: \(title)")
        }
        
        let artistItems = AVMetadataItem.metadataItems(
            from: metadata,
            filteredByIdentifier: .commonIdentifierArtist
        )
        
        if let artist = artistItems.first?.stringValue {
            print("艺术家: \(artist)")
        }
        
    } catch {
        print("读取元数据失败: \(error)")
    }
}
```

### 示例 3: 检查视频方向

```swift
func checkVideoOrientation(url: URL) async {
    let asset = AVAsset(url: url)
    
    do {
        let videoTracks = try await asset.loadTracks(withMediaType: .video)
        
        guard let videoTrack = videoTracks.first else {
            print("没有视频轨道")
            return
        }
        
        let transform = try await videoTrack.load(.preferredTransform)
        
        let videoAngle = atan2(transform.b, transform.a)
        let degrees = videoAngle * 180 / .pi
        
        print("视频旋转角度: \(degrees)°")
        
        // 判断方向
        if degrees == 0 {
            print("方向: 正常")
        } else if degrees == 90 {
            print("方向: 向右旋转90°")
        } else if degrees == -90 || degrees == 270 {
            print("方向: 向左旋转90°")
        } else if abs(degrees) == 180 {
            print("方向: 倒置")
        }
        
    } catch {
        print("检查方向失败: \(error)")
    }
}
```

### 示例 4: 多语言音轨和字幕选择

```swift
func listAvailableMediaOptions(asset: AVAsset) {
    print("=== 可用媒体选项 ===")
    
    // 检查音轨
    if let audioGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .audible) {
        print("\n音轨选项:")
        for (index, option) in audioGroup.options.enumerated() {
            print("\(index + 1). \(option.displayName)")
            if let languageCode = option.extendedLanguageTag {
                print("   语言: \(languageCode)")
            }
        }
    }
    
    // 检查字幕
    if let subtitleGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .legible) {
        print("\n字幕选项:")
        for (index, option) in subtitleGroup.options.enumerated() {
            print("\(index + 1). \(option.displayName)")
            if let languageCode = option.extendedLanguageTag {
                print("   语言: \(languageCode)")
            }
        }
    }
}
```

### 示例 5: 使用旧版回调方式加载属性

```swift
func loadAssetPropertiesLegacy(url: URL) {
    let asset = AVAsset(url: url)
    
    let keys = ["duration", "tracks", "playable"]
    
    asset.loadValuesAsynchronously(forKeys: keys) {
        DispatchQueue.main.async {
            var error: NSError?
            
            // 检查 duration
            let durationStatus = asset.statusOfValue(forKey: "duration", error: &error)
            if durationStatus == .loaded {
                print("时长: \(asset.duration.seconds) 秒")
            } else if durationStatus == .failed {
                print("加载时长失败: \(error?.localizedDescription ?? "")")
            }
            
            // 检查 tracks
            let tracksStatus = asset.statusOfValue(forKey: "tracks", error: &error)
            if tracksStatus == .loaded {
                print("轨道数: \(asset.tracks.count)")
            }
            
            // 检查 playable
            let playableStatus = asset.statusOfValue(forKey: "playable", error: &error)
            if playableStatus == .loaded {
                print("可播放: \(asset.isPlayable)")
            }
        }
    }
}
```

### 示例 6: 创建带选项的 Asset

```swift
func createAssetWithOptions(url: URL) {
    let options: [String: Any] = [
        // 精确时长和时间
        AVURLAssetPreferPreciseDurationAndTimingKey: true,
        
        // HTTP 请求头
        AVURLAssetHTTPHeaderFieldsKey: [
            "User-Agent": "MyVideoPlayer/1.0",
            "Authorization": "Bearer token123"
        ],
        
        // 禁止使用蜂窝网络
        AVURLAssetAllowsCellularAccessKey: false,
        
        // 引用限制
        AVURLAssetReferenceRestrictionsKey: AVAssetReferenceRestrictions.forbidAll.rawValue
    ]
    
    let asset = AVAsset(url: url, options: options)
    
    // 使用 asset...
}
```

***

## 常用元数据标识符

```swift
// 通用标识符
.commonIdentifierTitle          // 标题
.commonIdentifierCreator        // 创建者
.commonIdentifierSubject        // 主题
.commonIdentifierDescription    // 描述
.commonIdentifierPublisher      // 发布者
.commonIdentifierContributor    // 贡献者
.commonIdentifierCreationDate   // 创建日期
.commonIdentifierLastModifiedDate // 最后修改日期
.commonIdentifierType           // 类型
.commonIdentifierFormat         // 格式
.commonIdentifierAssetIdentifier // 资源标识符
.commonIdentifierSource         // 来源
.commonIdentifierLanguage       // 语言
.commonIdentifierRelation       // 关系
.commonIdentifierLocation       // 位置
.commonIdentifierCopyrights     // 版权
.commonIdentifierAlbumName      // 专辑名
.commonIdentifierAuthor         // 作者
.commonIdentifierArtist         // 艺术家
.commonIdentifierArtwork        // 封面
.commonIdentifierMake           // 制造商
.commonIdentifierModel          // 型号
.commonIdentifierSoftware       // 软件
```

***

## AVAsset 子类

### AVURLAsset

用于基于 URL 的资源，提供额外功能。

```swift
let urlAsset = AVURLAsset(url: videoURL)

// 访问 URL
print(urlAsset.url)

// 检查资源是否可用
let isCompatible = urlAsset.isCompatibleWithSavedPhotosAlbum
```

### AVComposition

用于组合多个媒体资源。

```swift
let composition = AVMutableComposition()
// 添加轨道和时间范围...
```

***

## 最佳实践

### 1. 使用现代异步 API

```swift
// ✅ 推荐 - Swift Concurrency
let duration = try await asset.load(.duration)

// ❌ 避免 - 旧的回调方式
asset.loadValuesAsynchronously(forKeys: ["duration"]) { ... }
```

### 2. 批量加载属性

```swift
// ✅ 一次加载多个属性
let (duration, playable, tracks) = try await asset.load(
    .duration,
    .isPlayable,
    .tracks
)

// ❌ 避免多次单独加载
let duration = try await asset.load(.duration)
let playable = try await asset.load(.isPlayable)
let tracks = try await asset.load(.tracks)
```

### 3. 错误处理

```swift
do {
    let duration = try await asset.load(.duration)
    if duration.isValid && !duration.isIndefinite {
        print("有效时长: \(duration.seconds)")
    }
} catch {
    print("加载失败: \(error.localizedDescription)")
}
```

### 4. 检查资源可用性

```swift
let isPlayable = try await asset.load(.isPlayable)
if !isPlayable {
    print("资源不可播放")
    return
}
```

***

## 常见问题

### 1. duration 为什么是 invalid？

某些格式（如流媒体）可能没有确定的时长，需要：

```swift
let options = [AVURLAssetPreferPreciseDurationAndTimingKey: true]
let asset = AVAsset(url: url, options: options)
```

### 2. 如何获取视频的真实尺寸？

```swift
let videoTracks = try await asset.loadTracks(withMediaType: .video)
if let track = videoTracks.first {
    let size = try await track.load(.naturalSize)
    let transform = try await track.load(.preferredTransform)
    
    // 考虑旋转后的尺寸
    let rotatedSize = size.applying(transform)
    let actualSize = CGSize(
        width: abs(rotatedSize.width),
        height: abs(rotatedSize.height)
    )
}
```

### 3. 如何判断是否是视频文件？

```swift
let videoTracks = try await asset.loadTracks(withMediaType: .video)
let hasVideo = !videoTracks.isEmpty
```

***

## 相关类型

*   `AVAssetTrack` - 资源轨道
*   `AVMetadataItem` - 元数据项
*   `AVMediaSelectionGroup` - 媒体选择组
*   `AVMediaSelectionOption` - 媒体选择选项
*   `AVPlayerItem` - 播放项（用于实际播放）
*   `AVPlayer` - 播放器
*   `CMTime` - 时间表示
*   `AVAssetImageGenerator` - 图像生成器
*   `AVAssetExportSession` - 导出会话

