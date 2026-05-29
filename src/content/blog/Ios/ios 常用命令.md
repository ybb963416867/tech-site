---
title: "ios 常用命令"
description: "进入目录"
pubDate: 2026-05-29
category: "Ios"
tags: [iOS, Shell, Swift]
draft: false
---
*   进入目录

```shell
    cd ~/Library/Developer/Xcode/DerivedData/wscanner-*/Build/Products/Release-iphoneos/
    cd ~/Library/Developer/Xcode/DerivedData/wscanner-*/Build/Products/Release-iphonesimulator
```

*   查看架构

```shell

# Type a script or drag a script file from your workspace to insert its path.
#!/bin/bash
# Bash 脚本声明,指定使用 bash 解释器执行

# 遇到任何错误立即退出脚本,防止错误继续执行
set -e

# 定义 DCMTK 库的根目录路径,${SRCROOT} 是 Xcode 提供的项目根目录变量
DCMTK_ROOT="${SRCROOT}/dcmtk"

# 检查 DCMTK 目录是否存在
if [ ! -d "$DCMTK_ROOT" ]; then
    # 如果目录不存在,输出错误信息并退出
    echo "错误: DCMTK_ROOT 不存在: $DCMTK_ROOT"
    exit 1
fi

# 已注释掉的旧配置:原本输出到 framework 内部的 Frameworks 目录(Apple 不允许)
# OUTPUT_ROOT="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.framework/Frameworks"

# 定义输出目录:将 dylib 复制到 app 的 Frameworks 目录
# ${BUILT_PRODUCTS_DIR} 是构建产物目录,${PRODUCT_NAME} 是产品名称(wscanner)
OUTPUT_ROOT="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Frameworks"

# 打印输出目录路径,用于调试
echo "输出目录: $OUTPUT_ROOT"

# 区分真机/模拟器构建,根据不同平台选择对应的 dylib 文件
# ${CONFIGURATION_BUILD_DIR} 包含当前构建配置的路径信息
if [[ "$CONFIGURATION_BUILD_DIR" == *"iphoneos"* ]]; then
    # 如果路径包含 "iphoneos",说明是真机构建,使用 ios/release 目录
    LIB_DIR="$DCMTK_ROOT/ios/release"
    echo "=== 真机模式: $LIB_DIR ==="
elif [[ "$CONFIGURATION_BUILD_DIR" == *"iphonesimulator"* ]]; then
    # 如果路径包含 "iphonesimulator",说明是模拟器构建,使用 sim/release 目录
    LIB_DIR="$DCMTK_ROOT/sim/release"
    echo "=== 模拟器模式: $LIB_DIR ==="
else
    # 其他情况默认使用真机版本
    LIB_DIR="$DCMTK_ROOT/ios/release"
fi

# 检查库文件目录是否存在
if [ ! -d "$LIB_DIR" ]; then
    # 如果目录不存在,输出错误信息并退出
    echo "错误: LIB_DIR 不存在: $LIB_DIR"
    exit 1
fi

# 创建输出目录(如果不存在),使用 -p 参数会自动创建父目录
mkdir -p "$OUTPUT_ROOT"

# 切换工作目录到输出目录
cd "$OUTPUT_ROOT"

# 删除输出目录中已存在的所有 dylib 文件,确保是干净的环境
rm -f *.dylib

# DCMTK 库的版本号定义
VERSION_MAJOR=19           # 主版本号,用于创建符号链接式的短文件名
VERSION_FULL="19.3.6.9"    # 完整版本号,用于匹配源文件

# 计数器,记录处理了多少个 dylib 文件
count=0

# 复制文件阶段
# 遍历源目录中所有匹配 lib*.19.3.6.9.dylib 格式的文件
for full_lib in "$LIB_DIR"/lib*.${VERSION_FULL}.dylib; do
    # 检查文件是否真实存在(排除通配符无匹配的情况)
    if [[ -f "$full_lib" ]]; then
        # 获取文件名(不含路径):例如 libdcmdata.19.3.6.9.dylib
        lib_name=$(basename "$full_lib")
        
        # 移除完整版本号后缀,得到基础名称:例如 libdcmdata
        # sed 命令:s/pattern/replacement/ 表示替换,$ 表示字符串结尾
        base_name=$(echo "$lib_name" | sed "s/\.${VERSION_FULL}\.dylib$//")
        
        # 构造短版本文件名:例如 libdcmdata.19.dylib
        short_name="${base_name}.${VERSION_MAJOR}.dylib"
        
        # 复制完整版本名文件:libdcmdata.19.3.6.9.dylib
        cp "$full_lib" "$lib_name"
        
        # 复制短版本名文件:libdcmdata.19.dylib(方便链接器查找)
        cp "$full_lib" "$short_name"
        
        # 打印当前处理的文件名
        echo "复制: $short_name"
        
        # 计数器加 1,((count++)) 是 bash 的算术运算语法
        ((count++))
    fi
done

# 输出总共处理的 dylib 文件数量
echo "总共处理 $count 个 dylib"

# 修改 install_name 阶段
# install_name 是动态库的标识路径,决定了运行时如何找到这个库
for dylib in *.dylib; do
    # 检查文件是否存在
    if [[ -f "$dylib" ]]; then
        # 使用 install_name_tool 修改 dylib 的 install_name 为 @rpath/xxx.dylib
        # @rpath 是动态库的相对路径占位符,运行时会替换为实际的搜索路径
        # -id 参数用于修改库自身的标识
        # 2>/dev/null 将错误输出重定向到空设备(忽略错误)
        # || true 确保即使命令失败也不会导致脚本退出(因为设置了 set -e)
        install_name_tool -id "@rpath/$dylib" "$dylib" 2>/dev/null || true
    fi
done

# 关键步骤:重新签名所有 dylib
echo "=== 开始重新签名 dylib ==="

# 获取代码签名身份
# EXPANDED_CODE_SIGN_IDENTITY 是 Xcode 提供的展开后的签名身份
if [[ -n "$EXPANDED_CODE_SIGN_IDENTITY" ]]; then
    # 如果 EXPANDED_CODE_SIGN_IDENTITY 非空,优先使用它
    SIGN_IDENTITY="$EXPANDED_CODE_SIGN_IDENTITY"
else
    # 否则使用 CODE_SIGN_IDENTITY
    SIGN_IDENTITY="$CODE_SIGN_IDENTITY"
fi

# 打印使用的签名身份,用于调试
echo "使用签名身份: $SIGN_IDENTITY"

# 遍历所有 dylib 文件进行签名
for dylib in *.dylib; do
    # 检查文件是否存在
    if [[ -f "$dylib" ]]; then
        # 打印当前正在签名的文件
        echo "签名: $dylib"
        
        # 使用 codesign 工具对 dylib 进行代码签名
        # --force: 强制重新签名,覆盖已有签名
        # --sign "$SIGN_IDENTITY": 使用指定的签名身份
        # --preserve-metadata: 保留原有的元数据(标识符、权限、标志)
        # --generate-entitlement-der: 生成 DER 格式的权限文件(iOS 需要)
        codesign --force --sign "$SIGN_IDENTITY" \
                 --preserve-metadata=identifier,entitlements,flags \
                 --generate-entitlement-der \
                 "$dylib"
    fi
done

# 脚本成功完成的提示信息
echo "=== 脚本成功结束 ==="

```

