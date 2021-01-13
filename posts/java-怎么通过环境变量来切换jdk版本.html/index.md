# Java - 怎么通过环境变量来切换jdk版本

## 问题与分析

我在本地安装了1.7和1.8两个版本的jdk，此时我的JAVA_HOME环境变量配置的是jdk1.8，在cmd窗口输入`java -version`发现报错如下：

```
C:\Users\Lewis>java -version
Error: Registry key 'Software\JavaSoft\Java Runtime Environment'\CurrentVersion'
has value '1.8', but '1.7' is required.
Error: could not find java.dll
Error: Could not find Java SE Runtime Environment.
```
<!-- more -->

接着输入`javac -version`则是正常：
```
C:\Users\Lewis>javac -version
javac 1.8.0_191
```

javac命令能正常执行， 说明我配置的CLASSPATH变量和JAVA_HOME变量正确。而java命令报错，则说明PATH变量有问题。cmd窗口在执行命令时会去PATH变量的值里寻找路径，当找到对应的路径后就不会再继续查找下去。

所以我们应该把java相关的路径放到PATH变量值的最前面，需要注意的是，如果你安装了Oracle，你会发现Oracle的环境变量会直接排到最前面，也就是说，这时候会优先去Oracle指定的目录下寻找java的命令。

但只是将java路径放置到最前面还是不够的，因为WINDOW本身系统SYSTEM32里面的环境变量加载等级要优先于用户设置的环境变量，所以我们还需要将`C:\Windows\System32`目录下的`java.exe、javaw.exe、javaws.exe`三个程序删掉或者重命名才行。

## 解决方案

1. 将PATH环境变量的变量值里的java路径放置到最前面；
2. 将`C:\Windows\System32`目录下的`java.exe、javaw.exe、javaws.exe`三个程序删掉或者重命名。

接下来进行测试，会发现`java -version`得到了正确的结果：
```
C:\Users\Lewis>java -version
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

接着将JAVA_HOME改为jdk1.7的目录，再一次测试java和javac命令，都能得到正确的结果。

## 参考链接

* [切换JDK版本时修改JAVA_HOME环境变量不生效](https://blog.csdn.net/wandrong/article/details/77573945)
