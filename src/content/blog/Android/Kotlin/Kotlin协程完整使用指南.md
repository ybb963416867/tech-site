# Kotlin协程完整使用指南

## 目录

*   [1. 协程基础概念](#1-协程基础概念)
*   [2. 协程构建器](#2-协程构建器)
*   [3. CoroutineScope 作用域](#3-coroutinescope-作用域)
*   [4. CoroutineContext 协程上下文](#4-coroutinecontext-协程上下文)
*   [5. Job 任务管理](#5-job-任务管理)
*   [6. SupervisorJob 监督任务](#6-supervisorjob-监督任务)
*   [7. Dispatchers 调度器](#7-dispatchers-调度器)
*   [8. 协程取消与超时](#8-协程取消与超时)
*   [9. 异常处理](#9-异常处理)
*   [10. Channel 通道](#10-channel-通道)
*   [11. Flow 流](#11-flow-流)
*   [12. Select 表达式](#12-select-表达式)
*   [13. 协程同步机制](#13-协程同步机制)
*   [14. 协程最佳实践](#14-协程最佳实践)

***

## 1. 协程基础概念

### 什么是协程

协程是一种轻量级的线程，可以在不阻塞线程的情况下挂起和恢复执行。

### 添加依赖

```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3") // Android平台
}
```

### 基本术语

*   **挂起函数 (Suspend Function)**: 使用 `suspend` 关键字标记的函数
*   **协程作用域 (CoroutineScope)**: 定义协程的生命周期
*   **协程上下文 (CoroutineContext)**: 协程的运行环境配置
*   **调度器 (Dispatcher)**: 决定协程在哪个线程上执行

***

## 2. 协程构建器

### 2.1 launch

启动一个新协程，不阻塞当前线程，返回 Job 对象。

```kotlin
// 基本用法
val job = GlobalScope.launch {
    delay(1000L)
    println("World!")
}
println("Hello,")
job.join() // 等待协程完成

// 指定调度器
val job = CoroutineScope(Dispatchers.Main).launch {
    // 在主线程执行
}

// 带返回值（通过共享变量）
var result = ""
val job = launch {
    result = fetchData()
}
job.join()
println(result)
```

### 2.2 async

启动一个新协程并返回 Deferred 对象，可以获取协程的返回值。

```kotlin
// 基本用法
val deferred = GlobalScope.async {
    delay(1000L)
    return@async "Result"
}
val result = deferred.await() // 挂起等待结果

// 并发执行多个任务
suspend fun fetchUser(): User { delay(1000); return User() }
suspend fun fetchPosts(): List<Post> { delay(1000); return listOf() }

val user = async { fetchUser() }
val posts = async { fetchPosts() }
val result = Pair(user.await(), posts.await())

// 结构化并发
coroutineScope {
    val result1 = async { task1() }
    val result2 = async { task2() }
    println("${result1.await()} ${result2.await()}")
}
```

### 2.3 runBlocking

阻塞当前线程直到协程执行完成，主要用于测试和主函数。

```kotlin
// 主函数中使用
fun main() = runBlocking {
    launch {
        delay(1000L)
        println("World!")
    }
    println("Hello,")
}

// 单元测试中使用
@Test
fun testCoroutine() = runBlocking {
    val result = async { fetchData() }
    assertEquals("expected", result.await())
}
```

### 2.4 withContext

切换协程的上下文（通常是调度器），执行代码块后返回结果。

```kotlin
// 在后台线程执行，返回结果
suspend fun fetchData(): String = withContext(Dispatchers.IO) {
    // 网络请求
    "Data"
}

// 在主线程更新UI
withContext(Dispatchers.Main) {
    textView.text = data
}

// 切换到默认调度器
val result = withContext(Dispatchers.Default) {
    // 密集计算
    calculateResult()
}
```

### 2.5 coroutineScope

创建一个新的作用域，等待所有子协程完成后才返回。

```kotlin
suspend fun doWork() = coroutineScope {
    launch {
        delay(1000L)
        println("Task 1")
    }
    launch {
        delay(2000L)
        println("Task 2")
    }
    println("All tasks started")
} // 等待所有子协程完成后才返回

// 与async配合使用
suspend fun loadData() = coroutineScope {
    val data1 = async { fetchData1() }
    val data2 = async { fetchData2() }
    CombinedData(data1.await(), data2.await())
}
```

### 2.6 supervisorScope

类似 coroutineScope，但子协程的失败不会影响其他兄弟协程。

```kotlin
supervisorScope {
    val child1 = launch {
        try {
            delay(1000)
            throw Exception("Child 1 failed")
        } catch (e: Exception) {
            println("Caught: ${e.message}")
        }
    }
    
    val child2 = launch {
        delay(2000)
        println("Child 2 completed") // 仍会执行
    }
}
```

***

## 3. CoroutineScope 作用域

### 3.1 CoroutineScope 接口

协程作用域定义了协程的生命周期范围。

```kotlin
// 接口定义
public interface CoroutineScope {
    public val coroutineContext: CoroutineContext
}

// 创建自定义作用域
class MyClass {
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    fun doWork() {
        scope.launch {
            // 协程代码
        }
    }
    
    fun cleanup() {
        scope.cancel() // 取消所有协程
    }
}
```

### 3.2 GlobalScope

全局协程作用域，生命周期与应用程序相同（不推荐使用）。

```kotlin
// 不推荐：难以管理生命周期
GlobalScope.launch {
    delay(1000L)
    println("Running in GlobalScope")
}

// 推荐：使用结构化并发
class MyActivity : AppCompatActivity() {
    private val scope = MainScope()
    
    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
```

### 3.3 MainScope

主线程作用域，用于Android UI组件。

```kotlin
class MyActivity : AppCompatActivity() {
    private val mainScope = MainScope()
    
    fun loadData() {
        mainScope.launch {
            val data = withContext(Dispatchers.IO) {
                fetchData()
            }
            updateUI(data)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
```

### 3.4 CoroutineScope() 构造函数

创建自定义作用域。

```kotlin
// 基本创建
val scope = CoroutineScope(Dispatchers.Default)

// 带Job
val scope = CoroutineScope(Dispatchers.Main + Job())

// 带SupervisorJob
val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

// 带异常处理器
val exceptionHandler = CoroutineExceptionHandler { _, exception ->
    println("Caught: $exception")
}
val scope = CoroutineScope(Dispatchers.Main + SupervisorJob() + exceptionHandler)

// 带名称（用于调试）
val scope = CoroutineScope(Dispatchers.Default + CoroutineName("MyScope"))
```

### 3.5 Android中的作用域

#### lifecycleScope (Lifecycle KTX)

```kotlin
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 自动管理生命周期
        lifecycleScope.launch {
            whenStarted {
                // Activity started时执行
            }
        }
        
        // 重复执行
        lifecycleScope.launchWhenStarted {
            // Activity每次started时执行
        }
    }
}
```

#### viewModelScope (ViewModel KTX)

```kotlin
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data = repository.fetchData()
            _uiState.value = UiState.Success(data)
        }
    }
    // ViewModel清除时自动取消
}
```

***

## 4. CoroutineContext 协程上下文

### 4.1 CoroutineContext 概念

协程上下文是一组元素的集合，定义了协程的行为。

```kotlin
// 上下文元素
public interface CoroutineContext {
    public operator fun <E : Element> get(key: Key<E>): E?
    public fun <R> fold(initial: R, operation: (R, Element) -> R): R
    public operator fun plus(context: CoroutineContext): CoroutineContext
    public fun minusKey(key: Key<*>): CoroutineContext
}

// 主要元素类型
- Job: 控制协程生命周期
- CoroutineDispatcher: 决定线程
- CoroutineName: 协程名称
- CoroutineExceptionHandler: 异常处理
```

### 4.2 组合上下文

```kotlin
// 使用 + 运算符组合
val context = Dispatchers.IO + Job() + CoroutineName("MyCoroutine")

// 启动时指定上下文
launch(Dispatchers.Main + Job()) {
    // 代码
}

// 获取上下文元素
val job = coroutineContext[Job]
val dispatcher = coroutineContext[ContinuationInterceptor]
val name = coroutineContext[CoroutineName]
```

### 4.3 上下文继承

```kotlin
// 子协程继承父协程的上下文
CoroutineScope(Dispatchers.Main + Job()).launch {
    println(coroutineContext[CoroutineDispatcher]) // Main
    
    launch {
        // 继承父协程的Main调度器
        println(coroutineContext[CoroutineDispatcher]) // Main
    }
    
    launch(Dispatchers.IO) {
        // 覆盖调度器
        println(coroutineContext[CoroutineDispatcher]) // IO
    }
}
```

### 4.4 CoroutineName

为协程命名，便于调试。

```kotlin
// 设置协程名称
launch(CoroutineName("MyCoroutine")) {
    println(coroutineContext[CoroutineName]?.name) // MyCoroutine
}

// 在日志中显示
launch(Dispatchers.Default + CoroutineName("Worker#1")) {
    // 日志会显示协程名称
    println("Working...")
}
```

***

## 5. Job 任务管理

### 5.1 Job 接口

Job代表一个可取消的异步任务。

```kotlin
// Job状态
New -> Active -> Completing -> Completed
              -> Cancelling -> Cancelled

// Job属性
val job: Job = launch {
    // 代码
}
println(job.isActive)      // 是否活跃
println(job.isCompleted)   // 是否完成
println(job.isCancelled)   // 是否取消
```

### 5.2 Job 基本操作

```kotlin
// 创建Job
val job = Job()

// 启动协程并获取Job
val job = launch {
    repeat(1000) { i ->
        delay(500L)
        println("Job: $i")
    }
}

// 等待完成
job.join()

// 取消Job
job.cancel()

// 取消并等待完成
job.cancelAndJoin()

// 检查取消
if (job.isCancelled) {
    println("Job was cancelled")
}
```

### 5.3 Job 层级关系

```kotlin
val parentJob = launch {
    val childJob1 = launch {
        delay(1000L)
        println("Child 1")
    }
    
    val childJob2 = launch {
        delay(2000L)
        println("Child 2")
    }
    
    println("Parent started")
}

// 父Job取消会取消所有子Job
parentJob.cancel()

// 获取子Job
val children = parentJob.children
children.forEach { it.cancel() }
```

### 5.4 invokeOnCompletion

在Job完成时执行回调。

```kotlin
val job = launch {
    delay(1000L)
    println("Work done")
}

job.invokeOnCompletion { exception ->
    when (exception) {
        null -> println("Completed successfully")
        is CancellationException -> println("Cancelled")
        else -> println("Failed with $exception")
    }
}
```

### 5.5 Job() 工厂函数

```kotlin
// 创建独立Job
val job = Job()

// 作为父Job
val parentJob = Job()
val scope = CoroutineScope(Dispatchers.Default + parentJob)

scope.launch {
    // 子协程
}

// 取消所有子协程
parentJob.cancel()

// 带父Job创建
val parent = Job()
val child = Job(parent = parent)
```

***

## 6. SupervisorJob 监督任务

### 6.1 SupervisorJob 概念

SupervisorJob是一种特殊的Job，子协程的失败不会导致其他子协程取消。

```kotlin
// 普通Job：一个子协程失败，所有子协程都会被取消
val job = Job()
val scope = CoroutineScope(Dispatchers.Default + job)

scope.launch {
    throw Exception("Child 1 failed") // 会导致所有子协程取消
}

scope.launch {
    delay(1000)
    println("Child 2") // 不会执行
}

// SupervisorJob：子协程独立失败
val supervisorJob = SupervisorJob()
val scope = CoroutineScope(Dispatchers.Default + supervisorJob)

scope.launch {
    throw Exception("Child 1 failed") // 只影响自己
}

scope.launch {
    delay(1000)
    println("Child 2") // 仍会执行
}
```

### 6.2 SupervisorJob 使用场景

```kotlin
// Android ViewModel中使用
class MyViewModel : ViewModel() {
    private val viewModelJob = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.Main + viewModelJob)
    
    fun loadUserData() {
        scope.launch {
            // 即使失败也不影响其他协程
            userRepository.fetchUser()
        }
    }
    
    fun loadPostsData() {
        scope.launch {
            // 独立执行
            postsRepository.fetchPosts()
        }
    }
    
    override fun onCleared() {
        viewModelJob.cancel()
    }
}

// 并发执行多个独立任务
suspend fun loadAllData() {
    supervisorScope {
        launch {
            try {
                loadUserData()
            } catch (e: Exception) {
                // 处理用户数据加载失败
            }
        }
        
        launch {
            try {
                loadPostsData()
            } catch (e: Exception) {
                // 处理文章数据加载失败
            }
        }
        
        launch {
            try {
                loadCommentsData()
            } catch (e: Exception) {
                // 处理评论数据加载失败
            }
        }
    }
}
```

### 6.3 SupervisorJob vs supervisorScope

```kotlin
// SupervisorJob：创建作用域时使用
val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
scope.launch { /* 任务1 */ }
scope.launch { /* 任务2 */ }

// supervisorScope：在挂起函数中使用
suspend fun doWork() = supervisorScope {
    launch { /* 任务1 */ }
    launch { /* 任务2 */ }
}

// 区别示例
// 使用SupervisorJob
val job = SupervisorJob()
launch(job) {
    throw Exception() // 异常不会被捕获，需要CoroutineExceptionHandler
}

// 使用supervisorScope
launch {
    supervisorScope {
        launch {
            throw Exception() // 异常仍需要try-catch或CoroutineExceptionHandler
        }
    }
}
```

### 6.4 与异常处理结合

```kotlin
val exceptionHandler = CoroutineExceptionHandler { _, exception ->
    println("Caught: $exception")
}

val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main + exceptionHandler)

scope.launch {
    throw Exception("Error 1") // 被exceptionHandler捕获
}

scope.launch {
    delay(1000)
    println("Still running") // 继续执行
}
```

***

## 7. Dispatchers 调度器

### 7.1 Dispatchers 类型

#### Dispatchers.Main

主线程调度器，用于UI更新（Android/JavaFX/Swing）。

```kotlin
launch(Dispatchers.Main) {
    // 更新UI
    textView.text = "Updated"
}

// 确保在主线程
withContext(Dispatchers.Main) {
    updateUI()
}
```

#### Dispatchers.IO

用于IO密集型任务（网络请求、文件读写、数据库操作）。

```kotlin
withContext(Dispatchers.IO) {
    // 网络请求
    val response = api.fetchData()
    
    // 文件操作
    file.writeText("data")
    
    // 数据库操作
    database.query()
}
```

#### Dispatchers.Default

用于CPU密集型任务（复杂计算、数据处理）。

```kotlin
withContext(Dispatchers.Default) {
    // 密集计算
    val result = complexCalculation()
    
    // 数据排序
    largeList.sortedBy { it.value }
    
    // 图像处理
    processBitmap(image)
}
```

#### Dispatchers.Unconfined

不限制线程，协程在调用者线程启动，但挂起后可能在不同线程恢复（不推荐使用）。

```kotlin
launch(Dispatchers.Unconfined) {
    println("Thread: ${Thread.currentThread().name}") // 调用者线程
    delay(100)
    println("Thread: ${Thread.currentThread().name}") // 可能是不同线程
}
```

### 7.2 自定义Dispatcher

```kotlin
// 创建固定线程池
val customDispatcher = Dispatchers.IO.limitedParallelism(5)

launch(customDispatcher) {
    // 在最多5个并行线程中执行
}

// 创建单线程Dispatcher
val singleThreadDispatcher = newSingleThreadContext("MyThread")

launch(singleThreadDispatcher) {
    // 始终在同一线程执行
}

// 使用后关闭
singleThreadDispatcher.close()

// 创建固定大小线程池
val fixedThreadPool = newFixedThreadPoolContext(4, "MyPool")
launch(fixedThreadPool) {
    // 在4个线程池中执行
}
fixedThreadPool.close()
```

### 7.3 Dispatcher限制并行度

```kotlin
// 限制Dispatchers.IO的并行数量
val limitedDispatcher = Dispatchers.IO.limitedParallelism(10)

repeat(100) {
    launch(limitedDispatcher) {
        // 最多10个协程并行执行
        performIOTask()
    }
}

// 为特定任务创建专用Dispatcher
val databaseDispatcher = Dispatchers.IO.limitedParallelism(1)
val networkDispatcher = Dispatchers.IO.limitedParallelism(5)

launch(databaseDispatcher) {
    // 数据库操作串行执行
}

launch(networkDispatcher) {
    // 网络请求最多5个并发
}
```

### 7.4 Dispatcher最佳实践

```kotlin
class DataRepository(
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val defaultDispatcher: CoroutineDispatcher = Dispatchers.Default
) {
    suspend fun fetchData(): Data = withContext(ioDispatcher) {
        // IO操作
        api.getData()
    }
    
    suspend fun processData(data: Data): ProcessedData = withContext(defaultDispatcher) {
        // CPU密集操作
        heavyProcessing(data)
    }
}

// 使用
class MyViewModel : ViewModel() {
    private val repository = DataRepository()
    
    fun loadData() {
        viewModelScope.launch {
            val data = repository.fetchData()
            val processed = repository.processData(data)
            
            // 自动在Main线程（viewModelScope使用Main）
            updateUI(processed)
        }
    }
}
```

***

## 8. 协程取消与超时

### 8.1 取消协程

```kotlin
// 基本取消
val job = launch {
    repeat(1000) { i ->
        println("Job: $i")
        delay(500L)
    }
}
delay(1300L)
job.cancel() // 取消协程
job.join()   // 等待取消完成
// 或使用
job.cancelAndJoin()

// 取消原因
job.cancel(CancellationException("User cancelled"))

// 检查取消状态
launch {
    while (isActive) { // 检查协程是否活跃
        // 工作
    }
}
```

### 8.2 取消是协作的

```kotlin
// 不可取消的代码（不检查取消状态）
val job = launch {
    var i = 0
    while (i < 1000) { // 不检查isActive
        println("Job: $i")
        i++
    }
}
job.cancel() // 无效，协程不会停止

// 可取消的代码
val job = launch {
    var i = 0
    while (i < 1000 && isActive) { // 检查isActive
        println("Job: $i")
        i++
    }
}
job.cancel() // 有效

// 或者周期性调用yield()
val job = launch {
    repeat(1000) { i ->
        yield() // 检查取消并让出执行
        println("Job: $i")
    }
}
```

### 8.3 在finally中清理资源

```kotlin
val job = launch {
    try {
        repeat(1000) { i ->
            println("Job: $i")
            delay(500L)
        }
    } finally {
        println("Cleaning up...")
        // 清理资源
    }
}
delay(1300L)
job.cancelAndJoin()

// 在取消状态下执行挂起函数
val job = launch {
    try {
        work()
    } finally {
        withContext(NonCancellable) {
            // 即使协程被取消，这里的代码仍会执行
            delay(1000L)
            println("Cleanup completed")
        }
    }
}
```

### 8.4 超时处理

#### withTimeout

```kotlin
// 超时抛出TimeoutCancellationException
try {
    withTimeout(1300L) {
        repeat(1000) { i ->
            println("Job: $i")
            delay(500L)
        }
    }
} catch (e: TimeoutCancellationException) {
    println("Timed out")
}
```

#### withTimeoutOrNull

```kotlin
// 超时返回null
val result = withTimeoutOrNull(1300L) {
    repeat(1000) { i ->
        println("Job: $i")
        delay(500L)
    }
    "Completed"
}
println(result) // null 如果超时

// 实际应用
suspend fun fetchUserWithTimeout(): User? {
    return withTimeoutOrNull(5000L) {
        api.getUser()
    }
}
```

### 8.5 CancellationException

```kotlin
// CancellationException不会导致应用崩溃
launch {
    try {
        delay(1000)
    } catch (e: CancellationException) {
        println("Cancelled") // 通常应该重新抛出
        throw e // 重新抛出以正确传播取消
    }
}

// 不要捕获CancellationException
launch {
    try {
        someWork()
    } catch (e: Exception) {
        // 错误：会捕获CancellationException
        if (e is CancellationException) throw e
        handleError(e)
    }
}
```

### 8.6 ensureActive

```kotlin
// 检查协程是否活跃，如果已取消则抛出异常
suspend fun doWork() {
    repeat(1000) { i ->
        ensureActive() // 比isActive更主动
        // 密集计算
        complexCalculation()
    }
}
```

***

## 9. 异常处理

### 9.1 协程中的异常传播

```kotlin
// launch：异常会向上传播到父协程
val scope = CoroutineScope(Job())
scope.launch {
    throw Exception("Error in launch") // 传播到scope，导致scope取消
}

// async：异常被封装在Deferred中，await时抛出
val deferred = scope.async {
    throw Exception("Error in async")
}
try {
    deferred.await()
} catch (e: Exception) {
    println("Caught: $e")
}
```

### 9.2 CoroutineExceptionHandler

处理未捕获的异常（仅对launch有效，async需要用try-catch包装await）。

```kotlin
// 创建异常处理器
val handler = CoroutineExceptionHandler { context, exception ->
    println("Caught $exception in ${context[CoroutineName]}")
}

// 在作用域中使用
val scope = CoroutineScope(Job() + handler)
scope.launch {
    throw Exception("Error") // 被handler捕获
}

// 在协程构建器中使用
launch(handler) {
    throw Exception("Error") // 被handler捕获
}

// 注意：必须安装在作用域或顶层协程
launch {
    launch(handler) { // 无效！handler不会被调用
        throw Exception("Error")
    }
}

// 正确做法
val scope = CoroutineScope(Job() + handler)
scope.launch {
    launch { // handler会捕获
        throw Exception("Error")
    }
}
```

### 9.3 async异常处理

```kotlin
// async需要显式处理
val deferred = async {
    throw Exception("Error in async")
}

try {
    deferred.await()
} catch (e: Exception) {
    println("Caught: $e")
}

// 多个async
coroutineScope {
    val d1 = async { task1() }
    val d2 = async { task2() }
    
    try {
        val r1 = d1.await()
        val r2 = d2.await()
    } catch (e: Exception) {
        println("One of the tasks failed: $e")
    }
}
```

### 9.4 supervisorScope中的异常处理

```kotlin
// supervisorScope中的异常需要单独处理
supervisorScope {
    launch {
        try {
            throw Exception("Error 1")
        } catch (e: Exception) {
            println("Caught in child: $e")
        }
    }
    
    launch {
        delay(1000)
        println("Still running")
    }
}

// 使用CoroutineExceptionHandler
val handler = CoroutineExceptionHandler { _, exception ->
    println("Caught: $exception")
}

supervisorScope {
    launch(handler) {
        throw Exception("Error") // 被handler捕获
    }
    
    launch {
        delay(1000)
        println("Still running")
    }
}
```

### 9.5 异常处理最佳实践

```kotlin
class MyViewModel : ViewModel() {
    private val exceptionHandler = CoroutineExceptionHandler { _, exception ->
        // 记录日志
        Log.e("MyViewModel", "Error", exception)
        // 显示错误消息
        _errorState.value = exception.message
    }
    
    private val scope = CoroutineScope(
        SupervisorJob() + 
        Dispatchers.Main + 
        exceptionHandler
    )
    
    fun loadData() {
        scope.launch {
            try {
                _uiState.value = UiState.Loading
                val data = repository.fetchData()
                _uiState.value = UiState.Success(data)
            } catch (e: CancellationException) {
                // 不处理取消异常，重新抛出
                throw e
            } catch (e: Exception) {
                // 处理业务异常
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

// Repository层
class DataRepository {
    suspend fun fetchData(): Data {
        return try {
            withContext(Dispatchers.IO) {
                api.getData()
            }
        } catch (e: IOException) {
            // 转换为领域异常
            throw NetworkException("Failed to fetch data", e)
        }
    }
}
```

***

## 10. Channel 通道

### 10.1 Channel基础

Channel是协程间的通信管道，类似于BlockingQueue但使用挂起函数。

```kotlin
// 创建Channel
val channel = Channel<Int>()

// 发送方
launch {
    for (x in 1..5) {
        channel.send(x)
    }
    channel.close() // 关闭channel
}

// 接收方
launch {
    for (y in channel) { // 迭代接收
        println(y)
    }
}

// 或使用receive
launch {
    repeat(5) {
        val value = channel.receive()
        println(value)
    }
}
```

### 10.2 Channel类型

#### 无缓冲Channel (Rendezvous)

```kotlin
val channel = Channel<Int>() // 或 Channel<Int>(Channel.RENDEZVOUS)

// 发送会挂起直到有接收者
launch {
    channel.send(1) // 挂起直到被接收
    println("Sent 1")
}

launch {
    delay(1000) // 1秒后接收
    println("Received: ${channel.receive()}")
}
```

#### 缓冲Channel

```kotlin
// 固定大小缓冲
val channel = Channel<Int>(capacity = 4)

launch {
    repeat(10) {
        channel.send(it)
        println("Sent $it")
    }
}

// 无限缓冲
val unlimited = Channel<Int>(Channel.UNLIMITED)

// 合并缓冲（最新值覆盖旧值）
val conflated = Channel<Int>(Channel.CONFLATED)
launch {
    repeat(5) {
        channel.send(it)
        delay(100)
    }
}
delay(500)
println(channel.receive()) // 可能只收到最新值
```

### 10.3 Channel操作

#### send和receive

```kotlin
val channel = Channel<String>()

// 发送
launch {
    channel.send("Hello")
    println("Sent")
}

// 接收
launch {
    val msg = channel.receive()
    println("Received: $msg")
}

// trySend和tryReceive（非挂起）
val result = channel.trySend("Hello")
if (result.isSuccess) {
    println("Sent successfully")
}

val received = channel.tryReceive()
if (received.isSuccess) {
    println("Received: ${received.getOrNull()}")
}
```

#### close和isClosedForSend

```kotlin
val channel = Channel<Int>()

launch {
    repeat(5) {
        channel.send(it)
    }
    channel.close() // 标记完成
}

launch {
    for (value in channel) {
        println(value)
    } // 自动结束
}

// 检查状态
println(channel.isClosedForSend)
println(channel.isClosedForReceive)
```

#### consumeEach

```kotlin
val channel = Channel<Int>()

launch {
    repeat(5) { channel.send(it) }
    channel.close()
}

// 消费所有元素（简化版for循环）
channel.consumeEach { value ->
    println(value)
}
```

### 10.4 生产者-消费者模式

```kotlin
// 使用produce构建器
fun CoroutineScope.produceNumbers() = produce {
    var x = 1
    while (true) {
        send(x++)
        delay(100)
    }
}

val numbers = produceNumbers()
repeat(5) {
    println(numbers.receive())
}
numbers.cancel() // 取消生产者

// 管道模式
fun CoroutineScope.produceNumbers() = produce {
    var x = 1
    while (true) send(x++)
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>) = produce {
    for (x in numbers) send(x * x)
}

val numbers = produceNumbers()
val squares = square(numbers)
repeat(5) {
    println(squares.receive())
}
coroutineContext.cancelChildren()
```

### 10.5 Fan-out和Fan-in

#### Fan-out（多个消费者）

```kotlin
fun CoroutineScope.produceNumbers() = produce {
    var x = 1
    while (true) {
        send(x++)
        delay(100)
    }
}

val producer = produceNumbers()

repeat(5) { id ->
    launch {
        for (msg in producer) {
            println("Consumer #$id received $msg")
        }
    }
}

delay(1000)
producer.cancel()
```

#### Fan-in（多个生产者）

```kotlin
suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}

val channel = Channel<String>()
launch { sendString(channel, "foo", 200L) }
launch { sendString(channel, "BAR!", 500L) }

repeat(10) {
    println(channel.receive())
}
coroutineContext.cancelChildren()
```

### 10.6 Actor模型

```kotlin
// 使用actor构建器
sealed class CounterMsg
object IncCounter : CounterMsg()
class GetCounter(val response: CompletableDeferred<Int>) : CounterMsg()

fun CoroutineScope.counterActor() = actor<CounterMsg> {
    var counter = 0
    for (msg in channel) {
        when (msg) {
            is IncCounter -> counter++
            is GetCounter -> msg.response.complete(counter)
        }
    }
}

val counter = counterActor()
GlobalScope.launch {
    repeat(100) {
        counter.send(IncCounter)
    }
    val response = CompletableDeferred<Int>()
    counter.send(GetCounter(response))
    println("Counter = ${response.await()}")
    counter.close()
}
```

***

## 11. Flow 流

### 11.1 Flow基础

Flow是冷流，表示异步数据流序列。

```kotlin
// 创建Flow
fun simpleFlow(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100)
        emit(i) // 发射值
    }
}

// 收集Flow
launch {
    simpleFlow().collect { value ->
        println(value)
    }
}

// flowOf构建器
val flow = flowOf(1, 2, 3, 4, 5)

// asFlow扩展函数
val flow = (1..5).asFlow()
val flow = listOf(1, 2, 3).asFlow()
```

### 11.2 Flow操作符

#### 中间操作符

```kotlin
// map
flow { emit(1); emit(2) }
    .map { it * it }
    .collect { println(it) } // 1, 4

// filter
(1..10).asFlow()
    .filter { it % 2 == 0 }
    .collect { println(it) } // 2, 4, 6, 8, 10

// transform（更灵活的map）
(1..3).asFlow()
    .transform { value ->
        emit("Making $value")
        emit(value)
    }
    .collect { println(it) }

// take（限制数量）
(1..10).asFlow()
    .take(3)
    .collect { println(it) } // 1, 2, 3

// drop（跳过前n个）
(1..5).asFlow()
    .drop(2)
    .collect { println(it) } // 3, 4, 5

// distinctUntilChanged（去除连续重复）
flowOf(1, 1, 2, 2, 3, 1)
    .distinctUntilChanged()
    .collect { println(it) } // 1, 2, 3, 1
```

#### 末端操作符

```kotlin
// collect
flow.collect { value -> println(value) }

// toList
val list = flow.toList()

// toSet
val set = flow.toSet()

// first
val first = flow.first()

// first with predicate
val first = flow.first { it > 2 }

// single（确保只有一个元素）
val single = flow.single()

// reduce
val sum = (1..5).asFlow().reduce { acc, value -> acc + value }

// fold
val sum = (1..5).asFlow().fold(0) { acc, value -> acc + value }
```

### 11.3 Flow上下文

#### flowOn

指定Flow上游的执行上下文。

```kotlin
fun simpleFlow(): Flow<Int> = flow {
    // 在IO线程执行
    println("Flow on ${Thread.currentThread().name}")
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}.flowOn(Dispatchers.IO)

launch(Dispatchers.Main) {
    simpleFlow().collect { value ->
        // 在Main线程收集
        println("Collected on ${Thread.currentThread().name}: $value")
    }
}

// 多个flowOn
flow {
    emit(1)
}.map {
    println("Map on ${Thread.currentThread().name}")
    it * 2
}.flowOn(Dispatchers.Default)
.collect {
    println("Collect on ${Thread.currentThread().name}")
}
```

### 11.4 Flow缓冲

#### buffer

```kotlin
// 不使用buffer
flow {
    for (i in 1..3) {
        delay(100) // 生产延迟
        emit(i)
    }
}.collect { value ->
    delay(300) // 处理延迟
    println(value)
} // 总时间约 (100 + 300) * 3 = 1200ms

// 使用buffer
flow {
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}.buffer()
.collect { value ->
    delay(300)
    println(value)
} // 总时间约 100 + 300 * 3 = 1000ms
```

#### conflate

只处理最新值，跳过中间值。

```kotlin
flow {
    for (i in 1..5) {
        delay(100)
        emit(i)
    }
}.conflate()
.collect { value ->
    delay(300)
    println(value) // 可能只打印 1, 3, 5
}
```

#### collectLatest

取消前一个处理，开始处理最新值。

```kotlin
flow {
    for (i in 1..5) {
        delay(100)
        emit(i)
    }
}.collectLatest { value ->
    println("Processing $value")
    delay(300)
    println("Processed $value")
} // 只有最后一个值被完全处理
```

### 11.5 组合Flow

#### zip

将两个Flow按顺序组合。

```kotlin
val nums = (1..3).asFlow()
val strs = flowOf("one", "two", "three")

nums.zip(strs) { a, b -> "$a -> $b" }
    .collect { println(it) }
// 1 -> one
// 2 -> two
// 3 -> three
```

#### combine

组合两个Flow的最新值。

```kotlin
val nums = (1..3).asFlow().onEach { delay(300) }
val strs = flowOf("one", "two", "three").onEach { delay(400) }

nums.combine(strs) { a, b -> "$a -> $b" }
    .collect { println(it) }
// 每当任一Flow发射新值时触发
```

#### flatMapConcat

顺序展平Flow。

```kotlin
(1..3).asFlow()
    .flatMapConcat { value ->
        flow {
            emit("$value: First")
            delay(100)
            emit("$value: Second")
        }
    }
    .collect { println(it) }
```

#### flatMapMerge

并发展平Flow。

```kotlin
(1..3).asFlow()
    .flatMapMerge { value ->
        flow {
            emit("$value: First")
            delay(100)
            emit("$value: Second")
        }
    }
    .collect { println(it) }
```

#### flatMapLatest

取消前一个Flow，处理最新的。

```kotlin
(1..3).asFlow().onEach { delay(100) }
    .flatMapLatest { value ->
        flow {
            emit("$value: First")
            delay(500)
            emit("$value: Second")
        }
    }
    .collect { println(it) }
```

### 11.6 Flow异常处理

#### catch

捕获上游异常。

```kotlin
flow {
    emit(1)
    throw RuntimeException("Error!")
}.catch { e ->
    println("Caught: $e")
    emit(-1) // 发射默认值
}.collect { println(it) }

// 只捕获上游异常
flow { emit(1) }
    .catch { /* 不会捕获collect中的异常 */ }
    .collect { throw RuntimeException("Error in collect") }
```

#### retry和retryWhen

```kotlin
// 重试固定次数
flow {
    emit(1)
    throw IOException("Network error")
}.retry(3) { cause ->
    cause is IOException
}.collect { println(it) }

// 条件重试
flow {
    emit(fetchData())
}.retryWhen { cause, attempt ->
    if (cause is IOException && attempt < 3) {
        delay(1000 * attempt)
        true // 重试
    } else {
        false // 不重试
    }
}.collect { println(it) }
```

### 11.7 StateFlow和SharedFlow

#### StateFlow

热流，保存当前状态，新订阅者立即接收当前值。

```kotlin
// 创建StateFlow
val _uiState = MutableStateFlow<UiState>(UiState.Loading)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()

// 更新值
_uiState.value = UiState.Success(data)

// 收集
launch {
    uiState.collect { state ->
        updateUI(state)
    }
}

// 在ViewModel中使用
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val data = repository.fetchData()
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

// 在UI中收集
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state ->
            when (state) {
                is UiState.Loading -> showLoading()
                is UiState.Success -> showData(state.data)
                is UiState.Error -> showError(state.message)
            }
        }
    }
}
```

#### SharedFlow

热流，可配置重放数量和缓冲策略。

```kotlin
// 创建SharedFlow
val _events = MutableSharedFlow<Event>()
val events: SharedFlow<Event> = _events.asSharedFlow()

// 发射事件
launch {
    _events.emit(Event.ShowToast("Hello"))
}

// 收集
launch {
    events.collect { event ->
        handleEvent(event)
    }
}

// 配置SharedFlow
val _events = MutableSharedFlow<Event>(
    replay = 1,              // 新订阅者接收最近1个值
    extraBufferCapacity = 64, // 额外缓冲
    onBufferOverflow = BufferOverflow.DROP_OLDEST // 溢出策略
)

// 在ViewModel中使用（一次性事件）
class MyViewModel : ViewModel() {
    private val _events = MutableSharedFlow<Event>()
    val events: SharedFlow<Event> = _events.asSharedFlow()
    
    fun onButtonClick() {
        viewModelScope.launch {
            _events.emit(Event.NavigateToDetail)
        }
    }
}
```

#### shareIn

将冷流转换为热流。

```kotlin
// 基本用法
val flow = flowOf(1, 2, 3, 4, 5)
    .shareIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        replay = 1
    )

// SharingStarted策略
- SharingStarted.Eagerly: 立即开始，永不停止
- SharingStarted.Lazily: 首个订阅者时开始，永不停止
- SharingStarted.WhileSubscribed(stopTimeoutMillis): 有订阅者时活跃，最后一个订阅者取消后延迟停止

// 在ViewModel中使用
class MyViewModel : ViewModel() {
    val items: SharedFlow<List<Item>> = repository.getItems()
        .shareIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            replay = 1
        )
}
```

#### stateIn

将冷流转换为StateFlow。

```kotlin
// 基本用法
val stateFlow = flowOf(1, 2, 3, 4, 5)
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0
    )

// 在ViewModel中使用
class MyViewModel : ViewModel() {
    val uiState: StateFlow<UiState> = repository.getItems()
        .map { items -> UiState.Success(items) }
        .catch { emit(UiState.Error(it.message)) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UiState.Loading
        )
}
```

***

## 12. Select 表达式

### 12.1 Select概念

Select表达式允许同时等待多个挂起函数，选择第一个完成的。

```kotlin
// 从多个Channel中选择
suspend fun selectFromChannels(
    channel1: ReceiveChannel<String>,
    channel2: ReceiveChannel<String>
) = select<String> {
    channel1.onReceive { value -> "Channel 1: $value" }
    channel2.onReceive { value -> "Channel 2: $value" }
}

// 使用
val channel1 = produce {
    delay(100)
    send("Data 1")
}
val channel2 = produce {
    delay(50)
    send("Data 2")
}
println(selectFromChannels(channel1, channel2)) // Channel 2: Data 2
```

### 12.2 Select Deferred

```kotlin
suspend fun selectDeferred(
    deferred1: Deferred<String>,
    deferred2: Deferred<String>
) = select<String> {
    deferred1.onAwait { "Deferred 1: $it" }
    deferred2.onAwait { "Deferred 2: $it" }
}

val d1 = async {
    delay(100)
    "Result 1"
}
val d2 = async {
    delay(50)
    "Result 2"
}
println(selectDeferred(d1, d2)) // Deferred 2: Result 2
```

### 12.3 Select发送

```kotlin
suspend fun selectSend(
    channel1: SendChannel<String>,
    channel2: SendChannel<String>
) {
    select<Unit> {
        channel1.onSend("To channel 1") {
            println("Sent to channel 1")
        }
        channel2.onSend("To channel 2") {
            println("Sent to channel 2")
        }
    }
}
```

### 12.4 实际应用示例

```kotlin
// 超时选择
suspend fun fetchWithTimeout(): String {
    val dataDeferred = async { fetchData() }
    
    return select {
        dataDeferred.onAwait { it }
        onTimeout(5000) { "Timeout" }
    }
}

// 多个数据源选择最快的
suspend fun fetchFromMultipleSources(): Data {
    val source1 = async { api1.fetchData() }
    val source2 = async { api2.fetchData() }
    val source3 = async { api3.fetchData() }
    
    return select {
        source1.onAwait { it }
        source2.onAwait { it }
        source3.onAwait { it }
    }
}
```

***

## 13. 协程同步机制

### 13.1 Mutex

互斥锁，确保临界区代码串行执行。

```kotlin
val mutex = Mutex()
var counter = 0

// 使用withLock
suspend fun increment() {
    mutex.withLock {
        counter++
    }
}

// 手动lock/unlock
suspend fun increment() {
    mutex.lock()
    try {
        counter++
    } finally {
        mutex.unlock()
    }
}

// 并发测试
repeat(1000) {
    launch {
        repeat(1000) {
            increment()
        }
    }
}
println(counter) // 1000000
```

### 13.2 Semaphore

信号量，限制并发访问数量。

```kotlin
// 创建信号量（允许3个并发）
val semaphore = Semaphore(3)

// 使用withPermit
suspend fun accessResource() {
    semaphore.withPermit {
        // 最多3个协程同时执行
        println("Accessing resource")
        delay(1000)
    }
}

// 手动acquire/release
suspend fun accessResource() {
    semaphore.acquire()
    try {
        println("Accessing resource")
        delay(1000)
    } finally {
        semaphore.release()
    }
}

// 并发测试
repeat(10) {
    launch {
        accessResource()
    }
}
```

### 13.3 原子操作

使用原子类型避免竞争条件。

```kotlin
// AtomicInteger
val counter = AtomicInteger(0)

repeat(1000) {
    launch {
        repeat(1000) {
            counter.incrementAndGet()
        }
    }
}

// AtomicReference
val atomicRef = AtomicReference<String>("initial")
atomicRef.set("new value")
val oldValue = atomicRef.getAndSet("another value")

// compareAndSet
if (atomicRef.compareAndSet("expected", "new")) {
    println("Updated")
}
```

### 13.4 使用Actor进行同步

```kotlin
sealed class CounterMsg
object IncCounter : CounterMsg()
class GetCounter(val response: CompletableDeferred<Int>) : CounterMsg()

fun CoroutineScope.counterActor() = actor<CounterMsg> {
    var counter = 0
    for (msg in channel) {
        when (msg) {
            is IncCounter -> counter++
            is GetCounter -> msg.response.complete(counter)
        }
    }
}

// 使用
val counter = counterActor()
repeat(1000) {
    launch {
        counter.send(IncCounter)
    }
}
val response = CompletableDeferred<Int>()
counter.send(GetCounter(response))
println(response.await())
```

***

## 14. 协程最佳实践

### 14.1 结构化并发

始终使用结构化并发，避免使用GlobalScope。

```kotlin
// ❌ 不好的做法
fun loadData() {
    GlobalScope.launch {
        val data = fetchData()
    }
}

// ✅ 好的做法
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data = fetchData()
        }
    }
}

// ✅ 在自定义类中
class MyRepository {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    fun loadData() {
        scope.launch {
            // 工作
        }
    }
    
    fun cleanup() {
        scope.cancel()
    }
}
```

### 14.2 使用依赖注入提供Dispatcher

```kotlin
// 便于测试和替换
class DataRepository(
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    suspend fun fetchData(): Data = withContext(ioDispatcher) {
        api.getData()
    }
}

// 测试时
@Test
fun testFetchData() = runTest {
    val testDispatcher = StandardTestDispatcher()
    val repository = DataRepository(testDispatcher)
    val data = repository.fetchData()
    assertEquals(expected, data)
}
```

### 14.3 正确处理异常

```kotlin
// ❌ 捕获CancellationException
launch {
    try {
        work()
    } catch (e: Exception) {
        // 会错误地捕获CancellationException
        handleError(e)
    }
}

// ✅ 正确处理
launch {
    try {
        work()
    } catch (e: CancellationException) {
        throw e // 重新抛出
    } catch (e: Exception) {
        handleError(e)
    }
}

// ✅ 更好的方式
launch {
    runCatching {
        work()
    }.onFailure { e ->
        if (e is CancellationException) throw e
        handleError(e)
    }
}
```

### 14.4 避免内存泄漏

```kotlin
// ❌ Activity中启动协程未取消
class MyActivity : AppCompatActivity() {
    fun loadData() {
        CoroutineScope(Dispatchers.Main).launch {
            // 可能导致内存泄漏
        }
    }
}

// ✅ 使用lifecycleScope
class MyActivity : AppCompatActivity() {
    fun loadData() {
        lifecycleScope.launch {
            // 生命周期结束时自动取消
        }
    }
}

// ✅ 自定义scope并在onDestroy取消
class MyActivity : AppCompatActivity() {
    private val scope = MainScope()
    
    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
```

### 14.5 合理使用SupervisorJob

```kotlin
// ✅ 多个独立任务
val scope = CoroutineScope(SupervisorJob())
scope.launch { task1() } // 失败不影响其他
scope.launch { task2() }
scope.launch { task3() }

// ✅ 带异常处理
val handler = CoroutineExceptionHandler { _, e ->
    logError(e)
}
val scope = CoroutineScope(SupervisorJob() + handler)
```

### 14.6 Flow最佳实践

```kotlin
// ✅ 使用StateFlow管理UI状态
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
}

// ✅ 使用SharedFlow处理一次性事件
class MyViewModel : ViewModel() {
    private val _events = MutableSharedFlow<Event>()
    val events: SharedFlow<Event> = _events.asSharedFlow()
}

// ✅ 使用stateIn进行转换
val items: StateFlow<List<Item>> = repository.observeItems()
    .map { it.sortedBy { item -> item.name } }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )
```

### 14.7 测试协程

```kotlin
// 使用runTest
@Test
fun testCoroutine() = runTest {
    val repository = DataRepository()
    val data = repository.fetchData()
    assertEquals(expected, data)
}

// 测试delay
@Test
fun testWithDelay() = runTest {
    launch {
        delay(1000)
        doWork()
    }
    advanceTimeBy(1000) // 快进时间
    // 验证
}

// 测试Flow
@Test
fun testFlow() = runTest {
    val flow = flowOf(1, 2, 3)
    val result = flow.toList()
    assertEquals(listOf(1, 2, 3), result)
}

// 使用TestDispatcher
@Test
fun testWithTestDispatcher() = runTest {
    val testDispatcher = StandardTestDispatcher(testScheduler)
    val repository = DataRepository(testDispatcher)
    
    launch(testDispatcher) {
        repository.loadData()
    }
    
    advanceUntilIdle() // 执行所有待定协程
}
```

### 14.8 性能优化

```kotlin
// ✅ 使用async进行并发
suspend fun loadAllData() = coroutineScope {
    val user = async { fetchUser() }
    val posts = async { fetchPosts() }
    val comments = async { fetchComments() }
    
    Triple(user.await(), posts.await(), comments.await())
}

// ✅ 使用Flow缓冲
flow {
    repeat(100) {
        emit(it)
        delay(100)
    }
}.buffer(10)
.collect { process(it) }

// ✅ 限制并发数量
val semaphore = Semaphore(5)
items.map { item ->
    async {
        semaphore.withPermit {
            processItem(item)
        }
    }
}.awaitAll()
```

***

## 附录：常用API速查

### 协程构建器

*   `launch`: 启动新协程，返回Job
*   `async`: 启动新协程，返回Deferred
*   `runBlocking`: 阻塞线程直到协程完成
*   `withContext`: 切换上下文执行代码块
*   `coroutineScope`: 创建新作用域等待所有子协程
*   `supervisorScope`: 子协程失败不影响兄弟协程

### 作用域

*   `GlobalScope`: 全局作用域（不推荐）
*   `MainScope`: 主线程作用域
*   `CoroutineScope()`: 自定义作用域
*   `lifecycleScope`: Activity/Fragment作用域
*   `viewModelScope`: ViewModel作用域

### 调度器

*   `Dispatchers.Main`: 主线程
*   `Dispatchers.IO`: IO操作
*   `Dispatchers.Default`: CPU密集操作
*   `Dispatchers.Unconfined`: 不限制线程

### Job操作

*   `job.join()`: 等待完成
*   `job.cancel()`: 取消
*   `job.cancelAndJoin()`: 取消并等待
*   `isActive`: 检查是否活跃
*   `ensureActive()`: 检查并抛出异常

### Flow操作符

*   **创建**: `flow{}`, `flowOf()`, `asFlow()`
*   **转换**: `map`, `filter`, `transform`, `flatMapConcat`
*   **末端**: `collect`, `toList`, `first`, `reduce`
*   **上下文**: `flowOn`
*   **缓冲**: `buffer`, `conflate`, `collectLatest`
*   **组合**: `zip`, `combine`
*   **异常**: `catch`, `retry`

### 热流

*   `StateFlow`: 状态流，保存当前值
*   `SharedFlow`: 共享流，可配置重放
*   `shareIn`: 冷流转热流
*   `stateIn`: 冷流转StateFlow

***

## 总结

Kotlin协程提供了强大而灵活的异步编程能力，关键要点：

1.  **结构化并发**：使用适当的作用域管理协程生命周期
2.  **适当的调度器**：根据任务类型选择合适的Dispatcher
3.  **异常处理**：正确使用SupervisorJob和CoroutineExceptionHandler
4.  **资源管理**：确保协程正确取消，避免内存泄漏
5.  **Flow优先**：使用Flow处理异步数据流
6.  **测试友好**：依赖注入Dispatcher，使用runTest

遵循这些最佳实践，可以编写出高效、健壮、易维护的协程代码。
