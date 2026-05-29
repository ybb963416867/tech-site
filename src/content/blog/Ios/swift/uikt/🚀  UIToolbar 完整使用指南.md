---
title: "UIToolbar 完整使用指南"
description: "UIToolbar 是 UIKit 框架中的一个重要控件，用于在应用程序中显示一组操作按钮。它通常位于屏幕底部，为用户提供快速访问常用功能的方式。"
pubDate: 2026-05-29
category: "uikt"
tags: [Swift, API]
draft: false
---
# 🚀  UIToolbar 完整使用指南

## 概述

UIToolbar 是 UIKit 框架中的一个重要控件，用于在应用程序中显示一组操作按钮。它通常位于屏幕底部，为用户提供快速访问常用功能的方式。

## 基本特性

- **位置**: 通常位于视图底部
- **用途**: 包含一组相关的操作按钮
- **样式**: 支持不同的外观样式
- **自适应**: 自动适应不同屏幕尺寸

## 类定义

```swift
@MainActor class UIToolbar : UIView
```

## 主要属性

### 1. 工具栏样式

```swift
var barStyle: UIBarStyle { get set }
```

- 设置工具栏的样式
- 可选值：`.default`, `.black`, `.blackOpaque`, `.blackTranslucent`

### 2. 工具栏项目

```swift
var items: [UIBarButtonItem]? { get set }
```

- 设置工具栏中显示的按钮项目数组

### 3. 透明度设置

```swift
var isTranslucent: Bool { get set }
```

- 控制工具栏是否半透明
- 默认值：`true`

### 4. 色调设置

```swift
var tintColor: UIColor? { get set }
var barTintColor: UIColor? { get set }
```

- `tintColor`: 工具栏项目的颜色
- `barTintColor`: 工具栏背景色

### 5. 外观设置

```swift
var backgroundImage: UIImage? { get set }
var shadowImage: UIImage? { get set }
```

- 自定义工具栏的背景图像和阴影图像

## 主要方法

### 1. 设置工具栏项目

```swift
func setItems(_ items: [UIBarButtonItem]?, animated: Bool)
```

- 设置工具栏项目，支持动画效果
- 参数：
  - `items`: 工具栏项目数组
  - `animated`: 是否使用动画

### 2. 设置背景图像

```swift
func setBackgroundImage(_ backgroundImage: UIImage?, 
                       forToolbarPosition topOrBottom: UIBarPosition, 
                       barMetrics: UIBarMetrics)
```

- 为特定位置和尺寸设置背景图像

### 3. 设置阴影图像

```swift
func setShadowImage(_ shadowImage: UIImage?, 
                   forToolbarPosition topOrBottom: UIBarPosition)
```

- 为特定位置设置阴影图像

## UIBarButtonItem 详解

工具栏中的每个按钮都是 `UIBarButtonItem` 类型：

### 创建方式

```swift
// 1. 使用系统样式
let item = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addAction))

// 2. 使用标题
let item = UIBarButtonItem(title: "完成", style: .done, target: self, action: #selector(doneAction))

// 3. 使用图片
let item = UIBarButtonItem(image: UIImage(systemName: "heart"), style: .plain, target: self, action: #selector(heartAction))

// 4. 使用自定义视图
let customView = UIButton(type: .system)
let item = UIBarButtonItem(customView: customView)
```

### 系统按钮样式

常用的系统按钮样式：

- `.done` - 完成按钮
- `.cancel` - 取消按钮
- `.edit` - 编辑按钮
- `.save` - 保存按钮
- `.add` - 添加按钮
- `.compose` - 撰写按钮
- `.reply` - 回复按钮
- `.action` - 操作按钮
- `.organize` - 组织按钮
- `.bookmarks` - 书签按钮
- `.search` - 搜索按钮
- `.refresh` - 刷新按钮
- `.stop` - 停止按钮
- `.camera` - 相机按钮
- `.trash` - 垃圾桶按钮
- `.play` - 播放按钮
- `.pause` - 暂停按钮
- `.rewind` - 倒退按钮
- `.fastForward` - 快进按钮
- `.undo` - 撤销按钮
- `.redo` - 重做按钮

### 特殊项目

```swift
// 固定间距
let fixedSpace = UIBarButtonItem(barButtonSystemItem: .fixedSpace, target: nil, action: nil)
fixedSpace.width = 50

// 弹性间距
let flexibleSpace = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
```

