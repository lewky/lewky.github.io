# 数据库的标识符可以有多长

## 前言

今天在查看项目代码时发现有这样一个逻辑：在查询数据库时通过代码去拼接一个SQL，这个SQL的某个字段的别名是由多个变量名拼接而成的，于是在拼接该别名时特地限制了其长度为30，如果超过30就只截取前30个字符来作为列别名。

一时间很好奇为什么要限制列别名的长度，查阅过资料才明白，原来数据库的名字、表名、表别名、列名、列别名和函数名等，这些都属于标识符，不同数据库对于标识符会限定各种的长度最大值。
<!--more-->

## 关键字和标识符

关键字：Key Words，就是那些在 SQL 语言里有固定含义的单词。比如很常用的select、update、delete等。

标识符：Identifiers，就是一个用于标识的名字，比如数据库名、表名、表别名、列名、列别名和函数名等。
SQL 标识符和关键字必须以一个字母开头 （a-z 以及带可区别标记的字母以及非拉丁字母 ）或下划线开头 （_）开头。标识符和关键字里随后的字符可以是字母，数字（0-9）， 或者下划线，但 SQL 标准不会定义包含数字或者以下划线开头或结尾的关键字。

## 不同数据库的标识符的最大长度

|数据库类型|表名|字段名|
|-|-|-|
|PostgreSQL|63个字符|63个字符|
|SQL SERVER|128个字符，临时表116个字符|128个字符|
|Oracle|30个字符|30个字符|
|MySQL|64个字符|64个字符|
|Access|64个字符|64个字符|
|DB2|128个字符|128个字符|

### PostgreSQL中的标识符

PostgreSQL比较特殊，唯独它的标识符最大长度是63个字符，官方文档中是这样描述的：
>The system uses no more than NAMEDATALEN-1 bytes of an identifier; longer names can be written in commands, but they will be truncated. By default, NAMEDATALEN is 64 so the maximum identifier length is 63 bytes. If this limit is problematic, it can be raised by changing the NAMEDATALEN constant in src/include/pg_config_manual.h.
>
>Key words and unquoted identifiers are case insensitive. 

简单来说，PostgreSQL使用`NAMEDATALEN - 1`的值来限定标识符的最大长度，NAMEDATALEN默认是64，可以在PosrgreSQL的安装目录下的`include/pg_config_manual.h`去修改其值，在该shell文件中其注释如下：
```shell
/*
 * Maximum length for identifiers (e.g. table names, column names,
 * function names).  Names actually are limited to one less byte than this,
 * because the length must include a trailing zero byte.
 *
 * Changing this requires an initdb.
 */
#define NAMEDATALEN 64
```

### PostgreSQL关于标识符简单的例子

如果我们把标识符命名超过了最大长度，那么会被自动截取掉超出的部分，只留下最大长度的标识符。

```sql
alter table tb_student add "哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈" varchar(400);
```
如上SQL，由于数据库使用的是UTF-8编码，一个中文对应3个字符，也就是说，标识符最多只能有21个中文。上述SQL执行成功后，`tb_student`多出来一个新的字段`哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈`，正好只有21个字符，多出来的字符被丢弃了。

另外，标识符是不区分大小写的，但是**如果用双引号把标识符包括起来**，这时候就会区分大小写。

## 参考链接

* [PostgreSQL官方文档](https://www.postgresql.org/docs/10/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)
* [PostgreSQL中文文档](http://www.kuqin.com/postgreSQL8.1_doc/sql-syntax.html)
* [各个数据库表名和字段名长度限制](https://blog.csdn.net/lanseliuxingluo/article/details/78210600)

