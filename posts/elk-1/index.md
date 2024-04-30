# ELK系列(1) - Elasticsearch + Logstash + Kibana + Log4j2快速入门与搭建用例

## 前言

最近公司分了个ELK相关的任务给我，在一边学习一边工作之余，总结下这些天来的学习历程和踩坑记录。

首先介绍下使用ELK的项目背景：在项目的数据库里有个表用来存储消息队列的消费日志，这些日志用于开发者日后的维护。每当客户端生产一条消息并发送到消息队列后，就会插入一条对应的记录到数据库里。当这条消息被消费之后，又会更新数据库里对应的记录的几个column的值，比如status、updated_on这些常用的column。

由于客户每天生产消费的消息很多，导致数据库里的这个表里的数据很多，长年累月下来，会达到数以亿计。领导决定不再把这些消费日志保存到数据库，而是改为通过Log4j2 + ELK架构把这些日志保存到Elasticsearch里。

## ELK简介

ELk是`Elasticsearch + Logstash + Kibana`的缩写，ELK一般用来收集分布式架构下各个节点的日志，并进行统一地管理。

<!--more-->
Elasticsearch是个开源分布式搜索引擎，提供搜集、分析、存储数据三大功能。它的特点有：分布式，零配置，自动发现，索引自动分片，索引副本机制，restful风格接口，多数据源，自动搜索负载等。

Logstash主要是用来日志的搜集、分析、过滤日志的工具，支持大量的数据获取方式。一般工作方式为c/s架构，client端安装在需要收集日志的主机上，server端负责将收到的各节点日志进行过滤、修改等操作在一并发往elasticsearch上去。

Kibana也是一个开源和免费的工具，Kibana可以为Logstash和ElasticSearch提供的日志分析友好的Web界面，可以帮助汇总、分析和搜索重要数据日志。

上面的官方介绍可能会比较抽象，按我个人的理解，可以简单将ELK理解为一个MVC架构的Java web应用：Elasticsearch对应M，Logstash对应C，Kibana对应V。

由于项目使用的是6.4.2版本的Elasticsearch，所以整个ELK都采用了同样的版本6.4.2。这三个软件都可以直接从官网下载到，下面是官网地址。

