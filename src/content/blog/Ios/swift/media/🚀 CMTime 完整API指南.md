---
title: "CMTime 完整API指南"
description: "CMTime 是 Core Media 框架中用于表示时间值的结构体，广泛用于音视频处理、AVPlayer、AVAsset 等场景。它提供了高精度的时间表示和丰富的时间操作功能。"
pubDate: 2026-05-29
category: "media"
tags: [Swift, API]
draft: false
---
# 🚀 CMTime 完整API指南

CMTime 是 Core Media 框架中用于表示时间值的结构体，广泛用于音视频处理、AVPlayer、AVAsset 等场景。它提供了高精度的时间表示和丰富的时间操作功能。

## 基本概念

CMTime 使用分数来表示时间：**时间 = value / timescale**

- `value`: 分子，表示时间单位的数量
- `timescale`: 分母，表示每秒的时间单位数
- 例如：`CMTime(value: 3000, timescale: 1000)` = 3000/1000 = 3 秒

## 核心属性

### 基本属性

```swift
// 时间值（分子）
var value: CMTimeValue { get set }

// 时间刻度（分母，每秒的单位数）
var timescale: CMTimeScale { get set }

// 时间标志位
var flags: CMTimeFlags { get set }

// 纪元（时间基准）
var epoch: CMTimeEpoch { get set }
```

### 只读计算属性

```swift
// 转换为秒数（Double）
var seconds: Double { get }

// 是否为有效时间
var isValid: Bool { get }

// 是否为无穷大
var isIndefinite: Bool { get }

// 是否为正无穷
var isPositiveInfinite: Bool { get }

// 是否为负无穷
var isNegativeInfinite: Bool { get }

// 是否为数值时间（非特殊值）
var isNumeric: Bool { get }

// 是否包含舍入误差标志
var hasBeenRounded: Bool { get }
```

## 构造方法

### 基本构造器

```swift
// 默认构造器（无效时间）
CMTime()

// 使用 value 和 timescale
CMTime(value: CMTimeValue, timescale: CMTimeScale)

// 使用 value、timescale、flags 和 epoch
CMTime(value: CMTimeValue, 
       timescale: CMTimeScale, 
       flags: CMTimeFlags, 
       epoch: CMTimeEpoch)

// 从秒数创建
CMTime(seconds: Double, preferredTimescale: CMTimeScale)

// 示例
let time1 = CMTime(value: 1500, timescale: 1000) // 1.5秒
let time2 = CMTime(seconds: 2.5, preferredTimescale: 1000) // 2.5秒
```

### 便利构造器

```swift
// 使用有理数创建
CMTime(value: Int64, timescale: Int32)

// 从 NSTimeInterval 创建
CMTime(timeInterval: TimeInterval, timescale: CMTimeScale)
```

## 预定义常量

### 特殊时间值

```swift
// 无效时间
static let invalid = CMTime.invalid

// 正无穷大
static let positiveInfinity = CMTime.positiveInfinity

// 负无穷大  
static let negativeInfinity = CMTime.negativeInfinity

// 无限期（不确定时间）
static let indefinite = CMTime.indefinite

// 零时间
static let zero = CMTime.zero

// 示例
let invalidTime = CMTime.invalid
let infiniteTime = CMTime.positiveInfinity
let zeroTime = CMTime.zero
```

## 运算符重载

### 算术运算符

```swift
// 加法
func +(lhs: CMTime, rhs: CMTime) -> CMTime

// 减法
func -(lhs: CMTime, rhs: CMTime) -> CMTime

// 乘法（时间 * 标量）
func *(lhs: CMTime, rhs: Float64) -> CMTime
func *(lhs: CMTime, rhs: Int32) -> CMTime

// 除法（时间 / 标量）
func /(lhs: CMTime, rhs: Float64) -> CMTime
func /(lhs: CMTime, rhs: Int32) -> CMTime

// 示例
let time1 = CMTime(seconds: 1.0, preferredTimescale: 1000)
let time2 = CMTime(seconds: 2.0, preferredTimescale: 1000)
let sum = time1 + time2        // 3.0秒
let diff = time2 - time1       // 1.0秒
let doubled = time1 * 2.0      // 2.0秒
let half = time1 / 2.0         // 0.5秒
```

### 比较运算符

