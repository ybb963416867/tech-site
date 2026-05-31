---
title: "解决 ZStack 多层级视图触摸事件处理的手势冲突"
description: "上面的事件是有缺点的， 点击重叠，非中心可以触摸区域，下层符合条件的view接受不到触摸事件 下面集中式管理自定义ZStack 可以处理"
pubDate: 2026-05-29
category: "view"
tags: [Environment, Swift]
draft: false
---
# 解决 ZStack 多层级视图触摸事件处理的手势冲突

```swift

import Foundation
import SwiftUI

// 触摸事件类型
enum TouchEvent {
    case down, move, up
}

// 共享 ViewModel，管理手势状态
class SharedViewModel: ObservableObject {
    @Published var activeViewId: String? = nil  // 当前接管手势的视图 ID

    func reset() {
        activeViewId = nil
    }
}

// 单个正方形区域的视图
struct SquareView: View {
    @EnvironmentObject private var sharedViewModel: SharedViewModel
    @StateObject private var viewModel: SquareViewModel
    @GestureState private var isDragging = false

    let viewId: String
    let color: Color
    let zIndex: Double  // 层级，用于优先级判断

    init(
        viewId: String,
        color: Color,
        position: CGPoint,
        size: CGFloat,
        zIndex: Double
    ) {
        self.viewId = viewId
        self.color = color
        self.zIndex = zIndex
        self._viewModel = StateObject(
            wrappedValue: SquareViewModel(position: position, size: size)
        )
    }

    var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .updating($isDragging) { _, state, _ in
                state = true
            }
            .onChanged { value in
                if sharedViewModel.activeViewId == nil {
                    // 处理 down 事件
                    let result = viewModel.handleTouchEvent(
                        event: .down,
                        location: value.location
                    )

                    // 如果触摸在区域内，且当前没有其他视图接管，尝试接管
                    if result && sharedViewModel.activeViewId == nil {
                        sharedViewModel.activeViewId = viewId
                    }

                    print("View \(viewId) down result: \(result)")
                }

                if sharedViewModel.activeViewId == viewId {
                    // 仅接管视图处理 move 事件
                    _ = viewModel.handleTouchEvent(
                        event: .move,
                        location: value.location,
                        translation: value.translation
                    )
                }
            }
            .onEnded { value in
                if sharedViewModel.activeViewId == viewId {
                    // 仅接管视图处理 up 事件
                    _ = viewModel.handleTouchEvent(
                        event: .up,
                        location: value.location,
                        translation: value.translation
                    )
                }

                // 重置共享状态
                sharedViewModel.reset()
                //                viewModel.reset()
            }
    }

    var body: some View {
        Rectangle()
            .fill(color)
            .frame(width: viewModel.size, height: viewModel.size)
            .offset(
                x: viewModel.offset.width + viewModel.position.x,
                y: viewModel.offset.height + viewModel.position.y
            )
            .opacity(
                isDragging && sharedViewModel.activeViewId == viewId ? 0.8 : 1.0
            )  // 高亮效果
            .zIndex(zIndex)
            .simultaneousGesture(dragGesture)
    }
}

// 正方形区域的 ViewModel
class SquareViewModel: ObservableObject {
    @Published var offset: CGSize = .zero
    @Published var position: CGPoint = .zero
    let size: CGFloat
    private var region: CGRect

    init(position: CGPoint, size: CGFloat) {
        self.position = position
        self.size = size
        self.region = CGRect(
            x: position.x,
            y: position.y,
            width: size,
            height: size
        )
    }

    func resetRegion() {
        self.region = CGRect(
            x: position.x + offset.width,
            y: position.y + offset.height,
            width: size,
            height: size
        )
    }

    func handleTouchEvent(
        event: TouchEvent,
        location: CGPoint,
        translation: CGSize? = nil
    ) -> Bool {
        switch event {
        case .down:
            // 检查触摸点是否在区域内
            resetRegion()
            return region.contains(location)
        case .move:
            guard let translation = translation else { return false }
            // 更新偏移量，使正方形跟随拖动
            offset = translation
            return true
        case .up:
            // 重置偏移量
            guard let translation = translation else { return false }
            offset = translation
            position.x += translation.width
            position.y += translation.height
            offset = .zero
            return true
        }
    }

    func reset() {
        offset = .zero
    }
}

// 父视图，包含多个正方形区域
struct ContentView: View {
    @StateObject private var sharedViewModel = SharedViewModel()

    var body: some View {
        ZStack(alignment: .topLeading) {

            // 正方形区域（部分重叠）
            SquareView(
                viewId: "square1",
                color: .blue.opacity(0.5),
                position: CGPoint(x: 0, y: 0),
                size: 100,
                zIndex: 1
            )

            SquareView(
                viewId: "square2",
                color: .red.opacity(0.5),
                position: CGPoint(x: 0, y: 0),
                size: 200,
                zIndex: 2
            )

            SquareView(
                viewId: "square3",
                color: .green.opacity(0.5),
                position: CGPoint(x: 0, y: 0),
                size: 300,
                zIndex: 3
            )
        }.frame(
            maxWidth: .infinity,
            maxHeight: .infinity,
            alignment: .topLeading
        ).background(Color.yellow)
            .environmentObject(sharedViewModel)
    }
}

#Preview {
    ContentView1()
}

```

