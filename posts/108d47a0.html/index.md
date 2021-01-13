# PostgreSQL - 用psql 运行SQL文件

对于预先写好的SQL文件，比如`/home/user1/updateMyData.sql`， 可以有两种方式来运行这个SQL文件。

## 方式一：连接db后执行SQL文件

首先通过psql连接到对应的db：

```psql
psql -d db1 -U userA
```
<!--more-->

接着输入密码，进入数据库后，输入：

```psql
\i /pathA/xxx.sql
```

这里有个问题，如果你把SQL文件的路径里的路径分隔符写成了`\`，会报错说`Permission denied`。

这里的文件路径必须使用Linux平台下的路径分隔符`/`，否则会报错。

## 方式二：直接通过psql命令执行SQL文件

这种方式无需先登录数据库，直接用一个命令就可以了：

```psql
psql -d db1 -U userA -f /pathA/xxx.sql
```

接着输入密码即可执行SQL文件到对应的db里。

## 参考链接

* [psql执行文件时出现Permission denied](https://bbs.csdn.net/topics/390302450)
