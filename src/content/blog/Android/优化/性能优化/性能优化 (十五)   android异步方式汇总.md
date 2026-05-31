# android异步方式汇总

## Thread

- 最简单、常见的异步方式
- 不易复用、频繁创建及销毁开销大
- 复杂场景不易使用

## HandlerThread

- 自带消息循环的线程
- 串行执行
- 长时间运行，不断从队列中获取任务

## IntentService

- 继承自Service在内部创建HandlerThread
- 异步，不占用主线程
- 优先级高，不易被系统Kill

## AsyncTask

- Android 提供的工具类
- 无需自己处理线程的切换
- 需注意版本不一致问题

## Java提供的线程池

- 易复用，减少频繁创建、销毁的时间
- 功能强大：定时、任务队列、并发数控制等

## RxJava

- 由强大的Scheduler集合提供
- 不同类型的区分：IO、Computation





