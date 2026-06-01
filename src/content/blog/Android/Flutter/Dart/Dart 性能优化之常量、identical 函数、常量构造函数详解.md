---
title: "Dart 性能优化之常量、identical 函数、常量构造函数详解"
description: "Dart 性能优化之常量、identical 函数、常量构造函数详解 的技术笔记。"
pubDate: 2026-05-31
category: "Dart"
tags: [Notes]
draft: false
---
## Dart 中 final和const 区别

- 均表示不可被修改

### const 常量的构造的总结：
- 常量构造函数需以const关键字修饰
- const 构造函数必须用于成员变量都是final修饰的类
- 如果实例化时不加const修饰符，即使调用的是常量构造函数，实例化的对象也不是常量实例

```
  var c1 = Container(100, 100);
  var c2 = Container(100, 100);

  print(identical(c1, c2)); //false
  
  
  class Container {
  final int width;
  final int height;
  const Container(this.width, this.height);
}
```
- 实例化常量构造函数的时候，多个地方创建这个对象，如果传入的值相同，只会保留一个对象

```
  var c1 = const Container(100, 100);
  var c2 = const Container(100, 100);

  print(identical(c1, c2)); // true
  
  
  class Container {
  final int width;
  final int height;
  const Container(this.width, this.height);
}
```

- Fluter中const 修饰不仅仅是节省组件创建时的内存开销，Fluter在需要重新构造组件时不应该该表的，重新构造没有任何意义，因此Flutter 不会重新构建const组件

> 相同点
- final、const必须初始化
- final、const只能赋值一次

> 不同点
- final可修饰实例变量、const不可以修饰实例变量
- 访问类中const修饰的变量需要static修饰
- const修饰的List集合任意索引不可修改，final修饰的可以修改
- const 用来修饰变量 只能被赋值一次，在编译时赋值
- final 用来修饰变量 只能被赋值一次，在运行时赋值
- final 只可用来修饰变量， const 关键字即可修饰变量也可用来修饰 常量构造
- const 关键词在多个地方创建相同的对象的时候，内存中只保留一个对象

```
 var a1 = const Object();
 var a2 = const Object();

 print(identical(a1, a2));  //true
```

## identical
- 检查两个引用是否指向同一个对象