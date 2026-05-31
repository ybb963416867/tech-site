---
title: "性能优化 (四十八) Battery Historian实战分析"
description: "性能优化 (四十八) Battery Historian实战分析 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Git, Shell]
draft: false
---
# Battery Historian实战分析

## 安装

- https://github.com/google/battery-historian
- 安装Docker

- docker -- run -p <port>: 9999 gcr.io/android-battery-historian/stable:stable:3.0 --port 9999

## 导出电量信息

- adb shell dumpsys batterystats --reset
- adb shell dumpsys batterystats --enable full-wake-history
- adb bugreport bugreport.zip

## 上传分析

- http://localhost:9999
- 上传bugreport文件即可
- 备用：https://bathist.ef.lc/
- 

