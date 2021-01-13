# 服务器时间和数据库时间的校验

## 问题与分析

今天在公司进行Sanity Test(可用性测试)时发现服务器启动失败，查找log后发现在启动时发生了异常导致了服务器启动失败。

由于公司的服务器和数据库分别部署在不同的主机，所以会在启动时进行时间上的校验，如果两台主机的时间差超过600s就会抛出异常、启动失败。这个设定的时间差被存储在数据库中，以方便日后修改。
<!--more-->
而在代码中，通过mybatis来读取到这个存储在db中的时间差，sql语句如下：

```sql
SELECT TO_CHAR(CURRENT_TIMESTAMP,'YYYY-MM-DD HH24:MI:SS') AS "DBTIME";
```

而服务器的本地时间以及时间的校验则是由下边的代码来实现：

```java
final DateTime dbTime = systemMapper.getDBTime();
final long dbTimeMs = dbTime.getMilliseconds(TimeZone.getDefault());

final DateTime webAppTime = DateTime.now();
final long webAppTimeMs = webAppTime.getMilliseconds(TimeZone.getDefault());

// Calculate difference between WebApp time and DB time
final long timeDifferent = Math.abs(dbTimeMs - webAppTimeMs);
```

从代码可以看到，将服务器和数据库所在的主机的本地时间转换成默认的时区后，再进行相减取绝对值，如果这个结果值超过db中设定的时间差(也就是600s)就会抛出异常，令服务器启动失败。

分析到这里，便开始进行验证：分别连接到两台主机并通过`date`命令来查询各自的时间，发现双方的时间差大概有15分钟左右，确实超过了600s。

于是问题来了，为什么会忽然出现这么大的时间差？明明昨天还可以正常启动，今天却因为时间差变大而导致失败了？可以确定的是，db中设定的时间差一直就是600s，并没有人去改动它。

在工作群里说了下服务器启动失败的原因，有同事说可能是机器断电造成的？百度了下，也有人遇到这种类似的情况，Linux的系统时间忽然变慢了几分钟到十几分钟，也有的是时间变快了。暂时没找到具体的原因，解决办法基本都是直接修改系统时间。

目前看来，这个问题的答案是无法得知了，对于这方面我确实不了解。如果哪位朋友知道的，欢迎评论告诉我一下O(∩_∩)O哈哈~

今天写篇文章记录下这个问题，以前我还真没想到需要对不同主机的服务器和数据库进行时间校验，百度了下，倒是发现很多安卓app关于客户端和服务端进行时间校验的文章，挺有意思的。