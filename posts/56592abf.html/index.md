# web.xml中classpath*:与classpath:的区别

## `classpath*:`与`classpath:`

classpath对应src目录，该目录下的文件会在编译后被存放到WEB-INF文件夹下的classes目录。

classpath：只会到你的class路径中查找配置文件，对于多个同名的配置文件，只会加载找到的第一个文件；

classpath*：除了指定的class路径，还会到该class路径下的jar包中进行查找配置文件，对于多个同名的配置文件，都会被加载。
<!--more-->

但是对于classpath*，无法使用模糊匹配的方式，可以通过逗号来隔开多个配置文件。

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

## 参考链接：

[在Web.xml中自动扫描Spring的配置文件及resource时classpath*:与classpath:的区别](https://blog.csdn.net/wxwzy738/article/details/16983935)