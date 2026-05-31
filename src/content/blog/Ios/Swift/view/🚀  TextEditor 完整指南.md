---
title: "TextEditor 完整指南"
description: "TextEditor 是 SwiftUI 中用于多行文本输入的控件，类似于 UIKit 中的 UITextView。它支持多行文本编辑、滚动和丰富的文本格式。"
pubDate: 2026-05-29
category: "view"
tags: [Mac, iOS, Swift, API]
draft: false
---
# 🚀  TextEditor 完整指南

## 概述

TextEditor 是 SwiftUI 中用于多行文本输入的控件，类似于 UIKit 中的 UITextView。它支持多行文本编辑、滚动和丰富的文本格式。

## 基本用法

### 最简单的 TextEditor

```swift
struct ContentView: View {
    @State private var text = "输入你的文本..."
    
    var body: some View {
        TextEditor(text: $text)
            .padding()
    }
}
```

## 初始化方法

### 1. 基本初始化

```swift
TextEditor(text: $text)
```

### 2. 使用 Binding

```swift
@State private var inputText = ""

TextEditor(text: $inputText)
```

## 文本属性修饰符

### 字体相关

```swift
TextEditor(text: $text)
    .font(.title)                    // 设置字体大小
    .font(.custom("Helvetica", size: 16))  // 自定义字体
    .fontWeight(.bold)               // 字体粗细
    .fontDesign(.monospaced)         // 字体设计
```

### 颜色相关

```swift
TextEditor(text: $text)
    .foregroundColor(.blue)          // 文字颜色
    .accentColor(.red)               // 光标和选择颜色
    .colorScheme(.dark)              // 强制暗黑模式
```

### 文本对齐

```swift
TextEditor(text: $text)
    .multilineTextAlignment(.leading)   // 左对齐
    .multilineTextAlignment(.center)    // 居中对齐
    .multilineTextAlignment(.trailing)  // 右对齐
```

## 外观样式修饰符

### 背景和边框

```swift
TextEditor(text: $text)
    .background(Color.gray.opacity(0.1))    // 背景色
    .cornerRadius(8)                        // 圆角
    .overlay(
        RoundedRectangle(cornerRadius: 8)
            .stroke(Color.blue, lineWidth: 1)  // 边框
    )
```

### 去掉原始的白色背景

```swift

extension View {
    @ViewBuilder
    public func clearTextEditorBackground() -> some View {
        if #available(iOS 16, *) {
            self.scrollContentBackground(.hidden)
        } else {

            self.onAppear {
                UITextView.appearance().backgroundColor = .clear
            }

        }
    }
}

```

### 内边距和外边距

```swift
TextEditor(text: $text)
    .padding()                       // 内边距
    .padding(.horizontal, 16)        // 水平内边距
    .frame(minHeight: 100)           // 最小高度
```

## 键盘相关

### 键盘类型

```swift
TextEditor(text: $text)
    .keyboardType(.default)          // 默认键盘
    .keyboardType(.emailAddress)     // 邮箱键盘
    .keyboardType(.numberPad)        // 数字键盘
    .keyboardType(.URL)              // URL键盘
    .keyboardType(.twitter)          // Twitter键盘
```

### 自动校正和建议

```swift
TextEditor(text: $text)
    .autocorrectionDisabled()        // 禁用自动校正
    .textInputAutocapitalization(.never)  // 禁用自动大写
    .textInputAutocapitalization(.words)  // 单词首字母大写
    .textInputAutocapitalization(.sentences)  // 句子首字母大写
```

## 交互控制

### 禁用编辑

```swift
TextEditor(text: $text)
    .disabled(true)                  // 禁用编辑
    .textSelection(.disabled)        // 禁用文本选择（iOS 15+）
```

### 滚动控制

```swift
TextEditor(text: $text)
    .scrollContentBackground(.hidden)  // 隐藏默认背景（iOS 16+）
    .scrollDisabled(true)             // 禁用滚动（iOS 16+）
```

## 高级用法

### 带占位符的 TextEditor

```swift
struct PlaceholderTextEditor: View {
    @State private var text = ""
    let placeholder = "请输入你的想法..."
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty {
                Text(placeholder)
                    .foregroundColor(.gray)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 12)
            }
            
            TextEditor(text: $text)
                .padding(.horizontal, 4)
                .padding(.vertical, 8)
        }
    }
}
```

### 字符计数器

```swift
struct TextEditorWithCounter: View {
    @State private var text = ""
    let maxLength = 200
    
    var body: some View {
        VStack(alignment: .trailing) {
            TextEditor(text: $text)
                .frame(minHeight: 100)
                .onChange(of: text) { newValue in
                    if newValue.count > maxLength {
                        text = String(newValue.prefix(maxLength))
                    }
                }
            
            Text("\(text.count)/\(maxLength)")
                .font(.caption)
                .foregroundColor(text.count > maxLength * 8/10 ? .red : .gray)
        }
    }
}
```

### 自适应高度的 TextEditor

