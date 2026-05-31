---
title: "UILabel 完整指南"
description: "1. 性能考虑： 避免频繁改变 attributedText 对于复杂的富文本使用缓存 在后台队列创建 NSAttributedString"
pubDate: 2026-05-29
category: "uikt"
tags: [Git, iOS, Swift, Array, SEO]
draft: false
---
# 🚀 UILabel 完整指南

## 概述
UILabel 是 UIKit 框架中用于显示静态文本的核心控件，继承自 UIView，提供了丰富的文本显示和格式化功能。

## 类层次结构
```
NSObject
└── UIResponder
    └── UIView
        └── UILabel
```

## 初始化方法

### 1. 基础初始化

```swift
// 标准初始化
init(frame: CGRect)
init?(coder: NSCoder)

// 便捷创建
let label = UILabel()
let frameLabel = UILabel(frame: CGRect(x: 0, y: 0, width: 200, height: 30))
```

### 2. 便捷初始化扩展

```swift
extension UILabel {
    convenience init(text: String, 
                    fontSize: CGFloat = 17, 
                    textColor: UIColor = .label) {
        self.init()
        self.text = text
        self.font = UIFont.systemFont(ofSize: fontSize)
        self.textColor = textColor
    }
    
    convenience init(attributedText: NSAttributedString) {
        self.init()
        self.attributedText = attributedText
    }
}

// 使用示例
let label1 = UILabel(text: "Hello World", fontSize: 18, textColor: .blue)
let label2 = UILabel(attributedText: attributedString)
```

## 核心属性

### 1. 文本内容

```swift
// 普通文本
var text: String?

// 属性化文本
var attributedText: NSAttributedString?

// 当前显示的文本（只读）
var displayText: String? { get }

// 示例
label.text = "Hello World"
label.attributedText = NSAttributedString(
    string: "样式文本", 
    attributes: [.foregroundColor: UIColor.red]
)
```

### 2. 字体相关

```swift
// 字体
var font: UIFont!

// 常用字体设置
label.font = UIFont.systemFont(ofSize: 17)                    // 系统字体
label.font = UIFont.boldSystemFont(ofSize: 18)               // 粗体系统字体
label.font = UIFont.italicSystemFont(ofSize: 16)             // 斜体系统字体
label.font = UIFont.preferredFont(forTextStyle: .body)       // 动态字体
label.font = UIFont(name: "Helvetica-Bold", size: 20)        // 自定义字体

// 字体调整
var adjustsFontSizeToFitWidth: Bool              // 自动调整字体大小以适应宽度
var allowsDefaultTighteningForTruncation: Bool   // 允许字符间距调整
var minimumScaleFactor: CGFloat                  // 最小缩放因子（0.0-1.0）
var baselineAdjustment: UIBaselineAdjustment     // 基线调整

// 基线调整枚举
enum UIBaselineAdjustment {
    case alignBaselines    // 对齐基线
    case alignCenters      // 对齐中心
    case none             // 不调整
}
```

### 3. 文本颜色

```swift
// 文本颜色
var textColor: UIColor!

// 高亮文本颜色
var highlightedTextColor: UIColor?

// 是否高亮状态
var isHighlighted: Bool

// 示例
label.textColor = .black
label.highlightedTextColor = .red
label.isHighlighted = true
```

### 4. 文本对齐和布局

```swift
// 文本对齐方式
var textAlignment: NSTextAlignment

// 对齐方式枚举
enum NSTextAlignment {
    case left      // 左对齐
    case center    // 居中
    case right     // 右对齐
    case justified // 两端对齐
    case natural   // 自然对齐（根据语言方向）
}

// 行数和换行
var numberOfLines: Int              // 显示行数（0表示无限制）
var lineBreakMode: NSLineBreakMode  // 换行模式

// 换行模式枚举
enum NSLineBreakMode {
    case byWordWrapping       // 按单词换行
    case byCharWrapping      // 按字符换行
    case byClipping          // 裁剪
    case byTruncatingHead    // 头部截断显示...
    case byTruncatingTail    // 尾部截断显示...
    case byTruncatingMiddle  // 中间截断显示...
}
```

### 5. 阴影效果

