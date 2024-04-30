# SpringBoot问题汇总

## 使用Log4j2日志替代默认的Logback

SpringBoot默认使用Logback打印日志，出于性能考虑想要改用Log4j2，需要修改POM中的依赖，移除默认的Logback依赖：

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
 
<dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```
<!--more-->

## 参考链接

* [springboot 日志管理logback切换log4j2](https://blog.csdn.net/jianghuafeng0/article/details/109115606)