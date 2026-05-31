---
title: "linux物理地址到虚拟地址的映射-8"
description: "linux物理地址到虚拟地址的映射-8 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# linux物理地址到虚拟地址的映射

### 1.在单片机和裸机中我们操作硬件是怎么操作的?

- 我们可以这样来操作我们的寄存器 

```
unsigned int*p = Ox12345678;

*p = Ox87654321;
```

- 但是在Linux上不行，在Linux上，如果要想操作硬件，需要先把物理地址转换成虚拟地 址。因为Linux使能了MMU，所以我们在Linux上不能直接操作物理地址。

### 2.使用了MMU以后有什么好处呢?

- (1）让虚拟地址成了可能
- (2）可以让系统更加安全，因为有了MMU，我们上层应用看到的内存都是虚拟内存， 我们的应用就不能直接访问硬件，所以这样就保证了系统安全。

### 3.MMU非常复杂，那么我们如何完成物理地址到虚拟地址的转换呢?

- 内核给我们提供了相关的函数，
- ioremap, iounmap
- ioremap:把物理地址转换成虚拟地址
- iounmap:释放掉ioremap映射的地址。

```
static inline void  iomem *ioremap(phys_addr_toffset, size_t size) 
```

- 参数:

```
phys_addr _t offset:映射物理地址的起始地址。

size tsize:要映射多大的内存空间。
```



- 返回值:

```
成功返回虚拟地址的首地址

失败返回NUL
```

```
static inline void iounmap(void iomem *addr) 
```

- 参数:

```
*addr:要取消映射的虚拟地址的首地址。

注意:物理地址只能被映射一次，多次映射会失败
```

### 4.如何查看哪些物理地址被映射过了呢? 

- 可以使用命令cat/proc/iomem来查看。



**相对完整的蜂鸣器的驱动的代码 以rk3399为例**

- beep.c

```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/io.h>

#define GPIO5_DR 0xff790000
unsigned int *vir_gpio5_dr;


int misc_open(struct inode * inode, struct file * file){
    printk("hello misc_open \n");
    return 0;  
}

int misc_release(struct inode * inode, struct file * file){
    printk("hello misc_release bye bye \n");
    return 0;
}

int misc_read(struct file* file, char __user * ubuf, size_t size, loff_t * loff_t){

    char kbuf[64] = "heheh_read";

    printk("hello misc_read \n");

    if(copy_to_user(ubuf, kbuf, strlen(kbuf)) != 0 ){
        printk("copy_to_user error \n");
        return -1;
    }
    
    return 0;

}

int misc_write(struct file * file, const char __user * ubuf, size_t size, loff_t * loff_t){
    printk("hello misc_write \n");
    char kbuf[64] = {0};

    if (copy_from_user(kbuf, ubuf, size) != 0)
    {

        printk("copy_from_to_user error \n");
        return -1;
    
    }

    printk("kbuf is %s \n", kbuf);


    if (kbuf[0] == 1){
        *vir_gpio5_dr = 0x4a400000;
    }else if (kbuf[0] == 0)
    {
    
        *vir_gpio5_dr = 0x4a000000;
    }
    
    return 0;

}

struct file_operations misc_fops =
{
    .owner = THIS_MODULE,
    .open = misc_open,
    .release = misc_release,
    .read = misc_read,
    .write = misc_write
};


struct miscdevice misc_dev = 
{
    .minor = MISC_DYNAMIC_MINOR,
    .name = "hello_misc",
    .fops = &misc_fops
};

static int misc_init(void){

    int ret;
    ret = misc_register(&misc_dev);

    if (ret <0)
    {
        printk("misc_registe is error \n");
    }

    printk("misc registe is succeed \n");

    vir_gpio5_dr = ioremap(GPIO5_DR,4);
    if (vir_gpio5_dr == NULL)
    {
        printk("GPIO5_DR ioremap error \n");
        return -1;
    }

    printk("GPIO5_DR ioremap ok \n");
    
    return 0;
}

static void misc_exit(void){
    misc_deregister(&misc_dev);
    printk(KERN_EMERG "misc byb byb \n");
    iounmap(vir_gpio5_dr);
}

module_init(misc_init);
module_exit(misc_exit);
MODULE_LICENSE("DUAL BAD/GPL");
MODULE_AUTHOR("LIYU");
```

- app.c
```
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(int argc, char const *argv[]){
    int fd;
    char buf[64] = {0};
    fd = open("/dev/hello_misc",O_RDWR);
    if (fd < 0)
    {
        printf("open error \n");
        return fd;
    }
    printf("open success \n");
    
    //字符串转化为整型
    buf[0] = atoi(argv[1]);
    printf("buf[0]  %d \n", buf[0]);
    write(fd,buf,sizeof(buf));
    close(fd);
    return 0;
}
```