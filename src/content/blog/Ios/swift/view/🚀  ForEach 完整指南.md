---
title: "ForEach 完整指南"
description: "ForEach 是 SwiftUI 中用于根据数据集合动态创建视图的核心控件。它不是一个视图容器，而是一个视图构建器，用于将数据转换为视图。"
pubDate: 2026-05-29
category: "view"
tags: [Mac, Swift, Array, API]
draft: false
---
# 🚀  ForEach 完整指南

## 概述

ForEach 是 SwiftUI 中用于根据数据集合动态创建视图的核心控件。它不是一个视图容器，而是一个视图构建器，用于将数据转换为视图。

## 基本概念

ForEach 的核心是将数据集合中的每个元素转换为一个视图，并且每个视图都有一个唯一的标识符用于 SwiftUI 的视图更新机制。

## 初始化方法

### 1. 基于范围的 ForEach
```swift
// 最简单的范围遍历
ForEach(0..<5) { index in
    Text("Item \(index)")
}

// 指定 id 参数（通常用 \.self）
ForEach(0..<10, id: \.self) { number in
    Text("Number: \(number)")
}
```

### 2. 基于数组的 ForEach（元素需要符合 Identifiable）
```swift
struct Person: Identifiable {
    let id = UUID()
    let name: String
    let age: Int
}

let people = [
    Person(name: "Alice", age: 30),
    Person(name: "Bob", age: 25),
    Person(name: "Carol", age: 35)
]

ForEach(people) { person in
    Text("\(person.name), \(person.age)")
}
```

### 3. 基于数组的 ForEach（手动指定 id）
```swift
let fruits = ["Apple", "Orange", "Banana"]

ForEach(fruits, id: \.self) { fruit in
    Text(fruit)
}

// 或者使用其他属性作为 id
struct Product {
    let name: String
    let price: Double
    let sku: String
}

let products = [/* 产品数据 */]

ForEach(products, id: \.sku) { product in
    HStack {
        Text(product.name)
        Spacer()
        Text("$\(product.price, specifier: "%.2f")")
    }
}
```

### 4. 基于集合索引的 ForEach
```swift
let items = ["First", "Second", "Third"]

ForEach(Array(items.enumerated()), id: \.offset) { index, item in
    HStack {
        Text("\(index + 1).")
        Text(item)
    }
}

// 或者使用 indices
ForEach(items.indices, id: \.self) { index in
    Text("\(index): \(items[index])")
}
```

## ForEach 的完整签名

### 主要初始化器
```swift
// 1. 范围初始化器
ForEach<Range<Int>, Int, Content>(
    _ data: Range<Int>,
    @ViewBuilder content: @escaping (Int) -> Content
)

// 2. 数据集合初始化器（带 KeyPath id）
ForEach<Data, ID, Content>(
    _ data: Data,
    id: KeyPath<Data.Element, ID>,
    @ViewBuilder content: @escaping (Data.Element) -> Content
) where Data: RandomAccessCollection, ID: Hashable

// 3. Identifiable 数据集合初始化器
ForEach<Data, Data.Element.ID, Content>(
    _ data: Data,
    @ViewBuilder content: @escaping (Data.Element) -> Content
) where Data: RandomAccessCollection, Data.Element: Identifiable
```

## 详细用法示例

### 1. 简单列表
```swift
struct SimpleListView: View {
    let colors = ["Red", "Green", "Blue", "Yellow", "Purple"]
    
    var body: some View {
        VStack {
            ForEach(colors, id: \.self) { color in
                Text(color)
                    .foregroundColor(colorFromString(color))
                    .padding()
            }
        }
    }
    
    func colorFromString(_ colorName: String) -> Color {
        switch colorName {
        case "Red": return .red
        case "Green": return .green
        case "Blue": return .blue
        case "Yellow": return .yellow
        case "Purple": return .purple
        default: return .black
        }
    }
}
```