```swift
struct ExpandingTextEditor: View {
    @State private var text = ""
    @State private var textHeight: CGFloat = 100
    
    var body: some View {
        TextEditor(text: $text)
            .frame(minHeight: textHeight, maxHeight: 300)
            .background(
                Text(text)
                    .font(.body)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 12)
                    .background(
                        GeometryReader { geometry in
                            Color.clear.onAppear {
                                textHeight = max(100, geometry.size.height)
                            }
                        }
                    )
                    .opacity(0)
            )
    }
}
```

## 工具栏和按钮

### 键盘工具栏

```swift
TextEditor(text: $text)
    .toolbar {
        ToolbarItemGroup(placement: .keyboard) {
            Spacer()
            Button("完成") {
                hideKeyboard()
            }
        }
    }

// 隐藏键盘的扩展
extension View {
    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), 
                                       to: nil, from: nil, for: nil)
    }
}
```

### 格式化工具栏

```swift
struct FormattedTextEditor: View {
    @State private var text = ""
    @State private var isBold = false
    @State private var isItalic = false
    
    var body: some View {
        VStack {
            HStack {
                Button("加粗") { isBold.toggle() }
                    .foregroundColor(isBold ? .blue : .gray)
                
                Button("斜体") { isItalic.toggle() }
                    .foregroundColor(isItalic ? .blue : .gray)
                
                Spacer()
            }
            .padding()
            
            TextEditor(text: $text)
                .font(.system(size: 16, 
                            weight: isBold ? .bold : .regular,
                            design: isItalic ? .serif : .default))
        }
    }
}
```

## 焦点控制（iOS 15+）

```swift
struct FocusedTextEditor: View {
    @State private var text = ""
    @FocusState private var isTextEditorFocused: Bool
    
    var body: some View {
        VStack {
            TextEditor(text: $text)
                .focused($isTextEditorFocused)
                .frame(minHeight: 100)
            
            HStack {
                Button("获取焦点") {
                    isTextEditorFocused = true
                }
                
                Button("失去焦点") {
                    isTextEditorFocused = false
                }
            }
        }
    }
}
```

## 事件处理

### 文本变化监听

```swift
TextEditor(text: $text)
    .onChange(of: text) { newValue in
        print("文本改变: \(newValue)")
        // 可以在这里进行验证、格式化等操作
    }
    .onSubmit {
        print("提交文本")
        // 用户按下 Return 键时触发
    }
```

### 编辑状态监听

```swift
struct EditingStateTextEditor: View {
    @State private var text = ""
    @State private var isEditing = false
    
    var body: some View {
        TextEditor(text: $text)
            .onTapGesture {
                isEditing = true
            }
            .onSubmit {
                isEditing = false
            }
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isEditing ? Color.blue : Color.gray, lineWidth: 1)
            )
    }
}
```

## 完整示例

### 功能完整的文本编辑器

```swift
struct AdvancedTextEditor: View {
    @State private var text = ""
    @State private var wordCount = 0
    @State private var characterCount = 0
    @FocusState private var isTextEditorFocused: Bool
    
    private let maxCharacters = 500
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 统计信息栏
                HStack {
                    Text("字符: \(characterCount)/\(maxCharacters)")
                    Spacer()
                    Text("单词: \(wordCount)")
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color.gray.opacity(0.1))
                .font(.caption)
                .foregroundColor(.secondary)
                
                // 文本编辑器
                TextEditor(text: $text)
                    .focused($isTextEditorFocused)
                    .padding()
                    .onChange(of: text) { newValue in
                        // 限制字符数
                        if newValue.count > maxCharacters {
                            text = String(newValue.prefix(maxCharacters))
                        }
                        
                        // 更新统计
                        characterCount = text.count
                        wordCount = text.components(separatedBy: .whitespacesAndNewlines)
                            .filter { !$0.isEmpty }.count
                    }
            }
            .navigationTitle("文本编辑器")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button("清空") {
                        text = ""
                        isTextEditorFocused = false
                    }
                    .disabled(text.isEmpty)
                    
                    Button(isTextEditorFocused ? "完成" : "编辑") {
                        isTextEditorFocused.toggle()
                    }
                }
            }
        }
    }
}
```

## TextEditor 独有的 API

### scrollContentBackground (iOS 16+)

```swift
TextEditor(text: $text)
    .scrollContentBackground(.hidden)    // 隐藏默认滚动背景
    .scrollContentBackground(.visible)   // 显示默认滚动背景
```

### lineLimit (iOS 16+)

```swift
TextEditor(text: $text)
    .lineLimit(5)                        // 限制最大行数
    .lineLimit(2...10)                   // 设置行数范围
    .lineLimit(...5)                     // 最多5行
```

### scrollDisabled (iOS 16+)

```swift
TextEditor(text: $text)
    .scrollDisabled(true)                // 禁用滚动
    .scrollDisabled(isScrollDisabled)    // 动态控制滚动
```

## 与 TextField 的区别

### TextEditor 特有功能

*   多行文本输入
*   内置滚动支持
*   自动换行
*   没有 `textFieldStyle` 修饰符

