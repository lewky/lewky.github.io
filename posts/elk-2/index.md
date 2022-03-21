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

## 全文搜索

Kibana的搜索框如果输入搜索的关键字，会将关键字进行全文搜索，如果关键字是一个短语（比如带有空格的一段英文），则会自动进行分词再全文搜索。

如果不希望短语被分词，则需要将短语用一对英文括号包括起来。比如说搜索关键字是`"Quick brown fox"`，那么就不会匹配到`"quick fox brown"`。因为被括号包括起来的短语是一个整体，不会被分词，因此匹配顺序不能被颠倒。

## Query String

Kibana的搜索框也支持Query String，即原本完整的ES查询DSL的简化字符串，如下是一个Query DSL：

```json
{
    "query":{
        "match":{
            "name":"elastic"
        }
    }
}
```

上面的Query DSL可以简化为如下Query String：

```
name:elastic
```

Kibana的搜索框可以用上面的Query String来查询，也可以直接用DSL来查询：

```json
{    
    "match":{    
        "name":"elastic"
    }
}
```

下面是常用的一些Query String语法：

### 字段搜索

```
// 字段搜索
field:value

// 字段短语搜索（精确搜索，对应的term查询，不会被分词，必须完全匹配）
field:"value"

// 查询存在某字段的数据
_exists_:field

// 查询不存在某字段的数据，NOT要大写
NOT (_exists_:field)
```

### 通配符查询wildcard search

通配符：?匹配单个字符，*匹配0到多个字符。

通配符性能较低下，因此不要把通配符放在最前面，会占用较多内存，谨慎使用。

```
// 如下可以匹配到commandType为EntityChangedEvent的数据
commandType:entit?c*vent
```

### 运算符

由于lucene没有实现运算符优先级的解析，所以对于一些复杂的组合查询最好用小括号包括起来。

如果不用符号来替代运算符，则必须使用大写，否则没有效果（or除外，实际上其他运算符如果不用大写就相当于使用了默认的运算符OR），比如不能使用and，而应该使用AND。

```
// 且运算AND，也可以用&&代替
category:doc && commandType:senddoc1
category:doc AND commandType:senddoc1

// 或运算OR，也可以用||代替
category:doc || commandType:senddoc1
commandType:(senddoc1 OR senddoc8)

// 非运算NOT，也可以用!代替
!(_exists_:category)
commandType:(senddoc* NOT senddoc8)

// must查询，用+表示，必须用小括号包括起来
commandType:(+senddoc1)

// must not查询，用-表示，必须用小括号包括起来
commandType:(-senddoc1)
name:(tom +lee -alfred)
```

### 正则查询regular expressionsearch

支持部分正则，用一对`/`包括起来，但是正则内存压力较大，性能较差，谨慎使用。

```
// 如下可以匹配到commandType为EntityChangedEvent的数据
commandType:/[a-z]*event/
```

### 模糊搜索fuzzy search

模糊查询是指允许搜索和匹配的词（term）之间有差异，比如搜索surprize，可以匹配到surprise。

在value后面加上~即可开启模糊搜索，默认模糊度为2，也可以在~后自行设置0~2之间的浮点数作为模糊度。

```
// 如下可以匹配到commandType为EntityChangedEvent的数据
commandType:EntityChangedEvemtt~
commandType:EntityChangedEvemtt~1.1
```

### 近似度查询 proximity search

近似度查询是指在一个短语（phrase）中，词（term）与词之间距离的匹配。换言之，这是一个专门给短语使用的模糊搜索。

```
// 匹配时允许tom和lee之间有2个词的距离
name:"tom lee"~2
```

### 范围查询range search

数值和日期类型可以用范围查询，闭区间用`[]`，开区间用`{}`；也可以用简略写法。

IP和字符也可以使用范围查询来限制字符。

```
// 1<=age<=10
age:[1 TO 10]
age:(>=1 && <=10)
age:(+>=1 +<=10)

// 1<=age<10
age:[1 TO 10}
age:(>=1 && <10)
age:(+>=1 +<10)

// age>=1
age:[1 TO ]
age:>=1

// age<=10
age:[* TO 10]
age:<=10
```

其他例子：

```
ip:["172.24.20.110" TO "172.24.20.140"]
date:{"now-6h" TO "now"}
tag:{b TO e}    // 搜索b到e中间的字符
```

### 提升查询权重boosting term

默认查询权重是1，通过调整权重来改变查询结果的优先级

```
// 当name中包含tom时，其权重是lee的4倍
name:(tom^4 lee)
```

### 特殊字符过滤

由于Query String本身使用了一些字符作为关键字，因此若想查询这些字符，需要用`\`进行转义。

```
// 查询(1+1):2
\(1\+1\)\:2
```

## 参考链接

* [Kibana顶部的那个输入框你知道怎么用吗？](https://www.jianshu.com/p/1af3843466fd)