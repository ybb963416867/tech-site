---
title: "TextField 完整指南"
description: "TextField 是 SwiftUI 中用于单行文本输入的控件，类似于 UIKit 中的 UITextField。它提供了丰富的样式选项和交互功能。"
pubDate: 2026-05-29
category: "view"
tags: [iOS, Swift, API]
draft: false
---
# 🚀  TextField 完整指南

## 概述

TextField 是 SwiftUI 中用于单行文本输入的控件，类似于 UIKit 中的 UITextField。它提供了丰富的样式选项和交互功能。

## 基本用法

### 最简单的 TextField

```swift
struct ContentView: View {
    @State private var text = ""
    
    var body: some View {
        TextField("请输入文本...", text: $text)
            .padding()
    }
}
```

## 初始化方法

### 1. 基本初始化
```swift
TextField("占位符", text: $text)
```

### 2. 带提示文本的初始化
```swift
TextField("用户名", text: $username, prompt: Text("请输入用户名"))
```

### 3. 带轴参数的初始化 (iOS 16+)
```swift
TextField("多行输入", text: $text, axis: .vertical)
```

### 4. 格式化文本字段
```swift
@State private var value: Double = 0.0

TextField("价格", value: $value, format: .currency(code: "USD"))
```

## TextField 样式 (textFieldStyle)

### 预设样式

```swift
// 默认样式
TextField("文本", text: $text)
    .textFieldStyle(.automatic)

// 圆角边框样式
TextField("文本", text: $text)
    .textFieldStyle(.roundedBorder)

// 简单样式
TextField("文本", text: $text)
    .textFieldStyle(.plain)
```

### 自定义样式
```swift
struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 5)
                    .strokeBorder(Color.blue, lineWidth: 2)
            )
    }
}

// 使用自定义样式
TextField("自定义", text: $text)
    .textFieldStyle(CustomTextFieldStyle())
```

## 文本属性修饰符

### 字体相关
```swift
TextField("文本", text: $text)
    .font(.title)                        // 字体大小
    .font(.custom("Helvetica", size: 16)) // 自定义字体
    .fontWeight(.bold)                   // 字体粗细
    .fontDesign(.monospaced)             // 字体设计
    .fontWidth(.expanded)                // 字体宽度 (iOS 16+)
```

### 颜色相关
```swift
TextField("文本", text: $text)
    .foregroundColor(.blue)              // 文字颜色
    .foregroundStyle(.blue.gradient)     // 渐变色 (iOS 15+)
    .accentColor(.red)                   // 光标和选择颜色
    .tint(.green)                        // 着色 (iOS 15+)
```

### 文本对齐
```swift
TextField("文本", text: $text)
    .multilineTextAlignment(.leading)    // 左对齐
    .multilineTextAlignment(.center)     // 居中对齐
    .multilineTextAlignment(.trailing)   // 右对齐
```

## 键盘相关

### 键盘类型
```swift
TextField("邮箱", text: $email)
    .keyboardType(.default)              // 默认键盘
    .keyboardType(.emailAddress)         // 邮箱键盘
    .keyboardType(.numberPad)            // 数字键盘
    .keyboardType(.phonePad)             // 电话键盘
    .keyboardType(.URL)                  // URL键盘
    .keyboardType(.webSearch)            // 网页搜索键盘
    .keyboardType(.twitter)              // Twitter键盘
    .keyboardType(.decimalPad)           // 小数键盘
    .keyboardType(.numbersAndPunctuation) // 数字和标点键盘
```

### 内容类型 (自动填充)
```swift
TextField("用户名", text: $username)
    .textContentType(.username)          // 用户名
    .textContentType(.password)          // 密码
    .textContentType(.emailAddress)      // 邮箱地址
    .textContentType(.telephoneNumber)   // 电话号码
    .textContentType(.creditCardNumber)  // 信用卡号
    .textContentType(.oneTimeCode)       // 验证码
    .textContentType(.name)              // 姓名
    .textContentType(.givenName)         // 名字
    .textContentType(.familyName)        // 姓氏
    .textContentType(.addressCity)       // 城市
    .textContentType(.postalCode)        // 邮政编码
```

