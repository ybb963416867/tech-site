---
title: "性能优化 (六) So瘦身实战"
description: "性能优化 (六) So瘦身实战 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Notes]
draft: false
---
# So瘦身实战

## So 移除

1. So是Android上的动态链接库
2. 七种不同类型的CPU架构
3. abiFilters: 设置支持的架构

## 更优方案

1. 完美支持所有的类型的设备的代价太大
2. 都放在armeabi目录，根据cpu类加载对应的.so文件

## 其他方案

1. So动态下载
2. 插件化