# Android 启动优化中的异步优化

[![img](https://cdn2.jianshu.io/assets/default_avatar/1-04bbeead395d74921af6a4e8214b4f61.jpg)

### 一、启动优化小技巧-Theme 切换

Theme 切换启动速度没变，是让用户感觉上变快

下面是使用方式
 1、创建 launcher.xml



```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- The background color, preferably the same as your normal theme -->
    <item android:drawable="@android:color/white"/>
    <!-- Your product logo - 144dp color version of your app icon -->
    <item>
        <bitmap android:src="@mipmap/splash"
                android:gravity="fill"/>
    </item>
</layer-list>
```

2、style 文件使用



```xml
<!-- Base application theme. -->
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
   <!-- Customize your theme here. -->
   <item name="colorPrimary">@color/colorPrimary</item>
   <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
   <item name="colorAccent">@color/colorAccent</item>
 </style>

<style name="Theme.Splash" parent="Theme.AppCompat.Light.NoActionBar">
   <item name="android:windowBackground">@drawable/launcher</item>
   <item name="android:windowNoTitle">true</item>
</style>
```

3、在 manifest 文件中使用



```xml
<activity android:name=".MainActivity"
              android:theme="@style/Theme.Splash">
    <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <action android:name="android.intent.action.VIEW"/>

        <category android:name="android.intent.category.LAUNCHER"/>
    </intent-filter>
</activity>
```

4、在 Activity 中使用



```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        //super.onCreate()之前切换回来
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

### 二、异步优化

核心思想：子线程分担主线程任务，并行减少执行时间

下面以 Application 为例，在 Application 中依赖了很多第三方库，下面是没有异步优化时执行的时间，如下代码所示：



```kotlin
class PerformanceApp : Application() {

    override fun onCreate() {
        super.onCreate()
        sApplication = this
        LaunchTimer.startRecord()
      
        initBugly()
        initUmeng()
        initFresco()
        initMap()

        LaunchTimer.endRecord("PerformApp")
    }
}
```

执行结果如下图所示：耗时 1370 毫秒



![img](https://upload-images.jianshu.io/upload_images/2079881-e5b2eb5e62f5d2a9.png?imageMogr2/auto-orient/strip|imageView2/2/w/484)

下面是用线程池 异步执行三方库



```kotlin
class PerformanceApp : Application() {

//参考 AsyncTask 源码中线程池设置的核心数，根据 CPU 的核心数确定线程池的数量
    private val CPU_COUNT = Runtime.getRuntime().availableProcessors()
    private val CORE_POOL_SIZE = Math.max(2, Math.min(CPU_COUNT - 1, 4))

    override fun onCreate() {
        super.onCreate()
        sApplication = this
        LaunchTimer.startRecord()

        val service = Executors.newFixedThreadPool(CORE_POOL_SIZE)
        service.submit {
            initBugly()
        }
        service.submit {
            initUmeng()
        }
        service.submit {
            initFresco()
        }
        service.submit {
            initMap()
        }

        LaunchTimer.endRecord("PerformApp")
    }
}
```

> 上面代码没有放在一个 service.submit { } 方法中，原因是为了减少资源浪费。理论上可以都放在一块，但是效果不够好，根据 CPU 的核心数确定线程池的数量，如果创建了 3 个，而只用了一个，这是一种浪费，所以对每个方法都 service.submit { }  一下。

执行结果如下图所示：耗时 12 毫秒



![img](https://upload-images.jianshu.io/upload_images/2079881-01cdfe9a23b73a80.png?imageMogr2/auto-orient/strip|imageView2/2/w/460)

通过上面代码分析可知，异步执行效果明显。

**异步优化注意：**

- 有些代码不符合异步要求(如：Handler())；
- 区分 CPU 密集型和 IO 密集型
- 有些代码需要在某阶段完成
   如：initMap() 必须要在Application 的 onCreate() 结束掉就执行完成。
   解决方案：创建 CountDownLatch 类，代码示例如下：



```kotlin
class PerformanceApp : Application() {

    //参考 AsyncTask 源码中线程池设置的核心数，根据 CPU 的核心数确定线程池的数量
    private val CPU_COUNT = Runtime.getRuntime().availableProcessors()
    private val CORE_POOL_SIZE = Math.max(2, Math.min(CPU_COUNT - 1, 4))

    private val mCountDownLatch = CountDownLatch(1)

   
    override fun onCreate() {
        super.onCreate()
        sApplication = this
        LaunchTimer.startRecord()
        val service = Executors.newFixedThreadPool(CORE_POOL_SIZE)
        service.submit {
            initBugly()
        }
        service.submit {
            initUmeng()
        }
        service.submit {
            initFresco()
        }
        service.submit {
            //高德地图
            initMap()
            mCountDownLatch.countDown()
        }
        //CountDownLatch不被满足的话会一直等待
        mCountDownLatch.await()
        LaunchTimer.endRecord("PerformApp")
    }
}
```

**缺点：**

1. 代码不够优雅
2. 场景不好处理（依赖关系）
3. 特定时间段内结束某个任务不好处理
4. 维护成本高

> CountDownLatch 参考
> [java多线程CountDownLatch及线程池ThreadPoolExecutor/ExecutorService使用示例](https://links.jianshu.com/go?to=https%3A%2F%2Fblog.csdn.net%2Fjavaloveiphone%2Farticle%2Fdetails%2F54729821)
> [CountDownLatch详解](https://www.jianshu.com/p/128476015902)

### 三、异步优化启动器

**核心思想：充分利用CPU多核，自动梳理任务顺序**
**启动器流程**

- 代码 Task 化，启动逻辑抽象为 Task
- 根据所有任务依赖关系排序生成一个有向无环图
- 多线程按照排序后的优先级依次执行

![img](https://upload-images.jianshu.io/upload_images/2079881-730bac95da570b4e.png?imageMogr2/auto-orient/strip|imageView2/2/w/866)

headTask：所有Task执行之前所做的事情
 tailTask：所有任务结束之后
 idleTask：程序空闲时执行

使用示例：



```kotlin
class PerformanceApp : Application() {

      override fun onCreate() {
        super.onCreate()
        sApplication = this
        LaunchTimer.startRecord()
        TaskDispatcher.init(this)
        val dispatcher = TaskDispatcher.createInstance()
        dispatcher.addTask(InitAMapTask())
            .addTask(InitStethoTask())
            .addTask(InitWeexTask())
            .addTask(InitBuglyTask())
            .addTask(InitFrescoTask())
            .addTask(InitJPushTask())
            .addTask(InitUmengTask())
            .addTask(GetDeviceIdTask())
            .start()
        //启动器中配置需要等待的函数没有完成是都会等待
        dispatcher.await()
        LaunchTimer.endRecord("task")
   }
}
```

### 四、延迟初始化方案

##### 1、常规方案

- new Handler().postDelayed
- Feed 展示后调用

示例展示：
 在 NewsAdapter 中设置数据展示后的监听器



```kotlin
//NewsAdapter 中
public void setOnFeedShowCallBack(OnFeedShowCallBack callBack) {
        this.mCallBack = callBack;
}
@Override
    public void onBindViewHolder(@NonNull final ViewHolder holder, int position) {
        //onBindViewHolder 回调多次，而只统计一次，加个变量标识
        if (position == 0 && !mHasRecorded) {
            mHasRecorded = true;
            holder.layout.getViewTreeObserver()
                    .addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
                        @Override
                        public boolean onPreDraw() {
                            holder.layout.getViewTreeObserver().removeOnPreDrawListener(this);
                            LaunchTimer.Companion.endRecord("FeedShow");
                            if (mCallBack != null) {
                                mCallBack.onFeedShow();
                            }
                            return true;
                        }
                    });
        }
}

