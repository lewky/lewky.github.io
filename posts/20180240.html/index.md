# PostgreSQL - raise函数打印字符串

## raise函数

在PostgreSQL中，该函数用于打印字符串，类似于Java中的`System.out.println()`，Oracle中的`dbms_output.put_line()`。

用法如下：
<!--more-->
```sql
raise notice 'My name is %, I am a %.', 'Lewis', 'coder';
```

以上sql会在控制台输出`My name is Lewis, I am a coder.`。如果是在DBeaver里使用该函数，则会在`output`的tab里输出字符串。

raise后面的`notice`是级别，一共有`debug/log/info/notice/warning/exception`这些级别，可以任意指定一个级别。有些类似于Java里的日志框架，比如Log4j2之类的。

接着级别后面的是要输出的字符串参数，用一对单引号包括起来。这个字符串支持占位符的写法，也就是`%`这个字符。如果在字符串里使用了这个`%`，那么会自动使用字符串参数后面的参数来替换掉这里的`%`。有多少个占位符，就需要在第一个字符串参数后面加上多少个对应的参数。

这个占位符输出的用法，也和Log4j2类似。

由raise打印出来的信息可以输出到服务端日志，也可以输出到客户端，亦或者同时输出到二者。这个是由`log_min_messages`和`client_min_messages`两个参数控制的，这两个参数在数据库初始化时用到。

## 参考链接

* [postgreSQL学习记录之raise用法](https://blog.csdn.net/publishwy/article/details/9241387)
