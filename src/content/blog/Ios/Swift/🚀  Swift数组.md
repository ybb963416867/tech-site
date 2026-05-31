---
title: "Swift数组"
description: "Swift Array 提供了丰富的 API，主要包括："
pubDate: 2026-05-29
category: "Swift"
tags: [Swift, Array, API]
draft: false
---
# Swift Array 完整 API 指南

## 创建和初始化

### 基本初始化

```swift
// 空数组
let emptyArray: [Int] = []
let emptyArray2 = [Int]()
let emptyArray3 = Array<Int>()
print(emptyArray)  // 输出: []

// 字面量初始化
let numbers = [1, 2, 3, 4, 5]
print(numbers)  // 输出: [1, 2, 3, 4, 5]

// 重复元素初始化
let repeated = Array(repeating: 0, count: 5)
print(repeated)  // 输出: [0, 0, 0, 0, 0]

// 从序列初始化
let range = Array(1...5)
print(range)  // 输出: [1, 2, 3, 4, 5]

// 从集合初始化
let set = Set([1, 2, 3, 2, 1])
let arrayFromSet = Array(set)
print(arrayFromSet)  // 输出: [1, 2, 3] (顺序可能不同)
```

### 使用闭包初始化

```swift
// 使用闭包生成数组
let squares = Array(1...5) { index in
    index * index
}
print(squares)  // 输出: [1, 4, 9, 16, 25]

// 使用 map 初始化
let doubledNumbers = (1...5).map { $0 * 2 }
print(doubledNumbers)  // 输出: [2, 4, 6, 8, 10]
```

## 基本属性

### count - 元素数量

```swift
let fruits = ["苹果", "香蕉", "橙子"]
print(fruits.count)  // 输出: 3
```

### isEmpty - 是否为空

```swift
let empty: [String] = []
let notEmpty = ["item"]
print(empty.isEmpty)     // 输出: true
print(notEmpty.isEmpty)  // 输出: false
```

### capacity - 容量

```swift
var array = [1, 2, 3]
print("容量: \(array.capacity)")  // 输出: 容量: 3
array.reserveCapacity(10)
print("预留后容量: \(array.capacity)")  // 输出: 预留后容量: 10
```

### first 和 last - 首尾元素

```swift
let numbers = [10, 20, 30, 40, 50]
print(numbers.first ?? "空")  // 输出: 10
print(numbers.last ?? "空")   // 输出: 50

let empty: [Int] = []
print(empty.first ?? "空数组")  // 输出: 空数组
```

### startIndex 和 endIndex

```swift
let array = ["a", "b", "c"]
print(array.startIndex)  // 输出: 0
print(array.endIndex)    // 输出: 3
```

## 访问元素

### 下标访问

```swift
let colors = ["红", "绿", "蓝", "黄"]
print(colors[0])     // 输出: 红
print(colors[2])     // 输出: 蓝

// 范围下标
print(colors[1...2])  // 输出: ["绿", "蓝"]
print(colors[..<2])   // 输出: ["红", "绿"]
print(colors[2...])   // 输出: ["蓝", "黄"]
```

### 安全访问

```swift
extension Array {
    subscript(safe index: Index) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

let array = [1, 2, 3]
print(array[safe: 1] ?? "无")  // 输出: 2
print(array[safe: 5] ?? "无")  // 输出: 无
```

### randomElement - 随机元素

```swift
let options = ["石头", "剪刀", "布"]
print(options.randomElement() ?? "")  // 输出: 石头 (随机)
```

## 添加和插入元素

### append - 追加元素

```swift
var numbers = [1, 2, 3]
numbers.append(4)
print(numbers)  // 输出: [1, 2, 3, 4]

// 追加多个元素
numbers.append(contentsOf: [5, 6, 7])
print(numbers)  // 输出: [1, 2, 3, 4, 5, 6, 7]
```

### insert - 插入元素

```swift
var letters = ["a", "c", "d"]
letters.insert("b", at: 1)
print(letters)  // 输出: ["a", "b", "c", "d"]

// 插入多个元素
letters.insert(contentsOf: ["x", "y"], at: 2)
print(letters)  // 输出: ["a", "b", "x", "y", "c", "d"]
```

### 使用 + 运算符

```swift
let array1 = [1, 2, 3]
let array2 = [4, 5, 6]
let combined = array1 + array2
print(combined)  // 输出: [1, 2, 3, 4, 5, 6]

// += 运算符
var mutable = [1, 2]
mutable += [3, 4]
print(mutable)  // 输出: [1, 2, 3, 4]
```