```swift
// 相等
func ==(lhs: CMTime, rhs: CMTime) -> Bool

// 不等
func !=(lhs: CMTime, rhs: CMTime) -> Bool

// 小于
func <(lhs: CMTime, rhs: CMTime) -> Bool

// 小于等于
func <=(lhs: CMTime, rhs: CMTime) -> Bool

// 大于
func >(lhs: CMTime, rhs: CMTime) -> Bool

// 大于等于
func >=(lhs: CMTime, rhs: CMTime) -> Bool

// 示例
let time1 = CMTime(seconds: 1.0, preferredTimescale: 1000)
let time2 = CMTime(seconds: 2.0, preferredTimescale: 1000)
print(time1 < time2)  // true
print(time1 == time1) // true
```

## 全局函数

### 时间转换函数

```swift
// CMTime 转换为秒数
func CMTimeGetSeconds(_ time: CMTime) -> Float64

// 创建时间从秒数
func CMTimeMakeWithSeconds(_ seconds: Float64, _ preferredTimescale: CMTimeScale) -> CMTime

// 创建时间从分数
func CMTimeMake(_ value: CMTimeValue, _ timescale: CMTimeScale) -> CMTime

// 示例
let time = CMTime(seconds: 3.14, preferredTimescale: 1000)
let seconds = CMTimeGetSeconds(time) // 3.14
let newTime = CMTimeMakeWithSeconds(5.0, 1000) // 5秒
```

### 时间比较函数

```swift
// 比较两个时间
func CMTimeCompare(_ time1: CMTime, _ time2: CMTime) -> Int32

// 检查时间相等（考虑误差）
func CMTimeEqualToTime(_ time1: CMTime, _ time2: CMTime) -> Bool

// 示例
let time1 = CMTime(seconds: 1.0, preferredTimescale: 1000)
let time2 = CMTime(seconds: 2.0, preferredTimescale: 1000)
let result = CMTimeCompare(time1, time2) // -1 (time1 < time2)
```

### 时间运算函数

```swift
// 时间相加
func CMTimeAdd(_ addend1: CMTime, _ addend2: CMTime) -> CMTime

// 时间相减
func CMTimeSubtract(_ minuend: CMTime, _ subtrahend: CMTime) -> CMTime

// 时间乘法
func CMTimeMultiply(_ time: CMTime, _ multiplier: Int32) -> CMTime
func CMTimeMultiplyByFloat64(_ time: CMTime, _ multiplier: Float64) -> CMTime

// 时间除法
func CMTimeDivide(_ time: CMTime, _ divisor: Int32) -> CMTime

// 示例
let time1 = CMTime(seconds: 1.5, preferredTimescale: 1000)
let time2 = CMTime(seconds: 0.5, preferredTimescale: 1000)
let sum = CMTimeAdd(time1, time2)           // 2.0秒
let product = CMTimeMultiplyByFloat64(time1, 2.0) // 3.0秒
```

### 时间范围函数

```swift
// 获取最小时间
func CMTimeMinimum(_ time1: CMTime, _ time2: CMTime) -> CMTime

// 获取最大时间
func CMTimeMaximum(_ time1: CMTime, _ time2: CMTime) -> CMTime

// 获取绝对值
func CMTimeAbsoluteValue(_ time: CMTime) -> CMTime

// 示例
let time1 = CMTime(seconds: -1.5, preferredTimescale: 1000)
let time2 = CMTime(seconds: 2.0, preferredTimescale: 1000)
let minTime = CMTimeMinimum(time1, time2)    // -1.5秒
let maxTime = CMTimeMaximum(time1, time2)    // 2.0秒
let absTime = CMTimeAbsoluteValue(time1)     // 1.5秒
```

### 时间转换和格式化函数

```swift
// 转换时间刻度
func CMTimeConvertScale(_ time: CMTime, 
                       _ newTimescale: CMTimeScale, 
                       _ method: CMTimeRoundingMethod) -> CMTime

// 从字符串创建时间
func CMTimeMakeFromDictionary(_ dictionaryRepresentation: CFDictionary) -> CMTime

// 转换为字典
func CMTimeCopyAsDictionary(_ time: CMTime, _ allocator: CFAllocator?) -> CFDictionary

// 转换为描述字符串
func CMTimeCopyDescription(_ allocator: CFAllocator?, _ time: CMTime) -> CFString

// 示例
let time = CMTime(seconds: 1.5, preferredTimescale: 600)
let convertedTime = CMTimeConvertScale(time, 1000, .default)
let description = CMTimeCopyDescription(nil, time)
```

