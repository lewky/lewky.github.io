# web.xml中一个filter配置多个url-pattern

需要在filter标签后添加多个filter-mapping标签，一个url-pattern就对应一个filter-mapping标签，不能直接把多个url-pattern配置到同一个filter-mapping标签里，也不能直接把多个url直接配置到一个url-pattern标签里。
<!--more-->

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
