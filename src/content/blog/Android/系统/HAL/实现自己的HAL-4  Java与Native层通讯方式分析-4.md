---
title: "实现自己的HAL-4 Java与Native层通讯方式分析-4"
description: "实现自己的HAL-4 Java与Native层通讯方式分析-4 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# Java与Native层通讯方式分析
## 概念:
- JNI: Java Native Interface，是JAVA标准平台中的一个重要功能，
它弥补了JAVA的与平台无关这一重大优点的不足，在JAVA实现跨平台的同时，也能与其它语言（如C、C++）的动态库进行交互，给其它语言发挥优势的机会
- 通过JNI，Java代码可以调用其他语言，其他语言也可以回调Java代码
### 通讯的3种方式
- phone  socket 模式

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210609154715173.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center)
- surfaceflinger  serivece在native层

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210609155243454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center)
- windowManagerServiece, service在java层，通过jni调用

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210609155616473.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_50#pic_center)