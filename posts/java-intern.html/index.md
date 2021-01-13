# Java - String的intern方法

## String#intern()

String#intern()是一个本地方法，用来将字符串放入常量池，在不同的jdk有不同的实现区别：

* 在jdk1.6及以前：当字符串在常量池存在时，则返回常量池中的字符串；当字符串在常量池不存在时，则**在常量池中拷贝一份**，然后再返回常量池中的字符串。<!--more-->
* 在jdk1.6以后（不包括jdk1.6）：当字符串在常量池存在时，则返回常量池中的字符串；当字符串在常量池不存在时，则**把堆内存中此对象的引用添加到常量池中**，然后再返回此引用。

从jdk不同版本的源码注释即可看出差别，如果是在jdk1.6及以前的版本，频繁调用intern方法创建不同字符串常量时，会出现常量池不断创建新的字符串，进而引发永久代内存溢出。因此，jdk1.6以后版本的intern方法可以有效的减少内存的占用，提高运行时的性能。

如果是jdk1.7及之后的版本，对于下面的例子：
```java
final String s1 = new StringBuilder("go").append("od").toString();
final String s2 = new StringBuilder("ja").append("va").toString();
System.out.println(s1.intern() == s1);
System.out.println(s2.intern() == s2);
```

你会发现，上述代码的输出结果如下：
```java
true
false
```

第一个是`true`可以理解，下面是分析过程：
1. 首先在创建s1字符串的时候，会先在常量池里添加两个字面量：`go`和`od`；最后s1指向的是堆中new出来的字符串对象`good`。
2. 调用`s1.intern()`时，会去常量池查找是否存在`good`这个字符串。查找的时候是通过`equals()`来比较的，此时常量池里不存在`good`这个字符串，所以会把s1这个引用放入常量池，然后返回该引用。
3. 此时`s1.intern() == s1`的结果自然就是true了。

第二个的结果却是`false`，这个就很让人困惑了。按道理应该结果也是`true`才对，既然是false，那就说明常量池原本就已经存在`java`这个字符串了。事实也是如此，这个字符串是在加载`sun.misc.Version`这个类时被放入常量池的，如下：
```java
public class Version
{
  private static final String launcher_name = "java";
  private static final String java_version = "1.8.0_144";
  private static final String java_runtime_name = "Java(TM) SE Runtime Environment";
  private static final String java_profile_name = "";
  private static final String java_runtime_version = "1.8.0_144-b01";
  
  public Version() {}
  ...
}
```

可以看到这里实际上存入了好几个字符串到常量池里，当然可能还有其他地方也存入了别的字符串。想更深入地了解intern()的底层实现，可以看看这篇文章：[深入分析String.intern和String常量的实现原理](https://www.jianshu.com/p/c14364f72b7e)。

## 参考链接

* [不同JDK版本中String.intern()方法的区别](https://blog.csdn.net/Game_Zmh/article/details/101701708)
* [JAVA中intern()方法的详解](https://blog.csdn.net/tangyaya8/article/details/79240071)
* [Java不同版本的intern()方法区别](https://blog.csdn.net/sunlihuo/article/details/105275431)
* [深入分析String.intern和String常量的实现原理](https://www.jianshu.com/p/c14364f72b7e)