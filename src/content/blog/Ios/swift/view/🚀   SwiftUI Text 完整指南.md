---
title: "SwiftUI Text 完整指南"
description: "SwiftUI 的 Text 是用于显示只读文本的基础视图组件。它支持多种初始化方式、格式化选项和丰富的修饰符来自定义文本的外观和行为。"
pubDate: 2026-05-29
category: "view"
tags: [Git, Mac, iOS, Environment, Markdown, Swift, API]
draft: false
---
# 🚀 SwiftUI Text 完整指南

## 概述

SwiftUI 的 `Text` 是用于显示只读文本的基础视图组件。它支持多种初始化方式、格式化选项和丰富的修饰符来自定义文本的外观和行为。

---

## Text 初始化方式

### 基础字符串初始化

#### `Text(_ content: LocalizedStringKey)`
使用本地化字符串键创建文本。

**参数：**
- `content: LocalizedStringKey` - 本地化字符串键

**使用示例：**
```swift
// 基础文本
Text("Hello, World!")

// 带变量插值的本地化文本
let userName = "张三"
Text("welcome_message \(userName)")  // 从 Localizable.strings 获取

// 多行文本
Text("第一行\n第二行\n第三行")
```

#### `Text(verbatim content: String)`
创建不进行本地化处理的原始文本。

**参数：**
- `content: String` - 原始字符串内容

**使用示例：**
```swift
// 不进行本地化的文本（iOS 15+）
Text(verbatim: "**这不会解析为粗体**")

// 显示原始 Markdown 语法
Text(verbatim: "[这不是链接](https://example.com)")
```

### 格式化初始化

#### `Text(_ value: T, format: F)` where T: Comparable, F: FormatStyle
使用格式化样式显示数值。

**参数：**
- `value: T` - 要格式化的值
- `format: F` - 格式化样式

**数值格式化示例：**
```swift
let price = 29.99
let quantity = 1234
let percentage = 0.856

// 货币格式化
Text(price, format: .currency(code: "USD"))  // $29.99
Text(price, format: .currency(code: "CNY"))  // ¥29.99

// 数字格式化
Text(quantity, format: .number)                    // 1,234
Text(quantity, format: .number.grouping(.never))   // 1234

// 百分比格式化
Text(percentage, format: .percent)                             // 85.6%
Text(percentage, format: .percent.precision(.fractionLength(1))) // 85.6%
```

**日期格式化示例：**
```swift
let date = Date()
let dateRange = Date()...Date().addingTimeInterval(3600)

// 基础日期格式
Text(date, style: .date)        // Dec 25, 2024
Text(date, style: .time)        // 2:30 PM
Text(date, style: .relative)    // in 2 hours
Text(date, style: .offset)      // +0000
Text(date, style: .timer)       // 2:30

// 自定义日期格式
Text(date, format: .dateTime)                                    // 12/25/2024, 2:30 PM
Text(date, format: .dateTime.day().month().year())               // Dec 25, 2024
Text(date, format: .dateTime.weekday(.wide))                     // Wednesday
Text(date, format: .dateTime.hour().minute())                    // 2:30 PM

// 日期范围格式化
Text(dateRange, format: .components(style: .condensedAbbreviated)) // 1h
```

### AttributedString 初始化

#### `Text(_ attributedContent: AttributedString)`
使用富文本字符串创建文本。

**参数：**
- `attributedContent: AttributedString` - 富文本字符串

**使用示例：**
```swift
// 创建基础 AttributedString
var attributedString = AttributedString("富文本示例")
attributedString.foregroundColor = .red
attributedString.font = .title

Text(attributedString)

// 组合不同样式的富文本
var combinedText = AttributedString("普通文本 ")
var boldText = AttributedString("粗体文本 ")
boldText.inlinePresentationIntent = .stronglyEmphasized
var italicText = AttributedString("斜体文本")
italicText.inlinePresentationIntent = .emphasized

combinedText.append(boldText)
combinedText.append(italicText)
Text(combinedText)
```

### Markdown 支持（iOS 15+）

SwiftUI Text 自动解析 Markdown 语法：

```swift
// 基础 Markdown 语法
Text("**粗体文本**")
Text("*斜体文本*")
Text("`代码文本`")
Text("~~删除线文本~~")

// 链接
Text("[苹果官网](https://apple.com)")

// 组合 Markdown 语法
Text("支持 **粗体** 和 *斜体* 以及 `代码` 样式")

// 复杂 Markdown
Text("""
# 标题
这是一段包含 **粗体** 和 *斜体* 的文本。
还有 [链接](https://example.com) 和 `代码`。
""")
```

---

## Text 修饰符分类

SwiftUI Text 的修饰符可以分为以下几类：

1. **字体相关** - 控制字体大小、粗细、设计等
2. **颜色与样式** - 控制文本颜色和视觉样式
3. **文本格式** - 控制文本装饰和间距
4. **布局相关** - 控制文本排列和显示
5. **行为控制** - 控制文本的交互行为
6. **可访问性** - 提升无障碍体验
7. **动画相关** - 控制文本变化动画
8. **环境与系统** - 与系统环境的集成

