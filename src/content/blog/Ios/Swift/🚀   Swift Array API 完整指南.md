---
title: "Swift Array API 完整指南"
description: "Array<Element 是 Swift 中的核心集合类型，它是一个有序的、动态的、泛型的集合。Array 在 Swift 5.9+ 中标记为 @frozen，这意味着其内存布局是固定的，可以进行更好的优化。"
pubDate: 2026-05-29
category: "Swift"
tags: [Swift, Array, API]
draft: false
---
# 🚀  Swift Array API 完整指南

## 概述

`Array<Element>` 是 Swift 中的核心集合类型，它是一个有序的、动态的、泛型的集合。Array 在 Swift 5.9+ 中标记为 `@frozen`，这意味着其内存布局是固定的，可以进行更好的优化。

## 1. 创建和初始化

### 1.1 基本创建方式

```swift
// 空数组
var emptyArray: [Int] = []
var emptyArray2 = [Int]()
var emptyArray3 = Array<Int>()

// 带初始值的数组
let numbers = [1, 2, 3, 4, 5]
let strings = ["apple", "banana", "cherry"]

// 使用 Array 初始化器
let repeatedArray = Array(repeating: 0, count: 5)
print(repeatedArray) // [0, 0, 0, 0, 0]

// 从其他集合创建
let range = 1...10
let arrayFromRange = Array(range)
print(arrayFromRange) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

### 1.2 使用字面量创建

```swift
let fruits: [String] = ["apple", "banana", "cherry", "date"]
let mixed: [Any] = [1, "hello", 3.14, true]
```

## 2. 基本属性

### 2.1 计数和容量

**count**: 返回数组中元素的数量，时间复杂度 O(1)
**isEmpty**: 检查数组是否为空，等价于 `count == 0`，但更高效
**capacity**: 返回数组当前分配的存储容量，通常大于或等于 count

```swift
let numbers = [1, 2, 3, 4, 5]

print(numbers.count)        // 5
print(numbers.isEmpty)      // false
print(numbers.capacity)     // 至少为 5，可能更大

let emptyArray: [Int] = []
print(emptyArray.isEmpty)   // true
print(emptyArray.count)     // 0
```

### 2.2 索引和边界

**startIndex**: 数组的起始索引，对于数组总是 0
**endIndex**: 数组的结束索引，等于 count（不是最后一个元素的索引）
**indices**: 返回数组所有有效索引的范围

```swift
let fruits = ["apple", "banana", "cherry"]

print(fruits.startIndex)    // 0
print(fruits.endIndex)      // 3
print(fruits.indices)       // 0..<3

// 访问元素
print(fruits[0])            // "apple"
print(fruits[fruits.startIndex]) // "apple"
```

## 3. 添加元素

### 3.1 append 方法

**append(_:)**: 在数组末尾添加单个元素，平均时间复杂度 O(1)
**append(contentsOf:)**: 在数组末尾添加另一个序列的所有元素，时间复杂度 O(n)

```swift
var numbers = [1, 2, 3]
numbers.append(4)
print(numbers) // [1, 2, 3, 4]

// 添加多个元素
numbers.append(contentsOf: [5, 6, 7])
print(numbers) // [1, 2, 3, 4, 5, 6, 7]
```

### 3.2 insert 方法

**insert(_:at:)**: 在指定索引位置插入单个元素，时间复杂度 O(n)
**insert(contentsOf:at:)**: 在指定索引位置插入另一个序列的所有元素，时间复杂度 O(n)

```swift
var fruits = ["apple", "cherry"]
fruits.insert("banana", at: 1)
print(fruits) // ["apple", "banana", "cherry"]

