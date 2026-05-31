---
title: "Swift Combine 框架完整指南"
description: "Combine 是 Apple 从 iOS 13 开始推出的响应式编程框架，它允许你以声明式的方式处理异步事件流。本指南包括基础概念、公共及自定义类型、常用操作等组成细节。"
pubDate: 2026-05-29
category: "Swift"
tags: [iOS, Swift, Array, API]
draft: false
---
# Swift Combine 框架完整指南

## 简介

Combine 是 Apple 从 iOS 13 开始推出的响应式编程框架，它允许你以声明式的方式处理异步事件流。本指南包括基础概念、公共及自定义类型、常用操作等组成细节。

## 基础概念

### Publisher（发布者）

发布值或错误的类型，定义了数据流的源头。

### Subscriber（订阅者）

订阅并处理值或错误的类型，消费数据流。

### Operator（操作符）

用于转换、过滤、组合等处理的方法，连接发布者和订阅者。

## 常见 Publisher 类型

### Just

发送一个值后结束

```swift
Just("Hello World")
    .sink { value in
        print(value) // 输出: Hello World
    }
```

### Empty

直接结束，不发送值

```swift
Empty<String, Never>()
    .sink(
        receiveCompletion: { print("完成") }, // 输出: 完成
        receiveValue: { print($0) } // 不会执行
    )
```

### Fail

立即失败

```swift
enum MyError: Error { case failed }

Fail<String, MyError>(error: MyError.failed)
    .sink(
        receiveCompletion: { print("失败: \($0)") }, // 输出: 失败
        receiveValue: { print($0) } // 不会执行
    )
```

### PassthroughSubject

随时发送值，无初始值

```swift
let subject = PassthroughSubject<String, Never>()

subject.sink { print("接收: \($0)") }

subject.send("消息1") // 输出: 接收: 消息1
subject.send("消息2") // 输出: 接收: 消息2
```

### CurrentValueSubject

保持最新值，新订阅者立即获取

```swift
let subject = CurrentValueSubject<Int, Never>(0)

subject.sink { print("当前值: \($0)") }
// 输出: 当前值: 0

subject.send(1) // 输出: 当前值: 1
print("存储的值: \(subject.value)") // 输出: 存储的值: 1
```

### Future

包裹异步操作

```swift
func asyncTask() -> Future<String, Error> {
    Future { promise in
        DispatchQueue.global().asyncAfter(deadline: .now() + 1) {
            promise(.success("异步完成"))
        }
    }
}

asyncTask().sink(
    receiveCompletion: { print($0) },
    receiveValue: { print($0) } // 1秒后输出: 异步完成
)
```

### Deferred

序列在订阅时才创建的 Publisher

```swift
let deferred = Deferred {
    Just(Date().timeIntervalSince1970)
}

// 每次订阅都创建新的时间戳
deferred.sink { print("时间1: \($0)") }

DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
    deferred.sink { print("时间2: \($0)") } // 不同的时间戳
}
```

### 其他可用的 Publisher

#### Publishers.Sequence

从数组、集合等创建

```swift
Publishers.Sequence(sequence: [1, 2, 3, 4, 5])
    .sink { print("序列值: \($0)") }
// 输出: 1, 2, 3, 4, 5
```

#### Array.publisher

直接使用 Swift 数组生成

```swift
[1, 2, 3, 4, 5].publisher
    .sink { print("数组值: \($0)") }
// 输出: 1, 2, 3, 4, 5
```

#### Timer.publish

定时器 Publisher

```swift
Timer.publish(every: 1.0, on: .main, in: .common)
    .autoconnect()
    .sink { print("定时器: \($0)") }
// 每秒输出当前时间
```

#### NotificationCenter.publisher

监听通知

```swift
NotificationCenter.default
    .publisher(for: UIApplication.didBecomeActiveNotification)
    .sink { print("应用激活: \($0.name)") }
```

#### NSObject.publisher

基于 KVO

```swift
class Person: NSObject {
    @objc dynamic var name: String = ""
}

let person = Person()
person.publisher(for: \.name)
    .sink { print("姓名变更: \($0)") }

person.name = "张三" // 输出: 姓名变更: 张三
```

