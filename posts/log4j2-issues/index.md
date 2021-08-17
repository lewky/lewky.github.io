# Log4j、Log4j2问题汇总

## `isDebugEnabled()`的作用

查看公司项目的代码，发现在打印日志的时候会先进行一次判断，如下：

```java
if (LOGGER.isDebugEnabled()) {
    LOGGER.debug("Search parameters: " + searchParams);
}
```
<!--more-->

我们使用的是Log4j框架，框架自身提供了类似的许多api，比如`isErrorEnabled()`，`isInfoEnabled()`等，每个Level对有对应的一个判断Level是否启用的api，实际上这些api都是调用的另一个api：`isEnabled`。

在打印日志之前先进行Level的判断，是因为在执行打印语句时，首先会先将要打印的字符串信息作为参数传递给被调用的方法。如下代码：

```java
LOGGER.debug("Search parameters: " + searchParams);
```

首先会执行字符串拼接的操作，会涉及到对象的toString()方法以及StringBuilder的创建，接着把拼接后的字符串传递给debug语句，这时候才会去判断打印日志的级别，来决定是否将这个字符串输入到对应的日志文件里。假如最终该语句并不会把字符串打印出来，那么这个拼接字符串的过程就属于毫无意义的操作，会增加系统性能的损耗。

因此，在一些必要的地方，我们会先进行一次日志Level的判断，来避免不必要的性能损耗。

## 使用`{}`占位符来打印日志

Log4j在升级到Log4j2后提供了新的打印日志的方式：允许使用`{}`占位符来打印日志，如下：

```java
LOGGER.debug("Search parameters: {}", searchParams);
```

通过占位符来打印日志有个好处，那就是不需要自己去预先判断日志的级别，其底层已经帮我们去实现这个步骤了。此外，使用占位符来打印日志，对于需要拼接大量变量的场景时，该方式也会更加地直观与优雅。如下：

```java
LOGGER.debug("Current item id is {}, size is {}, color is {}, pattern is {}.", id, size, color, pattern);
```

**注意：在Log4j2中，这种占位符打印的方式，最多只能支持到9个变量参数。**

除了Log4j2，其它的日志框架同样支持占位符的写法，比如`logback`等。

**虽然使用`{}`占位符来打印日志很方便，但是却有可能引发堆栈溢出的问题，可参考下文。**

## 神奇的堆栈溢出问题StackOverflowError

自从把公司的系统从Log4j升级到Log4j2后，就总是时不时发生堆栈溢出的问题：

```java
java.lang.StackOverflowError: null
	at java.lang.ClassLoader.findLoadedClass(ClassLoader.java:1033) ~[?:1.8.0_66]
	at org.eclipse.jetty.webapp.WebAppClassLoader.loadClass(WebAppClassLoader.java:410) ~[?:?]
	at org.eclipse.jetty.webapp.WebAppClassLoader.loadClass(WebAppClassLoader.java:403) ~[?:?]
	at org.apache.ibatis.plugin.Plugin.invoke(Plugin.java:65) ~[cbx-mybatis-3.3.0.jar:3.3.0]
	at com.sun.proxy.$Proxy62.query(Unknown Source) ~[?:?]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:120) ~[cbx-mybatis-3.3.0.jar:3.3.0]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:113) ~[cbx-mybatis-3.3.0.jar:3.3.0]
	at org.apache.ibatis.binding.MapperMethod.executeForMany(MapperMethod.java:122) ~[cbx-mybatis-3.3.0.jar:3.3.0]
	at org.apache.ibatis.binding.MapperMethod.execute(MapperMethod.java:64) ~[cbx-mybatis-3.3.0.jar:3.3.0]
	at org.apache.ibatis.binding.MapperProxy.invoke(MapperProxy.java:53) ~[cbx-mybatis-3.3.0.jar:3.3.0]
	at com.sun.proxy.$Proxy68.findEntitesByCriterion(Unknown Source) ~[?:?]
	at com.core.cbx.data.retriever.EntityRetrieverUtils.retrieveEntitiesWithAclApplied(EntityRetrieverUtils.java:102) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.retriever.CollectionFieldRetriever.retrieve(CollectionFieldRetriever.java:80) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.retriever.SubEntitiesRetriever.retrieve(SubEntitiesRetriever.java:155) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.retriever.EntityRetriever.retrieveList(EntityRetriever.java:151) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.DynamicEntityModel.findEntities(DynamicEntityModel.java:1416) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.DynamicEntityModel.findEntities(DynamicEntityModel.java:1007) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.DynamicEntityModel.findUniqueBy(DynamicEntityModel.java:1046) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.DynamicEntityModel.findUniqueBy(DynamicEntityModel.java:1022) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.DynamicEntityModel.getLatestEntityByRefNo(DynamicEntityModel.java:2990) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.entity.DynamicRefEntityProxy.initialize(DynamicRefEntityProxy.java:143) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at com.core.cbx.data.entity.EntityFieldProxy.entrySet(EntityFieldProxy.java:1007) ~[cbx-core-9.16.0-SNAPSHOT.jar:?]
	at org.apache.logging.log4j.message.ParameterFormatter.appendMap(ParameterFormatter.java:562) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.appendPotentiallyRecursiveValue(ParameterFormatter.java:498) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.recursiveDeepToString(ParameterFormatter.java:456) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.appendMap(ParameterFormatter.java:573) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.appendPotentiallyRecursiveValue(ParameterFormatter.java:498) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.recursiveDeepToString(ParameterFormatter.java:456) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.appendMap(ParameterFormatter.java:573) ~[log4j-api-2.11.2.jar:2.11.2]
	at org.apache.logging.log4j.message.ParameterFormatter.appendPotentiallyRecursiveValue(ParameterFormatter.java:498) ~[log4j-api-2.11.2.jar:2.11.2]
	···
```