```swift

//
//  ContentView.swift
//  libmanager
//
//  Created by yunshen on 2025/4/29.
//

import SwiftUI
import Foundation

// 触摸事件类型
enum TouchEvent {
    case down, move, up
}

// 共享 ViewModel，管理手势状态
class SharedViewModel: ObservableObject {
    @Published var activeViewId: String? = nil // 当前接管手势的视图 ID
    
    func reset() {
        activeViewId = nil
    }
}

// 单个正方形区域的视图
struct SquareView: View {
    @EnvironmentObject private var sharedViewModel: SharedViewModel
    @StateObject private var viewModel: SquareViewModel
    @GestureState private var isDragging = false
    
    let viewId: String
    let color: Color
    let zIndex: Double // 层级，用于优先级判断
    
    init(viewId: String, color: Color, position: CGPoint, size: CGFloat, zIndex: Double) {
        self.viewId = viewId
        self.color = color
        self.zIndex = zIndex
        self._viewModel = StateObject(wrappedValue: SquareViewModel(position: position, size: size))
    }
    
    var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .updating($isDragging) { _, state, _ in
                state = true
            }
            .onChanged { value in
                if sharedViewModel.activeViewId == nil {
                    // 处理 down 事件
                    let result = viewModel.handleTouchEvent(
                        event: .down,
                        location: value.location
                    )
                    
                    // 如果触摸在区域内，且当前没有其他视图接管，尝试接管
                    if result && sharedViewModel.activeViewId == nil {
                        sharedViewModel.activeViewId = viewId
                    }
                    
                    print("View \(viewId) down result: \(result)")
                }
                
                if sharedViewModel.activeViewId == viewId {
                    // 仅接管视图处理 move 事件
                    _ = viewModel.handleTouchEvent(
                        event: .move,
                        location: value.location,
                        translation: value.translation
                    )
                }
            }
            .onEnded { value in
                if sharedViewModel.activeViewId == viewId {
                    // 仅接管视图处理 up 事件
                    _ = viewModel.handleTouchEvent(
                        event: .up,
                        location: value.location,
                        translation: value.translation
                    )
                }
                
                // 重置共享状态
                sharedViewModel.reset()
//                viewModel.reset()
            }
    }
    
    var body: some View {
        Rectangle()
            .fill(color)
            .frame(width: viewModel.size, height: viewModel.size)
            .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            .opacity(isDragging && sharedViewModel.activeViewId == viewId ? 0.8 : 1.0) // 高亮效果
            .zIndex(zIndex)
            .simultaneousGesture(dragGesture).overlay {
                Rectangle().stroke(style: StrokeStyle(lineWidth: 1)).frame(width: viewModel.size / 2, height: viewModel.size / 2).offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            }
    }
}

// 正方形区域的 ViewModel
class SquareViewModel: ObservableObject {
    @Published var offset: CGSize = .zero
    @Published var position: CGPoint = .zero
    let size: CGFloat
    private var region: CGRect
    
    init(position: CGPoint, size: CGFloat) {
        self.position = position
        self.size = size
        self.region = CGRect(
            x: position.x + size / 4,
            y: position.y + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    
    func resetRegion() {
        self.region = CGRect(x: position.x + offset.width + size / 4, y: position.y + offset.height + size / 4, width: size / 2, height: size / 2)
    }
    
    func handleTouchEvent(event: TouchEvent, location: CGPoint, translation: CGSize? = nil) -> Bool {
        switch event {
        case .down:
            // 检查触摸点是否在区域内
            resetRegion()
            return region.contains(location)
        case .move:
            guard let translation = translation else { return false }
            // 更新偏移量，使正方形跟随拖动
            offset = translation
            return true
        case .up:
            // 重置偏移量
            guard let translation = translation else { return false }
            offset = translation
            position.x += translation.width
            position.y += translation.height
            offset = .zero
            return true
        }
    }
    
    func reset() {
        offset = .zero
    }
}

// 父视图，包含多个正方形区域
struct ContentView: View {
    @StateObject private var sharedViewModel = SharedViewModel()
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            
            // 正方形区域（部分重叠）
            SquareView(
                viewId: "square1",
                color: .blue.opacity(0.5),
                position: CGPoint(x: 0, y: 0),
                size: 100,
                zIndex: 1
            )
            
            
            SquareView(
                viewId: "square2",
                color: .red.opacity(0.5),
                position: CGPoint(x: 0, y: 0),
                size: 200,
                zIndex: 2
            )
            
            
            SquareView(
                viewId: "square3",
                color: .green.opacity(0.5),
                position: CGPoint(x: 0, y: 0),
                size: 300,
                zIndex: 3
            )
        }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).background(Color.yellow)
        .environmentObject(sharedViewModel)
    }
}

#Preview {
    ContentView1()
}

```

> 上面的事件是有缺点的， 点击重叠，非中心可以触摸区域，下层符合条件的view接受不到触摸事件 下面集中式管理自定义ZStack 可以处理

