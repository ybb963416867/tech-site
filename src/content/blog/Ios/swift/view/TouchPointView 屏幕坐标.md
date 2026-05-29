---
title: "TouchPointView 屏幕坐标"
description: "TouchPointView 屏幕坐标 的技术笔记。"
pubDate: 2026-05-29
category: "view"
tags: [Swift]
draft: false
---
```

//
//  TouchPointView.swift
//  AnimatedMenu
//
//  Created by yunshen on 2025/2/28.
//

import SwiftUI

public struct TouchPointView: View {
    public init() {}
    @State private var touchLocation: CGPoint = .zero
    @State private var circleLocation: CGPoint = .zero

    @State private var safeLeft: Int = 0
    @State private var safeTop: Int = 0
    @State private var safeRight: Int = 0
    @State private var safeBottom: Int = 0

    @State private var rectangleWidth: CGFloat = 0
    @State private var rectangleHeight: CGFloat = 0

    let safeArea =
        (UIApplication.shared.connectedScenes.first as? UIWindowScene)?
        .keyWindow?.safeAreaInsets ?? .zero

    public var body: some View {
        GeometryReader { geometry in

            ZStack {
                // 背景区域，用于捕获触摸事件
                Color.white.opacity(0.01)
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { value in

                                safeLeft = Int(safeArea.left)
                                safeTop = Int(safeArea.top)
                                safeRight = Int(safeArea.right)
                                safeBottom = Int(safeArea.bottom)

                                var touchX: CGFloat = 0
                                var touchY: CGFloat = 0

                                if UIDevice.current.orientation.isPortrait {
                                    touchX =
                                        value.location.x
                                        - geometry.safeAreaInsets.leading
                                    touchY =
                                        value.location.y
                                        - geometry.safeAreaInsets.top
                                    
                                    rectangleWidth = geometry.size.width
                                    rectangleHeight = geometry.size.height

                                } else {
                                    touchX =
                                        value.location.x
                                        - geometry.safeAreaInsets.leading
                                    touchY =
                                        value.location.y
                                        - geometry.safeAreaInsets.top
                                    
                                    rectangleWidth = geometry.size.width
                                    rectangleHeight = geometry.size.height
                                }

                                touchLocation = CGPoint(
                                    x: value.location.x, y: value.location.y)

                                circleLocation = CGPoint(x: touchX, y: touchY)

                                print(
                                    "width = \(Int(UIScreen.main.bounds.width)) height = \(Int(UIScreen.main.bounds.height)) width2: \(geometry.size.width) heght2: = \(geometry.size.height)"
                                )

                                print(
                                    "safeArea = \(safeArea) touchX = \(value.location.x)  touchY = \(value.location.y) b = \(geometry.safeAreaInsets)"
                                )

                            }
                    )
                    .ignoresSafeArea()

                // 显示触摸点的坐标
                VStack(alignment: .center) {
                    Text(
                        "x:\(Int(touchLocation.x)),y:\(Int(touchLocation.y)),l:\(safeLeft),t:\(safeTop),r:\(safeRight),b:\(safeBottom),w:\(Int(UIScreen.main.bounds.width)),h:\(Int(UIScreen.main.bounds.height))"
                    )
                    .font(.headline)

                    .padding()
                    .background(Color.black.opacity(0.1))
                    .foregroundColor(.black)
                    .cornerRadius(8)
                    .padding(.top, 0)

                }

                // 圆形指示器
                Circle()
                    .fill(Color.red)
                    .frame(width: 5, height: 5)
                    .position(CGPoint(x: circleLocation.x, y: circleLocation.y))

                Rectangle().fill(Color.black.opacity(0.2)).frame(
                    width: rectangleWidth,
                    height: rectangleHeight
                )
                .position(
                    x: CGFloat(0)
                        + rectangleWidth / 2,
                    y: CGFloat(0)
                        + rectangleHeight / 2
                )
                .allowsHitTesting(false)
            }
        }
    }
}

```