### 2. 复杂数据结构
```swift
struct Task: Identifiable {
    let id = UUID()
    let title: String
    let isCompleted: Bool
    let priority: Priority
    
    enum Priority: String, CaseIterable {
        case low = "Low"
        case medium = "Medium" 
        case high = "High"
    }
}

struct TaskListView: View {
    @State private var tasks = [
        Task(title: "完成项目报告", isCompleted: false, priority: .high),
        Task(title: "回复邮件", isCompleted: true, priority: .medium),
        Task(title: "准备会议资料", isCompleted: false, priority: .low)
    ]
    
    var body: some View {
        List {
            ForEach(tasks) { task in
                TaskRowView(task: task)
            }
        }
    }
}

struct TaskRowView: View {
    let task: Task
    
    var body: some View {
        HStack {
            Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                .foregroundColor(task.isCompleted ? .green : .gray)
            
            VStack(alignment: .leading) {
                Text(task.title)
                    .strikethrough(task.isCompleted)
                Text(task.priority.rawValue)
                    .font(.caption)
                    .foregroundColor(priorityColor(task.priority))
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
    
    func priorityColor(_ priority: Task.Priority) -> Color {
        switch priority {
        case .high: return .red
        case .medium: return .orange
        case .low: return .blue
        }
    }
}
```

### 3. 嵌套 ForEach
```swift
struct Section {
    let title: String
    let items: [String]
}

struct NestedForEachView: View {
    let sections = [
        Section(title: "水果", items: ["苹果", "香蕉", "橙子"]),
        Section(title: "蔬菜", items: ["胡萝卜", "西兰花", "菠菜"]),
        Section(title: "肉类", items: ["牛肉", "鸡肉", "猪肉"])
    ]
    
    var body: some View {
        List {
            ForEach(sections, id: \.title) { section in
                SwiftUI.Section(section.title) {
                    ForEach(section.items, id: \.self) { item in
                        Text(item)
                    }
                }
            }
        }
    }
}
```

### 4. 使用索引的 ForEach
```swift
struct IndexedForEachView: View {
    let items = ["第一项", "第二项", "第三项", "第四项"]
    
    var body: some View {
        VStack {
            // 方法1：使用 enumerated()
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                HStack {
                    Text("\(index + 1)")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(item)
                    Spacer()
                }
                .padding(.horizontal)
            }
            
            Divider()
            
            // 方法2：使用 indices
            ForEach(items.indices, id: \.self) { index in
                HStack {
                    Circle()
                        .fill(index % 2 == 0 ? Color.blue : Color.red)
                        .frame(width: 10, height: 10)
                    Text(items[index])
                    Spacer()
                }
                .padding(.horizontal)
            }
        }
    }
}
```

## 动态数据操作

### 1. 添加和删除元素
```swift
struct DynamicListView: View {
    @State private var items = ["项目1", "项目2", "项目3"]
    @State private var newItemText = ""
    
    var body: some View {
        NavigationView {
            VStack {
                HStack {
                    TextField("新项目", text: $newItemText)
                        .textFieldStyle(.roundedBorder)
                    
                    Button("添加") {
                        if !newItemText.isEmpty {
                            items.append(newItemText)
                            newItemText = ""
                        }
                    }
                    .disabled(newItemText.isEmpty)
                }
                .padding()
                
                List {
                    ForEach(items, id: \.self) { item in
                        Text(item)
                    }
                    .onDelete(perform: deleteItems)
                    .onMove(perform: moveItems)
                }
            }
            .navigationTitle("动态列表")
            .toolbar {
                EditButton()
            }
        }
    }
    
    func deleteItems(offsets: IndexSet) {
        items.remove(atOffsets: offsets)
    }
    
    func moveItems(from source: IndexSet, to destination: Int) {
        items.move(fromOffsets: source, toOffset: destination)
    }
}
```

### 2. 过滤和搜索
```swift
struct FilterableListView: View {
    @State private var searchText = ""
    @State private var selectedCategory = "全部"
    
    let allItems = [
        Item(name: "苹果", category: "水果"),
        Item(name: "香蕉", category: "水果"),
        Item(name: "胡萝卜", category: "蔬菜"),
        Item(name: "西兰花", category: "蔬菜")
    ]
    
    var filteredItems: [Item] {
        let categoryFiltered = selectedCategory == "全部" ? 
            allItems : allItems.filter { $0.category == selectedCategory }
        
        return searchText.isEmpty ? 
            categoryFiltered : 
            categoryFiltered.filter { $0.name.contains(searchText) }
    }
    
    var body: some View {
        NavigationView {
            VStack {
                Picker("类别", selection: $selectedCategory) {
                    Text("全部").tag("全部")
                    Text("水果").tag("水果")  
                    Text("蔬菜").tag("蔬菜")
                }
                .pickerStyle(.segmented)
                .padding()
                
                List {
                    ForEach(filteredItems) { item in
                        HStack {
                            Text(item.name)
                            Spacer()
                            Text(item.category)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
                .searchable(text: $searchText, prompt: "搜索项目")
            }
            .navigationTitle("可过滤列表")
        }
    }
}

struct Item: Identifiable {
    let id = UUID()
    let name: String
    let category: String
}
```

