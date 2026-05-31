---
title: "SwiftUI Image"
description: ""
pubDate: 2026-05-29
category: "view"
tags: [Mac, iOS, Environment, Swift, API]
draft: false
---
# 🚀  SwiftUI Image 修饰符完整指南

---

## 概述

SwiftUI 的 `Image` 视图用于显示图片内容，支持多种图片源和丰富的修饰符来控制图片的显示方式、缩放模式、颜色处理等。本文档详细介绍了所有可用的 Image 修饰符。

## Image 初始化方式

### 基础初始化方法

#### `Image(_ name: String, bundle: Bundle?)`
从应用包中加载图片。

**参数：**
- `name: String` - 图片文件名
- `bundle: Bundle?` - 资源包（默认为主包）

```swift
// 从主包加载图片
Image("photo")

// 从指定包加载图片
Image("icon", bundle: .module)

// 加载不存在的图片（显示占位符）
Image("nonexistent")
```

#### `Image(systemName: String)`
加载 SF Symbols 系统图标。

**参数：**
- `systemName: String` - SF Symbol 名称

```swift
// 基础系统图标
Image(systemName: "heart")
Image(systemName: "star.fill")
Image(systemName: "person.circle")
Image(systemName: "gear")

// 复杂系统图标
Image(systemName: "iphone.gen3")
Image(systemName: "macbook.and.iphone")
```

#### `Image(uiImage: UIImage)`
从 UIImage 对象创建图片。

**参数：**
- `uiImage: UIImage` - UIImage 对象

```swift
// 从 UIImage 创建
let uiImage = UIImage(named: "photo")!
Image(uiImage: uiImage)

// 从网络图片创建
URLSession.shared.dataTask(with: url) { data, _, _ in
    if let data = data, let uiImage = UIImage(data: data) {
        DispatchQueue.main.async {
            self.image = Image(uiImage: uiImage)
        }
    }
}.resume()
```

#### `Image(cgImage: CGImage, scale: CGFloat, orientation: Image.Orientation, label: Text)`
从 CGImage 创建图片。

**参数：**
- `cgImage: CGImage` - CGImage 对象
- `scale: CGFloat` - 缩放比例
- `orientation: Image.Orientation` - 图片方向
- `label: Text` - 可访问性标签

```swift
let cgImage: CGImage = // ... 获取 CGImage
Image(cgImage: cgImage, scale: 2.0, orientation: .up, label: Text("示例图片"))
```

#### `Image(decorative name: String, bundle: Bundle?)`
创建装饰性图片（对可访问性隐藏）。

**参数：**
- `name: String` - 图片名称
- `bundle: Bundle?` - 资源包

```swift
// 装饰性图片，屏幕阅读器会忽略
Image(decorative: "background-pattern")
```

---

## Image 修饰符分类

SwiftUI Image 的修饰符可以分为以下几类：

1. **缩放与尺寸** - 控制图片大小和缩放模式
2. **颜色与渲染** - 控制图片颜色和渲染方式
3. **裁剪与形状** - 控制图片裁剪和形状
4. **布局相关** - 控制图片在容器中的布局
5. **可访问性** - 提升无障碍体验
6. **符号图像** - SF Symbols 专用修饰符
7. **动画相关** - 控制图片变化动画
8. **环境与系统** - 与系统环境的集成

---

## 缩放与尺寸修饰符

### `.resizable(capInsets:resizingMode:)`
使图片可调整大小。

**参数：**
- `capInsets: EdgeInsets` - 保护边缘（九宫格拉伸）
- `resizingMode: Image.ResizingMode` - 调整模式

**调整模式：**
- `.stretch` - 拉伸模式（默认）
- `.tile` - 平铺模式

```swift
// 基础可调整大小
Image("photo")
    .resizable()
    .frame(width: 200, height: 150)

// 九宫格拉伸（保护边缘）
Image("button-background")
    .resizable(capInsets: EdgeInsets(top: 10, leading: 10, bottom: 10, trailing: 10))
    .frame(width: 200, height: 60)

// 平铺模式
Image("pattern")
    .resizable(resizingMode: .tile)
    .frame(width: 300, height: 200)
```

### `.scaledToFit()`
按比例缩放以适应容器。

```swift
Image("photo")
    .resizable()
    .scaledToFit()
    .frame(width: 200, height: 200)
    .border(Color.red)  // 可以看到留白部分
```

### `.scaledToFill()`
按比例缩放以填充容器。

```swift
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 200)
    .clipped()  // 裁剪超出部分
```

### `.aspectRatio(_:contentMode:)`
设置宽高比和内容模式。

**参数：**
- `aspectRatio: CGFloat?` - 宽高比（宽/高）
- `contentMode: ContentMode` - 内容模式