## 高级 Publisher 类型

### Record & Share

```swift
// Record - 记录和重放序列
let recorded = [1, 2, 3, 4, 5].publisher
    .record()

recorded.sink { print("第一次: \($0)") }
recorded.sink { print("第二次: \($0)") }

// Share - 共享单个订阅
let shared = URLSession.shared
    .dataTaskPublisher(for: URL(string: "https://api.example.com")!)
    .map(\.data)
    .share()

shared.sink { print("订阅者1: \($0)") }
shared.sink { print("订阅者2: \($0)") }
```

### Multicast & ConnectablePublisher

```swift
let subject = PassthroughSubject<Int, Never>()
let multicasted = [1, 2, 3, 4, 5].publisher
    .multicast(subject: subject)

multicasted.sink { print("订阅者1: \($0)") }
multicasted.sink { print("订阅者2: \($0)") }

// 手动连接开始发送
multicasted.connect()
```

## 常用操作符

### 转换

#### map

转换每个值

```swift
[1, 2, 3, 4, 5].publisher
    .map { $0 * 2 }
    .sink { print("翻倍: \($0)") }
// 输出: 2, 4, 6, 8, 10
```

#### tryMap

可能抛出错误的转换

```swift
["1", "2", "abc", "4"].publisher
    .tryMap { Int($0)! }
    .sink(
        receiveCompletion: { print("完成: \($0)") },
        receiveValue: { print("值: \($0)") }
    )
```

#### compactMap

过滤掉 nil 值

```swift
["1", "2", "abc", "4"].publisher
    .compactMap { Int($0) }
    .sink { print("有效数字: \($0)") }
// 输出: 1, 2, 4
```

#### flatMap

展平嵌套的发布者

```swift
[1, 2, 3].publisher
    .flatMap { Just($0 * 2) }
    .sink { print("展平: \($0)") }
// 输出: 2, 4, 6
```

#### scan

累积计算

```swift
[1, 2, 3, 4, 5].publisher
    .scan(0, +)
    .sink { print("累计: \($0)") }
// 输出: 1, 3, 6, 10, 15
```

#### reduce

减少为单个值

```swift
[1, 2, 3, 4, 5].publisher
    .reduce(0, +)
    .sink { print("总和: \($0)") }
// 输出: 总和: 15
```

### 过滤

#### filter

过滤值

```swift
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].publisher
    .filter { $0 % 2 == 0 }
    .sink { print("偶数: \($0)") }
// 输出: 2, 4, 6, 8, 10
```

#### removeDuplicates

移除重复值

```swift
[1, 1, 2, 2, 3, 3].publisher
    .removeDuplicates()
    .sink { print("去重: \($0)") }
// 输出: 1, 2, 3
```

#### first

获取第一个值

```swift
[1, 2, 3, 4, 5].publisher
    .first()
    .sink { print("第一个: \($0)") }
// 输出: 第一个: 1
```

#### last

获取最后一个值

```swift
[1, 2, 3, 4, 5].publisher
    .last()
    .sink { print("最后一个: \($0)") }
// 输出: 最后一个: 5
```

#### prefix

获取前 n 个值

```swift
[1, 2, 3, 4, 5].publisher
    .prefix(3)
    .sink { print("前缀: \($0)") }
// 输出: 1, 2, 3
```

#### drop

跳过前 n 个值

```swift
[1, 2, 3, 4, 5].publisher
    .drop(first: 2)
    .sink { print("跳过前2个: \($0)") }
// 输出: 3, 4, 5
```

#### dropFirst

跳过第一个值

```swift
[1, 2, 3, 4, 5].publisher
    .dropFirst()
    .sink { print("跳过第一个: \($0)") }
// 输出: 2, 3, 4, 5
```

### 组合

#### zip

组合两个发布者的值

```swift
let numbers = [1, 2, 3].publisher
let letters = ["A", "B", "C"].publisher

numbers.zip(letters)
    .sink { number, letter in
        print("组合: \(number)-\(letter)")
    }
// 输出: 1-A, 2-B, 3-C
```

