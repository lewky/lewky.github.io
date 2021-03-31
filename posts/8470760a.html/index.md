# PostgreSQL - 日期函数汇总

##　比较两个日期之间的时间差超过N个小时

在PostgreSQL中，两个时间戳相减会得到一个`interval`类型的结果，如下：
```sql
select now() - '2021-03-28 15:47:07'; --0 years 0 mons 2 days 0 hours 1 mins 15.081206 secs
select '2021-03-28 15:47:07' - now(); --0 years 0 mons -2 days 0 hours -3 mins -17.692835 secs
```

<!--more-->
通过对比两个`interval`类型即可得到我们想要的结果，PostgreSQL会自行对`interval`类型进行处理，如下：
```sql
select interval '0 years 100 mons 2 days 0 hours' > interval '4years'; --true

select now() - '2021-03-28 15:47:07' > interval '4days'; --false
```

## EXTRACT函数对日期进行处理

语法如下：
```
EXTRACT(type FROM date)
```

`data`是日期，也可以是时间间距类型`interval`。这里的`type`需要指定为以下的值之一：

|type|value|
|:-|:-|
|day|返回日期值|
|month|返回月份值|
|year|返回年份值|
|doy（day of year）|返回年中的第几天|
|dow（day of week）|返回星期几|
|quarter|返回季度|
|epoch|将当前日期转化为秒值|

```sql
select now(); --2021-03-30 17:21:50

select extract(day from(now())); --30
select extract(month from(now())); --3
select extract(year from(now())); --2021
select extract(doy from(now())); --89
select extract(dow from(now())); --2
select extract(quarter from(now())); --1

select extract(epoch from '01:00:06.678'::time); --3606.678
select extract(epoch from(interval '0 years 0 mons 0 days 0 hours 10 mins 10.00 secs')); --610
```

如果需要把时间转化成毫秒值，直接把结果乘以1000就行。

## 去掉日期的毫秒值

向下取整函数`floor()`
```sql
select floor(extract(epoch from '03:21:06.678'::time));
```

向上取整函数`ceil()`或`ceiling()`，这两个一样的
```sql
select ceil(extract(epoch from '03:21:06.678'::time));
select ceiling(extract(epoch from '03:21:06.678'::time));
```

四舍五入函数`round()`
```sql
select round(extract(epoch from '03:21:06.678'::time));
```

## 补充

### epoch新纪元时间

>新纪元时间 Epoch 是以`1970-01-01 00:00:00 UTC`为标准的时间，将目标时间与`1970-01-01 00:00:00`时间的差值以秒来计算 ，单位是秒，可以是负值; 有些应用会将时间存储成epoch 时间形式，以提高读取效率。

## 参考链接

* [postgresql获取系统当前时间毫秒数的sql，以及秒级时间戳](https://blog.csdn.net/qq_32157851/article/details/82414443)
* [PostgreSQL: epoch 新纪元时间的使用](https://www.cnblogs.com/kungfupanda/p/4383882.html)
* [postgresql 比较两个时间差大于 N个小时](https://blog.csdn.net/q_l_s/article/details/66974920)
* [PostgreSQL中的函数之日期时间函数（使用EXTRACT函数获取日期中的指定值）](https://itbilu.com/database/postgre/E12ilqZXx.html)