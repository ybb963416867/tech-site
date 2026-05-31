---
title: "Android_Graphics_Stack"
description: "Android 图形栈是一套分层协作的渲染体系，从应用层的 View 声明出发，经过测量/布局/绘制、硬件加速录制、RenderThread 提交、SurfaceFlinger 合成，最终由 HWC/GPU 送显到屏幕。整个链路可以用..."
pubDate: 2026-05-30
category: "Framwork"
tags: [API]
draft: false
---
# Android 图形栈：从 View 到 GPU 的完整链路

## 概述

Android 图形栈是一套分层协作的渲染体系，从应用层的 `View` 声明出发，经过测量/布局/绘制、硬件加速录制、RenderThread 提交、SurfaceFlinger 合成，最终由 HWC/GPU 送显到屏幕。整个链路可以用一句话概括：

> **View → Canvas/HWUI → DisplayList → RenderThread (OpenGL ES / Vulkan) → Surface/BufferQueue → SurfaceFlinger → HWC → Display**

---

## 一、整体架构分层

| 层级 | 核心组件 | 职责 |
|------|---------|------|
| 应用层 | View、ViewGroup、Activity | 描述 UI 树，触发重绘 |
| 框架渲染层 | ViewRootImpl、Choreographer、HWUI | 驱动帧渲染、录制 DisplayList |
| 渲染线程层 | RenderThread、RenderProxy、RenderNode | 异步执行 GPU 指令 |
| 图形 API 层 | OpenGL ES / Vulkan、Skia | 发出底层绘图指令 |
| 缓冲区层 | Surface、BufferQueue、Gralloc | 生产/消费图形缓冲区 |
| 合成层 | SurfaceFlinger、HWC (Hardware Composer) | 图层合成、最终送显 |
| 驱动/硬件层 | GPU 驱动、Display 驱动 | 执行着色器、驱动物理屏幕 |

---

## 二、VSync 与帧驱动机制

### 2.1 Project Butter 与 VSync

Android 4.1（Jelly Bean）引入 **Project Butter**，核心思路是：**每当 VSync 信号到达（默认 60 Hz，即每 16.67 ms 一次），CPU 和 GPU 立刻开始下一帧的计算**，而不是被动等待。VSync 信号由显示子系统产生，通过 `DispSync` 向上分发给两个关键消费者：

- **Choreographer**（应用进程）：驱动 UI 线程开始 measure/layout/draw
- **SurfaceFlinger**：驱动合成引擎执行图层合成

### 2.2 Choreographer 的角色

`Choreographer` 是应用帧驱动的核心调度器。它监听 VSync 脉冲，并将每帧工作拆分为三类回调，按顺序执行：

1. **INPUT** — 处理触摸/按键事件
2. **ANIMATION** — 推进属性动画
3. **TRAVERSAL** — 触发 `ViewRootImpl.performTraversals()`，进入 measure → layout → draw 流程

```
VSync 到达
  └─ Choreographer.doFrame()
       ├─ INPUT callbacks
       ├─ ANIMATION callbacks
       └─ TRAVERSAL → ViewRootImpl.performTraversals()
```

### 2.3 三缓冲（Triple Buffering）

Android 图形系统使用**双缓冲或三缓冲**策略：
- **Front Buffer**：当前显示器扫描的缓冲区
- **Back Buffer**：GPU 正在写入的缓冲区
- **第三块缓冲**（三缓冲时）：允许 CPU/GPU 在 SurfaceFlinger 合成时提前准备下一帧，减少掉帧

---

## 三、View 树的测量、布局与绘制

### 3.1 performTraversals 三步走

`ViewRootImpl.performTraversals()` 是每帧 UI 更新的入口，依次执行：

```
performTraversals()
  ├─ performMeasure()   → View.measure() → onMeasure()
  ├─ performLayout()    → View.layout()  → onLayout()
  └─ performDraw()      → View.draw()    → onDraw()
```

- **Measure**：自顶向下遍历 View 树，计算每个 View 的期望宽高（`MeasureSpec` 约束）。
- **Layout**：确定每个 View 在父容器中的实际位置（`left/top/right/bottom`）。
- **Draw**：将绘制命令记录到 `Canvas`。

### 3.2 invalidate() 与脏区标记

当某个 View 调用 `invalidate()` 时，系统并**不立刻重绘**，而是：
1. 向上传递"脏区"（dirty region）给父 View，一直到 `ViewRootImpl`
2. `ViewRootImpl` 向 `Choreographer` 注册一个 `TRAVERSAL` 回调
3. 等待下一次 VSync 到来，才真正触发重绘

