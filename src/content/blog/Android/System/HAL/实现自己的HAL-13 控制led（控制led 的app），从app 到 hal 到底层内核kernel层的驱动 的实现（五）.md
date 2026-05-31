---
title: "实现自己的HAL-13 控制led（控制led 的app），从app 到 hal 到底层内核kernel层的驱动 的实现（五）"
description: "<center <img style=\"borderradius: 0.3125em; boxshadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08)..."
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# 控制led 的app
- MainActivity.java 代码
```
package com.example.myapplication;

import android.app.Activity;
import android.os.Bundle;
import android.app.HelloWorldServiceManger;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

public class MainActivity extends Activity {

    private boolean isInit;
    public static final String TAG = "hello_world_activity";
    private HelloWorldServiceManger service;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        service = (HelloWorldServiceManger) getSystemService(getString(R.string.server_name));
        findViewById(R.id.btn).setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {

                isInit = service.init();
                if (isInit) {
                    Log.d(TAG, "onClick: init成功");
                } else {
                    Log.d(TAG, "onClick: init失败");
                }
            }
        });
        findViewById(R.id.btn1).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                boolean close = service.ledClose();
                if (close) {
                    Log.d(TAG, "onClick: close成功");
                } else {
                    Log.d(TAG, "onClick: close失败");
                }
            }
        });

        findViewById(R.id.btn2).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                boolean open = false;
                open = service.ledOpen();
                if (open) {
                    Log.d(TAG, "onClick: open成功");
                } else {
                    Log.d(TAG, "onClick: open失败");
                }
            }
        });

        findViewById(R.id.btn3).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                boolean  openDevice = false;
                openDevice = service.openLedDevice();
                if (openDevice) {
                    Log.d(TAG, "onClick: openLedDevice成功");
                } else {
                    Log.d(TAG, "onClick: openLedDevice失败");
                }
            }
        });

        findViewById(R.id.btn4).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                boolean  closeDevice = false;
                closeDevice = service.closeLedDevice();
                if (closeDevice) {
                    Log.d(TAG, "onClick: closeLedDevice成功");
                } else {
                    Log.d(TAG, "onClick: closeLedDevice失败");
                }
            }
        });

    }
}
```
- strings.xml 
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
    <string name="close">关闭led</string>
    <string name="server_name">helloworldservice</string>
    <string name="init">初始化</string>
    <string name="open">打开led</string>
    <string name="open_led_device">打开led设备</string>
    <string name="close_led_device">关闭led设备</string>
</resources>
```
- 编译  生成apk
> mmm packages/apps/HelloWorld/
- 打包system.img 镜像
> make snod   

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629172741903.png"  width = "500"  heigth = "100">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">显示my Application app 说明成功</div>
</center>

具体操作请看  [系统编译自己的app](https://blog.csdn.net/yangbinbingA/article/details/118106813)

**注意**
- 操作时需要给节点， 用户的访问读写权限
> chmod 0666 /dev/hello_led
- 需要关闭selinux 否者不可以获取到系统服务
> getenforce
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629181035240.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">说明selinux 开启状态，获取不到系统helloworld服务</div>
</center>

- 关闭selinux 
```
## 打开selinux 
setenforce 1
## 关闭selinux
setenforce 0
```
> setenforce 0
> getenforce
> 
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629181335723.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">说明selinux 关闭状态，可以获取到系统helloworld服务</div>
</center>
[app 源码](https://download.csdn.net/download/yangbinbingA/19897531)