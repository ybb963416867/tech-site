---
title: "Composable_自定义控件"
description: "1. [基础自定义 Composable](基础自定义composable) 2. [Modifier 系统](modifier系统) 3. [自定义 Layout](自定义layout) 4. [Canvas 绘制](canvas绘..."
pubDate: 2026-06-16
category: "Jetpack Compose"
tags: [Array, API, JavaScript, SEO]
draft: false
---
# Android Jetpack Compose 自定义控件详解

## 目录

1. [基础自定义 Composable](#基础自定义-composable)
2. [Modifier 系统](#modifier-系统)
3. [自定义 Layout](#自定义-layout)
4. [Canvas 绘制](#canvas-绘制)
5. [自定义 Modifier](#自定义-modifier)
6. [手势处理](#手势处理)
7. [动画集成](#动画集成)
8. [与 View 互操作](#与-view-互操作)
9. [主题与样式](#主题与样式)
10. [完整控件示例](#完整控件示例)
11. [最佳实践](#最佳实践)

---

## 基础自定义 Composable

### 最简结构

```kotlin
@Composable
fun MyButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,           // modifier 必须作为参数暴露
    enabled: Boolean = true,
    colors: ButtonColors = ButtonDefaults.buttonColors()
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = colors
    ) {
        Text(text = text)
    }
}
```

### 设计原则

| 原则 | 说明 |
|------|------|
| `modifier` 参数必须暴露 | 让调用方控制大小、位置、间距 |
| `modifier` 默认值为 `Modifier` | 不要给默认值加额外修饰 |
| `modifier` 应用到根节点 | 整棵子树只有根节点接收外部 modifier |
| 提供合理默认值 | 让控件开箱即用，同时支持定制 |
| 内容槽（Slot API） | 复杂控件用 `content: @Composable () -> Unit` 替代固定内容 |

### Slot API（内容插槽）

```kotlin
@Composable
fun Card(
    modifier: Modifier = Modifier,
    header: @Composable (() -> Unit)? = null,   // 可选插槽
    footer: @Composable (() -> Unit)? = null,
    content: @Composable () -> Unit             // 必选内容插槽
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surface)
    ) {
        header?.let {
            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                it()
            }
            Divider()
        }
        Box(modifier = Modifier.padding(16.dp)) {
            content()
        }
        footer?.let {
            Divider()
            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                it()
            }
        }
    }
}

// 使用
Card(
    header = { Text("标题", style = MaterialTheme.typography.titleMedium) },
    footer = { TextButton(onClick = {}) { Text("查看更多") } }
) {
    Text("卡片内容区域")
}
```

---

## Modifier 系统

### Modifier 链式调用顺序

**顺序很重要**，每个 modifier 作用于前一个的结果：

```kotlin
// padding 在 background 外 → 背景不包含 padding 区域
Box(
    modifier = Modifier
        .padding(16.dp)
        .background(Color.Blue)
        .size(100.dp)
)

// background 在 padding 外 → 背景包含 padding 区域
Box(
    modifier = Modifier
        .background(Color.Blue)
        .padding(16.dp)
        .size(100.dp)
)
```

### 常用 Modifier 分类

```kotlin
// ── 尺寸 ──────────────────────────────────────────
Modifier.size(100.dp)                   // 固定宽高
Modifier.width(200.dp).height(50.dp)    // 分别设置
Modifier.fillMaxWidth()                 // 填满宽度
Modifier.fillMaxSize(fraction = 0.5f)   // 填满 50%
Modifier.wrapContentSize()              // 包裹内容
Modifier.defaultMinSize(minWidth = 64.dp)

// ── 布局 ──────────────────────────────────────────
Modifier.padding(16.dp)
Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
Modifier.offset(x = 8.dp, y = 4.dp)
Modifier.align(Alignment.CenterHorizontally)  // 仅在 Box/Column/Row 中有效

// ── 外观 ──────────────────────────────────────────
Modifier.background(Color.Red)
Modifier.background(
    brush = Brush.linearGradient(listOf(Color.Red, Color.Blue))
)
Modifier.clip(RoundedCornerShape(8.dp))
Modifier.border(1.dp, Color.Gray, RoundedCornerShape(8.dp))
Modifier.shadow(elevation = 4.dp, shape = RoundedCornerShape(8.dp))
Modifier.alpha(0.5f)

// ── 交互 ──────────────────────────────────────────
Modifier.clickable { /* 处理点击 */ }
Modifier.clickable(
    interactionSource = remember { MutableInteractionSource() },
    indication = rememberRipple(bounded = true)
) { }
Modifier.pointerInput(Unit) { detectTapGestures { } }

// ── 滚动 ──────────────────────────────────────────
Modifier.verticalScroll(rememberScrollState())
Modifier.horizontalScroll(rememberScrollState())

// ── 绘制 ──────────────────────────────────────────
Modifier.drawBehind { drawRect(Color.Yellow) }
Modifier.drawWithContent { drawContent(); drawCircle(Color.Red) }
```

---

## 自定义 Layout

### Layout 基础

`Layout` 允许完全自定义测量（Measure）和放置（Place）逻辑：

```kotlin
@Composable
fun MyLayout(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Layout(
        modifier = modifier,
        content = content
    ) { measurables, constraints ->
        // 1. 测量所有子项
        val placeables = measurables.map { measurable ->
            measurable.measure(constraints)
        }

        // 2. 计算自身尺寸
        val width = placeables.maxOfOrNull { it.width } ?: 0
        val height = placeables.sumOf { it.height }

        // 3. 放置子项
        layout(width, height) {
            var yOffset = 0
            placeables.forEach { placeable ->
                placeable.placeRelative(x = 0, y = yOffset)
                yOffset += placeable.height
            }
        }
    }
}
```

### 实战：流式布局（FlowRow）

将子项从左到右排列，放不下则换行：

```kotlin
@Composable
fun FlowLayout(
    modifier: Modifier = Modifier,
    spacing: Dp = 8.dp,
    content: @Composable () -> Unit
) {
    val spacingPx = with(LocalDensity.current) { spacing.roundToPx() }

    Layout(modifier = modifier, content = content) { measurables, constraints ->
        val placeables = measurables.map { it.measure(constraints.copy(minWidth = 0)) }

        var xOffset = 0
        var yOffset = 0
        var rowHeight = 0
        val positions = mutableListOf<Pair<Int, Int>>()

        placeables.forEach { placeable ->
            if (xOffset + placeable.width > constraints.maxWidth && xOffset > 0) {
                xOffset = 0
                yOffset += rowHeight + spacingPx
                rowHeight = 0
            }
            positions.add(Pair(xOffset, yOffset))
            xOffset += placeable.width + spacingPx
            rowHeight = maxOf(rowHeight, placeable.height)
        }

        val totalHeight = yOffset + rowHeight

        layout(constraints.maxWidth, totalHeight) {
            placeables.forEachIndexed { index, placeable ->
                placeable.placeRelative(positions[index].first, positions[index].second)
            }
        }
    }
}

// 使用
FlowLayout(spacing = 8.dp) {
    listOf("Kotlin", "Compose", "Android", "MVVM", "Flow", "Coroutine").forEach { tag ->
        Chip(label = tag)
    }
}
```

### SubcomposeLayout

延迟组合子内容，先测量部分子项以决定其他子项的约束：

```kotlin
@Composable
fun WithConstraintsExample(modifier: Modifier = Modifier) {
    SubcomposeLayout(modifier = modifier) { constraints ->
        // 先测量 header 获取高度
        val headerPlaceables = subcompose("header") {
            Text("Header", style = MaterialTheme.typography.titleLarge)
        }.map { it.measure(constraints) }

        val headerHeight = headerPlaceables.maxOfOrNull { it.height } ?: 0

        // 用剩余高度约束 content
        val contentConstraints = constraints.copy(
            maxHeight = constraints.maxHeight - headerHeight
        )
        val contentPlaceables = subcompose("content") {
            LazyColumn { items(20) { Text("Item $it") } }
        }.map { it.measure(contentConstraints) }

        layout(constraints.maxWidth, constraints.maxHeight) {
            headerPlaceables.forEach { it.placeRelative(0, 0) }
            contentPlaceables.forEach { it.placeRelative(0, headerHeight) }
        }
    }
}
```

---

## Canvas 绘制

### Canvas 基础 API

```kotlin
@Composable
fun DrawingCanvas(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.size(200.dp)) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val center = Offset(canvasWidth / 2, canvasHeight / 2)

        // 矩形
        drawRect(
            color = Color.Blue,
            topLeft = Offset(0f, 0f),
            size = Size(100f, 80f)
        )

        // 圆形
        drawCircle(
            color = Color.Red,
            radius = 50f,
            center = center
        )

        // 圆弧
        drawArc(
            color = Color.Green,
            startAngle = 0f,
            sweepAngle = 270f,
            useCenter = false,
            topLeft = Offset(20f, 20f),
            size = Size(100f, 100f),
            style = Stroke(width = 4f)
        )

        // 线条
        drawLine(
            color = Color.Black,
            start = Offset(0f, 0f),
            end = Offset(canvasWidth, canvasHeight),
            strokeWidth = 2f
        )

        // 路径
        val path = Path().apply {
            moveTo(0f, canvasHeight)
            lineTo(canvasWidth / 2, 0f)
            lineTo(canvasWidth, canvasHeight)
            close()
        }
        drawPath(path = path, color = Color.Magenta, style = Fill)

        // 文字
        drawContext.canvas.nativeCanvas.drawText(
            "Hello Canvas",
            center.x,
            center.y,
            android.graphics.Paint().apply {
                color = android.graphics.Color.BLACK
                textSize = 40f
                textAlign = android.graphics.Paint.Align.CENTER
            }
        )
    }
}
```

### 实战：仪表盘控件

```kotlin
@Composable
fun GaugeMeter(
    value: Float,           // 0f ~ 1f
    modifier: Modifier = Modifier,
    trackColor: Color = Color.LightGray,
    progressColor: Color = Color.Blue,
    strokeWidth: Dp = 12.dp
) {
    val animatedValue by animateFloatAsState(
        targetValue = value.coerceIn(0f, 1f),
        animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing),
        label = "gauge"
    )

    Canvas(modifier = modifier.size(150.dp)) {
        val strokePx = strokeWidth.toPx()
        val inset = strokePx / 2
        val arcRect = Rect(inset, inset, size.width - inset, size.height - inset)

        // 背景轨道（210° ~ 270° 弧，即 135° 起始，270° 扫描）
        drawArc(
            color = trackColor,
            startAngle = 135f,
            sweepAngle = 270f,
            useCenter = false,
            topLeft = arcRect.topLeft,
            size = arcRect.size,
            style = Stroke(width = strokePx, cap = StrokeCap.Round)
        )

        // 进度弧
        drawArc(
            color = progressColor,
            startAngle = 135f,
            sweepAngle = 270f * animatedValue,
            useCenter = false,
            topLeft = arcRect.topLeft,
            size = arcRect.size,
            style = Stroke(width = strokePx, cap = StrokeCap.Round)
        )

        // 中心文字
        drawContext.canvas.nativeCanvas.drawText(
            "${(animatedValue * 100).toInt()}%",
            size.width / 2,
            size.height / 2 + 14f,
            android.graphics.Paint().apply {
                color = android.graphics.Color.BLACK
                textSize = 40f
                textAlign = android.graphics.Paint.Align.CENTER
                isFakeBoldText = true
            }
        )
    }
}
```

### 实战：折线图

```kotlin
@Composable
fun LineChart(
    dataPoints: List<Float>,
    modifier: Modifier = Modifier,
    lineColor: Color = Color(0xFF2196F3),
    fillColor: Color = Color(0x332196F3)
) {
    Canvas(modifier = modifier) {
        if (dataPoints.size < 2) return@Canvas

        val maxValue = dataPoints.max()
        val minValue = dataPoints.min()
        val range = (maxValue - minValue).coerceAtLeast(1f)
        val stepX = size.width / (dataPoints.size - 1)

        fun xAt(i: Int) = i * stepX
        fun yAt(v: Float) = size.height - ((v - minValue) / range) * size.height

        // 填充区域路径
        val fillPath = Path().apply {
            moveTo(xAt(0), size.height)
            lineTo(xAt(0), yAt(dataPoints[0]))
            dataPoints.forEachIndexed { i, v ->
                if (i > 0) lineTo(xAt(i), yAt(v))
            }
            lineTo(xAt(dataPoints.lastIndex), size.height)
            close()
        }
        drawPath(fillPath, fillColor)

        // 折线路径
        val linePath = Path().apply {
            moveTo(xAt(0), yAt(dataPoints[0]))
            dataPoints.forEachIndexed { i, v ->
                if (i > 0) lineTo(xAt(i), yAt(v))
            }
        }
        drawPath(linePath, lineColor, style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round))

        // 数据点
        dataPoints.forEachIndexed { i, v ->
            drawCircle(lineColor, radius = 5.dp.toPx(), center = Offset(xAt(i), yAt(v)))
            drawCircle(Color.White, radius = 3.dp.toPx(), center = Offset(xAt(i), yAt(v)))
        }
    }
}
```

---

## 自定义 Modifier

### 基于已有 Modifier 组合

```kotlin
// 添加虚线边框
fun Modifier.dashedBorder(
    color: Color,
    strokeWidth: Dp,
    dashLength: Dp,
    gapLength: Dp,
    shape: Shape = RectangleShape
): Modifier = this.drawWithContent {
    drawContent()
    val strokePx = strokeWidth.toPx()
    val dashPx = dashLength.toPx()
    val gapPx = gapLength.toPx()
    val outline = shape.createOutline(size, layoutDirection, this)
    drawOutline(
        outline = outline,
        color = color,
        style = Stroke(
            width = strokePx,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(dashPx, gapPx))
        )
    )
}

// 使用
Box(
    modifier = Modifier
        .size(100.dp)
        .dashedBorder(Color.Red, 2.dp, 8.dp, 4.dp, RoundedCornerShape(8.dp))
)
```

### 自定义测量 Modifier（实现 aspectRatio）

```kotlin
fun Modifier.aspectRatio(ratio: Float): Modifier = layout { measurable, constraints ->
    val width = constraints.maxWidth
    val height = (width / ratio).toInt().coerceIn(constraints.minHeight, constraints.maxHeight)
    val placeable = measurable.measure(
        constraints.copy(minWidth = width, maxWidth = width, minHeight = height, maxHeight = height)
    )
    layout(placeable.width, placeable.height) {
        placeable.placeRelative(0, 0)
    }
}
```

### 带状态的 Modifier（shake 动画）

```kotlin
@Composable
fun Modifier.shake(trigger: Boolean): Modifier {
    val offsetX = remember { Animatable(0f) }

    LaunchedEffect(trigger) {
        if (trigger) {
            repeat(4) {
                offsetX.animateTo(if (it % 2 == 0) 10f else -10f,
                    animationSpec = tween(50))
            }
            offsetX.animateTo(0f)
        }
    }
    return this.offset(x = offsetX.value.dp)
}

// 使用
var shakeError by remember { mutableStateOf(false) }
TextField(
    value = text,
    onValueChange = { text = it },
    modifier = Modifier.shake(trigger = shakeError)
)
```

---

## 手势处理

### 点击与长按

```kotlin
@Composable
fun GestureBox(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(100.dp)
            .background(Color.Blue)
            .pointerInput(Unit) {
                detectTapGestures(
                    onTap = { offset -> Log.d("Gesture", "Tap at $offset") },
                    onDoubleTap = { offset -> Log.d("Gesture", "DoubleTap at $offset") },
                    onLongPress = { offset -> Log.d("Gesture", "LongPress at $offset") },
                    onPress = { offset ->
                        Log.d("Gesture", "Press start at $offset")
                        tryAwaitRelease()
                        Log.d("Gesture", "Press released")
                    }
                )
            }
    )
}
```

### 拖拽

```kotlin
@Composable
fun DraggableBox() {
    var offsetX by remember { mutableStateOf(0f) }
    var offsetY by remember { mutableStateOf(0f) }

    Box(
        modifier = Modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .size(80.dp)
            .background(Color.Red, RoundedCornerShape(8.dp))
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    offsetX += dragAmount.x
                    offsetY += dragAmount.y
                }
            }
    )
}
```

### 缩放与旋转（transformable）

```kotlin
@Composable
fun TransformableImage() {
    var scale by remember { mutableStateOf(1f) }
    var rotation by remember { mutableStateOf(0f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    val state = rememberTransformableState { zoomChange, panChange, rotationChange ->
        scale = (scale * zoomChange).coerceIn(0.5f, 3f)
        rotation += rotationChange
        offset += panChange
    }

    Image(
        painter = painterResource(id = R.drawable.sample),
        contentDescription = null,
        modifier = Modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                rotationZ = rotation
                translationX = offset.x
                translationY = offset.y
            }
            .transformable(state = state)
    )
}
```

### 自定义滑动控件（Slider）

```kotlin
@Composable
fun CustomSlider(
    value: Float,
    onValueChange: (Float) -> Unit,
    modifier: Modifier = Modifier,
    valueRange: ClosedFloatingPointRange<Float> = 0f..1f,
    trackColor: Color = Color.LightGray,
    thumbColor: Color = MaterialTheme.colorScheme.primary
) {
    var sliderWidth by remember { mutableStateOf(0) }

    Box(
        modifier = modifier
            .height(44.dp)
            .onSizeChanged { sliderWidth = it.width }
            .pointerInput(valueRange, sliderWidth) {
                detectHorizontalDragGestures { change, _ ->
                    change.consume()
                    val newValue = (change.position.x / sliderWidth)
                        .coerceIn(0f, 1f)
                        .let { valueRange.start + it * (valueRange.endInclusive - valueRange.start) }
                    onValueChange(newValue)
                }
            },
        contentAlignment = Alignment.CenterStart
    ) {
        val fraction = (value - valueRange.start) / (valueRange.endInclusive - valueRange.start)

        // 轨道
        Canvas(modifier = Modifier.fillMaxWidth().height(4.dp)) {
            drawRoundRect(trackColor, cornerRadius = CornerRadius(4f))
            drawRoundRect(thumbColor,
                size = Size(size.width * fraction, size.height),
                cornerRadius = CornerRadius(4f))
        }
        // 滑块
        Box(
            modifier = Modifier
                .fillMaxWidth(fraction)
                .wrapContentWidth(Alignment.End)
        ) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .background(thumbColor, CircleShape)
                    .shadow(4.dp, CircleShape)
            )
        }
    }
}
```

---

## 动画集成

### 状态驱动动画

```kotlin
@Composable
fun AnimatedVisibilityCard(visible: Boolean) {
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInVertically { -it },
        exit = fadeOut() + slideOutVertically { -it }
    ) {
        Card { Text("我会动画出现/消失", modifier = Modifier.padding(16.dp)) }
    }
}
```

### Animatable（精细控制）

```kotlin
@Composable
fun PulsingButton(onClick: () -> Unit) {
    val scale = remember { Animatable(1f) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .graphicsLayer { scaleX = scale.value; scaleY = scale.value }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                coroutineScope.launch {
                    scale.animateTo(0.85f, tween(100))
                    scale.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy))
                }
                onClick()
            }
    ) {
        Button(onClick = {}) { Text("弹性点击") }
    }
}
```

### 颜色渐变动画

```kotlin
@Composable
fun ColorTransitionBox(isActive: Boolean) {
    val color by animateColorAsState(
        targetValue = if (isActive) Color(0xFF4CAF50) else Color(0xFFE0E0E0),
        animationSpec = tween(durationMillis = 500),
        label = "color"
    )
    Box(
        modifier = Modifier
            .size(60.dp)
            .background(color, CircleShape)
    )
}
```

### 无限循环动画（Loading 控件）

```kotlin
@Composable
fun PulsingDot(
    color: Color = MaterialTheme.colorScheme.primary,
    size: Dp = 12.dp
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulsing")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Box(
        modifier = Modifier
            .size(size)
            .graphicsLayer { scaleX = scale; scaleY = scale; this.alpha = alpha }
            .background(color, CircleShape)
    )
}

// 三点加载
@Composable
fun ThreeDotsLoading(color: Color = MaterialTheme.colorScheme.primary) {
    val infiniteTransition = rememberInfiniteTransition(label = "dots")
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        repeat(3) { index ->
            val offsetY by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = -10f,
                animationSpec = infiniteRepeatable(
                    animation = tween(400, delayMillis = index * 100),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "dot$index"
            )
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .offset(y = offsetY.dp)
                    .background(color, CircleShape)
            )
        }
    }
}
```

---

## 与 View 互操作

### 在 Compose 中使用 View（AndroidView）

```kotlin
@Composable
fun WebViewComposable(
    url: String,
    modifier: Modifier = Modifier
) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                webViewClient = WebViewClient()
                loadUrl(url)
            }
        },
        update = { webView ->
            // 当 url 变化时更新
            webView.loadUrl(url)
        },
        modifier = modifier
    )
}

// 自定义 View 集成
@Composable
fun CustomViewComposable(
    value: Float,
    modifier: Modifier = Modifier
) {
    AndroidView(
        factory = { context ->
            MyCustomView(context).apply {
                // 初始化设置
            }
        },
        update = { view ->
            view.setValue(value) // 更新 View 状态
        },
        modifier = modifier
    )
}
```

### 在 View 中嵌入 Compose（ComposeView）

```xml
<!-- layout/fragment_home.xml -->
<LinearLayout ...>
    <TextView android:id="@+id/title" ... />
    <androidx.compose.ui.platform.ComposeView
        android:id="@+id/compose_view"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" />
</LinearLayout>
```

```kotlin
// Fragment 中
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    view.findViewById<ComposeView>(R.id.compose_view).apply {
        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
        setContent {
            MaterialTheme {
                MyComposableWidget()
            }
        }
    }
}
```

---

## 主题与样式

### 定义控件样式对象

```kotlin
// 仿 MaterialTheme 模式：定义独立样式对象
data class ChipColors(
    val containerColor: Color,
    val labelColor: Color,
    val borderColor: Color
)

object ChipDefaults {
    @Composable
    fun colors(
        containerColor: Color = MaterialTheme.colorScheme.secondaryContainer,
        labelColor: Color = MaterialTheme.colorScheme.onSecondaryContainer,
        borderColor: Color = Color.Transparent
    ) = ChipColors(containerColor, labelColor, borderColor)

    @Composable
    fun outlinedColors() = colors(
        containerColor = Color.Transparent,
        borderColor = MaterialTheme.colorScheme.outline
    )
}

@Composable
fun CustomChip(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    colors: ChipColors = ChipDefaults.colors()
) {
    Box(
        modifier = modifier
            .clip(CircleShape)
            .background(colors.containerColor)
            .border(1.dp, colors.borderColor, CircleShape)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(text = label, color = colors.labelColor, style = MaterialTheme.typography.labelMedium)
    }
}
```

### 响应主题变化

```kotlin
@Composable
fun ThemedCard(content: @Composable () -> Unit) {
    val isSystemDark = isSystemInDarkTheme()
    val surfaceColor = if (isSystemDark) Color(0xFF1E1E1E) else Color(0xFFF5F5F5)
    val shadowElevation = if (isSystemDark) 0.dp else 4.dp

    Card(
        modifier = Modifier.shadow(shadowElevation, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = surfaceColor)
    ) {
        content()
    }
}
```

---

## 完整控件示例

### 评分控件（Star Rating）

```kotlin
@Composable
fun StarRating(
    rating: Float,
    onRatingChange: (Float) -> Unit,
    modifier: Modifier = Modifier,
    maxStars: Int = 5,
    starSize: Dp = 32.dp,
    activeColor: Color = Color(0xFFFFC107),
    inactiveColor: Color = Color(0xFFE0E0E0)
) {
    var totalWidth by remember { mutableStateOf(0) }

    Row(
        modifier = modifier
            .onSizeChanged { totalWidth = it.width }
            .pointerInput(maxStars) {
                detectHorizontalDragGestures { change, _ ->
                    change.consume()
                    val newRating = ((change.position.x / totalWidth) * maxStars)
                        .coerceIn(0f, maxStars.toFloat())
                    onRatingChange(newRating)
                }
                detectTapGestures { offset ->
                    val newRating = ((offset.x / totalWidth) * maxStars)
                        .coerceIn(1f, maxStars.toFloat())
                        .let { kotlin.math.ceil(it).toFloat() }
                    onRatingChange(newRating)
                }
            }
    ) {
        repeat(maxStars) { index ->
            val filled = when {
                index + 1 <= rating -> 1f
                index < rating -> rating - index
                else -> 0f
            }
            Box(modifier = Modifier.size(starSize)) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val path = starPath(size.width, size.height)
                    drawPath(path, inactiveColor)
                    if (filled > 0f) {
                        clipRect(right = size.width * filled) {
                            drawPath(path, activeColor)
                        }
                    }
                }
            }
        }
    }
}

private fun starPath(width: Float, height: Float): Path {
    val path = Path()
    val cx = width / 2
    val cy = height / 2
    val outerR = minOf(cx, cy)
    val innerR = outerR * 0.4f
    val points = 5
    for (i in 0 until points * 2) {
        val angle = Math.PI * i / points - Math.PI / 2
        val r = if (i % 2 == 0) outerR else innerR
        val x = (cx + r * kotlin.math.cos(angle)).toFloat()
        val y = (cy + r * kotlin.math.sin(angle)).toFloat()
        if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
    }
    path.close()
    return path
}
```

### 开关控件（Toggle Switch）

```kotlin
@Composable
fun CustomSwitch(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    trackColorOn: Color = MaterialTheme.colorScheme.primary,
    trackColorOff: Color = Color(0xFFCCCCCC),
    thumbColor: Color = Color.White
) {
    val transition = updateTransition(checked, label = "switch")
    val thumbOffset by transition.animateFloat(
        transitionSpec = { spring(stiffness = Spring.StiffnessMedium) },
        label = "thumbOffset"
    ) { if (it) 1f else 0f }
    val trackColor by transition.animateColor(
        transitionSpec = { tween(200) },
        label = "trackColor"
    ) { if (it) trackColorOn else trackColorOff }

    val trackWidth = 52.dp
    val trackHeight = 28.dp
    val thumbSize = 22.dp
    val thumbPadding = (trackHeight - thumbSize) / 2

    Box(
        modifier = modifier
            .width(trackWidth)
            .height(trackHeight)
            .clip(CircleShape)
            .background(trackColor)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onCheckedChange(!checked) }
    ) {
        val thumbOffsetDp = thumbPadding + (trackWidth - thumbSize - thumbPadding * 2) * thumbOffset
        Box(
            modifier = Modifier
                .offset(x = thumbOffsetDp, y = thumbPadding)
                .size(thumbSize)
                .shadow(2.dp, CircleShape)
                .background(thumbColor, CircleShape)
        )
    }
}
```

### 骨架屏（Skeleton Loading）

```kotlin
@Composable
fun ShimmerEffect(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(4.dp)
) {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerX by infiniteTransition.animateFloat(
        initialValue = -1f,
        targetValue = 2f,
        animationSpec = infiniteRepeatable(tween(1200, easing = LinearEasing)),
        label = "shimmerX"
    )

    Box(
        modifier = modifier
            .clip(shape)
            .drawWithContent {
                drawContent()
                val brush = Brush.horizontalGradient(
                    colors = listOf(
                        Color(0xFFE0E0E0),
                        Color(0xFFF5F5F5),
                        Color(0xFFE0E0E0)
                    ),
                    startX = shimmerX * size.width,
                    endX = (shimmerX + 1) * size.width
                )
                drawRect(brush)
            }
            .background(Color(0xFFE0E0E0))
    )
}

// 使用：组合成卡片骨架
@Composable
fun CardSkeleton(modifier: Modifier = Modifier) {
    Column(modifier = modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        ShimmerEffect(modifier = Modifier.size(60.dp), shape = CircleShape)
        ShimmerEffect(modifier = Modifier.fillMaxWidth(0.7f).height(16.dp))
        ShimmerEffect(modifier = Modifier.fillMaxWidth().height(12.dp))
        ShimmerEffect(modifier = Modifier.fillMaxWidth(0.5f).height(12.dp))
    }
}
```

---

## 最佳实践

### 1. 参数设计规范

```kotlin
// ✅ 标准签名模板
@Composable
fun MyWidget(
    // 必选：业务数据参数（放前面）
    value: String,
    onValueChange: (String) -> Unit,
    // 可选：modifier 必须暴露，默认 Modifier
    modifier: Modifier = Modifier,
    // 可选：样式/行为参数（提供合理默认值）
    enabled: Boolean = true,
    colors: MyWidgetColors = MyWidgetDefaults.colors()
) { }
```

### 2. 避免在 Composable 内创建 remember 对象被外部覆盖

```kotlin
// ❌ 问题：interactionSource 被 remember 锁死，外部无法控制
@Composable
fun BadButton(onClick: () -> Unit) {
    val interactionSource = remember { MutableInteractionSource() }
    Button(onClick = onClick, interactionSource = interactionSource) { }
}

// ✅ 正确：暴露 interactionSource 参数
@Composable
fun GoodButton(
    onClick: () -> Unit,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    Button(onClick = onClick, interactionSource = interactionSource) { }
}
```

### 3. 性能优化

```kotlin
// 使用 key 稳定 List 项
LazyColumn {
    items(list, key = { it.id }) { item -> ItemRow(item) }
}

// 使用 derivedStateOf 避免多余重组
val isScrolled by remember {
    derivedStateOf { scrollState.value > 0 }
}

// 避免在组合期间分配对象
// ❌ 每次重组都创建新对象
@Composable
fun Bad() {
    val list = listOf(1, 2, 3)  // 每次重组重新创建
}

// ✅ 用 remember 缓存
@Composable
fun Good() {
    val list = remember { listOf(1, 2, 3) }
}
```

### 4. 预览（Preview）

```kotlin
// 为自定义控件提供完整的预览集合
@Preview(name = "默认", showBackground = true)
@Preview(name = "暗色模式", uiMode = Configuration.UI_MODE_NIGHT_YES, showBackground = true)
@Preview(name = "大字体", fontScale = 1.5f, showBackground = true)
@Composable
private fun MyWidgetPreview() {
    MaterialTheme {
        MyWidget(value = "预览文字", onValueChange = {})
    }
}
```

### 5. 无障碍（Accessibility）

```kotlin
@Composable
fun AccessibleIcon(
    painter: Painter,
    description: String,
    onClick: () -> Unit
) {
    Icon(
        painter = painter,
        contentDescription = description,  // 不要传 null（除非纯装饰）
        modifier = Modifier
            .size(48.dp)                   // 最小点击区域 48dp
            .clickable(onClickLabel = description) { onClick() }
            .semantics {
                role = Role.Button
            }
    )
}
```

---

## 总结

```
基础 Composable  → 参数 + Slot API + modifier 暴露
自定义布局      → Layout / SubcomposeLayout
自定义绘制      → Canvas + Path + DrawScope
自定义 Modifier → layout{} / drawWithContent / pointerInput
手势交互        → pointerInput + detectXxxGestures
动画            → animate*AsState / Animatable / InfiniteTransition
View 互操作     → AndroidView / ComposeView
主题样式        → 样式对象 + CompositionLocal
```

自定义控件的核心原则：**暴露 modifier、提供默认值、保持无状态、支持主题**。
