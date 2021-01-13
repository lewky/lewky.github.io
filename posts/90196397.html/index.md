# PostgreSQL笔记-查看表的主外键等约束关系

```
SELECT
     tc.constraint_name, tc.table_name, kcu.column_name, 
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name,
     tc.is_deferrable,tc.initially_deferred
 FROM 
     information_schema.table_constraints AS tc 
     JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
 WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = 'your table name';
```
<!--more-->
constraint_type有四种：UNIQUE、PRIMARY KEY、CHECK、FOREIGN KEY

通过修改上边sql语句的table_name和constraint_type来进行相应的查询