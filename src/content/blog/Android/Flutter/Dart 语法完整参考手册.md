---
title: "Dart 语法完整参考手册"
description: "适用版本：Dart 3.x 本手册系统整理 Dart 语言的核心语法，每个知识点均配有详细说明、完整示例代码及运行输出结果，适合快速查阅与深入学习。"
pubDate: 2026-05-31
category: "Flutter"
tags: [Swift, API, JavaScript]
draft: false
---
# Dart 语法完整参考手册

> **适用版本：Dart 3.x**
> 本手册系统整理 Dart 语言的核心语法，每个知识点均配有详细说明、完整示例代码及运行输出结果，适合快速查阅与深入学习。

---

## 目录

1. [变量与类型](#1-变量与类型)
2. [字符串](#2-字符串)
3. [运算符](#3-运算符)
4. [控制流](#4-控制流)
5. [函数](#5-函数)
6. [类与面向对象](#6-类与面向对象)
7. [集合类型](#7-集合类型)
8. [空安全](#8-空安全)
9. [泛型](#9-泛型)
10. [扩展方法与扩展类型](#10-扩展方法与扩展类型)
11. [模式匹配与解构（Dart 3.0+）](#11-模式匹配与解构dart-30)
12. [Record 类型（Dart 3.0+）](#12-record-类型dart-30)
13. [异步编程](#13-异步编程)
14. [异常处理](#14-异常处理)
15. [枚举](#15-枚举)
16. [库与导入](#16-库与导入)

---

## 1. 变量与类型

Dart 是一门强类型语言，但借助类型推断，大多数情况下无需手动标注类型。Dart 的类型系统在空安全（Null Safety）的加持下，能在编译期捕获大量潜在错误。

### 1.1 变量声明

Dart 提供了多种变量声明方式，每种都有其适用场景：

- **`var`**：最常用，类型由初始值推断，一旦推断后不可改变类型。
- **显式类型**：直接写出类型名（如 `String`、`int`），代码更具自文档性。
- **`final`**：运行时常量。变量只能赋值一次，赋值后不可再改变引用，但对象本身内容可变（如 List 可以 add）。
- **`const`**：编译时常量。比 `final` 更严格，值必须在编译期就确定，整个对象都是不可变的，性能更优。
- **`late`**：延迟初始化。告诉编译器"这个变量稍后一定会赋值"，常用于依赖注入或初始化耗时的场景。
- **`dynamic`**：动态类型，完全跳过编译期类型检查，灵活但不安全，应尽量少用。

```dart
// var：编译器推断类型为 String，后续不可赋值为其他类型
var name = 'Dart';
var age  = 10;
print(name);              // 输出: Dart
print(age);               // 输出: 10
print(name.runtimeType);  // 输出: String

// 显式类型声明，提高可读性
String lang    = 'Dart';
int    version = 3;
double pi      = 3.14159;
bool   isAwesome = true;
print('$lang $version $pi $isAwesome');
// 输出: Dart 3 3.14159 true

// final：运行时常量，只能赋值一次
final String greeting = 'Hello';
// greeting = 'Hi';  // ❌ 编译错误：final 变量不可重赋值

// const：编译时常量，整个对象不可变
const int maxSize = 100;
const List<int> primes = [2, 3, 5, 7, 11];
print(maxSize);  // 输出: 100
print(primes);   // 输出: [2, 3, 5, 7, 11]

// late：声明时不赋值，使用前必须赋值，否则运行时报错
late String lazyValue;
lazyValue = 'initialized later';
print(lazyValue); // 输出: initialized later

// dynamic：完全动态类型，可赋值为任意类型
dynamic anything = 42;
print(anything);            // 输出: 42
anything = 'now a string';  // 可以重新赋为不同类型
print(anything);            // 输出: now a string
anything = [1, 2, 3];
print(anything);            // 输出: [1, 2, 3]
```

### 1.2 内置数据类型

Dart 的所有类型都继承自 `Object`（可空时为 `Object?`）。内置类型包括数字、布尔、字符串、列表、映射、集合、符文和符号。

```dart
// ── 整数 int ──────────────────────────────────────
// int 在 Dart VM 上为 64 位有符号整数，Web 上为 JavaScript number
int a   = 42;
int hex = 0xFF;    // 十六进制字面量
print(a);          // 输出: 42
print(hex);        // 输出: 255

// ── 浮点数 double ─────────────────────────────────
// 64 位 IEEE 754 双精度浮点
double b   = 3.14;
double sci = 1.42e5;             // 科学计数法
double inf = double.infinity;    // 正无穷
double nan = double.nan;         // 非数字
print(b);    // 输出: 3.14
print(sci);  // 输出: 142000.0
print(inf);  // 输出: Infinity
print(nan);  // 输出: NaN

// ── num：int 和 double 的公共父类 ─────────────────
num x = 10;
x = 10.5;   // 可以重新赋为 double
print(x);   // 输出: 10.5

// ── 布尔 bool ─────────────────────────────────────
// Dart 的 bool 只有 true 和 false，非零数字不是 true
bool t = true;
bool f = false;
print(t && f);  // 输出: false（与）
print(t || f);  // 输出: true （或）
print(!t);      // 输出: false（非）

// ── 数字常用方法 ───────────────────────────────────
print(42.isEven);              // 输出: true  （是否偶数）
print(42.isOdd);               // 输出: false （是否奇数）
print(-5.abs());               // 输出: 5     （绝对值）
print(255.toRadixString(16));  // 输出: ff    （转十六进制字符串）
print(3.14.ceil());            // 输出: 4     （向上取整）
print(3.14.floor());           // 输出: 3     （向下取整）
print(3.14.round());           // 输出: 3     （四舍五入）
print(3.7.round());            // 输出: 4
print(3.14.truncate());        // 输出: 3     （截断小数部分）
print(3.14.toStringAsFixed(1)); // 输出: 3.1  （保留指定小数位）

// ── 类型转换 ──────────────────────────────────────
// 字符串 → 数字（解析失败抛 FormatException）
print(int.parse('42'));         // 输出: 42
print(double.parse('3.14'));    // 输出: 3.14

// 安全解析（失败返回 null 而非抛异常）
print(int.tryParse('abc'));     // 输出: null
print(int.tryParse('99'));      // 输出: 99

// 数字 → 字符串
print(42.toString());           // 输出: 42
print(3.14.toInt());            // 输出: 3      （截断，非四舍五入）
print(42.toDouble());           // 输出: 42.0
```

---

## 2. 字符串

Dart 的字符串是 UTF-16 编码的不可变字符序列。支持单引号、双引号、三引号多行字符串，以及原始字符串（`r` 前缀）。字符串插值（`$` 和 `${}`）让拼接变得简洁高效。

### 2.1 字符串定义与插值

```dart
// 单引号和双引号等价，选用对内容更方便的那种
var s1 = 'He said "hello"';   // 内含双引号时用单引号
var s2 = "It's fine";         // 内含单引号时用双引号
print(s1);  // 输出: He said "hello"
print(s2);  // 输出: It's fine

// 字符串插值：$ 直接跟变量名，${} 内可写任意表达式
var name = 'Dart';
print('Hello, $name!');                // 输出: Hello, Dart!
print('Length: ${name.length}');       // 输出: Length: 4
print('Upper: ${name.toUpperCase()}'); // 输出: Upper: DART
print('Sum: ${1 + 2 + 3}');           // 输出: Sum: 6

// 三引号多行字符串：保留换行和缩进
var multiLine = '''
第一行
第二行
第三行
''';
print(multiLine);
// 输出:
// 第一行
// 第二行
// 第三行

// 原始字符串（r 前缀）：反斜杠不被解析为转义字符
// 常用于正则表达式和 Windows 路径
var raw = r'C:\Users\name\Documents';
var regex = r'\d+\.\d+';
print(raw);   // 输出: C:\Users\name\Documents
print(regex); // 输出: \d+\.\d+

// 相邻字符串字面量在编译期自动拼接（不需要 + 号）
var longStr = 'Hello '
              'World '
              'Dart';
print(longStr);  // 输出: Hello World Dart

// + 运算符拼接（运行时）
var s3 = 'Hello' + ', ' + 'Dart!';
print(s3);  // 输出: Hello, Dart!
```

### 2.2 字符串常用方法

字符串方法非常丰富，以下是最常用的分类整理。注意：Dart 字符串是不可变的，所有"修改"方法实际上都返回一个新字符串。

```dart
var s = 'Hello, Dart!';

// ── 基本属性 ──────────────────────────────────────
print(s.length);           // 输出: 12  （字符数量）
print(s.isEmpty);          // 输出: false
print(s.isNotEmpty);       // 输出: true

// ── 大小写转换 ────────────────────────────────────
print(s.toUpperCase());    // 输出: HELLO, DART!
print(s.toLowerCase());    // 输出: hello, dart!

// ── 查找与判断 ────────────────────────────────────
print(s.contains('Dart')); // 输出: true
print(s.startsWith('He')); // 输出: true
print(s.endsWith('!'));    // 输出: true
print(s.indexOf('Dart'));  // 输出: 7   （第一次出现的位置，没有返回 -1）
print(s.lastIndexOf('l')); // 输出: 10  （最后一次出现的位置）

// ── 截取与分割 ────────────────────────────────────
print(s.substring(7));     // 输出: Dart!       （从索引 7 到末尾）
print(s.substring(7, 11)); // 输出: Dart        （索引 7 到 11，不含 11）
print(s.split(', '));      // 输出: [Hello, Dart!]
print('a,b,,c'.split(',')); // 输出: [a, b, , c]（保留空字符串）

// ── 替换 ──────────────────────────────────────────
print(s.replaceAll('l', 'L'));         // 输出: HeLLo, Dart!
print(s.replaceFirst('l', 'L'));       // 输出: HeLlo, Dart!（只替换第一个）
print(s.replaceRange(0, 5, 'Hi'));     // 输出: Hi, Dart!

// ── 去除空白 ──────────────────────────────────────
var padded = '   hello   ';
print(padded.trim());       // 输出: hello（去除两端空白）
print(padded.trimLeft());   // 输出: hello   （只去左边）
print(padded.trimRight());  // 输出:    hello（只去右边）

// ── 填充与重复 ────────────────────────────────────
print('5'.padLeft(3, '0'));    // 输出: 005 （左填充，常用于数字格式化）
print('hi'.padRight(5, '.'));  // 输出: hi...（右填充）
print('ab' * 3);               // 输出: ababab（重复）

// ── 字符操作 ──────────────────────────────────────
// codeUnitAt 返回指定位置的 UTF-16 码元值
print('A'.codeUnitAt(0));       // 输出: 65
print(String.fromCharCode(65)); // 输出: A

// Runes：处理 Unicode 补充字符（如 emoji）
var emoji = '\u{1F600}';   // 需用 \u{} 来表示 emoji
print(emoji);              // 输出: 😀
print(emoji.runes.first);  // 输出: 128512（Unicode 码点）

// ── 比较 ──────────────────────────────────────────
print('abc'.compareTo('abd'));  // 输出: -1（字典序小于）
print('abc'.compareTo('abc'));  // 输出:  0（相等）
print('abd'.compareTo('abc'));  // 输出:  1（字典序大于）
```

---

## 3. 运算符

Dart 的运算符大多与 C/Java 类似，但额外提供了几个非常实用的特有运算符，尤其是与空安全配合的 `?.`、`??`、`??=`，以及对同一对象进行链式操作的级联运算符 `..`。

### 3.1 算术与比较运算符

```dart
// ── 算术运算符 ────────────────────────────────────
print(10 + 3);   // 输出: 13   （加法）
print(10 - 3);   // 输出: 7    （减法）
print(10 * 3);   // 输出: 30   （乘法）
print(10 / 3);   // 输出: 3.33...（除法，结果始终是 double）
print(10 ~/ 3);  // 输出: 3    （整除，结果是 int，舍弃小数部分）
print(10 % 3);   // 输出: 1    （取余/取模）
print(-(10));    // 输出: -10  （一元取反）

// ── 比较运算符 ────────────────────────────────────
// 所有比较运算符都返回 bool
print(1 == 1);   // 输出: true （相等，比较值；对象用 identical() 比较引用）
print(1 != 2);   // 输出: true （不等）
print(3 > 2);    // 输出: true （大于）
print(3 >= 3);   // 输出: true （大于等于）
print(2 < 3);    // 输出: true （小于）
print(2 <= 2);   // 输出: true （小于等于）
```

### 3.2 赋值与复合赋值运算符

```dart
int x = 10;

// 复合赋值：op= 是 x = x op value 的简写
x += 5;   print(x);  // 输出: 15  （等同于 x = x + 5）
x -= 3;   print(x);  // 输出: 12
x *= 2;   print(x);  // 输出: 24
x ~/= 5;  print(x);  // 输出: 4   （整除赋值）
x %= 3;   print(x);  // 输出: 1

// ??= 空值赋值：仅当变量为 null 时才赋值
// 非常适合"惰性初始化"场景
String? cache;
cache ??= computeExpensiveValue();  // 若 cache 为 null，则赋值并缓存
print(cache);  // 输出: expensive result（仅计算一次）
cache ??= 'ignored';  // cache 已有值，不覆盖
print(cache);  // 输出: expensive result
```

### 3.3 逻辑与位运算符

```dart
// ── 逻辑运算符（短路求值）────────────────────────
// && 左侧为 false 时不计算右侧；|| 左侧为 true 时不计算右侧
print(true && false);   // 输出: false
print(true || false);   // 输出: true
print(!true);           // 输出: false

// ── 位运算符（仅用于整数）────────────────────────
print(0x0F & 0xFF);   // 输出: 15  （按位与：0000_1111 & 1111_1111）
print(0x0F | 0xF0);   // 输出: 255 （按位或：0000_1111 | 1111_0000）
print(0x0F ^ 0xFF);   // 输出: 240 （按位异或：0000_1111 ^ 1111_1111）
print(~0x0F);         // 输出: -16 （按位取反，有符号结果）
print(1 << 4);        // 输出: 16  （左移：1 移 4 位）
print(256 >> 4);      // 输出: 16  （右移：256 移 4 位）
print(256 >>> 4);     // 输出: 16  （无符号右移，Dart 2.14+）
```

### 3.4 特殊运算符

这些是 Dart 独有或特别重要的运算符，需要重点掌握。

```dart
// ── 条件表达式（三元运算符）─────────────────────
int score = 85;
String grade = score >= 60 ? 'pass' : 'fail';
print(grade);  // 输出: pass

// condition ? exprIfTrue : exprIfFalse 可以嵌套，但嵌套多层时建议改用 if-else
String level = score >= 90 ? 'A' : score >= 75 ? 'B' : 'C';
print(level);  // 输出: B

// ── 级联运算符 .. 和 ?.. ─────────────────────────
// .. 允许对同一个对象连续调用多个方法或设置多个属性，最终返回该对象本身
// 等价于多次写 sb.xxx()，但无需重复写对象名
var sb = StringBuffer();
sb
  ..write('Hello')
  ..write(', ')
  ..write('Dart!')
  ..writeln();
print(sb.toString());  // 输出: Hello, Dart!\n

// ?.. 空安全级联：对象为 null 时整个级联被跳过
StringBuffer? buffer;
buffer?..write('这行不会执行');  // buffer 为 null，安全跳过
print(buffer);  // 输出: null

// ── 类型检测运算符 ───────────────────────────────
// is：检查对象是否是某类型（包括子类）
print(42 is int);         // 输出: true
print(42 is num);         // 输出: true（int 是 num 的子类）
print(42 is! String);     // 输出: true（is! 是 is 的否定）
print('hi' is Object);    // 输出: true（一切都是 Object）

// as：强制类型转换；若类型不匹配则抛 TypeError
Object obj = 'Hello';
String str = obj as String;
print(str.length);  // 输出: 5
// int wrongCast = obj as int;  // ❌ 运行时抛 TypeError

// ── 展开运算符 ... 和 ...? ───────────────────────
// 将集合内的元素展开插入另一个集合，语法简洁且高效
var list1 = [1, 2, 3];
var list2 = [4, 5, 6];
var merged = [0, ...list1, ...list2, 7];
print(merged);  // 输出: [0, 1, 2, 3, 4, 5, 6, 7]

// ...? 空安全展开：若集合为 null 则跳过，不插入任何元素
List<int>? nullable;
var safe = [0, ...?nullable, 1];
print(safe);    // 输出: [0, 1]
```

---

## 4. 控制流

Dart 的控制流语法与 Java/C++ 类似，但 Dart 3.0 对 `switch` 进行了重大升级：不仅支持 switch 语句，还引入了 switch **表达式**（可直接赋值），并支持模式匹配和守卫条件（`when` 子句）。

### 4.1 if / else

```dart
// 基本 if-else if-else 结构
int score = 75;

if (score >= 90) {
  print('优秀');        // score >= 90 时执行
} else if (score >= 75) {
  print('良好');        // 输出: 良好
} else if (score >= 60) {
  print('及格');
} else {
  print('不及格');
}

// if-case（Dart 3.0+）：结合模式匹配进行条件判断
// 当 value 是 int 类型且大于 0 时，将其绑定到变量 n
Object value = 42;
if (value case int n when n > 0) {
  print('正整数: $n');  // 输出: 正整数: 42
}

// 单行 if（省略花括号）：仅用于简单语句，不推荐
if (score > 60) print('passed');  // 输出: passed
```

### 4.2 switch 语句与表达式

```dart
// ── 传统 switch 语句 ──────────────────────────────
// 每个 case 需要 break（或 return/throw），否则会 fallthrough
// Dart 允许多个 case 标签共享同一个分支（空 case 实现 fallthrough）
String day = 'Mon';
switch (day) {
  case 'Mon':
  case 'Tue':
  case 'Wed':
  case 'Thu':
  case 'Fri':
    print('工作日');  // 输出: 工作日
    break;
  case 'Sat':
  case 'Sun':
    print('周末');
    break;
  default:
    print('未知');
}

// ── Dart 3.0+ switch 表达式 ──────────────────────
// switch 表达式可以直接用在赋值、return 等需要值的地方
// 语法更简洁，不需要 break，用 => 代替 case 体
// _ 是通配符，匹配任何值（相当于 default）
var label = switch (day) {
  'Mon' || 'Tue' || 'Wed' || 'Thu' || 'Fri' => '工作日',  // || 匹配多个值
  'Sat' || 'Sun' => '周末',
  _ => '未知',
};
print(label);  // 输出: 工作日

// switch 表达式支持 when 守卫条件
int n = 15;
var desc = switch (n) {
  int x when x < 0  => '负数',
  0                  => '零',
  int x when x < 10 => '个位数',
  _                  => '10 及以上',   // 输出: 10 及以上
};
print(desc);

// switch 配合类型模式（Dart 3.0+）
// 编译器可以检查是否穷举了所有可能（sealed class 配合使用时）
void classify(Object obj) {
  var result = switch (obj) {
    int i    => '整数: $i',
    double d => '浮点数: $d',
    String s => '字符串: "$s"',
    bool b   => '布尔: $b',
    _        => '其他类型',
  };
  print(result);
}
classify(42);      // 输出: 整数: 42
classify(3.14);    // 输出: 浮点数: 3.14
classify('hi');    // 输出: 字符串: "hi"
classify(true);    // 输出: 布尔: true
classify([1,2]);   // 输出: 其他类型
```

### 4.3 循环

```dart
// ── for 循环（经典三段式）────────────────────────
for (var i = 0; i < 3; i++) {
  print(i);
}
// 输出: 0  1  2

// ── for-in 循环（遍历 Iterable）─────────────────
// 适用于 List、Set、Map.keys 等任何可迭代对象
for (var item in ['a', 'b', 'c']) {
  print(item);
}
// 输出: a  b  c

// 遍历 Map 的 entries，同时获取 key 和 value
var map = {'x': 1, 'y': 2};
for (var entry in map.entries) {
  print('${entry.key}: ${entry.value}');
}
// 输出: x: 1  y: 2

// ── forEach 方法（函数式风格）────────────────────
// 适合简单操作；注意：forEach 内不能使用 break/continue
[1, 2, 3].forEach((n) => print(n * 2));
// 输出: 2  4  6

// ── while 循环：先判断条件，条件满足才执行 ────────
int i = 0;
while (i < 3) {
  print('while: $i');
  i++;
}
// 输出: while: 0  while: 1  while: 2

// ── do-while 循环：先执行一次，再判断条件 ─────────
// 适合"至少执行一次"的场景，如用户输入校验
int j = 0;
do {
  print('do: $j');
  j++;
} while (j < 3);
// 输出: do: 0  do: 1  do: 2

// ── break 和 continue ────────────────────────────
// break：立即退出当前循环
// continue：跳过当前迭代，进入下一次迭代
for (var k = 0; k < 6; k++) {
  if (k == 2) continue;  // 跳过 k == 2
  if (k == 5) break;     // k == 5 时退出整个循环
  print(k);
}
// 输出: 0  1  3  4

// ── 带标签的 break：跳出嵌套循环 ─────────────────
// 标签名紧跟在循环关键字前，break/continue 后接标签名
outer:
for (var row = 0; row < 3; row++) {
  for (var col = 0; col < 3; col++) {
    if (row == 1 && col == 1) break outer;  // 直接退出外层循环
    print('($row, $col)');
  }
}
// 输出: (0,0)  (0,1)  (0,2)  (1,0)
```

---

## 5. 函数

在 Dart 中，函数是一等公民（first-class citizen），意味着函数可以赋值给变量、作为参数传递给另一个函数、从函数中返回。这为函数式编程风格奠定了基础。

### 5.1 基本函数定义

```dart
// 标准函数：指定返回类型和参数类型（推荐）
int add(int a, int b) {
  return a + b;
}
print(add(3, 4));   // 输出: 7

// 箭头函数（Arrow Function）：函数体只有单个表达式时的简写
// => expr 等价于 { return expr; }
int multiply(int a, int b) => a * b;
print(multiply(3, 4));  // 输出: 12

// void 函数：无返回值（也可省略 void，但不推荐）
void greet(String name) {
  print('Hello, $name!');
}
greet('Dart');  // 输出: Hello, Dart!

// 函数是对象：可以赋值给变量
var fn = add;
print(fn(10, 20));          // 输出: 30
print(fn.runtimeType);      // 输出: (int, int) => int

// 函数可以作为参数
int applyTwice(int Function(int) f, int x) => f(f(x));
print(applyTwice((n) => n * 2, 3));  // 输出: 12（3*2=6, 6*2=12）
```

### 5.2 参数类型详解

Dart 函数参数分为三种：位置必需参数、命名参数和位置可选参数，可以灵活组合。

```dart
// ── 位置必需参数（默认）────────────────────────────
// 调用时必须按顺序传入，不能省略
int subtract(int a, int b) => a - b;
print(subtract(10, 3));   // 输出: 7
// subtract(b: 3, a: 10);  // ❌ 位置参数不能用名字

// ── 命名参数（用 {} 包裹）────────────────────────
// 调用时通过 参数名: 值 传入，顺序无关
// required 标注的命名参数必须传，否则编译错误
// 不带 required 的命名参数可选，但需要提供默认值或声明为可空类型
void createUser({
  required String name,        // 必须传
  required int age,            // 必须传
  String role = 'user',        // 可选，有默认值
  String? email,               // 可选，可空类型
}) {
  print('$name ($age) [$role] ${email ?? "无邮箱"}');
}

createUser(name: 'Alice', age: 30);
// 输出: Alice (30) [user] 无邮箱

createUser(name: 'Bob', age: 25, role: 'admin', email: 'bob@example.com');
// 输出: Bob (25) [admin] bob@example.com

// ── 位置可选参数（用 [] 包裹）────────────────────
// 调用时可以按顺序传入，也可以省略；需要提供默认值或声明为可空
String describe(String item, [String? size, int count = 1]) {
  var sizeStr = size != null ? '$size ' : '';
  return '$count x ${sizeStr}$item';
}
print(describe('apple'));                // 输出: 1 x apple
print(describe('apple', 'large'));       // 输出: 1 x large apple
print(describe('apple', 'large', 3));   // 输出: 3 x large apple

// ── 混用规则 ──────────────────────────────────────
// 位置必需参数必须在最前面
// 命名参数用 {}，位置可选参数用 []，二者只能用其中一种
void example(int required, {String? named}) {}     // ✅
void example2(int required, [String? optional]) {} // ✅
// void example3(int req, {String? named}, [int opt]) {} // ❌ 不合法
```

### 5.3 匿名函数、闭包与高阶函数

```dart
// ── 匿名函数（Lambda）────────────────────────────
// 没有名字的函数，常用于传递给高阶函数
var double = (int x) { return x * 2; };
var triple = (int x) => x * 3;    // 箭头简写
print(double(5));   // 输出: 10
print(triple(5));   // 输出: 15

// ── 闭包（Closure）───────────────────────────────
// 闭包是捕获了外部变量的函数。外部函数执行完毕后，被捕获的变量依然存活
// 常见用途：计数器、记忆化（memoization）、工厂模式
Function makeCounter({int start = 0}) {
  int count = start;  // 这个变量被闭包捕获
  return () => ++count;
}
var counter1 = makeCounter();
var counter2 = makeCounter(start: 10);
print(counter1());  // 输出: 1
print(counter1());  // 输出: 2
print(counter2());  // 输出: 11  （独立的 count 变量）
print(counter1());  // 输出: 3   （counter1 的状态不受 counter2 影响）

// 闭包工厂：生成不同参数的函数
Function makeMultiplier(int factor) => (int x) => x * factor;
var double2 = makeMultiplier(2);
var triple2 = makeMultiplier(3);
print(double2(5));  // 输出: 10
print(triple2(5));  // 输出: 15

// ── 高阶函数（Higher-Order Functions）────────────
// 接受函数作为参数，或返回函数的函数
// Dart 的集合类提供了丰富的高阶方法

var nums = [1, 2, 3, 4, 5, 6];

// map：将每个元素转换为新值，返回惰性 Iterable
print(nums.map((n) => n * n).toList());
// 输出: [1, 4, 9, 16, 25, 36]

// where：过滤满足条件的元素（类似 filter）
print(nums.where((n) => n.isEven).toList());
// 输出: [2, 4, 6]

// reduce：将所有元素聚合为单个值（集合不能为空）
print(nums.reduce((acc, n) => acc + n));
// 输出: 21

// fold：带初始值的聚合（比 reduce 更安全，可用于空集合）
print(nums.fold(0, (acc, n) => acc + n));
// 输出: 21
print(nums.fold(1, (acc, n) => acc * n));
// 输出: 720（阶乘：1×2×3×4×5×6）

// any：检查是否存在满足条件的元素（有一个 true 即返回 true）
print(nums.any((n) => n > 5));   // 输出: true
print(nums.any((n) => n > 10));  // 输出: false

// every：检查是否所有元素都满足条件
print(nums.every((n) => n > 0));  // 输出: true
print(nums.every((n) => n > 3));  // 输出: false

// firstWhere / lastWhere：找到第一个/最后一个满足条件的元素
print(nums.firstWhere((n) => n > 3));  // 输出: 4
print(nums.lastWhere((n) => n < 4));   // 输出: 3

// takeWhile / skipWhile：前缀取/跳
print(nums.takeWhile((n) => n < 4).toList());  // 输出: [1, 2, 3]
print(nums.skipWhile((n) => n < 4).toList());  // 输出: [4, 5, 6]

// 链式调用：组合多个操作，形成数据处理管道
var result = nums
    .where((n) => n.isEven)       // 过滤出偶数: [2, 4, 6]
    .map((n) => n * n)             // 平方: [4, 16, 36]
    .where((n) => n > 10)          // 过滤大于 10 的: [16, 36]
    .toList();
print(result);  // 输出: [16, 36]
```

### 5.4 生成器函数

生成器函数用于惰性产生一系列值，避免一次性生成全部数据占用大量内存。

```dart
// ── 同步生成器（sync*）────────────────────────────
// 返回 Iterable，用 yield 逐个产生值
// 优势：惰性求值，只有被消费时才计算下一个值
Iterable<int> range(int start, int end, [int step = 1]) sync* {
  for (var i = start; i <= end; i += step) {
    yield i;  // 每次 yield 暂停函数并产出一个值
  }
}
print(range(1, 5).toList());        // 输出: [1, 2, 3, 4, 5]
print(range(0, 10, 2).toList());    // 输出: [0, 2, 4, 6, 8, 10]

// yield*：将另一个 Iterable 的所有值依次产出（相当于展开）
Iterable<int> concat(Iterable<int> a, Iterable<int> b) sync* {
  yield* a;
  yield* b;
}
print(concat([1, 2], [3, 4]).toList());  // 输出: [1, 2, 3, 4]

// 实际应用：生成斐波那契数列（惰性无限序列）
Iterable<int> fibonacci() sync* {
  var a = 0, b = 1;
  while (true) {
    yield a;
    var next = a + b;
    a = b;
    b = next;
  }
}
// take(10) 只取前 10 个，不会无限循环
print(fibonacci().take(10).toList());
// 输出: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

## 6. 类与面向对象

Dart 是一门真正的面向对象语言，所有值都是对象（包括数字和 null）。Dart 支持单继承、接口（所有类都可作为接口）、Mixin（灵活的代码复用机制）和抽象类。Dart 3.0 进一步引入了密封类（`sealed class`）用于穷举式模式匹配。

### 6.1 基础类定义

```dart
class Person {
  // ── 实例变量（Instance Variables）────────────────
  // 每个实例拥有独立的副本
  String name;
  int age;

  // ── 类变量（静态变量）────────────────────────────
  // 所有实例共享，通过类名访问
  static int totalCount = 0;

  // ── 构造函数参数简写（Initializing Formals）──────
  // this.name 等价于在构造体中写 this.name = name;
  Person(this.name, this.age) {
    totalCount++;
    print('创建了 $name');
  }

  // ── 命名构造函数（Named Constructor）─────────────
  // 用于提供多种创建对象的方式，增强可读性
  Person.anonymous() : name = 'Anonymous', age = 0;

  // 从 Map 创建（常见于 JSON 解析场景）
  Person.fromMap(Map<String, dynamic> map)
      : name = map['name'] as String,
        age  = map['age']  as int;

  // ── 工厂构造函数（Factory Constructor）───────────
  // 不一定创建新对象（可返回缓存），也可用于实现单例
  // factory 构造函数不能访问 this
  factory Person.adult(String name) {
    return Person(name, 18);  // 必须返回 Person 实例（或子类）
  }

  // ── getter：计算属性，像访问字段一样使用 ─────────
  String get info => '$name ($age 岁)';
  bool   get isAdult => age >= 18;

  // ── setter：赋值时执行自定义逻辑（如校验）────────
  set setAge(int val) {
    if (val < 0 || val > 150) throw ArgumentError('年龄不合法: $val');
    age = val;
  }

  // ── 实例方法 ──────────────────────────────────────
  void introduce() {
    print('我是 $name，今年 $age 岁。${isAdult ? "已成年。" : "未成年。"}');
  }

  // ── 静态方法：不能访问实例成员 ────────────────────
  static void showTotal() => print('共创建了 $totalCount 人');

  // ── 重写 toString：print 时自动调用 ───────────────
  @override
  String toString() => 'Person(name: $name, age: $age)';

  // ── 重写 == 和 hashCode：使对象支持值相等比较 ─────
  @override
  bool operator ==(Object other) =>
      other is Person && other.name == name && other.age == age;

  @override
  int get hashCode => Object.hash(name, age);
}

// 使用示例
var p1 = Person('Alice', 30);     // 输出: 创建了 Alice
p1.introduce();   // 输出: 我是 Alice，今年 30 岁。已成年。
print(p1.info);   // 输出: Alice (30 岁)
print(p1);        // 输出: Person(name: Alice, age: 30)

var p2 = Person.fromMap({'name': 'Bob', 'age': 25}); // 输出: 创建了 Bob
var p3 = Person.adult('Charlie');  // 输出: 创建了 Charlie
print(p3.age);    // 输出: 18

Person.showTotal(); // 输出: 共创建了 3 人
print(p1 == Person('Alice', 30));  // 输出: true（值相等）
```

### 6.2 继承（Inheritance）

```dart
// Dart 使用单继承，extends 关键字继承父类
// 子类自动继承父类的所有非私有成员

class Animal {
  String name;
  Animal(this.name);

  // 父类的普通方法（可被子类覆盖）
  void speak() => print('$name: ...');

  @override
  String toString() => '$runtimeType($name)';
}

class Dog extends Animal {
  final String breed;

  // 调用父类构造函数用 super()，在初始化列表中进行
  Dog(String name, this.breed) : super(name);

  // 命名构造 + 父类构造
  Dog.puppy(String name) : breed = 'Mixed', super(name);

  // @override 覆盖父类方法（加注解有助于编译器检查）
  @override
  void speak() => print('$name: Woof! Woof!');

  // super.xxx() 显式调用父类实现
  void fullInfo() {
    super.speak();                     // 调用 Animal.speak
    print('品种: $breed');
  }
}

var dog = Dog('Buddy', 'Labrador');
dog.speak();   // 输出: Buddy: Woof! Woof!
dog.fullInfo();
// 输出: Buddy: ...
// 输出: 品种: Labrador

// 多态：父类引用指向子类对象，调用时使用子类的实现
Animal animal = Dog('Rex', 'Poodle');
animal.speak();          // 输出: Rex: Woof! Woof!（动态分发到 Dog.speak）
print(animal is Dog);    // 输出: true
print(animal is Animal); // 输出: true

// 向下转型
if (animal is Dog) {
  print(animal.breed);  // 输出: Poodle（类型已提升为 Dog）
}
```

### 6.3 抽象类与接口

```dart
// 抽象类：包含抽象方法，不能被直接实例化
// 用于定义一组规范（接口），子类必须实现所有抽象成员
abstract class Shape {
  // 抽象成员：只有声明，没有实现
  double get area;
  double get perimeter;

  // 具体方法：抽象类可以包含有实现的方法
  void describe() {
    print('${runtimeType}: 面积=${area.toStringAsFixed(2)}, '
          '周长=${perimeter.toStringAsFixed(2)}');
  }
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius);

  @override double get area      => 3.14159 * radius * radius;
  @override double get perimeter => 2 * 3.14159 * radius;
}

class Rectangle extends Shape {
  final double width, height;
  Rectangle(this.width, this.height);

  @override double get area      => width * height;
  @override double get perimeter => 2 * (width + height);
}

Circle(5).describe();      // 输出: Circle: 面积=78.54, 周长=31.42
Rectangle(4, 6).describe(); // 输出: Rectangle: 面积=24.00, 周长=20.00

// implements：以另一个类作为接口来实现
// 与 extends 不同，implements 不继承任何实现，必须自己实现所有成员
// 一个类可以 implements 多个接口
class Square implements Shape {
  final double side;
  Square(this.side);

  @override double get area      => side * side;
  @override double get perimeter => 4 * side;
}
Square(5).describe();  // 输出: Square: 面积=25.00, 周长=20.00
```

### 6.4 Mixin

```dart
// Mixin 是一种代码复用机制，可以将一组方法"混入"到类中
// 解决了单继承无法复用多个类功能的问题

mixin Flyable {
  int _altitude = 0;
  void fly() {
    _altitude = 1000;
    print('$runtimeType 正在飞行，高度: ${_altitude}m');
  }
  void land() {
    _altitude = 0;
    print('$runtimeType 已降落');
  }
}

mixin Swimmable {
  void swim() => print('$runtimeType 正在游泳');
}

mixin Singable {
  void sing() => print('$runtimeType 正在唱歌');
}

class Animal { String name; Animal(this.name); }
class Bird   extends Animal with Flyable           { Bird(super.name); }
class Fish   extends Animal with Swimmable         { Fish(super.name); }
class Duck   extends Animal with Flyable, Swimmable, Singable { Duck(super.name); }

Bird('老鹰').fly();    // 输出: Bird 正在飞行，高度: 1000m
Fish('金鱼').swim();   // 输出: Fish 正在游泳
var duck = Duck('唐老鸭');
duck.fly();            // 输出: Duck 正在飞行，高度: 1000m
duck.swim();           // 输出: Duck 正在游泳
duck.sing();           // 输出: Duck 正在唱歌

// on 约束：限制 mixin 只能用于特定类或其子类
mixin Musical on Animal {
  // 可以访问 Animal 的成员（因为约束了 on Animal）
  void sing() => print('${name} 唱起了歌');
}
class Parrot extends Animal with Musical { Parrot(super.name); }
Parrot('鹦鹉').sing();  // 输出: 鹦鹉 唱起了歌
```

### 6.5 密封类（Dart 3.0+）

密封类用 `sealed` 修饰，其所有子类必须在同一个文件中定义。这让编译器能够在 switch 中检查是否穷举了所有可能的子类，从而避免遗漏分支。

```dart
// 密封类常用于表示有限的状态集合（类似 Kotlin sealed class、Rust enum）
sealed class Result<T> {}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final String error;
  final int code;
  const Failure(this.error, this.code);
}

class Loading<T> extends Result<T> {
  const Loading();
}

// 处理 Result：编译器检查穷举性，若漏写某个子类会警告
String handleResult(Result<int> result) => switch (result) {
  Success(data: var d) => '成功，数据: $d',
  Failure(error: var e, code: var c) => '失败[$c]: $e',
  Loading() => '加载中...',
};

print(handleResult(Success(42)));            // 输出: 成功，数据: 42
print(handleResult(Failure('Not Found', 404))); // 输出: 失败[404]: Not Found
print(handleResult(Loading()));              // 输出: 加载中...
```

---

## 7. 集合类型

Dart 的集合系统丰富而强大，核心类型有三种：`List`（有序列表）、`Map`（键值映射）、`Set`（无重复集合）。三者都支持泛型、字面量语法、以及 collection `if`/`for` 等编译时构建特性。

### 7.1 List（有序列表）

```dart
// ── 创建 List ─────────────────────────────────────
var list  = [1, 2, 3];           // 字面量，类型推断为 List<int>
var typed = <int>[1, 2, 3];      // 显式指定元素类型
var empty = <String>[];          // 空列表

// fixed-length：固定长度（不能 add/remove），适合性能敏感场景
var fixed = List<int>.filled(3, 0);      // [0, 0, 0]
print(fixed);  // 输出: [0, 0, 0]

// generate：用函数生成元素
var gen = List<int>.generate(5, (i) => i * i);
print(gen);   // 输出: [0, 1, 4, 9, 16]

// ── 增删操作 ──────────────────────────────────────
var fruits = ['apple', 'banana'];
fruits.add('cherry');                 // 末尾添加一个
fruits.addAll(['date', 'elderberry']); // 末尾添加多个
fruits.insert(0, 'avocado');          // 指定位置插入
print(fruits);
// 输出: [avocado, apple, banana, cherry, date, elderberry]

fruits.remove('banana');     // 移除第一个匹配的元素（按值）
fruits.removeAt(0);          // 移除指定索引的元素
fruits.removeWhere((f) => f.length > 6);  // 移除所有满足条件的元素
print(fruits);  // 输出: [apple, date]（cherry/elderberry 长度 > 6 被删除）

// ── 查询与访问 ────────────────────────────────────
var nums = [3, 1, 4, 1, 5, 9, 2, 6];
print(nums.length);           // 输出: 8
print(nums.isEmpty);          // 输出: false
print(nums.first);            // 输出: 3
print(nums.last);             // 输出: 6
print(nums[2]);               // 输出: 4  （索引访问，从 0 开始）
print(nums.contains(5));      // 输出: true
print(nums.indexOf(1));       // 输出: 1  （第一次出现的索引）
print(nums.lastIndexOf(1));   // 输出: 3  （最后一次出现的索引）
print(nums.sublist(2, 5));    // 输出: [4, 1, 5]  （子列表，不含末索引）

// ── 排序 ──────────────────────────────────────────
var sorted = [...nums]..sort();  // 复制后升序排序
print(sorted);  // 输出: [1, 1, 2, 3, 4, 5, 6, 9]

// 自定义排序：降序
sorted.sort((a, b) => b.compareTo(a));
print(sorted);  // 输出: [9, 6, 5, 4, 3, 2, 1, 1]

// 按对象属性排序
var people = [('Alice', 30), ('Bob', 25), ('Charlie', 35)];
people.sort((a, b) => a.$2.compareTo(b.$2));  // 按年龄升序
print(people.map((p) => p.$1).toList());  // 输出: [Bob, Alice, Charlie]

// ── 集合构建语法 ──────────────────────────────────
// collection if：条件添加元素
bool includeExtra = true;
var conditional = [1, 2, if (includeExtra) 3, if (!includeExtra) 99];
print(conditional);  // 输出: [1, 2, 3]

// collection for：循环生成元素
var squares = [for (var i = 1; i <= 5; i++) i * i];
print(squares);  // 输出: [1, 4, 9, 16, 25]

// 展开运算符：合并多个列表
var a = [1, 2, 3];
var b = [4, 5, 6];
var merged = [...a, 0, ...b];
print(merged);  // 输出: [1, 2, 3, 0, 4, 5, 6]
```

### 7.2 Map（键值映射）

```dart
// ── 创建 Map ──────────────────────────────────────
var map  = {'name': 'Dart', 'version': 3};  // 字面量
var typed = <String, int>{'a': 1, 'b': 2};   // 显式类型
var empty = <String, dynamic>{};              // 空 Map

// ── 增删改查 ──────────────────────────────────────
map['author'] = 'Google';            // 新增键值对
map['version'] = 4;                  // 修改已有键的值
print(map);  // 输出: {name: Dart, version: 4, author: Google}

map.remove('author');                // 删除指定键
print(map.containsKey('name'));      // 输出: true
print(map.containsValue(4));        // 输出: true

print(map['name']);                  // 输出: Dart
print(map['missing']);               // 输出: null（键不存在时返回 null）

// 安全访问：提供默认值
print(map['missing'] ?? 'default'); // 输出: default

// ── 遍历 ──────────────────────────────────────────
// forEach 同时拿到 key 和 value
map.forEach((k, v) => print('$k: $v'));
// 输出: name: Dart  version: 4

// for-in 遍历 entries（MapEntry 对象）
for (var entry in map.entries) {
  print('${entry.key} => ${entry.value}');
}

// 只遍历 keys 或 values
print(map.keys.toList());    // 输出: [name, version]
print(map.values.toList());  // 输出: [Dart, 4]

// ── 高级操作 ──────────────────────────────────────
// putIfAbsent：键不存在时才插入（避免覆盖已有值）
map.putIfAbsent('lang', () => 'Dart');
print(map['lang']);  // 输出: Dart

// update：更新已有键的值（键不存在时可提供 ifAbsent 函数）
map.update('version', (v) => (v as int) + 1);
print(map['version']);  // 输出: 5

// map 转换：创建新 Map，每个 entry 通过函数转换
var upper = map.map((k, v) => MapEntry(k.toUpperCase(), v.toString()));
print(upper);  // 输出: {NAME: Dart, VERSION: 5, LANG: Dart}

// 从两个 List 构造 Map
var keys   = ['a', 'b', 'c'];
var values = [1, 2, 3];
var zipped = Map.fromIterables(keys, values);
print(zipped);  // 输出: {a: 1, b: 2, c: 3}
```

### 7.3 Set（不重复集合）

```dart
// ── 创建 Set ──────────────────────────────────────
// 注意：{} 是空 Map 的字面量，空 Set 需要 <Type>{} 或 Set()
var s1 = {1, 2, 3};                // 字面量，自动去重
var s2 = <String>{};               // 空 Set
var s3 = Set.from([1, 2, 2, 3, 3]); // 从列表构造，自动去重
print(s3);  // 输出: {1, 2, 3}

// ── 增删操作 ──────────────────────────────────────
s1.add(4);
s1.addAll([5, 5, 6]);  // 重复元素会被忽略
print(s1);  // 输出: {1, 2, 3, 4, 5, 6}
s1.remove(1);
print(s1.contains(2));  // 输出: true

// ── 集合运算 ──────────────────────────────────────
var a = {1, 2, 3, 4};
var b = {3, 4, 5, 6};

print(a.union(b));          // 输出: {1, 2, 3, 4, 5, 6}  （并集：所有元素）
print(a.intersection(b));   // 输出: {3, 4}               （交集：共有元素）
print(a.difference(b));     // 输出: {1, 2}               （差集：a 有 b 没有的）
print(b.difference(a));     // 输出: {5, 6}               （差集：b 有 a 没有的）
print(a.isSubsetOf({1,2,3,4,5}));   // 输出: true（a 是否是子集）
print(a.isSupersetOf({1,2}));        // 输出: true（a 是否是超集）
```

---

## 8. 空安全

Dart 2.12 引入了健全的空安全（Sound Null Safety）系统，这是 Dart 语言最重要的特性之一。它将空指针错误从运行时提前到编译时检测，从根本上消除了 `Null was not expected` 这类运行时崩溃。

**核心思想**：类型默认不可为空。`String` 永远不会是 null；只有 `String?` 才可能为 null。这与大多数语言（Java/Kotlin/Swift 等）中的 Optional 概念类似。

### 8.1 可空类型基础

```dart
// 非空类型（默认）：编译器保证这些变量不会是 null
String  nonNull = 'must have a value';
int     count   = 42;
// nonNull = null;  // ❌ 编译错误：String 类型不能为 null

// 可空类型（? 后缀）：可以持有该类型的值或 null
String? nullable = null;     // ✅ 合法
print(nullable);              // 输出: null
nullable = 'now has value';
print(nullable);              // 输出: now has value

int?   maybeInt;             // 未初始化的可空变量默认为 null
print(maybeInt);              // 输出: null
```

### 8.2 空安全操作符

这些操作符让处理可空值变得简洁而安全，是空安全体系的核心工具。

```dart
String? s;

// ── ?. 条件成员访问 ───────────────────────────────
// s?.length：若 s 为 null，整个表达式返回 null；否则返回 s.length
// 避免了手动 if (s != null) 判断，链式调用时特别方便
print(s?.length);          // 输出: null（s 为 null，短路）
print(s?.toUpperCase());   // 输出: null

s = 'hello';
print(s?.length);          // 输出: 5（s 非 null，正常访问）

// 链式条件访问
class Address { String? city; }
class User    { Address? address; }
var user = User();
print(user.address?.city?.toUpperCase());  // 输出: null（任一为 null 则短路）

// ── ?? 空值合并运算符 ──────────────────────────────
// 若左侧为 null，使用右侧的默认值；否则使用左侧的值
String? name;
print(name ?? 'Anonymous');  // 输出: Anonymous（name 为 null）
name = 'Dart';
print(name ?? 'Anonymous');  // 输出: Dart（name 非 null，忽略右侧）

// 可以链式使用
String? a, b;
String c = a ?? b ?? 'default';
print(c);  // 输出: default

// ── ??= 空值赋值运算符 ────────────────────────────
// 仅当变量为 null 时才赋值，已有值时不覆盖
// 常用于缓存初始化
String? cache;
cache ??= 'first assignment';
print(cache);  // 输出: first assignment
cache ??= 'second assignment';  // cache 已非 null，忽略
print(cache);  // 输出: first assignment

// ── ! 非空断言运算符 ──────────────────────────────
// 告诉编译器"我确定这不是 null"，若运行时为 null 则抛出 Null check operator
// 谨慎使用，尽量用 ?? 或 if 检查代替
String? value = 'hello';
print(value!.length);   // 输出: 5（断言非 null，正常访问）

// ── late 延迟初始化 ───────────────────────────────
// 声明时不初始化，但向编译器承诺使用前一定会赋值
// 常用于 init() 方法中的初始化，或依赖注入场景
late String database;
// print(database);  // 若此时访问会抛运行时错误
database = 'connected';
print(database);  // 输出: connected

// late final：只能赋值一次，之后不可修改
late final int expensiveResult;
expensiveResult = 6 * 7;
print(expensiveResult);  // 输出: 42
// expensiveResult = 99;  // ❌ 已赋值的 late final 不可再赋值
```

### 8.3 类型提升（Type Promotion）

Dart 的流敏感类型分析能够在代码控制流中自动将可空类型"提升"为非空类型，无需手动转型，非常便利。

```dart
// ── if 检查后自动提升 ─────────────────────────────
String? value = getValue();

if (value != null) {
  // 此处编译器知道 value 不为 null，类型从 String? 提升为 String
  print(value.length);       // ✅ 直接访问，无需 value?.length
  print(value.toUpperCase()); // ✅
}

// ── 早返回模式（Guard Clause）────────────────────
// 非常推荐的写法：在函数开头检查 null，之后无需重复判断
void processUser(String? username, int? age) {
  if (username == null) return;  // 提前返回
  if (age == null) return;
  // 此后 username 和 age 都已提升为非空类型
  print('${username.toUpperCase()} 是 $age 岁');
}
processUser(null, 30);     // 无输出
processUser('dart', null); // 无输出
processUser('dart', 10);   // 输出: DART 是 10 岁

// ── is 检查触发类型提升 ───────────────────────────
Object obj = 'Hello, Dart!';
if (obj is String) {
  // obj 已从 Object 提升为 String
  print(obj.split(', '));  // 输出: [Hello, Dart!]
}

// ── pattern 匹配触发类型提升（Dart 3.0+）─────────
Object x = 42;
if (x case int n when n > 0) {
  print('正整数: ${n.isEven ? "偶" : "奇"}');  // 输出: 正整数: 偶
}
```

---

## 9. 泛型

泛型（Generics）允许我们编写与类型无关的通用代码，同时保留类型安全。Dart 的泛型是具体化的（reified），即运行时依然携带类型信息，与 Java 的类型擦除不同。

### 9.1 泛型类

```dart
// 泛型容器：T 是类型参数，调用时用实际类型替换
class Box<T> {
  T _value;
  Box(this._value);

  T get value => _value;
  set value(T v) => _value = v;

  // 泛型方法：可以有自己独立的类型参数 R
  Box<R> transform<R>(R Function(T) mapper) => Box(mapper(_value));

  bool contains(T item) => _value == item;

  @override
  String toString() => 'Box<$T>($_value)';
}

var strBox = Box<String>('hello');
print(strBox);               // 输出: Box<String>(hello)
print(strBox.contains('hello')); // 输出: true

var intBox = Box<int>(21);
var doubled = intBox.transform<int>((n) => n * 2);
print(doubled);              // 输出: Box<int>(42)

// 转换成不同类型
var strFromInt = intBox.transform<String>((n) => 'value is $n');
print(strFromInt);           // 输出: Box<String>(value is 21)

// ── 泛型约束（Bounded Type Parameters）──────────
// extends 限制类型参数必须是某类型或其子类型
// 约束后可以在泛型代码中使用该类型的方法
class NumericBox<T extends num> {
  T value;
  NumericBox(this.value);

  T doubled() => (value * 2) as T;
  bool isPositive() => value > 0;
  T clamp(T min, T max) => value.clamp(min, max) as T;
}

var intNb = NumericBox<int>(5);
print(intNb.doubled());       // 输出: 10
print(intNb.isPositive());    // 输出: true
print(intNb.clamp(0, 3));     // 输出: 3

var doubleNb = NumericBox<double>(3.14);
print(doubleNb.doubled());    // 输出: 6.28

// NumericBox<String>('hi');  // ❌ 编译错误：String 不是 num 的子类
```

### 9.2 泛型函数与多类型参数

```dart
// 泛型函数：函数自身带类型参数
T identity<T>(T value) => value;
print(identity<int>(42));       // 输出: 42
print(identity<String>('hi'));  // 输出: hi
print(identity([1, 2, 3]));     // 输出: [1, 2, 3]（类型推断）

// 多类型参数
class Pair<A, B> {
  final A first;
  final B second;
  const Pair(this.first, this.second);

  // 交换两个元素的类型和值
  Pair<B, A> swap() => Pair(second, first);

  @override
  String toString() => '($first, $second)';
}

var pair = Pair<String, int>('age', 30);
print(pair);          // 输出: (age, 30)
print(pair.swap());   // 输出: (30, age)

// 泛型函数结合集合
List<T> repeat<T>(T value, int count) =>
    List.generate(count, (_) => value);

print(repeat('x', 4));   // 输出: [x, x, x, x]
print(repeat(0, 3));     // 输出: [0, 0, 0]
```

---

## 10. 扩展方法与扩展类型

Dart 提供了两种在不修改原始类的情况下扩展其功能的机制：`extension`（扩展方法，可访问实例）和 `extension type`（扩展类型，零运行时开销的类型包装）。

### 10.1 扩展方法（Extension Methods）

```dart
// 扩展 String：添加业务相关的实用方法
extension StringUtils on String {
  // getter 扩展
  bool get isPalindrome {
    var s = toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
    return s == s.split('').reversed.join();
  }

  // 方法扩展
  String capitalize() =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1).toLowerCase()}';

  String truncate(int maxLen, {String ellipsis = '...'}) =>
      length <= maxLen ? this : '${substring(0, maxLen)}$ellipsis';

  bool get isEmail => RegExp(r'^[\w.-]+@[\w-]+\.\w+$').hasMatch(this);
}

print('racecar'.isPalindrome);         // 输出: true
print('hello world'.isPalindrome);     // 输出: false
print('hello world'.capitalize());    // 输出: Hello world
print('Hello, Dart!'.truncate(7));    // 输出: Hello, ...
print('user@example.com'.isEmail);    // 输出: true
print('not-an-email'.isEmail);        // 输出: false

// 扩展 int：添加数学工具方法
extension IntUtils on int {
  bool get isPrime {
    if (this < 2) return false;
    for (var i = 2; i * i <= this; i++) {
      if (this % i == 0) return false;
    }
    return true;
  }

  // 生成 [this, end] 范围的整数列表
  List<int> to(int end) =>
      List.generate((end - this).abs() + 1, (i) => this <= end ? this + i : this - i);

  // 重复执行某个操作 n 次
  void times(void Function(int i) action) {
    for (var i = 0; i < this; i++) action(i);
  }
}

print(7.isPrime);        // 输出: true
print(10.isPrime);       // 输出: false
print(1.to(5));          // 输出: [1, 2, 3, 4, 5]
print(5.to(1));          // 输出: [5, 4, 3, 2, 1]
3.times((i) => print('第 ${i+1} 次'));
// 输出: 第 1 次  第 2 次  第 3 次

// 泛型扩展 List
extension ListUtils<T> on List<T> {
  T get second => this[1];
  List<T> get shuffledCopy => [...this]..shuffle();
  List<List<T>> chunked(int size) {
    return [for (var i = 0; i < length; i += size) sublist(i, (i + size).clamp(0, length))];
  }
}

print([10, 20, 30, 40].second);               // 输出: 20
print([1, 2, 3, 4, 5].chunked(2));            // 输出: [[1, 2], [3, 4], [5]]
```

### 10.2 扩展类型（Extension Types，Dart 3.3+）

扩展类型提供了零运行时开销的类型包装。与普通类不同，扩展类型在运行时会被直接转换为其底层类型，因此没有任何性能损耗，但在编译期提供了完整的类型安全。

```dart
// 使用扩展类型为不同单位的数值添加类型区分
// 防止将"米"和"千克"的数值混用（否则两者都是 double）
extension type Meters(double value) implements double {
  Meters operator +(Meters other) => Meters(value + other.value);
  Meters operator -(Meters other) => Meters(value - other.value);
  Meters operator *(double factor) => Meters(value * factor);
  String get display => '${value.toStringAsFixed(2)}m';
}

extension type Kilograms(double value) implements double {
  String get display => '${value.toStringAsFixed(2)}kg';
}

var dist1 = Meters(1.5);
var dist2 = Meters(2.8);
var total = dist1 + dist2;
print(total.display);   // 输出: 4.30m

// 类型安全：不同单位之间无法混用
// Meters m = Kilograms(10); // ❌ 编译错误
// var wrong = dist1 + Kilograms(5); // ❌ 编译错误

// 运行时：扩展类型与底层类型完全等价
// print(total == 4.3);  // ✅ 因为 implements double，可以比较
```

---

## 11. 模式匹配与解构（Dart 3.0+）

Dart 3.0 引入了完整的模式匹配系统，这是语言历史上最大的一次语法扩展。模式（Pattern）可以在 switch、if-case、变量声明、for 循环等多处使用，支持类型匹配、解构、守卫条件等功能。

### 11.1 switch 模式匹配

```dart
// ── 字面量模式（Literal Pattern）────────────────
// 匹配特定的常量值
Object val = 42;
var r = switch (val) {
  0    => '零',
  1    => '一',
  42   => '宇宙的答案',  // 输出: 宇宙的答案
  _    => '其他',
};
print(r);

// ── 类型模式（Type Pattern）──────────────────────
// 匹配特定类型，并自动将变量绑定为该类型（类型提升）
void describeValue(Object obj) {
  switch (obj) {
    case int n when n < 0:
      print('负整数: $n');
    case int n:
      print('非负整数: $n');
    case double d:
      print('浮点数: ${d.toStringAsFixed(2)}');
    case String s when s.isEmpty:
      print('空字符串');
    case String s:
      print('字符串: "$s" (长度 ${s.length})');
    case List<int> list:
      print('整数列表，共 ${list.length} 个元素');
    case null:
      print('null 值');
    default:
      print('未知类型: ${obj.runtimeType}');
  }
}

describeValue(-5);        // 输出: 负整数: -5
describeValue(42);        // 输出: 非负整数: 42
describeValue(3.14159);   // 输出: 浮点数: 3.14
describeValue('');        // 输出: 空字符串
describeValue('Dart');    // 输出: 字符串: "Dart" (长度 4)
describeValue([1, 2, 3]); // 输出: 整数列表，共 3 个元素

// ── 或模式（Or Pattern）── 用 | 匹配多个值 ────────
var day = 'Sat';
var type = switch (day) {
  'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' => '工作日',
  'Sat' | 'Sun' => '周末',  // 输出: 周末
  _ => '无效日期',
};
print(type);

// ── 守卫条件（Guard Clause）── when ───────────────
// 在模式匹配成功的基础上，额外附加布尔条件
var numbers = [1, -2, 3, -4, 5];
for (var n in numbers) {
  switch (n) {
    case int x when x > 0:
      print('$x 是正数');
    case int x when x < 0:
      print('$x 是负数');
    case 0:
      print('零');
  }
}
// 输出: 1 是正数  -2 是负数  3 是正数  -4 是负数  5 是正数
```

### 11.2 解构（Destructuring）

解构允许将复合数据结构的值"拆包"并绑定到变量，让代码更简洁清晰。

```dart
// ── Record 解构 ──────────────────────────────────
var (x, y) = (10, 20);
print('x=$x, y=$y');  // 输出: x=10, y=20

var (name: userName, age: userAge) = (name: 'Dart', age: 10);
print('$userName: $userAge');  // 输出: Dart: 10

// ── List 解构 ──────────────────────────────────────
// 精确匹配：列表元素数量必须和模式一致
var [a, b, c] = [1, 2, 3];
print('$a $b $c');  // 输出: 1 2 3

// 剩余模式 ...：捕获剩余元素为列表
var [first, ...rest] = [1, 2, 3, 4, 5];
print('first=$first, rest=$rest');  // 输出: first=1, rest=[2, 3, 4, 5]

// 捕获头尾，中间剩余
var [head, ...middle, tail] = [1, 2, 3, 4, 5];
print('head=$head, tail=$tail, middle=$middle');
// 输出: head=1, tail=5, middle=[2, 3, 4]

// 忽略某些元素（用 _ 占位符）
var [_, second, _, fourth] = [10, 20, 30, 40];
print('$second $fourth');  // 输出: 20 40

// ── Map 解构 ──────────────────────────────────────
var {'name': n, 'age': a} = {'name': 'Alice', 'age': 30, 'city': 'BJ'};
print('$n 今年 $a 岁');  // 输出: Alice 今年 30 岁（city 被忽略）

// ── 对象解构 ──────────────────────────────────────
class Point {
  final double x, y;
  const Point(this.x, this.y);
}

var p = Point(3.0, 4.0);

// 对象模式：ClassName(field: variable, ...)
var Point(x: px, y: py) = p;
print('($px, $py)');  // 输出: (3.0, 4.0)

// 简写：当变量名与字段名相同时
var Point(:x, :y) = p;   // 等价于 Point(x: x, y: y)
print('($x, $y)');        // 输出: (3.0, 4.0)

// 在 switch 中对对象解构并加守卫条件
switch (p) {
  case Point(x: 0.0, y: 0.0):
    print('原点');
  case Point(:var x, y: 0.0):
    print('X 轴上，x=$x');
  case Point(x: var px, y: var py) when px == py:
    print('对角线上，($px, $py)');
  case Point(:var x, :var y):
    print('一般点 ($x, $y)');  // 输出: 一般点 (3.0, 4.0)
}

// ── 嵌套解构 ─────────────────────────────────────
var [(a1, b1), (a2, b2)] = [(1, 2), (3, 4)];
print('($a1,$b1) ($a2,$b2)');  // 输出: (1,2) (3,4)
```

---

## 12. Record 类型（Dart 3.0+）

Record 是 Dart 3.0 引入的匿名、不可变的复合值类型。与 `List` 或 `Map` 不同，Record 的结构（字段数量和类型）在编译期固定，因此具有完整的类型安全。Record 最常见的用途是让函数返回多个值。

```dart
// ── 创建 Record ───────────────────────────────────
// 位置 Record：用 () 包裹多个值
var point = (3, 4);
print(point);      // 输出: (3, 4)
print(point.$1);   // 输出: 3   （位置访问，从 $1 开始）
print(point.$2);   // 输出: 4

// 命名 Record：字段有名字，访问更清晰
var user = (name: 'Alice', age: 30);
print(user);       // 输出: (name: Alice, age: 30)
print(user.name);  // 输出: Alice
print(user.age);   // 输出: 30

// 混合 Record：既有位置字段，也有命名字段
var mixed = ('point', x: 1.0, y: 2.0);
print(mixed.$1);   // 输出: point（位置字段用 $n）
print(mixed.x);    // 输出: 1.0
print(mixed.y);    // 输出: 2.0

// ── 类型标注 ──────────────────────────────────────
(int, String) pair = (1, 'hello');
({String name, int age}) person = (name: 'Dart', age: 10);

// ── 函数返回多个值（最典型的用途）────────────────
// 以前只能用 List、Map 或自定义类；现在 Record 更简洁类型安全
(int quotient, int remainder) divmod(int a, int b) {
  return (a ~/ b, a % b);
}

var (q, r) = divmod(17, 5);
print('17 ÷ 5 = $q 余 $r');  // 输出: 17 ÷ 5 = 3 余 2

// 命名字段更清晰
({double min, double max, double avg}) stats(List<double> data) {
  data.sort();
  return (
    min: data.first,
    max: data.last,
    avg: data.reduce((a, b) => a + b) / data.length,
  );
}

var result = stats([3.0, 1.0, 4.0, 1.5, 9.0, 2.6]);
print('min=${result.min}, max=${result.max}, avg=${result.avg.toStringAsFixed(2)}');
// 输出: min=1.0, max=9.0, avg=3.52

// ── Record 相等（结构相等）───────────────────────
// 两个 Record 相等当且仅当类型、字段名和值都相等
print((1, 'a') == (1, 'a'));   // 输出: true
print((x: 1) == (x: 1));      // 输出: true
print((x: 1) == (y: 1));      // 输出: false（字段名不同）
print((1, 2) == (2, 1));      // 输出: false（值顺序不同）

// ── 在集合中使用 Record ───────────────────────────
var coords = [(0, 0), (1, 2), (3, 4), (5, 6)];
for (var (x, y) in coords) {
  var dist = (x * x + y * y);
  print('($x,$y) 距原点²=$dist');
}
// 输出:
// (0,0) 距原点²=0
// (1,2) 距原点²=5
// (3,4) 距原点²=25
// (5,6) 距原点²=61
```

---

## 13. 异步编程

Dart 使用事件循环（Event Loop）实现非阻塞异步编程。`Future` 代表一个未来会完成的单个异步操作，`Stream` 代表随时间产生的一系列异步事件。`async/await` 让异步代码看起来像同步代码，大大提高了可读性。

### 13.1 Future 与 async/await

```dart
import 'dart:async';

// ── 声明异步函数 ──────────────────────────────────
// async 函数始终返回 Future，即使函数体是同步的
// 返回类型 Future<T> 中的 T 是实际值的类型
Future<String> fetchUserName(int id) async {
  // await：暂停当前函数等待 Future 完成，但不阻塞整个程序
  await Future.delayed(Duration(milliseconds: 100));  // 模拟网络请求
  if (id <= 0) throw ArgumentError('无效的用户 ID: $id');
  return 'User_$id';
}

Future<int> fetchScore(String user) async {
  await Future.delayed(Duration(milliseconds: 50));
  return user.length * 10;  // 模拟计算
}

// ── 使用 async/await ─────────────────────────────
void main() async {
  // 顺序等待（适合有依赖关系的操作）
  var name  = await fetchUserName(1);
  var score = await fetchScore(name);
  print('$name 的分数: $score');
  // 输出: User_1 的分数: 60

  // ── 并行等待（适合互相独立的操作，节省时间）─────
  // Future.wait 同时启动所有 Future，等待全部完成
  var results = await Future.wait([
    fetchUserName(1),
    fetchUserName(2),
    fetchUserName(3),
  ]);
  print(results);  // 输出: [User_1, User_2, User_3]

  // ── 取最先完成的 ──────────────────────────────
  var fastest = await Future.any([
    Future.delayed(Duration(seconds: 2), () => 'slow server'),
    Future.delayed(Duration(milliseconds: 10), () => 'fast server'),
  ]);
  print(fastest);  // 输出: fast server

  // ── 立即完成的 Future ─────────────────────────
  var immediate = await Future.value(42);
  print(immediate);  // 输出: 42
}

// ── then/catchError 链式 API ─────────────────────
// 适合不想用 async/await 的场景，或需要链式转换的场景
fetchUserName(1)
  .then((name) {
    print('获取到用户名: $name');  // 输出: 获取到用户名: User_1
    return fetchScore(name);
  })
  .then((score) => print('分数: $score'))   // 输出: 分数: 60
  .catchError((e) => print('错误: $e'))
  .whenComplete(() => print('请求完毕'));   // 输出: 请求完毕
```

### 13.2 Stream

```dart
// ── async* 创建 Stream ────────────────────────────
// async* 函数是异步生成器，用 yield 产生事件，用 yield* 委托另一个 Stream
Stream<int> ticker(int from, int to) async* {
  for (var i = from; i <= to; i++) {
    await Future.delayed(Duration(milliseconds: 100));
    yield i;  // 每隔 100ms 产生一个数字
  }
}

// ── await for 消费 Stream ─────────────────────────
Future<void> consumeStream() async {
  await for (var n in ticker(1, 5)) {
    print('收到: $n');
  }
  print('Stream 已完成');
}
// 输出: 收到: 1  收到: 2  收到: 3  收到: 4  收到: 5  Stream 已完成

// ── Stream 变换操作 ──────────────────────────────
// Stream 也支持 map、where、take 等操作（与 Iterable 类似）
Stream<String> processed = ticker(1, 10)
    .where((n) => n.isOdd)          // 只要奇数: 1,3,5,7,9
    .map((n) => 'item_$n')          // 转换: item_1, item_3...
    .take(3);                        // 只取前 3 个: item_1, item_3, item_5

processed.listen((s) => print(s));
// 输出: item_1  item_3  item_5

// ── StreamController：手动控制 Stream ────────────
// 适合需要在外部往 Stream 推送数据的场景
var controller = StreamController<String>();

// 订阅 Stream
controller.stream.listen(
  (data) => print('收到: $data'),         // 每次有数据时调用
  onError: (e) => print('错误: $e'),      // 发生错误时调用
  onDone: () => print('Stream 关闭了'),   // Stream 关闭时调用
);

// 向 Stream 推送数据
controller.sink.add('消息 1');   // 输出: 收到: 消息 1
controller.sink.add('消息 2');   // 输出: 收到: 消息 2
controller.sink.addError('出错了'); // 输出: 错误: 出错了
controller.close();               // 输出: Stream 关闭了

// ── 广播 Stream（Broadcast Stream）──────────────
// 普通 Stream 只允许一个监听者；广播 Stream 允许多个监听者
var broadcast = StreamController<int>.broadcast();

broadcast.stream.listen((n) => print('监听者 1: $n'));
broadcast.stream.listen((n) => print('监听者 2: $n'));

broadcast.sink.add(42);
// 输出: 监听者 1: 42
// 输出: 监听者 2: 42
```

---

## 14. 异常处理

Dart 的异常分为两类：`Exception`（可预期的运行时错误，应该被捕获处理）和 `Error`（编程错误，通常不应该被捕获）。Dart 允许抛出任意对象（包括字符串），但最佳实践是使用 `Exception` 或 `Error` 的子类。

### 14.1 基础异常处理

```dart
// ── try / on / catch / finally ───────────────────
// on：按类型捕获，不需要异常对象
// catch：获取异常对象（第一个参数）和栈跟踪（第二个参数，可选）
// finally：无论是否发生异常都会执行（常用于资源释放）

void riskyOperation(int n) {
  switch (n) {
    case 0: throw FormatException('数字不能为零', 'input=$n');
    case -1: throw RangeError.range(n, 0, 100, '参数 n');
    case -2: throw ArgumentError.notNull('n');
    default: print('结果: ${100 / n}');
  }
}

for (var i in [5, 0, -1, -2]) {
  try {
    riskyOperation(i);
  } on FormatException catch (e) {
    // 捕获特定类型：FormatException
    print('格式异常: ${e.message}（来源: ${e.source}）');
  } on RangeError catch (e) {
    print('范围异常: ${e.message}');
  } catch (e, stackTrace) {
    // 兜底捕获所有未处理的异常类型
    // stackTrace 包含完整的调用栈信息（调试时非常有用）
    print('未知异常: $e');
    // print(stackTrace);  // 打印完整栈跟踪
  } finally {
    // 始终执行：适合关闭文件、释放数据库连接等清理工作
    print('--- 处理完毕 ---');
  }
}
// 输出:
// 结果: 20.0  --- 处理完毕 ---
// 格式异常: 数字不能为零（来源: input=0）  --- 处理完毕 ---
// 范围异常: RangeError (index): ...  --- 处理完毕 ---
// 未知异常: Invalid argument (n): ...  --- 处理完毕 ---

// ── rethrow：重新抛出 ─────────────────────────────
// 捕获异常后做些记录，然后将其原封不动地继续向上抛出
// 注意：rethrow 不会重置栈跟踪（与 throw e 不同）
void withLogging(void Function() fn) {
  try {
    fn();
  } catch (e) {
    print('[LOG] 捕获到异常: ${e.runtimeType}');
    rethrow;  // 继续向上传播，让调用者处理
  }
}
```

### 14.2 自定义异常体系

```dart
// 自定义异常类：实现 Exception 接口即可
// 通常建议设计成不可变（所有字段用 final）
class AppException implements Exception {
  final String message;
  final int    code;
  final DateTime timestamp;

  AppException(this.message, this.code)
      : timestamp = DateTime.now();

  @override
  String toString() => '[$timestamp] AppException($code): $message';
}

// 继承扩展：建立异常层次结构
class NetworkException extends AppException {
  final String url;
  NetworkException(String message, {required this.url})
      : super(message, 503);

  @override
  String toString() => 'NetworkException: $message (URL: $url)';
}

class AuthException extends AppException {
  AuthException(String message) : super(message, 401);
}

class NotFoundException extends AppException {
  final String resource;
  NotFoundException(this.resource)
      : super('$resource 不存在', 404);
}

// 使用异常层次结构
void fetchResource(String type) {
  switch (type) {
    case 'network': throw NetworkException('连接超时', url: 'https://api.example.com');
    case 'auth':    throw AuthException('Token 已过期');
    case 'missing': throw NotFoundException('用户 ID=999');
    default:        print('成功获取: $type');
  }
}

for (var type in ['data', 'network', 'auth', 'missing']) {
  try {
    fetchResource(type);
  } on NetworkException catch (e) {
    print('网络错误: $e');
  } on AuthException catch (e) {
    print('认证错误: ${e.message}，错误码: ${e.code}');
  } on AppException catch (e) {
    // 捕获所有 AppException 的子类（兜底）
    print('应用错误(${e.code}): ${e.message}');
  }
}
// 输出:
// 成功获取: data
// 网络错误: NetworkException: 连接超时 (URL: https://api.example.com)
// 认证错误: Token 已过期，错误码: 401
// 应用错误(404): 用户 ID=999 不存在
```

---

## 15. 枚举

Dart 的枚举从简单的值枚举演变为功能丰富的增强枚举（Dart 2.17+），支持构造函数、字段、方法和接口实现，几乎具备普通类的全部能力。

### 15.1 基础枚举

```dart
// 最简单的枚举：定义一组具名常量
enum Direction { north, south, east, west }

var dir = Direction.north;
print(dir);              // 输出: Direction.north
print(dir.name);         // 输出: north（枚举值的名字，String）
print(dir.index);        // 输出: 0   （枚举值的序号，从 0 开始）
print(Direction.values); // 输出: [Direction.north, ...]（所有值的列表）

// 从字符串解析枚举（Dart 2.15+）
var parsed = Direction.values.byName('east');
print(parsed);           // 输出: Direction.east

// 在 switch 中使用枚举：编译器可以检查穷举性
switch (dir) {
  case Direction.north: print('向北走'); break;
  case Direction.south: print('向南走'); break;
  case Direction.east:  print('向东走'); break;
  case Direction.west:  print('向西走'); break;
  // 若漏写某个 case，编译器会产生警告
}
// 输出: 向北走
```

### 15.2 增强枚举（Dart 2.17+）

```dart
// 增强枚举：可以有构造函数、字段、方法，用法与类相似
// 每个枚举值就像一个类的常量实例
enum Planet {
  // 每个枚举值像调用构造函数一样传入参数
  mercury(mass: 3.303e+23, radius: 2.4397e6),
  venus  (mass: 4.869e+24, radius: 6.0518e6),
  earth  (mass: 5.976e+24, radius: 6.37814e6),
  mars   (mass: 6.421e+23, radius: 3.3972e6);

  // 枚举的构造函数必须是 const
  const Planet({required this.mass, required this.radius});

  // 字段（必须是 final）
  final double mass;    // 千克
  final double radius;  // 米

  // 常量
  static const double G = 6.67430e-11;

  // 计算属性
  double get surfaceGravity => G * mass / (radius * radius);

  // 方法
  double surfaceWeight(double bodyMass) => bodyMass * surfaceGravity;

  // 重写 toString
  @override
  String toString() => 'Planet.$name (g=${surfaceGravity.toStringAsFixed(2)})';
}

// 计算在各星球上的体重
var earthWeight = 75.0;
var mass = earthWeight / Planet.earth.surfaceGravity;
print('地球质量: ${mass.toStringAsFixed(2)} kg');
// 输出: 地球质量: 7.65 kg

for (var p in Planet.values) {
  print('${p.name}: ${p.surfaceWeight(mass).toStringAsFixed(2)} N');
}
// 输出（近似）:
// mercury: 28.32 N
// venus:   67.87 N
// earth:   75.00 N
// mars:    28.46 N
```

### 15.3 枚举实现接口

```dart
// 枚举可以 implements 接口，甚至实现 mixin
enum Status implements Comparable<Status> {
  draft    ('草稿',   0xFF9E9E9E),
  pending  ('待审核', 0xFFFFA726),
  active   ('进行中', 0xFF66BB6A),
  completed('已完成', 0xFF42A5F5),
  cancelled('已取消', 0xFFEF5350);

  const Status(this.label, this.color);

  final String label;
  final int    color;  // ARGB 颜色值

  // 实现 Comparable 接口
  @override
  int compareTo(Status other) => index.compareTo(other.index);

  // 判断是否为终态（不可再转换到其他状态）
  bool get isTerminal => this == completed || this == cancelled;

  // 可转换的下一个状态列表
  List<Status> get nextStates => switch (this) {
    draft     => [pending, cancelled],
    pending   => [active, cancelled],
    active    => [completed, cancelled],
    completed => [],
    cancelled => [],
  };

  @override
  String toString() => label;
}

print(Status.active.label);          // 输出: 进行中
print(Status.active.isTerminal);     // 输出: false
print(Status.completed.isTerminal);  // 输出: true
print(Status.pending.nextStates);    // 输出: [进行中, 已取消]

// 排序（利用 Comparable 接口）
var statuses = [Status.completed, Status.draft, Status.active];
statuses.sort();
print(statuses);  // 输出: [草稿, 进行中, 已完成]（按 index 排序）
```

---

## 16. 库与导入

Dart 的包管理系统以 `pubspec.yaml` 为核心，`dart pub` 为命令行工具。标准库涵盖 IO、网络、异步、集合、数学、JSON 等各个领域。

### 16.1 导入语法

```dart
// ── 导入标准库（dart: 前缀）──────────────────────
import 'dart:math';        // 数学函数和常量
import 'dart:convert';     // JSON、UTF-8、Base64 等编解码
import 'dart:async';       // Future、Stream、Timer 等异步工具
import 'dart:collection';  // Queue、LinkedHashMap、SplayTreeMap 等
import 'dart:io';          // 文件、套接字、进程（不支持 Web）

// ── 导入第三方包（package: 前缀）────────────────
import 'package:http/http.dart';
import 'package:flutter/material.dart';

// ── as：给导入的库取别名（解决命名冲突）──────────
import 'dart:math' as math;
print(math.pi);          // 输出: 3.141592653589793
print(math.sqrt(16));    // 输出: 4.0
print(math.max(3, 7));   // 输出: 7
print(math.min(3, 7));   // 输出: 3
print(math.pow(2, 10));  // 输出: 1024.0
print(math.log(math.e)); // 输出: 1.0

// ── show：只导入指定的名称 ────────────────────────
import 'dart:math' show Random, pi, sqrt;
// 现在只有 Random、pi、sqrt 可用

// ── hide：排除指定的名称 ──────────────────────────
import 'dart:math' hide Random;
// 除了 Random 之外的所有名称都可用

// ── deferred as：延迟/懒加载（减少初始加载时间）──
import 'package:heavy_lib/heavy_lib.dart' deferred as heavy;
// 使用时调用 await heavy.loadLibrary(); 再使用
```

### 16.2 dart:math 常用功能

```dart
import 'dart:math';

// ── 数学常量 ──────────────────────────────────────
print(pi);   // 输出: 3.141592653589793
print(e);    // 输出: 2.718281828459045（自然常数）
print(ln2);  // 输出: 0.6931471805599453

// ── 常用数学函数 ──────────────────────────────────
print(sqrt(2));         // 输出: 1.4142135623730951（平方根）
print(pow(2, 10));      // 输出: 1024.0（幂运算：2^10）
print(log(e));          // 输出: 1.0（自然对数）
print(log(100) / log(10)); // 输出: 2.0（以 10 为底的对数）

// 三角函数（参数为弧度）
print(sin(pi / 2));     // 输出: 1.0
print(cos(0));          // 输出: 1.0
print(tan(pi / 4));     // 输出: 0.9999999999999999（约等于 1）
print(asin(1));         // 输出: 1.5707963267948966（≈ π/2）

// 取整函数（注意各自语义）
print(3.7.ceil());      // 输出: 4  （向上取整）
print(3.7.floor());     // 输出: 3  （向下取整）
print(3.5.round());     // 输出: 4  （四舍五入）
print(-3.7.ceil());     // 输出: -3 （向上取整：往正方向）
print(-3.7.floor());    // 输出: -4 （向下取整：往负方向）

// ── 随机数 ─────────────────────────────────────────
var rng = Random();
print(rng.nextInt(100));    // 输出: 0~99 的随机整数（不含 100）
print(rng.nextDouble());    // 输出: 0.0~1.0 之间的随机浮点数
print(rng.nextBool());      // 输出: 随机的 true 或 false

// 指定种子（相同种子产生相同序列，适合测试）
var seeded = Random(42);
print(seeded.nextInt(100)); // 输出: 固定值（取决于实现）

// 密码学安全随机数（不可预测，但较慢）
var secure = Random.secure();
print(secure.nextInt(256));
```

### 16.3 dart:convert 编解码

```dart
import 'dart:convert';

// ── JSON 编解码 ───────────────────────────────────
// JSON 是 Web 开发中最常见的数据交换格式
var data = {
  'name': 'Dart',
  'version': 3,
  'features': ['null-safety', 'records', 'patterns'],
  'stable': true,
  'releaseDate': null,
};

// 编码：Dart 对象 → JSON 字符串
String jsonStr = jsonEncode(data);
print(jsonStr);
// 输出: {"name":"Dart","version":3,"features":["null-safety","records","patterns"],"stable":true,"releaseDate":null}

// 解码：JSON 字符串 → Dart 对象（返回 dynamic）
var decoded = jsonDecode(jsonStr);
print(decoded['name']);           // 输出: Dart
print(decoded['version']);        // 输出: 3
print(decoded['features']);       // 输出: [null-safety, records, patterns]
print(decoded['features'][0]);    // 输出: null-safety

// 格式化输出（带缩进）
import 'dart:convert';
var encoder = JsonEncoder.withIndent('  ');
print(encoder.convert({'a': 1, 'b': [2, 3]}));
// 输出:
// {
//   "a": 1,
//   "b": [
//     2,
//     3
//   ]
// }

// ── Base64 编解码 ─────────────────────────────────
// 常用于将二进制数据编码为可打印的 ASCII 字符串（如图片、证书）
var bytes = [72, 101, 108, 108, 111];  // "Hello" 的 ASCII 码
print(base64Encode(bytes));     // 输出: SGVsbG8=
print(base64Decode('SGVsbG8=')); // 输出: [72, 101, 108, 108, 111]

// URL 安全的 Base64（用 - 和 _ 替换 + 和 /）
print(base64Url.encode(bytes));  // 输出: SGVsbG8=

// ── UTF-8 编解码 ──────────────────────────────────
// UTF-8 是最常见的文本编码，每个 ASCII 字符 1 字节，中文通常 3 字节
var text = '你好，Dart！';
var utf8bytes = utf8.encode(text);
print(utf8bytes.length);          // 输出: 13（3+3+3+4+1+3 = 中文3字节，ASCII1字节）
print(utf8.decode(utf8bytes));    // 输出: 你好，Dart！（往回解码）
```

### 16.4 dart:collection 高级集合

```dart
import 'dart:collection';

// ── Queue：双端队列 ──────────────────────────────
// 两端都可以高效地插入和删除，适合队列/栈/双端操作
var q = Queue<int>();
q.add(1);          // 从后端加入
q.add(2);
q.addFirst(0);     // 从前端加入
print(q);          // 输出: {0, 1, 2}
q.removeFirst();   // 从前端移除（队列出队）
q.removeLast();    // 从后端移除（栈弹出）
print(q);          // 输出: {1}

// ── LinkedHashMap：保持插入顺序的 Map ────────────
// 标准 Map 的插入顺序在 Dart 中也是保证的（但 LinkedHashMap 是明确保证）
var lhm = LinkedHashMap<String, int>();
lhm['c'] = 3;
lhm['a'] = 1;
lhm['b'] = 2;
print(lhm.keys.toList());   // 输出: [c, a, b]（保持插入顺序）

// ── SplayTreeMap：键自动排序的 Map ───────────────
// 基于 Splay 树实现，键总是保持有序状态
// 适合需要按键顺序遍历的场景
var stm = SplayTreeMap<String, int>();
stm['banana'] = 2;
stm['apple']  = 1;
stm['cherry'] = 3;
print(stm.keys.toList());   // 输出: [apple, banana, cherry]（字典序）
print(stm.firstKey());      // 输出: apple
print(stm.lastKey());       // 输出: cherry

// 自定义排序（降序）
var descMap = SplayTreeMap<int, String>((a, b) => b.compareTo(a));
descMap[1] = 'one';
descMap[3] = 'three';
descMap[2] = 'two';
print(descMap.keys.toList());  // 输出: [3, 2, 1]（降序）

// ── HashSet：哈希集合（查找 O(1)，但无序）────────
var hs = HashSet<String>();
hs.addAll(['dart', 'flutter', 'dart', 'android']);
print(hs.length);       // 输出: 3（dart 重复被忽略，顺序不保证）
print(hs.contains('flutter')); // 输出: true
```

---

## 快速参考

### Dart 内置类型总览

| 类型 | 说明 | 示例字面量 |
|------|------|-----------|
| `int` | 64 位整数（VM）/ JS number（Web） | `42`, `0xFF`, `-10` |
| `double` | 64 位 IEEE 754 浮点数 | `3.14`, `1.5e3`, `double.infinity` |
| `num` | `int` 和 `double` 的父类 | — |
| `bool` | 布尔值 | `true`, `false` |
| `String` | UTF-16 字符串（不可变） | `'hi'`, `"hello"`, `r'\n'` |
| `List<T>` | 有序可变列表 | `[1, 2, 3]` |
| `Map<K,V>` | 键值映射 | `{'a': 1}` |
| `Set<T>` | 无重复集合 | `{1, 2, 3}` |
| `Symbol` | 标识符的符号表示 | `#name` |
| `Runes` | Unicode 码点序列 | `Runes('\u{1F600}')` |
| `dynamic` | 动态类型（跳过类型检查） | — |
| `Object` | 所有非空类型的根类 | — |
| `Object?` | 所有类型的根（含 null） | — |
| `void` | 无返回值 | — |
| `Never` | 永不正常返回（抛异常的函数） | — |
| `Null` | null 的类型 | `null` |

### 关键操作符速查

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `?.` | 条件成员访问（null 时短路返回 null） | `obj?.method()` |
| `??` | 空值合并（左侧为 null 则用右侧） | `x ?? 'default'` |
| `??=` | 空值赋值（仅当 null 时赋值） | `x ??= 'init'` |
| `!` | 非空断言（断言非 null，否则运行时报错） | `x!.length` |
| `..` | 级联（对同一对象多次操作，返回对象本身） | `list..add(1)..add(2)` |
| `?..` | 空安全级联（null 时跳过） | `obj?..method()` |
| `is` | 类型检查（包含子类） | `x is String` |
| `is!` | 类型排除 | `x is! int` |
| `as` | 强制类型转换（失败抛 TypeError） | `x as String` |
| `~/` | 整除（结果为 int） | `10 ~/ 3 == 3` |
| `...` | 展开运算符（集合合并） | `[...list1, ...list2]` |
| `...?` | 空安全展开（null 时不展开） | `[...?nullableList]` |
| `@override` | 标注覆盖父类成员 | `@override void build()` |
| `=>` | 箭头函数（单表达式函数体简写） | `int double(int x) => x * 2` |

### Dart 3 新特性速览

| 特性 | 关键字 | 一句话说明 |
|------|--------|-----------|
| 模式匹配 | `switch`、`case`、`when` | 在 switch 中对数据结构进行解构和类型匹配 |
| Record 类型 | `(a, b)`、`(x: 1, y: 2)` | 匿名不可变多值结构，替代简单的类或 Map |
| 密封类 | `sealed class` | 子类有限且已知，switch 可穷举检查 |
| 解构赋值 | `var (a, b) = ...` | 直接从 Record/List/Map/对象中提取值 |
| switch 表达式 | `switch (x) { ... => ... }` | switch 可作为表达式直接产生值 |
| 扩展类型 | `extension type` | 零开销的类型包装，提供编译期类型安全 |

---

*本手册涵盖 Dart 3.x 全部核心语法，建议结合官方文档 [dart.dev/language](https://dart.dev/language) 深入学习。*
