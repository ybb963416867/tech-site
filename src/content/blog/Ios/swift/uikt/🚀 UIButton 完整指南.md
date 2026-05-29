---
title: "UIButton 完整指南"
description: "UIButton 是 UIKit 框架中最重要的用户交互控件之一，继承自 UIControl，提供了丰富的自定义选项和交互功能。"
pubDate: 2026-05-29
category: "uikt"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀 UIButton 完整指南

## 概述

UIButton 是 UIKit 框架中最重要的用户交互控件之一，继承自 UIControl，提供了丰富的自定义选项和交互功能。

## 类层次结构

```
NSObject
└── UIResponder
    └── UIView
        └── UIControl
            └── UIButton
```

## 初始化方法

### 1. 基础初始化

```swift
// 便捷初始化器
init(type buttonType: UIButton.ButtonType)

// 常用类型
let button = UIButton(type: .system)        // 系统按钮
let button = UIButton(type: .custom)        // 自定义按钮
let button = UIButton(type: .detailDisclosure)  // 详情按钮
let button = UIButton(type: .infoLight)     // 信息按钮（浅色）
let button = UIButton(type: .infoDark)      // 信息按钮（深色）
let button = UIButton(type: .contactAdd)    // 添加联系人按钮
let button = UIButton(type: .close)         // 关闭按钮
```

### 2. 便捷创建方法 (iOS 14+)

```swift
// 系统按钮
class func systemButton(with image: UIImage?, target: Any?, action: Selector?) -> Self

// 配置按钮 (iOS 15+)
init(configuration: UIButton.Configuration, primaryAction: UIAction?)
```

## 按钮类型 (ButtonType)

```swift
enum ButtonType : Int {
    case custom              // 自定义类型
    case system             // 系统类型
    case detailDisclosure   // 详情披露
    case infoLight          // 浅色信息
    case infoDark           // 深色信息
    case contactAdd         // 添加联系人
    case close              // 关闭按钮
}
```

## 核心属性

### 1. 按钮类型和状态

```swift
// 只读属性
var buttonType: UIButton.ButtonType { get }

// 当前状态
var state: UIControl.State { get }

// 是否启用
var isEnabled: Bool

// 是否选中
var isSelected: Bool

// 是否高亮
var isHighlighted: Bool
```

### 2. 文本相关属性

```swift
// 设置不同状态下的标题
func setTitle(_ title: String?, for state: UIControl.State)
func title(for state: UIControl.State) -> String?

// 设置不同状态下的标题颜色
func setTitleColor(_ color: UIColor?, for state: UIControl.State)
func titleColor(for state: UIControl.State) -> UIColor?

// 设置不同状态下的标题阴影颜色
func setTitleShadowColor(_ color: UIColor?, for state: UIControl.State)
func titleShadowColor(for state: UIControl.State) -> UIColor?

// 属性化标题
func setAttributedTitle(_ title: NSAttributedString?, for state: UIControl.State)
func attributedTitle(for state: UIControl.State) -> NSAttributedString?
```

### 3. 字体和文本样式

```swift
// 通过 titleLabel 设置字体
button.titleLabel?.font = UIFont.systemFont(ofSize: 18)
button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 20)
button.titleLabel?.font = UIFont.preferredFont(forTextStyle: .title1)

// 字体大小设置示例
button.titleLabel?.font = UIFont(name: "Helvetica-Bold", size: 16)

// 文本对齐方式
button.titleLabel?.textAlignment = .center
button.titleLabel?.textAlignment = .left
button.titleLabel?.textAlignment = .right

// 文本换行
button.titleLabel?.numberOfLines = 0  // 多行显示
button.titleLabel?.numberOfLines = 1  // 单行显示
button.titleLabel?.lineBreakMode = .byTruncatingTail

// 文本自适应
button.titleLabel?.adjustsFontSizeToFitWidth = true
button.titleLabel?.minimumScaleFactor = 0.5

// 使用 NSAttributedString 设置丰富的文本样式
let attributedTitle = NSAttributedString(
    string: "自定义样式",
    attributes: [
        .font: UIFont.boldSystemFont(ofSize: 18),
        .foregroundColor: UIColor.blue,
        .underlineStyle: NSUnderlineStyle.single.rawValue
    ]
)
button.setAttributedTitle(attributedTitle, for: .normal)
```