```swift

import SwiftUI
import Foundation

// 触摸事件类型
enum TouchEvent {
    case down, move, up
}

// 共享 ViewModel，管理手势状态
class SharedViewModel: ObservableObject {
    @Published var activeViewId: String? = nil
    
    func reset() {
        activeViewId = nil
    }
}

// 正方形区域的 ViewModel
class SquareViewModel: ObservableObject {
    @Published var offset: CGSize = .zero
    @Published var position: CGPoint
    @Published var isDragging: Bool = false
    let size: CGFloat
    private var region: CGRect
    
    init(position: CGPoint, size: CGFloat) {
        self.position = position
        self.size = size
        self.region = CGRect(
            x: position.x + size / 4,
            y: position.y + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    func resetRegion() {
        self.region = CGRect(
            x: position.x + offset.width + size / 4,
            y: position.y + offset.height + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    func handleTouchEvent(event: TouchEvent, location: CGPoint, translation: CGSize? = nil) -> Bool {
        switch event {
        case .down:
            resetRegion()
            let result = region.contains(location)
            print("Handle down for region \(region), location \(location): \(result)")
            return result
        case .move:
            guard let translation = translation else { return false }
            offset = translation
            isDragging = true
            return true
        case .up:
            guard let translation = translation else { return false }
            offset = translation
            position.x += translation.width
            position.y += translation.height
            offset = .zero
            isDragging = false
            return true
        }
    }
    
    func reset() {
        offset = .zero
        isDragging = false
    }
}

// 单个正方形区域的视图（无手势逻辑）
struct SquareView: View, Identifiable {
    let id: String // 实现 Identifiable 协议
    @ObservedObject var viewModel: SquareViewModel
    let color: Color
    let zIndex: Double
    
    init(viewId: String, color: Color, position: CGPoint, size: CGFloat, zIndex: Double) {
        self.id = viewId
        self.color = color
        self.zIndex = zIndex
        self.viewModel = SquareViewModel(position: position, size: size)
    }
    
    var body: some View {
        Rectangle()
            .fill(color)
            .frame(width: viewModel.size, height: viewModel.size)
            .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            .opacity(viewModel.isDragging ? 0.8 : 1.0)
            .zIndex(zIndex)
            .overlay {
                Rectangle()
                    .stroke(style: StrokeStyle(lineWidth: 1))
                    .frame(width: viewModel.size / 2, height: viewModel.size / 2)
                    .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            }
    }
}

// 自定义 ZStack，集中处理触摸事件
struct CustomZStack<Content: View>: View {
    @StateObject private var sharedViewModel = SharedViewModel()
    let squares: [(id: String, view: SquareView, viewModel: SquareViewModel)]
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
        // 手动收集 SquareView 实例
        var squares: [(id: String, view: SquareView, viewModel: SquareViewModel)] = []
        let mirror = Mirror(reflecting: content())
        
        // 递归提取 SquareView
        func extractViews(_ mirror: Mirror) {
            for child in mirror.children {
                if let squareView = child.value as? SquareView {
                    squares.append((squareView.id, squareView, squareView.viewModel))
                } else {
                    let childMirror = Mirror(reflecting: child.value)
                    extractViews(childMirror)
                }
            }
        }
        
        extractViews(mirror)
        // 按 zIndex 降序排序
        self.squares = squares.sorted { $0.view.zIndex > $1.view.zIndex }
    }
    
    var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if sharedViewModel.activeViewId == nil {
                    // 处理 down 事件
                    for square in squares {
                        let result = square.viewModel.handleTouchEvent(
                            event: .down,
                            location: value.location
                        )
                        print("Checking view \(square.id), result: \(result)")
                        if result {
                            sharedViewModel.activeViewId = square.id
                            print("View \(square.id) took control")
                            break
                        }
                    }
                }
                
                if let activeId = sharedViewModel.activeViewId {
                    // 找到接管视图并处理 move 事件
                    if let activeSquare = squares.first(where: { $0.id == activeId }) {
                        _ = activeSquare.viewModel.handleTouchEvent(
                            event: .move,
                            location: value.location,
                            translation: value.translation
                        )
                    }
                }
            }
            .onEnded { value in
                if let activeId = sharedViewModel.activeViewId {
                    // 找到接管视图并处理 up 事件
                    if let activeSquare = squares.first(where: { $0.id == activeId }) {
                        _ = activeSquare.viewModel.handleTouchEvent(
                            event: .up,
                            location: value.location,
                            translation: value.translation
                        )
                    }
                }
                
                // 重置共享状态
                sharedViewModel.reset()
                print("Gesture ended, reset activeViewId")
            }
    }
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            // 渲染所有 SquareView
            ForEach(squares, id: \.id) { square in
                square.view
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.yellow)
        .environmentObject(sharedViewModel)
        .gesture(dragGesture)
    }
}

import SwiftUI

// 父视图
struct ContentView: View {
    var body: some View {
        CustomZStack {
            SquareView(
                viewId: "square1",
                color: .blue.opacity(0.5),
                position: CGPoint(x: 50, y: 50),
                size: 100,
                zIndex: 1
            )
            
            SquareView(
                viewId: "square2",
                color: .red.opacity(0.5),
                position: CGPoint(x: 75, y: 75),
                size: 200,
                zIndex: 2
            )
            
            SquareView(
                viewId: "square3",
                color: .green.opacity(0.5),
                position: CGPoint(x: 100, y: 100),
                size: 300,
                zIndex: 3
            )
        }
    }
}

```

> 上面基本满足了条件， 但是缺点明显不支持多点触摸

