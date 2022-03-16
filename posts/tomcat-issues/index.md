# Tomcat问题汇总

## Tomcat日志文件的输出在Linux和Windows下的差异

最近发现Tomcat的日志文件catalina.out里存在着大量和公司项目相关的日志信息，因为一般都是会使用日志框架将日志信息输出到另外的文件里，catalina.out文件里是不需要这些多余的日志信息的。

<!--more-->
不过我在测试的时候发现，Linux和Windows下catalina.out文件的输出是有区别的。

在Windows平台下，所有`System.out()`, `System.err()`以及`printStackTrace()`输出的日志信息都会在Tomcat的控制台console（即通过`startup.bat`启动的命令行窗口）里输出，但是并不会被输出到catalina.out里。

而在Linux平台，上述的api会把信息输出到catalina.out里。而企业项目一般都是部署在Linux平台上的，日积月累之下catalina.log文件将会变得异常庞大，拖累系统性能，也不利于定位bug，可以通过修改日志配置文件改变存储策略。

## 如何使用Tomcat自带的日志实现tomcat-juli.jar

### 配置文件logging.properties

Tomcat自带的日志实现是`tomcat-juli.jar`，它是对默认的JDK日志java.util.logging进行一定的封装，和标准JDK日志支持相同的配置，但是和log4j等常用的日志框架比起来功能要较为简陋。不过tomcat-juli可以针对不同的classloader来使用不同的配置文件，使得tomcat下不同的Web应用程序可以使用各自独立的日志文件。

