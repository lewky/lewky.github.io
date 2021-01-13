# Jetty - Unable to compile class for JSP

## 问题与分析

在启动公司项目时发现报错如下：

```java
    [jetty] 2019-10-07 10:28:28.760:WARN:org.apache.jasper.compiler.Compiler:Error compiling file: D:\lewis.liu\CBX_KME\Program\jetty-temp\main\jsp\org\apache\jsp\invalidatePrevSession_jsp.javanull
    [jetty] 2019-10-07 10:28:28.763:WARN::/main/invalidatePrevSession.jsp
    [jetty] org.apache.jasper.JasperException: PWC6033: Unable to compile class for JSP||PWC6199: Generated servlet error:|The import com.core.cbx.ui.zk.cul.grid.renderer.FileLinkCellRenderer cannot be resolved||
    [jetty]     at org.apache.jasper.compiler.DefaultErrorHandler.javacError(DefaultErrorHandler.java:123)
    [jetty]     at org.apache.jasper.compiler.ErrorDispatcher.javacError(ErrorDispatcher.java:296)
    [jetty]     at org.apache.jasper.compiler.Compiler.generateClass(Compiler.java:376)
    [jetty]     at org.apache.jasper.compiler.Compiler.compile(Compiler.java:437)
    [jetty]     at org.apache.jasper.JspCompilationContext.compile(JspCompilationContext.java:608)
    [jetty]     at org.apache.jasper.servlet.JspServletWrapper.service(JspServletWrapper.java:360)
    [jetty]     at org.apache.jasper.servlet.JspServlet.serviceJspFile(JspServlet.java:486)
    [jetty]     at org.apache.jasper.servlet.JspServlet.service(JspServlet.java:380)
    [jetty]     at javax.servlet.http.HttpServlet.service(HttpServlet.java:820)
```

<!--more-->
非常直观的错误，在启动项目时，jetty报错，无法编译`invalidatePrevSession.jsp`该文件，原因是`FileLinkCellRenderer`这个类无法被解析。接着看该jsp文件，可以发现import了不少java类，如下：

```java
<%@page import="com.core.cbx.action.ActionDispatcher"%>
<%@page import="com.core.cbx.action.exception.ActionException"%>
<%@page import="com.core.cbx.action.actionContext.UserRegisterIp"%>
<%@page import="org.apache.commons.lang3.BooleanUtils" %>
<%@page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@page import="com.core.cbx.ui.zk.cul.grid.renderer.FileLinkCellRenderer"%>
<%@page import="com.core.cbx.resource.service.LabelManager"%>
```

那么问题来了，为什么只有`FileLinkCellRenderer`无法被解析？其它类却可以正常导入？继续查看这个无法导入的类，发现使用了Lambda表达式，将这些Lambda表达式注释掉，重新启动项目，发现不再发生上述错误，这说明JSP页面之所以无法被编译，正是由于导入的Java类中使用了Lambda表达式！

Lambda表达式是jdk1.8的新特性，而项目使用使用的是jetty6.1.26，在查询资料后了解到，这和jetty版本有关系。低版本的jetty并不支持jdk1.8，所以在编译JSP时，如果导入了使用到jdk1.8新特性的java文件就会报错。官网上虽然给出了jetty和jdk对应的版本关系，但并不是很准确。根据本人测试，在使用`9.2.20.v20161216`的jetty-maven插件时就不会遇到这个问题了。

## 解决方法

### 方案一：使用更高版本的支持jdk1.8的jetty

改用至少9.2版本的jetty来启动项目，如果是maven项目，则可以使用如下版本的jetty插件：
```xml
<plugin>
    <groupId>org.eclipse.jetty</groupId>
    <artifactId>jetty-maven-plugin</artifactId>
    <version>9.2.20.v20161216</version>
    <configuration>
</plugin>
```

### 方案二：不使用jdk1.8的新特性，譬如Lambda表达式

根据具体报错，将JSP里导入的java文件中有关的jdk1.8的新特性去掉，可以规避低版本jetty无法编译JSP文件的问题。

## 参考链接

* [jetty各版本与JDK的对应关系](https://blog.csdn.net/gsls200808/article/details/79426793)
* [Jetty Maven 和JDK之间版本关系](https://blog.csdn.net/andymu077/article/details/52439975)
* [页面报错500：无法为jsp编译解析类](https://blog.csdn.net/qq_38266019/article/details/79907084)
