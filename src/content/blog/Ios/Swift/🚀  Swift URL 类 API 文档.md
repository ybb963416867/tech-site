---
title: "Swift URL 类 API 文档"
description: "以下是对 Swift 中 URL 类的所有 API 及其参数的详细介绍，整理为中文 Markdown 文档，包含调用方法示例和输出结果。URL 类是 Foundation 框架中用于表示和操作统一资源定位符（URL）的核心类，广泛用于..."
pubDate: 2026-05-29
category: "Swift"
tags: [Markdown, Swift, API]
draft: false
---
# 🚀 Swift URL 类 API 文档

以下是对 Swift 中 `URL` 类的所有 API 及其参数的详细介绍，整理为中文 Markdown 文档，包含调用方法示例和输出结果。`URL` 类是 Foundation 框架中用于表示和操作统一资源定位符（URL）的核心类，广泛用于处理网络资源、文件路径等。

## 1. 初始化方法

### `init?(string:)`

*   **描述**: 使用字符串创建 URL 实例。

*   **参数**:

    *   `string`: 一个表示 URL 的字符串（例如 `https://example.com`）。

*   **作用**: 将字符串解析为 URL。如果字符串格式无效，返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com")
    print(url) // 输出: Optional(https://example.com)
    let invalidURL = URL(string: "invalid url")
    print(invalidURL) // 输出: nil
    ```

### `init?(string:relativeTo:)`

*   **描述**: 使用相对于某个基础 URL 的字符串创建 URL 实例。

*   **参数**:

    *   `string`: 表示相对路径的字符串。
    *   `relativeTo`: 基础 URL，类型为 `URL?`。

*   **作用**: 基于给定的基础 URL 解析相对路径字符串。如果字符串或基础 URL 无效，返回 `nil`。

*   **示例**:

    ```swift
    let baseURL = URL(string: "https://example.com")!
    let relativeURL = URL(string: "path/to/resource", relativeTo: baseURL)
    print(relativeURL) // 输出: Optional(https://example.com/path/to/resource)
    print(relativeURL?.baseURL) // 输出: Optional(https://example.com)
    ```

### `init(fileURLWithPath:)`

*   **描述**: 使用文件系统路径创建文件 URL。

*   **参数**:

    *   `path`: 文件系统的路径字符串。

*   **作用**: 创建指向本地文件系统的 URL，通常用于访问本地文件。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    print(fileURL) // 输出: file:///Users/example/file.txt
    ```

### `init(fileURLWithPath:isDirectory:)`

*   **描述**: 使用文件系统路径创建文件 URL，并指定是否为目录。

*   **参数**:

    *   `path`: 文件系统的路径字符串。
    *   `isDirectory`: 布尔值，指示路径是否指向目录。

*   **作用**: 明确指定路径是否为目录，避免歧义。

*   **示例**:

    ```swift
    let dirURL = URL(fileURLWithPath: "/Users/example/folder", isDirectory: true)
    print(dirURL) // 输出: file:///Users/example/folder/
    ```

### `init(fileURLWithPath:relativeTo:)`

*   **描述**: 使用相对于某个基础路径的文件路径创建文件 URL。

*   **参数**:

    *   `path`: 文件系统路径字符串。
    *   `relativeTo`: 基础 URL，类型为 `URL?`。

*   **作用**: 基于基础路径创建文件 URL。

*   **示例**:

    ```swift
    let baseURL = URL(fileURLWithPath: "/Users/example")
    let fileURL = URL(fileURLWithPath: "file.txt", relativeTo: baseURL)
    print(fileURL) // 输出: file:///Users/example/file.txt
    ```

### `init(fileURLWithPath:isDirectory:relativeTo:)`

*   **描述**: 使用文件路径、目录标志和基础 URL 创建文件 URL。

*   **参数**:

    *   `path`: 文件系统路径字符串。
    *   `isDirectory`: 布尔值，指示路径是否为目录。
    *   `relativeTo`: 基础 URL，类型为 `URL?`。

*   **作用**: 提供完整的控制来创建文件 URL。