### 自动校正和建议
```swift
TextField("文本", text: $text)
    .autocorrectionDisabled()            // 禁用自动校正
    .autocorrectionDisabled(false)       // 启用自动校正
    .textInputAutocapitalization(.never) // 禁用自动大写
    .textInputAutocapitalization(.words) // 单词首字母大写
    .textInputAutocapitalization(.sentences) // 句子首字母大写
    .textInputAutocapitalization(.characters) // 所有字母大写
```

### 提交标签和回调
```swift
TextField("搜索", text: $searchText)
    .submitLabel(.search)                // 搜索按钮
    .submitLabel(.done)                  // 完成按钮
    .submitLabel(.go)                    // 前往按钮
    .submitLabel(.send)                  // 发送按钮
    .submitLabel(.join)                  // 加入按钮
    .submitLabel(.route)                 // 路线按钮
    .submitLabel(.next)                  // 下一个按钮
    .submitLabel(.continue)              // 继续按钮
    .onSubmit {
        // 用户点击提交按钮时的回调
        performSearch()
    }
```

## 焦点控制 (iOS 15+)

```swift
struct FocusedTextField: View {
    @State private var username = ""
    @State private var password = ""
    @FocusState private var focusedField: Field?
    
    enum Field {
        case username, password
    }
    
    var body: some View {
        VStack {
            TextField("用户名", text: $username)
                .focused($focusedField, equals: .username)
                .textFieldStyle(.roundedBorder)
            
            SecureField("密码", text: $password)
                .focused($focusedField, equals: .password)
                .textFieldStyle(.roundedBorder)
            
            HStack {
                Button("焦点到用户名") {
                    focusedField = .username
                }
                
                Button("焦点到密码") {
                    focusedField = .password
                }
                
                Button("清除焦点") {
                    focusedField = nil
                }
            }
        }
        .padding()
    }
}
```

## 多行支持 (iOS 16+)

```swift
TextField("多行文本", text: $text, axis: .vertical)
    .lineLimit(2...6)                    // 2-6行之间
    .lineLimit(3)                        // 固定3行
    .lineLimit(...5)                     // 最多5行
```

## 格式化 TextField

### 数字格式化
```swift
@State private var price: Double = 0.0
@State private var quantity: Int = 0

VStack {
    // 货币格式
    TextField("价格", value: $price, format: .currency(code: "USD"))
    
    // 数字格式
    TextField("数量", value: $quantity, format: .number)
    
    // 百分比格式
    TextField("百分比", value: $percentage, format: .percent)
}
```

### 日期格式化
```swift
@State private var date = Date()

TextField("日期", value: $date, format: Date.FormatStyle.dateTime.day().month().year())
```

## 输入验证和限制

### 字符长度限制
```swift
struct LimitedTextField: View {
    @State private var text = ""
    let maxLength = 10
    
    var body: some View {
        TextField("最多10个字符", text: $text)
            .onChange(of: text) { newValue in
                if newValue.count > maxLength {
                    text = String(newValue.prefix(maxLength))
                }
            }
    }
}
```

### 只允许数字输入
```swift
struct NumberOnlyTextField: View {
    @State private var text = ""
    
    var body: some View {
        TextField("只能输入数字", text: $text)
            .keyboardType(.numberPad)
            .onChange(of: text) { newValue in
                let filtered = newValue.filter { $0.isNumber }
                if filtered != newValue {
                    text = filtered
                }
            }
    }
}
```

### 实时验证
```swift
struct ValidatedTextField: View {
    @State private var email = ""
    
    private var isValidEmail: Bool {
        email.contains("@") && email.contains(".")
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            TextField("邮箱地址", text: $email)
                .textFieldStyle(.roundedBorder)
                .keyboardType(.emailAddress)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .overlay(
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(
                            email.isEmpty ? Color.gray :
                            isValidEmail ? Color.green : Color.red,
                            lineWidth: 1
                        )
                )
            
            if !email.isEmpty && !isValidEmail {
                Text("请输入有效的邮箱地址")
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
}
```

## 外观自定义

### 带图标的 TextField
```swift
struct IconTextField: View {
    @State private var text = ""
    let icon: String
    let placeholder: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.gray)
                .frame(width: 20)
            
            TextField(placeholder, text: $text)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.gray.opacity(0.5))
        )
    }
}

// 使用示例
IconTextField(icon: "envelope", placeholder: "邮箱")
IconTextField(icon: "lock", placeholder: "密码")
```

