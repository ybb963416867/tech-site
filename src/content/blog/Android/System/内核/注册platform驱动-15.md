---
title: "注册platform驱动-15"
description: "注册platform驱动-15 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Array]
draft: false
---
# 注册platform驱动

## 编写driver.c 的思路

首先定义一个platform_driver结构体变量，然后去实现结构体中的各个成员变量，那么当我们的driver和device 匹配成功的时候，就会执行 probe函数，所以匹配成功以后的重点就在于probe函数的编写。

```
struct platform_driver {
	//当driver和device匹配成功的时候，就会执行probe函数
	int (*probe)(struct platform_device *);
	//当driver和device任意一个remove的时候，就会执行这个函数
	int (*remove)(struct platform_device *);
	//当设备收到shutdown 命令的时候，就会执行这个函数
	void (*shutdown)(struct platform_device *);
	//当设备收到suspend命令的时候，就会执行这个函数
	int (*suspend)(struct platform_device *, pm_message_t state);
	//当设备收到resume命令的时候，就会执行这个函数
	int (*resume)(struct platform_device *);
	struct device_driver driver;
	//id_table 的匹配名字的优先级高于device_driver
	const struct platform_device_id *id_table!
};
```



```
struct device_driver {
	//这个是我们匹配设备时候用到的名字
	const char*name;
	struct module  *owner;
);
```

### driver 的注册

```
#define platform_driver_register(drv) 
	__platform_driver_register(drv, THIS_MODULE)
extern int __platform_driver_register(struct platform_driver *,
					struct module *);
```

**参数**

- drv platform_driver 地址
- 返回值 大于0成功 小于0失败

### driver 的卸载

```
extern void platform_driver_unregister(struct platform_driver *);
```
**参数**

- drv platform_driver 地址

**当安装号驱动匹配成功后会显示**

```
rk3399_mid:/storage/F0E9-334E # insmod device1.ko
[ 6668.634647] hello world enter
rk3399_mid:/storage/F0E9-334E # insmod driver1.ko
[ 6672.593785] hello world enter
[ 6672.594082] beep_probe 匹配成功了
[ 66rk3399_mid:/storag7e/F0E9-334E # 2.594105] 123: probe of beep_test failed with error 27
[ 6672.594359] platform_driver_register ok

```
**代码**
- driver1.c
```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/platform_device.h>


int beep_probe(struct platform_device *pdev){

    printk("beep_probe 匹配成功了 \n");

}

int beep_remove(struct platform_device *pdev){
    printk("beep_remove \n");
}

const struct platform_device_id  beep_idtable = {
    .name = "beep_test"
};

struct platform_driver beep_device =
{
    .probe = beep_probe,
    .remove = beep_remove,
    .driver = {
        .name = "123",
        .owner = THIS_MODULE
    },
    .id_table = &beep_idtable
};

static int beep_driver_init(void){
    printk(KERN_EMERG "hello world enter \n");
    int ret = 0;
    ret = platform_driver_register(&beep_device);
    if (ret < 0)
    {
        printk("platform_driver_register 失败\n");
    }

    printk("platform_driver_register ok\n");
    
    return 0;
}

static void beep_driver_exit(void){
    printk(KERN_EMERG "hello world exit! \n");
    platform_driver_unregister(&beep_device);
}

module_init(beep_driver_init);
module_exit(beep_driver_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("LIYU");
```

- device1.c

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

