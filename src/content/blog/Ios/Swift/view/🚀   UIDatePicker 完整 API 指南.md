---
title: "UIDatePicker 完整 API 指南"
description: "UIDatePicker 是 UIKit 框架中用于选择日期和时间的控件，它提供了多种显示样式和配置选项，可以满足不同的日期时间选择需求。"
pubDate: 2026-05-29
category: "view"
tags: [iOS, Environment, Swift, API]
draft: false
---
# 🚀  UIDatePicker 完整 API 指南

## 概述

UIDatePicker 是 UIKit 框架中用于选择日期和时间的控件，它提供了多种显示样式和配置选项，可以满足不同的日期时间选择需求。

## 基本初始化

### 创建 UIDatePicker

```swift
// 基本初始化
let datePicker = UIDatePicker()

// 带 frame 初始化
let datePicker = UIDatePicker(frame: CGRect(x: 0, y: 0, width: 320, height: 200))
```

## 核心属性 (Properties)

### 1. 日期相关属性

#### `date: Date`

当前选中的日期

```swift
let datePicker = UIDatePicker()

// 设置当前日期
datePicker.date = Date()

// 获取选中的日期
let selectedDate = datePicker.date

// 设置特定日期
let calendar = Calendar.current
let specificDate = calendar.date(from: DateComponents(year: 2024, month: 12, month: 25))!
datePicker.date = specificDate
```

#### `minimumDate: Date?`

可选择的最小日期

```swift
let datePicker = UIDatePicker()

// 设置最小日期为今天
datePicker.minimumDate = Date()

// 设置最小日期为去年
let calendar = Calendar.current
let lastYear = calendar.date(byAdding: .year, value: -1, to: Date())
datePicker.minimumDate = lastYear

// 清除最小日期限制
datePicker.minimumDate = nil
```

#### `maximumDate: Date?`

可选择的最大日期

```swift
let datePicker = UIDatePicker()

// 设置最大日期为明年
let calendar = Calendar.current
let nextYear = calendar.date(byAdding: .year, value: 1, to: Date())
datePicker.maximumDate = nextYear

// 设置最大日期为今天（不能选择未来日期）
datePicker.maximumDate = Date()

// 清除最大日期限制
datePicker.maximumDate = nil
```

### 2. 显示模式属性

#### `datePickerMode: UIDatePicker.Mode`

日期选择器的显示模式

```swift
let datePicker = UIDatePicker()

// 时间模式（小时和分钟）
datePicker.datePickerMode = .time

// 日期模式（年月日）
datePicker.datePickerMode = .date

// 日期和时间模式
datePicker.datePickerMode = .dateAndTime

// 倒计时模式
datePicker.datePickerMode = .countDownTimer
```

**模式说明**：

*   `.time`: 显示小时和分钟选择器
*   `.date`: 显示年、月、日选择器
*   `.dateAndTime`: 同时显示日期和时间
*   `.countDownTimer`: 显示倒计时（小时和分钟）

#### `preferredDatePickerStyle: UIDatePickerStyle` (iOS 13.4+)

首选的日期选择器样式

```swift
let datePicker = UIDatePicker()

// 自动样式（系统决定）
datePicker.preferredDatePickerStyle = .automatic

// 滚轮样式
datePicker.preferredDatePickerStyle = .wheels

// 紧凑样式
datePicker.preferredDatePickerStyle = .compact

// 日历样式 (iOS 14.0+)
if #available(iOS 14.0, *) {
    datePicker.preferredDatePickerStyle = .graphical
}
```

**样式说明**：

*   `.automatic`: 系统根据上下文自动选择
*   `.wheels`: 传统的滚轮样式
*   `.compact`: 紧凑的按钮样式，点击后弹出选择器
*   `.graphical`: 日历网格样式（仅限日期模式）

### 3. 本地化属性

#### `locale: Locale?`

用于格式化日期的区域设置

```swift
let datePicker = UIDatePicker()

// 设置为中文区域
datePicker.locale = Locale(identifier: "zh_CN")

// 设置为英文区域
datePicker.locale = Locale(identifier: "en_US")

// 设置为日文区域
datePicker.locale = Locale(identifier: "ja_JP")

// 使用系统默认区域
datePicker.locale = Locale.current
```

#### `calendar: Calendar?`

用于日期计算的日历

```swift
let datePicker = UIDatePicker()

// 设置为公历
datePicker.calendar = Calendar(identifier: .gregorian)

// 设置为农历
datePicker.calendar = Calendar(identifier: .chinese)

// 设置为伊斯兰历
datePicker.calendar = Calendar(identifier: .islamicCivil)

// 使用系统默认日历
datePicker.calendar = Calendar.current
```

