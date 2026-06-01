---
title: "flutter 自定义控件之RenderObejct"
description: "RenderObject就是渲染树中的一个对象，负责布局及绘制。它有一个父级，并有一个名为parentData的插槽，其中父级RenderObject可以存储特定于子级的数据，例如子级位置。RenderObject类也实现了基本的布局..."
pubDate: 2026-06-01
category: "Flutter"
tags: [API]
draft: false
---
# 自定义控件之RenderObejct

RenderObject就是渲染树中的一个对象，负责布局及绘制。它有一个父级，并有一个名为parentData的插槽，其中父级RenderObject可以存储特定于子级的数据，例如子级位置。RenderObject类也实现了基本的布局和绘制协议。但是，RenderObject类没有定义子模型（例如，节点是否有零个，一个或多个子节点）。它也没有定义坐标系（例如，子级是否位于笛卡尔坐标系，极坐标系等）或特定的布局协议（例如布局是宽度高度还是尺寸约束或者父级在子级布置之前还是之后设置子级的大小和位置等;或者确实是否允许子级读取他们父级的parentData插槽）

## 子类
- RenderBox
> 采用2D笛卡尔坐标系中的渲染对象。它实现了一个内在的尺寸调整协议，它允许您在没有完全铺设的情况下测量一个子级，以这样的方式，如果该子级改变了尺寸，父级将再次布置（考虑到子级的新尺寸）。若对坐标系统没有限制，可直接继承它来实现自定义RenderObject。
- DebugOverflowIndicatorMixin
> 用于在 debug 下提示绘制是否溢出，该类仅用于 debug，自定义控件时一般用不到。
- RenderSliver
> 在视图中实现滚动效果的渲染对象的基类。Sliver有细片、薄片之意，在Flutter中，Sliver通常指可滚动组件子元素（就像一个个薄片一样）。只有当Sliver出现在视口中时才会去构建它，这种模型也称为“基于Sliver的延迟构建模型”。
RenderViewport有一组子Sliver。每个Sliver(字面意思是视图内容的一部分)依次排列，覆盖过程中的视图(每个Sliver每次都被放置，包括那些由于“滚动”或超出了视图端口的末端而没有区段的Sliver。)。而RenderSliver则控制着Sliver的绘制渲染。

- RenderView
>The root of the render tree.渲染对象树的根。它有单独的子级，它必须是一个RenderBox。因此，如果你想在渲染树中有一个自定义的RenderObject子类，你有两种选择：你可能需要替换RenderView本身，或者你需要一个RenderBox作为它的子类

- RenderAbstractViewport
> An interface for render objects that are bigger on the inside.内部较大的渲染对象的界面。某些渲染对象（如RenderViewport）显示其内容的一部分，可以通过ViewportOffset进行控制。这个接口允许框架识别这些呈现对象并与它们交互，而不需要了解所有不同类型的视图。主要处理滑动相关控件的展示。

- ContainerRenderObjectMixin
> 用于为有多个 child 的 RenderObject 提供 child 管理模型。 RenderBox 都混入了他们，省去了自己管理 child 的代码。
- RelayoutWhenSystemFontsChangeMixin
- RenderObjectWithChildMixin
> 用于为只有 1 个 child 的 RenderObject 提供 child 管理模型。
- RenderProxyBox
> 除了 RenderBox 之外，还有一个类比较常用，那就是 RenderProxyBox，该类将布局绘制点击事件等方法的处理全部交由 child 来实现，可以理解为 child 的代理，具体代理了哪些方法可以参见 RenderProxyBoxMixin 的源码。
通常对一个已有的 RenderObject 做一些附加处理时会用到该类，如常见的 Opacity、DecoratedBox 等控件就是用该类实现的，它的各属性和 child 完全一致，因此我们专心处理对 child 的额外效果就可以了，避免了逻辑的拷贝。

## api 介绍
- layout(Constraints constraints, { bool parentUsesSize = false })
> layout方法需要传入两个参数，第一个为constraints，即 父节点对子节点大小的限制，该值根据父节点的布局逻辑确定。另外一个参数是 parentUsesSize，该值用于确定 relayoutBoundary，该参数表示子节点布局变化是否影响父节点，如果为true，当子节点布局发生变化时父节点都会标记为需要重新布局，如果为false，则子节点布局发生变化后不会影响父节点。调用该方法后就可以通过 size.height size.width 可以获取到控件的宽高

- performResize 和 performLayout
> RenderBox实际的测量和布局逻辑是在performResize() 和 performLayout()两个方法中， RenderBox 子类需要实现这两个方法来定制自身的布局逻辑。根据layout() 源码可以看出只有 sizedByParent 为 true 时，performResize() 才会被调用，而 performLayout() 是每次布局都会被调用的。sizedByParent 意为该节点的大小是否仅通过 parent 传给它的 constraints 就可以确定了，即该节点的大小与它自身的属性和其子节点无关，比如如果一个控件永远充满 parent 的大小，那么 sizedByParent就应该返回true，此时其大小在 performResize() 中就确定了，在后面的 performLayout() 方法中将不会再被修改了，这种情况下 performLayout() 只负责布局子节点。

> 在 performLayout() 方法中除了完成自身布局，也必须完成子节点的布局，这是因为只有父子节点全部完成后布局流程才算真正完成。所以最终的调用栈将会变成：layout() > performResize()/performLayout() > child.layout() > ... ，如此递归完成整个UI的布局。

> RenderBox子类要定制布局算法不应该重写layout()方法，因为对于任何 RenderBox 的子类来说，它的 layout 流程基本是相同的，不同之处只在具体的布局算法，而具体的布局算法子类应该通过重写performResize() 和 performLayout()两个方法来实现，他们会在layout()中被调用。

- setupParentData(covariant RenderObject child)
> 当 layout 结束后，每个节点的位置（相对于父节点的偏移）就已经确定了，RenderObject就可以根据位置信息来进行最终的绘制。但是在 layout 过程中，节点的位置信息怎么保存？对于大多数RenderBox子类来说如果子类只有一个子节点，那么子节点偏移一般都是Offset.zero ，如果有多个子节点，则每个子节点的偏移就可能不同。而子节点在父节点的偏移数据正是通过RenderObject的parentData属性来保存的。在RenderBox中，其parentData属性默认是一个BoxParentData对象，该属性只能通过父节点的setupParentData()方法来设置：

- void paint(PaintingContext context, Offset offset)
> RenderObject可以通过paint()方法来完成具体绘制逻辑，流程和布局流程相似，子类可以实现paint()方法来完成自身的绘制逻辑