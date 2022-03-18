# PostgreSQL - DML操作汇总

## 匿名函数

### DO关键字

pl/pgsql即Procedural Language/ Postgres SQL(过程化sql语言)，是Postgresql数据库对sql语句的扩展，可以在pl/pgsql代码块内定义多条sql语句，每条语句以分号结束，代码块由begin开始，end结束，代码块的最后一个end可以不加分号。
<!--more-->

DO关键字用来执行一段匿名代码块，即在在程序语言过程中一次性执行的匿名函数。代码块可以看做是一段没有参数、没有返回值的函数体。其格式如下：

```sql
DO [LANGUAGE lang_name] code;
```

### code

code block代码块实际上为一个字符串，可以用"美元符引用”`$$`书写字符串常量，`$$`中间可以包含标签名，可以自由命名，但是不能以数字开头，可以命名为`$$，$_$，$a$，$a1$...`，该标签名必须成对出现，且大小写敏感。

用DECLARE声明变量(如果不需要声明变量可以不写declare)，用BEGIN和END包括需要执行的代码/sql语句，每个语句末尾需要加上分号，BEGIN不加分号，代码块最后一个END后可以省略分号；其格式如下：

```sql
DO $body$
BEGIN
  update student set name = '张小明' where id = 10010;
END
$body$;
```

```sql
DO $body$
DECLARE
  NEW_NAME varchar(100);
BEGIN
  NEW_NAME:='张'||'小明';
  update student set name = NEW_NAME where id = 10010;
END
$body$;
```

### lang_name

用来解析code的程序语言的名字，如果缺省，默认为plpgsql，lang_name可以写在code前，也可以写在code后，即

```sql
DO code;
```

等效于下边的

```sql
DO LANGUAGE PLPGSQL code;
```

或者

```sql
DO code LANGUAGE PLPGSQL;
```

这里的code指的是代码块，也就是上边说的内容格式。

### 一个例子

```sql
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

## 遍历数据，变量赋值

遍历操作以及变量赋值操作需要在匿名函数脚本中使用，且匿名函数在执行时必须显示开启事务。

```sql
begin;

DO $body$
declare
targetId bpchar(32);
update_sr RECORD;
begin

    --遍历表中符合条件的数据
	for update_sr in (
        select temp.* from tab_test temp
        inner join tab_student sr on sr.id = temp.id
        where sr.is_latest is true
	)
	loop

        select max(id) into targetId from tab_student where ref_no = update_sr.ref_no;

        if targetId is not null then
        
            --操作数据等
        
        end if;
        
    end loop;
END;
$body$ LANGUAGE PLPGSQL;

commit;
```

上面的脚本中使用了`for loop`来遍历数据，需要注意的是，在遍历时会将数据缓存起来，如果在遍历时改变了被遍历的数据，是不会影响到被缓存的数据的。如果此时需要使用到被更改的值，只能通过赋值给临时变量来获取到被更改的值。

在变量赋值时，可以用`select max(xx) into`的写法。使用`max()`的目的是，如果select不到数据则会返回null，避免在变量赋值时出错。

## 插入其他表的数据

```sql
INSERT INTO tab_test
(id, name, ref_no, version)
select id, name, ref_no, version
from tab_student;
```

使用`insert into ... select from ...`来插入其他表的数据，也可以是同一个表，但此时需要起表别名来区分数据。且这种写法，需要两个表都存在才行。

## 修改多个列的值

在修改的列数量较少时，可以用下面的写法：

```sql
update tab_test set name = 'new name', ref_no = 'new ref_no' where id = '1';
```

如果列非常多时，比如同时改几十上百个，可以用下面的写法简单点：

```sql
update tab_test set (name, ref_no, version)
= ('new name', 'new ref_no', 2)
where id = '1';
```

## update语句怎么关联其他表

PostgreSQL的update语句关联外表的写法与MySQL不同，不能直接通过join/outer join来关联其他表，就算使用update+join不会报错，join的那部分其实也不会有任何效果，如下所示：

```sql
update a
set value = 'test'
from a
join b on a.b_id = b.id
join c on b.c_id = c.id
where
a.key = 'test'
and c.value = 'test';
```

上边的sql本意是a、b、c三表关联，当c的value是'test'且a的key也是'test'的时候，就将a的value也改为'test'。

但实际上这个sql有大问题，这里的join和where条件并没有意义，一旦update成功，你会发现，a表内的所有数据的value都被改成了`test`！！要么update 0条数据，要么全部update！至于是哪种结果，这要看where的条件，目前还不清楚为什么会这样。因为这种写法本身就是**不对的**！

### PostgreSQL中正确的多表关联update写法

在update语句中不应该通过join来进行多表关联，而是要**通过from来多表关联**，如下：

```sql
update a
set value = 'test'
from b,c
where
a.b_id = b.id
and b.c_id = c.id
and a.key = 'test'
and c.value = 'test';
```

通过from来多表关联，而关联条件则是放到了where中，这样就可以达到我们想要的效果了。另外补充一句，对于`set xxx = 'xxx'`这个update的部分，是不可以在column字段前加上表前缀的，比如下边的写法就是有语法错误的：

```sql
update a
set a.value = 'test';
```

此外，update语句也可以连接自身的表，只要起了表别名将二者区分开来就行。

## 参考链接

* [PostgreSQL数据库PL/PGSQL学习使用](https://www.cnblogs.com/wangzhen3798/p/7630597.html)
* [PostgreSQL中的DO-有条件的创建函数](https://www.2cto.com/database/201505/399624.html)
* [How to do an update + join in PostgreSQL?](https://www.e-learn.cn/content/wangluowenzhang/36970)