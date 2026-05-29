---
title: "实现自己的HAL-10 控制led（内核驱动的hal），从app 到 hal 到底层内核kernel层的驱动 的实现（二）"
description: "<center <img style=\"borderradius: 0.3125em; boxshadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08)..."
pubDate: 2026-05-29
category: "HAL"
tags: [iOS, API]
draft: false
---
# 控制led内核驱动的hal
- Z:\itop-3399_8.1\hardware\libhardware\include\hardware 下创建  helloworld.h
- helloworld.h 代码
```
#define ANDROID_HELLOWORLD_INTERFACE_H
#include <hardware/hardware.h>

__BEGIN_DECLS

//定义模块ID
#define HELLOWORLD_HARDWARE_MODULE_ID "helloworld"

//硬件模块结构

struct helloworld_module_t
{
    struct hw_module_t common;
    char * description;
    int methodsNum;
};

//硬件接口结构体

struct helloworld_device_t
{
    struct  hw_device_t common;
    int (*led_close) (struct helloworld_device_t *dev, int fd);
    int (*led_open)(struct helloworld_device_t *dev, int fd);
    int (*open_led_device)(struct helloworld_device_t *dev);
    int (*close_led_device)(struct helloworld_device_t *dev, int fd);
};

__END_DECLS
```
- 
- Z:\itop-3399_8.1\hardware\libhardware\modules\ 下创建  helloworld 文件夹
- 在helloworld 文件夹下创建helloworld.c、Android.mk
- helloworld.c 代码
```
#define LOG_TAG "HelloWorld"

#include <hardware/hardware.h>
#include <malloc.h>
#include <fcntl.h>
#include <errno.h>
#include <cutils/log.h>
#include <hardware/helloworld.h>

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
#include <sys/ioctl.h>

#undef  TCSAFLUSH
#define TCSAFLUSH  TCSETSF
#ifndef _TERMIOS_H_
#define _TERMIOS_H_
#endif

#define MODULE_NAME "helloworld"
#define MODULE_DES "HelloWorld : Implement Add function"
#define MODULE_AUTHOR "963416867@qq.com"
#define LED_DEVICE_PATH "/dev/hello_led"

#define CMD_TEST2 _IOW('L',0, int)
#define CMD_TEST3 _IOW('L',1, int)

static int helloworld_open(const struct hw_module_t* module, const char* id, struct hw_device_t** device);
static int helloworld_close(struct hw_device_t* device);
static int led_close(struct helloworld_device_t *dev, int fd);
static int led_open(struct helloworld_device_t *dev, int fd);
static int open_led_device(struct helloworld_device_t *dev);
static int close_led_device(struct helloworld_device_t *dev,int fd);
static int helloworld_open(const struct hw_module_t* module, const char* id, struct hw_device_t** device){

    struct helloworld_device_t *dev;
    
    dev = (struct helloworld_device_t *)malloc(sizeof(*dev));
    if(!dev){
        ALOGE("Helloworld open: faild to alloc device space");
        return -EFAULT;
    }

    memset(dev, 0, sizeof(*dev));
    dev->common.tag = HARDWARE_MODULE_TAG;
    dev->common.version = 0;
    dev->common.module = module;
    dev->common.close = helloworld_close;
    dev->led_close = led_close;
    dev->led_open = led_open;
    dev->close_led_device = close_led_device;
    dev->open_led_device = open_led_device;
    
    * device = &(dev->common);
    ALOGI("helloworld open: driver file successfully");
   
    return 0;
}

static struct  hw_module_methods_t helloworld_module_methods_t = {
    .open = helloworld_open
};

//module struct  注意这里必须是 HAL_MODULE_INFO_SYM 变量名

struct helloworld_module_t HAL_MODULE_INFO_SYM = {

    .common = {
        .tag = HARDWARE_MODULE_TAG,
        .module_api_version = 1,
        .hal_api_version = 0,
        .id = HELLOWORLD_HARDWARE_MODULE_ID,
        .name = MODULE_NAME,
        .author = MODULE_AUTHOR,
        .methods = &helloworld_module_methods_t
    },

    .description = MODULE_DES,
    .methodsNum = 4

};

static int helloworld_close(struct hw_device_t* device){
    struct helloworld_device_t* helloworld_device= (struct helloworld_device_t *)device;
    if(helloworld_device){
        free(helloworld_device);
    }

    return 0;
}

static int led_close(struct helloworld_device_t *dev, int fd){
    ALOGI("led_close: success");
    return ioctl(fd, CMD_TEST2, 0);
}

static int led_open(struct helloworld_device_t *dev, int fd){
    ALOGI("led_open: 调用了");
    return ioctl(fd, CMD_TEST3, 1); 
}

static int open_led_device(struct helloworld_device_t *dev){

    ALOGI("open_led_device: 调用了");
    return open(LED_DEVICE_PATH, O_RDWR);
}

static int close_led_device(struct helloworld_device_t *dev, int fd){
    ALOGI("close_led_device: 调用了");
    return close(fd);
}
```
- Android.mk 代码
```
# Copyright (C) 2008 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

LOCAL_PATH := $(call my-dir)

# HAL module implemenation stored in
# hw/<OVERLAY_HARDWARE_MODULE_ID>.<ro.product.board>.so
include $(CLEAR_VARS)

LOCAL_LDLIBS := -llog

LOCAL_MODULE_RELATIVE_PATH := hw
LOCAL_PROPRIETARY_MODULE := true
LOCAL_SRC_FILES := helloworld.c
LOCAL_HEADER_LIBRARIES := libhardware_headers
LOCAL_MODULE := helloworld.default
LOCAL_CFLAGS:= -DLOG_TAG=\"helloworld\"
LOCAL_MODULE_TAGS := optional
include $(BUILD_SHARED_LIBRARY)
```
- 编译helloworld 模块
> source build/envsetup.sh 
> lunch    选择自己的平台
> mmm hardware\libhardware\modules
> make  vendorimage -j8  

- 生成 vendor.img  刷入开发版

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629162951154.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">成功生成 helloworld.default.so  </div>
</center>

