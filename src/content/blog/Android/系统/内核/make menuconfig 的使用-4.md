---
title: "make menuconfig 的使用-4"
description: "make menuconfig 的使用-4 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# make menuconfig 的使用

## 1.怎么进入到make menuconfig图形化界面?

首先进入到内核源码的路径下，然后输入make menuconfig即可打开这个界面。

## 2.make menuconfig图形化界面的操作。

### 1. 搜索功能

输入""/""即可弹出搜索界面，然后输入我们想要搜索的内容即可。

### 2. 配置驱动的状态。

(1）把驱动编译编译成模块，用M来表示

(2）把驱动编译到内核里面，用*来表示

(3）不编译，我们可以使用“空格”按键来配置这三种不同的状态。

### 3. 退出

退出分为保存退出和不保存退出。

### 4. 和make menuconfig有关的文件

- Makefile: 里面是编译规则，告诉我们在make的时候要怎么编译，相当于菜的做饭。
- Kconfig:   内核配置的选项，相当于我们去饭店吃饭服务员给我的菜单
- .config:    配置完内核以后生成的配置选项，相当于我们点完的菜。

### 5.make menuconfig会读取哪个目录下的Kconfig文件。

- Arch/$ARCH/目录下的Kconfig。
- /arch/arm/configs#下面有好多的配置文件。相当于这个饭店的特色菜。

### 6.为什么要复制成.config而不复制成其他文件呢?

- 肯定是不行的，因为内核会默认读取Linux内核根目录下的.config作为默认的配置选 项，所以我们不能给他改名字

  工


### 7.我们复制的这个默认的配置选项不符合我们的要求怎么办?

- 我们要就要点菜，菜单是Kconfig，通过make menuconfig来调出这个菜单了。配 置完成以后会自动更新到.config里面.

### 8怎么和Makefile文件建立的关系呢?

- 当我们make menuconfig保存退出以后，Linux会将所有的配置选项以宏定义的形 式保存在include/generated/下面的autoconf.h里面.