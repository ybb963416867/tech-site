---
title: "实现自己的HAL-8 通过Android 系统编译自己的app，用于控制hal"
description: "![HelloWorld文件的结构图](https://imgblog.csdnimg.cn/20210622145444322.png?xossprocess=image/watermark,typeZmFuZ3poZW5naGVp..."
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# 通过Android 系统编译自己的app，用于控制hal
- 系统app 是在  Z:\itop-3399_8.1\packages\apps  这个路径下
- 在Z:\itop-3399_8.1\packages\apps 创建 HelloWorld 
- HelloWorld  下创建res、src文件夹，以及 Android.mk
![如图](https://img-blog.csdnimg.cn/20210622144442449.png#pic_center)
 - 将Android studio 中 或则 eclipse 中生成的AndroidManifest.xml 拷贝过来
 ```
 <?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapplication">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        >
        <activity
            android:name="com.example.myapplication.MainActivity"
            android:label="@string/app_name"
            >
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
 ```
 - Android.mk
```
LOCAL_PATH:= $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE_TAGS := optional

LOCAL_SRC_FILES := $(call all-java-files-under, src)

LOCAL_PACKAGE_NAME := HelloWorld

LOCAL_CERTIFICATE := platform
#LOCAL_PRIVILEGED_MODULE := true

include $(BUILD_PACKAGE)

# Use the following include to make our test apk.
include $(call all-makefiles-under,$(LOCAL_PATH))
```
- res 文件

![HelloWorld文件的结构图](https://img-blog.csdnimg.cn/20210622145444322.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3lhbmdiaW5iaW5nQQ==,size_16,color_FFFFFF,t_70#pic_center)

- 将Android studio下 和 eclipse 下的 res 拷贝过来 
- 我的只对stirng.xml 做了修改
```
<resources>
    <string name="app_name">My Application</string>
    <string name="action_settings">Settings</string>
    <!-- Strings used for fragments for navigation -->
    <string name="first_fragment_label">First Fragment</string>
    <string name="second_fragment_label">Second Fragment</string>
    <string name="next">Next</string>
    <string name="previous">Previous</string>

    <string name="hello_first_fragment">Hello first fragment</string>
    <string name="hello_second_fragment">Hello second fragment. Arg: %1$s</string>
    <string name="add">相加</string>
    <string name="server_name">hello_world_service</string>
	<string name="init">初始化</string>
</resources>
```
- src 中 MainActivity.java 文件
```
package com.example.myapplication;

import android.app.Activity;
import android.os.Bundle;
import android.app.HelloWorldServiceManger;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

public class MainActivity extends Activity {

    private TextView tvResult;
    private int result;
    private boolean isInit;
    public static final String TAG = "hello_world_activity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        tvResult = findViewById(R.id.tv_result);
        findViewById(R.id.btn).setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                HelloWorldServiceManger service = (HelloWorldServiceManger) getSystemService(getString(R.string.server_name));
                isInit = service.init();
                if (isInit) {
                    Log.d(TAG, "onClick: 成功");
                } else {
                    Log.d(TAG, "onClick: 失败");
                }
            }
        });
        findViewById(R.id.btn1).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                HelloWorldServiceManger service = (HelloWorldServiceManger) getSystemService(getString(R.string.server_name));
                result = service.addVal(3, 4);
                tvResult.setText("addVal" + result);
            }
        });

    }
}
```
- 然后编译 HelloWorld  文件夹
> mmm  packages/apps/HelloWorld/
- 编译成功后会在 Z:\itop-3399_8.1\out\target\product\rk3399_mid\system\app\HelloWorld  路径下生成 HelloWorld.apk 文件
- 生成system.img 镜像  将 HelloWorld.apk 打包进入
> make snod

[系统编译的HelloWorld.app 源码下载](https://download.csdn.net/download/yangbinbingA/19776151)

将 system.img  刷入系统

- 刷完后打开 名字为  my_application 的app 
<img src="https://img-blog.csdnimg.cn/20210622151545857.JPG" alt="app"  width="500" height="313"/>
- 打开cmd ，看Android 的log日志
> adb logcat
- 点击初始化， 看到如下日志, hal 初始化成功
<img src = "https://img-blog.csdnimg.cn/2021062215311232.png" />
- 点击相加按钮 看到如下日志,app 调用 hal 成功
<img  src = "https://img-blog.csdnimg.cn/20210622153358756.png" />

