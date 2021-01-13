# cmd,bat和dos的区别

## 区别

dos是磁盘操作系统(Disk Operating System)，是个人计算机上的一类操作系统。

bat是DOS命令，在任何dos环境下都可以使用。
bat文件是dos下的批处理文件，批处理文件是无格式的文本文件，它包含一条或多条命令，后缀为.cmd或.bat，在Windows NT系统中，两者没有任何区别。
<!--more-->
cmd是cmd.exe，是Win32命令，只能在32位系统中的命令行窗口中使用，仅仅是基于windows环境下的假DOS。
cmd文件的描述是“windows nt命令脚本”，bat文件的描述是“ms dos批处理文件”；两者所使用的命令行代码是共用的，只是cmd文件中允许使用的命令要比bat文件多。cmd文件只有在windows2000以上的系统中才能运行，而bat文件则没有这个限制。在Windows NT系统中，这两种批处理文件由cmd.exe解释执行。在cmd命令提示符窗口键入批处理文件名，或者直接双击批处理文件，即可执行，系统会去调用cmd.exe按照该文件中各个命令出现的顺序来逐个运行。

## 参考链接

* [cmd文件和bat文件有什么区别](http://www.cnblogs.com/widget90/p/9253151.html)
* [bat和cmd文件是什么，dos又是什么东西](https://blog.csdn.net/qq_26591517/article/details/80384186)
* [关于CMD和BAT](https://zhidao.baidu.com/question/145761173.html)