### 3. 图像相关属性

```swift
// 设置不同状态下的图像
func setImage(_ image: UIImage?, for state: UIControl.State)
func image(for state: UIControl.State) -> UIImage?

// 设置不同状态下的背景图像
func setBackgroundImage(_ image: UIImage?, for state: UIControl.State)
func backgroundImage(for state: UIControl.State) -> UIImage?

// 当前显示的图像
var currentImage: UIImage? { get }
var currentBackgroundImage: UIImage? { get }

// 图像视图 (只读)
var imageView: UIImageView? { get }
```

### 4. 标签相关属性

```swift
// 标签对象 (只读)
var titleLabel: UILabel? { get }

// 当前标题
var currentTitle: String? { get }
var currentTitleColor: UIColor { get }
var currentTitleShadowColor: UIColor? { get }
var currentAttributedTitle: NSAttributedString? { get }
```

## 布局和尺寸

### 1. 内容布局

```swift
// 内容对齐方式
var contentHorizontalAlignment: UIControl.ContentHorizontalAlignment
var contentVerticalAlignment: UIControl.ContentVerticalAlignment

// 内容边距
var contentEdgeInsets: UIEdgeInsets

// 标题边距
var titleEdgeInsets: UIEdgeInsets

// 图像边距
var imageEdgeInsets: UIEdgeInsets
```

### 2. 尺寸计算

```swift
// 计算适合的尺寸
func sizeThatFits(_ size: CGSize) -> CGSize

// 内在内容尺寸
var intrinsicContentSize: CGSize { get }

// 基线调整
var titleLabel: UILabel? { get }
```

## 外观和样式

### 1. 色调和颜色

```swift
// 色调颜色
var tintColor: UIColor!

// 背景颜色
var backgroundColor: UIColor?

// 是否调整图像亮度
var adjustsImageWhenHighlighted: Bool
var adjustsImageWhenDisabled: Bool

// 反转颜色
var reversesTitleShadowWhenHighlighted: Bool
```

### 2. 边框和圆角

```swift
// 圆角半径
layer.cornerRadius: CGFloat

// 边框
layer.borderWidth: CGFloat
layer.borderColor: CGColor?

// 阴影
layer.shadowColor: CGColor?
layer.shadowOffset: CGSize
layer.shadowOpacity: Float
layer.shadowRadius: CGFloat
```

## iOS 15+ 新特性

### 1. 配置 (Configuration)

```swift
// 按钮配置
var configuration: UIButton.Configuration?

// 配置更新处理
var configurationUpdateHandler: UIButton.ConfigurationUpdateHandler?

// 自动更新配置
var automaticallyUpdatesConfiguration: Bool
```

### 2. 配置类型

```swift
// 预设配置
static func plain() -> UIButton.Configuration
static func tinted() -> UIButton.Configuration  
static func filled() -> UIButton.Configuration
static func gray() -> UIButton.Configuration
static func borderedTinted() -> UIButton.Configuration
static func borderedProminent() -> UIButton.Configuration
```

### 3. 配置示例

```swift
var config = UIButton.Configuration.filled()
config.title = "按钮标题"
config.subtitle = "副标题"
config.image = UIImage(systemName: "star.fill")
config.imagePlacement = .leading
config.imagePadding = 8
config.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 15, bottom: 10, trailing: 15)

button.configuration = config
```

## 交互和事件

### 1. 添加动作

```swift
// Target-Action 模式
func addTarget(_ target: Any?, action: Selector, for controlEvents: UIControl.Event)

// 示例
button.addTarget(self, action: #selector(buttonTapped), for: .touchUpInside)

@objc func buttonTapped() {
    print("按钮被点击")
}
```

### 2. UIAction (iOS 14+)

```swift
// 使用 UIAction
let action = UIAction { _ in
    print("按钮被点击")
}
button.addAction(action, for: .touchUpInside)

// 便捷创建
let button = UIButton(type: .system, primaryAction: UIAction { _ in
    print("主要动作")
})
```