这样做的好处是：在同一帧内多次 `invalidate()` 会被合并为一次 traversal，避免冗余绘制。

---

## 四、硬件加速与 HWUI

### 4.1 软件渲染 vs 硬件渲染

| 维度 | 软件渲染（CPU） | 硬件渲染（GPU / HWUI） |
|------|--------------|----------------------|
| 绘制载体 | `Bitmap` + `Canvas` (Skia) | `DisplayList` + `RenderNode` |
| 执行线程 | 主线程 | UI 线程录制 + RenderThread 执行 |
| 动画优化 | 需重绘脏区所有 View | 只修改 RenderNode 属性，无需重新录制 |
| 内存消耗 | 较低 | 较高（GPU 纹理/缓冲区） |
| 适用场景 | 简单/低端设备 | 现代 Android（API 14+ 默认开启） |

从 **Android 3.0（API 11）** 起支持硬件加速，**Android 4.0（API 14）** 默认全局开启。

### 4.2 HWUI 模块

`HWUI`（Hardware UI）是 Android 负责硬件加速 UI 渲染的核心模块（位于 `frameworks/base/libs/hwui`）。其主要组成：

- **RecordingCanvas**：拦截 `Canvas.drawXXX()` 调用，将操作记录为 `DisplayListOp` 而非立刻执行
- **RenderNode**：对应一个 View（或 View 子树），持有该节点的 `DisplayList` 及变换属性（位移、缩放、透明度等）
- **DisplayList**：存储一系列绘制命令的有序列表，可被 GPU 重复执行
- **RenderProxy**：UI 线程与 RenderThread 之间的代理，负责跨线程同步帧数据

```
UI 线程（主线程）
  └─ View.draw() → RecordingCanvas 录制
       └─ RenderNode.DisplayList 更新

RenderThread（独立线程）
  └─ 接收 DisplayList → 转换为 OpenGL ES 指令 → 提交 GPU
```

### 4.3 DisplayList 的优势

引入 DisplayList 的核心价值在于**缓存与增量更新**：
- 首帧：全量录制所有 View 的绘制命令
- 后续帧：只有标记为 dirty 的 View 重新录制其 `DisplayList`
- 执行属性动画（平移/旋转/透明度）时，**无需重新录制 DisplayList**，RenderThread 直接修改 RenderNode 的矩阵属性即可，极大减少 CPU 开销

---

## 五、RenderThread 与 GPU 指令提交

### 5.1 RenderThread 工作流

`RenderThread`（Android 5.0 引入）是一个专用渲染线程，与主线程并行工作：

```
UI 线程                        RenderThread
────────────────               ────────────────────────
performDraw()                  
  └─ syncAndDrawFrame()  ───►  syncFrameState()       // 同步帧数据
                               drawFrame()             // 执行渲染
                                 ├─ replayDisplayList() // 回放 DisplayList
                                 ├─ OpenGL ES / Vulkan 调用
                                 └─ eglSwapBuffers()   // 提交 Surface 缓冲区
```

主线程完成 DisplayList 录制后，通过 `RenderProxy` 通知 RenderThread 开始执行，**主线程无需等待 GPU 完成即可处理下一次用户输入**，这是 Android 渲染流畅性的关键。

### 5.2 OpenGL ES 与 Vulkan

Android 支持两套底层图形 API：

| | OpenGL ES | Vulkan |
|--|-----------|--------|
| 引入版本 | 早期 | Android 7.0（API 24） |
| 驱动开销 | 中等（状态机模型） | 极低（显式控制） |
| 多线程支持 | 有限 | 原生支持 |
| 学习曲线 | 较低 | 较高 |
| 适用场景 | 通用 UI 渲染 | 高性能游戏/计算 |

HWUI 在 Android 10+ 开始通过 **Skia Vulkan 后端** 逐步迁移部分渲染到 Vulkan，以降低 CPU 驱动开销。Vulkan 的优势包括**降低 CPU 开销**以及支持 **SPIR-V 二进制中间语言**。

### 5.3 EGL：OpenGL ES 与平台窗口系统的桥梁

`EGL` 是 OpenGL ES 与 Android 窗口系统（`ANativeWindow` / `Surface`）之间的接口层，负责：
- 创建 `EGLDisplay`、`EGLContext`（OpenGL ES 状态机）
- 创建 `EGLSurface`（绑定到具体的 `Surface`）
- `eglSwapBuffers()`：将渲染完成的 Back Buffer 提交给 BufferQueue

