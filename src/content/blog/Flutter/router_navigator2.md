---
title: "router_navigator2"
description: "适用版本：Flutter 2.0+ 更新时间：2024"
pubDate: 2026-06-28
category: "Flutter"
tags: [Git, iOS, Shell, API, SEO]
draft: false
---
# Flutter Router & Navigator 2.0 完整 API 参考

> 适用版本：Flutter 2.0+  
> 更新时间：2024

---

## 目录

1. [概述与架构对比](#1-概述与架构对比)
2. [Navigator 1.0（命令式）](#2-navigator-10命令式)
3. [Navigator 2.0（声明式）核心组件](#3-navigator-20声明式核心组件)
   - [Page](#31-page-抽象类)
   - [RouteInformationProvider](#32-routeinformationprovider)
   - [RouteInformationParser](#33-routeinformationparser)
   - [RouterDelegate](#34-routerdelegate)
   - [Router Widget](#35-router-widget)
   - [BackButtonDispatcher](#36-backbuttondispatcher)
4. [Route 类体系](#4-route-类体系)
5. [MaterialApp.router 与 GoRouter](#5-materialapprouter-与-gorouter)
6. [GoRouter 完整 API](#6-gorouter-完整-api)
7. [完整实战示例](#7-完整实战示例)
8. [常见场景速查](#8-常见场景速查)

---

## 1. 概述与架构对比

### Navigator 1.0 vs Navigator 2.0

| 维度 | Navigator 1.0 | Navigator 2.0 |
|------|--------------|---------------|
| 范式 | 命令式（imperative） | 声明式（declarative） |
| 核心 API | `push` / `pop` / `pushNamed` | `Router` + `RouterDelegate` |
| URL 同步 | 不支持 | 原生支持（Web/Deep Link） |
| 状态驱动 | 否 | 是（页面栈由状态决定） |
| 学习曲线 | 低 | 高（通常用 GoRouter 封装） |
| 适用场景 | 简单 App | 有 Deep Link / Web 需求的 App |

### Navigator 2.0 架构图

```
┌─────────────────────────────────────────────────────┐
│                    MaterialApp.router                │
│  ┌──────────────────────────────────────────────┐   │
│  │               Router Widget                  │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │         RouterDelegate                  │ │   │
│  │  │   build() → Navigator(pages: [...])     │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │      RouteInformationParser             │ │   │
│  │  │   parseRouteInformation() → AppState    │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │    RouteInformationProvider             │ │   │
│  │  │   (PlatformRouteInformationProvider)    │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │      BackButtonDispatcher               │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Navigator 1.0（命令式）

### 2.1 基础导航方法

```dart
// 获取 Navigator 实例
NavigatorState navigator = Navigator.of(context);

// 也可以直接使用静态方法
Navigator.push(context, route);
```

### 2.2 push 系列

```dart
// push：压入新路由，返回 Future（等待路由弹出时的返回值）
Future<T?> result = Navigator.push<T>(
  context,
  MaterialPageRoute(builder: (ctx) => DetailPage()),
);

// pushNamed：通过路由名称压入
Future<T?> result = Navigator.pushNamed<T>(
  context,
  '/detail',
  arguments: {'id': 42},  // 传递参数
);

// pushReplacement：替换当前路由（不可回退）
Navigator.pushReplacement(
  context,
  MaterialPageRoute(builder: (ctx) => HomePage()),
);

// pushReplacementNamed
Navigator.pushReplacementNamed(context, '/home');

// pushAndRemoveUntil：压入新路由并移除栈内指定条件之前的所有路由
Navigator.pushAndRemoveUntil(
  context,
  MaterialPageRoute(builder: (ctx) => LoginPage()),
  (Route<dynamic> route) => false,  // false = 清空所有
);

// pushNamedAndRemoveUntil
Navigator.pushNamedAndRemoveUntil(
  context,
  '/login',
  ModalRoute.withName('/'),  // 保留到 '/' 路由
);
```

### 2.3 pop 系列

```dart
// pop：弹出当前路由，可携带返回值
Navigator.pop(context, 'result_value');

// maybePop：如果可以才 pop（栈深度 > 1 时）
Navigator.maybePop(context);

// popUntil：连续 pop 直到满足条件
Navigator.popUntil(context, ModalRoute.withName('/home'));

// canPop：判断是否可以 pop
bool canPop = Navigator.canPop(context);
```

### 2.4 Named Routes 配置

```dart
MaterialApp(
  initialRoute: '/',
  routes: {
    '/': (context) => HomePage(),
    '/detail': (context) => DetailPage(),
    '/profile': (context) => ProfilePage(),
  },
  // 动态路由生成（处理 routes 未定义的路由）
  onGenerateRoute: (RouteSettings settings) {
    if (settings.name == '/item') {
      final args = settings.arguments as Map<String, dynamic>;
      return MaterialPageRoute(
        builder: (ctx) => ItemPage(id: args['id']),
      );
    }
    return null;
  },
  // 未知路由兜底
  onUnknownRoute: (RouteSettings settings) {
    return MaterialPageRoute(builder: (ctx) => NotFoundPage());
  },
);
```

### 2.5 获取路由参数

```dart
// 在目标页面获取 arguments
class DetailPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments;
    final map = args as Map<String, dynamic>;
    return Text('ID: ${map['id']}');
  }
}
```

### 2.6 Navigator Widget 属性

```dart
Navigator(
  key: navigatorKey,                    // GlobalKey<NavigatorState>
  initialRoute: '/',                    // 初始路由名
  onGenerateRoute: _generateRoute,      // 路由生成器
  onUnknownRoute: _unknownRoute,        // 未知路由
  observers: [MyRouteObserver()],       // 路由观察者
  pages: [...],                         // Navigator 2.0 页面列表
  onPopPage: (route, result) {          // Navigator 2.0 pop 回调
    return route.didPop(result);
  },
  restorationScopeId: 'nav',           // 状态恢复 ID
  clipBehavior: Clip.hardEdge,
)
```

### 2.7 RouteObserver（路由生命周期监听）

```dart
// 1. 定义 observer
final RouteObserver<PageRoute> routeObserver = RouteObserver<PageRoute>();

// 2. 注册到 MaterialApp
MaterialApp(
  navigatorObservers: [routeObserver],
)

// 3. 页面内订阅
class _MyPageState extends State<MyPage> with RouteAware {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    routeObserver.subscribe(this, ModalRoute.of(context)! as PageRoute);
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override void didPush() {}        // 当前路由被压入
  @override void didPop() {}         // 当前路由被弹出
  @override void didPushNext() {}    // 新路由压入其上方
  @override void didPopNext() {}     // 上方路由弹出，当前路由恢复可见
}
```

---

## 3. Navigator 2.0（声明式）核心组件

### 3.1 Page 抽象类

`Page<T>` 是 Navigator 2.0 中页面的描述符（不是 Widget），它告诉 Navigator 如何创建对应的 `Route`。

```dart
abstract class Page<T> extends RouteSettings {
  const Page({
    this.key,          // LocalKey，用于识别页面唯一性
    String? name,      // 路由名
    Object? arguments, // 路由参数
    String? restorationId,
  });

  final LocalKey? key;

  // 子类必须实现：创建对应的 Route
  Route<T> createRoute(BuildContext context);

  // 判断页面是否与另一个 Page 相同（用于 diff 算法）
  bool canUpdate(Page<dynamic> other) {
    return other.runtimeType == runtimeType && other.key == key;
  }
}
```

**内置 Page 实现：**

```dart
// MaterialPage：Material 风格页面（带滑动过渡）
MaterialPage<T>(
  key: ValueKey('detail'),
  child: DetailPage(),
  name: '/detail',
  arguments: {'id': 1},
  maintainState: true,   // 是否保持状态
  fullscreenDialog: false,
  restorationId: 'detail',
)

// CupertinoPage：iOS 风格页面（右滑返回）
CupertinoPage<T>(
  key: ValueKey('profile'),
  child: ProfilePage(),
)

// 自定义 Page
class FadePage<T> extends Page<T> {
  final Widget child;
  const FadePage({required this.child, super.key});

  @override
  Route<T> createRoute(BuildContext context) {
    return PageRouteBuilder<T>(
      settings: this,
      pageBuilder: (ctx, animation, _) => child,
      transitionsBuilder: (ctx, animation, _, child) =>
          FadeTransition(opacity: animation, child: child),
    );
  }
}
```

### 3.2 RouteInformationProvider

负责提供当前路由信息（URL），并监听平台路由变化（如浏览器地址栏、Deep Link）。

```dart
abstract class RouteInformationProvider extends ValueListenable<RouteInformation> {
  // 通知路由信息已被 Router 处理
  void routerReportsNewRouteInformation(
    RouteInformation routeInformation, {
    RouteInformationReportingType type = RouteInformationReportingType.none,
  });
}

// RouteInformation 数据类
RouteInformation(
  uri: Uri.parse('/detail/42'),  // 路由 URI
  state: {'scroll': 0.5},        // 可序列化的附加状态（用于状态恢复）
)

// 内置实现：监听平台 URL 变化
PlatformRouteInformationProvider(
  initialRouteInformation: RouteInformation(
    uri: Uri.parse(WidgetsBinding.instance.platformDispatcher.defaultRouteName),
  ),
)
```

### 3.3 RouteInformationParser

将 `RouteInformation`（URL）解析为应用自定义的路由状态对象，以及反向将状态还原为 URL。

```dart
abstract class RouteInformationParser<T> {
  // URL → 应用状态（异步，支持鉴权等异步操作）
  Future<T> parseRouteInformation(RouteInformation routeInformation);

  // 应用状态 → URL（可选，用于 URL 同步）
  RouteInformation? restoreRouteInformation(T configuration) => null;
}

// 示例实现
class AppRouteInformationParser extends RouteInformationParser<AppRoutePath> {
  @override
  Future<AppRoutePath> parseRouteInformation(
      RouteInformation routeInformation) async {
    final uri = routeInformation.uri;

    if (uri.pathSegments.isEmpty) return AppRoutePath.home();

    if (uri.pathSegments.length == 2 &&
        uri.pathSegments[0] == 'detail') {
      final id = int.tryParse(uri.pathSegments[1]);
      if (id != null) return AppRoutePath.detail(id);
    }

    return AppRoutePath.unknown();
  }

  @override
  RouteInformation? restoreRouteInformation(AppRoutePath path) {
    if (path.isHome) return RouteInformation(uri: Uri.parse('/'));
    if (path.isDetail) return RouteInformation(uri: Uri.parse('/detail/${path.id}'));
    return RouteInformation(uri: Uri.parse('/404'));
  }
}

// 路由状态类
class AppRoutePath {
  final bool isHome;
  final bool isDetail;
  final bool isUnknown;
  final int? id;

  AppRoutePath.home() : isHome = true, isDetail = false, isUnknown = false, id = null;
  AppRoutePath.detail(this.id) : isHome = false, isDetail = true, isUnknown = false;
  AppRoutePath.unknown() : isHome = false, isDetail = false, isUnknown = true, id = null;
}
```

### 3.4 RouterDelegate

Navigator 2.0 的核心控制器，负责：
- 根据应用状态构建 `Navigator`（决定页面栈）
- 响应系统 Back 按钮
- 通知路由状态变化

```dart
abstract class RouterDelegate<T> extends Listenable {
  // 核心：构建包含 Navigator 的 Widget 树
  Widget build(BuildContext context);

  // 当 Parser 解析出新路由状态时调用
  Future<void> setNewRoutePath(T configuration);

  // 获取当前路由状态（用于 URL 同步）
  T? get currentConfiguration => null;

  // 处理系统 Back 按钮（返回 true 表示已处理）
  Future<bool> popRoute();
}

// 完整实现示例
class AppRouterDelegate extends RouterDelegate<AppRoutePath>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<AppRoutePath> {

  @override
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  // 应用路由状态
  AppRoutePath _currentPath = AppRoutePath.home();

  void navigateToDetail(int id) {
    _currentPath = AppRoutePath.detail(id);
    notifyListeners(); // 触发 build()
  }

  void navigateToHome() {
    _currentPath = AppRoutePath.home();
    notifyListeners();
  }

  @override
  AppRoutePath get currentConfiguration => _currentPath;

  @override
  Future<void> setNewRoutePath(AppRoutePath path) async {
    _currentPath = path;
  }

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: [
        MaterialPage(
          key: ValueKey('home'),
          child: HomeScreen(onDetailTap: navigateToDetail),
        ),
        if (_currentPath.isDetail)
          MaterialPage(
            key: ValueKey('detail-${_currentPath.id}'),
            child: DetailScreen(
              id: _currentPath.id!,
              onBack: navigateToHome,
            ),
          ),
        if (_currentPath.isUnknown)
          MaterialPage(
            key: ValueKey('404'),
            child: NotFoundScreen(),
          ),
      ],
      onPopPage: (route, result) {
        if (!route.didPop(result)) return false;
        navigateToHome();
        return true;
      },
    );
  }
}
```

**PopNavigatorRouterDelegateMixin** — 便捷 mixin，自动实现 `popRoute()`：

```dart
mixin PopNavigatorRouterDelegateMixin<T> on RouterDelegate<T> {
  GlobalKey<NavigatorState>? get navigatorKey;

  @override
  Future<bool> popRoute() {
    final NavigatorState? navigator = navigatorKey?.currentState;
    if (navigator == null) return SynchronousFuture<bool>(false);
    return navigator.maybePop();
  }
}
```

### 3.5 Router Widget

```dart
Router<T>(
  // 必填：路由委托
  routerDelegate: AppRouterDelegate(),

  // 可选：URL 解析器（有 URL 同步需求时必填）
  routeInformationParser: AppRouteInformationParser(),

  // 可选：URL 提供者（默认 PlatformRouteInformationProvider）
  routeInformationProvider: PlatformRouteInformationProvider(
    initialRouteInformation: RouteInformation(uri: Uri.parse('/')),
  ),

  // 可选：Back 按钮分发器
  backButtonDispatcher: RootBackButtonDispatcher(),

  // 可选：恢复 ID
  restorationScopeId: 'router',
)
```

### 3.6 BackButtonDispatcher

处理系统/浏览器 Back 按钮事件。

```dart
// 根分发器（注册到 WidgetsBinding）
RootBackButtonDispatcher()

// 子分发器（用于嵌套 Router）
ChildBackButtonDispatcher(parent)

// 使用示例：在 RouterDelegate 中手动处理
class MyDelegate extends RouterDelegate<...> {
  final BackButtonDispatcher dispatcher;

  @override
  Future<bool> popRoute() async {
    // 自定义 back 逻辑
    if (_canGoBack) {
      goBack();
      return true; // 已处理，不再向上传递
    }
    return false; // 未处理，系统退出 App
  }
}
```

---

## 4. Route 类体系

```
Route<T>
├── OverlayRoute<T>
│   └── TransitionRoute<T>
│       ├── ModalRoute<T>
│       │   ├── PageRoute<T>
│       │   │   ├── MaterialPageRoute<T>   ← 最常用
│       │   │   └── CupertinoPageRoute<T>
│       │   └── PopupRoute<T>
│       │       ├── DialogRoute<T>
│       │       ├── ModalBottomSheetRoute<T>
│       │       └── CupertinoModalPopupRoute<T>
│       └── PageRouteBuilder<T>            ← 自定义过渡动画
└── RawDialogRoute<T>
```

### 4.1 MaterialPageRoute

```dart
MaterialPageRoute<T>(
  builder: (context) => MyPage(),
  settings: RouteSettings(name: '/my', arguments: {}),
  maintainState: true,     // 是否在非活跃时保持状态
  fullscreenDialog: false, // true = iOS 下从底部弹出
  allowSnapshotting: true, // 是否允许截图缓存（过渡动画优化）
  barrierDismissible: false,
)
```

### 4.2 PageRouteBuilder（自定义过渡动画）

```dart
PageRouteBuilder<T>(
  settings: RouteSettings(name: '/custom'),
  pageBuilder: (context, animation, secondaryAnimation) {
    return MyPage();
  },
  transitionsBuilder: (context, animation, secondaryAnimation, child) {
    // animation: 0.0 → 1.0（进入）
    // secondaryAnimation: 当新路由压入时，当前路由的退出动画

    // 示例1：渐变
    return FadeTransition(opacity: animation, child: child);

    // 示例2：滑入
    final tween = Tween(begin: Offset(1.0, 0.0), end: Offset.zero)
        .chain(CurveTween(curve: Curves.easeInOut));
    return SlideTransition(
      position: animation.drive(tween),
      child: child,
    );

    // 示例3：缩放
    return ScaleTransition(
      scale: animation,
      child: child,
    );
  },
  transitionDuration: Duration(milliseconds: 300),
  reverseTransitionDuration: Duration(milliseconds: 200),
  opaque: true,           // 是否不透明（影响下方路由渲染）
  barrierDismissible: false,
  barrierColor: Colors.black54,
  barrierLabel: 'Dismiss',
  maintainState: true,
)
```

### 4.3 ModalRoute（访问当前路由信息）

```dart
// 在 Widget 内获取当前路由
ModalRoute<T>? route = ModalRoute.of<T>(context);

route!.settings.name       // 路由名
route.settings.arguments   // 路由参数
route.isCurrent            // 是否是栈顶路由
route.isActive             // 是否在栈内
route.isFirst              // 是否是第一个路由
route.animation            // 路由进入动画（AnimationController）
route.secondaryAnimation   // 路由被覆盖时的退出动画
route.canPop               // 是否可以 pop
route.willHandlePopInternally // 是否内部处理 pop（如 WillPopScope）
```

### 4.4 Dialog / BottomSheet 路由

```dart
// showDialog → 内部使用 DialogRoute
showDialog<T>(
  context: context,
  builder: (ctx) => AlertDialog(...),
  barrierDismissible: true,
  barrierColor: Colors.black54,
  useSafeArea: true,
  useRootNavigator: true,      // 是否使用根 Navigator
  routeSettings: RouteSettings(name: '/dialog'),
);

// showModalBottomSheet → 内部使用 ModalBottomSheetRoute
showModalBottomSheet<T>(
  context: context,
  builder: (ctx) => MySheet(),
  isScrollControlled: true,   // 允许全屏
  isDismissible: true,
  enableDrag: true,
  backgroundColor: Colors.white,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
  ),
  constraints: BoxConstraints(maxHeight: 400),
  useRootNavigator: false,
);

// showGeneralDialog → 完全自定义
showGeneralDialog<T>(
  context: context,
  pageBuilder: (ctx, animation, secondaryAnimation) => MyDialog(),
  transitionBuilder: (ctx, animation, _, child) =>
      FadeTransition(opacity: animation, child: child),
  transitionDuration: Duration(milliseconds: 200),
  barrierDismissible: true,
  barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
  barrierColor: Colors.black54,
);
```

---

## 5. MaterialApp.router 与 GoRouter

### 5.1 MaterialApp.router 配置

```dart
MaterialApp.router(
  title: 'My App',
  theme: ThemeData.light(),
  // 必填
  routerDelegate: appRouterDelegate,
  // 有 URL 解析需求时必填
  routeInformationParser: appRouteInformationParser,
  // 可选，自定义 URL 提供者
  routeInformationProvider: appRouteInformationProvider,
  // 可选，自定义 back 按钮处理
  backButtonDispatcher: RootBackButtonDispatcher(),
  // 其他 MaterialApp 参数照常
  locale: Locale('zh', 'CN'),
  supportedLocales: [Locale('zh', 'CN'), Locale('en', 'US')],
  builder: (context, child) => child!,
)
```

---

## 6. GoRouter 完整 API

GoRouter 是 Flutter 官方推荐的 Navigator 2.0 封装库，大幅简化路由配置。

**添加依赖：**
```yaml
dependencies:
  go_router: ^13.0.0
```

### 6.1 GoRouter 基础配置

```dart
final GoRouter router = GoRouter(
  // 初始路由
  initialLocation: '/',

  // 调试日志
  debugLogDiagnostics: true,

  // 路由定义
  routes: [
    GoRoute(
      path: '/',
      name: 'home',  // 命名路由
      builder: (context, state) => HomePage(),
    ),
    GoRoute(
      path: '/detail/:id',  // 路径参数
      name: 'detail',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return DetailPage(id: int.parse(id));
      },
    ),
  ],

  // 全局错误页
  errorBuilder: (context, state) => ErrorPage(error: state.error),

  // 全局重定向（鉴权等）
  redirect: (context, state) {
    final isLoggedIn = AuthService.isLoggedIn;
    final isLoginPage = state.matchedLocation == '/login';
    if (!isLoggedIn && !isLoginPage) return '/login';
    if (isLoggedIn && isLoginPage) return '/';
    return null; // null = 不重定向
  },

  // 重定向最大次数（防止死循环）
  redirectLimit: 5,

  // 导航监听
  observers: [MyNavigatorObserver()],

  // 状态恢复
  restorationScopeId: 'router',
);

// 注册到 MaterialApp
MaterialApp.router(
  routerConfig: router,  // 推荐方式（GoRouter 实现了 RouterConfig）
)
```

### 6.2 GoRoute

```dart
GoRoute(
  path: '/users/:userId/posts/:postId',   // 路径，支持参数
  name: 'user-post',                      // 命名路由
  parentNavigatorKey: _rootNavigatorKey,  // 指定父 Navigator（用于嵌套）

  // 普通 builder
  builder: (BuildContext context, GoRouterState state) {
    return PostPage(
      userId: state.pathParameters['userId']!,
      postId: state.pathParameters['postId']!,
    );
  },

  // 自定义过渡 builder
  pageBuilder: (context, state) {
    return CustomTransitionPage(
      key: state.pageKey,
      child: PostPage(...),
      transitionsBuilder: (ctx, animation, _, child) =>
          FadeTransition(opacity: animation, child: child),
    );
  },

  // 路由级重定向
  redirect: (context, state) {
    if (!canAccessPost()) return '/login';
    return null;
  },

  // 子路由
  routes: [
    GoRoute(
      path: 'edit',  // 完整路径：/users/:userId/posts/:postId/edit
      builder: (context, state) => EditPostPage(...),
    ),
  ],
)
```

### 6.3 GoRouterState（路由状态信息）

```dart
// 在 builder/redirect 回调中通过参数获取
// 在 Widget 内通过 GoRouterState.of(context) 获取

GoRouterState state = GoRouterState.of(context);

state.uri               // 完整 URI（Uri 对象）
state.fullPath          // 完整路径字符串
state.matchedLocation   // 当前匹配到的路径
state.name              // 路由名称
state.path              // 路由模板路径（含 :param）
state.pageKey           // 页面 Key（UniqueKey）
state.pathParameters    // 路径参数 Map<String, String>
state.uri.queryParameters // 查询参数 Map<String, String>
state.extra             // 通过 extra 传递的任意对象
state.error             // 路由错误（GoException）
state.topRoute          // 当前最顶层路由
```

### 6.4 导航方法

```dart
// 获取 GoRouter 实例
final router = GoRouter.of(context);
// 或
final router = context.go; // 扩展方法

// go：替换当前位置（不可回退）
context.go('/detail/42');
context.go('/search', extra: SearchQuery(keyword: 'flutter'));

// goNamed：命名路由跳转
context.goNamed(
  'detail',
  pathParameters: {'id': '42'},
  queryParameters: {'tab': 'comments'},
  extra: myObject,
);

// push：压入新路由（可回退）
context.push('/detail/42');
final result = await context.push<String>('/edit/42');

// pushNamed
context.pushNamed(
  'detail',
  pathParameters: {'id': '42'},
  extra: myData,
);

// pushReplacement：替换栈顶
context.pushReplacement('/new-page');
context.pushReplacementNamed('new-page');

// replace：替换当前路由（URL 改变但栈深度不变）
context.replace('/updated-path');
context.replaceNamed('updated-route');

// pop：返回上一页
context.pop();
context.pop('return_value'); // 携带返回值

// canPop
bool canPop = context.canPop();

// popUntil（GoRouter v10+）
router.go('/'); // 相当于 popUntil root

// 获取当前 location
String location = GoRouterState.of(context).uri.toString();
```

### 6.5 ShellRoute（保持状态的嵌套导航，如 BottomNavigationBar）

```dart
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return ScaffoldWithNavBar(child: child); // child = 子路由页面
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => HomePage(),
        ),
        GoRoute(
          path: '/explore',
          builder: (context, state) => ExplorePage(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => ProfilePage(),
        ),
      ],
    ),
  ],
);

// ScaffoldWithNavBar 示例
class ScaffoldWithNavBar extends StatelessWidget {
  final Widget child;
  const ScaffoldWithNavBar({required this.child, super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        onTap: (index) => _onItemTapped(index, context),
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Explore'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/explore')) return 1;
    if (location.startsWith('/profile')) return 2;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0: context.go('/'); break;
      case 1: context.go('/explore'); break;
      case 2: context.go('/profile'); break;
    }
  }
}
```

### 6.6 StatefulShellRoute（各 Tab 独立导航栈）

```dart
// 每个 Tab 保持独立的导航历史
StatefulShellRoute.indexedStack(
  builder: (context, state, navigationShell) {
    return ScaffoldWithNavBar(navigationShell: navigationShell);
  },
  branches: [
    StatefulShellBranch(
      navigatorKey: _homeNavigatorKey,
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => HomeTab(),
          routes: [
            GoRoute(
              path: 'detail/:id',
              builder: (context, state) => DetailPage(
                id: state.pathParameters['id']!,
              ),
            ),
          ],
        ),
      ],
    ),
    StatefulShellBranch(
      navigatorKey: _profileNavigatorKey,
      routes: [
        GoRoute(
          path: '/profile',
          builder: (context, state) => ProfileTab(),
        ),
      ],
    ),
  ],
)

