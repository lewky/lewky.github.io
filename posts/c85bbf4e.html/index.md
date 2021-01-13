# ELK系列(2) - Kibana怎么修改日期格式Date format

## 问题

Kibana在创建`Index Patterns`的时候，可以选择某个date类型的field作为排序字段。之后在`Discover`里打开对应的index，会发现这个date类型的field的格式显示如下：
```
April 10th 2019, 17:40:32.359
```

这是Kibana默认的日期格式，有两种修改的方式。
<!--more-->

## 方式一：全局修改

登录`http://localhost:5601/`，会进入Kibana的页面，选择`Management` -> `Index Patterns` -> `Advanced Settings`，找到`Date format`，如何修改这里的值，默认是`MMMM Do YYYY, HH:mm:ss.SSS`。

可以改成`YYYY-MM-DD HH:mm:ss.SSS`，这样页面的所有日期就会显示成`2019-04-23 16:30:39.139`这种格式了。

## 方式二：局部修改

可以只针对某个时间字段进行修改，这样就不会影响到其它的时间字段，允许不同字段用不同的日期格式。

登录`http://localhost:5601/`，会进入Kibana的页面，选择`Management` -> `Index Patterns`，选择某个已经创建好的index pattern，接着在`Fields`这个tab里找到对应的日期字段，点击那个字段最后的铅笔图标（`Edit`）进行编辑。

对于`date`类型的字段，其Format默认是选择了`- Default -`，将其改为选择`Date`，然后将下面的format改成`YYYY-MM-DD HH:mm:ss.SSS`，最后再点击下方的`Save field`。