# PostgreSQL - psql使用汇总

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

## psql自动输入密码

### 方式一：设置环境变量PGPASSWORD

如下：
```
#linux
export PGPASSWORD=12345

#windows
set PGPASSWORD=12345
```

### 方式二：使用密码文件`.pgpass`

在`~/`目录下创建隐藏文件`.pgpass`，`~/`目录也就是当前用户的用户目录。在密码文件中填写`hostname:port:database:username:password`的内容，如下：
```
localhost:5432:db1:admin:admin
localhost:5432:db2:admin:admin
localhost:5432:db3:admin:admin
```

然后需要配置一个环境变量`PGPASSFILE`，指向`.pgpass`密码文件的路径：
```
set PGPASSFILE=C:\Users\xxx\.pgpass
```

这种方法的好处是可以同时定义多个不同主机上的数据库账号密码。

### 方式三：修改服务端配置文件`pg_hba.conf`

打开PostgreSQL安装目录下的`\data\pg_hba.conf`，将其中的连接对应的`md5`改为`trust`，然后重启服务。如下：
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# IPv4 local connections:
host    all             all             127.0.0.1/32            md5 <= 改为trust
host    all             all             172.20.1.0/24           md5
host    all             all             172.168.199.0/24        md5
```

## psql运行SQL文件

### 方式一：连接db后执行SQL文件

首先通过psql连接到对应的db：

```psql
psql -d db1 -U userA
```

接着输入密码，进入数据库后，输入：

```psql
\i /pathA/xxx.sql
```

这里有个问题，如果你把SQL文件的路径里的路径分隔符写成了`\`，会报错说`Permission denied`。

这里的文件路径必须使用Linux平台下的路径分隔符`/`，否则会报错。

### 方式二：直接通过psql命令执行SQL文件

这种方式无需先登录数据库，直接用一个命令就可以了：

```psql
psql -d db1 -U userA -f /pathA/xxx.sql
```

接着输入密码即可执行SQL文件到对应的db里。

**小技巧：可以直接把sql文件拖到cmd窗口里，会自动把该sql文件的所在路径给输入到命令行中。**

## 参考链接

* [PostgreSQL 教程](https://www.runoob.com/postgresql/postgresql-tutorial.html)
* [在脚本中调用psql如何自动输入密码](https://blog.csdn.net/fm0517/article/details/53130244)
* [psql执行文件时出现Permission denied](https://bbs.csdn.net/topics/390302450)