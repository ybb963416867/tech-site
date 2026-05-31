---
title: "性能优化 (二十九) Android布局加载原理"
description: "性能优化 (二十九) Android布局加载原理 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Notes]
draft: false
---
# Android布局加载原理

## 背景介绍

- 知其然知其所以然
- 深入源码
- 布局加载流程

- setContentView()   layoutInflater   inflate  getLayout  CreateViewFromTag   Factory  createView   放射创建View

## 性能瓶颈

- 布局文件解析：IO过程
- 创建View对象：反射

## LayoutInflater.Factory

- LayoutInflater创建View的一个Hook
- 定制创建View的过程：全局替换自定义TextView等
- Factory与Factory2
- Factory2继承与Factory
- 多了一个参数：parent



