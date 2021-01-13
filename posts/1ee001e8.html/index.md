# Spring异常 - SpelEvaluationException: EL1030E

## 问题与分析

在本地开发项目时发现报错如下：

```java
org.springframework.expression.spel.SpelEvaluationException: EL1030E: The operator 'ADD' is not supported between objects of type 'java.lang.String' and 'null'
	at org.springframework.expression.spel.ExpressionState.operate(ExpressionState.java:240)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:80)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:85)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.SpelNodeImpl.getValue(SpelNodeImpl.java:109)
	at org.springframework.expression.spel.standard.SpelExpression.getValue
....
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1415)
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:745)
```

<!--more-->
从堆栈信息可以看出，该异常与`spel`有关。`spel`指的是`Spring Expression Language`，结合问题代码进行分析，可以认为该异常与spring表达式有关。而在我的代码里，只有`@Cacheable`注解里使用到了`spel`，如下：
```java
    @Cacheable(key = "#root.target.getCacheKeyPrefix() + '::' + + #root.target.getRootDomain() + '-' + #root.target.getLocale() + '-' + #searchLabelKey")
    public String getFromRootDomain(final String labelId, final String locale, final String searchLabelKey) {
        
		// TODO
        return null;
    }
```

很显然，在使用到该注解时，由于这里的spring表达式有问题，最终在解析时抛出了异常。经过检查发现，这里犯了个很逗的错误，就是连续使用了两个`+`，导致解析无法通过，改正后如下：

```java
@Cacheable(key = "#root.target.getCacheKeyPrefix() + '::' + #root.target.getRootDomain() + '-' + #root.target.getLocale() + '-' + #searchLabelKey")
```

而之所以之前没能发现这个问题，是因为没有启用redis cache，导致避开了这个问题。目前刚开始了解`spel`这门表达式语言，在此记录下这个问题，方便日后回顾分析，下面顺便贴上官方的一篇中译文档。

## 参考链接

* [8. Spring 表达式语言 (SpEL)](http://itmyhome.com/spring/expressions.html#expressions-operator-safe-navigation)