---
title: "Data API"
description: "Data 是 Swift Foundation 框架中的一个结构体，用于表示字节缓冲区。它是一个值类型，提供了强大的数据操作功能，常用于网络请求、文件操作、加密解密等场景。"
pubDate: 2026-05-29
category: "Swift"
tags: [iOS, Swift, Array, API]
draft: false
---
# Swift Data API 完整指南

## 概述

`Data` 是 Swift Foundation 框架中的一个结构体，用于表示字节缓冲区。它是一个值类型，提供了强大的数据操作功能，常用于网络请求、文件操作、加密解密等场景。

## 基本特性

*   **值类型**：`Data` 是结构体，遵循值语义
*   **内存安全**：自动管理内存，防止缓冲区溢出
*   **高效**：支持写时复制（Copy-on-Write）
*   **可变性**：支持可变和不可变操作

## 初始化方法

### 1. 基本初始化

```swift
// 空数据
let emptyData = Data()

// 从字节数组创建
let bytes: [UInt8] = [0x48, 0x65, 0x6C, 0x6C, 0x6F] // "Hello"
let dataFromBytes = Data(bytes)

// 从重复字节创建
let repeatedData = Data(repeating: 0xFF, count: 5)

// 从容量创建
let dataWithCapacity = Data(capacity: 100)
```

### 2. 从字符串创建

```swift
// 使用 UTF-8 编码
let string = "Hello, 世界!"
let dataFromString = string.data(using: .utf8)!

// 使用其他编码
let dataFromStringUTF16 = string.data(using: .utf16)!
```

### 3. 从文件创建

```swift
// 从文件路径创建
let fileURL = URL(fileURLWithPath: "/path/to/file.txt")
do {
    let dataFromFile = try Data(contentsOf: fileURL)
} catch {
    print("读取文件失败: \(error)")
}
```

## 核心 API 详解

### 1. 属性和基本操作

```swift
let data = "Hello".data(using: .utf8)!

// 获取字节数
print("字节数: \(data.count)")  // 输出: 字节数: 5

// 检查是否为空
print("是否为空: \(data.isEmpty)")  // 输出: 是否为空: false

// 获取原始字节指针
data.withUnsafeBytes { bytes in
    for byte in bytes {
        print("字节值: \(byte)")
    }
}
```

### 2. 访问和修改数据

```swift
var mutableData = Data("Hello".utf8)

// 通过下标访问
print("第一个字节: \(mutableData[0])")  // 输出: 第一个字节: 72

// 获取子数据
let subData = mutableData.subdata(in: 1..<4)
print("子数据: \(String(data: subData, encoding: .utf8)!)")  // 输出: 子数据: ell

// 追加数据
mutableData.append(" World".data(using: .utf8)!)
print("追加后: \(String(data: mutableData, encoding: .utf8)!)")  // 输出: 追加后: Hello World

// 插入数据
let insertData = ", ".data(using: .utf8)!
mutableData.insert(contentsOf: insertData, at: 5)
print("插入后: \(String(data: mutableData, encoding: .utf8)!)")  // 输出: 插入后: Hello, World
```

### 3. 数据转换

```swift
let originalData = "Hello, 世界!".data(using: .utf8)!

// 转换为字符串
if let string = String(data: originalData, encoding: .utf8) {
    print("转换的字符串: \(string)")  // 输出: 转换的字符串: Hello, 世界!
}

// 转换为字节数组
let byteArray = Array(originalData)
print("字节数组: \(byteArray)")  // 输出: 字节数组: [72, 101, 108, 108, 111, 44, 32, 228, 184, 150, 231, 149, 140, 33]

// 转换为十六进制字符串
let hexString = originalData.map { String(format: "%02x", $0) }.joined()
print("十六进制: \(hexString)")  // 输出: 十六进制: 48656c6c6f2c20e4b896e7958c21
```

### 4. 数据搜索和比较

```swift
let data1 = "Hello World".data(using: .utf8)!
let data2 = "World".data(using: .utf8)!
let data3 = "Hello World".data(using: .utf8)!

// 查找子数据
if let range = data1.range(of: data2) {
    print("找到子数据，范围: \(range)")  // 输出: 找到子数据，范围: 6..<11
}

// 比较数据
print("数据相等: \(data1 == data3)")  // 输出: 数据相等: true

// 检查是否以特定数据开头
let helloData = "Hello".data(using: .utf8)!
print("以Hello开头: \(data1.starts(with: helloData))")  // 输出: 以Hello开头: true
```