---

## 字体相关修饰符

### `.font(_:)`
设置文本字体。

**参数：**
- `font: Font?` - 字体对象

**系统预设字体：**
```swift
Text("Large Title").font(.largeTitle)     // 34pt
Text("Title").font(.title)               // 28pt  
Text("Title 2").font(.title2)            // 22pt
Text("Title 3").font(.title3)            // 20pt
Text("Headline").font(.headline)         // 17pt, 半粗体
Text("Body").font(.body)                 // 17pt
Text("Callout").font(.callout)           // 16pt
Text("Subheadline").font(.subheadline)   // 15pt
Text("Footnote").font(.footnote)         // 13pt
Text("Caption").font(.caption)           // 12pt
Text("Caption 2").font(.caption2)        // 11pt
```

**自定义字体：**
```swift
// 系统字体自定义
Text("Custom Size").font(.system(size: 24))
Text("Custom Weight").font(.system(size: 18, weight: .medium))
Text("Custom Design").font(.system(size: 16, design: .rounded))

// 完全自定义
Text("All Custom").font(.system(
    size: 20,
    weight: .semibold,
    design: .serif
))

// 自定义字体族
Text("Custom Family").font(.custom("Helvetica", size: 18))

// 固定大小自定义字体（不受动态字体影响）
Text("Fixed Size").font(.custom("Arial", fixedSize: 16))
```

### `.fontWeight(_:)`
设置字体粗细。

**参数：**
- `weight: Font.Weight?` - 字体粗细

**粗细选项：**
```swift
Text("Ultra Light").fontWeight(.ultraLight)  // 100
Text("Thin").fontWeight(.thin)               // 200
Text("Light").fontWeight(.light)             // 300
Text("Regular").fontWeight(.regular)         // 400
Text("Medium").fontWeight(.medium)           // 500
Text("Semibold").fontWeight(.semibold)       // 600
Text("Bold").fontWeight(.bold)               // 700
Text("Heavy").fontWeight(.heavy)             // 800
Text("Black").fontWeight(.black)             // 900
```

### `.fontDesign(_:)`
设置字体设计风格。

**参数：**
- `design: Font.Design?` - 字体设计风格

**设计选项：**
```swift
Text("Default Design").fontDesign(.default)        // 系统默认
Text("Serif Design").fontDesign(.serif)            // 衬线字体
Text("Rounded Design").fontDesign(.rounded)        // 圆角字体
Text("Monospaced Design").fontDesign(.monospaced)  // 等宽字体
```

### `.fontWidth(_:)` (iOS 16+)
设置字体宽度。

**参数：**
- `width: Font.Width?` - 字体宽度

**宽度选项：**
```swift
Text("Ultra Condensed").fontWidth(.ultraCondensed)
Text("Extra Condensed").fontWidth(.extraCondensed)
Text("Condensed").fontWidth(.condensed)
Text("Standard Width").fontWidth(.standard)
Text("Expanded").fontWidth(.expanded)
Text("Extra Expanded").fontWidth(.extraExpanded)
Text("Ultra Expanded").fontWidth(.ultraExpanded)
```

### `.monospacedDigit()` (iOS 15+)
将数字设置为等宽显示。

```swift
// 适用于数字对齐显示
VStack(alignment: .trailing) {
    Text("12.34").monospacedDigit()
    Text("1,234.56").monospacedDigit()
    Text("123,456.78").monospacedDigit()
}
```

### `.monospaced(_:)` (iOS 15+)
设置等宽字体变体。

**参数：**
- `enabled: Bool` - 是否启用等宽（默认 true）

```swift
Text("Monospaced Text").monospaced()
Text("Regular Text").monospaced(false)
```

---

## 颜色与样式修饰符

### `.foregroundColor(_:)`
设置文本前景色。

**参数：**
- `color: Color?` - 颜色值

```swift
// 系统颜色
Text("Primary").foregroundColor(.primary)       // 主色调
Text("Secondary").foregroundColor(.secondary)   // 次要色调
Text("Red").foregroundColor(.red)
Text("Blue").foregroundColor(.blue)
Text("Green").foregroundColor(.green)

// 自定义颜色
Text("Custom RGB").foregroundColor(Color(red: 0.2, green: 0.6, blue: 0.8))
Text("Custom Hex").foregroundColor(Color(hex: 0x3498DB))

// 动态颜色
Text("Adaptive").foregroundColor(Color(UIColor.label))
```

### `.foregroundStyle(_:)` (iOS 15+)
设置前景样式，支持渐变和材质。

**参数：**
- `style: any ShapeStyle` - 样式对象

