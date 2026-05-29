---
title: "FileUtil"
description: "FileUtil 的技术笔记。"
pubDate: 2026-05-29
category: "swift"
tags: [Swift, Array]
draft: false
---
# 🚀  FileUtil

```Swift

//
//  FileUtil.swift
//  wscanner
//
//  Created by yunshen on 2025/6/4.
//

import Foundation

public class FileUtil {

    /// getCachesDirectory
    /// - 获取Caches 文件路径
    /// - return 文件路径
    public static func getCachesDirectory() throws -> URL {
        return try FileManager.default.url(
            for: .cachesDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
    }

    /// - desc 获取catchs 下 path 的文件夹的路径
    /// - parameter path 文件夹的名字
    /// - Caches/path 目录路径
    public static func getCachesDirectoryFromPath(path: String) throws -> URL {
        let cachesDirectory = try getCachesDirectory()
        let newFolderPath = cachesDirectory.appendingPathComponent(path)
        if !FileManager.default.fileExists(atPath: newFolderPath.path) {
            try FileManager.default.createDirectory(
                at: newFolderPath,
                withIntermediateDirectories: true
            )
        }
        return newFolderPath
    }

    /// - desc 获取 catchs 目录下 fileName的RUL
    /// - parameter fileName 文件的名字
    /// - return fileName的RUL
    public static func getFileFromCachesDirectory(fileName: String) throws
        -> URL
    {
        let cachesDirectory = try getCachesDirectory()
        let fileURL = cachesDirectory.appendingPathComponent(fileName)
        return fileURL
    }

    /// - desc 获取获取 catchs/path 目录下 fileName的RUL
    /// - parameter path 文件夹的名字
    /// - parameter fileName path 文件夹下的fileName的文件名字
    public static func getFileFromCachesDirectoryPath(
        path: String,
        fileName: String
    ) throws -> URL {
        let cachesDirectory = try getCachesDirectoryFromPath(path: path)
        let fileURL = cachesDirectory.appendingPathComponent(fileName)
        return fileURL
    }

    /// - desc 将 [Int8] 写入文件中
    /// - parameter `array` 数据源
    /// - parameter `fileURL` 要写入的文件
    /// - return 是否写入成功
    public static func writeInt8ArrayToFile(array: [Int8], fileURL: URL) -> Bool
    {
        var result: Bool = false
        let dada = array.withUnsafeBufferPointer { buffer in
            Data(
                Data(
                    buffer: UnsafeBufferPointer(
                        start: buffer.baseAddress,
                        count: buffer.count
                    )
                )
            )
        }

        do {
            if FileManager.default.fileExists(atPath: fileURL.path) {
                try FileManager.default.removeItem(at: fileURL)
            }

            try dada.write(to: fileURL, options: .atomic)
            result = true

        } catch {
            result = false
        }

        return result
    }

    /// - desc 重文件中读取数据到 Int8 数组中
    /// - parameter `fileURL` 文件的路径
    /// - return 数据
    public static func readInt8ArrayFromFile(fileURL: URL) -> [Int8]? {
        var array: [Int8]? = nil
        do {
            let data = try Data(contentsOf: fileURL)
            let expectedSize = data.count / MemoryLayout<Int8>.size
            guard data.count % MemoryLayout<Int8>.size == 0 else {
                throw NSError(
                    domain: "FileUtil",
                    code: -1,
                    userInfo: [
                        NSLocalizedDescriptionKey: "文件大小无效：不是 Int8 大小的整数倍"
                    ]
                )
            }

            array = data.withUnsafeBytes({ rawBuffer in
                let pointer = rawBuffer.baseAddress!.assumingMemoryBound(
                    to: Int8.self
                )
                return Array(
                    UnsafeBufferPointer(start: pointer, count: expectedSize)
                )
            })
        } catch {
            print("read error = \(error)")
        }

        return array
    }

    /// - desc 重文件中读取数据到 Int8 数组中
    /// - parameter `filePath` 文件的路径
    /// - return 数据
    public static func readInt8ArrayFromFile(filePath: String) -> [Int8]? {
        return readInt8ArrayFromFile(fileURL: filePath.toURL())
    }

    /// - desc 将 [Int16] 写入文件中
    /// - parameter `array` 数据源
    /// - parameter `fileURL` 要写入的文件
    /// - return 是否写入成功
    public static func writeInt16ArrayToFile(array: [Int16], fileURL: URL)
        -> Bool
    {
        var result: Bool = false
        let data = array.withUnsafeBufferPointer { buffer in
            Data(
                buffer: UnsafeBufferPointer(
                    start: buffer.baseAddress,
                    count: buffer.count
                )
            )
        }

        do {
            if FileManager.default.fileExists(atPath: fileURL.path) {
                try FileManager.default.removeItem(at: fileURL)
            }
            try data.write(to: fileURL, options: .atomic)
            result = true
        } catch {
            result = false
        }
        return result
    }

    /// - desc 重文件中读取数据到Int16 数组中
    /// - parameter `fileURL` 文件的路径
    /// - return 数据
    public static func readInt16ArrayFromFile(fileURL: URL) -> [Int16]? {
        var array: [Int16]? = nil
        do {
            let data = try Data(contentsOf: fileURL)
            let expectedSize = data.count / MemoryLayout<Int16>.size
            guard data.count % MemoryLayout<Int16>.size == 0 else {
                throw NSError(
                    domain: "FileUtil",
                    code: -1,
                    userInfo: [
                        NSLocalizedDescriptionKey: "文件大小无效：不是 Int16 大小的整数倍"
                    ]
                )
            }

            array = data.withUnsafeBytes { rawBuffer in
                let pointer = rawBuffer.baseAddress!.assumingMemoryBound(
                    to: Int16.self
                )
                return Array(
                    UnsafeBufferPointer(start: pointer, count: expectedSize)
                )

            }

        } catch {
            print("read error = \(error)")
        }

        return array
    }

    /// - desc 重文件中读取数据到Int16 数组中
    /// - parameter `filePath` 文件的路径
    /// - return 数据
    public static func readInt16ArrayFromFile(filePath: String) -> [Int16]? {
        return readInt16ArrayFromFile(fileURL: filePath.toURL())
    }

    /// - desc 将 [Int32] 写入文件中
    /// - parameter `array` 数据源
    /// - parameter `fileURL` 要写入的文件
    /// - return 是否写入成功
    public static func writeInt32ArrayToFile(array: [Int32], fileURL: URL)
        -> Bool
    {

        var result: Bool = false
        let data = array.withUnsafeBufferPointer { buffer in
            Data(
                buffer: UnsafeBufferPointer(
                    start: buffer.baseAddress,
                    count: buffer.count
                )
            )
        }

        do {
            if FileManager.default.fileExists(atPath: fileURL.path) {
                try FileManager.default.removeItem(at: fileURL)
            }
            try data.write(to: fileURL, options: .atomic)
            result = true
        } catch {
            result = false
        }
        return result
    }

    /// - desc 重文件中读取数据到Int32 数组中
    /// - parameter `fileURL` 文件的路径
    /// - return 数据
    public static func readInt32ArrayFromFile(fileURL: URL) -> [Int32]? {
        var array: [Int32]? = nil
        do {
            let data = try Data(contentsOf: fileURL)
            let expectedSize = data.count / MemoryLayout<Int32>.size
            guard data.count % MemoryLayout<Int32>.size == 0 else {
                throw NSError(
                    domain: "FileUtil",
                    code: -1,
                    userInfo: [
                        NSLocalizedDescriptionKey: "文件大小无效：不是 Int32 大小的整数倍"
                    ]
                )
            }

            array = data.withUnsafeBytes { rawBuffer in
                let pointer = rawBuffer.baseAddress!.assumingMemoryBound(
                    to: Int32.self
                )
                return Array(
                    UnsafeBufferPointer(start: pointer, count: expectedSize)
                )

            }

        } catch {
            print("read error = \(error)")
        }

        return array

    }

    /// - desc 重文件中读取数据到Int32 数组中
    /// - parameter `filePath` 文件的路径
    /// - return 数据
    public static func readInt32ArrayFromFile(filePath: String) -> [Int32]? {
        return readInt32ArrayFromFile(fileURL: filePath.toURL())
    }

}

extension URL {
    public func toPath() -> String {
        self.path
    }
}

extension String {
    /// string 的类型为 这种的 /Users/yunshen/Library/Developer/CoreSimulator/Devices/308574DA-5335-4166-B7E6-7D19140359F9/data/Containers/Data/Application/DEBB8DA2-2562-487F-872A-10635DD8B6CC/Library/Caches
    public func toURL() -> URL {
        URL(fileURLWithPath: self)
    }
}

```

