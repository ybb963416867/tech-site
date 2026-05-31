---
title: "NavigationView 完整 API 指南"
description: "1. [NavigationView 概述](navigationview概述) 2. [基础使用](基础使用) 3. [导航标题 API](导航标题api) 4. [导航按钮 API](导航按钮api) 5. [工具栏 API](工..."
pubDate: 2026-05-29
category: "view"
tags: [Mac, iOS, Environment, Swift, Array, API]
draft: false
---
# 🚀 NavigationView 完整 API 指南

## 目录

1.  [NavigationView 概述](#navigationview-概述)
2.  [基础使用](#基础使用)
3.  [导航标题 API](#导航标题-api)
4.  [导航按钮 API](#导航按钮-api)
5.  [工具栏 API](#工具栏-api)
6.  [导航样式 API](#导航样式-api)
7.  [导航链接 API](#导航链接-api)
8.  [搜索功能 API](#搜索功能-api)
9.  [导航状态管理](#导航状态管理)
10. [iPad 适配](#ipad-适配)
11. [实用示例](#实用示例)

***

## NavigationView 概述

> **注意**：NavigationView 在 iOS 16+ 中已被 NavigationStack 和 NavigationSplitView 替代，但仍然向后兼容。

NavigationView 是 SwiftUI 中用于创建导航界面的容器视图，提供了标题栏、导航按钮、工具栏等功能。

### 基本特性

*   提供层次化导航体验
*   支持 push/pop 导航模式
*   内置标题栏和工具栏支持
*   支持 iPad 的分屏显示
*   与 NavigationLink 配合实现页面跳转

***

## 基础使用

### 1. 基本结构

```swift
struct BasicNavigationExample: View {
    var body: some View {
        List {
            ForEach(filteredCategories) { category in
                Section(category.name) {
                    ForEach(category.items, id: \.self) { item in
                        NavigationLink(destination: ItemDetailView(item: item, category: category.name)) {
                            HStack {
                                Image(systemName: category.icon)
                                    .foregroundColor(.blue)
                                Text(item)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("应用导航")
        .searchable(text: $searchText)
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button(action: { showingSheet = true }) {
                    Image(systemName: "plus")
                }
                
                Button(action: { print("设置") }) {
                    Image(systemName: "gear")
                }
            }
        }
        .sheet(isPresented: $showingSheet) {
            AddItemSheet()
        }
    }
}

struct Category: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let items: [String]
}

struct ItemDetailView: View {
    let item: String
    let category: String
    @State private var isFavorite = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text(item)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("分类: \(category)")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Button(action: { isFavorite.toggle() }) {
                HStack {
                    Image(systemName: isFavorite ? "heart.fill" : "heart")
                    Text(isFavorite ? "已收藏" : "收藏")
                }
                .foregroundColor(isFavorite ? .red : .blue)
            }
            .buttonStyle(.bordered)
            
            Spacer()
        }
        .padding()
        .navigationTitle(item)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("分享") {
                    print("分享 \(item)")
                }
            }
        }
    }
}

struct AddItemSheet: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var itemName = ""
    @State private var selectedCategory = "新闻"
    
    let categories = ["新闻", "购物", "娱乐"]
    
    var body: some View {
        NavigationView {
            Form {
                Section("项目信息") {
                    TextField("项目名称", text: $itemName)
                    
                    Picker("分类", selection: $selectedCategory) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                }
            }
            .navigationTitle("添加项目")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        // 保存逻辑
                        presentationMode.wrappedValue.dismiss()
                    }
                    .disabled(itemName.isEmpty)
                }
            }
        }
    }
}
```

### 2. 带登录状态的导航

```swift
struct AuthenticatedNavigationExample: View {
    @State private var isLoggedIn = false
    @State private var user: User?
    
    var body: some View {
        Group {
            if isLoggedIn, let user = user {
                AuthenticatedMainView(user: user, onLogout: {
                    isLoggedIn = false
                    self.user = nil
                })
            } else {
                LoginView(onLogin: { user in
                    self.user = user
                    isLoggedIn = true
                })
            }
        }
    }
}

struct User {
    let name: String
    let email: String
    let avatar: String
}

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    let onLogin: (User) -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("欢迎登录")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                VStack(spacing: 15) {
                    TextField("邮箱", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("密码", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                
                Button("登录") {
                    // 模拟登录
                    let user = User(name: "张三", email: email, avatar: "person.circle")
                    onLogin(user)
                }
                .buttonStyle(.borderedProminent)
                .disabled(email.isEmpty || password.isEmpty)
            }
            .padding()
            .navigationTitle("登录")
        }
    }
}

struct AuthenticatedMainView: View {
    let user: User
    let onLogout: () -> Void
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack {
                        Image(systemName: user.avatar)
                            .font(.largeTitle)
                        VStack(alignment: .leading) {
                            Text(user.name)
                                .font(.headline)
                            Text(user.email)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
                
                Section("功能") {
                    NavigationLink("我的订单") {
                        OrdersView()
                    }
                    
                    NavigationLink("个人设置") {
                        SettingsView()
                    }
                    
                    NavigationLink("帮助中心") {
                        HelpView()
                    }
                }
                
                Section {
                    Button("退出登录") {
                        onLogout()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("主页")
        }
    }
}

struct OrdersView: View {
    var body: some View {
        List(0..<10) { index in
            VStack(alignment: .leading, spacing: 4) {
                Text("订单 #\(1000 + index)")
                    .font(.headline)
                Text("订单状态: 已完成")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("我的订单")
    }
}

struct SettingsView: View {
    @State private var enableNotifications = true
    @State private var enableLocation = false
    
    var body: some View {
        Form {
            Section("通知设置") {
                Toggle("推送通知", isOn: $enableNotifications)
                Toggle("位置服务", isOn: $enableLocation)
            }
            
            Section("账户") {
                Button("修改密码") {
                    print("修改密码")
                }
                
                Button("删除账户") {
                    print("删除账户")
                }
                .foregroundColor(.red)
            }
        }
        .navigationTitle("设置")
    }
}

struct HelpView: View {
    let helpItems = [
        "如何下单",
        "支付问题",
        "退款政策",
        "联系客服"
    ]
    
    var body: some View {
        List(helpItems, id: \.self) { item in
            NavigationLink(destination: HelpDetailView(title: item)) {
                Text(item)
            }
        }
        .navigationTitle("帮助中心")
    }
}

struct HelpDetailView: View {
    let title: String
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("关于\(title)")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("这里是\(title)的详细说明内容。您可以在这里找到相关的帮助信息和解决方案。")
                    .font(.body)
                
                Text("如果您还有其他问题，请联系我们的客服团队。")
                    .font(.body)
                
                Spacer(minLength: 50)
            }
            .padding()
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

### 3. 动态导航内容

```swift
struct DynamicNavigationExample: View {
    @StateObject private var dataManager = DataManager()
    
    var body: some View {
        NavigationView {
            DynamicContentView()
                .environmentObject(dataManager)
        }
    }
}

class DataManager: ObservableObject {
    @Published var categories: [DynamicCategory] = [
        DynamicCategory(name: "技术", items: ["Swift", "SwiftUI", "iOS"]),
        DynamicCategory(name: "设计", items: ["UI设计", "UX设计", "图标设计"]),
        DynamicCategory(name: "产品", items: ["产品经理", "用户研究", "数据分析"])
    ]
    
    func addCategory(_ category: DynamicCategory) {
        categories.append(category)
    }
    
    func removeCategory(at index: Int) {
        categories.remove(at: index)
    }
    
    func addItem(to categoryIndex: Int, item: String) {
        categories[categoryIndex].items.append(item)
    }
}

struct DynamicCategory: Identifiable {
    let id = UUID()
    let name: String
    var items: [String]
}

struct DynamicContentView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var showingAddCategory = false
    
    var body: some View {
        List {
            ForEach(Array(dataManager.categories.enumerated()), id: \.element.id) { index, category in
                Section(
                    header: HStack {
                        Text(category.name)
                        Spacer()
                        Button("添加项目") {
                            dataManager.addItem(to: index, item: "新项目 \(category.items.count + 1)")
                        }
                        .font(.caption)
                    }
                ) {
                    ForEach(category.items, id: \.self) { item in
                        NavigationLink(destination: DynamicItemView(item: item, category: category.name)) {
                            Text(item)
                        }
                    }
                }
            }
            .onDelete(perform: deleteCategory)
        }
        .navigationTitle("动态内容")
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                EditButton()
                
                Button("添加分类") {
                    showingAddCategory = true
                }
            }
        }
        .alert("添加分类", isPresented: $showingAddCategory) {
            TextField("分类名称", text: .constant(""))
            Button("添加") {
                let newCategory = DynamicCategory(name: "新分类", items: [])
                dataManager.addCategory(newCategory)
            }
            Button("取消", role: .cancel) { }
        }
    }
    
    private func deleteCategory(at offsets: IndexSet) {
        for index in offsets {
            dataManager.removeCategory(at: index)
        }
    }
}

struct DynamicItemView: View {
    let item: String
    let category: String
    
    var body: some View {
        VStack(spacing: 20) {
            Text(item)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("所属分类: \(category)")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Button("执行操作") {
                print("对\(item)执行操作")
            }
            .buttonStyle(.borderedProminent)
            
            Spacer()
        }
        .padding()
        .navigationTitle(item)
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

***

## 总结

NavigationView 提供了完整的导航功能：

### 核心功能

1.  **基础导航** - 页面跳转和返回
2.  **标题管理** - 动态标题和显示模式
3.  **工具栏支持** - 导航按钮和键盘工具栏
4.  **搜索集成** - 内置搜索功能
5.  **样式控制** - 堆栈和分栏样式

### 高级特性

*   **程序化导航** - 通过状态控制导航
*   **数据传递** - 在页面间传递数据
*   **响应式布局** - iPad 和 iPhone 适配
*   **状态管理** - 导航状态跟踪和控制

### 最佳实践

1.  根据设备选择合适的导航样式
2.  合理使用工具栏和导航按钮
3.  实现响应式布局适配
4.  正确管理导航状态和数据传递

### 迁移提示

> **注意**: iOS 16+ 推荐使用 NavigationStack 和 NavigationSplitView 替代 NavigationView，它们提供了更好的性能和更灵活的 API。

NavigationView 是构建 SwiftUI 应用导航体验的核心组件，掌握这些 API 可以创建出流畅、直观的用户导航体验。 some View {
NavigationView {
VStack {
Text("主页内容")

                NavigationLink("跳转到详情页") {
                    DetailView()
                }
            }
            .navigationTitle("主页")
        }
    }

}

struct DetailView: View {
var body: some View {
Text("详情页")
.navigationTitle("详情")
}
}

````

### 2. 导航模式选择

```swift
struct NavigationModeExample: View {
    var body: some View {
        NavigationView {
            ContentView()
        }
        // 导航视图样式
        .navigationViewStyle(.automatic) // 自动选择样式
        // .navigationViewStyle(.stack)     // 强制使用堆栈样式
        // .navigationViewStyle(.columns)   // 强制使用分栏样式
    }
}
````

***

## 导航标题 API

### 1. `.navigationTitle()`

#### 基本标题设置

```swift
struct NavigationTitleExample: View {
    var body: some View {
        NavigationView {
            List(0..<20) { index in
                Text("项目 \(index)")
            }
            .navigationTitle("列表标题")
        }
    }
}
```

#### 动态标题

```swift
struct DynamicTitleExample: View {
    @State private var itemCount = 10
    
    var body: some View {
        NavigationView {
            VStack {
                List(0..<itemCount, id: \.self) { index in
                    Text("项目 \(index)")
                }
                
                Button("添加项目") {
                    itemCount += 1
                }
            }
            .navigationTitle("项目 (\(itemCount))")
        }
    }
}
```

### 2. `.navigationBarTitleDisplayMode()`

#### 标题显示模式

```swift
struct TitleDisplayModeExample: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    ForEach(0..<50) { index in
                        Text("内容行 \(index)")
                    }
                }
                .padding()
            }
            .navigationTitle("大标题示例")
            .navigationBarTitleDisplayMode(.large) // 大标题模式
            // .navigationBarTitleDisplayMode(.inline) // 内联模式
            // .navigationBarTitleDisplayMode(.automatic) // 自动模式
        }
    }
}
```

### 3. 自定义标题视图

```swift
struct CustomTitleExample: View {
    var body: some View {
        NavigationView {
            List(0..<20) { index in
                Text("项目 \(index)")
            }
            .navigationBarTitleDisplayMode(.inline)
            // 自定义标题区域
            .toolbar {
                ToolbarItem(placement: .principal) {
                    HStack {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text("自定义标题")
                            .font(.headline)
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                    }
                }
            }
        }
    }
}
```

***

## 导航按钮 API

### 1. `.navigationBarBackButtonHidden()`

#### 隐藏返回按钮

```swift
struct HideBackButtonExample: View {
    var body: some View {
        NavigationView {
            VStack {
                NavigationLink("跳转到详情") {
                    DetailViewWithCustomBack()
                }
            }
            .navigationTitle("主页")
        }
    }
}

struct DetailViewWithCustomBack: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        VStack {
            Text("详情页")
            
            Button("自定义返回") {
                presentationMode.wrappedValue.dismiss()
            }
        }
        .navigationTitle("详情")
        .navigationBarBackButtonHidden(true)
    }
}
```

### 2. 导航栏按钮

#### `.navigationBarLeading` 和 `.navigationBarTrailing`

```swift
struct NavigationBarButtonsExample: View {
    @State private var showAlert = false
    
    var body: some View {
        NavigationView {
            List(0..<20) { index in
                Text("项目 \(index)")
            }
            .navigationTitle("按钮示例")
            .toolbar {
                // 左侧按钮
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("编辑") {
                        print("编辑按钮点击")
                    }
                }
                
                // 右侧按钮
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("添加") {
                        showAlert = true
                    }
                }
            }
            .alert("添加项目", isPresented: $showAlert) {
                Button("确定") { }
                Button("取消", role: .cancel) { }
            }
        }
    }
}
```

#### 多个导航栏按钮

```swift
struct MultipleBarButtonsExample: View {
    var body: some View {
        NavigationView {
            Text("多按钮示例")
                .navigationTitle("工具栏")
                .toolbar {
                    // 右侧多个按钮
                    ToolbarItemGroup(placement: .navigationBarTrailing) {
                        Button(action: { print("分享") }) {
                            Image(systemName: "square.and.arrow.up")
                        }
                        
                        Button(action: { print("收藏") }) {
                            Image(systemName: "heart")
                        }
                        
                        Button(action: { print("更多") }) {
                            Image(systemName: "ellipsis")
                        }
                    }
                    
                    // 左侧按钮
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("取消") {
                            print("取消")
                        }
                    }
                }
        }
    }
}
```

***

## 工具栏 API

### 1. `.toolbar` 修饰符

#### 基本工具栏

```swift
struct BasicToolbarExample: View {
    var body: some View {
        NavigationView {
            Text("工具栏示例")
                .navigationTitle("工具栏")
                .toolbar {
                    Button("操作") {
                        print("工具栏按钮点击")
                    }
                }
        }
    }
}
```

#### 工具栏项目位置

```swift
struct ToolbarPlacementExample: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("工具栏位置示例")
            }
            .navigationTitle("位置示例")
            .toolbar {
                // 导航栏左侧
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("左侧") { }
                }
                
                // 导航栏右侧
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("右侧") { }
                }
                
                // 主要位置（标题区域）
                ToolbarItem(placement: .principal) {
                    Text("主标题")
                        .font(.headline)
                }
                
                // 键盘上方
                ToolbarItem(placement: .keyboard) {
                    Button("键盘工具") { }
                }
                
                // 底部工具栏
                ToolbarItem(placement: .bottomBar) {
                    Button("底部") { }
                }
            }
        }
    }
}
```

### 2. 工具栏可见性控制

```swift
struct ToolbarVisibilityExample: View {
    @State private var isToolbarVisible = true
    
