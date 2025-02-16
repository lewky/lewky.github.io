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
	···
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

在使用占位符打印日志时，**要注意参数的类型**，最好只使用简单的一些字符串来作为参数，**尽量避免直接将一个复杂的对象作为参数**，否则有可能引发预料之外的堆栈溢出问题。

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

## PatternLayout的格式化参数

```java
Log4J采用类似C语言中的printf函数的打印格式格式化日志信息，打印参数如下：
1）%t 用来输出生成该日志事件的线程的名称
2）%p 用于输出日志事件的优先级，即DEBUG，INFO，WARN，ERROR，FATAL
3）%r 用于输出从layout（布局）的构建到日志事件创建所经过的毫秒数
4）%c 用于输出日志事件的category（类别），通常就是所在类的全名
5）%F 用于输出被发出日志记录请求，其中的文件名
6）%d 用于输出日志时间点的日期或时间，默认格式为ISO8601，也可以在其后指定格式，比如：%d{yyyy-MM-dd HH:mm:ss,SSS}
7）%L 用于输出日志事件的发生位置，即在代码中的行数。
8）%l 用于输出日志事件的发生位置，包括类目名、发生的线程，以及在代码中的行数。
9）%% 用于输出％标志，%即为转义标志
10）%M 用于输出打印该条日志的方法名
11）%m 用于输出代码中指定的消息
12）%n 用于输出一个回车换行符，Windows平台为“rn”，Unix平台为“n”
```

输出的日志信息可能长短不一，可以通过格式修饰符来对齐。
格式修饰符：可以控制输出字段的最小字段宽度、最大字段宽度、字段对齐格式，如下所示：

|格式修饰符|对齐方式|最小宽度|最大宽度|备注（对%c来使用格式修饰符，所以改变的是类别名称）|
|:-:|:-:|:-:|:-:|:-:|
|%-20c|左对齐|20|none|用空格右垫，如果类别名称少于20个字符长|
|%20c|右对齐|20|none|用空格左垫，如果类别名称少于20个字符长|
|%.30c|左对齐|none|30|从开始截断，如果类别名称超过30个字符长|
|%-20.30c|左对齐|20|30|用空格右侧垫，如果类别名称短于20个字符。但是，如果类别名称长度超过30个字符，那么从开始截断。|
|%20.30c|右对齐|20|30|用空格左侧垫，如果类别名称短于20个字符。但是，如果类别名称长度超过30个字符，那么从开始截断。|

## 启用热部署

在`configuration`标签里可以通过设置`monitorInterval`属性来配置热部署功能，即扫描当前配置文件的间隔时间。单位为秒，不配置则默认值为0；官方文档提及如果配置了值，则会有个最小值5。

