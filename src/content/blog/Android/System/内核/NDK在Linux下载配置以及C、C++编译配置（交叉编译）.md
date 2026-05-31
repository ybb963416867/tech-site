---
title: "NDK在Linux下载配置以及C、C++编译配置（交叉编译）"
description: "我们搭建好Ubutu虚拟机之后，通过xShell远程登录Ubutu上SSH服务器，在xShell上可以进行相关的编译操作了。但是我们在xShell上gcc、g++编译的可执行文件只能在Linux上执行，但是我们需要编译出来的东西可以在..."
pubDate: 2026-05-29
category: "内核"
tags: [Shell]
draft: false
---
# NDK在Linux下载配置以及C、C++编译配置（交叉编译）

## 前言：

我们搭建好Ubutu虚拟机之后，通过xShell远程登录Ubutu上SSH服务器，在xShell上可以进行相关的编译操作了。但是我们在xShell上gcc、g++编译的可执行文件只能在Linux上执行，但是我们需要编译出来的东西可以在Android端使用，这就需要进行交叉编译，在Ubutu上编译出Android可执行的文件以及动态库。在编译之前，需要将NDK下载安装完成，并且成功配置环境变量，才能进行下面编译。废话不多说了，开始介绍了(备注：以下命令均在xShell中输入完成的)：

#### 1、下载安装NDK以及配置环境变量

> wget <https://dl.google.com/android/repository/android-ndk-r17-beta2-linux-x86_64.zip>

下载完成之后查看当前目录（主要是查看下载完之后安装包的名字：android-ndk-r17-beta2-linux-x86\_64.zip）：

> ls -l

解压安装

> unzip android-ndk-r17-beta2-linux-x86\_64.zip

解压完成之后再次查看目录：

> ls -l
> 你将会看到一个文件夹：android-ndk-r17-beta2（这个就是解压之后文件夹）根据个人习惯，将此文件夹放在存储的位置。

我是将此文件夹移动到/usr/local/目录下：

> mv android-ndk-r17-beta2 /usr/local/

配置NDK的环境变量：

> vi /etc/profile
> 进入之后输入一个i,进入编辑状态

> export NDK=/usr/local/android-ndk-r17-beta2

> export PATH=`$PATH:$`NDK

按一下返回键，再按：，再输入wq! 保存并退出。

刷新一下/etc/profile

> source /etc/profile
> 检查是否安装成功：
> ndk-build -v

