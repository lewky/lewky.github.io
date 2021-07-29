# Maven问题汇总

## `java.lang.StackOverflowError`

服务器上的Jenkins在集成项目时报错如下：

```java
error compiling: java.lang.StackOverflowError -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
```

错误很明显，堆栈溢出，要么是jvm设置的线程栈太小，要么是代码有问题。而服务器每天晚上都会自动集成，jvm参数也不会有人去改过，很明显是最近提交的代码有问题。
<!--more-->

审查了代码，发现是某个测试类中有段代码里调用了一个API，该API又调用了四百多个API。这个API的目的是检测pojo里的字段是否和数据库的字段匹配，一个字段对应一个API，总共有四百多字段。Jenkins在跑单元测试跑到这里就堆栈溢出了。

毕竟是测试类的代码，改动时逻辑照旧，只不过不继续在一个API去直接调用四百个API，而是将其分成两个新的方法，每个方法各自调用两百个API，然后原本的API调用新增的两个方法。

之后提交代码，重新让Jenkins集成代码，发现不再报错。

当然了，也可以直接在启动脚本里简单粗暴调大线程栈大小：

```java
set MAVEN_OPTS=-Xss4096k
或者
set MAVEN_OPTS=-Xss2m
```

这里顺便贴一下项目脚本原本设置的参数：
```java
echo off
setlocal
set MAVEN_DEBUG_OPTS=-Duser.timezone=GMT+8 -Xdebug -Xmx4096M -XX:PermSize=128M -XX:MaxPermSize=512M -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=8088,server=y,suspend=n
mvn spring-boot:run
endlocal
```

## `java.awt.FontFormatException: bad table, tag=`

Java加载外部字体时报错`FontFormatException`，Maven在编译项目时使用`-X`开启debug模式同样可以看到该异常。原因是使用了`resource`插件的`filtering`功能，`filtering`为`true`时可以使用系统变量或者启动参数来替换资源文件的占位符`${}`的值。但也会导致Maven打包时对资源文件重新进行编译，而这些资源文件自身有着特定的编码，被Maven重新编码后文件损坏，于是就会触发该异常。

处理方式很简单，不再过滤特定的资源文件，如字体、excel等，避免对其重新编码。下面是demo：

```java
<plugins>
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-resources-plugin</artifactId>
        <configuration>
            <!-- 过滤后缀不需要转码的文件后缀名.crt/.ttf-->
            <nonFilteredFileExtensions>
                <nonFilteredFileExtension>ttf</nonFilteredFileExtension>
                <nonFilteredFileExtension>xlsx</nonFilteredFileExtension>
                <nonFilteredFileExtension>xls</nonFilteredFileExtension>
                <nonFilteredFileExtension>zip</nonFilteredFileExtension>
                <nonFilteredFileExtension>cer</nonFilteredFileExtension>
                <nonFilteredFileExtension>pfx</nonFilteredFileExtension>
                <nonFilteredFileExtension>py</nonFilteredFileExtension>
            </nonFilteredFileExtensions>
        </configuration>
    </plugin>
</plugins>
```

这个`nonFilteredFileExtensions`标签和`exclude`是不同的，前者依然会打包文件，只是不对其进行重新编译；后者是在打包时直接排除对应的文件。

`include`是指定打包时需要哪些文件，但`include`和`exclude`的配置冲突时，以后者为准。

## 参考链接

* [Maven执行install命令出现Exception in thread "main" java.lang.StackOverflowError](https://juejin.im/post/5ae4218a6fb9a07ac90cf586)
* [java读取字体文件tff，报错java.awt.FontFormatException: bad table, tag=一串数字](https://lisheng0305.blog.csdn.net/article/details/115235477)
* [人生苦短，你需要maven，resource、filter、include、exclude简单说明及使用](https://blog.csdn.net/u012643122/article/details/95030849)