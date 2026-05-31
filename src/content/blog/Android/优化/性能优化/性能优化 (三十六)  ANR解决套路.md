# ANR解决套路

- adb pull  data/anr/traces.txt储存路径
- 详细分析：CPU、IO、锁

## 线上ANR监控方案

- 通过FileOberver监控文件变化，高版本权限问题

## ANR-WatchDog

- 非侵入式的ANR监控组件
- com.github.anrwatchdog:anrwatchdog:1.3.0
- https://github.com/SalomonBrys/ANR-WatchDog

## ANR-WatchDog原理

- start   post消息改值   sleep  检测是否修改  判断ANR发生