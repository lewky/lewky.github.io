# Spring问题汇总

## SpelEvaluationException: EL1030E

运行Spring项目时报错如下：

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

而之所以之前没能发现这个问题，是因为没有启用redis cache，导致避开了这个问题。目前刚开始了解`spel`这门表达式语言，在此记录下这个问题，方便日后回顾分析，参考链接里顺便贴上官方的一篇中译文档。

## `@PathVariable`会截断字符串中最后一个`.`

当使用了`@PathVariable`接收参数时，如果该参数的值包含有`.`这个符号，则最后的`.`以及之后的字符串会被截断。举个简单的例子，代码如下：

```java
@GetMapping(value = "/users/{loginId}", produces = Constants.REQUEST_BODY_TYPE_APP_JSON)
public UserDto getLatestUserByLoginId(@PathVariable final String loginId) throws DocumentNotFoundException {
    final UserDto result = userDocumentService.findDtoByLoginIdAndIsLatest(loginId);
    return result;
}
```

* 当请求是`/users/lewis.liu`时，`loginId`参数接收到的值是`lewis`；
* 当请求是`/users/lewis.liu.p`时，`loginId`参数接收到的值是`lewis.liu`；
* 当请求是`/users/lewis.liu.p.w`时，`loginId`参数接收到的值是`lewis.liu.p`。

可以发现，`@PathVariable`注解会自动截断最后一个`.`以及之后的字符串。这是因为Spring认为最后一个`.`以及之后的字符串属于文件扩展类型，比如`.java`之类的，所以就自动将其截断了。

解决这个问题可以在请求的变量占位符里加上正则表达式，如下：

```java
// 原来的写法
@GetMapping(value = "/users/{loginId}", produces = Constants.REQUEST_BODY_TYPE_APP_JSON)

// 改后的写法
@GetMapping(value = "/users/{loginId:.+}", produces = Constants.REQUEST_BODY_TYPE_APP_JSON)
```

## 获取当前项目部署在Tomcat中的路径

```java
import javax.servlet.ServletContext;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.WebApplicationContext;


WebApplicationContext webApplicationContext = ContextLoader.getCurrentWebApplicationContext();
ServletContext servletContext = webApplicationContext.getServletContext();
String contextPath = servletContext.getContextPath();
```

## 参考链接

* [8. Spring 表达式语言 (SpEL)](http://itmyhome.com/spring/expressions.html#expressions-operator-safe-navigation)
* [Spring MVC @PathVariable with dot (.) is getting truncated](https://stackoverflow.com/questions/16332092/spring-mvc-pathvariable-with-dot-is-getting-truncated)