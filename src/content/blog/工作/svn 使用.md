---
title: "svn 使用"
description: "Apache Subversion (SVN) 是一款集中式版本控制系统。本文档整理了日常开发中所有常用 SVN 命令及参数说明。"
pubDate: 2026-05-29
category: "工作"
tags: [Mac]
draft: false
---
# SVN 命令完整参考指南

> Apache Subversion (SVN) 是一款集中式版本控制系统。本文档整理了日常开发中所有常用 SVN 命令及参数说明。

------

## 基本概念

<a id="basic-concepts"></a>

| 术语         | 说明                             |
| ------------ | -------------------------------- |
| Repository   | 仓库，存储所有版本历史的服务端   |
| Working Copy | 工作副本，本地检出的文件目录     |
| Revision     | 版本号，每次提交后递增的整数     |
| HEAD         | 仓库中最新的版本                 |
| BASE         | 工作副本最后一次更新时对应的版本 |
| trunk        | 主干，主要开发分支               |
| branches     | 分支目录                         |
| tags         | 标签目录（用于标记里程碑版本）   |

------

## 仓库与检出

<a id="仓库与检出"></a>

### checkout（co）— 检出仓库

```bash
# 完整检出
svn checkout <URL> [本地目录]
svn co <URL> [本地目录]

# 示例
svn co http://svn.example.com/repos/project
svn co http://svn.example.com/repos/project/trunk myproject

# 检出指定版本
svn co -r 100 http://svn.example.com/repos/project

# 只检出目录结构（不含文件内容，节省空间）
svn co --depth empty http://svn.example.com/repos/project
svn co --depth immediates http://svn.example.com/repos/project  # 仅一级子目录
svn co --depth files http://svn.example.com/repos/project       # 仅文件，不含子目录
```

### svnadmin create — 创建本地仓库

```bash
svnadmin create /path/to/repos
```

### import — 导入目录到仓库

```bash
# 将本地目录首次导入仓库（不创建工作副本）
svn import /local/path http://svn.example.com/repos/project/trunk -m "初始导入"
```

------

## 查看状态与日志

<a id="查看状态与日志"></a>

### status（st）— 查看工作副本状态

```bash
svn status
svn st

# 显示版本号信息
svn st -v

# 显示未被版本控制的文件
svn st -u

# 不显示未版本控制的文件
svn st --no-ignore

# 仅显示有变化的文件（静默模式）
svn st -q
```

### log — 查看提交日志

```bash
# 查看全部日志
svn log

# 查看指定文件日志
svn log filename.txt

# 限制显示条数
svn log -l 10

# 显示详细变更文件列表
svn log -v

# 查看指定版本范围
svn log -r 100:200

# 查看某个版本
svn log -r 150

# XML 格式输出（便于解析）
svn log --xml
```

### info — 查看详细信息

```bash
# 查看当前工作副本信息
svn info

# 查看指定文件信息
svn info filename.txt

# 查看远程 URL 信息
svn info http://svn.example.com/repos/project
```

### list（ls）— 列出仓库内容

```bash
# 列出当前目录仓库内容
svn list
svn ls

# 列出远程仓库目录
svn ls http://svn.example.com/repos/project

# 递归列出
svn ls -R http://svn.example.com/repos/project

# 详细信息
svn ls -v
```

------

## 文件操作

<a id="文件操作"></a>

### add — 添加文件或目录

```bash
# 添加文件
svn add filename.txt

# 添加目录（递归）
svn add dirname/

# 添加目录但不递归
svn add dirname/ --non-recursive

# 自动添加所有未版本控制的文件
svn add * --force
```

### delete（del / rm）— 删除文件或目录

```bash
# 删除文件（本地 + 标记删除）
svn delete filename.txt
svn del filename.txt
svn rm filename.txt

# 强制删除有本地修改的文件
svn delete filename.txt --force

# 直接删除仓库中的文件（不需要工作副本）
svn delete http://svn.example.com/repos/project/trunk/old.txt -m "删除旧文件"
```

### copy（cp）— 复制文件或目录

```bash
# 复制工作副本文件
svn copy src.txt dst.txt

# 复制并创建分支
svn copy http://svn.example.com/repos/project/trunk \
         http://svn.example.com/repos/project/branches/feature-x \
         -m "创建 feature-x 分支"

# 从特定版本复制
svn copy -r 100 http://svn.example.com/repos/project/trunk \
         http://svn.example.com/repos/project/tags/v1.0 \
         -m "打标签 v1.0"
```

### move（mv）— 移动/重命名文件

```bash
# 重命名文件
svn move old.txt new.txt
svn mv old.txt new.txt

# 移动文件到目录
svn mv filename.txt subdir/

# 在仓库中直接重命名（立即生效）
svn mv http://svn.example.com/repos/project/trunk/old.txt \
       http://svn.example.com/repos/project/trunk/new.txt \
       -m "重命名文件"
```

