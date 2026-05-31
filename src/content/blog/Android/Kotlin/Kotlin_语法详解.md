---
title: "Kotlin_语法详解"
description: "1. [基础语法](一基础语法) 2. [变量与数据类型](二变量与数据类型) 3. [函数](三函数) 4. [控制流](四控制流) 5. [类与对象](五类与对象) 6. [继承与接口](六继承与接口) 7. [数据类、密封类、枚..."
pubDate: 2026-05-31
category: "Kotlin"
tags: [Array, API]
draft: false
---
# Kotlin 语法详解

## 目录

1. [基础语法](#一基础语法)
2. [变量与数据类型](#二变量与数据类型)
3. [函数](#三函数)
4. [控制流](#四控制流)
5. [类与对象](#五类与对象)
6. [继承与接口](#六继承与接口)
7. [数据类、密封类、枚举类](#七数据类密封类枚举类)
8. [空安全](#八空安全)
9. [Lambda 与高阶函数](#九lambda-与高阶函数)
10. [扩展函数与扩展属性](#十扩展函数与扩展属性)
11. [集合](#十一集合)
12. [泛型](#十二泛型)
13. [协程基础](#十三协程基础)
14. [委托](#十四委托)
15. [作用域函数](#十五作用域函数)
16. [对象表达式与伴生对象](#十六对象表达式与伴生对象)
17. [解构声明](#十七解构声明)
18. [运算符重载](#十八运算符重载)
19. [注解与反射](#十九注解与反射)
20. [常用惯用法](#二十常用惯用法)

---

## 一、基础语法

### 1.1 包声明与导入

```kotlin
package com.example.app       // 包名无需与目录结构完全对应

import kotlin.math.sqrt
import kotlin.math.*           // 通配符导入
import com.example.Foo as Bar  // 别名导入，解决命名冲突
```

### 1.2 程序入口

```kotlin
fun main() {
    println("Hello, Kotlin!")
}

// 带命令行参数
fun main(args: Array<String>) {
    println(args.joinToString())
}
```

### 1.3 注释

```kotlin
// 单行注释

/* 多行
   注释 */

/**
 * KDoc 文档注释
 * @param name 参数说明
 * @return 返回值说明
 */
fun greet(name: String): String = "Hello, $name"
```

---

## 二、变量与数据类型

### 2.1 变量声明

```kotlin
val name: String = "Kotlin"   // 不可变（类似 Java final）
var count: Int = 0             // 可变
val inferred = "类型推断"       // 自动推断为 String
var x = 10                     // 自动推断为 Int
```

### 2.2 基本数据类型

Kotlin 中一切皆对象，没有 Java 的原始类型。

| 类型 | 位数 | 范围 / 说明 |
|------|------|------------|
| `Byte` | 8 | -128 ~ 127 |
| `Short` | 16 | -32768 ~ 32767 |
| `Int` | 32 | -2³¹ ~ 2³¹-1 |
| `Long` | 64 | -2⁶³ ~ 2⁶³-1 |
| `Float` | 32 | 单精度浮点 |
| `Double` | 64 | 双精度浮点 |
| `Char` | 16 | 单个 Unicode 字符 |
| `Boolean` | — | `true` / `false` |
| `String` | — | 不可变字符串 |

```kotlin
val i: Int = 100
val l: Long = 100L
val f: Float = 1.5f
val d: Double = 1.5
val c: Char = 'A'
val b: Boolean = true

// 数字字面量：下划线提高可读性
val million = 1_000_000
val hex = 0xFF_EC_D1_12
val binary = 0b0001_0001
```

### 2.3 字符串

```kotlin
val s = "Hello"
val len = s.length

// 字符串模板
val name = "World"
println("Hello, $name!")              // 简单变量
println("1 + 1 = ${1 + 1}")          // 表达式
println("Length: ${name.length}")

// 原始字符串（三引号，保留换行和缩进）
val json = """
    {
        "name": "Kotlin",
        "version": 2.0
    }
""".trimIndent()

// 常用字符串操作
"hello".uppercase()          // "HELLO"
"HELLO".lowercase()          // "hello"
"  hi  ".trim()              // "hi"
"hello".startsWith("he")     // true
"hello".contains("ell")      // true
"hello".replace("l", "r")    // "herro"
"a,b,c".split(",")           // ["a", "b", "c"]
"hello".substring(1, 3)      // "el"
```

### 2.4 类型转换

Kotlin **不支持隐式类型转换**，必须显式调用转换函数：

```kotlin
val i: Int = 42
val l: Long = i.toLong()       // Int → Long
val d: Double = i.toDouble()   // Int → Double
val s: String = i.toString()   // Int → String
val n: Int = "123".toInt()     // String → Int
val n2 = "abc".toIntOrNull()   // 安全转换，失败返回 null

// 类型检查与智能转换
val obj: Any = "Hello"
if (obj is String) {
    println(obj.length)        // 智能转换：自动识别为 String
}
val len = (obj as? String)?.length  // 安全转型，失败返回 null
```

---

## 三、函数

### 3.1 函数声明

```kotlin
// 基本形式
fun add(a: Int, b: Int): Int {
    return a + b
}

// 单表达式函数（省略 return 和大括号）
fun add(a: Int, b: Int): Int = a + b

// 返回 Unit（相当于 void，可省略）
fun printHello(): Unit = println("Hello")
fun printHello() = println("Hello")
```

### 3.2 默认参数与命名参数

```kotlin
fun greet(name: String, greeting: String = "Hello", times: Int = 1) {
    repeat(times) { println("$greeting, $name!") }
}

greet("Kotlin")                          // Hello, Kotlin!
greet("Kotlin", "Hi")                   // Hi, Kotlin!
greet(name = "Kotlin", times = 3)       // 命名参数，可乱序
greet(times = 2, name = "Kotlin")
```

### 3.3 可变参数

```kotlin
fun sum(vararg numbers: Int): Int = numbers.sum()

sum(1, 2, 3)           // 6
sum(*intArrayOf(1, 2)) // spread 运算符展开数组
```

### 3.4 局部函数

```kotlin
fun processData(data: List<Int>): List<Int> {
    // 定义在函数内部的局部函数，可访问外层变量
    fun isValid(n: Int) = n > 0 && n < 100

    return data.filter { isValid(it) }
}
```

### 3.5 尾递归优化

```kotlin
// tailrec 关键字：编译器将递归优化为循环，避免栈溢出
tailrec fun factorial(n: Long, acc: Long = 1): Long =
    if (n <= 1) acc else factorial(n - 1, n * acc)
```

### 3.6 中缀函数

```kotlin
infix fun Int.add(other: Int) = this + other
val result = 3 add 5  // 等价于 3.add(5)，结果为 8

// 标准库中的中缀函数
val pair = "key" to "value"   // Pair<String, String>
val range = 1 until 10        // IntRange
```

---

## 四、控制流

### 4.1 if 表达式

Kotlin 的 `if` 是**表达式**，可有返回值：

```kotlin
val max = if (a > b) a else b

// 多行块 if 表达式，最后一行为返回值
val desc = if (score >= 90) {
    println("计算中...")
    "优秀"
} else if (score >= 60) {
    "及格"
} else {
    "不及格"
}
```

### 4.2 when 表达式

`when` 是 Kotlin 版的 `switch`，功能更强大：

```kotlin
// 基本用法
when (x) {
    1 -> println("one")
    2, 3 -> println("two or three")     // 多值匹配
    in 4..10 -> println("4 to 10")     // 范围匹配
    !in 11..20 -> println("not 11-20")
    else -> println("other")
}

// when 作为表达式
val type = when (x) {
    is Int -> "整数"
    is String -> "字符串"
    is List<*> -> "列表"
    else -> "未知"
}

// 无参数 when（替代 if-else if 链）
when {
    x < 0 -> println("负数")
    x == 0 -> println("零")
    else -> println("正数")
}
```

### 4.3 for 循环

```kotlin
// 遍历集合
for (item in listOf(1, 2, 3)) println(item)

// 遍历区间
for (i in 1..5) print(i)         // 1 2 3 4 5
for (i in 1 until 5) print(i)    // 1 2 3 4（不含末尾）
for (i in 5 downTo 1) print(i)   // 5 4 3 2 1
for (i in 0..10 step 2) print(i) // 0 2 4 6 8 10

// 带索引遍历
for ((index, value) in list.withIndex()) {
    println("$index: $value")
}
```

### 4.4 while 循环

```kotlin
var i = 0
while (i < 5) { println(i); i++ }

// do-while：至少执行一次
do {
    println(i)
    i++
} while (i < 5)
```

### 4.5 跳转：break / continue / return

```kotlin
// 标签（label）控制嵌套循环跳转
outer@ for (i in 1..3) {
    for (j in 1..3) {
        if (j == 2) continue@outer  // 跳过外层循环本次迭代
        if (i == 2) break@outer     // 跳出外层循环
        println("$i, $j")
    }
}

// Lambda 中的 return（默认返回 Lambda 本身，需加标签）
listOf(1, 2, 3).forEach label@{
    if (it == 2) return@label  // 只跳出当次 lambda
    println(it)
}
```

---

## 五、类与对象

### 5.1 类的声明

```kotlin
class Person(
    val name: String,          // 主构造函数参数，同时声明属性
    var age: Int
) {
    // init 块：主构造函数执行后立即运行
    init {
        require(age >= 0) { "年龄不能为负数" }
        println("Person created: $name")
    }

    // 次构造函数，必须委托主构造函数
    constructor(name: String) : this(name, 0)

    // 成员函数
    fun introduce() = "我是 $name，今年 $age 岁"
}

val p = Person("Alice", 30)
println(p.name)      // Alice
println(p.age)       // 30
p.age = 31           // var 可修改
```

### 5.2 属性

```kotlin
class Rectangle(val width: Double, val height: Double) {

    // 计算属性（自定义 getter）
    val area: Double
        get() = width * height

    // 带 backing field 的属性
    var name: String = ""
        get() = field.uppercase()           // field 指向 backing field
        set(value) { field = value.trim() }

    // 延迟初始化（lateinit，仅适用于非空类型的 var）
    lateinit var data: ByteArray

    fun initData() {
        data = ByteArray(1024)
    }
}
```

### 5.3 可见性修饰符

| 修饰符 | 类成员 | 顶层声明 |
|--------|--------|---------|
| `public`（默认） | 所有地方可见 | 所有地方可见 |
| `private` | 类内部可见 | 文件内可见 |
| `protected` | 类及子类可见 | 不适用 |
| `internal` | 同模块（module）可见 | 同模块可见 |

---

## 六、继承与接口

### 6.1 继承

Kotlin 类默认是 `final`（不可继承），需要 `open` 关键字开放：

```kotlin
open class Animal(val name: String) {
    open fun sound() = "..."        // open 才能被重写
    fun breathe() = "呼吸"          // 不可重写
}

class Dog(name: String) : Animal(name) {
    override fun sound() = "汪汪"   // 必须加 override

    // final override 防止继续被重写
    // final override fun sound() = "汪汪"
}
```

### 6.2 接口

```kotlin
interface Flyable {
    val maxSpeed: Int       // 抽象属性
    val minSpeed: Int get() = 0  // 有默认实现的属性

    fun fly()               // 抽象方法
    fun land() {            // 有默认实现的方法
        println("降落中...")
    }
}

interface Swimmable {
    fun swim()
}

// 实现多个接口
class Duck : Flyable, Swimmable {
    override val maxSpeed = 50
    override fun fly() = println("鸭子飞翔")
    override fun swim() = println("鸭子游泳")
}
```

### 6.3 抽象类

```kotlin
abstract class Shape {
    abstract val area: Double        // 抽象属性
    abstract fun draw()              // 抽象方法
    fun describe() = "面积为 $area"  // 具体方法
}

class Circle(val radius: Double) : Shape() {
    override val area = Math.PI * radius * radius
    override fun draw() = println("画圆，半径=$radius")
}
```

---

## 七、数据类、密封类、枚举类

### 7.1 数据类（data class）

编译器自动生成 `equals()`、`hashCode()`、`toString()`、`copy()`、`componentN()`：

```kotlin
data class User(val id: Int, val name: String, val email: String)

val user1 = User(1, "Alice", "alice@example.com")
val user2 = user1.copy(email = "new@example.com")  // 拷贝并修改部分属性

println(user1 == user2)       // false（比较值）
println(user1.toString())     // User(id=1, name=Alice, email=alice@example.com)

// 解构
val (id, name, email) = user1
```

### 7.2 密封类（sealed class）

限制子类只能在同一文件中定义，常与 `when` 配合使用，实现穷举：

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val cause: Throwable? = null) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

fun handleResult(result: Result<String>) {
    when (result) {
        is Result.Success -> println("成功: ${result.data}")
        is Result.Error   -> println("错误: ${result.message}")
        Result.Loading    -> println("加载中...")
        // 无需 else，编译器确认已穷举
    }
}
```

### 7.3 枚举类（enum class）

```kotlin
enum class Direction(val degrees: Int) {
    NORTH(0), EAST(90), SOUTH(180), WEST(270);

    fun opposite(): Direction = when (this) {
        NORTH -> SOUTH
        SOUTH -> NORTH
        EAST  -> WEST
        WEST  -> EAST
    }
}

val dir = Direction.NORTH
println(dir.name)        // "NORTH"
println(dir.ordinal)     // 0
println(dir.degrees)     // 0
println(dir.opposite())  // SOUTH

Direction.values().forEach { println(it) }
val d = Direction.valueOf("EAST")
```

### 7.4 内联类（value class）

包装单个值，编译后避免额外对象分配：

```kotlin
@JvmInline
value class UserId(val value: Int)

@JvmInline
value class Email(val value: String) {
    init { require("@" in value) { "非法邮箱" } }
}
```

---

## 八、空安全

Kotlin 的类型系统区分**可空类型**（`T?`）和**非空类型**（`T`），在编译期消除空指针异常。

### 8.1 可空类型与安全调用

```kotlin
var name: String = "Kotlin"    // 非空，不能赋值 null
var nullable: String? = null   // 可空

// 安全调用运算符 ?.（为 null 时直接返回 null）
val length = nullable?.length           // Int? 类型
val upper = nullable?.uppercase()?.trim()  // 链式安全调用

// Elvis 运算符 ?:（左侧为 null 时取右侧值）
val len = nullable?.length ?: 0         // 为 null 时返回 0
val result = nullable ?: "默认值"
val user = findUser(id) ?: throw IllegalArgumentException("User not found")
```

### 8.2 非空断言与智能转换

```kotlin
// !! 运算符：强制非空断言，为 null 时抛 NullPointerException（谨慎使用）
val len = nullable!!.length

// 智能转换（null 检查后自动转为非空类型）
if (nullable != null) {
    println(nullable.length)  // 此处自动推断为 String
}

// let 配合 ?.（仅非空时执行块）
nullable?.let { value ->
    println("值为: $value")
    value.uppercase()
}
```

### 8.3 安全类型转换

```kotlin
val obj: Any = "Hello"
val str: String? = obj as? String   // 转换失败返回 null，不抛异常
val num: Int? = obj as? Int         // null
```

---

## 九、Lambda 与高阶函数

### 9.1 Lambda 表达式

```kotlin
// 完整语法
val sum: (Int, Int) -> Int = { a: Int, b: Int -> a + b }

// 类型推断简化
val sum = { a: Int, b: Int -> a + b }

// 单参数用 it 代替
val double: (Int) -> Int = { it * 2 }

// 多行 Lambda，最后一行为返回值
val process: (Int) -> String = {
    val doubled = it * 2
    "结果: $doubled"
}
```

### 9.2 高阶函数

```kotlin
// 接收函数作为参数
fun operate(a: Int, b: Int, op: (Int, Int) -> Int): Int = op(a, b)

operate(3, 4) { x, y -> x + y }   // 7
operate(3, 4, Int::plus)           // 函数引用，7

// 返回函数
fun multiplier(factor: Int): (Int) -> Int = { it * factor }
val triple = multiplier(3)
println(triple(5))  // 15
```

### 9.3 函数引用

```kotlin
fun isEven(n: Int) = n % 2 == 0

val ref: (Int) -> Boolean = ::isEven         // 顶层函数引用
val upper: String.() -> String = String::uppercase  // 成员函数引用
val factory: (Int, Int) -> Point = ::Point   // 构造函数引用
```

### 9.4 常用高阶函数

```kotlin
val nums = listOf(1, 2, 3, 4, 5, 6)

nums.filter { it % 2 == 0 }               // [2, 4, 6]
nums.map { it * it }                       // [1, 4, 9, 16, 25, 36]
nums.flatMap { listOf(it, -it) }           // [1,-1, 2,-2, ...]
nums.reduce { acc, n -> acc + n }          // 21
nums.fold(10) { acc, n -> acc + n }        // 31（初始值 10）
nums.any { it > 5 }                        // true
nums.all { it > 0 }                        // true
nums.none { it > 10 }                      // true
nums.count { it % 2 == 0 }                // 3
nums.find { it > 3 }                       // 4
nums.firstOrNull { it > 10 }              // null
nums.sortedBy { -it }                      // [6, 5, 4, 3, 2, 1]
nums.groupBy { if (it % 2 == 0) "偶" else "奇" }
nums.partition { it % 2 == 0 }            // Pair<[2,4,6], [1,3,5]>
nums.zip(listOf("a","b","c"))             // [(1,a),(2,b),(3,c)]
nums.windowed(3)                           // [[1,2,3],[2,3,4],...]
nums.chunked(2)                            // [[1,2],[3,4],[5,6]]
nums.take(3)                               // [1, 2, 3]
nums.drop(3)                               // [4, 5, 6]
nums.distinct()                            // 去重
```

---

## 十、扩展函数与扩展属性

### 10.1 扩展函数

不修改类源码，为现有类添加新函数：

```kotlin
fun String.isPalindrome(): Boolean = this == this.reversed()

"racecar".isPalindrome()   // true
"hello".isPalindrome()     // false

fun Int.isEven() = this % 2 == 0
fun Int.coerceToRange(min: Int, max: Int) = when {
    this < min -> min
    this > max -> max
    else -> this
}
```

### 10.2 扩展属性

```kotlin
val String.wordCount: Int
    get() = trim().split("\\s+".toRegex()).size

val List<Int>.secondOrNull: Int?
    get() = if (size >= 2) this[1] else null

"hello world kotlin".wordCount  // 3
```

### 10.3 扩展与成员函数优先级

同名时，成员函数优先于扩展函数。

---

## 十一、集合

### 11.1 集合类型

| 类型 | 不可变 | 可变 |
|------|--------|------|
| List | `listOf()` | `mutableListOf()` |
| Set | `setOf()` | `mutableSetOf()` |
| Map | `mapOf()` | `mutableMapOf()` |

```kotlin
// List
val list = listOf(1, 2, 3)
val mList = mutableListOf(1, 2, 3)
mList.add(4)
mList.removeAt(0)

// Set（无序，无重复）
val set = setOf(1, 2, 2, 3)      // {1, 2, 3}

// Map
val map = mapOf("a" to 1, "b" to 2)
val mMap = mutableMapOf("x" to 10)
mMap["y"] = 20
mMap.getOrDefault("z", 0)
mMap.getOrPut("z") { 30 }

// 遍历 Map
for ((key, value) in map) println("$key -> $value")
map.forEach { (k, v) -> println("$k=$v") }
```

### 11.2 序列（Sequence）

惰性求值，适合处理大数据集，避免中间集合分配：

```kotlin
// 集合（急切求值）vs Sequence（惰性求值）
(1..1_000_000).asSequence()
    .filter { it % 2 == 0 }
    .map { it * 3 }
    .take(5)
    .toList()   // 终止操作，触发求值

// 无限序列
val fibonacci = generateSequence(Pair(0, 1)) { (a, b) -> Pair(b, a + b) }
    .map { it.first }
    .take(10)
    .toList()   // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

## 十二、泛型

### 12.1 泛型类与函数

```kotlin
class Box<T>(val value: T) {
    fun getValue(): T = value
}

fun <T> List<T>.secondOrNull(): T? = if (size >= 2) this[1] else null
```

### 12.2 型变（Variance）

```kotlin
// out（协变）：只能读取（生产者）
class Producer<out T>(private val value: T) {
    fun produce(): T = value
}
val producer: Producer<Number> = Producer<Int>(42)

// in（逆变）：只能写入（消费者）
class Consumer<in T> {
    fun consume(value: T) { println(value) }
}
val consumer: Consumer<Int> = Consumer<Number>()
```

### 12.3 泛型约束

```kotlin
fun <T : Comparable<T>> max(a: T, b: T): T = if (a > b) a else b

// 多个约束
fun <T> process(list: List<T>): String
    where T : Comparable<T>, T : CharSequence {
    return list.sorted().joinToString()
}
```

### 12.4 reified 内联泛型

```kotlin
// reified 配合 inline 可在运行时保留类型信息（突破泛型擦除）
inline fun <reified T> Any.isInstance(): Boolean = this is T
inline fun <reified T> List<*>.filterByType(): List<T> =
    filter { it is T }.map { it as T }

"hello".isInstance<String>()          // true
listOf(1, "a", 2, "b").filterByType<String>()  // ["a", "b"]
```

---

## 十三、协程基础

### 13.1 基本概念

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    // launch：启动不返回结果的协程
    val job = launch {
        delay(1000)
        println("Hello from coroutine")
    }

    // async：启动返回结果的协程（Deferred）
    val deferred = async {
        delay(500)
        42
    }

    val result = deferred.await()  // 等待并获取结果
    println("结果: $result")
    job.join()
}
```

### 13.2 协程调度器

```kotlin
Dispatchers.Main      // Android 主线程
Dispatchers.IO        // IO 密集型（文件、网络）
Dispatchers.Default   // CPU 密集型（计算）

// 切换线程
viewModelScope.launch {
    val data = withContext(Dispatchers.IO) {
        fetchFromNetwork()  // IO 线程
    }
    updateUI(data)  // 回到主线程
}
```

### 13.3 挂起函数

```kotlin
suspend fun fetchUser(id: Int): User {
    return withContext(Dispatchers.IO) {
        delay(1000)
        User(id, "Alice")
    }
}

// 并发执行
suspend fun loadDashboard() = coroutineScope {
    val user = async { fetchUser(1) }
    val posts = async { fetchPosts() }
    Dashboard(user.await(), posts.await())
}
```

### 13.4 Flow

```kotlin
// 创建 Flow（冷流，订阅时才执行）
fun countDown(from: Int): Flow<Int> = flow {
    for (i in from downTo 0) {
        emit(i)
        delay(1000)
    }
}

// 收集 Flow
viewModelScope.launch {
    countDown(5)
        .filter { it % 2 == 0 }
        .map { "倒计时: $it" }
        .collect { println(it) }
}

// StateFlow（热流，状态持有）
val _uiState = MutableStateFlow<UiState>(UiState.Loading)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()
```

---

## 十四、委托

### 14.1 类委托

```kotlin
interface Printer {
    fun print(text: String)
}

class ConsolePrinter : Printer {
    override fun print(text: String) = println(text)
}

// by 关键字：将接口实现委托给另一个对象
class LoggingPrinter(private val delegate: Printer) : Printer by delegate {
    override fun print(text: String) {
        println("[LOG] $text")
        delegate.print(text)
    }
}
```

### 14.2 属性委托

```kotlin
import kotlin.properties.Delegates

class Example {
    // lazy：首次访问时初始化，线程安全
    val lazyValue: String by lazy {
        println("初始化...")
        "Hello"
    }

    // observable：值改变时触发回调
    var name: String by Delegates.observable("初始值") { _, old, new ->
        println("$old → $new")
    }

    // vetoable：值改变前可拦截（返回 false 则拒绝赋值）
    var age: Int by Delegates.vetoable(0) { _, _, new -> new >= 0 }

    // 委托给 Map（常用于 JSON 解析）
    val map = mapOf("x" to 1, "y" to 2)
    val x: Int by map
    val y: Int by map
}
```

### 14.3 自定义委托

```kotlin
import kotlin.reflect.KProperty

class NonNullDelegate<T>(private var value: T? = null) {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T =
        value ?: throw IllegalStateException("${property.name} 未初始化")

    operator fun setValue(thisRef: Any?, property: KProperty<*>, newValue: T) {
        value = newValue
    }
}

class Config {
    var apiKey: String by NonNullDelegate()
}
```

---

## 十五、作用域函数

| 函数 | 接收者 | 返回值 | 适用场景 |
|------|--------|--------|---------|
| `let` | `it` | Lambda 结果 | 非空检查、链式转换 |
| `run` | `this` | Lambda 结果 | 对象初始化 + 计算结果 |
| `with` | `this` | Lambda 结果 | 操作同一对象的多个方法 |
| `apply` | `this` | 接收者对象 | 对象配置/构建 |
| `also` | `it` | 接收者对象 | 附加操作（日志、校验） |

```kotlin
// let：非空时执行，转换对象
val len = name?.let { it.uppercase().length }

// run：初始化并计算结果
val result = StringBuilder().run {
    append("Hello")
    append(", Kotlin")
    toString()
}

// with：批量操作同一对象
with(stringBuilder) {
    append("Hello")
    append(" World")
}

// apply：构建对象（返回对象本身）
val textView = TextView(context).apply {
    text = "Hello"
    textSize = 16f
    setTextColor(Color.BLACK)
}

// also：附加副作用，不改变链式调用
val numbers = mutableListOf(1, 2, 3)
    .also { println("初始: $it") }
    .apply { add(4) }
    .also { println("修改后: $it") }
```

---

## 十六、对象表达式与伴生对象

### 16.1 object 单例

```kotlin
object DatabaseManager {
    fun connect(url: String) { /* ... */ }
    fun query(sql: String): List<Map<String, Any>> = emptyList()
}

DatabaseManager.connect("jdbc:sqlite:app.db")
```

### 16.2 伴生对象（companion object）

```kotlin
class User private constructor(val id: Int, val name: String) {

    companion object Factory {
        private var nextId = 1
        fun create(name: String) = User(nextId++, name)

        const val MAX_NAME_LENGTH = 50

        @JvmStatic
        fun fromJson(json: String): User = TODO()
    }
}

val user = User.create("Alice")
println(User.MAX_NAME_LENGTH)  // 50
```

### 16.3 对象表达式（匿名对象）

```kotlin
// 匿名接口实现（SAM 接口可直接用 Lambda）
button.setOnClickListener(object : View.OnClickListener {
    override fun onClick(v: View) = println("点击了")
})

// 简化为 Lambda
button.setOnClickListener { println("点击了") }
```

---

## 十七、解构声明

```kotlin
// data class 自动生成 componentN 函数
data class Point(val x: Int, val y: Int)
val (x, y) = Point(3, 4)

// 解构 Map 遍历
for ((key, value) in mapOf("a" to 1, "b" to 2)) {
    println("$key = $value")
}

// 忽略某个分量用 _
val (_, name, email) = User(1, "Alice", "alice@example.com")

// Lambda 参数解构
listOf(Point(1, 2), Point(3, 4)).forEach { (x, y) ->
    println("x=$x, y=$y")
}

// 函数返回多个值
fun minMax(nums: List<Int>): Pair<Int, Int> = nums.min() to nums.max()
val (min, max) = minMax(listOf(3, 1, 4, 1, 5))
```

---

## 十八、运算符重载

```kotlin
data class Vector(val x: Double, val y: Double) {
    operator fun plus(other: Vector) = Vector(x + other.x, y + other.y)
    operator fun minus(other: Vector) = Vector(x - other.x, y - other.y)
    operator fun times(scalar: Double) = Vector(x * scalar, y * scalar)
    operator fun unaryMinus() = Vector(-x, -y)
    operator fun get(index: Int) = when (index) {
        0 -> x; 1 -> y
        else -> throw IndexOutOfBoundsException()
    }
    operator fun component1() = x
    operator fun component2() = y
}

val v1 = Vector(1.0, 2.0)
val v2 = Vector(3.0, 4.0)
val v3 = v1 + v2              // Vector(4.0, 6.0)
val v4 = v1 * 2.0             // Vector(2.0, 4.0)
val (x, y) = v3               // 解构
```

**常用可重载运算符对应函数名：**

| 运算符 | 函数名 |
|--------|--------|
| `+` `-` `*` `/` `%` | `plus` `minus` `times` `div` `rem` |
| `+=` `-=` | `plusAssign` `minusAssign` |
| `==` `!=` | `equals` |
| `<` `>` `<=` `>=` | `compareTo` |
| `[]` | `get` / `set` |
| `in` | `contains` |
| `..` | `rangeTo` |
| `()` | `invoke` |

---

## 十九、注解与反射

### 19.1 注解

```kotlin
// 声明注解
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class Log(val tag: String = "DEFAULT")

// 常用内置注解
@JvmStatic        // 生成 Java 静态方法
@JvmOverloads     // 为默认参数生成多个 Java 重载
@JvmField         // 将属性暴露为 Java 字段
@Suppress("UNCHECKED_CAST")
@Deprecated("使用 newFunc()", ReplaceWith("newFunc()"))
```

### 19.2 反射

```kotlin
import kotlin.reflect.full.*

data class Person(val name: String, var age: Int)

val kClass = Person::class
println(kClass.simpleName)    // "Person"

// 获取并读取属性
val nameProp = kClass.memberProperties.find { it.name == "name" }
val p = Person("Alice", 30)
println(nameProp?.get(p))     // "Alice"

// 通过主构造函数创建实例
val newPerson = kClass.primaryConstructor?.call("Bob", 25)
```

---

## 二十、常用惯用法

### 20.1 懒加载

```kotlin
val heavyObject: HeavyObject by lazy { HeavyObject() }
```

### 20.2 空值处理

```kotlin
val result = value?.process() ?: defaultValue
value?.let { doSomething(it) }
user?.address?.city?.uppercase() ?: "未知城市"
```

### 20.3 集合操作

```kotlin
// 按条件分组统计
val scores = listOf(85, 92, 78, 95, 60, 73)
val summary = scores.groupBy {
    when {
        it >= 90 -> "优秀"
        it >= 75 -> "良好"
        else -> "一般"
    }
}.mapValues { (_, v) -> v.size }

// associateWith
val nameToLength = listOf("Alice", "Bob", "Charlie")
    .associateWith { it.length }   // {Alice=5, Bob=3, Charlie=7}
```

### 20.4 字符串构建

```kotlin
val text = buildString {
    append("Hello")
    repeat(3) { append(" Kotlin") }
    appendLine()
    append("!")
}
```

### 20.5 安全执行可能抛异常的代码

```kotlin
val result = runCatching {
    riskyOperation()
}.getOrElse { exception ->
    println("出错: ${exception.message}")
    defaultValue
}

// 链式处理
val value = runCatching { parseJson(input) }
    .map { it.getData() }
    .onFailure { log.error("解析失败", it) }
    .getOrDefault(emptyList())
```

### 20.6 类型安全的 DSL 构建器

```kotlin
class HtmlBuilder {
    private val content = StringBuilder()
    fun h1(text: String) = content.appendLine("<h1>$text</h1>")
    fun p(text: String) = content.appendLine("<p>$text</p>")
    fun build() = "<html>${content}</html>"
}

fun html(init: HtmlBuilder.() -> Unit): String =
    HtmlBuilder().apply(init).build()

val page = html {
    h1("Hello, Kotlin DSL!")
    p("这是一段描述")
}
```

---

## 附录：Kotlin vs Java 快速对比

| 特性 | Java | Kotlin |
|------|------|--------|
| 空安全 | 运行时 NPE | 编译期检查 |
| 数据类 | 手写 getter/setter/equals | `data class` 一行搞定 |
| 单例 | 双重检查锁 | `object` 关键字 |
| 扩展方法 | 不支持 | 原生支持 |
| Lambda | 冗长 | 简洁 |
| 协程 | 无（需第三方） | 原生支持 |
| 字符串模板 | 字符串拼接 | `"$variable"` |
| 类型推断 | 有限 | 强大 |
| 默认参数 | 需重载 | 原生支持 |
| 不可变集合 | 需 `Collections.unmodifiable` | `listOf()` 等 |
| when 表达式 | switch（有限） | `when`（强大） |
| 智能转换 | 需手动强转 | 自动推断 |
