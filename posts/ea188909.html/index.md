# 如何正确地打印异常堆栈信息

## 前言

最近老大让我修改项目里所有和log有关的代码，之前我也用过log4j、slf4j或者Logback等日志框架/接口，一直以为打印异常信息就是简单地一句log.info()或者log.error()而已，没想到原来一直都使用错了，以至于有些错误信息没能在log文件中打印出堆栈信息，最终难以定位bug，排查困难。
<!--more-->

## 如何正确地打印异常的堆栈信息？

一般在catch到异常的时候，不要使用e.printStackTrace()来打印异常信息。我们使用日志框架来打印信息，一般来说，日志框架的log级别从低到高是：debug, info, warn, error, fatal。

对于异常，一般使用log.error()来打印堆栈信息。下边的三个log语句都打印了异常，但是写法却不一样，打印出来的效果也是不同的：
```
log.error("ERROR", "Error found: ", e);
log.error("ERROR", "Error found: " + e.getMessage());
log.error("ERROR", "Error found: " + e);
```

以下边的代码为例：
```
try {
     System.out.println(1/0);
} catch (final Exception e) {
    log.error("ERROR", "Error found: ", e);
    log.error("ERROR", "Error found: " + e.getMessage());
    log.error("ERROR", "Error found: " + e);
}
```

在log文件中可以发现输出是这样的：
```
2018-11-09 11:46:34,834 main ERROR com.lewis.test.TestLewis - Message: ERROR; Description: Error found: 
java.lang.ArithmeticException: / by zero
        at com.lewis.test.TestLewis.main(TestLewis.java:46)
2018-11-09 11:46:34,837 main ERROR com.lewis.test.TestLewis - Message: ERROR; Description: Error found: / by zero
2018-11-09 11:46:34,838 main ERROR com.lewis.test.TestLewis - Message: ERROR; Description: Error found: java.lang.ArithmeticException: / by zero 
```

对于第一个log语句，可以看到堆栈信息被打印了出来。
对于第二个log语句，只是打印出了异常的具体信息，既没有异常类名，也没有堆栈信息。
对于第三个log语句，打印出了异常的类名和具体信息，但是没有打印出来堆栈信息。

总结一下，就是我们应该使用第一种log语句的形式来将堆栈信息打印出来，方便日后定位bug，排除错误。
