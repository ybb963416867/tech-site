---
title: "git 使用"
description: "创建分支"
pubDate: 2026-05-29
category: "工作"
tags: [Git, Mac, iOS, Shell, Swift]
draft: false
---
## git 使用

## git 创建远程分支

*   创建分支

    git checkout -b dev

*   基于origin/oldbranchname 创建分支

    git checkout -b yourbranchname origin/oldbranchname

*   创建完可以查看一下,分支已经切换到dev

    git branch

*   建立本地到上游（远端）仓的链接 --这样代码才能提交上去

    git branch --set-upstream-to=origin/dev

*   将创建的分支推到远端

    git push --set-upstream origin dev\_doctor\_839

    git push origin yourbranchname

*   git 提交

    git commit -a -m "提交信息"

    //重新提交是在日志看不到操作记录的
    git commit --amend

*   git 拉取代码

    git pull
    git pull --rebase

*   git 推到远程

    git push

*   git log记录

    git log

*   git 合并分支 合并test分支到当前分支：

    git merge test

./gradlew app\:dependencies>aaa.txt

*   git 生成ssh

    ssh-keygen -t rsa -C "<binbing.yang@ushow.media>"

**会有下面的生成公钥和私钥的地址**

    Enter same passphrase again: 
    Your identification has been saved in /Users/yangbinbing/.ssh/id_rsa.
    Your public key has been saved in /Users/yangbinbing/.ssh/id_rsa.pub.
    
    cd .ssh
    ls
    vim id_rsa.pub

拷贝当前的私钥到  <https://phabricator.ushow.media>

*   git clone  xxx

*   git 暂存

    git stash

*   git 将暂存取出来

    git stash pop

*   git 暂存列表查询

    git stash list

*   git 设置用户名

    git config --local user.name "Yangbinbing"
    git config --global user.email "<963416867@qq.com>"

*   git  rebase

    git rebase --continue

***

## git 分离HEAD

*   git 回退到上次的提交

    git checkout HEAD^

*   git 一次回退 4步

    git checkout HEAD\~4

*   git 分支强制指向main分支HEAD 的第3级父提交

    git branch -f main HEAD\~3

*   git 撤销变更  通过把分支记录回退几个提交记录来实现撤销改动。

*   git reset 向上移动分支，原来指向的提交记录就跟从来没有提交过一样。

*   git revert 虽然在你的本地分支中使用 git reset 很方便，但是这种“改写历史”的方法对大家一起使用的远程分支是无效的哦！为了撤销更改并分享给别人，我们需要使用 git revert

    git reset HEAD\
    git revert HEAD

    git reset HEAD~1 (默认为 --mixed) 。撤销git commit, git add 操作, 保留 working area的修改。
    git reset --soft HEAD~1。撤销 git commit 操作，保留 working area的修改，git add 操作。
    git reset --hard HEAD~1。撤销 git commit, git add ，working area的修改。
    git reset HEAD~2。撤销两次提交

***

## **自由修改提交树**（将其他分支的 节点  合并到当前分支）

*   将c2、c4 哈希对应的节点  合并到当前分支

    git cherry-pick C2 C4

*   Git 前

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220524175711.png" width="200" height="200" />

*   git 后

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220524175812.png" width="200" height="200" />

### 交互式

    git rebase -i HEAD~4

> 交互式 rebase 指的是使用带参数 --interactive 的 rebase 命令, 简写为 -i
> 如果你在命令后增加了这个选项, Git 会打开一个 UI 界面并列出将要被复制到目标分支的备选提交记录，它还会显示每个提交记录的哈希值和提交说明，提交说明有助于你理解这个提交进行了哪些更改。
> 在实际使用时，所谓的 UI 窗口一般会在文本编辑器 —— 如 Vim —— 中打开一个文件。

***

## git tag 的使用

    git tag v1 c1
    git tag V2 -m "无-a有-m"