// 插入多个元素
fruits.insert(contentsOf: ["orange", "grape"], at: 2)
print(fruits) // ["apple", "banana", "orange", "grape", "cherry"]
```

### 3.3 使用 += 运算符

**+= 运算符**: 将右侧数组的所有元素添加到左侧数组末尾，等价于 `append(contentsOf:)`

```swift
var numbers = [1, 2, 3]
numbers += [4, 5]
print(numbers) // [1, 2, 3, 4, 5]
```

## 4. 删除元素

### 4.1 remove 方法

**remove(at:)**: 删除指定索引的元素并返回该元素，时间复杂度 O(n)
**removeFirst()**: 删除第一个元素并返回，时间复杂度 O(n)，数组为空时会运行时错误
**removeLast()**: 删除最后一个元素并返回，时间复杂度 O(1)，数组为空时会运行时错误
**popFirst()**: 安全地删除第一个元素，返回 Optional，数组为空时返回 nil
**popLast()**: 安全地删除最后一个元素，返回 Optional，数组为空时返回 nil

```swift
var fruits = ["apple", "banana", "cherry", "date"]

// 删除指定索引的元素
let removed = fruits.remove(at: 1)
print(removed) // "banana"
print(fruits)  // ["apple", "cherry", "date"]

// 删除第一个元素
let first = fruits.removeFirst()
print(first)   // "apple"
print(fruits)  // ["cherry", "date"]

// 删除最后一个元素
let last = fruits.removeLast()
print(last)    // "date"
print(fruits)  // ["cherry"]
```

### 4.2 removeAll 方法

**removeAll()**: 删除数组中的所有元素，时间复杂度 O(n)
**removeAll(keepingCapacity:)**: 删除所有元素，可选择保持当前容量以避免重新分配
**removeAll(where:)**: 删除满足条件的所有元素，时间复杂度 O(n)

```swift
var numbers = [1, 2, 3, 4, 5]
numbers.removeAll()
print(numbers) // []

// 保持容量
var moreNumbers = [1, 2, 3, 4, 5]
moreNumbers.removeAll(keepingCapacity: true)
print(moreNumbers.count)    // 0
print(moreNumbers.capacity) // 保持原有容量
```

### 4.3 条件删除

**removeAll(where:)**: 删除所有满足给定条件的元素，保持其他元素的相对顺序

```swift
var numbers = [1, 2, 3, 4, 5, 6]
numbers.removeAll { $0 % 2 == 0 }
print(numbers) // [1, 3, 5]
```

## 5. 访问和修改元素

### 5.1 下标访问

**subscript(_:)**: 通过索引访问或修改元素，时间复杂度 O(1)
**subscript(_:)**: 通过范围访问或修改子数组，返回 ArraySlice

```swift
var fruits = ["apple", "banana", "cherry"]
print(fruits[0])    // "apple"
fruits[1] = "orange"
print(fruits)       // ["apple", "orange", "cherry"]

// 范围访问
print(fruits[0...1]) // ["apple", "orange"]
fruits[1...2] = ["kiwi", "mango"]
print(fruits)        // ["apple", "kiwi", "mango"]
```

### 5.2 安全访问

**first**: 返回第一个元素的 Optional，数组为空时返回 nil
**last**: 返回最后一个元素的 Optional，数组为空时返回 nil

```swift
let numbers = [1, 2, 3, 4, 5]

// 使用 first 和 last
print(numbers.first ?? -1)  // 1
print(numbers.last ?? -1)   // 5

let emptyArray: [Int] = []
print(emptyArray.first ?? -1) // -1
print(emptyArray.last ?? -1)  // -1
```

## 6. 查找元素

### 6.1 contains 方法

**contains(_:)**: 检查数组是否包含指定元素，时间复杂度 O(n)
**contains(where:)**: 检查数组是否包含满足条件的元素，时间复杂度 O(n)

```swift
let numbers = [1, 2, 3, 4, 5]
print(numbers.contains(3))    // true
print(numbers.contains(6))    // false