**内容模式：**
- `.fit` - 适应模式
- `.fill` - 填充模式

```swift
// 设置特定宽高比
Image("photo")
    .resizable()
    .aspectRatio(16/9, contentMode: .fit)
    .frame(width: 300)

// 保持原始宽高比
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fit)
    .frame(width: 200, height: 100)
```

### `.scaleEffect(_:anchor:)`
设置缩放效果。

**参数：**
- `scale: CGFloat` - 缩放比例
- `anchor: UnitPoint` - 缩放锚点

```swift
Image("photo")
    .scaleEffect(1.5)  // 放大1.5倍

Image("photo")
    .scaleEffect(0.8)  // 缩小到80%

Image("photo")
    .scaleEffect(2.0, anchor: .topLeading)  // 从左上角开始缩放
```

### `.scaleEffect(x:y:anchor:)`
分别设置 X 和 Y 轴缩放。

**参数：**
- `x: CGFloat` - X 轴缩放比例
- `y: CGFloat` - Y 轴缩放比例
- `anchor: UnitPoint` - 缩放锚点

```swift
Image("photo")
    .scaleEffect(x: 1.5, y: 0.8)  // X轴放大，Y轴缩小

Image("photo")
    .scaleEffect(x: -1, y: 1)     // 水平翻转
```

---

## 颜色与渲染修饰符

### `.renderingMode(_:)`
设置图片渲染模式。

**参数：**
- `renderingMode: Image.TemplateRenderingMode` - 渲染模式

**渲染模式：**
- `.original` - 原始模式（保持原色）
- `.template` - 模板模式（变为单色）

```swift
// 原始颜色渲染
Image("colored-icon")
    .renderingMode(.original)

// 模板模式（可以着色）
Image("icon")
    .renderingMode(.template)
    .foregroundColor(.red)
```

### `.foregroundColor(_:)`
设置前景色（适用于模板模式和 SF Symbols）。

**参数：**
- `color: Color?` - 前景色

```swift
// 系统图标着色
Image(systemName: "heart")
    .foregroundColor(.red)

// 自定义图标着色（需要是模板模式）
Image("icon")
    .renderingMode(.template)
    .foregroundColor(.blue)
```

### `.foregroundStyle(_:)` (iOS 15+)
设置前景样式，支持渐变。

**参数：**
- `style: any ShapeStyle` - 样式对象

```swift
// 渐变着色
Image(systemName: "star.fill")
    .font(.largeTitle)
    .foregroundStyle(
        LinearGradient(
            colors: [.yellow, .orange, .red],
            startPoint: .top,
            endPoint: .bottom
        )
    )

// 径向渐变
Image(systemName: "sun.max.fill")
    .font(.system(size: 50))
    .foregroundStyle(
        RadialGradient(
            colors: [.yellow, .orange],
            center: .center,
            startRadius: 0,
            endRadius: 25
        )
    )
```

### `.accentColor(_:)`
设置强调色。

**参数：**
- `accentColor: Color?` - 强调色

```swift
Image(systemName: "heart")
    .accentColor(.pink)
```

### `.colorMultiply(_:)`
应用颜色乘法滤镜。

**参数：**
- `color: Color` - 乘法颜色

```swift
Image("photo")
    .colorMultiply(.red)      // 红色滤镜
    .colorMultiply(.blue)     // 蓝色滤镜
    .colorMultiply(.gray)     // 灰度效果
```

### `.colorInvert()`
反转图片颜色。

```swift
Image("photo")
    .colorInvert()
```

### `.grayscale(_:)`
应用灰度效果。

**参数：**
- `amount: Double` - 灰度程度（0.0-1.0）

```swift
Image("photo")
    .grayscale(0.5)   // 50% 灰度

Image("photo")
    .grayscale(1.0)   // 完全灰度
```

### `.hueRotation(_:)`
应用色相旋转。

**参数：**
- `angle: Angle` - 旋转角度

```swift
Image("photo")
    .hueRotation(.degrees(90))   // 色相旋转90度

Image("photo")
    .hueRotation(.radians(.pi))  // 色相旋转180度
```

### `.saturation(_:)`
调整饱和度。

**参数：**
- `amount: Double` - 饱和度倍数

```swift
Image("photo")
    .saturation(0.0)    // 无饱和度（灰度）
    .saturation(1.0)    // 正常饱和度
    .saturation(2.0)    // 高饱和度
```

### `.brightness(_:)`
调整亮度。

**参数：**
- `amount: Double` - 亮度调整量（-1.0 到 1.0）

```swift
Image("photo")
    .brightness(-0.2)   // 降低亮度
    .brightness(0.3)    // 提高亮度
```

