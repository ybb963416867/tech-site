---
title: "Linux三大设备驱动-6"
description: "Linux三大设备驱动-6 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# Linux三大设备驱动

- 字符设备:I0的传输过程是以字符为单位的，没有缓冲。比如I2C,SPI都是字符设备 
- 块设备:I0的传输过程是以块为单位的。根存储相关的，都属于块设备，比如，f卡 
- 网络设备:与前俩个不一样，是以socket套接字来访问的。

## 1.杂项设备驱动是属于我们这三大设备驱动里面的哪个呢? 

- 杂项设备是字符设备的一种。可以自动生成设备节点。
- 我们的系统里面有很多杂项设备。我们可以输入cat/proc/misc命令来查看。

## 2.杂项设备除了比字符设备代码简单，还有别的区别吗?

- 杂项设备的主设备号是相同的，均为10，次设备号是不同的。主设设备号相同就可以节 省内核的资源。

## 3.主设备号和次设备号是什么?

- 设备号包含主设备号和次设备号，主设备号在Linux系统里面是唯一的，次设备号不一定 唯一。
- 设备号是计算机识别设备的一种方式，主设备相同的就被视为同一类设备
- 主设备号可以比做成电话号码的区号。比如北京的区号是010
- 次设备号可以比作成电话号码。	工
- 主设备号可以通过命令cat/proc/devices来查看|

## 4杂项设备的描述

定义在内核源码路径:include/linux/miscdevice.h

```
struct miscdevice {

int minor;//次设备号

const char *name;//设备节点的名字

const struct file operations *fops;//文件操作集

struct list head list;

struct device *parent;

struct device *this device;

const struct attribute_group **groups;

const char *nodename;

umode t mode;

};
```

- (1)填充miscdevice这个结构体
- (2)填充file_operations这个结构体



```
struct const file_operation xx_fops ={

.owner = THIS MODULE

};

struct miscdevice xx dev = {

.minor = MISC DYNAMIC MINOR,

.name = "xxx"

.fops = xx fops

};

static int xxninit()

intret;

ret = misc_register(&xx_dev);

if(ret<0)

printk("misc register error\n");

return -l;

return0;

void xxx_exit()

{

}

misc_deregister(&xx_dev);
```

