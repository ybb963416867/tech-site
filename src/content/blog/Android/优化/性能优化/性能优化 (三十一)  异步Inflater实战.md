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