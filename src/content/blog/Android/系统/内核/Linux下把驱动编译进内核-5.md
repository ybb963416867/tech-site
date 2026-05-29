---
title: "Linux下把驱动编译进内核-5"
description: "Linux下把驱动编译进内核-5 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# Linux下把驱动编译进内核

## 1.source "drivers/redled/Kconfig"

- 他会包含drivers/redled/这个路径下的驱动文件，方便我们对菜单进行管理

## 2.config LED_4412

- 配置选项的名称，CONFIGLED 4412

## 3.tristate表示的驱动的状态，把驱动编译成模块，把驱动编译到内核，不编译 与之对应的还有bool分别是编译到内核，不编译

- "Led Support for GPlO Led" make menuconfig显示的名字
- A depends on B   表示只有在选择B的时候才可以选择A

## 4.比如我想直接去掉LED相关的去掉，我们直接改.config文件可以吗? 可以，但是不推荐。如果有依赖的话，直接修改.config是不成功的。

## 5.select

- 反向依赖，改选项被选中时，后面的定义也会被选中。

## 6.help

- This option enable support for led
- 帮助信息

步骤 ：

### 二. 如何添加模块到内核

实际上，我们需要做的工作可简述如下：

（1）将编写的模块或驱动源代码(比如是XXOO)复制到Linux内核源代码的相应目录。

（2）在该目录下的Kconfig文件中依葫芦画瓢的添加XXOO配置选项。

（3）在该目录的Makefile文件中依葫芦画瓢的添加XXOO编译选项。

可以看到，我们奉行的原则是“依葫芦画瓢”，主要是添加。

一般的按照上面方式又可出现两种情况，一种为给XXOO驱动添加我们自己的目录，一种是不添加目录。两种情况的处理方式有点儿不一样哦。



三. 不加自己目录的情况

（1）把我们的驱动源文件(xxoo.c)放到对应目录下，具体放到哪里需要根据驱动的类型和特点。这里假设我们放到./driver/char下。

- ​		创建hello 文件夹
- ​        将驱动helloworld.c 放到 该文件加下
- ​        然后创建Makefile文件

```
      obj-$(CONFIG_HELLO) += helloworld.o
```

- 然后创建Kconfig文件

```
config HELLO
	tristate "hello world"
	help
	hello hello
```

（2）然后我们修改./driver/char下的Kconfig文件，依葫芦添加即可，如下所示：


```
source "drivers/char/hello/Kconfig"
```

Kconfig 中添加自己的驱动模块，以方便配置

注意这里的LT_XXOO这个名字可以随便写，但需要保持这个格式，他并不需要跟驱动源文件保持一致，但最好保持一致，等下我们在修改Makefile时会用到这个名字，他将会变成CONFIG_LT_XXOO，那个名字必须与这个名字对应。如上所示，tristate定义了这个配置选项的可选项有几个，help定义了这个配置选项的帮助信息，具体更多的规则这里不讲了。

（3）然后我们修改./driver/char下的Makefile文件，如下所示：
```
obj-y                           += hello/
```

Makefile中添加自己的驱动模块，以方便编译

这里我们可以看到，前面Kconfig里出现的LT_XXOO，在这里我们就需要使用到CONFIG_XXOO，实际上逻辑是酱汁滴：在Kconfig里定义了LT_XXOO，然后配置完成后，在顶层的.config里会产生CONFIG_XXOO，然后这里我们使用这个变量。

到这里第一种情况下的添加方式就完成了。

四. 添加自己目录的情况

（1）在源码的对应目录下建立自己的目录(xxoo)，这里假设为/drivers/char/xxoo 。

（2） 把驱动源码放到新建的xxoo目录下，并在此目录下新建Kconfig和Makefile文件。然后给新建的Kconfig和Makefile添加内容。

Kconfig下添加的内容如下：

这个格式跟之前在Kconfig里添加选项类似。

Makefile里写入的内容就更少了：

添加这一句就可以了。

（3）第三也不复杂，还是依葫芦画瓢就可以了。

我们在/drivers/char目录下添加了xxoo目录，我们总得在这个配置系统里进行登记吧，哈哈，不然配置系统怎么找到们呢。由于整个配置系统是递归调用滴，所以我们需要在xxoo的父目录也即char目录的Kconfig和Makefile文件里进行登记。具体如下：

a). 在drivers/char/Kconfig中加入：source “drivers/char/xxoo/Kconfig”

b). 在drivers/char/Makefile中加入：obj-$(CONFIG_LT_XXOO) += xxoo/

添加过程依葫芦画瓢就可以了，灰常滴简单。



