# Git问题汇总

## 初次配置用户名和邮箱

Git在push时需要使用到user.name和user.email，一般通过命令来进行配置或修改。

```
//查看user.name
git config user.name

//查看user.email
git config user.email

//配置user.name
git config --global user.name "your user name"

//配置user.email
git config --global user.email "your user email"
```
<!--more-->

这里需要注意的是，**配置命令只能用于初次配置user.name/email，如果不小心配置错误，或者重复配置，不可以通过重复执行以上命令来修改user.name/email，否则可能或报错说无法重复配置，或者导致一个key配置了多个value。**

## 修改user.name/user.email

如果想要修改已经配置过的user.name或email，有两种方式，一种是通过命令来修改；一种是直接修改.gitconfig文件。

### 方式一：通过命令修改

	//修改user.name
	git config --global --replace-all user.name "your user name"

	//修改user.email
	git config --global --replace-all user.email"your user email"

### 方式二：修改.gitconfig文件

* 该文件是隐藏文件，位于`C:\Users\{user}\.gitconfig`，直接修改里边的name或者email，如果有重复的name或email，可以将其删掉，只剩下一个就好。
* 修改完，通过git bash输入git config --list可以查看是否修改成功了。

## `.gitignore`文件的作用

`.gitignore`文件用来忽略被指定的文件或文件夹的改动，被记录在`.gitignore`文件里的文件或文件夹，是无法被git跟踪到的，换句话说，被忽略的文件是不会被放入到远程仓库里的。

也就是说，如果文件已经存在于远程仓库中，是无法通过`.gitignore`文件来忽略的。

`.gitignore`文件存放于git仓库的根目录下。

## `.gitignore`文件的语法

### 注释

`#`表示注释，如下：
```text
# Here is comment.
```

### 忽略文件/文件夹

直接写入文件或文件夹名即可，指定文件夹里的所有文件也会一起被忽略，如下：
```text
# ignore target folder
target/

# ignore Eclipse files
.settings/
build/
.classpath
.project
```

### 不忽略文件/文件夹

`!`表示不忽略指定的文件，如下：
```text
# don't ignore src folder
!src/
```

### 在指定文件夹里不忽略指定的文件

通过`!`可以实现更加有意思的用法，如下：
```text
# ignore scaffolds folder, but don't ignore draft.md under scaffolds folder.
scaffolds/*
!scaffolds/draft.md
```

**注意：这里必须在文件夹后面加上`/*`，否则是无法实现想要的效果的。并且被忽略的文件和想要不忽略的文件必须是同一路径，否则无法生效。**如下的写法就是不能生效的：
```text
# ignore scaffolds folder, but don't ignore draft.md under scaffolds folder.
scaffolds/*
!scaffolds/test/draft.md
```

想要生效就要改成同一目录：
```text
# ignore scaffolds folder, but don't ignore draft.md under scaffolds folder.
scaffolds/test/*
!scaffolds/test/draft.md
```

### 使用通配符及其他符号

可以使用通配符及其他符号来指定复杂条件的文件，如下：

```text
*.log
day_1?.txt
hello[0-9].txt
hi[^0-9].txt
```

* `*`表示匹配任意字符；
* `?`表示匹配一个字符；
* `[]`表示匹配中括号内的单个字符：
    * 可以使用`-`来表示连贯的字符，比如`0-9`，`a-z`，`A-Z`等，`[0-9]`表示匹配从0到9的单个字符。
    * 可以使用`^`来表示除外，比如`[^0-9]`表示除0到9之外的单个字符。

## .gitignore怎么忽略已经被版本控制的文件

如果某个文件已经存在于远程仓库了，也就是说某个文件已经被版本控制了，如果将该文件添加到`.gitignore`中，是无法生效的。因为`.gitignore`是用来控制尚未被纳入版本控制的文件，如果文件已经存在于远程库中，自然也就无法生效了。

于是就此衍生了一个问题：`.gitignore`怎么忽略已经被版本控制的文件？

### 方法一

直接在远程库里将想要忽略的文件删除掉，再将该文件写入`.gitignore`中即可。

**这种做法的前提是，你确定该文件是允许从远程库删除掉的**，然而有些时候，这种做法是不可能的。要么没权限去远程库删掉该文件，要么该文件是必须的。

### 方法二

使用命令`git rm --cached filename`，然后将该文件写入`.gitignore`中即可。

该命令表示从git仓库中将文件移除，不再进行版本控制，但保留工作区的该文件。