    var body: some View {
        NavigationView {
            VStack {
                Toggle("显示工具栏", isOn: $isToolbarVisible)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("工具栏可见性")
            .toolbar(isToolbarVisible ? .visible : .hidden, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("设置") {
                        print("设置")
                    }
                }
            }
        }
    }
}
```

***

## 导航样式 API

### 1. `.navigationViewStyle()`

#### 堆栈样式

```swift
struct StackStyleExample: View {
    var body: some View {
        NavigationView {
            List {
                NavigationLink("页面1") { Text("页面1") }
                NavigationLink("页面2") { Text("页面2") }
                NavigationLink("页面3") { Text("页面3") }
            }
            .navigationTitle("堆栈样式")
        }
        .navigationViewStyle(.stack) // 强制使用堆栈样式
    }
}
```

#### 分栏样式

```swift
struct ColumnStyleExample: View {
    var body: some View {
        NavigationView {
            // 主视图（左侧边栏）
            List {
                NavigationLink("首页") {
                    HomeView()
                }
                NavigationLink("设置") {
                    SettingsView()
                }
                NavigationLink("关于") {
                    AboutView()
                }
            }
            .navigationTitle("菜单")
            .frame(minWidth: 200)
            
            // 默认详情视图（右侧内容）
            Text("请选择一个菜单项")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.gray.opacity(0.1))
        }
        .navigationViewStyle(.columns) // 强制使用分栏样式
    }
}

