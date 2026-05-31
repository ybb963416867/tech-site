---
title: "实现自己的HAL-9 控制led（驱动），从app 到 hal 到底层内核kernel层的驱动 的实现（一）"
description: "<center <img style=\"borderradius: 0.3125em; boxshadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08)..."
pubDate: 2026-05-29
category: "HAL"
tags: [iOS]
draft: false
---
# 控制led，从app 到 hal 到底层内核kernel层的驱动 的实现（一）
## led 驱动
- 设备树的修改
- Z:\itop-3399_8.1\kernel\arch\arm64\boot\dts\rockchip\itop-3399.dtsi  文件 添加自己的test_led 节点
```
	/*
	itop_led {
        compatible = "itop_led";
		pinctrl-names = "default";
        pinctrl-0 = <&led1_ctl>;
        gpios = <&gpio0 12 GPIO_ACTIVE_LOW>;
		status = "okay";
	};
	*/
	
	test_led {
        compatible = "itop_led_test_let";
		pinctrl-names = "default";
        pinctrl-0 = <&led1_ctl>;
        gpios = <&gpio0 12 GPIO_ACTIVE_LOW>;
		status = "okay";
	};
```
- led_test.c (驱动代码)
```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/of_address.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/io.h>
#include <linux/gpio.h>
#include <linux/of_gpio.h>

struct device_node *test_device_node;
int beep_gpio = 0;
#define CMD_TEST2 _IOW('L', 0, int)
#define CMD_TEST3 _IOW('L', 1, int)

int beep_remove(struct platform_device *pdev){
    printk("beep_remove \n");
    return 0;
}

struct of_device_id of_match_table[] = {

    {.compatible = "itop_led_test_let"},
    {}

};

int misc_open(struct inode * inode, struct file * file){
    printk("hello misc_open \n");
    return 0;  
}

int misc_release(struct inode * inode, struct file * file){
    printk("hello misc_release bye bye \n");
    return 0;
}

int misc_write(struct file * file, const char __user * ubuf, size_t size, loff_t * loff_t){
    char kbuf[64] = {0};
    printk("hello misc_write \n");

    if (copy_from_user(kbuf, ubuf, size) != 0)
    {

        printk("copy_from_to_user error \n");
        return -1;
    
    }

    printk("kbuf is %s \n", kbuf);

    if (kbuf[0] == 1){
        gpio_set_value(beep_gpio, 1);
    }else if (kbuf[0] == 0)
    {
        gpio_set_value(beep_gpio, 0);
    }
    
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

static long misc_ioctl(struct file *file, unsigned int cmd, unsigned long value){
    
    printk("misc_ioctl cmd is %d \n", cmd);
    printk("misc_ioctl value is %d \n", value);

    switch (cmd)
        {
        case CMD_TEST2:
            gpio_set_value(beep_gpio, 0);
            printk("misc_ioctl value: %d\n",value);
            break;

        case CMD_TEST3:
            gpio_set_value(beep_gpio, 1);
            printk("misc_ioctl value: %d\n",value);
            break;
        
        default:
            break;
    }

    return  0;

}

struct file_operations misc_fops =
{
    .owner = THIS_MODULE,
    .open = misc_open,
    .release = misc_release,
    .read = misc_read,
    .write = misc_write,
    .unlocked_ioctl = misc_ioctl,
    .compat_ioctl = misc_ioctl
};

struct miscdevice misc_dev = 
{
    .minor = MISC_DYNAMIC_MINOR,
    .name = "hello_led",
    .fops = &misc_fops
};

const struct platform_device_id  beep_id_table = {
    .name = "beep_test"
};

int beep_probe(struct platform_device *pdev){
    int ret;
     printk("beep_probe \n");

     printk("node name is %s \n", pdev->dev.of_node->name);
     test_device_node = pdev->dev.of_node;
     
    beep_gpio = of_get_named_gpio(test_device_node, "gpios", 0);

    if (beep_gpio <0)
    {
       printk("of_get_named_gpio error \n");
       return -1;
    }

    printk("beep_gpio: %d\n", beep_gpio);

    ret = gpio_request(beep_gpio, "beep");
    
    if ( ret <0 )
    {
        printk("gpio_request is error \n");
        return -1;
    }

    gpio_direction_output(beep_gpio, 1);

    
    ret = misc_register(&misc_dev);

    if (ret <0)
    {
        printk("misc_registe is error \n");
        return 0;
    }

    printk("misc_registe is success \n");

    return 0;

}

struct platform_driver beep_device =
{
    .probe = beep_probe,
    .remove = beep_remove,
    .driver = {
        .name = "1234",
        .owner = THIS_MODULE,
        .of_match_table = of_match_table
    },
    .id_table = &beep_id_table
};

static int beep_driver_init(void){

    int ret = 0;

    printk("beep_driver_init \n");

    ret = platform_driver_register(&beep_device);

    return 0;
}

static void beep_driver_exit(void){

       printk("beep_driver_exit \n");
       printk("misc_registe is error \n");
       gpio_free(beep_gpio);
       misc_deregister(&misc_dev);
       platform_driver_unregister(&beep_device);
}

module_init(beep_driver_init);
module_exit(beep_driver_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("LIYU");
```
- 然后安装到内核
驱动是否编写正确请看 内核篇 [led驱动及app（没有hal）](https://blog.csdn.net/yangbinbingA/article/details/117957297)
驱动怎么编译到内核请看  [Linux下把驱动编译进内核 -5](https://blog.csdn.net/yangbinbingA/article/details/117714390)

- 然后编译kernel 生成 kernel.img  和 resource.img   
- 将kernel.img  和 resource.img 刷到开发版
- 内核成功打印以下信息说明内核编译成功

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629183021413.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">显示hello_led 说明成功</div>
</center>

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629160946504.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">成功生成dev/hello_led节点</div>
</center>
