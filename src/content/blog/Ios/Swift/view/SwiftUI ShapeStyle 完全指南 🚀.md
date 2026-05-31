---
title: "SwiftUI ShapeStyle 完全指南 🚀"
description: "ShapeStyle 是 SwiftUI 中用于填充形状、文本、边框等的协议。它定义了如何绘制视图的外观，包括颜色、渐变、材质等多种样式。"
pubDate: 2026-05-29
category: "view"
tags: [Mac, iOS, Environment, Swift]
draft: false
---
# SwiftUI ShapeStyle 完全指南 🚀

## 概述

`ShapeStyle` 是 SwiftUI 中用于填充形状、文本、边框等的协议。它定义了如何绘制视图的外观，包括颜色、渐变、材质等多种样式。

```swift
protocol ShapeStyle {
    // 协议定义
}
```

---

## 一、基础 ShapeStyle 类型

### 1. Color（颜色）

最常用的 ShapeStyle，表示纯色。

```swift
struct ColorExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 系统预定义颜色
            Text("红色").foregroundStyle(Color.red)
            Text("蓝色").foregroundStyle(Color.blue)
            Text("绿色").foregroundStyle(Color.green)
            
            // RGB 颜色
            Text("自定义RGB")
                .foregroundStyle(Color(red: 0.5, green: 0.2, blue: 0.8))
            
            // 十六进制颜色
            Text("十六进制")
                .foregroundStyle(Color(hex: "#FF6B6B"))
            
            // 不透明度
            Text("半透明")
                .foregroundStyle(Color.blue.opacity(0.5))
            
            // 动态颜色（适配深色模式）
            Rectangle()
                .fill(Color.primary)
                .frame(height: 50)
            
            Rectangle()
                .fill(Color.secondary)
                .frame(height: 50)
        }
        .padding()
    }
}

// 十六进制颜色扩展
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
```

**系统颜色列表:**
```swift
// 基础颜色
.red, .orange, .yellow, .green, .mint, .teal, .cyan, .blue, .indigo, .purple, .pink, .brown

// UI 颜色
.primary      // 主要文本颜色（黑/白自动适配）
.secondary    // 次要文本颜色
.tertiary     // 第三级文本颜色
.quaternary   // 第四级文本颜色

// 背景颜色
.clear        // 透明
.black        // 黑色
.white        // 白色
.gray         // 灰色

// 语义颜色（iOS 15+）
.accentColor  // 强调色
```

---

### 2. LinearGradient（线性渐变）

沿直线方向的渐变。

```swift
struct LinearGradientExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基础线性渐变
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [.red, .blue],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 100)
            
            // 多色渐变
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [.red, .orange, .yellow, .green, .blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 100)
            
            // 使用 Gradient 对象
            Rectangle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [.pink, .purple]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(height: 100)
            
            // 使用渐变停止点
            Rectangle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(stops: [
                            .init(color: .red, location: 0.0),
                            .init(color: .yellow, location: 0.3),
                            .init(color: .green, location: 0.7),
                            .init(color: .blue, location: 1.0)
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 100)
        }
        .padding()
    }
}
```

**UnitPoint 预定义值:**
```swift
.zero           // (0, 0)
.center         // (0.5, 0.5)
.leading        // (0, 0.5)
.trailing       // (1, 0.5)
.top            // (0.5, 0)
.bottom         // (0.5, 1)
.topLeading     // (0, 0)
.topTrailing    // (1, 0)
.bottomLeading  // (0, 1)
.bottomTrailing // (1, 1)
```

---

### 3. RadialGradient（径向渐变）

从中心点向外辐射的渐变。

