# PostgreSQL问题汇总

## 修改默认端口号

PostgreSQL默认使用5432端口号，如果要连接其他端口号，必须通过`-p`参数来指定端口号。

如果不想指定端口号就能连接数据库，则需要修改默认端口号。首先将PostgreSQL的server服务关闭，这个要在系统的服务管理器中将其关闭：

* win + R快捷键打开运行；
* 输入`services.msc`打开服务管理器；
* 找到运行中的PostgreSQL的server服务将其关闭。

<!--more-->
在PostgreSQL的安装路径下，找到对应版本的postgresql.conf文件（在data文件夹内）：

* 修改`port = 5432`；
* 保存修改，重启该版本的server服务，即可生效。

## pgAdmin4远程连接数据库

PostgreSQL在安装的时候自带的pgAdmin这个可视化工具，自从将PostgreSQL9升级到了10版本后，自带的pgAdmin也从3升级到了4版本。pgAdmin4的变化非常巨大，这里记录下怎么用pgAdmin4进行远程连接数据库并执行SQL语句。

### 操作步骤

1. 选中Browser窗口里的Servers -> 点击上方工具栏里的Object -> Create -> Server...
2. 在弹窗的General tab里填写Name，可以随意命名
3. 接着选择第二个tab：Connection，填写Host的ip地址、端口号、数据库名、用户名、密码，点击save保存

### 执行SQL语句

在配置好上边的server后，连接该server，接着连接server下的某个Database，连接成功后可以通过以下方式来执行SQL：

1. 点击上方工具栏里的Tools -> Query Tool
2. 输入SQL
3. 选定某条SQL语句，点击Query Tool里的闪电标志的按钮，就可以执行改SQL语句

虽然pgAdmin4比起3的ui好看了很多，在restore db的时候也变成了后台异步restore，不至于在restore比较大的db时阻塞住进程。但个人还是更喜欢另一款可视化工具DBeaver，不仅支持市面上各大常见的数据库，还有很多好用的功能和快捷键，真的非常好用！！强烈推荐！！

## 设置远程访问数据库

安装PostgreSQL数据库之后，默认是只接受本地访问连接。如果想在其他主机上访问PostgreSQL数据库服务器，就需要进行相应的配置，需要修改data目录下的`pg_hba.conf`和`postgresql.conf`。

`pg_hba.conf`配置对数据库的访问权限，`postgresql.conf`配置PostgreSQL数据库服务器的相应的参数。


### 修改pg_hba.conf文件

配置用户的访问权限（#开头的行是注释内容）

```html
# TYPE DATABASE  USER    CIDR-ADDRESS     METHOD

# "local" is for Unix domain socket connections only
local all    all               trust
# IPv4 local connections:
host  all    all    127.0.0.1/32     trust
host  all    all    192.168.1.0/24    md5
# IPv6 local connections:
host  all    all    ::1/128       trust
```

上边的第7行是新添加的内容，表示允许网段192.168.1.0上的所有主机使用所有合法的数据库用户名访问数据库，并提供加密的密码验证。

其中，数字24是子网掩码，表示允许192.168.1.0 ~ 192.168.1.255的计算机访问。

### 修改postgresql.conf文件

将数据库服务器的监听模式修改为监听所有主机发出的连接请求：

定位到`#listen_addresses='localhost'`，PostgreSQL安装完成后，默认是只接受来在本机localhost的连接请求。

将行开头的#去掉，将行内容修改为`listen_addresses='*'`来允许数据库服务器监听来自任何主机的连接请求。

## invalid input syntax for type timestamp with time zone

在执行以下sql时报错：

```sql
select COALESCE(null,null,now(),'');
```

报错如下：

```
SQL Error [22007]: ERROR: invalid input syntax for type timestamp with time zone: ""
Position: 33
org.postgresql.util.PSQLException: ERROR: invalid input syntax for type timestamp with time zone: ""
Position: 33
```

由于`coalesce()`要求输入参数是null或字符串，而`now()`返回的结果是带有时区的时间戳，所以就会报错；需要把时间戳转换成字符串才可以：

```sql
select COALESCE(null,null,now()||'',''); 

select COALESCE(null,null,now()::varchar,'');
```

## 怎么转义字符

### 使用E和反斜杠进行转义

在PostgreSQL 9之前的版本中，可以直接使用反斜杠`\`进行转义；比如：\b表示退格，\n表示换行，\t表示水平制表符，\r标示回车，\f表示换页。除此之外还支持\digits和\xhexdigits，分别表示转义八进制和十六进制数据。

但是在PostgreSQL 9之后的版本，反斜杠已经变成了普通字符；如果想要使用反斜杠来转义字符，就必须在需要转义的字符串前面加上E（E就是Escape），如下：

```sql
select E'张\t小明';
```

### 直接用一个单引号来转义单引号

在SQL标准中字符串是用单引号括起来的，而在PostgreSQL中遵守了该标准，双引号则是用来表示变量的，如果在字符串中需要使用到单引号，就需要对其进行转义。

除了使用E和反斜杠进行转义单引号外：

```sql
select E'\'233';
```

还可以直接用一个单引号来转义单引号：

```sql
select '''233';
```

这两种方式都能得到`'233`的结果而不会报错，第二种方式比较简单，也可以通过修改`standard_conforming_strings`参数的值来让反斜杠从普通字符变回转义字符：

查询并修改该参数的值：

```sql
show standard_conforming_strings;
SET standard_conforming_strings = on;
SET standard_conforming_strings = off;
```

当该参数的值为off时就可以直接使用反斜杠作为转义字符里，如下：

```sql
select '\'233';
```

将会得到`'233`的结果而不会报错。

## 如何杀掉被锁死的进程

### 杀掉指定进程

PostgreSQL提供了两个函数：`pg_cancel_backend()`和`pg_terminate_backend()`，这两个函数的输入参数是进程PID，假定现在要杀死进程PID为20407的进程，使用方法如下：

```sql
select pg_cancel_backend(20407);

--或者执行这个函数也可以：
select pg_terminate_backend(20407);
```

这两个函数区别如下：

`pg_cancel_backend()`

1. 只能关闭当前用户下的后台进程
2. 向后台发送SIGINT信号，用于关闭事务，此时session还在，并且事务回滚

`pg_terminate_backend()`

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

### 杀掉指定表指定锁的进程

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

另外需要注意的是，`pg_terminate_backend()`会把session也关闭，此时sessionId会失效，可能会导致系统账号退出登录，需要清除掉浏览器的缓存cookie（我们系统遇到的情况是这样的）。

## 参考链接

* [pgadmin4远程连接 postgresql服务](https://blog.csdn.net/s630730701/article/details/80870206)
* [PostgreSQL 允许远程访问设置方法](https://blog.csdn.net/ll136078/article/details/12747403)
* [postgresql字符转义](https://blog.csdn.net/hatofdragon/article/details/54601121)
* [pg_cancel_backend与pg_terminate_backend函数的区别](https://www.liangzl.com/get-article-detail-16499.html)
* [pg_cancel_backend()和pg_terminate_backend()](https://blog.csdn.net/lt89102476/article/details/84759743)