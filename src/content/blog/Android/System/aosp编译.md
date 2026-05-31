---
title: "aosp编译"
description: "<https://www.jianshu.com/p/53941de91c77"
pubDate: 2026-05-29
category: "System"
tags: [Git]
draft: false
---
<https://www.jianshu.com/p/53941de91c77>

```
mkdir aosp_12
cd aosp_12

repo init -u <https://mirrors.tuna.tsinghua.edu.cn/git/AOSP/platform/manifest> -b android-12.0.0\_r32

python3 ~/bin/repo init -u https://mirrors.tuna.tsinghua.edu.cn/git/AOSP/platform/manifest -b android-12.0.0_r32

python3 ~/bin/repo sync

python3 ~/bin/repo init https://aosp.tuna.tsinghua.edu.cn/platform/manifest -b android-12.0.0_r8

python3 ~/bin/repo init -u https://mirrors.tuna.tsinghua.edu.cn/git/AOSP/platform/manifest -b
source build/envsetup.sh

```

