# Postman问题汇总

## 无法更改请求报文的编码

在测试接口的时候发现，在Header中用`Content-type`指定编码为`GBK`也没有效果，服务端收到的报文始终是`UTF-8`编码的字节数组。在查阅资料后得出结论，就是Postman限制死了请求报文的编码为`UTF-8`，无法通过配置等方式进行修改，如果需要使用其他编码，要么换其他HTTP工具，要么用Java写一段代码去测试接口。

<!--more-->
这里使用的Postman是6.7.4版本，也许更高版本的允许更改请求报文编码，由于工作环境不允许更换工具或者升级版本，这里采用了Java代码的方式去发送接口，如下：

```xml
<dependency>
	<groupId>org.apache.httpcomponents</groupId>
	<artifactId>httpclient</artifactId>
	<version>4.5.8</version>
</dependency>
```

```java
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.BasicHttpEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class HttpUtils {

    private static final String url = "http://localhost:39007/";
    private static final String contentType = "application/xml;charset=GBK";

    public static void main(String[] args) {
        String message = "<?xml version=\"1.0\" encoding=\"GBK\"?><custNm>小明</custNm>";
        String encoding = "GBK";
        byte[] content = null;
        try {
            content = message.getBytes(encoding);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        doPost(url, contentType, content, encoding);
    }

    private static void doPost(String url, String contentType, byte[] content, String encoding) {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(url);
        // 请求头
        httpPost.addHeader("Content-type", contentType);
        // 请求实体
        BasicHttpEntity entity = new BasicHttpEntity();
        entity.setChunked(false); // 禁止分块编码
        entity.setContentEncoding(encoding);
        entity.setContentLength(content.length);
        entity.setContent(new ByteArrayInputStream(content));
        httpPost.setEntity(entity);
        // 执行请求
        CloseableHttpResponse httpResponse = null;
        HttpEntity responseEntity = null;
        try {
            httpResponse = httpClient.execute(httpPost);
            responseEntity = httpResponse.getEntity();
            String result = EntityUtils.toString(responseEntity);
            System.out.println(result);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            closeQuietly(httpClient);
            closeQuietly(httpResponse);
        }
    }

    /**
     * 关闭资源
     */
    private static void closeQuietly(CloseableHttpResponse httpResponse) {
        if (httpResponse != null) {
            try {
                httpResponse.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 关闭资源
     */
    private static void closeQuietly(CloseableHttpClient httpClient) {
        if (httpClient != null) {
            try {
                httpClient.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

}
```

另外，`GBK`仅支持简体中文和繁体中文，对于某些业务（如银行业务等），可能需要使用`GB18030`来支持更多的中文字符，包括藏文、蒙文、维吾尔文等主要的少数民族文字。

## 参考链接

* [计算机字符编码中GBK GB2312 GB18030有什么区别 谁包含的东西多？谁更早？](https://zhidao.baidu.com/question/982067646590782059.html)