可以看到，这个StackOverflowError是由于无限递归调用了`ParameterFormatter#recursiveDeepToString()`导致的，这个ParameterFormatter是Log4j2里用来支持占位符打印日志的一个API，用法如下：

```java
LOGGER.debug("Current item id is {}, size is {}, color is {}, pattern is {}.", id, size, color, pattern);
```

这行代码是在升级到Log4j2后才改用占位符来打印的，原本的代码如下：

```java
LOGGER.debug("Current item id is " + id + ", size is " + size + ", color is " + color + ", pattern is " + pattern + ".");
```

当使用这种带多个参数的占位符语法去打印日志时，Log4j2就会调用`ParameterFormatter#recursiveDeepToString()`来格式化参数，并最终替换掉对应位置的占位符。

可能是占位符打印日志的API设计问题，当被用于格式化的参数是一个复杂的对象时，比如POJO之类的，即上述例子中的`size`、`color`、`pattern`，就有可能由于重写了`toString()`方法，或者懒加载等原因而触发StackOverflowError。

这个堆栈溢出并不会立刻抛出并结束，而是会在项目运行中卡死页面无响应十几分钟！经过测试，重新改回原本的写法便可避免该异常。网上也找不到类似的案例，只能将原因归结于Log4j2框架的`ParameterFormatter#recursiveDeepToString()`的bug了。

在使用占位符打印日志时，**要注意参数的类型，最好只使用简单的一些字符串来作为参数，尽量避免直接将一个复杂的对象作为参数，**否则有可能引发预料之外的堆栈溢出问题。

## `NoSuchMethodError: com.lmax.disruptor.dsl.Disruptor`

项目使用了Log4j2，由于使用了全局异步打印日志的方式，还需要引入disruptor的依赖：

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

在项目启动类通过代码来启用全局异步打印日志(需要在第一次使用到log4j2的logger之前)：

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

该问题是因为Disruptor的版本较低导致，将版本改用较新版本的即可：

```xml
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

## `IllegalStateException: No factory method found for class`

在使用Log4j2时，虽然可以正确读取配置文件并生成log文件，但偶然发现控制台打印了异常信息：

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

看起来是因为配置文件里的RollingFile使用到了`${ctx:domainId}`导致了这个问题。百度了下，发现了Log4j2的jira issue：[Unable to invoke factory method in class class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile](https://issues.apache.org/jira/browse/LOG4J2-1967)

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

可以看出，这个异常是由于RollingFile使用到了`${ctx:domainId}`，而该变量值是null，导致无法创建对应的RollingFile文件到磁盘。但是这个domainId是通过ThreadContext把值put进去的，不可能是null，从最终的效果来看，这个变量其实也是拿到了值的，因为对应的日志文件已经存在于磁盘上了。

既然如此，为什么还会出现这个异常呢？通过观察控制台可以发现，每过一段时间就会出现一次该异常。从异常中可以看到`ConfiguratonFileWatcher`，好像有些明白为什么了。

ConfiguratonFileWatcher是用来扫描配置文件是否被改动过的，在配置文件中设置的扫描间隔是30s：

```xml
<configuration monitorInterval="30">
    ....
</configuration>
```

由于扫描文件时另外起一个线程去扫描的，而`${ctx:domainId}`的值是存放于ThreadContext中的，ThreadContext是线程安全的，同一个key对应的value在不同线程中是不一定相同的。而对于新启动的线程来说，并没有将domainId的值存放进去，于是新线程在扫描配置文件的RollingFile时，自然是无法获取到`${ctx:domainId}`的值，故而每隔一段时间就会报上边的异常。

### 解决方案一

既然问题是因为扫描配置文件是否改动造成的，那么只要将动态加载的功能关闭就行了，如下：

```xml
<configuration monitorInterval="0">
    ....
</configuration>
```

### 解决方案二

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

### 解决方案三

不要在RollingFile的fileName和filePattern属性里使用到`${ctx:domainId}`等cdn或者mdn的写法，这样会导致在log4j2异步扫描重加载配置文件的时候报错。

可以使用另一种Appender来实现这种把日志分别打印到不同文件的效果，那就是`RoutingAppender`。有兴趣的可以去了解下这个，还是挺有意思的。

## 参考链接

* [Java日志框架中真的需要判断log.isDebugEnabled()吗？](https://blog.csdn.net/neosmith/article/details/50100061)
* [Unable to invoke factory method in class class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile](https://issues.apache.org/jira/browse/LOG4J2-1967)
* [Property Substitution](http://logging.apache.org/log4j/2.x/manual/configuration.html)