### 5. 高级操作

```swift
var advancedData = Data("ABCDEFGHIJ".utf8)

// 移除指定范围的数据
advancedData.removeSubrange(3..<7)
print("移除后: \(String(data: advancedData, encoding: .utf8)!)")  // 输出: 移除后: ABCHIJ

// 替换数据
let replacementData = "XYZ".data(using: .utf8)!
advancedData.replaceSubrange(3..<6, with: replacementData)
print("替换后: \(String(data: advancedData, encoding: .utf8)!)")  // 输出: 替换后: ABCXYZ

// 重置和清空
advancedData.removeAll()
print("清空后长度: \(advancedData.count)")  // 输出: 清空后长度: 0

// 重置但保留容量
advancedData.removeAll(keepingCapacity: true)
```

#### 5.1 内存操作 API

```swift
let testData = Data("Hello World 12345".utf8)

// 使用 withUnsafeBytes 访问原始内存
testData.withUnsafeBytes { rawBuffer in
    let buffer = rawBuffer.bindMemory(to: UInt8.self)
    print("前5个字节: ", terminator: "")
    for i in 0..<min(5, buffer.count) {
        print("\(buffer[i]) ", terminator: "")
    }
    print()  // 输出: 前5个字节: 72 101 108 108 111
}

// 获取可变缓冲区指针
var mutableTestData = testData
mutableTestData.withUnsafeMutableBytes { rawBuffer in
    let buffer = rawBuffer.bindMemory(to: UInt8.self)
    // 修改第一个字节
    if buffer.count > 0 {
        buffer[0] = 104  // 'h' 改为小写
    }
}
print("修改后: \(String(data: mutableTestData, encoding: .utf8)!)")  // 输出: 修改后: hello World 12345
```

#### 5.2 高级搜索和操作

```swift
let sourceData = Data("Hello World Hello Swift Hello iOS".utf8)
let searchPattern = Data("Hello".utf8)

// 查找所有匹配项
var searchRange = sourceData.startIndex..<sourceData.endIndex
var occurrences: [Range<Data.Index>] = []

while let range = sourceData.range(of: searchPattern, in: searchRange) {
    occurrences.append(range)
    searchRange = range.upperBound..<sourceData.endIndex
}

print("找到 \(occurrences.count) 个 'Hello'")  // 输出: 找到 3 个 'Hello'
for (index, range) in occurrences.enumerated() {
    print("第\(index + 1)个位置: \(range.lowerBound)..<\(range.upperBound)")
}

// 反向搜索
if let lastRange = sourceData.range(of: searchPattern, options: .backwards) {
    print("最后一个'Hello'位置: \(lastRange)")
}

// 使用选项搜索
let caseInsensitivePattern = Data("HELLO".utf8)
if let _ = sourceData.range(of: caseInsensitivePattern, options: .caseInsensitive) {
    print("找到了大小写不敏感的匹配")
} else {
    print("没有找到大小写不敏感的匹配（Data不直接支持）")
}
```

#### 5.3 数据切片和分块操作

```swift
let longData = Data("ABCDEFGHIJKLMNOPQRSTUVWXYZ".utf8)

// 分块处理
let chunkSize = 5
var chunks: [Data] = []

for i in stride(from: 0, to: longData.count, by: chunkSize) {
    let endIndex = min(i + chunkSize, longData.count)
    let chunk = longData.subdata(in: i..<endIndex)
    chunks.append(chunk)
}

print("分成 \(chunks.count) 块:")
for (index, chunk) in chunks.enumerated() {
    let chunkString = String(data: chunk, encoding: .utf8) ?? "无法转换"
    print("块 \(index + 1): \(chunkString)")
}
// 输出: 
// 分成 6 块:
// 块 1: ABCDE
// 块 2: FGHIJ
// 块 3: KLMNO
// 块 4: PQRST
// 块 5: UVWXY
// 块 6: Z

// 使用 prefix 和 suffix
let prefixData = longData.prefix(10)
let suffixData = longData.suffix(10)
print("前10个字符: \(String(data: prefixData, encoding: .utf8)!)")  // 输出: 前10个字符: ABCDEFGHIJ
print("后10个字符: \(String(data: suffixData, encoding: .utf8)!)")  // 输出: 后10个字符: QRSTUVWXYZ

// 跳过指定数量的字节
let droppedFirst = longData.dropFirst(5)
let droppedLast = longData.dropLast(5)
print("跳过前5个: \(String(data: Data(droppedFirst), encoding: .utf8)!)")  // 输出: 跳过前5个: FGHIJKLMNOPQRSTUVWXYZ
print("跳过后5个: \(String(data: Data(droppedLast), encoding: .utf8)!)")  // 输出: 跳过后5个: ABCDEFGHIJKLMNOPQRSTUV
```

