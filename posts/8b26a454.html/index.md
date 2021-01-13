# Log4j2 - 日志框架中isDebugEnabled()的作用

## 为什么要使用isDebugEnabled()

之前在系统的代码中发现有时候会在打印日志的时候先进行一次判断，如下：
```java
if (LOGGER.isDebugEnabled()) {
    LOGGER.debug("Search parameters: " + searchParams);
}
```
<!--more-->

我们使用的是Log4j2框架，框架自身提供了类似的许多api，比如`isErrorEnabled()`，`isInfoEnabled()`等，每个Level对有对应的一个判断Level是否启用的api，实际上这些api都是调用的另一个api：`isEnabled`。


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

## 使用`{}`占位符可能产生的问题

虽然使用占位符来打印日志很方便，但是却有可能引发堆栈溢出的问题，有兴趣的话可以通过[这篇文章]()来了解下。

## 参考链接

* [Java日志框架中真的需要判断log.isDebugEnabled()吗？](https://blog.csdn.net/neosmith/article/details/50100061)