# web.xml报错：Invalid content was found starting with element 'init-param'

## 问题与分析

在web.xml中配置servlet节点时报错如下：

>cvc-complex-type.2.4.a: Invalid content was found starting with element 'init-param'. One of '{"http://java.sun.com/xml/ns/j2ee":run-as, "http://java.sun.com/xml/ns/j2ee":security-role-ref}' is expected.

<!--more-->
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

