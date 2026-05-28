---
title: "Mac iOS 环境配置"
description: "整理 Mac 终端代理、zsh 配置、Homebrew、iOS 开发环境和常见工具链配置。"
pubDate: 2026-05-28
category: "iOS"
tags: [Mac, iOS, Shell]
draft: false
---
*   Mac 终端设置代理

```shell
export http\_proxy=<http://localhost:7890>
export https\_proxy=<http://localhost:7890>
export https\_proxy=<http://127.0.0.1:7890>
export http\_proxy=<http://127.0.0.1:7890>
curl google.com
```

*   解除

```shell
unset http\_proxy
unset https\_proxy
```

*   在\~/.zshrc 文件中添加

```shell
source ~/.bash_profile

# 清除可能存在的冲突 alias
unalias proxy_on 2>/dev/null
unalias proxy_off 2>/dev/null
unalias proxy_status 2>/dev/null

# 定义开启代理的函数
proxy_on() {
    export http_proxy=http://127.0.0.1:7890
    export https_proxy=http://127.0.0.1:7890
    export all_proxy=http://127.0.0.1:7890
    echo "Proxy is ON"
}

# 定义关闭代理的函数
proxy_off() {
    unset http_proxy
    unset https_proxy
    unset all_proxy
    echo "Proxy is OFF"
}

# 定义查看代理状态的函数
proxy_status() {
    echo "http_proxy: ${http_proxy:-NOT SET}"
    echo "https_proxy: ${https_proxy:-NOT SET}"
    echo "all_proxy: ${all_proxy:-NOT SET}"
}

# 定义快捷 alias
alias on='proxy_on'
alias off='proxy_off'
alias status='proxy_status'
```

*   包括git的

```

source ~/.bash_profile

# 定义代理端口变量
PROXY_PORT=12334

# 清除可能存在的冲突 alias
unalias proxy_on 2>/dev/null
unalias proxy_off 2>/dev/null
unalias proxy_status 2>/dev/null

# 定义开启代理的函数
proxy_on() {
    export http_proxy=http://127.0.0.1:${PROXY_PORT}
    export https_proxy=http://127.0.0.1:${PROXY_PORT}
    export all_proxy=http://127.0.0.1:${PROXY_PORT}
    git config --global http.proxy http://127.0.0.1:${PROXY_PORT}
    echo "Proxy is ON (Port: ${PROXY_PORT})"
    echo "Testing proxy connection..."
    curl -s -m 5 google.com > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Proxy test successful: Connected to google.com"
    else
        echo "Proxy test failed: Could not connect to google.com"
    fi
}

# 定义关闭代理的函数
proxy_off() {
    unset http_proxy
    unset https_proxy
    unset all_proxy
    git config --global --unset http.proxy
    git config --global --unset https.proxy
    echo "Proxy is OFF"
}

# 定义查看代理状态的函数
proxy_status() {
    echo "http_proxy: ${http_proxy:-NOT SET}"
    echo "https_proxy: ${https_proxy:-NOT SET}"
    echo "all_proxy: ${all_proxy:-NOT SET}"
}

# 定义快捷 alias
alias on='proxy_on'
alias off='proxy_off'
alias status='proxy_status'

```

> 运行 source \~/.zshrc 完成
> 终端输入  on 代理开\
> 终端输入 off 代理关
> 终端输入 status 查看代理状态

\-pod 增加源

> pod repo add cocoapods <https://github.com/CocoaPods/Specs.git> --progress

## 配置Android adb,zipalign等的环境变量
```
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/build-tools/33.0.1
```
