# PostgreSQL - SQL调优方案

## 分析执行计划

`explain`可以看到sql的执行计划（但不会去执行这条sql），`explain analyze`或者`explain analyse`则可以看到真正执行sql时的执行计划。

对于已经能够确定其性能很慢的sql不建议使用`explain analyze`，除非你想慢慢等它执行完再看到对应的执行计划。
<!--more-->
PostgreSQL的执行计划会显示出这条SQL的预估成本`cost`，需要扫描的数据行数量`rows`，扫描方式（是否使用索引等），循环次数`loops`等。执行计划中会使用缩减符和`->`来表示执行时每一步的先后顺序，缩减最大的就是最早执行的SQL片段。

`cost`就是执行对应的SQL片段时所需要的预估成本，包含启动成本和结束成本。不同的扫描方式其启动成本不一定一样，每一步的cost都会包含上一步的成本。

`width`表示扫描的数据行宽度，`width=0`表示只获取行的位置，没有读取数据；开始读取数据后其值会大于0。

扫描方式常见的有：

* Seq Scan：全表扫描
* Index Scan，Bitmap Index Scan，Bitmap Heap Scan：索引扫描
* Subquery Scan：子查询
* Nested Loop：表连接查询，内表（一般是带索引的大表）被外表（也叫“驱动表”，一般为小表：相对其它表为小表，且记录数的绝对值也较小，不要求有索引）驱动，就是拿小表的数据根据连接条件去大表里进行连接查询
* Hash Join：建立哈希表，由于Hash的特点只能用于等值连接（=），会将表连接的两个表数据放进内存中，需要消耗大量内存
* Merge Join：等值或非等值连接（>，<，>=，<=，但是不包含!=，也即<>），需要对连接表进行排序，在非等值连接时，Merge Join比Hash Join更有效
* Sort：排序
* Unique：DISTINCT，UNION操作
* Limit：LIMIT，OFFSET操作
* Aggregate：count，sum，avg，stddev等聚合函数
* Group：GROUP BY分组操作

通过分析执行计划中的成本，以及扫描方式来决定下一步怎么对SQL进行优化，下面是一些常见的调优方案。

## 优化表连接

主要分为两个方向：

1. 尽量减少连接（外连接或内连接）其他表的次数
2. 优化表连接的条件，尽可能确保连接条件足够充分

以上都是为了尽可能减少中间表的数据量，通过执行计划就可以很明显看到表连接的cost大幅降低。

另外，在能使用inner join时尽量不要使用left join，inner join可以过滤掉不少不必要的数据，从而减少中间表的数据量。

## 使用CTE进行预查询

公用表表达式（Common Table Expression，简称CTE），对于一个很长很复杂的sql，可以用CTE把一部分sql片段预先查询出来，该sql片段查询的结果可以被整个sql所使用。类似于在代码中抽出一个公共的方法逻辑，方便被其他方法所使用。

CTE不仅提高了可读性，还可以非常有效地提高一条复杂长sql的查询效率，多个CTE之间可以用`,`分隔。语法是`with <表名> as ()`，如果被CTE定义的表名被调用两次以上，则优化器会自动将预查询的数据放入一个TEMP表中，如果只被调用一次则不会。

但不是所有数据库都有实现这个功能，PostgreSQL和SQL SERVER都有提供。样例如下：

```sql
with pre as (
    select trim(both '{}' from ch.path) as "preLabelKey",id from cnt_codelist_book_h ch limit 2
), pre2 as (
    select regexp_split_to_table(trim(both '{}' from ch.path), '}[^}]*{') as "pre2LabelKey",id from cnt_codelist_book_h ch limit 2
)
select distinct book.path,pre."preLabelKey",pre2."pre2LabelKey" from cnt_codelist_book_h book
inner join pre on pre.id = book.id
inner join pre2 on pre2.id = book.id;

--查询结果如下：
path	preLabelKey	pre2LabelKey
{lbl.codelist} > {lbl.common.version}	lbl.codelist} > {lbl.common.version	lbl.codelist
{lbl.codelist} > {lbl.common.version}	lbl.codelist} > {lbl.common.version	lbl.common.version
```

注：上述sql中由于别名存在大小写，因此要用双引号包括起来，否则会报错。另外这里仅仅演示语法，因此写的很随意，不喜勿怪。

## 优化索引

这个就不详说了，不外乎对查询条件建立索引，注意使用联合索引时的字段顺序，不过PostgreSQL对于联合索引似乎会自动优化查询时的字段顺序。

## 参考链接

* [详解 PostgreSQL explain 查询计划](https://blog.csdn.net/kmblack1/article/details/80761647)
* [PostgreSQL执行计划的解释](https://blog.csdn.net/ls3648098/article/details/7602136)
* [SQL优化（一） Merge Join vs. Hash Join vs. Nested Loop](http://www.jasongj.com/2015/03/07/Join1/)
* [EXPLAIN分析pgsql的性能](https://www.cnblogs.com/ricklz/p/12777165.html)
* [T-SQL查询进阶--详解公用表表达式(CTE)](https://www.cnblogs.com/CareySon/archive/2011/12/12/2284740.html)
* [使用WITH AS提高性能简化嵌套SQL](https://www.cnblogs.com/fygh/archive/2011/08/31/2160266.html)