具体细节可以参考这篇文章，里面有源码分析：[Log4j和Log4j2怎么动态加载配置文件](https://lewky.cn/posts/2c65baa3.html/)

下面是一个简要的demo：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xi="http://www.w3.org/2001/XInclude" monitorInterval="30" status="error">
    ....
</configuration>
```

`configuration`标签里还有个`status`属性，用于设置log4j2自身内部的信息输出，可以不设置，当设置成trace时，你会看到log4j2内部各种详细输出。这里设置成error后则只能看到log4j2自身error级以上级别的日志信息。

## 在脚本中指定配置文件路径

通常项目会通过bat或者shell脚本来运行，而配置文件又存放在其他路径，需要在脚本中另外指定配置文件的路径。

Log4j的配置文件路径参数为`-Dlog4j.configuration`，在用java命令执行项目时加入改参数即可：

```java
java com.test.Test -Dlog4j.configuration=config/log4j.xml
```

Log4j2的配置文件路径参数为`-Dlog4j.configurationFile`，如下：

```java
java com.test.Test -Dlog4j.configurationFile=config/log4j2.xml
```

## 使用XInclude来引入参数文件

Log4j2的配置文件可以设置一些参数变量，方便下文使用：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration monitorInterval="30">
    <Properties>
        <Property name="logstash.host">udp:localhost</Property>
        <Property name="logstash.port">4567</Property>
    </Properties>
    
    <Appenders>
		<!-- This appender is used for indexing CommandLog into Elasticsearch by ELK. -->
	    <Gelf name="logstash-gelf" host="${logstash.host}" port="${logstash.port}" version="1.1" ignoreExceptions="true"
             extractStackTrace="true" filterStackTrace="false">
        </Gelf>
	</Appenders>

	<Loggers>
	    <Logger name="elk" level="info" additivity="false">
            <AppenderRef ref="logstash-gelf"/>
        </Logger>
		
		<Root level="error">
			<AppenderRef ref="logfile" />
		</Root>
	</Loggers>

</configuration>
```

有时候这个参数，不只是某个项目的配置文件使用，可能多个项目之间都是共享同样的变量值，这时候可以通过将公共的参数变量定义到一个单独的文件中，然后通过`XInclude`来引入参数文件：

首先定义一个单独的参数文件，假如命名为`log4j-xinclude-properties.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<Properties>
    <Property name="logstash.host">udp:localhost</Property>
    <Property name="logstash.port">4567</Property>
</Properties>
```

然后在原本的配置文件`log4j2.xml`中引入`XInclude`，**注意需要在文件头里引入该标签**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xi="http://www.w3.org/2001/XInclude" monitorInterval="30">
    <xi:include href="log4j-xinclude-properties.xml" />
    
    <Appenders>
		<!-- This appender is used for indexing CommandLog into Elasticsearch by ELK. -->
	    <Gelf name="logstash-gelf" host="${logstash.host}" port="${logstash.port}" version="1.1" ignoreExceptions="true"
             extractStackTrace="true" filterStackTrace="false">
        </Gelf>
	</Appenders>

	<Loggers>
	    <Logger name="elk" level="info" additivity="false">
            <AppenderRef ref="logstash-gelf"/>
        </Logger>
		
		<Root level="error">
			<AppenderRef ref="logfile" />
		</Root>
	</Loggers>

</configuration>
```

当然，`XInclude`不只是可以引入其他文件的Properties节点，实际上也可以引入公共的Appenders或者Loggers节点，注意它只能引入这种一级节点，且一级节点是不能重复定义的，也就是说如果引入了一个Properties节点，那么原本的配置文件中就不能定义该节点了，否则会冲突或者报错。


此外，配置中的变量占位符`${key}`可以用`${key:-defaultValue}`的形式来设置默认值：

```
${logstash.host:-udp:localhost}
${logstash.port:-4567}
```

## NDC和MDC功能

NDC（Nested Diagnostic Context）和MDC（Mapped Diagnostic Context）是Log4j提供的一个线程共享的变量容器，NDC对应Stack，MDC对应Map，可以将变量存入其中，然后在打印日志时通过PatternLayout来将变量值打印出来，比如打印当前用户的用户id等。

从功能来看，其实跟Java提供的ThreadLocal差不多。NDC和MDC都是线程独立的，子线程会从父线程拷贝上下文。用法很简单：

```java
// NDC
1.开始调用
NDC.push(message);

2.删除栈顶消息
NDC.pop();

3.清除全部的消息，必须在线程退出前显示的调用，否则会导致内存溢出。
NDC.remove();

4.输出模板，注意是小写的[%x]
log4j.appender.stdout.layout.ConversionPattern=[%d{yyyy-MM-dd HH:mm:ssS}] [%x] : %m%n


// MDC
1.保存信息到上下文
MDC.put(key, value);

2.从上下文获取设置的信息
MDC.get(key);

3.清楚上下文中指定的key的信息
MDC.remove(key);

4.清除所有
clear()

5.输出模板，注意是大写[%X{key}]
log4j.appender.consoleAppender.layout.ConversionPattern = %-4r [%t] %5p %c %x - %m - %X{key}%n

// PatternLayout
%X 输出Map中全部数据
%X{key} 指定输出Map中的key的值
%x 输出Stack中的全部内容
```

而到了Log4j2中，将MDC和NDC合并到了一个新的类`ThreadContext`中，不过API和PatternLayout还是和NDC、MDC的用法一样。去查看底层源码，会发现内置了一个Stack和Map：

```java
public final class ThreadContext {
    private static ThreadContextMap contextMap;
    private static ThreadContextStack contextStack;
}
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

不要在RollingFile的fileName和filePattern属性里使用到`${ctx:domainId}`等NDC和MDC的写法，这样会导致在log4j2异步扫描重加载配置文件的时候报错。

可以使用另一种Appender来实现这种把日志分别打印到不同文件的效果，那就是[路由日志`RoutingAppender`](http://lewky.cn/posts/log4j2-issues/#路由日志routingappender)。有兴趣的可以去了解下这个，还是挺有意思的。

## Logj4 1.x怎么使用异步日志

异步日志是Log4j2引入的新特性，但可以通过导入一个桥接包`log4j-1.2-api-2.6.jar`，这样就可以用旧版本的Log4j 1.x的API来调用Log4j2的实现。

当然更推荐的做法是，直接升级Log4j到2.x版本。

## 回滚策略

`RollingFile`标签里可以配置回滚策略`Policies`，有两种类型：一种是基于体积回滚日志，一种是基于日期。可以同时配置多个回滚策略：

```xml
<RollingFile name="cntCorelog" immediateFlush="true" fileName="logs/CNTCore.log" filePattern="logs/%d{yyyy/MM/dd}/CNTCore.log.%d{yyyy-MM-dd-HH}-%i.gz"
    append="true">
    <PatternLayout>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS}:%p %t %X{TracingMsg} %c - %m%n</pattern>
    </PatternLayout>
    <Policies>
        <SizeBasedTriggeringPolicy size="100MB" />
        <TimeBasedTriggeringPolicy modulate="true" interval="1" />
    </Policies>
    <DefaultRolloverStrategy max="30"/>
</RollingFile>
```

`TimeBasedTriggeringPolicy`标签的`interval`表示回滚间隔，`1`表示每经过一个单位的最小时间粒度就回滚一次。`modulate`表示回滚的时间点是否校准为零点整。

回滚日志的最小时间粒度由`filePattern`决定，比如`%d{yyyy-MM-dd-HH}`表示最小时间粒度为小时，以最后一个符号为准。

## DefaultRolloverStrategy无效，超出上限的日志没有被删除

默认的`DefaultRolloverStrategy`的`max`默认值是7，如下：

```xml
<DefaultRolloverStrategy max="7"/>
```

这里的`max`属性并非指日志的保留上限，而是指`filePattern`的计数器`%i`的最大值，**`max`属性必须和这个计数器`%i`搭配使用才有效果**，此外`filePattern`的最小时间粒度为分钟。如下：

`RollingFile`会自动按照`filePattern`的最小时间粒度进行日志的切割回滚。

```xml
<RollingFile name="cntCorelog" immediateFlush="true" fileName="logs/CNTCore.log" filePattern="logs/%d{yyyy/MM/dd}/CNTCore.log.%d{yyyy-MM-dd-HH}-%i.gz"
    append="true">
    <PatternLayout>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS}:%p %t %X{TracingMsg} %c - %m%n</pattern>
    </PatternLayout>
    <Policies>
        <TimeBasedTriggeringPolicy modulate="true" interval="1" />
    </Policies>
    <DefaultRolloverStrategy max="30"/>
</RollingFile>
```

上述配置的回滚日志会存放到名字为日期格式的子目录里，因此`max`统计的是子目录里的数量。如果需要统计所有的子目录里的日志数量，则需要对`DefaultRolloverStrategy`进行特殊配置：

```xml
<DefaultRolloverStrategy max="30">
    <Delete basePath="logs/%d{yyyy/MM/dd}/" maxDepth="2">
        <IfFileName glob="*.gz" />
        <!--7天-->
        <IfLastModified age="168H" />
    </Delete>
</DefaultRolloverStrategy>
```

`Delete`标签内决定了删除过期文件的规则：

* `IfLastModified`的`age`的时间粒度要和filePattern的一致，此外`age`填写的数字最好大于2，否则可能造成删除的时候`IfLastModified`的`age`的时间粒度要和filePattern的一致，此外`age`填写的数字最好大于2，否则可能造成删除的时候, 最近的文件还处于被占用状态,导致删除不成功。
* `maxDepth`是递归统计的目录深度，`basePath`是需要处理的目录，`maxDepth="1"`表示当前目录，即`basePath`。

## 路由日志RoutingAppender

如果想要将日志文件生成到指定的目录里，这个目录是动态的，由程序来控制具体的值，比如说，对于不同的用户，可以将这些用户专属的日志存放到各自的目录里进行分类，方便后续跟踪。

这种时候，就需要使用到路由日志RoutingAppender，如下：

```xml
<Appenders>
    <Routing name="domainAppender">
        <Routes pattern="$${ctx:domainId}">

            <!-- This route is chosen if ThreadContext has no value for key domainId. -->
            <Route key="$${ctx:domainId}">
                <AppenderRef ref="" />
            </Route>

            <!-- This route is chosen if ThreadContext has value '/' for key domainId. -->
            <Route key="/">
                <AppenderRef ref="" />
            </Route>

            <!-- This route is chosen if ThreadContext has value(besides '/') for key domainId. -->
            <Route>
                <RollingFile name="${ctx:domainId}-cntCorelog" immediateFlush="true" fileName="logs/${ctx:domainId}/CNTCore.log"
                     filePattern="logs/${ctx:domainId}/CNTCore.log.%d{yyyy-MM-dd-a}.gz" append="true">
                    <PatternLayout>
                        <pattern>%d %t %p %X{TracingMsg} %c - %m%n</pattern>
                    </PatternLayout>
                    <Policies>
                        <TimeBasedTriggeringPolicy modulate="true" interval="1" />
                    </Policies>
                </RollingFile>
            </Route>

        </Routes>
    </Routing>
    
</Appenders>
```

`$${}`这里的两个`$$`是对`$`进行了转义，这里表示动态计算占位符`${}`的值。如果是`${}`占位符，只会计算第一次然后替换为对应的值，而`$${}`每一次都会计算值。换句话说，`${}`只能生效一次，后续就算改变了变量值也无效。

而`$${ctx:domainId}`指的是存放于MDC中的一个变量`domainId`的值，在上述配置中不同用户的`domainId`是不一样的，这样就可以实现对不同用户的日志进行归类。

## Log4j升级到Log4j2

由于公司老项目的日志管理十分混乱，大部分地方使用自定制的打印类工具来打印，小部分地方用的slf4j+log4j。Log4j在高并发场景下，也会有引发线程阻塞的情况。

为了便于管理，以及提高日志打印的性能，决定将日志从Log4j升级到Log4j2。并且统一使用slf4j+log4j2的方式来打印日志，关于slf4j等日志门面，可以看这篇文章：[日志框架与门面模式](https://lewky.cn/posts/log-framework/)

首先是移除低版本的Log4j日志依赖：

```
<exclusions>  
    <exclusion>  
        <groupId>org.slf4j</groupId>  
        <artifactId>slf4j-log4j12</artifactId>  
    </exclusion>  
    <exclusion>  
        <groupId>log4j</groupId>  
        <artifactId>log4j</artifactId>  
    </exclusion>  
</exclusions>
```

然后是添加Log4j2的依赖：

```
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.11.2</version>
</dependency>

<!-- web工程需要包含log4j-web，非web工程不需要 -->
<!-- 用来释放日志资源（关闭数据库连接，关闭文件等） -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-web</artifactId>
    <version>2.11.2</version>
</dependency>

<!-- log4j2的异步日志AsyncLogger需要disruptor-->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

关于log4j-web这个jar包，可以看看这个问答：[web项目中log4j2的log4j-web包如果不添加，会影响哪些日志输出？](https://segmentfault.com/q/1010000017777508)

接着是添加slf4j的依赖：

```
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.13</version>
</dependency>

<!-- 桥接slf4j和log4j2 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.11.2</version>
</dependency>

<!-- 下面的桥接包都是为了兼容第三方库的日志打印 -->
<!-- 将jcl桥接为slf4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>jcl-over-slf4j</artifactId>
    <version>1.7.13</version>
</dependency>

<!-- 将log4j桥接为slf4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>log4j-over-slf4j</artifactId>
    <version>1.7.13</version>
</dependency>
```

最后是改变日志的配置文件，将`log4j.properties`替换成`log4j2.xml`。

下面是Log4j官方网站的迁移文档说明：

[Migrating from Log4j 1.x](https://logging.apache.org/log4j/2.x/manual/migration.html)

## SpringBoot项目使用Log4j2

SpringBoot项目默认使用commons-logging + Logback，可以用下面的方式改为使用Log4j2：

```
<!-- use log4j2 instead of logback -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

## 路由日志引发的OOM

生产上在分配了2g最大内存的机器上发生了OOM，分析dump后推测可能跟log4j2内存泄漏有关。由于项目使用了路由日志，将每笔交易日志自动路由到对应的日志中，如果发生了一百笔不同的交易，则会生成一百个不同的交易日志文件。在GitHub上找到相关的一个[内存泄漏issue](https://github.com/apache/logging-log4j2/discussions/2255) ，其中提及`Log4j Core 2.17.1`和更早以前的版本存在内存泄漏的问题，只要运行时间足够久，迟早引发OOM，解决方案是升级到`2.20.0`版本。

因为项目中使用的SpringBoot和异步打印，因此需要升级两个依赖为如下版本：
```xml
<log4j2.version>2.20.0</log4j2.version>
<com.lmax.disruptor.version>3.4.2</com.lmax.disruptor.version>
```

如果不想升级版本，那就只能扩大内存，并放弃使用路由日志了。另外提一嘴，交易量大的时候，由于需要同时处理大量的路由日志文件，线程池的线程会频繁地切换上下文导致CPU飙升，同时线程内部的ThreadLocal缓存也占用了大量内存，在升级到新版本后该问题得以改善。

## 参考链接

* [Java日志框架中真的需要判断log.isDebugEnabled()吗？](https://blog.csdn.net/neosmith/article/details/50100061)
* [Unable to invoke factory method in class class org.apache.logging.log4j.core.appender.RollingFileAppender for element RollingFile](https://issues.apache.org/jira/browse/LOG4J2-1967)
* [Property Substitution](http://logging.apache.org/log4j/2.x/manual/configuration.html)
* [Can i run my log asynchronously using log4j 1.x with log4j.properties file?](https://stackoverflow.com/questions/37525996/can-i-run-my-log-asynchronously-using-log4j-1-x-with-log4j-properties-file#)
* [Log4j2中RollingFile的文件滚动更新机制](https://www.cnblogs.com/yeyang/p/7944899.html)
* [log4j2定期生成和删除过期日志文件的配置](https://www.jianshu.com/p/ee075bfc7dff)
* [Log4j2进阶使用(按大小时间备份日志)](https://www.cnblogs.com/bugzeroman/p/12858116.html)
* [log4j（二）——如何控制日志信息的输出？](https://www.cnblogs.com/godtrue/p/6442347.html)
* [Log4j2配置文件详解](https://www.cnblogs.com/yudar/p/5113655.html)
* [Log4j2 File Inclusion : <include> and <included> similar to Logback](https://stackoverflow.com/questions/25694782/log4j2-file-inclusion-include-and-included-similar-to-logback/30478905#30478905)
* [Java日志Log4j或者Logback的NDC和MDC功能](https://zhuanlan.zhihu.com/p/89594636)
* [使用Slf4j集成Log4j2构建项目日志系统的完美解决方案](https://www.cnblogs.com/hafiz/p/6160298.html#autoid-2-0-0)