### 3. 控制事件

```swift
// 常用事件类型
.touchDown           // 按下
.touchDownRepeat     // 重复按下
.touchDragInside     // 在内部拖拽
.touchDragOutside    // 拖拽到外部
.touchDragEnter      // 拖拽进入
.touchDragExit       // 拖拽离开
.touchUpInside       // 在内部松开（最常用）
.touchUpOutside      // 在外部松开
.touchCancel         // 触摸取消
```

## 状态管理

### 1. 控制状态

```swift
// 状态枚举
struct UIControl.State : OptionSet {
    static var normal: UIControl.State       // 正常状态
    static var highlighted: UIControl.State  // 高亮状态
    static var disabled: UIControl.State     // 禁用状态
    static var selected: UIControl.State     // 选中状态
    static var focused: UIControl.State      // 聚焦状态
    static var application: UIControl.State  // 应用程序状态
    static var reserved: UIControl.State     // 保留状态
}
```

### 2. 状态设置示例

```swift
// 不同状态下的外观
button.setTitle("正常", for: .normal)
button.setTitle("按下", for: .highlighted)
button.setTitle("禁用", for: .disabled)
button.setTitle("选中", for: .selected)

button.setTitleColor(.blue, for: .normal)
button.setTitleColor(.white, for: .highlighted)
button.setTitleColor(.gray, for: .disabled)
```

## 自定义外观

### 1. 渐变背景

```swift
extension UIButton {
    func setGradientBackground(colors: [UIColor]) {
        let gradientLayer = CAGradientLayer()
        gradientLayer.colors = colors.map { $0.cgColor }
        gradientLayer.frame = bounds
        gradientLayer.cornerRadius = layer.cornerRadius
        
        layer.insertSublayer(gradientLayer, at: 0)
    }
}
```

### 2. 圆形按钮

```swift
extension UIButton {
    func makeCircular() {
        layer.cornerRadius = min(frame.width, frame.height) / 2
        clipsToBounds = true
    }
}
```

### 3. 阴影效果

```swift
extension UIButton {
    func addShadow(color: UIColor = .black, opacity: Float = 0.3, radius: CGFloat = 3, offset: CGSize = CGSize(width: 0, height: 2)) {
        layer.shadowColor = color.cgColor
        layer.shadowOpacity = opacity
        layer.shadowRadius = radius
        layer.shadowOffset = offset
        layer.masksToBounds = false
    }
}
```

## 动画效果

### 1. 点击动画

```swift
@objc func buttonTouchDown() {
    UIView.animate(withDuration: 0.1) {
        self.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
    }
}

@objc func buttonTouchUp() {
    UIView.animate(withDuration: 0.1) {
        self.transform = CGAffineTransform.identity
    }
}

// 添加事件
button.addTarget(self, action: #selector(buttonTouchDown), for: .touchDown)
button.addTarget(self, action: #selector(buttonTouchUp), for: [.touchUpInside, .touchUpOutside, .touchCancel])
```

### 2. 弹簧动画

```swift
func animateButtonPress() {
    UIView.animate(withDuration: 0.6,
                   delay: 0,
                   usingSpringWithDamping: 0.3,
                   initialSpringVelocity: 0.8,
                   options: [.allowUserInteraction]) {
        // 动画内容
    } completion: { _ in
        // 完成回调
    }
}
```

## 菜单 (iOS 14+)

### 1. 上下文菜单

```swift
// 创建菜单
let menu = UIMenu(title: "选项", children: [
    UIAction(title: "选项1") { _ in print("选项1") },
    UIAction(title: "选项2") { _ in print("选项2") },
    UIAction(title: "删除", attributes: .destructive) { _ in print("删除") }
])

button.menu = menu
button.showsMenuAsPrimaryAction = true
```

### 2. 弹出菜单

```swift
// Pull Down 菜单
button.menu = menu
button.showsMenuAsPrimaryAction = false  // 长按显示菜单，点击执行主要动作
```

## 辅助功能

### 1. Accessibility 支持

