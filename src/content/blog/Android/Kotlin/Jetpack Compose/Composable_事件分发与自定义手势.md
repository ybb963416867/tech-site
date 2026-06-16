---
title: "Composable_事件分发与自定义手势"
description: "1. [事件分发概述](事件分发概述) 2. [PointerEvent 核心模型](pointerevent核心模型) 3. [事件分发流程](事件分发流程) 4. [事件消费（consume）机制](事件消费consume机制) ..."
pubDate: 2026-06-16
category: "Jetpack Compose"
tags: [API, SEO]
draft: false
---
# Android Jetpack Compose 事件分发与自定义手势

## 目录

1. [事件分发概述](#事件分发概述)
2. [PointerEvent 核心模型](#pointerevent-核心模型)
3. [事件分发流程](#事件分发流程)
4. [事件消费（consume）机制](#事件消费consume机制)
5. [内置手势 API](#内置手势-api)
6. [pointerInput 底层 API](#pointerinput-底层-api)
7. [自定义手势检测](#自定义手势检测)
8. [手势冲突处理](#手势冲突处理)
9. [多指触控](#多指触控)
10. [与 View 手势互操作](#与-view-手势互操作)
11. [完整实战示例](#完整实战示例)
12. [最佳实践与性能](#最佳实践与性能)

---

## 事件分发概述

### Compose vs View 事件系统对比

| 特性 | View 系统 | Compose |
|------|-----------|---------|
| 分发机制 | `dispatchTouchEvent` → `onInterceptTouchEvent` → `onTouchEvent` | PointerInputFilter 链式处理 |
| 拦截方式 | 父 View 可拦截，子 View 可 `requestDisallowIntercept` | `consume()` 标记消费，Pass / Main 阶段协作 |
| 手势组合 | 嵌套困难，依赖 `ViewGroup` 协调 | `AwaitPointerEventScope` 协程化，灵活组合 |
| 协程支持 | 无 | 原生协程，挂起/取消 |
| 多指触控 | `MotionEvent.getPointerId()` | `PointerEvent.changes` 列表 |

### 事件系统架构

```
用户触摸屏幕
     │
     ▼
Android Input System（系统层）
     │
     ▼
AndroidComposeView（接收 MotionEvent）
     │  转换为 PointerInputChange
     ▼
PointerInputEventProcessor
     │
     ▼
PointerInputFilter 链（按 Modifier 顺序）
     │
     ├─ Pass.Initial（从根到叶，命中测试）
     ├─ Pass.Main   （从叶到根，主要消费阶段）
     └─ Pass.Final  （从根到叶，最终处理）
```

---

## PointerEvent 核心模型

### 关键数据类

```kotlin
// 单个触点的变化信息
class PointerInputChange(
    val id: PointerId,                  // 触点唯一 ID（多指区分）
    val uptimeMillis: Long,             // 当前事件时间戳
    val position: Offset,              // 当前位置（相对于当前组件）
    val pressed: Boolean,              // 当前是否按下
    val previousUptimeMillis: Long,    // 上一次事件时间戳
    val previousPosition: Offset,      // 上一次位置
    val previousPressed: Boolean,      // 上一次是否按下
    // 是否已被消费
    val isConsumed: Boolean
) {
    // 位移量：当前位置 - 上一次位置
    val positionChange: Offset get() = position - previousPosition

    // 按下状态是否发生变化
    val changedToDown: Boolean get() = pressed && !previousPressed
    val changedToUp: Boolean get() = !pressed && previousPressed

    // 标记该事件已被消费（其他节点将看到 isConsumed == true）
    fun consume()
}

// 一次完整的指针事件（可能包含多个触点）
class PointerEvent(
    val changes: List<PointerInputChange>,
    val buttons: PointerButtons,        // 鼠标/触控笔按键状态
    val keyboardModifiers: PointerKeyboardModifiers
)
```

### 事件类型判断

```kotlin
suspend fun AwaitPointerEventScope.checkEventType(event: PointerEvent) {
    event.changes.forEach { change ->
        when {
            change.changedToDown()  -> println("手指按下 id=${change.id}")
            change.changedToUp()    -> println("手指抬起 id=${change.id}")
            change.pressed          -> println("手指移动 id=${change.id} pos=${change.position}")
        }
    }
}
```

---

## 事件分发流程

### 三个 Pass 阶段

```
                    ┌─────────────────────────┐
                    │      触摸事件到达         │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │          Pass.Initial（向下）         │
              │   Root → Parent → Child             │
              │   用途：命中测试、预处理              │
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │          Pass.Main（向上）           │
              │   Child → Parent → Root             │
              │   用途：主要手势消费（默认在此处理） │
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │          Pass.Final（向下）          │
              │   Root → Parent → Child             │
              │   用途：滚动容器等最终兜底处理        │
              └─────────────────────────────────────┘
```

### 在代码中指定 Pass

```kotlin
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        // 默认在 Pass.Main 接收事件
        val event = awaitPointerEvent()

        // 指定在 Initial 阶段接收（先于子组件）
        val eventInitial = awaitPointerEvent(pass = PointerEventPass.Initial)

        // 指定在 Final 阶段接收（晚于子组件）
        val eventFinal = awaitPointerEvent(pass = PointerEventPass.Final)
    }
}
```

### 父子分发示意

```kotlin
// 父组件：Initial 阶段（先执行）→ 子组件：Main 阶段 → 父组件：Main 阶段（后执行）
Box(
    modifier = Modifier
        .size(200.dp)
        .pointerInput(Unit) {
            awaitPointerEventScope {
                while (true) {
                    // Initial 阶段：父先于子看到事件
                    val initialEvent = awaitPointerEvent(PointerEventPass.Initial)
                    println("父 Initial: ${initialEvent.changes.first().position}")

                    // Main 阶段：子先消费，父后看到
                    val mainEvent = awaitPointerEvent(PointerEventPass.Main)
                    val consumed = mainEvent.changes.first().isConsumed
                    println("父 Main: consumed=$consumed")
                }
            }
        }
) {
    Box(
        modifier = Modifier
            .size(100.dp)
            .align(Alignment.Center)
            .pointerInput(Unit) {
                awaitPointerEventScope {
                    while (true) {
                        val event = awaitPointerEvent() // 默认 Main 阶段
                        println("子 Main: ${event.changes.first().position}")
                        event.changes.forEach { it.consume() } // 子消费后父可检测到
                    }
                }
            }
    )
}
```

---

## 事件消费（consume）机制

### consume() 的含义

```kotlin
// consume() 不阻止事件继续传递，只是设置 isConsumed = true 标志
// 其他节点通过判断 isConsumed 来决定是否继续处理

change.consume()           // 标记整个事件已消费

// 检查是否已被消费
if (!change.isConsumed) {
    // 事件未被消费，可以处理
    handleEvent(change)
}
```

### 消费策略对比

```kotlin
// 策略一：消费后忽略（子组件独占）
Modifier.pointerInput(Unit) {
    detectTapGestures {
        // detectTapGestures 内部会 consume()
        // 父组件 Main 阶段将看到 isConsumed = true
    }
}

// 策略二：Pass.Initial 中预消费（父组件拦截）
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        while (true) {
            val event = awaitPointerEvent(PointerEventPass.Initial)
            // 在子组件看到事件之前消费
            event.changes.forEach { it.consume() }
        }
    }
}

// 策略三：Pass.Final 兜底（子组件未消费时处理）
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        while (true) {
            val event = awaitPointerEvent(PointerEventPass.Final)
            val unhandled = event.changes.filter { !it.isConsumed }
            unhandled.forEach { /* 处理未消费的事件 */ }
        }
    }
}
```

---

## 内置手势 API

### clickable / combinedClickable

```kotlin
// 基础点击（自带涟漪效果）
Modifier.clickable {
    println("点击")
}

// 完整控制
Modifier.clickable(
    enabled = true,
    onClickLabel = "打开详情",           // 无障碍标签
    role = Role.Button,
    interactionSource = remember { MutableInteractionSource() },
    indication = rememberRipple(bounded = true, color = Color.Red)
) {
    println("点击")
}

// 长按 / 双击
Modifier.combinedClickable(
    onClick = { println("单击") },
    onLongClick = { println("长按") },
    onDoubleClick = { println("双击") }
)
```

### draggable（单轴拖拽）

```kotlin
var offsetX by remember { mutableStateOf(0f) }

Modifier.draggable(
    orientation = Orientation.Horizontal,
    state = rememberDraggableState { delta ->
        offsetX += delta
    },
    onDragStarted = { startOffset -> println("开始拖拽 $startOffset") },
    onDragStopped = { velocity -> println("拖拽结束 速度=$velocity") }
)
```

### scrollable（滚动手势）

```kotlin
val scrollState = rememberScrollState()

// 简单滚动
Modifier.verticalScroll(scrollState)

// 底层 scrollable（自定义滚动消费逻辑）
var offset by remember { mutableStateOf(0f) }
Modifier.scrollable(
    orientation = Orientation.Vertical,
    state = rememberScrollableState { delta ->
        offset += delta
        delta // 返回消费量
    }
)
```

### transformable（缩放/旋转/平移）

```kotlin
var scale by remember { mutableStateOf(1f) }
var rotation by remember { mutableStateOf(0f) }
var offset by remember { mutableStateOf(Offset.Zero) }

val state = rememberTransformableState { zoomChange, panChange, rotationChange ->
    scale = (scale * zoomChange).coerceIn(0.5f, 5f)
    rotation += rotationChange
    offset += panChange
}

Modifier
    .graphicsLayer {
        scaleX = scale; scaleY = scale
        rotationZ = rotation
        translationX = offset.x; translationY = offset.y
    }
    .transformable(state)
```

### swipeable（侧滑，Material 3 用 AnchoredDraggable）

```kotlin
// Material 3 AnchoredDraggable
enum class SwipeState { Collapsed, Expanded }

val density = LocalDensity.current
val anchors = remember {
    DraggableAnchors {
        SwipeState.Collapsed at 0f
        SwipeState.Expanded at with(density) { 200.dp.toPx() }
    }
}
val state = remember {
    AnchoredDraggableState(
        initialValue = SwipeState.Collapsed,
        anchors = anchors,
        positionalThreshold = { totalDistance -> totalDistance * 0.5f },
        velocityThreshold = { with(density) { 100.dp.toPx() } },
        animationSpec = tween()
    )
}

Box(
    modifier = Modifier
        .offset { IntOffset(state.requireOffset().roundToInt(), 0) }
        .anchoredDraggable(state, Orientation.Horizontal)
)
```

---

## pointerInput 底层 API

### awaitPointerEventScope 结构

```kotlin
Modifier.pointerInput(key1, key2) {
    // this: PointerInputScope
    // 协程作用域，key 变化时自动取消重启

    awaitPointerEventScope {
        // this: AwaitPointerEventScope
        // 在此处循环处理事件

        while (true) {
            val event: PointerEvent = awaitPointerEvent()
            // 处理事件...
        }
    }
}
```

### 基础等待方法

```kotlin
awaitPointerEventScope {
    // 等待任意指针事件
    val event = awaitPointerEvent()

    // 等待第一个手指按下
    val down: PointerInputChange = awaitFirstDown()

    // 等待手指抬起（需传入按下事件）
    waitForUpOrCancellation()   // 返回 null 表示被取消（手指移出区域）

    // 等待手指移动超过 slop 阈值（过滤抖动）
    val drag = awaitTouchSlopOrCancellation(down.id) { change, over ->
        // change: 当前变化
        // over: 超出阈值的量
    }
}
```

### 完整的手势协程模式

```kotlin
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        while (true) {
            // 阶段1：等待按下
            val down = awaitFirstDown(requireUnconsumed = false)

            // 阶段2：等待移动或抬起
            var dragOffset = Offset.Zero
            drag(down.id) { change ->
                // 移动中
                dragOffset += change.positionChange()
                change.consume()
            }

            // drag 返回后：手指已抬起或被取消
            println("拖拽结束，总偏移 = $dragOffset")
        }
    }
}
```

---

## 自定义手势检测

### 自定义单击（带超时判断）

```kotlin
suspend fun PointerInputScope.detectCustomTap(
    onTap: (Offset) -> Unit,
    onLongPress: (Offset) -> Unit,
    longPressTimeout: Long = viewConfiguration.longPressTimeoutMillis
) {
    awaitPointerEventScope {
        while (true) {
            val down = awaitFirstDown()
            val downPosition = down.position
            val longPressJob = coroutineScope {
                launch {
                    delay(longPressTimeout)
                    onLongPress(downPosition)
                }
            }

            val up = waitForUpOrCancellation()
            longPressJob.cancel()

            if (up != null) {
                up.consume()
                onTap(up.position)
            }
        }
    }
}

// 使用
Modifier.pointerInput(Unit) {
    detectCustomTap(
        onTap = { println("单击 $it") },
        onLongPress = { println("长按 $it") }
    )
}
```

### 自定义双击手势

```kotlin
suspend fun PointerInputScope.detectDoubleTap(
    onSingleTap: (Offset) -> Unit = {},
    onDoubleTap: (Offset) -> Unit
) {
    val doubleTapTimeout = viewConfiguration.doubleTapTimeoutMillis

    awaitPointerEventScope {
        while (true) {
            // 第一次按下抬起
            val firstDown = awaitFirstDown()
            waitForUpOrCancellation() ?: continue

            // 在超时时间内等待第二次按下
            val secondDown = withTimeoutOrNull(doubleTapTimeout) {
                awaitFirstDown()
            }

            if (secondDown == null) {
                // 超时，判定为单击
                onSingleTap(firstDown.position)
            } else {
                // 第二次按下，等待抬起，判定为双击
                waitForUpOrCancellation()
                onDoubleTap(secondDown.position)
            }
        }
    }
}
```

### 自定义方向滑动手势

```kotlin
enum class SwipeDirection { Left, Right, Up, Down }

suspend fun PointerInputScope.detectSwipe(
    minDistance: Float = 50f,
    maxDuration: Long = 500L,
    onSwipe: (SwipeDirection) -> Unit
) {
    awaitPointerEventScope {
        while (true) {
            val down = awaitFirstDown()
            val startTime = System.currentTimeMillis()
            var endPosition = down.position

            // 等待手指移动
            drag(down.id) { change ->
                endPosition = change.position
                change.consume()
            }

            val elapsed = System.currentTimeMillis() - startTime
            if (elapsed > maxDuration) continue   // 超时，不判定为滑动

            val delta = endPosition - down.position
            val distance = delta.getDistance()
            if (distance < minDistance) continue   // 距离太小

            val direction = when {
                kotlin.math.abs(delta.x) > kotlin.math.abs(delta.y) ->
                    if (delta.x > 0) SwipeDirection.Right else SwipeDirection.Left
                else ->
                    if (delta.y > 0) SwipeDirection.Down else SwipeDirection.Up
            }
            onSwipe(direction)
        }
    }
}

// 使用
Modifier.pointerInput(Unit) {
    detectSwipe { direction ->
        when (direction) {
            SwipeDirection.Left  -> println("向左滑")
            SwipeDirection.Right -> println("向右滑")
            SwipeDirection.Up    -> println("向上滑")
            SwipeDirection.Down  -> println("向下滑")
        }
    }
}
```

### 自定义长按拖拽（先长按激活，再拖动）

```kotlin
suspend fun PointerInputScope.detectLongPressDrag(
    onDragStart: (Offset) -> Unit = {},
    onDrag: (change: PointerInputChange, dragAmount: Offset) -> Unit,
    onDragEnd: () -> Unit = {},
    onDragCancel: () -> Unit = {}
) {
    val longPressTimeout = viewConfiguration.longPressTimeoutMillis

    awaitPointerEventScope {
        while (true) {
            val down = awaitFirstDown(requireUnconsumed = false)

            // 等待长按超时
            val longPressActivated = withTimeoutOrNull(longPressTimeout) {
                waitForUpOrCancellation()
                false  // 在超时前抬起 → 不激活
            } == null  // null 表示超时 → 激活

            if (!longPressActivated) continue

            onDragStart(down.position)

            // 长按激活后进入拖拽模式
            try {
                drag(down.id) { change ->
                    onDrag(change, change.positionChange())
                    change.consume()
                }
                onDragEnd()
            } catch (e: CancellationException) {
                onDragCancel()
            }
        }
    }
}
```

### 自定义捏合缩放手势

```kotlin
suspend fun PointerInputScope.detectCustomPinch(
    onPinch: (centroid: Offset, zoom: Float, rotation: Float) -> Unit
) {
    awaitPointerEventScope {
        while (true) {
            // 等待至少两根手指
            awaitPointerEvent().let { event ->
                if (event.changes.size < 2) return@let

                val (p1, p2) = event.changes
                var prevDistance = (p2.position - p1.position).getDistance()
                var prevAngle = atan2(
                    (p2.position - p1.position).y,
                    (p2.position - p1.position).x
                )

                do {
                    val nextEvent = awaitPointerEvent()
                    if (nextEvent.changes.size < 2) break
                    val (c1, c2) = nextEvent.changes

                    val currDistance = (c2.position - c1.position).getDistance()
                    val currAngle = atan2(
                        (c2.position - c1.position).y,
                        (c2.position - c1.position).x
                    )

                    val centroid = (c1.position + c2.position) / 2f
                    val zoom = if (prevDistance != 0f) currDistance / prevDistance else 1f
                    val rotation = Math.toDegrees((currAngle - prevAngle).toDouble()).toFloat()

                    onPinch(centroid, zoom, rotation)
                    nextEvent.changes.forEach { it.consume() }

                    prevDistance = currDistance
                    prevAngle = currAngle
                } while (nextEvent.changes.any { it.pressed })
            }
        }
    }
}
```

---

## 手势冲突处理

### 场景一：嵌套滚动（NestedScroll）

```kotlin
// Compose 内置 NestedScrollConnection 协议
val nestedScrollConnection = remember {
    object : NestedScrollConnection {
        override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
            // 子组件消费之前，父组件先处理
            val consumed = if (available.y < 0) {
                // 向上滚动：父组件折叠 Header
                collapseHeader(available.y)
            } else Offset.Zero
            return consumed
        }

        override fun onPostScroll(
            consumed: Offset,
            available: Offset,
            source: NestedScrollSource
        ): Offset {
            // 子组件消费后，剩余量传给父组件
            return if (available.y > 0) {
                // 向下滚动剩余：父组件展开 Header
                expandHeader(available.y)
            } else Offset.Zero
        }

        override suspend fun onPreFling(available: Velocity): Velocity {
            return Velocity.Zero // 不拦截 fling
        }

        override suspend fun onPostFling(consumed: Velocity, available: Velocity): Velocity {
            return Velocity.Zero
        }
    }
}

Box(modifier = Modifier.nestedScroll(nestedScrollConnection)) {
    LazyColumn { /* 内容 */ }
}
```

### 场景二：CollapsingToolbar 实现

```kotlin
@Composable
fun CollapsingToolbarLayout(
    toolbarHeight: Dp = 200.dp,
    collapsedHeight: Dp = 56.dp,
    content: @Composable () -> Unit
) {
    val toolbarHeightPx = with(LocalDensity.current) { toolbarHeight.toPx() }
    val collapsedHeightPx = with(LocalDensity.current) { collapsedHeight.toPx() }
    var toolbarOffsetY by remember { mutableStateOf(0f) }

    val nestedScrollConnection = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                val delta = available.y
                val newOffset = (toolbarOffsetY + delta)
                    .coerceIn(-(toolbarHeightPx - collapsedHeightPx), 0f)
                val consumed = newOffset - toolbarOffsetY
                toolbarOffsetY = newOffset
                return Offset(0f, consumed)
            }
        }
    }

    Box(modifier = Modifier.nestedScroll(nestedScrollConnection)) {
        // Header（随滚动折叠）
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(toolbarHeight)
                .offset { IntOffset(0, toolbarOffsetY.roundToInt()) }
                .background(MaterialTheme.colorScheme.primary)
                .zIndex(1f)
        )
        // 内容列表
        LazyColumn(
            contentPadding = PaddingValues(top = toolbarHeight)
        ) {
            content() // 使用 LazyListScope
        }
    }
}
```

### 场景三：父子手势竞争（ViewPager + 内部滚动）

```kotlin
// ViewPager 内嵌 LazyColumn：
// 垂直方向给 LazyColumn，水平方向给 ViewPager
@Composable
fun PageWithScrollableContent() {
    HorizontalPager(
        pageCount = 3,
        // userScrollEnabled 为 true 时 Pager 处理水平手势
        // Pager 内部实现了 NestedScroll，垂直方向会透传给子组件
    ) { page ->
        LazyColumn {
            items(50) { index ->
                Text("Page $page - Item $index", modifier = Modifier.padding(16.dp))
            }
        }
    }
}

// 自定义：水平拖拽超过阈值才交给 Pager
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        while (true) {
            val down = awaitFirstDown(requireUnconsumed = false)
            val slop = viewConfiguration.touchSlop
            var dragAmount = Offset.Zero

            awaitPointerEvent(PointerEventPass.Initial).changes.forEach { change ->
                dragAmount += change.positionChange()
                // 垂直方向移动更多 → 消费事件，阻止 Pager 接收
                if (kotlin.math.abs(dragAmount.y) > kotlin.math.abs(dragAmount.x) &&
                    dragAmount.getDistance() > slop
                ) {
                    change.consume()
                }
            }
        }
    }
}
```

### 场景四：禁止父级拦截（等价于 requestDisallowInterceptTouchEvent）

```kotlin
// 在 Initial 阶段，子组件先消费，父组件的 Initial 处理器将看到 isConsumed=true
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        while (true) {
            // Initial 阶段抢先消费，阻止父级处理
            val event = awaitPointerEvent(PointerEventPass.Initial)
            event.changes.forEach { change ->
                if (change.changedToDown()) {
                    change.consume()  // 告知父级：我来处理
                }
            }
            // Main 阶段正常处理业务逻辑
            val mainEvent = awaitPointerEvent(PointerEventPass.Main)
            // ...
        }
    }
}
```

---

## 多指触控

### 追踪多个触点

```kotlin
Modifier.pointerInput(Unit) {
    awaitPointerEventScope {
        val activePointers = mutableMapOf<PointerId, Offset>()

        while (true) {
            val event = awaitPointerEvent()

            event.changes.forEach { change ->
                when {
                    change.changedToDown() -> {
                        activePointers[change.id] = change.position
                        println("手指按下 id=${change.id} 当前触点数=${activePointers.size}")
                    }
                    change.changedToUp() -> {
                        activePointers.remove(change.id)
                        println("手指抬起 id=${change.id} 剩余触点数=${activePointers.size}")
                    }
                    change.pressed -> {
                        activePointers[change.id] = change.position
                    }
                }
            }

            // 根据触点数量执行不同逻辑
            when (activePointers.size) {
                1 -> handleSingleFinger(activePointers.values.first())
                2 -> handleTwoFingers(activePointers.values.toList())
                3 -> handleThreeFingers()
            }
        }
    }
}
```

### 计算双指中心点与距离

```kotlin
fun twoFingerCentroid(changes: List<PointerInputChange>): Offset {
    val pressed = changes.filter { it.pressed }
    return if (pressed.size >= 2) {
        (pressed[0].position + pressed[1].position) / 2f
    } else Offset.Zero
}

fun twoFingerDistance(changes: List<PointerInputChange>): Float {
    val pressed = changes.filter { it.pressed }
    return if (pressed.size >= 2) {
        (pressed[1].position - pressed[0].position).getDistance()
    } else 0f
}
```

### 完整多指缩放旋转

```kotlin
@Composable
fun MultiTouchImage(painter: Painter) {
    var scale by remember { mutableStateOf(1f) }
    var rotation by remember { mutableStateOf(0f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    Image(
        painter = painter,
        contentDescription = null,
        modifier = Modifier
            .graphicsLayer {
                scaleX = scale; scaleY = scale
                rotationZ = rotation
                translationX = offset.x; translationY = offset.y
            }
            .pointerInput(Unit) {
                detectTransformGestures(
                    panZoomLock = false
                ) { centroid, pan, zoom, rotate ->
                    // 以双指中心点为缩放原点
                    val oldScale = scale
                    scale = (scale * zoom).coerceIn(0.5f, 5f)

                    // 调整偏移使缩放中心保持不变
                    offset = (offset + centroid / oldScale) -
                            (centroid / scale + pan / oldScale)
                    rotation += rotate
                }
            }
    )
}
```

---

## 与 View 手势互操作

### Compose 内嵌 View 的手势传递

```kotlin
// AndroidView 中的 View 使用原生事件系统
// Compose 会将 PointerEvent 转回 MotionEvent 传给 View
@Composable
fun InteropGestureDemo() {
    AndroidView(
        factory = { context ->
            RecyclerView(context).apply {
                // RecyclerView 的滚动手势由 View 系统处理
                // Compose 父容器的 NestedScroll 会通过 NestedScrollInteropConnection 协作
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
            // 启用嵌套滚动互操作
            .nestedScroll(rememberNestedScrollInteropConnection())
    )
}
```

### View 内嵌 Compose 的手势传递

```kotlin
// ComposeView 在 ViewGroup 中：
// Compose 通过 AndroidComposeView 桥接，手势从 View 系统进入 Compose
class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        view.findViewById<ComposeView>(R.id.compose_view).apply {
            setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
            setContent {
                // Compose 内容正常处理手势
                // 若需要事件传回父 ViewGroup：使用 Modifier.pointerInteropFilter
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInteropFilter { motionEvent ->
                            // 返回 true: Compose 消费，不传给父 View
                            // 返回 false: 传递给父 View 处理
                            when (motionEvent.action) {
                                MotionEvent.ACTION_DOWN -> true   // Compose 处理
                                else -> false                      // 其余传给父 View
                            }
                        }
                )
            }
        }
    }
}
```

---

## 完整实战示例

### 可拖拽排序列表

```kotlin
@Composable
fun DraggableSortList(
    items: List<String>,
    onReorder: (from: Int, to: Int) -> Unit
) {
    val listState = rememberLazyListState()
    var draggingIndex by remember { mutableStateOf<Int?>(null) }
    var draggingOffset by remember { mutableStateOf(0f) }

    LazyColumn(state = listState) {
        itemsIndexed(items, key = { _, item -> item }) { index, item ->
            val isDragging = index == draggingIndex

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .zIndex(if (isDragging) 1f else 0f)
                    .graphicsLayer {
                        translationY = if (isDragging) draggingOffset else 0f
                        alpha = if (isDragging) 0.85f else 1f
                    }
                    .background(
                        if (isDragging) MaterialTheme.colorScheme.primaryContainer
                        else MaterialTheme.colorScheme.surface
                    )
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.DragHandle,
                    contentDescription = "拖拽",
                    modifier = Modifier
                        .pointerInput(index) {
                            detectDragGesturesAfterLongPress(
                                onDragStart = {
                                    draggingIndex = index
                                    draggingOffset = 0f
                                },
                                onDrag = { change, dragAmount ->
                                    change.consume()
                                    draggingOffset += dragAmount.y
                                    // 计算目标位置并触发重排
                                    val targetIndex = (index + (draggingOffset / 60).toInt())
                                        .coerceIn(0, items.lastIndex)
                                    if (targetIndex != index) {
                                        onReorder(index, targetIndex)
                                        draggingOffset = 0f
                                    }
                                },
                                onDragEnd = { draggingIndex = null },
                                onDragCancel = { draggingIndex = null }
                            )
                        }
                )
                Spacer(Modifier.width(12.dp))
                Text(text = item)
            }
        }
    }
}
```

### 可缩放平移的图片查看器

```kotlin
@Composable
fun ZoomablePanImage(
    painter: Painter,
    modifier: Modifier = Modifier,
    maxScale: Float = 4f
) {
    var scale by remember { mutableStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val state = rememberTransformableState { zoomChange, panChange, _ ->
        val newScale = (scale * zoomChange).coerceIn(1f, maxScale)
        // 限制平移范围，不超出图片边界
        val maxOffset = Offset(
            x = (newScale - 1f) * 300f,   // 根据实际尺寸计算
            y = (newScale - 1f) * 400f
        )
        offset = Offset(
            x = (offset.x + panChange.x).coerceIn(-maxOffset.x, maxOffset.x),
            y = (offset.y + panChange.y).coerceIn(-maxOffset.y, maxOffset.y)
        )
        scale = newScale
    }

    // 双击还原
    var doubleTapOffset by remember { mutableStateOf(Offset.Zero) }

    Image(
        painter = painter,
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = modifier
            .graphicsLayer {
                scaleX = scale; scaleY = scale
                translationX = offset.x; translationY = offset.y
            }
            .transformable(state)
            .pointerInput(Unit) {
                detectTapGestures(
                    onDoubleTap = {
                        scale = if (scale > 1f) 1f else 2f
                        if (scale == 1f) offset = Offset.Zero
                    }
                )
            }
    )
}
```

### 绘图面板（自由绘制）

```kotlin
data class PathData(val path: Path, val color: Color, val strokeWidth: Float)

@Composable
fun DrawingBoard(modifier: Modifier = Modifier) {
    val paths = remember { mutableStateListOf<PathData>() }
    var currentPath by remember { mutableStateOf<Path?>(null) }
    var currentColor by remember { mutableStateOf(Color.Black) }
    var strokeWidth by remember { mutableStateOf(4.dp) }

    Column(modifier = modifier) {
        // 颜色选择行
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(8.dp)) {
            listOf(Color.Black, Color.Red, Color.Blue, Color.Green).forEach { color ->
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(color, CircleShape)
                        .border(
                            if (color == currentColor) 3.dp else 0.dp,
                            Color.White, CircleShape
                        )
                        .clickable { currentColor = color }
                )
            }
            Spacer(Modifier.weight(1f))
            TextButton(onClick = { paths.clear() }) { Text("清空") }
        }

        // 画布
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .pointerInput(currentColor, strokeWidth) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            currentPath = Path().apply { moveTo(offset.x, offset.y) }
                        },
                        onDrag = { change, _ ->
                            change.consume()
                            currentPath?.lineTo(change.position.x, change.position.y)
                        },
                        onDragEnd = {
                            currentPath?.let {
                                paths.add(PathData(it, currentColor, strokeWidth.toPx()))
                            }
                            currentPath = null
                        },
                        onDragCancel = { currentPath = null }
                    )
                }
        ) {
            // 绘制历史路径
            paths.forEach { pathData ->
                drawPath(
                    path = pathData.path,
                    color = pathData.color,
                    style = Stroke(width = pathData.strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
            }
            // 绘制当前路径
            currentPath?.let {
                drawPath(
                    path = it,
                    color = currentColor,
                    style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
            }
        }
    }
}
```

---

## 最佳实践与性能

### 1. key 参数变化会重启协程

```kotlin
// key 是业务数据时，数据变化会重新注册手势
Modifier.pointerInput(enabled) {
    if (!enabled) return@pointerInput
    detectTapGestures { onTap() }
}

// 避免频繁变化的 key 导致手势频繁重启
// ❌ 错误：lambda 每次重组都是新对象
Modifier.pointerInput(onClick) { }

// ✅ 正确：用稳定的 key，在内部读取最新 lambda
val onClickRef = rememberUpdatedState(onClick)
Modifier.pointerInput(Unit) {
    detectTapGestures { onClickRef.value() }
}
```

### 2. 避免在手势回调中触发大量重组

```kotlin
// ❌ 每次 drag 都触发 Text 重组
var offset by remember { mutableStateOf(Offset.Zero) }
Text(text = "偏移: $offset")  // 高频重组

// ✅ 使用 graphicsLayer 跳过重组（在 draw 层修改）
val offsetX = remember { Animatable(0f) }
Box(modifier = Modifier.graphicsLayer { translationX = offsetX.value })
// 或使用 offset(lambda 版本)
Box(modifier = Modifier.offset { IntOffset(offsetX.value.roundToInt(), 0) })
```

### 3. 手势与动画协作

```kotlin
// 拖拽释放后执行弹性回弹
@Composable
fun SpringBackBox() {
    val offsetX = remember { Animatable(0f) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .offset { IntOffset(offsetX.value.roundToInt(), 0) }
            .size(80.dp)
            .background(Color.Blue, RoundedCornerShape(8.dp))
            .pointerInput(Unit) {
                detectDragGestures(
                    onDrag = { change, dragAmount ->
                        change.consume()
                        coroutineScope.launch {
                            offsetX.snapTo(offsetX.value + dragAmount.x)
                        }
                    },
                    onDragEnd = {
                        coroutineScope.launch {
                            // 弹性回原位
                            offsetX.animateTo(
                                targetValue = 0f,
                                animationSpec = spring(
                                    dampingRatio = Spring.DampingRatioMediumBouncy,
                                    stiffness = Spring.StiffnessMedium
                                )
                            )
                        }
                    }
                )
            }
    )
}
```

### 4. 手势状态调试

```kotlin
// 使用 InteractionSource 监听交互状态
val interactionSource = remember { MutableInteractionSource() }
val isPressed by interactionSource.collectIsPressedAsState()
val isDragged by interactionSource.collectIsDraggedAsState()

LaunchedEffect(isPressed, isDragged) {
    println("pressed=$isPressed dragged=$isDragged")
}
```

---

## 总结

```
事件分发路径
  Initial（根→叶）→ Main（叶→根）→ Final（根→叶）

消费方式
  change.consume()  →  设置 isConsumed=true，不阻止传递

手势 API 选型
  简单点击         → clickable / combinedClickable
  单轴拖拽         → draggable
  滚动             → scrollable / verticalScroll
  缩放旋转平移     → transformable / detectTransformGestures
  复杂自定义       → pointerInput + awaitPointerEventScope

冲突处理
  嵌套滚动         → NestedScrollConnection
  父级拦截         → Pass.Initial 预消费
  子级抢占         → Pass.Initial consume() 阻止父级
  View 互操作      → nestedScrollInteropConnection / pointerInteropFilter
```

Compose 手势系统的核心：**协程化的事件流 + 三阶段 Pass 分发 + consume 标记协调**。
