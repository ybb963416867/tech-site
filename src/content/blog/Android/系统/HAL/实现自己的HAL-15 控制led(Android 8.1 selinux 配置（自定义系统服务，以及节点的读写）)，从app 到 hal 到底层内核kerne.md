---
title: "实现自己的HAL-15 控制led(Android 8.1 selinux 配置（自定义系统服务，以及节点的读写）)，从app 到 hal 到底层内核kerne"
description: "声明 服务helloworldservice 的名字为helloworldserviceservice 2. 在Z:\\itop33998.1\\system\\sepolicy\\public\\service.te 下 添加"
pubDate: 2026-05-29
category: "HAL"
tags: [Mac, Shell, API, CSS]
draft: false
---
# Android 8.1  selinux 配置（自定义系统服务，以及节点的读写）
##  SELinux概述
 - SELinux 简述
SELinux，安全增强Linux（Security-Enhanced Linux），是由美国国家安全局(NSA)发起, 多个非营利组织和高校参与开发的强制性安全审查机制（Mandatory Access control，简称MAC）。SELinux最早于2000年12月采用GPL许可发布。目前，Linux Kernel 2.6 及以上的版本都已经集成了SELinux。
- SELinux模式
	- Disabled(关闭)，Selinux并没有实际运行。
	- Permissve(宽容模式)，宽容模式只通过Kernel Audit System 记录LOG, 但不拦截访问。
	- Enfocing mode(强制模式)，强制模式在记录LOG 的同时，还会拦截访问。
- 查看SELinux
	> adb shell getenforce
	- 在设备里使用
	> getenforce
- 设置SELinux模式
	> adb shell setenforce 1
	> adb shell setenforce 0
	- 0是Permissve
	- 1是Enfocing