### mkdir — 创建目录

```bash
# 在工作副本创建目录
svn mkdir newdir

# 在仓库中直接创建目录
svn mkdir http://svn.example.com/repos/project/trunk/newdir -m "创建目录"
```

------

## 提交与更新

<a id="提交与更新"></a>

### commit（ci）— 提交变更

```bash
# 提交所有变更
svn commit -m "提交说明"
svn ci -m "提交说明"

# 提交指定文件
svn ci filename.txt -m "修改了某文件"

# 提交多个文件
svn ci file1.txt file2.txt -m "批量提交"

# 使用编辑器填写提交说明
svn ci

# 提交时不锁定文件
svn ci --no-unlock -m "提交"
```

### update（up）— 更新工作副本

```bash
# 更新到最新版本
svn update
svn up

# 更新到指定版本
svn up -r 150

# 更新指定文件
svn up filename.txt

# 更新到 HEAD
svn up -r HEAD

# 更新时忽略外部引用
svn up --ignore-externals
```

### switch（sw）— 切换工作副本指向

```bash
# 切换到另一个分支
svn switch http://svn.example.com/repos/project/branches/feature-x

# 切换到主干
svn switch http://svn.example.com/repos/project/trunk

# 切换并重定位（URL 变更时使用）
svn switch --relocate http://old-svn.example.com http://new-svn.example.com
```

### relocate — 重定位仓库地址

```bash
# SVN 1.7+ 写法
svn relocate http://new-svn.example.com/repos/project
```

------

## 分支与标签

<a id="分支与标签"></a>

SVN 的分支和标签本质上都是 `copy` 操作，存放在约定俗成的目录结构中。

```
project/
├── trunk/       # 主干
├── branches/    # 分支
│   ├── feature-login/
│   └── bugfix-123/
└── tags/        # 标签（只读，不应修改）
    ├── v1.0/
    └── v2.0/
```

### 创建分支

```bash
# 从主干创建分支
svn copy http://svn.example.com/repos/project/trunk \
         http://svn.example.com/repos/project/branches/feature-login \
         -m "创建 feature-login 分支"

# 从特定版本创建分支
svn copy -r 200 http://svn.example.com/repos/project/trunk \
         http://svn.example.com/repos/project/branches/hotfix \
         -m "从 r200 创建 hotfix 分支"
```

### 创建标签

```bash
# 从主干打标签
svn copy http://svn.example.com/repos/project/trunk \
         http://svn.example.com/repos/project/tags/v1.0.0 \
         -m "发布 v1.0.0"
```

### 删除分支 / 标签

```bash
svn delete http://svn.example.com/repos/project/branches/old-branch \
           -m "删除废弃分支"
```

### 列出所有分支

```bash
svn ls http://svn.example.com/repos/project/branches
```

------

## 合并

<a id="合并"></a>

### merge — 合并变更

```bash
# 将分支的所有变更合并到当前工作副本（自动追踪模式，SVN 1.5+）
svn merge http://svn.example.com/repos/project/branches/feature-x

# 合并指定版本范围
svn merge -r 150:200 http://svn.example.com/repos/project/branches/feature-x

# 合并单个版本（cherry-pick）
svn merge -c 175 http://svn.example.com/repos/project/trunk

# 反向合并（撤销某个版本的变更）
svn merge -c -175 http://svn.example.com/repos/project/trunk

# 预览合并结果（不实际执行）
svn merge --dry-run http://svn.example.com/repos/project/branches/feature-x
```

### mergeinfo — 查看合并信息

```bash
# 查看已合并的版本
svn mergeinfo --show-revs merged http://svn.example.com/repos/project/branches/feature-x

# 查看尚未合并的版本
svn mergeinfo --show-revs eligible http://svn.example.com/repos/project/branches/feature-x
```

------

## 撤销与回滚

<a id="撤销与回滚"></a>

### revert — 撤销本地修改

```bash
# 撤销单个文件的本地修改
svn revert filename.txt

# 递归撤销目录下所有修改
svn revert -R dirname/

# 撤销所有本地修改
svn revert -R .
```

### 回滚到指定版本（已提交）

```bash
# 方法一：反向合并（推荐）
# 将版本 r200 的修改反向应用（即撤销 r200 的变更）
svn merge -c -200 .
svn ci -m "回滚 r200 的变更"

# 方法二：直接用旧版本覆盖
svn update -r 199 filename.txt
svn ci -m "将 filename.txt 回滚到 r199"

# 方法三：回滚整个工作副本到历史版本（仅本地，不提交）
svn update -r 199
```

### resolve — 解决冲突

