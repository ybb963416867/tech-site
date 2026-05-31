---
title: "实现自己的HAL-7 Android 系统的各个模块的单独编译"
description: "实现自己的HAL-7 Android 系统的各个模块的单独编译 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# Android 系统的各个模块的单独编译
## 在编译单独模块前，需要先将Android 源码编译通过
- 下Android 源码的根目录下会有.mk 或者 **.sh 文件，一般是.sh文件
- 然后执行 **.sh 文件 
> ./**.sh
- 执行.mk
> make
## 单独编译 system.img 镜像
> make systemimage
- 作用
  	它包含了整个Android系统，android的framework等等，会被挂接到 "/" 上，包含了系统中所有的二进制文件。（system.img是out/target.product/generic/目录下system目录的一个映射）
## system.img打包
- make systemimage  是整体编译system.img ，而 有时候我们不需要整体编译  会使用mmm 命令单独编译我们自己的模块，编译完成后可以使用下面的命令将我们自己的编译好的打包进system.img，这样会节省好多编译时间
> make snod
## 单独编译userdata.img 镜像
> make userdataimage 
- 作用
		用户镜像用来存储与用户相关的数据，一般对应的文件名是userdata.img（也可以是任何文件名，为了方便，我们将userdata称为用户镜像文件）。
这些数据大多都是有用户在使用Android设备的过程中产生的，例如，通过Google play安装的第三方APK程序，用户的配置文件等。当然，在制作ROM时，也可以将部分数据放到userdata.img中。例如，如果允许用户使用普通的方法卸载ROM内置的应用，就可以将APK文件放到userdata.img文件中 (这里是普通的应用程序，而system.img放入的是系统应用程序)。

## 单独编译ramdisk.img 镜像
> make ramdisk
- 作用
		ram disk虚拟内存盘，将ram模拟成硬盘来使用的文件系统
## 单独编译boot.img 镜像
> make bootimage
- 作用
		boot.img 将kernel、ramdisk(rootfs)、second stage(dtb、kernel.logd等)整体打包成一个boot.img文件，并将boot.img文件置于boot分区中,BootLoader启动时，会读取boot.img，将kernel、ramdisk、dtb等信息放置于固定的内存中，然后引导kernel启动。
