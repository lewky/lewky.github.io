# Maven - 依赖范围和传递性依赖

## Maven的依赖范围

在pom.xml文件中，有个节点是scope，用来表示依赖的范围。之所以会有依赖范围，是因为Maven在编译、测试和运行项目时会各自使用一套classpath，依赖范围就是用来控制这三种classpath的。

简单来说，就是通过scope节点来控制项目的依赖是在编译时导入，还是在测试或运行项目时才导入。
<!--more-->

## scope的值

### compile

编译依赖范围。如果没有指定，就会默认使用该依赖范围。使用此依赖范围的Maven依赖，对于编译、测试、运行三种classpath都有效。典型的例子是spring-core，在编译，测试和运行的时候都需要使用该依赖。

### provided

已提供依赖范围。使用此依赖范围的Maven依赖，对于编译和测试classpath有效，但在运行时无效。典型的例子是servlet-api，编译和测试项目的时候需要该依赖，但在运行项目的时候，由于容器已经提供，就不需要Maven重复地引入一遍。

### runtime

运行时依赖范围。使用此依赖范围的Maven依赖，对于测试和运行classpath有效，但在编译时无效。典型的例子是JDBC驱动实现，项目主代码的编译只需要JDK提供的JDBC接口，只有在执行测试或者运行项目的时候才需要实现上述接口的具体JDBC驱动。

### test

测试依赖范围。使用此依赖范围的Maven依赖，只对于测试classpath有效，在编译、运行时无效。典型的例子就是JUnit，它只有在编译测试代码及运行测试的时候才需要。

### system

系统依赖范围。该依赖范围与provided所表示的依赖范围一致，对于编译和测试classpath有效，但在运行时无效。只是使用system范围依赖时必须通过systemPath元素显式地指定依赖文件的路径。由于此类依赖不是通过Maven仓库解析的，而且往往与本机系统绑定，可能造成构建的不可移植，因此应该谨慎使用，systemPath元素可以引用环境变量。

## Maven的传递性依赖

### 什么是传递性依赖

有时候我们在pom.xml文件中引入的依赖，其本身就需要依赖于其他的依赖，这时候我们不需要去考虑这些依赖，Maven会解析各个直接依赖的pom，将那些必要的间接依赖，以传递性依赖的形式引入到当前的项目中。

通过传递性依赖，我们可以在pom.xml文件中少写不少的依赖配置

### 传递性依赖的依赖范围

假如当前项目为A，A依赖于B，B依赖于C。此时称A对于B是第一直接依赖，B对于C是第二直接依赖，而A对于C是传递性依赖。只要知道B在A项目中的scope，就可以知道C在A中的scope。其依赖范围如下：

表格的第一列是B在A中的依赖范围，第一行是C在B中的依赖范围，交叉的格子是C在A中的依赖范围；下表中的`-`表示不传递依赖。

|&nbsp;|compile|provided|test|runtime|
|-|-|-|-|-|
|**compile**|compile|-|-|runtime|
|**provided**|provided|provided|-|provided|
|**runtime**|runtime|-|-|runtime|
|**test**|test|-|-|test|

## 总结

* 当C在B中的scope为test时，A不依赖C，C直接被丢弃
* 当C在B中的scope为provided时，只有当B在A中的scope也是provided时，A才会依赖C，这时候C在A的scope是provided
* 当C在B中的scope为compile或runtime时，A依赖C，此时C在A中的scope继承自B在A的scope。注意，如果C的scope是runtime，B的scope是compile，此时C在A的scope是runtime，而不是compile

## 参考链接

1. [Maven依赖规则和依赖范围](https://blog.csdn.net/zz210891470/article/details/70040419)