// 在 ScaffoldWithNavBar 中使用 navigationShell
class ScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const ScaffoldWithNavBar({required this.navigationShell, super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell, // 直接作为 body
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navigationShell.currentIndex,
        onTap: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
        items: [...],
      ),
    );
  }
}
```

### 6.7 自定义过渡页面

```dart
// CustomTransitionPage
GoRoute(
  path: '/modal',
  pageBuilder: (context, state) => CustomTransitionPage<void>(
    key: state.pageKey,
    child: ModalPage(),
    fullscreenDialog: true,
    opaque: false,        // 透明背景（用于模态）
    barrierDismissible: true,
    barrierColor: Colors.black54,
    transitionDuration: Duration(milliseconds: 250),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return SlideTransition(
        position: animation.drive(
          Tween(begin: Offset(0.0, 1.0), end: Offset.zero)
              .chain(CurveTween(curve: Curves.easeOut)),
        ),
        child: child,
      );
    },
  ),
)

// NoTransitionPage（立即切换，无动画）
GoRoute(
  path: '/fast',
  pageBuilder: (context, state) => NoTransitionPage(
    key: state.pageKey,
    child: FastPage(),
  ),
)
```

### 6.8 全局 navigatorKey 与编程式导航

```dart
final _rootNavigatorKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  routes: [...],
);

