# PostgreSQL - 如何杀死被锁死的进程

## 前言

在一次系统迭代后用户投诉说无法成功登陆系统，经过测试重现和日志定位，最后发现是由于用户在ui上进行了某些操作后，触发了堆栈溢出异常，导致数据库里的用户登陆信息表的数据被锁住，无法释放。这个表里存放的是用户的session信息。

虽然后来解决了问题，但是数据库里这个用户登录信息表里被lock住的数据始终无法释放，这导致用户永远无法登陆成功，需要手动跑SQL把锁去掉才行。
<!--more-->

## 杀掉指定进程

PostgreSQL提供了两个函数：`pg_cancel_backend()`和`pg_terminate_backend()`，这两个函数的输入参数是进程PID，假定现在要杀死进程PID为20407的进程，使用方法如下：

```sql
select pg_cancel_backend(20407);

--或者执行这个函数也可以：
select pg_terminate_backend(20407);
```

这两个函数区别如下：

### `pg_cancel_backend()`

1. 只能关闭当前用户下的后台进程
2. 向后台发送SIGINT信号，用于关闭事务，此时session还在，并且事务回滚

### `pg_terminate_backend()`

1. 需要superuser权限，可以关闭所有的后台进程
2. 向后台发送SIGTERM信号，用于关闭事务，此时session也会被关闭，并且事务回滚

那么如何知道有哪些表、哪些进程被锁住了？可以用如下SQL查出来：
```sql
select * from pg_locks a
join pg_class b on a.relation = b.oid
join pg_stat_activity c on a.pid = c.pid
where a.mode like '%ExclusiveLock%';
```
这里查的是排它锁，也可以精确到行排它锁或者共享锁之类的。这里有几个重要的column：`a.pid`是进程id，`b.relname`是表名、约束名或者索引名，`a.mode`是锁类型。

## 杀掉指定表指定锁的进程

```sql
select pg_cancel_backend(a.pid) from pg_locks a
join pg_class b on a.relation = b.oid
join pg_stat_activity c on a.pid = c.pid
where b.relname ilike '表名' 
and a.mode like '%ExclusiveLock%';

--或者使用更加霸道的pg_terminate_backend()：
select pg_terminate_backend(a.pid) from pg_locks a
join pg_class b on a.relation = b.oid
join pg_stat_activity c on a.pid = c.pid
where b.relname ilike '表名' 
and a.mode like '%ExclusiveLock%';
```

另外需要注意的是，`pg_terminate_backend()`会把session也关闭，此时sessionId会失效，可能会导致系统账号退出登录，需要清除掉浏览器的缓存cookie（至少我们系统遇到的情况是这样的）。

## 参考链接

* [pg_cancel_backend与pg_terminate_backend函数的区别](https://www.liangzl.com/get-article-detail-16499.html)
* [pg_cancel_backend()和pg_terminate_backend()](https://blog.csdn.net/lt89102476/article/details/84759743)
