# Java日期问题汇总

## 日期格式化的跨年问题

通常格式化日期时，都是使用的`YYYY/MM/dd`来格式化日期，但是在遇到跨年日期时，就会遇到很神奇的现象，如下：
```java
final Calendar calendar = Calendar.getInstance();
// 2020-12-26
calendar.set(2020, 11, 26);
final Date date1226 = calendar.getTime();
// 2020-12-27
calendar.set(2020, 11, 27);
final Date date1227 = calendar.getTime();
// YYYY
final DateFormat Y = new SimpleDateFormat("YYYY/MM/dd");
System.out.println("2020-12-26用YYYY/MM/dd表示:" + Y.format(date1226));
System.out.println("2020-12-27用YYYY/MM/dd表示:" + Y.format(date1227));
```

<!--more-->
上述代码输出如下：
```java
2020-12-26用YYYY/MM/dd表示:2020/12/26
2020-12-27用YYYY/MM/dd表示:2021/12/27
```

可以看到，只是一天之差，格式化后却相差了整整一年！这是因为`YYYY`是基于周最后一天所在年份来格式化年份的，周日是每周第一天。而`2020-12-27`这天是周日，这一周最后一天属于2021年，于是就发生了上述的神奇现象。下面是官方文档：

>Java's DateTimeFormatter pattern "YYYY" gives you the week-based-year, (by default, ISO-8601 standard) the year of the Thursday of that week.

所以，想要得到正确的结果，需要使用`yyyy`来替代`YYYY`，如下：
```java
final Calendar calendar = Calendar.getInstance();
// 2020-12-26
calendar.set(2020, 11, 26);
final Date date1226 = calendar.getTime();
// 2020-12-27
calendar.set(2020, 11, 27);
final Date date1227 = calendar.getTime();
// YYYY
final DateFormat Y = new SimpleDateFormat("YYYY/MM/dd");
System.out.println("2020-12-26用YYYY/MM/dd表示:" + Y.format(date1226));
System.out.println("2020-12-27用YYYY/MM/dd表示:" + Y.format(date1227));
// yyyy
final DateFormat y = new SimpleDateFormat("yyyy/MM/dd");
System.out.println("2020-12-26用yyyy/MM/dd表示:" + y.format(date1226));
System.out.println("2020-12-27用yyyy/MM/dd表示:" + y.format(date1227));
```

结果如下：
```java
2020-12-26用YYYY/MM/dd表示:2020/12/26
2020-12-27用YYYY/MM/dd表示:2021/12/27
2020-12-26用yyyy/MM/dd表示:2020/12/26
2020-12-27用yyyy/MM/dd表示:2020/12/27
```

## 参考链接

* [Java YYYY/MM/dd遇到跨年日期的问题](https://blog.csdn.net/weixin_42619772/article/details/111053743)
* [YYYY-MM-DD 的黑锅，我们不背！](https://blog.csdn.net/singwhatiwanna/article/details/103966585)