// 在无 context 处导航（如 ViewModel / Service）
_rootNavigatorKey.currentContext?.go('/login');

// 或直接使用 router 实例
router.go('/login');
router.push('/detail/1');
router.pop();
```

### 6.9 路由监听（GoRouter Listenable）

```dart
// GoRouter 本身是 Listenable
router.addListener(() {
  print('当前路由: ${router.routerDelegate.currentConfiguration}');
});

// 配合 notifier 实现鉴权监听
class AuthNotifier extends ChangeNotifier {
  bool _isLoggedIn = false;
  bool get isLoggedIn => _isLoggedIn;

  void login() { _isLoggedIn = true; notifyListeners(); }
  void logout() { _isLoggedIn = false; notifyListeners(); }
}

final authNotifier = AuthNotifier();

final router = GoRouter(
  refreshListenable: authNotifier, // 当 notifier 变化时重新执行 redirect
  redirect: (context, state) {
    if (!authNotifier.isLoggedIn) return '/login';
    return null;
  },
  routes: [...],
);
```

---

## 7. 完整实战示例

### 7.1 原生 Navigator 2.0（无第三方库）

```dart
// main.dart
void main() => runApp(MyApp());

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final AppRouterDelegate _delegate;
  final _parser = AppRouteParser();

  @override
  void initState() {
    super.initState();
    _delegate = AppRouterDelegate();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Nav2 Demo',
      routerDelegate: _delegate,
      routeInformationParser: _parser,
    );
  }
}

