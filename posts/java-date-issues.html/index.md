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

## JDK 8新的日期和时间API

新版本的日期时间API主要分为：LocalDate、LocalTime、LocalDateTime、ZonedDateTime四个类。

其中关系如下：
```java
LocalDateTime = LocalDate + LocalTime

ZonedDateTime = LocalDateTime + ZoneOffset + ZoneId
// ZoneId是时区id
// ZoneOffset继承自ZoneId，表示时区对应的时间偏移量，比如东八区对比零时区的偏移量是+08:00，即快了八个小时
```

>GMT，即格林尼治标准时间，也就是世界时。GMT的正午是指当太阳横穿格林尼治子午线（本初子午线）时的时间。但由于地球自转不均匀不规则，导致GMT不精确，现在已经不再作为世界标准时间使用。
>
>UTC，即协调世界时。UTC是以原子时秒长为基础，在时刻上尽量接近于GMT的一种时间计量系统。为确保UTC与GMT相差不会超过0.9秒，在有需要的情况下会在UTC内加上正或负闰秒。UTC现在作为世界标准时间使用。
>
>计算机中的UNIX时间戳，是以GMT/UTC时间「1970-01-01T00:00:00」为起点，到具体时间的秒数，不考虑闰秒。这么做当然是为了简化计算机对时间操作的复杂度。Java调试时经常使用到的`System.currentTimeMillis()`就是获取该时间戳对应的时间毫秒值。

### 本地日期API

在不需要处理时区时使用：LocalDate、LocalTime、LocalDateTime，也就是获取系统默认时区的日期时间。

```java
// 本地日期
LocalDate localDate = LocalDate.now();
System.out.println(localDate);  // 2021-05-12
System.out.println(localDate.getYear());  // 2021
System.out.println(localDate.getMonthValue());  // 5
System.out.println(localDate.getDayOfMonth());  // 12
System.out.println(localDate.withYear(2017).withMonth(7).withDayOfMonth(1));  // 2017-07-01

// 本地时间
LocalTime localTime = LocalTime.now();
System.out.println(localTime);  // 00:13:19.738
System.out.println(localTime.getHour());  // 0
System.out.println(localTime.plusHours(1)); // 01:13:19.738

// 本地日期时间
LocalDateTime localDateTime = LocalDateTime.now();
System.out.println(localDateTime);  // 2021-05-12T00:13:19.738
System.out.println(localDateTime.toLocalDate());    // 2021-05-12
System.out.println(localDateTime.toLocalTime());    // 00:13:19.738
System.out.println(localDateTime.getHour());    // 0

// 指定日期
System.out.println(LocalDate.of(2017, 7, 1));   // 2017-07-01
System.out.println(LocalTime.of(0, 0));     // 00:00

// 解析日期字符串
System.out.println(LocalTime.parse("20:15:30"));    // 20:15:30
```

### 时区日期API

时区日期类是ZonedDateTime：

```java
// 时区日期时间
ZonedDateTime zonedDateTime = ZonedDateTime.now();
System.out.println(zonedDateTime);  // 2021-05-12T08:22:21.404+08:00[Asia/Shanghai]

System.out.println(zonedDateTime.getYear());    // 2021
System.out.println(zonedDateTime.getOffset());  // +08:00
System.out.println(zonedDateTime.getZone());    // Asia/Shanghai

System.out.println(ZoneId.systemDefault());     // Asia/Shanghai
System.out.println(ZoneId.SHORT_IDS.get("CTT"));// Asia/Shanghai
```

### 日期和时区的转换

可以给本地日期加上时区信息，以此获取对应的时区日期。

时区日期在转换时区时可以分为两种，一种是本地日期不变，单纯改变时区；另一种是将一个时区日期转换为其他时区的日期，此时不仅会改变时区，还会改变本地日期。

```java
LocalDate localDate = LocalDate.parse("2021-01-05");
// LocalDate转换为LocalDateTime
LocalDateTime localDateTime = LocalDateTime.of(localDate, LocalTime.MIN);
// 指定为东八区时间
ZonedDateTime zonedDateTime = localDateTime.atZone(ZoneId.of("UTC+08:00"));

System.out.println(localDate);      // 2021-01-05
System.out.println(localDateTime);  // 2021-01-05T00:00
System.out.println(zonedDateTime);  // 2021-01-05T00:00+08:00[UTC+08:00]
	
// 日期格式化
// 2021-01-05T00:00:00.000Z
System.out.println(localDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")));

System.out.println(zonedDateTime.toLocalDateTime());    // 2021-01-05T00:00
System.out.println(zonedDateTime.toOffsetDateTime());   // 2021-01-05T00:00+08:00
System.out.println(zonedDateTime.getOffset());          // +08:00
System.out.println(zonedDateTime.getZone());            // UTC+08:00

// 换算为零时区时间
ZonedDateTime withZoneSameInstant = zonedDateTime.withZoneSameInstant(ZoneId.of("Z"));
// 单纯修改时区信息
ZonedDateTime withZoneSameLocal = zonedDateTime.withZoneSameLocal(ZoneId.of("Z"));

System.out.println(withZoneSameInstant.toLocalDateTime());  // 2021-01-04T16:00
System.out.println(withZoneSameLocal.toLocalDateTime());    // 2021-01-05T00:00
```

### 获取月份、年份的最后一天

JDK 8提供了`TemporalAdjusters`工具类来实现调整时间的功能：

```java
// 2021-07-27
final LocalDate localDate = LocalDate.now();
// 2021-07-01
System.out.println(localDate.with(TemporalAdjusters.firstDayOfMonth()));
// 2021-01-01
System.out.println(localDate.with(TemporalAdjusters.firstDayOfYear()));
// 2021-08-01
System.out.println(localDate.with(TemporalAdjusters.firstDayOfNextMonth()));
// 2022-01-01
System.out.println(localDate.with(TemporalAdjusters.firstDayOfNextYear()));
// 当月第一个周一： 2021-07-05
System.out.println(localDate.with(TemporalAdjusters.firstInMonth(DayOfWeek.MONDAY)));
// 当月最后一个周五： 2021-07-30
System.out.println(localDate.with(TemporalAdjusters.lastInMonth(DayOfWeek.FRIDAY)));
```

## 参考链接

* [Java YYYY/MM/dd遇到跨年日期的问题](https://blog.csdn.net/weixin_42619772/article/details/111053743)
* [YYYY-MM-DD 的黑锅，我们不背！](https://blog.csdn.net/singwhatiwanna/article/details/103966585)
* [Java日期时间API系列19--Jdk8，ZonedDateTime和时区转换。](https://zhuanlan.zhihu.com/p/149302250)
* [【java8中的时间操作】java8中获取月的最后一天或者总天数，JDK8 LocalDate AP](https://blog.csdn.net/qq_40598321/article/details/112191964)