*   **示例**:

    ```swift
    let baseURL = URL(fileURLWithPath: "/Users/example")
    let dirURL = URL(fileURLWithPath: "folder", isDirectory: true, relativeTo: baseURL)
    print(dirURL) // 输出: file:///Users/example/folder/
    ```

### `init(dataRepresentation:relativeTo:isOpaque:)`

*   **描述**: 使用数据表示形式创建 URL。

*   **参数**:

    *   `dataRepresentation`: URL 的数据表示（`Data` 类型）。
    *   `relativeTo`: 基础 URL，类型为 `URL?`。
    *   `isOpaque`: 布尔值，指示 URL 是否为不透明的。

*   **作用**: 从数据对象构造 URL，适用于特殊场景（如书签数据）。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    let bookmarkData = try! fileURL.bookmarkData(options: [.minimalBookmark])
    let restoredURL = URL(dataRepresentation: bookmarkData, relativeTo: nil, isOpaque: false)
    print(restoredURL) // 输出: file:///Users/example/file.txt
    ```

## 2. 属性

### `absoluteString: String`

*   **描述**: URL 的绝对字符串表示。

*   **作用**: 返回完整的 URL 字符串（包括协议、主机、路径等）。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com")!
    print(url.absoluteString) // 输出: https://example.com
    ```

### `absoluteURL: URL`

*   **描述**: URL 的绝对形式。

*   **作用**: 返回解析后的绝对 URL，消除相对路径的影响。

*   **示例**:

    ```swift
    let baseURL = URL(string: "https://example.com")!
    let relativeURL = URL(string: "path", relativeTo: baseURL)!
    print(relativeURL.absoluteURL) // 输出: https://example.com/path
    ```

### `baseURL: URL?`

*   **描述**: URL 的基础 URL。

*   **作用**: 返回创建此 URL 时使用的基础 URL（如果有）。

*   **示例**:

    ```swift
    let baseURL = URL(string: "https://example.com")!
    let relativeURL = URL(string: "path", relativeTo: baseURL)!
    print(relativeURL.baseURL) // 输出: Optional(https://example.com)
    ```

### `scheme: String?`

*   **描述**: URL 的协议部分（如 `http`、`file`）。

*   **作用**: 返回 URL 的协议部分，如果没有则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com")!
    print(url.scheme) // 输出: Optional("https")
    ```

### `host: String?`

*   **描述**: URL 的主机部分。

*   **作用**: 返回 URL 的主机名（例如 `example.com`），如果没有则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com")!
    print(url.host) // 输出: Optional("example.com")
    ```

### `port: Int?`

*   **描述**: URL 的端口号。

*   **作用**: 返回 URL 的端口号，如果没有指定则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com:8080")!
    print(url.port) // 输出: Optional(8080)
    ```

### `user: String?`

*   **描述**: URL 的用户名部分。

*   **作用**: 返回 URL 中的用户名（用于认证），如果没有则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "ftp://user@example.com")!
    print(url.user) // 输出: Optional("user")
    ```

### `password: String?`

*   **描述**: URL 的密码部分。

*   **作用**: 返回 URL 中的密码（用于认证），如果没有则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "ftp://user:pass@example.com")!
    print(url.password) // 输出: Optional("pass")
    ```

### `path: String`

*   **描述**: URL 的路径部分。

*   **作用**: 返回 URL 的路径（例如 `/path/to/resource`）。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com/path/to/resource")!
    print(url.path) // 输出: /path/to/resource
    ```

### `query: String?`

*   **描述**: URL 的查询字符串部分。

*   **作用**: 返回 URL 的查询参数（例如 `key=value`），如果没有则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com?key=value")!
    print(url.query) // 输出: Optional("key=value")
    ```

### `fragment: String?`

*   **描述**: URL 的片段部分。

*   **作用**: 返回 URL 的片段（例如 `#section`），如果没有则返回 `nil`。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com#section")!
    print(url.fragment) // 输出: Optional("section")
    ```

### `pathComponents: [String]`

*   **描述**: URL 路径的分段数组。

*   **作用**: 将路径分解为各个部分（以 `/` 分割）。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com/path/to/resource")!
    print(url.pathComponents) // 输出: ["/", "path", "to", "resource"]
    ```

### `lastPathComponent: String`

*   **描述**: URL 路径的最后一部分。

