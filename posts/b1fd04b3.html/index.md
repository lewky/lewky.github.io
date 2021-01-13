# PostgreSQL - invalid input syntax for type timestamp with time zone

## 问题

在执行以下sql时报错：
```sql
select COALESCE(null,null,now(),'');
```
<!--more-->

报错如下：
```
SQL Error [22007]: ERROR: invalid input syntax for type timestamp with time zone: ""
Position: 33
org.postgresql.util.PSQLException: ERROR: invalid input syntax for type timestamp with time zone: ""
Position: 33
```

## 解决方法

由于`coalesce()`要求输入参数是null或字符串，而`now()`返回的结果是带有时区的时间戳，所以就会报错；需要把时间戳转换成字符串才可以，如下所示：

```sql
select COALESCE(null,null,now()||'',''); 

select COALESCE(null,null,now()::varchar,'');
```