struct HomeView: View {
    var body: some View {
        Text("首页内容")
            .navigationTitle("首页")
    }
}

struct SettingsView: View {
    var body: some View {
        Text("设置内容")
            .navigationTitle("设置")
    }
}

struct AboutView: View {
    var body: some View {
        Text("关于内容")
            .navigationTitle("关于")
    }
}
```

### 2. 自适应样式

```swift
struct AdaptiveStyleExample: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    
    var body: some View {
        NavigationView {
            SidebarView()
            
            if horizontalSizeClass == .compact {
                // iPhone 或紧凑模式
                Text("紧凑模式内容")
            } else {
                // iPad 或宽屏模式
                Text("请从左侧选择内容")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.gray.opacity(0.1))
            }
        }
        .navigationViewStyle(.automatic) // 自动适应
    }
}

struct SidebarView: View {
    var body: some View {
        List {
            Section("主要功能") {
                NavigationLink("仪表盘") { DashboardView() }
                NavigationLink("数据分析") { AnalyticsView() }
            }
            
            Section("设置") {
                NavigationLink("用户设置") { UserSettingsView() }
                NavigationLink("系统设置") { SystemSettingsView() }
            }
        }
        .navigationTitle("导航")
    }
}

struct DashboardView: View {
    var body: some View {
        Text("仪表盘")
            .navigationTitle("仪表盘")
    }
}

