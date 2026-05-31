---
title: "linux内核模块编译makefile-2"
description: "1、编译进内核的模块"
pubDate: 2026-05-29
category: "内核"
tags: [Shell]
draft: false
---
# linux内核模块编译makefile

**1、编译进内核的模块**

```
如果需要将一个模块配置进内核，需要在makefile中进行配置：
obj-y += foo.o
```

**2、编译可加载的模块**

```
所有在配置文件中标记为-m的模块将被编译成可加载模块.ko文件。
如果需要将一个模块配置为可加载模块，需要在makefile中进行配置：
obj-m += foo.o
```

**3、模块编译依赖多个文件**

```
通常的，驱动开发者也会将单独编译自己开发的驱动模块，当一个驱动模块依赖多个源文件时，需要通过以下方式来指定依赖的文件：
obj-m += foo.o
foo-y := a.o b.o c.o   
foo.o 由a.o,b.o,c.o生成，然后调用$(LD) -r 将a.o,b.o,c.o链接成foo.o文件。
```

**4、编译选项**

```
在内核态，编译的选项由EXTRA_CFLAGS, EXTRA_AFLAGS和 EXTRA_LDFLAGS修改成了ccflags-y asflags-y和ldflags-y这三个变量的值分别对应编译、汇编、链接时的参数。
```

**5、最简单的makefile**

```
obj-m+=hello.o
all:
   make -C /lib/modules/$(shell uname -r)/build/ M=$(PWD) modules
clean:
   make -C /lib/modules/$(shell uname -r)/build/ M=$(PWD) clean
这个makefile的作用就是编译hello.c文件，最终生成hello.ko文件。
obj-m+=hello.o
obj-m表示编译生成可加载模块。
相对应的，obj-y表示直接将模块编译进内核。
obj-m+=hello.o，这条语句就是显式地将hello.o编译成hello.ko,而hello.o则由make的自动推导功能编译hello.c文件生成。
-C选项：此选项指定make在编译时将会进入指定的目录（内核源码目录）。
modules是将源文件编译并生成内核模块。
$KDIR：/lib/modules/$(shell uname -r)/build/，指定内核源码的位置。
M=$(PWD)：需要编译的模块源文件地址。
```

**6、同时编译多个可加载模块**

```
当一个.o目标文件的生成依赖多个源文件时，可以这样指定：
    obj-m  += hello.o
    hello-y := a.o b.o hello_world.o
hello.o目标文件依赖于a.o,b.o,hello_world.o,那么这里的a.o和b.o如果没有指定源文件，
根据推导规则就是依赖源文件a.c,b.c,hello_world.c.
除了hello-y，同时也可以用hello-objs,实现效果是一样的。

同时编译多个可加载模块
kbuild支持同时编译多个可加载模块，也就是生成多个.ko文件，它的格式是这样的：
    obj-m := foo.o bar.o
    foo-y := <foo_srcs>
    bar-y := <bar_srcs>
就是这么简单。
```

**7、ifneq ($(KERNELRELEASE),)**

通常，标准的makefile会写成这样：

```
	    ifneq ($(KERNELRELEASE),)
        obj-m  := hello.o

    else
        KDIR ?= /lib/modules/`uname -r`/build

    all:
            $(MAKE) -C $(KDIR) M=$(PWD) modules
    clean:
            $(MAKE) -C $(KDIR) M=$(PWD) clean
    endif
```

为什么要添加一个ifneq，else，all条件判断。

这得从linux内核模块make执行的过程说起：当键入make时，make在当前目录下寻找makefile并执行，KERNELRELEASE在顶层的makefile中被定义，

所以在执行当前makefile时KERNELRELEASE并没有被定义，走else分支，直接执行

```
    $(MAKE) -C $(KDIR) M=$(PWD) modules
```

而这条指令会进入到$(KDIR)目录，调用顶层的makefile，在顶层makefile中定义了KERNELRELEASE变量.

在顶层makefile中会递归地再次调用到当前目录下的makefile文件，这时KERNELRELEASE变量已经非空，所以执行if分支，

在可加载模块编译列表添加hello模块，由此将模块编译成可加载模块放在当前目录下。

归根结底，各级子目录中的makefile文件的作用就是先切换到顶层makefile，然后通过obj-m在可加载模块编译列表中添加当前模块，

kbuild就会将其编译成可加载模块。如果是直接编译整个内核源码，就省去了else分支中进入顶层makefile的步骤。

需要注意的一个基本概念是：每一次编译，顶层makefile都试图递归地进入每个子目录调用子目录的makefile，

只是当目标子目录中没有任何修改时，默认不再进行重复编译以节省编译时间。

**8、头文件的放置**

```
当编译的目标模块依赖多个头文件时，kbuild对头文件的放置有这样的规定：
•    直接放置在makefile同在的目录下，在编译时当前目录会被添加到头文件搜索目录。
•    放置在系统目录，这个系统目录是源代码目录中的include/linux/。
•    与通用的makefile一样，使用-I$(DIR)来指定，不同的是，代表编译选项的变量是固定的，为ccflag.
•    一般的用法是这样的：
            ccflags-y := -I$(DIR)/include   
  kbuild就会将$(DIR)/includ目录添加到编译时的头文件搜索目录中。  
```

**9、简单用户态makefile实例**

```
#sample Makefile
edit : main.o kbd.o command.o display.o \
            insert.o search.o files.o utils.o
    cc -o edit main.o kbd.o command.o display.o \
            insert.o search.o files.o utils.o
main.o : main.c defs.h
    cc -c main.c
kbd.o : kbd.c defs.h command.h
    cc -c kbd.c
command.o : command.c defs.h command.h
    cc -c command.c
display.o : display.c defs.h buffer.h
    cc -c display.c
insert.o : insert.c defs.h buffer.h
    cc -c insert.c
search.o : search.c defs.h buffer.h
    cc -c search.c
files.o : files.c defs.h buffer.h command.h
    cc -c files.c
utils.o : utils.c defs.h
    cc -c utils.c
clean :
    rm edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o                
```