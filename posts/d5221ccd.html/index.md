# Linux - /bin/sh^M: bad interpreter: No such file or directory

## 问题

在Windows环境下用Notepad++写了个shell脚本，上传到Linux平台后运行报错如下：
```shell
/bin/sh^M: bad interpreter: No such file or directory
```
<!--more-->

经过查阅资料才知道，这是由于文件格式的问题：使用vi/vim进入该shell文件，按下`:`进入末行模式，输入`set ff`查询文件格式，结果如下：
```shell
fileformat=dos
```

这个问题是由于不同的操作系统使用了不同的符号来换行导致的，可以简单参考下下面的表格：

|系统|换行符|
|:-:|:-:|
|DOS|CR/LF|
|UNIX|LF|
|MAC|CR|

如果通过Windows下的Git将文件提交到Linux上的服务器，也会收到换行符将被替换的消息通知。

## 解决方案

通过vi/vim进入想要修改的文件，按下`:`进入末行模式，输入`set fileformat=unix`，接着按下`ZZ`或者按下`shift + z + z`或者输入`:x`或者`:wq`保存修改即可。

## 参考链接

* [bash: ./a.sh: /bin/bash^M: bad interpreter: No such file or directory的解决方法](https://blog.csdn.net/youzhouliu/article/details/79051516)
* [DOS、Mac 和 Unix 文件格式+ UltraEdit使用](https://www.cnblogs.com/yelongsan/p/10025134.html)
* [DOS文件转换成UNIX文件格式详解](https://www.cnblogs.com/chengd/p/7809430.html)