// 使用闭包条件
print(numbers.contains { $0 > 3 }) // true
```

### 6.2 firstIndex 和 lastIndex

**firstIndex(of:)**: 返回指定元素第一次出现的索引，找不到时返回 nil，时间复杂度 O(n)
**lastIndex(of:)**: 返回指定元素最后一次出现的索引，找不到时返回 nil，时间复杂度 O(n)
**firstIndex(where:)**: 返回第一个满足条件的元素的索引，时间复杂度 O(n)
**lastIndex(where:)**: 返回最后一个满足条件的元素的索引，时间复杂度 O(n)

```swift
let fruits = ["apple", "banana", "apple", "cherry"]
print(fruits.firstIndex(of: "apple"))  // Optional(0)
print(fruits.lastIndex(of: "apple"))   // Optional(2)
print(fruits.firstIndex(of: "grape"))  // nil

// 使用条件查找
print(fruits.firstIndex { $0.count > 5 }) // Optional(1) ("banana")
```

### 6.3 first 和 last 条件查找

**first(where:)**: 返回第一个满足条件的元素，找不到时返回 nil，时间复杂度 O(n)
**last(where:)**: 返回最后一个满足条件的元素，找不到时返回 nil，时间复杂度 O(n)

```swift
let numbers = [1, 2, 3, 4, 5, 6]
print(numbers.first { $0 % 2 == 0 })  // Optional(2)
print(numbers.last { $0 % 2 == 0 })   // Optional(6)
```

## 7. 数组变换

### 7.1 map 方法

**map(_:)**: 对数组中的每个元素应用变换函数，返回新数组，时间复杂度 O(n)
这是函数式编程的核心方法之一，用于数据变换而不修改原数组

```swift
let numbers = [1, 2, 3, 4, 5]
let doubled = numbers.map { $0 * 2 }
print(doubled) // [2, 4, 6, 8, 10]

let strings = numbers.map { "Number: \($0)" }
print(strings) // ["Number: 1", "Number: 2", "Number: 3", "Number: 4", "Number: 5"]
```

### 7.2 compactMap 方法

**compactMap(_:)**: 对数组中的每个元素应用变换函数，自动过滤掉 nil 结果，时间复杂度 O(n)
常用于类型转换和过滤操作的组合

```swift
let strings = ["1", "2", "hello", "4", "world"]
let numbers = strings.compactMap { Int($0) }
print(numbers) // [1, 2, 4]

let optionals: [Int?] = [1, nil, 3, nil, 5]
let nonNils = optionals.compactMap { $0 }
print(nonNils) // [1, 3, 5]
```

### 7.3 flatMap 方法

**flatMap(_:)**: 对数组中的每个元素应用变换函数，然后将结果扁平化为一维数组，时间复杂度 O(n*m)
用于处理嵌套结构或一对多的变换

```swift
let nestedArrays = [[1, 2], [3, 4], [5, 6]]
let flattened = nestedArrays.flatMap { $0 }
print(flattened) // [1, 2, 3, 4, 5, 6]

let words = ["hello", "world"]
let characters = words.flatMap { $0 }
print(characters) // ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]
```

## 8. 过滤和筛选

### 8.1 filter 方法

**filter(_:)**: 返回包含所有满足条件的元素的新数组，时间复杂度 O(n)
这是函数式编程中的重要方法，用于筛选数据

```swift
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let evenNumbers = numbers.filter { $0 % 2 == 0 }
print(evenNumbers) // [2, 4, 6, 8, 10]

let longWords = ["cat", "elephant", "dog", "hippopotamus"].filter { $0.count > 3 }
print(longWords) // ["elephant", "hippopotamus"]
```

### 8.2 prefix 和 suffix

**prefix(_:)**: 返回数组前 n 个元素的子序列，时间复杂度 O(1)
**suffix(_:)**: 返回数组后 n 个元素的子序列，时间复杂度 O(1)
**prefix(while:)**: 返回从开头开始满足条件的连续元素，时间复杂度 O(n)
**suffix(while:)**: 返回从末尾开始满足条件的连续元素，时间复杂度 O(n)

```swift
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

print(Array(numbers.prefix(3)))      // [1, 2, 3]
print(Array(numbers.suffix(3)))      // [8, 9, 10]

