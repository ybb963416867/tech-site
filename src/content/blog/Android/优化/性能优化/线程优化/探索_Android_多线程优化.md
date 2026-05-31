---
title: "探索_Android_多线程优化"
description: ""
pubDate: 2026-05-31
category: "线程优化"
tags: [Mac, API]
draft: false
---
# Android 多线程

---

## 前言

### 1. 基本介绍

在我学习 Android 多线程优化方法的过程中，发现我对多线程优化的了解太片面。

写这篇文章的目的是完善我对 Android 多线程优化方法的认识，分享这篇文章的目的是希望大家也能从这些知识中得到一些启发。

这篇文章分为下面三部分：

- **第一部分**：多线程优化的基础知识，包括线程的介绍和线程调度基本原理的介绍。
- **第二部分**：多线程优化需要预防的一些问题，包括线程安全问题的介绍和实现线程安全的办法。
- **第三部分**：多线程优化可以使用的一些方法，包括线程之间的协作方式与 Android 执行异步任务的常用方式。

### 2. 阅读技巧

在阅读本文时，画图和思考可以帮助你更好地记忆和理解文中的内容。

- **画图**：把每一节的重点画在思维导图的节点上。思维导图可以让随意信息在视觉上建立起一种关联，帮助大脑更好地记忆随意信息。
- **思考**：学习不是为了被现有的知识所束缚，而是以现有的知识为基石，发展出新的思想。阅读本文时，可以带着下面这些问题边思考边阅读：
  - 这个说法的依据是什么？
  - 怎么以自己的方式去解释这个概念？
  - 怎么在自己的项目中应用这个技巧？
  - 这个概念的具体代码实现是怎样的？
  - 这个实现存在哪些问题？

### 3. 缩略词

| 缩略词 | 全称 |
|--------|------|
| AS | Android Studio（Android 应用开发工具） |
| GC | Garbage Collector（垃圾回收器） / Garbage Collection（垃圾回收动作） |
| ART | Android Runtime（Android 应用运行时环境） |
| JVM | Java Virtual Machine（Java 虚拟机） |
| JUC | java.util.concurrent（Java 并发包） |

---

## 1. 能不能不用多线程？

**不管你懂不懂多线程，你也必须要用多线程。**

- **GC 线程**：即使是一个什么都没有的 demo 项目，也是运行在 ART 上的，而 ART 自带了 GC 线程，加上主线程，它依旧是一个多线程应用。
- **第三方线程**：日常使用的第三方库（包括 Android 系统本身）都用到了多线程。比如 Glide 就是使用工作线程从网络上加载图片，等图片加载完毕后，再切回主线程把图片设置到 ImageView 中。
- **硬性要求**：假如应用中只有一个线程，加载图片时 Loading 动画无法播放，界面是卡死的。而且 Android 强制要求开发者在发起网络请求时必须在工作线程，不能在主线程。

---

## 2. 为什么要做多线程优化？

**做多线程优化是为了解决多线程的安全性和活跃性问题。**

- **安全性问题**：多个线程同时操作一个共享资源时，可能产生竞态（Race Condition），导致数据异常（如炒菜放了两次盐）。
- **活跃性问题**：多个线程互相等待对方的资源，导致任务无法执行（即死锁，Deadlock）。

---

## 3. 什么是线程？

### 3.1 线程简介

**线程是进程中可独立执行的最小单位，也是 CPU 资源分配的基本单位。**

进程是程序向操作系统申请资源的基本条件，一个进程可以包含多个线程，同一个进程中的线程可以共享进程中的资源（如内存空间和文件句柄）。

### 3.2 线程的四个属性

#### 3.2.1 编号（id）

- **作用**：标识不同的线程，每条线程拥有不同的编号。
- **注意事项**：某个编号的线程运行结束后，该编号可能被后续创建的线程使用，因此不适合用作唯一标识；编号是只读属性，不能修改。

#### 3.2.2 名字（name）

- 默认值是 `Thread-线程编号`，如 `Thread-0`。
- **作用**：给线程设置名字可以在某条线程出现问题时，用该线程的名字快速定位出问题的地方。

