---
title: "OmenTextField 自定义文本输入控件"
description: "OmenTextField 是一个基于 SwiftUI 的自定义文本输入控件，支持动态尺寸调整、焦点状态管理、多种边框样式和丰富的自定义选项。"
pubDate: 2026-05-29
category: "view"
tags: [Swift, API]
draft: false
---
# 🚀  OmenTextField 自定义文本输入控件

# OmenTextField API 文档

## 概述

OmenTextField 是一个基于 SwiftUI 的自定义文本输入控件，支持动态尺寸调整、焦点状态管理、多种边框样式和丰富的自定义选项。

## 基础初始化

### 构造函数

```swift
    public init(
        text: Binding<String>,
        isFocused: Binding<Bool> = .constant(false),
        minWidth: CGFloat = 60,
        maxWidth: CGFloat = 400,
        textContainerInset: UIEdgeInsets = .zero,
        textBackGroundColor: Color = Color.clear,
        font: Font = .body,
        fontSize: CGFloat = 16,
        returnKeyType: OmenTextField.ReturnKeyType = .default,
        returnTypeListener: (() -> Bool)? = nil,
        onCommit: (() -> Void)? = nil,
        borderStyle: BorderStyle = .rectangle,
        focusedBorderColor: Binding<Color> = .constant(.yellow),
        unfocusedBorderColor: Binding<Color> = .constant(.yellow),
        backgroundColor: Binding<Color> = .constant(.clear),
        textAlignment: NSTextAlignment = .left,
        cornerRadius: CGFloat = 10,
        focusedStrokeWidth: Binding<CGFloat> = .constant(2),
        unfocusedStrokeWidth: Binding<CGFloat> = .constant(1),
        focusedTextColor: Binding<Color> = .constant(.white),
        unfocusedTextColor: Binding<Color> = .constant(.white),
        contentPadding: EdgeInsets = EdgeInsets(
            top: 2,
            leading: 4,
            bottom: 2,
            trailing: 4
        )
    )
```

- 参数 returnKeyType `` 设置键盘的\n  ``
- 参数 returnTypeListener `` 设置键盘的\n 触发的事件 ``
- 参数 onCommit `` 焦点结束时的回调 ``

### 基本使用示例

```swift
@State private var text = ""
@State private var isFocused = false

OmenTextField(
    text: $text,
    isFocused: $isFocused
)
```

## 链式调用方法

### 边框样式

#### `borderStyle(_:)`

设置边框样式

```swift
.borderStyle(.rectangle)    // 矩形边框
.borderStyle(.roundRect)    // 圆角矩形边框
.borderStyle(.halfRect)     // 半边框（底部和两侧下半部分）
```

#### `borderColor(_:unfocusedBorderColor:)`

设置边框颜色

```swift
.borderColor(.constant(.blue), unfocusedBorderColor: .constant(.gray))
```

#### `strokeWidth(_:unfocusedStrokeWidth:)`

设置边框宽度

```swift
.strokeWidth(.constant(2.0), unfocusedStrokeWidth: .constant(1.0))
```

#### `cornerRadius(_:)`

设置圆角半径（仅在 roundRect 样式下生效）

```swift
.cornerRadius(8.0)
```

### 背景和颜色

#### `backgroundColor(_:)`

设置背景颜色

```swift
.backgroundColor(.constant(.white))
```

#### `textBackGroundColor(textBackGroundColor:)`

设置文本背景颜色

```swift
.textBackGroundColor(textBackGroundColor: .clear)
```

#### `textColor(focusedTextColor:unFocusedTextColor:)`

设置文本颜色

```swift
.textColor(focusedTextColor: .constant(.black), unFocusedTextColor: .constant(.gray))
```

### 尺寸和布局

#### `widthRange(min:max:)`

设置宽度范围

```swift
.widthRange(min: 100, max: 300)
```

#### `contentPadding(_:)`

设置内容边距

```swift
.contentPadding(8.0)  // 四周相同边距
.contentPadding(EdgeInsets(top: 4, leading: 8, bottom: 4, trailing: 8))  // 自定义边距
```

#### `noPadding()`

移除所有边距

```swift
.noPadding()
```

#### `textContainerInset(_:)`

设置文本容器内边距

```swift
.textContainerInset(4.0)  // 四周相同
.textContainerInset(UIEdgeInsets(top: 2, left: 4, bottom: 2, right: 4))  // 自定义
```