// 条件前缀和后缀
print(Array(numbers.prefix { $0 < 5 }))     // [1, 2, 3, 4]
print(Array(numbers.suffix { $0 > 5 }))     // [6, 7, 8, 9, 10]
```

### 8.3 drop 方法

**dropFirst(_:)**: 返回去掉前 n 个元素后的子序列，默认 n=1，时间复杂度 O(1)
**dropLast(_:)**: 返回去掉后 n 个元素后的子序列，默认 n=1，时间复杂度 O(1)
**drop(while:)**: 返回去掉开头连续满足条件的元素后的子序列，时间复杂度 O(n)

```swift
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

print(Array(numbers.dropFirst(3)))   // [4, 5, 6, 7, 8, 9, 10]
print(Array(numbers.dropLast(3)))    // [1, 2, 3, 4, 5, 6, 7]

// 条件删除
print(Array(numbers.drop { $0 < 5 }))     // [5, 6, 7, 8, 9, 10]
```

## 9. 归约和聚合

### 9.1 reduce 方法

**reduce(_:_:)**: 将数组中的所有元素组合成单个值，时间复杂度 O(n)
**reduce(into:_:)**: 更高效的版本，直接修改累积值而不是创建新值

```swift
let numbers = [1, 2, 3, 4, 5]

// 求和
let sum = numbers.reduce(0, +)
print(sum) // 15

// 求积
let product = numbers.reduce(1, *)
print(product) // 120

// 字符串连接
let words = ["Hello", "World", "Swift"]
let sentence = words.reduce("") { result, word in
    result.isEmpty ? word : result + " " + word
}
print(sentence) // "Hello World Swift"
```swift
let numbers = [1, 2, 3, 4, 5]

// 求和
let sum = numbers.reduce(0, +)
print(sum) // 15

// 求积
let product = numbers.reduce(1, *)
print(product) // 120

// 字符串连接
let words = ["Hello", "World", "Swift"]
let sentence = words.reduce("") { result, word in
    result.isEmpty ? word : result + " " + word
}
print(sentence) // "Hello World Swift"
```

### 9.2 reduce(into:_:)

### 🔍 `reduce(into:_:)` 详解

#### 🌟 简要说明：

`reduce(into:_:)` 是 `Swift` 中的一种高效归约方式，它与传统的 `reduce(_:_:)` 不同之处在于：

- **允许传入一个可变的初始值**。
- **在闭包中直接对该值进行修改（in-place 变更）**。
- **避免了频繁创建中间值（尤其是集合类）造成的性能开销**。

✅ 语法：

```swift
array.reduce(into: initialResult) { result, element in
    // 对 result 进行修改
}
```

- `initialResult`：初始的累积值，可以是任意类型（常见为字典、数组、整数等）。

- `result`：可变的引用（inout），每次迭代会原地更新。

- element`：当前正在处理的数组元素。

```swift
let numbersToCount = [1, 2, 3, 2, 1, 4, 3]

let frequency = numbersToCount.reduce(into: [:]) { counts, number in
    counts[number, default: 0] += 1
}

print(frequency) // [1: 2, 2: 2, 3: 2, 4: 1]

```

🧠 对比 `reduce(_:_:)`：

使用传统 `reduce` 实现同样逻辑会更繁琐且不够高效

```swift
let frequency = numbersToCount.reduce([:]) { counts, number in
    var newCounts = counts
    newCounts[number, default: 0] += 1
    return newCounts
}

```

这个版本每次迭代都创建一个新字典，性能差很多。

### 9.3 min 和 max

```swift
let numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(numbers.min()) // Optional(1)
print(numbers.max()) // Optional(9)

let words = ["apple", "banana", "cherry"]
print(words.min()) // Optional("apple")
print(words.max()) // Optional("cherry")

// 使用自定义比较
let people = ["Alice", "Bob", "Charlie"]
print(people.min { $0.count < $1.count }) // Optional("Bob")
```

## 10. 排序

### 10.1 sort 和 sorted

```swift
var numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()
print(numbers) // [1, 1, 2, 3, 4, 5, 6, 9]