## CMTimeFlags 枚举

### 时间标志位

```swift
struct CMTimeFlags: OptionSet {
    static let valid = CMTimeFlags(rawValue: 1 << 0)              // 有效时间
    static let hasBeenRounded = CMTimeFlags(rawValue: 1 << 1)     // 已被舍入
    static let positiveInfinity = CMTimeFlags(rawValue: 1 << 2)   // 正无穷
    static let negativeInfinity = CMTimeFlags(rawValue: 1 << 3)   // 负无穷
    static let indefinite = CMTimeFlags(rawValue: 1 << 4)         // 不确定
    static let impliedValueFlagsMask = CMTimeFlags(rawValue: 0x1C) // 隐含值标志掩码
}

// 使用示例
let flags: CMTimeFlags = [.valid, .hasBeenRounded]
let time = CMTime(value: 1000, timescale: 1000, flags: flags, epoch: 0)
```

## CMTimeRoundingMethod 枚举

### 舍入方法

```swift
enum CMTimeRoundingMethod: UInt32 {
    case roundHalfAwayFromZero = 1  // 四舍五入（远离零）
    case roundTowardZero = 2        // 向零舍入
    case roundAwayFromZero = 3      // 远离零舍入
    case quickTime = 4              // QuickTime 舍入
    case `default` = 1              // 默认舍入方法
}

// 使用示例
let originalTime = CMTime(value: 1001, timescale: 1000) // 1.001秒
let roundedTime = CMTimeConvertScale(originalTime, 100, .roundHalfAwayFromZero)
```

## 实用扩展和工具

### 便利扩展

```swift
extension CMTime {
    
    // 转换为毫秒
    var milliseconds: Double {
        return seconds * 1000.0
    }
    
    // 从毫秒创建
    static func fromMilliseconds(_ ms: Double, timescale: CMTimeScale = 1000) -> CMTime {
        return CMTime(seconds: ms / 1000.0, preferredTimescale: timescale)
    }
    
    // 转换为分钟
    var minutes: Double {
        return seconds / 60.0
    }
    
    // 格式化为时间字符串 (HH:MM:SS)
    var timeString: String {
        let totalSeconds = Int(seconds)
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60
        
        if hours > 0 {
            return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
    
    // 检查是否接近另一个时间（在误差范围内）
    func isClose(to other: CMTime, tolerance: CMTime) -> Bool {
        let diff = CMTimeAbsoluteValue(CMTimeSubtract(self, other))
        return CMTimeCompare(diff, tolerance) <= 0
    }
}

// 使用示例
let time = CMTime(seconds: 125.5, preferredTimescale: 1000)
print(time.milliseconds)  // 125500.0
print(time.minutes)       // 2.0916666666666666
print(time.timeString)    // "02:05"

let closeTime = CMTime(seconds: 125.6, preferredTimescale: 1000)
let tolerance = CMTime(seconds: 0.2, preferredTimescale: 1000)
print(time.isClose(to: closeTime, tolerance: tolerance)) // true
```

### 时间范围处理

```swift
extension CMTime {
    
    // 夹紧在指定范围内
    func clamped(to range: ClosedRange<CMTime>) -> CMTime {
        if CMTimeCompare(self, range.lowerBound) < 0 {
            return range.lowerBound
        } else if CMTimeCompare(self, range.upperBound) > 0 {
            return range.upperBound
        } else {
            return self
        }
    }
    
    // 线性插值
    static func lerp(from start: CMTime, to end: CMTime, factor: Double) -> CMTime {
        let diff = CMTimeSubtract(end, start)
        let offset = CMTimeMultiplyByFloat64(diff, factor)
        return CMTimeAdd(start, offset)
    }
}

// 使用示例
let time = CMTime(seconds: 10.0, preferredTimescale: 1000)
let range = CMTime(seconds: 2.0, preferredTimescale: 1000)...CMTime(seconds: 8.0, preferredTimescale: 1000)
let clampedTime = time.clamped(to: range) // 8.0秒

let startTime = CMTime(seconds: 0.0, preferredTimescale: 1000)
let endTime = CMTime(seconds: 10.0, preferredTimescale: 1000)
let midTime = CMTime.lerp(from: startTime, to: endTime, factor: 0.5) // 5.0秒
```

