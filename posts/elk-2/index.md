# ELK系列(2) - Kibana问题汇总

## 修改日期格式Date format

Kibana在创建`Index Patterns`的时候，可以选择某个date类型的field作为排序字段。之后在`Discover`里打开对应的index，会发现这个date类型的field的格式显示如下：

```
April 10th 2019, 17:40:32.359
```

这是Kibana默认的日期格式，有两种修改的方式。
<!--more-->

### 方式一：全局修改

登录`http://localhost:5601/`，会进入Kibana的页面，选择`Management` -> `Index Patterns` -> `Advanced Settings`，找到`Date format`，如何修改这里的值，默认是`MMMM Do YYYY, HH:mm:ss.SSS`。

可以改成`YYYY-MM-DD HH:mm:ss.SSS`，这样页面的所有日期就会显示成`2019-04-23 16:30:39.139`这种格式了。

### 方式二：局部修改

可以只针对某个时间字段进行修改，这样就不会影响到其它的时间字段，允许不同字段用不同的日期格式。

登录`http://localhost:5601/`，会进入Kibana的页面，选择`Management` -> `Index Patterns`，选择某个已经创建好的index pattern，接着在`Fields`这个tab里找到对应的日期字段，点击那个字段最后的铅笔图标（`Edit`）进行编辑。

对于`date`类型的字段，其Format默认是选择了`- Default -`，将其改为选择`Date`，然后将下面的format改成`YYYY-MM-DD HH:mm:ss.SSS`，最后再点击下方的`Save field`。

## 关闭Kibana

通过以下方式找到Kibana的进程：

```shell
ps -ef | grep kibana

ps -ef | grep 5601

ps -ef | grep node

// 直接用Kibana所在的目录（即下面的$Kibana_home）来查是最准确的
ps -ef | grep $Kibana_home
```

然后根据上面得到的pid（即下面的$pid）来杀死Kibana的进程：

```shell
kill -TERM $pid

// 上面的命令不起效果时可以用这个
kill -9 $pid
```

## Scripted field

Kibana在创建Index Pattern的时候，可以选择创建脚本字段Scripted field，该字段由Painless语言编写，可以为当前的索引创建一个额外的临时字段，用来实现诸如统计等功能。脚本字段虽然强大，但是别滥用，会影响内存和性能。

Painless具体语法可以看这个[官方文档](https://www.elastic.co/guide/en/elasticsearch/painless/6.4/index.html)。