*   我们将这个标签命名为 v1，并且明确地让它指向提交记录 C1，如果你不指定提交记录，Git 会用 HEAD 所指向的位置。
*   \-m是描述

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220524194003.png" width="200" height="200" />

*   删除一个tag

    git tag -d tagName

    git describe main

> git describe 的​​语法是：
> git describe \<ref> \<ref> 可以是任何能被 Git 识别成提交记录的引用，如果你没有指定的话，Git 会以你目前所检出的位置（HEAD）。
> 它输出的结果是这样的：

*   \<tag>\_\<numCommits>\_g\<hash>
*   tag 表示的是离 ref 最近的标签，
*   numCommits 是表示这个 ref 与 tag 相差有多少个提交记录，
*   hash 表示的是你所给定的 ref 所表示的提交记录哈希值的前几位。
*   当 ref 提交记录上有某个标签时，则只输出标签名称

***

## Git 两个父节点

```shell
//第二条父节点
git checkout HEAD^2 
//上面的两个点
git checkout HEAD~2
```

> 这里有一个合并提交记录。如果不加数字修改符直接检出 main^，会回到第一个父提交记录。
> (在我们的图示中，第一个父提交记录是指合并提交记录正上方的那个提交记录。)

```shell
git checkout HEAD~^2~2
```

***

*   git 远程

    Git Fetch

*   git 在远程提交一次代码

    //fa推送了 3 个提交记录到远程仓库的 foo 分支
    git fakeTeamwork foo 3

## git push

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220525113039.png" width="200" height="200" />

> 看见了吧？什么都没有变，因为命令失败了！git push 失败是因为你最新提交的 C3 基于远程分支中的 C1。而远程仓库中该分支已经更新到 C2 了，所以 Git 拒绝了你的推送请求

*   解决

    git fetch
    git rebase o/main  //git merge o/main
    git push

    git pull --rebase
    git push

    git pull
    git push

## git 远程跟踪remote tracking

```shell
git checkout -b totallyNotMain o/main
```

*   就可以创建一个名为 totallyNotMain 的分支，它跟踪远程分支 o/main

> 第二种方法
> 另一种设置远程追踪分支的方法就是使用：git branch -u 命令，执行：

```shell
git branch -u o/main foo
```

*   这样 foo 就会跟踪 o/main 了。如果当前就在 foo 分支上, 还可以省略 foo：
    git branch -u o/main

## Git Push

```shell
git push <remote> <place>

git push origin main  
```

*   提交的都是相同的分支

> 切到本地仓库中的“main”分支，获取所有的提交，再到远程仓库“origin”中找到“main”分支，将远程仓库中没有的提交记录都添加上去，搞定之后告诉我。
> 我们通过“place”参数来告诉 Git 提交记录来自于 main, 要推送到远程仓库中的 main。它实际就是要同步的两个仓库的位置。
> 需要注意的是，因为我们通过指定参数告诉了 Git 所有它需要的信息, 所以它就忽略了我们所检出的分支的属性！

*   下面 提交的是不同的分支

    git push origin \<source>:\<destination>

> 记住，source 可以是任何 Git 能识别的位置：
> 这是个令人困惑的命令，但是它确实是可以运行的 —— Git 将 foo^ 解析为一个位置，上传所有未被包含到远程仓库里 main 分支中的提交记录。

```shell
git push origin foo^:main
```

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220525172800.png" width="200" height="200" />

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220525172921.png" width="200" height="200" />

## Git fetch 参数

```shell
git fetch origin foo~1:bar
```

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220525175644.png" width="200" height="200" />

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220525175728.png" width="200" height="200" />

*   如果 git fetch 没有参数，它会下载所有的提交记录到各个远程分支……

## source

> 古怪的 \<source>
> Git 有两种关于 \<source> 的用法是比较诡异的，即你可以在 git push 或 git fetch 时不指定任何 source，方法就是仅保留冒号和 destination 部分，source 部分留空。
> git push origin \:side
> git fetch origin \:bugFix
> 我们分别来看一下这两条命令的作用……

