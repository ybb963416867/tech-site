---
title: "自定义SwiftUI SeekBar 🚀"
description: "自定义SwiftUI SeekBar 🚀 的技术笔记。"
pubDate: 2026-05-29
category: "view"
tags: [Swift, API]
draft: false
---
# 自定义SwiftUI  SeekBar 🚀

```
//
//  SeekBar.swift
//
//  Created by yunshen on 2026/1/20.
//

import SwiftUI

public struct DefaultHandle: View {
    private var color: Color = .red
    private var width: CGFloat = 20
    private var height: CGFloat = 20
    
    public init(color: Color, width: CGFloat, height: CGFloat) {
        self.color = color
        self.width = width
        self.height = height
    }
    
    public var body: some View {
        Circle()
            .fill(color)
            .frame(width: width, height: height)
    }
}

// 使用泛型 Handle: View 来支持任意自定义视图
public struct SeekBar<Handle: View>: View {
    // MARK: - Properties
    @Binding private var value: CGFloat
    @Binding private var bufferedValue: CGFloat
    private var range: ClosedRange<CGFloat> = 0...1
    private var step: CGFloat = 0.000001
    
    // 颜色配置
    private var inactiveTrackColor: Color = .gray
    private var bufferedTrackColor: Color = .gray.opacity(0.4)
    private var activeTrackColor: Color = .white
    
    //轨道的高度
    private var defaultTrackHeight: CGFloat = 4.0
    //拖曳时轨道的高度
    private var enlargedTrackHeight: CGFloat = 8.0
    //轨道触摸区域的高度
    private var maxTouchRegionHeight = 0.0
    // 回调
    private var onTrackingChanged: ((Bool) -> Void)? = nil
    private var onTrackingValueChange: ((CGFloat) -> Void)? = nil
    //自定义滑块
    @ViewBuilder private var handleBuilder: (Bool) -> Handle
    
    @State private var isDragging: Bool = false
    // 用于记录拖动开始时的初始数值
    @State private var initialValue: CGFloat = 0
    // 预留给手柄容器的大小
    @State private var handleSize: CGSize = .zero
    @State private var touchRegionHeight: CGFloat = 30.0
    
    ///
    /// - Parameters:
    ///     - value: 进度条的值
    ///     - bufferedValue: 缓存的值
    ///     - range: 范围
    ///     - step: 步长
    ///     - inactiveTrackColor: 轨道的颜色
    ///     - bufferedTrackColor: 缓存的轨道的颜色
    ///     - activeTrackColor: 激活的轨道的颜色
    ///     - defaultTrackHeight: 默认的轨道的高度
    ///     - enlargedTrackHeight: 拖曳时轨道的高度
    ///     - maxTouchRegionHeight: 触摸区域的最大高度（如果小于滑块的高度时，则触摸区域以滑块的高度为准）
    ///     - onTrackingChanged: 监听是否拖曳
    ///     - onTrackingValueChange: 值改变时回到
    ///     - handleBuilder: 自定义滑块
    ///
    public init(
        value: Binding<CGFloat>,
        bufferedValue: Binding<CGFloat>,
        range: ClosedRange<CGFloat> = 0...1,
        step: CGFloat = 0.000001,
        inactiveTrackColor: Color = .gray,
        bufferedTrackColor: Color = .gray.opacity(0.4),
        activeTrackColor: Color = .white,
        defaultTrackHeight: CGFloat = 4.0,
        enlargedTrackHeight: CGFloat = 8.0,
        maxTouchRegionHeight: CGFloat = 30,
        onTrackingChanged: ((Bool) -> Void)? = nil,
        onTrackingValueChange: ((CGFloat) -> Void)? = nil,
        @ViewBuilder  handleBuilder: @escaping(Bool) -> Handle
    ) {
        self._value = value
        self._bufferedValue = bufferedValue
        self.range = range
        self.step = step
        self.inactiveTrackColor = inactiveTrackColor
        self.bufferedTrackColor = bufferedTrackColor
        self.activeTrackColor = activeTrackColor
        self.defaultTrackHeight = defaultTrackHeight
        self.enlargedTrackHeight = enlargedTrackHeight
        self.maxTouchRegionHeight = maxTouchRegionHeight
        self.onTrackingChanged = onTrackingChanged
        self.onTrackingValueChange = onTrackingValueChange
        self.handleBuilder = handleBuilder
    }
    
    public var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            // 为了让手柄中心能对准轨道两端，有效宽度需减去手柄宽度
            let availableWidth = width - handleSize.width
            let currentTrackHeight = isDragging ? enlargedTrackHeight : defaultTrackHeight
            let rangeLength = range.upperBound - range.lowerBound
            
            // 确保 progress 始终在 0 到 1 之间
            let progress: CGFloat = {
                guard rangeLength > 0 else { return 0 }
                let rawProgress = (value - range.lowerBound) / rangeLength
                return max(0, min(1, rawProgress))
            }()
            
            // 确保 bufferedProgress 始终在 0 到 1 之间
            let bufferedProgress: CGFloat = {
                guard rangeLength > 0 else { return 0 }
                let rawBuffered = (bufferedValue - range.lowerBound) / rangeLength
                return max(0, min(1, rawBuffered))
            }()
            let handleOffset = progress * availableWidth - handleSize.width / 2
            
            ZStack(alignment: .leading) {
                // 1. 底色轨道
                RoundedRectangle(cornerRadius: currentTrackHeight / 2)
                    .fill(inactiveTrackColor)
                    .frame(width: availableWidth, height: currentTrackHeight)
                
                // 2. 缓冲轨道
                RoundedRectangle(cornerRadius: currentTrackHeight / 2)
                    .fill(bufferedTrackColor)
                    .frame(width: max(0, bufferedProgress * availableWidth), height: currentTrackHeight)
                
                // 3. 激活轨道
                RoundedRectangle(cornerRadius: currentTrackHeight / 2)
                    .fill(activeTrackColor)
                    .frame(width: max(0, progress * availableWidth), height: currentTrackHeight)
                
                // 4. 自定义手柄容器
                ZStack {
                    handleBuilder(isDragging).background(
                        GeometryReader { proxy in
                            
                            Color.clear.onAppear {
                                self.handleSize = proxy.size
                                self.touchRegionHeight = max(proxy.size.height, self.maxTouchRegionHeight, defaultTrackHeight, enlargedTrackHeight)
                            }.onChange(of: proxy.size) { oldValue, newValue in
                                self.handleSize = newValue
                            }
                            
                        }
                    )
                }
                .frame(width: handleSize.width, height: handleSize.height)
                .offset(x: handleOffset)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .contentShape(Rectangle()) // 扩大点击热区
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { gesture in
                        if !isDragging {
                            // 【关键】开始拖动的一瞬间，记录当前的 value
                            isDragging = true
                            initialValue = value
                            onTrackingChanged?(true)
                        }
                        
                        // 【关键】使用 translation（位移）而非 location（坐标）
                        updateValue(withTranslation: gesture.translation.width, totalWidth: availableWidth)
                    }
                    .onEnded { _ in
                        withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) {
                            isDragging = false
                        }
                        onTrackingChanged?(false)
                    }
            )
        }
        .frame(height: touchRegionHeight)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isDragging)
        .background(Color.yellow.opacity(0.5))
    }
    
    /// 根据手指位移更新数值
    /// - Parameters:
    ///   - translation: 手指自按下点移动的横向距离
    ///   - totalWidth: 轨道可用的总宽度
    private func updateValue(withTranslation translation: CGFloat, totalWidth: CGFloat) {
        guard totalWidth > 0 else { return }
        
        // 1. 将像素位移转换为数值范围内的增量
        let rangeLength = range.upperBound - range.lowerBound
        let valueDelta = (translation / totalWidth) * rangeLength
        
        // 2. 在初始值基础上叠加增量
        var newValue = initialValue + valueDelta
        
        // 3. 步进处理 (Step)
        if step > 0 {
            let steps = round((newValue - range.lowerBound) / step)
            newValue = range.lowerBound + steps * step
        }
        
        // 4. 边界修正
        newValue = max(range.lowerBound, min(range.upperBound, newValue))
        
        // 5. 更新绑定值
        if value != newValue {
            value = newValue
            onTrackingValueChange?(newValue)
        }
    }
}

// MARK: - Preview 示例
struct SeekBar_Previews: PreviewProvider {
    struct PreviewWrapper: View {
        @State var progress: CGFloat = 0.3
        @State var buffered: CGFloat = 0.6
        
        var body: some View {
            VStack(spacing: 50) {
                Text("进度: \(progress, specifier: "%.2f")")
                
                SeekBar(
                    value: $progress,
                    bufferedValue: $buffered,
                    handleBuilder: { dragging in
                        // 这里可以自定义任何形状的手柄
                        Circle()
                            .fill(.white)
                            .shadow(radius: dragging ? 4 : 2)
                            .scaleEffect(dragging ? 1.2 : 1.0)
                    }
                )
                .padding()
                .background(Color.black.opacity(0.8))
            }
        }
    }
    
    static var previews: some View {
        PreviewWrapper()
    }
}

```