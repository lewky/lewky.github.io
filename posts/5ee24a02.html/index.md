# Tomcat日志文件的输出在Linux和Windows下的差异

## 前言

最近老大发现Tomcat的日志文件catalina.out里存在着大量的和公司项目相关的log信息，因为一般都是会使用日志框架并另外将log信息输出到另外的文件里的，catalina.out文件里就不需要这些多余的log信息了。

不过我在测试的时候发现，Linux和Windows下catalina.out文件的输出是有区别的。
<!--more-->

## 在Linux和Windows下的差异

在Windows平台下，所有`System.out`, `System.err`以及`printStackTrace()`输出的log信息都会在Tomcat的控制台(console，就是通过`startup.bat`启动的命令行窗口)里输出，但是并不会被输出到catalina.out里。

而在Linux平台，上述的api会把信息输出到catalina.out里。而企业项目一般都是部署在Linux平台上的，日积月累之下catalina.log文件将会变得异常庞大，拖累系统性能，也不利于定位bug，可以通过修改日志配置文件改变存储策略。

## 参考链接

*. [Tomcat日志输出在linux和windows差异](https://www.cnblogs.com/music180/p/5626903.html)