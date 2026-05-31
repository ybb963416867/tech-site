---
title: "史上最强的 Android 日志库 XLog"
description: "史上最强的 Android 日志库 XLog 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Git, Array, CSS]
draft: false
---
# 史上最强的 Android 日志库 XLog

Github: [https://github.com/elvishew/xLog](https://link.jianshu.com/?t=https://github.com/elvishew/xLog)

简单、美观、强大、可扩展的 Android 和 Java 日志库，可同时在多个通道打印日志，如 Logcat、System.out 和文件。如果你愿意，甚至可以打印到远程服务器（或其他任何地方）。

XLog 能干什么:

- 全局配置（TAG，各种格式化器...）或基于单条日志的配置
- 支持数组
- 支持无限长的日志（没有 4K 字符的限制）
- XML 和 JSON 格式化输出
- 线程信息（线程名等，可自定义）
- 调用栈信息（可配置的调用栈深度，调用栈信息包括类名、方法名文件名和行号）
- 保存日志文件（文件名和自动备份策略可灵活配置）
- 在 Android Studio 中的日志样式美观
- 简单易用，扩展性高

与其他日志库的不同:

- 优美的源代码，良好的文档
- 扩展性高，可轻松扩展和强化功能

## 依赖



```groovy
compile 'com.elvishew:xlog:1.1.0'
```

## 预览

- 带线程信息、调用栈信息和边框的日志

  ![img](https://upload-images.jianshu.io/upload_images/1405006-4133c6e8d515b72f.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

  classic_log.png

- 日志文件

  ![img](https://upload-images.jianshu.io/upload_images/1405006-f002532ba9d64de7.png?imageMogr2/auto-orient/strip|imageView2/2/w/800/format/webp)

  log_files.png

## 架构

![img](https://upload-images.jianshu.io/upload_images/1405006-8f7b4295f94ccb98.png?imageMogr2/auto-orient/strip|imageView2/2/w/1137/format/webp)

architecture.png

## 用法

### 初始化

#### 简单方式



```java
XLog.init(LogLevel.ALL);
```

或者如果你想要在正式版中禁止打日志



```css
XLog.init(BuildConfig.DEBUG ? LogLevel.ALL : LogLevel.NONE);
```

#### 高级方式



```java
LogConfiguration config = new LogConfiguration.Builder()
    .tag("MY_TAG")                                         // 指定 TAG，默认为 "X-LOG"
    .t()                                                   // 允许打印线程信息，默认禁止
    .st(2)                                                 // 允许打印深度为2的调用栈信息，默认禁止
    .b()                                                   // 允许打印日志边框，默认禁止
    .jsonFormatter(new MyJsonFormatter())                  // 指定 JSON 格式化器，默认为 DefaultJsonFormatter
    .xmlFormatter(new MyXmlFormatter())                    // 指定 XML 格式化器，默认为 DefaultXmlFormatter
    .throwableFormatter(new MyThrowableFormatter())        // 指定可抛出异常格式化器，默认为 DefaultThrowableFormatter
    .threadFormatter(new MyThreadFormatter())              // 指定线程信息格式化器，默认为 DefaultThreadFormatter
    .stackTraceFormatter(new MyStackTraceFormatter())      // 指定调用栈信息格式化器，默认为 DefaultStackTraceFormatter
    .borderFormatter(new MyBoardFormatter())               // 指定边框格式化器，默认为 DefaultBorderFormatter
    .addObjectFormatter(AnyClass.class,                    // 为指定类添加格式化器
            new AnyClassObjectFormatter())                 // 默认使用 Object.toString()
    .build();

Printer androidPrinter = new AndroidPrinter();             // 通过 android.util.Log 打印日志的打印器
Printer SystemPrinter = new SystemPrinter();               // 通过 System.out.println 打印日志的打印器
Printer filePrinter = new FilePrinter                      // 打印日志到文件的打印器
    .Builder("/sdcard/xlog/")                              // 指定保存日志文件的路径
    .fileNameGenerator(new DateFileNameGenerator())        // 指定日志文件名生成器，默认为 ChangelessFileNameGenerator("log")
    .backupStrategy(new MyBackupStrategy())                // 指定日志文件备份策略，默认为 FileSizeBackupStrategy(1024 * 1024)
    .logFlattener(new MyLogFlattener())                    // 指定日志平铺器，默认为 DefaultLogFlattener
    .build();

XLog.init(LogLevel.ALL,                                    // 指定日志级别，低于该级别的日志将不会被打印
    config,                                                // 指定日志配置，如果不指定，会默认使用 new LogConfiguration.Builder().build()
    androidPrinter,                                        // 添加任意多的打印器。如果没有添加任何打印器，会默认使用 AndroidPrinter
    systemPrinter,
    filePrinter);
```

对于 android，做初始化的最佳地方是 [Application.onCreate()](https://link.jianshu.com/?t=http://developer.android.com/reference/android/app/Application.html#onCreate())。

### 全局用法



```java
XLog.d("Simple message")
XLog.d("My name is %s", "Elvis");
XLog.d("An exception caught", exception);
XLog.d(object);
XLog.d(array);
XLog.json(unformattedJsonString);
XLog.xml(unformattedXmlString);
... // 其他全局使用
```

### 局部用法

创建一个 [Logger](https://link.jianshu.com/?t=https://github.com/elvishew/XLog/blob/master/library/src/main/java/com/elvishew/xlog/Logger.java)。



```java
Logger partial = XLog.tag("PARTIAL-LOG")
    ... // 其他配置
    .build();
```

然后对该 [Logger](https://link.jianshu.com/?t=https://github.com/elvishew/XLog/blob/master/library/src/main/java/com/elvishew/xlog/Logger.java) 进行局部范围的使用，所有打印日志的相关方法都跟 [XLog](https://link.jianshu.com/?t=https://github.com/elvishew/XLog/blob/master/library/src/main/java/com/elvishew/xlog/XLog.java) 类里的一模一样。



```java
partial.d("Simple message 1");
partial.d("Simple message 2");
... // 其他局部使用
```

### 基于单条日志的用法

进行基于单条日志的配置，然后就可以直接打印日志了，所有打印日志的相关方法都跟 [XLog](https://link.jianshu.com/?t=https://github.com/elvishew/XLog/blob/master/library/src/main/java/com/elvishew/xlog/XLog.java) 类里的一模一样。



```java
XLog.t()    // 允许打印线程信息
    .st(3)  // 允许打印深度为3的调用栈信息
    .b()    // 允许打印日志边框
    ...     // 其他配置
    .d("Simple message 1");

XLog.tag("TEMP-TAG")
    .st(0)  // 允许打印不限深度的调用栈信息
    ...     // 其他配置
    .d("Simple message 2");

XLog.nt()   // 禁止打印线程信息
    .nst()  // 禁止打印调用栈信息
    .d("Simple message 3");

XLog.b().d("Simple message 4");
```

## 比较

让我们设想有一个 JSON 字符串和一个 XML 字符串：



```java
String jsonString = "{\"name\": \"Elvis\", \"age\": 18}";
String xmlString = "<team><member name="Elvis"/><member name="Leon"/></team>";
```

### [Android Log](https://link.jianshu.com/?t=http://developer.android.com/reference/android/util/Log.html)



```java
Log.d(TAG, "Message");
Log.d(TAG, String.format("Message with argument: age=%s", 18));
Log.d(TAG, jsonString);
Log.d(TAG, xmlString);
Log.d(TAG, "Message with stack trace info", new Throwable());
```

![img](https://upload-images.jianshu.io/upload_images/1405006-fc41da4f28e5f1c3.png?imageMogr2/auto-orient/strip|imageView2/2/w/1094/format/webp)

comparison-android-log.png

### XLog



```java
XLog.init(LogLevel.ALL);
XLog.d("Message");
XLog.d("Message with argument: age=%s", 18);
XLog.json(jsonString);
XLog.xml(xmlString);
XLog.st(5).d("Message with stack trace info");
```

![img](https://upload-images.jianshu.io/upload_images/1405006-3c799f84fe66fa4d.png?imageMogr2/auto-orient/strip|imageView2/2/w/1054/format/webp)

comparison-xlog.png

### 带边框的 XLog



```java
XLog.init(LogLevel.ALL, new LogConfiguration.Builder().b().build());
XLog.d("Message");
XLog.d("Message with argument: age=%s", 18);
XLog.json(jsonString);
XLog.xml(xmlString);
XLog.st(5).d("Message with stack trace info");
```

![img](https://upload-images.jianshu.io/upload_images/1405006-ad0a9b16159e4b6e.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

comparison-xlog-with-border.png

## 兼容性

为了兼容 [Android Log](https://link.jianshu.com/?t=http://developer.android.com/reference/android/util/Log.html)，XLog 支持 [Android Log](https://link.jianshu.com/?t=http://developer.android.com/reference/android/util/Log.html) 里的所有方法。
请看 [XLog](https://link.jianshu.com/?t=https://github.com/elvishew/XLog/blob/master/library/src/main/java/com/elvishew/xlog/XLog.java) 里的 Log 类。



```java
Log.v(String, String);
Log.v(String, String, Throwable);
Log.d(String, String);
Log.d(String, String, Throwable);
Log.i(String, String);
Log.i(String, String, Throwable);
Log.w(String, String);
Log.w(String, String, Throwable);
Log.wtf(String, String);
Log.wtf(String, String, Throwable);
Log.e(String, String);
Log.e(String, String, Throwable);
Log.println(int, String, String);
Log.isLoggable(String, int);
Log.getStackTraceString(Throwable);
```

Github: [https://github.com/elvishew/xLog](https://link.jianshu.com/?t=https://github.com/elvishew/xLog)

> 关于作者
> ElvisHew 的 Github 主页: [https://github.com/elvishew](https://link.jianshu.com/?t=https://github.com/elvishew)
> ElvisHew 的新浪微博：[http://weibo.com/elvishew](https://link.jianshu.com/?t=http://weibo.com/elvishew)