### `.contrast(_:)`
调整对比度。

**参数：**
- `amount: Double` - 对比度倍数

```swift
Image("photo")
    .contrast(0.5)    // 低对比度
    .contrast(1.5)    // 高对比度
```

---

## 裁剪与形状修饰符

### `.clipped(antialiased:)`
裁剪超出边界的内容。

**参数：**
- `antialiased: Bool` - 是否启用抗锯齿

```swift
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 200)
    .clipped()  // 裁剪超出的部分
```

### `.clipShape(_:style:)`
使用形状裁剪图片。

**参数：**
- `shape: Shape` - 裁剪形状
- `style: FillStyle` - 填充样式

```swift
// 圆形裁剪
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 200)
    .clipShape(Circle())

// 圆角矩形裁剪
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 150)
    .clipShape(RoundedRectangle(cornerRadius: 20))

// 自定义形状裁剪
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 200)
    .clipShape(
        Path { path in
            path.move(to: CGPoint(x: 100, y: 0))
            path.addLine(to: CGPoint(x: 200, y: 100))
            path.addLine(to: CGPoint(x: 100, y: 200))
            path.addLine(to: CGPoint(x: 0, y: 100))
            path.closeSubpath()
        }
    )
```

### `.cornerRadius(_:antialiased:)`
设置圆角。

**参数：**
- `radius: CGFloat` - 圆角半径
- `antialiased: Bool` - 是否启用抗锯齿

```swift
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 150)
    .cornerRadius(15)

Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 150)
    .cornerRadius(25, antialiased: true)
```

### `.mask(_:)`
使用另一个视图作为遮罩。

**参数：**
- `mask: View` - 遮罩视图

```swift
// 文字遮罩
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 300, height: 200)
    .mask(
        Text("MASK")
            .font(.system(size: 72, weight: .bold))
    )

// 形状遮罩
Image("photo")
    .resizable()
    .scaledToFill()
    .frame(width: 200, height: 200)
    .mask(
        Star()  // 自定义星形
            .frame(width: 150, height: 150)
    )
```

---

## 布局相关修饰符

### `.frame(width:height:alignment:)`
设置图片框架。

**参数：**
- `width: CGFloat?` - 宽度
- `height: CGFloat?` - 高度
- `alignment: Alignment` - 对齐方式

```swift
// 固定尺寸
Image("photo")
    .resizable()
    .frame(width: 200, height: 150)

// 只设置宽度
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fit)
    .frame(width: 300)

// 带对齐方式
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 200, height: 100, alignment: .top)
    .clipped()
```

### `.frame(minWidth:idealWidth:maxWidth:minHeight:idealHeight:maxHeight:alignment:)`
设置灵活的框架约束。

```swift
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fit)
    .frame(
        minWidth: 100,
        idealWidth: 200,
        maxWidth: 300,
        minHeight: 75,
        idealHeight: 150,
        maxHeight: 225
    )
```

### `.layoutPriority(_:)`
设置布局优先级。

**参数：**
- `value: Double` - 优先级值

```swift
HStack {
    Image("photo1")
        .resizable()
        .aspectRatio(contentMode: .fit)
        .layoutPriority(1)  // 高优先级
    
    Image("photo2")
        .resizable()
        .aspectRatio(contentMode: .fit)
        .layoutPriority(0)  // 低优先级
}
```

### `.position(x:y:)`
设置绝对位置。

**参数：**
- `x: CGFloat` - X 坐标
- `y: CGFloat` - Y 坐标

```swift
ZStack {
    Rectangle()
        .fill(Color.gray.opacity(0.3))
        .frame(width: 300, height: 200)
    
    Image("icon")
        .resizable()
        .frame(width: 50, height: 50)
        .position(x: 250, y: 50)  // 绝对定位
}
```

### `.offset(x:y:)`
设置偏移量。

**参数：**
- `x: CGFloat` - X 轴偏移
- `y: CGFloat` - Y 轴偏移

```swift
Image("photo")
    .resizable()
    .frame(width: 200, height: 150)
    .offset(x: 20, y: -10)  // 向右向上偏移
```

---

## 可访问性修饰符

### `.accessibilityLabel(_:)`
设置可访问性标签。

**参数：**
- `label: Text` - 标签文本

```swift
Image("user-avatar")
    .resizable()
    .frame(width: 60, height: 60)
    .clipShape(Circle())
    .accessibilityLabel("用户头像")

Image(systemName: "heart.fill")
    .foregroundColor(.red)
    .accessibilityLabel("喜欢")
```

### `.accessibilityValue(_:)`
设置可访问性值。

**参数：**
- `value: Text` - 值描述

```swift
Image(systemName: "star.fill")
    .foregroundColor(.yellow)
    .accessibilityLabel("评分")
    .accessibilityValue("五星")
```

