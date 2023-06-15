# MySQL问题汇总

## 指定字符集编码

需要在数据库连接中指定两个参数：`useUnicode=true&characterEncoding=UTF-8`，只有当设置了`useUnicode=true`时，后续指定的字符集编码才有效。

## MySQL 5.6别名默认不生效问题

在数据库连接中指定参数：`useOldAliasMetadataBehavior=true`。
<!--more-->
## MySQL 8的数据库连接问题

MySQL 8在连接数据库时与5.x版本有较大变化，需要注意如下的一些问题。

### 驱动包路径变更

MySQL 8的驱动包路径变更为`com.mysql.cj.jdbc.Driver`，如果使用旧版本的驱动包路径会报错：

```
Loading class `com.mysql.jdbc.Driver'. This is deprecated. The new driver class is `com.mysql.cj.jdbc.Driver'. The driver is automatically registered via the SPI and manual loading of the driver class is generally unnecessary.
```

### SSL连接问题

与SSL连接有关，使用SSL连接需要提供服务器证书。如果不在数据库连接中加入`useSSL=false`的参数，会报错：

```
Establishing SSL connection without server's identity verification is not recommended. According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.
```

### 时区问题

这是数据库和系统时区不同造成的，需要在数据库连接中指定对应的时区。通常国内都是东八区，如果不在数据库连接中加入`serverTimezone=GMT%2B8&amp;`的参数，会报错：

```
java.sql.SQLException: The server time zone value '???ú±ê×??±??' is unrecognized or represents more than one time zone.
```

这里的`GMT%2B8&amp;`是指的`GMT+8`，即东八区，这里的`+`在URL编码中要转换为`%2B`，否则不会生效。

## 执行sql报错USING BTREE

在执行sql文件时发现报错如下：

```
You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ‘USING BTREE....
```

这是MySQL的一个bug：

MySQL 5.1和MySQL 5.0在处理到索引语句时有所区别，我所执行的sql语句是从高版本的MySQL里导出来的。

当存在UNIQUE KEY的表导出来时，其sql如下：

```sql
UNIQUE KEY `idx_name` (`column_name`) USING BTREE
```

对于该语句，低版本的MySQL是不能识别的，所以就报错了。

解决方法是将高版本MySQL导出来的sql语句里的column_name调整到USING BTREE后边就行了，如下：

```sql
UNIQUE KEY `idx_name` USING BTREE (`column_name`)
```

## MySQL终止正在执行的SQL语句

`show full processlist`可以查询到MySQL正在执行的SQL语句，找到其中想要终止的慢SQL的id，通过`kill`终止：

```
--终止id为3222162404的SQL语句
kill 3222162404
```

## 参考链接

* [Mysql JDBC Url参数说明useUnicode=true&characterEncoding=UTF-8](https://www.cnblogs.com/mracale/p/5842572.html)
* [https://blog.csdn.net/m0_37520980/article/details/80364884](https://blog.csdn.net/m0_37520980/article/details/80364884)
* [mysql导入数据时提示 USING BTREE 错误解决办法](https://blog.csdn.net/ccfxue/article/details/71118612)
* [查询及停止MySQL正在执行的SQL语句](https://blog.csdn.net/weixin_47766381/article/details/121542788)