```swift
struct RadialGradientExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基础径向渐变
            Circle()
                .fill(
                    RadialGradient(
                        colors: [.yellow, .orange, .red],
                        center: .center,
                        startRadius: 0,
                        endRadius: 100
                    )
                )
                .frame(width: 200, height: 200)
            
            // 偏移中心
            Circle()
                .fill(
                    RadialGradient(
                        colors: [.white, .blue],
                        center: UnitPoint(x: 0.3, y: 0.3),
                        startRadius: 10,
                        endRadius: 100
                    )
                )
                .frame(width: 200, height: 200)
            
            // 使用 Gradient
            Rectangle()
                .fill(
                    RadialGradient(
                        gradient: Gradient(colors: [.pink, .purple, .blue]),
                        center: .center,
                        startRadius: 0,
                        endRadius: 150
                    )
                )
                .frame(height: 200)
        }
        .padding()
    }
}
```

---

### 4. AngularGradient（角度渐变）

围绕中心点旋转的渐变（也称圆锥渐变）。

```swift
struct AngularGradientExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基础角度渐变
            Circle()
                .fill(
                    AngularGradient(
                        colors: [.red, .yellow, .green, .blue, .purple, .red],
                        center: .center
                    )
                )
                .frame(width: 200, height: 200)
            
            // 指定起始角度
            Circle()
                .fill(
                    AngularGradient(
                        colors: [.red, .orange, .yellow],
                        center: .center,
                        startAngle: .degrees(0),
                        endAngle: .degrees(360)
                    )
                )
                .frame(width: 200, height: 200)
            
            // 彩虹色环
            Circle()
                .fill(
                    AngularGradient(
                        gradient: Gradient(colors: [
                            .red, .orange, .yellow, .green,
                            .cyan, .blue, .purple, .pink, .red
                        ]),
                        center: .center,
                        angle: .degrees(0)
                    )
                )
                .frame(width: 200, height: 200)
            
            // 偏移中心的角度渐变
            Rectangle()
                .fill(
                    AngularGradient(
                        colors: [.blue, .purple, .pink, .blue],
                        center: UnitPoint(x: 0.3, y: 0.7)
                    )
                )
                .frame(height: 200)
        }
        .padding()
    }
}
```

---

### 5. EllipticalGradient（椭圆渐变）iOS 15+

椭圆形的径向渐变。

```swift
struct EllipticalGradientExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基础椭圆渐变
            Rectangle()
                .fill(
                    EllipticalGradient(
                        colors: [.yellow, .orange, .red],
                        center: .center
                    )
                )
                .frame(height: 200)
            
            // 自定义中心和半径
            Rectangle()
                .fill(
                    EllipticalGradient(
                        colors: [.white, .blue, .purple],
                        center: UnitPoint(x: 0.3, y: 0.3),
                        startRadiusFraction: 0,
                        endRadiusFraction: 0.5
                    )
                )
                .frame(height: 200)
        }
        .padding()
    }
}
```

---

## 二、材质 ShapeStyle（iOS 15+）

材质提供了毛玻璃效果，会模糊背景内容。

### Material 类型

```swift
struct MaterialExample: View {
    var body: some View {
        ZStack {
            // 背景图片
            Image(systemName: "photo.fill")
                .resizable()
                .scaledToFill()
                .frame(width: 400, height: 600)
                .clipped()
            
            VStack(spacing: 20) {
                // ultraThinMaterial - 超薄
                Text("Ultra Thin")
                    .padding()
                    .background(.ultraThinMaterial)
                    .cornerRadius(10)
                
                // thinMaterial - 薄
                Text("Thin")
                    .padding()
                    .background(.thinMaterial)
                    .cornerRadius(10)
                
                // regularMaterial - 常规（默认）
                Text("Regular")
                    .padding()
                    .background(.regularMaterial)
                    .cornerRadius(10)
                
                // thickMaterial - 厚
                Text("Thick")
                    .padding()
                    .background(.thickMaterial)
                    .cornerRadius(10)
                
                // ultraThickMaterial - 超厚
                Text("Ultra Thick")
                    .padding()
                    .background(.ultraThickMaterial)
                    .cornerRadius(10)
            }
        }
    }
}
```

**材质类型列表:**
```swift
.ultraThinMaterial   // 最透明
.thinMaterial
.regularMaterial     // 默认
.thickMaterial
.ultraThickMaterial  // 最不透明

// 特殊材质
.bar                 // 工具栏材质
.menu               // 菜单材质（macOS）
```

