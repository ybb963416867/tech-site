---
title: "性能优化 (九) app的启动优化"
description: "性能优化 (九) app的启动优化 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Notes]
draft: false
---
# App启动优化的介绍

## 背景介绍

1. 第一体验
2. 八秒定律

## 启动分类

## App startup time

### 冷启动

1. 启动App
2. 加载空白的Window
3. 创建进程
4. 耗时最多，衡量标准
5. clickEvent  ipc  Process.start    ActivityThread  bindApplication lifeCycle  viewRootImpl 

### 热启动

1. 最快 
2. 后台  前台

### 稳启动

1. 较快
2. lifeCycle

## 相关任务

#### 冷启动之前

1. 启动app
2. 加载空白Window
3. 创建进程

## 随后任务

1. 创建Application
2. 启动主线程
3. 创建MainAcitivity
4. 加载布局
5. 布置屏幕
6. 首帧绘制

## 优化方向

1. Application和Activity生命周期