//MainActivity 中
override fun onFeedShow() {
    DispatchRunnable(DelayInitTaskA()).run()
    DispatchRunnable(DelayInitTaskB()).run()
}
```

**问题：**

- 导致 Feed 卡顿：我们 NewsAdapter 中的回调是在主线程中执行，那么 MainActivity 中的 onFeedShow()  异步执行可能会延迟，造成卡顿
- 时间不便控制

##### 2、优化方案

**核心思想：对延迟任务进行分批初始化**

- 利用 IdleHandler 特性，空闲执行

示例展示：
 首先创建 DelayInitDispatcher 类



```csharp
public class DelayInitDispatcher {

    private Queue<Task> mDelayTasks = new LinkedList<>();
    /**
     * IdleHandler：在系统空闲后执行
     */
    private MessageQueue.IdleHandler mIdleHandler = new MessageQueue.IdleHandler() {
        //系统空闲时回调
        @Override
        public boolean queueIdle() {
            if (mDelayTasks.size() > 0) {
                Task task = mDelayTasks.poll();
                new DispatchRunnable(task).run();
            }
            return !mDelayTasks.isEmpty();
        }
    };

    public DelayInitDispatcher addTask(Task task) {
        mDelayTasks.add(task);
        return this;
    }

    public void start() {
        Looper.myQueue().addIdleHandler(mIdleHandler);
    }

}
```

创建 DispatchRunnable 类



```java
/**
 * 任务真正执行的地方
 */

