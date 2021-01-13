# Java - 一道关于整型和字符类型相加的题目

## 题目

```java
public class Test {

    public static void main(final String[] args) {
        final int a = 10;
        final int b = 20;
        System.out.println(a + '+' + b + '=' + (a + b));
    }
}
```
<!--more-->

乍一看，可能有的同学会觉得很简单，直接给出如下答案：
```java
10+20=30
```

其实这是道陷进题，很容易就看混了，正确的答案是：
```java
164
```

## 分析

为什么答案会是`164`？

这是因为这里并不是字符串拼接，而是整型与字符类型的加法运算。

用一对单引号`'`包括起来的是字符，用一对双引号`"`包括起来的是字符串。

对于字符串来说，用`+`拼接起来的结果还是字符串。但这道题中，用`+`拼接起来的是整型和字符类型，就变成了单纯的加法运算。在加法运算中，数据类型会从低位自动转换成高位，因为高位转低位会有数据溢出导致丢失精度的风险。

当整型与字符类型相加时，字符类型会转换成整型，也就是转换成对应的ASCII码值。于是乎，`a + '+' + b + '=' + (a + b)`就变成了`10 + 43 + 20 + 61 + (10 + 20)`，其运算结果就是`164`。

## 题目变形

### 其一

```java
public class Test {

    public static void main(final String[] args) {
        final int a = 10;
        final int b = 20;
        System.out.println(a + "+" + b + "=" + (a + b));
    }
}
```

这道题的答案就是`10+20=30`了。

### 其二

```java
public class Test {

    public static void main(final String[] args) {
        System.out.println('A');
        System.out.println((int)'A');
    }
}
```

这道题的答案是：
```
A
65
```

如果我们想知道某个字符对应的ASCII码是多少，可以将其转换成整型，这个值就是其ASCII码值。
