# MySQL - 执行sql报错USING BTREE

## 问题与分析

在执行sql文件时发现报错如下：
```
You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ‘USING BTREE....
```
<!--more-->

该错误导致有一个表创建失败，一时间很诧异。因为我所执行的sql语句是由SQLyog导出来的，怎么会有语法错误呢？因为报错里的中文字符变成了乱码，一开始以为是sql语句里的中文字符存在着编码问题，重新修改了好几遍，最后把中文字符去掉了也还是会报同样的错误。

最后百度后才知道，原来这是MySQL的一个bug：MySQL 5.1和MySQL 5.0在处理到索引语句时有所区别，我所执行的sql语句是从高版本的MySQL里导出来的。

当存在UNIQUE KEY的表导出来时，其sql如下：
```sql
UNIQUE KEY `idx_name` (`column_name`) USING BTREE
```

对于该语句，低版本的MySQL是不能识别的，所以就报错了。

## 解决方法

将高版本MySQL导出来的sql语句里的column_name调整到USING BTREE后边就行了，如下：
```sql
UNIQUE KEY `idx_name` USING BTREE (`column_name`)
```

## 参考链接

* [mysql导入数据时提示 USING BTREE 错误解决办法](https://blog.csdn.net/ccfxue/article/details/71118612)


