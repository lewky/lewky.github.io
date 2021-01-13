# 如何使用Tomcat自带的日志实现tomcat-juli.jar

## 前言

Tomcat自带的日志实现是`tomcat-juli.jar`，它是对默认的JDK日志java.util.logging进行一定的封装，和标准JDK日志支持相同的配置，但是和log4j等常用的日志框架比起来功能要较为简陋。但是tomcat-juli可以针对不同的classloader来使用不同的配置文件，使得tomcat下不同的Web应用程序可以使用各自独立的日志文件。

如果我们想在代码中使用Tomcat自带的日志实现，也很简单，首先拿到tomcat-juli.jar。该jar包存在于Tomcat安装目录下的lib下，或者你可以直接在[Maven仓库](https://mvnrepository.com/)里选择你想要的版本去下载。

接着新建一个java项目，导入该jar包，然后在根目录下新建一个配置文件`logging.properties`。
<!--more-->
## 配置文件logging.properties

tomcat-juli使用的配置文件是logging.properties，一个简单的配置如下：
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

## 测试类

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

## 输出结果

控制台输出如下：
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

## 参考链接

* [Java Util Logging - Loading logging.properties](https://www.logicbig.com/tutorials/core-java-tutorial/logging/loading-properties.html)
* [Tomcat日志系统详解](https://www.cnblogs.com/cb0327/p/6699126.html)