### 文本样式

#### `font(font:)`

设置字体

```swift
.font(.title)
.font(.custom("Arial", size: 16))
```

#### `fontSize(_:)`

设置字体大小

```swift
.fontSize(18)
```

#### `textAlignment(_:)`

设置文本对齐方式

```swift
.textAlignment(.center)  // .left, .center, .right, .justified, .natural
```

## 枚举类型

### BorderStyle

边框样式枚举

```swift
public enum BorderStyle {
    case rectangle    // 矩形边框
    case roundRect    // 圆角矩形边框
    case halfRect     // 半边框
}
```

### ReturnKeyType

回车键类型枚举

```swift
public enum ReturnKeyType: String, CaseIterable {
    case done        // 完成
    case next        // 下一个
    case `default`   // 默认
    case `continue`  // 继续
    case go          // 前往
    case search      // 搜索
    case send        // 发送
}
```

## 键盘适配

### `adaptToKeyboard()`

为视图添加键盘适配功能

```swift
VStack {
    OmenTextField(text: $text)
    // 其他视图
}
.adaptToKeyboard()  // 自动适配键盘弹出/收起
```

## 完整使用示例

```swift
struct ContentView: View {
    @State private var text = ""
    @State private var isFocused = false
    @State private var borderColor = Color.gray
    @State private var backgroundColor = Color.white
    
    var body: some View {
        VStack {
            OmenTextField(
                text: $text,
                isFocused: $isFocused,
                returnKeyType: .done,
                onCommit: {
                    print("用户完成输入")
                }
            )
            .borderStyle(.roundRect)
            .borderColor(.constant(.blue), unfocusedBorderColor: .constant(.gray))
            .backgroundColor(.constant(.white))
            .cornerRadius(12)
            .strokeWidth(.constant(2), unfocusedStrokeWidth: .constant(1))
            .textColor(focusedTextColor: .constant(.black), unFocusedTextColor: .constant(.gray))
            .fontSize(16)
            .textAlignment(.left)
            .widthRange(min: 100, max: 300)
            .contentPadding(8)
            
            Spacer()
        }
        .adaptToKeyboard()
    }
}
```

## 主要特性

- ✅ **动态尺寸调整**：根据文本内容自动调整宽度和高度
- ✅ **焦点状态管理**：支持焦点状态的双向绑定
- ✅ **多种边框样式**：矩形、圆角矩形、半边框
- ✅ **丰富的自定义选项**：颜色、字体、对齐、边距等
- ✅ **键盘适配**：自动处理键盘弹出时的布局调整
- ✅ **链式调用**：支持方法链式调用，使用便捷
- ✅ **回调支持**：支持完成输入时的回调处理

## 注意事项

1. 文本输入控件基于 `UITextView` 实现，支持多行文本
2. 焦点状态变化会自动触发相应的视觉效果更新
3. 使用 `adaptToKeyboard()` 修饰符可以自动处理键盘遮挡问题
4. 边框样式 `.halfRect` 仅绘制底边和左右两侧的下半部分
5. 所有颜色和尺寸参数都支持动态绑定，可以实时响应状态变化

