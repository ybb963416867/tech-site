---
title: "FlutterFlutter原理 HitTestBehavior 介绍"
description: "![在这里插入图片描述](https://imgblog.csdnimg.cn/32891fe1033841aa9638e57365182afa.png)"
pubDate: 2026-06-01
category: "Flutter"
tags: [Notes]
draft: false
---
# HitTestBehavior 是一个枚举

```
enum HitTestBehavior {
  /// Targets that defer to their children receive events within their bounds
  /// only if one of their children is hit by the hit test.
  deferToChild,

  /// Opaque targets can be hit by hit tests, causing them to both receive
  /// events within their bounds and prevent targets visually behind them from
  /// also receiving events.
  opaque,

  /// Translucent targets both receive events within their bounds and permit
  /// targets visually behind them to also receive events.
  translucent,
}
```

- deferToChild
> deferToChild： 命中测试决定于子组件是否通过命中测试
- opaque
> 顾名思义不透明的，也就是说自己接收命中测试，但是会阻碍前兄弟节点进行命中测试
- translucent
> 顾名思义半透明，也就是说自己可以命中测试，但是不会阻碍前兄弟节点进行命中测试

## demo 测试
```
import 'package:flutter/material.dart';

class HitTestWidget extends StatefulWidget {
  const HitTestWidget({Key? key}) : super(key: key);

  @override
  State<HitTestWidget> createState() => _HitTestWidgetState();
}

class _HitTestWidgetState extends State<HitTestWidget> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Align(
          alignment: Alignment.center,
          child: hitTest(1),
        ),
        Align(
          alignment: Alignment.center,
          child: hitTest(2),
        )
      ],
    );
  }
}

Widget hitTest(int index) {
  return Listener(
    behavior: HitTestBehavior.translucent,
    onPointerDown: (e) {
      print("$index");
    },
    child: Container(
      width: index == 1 ? 150 : 50,
      height: index == 1 ? 150 : 50,
      color: index == 1 ? Colors.green : Colors.red,
    ),
  );
}

```
![在这里插入图片描述](https://img-blog.csdnimg.cn/32891fe1033841aa9638e57365182afa.png)

*   当两控件有颜色时
    > behavior 为translucent， deferToChild和 opaque 时 两控件的点击都一样，点击红色输出 2， 点击绿色输出1

*   当去掉两控件的颜色时
    > behavior 为deferToChild时，点击两控件并不会输出
    > behavior 为opaque时, 点击红色位置的控件输出2， 点击绿色位置的控件输出1
    > behavior 为translucent时，点击红色的位置的控件输出1、2， 点击绿色位置的控件输出1

## 原因

*   原因查看hittest()方法
    *   当Container 设置颜色时，真正的渲染控件为ColoredBox他的randerObject 为\_RenderColoredBox继承了RenderProxyBoxWithHitTestBehavior，所以真正处理behavior是在RenderProxyBoxWithHitTestBehavior中，RenderProxyBoxWithHitTestBehavior的hitTestSelf 方法的返回的是  behavior == HitTestBehavior.opaque;  behavior 在\_RenderColoredBox 中默认传的值为HitTestBehavior.opaque，所以Container 设置颜色后的behavior都是 HitTestBehavior.opaque，所以点击哪个控件哪个控件命中，输出对应的值
    *   当Container 不设置颜色时，
        *   behavior 为deferToChild时 他的randerObject是 ConstrainedBox，而它里面没有对点击事件做判断的地方，同时 Listener 的 RenderProxyBoxWithHitTestBehavior中只是处理了，HitTestBehavior.translucent和HitTestBehavior.opaque，故点击无响应。
        *   behavior 为opaque时，会调用 Listener 的 RenderProxyBoxWithHitTestBehavior，而RenderProxyBoxWithHitTestBehavior中的hitTestSelf 方法中返回的是  behavior == HitTestBehavior.opaque;所以 hitTestSelf方法返回true 同时在hitTest()方法中将该控件的区域加入了BoxHitTestResult中 所以命中该控件，该控件会收到点击事件，并将该事件消费掉
        *   behavior 为translucent时， 会调用 Listener 的 RenderProxyBoxWithHitTestBehavior，而RenderProxyBoxWithHitTestBehavior中的hitTestSelf 方法中返回的是  behavior == HitTestBehavior.opaque;所以 hitTestSelf方法返回false, 所以该事件没有childview 命中，没有view命中说明不会被消费，但是hitTest() 中 如果behavior == HitTestBehavior.translucent，会将点击的区域BoxHitTestEntry 加入到BoxHitTestResult 中，此时就会触发该点击区域内的所有包含该位置的Widget的事件，所以会同时收到 点击红色区域的输出2和点击绿色区域输出的1

```~dart
    class _RenderColoredBox extends RenderProxyBoxWithHitTestBehavior {
      _RenderColoredBox({ required Color color })
        : _color = color,
          super(behavior: HitTestBehavior.opaque);

      /// The fill color for this render object.
      ///
      /// This parameter must not be null.
      Color get color => _color;
      Color _color;
      ....

```

```
    abstract class RenderProxyBoxWithHitTestBehavior extends RenderProxyBox {
      /// Initializes member variables for subclasses.
      ///
      /// By default, the [behavior] is [HitTestBehavior.deferToChild].
      RenderProxyBoxWithHitTestBehavior({
        this.behavior = HitTestBehavior.deferToChild,
        RenderBox? child,
      }) : super(child);

      /// How to behave during hit testing when deciding how the hit test propagates
      /// to children and whether to consider targets behind this one.
      ///
      /// Defaults to [HitTestBehavior.deferToChild].
      ///
      /// See [HitTestBehavior] for the allowed values and their meanings.
      HitTestBehavior behavior;

      @override
      bool hitTest(BoxHitTestResult result, { required Offset position }) {
        bool hitTarget = false;
        if (size.contains(position)) {
          hitTarget = hitTestChildren(result, position: position) || hitTestSelf(position);
          if (hitTarget || behavior == HitTestBehavior.translucent) {
            result.add(BoxHitTestEntry(this, position));
          }
        }
        return hitTarget;
      }

      @override
      bool hitTestSelf(Offset position) => behavior == HitTestBehavior.opaque;
      ........
```