struct AnalyticsView: View {
    var body: some View {
        Text("数据分析")
            .navigationTitle("数据分析")
    }
}

struct UserSettingsView: View {
    var body: some View {
        Text("用户设置")
            .navigationTitle("用户设置")
    }
}

struct SystemSettingsView: View {
    var body: some View {
        Text("系统设置")
            .navigationTitle("系统设置")
    }
}
```

***

## 导航链接 API

### 1. `NavigationLink` 基础用法

#### 基本链接

```swift
struct BasicNavigationLinkExample: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // 基本导航链接
                NavigationLink("跳转到详情页") {
                    Text("详情页内容")
                        .navigationTitle("详情")
                }
                
                // 自定义样式的链接
                NavigationLink(destination: CustomDetailView()) {
                    HStack {
                        Image(systemName: "arrow.right.circle")
                        Text("自定义样式链接")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            .padding()
            .navigationTitle("导航链接")
        }
    }
}

struct CustomDetailView: View {
    var body: some View {
        Text("自定义详情页")
            .navigationTitle("自定义详情")
    }
}
```

#### 程序化导航

```swift
struct ProgrammaticNavigationExample: View {
    @State private var isActive = false
    @State private var selectedTag: Int? = nil
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // 使用 isActive 控制导航
                NavigationLink(
                    destination: Text("页面1").navigationTitle("页面1"),
                    isActive: $isActive
                ) {
                    EmptyView()
                }
                