let originalNumbers = [3, 1, 4, 1, 5, 9, 2, 6]
let sortedNumbers = originalNumbers.sorted()
print(originalNumbers) // [3, 1, 4, 1, 5, 9, 2, 6] (未改变)
print(sortedNumbers)   // [1, 1, 2, 3, 4, 5, 6, 9]

// 自定义排序
var words = ["apple", "Banana", "cherry"]
words.sort { $0.lowercased() < $1.lowercased() }
print(words) // ["apple", "Banana", "cherry"]
```

### 10.2 reverse 和 reversed

```swift
var numbers = [1, 2, 3, 4, 5]
numbers.reverse()
print(numbers) // [5, 4, 3, 2, 1]

let originalNumbers = [1, 2, 3, 4, 5]
let reversedNumbers = Array(originalNumbers.reversed())
print(reversedNumbers) // [5, 4, 3, 2, 1]
```

## 11. 分组和分区

### 11.1 partition 方法

```swift
var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let partitionIndex = numbers.partition { $0 % 2 == 0 }
print(numbers) // [1, 9, 3, 7, 5, 6, 4, 8, 2, 10] (奇数在前，偶数在后)
print(partitionIndex) // 5 (分区点)
```

### 11.2 分组操作（需要扩展）

```swift
extension Array {
    func grouped<Key: Hashable>(by keyPath: KeyPath<Element, Key>) -> [Key: [Element]] {
        return Dictionary(grouping: self, by: { $0[keyPath: keyPath] })
    }
}

struct Person {
    let name: String
    let age: Int
}

let people = [
    Person(name: "Alice", age: 25),
    Person(name: "Bob", age: 30),
    Person(name: "Charlie", age: 25),
    Person(name: "David", age: 30)
]

let groupedByAge = Dictionary(grouping: people, by: { $0.age })
print(groupedByAge)
// [25: [Person(name: "Alice", age: 25), Person(name: "Charlie", age: 25)], 
//  30: [Person(name: "Bob", age: 30), Person(name: "David", age: 30)]]
```

## 12. 数组连接和拆分

### 12.1 joined 方法

```swift
let words = ["Hello", "World", "Swift"]
let sentence = words.joined(separator: " ")
print(sentence) // "Hello World Swift"

let numbers = [[1, 2], [3, 4], [5, 6]]
let flattened = Array(numbers.joined())
print(flattened) // [1, 2, 3, 4, 5, 6]
```

### 12.2 split 方法

```swift
let numbers = [1, 0, 2, 0, 3, 0, 4]
let split = numbers.split(separator: 0)
print(split) // [[1], [2], [3], [4]]

let splitArrays = split.map(Array.init)
print(splitArrays) // [[1], [2], [3], [4]]

// 使用条件分割
let words = ["apple", "", "banana", "", "cherry"]
let nonEmptyGroups = words.split { $0.isEmpty }
print(nonEmptyGroups) // [["apple"], ["banana"], ["cherry"]]
```

## 13. 随机化

### 13.1 shuffle 和 shuffled

```swift
var cards = ["A", "K", "Q", "J", "10", "9", "8", "7"]
cards.shuffle()
print(cards) // 随机排列，如: ["Q", "7", "A", "10", "K", "9", "J", "8"]

let originalCards = ["A", "K", "Q", "J"]
let shuffledCards = originalCards.shuffled()
print(shuffledCards) // 随机排列，原数组不变
```

### 13.2 randomElement

```swift
let fruits = ["apple", "banana", "cherry", "date"]
print(fruits.randomElement()) // Optional，随机元素，如: Optional("banana")

let emptyArray: [String] = []
print(emptyArray.randomElement()) // nil
```

## 14. 集合操作

### 14.1 去重

```swift
let numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
let uniqueNumbers = Array(Set(numbers)).sorted()
print(uniqueNumbers) // [1, 2, 3, 4]