### `.accessibilityHint(_:)`
设置可访问性提示。

**参数：**
- `hint: Text` - 提示信息

```swift
Image(systemName: "plus")
    .accessibilityLabel("添加")
    .accessibilityHint("双击以添加新项目")
```

### `.accessibilityHidden(_:)`
设置是否对可访问性隐藏。

**参数：**
- `hidden: Bool` - 是否隐藏

```swift
// 装饰性图片
Image("background-pattern")
    .accessibilityHidden(true)

// 重要功能图片
Image(systemName: "settings")
    .accessibilityHidden(false)
```

### `.accessibilityAddTraits(_:)`
添加可访问性特征。

**参数：**
- `traits: AccessibilityTraits` - 特征集合

```swift
Image(systemName: "play.fill")
    .accessibilityLabel("播放")
    .accessibilityAddTraits(.isButton)

Image("logo")
    .accessibilityLabel("公司标志")
    .accessibilityAddTraits(.isImage)
```

---

## 符号图像修饰符

### `.symbolRenderingMode(_:)` (iOS 15+)
设置 SF Symbol 渲染模式。

**参数：**
- `mode: SymbolRenderingMode` - 渲染模式

**渲染模式：**
- `.monochrome` - 单色模式
- `.multicolor` - 多色模式
- `.hierarchical` - 层次模式
- `.palette` - 调色板模式

```swift
// 单色模式
Image(systemName: "heart.fill")
    .symbolRenderingMode(.monochrome)
    .foregroundColor(.red)

// 多色模式（使用 SF Symbol 的原始颜色）
Image(systemName: "rainbow")
    .symbolRenderingMode(.multicolor)

// 层次模式（不同透明度）
Image(systemName: "square.stack.3d.up.fill")
    .symbolRenderingMode(.hierarchical)
    .foregroundColor(.blue)

// 调色板模式（自定义多色）
Image(systemName: "person.3.fill")
    .symbolRenderingMode(.palette)
    .foregroundStyle(.blue, .green, .red)
```

### `.symbolVariant(_:)` (iOS 15+)
设置符号变体。

**参数：**
- `variant: SymbolVariants` - 符号变体

**变体选项：**
- `.none` - 无变体
- `.fill` - 填充变体
- `.circle` - 圆形变体
- `.square` - 方形变体
- `.rectangle` - 矩形变体
- `.slash` - 斜线变体

```swift
// 基础符号
Image(systemName: "heart")
    .symbolVariant(.none)

// 填充变体
Image(systemName: "heart")
    .symbolVariant(.fill)

// 圆形变体
Image(systemName: "heart")
    .symbolVariant(.circle)

// 组合变体
Image(systemName: "heart")
    .symbolVariant(.fill.circle)
```

### `.font(_:)`
设置 SF Symbol 字体大小。

**参数：**
- `font: Font?` - 字体

```swift
// 系统字体大小
Image(systemName: "star")
    .font(.title)

Image(systemName: "heart")
    .font(.largeTitle)

// 自定义大小
Image(systemName: "gear")
    .font(.system(size: 24))

// 自定义权重
Image(systemName: "bolt")
    .font(.system(size: 30, weight: .bold))
```

### `.imageScale(_:)`
设置图像缩放级别。

**参数：**
- `scale: Image.Scale` - 缩放级别

**缩放级别：**
- `.small` - 小尺寸
- `.medium` - 中等尺寸（默认）
- `.large` - 大尺寸

```swift
HStack {
    Image(systemName: "star")
        .imageScale(.small)
    
    Image(systemName: "star")
        .imageScale(.medium)
    
    Image(systemName: "star")
        .imageScale(.large)
}
```

---

## 动画相关修饰符

### `.animation(_:value:)`
为图片变化添加动画。

**参数：**
- `animation: Animation?` - 动画类型
- `value: V` - 监视的值

```swift
@State private var isRotated = false

Image(systemName: "arrow.clockwise")
    .font(.title)
    .rotationEffect(.degrees(isRotated ? 360 : 0))
    .animation(.easeInOut(duration: 1), value: isRotated)
    .onTapGesture {
        isRotated.toggle()
    }
```

### `.transition(_:)`
设置图片出现/消失的转换动画。

**参数：**
- `t: AnyTransition` - 转换动画

```swift
@State private var showImage = false

VStack {
    if showImage {
        Image("photo")
            .resizable()
            .frame(width: 200, height: 150)
            .transition(.scale.combined(with: .opacity))
    }
    
    Button("切换图片") {
        withAnimation(.easeInOut) {
            showImage.toggle()
        }
    }
}
```

### `.rotationEffect(_:anchor:)`
设置旋转效果。

