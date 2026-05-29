---
title: "实现自己的HAL-6 serivce 和aidl层的代码"
description: "实现自己的HAL-6 serivce 和aidl层的代码 的技术笔记。"
pubDate: 2026-05-29
category: "HAL"
tags: [API]
draft: false
---
# serivce 和aidl层的代码
- Z:\itop-3399_8.1\frameworks\base\core\java\android\os  在这个路径下创建IHelloWorldService.aidl
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
    int addVal(int a, int b);
	boolean initHW();
}
```
- 将自己的aidl文件注册到make 文件中以便编译生成java文件
- 在Z:\itop-3399_8.1\frameworks\base 路径下的Android.mk 问价中添加自己的aidl文件
```
LOCAL_SRC_FILES += \
core/java/android/os/ICancellationSignal.aidl \
core/java/android/os/IDeviceIdentifiersPolicyService.aidl \
core/java/android/os/IDeviceIdleController.aidl \
core/java/android/os/IHardwarePropertiesManager.aidl \
###############################
core/java/android/os/IHelloWorldService.aidl \
###############################
core/java/android/os/IIncidentManager.aidl \
```

- Z:\itop-3399_8.1\frameworks\base\services\core\java\com\android\server 下创建HelloWorldService.java

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
        Slog.d(TAG, "HelloWorldService: init result=" + addVal(3, 5));
    }
	
	@Override 
    public int addVal(int a, int b) {
		int result = 0;
		result = addValue(a, b);
        Slog.d(TAG, "HelloWorldService: "+ "a :" + a + "b: " + b + "result: " + result);
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

    private static native boolean init();
    private static native int addValue(int a , int b);
}
```
- 在Context.java 添加自己的 服务的名字  HELLO_WORLD 
- Context.java  文件在  Z:\itop-3399_8.1\frameworks\base\core\java\android\content 目录下
```
public abstract class Context {
	
	public static final String HELLO_WORLD = "hello_world_service";
	
    /** @hide */
    @IntDef(flag = true, prefix = { "MODE_" }, value = {
            MODE_PRIVATE,
            MODE_WORLD_READABLE,
            MODE_WORLD_WRITEABLE,
            MODE_APPEND,
    })
    @Retention(RetentionPolicy.SOURCE)
    public @interface FileMode {}

    /** @hide */
    @IntDef(flag = true, prefix = { "MODE_" }, value = {
            MODE_PRIVATE,
            MODE_WORLD_READABLE,
            MODE_WORLD_WRITEABLE,
            MODE_MULTI_PROCESS,
    })
    ......
}
```

- 将自己的服务注册到SystemServer.java
- 我的SystemServer.java server在 Z:\itop-3399_8.1\frameworks\base\services\java\com\android\server 目录下

```
	traceBeginAndSlog("StartHelloWorldService");
                try {
                    ServiceManager.addService(Context.NETWORK_POLICY_SERVICE, new HelloWorldService());
                } catch (Throwable e) {
                    reportWtf("starting HelloWorld Service", e);
                }
     traceEnd();
```

- 在Z:\itop-3399_8.1\frameworks\base\core\java\android\app  目录下HelloWorldServiceManger.java 文件 方便与app的调用
- HelloWorldServiceManger.java 代码
```
package android.app;
import android.os.IHelloWorldService;
import android.util.Slog;
public class HelloWorldServiceManger {
	private IHelloWorldService mIHelloWorldService;
	private static final String TAG = "HelloWorldServiceManger";
	public HelloWorldServiceManger(IHelloWorldService iHelloWorldService){
		mIHelloWorldService = iHelloWorldService;
		Slog.d(TAG, "HelloWorldServiceManger()");
	}
	
	public int addVal(int a, int b){
		Slog.d(TAG, "addVal()");
		int result = -1;
        try {
            result = mIHelloWorldService.addVal(a, b);
        }catch (Exception e){
            e.printStackTrace();
        }
		
		return result;
    }
	
	public boolean init(){
		Slog.d(TAG, "init()");
		boolean result = false;
		try {
            result = mIHelloWorldService.initHW();
        }catch (Exception e){
            e.printStackTrace();
        }
		
		return result;
		
	}
}
```
- 将自己的HelloWorldServiceManger 注册进SystemServiceRegistry中，便于 通过 HelloWorldServiceManger 找到自己的HelloWorldService
- SystemServiceRegistry.java 文件在 Z:\itop-3399_8.1\frameworks\base\core\java\android\app 这个目录下
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
		        registerService(Context.ACCESSIBILITY_SERVICE, AccessibilityManager.class,
		                new CachedServiceFetcher<AccessibilityManager>() {
		            @Override
		            public AccessibilityManager createService(ContextImpl ctx) {
		                return AccessibilityManager.getInstance(ctx);
		            }});
.....
///////////////////////////////////////////////////注册自己的HelloWorldServiceManger /////////////////////////////////////////
			 registerService(Context.HELLO_WORLD, HelloWorldServiceManger.class,
			                new CachedServiceFetcher<HelloWorldServiceManger>() {
			            @Override
			            public HelloWorldServiceManger createService(ContextImpl ctx) throws ServiceNotFoundException{
							IBinder b = ServiceManager.getServiceOrThrow(Context.HELLO_WORLD);
							IHelloWorldService service = IHelloWorldService.Stub.asInterface(b);
			                return new HelloWorldServiceManger(service);
			            }});

///////////////////////////////////////////////////注册自己的HelloWorldServiceManger /////////////////////////////////////////

          }
}
```
- 更新api
> make update-api
- 编译源码
>  make -j16