*   **作用**: 返回路径的最后一个组件。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com/path/to/resource")!
    print(url.lastPathComponent) // 输出: resource
    ```

### `pathExtension: String`

*   **描述**: URL 路径的文件扩展名。

*   **作用**: 返回路径的扩展名（例如 `txt`），如果没有则返回空字符串。

*   **示例**:

    ```swift
    let url = URL(string: "file:///Users/example/file.txt")!
    print(url.pathExtension) // 输出: txt
    ```

### `isFileURL: Bool`

*   **描述**: 指示 URL 是否为文件 URL。

*   **作用**: 检查 URL 是否指向文件系统资源。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    print(fileURL.isFileURL) // 输出: true
    let webURL = URL(string: "https://example.com")!
    print(webURL.isFileURL) // 输出: false
    ```

### `standardized: URL`

*   **描述**: 返回标准化的 URL。

*   **作用**: 规范化 URL，去除多余的 `./` 或 `../` 等。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com/./path")!
    print(url.standardized) // 输出: https://example.com/path
    ```

### `standardizedFileURL: URL`

*   **描述**: 返回标准化的文件 URL。

*   **作用**: 针对文件 URL 进行规范化，处理符号链接等。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/../file.txt")
    print(fileURL.standardizedFileURL) // 输出: file:///Users/file.txt
    ```

## 3. 方法

### `appendingPathComponent(_:)`

*   **描述**: 追加路径组件到 URL。

*   **参数**:

    *   `pathComponent`: 要追加的路径组件字符串。

*   **返回**: 新的 URL 实例。

*   **作用**: 在 URL 路径末尾追加一个路径组件。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com/path")!
    let newURL = url.appendingPathComponent("resource")
    print(newURL) // 输出: https://example.com/path/resource
    ```

### `appendingPathComponent(_:isDirectory:)`

*   **描述**: 追加路径组件并指定是否为目录。

*   **参数**:

    *   `pathComponent`: 要追加的路径组件字符串。
    *   `isDirectory`: 布尔值，指示是否为目录。

*   **返回**: 新的 URL 实例。

*   **作用**: 明确指定追加的路径组件是否为目录。

*   **示例**:

    ```swift
    let url = URL(string: "file:///Users/example")!
    let newURL = url.appendingPathComponent("folder", isDirectory: true)
    print(newURL) // 输出: file:///Users/example/folder/
    ```

### `appendingPathExtension(_:)`

*   **描述**: 追加文件扩展名到 URL。

*   **参数**:

    *   `pathExtension`: 要追加的文件扩展名字符串。

*   **返回**: 新的 URL 实例。

*   **作用**: 在 URL 路径末尾追加文件扩展名。

*   **示例**:

    ```swift
    let url = URL(string: "file:///Users/example/file")!
    let newURL = url.appendingPathExtension("txt")
    print(newURL) // 输出: file:///Users/example/file.txt
    ```

### `deletingLastPathComponent()`

*   **描述**: 删除 URL 路径的最后一个组件。

*   **返回**: 新的 URL 实例。

*   **作用**: 移除路径的最后一个部分。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com/path/to/resource")!
    let newURL = url.deletingLastPathComponent()
    print(newURL) // 输出: https://example.com/path/to
    ```

### `deletingPathExtension()`

*   **描述**: 删除 URL 路径的文件扩展名。

*   **返回**: 新的 URL 实例。

*   **作用**: 移除路径的扩展名。

*   **示例**:

    ```swift
    let url = URL(string: "file:///Users/example/file.txt")!
    let newURL = url.deletingPathExtension()
    print(newURL) // 输出: file:///Users/example/file
    ```

### `resolvingSymlinksInPath()`

*   **描述**: 解析文件 URL 中的符号链接。

*   **返回**: 新的 URL 实例。

