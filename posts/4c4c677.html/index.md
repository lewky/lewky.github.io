# Java - 安装jdk并设置环境变量

## 前言

双十一买了台新的笔记本，需要重新安装下Java，这里记录下安装的过程，毕竟万事开头难，就算是老手也不一定能一次就把Java安装成功。

## 安装jdk

作为一名Java开发，当然是要安装jdk了，如果只是需要Java的运行环境，那么安装jre就足够了。另外说下，jdk里以及包含了jre了。

首先去[官网](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)下载Java，由于Sun被Oracle收购了，现在去官网下载Java需要先注册一个Oracle账号，虽然麻烦了点，但是没办法，谁叫Oracle牛逼呢。

由于页面是全英文的，部分同学可能会懵逼，其实没什么，随便找一个版本下载就行。唯一需要注意的是，下载文件之前要先点击一下文件上方的同意协议，否则会提示你还没有同意协议。
<!--more-->

接着把下载好的文件启动，一路按照默认配置安装即可。当安装好jdk后，接下来的步骤就是配置环境变量了。不夸张的说，99%的同学都曾经倒在了环境变量的配置上，甚至直接就放弃安装Java了。

## 配置环境变量

环境变量其实就是定义给系统使用的变量，当使用到这些变量时，会自动替换成对应的路径名，以便找到程序或者命令。而环境变量分为用户变量和系统变量，顾名思义，用户变量是给当前的电脑用户使用的，系统变量是所有用户公用的。我们只要配置成用户变量就行，如果你想定义成系统变量也没问题。

配置Java的环境变量其实很简单，一共就三个环境变量：
* JAVA_HOME
* PATH
* CLASSPATH

**注意，所有环境变量的变量值都是使用的英文符号！！别写成中文的分号、冒号等符号了！！**

### JAVA_HOME

这个变量名指的是Java的安装路径，其实很多程序在安装的时候，都会自动给你新建一个对应的环境变量XXX_HOME。不过Java并没有自动给我们新建该变量，所以需要我们自己来创建。另外很多程序，比如Eclipse、Maven、Tomcat等等，都会使用到这个变量。

新建一个环境变量JAVA_HOME，然后在变量值里输入你的jdk安装路径，比如我的是`C:\Program Files\Java\jdk1.7.0_80`。

### PATH

这个变量是系统本身就有的，当你在cmd窗口里执行命令的时候就会去这个PATH变量里找到对应的路径，如果找不到就会报错。这一步我们需要在PATH的变量值里加上`%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin`，**最好是将这段变量值加在最前面，如果是加在最前面，还需要在末尾加上英文的分号**。

### CLASSPATH

这个变量需要我们新建，变量名是CLASSPATH，变量值是`.;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar`，请别在变量值的末尾画蛇添足加上分号。

该变量的作用是用来寻找类文件的路径，如果该变量值不对，就会导致javac命令找不到的错误。

## 测试jdk和环境变量

### java -version

`win+R`打开运行程序，输入`cmd`接着回车，在cmd窗口里输入`java -version`，正常的情况是能得到类似如下的信息：
```
C:\Users\Lewis>java -version
java version "1.7.0_80"
Java(TM) SE Runtime Environment (build 1.7.0_80-b15)
Java HotSpot(TM) 64-Bit Server VM (build 24.80-b11, mixed mode)
```

### javac -version

在cmd窗口里输入`javac -version`，正常的情况是能得到类似如下的信息：
```
C:\Users\Lewis>javac -version
javac 1.7.0_80
```

这两个命令的区别是，前者是用来执行java程序或者命令的，后者是用来编译java文件的。javac就是指的java compiler。

## win10下的环境变量问题

如果是win10，在配置环境变量时，一般是弹出表格，然后一行一行地输入变量值，而不是像上边那样需要使用英文分号来分隔开。有可能会发生配置好环境变量后，在输入`java -version`能得到正常的结果，而在输入`javac -version`后却是显示的：
```
C:\Users\Lewis>javac -version
'javac' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
```

解决办法很简单，先检查你的JAVA_HOME是否路径正确，是否使用了错误的中文符号等；接着检查另外两个变量是否书写正确。因为win10第一次配置环境变量时是一行一行地在表格里输入的，后面重新打开的时候就变回了win7/8那种格式，你会发现CLASSPATH变量的变量值莫名被加上了双引号(我本人就是属于这种情况)，把双引号去掉后重新保存环境变量；接着关闭原本的cmd窗口，重新打开cmd窗口进行测试，测试成功。

如果依然是一行一行输入变量值的表格形式，需要把分号去掉，然后分成多行各自输入，且末尾不能有英文分号，另外最好把变量值上移到顶端。

注意，如果改变了环境变量，必须要把原本的cmd窗口关掉才行，因为原本的cmd窗口依然使用的是你修改之前的环境变量。

## 参考链接

* [java 安装教程](https://www.cnblogs.com/xuyangblog/p/5455381.html)
* [window10下java环境变量的配置 javac不是内部或外部命令的问题](https://www.cnblogs.com/weedboy/p/6920378.html)