#### combineLatest

组合两个发布者的最新值

```swift
let subject1 = PassthroughSubject<Int, Never>()
let subject2 = PassthroughSubject<String, Never>()

subject1.combineLatest(subject2)
    .sink { number, string in
        print("最新组合: \(number)-\(string)")
    }

subject1.send(1)
subject2.send("A") // 输出: 最新组合: 1-A
subject1.send(2)   // 输出: 最新组合: 2-A
```

#### merge

合并多个相同类型的发布者

```swift
let subject1 = PassthroughSubject<Int, Never>()
let subject2 = PassthroughSubject<Int, Never>()

subject1.merge(with: subject2)
    .sink { print("合并: \($0)") }

subject1.send(1) // 输出: 合并: 1
subject2.send(2) // 输出: 合并: 2
```

#### append

在发布者完成后追加值

```swift
[1, 2, 3].publisher
    .append(4, 5)
    .sink { print("追加: \($0)") }
// 输出: 1, 2, 3, 4, 5
```

#### prepend

在发布者开始前添加值

```swift
[3, 4, 5].publisher
    .prepend(1, 2)
    .sink { print("前置: \($0)") }
// 输出: 1, 2, 3, 4, 5
```

### 时间操作

#### delay

延迟发送值

```swift
[1, 2, 3].publisher
    .delay(for: .seconds(1), scheduler: DispatchQueue.main)
    .sink { print("延迟: \($0)") }
// 1秒后输出: 1, 2, 3
```

#### debounce

防抖动，只发送最后一个值

```swift
let subject = PassthroughSubject<String, Never>()

subject
    .debounce(for: .milliseconds(500), scheduler: DispatchQueue.main)
    .sink { print("防抖: \($0)") }

subject.send("A")
subject.send("B")
subject.send("C") // 只有这个会在500ms后被打印
```

#### throttle

节流，限制发送频率

```swift
let subject = PassthroughSubject<String, Never>()

subject
    .throttle(for: .seconds(1), scheduler: DispatchQueue.main, latest: true)
    .sink { print("节流: \($0)") }
```

#### timeout

设置超时

```swift
let subject = PassthroughSubject<String, Never>()

subject
    .timeout(.seconds(2), scheduler: DispatchQueue.main)
    .sink(
        receiveCompletion: { print("完成: \($0)") },
        receiveValue: { print("值: \($0)") }
    )
// 2秒后如果没有值会超时
```

## 高级操作符

### switchToLatest

```swift
let outerSubject = PassthroughSubject<PassthroughSubject<Int, Never>, Never>()
let innerSubject1 = PassthroughSubject<Int, Never>()
let innerSubject2 = PassthroughSubject<Int, Never>()

outerSubject
    .switchToLatest()
    .sink { print("切换到最新: \($0)") }

outerSubject.send(innerSubject1)
innerSubject1.send(1) // 输出: 1
innerSubject1.send(2) // 输出: 2

outerSubject.send(innerSubject2) // 切换到新的内部发布者
innerSubject1.send(3) // 不会输出，因为已经切换
innerSubject2.send(4) // 输出: 4
```

### measureInterval

```swift
[1, 2, 3].publisher
    .delay(for: .seconds(1), scheduler: DispatchQueue.main)
    .measureInterval(using: DispatchQueue.main)
    .sink { interval in
        print("间隔时间: \(interval)")
    }
```

### materialize & dematerialize

```swift
[1, 2, 3].publisher
    .materialize()
    .sink { event in
        switch event {
        case .value(let value):
            print("值事件: \(value)")
        case .completion(.finished):
            print("完成事件")
        case .completion(.failure(let error)):
            print("错误事件: \(error)")
        }
    }
```

## 错误处理

### catch

捕获错误并提供替代发布者

```swift
enum MyError: Error { case failed }

Fail<String, MyError>(error: MyError.failed)
    .catch { error in Just("默认值") }
    .sink { print("捕获: \($0)") }
// 输出: 捕获: 默认值
```