如果我们想在代码中使用Tomcat自带的日志实现，也很简单，首先拿到tomcat-juli.jar。该jar包存在于Tomcat安装目录下的lib下，或者你可以直接在[Maven仓库](https://mvnrepository.com/)里选择你想要的版本去下载。

接着新建一个java项目，导入该jar包，然后在根目录下新建一个配置文件`logging.properties`。

这个是tomcat-juli使用的配置文件，一个简单的配置如下：

```
handlers= java.util.logging.ConsoleHandler
.level= INFO
java.util.logging.ConsoleHandler.level = INFO
java.util.logging.ConsoleHandler.formatter = java.util.logging.SimpleFormatter

com.lewis.test.TestLewis.level = SEVERE
```

这里简单解释下，第一行表示使用ConsoleHandler来处理打印日志，用来将信息打印到控制台。

第二行表示输出的日志级别是INFO，可以在level前加上任意类名或者完整的包名，用于精准控制类/包的日志级别，譬如第三行。

第四行表示输出的日志信息日期格式。

更多具体的配置可以去看看Tomcat的conf目录下的logging.properties，里边有很多配置和注释。

另外提一下，tomcat-juli的日志级别和log4j等是不一样的，其级别如下：

```html
SEVERE (highest value) > WARNING > INFO > CONFIG > FINE > FINER > FINEST (lowest value)
```

此外：

* 如果希望不打印日志信息，可以将level设置为`OFF`。
* 如果希望打印全部的日志信息，可以将level设置为`ALL`。

### 测试类

测试类的代码如下：

```java
package com.lewis.test;

import java.io.NotSerializableException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TestLewis {

private static Logger LOGGER;

static {
System.setProperty("java.util.logging.config.file",
"D:\\lewis\\workspace\\test\\src\\main\\resources\\logging.properties");
//must initialize loggers after setting above property
LOGGER = Logger.getLogger(TestLewis.class.getName());
}

public static void main(final String[] args) {

System.out.println("----System.out----");
System.err.println("----System.err----");

LOGGER.info("an info msg");
LOGGER.warning("a warning msg");
LOGGER.severe("a severe msg");

LOGGER.log(Level.INFO, "test1: a info msg", new NotSerializableException());
LOGGER.log(Level.WARNING, "test1: a warning msg", new NotSerializableException());
LOGGER.log(Level.SEVERE, "test1: a severe msg", new NotSerializableException());

}
```

这里需要注意的是，tomcat-juli的打印语句也是不太一样的，如果需要打印出具体的堆栈信息就必须自己指定日志级别，如果使用自带的日志级别打印语句诸如`.info()`等，只能打印出字符串，不能打印出堆栈信息。

还有就是必须在代码的一开始就指定加载配置文件，通过`System.setProperty("java.util.logging.config.file",
"配置文件的路径");`。如果没有这一步，你会发现你的配置文件根本没有效果。如果你去Tomcat的bin目录下的catalina.bat可以发现，里边也是配置了这个参数：

```cmd
set LOGGING_CONFIG=-Djava.util.logging.config.file="%CATALINA_BASE%\conf\logging.properties"
```

测试类输出结果如下：

```
----System.out----
----System.err----
Dec 07, 2018 5:56:04 PM com.lewis.test.TestLewis main
SEVERE: a severe msg
Dec 07, 2018 5:56:05 PM com.lewis.test.TestLewis main
SEVERE: test1: a severe msg
java.io.NotSerializableException
        at com.lewis.test.TestLewis.main(TestLewis.java:75)
```

## ClassFormatException

在使用Tomcat7运行web项目时报错如下：

```
严重: Compilation error
org.eclipse.jdt.internal.compiler.classfmt.ClassFormatException
at ....
```

原因是Tomcat7和jdk8存在着不兼容的情况，Tomcat通过ecj.jar来编译jsp，这个ecj是Eclipse自己开发和使用的针对Java的编译器。

ecj即the Eclipse Compiler for Java，Eclipse并没有使用JDK自带的编译器，而是使用自己开发的ecj编译器，而ecj也通过了java的验证。除了Eclipse之外，Tomcat也用到了ecj，用于动态编译jsp文件，可以在Tomcat的lib目录下找到该jar包。

而这个ClassFormatException，就是因为Tomcat7使用的ecj.jar版本比较低，里边使用的是较低版本的jdk，导致无法在jdk8的环境下去编译jsp文件。

### 解决方案一

既然是Tomcat7和jdk8不兼容导致的，那么我们只要使用Tomcat8或者jdk7自然就没这个问题了。如果希望还是使用Tomcat7和jdk8来运行项目，就需要使用方案二了。

### 解决方案二

将Tomcat7的lib目录下的ecj.jar换成Tomcat8里边的ecj.jar，比如说将ecj3.7.2换成ecj.4.4.2，这样就可以让Tomcat7和jdk8兼容了。如果你懒得去下载Tomcat8然后获取里边的高版本ecj.jar，可以去Maven中央仓库获取对应版本的ecj.jar：https://mvnrepository.com/artifact/org.eclipse.jdt.core.compiler/ecj

## jvisualvm远程监控Tomcat应用

首先需要给Tomcat的启动文件`/bin/startup.sh`添加远程监控的启动参数，可以在`CATALINA_OPTS`里添加：

```
export CATALINA_OPTS="$CATALINA_OPTS
-Dcom.sun.management.jmxremote
-Djava.rmi.server.hostname=192.168.1.130
-Dcom.sun.management.jmxremote.port=7003
-Dcom.sun.management.jmxremote.ssl=false
-Dcom.sun.management.jmxremote.authenticate=true
-Dcom.sun.management.jmxremote.password.file=../conf/jmxremote.password
-Dcom.sun.management.jmxremote.access.file=../conf/jmxremote.access"
```

各参数解释如下：

```
-Dcom.sun.management.jmxremote  // 启用JMX远程监控
-Djava.rmi.server.hostname=192.168.1.130  // 这是连接你的Tomcat服务器地址
-Dcom.sun.management.jmxremote.port=7003  // jmx连接端口
-Dcom.sun.management.jmxremote.ssl=false  // 是否ssl加密
-Dcom.sun.management.jmxremote.authenticate=true  // 远程连接需要密码认证，如果配置成false则不需要配置下面的访问和密码两个参数
-Dcom.sun.management.jmxremote.password.file=../conf/jmxremote.password  // 指定连接的用户名和密码配置文件
-Dcom.sun.management.jmxremote.access.file=../conf/jmxremote.access  // 指定连接的用户所拥有权限的配置文件
```

然后添加对应的配置文件`/conf/jmxremote.access`，配置上需要远程连接的用户名和权限：

```
monitorRole readonly
controlRole readwrite
```

在`/conf/jmxremote.password`里配置对应的用户名和密码：

```
monitorRole test
controlRole dev
```

然后修改这两个配置文件的权限：

```
sudo chmod 600 jmx*
```

最后重启Tomcat即可生效，本地环境只需要打开`$JAVA_HOME/bin/jvisualvm.exe`即可远程监控：在远程选项上添加Tomcat所在的主机，输入刚刚配置的用户和密码即可。

## 参考链接

* [Tomcat日志输出在linux和windows差异](https://www.cnblogs.com/music180/p/5626903.html)
* [Tomcat日志系统详解](https://www.cnblogs.com/cb0327/p/6699126.html)
* [jdk1.8+Tomcat7.0小版本无法兼容问题解决](https://blog.csdn.net/huwenshang/article/details/77703821)
* [jvisualvm远程监控tomcat](https://www.cnblogs.com/leocook/p/jvisualvmandtomcat.html)