需要注意的是，该命令其实和方法一差不多。`git rm`表示移除某个文件，`--cached`表示从暂存区中移除，如果不加该参数就是直接从工作区移除了。

工作区就是指的Working Tree，暂存区就是指的Stage。工作区就是我们的磁盘，被版本控制的文件都存放于工作区。如果改动了某个文件，首先要将该文件添加到暂存区(Stage)，然后再提交(commit)到本地仓库，最后才推送(push)到远程库。

`git rm --cached filename`并不会从物理上删除文件，只是从暂存区中将文件删除。由于该文件原本已经被版本控制了，使用了该命令后，虽然保留了工作区的该文件，但是却会在暂存区中生成一个删除了该文件的记录，如果此时进行commit，就会把版本库里的该文件给删掉了，如果push到远程库，也会被删掉。**最终还是走的方法一的路子。**

### 关于`git rm --cached filename`的补充

看到有篇文章举例很详细，如下：
* 新建文件1.txt，未被跟踪(Untracked files)，提交到暂存区(Changed to be committed)，未提交到版本库。 使用`git rm —cached 1.txt`：
    * 把文件恢复到未被跟踪的状态，即删除暂存区中的1.txt；
* 文件1.txt，已经提交到版本库，工作区，暂存区都是干净的。使用`git rm —cached 1.txt`：
    * 把工作区的文件1.txt置为了”未跟踪”状态，即Untracked files
    * 暂存区生成一个deleted 1.txt的记录，如果提交了，就是把版本库中的1.txt删除。
    * 不影响工作区中的文件。
* 文件1.txt, 已经提交到版本库，修改1.txt，并且提交到了暂存区。使用`git rm —cached 1.txt`：
    * 把工作区的文件1.txt置为了”未跟踪”状态，即Untracked files。 
    * 暂存区生成一个deleted 1.txt的记录，如果提交了，就是把版本库中的1.txt删除。 
    * 不影响工作区中的文件。还是修改后的1.txt
* 文件1.txt, 已经提交到版本库，修改1.txt，提交到暂存区，继续修改1.txt。使用`git rm —cached 1.txt`   会报错，不能执行操作。

## Git - Merge: refusing to merge unrelated histories

### 场景

我在本地有个代码仓库local-A，本地仓库local-A已经和一个远程仓库remote-A关联了。

接着我又在GitHub上新建了一个仓库remote-B，我希望将本地仓库local-A的本地dev分支push到这个新建的远程库remote-B。我的想法是这样的：

1. 在本地仓库local-A里添加刚刚新建的远程库remote-B
2. 检出(check out)并切换到remote-B的master分支
3. 将本地dev分支merge到当前的master分支
4. 解决可能发生的冲突后，将改动全部commit并push到远程库remote-B的master分支上

接着当我做到第三步的时候，发现报错如下：
```
Merge: refusing to merge unrelated histories
```

看到报错，我又重新操作了一遍，依然是同样的错误。记得以前我也做过类似的操作，但是却没有现在的问题，百度了下，发现可能是git升级之后造成的。

### 解决方案

因为两个仓库是不同的项目(本地仓库已经跟踪了另外一个远程库了)，git默认不允许不相干的项目进行push等操作。如果想要进行这些操作，就需要加入`--allow-unrelated-histories`参数才可以合并两个不同的项目：

```git
git merge --squash dev --allow-unrelated-histories
```

这句命令表示将`dev`分支合并到当前分支，这里的两个本地分支各自追踪不同的远程库，需要加入`--allow-unrelated-histories`参数才能够完成合并操作而不报错，至于`--squash`参数是为了压缩`dev`分支原本的commit历史，可以将原本所有的commit历史合成一个commit，以避免当前分支在合并之后掺入了其他项目的commit历史。

## warning: LF will be replaced by CRLF

这个问题由不同平台的换行符不同所造成：

* CR是回车，CarriageReturn，即`\r`（return）。LF是换行，LineFeed，即`\n`（newline）。
* Dos和Windows平台使用CRLF来结束一行。
* Mac和Linux平台使用LF来结束一行。（最早Mac以CR来结束一行，后改为了LF）

**影响：**

* Unix/Mac系统下的文件在Windows里打开，所有文字会变成一行。
* Windows的文件在Unix/Mac下打开，在每行的结尾可能会多出一个`^M`符号。
* Linux保存的文件在windows上用记事本查看会出现黑点。

**解决方法：**

