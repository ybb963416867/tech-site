---
title: "Composable_数据传递"
description: "1. [概述](概述) 2. [参数传递（Props Down）](参数传递propsdown) 3. [状态提升（State Hoisting）](状态提升statehoisting) 4. [CompositionLocal](c..."
pubDate: 2026-06-16
category: "Jetpack Compose"
tags: [API]
draft: false
---
# Jetpack Compose 数据传递详解

## 目录

1. [概述](#概述)
2. [参数传递（Props Down）](#参数传递props-down)
3. [状态提升（State Hoisting）](#状态提升state-hoisting)
4. [CompositionLocal](#compositionlocal)
5. [ViewModel 共享状态](#viewmodel-共享状态)
6. [Lambda 回调（Events Up）](#lambda-回调events-up)
7. [导航传参（Navigation）](#导航传参navigation)
8. [SharedFlow / StateFlow](#sharedflow--stateflow)
9. [数据传递模式对比](#数据传递模式对比)
10. [最佳实践](#最佳实践)

---

## 概述

Jetpack Compose 采用**单向数据流（Unidirectional Data Flow，UDF）**架构：

```
State  ──▶  UI（Composable）
              │
              ▼
           Events  ──▶  ViewModel / State Holder
```

- **数据向下流动**：父 Composable 将数据以参数形式传给子 Composable
- **事件向上传递**：子 Composable 通过 Lambda 回调将用户事件传给父级

---

## 参数传递（Props Down）

### 基本参数传递

最简单的方式：父 Composable 直接将数据作为参数传入子 Composable。

```kotlin
// 子 Composable
@Composable
fun UserCard(
    name: String,
    age: Int,
    avatarUrl: String,
    modifier: Modifier = Modifier
) {
    Card(modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = name, style = MaterialTheme.typography.titleMedium)
            Text(text = "Age: $age")
        }
    }
}

// 父 Composable
@Composable
fun ParentScreen() {
    UserCard(
        name = "张三",
        age = 28,
        avatarUrl = "https://example.com/avatar.jpg"
    )
}
```

### 传递数据类（Data Class）

推荐将相关属性封装为数据类，减少参数数量：

```kotlin
data class User(
    val id: Long,
    val name: String,
    val age: Int,
    val avatarUrl: String
)

@Composable
fun UserCard(user: User, modifier: Modifier = Modifier) {
    Card(modifier = modifier) {
        Text(text = user.name)
        Text(text = "Age: ${user.age}")
    }
}

@Composable
fun ParentScreen() {
    val user = User(id = 1L, name = "张三", age = 28, avatarUrl = "")
    UserCard(user = user)
}
```

### 传递 List / 集合

```kotlin
@Composable
fun UserList(users: List<User>) {
    LazyColumn {
        items(users, key = { it.id }) { user ->
            UserCard(user = user)
        }
    }
}
```

---

## 状态提升（State Hoisting）

### 概念

将状态从子 Composable "提升"到父 Composable，使子 Composable 变为**无状态（Stateless）**，由父级持有并管理状态。

**模式：**
- 子组件接收 `value` 参数（状态值）
- 子组件接收 `onValueChange` 回调（触发状态变更）

### 示例：TextField 状态提升

```kotlin
// ❌ 有状态（不推荐复用）
@Composable
fun StatefulTextField() {
    var text by remember { mutableStateOf("") }
    TextField(
        value = text,
        onValueChange = { text = it }
    )
}

// ✅ 无状态（推荐）
@Composable
fun StatelessTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
    )
}

// 父级持有状态
@Composable
fun LoginScreen() {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column {
        StatelessTextField(
            value = username,
            onValueChange = { username = it }
        )
        StatelessTextField(
            value = password,
            onValueChange = { password = it }
        )
        Button(onClick = { /* 使用 username / password 登录 */ }) {
            Text("登录")
        }
    }
}
```

### 提升层级原则

状态应提升到**所有需要读/写该状态的 Composable 的最低公共祖先**。

```
          Screen（持有 selectedTab 状态）
           /                \
    TabRow（读取）       TabContent（读取）
```

---

## CompositionLocal

### 概念

`CompositionLocal` 用于在 Composable 树中**隐式传递数据**，避免逐层手动传参（prop drilling）。适用于主题、语言、用户配置等全局性数据。

### 内置 CompositionLocal 示例

```kotlin
// MaterialTheme 本质是 CompositionLocal
@Composable
fun MyText() {
    // 直接获取当前主题颜色，无需父级传参
    val color = MaterialTheme.colorScheme.primary
    Text(text = "Hello", color = color)
}
```

### 自定义 CompositionLocal

#### 方式一：`compositionLocalOf`（值变化时，仅读取该值的子树重组）

```kotlin
// 定义
val LocalAppConfig = compositionLocalOf<AppConfig> {
    error("No AppConfig provided")
}

data class AppConfig(
    val apiBaseUrl: String,
    val debugMode: Boolean
)

// 提供（在顶层 Composable）
@Composable
fun App() {
    val config = AppConfig(
        apiBaseUrl = "https://api.example.com",
        debugMode = BuildConfig.DEBUG
    )
    CompositionLocalProvider(LocalAppConfig provides config) {
        MainScreen()
    }
}

// 消费（任意深度子 Composable）
@Composable
fun SettingsScreen() {
    val config = LocalAppConfig.current
    Text(text = "API: ${config.apiBaseUrl}")
}
```

#### 方式二：`staticCompositionLocalOf`（值变化时，整棵子树全部重组，适合极少变化的值）

```kotlin
val LocalNavigator = staticCompositionLocalOf<NavController> {
    error("No NavController provided")
}
```

### CompositionLocal vs 参数传递

| 场景 | 推荐方式 |
|------|----------|
| 业务数据（用户信息、列表数据） | 参数传递 |
| 全局配置（主题、语言、权限） | CompositionLocal |
| 频繁变化的状态 | 参数传递 + State Hoisting |
| 极少变化的全局对象（NavController） | staticCompositionLocalOf |

---

## ViewModel 共享状态

### 概念

多个 Composable 通过共同的 `ViewModel` 共享状态，适合**跨组件、跨屏幕**的数据共享。

### 基本用法

```kotlin
// ViewModel
class UserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun updateName(name: String) {
        _uiState.update { it.copy(name = name) }
    }

    fun loadUser(userId: Long) {
        viewModelScope.launch {
            val user = userRepository.getUser(userId)
            _uiState.update { it.copy(user = user, isLoading = false) }
        }
    }
}

data class UserUiState(
    val user: User? = null,
    val name: String = "",
    val isLoading: Boolean = true,
    val error: String? = null
)

// Screen（收集 ViewModel 状态）
@Composable
fun UserScreen(
    viewModel: UserViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    if (uiState.isLoading) {
        CircularProgressIndicator()
    } else {
        UserContent(
            uiState = uiState,
            onNameChange = viewModel::updateName
        )
    }
}

// 子 Composable（无状态）
@Composable
fun UserContent(
    uiState: UserUiState,
    onNameChange: (String) -> Unit
) {
    Column {
        uiState.user?.let { Text(text = it.name) }
        TextField(
            value = uiState.name,
            onValueChange = onNameChange
        )
    }
}
```

### 在 Navigation 中共享 ViewModel

```kotlin
// 同一 NavGraph 内的多个 Screen 共享同一个 ViewModel
@Composable
fun NavGraph(navController: NavHostController) {
    NavHost(navController, startDestination = "step1") {
        navigation(startDestination = "step1", route = "wizard") {
            composable("step1") { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry("wizard")
                }
                val viewModel: WizardViewModel = viewModel(parentEntry)
                Step1Screen(viewModel)
            }
            composable("step2") { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry("wizard")
                }
                val viewModel: WizardViewModel = viewModel(parentEntry)
                Step2Screen(viewModel)
            }
        }
    }
}
```

---

## Lambda 回调（Events Up）

### 基本回调

```kotlin
@Composable
fun ActionButton(
    text: String,
    onClick: () -> Unit,        // 无参回调
    modifier: Modifier = Modifier
) {
    Button(onClick = onClick, modifier = modifier) {
        Text(text)
    }
}

// 父级使用
@Composable
fun ParentScreen() {
    ActionButton(
        text = "提交",
        onClick = { /* 处理点击 */ }
    )
}
```

### 带参数的回调

```kotlin
@Composable
fun ItemList(
    items: List<Item>,
    onItemClick: (Item) -> Unit,      // 传递点击的 Item
    onItemDelete: (Long) -> Unit       // 传递 Item ID
) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            ItemRow(
                item = item,
                onClick = { onItemClick(item) },
                onDelete = { onItemDelete(item.id) }
            )
        }
    }
}
```

### 事件密封类（推荐用于复杂 UI）

将多个事件统一为密封类，减少回调参数数量：

```kotlin
sealed class LoginEvent {
    data class UsernameChanged(val value: String) : LoginEvent()
    data class PasswordChanged(val value: String) : LoginEvent()
    object LoginClicked : LoginEvent()
    object ForgotPasswordClicked : LoginEvent()
}

@Composable
fun LoginScreen(
    state: LoginUiState,
    onEvent: (LoginEvent) -> Unit
) {
    Column {
        TextField(
            value = state.username,
            onValueChange = { onEvent(LoginEvent.UsernameChanged(it)) }
        )
        TextField(
            value = state.password,
            onValueChange = { onEvent(LoginEvent.PasswordChanged(it)) }
        )
        Button(onClick = { onEvent(LoginEvent.LoginClicked) }) {
            Text("登录")
        }
        TextButton(onClick = { onEvent(LoginEvent.ForgotPasswordClicked) }) {
            Text("忘记密码？")
        }
    }
}

// ViewModel 处理
class LoginViewModel : ViewModel() {
    fun onEvent(event: LoginEvent) {
        when (event) {
            is LoginEvent.UsernameChanged -> updateUsername(event.value)
            is LoginEvent.PasswordChanged -> updatePassword(event.value)
            LoginEvent.LoginClicked -> login()
            LoginEvent.ForgotPasswordClicked -> navigateToForgotPassword()
        }
    }
}
```

---

## 导航传参（Navigation）

### 基本路由传参

```kotlin
// 定义路由
const val ROUTE_USER_DETAIL = "user/{userId}"

// 导航时传参
navController.navigate("user/42")

// 接收参数
composable(
    route = "user/{userId}",
    arguments = listOf(navArgument("userId") { type = NavType.LongType })
) { backStackEntry ->
    val userId = backStackEntry.arguments?.getLong("userId") ?: return@composable
    UserDetailScreen(userId = userId)
}
```

### 可选参数

```kotlin
// ?key=value 格式
composable(
    route = "search?query={query}",
    arguments = listOf(
        navArgument("query") {
            type = NavType.StringType
            nullable = true
            defaultValue = null
        }
    )
) { backStackEntry ->
    val query = backStackEntry.arguments?.getString("query")
    SearchScreen(initialQuery = query)
}

// 导航（可不传）
navController.navigate("search")
navController.navigate("search?query=keyword")
```

### 复杂对象传递（序列化为 JSON）

```kotlin
// 添加 Gson 或 kotlinx.serialization
// build.gradle: implementation "com.google.code.gson:gson:2.10.1"

// 编码
val userJson = Uri.encode(Gson().toJson(user))
navController.navigate("detail/$userJson")

// 解码
composable(
    route = "detail/{userJson}",
    arguments = listOf(navArgument("userJson") { type = NavType.StringType })
) { backStackEntry ->
    val json = backStackEntry.arguments?.getString("userJson") ?: ""
    val user = Gson().fromJson(json, User::class.java)
    DetailScreen(user = user)
}
```

> **注意**：导航传复杂对象建议只传 ID，通过 ViewModel 从数据源重新加载，避免数据过大和序列化问题。

### 返回结果（Back Stack Result）

```kotlin
// 子屏幕：将结果存入 SavedStateHandle
navController.previousBackStackEntry
    ?.savedStateHandle
    ?.set("selected_city", "北京")
navController.popBackStack()

// 父屏幕：观察结果
@Composable
fun ParentScreen(navController: NavController) {
    val savedStateHandle = navController.currentBackStackEntry?.savedStateHandle
    val selectedCity by savedStateHandle
        ?.getStateFlow("selected_city", "")
        ?.collectAsStateWithLifecycle() ?: return

    Text(text = "选择的城市：$selectedCity")
}
```

---

## SharedFlow / StateFlow

### StateFlow（状态）

适合持久状态，新订阅者会立即收到最新值：

```kotlin
class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()

    fun increment() { _count.update { it + 1 } }
}

@Composable
fun CounterScreen(viewModel: CounterViewModel = viewModel()) {
    val count by viewModel.count.collectAsStateWithLifecycle()
    Column {
        Text("Count: $count")
        Button(onClick = viewModel::increment) { Text("+1") }
    }
}
```

### SharedFlow（事件/一次性副作用）

适合导航、Toast、Dialog 等**一次性事件**：

```kotlin
class LoginViewModel : ViewModel() {
    private val _events = MutableSharedFlow<LoginSideEffect>()
    val events: SharedFlow<LoginSideEffect> = _events.asSharedFlow()

    fun login(username: String, password: String) {
        viewModelScope.launch {
            val result = authRepository.login(username, password)
            if (result.isSuccess) {
                _events.emit(LoginSideEffect.NavigateToHome)
            } else {
                _events.emit(LoginSideEffect.ShowError("登录失败，请重试"))
            }
        }
    }
}

sealed class LoginSideEffect {
    object NavigateToHome : LoginSideEffect()
    data class ShowError(val message: String) : LoginSideEffect()
}

// 在 Composable 中收集一次性事件
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = viewModel(),
    onNavigateToHome: () -> Unit
) {
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.events.collect { effect ->
            when (effect) {
                LoginSideEffect.NavigateToHome -> onNavigateToHome()
                is LoginSideEffect.ShowError -> {
                    Toast.makeText(context, effect.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // UI...
}
```

---

## 数据传递模式对比

| 传递方式 | 适用场景 | 优点 | 缺点 |
|----------|----------|------|------|
| **参数传递** | 父→子直接传数据 | 简单直观、类型安全 | 层级深时繁琐（prop drilling） |
| **状态提升** | 兄弟组件共享状态 | 无状态子组件易测试 | 状态管理上移，父级变复杂 |
| **CompositionLocal** | 主题、全局配置 | 避免 prop drilling | 隐式依赖，不适合业务数据 |
| **ViewModel** | 跨屏幕、复杂业务逻辑 | 生命周期感知、可测试 | 需要引入 DI 或 viewModel() |
| **Lambda 回调** | 子→父传事件 | 解耦，符合 UDF | 过多回调时参数列表膨胀 |
| **事件密封类** | 复杂 UI 事件 | 集中管理事件，易扩展 | 需要额外定义密封类 |
| **Navigation 参数** | 屏幕间传递简单值 | 系统支持、深链接兼容 | 不适合传大型对象 |
| **StateFlow/SharedFlow** | 异步状态/一次性事件 | 生命周期安全 | 需要理解 Flow 机制 |

---

## 最佳实践

### 1. 遵循单向数据流

```
ViewModel(State) ──▶ Composable(展示) ──▶ ViewModel(Event处理)
```

### 2. Screen 与内容 Composable 分离

```kotlin
// ✅ Screen 负责获取数据
@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    UserContent(state = state, onEvent = viewModel::onEvent)
}

// ✅ Content 无状态，仅负责渲染
@Composable
fun UserContent(state: UserUiState, onEvent: (UserEvent) -> Unit) {
    // 纯 UI
}
```

### 3. 使用 `key` 稳定 List 重组

```kotlin
LazyColumn {
    items(users, key = { it.id }) { user ->
        UserItem(user = user)
    }
}
```

### 4. 避免在 Composable 中直接持有可变状态的引用

```kotlin
// ❌ 错误：直接读取 ViewModel 内部 MutableState
val text = viewModel.mutableText

// ✅ 正确：通过 StateFlow/collectAsState 订阅
val text by viewModel.text.collectAsStateWithLifecycle()
```

### 5. `remember` 与 `rememberSaveable`

```kotlin
// remember：重组期间保持，屏幕旋转后丢失
var count by remember { mutableStateOf(0) }

// rememberSaveable：重组 + 配置变更（旋转）均保持
var count by rememberSaveable { mutableStateOf(0) }

// 复杂对象使用 Saver
var user by rememberSaveable(stateSaver = UserSaver) { mutableStateOf(User()) }
```

### 6. 副作用处理

```kotlin
@Composable
fun MyScreen(userId: Long, viewModel: MyViewModel = viewModel()) {
    // userId 变化时重新加载
    LaunchedEffect(userId) {
        viewModel.loadUser(userId)
    }

    // 只执行一次（进入组合时）
    LaunchedEffect(Unit) {
        viewModel.trackScreenView()
    }
}
```

---

## 总结

```
简单父子传参     ──▶  函数参数（Parameter）
子→父通信       ──▶  Lambda 回调
避免逐层传参    ──▶  CompositionLocal（谨慎使用）
跨组件共享状态  ──▶  ViewModel + StateFlow
一次性事件      ──▶  ViewModel + SharedFlow
屏幕间跳转传值  ──▶  Navigation 参数（简单值）或 ViewModel ID + 数据层
```

Compose 数据传递的核心原则：**状态下传，事件上报，保持单向数据流**。
