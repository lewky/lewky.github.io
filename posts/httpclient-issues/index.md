# HttpClient问题汇总

## HttpURLConnection设置host请求头无效

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

实际上在发送HTTP请求时如果URL是用的域名，就已经将host请求头设置为该域名了，当然也可以手动设置成其他域名。

有时候项目部署在内网，无法直接发送请求到对方域名，而是发送到代理IP上，而对方又对请求域名进行了检测和限制，此时就只能用上述方式来解除限制并在代码中设置host请求头了。如果条件允许，也可以用设置代理IP的方式来实现同样的效果，这样做的好处是不需要设置JVM启动参数。

这两种方式可以用curl来举例模拟，如下是智信钉钉新版服务端的登陆接口：

```
// 智信钉钉接口域名是api.dingtalk.com，在公司内网的代理地址是20.1.1.123:80

// 第一种方式，使用host属性，URL里用的是代理IP
curl -H "Content-Type:application/json" -H "host:api.dingtalk.com" -X POST -d '{"appKey":"xxx","appSecret":"xxx"}' "https://20.1.1.123/v1.0/oauth2/accessToken"

// 第二种方式，使用proxy代理IP，URL里用的是域名
curl --proxy "20.1.1.123:80" -H "Content-Type:application/json" -X POST -d '{"appKey":"xxx","appSecret":"xxx"}' "https://api.dingtalk.com/v1.0/oauth2/accessToken"
```

如果既不想设置host请求头，项目部署在内网并开通了代理，可以让运维那边设置网络策略为TCP转发（这一步其实可以不用做，只是如果服务端是HTTPS双向认证时会出问题），然后修改项目所在机器的hosts文件，这样就不需要设置JVM启动参数和设置host请求头了。

## lengthTag=111, too big

SpringBoot项目读取HTTPS证书文件时报错如下：

```java
Caused by: java.io.IOException: DerInputStream.getLength(): lengthTag=111, too big.
	at sun.security.util.DerInputStream.getLength(DerInputStream.java:599) ~[na:1.8.0_181]
	at sun.security.util.DerValue.init(DerValue.java:391) ~[na:1.8.0_181]
	at sun.security.util.DerValue.<init>(DerValue.java:332) ~[na:1.8.0_181]
	at sun.security.util.DerValue.<init>(DerValue.java:345) ~[na:1.8.0_181]
	at sun.security.pkcs12.PKCS12KeyStore.engineLoad(PKCS12KeyStore.java:1938) ~[na:1.8.0_181]
	at java.security.KeyStore.load(KeyStore.java:1445) ~[na:1.8.0_181]
	at org.springframework.boot.web.embedded.netty.SslServerCustomizer.loadStore(SslServerCustomizer.java:173) ~[spring-boot-2.4.1.jar:2.4.1]
	... 21 common frames omitted
```

报错是因为maven在打包项目时将resource目录下的证书文件重新编译了一次（这个可以对比编译前后的文件大小即可看出来），导致程序运行时读取证书文件失败。

可以在`pom.xml`中通过插件排除指定的文件来解决这个问题：

```xml
<build>
	<finalName>test</finalName>
	<plugins>
		<plugin>
			<groupId>org.apache.maven.plugins</groupId>
			<artifactId>maven-resources-plugin</artifactId>
			<configuration>
				<nonFilteredFileExtensions>
					<nonFilteredFileExtension>jks</nonFilteredFileExtension>
					<nonFilteredFileExtension>p12</nonFilteredFileExtension>
					<nonFilteredFileExtension>cer</nonFilteredFileExtension>
					<nonFilteredFileExtension>crt</nonFilteredFileExtension>
					<nonFilteredFileExtension>pem</nonFilteredFileExtension>
					<nonFilteredFileExtension>pfx</nonFilteredFileExtension>
				</nonFilteredFileExtensions>
			</configuration>
		</plugin>
	</plugins>
</build>
```



## 参考链接

* [HttpURLConnection 设置Host 头部无效](http://t.zoukankan.com/skyaccross-p-2828986.html)
* [如何在HttpURLConnection中覆盖http-header"Host"？](https://qa.1r1g.com/sf/ask/636789121/)
* [springboot2.4开启HTTPS功能报DerInputStream.getLength(): lengthTag=111, too big异常](https://blog.csdn.net/yaomingyang/article/details/112683829)