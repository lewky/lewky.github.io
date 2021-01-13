# Log4j2 - 动态生成Appender

## 功能需求

项目里将User分成了各个区域(domain)，这些domain有个标志domainId，现在要求在打印日志的时候，不仅将所有User的日志都打印到日志文件`logs/CNTCore.log`中，还需要另外再打印到对应domain的日志文件`logs/{domainId}/CNTCore.log`。

比如User A的domainId是`RD2`，那么除了`logs/CNTCore.log`外，还需要将该User A的日志额外打印到`logs/RD2/CNTCore.log`中。

## 实现思路

将所有User的日志都打印到日志文件`logs/CNTCore.log`中，这个可以直接使用配置文件`log4j2.xml`来解决，一个简单的配置如下：
<!--more-->
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration monitorInterval="30">

	<Appenders>
		<Console name="stdout" target="SYSTEM_OUT">
			<PatternLayout pattern="%-5p %m%n" />
			<ThresholdFilter level="debug" onMatch="ACCEPT" onMismatch="DENY" />
		</Console>

		<RollingFile name="cntCorelog" immediateFlush="true" fileName="logs/CNTCore.log" filePattern="logs/CNTCore.log.%d{yyyy-MM-dd-a}.gz"
			append="true">
			<PatternLayout>
				<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS}:%p %t %X{TracingMsg} %c - %m%n</pattern>
			</PatternLayout>
			<Policies>
				<TimeBasedTriggeringPolicy modulate="true" interval="1" />
			</Policies>
		</RollingFile>
	</Appenders>

	<Loggers>
		<Logger name="com.lewis" level="debug" additivity="true">
			<AppenderRef ref="cntCorelog" />
		</Logger>
		<Root level="error">
			<AppenderRef ref="stdout" />
		</Root>
	</Loggers>

</configuration>
```

在上边的配置中，配置了`cntCorelog`这个appender来生成对应的回滚日志文件，具体由`com.lewis`这个logger来使用该appender进行拼接日志信息。

至于另外再打印到对应domain的日志文件`logs/{domainId}/CNTCore.log`，这个可以通过代码来动态生成各个domain的appender，并交由`com.lewis`这个logger来进行拼接日志。

## 代码的具体实现

### 项目的Log4j2依赖
```xml
<dependency>
	<groupId>org.apache.logging.log4j</groupId>
	<artifactId>log4j-core</artifactId>
	<version>2.11.1</version>
