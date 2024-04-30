# SQL - where条件里的!=会过滤值为null的数据

## on和where的区别

on和where后都表示查询条件，它们的区别如下：

1、on只能用于连接查询（内连接、外连接、交叉连接），在其他情况下使用on会报错，比如：

```sql
select* from test on id = 1; -- 报错，不能在普通查询里使用on，需要使用where
```

2、连接查询会产生一张中间表(临时表)，on是在生成中间表时使用的条件；而where是在中间表生成后对中间表进行过滤使用的条件。比如：
<!--more-->

test1表：

|id|name|
|:-:|:-:|
|1|A|
|2|B|
|3|C|

test2表：

|id|name|
|:-:|:-:|
|1|E|
|3|F|

```sql
select* from test1 left join test2 on test1.id = test2.id and test1.id = 1;
select* from test1 left join test2 on test1.id = test2.id where test1.id = 1;
```

对于第一个语句，结果是：

|id|name|id|name|
|:-:|:-:|:-:|:-:|
|1|A|1|E|
|2|B|null|null|
|3|C|null|null|

对于第二个语句，结果是：

|id|name|id|name|
|:-:|:-:|:-:|:-:|
|1|A|1|E|

3、外连接必须使用on，不然会报错。比如：

```sql
select* from test1 left join test2;  -- 报错，没有使用on
select* from test1 left join test2 where test1.id = test2.id;  -- 报错，没有使用on
```

4、在一个内连接和交叉连接中，单独使用on和where对结果集没有区别。比如：

```sql
select* from test1 inner join test2 on test1.id = test2.id;
select* from test1 inner join test2 where test1.id = test2.id;
```

注：以上语句都是在MySQL5.0的情况下测试的。

## 单引号和双引号的区别

在标准SQL中，字符串使用的是单引号。

如果字符串本身也包括单引号，则使用两个单引号（注意，不是双引号，字符串中的双引号不需要另外转义）。

但在其它的数据库中可能存在对SQL的扩展，比如在MySQL中允许使用单引号和双引号两种。

MySQL参考手册：

>字符串指用单引号`'`或双引号`"`引起来的字符序列。例如：
>
>'a string'
>
>"another string"
>
>如果SQL服务器模式启用了NSI_QUOTES，可以只用单引号引用字符串。用双引号引用的字符串被解释为一个识别符。

## !=会过滤值为null的数据

在测试数据时忽然发现，使用如下的SQL是无法查询到对应column为null的数据的：

```sql
select * from test where name != 'Lewis';
```

本意是想把表里name的值不为`Lewis`的所有数据都搜索出来，结果发现这样写无法把name的值为null的数据也包括进来。

上面的`!=`换成`<>`也是一样的结果，这可能是因为在数据库里null是一个特殊值，有自己的判断标准，如果想要把null的数据也一起搜索出来，需要额外加上条件，如下：
```sql
select * from test where name != 'Lewis' or name is null;
```

虽然这只是个小知识点，不过还是值得记录注意下，以免日后在开发中犯小错误。

## null值的比较

SQL里任何与null值的比较结果，最后都会变成null，以`PostgreSQL`为例，如下：

```sql
select null != null;
select null = null;
select null > 1;
select null <> 1;
```

以上结果都是null，而不是什么true或者false。另外有些函数是不支持null值作为输入参数的，比如`count()`或者`sum()`等。

## nulls值排序问题

使用`order by`来为指定的字段进行排序时，如果db中该字段的值存在着null值，那么在排序时不同的DB对于null值的默认值不同，这会导致默认情况下不同DB中null值的顺序不同。

### 在PostgreSQL中，null值默认最大

如果对一个学生表里的数据按照age字段进行顺序排序，如下：

```sql
select * from student order by age
```

如果name字段存在null值，那么这条sql的结果集就如下所示：

```
|id|student|age|
|1|小明|10|
|2|小红|12|
|3|小黑|null|
|4|小白|null|
```

因为null值默认是最大，所以在升序排列中null值的记录就会被排到最后。同样地，如果是降序排列，null值记录就会被排到最前面。

### 在Oracle中，null值默认最大

Oracle中同样认为null值最大，也就是说，升序排列时null值默认排在最后；降序排列时null值默认排在最前。

### 在MySQL和SQLServer中，null值默认最小

MySQL和SQLServer则相反，null值默认是最小。当升序排列时null值默认排在最前；降序排列时null值默认排在最后。

在实际的业务中，null值参与的排序这可能会造成一些不必要的问题，有时候甚至会造成一个bug并且难以被发现。

所以，在对这些有可能存在null值的字段进行排序时需要注意使用关键字`nulls last/first`。

## `nulls last/first`的具体用法

我们可以通过`nulls last`或者`nulls first`关键字来指定这些null值的record是排在最后还是最前，如下：

```sql
select * from student order by age desc nulls last;
```

该语句指定了降序排列时，null值排到最后；需要注意的是，该关键字只能搭配order by来使用。一共也就四种用法：

* order by [asc] nulls first
* order by [asc] nulls last
* order by desc nulls first
* order by desc nulls last

## 参考链接

* [Sql 中 不等于''与 NULL](https://blog.csdn.net/qq_36260310/article/details/79697408)
* [mysql 空值排序问题](http://jichangxucode.blog.163.com/blog/static/207713391201352424135186/)
* [PostgreSQL 数据库NULL值的默认排序行为与查询、索引定义规范 - nulls first\last, asc\desc](https://yq.aliyun.com/articles/241219)
* [SQL中的单引号和双引号有区别吗？](https://segmentfault.com/q/1010000000236690)