## 删除元素

### remove - 删除指定位置

```swift
var fruits = ["苹果", "香蕉", "橙子", "葡萄"]
let removed = fruits.remove(at: 1)
print("删除的元素: \(removed)")  // 输出: 删除的元素: 香蕉
print(fruits)  // 输出: ["苹果", "橙子", "葡萄"]
```

### removeFirst/removeLast

```swift
var numbers = [1, 2, 3, 4, 5]
let first = numbers.removeFirst()
let last = numbers.removeLast()
print("删除的首尾: \(first), \(last)")  // 输出: 删除的首尾: 1, 5
print(numbers)  // 输出: [2, 3, 4]

// 删除多个
numbers.removeFirst(2)
print(numbers)  // 输出: [4]
```

### removeAll

```swift
var array = [1, 2, 3, 4, 5]
array.removeAll { $0 % 2 == 0 }  // 删除所有偶数
print(array)  // 输出: [1, 3, 5]

// 清空数组
array.removeAll()
print(array)  // 输出: []
```

### popLast

```swift
var stack = [1, 2, 3]
while let element = stack.popLast() {
    print("弹出: \(element)")
}
// 输出:
// 弹出: 3
// 弹出: 2
// 弹出: 1
```

### removeSubrange

```swift
var letters = ["a", "b", "c", "d", "e"]
letters.removeSubrange(1...3)
print(letters)  // 输出: ["a", "e"]
```

## 查找和搜索

### contains - 包含检查

```swift
let numbers = [1, 2, 3, 4, 5]
print(numbers.contains(3))   // 输出: true
print(numbers.contains(10))  // 输出: false

// 使用条件检查
print(numbers.contains { $0 > 4 })  // 输出: true
print(numbers.contains { $0 > 10 }) // 输出: false
```

### firstIndex/lastIndex - 查找索引

```swift
let array = [10, 20, 30, 20, 40]
print(array.firstIndex(of: 20) ?? -1)  // 输出: 1
print(array.lastIndex(of: 20) ?? -1)   // 输出: 3

// 使用条件查找
print(array.firstIndex { $0 > 25 } ?? -1)  // 输出: 2
```

### first(where:) / last(where:)

```swift
let scores = [65, 89, 72, 95, 88]
let firstPassing = scores.first { $0 >= 90 }
let lastPassing = scores.last { $0 >= 90 }
print("第一个优秀: \(firstPassing ?? 0)")  // 输出: 第一个优秀: 95
print("最后一个优秀: \(lastPassing ?? 0)")  // 输出: 最后一个优秀: 95
```

### allSatisfy - 全部满足

```swift
let evenNumbers = [2, 4, 6, 8]
let allEven = evenNumbers.allSatisfy { $0 % 2 == 0 }
print("全是偶数: \(allEven)")  // 输出: 全是偶数: true

let mixed = [2, 3, 4, 5]
let allEven2 = mixed.allSatisfy { $0 % 2 == 0 }
print("全是偶数: \(allEven2)")  // 输出: 全是偶数: false
```

## 转换操作

### map - 映射转换

```swift
let numbers = [1, 2, 3, 4, 5]
let squared = numbers.map { $0 * $0 }
print(squared)  // 输出: [1, 4, 9, 16, 25]

let names = ["alice", "bob", "charlie"]
let uppercased = names.map { $0.uppercased() }
print(uppercased)  // 输出: ["ALICE", "BOB", "CHARLIE"]
```

### compactMap - 压缩映射

```swift
let strings = ["1", "2", "abc", "4", "5.5"]
let integers = strings.compactMap { Int($0) }
print(integers)  // 输出: [1, 2, 4]

let optionals: [Int?] = [1, nil, 3, nil, 5]
let nonNils = optionals.compactMap { $0 }
print(nonNils)  // 输出: [1, 3, 5]
```

### flatMap - 扁平化映射

```swift
let arrays = [[1, 2], [3, 4], [5, 6]]
let flattened = arrays.flatMap { $0 }
print(flattened)  // 输出: [1, 2, 3, 4, 5, 6]

let words = ["Hello", "World"]
let characters = words.flatMap { Array($0) }
print(characters)  // 输出: ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]
```

### reduce - 归约

