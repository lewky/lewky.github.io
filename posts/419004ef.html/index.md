# SQL - nulls值排序问题

## 给字段排序时遇到的null值问题

当我们使用`order by`来为指定的字段进行排序时，如果db中该字段的值存在着null值，那么在排序时这些null值会不会参与排序呢？如果参与排序的话，又是以怎样的标准来排序？

在不同的DB中，对于null值的默认值不同。<!--more-->

### 在`PostgreSQL`中，null值默认最大

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

### 在`Oracle`中，null值默认最大

Oracle中同样认为null值最大，也就是说，升序排列时null值默认排在最后；降序排列时null值默认排在最前。

### 在`MySQL`和`SQLServer`中，null值默认最小

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

如果想了解更多关于db中的这些null值，可以看看下边的链接：

1. [mysql 空值排序问题](http://jichangxucode.blog.163.com/blog/static/207713391201352424135186/)
2. [PostgreSQL 数据库NULL值的默认排序行为与查询、索引定义规范 - nulls first\last, asc\desc](https://yq.aliyun.com/articles/241219)