### 浮动标签 TextField
```swift
struct FloatingLabelTextField: View {
    @State private var text = ""
    @State private var isEditing = false
    let placeholder: String
    
    var body: some View {
        ZStack(alignment: .leading) {
            Text(placeholder)
                .foregroundColor(.gray)
                .offset(y: (isEditing || !text.isEmpty) ? -25 : 0)
                .scaleEffect((isEditing || !text.isEmpty) ? 0.8 : 1.0, anchor: .leading)
                .animation(.easeInOut(duration: 0.2), value: isEditing)
            
            TextField("", text: $text)
                .onTapGesture {
                    isEditing = true
                }
                .onSubmit {
                    isEditing = false
                }
        }
        .padding()
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(isEditing ? .blue : .gray),
            alignment: .bottom
        )
    }
}
```

## 安全输入 (SecureField)

```swift
struct PasswordField: View {
    @State private var password = ""
    @State private var isSecure = true
    
    var body: some View {
        HStack {
            if isSecure {
                SecureField("密码", text: $password)
            } else {
                TextField("密码", text: $password)
            }
            
            Button(action: {
                isSecure.toggle()
            }) {
                Image(systemName: isSecure ? "eye.slash" : "eye")
                    .foregroundColor(.gray)
            }
        }
        .textFieldStyle(.roundedBorder)
    }
}
```

## 工具栏和按钮

### 键盘工具栏
```swift
TextField("文本", text: $text)
    .toolbar {
        ToolbarItemGroup(placement: .keyboard) {
            Spacer()
            
            Button("清空") {
                text = ""
            }
            
            Button("完成") {
                hideKeyboard()
            }
        }
    }
```

### 清除按钮
```swift
struct ClearableTextField: View {
    @State private var text = ""
    
    var body: some View {
        HStack {
            TextField("可清除文本", text: $text)
            
            if !text.isEmpty {
                Button(action: {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
        }
        .textFieldStyle(.roundedBorder)
    }
}
```

## 搜索功能

### 搜索栏
```swift
struct SearchBar: View {
    @State private var searchText = ""
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("搜索...", text: $searchText)
                .textFieldStyle(.plain)
            
            if !searchText.isEmpty {
                Button("取消") {
                    searchText = ""
                }
                .foregroundColor(.blue)
            }
        }
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}
```

## 完整登录表单示例

```swift
struct LoginForm: View {
    @State private var username = ""
    @State private var password = ""
    @State private var rememberMe = false
    @FocusState private var focusedField: Field?
    
    enum Field {
        case username, password
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("登录")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                VStack(spacing: 15) {
                    // 用户名输入框
                    TextField("用户名或邮箱", text: $username)
                        .focused($focusedField, equals: .username)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.username)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .submitLabel(.next)
                        .onSubmit {
                            focusedField = .password
                        }
                    
                    // 密码输入框
                    SecureField("密码", text: $password)
                        .focused($focusedField, equals: .password)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.password)
                        .submitLabel(.done)
                        .onSubmit {
                            login()
                        }
                    
                    // 记住我
                    HStack {
                        Toggle("记住我", isOn: $rememberMe)
                        Spacer()
                    }
                    
                    // 登录按钮
                    Button("登录") {
                        login()
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    .disabled(username.isEmpty || password.isEmpty)
                }
                .padding()
                
                Spacer()
            }
            .navigationBarHidden(true)
        }
    }
    
    private func login() {
        // 登录逻辑
        focusedField = nil
    }
}
```

## 注意事项

1. **性能优化**: 避免在 `onChange` 中进行复杂计算
2. **键盘管理**: 合理使用 `submitLabel` 和 `onSubmit` 
3. **焦点控制**: 使用 `@FocusState` 提升用户体验
4. **输入验证**: 在客户端进行基本验证，服务端进行完整验证
5. **可访问性**: 为 TextField 提供适当的标签和提示
6. **版本兼容**: 某些功能只在特定 iOS 版本可用
7. **样式一致性**: 在应用中保持 TextField 样式的一致性

## 常见问题解决

### 1. 键盘遮挡问题
使用 `ScrollView` 或调整布局来避免键盘遮挡。

### 2. 输入限制
使用 `onChange` 修饰符来限制输入内容。

### 3. 自定义外观
通过自定义 `TextFieldStyle` 或使用修饰符组合。

### 4. 焦点管理
使用 `@FocusState` 进行精确的焦点控制。

### 5. 数据绑定
确保使用正确的 `@State` 或 `@Binding` 来管理状态。