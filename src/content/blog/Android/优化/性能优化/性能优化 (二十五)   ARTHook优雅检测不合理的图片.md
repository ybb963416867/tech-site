---
title: "性能优化 (二十五) ARTHook优雅检测不合理的图片"
description: "性能优化 (二十五) ARTHook优雅检测不合理的图片 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Git, API]
draft: false
---
# ARTHook优雅检测不合理的图片

## Bitmap内存模型

- API10之前Bitmap自身在Dalvik Heap中，像素在Native中
- API10之后像素也被放在Dalvik Heap中
- API26之后像素在Native
- 获取Bitmap占用的内存

1. 1. getByteCount
2. 1. 宽*高一像素占用内存

背景：图片堆内存优化至关重要、图片宽高大于控件宽高

## 常规实现

- 实现：继承ImageView,复写实现计算大小
- 浸入性强
- 不通用

## 挂钩，将额外的代码勾住原有的方法，修改执行逻辑

- 运行插桩
- 性能分析
- Epic简介
- Epic是一个虚拟机层面、以Java Method为粒度的运行时Hook框架
- 支持Android4.0-9.0
- https://github.com/tiann/epic
- Epic使用
- compile 'me.weishu:epic:0.3.6'
- 继承XC_MethodHook，实现相应的逻辑
- 注入Hook：DexposedBridge.findAndHookMethod

```java
package com.example.view;

import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.widget.ImageView;

import com.taobao.android.dexposed.DexposedBridge;
import com.taobao.android.dexposed.XC_MethodHook;

/**
 * ********************************
 * 项目名称：
 *
 * @Author yangbinbing
 * 邮箱： 963416867@qq.com
 * 创建时间：  19:52
 * 用途
 * ********************************
 */
public class ImageHook extends XC_MethodHook {

    @Override
    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
        super.afterHookedMethod(param);
        ImageView imageView = (ImageView) param.thisObject;
        checkBitmap(imageView, ((ImageView) param.thisObject).getDrawable());

    }

    private static void checkBitmap(Object thiz, Drawable drawable) {
        if (drawable instanceof BitmapDrawable && thiz instanceof View) {
            final Bitmap bitmap = ((BitmapDrawable) drawable).getBitmap();
            if (bitmap != null) {
                final View view = (View) thiz;
                int width = view.getWidth();
                int height = view.getHeight();
                if (width > 0 && height > 0) {
                    if (bitmap.getWidth() >= (width << 1) && bitmap.getHeight() >= (height << 1)) {
                        warn(bitmap.getWidth(), bitmap.getHeight(), width, height);
                    }
                } else {
                    view.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
                        @Override
                        public boolean onPreDraw() {
                            int w = view.getWidth();
                            int h = view.getHeight();
                            if (w > 0 && h > 0) {
                                if (bitmap.getWidth() >= (width << 1) && bitmap.getHeight() >= (height << 1)) {
                                    warn(bitmap.getWidth(), bitmap.getHeight(), width, height);
                                }
                                view.getViewTreeObserver().removeOnPreDrawListener(this);
                            }
                            return true;
                        }
                    });
                }
            }
        }
    }

    private static void warn(int width, int height, int width1, int height1) {
        String warnInfo = new StringBuilder("Bitmap size too large").append("\n real size: (").append(width).append(",").append(height)
                .append("\n desired size: (").append(width1).append(height1)
                .append("\n call stack trace:\n").append(Log.getStackTraceString(new RuntimeException())).toString();

        Log.i("tag", warnInfo);
    }
}

```



Application 中需要初始化

```java
 DexposedBridge.hookAllConstructors(ImageView.class, new XC_MethodHook() {
            @Override
            protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                super.afterHookedMethod(param);
                DexposedBridge.findAndHookMethod(ImageView.class, "setImageBitmap", Bitmap.class, new ImageHook());
            }
        });
```



代码中调用

```java
ImageView  imageView = findViewById(R.id.image);
Bitmap bitmap = BitmapFactory.decodeResource(getResources(),R.mipmap.image);
imageView.setImageBitmap(bitmap);
```

- ARTHook实现
- 无侵入性
- 通用性强
- 兼容问题大，开源方案不能带到线上环境