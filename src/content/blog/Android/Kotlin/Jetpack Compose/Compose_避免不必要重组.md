---
title: "Compose_避免不必要重组"
description: "1. [重组触发原理](重组触发原理) 2. [参数稳定性](参数稳定性) 3. [State 读取位置优化](state读取位置优化) 4. [derivedStateOf](derivedstateof) 5. [key 的正确使..."
pubDate: 2026-06-16
category: "Jetpack Compose"
tags: [Notes]
draft: false
---
# Jetpack Compose 避免不必要重组

## 目录

1. [重组触发原理](#重组触发原理)
2. [参数稳定性](#参数稳定性)
3. [State 读取位置优化](#state-读取位置优化)
4. [derivedStateOf](#derivedstateof)
5. [key 的正确使用](#key-的正确使用)
6. [Lambda 稳定性](#lambda-稳定性)
7. [List 稳定性问题](#list-稳定性问题)
8. [拆分 Composable](#拆分-composable)
9. [graphicsLayer 跳过重组](#graphicslayer-跳过重组)
10. [Modifier 优化](#modifier-优化)
11. [工具：检测无效重组](#工具检测无效重组)
12. [总结速查表](#总结速查表)

---

## 重组触发原理

### 什么时候会重组

```
触发重组的条件（同时满足）：
  1. Composable 读取的 State 发生了变化
  2. 传入的参数被 Compose 判定为"不稳定"或"已变化"
```

### Compose 决定是否跳过重组的逻辑

```
新参数到来时，Compose 检查每个参数：

参数类型稳定？
  ├─ 是 → 比较新旧值是否相等
  │         相等 → 跳过重组 ✅
  │         不等 → 执行重组
  │
  └─ 否 → 无法确定是否变化 → 直接执行重组（保守策略）
```

```kotlin
// Compose 用 == 比较参数是否变化
// 稳定类型才会做这个比较，不稳定类型直接重组
```

---

## 参数稳定性

### 稳定 vs 不稳定

Compose 编译器会分析每个类型，打上稳定或不稳定标记：

```
稳定类型（Compose 信任，会做相等比较）：
  ✅ 基本类型：Int, Long, Float, Double, Boolean, Char, String
  ✅ 函数类型：() -> Unit，(T) -> R
  ✅ 所有属性都是 val 且类型也稳定的数据类
  ✅ 标注了 @Stable 或 @Immutable 的类
  ✅ Compose 内置类型：Color, Dp, Offset, Size...

不稳定类型（Compose 不信任，直接重组）：
  ❌ List, Set, Map（接口，无法确定实现是否可变）
  ❌ 包含 var 属性的类
  ❌ 没有标注的普通类（即使实际上不可变）
  ❌ 来自其他模块未被 Compose 编译器分析的类
```

### @Immutable

告知 Compose：**此类所有属性永远不会变化**，是最强的稳定承诺：

```kotlin
// ❌ 普通数据类，Compose 不确定是否稳定
data class User(val name: String, val age: Int)

// ✅ 标注 @Immutable，Compose 信任此类，相同实例不触发重组
@Immutable
data class User(val name: String, val age: Int)

@Composable
fun UserCard(user: User) {
    // user 未变化时，整个 UserCard 被跳过
    Text(user.name)
}
```

### @Stable

告知 Compose：**此类的 == 结果可信**，且公开属性变化时会通知 Compose。
适合属性是 `var` 但受控变化的类：

```kotlin
@Stable
class UiState {
    var isLoading by mutableStateOf(false)   // var，但通过 State 通知变化
    var data by mutableStateOf<List<Item>>(emptyList())
    var error by mutableStateOf<String?>(null)
}

// @Stable 告知 Compose：
// 1. 两个实例 == 相等 → 结果可信
// 2. 属性变化会通过 State 通知
// → Compose 可以安全地做跳过判断
```

### 实践：数据类加 @Immutable

```kotlin
// 场景：ViewModel 暴露 UiState 给 Composable
// ❌ 普通数据类：每次 copy() 都是新对象，内容相同也触发重组
data class HomeUiState(
    val title: String = "",
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false
)

// ✅ 加 @Immutable：内容相同时跳过重组
@Immutable
data class HomeUiState(
    val title: String = "",
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false
)

// ViewModel
class HomeViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState = _uiState.asStateFlow()

    fun updateTitle(title: String) {
        _uiState.update { it.copy(title = title) }
        // 若 items 和 isLoading 未变，使用 @Immutable 的 HomeUiState
        // 则读取 items 的 Composable 不会重组
    }
}
```

---

## State 读取位置优化

**读取 State 的位置决定了重组的范围。** 越晚读取，影响范围越小。

### 三个阶段读取的影响

```
Composition 阶段读取 State → 触发 Composition + Layout + Drawing（最大影响）
Layout 阶段读取 State      → 触发 Layout + Drawing（跳过 Composition）
Drawing 阶段读取 State     → 只触发 Drawing（最小影响，最优）
```

### 把 State 读取推迟到 Drawing 阶段

```kotlin
var color by remember { mutableStateOf(Color.Red) }

// ❌ Composition 阶段读取：color 变化触发整个 Composable 重组
Box(modifier = Modifier.background(color).size(100.dp))

// ✅ Drawing 阶段读取：color 变化只触发重绘，不重组
Box(
    modifier = Modifier
        .size(100.dp)
        .drawBehind {
            drawRect(color)   // Drawing 阶段才读取 color
        }
)
```

### 把 State 读取推迟到 Layout 阶段

```kotlin
var offsetY by remember { mutableStateOf(0f) }

// ❌ Composition 阶段读取：触发重组
Modifier.offset(y = offsetY.dp)

// ✅ Layout 阶段读取：跳过 Composition，只做 Layout + Drawing
Modifier.offset { IntOffset(0, offsetY.roundToInt()) }
```

### 动画场景的最优实践

```kotlin
// 透明度动画：用 graphicsLayer，完全在 GPU 层，不触发任何 Compose 阶段
val alpha by animateFloatAsState(if (visible) 1f else 0f)

// ❌ Composition 阶段读取
Box(modifier = Modifier.alpha(alpha))        // .alpha() 在 Composition 读取

// ✅ graphicsLayer：Drawing 阶段读取，且由 GPU 直接执行变换
Box(modifier = Modifier.graphicsLayer { this.alpha = alpha })
```

---

## derivedStateOf

**适用场景：从高频变化的 State 派生低频变化的结果**，过滤掉中间无意义的重组。

### 原理

```
没有 derivedStateOf：
  count: 0 → 1 → 2 → 3 → 4 → 5 ...
  isEven: 触发重组 × 每次 count 变化（全部重组）

有 derivedStateOf：
  count: 0 → 1 → 2 → 3 → 4 → 5 ...
  isEven: false → true → false → true ...（只在结果变化时重组）
```

```kotlin
// ❌ count 每次变化都触发读取了 showScrollTop 的 Composable 重组
val showScrollTop = listState.firstVisibleItemIndex > 0

// ✅ firstVisibleItemIndex 从 0→1 才触发重组（false→true）
//    从 1→2，2→3 时 showScrollTop 仍为 true，不触发重组
val showScrollTop by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}
```

### 表单校验场景

```kotlin
@Composable
fun RegisterForm() {
    var name  by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    // ❌ 每次输入字符都重组读取 canSubmit 的 Composable
    val canSubmit = name.isNotBlank() && email.contains("@") && phone.length == 11

    // ✅ 只有校验结果（true/false）变化时才重组
    val canSubmit by remember {
        derivedStateOf {
            name.isNotBlank() && email.contains("@") && phone.length == 11
        }
    }

    // 提交按钮：只在 canSubmit 变化时重组（从不可点击 → 可点击，或反向）
    Button(enabled = canSubmit, onClick = { }) { Text("注册") }
}
```

### derivedStateOf 使用原则

```
需要 derivedStateOf 的条件：
  1. 输入 State 变化频率 > 输出结果变化频率
  2. 输出是布尔值（true/false）、枚举、有限状态

不需要 derivedStateOf 的场景：
  输入变化必然导致输出变化 → 用 remember(key) 即可
  val doubled = remember(count) { count * 2 }  // count 变化，doubled 必然变化
```

---

## key 的正确使用

### LazyList 中的 key

没有 key 时，LazyList 按位置匹配旧项，插入/删除会导致大量不必要重组：

```kotlin
// ❌ 无 key：在列表头部插入一项，所有项都重组
LazyColumn {
    items(users) { user ->
        UserRow(user)
    }
}

// ✅ 有 key：Compose 按 ID 匹配，只有真正变化的项重组
LazyColumn {
    items(users, key = { it.id }) { user ->
        UserRow(user)
    }
}
```

```
插入前：[A, B, C]         插入前：[A, B, C]
插入后：[X, A, B, C]      插入后：[X, A, B, C]

无 key（按位置匹配）：      有 key（按 ID 匹配）：
  位置0: A→X  重组 ❌        X: 新建
  位置1: B→A  重组 ❌        A: 复用，不重组 ✅
  位置2: C→B  重组 ❌        B: 复用，不重组 ✅
  位置3: 新建C               C: 复用，不重组 ✅
```

### key() 函数控制 Composable 身份

```kotlin
// 当数据的逻辑意义变化时，用 key() 强制重建（而非复用旧状态）
@Composable
fun UserProfile(userId: String) {
    key(userId) {
        // userId 变化时，内部所有 remember 被清空，重新初始化
        var isExpanded by remember { mutableStateOf(false) }
        ProfileContent(userId, isExpanded)
    }
}

// 不用 key 的问题：
// userId 从 "A" 变为 "B" 时，isExpanded 的旧值（true）被错误复用
```

---

## Lambda 稳定性

Lambda 是 Compose 中最常见的不稳定来源。

### 问题：每次重组 Lambda 都是新对象

```kotlin
@Composable
fun ParentScreen() {
    var count by remember { mutableStateOf(0) }

    // ❌ 每次 ParentScreen 重组，都创建新的 onClick lambda 对象
    // 导致 ChildButton 参数"变化"，触发不必要重组
    ChildButton(onClick = { println("clicked, count=$count") })
}

@Composable
fun ChildButton(onClick: () -> Unit) {
    Button(onClick = onClick) { Text("Click") }
}
```

### 解法一：rememberUpdatedState（Lambda 不参与重组判断）

```kotlin
@Composable
fun ParentScreen() {
    var count by remember { mutableStateOf(0) }
    val latestCount by rememberUpdatedState(count)

    // ✅ 稳定的 lambda 引用，内部通过 latestCount 读取最新值
    val onClick = remember {
        { println("clicked, count=${latestCount}") }
    }

    ChildButton(onClick = onClick)
}
```

### 解法二：将 Lambda 移到 ViewModel

```kotlin
// ✅ ViewModel 中的函数引用是稳定的
class MyViewModel : ViewModel() {
    var count by mutableStateOf(0)
        private set

    fun onButtonClick() {
        println("clicked, count=$count")
        count++
    }
}

@Composable
fun ParentScreen(viewModel: MyViewModel = viewModel()) {
    // viewModel::onButtonClick 是方法引用，在 Kotlin 中每次都是新对象
    // 但 ViewModel 本身稳定，Compose 编译器可以优化
    ChildButton(onClick = viewModel::onButtonClick)
}
```

### 解法三：@Stable 的函数持有类

```kotlin
@Stable
class ClickHandler(private val viewModel: MyViewModel) {
    val onClick: () -> Unit = { viewModel.onButtonClick() }
}

@Composable
fun ParentScreen(viewModel: MyViewModel = viewModel()) {
    val handler = remember(viewModel) { ClickHandler(viewModel) }
    // handler.onClick 是稳定对象上的稳定属性
    ChildButton(onClick = handler.onClick)
}
```

---

## List 稳定性问题

`List<T>` 接口本身是不稳定的，即使内容没变，Compose 也无法确定，会触发重组。

### 方案一：@Immutable 包装

```kotlin
@Immutable
data class ImmutableList<T>(val items: List<T>)

// ✅ ImmutableList 是稳定的，内容相同时跳过重组
@Composable
fun ItemList(list: ImmutableList<String>) {
    list.items.forEach { Text(it) }
}
```

### 方案二：使用 kotlinx.collections.immutable

```kotlin
// build.gradle
implementation("org.jetbrains.kotlinx:kotlinx-collections-immutable:0.3.7")

// PersistentList 被 Compose 编译器识别为稳定类型
val items: PersistentList<String> = persistentListOf("A", "B", "C")

@Composable
fun ItemList(items: PersistentList<String>) {
    // items 类型稳定，内容相同时跳过
    items.forEach { Text(it) }
}

// ViewModel 中
class ListViewModel : ViewModel() {
    private val _items = MutableStateFlow(persistentListOf<Item>())
    val items = _items.asStateFlow()

    fun addItem(item: Item) {
        _items.update { it.add(item) }   // 返回新的不可变列表
    }
}
```

### 方案三：Compose 编译器配置（强推断稳定性）

```kotlin
// compose_compiler_config.conf
// 强制将特定类视为稳定（适合无法修改源码的第三方库）

// build.gradle
composeCompiler {
    stabilityConfigurationFile = rootProject.layout.projectDirectory
        .file("compose_compiler_config.conf")
}

// compose_compiler_config.conf 内容：
// com.example.MyClass  （将此类视为稳定）
```

---

## 拆分 Composable

**把读取不同 State 的 UI 拆分成独立的 Composable**，让重组范围最小化。

### 问题：大 Composable 包含多个 State

```kotlin
// ❌ 一个大 Composable 读取多个 State
// 任意一个 State 变化，整个 Screen 重组
@Composable
fun BadScreen(viewModel: MyViewModel) {
    val userState by viewModel.userState.collectAsState()
    val listState by viewModel.listState.collectAsState()
    val badgeCount by viewModel.badgeCount.collectAsState()

    Column {
        // badgeCount 变化 → 整个 Column 重组，包括复杂的 UserHeader 和 ItemList
        Badge(count = badgeCount)
        UserHeader(user = userState.user)
        ItemList(items = listState.items)
    }
}
```

### 解法：拆分为独立 Composable

```kotlin
// ✅ 每个 Composable 只读取自己需要的 State
@Composable
fun GoodScreen(viewModel: MyViewModel) {
    Column {
        BadgeSection(viewModel)    // 只读 badgeCount
        UserSection(viewModel)     // 只读 userState
        ListSection(viewModel)     // 只读 listState
    }
}

@Composable
private fun BadgeSection(viewModel: MyViewModel) {
    val badgeCount by viewModel.badgeCount.collectAsState()
    Badge(count = badgeCount)
    // badgeCount 变化 → 只有 BadgeSection 重组
}

@Composable
private fun UserSection(viewModel: MyViewModel) {
    val userState by viewModel.userState.collectAsState()
    UserHeader(user = userState.user)
    // userState 变化 → 只有 UserSection 重组
}

@Composable
private fun ListSection(viewModel: MyViewModel) {
    val listState by viewModel.listState.collectAsState()
    ItemList(items = listState.items)
    // listState 变化 → 只有 ListSection 重组
}
```

### 将 State 读取下移（State Deferral）

```kotlin
// ❌ 父层读取 State，子层传参（父层重组带动子层重组）
@Composable
fun Parent() {
    val scrollOffset by scrollState.collectAsState()
    ToolbarWithAlpha(alpha = scrollOffset / 300f)  // 父层读取，父层重组
}

// ✅ 传递 lambda，子层按需读取（只有子层重组）
@Composable
fun Parent() {
    // 把读取行为下沉到子组件内部
    ToolbarWithAlpha(alphaProvider = { scrollState.value / 300f })
}

@Composable
fun ToolbarWithAlpha(alphaProvider: () -> Float) {
    Box(
        modifier = Modifier.graphicsLayer {
            alpha = alphaProvider()   // Drawing 阶段才读取，只触发重绘
        }
    )
}
```

---

## graphicsLayer 跳过重组

`graphicsLayer` 内的属性变化**完全在 GPU 层处理，不触发 Compose 任何阶段**。

```kotlin
// 动画场景：所有变换用 graphicsLayer
val transition = rememberInfiniteTransition()
val scale by transition.animateFloat(0.8f, 1.2f, infiniteRepeatable(tween(1000)))
val alpha by transition.animateFloat(0.5f, 1.0f, infiniteRepeatable(tween(800)))

// ✅ scale 和 alpha 每帧变化，但不触发 Composable 重组
// 变换直接由 RenderNode → GPU 完成
Image(
    painter = painterResource(R.drawable.logo),
    contentDescription = null,
    modifier = Modifier.graphicsLayer {
        scaleX = scale
        scaleY = scale
        this.alpha = alpha
    }
)
```

---

## Modifier 优化

### 避免在 Modifier 中创建新对象

```kotlin
// ❌ 每次重组都创建新的 RoundedCornerShape 对象
Box(modifier = Modifier.clip(RoundedCornerShape(8.dp)))

// ✅ 用 remember 缓存
val shape = remember { RoundedCornerShape(8.dp) }
Box(modifier = Modifier.clip(shape))
```

### 避免 Modifier 依赖频繁变化的 State

```kotlin
var offset by remember { mutableStateOf(Offset.Zero) }

// ❌ 每次 offset 变化，Modifier 重新创建，触发 Layout
Modifier.offset(x = offset.x.dp, y = offset.y.dp)

// ✅ lambda 版本，在 Layout 阶段读取，跳过 Composition
Modifier.offset { IntOffset(offset.x.roundToInt(), offset.y.roundToInt()) }
```

---

## 工具：检测无效重组

### 方式一：Layout Inspector（推荐）

```
Android Studio → View → Tool Windows → Layout Inspector
打开 "Recomposition Counts" 开关
→ 实时显示每个 Composable 的重组次数和跳过次数
→ 重组次数异常高的节点就是优化目标
```

### 方式二：Compose 编译器报告

```kotlin
// build.gradle
composeCompiler {
    reportsDestination = layout.buildDirectory.dir("compose_reports")
    metricsDestination = layout.buildDirectory.dir("compose_metrics")
}

// 执行：./gradlew assembleRelease
// 查看 build/compose_reports/ 下的报告
// 报告内容：每个类的稳定性分析，哪些参数是 unstable
```

报告示例：
```
restartable skippable scheme("[androidx.compose.ui.UiComposable]")
fun UserCard(
  stable user: User           ← 稳定，可跳过
  unstable items: List<Item>  ← 不稳定！导致无法跳过
)
```

### 方式三：添加重组计数器（调试用）

```kotlin
// 调试 Composable 重组次数
@Composable
fun RecompositionCounter(name: String) {
    val count = remember { mutableIntStateOf(0) }
    SideEffect {
        // SideEffect 在每次成功重组后执行
        count.intValue++
        println("[$name] 重组次数: ${count.intValue}")
    }
}

// 使用
@Composable
fun MyComposable() {
    RecompositionCounter("MyComposable")
    // ...
}
```

### 方式四：使用 Compose Multipreview + 慢速动画

```kotlin
// 在调试包中开启慢速动画，便于肉眼观察重组范围
// local.properties 或 debug 代码：
// android.compose.animation.debugSlowAnimation=true
```

---

## 总结速查表

### 问题与解法对照

| 问题 | 原因 | 解法 |
|------|------|------|
| 父组件重组带动子组件重组 | 子组件参数不稳定 | `@Immutable` / `@Stable` |
| List 参数导致总是重组 | `List<T>` 接口不稳定 | `@Immutable` 包装 / `PersistentList` |
| 颜色/透明度动画触发重组 | Composition 阶段读取 | `drawBehind` / `graphicsLayer` |
| 位移动画触发重组 | Composition 阶段读取 | `offset { }` lambda 版本 |
| 高频 State 触发多余重组 | 直接读取高频 State | `derivedStateOf` |
| Lambda 参数每次不同 | 每次重组创建新 lambda | `rememberUpdatedState` / 移到 ViewModel |
| 大组件任意 State 变化全重组 | State 读取集中在顶层 | 拆分 Composable / State Deferral |
| 列表插入触发所有项重组 | 无 key，按位置匹配 | `items(key = { it.id })` |
| 用户 ID 变化旧状态残留 | 没有强制重建 | `key(userId) { }` |
| Modifier 中创建新对象 | 每次重组重新创建 | `remember { Shape/Paint }` |

### 优化优先级

```
优先级 ①（影响最大，最容易忽略）：
  → State 读取位置：尽量推迟到 Drawing 阶段

优先级 ②（最常见问题）：
  → 参数稳定性：@Immutable / @Stable / PersistentList

优先级 ③（高频场景）：
  → derivedStateOf：过滤高频 State 的无效重组

优先级 ④（架构层面）：
  → 拆分 Composable：让重组范围最小化

优先级 ⑤（细节优化）：
  → Lambda 稳定性、key 正确使用、Modifier 缓存
```

### 黄金法则

```
1. 能在 Drawing 阶段读 State，就不在 Composition 阶段读
2. 能在 Layout 阶段读 State，就不在 Composition 阶段读
3. 传给子组件的参数，尽量是稳定类型
4. 高频变化的 State → derivedStateOf → 低频触发重组
5. 大 Composable → 拆小 → 每个只读自己需要的 State
6. 先用工具确认真的有问题，再优化（不要过早优化）
```
