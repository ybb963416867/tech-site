---
title: "LinkedBlockingQueue"
description: "LinkedBlockingQueue 的技术笔记。"
pubDate: 2026-05-29
category: "c++"
tags: [iOS]
draft: false
---
```
#ifndef JNI_DEMO_LINKEDBLOCKINGQUEUE_H
#define JNI_DEMO_LINKEDBLOCKINGQUEUE_H

#include <iostream>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <stdexcept>
#include <atomic>  // ✅ Added atomic variable

template<typename T>
class LinkedBlockingQueue {
public:
    /**
     * @brief Constructs a new LinkedBlockingQueue object.
     *
     * @param capacity The maximum capacity of the queue. Must be greater than 0.
     * @throws std::invalid_argument If capacity is not greater than 0.
     */
    explicit LinkedBlockingQueue(size_t capacity)
        : capacity_(capacity), interrupted_(false) {
        if (capacity == 0) {
            throw std::invalid_argument("Capacity must be greater than 0");
        }
    }

    /**
     * @brief Adds an item to the queue. Blocks if the queue is full.
     *
     * @param item The item to add.
     */
    void put(const T &item) {
        std::unique_lock<std::mutex> lock(mutex_);
        not_full_.wait(lock, [this]() { return queue_.size() < capacity_ || interrupted_; });
        if (interrupted_) return;  //
        queue_.push(item);
        not_empty_.notify_one();
    }

    /**
     * @brief Takes an item from the queue. Blocks if the queue is empty.
     *
     * @return T The item taken from the queue.
     * @throws std::runtime_error If the queue is interrupted while empty.
     */
    T take() {
        std::unique_lock<std::mutex> lock(mutex_);
        not_empty_.wait(lock, [this]() { return !queue_.empty() || interrupted_; });

        if (interrupted_ && queue_.empty()) {
            throw std::runtime_error("Queue interrupted");  // ⚠ Throws exception to notify thread exit
        }

        T item = queue_.front();
        queue_.pop();
        not_full_.notify_one();
        return item;
    }

    /**
     * @brief Attempts to add an item to the queue without blocking.
     *
     * @param item The item to add.
     * @return true If the item was added successfully.
     * @return false If the queue is full or interrupted.
     */
    bool offer(const T &item) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.size() >= capacity_ || interrupted_) {
            return false;
        }
        queue_.push(item);
        not_empty_.notify_one();
        return true;
    }

    /**
     * @brief Attempts to take an item from the queue without blocking.
     *
     * @param item Reference to store the taken item.
     * @return true If an item was taken successfully.
     * @return false If the queue is empty or interrupted.
     */
    bool poll(T &item) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.empty() || interrupted_) {
            return false;
        }
        item = queue_.front();
        queue_.pop();
        not_full_.notify_one();
        return true;
    }

    /**
     * @brief Clears all items from the queue.
     */
    void clear() {
        std::lock_guard<std::mutex> lock(mutex_);
        std::queue<T> empty;
        std::swap(queue_, empty);
        not_full_.notify_all();
    }

    /**
     * @brief Gets the current size of the queue.
     * @return size_t The number of items in the queue.
     */
    size_t size() {
        std::lock_guard<std::mutex> lock(mutex_);
        return queue_.size();
    }

    /**
     * @brief Interrupts all waiting threads, making `take()` return immediately.
     */
    void interrupt() {
        std::lock_guard<std::mutex> lock(mutex_);
        interrupted_ = true;
        not_empty_.notify_all();  // ⚠ Wakes up all waiting `take()` threads
        not_full_.notify_all();
    }

private:
    size_t capacity_;  // Queue capacity
    std::queue<T> queue_;  // Internal queue implementation
    std::mutex mutex_;  // Mutex for queue protection
    std::condition_variable not_empty_;  // Condition variable: queue is not empty
    std::condition_variable not_full_;  // Condition variable: queue is not full
    std::atomic<bool> interrupted_;  // ✅ Used to mark if `interrupt()` has been called
};

#endif // JNI_DEMO_LINKEDBLOCKINGQUEUE_H

```