## 这个使用uikt 做桥接完整的触摸事件的处理

```swift

import SwiftUI
import UIKit

// 触摸事件类型
enum TouchEvent {
    case down, move, up
}

// 共享 ViewModel，管理手势状态
class SharedViewModel: ObservableObject {
    @Published private(set) var activeViewId: String? = nil
    
    func setActiveViewId(_ id: String?) {
            DispatchQueue.main.async { [weak self] in
                self?.activeViewId = id
            }
        }
    
    func reset() {
        activeViewId = nil
    }
}

// 正方形区域的 ViewModel
class SquareViewModel: ObservableObject {
    @Published var offset: CGSize = .zero
    @Published var position: CGPoint
    @Published var isDragging: Bool = false
    let size: CGFloat
    private var region: CGRect
    
    init(position: CGPoint, size: CGFloat) {
        self.position = position
        self.size = size
        self.region = CGRect(
            x: position.x + size / 4,
            y: position.y + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    func resetRegion() {
        self.region = CGRect(
            x: position.x + offset.width + size / 4,
            y: position.y + offset.height + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    func handleTouchEvent(event: TouchEvent, location: CGPoint, translation: CGSize? = nil) -> Bool {
        switch event {
        case .down:
            resetRegion()
            let result = region.contains(location)
            print("Handle down for view, region \(region), location \(location): \(result)")
            return result
        case .move:
            guard let translation = translation else { return false }
            offset = translation
            isDragging = true
            return true
        case .up:
            guard let translation = translation else { return false }
            offset = translation
            position.x += translation.width
            position.y += translation.height
            offset = .zero
            isDragging = false
            return true
        }
    }
    
    func reset() {
        offset = .zero
        isDragging = false
    }
}

// 单个正方形区域的视图
struct SquareView: View, Identifiable {
    let id: String
    @ObservedObject var viewModel: SquareViewModel
    let color: Color
    let zIndex: Double
    
    init(viewId: String, color: Color, position: CGPoint, size: CGFloat, zIndex: Double) {
        self.id = viewId
        self.color = color
        self.zIndex = zIndex
        self.viewModel = SquareViewModel(position: position, size: size)
    }
    
    var body: some View {
        Rectangle()
            .fill(color)
            .frame(width: viewModel.size, height: viewModel.size)
            .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            .opacity(viewModel.isDragging ? 0.8 : 1.0)
            .zIndex(zIndex)
            .overlay {
                Rectangle()
                    .stroke(style: StrokeStyle(lineWidth: 1))
                    .frame(width: viewModel.size / 2, height: viewModel.size / 2)
                    .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
           
            }
    }
}

// UIKit 自定义视图，处理触摸事件分发
class CustomTouchView: UIView {
    var squareViewModels: [(id: String, viewModel: SquareViewModel, zIndex: Double)] = []
    weak var sharedViewModel: SharedViewModel?
    
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard let sharedViewModel = sharedViewModel else {
            print("hitTest: sharedViewModel is nil")
            return nil
        }
        
        // UIKit 坐标与 SwiftUI 坐标一致（无需翻转 Y 轴，依赖父视图尺寸）
        let swiftUIPoint = point
        print("hitTest: point \(swiftUIPoint)")
        
        // 按 zIndex 降序检查
        for square in squareViewModels.sorted(by: { $0.zIndex > $1.zIndex }) {
            let result = square.viewModel.handleTouchEvent(event: .down, location: swiftUIPoint)
            print("hitTest: Checking view \(square.id), result: \(result)")
            
            if result {
                sharedViewModel.setActiveViewId(square.id)
                print("hitTest: View \(square.id) took control")
                return self // 捕获事件，交给 SwiftUI 手势
            }
        }
        
        print("hitTest: No view took control, passing event")
        return nil // 事件传递到下层
    }
}

// UIViewRepresentable 桥接
struct CustomTouchViewRepresentable: UIViewRepresentable {
    let squareViewModels: [(id: String, viewModel: SquareViewModel, zIndex: Double)]
    let sharedViewModel: SharedViewModel
    let size: CGSize
    
    func makeUIView(context: Context) -> CustomTouchView {
        let view = CustomTouchView()
        view.frame = CGRect(origin: .zero, size: size)
        view.backgroundColor = .clear
        view.squareViewModels = squareViewModels
        view.sharedViewModel = sharedViewModel
        print("makeUIView: frame \(view.frame)")
        return view
    }
    
    func updateUIView(_ uiView: CustomTouchView, context: Context) {
        uiView.frame = CGRect(origin: .zero, size: size)
        uiView.squareViewModels = squareViewModels
        uiView.sharedViewModel = sharedViewModel
        print("updateUIView: frame \(uiView.frame)")
    }
}

// 自定义 ZStack，集成 UIKit 触摸处理
struct CustomZStack: View {
    @StateObject private var sharedViewModel = SharedViewModel()
    let squares: [SquareView]
    
    init(squares: [SquareView]) {
        self.squares = squares
    }
    
    var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                // 如果 activeViewId 未设置，尝试处理 down 事件（作为 hitTest 失败的回退）
                if sharedViewModel.activeViewId == nil {
                    for square in squares.sorted(by: { $0.zIndex > $1.zIndex }) {
                        let result = square.viewModel.handleTouchEvent(event: .down, location: value.location)
                        print("DragGesture: Checking view \(square.id), result: \(result)")
                        if result {
                            sharedViewModel.setActiveViewId(square.id)
                            print("DragGesture: View \(square.id) took control")
                            break
                        }
                    }
                }
                
                // 处理 move 事件
                if let activeId = sharedViewModel.activeViewId {
                    if let activeSquare = squares.first(where: { $0.id == activeId }) {
                        _ = activeSquare.viewModel.handleTouchEvent(
                            event: .move,
                            location: value.location,
                            translation: value.translation
                        )
                    }
                }
            }
            .onEnded { value in
                // 处理 up 事件
                if let activeId = sharedViewModel.activeViewId {
                    if let activeSquare = squares.first(where: { $0.id == activeId }) {
                        _ = activeSquare.viewModel.handleTouchEvent(
                            event: .up,
                            location: value.location,
                            translation: value.translation
                        )
                    }
                }
                
                // 重置状态
                sharedViewModel.reset()
                print("DragGesture: Gesture ended, reset activeViewId")
            }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                // 渲染所有 SquareView
                ForEach(squares) { square in
                    square
                }
                
                // UIKit 触摸处理层
                CustomTouchViewRepresentable(
                    squareViewModels: squares.map { (id: $0.id, viewModel: $0.viewModel, zIndex: $0.zIndex) },
                    sharedViewModel: sharedViewModel,
                    size: geometry.size
                )
                .frame(width: geometry.size.width, height: geometry.size.height)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.yellow)
        .environmentObject(sharedViewModel)
        .gesture(dragGesture)
    }
}

//// 父视图
//struct ContentView: View {
//    var body: some View {
//        let squares = [
//            SquareView(
//                viewId: "square1",
//                color: .blue.opacity(0.5),
//                position: CGPoint(x: 50, y: 50),
//                size: 100,
//                zIndex: 1
//            ),
//            SquareView(
//                viewId: "square2",
//                color: .red.opacity(0.5),
//                position: CGPoint(x: 75, y: 75),
//                size: 200,
//                zIndex: 2
//            ),
//            SquareView(
//                viewId: "square3",
//                color: .green.opacity(0.5),
//                position: CGPoint(x: 100, y: 100),
//                size: 300,
//                zIndex: 3
//            )
//        ]
//        
//        CustomZStack(squares: squares)
//    }
//}
//
//#Preview {
//    ContentView()
//}

```