#### 5.4 高级数据变换

```swift
let originalData = Data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

// 使用 map 变换数据
let doubledData = Data(originalData.map { $0 * 2 })
print("原始数据: \(Array(originalData))")  // 输出: 原始数据: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print("翻倍数据: \(Array(doubledData))")   // 输出: 翻倍数据: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// 过滤数据
let evenBytes = Data(originalData.filter { $0 % 2 == 0 })
print("偶数字节: \(Array(evenBytes))")     // 输出: 偶数字节: [2, 4, 6, 8, 10]

// 数据反转
let reversedData = Data(originalData.reversed())
print("反转数据: \(Array(reversedData))")  // 输出: 反转数据: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

// 数据排序
let unsortedData = Data([5, 1, 9, 3, 7, 2, 8, 4, 6])
let sortedData = Data(unsortedData.sorted())
print("排序前: \(Array(unsortedData))")    // 输出: 排序前: [5, 1, 9, 3, 7, 2, 8, 4, 6]
print("排序后: \(Array(sortedData))")      // 输出: 排序后: [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

#### 5.5 数据校验和计算

```swift
let checksumData = Data("Hello World".utf8)

// 简单校验和
let simpleChecksum = checksumData.reduce(0) { $0 + UInt32($1) }
print("简单校验和: \(simpleChecksum)")  // 输出: 简单校验和: 1052

// XOR 校验
let xorChecksum = checksumData.reduce(0) { $0 ^ $1 }
print("XOR校验: \(xorChecksum)")  // 输出: XOR校验: 109

// 字节统计
var byteFrequency: [UInt8: Int] = [:]
for byte in checksumData {
    byteFrequency[byte, default: 0] += 1
}
print("字节频率统计:")
for (byte, count) in byteFrequency.sorted(by: { $0.key < $1.key }) {
    let char = Character(UnicodeScalar(byte)!)
    print("字节 \(byte) ('\(char)'): \(count) 次")
}
```

#### 5.6 数据格式化和调试

```swift
let debugData = Data([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21])

// 十六进制转储
func hexDump(_ data: Data, bytesPerLine: Int = 16) -> String {
    var result = ""
    
    for i in stride(from: 0, to: data.count, by: bytesPerLine) {
        let endIndex = min(i + bytesPerLine, data.count)
        let lineData = data.subdata(in: i..<endIndex)
        
        // 地址
        result += String(format: "%08X: ", i)
        
        // 十六进制字节
        for (index, byte) in lineData.enumerated() {
            result += String(format: "%02X ", byte)
            if index == 7 { result += " " }  // 在中间添加额外空格
        }
        
        // 填充空格
        let padding = (bytesPerLine - lineData.count) * 3
        if lineData.count <= 8 { result += " " }
        result += String(repeating: " ", count: padding)
        
        // ASCII 表示
        result += "| "
        for byte in lineData {
            if byte >= 32 && byte <= 126 {
                result += String(Character(UnicodeScalar(byte)!))
            } else {
                result += "."
            }
        }
        result += "\n"
    }
    
    return result
}

print("十六进制转储:")
print(hexDump(debugData))
// 输出:
// 十六进制转储:
// 00000000: 48 65 6C 6C 6F 20 57 6F  72 6C 64 21             | Hello World!

// 二进制表示
func binaryRepresentation(_ data: Data) -> String {
    return data.map { String($0, radix: 2).padLeft(toLength: 8, withPad: "0") }.joined(separator: " ")
}

extension String {
    func padLeft(toLength: Int, withPad character: Character) -> String {
        let stringLength = self.count
        if stringLength < toLength {
            return String(repeatElement(character, count: toLength - stringLength)) + self
        } else {
            return self
        }
    }
}

let binaryData = Data([0xFF, 0x00, 0xAA, 0x55])
print("二进制表示: \(binaryRepresentation(binaryData))")
// 输出: 二进制表示: 11111111 00000000 10101010 01010101
```

#### 5.7 异步和并发操作

```swift
import Foundation

// 异步数据处理
func processDataAsync(_ data: Data) async -> Data {
    return await withCheckedContinuation { continuation in
        DispatchQueue.global().async {
            // 模拟耗时的数据处理
            let processedData = Data(data.map { $0.addingReportingOverflow(1).partialValue })
            continuation.resume(returning: processedData)
        }
    }
}

