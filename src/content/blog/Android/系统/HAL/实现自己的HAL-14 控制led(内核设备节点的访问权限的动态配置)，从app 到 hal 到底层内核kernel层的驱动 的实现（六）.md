---
title: "实现自己的HAL-14 控制led(内核设备节点的访问权限的动态配置)，从app 到 hal 到底层内核kernel层的驱动 的实现（六）"
description: "<center <img style=\"borderradius: 0.3125em; boxshadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08)..."
pubDate: 2026-05-29
category: "HAL"
tags: [Notes]
draft: false
---
# 内核设备节点的访问权限的动态配置
- 在[控制led，从app 到 hal 到底层内核kernel层的驱动 的实现（一）](https://blog.csdn.net/yangbinbingA/article/details/118336633)中我们创建了led 控制驱动，同时也在设备中生成了dev/hello_led 节点 可以通过 ls /dev -l 查看
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://www.pianshen.com/images/611/ba70e6e776e860151412dfcbe2f8d62b.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">每列代表的含义</div>
</center>
> ls /dev  -l
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629183021413.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">hello_led访问权限</div>
</center>

- hello_led访问权限 的访问权限为 crw-rw----   说明是在root用户下才可读写，对于我们的app我们不是root用户所以不具备读写操作
- 那么我们需要对该节点设置用户可以访问的权限
- android 源码中给我们提供相关的访问配置
- 修改Z:\itop-3399_8.1\system\core\rootdir 目录下的 ueventd.rc 文件
```
/dev/null                 0666   root       root
/dev/zero                 0666   root       root
/dev/full                 0666   root       root
/dev/ptmx                 0666   root       root
/dev/tty                  0666   root       root
/dev/random               0666   root       root
/dev/urandom              0666   root       root
##############在这里############################
/dev/hello_led            0666   root       root
##############在这里############################
# Make HW RNG readable by group system to let EntropyMixer read it.
/dev/hw_random            0440   root       system
/dev/ashmem               0666   root       root
/dev/binder               0666   root       root
/dev/hwbinder             0666   root       root
/dev/vndbinder            0666   root       root
```
- 修改完后编译booting 镜像 
- 刷到开发版
> ls /dev  -l

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://img-blog.csdnimg.cn/20210629184039595.png">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">hello_led访问权限</div>
</center>

- crw-rw-rw- 1 root      root       10,  59 2021-06-29 09:09 hello_led 
- 用户的访问权限为 rw 可读可写 这时就不需要去chmod 0666 /dev/hello_led

