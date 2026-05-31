# Android LruCache 详解

## 一、概述

`LruCache`（Least Recently Used Cache）是 Android 提供的一种**内存缓存**工具类，基于 **LRU（最近最少使用）算法**实现。当缓存容量达到上限时，会优先淘汰最久未被使用的条目，从而为新数据腾出空间。

- **包路径**：`androidx.collection.LruCache`（推荐）或 `android.util.LruCache`（API 12+）
- **底层结构**：`LinkedHashMap`（访问顺序模式），天然支持 LRU 排序
- **线程安全**：内部方法使用 `synchronized` 同步，适合多线程环境

---

## 二、核心原理

```
最近访问 ←————————————————————→ 最久未访问
[ Entry5 | Entry3 | Entry1 | Entry4 | Entry2 ]
                                         ↑
                                   淘汰候选（下次）
```

每次 `get()` 或 `put()` 操作都会将对应条目移动到链表头部；当缓存满时，从链表尾部淘汰。

---

## 三、基本用法

### 3.1 创建缓存

```kotlin
// 以 Bitmap 缓存为例，设置缓存上限为最大可用内存的 1/8
val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt() // KB
val cacheSize = maxMemory / 8

val bitmapCache = object : LruCache<String, Bitmap>(cacheSize) {
    // 必须重写：返回每个条目的大小（单位与 maxSize 保持一致）
    override fun sizeOf(key: String, value: Bitmap): Int {
        return value.byteCount / 1024 // 返回 KB
    }
}
```

> ⚠️ **注意**：若不重写 `sizeOf()`，默认每个条目大小为 1，此时 `maxSize` 表示条目数量上限。

### 3.2 存入缓存

```kotlin
fun addBitmapToCache(key: String, bitmap: Bitmap) {
    if (bitmapCache.get(key) == null) {
        bitmapCache.put(key, bitmap)
    }
}
```

### 3.3 读取缓存

```kotlin
fun getBitmapFromCache(key: String): Bitmap? {
    return bitmapCache.get(key)
}
```

### 3.4 移除缓存

```kotlin
// 移除指定 key
bitmapCache.remove("image_key")

// 清空所有缓存
bitmapCache.evictAll()
```

---

## 四、重要方法详解

| 方法 | 说明 |
|------|------|
| `put(key, value)` | 存入一个条目，若已存在则替换并返回旧值 |
| `get(key)` | 获取条目，命中时将其移至头部；未命中时调用 `create()` |
| `remove(key)` | 手动移除指定条目，触发 `entryRemoved()` |
| `evictAll()` | 清空整个缓存 |
| `size()` | 当前缓存已用大小 |
| `maxSize()` | 缓存最大容量 |
| `hitCount()` | 缓存命中次数 |
| `missCount()` | 缓存未命中次数 |
| `evictionCount()` | 因容量不足被淘汰的次数 |
| `snapshot()` | 返回当前缓存的快照（不可修改的副本） |
| `resize(maxSize)` | 动态调整缓存大小（API 21+） |

---

## 五、可重写的回调方法

### 5.1 `sizeOf()` — 自定义条目大小

```kotlin
override fun sizeOf(key: String, value: Bitmap): Int {
    // 返回该条目占用的"单位"大小，与构造函数 maxSize 单位一致
    return value.byteCount / 1024
}
```

### 5.2 `entryRemoved()` — 条目被移除时回调

```kotlin
override fun entryRemoved(
    evicted: Boolean,       // true = 因容量淘汰；false = 主动 put/remove
    key: String,
    oldValue: Bitmap,
    newValue: Bitmap?       // 若是被新值替换，则 newValue 非空
) {
    if (evicted) {
        // 条目因 LRU 淘汰，可在此回收资源
        oldValue.recycle()
    }
}
```

### 5.3 `create()` — 缓存未命中时创建默认值

```kotlin
override fun create(key: String): Bitmap? {
    // 未命中时自动调用，可返回默认占位图
    return BitmapFactory.decodeResource(resources, R.drawable.placeholder)
}
```

---

## 六、完整实战示例：图片内存缓存

