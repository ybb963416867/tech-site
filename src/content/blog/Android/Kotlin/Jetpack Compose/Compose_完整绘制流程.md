---
title: "Compose_完整绘制流程"
description: "1. [总体架构概览](总体架构概览) 2. [阶段一：组合（Composition）](阶段一组合composition) 3. [阶段二：布局（Layout）](阶段二布局layout) 4. [阶段三：绘制（Drawing）](..."
pubDate: 2026-06-16
category: "Jetpack Compose"
tags: [Notes]
draft: false
---
# Jetpack Compose 完整绘制流程详解

## 目录

1. [总体架构概览](#总体架构概览)
2. [阶段一：组合（Composition）](#阶段一组合composition)
3. [阶段二：布局（Layout）](#阶段二布局layout)
4. [阶段三：绘制（Drawing）](#阶段三绘制drawing)
5. [重组机制（Recomposition）](#重组机制recomposition)
6. [快照系统（Snapshot System）](#快照系统snapshot-system)
7. [Modifier 的内部执行](#modifier-的内部执行)
8. [与 View 系统的对比](#与-view-系统的对比)
9. [性能优化原理](#性能优化原理)
10. [完整流程串联](#完整流程串联)

---

## 总体架构概览

### 三阶段流水线

Compose 的每一帧渲染经过严格的三阶段流水线，**必须按序执行，上一阶段完成才能进入下一阶段**：

```
  State 变化
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  阶段一：Composition（组合）                          │
│                                                     │
│  执行 @Composable 函数                               │
│  → 产出 SlotTable（组合树的内存表示）                 │
│  → 记录 UI 结构、State 读取                          │
└────────────────────┬────────────────────────────────┘
                     │ 输出 LayoutNode 树
                     ▼
┌─────────────────────────────────────────────────────┐
│  阶段二：Layout（布局）                               │
│                                                     │
│  测量（Measure）：确定每个节点的尺寸                  │
│  放置（Place） ：确定每个节点的位置                   │
└────────────────────┬────────────────────────────────┘
                     │ 输出带坐标的 LayoutNode 树
                     ▼
┌─────────────────────────────────────────────────────┐
│  阶段三：Drawing（绘制）                              │
│                                                     │
│  遍历 LayoutNode 树                                  │
│  → 生成 RenderNode 指令                              │
│  → 交给 GPU 渲染                                     │
└─────────────────────────────────────────────────────┘
```

### 整体类关系

```
AndroidComposeView（继承 ViewGroup）
    │
    ├── Owner（接口，协调三阶段）
    │
    ├── Recomposer（调度重组）
    │       └── CompositionCoroutineContext
    │
    ├── SlotTable（组合状态存储）
    │
    └── LayoutNode（根节点）
            └── LayoutNode（子节点树）
                    └── DrawScope / RenderNode
```

---

## 阶段一：组合（Composition）

### 1.1 Composition 是什么

Composition 是 Composable 函数执行后产生的**内存中的 UI 描述树**，并非真实 View 树，而是一个称为 `SlotTable` 的线性数据结构。

```
@Composable 函数执行
        │
        ▼
   Composer（执行引擎）
        │
        ▼
   SlotTable（线性数组，存储 Gap Buffer）
        │
        ▼
   LayoutNode 树（实际测量/绘制的节点）
```

### 1.2 SlotTable 结构

SlotTable 是 Compose 运行时最核心的数据结构，采用 **Gap Buffer** 算法存储组合树：

```
SlotTable（逻辑结构）:

Index: [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]
       [Group: Column]
            [Group: Text]
                 [Slot: "Hello"]
            [Group: Button]
                 [Group: Text]
                      [Slot: "Click"]
                 [Slot: onClick lambda]
```

```kotlin
// 每个 Group 记录：
// - 组的 key（用于对比新旧树）
// - 子节点数量
// - 对应的 LayoutNode 引用
// - remember 缓存的数据
// - State 订阅关系
```

### 1.3 Composer 执行过程

当 `setContent { }` 首次调用时：

```kotlin
// 入口（简化）
fun setContent(content: @Composable () -> Unit) {
    val composition = Composition(UiApplier(owner.root), recomposer)
    composition.setContent(content)
}
```

Composer 在执行 Composable 函数时，同步写入 SlotTable：

```kotlin
// 伪代码展示 Composer 工作方式
@Composable
fun MyScreen() {
    // Composer 记录：进入 Group("MyScreen")
    
    Column {
        // Composer 记录：进入 Group("Column"), 创建 LayoutNode
        
        val name = remember { "张三" }
        // Composer 记录：Slot(value="张三")，下次重组直接读取
        
        Text(text = name)
        // Composer 记录：进入 Group("Text"), 创建 LayoutNode
        //               Slot(text="张三")
        //               离开 Group("Text")
        
    }
    // Composer 记录：离开 Group("Column")
    // Composer 记录：离开 Group("MyScreen")
}
```

### 1.4 State 读取追踪

组合阶段会**自动追踪**每个 Composable 读取了哪些 State：

```kotlin
// 内部机制（简化）
class MutableState<T>(value: T) {
    var value: T
        get() {
            // 读取时：通知当前 Composer "我被读取了"
            // Composer 将当前 RecomposeScope 注册为该 State 的观察者
            currentComposer?.recordReadOf(this)
            return field
        }
        set(value) {
            field = value
            // 写入时：通知所有观察者 "我变了，需要重组"
            notifyObservers()
        }
}
```

```
组合阶段建立的订阅关系：

State(count) ──被读取──▶ TextComposable（RecomposeScope）
                              │
                              └─ count 变化时，只重组这个 Scope
```

### 1.5 Applier（应用到真实节点）

Composer 执行完成后，通过 `Applier` 将 SlotTable 的变更应用到 LayoutNode 树：

```kotlin
// UiApplier 实现（简化）
class UiApplier(root: LayoutNode) : AbstractApplier<LayoutNode>(root) {
    override fun insertTopDown(index: Int, instance: LayoutNode) {
        // 将新 LayoutNode 插入父节点
        current.insertAt(index, instance)
    }
    override fun remove(index: Int, count: Int) {
        current.removeAt(index, count)
    }
    override fun move(from: Int, to: Int, count: Int) {
        current.move(from, to, count)
    }
}
```

### 1.6 首次组合 vs 重组对比

```
首次组合：
  Composer 顺序写入 SlotTable
  → 创建所有 LayoutNode
  → 建立 State 订阅关系

重组（State 变化后）：
  Composer 读取旧 SlotTable（Gap Buffer 游标移动）
  → 对比新旧 Group key
  → 相同：跳过（直接移动游标）
  → 不同：更新 Slot 数据，标记 LayoutNode 需要重新测量
  → 新增：插入新 Group 和 LayoutNode
  → 删除：移除旧 Group 和 LayoutNode
```

---

## 阶段二：布局（Layout）

### 2.1 布局阶段的职责

```
输入：LayoutNode 树（来自 Composition）+ Constraints（父节点约束）
输出：每个 LayoutNode 的 width、height、x、y
```

### 2.2 Constraints（约束）

Compose 采用**约束向下传递**模型，父节点告诉子节点"你能有多大"：

```kotlin
data class Constraints(
    val minWidth: Int = 0,
    val maxWidth: Int = Constraints.Infinity,
    val minHeight: Int = 0,
    val maxHeight: Int = Constraints.Infinity
)

// 常见约束场景：
// fillMaxSize()  → Constraints(minW=parentW, maxW=parentW, minH=parentH, maxH=parentH)
// wrapContent()  → Constraints(minW=0, maxW=parentW, minH=0, maxH=parentH)
// size(100.dp)   → Constraints(minW=100, maxW=100, minH=100, maxH=100)
```

### 2.3 测量（Measure）流程

**测量是自上而下递归的**，父节点先将约束传给子节点，子节点测量完毕后上报自身尺寸：

```
Root（maxW=1080, maxH=2340）
 │ 传递约束
 ▼
Column（maxW=1080）
 │ 传递约束给第一个子节点
 ▼
Text（"Hello"）──测量完成──▶ 上报 (width=200, height=48)
 │
Column 传递约束给第二个子节点
 ▼
Button ──测量完成──▶ 上报 (width=300, height=56)
 │
Column 汇总子节点尺寸
 ▼
Column 上报自身尺寸 (width=1080, height=104)
```

```kotlin
// LayoutNode 测量过程（简化）
fun LayoutNode.measure(constraints: Constraints): Placeable {
    // 1. 将约束传递给 MeasurePolicy
    val measureResult = measurePolicy.measure(
        measurables = children.map { it.asMeasurable() },
        constraints = constraints
    )
    // 2. 记录自身尺寸
    this.width = measureResult.width
    this.height = measureResult.height
    // 3. 返回 Placeable（可以被父节点放置）
    return this.asMeasurable().measure(constraints)
}
```

### 2.4 单次测量原则（Single-pass）

Compose **强制每个节点只能被测量一次**，这是与 View 系统的重要区别：

```
View 系统（多次测量）：
  Parent.onMeasure() → child.measure() → child.measure() → ...
  WRAP_CONTENT 可能导致多次测量，O(n²) 复杂度

Compose（单次测量）：
  父节点传入范围约束（min/max），子节点只测量一次
  O(n) 复杂度

例外：IntrinsicSize（固有尺寸测量）
  用于在实际测量前"询问"子节点的理想尺寸
  但这是独立的查询，不计入正式测量次数
```

```kotlin
// 违反单次测量会在 Debug 模式报错
// 正确方式：使用 IntrinsicSize
Row(modifier = Modifier.height(IntrinsicSize.Min)) {
    // 所有子节点高度与最矮的一致
    Divider(modifier = Modifier.fillMaxHeight().width(1.dp))
    Text("文字内容")
}
```

### 2.5 放置（Place）流程

测量完成后，父节点决定每个子节点的位置：

```kotlin
// Layout 的放置阶段
layout(width = totalWidth, height = totalHeight) {
    // place / placeRelative 决定子节点坐标
    placeable.placeRelative(x = 0, y = 0)
    placeable.placeRelative(x = 0, y = firstHeight)
    // placeRelative：自动处理 RTL（从右到左语言）
    // place：不处理 RTL
}
```

### 2.6 布局阶段 Modifier 的处理

每个 Modifier 在 LayoutNode 上形成一个**装饰链**：

```
LayoutNode
    │
    ├── LayoutModifier（size, padding, offset...）
    │       在测量阶段修改 Constraints 和尺寸
    │
    └── DrawModifier（background, border...）
            在绘制阶段添加额外绘制指令
```

```kotlin
// padding Modifier 的测量实现（简化）
class PaddingModifier(val all: Float) : LayoutModifier {
    override fun MeasureScope.measure(
        measurable: Measurable,
        constraints: Constraints
    ): MeasureResult {
        // 1. 缩小约束（减去 padding 空间）
        val innerConstraints = constraints.offset(
            horizontal = -(all * 2).toInt(),
            vertical   = -(all * 2).toInt()
        )
        // 2. 测量子节点
        val placeable = measurable.measure(innerConstraints)
        // 3. 自身尺寸 = 子节点尺寸 + padding
        return layout(
            width  = placeable.width  + (all * 2).toInt(),
            height = placeable.height + (all * 2).toInt()
        ) {
            // 4. 放置子节点，偏移 padding
            placeable.placeRelative(all.toInt(), all.toInt())
        }
    }
}
```

---

## 阶段三：绘制（Drawing）

### 3.1 绘制阶段职责

```
输入：带坐标的 LayoutNode 树
输出：RenderNode 命令列表 → GPU 渲染
```

### 3.2 RenderNode（硬件加速）

Compose 不直接操作 Canvas，而是将绘制指令记录到 `RenderNode`：

```
LayoutNode
    │
    └── RenderNode（每个 LayoutNode 对应一个）
            │
            ├── 记录绘制指令（DisplayList）
            │       drawRect, drawText, drawBitmap...
            │
            └── 硬件加速：GPU 执行 DisplayList
```

```kotlin
// DrawScope 内的操作最终被记录到 RenderNode
Canvas(modifier = Modifier.size(100.dp)) {
    drawRect(Color.Blue)          // → RenderNode.drawRect(...)
    drawCircle(Color.Red, 50f)    // → RenderNode.drawCircle(...)
}
```

### 3.3 绘制遍历顺序

绘制按照**深度优先，后序遍历**（父先于子）：

```
Box (背景) ──────────────────── 1. 绘制 Box 背景
 ├── Image ───────────────────── 2. 绘制 Image
 └── Column
      ├── Text("标题") ──────── 3. 绘制 Text
      └── Text("副标题") ────── 4. 绘制 Text

绘制顺序：Box背景 → Image → 标题Text → 副标题Text
后绘制的在视觉上覆盖先绘制的（z-order）
```

### 3.4 DrawModifier 执行顺序

Modifier 链的绘制顺序：

```kotlin
Box(
    modifier = Modifier
        .background(Color.Red)    // Modifier 1（先绘制）
        .padding(16.dp)           // Modifier 2（布局）
        .background(Color.Blue)   // Modifier 3（后绘制，覆盖红色）
)

// 绘制顺序：红色背景 → 蓝色背景 → 内容
// 实际显示：蓝色背景（覆盖了红色）
```

```kotlin
// drawBehind：在内容之后绘制（背景）
// drawWithContent：控制内容和自定义绘制的顺序
// drawWithCache：缓存绘制对象，避免重复创建

Modifier.drawWithContent {
    drawContent()           // 先绘制内容
    drawRect(Color.Black.copy(alpha = 0.3f))  // 再绘制蒙层
}
```

### 3.5 RenderNode 的局部更新优势

```
View 系统：
  State 变化 → invalidate() → 整个 View 树 onDraw()
  （即使只有一个 TextView 文字变了，也可能重绘整个层级）

Compose：
  State 变化 → 只有读取该 State 的 LayoutNode 的 RenderNode 重新录制
  其他节点的 RenderNode 保持不变，GPU 直接复用
```

```
RenderNode 局部更新示意：

┌──────────────────────────────┐
│  Screen RenderNode           │
│  ┌──────────┐ ┌──────────┐  │
│  │ Header   │ │ Content  │  │
│  │ (不变)   │ │ (重绘)   │  │
│  └──────────┘ └──────────┘  │
└──────────────────────────────┘
        │               │
   复用旧指令       重新录制指令
```

### 3.6 graphicsLayer 的作用

`graphicsLayer` 将 Composable 提升为独立的 `RenderNode`，变换操作在 GPU 层完成，**不触发重组和重绘**：

```kotlin
// 动画时使用 graphicsLayer，变换直接由 GPU 执行
// 不需要重新执行 Composable 函数或重新录制绘制指令
Image(
    painter = painterResource(R.drawable.bg),
    contentDescription = null,
    modifier = Modifier.graphicsLayer {
        // 这些属性变化时只在 GPU 层变换，不触发 Compose 重组
        alpha       = animatedAlpha        // 透明度
        scaleX      = animatedScale        // 缩放
        scaleY      = animatedScale
        rotationZ   = animatedRotation     // 旋转
        translationX = animatedOffsetX     // 平移
        translationY = animatedOffsetY
        shadowElevation = 8f               // 阴影
        shape       = RoundedCornerShape(16.dp)
        clip        = true
    }
)
```

---

## 重组机制（Recomposition）

### 4.1 重组调度

```
State.value = newValue
      │
      ▼
快照系统通知观察者（在主线程）
      │
      ▼
Recomposer.scheduleRecompose(scope)
      │
      ▼
下一帧 Choreographer.doFrame() 到来
      │
      ▼
执行所有待重组的 RecomposeScope
      │
      ▼
Composer 对比新旧 SlotTable，最小化更新
      │
      ▼
触发 Layout + Drawing（仅受影响的节点）
```

### 4.2 智能重组（Smart Recomposition）

Compose 通过**参数稳定性**决定是否跳过重组：

```kotlin
// 参数未变化时，Compose 跳过该 Composable 的重组
@Composable
fun StableComposable(name: String) {
    // 如果 name 未变化，整个函数被跳过
    Text(text = name)
}
```

```kotlin
// 稳定类型（Compose 可以安全跳过）：
// - 基本类型：Int, String, Boolean, Float...
// - 不可变数据类（所有属性都是 val 且类型稳定）
// - 标注了 @Stable 或 @Immutable 的类

@Immutable                          // 告知 Compose 此类不可变
data class UserInfo(
    val id: Long,
    val name: String,
    val avatar: String
)

// 不稳定类型（Compose 无法确定是否变化，不会跳过）：
// - List, Map, Set（接口，实现可能是可变的）
// - 包含 var 属性的类
// - 没有 @Stable 标注的普通类
```

```kotlin
// 解决 List 不稳定问题
@Immutable
data class ImmutableList<T>(val items: List<T>)

@Composable
fun StableList(list: ImmutableList<String>) {  // 稳定，可跳过
    // ...
}
```

### 4.3 RecomposeScope 的粒度

```kotlin
@Composable
fun Screen() {
    var count by remember { mutableStateOf(0) }

    // Screen 的 RecomposeScope
    Column {
        // Header 不读取 count，count 变化时不重组 Header
        Header()

        // Counter 读取 count，count 变化时重组 Counter
        Counter(count = count)

        // Footer 不读取 count，count 变化时不重组 Footer
        Footer()
    }

    Button(onClick = { count++ }) { Text("加一") }
}
```

```
count 变化时的重组范围：

Screen（整体不重组，因 Column 内容是 lambda）
└── Column
    ├── Header（跳过，未读取 count）
    ├── Counter（重组，读取了 count）  ← 只有这里重新执行
    └── Footer（跳过，未读取 count）
```

### 4.4 重组的幂等性要求

```kotlin
// ✅ 正确：Composable 函数应该是纯函数
@Composable
fun PureComposable(name: String) {
    Text(text = "Hello, $name")  // 相同输入，相同输出
}

// ❌ 错误：有副作用的 Composable（重组次数不可预期）
@Composable
fun ImpureComposable() {
    counter++          // 重组次数不确定，这会导致不可预期的行为
    database.write()   // 可能多次写入
    Text("$counter")
}

// ✅ 正确：副作用放在 Effect 中
@Composable
fun CorrectComposable() {
    LaunchedEffect(Unit) {
        database.write()   // 只执行一次
    }
}
```

---

## 快照系统（Snapshot System）

### 5.1 什么是快照

Compose 的 State 不直接存储值，而是通过**快照系统**管理，类似于数据库的 MVCC（多版本并发控制）：

```
全局快照（Global Snapshot）
    │
    ├── 读取快照（每次帧渲染时创建）
    │       安全读取 State，不受并发修改影响
    │
    └── 可变快照（MutableSnapshot）
            可以修改 State，提交时通知观察者
```

### 5.2 快照的工作原理

```kotlin
// State 的内部结构（简化）
class SnapshotMutableState<T>(initialValue: T) {
    // 存储的不是单一值，而是"状态记录"列表
    // 每个快照看到的是自己版本的值
    private val stateRecord: StateRecord<T> = StateRecord(initialValue)

    var value: T
        get() = currentSnapshot.readValue(stateRecord)   // 读当前快照的版本
        set(value) = currentSnapshot.writeValue(stateRecord, value)
}
```

```
时序示意：

主线程渲染快照 S1：count=0
                         │
后台线程修改：count=1    │ (不影响 S1 的读取)
                         │
帧结束，快照推进 S2：count=1（读到新值）
```

### 5.3 快照与重组的关系

```kotlin
// Recomposer 内部（简化）
fun performRecompose() {
    // 在快照内执行组合，确保读到一致的 State 视图
    Snapshot.observe(
        readObserver = { state ->
            // 记录：当前 RecomposeScope 读取了该 state
            currentScope.recordRead(state)
        }
    ) {
        composable()   // 执行 Composable 函数
    }
}
```

### 5.4 批量更新

```kotlin
// 多个 State 同时修改，只触发一次重组
Snapshot.withMutableSnapshot {
    nameState.value = "张三"
    ageState.value = 25
    avatarState.value = "url"
}
// 三个 State 同时生效，只触发一次重组，不会看到中间状态
```

---

## Modifier 的内部执行

### 6.1 Modifier 链的展开

```kotlin
// 用户写的代码
Modifier
    .padding(16.dp)
    .background(Color.Blue)
    .size(100.dp)
    .clickable { }

// 内部实际是链表结构：
// CombinedModifier(
//     outer = CombinedModifier(
//         outer = CombinedModifier(
//             outer = padding,
//             inner = background
//         ),
//         inner = size
//     ),
//     inner = clickable
// )
```

### 6.2 不同类型 Modifier 在三阶段的作用

```
Modifier 类型            作用阶段         示例

LayoutModifier       → Layout 阶段     padding, size, offset, fillMaxWidth
DrawModifier         → Drawing 阶段    background, border, drawBehind
PointerInputModifier → 事件分发        clickable, pointerInput
SemanticsModifier    → 无障碍树        semantics, testTag
ParentDataModifier   → 提供父节点数据   weight（Column/Row 内使用）
```

### 6.3 Modifier 在 LayoutNode 上的表示

```
LayoutNode
 └── modifiers: List<Modifier.Element>
      ├── [0] PaddingModifier     → 参与 Measure
      ├── [1] BackgroundModifier  → 参与 Draw
      ├── [2] SizeModifier        → 参与 Measure
      └── [3] ClickableModifier   → 参与事件分发

测量时：只处理 LayoutModifier
绘制时：只处理 DrawModifier
事件时：只处理 PointerInputModifier
```

---

## 与 View 系统的对比

### 7.1 架构对比

```
View 系统                           Compose
─────────────────────────────────────────────────────────
View 树（Java 对象）                LayoutNode 树（更轻量）
onMeasure() / onLayout()           MeasurePolicy / Layout
onDraw(Canvas)                     DrawScope / RenderNode
invalidate() → 全树刷新            精确到 LayoutNode 的局部刷新
多次测量（WRAP_CONTENT）            单次测量（Constraints）
命令式 UI（手动更新）               声明式 UI（State 驱动）
XML 膨胀（反射）                    @Composable 函数（直接执行）
```

### 7.2 性能关键差异

```
View 系统的问题：
  1. View 对象包含大量字段（100+ 个属性），创建开销大
  2. 测量可能多次（requestLayout 向上传播）
  3. invalidate 可能导致大范围重绘
  4. XML 解析和反射创建 View 开销高

Compose 的优化：
  1. LayoutNode 更轻量，@Composable 函数按需执行
  2. 单次测量，O(n) 复杂度
  3. RenderNode 精确局部更新
  4. 智能重组跳过未变化的 Composable
  5. graphicsLayer 将变换放到 GPU 层
```

---

## 性能优化原理

### 8.1 三阶段各自可以独立跳过

```
State A 变化（只影响绘制，不影响尺寸）：
  Composition → 重组相关 Scope  ✅
  Layout      → 跳过（尺寸未变）✅
  Drawing     → 只重绘相关节点  ✅

State B 变化（影响文字内容，改变尺寸）：
  Composition → 重组  ✅
  Layout      → 重新测量  ✅
  Drawing     → 重绘  ✅
```

### 8.2 读取 State 的阶段决定影响范围

```kotlin
// 在 Composition 阶段读取 → 可能触发三个阶段
@Composable
fun Example(state: State<String>) {
    Text(text = state.value)   // Composition 读取，影响最大
}

// 在 Layout 阶段读取 → 只触发 Layout + Drawing
Modifier.layout { measurable, constraints ->
    val size = sizeState.value   // Layout 读取，跳过 Composition
    val placeable = measurable.measure(constraints)
    layout(size, size) { placeable.placeRelative(0, 0) }
}

// 在 Drawing 阶段读取 → 只触发 Drawing（最优）
Modifier.drawBehind {
    val color = colorState.value   // Drawing 读取，只重绘
    drawRect(color)
}
```

```kotlin
// 实践：动画颜色只影响绘制，用 drawBehind 最优
val animatedColor by animateColorAsState(targetColor)
Box(
    modifier = Modifier
        .size(100.dp)
        .drawBehind {
            drawRect(animatedColor)  // 颜色变化只触发 Drawing
        }
)
// 对比 .background(animatedColor)：
// background 在 Composition 阶段读取颜色，会触发重组
```

### 8.3 使用 offset lambda 跳过 Layout

```kotlin
var offsetY by remember { mutableStateOf(0f) }

// ❌ 触发 Layout 阶段（offset 的 Dp 版本在 Layout 读取）
Modifier.offset(y = offsetY.dp)

// ✅ 只触发 Drawing 阶段（lambda 版本在 Drawing 读取）
Modifier.offset { IntOffset(0, offsetY.roundToInt()) }
```

---

## 完整流程串联

### 从 setContent 到屏幕显示的完整路径

```
1. Activity.setContent { MyApp() }
        │
        ▼
2. 创建 AndroidComposeView（继承自 ViewGroup）
   创建 Recomposer（绑定主线程 Choreographer）
   创建 Composition
        │
        ▼
3. 【Composition 阶段】
   在主线程执行 MyApp() 及所有子 @Composable 函数
   Composer 写入 SlotTable
   UiApplier 创建 LayoutNode 树
   建立 State → RecomposeScope 订阅关系
        │
        ▼
4. 【Layout 阶段】
   从根 LayoutNode 开始，递归向下传递 Constraints
   每个 LayoutNode 调用 MeasurePolicy.measure()
   测量完成后，调用 place() 确定每个节点的 x/y
        │
        ▼
5. 【Drawing 阶段】
   遍历 LayoutNode 树
   每个节点将 DrawModifier 和子节点绘制指令录制到 RenderNode
   AndroidComposeView.dispatchDraw() 将根 RenderNode 提交给 ViewRootImpl
        │
        ▼
6. ViewRootImpl → SurfaceFlinger → GPU 渲染 → 屏幕显示
        │
        ▼
─────────────────────── 用户操作或 State 变化 ───────────────────────
        │
        ▼
7. State.value = newValue
   快照系统通知 Recomposer
        │
        ▼
8. Recomposer.scheduleRecompose()
   等待下一帧 Choreographer.doFrame()
        │
        ▼
9. 【最小化重组】
   只执行读取了该 State 的 RecomposeScope（Composable 函数）
   Composer 对比 SlotTable：相同跳过，不同更新
        │
        ▼
10. 【按需 Layout】
    只有尺寸/位置受影响的 LayoutNode 重新测量
        │
        ▼
11. 【按需 Drawing】
    只有内容变化的 LayoutNode 重新录制 RenderNode 指令
    其他 RenderNode 直接复用
        │
        ▼
12. 提交给 GPU → 屏幕更新（目标 16ms/帧，即 60fps）
```

### 关键数据结构流转

```
@Composable 函数
      │ 执行产出
      ▼
SlotTable（Gap Buffer 线性数组）
      │ UiApplier 应用
      ▼
LayoutNode 树（组合树的真实表示）
      │ MeasurePolicy 处理
      ▼
带尺寸和位置的 LayoutNode 树
      │ DrawScope 处理
      ▼
RenderNode 指令列表
      │ 硬件加速
      ▼
GPU DisplayList → 屏幕像素
```

---

## 总结

```
三阶段流水线（必须按序）：
  Composition → Layout → Drawing

各阶段的产出：
  Composition → SlotTable + LayoutNode 树
  Layout      → 每个 LayoutNode 的 size + position
  Drawing     → RenderNode DisplayList → GPU

优化核心思路：
  减少 Composition 范围  → @Stable/@Immutable，参数稳定性
  减少 Layout 范围       → 单次测量，offset lambda 版本
  减少 Drawing 范围      → drawBehind 读 State，graphicsLayer 做变换

与 View 的本质区别：
  View：命令式，树中每个节点是重量级对象，测量可多次
  Compose：声明式，State 驱动，单次测量，精确局部更新
```

Compose 绘制流程的核心设计哲学：**声明描述 UI 结构，运行时自动计算最小更新范围，三阶段分离确保每阶段只做自己的事**。
