---
title: "AVPlayerItem 完整 API 指南"
description: ""
pubDate: 2026-05-29
category: "media"
tags: [Mac, iOS, Swift, API, SEO]
draft: false
---
# 🚀 AVPlayerItem 完整 API 指南

## 目录
1. [基础概念](#1-基础概念)
2. [初始化方法](#2-初始化方法)
3. [状态和属性](#3-状态和属性)
4. [时间相关属性](#4-时间相关属性)
5. [播放控制属性](#5-播放控制属性)
6. [缓冲和网络相关](#6-缓冲和网络相关)
7. [轨道和媒体信息](#7-轨道和媒体信息)
8. [定时元数据](#8-定时元数据)
9. [错误处理](#9-错误处理)
10. [通知和观察者](#10-通知和观察者)
11. [高级功能](#11-高级功能)
12. [实际应用示例](#12-实际应用示例)

---

## 1. 基础概念

### 1.1 AVPlayerItem 的作用
AVPlayerItem 表示要由 AVPlayer 播放的单个媒体资源，它：
- 封装了 AVAsset 并提供播放状态
- 管理播放的时间信息和进度
- 处理缓冲和网络加载
- 提供媒体轨道访问
- 管理元数据和字幕

### 1.2 生命周期状态
```swift
enum AVPlayerItem.Status {
    case unknown        // 未知状态，刚创建时
    case readyToPlay    // 准备就绪，可以播放
    case failed         // 失败，无法播放
}
```

---

## 2. 初始化方法

### 2.1 基本初始化
```swift
import AVFoundation

// 方法1：使用 URL 创建
let url = URL(string: "https://example.com/video.mp4")!
let playerItem = AVPlayerItem(url: url)

// 方法2：使用 AVAsset 创建
let asset = AVAsset(url: url)
let playerItem = AVPlayerItem(asset: asset)

// 方法3：使用 AVAsset 和自动加载的键
let playerItem = AVPlayerItem(asset: asset, automaticallyLoadedAssetKeys: ["duration", "tracks"])

// 方法4：本地文件
let localURL = Bundle.main.url(forResource: "video", withExtension: "mp4")!
let playerItem = AVPlayerItem(url: localURL)
```

### 2.2 高级初始化
```swift
// 使用特定的 AVAsset 键进行初始化
let keys = ["playable", "duration", "tracks", "hasProtectedContent"]
let playerItem = AVPlayerItem(asset: asset, automaticallyLoadedAssetKeys: keys)

// 从 AVPlayerItem 复制创建新实例 (iOS 13+)
let copyItem = playerItem.copy() as! AVPlayerItem
```

---

## 3. 状态和属性

### 3.1 播放状态
```swift
// 播放项状态
var status: AVPlayerItem.Status { get }

// 错误信息
var error: Error? { get }

// 是否可播放
var isPlayable: Bool { get }

// 检查状态示例
func checkPlayerItemStatus() {
    switch playerItem.status {
    case .unknown:
        print("状态未知")
    case .readyToPlay:
        print("准备就绪，可以播放")
        print("时长: \(CMTimeGetSeconds(playerItem.duration)) 秒")
    case .failed:
        if let error = playerItem.error {
            print("播放失败: \(error.localizedDescription)")
        }
    @unknown default:
        print("未知状态")
    }
}
```

### 3.2 媒体属性
```swift
// 关联的资源
var asset: AVAsset { get }

// 轨道信息
var tracks: [AVPlayerItemTrack] { get }

// 演示时间
var presentationSize: CGSize { get }

// 媒体类型
func getMediaInfo() {
    print("演示尺寸: \(playerItem.presentationSize)")
    print("轨道数量: \(playerItem.tracks.count)")
    print("资源: \(playerItem.asset)")
    
    // 检查是否有视频轨道
    let videoTracks = playerItem.asset.tracks(withMediaType: .video)
    print("视频轨道数: \(videoTracks.count)")
    
    // 检查是否有音频轨道
    let audioTracks = playerItem.asset.tracks(withMediaType: .audio)
    print("音频轨道数: \(audioTracks.count)")
}
```

---

## 4. 时间相关属性

### 4.1 时间属性
```swift
// 总时长
var duration: CMTime { get }

// 当前时间
func currentTime() -> CMTime

// 前进播放结束时间
var forwardPlaybackEndTime: CMTime

// 反向播放结束时间
var reversePlaybackEndTime: CMTime

// 时间范围示例
func setupTimeProperties() {
    let playerItem = AVPlayerItem(url: videoURL)
    
    // 设置播放范围 (从30秒开始播放)
    let startTime = CMTime(seconds: 30, preferredTimescale: 600)
    playerItem.forwardPlaybackEndTime = CMTime(seconds: 120, preferredTimescale: 600)
    
    // 监听时长变化
    playerItem.addObserver(self, forKeyPath: "duration", options: [.new, .initial], context: nil)
}

// KVO 监听时长变化
override func observeValue(forKeyPath keyPath: String?, 
                          of object: Any?, 
                          change: [NSKeyValueChangeKey : Any]?, 
                          context: UnsafeMutableRawPointer?) {
    if keyPath == "duration" {
        let duration = playerItem.duration
        if CMTIME_IS_VALID(duration) {
            let seconds = CMTimeGetSeconds(duration)
            print("视频时长: \(seconds) 秒")
        }
    }
}
```

### 4.2 时间工具方法
```swift
// 跳转到指定时间
func seek(to time: CMTime, completionHandler: ((Bool) -> Void)? = nil)

// 精确跳转
func seek(to time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime, completionHandler: ((Bool) -> Void)? = nil)

// 跳转到指定日期 (直播流)
@available(iOS 13.0, *)
func seek(to date: Date, completionHandler: @escaping (Bool) -> Void)

// 跳转示例
func performSeek() {
    let targetTime = CMTime(seconds: 60, preferredTimescale: 600)
    
    // 基本跳转
    playerItem.seek(to: targetTime) { finished in
        print("跳转完成: \(finished)")
    }
    
    // 精确跳转
    playerItem.seek(to: targetTime, 
                   toleranceBefore: .zero, 
                   toleranceAfter: .zero) { finished in
        print("精确跳转完成: \(finished)")
    }
}
```

---

## 5. 播放控制属性

### 5.1 播放速率控制
```swift
// 是否支持快进
var canPlayFastForward: Bool { get }

// 是否支持慢放
var canPlaySlowForward: Bool { get }

// 是否支持快退
var canPlayFastReverse: Bool { get }

// 是否支持慢退
var canPlaySlowReverse: Bool { get }

// 是否支持反向播放
var canPlayReverse: Bool { get }

// 支持的播放速率
var fastForwardPlaybackRates: [NSNumber]? { get }
var fastReversePlaybackRates: [NSNumber]? { get }
var slowForwardPlaybackRates: [NSNumber]? { get }
var slowReversePlaybackRates: [NSNumber]? { get }

// 检查播放能力
func checkPlaybackCapabilities() {
    print("支持快进: \(playerItem.canPlayFastForward)")
    print("支持反向播放: \(playerItem.canPlayReverse)")
    
    if let fastRates = playerItem.fastForwardPlaybackRates {
        print("支持的快进速率: \(fastRates)")
    }
    
    if let slowRates = playerItem.slowForwardPlaybackRates {
        print("支持的慢放速率: \(slowRates)")
    }
}
```

### 5.2 播放范围控制
```swift
// 设置播放范围
func setPlaybackRange(startTime: Double, endTime: Double) {
    let start = CMTime(seconds: startTime, preferredTimescale: 600)
    let end = CMTime(seconds: endTime, preferredTimescale: 600)
    
    // 设置前进播放结束时间
    playerItem.forwardPlaybackEndTime = end
    
    // 跳转到开始时间
    playerItem.seek(to: start)
}

// 重置播放范围
func resetPlaybackRange() {
    playerItem.forwardPlaybackEndTime = .positiveInfinity
    playerItem.reversePlaybackEndTime = .zero
}
```

---

## 6. 缓冲和网络相关

### 6.1 缓冲属性
```swift
// 加载的时间范围
var loadedTimeRanges: [NSValue] { get }

// 可寻址的时间范围
var seekableTimeRanges: [NSValue] { get }

// 预加载缓冲时长 (iOS 10+)
var preferredForwardBufferDuration: TimeInterval

// 是否可能保持跟上播放
var isPlaybackLikelyToKeepUp: Bool { get }

// 缓冲是否为空
var isPlaybackBufferEmpty: Bool { get }

// 缓冲是否已满
var isPlaybackBufferFull: Bool { get }

// 缓冲状态检查
func checkBufferStatus() {
    print("缓冲可能跟上播放: \(playerItem.isPlaybackLikelyToKeepUp)")
    print("缓冲为空: \(playerItem.isPlaybackBufferEmpty)")
    print("缓冲已满: \(playerItem.isPlaybackBufferFull)")
    
    // 获取已加载的时间范围
    if let timeRange = playerItem.loadedTimeRanges.first {
        let range = timeRange.timeRangeValue
        let start = CMTimeGetSeconds(range.start)
        let duration = CMTimeGetSeconds(range.duration)
        let end = start + duration
        
        print("已加载范围: \(start) - \(end) 秒")
    }
    
    // 设置预加载时长
    playerItem.preferredForwardBufferDuration = 30.0  // 预加载30秒
}
```

### 6.2 网络访问属性
```swift
// 访问日志
var accessLog: AVPlayerItemAccessLog? { get }

// 错误日志
var errorLog: AVPlayerItemErrorLog? { get }

// 网络状态分析
func analyzeNetworkStatus() {
    // 获取访问日志
    if let accessLog = playerItem.accessLog {
        for event in accessLog.events {
            print("网络带宽: \(event.indicatedBitrate)")
            print("观察到的比特率: \(event.observedBitrate)")
            print("切换次数: \(event.numberOfSegmentsDownloaded)")
            print("播放会话ID: \(event.playbackSessionID ?? "N/A")")
        }
    }
    
    // 获取错误日志
    if let errorLog = playerItem.errorLog {
        for event in errorLog.events {
            print("错误代码: \(event.errorStatusCode)")
            print("错误域: \(event.errorDomain ?? "N/A")")
            print("错误描述: \(event.errorComment ?? "N/A")")
        }
    }
}
```

---

## 7. 轨道和媒体信息

### 7.1 轨道管理
```swift
// 轨道信息
var tracks: [AVPlayerItemTrack] { get }

// 轨道操作示例
func managePlayerItemTracks() {
    // 遍历所有轨道
    for track in playerItem.tracks {
        print("轨道ID: \(track.assetTrack?.trackID ?? 0)")
        print("轨道类型: \(track.assetTrack?.mediaType.rawValue ?? "unknown")")
        print("轨道是否启用: \(track.isEnabled)")
        
        // 禁用特定轨道
        if track.assetTrack?.mediaType == .audio {
            track.isEnabled = false  // 禁用音频轨道
        }
    }
    
    // 获取特定类型的轨道
    let videoTracks = playerItem.tracks.filter { 
        $0.assetTrack?.mediaType == .video 
    }
    print("视频轨道数量: \(videoTracks.count)")
}

// 选择特定轨道组
func selectMediaOptions() {
    let asset = playerItem.asset
    
    // 获取可选媒体组
    if let audioGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .audible) {
        print("音频选项:")
        for option in audioGroup.options {
            print("- \(option.displayName)")
        }
        
        // 选择特定音频轨道
        if let preferredOption = audioGroup.options.first {
            playerItem.select(preferredOption, in: audioGroup)
        }
    }
    
    // 字幕选择
    if let subtitleGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .legible) {
        print("字幕选项:")
        for option in subtitleGroup.options {
            print("- \(option.displayName)")
        }
    }
}
```

### 7.2 媒体选择
```swift
// 选择媒体选项
func select(_ mediaSelectionOption: AVMediaSelectionOption?, in mediaSelectionGroup: AVMediaSelectionGroup)

// 获取当前选择的媒体选项
func selectedMediaOption(in mediaSelectionGroup: AVMediaSelectionGroup) -> AVMediaSelectionOption?

// 媒体选择示例
func configureMediaSelection() {
    let asset = playerItem.asset
    
    // 音频语言选择
    if let audioGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .audible) {
        // 选择中文音频
        let chineseAudio = audioGroup.options.first { option in
            option.locale?.identifier.contains("zh") == true
        }
        
        if let chineseOption = chineseAudio {
            playerItem.select(chineseOption, in: audioGroup)
            print("已选择中文音频")
        }
    }
    
    // 字幕选择
    if let subtitleGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .legible) {
        // 选择英文字幕
        let englishSubtitle = subtitleGroup.options.first { option in
            option.locale?.identifier.contains("en") == true
        }
        
        if let englishOption = englishSubtitle {
            playerItem.select(englishOption, in: subtitleGroup)
            print("已选择英文字幕")
        } else {
            // 关闭字幕
            playerItem.select(nil, in: subtitleGroup)
        }
    }
}
```

---

## 8. 定时元数据

### 8.1 定时元数据属性
```swift
// 定时元数据
var timedMetadata: [AVMetadataItem]? { get }

// 定时元数据处理
func handleTimedMetadata() {
    // 监听定时元数据变化
    playerItem.addObserver(self, forKeyPath: "timedMetadata", options: [.new], context: nil)
}

// 元数据观察
override func observeValue(forKeyPath keyPath: String?, 
                          of object: Any?, 
                          change: [NSKeyValueChangeKey : Any]?, 
                          context: UnsafeMutableRawPointer?) {
    if keyPath == "timedMetadata" {
        if let metadata = playerItem.timedMetadata {
            for item in metadata {
                print("元数据键: \(item.key)")
                print("元数据值: \(item.value)")
                print("时间范围: \(item.time)")
            }
        }
    }
}
```

### 8.2 外部元数据
```swift
// 外部元数据
var externalMetadata: [AVMetadataItem]

// 设置外部元数据
func setupExternalMetadata() {
    let titleItem = AVMutableMetadataItem()
    titleItem.identifier = .commonIdentifierTitle
    titleItem.value = "我的视频标题" as NSString
    
    let artistItem = AVMutableMetadataItem()
    artistItem.identifier = .commonIdentifierCreator
    artistItem.value = "创作者姓名" as NSString
    
    playerItem.externalMetadata = [titleItem, artistItem]
}
```

---

## 9. 错误处理

### 9.1 错误类型和处理
```swift
// 常见错误处理
func handlePlayerItemError() {
    guard playerItem.status == .failed,
          let error = playerItem.error else { return }
    
    let nsError = error as NSError
    
    switch nsError.code {
    case AVError.fileFormatNotRecognized.rawValue:
        print("文件格式不支持")
        
    case AVError.noDataAvailable.rawValue:
        print("无数据可用")
        
    case AVError.mediaServicesWereReset.rawValue:
        print("媒体服务已重置")
        
    case AVError.networkUnavailable.rawValue:
        print("网络不可用")
        
    case AVError.resourceUnavailable.rawValue:
        print("资源不可用")
        
    default:
        print("播放错误: \(error.localizedDescription)")
    }
    
    // 错误恢复尝试
    attemptErrorRecovery()
}

// 错误恢复
func attemptErrorRecovery() {
    // 重新创建 PlayerItem
    if let url = (playerItem.asset as? AVURLAsset)?.url {
        let newPlayerItem = AVPlayerItem(url: url)
        // 替换当前播放项
        // player.replaceCurrentItem(with: newPlayerItem)
    }
}
```

### 9.2 网络错误分析
```swift
// 网络错误详细分析
func analyzeNetworkError() {
    if let errorLog = playerItem.errorLog {
        for event in errorLog.events {
            print("=== 错误事件 ===")
            print("错误状态码: \(event.errorStatusCode)")
            print("错误域: \(event.errorDomain ?? "未知")")
            print("错误注释: \(event.errorComment ?? "无")")
            print("服务器地址: \(event.serverAddress ?? "未知")")
            print("播放会话ID: \(event.playbackSessionID ?? "未知")")
            print("错误日期: \(event.date ?? Date())")
        }
    }
}
```

---

## 10. 通知和观察者

### 10.1 重要通知
```swift
// 播放结束通知
static let AVPlayerItemDidPlayToEndTime: NSNotification.Name

// 播放失败通知
static let AVPlayerItemFailedToPlayToEndTime: NSNotification.Name

// 播放停滞通知
static let AVPlayerItemPlaybackStalled: NSNotification.Name

// 新访问日志条目通知
static let AVPlayerItemNewAccessLogEntry: NSNotification.Name

// 新错误日志条目通知
static let AVPlayerItemNewErrorLogEntry: NSNotification.Name

// 时间跳转通知
static let AVPlayerItemTimeJumped: NSNotification.Name

// 媒体选择改变通知 (iOS 9+)
static let AVPlayerItemMediaSelectionDidChange: NSNotification.Name

// 注册通知观察者
func setupNotificationObservers() {
    let notificationCenter = NotificationCenter.default
    
    // 播放结束
    notificationCenter.addObserver(
        self,
        selector: #selector(playerItemDidFinishPlaying(_:)),
        name: .AVPlayerItemDidPlayToEndTime,
        object: playerItem
    )
    
    // 播放失败
    notificationCenter.addObserver(
        self,
        selector: #selector(playerItemFailedToPlay(_:)),
        name: .AVPlayerItemFailedToPlayToEndTime,
        object: playerItem
    )
    
    // 播放停滞
    notificationCenter.addObserver(
        self,
        selector: #selector(playerItemPlaybackStalled(_:)),
        name: .AVPlayerItemPlaybackStalled,
        object: playerItem
    )
    
    // 时间跳转
    notificationCenter.addObserver(
        self,
        selector: #selector(playerItemTimeJumped(_:)),
        name: .AVPlayerItemTimeJumped,
        object: playerItem
    )
}

// 通知处理方法
@objc func playerItemDidFinishPlaying(_ notification: Notification) {
    print("播放完成")
    // 重新播放或其他操作
}

@objc func playerItemFailedToPlay(_ notification: Notification) {
    if let error = notification.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? Error {
        print("播放到结尾失败: \(error.localizedDescription)")
    }
}

@objc func playerItemPlaybackStalled(_ notification: Notification) {
    print("播放停滞，可能是缓冲不足")
}

@objc func playerItemTimeJumped(_ notification: Notification) {
    print("播放时间发生跳转")
}
```

### 10.2 KVO 观察者
```swift
// 重要的 KVO 键路径
let observableKeyPaths = [
    "status",                    // 播放项状态
    "duration",                  // 时长
    "loadedTimeRanges",         // 已加载时间范围
    "seekableTimeRanges",       // 可寻址时间范围
    "isPlaybackLikelyToKeepUp", // 是否可能保持播放
    "isPlaybackBufferEmpty",    // 缓冲是否为空
    "isPlaybackBufferFull",     // 缓冲是否已满
    "presentationSize",         // 演示尺寸
    "timedMetadata"            // 定时元数据
]

// 批量添加观察者
func addKVOObservers() {
    for keyPath in observableKeyPaths {
        playerItem.addObserver(self, forKeyPath: keyPath, options: [.new, .old], context: nil)
    }
}

// 批量移除观察者
func removeKVOObservers() {
    for keyPath in observableKeyPaths {
        playerItem.removeObserver(self, forKeyPath: keyPath)
    }
}

// KVO 响应处理
override func observeValue(forKeyPath keyPath: String?, 
                          of object: Any?, 
                          change: [NSKeyValueChangeKey : Any]?, 
                          context: UnsafeMutableRawPointer?) {
    
    guard let keyPath = keyPath else { return }
    
    DispatchQueue.main.async {
        switch keyPath {
        case "status":
            self.handleStatusChange()
            
        case "duration":
            self.handleDurationChange()
            
        case "loadedTimeRanges":
            self.handleLoadedTimeRangesChange()
            
        case "isPlaybackLikelyToKeepUp":
            self.handlePlaybackLikelyToKeepUpChange()
            
        case "presentationSize":
            self.handlePresentationSizeChange()
            
        default:
            break
        }
    }
}

// 具体的处理方法
func handleStatusChange() {
    switch playerItem.status {
    case .readyToPlay:
        print("准备就绪")
    case .failed:
        print("失败: \(playerItem.error?.localizedDescription ?? "未知错误")")
    case .unknown:
        print("未知状态")
    @unknown default:
        break
    }
}

func handleDurationChange() {
    let duration = playerItem.duration
    if CMTIME_IS_VALID(duration) {
        print("时长更新: \(CMTimeGetSeconds(duration)) 秒")
    }
}

func handleLoadedTimeRangesChange() {
    if let timeRange = playerItem.loadedTimeRanges.first {
        let range = timeRange.timeRangeValue
        let bufferedSeconds = CMTimeGetSeconds(range.start) + CMTimeGetSeconds(range.duration)
        print("缓冲时间: \(bufferedSeconds) 秒")
    }
}

func handlePlaybackLikelyToKeepUpChange() {
    if playerItem.isPlaybackLikelyToKeepUp {
        print("缓冲充足，可以继续播放")
    } else {
        print("缓冲不足，可能会停滞")
    }
}

func handlePresentationSizeChange() {
    let size = playerItem.presentationSize
    print("视频尺寸: \(size.width) x \(size.height)")
}
```

---

## 11. 高级功能

### 11.1 视频合成 (iOS 13+)
```swift
import AVFoundation

// 视频合成
@available(iOS 13.0, *)
var videoComposition: AVVideoComposition?

// 音频混合
var audioMix: AVAudioMix?

// 设置视频合成
@available(iOS 13.0, *)
func setupVideoComposition() {
    let composition = AVMutableComposition()
    
    // 创建视频轨道
    guard let videoTrack = composition.addMutableTrack(
        withMediaType: .video,
        preferredTrackID: kCMPersistentTrackID_Invalid
    ) else { return }
    
    // 创建视频合成
    let videoComposition = AVMutableVideoComposition()
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30) // 30fps
    videoComposition.renderSize = CGSize(width: 1920, height: 1080)
    
    // 应用到 PlayerItem
    let compositionPlayerItem = AVPlayerItem(asset: composition)
    compositionPlayerItem.videoComposition = videoComposition
}

// 设置音频混合
func setupAudioMix() {
    let audioMix = AVMutableAudioMix()
    var audioMixParams: [AVMutableAudioMixInputParameters] = []
    
    // 为每个音频轨道创建参数
    let audioTracks = playerItem.asset.tracks(withMediaType: .audio)
    for track in audioTracks {
        let audioParams = AVMutableAudioMixInputParameters(track: track)
        audioParams.setVolume(0.8, at: .zero) // 设置音量为80%
        audioMixParams.append(audioParams)
    }
    
    audioMix.inputParameters = audioMixParams
    playerItem.audioMix = audioMix
}
```

### 11.2 自定义时间观察者
```swift
// 边界时间观察者
func addBoundaryTimeObserver() {
    let times = [
        CMTime(seconds: 30, preferredTimescale: 600),
        CMTime(seconds: 60, preferredTimescale: 600),
        CMTime(seconds: 90, preferredTimescale: 600)
    ]
    
    let timeObserver = player.addBoundaryTimeObserver(forTimes: times, queue: .main) {
        print("到达边界时间点")
        // 处理到达特定时间点的逻辑
    }
    
    // 保存观察者引用以便后续移除
    // self.boundaryTimeObserver = timeObserver
}

// 周期性时间观察者
func addPeriodicTimeObserver() {
    let interval = CMTime(seconds: 0.5, preferredTimescale: 600)
    
    let timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
        self?.updatePlaybackUI(currentTime: time)
    }
    
    // self.periodicTimeObserver = timeObserver
}

func updatePlaybackUI(currentTime: CMTime) {
    let seconds = CMTimeGetSeconds(currentTime)
    let duration = CMTimeGetSeconds(playerItem.duration)
    
    // 更新进度条
    let progress = duration > 0 ? seconds / duration : 0
    print("播放进度: \(Int(progress * 100))%")
}
```

### 11.3 播放项替换和复制
```swift
// 复制播放项 (iOS 13+)
@available(iOS 13.0, *)
func copyPlayerItem() {
    let copiedItem = playerItem.copy() as! AVPlayerItem
    
    // 复制的项目保持相同的资源但是独立的播放状态
    // player.replaceCurrentItem(with: copiedItem)
}

// 创建相似的播放项
func createSimilarPlayerItem() {
    let newItem = AVPlayerItem(asset: playerItem.asset)
    
    // 复制一些配置
    newItem.audioMix = playerItem.audioMix
    newItem.videoComposition = playerItem.videoComposition
    newItem.preferredForwardBufferDuration = playerItem.preferredForwardBufferDuration
    
    // 复制媒体选择
    let asset = playerItem.asset
    if let audioGroup = asset.mediaSelectionGroup(forMediaCharacteristic: .audible) {
        let selectedOption = playerItem.selectedMediaOption(in: audioGroup)
        newItem.select(selectedOption, in: audioGroup)
    }
    
    return newItem
}
```

### 11.4 播放项缓存管理
```swift
// 资源缓存 (iOS 10+)
@available(iOS 10.0, *)
func setupResourceLoaderDelegate() {
    let asset = AVURLAsset(url: videoURL)
    
    // 设置资源加载代理
    asset.resourceLoader.setDelegate(self, queue: DispatchQueue.global())
    
    let playerItem = AVPlayerItem(asset: asset)
    // 使用这个 playerItem...
}

// 实现资源加载代理
@available(iOS 10.0, *)
extension YourClass: AVAssetResourceLoaderDelegate {
    func resourceLoader(_ resourceLoader: AVAssetResourceLoader, 
                       shouldWaitForLoadingOfRequestedResource loadingRequest: AVAssetResourceLoadingRequest) -> Bool {
        
        // 处理自定义资源加载逻辑
        // 比如从缓存加载、添加认证信息等
        
        guard let url = loadingRequest.request.url else {
            loadingRequest.finishLoading(with: NSError(domain: "InvalidURL", code: -1, userInfo: nil))
            return false
        }
        
        // 自定义加载逻辑
        loadCustomResource(for: loadingRequest, from: url)
        return true
    }
    
    private func loadCustomResource(for request: AVAssetResourceLoadingRequest, from url: URL) {
        // 实现自定义资源加载
        // 可以从本地缓存、网络或其他来源加载资源
        
        // 示例：从网络加载并缓存
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                request.finishLoading(with: error)
                return
            }
            
            if let data = data, let response = response {
                // 填充响应信息
                if let contentType = response.mimeType {
                    request.contentInformationRequest?.contentType = contentType
                }
                request.contentInformationRequest?.contentLength = Int64(data.count)
                request.contentInformationRequest?.isByteRangeAccessSupported = true
                
                // 提供数据
                request.dataRequest?.respond(with: data)
                request.finishLoading()
                
                // 缓存数据
                self.cacheData(data, for: url)
            }
        }.resume()
    }
    
    private func cacheData(_ data: Data, for url: URL) {
        // 实现缓存逻辑
    }
}
```

---

## 12. 实际应用示例

### 12.1 完整的播放器管理类
```swift
import AVFoundation
import UIKit

class PlayerItemManager: NSObject {
    
    // MARK: - Properties
    private var player: AVPlayer
    private var playerItem: AVPlayerItem?
    private var timeObserver: Any?
    
    // 回调
    var onStatusChange: ((AVPlayerItem.Status) -> Void)?
    var onDurationChange: ((TimeInterval) -> Void)?
    var onProgressUpdate: ((TimeInterval, TimeInterval) -> Void)?
    var onBufferUpdate: ((TimeInterval) -> Void)?
    var onPlaybackEnd: (() -> Void)?
    var onError: ((Error) -> Void)?
    
    // MARK: - Initialization
    override init() {
        self.player = AVPlayer()
        super.init()
    }
    
    deinit {
        cleanup()
    }
    
    // MARK: - Public Methods
    func loadVideo(from url: URL) {
        // 清理之前的播放项
        cleanup()
        
        // 创建新的播放项
        let newPlayerItem = AVPlayerItem(url: url)
        self.playerItem = newPlayerItem
        
        // 设置到播放器
        player.replaceCurrentItem(with: newPlayerItem)
        
        // 设置观察者和通知
        setupObservers()
        setupNotifications()
        setupTimeObserver()
        
        // 配置播放项
        configurePlayerItem()
    }
    
    func play() {
        player.play()
    }
    
    func pause() {
        player.pause()
    }
    
    func seekTo(seconds: Double, completion: ((Bool) -> Void)? = nil) {
        let time = CMTime(seconds: seconds, preferredTimescale: 600)
        playerItem?.seek(to: time, completionHandler: completion)
    }
    
    func setPlaybackRange(start: Double, end: Double) {
        guard let item = playerItem else { return }
        
        let startTime = CMTime(seconds: start, preferredTimescale: 600)
        let endTime = CMTime(seconds: end, preferredTimescale: 600)
        
        item.forwardPlaybackEndTime = endTime
        item.seek(to: startTime)
    }
    
    func getCurrentTime() -> Double {
        return CMTimeGetSeconds(player.currentTime())
    }
    
    func getDuration() -> Double {
        guard let duration = playerItem?.duration else { return 0 }
        return CMTimeGetSeconds(duration)
    }
    
    func getBufferedTime() -> Double {
        guard let timeRange = playerItem?.loadedTimeRanges.first?.timeRangeValue else { return 0 }
        return CMTimeGetSeconds(timeRange.start) + CMTimeGetSeconds(timeRange.duration)
    }
    
    // MARK: - Private Methods
    private func configurePlayerItem() {
        guard let item = playerItem else { return }
        
        // 设置缓冲时长
        item.preferredForwardBufferDuration = 30.0
        
        // 自动加载必要的资源键
        let keys = ["playable", "duration", "tracks"]
        for key in keys {
            item.asset.loadValuesAsynchronously(forKeys: [key]) {
                DispatchQueue.main.async {
                    self.handleAssetKeyLoaded(key: key)
                }
            }
        }
    }
    
    private func handleAssetKeyLoaded(key: String) {
        guard let item = playerItem else { return }
        
        var error: NSError?
        let status = item.asset.statusOfValue(forKey: key, error: &error)
        
        switch status {
        case .loaded:
            print("Asset key '\(key)' loaded successfully")
            
            if key == "duration" {
                let duration = CMTimeGetSeconds(item.duration)
                onDurationChange?(duration)
            }
            
        case .failed:
            print("Failed to load asset key '\(key)': \(error?.localizedDescription ?? "Unknown error")")
            onError?(error ?? NSError(domain: "AssetLoadingError", code: -1, userInfo: nil))
            
        case .cancelled:
            print("Loading of asset key '\(key)' was cancelled")
            
        default:
            break
        }
    }
    
    private func setupObservers() {
        guard let item = playerItem else { return }
        
        // 观察播放项状态
        item.addObserver(self, forKeyPath: "status", options: [.new], context: nil)
        item.addObserver(self, forKeyPath: "duration", options: [.new], context: nil)
        item.addObserver(self, forKeyPath: "loadedTimeRanges", options: [.new], context: nil)
        item.addObserver(self, forKeyPath: "isPlaybackLikelyToKeepUp", options: [.new], context: nil)
        item.addObserver(self, forKeyPath: "isPlaybackBufferEmpty", options: [.new], context: nil)
    }
    
    private func setupNotifications() {
        guard let item = playerItem else { return }
        
        let notificationCenter = NotificationCenter.default
        
        // 播放结束
        notificationCenter.addObserver(
            self,
            selector: #selector(playerItemDidFinishPlaying),
            name: .AVPlayerItemDidPlayToEndTime,
            object: item
        )
        
        // 播放失败
        notificationCenter.addObserver(
            self,
            selector: #selector(playerItemFailedToPlay),
            name: .AVPlayerItemFailedToPlayToEndTime,
            object: item
        )
        
        // 播放停滞
        notificationCenter.addObserver(
            self,
            selector: #selector(playerItemPlaybackStalled),
            name: .AVPlayerItemPlaybackStalled,
            object: item
        )
    }
    
    private func setupTimeObserver() {
        let interval = CMTime(seconds: 0.1, preferredTimescale: 600)
        
        timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            self?.handleTimeUpdate(time: time)
        }
    }
    
    private func handleTimeUpdate(time: CMTime) {
        let currentTime = CMTimeGetSeconds(time)
        let duration = getDuration()
        
        onProgressUpdate?(currentTime, duration)
    }
    
    private func cleanup() {
        // 移除时间观察者
        if let observer = timeObserver {
            player.removeTimeObserver(observer)
            timeObserver = nil
        }
        
        // 移除 KVO 观察者
        playerItem?.removeObserver(self, forKeyPath: "status")
        playerItem?.removeObserver(self, forKeyPath: "duration")
        playerItem?.removeObserver(self, forKeyPath: "loadedTimeRanges")
        playerItem?.removeObserver(self, forKeyPath: "isPlaybackLikelyToKeepUp")
        playerItem?.removeObserver(self, forKeyPath: "isPlaybackBufferEmpty")
        
        // 移除通知观察者
        NotificationCenter.default.removeObserver(self)
        
        playerItem = nil
    }
    
    // MARK: - Notification Handlers
    @objc private func playerItemDidFinishPlaying() {
        onPlaybackEnd?()
    }
    
    @objc private func playerItemFailedToPlay(_ notification: Notification) {
        if let error = notification.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? Error {
            onError?(error)
        }
    }
    
    @objc private func playerItemPlaybackStalled() {
        print("Playback stalled - buffering...")
    }
    
    // MARK: - KVO Handler
    override func observeValue(forKeyPath keyPath: String?, 
                              of object: Any?, 
                              change: [NSKeyValueChangeKey : Any]?, 
                              context: UnsafeMutableRawPointer?) {
        
        guard let keyPath = keyPath else { return }
        
        DispatchQueue.main.async {
            switch keyPath {
            case "status":
                self.handleStatusChange()
            case "duration":
                self.handleDurationChange()
            case "loadedTimeRanges":
                self.handleLoadedTimeRangesChange()
            case "isPlaybackLikelyToKeepUp":
                self.handleBufferStatusChange()
            case "isPlaybackBufferEmpty":
                self.handleBufferEmptyChange()
            default:
                break
            }
        }
    }
    
    private func handleStatusChange() {
        guard let status = playerItem?.status else { return }
        
        onStatusChange?(status)
        
        switch status {
        case .readyToPlay:
            print("Player item ready to play")
        case .failed:
            if let error = playerItem?.error {
                print("Player item failed: \(error.localizedDescription)")
                onError?(error)
            }
        case .unknown:
            print("Player item status unknown")
        @unknown default:
            break
        }
    }
    
    private func handleDurationChange() {
        if let duration = playerItem?.duration, CMTIME_IS_VALID(duration) {
            let seconds = CMTimeGetSeconds(duration)
            onDurationChange?(seconds)
        }
    }
    
    private func handleLoadedTimeRangesChange() {
        let bufferedTime = getBufferedTime()
        onBufferUpdate?(bufferedTime)
    }
    
    private func handleBufferStatusChange() {
        guard let item = playerItem else { return }
        
        if item.isPlaybackLikelyToKeepUp {
            print("Buffer sufficient - playback likely to keep up")
        } else {
            print("Buffer insufficient - playback may stall")
        }
    }
    
    private func handleBufferEmptyChange() {
        guard let item = playerItem else { return }
        
        if item.isPlaybackBufferEmpty {
            print("Playback buffer is empty")
        }
    }
}
```

### 12.2 播放器视图控制器示例
```swift
class PlayerViewController: UIViewController {
    
    // MARK: - Properties
    private let playerManager = PlayerItemManager()
    private var playerLayer: AVPlayerLayer!
    
    // UI Elements
    @IBOutlet weak var playerView: UIView!
    @IBOutlet weak var playPauseButton: UIButton!
    @IBOutlet weak var progressSlider: UISlider!
    @IBOutlet weak var currentTimeLabel: UILabel!
    @IBOutlet weak var durationLabel: UILabel!
    @IBOutlet weak var bufferProgressView: UIProgressView!
    
    private var isUserDraggingSlider = false
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupPlayerLayer()
        setupPlayerManager()
        setupUI()
        
        // 加载视频
        let videoURL = URL(string: "https://example.com/video.mp4")!
        playerManager.loadVideo(from: videoURL)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        playerLayer.frame = playerView.bounds
    }
    
    // MARK: - Setup
    private func setupPlayerLayer() {
        playerLayer = AVPlayerLayer(player: playerManager.player)
        playerLayer.videoGravity = .resizeAspect
        playerView.layer.addSublayer(playerLayer)
    }
    
    private func setupPlayerManager() {
        // 设置回调
        playerManager.onStatusChange = { [weak self] status in
            self?.handleStatusChange(status)
        }
        
        playerManager.onDurationChange = { [weak self] duration in
            self?.handleDurationChange(duration)
        }
        
        playerManager.onProgressUpdate = { [weak self] currentTime, duration in
            self?.handleProgressUpdate(currentTime: currentTime, duration: duration)
        }
        
        playerManager.onBufferUpdate = { [weak self] bufferedTime in
            self?.handleBufferUpdate(bufferedTime)
        }
        
        playerManager.onPlaybackEnd = { [weak self] in
            self?.handlePlaybackEnd()
        }
        
        playerManager.onError = { [weak self] error in
            self?.handleError(error)
        }
    }
    
    private func setupUI() {
        progressSlider.addTarget(self, action: #selector(sliderValueChanged), for: .valueChanged)
        progressSlider.addTarget(self, action: #selector(sliderTouchDown), for: .touchDown)
        progressSlider.addTarget(self, action: #selector(sliderTouchUp), for: [.touchUpInside, .touchUpOutside])
        
        currentTimeLabel.text = "00:00"
        durationLabel.text = "00:00"
        bufferProgressView.progress = 0
    }
    
    // MARK: - Actions
    @IBAction func playPauseButtonTapped(_ sender: UIButton) {
        if playerManager.player.rate == 0 {
            playerManager.play()
            sender.setTitle("Pause", for: .normal)
        } else {
            playerManager.pause()
            sender.setTitle("Play", for: .normal)
        }
    }
    
    @objc private func sliderValueChanged(_ sender: UISlider) {
        let duration = playerManager.getDuration()
        let targetTime = Double(sender.value) * duration
        
        // 实时更新时间显示
        currentTimeLabel.text = formatTime(targetTime)
    }
    
    @objc private func sliderTouchDown(_ sender: UISlider) {
        isUserDraggingSlider = true
    }
    
    @objc private func sliderTouchUp(_ sender: UISlider) {
        let duration = playerManager.getDuration()
        let targetTime = Double(sender.value) * duration
        
        playerManager.seekTo(seconds: targetTime) { [weak self] finished in
            self?.isUserDraggingSlider = false
        }
    }
    
    // MARK: - Event Handlers
    private func handleStatusChange(_ status: AVPlayerItem.Status) {
        switch status {
        case .readyToPlay:
            playPauseButton.isEnabled = true
        case .failed:
            playPauseButton.isEnabled = false
            showAlert(title: "播放失败", message: "无法播放此视频")
        case .unknown:
            playPauseButton.isEnabled = false
        @unknown default:
            break
        }
    }
    
    private func handleDurationChange(_ duration: TimeInterval) {
        durationLabel.text = formatTime(duration)
    }
    
    private func handleProgressUpdate(currentTime: TimeInterval, duration: TimeInterval) {
        guard !isUserDraggingSlider else { return }
        
        currentTimeLabel.text = formatTime(currentTime)
        
        if duration > 0 {
            progressSlider.value = Float(currentTime / duration)
        }
    }
    
    private func handleBufferUpdate(_ bufferedTime: TimeInterval) {
        let duration = playerManager.getDuration()
        if duration > 0 {
            bufferProgressView.progress = Float(bufferedTime / duration)
        }
    }
    
    private func handlePlaybackEnd() {
        playPauseButton.setTitle("Play", for: .normal)
        progressSlider.value = 0
    }
    
    private func handleError(_ error: Error) {
        showAlert(title: "错误", message: error.localizedDescription)
    }
    
    // MARK: - Utilities
    private func formatTime(_ seconds: TimeInterval) -> String {
        let totalSeconds = Int(seconds)
        let minutes = totalSeconds / 60
        let remainingSeconds = totalSeconds % 60
        return String(format: "%02d:%02d", minutes, remainingSeconds)
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        present(alert, animated: true)
    }
}
```

---

## 总结

### 关键要点
1. **状态管理**: 始终监控 AVPlayerItem 的状态变化
2. **时间处理**: 正确使用 CMTime 进行时间计算和跳转
3. **缓冲监控**: 监控缓冲状态以提供更好的用户体验
4. **错误处理**: 实现全面的错误处理和恢复机制
5. **内存管理**: 及时清理观察者和通知监听器

### 最佳实践
- 使用 KVO 监控重要属性变化
- 合理设置缓冲时长
- 实现播放状态的 UI 反馈
- 处理网络变化和中断
- 优化播放项切换和替换
- 合理使用媒体选择功能

### 常见问题解决
- **播放不开始**: 检查 status 是否为 readyToPlay
- **跳转不准确**: 使用精确跳转方法
- **缓冲问题**: 监控 isPlaybackLikelyToKeepUp
- **内存泄漏**: 确保移除所有观察者
- **播放卡顿**: 检查网络状态和缓冲配置

AVPlayerItem 是 AVFoundation 框架中的核心组件，掌握其 API 对于构建强大的媒体播放应用至关重要。