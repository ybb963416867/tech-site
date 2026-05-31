---
title: "AVPlayer 完整 API 指南"
description: ""
pubDate: 2026-05-29
category: "media"
tags: [iOS, Swift, API]
draft: false
---
# 🚀 AVPlayer 完整 API 指南

## 目录
1. [基础概念](#1-基础概念)
2. [初始化和基本设置](#2-初始化和基本设置)
3. [播放控制](#3-播放控制)
4. [时间和进度](#4-时间和进度)
5. [音量和静音](#5-音量和静音)
6. [播放状态监控](#6-播放状态监控)
7. [播放项管理](#7-播放项管理)
8. [错误处理](#8-错误处理)
9. [高级功能](#9-高级功能)
10. [实际应用示例](#10-实际应用示例)

---

## 1. 基础概念

### 1.1 AVPlayer 架构
```
AVPlayer
├── AVPlayerItem (播放项)
│   └── AVAsset (媒体资源)
├── AVPlayerLayer (显示层)
└── AVPlayerLooper (循环播放，iOS 10+)
```

### 1.2 关键类说明
- **AVPlayer**: 播放控制器，负责播放逻辑
- **AVPlayerItem**: 播放项，包含媒体信息和状态
- **AVAsset**: 媒体资源，可以是本地文件或网络URL
- **AVPlayerLayer**: 显示层，用于在视图中显示视频

---

## 2. 初始化和基本设置

### 2.1 创建 AVPlayer
```swift
import AVFoundation

// 方法1：创建空的播放器
let player = AVPlayer()

// 方法2：使用 URL 创建
let url = URL(string: "https://example.com/video.mp4")!
let player = AVPlayer(url: url)

// 方法3：使用 AVPlayerItem 创建
let playerItem = AVPlayerItem(url: url)
let player = AVPlayer(playerItem: playerItem)

// 方法4：使用本地文件
let localURL = Bundle.main.url(forResource: "video", withExtension: "mp4")!
let player = AVPlayer(url: localURL)
```

### 2.2 基本属性设置
```swift
// 播放速率 (0.0 = 暂停, 1.0 = 正常速度)
player.rate = 1.0

// 音量 (0.0 - 1.0)
player.volume = 0.8

// 静音
player.isMuted = false

// 自动等待网络 (iOS 10+)
player.automaticallyWaitsToMinimizeStalling = true

// 预加载时长 (iOS 10+)
player.preferredForwardBufferDuration = 30.0
```

---

## 3. 播放控制

### 3.1 基本播放控制
```swift
// 播放
player.play()

// 暂停
player.pause()

// 停止 (跳转到开始位置并暂停)
player.seek(to: .zero)
player.pause()

// 设置播放速率
player.rate = 1.5  // 1.5倍速播放
player.rate = 0.5  // 0.5倍速播放
player.rate = 0.0  // 暂停
```

### 3.2 播放速率控制
```swift
// 检查支持的播放速率
if let currentItem = player.currentItem {
    print("支持的播放速率: \(currentItem.canPlayFastForward)")
    print("快进速率: \(currentItem.fastForwardPlaybackRates)")
    print("快退速率: \(currentItem.reversePlaybackRates)")
}

// 设置不同播放速率
player.rate = 2.0   // 2倍速
player.rate = -1.0  // 倒退播放
```

### 3.3 跳转控制
```swift
// 跳转到指定时间
let time = CMTime(seconds: 30.0, preferredTimescale: 600)
player.seek(to: time)

// 带完成回调的跳转
player.seek(to: time) { finished in
    print("跳转完成: \(finished)")
}

// 精确跳转
player.seek(to: time, toleranceBefore: .zero, toleranceAfter: .zero)

// 跳转到百分比位置
if let duration = player.currentItem?.duration {
    let targetTime = CMTimeMultiplyByFloat64(duration, multiplier: 0.5) // 50%位置
    player.seek(to: targetTime)
}
```

---

## 4. 时间和进度

### 4.1 时间相关属性
```swift
// 当前播放时间
let currentTime = player.currentTime()

// 当前播放项的总时长
if let duration = player.currentItem?.duration {
    let totalSeconds = CMTimeGetSeconds(duration)
    print("总时长: \(totalSeconds) 秒")
}

// 播放进度 (0.0 - 1.0)
func getProgress() -> Double {
    guard let duration = player.currentItem?.duration,
          duration.isValid && !duration.isIndefinite else { return 0.0 }
    
    let currentTime = player.currentTime()
    return CMTimeGetSeconds(currentTime) / CMTimeGetSeconds(duration)
}
```

### 4.2 时间观察者
```swift
// 周期性时间观察者
var timeObserver: Any?

func addPeriodicTimeObserver() {
    let interval = CMTime(seconds: 0.1, preferredTimescale: 600)
    
    timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { time in
        let seconds = CMTimeGetSeconds(time)
        print("当前播放时间: \(seconds) 秒")
        
        // 更新UI进度条
        self.updateProgressBar(time: seconds)
    }
}

// 移除时间观察者
func removeTimeObserver() {
    if let observer = timeObserver {
        player.removeTimeObserver(observer)
        timeObserver = nil
    }
}

// 边界时间观察者
func addBoundaryTimeObserver() {
    let times = [
        CMTime(seconds: 30, preferredTimescale: 600),
        CMTime(seconds: 60, preferredTimescale: 600)
    ]
    
    player.addBoundaryTimeObserver(forTimes: times, queue: .main) {
        print("到达边界时间点")
    }
}
```

### 4.3 时间工具函数
```swift
// CMTime 转换为可读格式
func formatTime(_ time: CMTime) -> String {
    let seconds = CMTimeGetSeconds(time)
    let minutes = Int(seconds) / 60
    let remainingSeconds = Int(seconds) % 60
    return String(format: "%02d:%02d", minutes, remainingSeconds)
}

// 秒数转换为 CMTime
func timeFromSeconds(_ seconds: Double) -> CMTime {
    return CMTime(seconds: seconds, preferredTimescale: 600)
}
```

---

## 5. 音量和静音

### 5.1 音量控制
```swift
// 设置播放器音量 (0.0 - 1.0)
player.volume = 0.8

// 获取当前音量
let currentVolume = player.volume

// 静音/取消静音
player.isMuted = true
player.isMuted = false

// 渐变音量变化
func fadeVolume(to targetVolume: Float, duration: TimeInterval) {
    let startVolume = player.volume
    let volumeChange = targetVolume - startVolume
    let steps = 20
    let stepDuration = duration / Double(steps)
    
    for i in 0...steps {
        let delay = Double(i) * stepDuration
        let volume = startVolume + (volumeChange * Float(i) / Float(steps))
        
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            self.player.volume = volume
        }
    }
}
```

### 5.2 音频会话管理
```swift
import AVFoundation

// 设置音频会话
func setupAudioSession() {
    do {
        let audioSession = AVAudioSession.sharedInstance()
        
        // 设置类别
        try audioSession.setCategory(.playback, mode: .moviePlayback)
        
        // 激活会话
        try audioSession.setActive(true)
        
    } catch {
        print("音频会话设置失败: \(error)")
    }
}

// 处理音频中断
func observeAudioSessionInterruptions() {
    NotificationCenter.default.addObserver(
        self,
        selector: #selector(audioSessionInterrupted),
        name: AVAudioSession.interruptionNotification,
        object: AVAudioSession.sharedInstance()
    )
}

@objc func audioSessionInterrupted(notification: Notification) {
    guard let info = notification.userInfo,
          let typeValue = info[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
        return
    }
    
    switch type {
    case .began:
        // 中断开始，暂停播放
        player.pause()
    case .ended:
        // 中断结束，恢复播放
        if let optionsValue = info[AVAudioSessionInterruptionOptionKey] as? UInt {
            let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
            if options.contains(.shouldResume) {
                player.play()
            }
        }
    @unknown default:
        break
    }
}
```

---

## 6. 播放状态监控

### 6.1 播放状态枚举
```swift
// AVPlayer.TimeControlStatus
enum TimeControlStatus {
    case paused         // 暂停
    case waitingToPlayAtSpecifiedRate  // 等待播放
    case playing        // 播放中
}

// AVPlayerItem.Status
enum PlayerItemStatus {
    case unknown        // 未知状态
    case readyToPlay    // 准备就绪
    case failed         // 失败
}
```

### 6.2 状态监控
```swift
// KVO 观察播放状态
private var statusObserver: NSKeyValueObservation?
private var timeControlStatusObserver: NSKeyValueObservation?

func setupObservers() {
    // 观察播放项状态
    statusObserver = player.currentItem?.observe(\.status) { item, _ in
        switch item.status {
        case .readyToPlay:
            print("准备就绪，可以播放")
        case .failed:
            print("播放失败: \(item.error?.localizedDescription ?? "未知错误")")
        case .unknown:
            print("状态未知")
        @unknown default:
            break
        }
    }
    
    // 观察时间控制状态
    timeControlStatusObserver = player.observe(\.timeControlStatus) { player, _ in
        switch player.timeControlStatus {
        case .paused:
            print("播放暂停")
        case .playing:
            print("正在播放")
        case .waitingToPlayAtSpecifiedRate:
            print("等待播放，原因: \(player.reasonForWaitingToPlay?.rawValue ?? "未知")")
        @unknown default:
            break
        }
    }
}

// 清理观察者
func removeObservers() {
    statusObserver?.invalidate()
    timeControlStatusObserver?.invalidate()
}
```

### 6.3 播放结束监控
```swift
// 监听播放结束通知
func observePlaybackEnd() {
    NotificationCenter.default.addObserver(
        self,
        selector: #selector(playerDidFinishPlaying),
        name: .AVPlayerItemDidPlayToEndTime,
        object: player.currentItem
    )
}

@objc func playerDidFinishPlaying(notification: Notification) {
    print("播放结束")
    
    // 可选：重新播放
    player.seek(to: .zero)
    player.play()
}

// 监听播放失败通知
func observePlaybackFailure() {
    NotificationCenter.default.addObserver(
        self,
        selector: #selector(playerDidFailToPlay),
        name: .AVPlayerItemFailedToPlayToEndTime,
        object: player.currentItem
    )
}

@objc func playerDidFailToPlay(notification: Notification) {
    if let error = notification.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? Error {
        print("播放失败: \(error.localizedDescription)")
    }
}
```

---

## 7. 播放项管理

### 7.1 切换播放项
```swift
// 替换当前播放项
func replaceCurrentItem(with url: URL) {
    let newItem = AVPlayerItem(url: url)
    player.replaceCurrentItem(with: newItem)
    
    // 重新设置观察者
    setupItemObservers()
}

// 队列播放 (使用 AVQueuePlayer)
func setupQueuePlayer() {
    let urls = [
        URL(string: "video1.mp4")!,
        URL(string: "video2.mp4")!,
        URL(string: "video3.mp4")!
    ]
    
    let items = urls.map { AVPlayerItem(url: $0) }
    let queuePlayer = AVQueuePlayer(items: items)
    
    // 播放下一个
    queuePlayer.advanceToNextItem()
}
```

### 7.2 播放项属性
```swift
// 获取播放项信息
func getPlayerItemInfo() {
    guard let item = player.currentItem else { return }
    
    // 时长
    let duration = item.duration
    print("时长: \(CMTimeGetSeconds(duration)) 秒")
    
    // 缓冲进度
    if let timeRange = item.loadedTimeRanges.first?.timeRangeValue {
        let bufferedSeconds = CMTimeGetSeconds(timeRange.start) + CMTimeGetSeconds(timeRange.duration)
        print("已缓冲: \(bufferedSeconds) 秒")
    }
    
    // 播放速率
    print("当前速率: \(item.canPlayFastForward)")
    
    // 视频轨道
    let videoTracks = item.asset.tracks(withMediaType: .video)
    print("视频轨道数: \(videoTracks.count)")
    
    // 音频轨道
    let audioTracks = item.asset.tracks(withMediaType: .audio)
    print("音频轨道数: \(audioTracks.count)")
}
```

### 7.3 预加载和缓存
```swift
// 预加载媒体
func preloadMedia(url: URL, completion: @escaping (Bool) -> Void) {
    let asset = AVAsset(url: url)
    let keys = ["playable", "duration"]
    
    asset.loadValuesAsynchronously(forKeys: keys) {
        var error: NSError?
        let status = asset.statusOfValue(forKey: "playable", error: &error)
        
        DispatchQueue.main.async {
            switch status {
            case .loaded:
                completion(true)
            case .failed, .cancelled:
                completion(false)
            case .loading, .unknown:
                completion(false)
            @unknown default:
                completion(false)
            }
        }
    }
}

// 设置缓存策略
func setupCachePolicy() {
    if let item = player.currentItem {
        // 设置预加载时长
        item.preferredForwardBufferDuration = 30.0
        
        // 自动等待缓冲
        player.automaticallyWaitsToMinimizeStalling = true
    }
}
```

---

## 8. 错误处理

### 8.1 常见错误类型
```swift
// 播放器错误处理
func handlePlayerError() {
    // 检查播放项错误
    if let error = player.currentItem?.error {
        switch error.code {
        case AVError.fileFormatNotRecognized.rawValue:
            print("文件格式不支持")
        case AVError.noDataAvailable.rawValue:
            print("没有可用数据")
        case AVError.networkUnavailable.rawValue:
            print("网络不可用")
        default:
            print("播放错误: \(error.localizedDescription)")
        }
    }
    
    // 检查播放器状态
    if let item = player.currentItem, item.status == .failed {
        print("播放项状态失败")
    }
}

// 网络错误处理
func handleNetworkError(_ error: Error) {
    if let nsError = error as NSError? {
        switch nsError.code {
        case NSURLErrorNotConnectedToInternet:
            print("网络连接不可用")
        case NSURLErrorTimedOut:
            print("请求超时")
        case NSURLErrorCannotFindHost:
            print("无法找到服务器")
        default:
            print("网络错误: \(error.localizedDescription)")
        }
    }
}
```

### 8.2 错误恢复机制
```swift
class RobustPlayer {
    private let player = AVPlayer()
    private var retryCount = 0
    private let maxRetries = 3
    
    func playWithRetry(url: URL) {
        let item = AVPlayerItem(url: url)
        player.replaceCurrentItem(with: item)
        
        // 监听错误
        item.observe(\.status) { [weak self] item, _ in
            if item.status == .failed {
                self?.handlePlaybackFailure()
            } else if item.status == .readyToPlay {
                self?.retryCount = 0
                self?.player.play()
            }
        }
    }
    
    private func handlePlaybackFailure() {
        guard retryCount < maxRetries else {
            print("重试次数超限，播放失败")
            return
        }
        
        retryCount += 1
        print("播放失败，第 \(retryCount) 次重试")
        
        // 延迟重试
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            if let url = self.player.currentItem?.asset as? AVURLAsset {
                self.playWithRetry(url: url.url)
            }
        }
    }
}
```

---

## 9. 高级功能

### 9.1 自定义播放控制
```swift
class CustomPlayerController {
    private let player = AVPlayer()
    private var isPlaying = false
    
    // 播放/暂停切换
    func togglePlayback() {
        if isPlaying {
            player.pause()
        } else {
            player.play()
        }
        isPlaying.toggle()
    }
    
    // 快进/快退
    func seek(by seconds: Double) {
        let currentTime = player.currentTime()
        let targetTime = CMTimeAdd(currentTime, CMTime(seconds: seconds, preferredTimescale: 600))
        
        // 确保不超出范围
        if let duration = player.currentItem?.duration {
            let clampedTime = CMTimeClampToRange(targetTime, range: CMTimeRange(start: .zero, duration: duration))
            player.seek(to: clampedTime)
        }
    }
    
    // 跳转到百分比位置
    func seekToPercentage(_ percentage: Double) {
        guard let duration = player.currentItem?.duration else { return }
        
        let targetTime = CMTimeMultiplyByFloat64(duration, multiplier: percentage)
        player.seek(to: targetTime)
    }
}
```

### 9.2 画中画支持 (iOS 14+)
```swift
import AVKit

class PictureInPictureController: NSObject {
    private var pipController: AVPictureInPictureController?
    private let playerLayer: AVPlayerLayer
    
    init(playerLayer: AVPlayerLayer) {
        self.playerLayer = playerLayer
        super.init()
        setupPictureInPicture()
    }
    
    private func setupPictureInPicture() {
        if AVPictureInPictureController.isPictureInPictureSupported() {
            pipController = AVPictureInPictureController(playerLayer: playerLayer)
            pipController?.delegate = self
        }
    }
    
    func startPictureInPicture() {
        pipController?.startPictureInPicture()
    }
    
    func stopPictureInPicture() {
        pipController?.stopPictureInPicture()
    }
}

extension PictureInPictureController: AVPictureInPictureControllerDelegate {
    func pictureInPictureControllerWillStartPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
        print("画中画即将开始")
    }
    
    func pictureInPictureControllerDidStopPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
        print("画中画已停止")
    }
}
```

### 9.3 循环播放 (iOS 10+)
```swift
import AVFoundation

class LoopingPlayer {
    private var player: AVQueuePlayer
    private var playerLooper: AVPlayerLooper
    
    init(url: URL) {
        let asset = AVAsset(url: url)
        let item = AVPlayerItem(asset: asset)
        
        player = AVQueuePlayer(playerItem: item)
        playerLooper = AVPlayerLooper(player: player, templateItem: item)
    }
    
    func play() {
        player.play()
    }
    
    func pause() {
        player.pause()
    }
}
```

---

## 10. 实际应用示例

### 10.1 完整的视频播放器
```swift
import UIKit
import AVFoundation
import AVKit

class VideoPlayerViewController: UIViewController {
    
    // MARK: - Properties
    private var player: AVPlayer!
    private var playerLayer: AVPlayerLayer!
    private var timeObserver: Any?
    
    @IBOutlet weak var playerView: UIView!
    @IBOutlet weak var playPauseButton: UIButton!
    @IBOutlet weak var progressSlider: UISlider!
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var volumeSlider: UISlider!
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupPlayer()
        setupUI()
        setupObservers()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        playerLayer.frame = playerView.bounds
    }
    
    deinit {
        removeObservers()
    }
    
    // MARK: - Setup
    private func setupPlayer() {
        // 创建播放器
        guard let url = URL(string: "https://example.com/video.mp4") else { return }
        let playerItem = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: playerItem)
        
        // 创建显示层
        playerLayer = AVPlayerLayer(player: player)
        playerLayer.videoGravity = .resizeAspect
        playerView.layer.addSublayer(playerLayer)
        
        // 设置音频会话
        setupAudioSession()
    }
    
    private func setupUI() {
        playPauseButton.setTitle("Play", for: .normal)
        progressSlider.minimumValue = 0
        progressSlider.maximumValue = 1
        volumeSlider.minimumValue = 0
        volumeSlider.maximumValue = 1
        volumeSlider.value = 0.8
        player.volume = 0.8
    }
    
    private func setupObservers() {
        // 时间观察者
        let interval = CMTime(seconds: 0.1, preferredTimescale: 600)
        timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            self?.updateUI(time: time)
        }
        
        // 状态观察者
        player.currentItem?.observe(\.status) { [weak self] item, _ in
            DispatchQueue.main.async {
                self?.handleStatusChange(item.status)
            }
        }
        
        // 播放结束通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerDidFinishPlaying),
            name: .AVPlayerItemDidPlayToEndTime,
            object: player.currentItem
        )
    }
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("音频会话设置失败: \(error)")
        }
    }
    
    // MARK: - Actions
    @IBAction func playPauseButtonTapped(_ sender: UIButton) {
        if player.rate == 0 {
            player.play()
            sender.setTitle("Pause", for: .normal)
        } else {
            player.pause()
            sender.setTitle("Play", for: .normal)
        }
    }
    
    @IBAction func progressSliderChanged(_ sender: UISlider) {
        guard let duration = player.currentItem?.duration else { return }
        
        let targetTime = CMTimeMultiplyByFloat64(duration, multiplier: Float64(sender.value))
        player.seek(to: targetTime)
    }
    
    @IBAction func volumeSliderChanged(_ sender: UISlider) {
        player.volume = sender.value
    }
    
    // MARK: - Private Methods
    private func updateUI(time: CMTime) {
        guard let duration = player.currentItem?.duration,
              duration.isValid && !duration.isIndefinite else { return }
        
        let currentTime = CMTimeGetSeconds(time)
        let totalTime = CMTimeGetSeconds(duration)
        
        // 更新进度条
        progressSlider.value = Float(currentTime / totalTime)
        
        // 更新时间标签
        timeLabel.text = "\(formatTime(currentTime)) / \(formatTime(totalTime))"
    }
    
    private func formatTime(_ seconds: Double) -> String {
        let minutes = Int(seconds) / 60
        let remainingSeconds = Int(seconds) % 60
        return String(format: "%02d:%02d", minutes, remainingSeconds)
    }
    
    private func handleStatusChange(_ status: AVPlayerItem.Status) {
        switch status {
        case .readyToPlay:
            print("准备就绪")
        case .failed:
            print("播放失败: \(player.currentItem?.error?.localizedDescription ?? "")")
        case .unknown:
            print("状态未知")
        @unknown default:
            break
        }
    }
    
    @objc private func playerDidFinishPlaying() {
        playPauseButton.setTitle("Play", for: .normal)
        player.seek(to: .zero)
    }
    
    private func removeObservers() {
        if let observer = timeObserver {
            player.removeTimeObserver(observer)
        }
        NotificationCenter.default.removeObserver(self)
    }
}
```

### 10.2 简化的视频播放器
```swift
class SimpleVideoPlayer: UIView {
    private var player: AVPlayer!
    private var playerLayer: AVPlayerLayer!
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupPlayer()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupPlayer()
    }
    
    private func setupPlayer() {
        // 创建播放器和显示层
        player = AVPlayer()
        playerLayer = AVPlayerLayer(player: player)
        playerLayer.videoGravity = .resizeAspectFill
        layer.addSublayer(playerLayer)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        playerLayer.frame = bounds
    }
    
    // 公共接口
    func loadVideo(from url: URL) {
        let playerItem = AVPlayerItem(url: url)
        player.replaceCurrentItem(with: playerItem)
    }
    
    func play() {
        player.play()
    }
    
    func pause() {
        player.pause()
    }
    
    func setVolume(_ volume: Float) {
        player.volume = volume
    }
}

// 使用示例
class ViewController: UIViewController {
    @IBOutlet weak var videoPlayerView: SimpleVideoPlayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let url = URL(string: "https://example.com/video.mp4")!
        videoPlayerView.loadVideo(from: url)
        videoPlayerView.play()
    }
}
```

# AVPlayer Seek 方法详解

## 1. seek(to:) - 基础同步 Seek

```swift
func seek(to time: CMTime)
```

### 特点
- **最简单的 seek 方法**
- **同步执行**，会阻塞当前线程直到 seek 完成
- **精度较低**，系统会选择最近的关键帧进行定位
- **无回调机制**，无法知道 seek 是否完成或成功

### 适用场景
- 简单的播放控制
- 对精度要求不高的场景
- 不需要监听 seek 完成状态

### 示例
```swift
let targetTime = CMTime(seconds: 30.0, preferredTimescale: 600)
player.seek(to: targetTime)
```

---

## 2. seek(to:completionHandler:) - 带回调的 Seek

```swift
func seek(to time: CMTime, completionHandler: @escaping (Bool) -> Void)
```

### 特点
- **异步执行**，不会阻塞主线程
- **提供完成回调**，可以知道 seek 是否成功
- **精度仍然较低**，基于关键帧定位
- **推荐使用**，相比第一种方法更安全

### 参数说明
- `time`: 目标时间点
- `completionHandler`: 完成回调，参数表示是否成功

### 适用场景
- 需要知道 seek 完成状态的场景
- UI 更新需要等待 seek 完成
- 错误处理和用户反馈

### 示例
```swift
let targetTime = CMTime(seconds: 30.0, preferredTimescale: 600)
player.seek(to: targetTime) { success in
    DispatchQueue.main.async {
        if success {
            print("Seek 成功")
        } else {
            print("Seek 失败")
        }
    }
}
```

---

## 3. seek(to:toleranceBefore:toleranceAfter:) - 精确控制 Seek

```swift
func seek(to time: CMTime, 
         toleranceBefore: CMTime, 
         toleranceAfter: CMTime)
```

### 特点
- **可控制精度**，通过容差参数精确控制
- **同步执行**，会阻塞线程
- **最灵活的精度控制**
- **性能可调节**，精度越高性能消耗越大

### 参数说明
- `time`: 目标时间点
- `toleranceBefore`: 目标时间之前的容差
- `toleranceAfter`: 目标时间之后的容差

### 精度控制
```swift
// 最高精度（性能消耗大）
player.seek(to: targetTime, 
           toleranceBefore: .zero, 
           toleranceAfter: .zero)

// 平衡精度和性能
let tolerance = CMTime(seconds: 0.1, preferredTimescale: 600)
player.seek(to: targetTime, 
           toleranceBefore: tolerance, 
           toleranceAfter: tolerance)

// 使用关键帧（性能最好，精度最低）
player.seek(to: targetTime, 
           toleranceBefore: .positiveInfinity, 
           toleranceAfter: .positiveInfinity)
```

### 适用场景
- 需要精确控制播放位置
- 对性能和精度有特定要求
- 专业视频编辑应用

---

## 4. seek(to:toleranceBefore:toleranceAfter:completionHandler:) - 完整功能 Seek

```swift
func seek(to time: CMTime, 
         toleranceBefore: CMTime, 
         toleranceAfter: CMTime, 
         completionHandler: @escaping (Bool) -> Void)
```

### 特点
- **功能最完整**的 seek 方法
- **异步执行** + **精度控制** + **完成回调**
- **生产环境推荐使用**
- **最佳实践**，结合了所有优点

### 适用场景
- 生产环境的视频播放器
- 需要精确控制和状态反馈的应用
- 复杂的播放控制逻辑

### 示例
```swift
let targetTime = CMTime(seconds: 30.0, preferredTimescale: 600)
let tolerance = CMTime(seconds: 0.1, preferredTimescale: 600)

player.seek(to: targetTime,
           toleranceBefore: tolerance,
           toleranceAfter: tolerance) { success in
    DispatchQueue.main.async {
        // 更新UI，处理结果
        self.updateSeekUI(success: success)
    }
}
```

---

## 性能对比与选择建议

### 精度 vs 性能
- **零容差**: 最高精度，但会显著增加 CPU 和 I/O 消耗
- **小容差**: 在精度和性能间取得平衡
- **无限容差**: 使用最近关键帧，性能最佳但精度最低

### 方法选择建议

| 场景 | 推荐方法 | 理由 |
|------|---------|------|
| 简单播放控制 | `seek(to:completionHandler:)` | 异步 + 回调，足够用 |
| 精确视频编辑 | `seek(to:toleranceBefore:toleranceAfter:completionHandler:)` | 完全控制 |
| 性能敏感应用 | 使用较大容差的完整方法 | 平衡性能和功能 |
| 快速原型 | `seek(to:)` | 最简单，但不推荐生产环境 |

### 最佳实践
```swift
class VideoPlayerManager {
    private let player = AVPlayer()
    
    func seekToTime(_ seconds: Double, precision: SeekPrecision = .balanced) {
        let targetTime = CMTime(seconds: seconds, preferredTimescale: 600)
        let tolerance: CMTime
        
        switch precision {
        case .exact:
            tolerance = .zero
        case .balanced:
            tolerance = CMTime(seconds: 0.1, preferredTimescale: 600)
        case .fast:
            tolerance = .positiveInfinity
        }
        
        player.seek(to: targetTime,
                   toleranceBefore: tolerance,
                   toleranceAfter: tolerance) { [weak self] success in
            DispatchQueue.main.async {
                self?.handleSeekCompletion(success: success)
            }
        }
    }
}

enum SeekPrecision {
    case exact    // 最高精度
    case balanced // 平衡模式
    case fast     // 最快速度
}
```

## 注意事项

1. **线程安全**: 所有 seek 方法都应该在主线程调用
2. **状态检查**: seek 前应检查 player 状态和 item 可用性
3. **重复调用**: 连续快速调用 seek 可能导致性能问题
4. **内存管理**: 使用 completionHandler 时注意避免循环引用
5. **错误处理**: seek 失败时应该有合适的错误处理机制

---

## 总结

### 关键要点
1. **初始化**: 使用 URL 或 AVPlayerItem 创建 AVPlayer
2. **播放控制**: 使用 `play()`, `pause()`, `rate` 属性控制播放
3. **时间管理**: 使用 CMTime 处理时间，添加时间观察者监控进度
4. **状态监控**: 使用 KVO 观察播放状态变化
5. **错误处理**: 监控播放项状态和错误信息
6. **内存管理**: 及时移除观察者和通知

### 最佳实践
- 在主线程更新 UI
- 合理设置音频会话
- 实现错误恢复机制
- 优化缓冲策略
- 适配不同设备和屏幕尺寸