## 性能优化

### 1. 使用正确的 ID
```swift
// ❌ 不推荐：使用 UUID() 作为 id
struct BadExample: View {
    let items = ["A", "B", "C"]
    
    var body: some View {
        ForEach(items, id: \.self) { item in
            Text(item)
                .id(UUID()) // 错误：每次重新渲染时都会生成新 ID
        }
    }
}

// ✅ 推荐：使用稳定的 ID
struct GoodExample: View {
    let items = [
        Item(id: "1", name: "A"),
        Item(id: "2", name: "B"), 
        Item(id: "3", name: "C")
    ]
    
    var body: some View {
        ForEach(items) { item in
            Text(item.name)
        }
    }
}
```

### 2. 避免复杂计算
```swift
// ❌ 不推荐：在 ForEach 中进行复杂计算
struct SlowExample: View {
    let numbers = Array(1...1000)
    
    var body: some View {
        List {
            ForEach(numbers, id: \.self) { number in
                Text("结果: \(expensiveCalculation(number))") // 每次渲染都会计算
            }
        }
    }
    
    func expensiveCalculation(_ n: Int) -> Int {
        // 模拟复杂计算
        return n * n * n
    }
}

// ✅ 推荐：预先计算或使用缓存
struct FastExample: View {
    let processedNumbers: [(number: Int, result: Int)]
    
    init() {
        let numbers = Array(1...1000)
        self.processedNumbers = numbers.map { n in
            (number: n, result: n * n * n)
        }
    }
    
    var body: some View {
        List {
            ForEach(processedNumbers, id: \.number) { item in
                Text("结果: \(item.result)")
            }
        }
    }
}
```

## 高级用法

### 1. 条件性 ForEach
```swift
struct ConditionalForEachView: View {
    @State private var showDetails = false
    let items = ["项目1", "项目2", "项目3"]
    
    var body: some View {
        VStack {
            Toggle("显示详情", isOn: $showDetails)
                .padding()
            
            List {
                ForEach(items, id: \.self) { item in
                    VStack(alignment: .leading) {
                        Text(item)
                            .font(.headline)
                        
                        if showDetails {
                            Text("这是 \(item) 的详细信息")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }
}
```

### 2. 自定义视图构建器
```swift
struct CustomForEach<Data, ID, Content>: View where Data: RandomAccessCollection, ID: Hashable, Content: View {
    let data: Data
    let id: KeyPath<Data.Element, ID>
    let content: (Data.Element) -> Content
    let separator: () -> AnyView
    
    init(
        _ data: Data,
        id: KeyPath<Data.Element, ID>,
        @ViewBuilder content: @escaping (Data.Element) -> Content,
        @ViewBuilder separator: @escaping () -> AnyView = { AnyView(EmptyView()) }
    ) {
        self.data = data
        self.id = id
        self.content = content
        self.separator = separator
    }
    
    var body: some View {
        VStack {
            ForEach(Array(data.enumerated()), id: \.offset) { index, element in
                content(element)
                
                if index < data.count - 1 {
                    separator()
                }
            }
        }
    }
}

// 使用示例
struct CustomForEachExample: View {
    let items = ["A", "B", "C", "D"]
    
    var body: some View {
        CustomForEach(items, id: \.self) { item in
            Text(item)
                .padding()
                .background(Color.blue.opacity(0.1))
        } separator: {
            AnyView(Divider().background(Color.red))
        }
    }
}
```

### 3. 分组显示
```swift
struct GroupedForEachView: View {
    let students = [
        Student(name: "张三", grade: "A"),
        Student(name: "李四", grade: "B"),
        Student(name: "王五", grade: "A"),
        Student(name: "赵六", grade: "C"),
        Student(name: "钱七", grade: "B")
    ]
    
    var groupedStudents: [String: [Student]] {
        Dictionary(grouping: students, by: { $0.grade })
    }
    
    var body: some View {
        List {
            ForEach(groupedStudents.keys.sorted(), id: \.self) { grade in
                SwiftUI.Section("等级 \(grade)") {
                    ForEach(groupedStudents[grade] ?? []) { student in
                        Text(student.name)
                    }
                }
            }
        }
    }
}

struct Student: Identifiable {
    let id = UUID()
    let name: String
    let grade: String
}
```

## 动画和过渡

