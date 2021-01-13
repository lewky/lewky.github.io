# Redis - Windows平台下怎么切换db并且清理数据

Redis 本身支持16个数据库(0~15)，通过 数据库id 设置，默认为0。在Windows平台下可以通过启动`redis-cli.exe`来进入客户端，客户端默认连接数据库0，在客户端里可以输入各种命令。

## 增加db数量

可以通过修改配置来增加Redis的db数量。在Windows平台下，打开redis.windows.conf，找到`databases 16`并修改即可。
<!--more-->

## 切换db

通过命令来切换当前的db：`select 0`，该命令表示切换到第一个数据库。数据库id是从0到15，可以自由切换db，每个db的存储空间是不一样的。

当切换db成功时，可以看到当前是使用的哪一个db：
```
127.0.0.1:6379> SELECT 2
OK
127.0.0.1:6379[2]>
```

## 清理当前db数据

```
flushdb
```
该命令只会清理当前db的数据，不会影响到其他db。

## 清理所有db数据

```
flushall
```
该命令会将当前的Redis实例的所有数据都清理掉，慎用！

## 参考链接

* [redis 中如何切换db](https://www.cnblogs.com/oxspirt/p/6529791.html)