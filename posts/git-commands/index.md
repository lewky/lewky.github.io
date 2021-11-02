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

## 参考链接

* [Git远程操作详解](http://www.ruanyifeng.com/blog/2014/06/git_remote.html)