---
title: "Android Google 手机刷机 （Nexus 6p刷机及root）"
description: "打开手机oem锁和开发者模式后，允许调试"
pubDate: 2026-05-29
category: "内核"
tags: [Git]
draft: false
---
# Android Google 手机刷机   （Nexus 6p刷机及root）

## 刷机准备：

打开手机oem锁和开发者模式后，允许调试

adb工具，去谷歌官网下载sdk后即可找到

Android8.1.0镜像https://developers.google.com/android/ota 寻找手机对应版本镜像如Nexus 6P，并找到对应版本。

## 刷机：

解压后文件全部拷入platform-tools目录中。

打开手机oem锁和开发者模式后，允许调试，重启进入recovery模式。

在命令行中进入platform-tools目录后运行flash-all。等待刷机完成即可。此时会全清数据，刷入新系统

## Root准备

环境与刷机要求相同。

TWRP recovery.img和Magisk包。（supersu已经过时，不支持8.0系统，即使刷入supersu也看不到超级权限管理器。只能adb解锁root）

**TWRP**：[https://twrp.me/Devices/](https://link.jianshu.com/?t=https%3A%2F%2Ftwrp.me%2FDevices%2F)  

**Magisk**：https://github.com/topjohnwu/Magisk/releases

## Root：

1.TWRP recovery.img拷入platform-tools文件夹。

Magisk的zip包拷入手机sdcard目录

2.手机进入fastboot

执行adb reboot bootloader

3.pc命令行进入platform-tools目录执行

fastboot flash rocevery <对应的twrp文件名>

4.等待完成后手机选择Recovery mode并进入

5.在twrp界面选择install，选择之前拷入的Magisk压缩包后安装。之后选择Reboot System重启即可。

## 刷机准备

将下载好的镜像解压找到如下文件

擦除所有分区

1. fastboot erase boot

2. fastboot erase system

3. fastboot erase userdata

4. fastboot erase cache

5. fastboot erase vendor

 

下载 编译生成的img

1. fastboot flash:raw boot boot.img

2. fastboot flash system system.img

3. fastboot flash userdata userdata.img

4. fastboot flash cache cache.img

5. fastboot flash vendor vendor.img

\# reboot

fastboot reboot