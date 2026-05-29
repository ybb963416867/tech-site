---
title: "UIViewController 完整指南"
description: "UIViewController 是 iOS 开发中最重要的类之一，它是所有视图控制器的基类。本指南详细介绍了 UIViewController 的所有主要 API、属性和用法。"
pubDate: 2026-05-29
category: "uikt"
tags: [iOS, Swift, API]
draft: false
---
# 🚀  UIViewController 完整指南

UIViewController 是 iOS 开发中最重要的类之一，它是所有视图控制器的基类。本指南详细介绍了 UIViewController 的所有主要 API、属性和用法。

## 目录
- [基础概念](#基础概念)
- [生命周期方法](#生命周期方法)
- [核心属性](#核心属性)
- [视图管理](#视图管理)
- [导航相关](#导航相关)
- [模态展示](#模态展示)
- [状态栏管理](#状态栏管理)
- [自动旋转](#自动旋转)
- [键盘管理](#键盘管理)
- [内存管理](#内存管理)
- [最佳实践](#最佳实践)

## 基础概念

UIViewController 是 MVC 架构中的控制器（Controller）部分，负责：
- 管理视图层次结构
- 处理用户交互
- 协调模型和视图之间的数据传递
- 管理视图控制器的生命周期

## 生命周期方法

### 主要生命周期方法

```swift
class MyViewController: UIViewController {
    
    // 1. 视图加载到内存中后调用（只调用一次）
    override func viewDidLoad() {
        super.viewDidLoad()
        // 设置一次性的配置
        // 创建 UI 元素
        // 设置观察者
    }
    
    // 2. 视图即将出现
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // 刷新数据
        // 更新 UI 状态
        // 注册通知
    }
    
    // 3. 视图已经出现
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // 开始定时器
        // 开始动画
        // 开始位置服务等
    }
    
    // 4. 视图即将消失
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        // 保存用户输入
        // 暂停定时器
    }
    
    // 5. 视图已经消失
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        // 停止定时器
        // 清理资源
        // 注销通知
    }
    
    // 6. 视图控制器从内存中释放
    deinit {
        // 清理观察者
        // 释放资源
        print("ViewController 被释放")
    }
}
```

### 视图布局相关生命周期

```swift
// 视图即将布局子视图
override func viewWillLayoutSubviews() {
    super.viewWillLayoutSubviews()
    // 在自动布局之前进行手动调整
}

// 视图已经布局子视图
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    // 根据最终布局结果进行调整
    // 更新基于frame的计算
}

// 当视图控制器的视图需要更新约束时调用
override func updateViewConstraints() {
    super.updateViewConstraints()
    // 更新约束
}
```

## 核心属性

### 视图相关属性

```swift
class MyViewController: UIViewController {
    
    // 视图控制器的根视图
    var view: UIView! { get set }
    
    // 视图是否已加载
    var isViewLoaded: Bool { get }
    
    // 视图的安全区域
    var additionalSafeAreaInsets: UIEdgeInsets { get set }
    
    // 系统安全区域
    var systemMinimumLayoutMargins: NSDirectionalEdgeInsets { get set }
    
    // 视图边距
    var viewRespectsSystemMinimumLayoutMargins: Bool { get set }
}
```

### 层次结构属性

```swift
// 父视图控制器
var parent: UIViewController? { get }

// 子视图控制器数组
var children: [UIViewController] { get }

// 展示此视图控制器的视图控制器
var presentingViewController: UIViewController? { get }

// 被此视图控制器展示的视图控制器
var presentedViewController: UIViewController? { get }
```

### 标识和信息属性

```swift
// 视图控制器标题
var title: String? { get set }

// 导航项配置
var navigationItem: UINavigationItem { get }

// 工具栏项
var toolbarItems: [UIBarButtonItem]? { get set }

// 标签栏项
var tabBarItem: UITabBarItem! { get set }

// 是否定义展示上下文
var definesPresentationContext: Bool { get set }

// 是否提供展示上下文
var providesPresentationContextTransitionStyle: Bool { get set }
```

## 视图管理

### 手动创建视图

```swift
class CustomViewController: UIViewController {
    
    override func loadView() {
        // 不要调用 super.loadView()
        
        // 创建根视图
        view = UIView()
        view.backgroundColor = .white
        
        // 添加子视图
        let label = UILabel()
        label.text = "Hello World"
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        
        // 设置约束
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}
```

### 子视图控制器管理

```swift
class ContainerViewController: UIViewController {
    
    // 添加子视图控制器
    func addChildViewController(_ childController: UIViewController) {
        // 1. 添加为子视图控制器
        addChild(childController)
        
        // 2. 添加子视图控制器的视图
        view.addSubview(childController.view)
        
        // 3. 设置约束或frame
        childController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            childController.view.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            childController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            childController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            childController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        
        // 4. 通知子视图控制器已移动到父视图控制器
        childController.didMove(toParent: self)
    }
    
    // 移除子视图控制器
    func removeChildViewController(_ childController: UIViewController) {
        // 1. 通知即将从父视图控制器移除
        childController.willMove(toParent: nil)
        
        // 2. 从父视图控制器中移除
        childController.removeFromParent()
        
        // 3. 从视图层次结构中移除
        childController.view.removeFromSuperview()
    }
}
```

## 导航相关

### 导航控制器集成

```swift
class MyViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 设置导航栏标题
        title = "我的页面"
        navigationItem.title = "导航标题"
        
        // 设置导航栏按钮
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add,
            target: self,
            action: #selector(addButtonTapped)
        )
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "返回",
            style: .plain,
            target: self,
            action: #selector(backButtonTapped)
        )
        
        // 隐藏导航栏
        navigationController?.setNavigationBarHidden(true, animated: true)
        
        // 设置大标题
        navigationController?.navigationBar.prefersLargeTitles = true
        navigationItem.largeTitleDisplayMode = .always
    }
    
    @objc func addButtonTapped() {
        // 导航到新页面
        let nextVC = NextViewController()
        navigationController?.pushViewController(nextVC, animated: true)
    }
    
    @objc func backButtonTapped() {
        // 返回上一页
        navigationController?.popViewController(animated: true)
    }
}
```

### 导航相关属性和方法

```swift
// 导航控制器
var navigationController: UINavigationController? { get }

// 是否隐藏底部栏
var hidesBottomBarWhenPushed: Bool { get set }

// 扩展边缘
var edgesForExtendedLayout: UIRectEdge { get set }

// 是否扩展到不透明栏下方
var extendedLayoutIncludesOpaqueBars: Bool { get set }

// 自动调整滚动视图内边距
var automaticallyAdjustsScrollViewInsets: Bool { get set }
```

## 模态展示

### 展示模态视图控制器

```swift
class PresentingViewController: UIViewController {
    
    func presentModalViewController() {
        let modalVC = ModalViewController()
        
        // 设置展示样式
        modalVC.modalPresentationStyle = .pageSheet
        modalVC.modalTransitionStyle = .coverVertical
        
        // 展示
        present(modalVC, animated: true) {
            print("模态视图已展示")
        }
    }
    
    // 也可以使用更详细的方法
    func presentWithCustomTransition() {
        let modalVC = ModalViewController()
        
        modalVC.modalPresentationStyle = .custom
        modalVC.transitioningDelegate = self
        
        present(modalVC, animated: true, completion: nil)
    }
}

// 关闭模态视图
class ModalViewController: UIViewController {
    
    @IBAction func dismissButtonTapped(_ sender: UIButton) {
        dismiss(animated: true) {
            print("模态视图已关闭")
        }
    }
    
    // 或者通过展示者关闭
    func dismissFromPresenting() {
        presentingViewController?.dismiss(animated: true, completion: nil)
    }
}
```

### 模态展示样式

```swift
// 展示样式
enum UIModalPresentationStyle {
    case fullScreen        // 全屏
    case pageSheet        // 页面表单（iOS 13+默认）
    case formSheet        // 表单
    case currentContext   // 当前上下文
    case custom           // 自定义
    case overFullScreen   // 覆盖全屏
    case overCurrentContext // 覆盖当前上下文
    case popover          // 弹出框（iPad）
    case blurOverFullScreen // 模糊背景全屏
}

// 转场动画样式
enum UIModalTransitionStyle {
    case coverVertical    // 垂直覆盖（默认）
    case flipHorizontal   // 水平翻转
    case crossDissolve    // 交叉溶解
    case partialCurl      // 部分卷曲
}
```

## 状态栏管理

```swift
class MyViewController: UIViewController {
    
    // 状态栏样式
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent  // 或 .default, .darkContent
    }
    
    // 是否隐藏状态栏
    override var prefersStatusBarHidden: Bool {
        return false
    }
    
    // 状态栏更新动画
    override var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
        return .fade  // 或 .slide, .none
    }
    
    // 更新状态栏外观
    func updateStatusBar() {
        setNeedsStatusBarAppearanceUpdate()
    }
}
```

## 自动旋转

```swift
class MyViewController: UIViewController {
    
    // 支持的界面方向
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return .portrait  // 只支持竖屏
        // return .landscape  // 只支持横屏
        // return .all        // 支持所有方向
        // return [.portrait, .landscapeLeft]  // 支持多个方向
    }
    
    // 是否应该自动旋转
    override var shouldAutorotate: Bool {
        return true
    }
    
    // 首选的界面方向
    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation {
        return .portrait
    }
    
    // 旋转开始前调用
    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)
        
        coordinator.animate(alongsideTransition: { context in
            // 在旋转动画期间执行的代码
            self.updateLayoutForSize(size)
        }) { context in
            // 旋转动画完成后执行的代码
            print("旋转完成")
        }
    }
    
    private func updateLayoutForSize(_ size: CGSize) {
        // 根据新尺寸更新布局
    }
}
```

## 键盘管理

```swift
class KeyboardViewController: UIViewController {
    
    @IBOutlet weak var textField: UITextField!
    @IBOutlet weak var bottomConstraint: NSLayoutConstraint!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 注册键盘通知
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
        
        // 设置点击手势隐藏键盘
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tapGesture)
    }
    
    @objc func keyboardWillShow(notification: NSNotification) {
        guard let keyboardSize = (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue,
              let animationDuration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double else {
            return
        }
        
        bottomConstraint.constant = keyboardSize.height
        
        UIView.animate(withDuration: animationDuration) {
            self.view.layoutIfNeeded()
        }
    }
    
    @objc func keyboardWillHide(notification: NSNotification) {
        guard let animationDuration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double else {
            return
        }
        
        bottomConstraint.constant = 0
        
        UIView.animate(withDuration: animationDuration) {
            self.view.layoutIfNeeded()
        }
    }
    
    @objc func dismissKeyboard() {
        view.endEditing(true)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
```

## 内存管理

### 内存警告处理

```swift
class MyViewController: UIViewController {
    
    // 收到内存警告时调用
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        
        // 清理不必要的资源
        // 释放缓存
        // 移除不在屏幕上显示的视图
        
        print("收到内存警告，开始清理资源")
    }
}
```

### 资源清理

```swift
class ResourceViewController: UIViewController {
    
    var timer: Timer?
    var observation: NSKeyValueObservation?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 创建定时器
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            // 定时器任务
        }
        
        // 创建观察者
        observation = observe(\.view.frame) { object, change in
            // 观察回调
        }
    }
    
    deinit {
        // 清理定时器
        timer?.invalidate()
        timer = nil
        
        // 清理观察者
        observation?.invalidate()
        observation = nil
        
        // 移除通知观察者
        NotificationCenter.default.removeObserver(self)
        
        print("资源已清理")
    }
}
```

## 最佳实践

### 1. 生命周期方法使用指南

```swift
class BestPracticeViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // ✅ 适合在这里做的事：
        // - 创建和配置 UI 元素
        // - 设置一次性的观察者
        // - 初始化数据源
        
        setupUI()
        setupObservers()
        setupInitialData()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // ✅ 适合在这里做的事：
        // - 刷新数据
        // - 更新 UI 状态
        // - 注册临时通知
        
        refreshData()
        updateUIState()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // ✅ 适合在这里做的事：
        // - 开始动画
        // - 开始定时器
        // - 开始位置服务
        
        startAnimations()
        startLocationServices()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        // ✅ 适合在这里做的事：
        // - 保存用户数据
        // - 验证输入
        // - 暂停任务
        
        saveUserInput()
        validateInput()
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        // ✅ 适合在这里做的事：
        // - 停止定时器
        // - 停止网络请求
        // - 清理临时资源
        
        stopTimers()
        cancelNetworkRequests()
    }
}
```

### 2. 避免常见错误

```swift
class CommonMistakesViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // ❌ 错误：在 viewDidLoad 中进行网络请求
        // fetchDataFromServer()  // 不要这样做
        
        // ❌ 错误：在 viewDidLoad 中更新依赖视图尺寸的布局
        // updateFrameBasedLayout()  // 不要这样做
        
        // ✅ 正确：设置基础配置
        setupBasicConfiguration()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // ✅ 正确：在这里进行数据刷新
        fetchDataFromServer()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        // ✅ 正确：在这里进行基于frame的布局更新
        updateFrameBasedLayout()
    }
    
    // ❌ 错误：忘记调用 super
    override func viewWillAppear(_ animated: Bool) {
        // super.viewWillAppear(animated)  // 必须调用！
        
        // 自己的代码...
    }
}
```

### 3. 性能优化技巧

```swift
class PerformanceViewController: UIViewController {
    
    // 使用懒加载
    lazy var expensiveView: UIView = {
        let view = UIView()
        // 复杂的初始化逻辑
        return view
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // ✅ 延迟创建昂贵的 UI 元素
        // 只在需要时才创建
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // ✅ 使用异步加载避免阻塞主线程
        DispatchQueue.main.async {
            self.loadDataAsynchronously()
        }
    }
    
    private func loadDataAsynchronously() {
        // 异步数据加载
    }
    
    // ✅ 合理使用缓存
    private var dataCache: [String: Any] = [:]
    
    private func loadData(for key: String) -> Any? {
        if let cachedData = dataCache[key] {
            return cachedData
        }
        
        let data = expensiveDataOperation(for: key)
        dataCache[key] = data
        return data
    }
    
    private func expensiveDataOperation(for key: String) -> Any {
        // 昂贵的数据操作
        return "data"
    }
}
```

### 4. 内存安全

```swift
class MemorySafeViewController: UIViewController {
    
    var networkTask: URLSessionDataTask?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // ✅ 使用弱引用避免循环引用
        networkTask = URLSession.shared.dataTask(with: URL(string: "https://api.example.com")!) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.handleNetworkResponse(data: data, response: response, error: error)
            }
        }
    }
    
    private func handleNetworkResponse(data: Data?, response: URLResponse?, error: Error?) {
        // 处理网络响应
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        // ✅ 取消未完成的任务
        networkTask?.cancel()
    }
    
    deinit {
        // ✅ 确保清理所有资源
        networkTask?.cancel()
        networkTask = nil
    }
}
```

## 总结

UIViewController 是 iOS 开发的核心类，掌握其生命周期、属性和方法对于开发高质量的 iOS 应用至关重要。关键要点包括：

1. **生命周期管理**：合理利用各个生命周期方法
2. **内存管理**：避免循环引用，及时清理资源
3. **性能优化**：懒加载、异步处理、缓存策略
4. **用户体验**：流畅的转场动画、合理的界面布局
5. **代码质量**：遵循最佳实践，避免常见错误

通过深入理解和正确使用 UIViewController，可以构建出稳定、高效、用户体验良好的 iOS 应用。
