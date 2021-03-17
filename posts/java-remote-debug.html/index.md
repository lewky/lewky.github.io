# Java的远程调试Remote Debug

## 前言

一般开发项目时可以直接本地借助IDE工具进行debug调试，但对于线上的项目，则需要借助Java提供的远程debug功能来进行调试。可以在启动项目前通过配置对应的JVM参数来启用远程debug，也可以把参数添加到Tomcat或者Jetty之类的启动脚本里。

## 配置JVM参数

```
-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n
```

参数说明：<!--more-->

* `-XDebug`：启用调试。
* `-Xnoagent`：禁用默认sun.tools.debug调试器。
* `-Djava.compiler=NONE`：禁止 JIT 编译器的加载，目的是提供远程debug的效率。
* `-Xrunjdwp`：加载JDWP的JPDA参考执行实例。JPDA为Java平台上的调试器定义了一个标准的体系结构。
* `transport`：用于在调试程序和 VM 使用的进程之间通讯。
* `dt_socket`：套接字传输，即socket通信。
* `dt_shmem`：共享内存传输，仅限于Windows平台。一般不用这种通信方式。
* `address`：远程debug监听的端口号。远程服务器要开放这个端口号，客户端才能远程连接上。
* `server`：值为`y`或`n`，VM是否需要作为调试服务器执行。设置为`y`后该程序才能作为服务器被我们的客户端(比如Eclipse)连接上。
* `suspend`：值为`y`或`n`，是否在调试客户端建立连接之后启动VM。简单来说，如果设置为`y`，程序就会在调试客户端连接进来之前一直挂起着不执行。一般都是设置为`n`，除非你的程序是启动后很快就执行完毕结束进程。

## Eclipse启用远程调试

Eclipse可以作为远程调试的客户端，在debug菜单里打开`Debug Configurations...`，找到`Remote Java Application`，右键点击`New`，然后给这个远程调试填写`Name`，选择对应需要被调试的项目`Project`。

`Connection Type`选择`Standard(Socket Attach)`，`Host`填写远程调试服务器的地址，`Port`填写远程调试的端口号。

最后点击`Debug`即可开始远程调试。

## 补充

### 启动参数中的-D是什么，-X又是什么

`-D`是在启动项目时用来设置系统属性值，如果值包含空格则需要用一对双引号包括起来。这些属性值可以在代码中用`System.getProperty(key)`来获取。我们可以用`-D`来随意设置需要的键值对，然后在代码中去获取。

`-X`是Java提供的非标准选项, 不同版本中可能有所更改，并且在更改后不会另行通知。

### 为什么要配置`-Djava.compiler=NONE`

一个Java程序在将代码编译为字节码后，在执行时由JVM解释为对应平台的机器码，然后再执行。JVM有两种技术来实现解释执行：转译器和JIT。

>转译器将每个Java指令都转译成对等的微处理器指令，并根据转译后的指令先后次序依序执行，由于一个Java指令可能被转译成十几或数十几个对等的微处理器指令，这种模式执行的速度相当缓慢。

>JIT针对一个具体的class进行编译，经过编译后的程序，被优化成相当精简的原生型指令码（native code）。但是，JIT也不是万能的，比如：某些极少执行到的Java指令在编译时所额外花费的时间可能比转译器在执行时的时间还长，这时候就不如直接使用转译器。

>所以，转译器和JIT各有优缺点。
1. 极少执行到或者执行次数较少的Java代码，使用转译器更划算。
2. 重复执行或者执行次数较多的Java代码，采用JIT更划算。

>我们一般debug程序的时候，只是关注其中的一部分代码，而且大部分情况下是设置断点，然后单步执行，而JIT的编译单位是class，只要我们执行了class里面的代码，JIT就会对整个class进行编译，而我们实际执行的代码一般都是其中的一部分代码，所以从整个时间效率上来看，采用JIT反而更费时间。也就是说在JVM远程调试这个事情上，禁用JIT（只使用转译器，解释一行执行一条）更合理，所以通过-Djava.compiler=NONE来禁止JIT。

## 参考链接

* [java debug suspend_【Java远程debug】](https://blog.csdn.net/weixin_39757169/article/details/114154161)
* [Java远程调试 java -Xdebug各参数说明](https://blog.csdn.net/lantian0802/article/details/40299377)
* [请问JVM远程调试的配置中为什么要配置-Djava.compiler=NONE](https://www.iteye.com/problems/89141)
* [java程序启动参数-D含义详解](https://www.cnblogs.com/grefr/p/6087955.html)
* [java x_Java -X命令](https://blog.csdn.net/weixin_36481965/article/details/114023667)