---

## 三、分层 ShapeStyle（iOS 17+）

### HierarchicalShapeStyle

提供语义化的分层样式。

```swift
struct HierarchicalExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 主要层级
            Text("Primary")
                .foregroundStyle(.primary)
            
            // 次要层级
            Text("Secondary")
                .foregroundStyle(.secondary)
            
            // 第三层级
            Text("Tertiary")
                .foregroundStyle(.tertiary)
            
            // 第四层级
            Text("Quaternary")
                .foregroundStyle(.quaternary)
            
            // 在 SF Symbol 中使用
            Image(systemName: "square.stack.3d.up.fill")
                .font(.system(size: 60))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(.blue)
        }
    }
}
```

---

## 四、图像填充

### ImagePaint

使用图像作为填充样式。

```swift
struct ImagePaintExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 基础图像填充
            Circle()
                .fill(
                    ImagePaint(
                        image: Image(systemName: "star.fill"),
                        scale: 0.1
                    )
                )
                .frame(width: 200, height: 200)
            
            // 自定义源矩形
            Rectangle()
                .fill(
                    ImagePaint(
                        image: Image("pattern"),
                        sourceRect: CGRect(x: 0, y: 0, width: 1, height: 1),
                        scale: 0.2
                    )
                )
                .frame(height: 200)
        }
        .padding()
    }
}
```

---

## 五、选择 ShapeStyle（iOS 17+）

### SelectionShapeStyle

表示选中状态的样式。

```swift
struct SelectionExample: View {
    @State private var isSelected = false
    
    var body: some View {
        VStack {
            Text("选择项")
                .padding()
                .background(isSelected ? .selection : .clear)
                .cornerRadius(10)
                .onTapGesture {
                    isSelected.toggle()
                }
        }
    }
}
```

---

## 六、语义 ShapeStyle

### 背景相关

```swift
struct BackgroundStyleExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 背景样式
            Text("Background")
                .padding()
                .background(.background)
            
            // 次要背景
            Text("Secondary Background")
                .padding()
                .background(.background.secondary)
            
            // 第三级背景
            Text("Tertiary Background")
                .padding()
                .background(.background.tertiary)
        }
    }
}
```

### 前景相关

```swift
struct ForegroundStyleExample: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("Foreground")
                .foregroundStyle(.foreground)
            
            Text("Tint")
                .foregroundStyle(.tint)
            
            Text("Accent")
                .foregroundStyle(.accent)
        }
    }
}
```

### 分隔符和填充

```swift
struct SeparatorExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 分隔符样式
            Rectangle()
                .fill(.separator)
                .frame(height: 1)
            
            // 填充样式
            Rectangle()
                .fill(.fill)
                .frame(height: 50)
            
            // 次要填充
            Rectangle()
                .fill(.fill.secondary)
                .frame(height: 50)
            
            // 第三级填充
            Rectangle()
                .fill(.fill.tertiary)
                .frame(height: 50)
        }
        .padding()
    }
}
```

---

## 七、组合 ShapeStyle

### AnyShapeStyle

类型擦除的 ShapeStyle。

```swift
struct AnyShapeStyleExample: View {
    let style: AnyShapeStyle
    
    init(useGradient: Bool) {
        if useGradient {
            style = AnyShapeStyle(
                LinearGradient(colors: [.red, .blue], startPoint: .leading, endPoint: .trailing)
            )
        } else {
            style = AnyShapeStyle(Color.green)
        }
    }
    
    var body: some View {
        Rectangle()
            .fill(style)
            .frame(height: 100)
    }
}
```

### 混合 ShapeStyle（iOS 17+）

```swift
struct MixedStyleExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 颜色混合
            Rectangle()
                .fill(.red.mix(with: .blue, by: 0.5))
                .frame(height: 100)
            
            // 不透明度
            Rectangle()
                .fill(.blue.opacity(0.5))
                .frame(height: 100)
            
            // 阴影
            Rectangle()
                .fill(.red.shadow(.drop(radius: 10)))
                .frame(height: 100)
        }
        .padding()
    }
}
```