#### 3.2.3 类别（daemon）

- 分为**守护线程**和**用户线程**，通过 `setDaemon(true)` 把线程设置为守护线程。
- JVM 退出时，不考虑守护线程是否执行完成，只考虑用户线程。
- **注意事项**：`setDaemon()` 要在线程启动前设置，否则 JVM 会抛出 `IllegalThreadStateException`。

#### 3.2.4 优先级（Priority）

- 取值范围：1~10，默认值是 5。
  - 最低优先级：`MIN_PRIORITY = 1`
  - 默认优先级：`NORM_PRIORITY = 5`
  - 最高优先级：`MAX_PRIORITY = 10`
- **注意事项**：优先级只是参考值，不保证执行顺序；使用不当可能导致线程饥饿。

#### 3.2.5 继承性

线程的类别和优先级属性会被继承，由开启该线程的父线程决定。

### 3.3 线程的六个方法

| 方法 | 类型 | 作用 |
|------|------|------|
| `start()` | 非静态 | 启动线程（只能调用一次） |
| `run()` | 非静态 | 任务的具体逻辑（由 JVM 调用） |
| `join()` | 非静态 | 等待其他线程执行结束 |
| `Thread.currentThread()` | 静态 | 获取当前执行方法的线程 |
| `Thread.yield()` | 静态 | 使当前线程放弃处理器占用 |
| `Thread.sleep(ms)` | 静态 | 使当前线程在指定时间内休眠 |

### 3.4 线程的六种状态

| 状态 | 说明 |
|------|------|
| NEW（新建） | 线程创建后未启动 |
| RUNNABLE（可运行） | 调用 `start()` 后，分为 READY（预备）和 RUNNING（运行）两个子状态 |
| BLOCKED（阻塞） | 发起阻塞式 I/O 操作、申请其他线程持有的锁、进入 synchronized 失败时 |
| WAITING（等待） | 执行 `Object.wait()`、`LockSupport.park()`、`Thread.join()` 后 |
| TIMED_WAITING（限时等待） | 执行带时间参数的等待方法后，时间到后自动转为可运行状态 |
| TERMINATED（终止） | 任务执行完毕或遇到异常时 |

---

## 4. 线程调度的原理是什么？

### 4.1 Java 的内存模型

Java 内存模型（JMM）规定所有变量都存储在主内存中，每条线程都有自己的工作内存。

自增操作（`a++`）实际上分为三步：
1. 将变量 `a` 的值赋值给临时变量 `temp`
2. 将 `temp` 的值加 1
3. 将 `temp` 的值重新赋给变量 `a`

这种非原子操作导致多线程下出现安全性问题（原子性）。

### 4.2 高速缓存

现代处理器通过高速缓存（Cache）与主内存交互，高速缓存内部结构包含：
- **Tag**：包含内存地址的部分信息
- **Data Block（缓存行）**：数据交换的最小单元
- **Flag**：表示缓存行的状态信息

### 4.3 Java 线程调度原理

JVM 采用**抢占式调度模型**：先让优先级高的线程占用 CPU，优先级相同则随机选择。多线程并发运行实际上是多个线程轮流获取 CPU 使用权。

---

## 5. 什么是线程的安全性问题？

### 5.1 竞态

**竞态**是指计算的正确性依赖于相对时间顺序或线程的交错。竞态往往伴随着脏数据和丢失更新问题。

### 5.2 原子性

对于涉及共享变量访问的操作，若该操作从执行线程以外的任意线程看来是不可分割的，则具有**原子性**（Atomicity）。

### 5.3 可见性

**可见性**是指一个线程对共享变量的更新，对于其他读取该变量的线程是否可见。由于高速缓存和寄存器的存在，可见性无法自动保证。

### 5.4 有序性

**有序性**是指一个处理器执行的内存访问操作，对于另一个处理器上运行的线程来看可能是乱序的。编译器和处理器的**重排序**（Reordering）优化会影响多线程程序的正确性。

---

## 6. 怎么实现线程安全？

### 6.1 锁

#### 6.1.1 锁的五个特点