// router_delegate.dart
class AppRouterDelegate extends RouterDelegate<Uri>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<Uri> {

  @override
  final navigatorKey = GlobalKey<NavigatorState>();

  Uri _currentUri = Uri.parse('/');

  void navigate(String path) {
    _currentUri = Uri.parse(path);
    notifyListeners();
  }

  @override
  Uri get currentConfiguration => _currentUri;

  @override
  Future<void> setNewRoutePath(Uri uri) async {
    _currentUri = uri;
  }

  List<Page> get _pages {
    final pages = [
      MaterialPage(
        key: ValueKey('/'),
        child: HomeScreen(onNavigate: navigate),
      ),
    ];

    if (_currentUri.pathSegments.isNotEmpty) {
      switch (_currentUri.pathSegments.first) {
        case 'detail':
          final id = _currentUri.pathSegments.length > 1
              ? _currentUri.pathSegments[1]
              : null;
          pages.add(MaterialPage(
            key: ValueKey('detail-$id'),
            child: DetailScreen(id: id, onBack: () => navigate('/')),
          ));
          break;
        case '404':
          pages.add(MaterialPage(
            key: ValueKey('404'),
            child: NotFoundScreen(),
          ));
          break;
      }
    }

    return pages;
  }

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: _pages,
      onPopPage: (route, result) {
        if (!route.didPop(result)) return false;
        navigate('/');
        return true;
      },
    );
  }
}

