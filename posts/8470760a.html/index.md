# PostgreSQL - 怎么将时间转换成秒

## 保留原来的毫秒值
```sql
select extract(epoch from '03:21:06.678'::time);
```
<!--more-->

这个`extract(epoch from )`函数得到的是时间是秒单位，如果需要毫秒值就直接乘以1000：
```sql
select extract(epoch from now())*1000;
```

## 去掉原来的毫秒值

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

## 将两个日期间的时间转换为秒值
```sql
select extract(epoch from(('2018-12-18 00:00:10'::timestamp - '2018-12-18 00:00:00')));
select extract(epoch from(('2018-12-18 00:00:10' - '2018-12-18 00:00:00'::timestamp)));
select extract(epoch from(('2018-12-18 00:00:10' - timestamp'2018-12-18 00:00:00')));
select extract(epoch from((timestamp'2018-12-18 00:00:10' - '2018-12-18 00:00:00')));
```
上边四种写法都可以。

## epoch新纪元时间

>新纪元时间 Epoch 是以`1970-01-01 00:00:00 UTC`为标准的时间，将目标时间与`1970-01-01 00:00:00`时间的差值以秒来计算 ，单位是秒，可以是负值; 有些应用会将时间存储成epoch 时间形式，以提高读取效率。

## 参考链接

* [postgresql获取系统当前时间毫秒数的sql，以及秒级时间戳](https://blog.csdn.net/qq_32157851/article/details/82414443)
* [PostgreSQL: epoch 新纪元时间的使用](https://www.cnblogs.com/kungfupanda/p/4383882.html)