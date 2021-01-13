# PostgreSQL - null和''的区别与判断以及COALESCE函数

## null和''的区别与判断

null是一种类型，`''`是空字符串，打个比方，`''`是你参加了考试且得了零分，而null则是你压根就没有参加考试。

如果要在sql中对两者进行判断，是有区别的：<!--more-->

```java
//null只能和is或is not搭配，不能使用=、!=或者<>
select * from student where name is null;
select * from student where name is not null;

//''的判断可以使用=、!=或者<>
select * from student where name = '';
select * from student where name != '';
select * from student where name <> '';
```

## 使用COALESCE函数

COALESCE函数是返回参数中的第一个非null的值，它要求参数中至少有一个是非null的，如果参数都是null会报错。

```java
select COALESCE(null,null); //报错
select COALESCE(null,null,now()::varchar,''); //结果会得到当前的时间
select COALESCE(null,null,'',now()::varchar); //结果会得到''

//可以和其他函数配合来实现一些复杂点的功能：查询学生姓名，如果学生名字为null或''则显示“姓名为空”
select case when coalesce(name,'') = '' then '姓名为空' else name end from student;
```