```swift
// 线性渐变
Text("Linear Gradient")
    .font(.largeTitle)
    .foregroundStyle(
        LinearGradient(
            colors: [.red, .orange, .yellow],
            startPoint: .leading,
            endPoint: .trailing
        )
    )

// 径向渐变
Text("Radial Gradient")
    .font(.largeTitle)
    .foregroundStyle(
        RadialGradient(
            colors: [.blue, .purple, .pink],
            center: .center,
            startRadius: 0,
            endRadius: 50
        )
    )

// 角度渐变
Text("Angular Gradient")
    .font(.largeTitle)
    .foregroundStyle(
        AngularGradient(
            colors: [.red, .yellow, .green, .blue, .purple, .red],
            center: .center
        )
    )

// 材质样式（iOS 15+）
Text("Material").foregroundStyle(.regularMaterial)
Text("Hierarchical").foregroundStyle(.secondary)
```

### `.accentColor(_:)`
设置强调色（影响链接等交互元素）。

**参数：**
- `accentColor: Color?` - 强调色

```swift
Text("[链接文本](https://apple.com)")
    .accentColor(.orange)
```

---

## 文本格式修饰符

### `.bold()`
设置文本为粗体。

```swift
Text("Bold Text").bold()

// 等同于
Text("Bold Text").fontWeight(.bold)
```

### `.italic()`
设置文本为斜体。

```swift
Text("Italic Text").italic()
```

### `.underline(_:color:)`
添加下划线。

**参数：**
- `active: Bool` - 是否激活（默认 true）
- `color: Color?` - 下划线颜色

```swift
Text("Underlined").underline()
Text("Colored Underline").underline(true, color: .red)
Text("Conditional Underline").underline(isActive, color: .blue)
```

### `.strikethrough(_:color:)`
添加删除线。

**参数：**
- `active: Bool` - 是否激活（默认 true）
- `color: Color?` - 删除线颜色

```swift
Text("Strikethrough").strikethrough()
Text("Colored Strikethrough").strikethrough(true, color: .red)
```

### `.kerning(_:)`
设置字符间距（影响字符之间的空间）。

**参数：**
- `kerning: CGFloat` - 字符间距值

```swift
Text("Normal Kerning")
Text("Loose Kerning").kerning(3.0)    // 增加间距
Text("Tight Kerning").kerning(-1.0)   // 减少间距
```

### `.tracking(_:)`
设置字符跟踪间距（影响整体文本密度）。

**参数：**
- `tracking: CGFloat` - 跟踪间距值

```swift
Text("Normal Tracking")
Text("Loose Tracking").tracking(5.0)   // 增加跟踪间距
Text("Tight Tracking").tracking(-2.0)  // 减少跟踪间距

// kerning vs tracking 对比
VStack {
    Text("Kerning Example").kerning(2.0)    // 只影响字符间距
    Text("Tracking Example").tracking(2.0)  // 影响整体文本密度
}
```

### `.baselineOffset(_:)`
设置基线偏移。

**参数：**
- `baselineOffset: CGFloat` - 基线偏移值

```swift
HStack(alignment: .firstTextBaseline) {
    Text("Normal")
    Text("Superscript").baselineOffset(8).font(.caption)
    Text("Subscript").baselineOffset(-8).font(.caption)
}
```

---

## 布局相关修饰符

### `.multilineTextAlignment(_:)`
设置多行文本对齐方式。

**参数：**
- `alignment: TextAlignment` - 对齐方式

```swift
let longText = "这是一段很长的文本内容，用来演示多行文本的对齐效果。"

VStack {
    Text(longText)
        .multilineTextAlignment(.leading)   // 左对齐
        .frame(width: 200)
    
    Text(longText)
        .multilineTextAlignment(.center)    // 居中对齐
        .frame(width: 200)
    
    Text(longText)
        .multilineTextAlignment(.trailing)  // 右对齐
        .frame(width: 200)
}
```

### `.lineLimit(_:)`
限制文本显示行数。

**参数：**
- `number: Int?` - 最大行数（nil 为不限制）

```swift
let text = "这是一段很长的文本，正常情况下会显示多行内容。"

Text(text).lineLimit(1)      // 限制为1行
Text(text).lineLimit(3)      // 限制为3行
Text(text).lineLimit(nil)    // 不限制行数
```

### `.lineLimit(_:reservesSpace:)` (iOS 16+)
限制行数并可选择是否保留空间。

**参数：**
- `limit: Int` - 行数限制
- `reservesSpace: Bool` - 是否保留空间

```swift
VStack {
    Text("短文本")
        .lineLimit(3, reservesSpace: true)   // 保留3行空间
        .background(Color.gray.opacity(0.2))
    
    Text("另一个短文本")
        .lineLimit(3, reservesSpace: false)  // 不保留多余空间
        .background(Color.blue.opacity(0.2))
}
```

### `.truncationMode(_:)`
设置文本截断模式。

**参数：**
- `mode: Text.TruncationMode` - 截断模式

**截断模式：**
```swift
let longText = "这是一段很长的文本内容，演示不同的截断效果。"

VStack {
    Text(longText)
        .lineLimit(1)
        .truncationMode(.tail)      // 尾部截断：开头...
    
    Text(longText)
        .lineLimit(1)
        .truncationMode(.head)      // 头部截断：...结尾
    
    Text(longText)
        .lineLimit(1)
        .truncationMode(.middle)    // 中间截断：开头...结尾
}
.frame(width: 200)
```