// 并发数据处理（需要在异步上下文中调用）
func demonstrateAsyncProcessing() {
    Task {
        let inputData = Data("Async Processing".utf8)
        let processedData = await processDataAsync(inputData)
        
        if let result = String(data: processedData, encoding: .utf8) {
            print("异步处理结果: \(result)")
        }
    }
}

// 数据流处理
class DataProcessor {
    private var buffer = Data()
    
    func processChunk(_ chunk: Data) {
        buffer.append(chunk)
        
        while buffer.count >= 4 {  // 假设每个消息至少4字节
            let messageLength = Int(buffer[0]) << 24 | Int(buffer[1]) << 16 | Int(buffer[2]) << 8 | Int(buffer[3])
            
            if buffer.count >= 4 + messageLength {
                let messageData = buffer.subdata(in: 4..<(4 + messageLength))
                buffer.removeSubrange(0..<(4 + messageLength))
                
                handleMessage(messageData)
            } else {
                break  // 等待更多数据
            }
        }
    }
    
    private func handleMessage(_ data: Data) {
        if let message = String(data: data, encoding: .utf8) {
            print("处理消息: \(message)")
        }
    }
}

// 使用示例
let processor = DataProcessor()
let message1 = "Hello"
let chunk1 = Data([0, 0, 0, UInt8(message1.count)]) + Data(message1.utf8)
processor.processChunk(chunk1)  // 输出: 处理消息: Hello
```

## 相关联的 API

### 1. NSData 桥接

```swift
import Foundation

let data = "Hello".data(using: .utf8)!
let nsData = data as NSData

// NSData 方法
let base64String = nsData.base64EncodedString()
print("Base64: \(base64String)")  // 输出: Base64: SGVsbG8=

// 从 Base64 创建
if let decodedData = Data(base64Encoded: base64String) {
    print("解码: \(String(data: decodedData, encoding: .utf8)!)")  // 输出: 解码: Hello
}
```

### 2. 文件操作相关

```swift
let documentPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
let filePath = (documentPath as NSString).appendingPathComponent("test.txt")
let fileURL = URL(fileURLWithPath: filePath)

let testData = "测试数据写入文件".data(using: .utf8)!

do {
    // 写入文件
    try testData.write(to: fileURL)
    print("文件写入成功")
    
    // 从文件读取
    let readData = try Data(contentsOf: fileURL)
    if let content = String(data: readData, encoding: .utf8) {
        print("读取内容: \(content)")  // 输出: 读取内容: 测试数据写入文件
    }
} catch {
    print("文件操作失败: \(error)")
}
```

### 3. 网络请求相关

```swift
// 模拟网络请求数据处理
func processNetworkData() {
    let jsonString = """
    {
        "name": "张三",
        "age": 25,
        "city": "北京"
    }
    """
    
    guard let jsonData = jsonString.data(using: .utf8) else { return }
    
    do {
        // 解析 JSON
        if let json = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
            print("解析的JSON: \(json)")
            // 输出: 解析的JSON: ["name": "张三", "age": 25, "city": "北京"]
        }
    } catch {
        print("JSON解析失败: \(error)")
    }
}

processNetworkData()
```

### 4. 加密相关（CommonCrypto）

```swift
import CommonCrypto

extension Data {
    func md5() -> String {
        let hash = self.withUnsafeBytes { bytes in
            return CC_MD5(bytes.bindMemory(to: UInt8.self).baseAddress, CC_LONG(self.count), nil)
        }
        
        var md5String = ""
        for i in 0..<Int(CC_MD5_DIGEST_LENGTH) {
            if let hash = hash {
                md5String += String(format: "%02x", hash[i])
            }
        }
        return md5String
    }
}

// 使用示例
let testData = "Hello World".data(using: .utf8)!
// print("MD5: \(testData.md5())")
```

## 性能优化建议

### 1. 写时复制优化

```swift
// 避免不必要的复制
let originalData = Data("Large data content".utf8)
let sharedData = originalData  // 不会立即复制

// 只有在修改时才会复制
var modifiableData = originalData
modifiableData.append(0x00)  // 此时发生复制
```

### 2. 批量操作

```swift
// 高效的批量追加
var batchData = Data()
batchData.reserveCapacity(1000)  // 预分配容量