### 1. 添加动画效果
```swift
struct AnimatedForEachView: View {
    @State private var items = ["项目1", "项目2", "项目3"]
    @State private var showItems = true
    
    var body: some View {
        VStack {
            Button(showItems ? "隐藏" : "显示") {
                withAnimation(.easeInOut(duration: 0.5)) {
                    showItems.toggle()
                }
            }
            .padding()
            
            if showItems {
                VStack {
                    ForEach(items.indices, id: \.self) { index in
                        Text(items[index])
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(8)
                            .transition(.slide.combined(with: .opacity))
                            .animation(.easeInOut(duration: 0.3).delay(Double(index) * 0.1), value: showItems)
                    }
                }
            }
        }
    }
}
```

### 2. 列表项动画
```swift
struct AnimatedListView: View {
    @State private var items = ["项目1", "项目2", "项目3"]
    
    var body: some View {
        NavigationView {
            List {
                ForEach(items, id: \.self) { item in
                    Text(item)
                        .transition(.asymmetric(
                            insertion: .move(edge: .leading).combined(with: .opacity),
                            removal: .move(edge: .trailing).combined(with: .opacity)
                        ))
                }
                .onDelete(perform: deleteItems)
            }
            .animation(.default, value: items)
            .navigationTitle("动画列表")
            .toolbar {
                Button("添加") {
                    withAnimation {
                        items.append("新项目 \(items.count + 1)")
                    }
                }
            }
        }
    }
    
    func deleteItems(offsets: IndexSet) {
        withAnimation {
            items.remove(atOffsets: offsets)
        }
    }
}
```

## 错误处理和边界情况

### 1. 处理空数据
```swift
struct SafeForEachView: View {
    @State private var items: [String] = []
    @State private var isLoading = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView("加载中...")
                    .padding()
            } else if items.isEmpty {
                VStack {
                    Image(systemName: "tray")
                        .font(.largeTitle)
                        .foregroundColor(.gray)
                    Text("暂无数据")
                        .foregroundColor(.gray)
                    Button("重新加载") {
                        loadData()
                    }
                    .padding(.top)
                }
                .padding()
            } else {
                List {
                    ForEach(items, id: \.self) { item in
                        Text(item)
                    }
                }
            }
        }
        .onAppear {
            loadData()
        }
    }
    
    func loadData() {
        isLoading = true
        // 模拟网络请求
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
            items = ["加载的项目1", "加载的项目2", "加载的项目3"]
        }
    }
}
```

## 注意事项和最佳实践

### 1. ID 的重要性
- 始终为 ForEach 提供稳定且唯一的 ID
- 避免使用 UUID() 作为 ID，除非确实需要每次都创建新视图
- 对于简单类型，可以使用 `\.self` 作为 ID

### 2. 性能考虑
- 避免在 ForEach 内部进行昂贵的计算
- 对于大量数据，考虑使用 LazyVStack 或 LazyHStack
- 合理使用 `@State` 和 `@ObservedObject` 来管理数据状态

### 3. 数据更新
- 确保数据源的变化能正确触发视图更新
- 使用 `@Published` 属性包装器来标记可观察的数据变化
- 在修改数组时使用动画来提供更好的用户体验

### 4. 可访问性
- 为动态生成的视图提供适当的可访问性标签
- 确保 ForEach 生成的内容对屏幕阅读器友好

## 常见错误和解决方案

### 1. 重复 ID 错误
```swift
// ❌ 错误：可能导致重复 ID
let items = ["Apple", "Apple", "Orange"]
ForEach(items, id: \.self) { item in  // "Apple" 出现两次
    Text(item)
}

// ✅ 解决方案：使用索引或创建唯一 ID
ForEach(Array(items.enumerated()), id: \.offset) { index, item in
    Text("\(index): \(item)")
}
```

### 2. 数据类型不匹配
```swift
// ❌ 错误：尝试在 ForEach 中使用不支持的数据类型
let dictionary = ["key1": "value1", "key2": "value2"]
// ForEach(dictionary) { ... } // 这不会工作

// ✅ 解决方案：转换为数组
ForEach(Array(dictionary.keys), id: \.self) { key in
    HStack {
        Text(key)
        Text(dictionary[key] ?? "")
    }
}
```

### 3. 视图更新问题
```swift
// ❌ 问题：视图不更新
class DataModel: ObservableObject {
    var items = ["A", "B", "C"] // 没有 @Published
}

// ✅ 解决方案：使用 @Published
class DataModel: ObservableObject {
    @Published var items = ["A", "B", "C"]
}
```

ForEach 是 SwiftUI 中最重要的控件之一，掌握其正确用法对于构建动态、高性能的用户界面至关重要。