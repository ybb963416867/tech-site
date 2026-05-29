---
title: "pinctl和gpio子系统（三）-24"
description: "pinctl和gpio子系统（三）-24 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Array]
draft: false
---
# pinctl和gpio子系统（三）

***以rk3399为例***

**设备树**

```
//在根节点中添加
test1: test {
		#address-cells = <1>;
		#size-cells = <1>;

		compatible = "test";
		reg = <0xff790000 0x00000004>;
		pinctrl-names = "default";
		pinctrl-0 = <&pinctrl_beep>;
		test-beep-gpio = <&gpio4 22 GPIO_ACTIVE_HIGH>;
	};
	
&test1 {
	compatible = "test1234";
	status = "okay";
};

//在这个 &pinctrl节点中添加

 beep {
                pinctrl_beep: pinctrl-beep {
                        rockchip,pins = <4 22 RK_FUNC_GPIO &pcfg_pull_up>;
                };
```

- beep-driver.c

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
u32 out_value[2] = {0};
unsigned int *vir_gpio_dr;
int beep_gpio = 0;

struct of_device_id of_match_table[] = {

    {.compatible = "test1234"},
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
    char kbuf[64] = {0};
    printk("hello misc_write \n");

    if (copy_from_user(kbuf, ubuf, size) != 0)
    {

        printk("copy_from_to_user error \n");
        return -1;
    
    }

    printk("kbuf is %s \n", kbuf);


    if (kbuf[0] == 1){
        // *vir_gpio_dr = 0x4a400000;
        gpio_set_value(beep_gpio, 1);
    }else if (kbuf[0] == 0)
    {
    
        // *vir_gpio_dr = 0x4a000000;
        gpio_set_value(beep_gpio, 0);
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

    printk("beep_probe \n");
    printk("node name is %s \n", pdev->dev.of_node->name);

#if 0
    //使用这个获取device_node 节点
    test_device_node = of_find_node_by_path("/test");
    if (test_device_node == NULL)
    {
        printk("of_find_node_by_path is error \n");
        return -1;
    }
#endif

    test_device_node = pdev->dev.of_node;

    // ret = of_property_read_u32_array(test_device_node, "reg", out_value, 2);
    // if ( ret < 0)
    // {
    //    printk("of_property_read_u32_array is error \n");
    //    return -1;
    // }

    // printk("out_value[0] = 0x%08x \n", out_value[0]);
    // printk("out_value[1] = 0x%08x \n", out_value[1]);


    // vir_gpio_dr = of_iomap(test_device_node, 0);

    // if(vir_gpio_dr == NULL){
    //     printk("of_iomap is error \n");
    //     return -1;
    // }
    // printk("of_iomap is success \n");


    // vir_gpio_dr = ioremap(out_value[1], 1);
    // if (vir_gpio_dr == NULL)
    // {
    //     printk("GPIO5_DR ioremap error \n");
    //     return -1;
    // }

    // printk("GPIO5_DR ioremap ok \n");


    beep_gpio = of_get_named_gpio(test_device_node, "test-beep-gpio", 0);

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
    }

    return 0;
}

int beep_remove(struct platform_device *pdev){
    printk("beep_remove \n");
    return 0;
}

const struct platform_device_id  beep_id_table = {
    .name = "beep_test"
};

struct platform_driver beep_device =
{
    .probe = beep_probe,
    .remove = beep_remove,
    .driver = {
        .name = "123",
        .owner = THIS_MODULE,
        .of_match_table = of_match_table
    },
    .id_table = &beep_id_table
};

static int beep_driver_init(void){
    int ret = 0;
    printk(KERN_EMERG "hello world enter \n");
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
    gpio_free(beep_gpio);
    misc_deregister(&misc_dev);
    platform_driver_unregister(&beep_device);
   
}

module_init(beep_driver_init);
module_exit(beep_driver_exit);
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

