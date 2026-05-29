---
title: "LinkedHashMap RLU 算法"
description: "LinkedHashMap RLU 算法 的技术笔记。"
pubDate: 2026-05-29
category: "swift"
tags: [Swift, API]
draft: false
---
```swift

import Foundation

// MARK: - LinkedHashMap 实现
public class LinkedHashMap<Key: Hashable, Value> {

    // 双向链表节点
    internal class Node {
        let key: Key
        var value: Value
        var prev: Node?
        var next: Node?

        init(key: Key, value: Value) {
            self.key = key
            self.value = value
        }
    }

    // 存储键值对的字典，提供 O(1) 查找
    internal var dict: [Key: Node] = [:]

    // 双向链表的头尾节点，用于维护插入顺序
    internal var head: Node?
    internal var tail: Node?

    // 当前大小
    internal var count: Int = 0

    // 最大容量（用于 LRU 缓存）
    private let maxCapacity: Int?

    // MARK: - 初始化
    public init() {
        self.maxCapacity = nil
    }

    public init(capacity: Int) {
        dict.reserveCapacity(capacity)
        self.maxCapacity = nil
    }

    /// 创建具有最大容量的 LinkedHashMap，支持 LRU 行为
    public init(maxCapacity: Int) {
        self.maxCapacity = maxCapacity
        dict.reserveCapacity(maxCapacity)
    }

    // MARK: - 基本操作

    /// 获取值
    public subscript(key: Key) -> Value? {
        get {
            return dict[key]?.value
        }
        set {
            if let newValue = newValue {
                put(key: key, value: newValue)
            } else {
                remove(key: key)
            }
        }
    }

    /// 添加或更新键值对
    @discardableResult
    public func put(key: Key, value: Value) -> Value? {
        if let existingNode = dict[key] {
            // 键已存在，更新值
            let oldValue = existingNode.value
            existingNode.value = value
            return oldValue
        } else {
            // 新键，创建新节点并加入链表尾部
            let newNode = Node(key: key, value: value)
            dict[key] = newNode
            addToTail(newNode)
            count += 1
            // 检查是否需要移除最老的条目
            checkAndRemoveEldest()

            return nil
        }
    }

    /// 获取值
    public func get(_ key: Key) -> Value? {
        return dict[key]?.value
    }

    /// 移除键值对
    @discardableResult
    public func remove(key: Key) -> Value? {
        guard let node = dict[key] else { return nil }

        dict.removeValue(forKey: key)
        removeFromList(node)
        count -= 1
        return node.value
    }

    /// 检查是否包含键
    func containsKey(_ key: Key) -> Bool {
        return dict[key] != nil
    }

    /// 清空所有元素
    func clear() {
        dict.removeAll()
        head = nil
        tail = nil
        count = 0
    }

    /// 是否为空
    var isEmpty: Bool {
        return count == 0
    }

    // MARK: - 顺序相关操作

    /// 获取所有键（按插入顺序）
    public var keys: [Key] {
        var result: [Key] = []
        var current = head
        while let node = current {
            result.append(node.key)
            current = node.next
        }
        return result
    }

    /// 获取所有值（按插入顺序）
    public var values: [Value] {
        var result: [Value] = []
        var current = head
        while let node = current {
            result.append(node.value)
            current = node.next
        }
        return result
    }

    /// 获取第一个键值对
    public var first: (key: Key, value: Value)? {
        guard let firstNode = head else { return nil }
        return (firstNode.key, firstNode.value)
    }

    /// 获取最后一个键值对
    public var last: (key: Key, value: Value)? {
        guard let lastNode = tail else { return nil }
        return (lastNode.key, lastNode.value)
    }

    /// 移除第一个元素
    @discardableResult
    public func removeFirst() -> (key: Key, value: Value)? {
        guard let firstNode = head else { return nil }
        let result = (firstNode.key, firstNode.value)
        remove(key: firstNode.key)
        return result
    }

    /// 移除最后一个元素
    @discardableResult
    public func removeLast() -> (key: Key, value: Value)? {
        guard let lastNode = tail else { return nil }
        let result = (lastNode.key, lastNode.value)
        remove(key: lastNode.key)
        return result
    }

    // MARK: - LRU 缓存支持

    /// 检查是否应该移除最老的条目（类似 Java LinkedHashMap 的 removeEldestEntry）
    /// 子类可以重写此方法来自定义移除策略
    public func shouldRemoveEldestEntry(eldest: (key: Key, value: Value))
        -> Bool
    {
        // 默认实现：当超过最大容量时移除最老的条目
        if let maxCap = maxCapacity {
            return count > maxCap
        }
        return false
    }

    /// 移除最老的条目
    @discardableResult
    public func removeEldestEntry() -> (key: Key, value: Value)? {
        guard let firstNode = head else { return nil }
        let result = (firstNode.key, firstNode.value)
        remove(key: firstNode.key)
        return result
    }
    
    internal func moveToTail(_ node: Node) {
        // 如果已经是尾节点，无需移动
        guard node !== tail else { return }

        // 从当前位置移除
        if node.prev != nil {
            node.prev?.next = node.next
        } else {
            head = node.next
        }

        if node.next != nil {
            node.next?.prev = node.prev
        }

        // 添加到尾部
        node.prev = tail
        node.next = nil
        tail?.next = node
        tail = node
    }

    /// 检查并移除最老的条目（内部使用）
    internal func checkAndRemoveEldest() {
        while let eldest = first, shouldRemoveEldestEntry(eldest: eldest) {
            removeEldestEntry()
        }
    }

    // MARK: - 私有辅助方法

    internal func addToTail(_ node: Node) {
        if head == nil {
            head = node
            tail = node
        } else {
            tail?.next = node
            node.prev = tail
            tail = node
        }
    }

    internal func removeFromList(_ node: Node) {
        if node.prev != nil {
            node.prev?.next = node.next
        } else {
            head = node.next
        }

        if node.next != nil {
            node.next?.prev = node.prev
        } else {
            tail = node.prev
        }

        node.prev = nil
        node.next = nil
    }
}

public class YSLinkedHashMap<Key: Hashable, Value>: LinkedHashMap<Key, Value> {
    /// 添加或更新键值对
    @discardableResult
    public override func put(key: Key, value: Value) -> Value? {
        if let existingNode = dict[key] {
            // 键已存在，更新值并移动到尾部
            let oldValue = existingNode.value
            existingNode.value = value
            moveToTail(existingNode)
            return oldValue
        } else {
            // 新键，创建新节点并加入链表尾部
            let newNode = Node(key: key, value: value)
            dict[key] = newNode
            addToTail(newNode)
            count += 1
            // 检查是否需要移除最老的条目
            checkAndRemoveEldest()
            return nil
        }
    }
}

// MARK: - LRU 缓存实现
public class LRUCache<Key: Hashable, Value>: LinkedHashMap<Key, Value> {
    private let capacity: Int

    public override init(capacity: Int) {
        self.capacity = capacity
        super.init(maxCapacity: capacity)
    }

    public override func shouldRemoveEldestEntry(
        eldest: (key: Key, value: Value)
    ) -> Bool {
        return count > capacity
    }

    /// 访问元素时移动到尾部（LRU 语义）
    public override func get(_ key: Key) -> Value? {
        guard let node = dict[key] else { return nil }

        // 将访问的节点移动到链表尾部
        moveToTail(node)
        return node.value
    }
}

// MARK: - Collection 协议支持
extension LinkedHashMap: Sequence {
    public func makeIterator() -> LinkedHashMapIterator<Key, Value> {
        return LinkedHashMapIterator(head: head)
    }
}

public struct LinkedHashMapIterator<Key: Hashable, Value>: IteratorProtocol {
    private var current: LinkedHashMap<Key, Value>.Node?

    init(head: LinkedHashMap<Key, Value>.Node?) {
        self.current = head
    }

    mutating public func next() -> (key: Key, value: Value)? {
        guard let node = current else { return nil }
        current = node.next
        return (node.key, node.value)
    }
}

// MARK: - CustomStringConvertible 支持
extension LinkedHashMap: CustomStringConvertible {
    public var description: String {
        let pairs = self.map { "\($0.key): \($0.value)" }
        return "LinkedHashMap([\(pairs.joined(separator: ", "))])"
    }
}

// MARK: - Equatable Value 扩展
extension LinkedHashMap where Value: Equatable {
    /// 检查是否包含值（仅当 Value 遵循 Equatable 时可用）
    public func containsValue(_ value: Value) -> Bool {
        var current = head
        while let node = current {
            if node.value == value {
                return true
            }
            current = node.next
        }
        return false
    }
}

// MARK: - Kotlin 风格的扩展方法
extension LinkedHashMap {

    public func putAll<S: Sequence>(_ sequence: S)
    where S.Element == (Key, Value) {
        for (key, value) in sequence {
            put(key: key, value: value)
        }
    }

    public func getOrDefault(_ key: Key, defaultValue: Value) -> Value {
        return get(key) ?? defaultValue
    }

    public func getOrPut(_ key: Key, defaultValue: () -> Value) -> Value {
        if let existingValue = get(key) {
            return existingValue
        } else {
            let newValue = defaultValue()
            put(key: key, value: newValue)
            return newValue
        }
    }

    public func forEach(_ action: (Key, Value) -> Void) {
        for (key, value) in self {
            action(key, value)
        }
    }

    public func filter(_ predicate: (Key, Value) -> Bool) -> LinkedHashMap<
        Key, Value
    > {
        let result = LinkedHashMap<Key, Value>()
        for (key, value) in self {
            if predicate(key, value) {
                result.put(key: key, value: value)
            }
        }
        return result
    }

    public func mapValues<NewValue>(_ transform: (Value) -> NewValue)
        -> LinkedHashMap<Key, NewValue>
    {
        let result = LinkedHashMap<Key, NewValue>()
        for (key, value) in self {
            result.put(key: key, value: transform(value))
        }
        return result
    }
}

```