// 保持顺序的去重
extension Array where Element: Hashable {
    func removingDuplicates() -> [Element] {
        var seen = Set<Element>()
        return filter { seen.insert($0).inserted }
    }
}

let uniqueOrdered = numbers.removingDuplicates()
print(uniqueOrdered) // [1, 2, 3, 4]
```

## 15. 数组比较

### 15.1 相等性比较

```swift
let array1 = [1, 2, 3]
let array2 = [1, 2, 3]
let array3 = [3, 2, 1]

print(array1 == array2) // true
print(array1 == array3) // false
```

### 15.2 字典序比较

```swift
let array1 = [1, 2, 3]
let array2 = [1, 2, 4]
let array3 = [1, 2]

print(array1 < array2)  // true
print(array1 > array3)  // true
```

## 16. 内存管理

### 16.1 容量管理

```swift
var numbers: [Int] = []
print("Initial capacity: \(numbers.capacity)") // 0

numbers.reserveCapacity(100)
print("After reserve: \(numbers.capacity)")    // 至少 100

for i in 1...50 {
    numbers.append(i)
}
print("After adding 50 elements: \(numbers.capacity)") // 仍然至少 100
```

## 17. 高级用法示例

### 17.1 链式操作

```swift
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

let result = numbers
    .filter { $0 % 2 == 0 }        // [2, 4, 6, 8, 10]
    .map { $0 * $0 }               // [4, 16, 36, 64, 100]
    .prefix(3)                     // [4, 16, 36]
    .reduce(0, +)                  // 56

print(result) // 56
```

### 17.2 嵌套数组处理

```swift
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

// 获取所有元素
let allElements = matrix.flatMap { $0 }
print(allElements) // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// 获取对角线元素
let diagonal = matrix.enumerated().map { (index, row) in row[index] }
print(diagonal) // [1, 5, 9]
```

### 17.3 条件累积

```swift
let numbers = [1, -2, 3, -4, 5, -6, 7, -8, 9, -10]

// 累积正数
var positiveSum = 0
let positiveSums = numbers.map { number -> Int in
    if number > 0 {
        positiveSum += number
    }
    return positiveSum
}
print(positiveSums) // [1, 1, 4, 4, 9, 9, 16, 16, 25, 25]
```

## 18. 性能注意事项

### 18.1 预分配容量

```swift
// 推荐：预分配容量
var largeArray: [Int] = []
largeArray.reserveCapacity(10000)
for i in 0..<10000 {
    largeArray.append(i)
}

// 不推荐：频繁重新分配
var slowArray: [Int] = []
for i in 0..<10000 {
    slowArray.append(i) // 可能触发多次内存重新分配
}
```

### 18.2 避免不必要的复制

```swift
let largeArray = Array(0..<10000)

// 推荐：使用 lazy 避免中间数组
let lazyResult = largeArray.lazy
    .filter { $0 % 2 == 0 }
    .map { $0 * 2 }
    .prefix(10)

let finalResult = Array(lazyResult)

// 不推荐：创建多个中间数组
let intermediateArray1 = largeArray.filter { $0 % 2 == 0 }
let intermediateArray2 = intermediateArray1.map { $0 * 2 }
let finalResult2 = Array(intermediateArray2.prefix(10))
```

## 总结

Swift 的 Array 类型提供了丰富的 API，涵盖了创建、修改、查找、变换、过滤、排序等各个方面。合理使用这些 API 可以编写出高效、简洁的代码。在使用时要注意：

1. **性能考虑**：预分配容量，使用 lazy 操作避免不必要的中间数组
2. **安全性**：使用 `first`、`last` 等安全访问方法避免越界
3. **函数式编程**：充分利用 `map`、`filter`、`reduce` 等高阶函数
4. **内存管理**：注意数组的复制语义，适当使用 `inout` 参数

这些 API 的组合使用可以解决大部分数组操作需求，是 Swift 编程的重要基础。