*   查看配置

<!---->

    cd ~/ios_work/ios_ui/ios_ui/trunk

    # 读取项目中的 Team ID
    grep -A 5 "DEVELOPMENT_TEAM" wscanner.xcodeproj/project.pbxproj | head -10

> 打印
> DEVELOPMENT\_TEAM = XF237RQZL6;
> DYLIB\_COMPATIBILITY\_VERSION = 1;
> DYLIB\_CURRENT\_VERSION = 1;
> DYLIB\_INSTALL\_NAME\_BASE = "@rpath";
> ENABLE\_MODULE\_VERIFIER = YES;
> GENERATE\_INFOPLIST\_FILE = YES;
> \--
> DEVELOPMENT\_TEAM = XF237RQZL6;
> DYLIB\_COMPATIBILITY\_VERSION = 1;
> DYLIB\_CURRENT\_VERSION = 1;

*   手动打包

<!---->

    xcodebuild archive \
        -project wscanner.xcodeproj \
        -scheme wscanner \
        -configuration Release \
        -archivePath ~/Desktop/wscanner.xcarchive  \
        ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES=YES \
        STRIP_SWIFT_SYMBOLS=NO \
        CODE_SIGN_STYLE=Automatic \
        DEVELOPMENT_TEAM="XF237RQZL6" \
        CODE_SIGN_IDENTITY="Apple Distribution: Beijing Yunshen Technology Co., Ltd"

*   查询包里面使用了swift有关的什么库

```

 cd "wscanner 2025-11-19, 14.11.xcarchive"
 otool -L Products/Applications/wscanner.app/wscanner | grep swift

```