- **临界区**：持有锁的线程在获取锁后和释放锁前执行的代码
- **排他性**：任一时刻只能被一个线程持有
- **串行**：把多个线程对共享变量的操作从并发改为串行
- **三种保障**：保障原子性、可见性和有序性
- **调度策略**：分为公平锁（按排队顺序）和非公平锁

#### 6.1.2 锁的两个问题

- **锁泄漏**：线程获得锁后因程序错误导致锁一直无法被释放
- **活跃性问题**：锁泄漏导致的死锁、锁死等

### 6.2 内部锁（synchronized）

Java 提供 `synchronized` 关键字实现内部锁（监视器锁），特点如下：

- 自动获取/释放锁
- 非公平锁
- 不会导致锁泄漏

```java
// 锁句柄
private final String hello = "hello";

private void getLock1() {
    synchronized (hello) {
        System.out.println("ThreadA 拿到了内部锁");
        ThreadUtils.sleep(2 * 1000);
    }
    System.out.println("ThreadA 释放了内部锁");
}

private void getLock2() {
    System.out.println("ThreadB 尝试获取内部锁");
    synchronized (hello) {
        System.out.println("ThreadB 拿到了内部锁");
    }
    System.out.println("ThreadB 继续执行");
}
```

### 6.3 显式锁（ReentrantLock）

`Lock` 接口的实现类 `ReentrantLock` 特点：

- 可重入锁
- 需要手动获取/释放（在 `finally` 块中释放以避免锁泄漏）
- 可选择公平/非公平策略

```java
private final Lock lock = new ReentrantLock();

private void lock1() {
    lock.lock();
    try {
        System.out.println("线程 1 开始执行操作");
        ThreadUtils.sleep(2 * 1000);
    } finally {
        lock.unlock();
    }
}
```

**获取锁的四个方法：**

| 方法 | 说明 |
|------|------|
| `lock()` | 获取锁，失败时阻塞 |
| `tryLock()` | 获取锁，成功返回 true，失败返回 false，不阻塞 |
| `tryLock(long, TimeUnit)` | 在指定时间内尝试获取锁，可中断 |
| `lockInterruptibly()` | 获取锁，可中断 |

### 6.4 内部锁与显式锁的区别

| 对比项 | 内部锁 | 显式锁 |
|--------|--------|--------|
| 灵活性 | 锁的申请和释放只能在一个方法内 | 可在不同方法中申请和释放 |
| 锁调度策略 | 只能是非公平锁 | 可选择公平/非公平 |
| 便利性 | 简单易用，不会锁泄漏 | 需手动管理，使用不当会锁泄漏 |
| 阻塞 | 一直等待 | tryLock() 可避免阻塞 |

### 6.5 读写锁（ReentrantReadWriteLock）

读写锁的特点：

- **读锁共享**：允许多个线程同时读取共享变量
- **写锁排他**：一次只允许一个线程更新共享变量
- **可以降级**：持有写锁时可以继续获取读锁
- **不能升级**：读线程只有释放读锁才能申请写锁

**适用场景**：读操作比写操作频繁很多，且读取共享变量的线程持有锁的时间较长。

```java
private final ReadWriteLock readWriteLock = new ReentrantReadWriteLock();
private final Lock readLock = readWriteLock.readLock();
private final Lock writeLock = readWriteLock.writeLock();
```

### 6.6 volatile 关键字

`volatile` 关键字特点：

- 开销比锁低（不导致上下文切换），也叫**轻量级锁**
- 保证**可见性**和**有序性**
- 对于 long/double 型变量保证读写操作的**原子性**；对于非 long/double 型变量，只保证写操作的原子性

### 6.7 原子类型（java.util.concurrent.atomic）

`AtomicInteger`、`AtomicBoolean`、`AtomicReference`、`AtomicReferenceFieldUpdater` 等原子类，通过 `Unsafe` 类中的 CAS 指令从硬件层面实现线程安全，不需要加锁。

**AtomicReference vs AtomicReferenceFieldUpdater：**

- `AtomicReference` 更简单，但每个实例会多创建一个对象（16~24 字节）
- `AtomicReferenceFieldUpdater` 内存开销更小，适合需要创建大量实例的场景（如 `BufferedInputStream`、Kotlin 协程等）

