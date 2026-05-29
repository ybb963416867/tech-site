---
title: "实现自己的HAL-11 控制led（jni 的编写），从app 到 hal 到底层内核kernel层的驱动 的实现（三）"
description: "实现自己的HAL-11 控制led（jni 的编写），从app 到 hal 到底层内核kernel层的驱动 的实现（三） 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [CSS]
draft: false
---
# led 驱动的framwork 的jni 的编写
- 在文件夹Z:\itop-3399_8.1\frameworks\base\services\core\jni 下创建  com_android_server_HelloWorldService.cpp
- com_android_server_HelloWorldService.cpp 代码
```
#include <nativehelper/JNIHelp.h>
#include <jni.h>
#include <android_runtime/AndroidRuntime.h>
#include <utils/misc.h>
#include <utils/Log.h>
#include <hardware/hardware.h>
#include <hardware/helloworld.h>
#include <stdio.h>
#include <android_runtime/Log.h>

namespace android {

    struct helloworld_device_t * helloworld_device = NULL;
    int fd = 0;

    static jboolean helloworld_init(JNIEnv* env, jobject clazz){

        helloworld_module_t *module;
        ALOGI("hello jni init");
        if(hw_get_module(HELLOWORLD_HARDWARE_MODULE_ID, (const struct hw_module_t**)&module)== 0){

            ALOGI("hw_get_module success");

            if(module->common.methods->open(&(module->common),HELLOWORLD_HARDWARE_MODULE_ID, (struct hw_device_t **)&helloworld_device) == 0){
                 ALOGI("open success");
                return JNI_TRUE;
            }

            ALOGI("open error");
            return JNI_FALSE;

        }
        ALOGI("hw_get_module error");
        return JNI_FALSE;

    }

    static jboolean led_close(JNIEnv* env, jobject clazz){

        int let = -1;

        if(!helloworld_device){
            ALOGI("hello jni device is not open");
            return JNI_FALSE;
        }

        if(fd>0){
            let = helloworld_device->led_close(helloworld_device, fd);
            ALOGI("led_close let: %d", let);
            if(let>=0){
                return JNI_TRUE;
            }else {
                ALOGI("led_close is error");
                return JNI_FALSE;
            }
        }

        ALOGI("please open led device");
        
        return JNI_FALSE;

    }

    static jboolean let_open(JNIEnv* env, jobject clazz){
        
        int let = -1;

        if(!helloworld_device){
            ALOGI("let_open is error");
            return JNI_FALSE;
        }

        if(fd>0){
            let = helloworld_device->led_open(helloworld_device, fd);
            ALOGI("let_open let: %d", let);
            if(let>=0){
                return JNI_TRUE;
            }else {
                 ALOGI("let_open is error");
                return JNI_FALSE;
            }
           
        }
        
        ALOGI("please open led device");

        return JNI_FALSE;
    }

    static jboolean open_led_device(JNIEnv* env, jobject clazz){
        if(!helloworld_device){
            ALOGI("open_led_device is error");
            return JNI_FALSE;
        }

        fd = helloworld_device->open_led_device(helloworld_device);
        ALOGI("fd is : %d", fd);
        if(fd >0){
            ALOGI("open led device is success");
            return JNI_TRUE;
        }

        ALOGI("open led device is error");

        return JNI_FALSE;
    }

    static jboolean close_led_device(JNIEnv* env, jobject clazz){
        int let = 0;
        if(!helloworld_device){
            ALOGI("close_led_device is error");
            return JNI_FALSE;
        }

        if(fd > 0){
            let = helloworld_device->close_led_device(helloworld_device, fd);
        }

        fd = -1;
        return JNI_TRUE;
    }

    static JNINativeMethod sMethods[] = {
        {"init", "()Z", (void*)helloworld_init},
        {"close_led", "()Z", (void*)led_close},
        {"open_led", "()Z", (void *)let_open},
        {"led_device_open", "()Z", (void *)open_led_device},
        {"led_device_close", "()Z", (void *)close_led_device},
    };

    int request_android_server_HelloWorldService(JNIEnv* env){
        return jniRegisterNativeMethods(env, "com/android/server/HelloWorldService", sMethods, NELEM(sMethods));
    }
}
```

- 在Z:\itop-3399_8.1\frameworks\base\services\core\jni 目录下的Android.mk 文件中添加自己的jni 入口
```
LOCAL_SRC_FILES += \
    ~~~~~
    $(LOCAL_REL_DIR)/com_android_server_GraphicsStatsService.cpp \
    ####add ####################
	$(LOCAL_REL_DIR)/com_android_server_HelloWorldService.cpp \
	####add ####################
    $(LOCAL_REL_DIR)/onload.cpp
```