```swift
let numbers = [1, 2, 3, 4, 5]
let sum = numbers.reduce(0, +)
let product = numbers.reduce(1, *)
print("和: \(sum), 积: \(product)")  // 输出: 和: 15, 积: 120

// 使用闭包
let concatenated = numbers.reduce("") { result, number in
    result + String(number)
}
print(concatenated)  // 输出: "12345"

// reduce(into:)
let grouped = [1, 2, 3, 4, 5].reduce(into: [String: [Int]]()) { dict, number in
    let key = number % 2 == 0 ? "偶数" : "奇数"
    dict[key, default: []].append(number)
}
print(grouped)  // 输出: ["奇数": [1, 3, 5], "偶数": [2, 4]]
```

## 过滤和筛选

### filter - 过滤

```swift
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let evens = numbers.filter { $0 % 2 == 0 }
let odds = numbers.filter { $0 % 2 != 0 }
print("偶数: \(evens)")  // 输出: 偶数: [2, 4, 6, 8, 10]
print("奇数: \(odds)")   // 输出: 奇数: [1, 3, 5, 7, 9]
```

### prefix - 前缀元素

```swift
let array = [1, 2, 3, 4, 5]
print(array.prefix(3))  // 输出: [1, 2, 3]
print(array.prefix(10)) // 输出: [1, 2, 3, 4, 5]

// prefix(while:)
let result = array.prefix { $0 < 4 }
print(result)  // 输出: [1, 2, 3]
```

### suffix - 后缀元素

```swift
let array = [1, 2, 3, 4, 5]
print(array.suffix(3))  // 输出: [3, 4, 5]
print(array.suffix(10)) // 输出: [1, 2, 3, 4, 5]
```

### dropFirst/dropLast

```swift
let array = [1, 2, 3, 4, 5]
print(array.dropFirst())   // 输出: [2, 3, 4, 5]
print(array.dropFirst(2))  // 输出: [3, 4, 5]
print(array.dropLast())    // 输出: [1, 2, 3, 4]
print(array.dropLast(2))   // 输出: [1, 2, 3]

// drop(while:)
let dropped = array.drop { $0 < 3 }
print(dropped)  // 输出: [3, 4, 5]
```

## 排序操作

### sort/sorted - 排序

```swift
// 原地排序
var numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()
print(numbers)  // 输出: [1, 1, 2, 3, 4, 5, 6, 9]

// 降序排序
numbers.sort(by: >)
print(numbers)  // 输出: [9, 6, 5, 4, 3, 2, 1, 1]

// 返回新数组
let original = [3, 1, 4, 1, 5]
let ascending = original.sorted()
let descending = original.sorted(by: >)
print("原数组: \(original)")     // 输出: 原数组: [3, 1, 4, 1, 5]
print("升序: \(ascending)")      // 输出: 升序: [1, 1, 3, 4, 5]
print("降序: \(descending)")     // 输出: 降序: [5, 4, 3, 1, 1]
```

### 自定义排序

```swift
struct Person {
    let name: String
    let age: Int
}

let people = [
    Person(name: "Alice", age: 30),
    Person(name: "Bob", age: 25),
    Person(name: "Charlie", age: 35)
]

// 按年龄排序
let sortedByAge = people.sorted { $0.age < $1.age }
print(sortedByAge.map { "\($0.name): \($0.age)" })
// 输出: ["Bob: 25", "Alice: 30", "Charlie: 35"]

// 使用 KeyPath 排序
let sortedByName = people.sorted(by: \.name, <)
print(sortedByName.map { $0.name })
// 输出: ["Alice", "Bob", "Charlie"]
```

### reverse/reversed

```swift
// 原地反转
var array = [1, 2, 3, 4, 5]
array.reverse()
print(array)  // 输出: [5, 4, 3, 2, 1]

// 返回反转视图
let original = [1, 2, 3, 4, 5]
let reversed = original.reversed()
print(Array(reversed))  // 输出: [5, 4, 3, 2, 1]
print(original)         // 输出: [1, 2, 3, 4, 5]
```

### shuffle/shuffled

```swift
// 原地打乱
var deck = Array(1...10)
deck.shuffle()
print(deck)  // 输出: [3, 1, 8, 5, 10, 2, 7, 4, 9, 6] (随机)

// 返回打乱的新数组
let original = [1, 2, 3, 4, 5]
let shuffled = original.shuffled()
print("原数组: \(original)")   // 输出: 原数组: [1, 2, 3, 4, 5]
print("打乱后: \(shuffled)")   // 输出: 打乱后: [2, 5, 1, 4, 3] (随机)
```

## 数学和统计操作

### min/max - 最小/最大值

