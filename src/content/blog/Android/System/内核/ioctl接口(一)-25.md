---
title: "ioctl接口(一)-25"
description: "ioctl接口(一)-25 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# ioctl接口(一)

## unlocked_ipctl接口

- 什么是unlocked_ioctl 接口?

  unlocked_ioctl 实际上就是ioctl接口，但是功能和对应的系统调用均没有发生变化。

- unlocked_ioctl和read/write函数有什么相同点和不同点?

  **相同点**：都可以往内核中写数据。

  **不同点**：read函数只能完成读的功能，write 函数只能完成写的功能。但是read和write 在读写大数据时效率比较高

  ​				ioctl既可以读也可以写。读取大数据效率不是很高。

- unlocked_ioctl接口命令规则

  第一个分区： 0-7，命令的编号，范围是0~255

  第二个分区：8-15， 命令的幻数。

  第一个分区和第二个分区主要的作用是用来区分命令的。

  第三个分区：16-29表示传递的数据的大小。

  第四个分区：30-31代表读写的方向。

  ​                       00  ：表示用户程序和驱动程序没有数据传递

  ​					   10  ：表示用户程序向驱动里面读数据

  ​			           01 ： 表示用户程序向驱动里面写数据

  ​					   11 ： 先写数据到驱动里面然后在从驱动里面把数据读出来

- 命令的合成宏与分解宏

**合成宏:**

```
_IO(type,nr)		:用来定义没有数据传递的命令
_IOR(type,nr,size)	:用来定义从驱动中读取数据的命令
_IOW(type,nr,size)	:用来定义向驱动写入数据的命令
_IOWR(type,nr,size)	:用来定义数据交换类型的命令，先写入数据，再读取数据这类命令。
参数:
type		:表示命令组成的幻数，也就是8~15位
nr:表示命令组成的编号,也就是0~7位
size		:表示命令组成的参数传递大小，注意这里不是传递数字，而是数据类型，如要传递4字节,就可以写成int。
```

**分解宏:**

```
_lOC_DIR(nr)	分解命令的方向，也就是上面说30~31位的值
_IOC_TYPE(nr) 	分解命令的魔数，也就是上面说8~15位的值
_IOC_NR(nr)		分解命令的编号，也就是上面说0~7位
_IOC_SIZE(nr) 	分解命令的复制数据大小，也就是上面说的16~29位
参数说明:
nr:				要分解的命令
```

**代码**
- app.c

```
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>



#define CMD_TEST0 _IO('',0);
#define CMD_TEST0 _IO('L',0)
#define CMD_TEST1 _IO('L',1)
#define CMD_TEST2 _IOW('L',3, int)
#define CMD_TEST3 _IOR('L',3,int)

int main(int argc, char const *argv[]){
    printf("30~31 is %d \n",  _IOC_DIR(CMD_TEST0));
    printf("30~31 is %d \n",  _IOC_DIR(CMD_TEST1));
    printf("30~31 is %d \n",  _IOC_DIR(CMD_TEST2));
    printf("30~31 is %d \n",  _IOC_DIR(CMD_TEST3));

    printf("7~15 is %c \n", _IOC_TYPE(CMD_TEST0));
    printf("7~15 is %c \n", _IOC_TYPE(CMD_TEST1));

    printf("0~7 is %d \n", _IOC_NR(CMD_TEST2));
}
```