### 6.8 锁的使用技巧

| 技巧 | 说明 |
|------|------|
| 长锁不如短锁 | 尽量只对必要的部分加锁 |
| 大锁不如小锁 | 尽可能对加锁的对象拆分 |
| 公锁不如私锁 | 尽可能把锁的逻辑放到私有代码中 |
| 嵌套锁不如扁平锁 | 避免锁嵌套 |
| 分离读写锁 | 尽可能将读锁和写锁分离 |
| 粗化高频锁 | 合并处理频繁而且过短的锁 |
| 消除无用锁 | 尽可能不加锁，或者用 volatile 代替 |

---

## 7. 什么是线程的活跃性问题？

活跃性问题不是说线程过于活跃，而是线程不够活跃，导致任务无法取得进展。

### 7.1 死锁

**死锁**：两个或更多线程因相互等待对方而被永远暂停。

**死锁产生的四个条件：**

1. 资源互斥
2. 资源不可抢夺
3. 占用并等待资源
4. 循环等待资源

**避免死锁的方法：**

- **粗锁法**：使用粗粒度的锁代替多个锁
- **锁排序法**：相关线程使用全局统一的顺序申请锁
- **tryLock**：为申请锁的操作设置超时时间
- **开放调用**：调用外部方法时不持有锁

### 7.2 锁死

**锁死（Lockout）**：等待线程由于唤醒条件永远无法成立，导致任务一直无法继续执行。

- **信号丢失锁死**：没有对应的通知线程唤醒等待线程
- **嵌套监视器锁死**：嵌套地使用锁导致线程永远无法被唤醒

### 7.3 活锁

**活锁（Livelock）**：线程一直处于运行状态，但任务却一直无法继续执行。

### 7.4 饥饿

**线程饥饿（Starvation）**：线程一直无法获得所需资源，导致任务一直无法执行。

---

## 8. 线程之间怎么协作？

### 8.1 join

`Thread.join()` 可以让一个线程等待另一个线程执行结束后再继续执行。

```java
public class ThreadB extends Thread {
    private final Thread threadA;

    @Override
    public void run() {
        try {
            System.out.println("线程 B 开始等待线程 A 执行结束");
            threadA.join();
            System.out.println("线程 B 结束等待，开始做自己想做的事情");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 8.2 wait/notify

**wait/notify 的要点：**

- `Object.wait()` 让线程进入等待状态（WAITING），`Object.notify()` 唤醒一个等待线程
- 使用前必须获取共享对象的监视器锁（在 synchronized 代码块中执行）
- 保护条件的判断和 `wait()` 的调用要放在**循环语句**中
- `notifyAll()` 唤醒所有等待线程，`notify()` 唤醒任意一个

**wait/notify 存在的问题：**

- 过早唤醒（无须被唤醒的等待线程也被唤醒）
- 信号丢失（等待线程错过了通知）
- 欺骗性唤醒（在没有 notify 的情况下被唤醒）
- 上下文切换开销

```java
final Object lock = new Object();
private volatile boolean conditionSatisfied;

public void startWait() throws InterruptedException {
    synchronized (lock) {
        while (!conditionSatisfied) {
            lock.wait();
        }
        System.out.println("等待线程被唤醒，开始执行目标动作");
    }
}

public void startNotify() {
    synchronized (lock) {
        conditionSatisfied = true;
        lock.notify();
    }
}
```

### 8.3 await/signal（Condition）

JDK 5 引入的 `Condition` 接口解决了 `wait/notify` 的两个问题：过早唤醒和无法区分超时/被唤醒。

- `Lock.newCondition()` 获取 Condition 实例
- `condition.await()` / `condition.signal()` / `condition.signalAll()`
- `condition.awaitUntil(date)` 超时返回 `false`，被唤醒返回 `true`

```java
private Lock lock = new ReentrantLock();
private Condition condition = lock.newCondition();
private volatile boolean conditionSatisfied = false;

