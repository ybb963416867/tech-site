---
title: "tslib触摸校准实验-41"
description: "​ ft5x06触摸驱动添加成功后，发现触摸可能不太准确，这时可以使用一个第三方开源库tslib来调试触摸屏。下面来看一下 tslib源码如何移植。 tslib源码可以从官方地址获取: https://github.com/libts..."
pubDate: 2026-05-29
category: "内核"
tags: [Git]
draft: false
---
# tslib触摸校准实验

​		ft5x06触摸驱动添加成功后，发现触摸可能不太准确，这时可以使用一个第三方开源库tslib来调试触摸屏。下面来看一下 tslib源码如何移植。
tslib源码可以从官方地址获取: https://github.com/libts/tslib ，打开网址可以看到最新的版本是1.21。可以从官网获取，也可以从网盘资料中获取获取到 tslib源码后，拷贝到Ubuntu系统下并解压，得到 tslib-1.21文件夹。

- 编译tslibl
  获取到tslib源码后，可以编译tslib源码。具体有下面几个步骤。

  1. Ubuntu工具安装编译 tslib的时候需要先在ubuntu 中安装一些文件，防止编译tslib 过程中出错,命令如下所示:

     ```
     sudo apt-get install autoconfsudo 
     apt-get install automakesudo 
     apt-get install libtool
     ```

  2. 编译tslib
     首先创建一个 tslib文件夹，用于存放编译结果。比如文件路径为:/home/topeet/tslib然后使用下列命令配置并编译tslib: cd tslib-1.21///进入tslib源码目录

     ```
     ./configure--host=arm-none-linux-gnueabi  --prefix=/home/topeet/tslib
     ```

     **make//编译**
     make install//安装
     注意。在使用./configure配置 tslib 的时候“--host”参数指定编译器，指定的编译器要和编译文件统使用同一个编译器，否则在开发板下不能正常使用。“--prefix"参数指定编译完成以后的 tslib文件安装到哪里，这里肯定是安装到我们刚刚创建的“tslib目录下。然后将 tslib目录下的所有文件拷贝到开发板的根文件系统下。如果直接拷贝的话会出现符号链接文件不能拷贝的现象，可以先使用tar命令进行打包，然后解压到根文件系统下。命令如下:

     ```
     tar -czvf lib.tar.gz” //打包生成 lib.tar.gz 压缩包
     tar -xvf lib.tar.gz/ I/解珏到开发版根文件目录下
     ```

- 测试 tslib

当把编译好的 tslib拷贝到开发板后，进行命令测试。

1. 配置tslib
   打开/etc/ts.conf文件，找到下面这一行:module raw input
   如果上面这句前面有“#”的话就删除掉“#”。打开/etc/profile 文件，在里面加入如下内容:

```
export TSUB TSDEVICE=/devfinput/event1
export TSUB CALIBFILE-/etc/pointercal
export TSUIB CONFFILE=fetc/ts.conf
export TSUB_PLUGINDIR =/lib/ts
export TSUB_CONSOLEDEVICE-noneexport TSUB_FBDEVICE=/dev/tb0
```

- 第1行，TSLIB_TSDEVICE表示触摸设备文件，这里设置为/dev/input/event1个要根据具体情况没置，如果你的触摸设备文件为event2那么就应该设置为/dev/input/event2，以此类推。
	
- 第2行, TSLIB_CALIBFILE表示校准文件，如果进行屏幕校准的话校准结果就保存在这个文件中，这里设置校准文件为/etc/pointercal，此文件可以不存在，校		准的时候会自动生成.

- 第3行， TSLIB_CONFFILE 表示触摸配置文件，文件为/etc/ts.conf，此文件在移植tslib 的时候会生成。

- 第4行，TSLIB_PLUGINDIR 表示tslib插件目录位置，目录为/lib/ts.

- 第5行．TSLIB CONSOLEDEVICE表示控制台设置，这里不设置。因此为none