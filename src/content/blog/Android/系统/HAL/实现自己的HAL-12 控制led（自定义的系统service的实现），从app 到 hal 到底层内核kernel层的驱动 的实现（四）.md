---
title: "实现自己的HAL-12 控制led（自定义的系统service的实现），从app 到 hal 到底层内核kernel层的驱动 的实现（四）"
description: "实现自己的HAL-12 控制led（自定义的系统service的实现），从app 到 hal 到底层内核kernel层的驱动 的实现（四） 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# 控制led的自定义的系统service的实现
- Z:\itop-3399_8.1\frameworks\base\core\java\android\os 下创建 IHelloWorldService.aidl
- IHelloWorldService.aidl 代码
```
/**
 * Copyright (c) 2007, The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package android.os;
/** {@hide} */
interface IHelloWorldService {
    boolean ledClose();
	boolean initHW();
	boolean ledOpen();
	boolean openLedDevice();
	boolean closeLedDevice();
}
```
- 将 IHelloWorldService.aidl  添加到Z:\itop-3399_8.1\frameworks\base 下的 Android.mk 中 以便编译成java 类
```
LOCAL_SRC_FILES += \
	core/java/android/accessibilityservice/IAccessibilityServiceConnection.aidl \
	core/java/android/accessibilityservice/IAccessibilityServiceClient.aidl \
	~~~~
	core/java/android/os/IHelloWorldService.aidl \
	~~~~
```
- 在Z:\itop-3399_8.1\frameworks\base\core\java\android\content 所在的文件夹下的 Context.java 中添加自己的service 的名字
```
public abstract class Context {
	//添加到了这里
	public static final String HELLO_WORLD = "hello_world_service";
	
    /** @hide */
    @IntDef(flag = true, prefix = { "MODE_" }, value = {
            MODE_PRIVATE,
            MODE_WORLD_READABLE,
            MODE_WORLD_WRITEABLE,
            MODE_APPEND,
    })
    ~~~~~
```
- Z:\itop-3399_8.1\frameworks\base\services\core\java\com\android\server 下创建 HelloWorldService.java 
- HelloWorldService.java 代码
```
package com.android.server;
import android.util.Slog;
import android.os.IHelloWorldService;
public class HelloWorldService extends IHelloWorldService.Stub {
	
	private static final String TAG = "HelloWorldService" ;

    public HelloWorldService() {
       	boolean result = init();
		if(result){
			Slog.d(TAG, "init success");
		}else {
			Slog.d(TAG, "init error");
		}
    }
	
	@Override 
    public boolean ledClose() {
		boolean result = close_led();
        if(result){
			Slog.d(TAG, "ledClose is success");
		}else {
			Slog.d(TAG, "ledClose is error");
		}
        return result;
    }
	
	@Override 
	public boolean  initHW(){
		boolean result = init();
		if(result){
			Slog.d(TAG, "init success");
		}else {
			Slog.d(TAG, "init error");
		}
		return result;
	}
	
	@Override
	public boolean  ledOpen(){
		boolean result = open_led();
		if(result){
			Slog.d(TAG, "letOpen is success");
		}else {
			Slog.d(TAG, "letOpen is error");
		}
		
		return result;
	}
	
	@Override
	public boolean  openLedDevice(){
		boolean result = led_device_open();
		if(result){
			Slog.d(TAG, "openLedDevice is success");
		}else {
			Slog.d(TAG, "openLedDevice is error");
		}
		
		return result;
	}
	
	@Override
	public boolean  closeLedDevice(){
		boolean result = led_device_close();
		if(result){
			Slog.d(TAG, "closeLedDevice is success");
		}else {
			Slog.d(TAG, "closeLedDevice is error");
		}
		
		return result;
	}	

    private static native boolean init();
    private static native boolean close_led();
	private static native boolean open_led();
	private static native boolean led_device_open();
	private static native boolean led_device_close();
}
```
- 将HelloWorldService 添加到Z:\itop-3399_8.1\frameworks\base\services\java\com\android\server 下的 SystemServer 中
```
 private void startOtherServices() {
			~~~~
            traceBeginAndSlog("StartKeyAttestationApplicationIdProviderService");
            ServiceManager.addService("sec_key_att_app_id_provider",
                    new KeyAttestationApplicationIdProviderService(context));
            traceEnd();
			///////////////添加到了这里///////////////////////////////////////////////////
			traceBeginAndSlog("StartHelloWorldService");       
            ServiceManager.addService(Context.HELLO_WORLD, new HelloWorldService());             
			traceEnd();
			~~~~
}
```
- 将HelloWorldService 服务注册到 Z:\itop-3399_8.1\frameworks\base\core\java\android\app 下的 SystemServiceRegistry 中
```
final class SystemServiceRegistry {
    private static final String TAG = "SystemServiceRegistry";

    // Service registry information.
    // This information is never changed once static initialization has completed.
    private static final HashMap<Class<?>, String> SYSTEM_SERVICE_NAMES =
            new HashMap<Class<?>, String>();
    private static final HashMap<String, ServiceFetcher<?>> SYSTEM_SERVICE_FETCHERS =
            new HashMap<String, ServiceFetcher<?>>();
    private static int sServiceCacheSize;

    // Not instantiable.
    private SystemServiceRegistry() { }

    static {

			 registerService(Context.HELLO_WORLD, HelloWorldServiceManger.class,
		                new CachedServiceFetcher<HelloWorldServiceManger>() {
		            @Override
		            public HelloWorldServiceManger createService(ContextImpl ctx) throws ServiceNotFoundException{
						IBinder b = ServiceManager.getServiceOrThrow(Context.HELLO_WORLD);
						IHelloWorldService service = IHelloWorldService.Stub.asInterface(b);
		                return new HelloWorldServiceManger(service);
		            }});
    
      }
 }
```
- 编译system.img 镜像
>make systemimage -j8 

- 刷到开发版
- 系统启动时成功打印如下说明成功
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629172115346.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">HelloWorldService 说明成功</div>
</center>

