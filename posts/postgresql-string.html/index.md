# PostgreSQL - 字符串函数汇总

## 前言

本文基于`PostgreSQL 12.6`版本，不同版本的函数可能存在差异。

## 拼接字符串

`||`是字符串连接操作符，在拼接字符串时要求前两个操作数至少有一个是字符串类型，不然会报错。如下：
```sql
select 'a' || 1;
select 2 || 'a' || 1;
select 2 || 44 || 'a' || 1; --Error
```

<!--more-->
## 填充字符串

`lpad(string text, length int [, fill text])`是在字符串左边填充字符，如果不指定要填充的字符，则默认填充空格，如下：
```sql
select LPAD((99 - 1)::text, 6); -- 98
select LPAD((99 - 1)::text, 6, '0'); --000098
select LPAD((99 + 1)::text, 6, 'ab'); --aba100
```

`rpad`函数与`lpad`函数相反，是在字符串右边填充字符。

## 大小写转换

`upper`和`lower`函数，如下：
```sql
select upper('test'); --TEST
select lower('TEST'); --test
```

## 获取字符串长度

`length`、`char_length`和`character_length`函数，如下：
```sql
select length('test'); --4
select char_length('test'); --4
select character_length('test'); --4
```

## 截取字符串

`substring`函数，支持下标范围截取或者正则表达式截取，如下：
```sql
select substring('PostgreSQL' from 2 for 4); --ostg
select substring('PostgreSQL' from '[a-z]+'); --ostgre
```

也可以用`substr`函数，如下：
```sql
select substr('PostgreSQL', 2, 0); --空字符串
select substr('PostgreSQL', 2, 1); --o
select substr('PostgreSQL', 2, 4); --ostg
select substr('PostgreSQL', 2); --ostgreSQL
```

## 裁剪字符串

`trim`函数，从字符串的开头/结尾/两边（leading/trailing/both）尽可能多地裁剪指定的字符，不指定则裁剪空白符，如下：
```sql
select trim(leading 'x' from 'xTestxx'); --Testxx
select trim(trailing 'x' from 'xTestxx'); --xTest
select trim(both 'x' from 'xTestxx'); --Test

select trim(both from ' Test '); --Test
select trim(' Test '); --Test
```

也可以用`ltrim`，`rtrim`或者`btrim`函数，效果同上：
```sql
select ltrim('xTestxxy', 'xy'); --Testxxy
select rtrim('xTestxxy', 'xy'); --xTest
select btrim('xTestxxy', 'xy'); --Test
```

## 获取第一个字符的ASCII码

`ascii`函数，如下：
```sql
select ascii('test'); --116
select ascii('t'); --116
```

如果想从ASCII码转成字符，则使用`chr`函数，参数是int，如下：
```sql
select chr(65); --A
```

## 计算string的MD5散列

`md5`函数，以十六进制返回结果，如下：
```sql
select md5('abc'); --900150983cd24fb0d6963f7d28e17f72
```

## null和''的区别与判断以及COALESCE函数

null是一种类型，`''`是空字符串，打个比方，`''`是你参加了考试且得了零分，而null则是你压根就没有参加考试。

如果要在sql中对两者进行判断，是有区别的：

```sql
--null只能和is或is not搭配，不能使用=、!=或者<>
select * from student where name is null;
select * from student where name is not null;

--''的判断可以使用=、!=或者<>
select * from student where name = '';
select * from student where name != '';
select * from student where name <> '';

--任何与null的运算比较，结果都是null
select 1 > null;  --null
```

COALESCE函数是返回参数中的第一个非null的值，在`PostgreSQL 10`里，它要求参数中至少有一个是非null的，如果参数都是null会报错。

不过在`PostgreSQL 12.6`版本COALESCE函数允许参数里只有null，此时返回值是null。

```sql
select COALESCE(null,null); //报错
select COALESCE(null,null,now()::varchar,''); //结果会得到当前的时间
select COALESCE(null,null,'',now()::varchar); //结果会得到''

//可以和其他函数配合来实现一些复杂点的功能：查询学生姓名，如果学生名字为null或''则显示“姓名为空”
select case when coalesce(name,'') = '' then '姓名为空' else name end from student;
```

## nullif函数

