# Maven无法下载2.1.7.js7版本的itext依赖

## 问题与分析

某日忽然发现用Maven编译项目报错如下：

```java
Failed to collect dependencies at net.sf.jasperreports:jasperreports:jar:6.10.0
-> com.lowagie:itext:jar:2.1.7.js7: Failed to read artifact descriptor for com.lowagie:itext:jar:2.1.7.js7: 
Could not transfer artifact com.lowagie:itext:pom:2.1.7.js7
```
<!--more-->

一开始以为是网络不好连接不上远程库，或者远程库没有该jar包，后来发现在Maven中央仓库里也没找到`2.1.7.js7`版本的`itext`依赖。在Stack Overflow上查询后发现有不少人遇到同样的问题，都是由于使用了某个版本的`jasperreports`，最终导致了该错误。

由于在jasperreports的pom文件里指定了`2.1.7.js7`版本的`itext`依赖，而目前的Maven中央仓库或其他镜像仓库里是不存在这种带有`js7`等后缀版本。该版本是jasperreports为了修复一些bug而打上了补丁的版本，但是并没有release到中央库里，不过这些bug在更高版本里也被修复了，可以使用更高版本的itext来避免这些bug。

## 解决方法

排除jasperreports中的itext依赖并自行指定版本，pom如下：

```
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>6.10.0</version>
    <exclusions>
        <exclusion>
            <groupId>com.lowagie</groupId>
            <artifactId>itext</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
  <groupId>com.lowagie</groupId>
  <artifactId>itext</artifactId>
  <version>2.1.7</version>
</dependency>
```

这里的itext版本根据自身实际情况指定，目前itext已停止维护，并从4.2.2之后的版本开始从`com.lowagie.itext`迁移到`com.itextpdf.itextpdf`，有需要的话可以使用更高版本的itextpdf依赖，pom如下：

```
<dependency>
    <groupId>jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>6.10.0</version> <!--(or higher)-->
    <exclusions>
        <exclusion>
            <groupId>com.lowagie</groupId>
            <artifactId>itext</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13</version> <!--(or higher)-->
</dependency>
```

## 参考链接

* [Dependency error in jasper-reports from itext](https://stackoverflow.com/questions/31314373/dependency-error-in-jasper-reports-from-itext)
* [IText, A Free Java PDF Library](https://mvnrepository.com/artifact/com.lowagie/itext)