# PostgreSQL - 查询表结构和索引信息

## 前言

PostgreSQL的表一般都是建立在public这个schema下的，假如现在有个数据表`t_student`，可以用以下几种方式来查询表结构和索引信息。

## 使用\d元命令查看表字段信息和索引信息

在cmd界面使用psql连接db后，输入\d加上表名即可：
<!--more-->
```bat
\d t_student
```

## 通过系统数据字典查询表结构

```sql
select
col.table_schema,
col.table_name,
col.ordinal_position,
col.column_name,
col.data_type,
col.character_maximum_length,
col.numeric_precision,
col.numeric_scale,
col.is_nullable,
col.column_default,
des.description
from
information_schema.columns col left join pg_description des on
col.table_name::regclass = des.objoid
and col.ordinal_position = des.objsubid
where
table_schema = 'public'
and table_name = 't_student'
order by
ordinal_position;
```

或者简单点：

```sql
select * from information_schema.columns
where table_schema='public' and table_name='t_student';
```

## 通过系统数据字典查询索引信息

```sql
select
A.SCHEMANAME,
A.TABLENAME,
A.INDEXNAME,
A.TABLESPACE,
A.INDEXDEF,
B.AMNAME,
C.INDEXRELID,
C.INDNATTS,
C.INDISUNIQUE,
C.INDISPRIMARY,
C.INDISCLUSTERED,
D.DESCRIPTION
from
PG_AM B left join PG_CLASS F on
B.OID = F.RELAM left join PG_STAT_ALL_INDEXES E on
F.OID = E.INDEXRELID left join PG_INDEX C on
E.INDEXRELID = C.INDEXRELID left outer join PG_DESCRIPTION D on
C.INDEXRELID = D.OBJOID,
PG_INDEXES A
where
A.SCHEMANAME = E.SCHEMANAME
and A.TABLENAME = E.RELNAME
and A.INDEXNAME = E.INDEXRELNAME
and E.SCHEMANAME = 'public'
and E.RELNAME = 't_student';
```

## 查询所有的表名

```sql
select
n.nspname,
relname
from
pg_class c,
pg_namespace n
where
c.relnamespace = n.oid
and nspname = 'public'
and relkind = 'r'
order by
relname;
```

## 可视化工具DBeaver

对于上述的sql语句只需要修改要查询的table name，可以根据需要自行修改想要查询的column。如果是通过DBeaver来连接数据库，还可以直接在当前的数据库实例下打开schema里的public选项，接着选中table，选中你想查看的表，可以很直观地看到该表的各种信息：column、index等等。

## 参考链接

* [PostgreSQL：如何查询表的字段信息？](http://francs3.blog.163.com/blog/static/4057672720130591027828/)