---

## 六、Surface、BufferQueue 与 Gralloc

### 6.1 生产者-消费者模型

Android 图形系统的核心设计是**生产者-消费者模型**：

```
生产者（App / GPU）                消费者（SurfaceFlinger）
─────────────────                 ────────────────────────
dequeueBuffer()  ◄───────────────  BufferQueue
onDraw / GPU 渲染                  
queueBuffer()    ────────────────► acquireBuffer()
                                   合成
                                   releaseBuffer()  ──► 归还给生产者
```

`BufferQueue` 是 Android 中**所有图形数据流动的核心枢纽**，几乎所有图形缓冲区的传递都依赖它。

### 6.2 Surface

`Surface` 代表一块可绘制的画布，本质上是 `BufferQueue` 的**生产者端**句柄。应用通过 `Surface` 请求（dequeue）一块 `GraphicBuffer`，在其上完成 GPU 渲染后，将其 enqueue 回 `BufferQueue`。

每一个 Android 窗口（Window）背后都有一个 `Surface`；可见的 Surface 最终由 SurfaceFlinger 合成到显示器上。

### 6.3 Gralloc：图形内存分配器

`Gralloc`（Graphics Allocator）是 Android HAL 层的图形内存分配模块，负责：
- 从 `ION Driver`（内核态）分配**连续物理内存**（或 GPU 专用内存）
- 支持 CPU 和 GPU 共享访问（通过 DMA-BUF 文件描述符跨进程共享）
- 为每块 `GraphicBuffer` 描述格式（RGBA_8888、YUV 等）、步长（stride）、使用标志

```
SurfaceFlinger → Gralloc HAL → ION Driver → 物理内存
                                   │
                          DMA-BUF fd 跨进程共享给 App
```

### 6.4 常见 Surface 类型对比

| 类型 | 描述 | 合成方式 |
|------|------|---------|
| `SurfaceView` | View + 独立 Surface，由 SurfaceFlinger 直接合成 | SurfaceFlinger（独立图层） |
| `TextureView` | View + SurfaceTexture，内容作为 GLES 纹理 | HWUI / GLES（与 View 树合成） |
| `GLSurfaceView` | 封装 EGL 环境的 SurfaceView | SurfaceFlinger（独立图层） |

---

## 七、SurfaceFlinger：图层合成

### 7.1 SurfaceFlinger 的职责

`SurfaceFlinger` 是 Android 系统的**核心合成服务**，运行在独立进程（`surfaceflinger`）。它的主要职责：
1. **管理所有 Surface 图层**（Z-Order、透明度、裁剪区域、变换矩阵）
2. **接收各应用提交的 GraphicBuffer**
3. **决定合成策略**：GPU 合成 vs HWC 直接合成
4. **驱动帧送显**：将最终合成图像提交给 Display HAL

SurfaceFlinger 自身也是 OpenGL ES 的客户端，使用 GPU 执行图层合成；同时它被 VSync 信号驱动，每帧唤醒一次执行合成。

### 7.2 图层合成流程

```
VSync 到达（SurfaceFlinger 侧）
  └─ SurfaceFlinger.onMessageReceived(INVALIDATE)
       ├─ handleMessageInvalidate()   // 收集所有就绪的 BufferQueue
       └─ handleMessageRefresh()
            ├─ preComposition()       // 通知 Layer 准备
            ├─ rebuildLayerStacks()   // 重新计算图层堆叠
            ├─ setUpHWComposer()      // 提交图层给 HWC
            ├─ doComposition()        // GPU 合成 或 HWC 合成
            └─ postComposition()      // 更新帧统计、释放旧 Buffer
```

### 7.3 与应用进程的通信

应用进程通过 **Binder IPC** 与 SurfaceFlinger 交互，主要接口为 `ISurfaceComposer`。应用创建 `Surface` 时，实际上是向 SurfaceFlinger 请求创建一个 `Layer`，并通过 `BufferQueue` 进行零拷贝的缓冲区共享（DMA-BUF）。

---

## 八、HWC（Hardware Composer HAL）

### 8.1 HWC 的角色

`Hardware Composer HAL`（HWC）是 Android 图形渲染的**最终决策者**，是 SurfaceFlinger 和物理屏幕之间的桥梁。HWC 由芯片厂商实现，可以决定：

- 哪些图层由**显示硬件（Display Engine）直接叠加合成**（overlay，零 GPU 开销）
- 哪些图层需要 **SurfaceFlinger 用 GPU 合成**后再送显

