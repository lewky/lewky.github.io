# SQL - on和where的区别

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

4、在内连接和交叉连接中，单独使用on和where对结果集没有区别。比如：
```sql
select* from test1 inner join test2 on test1.id = test2.id;
select* from test1 inner join test2 where test1.id = test2.id;
```

## 附

以上语句都是在MySQL5.0的情况下测试的。
