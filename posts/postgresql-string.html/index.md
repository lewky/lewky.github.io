# PostgreSQL - 字符串函数汇总

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

## 参考链接

* [postgresql 常用函数汇总](https://www.cnblogs.com/brucexl/p/7561292.html)
* [字符串函数和操作符](https://www.runoob.com/postgresql/postgresql-functions.html)