```swift
// 无障碍标签
button.accessibilityLabel = "确认按钮"

// 无障碍提示
button.accessibilityHint = "点击确认操作"

// 无障碍特征
button.accessibilityTraits = [.button]

// 无障碍值
button.accessibilityValue = "已选择"
```

### 2. VoiceOver 支持

```swift
// 是否为无障碍元素
button.isAccessibilityElement = true

// 自定义无障碍动作
button.accessibilityCustomActions = [
    UIAccessibilityCustomAction(name: "自定义动作") { _ in
        // 执行动作
        return true
    }
]
```

## 性能优化

### 1. 图像缓存

```swift
// 预加载和缓存图像
extension UIButton {
    func setImageAsync(from url: URL, for state: UIControl.State = .normal) {
        // 异步加载图像的实现
    }
}
```

### 2. 重用机制

```swift
// 在表格或集合视图中重用按钮时的最佳实践
override func prepareForReuse() {
    super.prepareForReuse()
    // 重置按钮状态
    setTitle(nil, for: .normal)
    setImage(nil, for: .normal)
    removeTarget(nil, action: nil, for: .allEvents)
}
```

## 常用扩展

### 1. 便捷创建

```swift
extension UIButton {
    convenience init(title: String, 
                    titleColor: UIColor = .blue, 
                    backgroundColor: UIColor = .clear,
                    fontSize: CGFloat = 16) {
        self.init(type: .system)
        setTitle(title, for: .normal)
        setTitleColor(titleColor, for: .normal)
        self.backgroundColor = backgroundColor
        titleLabel?.font = UIFont.systemFont(ofSize: fontSize)
    }
    
    convenience init(title: String, 
                    font: UIFont, 
                    titleColor: UIColor = .blue) {
        self.init(type: .system)
        setTitle(title, for: .normal)
        setTitleColor(titleColor, for: .normal)
        titleLabel?.font = font
    }
}

// 使用示例
let button1 = UIButton(title: "按钮", fontSize: 18)
let button2 = UIButton(title: "大按钮", font: UIFont.boldSystemFont(ofSize: 24))
```

### 2. 链式调用

```swift
extension UIButton {
    @discardableResult
    func title(_ title: String, for state: UIControl.State = .normal) -> Self {
        setTitle(title, for: state)
        return self
    }
    
    @discardableResult
    func titleColor(_ color: UIColor, for state: UIControl.State = .normal) -> Self {
        setTitleColor(color, for: state)
        return self
    }
    
    @discardableResult
    func font(_ font: UIFont) -> Self {
        titleLabel?.font = font
        return self
    }
    
    @discardableResult
    func fontSize(_ size: CGFloat) -> Self {
        titleLabel?.font = UIFont.systemFont(ofSize: size)
        return self
    }
    
    @discardableResult
    func boldFont(_ size: CGFloat) -> Self {
        titleLabel?.font = UIFont.boldSystemFont(ofSize: size)
        return self
    }
}

// 使用
let button = UIButton(type: .system)
    .title("按钮")
    .titleColor(.blue)
    .fontSize(18)
    .boldFont(20)
```

## 故障排除

### 1. 常见问题

```swift
// 问题：按钮点击没反应
// 解决：检查 isUserInteractionEnabled 和 isEnabled

// 问题：图像显示不正确  
// 解决：检查图像尺寸和 contentMode

// 问题：自动布局冲突
// 解决：设置正确的优先级和约束
```

### 2. 调试技巧

```swift
// 添加调试信息
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    let view = super.hitTest(point, with: event)
    print("Hit test: \(point), result: \(view)")
    return view
}
```

## 最佳实践

1. **状态管理**：为所有必要的状态设置合适的外观
2. **性能考虑**：避免在主线程进行重计算
3. **无障碍性**：始终提供适当的无障碍支持
4. **一致性**：在应用中保持按钮样式的一致性
5. **反馈**：提供适当的视觉和触觉反馈
6. **响应式**：确保按钮在不同设备和方向下都能正常工作

## 总结

UIButton 是一个功能强大且高度可定制的控件。通过合理使用其丰富的 API，可以创建出满足各种需求的用户界面。iOS 15+ 的配置系统进一步简化了复杂按钮的创建过程，建议在新项目中优先使用。