## 实际使用示例

### 基本实现

```swift
class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupToolbar()
    }
    
    private func setupToolbar() {
        // 创建工具栏
        let toolbar = UIToolbar()
        toolbar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(toolbar)
        
        // 设置约束
        NSLayoutConstraint.activate([
            toolbar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            toolbar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            toolbar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        
        // 创建工具栏项目
        let addButton = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addAction))
        let flexibleSpace = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        let editButton = UIBarButtonItem(barButtonSystemItem: .edit, target: self, action: #selector(editAction))
        let fixedSpace = UIBarButtonItem(barButtonSystemItem: .fixedSpace, target: nil, action: nil)
        fixedSpace.width = 20
        let deleteButton = UIBarButtonItem(barButtonSystemItem: .trash, target: self, action: #selector(deleteAction))
        
        // 设置工具栏项目
        toolbar.items = [addButton, flexibleSpace, editButton, fixedSpace, deleteButton]
        
        // 自定义样式
        toolbar.barTintColor = UIColor.systemBlue
        toolbar.tintColor = UIColor.white
        toolbar.isTranslucent = false
    }
    
    @objc private func addAction() {
        print("添加按钮点击")
    }
    
    @objc private func editAction() {
        print("编辑按钮点击")
    }
    
    @objc private func deleteAction() {
        print("删除按钮点击")
    }
}
```

### 动态更新工具栏

```swift
private func updateToolbar() {
    guard let toolbar = self.toolbar else { return }
    
    let newItems = [
        UIBarButtonItem(barButtonSystemItem: .camera, target: self, action: #selector(cameraAction)),
        UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil),
        UIBarButtonItem(barButtonSystemItem: .compose, target: self, action: #selector(composeAction))
    ]
    
    toolbar.setItems(newItems, animated: true)
}
```

### 自定义外观

```swift
private func customizeToolbarAppearance() {
    let toolbar = UIToolbar()
    
    // 设置背景图片
    let backgroundImage = UIImage(named: "toolbar_background")
    toolbar.setBackgroundImage(backgroundImage, forToolbarPosition: .bottom, barMetrics: .default)
    
    // 设置阴影图片
    let shadowImage = UIImage(named: "toolbar_shadow")
    toolbar.setShadowImage(shadowImage, forToolbarPosition: .bottom)
    
    // 设置色调
    toolbar.barTintColor = UIColor.systemGreen
    toolbar.tintColor = UIColor.white
    
    // 设置透明度
    toolbar.isTranslucent = true
}
```

## 最佳实践

### 1. 按钮数量控制

- 避免在工具栏中放置过多按钮
- 通常建议不超过5个主要操作按钮
- 使用弹性间距合理分布按钮

### 2. 使用合适的图标

```swift
let heartButton = UIBarButtonItem(
    image: UIImage(systemName: "heart"),
    style: .plain,
    target: self,
    action: #selector(heartAction)
)
```

### 3. 状态管理

```swift
private func updateButtonStates() {
    editButton.isEnabled = items.count > 0
    deleteButton.isEnabled = selectedItems.count > 0
}
```

### 4. 响应式设计

```swift
override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)
    
    if traitCollection.horizontalSizeClass != previousTraitCollection?.horizontalSizeClass {
        updateToolbarForSizeClass()
    }
}
```

## 常见问题解决

### 1. 工具栏不显示

确保正确设置了约束或frame：

```swift
toolbar.translatesAutoresizingMaskIntoConstraints = false
// 添加适当的约束
```

### 2. 按钮点击无响应

检查target和action是否正确设置：

```swift
let button = UIBarButtonItem(title: "按钮", style: .plain, target: self, action: #selector(buttonAction))
```

### 3. 样式不生效

确保在添加到视图层次结构后设置样式：

```swift
view.addSubview(toolbar)
toolbar.barTintColor = UIColor.blue // 在添加后设置
```

## 总结

UIToolbar 是一个功能强大且灵活的控件，通过合理使用其提供的API，可以创建出既美观又实用的工具栏界面。关键是要：

1. 合理规划按钮布局
2. 使用合适的图标和文字
3. 保持界面的一致性
4. 考虑不同屏幕尺寸的适配
5. 提供良好的用户反馈

掌握这些知识点后，您就可以在项目中有效地使用UIToolbar来提升用户体验了。