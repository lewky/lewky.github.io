# Elasticsearch问题汇总


## 前言

本文主要基于Elasticsearch 6.5.4版本：

```
<dependency>
  <groupId>org.elasticsearch</groupId>
  <artifactId>elasticsearch</artifactId>
  <version>6.5.4</version>
</dependency>
```

<!--more-->
## too_many_clauses问题

Elasticsearch查询时报错如下：

```
"caused_by":{"type":"too_many_clauses","reason":"maxClauseCount is set to 1024"}}}],
"caused_by":{"type":"query_shard_exception","reason":"failed to create query:
```

这是bool查询的条件超过了默认的1024上限，可以通过修改全局配置来增加上限，需要注意的是别设置太高，会消耗太多的CPU资源和内存。

打开ES的配置文件`/config/elasticsearch.yml`，增加配置：

```
indices.query.bool.max_clause_count: 2048
```

修改全局配置后需要重启ES才能生效。如果不允许重启ES集群，就只能从查询语句入手了，要么削减查询条件的数量，要么将查询条件转移到`must_not`的`terms`查询中。

`must_not`的`terms`查询可以超过默认的1024上限，对于肯定条件可以用`must_not`嵌套`must_not`来实现。（这种做法是其他博主验证的，这里只提一嘴，在短期内无法重启ES集群时可以作为临时方案使用。）

## 修改jvm参数

Elasticsearch是用Java开发的，默认会配置1G的jvm堆的初始值和最大值，该jvm参数被配置在`/config/jvm.options`里：

```
-Xms1g
-Xmx1g
```

如果只是个人开发小项目，可以把参数改小些（当然不能调整太小，内存对于ES的性能影响较大），比如：

```
-Xms512m
-Xmx512m
```

这个`jvm.options`用来配置各种jvm参数，比如GC、GC logging、heap dumps等。

## cannot write xcontent for unknown value of type class java.math.BigDecimal

Elasticsearch在索引数据时报错如下：

```java
java.lang.IllegalArgumentException: cannot write xcontent for unknown value of type class java.math.BigDecimal
	at org.elasticsearch.common.xcontent.XContentBuilder.unknownValue(XContentBuilder.java:755)
	at org.elasticsearch.common.xcontent.XContentBuilder.value(XContentBuilder.java:726)
	at org.elasticsearch.common.xcontent.XContentBuilder.field(XContentBuilder.java:711)
	at org.elasticsearch.index.query.BaseTermQueryBuilder.doXContent(BaseTermQueryBuilder.java:154)
	at org.elasticsearch.index.query.AbstractQueryBuilder.toXContent(AbstractQueryBuilder.java:82)
	at org.elasticsearch.index.query.BoolQueryBuilder.doXArrayContent(BoolQueryBuilder.java:275)
	at org.elasticsearch.index.query.BoolQueryBuilder.doXContent(BoolQueryBuilder.java:256)
	at org.elasticsearch.index.query.AbstractQueryBuilder.toXContent(AbstractQueryBuilder.java:82)
	at org.elasticsearch.common.xcontent.XContentBuilder.value(XContentBuilder.java:779)
	at org.elasticsearch.common.xcontent.XContentBuilder.value(XContentBuilder.java:772)
	at org.elasticsearch.common.xcontent.XContentBuilder.field(XContentBuilder.java:764)
	at org.elasticsearch.search.builder.SearchSourceBuilder.toXContent(SearchSourceBuilder.java:1184)
	at org.elasticsearch.common.xcontent.XContentHelper.toXContent(XContentHelper.java:349)
	at org.elasticsearch.search.builder.SearchSourceBuilder.toString(SearchSourceBuilder.java:1558)
	at org.elasticsearch.search.builder.SearchSourceBuilder.toString(SearchSourceBuilder.java:1553)
	at java.lang.String.valueOf(String.java:2994)
	at java.lang.StringBuilder.append(StringBuilder.java:131)
	at org.elasticsearch.action.search.SearchRequest.toString(SearchRequest.java:516)
```

从异常信息看，显然ES无法接受BigDecimal类型，经过百度，也确实如此。在一篇博文评论中解释如下：

>应该是客户端代码里将查询的数值定义成了java.math.BigDecimal，而ES不支持这个类型。之所以2.2没有问题，是因为之前的transport client发送数据之前将其序列化成了json，而在5.x以后，使用的内部的transport protocol，数据类型如果不匹配会抛错误。
>
>所以数据类型的定义上，需要使用ES支持的类型。

### 解决方案一：转变成其他ES支持的数据类型

