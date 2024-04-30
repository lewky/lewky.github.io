# Git常用命令

## git clone

克隆远程库到本地：

```
// 默认本地仓库名字与远程库一样
git clone https://github.com/jquery/jquery.git

// 指定本地库名字为test
git clone https://github.com/jquery/jquery.git test

// git clone的仓库地址支持多种协议，通常使用最多的是http(s)和ssh协议，比如从GitHub上克隆仓库。
```
<!--more-->
## git remote

该命令用于管理远程库，当clone远程库到本地时，远程库将被自动命名为`origin`。

`git remote`可以查询当前仓库下的所有远程库：

```
$ git remote
origin
```

`git remote -v`可以查询当前仓库下的所有远程库对应的地址，一个远程库对应fetch和push两种操作，所以有两个地址。

```
$ git remote -v
origin  git@github.com:jquery/jquery.git (fetch)
origin  git@github.com:jquery/jquery.git (push)
```

`git clone -o`可以指定远程库的别名：

```
$ git clone -o jQuery https://github.com/jquery/jquery.git
$ git remote
jQuery
```

其他操作：

```
// 查看远程库的详细信息
git remote show <远程库别名>

// 添加新的远程库
git remote add <远程库别名> <网址>

// 删除远程库
git remote rm <远程库别名>

// 重命名远程库的别名
git remote rename <原远程库别名> <新远程库别名>
```

## git branch

```
// 创建本地分支
git branch <分支名>

// 删除本地分支
git branch -d <分支名>
git branch --delete <分支名>

// 设置关联远程分支，新建的本地分支需要关联远程分支，被关联的远程分支要存在否则会报错
git branch --set-upstream-to=<远程库别名>/<远程分支名> <本地分支名>

// 查看当前分支
git branch

// 查看远程分支
$ git branch -r
origin/master

// 查看所有分支
// * master表明当前分支是master，对应的远程分支是origin/master
$ git branch -a
* master
  remotes/origin/master
```

## git checkout

用于检出分支，从当前分支切换到另一个分支。切换分支时，要注意已暂存的文件或者提交。

```
// 切换到另一个已存在的分支
git checkout <分支名>

// 基于当前分支创建并切换到新的分支
git checkout -b <新的分支名>

// 基于远程分支创建并切换到新的分支
git checkout -b <新的分支名> <远程库别名>/<远程分支名>
```

## git fetch

该命令用于将远程库的更新拉取到本地库：

```
// 获取远程库所有分支的更新到本地库
git fetch <远程库别名>

// 获取指定分支的更新到本地库
git fetch <远程库别名> <分支名>
```

如果远程库的某个分支被删掉了，git fetch默认不会把这个删除操作同步到本地库，依然会看到被删掉的远程分支，这时候可以通过加上`-p`或`--prune`参数来将被删掉的远程分支更新到本地：

```
git fetch --prune origin 
git fetch -p origin
```

## git pull

该命令用于取回远程分支的更新，并将其合并到本地分支。

```
// 取回并合并到指定的本地分支
git pull <远程库别名> <远程分支名>:<本地分支名>

// 如果是合并到当前分支可以不需要指明本地分支名
// git pull相当于git fetch + git merge
git pull <远程库别名> <远程分支名>

// 指定rebase方式合并
git pull --rebase <远程库别名> <远程分支名>:<本地分支名>
```

git有两种合并方式：merge和rebase，这两个合并方式存在一定的区别，不能误用。

## git add

`git add [参数] <路径>`用于将工作区的文件添加到暂存区，可以多次使用`git add`命令将文件添加到暂存区中。暂存区中的文件可以通过`git commit`一次性提交到本地仓库。

```
// 将当前路径下修改的文件以及新增的文件添加到暂存区，不包括被删除的文件
git add .

// 将当前路径下修改的文件和被删除的文件添加到暂存区，不包括新增的文件
// 相当于git add --update
git add -u .

// 将当前路径下的所有文件添加到暂存区，相当于上面两个命令的集合
// 相当于git add --all
git add -A .
```

## git push

用于推送本地分支的更新到远程分支，用法与git pull类似。

```
// 推送本地分支到远程分支，注意这里的两个分支名顺序和pull是相反的
git push <远程库别名> <本地分支名>:<远程分支名>

// 远程分支名可以省略，会自动推送到有关联关系的远程分支（通常都是和本地分支同名的），如果该远程分支不存在则会新建远程分支
git push <远程库别名> <本地分支名>

// 本地分支名可以省略，此时表示推送空分支到远程分支
// 即删除远程分支
// demo: git push origin :master
git push <远程库别名> :<远程分支名>

// 删除远程分支
// demo: git push origin --delete master
git push <远程库别名> --delete <远程分支名>

// 推送本地所有分支到远程库
// demo: git push --all origin
git push --all <远程库别名>
```

在push时，如果远程库的分支版本更新，则会push当前分支失败，需要先git pull合并到当前分支（可能需要解决冲突），然后再重新push。或者可以使用`--force`参数，强制覆盖掉远程分支，但是一般不建议这样做。

此外，git push不会推送tag，除非添加`--tags`参数。

## git reset

该命令用于将仓库代码回退到指定的版本，通常会带上`--hard`参数。本地git仓库分为三个区域：工作区，暂存区和本地库。回退版本的命令有3个参数，与这三个区域有关。