**参数：**
- `angle: Angle` - 旋转角度
- `anchor: UnitPoint` - 旋转锚点

```swift
Image(systemName: "arrow.up")
    .font(.title)
    .rotationEffect(.degrees(45))

Image("photo")
    .resizable()
    .frame(width: 200, height: 150)
    .rotationEffect(.degrees(-15), anchor: .topLeading)
```

### `.rotation3DEffect(_:axis:anchor:anchorZ:perspective:)`
设置 3D 旋转效果。

**参数：**
- `angle: Angle` - 旋转角度
- `axis: (x: CGFloat, y: CGFloat, z: CGFloat)` - 旋转轴
- `anchor: UnitPoint` - 锚点
- `anchorZ: CGFloat` - Z 轴锚点
- `perspective: CGFloat` - 透视值

```swift
Image("photo")
    .resizable()
    .frame(width: 200, height: 150)
    .rotation3DEffect(
        .degrees(45),
        axis: (x: 1, y: 0, z: 0)
    )

Image("card")
    .resizable()
    .frame(width: 150, height: 200)
    .rotation3DEffect(
        .degrees(30),
        axis: (x: 0, y: 1, z: 0),
        perspective: 0.5
    )
```

---

## 环境与系统修饰符

### `.environment(_:_:)`
设置环境值。

```swift
Image(systemName: "star")
    .environment(\.colorScheme, .dark)

Image("photo")
    .environment(\.layoutDirection, .rightToLeft)
```

### `.colorScheme(_:)`
设置颜色方案。

**参数：**
- `colorScheme: ColorScheme` - 颜色方案

```swift
Image(systemName: "moon")
    .colorScheme(.dark)

Image(systemName: "sun.max")
    .colorScheme(.light)
```

### `.redacted(reason:)`
设置编辑状态。

**参数：**
- `reason: RedactionReasons` - 编辑原因

```swift
Image("user-photo")
    .resizable()
    .frame(width: 60, height: 60)
    .clipShape(Circle())
    .redacted(reason: .privacy)  // 隐私模糊

Image("loading-placeholder")
    .redacted(reason: .placeholder)  // 占位符模糊
```

### `.allowsHitTesting(_:)`
设置是否允许点击测试。

**参数：**
- `enabled: Bool` - 是否启用

```swift
ZStack {
    Image("background")
        .resizable()
        .scaledToFill()
        .allowsHitTesting(false)  // 不接收点击事件
    
    VStack {
        Text("内容")
        Button("按钮") {
            // 按钮可以正常点击
        }
    }
}
```

---

## 综合应用示例

### 头像组件
```swift
struct AvatarView: View {
    let imageName: String
    let size: CGFloat
    let isOnline: Bool
    
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            // 主头像
            Image(imageName)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: size, height: size)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 2)
                )
                .shadow(radius: 4)
                .accessibilityLabel("用户头像")
            
            // 在线状态指示器
            if isOnline {
                Circle()
                    .fill(Color.green)
                    .frame(width: size * 0.25, height: size * 0.25)
                    .overlay(
                        Circle()
                            .stroke(Color.white, lineWidth: 2)
                    )
                    .offset(x: -size * 0.05, y: -size * 0.05)
                    .accessibilityLabel("在线状态")
            }
        }
    }
}

// 使用示例
AvatarView(imageName: "user1", size: 80, isOnline: true)
```

### 图片查看器
```swift
struct ImageViewer: View {
    let imageName: String
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var isZoomed = false
    
    var body: some View {
        GeometryReader { geometry in
            Image(imageName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .scaleEffect(scale)
                .offset(offset)
                .clipped()
                .animation(.easeInOut(duration: 0.3), value: scale)
                .animation(.easeInOut(duration: 0.3), value: offset)
                .gesture(
                    SimultaneousGesture(
                        // 缩放手势
                        MagnificationGesture()
                            .onChanged { value in
                                scale = value
                            }
                            .onEnded { value in
                                if scale < 1.0 {
                                    scale = 1.0
                                    offset = .zero
                                } else if scale > 3.0 {
                                    scale = 3.0
                                }
                                isZoomed = scale > 1.0
                            },
                        
                        // 拖动手势
                        DragGesture()
                            .onChanged { value in
                                if isZoomed {
                                    offset = value.translation
                                }
                            }
                            .onEnded { _ in
                                if !isZoomed {
                                    offset = .zero
                                }
                            }
                    )
                )
                .onTapGesture(count: 2) {
                    // 双击缩放
                    if scale == 1.0 {
                        scale = 2.0
                        isZoomed = true
                    } else {
                        scale = 1.0
                        offset = .zero
                        isZoomed = false
                    }
                }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
    }
}
```