---

## 八、完整应用示例

### 示例 1: 渐变按钮组

```swift
struct GradientButtonsExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 线性渐变按钮
            Button("Linear Gradient") {}
                .buttonStyle(GradientButtonStyle(
                    gradient: LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                ))
            
            // 径向渐变按钮
            Button("Radial Gradient") {}
                .buttonStyle(GradientButtonStyle(
                    gradient: RadialGradient(
                        colors: [.pink, .orange],
                        center: .center,
                        startRadius: 0,
                        endRadius: 100
                    )
                ))
            
            // 角度渐变按钮
            Button("Angular Gradient") {}
                .buttonStyle(GradientButtonStyle(
                    gradient: AngularGradient(
                        colors: [.red, .yellow, .green, .blue, .purple, .red],
                        center: .center
                    )
                ))
        }
        .padding()
    }
}

struct GradientButtonStyle<S: ShapeStyle>: ButtonStyle {
    let gradient: S
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(maxWidth: .infinity)
            .background(gradient)
            .foregroundColor(.white)
            .cornerRadius(10)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}
```

### 示例 2: 毛玻璃卡片

```swift
struct GlassCardExample: View {
    var body: some View {
        ZStack {
            // 背景
            LinearGradient(
                colors: [.blue, .purple],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // 毛玻璃卡片
            VStack(alignment: .leading, spacing: 15) {
                HStack {
                    Image(systemName: "person.circle.fill")
                        .font(.largeTitle)
                    VStack(alignment: .leading) {
                        Text("用户名")
                            .font(.headline)
                        Text("user@example.com")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                
                Divider()
                
                Text("这是一个使用材质效果的卡片，背景会自动模糊。")
                    .font(.body)
                
                HStack {
                    Button("操作 1") {}
                        .buttonStyle(.bordered)
                    Button("操作 2") {}
                        .buttonStyle(.bordered)
                }
            }
            .padding()
            .background(.regularMaterial)
            .cornerRadius(20)
            .padding()
        }
    }
}
```

### 示例 3: 多层次文本样式

```swift
struct HierarchicalTextExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("主标题")
                .font(.largeTitle)
                .foregroundStyle(.primary)
            
            Text("副标题")
                .font(.title2)
                .foregroundStyle(.secondary)
            
            Text("正文内容，使用第三级样式")
                .font(.body)
                .foregroundStyle(.tertiary)
            
            Text("辅助信息")
                .font(.caption)
                .foregroundStyle(.quaternary)
            
            Divider()
                .background(.separator)
        }
        .padding()
    }
}
```

### 示例 4: 动态渐变背景

```swift
struct AnimatedGradientExample: View {
    @State private var animateGradient = false
    
    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [.red, .blue, .green],
                    startPoint: animateGradient ? .topLeading : .bottomLeading,
                    endPoint: animateGradient ? .bottomTrailing : .topTrailing
                )
            )
            .ignoresSafeArea()
            .onAppear {
                withAnimation(.linear(duration: 3).repeatForever(autoreverses: true)) {
                    animateGradient.toggle()
                }
            }
    }
}
```

### 示例 5: 自定义渐变色板

