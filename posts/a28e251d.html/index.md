# Windows下MySQL8.0.13解压版安装教程

## 下载

[MySQL8.0.13-64位下载地址](https://dev.mysql.com/downloads/mysql/)

在下载页面的底部，有三种安装包，第一种是MySQL的安装程序，下载完点击安装即可。
第二种是普通的压缩版，体积较小。
第三种是自带debug和测试的压缩版，体积较大。这种压缩包在网上暂时没有找到对应的安装文档说明，所以建议下载第二种压缩包，也就是普通版本的MySQL压缩包。
<!--more-->

## 配置环境变量

新建环境变量如下：

* 变量名：`MYSQL_HOME`
* 变量值：`D:\software\mysql-8.0.13-winx64`（这里填写MySQL的安装路径）

在path变量的变量值末尾加上：`;%MYSQL_HOME%\bin`
如果是win10那种将一个变量的变量值分成一行行来填写的，则不需要加上英文分号。

## 生成data文件

打开cmd窗口，切换到`%MYSQL_HOME%/bin`下，输入命令：
```cmd
mysqld --initialize-insecure --user=mysql
```

接着等待命令执行完毕。这里需要注意的是，如果不是下载的普通版本的压缩包(体积较小那个)，会提示你找不到mysqld命令。

## 启动MySQL服务

输入命令：
```cmd
net start mysql
```

如果执行报错如下：
```cmd
D:\software\mysql-8.0.13-winx64>net start mysql
服务名无效。

请键入 NET HELPMSG 2185 以获得更多的帮助。
```

需要先执行以下命令：
```cmd
mysqld -install
```

此时得到执行结果如下：
```cmd
D:\software\mysql-8.0.13-winx64>mysqld -install
Service successfully installed.
```

接着再次启动MySQL服务，得以成功：
```cmd
D:\software\mysql-8.0.13-winx64>net start mysql
MySQL 服务正在启动 ....
MySQL 服务已经启动成功。
```

## 登录MySQL

执行命令：
```cmd
mysql -u root -p
```

此时会提示输入密码，由于初次登录MySQL，无需输入密码，所以直接回车即可，登录成功结果如下：
```cmd
D:\software\mysql-8.0.13-winx64>mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.13 MySQL Community Server - GPL

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

## 查询用户密码

执行命令如下：
```cmd
select host,user,authentication_string from mysql.user;
```

结果如下：
```cmd
mysql> select host,user,authentication_string from mysql.user;
+-----------+------------------+------------------------------------------------------------------------+
| host      | user             | authentication_string                                                  |
+-----------+------------------+------------------------------------------------------------------------+
| localhost | mysql.infoschema | $A$005$THISISACOMBINATIONOFINVALIDSALTANDPASSWORDTHATMUSTNEVERBRBEUSED |
| localhost | mysql.session    | $A$005$THISISACOMBINATIONOFINVALIDSALTANDPASSWORDTHATMUSTNEVERBRBEUSED |
| localhost | mysql.sys        | $A$005$THISISACOMBINATIONOFINVALIDSALTANDPASSWORDTHATMUSTNEVERBRBEUSED |
| localhost | root             |                                                                        |
+-----------+------------------+------------------------------------------------------------------------+
4 rows in set (0.00 sec)

mysql>
```

可以看到，root用户的密码是空的。

## 修改root用户的密码

执行命令：
```cmd
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
```

这里的密码就随意填写，不建议使用过于简单的`123456`、`root`、`admin`之类的密码。
该命令执行完毕会得到结果：
```cmd
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
Query OK, 0 rows affected (0.11 sec)
```

接着需要继续执行命令：
```cmd
flush privileges;
```

该命令作用是刷新MySQL的系统权限相关表，这样才能使刚刚的密码修改成功。

每次MySQL新设置用户或更改密码后都需要用`flush privileges;`来刷新MySQL的系统权限相关表，否则会出现拒绝访问。
还有一种方法，就是重新启动MySQL服务，来使新设置生效。

## 退出登录

输入命令：
```cmd
quit
```

结果如下：
```cmd
mysql> quit
Bye

D:\software\mysql-8.0.13-winx64>
```

## 参考链接

* [WINDOWS下安装MYSQL8.0.13解压版—图文详解](https://blog.csdn.net/tao10180/article/details/83781842#commentBox)
* [flush privileges 什么意思](https://www.cnblogs.com/zcy_soft/archive/2011/02/10/1950859.html)
