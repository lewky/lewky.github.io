# Java - Class版本号和UnsupportedClassVersionError

## 问题分析

Java是向下兼容的，每一个jdk版本都有对应的class版本号(major + minor version numbers)；如果用低版本的jvm去加载高版本jdk编译的类，就会报错：`java.lang.UnsupportedClassVersionError`
<!--more-->

源码中关于这个UnsupportedClassVersionError的注释如下：

```java
/**
* Thrown when the Java Virtual Machine attempts to read a class
* file and determines that the major and minor version numbers
* in the file are not supported.
*
* @since 1.2
*/
```

## Java版本对应的Class版本号

|Java版本|Class版本|
|-|-|
|JDK1.0.2|45.0~45.3|
|JDK1.1|45.0~46.0以下|
|J2SE1.2|46.0|
|J2SE1.3|47.0|
|J2SE1.4|48.0|
|JavaSE5|49.0|
|JavaSE6|50.0|
|JavaSE7|51.0|
|JavaSE8|52.0|

## 解决方法

把类重新用当前的jdk版本去编译，只要确保jvm的版本比类版本号相同或更高就可以了。

## 参考链接

* [Class版本号和Java版本对应关系](https://blog.csdn.net/qiao_198911/article/details/52122369)