### 图片轮播组件
```swift
struct ImageCarousel: View {
    let images: [String]
    @State private var currentIndex = 0
    @State private var dragOffset: CGSize = .zero
    
    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 0) {
                ForEach(0..<images.count, id: \.self) { index in
                    Image(images[index])
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width)
                        .clipped()
                        .accessibilityLabel("图片 \(index + 1) / \(images.count)")
                }
            }
            .offset(x: -CGFloat(currentIndex) * geometry.size.width + dragOffset.width)
            .animation(.easeInOut(duration: 0.3), value: currentIndex)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        dragOffset = value.translation
                    }
                    .onEnded { value in
                        let threshold = geometry.size.width * 0.3
                        
                        if value.translation.width > threshold && currentIndex > 0 {
                            currentIndex -= 1
                        } else if value.translation.width < -threshold && currentIndex < images.count - 1 {
                            currentIndex += 1
                        }
                        
                        dragOffset = .zero
                    }
            )
            
            // 页面指示器
            VStack {
                Spacer()
                HStack {
                    ForEach(0..<images.count, id: \.self) { index in
                        Circle()
                            .fill(currentIndex == index ? Color.white : Color.gray)
                            .frame(width: 8, height: 8)
                            .animation(.easeInOut(duration: 0.2), value: currentIndex)
                    }
                }
                .padding(.bottom, 20)
            }
        }
        .clipped()
    }
}

// 使用示例
ImageCarousel(images: ["photo1", "photo2", "photo3", "photo4"])
    .frame(height: 250)
```

### 图标按钮组件
```swift
struct IconButton: View {
    let systemName: String
    let title: String
    let action: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: systemName)
                    .font(.title2)
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(.blue)
                    .scaleEffect(isPressed ? 0.9 : 1.0)
                    .animation(.easeInOut(duration: 0.1), value: isPressed)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.1))
                    .scaleEffect(isPressed ? 0.95 : 1.0)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) { pressing in
            isPressed = pressing
        } perform: {}
        .accessibilityLabel(title)
        .accessibilityAddTraits(.isButton)
    }
}

// 使用示例
HStack {
    IconButton(systemName: "heart", title: "喜欢") {
        print("点击喜欢")
    }
    
    IconButton(systemName: "square.and.arrow.up", title: "分享") {
        print("点击分享")
    }
    
    IconButton(systemName: "bookmark", title: "收藏") {
        print("点击收藏")
    }
}
```

### 加载状态图片
```swift
struct AsyncImageView: View {
    let url: URL?
    let placeholder: String
    @State private var image: Image?
    @State private var isLoading = true
    @State private var loadFailed = false
    
    var body: some View {
        Group {
            if let image = image {
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .transition(.opacity.combined(with: .scale))
            } else if isLoading {
                // 加载中状态
                ZStack {
                    Color.gray.opacity(0.2)
                    
                    VStack {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("加载中...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .redacted(reason: .placeholder)
            } else if loadFailed {
                // 加载失败状态
                ZStack {
                    Color.gray.opacity(0.1)
                    
                    VStack {
                        Image(systemName: "photo")
                            .font(.title)
                            .foregroundColor(.gray)
                        Text("加载失败")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                // 占位符
                Image(placeholder)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .grayscale(1.0)
                    .opacity(0.5)
            }
        }
        .onAppear {
            loadImage()
        }
        .accessibilityLabel(loadFailed ? "图片加载失败" : "图片")
    }
    
    private func loadImage() {
        guard let url = url else {
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            DispatchQueue.main.async {
                isLoading = false
                
                if let data = data, let uiImage = UIImage(data: data) {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        image = Image(uiImage: uiImage)
                    }
                } else {
                    loadFailed = true
                }
            }
        }.resume()
    }
}

// 使用示例
AsyncImageView(
    url: URL(string: "https://example.com/image.jpg"),
    placeholder: "default-image"
)
.frame(width: 200, height: 150)
.clipShape(RoundedRectangle(cornerRadius: 12))
```

### 图片滤镜效果展示
```swift
struct FilterEffectsDemo: View {
    let imageName = "demo-photo"
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 20) {
                
                // 原图
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    
                    Text("原图")
                        .font(.caption)
                }
                
                // 灰度效果
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .grayscale(1.0)
                    
                    Text("灰度")
                        .font(.caption)
                }
                
                // 色彩反转
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .colorInvert()
                    
                    Text("反色")
                        .font(.caption)
                }
                
                // 高饱和度
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .saturation(2.0)
                    
                    Text("高饱和度")
                        .font(.caption)
                }
                
                // 高对比度
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .contrast(1.5)
                    
                    Text("高对比度")
                        .font(.caption)
                }
                
                // 色相旋转
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .hueRotation(.degrees(120))
                    
                    Text("色相旋转")
                        .font(.caption)
                }
                
                // 颜色叠加
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .colorMultiply(.blue)
                    
                    Text("蓝色叠加")
                        .font(.caption)
                }
                
                // 组合效果
                VStack {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 150, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .saturation(1.5)
                        .contrast(1.2)
                        .brightness(0.1)
                    
                    Text("组合效果")
                        .font(.caption)
                }
            }
            .padding()
        }
        .navigationTitle("滤镜效果")
    }
}
```

