# Java - 一道关于Arrays.asList的题目

## 题目

有这样一道有趣的题目：
```java
final int[] test = new int[]{1,2,3,4};
final Integer[] test2 = new Integer[]{1,2,3,4};
final List list1 = Arrays.asList(test);
final List list2 = Arrays.asList(test2);
final List list3 = Arrays.asList(1,2,3,4);
System.out.println(list1.size());
System.out.println(list2.size());
System.out.println(list3.size());
```
<!--more-->

对于上边的3个size()，输出的结果如下：
```java
1
4
4
```

这道题考察的是`Arrays.asList()`这个api以及泛型的知识点，工作时用到该api的情景也挺多的。下面分析下，为什么是这个答案。

## 分析

对于list1，为什么size是1？
这是因为Arrays.asList如果传入的数组是基础数据类型的数组时，会将整个数组作为一个对象来构建ArrayList，所以size是1。在源码实现中：

```java
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}

private static class ArrayList<E> extends AbstractList<E>
    implements RandomAccess, java.io.Serializable
{
    private static final long serialVersionUID = -2764017481108945198L;
    private final E[] a;

    ArrayList(E[] array) {
        a = Objects.requireNonNull(array);
    }

    @Override
    public int size() {
        return a.length;
    }
    ……
}
```

可以看到，Arrays.asList的形参是可变参数`T... a`，等同于一个数组参数`T[]`。这里的`T`是泛型。在调用该api时，会直接用传入的参数来构建一个ArrayList。

这个`ArrayList<E>`是Arrays的静态内部类，同样使用了泛型，而泛型是不支持基础数据类型的。

当传入的参数是一个基础数据类型的数组时，就把整个数组对象解析为泛型T；如果传入的参数是一个对象类型的数组，就把数组中的对象类型解析为泛型T。如下：

```
传入的参数是int[]时：
int[] -> T[]中的T，此时Arrays.asList()返回的是一个size为1的ArrayList<int[]>


传入的参数是Integer[]时：
Integer[] -> T[]，此时Arrays.asList()返回的是一个ArrayList<Integer>，其size的值与Integer[]的length一样
```

因此，题目里的list1和list2的size会不一样。那为什么直接传入`1,2,3,4`这四个int参数所得到的结果又是4呢？

这是因为当直接传入参数为基础数据类型时，由于方法形参是泛型数组，于是就通过自动装箱把基础数据类型的参数包装为对应的包装类。比如传入的是int，就自动装箱成Integer，这样就能被泛型所接收了。

也就是说，虽然传入参数是`1,2,3,4`，其实会通过自动装箱变成一个`Integer[]`参数，然后传递给`T[]`，最后返回的就是一个`ArrayList<Integer>`。

下面是一个可以证明该过程的例子：
```java
public static void main(final String[] args) {
    final int[] array1 = new int[]{1,2,3,4};
    final Integer[] array2 = new Integer[]{1,2,3,4};

    test(array1);
    test(array2);
    test(1,2,3,4);
}

public static <T> void test(final T... a) {
    System.out.println(a.length);
}
```

其结果如下：
```java
1
4
4
```

## Arrays.asList的其他知识点

由于Arrays.asList返回的是Arrays的静态内部类`ArrayList`，这个ArrayList并没有重写add和remove方法的。也就是说，这个ArrayList一旦new出来了，其大小就固定下来了，不能再调用add或者remove方法了，否则就会报错如下：
```java
Exception in thread "main" java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
```

虽然不能调用add或者remove，但可以调用set、contains、sort等其他的方法，也可以进行遍历。

如果我们确实需要调用add或者remove方法，可以有以下方法：

### 方法一

遍历Arrays.asList返回的集合，然后一个个添加到我们常用的集合里，比如`java.util.ArrayList`。

### 方法二

使用`list.addAll(Arrays.asList(a))`，直接把Arrays.asList返回的集合给整个添加到新的集合里。

### 方法三

可以直接通过`new ArrayList<>(Arrays.asList(a))`的方法来构建一个有着完善功能的集合。

### 方法四

使用`Collections.addAll()`来替代`Arrays.asList()`，这样得到的就是一个有着完善功能的集合。

## 泛型(Generics)的知识点

>泛型的定义：在程序中我们将一个对象放入集合中，但是集合不会记住对象的类型，当我们在次使用对象的时候，对象变为Object类型，而程序中还是原来的类型，我们必须要自己转换其类型，为了解决这个问题，则提出泛型。

泛型要求包容的是对象类型，而八种基础数据类型不属于对象类型，但是它们有对应的封装类/包装类。并且在调用函数时，会根据参数类型来进行自动装箱或者自动拆箱(Autoboxing and unboxing)。对自动装箱/拆箱有兴趣的可以参考下边的链接。

## 参考链接

* [将数组转换成集合Arrays.asList，不可进行add和remove操作的原因](https://blog.csdn.net/qq_34115899/article/details/80513271)
* [为什么泛型类的类型不能是基本数据类型](https://blog.csdn.net/likun1239656678/article/details/84294606)
* [Java 自动装箱与拆箱(Autoboxing and unboxing)](https://www.cnblogs.com/jaysir/p/5399086.html)