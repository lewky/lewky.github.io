# Java - 序列化的注意点

## 1、使用serialVersionUID

在Eclipse中，如果一个类实现了Serializable接口，且没有给这个类设置一个serialVersionUID，就会有一个警告标志：

> The serializable class BaseEntity does not declare a static final serialVersionUID field of type long

<!--more-->
通过设置一个serialVersionUID可以解除该警告，虽然不设置该ID也可以，但若是实现了序列化，一定不能少这个serialVersionUID。之所以要设置该ID，原因如下：

> 序列化操作的时候系统会把当前类的serialVersionUID写入到序列化文件中，当反序列化时系统会去检测文件中的serialVersionUID，判断它是否与当前类的serialVersionUID一致，如果一致就说明序列化类的版本与当前类版本是一样的，可以反序列化成功，否则失败。

该serialVersionUID的值可以默认为1L，也可以用Eclipse直接生成。

```java
private static final long serialVersionUID = 5647613333522643572L;
```

## 2、静态变量不会被序列化

序列化顾名思义，就是将实例对象的各种信息/状态存储到本地，而静态变量是属于类的，则不会被序列化，注意：序列化是针对实例变量的，和静态变量和方法无关。

## 3、非静态的内部类必须实现序列化

* 如果被序列化的对象中存在非静态的内部类，该内部类必须实现序列化，否则会报异常
* 如果是静态内部类，则可以正常序列化外部类的实例对象

## 4、如果实例变量是对象类型，则该对象类型的类必须实现序列化

序列化要求所有的成员变量都实现了Serializable，比如String类型的变量。

## 5、使用transient关键字阻止序列化实例变量

如果不想要将某个实例变量序列化，可以使用transient关键字来阻止其序列化。