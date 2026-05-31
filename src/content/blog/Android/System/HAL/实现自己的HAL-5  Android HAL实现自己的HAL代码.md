---
title: "实现自己的HAL-5 Android HAL实现自己的HAL代码"
description: "代码"
pubDate: 2026-05-29
category: "HAL"
tags: [iOS, CSS]
draft: false
---
# JNI层的代码
## jni层代码的编写
- 首先找到系统中onload.cpp 所在的目录
- 我的是在Z:\itop-3399_8.1\frameworks\base\services\core\jni 这个路径 
- 在这个路径下创建com_android_server_HelloWorldService.cpp的cpp文件

**代码**
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

    static jint helloworld_AddVal(JNIEnv* env, jobject clazz, jint a, jint b){

        int result;
        if(!helloworld_device){
            ALOGI("hello jni device is not open");
            return  JNI_FALSE;
        }

        helloworld_device->helloworld_add(helloworld_device, a, b, &result);
        return result;

    }
    static JNINativeMethod sMethods[] = {
        {"init", "()Z", (void*)helloworld_init},
        {"addValue", "(II)I", (void*)helloworld_AddVal},
    };

    int request_android_server_HelloWorldService(JNIEnv* env){
        return jniRegisterNativeMethods(env, "com/android/server/HelloWorldService", sMethods, NELEM(sMethods));
    }
}
```
-  注意头文件所在的目录
```
"Z:/itop-3399_8.1/hardware/libhardware/include/",
"Z:/itop-3399_8.1/system/core/include",
"Z:/itop-3399_8.1/libnativehelper/include",
"Z:/itop-3399_8.1/libnativehelper/include_jni",
"Z:/itop-3399_8.1/frameworks/base/core/jni/include",
"Z:/itop-3399_8.1/frameworks/native/libs/binder/include"
```
## Android.mk 的修改
- 在LOCAL_SRC_FILES  下添加自己的com_android_server_HelloWorldService.cpp 文件
```
LOCAL_SRC_FILES += \
    $(LOCAL_REL_DIR)/BroadcastRadio/JavaRef.cpp \
    $(LOCAL_REL_DIR)/BroadcastRadio/NativeCallbackThread.cpp \
    $(LOCAL_REL_DIR)/BroadcastRadio/BroadcastRadioService.cpp \
    $(LOCAL_REL_DIR)/BroadcastRadio/Tuner.cpp \
    $(LOCAL_REL_DIR)/BroadcastRadio/TunerCallback.cpp \
    $(LOCAL_REL_DIR)/BroadcastRadio/convert.cpp \
    $(LOCAL_REL_DIR)/BroadcastRadio/regions.cpp \
    $(LOCAL_REL_DIR)/com_android_server_AlarmManagerService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_am_BatteryStatsService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_connectivity_Vpn.cpp \
    $(LOCAL_REL_DIR)/com_android_server_connectivity_tethering_OffloadHardwareInterface.cpp \
    $(LOCAL_REL_DIR)/com_android_server_ConsumerIrService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_HardwarePropertiesManagerService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_hdmi_HdmiCecController.cpp \
    $(LOCAL_REL_DIR)/com_android_server_input_InputApplicationHandle.cpp \
    $(LOCAL_REL_DIR)/com_android_server_input_InputManagerService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_input_InputWindowHandle.cpp \
    $(LOCAL_REL_DIR)/com_android_server_lights_LightsService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_location_ContextHubService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_location_GnssLocationProvider.cpp \
    $(LOCAL_REL_DIR)/com_android_server_locksettings_SyntheticPasswordManager.cpp \
    $(LOCAL_REL_DIR)/com_android_server_power_PowerManagerService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_SerialService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_storage_AppFuseBridge.cpp \
    $(LOCAL_REL_DIR)/com_android_server_SystemServer.cpp \
    $(LOCAL_REL_DIR)/com_android_server_tv_TvUinputBridge.cpp \
    $(LOCAL_REL_DIR)/com_android_server_tv_TvInputHal.cpp \
    $(LOCAL_REL_DIR)/com_android_server_vr_VrManagerService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_UsbDeviceManager.cpp \
    $(LOCAL_REL_DIR)/com_android_server_UsbDescriptorParser.cpp \
    $(LOCAL_REL_DIR)/com_android_server_UsbMidiDevice.cpp \
    $(LOCAL_REL_DIR)/com_android_server_UsbHostManager.cpp \
    $(LOCAL_REL_DIR)/com_android_server_VibratorService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_PersistentDataBlockService.cpp \
    $(LOCAL_REL_DIR)/com_android_server_GraphicsStatsService.cpp \
    ############################################################
	$(LOCAL_REL_DIR)/com_android_server_HelloWorldService.cpp \
    ############################################################
    $(LOCAL_REL_DIR)/onload.cpp
```
## onload.cpp修改
- 在namespace android 中声明自己在com_android_server_HelloWorldService.cpp 中 编写的				request_android_server_HelloWorldService(JNIEnv* env) 这个函数
```
namespace android {
	int request_android_server_HelloWorldService(JNIEnv* env);
}
```
- 然后在JNI_OnLoad 函数中 将request_android_server_HelloWorldService(JNIEnv* env)  添加进入
```
extern "C" jint JNI_OnLoad(JavaVM* vm, void* /* reserved */)
{
    JNIEnv* env = NULL;
    jint result = -1;

    if (vm->GetEnv((void**) &env, JNI_VERSION_1_4) != JNI_OK) {
        ALOGE("GetEnv failed!");
        return result;
    }
    ALOG_ASSERT(env, "Could not retrieve the env!");
    register_com_android_server_rkdisplay_RkDisplayModes(env);
    request_android_server_HelloWorldService(env);
    return JNI_VERSION_1_4;
}
```

## 编译自己写的jni 代码
- 在编译这个模块前先将系统源码编译通过，为编译系统源码会生成好多工具，这些工具可以用来单独模块编译
- 配置执行文件
> source build//envsetup.sh 
- 选择在什么环境编译
> lunch

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210609145216225.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center#pic_center)

- 编译自己的写的模块
> mmm  frameworks/base/services/core/
- 打包system.img 镜像
> make snod
- 编译完成后会在\out\target\product\rk3399_mid\system\lib  这个目录下生成 libandroid_servers.so  说明编译成功