### retry

重试失败的发布者

```swift
var attempts = 0

Deferred {
    attempts += 1
    if attempts < 3 {
        return Fail<String, MyError>(error: MyError.failed)
    } else {
        return Just("成功").setFailureType(to: MyError.self)
    }
}
.retry(2)
.sink(
    receiveCompletion: { print("完成: \($0)") },
    receiveValue: { print("值: \($0)") }
)
```

### replaceError

用默认值替换错误

```swift
Fail<String, MyError>(error: MyError.failed)
    .replaceError(with: "替换值")
    .sink { print("替换: \($0)") }
// 输出: 替换: 替换值
```

### mapError

转换错误类型

```swift
enum NetworkError: Error { case timeout }

Fail<String, MyError>(error: MyError.failed)
    .mapError { _ in NetworkError.timeout }
    .sink(
        receiveCompletion: { print("映射错误: \($0)") },
        receiveValue: { print("值: \($0)") }
    )
```

## 错误处理进阶

### 自定义错误处理

```swift
enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "无效URL"
        case .noData: return "无数据"
        case .decodingError: return "解码错误"
        }
    }
}

func handleNetworkError<T>() -> AnyPublisher<T, Never> where T: Decodable {
    return Fail<T, NetworkError>(error: .noData)
        .catch { error in
            print("捕获错误: \(error.localizedDescription)")
            return Empty<T, Never>()
        }
        .eraseToAnyPublisher()
}
```

### 重试策略

```swift
func retryWithExponentialBackoff<T, E>(
    _ publisher: AnyPublisher<T, E>,
    maxRetries: Int = 3
) -> AnyPublisher<T, E> {
    return publisher
        .catch { error -> AnyPublisher<T, E> in
            if maxRetries > 0 {
                return retryWithExponentialBackoff(
                    publisher.delay(for: .seconds(pow(2, Double(3 - maxRetries))), 
                                  scheduler: DispatchQueue.global()),
                    maxRetries: maxRetries - 1
                )
            } else {
                return Fail(error: error).eraseToAnyPublisher()
            }
        }
        .eraseToAnyPublisher()
}
```

## 副作用

### handleEvents

处理各种事件

```swift
[1, 2, 3].publisher
    .handleEvents(
        receiveOutput: { print("输出事件: \($0)") },
        receiveCompletion: { print("完成事件: \($0)") }
    )
    .sink { print("最终值: \($0)") }
```

### print

打印所有事件

```swift
[1, 2, 3].publisher
    .print("调试")
    .sink { print("值: \($0)") }
```

## 调度

### receive(on:)

指定在哪个调度器接收值

```swift
[1, 2, 3].publisher
    .receive(on: DispatchQueue.main)
    .sink { print("主队列: \($0)") }
```

### subscribe(on:)

指定在哪个调度器订阅

```swift
[1, 2, 3].publisher
    .subscribe(on: DispatchQueue.global())
    .receive(on: DispatchQueue.main)
    .sink { print("后台订阅，主队列接收: \($0)") }
```

## 背压操作

### buffer

缓冲值

```swift
let subject = PassthroughSubject<Int, Never>()

subject
    .buffer(size: 3, prefetch: .keepFull, whenFull: .dropOldest)
    .sink { print("缓冲: \($0)") }
```

## 订阅者 (Subscriber)

### sink

最常用的订阅方法

```swift
[1, 2, 3].publisher
    .sink(
        receiveCompletion: { print("完成: \($0)") },
        receiveValue: { print("值: \($0)") }
    )
```

### assign(to:on:)

给对象属性赋值

```swift
class MyObject {
    var value: String = ""
}

let object = MyObject()

Just("Hello")
    .assign(to: \.value, on: object)

print(object.value) // 输出: Hello
```

### assign(to:)

相当于 SwiftUI 中 @Published 属性

```swift
class ViewModel: ObservableObject {
    @Published var text: String = ""
}

let viewModel = ViewModel()

Just("新文本")
    .assign(to: &viewModel.$text)
```

