---
title: "SwiftUI Border 完全指南 🚀"
description: "SwiftUI 提供了 .border() 修饰符用于为视图添加边框。除了基础的 .border() 外，还有 .overlay() 和 .stroke() 等方法可以实现更复杂的边框效果。"
pubDate: 2026-05-29
category: "view"
tags: [Swift]
draft: false
---
# SwiftUI Border 完全指南 🚀

## 概述

SwiftUI 提供了 `.border()` 修饰符用于为视图添加边框。除了基础的 `.border()` 外，还有 `.overlay()` 和 `.stroke()` 等方法可以实现更复杂的边框效果。

---

## 基础用法

### .border(_:width:)

最基本的边框修饰符。

```swift
func border<S>(_ content: S, width: CGFloat = 1) -> some View where S: ShapeStyle
```

**参数:**
- `content` - 边框的颜色或样式
- `width` - 边框宽度，默认为 1

**示例:**
```swift
Text("Hello")
    .padding()
    .border(Color.red)  // 默认宽度 1

Text("World")
    .padding()
    .border(Color.blue, width: 5)  // 宽度 5
```

---

## 详细用法示例

### 1. 基础颜色边框

```swift
struct BasicBorderExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 默认宽度边框
            Text("默认边框")
                .padding()
                .border(Color.red)
            
            // 自定义宽度
            Text("粗边框")
                .padding()
                .border(Color.blue, width: 5)
            
            // 不同颜色
            Text("绿色边框")
                .padding()
                .border(Color.green, width: 3)
            
            // 黑色边框
            Text("黑色边框")
                .padding()
                .border(Color.black, width: 2)
        }
    }
}
```

### 2. 使用不同的 ShapeStyle

```swift
struct ShapeStyleBorderExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 渐变边框
            Text("渐变边框")
                .padding()
                .border(
                    LinearGradient(
                        colors: [.red, .blue],
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    width: 4
                )
            
            // 径向渐变
            Text("径向渐变")
                .padding()
                .border(
                    RadialGradient(
                        colors: [.yellow, .orange],
                        center: .center,
                        startRadius: 0,
                        endRadius: 50
                    ),
                    width: 4
                )
            
            // 角度渐变
            Text("角度渐变")
                .padding()
                .border(
                    AngularGradient(
                        colors: [.red, .yellow, .green, .blue, .purple, .red],
                        center: .center
                    ),
                    width: 4
                )
            
            // 使用材质
            Text("材质边框")
                .padding()
                .border(.ultraThinMaterial, width: 3)
        }
    }
}
```

### 3. 条件边框

```swift
struct ConditionalBorderExample: View {
    @State private var isSelected = false
    
    var body: some View {
        VStack(spacing: 20) {
            // 条件边框
            Text("点击切换边框")
                .padding()
                .border(isSelected ? Color.red : Color.gray, width: 3)
                .onTapGesture {
                    isSelected.toggle()
                }
            
            // 使用三元运算符控制宽度
            Text("动态宽度")
                .padding()
                .border(Color.blue, width: isSelected ? 5 : 1)
                .onTapGesture {
                    isSelected.toggle()
                }
        }
    }
}
```

### 4. 组合使用 padding 和 border

```swift
struct PaddingBorderExample: View {
    var body: some View {
        VStack(spacing: 30) {
            // padding 在 border 之前
            Text("Padding 然后 Border")
                .padding(20)
                .border(Color.red, width: 2)
            
            // border 在 padding 之前
            Text("Border 然后 Padding")
                .border(Color.blue, width: 2)
                .padding(20)
            
            // 多层边框效果
            Text("多层边框")
                .padding(10)
                .border(Color.red, width: 2)
                .padding(10)
                .border(Color.blue, width: 2)
                .padding(10)
                .border(Color.green, width: 2)
        }
    }
}
```

---

## 高级技巧

### 使用 overlay 创建圆角边框

`.border()` 不支持圆角，需要使用 `.overlay()` 配合 `RoundedRectangle`。

```swift
struct RoundedBorderExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 圆角边框 - 方法1
            Text("圆角边框")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.red, lineWidth: 2)
                )
            
            // 圆角边框 - 方法2（带背景）
            Text("圆角边框带背景")
                .padding()
                .background(Color.yellow.opacity(0.2))
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.blue, lineWidth: 3)
                )
            
            // 胶囊形边框
            Text("胶囊形")
                .padding()
                .overlay(
                    Capsule()
                        .stroke(Color.purple, lineWidth: 2)
                )
            
            // 圆形边框
            Text("O")
                .font(.largeTitle)
                .frame(width: 60, height: 60)
                .overlay(
                    Circle()
                        .stroke(Color.green, lineWidth: 3)
                )
        }
    }
}
```

### 虚线边框

```swift
struct DashedBorderExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 虚线边框
            Text("虚线边框")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(
                            style: StrokeStyle(
                                lineWidth: 2,
                                dash: [5]
                            )
                        )
                        .foregroundColor(.red)
                )
            
            // 点划线边框
            Text("点划线")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(
                            style: StrokeStyle(
                                lineWidth: 2,
                                dash: [10, 5]
                            )
                        )
                        .foregroundColor(.blue)
                )
            
            // 复杂虚线模式
            Text("复杂虚线")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(
                            style: StrokeStyle(
                                lineWidth: 3,
                                dash: [15, 5, 5, 5]
                            )
                        )
                        .foregroundColor(.purple)
                )
        }
    }
}
```

