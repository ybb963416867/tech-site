---
title: "性能优化 (十六) android线程优化的实战"
description: "性能优化 (十六) android线程优化的实战 的技术笔记。"
pubDate: 2026-05-31
category: "性能优化"
tags: [Notes]
draft: false
---
# android线程优化的实战

## 线程调度原理

- 任意时刻 ,只有一个线程占用CPU,处于运行状态
- 多线程并发 :轮流获取CPU使用权
- JVM负责线程调度:按照特定机制分配CPU使用权

## 调度模型

- 分时调度模型:轮流获取,均分cpu时间
- 抢占调度模型 :优先级高的获取,jvm使用这种模型

## Android线程调度

- nice值

1. Process中定义
2. 值越小,优先级越高
3. 默认值是THREAD_PRIORITY_DEFAULT = 0

- cgroup


1. 保证前台线程可以获取到更多的cpu


## 注意

- 线程过多会导致cpu频繁切换,降低线程运行效率
- 正确设置优先级
- 优先级具有继承性

## Android异步线程几种方式

- Thread


1. 使用简单,创建销毁开销大不推荐


- 
  Handler Thread


1. 自带消息循环的线程,适合长时间运行,不断从队列获取任务


- IntentService

1. 继承Service 在内部创建handler ,异步不占用主线程
   因为是service优先级高 ,不容易被kill

- 
  AsyncTask


1. 无需处理线程切换
2. Android低版本不一样

- 线程池


1. RxJava自带线程池和线程切换


## 线程池使用准则

- 提供基础线程池给各个模块使用
- 避免各自维护一套线程池,导致线程数过多
- 根据任务类型选择合适的异步方式

1. 优先级低,长时间运行用HandlerThread


- 
  创建线程必须命名


1. 运行期间set自己的名字


- 
  监控关键异步任务


1. AOP方式监控


- 
  设置优先级 Process.setThreadPriority();


1. 优先级可以设置多次

```java
//创建线程池 
private static ExecutorService sService = Executors.newFixedThreadPool(5, new  ThreadFactory() { 
    @Override 
    public Thread newThread(Runnable r) { 
         Thread thread = new Thread(r, "ThreadPoolUtils"); 
         //给线程取个名字 //设置线程的优先级 ,根据业务需要自己
         Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND); 
         return thread; } 
     }); 
```

使用的时候

```java
ThreadPoolUtils.getService().execute(new Runnable() { 
    @Override 
    public void run() { 
  //使用的时候可以修改线程的优先级 
        Process.setThreadPriority(Process.THREAD_PRIORITY_DEFAULT); 
  //获取一下以前的线程名 
        String oldName = Thread.currentThread().getName(); 
  // 设置一个名字 ,用于查找项目中在哪里使用了这个线程 
        Thread.currentThread().setName("new Name"); LogUtils.i(""); 
  // 你的任务 //任务结束后修改线程名,线程会回到线程池等待下次任务 
        Thread.currentThread().setName(oldName); 
  } }); 
```

### 如何锁定线程创建者

- 项目变大有,线程多
- 第三方创建的线程

**分析**

- 获取线程的位置获取堆栈
- 所有异步的方式,都会走到new Thread
   所以我们 Hook Thread的构造,获取堆栈信息查看线程是谁创建的

```java
DexposedBridge.hookAllConstructors(Thread.class, new XC_MethodHook() { 
    @Override 
    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
        super.afterHookedMethod(param); 
        Thread thread = (Thread) param.thisObject; 
        LogUtils.i(thread.getName()+" stack "+Log.getStackTraceString(new Throwable())); } }); 
```

### 统一线程库

区分任务类型,是CPU任务还是IO任务使用不同的线程池

```java
private int CPUCOUNT = Runtime.getRuntime().availableProcessors(); 
// cpu线程池 
private ThreadPoolExecutor cpuExecutor = new ThreadPoolExecutor(CPUCOUNT, CPUCOUNT, 30, TimeUnit.SECONDS, new LinkedBlockingDeque<Runnable>(), sThreadFactory); 
//IO线程池 ,io操作不消耗cpu所以可以创建多点线程 
private ThreadPoolExecutor iOExecutor = new ThreadPoolExecutor(64, 64, 30, TimeUnit.SECONDS, new LinkedBlockingDeque<Runnable>(), sThreadFactory); 
```

