# DBeaver使用汇总

## 前言

公司使用的是 `PostgreSQL` 数据库，可以使用 `pgAdmin `或者 `DBeaver` 进行连接该数据库。个人更喜欢用 `DBeaver`，因为其界面更加美观，操作也相对简单。对于习惯了eclipse的开发者来说，DBeaver绝对是个不错的选择。
<!--more-->

> DBeaver 是一个通用的数据库管理工具和 SQL 客户端，支持 MySQL, PostgreSQL, Oracle, DB2, MSSQL, Sybase, Mimer, HSQLDB, Derby, 以及其他兼容 JDBC 的数据库。
>
> DBeaver 提供一个图形界面用来查看数据库结构、执行 SQL 查询和脚本，浏览和导出数据，处理 BLOB/CLOB 数据，修改数据库结构等等。

## 快捷键hot key

`ctrl + enter` 执行sql

`ctrl + alt + ↑` 向上复制一行

`ctrl + alt + ↓` 向下复制一行

`ctrl + shift + ↑` 向上移动一行

`ctrl + shift + ↓` 向下移动一行

`ctrl + alt + F` 对sql语句进行格式化，对于很长的sql语句很有用

`ctrl + d` 删除当前行

`alt + ↑` 向上选定一条sql语句

`alt + ↓` 向下选定一条sql语句

`ctrl + /` 行注释

`ctrl + shift+ /` 块注释

`ctrl + f` 查找、替换

`ctrl + space` sql提示(如果写了from table后也会自动提示field)

`ctrl + shift + E` 执行计划

`ctrl + shift + U` 将选定的sql转换成大写字母

`ctrl + shift + L` 将选定的sql转换成小写字母

## 使用小技巧

* 有一些快捷键在使用时，只需要将光标移动到某一条sql语句上就行，不需要选定整条完整的语句。
* 有一些快捷键使用时是默认对当前一整个 `Script` 页面生效，可以通过光标来选定只想生效的范围。
* 双击sql语句里的括号边缘，可以直接选定括号内的内容(不包括该括号)，这个功能很方便。
* 双击单引号/双引号的内侧可以直接选定被单引号/双引号包括起来的内容。

## 导出DBeaver的连接配置和脚本文件

DBeaver默认的连接和脚本（Connections和Scripts）都保存在`General`这个project里的`.dbeaver-data-sources.xml`，所有的project被保存在`%{HOME}/.dbeaver4/`目录下，每个project对应一个子目录。也就是说，默认的所有连接和脚本都保存在了`%{HOME}/.dbeaver4/General/.dbeaver-data-sources.xml`里。

`%{HOME}`就是当前用户的目录，即`C:\Users\xxx`。

直接把`.dbeaver-data-sources.xml`拷贝到另一个DBeaver的对应的project目录下即可。如果有多个project，可以在DBeaver里的`Database Navigator`进行切换：选择倒三角图标 -> `Active Project` -> 选择要切换的project，默认是用的General

## MySQL支持多条查询

对于MySQL，默认情况下只能同时查询一条SQL，如果想要支持同时查询多条SQL，需要修改参数：

选定数据库 -> 编辑连接 -> 驱动属性 -> 选择`allowMultiQueries`，把后面的值改成true

## 参考链接

* [dbeaver: how can I export connection configuration?](https://stackoverflow.com/questions/56561439/dbeaver-how-can-i-export-connection-configuration)