```kotlin
class ImageMemoryCache(context: Context) {

    private val lruCache: LruCache<String, Bitmap>

    init {
        val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
        val cacheSize = maxMemory / 8

        lruCache = object : LruCache<String, Bitmap>(cacheSize) {

            override fun sizeOf(key: String, value: Bitmap): Int {
                return value.byteCount / 1024
            }

            override fun entryRemoved(
                evicted: Boolean,
                key: String,
                oldValue: Bitmap,
                newValue: Bitmap?
            ) {
                // 被淘汰时记录日志（实际项目中 Bitmap 通常由 GC 回收，无需手动 recycle）
                if (evicted) {
                    Log.d("LruCache", "Evicted: $key, size=${oldValue.byteCount / 1024}KB")
                }
            }
        }
    }

    fun put(key: String, bitmap: Bitmap) {
        lruCache.put(key, bitmap)
    }

    fun get(key: String): Bitmap? = lruCache.get(key)

    fun remove(key: String) {
        lruCache.remove(key)
    }

    fun clear() {
        lruCache.evictAll()
    }

    fun logStats() {
        Log.d(
            "LruCache",
            "size=${lruCache.size()}KB / max=${lruCache.maxSize()}KB | " +
            "hits=${lruCache.hitCount()}, misses=${lruCache.missCount()}, " +
            "evictions=${lruCache.evictionCount()}"
        )
    }
}
```

---

## 七、与 DiskLruCache 配合（两级缓存）

内存缓存（LruCache）速度快但易失，磁盘缓存（DiskLruCache）持久但较慢，通常组合使用：

```
请求图片
   ↓
LruCache（内存）命中? ──是──→ 返回 Bitmap
   ↓ 否
DiskLruCache（磁盘）命中? ──是──→ 解码 → 存入 LruCache → 返回
   ↓ 否
网络请求 → 存入 DiskLruCache → 解码 → 存入 LruCache → 返回
```

```kotlin
// 读取示意（伪代码）
fun loadImage(url: String): Bitmap? {
    val key = url.md5()

    // 1. 查内存
    memoryCache.get(key)?.let { return it }

    // 2. 查磁盘
    diskCache.get(key)?.let { bitmap ->
        memoryCache.put(key, bitmap)
        return bitmap
    }

    // 3. 网络获取
    return downloadBitmap(url)?.also { bitmap ->
        diskCache.put(key, bitmap)
        memoryCache.put(key, bitmap)
    }
}
```

---

## 八、注意事项

1. **`maxSize` 单位要与 `sizeOf()` 返回值一致**，否则缓存大小计算错误。
2. **不要在 `entryRemoved()` 中调用 `put()`**，可能造成无限递归。
3. **Bitmap 不要在 `entryRemoved()` 中立即 `recycle()`**，若 UI 仍在使用该 Bitmap 会崩溃；推荐结合 `SoftReference` 或交由 GC 处理。
4. **`get()` 返回 null 不代表 key 不存在**，若重写了 `create()` 会自动填充值，需注意区分。
5. **缓存大小推荐**：通常设置为可用内存的 `1/8 ~ 1/4`，根据应用实际情况调整。
6. **`LruCache` 仅适用于内存缓存**，进程被杀后数据丢失，持久化需搭配 DiskLruCache。

---

## 九、与其他缓存方案对比

| 方案 | 存储位置 | 持久化 | 适用场景 |
|------|---------|--------|---------|
| `LruCache` | 内存（堆） | ❌ | 高频访问的临时数据（Bitmap、解析结果等） |
| `DiskLruCache` | 磁盘 | ✅ | 网络图片、大文件缓存 |
| `SparseArray` | 内存 | ❌ | 整数 key 的轻量映射（无 LRU） |
| `Room` / `SQLite` | 磁盘 | ✅ | 结构化数据持久化 |
| `MMKV` | 磁盘（mmap） | ✅ | 高性能 Key-Value 持久化 |

---

## 十、源码简析（关键部分）

```java
// LinkedHashMap 以访问顺序（accessOrder=true）初始化，实现 LRU 语义
this.map = new LinkedHashMap<K, V>(0, 0.75f, true);

public final V put(K key, V value) {
    synchronized (this) {
        size += safeSizeOf(key, value);
        V previous = map.put(key, value);
        if (previous != null) {
            size -= safeSizeOf(key, previous); // 替换时减去旧值大小
        }
    }
    trimToSize(maxSize); // 超出时淘汰尾部条目
    return previous;
}

private void trimToSize(int maxSize) {
    while (true) {
        synchronized (this) {
            if (size <= maxSize || map.isEmpty()) break;
            // eldest = 最久未访问的条目（链表尾部）
            Map.Entry<K, V> toEvict = map.eldest();
            map.remove(toEvict.getKey());
            size -= safeSizeOf(toEvict.getKey(), toEvict.getValue());
        }
        entryRemoved(true, key, value, null);
    }
}
```

> `LinkedHashMap` 在 `accessOrder=true` 模式下，每次 `get()` / `put()` 都会将条目移动到链表尾部（最新），链表头部即为最久未访问条目，`trimToSize` 从头部淘汰，完美实现 LRU。
