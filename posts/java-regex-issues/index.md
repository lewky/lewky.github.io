# Java正则表达式问题汇总

## 正则表达式的模式修饰符

在正则表达式前面可以加上`(?i)`，`(?s)`和`(?m)`这三种模式修饰符，用以改变正则表达式的匹配模式。

`(?i)`表示匹配时不区分大小写。

`(?s)`表示Singleline（单行模式），匹配时会改变`.`的含义，使其能与换行符（\r或者\n，如果是\r\n需要用两个`.`）匹配。

`(?m)`表示Multiline（多行模式），匹配时会改变`^`和`$`的含义，使其分别在任意一行的行首和行尾匹配，而不仅仅在整个字符串的开头和结尾匹配。

这三种模式修饰符可以搭配使用，如：`(?im)`，`(?is)`等。
<!--more-->
将模式修饰符加在正则表达式最前面，将会对整个正则表达式生效。可以通过以下写法来限制修饰符的生效范围：

```java
// 待匹配的字符串
String test = "HelloWorld!";

// 方式一
String regex = "(?i)hello(?-i)World!";
// 方式二
String regex = "(?i:hello)World!";
```

下面是一个简单的Demo：

```java
// Demo#1
final String test = "a\nA";
final Pattern pattern = Pattern.compile("(?is)a.a");
final Matcher matcher = pattern.matcher(test);
int count = 0;
while (matcher.find()) {
    System.out.println(++count + ": " + matcher.group());
}

// 结果如下：
1: a
A

// Demo#2
final String test = "a\nA";
final Pattern pattern = Pattern.compile("(?im)^a$");
final Matcher matcher = pattern.matcher(test);
int count = 0;
while (matcher.find()) {
    System.out.println(++count + ": " + matcher.group());
}

// 结果如下：
1: a
2: A

// Demo#3
String p1 = "^.+";
String p2 = "(?m)^.+";
String p3 = "(?s)^.+";
String str = "Hello\nWorld!";
// 匹配结果如下:
// 默认模式：匹配到一个结果
// 1: Hello
// 多行模式：匹配到两个结果（换行符没有被.字符匹配，但是会继续匹配下一行字符串）
// 1: Hello
// 2: World!
// 单行模式：匹配到一个结果（换行符被.字符匹配到了）
// 1: Hello
// World!
```

## `matches()`和`find()`区别

`matches()`是完全匹配，执行该方法后，会改变Matcher对象中的成员变量值，导致继续执行`find()`时可能无法匹配到正确结果。

`find()`是局部匹配，执行该方法不会改变Matcher对象中的成员变量值，每执行一次该方法都会使内部的游标向右移动到下一个匹配到的位置，通常搭配`group()`来获取当次局部匹配到的字符串。

`find()`在局部匹配成功后下标从0开始计算，可以通过`find(int start)`来重置局部匹配的位置。

如果在匹配字符串时，需要同时使用到`matches()`和`find()`，应该在最后使用`matches()`，避免Matcher对象被修改导致`find()`结果不正确。或者不使用同一个Matcher对象来调用`matches()`和`find()`。

## 参考链接

* [正则前面的 (?i) (?s) (?m) (?is) (?im)](https://www.cnblogs.com/tsql/p/6381367.html)
* [正则表达式 ：(?s)(?i)'\\s*+ 前面的(?s)(?i) 表示什么意思](https://zhidao.baidu.com/question/524991537.html)