                Button("程序化跳转到页面1") {
                    isActive = true
                }
                
                // 使用 tag 和 selection 控制导航
                NavigationLink(
                    destination: Text("页面2").navigationTitle("页面2"),
                    tag: 1,
                    selection: $selectedTag
                ) {
                    EmptyView()
                }
                
                NavigationLink(
                    destination: Text("页面3").navigationTitle("页面3"),
                    tag: 2,
                    selection: $selectedTag
                ) {
                    EmptyView()
                }
                
                HStack {
                    Button("跳转到页面2") {
                        selectedTag = 1
                    }
                    
                    Button("跳转到页面3") {
                        selectedTag = 2
                    }
                }
            }
            .navigationTitle("程序化导航")
        }
    }
}
```

### 2. 数据传递

#### 传递数据到目标页面

```swift
struct DataPassingExample: View {
    let items = ["苹果", "香蕉", "橙子", "葡萄"]
    
    var body: some View {
        NavigationView {
            List(items, id: \.self) { item in
                NavigationLink(
                    destination: ItemDetailView(itemName: item)
                ) {
                    HStack {
                        Image(systemName: "leaf")
                            .foregroundColor(.green)
                        Text(item)
                    }
                }
            }
            .navigationTitle("水果列表")
        }
    }
}

struct ItemDetailView: View {
    let itemName: String
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "leaf.fill")
                .font(.system(size: 100))
                .foregroundColor(.green)
            
            Text(itemName)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("这是\(itemName)的详细信息页面")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding()
        }
        .navigationTitle(itemName)
    }
}
```

***

## 搜索功能 API

### 1. `.searchable()` 修饰符

#### 基本搜索功能

```swift
struct SearchableExample: View {
    @State private var searchText = ""
    let items = ["苹果", "香蕉", "橙子", "葡萄", "草莓", "蓝莓", "樱桃"]
    
