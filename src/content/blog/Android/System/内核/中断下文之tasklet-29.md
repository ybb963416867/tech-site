---
title: "中断下文之tasklet-29"
description: "中断下文之tasklet-29 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# 中断下文之tasklet

## tasklet相关知识点

### 什么是 tasklet?

tasklet 是中断处理中断下文常用的一种方法，**tasklet**,是一种特殊的软中断。处理中断下文的机制还有**工作队列**和**软中断**。

### 怎么使用tasklet来设计中断下文?

中断发生   》》》》   中断上文，在中断处理一些紧急的事情  》》》》  调用tasklet    》》》》 中文下文，在中断下文做比较耗时的事情

​		Linux把中断分成俩个部分，一个是上半部分，一个是下半部分，在上半部分我们只处理紧急的事情，同时可以调用tasklet来启动中断下文，比较耗时间的就要放到下文来处理，调用tasklet以后，tasklet绑定的函数并不会立马执行，而是出中断以后，经过一个很短的不确定时间在来执行。

### tasklet定义

tasklet由tasklet_struct结构表示，每个结构体单独代表一个tasklet，在<linux/interrupt.h>中定义为:

```
struct tasklet_struct
{
	struct tasklet_struct *next;
	unsigned long state;
	atomic_t count;
	void (*func)(unsigned long);
	unsigned long data;
};	
```

​												

- next:链表中的下一个 tasklet，方便管理和设置tasklet;
- state: tasklet 的状态。
- count:表示 tasklet,是否出在激活状态，如果是0，就处在激活状态，如果非0，就处在非激活状态
- void(*func)(unsigned long):结构体中的 func成员是tasklet的绑定函数,data是它唯一的参数。
- date:函数执行的时候传递的参数

## tasklet相关函数

- **tasklet schedule函数**

  作用:调度tasklet

**函数原型:**

```
void tasklet_schedule(struct tasklet struct *t)
```

**参数:**

- 指向tasklet struct结构的指针。

------

- tasklet_init函数

  作用:动态初始化 tasklet

**函数原型:**

```
void tasklet_init(struct tasklet struct *t, void(*func)(unsigned long), unsigned long data);
```

**参数:**

- *t:指向tasklet_struct结构的指针。
- func: tasklet绑定的函数。
- data:函数执行的时候传递的参数。

------

- tasklet_kill函数

功能:删除一个 tasklet

**函数原型:**

```
tasklet_kill(struct tasklet_struct*t)
```

参数:

- 指向tasklet_ struct结构的指针
- 注意:这个函数会等待tasklet 执行完毕，然后再将它移除。该函数可能会引起休眠，所以要禁止在中断上下文中使用。

------

## 使用tasklet设计中断下文步骤

- 步骤一:定义一个tasklet结构体
- 步骤二:动态初始化tasklet
- 步骤三:编写tasklet绑定的函数
- 步骤四:在中断上文调用tasklet
- 步骤五:卸载模块的时候删除tasklet

**代码点击屏幕触发**

- driver1.c
```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/platform_device.h>
#include <linux/errno.h>
#include <linux/ioport.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/io.h>
#include <linux/gpio.h>
#include <linux/of_gpio.h>
#include <linux/interrupt.h>
#include <linux/of_irq.h>

int gpio_num;
int irq = 0;
struct device_node *test_device_node;
struct property *test_node_property;
struct tasklet_struct key_tesk;


struct of_device_id of_match_table[] = {

    {.compatible = "test_keys"},
    {}

};

irq_handler_t test_key(int irq, void *args){

    printk("test_key start \n");

    tasklet_schedule(&key_tesk);
    printk("test_key end \n");

    return IRQ_HANDLED;

}

void test(unsigned long data){
    int i = data;
    while (i--)
    {
        printk("task_key long time is %d \n", i);
    }
    
}

int beep_probe(struct platform_device *pdev){

    int ret = 0;


    printk("beep_probe 匹配成功了 \n");
    test_device_node = of_find_node_by_path("/test_key");
    if (test_device_node == NULL)
    {
        printk("of_find_node_by_path is error \n");
        return -1;
    }
    
    gpio_num = of_get_named_gpio(test_device_node, "touch-gpio", 0);
    if (gpio_num < 0)
    {
        printk("of_get_named_gpio is error \n");
        return -1;
    }
    
    gpio_direction_input(gpio_num);

    
    //irq = gpio_to_irq(gpio_num);

    irq = irq_of_parse_and_map(test_device_node, 0);

    printk("irq is %d \n", irq);

    ret = request_irq(irq, test_key, IRQF_TRIGGER_RISING, "test_key", NULL);
    if (ret < 0)
    {
        printk("request_irq is error \n");
        return ret;
    }

    tasklet_init(&key_tesk, test, 100);
    

    return 0;
}

int beep_remove(struct platform_device *pdev){
    printk("beep_remove \n");
    return 0;
}

const struct platform_device_id  beep_idtable = {
    .name = "test_keys"
};

struct platform_driver beep_device =
{
    .probe = beep_probe,
    .remove = beep_remove,
    .driver = {
        .name = "123",
        .owner = THIS_MODULE,
        .of_match_table = of_match_table
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
    tasklet_kill(&key_tesk);
    free_irq(irq, NULL);
    platform_driver_unregister(&beep_device);
}

module_init(beep_driver_init);
module_exit(beep_driver_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("LIYU");
```
**设备树的代码**
**将下面的代码注释**
```
	touch-gpio = <&gpio1 20 IRQ_TYPE_EDGE_RISING>;
	interrupt-parent = <&gpio1>;
    interrupts = <20 IRQ_TYPE_LEVEL_LOW>;
```
**然后在根节点中添加下面的代码**

```
test_key {
		compatible = "test_keys";
		pinctrl-names = "default";
		pinctrl-0 = <&i2c1_xfer>;
        reg = <0x38>;
		touch-gpio = <&gpio1 20 IRQ_TYPE_EDGE_RISING>;
		interrupt-parent = <&gpio1>;
        interrupts = <20 IRQ_TYPE_LEVEL_LOW>;
	
	};
```