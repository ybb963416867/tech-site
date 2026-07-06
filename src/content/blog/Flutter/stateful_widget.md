---
title: "stateful_widget"
description: "适用版本：Flutter 3.x+ 更新时间：2024"
pubDate: 2026-06-28
category: "Flutter"
tags: [API, SEO]
draft: false
---
# Flutter StatelessWidget vs StatefulWidget 完整指南

> 适用版本：Flutter 3.x+  
> 更新时间：2024

---

## 目录

1. [核心区别对比](#1-核心区别对比)
2. [StatelessWidget 详解](#2-statelesswidget-详解)
3. [StatefulWidget 详解](#3-statefulwidget-详解)
4. [State 生命周期完整解析](#4-state-生命周期完整解析)
5. [State 类所有 API](#5-state-类所有-api)
6. [setState 深度解析](#6-setstate-深度解析)
7. [常见状态管理模式](#7-常见状态管理模式)
8. [性能优化技巧](#8-性能优化技巧)
9. [完整实战示例](#9-完整实战示例)
10. [常见错误与解决方案](#10-常见错误与解决方案)

---

## 1. 核心区别对比

### 一句话总结

| | StatelessWidget | StatefulWidget |
|--|--|--|
| 定义 | 无状态组件，UI 完全由外部传入的参数决定 | 有状态组件，拥有可变的内部状态，状态改变时可重建 UI |
| 状态 | 无内部可变状态 | 拥有 `State` 对象，持有可变状态 |
| 重建触发 | 仅父组件重建或参数变化时重建 | 调用 `setState()` 时主动触发重建 |
| 对象数量 | 1个对象（Widget 本身） | 2个对象（Widget + State） |
| 生命周期 | 仅 `build()` | 完整生命周期（见第4章） |
| 适用场景 | 纯展示、配置型组件 | 交互、动画、异步加载等有状态场景 |

### 架构差异图

```
StatelessWidget                StatefulWidget
───────────────                ──────────────────────────────
┌─────────────┐                ┌─────────────┐   创建   ┌───────────┐
│   Widget    │                │   Widget    │ ───────► │   State   │
│  (不可变)   │                │  (不可变)   │          │  (可变)   │
│             │                │             │ ◄─────── │           │
│  build()    │                │createState()│  widget  │ build()   │
└─────────────┘                └─────────────┘  引用    └───────────┘
      │                                                       │
      ▼                                                       ▼
  Element Tree                                           Element Tree
  (Framework管理)                                        (Framework管理)
```

### Widget、Element、RenderObject 三棵树关系

```
Widget Tree（轻量描述，可频繁重建）
    │ 对应
    ▼
Element Tree（持久化，持有 State 对象）
    │ 对应
    ▼
RenderObject Tree（负责布局与绘制）

关键：StatefulWidget 的 State 存在于 Element 中，
      Widget 重建时 Element 复用，State 不丢失。
```

---

## 2. StatelessWidget 详解

### 2.1 定义与结构

```dart
abstract class StatelessWidget extends Widget {
  const StatelessWidget({super.key});

  // 唯一需要实现的方法
  Widget build(BuildContext context);
}
```

### 2.2 完整示例

```dart
class UserCard extends StatelessWidget {
  // 所有字段必须是 final（不可变）
  final String name;
  final String avatarUrl;
  final VoidCallback onTap;

  const UserCard({
    super.key,
    required this.name,
    required this.avatarUrl,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // build 可能被多次调用，不应有副作用
    return GestureDetector(
      onTap: onTap,
      child: Card(
        child: ListTile(
          leading: CircleAvatar(backgroundImage: NetworkImage(avatarUrl)),
          title: Text(name),
        ),
      ),
    );
  }
}
```

### 2.3 何时选择 StatelessWidget

- UI 完全由传入参数决定（纯函数式）
- 不需要响应用户交互改变自身外观
- 配置类组件（主题、布局、图标等）
- 子组件的回调已由父组件处理

---

## 3. StatefulWidget 详解

### 3.1 类结构

StatefulWidget 由两个类共同构成：

```dart
// ① Widget 类（不可变，仅负责描述和创建 State）
class CounterWidget extends StatefulWidget {
  final String title;          // Widget 自身的参数（不可变）

  const CounterWidget({
    super.key,
    required this.title,
  });

  // 唯一必须实现的方法：创建对应的 State 对象
  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

// ② State 类（可变，持有状态，负责 build）
class _CounterWidgetState extends State<CounterWidget> {
  // 可变状态
  int _count = 0;
  bool _isLoading = false;

  // 通过 widget 属性访问 Widget 的参数
  String get title => widget.title;

  // 重建 UI
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: _isLoading
            ? CircularProgressIndicator()
            : Text('Count: $_count', style: TextStyle(fontSize: 32)),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: Icon(Icons.add),
      ),
    );
  }

  void _increment() {
    setState(() {
      _count++;
    });
  }
}
```

### 3.2 StatefulWidget 源码定义

```dart
abstract class StatefulWidget extends Widget {
  const StatefulWidget({super.key});

  // 框架调用此方法创建 State（仅调用一次）
  @factory
  State createState();
}
```

### 3.3 State 类源码定义

```dart
abstract class State<T extends StatefulWidget> with Diagnosticable {
  // 访问关联的 Widget 实例（Widget 重建时会更新此引用）
  T get widget => _widget!;
  T? _widget;

  // 当前 State 所在的 BuildContext（即对应的 Element）
  BuildContext get context => _element!;
  StatefulElement? _element;

  // 是否已挂载到 Widget 树
  bool get mounted => _element != null;

  // 核心方法：构建 UI
  Widget build(BuildContext context);

  // 触发 UI 重建
  void setState(VoidCallback fn);

  // 生命周期方法（见第4章）
  void initState() {}
  void didUpdateWidget(covariant T oldWidget) {}
  void didChangeDependencies() {}
  void deactivate() {}
  void activate() {}
  void dispose() {}

  // 调试相关
  void reassemble() {}
}
```

---

## 4. State 生命周期完整解析

### 4.1 生命周期流程图

```
                    Widget 插入树
                         │
                         ▼
               ┌─────────────────┐
               │  createState()  │  Widget 类的方法，创建 State 实例
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │   initState()   │  State 初始化，只调用一次
               └────────┬────────┘
                        │
                        ▼
               ┌──────────────────────┐
               │ didChangeDependencies│  依赖的 InheritedWidget 变化时调用
               └────────┬─────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │    build()      │  ◄──────────────────┐
               └────────┬────────┘                     │
                        │                              │
              ┌─────────┴──────────┐                  │
              │                    │                  │
              ▼                    ▼                  │
    ┌──────────────────┐  ┌──────────────────┐       │
    │  setState() 调用  │  │ 父 Widget 重建   │       │
    └────────┬─────────┘  │didUpdateWidget() │       │
             │             └────────┬─────────┘       │
             │                      │                 │
             └──────────────────────┘                 │
                        │                             │
                        └─────────────────────────────┘
                        
                        │ Widget 从树中移除
                        ▼
               ┌─────────────────┐
               │  deactivate()   │  从树中临时移除（可能恢复）
               └────────┬────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
              ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   dispose()      │  │   activate()     │  GlobalKey 移动时恢复
    │  (永久销毁)       │  │  (重新插入树)    │
    └──────────────────┘  └──────────────────┘
```

### 4.2 各生命周期方法详解

#### `createState()`

```dart
// 属于 StatefulWidget 类的方法，不是 State 的方法
@override
State<MyWidget> createState() => _MyWidgetState();

// 调用时机：Widget 第一次插入 Widget 树时
// 调用次数：整个生命周期内只调用一次
// 注意：不要在这里做任何初始化，那是 initState() 的职责
```

#### `initState()`

```dart
@override
void initState() {
  super.initState();  // 必须首先调用

  // ✅ 适合做的事：
  // 1. 初始化变量
  _controller = AnimationController(vsync: this, duration: Duration(seconds: 1));
  _scrollController = ScrollController();
  _textController = TextEditingController(text: widget.initialText);

  // 2. 订阅 Stream / Listenable
  _subscription = widget.stream.listen(_onData);
  widget.model.addListener(_onModelChanged);

  // 3. 发起一次性网络请求
  _fetchData();

  // 4. 添加 PostFrameCallback（首帧渲染后执行）
  WidgetsBinding.instance.addPostFrameCallback((_) {
    // 此时 context 已可安全使用，可获取 RenderBox 等
    final box = context.findRenderObject() as RenderBox?;
    print('Widget 尺寸: ${box?.size}');
  });

  // ❌ 不适合做的事：
  // - 调用 setState()（此时尚未 build）
  // - 通过 context 访问 InheritedWidget（推荐在 didChangeDependencies 中做）
  //   ⚠️ 技术上可以访问，但如果依赖会在后续变化，需要在 didChangeDependencies 更新
}
```

#### `didChangeDependencies()`

```dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();

  // 调用时机：
  // 1. initState() 之后立即调用（首次）
  // 2. 当 State 依赖的 InheritedWidget 发生变化时调用
  //    例如：Theme、MediaQuery、Localizations 等变化时

  // ✅ 适合做的事：
  // 访问依赖 InheritedWidget 的数据
  final theme = Theme.of(context);
  final mediaQuery = MediaQuery.of(context);
  final locale = Localizations.localeOf(context);

  // 重新加载与主题/语言相关的资源
  _localizedStrings = AppLocalizations.of(context);

  // 可以调用 setState（但通常不必要，因为 build 会紧接着调用）
}
```

#### `build()`

```dart
@override
Widget build(BuildContext context) {
  // 调用时机：
  // 1. initState() 后
  // 2. didUpdateWidget() 后
  // 3. setState() 后
  // 4. didChangeDependencies() 后
  // 5. 父 Widget 重建时（即使参数未变）

  // ✅ 必须遵守的规则：
  // - 必须是纯函数（相同输入产生相同输出）
  // - 不能有副作用（不能调用 setState、不能启动网络请求等）
  // - 必须返回 Widget（不能返回 null）

  return Container(
    color: Theme.of(context).primaryColor, // 使用 context 访问 InheritedWidget
    child: Text('$_count'),
  );
}
```

#### `didUpdateWidget()`

```dart
@override
void didUpdateWidget(covariant CounterWidget oldWidget) {
  super.didUpdateWidget(oldWidget);

  // 调用时机：父 Widget 重建导致当前 Widget 的参数发生变化时
  // 此时 widget 属性已更新为新的 Widget 实例
  // oldWidget 是旧的 Widget 实例

  // ✅ 典型用法：响应外部参数变化，更新内部状态或资源

  // 示例1：参数变化时重新请求数据
  if (widget.userId != oldWidget.userId) {
    _fetchUserData(widget.userId);
  }

  // 示例2：参数变化时更新控制器
  if (widget.initialText != oldWidget.initialText) {
    _textController.text = widget.initialText;
  }

  // 示例3：Stream 变化时重新订阅
  if (widget.stream != oldWidget.stream) {
    _subscription?.cancel();
    _subscription = widget.stream.listen(_onData);
  }

  // 示例4：AnimationController duration 变化
  if (widget.duration != oldWidget.duration) {
    _controller.duration = widget.duration;
  }
}
```

#### `deactivate()`

```dart
@override
void deactivate() {
  // 调用时机：State 从 Widget 树中临时移除时
  // 例如：使用 GlobalKey 将 Widget 移动到树的另一个位置
  // 或进入后台（在某些情况下）

  // 注意：deactivate 之后可能调用 activate()（恢复）
  //      也可能调用 dispose()（永久销毁）

  // 通常很少需要重写此方法
  super.deactivate();
}
```

#### `activate()`

```dart
@override
void activate() {
  // 调用时机：State 在 deactivate() 后重新插入树时（使用 GlobalKey 移动场景）
  // 此方法调用后会紧接调用 build()

  super.activate();
  // 可以在这里恢复 deactivate 中暂停的资源
}
```

#### `dispose()`

```dart
@override
void dispose() {
  // 调用时机：State 永久从树中移除，即将销毁时
  // 调用次数：只调用一次

  // ✅ 必须做的事：释放所有资源，防止内存泄漏

  // 1. 取消 Stream 订阅
  _subscription?.cancel();

  // 2. 释放 Controller
  _animationController.dispose();
  _scrollController.dispose();
  _textController.dispose();
  _pageController.dispose();
  _tabController.dispose();
  _focusNode.dispose();
  _videoController.dispose();

  // 3. 移除 Listener
  widget.model.removeListener(_onModelChanged);
  WidgetsBinding.instance.removeObserver(_observer);

  // 4. 取消 Timer
  _timer?.cancel();

  // 5. 取消网络请求（如使用 CancelToken）
  _cancelToken?.cancel();

  // ❌ 不能做的事：
  // - 调用 setState()（会抛出异常）
  // - 访问 widget 属性（已解除绑定，不稳定）

  super.dispose(); // 最后调用
}
```

#### `reassemble()`（热重载专用）

```dart
@override
void reassemble() {
  super.reassemble();
  // 仅在开发阶段热重载（Hot Reload）时调用
  // 生产环境不会调用
  // 用于在热重载后重置某些状态（如重新加载图片缓存）
}
```

### 4.3 生命周期与帧调度的关系

```dart
@override
void initState() {
  super.initState();

  // 当前帧：initState → didChangeDependencies → build → layout → paint

  // 首帧完成后执行（安全访问 RenderObject）
  WidgetsBinding.instance.addPostFrameCallback((_) {
    print('首帧已渲染完成');
  });

  // 下一帧前执行
  SchedulerBinding.instance.scheduleFrameCallback((_) {
    print('下一帧即将开始');
  });
}
```

---

## 5. State 类所有 API

### 5.1 属性

```dart
// 关联的 Widget 实例（父重建时自动更新）
T get widget;

// 当前的 BuildContext（对应 Element，生命周期内不变）
BuildContext get context;

// 是否已挂载到树（dispose 后为 false）
// 在异步回调中调用 setState 前应先检查 mounted
bool get mounted;
```

### 5.2 核心方法

```dart
// 标记需要重建，fn 中同步更新状态变量
void setState(VoidCallback fn);

// 构建 UI（必须实现）
Widget build(BuildContext context);
```

### 5.3 生命周期方法汇总

```dart
// 初始化（一次）
void initState();

// 依赖变化（InheritedWidget 更新时）
void didChangeDependencies();

// 父 Widget 参数变化时
void didUpdateWidget(covariant T oldWidget);

// 从树临时移除
void deactivate();

// 重新插入树（GlobalKey 移动）
void activate();

// 永久销毁
void dispose();

// 热重载（仅开发）
void reassemble();
```

### 5.4 BuildContext 常用方法

```dart
// 在 State.build() 或其他有 context 的地方使用

// 查找 InheritedWidget
final theme = Theme.of(context);
final media = MediaQuery.of(context);
final nav = Navigator.of(context);
final scaffold = ScaffoldMessenger.of(context);

// 查找父 Widget
context.findAncestorWidgetOfExactType<MaterialApp>();
context.findAncestorStateOfType<ScaffoldState>();
context.findRootAncestorStateOfType<NavigatorState>();

// 获取 RenderObject（需在 build 后调用，如 PostFrameCallback）
final box = context.findRenderObject() as RenderBox?;
final size = box?.size;
final position = box?.localToGlobal(Offset.zero);

// 大小与约束
context.size;
```

---

## 6. setState 深度解析

### 6.1 工作原理

```dart
// Flutter 源码简化版
void setState(VoidCallback fn) {
  assert(mounted, 'setState called after dispose');
  fn();                          // 1. 同步执行回调，更新状态变量
  _element!.markNeedsBuild();    // 2. 标记 Element 需要重建
  // 3. 在下一帧，Framework 调用 build()
}
```

### 6.2 正确用法

```dart
// ✅ 在 setState 内同步修改状态
void _onButtonTap() {
  setState(() {
    _count++;
    _isVisible = !_isVisible;
    _items.add(Item(id: _count));
  });
}

// ✅ 异步操作后调用 setState（需检查 mounted）
Future<void> _fetchData() async {
  final data = await ApiService.fetchData();
  if (mounted) {  // 重要：异步完成后 Widget 可能已销毁
    setState(() {
      _data = data;
      _isLoading = false;
    });
  }
}

// ✅ setState 可以为空（强制重建，不推荐但合法）
setState(() {});
```

### 6.3 错误用法

```dart
// ❌ 在 build() 中调用 setState（无限循环）
@override
Widget build(BuildContext context) {
  setState(() { _count++; }); // 永远不要这样做
  return Text('$_count');
}

// ❌ dispose() 后调用 setState
@override
void dispose() {
  _timer = Timer.periodic(Duration(seconds: 1), (_) {
    setState(() { _tick++; }); // Widget 已销毁，抛出异常
  });
  super.dispose();
}

// ❌ 修改状态但不放在 setState 内（UI 不更新）
void _wrong() {
  _count++; // 状态变了，但 UI 不知道
}

// ✅ 正确做法
void _correct() {
  setState(() {
    _count++;
  });
}
```

### 6.4 setState 的性能影响

```dart
// setState 只重建当前 State 的 build() 子树
// 通过拆分子 Widget 可以缩小重建范围

// ❌ 大组件整体重建
class BigPage extends StatefulWidget { ... }
class _BigPageState extends State<BigPage> {
  int _counter = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpensiveWidget(),  // counter 变化时也会重建！
        Text('$_counter'),
        ElevatedButton(onPressed: () => setState(() => _counter++), child: Text('+')),
      ],
    );
  }
}

// ✅ 拆分为独立 StatefulWidget，缩小重建范围
class CounterSection extends StatefulWidget { ... }
class _CounterSectionState extends State<CounterSection> {
  int _counter = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$_counter'),
        ElevatedButton(onPressed: () => setState(() => _counter++), child: Text('+')),
      ],
    );
  }
}

// ExpensiveWidget 独立，不受 counter 变化影响
```

---

## 7. 常见状态管理模式

### 7.1 本地状态（Local State）

适用于单个 Widget 内部的 UI 状态（展开/收起、当前 Tab 等）。

```dart
class ExpandableCard extends StatefulWidget {
  final String title;
  final String content;
  const ExpandableCard({super.key, required this.title, required this.content});

  @override
  State<ExpandableCard> createState() => _ExpandableCardState();
}

class _ExpandableCardState extends State<ExpandableCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          ListTile(
            title: Text(widget.title),
            trailing: Icon(_expanded ? Icons.expand_less : Icons.expand_more),
            onTap: () => setState(() => _expanded = !_expanded),
          ),
          if (_expanded)
            Padding(
              padding: EdgeInsets.all(16),
              child: Text(widget.content),
            ),
        ],
      ),
    );
  }
}
```

### 7.2 状态提升（Lifting State Up）

当多个子 Widget 共享状态时，将状态提升到最近的公共父 Widget。

```dart
// 父组件持有共享状态
class ShoppingCart extends StatefulWidget {
  @override
  State<ShoppingCart> createState() => _ShoppingCartState();
}

class _ShoppingCartState extends State<ShoppingCart> {
  final List<Item> _items = [];

  void _addItem(Item item) {
    setState(() => _items.add(item));
  }

  void _removeItem(Item item) {
    setState(() => _items.remove(item));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ProductList(onAddItem: _addItem),          // 子组件通过回调修改状态
        CartSummary(items: _items, onRemove: _removeItem), // 子组件接收状态
      ],
    );
  }
}
```

### 7.3 InheritedWidget（跨层级传递状态）

```dart
// 定义 InheritedWidget
class AppTheme extends InheritedWidget {
  final ThemeData theme;
  final VoidCallback toggleTheme;

  const AppTheme({
    super.key,
    required this.theme,
    required this.toggleTheme,
    required super.child,
  });

  // 子 Widget 通过此方法获取实例
  static AppTheme of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppTheme>()!;
  }

  // 返回 true 时通知依赖的子组件重建
  @override
  bool updateShouldNotify(AppTheme oldWidget) {
    return theme != oldWidget.theme;
  }
}

// 在 StatefulWidget 中提供状态
class AppThemeProvider extends StatefulWidget {
  final Widget child;
  const AppThemeProvider({super.key, required this.child});

  @override
  State<AppThemeProvider> createState() => _AppThemeProviderState();
}

class _AppThemeProviderState extends State<AppThemeProvider> {
  bool _isDark = false;

  @override
  Widget build(BuildContext context) {
    return AppTheme(
      theme: _isDark ? ThemeData.dark() : ThemeData.light(),
      toggleTheme: () => setState(() => _isDark = !_isDark),
      child: widget.child,
    );
  }
}

// 子组件消费
class ThemeToggleButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.of(context); // 自动订阅变化
    return Switch(
      value: appTheme.theme.brightness == Brightness.dark,
      onChanged: (_) => appTheme.toggleTheme(),
    );
  }
}
```

### 7.4 与 AnimationController 结合（SingleTickerProviderStateMixin）

```dart
class AnimatedBox extends StatefulWidget {
  @override
  State<AnimatedBox> createState() => _AnimatedBoxState();
}

// 单个 AnimationController 用 SingleTickerProviderStateMixin
// 多个 AnimationController 用 TickerProviderStateMixin
class _AnimatedBoxState extends State<AnimatedBox>
    with SingleTickerProviderStateMixin {

  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<Color?> _colorAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,  // this 即 TickerProvider
      duration: Duration(milliseconds: 600),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.5).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    _colorAnimation = ColorTween(
      begin: Colors.blue,
      end: Colors.red,
    ).animate(_controller);

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _controller.reverse();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose(); // 必须释放
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            width: 100,
            height: 100,
            color: _colorAnimation.value,
          ),
        );
      },
    );
  }
}
```

### 7.5 与 Stream 结合

```dart
class LiveDataWidget extends StatefulWidget {
  @override
  State<LiveDataWidget> createState() => _LiveDataWidgetState();
}

class _LiveDataWidgetState extends State<LiveDataWidget> {
  late final Stream<int> _dataStream;
  StreamSubscription<int>? _subscription;
  int _latestValue = 0;

  @override
  void initState() {
    super.initState();
    _dataStream = Stream.periodic(Duration(seconds: 1), (i) => i);
    _subscription = _dataStream.listen((value) {
      if (mounted) {
        setState(() => _latestValue = value);
      }
    });
  }

  @override
  void dispose() {
    _subscription?.cancel(); // 必须取消订阅
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 也可以直接用 StreamBuilder，避免手动管理订阅
    return Text('$_latestValue');
  }
}

// 推荐：使用 StreamBuilder 替代手动订阅
class StreamBuilderExample extends StatelessWidget {
  final Stream<int> stream;
  const StreamBuilderExample({super.key, required this.stream});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: stream,
      initialData: 0,
      builder: (context, snapshot) {
        if (snapshot.hasError) return Text('Error: ${snapshot.error}');
        if (!snapshot.hasData) return CircularProgressIndicator();
        return Text('${snapshot.data}');
      },
    );
  }
}
```

---

## 8. 性能优化技巧

### 8.1 const 构造函数（避免不必要重建）

```dart
// ✅ 使用 const 构造函数的 StatelessWidget 实例在重建时会被复用
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const HeaderWidget(),    // const：父重建时不重建
          const Divider(),         // const
          ContentWidget(data: _data), // 非 const：数据变化时重建
        ],
      ),
    );
  }
}
```

### 8.2 拆分 Widget 缩小重建范围

```dart
// ❌ 整个页面因小状态变化而重建
class PageBad extends StatefulWidget { ... }
class _PageBadState extends State<PageBad> {
  bool _showBanner = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (_showBanner) Banner(),  // 触发整个 Column 重建
        const HeavyListView(),      // 被迫重建，浪费性能
      ],
    );
  }
}

// ✅ 将状态下沉到最小范围
class BannerController extends StatefulWidget {
  @override
  State<BannerController> createState() => _BannerControllerState();
}
class _BannerControllerState extends State<BannerController> {
  bool _show = false;

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: Duration(milliseconds: 300),
      child: _show ? Banner() : SizedBox.shrink(),
    );
  }
}

// HeavyListView 独立，完全不受 banner 状态影响
```

### 8.3 使用 AutomaticKeepAliveClientMixin 保持子页面状态

```dart
class KeepAliveTab extends StatefulWidget {
  @override
  State<KeepAliveTab> createState() => _KeepAliveTabState();
}

class _KeepAliveTabState extends State<KeepAliveTab>
    with AutomaticKeepAliveClientMixin {

  // 返回 true = 离开 Tab 后保持状态，不销毁
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // 必须调用
    return MyTabContent();
  }
}
```

### 8.4 GlobalKey 跨位置保持 State

```dart
// GlobalKey 让 State 在 Widget 树中移动时不被销毁
final _formKey = GlobalKey<FormState>();
final _widgetKey = GlobalKey<_MyWidgetState>();

// 通过 GlobalKey 访问 State
_widgetKey.currentState?.someMethod();

// 验证表单
if (_formKey.currentState!.validate()) {
  _formKey.currentState!.save();
}
```

---

## 9. 完整实战示例

### 9.1 表单页面（含验证、加载、异步提交）

```dart
class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();

  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // 1. 清除旧错误
    setState(() => _errorMessage = null);

    // 2. 验证表单
    if (!_formKey.currentState!.validate()) return;

    // 3. 显示加载
    setState(() => _isLoading = true);

    try {
      await AuthService.register(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('注册')),
      body: Form(
        key: _formKey,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // 错误提示
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  color: Colors.red.shade50,
                  child: Text(_errorMessage!, style: TextStyle(color: Colors.red)),
                ),

              // 邮箱
              TextFormField(
                controller: _emailController,
                focusNode: _emailFocus,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: '邮箱'),
                validator: (value) {
                  if (value == null || value.isEmpty) return '请输入邮箱';
                  if (!value.contains('@')) return '请输入有效邮箱';
                  return null;
                },
                onFieldSubmitted: (_) =>
                    FocusScope.of(context).requestFocus(_passwordFocus),
              ),

              const SizedBox(height: 16),

              // 密码
              TextFormField(
                controller: _passwordController,
                focusNode: _passwordFocus,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: '密码',
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword
                        ? Icons.visibility_off
                        : Icons.visibility),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.length < 6) return '密码至少6位';
                  return null;
                },
              ),

              const SizedBox(height: 32),

              // 提交按钮
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('注册'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 9.2 带动画的计数器（AnimationController + setState）

```dart
class AnimatedCounter extends StatefulWidget {
  final int target;
  const AnimatedCounter({super.key, required this.target});

  @override
  State<AnimatedCounter> createState() => _AnimatedCounterState();
}

class _AnimatedCounterState extends State<AnimatedCounter>
    with SingleTickerProviderStateMixin {

  late AnimationController _controller;
  late Animation<int> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _setupAnimation(0, widget.target);
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedCounter oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.target != widget.target) {
      _setupAnimation(_animation.value, widget.target);
      _controller.forward(from: 0);
    }
  }

  void _setupAnimation(int from, int to) {
    _animation = IntTween(begin: from, end: to).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, _) {
        return Text(
          '${_animation.value}',
          style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
        );
      },
    );
  }
}
```

---

## 10. 常见错误与解决方案

### 错误1：`setState() called after dispose()`

```dart
// ❌ 错误
Future<void> _load() async {
  final data = await api.fetch();
  setState(() => _data = data); // Widget 可能已销毁
}

// ✅ 正确
Future<void> _load() async {
  final data = await api.fetch();
  if (mounted) setState(() => _data = data);
}
```

### 错误2：在 `initState` 中使用 `context` 访问 InheritedWidget

```dart
// ❌ 可能导致后续 InheritedWidget 变化时不更新
@override
void initState() {
  super.initState();
  final theme = Theme.of(context); // 不推荐
}

// ✅ 在 didChangeDependencies 中访问
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  final theme = Theme.of(context); // 正确：变化时会重新调用
}
```

### 错误3：忘记在 `dispose` 中释放资源

```dart
// ❌ 内存泄漏
class _MyState extends State<MyWidget> {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: Duration(seconds: 1));
  }

  // 忘记 dispose！
}

// ✅ 正确
@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

### 错误4：`build()` 中创建对象（性能问题）

```dart
// ❌ 每次 build 都创建新对象
@override
Widget build(BuildContext context) {
  final controller = TextEditingController(); // 每次重建都创建新实例！
  return TextField(controller: controller);
}

// ✅ 在 initState 中创建，dispose 中释放
class _MyState extends State<MyWidget> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(controller: _controller);
  }
}
```

### 错误5：混淆 `StatelessWidget` 和 `StatefulWidget` 的选择

```dart
// ❌ 不必要的 StatefulWidget（无状态也用 Stateful）
class SimpleLabel extends StatefulWidget {
  final String text;
  const SimpleLabel({super.key, required this.text});

  @override
  State<SimpleLabel> createState() => _SimpleLabelState();
}
class _SimpleLabelState extends State<SimpleLabel> {
  @override
  Widget build(BuildContext context) => Text(widget.text);
}

// ✅ 无状态用 StatelessWidget，更高效
class SimpleLabel extends StatelessWidget {
  final String text;
  const SimpleLabel({super.key, required this.text});

  @override
  Widget build(BuildContext context) => Text(text);
}
```

---

## 参考资料

- [Flutter 官方文档 - 有状态和无状态 Widget](https://docs.flutter.dev/ui/interactivity)
- [Flutter Widget 生命周期](https://api.flutter.dev/flutter/widgets/State-class.html)
- [Inside Flutter - Flutter 架构原理](https://docs.flutter.dev/resources/inside-flutter)
- [Flutter 性能最佳实践](https://docs.flutter.dev/perf/best-practices)
