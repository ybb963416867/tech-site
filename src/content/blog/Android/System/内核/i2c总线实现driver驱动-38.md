---
title: "i2c总线实现driver驱动-38"
description: "i2c总线实现driver驱动-38 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# i2c总线实现driver驱动

然后我们再来看driver部分。不管是使用设备树还是非设备树，driver部分就比较复杂了。和注册一个杂项设备或者是字符设备的套路一样，我们也是要先定一个一个i2c_driver的结构体，然后在对他进行初始化，我们来看一下这个结构体的定义，如下图所示:;

```
struct i2c_driver {
	unsigned int class;

	/* Notifies the driver that a new bus has appeared. You should avoid
	 * using this, it will be removed in a near future.
	 */
	int (*attach_adapter)(struct i2c_adapter *) __deprecated;

	/* Standard driver model interfaces */
	int (*probe)(struct i2c_client *, const struct i2c_device_id *);
	int (*remove)(struct i2c_client *);

	/* driver model interfaces that don't relate to enumeration  */
	void (*shutdown)(struct i2c_client *);

	/* Alert callback, for example for the SMBus alert protocol.
	 * The format and meaning of the data value depends on the protocol.
	 * For the SMBus alert protocol, there is a single bit of data passed
	 * as the alert response's low bit ("event flag").
	 */
	void (*alert)(struct i2c_client *, unsigned int data);

	/* a ioctl like command that can be used to perform specific functions
	 * with the device.
	 */
	int (*command)(struct i2c_client *client, unsigned int cmd, void *arg);

	struct device_driver driver;
	const struct i2c_device_id *id_table;

	/* Device detection callback for automatic device creation */
	int (*detect)(struct i2c_client *, struct i2c_board_info *);
	const unsigned short *address_list;
	struct list_head clients;
};
```

在驱动注册之前i2c_driver 结构体需要被正确地初始化，有4个成员要求必须被初始化，其中 id_table不管用不用设备树都要被初始化，否则不能匹配成功:

```
static struct i2c_driver xx_driver ={
    .driver = {
    	.name = "xxox",
    },
    .probe = xoox_probe,
    .remove = xxx_remove,
    .id_table = xxx_table,
};
```

------

- 初始化完成以后就是把i2c_driver注册进内核，注册进内核我们使用是的是i2c_add_driver:

- i2c_add_driver函数

**作用:**

注册一个i2c 驱动

**函数原型:**

```
#define i2c_add_driver(driver)  i2c_register_driver(THIS_MODULE,driver)
```

**参数:**

- struct i2c_driver的指针。
- 返回值:失败返回负值

------

- i2c_del_driver函数

**作用:**

删除一个i2c驱动

**函数原型:**

```
extern void i2c_del_driver(struct i2c_driver*);
```

**参数:**

- struct i2c_driver的指针。
- 返回值:失败返回负值

**通过make menuconfig 卸载系统驱动FT5X0X**

> device-drivers >> input device support >> Touchscreens >> FT5X0X


**代码**

- dirver.c

```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/i2c.h>


struct of_device_id  ft5x06_id[] = {
    {.compatible = "edt,ft5x0x_ts", 0},
    {.compatible = "edt,ft5x0x_ts", 0},
    {.compatible = "edt,ft5x0x_ts", 0},
    {}
};

struct i2c_device_id  ft5x06_id_ts[] = {
    {"xxxxx", 0},
    {},
};

int ft5x06_probe(struct i2c_client *i2c_client, const struct i2c_device_id *id){

    printk("this is  ft5x06_probe \n ");

    return 0;
}

int ft5x06_remove(struct i2c_client *i2c_client){
    printk("ft5x06_remove \n ");
    return 0;
}


static struct i2c_driver ft5x06_driver = {
    .probe = ft5x06_probe,
    .remove = ft5x06_remove,
    .id_table = ft5x06_id_ts,
    .driver = {
        .owner = THIS_MODULE,
        .name = "ft5x06_test",
        .of_match_table = ft5x06_id,
    },
};


static int ft5x06_driver_init(void){

    int ret;

    printk("ft5x06_driver_init \n");

    ret = i2c_add_driver(&ft5x06_driver);
    if (ret < 0)
    {
        printk("i2c_add_driver is error \n ");
        return  ret ;
    }

    printk("i2c_add_driver is success \n");

    return 0;

}

static void ft5x06_driver_exit(void){

    printk("ft5x06_driver_exit \n");
    i2c_del_driver(&ft5x06_driver);

}

module_init(ft5x06_driver_init);
module_exit(ft5x06_driver_exit);
MODULE_LICENSE("GPL");
```