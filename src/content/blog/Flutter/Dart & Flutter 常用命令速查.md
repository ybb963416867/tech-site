---
title: "Dart & Flutter 常用命令速查"
description: ""
pubDate: 2026-06-22
category: "Flutter"
tags: [Mac, iOS, API, JavaScript]
draft: false
---
# Dart & Flutter 常用命令速查

---

## 一、Flutter 常用命令

### 1. 项目管理

| 命令 | 说明 |
|------|------|
| `flutter create <project_name>` | 创建新项目 |
| `flutter create --org com.example <project_name>` | 创建项目并指定包名 |
| `flutter create --template=package <name>` | 创建 package |
| `flutter create --template=plugin <name>` | 创建插件 |
| `flutter create --platforms=android,ios <name>` | 创建时指定平台 |

### 2. 运行与调试

| 命令 | 说明 |
|------|------|
| `flutter run` | 运行应用（debug 模式） |
| `flutter run -d <device_id>` | 在指定设备运行 |
| `flutter run --release` | 以 release 模式运行 |
| `flutter run --profile` | 以 profile 模式运行 |
| `flutter run --flavor <flavor>` | 指定 flavor 运行 |
| `flutter run --dart-define=KEY=VALUE` | 传入编译时环境变量 |
| `flutter attach` | 附加到已运行的应用 |

> **运行时快捷键（终端中）：**
> - `r` — 热重载（Hot Reload）
> - `R` — 热重启（Hot Restart）
> - `q` — 退出
> - `p` — 显示 Widget 边界
> - `v` — 打开 DevTools
> - `h` — 查看所有快捷键

### 3. 构建

| 命令 | 说明 |
|------|------|
| `flutter build apk` | 构建 Android APK |
| `flutter build apk --release` | 构建 release APK |
| `flutter build apk --split-per-abi` | 按 ABI 分包构建 |
| `flutter build appbundle` | 构建 Android AAB |
| `flutter build ios` | 构建 iOS（需要 macOS） |
| `flutter build ios --release` | 构建 iOS release |
| `flutter build ipa` | 构建 iOS IPA |
| `flutter build macos` | 构建 macOS 应用 |
| `flutter build web` | 构建 Web 应用 |
| `flutter build windows` | 构建 Windows 应用 |
| `flutter build linux` | 构建 Linux 应用 |

### 4. 依赖管理

| 命令 | 说明 |
|------|------|
| `flutter pub get` | 获取依赖 |
| `flutter pub upgrade` | 升级所有依赖到最新版本 |
| `flutter pub upgrade <package>` | 升级指定依赖 |
| `flutter pub outdated` | 查看过时的依赖 |
| `flutter pub add <package>` | 添加依赖 |
| `flutter pub remove <package>` | 移除依赖 |
| `flutter pub deps` | 查看依赖关系树 |
| `flutter pub cache clean` | 清除 pub 缓存 |
| `flutter pub publish` | 发布 package 到 pub.dev |

### 5. 设备与模拟器

| 命令 | 说明 |
|------|------|
| `flutter devices` | 列出所有已连接设备 |
| `flutter emulators` | 列出所有可用模拟器 |
| `flutter emulators --launch <emulator_id>` | 启动指定模拟器 |
| `flutter emulators --create` | 创建新模拟器 |

### 6. 代码质量与测试

| 命令 | 说明 |
|------|------|
| `flutter test` | 运行所有单元测试 |
| `flutter test test/foo_test.dart` | 运行指定测试文件 |
| `flutter test --coverage` | 运行测试并生成覆盖率报告 |
| `flutter analyze` | 静态代码分析 |
| `flutter format .` | 格式化当前目录所有代码 |

### 7. 清理与工具

| 命令 | 说明 |
|------|------|
| `flutter clean` | 清除构建缓存 |
| `flutter doctor` | 检查开发环境状态 |
| `flutter doctor -v` | 详细输出环境状态 |
| `flutter upgrade` | 升级 Flutter SDK |
| `flutter channel` | 查看当前 channel |
| `flutter channel stable` | 切换到 stable channel |
| `flutter channel beta` | 切换到 beta channel |
| `flutter --version` | 查看 Flutter 版本 |
| `flutter config --enable-web` | 启用 Web 支持 |
| `flutter config --enable-macos-desktop` | 启用 macOS 支持 |
| `flutter gen-l10n` | 生成本地化文件 |
| `flutter pub run build_runner build` | 运行代码生成 |
| `flutter pub run build_runner watch` | 监听文件变化并持续生成 |
| `flutter pub run build_runner build --delete-conflicting-outputs` | 生成代码并删除冲突文件 |

