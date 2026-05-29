---
title: "ioctl接口(二)-26"
description: "ioctl接口(二)-26 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# ioctl接口(二)

## unlocked_ioctl与compat_ioctl的区别

最近在调试驱动的时候遇到这个问题，在这里记录一下。

在做测试驱动的时候是这样写法的，但将驱动加载之后驱动进不去myioctl里面

```
struct file_operations fops = {
    .owner = THIS_MODULE,
    .compat_ioctl = myioctl,
};
```

然后file一下我的用户程序，发现用户程序是32位的，于是找到网上相关信息，修改成如下，就可以正常进到myioctl。

```
struct file_operations fops = {
    .owner = THIS_MODULE,
    .unlocked_ioctl = myioctl,
};
```

如果是64位的用户程序运行在64位的kernel上，调用的是compat_ioctl，如果是32位的APP运行在32位的kernel上，调用的也是unlocked_ioctl。

**代码**
- beep.c

```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/io.h>

#define CMD_TEST0 _IO('L',0)
#define CMD_TEST1 _IO('L',1)
#define CMD_TEST2 _IOW('L', 2, int)
#define CMD_TEST3 _IOW('L', 3, int)
#define CMD_TEST4 _IOR('L', 4, int)


int misc_open(struct inode * inode, struct file * file){
    printk("hello misc_open \n");
    return 0;  
}

int misc_release(struct inode * inode, struct file * file){
    printk("hello misc_release bye bye \n");
    return 0;
}

int misc_read(struct file* file, char __user * ubuf, size_t size, loff_t * loff_t){
    printk("hello misc_read \n");

    
    return 0;

}

int misc_write(struct file * file, const char __user * ubuf, size_t size, loff_t * loff_t){
    printk("hello misc_write \n");
    
    return 0;

}

long misc_ioctl (struct file * file, unsigned int cmd, unsigned long value){

    int val;

    printk("misc_ioctl \n");

    switch (cmd)
        {

            case CMD_TEST0:
                printk("test0 \n");
                break;
            case CMD_TEST1:
                printk("test1 \n");
                break;
            case CMD_TEST2:
                printk("led on \n");
                printk("value2 is %d\n", value);
                break;

            case CMD_TEST3:
                printk("led off \n");
                printk("value3 is %d\n", value);
                break;
            case CMD_TEST4:
                val = 12;
                if ( copy_to_user((int *)value, &val, sizeof(val)) != 0)
                {
                    printk("copy_to_user is error");
                    return -1;
                }
                

                break;
        }


    return 0;
}

struct file_operations misc_fops =
{
    .owner = THIS_MODULE,
    .open = misc_open,
    .release = misc_release,
    .compat_ioctl = misc_ioctl,
    .write = misc_write,
    .read = misc_read
};


struct miscdevice misc_dev = 
{
    .minor = MISC_DYNAMIC_MINOR,
    .name = "hello_misc1",
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

    return 0;
}

static void misc_exit(void){
    misc_deregister(&misc_dev);
    printk(KERN_EMERG "misc byb byb \n");
}

module_init(misc_init);
module_exit(misc_exit);
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
#include <sys/ioctl.h>



#define CMD_TEST0 _IO('L',0)
#define CMD_TEST1 _IO('L',1)
#define CMD_TEST2 _IOW('L', 2, int)
#define CMD_TEST3 _IOW('L', 3, int)
#define CMD_TEST4 _IOR('L', 4, int)


int main(int argc, char const *argv[]){
    int fd = 0;
    int value;
    fd = open("/dev/hello_misc1",O_RDWR);
    if (fd < 0)
    {
        printf("open error \n");
        return fd;
    }
    while (1)
    {
        ioctl(fd, CMD_TEST0);
        ioctl(fd, CMD_TEST1);
        ioctl(fd, CMD_TEST2, 0);
        sleep(2);
        ioctl(fd, CMD_TEST3, 1); 
        sleep(2);
        ioctl(fd,CMD_TEST4, &value);
        printf("value:  %d \n", value);
    }
    
    return 0;
}
```