```swift
// 阴影颜色
var shadowColor: UIColor?

// 阴影偏移
var shadowOffset: CGSize

// 示例
label.shadowColor = .gray
label.shadowOffset = CGSize(width: 1, height: 1)
```

## 自动布局和尺寸

### 1. 内容尺寸

```swift
// 内在内容尺寸（只读）
var intrinsicContentSize: CGSize { get }

// 首选最大布局宽度
var preferredMaxLayoutWidth: CGFloat

// 计算文本尺寸
func sizeThatFits(_ size: CGSize) -> CGSize

// 文本绘制区域
func textRect(forBounds bounds: CGRect, limitedToNumberOfLines numberOfLines: Int) -> CGRect

// 示例
let textSize = label.sizeThatFits(CGSize(width: 200, height: CGFloat.greatestFiniteMagnitude))
label.preferredMaxLayoutWidth = 200
```

### 2. 内容优先级

```swift
// 内容拥抱优先级
func setContentHuggingPriority(_ priority: UILayoutPriority, for axis: NSLayoutConstraint.Axis)
func contentHuggingPriority(for axis: NSLayoutConstraint.Axis) -> UILayoutPriority

// 内容压缩阻力优先级
func setContentCompressionResistancePriority(_ priority: UILayoutPriority, for axis: NSLayoutConstraint.Axis)
func contentCompressionResistancePriority(for axis: NSLayoutConstraint.Axis) -> UILayoutPriority

// 示例
label.setContentHuggingPriority(.defaultHigh, for: .horizontal)
label.setContentCompressionResistancePriority(.required, for: .vertical)
```

## iOS 14+ 新特性

### 1. 可变数字字体

```swift
// iOS 14+ 可变数字字体配置
@available(iOS 14.0, *)
var monospacedDigitSystemFont: Bool {
    get {
        return font.fontDescriptor.symbolicTraits.contains(.traitMonoSpace)
    }
    set {
        if newValue {
            font = UIFont.monospacedDigitSystemFont(ofSize: font.pointSize, weight: .regular)
        }
    }
}
```

### 2. 行高倍数

```swift
// iOS 14+ 行高设置
extension UILabel {
    func setLineSpacing(_ spacing: CGFloat) {
        guard let text = text else { return }
        
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = spacing
        paragraphStyle.alignment = textAlignment
        
        let attributedString = NSMutableAttributedString(string: text)
        attributedString.addAttribute(.paragraphStyle, 
                                    value: paragraphStyle, 
                                    range: NSRange(location: 0, length: text.count))
        
        attributedText = attributedString
    }
}
```

## 富文本处理

### 1. NSAttributedString 常用属性

```swift
// 创建富文本
let attributedText = NSMutableAttributedString(string: "Hello World")

// 字体属性
attributedText.addAttribute(.font, 
                          value: UIFont.boldSystemFont(ofSize: 18), 
                          range: NSRange(location: 0, length: 5))

// 颜色属性
attributedText.addAttribute(.foregroundColor, 
                          value: UIColor.red, 
                          range: NSRange(location: 6, length: 5))

// 背景色
attributedText.addAttribute(.backgroundColor, 
                          value: UIColor.yellow, 
                          range: NSRange(location: 0, length: 11))

// 下划线
attributedText.addAttribute(.underlineStyle, 
                          value: NSUnderlineStyle.single.rawValue, 
                          range: NSRange(location: 0, length: 11))

// 删除线
attributedText.addAttribute(.strikethroughStyle, 
                          value: NSUnderlineStyle.single.rawValue, 
                          range: NSRange(location: 0, length: 11))

label.attributedText = attributedText
```

### 2. 段落样式

```swift
let paragraphStyle = NSMutableParagraphStyle()
paragraphStyle.lineSpacing = 5              // 行间距
paragraphStyle.paragraphSpacing = 10        // 段落间距
paragraphStyle.alignment = .center          // 对齐方式
paragraphStyle.firstLineHeadIndent = 20     // 首行缩进
paragraphStyle.headIndent = 10              // 头部缩进
paragraphStyle.tailIndent = -10             // 尾部缩进
paragraphStyle.lineBreakMode = .byTruncatingTail

let attributedString = NSAttributedString(
    string: "这是一段带有段落样式的文本内容。",
    attributes: [.paragraphStyle: paragraphStyle]
)

label.attributedText = attributedString
```

