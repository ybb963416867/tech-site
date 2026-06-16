---
title: "Compose_remember系列详解"
description: "1. [重组基础概念](重组基础概念) 2. [remember](remember) 3. [rememberSaveable](remembersaveable) 4. [rememberUpdatedState](remembr..."
pubDate: 2026-06-16
category: "Jetpack Compose"
tags: [Array, API]
draft: false
---
# Jetpack Compose remember 系列详解

## 目录

1. [重组基础概念](#重组基础概念)
2. [remember](#remember)
3. [rememberSaveable](#remembersaveable)
4. [rememberUpdatedState](#remembrupdatedstate)
5. [rememberCoroutineScope](#remembercoroutinescope)
6. [rememberLazyListState 等 rememberXxxState](#rememberlazyliststate-等-rememberxxxstate)
7. [derivedStateOf](#derivedstateof)
8. [produceState](#producestate)
9. [snapshotFlow](#snapshotflow)
10. [作用域对比总结](#作用域对比总结)
11. [常见错误与陷阱](#常见错误与陷阱)
12. [最佳实践](#最佳实践)

---

## 重组基础概念

理解 `remember` 系列之前，必须先理解**重组（Recomposition）**。

### 什么是重组

```
State 发生变化
      │
      ▼
读取该 State 的 Composable 函数被重新执行（重组）
      │
      ▼
函数内所有局部变量被重新初始化
      │
      ▼
UI 更新
```

```kotlin
@Composable
fun Counter() {
    // ❌ 每次重组 count 都被重置为 0
    var count = 0

    Button(onClick = { count++ }) {
        Text("Count: $count")   // 永远显示 0
    }
}
```

重组时普通变量会被重新创建，`remember` 的作用就是**在重组之间保存数据**。

### Composable 的生命周期

```
进入组合（onActive）
      │
      ▼  ← remember 在此初始化，只执行一次
   重组 ←──────────────────────┐
      │                        │
      │  State 变化触发重组 ───┘
      │
      ▼
离开组合（onDispose）
      │
      ▼  ← remember 的数据在此销毁
```

---

## remember

### 基本用法

```kotlin
@Composable
fun Counter() {
    // ✅ count 在重组间保持，只有第一次进入组合时初始化
    var count by remember { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```

### remember 的本质

```kotlin
// remember 接收一个 calculation lambda
// 只在第一次组合时执行 lambda，之后重组直接返回缓存值
val value = remember { expensiveCalculation() }

// 等价于（伪代码）
val value = if (isFirstComposition) {
    expensiveCalculation().also { cache = it }
} else {
    cache
}
```

### remember 与 key（条件重新计算）

当 key 变化时，`remember` 会丢弃旧值，重新执行 lambda：

```kotlin
@Composable
fun UserAvatar(userId: String) {
    // userId 变化时重新创建 painter，否则复用缓存
    val painter = remember(userId) {
        loadAvatarPainter(userId)
    }
    Image(painter = painter, contentDescription = null)
}
```

```kotlin
// 多个 key
val result = remember(key1, key2) {
    heavyCompute(key1, key2)
}

// 无 key：整个 Composable 生命周期内只计算一次
val singleton = remember { MyObject() }
```

### remember 存储各种类型

```kotlin
@Composable
fun Demo() {
    // State（最常见）
    var text by remember { mutableStateOf("") }

    // 普通对象（避免重复创建开销）
    val paint = remember { Paint().apply { color = android.graphics.Color.RED } }

    // 集合（注意：List 本身引用不变，内容变化不触发重组）
    val items = remember { mutableStateListOf("A", "B", "C") }
    val map   = remember { mutableStateMapOf("key" to "value") }

    // Lambda / 回调
    val onClick = remember { { println("clicked") } }

    // 带初始化逻辑的对象
    val animator = remember {
        ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 300
            repeatMode = ValueAnimator.REVERSE
        }
    }
}
```

### remember 的作用域

```
Composable 函数（A）
├── remember { }   ← 绑定到 A 的生命周期
│                    A 离开组合时销毁
│
├── if (condition) {
│       remember { }  ← 绑定到这个 if 分支
│                       condition 变为 false 时销毁
│   }
│
└── LazyColumn {
        items(list) { item ->
            remember(item.id) { }  ← 绑定到每个列表项
                                     列表项离开屏幕时销毁
        }
    }
```

```kotlin
@Composable
fun ConditionalRemember(showDetail: Boolean) {
    if (showDetail) {
        // 这个 remember 只在 showDetail=true 时存在
        // showDetail 变为 false 时，DetailState 被销毁
        val detailState = remember { DetailState() }
        DetailView(detailState)
    }
}
```

---

## rememberSaveable

### 与 remember 的区别

| | `remember` | `rememberSaveable` |
|---|---|---|
| 重组时保持 | ✅ | ✅ |
| 屏幕旋转（配置变更）后保持 | ❌ | ✅ |
| 进程被杀死后恢复 | ❌ | ✅ |
| 存储位置 | 内存 | `Bundle`（系统保存） |
| 支持类型 | 任意 | Bundle 支持的类型 + 自定义 Saver |

### 基本用法

```kotlin
@Composable
fun SearchBar() {
    // 屏幕旋转后 query 依然保留
    var query by rememberSaveable { mutableStateOf("") }

    TextField(
        value = query,
        onValueChange = { query = it },
        placeholder = { Text("搜索...") }
    )
}
```

### 支持的基本类型

```kotlin
// 直接支持（Bundle 原生类型）
rememberSaveable { mutableStateOf(0) }          // Int
rememberSaveable { mutableStateOf(0L) }         // Long
rememberSaveable { mutableStateOf(0f) }         // Float
rememberSaveable { mutableStateOf(false) }      // Boolean
rememberSaveable { mutableStateOf("text") }     // String
rememberSaveable { mutableStateOf(intArrayOf()) } // 基本类型数组
```

### 自定义 Saver（保存复杂对象）

```kotlin
data class FormState(
    val name: String = "",
    val age: Int = 0,
    val agreed: Boolean = false
)

// 方式一：mapSaver（推荐，可读性好）
val FormStateSaver = run {
    val nameKey = "name"
    val ageKey = "age"
    val agreedKey = "agreed"
    mapSaver(
        save = { mapOf(nameKey to it.name, ageKey to it.age, agreedKey to it.agreed) },
        restore = { FormState(it[nameKey] as String, it[ageKey] as Int, it[agreedKey] as Boolean) }
    )
}

// 方式二：listSaver（顺序存储）
val FormStateSaverList = listSaver<FormState, Any>(
    save = { listOf(it.name, it.age, it.agreed) },
    restore = { FormState(it[0] as String, it[1] as Int, it[2] as Boolean) }
)

// 使用
@Composable
fun RegistrationForm() {
    var formState by rememberSaveable(stateSaver = FormStateSaver) {
        mutableStateOf(FormState())
    }
    // ...
}
```

### Parcelize 方式（最简洁）

```kotlin
@Parcelize
data class UserFilter(
    val keyword: String = "",
    val category: Int = 0
) : Parcelable

@Composable
fun FilterScreen() {
    // Parcelable 直接支持，无需自定义 Saver
    var filter by rememberSaveable { mutableStateOf(UserFilter()) }
}
```

### rememberSaveable 的 key

```kotlin
// 和 remember 一样支持 key
// key 变化时会重新初始化（但不会持久化旧值）
var state by rememberSaveable(userId) { mutableStateOf(UserState(userId)) }
```

### 何时用 rememberSaveable vs ViewModel

```
数据重要程度：
  UI 临时状态（输入框、滚动位置、展开折叠）→ rememberSaveable
  业务数据、需要跨屏幕共享              → ViewModel
  需要从网络/数据库加载                 → ViewModel

生命周期：
  rememberSaveable 随 Composable 销毁而销毁
  ViewModel 随 Activity/Fragment 销毁而销毁
```

---

## rememberUpdatedState

### 问题场景

```kotlin
@Composable
fun Timer(onTimeout: () -> Unit) {
    // ❌ 问题：LaunchedEffect 只启动一次（key = Unit）
    // 但 onTimeout 可能在之后的重组中变化（新的 lambda）
    // 协程内捕获的是旧的 onTimeout
    LaunchedEffect(Unit) {
        delay(3000)
        onTimeout()   // 调用的是第一次组合时的 onTimeout
    }
}
```

### rememberUpdatedState 的解法

```kotlin
@Composable
fun Timer(onTimeout: () -> Unit) {
    // rememberUpdatedState 始终持有最新的 onTimeout
    // 即使 onTimeout lambda 在重组中变化，latestOnTimeout.value 也是最新的
    val latestOnTimeout by rememberUpdatedState(onTimeout)

    LaunchedEffect(Unit) {
        delay(3000)
        latestOnTimeout()   // ✅ 调用的是最新的 onTimeout
    }
}
```

### 工作原理

```kotlin
// rememberUpdatedState 内部实现（简化）
@Composable
fun <T> rememberUpdatedState(newValue: T): State<T> {
    return remember {
        mutableStateOf(newValue)        // 第一次：创建 State
    }.also {
        it.value = newValue             // 每次重组：更新为最新值
    }
}
```

### 典型使用场景

```kotlin
// 场景一：LaunchedEffect 内使用外部传入的 callback
@Composable
fun EventListener(
    eventSource: Flow<Event>,
    onEvent: (Event) -> Unit    // 父组件可能传入不同的 lambda
) {
    val latestOnEvent by rememberUpdatedState(onEvent)
    LaunchedEffect(eventSource) {
        eventSource.collect { event ->
            latestOnEvent(event)    // 始终用最新的处理函数
        }
    }
}

// 场景二：DisposableEffect 内的 callback
@Composable
fun LifecycleObserver(onResume: () -> Unit) {
    val latestOnResume by rememberUpdatedState(onResume)
    val lifecycle = LocalLifecycleOwner.current.lifecycle

    DisposableEffect(lifecycle) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                latestOnResume()    // 始终用最新的
            }
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer) }
    }
}
```

### rememberUpdatedState vs remember(key)

```
remember(callback) { }
  → key 变化时重启 Effect（有副作用）
  → 适合：key 变化时确实需要重新执行逻辑

rememberUpdatedState(callback)
  → 不重启 Effect，只更新引用
  → 适合：Effect 生命周期不变，只需要用最新的 callback
```

---

## rememberCoroutineScope

### 作用

获取一个绑定到当前 Composable 生命周期的 `CoroutineScope`，用于在**事件回调**（非 Composable 上下文）中启动协程。

```kotlin
@Composable
fun LoginButton(viewModel: LoginViewModel) {
    // 绑定到当前 Composable，离开组合时自动取消所有协程
    val scope = rememberCoroutineScope()

    Button(onClick = {
        // onClick 是普通函数，不能直接调用 suspend
        // 通过 scope.launch 启动协程
        scope.launch {
            viewModel.login()
        }
    }) {
        Text("登录")
    }
}
```

### 与 LaunchedEffect 的区别

| | `LaunchedEffect` | `rememberCoroutineScope` |
|---|---|---|
| 启动时机 | 进入组合时自动启动 | 手动调用 `scope.launch` |
| 适用场景 | 组合时自动执行的副作用 | 事件回调（点击、手势）中的异步操作 |
| 取消时机 | key 变化或离开组合 | 离开组合 |
| 能否在非 Composable 中用 | ❌ | ✅（在 lambda 内） |

```kotlin
@Composable
fun Demo() {
    val scope = rememberCoroutineScope()

    // ✅ rememberCoroutineScope：手势回调中启动协程
    Box(modifier = Modifier.pointerInput(Unit) {
        detectTapGestures {
            scope.launch {
                delay(200)
                println("延迟后执行")
            }
        }
    })

    // ✅ LaunchedEffect：进入组合自动执行
    LaunchedEffect(Unit) {
        println("组合时自动执行")
    }
}
```

### 典型场景：动画 + 点击

```kotlin
@Composable
fun AnimatedButton(onClick: () -> Unit) {
    val scale = remember { Animatable(1f) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .graphicsLayer { scaleX = scale.value; scaleY = scale.value }
            .clickable {
                scope.launch {
                    scale.animateTo(0.85f, tween(80))
                    scale.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy))
                    onClick()
                }
            }
    ) {
        Text("点击我")
    }
}
```

---

## rememberLazyListState 等 rememberXxxState

### 常见的 rememberXxxState

```kotlin
@Composable
fun StatesDemo() {
    // 列表滚动状态
    val listState = rememberLazyListState(
        initialFirstVisibleItemIndex = 0,
        initialFirstVisibleItemScrollOffset = 0
    )

    // 普通滚动状态
    val scrollState = rememberScrollState(initial = 0)

    // Pager 状态
    val pagerState = rememberPagerState(
        initialPage = 0,
        pageCount = { 5 }
    )

    // 下拉刷新状态
    val pullRefreshState = rememberPullRefreshState(
        refreshing = false,
        onRefresh = { }
    )

    // DrawerState
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)

    // BottomSheet 状态
    val sheetState = rememberModalBottomSheetState()

    // SnackbarHostState
    val snackbarHostState = remember { SnackbarHostState() }
}
```

### LazyListState 详细用法

```kotlin
@Composable
fun ScrollableList() {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    // 读取滚动信息
    val firstVisibleIndex by remember {
        derivedStateOf { listState.firstVisibleItemIndex }
    }
    val isScrolled by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    Box {
        LazyColumn(state = listState) {
            items(100) { index ->
                Text("Item $index", modifier = Modifier.padding(16.dp))
            }
        }

        // 滚动到顶部按钮
        AnimatedVisibility(
            visible = isScrolled,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        ) {
            FloatingActionButton(
                onClick = {
                    scope.launch {
                        listState.animateScrollToItem(0)   // 动画滚动
                        // listState.scrollToItem(0)       // 立即跳转
                    }
                }
            ) {
                Icon(Icons.Default.KeyboardArrowUp, contentDescription = "回顶部")
            }
        }
    }
}
```

### 这些 State 本质上也是 remember

```kotlin
// rememberLazyListState 内部（简化）
@Composable
fun rememberLazyListState(...): LazyListState {
    return remember {
        LazyListState(...)
    }
}
// 所以它们的作用域和生命周期与 remember 完全一致
```

---

## derivedStateOf

### 作用

从一个或多个 State 派生出新 State，**只有派生结果变化时才触发重组**，避免无效重组。

### 问题场景

```kotlin
@Composable
fun BadExample() {
    val listState = rememberLazyListState()

    // ❌ 问题：listState.firstVisibleItemIndex 每次滚动都变化
    // 导致 BadExample 每帧都重组，即使 showButton 结果没变
    val showButton = listState.firstVisibleItemIndex > 0

    if (showButton) {
        BackToTopButton()
    }
}
```

### derivedStateOf 的解法

```kotlin
@Composable
fun GoodExample() {
    val listState = rememberLazyListState()

    // ✅ derivedStateOf：只有 showButton 的值（true/false）变化时才重组
    // firstVisibleItemIndex 从 0→1 触发重组（false→true）
    // firstVisibleItemIndex 从 1→2 不触发重组（true→true）
    val showButton by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    if (showButton) {
        BackToTopButton()
    }
}
```

### 更多示例

```kotlin
@Composable
fun CartScreen(items: List<CartItem>) {
    // 购物车总价：items 变化时重新计算，结果不变时不重组
    val totalPrice by remember(items) {
        derivedStateOf {
            items.sumOf { it.price * it.quantity }
        }
    }

    // 表单校验：多个输入框的综合校验结果
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    val isFormValid by remember {
        derivedStateOf {
            name.isNotBlank() &&
            email.contains("@") &&
            phone.length == 11
        }
    }

    Button(enabled = isFormValid, onClick = { }) {
        Text("提交")
    }
}
```

### derivedStateOf vs remember(key)

```kotlin
// remember(key)：key 变化时重新计算，结果无论是否变化都触发重组
val result1 = remember(inputState) { compute(inputState) }

// derivedStateOf：读取的 State 变化时重新计算，只有结果变化才重组
val result2 by remember { derivedStateOf { compute(inputState) } }

// 选择原则：
// 计算结果可能和上次相同 → 用 derivedStateOf（减少无效重组）
// 计算结果一定和上次不同 → 用 remember(key) 即可
```

---

## produceState

### 作用

将**非 Compose 的异步数据源**（Flow、LiveData、回调、网络请求）转换为 Compose State。

```kotlin
// 基本结构
@Composable
fun <T> produceState(
    initialValue: T,
    vararg keys: Any?,
    producer: suspend ProduceStateScope<T>.() -> Unit
): State<T>
```

### 典型用法

```kotlin
// 从网络加载数据
@Composable
fun UserProfile(userId: String) {
    val userState by produceState<Result<User>?>(
        initialValue = null,
        key1 = userId          // userId 变化时重新加载
    ) {
        value = Result.Loading
        value = try {
            Result.Success(userRepository.getUser(userId))
        } catch (e: Exception) {
            Result.Failure(e)
        }
    }

    when (val state = userState) {
        null, Result.Loading -> CircularProgressIndicator()
        is Result.Success    -> UserCard(state.data)
        is Result.Failure    -> ErrorView(state.error)
    }
}

// 订阅 Flow
@Composable
fun NetworkStatus() {
    val isOnline by produceState(initialValue = true) {
        networkMonitor.statusFlow.collect { status ->
            value = status.isOnline
        }
    }
    Text(if (isOnline) "在线" else "离线")
}

// 订阅回调型 API（如传感器）
@Composable
fun SensorValue(): State<Float> = produceState(initialValue = 0f) {
    val listener = SensorEventListener { event ->
        value = event.values[0]
    }
    sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_UI)
    awaitDispose {
        sensorManager.unregisterListener(listener)  // 离开组合时清理
    }
}
```

### produceState vs LaunchedEffect + mutableStateOf

```kotlin
// 两者等价，produceState 是语法糖

// 方式一：produceState
val data by produceState<String?>(initialValue = null, userId) {
    value = loadData(userId)
}

// 方式二：LaunchedEffect + mutableStateOf
var data by remember(userId) { mutableStateOf<String?>(null) }
LaunchedEffect(userId) {
    data = loadData(userId)
}
```

---

## snapshotFlow

### 作用

将 Compose State 转换为 Flow，在协程中**响应 State 变化**。

```kotlin
// snapshotFlow { } 内读取的所有 State，任意一个变化时 Flow 发射新值
val flow: Flow<T> = snapshotFlow { stateValue }
```

### 典型用法

```kotlin
@Composable
fun SearchWithDebounce() {
    var query by remember { mutableStateOf("") }
    val viewModel: SearchViewModel = viewModel()

    // 将 query State 转为 Flow，做防抖搜索
    LaunchedEffect(Unit) {
        snapshotFlow { query }
            .distinctUntilChanged()
            .debounce(300)
            .filter { it.length >= 2 }
            .collect { keyword ->
                viewModel.search(keyword)
            }
    }

    TextField(value = query, onValueChange = { query = it })
}

// 监听列表滚动到底部
@Composable
fun InfiniteScrollList(onLoadMore: () -> Unit) {
    val listState = rememberLazyListState()

    LaunchedEffect(listState) {
        snapshotFlow {
            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()
            val totalItems = listState.layoutInfo.totalItemsCount
            lastVisible?.index to totalItems
        }
        .distinctUntilChanged()
        .collect { (lastIndex, total) ->
            if (lastIndex != null && lastIndex >= total - 3) {
                onLoadMore()    // 距底部 3 条时加载更多
            }
        }
    }

    LazyColumn(state = listState) { /* ... */ }
}
```

### snapshotFlow vs collectAsState

```
collectAsState：Flow → State（在 Composable 中订阅 Flow）
snapshotFlow ：State → Flow（在协程中响应 State 变化）

互为逆操作：
  Flow ──collectAsState──▶ State（用于 UI 展示）
  State ──snapshotFlow──▶ Flow（用于副作用处理，如防抖、日志）
```

---

## 作用域对比总结

### 生命周期对比

```
Activity / Fragment
└── Composable 树
    ├── remember { }
    │     生命周期 = Composable 在组合树中的存在时间
    │     Composable 离开组合 → 销毁
    │
    ├── rememberSaveable { }
    │     生命周期 = remember + 配置变更存活 + 进程恢复存活
    │     真正销毁：用户按返回键、手动清除
    │
    ├── rememberCoroutineScope
    │     绑定到 Composable，离开组合时取消所有协程
    │
    └── ViewModel（viewModel()）
          生命周期 = Activity/Fragment ViewModelStore
          屏幕旋转不销毁，只有 Activity finish 才销毁
```

### 各 API 速查表

| API | 触发重组 | 重组后保持 | 旋转后保持 | 进程恢复 | 主要用途 |
|-----|---------|-----------|-----------|---------|---------|
| `remember { }` | 否 | ✅ | ❌ | ❌ | 缓存计算结果、对象 |
| `remember(key) { }` | key 变化时重新计算 | ✅ | ❌ | ❌ | 依赖 key 的缓存 |
| `rememberSaveable { }` | 否 | ✅ | ✅ | ✅ | UI 状态持久化 |
| `rememberUpdatedState` | 否（更新引用） | ✅ | ❌ | ❌ | Effect 内用最新 callback |
| `rememberCoroutineScope` | 否 | ✅ | ❌ | ❌ | 事件回调中启动协程 |
| `derivedStateOf` | 派生值变化时 | ✅ | ❌ | ❌ | 减少无效重组 |
| `produceState` | value 变化时 | ✅ | ❌ | ❌ | 异步数据 → State |
| `snapshotFlow` | — | — | — | — | State → Flow 转换 |

---

## 常见错误与陷阱

### 陷阱一：在 remember 外创建 State

```kotlin
// ❌ 每次重组都创建新的 State，计数永远不累积
@Composable
fun Bad() {
    val count = mutableStateOf(0)   // 没有 remember 包裹
    Button(onClick = { count.value++ }) { Text("${count.value}") }
}

// ✅ 正确
@Composable
fun Good() {
    val count = remember { mutableStateOf(0) }
    Button(onClick = { count.value++ }) { Text("${count.value}") }
}
```

### 陷阱二：remember 内捕获了会变化的变量

```kotlin
// ❌ name 变化时，onClick 仍然捕获的是旧的 name
@Composable
fun Bad(name: String) {
    val onClick = remember { { println("Hello $name") } }
    Button(onClick = onClick) { Text("点击") }
}

// ✅ 方式一：将 name 加入 key
@Composable
fun Good1(name: String) {
    val onClick = remember(name) { { println("Hello $name") } }
    Button(onClick = onClick) { Text("点击") }
}

// ✅ 方式二：用 rememberUpdatedState
@Composable
fun Good2(name: String) {
    val latestName by rememberUpdatedState(name)
    val onClick = remember { { println("Hello ${latestName}") } }
    Button(onClick = onClick) { Text("点击") }
}
```

### 陷阱三：滥用 derivedStateOf

```kotlin
// ❌ 没必要用 derivedStateOf（count 变化结果肯定变化）
val doubled by remember { derivedStateOf { count * 2 } }

// ✅ 直接用 remember(count)
val doubled = remember(count) { count * 2 }

// ✅ 需要 derivedStateOf 的场景：结果可能不变
val isEven by remember { derivedStateOf { count % 2 == 0 } }
// count: 1→3 时 isEven 仍是 false，不触发重组
```

### 陷阱四：在循环/条件内使用 remember

```kotlin
// ❌ 违反 Compose 规则：remember 必须在固定位置调用
@Composable
fun Bad(condition: Boolean) {
    if (condition) {
        val state = remember { mutableStateOf(0) }  // 位置不固定！
    }
}

// ✅ 正确：条件放在 remember 外部
@Composable
fun Good(condition: Boolean) {
    val state = remember { mutableStateOf(0) }
    if (condition) {
        // 使用 state
    }
}

// ✅ 或者将条件内容抽成独立 Composable
@Composable
fun Good2(condition: Boolean) {
    if (condition) {
        ConditionalContent()   // 独立 Composable，有自己的 remember
    }
}

@Composable
fun ConditionalContent() {
    val state = remember { mutableStateOf(0) }  // 位置固定
}
```

### 陷阱五：rememberCoroutineScope 在协程内修改 UI State

```kotlin
// ❌ 在后台线程修改 State（可能崩溃）
val scope = rememberCoroutineScope()
scope.launch(Dispatchers.IO) {
    val data = fetchData()
    uiState = data  // 在 IO 线程修改 State！
}

// ✅ 切回主线程
scope.launch(Dispatchers.IO) {
    val data = fetchData()
    withContext(Dispatchers.Main) {
        uiState = data
    }
}

// ✅ 或者直接用默认调度器（Main）+ viewModelScope 处理 IO
scope.launch {  // 默认 Main
    val data = withContext(Dispatchers.IO) { fetchData() }
    uiState = data
}
```

---

## 最佳实践

### 1. 选择正确的 API

```
需要缓存对象/计算结果          → remember { }
需要在旋转后保持 UI 状态       → rememberSaveable { }
Effect 内需要最新的 callback   → rememberUpdatedState
事件回调中启动协程             → rememberCoroutineScope
减少高频 State 的无效重组      → derivedStateOf
异步数据转 State               → produceState
State 转 Flow 做副作用处理     → snapshotFlow
```

### 2. State 应尽量靠近使用处

```kotlin
// ❌ 所有 State 堆在顶层（即使只有一个子组件用）
@Composable
fun Screen() {
    var isExpanded by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    // ...
    ExpandableSection(isExpanded, inputText)
}

// ✅ State 放在实际需要的层级
@Composable
fun Screen() {
    ExpandableSection()    // State 在内部管理
}

@Composable
fun ExpandableSection() {
    var isExpanded by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    // ...
}
```

### 3. 昂贵对象用 remember 缓存

```kotlin
@Composable
fun ChartView(data: List<Float>) {
    // ✅ Paint 对象创建开销大，用 remember 避免每次重组重新创建
    val paint = remember {
        Paint().apply {
            isAntiAlias = true
            style = Paint.Style.STROKE
            strokeWidth = 4f
        }
    }

    // ✅ 数据处理结果缓存（data 变化时重新计算）
    val processedData = remember(data) {
        data.map { it / data.max() }    // 归一化
    }

    Canvas(modifier = Modifier.fillMaxSize()) {
        // 使用缓存的 paint 和 processedData 绘制
    }
}
```

### 4. 合理使用 key 控制重新计算时机

```kotlin
@Composable
fun FilteredList(filter: String, sortOrder: SortOrder) {
    val items by viewModel.items.collectAsStateWithLifecycle()

    // filter 或 sortOrder 变化时重新处理，items 变化时也重新处理
    val filteredItems = remember(items, filter, sortOrder) {
        items
            .filter { it.name.contains(filter, ignoreCase = true) }
            .sortedWith(sortOrder.comparator)
    }

    LazyColumn {
        items(filteredItems, key = { it.id }) { item ->
            ItemRow(item)
        }
    }
}
```

---

## 总结

```
重组时数据保持
  └── remember { }               基础缓存，绑定 Composable 生命周期

配置变更数据保持
  └── rememberSaveable { }       Bundle 持久化，UI 状态首选

Effect 内用最新值
  └── rememberUpdatedState       更新引用而不重启 Effect

事件回调启协程
  └── rememberCoroutineScope     手动控制协程启动时机

减少无效重组
  └── derivedStateOf             结果不变则不触发重组

异步数据转 State
  └── produceState               网络/Flow/回调 → State

State 转 Flow
  └── snapshotFlow               防抖/日志/副作用处理
```

核心原则：**remember 绑定 Composable 生命周期，重组间保持数据；选择哪个 API 取决于数据的持久化需求和触发重组的精确度要求。**
