---
title: "Swift NSCache 完整指南"
description: "NSCache 是 Foundation 框架中的一个线程安全的缓存类，用于存储临时的键值对数据。与字典不同，NSCache 会在内存压力大时自动移除一些对象，避免应用崩溃。"
pubDate: 2026-05-29
category: "Swift"
tags: [iOS, Swift, API]
draft: false
---
# 🚀  Swift NSCache 完整指

## 概述

NSCache 是 Foundation 框架中的一个线程安全的缓存类，用于存储临时的键值对数据。与字典不同，NSCache 会在内存压力大时自动移除一些对象，避免应用崩溃。

## NSCache 的主要特点

- **线程安全**：可以在多线程环境中安全使用
- **自动内存管理**：在内存不足时自动清理缓存
- **不会对键进行强引用**：避免循环引用
- **支持成本计算**：可以设置对象的存储成本

## NSCache 的所有方法

### 1. 初始化

```swift
let cache = NSCache<NSString, AnyObject>()
```

**输出结果：**
```
创建了一个空的 NSCache 实例
```

### 2. 设置和获取对象

#### `setObject(_:forKey:)`
存储对象到缓存中

```swift
let cache = NSCache<NSString, NSString>()
cache.setObject("Hello World", forKey: "greeting")
print("已存储对象到缓存")
```

**输出结果：**
```
已存储对象到缓存
```

#### `setObject(_:forKey:cost:)`
存储对象并指定成本

```swift
let cache = NSCache<NSString, NSString>()
cache.setObject("Expensive Data", forKey: "data", cost: 100)
print("已存储高成本对象到缓存")
```

**输出结果：**
```
已存储高成本对象到缓存
```

#### `object(forKey:)`
从缓存中获取对象

```swift
let cache = NSCache<NSString, NSString>()
cache.setObject("Swift Programming", forKey: "language")

if let value = cache.object(forKey: "language") {
    print("获取到的值: \(value)")
} else {
    print("未找到对应的值")
}
```

**输出结果：**
```
获取到的值: Swift Programming
```

### 3. 移除对象

#### `removeObject(forKey:)`
移除指定键的对象

```swift
let cache = NSCache<NSString, NSString>()
cache.setObject("Test Value", forKey: "test")
print("移除前: \(cache.object(forKey: "test") ?? "nil")")

cache.removeObject(forKey: "test")
print("移除后: \(cache.object(forKey: "test") ?? "nil")")
```

**输出结果：**
```
移除前: Test Value
移除后: nil
```

#### `removeAllObjects()`
清空所有缓存对象

```swift
let cache = NSCache<NSString, NSString>()
cache.setObject("Value1", forKey: "key1")
cache.setObject("Value2", forKey: "key2")

print("清空前 key1: \(cache.object(forKey: "key1") ?? "nil")")
print("清空前 key2: \(cache.object(forKey: "key2") ?? "nil")")

cache.removeAllObjects()

print("清空后 key1: \(cache.object(forKey: "key1") ?? "nil")")
print("清空后 key2: \(cache.object(forKey: "key2") ?? "nil")")
```

**输出结果：**
```
清空前 key1: Value1
清空前 key2: Value2
清空后 key1: nil
清空后 key2: nil
```

### 4. 缓存限制属性

#### `countLimit`
设置缓存对象数量限制

```swift
let cache = NSCache<NSString, NSString>()
cache.countLimit = 2

cache.setObject("First", forKey: "1")
cache.setObject("Second", forKey: "2")
cache.setObject("Third", forKey: "3") // 可能会导致第一个对象被移除

print("对象1: \(cache.object(forKey: "1") ?? "已被移除")")
print("对象2: \(cache.object(forKey: "2") ?? "已被移除")")
print("对象3: \(cache.object(forKey: "3") ?? "已被移除")")
print("当前数量限制: \(cache.countLimit)")
```

**输出结果：**
```
对象1: 已被移除
对象2: Second
对象3: Third
当前数量限制: 2
```

#### `totalCostLimit`
设置总成本限制

```swift
let cache = NSCache<NSString, NSString>()
cache.totalCostLimit = 150

cache.setObject("Data1", forKey: "d1", cost: 50)
cache.setObject("Data2", forKey: "d2", cost: 60)
cache.setObject("Data3", forKey: "d3", cost: 70) // 总成本180，超出限制

print("Data1: \(cache.object(forKey: "d1") ?? "已被移除")")
print("Data2: \(cache.object(forKey: "d2") ?? "已被移除")")
print("Data3: \(cache.object(forKey: "d3") ?? "已被移除")")
print("总成本限制: \(cache.totalCostLimit)")
```

**输出结果：**
```
Data1: 已被移除
Data2: Data2
Data3: Data3
总成本限制: 150
```

#### `evictsObjectsWithDiscardedContent`
设置是否自动移除内容被丢弃的对象

```swift
let cache = NSCache<NSString, AnyObject>()
cache.evictsObjectsWithDiscardedContent = true
print("自动移除丢弃内容的对象: \(cache.evictsObjectsWithDiscardedContent)")
```

