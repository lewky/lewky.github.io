# Java - 三元运算符隐含的坑

## 背景

某天发现系统报空指针异常，追踪异常栈后发现源头处是一个非常简单的三元表达式，如下：
```java
Integer age = user != null ? user.getAge() : 0;
```
<!--more-->
咋看上去好像看不出什么问题，然而当user对象里的age变量为null时，就会触发NPE。原因是三元表达式的其中一条表达式的返回值为基础数据类型时，如果另一个表达式的返回值是包装类，则会自动拆箱。

比如这里的`user.getAge()`返回的是`Integer`，由于另一个表达式是0，当`user != null`是true的时候，左边的表达式就变成了`user.getAge().intValue()`，如果user对象里的age变量为null时，就会触发NPE。

如果想避免三元表达式由于拆箱导致的NullPointerException，可以改成如下：
```java
Integer age = user != null ? user.getAge() : new Integer(0);
```

## 补充

三元表达式除了会根据另一个表达式的返回值来推断是否进行拆箱，还会和`+=`等操作符一样进行隐式类型转换，数值类型的返回值会自动向高精度转换，如下：
```java
char a = 'a';
int i = 96;

System.out.println(3 >= 2 ? a : 9.0);
System.out.println(3 >= 2 ? i : 9.0);
System.out.println(3 >= 2 ? a : i);
System.out.println(3 >= 2 ? i : a);
System.out.println(3 >= 2 ? 98 : a);
System.out.println(3 >= 2 ? 98 : i);
```

上述的结果如下：
```java
97.0
96.0
a
`
b
98
```

以上结果基于jdk8，另外对于char和int的加法等运算，运算结果会自行转为int类型；但是在三元表达式中两个表达式返回值分别为char和int时，若返回int类型返回值会转型为char。

## 参考链接

* [java三元运算符详解](https://www.cnblogs.com/itmlt1029/p/4756331.html)
* [Java中三元运算符值得注意的地方](https://blog.csdn.net/shikaiwencn/article/details/50443495)
