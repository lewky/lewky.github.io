# ELK系列(6) - Elasticsearch常用接口

## 创建索引

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

<!--more-->
## 查询索引

```
// 查询索引，v参数会显示column，对应的column可以作为url参数并配合通配符来使用
GET http://localhost:9200/_cat/indices?v
GET http://localhost:9200/_cat/indices?v&index=item*

// 查询blog索引中id为1的文档，pretty参数会格式化返回的json，可以只查询文档的_source节点
GET http://localhost:9200/blog/_doc/1?pretty
GET http://localhost:9200/blog/_doc/1/_source?pretty
```

## 删除索引

```
// 删除索引，可以同时删除多个索引，也可以使用通配符或_all，_all是删除所有索引
// 不建议使用通配符或_all，万一误删索引影响较大
DELETE http://localhost:9200/blog
DELETE http://localhost:9200/blog1,blog2
DELETE http://localhost:9200/blog*
DELETE http://localhost:9200/_all

// delete_by_query，会通过批处理来删除查询到的数据。
// 如果查询或批处理请求被拒绝，在默认最多重试10次后会导致delete_by_query中止，并记录在failures字段中，已删除的数据不会被回滚。
// 如果不希望故障中止，可以在URL中设置为conflicts=proceed或者在请求体中设置"conflicts": "proceed"
POST http://localhost:9200/blog/_delete_by_query
{
  "query": { 
    "match": {
      "name": "Lewis Liu"
    }
  }
}
```

## 配置类接口

```
// 查询blog索引的配置，不指定索引则会查询所有索引的配置
GET http://localhost:9200/blog/_settings
GET http://localhost:9200/_settings

// 查询blog索引的映射，不指定索引则会查询所有索引的映射
GET http://localhost:9200/blog/_mapping
GET http://localhost:9200/_mapping

// 查询节点健康状态，如果是单节点部署则status是yellow，因为单节点部署下无法分配副本分片
// 健康状态分为红绿黄三色：green是健康，所有分片均处于可用状态。
// yellow是主分片可用，副本分片不可用或者根本没有副本分片，此时ES集群可用性降低。
// red是部分分片可用，意味着至少有部分主分片损坏。这会导致数据缺失，搜索结果可能只能返回一部分。
GET http://localhost:9200/_cluster/health?pretty
GET http://localhost:9200/_cat/health?v

// 查询索引的分片信息（shard，默认是5个主分片primary和1个副本分片replica，即一个主分片都有一个副本，也就是总共10个分片）
// 主分片和副本分片不能在同一个节点上，换言之如果是单节点部署则无法分配副本分片
// 分片算法：shard = hash(routing) % number_of_primary_shards
// 为了避免主分片数量增加导致分片路由变动，从而永远找不到旧路由下的文档，因此ES不允许在创建索引后改变主分片数量。
GET http://localhost:9200/_cat/shards?v
```

## 分段接口

ES在索引数据时会生成分段（segment，一个segment就是一个完整的lucene倒排索引），分段是不可变的，如果分段中的数据被删除了，实际上只是打了一个删除标志。ES在查询时依然会查询到分段中这些有删除标志的文件，但是在返回结果时会将其过滤。只有在合并分段时，这些文件才会被真正地物理删除，并释放被占用的内存。

换言之，如果有频繁删改数据（由于分段文件不可变，更新文档实际上也是删除+创建文档），会生成越来越多的分段，最终影响性能，所以每隔一段时间需要对这些分段进行合并。对于一些不再更新的索引，也要主动进行合并分段操作。由于合并分段时对服务器负载较大（取决于索引的数据量），所以要挑个相对空闲的时间来合并分段。当然ES本身自己也会在分段数量达到一定程度后自动合并，只是通过主动合并分段可以提前释放被占用的内存。

分段数量也不是越少越好，这会导致一个分段太大，使得查询性能降低，当查询效率低于期望时，这时候就需要考虑增加shard数量，提升查询的并行度。一般推荐一个shard不要超过50GB，也就是说一个segment最好也不要超过这个值。

```
// 查询所有索引的分段信息
GET http://localhost:9200/_cat/segments?v

// 查询blog索引的分段信息
GET http://localhost:9200/_cat/segments/blog?v

// 合并blog索引的分段，尽量避免一次性合并所有索引的分段，以免影响查询性能
// max_num_segments表示最终合并成几个大分段
POST http://localhost:9200/blog/_forcemerge?max_num_segments=1

// 查询合并分段的进度
GET http://localhost:9200/_cat/indices/?s=segmentsCount:desc&v&h=index,segmentsCount,segmentsMemory,memoryTotal,mergesCurrent,mergesCurrentDocs,storeSize,docsDeleted,p,r

// 查询当前合并分段的线程数
GET http://localhost:9200/_cat/thread_pool/force_merge?s=name&v
```

除了合并分段外，也可以通过删除不用的索引、或者关闭不用的索引来减少分段的内存占用，会比合并分段操作释放更多被占用的内存。

## 分词接口

```
// 查询blog索引中id为1的文档中的name及其子字段的分词情况
GET http://localhost:9200/blog/doc/1/_termvectors?fields=name.*

// 查询词项分析，和上面接口的区别在于：这个用来测试指定字符串的词项分析情况，因此这个接口需要传入body
// 查询blog索引中text字段的词项分析情况，这里指定的分析器是char_group_analyzer，字段值是test_123
GET http://localhost:9200/blog/_analyze
{
    "analyzer": "char_group_analyzer",
    "text": "test_123"
}
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

## 参考链接

* [Elasticsearch Guide 6.7 - Search Settings](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/search-settings.html)
* [2019-07-01 elasticsearch force merge 步骤 原创](https://www.jianshu.com/p/1c5c921346e2)
* [segment段文件非常大会有什么问题没？比如说100G一个？](https://elasticsearch.cn/question/2794)
* [Elasticsearch 集群和索引健康状态及常见错误说明](https://www.cnblogs.com/kevingrace/p/10671063.html)