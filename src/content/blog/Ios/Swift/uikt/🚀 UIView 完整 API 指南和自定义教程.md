---
title: "UIView 完整 API 指南和自定义教程"
description: "1. [UIView 基础属性](1uiview基础属性) 2. [几何和布局相关](2几何和布局相关) 3. [视觉外观相关](3视觉外观相关) 4. [交互和事件处理](4交互和事件处理) 5. [动画相关](5动画相关) 6. ..."
pubDate: 2026-05-29
category: "uikt"
tags: [iOS, Swift, API]
draft: false
---
# 🚀 UIView 完整 API 指南和自定义教程

## 目录

1.  [UIView 基础属性](#1-uiview-基础属性)
2.  [几何和布局相关](#2-几何和布局相关)
3.  [视觉外观相关](#3-视觉外观相关)
4.  [交互和事件处理](#4-交互和事件处理)
5.  [动画相关](#5-动画相关)
6.  [视图层次结构](#6-视图层次结构)
7.  [绘制和渲染](#7-绘制和渲染)
8.  [自定义 UIView](#8-自定义-uiview)
9.  [常用模式和最佳实践](#9-常用模式和最佳实践)

***

## 1. UIView 基础属性

### 1.1 标识和基本信息

```swift
var tag: Int                    // 视图标签，用于标识视图
var isHidden: Bool              // 是否隐藏
var alpha: CGFloat              // 透明度 (0.0-1.0)
var isOpaque: Bool              // 是否不透明（影响渲染优化）
var clipsToBounds: Bool         // 是否裁剪子视图超出边界的部分
var clearsContextBeforeDrawing: Bool  // 绘制前是否清除上下文
```

**使用示例：**

```swift
// 基本标识和显示控制
view.tag = 100
view.isHidden = false
view.alpha = 0.8
view.isOpaque = true
view.clipsToBounds = true

// 通过 tag 查找视图
if let targetView = parentView.viewWithTag(100) {
    // 找到了对应的视图
}
```

### 1.2 内容模式

```swift
var contentMode: UIView.ContentMode
```

**ContentMode 枚举值：**

```swift
// 缩放模式
.scaleToFill        // 拉伸填充（默认）
.scaleAspectFit     // 等比例缩放适应
.scaleAspectFill    // 等比例缩放填充

// 位置模式
.center             // 居中
.top, .bottom       // 顶部/底部
.left, .right       // 左侧/右侧
.topLeft, .topRight // 四个角落
.bottomLeft, .bottomRight

// 重绘模式
.redraw             // 大小改变时重绘
```

***

## 2. 几何和布局相关

### 2.1 Frame 和 Bounds

```swift
var frame: CGRect          // 在父视图中的位置和大小
var bounds: CGRect         // 自身的坐标系统
var center: CGPoint        // 中心点坐标
var transform: CGAffineTransform  // 2D变换矩阵
```

**使用示例：**

```swift
// 设置位置和大小
view.frame = CGRect(x: 50, y: 100, width: 200, height: 150)
view.bounds = CGRect(x: 0, y: 0, width: 200, height: 150)
view.center = CGPoint(x: 150, y: 175)

// 应用变换
view.transform = CGAffineTransform(rotationAngle: .pi/4)  // 旋转45度
view.transform = CGAffineTransform(scaleX: 1.5, y: 1.5)  // 放大1.5倍
view.transform = CGAffineTransform(translationX: 50, y: 30)  // 平移

// 组合变换
view.transform = CGAffineTransform.identity
    .rotated(by: .pi/4)
    .scaledBy(x: 1.2, y: 1.2)
    .translatedBy(x: 20, y: 30)
```

### 2.2 Auto Layout 相关

```swift
var translatesAutoresizingMaskIntoConstraints: Bool
var constraints: [NSLayoutConstraint] { get }

// 内容优先级
var contentHuggingPriority(for axis: NSLayoutConstraint.Axis): UILayoutPriority
var contentCompressionResistancePriority(for axis: NSLayoutConstraint.Axis): UILayoutPriority

// 内在内容大小
var intrinsicContentSize: CGSize { get }
func invalidateIntrinsicContentSize()
```

**使用示例：**

```swift
// 启用 Auto Layout
view.translatesAutoresizingMaskIntoConstraints = false

// 添加约束
NSLayoutConstraint.activate([
    view.topAnchor.constraint(equalTo: superview.topAnchor, constant: 20),
    view.leadingAnchor.constraint(equalTo: superview.leadingAnchor, constant: 16),
    view.trailingAnchor.constraint(equalTo: superview.trailingAnchor, constant: -16),
    view.heightAnchor.constraint(equalToConstant: 100)
])

// 设置内容优先级
view.setContentHuggingPriority(.required, for: .horizontal)
view.setContentCompressionResistancePriority(.defaultHigh, for: .vertical)
```

### 2.3 安全区域和布局指南

```swift
var safeAreaLayoutGuide: UILayoutGuide { get }
var layoutMarginsGuide: UILayoutGuide { get }
var readableContentGuide: UILayoutGuide { get }
var layoutMargins: UIEdgeInsets
var directionalLayoutMargins: NSDirectionalEdgeInsets
```

***

## 3. 视觉外观相关

### 3.1 背景和边框

```swift
var backgroundColor: UIColor?
var layer: CALayer { get }      // 底层的 Core Animation 图层
```

**通过 layer 设置外观：**

```swift
// 边框
view.layer.borderWidth = 2.0
view.layer.borderColor = UIColor.blue.cgColor

// 圆角
view.layer.cornerRadius = 10.0
view.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]  // 只设置上方圆角

// 阴影
view.layer.shadowColor = UIColor.black.cgColor
view.layer.shadowOffset = CGSize(width: 2, height: 2)
view.layer.shadowOpacity = 0.5
view.layer.shadowRadius = 4.0

// 渐变背景
let gradientLayer = CAGradientLayer()
gradientLayer.frame = view.bounds
gradientLayer.colors = [UIColor.red.cgColor, UIColor.blue.cgColor]
gradientLayer.locations = [0.0, 1.0]
view.layer.addSublayer(gradientLayer)
```

### 3.2 遮罩和裁剪

```swift
var mask: UIView?               // 遮罩视图
var clipsToBounds: Bool         // 是否裁剪子视图
```

***

## 4. 交互和事件处理

### 4.1 用户交互

```swift
var isUserInteractionEnabled: Bool  // 是否响应用户交互
var isMultipleTouchEnabled: Bool    // 是否支持多点触控
var isExclusiveTouch: Bool          // 是否独占触摸
```

### 4.2 手势识别

```swift
var gestureRecognizers: [UIGestureRecognizer]?

func addGestureRecognizer(_ gestureRecognizer: UIGestureRecognizer)
func removeGestureRecognizer(_ gestureRecognizer: UIGestureRecognizer)
```

**使用示例：**

```swift
// 添加点击手势
let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
view.addGestureRecognizer(tapGesture)

// 添加拖拽手势
let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan))
view.addGestureRecognizer(panGesture)

// 添加缩放手势
let pinchGesture = UIPinchGestureRecognizer(target: self, action: #selector(handlePinch))
view.addGestureRecognizer(pinchGesture)

@objc func handleTap(_ gesture: UITapGestureRecognizer) {
    print("View tapped")
}

@objc func handlePan(_ gesture: UIPanGestureRecognizer) {
    let translation = gesture.translation(in: view.superview)
    view.center = CGPoint(x: view.center.x + translation.x, 
                         y: view.center.y + translation.y)
    gesture.setTranslation(.zero, in: view.superview)
}
```

### 4.3 触摸事件处理

```swift
// 重写这些方法来处理触摸事件
override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?)
override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?)
override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?)
override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?)

// 事件传递
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView?
override func point(inside point: CGPoint, with event: UIEvent?) -> Bool
```

***

## 5. 动画相关

### 5.1 UIView 动画

```swift
// 基础动画
UIView.animate(withDuration: 0.3) {
    view.alpha = 0.5
    view.transform = CGAffineTransform(scaleX: 1.2, y: 1.2)
}

// 带完成回调的动画
UIView.animate(withDuration: 0.3, animations: {
    view.backgroundColor = .red
}) { completed in
    print("Animation completed: \(completed)")
}

// 弹簧动画
UIView.animate(withDuration: 0.6, 
               delay: 0.0, 
               usingSpringWithDamping: 0.7, 
               initialSpringVelocity: 0.0, 
               options: .curveEaseInOut, 
               animations: {
    view.center.y += 100
}, completion: nil)

// 关键帧动画
UIView.animateKeyframes(withDuration: 2.0, delay: 0.0, animations: {
    UIView.addKeyframe(withRelativeStartTime: 0.0, relativeDuration: 0.25) {
        view.center.x += 100
    }
    UIView.addKeyframe(withRelativeStartTime: 0.25, relativeDuration: 0.25) {
        view.center.y += 100
    }
    UIView.addKeyframe(withRelativeStartTime: 0.5, relativeDuration: 0.25) {
        view.center.x -= 100
    }
    UIView.addKeyframe(withRelativeStartTime: 0.75, relativeDuration: 0.25) {
        view.center.y -= 100
    }
})
```

### 5.2 转场动画

```swift
UIView.transition(with: view, 
                  duration: 0.5, 
                  options: .transitionFlipFromLeft, 
                  animations: {
    view.backgroundColor = .blue
}, completion: nil)
```

***

## 6. 视图层次结构

### 6.1 父子视图关系

```swift
var superview: UIView? { get }          // 父视图
var subviews: [UIView] { get }          // 子视图数组
var window: UIWindow? { get }           // 所在窗口

// 添加和移除子视图
func addSubview(_ view: UIView)
func insertSubview(_ view: UIView, at index: Int)
func insertSubview(_ view: UIView, belowSubview siblingSubview: UIView)
func insertSubview(_ view: UIView, aboveSubview siblingSubview: UIView)
func removeFromSuperview()

// 视图层级操作
func bringSubviewToFront(_ view: UIView)
func sendSubviewToBack(_ view: UIView)
func exchangeSubview(at index1: Int, withSubviewAt index2: Int)
```

### 6.2 视图查找

```swift
func viewWithTag(_ tag: Int) -> UIView?
func isDescendant(of view: UIView) -> Bool
```

**使用示例：**

```swift
// 创建视图层次
let containerView = UIView()
let childView1 = UIView()
let childView2 = UIView()

containerView.addSubview(childView1)
containerView.addSubview(childView2)

// 调整层级
containerView.bringSubviewToFront(childView1)
containerView.sendSubviewToBack(childView2)

// 插入视图
let newView = UIView()
containerView.insertSubview(newView, belowSubview: childView1)

// 查找视图
childView1.tag = 100
if let foundView = containerView.viewWithTag(100) {
    print("找到了标签为100的视图")
}
```

***

## 7. 绘制和渲染

### 7.1 绘制相关

```swift
func setNeedsDisplay()                  // 标记需要重绘
func setNeedsDisplay(_ rect: CGRect)    // 标记指定区域需要重绘
func draw(_ rect: CGRect)               // 重写此方法进行自定义绘制

var contentScaleFactor: CGFloat         // 内容缩放因子
```

### 7.2 布局相关

```swift
func setNeedsLayout()                   // 标记需要重新布局
func layoutIfNeeded()                   // 立即布局如果需要
func layoutSubviews()                   // 重写此方法进行自定义布局

func sizeThatFits(_ size: CGSize) -> CGSize     // 计算合适的大小
func sizeToFit()                               // 调整为合适的大小
```

***

## 8. 自定义 UIView

### 8.1 基本自定义视图结构

```swift
class CustomView: UIView {
    
    // MARK: - Properties
    private var customProperty: String = "Default"
    
    // MARK: - Initializers
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }
    
    convenience init(customProperty: String) {
        self.init(frame: .zero)
        self.customProperty = customProperty
    }
    
    // MARK: - Setup
    private func setupView() {
        backgroundColor = .lightGray
        setupSubviews()
        setupConstraints()
        setupGestures()
    }
    
    private func setupSubviews() {
        // 添加子视图
    }
    
    private func setupConstraints() {
        // 设置约束
    }
    
    private func setupGestures() {
        // 添加手势
    }
    
    // MARK: - Layout
    override func layoutSubviews() {
        super.layoutSubviews()
        // 自定义布局逻辑
    }
    
    override var intrinsicContentSize: CGSize {
        return CGSize(width: 200, height: 100)
    }
    
    // MARK: - Drawing
    override func draw(_ rect: CGRect) {
        super.draw(rect)
        
        guard let context = UIGraphicsGetCurrentContext() else { return }
        
        // 自定义绘制代码
        context.setFillColor(UIColor.blue.cgColor)
        context.fillEllipse(in: rect.insetBy(dx: 10, dy: 10))
    }
    
    // MARK: - Touch Handling
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        // 处理触摸开始
    }
    
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        // 自定义触摸检测
        return super.hitTest(point, with: event)
    }
}
```

### 8.2 可配置的自定义视图

```swift
@IBDesignable
class GradientView: UIView {
    
    @IBInspectable var startColor: UIColor = .red {
        didSet { updateGradient() }
    }
    
    @IBInspectable var endColor: UIColor = .blue {
        didSet { updateGradient() }
    }
    
    @IBInspectable var cornerRadius: CGFloat = 0 {
        didSet {
            layer.cornerRadius = cornerRadius
            layer.masksToBounds = cornerRadius > 0
        }
    }
    
    private var gradientLayer: CAGradientLayer!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        setupGradient()
    }
    
    override func prepareForInterfaceBuilder() {
        super.prepareForInterfaceBuilder()
        setupGradient()
    }
    
    private func setupGradient() {
        gradientLayer = CAGradientLayer()
        gradientLayer.frame = bounds
        layer.insertSublayer(gradientLayer, at: 0)
        updateGradient()
    }
    
    private func updateGradient() {
        gradientLayer?.colors = [startColor.cgColor, endColor.cgColor]
        gradientLayer?.locations = [0.0, 1.0]
        gradientLayer?.startPoint = CGPoint(x: 0, y: 0)
        gradientLayer?.endPoint = CGPoint(x: 1, y: 1)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        gradientLayer?.frame = bounds
    }
}
```

### 8.3 复合自定义视图

```swift
class UserProfileView: UIView {
    
    // MARK: - UI Components
    private let avatarImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFill
        imageView.layer.cornerRadius = 40
        imageView.layer.masksToBounds = true
        imageView.translatesAutoresizingMaskIntoConstraints = false
        return imageView
    }()
    
    private let nameLabel: UILabel = {
        let label = UILabel()
        label.font = UIFont.boldSystemFont(ofSize: 18)
        label.textAlignment = .left
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    private let emailLabel: UILabel = {
        let label = UILabel()
        label.font = UIFont.systemFont(ofSize: 14)
        label.textColor = .systemGray
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()
    
    // MARK: - Properties
    var user: User? {
        didSet { updateUI() }
    }
    
    // MARK: - Initialization
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }
    
    // MARK: - Setup
    private func setupView() {
        backgroundColor = .systemBackground
        layer.cornerRadius = 12
        layer.shadowColor = UIColor.black.cgColor
        layer.shadowOffset = CGSize(width: 0, height: 2)
        layer.shadowOpacity = 0.1
        layer.shadowRadius = 4
        
        addSubview(avatarImageView)
        addSubview(nameLabel)
        addSubview(emailLabel)
        
        setupConstraints()
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Avatar
            avatarImageView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            avatarImageView.topAnchor.constraint(equalTo: topAnchor, constant: 16),
            avatarImageView.widthAnchor.constraint(equalToConstant: 80),
            avatarImageView.heightAnchor.constraint(equalToConstant: 80),
            
            // Name
            nameLabel.leadingAnchor.constraint(equalTo: avatarImageView.trailingAnchor, constant: 16),
            nameLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            nameLabel.topAnchor.constraint(equalTo: avatarImageView.topAnchor, constant: 8),
            
            // Email
            emailLabel.leadingAnchor.constraint(equalTo: nameLabel.leadingAnchor),
            emailLabel.trailingAnchor.constraint(equalTo: nameLabel.trailingAnchor),
            emailLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            
            // Container height
            bottomAnchor.constraint(equalTo: avatarImageView.bottomAnchor, constant: 16)
        ])
    }
    
    private func updateUI() {
        guard let user = user else { return }
        
        nameLabel.text = user.name
        emailLabel.text = user.email
        
        // 加载头像
        if let avatarURL = user.avatarURL {
            loadAvatar(from: avatarURL)
        } else {
            avatarImageView.image = UIImage(systemName: "person.circle.fill")
        }
    }
    
    private func loadAvatar(from url: URL) {
        // 实现图片加载逻辑
    }
}

// MARK: - Supporting Types
struct User {
    let name: String
    let email: String
    let avatarURL: URL?
}
```

### 8.4 可重用的视图组件

```swift
protocol Configurable {
    associatedtype Configuration
    func configure(with configuration: Configuration)
}

class ConfigurableView<Config>: UIView, Configurable {
    typealias Configuration = Config
    
    var configuration: Configuration? {
        didSet {
            if let config = configuration {
                configure(with: config)
            }
        }
    }
    
    func configure(with configuration: Configuration) {
        // 子类重写实现
    }
}

// 使用示例
struct ButtonConfiguration {
    let title: String
    let backgroundColor: UIColor
    let titleColor: UIColor
}

class ConfigurableButton: ConfigurableView<ButtonConfiguration> {
    private let button = UIButton()
    
    override func configure(with configuration: ButtonConfiguration) {
        button.setTitle(configuration.title, for: .normal)
        button.backgroundColor = configuration.backgroundColor
        button.setTitleColor(configuration.titleColor, for: .normal)
    }
}
```

***

## 9. 常用模式和最佳实践

### 9.1 视图复用

```swift
// 使用工厂方法创建标准化视图
extension UIView {
    static func createSeparatorView() -> UIView {
        let view = UIView()
        view.backgroundColor = .systemGray4
        view.translatesAutoresizingMaskIntoConstraints = false
        view.heightAnchor.constraint(equalToConstant: 1).isActive = true
        return view
    }
    
    static func createCardView() -> UIView {
        let view = UIView()
        view.backgroundColor = .systemBackground
        view.layer.cornerRadius = 12
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOffset = CGSize(width: 0, height: 2)
        view.layer.shadowOpacity = 0.1
        view.layer.shadowRadius = 4
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }
}
```

### 9.2 性能优化

```swift
// 避免在主线程进行复杂计算
override func layoutSubviews() {
    super.layoutSubviews()
    
    // 缓存计算结果
    if cachedSize != bounds.size {
        cachedSize = bounds.size
        recalculateLayout()
    }
}

// 使用 CALayer 属性进行优化
override func awakeFromNib() {
    super.awakeFromNib()
    
    // 启用光栅化（适用于静态复杂视图）
    layer.shouldRasterize = true
    layer.rasterizationScale = UIScreen.main.scale
    
    // 设置不透明性以优化合成
    isOpaque = true
}
```

### 9.3 响应式设计

```swift
class ResponsiveView: UIView {
    
    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        
        if traitCollection.horizontalSizeClass != previousTraitCollection?.horizontalSizeClass {
            updateLayoutForSizeClass()
        }
        
        if traitCollection.userInterfaceStyle != previousTraitCollection?.userInterfaceStyle {
            updateColorsForUserInterfaceStyle()
        }
    }
    
    private func updateLayoutForSizeClass() {
        if traitCollection.horizontalSizeClass == .compact {
            // 紧凑布局
        } else {
            // 常规布局
        }
    }
    
    private func updateColorsForUserInterfaceStyle() {
        if traitCollection.userInterfaceStyle == .dark {
            // 深色模式颜色
        } else {
            // 浅色模式颜色
        }
    }
}
```

### 9.4 调试和测试

```swift
#if DEBUG
extension UIView {
    func addDebugBorder(_ color: UIColor = .red) {
        layer.borderWidth = 1
        layer.borderColor = color.cgColor
    }
    
    func logViewHierarchy(level: Int = 0) {
        let indent = String(repeating: "  ", count: level)
        print("\(indent)\(type(of: self)) - \(frame)")
        
        for subview in subviews {
            subview.logViewHierarchy(level: level + 1)
        }
    }
}
#endif
```

***

## 总结

UIView 是 iOS 开发中最基础和最重要的类之一，掌握其 API 和自定义方法对于构建优秀的用户界面至关重要。关键要点：

1.  **理解视图层次结构** - frame、bounds、transform 的关系
2.  **掌握布局系统** - Auto Layout、安全区域、内容优先级
3.  **合理使用动画** - UIView 动画、Core Animation
4.  **优化性能** - 避免过度绘制、合理使用 layer 属性
5.  **遵循最佳实践** - 代码结构清晰、可复用性、响应式设计

自定义 UIView 时，始终记住：

*   在 `init` 方法中进行初始化设置
*   在 `layoutSubviews` 中处理布局
*   在 `draw(_:)` 中进行自定义绘制
*   合理处理触摸事件和手势识别

