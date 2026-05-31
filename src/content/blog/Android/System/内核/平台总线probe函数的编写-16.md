---
title: "平台总线probe函数的编写-16"
description: "平台总线probe函数的编写-16 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Array]
draft: false
---
# 平台总线probe函数的编写

## 编写probe函数的思路:

### 从device.c里面获得硬件资源

- 方式一:直接获得，不推荐
- 方法二:只用函数获得

```
#include <linux/platform_device.h>
extern struct resource *platform_get_resource(struct platform_device *,unsigned int, unsigned int);
```

**参数**

- 第一个platform_device 指针
- 第二个是类型 resource 结构体中的 flags，
- 第三个相同的flags的第几个 resource 可以是一个数组，但是这个不是和该数组的位置对应，只和 flag 是第几个有关 
- 返回值 struct resource *  不为NULL成功

### 注册杂项/字符设备，完善file_operation结构体，并生成设备节点注册之前要先登记:

```
#include <linux/ioport.h>
struct resource * request_mem_region(start,n,name)
```

**参数**

- 第一个 resource 结构体中的start   对应的内存地址
- 第二个 resource 结构体总的start  到ent  一共有几个地址
- 第三个 name  这个随便起一个
- 返回值 struct resource *  不为NULL成功

### 卸载登记

```
#include <linux/ioport.h>
release_mem_region(start,n)
```

参数

- 第一个 resource 结构体中的start   对应的内存地址
- 第二个 resource 结构体总的start  到ent  一共有几个地址

**代码   一下是以rk3399的板子为例做的，如果是其他更换寄存器地址**
- beep_driver.c

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
unsigned int *vir_gpio5_dr;


struct resource *beep_mem;
struct resource *beep_mem_tmp;


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


int beep_probe(struct platform_device *pdev){

    int ret = 0;

    printk("beep_probe 匹配成功了 \n");
    //不安全
    printk("beep_res不安全 %s \n", pdev->resource[0].name);
    //第三个参数为同一类型下的第几个
    beep_mem = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (beep_mem == NULL)
    {
        printk("platform_get_resource is error \n");
        return -1;
    }

    printk("platform_get_resource is ok");

    printk("beep_res start is 0x%x \n", beep_mem ->start);
    printk("beep_res end is 0x%x \n",beep_mem ->end);

    vir_gpio5_dr = ioremap(beep_mem->start,1);
    if (vir_gpio5_dr == NULL)
    {
        printk("GPIO5_DR ioremap error \n");
        return -1;
    }

    printk("GPIO5_DR ioremap ok \n");


    ret = misc_register(&misc_dev);

    if (ret <0)
    {
        printk("misc_registe is error \n");
    }

    printk("misc registe is succeed \n");
#if 0
    beep_mem_tmp = request_mem_region(beep_mem->start,beep_mem->end - beep_mem->start + 1, "beep");
    
    if (beep_mem_tmp == NULL)
    {
        printk("request_mem_region is error \n");
        goto err_region;
    }
    
    return 0;
    err_region:
     release_mem_region(beep_mem->start,beep_mem->end - beep_mem->start + 1);
     return -1;
#endif

    return 0;
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
    misc_deregister(&misc_dev);
    iounmap(vir_gpio5_dr);
}

module_init(beep_driver_init);
module_exit(beep_driver_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("LIYU");
```

- beep_device.c

```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/platform_device.h>


struct resource beep_res[] =
{
    [0] = {
        .start  = 0xff790000,
        .end    = 0xff790004,
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
    char buf_write[64] = "write aaaaaaaaa";
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