```

//
//  OmenTextFieldRep.swift
//  wscanner
//
//  Created by yunshen on 2025/7/8.
//

import SwiftUI

extension UIFont {
    static public func fontToUIFont(from font: Font) -> UIFont {
        let style: UIFont.TextStyle

        switch font {
        case .largeTitle: style = .largeTitle
        case .title: style = .title1
        case .title2: style = .title2
        case .title3: style = .title3
        case .headline: style = .headline
        case .subheadline: style = .subheadline
        case .callout: style = .callout
        case .caption: style = .caption1
        case .caption2: style = .caption2
        case .footnote: style = .footnote
        case .body: style = .body
        default: style = .body
        }
        return UIFont.preferredFont(forTextStyle: style)
    }
}

struct OmenTextFieldRep: UIViewRepresentable {
    @Binding var text: String
    var isFocused: Binding<Bool>?
    @Binding var height: CGFloat
    @Binding var width: CGFloat
    var maxWidth: CGFloat
    var textColor: UIColor
    var textContainerInset: UIEdgeInsets = .zero
    var textBackGroundColor: Color = .clear
    var font: Font = .body
    var fontSize: CGFloat = 16
    var returnKeyType: OmenTextField.ReturnKeyType
    var onCommit: (() -> Void)?
    var textAlignment: NSTextAlignment = .left
    var returnTypeListener: (() -> Bool)? = nil

    func makeUIView(context: Context) -> UITextView {
        let view = CustomUITextView()
        view.font = UIFont.fontToUIFont(from: font).withSize(fontSize)
        view.backgroundColor = UIColor(textBackGroundColor)
        view.textColor = textColor
        view.delegate = context.coordinator
        view.textContainerInset = textContainerInset
        view.textContainer.lineFragmentPadding = 0
        view.keyboardDismissMode = .onDrag
        view.returnKeyType = returnKeyType.uiReturnKey
        view.textAlignment = textAlignment

        // 设置coordinator引用
        context.coordinator.textView = view

        DispatchQueue.main.async {
            view.text = text
            width = view.getTextViewWidth(
                textContainerInset: textContainerInset
            )
            height = view.getTextViewHeight(
                maxFixeWidth: maxWidth,
                textContainerInset: textContainerInset
            )
        }

        return view
    }

    func updateUIView(_ view: UITextView, context: Context) {
        // 防止在更新过程中重复触发
        guard !context.coordinator.isUpdating else { return }

        context.coordinator.isUpdating = true
        defer { context.coordinator.isUpdating = false }

        if view.returnKeyType != returnKeyType.uiReturnKey {
            view.returnKeyType = returnKeyType.uiReturnKey
            view.reloadInputViews()
        }

        if view.textColor != textColor {
            view.textColor = textColor
        }

        if view.text != text {
            view.text = text
            DispatchQueue.main.async {
                width = view.getTextViewWidth(
                    textContainerInset: textContainerInset
                )
                height = view.getTextViewHeight(
                    maxFixeWidth: maxWidth,
                    textContainerInset: textContainerInset
                )
            }
        }

        // 焦点管理：只在状态真正改变时执行
        if let isFocused = isFocused?.wrappedValue {
            let isCurrentlyFirstResponder = view.isFirstResponder

            if isFocused && !isCurrentlyFirstResponder {
                // 延迟执行避免立即循环
                DispatchQueue.main.async {
                    if view.window != nil && view.canBecomeFirstResponder {
                        context.coordinator.isProgrammaticChange = true
                        view.becomeFirstResponder()
                        view.selectedRange = NSRange(
                            location: view.text.count,
                            length: 0
                        )
                        context.coordinator.isProgrammaticChange = false
                    }
                }
            } else if !isFocused && isCurrentlyFirstResponder {
                DispatchQueue.main.async {
                    context.coordinator.isProgrammaticChange = true
                    view.resignFirstResponder()
                    context.coordinator.isProgrammaticChange = false
                }
            }
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(rep: self)
    }

    class Coordinator: NSObject, UITextViewDelegate {
        let rep: OmenTextFieldRep
        var isUpdating = false
        var isProgrammaticChange = false
        weak var textView: UITextView?

        internal init(rep: OmenTextFieldRep) {
            self.rep = rep
        }

        func textView(
            _ textView: UITextView,
            shouldChangeTextIn range: NSRange,
            replacementText text: String
        ) -> Bool {

            if let listener = rep.returnTypeListener, text == "\n" {
                return listener()
            }
            return true
        }

        func textViewDidChange(_ textView: UITextView) {
            guard !isUpdating else { return }

            rep.text = textView.text
            rep.width = textView.getTextViewWidth(
                textContainerInset: rep.textContainerInset
            )
            rep.height = textView.getTextViewHeight(
                maxFixeWidth: rep.maxWidth,
                textContainerInset: rep.textContainerInset
            )
        }

        func textViewDidBeginEditing(_ textView: UITextView) {
            // 只在非程序化改变且状态不同时更新
            if !isProgrammaticChange && rep.isFocused?.wrappedValue != true {
                DispatchQueue.main.async { [weak self] in
                    self?.rep.isFocused?.wrappedValue = true
                }
            }
        }

        func textViewDidEndEditing(_ textView: UITextView) {
            // 只在非程序化改变且状态不同时更新
            if !isProgrammaticChange && rep.isFocused?.wrappedValue != false {
                DispatchQueue.main.async { [weak self] in
                    self?.rep.isFocused?.wrappedValue = false
                    // onCommit 回调
                }
            }
            print(
                "OmenTextField focused = \(rep.isFocused?.wrappedValue ?? false)"
            )
            if rep.isFocused?.wrappedValue ?? false == false {
                DispatchQueue.main.async { [weak self] in
                    self?.rep.onCommit?()
                }

            }
        }
    }
}

// MARK: - 简化的 CustomUITextView（移除了冗余的焦点管理）
class CustomUITextView: UITextView {
    // 移除了所有焦点相关的覆写方法，避免循环依赖
}

extension UITextView {

    func getTextViewWidth(textContainerInset: UIEdgeInsets) -> CGFloat {
        textWidth() + textContainerInset.right + textContainerInset.left
    }

    func getTextViewWidth(text: String, textContainerInset: UIEdgeInsets)
        -> CGFloat
    {
        textWidth(text: text) + textContainerInset.right
            + textContainerInset.left
    }

    func getTextViewHeight(
        maxFixeWidth: CGFloat,
        textContainerInset: UIEdgeInsets
    ) -> CGFloat {
        textHeight(fixedWidth: maxFixeWidth)
    }

    func textHeight(fixedWidth: CGFloat) -> CGFloat {
        let size = CGSize(
            width: fixedWidth,
            height: CGFloat.greatestFiniteMagnitude
        )
        let fit = self.sizeThatFits(size)
        return fit.height
    }

    func textWidth() -> CGFloat {
        var careWidth: CGFloat = 2
        let size = CGSize(
            width: CGFloat.greatestFiniteMagnitude,
            height: bounds.height > 0 ? bounds.height : 100
        )
        let bounding = (self.text as NSString).boundingRect(
            with: size,
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: [
                .font: self.font ?? UIFont.preferredFont(forTextStyle: .body)
            ],
            context: nil
        )

        if let textRange = selectedTextRange {
            let careRect = caretRect(for: textRange.start)
            careWidth = careRect.width
        }
        return bounding.width + careWidth + 1
    }

    func textWidth(text: String) -> CGFloat {
        var careWidth: CGFloat = 2
        let size = CGSize(
            width: CGFloat.greatestFiniteMagnitude,
            height: bounds.height > 0 ? bounds.height : 100
        )
        let bounding = (text as NSString).boundingRect(
            with: size,
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: [
                .font: self.font ?? UIFont.preferredFont(forTextStyle: .body)
            ],
            context: nil
        )

        if let textRange = selectedTextRange {
            let careRect = caretRect(for: textRange.start)
            careWidth = careRect.width
        }
        return bounding.width + careWidth + 1
    }

    func applyLineSpacing(lineSpacing: CGFloat) {
        guard let font = self.font else { return }
        let text = self.text ?? ""
        let selectedRange = self.selectedRange

        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = lineSpacing

        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .paragraphStyle: paragraphStyle,
        ]
        self.attributedText = NSAttributedString(
            string: text,
            attributes: attributes
        )
        self.selectedRange = selectedRange
    }

    func setTextWithLineSpacing(
        text: String,
        lineSpacing: CGFloat,
        font: UIFont,
        color: UIColor
    ) {
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = lineSpacing
        let attrs: [NSAttributedString.Key: Any] = [
            .font: font,
            .paragraphStyle: paragraphStyle,
            .foregroundColor: color,
        ]
        self.attributedText = NSAttributedString(
            string: text,
            attributes: attrs
        )
    }
}

// 边框样式枚举
public enum BorderStyle {
    case rectangle
    case roundRect
    case halfRect
}

// 自定义的半边框形状
struct HalfRectangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()

        // 绘制底边
        path.move(to: CGPoint(x: 0, y: rect.height))
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))

        // 绘制左边（从中间到底部）
        path.move(to: CGPoint(x: 0, y: rect.height / 2))
        path.addLine(to: CGPoint(x: 0, y: rect.height))

        // 绘制右边（从中间到底部）
        path.move(to: CGPoint(x: rect.width, y: rect.height / 2))
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))

        return path
    }
}

// MARK: - 改进的 OmenTextField
public struct OmenTextField: View {
    @Binding public var text: String
    @Binding public var isFocused: Bool
    @State var height: CGFloat = 0
    @State var width: CGFloat = 0
    @Binding private var focusedTextColor: Color
    @Binding private var unFocusedTextColor: Color
    @Binding private var focusedBorderColor: Color
    @Binding private var unfocusedBorderColor: Color
    @Binding private var backgroundColor: Color
    @Binding private var focusedStrokeWidth: CGFloat
    @Binding private var unfocusedStrokeWidth: CGFloat

    private var minWidth: CGFloat
    private var maxWidth: CGFloat
    private var textContainerInset: UIEdgeInsets

    var returnKeyType: OmenTextField.ReturnKeyType
    var onCommit: (() -> Void)?
    private var textBackGroundColor: Color
    private var borderStyle: BorderStyle?
    private var cornerRadius: CGFloat
    private var contentPadding: EdgeInsets
    private var font: Font
    private var fontSize: CGFloat
    private var textAlignment: NSTextAlignment
    var returnTypeListener: (() -> Bool)?

    public init(
        text: Binding<String>,
        isFocused: Binding<Bool> = .constant(false),
        minWidth: CGFloat = 60,
        maxWidth: CGFloat = 400,
        textContainerInset: UIEdgeInsets = .zero,
        textBackGroundColor: Color = Color.clear,
        font: Font = .body,
        fontSize: CGFloat = 16,
        returnKeyType: OmenTextField.ReturnKeyType = .default,
        returnTypeListener: (() -> Bool)? = nil,
        onCommit: (() -> Void)? = nil,
        borderStyle: BorderStyle = .rectangle,
        focusedBorderColor: Binding<Color> = .constant(.yellow),
        unfocusedBorderColor: Binding<Color> = .constant(.yellow),
        backgroundColor: Binding<Color> = .constant(.clear),
        textAlignment: NSTextAlignment = .left,
        cornerRadius: CGFloat = 10,
        focusedStrokeWidth: Binding<CGFloat> = .constant(2),
        unfocusedStrokeWidth: Binding<CGFloat> = .constant(1),
        focusedTextColor: Binding<Color> = .constant(.white),
        unfocusedTextColor: Binding<Color> = .constant(.white),
        contentPadding: EdgeInsets = EdgeInsets(
            top: 2,
            leading: 4,
            bottom: 2,
            trailing: 4
        )
    ) {
        _text = text
        self._isFocused = isFocused
        self.minWidth = minWidth
        self.maxWidth = maxWidth
        self.textContainerInset = textContainerInset
        self.returnKeyType = returnKeyType
        self.returnTypeListener = returnTypeListener
        self.onCommit = onCommit
        self.borderStyle = borderStyle
        self._focusedBorderColor = focusedBorderColor
        self._unfocusedBorderColor = unfocusedBorderColor
        self._backgroundColor = backgroundColor
        self.cornerRadius = cornerRadius
        self._focusedStrokeWidth = focusedStrokeWidth
        self._unfocusedStrokeWidth = unfocusedStrokeWidth
        self.contentPadding = contentPadding
        self.textBackGroundColor = textBackGroundColor
        self.font = font
        self.fontSize = fontSize
        self.textAlignment = textAlignment
        self._focusedTextColor = focusedTextColor
        self._unFocusedTextColor = unfocusedTextColor
    }

    public var body: some View {
        ZStack(alignment: .center) {
            OmenTextFieldRep(
                text: $text,
                isFocused: $isFocused,
                height: $height,
                width: $width,
                maxWidth: maxWidth,
                textColor: isFocused
                    ? UIColor(focusedTextColor) : UIColor(unFocusedTextColor),
                textContainerInset: textContainerInset,
                textBackGroundColor: textBackGroundColor,
                font: font,
                fontSize: fontSize,
                returnKeyType: returnKeyType,
                onCommit: onCommit,
                textAlignment: textAlignment,
                returnTypeListener: returnTypeListener
            )
            .frame(
                width: min(max(width, minWidth), maxWidth),
                height: height,
                alignment: .center
            ).padding(contentPadding)
            .overlay {

                GeometryReader { geometry in
                    let strokeWidth =
                        isFocused
                        ? focusedStrokeWidth : unfocusedStrokeWidth
                    let borderColor =
                        isFocused
                        ? focusedBorderColor : unfocusedBorderColor

                    Path { path in

                        let rect = geometry.frame(in: .local)
                        let insetRect = rect.insetBy(
                            dx: strokeWidth / 2,
                            dy: strokeWidth / 2
                        )

                        switch borderStyle {
                        case .rectangle:
                            path.addRect(insetRect)
                        case .roundRect:
                            path.addRoundedRect(
                                in: insetRect,
                                cornerSize: CGSize(
                                    width: max(
                                        0,
                                        cornerRadius - strokeWidth / 2
                                    ),
                                    height: max(
                                        0,
                                        cornerRadius - strokeWidth / 2
                                    )
                                )
                            )
                        case .halfRect:
                            path.addRect(insetRect)
                        case .none:
                            path.addRect(insetRect)
                        }
                    }.fill(backgroundColor)
                        .overlay {
                            Path { path in

                                let rect = geometry.frame(in: .local)
                                let insetRect = rect.insetBy(
                                    dx: strokeWidth / 2,
                                    dy: strokeWidth / 2
                                )

                                switch borderStyle {
                                case .rectangle:
                                    path.addRect(insetRect)
                                case .roundRect:
                                    path.addRoundedRect(
                                        in: insetRect,
                                        cornerSize: CGSize(
                                            width: max(
                                                0,
                                                cornerRadius - strokeWidth / 2
                                            ),
                                            height: max(
                                                0,
                                                cornerRadius - strokeWidth / 2
                                            )
                                        )
                                    )
                                case .halfRect:
                                    path.move(
                                        to: CGPoint(
                                            x: strokeWidth / 2,
                                            y: insetRect.height + strokeWidth
                                                / 2
                                        )
                                    )
                                    path.addLine(
                                        to: CGPoint(
                                            x: insetRect.width + strokeWidth
                                                / 2,
                                            y: insetRect.height + strokeWidth
                                                / 2
                                        )
                                    )
                                    path.move(
                                        to: CGPoint(
                                            x: strokeWidth / 2,
                                            y: insetRect.height / 2
                                        )
                                    )
                                    path.addLine(
                                        to: CGPoint(
                                            x: strokeWidth / 2,
                                            y: insetRect.height + strokeWidth
                                                / 2
                                        )
                                    )
                                    path.move(
                                        to: CGPoint(
                                            x: insetRect.width + strokeWidth
                                                / 2,
                                            y: insetRect.height / 2
                                        )
                                    )
                                    path.addLine(
                                        to: CGPoint(
                                            x: insetRect.width + strokeWidth
                                                / 2,
                                            y: insetRect.height + strokeWidth
                                                / 2
                                        )
                                    )
                                case .none:
                                    path.addRect(insetRect)
                                }
                            }
                            .stroke(borderColor, lineWidth: strokeWidth)
                        }
                }
            }
        }.allowsHitTesting(isFocused ? true : false)
    }

    private func borderShape(for style: BorderStyle) -> some Shape {
        switch style {
        case .rectangle:
            return AnyShape(Rectangle())
        case .roundRect:
            return AnyShape(RoundedRectangle(cornerRadius: cornerRadius))
        case .halfRect:
            return AnyShape(HalfRectangle())
        }
    }
}

// 类型擦除的 Shape 包装器
struct AnyShape: Shape {
    private let _path: @Sendable (CGRect) -> Path

    init<S: Shape>(_ shape: S) {
        _path = { rect in
            shape.path(in: rect)
        }
    }

    func path(in rect: CGRect) -> Path {
        return _path(rect)
    }
}

// 扩展 OmenTextField 以支持方法链式调用
extension OmenTextField {

    func borderStyle(_ style: BorderStyle) -> OmenTextField {
        var view = self
        view.borderStyle = style
        return view
    }

    func borderColor(
        _ focusedBorderColor: Binding<Color>,
        unfocusedBorderColor: Binding<Color>
    ) -> OmenTextField {
        var view = self
        view._focusedBorderColor = focusedBorderColor
        view._unfocusedBorderColor = unfocusedBorderColor
        return view
    }

    func backgroundColor(_ color: Binding<Color>) -> OmenTextField {
        var view = self
        view._backgroundColor = color
        return view
    }

    func cornerRadius(_ radius: CGFloat) -> OmenTextField {
        var view = self
        view.cornerRadius = radius
        return view
    }

    func strokeWidth(
        _ focusedStrokeWidth: Binding<CGFloat>,
        unfocusedStrokeWidth: Binding<CGFloat>
    ) -> OmenTextField {
        var view = self
        view._focusedStrokeWidth = focusedStrokeWidth
        view._unfocusedStrokeWidth = unfocusedStrokeWidth
        return view
    }

    func textContainerInset(_ textContainerInset: UIEdgeInsets) -> OmenTextField
    {
        var view = self
        view.textContainerInset = textContainerInset
        return view
    }

    func textContainerInset(_ insets: CGFloat) -> OmenTextField {
        var view = self
        view.textContainerInset = UIEdgeInsets(
            top: insets,
            left: insets,
            bottom: insets,
            right: insets
        )
        return view
    }

    func contentPadding(_ padding: EdgeInsets) -> OmenTextField {
        var view = self
        view.contentPadding = padding
        return view
    }

    func contentPadding(_ padding: CGFloat) -> OmenTextField {
        var view = self
        view.contentPadding = EdgeInsets(
            top: padding,
            leading: padding,
            bottom: padding,
            trailing: padding
        )
        return view
    }

    func noPadding() -> OmenTextField {
        var view = self
        view.contentPadding = EdgeInsets(
            top: 0,
            leading: 0,
            bottom: 0,
            trailing: 0
        )
        return view
    }

    func widthRange(min: CGFloat, max: CGFloat) -> OmenTextField {
        var view = self
        view.minWidth = min
        view.maxWidth = max
        return view
    }

    func textBackGroundColor(textBackGroundColor: Color) -> OmenTextField {
        var view = self
        view.textBackGroundColor = textBackGroundColor
        return view
    }

    func font(font: Font) -> OmenTextField {
        var view = self
        view.font = font
        return view
    }

    func fontSize(_ fontSize: CGFloat) -> OmenTextField {
        var view = self
        view.fontSize = fontSize
        return view
    }

    func textAlignment(_ alignment: NSTextAlignment) -> OmenTextField {
        var view = self
        view.textAlignment = alignment
        return view
    }

    func textColor(
        focusedTextColor: Binding<Color>,
        unFocusedTextColor: Binding<Color>
    ) -> OmenTextField {
        var view = self
        view._focusedTextColor = focusedTextColor
        view._unFocusedTextColor = unFocusedTextColor
        return view
    }
}

extension OmenTextField {
    public enum ReturnKeyType: String, CaseIterable {
        case done
        case next
        case `default`
        case `continue`
        case go
        case search
        case send

        var uiReturnKey: UIReturnKeyType {
            switch self {
            case .done:
                return .done
            case .next:
                return .next
            case .default:
                return .default
            case .continue:
                return .continue
            case .go:
                return .go
            case .search:
                return .search
            case .send:
                return .send
            }
        }
    }
}

// MARK: - 键盘监听器
class KeyboardObserver: ObservableObject {
    @Published var keyboardHeight: CGFloat = 0
    @Published var isKeyboardVisible: Bool = false

    private var keyboardWillShowNotification: NSObjectProtocol?
    private var keyboardWillHideNotification: NSObjectProtocol?

    init() {
        keyboardWillShowNotification = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillShowNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.keyboardWillShow(notification)
        }

        keyboardWillHideNotification = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillHideNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.keyboardWillHide(notification)
        }
    }

    deinit {
        if let keyboardWillShowNotification = keyboardWillShowNotification {
            NotificationCenter.default.removeObserver(
                keyboardWillShowNotification
            )
        }
        if let keyboardWillHideNotification = keyboardWillHideNotification {
            NotificationCenter.default.removeObserver(
                keyboardWillHideNotification
            )
        }
    }

    private func keyboardWillShow(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
            let keyboardFrame = userInfo[
                UIResponder.keyboardFrameEndUserInfoKey
            ] as? CGRect
        else {
            return
        }

        keyboardHeight = keyboardFrame.height
        isKeyboardVisible = true
    }

    private func keyboardWillHide(_ notification: Notification) {
        keyboardHeight = 0
        isKeyboardVisible = false
    }
}

private struct ContentHeightKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct TextFieldContainer<Content: View>: View {
    let content: Content
    @StateObject private var keyboardObserver = KeyboardObserver()
    @State private var contentHeight: CGFloat = 0

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding([.bottom], keyboardObserver.isKeyboardVisible ? 1 : 0)
            .edgesIgnoringSafeArea(
                keyboardObserver.isKeyboardVisible ? [.bottom] : []
            )
            .animation(
                .easeInOut(duration: 0.3),
                value: keyboardObserver.keyboardHeight
            )
    }
}

// MARK: - 更简单的使用方式
extension View {
    func adaptToKeyboard() -> some View {
        TextFieldContainer {
            self
        }
    }
}

```

