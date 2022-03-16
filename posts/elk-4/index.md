# ELK系列(4) - Elasticsearch问题汇总

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

## 设置远程访问

修改配置文件`config/elasticsearch.yml`：

```yml
#network.host: 192.168.0.1
network.host: 0.0.0.0
```

若设置为127.0.0.1则只能在本地访问。

## 常用接口

### 创建索引

```
// 创建blog索引，类型是_doc，id是1
curl -H 'Content-Type:application/json' -XPUT http://localhost:9200/blog/_doc/1 -d '
{
      "id": "1",
      "title": "New version of Elasticsearch released!",
      "content": "Version 1.0 released today!",
      "priority": 10,
      "tags": ["announce", "elasticsearch", "release"]
}'

// 创建blog索引，类型是_doc，id由ES自己生成
// 该id长度为20个字符，URL安全，base64编码，GUID，分布式系统并行生成时不可能会发生冲突
curl -H 'Content-Type:application/json' -XPOST http://localhost:9200/blog/_doc/ -d '
{
      "title": "New version of Elasticsearch released!",
      "content": "Version 1.0 released today!",
      "priority": 10,
      "tags": ["announce", "elasticsearch", "release"]
}'
```

### 查询索引

```
// 查询索引，v参数会显示column，对应的column可以作为url参数并配合通配符来使用
GET http://localhost:9200/_cat/indices?v
GET http://localhost:9200/_cat/indices?v&index=item*

// 查询blog索引中id为1的文档，pretty参数会格式化返回的json，可以只查询文档的_source节点
GET http://localhost:9200/blog/_doc/1?pretty
GET http://localhost:9200/blog/_doc/1/_source?pretty
```

### 删除索引

```
// 删除索引，可以同时删除多个索引，也可以使用通配符或_all，_all是删除所有索引
// 不建议使用通配符或_all，万一误删索引影响较大
DELETE http://localhost:9200/blog
DELETE http://localhost:9200/blog1,blog2
DELETE http://localhost:9200/blog*
DELETE http://localhost:9200/_all
```

## 查询参数

在查询时可以通过添加一些参数来达到调试的目的。

### explain

如果想显示当前查询的打分情况，可以添加`explain: true`，在查询结果的`hits`节点中，每个命中的文档里会多出来一个`_explanation`节点。

```json
{
    "from": 0,
    "size": 50,
    "explain": true,
    "query": {},
    "_source": {},
    "sort": []
}
```

### profile

如果想显示当前查询的命中情况，可以添加`profile: true`，在查询结果中会多出来一个`profile`节点。不过需要注意的是，如果查询的索引字段很多，profile参数可能会导致当前的查询效率很慢，返回的结果也会很大。

```json
{
    "from": 0,
    "size": 50,
    "profile": true,
    "query": {},
    "_source": {},
    "sort": []
}
```

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

## 不支持BigDecimal类型

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

从异常信息看，显然ES的接口无法接收BigDecimal类型，经过百度，也确实如此。在一篇博文评论中解释如下：

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

## Limit of total fields [1000] in index has been exceeded

在索引数据时ES抛出异常：

```
cause: ElasticsearchException[Elasticsearch exception [type=illegal_argument_exception, reason=Limit of total fields [1000] in index [item] has been exceeded]]
```

这是由于被索引的文档字段数量超过了默认的1000上限，两种解决方法，要么减少文档的字段，要么增加字段上限。

增加字段上限可以只设置某个索引，也可以设置为全局的配置，对所有已存在的索引生效，但对之后新建的索引是无效的。

```
// 只设置test索引的配置
PUT http://localhost:9200/test/_settings

{
  "index.mapping.total_fields.limit": 5000
}

// 全局的配置
PUT http://localhost:9200/_settings

{
  "index.mapping.total_fields.limit": 5000
}
```

## FORBIDDEN/12/index read-only / allow delete (api)

索引数据时报错如下：

```
cause: ElasticsearchException[Elasticsearch exception [type=cluster_block_exception, reason=blocked by: [FORBIDDEN/12/index read-only / allow delete (api)];]]
```

这是ES节点的数据目录data磁盘空间使用率超过90%导致的，为了保护数据，ES将索引变为只读模式，只允许删除。

此时需要增大磁盘的使用空间，有如下多种方法：

1. 集群增加节点
2. 降低集群的索引副本数量
3. 清理磁盘无用的数据，比如日志等

ES应该尽量别和其他项目部署在一起，磁盘容易被其他项目的日志挤占。此外，ES本身的日志和数据存储目录也可以配置在不同的目录，需要更改配置文件`/config/elasticsearch.yml`：

```yml
# ----------------------------------- Paths ------------------------------------
#
# Path to directory where to store the data (separate multiple locations by comma):
#
#path.data: /path/to/data
#
# Path to log files:
#
#path.logs: /path/to/logs
```

在增大了磁盘的使用空间后，索引的只读状态需要手动更改回来，可以更改所有索引，也可以只指定某个索引（用对应的索引名字取代`_all`，`_all`表示所有索引，如果不指定索引名，也不使用`_all`，同样表示修改全局配置）：

