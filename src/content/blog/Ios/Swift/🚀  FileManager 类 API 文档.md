---
title: "FileManager 类 API 文档"
description: "FileManager 是 Foundation 框架中的一个类，用于管理文件系统中的文件、目录和 URL。它常用于创建目录、移动文件、检查文件是否存在以及访问标准目录（如文档目录或缓存目录）。通常使用其默认实例 FileManage..."
pubDate: 2026-05-29
category: "Swift"
tags: [iOS, Swift, API]
draft: false
---
# 🚀 FileManager 类 API 文档

## 概述

`FileManager` 是 `Foundation` 框架中的一个类，用于管理文件系统中的文件、目录和 URL。它常用于创建目录、移动文件、检查文件是否存在以及访问标准目录（如文档目录或缓存目录）。通常使用其默认实例 `FileManager.default` 进行操作。

**主要功能**：

*   创建、删除、复制和移动文件及目录。
*   访问标准目录的 URL 或路径。
*   读写文件属性。
*   枚举目录内容。
*   管理文件权限和所有权。

**类签名**：

```swift
class FileManager : NSObject
```

## API 及参数

以下是 `FileManager` 类的所有 API 及其参数的详细列表，每个 API 附带使用示例和预期输出。由于 `FileManager` API 数量较多，以下按功能分类，涵盖主要方法，并为每个方法提供参数说明和示例。

### 1. 获取默认 FileManager

*   **API**: `static let default: FileManager`

    *   **描述**: 返回进程的共享 `FileManager` 实例。

    *   **参数**: 无。

    *   **返回值**: 单例 `FileManager` 实例。

    *   **示例**:

        ```swift
        import Foundation

        let fileManager = FileManager.default
        print("默认 FileManager: \(fileManager)")
        ```

    *   **预期输出**:

            默认 FileManager: <NSFileManager: 0x600000123456>

### 2. 获取标准目录 URL

*   **API**: `url(for:in:appropriateFor:create:)`

    *   **描述**: 返回指定域中特定目录的 URL。

    *   **参数**:

        *   `directory: FileManager.SearchPathDirectory`: 要查找的目录类型（如 `.documentDirectory`、`.cachesDirectory`）。
        *   `domain: FileManager.SearchPathDomainMask`: 搜索域（如 `.userDomainMask`）。
        *   `appropriateFor: URL?`: 可选的 URL，用于指定目标目录所在卷（常用于 `.itemReplacementDirectory`）。
        *   `create: Bool`: 是否在目录不存在时创建。

    *   **抛出**: 可能抛出文件系统错误（如目录不存在或无权限）。

    *   **返回值**: `URL`（目标目录的 URL）。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            print("文档目录: \(documentURL.path)")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            文档目录: /Users/Username/Documents

### 3. 获取标准目录路径

*   **API**: `urls(for:in:)`

    *   **描述**: 返回指定域中特定目录的 URL 数组（某些目录可能有多个路径）。

    *   **参数**:

        *   `directory: FileManager.SearchPathDirectory`: 目录类型。
        *   `domain: FileManager.SearchPathDomainMask`: 搜索域。

    *   **返回值**: `[URL]`（目录 URL 数组）。

    *   **示例**:

        ```swift
        let cacheURLs = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)
        print("缓存目录: \(cacheURLs.map { $0.path })")
        ```

    *   **预期输出**:

            缓存目录: ["/Users/Username/Library/Caches"]

### 4. 创建目录

*   **API**: `createDirectory(at:withIntermediateDirectories:attributes:)`

    *   **描述**: 在指定 URL 创建目录。

    *   **参数**:

        *   `at: URL`: 目标目录的 URL。
        *   `withIntermediateDirectories: Bool`: 是否创建中间目录。
        *   `attributes: [FileAttributeKey: Any]?`: 文件属性（如权限）。

    *   **抛出**: 可能抛出创建失败的错误。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let newFolder = documentURL.appendingPathComponent("TestFolder")
            try FileManager.default.createDirectory(
                at: newFolder,
                withIntermediateDirectories: true,
                attributes: nil
            )
            print("目录创建成功: \(newFolder.path)")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            目录创建成功: /Users/Username/Documents/TestFolder

### 5. 创建文件