```swift
let numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print("最小值: \(numbers.min() ?? 0)")  // 输出: 最小值: 1
print("最大值: \(numbers.max() ?? 0)")  // 输出: 最大值: 9

// 自定义比较
let words = ["apple", "banana", "cherry"]
let shortest = words.min(by: { $0.count < $1.count })
let longest = words.max(by: { $0.count < $1.count })
print("最短: \(shortest ?? "")")  // 输出: 最短: apple
print("最长: \(longest ?? "")")   // 输出: 最长: banana
```

### 数学运算扩展

```swift
extension Array where Element: Numeric {
    func sum() -> Element {
        return reduce(0, +)
    }
    
    func average() -> Double where Element: BinaryInteger {
        return isEmpty ? 0 : Double(sum()) / Double(count)
    }
}

let integers = [1, 2, 3, 4, 5]
print("总和: \(integers.sum())")      // 输出: 总和: 15
print("平均值: \(integers.average())") // 输出: 平均值: 3.0
```

## 集合操作

### 去重

```swift
extension Array where Element: Hashable {
    func unique() -> [Element] {
        var seen = Set<Element>()
        return filter { seen.insert($0).inserted }
    }
}

let numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
print(numbers.unique())  // 输出: [1, 2, 3, 4]
```

### 交集、并集、差集

```swift
let array1 = [1, 2, 3, 4, 5]
let array2 = [4, 5, 6, 7, 8]

// 使用 Set 进行操作
let set1 = Set(array1)
let set2 = Set(array2)

let intersection = Array(set1.intersection(set2))
let union = Array(set1.union(set2))
let difference = Array(set1.subtracting(set2))

print("交集: \(intersection.sorted())")  // 输出: 交集: [4, 5]
print("并集: \(union.sorted())")         // 输出: 并集: [1, 2, 3, 4, 5, 6, 7, 8]
print("差集: \(difference.sorted())")    // 输出: 差集: [1, 2, 3]
```

## 分组和分割

### split - 分割

```swift
let numbers = [1, 2, 0, 3, 4, 0, 5, 6]
let groups = numbers.split(separator: 0)
print(groups.map { Array($0) })  // 输出: [[1, 2], [3, 4], [5, 6]]

// 使用条件分割
let mixed = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let splitByOdd = mixed.split { $0 % 2 != 0 }
print(splitByOdd.map { Array($0) })  // 输出: [[2], [4], [6], [8]]

// 限制分割次数
let limited = numbers.split(separator: 0, maxSplits: 1)
print(limited.map { Array($0) })  // 输出: [[1, 2], [3, 4, 0, 5, 6]]
```

### partition - 分区

```swift
var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let pivotIndex = numbers.partition { $0 % 2 == 0 }
print("分区索引: \(pivotIndex)")  // 输出: 分区索引: 5
print("奇数: \(numbers[..<pivotIndex])")     // 输出: 奇数: [1, 9, 3, 7, 5]
print("偶数: \(numbers[pivotIndex...])")     // 输出: 偶数: [6, 4, 8, 2, 10]
```

### 分组（自定义）

```swift
extension Array {
    func grouped<Key: Hashable>(by keyForValue: (Element) -> Key) -> [Key: [Element]] {
        return Dictionary(grouping: self, by: keyForValue)
    }
}

let students = ["Alice", "Bob", "Charlie", "David", "Eve"]
let groupedByFirstLetter = students.grouped { String($0.first!) }
print(groupedByFirstLetter)
// 输出: ["A": ["Alice"], "B": ["Bob"], "C": ["Charlie"], "D": ["David"], "E": ["Eve"]]

let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let groupedByRemainder = numbers.grouped { $0 % 3 }
print(groupedByRemainder)
// 输出: [1: [1, 4, 7, 10], 2: [2, 5, 8], 0: [3, 6, 9]]
```

### chunked - 分块

```swift
extension Array {
    func chunked(size: Int) -> [[Element]] {
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}

let array = Array(1...10)
let chunks = array.chunked(size: 3)
print(chunks)  // 输出: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

## 遍历操作

### forEach - 遍历执行

```swift
let fruits = ["苹果", "香蕉", "橙子"]
fruits.forEach { fruit in
    print("我喜欢\(fruit)")
}
// 输出:
// 我喜欢苹果
// 我喜欢香蕉
// 我喜欢橙子
```

### enumerated - 带索引遍历

```swift
let colors = ["红", "绿", "蓝"]
for (index, color) in colors.enumerated() {
    print("\(index): \(color)")
}
// 输出:
// 0: 红
// 1: 绿
// 2: 蓝
```

### indices - 索引范围

```swift
let array = ["a", "b", "c", "d"]
for i in array.indices {
    print("\(i): \(array[i])")
}
// 输出:
// 0: a
// 1: b
// 2: c
// 3: d
```

### makeIterator - 创建迭代器

```swift
var numbers = [1, 2, 3]
var iterator = numbers.makeIterator()
while let number = iterator.next() {
    print("迭代: \(number)")
}
// 输出:
// 迭代: 1
// 迭代: 2
// 迭代: 3
```

## 其他实用方法

### joined - 连接

```swift
let words = ["Hello", "World", "from", "Swift"]
let sentence = words.joined(separator: " ")
print(sentence)  // 输出: Hello World from Swift

