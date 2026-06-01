---
title: "sliver 组件"
description: "在开发过程中一定会遇到一个多种类型item的长滚动列表此时需要一个滚动的组件"
pubDate: 2026-06-01
category: "Flutter"
tags: [Notes]
draft: false
---
# sliver 组件

> 在开发过程中一定会遇到一个多种类型item的长滚动列表此时需要一个滚动的组件

## 1.CustomScrollView

| **CustomScrollView参数** | **类型**               | **说明**   |
| :------------------------ | :------------------- | :------------------------- |
| physics                | ScrollPhysics | 滑动类型: BouncingScrollPhysics() 拉到最底部有回弹效 ClampingScrollPhysics() 包裹内容不会回弹 NeverScrollableScrollPhysics() 滑动禁止 |
| primary                | bool          | 当条目不足时 true可以滚动      |
| cacheExtent            | int           | 缓存条目(预加载条目)   |
| scrollDirection        | Axis          | 滚动方向: Axis.vertical Axis. horizontal  |
| slivers                | List<Widget>    | 子Widget          |
| shrinkWrap             | bool          | true反向滑动AppBar   |

> 用法

*   slivers CustomScrollView构造函数给我们提供的Sliver是一个Widget\[]，但如果我们提供一个普通的Widget，是会崩溃的。普通组件需要由 SliverToBoxAdapter 去包装。 Widget\[] 数组里面都是sliver 组件

<!---->

       class CustomScrollView extends ScrollView {
      /// Creates a [ScrollView] that creates custom scroll effects using slivers.
      ///
      /// See the [ScrollView] constructor for more details on these arguments.
      const CustomScrollView({
        super.key,
        super.scrollDirection,
        super.reverse,
        super.controller,
        super.primary,
        super.physics,
        super.scrollBehavior,
        super.shrinkWrap,
        super.center,
        super.anchor,
        super.cacheExtent,
        this.slivers = const <Widget>[],
        super.semanticChildCount,
        super.dragStartBehavior,
        super.keyboardDismissBehavior,
        super.restorationId,
        super.clipBehavior,
      });

      /// The slivers to place inside the viewport.
      final List<Widget> slivers;

      @override
      List<Widget> buildSlivers(BuildContext context) => slivers;
    }

## 2. sliver 组件

*   列表类的sliver

| **Sliver组件名称**            | **功能**            | **对应的可滚动组件**               |
| :------------------------ | :---------------- | :------------------------- |
| SliverList                | 列表                | ListView                   |
| SliverFixedExtentList     | 高度固定的列表           | ListView，指定itemExtent时     |
| SliverAnimatedList        | 添加/删除列表项可以执行动画    | AnimatedList               |
| SliverGrid                | 网格                | GridView                   |
| SliverPrototypeExtentList | 根据原型生成高度固定的列表     | ListView，指定prototypeItem 时 |
| SliverFillViewport        | 包含多个子组件，每个都可以填满屏幕 | PageView                   |
| SliverFillRemaining       | 填满剩余空间            | Scrollview                 |

*   布局和装饰用的sliver 组件

| **Sliver名称**                   | **对应 RenderBox**   |
| :----------------------------- | :----------------- |
| SliverPadding                  | Padding            |
| SliverVisibility、SliverOpacity | Visibility、Opacity |
| SliverFadeTransition           | FadeTransition     |
| SliverLayoutBuilder            | LayoutBuilder      |

*   其他常用的sliver 组件

| **Sliver名称**           | **说明**                                 |
| :--------------------- | :------------------------------------- |
| SliverAppBar           | 对应 AppBar，主要是为了在 CustomScrollView 中使用。 |
| SliverToBoxAdapter     | 一个适配器，可以将 RenderBox 适配为 Sliver，后面介绍。   |
| SliverPersistentHeader | 滑动到顶部时可以固定住，后面介绍。                      |

*   如果 CustomScrollView 有孩子也是一个完整的可滚动组件且它们的滑动方向一致，则 CustomScrollView 不能正常工作,要解决这个问题，可以使用 **NestedScrollView**

<!---->

*   SliverPrototypeExtentList 用法

> 跟SliverList用法基本一致，但是子控件的高度是由prototypeItem的控件高度决定的。构造函数如下：

      const SliverPrototypeExtentList({
        super.key,
        required super.delegate,
        required this.prototypeItem,
      }) : assert(prototypeItem != null);

*   SliverAppBar 用法

<!---->

    const SliverAppBar({
        Key key,
        this.leading,//左侧的图标或文字，多为返回箭头
        this.automaticallyImplyLeading = true,//没有leading为true的时候，默认返回箭头，没有leading且为false，则显示title
        this.title,//标题
        this.actions,//标题右侧的操作
        this.flexibleSpace,//可以理解为SliverAppBar的背景内容区
        this.bottom,//SliverAppBar的底部区
        this.elevation,//阴影
        this.forceElevated = false,//是否显示阴影
        this.backgroundColor,//背景颜色
        this.brightness,//状态栏主题，默认Brightness.dark，可选参数light
        this.iconTheme,//SliverAppBar图标主题
        this.actionsIconTheme,//action图标主题
        this.textTheme,//文字主题
        this.primary = true,//是否显示在状态栏的下面,false就会占领状态栏的高度
        this.centerTitle,//标题是否居中显示
        this.titleSpacing = NavigationToolbar.kMiddleSpacing,//标题横向间距
        this.expandedHeight,//合并的高度，默认是状态栏的高度加AppBar的高度
        this.floating = false,//滑动时是否悬浮
        this.pinned = false,//标题栏是否固定
        this.snap = false,//配合floating使用
      })