### `.minimumScaleFactor(_:)`
设置最小缩放因子以适应空间。

**参数：**
- `factor: CGFloat` - 最小缩放因子（0.0-1.0）

```swift
Text("这是一段可能需要缩放的长文本")
    .frame(width: 100)
    .minimumScaleFactor(0.5)     // 最小缩放到50%
    .border(Color.red)

Text("不缩放的文本")
    .frame(width: 100)
    .border(Color.blue)
```

### `.allowsTightening(_:)`
允许通过减小字符间距来适应空间。

**参数：**
- `flag: Bool` - 是否允许紧缩

```swift
let tightText = "允许字符紧缩以适应空间的文本内容"

VStack {
    Text(tightText)
        .frame(width: 200)
        .allowsTightening(true)    // 允许紧缩
        .border(Color.green)
    
    Text(tightText)
        .frame(width: 200)
        .allowsTightening(false)   // 不允许紧缩
        .border(Color.red)
}
```

### `.fixedSize(horizontal:vertical:)`
防止文本被压缩。

**参数：**
- `horizontal: Bool` - 水平方向是否固定
- `vertical: Bool` - 垂直方向是否固定

```swift
HStack {
    Text("固定大小的长文本内容")
        .fixedSize(horizontal: true, vertical: false)
        .background(Color.yellow.opacity(0.3))
    
    Text("普通文本")
        .background(Color.blue.opacity(0.3))
}
.frame(width: 200)
```

---

## 行为控制修饰符

### `.textSelection(_:)` (iOS 15+)
启用文本选择功能。

**参数：**
- `selectability: TextSelectability` - 选择能力

```swift
Text("这段文本可以被选择和复制")
    .textSelection(.enabled)

Text("这段文本不能被选择")
    .textSelection(.disabled)
```

### `.textCase(_:)`
设置文本大小写转换。

**参数：**
- `textCase: Text.Case?` - 大小写选项

```swift
Text("uppercase text").textCase(.uppercase)  // UPPERCASE TEXT
Text("LOWERCASE TEXT").textCase(.lowercase)  // lowercase text
Text("Normal Case").textCase(nil)            // Normal Case
```

### `.autocorrectionDisabled(_:)` (iOS 16+)
禁用自动更正（主要用于可编辑文本）。

**参数：**
- `disabled: Bool` - 是否禁用

```swift
Text("禁用自动更正的文本")
    .autocorrectionDisabled(true)
```

### `.textInputAutocapitalization(_:)` (iOS 15+)
设置自动大写化。

**参数：**
- `style: TextInputAutocapitalization` - 自动大写样式

```swift
Text("sentences").textInputAutocapitalization(.sentences)  // 句首大写
Text("words").textInputAutocapitalization(.words)          // 词首大写
Text("characters").textInputAutocapitalization(.characters) // 全部大写
Text("never").textInputAutocapitalization(.never)          // 不自动大写
```

### `.flipsForRightToLeftLayoutDirection(_:)`
设置在从右到左布局中是否翻转。

**参数：**
- `enabled: Bool` - 是否启用翻转

```swift
Text("→ 箭头方向")
    .flipsForRightToLeftLayoutDirection(true)

Text("← 箭头方向")
    .flipsForRightToLeftLayoutDirection(false)
```

---

## 可访问性修饰符

### `.accessibilityLabel(_:)`
设置可访问性标签。

**参数：**
- `label: Text` - 标签文本

```swift
Text("👍")
    .font(.largeTitle)
    .accessibilityLabel("点赞")

Text("$99.99")
    .accessibilityLabel("价格九十九美元九十九美分")
```

### `.accessibilityValue(_:)`
设置可访问性值。

**参数：**
- `value: Text` - 值描述

```swift
Text("★★★★☆")
    .accessibilityLabel("评分")
    .accessibilityValue("四星，满分五星")
```

### `.accessibilityHint(_:)`
设置可访问性提示。

**参数：**
- `hint: Text` - 提示信息

```swift
Text("查看详情")
    .accessibilityHint("双击以查看完整信息")
```

### `.accessibilityHidden(_:)`
设置是否对可访问性隐藏。

**参数：**
- `hidden: Bool` - 是否隐藏

```swift
Text("装饰性文本")
    .accessibilityHidden(true)    // 屏幕阅读器会忽略

Text("重要信息")
    .accessibilityHidden(false)   // 屏幕阅读器会读取
```

### `.accessibilityAddTraits(_:)`
添加可访问性特征。

**参数：**
- `traits: AccessibilityTraits` - 特征集合

```swift
Text("按钮文本")
    .accessibilityAddTraits(.isButton)

Text("标题文本")
    .accessibilityAddTraits(.isHeader)

Text("链接文本")
    .accessibilityAddTraits(.isLink)
```

