# Java Servlet问题汇总

## Cannot forward after response has been committe

之前在使用Servlet的时候，总是在 doGet()/doPost() 的最后一行才使用请求转发或者重定向。如果需要根据条件来判断进行不同的请求转发或者重定向，代码如下：

```java
@Override
protected void doGet(final HttpServletRequest req, final HttpServletResponse resp)
        throws ServletException, IOException {

    if (req.getSession().getAttribute(AttrConsts.LOGIN_USER) == null) {
        req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.LOGIN_PAGE).forward(req, resp);
    }
    req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.MAIN_PAGE).forward(req, resp);
}
```
<!--more-->
上边的代码在执行后会报如下异常：

```java
java.lang.IllegalStateException: Cannot forward after response has been committe
...
```

报异常的原因是重复转发或者重定向了请求，如果有多个转发或者重定向，需要在每个转发或者重定向请求之后加上return语句(最后一个请求转发或者重定向不需要加return)，如下：

```java
@Override
protected void doGet(final HttpServletRequest req, final HttpServletResponse resp)
        throws ServletException, IOException {

    if (req.getSession().getAttribute(AttrConsts.LOGIN_USER) == null) {
        req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.LOGIN_PAGE).forward(req, resp);
        return;
    }
    req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.MAIN_PAGE).forward(req, resp);
}
```

通过return语句确保在转发或者重定向请求之后返回，避免在执行上边的转发/重定向之后，接着继续往下执行转发/重定向请求，这样就不会再报这个异常了。

## web.xml中`classpath*:`与`classpath:`的区别

classpath对应src目录，该目录下的文件会在编译后被存放到WEB-INF文件夹下的classes目录。

`classpath`：只会到你的class路径中查找配置文件，对于多个同名的配置文件，只会加载找到的第一个文件；

`classpath*`：除了指定的class路径，还会到该class路径下的jar包中进行查找配置文件，对于多个同名的配置文件，都会被加载。

但是对于`classpath*`，无法使用模糊匹配的方式，可以通过逗号来隔开多个配置文件。

```xml
<context-param>  
    <param-name>contextConfigLocation</param-name>  
    <param-value>classpath*:applicationContext.xml,  
        classpath*:app-1.xml,  
        classpath*:app-2.xml,  
        classpath*:app-3.xml,  
        classpath*:app-4.xml  
    </param-value>  
</context-param> 
```

## 在一个`filter`配置多个`url-pattern`

如果想一个`filter`配置多个`url-pattern`，需要在`filter`标签后添加多个`filter-mapping`标签。因为一个`filter-mapping`标签里只能有一个`url-pattern`，不能直接把多个`url-pattern`配置到同一个`filter-mapping`标签里，也不能直接把多个url直接配置到一个`url-pattern`标签里。

正确地配置方式如下所示：

```xml
<filter> 
    <filter-name>test</filter-name> 
    <filter-class>com.test.TestFilter</filter-class> 
</filter>
<filter-mapping>
    <filter-name>test</filter-name> 
    <url-pattern>/test/a/*</url-pattern> 
</filter-mapping>
<filter-mapping> 
    <filter-name>test</filter-name> 
    <url-pattern>/test/b/*</url-pattern> 
</filter-mapping>
```

## 报错Invalid content was found starting with element 'init-param'

在web.xml中配置servlet节点时报错如下：

>cvc-complex-type.2.4.a: Invalid content was found starting with element 'init-param'. One of '{"http://java.sun.com/xml/ns/j2ee":run-as, "http://java.sun.com/xml/ns/j2ee":security-role-ref}' is expected.

原因是init-param节点不能放在load-on-startup节点的后面，将init-param节点放置到前边就不再报这个错误了：

```xml
<servlet>
    <servlet-name>resteasy-servlet</servlet-name>
    <servlet-class>
        org.jboss.resteasy.plugins.server.servlet.HttpServletDispatcher
    </servlet-class>

    <init-param>
        <param-name>javax.ws.rs.Application</param-name>
        <param-value>com.cbx.ws.rest.jaxrs.CbxApplication</param-value>
    </init-param>

    <load-on-startup>2</load-on-startup>
</servlet>
```

## 参考链接

[在Web.xml中自动扫描Spring的配置文件及resource时classpath*:与classpath:的区别](https://blog.csdn.net/wxwzy738/article/details/16983935)