    var filteredItems: [String] {
        if searchText.isEmpty {
            return items
        } else {
            return items.filter { $0.contains(searchText) }
        }
    }
    
    var body: some View {
        NavigationView {
            List(filteredItems, id: \.self) { item in
                Text(item)
            }
            .navigationTitle("搜索示例")
            .searchable(text: $searchText)
        }
    }
}
```

#### 带搜索建议的搜索

```swift
struct SearchWithSuggestionsExample: View {
    @State private var searchText = ""
    let items = ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Apple TV"]
    let suggestions = ["iPhone 14", "iPad Pro", "MacBook Air", "Apple Watch Series 8"]
    
    var filteredItems: [String] {
        if searchText.isEmpty {
            return items
        } else {
            return items.filter { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    var body: some View {
        NavigationView {
            List(filteredItems, id: \.self) { item in
                NavigationLink(destination: Text(item)) {
                    Text(item)
                }
            }
            .navigationTitle("Apple 产品")
            .searchable(text: $searchText) {
                ForEach(suggestions.filter { 
                    $0.localizedCaseInsensitiveContains(searchText) 
                }, id: \.self) { suggestion in
                    Text(suggestion)
                        .searchCompletion(suggestion)
                }
            }
        }
    }
}
```

#### 搜索范围

```swift
struct SearchScopesExample: View {
    @State private var searchText = ""
    @State private var searchScope = SearchScope.all
    
    enum SearchScope: String, CaseIterable {
        case all = "全部"
        case fruits = "水果"
        case vegetables = "蔬菜"
    }
    
    let fruits = ["苹果", "香蕉", "橙子"]
    let vegetables = ["胡萝卜", "西红柿", "黄瓜"]
    
    var items: [String] {
        switch searchScope {
        case .all:
            return fruits + vegetables
        case .fruits:
            return fruits
        case .vegetables:
            return vegetables
        }
    }
    
    var filteredItems: [String] {
        if searchText.isEmpty {
            return items
        } else {
            return items.filter { $0.contains(searchText) }
        }
    }
    
    var body: some View {
        NavigationView {
            List(filteredItems, id: \.self) { item in
                Text(item)
            }
            .navigationTitle("搜索范围")
            .searchable(
                text: $searchText,
                scope: $searchScope
            ) {
                ForEach(SearchScope.allCases, id: \.self) { scope in
                    Text(scope.rawValue).tag(scope)
                }
            }
        }
    }
}
```

***

## 导航状态管理

### 1. `@Environment(\.presentationMode)`

#### 手动控制返回

```swift
struct ManualDismissExample: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var showAlert = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("手动控制返回示例")
            
            Button("保存并返回") {
                // 执行保存逻辑
                presentationMode.wrappedValue.dismiss()
            }
            .buttonStyle(.borderedProminent)
            
            Button("询问是否返回") {
                showAlert = true
            }
            .buttonStyle(.bordered)
        }
        .navigationTitle("手动返回")
        .navigationBarBackButtonHidden(true)
        .alert("确认返回", isPresented: $showAlert) {
            Button("返回") {
                presentationMode.wrappedValue.dismiss()
            }
            Button("取消", role: .cancel) { }
        } message: {
            Text("您确定要返回吗？未保存的更改将丢失。")
        }
    }
}
```

### 2. 导航状态跟踪

```swift
struct NavigationStateExample: View {
    @State private var navigationPath: [String] = []
    
