# Log4j2异常 - NoSuchMethodError: com.lmax.disruptor.dsl.Disruptor

## 问题

项目使用了log4j2，由于使用了全局异步打印日志的方式，还需要引入disruptor的依赖，最后使用的log4j2和disruptor的版本依赖如下：
```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.11.1</version>
</dependency>
<!-- log4j2 AsyncLogger need disruptor-->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.2.0</version>
</dependency>
```
<!--more-->
在项目最开始的地方(第一次使用到log4j2的logger之前)，通过代码来启用全局异步打印日志：
```java
// use asyncLogger for log4j2 framework
System.setProperty("Log4jContextSelector", "org.apache.logging.log4j.core.async.AsyncLoggerContextSelector");
```

然而在启动项目后报错如下：
```
java.lang.NoSuchMethodError: com.lmax.disruptor.dsl.Disruptor.<init>(Lcom/lmax/disruptor/EventFactory;ILjava/util/concurrent/ThreadFactory;Lcom/lmax/disruptor/dsl/ProducerType;Lcom/lmax/disruptor/WaitStrategy;)V
        at org.apache.logging.log4j.core.async.AsyncLoggerDisruptor.start(AsyncLoggerDisruptor.java:97)
        at org.apache.logging.log4j.core.async.AsyncLoggerContext.start(AsyncLoggerContext.java:75)
	at .......
```

## 解决方法

该问题是因为Disruptor的版本较低导致，将版本改用较新版本的即可：
```xml
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