```swift
struct GradientPaletteExample: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ForEach(GradientPreset.allCases, id: \.self) { preset in
                    HStack {
                        Text(preset.name)
                            .font(.headline)
                            .frame(width: 120, alignment: .leading)
                        
                        Rectangle()
                            .fill(preset.gradient)
                            .frame(height: 50)
                            .cornerRadius(8)
                    }
                }
            }
            .padding()
        }
    }
}

enum GradientPreset: CaseIterable {
    case sunset, ocean, forest, fire, sky, night
    
    var name: String {
        switch self {
        case .sunset: return "日落"
        case .ocean: return "海洋"
        case .forest: return "森林"
        case .fire: return "火焰"
        case .sky: return "天空"
        case .night: return "夜晚"
        }
    }
    
    var gradient: LinearGradient {
        switch self {
        case .sunset:
            return LinearGradient(
                colors: [.orange, .pink, .purple],
                startPoint: .leading,
                endPoint: .trailing
            )
        case .ocean:
            return LinearGradient(
                colors: [.blue, .cyan, .mint],
                startPoint: .leading,
                endPoint: .trailing
            )
        case .forest:
            return LinearGradient(
                colors: [.green, .mint, .teal],
                startPoint: .leading,
                endPoint: .trailing
            )
        case .fire:
            return LinearGradient(
                colors: [.red, .orange, .yellow],
                startPoint: .leading,
                endPoint: .trailing
            )
        case .sky:
            return LinearGradient(
                colors: [.blue, .cyan, .white],
                startPoint: .top,
                endPoint: .bottom
            )
        case .night:
            return LinearGradient(
                colors: [.black, .purple, .indigo],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }
}
```

---

## 九、ShapeStyle 修饰符（iOS 17+）

### 颜色调整

```swift
struct ColorAdjustmentExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 不透明度
            Rectangle()
                .fill(.blue.opacity(0.5))
                .frame(height: 100)
            
            // 混合颜色
            Rectangle()
                .fill(.red.mix(with: .blue, by: 0.5))
                .frame(height: 100)
            
            // 阴影
            Text("带阴影的文本")
                .font(.largeTitle)
                .foregroundStyle(
                    .blue.shadow(.drop(color: .black.opacity(0.3), radius: 2, y: 2))
                )
        }
        .padding()
    }
}
```

---

## 十、实用扩展和技巧

### 自定义 ShapeStyle

```swift
struct CustomGradientStyle: ShapeStyle {
    func resolve(in environment: EnvironmentValues) -> some ShapeStyle {
        LinearGradient(
            colors: [.red, .orange, .yellow],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

extension ShapeStyle where Self == CustomGradientStyle {
    static var customGradient: CustomGradientStyle {
        CustomGradientStyle()
    }
}

// 使用
Text("Custom Style")
    .foregroundStyle(.customGradient)
```

### 颜色工具扩展

```swift
extension Color {
    // 从 UIColor 获取 RGB 值
    var components: (red: Double, green: Double, blue: Double, opacity: Double) {
        #if canImport(UIKit)
        typealias NativeColor = UIColor
        #elseif canImport(AppKit)
        typealias NativeColor = NSColor
        #endif
        
        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0
        var o: CGFloat = 0
        
        guard NativeColor(self).getRed(&r, green: &g, blue: &b, alpha: &o) else {
            return (0, 0, 0, 0)
        }
        
        return (Double(r), Double(g), Double(b), Double(o))
    }
    
    // 调整亮度
    func adjustBrightness(_ amount: Double) -> Color {
        let components = self.components
        return Color(
            red: min(max(components.red + amount, 0), 1),
            green: min(max(components.green + amount, 0), 1),
            blue: min(max(components.blue + amount, 0), 1),
            opacity: components.opacity
        )
    }
    
    // 调整饱和度
    func adjustSaturation(_ amount: Double) -> Color {
        #if canImport(UIKit)
        return Color(uiColor: UIColor(self).adjust(saturation: amount))
        #else
        return self
        #endif
    }
}

#if canImport(UIKit)
extension UIColor {
    func adjust(saturation: Double) -> UIColor {
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        getHue(&h, saturation: &s, brightness: &b, alpha: &a)
        return UIColor(hue: h, saturation: min(max(s + saturation, 0), 1), brightness: b, alpha: a)
    }
}
#endif
```

---

## 十一、ShapeStyle 对比表格

