---
title: "DrawerView 抽屉菜单"
description: "DrawerView 抽屉菜单 的技术笔记。"
pubDate: 2026-05-29
category: "view"
tags: [iOS, Swift, API]
draft: false
---
```

import Foundation
import SwiftUI

struct DrawerView<
    Content: View, LeftMenuView: View, RightMenuView: View,
    LeftBackground: View, RightBackground: View
>: View {

    ///左侧的侧拉菜单的宽度
    var leftSideMenuWidth: CGFloat = 200
    ///右侧的侧拉菜单的默认宽度
    var rightSideMenuWidth: CGFloat = 200
    ///是否启动安全区域
    var shouldIgnoreSafeArea: Bool = false

    var leftSideDuration: TimeInterval = 0.3
    var righSidetDuration: TimeInterval = 0.3
    
    /// `swipeTriggerX` 触摸屏幕打开菜单的触摸区域
    var swipeTriggerX: CGFloat = 100

    ///是否显示左侧的侧拉菜单
    @Binding var showLeftMenu: Bool
    ///是否显示右侧拉菜单
    @Binding var showRightMenu: Bool

    ///偏移x坐标
    @State private var offsetX: CGFloat = 0
    ///拖曳时的坐标标记
    @State private var lastOffsetX: CGFloat = 0

    ///主内容
    @ViewBuilder var content: (UIEdgeInsets) -> Content

    ///左侧的侧拉菜单
    @ViewBuilder var leftMenuVeiw: (UIEdgeInsets) -> LeftMenuView

    ///右侧的侧拉菜单
    @ViewBuilder var rightMenuView: (UIEdgeInsets) -> RightMenuView

    /// `leftBackground` 左背景
    @ViewBuilder var leftBackground: LeftBackground

    /// `rightBackground` 右背景
    @ViewBuilder var rightBackground: RightBackground

    /// `progress` 进度
    @State private var progress: CGFloat = 0

    /// `isDragging` 标记是否是拖曳的状态
    @GestureState private var isDragging: Bool = false

    //标记做菜单正在打开
    @State private var isLeftDragging: Bool = false
    ///标记是右菜单正在打开
    @State private var isRightDragging: Bool = false

    ///防止一个侧拉菜单关闭时， 同时一个侧拉菜单打开
    @State private var isMenuDragging: Bool = false

    var body: some View {
        let mainView = GeometryReader { inset in

            let size = inset.size
            let safeArea =
                (UIApplication.shared.connectedScenes.first as? UIWindowScene)?
                .keyWindow?.safeAreaInsets ?? .zero

            let width = size.width  //- inset.safeAreaInsets.leading - inset.safeAreaInsets.trailing
            let height = size.height

            ZStack {
                GeometryReader { area in
                    content(area.safeAreaInsets.toUIEdgeInsets())
                }.frame(width: width).overlay {
                    if progress > 0 {
                        Rectangle().fill(Color.black.opacity(progress * 0.2))
                            .onTapGesture {
                                if !isMenuDragging {
                                    withAnimation(
                                        .snappy(
                                            duration: showLeftMenu
                                                ? leftSideDuration
                                                : righSidetDuration)
                                    ) {
                                        resetSide()
                                    }
                                }
                            }.frame(width: width, height: height)
                    }
                }

                HStack(alignment: .center, spacing: 0) {

                    GeometryReader { _ in
                        leftMenuVeiw(safeArea)
                    }.frame(width: leftSideMenuWidth).contentShape(.rect)
                        .background(leftBackground)
                        .opacity(progress)

                    Color.clear.frame(width: width, height: height)

                    GeometryReader { _ in
                        rightMenuView(safeArea)
                    }.frame(width: rightSideMenuWidth).contentShape(.rect)
                        .background(rightBackground)
                        .opacity(progress)

                }.frame(
                    width: leftSideMenuWidth + width + rightSideMenuWidth
                ).offset(
                    x: offsetX + (rightSideMenuWidth - leftSideMenuWidth)
                        / 2
                ).modifier(
                    IgnoreSafeAreaModifier(shouldIgnore: shouldIgnoreSafeArea))

            }.frame(width: width, height: height).contentShape(.rect)
                .simultaneousGesture(dragGesture)

        }

        var modifiedView: AnyView

        if #available(iOS 17, *) {
            modifiedView = AnyView(
                mainView.onChange(of: showLeftMenu, initial: false) {
                    oldValue, newValue in
                    withAnimation(
                        .snappy(
                            duration: showLeftMenu
                                ? leftSideDuration : righSidetDuration)
                    ) {
                        if newValue {
                            showLeftSideBar()
                        } else {
                            resetSide()
                        }
                    }
                }.onChange(of: showRightMenu) { oldValue, newValue in

                    withAnimation(
                        .snappy(
                            duration: showLeftMenu
                                ? leftSideDuration : righSidetDuration)
                    ) {
                        if newValue {
                            showRightSideBar()
                        } else {
                            resetSide()
                        }
                    }

                }
            )

        } else {

            modifiedView = AnyView(
                mainView
                    .onChange(of: showLeftMenu) { newValue in
                        withAnimation(
                            .snappy(
                                duration: showLeftMenu
                                    ? leftSideDuration : righSidetDuration)
                        ) {
                            if newValue {
                                showLeftSideBar()
                            } else {
                                resetSide()
                            }
                        }
                    }.onChange(of: showRightMenu) { newValue in

                        withAnimation(
                            .snappy(
                                duration: showLeftMenu
                                    ? leftSideDuration : righSidetDuration)
                        ) {
                            if newValue {
                                showRightSideBar()
                            } else {
                                resetSide()
                            }
                        }
                    }
                    .onAppear {
                        if showLeftMenu != false {
                            showLeftMenu = false
                        }
                        if showRightMenu != false {
                            showRightMenu = false
                        }
                    }

            )
        }

        return Group {
            modifiedView
        }

    }

    var dragGesture: some Gesture {
        DragGesture().updating($isDragging) { _, out, _ in
            out = true
        }.onChanged { value in
            guard value.startLocation.x > 10 else { return }

            if showLeftMenu {
                let translationX =
                    isDragging
                    ? max(
                        min(
                            value.translation.width + lastOffsetX,
                            leftSideMenuWidth), 0.0) : 0
                isLeftDragging = true
                offsetX = translationX
                calculateLeftProgress()
                isMenuDragging = true

            } else if showRightMenu {
                let translationX =
                    isDragging
                    ? min(
                        max(
                            value.translation.width + lastOffsetX,
                            -rightSideMenuWidth), 0) : 0
                isRightDragging = true
                offsetX = translationX
                calculateRightProgress()

                isMenuDragging = true
            } else {

                if isMenuDragging {
                    return
                }

                if value.startLocation.x < swipeTriggerX {
                    let translationX =
                        isDragging
                        ? max(
                            min(
                                value.translation.width + lastOffsetX,
                                leftSideMenuWidth), 0.0) : 0
                    isLeftDragging = true
                    offsetX = translationX
                    calculateLeftProgress()
                } else if value.startLocation.x > UIScreen.main.bounds.width - swipeTriggerX {

                    let translationX =
                        isDragging
                        ? min(
                            max(
                                value.translation.width + lastOffsetX,
                                -rightSideMenuWidth), 0) : 0
                    isRightDragging = true
                    offsetX = translationX
                    calculateRightProgress()

                }
            }

        }.onEnded { value in
            guard value.startLocation.x > 10 else { return }

            DispatchQueue.main.async {
                isMenuDragging = false
            }

            if showLeftMenu {
                withAnimation(
                    .snappy(
                        duration: showLeftMenu
                            ? leftSideDuration : righSidetDuration)
                ) {
                    let velocityX = value.velocity.width / 8
                    let total = velocityX + offsetX
                    if total > (leftSideMenuWidth * 0.5) {
                        showLeftSideBar()
                    } else {
                        resetSide()
                    }
                }
            } else if showRightMenu {

                withAnimation(
                    .snappy(
                        duration: showLeftMenu
                            ? leftSideDuration : righSidetDuration)
                ) {
                    let velocityX = value.velocity.width / 8
                    let total = velocityX + offsetX

                    if total < (-rightSideMenuWidth * 0.5) {
                        showRightSideBar()
                    } else {
                        resetSide()
                    }
                }

            } else {
                if value.startLocation.x < swipeTriggerX {
                    withAnimation(
                        .snappy(
                            duration: showLeftMenu
                                ? leftSideDuration : righSidetDuration)
                    ) {
                        let velocityX = value.velocity.width / 8
                        let total = velocityX + offsetX
                        if total > (leftSideMenuWidth * 0.5) {
                            showLeftSideBar()
                        } else {
                            resetSide()
                        }
                    }
                } else if value.startLocation.x > UIScreen.main.bounds.width - swipeTriggerX  {
                    withAnimation(
                        .snappy(
                            duration: showLeftMenu
                                ? leftSideDuration : righSidetDuration)
                    ) {
                        let velocityX = value.velocity.width / 8
                        let total = velocityX + offsetX

                        if total < (-rightSideMenuWidth * 0.5) {
                            showRightSideBar()
                        } else {
                            resetSide()
                        }
                    }
                }
            }

        }
    }

    func showLeftSideBar() {
        offsetX = leftSideMenuWidth
        lastOffsetX = offsetX
        showLeftMenu = true
        isLeftDragging = false
        calculateLeftProgress()
    }

    func showRightSideBar() {
        offsetX = -rightSideMenuWidth
        lastOffsetX = offsetX
        showRightMenu = true
        isRightDragging = false
        calculateRightProgress()
    }

    func calculateLeftProgress() {
        progress = max(min(offsetX / leftSideMenuWidth, 1.0), 0.0)
    }

    func calculateRightProgress() {
        progress = max(min(abs(offsetX / rightSideMenuWidth), 1.0), 0.0)
    }

    func resetSide() {
        offsetX = 0
        lastOffsetX = 0
        showLeftMenu = false
        isLeftDragging = false
        showRightMenu = false
        isRightDragging = false
        calculateLeftProgress()
    }

}

struct IgnoreSafeAreaModifier: ViewModifier {

    let shouldIgnore: Bool

    func body(content: Content) -> some View {
        if shouldIgnore {
            content.ignoresSafeArea()
        } else {
            content
        }
    }

}

extension EdgeInsets {
    func toUIEdgeInsets() -> UIEdgeInsets {
        return UIEdgeInsets(
            top: self.top, left: self.leading, bottom: self.bottom,
            right: self.trailing)
    }
}

extension UIEdgeInsets {
    func toEdgeInsets() -> EdgeInsets {
        return EdgeInsets(
            top: self.top, leading: self.left, bottom: self.bottom,
            trailing: self.right)
    }
}

```