private void startWait() {
    lock.lock();
    try {
        while (!conditionSatisfied) {
            condition.await();
        }
        System.out.println("等待线程被唤醒，开始执行目标动作");
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        lock.unlock();
    }
}
```

### 8.4 await/countDown（CountDownLatch）

`CountDownLatch` 可以实现一个或多个线程等待其他线程完成一组特定操作（先决操作）后才继续运行。

- 内部维护 count 值，每次 `countDown()` 减 1，减到 0 时唤醒等待线程
- **一次性**：count 为 0 后，再调用 `await()` 不会再等待
- 不需要加锁

```java
final CountDownLatch latch = new CountDownLatch(2);

private void startWait() throws InterruptedException {
    latch.await();
    System.out.println("等待线程结束等待");
}

private void startCountDown() {
    try {
        System.out.println("执行先决操作");
    } finally {
        latch.countDown();
    }
}
```

### 8.5 CyclicBarrier

`CyclicBarrier` 让多个线程互相等待，直到所有线程都到达某个集合点才继续执行。

- 与 `CountDownLatch` 不同，`CyclicBarrier` **可以重复使用**
- 最后一个调用 `await()` 的线程会执行 `barrierAction` 并唤醒所有等待线程

```java
final CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("人来齐了，开始爬山");
});
```

---

## 9. 怎么让一个线程停止？

### 9.1 stop() 方法（已废弃）

`stop()` 方法已被废弃，原因：
1. 强行结束线程可能导致锁无法释放（锁泄漏）
2. 强行结束线程可能导致数据处于不一致状态

### 9.2 interrupt() 方法

调用线程的 `interrupt()` 可以中断处于休眠状态的线程（抛出 `InterruptedException`）。

对于循环执行的任务，可通过 `interrupted()` 或 `isInterrupted()` 判断是否被中断：

| 方法 | 类型 | 是否重置中断状态 |
|------|------|----------------|
| `interrupted()` | 静态 | 会重置（下次调用返回 false） |
| `isInterrupted()` | 非静态 | 不会重置 |

### 9.3 布尔标志位

在 Java 层自定义一个 `volatile` 修饰的布尔标志位，当需要取消任务时在外部将其改为 `true`。

- **适用场景**：不需要 `sleep()` 的任务
- **需要 sleep() 时**：使用 `interrupt()` 中断任务

---

## 10. 什么是 ConcurrentHashMap？

### 10.1 ConcurrentHashMap 简介

`ConcurrentHashMap` 是一个并发容器，解决了同步容器（如 `Hashtable`）的性能问题：

- `Hashtable` 存在大锁、长锁、读写锁共用问题
- `ConcurrentHashMap` 通过分段锁、桶节点锁等方式提升并发性能

### 10.2 ConcurrentHashMap 各版本演进

| 版本 | 优化内容 |
|------|---------|
| JDK 5 | 引入分段锁（Segment），不同段之间的访问不受影响 |
| JDK 6 | 优化二次 Hash 算法（Wang/Jenkins），使元素均匀分布在各段 |
| JDK 7 | 懒加载实例化段，使用 `volatile` 和 `UNSAFE.getObjectVolatile()` 保证可见性 |
| JDK 8 | 废弃 Segment，基于 HashMap 原理并发化，使用桶节点锁和 volatile |

### 10.3 ConcurrentHashMap 特点

- **小锁**：分段锁（JDK 5~7）/ 桶节点锁（JDK 8）
- **短锁**：先尝试获取，失败再加锁
- **分离读写锁**：读失败再加锁（JDK 5~7）/ volatile 读 CAS 写（JDK 7~8）
- **弱一致性**：添加元素后不一定马上能读到；遍历时元素变化不会抛异常

---

## 11. 使用线程有哪些准则？

| 准则 | 说明 |
|------|------|
| 严禁直接创建线程 | 直接创建线程无复用优势，线程管理困难 |
| 提供基础线程池 | 避免各业务线各自维护线程池导致线程数过多 |
| 选择合适的异步方式 | 根据任务类型选择 HandlerThread、线程池等 |
| 线程必须命名 | 出现异常时能快速定位创建者（`Thread.currentThread().setName(name)`） |
| 重视优先级设置 | 通过 `android.os.Process.setThreadPriority(priority)` 设置，值越小优先级越高（范围 -20~19） |

---

## 12. 怎么在 Android 中执行异步任务？

### 12.1 异步简介

异步指代码不是按照书写顺序来执行的。编写异步代码时要注意避免回调地狱：

```java
// 回调地狱示例（不推荐）
btn.setOnClickListener(v -> {
    sendRequest(request, new Callback() {
        public void onSuccess(Response response) {
            handler.post(() -> updateUI(response));
        }
    });
});
```

### 12.2 Thread（不推荐）

直接创建 Thread 是最简单的异步方式，但缺点是无法复用，频繁创建和销毁线程开销大。

### 12.3 HandlerThread

`HandlerThread` 本质是一个自带消息循环的 Thread，以串行方式执行任务，适合需要长时间执行、不断从队列中取出任务的场景。

### 12.4 IntentService

`IntentService` 是 Service 的子类，内部有一个 `HandlerThread`。优点是执行在工作线程，且作为 Service 拥有较高的应用优先级，不容易被系统杀死。

### 12.5 AsyncTask

Android 提供的异步工具类，内部使用线程池，自动处理线程切换。注意不同版本间实现存在差异（主要影响 API 14 以下）。

### 12.6 线程池

```java
// 全局线程池工具类示例
private static ExecutorService sService = Executors.newFixedThreadPool(5,
    r -> {
        Thread thread = new Thread(r);
        thread.setName("ThreadPoolUtils");
        return thread;
    });