### `.accessibilityRemoveTraits(_:)`
移除可访问性特征。

**参数：**
- `traits: AccessibilityTraits` - 要移除的特征

```swift
Text("普通文本")
    .accessibilityAddTraits(.isButton)
    .accessibilityRemoveTraits(.isButton)
```

### `.privacySensitive(_:)` (iOS 15+)
标记隐私敏感内容。

**参数：**
- `sensitive: Bool` - 是否敏感

```swift
Text("用户真实姓名")
    .privacySensitive(true)     // 在屏幕录制时会被模糊化

Text("公开信息")
    .privacySensitive(false)
```

---

## 动画相关修饰符

### `.contentTransition(_:)` (iOS 16+)
设置内容变化的转换动画。

**参数：**
- `transition: ContentTransition` - 转换类型

```swift
@State private var number = 0

Text("\(number)")
    .font(.largeTitle)
    .contentTransition(.numericText())    // 数字变化动画
    .onTapGesture {
        withAnimation(.easeInOut) {
            number += 1
        }
    }

// 其他转换类型
Text(text)
    .contentTransition(.opacity)          // 透明度转换
    .contentTransition(.identity)         // 无转换
```

### `.animation(_:value:)`
为特定值变化添加动画。

**参数：**
- `animation: Animation?` - 动画类型
- `value: V` - 监视的值

```swift
@State private var isHighlighted = false

Text("动画文本")
    .foregroundColor(isHighlighted ? .red : .blue)
    .scaleEffect(isHighlighted ? 1.2 : 1.0)
    .animation(.easeInOut(duration: 0.3), value: isHighlighted)
    .onTapGesture {
        isHighlighted.toggle()
    }
```

### `.transition(_:)`
设置视图出现/消失的转换动画。

**参数：**
- `t: AnyTransition` - 转换动画

```swift
@State private var showText = false

VStack {
    if showText {
        Text("淡入文本")
            .transition(.opacity)
        
        Text("滑入文本")
            .transition(.slide)
        
        Text("缩放文本")
            .transition(.scale)
    }
    
    Button("切换显示") {
        withAnimation {
            showText.toggle()
        }
    }
}
```

---

## 环境与系统修饰符

### `.environment(_:_:)`
设置环境值。

```swift
Text("大字体文本")
    .environment(\.sizeCategory, .extraLarge)

Text("深色模式文本")
    .environment(\.colorScheme, .dark)

Text("简体中文")
    .environment(\.locale, Locale(identifier: "zh-Hans"))
```

### `.dynamicTypeSize(_:)` (iOS 15+)
限制动态字体大小范围。

**参数：**
- `range: ClosedRange<DynamicTypeSize>` - 字体大小范围

```swift
Text("限制字体大小范围")
    .dynamicTypeSize(.medium ... .accessibility1)

Text("固定字体大小")
    .dynamicTypeSize(.large ... .large)
```

### `.textScale(_:)` (iOS 17+)
设置文本相对缩放。

**参数：**
- `scale: Text.Scale` - 缩放级别

```swift
Text("默认大小")
    .textScale(.default)

Text("次要大小")
    .textScale(.secondary)
```

### `.redacted(reason:)`
设置编辑状态。

**参数：**
- `reason: RedactionReasons` - 编辑原因

```swift
Text("敏感信息内容")
    .redacted(reason: .privacy)      // 隐私编辑

Text("加载中内容")
    .redacted(reason: .placeholder)  // 占位符编辑

Text("无编辑")
    .redacted(reason: [])
```

---

## 语音相关修饰符（VoiceOver）

### `.speechAlwaysIncludesPunctuation(_:)` (iOS 15+)
设置语音是否包含标点符号。

**参数：**
- `includesPunctuation: Bool` - 是否包含标点

```swift
Text("Hello, World!")
    .speechAlwaysIncludesPunctuation(true)   // 会读出逗号和感叹号
```

### `.speechSpellsOutCharacters(_:)` (iOS 15+)
设置是否逐字符拼读。

**参数：**
- `spellsOutCharacters: Bool` - 是否拼读

```swift
Text("ABC123")
    .speechSpellsOutCharacters(true)  // 会逐个字符读出
```

### `.speechAdjustedPitch(_:)` (iOS 15+)
调整语音音调。

**参数：**
- `pitch: Double` - 音调值（0.5-2.0）

```swift
Text("低音调")
    .speechAdjustedPitch(0.7)

Text("高音调")
    .speechAdjustedPitch(1.5)
```

### `.speechAnnouncementsQueued(_:)` (iOS 15+)
设置语音播报是否排队。

**参数：**
- `queue: Bool` - 是否排队播报

```swift
Text("紧急通知")
    .speechAnnouncementsQueued(false)  // 立即播报，打断当前语音

Text("普通通知")
    .speechAnnouncementsQueued(true)   // 排队等待播报
```

---

## Text 组合与链接

### Text 连接操作符 `+`
可以将多个 Text 视图组合成一个。

