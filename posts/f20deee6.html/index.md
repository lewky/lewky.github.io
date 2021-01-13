# PostgreSQL - 怎么转换数据类型

## 前言

对于`select 233;`这个sql，得到的结果是`int4`类型，如果我们希望将结果转换成其他的数据类型，有以下方法(下边的`{数据类型}`表示占位符，要替换成数据库中的某一种数据类型)：

## 方法一：使用`::{数据类型}`

<!--more-->
```sql
select 233::text;
```
上边的sql通过`::text`将结果转换成了`text`类型。

## 方法二：使用`{数据类型}''`

```sql
select text '233';
select text'233';
```

上边的sql通过`text''`将结果转换成了`text`类型。这里的两种写法是一样的，加不加空格没有影响。

另外提一句，对于`select N'233';`这个句子中的`N''`，会将结果转换成bpchar类型。

## 方法三：使用`cast()`函数

这个函数不是PostgreSQL独有的，其他数据库也有类似的用法，在PostgreSQL中用法如下：
```sql
select cast(233 as numeric);
```

cast其实就是转型的意思，该sql将`233`转换成numeric类型并输出到结果集。