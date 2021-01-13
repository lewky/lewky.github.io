# PostgreSQL - 转义字符

转载至：[postgresql字符转义](https://blog.csdn.net/hatofdragon/article/details/54601121)

## 前言

在PostgreSQL 9之前的版本中，可以直接使用反斜杠`\`进行转义；比如：\b表示退格， \n表示换行， \t表示水平制表符，\r标示回车，\f表示换页。除此之外还支持\digits和\xhexdigits，分别表示转义八进制和十六进制数据。

但是在PostgreSQL 9之后的版本，反斜杠已经变成了普通字符；如果想要使用反斜杠来转义字符，就必须在需要转义的字符串前面加上E（E就是Escape），如下：
<!--more-->

```sql
select E'张\t小明';
```

## 对单引号的两种转义方式

在SQL标准中字符串是用单引号括起来的，而在PostgreSQL中遵守了该标准，双引号则是用来表示变量的，如果在字符串中需要使用到单引号，就需要对其进行转义。

### 方式一：使用E和反斜杠进行转义

```sql
select E'\'233';
```

### 方式二：直接用一个单引号来转义单引号

```sql
select '''233';
```

这两种方式都能得到`'233`的结果而不会报错，第二种方式比较简单，也可以通过修改`standard_conforming_strings`参数的值来让反斜杠从普通字符变回转义字符：

查询并修改该参数的值：

```sql
show standard_conforming_strings;
SET standard_conforming_strings = on;
SET standard_conforming_strings = off;
```

当该参数的值为off时就可以直接使用反斜杠作为转义字符里，如下：

```sql
select '\'233';
```

将会得到`'233`的结果而不会报错。