为了避免git管理的项目中出现混合的换行符，通常会将项目的换行符设置为`LF`。

对于Windows平台，git的客户端默认设置为`core.autocrlf=true`。在提交文件时，会自动将换行符转换为`LF`，在检出文件时则自动转为`CRLF`。

```
git config --global core.autocrlf true
```

对于Mac和Linux平台，可以将配置设置为`input`。这样在提交文件时会转为`LF`，检出时则不转换。

```
git config --global core.autocrlf input
```

如果只使用Windows平台进行开发并运行项目，可以设置为`false`，来取消git自动转换换行符的功能。

```
git config --global core.autocrlf false
```

还可以配置`core.safecrlf`来改变git对于换行符的检查行为：

```
#拒绝提交包含混合换行符的文件
git config --global core.safecrlf true   

#允许提交包含混合换行符的文件
git config --global core.safecrlf false   

#提交包含混合换行符的文件时给出警告
git config --global core.safecrlf warn
```

可以通过以下命令来查询Git的配置：

```
// 查询配置
git config -l

// 查询全局配置
git config -l  --global
```

## 统计代码提交行数

可以在`git bash`里用`git log`命令来统计，部分参数说明如下：

```
--author   指定作者
--stat   显示每次更新的文件修改统计信息，会列出具体文件列表
--shortstat    统计每个commit 的文件修改行数，包括增加，删除，但不列出文件列表
--numstat   统计每个commit 的文件修改行数，包括增加，删除，并列出文件列表
--pretty 使用其他格式显示历史提交信息
--pretty=tformat	可以定制要显示的记录格式
--since, --after 仅显示指定时间之后的提交
--until, --before 仅显示指定时间之前的提交

-w 显示字数
-c 显示Bytes数
-l 显示行数
```

统计某段时间内的提交：

```
git log --since ==2021-09-01 --until=2021-10-05 | wc -l
```

统计当前用户的代码提交量，包括增加、删除：

```
git log --author="$(git config --get user.name)" --pretty=tformat: --numstat | gawk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "added lines: %s removed lines : %s total lines: %s\n",add,subs,loc }'
```

统计仓库排名前五的提交：

```
git log --pretty='%aN' | sort | uniq -c | sort -k1 -n -r | head -n 5

--按照邮箱来统计排名前五的提交（邮箱名不同，但是用户名可以相同）
git log --pretty=format:%ae | gawk -- '{ ++c[$0]; } END { for(cc in c) printf "%5d %s\n",c[cc],cc; }' | sort -u -n -r | head -n 5
```

贡献者统计：

```
git log --pretty='%aN' | sort -u | wc -l
```

提交数统计：

```
git log --oneline | wc -l
```

添加或修改的代码行数：

```
git log --stat|perl -ne 'END { print $c } $c += $1 if /(\d+) insertions/;'
```

## git reset --hard HEAD^后显示more?

如果在cmd窗口中输入`git reset --hard HEAD^`会显示`more?`，原因是`^`在cmd窗口中代表换行符，因此这里会通过回显`more?`来询问你是否还需要输入更多命令。

解决方法有如下几种：

* 加引号：`git reset --hard "HEAD^"`
* 加一个`^`进行转义：`git reset --hard HEAD^^`
* 换成`~`：`git reset --hard HEAD~` 或者 `git reset --hard HEAD~1`

`~`后面的数字表示回退几次提交，默认是一次。

如果使用`git bash`或者`powershell`则不会出现该问题。

## 参考链接

* [.gitignore 规则写法 - 在已忽略文件夹中不忽略指定文件、文件夹【注意项】](https://my.oschina.net/longyuan/blog/521098)
* [.gitignore无效，不能过滤某些文件](https://blog.csdn.net/zhangjs0322/article/details/37658669)
* [git rm - - cached filename](https://blog.csdn.net/songtaiwu/article/details/79447572)
* [git忽略已经被提交的文件](https://segmentfault.com/q/1010000000430426)
* [如何去解决fatal: refusing to merge unrelated histories](https://blog.csdn.net/m0_37402140/article/details/72801372)
* [git merge --no-ff是什么意思](https://segmentfault.com/q/1010000002477106)
* [关于git提示“warning: LF will be replaced by CRLF”终极解答](https://www.jianshu.com/p/450cd21b36a4)
* [用git统计代码提交行数](https://blog.csdn.net/carterslam/article/details/81162463)
* [git reset --hard HEAD^后显示more?的解决方案](https://blog.csdn.net/qq_32623363/article/details/78968077)