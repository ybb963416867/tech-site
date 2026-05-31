---
title: "Linux -- Makefile的学习笔记以及多级目录下Makefile的编写-2"
description: "Linux -- Makefile的学习笔记以及多级目录下Makefile的编写-2 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Mac]
draft: false
---
# Linux -- Makefile的学习笔记以及多级目录下Makefile的编写

1、由于Makefile中对于制表符（tab）、还有unix和windows中对于换行符的不同等等原因，本文中所有的Makefile文件中的内容不建议您直接复制然后粘贴使用，如果可以手动敲入是为最佳。如果出现在make的时候出现异常，请详细检查并关注文件格式以及内容编写的格式等等。

## 一、Make简介：

工程管理器，顾名思义，是指管理较多的文件，Make工程管理器也就是个“自动编译管理器”，这里的“自动”是指它能够根据文件时间戳自动发现更新过的文件而减少编译的工作量，同时，它通过读入Makefile文件文件的内容来执行大量的编译工作，Make将只编译改动的代码文件，而不用完全编译。

Makefile文件一般和项目的其他源文件放在同一个目录下。在机器上可以同时存在许多不同的makefile文件，如果一个大项目，可以用多个不同的makefile文件来分别管理项目的不同部分。

Make命令和makefile文件的结合提供了有一个在项目管理领域十分强大的工具，不仅可以用于控制源代码的编译，而且还可以用于手册也的编写以及将应用程序安装到目标目录。

一个简单的makefile1的例子：

```c
all:
	gcc main.c -o main
clean: 
	rm -rf main main.o
```

或者：

```
main:main.o
	gcc main.o -o main
main.o:main.c
	gcc -c main.c 
clean:
	rm -rf main.o main
```

在终端运行make –f makefile1的时候，可以看到通过两个步骤将源文件编译生成可执行文件

如下 显示表示执行成功

```
lianfei@lianfeideMacBook-Pro text % make 
gcc -c main.c
gcc main.o -o main
lianfei@lianfeideMacBook-Pro text % vim Makefile
```

二、Make程序中有许多选项，其中最常用的3个选项为：

1、-k：作用是在让make命令在发现错误时仍然就执行，而不是在检测到第一个错误时就停止，所以可是使用这个选项在一次操作中发下所有未编译成功的源文件

2、-n：作用是让make命令输出将要执行的操作步骤，而不是真正执行这些操作

3、-f <filename>：作用是告诉make将文件名为filename的我文件作为makefile文件。如果未使用这个选项，标准版的make命令将优先在当前命令下查找名称为makefile的文件，如果不存在名称makefile的文件，则开始查找名为Makefile的文件。

比如新建文件makefile：

```
all:
   @echo ""
   @echo "This is a makefile test "
   @echo "End test"
   @echo ""
```

然后在终端运行：