public class DispatchRunnable implements Runnable {
    private Task mTask;
    private TaskDispatcher mTaskDispatcher;

    public DispatchRunnable(Task task) {
        this.mTask = task;
    }
    public DispatchRunnable(Task task,TaskDispatcher dispatcher) {
        this.mTask = task;
        this.mTaskDispatcher = dispatcher;
    }

    @Override
    public void run() {
        TraceCompat.beginSection(mTask.getClass().getSimpleName());
        DispatcherLog.i(mTask.getClass().getSimpleName()
                + " begin run" + "  Situation  " + TaskStat.getCurrentSituation());

        Process.setThreadPriority(mTask.priority());

        long startTime = System.currentTimeMillis();

        mTask.setWaiting(true);
        mTask.waitToSatisfy();

        long waitTime = System.currentTimeMillis() - startTime;
        startTime = System.currentTimeMillis();

        // 执行Task
        mTask.setRunning(true);
        mTask.run();

        // 执行Task的尾部任务
        Runnable tailRunnable = mTask.getTailRunnable();
        if (tailRunnable != null) {
            tailRunnable.run();
        }

        if (!mTask.needCall() || !mTask.runOnMainThread()) {
            printTaskLog(startTime, waitTime);

            TaskStat.markTaskDone();
            mTask.setFinished(true);
            if(mTaskDispatcher != null){
                mTaskDispatcher.satisfyChildren(mTask);
                mTaskDispatcher.markTaskDone(mTask);
            }
            DispatcherLog.i(mTask.getClass().getSimpleName() + " finish");
        }
        TraceCompat.endSection();
    }

    /**
     * 打印出来Task执行的日志
     *
     * @param startTime
     * @param waitTime
     */
    private void printTaskLog(long startTime, long waitTime) {
        long runTime = System.currentTimeMillis() - startTime;
        if (DispatcherLog.isDebug()) {
            DispatcherLog.i(mTask.getClass().getSimpleName() + "  wait " + waitTime + "   run "
                    + runTime + "   isMain " + (Looper.getMainLooper() == Looper.myLooper())
                    + "  needWait " + (mTask.needWait() || (Looper.getMainLooper() == Looper.myLooper()))
                    + "  ThreadId " + Thread.currentThread().getId()
                    + "  ThreadName " + Thread.currentThread().getName()
                    + "  Situation  " + TaskStat.getCurrentSituation()
            );
        }
    }

}
```

在 MainActivity 中的使用



```kotlin
 override fun onFeedShow() {
        val delayInitDispatcher = DelayInitDispatcher()
        delayInitDispatcher.addTask(DelayInitTaskA())
            .addTask(DelayInitTaskB())
            .start()
 }
```

**优点：**

- 执行时机明确
- 缓解 Feed 卡顿
   每次只执行一个 Task，而且是在系统空闲时执行。

实例 demo 如：[PerformanceDemo](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fwuchao226%2FPerformanceDemo)