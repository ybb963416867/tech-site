---
title: "hal体系结构与设计思想-1"
description: "hal体系结构与设计思想-1 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [API]
draft: false
---
# hal体系结构与设计思想

## hal在Android 架构中的位置

![img](https://bkimg.cdn.bcebos.com/pic/2fdda3cc7cd98d10ac7dfab52b3fb80e7aec908d?x-bce-process=image/watermark,image_d2F0ZXIvYmFpa2U4MA==,g_7,xp_5,yp_5/format,f_auto)

## HAL设计思想

- 为什么需要HAL

1. 传统的linux对硬件的操作基本上在内核空间的linux驱动程序中实现了，那么现在为什么那么多此一举把对硬件的操作分为两部分，hal和linux驱动呢?
谷歌搭好了hal的框架，为上层framework打通过jni调用hal提供了统一的api，硬件开发商或者移植人员只需要按照框架开发即可，无需话费精力在与上层的交互上的实现上，将精力放在hal层本身的实现上即可。
2. 从商业角度，许多硬件厂商不愿意将自己硬件相关一些核心的东西开源出去，假如将对自己硬件的驱动程序全部放入内核空间驱动程序实现，那么必须遵循GPL协议，是必需开源的。有了HAL层之后，他们可以把一些核心的算法之类的东西的实现放在HAL层，而hal层位于用户空间，
  不属于linux内核，和android源码一样遵循的是
  appache协议，这个是可以开源或者不开的。

- HAL的实现思路

1. 半针对每种硬件实现HAL接口代码，上层应用通过动态库加载的方式，调用HAL层接口代码，实现与硬件通讯功能
2. 半伸用C语言的结构体继承的技巧，来实现面向对象语言中继承的概念。

## hal实现的方法

- 代码主要路径

```
/hardware/libhardware/include/hardware/hardware.h/
/hardware/libhardware/hardware.c
```

- 关键的数据变量和结构体

  ```
  struct hw_module_t
  ```

  

```
typedef struct hw_module_t {
    /** tag must be initialized to HARDWARE_MODULE_TAG */
    uint32_t tag;

    /**
     * The API version of the implemented module. The module owner is
     * responsible for updating the version when a module interface has
     * changed.
     *
     * The derived modules such as gralloc and audio own and manage this field.
     * The module user must interpret the version field to decide whether or
     * not to inter-operate with the supplied module implementation.
     * For example, SurfaceFlinger is responsible for making sure that
     * it knows how to manage different versions of the gralloc-module API,
     * and AudioFlinger must know how to do the same for audio-module API.
     *
     * The module API version should include a major and a minor component.
     * For example, version 1.0 could be represented as 0x0100. This format
     * implies that versions 0x0100-0x01ff are all API-compatible.
     *
     * In the future, libhardware will expose a hw_get_module_version()
     * (or equivalent) function that will take minimum/maximum supported
     * versions as arguments and would be able to reject modules with
     * versions outside of the supplied range.
     */
    uint16_t module_api_version;
#define version_major module_api_version
    /**
     * version_major/version_minor defines are supplied here for temporary
     * source code compatibility. They will be removed in the next version.
     * ALL clients must convert to the new version format.
     */

    /**
     * The API version of the HAL module interface. This is meant to
     * version the hw_module_t, hw_module_methods_t, and hw_device_t
     * structures and definitions.
     *
     * The HAL interface owns this field. Module users/implementations
     * must NOT rely on this value for version information.
     *
     * Presently, 0 is the only valid value.
     */
    uint16_t hal_api_version;
#define version_minor hal_api_version

    /** Identifier of module */
    const char *id;

    /** Name of this module */
    const char *name;

    /** Author/owner/implementor of the module */
    const char *author;

    /** Modules methods */
    struct hw_module_methods_t* methods;

    /** module's dso */
    void* dso;

#ifdef __LP64__
    uint64_t reserved[32-7];
#else
    /** padding to 128 bytes, reserved for future use */
    uint32_t reserved[32-7];
#endif
}
```

**主要属性:**

```
char* id  
struct  hw_module_methods_t
char* name
```

------

- 关键的结构体

  ```
  struct hw_module_methods_t 
  ```

```
typedef struct hw_module_methods_t {
    /** Open a specific device */
    int (*open)(const struct hw_module_t* module, const char* id,
            struct hw_device_t** device);

}
```

**主要属性:**

```
int (*open) (const struct hw_module_t* module , const char* id,  struct hw_device_t** device);
```

------

- 关键的结构体

  ```
  struct hw_device_t
  ```

```
typedef struct hw_device_t {
    /** tag must be initialized to HARDWARE_DEVICE_TAG */
    uint32_t tag;

    /**
     * Version of the module-specific device API. This value is used by
     * the derived-module user to manage different device implementations.
     *
     * The module user is responsible for checking the module_api_version
     * and device version fields to ensure that the user is capable of
     * communicating with the specific module implementation.
     *
     * One module can support multiple devices with different versions. This
     * can be useful when a device interface changes in an incompatible way
     * but it is still necessary to support older implementations at the same
     * time. One such example is the Camera 2.0 API.
     *
     * This field is interpreted by the module user and is ignored by the
     * HAL interface itself.
     */
    uint32_t version;

    /** reference to the module this device belongs to */
    struct hw_module_t* module;

    /** padding reserved for future use */
#ifdef __LP64__
    uint64_t reserved[12];
#else
    uint32_t reserved[12];
#endif

    /** Close this device */
    int (*close)(struct hw_device_t* device);

}
```

**主要属性:**

```
  int (*close)(struct hw_device_t* device);
```

## hal模块的实现方法

![](https://img-blog.csdnimg.cn/20210607201949490.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center)

## hal模块的实现方法
![image](https://img-blog.csdnimg.cn/20210608105915307.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center)