### SF Symbol 展示组件
```swift
struct SymbolShowcase: View {
    let symbols = [
        ("heart", "喜欢"),
        ("star", "收藏"),
        ("share", "分享"),
        ("message", "消息"),
        ("phone", "电话"),
        ("video", "视频"),
        ("camera", "相机"),
        ("photo", "照片")
    ]
    
    @State private var selectedRenderingMode: SymbolRenderingMode = .monochrome
    @State private var selectedVariant: SymbolVariants = .none
    
    var renderingModes: [(SymbolRenderingMode, String)] = [
        (.monochrome, "单色"),
        (.multicolor, "多色"),
        (.hierarchical, "层次"),
        (.palette, "调色板")
    ]
    
    var variants: [(SymbolVariants, String)] = [
        (.none, "默认"),
        (.fill, "填充"),
        (.circle, "圆形"),
        (.square, "方形")
    ]
    
    var body: some View {
        VStack(spacing: 20) {
            // 渲染模式选择
            VStack(alignment: .leading) {
                Text("渲染模式")
                    .font(.headline)
                
                Picker("渲染模式", selection: $selectedRenderingMode) {
                    ForEach(renderingModes, id: \.0) { mode, name in
                        Text(name).tag(mode)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
            }
            
            // 符号变体选择
            VStack(alignment: .leading) {
                Text("符号变体")
                    .font(.headline)
                
                Picker("符号变体", selection: $selectedVariant) {
                    ForEach(variants, id: \.0) { variant, name in
                        Text(name).tag(variant)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
            }
            
            // 符号展示
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 20) {
                ForEach(symbols, id: \.0) { symbol, name in
                    VStack {
                        Image(systemName: symbol)
                            .font(.title)
                            .symbolRenderingMode(selectedRenderingMode)
                            .symbolVariant(selectedVariant)
                            .foregroundStyle(.blue, .green, .red)  // 调色板模式使用
                            .frame(height: 40)
                        
                        Text(name)
                            .font(.caption)
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.gray.opacity(0.1))
                    )
                }
            }
            
            Spacer()
        }
        .padding()
        .animation(.easeInOut(duration: 0.3), value: selectedRenderingMode)
        .animation(.easeInOut(duration: 0.3), value: selectedVariant)
    }
}
```

---

## 性能优化建议

### 1. 图片资源优化
```swift
// ❌ 不推荐：使用过大的原始图片
Image("large-photo-4k")  // 4K 图片用于小尺寸显示
    .resizable()
    .frame(width: 100, height: 100)

// ✅ 推荐：使用适当尺寸的图片
Image("optimized-photo-200x200")  // 针对显示尺寸优化的图片
    .resizable()
    .frame(width: 100, height: 100)

// ✅ 推荐：使用 @1x, @2x, @3x 资源
Image("icon")  // 系统会自动选择合适的分辨率
    .resizable()
    .frame(width: 50, height: 50)
```

### 2. 避免过度使用修饰符
```swift
// ❌ 性能较差：过多修饰符链
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 200, height: 200)
    .clipShape(Circle())
    .overlay(Circle().stroke(Color.white, lineWidth: 2))
    .shadow(radius: 4)
    .scaleEffect(1.1)
    .rotationEffect(.degrees(5))
    .opacity(0.9)
    .blur(radius: 0.5)

// ✅ 性能更好：合理使用修饰符
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 200, height: 200)
    .clipShape(Circle())
    .shadow(radius: 4)
```

