# log日志中不打印异常栈的具体信息

## 问题与分析

最近在查项目的log时发现报了大量的NPE(NullPointerException)，诡异的是只log了Exception的类名，却没有具体的堆栈信息，以致于无法对该NPE异常进行准确定位。

这是因为jvm自身存在着优化机制，但一个同样的异常重复出现并被打印到log后，jvm可以不提供具体的堆栈信息来提高性能。关于这个的具体信息我们可以从官网上查到相关的资料：<!--more-->

<a href="http://www.oracle.com/technetwork/java/javase/relnotes-139183.html#vm" target="_blank">http://www.oracle.com/technetwork/java/javase/relnotes-139183.html#vm</a>

>The compiler in the server VM now provides correct stack backtraces for all "cold" built-in exceptions. For performance purposes, when such an exception is thrown a few times, the method may be recompiled. After recompilation, the compiler may choose a faster tactic using preallocated exceptions that do not provide a stack trace. To disable completely the use of preallocated exceptions, use this new flag: -XX:-OmitStackTraceInFastThrow.

谷歌翻译如下：

>服务器VM中的编译器现在为所有“冷”内置异常提供正确的堆栈回溯。出于性能目的，当抛出这样的异常几次时，可以重新编译该方法。重新编译之后，编译器可以使用不提供堆栈跟踪的预分配异常来选择更快的策略。要完全禁用预分配的异常，请使用以下新标志：-XX：-OmitStackTraceInFastThrow。

## 解决方案

有两个解决方案，第一个是安装官网说的，可以通过设置jvm的启动参数来关闭该策略：

```bash
-XX：-OmitStackTraceInFastThrow
```

另一个解决方案是不设置启动参数，直接重新启动服务器，比如Tomcat。重启服务器时jvm被重新启动，这样再遇到同样的Exception时就会打印出来，当然如果后续如果重复遇到同样的Exception还是无法打印出具体的异常栈信息。

当时我是选择了后者这个方案，因为如果启用了该参数会导致log日志太过庞大，也降低了性能，直接重启服务器，并快速定位bug以便于解决问题。

## 补充

如果想了解更多关于该参数的细节，可以参考下边的文章：
* [异常栈信息不见了之JVM参数OmitStackTraceInFastThrow](https://www.jianshu.com/p/cc1bd35466cb)