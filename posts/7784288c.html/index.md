# ELK系列(4) - Elasticsearch cannot write xcontent for unknown value of type class java.math.BigDecimal

## 问题与分析

在使用Elasticsearch进行index数据时，发现报错如下：
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
<!--more-->

从异常信息看，显然ES无法接受BigDecimal类型，经过百度，也确实如此。在一篇博文评论中解释如下：
>应该是客户端代码里将查询的数值定义成了java.math.BigDecimal，而ES不支持这个类型。之所以2.2没有问题，是因为之前的transport client发送数据之前将其序列化成了json，而在5.x以后，使用的内部的transport protocol，数据类型如果不匹配会抛错误。
>
>所以数据类型的定义上，需要使用ES支持的类型。

## 解决方案

### 方案一：转变成其他ES支持的数据类型

我使用的是6.4.2版本的Elasticsearch，该版本尚不支持BigDecimal或者BigInteger的数据类型，所以在index到Elasticsearch之前，需要转换成其他数据类型，这里要注意不要数据溢出了:

1. BigDecimal要转变成Double类型
2. BigInteger要转变成Long类型

### 方案二：使用更高版本的ES

我在看6.7.1版本的Elasticsearch源码时发现已经可以支持BigDecimal或者BigInteger的数据类型了，所以直接使用该版本或更高版本的就行了。

下面附上两个版本的支持的数据类型的源码：

* 6.4.2版本的Elasticsearch相关源码

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

* [elastic search 5.4.版本，java api 调用出现：can not write type [class java.math.BigDecimal]](https://elasticsearch.cn/question/3757)
