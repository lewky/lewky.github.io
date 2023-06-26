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

## HTTPS单向认证和双向认证

HTTP是明文传输，默认端口为80。

HTTPS是SSL / TLS + HTTP，默认端口为443，可进行加密传输和身份认证，因此涉及到两类文件：密钥和信任证书。SSL协议使用的加解密方式很像数字信封。

TLS可以说是SSL的升级版，但二者不可共用。TLS的版本号与SSL不同，TLS的版本1.0使用的版本号是SSLv3.1。

单向认证是只有客户端验证服务端的身份，客户端发起连接时服务端需要发送自己的数字证书给客户端验证。双向认证是客户端和服务端都需要互相验证对方的身份。单向认证的方式比较简单且常见，但安全性较低。

更具体的可以看看这篇文章：[SSL 和 TLS 之间的主要区别是什么？](https://www.wangan.com/wenda/9707)

## JDK自带的keytool工具生成证书

```cmd
// 生成keystore文件，生成的证书文件是Java专用的JKS格式
keytool -genkey -alias tomcat -keyalg RSA
// 生成一个别名为tomcat的自签名证书，证书文件名为test，证书实体信息为"CN=Liu, OU=TestOU, O=TestO, L=sde, ST=GD, C=CN"，密钥密码和密钥库密码为123456，有效期为180天
keytool -genkey -alias tomcat -keyalg RSA -dname "CN=Liu, OU=TestOU, O=TestO, L=sde, ST=GD, C=CN" -keystore test -keypass 123456 -storepass 123456 -validity 180

// 把JKS格式转为行业标准格式PKCS12，参数和生成keystore类似，根据src和dest区分
keytool -importkeystore -srckeystore test -destkeystore test1 -deststoretype pkcs12 -srcalias tomcat -destalias tomcat -srckeypass 123456 -srcstorepass 123456 -destkeypass 123456 -deststorepass 123456

// 列出详细信息
keytool -list -v -keystore .keystore

// 导出cer信任证书
keytool -export -alias tomcat -file test.cer -keystore .keystore -storepass 123456 -rfc

// 查看证书信息
keytool -printcert -file test.cer

// jdk自带的证书库文件：`%JAVA_HOME%/jre/lib/security/cacerts`
keytool -list -v -keystore "%JAVA_HOME%/jre/lib/security/cacerts"
```

## Java实现HTTPS双向认证

JDK通过KeyStore对象来存储密钥文件和信任证书，但两个文件由不同的管理器类分开管理：KeyManagerFactory、TrustManagerFactory

KeyManagerFactory负责装载密钥文件，加解密通讯数据；TrustManagerFactory负责装载信任证书，进行身份验证。

如果对于安全性要求不是很高，直接使用忽略认证SSL来发送https请求也是可以的，但是不建议在生产环境这样做。

pom依赖：

```xml
<dependency>
	<groupId>org.apache.httpcomponents</groupId>
	<artifactId>httpmime</artifactId>
	<version>4.3</version>
</dependency>
```

```java
    public static void main(String[] args) {
        // 设置协议http和https对应的处理socket链接工厂的对象
        RegistryBuilder<ConnectionSocketFactory> builder = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.getSocketFactory());
        Registry<ConnectionSocketFactory> registry = null;

        // HTTPS是否忽略SSL认证
        boolean ignoreSSL = false;
        // 是否信任所有信任证书，相当于跳过客户端验证服务端证书
        boolean trustAllCerts = false;
        // 是否使用代理
        boolean useProxy = false;
        if (!ignoreSSL) {
            // 密钥和信任证书被存储在一个密钥库文件中（也可能存储在两个不同的密钥库文件中），需要用密钥库口令才能读取密钥库文件
            // 密钥本身还有一个口令保护着，因此这里涉及到两个口令：密钥口令和密钥库口令

            // 信任证书相关
            String trustStoreType = "";
            String trustStoreFile = "";
            String trustStorePass = ""; // 存储信任证书的密钥库口令，jetty里将该密钥库称为信任库

            // 密钥文件相关
            String keyStoreType = "";
            String keyStoreFile = "";
            String keyStorePass = "";   // 存储密钥的密钥库口令
            String keyPass = "";        // 密钥口令

            SSLContext sslContext = custom(trustStoreType, trustStoreFile, trustStorePass, keyStoreType, keyStoreFile, keyStorePass, keyPass, trustAllCerts);
            registry = builder.register("https", new SSLConnectionSocketFactory(sslContext))
                    .build();
        } else {
            // 完全忽略SSL认证，既不加载密钥，也不加载信任证书
            registry = builder.register("https", new SSLConnectionSocketFactory(createIgnoreVerifySSL(), SSLConnectionSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER))
                    .build();
        }

        PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager(registry);
        // 这两个值设置一样大不太合适，PreRoute指的是针对某个url的最大并发数
        cm.setMaxTotal(2000);
        cm.setDefaultMaxPerRoute(500);

        RequestConfig requestConfig;
        if(useProxy){
            String proxyIP = "";
            String proxyPort = "";
            HttpHost pr = new HttpHost(proxyIP,Integer.parseInt(proxyPort));
            requestConfig = RequestConfig.custom().setConnectTimeout(30000).setSocketTimeout(30000)
                    .setConnectionRequestTimeout(30000).setProxy(pr).build();
        }else{
            requestConfig = RequestConfig.custom().setConnectTimeout(30000).setSocketTimeout(30000)
                    .setConnectionRequestTimeout(30000).build();
        }

        HttpClient httpClient = HttpClients.custom().setConnectionManager(cm).setDefaultRequestConfig(requestConfig).build();
        String uri = "http://localhost:55555";
        String charset = "UTF-8";
        final HttpPost post = new HttpPost(uri);

        // 设置请求头
        post.setHeader("key1", "value1");
        post.setHeader("key2", "value2");

        // 设置支持cookie
        HttpContext localContext = new BasicHttpContext();
        BasicCookieStore cookieStore = new BasicCookieStore();
        Cookie cookie = new BasicClientCookie("name", "value");
        cookieStore.addCookie(cookie);
        localContext.setAttribute(HttpClientContext.COOKIE_STORE, cookieStore);

        // 设置body
        final BasicHttpEntity entity = new BasicHttpEntity();
        entity.setChunked(false);
        byte[] content = null;
        try {
            content = "POST body content.".getBytes(charset);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        entity.setContentEncoding(charset);
        entity.setContentLength(content.length);
        entity.setContent(new ByteArrayInputStream(content));
        post.setEntity(entity);

        // 发送请求
        HttpResponse httpResponse = null;
        try {
            httpResponse = httpClient.execute(post, localContext);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static SSLContext custom(String trustStoreType, String trustStoreFile, String trustStorePass, String keyStoreType, String keyStoreFile, String keyStorePass, String keyPass, boolean trustAll) {
        SSLContext ctx = null;
        ByteArrayInputStream trustInputStream = null;
        ByteArrayInputStream keyInputStream = null;
        KeyStore trustStore = null;
        KeyStore keyStore = null;
        TrustManager[] trustManagers = null;
        try {
            // 密钥文件，通常格式为pfx、p12或jks（jks是java专用的格式）
            keyStore = KeyStore.getInstance(StringUtils.isNotBlank(keyStoreType) ? keyStoreType : "PKCS12");
            keyInputStream = new ByteArrayInputStream(Base64.getDecoder().decode(keyStoreFile));
            keyStore.load(keyInputStream, keyStorePass.toCharArray());
            KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            kmf.init(keyStore, keyPass.toCharArray());

            if (trustAll) {
                // 信任所有信任证书
                TrustManager[] trustAllCerts = new TrustManager[] {
                        new X509TrustManager() {
                            @Override
                            public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                                // don't check
                            }

                            @Override
                            public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                                // don't check
                            }

                            @Override
                            public X509Certificate[] getAcceptedIssuers() {
                                return new X509Certificate[]{};
                            }
                        }
                };

                trustManagers = trustAllCerts;
            } else {
                // 信任证书，通常格式为crt、cer
                trustStore = KeyStore.getInstance(StringUtils.isNotBlank(trustStoreType) ? trustStoreType : KeyStore.getDefaultType());
                trustInputStream = new ByteArrayInputStream(Base64.getDecoder().decode(trustStoreFile));
                trustStore.load(trustInputStream, trustStorePass.toCharArray());
                TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                tmf.init(trustStore);

                trustManagers = tmf.getTrustManagers();
            }
            // TLS可以视为SSL升级版，TLSv1.0版本号记为SSLv3.1
            ctx = SSLContext.getInstance("TLS");
            ctx.init(kmf.getKeyManagers(), trustManagers, null);

        } catch (Exception e) {
            log.error("当前HTTPS协议装载SSL证书失败！", e);
        } finally {
            IOUtils.closeQuietly(trustInputStream);
            IOUtils.closeQuietly(keyInputStream);
        }
        return ctx;
    }

    public static SSLContext createIgnoreVerifySSL() {
        SSLContext ctx = null;
        // 信任所有信任证书
        TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                        // don't check
                    }

                    @Override
                    public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                        // don't check
                    }

                    @Override
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[]{};
                    }
                }
        };
        try {
            ctx = SSLContext.getInstance("SSL");
            ctx.init(null, trustAllCerts, null);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (KeyManagementException e) {
            e.printStackTrace();
        }
        return ctx;
    }
```

## HttpClient提交表单数据

通过`application/x-www-form-urlencoded`提交页面form表单数据，键值对会被自动url编码，并通过`&`拼接起来。

```java
String uri = "http://localhost:55555";
String charset = "UTF-8";
final HttpPost post = new HttpPost(uri);

// 设置请求头
post.setHeader("key1", "value1");
post.setHeader("key2", "value2");

// 设置支持cookie
HttpContext localContext = new BasicHttpContext();
BasicCookieStore cookieStore = new BasicCookieStore();
Cookie cookie = new BasicClientCookie("name", "value");
cookieStore.addCookie(cookie);
localContext.setAttribute(HttpClientContext.COOKIE_STORE, cookieStore);

// 获取URL参数
List<NameValuePair> pairs = new ArrayList<NameValuePair>();
pairs.add(new BasicNameValuePair("key1", "value1"));
pairs.add(new BasicNameValuePair("key2", "value2"));
UrlEncodedFormEntity entity = new UrlEncodedFormEntity(pairs, Charset.forName(charset));
post.setEntity(entity);

// 发送请求
HttpClient httpClient = HttpClients.createDefault();
HttpResponse httpResponse = null;
try {
	httpResponse = httpClient.execute(post, localContext);
} catch (IOException e) {
	e.printStackTrace();
}
```

## the request was rejected because no multipart boundary was found

通过`multipart/form-data`提交表单数据时，需要用到boundary来分割文件和请求参数，如果只需要提交文件，用HttpClient时不需要设置Header，底层会自动生成boundary。

如果需要同时提交文件和请求参数，需要手动设置Header和boundary，否则会报错`the request was rejected because no multipart boundary was found`，设置方法可以参考下文。

## HttpClient发送文件请求

通过`multipart/form-data`上传文件，文件和请求参数需要用boundary来分割。

```java
public class Test {
    private static final char[] MULTIPART_CHARS = "-_1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
	
    public static void main(String[] args) {
        String uri = "http://localhost:55555";
        String charset = "UTF-8";
        final HttpPost post = new HttpPost(uri);
		
        // 设置请求头
        post.setHeader("key1", "value1");
        post.setHeader("key2", "value2");
		
        // 设置支持cookie
        HttpContext localContext = new BasicHttpContext();
        BasicCookieStore cookieStore = new BasicCookieStore();
        Cookie cookie = new BasicClientCookie("name", "value");
        cookieStore.addCookie(cookie);
        localContext.setAttribute(HttpClientContext.COOKIE_STORE, cookieStore);
		
        // 设置boundary，用于分割文件和请求参数
        String boundary = generateBoundary();
        post.setHeader("Content-type", "multipart/form-data; boundary=" + boundary + "; charset=utf-8");
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
        builder.setCharset(Charset.forName(charset));
        builder.setBoundary(boundary);
        // 添加请求参数
        ContentType textContentType = ContentType.create("application/x-www-form-urlencoded", Charset.forName(charset));
        builder.addTextBody("key1", "value1", textContentType);
        builder.addTextBody("key2", "value2", textContentType);
        // 添加文件
        ContentType fileContentType = ContentType.create("multipart/form-data", Charset.forName(charset));
        InputStream inputStream = null;
        File file = new File("C:\\Users\\WB2027\\Downloads\\123.txt");
        try {
            inputStream = new FileInputStream(file);
            String fileName = file.getName();
            builder.addBinaryBody("file", inputStream, fileContentType, fileName);
        } catch (Exception e) {
            e.printStackTrace();
        }
        HttpEntity entity = builder.build();
        post.setEntity(entity);
		
		// 发送请求
        HttpClient httpClient = HttpClients.createDefault();
        HttpResponse httpResponse = null;
        try {
            httpResponse = httpClient.execute(post, localContext);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            IOUtils.closeQuietly(inputStream);
        }
    }

    // 拷贝自Apache MultipartEntityBuilder
    private static String generateBoundary() {
        StringBuilder buffer = new StringBuilder();
        Random rand = new Random();
        int count = rand.nextInt(11) + 30;

        for(int i = 0; i < count; ++i) {
            buffer.append(MULTIPART_CHARS[rand.nextInt(MULTIPART_CHARS.length)]);
        }

        return buffer.toString();
    }
}
```

## 参考链接

* [HttpURLConnection 设置Host 头部无效](http://t.zoukankan.com/skyaccross-p-2828986.html)
* [如何在HttpURLConnection中覆盖http-header"Host"？](https://qa.1r1g.com/sf/ask/636789121/)
* [springboot2.4开启HTTPS功能报DerInputStream.getLength(): lengthTag=111, too big异常](https://blog.csdn.net/yaomingyang/article/details/112683829)
* [JAVA SSL HTTPS 连接详解 生成证书](https://blog.csdn.net/liuquan0071/article/details/50318405)
* [Java，Web，https，读取网站申请SSL证书，JKS、PFX、CRT格式](https://blog.csdn.net/woliuqiangdong/article/details/121304907)
* [post请求中的参数形式和form-data提交数据时取不到的问题](https://www.cnblogs.com/h-c-g/p/11002380.html)
* [httpclient 使用application/x-www-form-urlencoded提交](https://blog.csdn.net/qianhuan_/article/details/103374292)