## SELinux 的实战配置
- Android 自定义服务，添加avc权限
- 在[自定义的系统service的实现](https://blog.csdn.net/yangbinbingA/article/details/118339389) 中 添加的系统服务  在app 调用(HelloWorldServiceManger) getSystemService("helloworldservice"); 时会找不到"helloworldservice"这个服务，原因如下：
	
	```
	E/SELinux: avc:  denied  { add } for service=hello_world_service pid=474 uid=1000 
	scontext=u:r:system_server:s0 		
	tcontext=u:object_r:default_android_service:s0 tclass=service_manager permissive=1
	```
	- 将helloworldservice 该服务addservice 到 SystemService  需要添加 SELinux 的avc权限
	- 添加权限的一些配置步骤
	```
			traceBeginAndSlog("StartHelloWorldService");       
            ServiceManager.addService(Context.HELLO_WORLD, new HelloWorldService());             
			traceEnd();
	```
	```
		public abstract class Context {
				~~~
				public static final String HELLO_WORLD = "helloworldservice";
				~~~
		}
	```
- 通过以上的代码可以看出我的服务是 "helloworldservice",那么就有以 "helloworldservice" 为例，这个名字中尽量不要包含"_"这个符号
1. 在Z:\itop-3399_8.1\system\sepolicy\private\service_contexts 下添加
```
window                                    u:object_r:window_service:s0
*                                         u:object_r:default_android_service:s0
###在这里##########
helloworldservice						  u:object_r:helloworldservice_service:s0
```
**声明  服务helloworldservice  的名字为helloworldservice_service**
 	
2. 在Z:\itop-3399_8.1\system\sepolicy\public\service.te 下 添加 

```
type wifiaware_service, app_api_service, system_server_service, service_manager_type;
type window_service, system_api_service, system_server_service, service_manager_type;
###########在这里###############
type helloworldservice_service,app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
```
**声明 helloworldservice_service  类型**

3.  在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\private\service_contexts 添加同样的

```
window                                    u:object_r:window_service:s0
*                                         u:object_r:default_android_service:s0
###########在这里####################
helloworldservice						  u:object_r:helloworldservice_service:s0
```

4. 在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\public\service.te 添加同样的
```
type window_service, system_api_service, system_server_service, service_manager_type;
###########在这里####################
type helloworldservice_service,app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
```
5. 在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\nonplat_sepolicy.cil 下 添加
```
(roletype object_r voiceinteraction_service_26_0)
(typeattribute vr_manager_service_26_0)
(roletype object_r vr_manager_service_26_0)
##############################################添加在这里#################
(typeattribute helloworldservice_service_26_0)
(roletype object_r helloworldservice_service_26_0)
##############################################添加在这里#################

(typeattribute wallpaper_service_26_0)
```
6. 在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\nonplat_sepolicy.cil 下添加

**找到 typeattributeset system_server_service  在后面拼加 自己的   helloworldservice_service_26_0**
```
#############  找到 typeattributeset system_server_service  在后面拼加 自己的   helloworldservice_service_26_0######################### 下面是我的
(typeattributeset system_server_service (accessibility_service_26_0 account_service_26_0 activity_service_26_0 alarm_service_26_0 appops_service_26_0 appwidget_service_26_0 assetatlas_service_26_0 audio_service_26_0 autofill_service_26_0 backup_service_26_0 batterystats_service_26_0 battery_service_26_0 bluetooth_manager_service_26_0 cameraproxy_service_26_0 clipboard_service_26_0 contexthub_service_26_0 IProxyService_service_26_0 commontime_management_service_26_0 companion_device_service_26_0 connectivity_service_26_0 connmetrics_service_26_0 consumer_ir_service_26_0 content_service_26_0 country_detector_service_26_0 coverage_service_26_0 cpuinfo_service_26_0 dbinfo_service_26_0 device_policy_service_26_0 deviceidle_service_26_0 device_identifiers_service_26_0 devicestoragemonitor_service_26_0 diskstats_service_26_0 display_service_26_0 font_service_26_0 netd_listener_service_26_0 DockObserver_service_26_0 dreams_service_26_0 dropbox_service_26_0 ethernet_service_26_0 fingerprint_service_26_0 gfxinfo_service_26_0 graphicsstats_service_26_0 hardware_service_26_0 hardware_properties_service_26_0 hdmi_control_service_26_0 input_method_service_26_0 input_service_26_0 imms_service_26_0 ipsec_service_26_0 jobscheduler_service_26_0 launcherapps_service_26_0 location_service_26_0 lock_settings_service_26_0 media_projection_service_26_0 media_router_service_26_0 media_session_service_26_0 meminfo_service_26_0 midi_service_26_0 mount_service_26_0 netpolicy_service_26_0 netstats_service_26_0 network_management_service_26_0 network_score_service_26_0 network_time_update_service_26_0 notification_service_26_0 oem_lock_service_26_0 otadexopt_service_26_0 overlay_service_26_0 package_service_26_0 permission_service_26_0 persistent_data_block_service_26_0 pinner_service_26_0 power_service_26_0 print_service_26_0 processinfo_service_26_0 procstats_service_26_0 recovery_service_26_0 registry_service_26_0 restrictions_service_26_0 rttmanager_service_26_0 samplingprofiler_service_26_0 scheduling_policy_service_26_0 search_service_26_0 sec_key_att_app_id_provider_service_26_0 sensorservice_service_26_0 serial_service_26_0 servicediscovery_service_26_0 settings_service_26_0 shortcut_service_26_0 statusbar_service_26_0 storagestats_service_26_0 task_service_26_0 textclassification_service_26_0 textservices_service_26_0 telecom_service_26_0 trust_service_26_0 tv_input_service_26_0 uimode_service_26_0 updatelock_service_26_0 usagestats_service_26_0 usb_service_26_0 user_service_26_0 vibrator_service_26_0 voiceinteraction_service_26_0 vr_manager_service_26_0 wallpaper_service_26_0 webviewupdate_service_26_0 wifip2p_service_26_0 wifiscanner_service_26_0 wifi_service_26_0 wifiaware_service_26_0 window_service_26_0 helloworldservice_service_26_0))
```
**找到app_api_service  在后面拼加 自己的   helloworldservice_service_26_0**
**找到ephemeral_app_api_service在后面拼加 自己的   helloworldservice_service_26_0**
**找到service_manager_type在后面拼加 自己的   helloworldservice_service_26_0**

7. 在Z:\itop-3399_8.1\system\sepolicy\private\compat\26.0\26.0.cil 添加如下配置
```
(typeattributeset helloworldservice_service_26_0 (helloworldservice_service))
```
- 如果 在Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0 下没有添加如上的配置编译会报错，报错的日志如下
```
SELinux: The following types were found added to the policy without an entry into the compatibility 
mapping file(s) found in private/compat/26.0/26.0[.ignore].cil/nhello_led_device
```
	
**上面的是必须的下面的根据自己的需求配置**

```
##允许platform_app 通过service_manager 获取自己的服务
platform_app.te   增加 ：  allow platform_app xxx_serivce:service_manager find;
##允许priv_app通过service_manager 获取自己的服务
priv_app.te       增加 ：      allow priv_app xxx_serivce:service_manager find;
##允许radio通过service_manager 获取自己的服务
radio.te                增加 ：       allow radio  xxx_serivce:service_manager { add find };
##允许system_app通过service_manager 获取自己的服务
system_app.te      增加 ：       allow system_app  xxx_serivce:service_manager  add;
##允许system_server通过service_manager 获取自己的服务
system_server.te    增加 ：     allow system_server xxx_serivce:service_manager  { add find };

```
## Android 设备节点SELinux 服务配置
- 在[实现自己的HAL-9 控制led（驱动）](https://blog.csdn.net/yangbinbingA/article/details/118336633)中成功将驱动装到内核后，会生成节点/dev/hello_led   如图：
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210701134108452.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">在dev下可以找到该节点</div>
</center>

- 配置步骤
1. 在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\private\file_contexts  中添加
```
/dev/__properties__ u:object_r:properties_device:s0
###############添加的内容在这里#######################
/dev/hello_led              u:object_r:hello_led_device:s0
```
**声明节点的名称**

2. 在Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\public\device.te  中添加
```
type misc_block_device, dev_type;
###############添加的内容在这里#######################
type hello_led_device, dev_type;
```
3. 在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\nonplat_sepolicy.cil 下添加
**找到 typeattributeset dev_type 在后面拼加 自己的   hello_led_device_26_0**
4. 在 Z:\itop-3399_8.1\system\sepolicy\prebuilts\api\26.0\nonplat_sepolicy.cil 下添加
```
(typeattribute hello_led_device_26_0)
(roletype object_r hello_led_device_26_0)
```
5. 在Z:\itop-3399_8.1\system\sepolicy\private\compat\26.0\26.0.cil 添加如下配置
```
(typeattributeset hello_led_device_26_0 (hello_led_device))
```

##  Android 设备节点SELinux 的编译
> mmm system/sepolicy/

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210701144626149.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">主要是 public 目录和private 目录</div>
</center>

- 其中 private 会编译到system.img 中 而 public 目录会编译到 vendor.img 和 system.img 中
所以要编译的镜像为vendor.img和system.img
> make system.img -j8
> make vendor.img -j8
> mmm packages/apps/HelloWorld/
> make snod
- 将system.img 和 vendor.img 刷到系统  ok！！！