## 动态字体支持

### 1. Dynamic Type

```swift
// 使用动态字体
label.font = UIFont.preferredFont(forTextStyle: .body)

// 自动调整字体大小
label.adjustsFontForContentSizeCategory = true

// 监听字体大小变化
NotificationCenter.default.addObserver(
    forName: UIContentSizeCategory.didChangeNotification,
    object: nil,
    queue: .main
) { _ in
    // 更新字体
    label.font = UIFont.preferredFont(forTextStyle: .body)
}

// 文本样式类型
UIFont.TextStyle.largeTitle    // 大标题
UIFont.TextStyle.title1        // 标题1
UIFont.TextStyle.title2        // 标题2
UIFont.TextStyle.title3        // 标题3
UIFont.TextStyle.headline      // 标题
UIFont.TextStyle.subheadline   // 副标题
UIFont.TextStyle.body          // 正文
UIFont.TextStyle.callout       // 标注
UIFont.TextStyle.footnote      // 脚注
UIFont.TextStyle.caption1      // 说明1
UIFont.TextStyle.caption2      // 说明2
```

### 2. 字体缩放限制

```swift
// 设置最大字体尺寸类别
if #available(iOS 15.0, *) {
    label.maximumContentSizeCategory = .extraExtraExtraLarge
}

// 设置最小字体尺寸类别
if #available(iOS 15.0, *) {
    label.minimumContentSizeCategory = .medium
}
```

## 文本测量和计算

### 1. 文本尺寸计算

```swift
extension String {
    func size(withFont font: UIFont, 
              constrainedTo size: CGSize = CGSize(width: CGFloat.greatestFiniteMagnitude, 
                                                height: CGFloat.greatestFiniteMagnitude),
              lineBreakMode: NSLineBreakMode = .byWordWrapping) -> CGSize {
        
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineBreakMode = lineBreakMode
        
        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .paragraphStyle: paragraphStyle
        ]
        
        let rect = (self as NSString).boundingRect(
            with: size,
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: attributes,
            context: nil
        )
        
        return CGSize(width: ceil(rect.width), height: ceil(rect.height))
    }
    
    func height(withFont font: UIFont, width: CGFloat) -> CGFloat {
        return size(withFont: font, 
                   constrainedTo: CGSize(width: width, height: .greatestFiniteMagnitude)).height
    }
    
    func width(withFont font: UIFont) -> CGFloat {
        return size(withFont: font).width
    }
}

// 使用示例
let text = "这是一段需要计算尺寸的文本"
let font = UIFont.systemFont(ofSize: 16)
let textSize = text.size(withFont: font, constrainedTo: CGSize(width: 200, height: .greatestFiniteMagnitude))
```

### 2. 行数计算

```swift
extension UILabel {
    var actualNumberOfLines: Int {
        guard let text = text, !text.isEmpty else { return 0 }
        
        let size = CGSize(width: frame.width, height: .greatestFiniteMagnitude)
        let textSize = text.size(withFont: font, constrainedTo: size)
        
        return Int(ceil(textSize.height / font.lineHeight))
    }
    
    func setTextWithAnimation(_ newText: String, duration: TimeInterval = 0.3) {
        UIView.transition(with: self, 
                         duration: duration, 
                         options: .transitionCrossDissolve) {
            self.text = newText
        }
    }
}
```

## 辅助功能支持

### 1. Accessibility 属性

```swift
// 无障碍标签
label.accessibilityLabel = "用户姓名"

// 无障碍提示
label.accessibilityHint = "显示当前登录用户的姓名"

// 无障碍值
label.accessibilityValue = label.text

// 无障碍特征
label.accessibilityTraits = [.staticText]

// 是否为无障碍元素
label.isAccessibilityElement = true

// VoiceOver 相关
label.accessibilityLanguage = "zh-CN"  // 语言设置
```

### 2. 动态文本支持

