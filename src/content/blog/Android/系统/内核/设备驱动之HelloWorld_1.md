---
title: "设备驱动之HelloWorld_1"
description: "设备驱动之HelloWorld_1 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Shell]
draft: false
---
# 设备驱动之HelloWorld
基本流程：

写hello.c 和 Makefile文件 --->make ——> sudo insmod hello.ko———> dmesg | tail 查看打印的文字 —-> lsmod查看 ———> sudo rmmod hello

 插入模块后，/sys/module/下可以看到hello模块
 
 - #include <linux/module.h>  模块相关的操作

hello.c文件：

```c#
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/module.h>
MODULE_LICENSE("Dual BSD/GPL");
static int hello_init(void){

    printk(KERN_ALERT "Hello , World\n"); //内核空间里没有printf，用printk
    return 0;

}

static void hello_exit(void){
    printk(KERN_ALERT "Goodbye , World\n");
}

//模块的注册
module_init(hello_init);
//模块的卸载
module_exit(hello_exit);
```

Makefile文件：

```
obj-m +=helloworld.o
KOIR:=/home/topeet/ybb/android/itop-3399_8.1/kernel
PWD?=$(shell pwd)
all:
	make -C $(KOIR) M=${PWD} modules
clean:
	rm -rf *.o
	rm -rf *.ko
	rm -rf *.mod.c
	rm -rf *.symvers
	rm -rf *.order
```