// route_parser.dart
class AppRouteParser extends RouteInformationParser<Uri> {
  @override
  Future<Uri> parseRouteInformation(RouteInformation info) async {
    return info.uri;
  }

  @override
  RouteInformation restoreRouteInformation(Uri uri) {
    return RouteInformation(uri: uri);
  }
}
```

### 7.2 GoRouter 典型项目结构

```dart
// router/app_router.dart
class AppRouter {
  static final _rootKey = GlobalKey<NavigatorState>();

  static GoRouter create(AuthNotifier auth) => GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/',
    debugLogDiagnostics: true,
    refreshListenable: auth,
    redirect: AppRouter._redirect(auth),
    routes: AppRouter._routes,
    errorBuilder: (ctx, state) => ErrorPage(error: state.error),
  );

  static GoRouterRedirect _redirect(AuthNotifier auth) {
    return (context, state) {
      final loggedIn = auth.isLoggedIn;
      final onAuth = state.matchedLocation.startsWith('/auth');
      if (!loggedIn && !onAuth) return '/auth/login';
      if (loggedIn && onAuth) return '/';
      return null;
    };
  }

  static final List<RouteBase> _routes = [
    GoRoute(path: '/auth/login', builder: (ctx, state) => LoginPage()),
    StatefulShellRoute.indexedStack(
      builder: (ctx, state, shell) => MainScaffold(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/',
            builder: (ctx, state) => HomePage(),
            routes: [
              GoRoute(
                path: 'detail/:id',
                builder: (ctx, state) => DetailPage(
                  id: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (ctx, state) => ProfilePage()),
        ]),
      ],
    ),
  ];
}