---

## 二、Dart 常用命令

### 1. 运行与编译

| 命令 | 说明 |
|------|------|
| `dart run` | 运行当前项目 |
| `dart run <file.dart>` | 运行指定 Dart 文件 |
| `dart compile exe <file.dart>` | 编译为独立可执行文件 |
| `dart compile js <file.dart>` | 编译为 JavaScript |
| `dart compile aot-snapshot <file.dart>` | 编译为 AOT 快照 |
| `dart compile jit-snapshot <file.dart>` | 编译为 JIT 快照 |
| `dart compile kernel <file.dart>` | 编译为内核快照 |

### 2. 项目与包管理

| 命令 | 说明 |
|------|------|
| `dart create <project_name>` | 创建新 Dart 项目 |
| `dart create -t console <name>` | 创建控制台项目 |
| `dart create -t package <name>` | 创建 package |
| `dart create -t server-shelf <name>` | 创建 Shelf 服务端项目 |
| `dart pub get` | 获取依赖 |
| `dart pub upgrade` | 升级依赖 |
| `dart pub add <package>` | 添加依赖 |
| `dart pub remove <package>` | 移除依赖 |
| `dart pub publish` | 发布 package 到 pub.dev |
| `dart pub publish --dry-run` | 模拟发布（校验不实际上传） |
| `dart pub outdated` | 查看过时的依赖 |
| `dart pub cache clean` | 清理本地缓存 |

### 3. 代码质量

| 命令 | 说明 |
|------|------|
| `dart analyze` | 静态代码分析 |
| `dart analyze <file.dart>` | 分析指定文件 |
| `dart format .` | 格式化当前目录所有文件 |
| `dart format <file.dart>` | 格式化指定文件 |
| `dart format --output=none --set-exit-if-changed .` | 检查格式（不修改，CI 用） |
| `dart fix --apply` | 自动修复可修复的代码问题 |
| `dart fix --dry-run` | 预览将要修复的内容 |

### 4. 测试

| 命令 | 说明 |
|------|------|
| `dart test` | 运行所有测试 |
| `dart test test/foo_test.dart` | 运行指定测试文件 |
| `dart test --reporter expanded` | 详细输出测试结果 |
| `dart test --coverage=coverage/` | 生成测试覆盖率 |

### 5. 开发工具

| 命令 | 说明 |
|------|------|
| `dart --version` | 查看 Dart 版本 |
| `dart devtools` | 启动 DevTools |
| `dart doc` | 生成 API 文档 |
| `dart info` | 查看 Dart 工具链信息 |

---

## 三、常用组合场景

### 新项目初始化流程

```bash
flutter create my_app --org com.example
cd my_app
flutter pub get
flutter run
```

### 代码生成（freezed / json_serializable 等）

```bash
flutter pub add build_runner freezed json_serializable
flutter pub run build_runner build --delete-conflicting-outputs
# 或监听模式
flutter pub run build_runner watch --delete-conflicting-outputs
```

### 发布前检查

```bash
flutter clean
flutter pub get
flutter analyze
flutter test
flutter build apk --release
flutter build ios --release
```

### 发布 Dart package

```bash
dart pub publish --dry-run   # 先预演
dart pub publish             # 正式发布
```

---

## 四、常用环境变量与路径

| 变量/路径 | 说明 |
|-----------|------|
| `FLUTTER_ROOT` | Flutter SDK 根目录 |
| `~/.pub-cache` | pub 全局缓存目录 |
| `flutter/bin` | Flutter 命令目录，需加入 PATH |
| `flutter doctor --android-licenses` | 接受 Android SDK 许可证 |

---

> 更多内容参考官方文档：
> - Flutter: https://docs.flutter.dev
> - Dart: https://dart.dev/tools
> - pub.dev: https://pub.dev