### 渐变边框

```swift
struct GradientBorderExample: View {
    var body: some View {
        VStack(spacing: 30) {
            // 线性渐变圆角边框
            Text("线性渐变")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 15)
                        .stroke(
                            LinearGradient(
                                colors: [.red, .orange, .yellow],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 4
                        )
                )
            
            // 径向渐变
            Text("径向渐变")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 15)
                        .stroke(
                            RadialGradient(
                                colors: [.blue, .purple],
                                center: .center,
                                startRadius: 20,
                                endRadius: 100
                            ),
                            lineWidth: 4
                        )
                )
            
            // 角度渐变（彩虹效果）
            Text("彩虹边框")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 15)
                        .stroke(
                            AngularGradient(
                                gradient: Gradient(colors: [
                                    .red, .orange, .yellow, .green,
                                    .blue, .purple, .red
                                ]),
                                center: .center
                            ),
                            lineWidth: 4
                        )
                )
        }
    }
}
```

### 仅某些边有边框

```swift
struct PartialBorderExample: View {
    var body: some View {
        VStack(spacing: 30) {
            // 仅底部边框
            Text("仅底部边框")
                .padding()
                .overlay(
                    Rectangle()
                        .frame(height: 2)
                        .foregroundColor(.red),
                    alignment: .bottom
                )
            
            // 仅顶部边框
            Text("仅顶部边框")
                .padding()
                .overlay(
                    Rectangle()
                        .frame(height: 2)
                        .foregroundColor(.blue),
                    alignment: .top
                )
            
            // 左右边框
            Text("左右边框")
                .padding()
                .overlay(
                    HStack(spacing: 0) {
                        Rectangle()
                            .frame(width: 2)
                            .foregroundColor(.green)
                        Spacer()
                        Rectangle()
                            .frame(width: 2)
                            .foregroundColor(.green)
                    }
                )
            
            // 自定义组合
            Text("顶部和底部")
                .padding()
                .overlay(
                    VStack(spacing: 0) {
                        Rectangle()
                            .frame(height: 3)
                            .foregroundColor(.purple)
                        Spacer()
                        Rectangle()
                            .frame(height: 3)
                            .foregroundColor(.purple)
                    }
                )
        }
    }
}
```

### 动画边框

```swift
struct AnimatedBorderExample: View {
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 30) {
            // 宽度动画
            Text("宽度动画")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.blue, lineWidth: isAnimating ? 10 : 2)
                )
                .onTapGesture {
                    withAnimation(.easeInOut(duration: 0.5)) {
                        isAnimating.toggle()
                    }
                }
            
            // 颜色动画
            Text("颜色动画")
                .padding()
                .border(isAnimating ? Color.red : Color.blue, width: 3)
                .onTapGesture {
                    withAnimation(.easeInOut(duration: 0.5)) {
                        isAnimating.toggle()
                    }
                }
            
            // 旋转边框
            Text("旋转边框")
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(
                            AngularGradient(
                                colors: [.red, .orange, .yellow, .green, .blue, .purple, .red],
                                center: .center,
                                startAngle: .degrees(isAnimating ? 360 : 0),
                                endAngle: .degrees(isAnimating ? 720 : 360)
                            ),
                            lineWidth: 4
                        )
                )
                .onAppear {
                    withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                        isAnimating = true
                    }
                }
        }
    }
}
```

### 阴影边框组合

```swift
struct ShadowBorderExample: View {
    var body: some View {
        VStack(spacing: 30) {
            // 边框 + 阴影
            Text("边框和阴影")
                .padding()
                .background(Color.white)
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.blue, lineWidth: 2)
                )
                .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 5)
            
            // 发光效果
            Text("发光效果")
                .padding()
                .background(Color.white)
                .cornerRadius(15)
                .overlay(
                    RoundedRectangle(cornerRadius: 15)
                        .stroke(Color.purple, lineWidth: 2)
                )
                .shadow(color: .purple.opacity(0.5), radius: 15)
                .shadow(color: .purple.opacity(0.3), radius: 30)
            
            // 霓虹灯效果
            Text("霓虹灯")
                .foregroundColor(.white)
                .padding()
                .background(Color.black)
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.cyan, lineWidth: 2)
                )
                .shadow(color: .cyan, radius: 10)
                .shadow(color: .cyan, radius: 20)
        }
    }
}
```

---

## 实用扩展

### 自定义边框修饰符

