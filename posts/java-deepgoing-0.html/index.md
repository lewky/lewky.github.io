# Java深入系列(0) - 基础篇

## 前言

本文主要汇总Java深入学习过程中遇到的一些不好归类的基础问题。

## 方法重载

### 什么是方法重载？为什么不能根据返回类型来区分重载？

方法的重载和重写都是实现多态的方式，区别在于前者实现的是编译时的多态性，而后者实现的是运行时的多态性。

重载发生在一个类中，同名的方法如果有不同的参数列表（参数类型不同、参数个数不同或者二者都不同）则视为重载。为什么这里不包括返回类型呢？很简单，如果只是返回类型不同，是无法区分开来的，如下：
<!--more-->
```java
float max(int a, int b);
int max(int a, int b);
```

在调用上述两个方法的时候，可以不用返回值，那么你怎么区分调用的是哪个方法？

在《深入理解Java虚拟机》中，6.3.6章节有这样一段：
>在Java语言中，要重载一个方法，除了要与原方法具有相同的简单名称之外，还要求必须拥有一个与原方法不同的特征签名；
>
>特征签名就是一个方法中各个参数在常量池中的字段符号引用的集合，也就是因为返回值不会包含在特征签名之中，因此Java语言里面是无法仅仅依靠返回值的不同来对一个已有方法进行重载。
>
>但在Class文件格式之中，特征签名的范围更大一些，只要描述符不是完全一致的两个方法也可以共存。
>
>也就是说，如果两个方法有相同的名称和特征签名，但返回值不同，那么也是可以合法存于同一个Class文件中的。

### Class文件中同方法名、同参数、不同返回值可以，那为什么Java文件中不行呢？

因为Java语言规范的规定，所以编译时会出现错误。

那为什么Class文件可以呢？因为Java虚拟机规范和Java语言规范不同，两者是分开的。