| ShapeStyle 类型 | 用途 | 性能 | 适用场景 | iOS版本 |
|----------------|------|------|---------|---------|
| Color | 纯色填充 | 最优 | 所有场景 | iOS 13+ |
| LinearGradient | 线性渐变 | 良好 | 背景、按钮 | iOS 13+ |
| RadialGradient | 径向渐变 | 良好 | 圆形、光效 | iOS 13+ |
| AngularGradient | 角度渐变 | 良好 | 进度环、色轮 | iOS 13+ |
| EllipticalGradient | 椭圆渐变 | 良好 | 特殊背景 | iOS 15+ |
| Material | 毛玻璃效果 | 中等 | 卡片、面板 | iOS 15+ |
| ImagePaint | 图像填充 | 取决于图像 | 纹理、图案 | iOS 13+ |
| .primary/.secondary | 语义颜色 | 最优 | 文本、UI元素 | iOS 13+ |

---

## 十二、最佳实践

### 1. 性能优化

```swift
// ✅ 好 - 缓存渐变
struct OptimizedView: View {
    let gradient = LinearGradient(
        colors: [.red, .blue],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    var body: some View {
        Rectangle()
            .fill(gradient)
    }
}

// ❌ 差 - 每次重建
struct UnoptimizedView: View {
    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [.red, .blue],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
    }
}
```

### 2. 适配深色模式

```swift
extension Color {
    static let adaptiveBackground = Color(
        light: Color(hex: "#FFFFFF"),
        dark: Color(hex: "#1C1C1E")
    )
    
    init(light: Color, dark: Color) {
        #if canImport(UIKit)
        self.init(UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
        #else
        self = light
        #endif
    }
}
```

### 3. 可重用样式

```swift
// 创建可重用的样式常量
extension ShapeStyle where Self == LinearGradient {
    static var brandGradient: LinearGradient {
        LinearGradient(
            colors: [.blue, .purple],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    static var warningGradient: LinearGradient {
        LinearGradient(
            colors: [.orange, .red],
            startPoint: .leading,
            endPoint: .trailing
        )
    }
}

// 使用
Button("提交") {}
    .background(.brandGradient)
```

### 4. 语义化使用

```swift
// ✅ 推荐 - 使用语义颜色
Text("标题")
    .foregroundStyle(.primary)

Text("说明")
    .foregroundStyle(.secondary)

// ❌ 避免 - 硬编码颜色
Text("标题")
    .foregroundStyle(.black)  // 深色模式会有问题
```

---

## 十三、常见问题

### Q1: 渐变在动画时性能差？

**解决方案:** 使用 `drawingGroup()` 修饰符

```swift
Rectangle()
    .fill(
        LinearGradient(colors: [.red, .blue], startPoint: .leading, endPoint: .trailing)
    )
    .drawingGroup()  // 启用 Metal 加速
```

### Q2: 如何创建透明渐变？

```swift
Rectangle()
    .fill(
        LinearGradient(
            colors: [.blue, .blue.opacity(0)],
            startPoint: .top,
            endPoint: .bottom
        )
    )
```

### Q3: Material 在 iOS 14 上不可用？

```swift
// 条件使用
if #available(iOS 15.0, *) {
    content.background(.regularMaterial)
} else {
    content.background(Color.white.opacity(0.8))
}
```

### Q4: 如何实现渐变文字？

```swift
Text("渐变文字")
    .font(.largeTitle)
    .fontWeight(.bold)
    .foregroundStyle(
        LinearGradient(
            colors: [.red, .blue],
            startPoint: .leading,
            endPoint: .trailing
        )
    )
```

---

## 总结

### ShapeStyle 选择指南

- **纯色** → `Color`
- **简单渐变** → `LinearGradient`
- **光效/聚光** → `RadialGradient`
- **进度环/色轮** → `AngularGradient`
- **毛玻璃效果** → `Material`
- **语义化UI** → `.primary`, `.secondary`, `.accent`
- **图案纹理** → `ImagePaint`
- **深色模式适配** → 使用语义颜色或自适应颜色

### 关键要点

1. ShapeStyle 是协议，Color、Gradient、Material 都遵循它
2. 使用语义颜色实现自动深色模式适配
3. 渐变可以提升UI的视觉效果
4. Material 提供原生的毛玻璃效果
5. 性能敏感场景缓存 ShapeStyle 对象
6. iOS 17+ 提供更多混合和调整方法