```bash
# 标记冲突已解决（手动编辑后）
svn resolve --accept working filename.txt

# 使用自己的版本解决冲突
svn resolve --accept mine-full filename.txt

# 使用仓库版本解决冲突
svn resolve --accept theirs-full filename.txt

# 交互式解决冲突
svn resolve --accept edit filename.txt
```

### cleanup — 清理工作副本

```bash
# 清理锁定状态（操作中断后使用）
svn cleanup

# 清理未版本控制的文件（SVN 1.9+）
svn cleanup --remove-unversioned
svn cleanup --remove-ignored
```

------

## 属性操作

<a id="属性操作"></a>

### propset（ps）— 设置属性

```bash
# 设置文件的 MIME 类型
svn propset svn:mime-type "text/plain" filename.txt

# 设置忽略规则
svn propset svn:ignore "*.o
*.log
build/" .

# 设置可执行权限（Linux/macOS）
svn propset svn:executable ON script.sh

# 设置关键字替换
svn propset svn:keywords "Id Author Date Rev" filename.txt

# 设置换行符格式
svn propset svn:eol-style native filename.txt
```

### propget（pg）— 获取属性

```bash
svn propget svn:ignore .
svn pg svn:mime-type filename.txt
```

### proplist（pl）— 列出属性

```bash
svn proplist filename.txt
svn pl -v filename.txt    # 显示属性值
```

### propdel（pd）— 删除属性

```bash
svn propdel svn:ignore .
svn pd svn:executable script.sh
```

### propedit（pe）— 编辑属性

```bash
svn propedit svn:ignore .
```

------

## 差异对比

<a id="差异对比"></a>

### diff（di）— 查看差异

```bash
# 查看工作副本与 BASE 的差异
svn diff
svn di

# 查看指定文件差异
svn diff filename.txt

# 比较两个版本之间的差异
svn diff -r 100:200

# 比较某文件两个版本
svn diff -r 100:200 filename.txt

# 比较工作副本与指定版本
svn diff -r 150 filename.txt

# 比较两个 URL
svn diff http://svn.example.com/repos/project/trunk \
         http://svn.example.com/repos/project/branches/feature-x

# 输出为 patch 文件
svn diff > changes.patch
```

### patch — 应用补丁

```bash
svn patch changes.patch
```

------

## 锁定机制

<a id="锁定机制"></a>

适用于二进制文件（图片、文档等），防止并发修改冲突。

### lock — 锁定文件

```bash
# 锁定文件
svn lock filename.png

# 带注释的锁定
svn lock -m "正在修改中" filename.png

# 强制锁定（抢占他人锁）
svn lock --force filename.png
```

### unlock — 解锁文件

```bash
# 解锁文件
svn unlock filename.png

# 强制解锁他人的锁
svn unlock --force http://svn.example.com/repos/project/trunk/filename.png
```

### 设置强制锁定属性

```bash
# 设置文件必须锁定才能修改
svn propset svn:needs-lock ON filename.png
```

------

## 仓库管理（svnadmin）

<a id="仓库管理svnadmin"></a>

> `svnadmin` 命令需要在**服务器端**直接访问仓库路径时使用。

### 创建仓库

```bash
svnadmin create /path/to/repos
```

### 备份仓库

```bash
# 热备份（全量）
svnadmin hotcopy /path/to/repos /path/to/backup

# 导出为转储文件
svnadmin dump /path/to/repos > repos.dump

# 增量导出（导出 r100 到 r200）
svnadmin dump /path/to/repos -r 100:200 --incremental > partial.dump
```

### 恢复仓库

```bash
# 从转储文件恢复
svnadmin create /path/to/new-repos
svnadmin load /path/to/new-repos < repos.dump
```

### 查看仓库信息

```bash
svnadmin info /path/to/repos
svnadmin lstxns /path/to/repos   # 列出未完成的事务
svnadmin rmtxns /path/to/repos txn-name  # 删除挂起的事务
```

### svnlook — 查看仓库内容（无需工作副本）

```bash
# 查看最新日志
svnlook log /path/to/repos

# 查看指定版本的变更文件
svnlook changed /path/to/repos -r 100

# 查看文件内容
svnlook cat /path/to/repos trunk/filename.txt

# 查看目录树
svnlook tree /path/to/repos

# 查看版本信息
svnlook info /path/to/repos
```

------

## 常用参数速查

<a id="常用参数速查"></a>

