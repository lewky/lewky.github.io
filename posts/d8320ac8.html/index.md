# Log4j2异常 - IllegalStateException: No factory method found for class

## 问题与分析

在使用Log4j2时，虽然可以正确读取配置文件并生成log文件，但偶然发现控制台打印了异常信息如下：
```java
2018-12-31 17:28:14,282 Log4j2-TF-19-ConfiguratonFileWatcher-6 ERROR Unable to invoke factory method in class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile: java.lang.IllegalStateException: No factory method found for class org.apache.logging.log4j.core.appender.RollingFileAppender java.lang.IllegalStateException: No factory method found for class org.apache.logging.log4j.core.appender.RollingFileAppender
        at org.apache.logging.log4j.core.config.plugins.util.PluginBuilder.findFactoryMethod(PluginBuilder.java:235)
        at org.apache.logging.log4j.core.config.plugins.util.PluginBuilder.build(PluginBuilder.java:135)
        at org.apache.logging.log4j.core.config.AbstractConfiguration.createPluginObject(AbstractConfiguration.java:959)
        at org.apache.logging.log4j.core.config.AbstractConfiguration.createConfiguration(AbstractConfiguration.java:899)
        at org.apache.logging.log4j.core.config.AbstractConfiguration.createConfiguration(AbstractConfiguration.java:891)
        at org.apache.logging.log4j.core.config.AbstractConfiguration.doConfigure(AbstractConfiguration.java:514)
        at org.apache.logging.log4j.core.config.AbstractConfiguration.initialize(AbstractConfiguration.java:238)
        at org.apache.logging.log4j.core.config.AbstractConfiguration.start(AbstractConfiguration.java:250)
        at org.apache.logging.log4j.core.LoggerContext.setConfiguration(LoggerContext.java:547)
        at org.apache.logging.log4j.core.LoggerContext.onChange(LoggerContext.java:670)
        at org.apache.logging.log4j.core.config.ConfiguratonFileWatcher$ReconfigurationRunnable.run(ConfiguratonFileWatcher.java:68)
        at java.lang.Thread.run(Thread.java:748)
```
<!--more-->
将控制台的所有信息都复制出来，仔细查找，又发现了相关的异常信息：
```java
2018-12-31 17:28:14,241 Log4j2-TF-19-ConfiguratonFileWatcher-6 ERROR Unable to create file logs/${ctx:domainId}/CNTCore.log java.io.IOException: The filename, directory name, or volume label syntax is incorrect
        at java.io.WinNTFileSystem.canonicalize0(Native Method)
        at java.io.WinNTFileSystem.canonicalize(WinNTFileSystem.java:428)
        at java.io.File.getCanonicalPath(File.java:618)
	at ....


2018-12-31 17:28:14,280 Log4j2-TF-19-ConfiguratonFileWatcher-6 ERROR Could not create plugin of type class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile: java.lang.IllegalStateException: ManagerFactory [...] unable to create manager for [logs/${ctx:domainId}/CNTCore.log] with data [...] java.lang.IllegalStateException: ManagerFactory [...] unable to create manager for [logs/${ctx:domainId}/CNTCore.log] with data [...]
        at org.apache.logging.log4j.core.appender.AbstractManager.getManager(AbstractManager.java:115)
        at org.apache.logging.log4j.core.appender.OutputStreamManager.getManager(OutputStreamManager.java:114)
        at org.apache.logging.log4j.core.appender.rolling.RollingFileManager.getFileManager(RollingFileManager.java:188)
        at ....
```

