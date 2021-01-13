# PostgreSQL - update语句怎么关联多个表

## 问题

对于select语句，我们可以通过join/outer join来关联多个表；但是对于update语句，是不能直接通过join/outer join来关联多表数据的，这里仅针对PostgreSQL。

或者说，在PostgreSQL中，就算使用update+join不会报错，但join的那部分其实是没任何效果的，如下所示：<!--more-->

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

按照上边的sql，本意是a、b、c三表关联，当c的value是'test'且a的key也是'test'的时候，就将a的value也改为'test'。但实际上这个sql有大问题，这里的join和where条件并没有意义，一旦update成功，你会发现，a表内的所有数据的value都被改成了'test'！！要么update 0条数据，要么全部update！至于是哪种结果，这要看where的条件，目前还不清楚为什么会这样。因为这种写法本身就是**不对的**！

## PostgreSQL中正确的多表关联update写法

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

## 参考链接

* [How to do an update + join in PostgreSQL?](https://www.e-learn.cn/content/wangluowenzhang/36970)
