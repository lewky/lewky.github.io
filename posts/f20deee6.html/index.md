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

### N''和::bpchar的区别

N''的效果和::bpchar效果类似，都表示定长字符串。比如下边的sql：

```sql
select N'233' as num;
select '233'::bpchar as num;
select '233' as num;
```

以上sql都会得到'233'的结果集，但是对于前两条sql拿到的字符串是bpchar类型，相当于MySQL的char类型；而第三条sql拿到的字符串是text类型。

* VARCHAR(n)指定了最大长度，变长字符串，不足定义长度的部分不补齐。
* CHAR(n)和bpchar是定长字符串，实际数据不足定义长度时，以空格补齐。
* TEXT没有特别的上限限制（仅受行的最大长度限制）。

`select N'233';`中的`N''`，实际上就是方法二的用法，会将结果转换成bpchar类型。

## 方法三：使用`cast()`函数

这个函数不是PostgreSQL独有的，其他数据库也有类似的用法，在PostgreSQL中用法如下：

```sql
select cast(233 as numeric);
```

cast其实就是转型的意思，该sql将`233`转换成numeric类型并输出到结果集。