如有更多兴趣，可以看看这篇文章：[Java语言层面和JVM层面方法特征签名的区别 及 实例分析](https://blog.csdn.net/tjiyu/article/details/53891813)

## switch

### 为什么switch不支持long

在 Java 语言规范里中，有说明 switch 支持的类型有：char、byte、short、int、Character、Byte、Short、Integer、String、enum。

为什么只支持上面几种？int、String 都可以，为什么不支持 long ？

原因就是 switch 对应的 JVM 字节码 `lookupswitch`、`tableswitch` 指令**只支持 int 类型**。

下面是 JVM 规范中的说明（https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-3.html#jvms-3.10）：

>The Java Virtual Machine's `tableswitch` and `lookupswitch` instructions operate only on `int` data. Because operations on `byte`, `char`, or `short` values are internally promoted to `int`, a `switch` whose expression evaluates to one of those types is compiled as though it evaluated to type `int`. If the `chooseNear` method had been written using type `short`, the same Java Virtual Machine instructions would have been generated as when using type `int`. Other numeric types must be narrowed to type `int` for use in a `switch`.

byte、char、short 类型在编译期默认提升为 int，并使用 int 类型的字节码指令。所以对这些类型使用 switch，其实跟 int 类型是一样的。

### 为什么可以支持 String？

switch 支持 String 其实就是语法糖。编译器会根据字符串的 hashCode 来处理。

例：
```java
String a = "aa";
switch (a) {
  case "aa":
    System.out.println("111");
    break;
  case "AaAa":
    System.out.println("222");
    break;
  case "AaBB":
    System.out.println("333");
    break;
}
```

反编译后：
```java
String var1 = "aa";
byte var3 = -1;
switch(var1.hashCode()) { // 第一个switch，根据hashCode计算第二个switch内的位置
  case 3104:
    if (var1.equals("aa")) {
      var3 = 0;
    }
    break;
  case 2031744:
    if (var1.equals("AaBB")) {
      var3 = 2;
    } else if (var1.equals("AaAa")) {
      var3 = 1;
    }
}

switch(var3) { // 第二个switch，执行原switch的逻辑
  case 0:
    System.out.println("111");
    break;
  case 1:
    System.out.println("222");
    break;
  case 2:
    System.out.println("333");
}
```

可以发现，会先根据 hashCode 找出原始 switch 内的位置，再执行原代码逻辑。

### 为什么用两个 switch ？

是为了减少编译器的工作。

比如 switch 内有的 case 不写 break 等复杂情况，如果想直接根据 hashCode + equals 来只生成一个 switch，编译器就需要考虑各种情况。

所以目前编译器只做位置映射，第二部分直接按原 switch 来生成了。

## 三元运算符隐含的坑

### 三元表达式导致的空指针异常

某天发现系统报空指针异常，追踪异常栈后发现源头处是一个非常简单的三元表达式，如下：
```java
Integer age = user != null ? user.getAge() : 0;
```

咋看上去好像看不出什么问题，然而当user对象里的age变量为null时，就会触发NPE。原因是三元表达式的其中一条表达式的返回值为基础数据类型时，如果另一个表达式的返回值是包装类，则会自动拆箱。

比如这里的`user.getAge()`返回的是`Integer`，由于另一个表达式是0，当`user != null`是true的时候，左边的表达式就变成了`user.getAge().intValue()`，如果user对象里的age变量为null时，就会触发NPE。

如果想避免三元表达式由于拆箱导致的NullPointerException，可以改成如下：
```java
Integer age = user != null ? user.getAge() : new Integer(0);
```

### 三元表达式的隐式类型转换

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

以上结果基于jdk8，另外对于char和int的加法等运算，运算结果会自行转为int类型；**但是在三元表达式中两个表达式返回值分别为char和int时，若返回int类型返回值会转型为char。**

## String的intern方法

String#intern()是一个本地方法，用来将字符串放入常量池，在不同的jdk有不同的实现区别：

* 在jdk1.6及以前：当字符串在常量池存在时，则返回常量池中的字符串；当字符串在常量池不存在时，则**在常量池中拷贝一份**，然后再返回常量池中的字符串。
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

## 静态代码块、构造代码块和代码块

### 静态代码块

```java
static{
	//do something
}
```

静态代码块如上所示，和静态变量、静态方法一样，在类被类加载器首次加载时被执行，之后就不会被再次执行了(除非类加载器卸载该类后重新加载这个类)。

当有多个静态代码块时按顺序执行。

### 构造代码块

```java
public class Test{
	{
		//do something
	}
}
```

和静态代码块类似，但是没有`static`，只能出现在类中，若出现在某个方法中则是普通代码块。

构造代码块会在new实例对象时，优先于构造方法调用，也就是说，先执行完构造代码块，才会接着执行构造方法。如果在一个构造方法里调用了另一个构造方法，此时构造代码块只会被执行一次，而不是执行两次。

当有多个构造代码块时按顺序执行。

### 代码块

```java
public class Test{
	public static void main(String[] args){
		{
			//do something
		}
	}
}
```

和构造代码块类似，但是只在方法或语句中出现，执行顺序和普通语句一样，先出现就先执行。

局部代码块是为了缩短变量的生命周期，定义在局部代码块中的变量在出了代码块之后就结束其生命周期，释放内存。

### 总结

执行顺序：（优先级从高到低）

>静态代码块>main方法>构造代码块>构造方法

其中静态代码块只执行一次，构造代码块在每次创建对象是都会执行。

下面是一道与之相关的题目，执行下边的Test类，其输出的结果是什么？

```java
public class Test{
	static Test test = new Test(1);

	static{
		System.out.println("static code block");
	}

	{
		System.out.println("constructor code block");
	}

	Test(){
		System.out.println("constrctor method");
		System.out.println("a=" + a + ",b=" + b);
		a++;
		b++;
	}

	Test(int a){
		this();
		this.a = a;
		System.out.println("constrctor method2");
		System.out.println("a=" + a + ",b=" + b);
	}

	public static void main(String[] args){
		{
			System.out.println("code block");
		}

		method();

		Test test2 = new Test();
		method();
	}

	public static void method(){
		System.out.println("static method");
	}

	int a = 10;
	static int b = 100;
}
```

答案如下：

```java
constructor code block
constrctor method
a=10,b=0
constrctor method2
a=1,b=1
static code block
code block
static method
constructor code block
constrctor method
a=10,b=100
static method
```

## 参考链接

* [深入 -- 为什么不能根据返回类型来区分重载？](https://blog.csdn.net/simba_cheng/article/details/80835646)
* [为什么switch不支持long](https://www.cnblogs.com/eycuii/p/11470950.html)
* [java三元运算符详解](https://www.cnblogs.com/itmlt1029/p/4756331.html)
* [Java中三元运算符值得注意的地方](https://blog.csdn.net/shikaiwencn/article/details/50443495)
* [不同JDK版本中String.intern()方法的区别](https://blog.csdn.net/Game_Zmh/article/details/101701708)
* [JAVA中intern()方法的详解](https://blog.csdn.net/tangyaya8/article/details/79240071)
* [Java不同版本的intern()方法区别](https://blog.csdn.net/sunlihuo/article/details/105275431)
* [深入分析String.intern和String常量的实现原理](https://www.jianshu.com/p/c14364f72b7e)