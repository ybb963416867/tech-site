---
title: "pinctl和gpio子系统（二）- 23"
description: "pinctl和gpio子系统（二）- 23 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [API]
draft: false
---
# pinctl和gpio子系统（二）

​        Linux内核提供了pinctrl子系统和 gpio子系统用于GPIO驱动，当然 pinctrl子系统负责的就不仅仅是 GPIO 的驱动了而是所有 pin脚的配置。pinctrl子系统是随着设备树的加入而加入的，依赖于设备树。GPIO子系统在之前的内核中也是存在的，但是 pinctrl子系统的加入GPIO子系统也是有很大的改变。
​        在以前的内核版本中，如果要配置GPIO 的话一般要使用SOC厂家实现的配置函数，例如三星的配置函s3c_gpio_cfgpin 等，这样带来的问题就是各家有各家的接口函数与实现方式，不但内核的代码复用率低而且开发者很难记住这么多的函数，如果要使用多种平台的话背函数都是很麻烦的，所以在引入设备树后对GPIO子系统进行了大的改造，使用设备树来实现并提供统一的接口。通过GPIO子系统功能主要实现引脚功能的配置，如设置为GPIO，特殊功能，GPIO的方向，设置为中断等。

## 设备树pinctrl和gpio子系统描述一个 gpio。

- 设备树使用pinctrl和 gpio子系统描述一个 gpio

```
test1:test{
	#address-cells =<1>;
	#size-cells = <1>;
	compatible = "test";
	reg =<0x20ac000 Ox0000004>;
	pinctrl-names = "default";
	pinctrl-0 =<&pinctrl_test>;I
	test-gpio =<&gpio1 3 GPIO_ACTIVE_LOW>;
};
```

## 常用gpio子系统提供的api函数

- gpio_request函数

**作用:**

- gpio_request函数用于申请一个GPIO管脚函数原型:

```
#include <linux/gpio.h>
int gpio_request(unsigned gpio, const char *label)
```

**参数:**

- gpio:  要申请的 gpio标号，使用of_get_named_gpio函数从设备树获取指定GPIO属性信息，此函数会返回这个GPIO的标号。
- label:  给gpio设置个名字。
- 返回值:  0，申请成功;负值，申请失败。

------

- of_get_named_gpio函数

**作用:**

此函数获取GPIO编号，因为Linux内核中关于GPIO的API函数都要使用GPIO编号，此函数会将设备树中类似<&gpio1 3 GPIO_ACTIVE_LOW>的属性信息转换为对应的GPIO 编号，函数原型如下:

```
#include <linux/of_gpio.h>
int of_get_named _gpio(struct device_node *np,const char *propname,int index)_
```

**参数:**

- np:设备节点。
- propname:包含要获取GPIO信息的属性名。
- index:因为一个属性里面可能包含多个GPIO，此参数指定要获取哪个GPIO的编号，如果只有一个GPIO信息的话此参数为0。
- 返回值:   成功返回到的GPIO编号，失败返回一个负数。

------

- gpio_free函数

**作用:**

如果不使用某个GPIO 了，那么就可以调用gpio_free函数进行释放。

**函数原型:**

```
#include <linux/gpio.h>
void gpio_free(unsigned gpio)
```

**参数:**

- gpio:要释放的gpio标号。
- 返回值:无。

------

- gpio_direction_input函数

**作用:**

此函数用于设置某个GPIO 为输入

**函数原型:**

```
#include <linux/gpio.h>
int gpio_ direction_input(unsigned gpio)
```

**参数:**

- gpio:要设置为输入的 GPIO标号。
- 返回值:设置成功返回0;设置失败返回负值

------

- gpio_direction_output函数

**作用:**

此函数用于设置某个GPIO为输出，并且设置默认输出值

**函数原型:**

```
#include <linux/gpio.h>
int gpio_direction_output(unsigned gpio, int value)
```

**参数:**

- gpio:要设置为输出的 GPIO标号。value: GPIO 默认输出值。
- 返回值:设置成功返回0;设置失败返回负值

------

- gpio_get_value函数

**作用:**
此函数用于获取某个GPIO 的值(0或1)

**函数原型:**

```
#include <linux/gpio.h>
int_ gpio get_value(unsigned gpio)
```

**参数:**

- gpio:要获取的 GPIO标号。
- 返回值:成功返回GPIO值，失败返回负值。

------

- gpio_set_value函数

**作用:**
此函数用于设置某个GPIO 的值

**函数原型:**

```
#include <linux/gpio.h>
void gpio_set_value(unsigned gpio, int value)
```

**参数:**

- gpio:要设置的 GPIO标号。value:要设置的值。
- 返回值:无
