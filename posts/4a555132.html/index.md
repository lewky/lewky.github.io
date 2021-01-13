# 怎么快速对DB里的所有email进行校验

## 问题

由于业务上的需求，重新改写了校验email的正则表达式，同时DB里又迁移了其他数据库的数据，现在需要重新对DB里的所有email再校验一次，以排除掉不合法的email。

DB里的数据很多，手动去一个个校验的做法显然是不靠谱的，这种机械的重复性操作，自然是要用程序来解决才是最简易的。
<!--more-->
## 做法
### 拼接字符串

首先是将DB里所有的email都拼接成一个字符串，由于用的是PostgreSQL，所以直接使用现有的字符串拼接函数`string_agg()`。
具体用法如下：
```sql
select string_agg(email, ';') from cnt_user where is_latest;
```

大意就是拿到所有的最新版本的用户的email，以';'作为间隔符，将这些email拼接起来，得到的结果就是：`test1@qq.com;test2@qq.com...`

### 在程序中进行校验

自己写一个测试类，把刚刚db查询到的字符串复制进来，通过String类的`split()`将其进行切割成一个String数组，然后遍历该数组，通过正则表达式去一个个校验，将那些校验不通过的email给打印出来。

注意：这种方法不适用于email数量特别多的情况，如果String数组的大小超过3亿多，会报内存溢出OutOfMemoryError的错误。

大概的思路如下：
```java
/** Regex for single EmailValidator */
public static final String SINGLE_EMAIL_REGEX = "(?:(?:[A-Za-z0-9\\-_@!#$%&'*+/=?^`{|}~]|(?:\\\\[\\x00-\\xFF]?)|"
+ "(?:\"[\\x00-\\xFF]*\"))+(?:\\.(?:(?:[A-Za-z0-9\\-_@!#$%&'*+/=?^`{|}~])|(?:\\\\[\\x00-\\xFF]?)|"
+ "(?:\"[\\x00-\\xFF]*\"))+)*)@(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+"
+ "(?:(?:[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*)(?:[A-Za-z0-9-]*[A-Za-z0-9])?))";
public static final Pattern SINGLE_EMAIL_REGEX_PATTERN = Pattern.compile(SINGLE_EMAIL_REGEX);
...
final String emailString = "******"; //DB里通过函数拼接起来的email字符串
final String[] emails = emailString.split(";");
for (final String email : emails) {
	final Matcher matcher = SINGLE_EMAIL_REGEX_PATTERN.matcher(email);
	if (!matcher.matches()) {
		System.out.println("The email is invalid: " + email);
	}
}
```

如果不合法的email有很多的话，还可以通过poi将这些email输出到一个文档中。