→ [官方下载地址](https://www.elastic.co/downloads/past-releases)

## ELK的下载安装与快速入门

本文只是基于Windows平台下，进行简单的快速入门，先搭建好ELK框架并测试通过，后续文章再记录更多的细节。

### Elasticsearch 6.4.2

从官网下载了6.4.2版本的Elasticsearch的压缩版后，解压即可使用，使用默认的配置即可。

在Elasticsearch的安装目录下，进入`/bin`目录，可以看到有两个文件：
1. elaticsearch
2. elaticsearch.bat

这两个文件都可以启动Elasticsearch，暂时没发现在Windows平台下通过这两个文件启动Elasticsearch有什么不同。我一般使用没有后缀名的那个文件来启动Elasticsearch。

启动成功后，在浏览器输入`127.0.0.1:9200`，如果访问成功会反馈信息：
```
{
  "name" : "erwbgE5",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "QQvV3hBnSCSGsf-ycD3fng",
  "version" : {
    "number" : "6.4.2",
    "build_flavor" : "default",
    "build_type" : "zip",
    "build_hash" : "04711c2",
    "build_date" : "2018-09-26T13:34:09.098244Z",
    "build_snapshot" : false,
    "lucene_version" : "7.4.0",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

**注意，如果使用Elasticsearch5.X及以上的版本，需要使用jdk 1.8；5.X以下版本使用jdk 1.6或1.7。**

### Logstash 6.4.2

同样从官网下载6.4.2版本的Logstash安装包，解压之后进入`/config`目录，创建一个配置文件`tcp.conf`，内容如下：
```
input {
    stdin {
    }
}
filter {
}
output {
    stdout {
        codec => rubydebug
    }
}
```

接着进入`/bin`目录，运行命令如下：
```bat
logstash -f ../config/test.conf
```

当看到`Successfully started Logstash API endpoint`的字眼时表示启动成功，此时输入任意字符，比如输入`hello`，可以得到相应的反馈，如下：
```
{
       "message" => "hello\r",
    "@timestamp" => 2019-05-09T14:48:04.033Z,
          "host" => "DESKTOP-S7HJJKD",
      "@version" => "1"
}
```

这里解释下，Logstash的配置非常简单，就是一套流程：`input -> filter -> output`。

input用来收集信息，这里配置的是`stdin`插件，即标准输入，也就是刚刚在控制台里输入的字符串。
filter表示过滤信息，这里没有进行任何过滤。
output表示输出信息，这里配置的是`stdout`插件，即标准输出，也就是将信息输出到控制台上。这里的`codec`指明使用`rubydebug`作为编解码器。

接着是运行的命令，使用了`-f`参数来指定使用某个配置文件。如果想要热加载的效果，可以加上`-r`参数，这样就可以在运行Logstash的时候去修改配置文件并自动重加载生效。这个`-r`参数等同于`--config.reload.automatic`。如下：

```bat
logstash -f ../config/test.conf -r
logstash -f ../config/test.conf --config.reload.automatic
```

**注意，如果在输入源里使用了`stdin`或者`syslog`等输入插件，是不支持热加载的，会一直报错。**

### Kibana 6.4.2

从官网上下载Kibana6.4.2的压缩包，解压后即可使用。接着进入`/bin`目录，运行`kibana.bat`。运行成功后，在浏览器输入`localhost:5601`，即可访问Kibana的页面，之后就可以通过这个Kibana提供的web界面来对Elasticsearch里的文档进行各种操作。

## Logstash + Log4j2的快速搭建用例其一

### 配置tcp插件并启动Logstash

修改之前创建的Logstash的配置文件`test.config`，内容如下：
```
input {
    tcp {
        mode => "server"
        host => "127.0.0.1"
        port => 4567
    }
}
filter {
}
output {
    stdout {
        codec => rubydebug
    }
}
```

然后运行命令`logstash -f ../config/test.conf -r`来启动Logstash。由于我们这里通过`-r`来启用了热加载功能，所以可以在运行中直接修改配置并生效，比如修改input里的port。热加载成功后会看到如下字眼：
```
Reloading pipeline {"pipeline.id"=>:main}
```

### 使用了Socket Appender的Log4j2项目demo

接着准备一个使用了Log4j2的项目demo，如下是一个测试类`Test.java`：

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Test {
    public static final Logger LOGGER = LogManager.getLogger("elk.test");

    public static void main(final String[] args) {
        LOGGER.info("Hello world!");
    }
}
```

这里使用的是2.11.1版本的Log4j2，Maven依赖如下：
```
<dependency>
	<groupId>org.apache.logging.log4j</groupId>
	<artifactId>log4j-core</artifactId>
	<version>2.11.1</version>
</dependency>
```

接着是配置Log4j2的配置文件`log4j2.xml`，如下：
```
<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xi="http://www.w3.org/2001/XInclude" monitorInterval="30">

    <Properties>
        <Property name="LOG_PATTERN">{"logger": "%logger", "level": "%level", "msg": "%message"}%n</Property>
    </Properties>

	<Appenders>
        <Console name="stdout" target="SYSTEM_OUT">
            <PatternLayout pattern="${LOG_PATTERN}" />
        </Console>

        <Socket name="logstash-tcp" host="127.0.0.1" port="4567" protocol="TCP">
            <PatternLayout pattern="${LOG_PATTERN}"/>
        </Socket>
	</Appenders>

	<Loggers>
		<Logger name="elk.test" level="info" additivity="false">
            <AppenderRef ref="stdout" />
            <AppenderRef ref="logstash-tcp" />
		</Logger>
		<Root level="error">
			<AppenderRef ref="stdout" />
		</Root>
	</Loggers>

</configuration>
```

从配置文件中可以看到，这里使用的是Socket Appender来将日志打印的信息发送到Logstash。

**注意了，Socket的Appender必须要配置到下面的Logger才能将日志输出到Logstash里！**

另外这里的host是部署了Logstash服务端的地址，并且端口号要和你在Logstash里配置的一致才行。

运行该项目demo，可以看到Logstash的控制台收集到了数据，如下：
```
{
          "host" => "127.0.0.1",
       "message" => "{\"logger\": \"elk.test\", \"level\": \"INFO\", \"msg\": \"Hello world!\"}\r",
    "@timestamp" => 2019-05-09T16:20:35.940Z,
      "@version" => "1",
          "port" => 49781
}
```

### 注意

这里由于使用的是Socket方式来连接Logstash的服务端，如果在连接期间，Logstash的服务停止了或者断掉了，就算接下来重启了Logstash，项目工程也无法自动重新连接上Logstash，除非重启项目工程。

在生产环境中，Logstash自然是有可能半路出问题重启的，所以不能使用这种Socket方式来传输日志。

可以使用gelf的方式来传输日志到Logstash，用例如下所示。

## Logstash + Log4j2的快速搭建用例其二

### 配置gelf插件并启动Logstash

修改之前创建的Logstash的配置文件`test.config`，内容如下：
```
input {
    gelf {
        host => "127.0.0.1"
        port => 4567
		use_tcp => true
    }
}
filter {
}
output {
    stdout {
        codec => rubydebug
    }
}
```

运行命令`logstash -f ../config/test.conf -r`启动Logstash。

### 在Log4j2项目中使用Gelf Appender

将之前的项目工程里的log4j2.xml的Socket Appender改为使用Gelf Appender，如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xi="http://www.w3.org/2001/XInclude" monitorInterval="30">

    <Properties>
        <Property name="LOG_PATTERN">{"logger": "%logger", "level": "%level", "msg": "%message"}%n</Property>
    </Properties>

	<Appenders>
        <Console name="stdout" target="SYSTEM_OUT">
            <PatternLayout pattern="${LOG_PATTERN}" />
        </Console>

        <Gelf name="logstash-gelf" host="tcp:localhost" port="4567" version="1.1" ignoreExceptions="true"
             extractStackTrace="true" filterStackTrace="false">
            <Field name="timestamp" pattern="%d{yyyy-MM-dd'T'HH:mm:ss.SSSZ}" />
            <Field name="level" pattern="%level" />
            <Field name="simpleClassName" pattern="%C{1}" />
            <Field name="className" pattern="%C" />
            <Field name="server" pattern="%host" />
        </Gelf>
	</Appenders>

	<Loggers>
		<Logger name="elk.test" level="info" additivity="false">
            <AppenderRef ref="stdout" />
            <AppenderRef ref="logstash-gelf" />
		</Logger>
		<Root level="error">
			<AppenderRef ref="stdout" />
		</Root>
	</Loggers>

</configuration>
```

另外，这个Gelf Appender需要导入另一个依赖，如下：
```
<dependency>
    <groupId>biz.paluch.logging</groupId>
    <artifactId>logstash-gelf</artifactId>
    <version>1.11.1</version>
</dependency>
```

接着运行项目工程，可以看到Logstash的控制台已经把收集到的日志打印出来了：
```
{
            "message" => "Hello world!",
         "@timestamp" => 2019-05-10T14:09:43.267Z,
          "className" => "lewky.cn.Test",
        "source_host" => "127.0.0.1",
          "timestamp" => "2019-05-10T22:09:43.211+0800",
    "simpleClassName" => "Test",
           "facility" => "logstash-gelf",
              "level" => "INFO",
               "host" => "DESKTOP-S7HJJKD",
           "@version" => "1",
             "server" => "DESKTOP-S7HJJKD"
}
```

## ELK + Log4j2快速搭建用例

接下来就可以把Logstash收集到的日志输出到Elasticsearch，并通过Kibana显示到界面上。

### Logstash配置Elasticsearch插件

修改配置文件如下：
```
input {
    gelf {
        host => "127.0.0.1"
        port => 4567
        use_tcp => true
    }
}
filter {
}
output {
    stdout {
        codec => rubydebug
    }
    elasticsearch {
        hosts => ["127.0.0.1:9200"]
		document_id => "%{docId}"
        index => "%{indexName}"
    }
}
```

output里添加了elasticsearch插件：
1. hosts里配置Elasticsearch server的地址
2. document_id是index到ES时使用的索引id
3. index是index到ES是使用的索引名字

### 修改log4j2.xml和项目代码

在项目的log4j2.xml里的Gelf Appender加上两个个新的Field：`indexName`和`docId`，如下：
```
<Gelf name="logstash-gelf" host="tcp:localhost" port="4567" version="1.1" ignoreExceptions="true"
     extractStackTrace="true" filterStackTrace="false">
    <Field name="timestamp" pattern="%d{yyyy-MM-dd'T'HH:mm:ss.SSSZ}" />
    <Field name="level" pattern="%level" />
    <Field name="simpleClassName" pattern="%C{1}" />
    <Field name="className" pattern="%C" />
    <Field name="server" pattern="%host" />

    <Field name="indexName" mdc="indexName" />
    <Field name="docId" mdc="docId" />
</Gelf>
```

这里添加的两个新的Field对应于上边Logstash配置文件里的两个变量，然后这里用到了`mdc`，这个是Log4j2里的ThreadContext的东西，有兴趣可以去了解下Log4j2里的MDC和NDC。

接着修改测试类的代码，如下：
```java
public class Test {
    public static final Logger LOGGER = LogManager.getLogger("elk.test");

    public static void main(final String[] args) {
        ThreadContext.put("docId", "1");
        ThreadContext.put("indexName", "test");

        LOGGER.info("Hello world!");
    }
}
```

接着依次启动ELK三个软件，然后运行项目，可以发现Logstash控制台里收集到了日志信息：
```
{
    "simpleClassName" => "Test",
             "server" => "DESKTOP-S7HJJKD",
            "message" => "Hello world!",
           "@version" => "1",
        "source_host" => "127.0.0.1",
          "indexName" => "test",
              "level" => "INFO",
         "@timestamp" => 2019-05-11T16:40:14.996Z,
           "facility" => "logstash-gelf",
          "className" => "lewky.cn.Test",
          "timestamp" => "2019-05-12T00:40:14.877+0800",
              "docId" => 1,
               "host" => "DESKTOP-S7HJJKD"
}
```

而在我们的IDE控制台（我用的是Eclipse）里也可以看到输出了信息：
```
{"logger": "elk.test", "level": "INFO", "msg": "Hello world!"}
```

### 配置Kibana查看Elasticsearch的index数据

接下来就是最后一步了，通过Kibana来查看我们刚刚index到Elasticsearch里的数据。

启动了Kibana后，在浏览器访问`localhost:5601`，进入界面后，操作如下：
1. Management -> Index Patterns
2. 输入index的名字，我们这里填的是`test`；然后点击`Next step`
3. 在`Time Filter field name`下方的下拉框里选择`timestamp`作为我们的一个排序字段，默认是desc，即递减排序
4. 最后点击`Create index pattern`

现在已经配置好了Index pattern，我们就可以直接在左侧菜单栏里的Discover去查看对应的index里的数据了。如果不出意外，现在在Discover里已经看到刚刚被我们index进去的日志信息了。

默认只会显示`Time`和`_source`两个字段的数据，`Time`就是排序字段，它的值和之前我们选择的那个`timestamp`一样。`_source`里则是所有字段的数据总和。

可以根据需要，在显示字段的左侧把任意的字段`add`到右侧以显示出来。当你添加了新的字段之后，`_source`字段会自动消失。

这就是最简单的一个ELK快速搭建例子，有兴趣的可以接着看后续的文章以了解更多和ELK相关的问题或知识。

## 参考链接

* [ELK入门01—Elasticsearch安装](https://segmentfault.com/a/1190000016192543)
* [ELK入门02—Logstash+Log4j2+ES](https://segmentfault.com/a/1190000016192394)
* [log4j2 + logstash](https://segmentfault.com/a/1190000010138070)
* [想问下ELK，不同版本都支持哪些jdk，在哪里查看。](https://elasticsearch.cn/question/3271)
* [logstash配置之自动重载配置文件](https://blog.csdn.net/qq_32292967/article/details/78622647)
* [ET001 不可不掌握的 Logstash 使用技巧](https://segmentfault.com/a/1190000015715238)