![](https://img-blog.csdnimg.cn/20190311161422393.png)

然后再新建Makefile：

```
all:
   @echo ""
   @echo "This is a Makefile test "
   @echo "End test"
   @echo ""
```

运行后

![](https://img-blog.csdnimg.cn/20190311161454758.png)

然后使用-f选项，

```
all:
    @echo ""
    @echo "This is a make command test"
    @echo "End test"
    @echo ""
```

可以看出已经不识别makefile的语法高亮，那使用-f选项指定运行maketest文件，效果如下。

![](https://img-blog.csdnimg.cn/20190311161551202.png)

三、Makefile中的宏

可以通过KEY=value在makefile中定义宏。可以使用$(KEY)或者${KEY}引用宏

可以将上述的文件makefile1修改成makefile2：

```
CC = gcc
CFLAGS = -g -Wall -O 

main:main.o
	$(CC) main.o -o main
main.o:main.c
	$(CC) $(CFLAGS) -c main.c 
clean:
	rm -rf main.o main
```

终端执行命令make -f makefile2，可以看到：

![](https://img-blog.csdnimg.cn/20190311161652784.png)

Makefile中的特殊宏定义：

    $*         不包括后缀名的当前依赖文件的名称
    
    $+         所有的依赖文件，以空格分开，并以出现的先后为序，可能包含重复的依赖文件
    
    $<         第一个依赖文件的名称
    
    $?         所有时间戳比目标文件晚的依赖文件，并以空格分开
    
    $@        目标文件的完整名称
    
    $^          所有不重复的目标依赖文件，以空格分开
    
    -：         告诉make命令忽略所有的错误
    
    @：       告诉make在执行命令前不要将改命令显示在标准输出上

那么，上面的makefile2可以修改为：

```
CC = gcc
CFLAGS = -g -Wall -O 
main:main.o
	$(CC) $^ -o $@
%.o:%.c
	$(CC) $(CFLAGS) -c $^
clean:
	rm -rf main.o main
```

四、如果有多个依赖文件，那么怎么写呢

1、比如如下工程（场景一：下列的文件都在一个目录中，五个文件分别是main.c，add.c，add.h，sub.c，aub.h）：

main.c的内容为：

```
#include <stdio.h>
#include "add.h"
#include "sub.h"

int main()
{
    int a = 10, b = 5;
    printf("a + b = %d\r\n", add(a, b));
    printf("a - b = %d\r\n", sub(a, b));
    return 0;
}
```

add.c的内容为：

```
#include <stdio.h>

int add(int a, int b)
{
    return a + b;
}
```

add.h的内容为：

```
#ifndef __ADD_H__
#define __ADD_H__

int add(int, int);

#endif
```

sub.c为：

```
#include <stdio.h>

int sub(int a, int b)
{
    return a - b;
}
```

sub.h为：

```
#ifndef __SUB_H__
#define __SUB_H__

int sub(int, int);

#endif
```

那么makefile可以这样写：

```
CC = gcc
CFLAGS = -g -O  -Wall

main:add.o sub.o main.o 
	$(CC) $^ -o $@
%.o:%.c
	$(CC) $(CFLAGS) -c $^
clean:
	rm -rf main main.o add.o sub.o
```

在终端运行make命令后：

![](https://img-blog.csdnimg.cn/20190311162047997.png)

但是这样的会有一个问题，那就是如果项目中文件比较多的话，在这一个目录下会有好多原文件和头文件，对于项目的维护也不方便，那么可以做如下的更改（以下的目录结构，学过STM32的同学应该比较清楚，这个是个人习惯的问题，其他的结构可能会更好^_^）：

在项目文件家下新建文件夹，比如例子中的，可以新建四个文件夹，分别是：

Main add sub obj

将main.c移动到main文件夹中，并且新建makefile，输入内容：

```
$(OBJDIR)/main.o:main.c
    $(CC) -c $^ -o $@
```

请注意：在下面将会移动add.h和sub.h的路径，所在在修改文件目录的同时需要将main.c中的两个头文件更新过来，具体如果采用和本文中一致的目录结构的话，可以这样修改：

将原本main.c中的：

    #include "add.h"
    #include "sub.h"

修改成：

    #include "../add/add.h"
    #include "../sub/sub.h"
将add.c和add.h移动到add文件夹中，

```
$(OBJDIR)/add.o:add.c
    $(CC) -c $^ -o $@
```

将sub.c和sub.h移动到sub文件夹中

```
$(OBJDIR)/sub.o:sub.c
    $(CC) -c $^ -o $@
```

然后在obj文件夹中新建makefile并且写入：

```
$(BINDIR)/$(BIN):$(OBJ) 
    $(CC) $^ -o $@  $(OBJHEAD) $(OBJLINK)
```

然后在顶层目录下新建文件makefile，写入内容如下：

```
CC = gcc
CFLAGS = -g -O -Wall

OBJ := add.o sub.o main.o
TOPDIR := $(PWD)
OBJDIR := $(TOPDIR)/obj
BINDIR := $(TOPDIR)/bin
BIN := main

SUBDIR :=  add sub main obj
OBJHEAD := $(TOPDIR)/add/add.h $(TOPDIR)/sub/sub.h
OBJLINK := --std=c99

export CC TOPDIR OBJDIR BINDIR BIN OBJLINK OBJ

all:CHECKDIR $(SUBDIR)
CHECKDIR:
	mkdir -p $(SUBDIR) $(BINDIR)
$(SUBDIR):RUN
	make -C $@
RUN:
	
clean:
	rm -rf $(OBJDIR)/*.o $(BINDIR) 
```

在这里简单解释一下makefile中的相关命令：

**CC = gcc #声明编译器**

**CFLAGS = -g -O -Wall #声明编译的选项**

**OBJ := add.o sub.o main.o #声明依赖的文件 这个是在一个文件夹中的写法，如果不在一个文件夹内需要加他们各自的路径**

**TOPDIR := $(PWD) #声明顶级目录**

**OBJDIR := $(TOPDIR)/obj #定义编译中间文件的存放的目录**

**BINDIR := $(TOPDIR)/bin #定义可执行文件的存放目录**

**BIN := main #定义可执行文件的名称**

**SUBDIR :=  add sub main obj #声明所有的子目录**

**OBJHEAD := $(TOPDIR)/add/add.h $(TOPDIR)/sub/sub.h #声明所有的头文件**

**OBJLINK := --std=c99 #声明编译时候需要的链接护着其他的选项**

**export CC TOPDIR OBJDIR BINDIR BIN OBJLINK OBJ #到处所有的全局变量，给次级目录中的makefile只用**

**all:CHECKDIR $(SUBDIR) #强大的all**

**mkdir -p $(SUBDIR) $(BINDIR)**

​    对于makedir中的的选项：

​            -m 对新建目录设置存取权限。也可以用chmod命令设置。

​            -p 可以是一个路径名称。此时若路径中的某些目录尚不存在，加上此选项后，系统将自动建立好那些尚不存在的目录， 即一次可以建立多个目录。

**make -C $@**

​    当make的目标为all时，

​            -C $@ 指明跳转到次级目录下读取那里的Makefile；

​            M=$(PWD) 表明读取完Makefile（次级目录下Makefile）执行完成后返回到当前目录继续读入、执行当前的Makefile（     顶级目录下Makefile）。   

**clean:**

​    关于clean的规则，在make clean的时候，并不产生目标文件，且没有依赖文件，所以命令都会执行，但如果目录中存在名为“clean”的文件或者目录，则规则没有依赖文件，且clean始终是最新的，所以命令不会被执行，为了避免这个问题，可以使用.PHONY来指明改目标，则将上述的clean部分修改为：

```
.PHONY:clean
clean:
    rm -rf $(OBJDIR)/*.o $(BINDIR) 
```

这样在执行"make clean"的时候就不管"clean"文件或者目录是否存在，正常执行makefile中clean的命令。

**PHONY** 目标并非是由其它文件生成的实际文件，只是在显式请求时执行命令的名字。

**rm -rf $(OBJDIR)/*.o $(BINDIR)** #删除编译生成的中间文件以及可执行文件的存储的目录（可执行文件同时被删除）

可以使用tree命令查看一下当前的目录的结构：



​    重要说明（于2020.3.9日追加）！！！

​           wzm_c1386666 兄弟提醒说在上图中obj文件夹下存在main文件，现在特殊说明一下。此main文件并非此工程以及Makefile需要的依赖文件，为在本人在测试阶段手动编译生成的可执行文件main，由于疏忽没有删掉。后续操作中可以忽略此文件。

​         由于原本工程和文件等都已经不存在了，所以此图继续保留使用，还请看官见谅。

​    追加完成！！！

那么，在编译的时候，直接在顶层目录下make即可完成所有的编译工作：

![](https://img-blog.csdnimg.cn/20190311162250707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3poZW1pbmdidWhhbw==,size_16,color_FFFFFF,t_70)

编译完成后，在看一下目录结构，多了一个目录bin：

![](https://img-blog.csdnimg.cn/20190311162259755.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3poZW1pbmdidWhhbw==,size_16,color_FFFFFF,t_70)

2、如果需要跨平台编译和测试的话，可以在makefile中增加条件判断，而且为了让makefile打印出来的信息更加的直观和人性化，可以适当的添加一些提示信息，简单的更改的makefile如下：

```
ifeq ($(t), 0)
TOOL=
else
TOOL=arm-none-linux-gnueabi-
endif

CC = $(TOOL)gcc
CFLAGS = -g -O -Wall

OBJ := add.o sub.o main.o
TOPDIR := $(PWD)
OBJDIR := $(TOPDIR)/obj
BINDIR := $(TOPDIR)/bin
BIN := main

SUBDIR :=  add sub main obj
OBJHEAD := $(TOPDIR)/add/add.h $(TOPDIR)/sub/sub.h
OBJLINK := --std=c99

export CC TOPDIR OBJDIR BINDIR BIN OBJLINK OBJ

all:CHECKDIR $(SUBDIR)
	@echo "*****************************************************************************"
	@echo "*                                                                           *"
	@echo "*                 Congratulations! Compile completed!!!                     *"
	@echo "*       Executable file name is : $(BIN)    "
	@echo "*  Executable file in directory : $(BINDIR)"
	@echo "*                                                                           *"
	@echo "*****************************************************************************"
CHECKDIR:
	@echo "*****************************************************************************"
	@echo "*                                                                           *"
	@echo "* Create subfolders:                                                        *"
	mkdir -p $(SUBDIR) 
	mkdir -p $(BINDIR)
	@echo "*                                                                           *"
	@echo "*               Successful Creation of subfolders!                          *"
	@echo "*                                                                           *"
	@echo "*****************************************************************************"
$(SUBDIR):RUN
	make -C $@
	@echo "*****************************************************************************"
RUN:
	@echo "*****************************************************************************"
	@echo "*                                                                           *"
	@echo "* All subdirectories are:                                                   *"
	@echo "*    "$(SUBDIR)
	@echo "* All links are:                                                            *"
	@echo "*    "$(OBJLINK)
	@echo "*                                                                           *"
	@echo "*****************************************************************************"
	@echo "*                                                                           *"
	@echo "*                            begin Compile                                  *"
	@echo "*                                                                           *"
	@echo "*****************************************************************************"
clean:
	rm -rf $(OBJDIR)/*.o $(BINDIR) 
help:
	@echo "*********************************** help ************************************"
	@echo "*                                                                           *"
	@echo "*                            Option Description                             *"
	@echo "*                                                                           *"
	@echo "*********************************** help ************************************"
```

所以，以我的选项为例，如果需要在电脑上运行，则在make的时候需要make t=0命令，如果需要在arm板子上运行，那么就可以直接make就可以了，以下是两种效果的截图：


版权声明：本文为CSDN博主「青椒*^_^*凤爪爪」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/songshuai0223/article/details/88207566