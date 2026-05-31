---
title: "makedown语法"
description: "本文档涵盖 Markdown 的全部标准语法及常用扩展语法，适合快速查阅与学习。"
pubDate: 2026-05-29
category: "Work"
tags: [Git, Mac, Shell, Markdown, JavaScript]
draft: false
---
# Markdown 语法完整参考指南

> 本文档涵盖 Markdown 的全部标准语法及常用扩展语法，适合快速查阅与学习。

------

## 标题

使用 `#` 号表示标题，共 6 级。

```markdown
# 一级标题 (H1)
## 二级标题 (H2)
### 三级标题 (H3)
#### 四级标题 (H4)
##### 五级标题 (H5)
###### 六级标题 (H6)
```

**另一种方式（仅支持 H1 / H2）：**

```markdown
一级标题
========

二级标题
--------
```

------

## 段落与换行

```markdown
这是第一个段落。

这是第二个段落。（段落之间需要空一行）

这是一行文字。  
这是另一行文字。（行尾加两个空格即可换行，不创建新段落）
```

------

## 强调

| 语法                             | 效果         |
| -------------------------------- | ------------ |
| `*斜体*` 或 `_斜体_`             | *斜体*       |
| `**粗体**` 或 `__粗体__`         | **粗体**     |
| `***粗斜体***` 或 `___粗斜体___` | ***粗斜体*** |

```markdown
*这是斜体文字*
_这也是斜体文字_

**这是粗体文字**
__这也是粗体文字__

***这是粗斜体文字***
___这也是粗斜体文字___
```

------

## 引用

```markdown
> 这是一段引用文字。

> 引用可以嵌套：
>
> > 这是嵌套引用。
> >
> > > 更深层的嵌套。

> 引用中也可以包含其他 Markdown 元素：
>
> **粗体**、*斜体*、`代码`
```

**效果：**

> 这是一段引用文字。

> 引用可以嵌套：
>
> > 这是嵌套引用。

------

## 列表

### 无序列表

使用 `-`、`*` 或 `+` 开头：

```markdown
- 项目一
- 项目二
  - 子项目 A
  - 子项目 B
    - 更深层子项目
- 项目三

* 也可以用星号
+ 或者加号
```

### 有序列表

```markdown
1. 第一项
2. 第二项
   1. 子项目
   2. 子项目
3. 第三项

1. 数字不必连续
1. Markdown 会自动递增
1. 只要第一个数字正确即可
```

### 混合列表

```markdown
1. 有序项一
   - 无序子项
   - 无序子项
2. 有序项二
   1. 有序子项
   2. 有序子项
```

------

## 代码

### 行内代码

```markdown
使用反引号包裹 `行内代码`，例如 `print("Hello World")`。
```

### 代码块

使用三个反引号（可指定语言实现语法高亮）：

~~~markdown
```python
def hello():
    print("Hello, World!")
```

```javascript
const greet = (name) => `Hello, ${name}!`;
```

```bash
echo "Hello, Shell!"
```

```
无语言高亮的代码块
```
~~~

### 缩进代码块（4个空格或1个Tab）

```markdown
    这是缩进代码块
    每行缩进 4 个空格
```

------

## 分隔线

以下三种方式均可生成水平分隔线：

```markdown
---

***

___
```

------

## 链接

### 行内链接

```markdown
[链接文字](https://www.example.com)

[带标题的链接](https://www.example.com "鼠标悬停提示文字")
```

### 引用链接

```markdown
[链接文字][link-id]

[link-id]: https://www.example.com "可选标题"
```

### 自动链接

```markdown
<https://www.example.com>

<email@example.com>
```

### 锚点链接（页内跳转）

```markdown
[跳转到标题](#标题名称)

<!-- 标题会自动生成锚点，空格替换为 - ，转小写 -->
[跳转到代码章节](#代码)
```