// main.dart
void main() {
  final auth = AuthNotifier();
  runApp(MyApp(auth: auth));
}

class MyApp extends StatelessWidget {
  final AuthNotifier auth;
  const MyApp({required this.auth, super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: AppRouter.create(auth),
    );
  }
}
```

---

## 8. 常见场景速查

| 场景 | Navigator 1.0 | GoRouter |
|------|--------------|----------|
| 普通跳转 | `Navigator.push(ctx, route)` | `context.go('/path')` |
| 命名路由跳转 | `Navigator.pushNamed(ctx, '/path')` | `context.goNamed('name')` |
| 传递参数 | `arguments: data` | `extra: data` 或路径参数 |
| 返回上一页 | `Navigator.pop(ctx)` | `context.pop()` |
| 携带返回值 | `Navigator.pop(ctx, value)` | `context.pop(value)` |
| 清空栈跳转 | `pushAndRemoveUntil` | `context.go('/')` |
| 替换当前页 | `pushReplacement` | `context.pushReplacement()` |
| 底部弹窗 | `showModalBottomSheet` | 同左（showModalBottomSheet） |
| 对话框 | `showDialog` | 同左（showDialog） |
| Tab 保持状态 | 手动维护 IndexedStack | `StatefulShellRoute` |
| Deep Link | 不支持 | 原生支持 |
| URL 同步（Web） | 不支持 | 原生支持 |
| 全局鉴权重定向 | 在各页面判断 | `redirect` 回调 |
| 监听路由变化 | `RouteObserver` | `router.addListener` |

### WillPopScope（拦截 Back 按钮）

```dart
// Navigator 1.0
WillPopScope(
  onWillPop: () async {
    // 返回 false 阻止退出
    return await showConfirmDialog(context) ?? false;
  },
  child: MyPage(),
)