```

//
//  DrawerView.swift
//  AnimatedMenu
//
//  Created by yangbinbing on 2025/3/2.
//

import Foundation
import SwiftUI

struct DrawerView<
    Content: View,
    LeftMenuView: View,
    RightMenuView: View,
    LeftBackground: View,
    RightBackground: View
>: View {

    /// 左侧的侧拉菜单的宽度
    var leftSideMenuWidth: CGFloat = 200
    /// 右侧的侧拉菜单的默认宽度
    var rightSideMenuWidth: CGFloat = 200
    /// 是否启动安全区域
    var shouldIgnoreSafeArea: Bool = false

    var leftSideDuration: TimeInterval = 0.3
    var rightSideDuration: TimeInterval = 0.3

    /// `swipeTriggerX` 触摸屏幕打开菜单的触摸区域
    var swipeTriggerX: CGFloat = 30

    /// 是否显示左侧的侧拉菜单
    @Binding var showLeftMenu: Bool
    /// 是否显示右侧拉菜单
    @Binding var showRightMenu: Bool

    /// 左侧菜单偏移x坐标
    @State private var leftOffsetX: CGFloat = 0
    /// 右侧菜单偏移x坐标
    @State private var rightOffsetX: CGFloat = 0

    /// 左侧拖曳时的坐标标记
    @State private var lastLeftOffsetX: CGFloat = 0
    /// 右侧拖曳时的坐标标记
    @State private var lastRightOffsetX: CGFloat = 0

    /// 主内容
    @ViewBuilder var content: (UIEdgeInsets) -> Content

    /// 左侧的侧拉菜单
    @ViewBuilder var leftMenuVeiw: (UIEdgeInsets) -> LeftMenuView

    /// 右侧的侧拉菜单
    @ViewBuilder var rightMenuView: (UIEdgeInsets) -> RightMenuView

    /// `leftBackground` 左背景
    @ViewBuilder var leftBackground: LeftBackground

    /// `rightBackground` 右背景
    @ViewBuilder var rightBackground: RightBackground

    /// `leftProgress` 左侧进度
    @State private var leftProgress: CGFloat = 0
    /// `rightProgress` 右侧进度
    @State private var rightProgress: CGFloat = 0

    /// `isDragging` 标记是否是拖曳的状态
    @GestureState private var isDragging: Bool = false

    /// 标记左菜单正在拖动
    @State private var isLeftDragging: Bool = false
    /// 标记右菜单正在拖动
    @State private var isRightDragging: Bool = false

    /// 当前拖动的起始位置
    @State private var dragStartLocation: CGPoint = .zero

    @State private var contentSize: CGSize = .zero
    @State private var safeAreaInsets: UIEdgeInsets = .zero

    var body: some View {
        GeometryReader { geometry in

            Color.clear.onAppear {
                print(
                    "inset = \(geometry.safeAreaInsets) size = \(geometry.size)"
                )
            }
            let size = geometry.size
            let safeArea = geometry.safeAreaInsets.toUIEdgeInsets()

            ZStack {
                // 主内容层（最底层，保持不动）
                GeometryReader { area in
                    content(safeArea)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)

                // 遮罩层（点击关闭菜单）
                if leftProgress > 0 || rightProgress > 0 {
                    Rectangle()
                        .fill(
                            Color.black.opacity(
                                max(leftProgress, rightProgress) * 0.3
                            )
                        )
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .onTapGesture {
                            withAnimation(
                                .spring(
                                    response: showLeftMenu
                                        ? leftSideDuration : rightSideDuration,
                                    dampingFraction: 0.8
                                )
                            ) {
                                if showLeftMenu {
                                    hideLeftMenu()
                                }
                                if showRightMenu {
                                    hideRightMenu()
                                }
                            }
                        }
                }

                ZStack {

                    HStack(spacing: 0) {
                        GeometryReader { area in
                            leftMenuVeiw(safeArea)
                        }
                        .frame(width: leftSideMenuWidth)
                        .background(leftBackground.allowsHitTesting(false))
                        .opacity(leftProgress)

                        Spacer()
                    }
                    .offset(x: -leftSideMenuWidth + leftOffsetX)

                    HStack(spacing: 0) {
                        Spacer()

                        GeometryReader { _ in
                            rightMenuView(safeArea)
                        }
                        .frame(width: rightSideMenuWidth)
                        .background(rightBackground.allowsHitTesting(false))
                        .opacity(rightProgress)
                    }
                    .offset(x: rightSideMenuWidth + rightOffsetX)

                }.clipped()

            }.onAppear {
                contentSize = size
                safeAreaInsets = safeArea
            }.onCombinChange(
                of: geometry.size,
                initial: false,
                perform: { oldValue, newValue in
                    contentSize = newValue
                }
            ).onCombinChange(
                of: geometry.safeAreaInsets,
                perform: { oldValue, newValue in
                    safeAreaInsets = newValue.toUIEdgeInsets()
                }
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(0.01)
            .modifier(
                IgnoreSafeAreaModifier(shouldIgnore: shouldIgnoreSafeArea)
            ).simultaneousGesture(dragGesture)

        }.onCombinChange(of: showLeftMenu, initial: false) {
            oldValue,
            newValue in
            withAnimation(
                .spring(
                    response: leftSideDuration,
                    dampingFraction: 0.8
                )
            ) {
                if newValue {
                    showLeftSideBar()
                } else {
                    hideLeftMenu()
                }
            }
        }.onCombinChange(of: showRightMenu, initial: false) {
            oldValue,
            newValue in
            withAnimation(
                .spring(
                    response: rightSideDuration,
                    dampingFraction: 0.8
                )
            ) {
                if newValue {
                    showRightSideBar()
                } else {
                    hideRightMenu()
                }
            }
        }
    }

    var dragGesture: some Gesture {
        DragGesture()
            .updating($isDragging) { _, out, _ in
                out = true
            }
            .onChanged { value in
                handleDragChanged(value)
            }
            .onEnded { value in
                handleDragEnded(value)
            }
    }

    func handleDragChanged(_ value: DragGesture.Value) {
        // 记录拖动起始位置
        if !isLeftDragging && !isRightDragging {
            dragStartLocation = value.startLocation
        }

        // 使用实际的内容宽度，考虑安全区域
        let effectiveWidth = contentSize.width
        let leftSafeArea = safeAreaInsets.left
        let rightSafeArea = safeAreaInsets.right

        let leftTriggerArea = leftSafeArea + swipeTriggerX
        let rightTriggerArea = effectiveWidth - rightSafeArea - swipeTriggerX

        if showRightMenu && showLeftMenu {
            let canDragLeft = value.translation.width < 0
            if canDragLeft {
                isLeftDragging = true

                let translationX = value.translation.width

                if showLeftMenu {
                    // 菜单已打开，允许向左拖动关闭
                    let newOffset = leftSideMenuWidth + translationX
                    leftOffsetX = max(0, min(newOffset, leftSideMenuWidth))
                } else {
                    // 菜单未打开，允许向右拖动打开
                    leftOffsetX = max(0, min(translationX, leftSideMenuWidth))
                }

                calculateLeftProgress()
            }

            let canDragRight = value.translation.width > 0

            if canDragRight {
                isRightDragging = true

                let translationX = value.translation.width

                if showRightMenu {
                    // 菜单已打开，允许向右拖动关闭
                    let newOffset = -rightSideMenuWidth + translationX
                    rightOffsetX = min(0, max(newOffset, -rightSideMenuWidth))
                } else {
                    // 菜单未打开，允许向左拖动打开
                    rightOffsetX = min(
                        0,
                        max(translationX, -rightSideMenuWidth)
                    )
                }

                calculateRightProgress()
            }

        } else {
            // 判断是否在左侧边缘区域开始拖动，或者左侧菜单已经打开
            let isInLeftTriggerArea = value.startLocation.x < leftTriggerArea
            let canDragLeft =
                (isInLeftTriggerArea || showLeftMenu) && !isRightDragging
                && !showRightMenu

            if canDragLeft {
                isLeftDragging = true

                let translationX = value.translation.width

                if showLeftMenu {
                    // 菜单已打开，允许向左拖动关闭
                    let newOffset = leftSideMenuWidth + translationX
                    leftOffsetX = max(0, min(newOffset, leftSideMenuWidth))
                } else {
                    // 菜单未打开，允许向右拖动打开
                    leftOffsetX = max(0, min(translationX, leftSideMenuWidth))
                }

                calculateLeftProgress()
            }

            // 判断是否在右侧边缘区域开始拖动，或者右侧菜单已经打开
            let isInRightTriggerArea = value.startLocation.x > rightTriggerArea
            let canDragRight =
                (isInRightTriggerArea || showRightMenu) && !isLeftDragging
                && !showLeftMenu

            if canDragRight {
                isRightDragging = true

                let translationX = value.translation.width

                if showRightMenu {
                    // 菜单已打开，允许向右拖动关闭
                    let newOffset = -rightSideMenuWidth + translationX
                    rightOffsetX = min(0, max(newOffset, -rightSideMenuWidth))
                } else {
                    // 菜单未打开，允许向左拖动打开
                    rightOffsetX = min(
                        0,
                        max(translationX, -rightSideMenuWidth)
                    )
                }

                calculateRightProgress()
            }
        }

    }

    func handleDragEnded(_ value: DragGesture.Value) {
        let velocityX = value.velocity.width / 8

        // 处理左侧菜单
        if isLeftDragging {
            withAnimation(
                .spring(response: leftSideDuration, dampingFraction: 0.8)
            ) {
                let total = velocityX + leftOffsetX

                if showLeftMenu {
                    // 如果菜单已打开，判断是否应该关闭
                    if total < leftSideMenuWidth * 0.7 || velocityX < -50 {
                        hideLeftMenu()
                    } else {
                        showLeftSideBar()
                    }
                } else {
                    // 如果菜单未打开，判断是否应该打开
                    if total > leftSideMenuWidth * 0.3 || velocityX > 50 {
                        showLeftSideBar()
                    } else {
                        hideLeftMenu()
                    }
                }
            }
            isLeftDragging = false
        }

        // 处理右侧菜单
        if isRightDragging {
            withAnimation(
                .spring(response: rightSideDuration, dampingFraction: 0.8)
            ) {
                let total = velocityX + rightOffsetX

                if showRightMenu {
                    // 如果菜单已打开，判断是否应该关闭
                    if total > -rightSideMenuWidth * 0.7 || velocityX > 50 {
                        hideRightMenu()
                    } else {
                        showRightSideBar()
                    }
                } else {
                    // 如果菜单未打开，判断是否应该打开
                    if total < -rightSideMenuWidth * 0.3 || velocityX < -50 {
                        showRightSideBar()
                    } else {
                        hideRightMenu()
                    }
                }
            }
            isRightDragging = false
        }
    }

    func showLeftSideBar() {
        leftOffsetX = leftSideMenuWidth
        lastLeftOffsetX = leftOffsetX
        showLeftMenu = true
        calculateLeftProgress()
    }

    func showRightSideBar() {
        rightOffsetX = -rightSideMenuWidth
        lastRightOffsetX = rightOffsetX
        showRightMenu = true
        calculateRightProgress()
    }

    func hideLeftMenu() {
        leftOffsetX = 0
        lastLeftOffsetX = 0
        showLeftMenu = false
        calculateLeftProgress()
    }

    func hideRightMenu() {
        rightOffsetX = 0
        lastRightOffsetX = 0
        showRightMenu = false
        calculateRightProgress()
    }

    func calculateLeftProgress() {
        leftProgress = max(min(leftOffsetX / leftSideMenuWidth, 1.0), 0.0)
    }

    func calculateRightProgress() {
        rightProgress = max(
            min(abs(rightOffsetX) / rightSideMenuWidth, 1.0),
            0.0
        )
    }
}

private struct IgnoreSafeAreaModifier: ViewModifier {

    let shouldIgnore: Bool

    func body(content: Content) -> some View {
        if shouldIgnore {
            content.ignoresSafeArea()
        } else {
            content
        }
    }

}

private struct OnChange<T: Equatable>: ViewModifier {

    let value: T
    let initial: Bool
    let action: (T, T) -> Void

    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.onChange(
                of: value,
                initial: initial,
                { oldValue, newValue in
                    action(oldValue, newValue)
                }
            )
        } else {
            content.onChange(
                of: value,
                perform: { newValue in
                    action(value, newValue)
                }
            )
        }
    }

}

extension View {
    func onCombinChange<T: Equatable>(
        of value: T,
        initial: Bool = false,
        perform: @escaping (T, T) -> Void
    ) -> some View {
        modifier(
            OnChange(value: value, initial: initial, action: perform)
        )
    }
}

extension EdgeInsets {
    func toUIEdgeInsets() -> UIEdgeInsets {
        return UIEdgeInsets(
            top: self.top,
            left: self.leading,
            bottom: self.bottom,
            right: self.trailing
        )
    }
}

extension UIEdgeInsets {
    func toEdgeInsets() -> EdgeInsets {
        return EdgeInsets(
            top: self.top,
            leading: self.left,
            bottom: self.bottom,
            trailing: self.right
        )
    }
}

```