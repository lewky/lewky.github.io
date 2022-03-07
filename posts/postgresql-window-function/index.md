# PostgreSQL - 开窗函数汇总

## 和聚合函数的区别

开窗函数，也叫窗口函数，一般可以用开窗函数来做一些排行之类的统计操作。开窗函数必须搭配`over()`子句作为查询的条件，否则会报错。over()子句可以用`partition by`进行分组，以及用`order by`排序。

聚合函数是将多条记录聚合为一条；而开窗函数是每条记录都会执行，有几条记录执行完还是几条，聚合函数也可以用于开窗函数中。
<!--more-->
## rank()

对数据进行排名，对于并列的数据会占据之后空余的名次数目，比如第一名有两个数据，即前两条数据排名都为1，第三条数据的名次则为3。

```sql
-- 查询一个商品的版本排行（一个商品在数据库中保存了多条记录，用以版本控制）
-- 这里是按照商品的序号分组，然后同一个分组内用版本号逆序排序
select ref_no,"version",rank() over(partition by ref_no order by "version" desc nulls last) from tb_item where updated_on > '2022-01-01';
```

查询结果如下：

|ref_no|version|rank|
|:-|:-|:-|
|ITM2111-000070|18|1|
|ITM2111-000070|17|2|
|ITM2111-000070|16|3|
|ITM2111-000072|10|1|

```sql
-- 不分组，直接按照所有商品的版本号逆序排序（其实就相当于按版本号分组）
select ref_no,"version",rank() over(order by "version" desc nulls last) from tb_item where updated_on > '2022-01-01';
```

查询结果如下：

|ref_no|version|rank|
|:-|:-|:-|
|ITM2112-000015|23|1|
|ITM2111-000089|23|1|
|ITM2111-000070|18|3|
|ITM2112-000091|11|4|
|ITM2203-000002|11|4|
|ITM2201-000014|11|4|
|ITM2201-000060|10|7|

## dense_rank()

dense是稠密的意思，因此这个函数效果很rank()差不多，区别在于它不会空出所占的名次，比如第一名有两个数据，即前两条数据排名都为1，第三条数据的名次则为2。

```sql
-- 不分组，直接按照所有商品的版本号逆序排序（其实就相当于按版本号分组）
select ref_no,"version",dense_rank() over(order by "version" desc nulls last) from tb_item where updated_on > '2022-01-01';
```

查询结果如下：

|ref_no|version|dense_rank|
|:-|:-|:-|
|ITM2112-000015|23|1|
|ITM2111-000089|23|1|
|ITM2111-000070|18|2|
|ITM2112-000091|11|3|
|ITM2203-000002|11|3|
|ITM2201-000014|11|3|
|ITM2201-000060|10|4|

## row_number()

单纯按照行数排行，不会考虑并列行。

```sql
-- 不分组，直接按照所有商品的版本号逆序排序（其实就相当于按版本号分组）
select ref_no,"version",row_number() over(order by "version" desc nulls last) from tb_item where updated_on > '2022-01-01';
```

查询结果如下：

|ref_no|version|row_number|
|:-|:-|:-|
|ITM2112-000015|23|1|
|ITM2111-000089|23|2|
|ITM2111-000070|18|3|
|ITM2112-000091|11|4|
|ITM2203-000002|11|5|
|ITM2201-000014|11|6|
|ITM2201-000060|10|7|

## 参考链接

* [rank() over,dense_rank() over,row_number() over的区别](https://weihubeats.blog.csdn.net/article/details/102502031)