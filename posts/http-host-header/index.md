# HttpURLConnection设置host请求头无效

## 问题与解决方案

由于业务需要在调用第三方SDK时需要设置host请求头为对方的域名，在测试时发现代码设置后依然无法生效。查找资料后发现是从JDK6的6u23版本开始就对HTTP的部分请求头做了限制，如下：<!--more-->

```java
private static final String[] restrictedHeaders = {
    /* Restricted by XMLHttpRequest2 */
    //"Accept-Charset",
    //"Accept-Encoding",
    "Access-Control-Request-Headers",
    "Access-Control-Request-Method",
    "Connection", /* close is allowed */
    "Content-Length",
    //"Cookie",
    //"Cookie2",
    "Content-Transfer-Encoding",
    //"Date",
    "Expect",
    "Host",
    "Keep-Alive",
    "Origin",
    // "Referer", 
    // "TE",
    "Trailer",
    "Transfer-Encoding",
    "Upgrade",
    //"User-Agent",
    "Via"
    };

    allowRestrictedHeaders = ((Boolean)java.security.AccessController.doPrivileged(
        new sun.security.action.GetBooleanAction(
            "sun.net.http.allowRestrictedHeaders"))).booleanValue();
```

可以通过设置JVM启动参数`-Dsun.net.http.allowRestrictedHeaders=true`，或者在启动类里加上代码`System.setProperty("sun.net.http.allowRestrictedHeaders", "true")`来解决这个问题。

实际上在发送HTTP请求时如果URL是用的域名，就已经将host请求头设置为该域名了，当然也可以手动设置成其他域名。有时候项目部署在内网，无法直接发送请求到对方域名，而是发送到代理IP上，而对方又对请求域名进行了检测和限制，此时就只能用上述方式来解除限制并在代码中设置host属性了。

## 参考链接

* [HttpURLConnection 设置Host 头部无效](http://t.zoukankan.com/skyaccross-p-2828986.html)
* [如何在HttpURLConnection中覆盖http-header"Host"？](https://qa.1r1g.com/sf/ask/636789121/)