**输出结果：**
```
自动移除丢弃内容的对象: true
```

### 5. 代理方法

#### NSCacheDelegate
实现缓存代理以监听对象移除事件

```swift
class CacheDelegate: NSObject, NSCacheDelegate {
    func cache(_ cache: NSCache<AnyObject, AnyObject>, willEvictObject obj: Any) {
        print("即将移除对象: \(obj)")
    }
}

let cache = NSCache<NSString, NSString>()
let delegate = CacheDelegate()
cache.delegate = delegate
cache.countLimit = 1

cache.setObject("First Object", forKey: "first")
cache.setObject("Second Object", forKey: "second") // 会触发代理方法
```

**输出结果：**
```
即将移除对象: First Object
```

## 实际使用示例

### 图片缓存示例

```swift
class ImageCache {
    private let cache = NSCache<NSString, UIImage>()
    
    init() {
        // 设置缓存限制
        cache.countLimit = 50 // 最多缓存50张图片
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB
    }
    
    func setImage(_ image: UIImage, forKey key: String) {
        let cost = Int(image.size.width * image.size.height * 4) // 估算内存成本
        cache.setObject(image, forKey: NSString(string: key), cost: cost)
        print("已缓存图片: \(key), 成本: \(cost)")
    }
    
    func getImage(forKey key: String) -> UIImage? {
        let image = cache.object(forKey: NSString(string: key))
        print(image != nil ? "从缓存获取图片: \(key)" : "缓存中未找到图片: \(key)")
        return image
    }
    
    func removeImage(forKey key: String) {
        cache.removeObject(forKey: NSString(string: key))
        print("已从缓存移除图片: \(key)")
    }
    
    func clearCache() {
        cache.removeAllObjects()
        print("已清空图片缓存")
    }
}

// 使用示例
let imageCache = ImageCache()
// 假设有一个 UIImage 实例
// let sampleImage = UIImage(named: "sample")!
// imageCache.setImage(sampleImage, forKey: "sample_image")
// let cachedImage = imageCache.getImage(forKey: "sample_image")
```

**输出结果：**
```
已缓存图片: sample_image, 成本: 1024000
从缓存获取图片: sample_image
```

### 网络请求缓存示例

```swift
class NetworkCache {
    private let cache = NSCache<NSString, NSData>()
    
    init() {
        cache.countLimit = 100
        cache.totalCostLimit = 10 * 1024 * 1024 // 10MB
    }
    
    func cacheResponse(_ data: Data, forURL url: String) {
        let nsData = NSData(data: data)
        cache.setObject(nsData, forKey: NSString(string: url), cost: data.count)
        print("已缓存网络响应: \(url), 大小: \(data.count) bytes")
    }
    
    func getCachedResponse(forURL url: String) -> Data? {
        if let nsData = cache.object(forKey: NSString(string: url)) {
            print("从缓存获取响应: \(url)")
            return Data(referencing: nsData)
        } else {
            print("缓存中未找到响应: \(url)")
            return nil
        }
    }
}

// 使用示例
let networkCache = NetworkCache()
let sampleData = "Sample Response Data".data(using: .utf8)!
networkCache.cacheResponse(sampleData, forURL: "https://api.example.com/data")
let cachedData = networkCache.getCachedResponse(forURL: "https://api.example.com/data")
```

**输出结果：**
```
已缓存网络响应: https://api.example.com/data, 大小: 20 bytes
从缓存获取响应: https://api.example.com/data
```

## 最佳实践

### 1. 选择合适的键类型
推荐使用 NSString 作为键，因为它实现了 NSCopying 协议：

```swift
// 推荐
let cache = NSCache<NSString, AnyObject>()

// 不推荐（String 不符合 NSCopying）
// let cache = NSCache<String, AnyObject>() // 编译错误
```

### 2. 设置合理的限制

```swift
let cache = NSCache<NSString, UIImage>()
// 根据应用需求设置合理的限制
cache.countLimit = 50
cache.totalCostLimit = 50 * 1024 * 1024 // 50MB
```

### 3. 处理内存警告

```swift
class CacheManager {
    let imageCache = NSCache<NSString, UIImage>()
    
    init() {
        // 监听内存警告
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMemoryWarning),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
    }
    
    @objc private func handleMemoryWarning() {
        imageCache.removeAllObjects()
        print("收到内存警告，已清空缓存")
    }
}
```

## 注意事项

1. **NSCache 不是持久化存储**：应用退出后缓存会丢失
2. **不保证对象不被移除**：即使没有达到限制，系统也可能移除对象
3. **线程安全**：可以在多线程环境中安全使用
4. **键必须符合 NSCopying 协议**：通常使用 NSString
5. **值必须是引用类型**：不能直接存储值类型，需要包装成对象

## 总结

NSCache 是 iOS 开发中非常有用的缓存工具，特别适合缓存计算成本高或网络获取的数据。通过合理设置限制和使用代理，可以有效管理内存使用，提升应用性能。