    var body: some View {
        NavigationView {
            VStack {
                Text("当前导航路径:")
                Text(navigationPath.joined(separator: " → "))
                    .font(.caption)
                    .foregroundColor(.gray)
                
                List {
                    NavigationLink("页面 A") {
                        NavigationStateDetailView(
                            title: "页面 A",
                            path: $navigationPath
                        )
                    }
                    NavigationLink("页面 B") {
                        NavigationStateDetailView(
                            title: "页面 B",
                            path: $navigationPath
                        )
                    }
                }
            }
            .navigationTitle("导航状态")
            .onAppear {
                navigationPath = ["首页"]
            }
        }
    }
}

struct NavigationStateDetailView: View {
    let title: String
    @Binding var path: [String]
    
    var body: some View {
        VStack {
            Text("当前路径:")
            Text(path.joined(separator: " → "))
                .font(.caption)
                .foregroundColor(.gray)
                .padding()
            
            NavigationLink("下一级页面") {
                NavigationStateDetailView(
                    title: "\(title) - 子页面",
                    path: $path
                )
            }
        }
        .navigationTitle(title)
        .onAppear {
            path.append(title)
        }
        .onDisappear {
            if path.last == title {
                path.removeLast()
            }
        }
    }
}
```

***

## iPad 适配

### 1. 分屏布局适配

```swift
struct iPadAdaptationExample: View {
    @State private var selectedItem: SidebarItem? = .dashboard
    
    enum SidebarItem: String, CaseIterable, Identifiable {
        case dashboard = "仪表盘"
        case analytics = "分析"
        case settings = "设置"
        case profile = "个人资料"
        
