# Tomcat - 怎么控制某个类或者包下的日志打印级别

## 问题与分析

Tomcat是使用自己的日志实现`tomcat-juli.jar`来打印日志信息的，日志会被打印到catalina.out里，除去你在项目里自己使用的日志框架外，由`System.out`，`System.err`或者`printStackTrace()`打印出来的信息则是会被输入到catalina.out里，如果引用的jar包里也有这些语句也会一起输入到catalina.out里。
<!--more-->

比如现在catalina.out里有大量的NotSerializableException，这个exception是由第三方jar包打印出来的，log日志如下：
```javade.javakaffee.web.msm.JavaSerializationTranscoder.level = SEVERE
30-Oct-2018 17:53:58.368 WARNING [msm-storage-thread-1] de.javakaffee.web.msm.JavaSerializationTranscoder.writeAttributes Cannot serialize session attribute [javax.zkoss.zk.ui.Session] for session [EB56FE915F0611E8195FF5F95C96A9E2.app2]
java.io.NotSerializableException: org.zkoss.bind.tracker.impl.BindUiLifeCycle
```

可以看到，这个异常是由Memcached在共享session时由于存在对象没有序列化而打印出来的。现在我们不希望在catalina.out里看到这个异常，可以通过配置logging.properties来隐藏掉。

## 解决方法

在Tomcat的安装目录下，找到`conf\logging.properties`文件，找到如下注释(一般在最末尾)：
```html
# For example, set the org.apache.catalina.util.LifecycleBase logger to log
# each component that extends LifecycleBase changing state:
#org.apache.catalina.util.LifecycleBase.level = FINE
```

在这里的末尾加上一行：
```html
de.javakaffee.web.msm.JavaSerializationTranscoder.level = SEVERE
```

因为这个未序列化异常是在这个类中被打印出来的，而且log级别是warning；对于Tomcat来说，日志级别如下所示：
```html
SEVERE (highest value) > WARNING > INFO > CONFIG > FINE > FINER > FINEST (lowest value)
```

我们需要将level设置成SEVERE，才可以不让其打印NotSerializableException出来。你甚至可以将范围进行扩大，变成如下配置：
```html
de.javakaffee.web.msm.level = SEVERE
```
指定`de.javakaffee.web.msm`包下的类只打印SEVERE级别的日志信息。

## 补充

* 如果希望不打印日志信息，可以将level设置为`OFF`。
* 如果希望打印全部的日志信息，可以将level设置为`ALL`。

## 参考链接

* [Tomcat日志设定](https://blog.csdn.net/lk_cool/article/details/4561306)
* [tomcat 日志级别](https://blog.csdn.net/bjnihao/article/details/50522260)