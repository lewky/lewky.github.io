# PostgreSQL - 模糊查询

## 前言

like、not like在SQL中用于模糊查询，`%`表示任意个字符，`_`表示单个任意字符，如果需要在模糊查询中查询这两个通配符，需要用`ESCAPE`进行转义，如下：

```sql
select * from table where name like '张/_小%' escape '/';
```
<!--more-->
这里表明`/`作为转义符，所以就可以在模糊查询中将通配符作为普通字符来搜索。另外，因为左模糊查询效率低下，一般不推荐在应用中去使用。

除了以上通用的like和not like，在PostgreSQL中还有特殊的操作符用于模糊查询。

## `ilike`和`not ilike`

`ilike`表示在模糊匹配字符串时不区分大小写，`i`即是ignore的意思。

`not ilike`表示不模糊匹配字符串且不区分大小写。

## `~`和`~*`，`!~`和`!~*`

`~`表示匹配正则表达式，且区分大小写。

`~*`表示匹配正则表达式，且不区分大小写。

可以通过这两个操作符来实现like和ilike一样的效果，如下：
```sql
1.匹配以“张”开头的字符串
select * from table where name ~ '^张';

2.匹配以“小”结尾的字符串
select * from table where name ~ '小$';

其实这里的^和$就是正则表达式里的用法。
```

`!~`是`~`的否定用法，表示不匹配正则表达式，且区分大小写。

`!~*`是`~*`的否定用法，表示不匹配正则表达式，且不区分大小写。

## `~~`和`~~*`，`!~~`和`!~~*`

`~~`等效于like，`~~*`等效于ilike。

`!~~`等效于not like，`!~~*`等效于not ilike。

## 参考链接

* [postgresql数据库中~和like和ilike的区别](https://www.cnblogs.com/holden1/p/9978503.html)
* [postgreSQL sql语句中的~~符号是什么意思](https://zhidao.baidu.com/question/500799294.html)