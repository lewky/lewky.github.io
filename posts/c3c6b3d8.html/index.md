# vi/vim打开文件提示Found a swap file by the name

## 问题分析

有一次在远程连接主机时，用vi打开文件`my.ini`却提示：`Found a swap file by the name ".my.ini.swp"`。百度了下才知道，原来在使用vi或vim命令打开一个文件后，就会产生一个.(filename).swp的文件。如果编辑完成之后，正常退出，那么这个swp文件就会被自动删除。

而之前我在使用vi操作该文件时发生了异常中断(非正常退出)，于是就在当前目录下生成了一个`.my.ini.swp`文件。在Linux中，以`.`开头的文件都是隐藏文件，可以通过使用`ll -a`或者`ls -a`来查看。
<!--more-->
这种swp文件是隐藏文件，有两个作用：

* 避免用多个程序编辑同一个文件时，产生两个不同的版本。
* 非常规退出时，文件恢复。

## 解决方法

### 删除swp文件

只要将swp文件删除，就不会再出现这个提示。可以通过`rm`命令来删除该文件。

### 禁止生成swp文件

如果想要禁止生成swp文件，可以通过修改vim的配置文件来实现。新建一个`~/.vimrc`文件，在文件中添加一行代码：

```bash
set noswapfile
```

这样该配置就只会对当前用户生效，你也可以直接修改`/etc/vimrc`文件，效果是一样的。

### 通过swp文件来恢复文件

swp文件可以用来恢复文件，假如你有一个swp文件`.my.ini.swp`，可以通过以下命令来恢复：

```bash
vi -r my.ini
```
恢复文件之后可以把swp文件删除，不然每次打开my.ini文件时都会提示。

## 参考链接

1. [linux下vi操作Found a swap file by the name](http://chenzhou123520.iteye.com/blog/1313585)
2. [非正常关闭vi编辑器时会生成一个.swp文件](https://www.cnblogs.com/quchunhui/p/7513586.html)


