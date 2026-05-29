---
title: "android 杂项驱动的编写-6.1"
description: "android 杂项驱动的编写-6.1 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Shell]
draft: false
---
# android 杂项驱动的编写

## 函数说明

### 注册杂项设备

```
int misc_register(struct miscdevice * misc)
```

- 头文件：#include <linux/miscdevice.h>
- 功能：注册一个杂项设备
- 参数：misc- 杂项设备的核心结构指针，至少已经实现minor，name，fops三个成员。
- 返回值：0，表示注册成功；负数，注册失败。
- 说明：注册成功之后，会在/dev目录下生成一个设备节点文件。

###   注销函数

```
int misc_deregister(struct miscdevice *misc)
```

- 头文件：#include <linux/miscdevice.h>
- 功能：注销一个已经存在杂项设备
- 参数：misc，杂项设备的核心结构指针，已经注册的struct miscdevice结构。
- 返回值：0，表示注销成功；负数，注销失败

**杂项设备的核心数据结构struct miscdevice：（头文件中已经定义好）**

```
struct miscdevice  {
	int minor;
	const char *name;
	const struct file_operations *fops;
	struct list_head list;
	struct device *parent;
	struct device *this_device;
	const struct attribute_group **groups;
	const char *nodename;
	umode_t mode;
};
```

**结构体struct miscdevice结构中的函数结构液体struct file_operations（头文件中已经定义好）**

```
struct file_operations {
  struct module *owner;
  loff_t (*llseek) (struct file *, loff_t, int);
  ssize_t (*read) (ct fstruile *, char __user *, size_t, loff_t *);
  ssize_t (*write) (struct file *, const char __user *, size_t, loff_t *);
  ssize_t (*read_iter) (struct kiocb *, struct iov_iter *);
  ssize_t (*write_iter) (struct kiocb *, struct iov_iter *);
  int (*iterate) (struct file *, struct dir_context *);
  unsigned int (*poll) (struct file *, struct poll_table_struct *);
  long (*unlocked_ioctl) (struct file *, unsigned int, unsigned long);
  long (*compat_ioctl) (struct file *, unsigned int, unsigned long);
  int (*mmap) (struct file *, struct vm_area_struct *);
  int (*open) (struct inode *, struct file *);
  int (*flush) (struct file *, fl_owner_t id);
  int (*release) (struct inode *, struct file *);
  int (*fsync) (struct file *, loff_t, loff_t, int datasync);
  int (*aio_fsync) (struct kiocb *, int datasync);
  int (*fasync) (int, struct file *, int);
  int (*lock) (struct file *, int, struct file_lock *);
  ssize_t (*sendpage) (struct file *, struct page *, int, size_t, loff_t *, int);
  unsigned long (*get_unmapped_area)(struct file *, unsigned long, unsigned long, unsigned long, unsigned long);
  int (*check_flags)(int);
  int (*flock) (struct file *, int, struct file_lock *);
  ssize_t (*splice_write)(struct pipe_inode_info *, struct file *, loff_t *, size_t, unsigned int);
  ssize_t (*splice_read)(struct file *, loff_t *, struct pipe_inode_info *, size_t, unsigned int);
  int (*setlease)(struct file *, long, struct file_lock **, void **);
  long (*fallocate)(struct file *file, int mode, loff_t offset,loff_t len);
  void (*show_fdinfo)(struct seq_file *m, struct file *f);
}
```

### 驱动代码的例子

**Android 下的**

- misc.c文件

```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>


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
    return 0;
}

static int misc_exit(void){
    misc_deregister(&misc_dev);
    printk(KERN_EMERG "misc byb byb \n");
    return 0;
}

module_init(misc_init);
module_exit(misc_exit);
MODULE_LICENSE("DUAL BAD/GPL");
MODULE_AUTHOR("LIYU");
```

- app 可执行文件

```
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

void main(){
    int fd;
    char buf[64] = {0};
    fd = open("/dev/hello_misc",O_RDWR);
    if (fd < 0)
    {
        printf("open error \n");
    }
    printf("open success");
    read(fd,buf,sizeof(buf));
    write(fd,buf,sizeof(buf));
    close(fd);
}
```

- Makefile文件

```
obj-m +=misc.o
KOIR:=/home/topeet/ybb/android/itop-3399_8.1/kernel
PWD?=$(shell pwd)
all:
        make -C $(KOIR) M=${PWD} modules
clean:
        rm -rf *.o
        rm -rf *.ko
        rm -rf *.mod.c
        rm -rf *.symvers
        rm -rf *.order
```