#### `timeZone: TimeZone?`

用于显示日期的时区

```swift
let datePicker = UIDatePicker()

// 设置为东京时区
datePicker.timeZone = TimeZone(identifier: "Asia/Tokyo")

// 设置为纽约时区
datePicker.timeZone = TimeZone(identifier: "America/New_York")

// 设置为UTC时区
datePicker.timeZone = TimeZone(abbreviation: "UTC")

// 使用系统默认时区
datePicker.timeZone = TimeZone.current
```

### 4. 倒计时模式属性

#### `countDownDuration: TimeInterval`

倒计时模式下的持续时间（秒）

```swift
let datePicker = UIDatePicker()
datePicker.datePickerMode = .countDownTimer

// 设置5分钟倒计时
datePicker.countDownDuration = 5 * 60

// 设置1小时倒计时
datePicker.countDownDuration = 60 * 60

// 设置2小时30分钟倒计时
datePicker.countDownDuration = 2.5 * 60 * 60

// 获取当前倒计时时长
let duration = datePicker.countDownDuration
let minutes = Int(duration) / 60
```

#### `minuteInterval: Int`

分钟选择的间隔

```swift
let datePicker = UIDatePicker()

// 设置5分钟间隔（0, 5, 10, 15, 20, 25, 30...）
datePicker.minuteInterval = 5

// 设置15分钟间隔（0, 15, 30, 45）
datePicker.minuteInterval = 15

// 设置30分钟间隔（0, 30）
datePicker.minuteInterval = 30

// 默认1分钟间隔
datePicker.minuteInterval = 1
```

**注意**: minuteInterval 必须是 60 的约数（1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30）

## 核心方法 (Methods)

### 1. 设置日期方法

#### `setDate(_:animated:)`

设置选中的日期，可选择是否使用动画

```swift
let datePicker = UIDatePicker()

// 无动画设置日期
datePicker.setDate(Date(), animated: false)

// 有动画设置日期
datePicker.setDate(Date(), animated: true)

// 设置特定日期
let calendar = Calendar.current
let specificDate = calendar.date(from: DateComponents(year: 2025, month: 6, day: 15))!
datePicker.setDate(specificDate, animated: true)
```

## 事件处理

### Target-Action 模式

#### `UIControl.Event.valueChanged`

日期选择器值改变时触发的事件

```swift
let datePicker = UIDatePicker()

// 添加值改变事件监听
datePicker.addTarget(self, action: #selector(dateChanged(_:)), for: .valueChanged)

@objc func dateChanged(_ sender: UIDatePicker) {
    let selectedDate = sender.date
    print("选中的日期: \(selectedDate)")
    
    // 格式化日期显示
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "zh_CN")
    formatter.dateStyle = .full
    formatter.timeStyle = .short
    
    let formattedDate = formatter.string(from: selectedDate)
    print("格式化日期: \(formattedDate)")
}
```

## 在 SwiftUI 中使用 UIDatePicker

### 基本 UIViewRepresentable 包装

```swift
struct UIDatePickerWrapper: UIViewRepresentable {
    @Binding var selectedDate: Date
    var datePickerMode: UIDatePicker.Mode = .date
    var preferredStyle: UIDatePickerStyle = .wheels
    var minimumDate: Date? = nil
    var maximumDate: Date? = nil
    var minuteInterval: Int = 1
    var locale: Locale? = nil
    
    func makeUIView(context: Context) -> UIDatePicker {
        let datePicker = UIDatePicker()
        
        // 配置基本属性
        datePicker.datePickerMode = datePickerMode
        datePicker.preferredDatePickerStyle = preferredStyle
        datePicker.minimumDate = minimumDate
        datePicker.maximumDate = maximumDate
        datePicker.minuteInterval = minuteInterval
        datePicker.locale = locale
        
        // 添加事件监听
        datePicker.addTarget(
            context.coordinator,
            action: #selector(Coordinator.dateChanged(_:)),
            for: .valueChanged
        )
        
        return datePicker
    }
    
    func updateUIView(_ uiView: UIDatePicker, context: Context) {
        uiView.date = selectedDate
        uiView.datePickerMode = datePickerMode
        uiView.preferredDatePickerStyle = preferredStyle
        uiView.minimumDate = minimumDate
        uiView.maximumDate = maximumDate
        uiView.minuteInterval = minuteInterval
        uiView.locale = locale
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject {
        let parent: UIDatePickerWrapper
        
        init(_ parent: UIDatePickerWrapper) {
            self.parent = parent
        }
        
        @objc func dateChanged(_ sender: UIDatePicker) {
            parent.selectedDate = sender.date
        }
    }
}
```

