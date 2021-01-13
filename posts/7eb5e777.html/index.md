# PostgreSQL - psql的使用与退出

## PostgreSQL连接数据库的两种方式

PostgreSQL在安装时自带了`pgAdmin`和`psql`，`pgAdmin`是可视化工具，`psql`是命令行工具。

虽然pgAdmin操作起来会更加直观简单，但是在restore和backup db的时候，效率和性能会比较低下，如果db过于庞大，还会导致pgAdmin内存溢出。

推荐使用psql来连接数据库进行备份和恢复db，同样大小的db，使用psql来restore会比pgAdmin快上数倍！
<!--more-->

## psql连接数据库

### 直接连接到指定的数据库

```cmd
psql -h <dbserver_IP> -p<dbserver_port> -d <database_Name> -U <db user>
```
如果host是localhost，可以不指定该参数，当不指定端口号时会使用默认的端口号`5432`，或者你可以通过`-p`来指定其他端口号。

比如你想连接本地的db：`test:5432`，用户名是`postgres`，可以使用如下的命令：
```cmd
psql -d test -U postgres
```

如果有密码的话会提示你输入密码，连接数据库后就可以直接通过sql语句来进行相关的操作了。

### 先登陆psql控制台，再连接指定的数据库

psql命令也可以不指定某个数据库，如下：
```cmd
psql -h <dbserver_IP> -p<dbserver_port> -U <db user>
```

这时候登陆成功后会进入psql的命令台，此时可以跑一些数据库备份、创建数据库或者连接数据库之类的操作。

在psql的命令台输入`\c <database_Name>`，接着按下回车键，即可连接到对应的数据库，如下：
```cmd
postgres=# \c cbx6_dev
WARNING: Console code page (437) differs from Windows code page (1252)
         8-bit characters might not work correctly. See psql reference
         page "Notes for Windows users" for details.
You are now connected to database "cbx6_dev" as user "postgres".
cbx6_dev=#
```

## 怎么切换到不同的数据库

如果已经连接到一个数据库了，这时候想切换到另一个数据库怎么办？很简单，还是跑这个`\c`的命令即可。

## 退出psql控制台

和其他的命令行工具不一样，psql在退出时并不是使用`exit`，而是使用`\q`，接着按下回车就行了，这里的q指的就是quit。

## 参考链接

* [PostgreSQL 教程](https://www.runoob.com/postgresql/postgresql-tutorial.html)
