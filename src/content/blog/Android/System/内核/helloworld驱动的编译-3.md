---
title: "helloworld驱动的编译-3"
description: "把驱动编译成模块，然后使用命令把驱动加载到内核里面"
pubDate: 2026-05-29
category: "内核"
tags: [Shell]
draft: false
---
# helloworld驱动的编译

## 第一种方法：

把驱动编译成模块，然后使用命令把驱动加载到内核里面

## 第二种方法:

直接把驱动编译到内核

### 第一步：先写一个Makefile

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

### 第二部：编译驱动

**编译驱动之前需要注意的问题**

1. 内核源码一定要先编译通过

2. 我们编译驱动模块用的内核源码一定要和我们开发板上运行的内核镜像是同一套

3. 看一下我们的Ubuntu 的环境是不是arm64

4. 设置环境变量

```
export CROSS_COMPILE=/Users/lianfei/firmware_android/rk3399_linux_sdk_v2.0
/prebuilts/gcc/linux-x86/aarch64/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu
/bin/aarch64-linux-gnu-
```

```
export ARCH=ARM64
```

5. 在Makefile的文件目录下执行make  命令

6. 加载驱动模块使用insmod 命令

   ```
   insmod helloworld.ko
   ```

   卸载驱动使用 rmmod

   ```
   rmmod helloworld
   ```

   安装后的驱动在  sys/module 文件目录下
   
   **代码**
   - helloworld.c
 ```
 #include <linux/init.h>
#include <linux/module.h>

static int hello_init(void){
    printk(KERN_EMERG "hello world enter");
    return 0;
}

static void hello_exit(void){
    printk(KERN_EMERG "hello world exit!");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("LIYU");
 ```