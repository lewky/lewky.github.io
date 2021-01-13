# SQL - ROW_NUMBER() OVER()函数

ROW_NUMBER() OVER()函数用来为每条记录返回一个行号，可以用来对记录进行排序并返回该序号，序号从1开始排序。

这里的over()是聚集函数，可以给记录进行分组、排序；row_number()不能单独使用，必须搭配over()才能使用，否则会报错。<!--more-->

## 简单地返回的行号
```java
给student的每条记录进行排序并返回序号
select *, row_number() over() from student;
```

|num|class|name|row_number|
|-|-|-|-|
|1000|1|小明|1|
|1001|2|小白|2|
|1002|2|小黑|3|

## 给返回的行号起个别名
```java
select *, row_number() over() rank from student;
```

|num|class|name|rank|
|-|-|-|-|
|1000|1|小明|1|
|1001|2|小白|2|
|1002|2|小黑|3|

## 配合partition by/order by
```java
给每个班的学生按照学号递减的顺序返回行号
select *, row_number() over(partition by class order by num desc) rank from student;
```

|num|class|name|rank|
|-|-|-|-|
|1000|1|小明|1|
|1002|2|小黑|1|
|1001|2|小白|2|
