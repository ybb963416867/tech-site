---
title: "Flutter动画详解"
description: ""
pubDate: 2026-07-06
category: "Flutter"
tags: [iOS, API, SEO]
draft: false
---
# Flutter 动画系统详解

## 目录
1. [动画基础概念](#一动画基础概念)
2. [隐式动画（Implicit Animations）](#二隐式动画implicit-animations)
3. [显式动画（Explicit Animations）](#三显式动画explicit-animations)
4. [Tween 与 Curve 详解](#四tween-与-curve-详解)
5. [Hero 动画](#五hero-动画)
6. [交错动画（Staggered Animation）](#六交错动画staggered-animation)
7. [物理仿真动画](#七物理仿真动画)
8. [自定义动画（CustomPainter）](#八自定义动画custompainter)
9. [页面转场动画](#九页面转场动画)
10. [AnimatedSwitcher 与 AnimatedList](#十animatedswitcher-与-animatedlist)
11. [第三方动画库](#十一第三方动画库)
12. [性能优化与最佳实践](#十二性能优化与最佳实践)
13. [常见问题排查](#十三常见问题排查)

---

## 一、动画基础概念

### 1.1 动画的本质

Flutter 动画的本质是：**在一段时间内，按照某种曲线规律，不断改变一个数值，并用这个数值去驱动 UI 重建**。

核心角色分工：

| 角色 | 作用 |
|---|---|
| `Ticker` | 每一帧（约16.67ms）触发一次回调，是动画的"心跳" |
| `AnimationController` | 管理动画的播放、暂停、反向、循环，本身是一个 `Animation<double>`，默认输出 0.0~1.0 |
| `Tween` | 把 0.0~1.0 的线性值映射为业务所需的值（颜色、位置、大小等） |
| `Curve` | 定义时间与进度之间的非线性关系（如先快后慢） |
| `Animation<T>` | 动画值的抽象，可以被监听（`addListener`），也可以监听状态变化（`addStatusListener`） |
| `AnimatedWidget` / `AnimatedBuilder` | 把 `Animation` 的变化绑定到 Widget 重建 |

### 1.2 动画分类

```
Flutter 动画
├── 隐式动画（Implicit）：只需声明目标值，Flutter 自动补间
│   └── AnimatedContainer / AnimatedOpacity / TweenAnimationBuilder ...
├── 显式动画（Explicit）：手动控制 AnimationController
│   └── AnimationController + Tween + AnimatedBuilder
├── 物理动画：基于物理模拟（弹簧、摩擦力）
│   └── SpringSimulation / friction
└── 转场动画：路由切换、Hero 共享元素
    └── PageRouteBuilder / Hero
```

### 1.3 最小可运行示例（显式动画骨架）

```dart
class MyAnimatedWidget extends StatefulWidget {
  const MyAnimatedWidget({super.key});
  @override
  State<MyAnimatedWidget> createState() => _MyAnimatedWidgetState();
}

class _MyAnimatedWidgetState extends State<MyAnimatedWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this, // TickerProvider，通常是 State 自身
      duration: const Duration(milliseconds: 800),
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
    _controller.forward(); // 启动动画
  }

  @override
  void dispose() {
    _controller.dispose(); // 必须释放，否则内存泄漏
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(opacity: _animation.value, child: child);
      },
      child: const FlutterLogo(size: 100), // child 不会随动画重建，性能优化关键点
    );
  }
}
```

> **关键点**：`vsync: this` 需要 `State` 混入 `SingleTickerProviderStateMixin`（单个 Controller）或 `TickerProviderStateMixin`（多个 Controller）。vsync 的作用是让动画与屏幕刷新信号同步，避免离屏时继续消耗资源。

---

## 二、隐式动画（Implicit Animations）

隐式动画是"声明式"的：你只需要改变属性的目标值，Flutter 自动帮你在旧值和新值之间做补间过渡。**没有 AnimationController，代码量最少，适合简单场景。**

### 2.1 常用隐式动画 Widget 一览

| Widget | 用途 |
|---|---|
| `AnimatedContainer` | 尺寸、颜色、边距、圆角、变形等综合属性变化 |
| `AnimatedOpacity` | 透明度渐变 |
| `AnimatedAlign` | 对齐位置变化 |
| `AnimatedPadding` | 内边距变化 |
| `AnimatedPositioned` | Stack 内位置变化（需配合 Positioned） |
| `AnimatedDefaultTextStyle` | 文字样式（大小、颜色、字重）渐变 |
| `AnimatedPhysicalModel` | 阴影、圆角、颜色的物理材质动画 |
| `AnimatedCrossFade` | 两个 Widget 之间的交叉淡入淡出切换 |
| `AnimatedSize` | 子 Widget 尺寸变化时自动补间（常用于展开/收起） |
| `TweenAnimationBuilder` | 万能隐式动画构造器，可动画化任意可插值类型 |

### 2.2 AnimatedContainer 示例

```dart
class BoxDemo extends StatefulWidget {
  const BoxDemo({super.key});
  @override
  State<BoxDemo> createState() => _BoxDemoState();
}

class _BoxDemoState extends State<BoxDemo> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOutCubic,
        width: _expanded ? 200 : 100,
        height: _expanded ? 200 : 100,
        decoration: BoxDecoration(
          color: _expanded ? Colors.blue : Colors.red,
          borderRadius: BorderRadius.circular(_expanded ? 20 : 8),
        ),
      ),
    );
  }
}
```

**原理**：`AnimatedContainer` 内部维护了一个 `AnimatedWidgetBaseState`，它会在 `didUpdateWidget` 中检测到属性变化，自动创建 Tween 并驱动一个隐藏的 `AnimationController` 完成过渡。

### 2.3 TweenAnimationBuilder（万能隐式动画）

当内置的隐式动画组件无法满足需求时（比如自定义数值动画），`TweenAnimationBuilder` 是最灵活的选择：

```dart
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: _targetScore),
  duration: const Duration(seconds: 1),
  curve: Curves.easeOut,
  builder: (context, value, child) {
    return Text('${value.toInt()} 分', style: const TextStyle(fontSize: 32));
  },
)
```

- 每当 `end`（这里是 `_targetScore`）变化，Widget 会自动从上一次的值动画过渡到新值。
- 适合做数字滚动、进度条、自定义插值动画。

### 2.4 AnimatedSwitcher + AnimatedCrossFade（内容切换类）

```dart
AnimatedSwitcher(
  duration: const Duration(milliseconds: 400),
  transitionBuilder: (child, animation) {
    return FadeTransition(
      opacity: animation,
      child: ScaleTransition(scale: animation, child: child),
    );
  },
  child: Text(
    _loading ? '加载中...' : '加载完成',
    key: ValueKey(_loading), // key 必须变化，否则不会触发切换动画
  ),
)
```

> **易错点**：`AnimatedSwitcher` 依赖 `key` 判断新旧 Widget 是否为"同一个"，`key` 不变则不会触发动画。

### 2.5 隐式动画的优缺点

- ✅ 代码简单，声明式风格，State 管理负担小
- ✅ 自动处理中断（动画过程中改变目标值会从当前状态继续，不会跳变）
- ❌ 无法精细控制播放/暂停/反向/循环
- ❌ 无法做多个动画间的精确编排（交错动画）

---

## 三、显式动画（Explicit Animations）

当需要精确控制动画的播放状态（暂停、反向、循环、监听完成事件、多动画编排）时，使用显式动画。

### 3.1 核心 API：AnimationController

```dart
AnimationController(
  vsync: this,
  duration: const Duration(milliseconds: 500),   // 正向播放时长
  reverseDuration: const Duration(milliseconds: 300), // 反向播放时长（可选）
  lowerBound: 0.0,  // 默认 0.0
  upperBound: 1.0,  // 默认 1.0
  value: 0.0,       // 初始值
);
```

**控制方法：**

| 方法 | 说明 |
|---|---|
| `forward()` | 从当前值播放到 upperBound |
| `reverse()` | 从当前值播放到 lowerBound |
| `repeat()` | 循环播放，可传 `reverse: true` 实现来回摆动 |
| `stop()` | 停止在当前值 |
| `reset()` | 重置到 lowerBound |
| `animateTo(value)` | 动画过渡到指定值 |
| `fling()` | 基于物理模拟的快速甩动效果 |

**状态监听：**

```dart
_controller.addStatusListener((status) {
  switch (status) {
    case AnimationStatus.forward: // 正在正向播放
    case AnimationStatus.reverse: // 正在反向播放
    case AnimationStatus.completed: // 播放完成（到达 upperBound）
      _controller.reverse(); // 常用于实现"呼吸灯"效果
    case AnimationStatus.dismissed: // 回到初始状态（到达 lowerBound）
  }
});
```

### 3.2 AnimatedWidget vs AnimatedBuilder

两者都是把 `Animation` 变化转为 UI 重建，区别在于封装方式：

**AnimatedWidget**（适合封装可复用的动画组件）：

```dart
class RotatingLogo extends AnimatedWidget {
  const RotatingLogo({super.key, required Animation<double> animation})
      : super(listenable: animation);

  @override
  Widget build(BuildContext context) {
    final animation = listenable as Animation<double>;
    return Transform.rotate(angle: animation.value * 2 * pi, child: const FlutterLogo());
  }
}
```

**AnimatedBuilder**（适合内联使用，更常见）：

```dart
AnimatedBuilder(
  animation: _controller,
  child: const FlutterLogo(size: 80), // 不参与重建的静态部分
  builder: (context, child) {
    return Transform.rotate(
      angle: _controller.value * 2 * pi,
      child: child, // 直接复用，避免重复构建 FlutterLogo
    );
  },
)
```

> **性能关键**：`child` 参数只会被构建一次，后续帧只重建 `builder` 返回的外层部分。凡是动画中不变的子树，都应通过 `child` 传入，而不是在 `builder` 内部重新 build。

### 3.3 常用显式过渡组件（Transition 家族）

Flutter 提供了一组开箱即用的 `XxxTransition`，本质是对 `AnimatedBuilder` 的封装：

| Transition | 作用 |
|---|---|
| `FadeTransition` | 透明度 |
| `ScaleTransition` | 缩放 |
| `RotationTransition` | 旋转 |
| `SlideTransition` | 位移（基于 Offset，配合 `Tween<Offset>`） |
| `SizeTransition` | 尺寸展开收起 |
| `PositionedTransition` | Stack 内位置动画 |
| `DecoratedBoxTransition` | 装饰（背景色、边框等）动画 |
| `AlignTransition` | 对齐方式动画 |

```dart
SlideTransition(
  position: Tween<Offset>(
    begin: const Offset(0, 1), // 从屏幕下方开始
    end: Offset.zero,
  ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic)),
  child: const Card(child: Text('滑入卡片')),
)
```

---

## 四、Tween 与 Curve 详解

### 4.1 Tween（补间）

`Tween<T>` 负责把 `[0.0, 1.0]` 的线性进度映射为具体类型的值，本质是调用 `lerp`（线性插值）。

```dart
Tween<double>(begin: 0, end: 100);
ColorTween(begin: Colors.red, end: Colors.blue);
Tween<Offset>(begin: Offset.zero, end: const Offset(1, 0));
BorderRadiusTween(begin: BorderRadius.zero, end: BorderRadius.circular(20));
Tween<EdgeInsets>(begin: EdgeInsets.zero, end: const EdgeInsets.all(16));
```

**组合使用**：`Tween` 通过 `.animate(controller)` 与控制器结合，也可以链式接 `Curve`：

```dart
final Animation<double> animation = Tween<double>(begin: 0, end: 1)
    .chain(CurveTween(curve: Curves.easeIn))
    .animate(_controller);

// 等价于更常用的写法：
final Animation<double> animation2 = CurvedAnimation(
  parent: _controller,
  curve: Curves.easeIn,
).drive(Tween<double>(begin: 0, end: 1));
```

**自定义 Tween**（针对自定义数据类型）：

```dart
class PointTween extends Tween<Point> {
  PointTween({super.begin, super.end});
  @override
  Point lerp(double t) => Point(
        lerpDouble(begin!.x, end!.x, t)!,
        lerpDouble(begin!.y, end!.y, t)!,
      );
}
```

### 4.2 Curve（曲线）常用列表

| Curve | 效果描述 |
|---|---|
| `Curves.linear` | 匀速 |
| `Curves.easeIn` | 慢入快出 |
| `Curves.easeOut` | 快入慢出 |
| `Curves.easeInOut` | 两端慢中间快 |
| `Curves.fastOutSlowIn` | Material Design 标准曲线 |
| `Curves.bounceOut` | 结尾处弹跳效果 |
| `Curves.elasticOut` | 结尾处橡皮筋弹性效果 |
| `Curves.decelerate` | 快速减速 |
| `Curves.easeInOutCubicEmphasized` | Material 3 强调曲线 |

自定义曲线：

```dart
class ShakeCurve extends Curve {
  @override
  double transform(double t) => sin(t * pi * 6) * (1 - t); // 抖动衰减
}
```

---

## 五、Hero 动画

Hero 动画用于在两个页面切换时，让同一个视觉元素"飞跃"过渡（如列表缩略图飞到详情页大图）。

### 5.1 基础用法

**列表页：**

```dart
Hero(
  tag: 'product-${product.id}', // 全局唯一，两页必须一致
  child: Image.network(product.thumbnailUrl),
)
```

**详情页：**

```dart
Hero(
  tag: 'product-${product.id}',
  child: Image.network(product.fullImageUrl),
)
```

只要用 `Navigator.push` 跳转，Flutter 会自动识别两个路由中 `tag` 相同的 `Hero`，并生成飞行动画。

### 5.2 自定义飞行效果（flightShuttleBuilder）

```dart
Hero(
  tag: 'avatar',
  flightShuttleBuilder: (context, animation, direction, fromContext, toContext) {
    // 飞行过程中显示的 Widget，可以做形状/圆角渐变过渡
    return RotationTransition(
      turns: animation,
      child: toContext.widget, // 使用目标页面的 Widget 样式
    );
  },
  child: CircleAvatar(backgroundImage: NetworkImage(url)),
)
```

### 5.3 注意事项

- `tag` 必须全局唯一且两端一致，否则不会触发飞行动画。
- 两端 Hero 的子 Widget **外观（宽高比等）不同**是常态，Flutter 会自动做形变过渡（本质是 `RectTween` 补间包围盒）。
- 若列表中有多个同类型 Item，`tag` 需要携带唯一 id，避免冲突。
- Hero 动画只在**页面级路由跳转**（`Navigator.push/pop`）时生效，Tab 切换等不经过 Navigator 的场景无效。

---

## 六、交错动画（Staggered Animation）

交错动画指多个子动画共享同一个 `AnimationController`，但通过不同的 `Interval` 在时间轴上错开播放，从而形成有节奏感的组合效果。

### 6.1 核心思路：Interval

```dart
class StaggerDemo extends StatefulWidget {
  const StaggerDemo({super.key});
  @override
  State<StaggerDemo> createState() => _StaggerDemoState();
}

class _StaggerDemoState extends State<StaggerDemo>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _opacity;
  late final Animation<Offset> _slide;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // 0% ~ 40% 时间段：透明度从 0 到 1
    _opacity = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.4, curve: Curves.easeIn),
    );

    // 20% ~ 70% 时间段：位移
    _slide = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.2, 0.7, curve: Curves.easeOutCubic),
      ),
    );

    // 50% ~ 100% 时间段：缩放
    _scale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 1.0, curve: Curves.elasticOut),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Opacity(
          opacity: _opacity.value,
          child: SlideTransition(
            position: _slide,
            child: Transform.scale(scale: _scale.value, child: child),
          ),
        );
      },
      child: const Card(child: Padding(padding: EdgeInsets.all(24), child: Text('交错动画'))),
    );
  }
}
```

**要点**：`Interval` 把 `[0,1]` 的时间轴切片，每个子动画只在自己的区间内变化，超出区间则保持在边界值（0或1）。这是实现"依次入场""波浪式列表动画"的核心技巧。

### 6.2 列表项依次入场（常见业务场景）

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final start = (index * 0.1).clamp(0.0, 1.0);
    final end = (start + 0.4).clamp(0.0, 1.0);
    final animation = CurvedAnimation(
      parent: _controller,
      curve: Interval(start, end, curve: Curves.easeOut),
    );
    return FadeTransition(
      opacity: animation,
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0.3, 0), end: Offset.zero)
            .animate(animation),
        child: ListTile(title: Text(items[index])),
      ),
    );
  },
)
```

> 实际项目中更推荐使用第三方库 `flutter_staggered_animations`，封装了 `AnimationLimiter` / `SlideAnimation` / `FadeInAnimation`，无需手写 Interval。

---

## 七、物理仿真动画

物理动画不依赖固定时长的 Curve，而是基于真实物理公式（弹簧、摩擦力）计算轨迹，交互手感更自然，常用于拖拽释放后的回弹。

### 7.1 SpringSimulation（弹簧动画）

```dart
void _runSpringAnimation(double from, double velocity) {
  final spring = SpringDescription(
    mass: 1,       // 质量
    stiffness: 300, // 刚度，越大回弹越快
    damping: 15,    // 阻尼，越大震荡越少
  );
  final simulation = SpringSimulation(spring, from, 0, velocity);
  _controller.animateWith(simulation);
}
```

常用于 `DraggableScrollableSheet`、卡片拖拽松手回弹、下拉刷新回弹等场景。

### 7.2 结合手势的拖拽回弹示例

```dart
GestureDetector(
  onPanUpdate: (details) {
    setState(() => _dx += details.delta.dx);
  },
  onPanEnd: (details) {
    final spring = SpringDescription(mass: 1, stiffness: 200, damping: 20);
    final simulation = SpringSimulation(
      spring,
      _dx,           // 当前起始位置
      0,             // 目标位置（回到原点）
      details.velocity.pixelsPerSecond.dx / 1000, // 带入松手速度，手感更真实
    );
    _controller.animateWith(simulation);
  },
  child: Transform.translate(offset: Offset(_dx, 0), child: const FlutterLogo()),
)
```

### 7.3 fling() 快捷方法

```dart
_controller.fling(velocity: 2.0); // 内部使用摩擦力模拟，正数向前，负数向后
```

---

## 八、自定义动画（CustomPainter）

对于路径绘制、进度环、图表等复杂视觉效果，需要结合 `CustomPainter` + `AnimationController` 手动绘制每一帧。

```dart
class CircularProgressPainter extends CustomPainter {
  CircularProgressPainter(this.progress);
  final double progress; // 0.0 ~ 1.0

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final rect = Offset.zero & size;
    canvas.drawArc(rect.deflate(4), -pi / 2, 2 * pi * progress, false, paint);
  }

  @override
  bool shouldRepaint(covariant CircularProgressPainter oldDelegate) {
    return oldDelegate.progress != progress; // 仅进度变化时才重绘
  }
}

// 使用：
AnimatedBuilder(
  animation: _controller,
  builder: (context, _) => CustomPaint(
    size: const Size(120, 120),
    painter: CircularProgressPainter(_controller.value),
  ),
)
```

**要点**：
- `shouldRepaint` 决定是否触发重绘，精确比较可避免无意义的重绘，是性能优化关键。
- 复杂路径动画可结合 `PathMetric` 实现"手写""描边"效果：

```dart
final pathMetrics = path.computeMetrics().first;
final extractPath = pathMetrics.extractPath(0, pathMetrics.length * progress);
canvas.drawPath(extractPath, paint);
```

---

## 九、页面转场动画

### 9.1 自定义 PageRouteBuilder

```dart
Navigator.push(
  context,
  PageRouteBuilder(
    transitionDuration: const Duration(milliseconds: 400),
    pageBuilder: (context, animation, secondaryAnimation) => const DetailPage(),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      // animation: 当前页面进入/退出的动画
      // secondaryAnimation: 被压入栈底页面的动画（用于做视差退出效果）
      return SlideTransition(
        position: Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
            .animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
        child: child,
      );
    },
  ),
);
```

### 9.2 全局统一转场（MaterialApp 主题层面）

```dart
MaterialApp(
  theme: ThemeData(
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: CupertinoPageTransitionsBuilder(), // Android 也用 iOS 风格转场
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      },
    ),
  ),
)
```

### 9.3 使用 go_router 自定义转场

```dart
GoRoute(
  path: '/detail',
  pageBuilder: (context, state) => CustomTransitionPage(
    child: const DetailPage(),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(opacity: animation, child: child);
    },
  ),
)
```

---

## 十、AnimatedSwitcher 与 AnimatedList

### 10.1 AnimatedList（列表增删动画）

```dart
final GlobalKey<AnimatedListState> _listKey = GlobalKey();
final List<String> _items = ['A', 'B', 'C'];

void _insertItem(int index, String value) {
  _items.insert(index, value);
  _listKey.currentState!.insertItem(index); // 触发插入动画
}

void _removeItem(int index) {
  final removed = _items.removeAt(index);
  _listKey.currentState!.removeItem(
    index,
    (context, animation) => SizeTransition(
      sizeFactor: animation,
      child: ListTile(title: Text(removed)),
    ),
  );
}

AnimatedList(
  key: _listKey,
  initialItemCount: _items.length,
  itemBuilder: (context, index, animation) {
    return SizeTransition(
      sizeFactor: animation,
      child: ListTile(title: Text(_items[index])),
    );
  },
)
```

> Flutter 3.x 后也可使用更现代的 `AnimatedList` 替代方案 `implicitly_animated_reorderable_list` 或原生 `ReorderableListView`（支持拖拽排序但动画能力较弱）。

---

## 十一、第三方动画库

| 库 | 用途 |
|---|---|
| `lottie` | 播放 After Effects 导出的 Lottie JSON 动画，适合复杂矢量动效 |
| `rive` | 交互式动画引擎，支持状态机驱动的动画（如根据数值联动动画） |
| `flutter_animate` | 链式 API 简化动画编写，如 `.fadeIn().slide().scale()` |
| `flutter_staggered_animations` | 简化列表交错入场动画 |
| `simple_animations` | 提供 `MultiTween` 等更灵活的多属性动画编排工具 |
| `animations`（官方包） | Material Motion 规范动画，如 `OpenContainer`、`SharedAxisTransition` |

**Lottie 示例：**

```dart
Lottie.asset('assets/loading.json', repeat: true, animate: true);
```

**flutter_animate 示例：**

```dart
Text('Hello')
    .animate()
    .fadeIn(duration: 400.ms)
    .slideY(begin: 0.3, end: 0, curve: Curves.easeOut)
    .then(delay: 200.ms)
    .shake();
```

---

## 十二、性能优化与最佳实践

1. **善用 `child` 参数**：`AnimatedBuilder` 和自定义 `AnimatedWidget` 中，不变的子树通过 `child` 传入，避免每帧重复 build。
2. **限制重绘范围**：用 `RepaintBoundary` 包裹动画部分，避免动画触发整个页面的重绘（重新光栅化范围变大会掉帧）。
   ```dart
   RepaintBoundary(child: AnimatedBuilder(...));
   ```
3. **及时 dispose**：所有 `AnimationController` 必须在 `dispose()` 中释放，否则会持续消耗 Ticker 资源并造成内存泄漏。
4. **避免在 `build()` 中创建 Tween/Curve**：应在 `initState` 中创建好动画对象，`build()` 只负责读取当前值。
5. **合理选择 `vsync`**：不可见的动画（如离屏 Tab）应配合 `TickerMode` 或 `AutomaticKeepAliveClientMixin` 控制是否继续消耗资源。
6. **优先用隐式动画**：能用 `AnimatedContainer` 解决的简单场景，不要引入 `AnimationController`，减少状态管理复杂度。
7. **60fps 预算**：每帧渲染需在 16.6ms 内完成（120Hz 屏幕为 8.3ms），复杂 `CustomPainter` 需要通过 `shouldRepaint` 精确控制重绘时机。
8. **动画期间避免布局抖动**：优先使用 `Transform`（合成层变换，不触发重新布局）而非直接改变 `width/height`（触发重新布局，性能开销更大）。

---

## 十三、常见问题排查

| 问题现象 | 常见原因 | 解决方法 |
|---|---|---|
| 动画卡顿/掉帧 | 每帧都在重新 build 大量 Widget | 使用 `AnimatedBuilder` 的 `child` 参数 + `RepaintBoundary` |
| `setState() called after dispose()` | Controller 播放完成后页面已销毁但监听器仍触发 | 在 `dispose()` 中调用 `_controller.dispose()`，并在监听回调中判断 `mounted` |
| `AnimatedSwitcher` 不生效 | 子 Widget 的 `key` 未变化 | 确保切换内容时 `key` 也随之改变（如 `ValueKey`） |
| Hero 动画没有飞跃效果 | 两端 `tag` 不一致，或跳转方式不是 `Navigator.push` | 检查 tag 唯一性；确认走的是标准路由跳转 |
| `LateInitializationError: _controller` | 在 `initState` 之外过早访问 controller | 确保初始化顺序，必要时用 `late final` 并在 `initState` 赋值 |
| 动画方向反了 | `Tween(begin, end)` 与 `Curve` 理解反了 | 打印 `_controller.value` 确认取值范围，检查 begin/end 顺序 |
| 多个 Controller 报 `vsync` 错误 | `SingleTickerProviderStateMixin` 只能提供一个 Ticker | 改用 `TickerProviderStateMixin` |

---

## 附：动画选型速查表

| 场景 | 推荐方案 |
|---|---|
| 简单的属性渐变（颜色/尺寸/透明度） | 隐式动画（`AnimatedContainer` 等） |
| 需要暂停/循环/精确控制 | 显式动画（`AnimationController`） |
| 页面间共享元素跳转 | `Hero` |
| 列表项依次入场 | `Interval` 交错动画 或 `flutter_staggered_animations` |
| 拖拽释放回弹 | `SpringSimulation` |
| 进度环/图表/手绘路径 | `CustomPainter` |
| 页面切换转场 | `PageRouteBuilder` / `PageTransitionsTheme` |
| 复杂矢量动效（如设计师导出） | `Lottie` / `Rive` |
| 快速编写链式动画 | `flutter_animate` |