// 执行任务时动态修改线程名
public void executeTask() {
    ThreadPoolUtils.getService().execute(() -> {
        String oldName = Thread.currentThread().getName();
        Thread.currentThread().setName("newName");
        System.out.println("执行任务");
        Thread.currentThread().setName(oldName);
    });
}
```

**线程池的优点：**
- 易于复用，避免频繁创建和销毁线程
- 提供定时、任务队列、并发数控制等强大功能

### 12.7 RxJava

RxJava 根据任务类型提供不同的线程池：
- I/O 密集型任务：`Schedulers.io()`
- CPU 密集型任务：`Schedulers.computation()`

```java
// 使用 Lambda 表达式
btn.setOnClickListener(v -> sendRequest(request))
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .onErrorReturnItem(t -> mapThrowableToResponse(t))
    .as(AutoDispose.autoDisposable(ViewScopeProvider.from(btn)))
    .subscribe(response -> updateUI(response));
```

**注意事项：**
- 使用 `Observer` 而非 `Consumer` 处理异常，或添加 `onErrorReturnItem()`
- 使用 `AutoDispose`（滴滴开源）在页面销毁时自动取消任务，防止内存泄漏

### 12.8 Kotlin 协程

使用 Kotlin 协程写出的异步代码，看上去与同步代码非常相似：

```kotlin
// 定义 onClick 扩展方法
fun View.onClick(
    context: CoroutineContext = Dispatchers.Main,
    handler: suspend CoroutineScope.(v: View?) -> Unit
) {
    setOnClickListener { v ->
        GlobalScope.launch(context, CoroutineStart.DEFAULT) {
            handler(v)
        }.autoDispose(v)
    }
}

// 使用示例
btn.onClick {
    val request = Request()
    val response = async { sendRequest(request) }.await()
    updateUI(response)
}
```

**取消处理**：通过自定义 `AutoDisposableJob` 监听 View 的生命周期，在 View 销毁时自动取消任务。

---

## 参考文献

**书籍：**
- 《Java多线程编程实战指南（核心篇）》
- 《Java 并发编程实战》
- 《Java并发编程之美》

**视频：**
- 国内Top团队大牛带你玩转Android性能分析与优化
- 大厂资深面试官 带你破解Android高级面试

**文章：**
- Java线程中，Blocked，Wait,以及TIMED_WAIT的区别
- Java进阶（六）从ConcurrentHashMap的演进看Java多线程核心技术
- Java多线程（二）之Atomic：原子变量与原子类
- 破解 Kotlin 协程(1) - 入门篇
- 公平锁，非公平锁，乐观锁，悲观锁