*   **API**: `createFile(atPath:contents:attributes:)`

    *   **描述**: 在指定路径创建文件。

    *   **参数**:

        *   `atPath: String`: 文件路径。
        *   `contents: Data?`: 文件内容（可选）。
        *   `attributes: [FileAttributeKey: Any]?`: 文件属性。

    *   **返回值**: `Bool`（创建是否成功）。

    *   **示例**:

        ```swift
        let documentURL = try! FileManager.default.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: false
        )
        let filePath = documentURL.appendingPathComponent("test.txt").path
        let content = "Hello, FileManager!".data(using: .utf8)
        let success = FileManager.default.createFile(
            atPath: filePath,
            contents: content,
            attributes: nil
        )
        print("文件创建成功: \(success)")
        ```

    *   **预期输出**:

            文件创建成功: true

### 6. 检查文件或目录是否存在

*   **API**: `fileExists(atPath:)`

    *   **描述**: 检查指定路径的文件或目录是否存在。

    *   **参数**:

        *   `atPath: String`: 文件或目录路径。

    *   **返回值**: `Bool`（是否存在）。

    *   **示例**:

        ```swift
        let documentURL = try! FileManager.default.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: false
        )
        let filePath = documentURL.appendingPathComponent("test.txt").path
        let exists = FileManager.default.fileExists(atPath: filePath)
        print("文件存在: \(exists)")
        ```

    *   **预期输出**:

            文件存在: true

### 7. 复制文件或目录

*   **API**: `copyItem(at:to:)`

    *   **描述**: 将文件或目录复制到目标位置。

    *   **参数**:

        *   `at: URL`: 源文件或目录的 URL。
        *   `to: URL`: 目标位置的 URL。

    *   **抛出**: 可能抛出复制失败的错误。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let src = documentURL.appendingPathComponent("test.txt")
            let dst = documentURL.appendingPathComponent("test_copy.txt")
            try FileManager.default.copyItem(at: src, to: dst)
            print("文件复制成功: \(dst.path)")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            文件复制成功: /Users/Username/Documents/test_copy.txt

### 8. 移动文件或目录

*   **API**: `moveItem(at:to:)`

    *   **描述**: 将文件或目录移动到目标位置。

    *   **参数**:

        *   `at: URL`: 源文件或目录的 URL。
        *   `to: URL`: 目标位置的 URL。

    *   **抛出**: 可能抛出移动失败的错误。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let src = documentURL.appendingPathComponent("test_copy.txt")
            let dst = documentURL.appendingPathComponent("test_moved.txt")
            try FileManager.default.moveItem(at: src, to: dst)
            print("文件移动成功: \(dst.path)")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            文件移动成功: /Users/Username/Documents/test_moved.txt

### 9. 删除文件或目录

*   **API**: `removeItem(at:)`

    *   **描述**: 删除指定 URL 的文件或目录。

    *   **参数**:

        *   `at: URL`: 要删除的文件或目录的 URL。

    *   **抛出**: 可能抛出删除失败的错误。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let fileURL = documentURL.appendingPathComponent("test_moved.txt")
            try FileManager.default.removeItem(at: fileURL)
            print("文件删除成功: \(fileURL.path)")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            文件删除成功: /Users/Username/Documents/test_moved.txt

### 10. 读取文件属性

*   **API**: `attributesOfItem(atPath:)`

    *   **描述**: 返回指定路径的文件或目录的属性。

    *   **参数**:

        *   `atPath: String`: 文件或目录路径。

    *   **抛出**: 可能抛出文件不存在或无权限的错误。

    *   **返回值**: `[FileAttributeKey: Any]`（文件属性字典）。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let filePath = documentURL.appendingPathComponent("test.txt").path
            let attributes = try FileManager.default.attributesOfItem(atPath: filePath)
            if let size = attributes[.size] as? Int {
                print("文件大小: \(size) 字节")
            }
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            文件大小: 19 字节

### 11. 枚举目录内容

*   **API**: `contentsOfDirectory(at:includingPropertiesForKeys:options:)`

    *   **描述**: 返回指定目录的内容列表。

    *   **参数**:

        *   `at: URL`: 目录的 URL。
        *   `includingPropertiesForKeys: [URLResourceKey]?`: 要获取的资源属性（可选）。
        *   `options: FileManager.DirectoryEnumerationOptions`: 枚举选项（如 `.skipsHiddenFiles`）。

    *   **抛出**: 可能抛出目录不存在或无权限的错误。

    *   **返回值**: `[URL]`（目录内容的 URL 数组）。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let contents = try FileManager.default.contentsOfDirectory(
                at: documentURL,
                includingPropertiesForKeys: nil,
                options: [.skipsHiddenFiles]
            )
            print("目录内容: \(contents.map { $0.lastPathComponent })")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            目录内容: ["test.txt", "TestFolder"]