```swift
// 支持动态文本大小调整
extension UILabel {
    func setupDynamicType(textStyle: UIFont.TextStyle = .body) {
        font = UIFont.preferredFont(forTextStyle: textStyle)
        adjustsFontForContentSizeCategory = true
        
        // 监听字体大小变化通知
        NotificationCenter.default.addObserver(
            forName: UIContentSizeCategory.didChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.font = UIFont.preferredFont(forTextStyle: textStyle)
        }
    }
}
```

## 性能优化

### 1. 文本缓存

```swift
class TextCache {
    private var cache: [String: NSAttributedString] = [:]
    
    func attributedString(for text: String, 
                         font: UIFont, 
                         color: UIColor) -> NSAttributedString {
        let key = "\(text)-\(font.fontName)-\(font.pointSize)-\(color.description)"
        
        if let cached = cache[key] {
            return cached
        }
        
        let attributed = NSAttributedString(
            string: text,
            attributes: [
                .font: font,
                .foregroundColor: color
            ]
        )
        
        cache[key] = attributed
        return attributed
    }
    
    func clearCache() {
        cache.removeAll()
    }
}
```

### 2. 异步文本处理

```swift
extension UILabel {
    func setTextAsync(_ text: String, 
                     font: UIFont? = nil, 
                     color: UIColor? = nil) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            let attributedText = NSAttributedString(
                string: text,
                attributes: [
                    .font: font ?? self.font!,
                    .foregroundColor: color ?? self.textColor!
                ]
            )
            
            DispatchQueue.main.async {
                self.attributedText = attributedText
            }
        }
    }
}
```

## 自定义样式和动画

### 1. 文本动画

```swift
extension UILabel {
    func animateText(to newText: String, duration: TimeInterval = 0.3) {
        let animation = CATransition()
        animation.duration = duration
        animation.type = .fade
        animation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        
        layer.add(animation, forKey: "textChange")
        text = newText
    }
    
    func typewriterAnimation(_ text: String, duration: TimeInterval = 2.0) {
        self.text = ""
        
        for (index, character) in text.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + duration * Double(index) / Double(text.count)) {
                self.text?.append(character)
            }
        }
    }
    
    func fadeInText(_ text: String, duration: TimeInterval = 0.5) {
        alpha = 0
        self.text = text
        
        UIView.animate(withDuration: duration) {
            self.alpha = 1
        }
    }
}
```

### 2. 渐变文本

```swift
extension UILabel {
    func setGradientText(colors: [UIColor], direction: GradientDirection = .horizontal) {
        guard let text = text else { return }
        
        let size = text.size(withFont: font)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        let gradientImage = renderer.image { context in
            let cgColors = colors.map { $0.cgColor }
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            
            guard let gradient = CGGradient(colorsSpace: colorSpace, 
                                          colors: cgColors as CFArray, 
                                          locations: nil) else { return }
            
            let startPoint: CGPoint
            let endPoint: CGPoint
            
            switch direction {
            case .horizontal:
                startPoint = CGPoint(x: 0, y: size.height/2)
                endPoint = CGPoint(x: size.width, y: size.height/2)
            case .vertical:
                startPoint = CGPoint(x: size.width/2, y: 0)
                endPoint = CGPoint(x: size.width/2, y: size.height)
            }
            
            context.cgContext.drawLinearGradient(gradient, 
                                               start: startPoint, 
                                               end: endPoint, 
                                               options: [])
        }
        
        self.textColor = UIColor(patternImage: gradientImage)
    }
}

enum GradientDirection {
    case horizontal
    case vertical
}
```

## 实用扩展方法

### 1. 便捷设置方法

```swift
extension UILabel {
    @discardableResult
    func text(_ text: String) -> Self {
        self.text = text
        return self
    }
    
    @discardableResult
    func font(_ font: UIFont) -> Self {
        self.font = font
        return self
    }
    
    @discardableResult
    func fontSize(_ size: CGFloat) -> Self {
        self.font = UIFont.systemFont(ofSize: size)
        return self
    }
    
    @discardableResult
    func textColor(_ color: UIColor) -> Self {
        self.textColor = color
        return self
    }
    
    @discardableResult
    func alignment(_ alignment: NSTextAlignment) -> Self {
        self.textAlignment = alignment
        return self
    }
    
    @discardableResult
    func numberOfLines(_ lines: Int) -> Self {
        self.numberOfLines = lines
        return self
    }
}

// 链式调用示例
let label = UILabel()
    .text("Hello World")
    .fontSize(18)
    .textColor(.blue)
    .alignment(.center)
    .numberOfLines(0)
```

