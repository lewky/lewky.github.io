# PostgreSQl - DDL操作汇总

## 重命名数据库

```sql
ALTER DATABASE db_1 RENAME TO db_2;
```

也可以用下面的SQL：
```sql
UPDATE pg_database SET datname = 'db_2' WHERE datname = 'db_1';
```
<!--more-->
注意在重命名数据库的时候，不能在被重命名的数据库里执行以上SQL，也不能有其他用户连接该数据库。

## 参考链接

* [Tips - 重命名PostgreSQL数据库](http://www.blogjava.net/sean/archive/2008/12/17/246942.html)
* [Postgresql10数据库之更改数据库的名称](https://www.pianshen.com/article/5429308927/)