## 自定义 Subscriber

### 基础自定义 Subscriber

```swift
class CustomSubscriber: Subscriber {
    typealias Input = String
    typealias Failure = Never
    
    func receive(subscription: Subscription) {
        print("收到订阅")
        subscription.request(.unlimited)
    }
    
    func receive(_ input: String) -> Subscribers.Demand {
        print("收到值: \(input)")
        return .none
    }
    
    func receive(completion: Subscribers.Completion<Never>) {
        print("订阅完成")
    }
}

// 使用
let subscriber = CustomSubscriber()
["A", "B", "C"].publisher.subscribe(subscriber)
```

### 带背压控制的 Subscriber

```swift
class BackpressureSubscriber: Subscriber {
    typealias Input = Int
    typealias Failure = Never
    
    private var subscription: Subscription?
    private var requestedCount = 0
    
    func receive(subscription: Subscription) {
        self.subscription = subscription
        subscription.request(.max(1)) // 一次只请求一个值
    }
    
    func receive(_ input: Int) -> Subscribers.Demand {
        print("处理值: \(input)")
        requestedCount += 1
        
        // 每处理两个值后请求下一个
        if requestedCount % 2 == 0 {
            return .max(1)
        }
        return .none
    }
    
    func receive(completion: Subscribers.Completion<Never>) {
        print("完成")
    }
}
```

## SwiftUI 集成

### @Published 和 @ObservableObject

```swift
class DataModel: ObservableObject {
    @Published var name: String = ""
    @Published var isLoading: Bool = false
    
    func loadData() {
        isLoading = true
        
        // 模拟网络请求
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.name = "加载完成"
            self.isLoading = false
        }
    }
}
```

### 视图中的 @StateObject, @ObservedObject

```swift
struct ContentView: View {
    @StateObject private var dataModel = DataModel()
    
    var body: some View {
        VStack {
            Text(dataModel.name)
            if dataModel.isLoading {
                ProgressView()
            }
            Button("加载数据") {
                dataModel.loadData()
            }
        }
    }
}
```

### onReceive() 监听 Publisher

```swift
struct TimerView: View {
    @State private var currentTime = Date()
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        Text("\(currentTime)")
            .onReceive(timer) { time in
                currentTime = time
            }
    }
}
```

## 自定义 Publisher

### CountdownPublisher

通过定义 Publisher 和 Subscription 类，控制发送逻辑

```swift
struct CountdownPublisher: Publisher {
    typealias Output = Int
    typealias Failure = Never
    
    let start: Int
    
    func receive<S>(subscriber: S) where S : Subscriber, Failure == S.Failure, Output == S.Input {
        let subscription = CountdownSubscription(subscriber: subscriber, start: start)
        subscriber.receive(subscription: subscription)
    }
}

final class CountdownSubscription<S: Subscriber>: Subscription 
where S.Input == Int, S.Failure == Never {
    private var subscriber: S?
    private var current: Int
    
    init(subscriber: S, start: Int) {
        self.subscriber = subscriber
        self.current = start
    }
    
    func request(_ demand: Subscribers.Demand) {
        guard let subscriber = subscriber, current > 0 else {
            subscriber?.receive(completion: .finished)
            return
        }
        
        while current > 0 && demand > 0 {
            _ = subscriber.receive(current)
            current -= 1
        }
        
        if current == 0 {
            subscriber.receive(completion: .finished)
        }
    }
    
    func cancel() {
        subscriber = nil
    }
}

// 使用示例
CountdownPublisher(start: 5)
    .sink { value in
        print("倒计时: \(value)")
    }
// 输出: 5, 4, 3, 2, 1
```

## 性能优化

### 懒加载 Publisher

```swift
class LazyDataLoader {
    private lazy var dataPublisher = createDataPublisher()
    
    private func createDataPublisher() -> AnyPublisher<Data, Error> {
        print("创建数据发布者") // 只有在首次访问时才执行
        return URLSession.shared
            .dataTaskPublisher(for: URL(string: "https://api.example.com")!)
            .map(\.data)
            .eraseToAnyPublisher()
    }
    
    func getData() -> AnyPublisher<Data, Error> {
        return dataPublisher
    }
}
```

