# ELK系列(3) - Elasticsearch修改jvm参数

## 方法

Elasticsearch默认会配置1G的JVM堆的初始值和最大值，该jvm参数被配置在`/config/jvm.options`里：
```
-Xms1g
-Xmx1g
```

如果只是个人开发小项目，可以把参数改小些，比如：
```
-Xms512m
-Xmx512m
```

这个`jvm.options`用来配置各种jvm参数，比如GC、GC logging、heap dumps等。

<!--more-->