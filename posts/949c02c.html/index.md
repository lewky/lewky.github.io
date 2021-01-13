# SQL - where条件里的!=会过滤值为null的数据

## !=会过滤值为null的数据

在测试数据时忽然发现，使用如下的SQL是无法查询到对应column为null的数据的：
```sql
select * from test where name != 'Lewis';
```
<!--more-->

本意是想把表里name的值不为`Lewis`的所有数据都搜索出来，结果发现这样写无法把name的值为null的数据也包括进来。

上面的`!=`换成`<>`也是一样的结果，这可能是因为在数据库里null是一个特殊值，有自己的判断标准，如果想要把null的数据也一起搜索出来，需要额外加上条件，如下：
```sql
select * from test where name != 'Lewis' or name is null;
```

虽然这只是个小知识点，不过还是值得记录注意下，以免日后在开发中犯小错误。

## null值的比较

这里另外说下SQL里null值的比较，任何与null值的比较结果，最后都会变成null，以`PostgreSQL`为例，如下：
```sql
select null != null;
select null = null;
select null > 1;
select null <> 1;
```

以上结果都是null，而不是什么true或者false。另外有些函数是不支持null值作为输入参数的，比如`count()`或者`sum()`等。

## 参考链接

* [Sql 中 不等于''与 NULL](https://blog.csdn.net/qq_36260310/article/details/79697408)