```swift
// 圆角边框扩展
extension View {
    func roundedBorder(
        _ color: Color = .black,
        width: CGFloat = 1,
        cornerRadius: CGFloat = 8
    ) -> some View {
        self.overlay(
            RoundedRectangle(cornerRadius: cornerRadius)
                .stroke(color, lineWidth: width)
        )
    }
    
    // 虚线圆角边框
    func dashedBorder(
        _ color: Color = .black,
        width: CGFloat = 1,
        cornerRadius: CGFloat = 8,
        dash: [CGFloat] = [5]
    ) -> some View {
        self.overlay(
            RoundedRectangle(cornerRadius: cornerRadius)
                .stroke(
                    style: StrokeStyle(
                        lineWidth: width,
                        dash: dash
                    )
                )
                .foregroundColor(color)
        )
    }
    
    // 底部边框
    func bottomBorder(
        _ color: Color = .black,
        width: CGFloat = 1
    ) -> some View {
        self.overlay(
            Rectangle()
                .frame(height: width)
                .foregroundColor(color),
            alignment: .bottom
        )
    }
}

// 使用示例
struct CustomModifierExample: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("圆角边框")
                .padding()
                .roundedBorder(.blue, width: 2, cornerRadius: 10)
            
            Text("虚线边框")
                .padding()
                .dashedBorder(.red, width: 2, dash: [10, 5])
            
            Text("底部边框")
                .padding()
                .bottomBorder(.green, width: 3)
        }
    }
}
```

---

## 完整示例应用

### 输入框样式

```swift
struct TextFieldBorderExample: View {
    @State private var text = ""
    @State private var isFocused = false
    
    var body: some View {
        VStack(spacing: 30) {
            // 基础边框输入框
            TextField("用户名", text: $text)
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray, lineWidth: 1)
                )
            
            // 聚焦时变色
            TextField("邮箱", text: $text)
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isFocused ? Color.blue : Color.gray, lineWidth: 2)
                )
                .onTapGesture {
                    isFocused = true
                }
            
            // 带图标的输入框
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                TextField("搜索", text: $text)
            }
            .padding()
            .overlay(
                RoundedRectangle(cornerRadius: 25)
                    .stroke(Color.gray.opacity(0.5), lineWidth: 1)
            )
        }
        .padding()
    }
}
```

### 卡片样式

```swift
struct CardBorderExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 简单卡片
            VStack(alignment: .leading, spacing: 10) {
                Text("标题")
                    .font(.headline)
                Text("这是卡片内容，展示各种信息...")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.1), radius: 5, y: 2)
            
            // 高亮卡片
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                    Text("推荐")
                        .font(.headline)
                }
                Text("这是一个推荐项目")
                    .font(.subheadline)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.yellow.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.yellow, lineWidth: 2)
            )
        }
        .padding()
    }
}
```

### 按钮样式

```swift
struct ButtonBorderExample: View {
    var body: some View {
        VStack(spacing: 20) {
            // 主要按钮
            Button("主要按钮") {}
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            
            // 次要按钮（边框）
            Button("次要按钮") {}
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.clear)
                .foregroundColor(.blue)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.blue, lineWidth: 2)
                )
            
            // 危险按钮
            Button("删除") {}
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.clear)
                .foregroundColor(.red)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.red, lineWidth: 2)
                )
        }
        .padding()
    }
}
```

---

## 对比表格

| 方法 | 支持圆角 | 支持虚线 | 支持渐变 | 复杂度 | 推荐场景 |
|------|---------|---------|---------|--------|---------|
| `.border()` | ❌ | ❌ | ✅ | 低 | 简单矩形边框 |
| `.overlay(Rectangle)` | ❌ | ❌ | ✅ | 低 | 单边边框 |
| `.overlay(RoundedRectangle)` | ✅ | ✅ | ✅ | 中 | 圆角边框 |
| `.overlay(Capsule)` | ✅ | ✅ | ✅ | 中 | 胶囊形 |
| `.overlay(Circle)` | ✅ | ✅ | ✅ | 中 | 圆形 |
| 自定义 Shape | ✅ | ✅ | ✅ | 高 | 复杂形状 |

---

## 性能建议

1. **避免过度嵌套**
   ```swift
   // ❌ 不好
   view.border(Color.red).border(Color.blue).border(Color.green)
   
   // ✅ 更好
   view.overlay(
       ZStack {
           RoundedRectangle(cornerRadius: 10).stroke(Color.red, lineWidth: 1)
           RoundedRectangle(cornerRadius: 10).stroke(Color.blue, lineWidth: 3)
       }
   )
   ```

2. **重用样式**
   ```swift
   // 创建可重用的样式
   struct PrimaryBorderStyle: ViewModifier {
       func body(content: Content) -> some View {
           content
               .padding()
               .overlay(
                   RoundedRectangle(cornerRadius: 10)
                       .stroke(Color.blue, lineWidth: 2)
               )
       }
   }
   ```

3. **条件渲染**
   ```swift
   // 根据条件决定是否添加边框
   if shouldShowBorder {
       view.border(Color.red, width: 2)
   } else {
       view
   }
   ```

---

## 总结

- **基础边框**: 使用 `.border()` 适用于简单矩形
- **圆角边框**: 使用 `.overlay(RoundedRectangle().stroke())`
- **部分边框**: 使用 `.overlay()` + `Rectangle` 的对齐
- **渐变/动画**: 结合 `Gradient` 和 `Animation`
- **自定义**: 创建 `ViewModifier` 扩展提高复用性