### 2. 常用样式预设

```swift
extension UILabel {
    static func titleLabel(text: String) -> UILabel {
        let label = UILabel()
        label.text = text
        label.font = UIFont.boldSystemFont(ofSize: 20)
        label.textColor = .label
        label.textAlignment = .left
        label.numberOfLines = 1
        return label
    }
    
    static func subtitleLabel(text: String) -> UILabel {
        let label = UILabel()
        label.text = text
        label.font = UIFont.systemFont(ofSize: 16)
        label.textColor = .secondaryLabel
        label.textAlignment = .left
        label.numberOfLines = 0
        return label
    }
    
    static func captionLabel(text: String) -> UILabel {
        let label = UILabel()
        label.text = text
        label.font = UIFont.systemFont(ofSize: 12)
        label.textColor = .tertiaryLabel
        label.textAlignment = .left
        label.numberOfLines = 1
        return label
    }
}
```

## 调试和故障排除

### 1. 调试工具

```swift
extension UILabel {
    func debugInfo() -> String {
        var info = "UILabel Debug Info:\n"
        info += "Text: \(text ?? "nil")\n"
        info += "Font: \(font?.fontName ?? "nil") - \(font?.pointSize ?? 0)pt\n"
        info += "Frame: \(frame)\n"
        info += "Bounds: \(bounds)\n"
        info += "Number of Lines: \(numberOfLines)\n"
        info += "Line Break Mode: \(lineBreakMode.rawValue)\n"
        info += "Text Alignment: \(textAlignment.rawValue)\n"
        info += "Intrinsic Content Size: \(intrinsicContentSize)\n"
        
        if let attributedText = attributedText {
            info += "Attributed Text Length: \(attributedText.length)\n"
        }
        
        return info
    }
    
    func addDebugBorder() {
        layer.borderWidth = 1
        layer.borderColor = UIColor.red.cgColor
        backgroundColor = UIColor.yellow.withAlphaComponent(0.3)
    }
}
```

### 2. 常见问题解决

```swift
extension UILabel {
    // 解决文本截断问题
    func optimizeForMultiline() {
        numberOfLines = 0
        lineBreakMode = .byWordWrapping
        setContentCompressionResistancePriority(.required, for: .vertical)
    }
    
    // 解决自动布局中的显示问题
    func setupForAutoLayout() {
        translatesAutoresizingMaskIntoConstraints = false
        setContentHuggingPriority(.defaultHigh, for: .horizontal)
        setContentCompressionResistancePriority(.required, for: .vertical)
    }
    
    // 检查文本是否被截断
    var isTextTruncated: Bool {
        guard let text = text, !text.isEmpty else { return false }
        
        let size = CGSize(width: frame.width, height: .greatestFiniteMagnitude)
        let textSize = text.size(withFont: font, constrainedTo: size)
        
        return textSize.height > frame.height
    }
}
```

## 最佳实践

1. **性能考虑**：
   - 避免频繁改变 attributedText
   - 对于复杂的富文本使用缓存
   - 在后台队列创建 NSAttributedString

2. **自动布局**：
   - 正确设置内容拥抱和压缩阻力优先级
   - 多行文本使用 preferredMaxLayoutWidth

3. **无障碍性**：
   - 提供适当的 accessibilityLabel
   - 支持动态字体大小

4. **国际化**：
   - 使用 NSLocalizedString
   - 考虑不同语言的文本长度差异

5. **用户体验**：
   - 合理使用颜色对比度
   - 提供足够的触摸区域（如果需要交互）

## 总结

UILabel 是 iOS 开发中最常用的文本显示控件，提供了丰富的文本格式化和显示功能。通过合理使用其各种属性和方法，可以创建出美观且功能强大的文本界面。现代开发中应特别注意支持动态字体、无障碍功能和国际化需求。