### 8.2 HWC 合成策略

```
SurfaceFlinger 提交图层列表给 HWC
  └─ HWC 为每个图层标记合成类型：
       ├─ HWC_OVERLAY    → 硬件 Overlay，直接送显（最优）
       ├─ HWC_FRAMEBUFFER → 需要 GPU 合成
       └─ HWC_CURSOR     → 硬件光标（特殊 Overlay）

GPU 合成完成后，HWC 将所有图层（Overlay + GPU合成帧）
  └─ 调用 Display 驱动，写入 FrameBuffer，扫描到屏幕
```

HWC 还负责处理 **VSync 事件上报**（`HWC_EVENT_VSYNC`）以及 **HDMI 热插拔**（`HWC_EVENT_HOTPLUG`）事件。

---

## 九、完整渲染链路总结

以下是从用户触发 `invalidate()` 到像素显示在屏幕的完整链路：

```
① 用户操作 / 代码调用 View.invalidate()
        │
② ViewRootImpl 向 Choreographer 注册 TRAVERSAL 回调
        │
③ VSync 到达 → Choreographer.doFrame()
        │
④ UI 线程：ViewRootImpl.performTraversals()
        ├─ measure()  →  计算 View 尺寸
        ├─ layout()   →  确定 View 位置
        └─ draw()     →  RecordingCanvas 录制 DisplayList
        │
⑤ UI 线程：syncAndDrawFrame() 同步帧数据给 RenderThread
        │
⑥ RenderThread：回放 DisplayList
        └─ 调用 OpenGL ES / Vulkan 指令
        └─ GPU 执行顶点着色器 / 片段着色器
        └─ 渲染结果写入 GraphicBuffer（通过 Gralloc 分配）
        │
⑦ RenderThread：eglSwapBuffers()
        └─ 将完成的 GraphicBuffer enqueue 到 BufferQueue
        │
⑧ SurfaceFlinger 被 VSync 唤醒
        └─ 从各 App 的 BufferQueue acquireBuffer()
        └─ 将图层信息提交给 HWC
        │
⑨ HWC 决策合成策略
        ├─ 部分图层：硬件 Overlay 直接送显
        └─ 其余图层：SurfaceFlinger 调用 GPU 合成
        │
⑩ 合成完成 → Display 驱动将 FrameBuffer 扫描到物理屏幕
        └─ 用户看到最终画面 ✓
```

---

## 十、性能优化关键点

### 10.1 16ms 帧时间预算

以 60 fps 为例，每帧有 **16.67 ms** 的时间预算，典型分配如下：

| 阶段 | 理想耗时 |
|------|---------|
| Input 处理 | < 2 ms |
| Measure / Layout | < 3 ms |
| DisplayList 录制（UI 线程） | < 3 ms |
| GPU 渲染（RenderThread） | < 8 ms |
| SurfaceFlinger 合成 | < 1 ms |

### 10.2 常见性能问题与优化

| 问题 | 原因 | 优化方向 |
|------|------|---------|
| **过度绘制（Overdraw）** | 同一像素被多次绘制 | 减少不必要背景、使用 `clipRect()` |
| **布局嵌套过深** | Measure/Layout 耗时过长 | 使用 `ConstraintLayout`、`merge` 标签 |
| **主线程 IO / 耗时操作** | 错过 VSync，导致掉帧 | 将耗时任务移到子线程 |
| **频繁 invalidate()** | 过多 DisplayList 重录制 | 使用属性动画代替手动重绘 |
| **纹理上传慢** | 大图直接在主线程解码上传 | 提前异步解码，使用 `BitmapFactory` 子线程 |

### 10.3 调试工具

- **Profile GPU Rendering**（开发者选项）：以柱状图形式直观展示每帧各阶段耗时
- **Systrace / Perfetto**：追踪 UI 线程、RenderThread、SurfaceFlinger 的完整时间线
- **GPU Overdraw 可视化**：用颜色标注像素被重复绘制的次数（蓝→绿→粉→红，越红越严重）
- **Hierarchy Viewer / Layout Inspector**：分析 View 树结构和布局耗时

---

## 参考资料

- [Android 官方文档：图形架构](https://source.android.com/docs/core/graphics/architecture)
- [Android 官方文档：Graphics](https://source.android.com/docs/core/graphics)
- [Profile GPU Rendering | Android Developers](https://developer.android.com/topic/performance/rendering/profile-gpu)
