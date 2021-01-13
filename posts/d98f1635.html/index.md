# PostgreSQL - pl/pgsql的DO关键字

pl/pgsql即Procedural Language/ Postgres SQL(过程化sql语言)，是Postgresql数据库对sql语句的扩展，可以在pl/pgsql代码块内定义多条sql语句，每条语句以分号结束，代码块由begin开始，end结束，代码块的最后一个end可以不加分号。

DO关键字用来执行一段匿名代码块，即在在程序语言过程中一次性执行的匿名函数。代码块可以看做是一段没有参数、没有返回值的函数体。其格式如下：
<!--more-->

```java
DO [LANGUAGE lang_name] code;
```

## code

code block代码块实际上为一个字符串，可以用"美元符引用”`$$`书写字符串常量，`$$`中间可以包含标签名，可以自由命名，但是不能以数字开头，可以命名为`$$，$_$，$a$，$a1$...`，该标签名必须成对出现，且大小写敏感。

用DECLARE声明变量(如果不需要声明变量可以不写declare)，用BEGIN和END包括需要执行的代码/sql语句，每个语句末尾需要加上分号，BEGIN不加分号，代码块最后一个END后可以省略分号；其格式如下：

```java
DO $body$
BEGIN
  update student set name = '张小明' where id = 10010;
END
$body$;
```

```java
DO $body$
DECLARE
  NEW_NAME varchar(100);
BEGIN
  NEW_NAME:='张'||'小明';
  update student set name = NEW_NAME where id = 10010;
END
$body$;
```

## lang_name

用来解析code的程序语言的名字，如果缺省，默认为plpgsql，lang_name可以写在code前，也可以写在code后，即

```java
DO code;
```
等效于下边的
```java
DO LANGUAGE PLPGSQL code;
```
或者
```java
DO code LANGUAGE PLPGSQL;
```

这里的code指的是代码块，也就是上边说的内容格式。

## 一个例子

```
DO $body$
DECLARE
  SIZES_VALUE varchar(1000);
  MEASUREMENT_TEMPLATE RECORD;

BEGIN
  FOR MEASUREMENT_TEMPLATE IN (SELECT ID FROM CNT_MEASUREMENT_TEMPLATE WHERE DOMAIN_ID IN ('/','RD1','RD2') AND IS_LATEST = TRUE AND (SIZES IS NULL OR SIZES = ''))
    LOOP
      -------- split sizes value from CNT_MEASUREMENT_TEMPLATE_SIZE order by seq_no --------
      SIZES_VALUE = (SELECT ARRAY_TO_STRING(ARRAY(SELECT ALT_LABEL||CASE WHEN COALESCE(LABEL,'') = '' THEN '' ELSE '('||LABEL||')' END FROM CNT_MEASUREMENT_TEMPLATE_SIZE 
      	WHERE PARENT_ID = MEASUREMENT_TEMPLATE.ID ORDER BY SEQ_NO),', '));

      -------- set sizes value for cnt_measurement_template whose sizes value is null or '' --------
	  UPDATE CNT_MEASUREMENT_TEMPLATE SET SIZES = SIZES_VALUE WHERE ID = MEASUREMENT_TEMPLATE.ID;
	  
    END LOOP;
END;
$body$ LANGUAGE PLPGSQL;
```

>参考

1.https://www.cnblogs.com/wangzhen3798/p/7630597.html
2.https://www.2cto.com/database/201505/399624.html
