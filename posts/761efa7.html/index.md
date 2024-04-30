# cmd - 命令行窗口中文乱码

## 问题

在cmd窗口中输入`curl www.baidu.com`可以看到有中文乱码的现象，这是因为默认使用的是GBK编码。另外，curl是利用URL语法在命令行方式下工作的开源文件传输工具。它被广泛应用在Unix、多种Linux发行版中，并且有DOS和Win32、Win64下的移植版本，在win10的cmd中有内嵌curl。
<!--more-->

```cmd
C:\Users\lewis.liu>curl www.baidu.com
<!DOCTYPE html>
<!--STATUS OK--><html> <head><meta http-equiv=content-type content=text/html;charset=utf-8><meta http-equiv=X-UA-Compatible content=IE=Edge><meta content=always name=referrer><link rel=stylesheet type=text/css href=http://s1.bdstatic.com/r/www/cache/bdorz/baidu.min.css><title>鐧惧害涓€涓嬶紝浣犲氨鐭ラ亾</title></head> 
...
```

## 解决方法

在cmd窗口中输入：
```cmd
CHCP 65001
```

回车后重新输入上边的curl命令，会发现不再中文乱码。不过这种方法只对当前的cmd窗口有效果，如果退出当前窗口重新打开一次cmd，你会发现依然中文乱码。如果想要一次性解决这个问题，需要去修改注册表。这个方法这里就不说了，有兴趣的可以查看下边的参考链接。

> CHCP是一个计算机指令，能够显示或设置活动代码页编号。
代码页  描述
65001   UTF-8代码页
950 繁体中文
936 简体中文默认的GBK
437 MS-DOS 美国英语

可以通过右键cmd窗口，点击属性查看当前的活动代码页编码(Current Code Page)。

## 参考链接

1. [windows下使用curl命令 && 常用curl命令](https://www.cnblogs.com/zhuzhenwei918/p/6781314.html)
2. [windows 控制台cmd乱码的解决办法](https://blog.csdn.net/taoshujian/article/details/60325996)