##

```swift

import SwiftUI
import UIKit

// 触摸事件类型
enum TouchEvent {
    case down, move, up
}

// 共享 ViewModel，管理手势状态
class SharedViewModel: ObservableObject {
    @Published private(set) var activeViewId: String? = nil
    
    func setActiveViewId(_ id: String?) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.activeViewId = id // 同步更新
        }
    }
    
    func reset() {
        DispatchQueue.main.async { [weak self] in
            self?.activeViewId = nil
        }
    }
}

// 正方形区域的 ViewModel
class SquareViewModel: ObservableObject {
    @Published var offset: CGSize = .zero
    @Published var position: CGPoint
    @Published var isDragging: Bool = false
    let size: CGFloat
    var region: CGRect
    
    init(position: CGPoint, size: CGFloat) {
        self.position = position
        self.size = size
        self.region = CGRect(
            x: position.x + size / 4,
            y: position.y + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    func resetRegion() {
        self.region = CGRect(
            x: position.x + offset.width + size / 4,
            y: position.y + offset.height + size / 4,
            width: size / 2,
            height: size / 2
        )
    }
    
    func handleTouchEvent(event: TouchEvent, location: CGPoint, translation: CGSize? = nil) -> Bool {
        switch event {
        case .down:
            resetRegion()
            let result = region.contains(location)
            print("Handle down for view, region \(region), location \(location): \(result)")
            return result
        case .move:
            guard let translation = translation else { return false }
            DispatchQueue.main.async { [weak self] in
                self?.offset = translation
                self?.isDragging = true
            }
            return true
        case .up:
            guard let translation = translation else { return false }
            DispatchQueue.main.async { [weak self] in
                self?.offset = translation
                self?.position.x += translation.width
                self?.position.y += translation.height
                self?.offset = .zero
                self?.isDragging = false
            }
            return true
        }
    }
    
    func reset() {
        DispatchQueue.main.async { [weak self] in
            self?.offset = .zero
            self?.isDragging = false
        }
    }
}

// 单个正方形区域的视图
struct SquareView: View, Identifiable {
    let id: String
    @ObservedObject var viewModel: SquareViewModel
    let color: Color
    let zIndex: Double
    
    init(viewId: String, color: Color, position: CGPoint, size: CGFloat, zIndex: Double) {
        self.id = viewId
        self.color = color
        self.zIndex = zIndex
        self.viewModel = SquareViewModel(position: position, size: size)
    }
    
    var body: some View {
        Rectangle()
            .fill(color)
            .frame(width: viewModel.size, height: viewModel.size)
            .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            .opacity(viewModel.isDragging ? 0.8 : 1.0)
            .zIndex(zIndex)
            .overlay {
                Rectangle()
                    .stroke(style: StrokeStyle(lineWidth: 1))
                    .frame(width: viewModel.size / 2, height: viewModel.size / 2)
                    .offset(x: viewModel.offset.width + viewModel.position.x, y: viewModel.offset.height + viewModel.position.y)
            }
            .allowsHitTesting(false) // 防止 SquareView 拦截触摸
    }
}

// UIKit 自定义视图
class CustomTouchView: UIView {
    var squareViewModels: [(id: String, viewModel: SquareViewModel, zIndex: Double)] = []
    weak var sharedViewModel: SharedViewModel?
    
    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        addGestureRecognizer(pan)
    }
    
    @objc func handlePan(_ gesture: UIPanGestureRecognizer) {
        let point = gesture.location(in: self)
        let swiftUIPoint = point
        let translation = gesture.translation(in: self)
        
        print("handlePan: state \(gesture.state.rawValue), point \(swiftUIPoint), translation \(translation)")
        
        switch gesture.state {
        case .began:
            for square in squareViewModels.sorted(by: { $0.zIndex > $1.zIndex }) {
                let result = square.viewModel.handleTouchEvent(event: .down, location: swiftUIPoint)
                print("PanGesture: Checking view \(square.id), region \(square.viewModel.region), result: \(result)")
                if result {
                    sharedViewModel?.setActiveViewId(square.id)
                    print("PanGesture: View \(square.id) took control, activeViewId: \(sharedViewModel?.activeViewId ?? "nil")")
                    break
                }
            }
        case .changed:
            if let activeId = sharedViewModel?.activeViewId {
                if let square = squareViewModels.first(where: { $0.id == activeId }) {
                    _ = square.viewModel.handleTouchEvent(
                        event: .move,
                        location: swiftUIPoint,
                        translation: CGSize(width: translation.x, height: translation.y)
                    )
                    print("PanGesture: Moving view \(activeId)")
                } else {
                    print("PanGesture: No square found for activeId \(activeId)")
                }
            } else {
                print("PanGesture: No active view")
            }
        case .ended, .cancelled:
            if let activeId = sharedViewModel?.activeViewId {
                if let square = squareViewModels.first(where: { $0.id == activeId }) {
                    _ = square.viewModel.handleTouchEvent(
                        event: .up,
                        location: swiftUIPoint,
                        translation: CGSize(width: translation.x, height: translation.y)
                    )
                    print("PanGesture: Ended view \(activeId)")
                }
            }
            sharedViewModel?.reset()
            print("CustomTouchView: All touch events completed")
        default:
            break
        }
    }
    
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let swiftUIPoint = point
        print("hitTest: point \(swiftUIPoint)")
        for square in squareViewModels.sorted(by: { $0.zIndex > $1.zIndex }) {
            let result = square.viewModel.handleTouchEvent(event: .down, location: swiftUIPoint)
            print("hitTest: Checking view \(square.id), region \(square.viewModel.region), result: \(result)")
            if result {
                sharedViewModel?.setActiveViewId(square.id)
                print("hitTest: View \(square.id) took control, activeViewId: \(sharedViewModel?.activeViewId ?? "nil")")
                return self
            }
        }
        print("hitTest: No view took control, passing event")
        return nil
    }
}

// UIViewRepresentable 桥接
struct CustomTouchViewRepresentable: UIViewRepresentable {
    let squareViewModels: [(id: String, viewModel: SquareViewModel, zIndex: Double)]
    let sharedViewModel: SharedViewModel
    let size: CGSize
    
    func makeUIView(context: Context) -> CustomTouchView {
        let view = CustomTouchView()
        view.frame = CGRect(origin: .zero, size: size)
        view.backgroundColor = .clear // 可临时设为红色调试
        view.squareViewModels = squareViewModels
        view.sharedViewModel = sharedViewModel
        print("makeUIView: frame \(view.frame)")
        return view
    }
    
    func updateUIView(_ uiView: CustomTouchView, context: Context) {
        uiView.frame = CGRect(origin: .zero, size: size)
        uiView.squareViewModels = squareViewModels
        uiView.sharedViewModel = sharedViewModel
        print("updateUIView: frame \(uiView.frame)")
    }
}

// 自定义 ZStack
struct CustomZStack: View {
    @StateObject private var sharedViewModel = SharedViewModel()
    let squares: [SquareView]
    
    init(squares: [SquareView]) {
        self.squares = squares
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                ForEach(squares) { square in
                    square
                }
                
                CustomTouchViewRepresentable(
                    squareViewModels: squares.map { (id: $0.id, viewModel: $0.viewModel, zIndex: $0.zIndex) },
                    sharedViewModel: sharedViewModel,
                    size: geometry.size
                )
                .frame(width: geometry.size.width, height: geometry.size.height)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.yellow)
        .environmentObject(sharedViewModel)
    }
}

//// 父视图
//struct ContentView: View {
//    var body: some View {
//        let squares = [
//            SquareView(
//                viewId: "square1",
//                color: .blue.opacity(0.5),
//                position: CGPoint(x: 50, y: 50),
//                size: 100,
//                zIndex: 1
//            ),
//            SquareView(
//                viewId: "square2",
//                color: .red.opacity(0.5),
//                position: CGPoint(x: 75, y: 75),
//                size: 200,
//                zIndex: 2
//            ),
//            SquareView(
//                viewId: "square3",
//                color: .green.opacity(0.5),
//                position: CGPoint(x: 100, y: 100),
//                size: 300,
//                zIndex: 3
//            )
//        ]
//        
//        CustomZStack(squares: squares)
//    }
//}
//
//#Preview {
//    ContentView()
//}

```

