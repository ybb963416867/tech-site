---
title: "注册Platform设备-14"
description: "注册Platform设备-14 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Array]
draft: false
---
# 注册Platform设备

## 平台总线注册一个device

device.c里面写的是硬件资源，这里的硬件资源是指寄存器的地址，中断号，时钟等硬件资源。
在Linux内核里面，我们是用一个结构体来描述硬件资源的。

- \#include <linux/platform_device.h>

```
struct platform_device {
	//设备id，一般写-1
	int id;
	//平台总线进行匹配的时候用到的name，/sys/bus/platform/devices/name
	const char *name;
	//内嵌的device结构体
	struct device dev;
	//资源的个数
	u32 num_resources;
	//device里面的硬件资源。
	struct resource *resource;
	struct device	dev;
	};
```

```
struct resource {
	//资源的起始
	resource_size_t start;
	//资源的结束
	resource_size_t end;
	//资源的名字
	const char *name;
	//资源的类型
	unsigned long flags;
};
```

```
//IO的内存
#define IORESOURCE_IO
//表述一段物理内存
#define IORESOURCE_MEM
//表示中断
#define IORESOURCE_IRQ
```

## device的注册


```
extern int platform_device_register(struct platform_device *);
```

## device的卸载

```
extern void platform_device_unregister(struct platform_device *);
```
**代码**
- devicebee.c
```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/platform_device.h>


struct resource beep_res[] =
{
    [0] = {
        .start  = 0x20AC000,
        .end    = 0x20AC000,
        .flags  = IORESOURCE_MEM,
        .name   = "GPIO5_DR"
    }
};

void beep_release(struct device *dev){
    printk("beep_release \n");
}

struct platform_device beep_device = 
{
    .name = "beep_test",
    .id = -1,
    .resource = beep_res,
    .num_resources = ARRAY_SIZE(beep_res),
    .dev = {
        .release = beep_release
    }
};


static int deivce_init(void){
    printk(KERN_EMERG "hello world enter \n");
    int ret;
    ret = platform_device_register(&beep_device);
    return ret;
}

static void device_exit(void){
    printk(KERN_EMERG "hello world exit! \n");
    platform_device_unregister(&beep_device);
}

module_init(deivce_init);
module_exit(device_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("LIYU");
```
**安装完驱动后,执行下面的会看到对应name的设备**
```
ls /sys/bus/platform/devices
```