### 3. 合理使用图片缓存
```swift
// 图片缓存管理器
class ImageCache {
    static let shared = ImageCache()
    private var cache = NSCache<NSString, UIImage>()
    
    private init() {
        cache.countLimit = 100  // 限制缓存数量
        cache.totalCostLimit = 50 * 1024 * 1024  // 限制缓存大小为50MB
    }
    
    func image(for key: String) -> UIImage? {
        return cache.object(forKey: NSString(string: key))
    }
    
    func setImage(_ image: UIImage, for key: String) {
        cache.setObject(image, forKey: NSString(string: key))
    }
}

// 缓存图片组件
struct CachedAsyncImage: View {
    let url: URL
    let key: String
    @State private var image: Image?
    
    var body: some View {
        Group {
            if let image = image {
                image
                    .resizable()
            } else {
                ProgressView()
                    .onAppear {
                        loadImage()
                    }
            }
        }
    }
    
    private func loadImage() {
        // 先检查缓存
        if let cachedImage = ImageCache.shared.image(for: key) {
            image = Image(uiImage: cachedImage)
            return
        }
        
        // 网络加载
        URLSession.shared.dataTask(with: url) { data, _, _ in
            if let data = data, let uiImage = UIImage(data: data) {
                // 缓存图片
                ImageCache.shared.setImage(uiImage, for: key)
                
                DispatchQueue.main.async {
                    image = Image(uiImage: uiImage)
                }
            }
        }.resume()
    }
}
```

### 4. LazyVGrid 中的图片优化
```swift
struct OptimizedImageGrid: View {
    let images: [String]
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 10) {
                ForEach(images, id: \.self) { imageName in
                    // 使用 LazyVGrid 实现懒加载
                    Image(imageName)
                        .resizable()
                        .aspectRatio(1, contentMode: .fill)
                        .frame(maxWidth: .infinity, maxHeight: 120)
                        .clipped()
                        .onAppear {
                            // 图片出现时才开始处理
                            print("Image \(imageName) appeared")
                        }
                        .onDisappear {
                            // 图片消失时可以释放资源
                            print("Image \(imageName) disappeared")
                        }
                }
            }
            .padding()
        }
    }
}
```

---

## 常见问题解答

### Q: 如何让图片保持宽高比？
```swift
// 方法1: 使用 aspectRatio
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fit)  // 保持比例，适应容器
    .frame(maxWidth: 200, maxHeight: 200)

// 方法2: 使用 scaledToFit/scaledToFill
Image("photo")
    .resizable()
    .scaledToFit()  // 等同于 aspectRatio(contentMode: .fit)
    .frame(width: 200, height: 200)
```

### Q: 如何创建圆形头像？
```swift
Image("avatar")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 80, height: 80)
    .clipShape(Circle())
    .overlay(Circle().stroke(Color.white, lineWidth: 2))
    .shadow(radius: 4)
```

### Q: 如何处理不同屏幕密度的图片？
```swift
// 在 Assets.xcassets 中提供不同分辨率的图片：
// icon.png (1x)
// icon@2x.png (2x)  
// icon@3x.png (3x)

// SwiftUI 会自动选择合适的分辨率
Image("icon")
    .resizable()
    .frame(width: 50, height: 50)
```

### Q: 如何给 SF Symbol 添加自定义颜色？
```swift
// 单色
Image(systemName: "heart.fill")
    .foregroundColor(.red)

// 渐变色
Image(systemName: "star.fill")
    .font(.largeTitle)
    .foregroundStyle(
        LinearGradient(
            colors: [.yellow, .orange],
            startPoint: .top,
            endPoint: .bottom
        )
    )

// 多色模式（使用 SF Symbol 原始颜色）
Image(systemName: "rainbow")
    .symbolRenderingMode(.multicolor)
    .font(.largeTitle)
```

### Q: 如何实现图片的淡入动画？
```swift
@State private var showImage = false

Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fit)
    .frame(width: 200, height: 200)
    .opacity(showImage ? 1.0 : 0.0)
    .animation(.easeInOut(duration: 1.0), value: showImage)
    .onAppear {
        showImage = true
    }
```

### Q: 如何处理网络图片加载？
```swift
// iOS 15+ 可以使用 AsyncImage
AsyncImage(url: URL(string: "https://example.com/image.jpg")) { image in
    image
        .resizable()
        .aspectRatio(contentMode: .fill)
} placeholder: {
    ProgressView()
}
.frame(width: 200, height: 200)
.clipShape(RoundedRectangle(cornerRadius: 12))

// 自定义网络图片加载（见上面的 AsyncImageView 示例）
```

---

## 总结

SwiftUI 的 Image 组件提供了强大而灵活的图片显示和处理能力。通过合理使用各种修饰符，可以创建出专业、美观且性能优良的图片界面。

### 关键要点：

1. **初始化方式** - 支持本地图片、SF Symbols、UIImage 等多种源
2. **修饰符分类** - 8大类修饰符覆盖所有图片自定义需求
3. **缩放与布局** - 灵活的尺寸控制和布局选项
4. **颜色与滤镜** - 丰富的颜色处理和视觉效果
5. **SF Symbols** - 专门的符号图像处理能力
6. **性能优化** - 合理的资源管理和缓存策略
7. **可访问性** - 为所有用户提供良好的体验

掌握这些知识将帮助你创建出专业级的 iOS 应用图片界面！