### 使用示例

```swift
struct ContentView: View {
    @State private var selectedDate = Date()
    @State private var birthDate = Date()
    @State private var meetingTime = Date()
    
    var body: some View {
        VStack(spacing: 30) {
            // 日期选择器
            VStack {
                Text("选择日期")
                UIDatePickerWrapper(
                    selectedDate: $selectedDate,
                    datePickerMode: .date,
                    preferredStyle: .wheels,
                    locale: Locale(identifier: "zh_CN")
                )
                .frame(height: 200)
            }
            
            // 生日选择器（限制最大日期为今天）
            VStack {
                Text("选择生日")
                UIDatePickerWrapper(
                    selectedDate: $birthDate,
                    datePickerMode: .date,
                    preferredStyle: .graphical,
                    maximumDate: Date()
                )
                .frame(height: 300)
            }
            
            // 会议时间选择器（15分钟间隔）
            VStack {
                Text("选择会议时间")
                UIDatePickerWrapper(
                    selectedDate: $meetingTime,
                    datePickerMode: .time,
                    preferredStyle: .wheels,
                    minuteInterval: 15
                )
                .frame(height: 150)
            }
        }
        .padding()
    }
}
```

## 高级配置示例

### 1. 完全自定义的日期选择器

```swift
struct AdvancedDatePicker: UIViewRepresentable {
    @Binding var selectedDate: Date
    
    let configuration: Configuration
    
    struct Configuration {
        var mode: UIDatePicker.Mode = .date
        var style: UIDatePickerStyle = .wheels
        var minimumDate: Date? = nil
        var maximumDate: Date? = nil
        var minuteInterval: Int = 1
        var locale: Locale? = Locale.current
        var calendar: Calendar? = Calendar.current
        var timeZone: TimeZone? = TimeZone.current
        var backgroundColor: UIColor? = nil
        var tintColor: UIColor? = nil
    }
    
    func makeUIView(context: Context) -> UIDatePicker {
        let datePicker = UIDatePicker()
        
        // 应用配置
        datePicker.datePickerMode = configuration.mode
        datePicker.preferredDatePickerStyle = configuration.style
        datePicker.minimumDate = configuration.minimumDate
        datePicker.maximumDate = configuration.maximumDate
        datePicker.minuteInterval = configuration.minuteInterval
        datePicker.locale = configuration.locale
        datePicker.calendar = configuration.calendar
        datePicker.timeZone = configuration.timeZone
        
        if let backgroundColor = configuration.backgroundColor {
            datePicker.backgroundColor = backgroundColor
        }
        
        if let tintColor = configuration.tintColor {
            datePicker.tintColor = tintColor
        }
        
        datePicker.addTarget(
            context.coordinator,
            action: #selector(Coordinator.dateChanged(_:)),
            for: .valueChanged
        )
        
        return datePicker
    }
    
    func updateUIView(_ uiView: UIDatePicker, context: Context) {
        uiView.date = selectedDate
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject {
        let parent: AdvancedDatePicker
        
        init(_ parent: AdvancedDatePicker) {
            self.parent = parent
        }
        
        @objc func dateChanged(_ sender: UIDatePicker) {
            parent.selectedDate = sender.date
        }
    }
}
```

### 2. 使用示例

```swift
struct AdvancedDatePickerExample: View {
    @State private var selectedDate = Date()
    
    var body: some View {
        AdvancedDatePicker(
            selectedDate: $selectedDate,
            configuration: AdvancedDatePicker.Configuration(
                mode: .dateAndTime,
                style: .graphical,
                minimumDate: Calendar.current.date(byAdding: .day, value: -30, to: Date()),
                maximumDate: Calendar.current.date(byAdding: .day, value: 30, to: Date()),
                minuteInterval: 15,
                locale: Locale(identifier: "zh_CN"),
                backgroundColor: UIColor.systemBackground,
                tintColor: UIColor.systemBlue
            )
        )
        .frame(height: 400)
    }
}
```

## 常见使用场景

### 1. 生日选择器

```swift
struct BirthdayPicker: View {
    @State private var birthDate = Date()
    
    var body: some View {
        UIDatePickerWrapper(
            selectedDate: $birthDate,
            datePickerMode: .date,
            preferredStyle: .graphical,
            maximumDate: Date(), // 不能选择未来日期
            locale: Locale(identifier: "zh_CN")
        )
    }
}
```