看起来是因为配置文件里的RollingFile使用到了`${ctx:domainId}`导致了这个问题。百度了下，发现了log4j2的jira issue：[Unable to invoke factory method in class class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile](https://issues.apache.org/jira/browse/LOG4J2-1967)

该问题和我遇到的一样，而在jira里有comment如下：
```
Question: Does system property logfile have a value?
```

结合项目的配置文件log4j2.xml:
```xml
<RollingFile name="logfile" immediateFlush="true" fileName="logs/${ctx:domainId}/CNTCore.log"
    filePattern="logs/${ctx:domainId}/CNTCore.log.%d{yyyy-MM-dd-a}.gz" append="true">
    <PatternLayout>
        <pattern>%d %t %p %X{TracingMsg} %c - %m%n</pattern>
    </PatternLayout>
    <Policies>
        <TimeBasedTriggeringPolicy modulate="true" interval="1" />
    </Policies>
</RollingFile>
```

可以看出，这个异常是由于RollingFile使用到了`${ctx:domainId}`，而该变量值是null，导致无法创建对应的RollingFile文件到磁盘。但是这个domainId是通过ThreadContext把值put进去的，不可能是null，从最终的效果来看，这个变量其实也是拿到了值的，因为对应的日志文件以及存在于磁盘上了。

既然如此，为什么还会出现这个异常呢？通过观察控制台可以发现，每过一段时间就会出现一次该异常。从异常中可以看到`ConfiguratonFileWatcher`，好像有些明白为什么了。

ConfiguratonFileWatcher是用来扫描配置文件是否被改动过的，在配置文件中设置的扫描间隔是30s：
```xml
<configuration monitorInterval="30">
    ....
</configuration>
```

由于扫描文件时另外起一个线程去扫描的，而`${ctx:domainId}`的值是存放于ThreadContext中的，ThreadContext是线程安全的，同一个key对应的value在不同线程中是不一定相同的。而对于新启动的线程来说，并没有将domainId的值存放进去，于是新线程在扫描配置文件的RollingFile时，自然是无法获取到`${ctx:domainId}`的值，故而每隔一段时间就会报上边的异常。

## 解决方法

### 方案一

既然问题是因为扫描配置文件是否改动造成的，那么只要将动态加载的功能关闭就行了，如下：
```xml
<configuration monitorInterval="0">
    ....
</configuration>
```

### 方案二

如果希望不关闭动态加载配置文件的功能，可以将domainId的值存放到System.properties里：

```java
System.setProperty("domainId", "xxx");
```

然后通过`${sys:xxx}`的方式来获取该properties的值：
```xml
<RollingFile name="logfile" immediateFlush="true" fileName="logs/${sys:domainId}/CNTCore.log"
    filePattern="logs/${sys:domainId}/CNTCore.log.%d{yyyy-MM-dd-a}.gz" append="true">
    <PatternLayout>
        <pattern>%d %t %p %X{TracingMsg} %c - %m%n</pattern>
    </PatternLayout>
    <Policies>
        <TimeBasedTriggeringPolicy modulate="true" interval="1" />
    </Policies>
</RollingFile>
```

在log4j2中关于这些变量取值有以下这些种类：

|Prefix|Context|
|-|-|
|bundle|Resource bundle. The format is ${bundle:BundleName:BundleKey}. The bundle name follows package naming conventions, for example: ${bundle:com.domain.Messages:MyKey}.|
|ctx|Thread Context Map (MDC)|
|date|Inserts the current date and/or time using the specified format|
|env|System environment variables. The formats are ${env:ENV_NAME} and ${env:ENV_NAME:-default_value}.|
|jndi|A value set in the default JNDI Context.|
|jvmrunargs|A JVM input argument accessed through JMX, but not a main argument; see RuntimeMXBean.getInputArguments(). Not available on Android.|
|log4j| Log4j configuration properties. The expressions ${log4j:configLocation} and ${log4j:configParentLocation} respectively provide the absolute path to the log4j configuration file and its parent folder.|
|main|A value set with MapLookup.setMainArguments(String[])|
|map|A value from a MapMessage|
|sd|A value from a StructuredDataMessage. The key "id" will return the name of the StructuredDataId without the enterprise number. The key "type" will return the message type. Other keys will retrieve individual elements from the Map.|
|sys|System properties. The formats are ${sys:some.property} and ${sys:some.property:-default_value}.|

### 方案三

不要在RollingFile的fileName和filePattern属性里使用到`${ctx:domainId}`等cdn或者mdn的写法，这样会导致在log4j2异步扫描重加载配置文件的时候报错。

可以使用另一种Appender来实现这种把日志分别打印到不同文件的效果，那就是RoutingAppender。有兴趣的可以去了解下这个RoutingAppender，还是挺有意思的。

## 参考链接

* [Unable to invoke factory method in class class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile](https://issues.apache.org/jira/browse/LOG4J2-1967)
* [Property Substitution](http://logging.apache.org/log4j/2.x/manual/configuration.html)