我使用的是6.5.4版本的Elasticsearch，该版本尚不支持BigDecimal或者BigInteger的数据类型，所以在index到Elasticsearch之前，需要转换成其他数据类型，这里要注意不要数据溢出了:

1. BigDecimal要转变成Double类型
2. BigInteger要转变成Long类型

### 解决方案二：使用更高版本的ES

我在看6.7.1版本的Elasticsearch源码时发现已经可以支持BigDecimal或者BigInteger的数据类型了，所以直接使用该版本或更高版本的就行了。

下面附上两个版本的支持的数据类型的源码：

* 6.5.4版本的Elasticsearch相关源码

```java
Map<Class<?>, Writer> writers = new HashMap<>();
writers.put(Boolean.class, (b, v) -> b.value((Boolean) v));
writers.put(Byte.class, (b, v) -> b.value((Byte) v));
writers.put(byte[].class, (b, v) -> b.value((byte[]) v));
writers.put(Date.class, XContentBuilder::timeValue);
writers.put(Double.class, (b, v) -> b.value((Double) v));
writers.put(double[].class, (b, v) -> b.values((double[]) v));
writers.put(Float.class, (b, v) -> b.value((Float) v));
writers.put(float[].class, (b, v) -> b.values((float[]) v));
writers.put(Integer.class, (b, v) -> b.value((Integer) v));
writers.put(int[].class, (b, v) -> b.values((int[]) v));
writers.put(Long.class, (b, v) -> b.value((Long) v));
writers.put(long[].class, (b, v) -> b.values((long[]) v));
writers.put(Short.class, (b, v) -> b.value((Short) v));
writers.put(short[].class, (b, v) -> b.values((short[]) v));
writers.put(String.class, (b, v) -> b.value((String) v));
writers.put(String[].class, (b, v) -> b.values((String[]) v));
writers.put(Locale.class, (b, v) -> b.value(v.toString()));
writers.put(Class.class, (b, v) -> b.value(v.toString()));
writers.put(ZonedDateTime.class, (b, v) -> b.value(v.toString()));
writers.put(Calendar.class, XContentBuilder::timeValue);
writers.put(GregorianCalendar.class, XContentBuilder::timeValue);
```

* 6.7.1版本的Elasticsearch相关源码

```java
Map<Class<?>, Writer> writers = new HashMap<>();
writers.put(Boolean.class, (b, v) -> b.value((Boolean) v));
writers.put(Byte.class, (b, v) -> b.value((Byte) v));
writers.put(byte[].class, (b, v) -> b.value((byte[]) v));
writers.put(Date.class, XContentBuilder::timeValue);
writers.put(Double.class, (b, v) -> b.value((Double) v));
writers.put(double[].class, (b, v) -> b.values((double[]) v));
writers.put(Float.class, (b, v) -> b.value((Float) v));
writers.put(float[].class, (b, v) -> b.values((float[]) v));
writers.put(Integer.class, (b, v) -> b.value((Integer) v));
writers.put(int[].class, (b, v) -> b.values((int[]) v));
writers.put(Long.class, (b, v) -> b.value((Long) v));
writers.put(long[].class, (b, v) -> b.values((long[]) v));
writers.put(Short.class, (b, v) -> b.value((Short) v));
writers.put(short[].class, (b, v) -> b.values((short[]) v));
writers.put(String.class, (b, v) -> b.value((String) v));
writers.put(String[].class, (b, v) -> b.values((String[]) v));
writers.put(Locale.class, (b, v) -> b.value(v.toString()));
writers.put(Class.class, (b, v) -> b.value(v.toString()));
writers.put(ZonedDateTime.class, (b, v) -> b.value(v.toString()));
writers.put(Calendar.class, XContentBuilder::timeValue);
writers.put(GregorianCalendar.class, XContentBuilder::timeValue);
writers.put(BigInteger.class, (b, v) -> b.value((BigInteger) v));
writers.put(BigDecimal.class, (b, v) -> b.value((BigDecimal) v));
```

可以发现，在6.7.1版本的源码里，多出了最后的两种数据类型的支持：BigInteger和BigDecimal。

## 参考链接

* [Elasticsearch Guide 6.7 - Search Settings](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/search-settings.html)
* [ES 问题 ： too_many_clauses maxClauseCount is set to 1024](https://blog.csdn.net/qingmou_csdn/article/details/86687041)
* [elastic search 5.4.版本，java api 调用出现：can not write type 【class java.math.BigDecimal】](https://elasticsearch.cn/question/3757)