### 2. 倒计时选择器

```swift
struct CountdownPicker: View {
    @State private var countdownDate = Date()
    
    var body: some View {
        UIDatePickerWrapper(
            selectedDate: $countdownDate,
            datePickerMode: .countDownTimer,
            preferredStyle: .wheels,
            minuteInterval: 5
        )
    }
}
```

### 3. 会议时间选择器

```swift
struct MeetingTimePicker: View {
    @State private var meetingTime = Date()
    
    private var workingHoursStart: Date {
        Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: Date()) ?? Date()
    }
    
    private var workingHoursEnd: Date {
        Calendar.current.date(bySettingHour: 18, minute: 0, second: 0, of: Date()) ?? Date()
    }
    
    var body: some View {
        UIDatePickerWrapper(
            selectedDate: $meetingTime,
            datePickerMode: .time,
            preferredStyle: .wheels,
            minimumDate: workingHoursStart,
            maximumDate: workingHoursEnd,
            minuteInterval: 30
        )
    }
}
```

## 最佳实践

### 1. 性能优化

```swift
// 避免频繁更新，使用防抖动
class DatePickerViewModel: ObservableObject {
    @Published var selectedDate = Date()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // 防抖动：延迟0.3秒后才处理日期变化
        $selectedDate
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { date in
                self.handleDateChange(date)
            }
            .store(in: &cancellables)
    }
    
    private func handleDateChange(_ date: Date) {
        // 处理日期变化
        print("最终选择的日期: \(date)")
    }
}
```

### 2. 错误处理

```swift
struct SafeDatePicker: UIViewRepresentable {
    @Binding var selectedDate: Date
    let dateRange: ClosedRange<Date>
    
    func makeUIView(context: Context) -> UIDatePicker {
        let datePicker = UIDatePicker()
        
        // 确保初始日期在有效范围内
        let clampedDate = clampDate(selectedDate, to: dateRange)
        datePicker.date = clampedDate
        datePicker.minimumDate = dateRange.lowerBound
        datePicker.maximumDate = dateRange.upperBound
        
        datePicker.addTarget(
            context.coordinator,
            action: #selector(Coordinator.dateChanged(_:)),
            for: .valueChanged
        )
        
        return datePicker
    }
    
    func updateUIView(_ uiView: UIDatePicker, context: Context) {
        let clampedDate = clampDate(selectedDate, to: dateRange)
        if uiView.date != clampedDate {
            uiView.setDate(clampedDate, animated: true)
        }
    }
    
    private func clampDate(_ date: Date, to range: ClosedRange<Date>) -> Date {
        return min(max(date, range.lowerBound), range.upperBound)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject {
        let parent: SafeDatePicker
        
        init(_ parent: SafeDatePicker) {
            self.parent = parent
        }
        
        @objc func dateChanged(_ sender: UIDatePicker) {
            parent.selectedDate = sender.date
        }
    }
}
```

### 3. 国际化支持

```swift
struct LocalizedDatePicker: View {
    @State private var selectedDate = Date()
    
    var body: some View {
        UIDatePickerWrapper(
            selectedDate: $selectedDate,
            datePickerMode: .date,
            preferredStyle: .graphical,
            locale: Locale.current
        )
        .environment(\.locale, Locale.current)
    }
}
```

## 版本兼容性

*   **iOS 2.0+**: 基本 UIDatePicker 功能
*   **iOS 13.4+**: preferredDatePickerStyle 属性
*   **iOS 14.0+**: graphical 样式
*   **iOS 15.0+**: 改进的紧凑样式支持

## 常见问题解决

### 1. 样式不生效

```swift
// 确保在 iOS 13.4+ 中设置样式
if #available(iOS 13.4, *) {
    datePicker.preferredDatePickerStyle = .wheels
}
```

### 2. 日期格式问题

```swift
// 使用正确的 Locale 和 Calendar
datePicker.locale = Locale(identifier: "zh_CN")
datePicker.calendar = Calendar(identifier: .gregorian)
```

### 3. 约束问题

```swift
// 设置正确的约束优先级
datePicker.setContentHuggingPriority(.defaultLow, for: .horizontal)
datePicker.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
```

UIDatePicker 是一个功能强大且灵活的日期时间选择控件，通过合理使用其 API 可以创建出优秀的用户体验。记住要根据具体的使用场景选择合适的模式和样式，并注意处理边界情况和国际化需求。