![img](https://upload-images.jianshu.io/upload_images/2406435-f6fe14219cdbe282.png?imageMogr2/auto-orient/strip|imageView2/2/w/642/format/webp)

image.png

到这里只是将NDK安装成功了而已，编译之路漫长。

#### 2、交叉编译Android可执行文件

创建一个C文件，并在里面编写相关的代码：

> vi main.c

    #include <stdio.h>
    void main(){
       printf("成都");
    }

保存并退出，ls -l查看当前目录是否存在main.c的文件，这里我们需要用NDK里面的gcc编译器进行编译，南无我们进行相关环境变量的配置（在/etc/profile配置保存并退出）。同时也引入相关的头文件，不然找不到头文件。

    export NDK_GCC=/usr/local/android-ndk-r17-beta2/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/arm-linux-androideabi-gcc
    export HO="--sysroot=/usr/local/android-ndk-r17-beta2/platforms/android-21/arch-arm -isystem /usr/local/android-ndk-r17-beta2/sysroot/usr/include  -isystem /usr/local/android-ndk-r17-beta2/sysroot/usr/include/arm-linux-androideabi"

配置好之后，我们进行编译
`$NDK_GCC $`HO -pie main.c -o main

这时候再去查看目录多了一个main文件,将main文件到处到桌面

> sz main

这时打开Windows命令行(进入到桌面的目录,需提前配置好adb命令)：

> cd Desktop

将main文件放进存储卡

> adb push main /sdcard/

使用adb shell命令

> adb shell

进入到手机存储卡目录

> cd /sdcard/

执行文件（需要手机获取root权限才可以执行）

> ./main

此时可在Windows命令行上面看到输出乱码（由于编码问题），表示成功了。这样操作就顺利完成交叉编译。

#### *注意如果出现了没有这个文件，或者权限被拒绝 这样操作*

##### 打开Android 模拟器

##### 将文件拷贝到sd卡中

##### 执行命令将文件拷贝到 /data/local/tmp 下

> cp -r file(文件名字)  /data/local/tmp

##### 这个是时候这个文件是没有执行权限的，也没有权限给这个文件添加可执行权限需要执行  获取root权限

> su root

执行给main 这个可执行的文件添加  可执行权限

> chmod 777 main

然后执行这个文件

> ./main

#### 2、编译Android可执行动态库

创建一个C文件

    #include <stdio.h>
    int test(int a){
        return 20+a;
    }

把创建的C文件编译成动态库,同样将该动态库导出到桌面

> `$NDK_GCC $`HO -shared -fPIC test.c -o libTest.so

创建一个Android NDK项目，按照下图目录将.so文件放置进去

![img](https://upload-images.jianshu.io/upload_images/2406435-409ca7fcec91f4c2.png?imageMogr2/auto-orient/strip|imageView2/2/w/363/format/webp)

image.png

好了接下来我们配置Android端动态库相关信息(native-lib.cpp文件)

    #include <jni.h>
    #include <string>
    #include <android/log.h>
    extern "C"{
    extern int test(int a);
    }
    extern "C"
    JNIEXPORT jstring JNICALL
    Java_com_example_administrator_lsn_19_MainActivity_stringFromJNI(JNIEnv *env, jobject instance) {

        std::string hello = "Hello from C++";
        __android_log_print(ANDROID_LOG_ERROR,"jni","libtest.so 里面的 test 方法:%d",test(5));
        return env->NewStringUTF(hello.c_str());
    }

CMakeLists.txt

    cmake_minimum_required(VERSION 3.4.1)
    add_library( # Sets the name of the library.
                 native-lib
                 SHARED
                 src/main/cpp/native-lib.cpp )
    find_library( # Sets the name of the path variable.
                  log-lib
                  log )
    #设置一个变量
    #CMAKE_CXX_FLAGS c++参数 会传给编译器
    #CMAKE_C_FLAGS   c参数   会传给编译器
    #重新定义 CMAKE_CXX_FLAGS变量
    #CMAKE_SOURCE_DIR指的是当前这个文件的地址
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -L${CMAKE_SOURCE_DIR}/src/main/jniLibs/armeabi-v7a")

    target_link_libraries( # Specifies the target library.
                           native-lib
                           Test
                           # Links the target library to the log library
                           # included in the NDK.
                           ${log-lib} )

最后在Maintivity使用

    package com.example.administrator.lsn_9;

    import android.support.v7.app.AppCompatActivity;
    import android.os.Bundle;
    import android.widget.TextView;

    public class MainActivity extends AppCompatActivity {

        // Used to load the 'native-lib' library on application startup.
        static {
            System.loadLibrary("native-lib");
            System.loadLibrary("Test");

        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_main);
            TextView tv = (TextView) findViewById(R.id.sample_text);
            tv.setText(stringFromJNI());
        }

        public native String stringFromJNI();
    }

可以看到输出的日志中结果是25，成功运行动态库里面的test(int a)方法。

**一、Android NDK cmak 脚本编译**
从Android官方下载NDK工具，然后在系统变量中记得添加NDK主目录，不然无法使用ndk-build命令编译应用。
使用NDK手动编译生成.so文件：
1）新建应用名称，如hello。
2）在hello文件夹下新建目录jni
3）在jni目录下新建hello.c，内容如下：

```c
 #include<stdio.h>
int main(int argc, char* argv[])
{
printf("hello world");
return 0;
}
```

4）同样在jni目录下 新建 Android.mk 和 Application.mk

```gragle
LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib -llog    
#编译hello.c时需要依赖的共享库(android下的log，此处并没有使用)
 #LOCAL_ARM_MODE := arm
LOCAL_MODULE := hello                                 #编译完成后需要生成的.so名称
LOCAL_SRC_FILES := hello.c                            #编译的原文件名
include $(BUILD_SHARED_LIBRARY)           #编译结果可以生成共享库和可执行库，NDK都是共
```

以上是Android.mk中内容，Application.mk内容如下：

    APP_ABI := x86 armeabi-v7a                                #希望编译生成的平台

保存好上面三个文件，然后进入到hello文件夹下，执行命令：ndk-build。
命令执行完会在hello文件夹下生成额外的两个文件夹：libs和obj，libs文件夹下的.so文件正是我们所需要的。

#### 注意在使用如上的mk 是会报错如下

    [x86] Executable     : hello
    /usr/local/android-ndk-r16b/platforms/android-14/arch-x86
    /usr/lib/crtbegin_dynamic.o:crtbegin.c:function _start: error: undefined reference to 'main'
    clang++: error: linker command failed with exit code 1 (use -v to see invocation)

解决 mk 文件是这样的

    LOCAL_PATH := $(call my-dir)
    include $(CLEAR_VARS)
    LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib -llog    #编译hello.c时需要依赖的共享库(android下的log，此处并没有使用)
     #LOCAL_ARM_MODE := arm
    LOCAL_MODULE := hello                                     #编译完成后需要生成的.so名称
    LOCAL_SRC_FILES := hello.c
    include $(BUILD_EXECUTABLE)                  #编译结果可以生成共享库和可执行库，NDK都是共享库-Shared

#### 通过上面的mk 文件编译后的可执行文件在Android 手机上执行时会报错，错误如下

    generic_x86_arm:/data/local/tmp # ./hello 
    "./hello": error: Android 5.0 and later only support position-independent executables (-fPIE).

正确的mk文件的内容为

    LOCAL_PATH := $(call my-dir)
    include $(CLEAR_VARS)
    LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib -llog    #编译hello.c时需要依赖的共享库(android下的log，此处并没有使用)
     #LOCAL_ARM_MODE := arm
    LOCAL_MODULE := hello                                     #编译完成后需要生成的.so名称
    LOCAL_SRC_FILES := hello.c

    LOCAL_CFLAGS += -pie -fPIE
    LOCAL_LDFLAGS += -pie -fPIE

    include $(BUILD_EXECUTABLE)                  #编译结果可以生成共享库和可执行库，NDK都是共享库-Shared

到此ok

#### 普通的交叉编译生成可执行的文件

```
```

