---
title: "实现自己的HAL-2 SurfaceFlinger的hal层的代码的实现"
description: "实现自己的HAL-2 SurfaceFlinger的hal层的代码的实现 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# SurfaceFlinger的hal层的代码的实现

## surfaceFlinger 简介
![在这里插入图片描述](https://img-blog.csdnimg.cn/202106081131433.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_8,color_FFFFFF,t_10#pic_center)



		每个应用程序可能对应着一个或者多个图形界面，而每个界面我们就称之为一个surface，或者说是window，在上面的图中我们能看到4个surface ,一个是home界面还有就是红、绿、蓝分别代表的3个surface，而两个button 实际是home surface里面的内容。在这里我们能看到我们进行图形显示所需要解决的问题：

- 首先每个surface在屏幕上有它的位置，以及大小，然后每个surface里面大小，位置这些元素在我们改变应用程序的时候都可能会改变。

- 然后就各个surface之间可能有重叠，比如说在上面的简略图中，绿色覆盖了蓝色，而红色又覆盖了绿色和蓝色以及下面的home，而且还具有
  一定透明度。

- SurfaceFlinger就是将系统所有需要显示的元素混合后，发送数据给显示设备方进行显示主要操作FrameBuffer和Galloc两个HAL模块
## surfaceFlinger 的hal 代码实现分析
- 代码路径Hal代码:

```
/hardware/libhardware/include/hardware/fb.h/
hardware/libhardware/include/hardware/gralloc.h
/hardware/libhardware/moudles/gralloc/
```

调用代码路径:

```
/frameworks/native/libs/ui/FramebufferNativeWindow.cpp
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210608135607900.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center)
- 头文件解析
fb主要是对应framebuffer设备的图形数据处理
gralloc主要是对应gpu的图形数据空间的申请和释放