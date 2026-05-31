---
title: "Swift String 完整参考手册"
description: ""
pubDate: 2026-05-29
category: "Swift"
tags: [iOS, Swift, Array, API]
draft: false
---
# 🚀 Swift String 完整参考手册

## 目录
1. [基础属性](#基础属性)
2. [创建和初始化](#创建和初始化)
3. [字符串操作](#字符串操作)
4. [查找和搜索](#查找和搜索)
5. [转换和格式化](#转换和格式化)
6. [比较操作](#比较操作)
7. [子字符串操作](#子字符串操作)
8. [编码和解码](#编码和解码)
9. [正则表达式](#正则表达式)
10. [Unicode 操作](#unicode-操作)
11. [常用扩展方法](#常用扩展方法)

---

## 基础属性

### 长度和容量

```swift
let str = "Hello, World!"

// 字符数量
str.count                    // 13

// 是否为空
str.isEmpty                  // false

// UTF-8 视图
str.utf8.count              // 13

// UTF-16 视图
str.utf16.count             // 13

// Unicode 标量视图
str.unicodeScalars.count    // 13

// 字符视图
str.characters              // 已废弃，直接遍历 String
```

### 索引

```swift
let str = "Swift"

// 起始索引
str.startIndex              // String.Index

// 结束索引（不包含）
str.endIndex                // String.Index

// 第一个字符
str.first                   // Optional("S")

// 最后一个字符
str.last                    // Optional("t")

// 通过索引访问
str[str.startIndex]         // "S"

// 偏移索引
let index = str.index(str.startIndex, offsetBy: 2)
str[index]                  // "i"

// 索引之前/之后
str.index(before: str.endIndex)
str.index(after: str.startIndex)
```

---

## 创建和初始化

### 基本初始化

```swift
// 空字符串
let empty1 = ""
let empty2 = String()

// 从字符数组
let chars: [Character] = ["H", "e", "l", "l", "o"]
let str1 = String(chars)    // "Hello"

// 重复字符
let str2 = String(repeating: "Hi", count: 3)  // "HiHiHi"

// 从其他类型
let str3 = String(123)              // "123"
let str4 = String(3.14)             // "3.14"
let str5 = String(true)             // "true"
let str6 = String(describing: nil)  // "nil"

// 从数据
let data = "Hello".data(using: .utf8)!
let str7 = String(data: data, encoding: .utf8)  // Optional("Hello")

// 从文件
let path = "/path/to/file.txt"
let str8 = try? String(contentsOfFile: path)
let str9 = try? String(contentsOf: URL(fileURLWithPath: path))
```

### 字符串插值

```swift
let name = "Alice"
let age = 25

// 基本插值
let message1 = "My name is \(name)"

// 多个变量
let message2 = "\(name) is \(age) years old"

// 表达式
let message3 = "Next year I'll be \(age + 1)"

// 格式化
let pi = 3.1415926
let message4 = "Pi is \(String(format: "%.2f", pi))"  // "Pi is 3.14"
```

---

## 字符串操作

### 连接和追加

```swift
var str = "Hello"

// 使用 + 运算符
let str1 = str + " World"       // "Hello World"

// 使用 += 运算符
str += " Swift"                 // "Hello Swift"

// append 方法
str.append("!")                 // "Hello Swift!"
str.append(contentsOf: " 2024") // "Hello Swift! 2024"

// 连接数组
let words = ["Swift", "is", "awesome"]
let sentence = words.joined(separator: " ")  // "Swift is awesome"
```

### 插入和删除

```swift
var str = "Hello World"

// 在指定位置插入
let index = str.index(str.startIndex, offsetBy: 5)
str.insert("!", at: index)      // "Hello! World"

// 插入字符串
str.insert(contentsOf: " there", at: index)  // "Hello there! World"

// 删除单个字符
str.remove(at: index)           // 删除索引处的字符

// 删除范围
let range = str.startIndex..<str.index(str.startIndex, offsetBy: 5)
str.removeSubrange(range)       // 删除前5个字符

// 删除所有字符
str.removeAll()                 // ""
str.removeAll(keepingCapacity: true)  // 保留容量

// 删除首尾字符
var str2 = "Swift"
str2.removeFirst()              // "wift"
str2.removeLast()               // "wif"
```

### 替换

```swift
var str = "Hello World"

// 替换范围
let range = str.startIndex..<str.index(str.startIndex, offsetBy: 5)
str.replaceSubrange(range, with: "Hi")  // "Hi World"

// 替换所有出现（需要 Foundation）
import Foundation
let str2 = str.replacingOccurrences(of: "World", with: "Swift")  // "Hi Swift"

// 正则替换
let str3 = str.replacingOccurrences(
    of: "\\d+",
    with: "X",
    options: .regularExpression
)
```

### 大小写转换

```swift
let str = "Hello World"

// 转大写
str.uppercased()                // "HELLO WORLD"

// 转小写
str.lowercased()                // "hello world"

// 首字母大写（需要 Foundation）
str.capitalized                 // "Hello World"

// 本地化大小写转换
str.uppercased(with: Locale(identifier: "tr"))
str.lowercased(with: Locale(identifier: "tr"))
```

### 修剪空白

```swift
let str = "  Hello World  \n"

// 去除首尾空白（需要 Foundation）
import Foundation
str.trimmingCharacters(in: .whitespaces)              // "Hello World  \n"
str.trimmingCharacters(in: .whitespacesAndNewlines)   // "Hello World"

// 自定义字符集
str.trimmingCharacters(in: CharacterSet(charactersIn: " H"))  // "ello World  \n"
```

---

## 查找和搜索

### 前缀和后缀

```swift
let str = "Hello.swift"

// 检查前缀
str.hasPrefix("Hello")          // true
str.hasPrefix("hello")          // false

// 检查后缀
str.hasSuffix(".swift")         // true
str.hasSuffix(".txt")           // false

// 删除前缀（iOS 16+）
str.trimmingPrefix("Hello")     // ".swift"

// 删除后缀
if str.hasSuffix(".swift") {
    let name = String(str.dropLast(6))  // "Hello"
}
```

### 包含和查找

```swift
let str = "Hello World"

// 检查包含
str.contains("World")           // true
str.contains("world")           // false

// 查找第一次出现的位置
if let range = str.range(of: "World") {
    let index = str.distance(from: str.startIndex, to: range.lowerBound)  // 6
}

// 查找最后一次出现
str.range(of: "o", options: .backwards)

// 不区分大小写查找
str.range(of: "world", options: .caseInsensitive)

// 正则查找
str.range(of: "W\\w+", options: .regularExpression)

// 查找所有出现
import Foundation
let text = "apple banana apple"
var searchRange = text.startIndex..<text.endIndex
var ranges: [Range<String.Index>] = []

while let range = text.range(of: "apple", range: searchRange) {
    ranges.append(range)
    searchRange = range.upperBound..<text.endIndex
}
// ranges 包含所有 "apple" 的位置
```

### 过滤

```swift
let str = "Hello123World456"

// 过滤数字
let lettersOnly = str.filter { $0.isLetter }           // "HelloWorld"

// 过滤字母
let numbersOnly = str.filter { $0.isNumber }           // "123456"

// 自定义过滤
let noVowels = str.filter { !"aeiouAEIOU".contains($0) }  // "Hll123Wrld456"
```

---

## 转换和格式化

### 数字转换

```swift
let str1 = "123"
let str2 = "3.14"
let str3 = "FF"
let str4 = "true"

// 转 Int
Int(str1)                       // Optional(123)
Int(str3, radix: 16)           // Optional(255) 十六进制

// 转 Double
Double(str2)                    // Optional(3.14)

// 转 Float
Float(str2)                     // Optional(3.14)

// 转 Bool
Bool(str4)                      // Optional(true)

// NSNumber（需要 Foundation）
import Foundation
let formatter = NumberFormatter()
formatter.number(from: "1,234.56")  // Optional(1234.56)
```

### 日期转换

```swift
import Foundation

let dateStr = "2024-01-15"

// ISO8601 格式
let isoFormatter = ISO8601DateFormatter()
let date1 = isoFormatter.date(from: "2024-01-15T10:30:00Z")

// 自定义格式
let formatter = DateFormatter()
formatter.dateFormat = "yyyy-MM-dd"
let date2 = formatter.date(from: dateStr)

// 反向转换
formatter.string(from: Date())  // "2024-01-15"
```

### URL 编码

```swift
import Foundation

let str = "Hello World & 你好"

// URL 编码
str.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
// "Hello%20World%20&%20%E4%BD%A0%E5%A5%BD"

// URL 解码
let encoded = "Hello%20World"
encoded.removingPercentEncoding  // "Hello World"
```

### Base64 编码

```swift
import Foundation

let str = "Hello World"
let data = str.data(using: .utf8)!

// Base64 编码
let base64 = data.base64EncodedString()  // "SGVsbG8gV29ybGQ="

// Base64 解码
if let decoded = Data(base64Encoded: base64) {
    let original = String(data: decoded, encoding: .utf8)  // "Hello World"
}
```

---

## 比较操作

### 相等比较

```swift
let str1 = "Hello"
let str2 = "Hello"
let str3 = "hello"

// 相等
str1 == str2                    // true
str1 == str3                    // false

// 不相等
str1 != str3                    // true

// 不区分大小写比较
str1.caseInsensitiveCompare(str3) == .orderedSame  // true
```

### 字典序比较

```swift
let str1 = "Apple"
let str2 = "Banana"

// 小于
str1 < str2                     // true

// 大于
str1 > str2                     // false

// compare 方法
str1.compare(str2)              // .orderedAscending

// 本地化比较
str1.localizedCompare(str2)
str1.localizedStandardCompare(str2)
str1.localizedCaseInsensitiveCompare(str2)
```

---

## 子字符串操作

### 提取子字符串

```swift
let str = "Hello, World!"

// 使用下标范围
let start = str.index(str.startIndex, offsetBy: 7)
let end = str.index(str.startIndex, offsetBy: 12)
let substring = str[start..<end]    // "World"

// 转换为 String
let result = String(substring)      // "World"

// prefix - 前 n 个字符
str.prefix(5)                       // "Hello"

// suffix - 后 n 个字符
str.suffix(6)                       // "World!"

// dropFirst - 删除前 n 个
str.dropFirst(7)                    // "World!"

// dropLast - 删除后 n 个
str.dropLast(1)                     // "Hello, World"

// 条件删除
str.drop(while: { $0 != "," })      // ", World!"
```

### 分割

```swift
let str = "apple,banana,orange"

// 按分隔符分割
let fruits = str.split(separator: ",")  // ["apple", "banana", "orange"]

// 转为 String 数组
let array = fruits.map(String.init)

// 限制分割次数
str.split(separator: ",", maxSplits: 1)  // ["apple", "banana,orange"]

// 省略空结果
"a,,b".split(separator: ",")        // ["a", "b"]
"a,,b".split(separator: ",", omittingEmptySubsequences: false)  // ["a", "", "b"]

// components (需要 Foundation)
import Foundation
str.components(separatedBy: ",")    // ["apple", "banana", "orange"]

// 按字符集分割
"one-two_three".components(separatedBy: CharacterSet(charactersIn: "-_"))
// ["one", "two", "three"]

// 按行分割
let multiline = "line1\nline2\nline3"
multiline.components(separatedBy: .newlines)  // ["line1", "line2", "line3"]
```

---

## 编码和解码

### UTF-8/UTF-16

```swift
let str = "Hello 你好"

// UTF-8
let utf8Data = str.data(using: .utf8)!
let utf8Array = Array(str.utf8)

// UTF-16
let utf16Data = str.data(using: .utf16)!
let utf16Array = Array(str.utf16)

// 从数据创建
String(data: utf8Data, encoding: .utf8)

// 字节数组
let bytes: [UInt8] = [72, 101, 108, 108, 111]
String(bytes: bytes, encoding: .utf8)  // "Hello"
```

### 其他编码

```swift
import Foundation

let str = "Hello"

// 支持的编码
String.Encoding.utf8
String.Encoding.utf16
String.Encoding.utf32
String.Encoding.ascii
String.Encoding.unicode
String.Encoding.isoLatin1

// 编码转换
let data = str.data(using: .utf8)!
String(data: data, encoding: .isoLatin1)
```

---

## 正则表达式

### iOS 16+ 新 API

```swift
import RegexBuilder

let str = "My email is test@example.com"

// 创建正则
let emailRegex = /\w+@\w+\.\w+/

// 查找第一个匹配
if let match = str.firstMatch(of: emailRegex) {
    print(match.0)  // "test@example.com"
}

// 查找所有匹配
let matches = str.matches(of: emailRegex)

// 替换
str.replacing(emailRegex, with: "***@***.***")

// 使用 Regex Builder
let pattern = Regex {
    OneOrMore(.word)
    "@"
    OneOrMore(.word)
    "."
    OneOrMore(.word)
}
```

### 传统 NSRegularExpression

```swift
import Foundation

let str = "Call me at 123-456-7890"
let pattern = "\\d{3}-\\d{3}-\\d{4}"

if let regex = try? NSRegularExpression(pattern: pattern) {
    let range = NSRange(str.startIndex..., in: str)
    
    // 查找
    if let match = regex.firstMatch(in: str, range: range) {
        if let matchRange = Range(match.range, in: str) {
            print(str[matchRange])  // "123-456-7890"
        }
    }
    
    // 替换
    let replaced = regex.stringByReplacingMatches(
        in: str,
        range: range,
        withTemplate: "***-***-****"
    )
}
```

---

## Unicode 操作

### Unicode 标量

```swift
let str = "Hello 👋 你好"

// 遍历 Unicode 标量
for scalar in str.unicodeScalars {
    print(scalar.value)  // Unicode 码点值
}

// 创建字符
let wave = "\u{1F44B}"  // 👋
let hello = "\u{4F60}\u{597D}"  // 你好

// 判断
for scalar in str.unicodeScalars {
    if scalar.value > 0x10000 {
        print("This is an emoji or extended character")
    }
}
```

### 字符属性

```swift
let char: Character = "A"

// 是否字母
char.isLetter           // true

// 是否数字
char.isNumber           // false

// 是否空白
char.isWhitespace       // false

// 是否换行
char.isNewline          // false

// 是否大写
char.isUppercase        // true

// 是否小写
char.isLowercase        // false

// 是否标点
char.isPunctuation      // false

// 是否符号
char.isSymbol           // false
```

---

## 常用扩展方法

### 自定义扩展示例

```swift
extension String {
    // 下标访问（安全）
    subscript(offset: Int) -> Character? {
        guard offset >= 0, offset < count else { return nil }
        let index = self.index(startIndex, offsetBy: offset)
        return self[index]
    }
    
    // 范围下标
    subscript(range: Range<Int>) -> Substring? {
        guard range.lowerBound >= 0, range.upperBound <= count else { return nil }
        let start = index(startIndex, offsetBy: range.lowerBound)
        let end = index(startIndex, offsetBy: range.upperBound)
        return self[start..<end]
    }
    
    // 反转
    func reversed() -> String {
        return String(self.reversed())
    }
    
    // 重复
    func repeated(_ times: Int) -> String {
        return String(repeating: self, count: times)
    }
    
    // 是否只包含字母
    var isAlphabetic: Bool {
        return !isEmpty && allSatisfy { $0.isLetter }
    }
    
    // 是否只包含数字
    var isNumeric: Bool {
        return !isEmpty && allSatisfy { $0.isNumber }
    }
    
    // 是否只包含字母和数字
    var isAlphanumeric: Bool {
        return !isEmpty && allSatisfy { $0.isLetter || $0.isNumber }
    }
    
    // MD5 哈希（需要 CryptoKit）
    var md5: String {
        guard let data = data(using: .utf8) else { return "" }
        // 实现 MD5 哈希...
        return ""
    }
}
```

### 使用示例

```swift
let str = "Hello World"

// 安全下标
str[0]              // Optional("H")
str[100]            // nil

// 范围
str[0..<5]          // Optional("Hello")

// 反转
str.reversed()      // "dlroW olleH"

// 检查类型
"abc".isAlphabetic      // true
"123".isNumeric         // true
"abc123".isAlphanumeric // true
```

---

## 性能提示

1. **使用 Substring 而非 String** - 避免不必要的复制
2. **避免频繁的字符串拼接** - 使用 `joined()` 或字符串插值
3. **使用 `contains` 而非 `range(of:)` ** - 如果只需要检查存在性
4. **预先分配容量** - 如果知道最终大小
5. **使用 `reserveCapacity(_:)`** - 减少内存分配次数

```swift
// 好的做法
var result = ""
result.reserveCapacity(1000)
for i in 0..<100 {
    result += String(i)
}

// 更好的做法
let result = (0..<100).map(String.init).joined()
```

---

## 常见陷阱

1. **String.Index 不是 Int** - 不能直接用整数索引
2. **Substring 与 String 不同** - 需要转换
3. **Unicode 字符可能占用多个 Character** - 如 emoji
4. **大小写转换不总是 1:1** - 如德语 ß
5. **字符串是值类型** - 修改会创建新副本（写时复制）

---

## 总结

String 是 Swift 中最常用的类型之一，提供了丰富的 API 用于：
- ✅ 创建和初始化
- ✅ 字符串操作（拼接、插入、删除、替换）
- ✅ 查找和搜索
- ✅ 转换和格式化
- ✅ 比较和排序
- ✅ 子字符串提取
- ✅ 编码和解码
- ✅ 正则表达式
- ✅ Unicode 支持

熟练掌握这些 API 能大大提高开发效率！