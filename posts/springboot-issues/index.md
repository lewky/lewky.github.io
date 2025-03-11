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

## 获取请求的来源IP

```java
RequestAttributes attributes = RequestContextHoider.getRequestAttributes();
if (attributes instanceof ServletRequestAttributes) {
    HttpServletRequest request =((ServletRequestAttributes) attributes).getRequest();
    String ipAddress = request.getHeader("X-Forwarded-For");
    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
        ipAddress = request.getHeader("X-Real-IP");
    }
    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
        ipAddress = request.getRemoteAddr();
    }
    // 处理多个IP的情况（例如：X-Forwarded-For: client, proxy1, proxy2）
    if (ipAddress != null && ipAddress.contains(",")) {
        ipAddress = ipAddress.split(",")[0].trim();
    }
}
```

## 参考链接

* [springboot 日志管理logback切换log4j2](https://blog.csdn.net/jianghuafeng0/article/details/109115606)