```swift
// 基础组合
Text("Hello, ") + Text("World!")

// 不同样式组合
Text("普通文本 ")
    .foregroundColor(.black) +
Text("粗体文本 ")
    .bold()
    .foregroundColor(.red) +
Text("斜体文本")
    .italic()
    .foregroundColor(.blue)

// 复杂样式组合
let combinedText = 
    Text("标题部分")
        .font(.title)
        .foregroundColor(.primary) +
    Text("\n") +
    Text("副标题部分")
        .font(.headline)
        .foregroundColor(.secondary) +
    Text("\n") +
    Text("正文部分")
        .font(.body)
        .foregroundColor(.primary)

Text(combinedText)
```

### 处理链接
SwiftUI Text 自动识别 Markdown 链接：

```swift
// 基础链接
Text("[苹果官网](https://apple.com)")

// 自定义链接处理
Text("[点击这里](custom://action)")
    .environment(\.openURL, OpenURLAction { url in
        if url.scheme == "custom" {
            // 处理自定义 URL
            print("处理自定义链接: \(url)")
            return .handled
        }
        return .systemAction
    })

// 链接样式自定义
Text("[自定义样式链接](https://example.com)")
    .accentColor(.orange)
    .underline()
```

---

## 综合应用示例

### 基础文本样式库
```swift
struct TextStyleExamples: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // 标题层级
                Group {
                    Text("Large Title")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Title")
                        .font(.title)
                        .fontWeight(.semibold)
                    
                    Text("Headline")
                        .font(.headline)
                        .fontWeight(.medium)
                    
                    Text("Body Text")
                        .font(.body)
                    
                    Text("Caption")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                
                // 装饰样式
                Group {
                    Text("Bold Text").bold()
                    Text("Italic Text").italic()
                    Text("Underlined Text").underline()
                    Text("Strikethrough Text").strikethrough()
                    
                    Text("Combined Styles")
                        .bold()
                        .italic()
                        .underline(true, color: .red)
                }
                
                Divider()
                
                // 颜色样式
                Group {
                    Text("Primary Color").foregroundColor(.primary)
                    Text("Secondary Color").foregroundColor(.secondary)
                    Text("Red Text").foregroundColor(.red)
                    Text("Blue Text").foregroundColor(.blue)
                    
                    Text("Gradient Text")
                        .font(.title)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.purple, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                }
            }
            .padding()
        }
    }
}
```

### 响应式文本布局
```swift
struct ResponsiveTextExample: View {
    let sampleText = "这是一段演示响应式布局的示例文本，展示如何在不同空间约束下自动调整显示效果。"
    
    var body: some View {
        VStack(spacing: 20) {
            // 自适应缩放
            Text(sampleText)
                .font(.title2)
                .minimumScaleFactor(0.6)
                .lineLimit(2)
                .frame(width: 200, height: 60)
                .border(Color.red)
            
            // 允许紧缩
            Text(sampleText)
                .font(.body)
                .allowsTightening(true)
                .lineLimit(3)
                .frame(width: 180)
                .border(Color.green)
            
            // 不同截断模式
            VStack {
                Text(sampleText)
                    .truncationMode(.head)
                    .lineLimit(1)
                    .frame(width: 250)
                
                Text(sampleText)
                    .truncationMode(.middle)
                    .lineLimit(1)
                    .frame(width: 250)
                
                Text(sampleText)
                    .truncationMode(.tail)
                    .lineLimit(1)
                    .frame(width: 250)
            }
            .border(Color.blue)
        }
        .padding()
    }
}
```

### 数据格式化展示
```swift
struct FormattedTextExample: View {
    let price = 1234.56
    let date = Date()
    let percentage = 0.785
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            // 货币格式化
            HStack {
                Text("价格:")
                Text(price, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
            }
            
            HStack {
                Text("人民币:")
                Text(price, format: .currency(code: "CNY"))
                    .fontWeight(.semibold)
            }
            
            // 数字格式化
            HStack {
                Text("数量:")
                Text(Int(price), format: .number)
                    .monospacedDigit()
            }
            
            // 百分比格式化
            HStack {
                Text("完成度:")
                Text(percentage, format: .percent.precision(.fractionLength(1)))
                    .foregroundColor(.green)
            }
            
            // 日期格式化
            VStack(alignment: .leading) {
                Text("日期格式:")
                Text(date, style: .date)
                Text(date, style: .time)
                Text(date, format: .dateTime.weekday(.wide).day().month(.wide))
            }
            
            // 相对时间
            HStack {
                Text("相对时间:")
                Text(date.addingTimeInterval(-3600), style: .relative)
            }
        }
        .padding()
    }
}
```

