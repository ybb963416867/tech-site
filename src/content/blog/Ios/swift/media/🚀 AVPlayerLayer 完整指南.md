---
title: "AVPlayerLayer 完整指南"
description: "AVPlayerLayer 是 AVFoundation 框架中用于显示视频内容的核心类，它是 CALayer 的子类，专门用于渲染 AVPlayer 播放的视频内容。本指南详细介绍了 AVPlayerLayer 的所有主要 API、..."
pubDate: 2026-05-29
category: "media"
tags: [iOS, Swift, API, React, SEO]
draft: false
---
# 🚀 AVPlayerLayer 完整指南

AVPlayerLayer 是 AVFoundation 框架中用于显示视频内容的核心类，它是 CALayer 的子类，专门用于渲染 AVPlayer 播放的视频内容。本指南详细介绍了 AVPlayerLayer 的所有主要 API、属性和用法。

## 目录
- [基础概念](#基础概念)
- [创建和初始化](#创建和初始化)
- [核心属性](#核心属性)
- [视频显示控制](#视频显示控制)
- [播放器绑定](#播放器绑定)
- [图层管理](#图层管理)
- [实际应用场景](#实际应用场景)
- [性能优化](#性能优化)
- [常见问题解决](#常见问题解决)
- [最佳实践](#最佳实践)

## 基础概念

AVPlayerLayer 是一个特殊的 CALayer 子类，主要特点：

- **专用于视频显示**：专门为视频内容渲染而设计
- **硬件加速**：充分利用 GPU 进行视频解码和渲染
- **与 AVPlayer 集成**：直接与 AVPlayer 对象关联
- **支持多种视频格式**：支持 iOS 系统支持的所有视频格式
- **自动处理视频尺寸**：自动适应不同分辨率的视频内容

## 创建和初始化

### 基本创建方式

```swift
import AVFoundation
import UIKit

class VideoPlayerViewController: UIViewController {
    
    var player: AVPlayer!
    var playerLayer: AVPlayerLayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupVideoPlayer()
    }
    
    func setupVideoPlayer() {
        // 方法1：直接创建
        playerLayer = AVPlayerLayer()
        
        // 方法2：使用播放器创建
        guard let url = URL(string: "https://example.com/video.mp4") else { return }
        player = AVPlayer(url: url)
        playerLayer = AVPlayerLayer(player: player)
        
        // 方法3：先创建后绑定播放器
        playerLayer = AVPlayerLayer()
        playerLayer.player = player
        
        // 添加到视图层
        view.layer.addSublayer(playerLayer)
        
        // 设置frame
        playerLayer.frame = view.bounds
    }
}
```

### 使用工厂方法创建

```swift
class VideoPlayerView: UIView {
    
    var playerLayer: AVPlayerLayer {
        return layer as! AVPlayerLayer
    }
    
    var player: AVPlayer? {
        get { return playerLayer.player }
        set { playerLayer.player = newValue }
    }
    
    // 重写layerClass，让视图直接使用AVPlayerLayer
    override class var layerClass: AnyClass {
        return AVPlayerLayer.self
    }
    
    func setupPlayer(with url: URL) {
        let player = AVPlayer(url: url)
        self.player = player
        
        // 配置播放器图层
        playerLayer.videoGravity = .resizeAspect
        playerLayer.backgroundColor = UIColor.black.cgColor
    }
}
```

## 核心属性

### 播放器相关属性

```swift
class PlayerLayerProperties: UIViewController {
    
    var playerLayer: AVPlayerLayer!
    
    func configurePlayerProperties() {
        // 关联的播放器对象
        playerLayer.player = AVPlayer()
        
        // 获取当前播放器（只读）
        let currentPlayer = playerLayer.player
        
        // 检查播放器是否准备就绪
        if let player = playerLayer.player {
            print("播放器状态: \(player.status.rawValue)")
        }
    }
}
```

### 视频显示属性

```swift
extension PlayerLayerProperties {
    
    func configureVideoDisplay() {
        // 视频重力（如何适应图层frame）
        playerLayer.videoGravity = .resizeAspect
        
        /*
         videoGravity 可选值：
         - .resize: 拉伸视频以完全填充图层（可能变形）
         - .resizeAspect: 保持宽高比，适应图层（可能有黑边）
         - .resizeAspectFill: 保持宽高比，填满图层（可能裁剪）
         */
        
        // 获取视频的实际尺寸
        if let videoRect = playerLayer.videoRect {
            print("视频显示区域: \(videoRect)")
        }
        
        // 图层背景色（视频未覆盖的区域）
        playerLayer.backgroundColor = UIColor.black.cgColor
        
        // 图层透明度
        playerLayer.opacity = 1.0
        
        // 是否隐藏图层
        playerLayer.isHidden = false
    }
}
```

### 图层基础属性（继承自CALayer）

```swift
extension PlayerLayerProperties {
    
    func configureLayerProperties() {
        // 图层位置和尺寸
        playerLayer.frame = view.bounds
        playerLayer.bounds = CGRect(x: 0, y: 0, width: 300, height: 200)
        playerLayer.position = view.center
        
        // 锚点
        playerLayer.anchorPoint = CGPoint(x: 0.5, y: 0.5)
        
        // 变换
        playerLayer.transform = CATransform3DMakeRotation(.pi/4, 0, 0, 1)
        
        // 圆角
        playerLayer.cornerRadius = 10
        playerLayer.masksToBounds = true
        
        // 边框
        playerLayer.borderWidth = 2
        playerLayer.borderColor = UIColor.white.cgColor
        
        // 阴影
        playerLayer.shadowColor = UIColor.black.cgColor
        playerLayer.shadowOffset = CGSize(width: 0, height: 2)
        playerLayer.shadowOpacity = 0.5
        playerLayer.shadowRadius = 4
    }
}
```

## 视频显示控制

### videoGravity 详细说明

```swift
class VideoGravityDemo: UIViewController {
    
    @IBOutlet weak var containerView: UIView!
    var playerLayer: AVPlayerLayer!
    
    func demonstrateVideoGravity() {
        // 创建播放器和图层
        let url = URL(string: "https://example.com/video.mp4")!
        let player = AVPlayer(url: url)
        playerLayer = AVPlayerLayer(player: player)
        
        containerView.layer.addSublayer(playerLayer)
        playerLayer.frame = containerView.bounds
        
        // 1. 默认 - 保持宽高比适应
        setVideoGravity(.resizeAspect)
    }
    
    func setVideoGravity(_ gravity: AVLayerVideoGravity) {
        playerLayer.videoGravity = gravity
        
        switch gravity {
        case .resize:
            // 拉伸视频以完全填充图层
            // 优点：完全填充，无黑边
            // 缺点：可能导致视频变形
            print("设置为拉伸模式")
            
        case .resizeAspect:
            // 保持宽高比，适应图层大小
            // 优点：不变形，保持原始比例
            // 缺点：可能有黑边
            print("设置为适应模式")
            
        case .resizeAspectFill:
            // 保持宽高比，填满图层
            // 优点：无黑边，不变形
            // 缺点：可能裁剪部分内容
            print("设置为填充模式")
            
        default:
            break
        }
    }
    
    // 切换不同的显示模式
    @IBAction func toggleVideoGravity(_ sender: UIButton) {
        let gravities: [AVLayerVideoGravity] = [.resizeAspect, .resizeAspectFill, .resize]
        let currentIndex = gravities.firstIndex(of: playerLayer.videoGravity) ?? 0
        let nextIndex = (currentIndex + 1) % gravities.count
        
        // 动画切换
        CATransaction.begin()
        CATransaction.setAnimationDuration(0.3)
        setVideoGravity(gravities[nextIndex])
        CATransaction.commit()
        
        sender.setTitle(gravities[nextIndex].rawValue, for: .normal)
    }
}
```

### 视频区域获取

```swift
extension VideoGravityDemo {
    
    func getVideoDisplayInfo() {
        // 获取视频在图层中的实际显示区域
        let videoRect = playerLayer.videoRect
        print("视频显示区域: \(videoRect)")
        
        // 计算视频的缩放比例
        guard let player = playerLayer.player,
              let currentItem = player.currentItem else { return }
        
        let videoSize = currentItem.presentationSize
        let layerSize = playerLayer.bounds.size
        
        print("原始视频尺寸: \(videoSize)")
        print("图层尺寸: \(layerSize)")
        
        // 根据 videoGravity 计算实际显示信息
        calculateVideoDisplayMetrics(videoSize: videoSize, layerSize: layerSize)
    }
    
    private func calculateVideoDisplayMetrics(videoSize: CGSize, layerSize: CGSize) {
        let videoAspectRatio = videoSize.width / videoSize.height
        let layerAspectRatio = layerSize.width / layerSize.height
        
        switch playerLayer.videoGravity {
        case .resizeAspect:
            if videoAspectRatio > layerAspectRatio {
                // 视频更宽，以宽度为基准
                let displayWidth = layerSize.width
                let displayHeight = displayWidth / videoAspectRatio
                print("适应模式 - 显示尺寸: \(displayWidth) x \(displayHeight)")
            } else {
                // 视频更高，以高度为基准
                let displayHeight = layerSize.height
                let displayWidth = displayHeight * videoAspectRatio
                print("适应模式 - 显示尺寸: \(displayWidth) x \(displayHeight)")
            }
            
        case .resizeAspectFill:
            if videoAspectRatio > layerAspectRatio {
                // 以高度为基准填充
                let displayHeight = layerSize.height
                let displayWidth = displayHeight * videoAspectRatio
                print("填充模式 - 显示尺寸: \(displayWidth) x \(displayHeight)")
            } else {
                // 以宽度为基准填充
                let displayWidth = layerSize.width
                let displayHeight = displayWidth / videoAspectRatio
                print("填充模式 - 显示尺寸: \(displayWidth) x \(displayHeight)")
            }
            
        case .resize:
            print("拉伸模式 - 显示尺寸: \(layerSize)")
            
        default:
            break
        }
    }
}
```

## 播放器绑定

### 播放器生命周期管理

```swift
class PlayerLayerManager: NSObject {
    
    private var player: AVPlayer?
    private var playerLayer: AVPlayerLayer
    private var timeObserver: Any?
    private var statusObserver: NSKeyValueObservation?
    
    init(frame: CGRect) {
        playerLayer = AVPlayerLayer()
        playerLayer.frame = frame
        super.init()
    }
    
    // 绑定播放器
    func bindPlayer(_ player: AVPlayer) {
        // 移除旧的观察者
        removeObservers()
        
        // 设置新播放器
        self.player = player
        playerLayer.player = player
        
        // 添加新的观察者
        addObservers()
    }
    
    // 解绑播放器
    func unbindPlayer() {
        removeObservers()
        playerLayer.player = nil
        player = nil
    }
    
    private func addObservers() {
        guard let player = player else { return }
        
        // 播放进度观察
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 1000),
            queue: DispatchQueue.main
        ) { [weak self] time in
            self?.handleTimeUpdate(time)
        }
        
        // 播放状态观察
        statusObserver = player.observe(\.status, options: [.new, .old]) { [weak self] player, change in
            self?.handleStatusChange(player.status)
        }
        
        // 播放完成通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerDidFinishPlaying),
            name: .AVPlayerItemDidPlayToEndTime,
            object: player.currentItem
        )
    }
    
    private func removeObservers() {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
            self.timeObserver = nil
        }
        
        statusObserver?.invalidate()
        statusObserver = nil
        
        NotificationCenter.default.removeObserver(self)
    }
    
    private func handleTimeUpdate(_ time: CMTime) {
        let seconds = CMTimeGetSeconds(time)
        print("播放进度: \(seconds)秒")
        
        // 可以在这里更新UI进度条等
    }
    
    private func handleStatusChange(_ status: AVPlayer.Status) {
        switch status {
        case .unknown:
            print("播放器状态未知")
            
        case .readyToPlay:
            print("播放器准备就绪")
            // 可以在这里开始播放
            player?.play()
            
        case .failed:
            print("播放器失败: \(player?.error?.localizedDescription ?? "未知错误")")
            
        @unknown default:
            print("未知播放器状态")
        }
    }
    
    @objc private func playerDidFinishPlaying() {
        print("视频播放完成")
        // 可以在这里处理播放完成逻辑，如重播、显示结束界面等
    }
    
    deinit {
        removeObservers()
    }
}
```

### 多播放器切换

```swift
class MultiPlayerLayerController: UIViewController {
    
    @IBOutlet weak var videoContainer: UIView!
    
    private var playerLayer: AVPlayerLayer!
    private var players: [AVPlayer] = []
    private var currentPlayerIndex = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupPlayerLayer()
        loadMultiplePlayers()
    }
    
    private func setupPlayerLayer() {
        playerLayer = AVPlayerLayer()
        playerLayer.frame = videoContainer.bounds
        playerLayer.videoGravity = .resizeAspect
        playerLayer.backgroundColor = UIColor.black.cgColor
        videoContainer.layer.addSublayer(playerLayer)
    }
    
    private func loadMultiplePlayers() {
        let urls = [
            "https://example.com/video1.mp4",
            "https://example.com/video2.mp4",
            "https://example.com/video3.mp4"
        ].compactMap { URL(string: $0) }
        
        players = urls.map { AVPlayer(url: $0) }
        
        // 设置第一个播放器
        if !players.isEmpty {
            switchToPlayer(at: 0)
        }
    }
    
    private func switchToPlayer(at index: Int) {
        guard index < players.count else { return }
        
        // 暂停当前播放器
        playerLayer.player?.pause()
        
        // 切换到新播放器
        currentPlayerIndex = index
        let newPlayer = players[index]
        
        // 使用动画切换
        CATransaction.begin()
        CATransaction.setAnimationDuration(0.3)
        CATransaction.setCompletionBlock {
            print("切换到播放器 \(index)")
        }
        
        playerLayer.player = newPlayer
        
        CATransaction.commit()
        
        // 开始播放新视频
        newPlayer.play()
    }
    
    @IBAction func nextVideo(_ sender: UIButton) {
        let nextIndex = (currentPlayerIndex + 1) % players.count
        switchToPlayer(at: nextIndex)
    }
    
    @IBAction func previousVideo(_ sender: UIButton) {
        let prevIndex = (currentPlayerIndex - 1 + players.count) % players.count
        switchToPlayer(at: prevIndex)
    }
}
```

## 图层管理

### 图层层次结构

```swift
class LayerHierarchyManager: UIViewController {
    
    private var backgroundLayer: CALayer!
    private var playerLayer: AVPlayerLayer!
    private var overlayLayer: CALayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayerHierarchy()
    }
    
    private func setupLayerHierarchy() {
        let containerBounds = view.bounds
        
        // 1. 背景层
        backgroundLayer = CALayer()
        backgroundLayer.frame = containerBounds
        backgroundLayer.backgroundColor = UIColor.darkGray.cgColor
        view.layer.addSublayer(backgroundLayer)
        
        // 2. 视频播放层
        let player = AVPlayer(url: URL(string: "https://example.com/video.mp4")!)
        playerLayer = AVPlayerLayer(player: player)
        playerLayer.frame = containerBounds
        playerLayer.videoGravity = .resizeAspect
        backgroundLayer.addSublayer(playerLayer)
        
        // 3. 覆盖层（控制按钮、字幕等）
        overlayLayer = CALayer()
        overlayLayer.frame = containerBounds
        overlayLayer.backgroundColor = UIColor.clear.cgColor
        playerLayer.addSublayer(overlayLayer)
        
        // 添加控制按钮
        addPlayButton()
        addProgressBar()
    }
    
    private func addPlayButton() {
        let playButton = CALayer()
        playButton.frame = CGRect(x: 50, y: 50, width: 60, height: 60)
        playButton.backgroundColor = UIColor.white.withAlphaComponent(0.8).cgColor
        playButton.cornerRadius = 30
        overlayLayer.addSublayer(playButton)
        
        // 添加播放图标（简化版）
        let playIcon = CAShapeLayer()
        let trianglePath = UIBezierPath()
        trianglePath.move(to: CGPoint(x: 20, y: 15))
        trianglePath.addLine(to: CGPoint(x: 40, y: 30))
        trianglePath.addLine(to: CGPoint(x: 20, y: 45))
        trianglePath.close()
        
        playIcon.path = trianglePath.cgPath
        playIcon.fillColor = UIColor.black.cgColor
        playButton.addSublayer(playIcon)
    }
    
    private func addProgressBar() {
        let progressContainer = CALayer()
        progressContainer.frame = CGRect(x: 20, y: view.bounds.height - 60, width: view.bounds.width - 40, height: 4)
        progressContainer.backgroundColor = UIColor.white.withAlphaComponent(0.3).cgColor
        progressContainer.cornerRadius = 2
        overlayLayer.addSublayer(progressContainer)
        
        let progressBar = CALayer()
        progressBar.frame = CGRect(x: 0, y: 0, width: progressContainer.bounds.width * 0.3, height: 4)
        progressBar.backgroundColor = UIColor.white.cgColor
        progressBar.cornerRadius = 2
        progressContainer.addSublayer(progressBar)
    }
    
    // 显示/隐藏控制层
    func toggleControlsVisibility() {
        let isHidden = overlayLayer.opacity == 0
        
        CATransaction.begin()
        CATransaction.setAnimationDuration(0.3)
        overlayLayer.opacity = isHidden ? 1.0 : 0.0
        CATransaction.commit()
    }
}
```

### 图层动画

```swift
extension LayerHierarchyManager {
    
    // 播放器入场动画
    func animatePlayerEntry() {
        // 缩放动画
        let scaleAnimation = CABasicAnimation(keyPath: "transform.scale")
        scaleAnimation.fromValue = 0.1
        scaleAnimation.toValue = 1.0
        scaleAnimation.duration = 0.5
        scaleAnimation.timingFunction = CAMediaTimingFunction(name: .easeOut)
        
        // 透明度动画
        let opacityAnimation = CABasicAnimation(keyPath: "opacity")
        opacityAnimation.fromValue = 0.0
        opacityAnimation.toValue = 1.0
        opacityAnimation.duration = 0.3
        
        // 组合动画
        let groupAnimation = CAAnimationGroup()
        groupAnimation.animations = [scaleAnimation, opacityAnimation]
        groupAnimation.duration = 0.5
        
        playerLayer.add(groupAnimation, forKey: "entryAnimation")
    }
    
    // 播放器退出动画
    func animatePlayerExit(completion: @escaping () -> Void) {
        CATransaction.begin()
        CATransaction.setCompletionBlock(completion)
        
        let fadeOutAnimation = CABasicAnimation(keyPath: "opacity")
        fadeOutAnimation.fromValue = 1.0
        fadeOutAnimation.toValue = 0.0
        fadeOutAnimation.duration = 0.3
        fadeOutAnimation.fillMode = .forwards
        fadeOutAnimation.isRemovedOnCompletion = false
        
        playerLayer.add(fadeOutAnimation, forKey: "exitAnimation")
        
        CATransaction.commit()
    }
    
    // 播放状态指示动画
    func animatePlayingState(_ isPlaying: Bool) {
        let pulseAnimation = CABasicAnimation(keyPath: "opacity")
        pulseAnimation.fromValue = 1.0
        pulseAnimation.toValue = 0.5
        pulseAnimation.duration = 1.0
        pulseAnimation.autoreverses = true
        pulseAnimation.repeatCount = isPlaying ? .infinity : 0
        
        overlayLayer.add(pulseAnimation, forKey: isPlaying ? "playingPulse" : nil)
        
        if !isPlaying {
            overlayLayer.removeAnimation(forKey: "playingPulse")
        }
    }
}
```

## 实际应用场景

### 完整的视频播放器

```swift
class VideoPlayerView: UIView {
    
    // MARK: - 私有属性
    private var playerLayer: AVPlayerLayer!
    private var player: AVPlayer?
    private var timeObserver: Any?
    private var statusObserver: NSKeyValueObservation?
    
    // MARK: - 公开属性
    var isPlaying: Bool {
        return player?.rate != 0
    }
    
    var duration: CMTime {
        return player?.currentItem?.duration ?? CMTime.zero
    }
    
    var currentTime: CMTime {
        return player?.currentTime() ?? CMTime.zero
    }
    
    // MARK: - 回调
    var onTimeUpdate: ((CMTime) -> Void)?
    var onStatusChange: ((AVPlayer.Status) -> Void)?
    var onPlaybackFinished: (() -> Void)?
    
    // MARK: - 初始化
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupPlayerLayer()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupPlayerLayer()
    }
    
    private func setupPlayerLayer() {
        playerLayer = AVPlayerLayer()
        playerLayer.videoGravity = .resizeAspect
        playerLayer.backgroundColor = UIColor.black.cgColor
        layer.addSublayer(playerLayer)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        playerLayer.frame = bounds
    }
    
    // MARK: - 公开方法
    func loadVideo(from url: URL) {
        // 清理旧的播放器
        cleanup()
        
        // 创建新播放器
        player = AVPlayer(url: url)
        playerLayer.player = player
        
        // 设置观察者
        setupObservers()
    }
    
    func play() {
        player?.play()
    }
    
    func pause() {
        player?.pause()
    }
    
    func stop() {
        player?.pause()
        player?.seek(to: CMTime.zero)
    }
    
    func seek(to time: CMTime) {
        player?.seek(to: time)
    }
    
    func setVideoGravity(_ gravity: AVLayerVideoGravity) {
        playerLayer.videoGravity = gravity
    }
    
    // MARK: - 私有方法
    private func setupObservers() {
        guard let player = player else { return }
        
        // 时间观察者
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.1, preferredTimescale: 1000),
            queue: DispatchQueue.main
        ) { [weak self] time in
            self?.onTimeUpdate?(time)
        }
        
        // 状态观察者
        statusObserver = player.observe(\.status, options: [.new]) { [weak self] player, _ in
            DispatchQueue.main.async {
                self?.onStatusChange?(player.status)
            }
        }
        
        // 播放完成通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerDidFinishPlaying),
            name: .AVPlayerItemDidPlayToEndTime,
            object: player.currentItem
        )
    }
    
    private func cleanup() {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
            self.timeObserver = nil
        }
        
        statusObserver?.invalidate()
        statusObserver = nil
        
        NotificationCenter.default.removeObserver(self)
        
        player?.pause()
        playerLayer.player = nil
        player = nil
    }
    
    @objc private func playerDidFinishPlaying() {
        onPlaybackFinished?()
    }
    
    deinit {
        cleanup()
    }
}

// MARK: - 使用示例
class VideoPlayerViewController: UIViewController {
    
    private var videoPlayerView: VideoPlayerView!
    private var controlsContainer: UIView!
    private var playPauseButton: UIButton!
    private var progressSlider: UISlider!
    private var timeLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupVideoPlayer()
    }
    
    private func setupUI() {
        // 视频播放视图
        videoPlayerView = VideoPlayerView(frame: view.bounds)
        view.addSubview(videoPlayerView)
        
        // 控制面板
        setupControls()
        
        // 设置约束
        setupConstraints()
    }
    
    private func setupControls() {
        controlsContainer = UIView()
        controlsContainer.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        view.addSubview(controlsContainer)
        
        playPauseButton = UIButton()
        playPauseButton.setTitle("播放", for: .normal)
        playPauseButton.addTarget(self, action: #selector(playPauseTapped), for: .touchUpInside)
        controlsContainer.addSubview(playPauseButton)
        
        progressSlider = UISlider()
        progressSlider.addTarget(self, action: #selector(sliderValueChanged), for: .valueChanged)
        controlsContainer.addSubview(progressSlider)
        
        timeLabel = UILabel()
        timeLabel.textColor = .white
        timeLabel.text = "00:00 / 00:00"
        controlsContainer.addSubview(timeLabel)
    }
    
    private func setupConstraints() {
        videoPlayerView.translatesAutoresizingMaskIntoConstraints = false
        controlsContainer.translatesAutoresizingMaskIntoConstraints = false
        playPauseButton.translatesAutoresizingMaskIntoConstraints = false
        progressSlider.translatesAutoresizingMaskIntoConstraints = false
        timeLabel.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            // 视频播放器
            videoPlayerView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            videoPlayerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            videoPlayerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            videoPlayerView.bottomAnchor.constraint(equalTo: controlsContainer.topAnchor),
            
            // 控制面板
            controlsContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            controlsContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            controlsContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            controlsContainer.heightAnchor.constraint(equalToConstant: 100),
            
            // 播放按钮
            playPauseButton.leadingAnchor.constraint(equalTo: controlsContainer.leadingAnchor, constant: 20),
            playPauseButton.centerYAnchor.constraint(equalTo: controlsContainer.centerYAnchor),
            playPauseButton.widthAnchor.constraint(equalToConstant: 80),
            
            // 进度条
            progressSlider.leadingAnchor.constraint(equalTo: playPauseButton.trailingAnchor, constant: 20),
            progressSlider.trailingAnchor.constraint(equalTo: timeLabel.leadingAnchor, constant: -20),
            progressSlider.centerYAnchor.constraint(equalTo: controlsContainer.centerYAnchor),
            
            // 时间标签
            timeLabel.trailingAnchor.constraint(equalTo: controlsContainer.trailingAnchor, constant: -20),
            timeLabel.centerYAnchor.constraint(equalTo: controlsContainer.centerYAnchor),
            timeLabel.widthAnchor.constraint(equalToConstant: 100)
        ])
    }
    
    private func setupVideoPlayer() {
        // 设置回调
        videoPlayerView.onTimeUpdate = { [weak self] time in
            self?.updateProgress(time)
        }
        
        videoPlayerView.onStatusChange = { [weak self] status in
            self?.handleStatusChange(status)
        }
        
        videoPlayerView.onPlaybackFinished = { [weak self] in
            self?.handlePlaybackFinished()
        }
        
        // 加载视频
        if let url = URL(string: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4") {
            videoPlayerView.loadVideo(from: url)
        }
    }
    
    private func updateProgress(_ time: CMTime) {
        let currentSeconds = CMTimeGetSeconds(time)
        let totalSeconds = CMTimeGetSeconds(videoPlayerView.duration)
        
        if !totalSeconds.isNaN && totalSeconds > 0 {
            progressSlider.value = Float(currentSeconds / totalSeconds)
            
            let currentTimeString = formatTime(currentSeconds)
            let totalTimeString = formatTime(totalSeconds)
            timeLabel.text = "\(currentTimeString) / \(totalTimeString)"
        }
    }
    
    private func handleStatusChange(_ status: AVPlayer.Status) {
        switch status {
        case .readyToPlay:
            print("视频准备就绪")
        case .failed:
            print("视频加载失败")
        case .unknown:
            print("视频状态未知")
        @unknown default:
            break
        }
    }
    
    private func handlePlaybackFinished() {
        playPauseButton.setTitle("播放", for: .normal)
        progressSlider.value = 0
    }
    
    private func formatTime(_ seconds: Double) -> String {
        let minutes = Int(seconds) / 60
        let remainingSeconds = Int(seconds) % 60
        return String(format: "%02d:%02d", minutes, remainingSeconds)
    }
    
    @objc private func playPauseTapped() {
        if videoPlayerView.isPlaying {
            videoPlayerView.pause()
            playPauseButton.setTitle("播放", for: .normal)
        } else {
            videoPlayerView.play()
            playPauseButton.setTitle("暂停", for: .normal)
        }
    }
    
    @objc private func sliderValueChanged() {
        let totalSeconds = CMTimeGetSeconds(videoPlayerView.duration)
        let targetSeconds = Double(progressSlider.value) * totalSeconds
        let targetTime = CMTime(seconds: targetSeconds, preferredTimescale: 1000)
        videoPlayerView.seek(to: targetTime)
    }
}
```

### 画中画 (Picture in Picture) 支持

```swift
import AVKit

class PictureInPictureController: NSObject {
    
    private var playerLayer: AVPlayerLayer
    private var pictureInPictureController: AVPictureInPictureController?
    
    init(playerLayer: AVPlayerLayer) {
        self.playerLayer = playerLayer
        super.init()
        setupPictureInPicture()
    }
    
    private func setupPictureInPicture() {
        // 检查设备是否支持画中画
        guard AVPictureInPictureController.isPictureInPictureSupported() else {
            print("设备不支持画中画功能")
            return
        }
        
        // 创建画中画控制器
        pictureInPictureController = AVPictureInPictureController(playerLayer: playerLayer)
        pictureInPictureController?.delegate = self
        
        // 配置画中画
        if #available(iOS 14.2, *) {
            pictureInPictureController?.canStartPictureInPictureAutomaticallyFromInline = true
        }
    }
    
    func startPictureInPicture() {
        guard let pipController = pictureInPictureController,
              pipController.isPictureInPicturePossible else {
            print("当前无法启动画中画")
            return
        }
        
        pipController.startPictureInPicture()
    }
    
    func stopPictureInPicture() {
        pictureInPictureController?.stopPictureInPicture()
    }
    
    var isPictureInPictureActive: Bool {
        return pictureInPictureController?.isPictureInPictureActive ?? false
    }
    
    var isPictureInPicturePossible: Bool {
        return pictureInPictureController?.isPictureInPicturePossible ?? false
    }
}

// MARK: - AVPictureInPictureControllerDelegate
extension PictureInPictureController: AVPictureInPictureControllerDelegate {
    
    func pictureInPictureControllerWillStartPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
        print("画中画即将开始")
    }
    
    func pictureInPictureControllerDidStartPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
        print("画中画已开始")
    }
    
    func pictureInPictureController(_ pictureInPictureController: AVPictureInPictureController, failedToStartPictureInPictureWithError error: Error) {
        print("画中画启动失败: \(error.localizedDescription)")
    }
    
    func pictureInPictureControllerWillStopPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
        print("画中画即将停止")
    }
    
    func pictureInPictureControllerDidStopPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
        print("画中画已停止")
    }
    
    func pictureInPictureController(_ pictureInPictureController: AVPictureInPictureController, restoreUserInterfaceForPictureInPictureStopWithCompletionHandler completionHandler: @escaping (Bool) -> Void) {
        // 恢复用户界面
        print("恢复用户界面")
        completionHandler(true)
    }
}
```

## 性能优化

### 内存和资源管理

```swift
class OptimizedPlayerLayer: NSObject {
    
    private var playerLayer: AVPlayerLayer
    private var player: AVPlayer?
    private var playerItem: AVPlayerItem?
    private var observers: [NSKeyValueObservation] = []
    
    // 缓存管理
    private static var sharedPlayerCache: [String: AVPlayer] = [:]
    private static let cacheQueue = DispatchQueue(label: "playerCache", qos: .utility)
    
    init(frame: CGRect) {
        playerLayer = AVPlayerLayer()
        playerLayer.frame = frame
        super.init()
    }
    
    // 使用缓存的播放器
    func loadVideo(from url: URL, useCache: Bool = true) {
        let urlString = url.absoluteString
        
        if useCache {
            Self.cacheQueue.async { [weak self] in
                let cachedPlayer = Self.sharedPlayerCache[urlString] ?? AVPlayer(url: url)
                Self.sharedPlayerCache[urlString] = cachedPlayer
                
                DispatchQueue.main.async {
                    self?.setPlayer(cachedPlayer)
                }
            }
        } else {
            let newPlayer = AVPlayer(url: url)
            setPlayer(newPlayer)
        }
    }
    
    private func setPlayer(_ player: AVPlayer) {
        // 清理旧的观察者
        clearObservers()
        
        // 设置新播放器
        self.player = player
        self.playerItem = player.currentItem
        playerLayer.player = player
        
        // 添加观察者
        addObservers()
        
        // 预加载
        preloadPlayerItem()
    }
    
    private func preloadPlayerItem() {
        guard let playerItem = playerItem else { return }
        
        // 预加载视频数据
        playerItem.preferredForwardBufferDuration = 10.0
        
        // 设置视频质量
        if let asset = playerItem.asset as? AVURLAsset {
            asset.resourceLoader.preloadsEligibleContentKeys = true
        }
    }
    
    private func addObservers() {
        guard let playerItem = playerItem else { return }
        
        // 缓冲状态观察
        let bufferObserver = playerItem.observe(\.loadedTimeRanges, options: [.new]) { [weak self] item, _ in
            self?.handleBufferUpdate(item)
        }
        observers.append(bufferObserver)
        
        // 播放状态观察
        let statusObserver = playerItem.observe(\.status, options: [.new]) { [weak self] item, _ in
            self?.handleStatusUpdate(item)
        }
        observers.append(statusObserver)
        
        // 缓冲空了观察
        let bufferEmptyObserver = playerItem.observe(\.isPlaybackBufferEmpty, options: [.new]) { [weak self] item, _ in
            if item.isPlaybackBufferEmpty {
                self?.handleBufferEmpty()
            }
        }
        observers.append(bufferEmptyObserver)
        
        // 缓冲满了观察
        let bufferFullObserver = playerItem.observe(\.isPlaybackLikelyToKeepUp, options: [.new]) { [weak self] item, _ in
            if item.isPlaybackLikelyToKeepUp {
                self?.handleBufferFull()
            }
        }
        observers.append(bufferFullObserver)
    }
    
    private func clearObservers() {
        observers.forEach { $0.invalidate() }
        observers.removeAll()
    }
    
    private func handleBufferUpdate(_ playerItem: AVPlayerItem) {
        let bufferedTime = playerItem.loadedTimeRanges
            .map { $0.timeRangeValue }
            .map { CMTimeGetSeconds($0.start) + CMTimeGetSeconds($0.duration) }
            .max() ?? 0
        
        print("已缓冲时间: \(bufferedTime)秒")
    }
    
    private func handleStatusUpdate(_ playerItem: AVPlayerItem) {
        switch playerItem.status {
        case .readyToPlay:
            print("播放项准备就绪")
        case .failed:
            print("播放项失败: \(playerItem.error?.localizedDescription ?? "未知错误")")
        case .unknown:
            print("播放项状态未知")
        @unknown default:
            break
        }
    }
    
    private func handleBufferEmpty() {
        print("缓冲区空了，显示加载指示器")
        // 显示加载指示器
    }
    
    private func handleBufferFull() {
        print("缓冲区充足，隐藏加载指示器")
        // 隐藏加载指示器
    }
    
    // 释放资源
    func releaseResources() {
        clearObservers()
        player?.pause()
        playerLayer.player = nil
        player = nil
        playerItem = nil
    }
    
    // 清理缓存
    static func clearPlayerCache() {
        cacheQueue.async {
            sharedPlayerCache.values.forEach { $0.pause() }
            sharedPlayerCache.removeAll()
        }
    }
    
    deinit {
        releaseResources()
    }
}
```

### 低功耗播放优化

```swift
class PowerEfficientPlayerLayer {
    
    private var playerLayer: AVPlayerLayer
    private var player: AVPlayer?
    private var displayLink: CADisplayLink?
    
    init(frame: CGRect) {
        playerLayer = AVPlayerLayer()
        playerLayer.frame = frame
        setupPowerOptimizations()
    }
    
    private func setupPowerOptimizations() {
        // 设置视频解码优化
        playerLayer.videoGravity = .resizeAspect // 避免不必要的缩放
        
        // 禁用不必要的视觉效果
        playerLayer.cornerRadius = 0
        playerLayer.masksToBounds = false
        
        // 使用硬件解码
        if #available(iOS 11.0, *) {
            // 设置播放器首选项
        }
    }
    
    func setPlayer(_ player: AVPlayer) {
        self.player = player
        playerLayer.player = player
        
        // 配置播放器设置以节省电量
        configurePlayerForPowerEfficiency(player)
    }
    
    private func configurePlayerForPowerEfficiency(_ player: AVPlayer) {
        // 设置合理的缓冲策略
        player.automaticallyWaitsToMinimizeStalling = true
        
        // 监听播放状态以控制屏幕刷新
        setupDisplayLinkOptimization()
        
        // 配置音频会话
        configureAudioSession()
    }
    
    private func setupDisplayLinkOptimization() {
        // 只在播放时启用高频刷新
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("AVPlayerRateDidChange"),
            object: player,
            queue: .main
        ) { [weak self] _ in
            self?.updateDisplayLinkState()
        }
    }
    
    private func updateDisplayLinkState() {
        guard let player = player else { return }
        
        if player.rate > 0 {
            // 播放中，启用显示链接
            startDisplayLink()
        } else {
            // 暂停中，停止显示链接
            stopDisplayLink()
        }
    }
    
    private func startDisplayLink() {
        guard displayLink == nil else { return }
        
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkUpdate))
        displayLink?.preferredFramesPerSecond = 30 // 限制刷新率
        displayLink?.add(to: .main, forMode: .common)
    }
    
    private func stopDisplayLink() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    @objc private func displayLinkUpdate() {
        // 在这里执行与播放同步的UI更新
        // 例如：进度条更新、时间显示等
    }
    
    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .moviePlayback, options: [.allowBluetooth])
            try audioSession.setActive(true)
        } catch {
            print("音频会话配置失败: \(error)")
        }
    }
    
    // 进入后台时的优化
    func applicationDidEnterBackground() {
        // 暂停播放以节省电量
        player?.pause()
        stopDisplayLink()
        
        // 清理GPU资源
        playerLayer.contents = nil
    }
    
    // 进入前台时恢复
    func applicationWillEnterForeground() {
        // 恢复播放器层内容
        playerLayer.player = player
        updateDisplayLinkState()
    }
    
    deinit {
        stopDisplayLink()
        NotificationCenter.default.removeObserver(self)
    }
}
```

## 常见问题解决

### 问题1：黑屏或视频不显示

```swift
class VideoDisplayTroubleshooter {
    
    static func diagnoseDisplayIssues(_ playerLayer: AVPlayerLayer) {
        print("=== 视频显示诊断开始 ===")
        
        // 1. 检查播放器
        guard let player = playerLayer.player else {
            print("❌ 播放器未设置")
            return
        }
        print("✅ 播放器已设置")
        
        // 2. 检查播放项
        guard let playerItem = player.currentItem else {
            print("❌ 播放项未设置")
            return
        }
        print("✅ 播放项已设置")
        
        // 3. 检查播放项状态
        switch playerItem.status {
        case .unknown:
            print("⚠️ 播放项状态未知")
        case .readyToPlay:
            print("✅ 播放项准备就绪")
        case .failed:
            print("❌ 播放项失败: \(playerItem.error?.localizedDescription ?? "未知错误")")
        @unknown default:
            print("⚠️ 未知播放项状态")
        }
        
        // 4. 检查图层设置
        print("图层frame: \(playerLayer.frame)")
        print("图层bounds: \(playerLayer.bounds)")
        print("图层hidden: \(playerLayer.isHidden)")
        print("图层opacity: \(playerLayer.opacity)")
        print("视频重力: \(playerLayer.videoGravity.rawValue)")
        
        // 5. 检查视频尺寸
        let videoSize = playerItem.presentationSize
        print("视频尺寸: \(videoSize)")
        
        if videoSize.width == 0 || videoSize.height == 0 {
            print("❌ 视频尺寸无效")
        } else {
            print("✅ 视频尺寸有效")
        }
        
        // 6. 检查视频轨道
        let videoTracks = playerItem.asset.tracks(withMediaType: .video)
        if videoTracks.isEmpty {
            print("❌ 没有视频轨道")
        } else {
            print("✅ 找到 \(videoTracks.count) 个视频轨道")
        }
        
        print("=== 视频显示诊断结束 ===")
    }
    
    static func fixCommonDisplayIssues(_ playerLayer: AVPlayerLayer) {
        // 修复1：确保图层可见
        playerLayer.isHidden = false
        playerLayer.opacity = 1.0
        
        // 修复2：设置合理的背景色
        playerLayer.backgroundColor = UIColor.black.cgColor
        
        // 修复3：设置合理的视频重力
        if playerLayer.videoGravity == .resize {
            playerLayer.videoGravity = .resizeAspect
        }
        
        // 修复4：确保在主线程更新
        DispatchQueue.main.async {
            playerLayer.setNeedsDisplay()
        }
    }
}
```

### 问题2：内存泄露

```swift
class MemoryLeakPrevention {
    
    // 正确的播放器管理器
    class SafePlayerManager {
        private weak var parentViewController: UIViewController?
        private var playerLayer: AVPlayerLayer
        private var player: AVPlayer?
        private var observations: [NSKeyValueObservation] = []
        
        init(parentViewController: UIViewController, frame: CGRect) {
            self.parentViewController = parentViewController
            self.playerLayer = AVPlayerLayer()
            self.playerLayer.frame = frame
        }
        
        func setupPlayer(with url: URL) {
            // 清理旧的资源
            cleanup()
            
            // 创建新播放器
            player = AVPlayer(url: url)
            playerLayer.player = player
            
            // 使用弱引用添加观察者
            setupObserversWithWeakReferences()
        }
        
        private func setupObserversWithWeakReferences() {
            guard let player = player else { return }
            
            // ❌ 错误方式 - 会导致循环引用
            // let observer = player.observe(\.status) { player, change in
            //     self.handleStatusChange(player.status)
            // }
            
            // ✅ 正确方式 - 使用弱引用
            let observer = player.observe(\.status) { [weak self] player, change in
                self?.handleStatusChange(player.status)
            }
            observations.append(observer)
            
            // 通知中心观察者也要小心
            NotificationCenter.default.addObserver(
                forName: .AVPlayerItemDidPlayToEndTime,
                object: player.currentItem,
                queue: .main
            ) { [weak self] _ in
                self?.handlePlaybackFinished()
            }
        }
        
        private func handleStatusChange(_ status: AVPlayer.Status) {
            // 处理状态变化
        }
        
        private func handlePlaybackFinished() {
            // 处理播放完成
        }
        
        func cleanup() {
            // 移除所有观察者
            observations.forEach { $0.invalidate() }
            observations.removeAll()
            
            NotificationCenter.default.removeObserver(self)
            
            // 停止播放并清理播放器
            player?.pause()
            playerLayer.player = nil
            player = nil
        }
        
        deinit {
            cleanup()
            print("SafePlayerManager 被正确释放")
        }
    }
    
    // 检测内存泄露的工具
    class MemoryLeakDetector {
        private static var activePlayers: Set<ObjectIdentifier> = []
        private static let queue = DispatchQueue(label: "memoryLeak", qos: .utility)
        
        static func registerPlayer(_ player: AVPlayer) {
            queue.async {
                activePlayers.insert(ObjectIdentifier(player))
                print("活跃播放器数量: \(activePlayers.count)")
            }
        }
        
        static func unregisterPlayer(_ player: AVPlayer) {
            queue.async {
                activePlayers.remove(ObjectIdentifier(player))
                print("活跃播放器数量: \(activePlayers.count)")
            }
        }
        
        static func checkForLeaks() {
            queue.async {
                if activePlayers.count > 5 {
                    print("⚠️ 警告：可能存在播放器内存泄露，活跃播放器数量: \(activePlayers.count)")
                }
            }
        }
    }
}
```

## 最佳实践

### 1. 生命周期管理

```swift
class BestPracticePlayerLayer {
    
    private var playerLayer: AVPlayerLayer
    private var player: AVPlayer?
    private var isPlayerSetup = false
    
    init(frame: CGRect) {
        playerLayer = AVPlayerLayer()
        playerLayer.frame = frame
        playerLayer.backgroundColor = UIColor.black.cgColor
    }
    
    // ✅ 在适当的时机创建播放器
    func setupPlayer(url: URL) {
        guard !isPlayerSetup else { return }
        
        player = AVPlayer(url: url)
        playerLayer.player = player
        isPlayerSetup = true
        
        // 配置播放器
        configurePlayer()
    }
    
    private func configurePlayer() {
        // 设置合理的默认值
        playerLayer.videoGravity = .resizeAspect
        player?.automaticallyWaitsToMinimizeStalling = true
        
        // 预加载
        player?.currentItem?.preferredForwardBufferDuration = 5.0
    }
    
    // ✅ 在视图出现时激活
    func viewWillAppear() {
        // 激活音频会话
        try? AVAudioSession.sharedInstance().setActive(true)
        
        // 如果之前暂停了，可以考虑恢复播放
        if let player = player, player.rate == 0 {
            // 根据业务逻辑决定是否自动播放
        }
    }
    
    // ✅ 在视图消失时暂停
    func viewWillDisappear() {
        player?.pause()
    }
    
    // ✅ 进入后台时暂停
    func applicationDidEnterBackground() {
        player?.pause()
    }
    
    // ✅ 正确清理资源
    func cleanup() {
        player?.pause()
        playerLayer.player = nil
        player = nil
        isPlayerSetup = false
        
        // 取消激活音频会话
        try? AVAudioSession.sharedInstance().setActive(false)
    }
}
```

### 2. 错误处理

```swift
extension BestPracticePlayerLayer {
    
    enum PlayerError: LocalizedError {
        case invalidURL
        case playerCreationFailed
        case loadingFailed(Error)
        case playbackFailed(Error)
        
        var errorDescription: String? {
            switch self {
            case .invalidURL:
                return "无效的视频URL"
            case .playerCreationFailed:
                return "播放器创建失败"
            case .loadingFailed(let error):
                return "视频加载失败: \(error.localizedDescription)"
            case .playbackFailed(let error):
                return "视频播放失败: \(error.localizedDescription)"
            }
        }
    }
    
    func loadVideo(from url: URL, completion: @escaping (Result<Void, PlayerError>) -> Void) {
        // 验证URL
        guard url.scheme == "http" || url.scheme == "https" || url.scheme == "file" else {
            completion(.failure(.invalidURL))
            return
        }
        
        // 创建播放器
        guard let player = AVPlayer(url: url) as AVPlayer? else {
            completion(.failure(.playerCreationFailed))
            return
        }
        
        self.player = player
        playerLayer.player = player
        
        // 观察加载状态
        let statusObserver = player.observe(\.currentItem?.status, options: [.new]) { [weak self] player, _ in
            guard let item = player.currentItem else { return }
            
            switch item.status {
            case .readyToPlay:
                completion(.success(()))
            case .failed:
                if let error = item.error {
                    completion(.failure(.loadingFailed(error)))
                } else {
                    completion(.failure(.loadingFailed(NSError(domain: "Unknown", code: -1, userInfo: nil))))
                }
            case .unknown:
                // 继续等待
                break
            @unknown default:
                break
            }
        }
        
        // 记住要清理观察者
        // 这里简化了，实际使用中需要proper cleanup
    }
}
```

### 3. 性能监控

```swift
class PlayerPerformanceMonitor {
    
    private var playerLayer: AVPlayerLayer
    private var player: AVPlayer
    private var performanceMetrics: PerformanceMetrics
    
    struct PerformanceMetrics {
        var frameDrops: Int = 0
        var bufferEvents: Int = 0
        var seekCount: Int = 0
        var averageBitrate: Double = 0
        var startTime: Date = Date()
    }
    
    init(playerLayer: AVPlayerLayer, player: AVPlayer) {
        self.playerLayer = playerLayer
        self.player = player
        self.performanceMetrics = PerformanceMetrics()
        
        setupMonitoring()
    }
    
    private func setupMonitoring() {
        // 监控缓冲事件
        NotificationCenter.default.addObserver(
            forName: .AVPlayerItemPlaybackStalled,
            object: player.currentItem,
            queue: .main
        ) { [weak self] _ in
            self?.performanceMetrics.bufferEvents += 1
            self?.logBufferEvent()
        }
        
        // 监控帧率
        if #available(iOS 10.0, *) {
            let displayLink = CADisplayLink(target: self, selector: #selector(monitorFrameRate))
            displayLink.add(to: .main, forMode: .common)
        }
    }
    
    @objc private func monitorFrameRate() {
        // 监控帧率和丢帧情况
        // 这里可以添加具体的监控逻辑
    }
    
    private func logBufferEvent() {
        print("缓冲事件 #\(performanceMetrics.bufferEvents)")
        
        // 如果缓冲事件过多，可能需要降低视频质量
        if performanceMetrics.bufferEvents > 5 {
            suggestQualityReduction()
        }
    }
    
    private func suggestQualityReduction() {
        print("建议降低视频质量以改善播放体验")
        // 实现质量自适应逻辑
    }
    
    func getPerformanceReport() -> String {
        let uptime = Date().timeIntervalSince(performanceMetrics.startTime)
        return """
        性能报告:
        - 运行时间: \(Int(uptime))秒
        - 缓冲事件: \(performanceMetrics.bufferEvents)次
        - 寻址次数: \(performanceMetrics.seekCount)次
        - 平均码率: \(performanceMetrics.averageBitrate)kbps
        """
    }
}
```

## 总结

AVPlayerLayer 是 iOS 视频播放的核心组件，正确使用它需要注意以下关键点：

### 🔑 核心要点
1. **正确的初始化和配置**：合理设置 videoGravity、frame 等属性
2. **生命周期管理**：在适当的时机创建、暂停和销毁播放器
3. **内存管理**：避免循环引用，及时清理观察者和资源
4. **性能优化**：使用硬件解码、合理的缓冲策略、电量优化
5. **错误处理**：完善的错误处理和状态监控机制

### 📱 实用场景
- **视频播放应用**：完整的播放器界面和控制功能
- **短视频应用**：列表中的视频播放和画中画
- **教育应用**：课程视频播放和进度跟踪
- **社交应用**：动态视频播放和分享功能

### ⚡ 性能建议
- 使用对象池复用播放器实例
- 合理设置缓冲时间和质量
- 在后台时暂停播放节省电量
- 监控内存使用避免泄露

### 🐛 常见陷阱
- 忘记设置 player 属性导致黑屏
- 循环引用导致内存泄露  
- 不合理的 videoGravity 设置
- 缺少错误处理和状态监控
- 在非主线程更新UI

### 📚 相关API
- **AVPlayer**：播放器核心类
- **AVPlayerItem**：播放项管理
- **AVAsset**：媒体资源抽象
- **AVPlayerViewController**：系统播放器控制器
- **AVPictureInPictureController**：画中画控制

### 🛠 开发工具
- **Instruments**：性能分析和内存泄露检测
- **Console**：日志查看和调试
- **Simulator**：不同设备尺寸测试
- **Device**：真机性能测试

通过掌握 AVPlayerLayer 的完整用法，你可以构建出功能强大、性能优秀的视频播放功能。记住始终关注用户体验、性能优化和资源管理，这样才能开发出高质量的视频应用。

---

*本指南涵盖了 AVPlayerLayer 的核心概念、常用API、实际应用和最佳实践。建议在实际开发中根据具体需求选择合适的实现方式，并持续关注性能和用户体验。*