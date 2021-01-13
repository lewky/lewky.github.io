# PostgreSQL - pgAdmin4远程连接数据库

## 前言

PostgreSQL在安装的时候自带的pgAdmin这个可视化工具，自从将PostgreSQL9升级到了10版本后，自带的pgAdmin也从3升级到了4版本。pgAdmin4的变化非常巨大，刚接触时一脸懵逼，这里记录下怎么用pgAdmin4进行远程连接数据库并执行SQL语句。
<!--more-->

## 操作步骤

1. 选中Browser窗口里的Servers -> 点击上方工具栏里的Object -> Create -> Server...
2. 在弹窗的General tab里填写Name，可以随意命名
3. 接着选择第二个tab：Connection，填写Host的ip地址、端口号、数据库名、用户名、密码，点击save保存

## 执行SQL语句

在配置好上边的server后，连接该server，接着连接server下的某个Database，连接成功后可以通过以下方式来执行SQL：

1. 点击上方工具栏里的Tools -> Query Tool
2. 输入SQL
3. 选定某条SQL语句，点击Query Tool里的闪电标志的按钮，就可以执行改SQL语句

PS:
虽然pgAdmin4比起3的ui好看了很多，在restore db的时候也变成了后台异步restore，不至于在restore比较大的db时阻塞住进程。但个人还是更喜欢另一款可视化工具DBeaver，不仅支持市面上各大常见的数据库，还有很多好用的功能和快捷键，真的非常好用！！强烈推荐！！

## 参考链接

1. [pgadmin4远程连接 postgresql服务](https://blog.csdn.net/s630730701/article/details/80870206)