### 交互式文本示例
```swift
struct InteractiveTextExample: View {
    @State private var isSelected = false
    @State private var textScale: CGFloat = 1.0
    @State private var textColor: Color = .primary
    
    var body: some View {
        VStack(spacing: 30) {
            // 可选择文本
            Text("这段文本可以被选择和复制。长按可以看到选择菜单。")
                .textSelection(.enabled)
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
            
            // 交互式动画文本
            Text("点击我改变样式")
                .font(.title2)
                .foregroundColor(textColor)
                .scaleEffect(textScale)
                .animation(.easeInOut(duration: 0.3), value: textColor)
                .animation(.easeInOut(duration: 0.3), value: textScale)
                .onTapGesture {
                    textColor = textColor == .primary ? .red : .primary
                    textScale = textScale == 1.0 ? 1.2 : 1.0
                }
            
            // 链接文本
            Text("访问 [苹果官网](https://apple.com) 了解更多信息")
                .accentColor(.blue)
            
            // 带上下文菜单的文本
            Text("长按显示菜单")
                .contextMenu {
                    Button("复制") {
                        // 复制操作
                    }
                    Button("分享") {
                        // 分享操作
                    }
                }
        }
        .padding()
    }
}
```

### 可访问性优化示例
```swift
struct AccessibleTextExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 图标文本的可访问性
            HStack {
                Text("⭐️⭐️⭐️⭐️⭐️")
                    .accessibilityLabel("五星评价")
                    .accessibilityHint("产品获得满分评价")
                
                Text("4.8/5.0")
                    .accessibilityLabel("评分四点八分，满分五分")
            }
            
            // 价格信息的可访问性
            Text("$29.99")
                .font(.title)
                .fontWeight(.bold)
                .accessibilityLabel("价格二十九美元九十九美分")
            
            // 状态信息
            Text("✅ 已完成")
                .accessibilityLabel("任务已完成")
                .accessibilityAddTraits(.isButton)
            
            // 隐私敏感信息
            Text("用户ID: 1234567890")
                .font(.monospaced(.body)())
                .privacySensitive(true)
                .accessibilityLabel("用户标识符")
            
            // 装饰性文本（对屏幕阅读器隐藏）
            Text("✨ 装饰性图标 ✨")
                .accessibilityHidden(true)
            
            Text("重要内容信息")
                .accessibilityAddTraits(.isHeader)
        }
        .padding()
    }
}
```

### 多语言和本地化文本
```swift
struct LocalizedTextExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基础本地化文本（需要在 Localizable.strings 中定义）
            Text("welcome_message")
            
            // 带参数的本地化文本
            let userName = "张三"
            Text("hello_user \(userName)")
            
            // 多元化本地化（根据数量变化）
            let itemCount = 5
            Text("^[\(itemCount) item](inflect: true)")
            
            // 不同语言环境的文本
            Group {
                Text("Hello, World!")
                    .environment(\.locale, Locale(identifier: "en"))
                
                Text("你好，世界！")
                    .environment(\.locale, Locale(identifier: "zh-Hans"))
                
                Text("こんにちは、世界！")
                    .environment(\.locale, Locale(identifier: "ja"))
            }
            
            // RTL 语言支持
            Text("النص العربي")
                .environment(\.layoutDirection, .rightToLeft)
        }
        .padding()
    }
}
```

### 高级文本效果
```swift
struct AdvancedTextEffects: View {
    @State private var animateGradient = false
    
    var body: some View {
        VStack(spacing: 30) {
            // 动画渐变文本
            Text("动画渐变效果")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundStyle(
                    LinearGradient(
                        colors: [.red, .orange, .yellow, .green, .blue, .purple],
                        startPoint: animateGradient ? .leading : .trailing,
                        endPoint: animateGradient ? .trailing : .leading
                    )
                )
                .onAppear {
                    withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                        animateGradient.toggle()
                    }
                }
            
            // 阴影文本效果
            Text("阴影文本效果")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .shadow(color: .black, radius: 2, x: 2, y: 2)
                .padding()
                .background(
                    LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .cornerRadius(10)
            
            // 描边文本效果（通过叠加实现）
            ZStack {
                Text("描边文本")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.black)
                    .offset(x: -1, y: -1)
                
                Text("描边文本")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.black)
                    .offset(x: 1, y: 1)
                
                Text("描边文本")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            
            // 霓虹灯效果
            Text("霓虹灯效果")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.cyan)
                .shadow(color: .cyan, radius: 10)
                .shadow(color: .cyan, radius: 20)
                .shadow(color: .cyan, radius: 30)
        }
        .padding()
        .background(Color.black)
    }
}
```

---

## 性能优化建议

### 1. 避免过度嵌套修饰符
```swift
// ❌ 性能较差：过多修饰符链
Text("示例")
    .font(.body)
    .foregroundColor(.primary)
    .multilineTextAlignment(.center)
    .lineLimit(3)
    .minimumScaleFactor(0.8)
    .allowsTightening(true)
    .textSelection(.enabled)
    .padding()
    .background(Color.gray.opacity(0.1))
    .cornerRadius(8)
    .shadow(radius: 2)

// ✅ 性能更好：合理使用修饰符
Text("示例")
    .font(.body)
    .foregroundColor(.primary)
    .multilineTextAlignment(.center)
    .lineLimit(3)
    .padding()
```