</dependency>
```

### 动态生成appender

```java
public static void createDomainAppender(final String domainId){
    final LoggerContext ctx = (LoggerContext) LogManager.getContext(false);
    final org.apache.logging.log4j.core.config.Configuration config = ctx.getConfiguration();
    if (config.getAppender(domainId + "DomainCntCoreLog") != null) {
        return;
    }
    final PatternLayout layout = PatternLayout.newBuilder()
            .withCharset(Charset.forName("UTF-8"))
            .withConfiguration(config)
            .withPattern("%d %t %p %X{TracingMsg} %c - %m%n")
            .build();
    final TriggeringPolicy policy = TimeBasedTriggeringPolicy.newBuilder()
            .withModulate(true)
            .withInterval(1)
            .build();
    final Appender appender = RollingFileAppender.newBuilder()
            .withName(domainId + "DomainCntCoreLog")
            .withImmediateFlush(true)
            .withFileName("logs/" + domainId + "/CNTCore.log")
            .withFilePattern("logs/" + domainId + "/CNTCore.log.%d{yyyy-MM-dd-a}.gz")
            .withLayout(layout)
            .withPolicy(policy)
            .build();
    appender.start();
    config.addAppender(appender);
    final KeyValuePair[] pairs = {KeyValuePair.newBuilder().setKey("domainId").setValue(domainId).build()};
    final Filter filter = ThreadContextMapFilter.createFilter(pairs, null, Result.ACCEPT, Result.DENY);
    config.getLoggerConfig("com.lewis").addAppender(appender, Level.DEBUG, filter);
    ctx.updateLoggers(config);
}
```

这段代码动态生成一个名为`omainCntCoreLog`的RollingFileAppender，该appender交由`com.lewis`这个logger来使用，并将日志信息输入到`logs/{domainId}/CNTCore.log`。

该logger在使用`omainCntCoreLog`这个RollingFileAppender时还设置了一个过滤器`ThreadContextMapFilter`，这个Filter用来控制logger只能对指定了domainId的进行打印日志。

ThreadContext是Log4j2用来存放线程信息的，相当于Log4j 1.X中的MDC和NDC，MDC是map，NDC是stack。当每个User登录时，就将该User的domainId存放到ThreadContext中，当退出登录时就将该domainId从ThreadContext中移除。

假如有10个User登录了，一个User对应一个线程，每个线程都存放了User对应的domainId。在用户登录时，调用上边的方法来动态生成domain appender；假如有10个domainId，就会生成10个domain appender。

由于这10个domain appender都被add到同一个logger里了，如果不通过ThreadContextMapFilter来控制，就会造成每个User的日志信息都会被输入到所有domain appender里去。

### 在加载配置文件后拼接domain appender

需要注意的是，必须在读取配置文件后才能去动态生成appender或者其他的日志对象，否则会被原本的配置文件覆盖掉。

```java
public static void main(final String[] args) {
    ThreadContext.put("domainId", "RD2");
    final String domainId = "RD2";
    final LoggerContext context1 = (org.apache.logging.log4j.core.LoggerContext) LogManager.getContext(false);
    try {
        context1.setConfigLocation(Loader.getResource("log4j2.xml", null).toURI());
        createDomainAppender(domainId);
    } catch (final Exception e) {
        LogManager.getRootLogger().error("load log4j2 configuration error", e);
        ThreadContext.remove("domainId");
    }

}
```

上边的代码简单地动态生成了RD2 domain的appender，需要注意的是，如果启用了Log4j2的动态加载配置文件功能，那么当配置文件被改动后并被重新加载时，会导致原本动态生成的domain appender无效。

因为重新加载配置文件会生成新的LoggerContext对象，这时候可能会丢失一部分日志信息到对应的domain日志文件里。对于这个暂时没找到很好的解决方法，目前只能是在每个User登录时去创建domain appender对象，如果已存在就不创建。

## 对ThreadContextMapFilter的补充

上边通过代码动态生成了RollingFileAppender和ThreadContextMapFilter，下边记录下配置文件里的写法：
```xml
<RollingFile name="domainCntCoreLog" immediateFlush="true" fileName="logs/RD2/CNTCore.log" filePattern="logs/RD2/CNTCore.log.%d{yyyy-MM-dd-a}.gz" append="true">
   <ThreadContextMapFilter onMatch="ACCEPT"
    onMismatch="DENY">
	   <KeyValuePair key="domainId" value="RD2" />
   </ThreadContextMapFilter>
   <PatternLayout   pattern="%d %t %p %X{TracingMsg} %c - %m%n" />
   <Policies>
      <TimeBasedTriggeringPolicy modulate="true" interval="1" />
   </Policies>
</RollingFile>
```

从上边的配置就可以看出来短板了，只能配置死某个domainId的RollingFileAppender以及ThreadContextMapFilter，假如有10个domainId，就要手动配置十个对应的appender和Filter，很是繁琐。

就算通过占位符${ctx:domainId}的写法来避免写死，也只能生成某个domainId的appender：
```xml
<RollingFile name="domainCntCoreLog" immediateFlush="true" fileName="logs/${ctx:domainId}/CNTCore.log" filePattern="logs/${ctx:domainId}/CNTCore.log.%d{yyyy-MM-dd-a}.gz" append="true">
   <ThreadContextMapFilter onMatch="ACCEPT"
    onMismatch="DENY">
	   <KeyValuePair key="domainId" value="${ctx:domainId}" />
   </ThreadContextMapFilter>
   <PatternLayout   pattern="%d %t %p %X{TracingMsg} %c - %m%n" />
   <Policies>
      <TimeBasedTriggeringPolicy modulate="true" interval="1" />
   </Policies>
</RollingFile>
```

这种方法只能生成一个domain appender，此外如果启用了动态加载配置文件的功能，在扫描配置文件是否改动时，还会报错，原因是在RollingFileAppender的FileName和filePattern里使用了占位符。在另起线程扫描配置文件时，该占位符时取不到值的，于是就会报错。

## 参考链接

* [运行时添加log4j2的appender](https://segmentfault.com/a/1190000006973000)
* [log4j2如何动态的创建logger和appender](http://arganzheng.life/log4j2-create-logger-programmatic.html)
* [log4j2 不使用配置文件，动态生成logger对象](https://www.cnblogs.com/0201zcr/p/5726072.html)
* [log4j2的MDC应用配置](https://blog.csdn.net/json20080301/article/details/41984143)
