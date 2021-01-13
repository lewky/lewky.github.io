# 升级Log4j到Log4j2报错：cannot access org.apache.http.annotation.NotThreadSafe

## 问题与分析

今天把项目的log4j的依赖改成了log4j2的依赖后，发现使用Maven打包时报错如下：
```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.1:compile (default-compile) on project cbx-core: Compilation failure
[ERROR] cannot access org.apache.http.annotation.NotThreadSafe
[ERROR] class file for org.apache.http.annotation.NotThreadSafe not found
```

<!--more-->
意思很清楚，找不到类`NotThreadSafe`。当我把log4j2改回来log4j后重新打包就不再报错，很明显，和log4j2有关。

纳闷的是，我先前独自写了个测试类是没问题的，怎么一到项目里使用就报错了呢？Eclipse里也没有报错，看了下pom的依赖层级，也没发现有什么jar包冲突。百度了下，发现了问题原因。

该问题是因为httpclient和httpcore两个jar包版本不匹配造成的。由于项目里使用了ElasticSearch，需要httpclient等相关的依赖，其中有两个依赖如下：
```xml
<dependency>
	<groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.2</version>
</dependency>
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpcore</artifactId>
    <version>4.4.5</version>
</dependency>
```

原本在使用log4j的时候，项目可以正常打包，但当改成log4j2的时候，需要使用到httpcore包中的某个注解，但由于在`4.4.5`版本的httpcore中舍弃了一些注解，于是就报错说找不到NotThreadSafe。

根据Apache的jira issue：[HDFS-12527](https://issues.apache.org/jira/browse/HDFS-12527)来看，里边的comment提到了：
```
The problem is that the httpclient and httpcore versions are incompatible.
```

根据comment来看，httpcore是httpclient的依赖，比较合适的版本应该是4.5.2的httpclient和4.4.4的httpcore。

而从pom的依赖层次看，4.5.2的httpclient本身就是依赖了4.4.4版本的httpcore；但由于项目里偏偏引入更高版本的httpcore，平时固然没问题，但一旦导入某些jar包譬如log4j2，就会编译报错。

## 解决方法

将httpcore的版本改成4.4.4(低于4.4.5即可)，重新进行Maven打包操作，结果编译成功，顺利打包。

## 参考链接

* [Error:java: 无法访问org.apache.http.annotation.ThreadSafe 找不到org.apache.http.annotation.ThreadSafe的类文件](https://blog.csdn.net/jfqqqqq/article/details/81464236)
* [javadoc: error - class file for org.apache.http.annotation.ThreadSafe not found](https://issues.apache.org/jira/browse/HDFS-12527)