```
// curl方式
curl -XPUT -H "Content-Type: application/json" http://localhost:9200/_all/_settings -d '{"index.blocks.read_only_allow_delete": null}'

// RESTful方式
PUT http://localhost:9200/_all/_settings

{"index.blocks.read_only_allow_delete": null}
```

## Result window is too large

报错如下：

```json
"root_cause": [{
    "type": "illegal_argument_exception",
    "reason": "Result window is too large, from + size must be less than or equal to: [10000] but was [80000]. See the scroll api for a more efficient way to request large data sets. This limit can be set by changing the [index.max_result_window] index level setting."
}]
```

ES分页查询（from+size）默认的最大查询结果数量为10000，可以通过修改max_result_window的值来提高上限：

```
// curl方式
curl -XPUT -H "Content-Type: application/json" http://localhost:9200/_all/_settings -d '{"index.max_result_window" :"100000"}'

// RESTful方式
PUT http://localhost:9200/_all/_settings

{"index.max_result_window" :"100000"}
```

## failed to parse date field

在查询es时报错如下：

```json
{
	"error": {
		"root_cause": [{
			"type": "parse_exception",
			"reason": "failed to parse date field [2021-06-15 00:00:00] with format [strict_date_optional_time||epoch_millis]"
		}],
		"type": "search_phase_execution_exception",
		"reason": "all shards failed",
		"phase": "query",
		"grouped": true,
		"failed_shards": [{
			"shard": 0,
			"index": "inspectbooking_kmt",
			"node": "Its-Juf2QXKEwmYYNu_aBQ",
			"reason": {
				"type": "parse_exception",
				"reason": "failed to parse date field [2021-06-15 00:00:00] with format [strict_date_optional_time||epoch_millis]",
				"caused_by": {
					"type": "illegal_argument_exception",
					"reason": "Unrecognized chars at the end of [2021-06-15 00:00:00]: [ 00:00:00]"
				}
			}
		}]
	},
	"status": 400
}
```

这是因为es的日期默认使用`strict_date_optional_time`和`epoch_millis`的format来匹配，前者是严格的ISO日期格式，后者是毫秒值格式。

这里由于搜索日期值使用的是`2021-06-15 00:00:00`这种格式，无法被es的日期解析器解析成上述的两种格式，因此抛出异常。要避免这种异常，要么修改mapping中日期字段的format，比如说用`||`添加新的格式：`"format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"`；要么修改搜索日期时输入的值。

由于mapping一旦确定就无法更改，因此更推荐改变被搜索的日期值格式这种做法：

```java
DateTimeFormatter dateTimePattern = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
// 日期字符串是从db中获取的零时区日期
TemporalAccessor parseDateTime = dateTimePattern.parse("2021-06-15 00:00:00");
LocalDateTime localDateTime = LocalDateTime.from(parseDateTime);
DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(localDateTime);
```

## Request size exceeded 104857600 bytes

在使用bulk批处理ES请求时，报错如下：

```java
 URI [/_bulk?timeout=1m], status line [HTTP/1.1 413 Request Entity Too Large]
{"Message":"Request size exceeded 104857600 bytes"} 
    at org.elasticsearch.client.RestClient$SyncResponseListener.get(RestClient.java:926)
    at org.elasticsearch.client.RestClient.performRequest(RestClient.java:229)
    at org.elasticsearch.client.RestHighLevelClient.internalPerformRequest(RestHighLevelClient.java:1593)
    ...
```

ES默认的请求内容最大值为100mb，超过100mb就会报错，可以在`/config/elasticsearch.yml`中添加如下配置：

```yml
http.max_content_length: 200mb
```

注：AWS的ES似乎没有提供修改ES配置文件的服务，在请求最大值上也只有10mb或者100mb的两种选项。