### 12. 获取当前工作目录

*   **API**: `currentDirectoryPath`

    *   **描述**: 返回当前工作目录的路径。

    *   **参数**: 无。

    *   **返回值**: `String`（当前工作目录路径）。

    *   **示例**:

        ```swift
        let cwd = FileManager.default.currentDirectoryPath
        print("当前工作目录: \(cwd)")
        ```

    *   **预期输出**:

            当前工作目录: /Users/Username

### 13. 更改当前工作目录

*   **API**: `changeCurrentDirectoryPath(_:)`

    *   **描述**: 将当前工作目录更改为指定路径。

    *   **参数**:

        *   `path: String`: 目标目录路径。

    *   **返回值**: `Bool`（更改是否成功）。

    *   **示例**:

        ```swift
        let documentURL = try! FileManager.default.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: false
        )
        let success = FileManager.default.changeCurrentDirectoryPath(documentURL.path)
        print("更改工作目录: \(success), 新目录: \(FileManager.default.currentDirectoryPath)")
        ```

    *   **预期输出**:

            更改工作目录: true, 新目录: /Users/Username/Documents

### 14. 获取文件系统可用空间

*   **API**: `fileSystemAttributes(atPath:)`

    *   **描述**: 返回指定路径所在文件系统的属性（如可用空间）。

    *   **参数**:

        *   `atPath: String`: 文件系统路径。

    *   **抛出**: 可能抛出路径无效的错误。

    *   **返回值**: `[FileSystemAttributeKey: Any]`（文件系统属性字典）。

    *   **示例**:

        ```swift
        do {
            let attributes = try FileManager.default.fileSystemAttributes(atPath: NSHomeDirectory())
            if let freeSpace = attributes[.systemFreeSize] as? Int64 {
                print("可用空间: \(freeSpace / (1024 * 1024)) MB")
            }
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            可用空间: 123456 MB

### 15. 设置文件属性

*   **API**: `setAttributes(_:ofItemAtPath:)`

    *   **描述**: 设置指定路径的文件或目录的属性。

    *   **参数**:

        *   `attributes: [FileAttributeKey: Any]`: 要设置的属性。
        *   `ofItemAtPath: String`: 文件或目录路径。

    *   **抛出**: 可能抛出无权限或路径无效的错误。

    *   **示例**:

        ```swift
        do {
            let documentURL = try FileManager.default.url(
                for: .documentDirectory,
                in: .userDomainMask,
                appropriateFor: nil,
                create: false
            )
            let filePath = documentURL.appendingPathComponent("test.txt").path
            let attributes: [FileAttributeKey: Any] = [.posixPermissions: 0o644]
            try FileManager.default.setAttributes(attributes, ofItemAtPath: filePath)
            print("属性设置成功")
        } catch {
            print("错误: \(error.localizedDescription)")
        }
        ```

    *   **预期输出**:

            属性设置成功

## 注意事项

1.  **URL vs 路径**:
    *   优先使用基于 URL 的 API（如 `copyItem(at:to:)`），因为它们提供更好的错误处理和跨平台兼容性。
    *   避免直接操作 `absoluteString`，使用 `path` 属性获取文件路径。

2.  **沙盒环境**:
    *   在 iOS 应用中，`FileManager` 操作受限于沙盒环境，`.userDomainMask` 是最常用的域。

3.  **错误处理**:
    *   大多数 `FileManager` 方法会抛出错误，建议使用 `do-catch` 块进行处理。

4.  **线程安全**:
    *   `FileManager.default` 是线程安全的，但某些操作（如枚举目录）可能需要额外的同步机制。

5.  **性能优化**:
    *   使用 `appropriateFor` 参数优化跨卷操作（如 `.itemReplacementDirectory`）。
    *   枚举目录时，使用 `includingPropertiesForKeys` 指定需要的属性以提高性能。

## 参考资料

*   Apple 开发者文档: [FileManager](https://developer.apple.com/documentation/foundation/filemanager)
*   Stack Overflow: [FileManager 相关问题](https://stackoverflow.com/questions/tagged/nsfilemanager)
*   Swift by Sundell: [Working with files and folders in Swift](https://www.swiftbysundell.com/articles/working-with-files-and-folders-in-swift/)