### 2. 优化文本组合
```swift
// ❌ 性能较差：多个独立 Text 视图
HStack {
    Text("标题: ")
    Text(title).bold()
    Text(" - ")
    Text(subtitle).italic()
}

// ✅ 性能更好：使用 Text 组合
Text("标题: ") +
Text(title).bold() +
Text(" - ") +
Text(subtitle).italic()
```

### 3. 缓存复杂格式化
```swift
// ❌ 重复计算格式化
struct ContentView: View {
    let price: Double
    
    var body: some View {
        VStack {
            Text(price, format: .currency(code: "USD"))  // 每次重建都会格式化
            Text(price, format: .currency(code: "USD"))  // 重复格式化
        }
    }
}

// ✅ 缓存格式化结果
struct ContentView: View {
    let price: Double
    
    private var formattedPrice: String {
        price.formatted(.currency(code: "USD"))
    }
    
    var body: some View {
        VStack {
            Text(formattedPrice)  // 使用缓存的格式化结果
            Text(formattedPrice)
        }
    }
}
```

### 4. 定义可复用的文本样式
```swift
// 扩展 Text 以支持自定义样式
extension Text {
    func headlineStyle() -> some View {
        self
            .font(.headline)
            .fontWeight(.semibold)
            .foregroundColor(.primary)
    }
    
    func bodyStyle() -> some View {
        self
            .font(.body)
            .foregroundColor(.secondary)
            .lineLimit(nil)
    }
    
    func captionStyle() -> some View {
        self
            .font(.caption)
            .foregroundColor(.tertiary)
    }
}

// 使用
struct ContentView: View {
    var body: some View {
        VStack {
            Text("标题").headlineStyle()
            Text("正文内容").bodyStyle()
            Text("说明文字").captionStyle()
        }
    }
}
```

---

## 常见问题解答

### Q: 如何创建多色彩文本？
```swift
// 方法1: 使用 Text 组合
Text("红色").foregroundColor(.red) +
Text("蓝色").foregroundColor(.blue)

// 方法2: 使用渐变
Text("渐变文本")
    .foregroundStyle(
        LinearGradient(
            colors: [.red, .blue],
            startPoint: .leading,
            endPoint: .trailing
        )
    )

// 方法3: 使用 AttributedString
var attributed = AttributedString("多色文本")
attributed[attributed.startIndex..<attributed.index(attributed.startIndex, offsetBy: 2)].foregroundColor = .red
attributed[attributed.index(attributed.startIndex, offsetBy: 2)..<attributed.endIndex].foregroundColor = .blue
Text(attributed)
```

### Q: 如何让文本自动适应容器？
```swift
Text("自适应文本内容")
    .font(.title)
    .minimumScaleFactor(0.5)        // 允许缩放到50%
    .allowsTightening(true)         // 允许字符紧缩
    .lineLimit(1)                   // 限制为一行
    .frame(maxWidth: .infinity)     // 占用全部可用宽度
```

### Q: 如何处理长文本的显示？
```swift
let longText = "这是一段很长的文本内容..."

// 截断显示
Text(longText)
    .lineLimit(2)
    .truncationMode(.tail)

// 自适应显示
Text(longText)
    .minimumScaleFactor(0.7)
    .allowsTightening(true)

// 滚动显示
ScrollView {
    Text(longText)
        .fixedSize(horizontal: false, vertical: true)
}
```

### Q: 如何实现富文本效果？
```swift
// 使用 AttributedString
var richText = AttributedString("富文本示例")
richText.font = .title
richText.foregroundColor = .blue

var boldPart = AttributedString("粗体部分")
boldPart.inlinePresentationIntent = .stronglyEmphasized
richText.append(boldPart)

Text(richText)

// 或使用 Markdown（iOS 15+）
Text("这是 **粗体** 和 *斜体* 文本")
```

### Q: 如何自定义链接的外观和行为？
```swift
Text("[自定义链接](custom://action)")
    .accentColor(.orange)                // 链接颜色
    .underline()                         // 添加下划线
    .environment(\.openURL, OpenURLAction { url in
        if url.scheme == "custom" {
            // 处理自定义 URL
            handleCustomAction(url)
            return .handled
        }
        return .systemAction             // 使用系统默认处理
    })
```

---

## 总结

SwiftUI 的 Text 组件提供了强大而灵活的文本显示和格式化能力。通过合理使用各种修饰符，可以创建出专业、美观且用户友好的文本界面。

### 关键要点：

1. **初始化方式** - 支持字符串、格式化数值、日期和 AttributedString
2. **修饰符分类** - 8大类修饰符覆盖所有文本自定义需求
3. **性能优化** - 避免过度使用修饰符，合理组合和缓存
4. **可访问性** - 为所有用户提供良好的体验
5. **响应式设计** - 确保在不同设备和环境下正确显示
6. **本地化支持** - 支持多语言和国际化需求

掌握这些知识将帮助你创建出专业级的 iOS 应用文本界面！