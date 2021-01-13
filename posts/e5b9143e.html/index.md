# Tomcat - ClassFormatException的解决方法

## 问题与分析

在使用Tomcat7运行web项目时报错如下：
```
严重: Compilation error
org.eclipse.jdt.internal.compiler.classfmt.ClassFormatException
at ....
```

仔细查看了报错的堆栈信息，发现基本说的都是无法编译jsp的错误。百度了一番，才明白原来是因为Tomcat7和jdk8存在着不兼容的情况。Tomcat通过ecj.jar来编译jsp，这个ecj是Eclipse自己开发和使用的针对Java的编译器。
<!--more-->

ecj即the Eclipse Compiler for Java，Eclipse并没有使用JDK自带的编译器，而是使用自己开发的ecj编译器，而ecj也通过了java的验证。除了Eclipse之外，Tomcat也用到了ecj，用于动态编译jsp文件，可以在Tomcat的lib目录下找到该jar包。

而这个ClassFormatException，就是因为Tomcat7使用的ecj.jar版本比较低，里边使用的是较低版本的jdk，导致无法在jdk8的环境下去编译jsp文件。

## 解决方案

### 方案一

既然是Tomcat7和jdk8不兼容导致的，那么我们只要使用Tomcat8或者jdk7自然就没这个问题了。如果希望还是使用Tomcat7和jdk8来运行项目，就需要使用方案二了。

### 方案二

将Tomcat7的lib目录下的ecj.jar换成Tomcat8里边的ecj.jar，比如说将ecj3.7.2换成ecj.4.4.2，这样就可以让Tomcat7和jdk8兼容了。如果你懒得去下载Tomcat8然后获取里边的高版本ecj.jar，可以去Maven中央仓库获取对应版本的ecj.jar：https://mvnrepository.com/artifact/org.eclipse.jdt.core.compiler/ecj

## 参考链接

* [jdk1.8+Tomcat7.0小版本无法兼容问题解决](https://blog.csdn.net/huwenshang/article/details/77703821)
* [(ecj)Eclipse的Java编译器分析之一——ecj介绍](https://www.cnblogs.com/Johness/p/3525032.html)