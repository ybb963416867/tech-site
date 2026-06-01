---
title: "flutter 自定义SingleChildRenderObjectWidget控件，以及手势处理"
description: "flutter 自定义SingleChildRenderObjectWidget控件，以及手势处理 的技术笔记。"
pubDate: 2026-06-01
category: "Flutter"
tags: [Notes]
draft: false
---
# 自定义SingleChildRenderObjectWidget控件，以及手势处理

- 处理了滑动边界
- 怎么处理手势
- HitTestBehavior 使用
    > hitTestSelf 方法的放回置用于处理事件的命中

```
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class CustomWidgetListener extends StatefulWidget {
  const CustomWidgetListener({Key? key}) : super(key: key);

  @override
  State<CustomWidgetListener> createState() => _CustomWidgetListenerState();
}

class _CustomWidgetListenerState extends State<CustomWidgetListener> {
  double left = 0;
  double top = 0;
  final _g = GlobalKey();
  final _s = GlobalKey();
  Size size = Size.zero;
  Size presentSize = Size.zero;
  var width = window.physicalSize.width / window.devicePixelRatio;

  @override
  Widget build(BuildContext context) {

    return Stack(
      key: _s,
      children: [
        Positioned(
          left: left,
          top: top,
          child: Listener(
            onPointerDown: (e) {
            },
            onPointerMove: (e) {
              size = (_g.currentContext?.findRenderObject() as RenderBox).size;
              presentSize =
                  (_s.currentContext?.findRenderObject() as RenderBox).size;
              double dx = e.delta.dx;
              double dy = e.delta.dy;
              if (left < 0) {
                dx = 0;
                left = 0;
              } else if (left > width - size.width) {
                dx = 0;
                left = width - size.width;
              } else {
                dx = e.delta.dx;
                left += dx;
              }

              if (top < 0) {
                dy = 0;
                top = 0;
              } else if (top > presentSize.height - size.height) {
                dy = 0;
                top = presentSize.height - size.height;
              } else {
                dy = e.delta.dy;
                top += dy;
              }
              setState(() {});
            },
            child: CustomCircleWidget(
              key: _g,
              behavior: HitTestBehavior.translucent,
              child: const SizedBox(
                  width: 100,
                  height: 100,
                  child: Center(
                    child: Text("aaaa"),
                  )),
            ),
          ),
        )
      ],
    );
  }
}

class CustomCircleWidget extends SingleChildRenderObjectWidget {
  final HitTestBehavior? behavior;

  const CustomCircleWidget(
      {super.key, required Widget child, required this.behavior})
      : super(child: child);

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderCustomCircleWidget(
        behavior: behavior ?? HitTestBehavior.opaque);
  }
}

class RenderCustomCircleWidget extends RenderBox
    with RenderObjectWithChildMixin {
  RenderCustomCircleWidget({
    this.behavior = HitTestBehavior.opaque,
    RenderBox? c,
  });

  HitTestBehavior behavior;

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    bool hitTarget = false;
    if (size.contains(position)) {
      hitTarget =
          hitTestChildren(result, position: position) || hitTestSelf(position);
      if (hitTarget || behavior == HitTestBehavior.translucent) {
        result.add(BoxHitTestEntry(this, position));
      }
    }
    return hitTarget;
  }

  @override
  bool hitTestSelf(Offset position) =>
      behavior == HitTestBehavior.opaque ||
      behavior == HitTestBehavior.translucent;

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties.add(EnumProperty<HitTestBehavior>('behavior', behavior,
        defaultValue: null));
  }

  var p = Paint()
    ..color = Colors.black
    ..strokeCap = StrokeCap.square
    ..strokeWidth = 5
    ..isAntiAlias = true
    ..style = PaintingStyle.stroke;

  @override
  void performLayout() {
    child?.layout(constraints, parentUsesSize: true);
    size = (child as RenderBox).size;
    super.performLayout();
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    super.paint(context, offset);
    if (child == null) return;
    context.paintChild(child!, offset);

    context.canvas.drawCircle(
        Offset(offset.dx + size.width / 2, offset.dy + size.height / 2),
        size.width / 2,
        p);
  }
}

```