let arrays = [[1, 2], [3, 4], [5, 6]]
let flattened = Array(arrays.joined())
print(flattened)  // 输出: [1, 2, 3, 4, 5, 6]
```

### zip - 组合

```swift
let names = ["Alice", "Bob", "Charlie"]
let ages = [25, 30, 35]
let people = Array(zip(names, ages))
print(people)  // 输出: [("Alice", 25), ("Bob", 30), ("Charlie", 35)]

// 使用 zip 创建字典
let dict = Dictionary(uniqueKeysWithValues: zip(names, ages))
print(dict)  // 输出: ["Alice": 25, "Bob": 30, "Charlie": 35]
```

### swapAt - 交换元素

```swift
var array = ["A", "B", "C", "D"]
array.swapAt(0, 3)
print(array)  // 输出: ["D", "B", "C", "A"]
```

### withContiguousStorageIfAvailable

```swift
let numbers = [1, 2, 3, 4, 5]
let sum = numbers.withContiguousStorageIfAvailable { buffer in
    buffer.reduce(0, +)
}
print("和: \(sum ?? 0)")  // 输出: 和: 15
```

### replaceSubrange

```swift
var array = [1, 2, 3, 4, 5]
array.replaceSubrange(1...3, with: [10, 20, 30])
print(array)  // 输出: [1, 10, 20, 30, 5]
```

### reserveCapacity - 预留容量

```swift
var array = [Int]()
array.reserveCapacity(1000)
print("容量: \(array.capacity)")  // 输出: 容量: 1000
// 避免多次重新分配内存
```

## 高级用法示例

### 链式操作

```swift
let result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .filter { $0 % 2 == 0 }           // 筛选偶数
    .map { $0 * $0 }                  // 平方
    .sorted(by: >)                    // 降序排序
    .prefix(3)                        // 取前3个
    .reduce(0, +)                     // 求和

print(result)  // 输出: 156 (100 + 36 + 16)
```

### 自定义操作符

```swift
extension Array where Element: Numeric {
    static func +(lhs: Array, rhs: Element) -> Array {
        return lhs.map { $0 + rhs }
    }
}

let numbers = [1, 2, 3]
let increased = numbers + 10
print(increased)  // 输出: [11, 12, 13]
```

### 性能优化示例

```swift
// 使用 lazy 延迟计算
let largeArray = Array(1...1000000)
let result = largeArray.lazy
    .filter { $0 % 2 == 0 }
    .map { $0 * 2 }
    .prefix(10)

print(Array(result))  // 输出: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40]
// 只计算需要的前10个元素，而不是处理整个数组
```

## 总结

Swift Array 提供了丰富的 API，主要包括：

1. **创建和初始化** - 多种方式创建数组
2. **基本操作** - 增删改查等基础功能
3. **函数式编程** - map、filter、reduce 等高阶函数
4. **排序和搜索** - 灵活的排序和查找功能
5. **集合操作** - 分组、分割、去重等操作
6. **性能优化** - lazy、reserveCapacity 等优化手段

### 性能建议

1. **预分配容量**: 如果知道数组大小，使用 `reserveCapacity` 避免多次内存分配
2. **使用 lazy**: 对于大数组的链式操作，使用 `lazy` 延迟计算
3. **选择正确的方法**: 
   - 需要索引时用 `enumerated()` 而不是手动追踪
   - 需要唯一值时转换为 `Set` 而不是手动去重
   - 使用 `isEmpty` 而不是 `count == 0`
4. **避免不必要的复制**: 使用 `inout` 参数或原地操作方法（如 `sort` vs `sorted`）

### 常见陷阱

1. **索引越界**: 始终检查索引是否有效
2. **空数组**: 使用 `first`、`last` 等可选返回值的方法
3. **性能问题**: 注意嵌套循环和重复计算
4. **值类型特性**: Array 是值类型，赋值会创建副本

通过掌握这些 API，你可以高效地处理各种数组操作需求。