`nullif(a, b)`用来检测a参数是否与b参数相等，这里的a、b参数必须是同一种数据类型，否则会报错。当a参数与b参数相等时会返回null，否则返回a参数。

可以用这个函数来检测期望以外的值，一般用于检测字符串比较多。如下：
```sql
select nullif('test', 'unexpected');		--test
select nullif('unexpected', 'unexpected');	--null

select nullif(233, 111);		--233
```

## 判断是否包含字符串

`position`函数会返回字符串首次出现的位置，如果没有出现则返回0。因此可以通过返回值是否大于0来判断是否包含指定的字符串。

```sql
select position('aa' in 'abcd');	--0
select position('bc' in 'abcd');	--2
select position('bc' in 'abcdabc');	--2
```

`strpos`函数也是同样的效果：

```sql
select strpos('abcd','aa');		--0
select strpos('abcd','bc');		--2
select strpos('abcdabc','bc');	--2
```

此外还可以用正则表达式来判断，返回值是true或false：

```sql
select 'abcd' ~ 'aa';		--false
select 'abcd' ~ 'bc';		--true
select 'abcdabc' ~ 'bc';	--true
```

## 合并字符串

`string_agg`函数可以将一个字符串列合并成一个字符串，该函数需要指定分隔符，还可以指定合并时的顺序，或者是对合并列进行去重：

```sql
select ref_no from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--结果如下：
--ITM2105-000001
--ITM2105-000002
--ITM2105-000003
--ITM2105-000003

select string_agg(ref_no, ',') from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--合并结果：ITM2105-000001,ITM2105-000002,ITM2105-000003,ITM2105-000003

select string_agg(distinct ref_no, ',') from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--合并结果：ITM2105-000001,ITM2105-000002,ITM2105-000003

select string_agg(distinct ref_no, ',' order by ref_no desc) from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--合并结果：ITM2105-000003,ITM2105-000002,ITM2105-000001
```

## 将字符串合并成一个数组

`array_agg`和`string_agg`函数类似，但会把一个字符串列合并成一个数组对象，同样支持指定合并顺序和去重操作；合并成数组后意味着你可以像数组那样去读取它，**需要注意的是，数据库的数组下标是从1开始的**，而不是从0开始：

```sql
select array_agg(distinct ref_no) from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--合并结果：{ITM2105-000001,ITM2105-000002,ITM2105-000003}

select (array_agg(distinct ref_no order by ref_no desc))[1] from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--结果：ITM2105-000003
```

该函数还可以搭配`array_to_string`函数将数组转合并成一个字符串：

```sql
select array_to_string(array_agg(distinct ref_no), '&') from cnt_item where updated_on between '2021-05-05' and '2021-05-30 16:13:25';
--合并结果：ITM2105-000001&ITM2105-000002&ITM2105-000003
```

## 分割字符串

`string_to_array`函数可以分割字符串，返回值是一个数组：

```sql
select string_to_array('ITM2105-000001&ITM2105-000002&ITM2105-000003', '&');
--结果：{ITM2105-000001,ITM2105-000002,ITM2105-000003}
```

## 使用正则表达式分割字符串

`regexp_split_to_table`可以通过正则表达式来定义分隔符，将一个字符串分割成多个字符串，即将一条数据分隔成多条数据。有两个参数，第一个参数是需要被分隔的字符串，第二个参数是正则表达式。

```sql
select regexp_split_to_table(trim(both '{}' from '{lbl.codelist} > {lbl.codelist.tabHeader} > {lbl.codelist.tabHeader.codelists}: 115 (993) > {lbl.codelist.tabHeader.codelists.name}'), '}[^}]*{') as label;

--结果：原字符串被分隔成四个字符串，并返回四行数据
lbl.codelist
lbl.codelist.tabHeader
lbl.codelist.tabHeader.codelists
lbl.codelist.tabHeader.codelists.name
```

## 参考链接

* [postgresql 常用函数汇总](https://www.cnblogs.com/brucexl/p/7561292.html)
* [字符串函数和操作符](https://www.runoob.com/postgresql/postgresql-functions.html)
* [PostgreSQL 判断字符串包含的几种方法](https://blog.csdn.net/luojinbai/article/details/45461837)
* [PostgreSql 聚合函数string_agg与array_agg](https://blog.csdn.net/u011944141/article/details/78902678/)