### `--hard`

* 移动本地库HEAD指针
* 重置工作区
* 重置暂存区

回退版本后，本地库原本工作区和暂存区的文件将被清空，彻底变回指定版本的状态。

### `--soft`

* 移动本地库HEAD指针

回退版本后，仅仅移动了本地库的指针，工作区和暂存区文件保持不变。

### `--mixed`

* 移动本地库HEAD指针
* 重置暂存区

回退版本后，本地库原本暂存区的文件将被清空。

可以通过实际情况来决定使用哪个参数，但在实际开发中，为了避免自己的工作成果被误删，最好先确保自己的改动已经提交到了本地库或者远程库。

对于误操作回退版本导致文件丢失的情况，可以参考这篇文章：[关于git reset --hard命令！！！，未提交代码丢失找回](https://blog.csdn.net/shenlf_bk/article/details/106622877)

### 具体操作

首先切换到需要回退的分支：`git checkout <分支名>`。

然后用`git reset`命令来回退到指定的版本，通常会带上`--hard`参数：

```
// 回退到上一个版本
git reset --hard HEAD^

// 回退到上上个版本
git reset --hard HEAD^^

// 每多回退一个版本，就多一个^
// 为了避免^太多，可以用~n来简化，n表示回退几次提交，默认是一次
git reset --hard HEAD~2
```

此外，也可以用commit id来回退到指定的版本。仓库的每次提交都会为其生成一个唯一的id（40位哈希值），可以通过`git log`来查看每个提交对应的commit id。

在回退版本时，可以用这个commit id来指定回退到对应的提交，不需要指定完整的commit id，只需要前7位字符（short commit id）即可。

```
// 比如仓库有一个提交：commit 26e1d228c71e69f0cb63fa73db8cc1ae3c6d8e87
// 现在回退到这一个提交时的版本
git reset --hard 26e1d22
```

如果不放心这个手动截取前七位字符的short commit id，可以用以下命令来得到：

```
git rev-parse --short 26e1d228c71e69f0cb63fa73db8cc1ae3c6d8e87
26e1d22
```

## git tag

Git的tag用于给某个分支的某个提交打上标签，可以理解为一个别名，类似于浏览器收藏某个网页作为书签。

通常tag用于标记某个阶段性的某次提交作为重要节点，比如release了某个版本等。因为commit-id本身很长，不利于记忆，将这个commit打上tag，如`v1.0.0`等，以后就可以直接搜索这个tag来快速切换到对应的代码。

```
// 列出所有标签
git tag

// 使用-l或--list查询指定的标签
// 查询条件区分大小写，可以使用通配符，如*
git tag -l "v1.0.*"
```

创建标签如下：

```
// 创建标签：分为轻量标签（lightweight）和附注标签（annotated）
// 轻量标签只是对某个commit的引用
// 附注标签是存在在Git数据库中的一个完整对象，包括了打标签者、打标签时间、标签的附注信息等额外的信息。
// 可以通过git show <标签名>来看到这两种标签的信息

// 创建附注标签
git tag -a <标签名> -m "<备注信息>"
// git tag -a v1.4 -m "my version 1.4"

// 创建轻量标签，不需要指定任何参数
git tag <标签名>
// git tag v1.4

// 上面都是对当前分支最新的commit创建标签，也可以对过去的某个commit打tag
git tag -a <标签名> <commit-id>
// git tag -a v1.4 26e1d22
```

其他操作如下：

```
// git push默认不会把tag推送到远程库（但是pull默认会获取tag），需要显示推送标签，操作和推送分支一样
// 推送指定的标签到远程库
git push <远程库别名> <本地标签名>
// git push origin v1.4

// 使用--tags参数来一次性推送所有不在远程库的标签
git push <远程库别名> --tags
// git push origin --tags


// 删除标签需要-d参数
git tag -d <标签名>
// git tag -d v1.4

// 删除远程库标签有两种方式
// 方式一：将空标签推送到指定的远程库标签
git push <远程库别名> :refs/tags/<标签名>
// git push origin :refs/tags/v1.4

// 方式二：使用--delete，需要Git版本大于v1.7.0才能使用
git push <远程库别名> --delete <标签名>
// git push origin --delete v1.4


// 检出标签
// tag是快照读，直接检出到指定的tag会使仓库处于detached HEAD状态，此时不能更改代码
// 如果需要回到某个tag并修改代码，需要创建对应的分支。当在该分支上提交后，可能需要一个新的tag来标注最新的提交
git checkout -b <新建分支名> <标签名>
// git checkout -b version1.4 v1.4
```

## 参考链接

* [Git远程操作详解](http://www.ruanyifeng.com/blog/2014/06/git_remote.html)
* [git的add、commit、push的详细介绍](https://www.jianshu.com/p/2e1d551b8261)
* [git的hard、soft、mixed参数比较](https://blog.csdn.net/weixin_40295575/article/details/91816937)
* [git_04_回退到上个版本](https://www.cnblogs.com/mini-monkey/p/12032051.html)
* [Git基础操作：将git commit id转成short commit id](https://blog.csdn.net/hl_java/article/details/91424506)
* [2.6 Git 基础 - 打标签](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E6%89%93%E6%A0%87%E7%AD%BE)