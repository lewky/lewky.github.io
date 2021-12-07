# PostgreSQL - DML操作汇总

## 匿名函数

DO关键字用来执行一段一次性的匿名函数，具体可以看这篇文章：[PostgreSQL - pl/pgsql的DO关键字](/posts/d98f1635.html/)

## 遍历数据，变量赋值

遍历操作以及变量赋值操作需要在匿名函数脚本中使用，且匿名函数在执行时必须显示开启事务。

<!--more-->

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

PostgreSQL的update语句关联外表的写法与MySQL不同，具体可以看这篇文章：[PostgreSQL - update语句怎么关联多个表](/posts/8423a9d4.html/)

此外，update语句也可以连接自身的表，只要起了表别名将二者区分开来就行。