*   终结版本

```

//
//  CustomYSStack.swift
//  libmanager
//
//  Created by yunshen on 2025/5/6.
//

import Combine
import Foundation
import SwiftUI

public enum TouchEvent {
    case down, move, up
}

/// 基础的ViewMode
open class BaseViewMode: ObservableObject {

    private(set) var region: CGRect = .zero

    public init() {}

    ///
    /// - Parameters
    ///     - ltPostion 左上角的位置
    ///     - size 触摸条件的区域
    ///
    open func updateRegion(ltPostion: CGPoint, size: CGSize) {
        region = CGRect(origin: ltPostion, size: size)
    }

    open func updateRegion(x: CGFloat, y: CGFloat, size: CGSize) {
        region = CGRect(x: x, y: y, width: size.width, height: size.height)
    }

    open func updateRegion(
        x: CGFloat,
        y: CGFloat,
        width: CGFloat,
        height: CGFloat
    ) {
        region = CGRect(x: x, y: y, width: width, height: height)
    }

    ///
    /// - parameters
    ///     - event 事件 .down 摁下
    ///     - location 当前的触摸点
    ///     - translation 移动的距离
    ///     - Returns 如果在 .down 时 返回true 代表当前的view去处理该事件，如果返回false 时 代表不处理该事件
    ///
    open func handleTouchEvent(
        event: TouchEvent,
        location: CGPoint,
        translation: CGSize? = nil
    ) -> Bool {

        return true
    }

}

open class SharedViewModel: ObservableObject {
    @Published private(set) var activeViewId: String? = nil

    open func setActiveViewId(_ id: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.activeViewId = id
        }
    }

    open func reset() {
        activeViewId = nil
    }

}

protocol BaseView: View, Identifiable {
    associatedtype ViewMode: BaseViewMode
    var id: String { get }
    var region: CGRect { get set }
    var viewModel: ViewMode { get }
    var zIndex: Double { get }

    func handleTouchEvent(
        event: TouchEvent,
        location: CGPoint,
        translation: CGSize?
    ) -> Bool

    func updateRegion(rect: CGRect)
}

// UIViewRepresentable 桥接
struct CustomTouchViewRepresentable: UIViewRepresentable {
    let squareViewModels: [any BaseView]
    let sharedViewModel: SharedViewModel
    let size: CGSize

    func makeUIView(context: Context) -> CustomYSTouchView {
        let view = CustomYSTouchView()
        view.frame = CGRect(origin: .zero, size: size)
        view.backgroundColor = .clear  // 可临时设为红色调试
        view.squareViewModels = squareViewModels
        view.sharedViewModel = sharedViewModel
        print("makeUIView: frame \(view.frame)")
        return view
    }

    func updateUIView(_ uiView: CustomYSTouchView, context: Context) {
        uiView.frame = CGRect(origin: .zero, size: size)
        uiView.squareViewModels = squareViewModels
        uiView.sharedViewModel = sharedViewModel
        print("updateUIView: frame \(uiView.frame)")
    }
}

// UIKit 自定义视图，处理触摸事件分发
class CustomYSTouchView: UIView {
    var squareViewModels: [any BaseView] = []
    weak var sharedViewModel: SharedViewModel?

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard let sharedViewModel = sharedViewModel else {
            print("hitTest: sharedViewModel is nil")
            return nil
        }

        // UIKit 坐标与 SwiftUI 坐标一致（无需翻转 Y 轴，依赖父视图尺寸）
        let swiftUIPoint = point
        print("hitTest: point \(swiftUIPoint)")

        // 按 zIndex 降序检查
        for square in squareViewModels.sorted(by: { $0.zIndex > $1.zIndex }) {
            let result = square.viewModel.handleTouchEvent(
                event: .down,
                location: swiftUIPoint
            )
            print(
                "hitTest: Checking view \(square.id), result: \(result) swiftUIPoint: \(swiftUIPoint) region: \(square.viewModel.region)"
            )

            if result {
                sharedViewModel.setActiveViewId(square.id)
                print("hitTest: View \(square.id) took control")
                return self  // 捕获事件，交给 SwiftUI 手势
            }
        }

        print("hitTest: No view took control, passing event")
        return nil  // 事件传递到下层
    }
}

public struct CustomYSZStack<Content: View>: View {

    @StateObject private var sharedViewModel = SharedViewModel()
    let squares: [any BaseView]
    let content: Content
    let alignment: Alignment

    public init(
        alignment: Alignment = Alignment.topLeading,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        var squares: [any BaseView] = []
        let mirror = Mirror(reflecting: self.content)
        func extractViews(_ mirror: Mirror) {
            for child in mirror.children {
                if let squareView = child.value as? (any BaseView) {
                    squares.append(squareView)
                } else {
                    let childMirror = Mirror(reflecting: child.value)
                    extractViews(childMirror)
                }
            }
        }

        extractViews(mirror)
        self.alignment = alignment

        self.squares = squares.sorted(by: { $0.zIndex > $1.zIndex })
    }

    var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0).onChanged { value in
            if sharedViewModel.activeViewId == nil {
                for square in squares {
                    let result = square.handleTouchEvent(
                        event: .down,
                        location: value.location,
                        translation: value.translation
                    )
                    if result {
                        sharedViewModel.setActiveViewId(square.id)
                        break
                    }
                }
            }

            // 处理 move 事件
            if let activeId = sharedViewModel.activeViewId {
                if let activeSquare = squares.first(where: { $0.id == activeId }
                ) {
                    _ = activeSquare.handleTouchEvent(
                        event: .move,
                        location: value.location,
                        translation: value.translation
                    )
                }
            }
        }.onEnded { value in
            // 处理 up 事件
            if let activeId = sharedViewModel.activeViewId {
                if let activeSquare = squares.first(where: { $0.id == activeId }
                ) {
                    _ = activeSquare.handleTouchEvent(
                        event: .up,
                        location: value.location,
                        translation: value.translation
                    )
                }
            }

            // 重置状态
            sharedViewModel.reset()
        }
    }

    public var body: some View {

        GeometryReader { geometry in
            ZStack(alignment: alignment) {
                content
            }

                        CustomTouchViewRepresentable(
                            squareViewModels: squares,
                            sharedViewModel: sharedViewModel,
                            size: geometry.size
                        )

        }.environmentObject(sharedViewModel)
            .gesture(dragGesture).frame(maxWidth: .infinity, maxHeight: .infinity)

    }
}

/////////////////////////////////用法////////////////

// 正方形区域的 ViewModel

class SquareViewModel: BaseViewMode {
    @Published var offset: CGSize = .zero
    @Published var position: CGPoint
    @Published var isDragging: Bool = false
    let size: CGFloat

    init(position: CGPoint, size: CGFloat) {
        self.position = position
        self.size = size
        super.init()
        updateRegion(
            x: position.x + size / 4,
            y: position.y + size / 4,
            width: size / 2,
            height: size / 2
        )
    }

    func resetRegion() {
        updateRegion(
            x: position.x + offset.width + size / 4,
            y: position.y + offset.height + size / 4,
            width: size / 2,
            height: size / 2
        )
    }

    override func handleTouchEvent(
        event: TouchEvent,
        location: CGPoint,
        translation: CGSize? = nil
    ) -> Bool {
        switch event {
        case .down:
            resetRegion()
            let result = region.contains(location)
            print(
                "Handle down for view, region \(region), location \(location): \(result)"
            )
            return result
        case .move:
            guard let translation = translation else { return false }
            DispatchQueue.main.async { [weak self] in
                self?.offset = translation
                self?.isDragging = true
            }
            return true
        case .up:
            guard let translation = translation else { return false }
            DispatchQueue.main.async { [weak self] in
                self?.offset = translation
                self?.position.x += translation.width
                self?.position.y += translation.height
                self?.offset = .zero
                self?.isDragging = false
            }
            return true
        }
    }

    func reset() {
        DispatchQueue.main.async { [weak self] in
            self?.offset = .zero
            self?.isDragging = false
        }
    }
}

struct SquareView: BaseView {

    let id: String
    let zIndex: Double
    let color: Color
    @ObservedObject var viewModel: SquareViewModel

    init(
        viewId: String,
        color: Color,
        position: CGPoint,
        size: CGFloat,
        zIndex: Double
    ) {
        self.id = viewId
        self.color = color
        self.zIndex = zIndex
        self.viewModel = SquareViewModel(position: position, size: size)
    }

    var region: CGRect = .zero

    func handleTouchEvent(
        event: TouchEvent,
        location: CGPoint,
        translation: CGSize?
    ) -> Bool {
        return viewModel.handleTouchEvent(
            event: event,
            location: location,
            translation: translation
        )
    }

    func updateRegion(rect: CGRect) {

    }

    var body: some View {
        Rectangle()
            .fill(color)
            .frame(width: viewModel.size, height: viewModel.size)
            .offset(
                x: viewModel.offset.width + viewModel.position.x,
                y: viewModel.offset.height + viewModel.position.y
            )
            .opacity(viewModel.isDragging ? 0.8 : 1.0)
            .zIndex(zIndex)
            .overlay {
                Rectangle()
                    .stroke(style: StrokeStyle(lineWidth: 1))
                    .frame(
                        width: viewModel.size / 2,
                        height: viewModel.size / 2
                    )
                    .offset(
                        x: viewModel.offset.width + viewModel.position.x,
                        y: viewModel.offset.height + viewModel.position.y
                    )
            }
            .allowsHitTesting(false)  // 防止 SquareView 拦截触摸
    }
}

import SwiftUI

// 父视图
struct ContentView: View {
    var body: some View {

        CustomYSZStack {
            SquareView(
                viewId: "square1",
                color: .blue.opacity(0.5),
                position: CGPoint(x: 50, y: 50),
                size: 100,
                zIndex: 1
            )
            SquareView(
                viewId: "square2",
                color: .red.opacity(0.5),
                position: CGPoint(x: 75, y: 75),
                size: 200,
                zIndex: 2
            )
            SquareView(
                viewId: "square3",
                color: .green.opacity(0.5),
                position: CGPoint(x: 100, y: 100),
                size: 300,
                zIndex: 3
            )
            
            Rectangle().fill(Color.orange).frame(width: 500 , height: 500)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    ContentView()
}

```