### 操作符链优化

```swift
// 不推荐：多次转换
let inefficient = dataPublisher
    .map { $0.count }
    .map { $0 * 2 }
    .map { $0 + 1 }

// 推荐：合并转换
let efficient = dataPublisher
    .map { $0.count * 2 + 1 }
```

### 合理使用 share()

```swift
// 避免重复网络请求
let sharedNetworkRequest = URLSession.shared
    .dataTaskPublisher(for: url)
    .map(\.data)
    .decode(type: Response.self, decoder: JSONDecoder())
    .share()

// 多个订阅者共享同一个网络请求
sharedNetworkRequest.sink { handleResponse1($0) }
sharedNetworkRequest.sink { handleResponse2($0) }
```

## 测试 Combine 代码

### 测试 Publisher

```swift
import XCTest
import Combine

class CombineTests: XCTestCase {
    var cancellables: Set<AnyCancellable>!
    
    override func setUp() {
        super.setUp()
        cancellables = Set<AnyCancellable>()
    }
    
    func testPublisher() {
        let expectation = self.expectation(description: "Publisher completes")
        var receivedValues: [Int] = []
        
        [1, 2, 3].publisher
            .sink(
                receiveCompletion: { _ in
                    expectation.fulfill()
                },
                receiveValue: { value in
                    receivedValues.append(value)
                }
            )
            .store(in: &cancellables)
        
        waitForExpectations(timeout: 1.0)
        XCTAssertEqual(receivedValues, [1, 2, 3])
    }
    
    func testAsyncPublisher() {
        let expectation = self.expectation(description: "Async publisher completes")
        
        Future<String, Never> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + 0.1) {
                promise(.success("异步结果"))
            }
        }
        .sink { value in
            XCTAssertEqual(value, "异步结果")
            expectation.fulfill()
        }
        .store(in: &cancellables)
        
        waitForExpectations(timeout: 1.0)
    }
}
```

### 测试 Subject

```swift
func testSubject() {
    let subject = PassthroughSubject<String, Never>()
    var receivedValues: [String] = []
    
    subject
        .sink { receivedValues.append($0) }
        .store(in: &cancellables)
    
    subject.send("测试1")
    subject.send("测试2")
    
    XCTAssertEqual(receivedValues, ["测试1", "测试2"])
}
```

### 调试技巧

#### 复杂的调试操作

```swift
extension Publisher {
    func debug(_ prefix: String) -> Publishers.HandleEvents<Self> {
        return handleEvents(
            receiveSubscription: { subscription in
                print("\(prefix) - 收到订阅: \(subscription)")
            },
            receiveOutput: { output in
                print("\(prefix) - 收到输出: \(output)")
            },
            receiveCompletion: { completion in
                print("\(prefix) - 完成: \(completion)")
            },
            receiveCancel: {
                print("\(prefix) - 取消")
            }
        )
    }
}

// 使用
[1, 2, 3].publisher
    .debug("开始")
    .map { $0 * 2 }
    .debug("映射后")
    .sink { print("最终: \($0)") }
```

#### 性能监控

```swift
extension Publisher {
    func measureTime(_ label: String) -> Publishers.HandleEvents<Self> {
        var startTime: CFAbsoluteTime = 0
        
        return handleEvents(
            receiveSubscription: { _ in
                startTime = CFAbsoluteTimeGetCurrent()
                print("\(label) - 开始时间: \(startTime)")
            },
            receiveCompletion: { _ in
                let endTime = CFAbsoluteTimeGetCurrent()
                print("\(label) - 结束时间: \(endTime)")
                print("\(label) - 总耗时: \(endTime - startTime) 秒")
            }
        )
    }
}
```

### 实际应用场景

#### 复杂的网络请求链

