---
title: "app,控制led 代码-42"
description: "将上面的代码注释掉，添加自己的设备树节点"
pubDate: 2026-05-29
category: "内核"
tags: [iOS, Array]
draft: false
---
- 在内核中可以找到led的设备树

```
	/* itop_led {
                compatible = "itop_led";
		pinctrl-names = "default";
                pinctrl-0 = <&led1_ctl>;
                gpios = <&gpio0 12 GPIO_ACTIVE_LOW>;
		status = "okay";
	};*/
```

将上面的代码注释掉，添加自己的设备树节点

```
itop_led_test {
        compatible = "itop_led_test";
		pinctrl-names = "default";
        pinctrl-0 = <&led1_ctl>;
        gpios = <&gpio0 12 GPIO_ACTIVE_LOW>;
		status = "okay";
};
```

- 驱动代码
- led.c

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
int beep_gpio = 0;
#define CMD_TEST2 _IOW('L', 0, int)
#define CMD_TEST3 _IOW('L', 1, int)

struct of_device_id of_match_table[] = {

    {.compatible = "itop_led_test"},
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

}

struct file_operations misc_fops =
{
    .owner = THIS_MODULE,
    .open = misc_open,
    .release = misc_release,
    .read = misc_read,
    .write = misc_write,
    .unlocked_ioctl = misc_ioctl
};

struct miscdevice misc_dev = 
{
    .minor = MISC_DYNAMIC_MINOR,
    .name = "hello_led",
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

- 触发file_operations 操作结构体中的read 和 write  函数的 的可执行文件的.c 文件如下
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
    fd = open("/dev/hello_led",O_RDWR);
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

- 触发file_operations 操作结构体中的 compat_ioctl  函数的 的可执行文件的.c 文件如下

**注意需要将file_operations 结构体中的.unlocked_ioctl 改成.compat_ioctl**

- app.c

```
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>

#define CMD_TEST2 _IOW('L', 0, int)
#define CMD_TEST3 _IOW('L', 1, int)

int main(int argc, char const *argv[]){
    int fd;
    char buf[64] = {0};
    char buf_write[64] = "write aaaaaaaaa";
    fd = open("/dev/hello_led",O_RDWR);
    if (fd < 0)
    {
        printf("open error \n");
        return fd;
    }
    printf("open success \n");
    
    //字符串转化为整型
    buf[0] = atoi(argv[1]);
    printf("buf[0]  %d \n", buf[0]);
    if (buf[0] == 1)
    {
        ioctl(fd, CMD_TEST3, 1); 
    }else {
        ioctl(fd, CMD_TEST2, 0);
    }
    close(fd);
    return 0;
}
```

- 下面是Android app的代码

**在apk 调用open 打开设备时需要给那个设备添加可执行权限,然后才可以打开**

> chmod 777 /dev/hello_led

- activity

```
package com.example.ledcontrol

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button
import android.widget.TextView

class MainActivity : AppCompatActivity() {

    init {
        System.loadLibrary("native-lib")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<TextView>(R.id.tv).text = stringFromJNI()

        findViewById<Button>(R.id.but_open).setOnClickListener {
            LedOpen()
        }

        findViewById<Button>(R.id.but_close).setOnClickListener {
            LedClose()
        }

        findViewById<Button>(R.id.but_control_open).setOnClickListener {
            LedIoctl(1)
        }

        findViewById<Button>(R.id.but_control_close).setOnClickListener {
            LedIoctl(0)
        }

    }

    private external fun stringFromJNI(): String?
//
    private external fun LedOpen()
    private external fun LedClose()
    private external fun LedIoctl(en: Int)

}
```

- activity_main.xml

```
<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        >

        <TextView
            android:id="@+id/tv"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/>

        <Button
            android:id="@+id/but_open"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="连接"
            />

        <Button
            android:id="@+id/but_close"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="关闭"
            />

        <Button
            android:id="@+id/but_control_open"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="开灯"
            />

        <Button
            android:id="@+id/but_control_close"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="关灯"
            />

    </LinearLayout>
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

- main/cpp/native-lib.cpp

```
#include <jni.h>
#include <string>
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <errno.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <stdint.h>
#include <termios.h>
#include <android/log.h>
#include <sys/ioctl.h>

#undef  TCSAFLUSH
#define TCSAFLUSH  TCSETSF
#ifndef _TERMIOS_H_
#define _TERMIOS_H_
#endif

#define CMD_TEST2 _IOW('L',0, int)
#define CMD_TEST3 _IOW('L',1, int)

int fd = 0;

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_ledcontrol_MainActivity_stringFromJNI(
        JNIEnv *env,
        jobject /* this */) {

    std::string hello = "Hello from C++";
    //ioctl()
    return env->NewStringUTF(hello.c_str());
}
extern "C"
JNIEXPORT void JNICALL
Java_com_example_ledcontrol_MainActivity_LedOpen(JNIEnv *env, jobject thiz) {
    fd = open("/dev/hello_led", O_RDWR);
    if (fd < 0) {
        __android_log_print(ANDROID_LOG_INFO, "serial", "open /dev/hello_led Error");
    } else {
        __android_log_print(ANDROID_LOG_INFO, "serial", "open /dev/hello_led Sucess fd=%d", fd);
    }
}extern "C"
JNIEXPORT void JNICALL
Java_com_example_ledcontrol_MainActivity_LedClose(JNIEnv *env, jobject thiz) {

    if (fd > 0) {
        __android_log_print(ANDROID_LOG_INFO, "serial", "close /dev/hello_led");
        int result = close(fd);
        if (result < 0) {
            __android_log_print(ANDROID_LOG_INFO, "serial", "%s", "关闭失败" + result);
        } else {
            __android_log_print(ANDROID_LOG_INFO, "serial", "关闭成功");
        }
        fd = -1;
    }

}extern "C"
JNIEXPORT void JNICALL
Java_com_example_ledcontrol_MainActivity_LedIoctl(JNIEnv *env, jobject thiz, jint en) {
    __android_log_print(ANDROID_LOG_INFO, "serial", "en= : %d", en);
    if (en == 0) {
        __android_log_print(ANDROID_LOG_INFO, "serial", "关闭");
        ioctl(fd, CMD_TEST2, 0);
    } else {
        __android_log_print(ANDROID_LOG_INFO, "serial", "打开");
        ioctl(fd, CMD_TEST3, 1);
    }

}
```

- CMakeLists.txt

```
# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.4.1)

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.
file(GLOB source src/main/cpp/*.cpp)
add_library( # Sets the name of the library.
             native-lib

             # Sets the library as a shared library.
             SHARED

             # Provides a relative path to your source file(s).
             ${source})

# Searches for a specified prebuilt library and stores the path as a
# variable. Because CMake includes system libraries in the search path by
# default, you only need to specify the name of the public NDK library
# you want to add. CMake verifies that the library exists before
# completing its build.

find_library( # Sets the name of the path variable.
              log-lib

              # Specifies the name of the NDK library that
              # you want CMake to locate.
              log )

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.

target_link_libraries( # Specifies the target library.
                       native-lib

                       # Links the target library to the log library
                       # included in the NDK.
                       ${log-lib} )
```

- 总结 用ndk 调用  不走compat_ioctl，走unlocked_ioctl这个函数，   而用可执行文件却走compat_ioctl  不走  unlocked_ioctl