## 常见使用场景

### 1. 视频播放器时间显示

```swift
class VideoPlayer {
    var player = AVPlayer()
    
    func updateTimeDisplay() {
        guard let currentItem = player.currentItem else { return }
        
        let currentTime = player.currentTime()
        let duration = currentItem.duration
        
        let currentSeconds = CMTimeGetSeconds(currentTime)
        let totalSeconds = CMTimeGetSeconds(duration)
        
        print("播放进度: \(currentTime.timeString) / \(duration.timeString)")
        print("进度百分比: \(currentSeconds / totalSeconds * 100)%")
    }
}
```

### 2. 精确的时间计算

```swift
class TimeCalculator {
    
    // 计算帧数对应的时间
    func timeForFrame(_ frameNumber: Int, frameRate: Float) -> CMTime {
        let timescale: CMTimeScale = 1000
        let secondsPerFrame = 1.0 / Double(frameRate)
        let totalSeconds = Double(frameNumber) * secondsPerFrame
        return CMTime(seconds: totalSeconds, preferredTimescale: timescale)
    }
    
    // 计算两个时间点之间的帧数
    func framesBetween(start: CMTime, end: CMTime, frameRate: Float) -> Int {
        let duration = CMTimeSubtract(end, start)
        let seconds = CMTimeGetSeconds(duration)
        return Int(seconds * Double(frameRate))
    }
}

// 使用示例
let calculator = TimeCalculator()
let frameTime = calculator.timeForFrame(30, frameRate: 30.0) // 第30帧的时间
let frameCount = calculator.framesBetween(
    start: CMTime.zero,
    end: CMTime(seconds: 2.0, preferredTimescale: 1000),
    frameRate: 30.0
) // 60帧
```

### 3. 时间同步和缓冲

```swift
class TimeSynchronizer {
    
    // 检查时间是否在缓冲区内
    func isTimeInBuffer(_ time: CMTime, bufferStart: CMTime, bufferDuration: CMTime) -> Bool {
        let bufferEnd = CMTimeAdd(bufferStart, bufferDuration)
        return CMTimeCompare(time, bufferStart) >= 0 && CMTimeCompare(time, bufferEnd) <= 0
    }
    
    // 计算缓冲进度
    func bufferProgress(for time: CMTime, bufferStart: CMTime, bufferDuration: CMTime) -> Double {
        guard CMTimeGetSeconds(bufferDuration) > 0 else { return 0.0 }
        
        let timeFromStart = CMTimeSubtract(time, bufferStart)
        let timeSeconds = max(0, CMTimeGetSeconds(timeFromStart))
        let bufferSeconds = CMTimeGetSeconds(bufferDuration)
        
        return min(1.0, timeSeconds / bufferSeconds)
    }
}
```

## 注意事项和最佳实践

### 1. 时间精度选择

```swift
// ❌ 不好的做法：使用过高的精度
let badTime = CMTime(value: 1, timescale: 1000000000)

// ✅ 好的做法：选择合适的精度
let goodTime = CMTime(seconds: 1.0, preferredTimescale: 1000) // 毫秒精度通常够用
```

### 2. 特殊值检查

```swift
func safeTimeOperation(_ time: CMTime) -> CMTime? {
    // 总是检查特殊值
    guard time.isValid && time.isNumeric else {
        print("时间值无效或为特殊值")
        return nil
    }
    
    // 执行时间运算
    return CMTimeAdd(time, CMTime(seconds: 1.0, preferredTimescale: 1000))
}
```

### 3. 性能优化

```swift
// ✅ 缓存经常使用的时间值
let oneSecond = CMTime(seconds: 1.0, preferredTimescale: 1000)
let zeroTime = CMTime.zero

// ✅ 使用相同的 timescale 进行运算以避免转换
let time1 = CMTime(value: 1000, timescale: 1000)
let time2 = CMTime(value: 2000, timescale: 1000) // 使用相同的 timescale
let sum = CMTimeAdd(time1, time2) // 不需要时间刻度转换
```

CMTime 是音视频处理的核心数据类型，掌握其API对于开发高质量的媒体应用至关重要。通过合理使用这些API和遵循最佳实践，可以构建精确、高效的时间处理系统。