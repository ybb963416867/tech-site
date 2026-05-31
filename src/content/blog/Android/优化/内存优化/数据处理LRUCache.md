# 数据处理LRUCache

> 接受固定容量的数据， 超过容量后，在后面追加，同时移除掉最老的， 动态扩容线程安全

```java
import android.util.Log

open class LRUCache<K, V>(initialCapacity: Int, accessOrder: Boolean = true) {

    @Volatile
    private var capacity = initialCapacity

    protected val map = object : YunShenLinkedHashMap<K, V>(initialCapacity, 0.75f, accessOrder) {
        override fun removeEldestEntry(eldest: Map.Entry<K, V>?): Boolean {
            return size > capacity
        }
    }

    @Synchronized
    fun put(key: K, value: V): V? {
        return map.put(key, value)
    }

    @Synchronized
    fun putObtainK(key: K, value: V): K {
        map[key] = value
        return key
    }

    @Synchronized
    fun remove(key: K): V? {
        return map.remove(key)
    }

    @Synchronized
    fun get(key: K): V? {
        return map[key]
    }

    @Synchronized
    fun size(): Int {
        return map.size
    }

    @Synchronized
    fun getLastValue(): V? {
        if (map.values.isEmpty()){
            return null
        }
        return map.values.elementAt(size() - 1)
    }

    @Synchronized
    fun getLastKey(): K? {
        if (map.keys.isEmpty()){
            return null
        }
        return map.keys.last()
    }

    @Synchronized
    fun printElements() {
        Log.d(TAG, "threadName: ${Thread.currentThread().name} --- map: $map")
    }

    @Synchronized
    fun setCapacity(newCapacity: Int) {
        if (newCapacity <= 0) {
            throw IllegalArgumentException("newCapacity > 0")
        }
        capacity = newCapacity
        // 手动调整当前缓存大小，移除多余的元素
        while (map.size > newCapacity) {
            val firstKey = map.keys.iterator().next()
            map.remove(firstKey)
        }
    }

    open fun findKeyByValue(value: V): K? = null

    open fun findRangeByValue(minValue: V, maxValue: V): List<K> = mutableListOf()


    @Synchronized
    fun clear(){
        map.clear()
    }

    @Synchronized
    fun getValueByIndex(index: Int): V? {
        if (index < 0 || index >= map.size) {
            throw IndexOutOfBoundsException("index: $index, size: ${map.size}")
        }
        return map.values.elementAt(index)
    }

    @Synchronized
    fun getKeyByIndex(index: Int): K? {
        if (index < 0 || index >= map.size) {
            throw IndexOutOfBoundsException("index: $index, size: ${map.size}")
        }

        return map.keys.elementAt(index)
    }

    @Synchronized
    fun getCapacity(): Int {
        return capacity
    }

    companion object {
        private const val TAG = "LRUCache"
    }
}
```