```swift
class APIService {
    func authenticateAndFetchData() -> AnyPublisher<UserData, Error> {
        return authenticate()
            .flatMap { token in
                self.fetchUserProfile(token: token)
            }
            .flatMap { profile in
                self.fetchUserData(userId: profile.id)
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    private func authenticate() -> AnyPublisher<String, Error> {
        // 认证逻辑
        return Just("auth_token")
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    private func fetchUserProfile(token: String) -> AnyPublisher<UserProfile, Error> {
        // 获取用户资料
        return Just(UserProfile(id: "123", name: "用户"))
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    private func fetchUserData(userId: String) -> AnyPublisher<UserData, Error> {
        // 获取用户数据
        return Just(UserData(userId: userId, data: "用户数据"))
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
}
```

#### 复杂的状态管理

```swift
class AppStateManager: ObservableObject {
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: Error?
    
    private let apiService = APIService()
    private var cancellables = Set<AnyCancellable>()
    
    func login(username: String, password: String) {
        isLoading = true
        error = nil
        
        apiService.login(username: username, password: password)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.error = error
                    }
                },
                receiveValue: { [weak self] user in
                    self?.currentUser = user
                }
            )
            .store(in: &cancellables)
    }
    
    func logout() {
        currentUser = nil
        error = nil
    }
}
```

### 内存管理注意事项

#### 避免循环引用

```swift
class ViewController: UIViewController {
    private var cancellables = Set<AnyCancellable>()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 正确：使用 weak self
        somePublisher
            .sink { [weak self] value in
                self?.updateUI(with: value)
            }
            .store(in: &cancellables)
        
        // 错误：强引用可能导致循环引用
        // somePublisher
        //     .sink { value in
        //         self.updateUI(with: value)
        //     }
        //     .store(in: &cancellables)
    }
    
    private func updateUI(with value: String) {
        // 更新UI
    }
}
```

#### 正确的取消时机

```swift
class DataManager {
    private var cancellables = Set<AnyCancellable>()
    
    func startPeriodicUpdate() {
        Timer.publish(every: 5.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.updateData()
            }
            .store(in: &cancellables)
    }
    
    func stopPeriodicUpdate() {
        cancellables.removeAll() // 取消所有订阅
    }
    
    private func updateData() {
        // 更新数据逻辑
    }
    
    deinit {
        cancellables.removeAll() // 确保清理
    }
}
```

### 与其他框架集成

#### 与 Core Data 集成

```swift
import CoreData

extension NSManagedObjectContext {
    var publisher: AnyPublisher<Notification, Never> {
        return NotificationCenter.default
            .publisher(for: .NSManagedObjectContextDidSave, object: self)
            .eraseToAnyPublisher()
    }
}

class CoreDataManager {
    private var cancellables = Set<AnyCancellable>()
    
    func observeDataChanges() {
        managedObjectContext.publisher
            .sink { notification in
                print("Core Data 发生变化: \(notification)")
                // 处理数据变化
            }
            .store(in: &cancellables)
    }
}
```

#### 与 UserDefaults 集成

```swift
extension UserDefaults {
    func publisher<T>(for key: String, type: T.Type) -> AnyPublisher<T?, Never> {
        return NotificationCenter.default
            .publisher(for: UserDefaults.didChangeNotification, object: self)
            .map { _ in self.object(forKey: key) as? T }
            .prepend(self.object(forKey: key) as? T)
            .eraseToAnyPublisher()
    }
}

// 使用
UserDefaults.standard
    .publisher(for: "username", type: String.self)
    .sink { username in
        print("用户名变更: \(username ?? "未设置")")
    }
    .store(in: &cancellables)
```

## 最佳实践总结

1. **生命周期管理**：始终使用 `AnyCancellable` 或 `Set<AnyCancellable>` 管理订阅
2. **错误处理**：为每个可能失败的操作提供适当的错误处理
3. **线程安全**：使用 `receive(on:)` 确保 UI 更新在主线程
4. **性能优化**：合理使用 `share()`、`multicast()` 避免重复计算
5. **测试**：为 Combine 代码编写单元测试
6. **调试**：使用 `print()` 和 `handleEvents()` 进行调试
7. **内存管理**：注意避免循环引用，适当使用 `weak self`