| 参数                 | 全称              | 说明                                              |
| -------------------- | ----------------- | ------------------------------------------------- |
| `-r`                 | `--revision`      | 指定版本号，如 `-r 100` 或 `-r 100:200`           |
| `-m`                 | `--message`       | 提交说明                                          |
| `-v`                 | `--verbose`       | 详细输出                                          |
| `-q`                 | `--quiet`         | 静默模式                                          |
| `-R`                 | `--recursive`     | 递归操作                                          |
| `-N`                 | `--non-recursive` | 非递归                                            |
| `--force`            | —                 | 强制执行                                          |
| `--dry-run`          | —                 | 预演，不实际执行                                  |
| `--username`         | —                 | 指定用户名                                        |
| `--password`         | —                 | 指定密码                                          |
| `--no-auth-cache`    | —                 | 不缓存认证信息                                    |
| `--non-interactive`  | —                 | 非交互模式（脚本中使用）                          |
| `--depth`            | —                 | 深度控制：`empty`/`files`/`immediates`/`infinity` |
| `--ignore-externals` | —                 | 忽略外部引用                                      |
| `--accept`           | —                 | 冲突解决策略                                      |
| `-c`                 | `--change`        | 指定单个变更集，`-c 100` 等价于 `-r 99:100`       |
| `--xml`              | —                 | XML 格式输出                                      |
| `-F`                 | `--file`          | 从文件读取提交说明                                |

------

## 常见场景示例

<a id="常见场景示例"></a>

### 日常开发流程

```bash
# 1. 检出项目
svn co http://svn.example.com/repos/project/trunk myproject
cd myproject

# 2. 更新到最新
svn up

# 3. 修改文件...

# 4. 查看修改状态
svn st

# 5. 查看具体改动
svn diff

# 6. 提交
svn ci -m "feat: 添加用户登录功能"
```

### 添加新文件并提交

```bash
# 创建新文件
echo "hello" > newfile.txt

# 添加到版本控制
svn add newfile.txt

# 提交
svn ci -m "add: 新增 newfile.txt"
```

### 解决更新冲突

```bash
# 更新时产生冲突
svn up
# C  conflicted-file.txt   ← 冲突文件

# 手动编辑解决冲突后
svn resolve --accept working conflicted-file.txt

# 提交解决结果
svn ci -m "fix: 解决合并冲突"
```

### 查看谁改了某行代码

```bash
svn blame filename.txt
svn annotate filename.txt   # 同 blame

# 查看指定版本范围
svn blame -r 100:200 filename.txt
```

### 忽略特定文件

```bash
# 设置忽略规则（在目录上设置 svn:ignore 属性）
svn propedit svn:ignore .

# 或者直接设置
svn propset svn:ignore "*.class
*.log
build/
.DS_Store" .

svn ci -m "chore: 添加 svn:ignore 规则"
```

### 脚本中使用 SVN（非交互模式）

```bash
svn up --non-interactive \
       --username myuser \
       --password mypass \
       --no-auth-cache \
       --trust-server-cert
```

### 导出干净的代码（不含 .svn 目录）

```bash
# export 导出指定 URL（无 .svn 目录）
svn export http://svn.example.com/repos/project/trunk ./release

# 导出指定版本
svn export -r 200 http://svn.example.com/repos/project/trunk ./release-r200

# 从工作副本导出
svn export . ../clean-copy
```

------

## SVN 状态符号说明

<a id="svn-状态符号说明"></a>

执行 `svn status` 时，每行前面的符号含义如下：

| 符号          | 含义                        |
| ------------- | --------------------------- |
| `A`           | 已添加（Added）             |
| `C`           | 冲突（Conflicted）          |
| `D`           | 已删除（Deleted）           |
| `I`           | 被忽略（Ignored）           |
| `M`           | 已修改（Modified）          |
| `R`           | 已替换（Replaced）          |
| `X`           | 外部引用（eXternal）        |
| `?`           | 未版本控制（Unversioned）   |
| `!`           | 文件丢失（Missing）或不完整 |
| `~`           | 类型变化（如文件变为目录）  |
| `' '`（空格） | 无变化                      |

**第二列（属性状态）：**

| 符号 | 含义       |
| ---- | ---------- |
| `M`  | 属性已修改 |
| `C`  | 属性冲突   |

**第三列（锁定状态）：**

| 符号 | 含义       |
| ---- | ---------- |
| `L`  | 已锁定     |
| `K`  | 持有锁     |
| `O`  | 他人持有锁 |
| `T`  | 锁已过期   |

------

## 版本关键字

<a id="版本关键字"></a>

在 `-r` 参数中可使用以下关键字代替版本号：

| 关键字      | 含义                           |
| ----------- | ------------------------------ |
| `HEAD`      | 仓库最新版本                   |
| `BASE`      | 工作副本的基准版本             |
| `COMMITTED` | 工作副本文件最后一次提交的版本 |
| `PREV`      | `COMMITTED` 的前一个版本       |

```bash
# 示例
svn diff -r BASE:HEAD          # 查看本地 BASE 到 HEAD 的差异
svn log -r COMMITTED filename  # 查看文件最后提交信息
svn update -r PREV filename    # 回退文件到上一个提交版本
```

------

*文档版本：1.0 | 参考：Apache Subversion 官方文档 https://subversion.apache.org*
