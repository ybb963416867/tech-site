# Android绘制原理及工具选择

- cpu负责计算显示内容
- GPU负责栅格化（UI元素绘制到屏幕上）

1. 16ms发出VSync信号触发UI渲染
2. 大多数的Android设备屏幕刷新频率：60Hz

## 优化工具

### Systrace

- 关注Frames
- 正常：绿色原点，丢帧：黄色或红色
- Alerts栏

### Layout Inspector

- AndroidStudio自带工具
- 查看视图层次结构

### Choreographer

- 获取FPS,线上使用，具备实时性
- ApI 16之后
- Choreographer.getInstance().postFrameCallback