```shell
git push origin  :foo
```

*   push 传空值 source，成功删除了远程仓库中的 foo 分支,

    git fetch origin \:bar

*   fetch 空 到本地，会在本地创建一个新分支。

### 查看历史提交

> 查看历史的最后3次提交

```shell
git log -3
```

<img src="https://raw.githubusercontent.com/ybb963416867/yangbinbingResourse/master/img20220624181429.png" width="200" height="200" />

## git 中.gitignose 文件不起作用 处理

```shell
git rm -r --cached .
git add .
git commit -m "update .gitignose"
```

## 不同仓库代码合并

> 场景：A、B 两个仓库， 现需要把B仓库的代码合并到A仓库

```shell
//1.在A仓库下添加远端索引
git remote add b_remote b仓库地址

//2.将仓库B代码下载到本地
git fetch b_remote

//3.在本地创建B的分支
git checkout -b b_local b_remote/devOld

//4.切换到A仓库分支

git checkout dev

//5.合并B分支--allow-unrelated-histories：允许没有关联的分支合并
git merge b_local --allow-unrelated-histories

//6.覆盖合并 覆盖合并相当于删除了被覆盖分支的内容。
当前处于A仓库dev分支，以下命令是把B分支的devOld代码覆盖到了A仓库dev分支

git reset -hard devOld

```

## git本地创建密码防止下次重新输入

```shell
git config --global credential.helper store
```

## git 设置代理

> 注意端口号

```shell
//取消http代理
git config --global --unset http.proxy
//取消https代理 
git config --global --unset https.proxy

git config --global http.proxy http://127.0.0.1:7890
```

## git 初次提交

```shell
echo "# iOS_swift_gles" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/ybb963416867/iOS_swift_gles.git
git push -u origin main
```

## 删除远程.DS\_Store 文件， 添加忽略，并 更新缓存

```
# 删除所有本地 `.DS_Store` 文件
find . -name ".DS_Store" -delete

# 提交删除的文件到远程
git add .
git commit -m "Remove .DS_Store files"
git push

# 清除 Git 缓存（注意：这不会影响你的工作区）
git rm -r --cached .

# 重新添加文件到缓存（忽略 .DS_Store）
git add .

# 提交更改
git commit -m "Update .gitignore to exclude .DS_Store"
git push

```

## git 配置 Beyond Compare

> mac

```

git config --global diff.tool bc
git config --global difftool.bc.cmd "/Applications/Beyond Compare.app/Contents/MacOS/BCompare \"$LOCAL\" \"$REMOTE\""

git config --global merge.tool bc
git config --global mergetool.bc.cmd "/Applications/Beyond Compare.app/Contents/MacOS/BCompare \"$LOCAL\" \"$REMOTE\" \"$BASE\" \"$MERGED\""
git config --global mergetool.keepBackup false

```

> 如果你想直接修改 Git 的全局配置文件 \~/.gitconfig，可以添加：

```

[diff]
    tool = bc
[difftool "bc"]
    cmd = '"/Applications/Beyond Compare.app/Contents/MacOS/BCompare" "$LOCAL" "$REMOTE"'

[merge]
    tool = bc
[mergetool "bc"]
    cmd = '"/Applications/Beyond Compare.app/Contents/MacOS/BCompare" "$LOCAL" "$REMOTE" "$BASE" "$MERGED"'
    keepBackup = false
    
```

## 查找git提交的改hash为69e2eaa25c27eaf2ed6da2cfebb3389860dd38a0中提交的ImageDecoderHandler 这个文件的位置，并检出这个文件

    git ls-tree -r 69e2eaa25c27eaf2ed6da2cfebb3389860dd38a0 | grep ImageDecoderHandler
    git checkout 69e2eaa25c27eaf2ed6da2cfebb3389860dd38a0 -- ultrasound/src/main/java/com/yunshen/sonic/process/ImageDecoderHandler.kt