* [AWS Elasticsearch cluster method to update `http.max_content_length`?](https://stackoverflow.com/questions/55541625/aws-elasticsearch-cluster-method-to-update-http-max-content-length)

## 查询区分大小写

Elasticsearch在分词时会进行分词，分词器会自动将英文转为小写，这样可以减少分词后的英文词项数量，从而减少内存的使用。

text类型会经过上述的分词，keyword类型则会将原本的文本原封不动进行保存。而Elasticsearch在查询时，又是区分大小写的，这会导致一个情况：

* 被查询的字段是text类型，搜索的关键词如果包含大写字母则会搜索不到结果，因为text类型被分词后的词项里全是小写字母。
* 被查询的字段是keyword类型则没有这个问题。

对于这个问题，如果希望搜索时保持区分大小写，可以把text类型改为keyword类型，这样还可以起到节省内存的效果，因为keyword类型不会分词，相当于索引的词项只有一个原始文本。

如果只是希望能搜索到结果，又不想改类型，可以在程序中对用户搜索的关键词进行预处理，先将其转换为小写，再进行搜索，但是这样会导致搜索不到keyword类型的文本，因为原始文本可能包含了大写字母。对于这种情况，可以给keyword类型添加一个analysis分析器：

``` 
# 给test_normalizer索引定义一个分析器normalizer 
# 将定义的分析器配置给keyword类型的字段
PUT test_normalizer
{
  "settings": {
    "analysis": {
      "normalizer": {
        "lowercase": {
          "type": "custom",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
      "properties": {
        "foo": {
          "type": "keyword"
        },
        "foo_normalizer": {
          "type": "keyword",
          "normalizer": "lowercase"
        }
    }
  }
}

# 给test_normalizer索引一些测试数据
PUT test_normalizer/_doc/1
{
  "foo": "bar",
  "foo_normalizer": "bar"
}
PUT test_normalizer/_doc/2
{
  "foo": "Bar",
  "foo_normalizer": "Bar"
}
 
# 查询测试一
GET test_normalizer/_search
{
  "query": {
    "term":{
      "foo":"BaR"
    }
  }
}
# 查询测试二
GET test_normalizer/_search
{
  "query": {
    "term":{
      "foo_normalizer":"bAr"
    }
  }
}
```

由于上述配置了keyword的分析器，会将keyword类型的单词项进行小写处理，这样一来无论是写入ES的数据，还是搜索keyword时的词项都是全小写的，因此查询测试二可以成功搜索到数据。

此外，text类型实际上会自动添加一个keyword类型的子字段来保存原始文本：

```json
"foo": {
    "type": "text",
    "fields": {
        "keyword": {
            "type": "keyword",
            "ignore_above": 256
        }
    }
}
```

## 自定义的几种分词器

ES的分析（analysis）指的是用过分析器（Analyzer）将一个原始文本进行分析、分词为一个个标记或词项的过程，分析器通常分为三个部分：字符过滤器（Character filters）、分词器（Tokenizers）和标记过滤器（Token filters）。

一个原始文本，首先经过字符过滤器来过滤特定的字符，然后分词器将其进行分词为一个个标记（Token），标记过滤器再对这些标记进行过滤（比如转成全小写）。

* [ES 6.4 - Analysis](https://www.elastic.co/guide/en/elasticsearch/reference/6.4/analysis.html)

下面的配置自定义了两个分析器，一个是按照指定的字符来分词，一个是ngram分词（就是将一个单词分解成若干个前缀词项，用于前缀搜索，比如将Item分解为I，It，Ite，Item）。

```
{
	"settings": {
		"analysis": {
			"analyzer": {
				"char_group_analyzer": {
					"tokenizer": "char_group_tokenizer",
					"filter": [
						"lowercase"
					]
				},
				"ngram_analyzer": {
					"tokenizer": "ngram_tokenizer",
					"filter": [
						"lowercase"
					]
				}
			},
			"tokenizer": {
				"char_group_tokenizer": {
					"type": "char_group",
					"tokenize_on_chars": [
						"whitespace",
						"-",
						"_",
						"/",
						"\\"
					]
				},
				"ngram_tokenizer": {
					"type": "ngram"
				}
			}
		}
	}
}
```

将上面定义的分析器用于指定的索引字段中：

```
{
    "properties": {
        "fieldA": {
            "type": "text",
            "fields": {
                "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                },
                "ngram_search": {
                    "type": "text",
                    "analyzer": "ngram_analyzer"
                },
                "char_group_search": {
                    "type": "text",
                    "analyzer": "char_group_analyzer"
                }
            }
        }
    }
}
```

注意，在修改Settings时需要先关闭index，修改完之后再打开index：

```
// 关闭索引
POST localhost:9200/<indexName>/_close
// 打开索引
POST localhost:9200/<indexName>/_open
```

## 禁止通过某个字段来搜索到整个文档

通常情况下可以ES的全文搜索会通过匹配整个文档中的全部字段，如果不希望通过某个字段来搜索到整个文档，可以将该字段配置为`index: false`。

```
# 这里的test是index，_doc是type，修改fieldA的mapping（只能增量更新，不能删改已存在的属性）
PUT http://localhost:9200/test/_doc/_mapping
{
    "properties": {
        "fieldA": {
            "type": "text",
            "index": false
        }
    }
}
```

## 参考链接

* [Elasticsearch Guide 6.7 - Search Settings](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/search-settings.html)
* [ES 问题 ： too_many_clauses maxClauseCount is set to 1024](https://blog.csdn.net/qingmou_csdn/article/details/86687041)
* [elastic search 5.4.版本，java api 调用出现：can not write type 【class java.math.BigDecimal】](https://elasticsearch.cn/question/3757)
* [java.lang.IllegalArgumentException: Limit of total fields 【1000】 in index 索引名称](https://blog.csdn.net/qq_15713753/article/details/94436186)
* [ES 写索引报错 FORBIDDEN/12/index read-only / allow delete (api)解决方案](https://blog.csdn.net/zheng45/article/details/92383323)
* [ES更改参数max_result_window](https://www.cnblogs.com/binbinyouni/p/10749985.html)
* [Elasticsearch date 类型详解](https://www.jianshu.com/p/a44f6523912b)
* [hive向ES中插入数据量过大时出错：HTTP content length exceeded 104857600 bytes.](https://blog.csdn.net/ly_521015/article/details/88421596)
* [Elasticsearch让 keyword 和 term 忽略大小写](https://blog.csdn.net/lzzyok/article/details/107051689)