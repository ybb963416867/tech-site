---
title: "性能优化 (三十一) 异步Inflater实战"
description: "性能优化 (三十一) 异步Inflater实战 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Notes]
draft: false
---
# 异步Inflater实战

## 背景介绍

- 布局文件读取慢：IO过程
- 创建View慢：放射（比new 慢3倍）

## 思路介绍

- 根本性的解决
- 侧面缓解

## AsyncLayoutInflater实战

### 简称异步Inflate

- workThread加载布局
- 回调主线程
- 节约主线程的时间

### AsyncLayoutInflater使用

- com.android.support:asynclayoutinflater