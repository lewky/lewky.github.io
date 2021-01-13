# 验证邮件地址的Java正则表达式

最近写了个Java正则表达式来验证RFC 5322规范的邮件地址，这个邮件地址比较复杂，对于这样一个地址：`userName@domainName`，它满足以下条件：
<!--more-->
## **对于userName**

> 1、允许使用以下所有字符作为用户名：
> [A-Z], [a-z], [0-9], [.], [-], [_], [@], [!], [#], [$], [%], [&], ['], [*], [+], [/], [=], [?], [^], [`], [{], [|], [}], [~]
> 2、允许使用所有的ASCII字符，包括控制字符，前提条件是这些字符是被[\\]所转义的或者被一对["]所包括起来，比如下边的格式：
> "  [ ♥"或者\\]都是合法的用户名
> 3、[.]不能出现在用户名的开头或者结尾，也不能连续出现两个以上的[.]

## **对于domainName**

> 1、只能使用[A-Z],[a-z],[0-9],[-]
> 2、如果使用了[-]，那么该字符不能出现在域名的开头或结尾
> 3、顶级域名不能全是数字
> 4、至少要有二级域名

## **Java正则表达式**
由于是用来验证邮件地址的，使用的是matches()这个完全匹配的方法，并且使用非捕获组来提高性能。
写了两个正则表达式，一个是用来验证单个邮件地址的(比如xxx@xx.xx)；一个是用来验证多个邮件地址的，即多个邮件地址之间用空白符或者英文的逗号或分号分割开来(比如xxx@xx.xx; xx@xxx.xxx)。

```java
/** Regex format for multiple EmailValidator */
public static final String MULTIPLE_EMAIL_REGEX_FORMAT = "(?:(?:%1$s)(?:(?:\\s*,\\s*)|(?:\\s*;\\s*)|\\s*$))*";

/** Regex for single EmailValidator */
public static final String SINGLE_EMAIL_REGEX = "(?:(?:[A-Za-z0-9\\-_@!#$%&'*+/=?^`{|}~]|(?:\\\\[\\x00-\\xFF]?)|(?:\"[\\x00-\\xFF]*\"))+(?:\\.(?:(?:[A-Za-z0-9\\-_@!#$%&'*+/=?^`{|}~])|(?:\\\\[\\x00-\\xFF]?)|(?:\"[\\x00-\\xFF]*\"))+)*)@(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+(?:(?:[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*)(?:[A-Za-z0-9-]*[A-Za-z0-9])?))";
public static final Pattern SINGLE_EMAIL_REGEX_PATTERN = Pattern.compile(SINGLE_EMAIL_REGEX);

/** Regex for multiple EmailValidator */
public static final String MULTIPLE_EMAIL_REGEX = String.format(MULTIPLE_EMAIL_REGEX_FORMAT, SINGLE_EMAIL_REGEX);
public static final Pattern MULTIPLE_EMAIL_REGEX_PATTERN = Pattern.compile(MULTIPLE_EMAIL_REGEX);

```

上边验证单个邮件地址的正则表达式太长了，这里分一下行：
```java
public static final String SINGLE_EMAIL_REGEX = "(?:(?:[A-Za-z0-9\\-_@!#$%&'*+/=?
^`{|}~]|(?:\\\\[\\x00-\\xFF]?)|(?:\"[\\x00-\\xFF]*\"))+(?:\\.(?:(?:[A-Za-z0-9\\-
_@!#$%&'*+/=?^`{|}~])|(?:\\\\[\\x00-\\xFF]?)|(?:\"[\\x00-\\xFF]*\"))+)*)
@(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+
(?:(?:[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*)(?:[A-Za-z0-9-]*[A-Za-z0-9])?))";
```

最后附上一些测试用的邮件地址
```java
//        =========TRUE EMAIL==========
        final String email = "Abc\\@def@example.com";   //true
//        final String email = "Fred\\ Bloggs@example.com";   //true
//        final String email = "Joe.\\\\Bloggs@example.com";   //true
//        final String email = "\"Abc@def\"@example.com";   //true
//        final String email = "\"Fred Bloggs\"@example.com";   //true
//        final String email = "user+mailbox@example.com";   //true
//        final String email = "customer/department=shipping@example.com";   //true
//        final String email = "$A12345@example.com";   //true
//        final String email = "!def!xyz%abc@example.com";   //true
//        final String email = "_somename@example.com";   //true
//        final String email = "Natasha.O'neill@thewarehouse.com";   //true
//        final String email = "ab.c@exam-ple.c--om"; // true
//        final String email = "------ab.c@example.12.com"; // true
//        final String email = "------ab.c@example.12.com    "; // true

//        ==========FALSE EMAIL==========
//        final String email = "abc[@example.com";   //false
//        final String email = ".abc@example.com";   //false
//        final String email = "ab..c@example.com"; // false
//        final String email = "ab.c@example.com."; // false
//        final String email = "ab.c@example.com-"; // false
//        final String email = "------ab.c.@example.com"; // false
//        final String email = "------ab.c@-example-.com"; // false
//        final String email = "------ab.c@com"; // false
//        final String email = "------ab.c@example.12"; // false
```