### TextField 特有功能（TextEditor 不支持）

*   `textFieldStyle` 样式设置
*   单行输入优化

### submitLabel 提交按钮的样式，onSubmit 提交

*   `onSubmit` 回调（Enter键）
*   `submitLabel` 提交按钮标签

## 完整的修饰符列表

### 文本样式相关

```swift
TextEditor(text: $text)
    .font(.title)                        // 字体
    .fontWeight(.bold)                   // 字体粗细
    .fontDesign(.monospaced)             // 字体设计
    .fontWidth(.expanded)                // 字体宽度 (iOS 16+)
    .foregroundColor(.blue)              // 前景色
    .foregroundStyle(.blue)              // 前景样式 (iOS 15+)
    .tint(.red)                          // 着色 (iOS 15+)
    .accentColor(.green)                 // 强调色
    .multilineTextAlignment(.center)     // 多行对齐
```

### 输入控制相关

```swift
TextEditor(text: $text)
    .keyboardType(.emailAddress)         // 键盘类型
    .textContentType(.emailAddress)      // 内容类型
    .autocorrectionDisabled()            // 禁用自动校正
    .textInputAutocapitalization(.never) // 自动大写
    .disabled(true)                      // 禁用编辑
    .textSelection(.enabled)             // 文本选择 (iOS 15+)
    .textSelection(.disabled)            // 禁用选择
```

### 布局和外观

```swift
TextEditor(text: $text)
    .frame(width: 300, height: 200)      // 固定尺寸
    .frame(minWidth: 100, maxWidth: .infinity,
           minHeight: 50, maxHeight: 300) // 尺寸范围
    .background(Color.gray.opacity(0.1)) // 背景
    .overlay(Rectangle().stroke(.blue))  // 叠加层
    .clipShape(RoundedRectangle(cornerRadius: 8)) // 裁剪形状
    .cornerRadius(10)                    // 圆角
    .shadow(radius: 5)                   // 阴影
    .padding()                           // 内边距
```

### iOS 版本特定功能

```swift
// iOS 15+
TextEditor(text: $text)
    .focused($isTextEditorFocused)       // 焦点控制
    .textSelection(.enabled)             // 文本选择控制
    .foregroundStyle(.blue.gradient)     // 渐变前景

// iOS 16+
TextEditor(text: $text)
    .scrollContentBackground(.hidden)    // 隐藏滚动背景
    .scrollDisabled(true)                // 禁用滚动
    .lineLimit(5)                        // 行数限制
    .fontWidth(.expanded)                // 字体宽度

// iOS 17+
TextEditor(text: $text)
    .scrollBounceBehavior(.basedOnSize)  // 滚动弹跳行为
    .contentMargins(.all, 20)            // 内容边距
```

## 高级自定义样式

### 仿 TextField 样式的 TextEditor

```swift
struct TextFieldStyleTextEditor: View {
    @State private var text = ""
    
    var body: some View {
        TextEditor(text: $text)
            .font(.body)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemGray6))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(.systemGray4), lineWidth: 1)
                    )
            )
            .frame(minHeight: 40)
    }
}
```

### 带边框样式

```swift
struct BorderedTextEditor: View {
    @State private var text = ""
    @FocusState private var isFocused: Bool
    
    var body: some View {
        TextEditor(text: $text)
            .focused($isFocused)
            .padding(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        isFocused ? Color.blue : Color.gray.opacity(0.5),
                        lineWidth: isFocused ? 2 : 1
                    )
            )
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemBackground))
            )
    }
}
```

## 平台特定行为

### macOS 特定

```swift
#if os(macOS)
TextEditor(text: $text)
    .font(.system(.body, design: .monospaced))
    .background(Color(.controlBackgroundColor))
#endif
```

### iOS/iPadOS 特定

```swift
#if os(iOS)
TextEditor(text: $text)
    .keyboardType(.default)
    .autocorrectionDisabled()
#endif
```

## 注意事项

1.  **性能**: 处理大量文本时要注意性能问题，避免频繁的 UI 更新
2.  **键盘遮挡**: 在较小的设备上注意键盘可能遮挡内容
3.  **自动布局**: TextEditor 会自动扩展以填充可用空间
4.  **版本兼容**: 某些修饰符只在特定 iOS 版本中可用
5.  **文本选择**: 在 iOS 15+ 中可以通过 `.textSelection()` 控制文本选择行为
6.  **样式限制**: TextEditor 没有 `textFieldStyle`，需要自定义外观
7.  **滚动行为**: 默认支持滚动，可在 iOS 16+ 中禁用

## 常见问题解决

### 1. 占位符显示问题

使用 ZStack 叠加 Text 和 TextEditor 来实现占位符效果。

### 2. 高度自适应问题

使用 GeometryReader 或预设最小高度来控制 TextEditor 的高度。

### 3. 键盘工具栏

使用 `.toolbar` 修饰符添加键盘上方的工具栏。

### 4. 文本格式化

TextEditor 本身不支持富文本，需要结合其他控件实现格式化功能。
