# Java - foreach循环报NPE空指针异常

## 前言

最近debug时忽然发现，如果一个集合赋值为null，那么对该集合进行foreach循环(也叫增强for循环)时，会报NPE(即空指针异常NullPointerException)。

代码如下：<!--more-->

```java
final List<String> list = null;
// final List<String> list = new ArrayList<>();
for (final String string : list) {
    System.out.println(string);
}
```

运行时报错如下：

```
Exception in thread "main" java.lang.NullPointerException
at com.lewis.test.TestLewis.main(TestLewis.java:42)
```

一时间很惊奇，因为在我印象中，foreach循环在遇到null的集合时，应该是会自动跳过去不进行遍历的才对。于是修改代码如下：

```java
//final List<String> list = null;
final List<String> list = new ArrayList<>();
for (final String string : list) {
    System.out.println(string);
}
```

运行后发现没有报错，看来是以前记错了。foreach循环只会自动跳过遍历空的集合，如果对于null值的集合，就会直接报NPE。

## 解决方法

在写业务逻辑时难免会遇到遍历集合的情况，这时候应该先判断集合是否为null再进行遍历，可以使用Apache的工具类CollectionUtils。

另外补充下，foreach循环内部是使用的迭代器来遍历，也就是说，这种遍历方式和使用迭代器来遍历是一样的。