> 💡 完整的锚点语法（包括自定义锚点、XML 锚点等）请参阅 [锚点与页内跳转](https://claude.ai/chat/cea49d4f-e1ef-407e-8ea5-ef65c80ec202#锚点与页内跳转) 章节。

------

## 图片

```markdown
![替代文字](image.png)

![带标题的图片](image.png "图片标题")

<!-- 引用式图片 -->
![替代文字][img-id]

[img-id]: image.png "可选标题"
```

### 带链接的图片

```markdown
[![图片替代文字](image.png)](https://www.example.com)
```

------

## 表格

```markdown
| 列1    | 列2    | 列3    |
|--------|--------|--------|
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |
```

### 对齐方式

```markdown
| 左对齐  |  居中对齐  | 右对齐  |
|:--------|:----------:|--------:|
| 左      |    中      |    右   |
| 文字    |    文字    |    文字 |
```

**效果：**

| 左对齐 | 居中对齐 | 右对齐 |
| ------ | -------- | ------ |
| 左     | 中       | 右     |
| 文字   | 文字     | 文字   |

------

## 任务列表

（GitHub Flavored Markdown 支持）

```markdown
- [x] 已完成的任务
- [ ] 未完成的任务
- [x] ~~已取消的任务~~
- [ ] 待处理事项
```

**效果：**

- [x] 已完成的任务
- [ ] 未完成的任务

------

## 脚注

```markdown
这里有一个脚注[^1]，还有另一个[^注释]。

[^1]: 这是第一个脚注的内容。
[^注释]: 脚注也可以用文字标识，内容会显示在文档底部。
```

------

## 删除线

```markdown
~~这段文字会被删除线划掉~~
```

**效果：** ~~这段文字会被删除线划掉~~

------

## 高亮

（部分渲染器支持，如 Obsidian、Typora）

```markdown
==这段文字会被高亮显示==
```

------

## HTML 嵌入

Markdown 支持直接嵌入 HTML：

```markdown
<div style="color: red;">红色文字</div>

<br>（换行）

<kbd>Ctrl</kbd> + <kbd>C</kbd>（键盘按键样式）

<details>
  <summary>点击展开</summary>
  这里是折叠的内容。
</details>

<!-- 这是 HTML 注释，不会被渲染 -->
```

------

## 转义字符

使用反斜杠 `\` 转义特殊字符：

```markdown
\*  不是斜体  \*
\#  不是标题
\`  不是代码
\[  不是链接
\\  反斜杠本身
```

**可转义的特殊字符：**

```
\ ` * _ { } [ ] ( ) # + - . ! |
```

------

## 数学公式

（支持 LaTeX，需渲染器支持，如 Typora、Jupyter、GitHub）

### 行内公式

```markdown
爱因斯坦质能方程：$E = mc^2$
```

### 块级公式

```markdown
$$
\int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\frac{\partial f}{\partial x} = \lim_{\Delta x \to 0} \frac{f(x + \Delta x) - f(x)}{\Delta x}
$$
```

------

## Emoji

（GitHub、GitLab 等平台支持）

```markdown
:smile:       😄
:heart:       ❤️
:rocket:      🚀
:warning:     ⚠️
:white_check_mark:  ✅
```

也可直接输入 Unicode Emoji：🎉 🔥 💡 ✨

------

## 定义列表

（部分渲染器支持，如 Pandoc、kramdown）

```markdown
苹果
:   一种常见水果，红色或绿色。

Markdown
:   一种轻量级标记语言。
:   由 John Gruber 创建于 2004 年。
```

------

## 折叠内容

（使用 HTML `<details>` 标签）

~~~markdown
<details>
<summary>点击查看详情 ▶</summary>

这里是折叠隐藏的内容，可以包含任意 **Markdown** 格式。

```python
print("Hello!")
~~~

</details> ```

------

## 综合示例

~~~markdown
# 项目文档

## 简介

这是一个使用 **Markdown** 编写的示例文档。

## 功能列表

- [x] 登录功能
- [x] 数据展示
- [ ] 导出报告

## 安装方法

```bash
git clone https://github.com/example/project.git
cd project
npm install
```

## 配置说明

| 参数    | 类型   | 默认值  | 说明         |
|---------|--------|---------|--------------|
| `host`  | string | localhost | 服务器地址  |
| `port`  | number | 3000    | 监听端口     |
| `debug` | bool   | false   | 调试模式     |

> ⚠️ **注意：** 生产环境请务必关闭 `debug` 模式。

更多信息请查阅[官方文档](https://example.com "官方文档")。
~~~

------

## 各平台支持情况

| 语法       | 标准 MD | GitHub | Typora | Obsidian | 备注        |
| ---------- | ------- | ------ | ------ | -------- | ----------- |
| 标题       | ✅       | ✅      | ✅      | ✅        | 通用        |
| 粗体/斜体  | ✅       | ✅      | ✅      | ✅        | 通用        |
| 代码块     | ✅       | ✅      | ✅      | ✅        | 通用        |
| 表格       | ❌       | ✅      | ✅      | ✅        | GFM 扩展    |
| 任务列表   | ❌       | ✅      | ✅      | ✅        | GFM 扩展    |
| 删除线     | ❌       | ✅      | ✅      | ✅        | GFM 扩展    |
| 脚注       | ❌       | ❌      | ✅      | ✅        | 扩展语法    |
| 数学公式   | ❌       | ✅      | ✅      | ✅        | 需插件/配置 |
| 高亮       | ❌       | ❌      | ✅      | ✅        | 扩展语法    |
| Emoji 短码 | ❌       | ✅      | ✅      | ✅        | 平台相关    |

------

*文档版本：1.0 | 参考规范：CommonMark + GitHub Flavored Markdown (GFM)*

## 锚点与页内跳转

锚点（Anchor）用于在文档内部实现跳转定位，是长文档导航的核心机制。

------

### 一、标题自动锚点（最常用）

Markdown 渲染器会为每个标题**自动生成**一个锚点 ID，规则如下：

- 全部转为**小写**
- 空格替换为 `-`
- 去除标点符号（`!`、`?`、`()`、`.` 等）
- 中文标题直接保留（GitHub / 大多数渲染器支持）

```markdown
## Hello World
<!-- 自动锚点 ID：hello-world -->

## 安装与配置
<!-- 自动锚点 ID：安装与配置 -->

## FAQ (常见问题)
<!-- 自动锚点 ID：faq-常见问题（括号被去除）-->
```

**跳转写法：**

```markdown
[跳转到 Hello World 章节](#hello-world)

[跳转到安装与配置](#安装与配置)

[回到顶部](#markdown-语法完整参考指南)
```

------

### 二、普通自定义锚点（HTML `id` 属性）

当标题锚点不满足需求，或需要在段落、列表中定义锚点时，可使用 HTML 的 `id` 属性。

#### 方式 1：`<a>` 标签（最广泛支持）

```markdown
<!-- 定义锚点（不可见占位） -->
<a id="my-anchor"></a>

<!-- 定义锚点（带可见文字） -->
<a id="section-intro">简介</a>
<!-- 跳转到锚点 -->
[跳转到简介](#my-anchor)
[跳转到 section-intro](#section-intro)
```

#### 方式 2：任意 HTML 元素的 `id` 属性

```markdown
<!-- 使用 span / div 定义锚点 -->
<span id="custom-point"></span>

<div id="chapter-2">第二章</div>
<!-- 跳转 -->
[跳转到第二章](#chapter-2)
```

#### 实际应用示例

```markdown
## 安装

<a id="install-macos"></a>
### macOS 安装

...macOS 安装步骤...

<a id="install-windows"></a>
### Windows 安装

...Windows 安装步骤...

---

<!-- 在任意位置快速跳转 -->
- [macOS 安装步骤](#install-macos)
- [Windows 安装步骤](#install-windows)
```

------

### 三、XML / HTML 锚点（`<a name>` 旧式写法）

早期 HTML 使用 `name` 属性定义锚点，部分旧文档或工具仍在使用：

```markdown
<!-- 旧式 name 锚点（HTML4 写法，仍被广泛支持） -->
<a name="top"></a>

<a name="section1">第一节标题</a>
<!-- 跳转方式与 id 锚点完全相同 -->
[回到顶部](#top)

[跳转到第一节](#section1)
```

> ⚠️ **注意：** `name` 属性在 HTML5 中已被废弃，推荐使用 `id` 属性替代。但在需要兼容旧系统或特定工具（如某些 Wiki、旧版 Confluence）时仍可使用。

------

### 四、锚点 ID 命名规则

| 规则       | 说明                         | 示例                |
| ---------- | ---------------------------- | ------------------- |
| 唯一性     | 同一文档内 ID 不能重复       | ❌ 两个 `id="intro"` |
| 字符限制   | 推荐使用字母、数字、`-`、`_` | ✅ `my-section-1`    |
| 大小写敏感 | HTML 中 ID 区分大小写        | `#Intro` ≠ `#intro` |
| 不含空格   | ID 中不能有空格              | ❌ `id="my section"` |
| 数字开头   | HTML5 允许，但不推荐         | 建议以字母开头      |

------

### 五、各平台锚点支持情况

| 锚点方式       | GitHub | Typora | Obsidian | GitLab | 备注                 |
| -------------- | ------ | ------ | -------- | ------ | -------------------- |
| 标题自动锚点   | ✅      | ✅      | ✅        | ✅      | 通用                 |
| `<a id="">`    | ✅      | ✅      | ⚠️        | ✅      | Obsidian 需开启 HTML |
| `<a name="">`  | ✅      | ✅      | ⚠️        | ✅      | 旧式，兼容性好       |
| `<span id="">` | ✅      | ✅      | ⚠️        | ✅      | 需渲染器支持 HTML    |
| `<div id="">`  | ✅      | ✅      | ⚠️        | ✅      | 同上                 |

> ⚠️ = 部分支持，取决于渲染器设置。

------

### 六、完整综合示例

~~~markdown
# 文档标题
<a id="doc-top"></a>

---

## 目录

- [第一章：简介](#chapter-1)
- [第二章：安装](#chapter-2)
  - [macOS](#install-mac)
  - [Windows](#install-win)
- [第三章：配置](#chapter-3)
- [回到顶部](#doc-top)

---

<a id="chapter-1"></a>
## 第一章：简介

这里是简介内容...

[↑ 回到顶部](#doc-top)

---

<a id="chapter-2"></a>
## 第二章：安装

<a id="install-mac"></a>
### macOS

```bash
brew install myapp
```

<a id="install-win"></a>
### Windows

```powershell
choco install myapp
```

[↑ 回到顶部](#doc-top)

---

<a id="chapter-3"></a>
## 第三章：配置

配置内容...

[↑ 回到顶部](#doc-top)
~~~