```

#!/bin/bash

set -e

# 定义 DCMTK 库的根目录路径
DCMTK_ROOT="${SRCROOT}/dcmtk"
if [ ! -d "$DCMTK_ROOT" ]; then
    echo "错误: DCMTK_ROOT 不存在: $DCMTK_ROOT"
    exit 1
fi

# dylib 输出目录
OUTPUT_ROOT="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Frameworks"
echo "输出目录: $OUTPUT_ROOT"

# dSYM 输出目录
DSYM_OUTPUT_DIR="${BUILT_PRODUCTS_DIR}"
echo "dSYM 目录: $DSYM_OUTPUT_DIR"

# 区分真机/模拟器
if [[ "$CONFIGURATION_BUILD_DIR" == *"iphoneos"* ]]; then
    LIB_DIR="$DCMTK_ROOT/ios/release"
    echo "=== 真机模式: $LIB_DIR ==="
elif [[ "$CONFIGURATION_BUILD_DIR" == *"iphonesimulator"* ]]; then
    LIB_DIR="$DCMTK_ROOT/sim/release"
    echo "=== 模拟器模式: $LIB_DIR ==="
else
    LIB_DIR="$DCMTK_ROOT/ios/release"
fi

if [ ! -d "$LIB_DIR" ]; then
    echo "错误: LIB_DIR 不存在: $LIB_DIR"
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_ROOT"
cd "$OUTPUT_ROOT"

# 清理旧的 dylib 文件
rm -f *.dylib

dylib_count=0
dsym_count=0

# ========================================
# 1. 复制所有 .dylib 文件
# ========================================
echo "=== 复制 dylib 文件 ==="

for lib in "$LIB_DIR"/*.dylib; do
    if [[ -f "$lib" ]]; then
        lib_name=$(basename "$lib")
        
        # 直接复制 dylib
        cp "$lib" "$lib_name"
        echo "  复制: $lib_name"
        ((dylib_count++))
    fi
done

echo "总共复制 $dylib_count 个 dylib"

# ========================================
# 2. 修改 install_name
# ========================================
echo "=== 修改 install_name ==="

for dylib in *.dylib; do
    if [[ -f "$dylib" ]]; then
        install_name_tool -id "@rpath/$dylib" "$dylib" 2>/dev/null || true
    fi
done

# ========================================
# 3. 重新签名所有 dylib
# ========================================
echo "=== 开始重新签名 dylib ==="

if [[ -n "$EXPANDED_CODE_SIGN_IDENTITY" ]]; then
    SIGN_IDENTITY="$EXPANDED_CODE_SIGN_IDENTITY"
else
    SIGN_IDENTITY="$CODE_SIGN_IDENTITY"
fi

echo "使用签名身份: $SIGN_IDENTITY"

for dylib in *.dylib; do
    if [[ -f "$dylib" ]]; then
        echo "  签名: $dylib"
        codesign --force --sign "$SIGN_IDENTITY" \
                 --preserve-metadata=identifier,entitlements,flags \
                 --generate-entitlement-der \
                 "$dylib"
    fi
done

# ========================================
# 4. 复制 dSYM 文件
# ========================================
echo "=== 复制 dSYM 文件 ==="

for dylib in "$OUTPUT_ROOT"/*.dylib; do
    if [[ -f "$dylib" ]]; then
        dylib_name=$(basename "$dylib")
        source_dsym="$LIB_DIR/${dylib_name}.dSYM"
        
        # 检查源 dSYM 是否存在
        if [[ -d "$source_dsym" ]]; then
            # 直接复制 dSYM
            cp -R "$source_dsym" "$DSYM_OUTPUT_DIR/"
            echo "  ✅ 复制 dSYM: ${dylib_name}.dSYM"
            ((dsym_count++))
        fi
    fi
done

echo ""
echo "=== 复制总结 ==="
echo "  dylib: $dylib_count 个"
echo "  dSYM:  $dsym_count 个"

if [[ $dsym_count -lt $dylib_count ]]; then
    echo ""
    echo "⚠️  提示: 有 $((dylib_count - dsym_count)) 个 dylib 没有对应的 dSYM"
fi

echo ""
echo "=== 脚本成功结束 ==="

```

```

# Type a script or drag a script file from your workspace to insert its path.
# 强制嵌入 Swift 标准库
if [[ "$CONFIGURATION" == "Release" ]]; then
    SWIFT_SRC="/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift-5.0/iphoneos"
    SWIFT_DST="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
    
    echo "强制嵌入 Swift 库到: $SWIFT_DST"
    mkdir -p "$SWIFT_DST"
    
    for lib in "$SWIFT_SRC"/libswift*.dylib; do
        if [[ -f "$lib" ]]; then
            cp -f "$lib" "$SWIFT_DST/"
            install_name_tool -id "@rpath/$(basename "$lib")" "$SWIFT_DST/$(basename "$lib")" 2>/dev/null || true
        fi
    done
    rm -f "$SWIFT_DST/libswiftXCTest.dylib"
    echo "Swift 库嵌入完成"
fi

```