for i in 0..<100 {
    let chunk = "数据块\(i)".data(using: .utf8)!
    batchData.append(chunk)
}
```

### 3. 内存映射文件

```swift
// 对于大文件，使用内存映射
let largeFileURL = URL(fileURLWithPath: "/path/to/large/file")
do {
    let mappedData = try Data(contentsOf: largeFileURL, options: .mappedIfSafe)
    // 使用 mappedData，不会将整个文件加载到内存
} catch {
    print("内存映射失败: \(error)")
}
```

## 常见用例示例

### 1. 图片数据处理

```swift
// 模拟图片数据处理
func processImageData() {
    // 假设我们有图片数据
    let imageData = Data() // 实际应用中从文件或网络获取
    
    // 检查图片格式
    if imageData.count >= 4 {
        let header = imageData.prefix(4)
        let headerBytes = Array(header)
        
        if headerBytes == [0xFF, 0xD8, 0xFF, 0xE0] {
            print("这是一个JPEG图片")
        } else if headerBytes == [0x89, 0x50, 0x4E, 0x47] {
            print("这是一个PNG图片")
        }
    }
}
```

### 2. 协议数据包处理

```swift
struct PacketHeader {
    let version: UInt8
    let type: UInt8
    let length: UInt16
}

func parsePacket(data: Data) -> PacketHeader? {
    guard data.count >= 4 else { return nil }
    
    let version = data[0]
    let type = data[1]
    let length = UInt16(data[2]) << 8 | UInt16(data[3])
    
    return PacketHeader(version: version, type: type, length: length)
}

// 使用示例
let packetData = Data([0x01, 0x02, 0x00, 0x64])  // 版本1，类型2，长度100
if let header = parsePacket(data: packetData) {
    print("数据包解析: 版本=\(header.version), 类型=\(header.type), 长度=\(header.length)")
    // 输出: 数据包解析: 版本=1, 类型=2, 长度=100
}
```

## 测试代码汇总

```swift
import Foundation

// 综合测试函数
func testDataAPI() {
    print("=== Swift Data API 测试 ===\n")
    
    // 1. 基本操作测试
    print("1. 基本操作测试:")
    let testString = "Hello, Swift Data API! 你好世界!"
    let data = testString.data(using: .utf8)!
    print("原始字符串: \(testString)")
    print("数据长度: \(data.count) 字节")
    print("十六进制表示: \(data.map { String(format: "%02x", $0) }.joined(separator: " "))")
    print()
    
    // 2. 数据操作测试
    print("2. 数据操作测试:")
    var mutableData = Data("Swift".utf8)
    print("初始数据: \(String(data: mutableData, encoding: .utf8)!)")
    
    mutableData.append(" is".data(using: .utf8)!)
    print("追加后: \(String(data: mutableData, encoding: .utf8)!)")
    
    mutableData.insert(contentsOf: " Language".data(using: .utf8)!, at: mutableData.count)
    print("插入后: \(String(data: mutableData, encoding: .utf8)!)")
    print()
    
    // 3. 搜索和比较测试
    print("3. 搜索和比较测试:")
    let searchData = "Language".data(using: .utf8)!
    if let range = mutableData.range(of: searchData) {
        print("找到'Language'，位置: \(range.lowerBound)-\(range.upperBound)")
    }
    print()
    
    // 4. Base64 编码测试
    print("4. Base64 编码测试:")
    let originalText = "Swift Data"
    let originalData = originalText.data(using: .utf8)!
    let base64String = originalData.base64EncodedString()
    print("原始文本: \(originalText)")
    print("Base64编码: \(base64String)")
    
    if let decodedData = Data(base64Encoded: base64String),
       let decodedText = String(data: decodedData, encoding: .utf8) {
        print("Base64解码: \(decodedText)")
    }
    print()
    
    print("=== 测试完成 ===")
}

// 运行测试
testDataAPI()
```

## 最佳实践

1.  **选择合适的初始化方式**：根据数据来源选择最优的初始化方法
2.  **预分配容量**：对于大量追加操作，提前分配足够的容量
3.  **使用合适的编码**：确保字符串和数据之间的转换使用正确的编码
4.  **错误处理**：始终处理可能的转换和 I/O 错误
5.  **内存管理**：对于大数据，考虑使用内存映射或流式处理

## 总结

`Data` 是 Swift 中处理二进制数据的核心类型，提供了丰富的 API 支持各种数据操作场景。通过合理使用其提供的方法，可以高效地处理网络数据、文件操作、数据转换等任务。在实际开发中，应根据具体需求选择合适的方法，并注意性能优化和错误处理。