*   **作用**: 将符号链接转换为实际路径（仅限文件 URL）。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/link")
    let resolvedURL = fileURL.resolvingSymlinksInPath()
    print(resolvedURL) // 输出: 解析后的实际路径（取决于实际文件系统）
    ```

### `appending(queryItems:)`

*   **描述**: 追加查询参数到 URL。

*   **参数**:

    *   `queryItems`: `[URLQueryItem]` 数组，包含查询参数的键值对。

*   **返回**: 新的 URL 实例。

*   **作用**: 添加查询参数到 URL。

*   **示例**:

    ```swift
    let url = URL(string: "https://example.com")!
    let queryItems = [URLQueryItem(name: "key", value: "value")]
    let newURL = url.appending(queryItems: queryItems)
    print(newURL) // 输出: https://example.com?key=value
    ```

### `resourceValues(forKeys:)`

*   **描述**: 获取 URL 的资源值。

*   **参数**:

    *   `keys`: `[URLResourceKey]` 数组，指定要获取的资源键。

*   **返回**: `URLResourceValues` 实例。

*   **作用**: 获取文件系统资源的元数据（如文件大小、创建日期等）。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    do {
        let values = try fileURL.resourceValues(forKeys: [.fileSizeKey, .creationDateKey])
        print(values.fileSize) // 输出: Optional(文件大小，单位字节)
        print(values.creationDate) // 输出: Optional(创建日期)
    } catch {
        print("Error: \(error)")
    }
    ```

### `setResourceValues(_:)`

*   **描述**: 设置 URL 的资源值。

*   **参数**:

    *   `values`: `URLResourceValues` 实例，包含要设置的资源值。

*   **作用**: 修改文件系统资源的元数据。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    do {
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try fileURL.setResourceValues(values)
        print("Resource values set successfully")
    } catch {
        print("Error: \(error)")
    }
    ```

### `startAccessingSecurityScopedResource()`

*   **描述**: 开始访问受安全范围限制的资源。

*   **返回**: 布尔值，指示是否成功。

*   **作用**: 在沙盒环境中，允许访问受限资源。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    if fileURL.startAccessingSecurityScopedResource() {
        print("Started accessing security-scoped resource")
        // 访问资源
    } else {
        print("Failed to start accessing")
    }
    ```

### `stopAccessingSecurityScopedResource()`

*   **描述**: 停止访问受安全范围限制的资源。

*   **作用**: 释放对受限资源的访问权限。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    fileURL.stopAccessingSecurityScopedResource()
    print("Stopped accessing security-scoped resource")
    ```

### `bookmarkData(options:includingResourceValuesForKeys:relativeTo:)`

*   **描述**: 创建 URL 的书签数据。

*   **参数**:

    *   `options`: `URL.BookmarkCreationOptions` 选项，控制书签创建行为。
    *   `includingResourceValuesForKeys`: `[URLResourceKey]?`，指定包含的资源键。
    *   `relativeTo`: 基础 URL，类型为 `URL?`。

*   **返回**: `Data` 类型的书签数据。

*   **作用**: 生成可用于持久化存储 URL 的书签数据。

*   **示例**:

    ```swift
    let fileURL = URL(fileURLWithPath: "/Users/example/file.txt")
    do {
        let bookmarkData = try fileURL.bookmarkData(options: [.minimalBookmark])
        print("Bookmark data created: \(bookmarkData)")
    } catch {
        print("Error: \(error)")
    }
    ```

## 4. 静态属性

### `fileManager: FileManager`

*   **描述**: 获取默认的 `FileManager` 实例。

*   **作用**: 提供与文件系统交互的便捷方式。

*   **示例**:

    ```swift
    let fileManager = URL.fileManager
    print(fileManager.currentDirectoryPath) // 输出: 当前工作目录路径
    ```

## 5. 其他说明

*   **`URL` 类是线程安全的**: 可在多线程环境中安全使用。
*   **文件 URL 和网络 URL 的差异**: 文件 URL（`file://`）主要用于本地文件系统操作，而网络 URL（如 `http://`、`https://`）用于网络资源。
*   **与 `URLComponents` 的关系**: 如果需要更细粒度地操作 URL 组件，可以使用 `URLComponents` 类。
*   **注意事项**: 示例中的文件路径（如 `/Users/example/file.txt`）需替换为实际存在的路径，否则可能抛出错误。网络 URL 示例假设为有效 URL，实际使用时需确保网络可达。

以上是 Swift 中 `URL` 类的所有主要 API 及其参数的详细说明，包含调用示例和输出结果，适合开发者快速查阅和使用。
