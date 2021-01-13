# 如何获取更多关于序列化异常的堆栈信息

## 问题与解决方法

有时候我们的系统会报`java.io.NotSerializableException`，根据堆栈信息又无法得出有用的信息，无法找到具体是因为哪些类或者变量造成的，可以使用一个java参数`-Dsun.io.serialization.extendedDebugInfo=true`来得到更加具体的序列化信息。

从jdk6开始就可以使用该参数，可以在启动java程序时启用该参数，也可以在项目的一开始通过代码来启用：
```java
System.setProperty("sun.io.serialization.extendedDebugInfo", "true");
```
<!--more-->
下边是stackoverflow上找到的两个回答：
### 回答其一

>From JDK6 you should be able to get extra information by setting the sun.io.serialization.extendedDebugInfo system property:
>`-Dsun.io.serialization.extendedDebugInfo=true`

### 回答其二

>Set the system property `sun.io.serialization.extendedDebugInfo` to `true`, either by adding`-Dsun.io.serialization.extendedDebugInfo=true`to the command line, or add the line `System.setProperty("sun.io.serialization.extendedDebugInfo", "true");` at the start of your program.
>If something isn't serializable, this will cause a trace of the path through the data structure that leads from the "root" object (the one passed to ObjectOutputStream.writeObject()) to the object that's not serializable. At least, it'll tell you the class names of the instances and the fields that lead to the non-serializable object.

## 参考链接

* [Locating Serialization Issue in Complex Bean](https://stackoverflow.com/questions/627389/locating-serialization-issue-in-complex-bean/627437#627437)
* [
cannot find source of NotSerializableException](https://stackoverflow.com/questions/26615682/cannot-find-source-of-notserializableexception/26666238#26666238)