        var id: String { rawValue }
        var iconName: String {
            switch self {
            case .dashboard: return "square.grid.2x2"
            case .analytics: return "chart.bar"
            case .settings: return "gear"
            case .profile: return "person"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            // 侧边栏
            SidebarContentView(selectedItem: $selectedItem)
            
            // 主内容区域
            MainContentView(selectedItem: selectedItem)
                .frame(minWidth: 300)
        }
        .navigationViewStyle(.columns)
    }
}

struct SidebarContentView: View {
    @Binding var selectedItem: iPadAdaptationExample.SidebarItem?
    
    var body: some View {
        List(iPadAdaptationExample.SidebarItem.allCases, selection: $selectedItem) { item in
            NavigationLink(
                destination: MainContentView(selectedItem: item),
                tag: item,
                selection: $selectedItem
            ) {
                Label(item.rawValue, systemImage: item.iconName)
            }
        }
        .navigationTitle("菜单")
        .listStyle(SidebarListStyle())
    }
}

struct MainContentView: View {
    let selectedItem: iPadAdaptationExample.SidebarItem?
    
    var body: some View {
        Group {
            if let item = selectedItem {
                VStack(spacing: 20) {
                    Image(systemName: item.iconName)
                        .font(.system(size: 80))
                        .foregroundColor(.blue)
                    
                    Text(item.rawValue)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("这是\(item.rawValue)页面的内容")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .navigationTitle(item.rawValue)
            } else {
                Text("请从左侧选择一个选项")
                    .font(.title2)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }
}
```

### 2. 响应式导航

```swift
struct ResponsiveNavigationExample: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @State private var selectedTab = 0
    
    var body: some View {
        Group {
            if horizontalSizeClass == .compact {
                // iPhone 或紧凑模式 - 使用 TabView
                TabView(selection: $selectedTab) {
                    NavigationView {
                        HomeTabView()
                    }
                    .tabItem {
                        Image(systemName: "house")
                        Text("首页")
                    }
                    .tag(0)
                    
                    NavigationView {
                        SearchTabView()
                    }
                    .tabItem {
                        Image(systemName: "magnifyingglass")
                        Text("搜索")
                    }
                    .tag(1)
                    
                    NavigationView {
                        ProfileTabView()
                    }
                    .tabItem {
                        Image(systemName: "person")
                        Text("个人")
                    }
                    .tag(2)
                }
            } else {
                // iPad 或宽屏模式 - 使用 NavigationView
                NavigationView {
                    List {
                        NavigationLink("首页") { HomeTabView() }
                        NavigationLink("搜索") { SearchTabView() }
                        NavigationLink("个人") { ProfileTabView() }
                    }
                    .navigationTitle("主菜单")
                    
                    Text("请选择左侧菜单项")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color(.systemGroupedBackground))
                }
                .navigationViewStyle(.columns)
            }
        }
    }
}

struct HomeTabView: View {
    var body: some View {
        Text("首页内容")
            .navigationTitle("首页")
    }
}

struct SearchTabView: View {
    var body: some View {
        Text("搜索内容")
            .navigationTitle("搜索")
    }
}

struct ProfileTabView: View {
    var body: some View {
        Text("个人资料")
            .navigationTitle("个人")
    }
}
```

***

## 实用示例

### 1. 完整的应用导航结构

```swift
struct CompleteNavigationExample: View {
    var body: some View {
        NavigationView {
            ContentListView()
        }
    }
}

struct ContentListView: View {
    @State private var searchText = ""
    @State private var showingSheet = false
    
    let categories = [
        Category(name: "新闻", icon: "newspaper", items: ["科技新闻", "体育新闻", "娱乐新闻"]),
        Category(name: "购物", icon: "cart", items: ["电子产品", "服装", "食品"]),
        Category(name: "娱乐", icon: "tv", items: ["电影", "音乐", "游戏"])
    ]
    
    var filteredCategories: [Category] {
        if searchText.isEmpty {
            return categories
        } else {
            return categories.filter { category in
                category.name.contains(searchText) ||
                category.items.contains { $0.contains(searchText) }
            }
        }
    }
    
    var body:
```

