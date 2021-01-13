# Maven - StackOverflowError

## 问题与分析

今天发现服务器上的Jenkins在集成项目时报错，报错原因如下：
```
error compiling: java.lang.StackOverflowError -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
```
<!--more-->

还是头回遇到这种错误，由于Jenkins每天晚上都会自动集成当天提交的代码。之前一直编译正常，而今天编译报错，正好昨天我提交了代码上去。

很显然，这是由于我提交的代码造成的。一开始以为是项目代码有问题，比如无限递归之类的导致的堆栈溢出。但是在本地发现可以正常运行该Maven项目，无论是编译还是打包都一切正常。难道是Jenkins抽风了？于是重启了Jenkins任务去重新编译一次项目，结果再次挂了，报了同样的错误。

百度之后发现挺多人都遇到这种问题，原因也基本一样，都是因为jvm内存不足导致的堆栈溢出。仔细想想，确实很有可能，因为我在本地是通过eclipse来运行项目的，我在本地配置了足够的jvm参数；而服务器上则可能由于Jenkins同时运行多个任务，又或者配置的内存不够，所以就编译报错了。

再一次审视我昨晚提交的代码，发现在一个测试类里，有个方法调用了非常多的api，这个方法的方法体里大概调用了四百多个api。之所以会方法体这么长，是因为该方法用来测试某个pojo类里的字段是否和数据库里的字段能否匹配上。因为pojo里的字段有四百多个，所以就导致该方法体如此之冗长了。

也就是说，很有可能是该方法导致Jenkins在运行该测试类的该方法时调用api过多导致堆栈溢出了。于是重新修改了代码，将该方法里调用的api分别放到了另外两个方法里，大概一个方法里调用两百个api，然后测试类原来的方法则调用这两个新添加的方法。

之后提交代码，重新让Jenkins集成代码，发现不再报错。

## 解决方法

和老大讨论之后，决定采用修改代码的方式去fix这个问题。可能是处于服务器内存紧张的考虑，又或者是别的什么因素，不采用网友博文里说的加大jvm参数的方案。

这里还是总结下这两个方案：

### 方案一

在项目的启动脚本里加大jvm参数，如下：
```
set MAVEN_OPTS=-Xss4096k
```

也可以不用设置得那么大，比如设置成下面这样：
```
set MAVEN_OPTS=-Xss2m
```

### 方案二

修改代码内某个调用了过多api的方法，可以将其一分为二，拆分成多个子方法，各自调用一部分的api，最后由原来的方法来call这几个拆分开来的子方法。总之，应当避免在一个方法内调用过多api。

## 其他

这里顺便贴一下公司项目设置的参数：
```
echo off
setlocal
set MAVEN_DEBUG_OPTS=-Duser.timezone=GMT+8 -Xdebug -Xmx4096M -XX:PermSize=128M -XX:MaxPermSize=512M -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=8088,server=y,suspend=n
mvn spring-boot:run
endlocal
```

## 参考链接

* [Maven执行install命令出现Exception in thread "main" java.lang.StackOverflowError](https://juejin.im/post/5ae4218a6fb9a07ac90cf586)