// Flutter 3.12+ 推荐 PopScope
PopScope(
  canPop: false,
  onPopInvoked: (didPop) {
    if (!didPop) {
      // 处理 back 逻辑
    }
  },
  child: MyPage(),
)
```

### 嵌套 Navigator（局部导航，如 Tab 内部）

```dart
class TabPage extends StatefulWidget {
  @override
  State<TabPage> createState() => _TabPageState();
}

class _TabPageState extends State<TabPage> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: _navigatorKey,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/': return MaterialPageRoute(builder: (_) => TabHome());
          case '/sub': return MaterialPageRoute(builder: (_) => TabSub());
          default: return null;
        }
      },
    );
  }
}
```

### 传递复杂对象（GoRouter extra）

```dart
// 跳转时传递
context.push('/detail', extra: MyModel(id: 1, name: 'test'));

// 接收
GoRoute(
  path: '/detail',
  builder: (context, state) {
    final model = state.extra as MyModel;
    return DetailPage(model: model);
  },
)

// 注意：extra 不序列化，刷新/深链接时会丢失
// 深链接场景推荐用路径参数或查询参数
```

---

## 参考资料

- [Flutter Navigation & Routing 官方文档](https://docs.flutter.dev/ui/navigation)
- [GoRouter 官方文档](https://pub.dev/packages/go_router)
- [Learning Flutter's new navigation and routing system](https://medium.com/flutter/learning-flutters-new-navigation-and-routing-system-7c9068155ade)
- [Navigator 2.0 API 源码](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/widgets/navigator.dart)
