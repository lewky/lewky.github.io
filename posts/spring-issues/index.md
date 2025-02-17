# Spring问题汇总

## SpelEvaluationException: EL1030E

运行Spring项目时报错如下：

```java
org.springframework.expression.spel.SpelEvaluationException: EL1030E: The operator 'ADD' is not supported between objects of type 'java.lang.String' and 'null'
	at org.springframework.expression.spel.ExpressionState.operate(ExpressionState.java:240)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:80)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:85)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.OpPlus.getValueInternal(OpPlus.java:83)
	at org.springframework.expression.spel.ast.SpelNodeImpl.getValue(SpelNodeImpl.java:109)
	at org.springframework.expression.spel.standard.SpelExpression.getValue
....
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1415)
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:745)
```

<!--more-->
从堆栈信息可以看出，该异常与`spel`有关。`spel`指的是`Spring Expression Language`，结合问题代码进行分析，可以认为该异常与spring表达式有关。而在我的代码里，只有`@Cacheable`注解里使用到了`spel`，如下：

```java
    @Cacheable(key = "#root.target.getCacheKeyPrefix() + '::' + + #root.target.getRootDomain() + '-' + #root.target.getLocale() + '-' + #searchLabelKey")
    public String getFromRootDomain(final String labelId, final String locale, final String searchLabelKey) {
        
		// TODO
        return null;
    }
```

很显然，在使用到该注解时，由于这里的spring表达式有问题，最终在解析时抛出了异常。经过检查发现，这里犯了个很逗的错误，就是连续使用了两个`+`，导致解析无法通过，改正后如下：

```java
@Cacheable(key = "#root.target.getCacheKeyPrefix() + '::' + #root.target.getRootDomain() + '-' + #root.target.getLocale() + '-' + #searchLabelKey")
```

而之所以之前没能发现这个问题，是因为没有启用redis cache，导致避开了这个问题。目前刚开始了解`spel`这门表达式语言，在此记录下这个问题，方便日后回顾分析，参考链接里顺便贴上官方的一篇中译文档。

## `@PathVariable`会截断字符串中最后一个`.`

当使用了`@PathVariable`接收参数时，如果该参数的值包含有`.`这个符号，则最后的`.`以及之后的字符串会被截断。举个简单的例子，代码如下：

```java
@GetMapping(value = "/users/{loginId}", produces = Constants.REQUEST_BODY_TYPE_APP_JSON)
public UserDto getLatestUserByLoginId(@PathVariable final String loginId) throws DocumentNotFoundException {
    final UserDto result = userDocumentService.findDtoByLoginIdAndIsLatest(loginId);
    return result;
}
```

* 当请求是`/users/lewis.liu`时，`loginId`参数接收到的值是`lewis`；
* 当请求是`/users/lewis.liu.p`时，`loginId`参数接收到的值是`lewis.liu`；
* 当请求是`/users/lewis.liu.p.w`时，`loginId`参数接收到的值是`lewis.liu.p`。

可以发现，`@PathVariable`注解会自动截断最后一个`.`以及之后的字符串。这是因为Spring认为最后一个`.`以及之后的字符串属于文件扩展类型，比如`.java`之类的，所以就自动将其截断了。

解决这个问题可以在请求的变量占位符里加上正则表达式，如下：

```java
// 原来的写法
@GetMapping(value = "/users/{loginId}", produces = Constants.REQUEST_BODY_TYPE_APP_JSON)

// 改后的写法
@GetMapping(value = "/users/{loginId:.+}", produces = Constants.REQUEST_BODY_TYPE_APP_JSON)
```

## 获取当前项目部署在Tomcat中的路径

```java
import javax.servlet.ServletContext;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.WebApplicationContext;


WebApplicationContext webApplicationContext = ContextLoader.getCurrentWebApplicationContext();
ServletContext servletContext = webApplicationContext.getServletContext();
String contextPath = servletContext.getContextPath();
```

## 用jasypt加密配置文件中的敏感数据

生成环境的数据库密码等敏感信息是不能直接明文配置的，可以通过集成jasypt这个第三方库来实现配置中敏感数据的加解密。

假如现在有一个数据库的配置文件`jdbc.properties`，其中的密码字段原本配置如下：

```
jdbc.password=test123
```

由于密码是敏感数据，不能配置为明文，现在用jasypt来实现加密该字段。

### 引入pom依赖：

```xml
<dependency>
   <groupId>org.jasypt</groupId>
   <artifactId>jasypt-spring31</artifactId>
   <version>1.9.2</version>
</dependency>
```

### application.xml配置jasypt的bean

```xml
<bean id="environmentVariablesConfiguration"  class="org.jasypt.encryption.pbe.config.EnvironmentStringPBEConfig">
	<!-- 盐值，用于加密 -->
	<property name="password" value="A1A26A54353E4BC5BDFCB355EF68FD99"/>
</bean>
<bean id="configurationEncryptor" class="org.jasypt.encryption.pbe.StandardPBEStringEncryptor">
	<property name="config" ref="environmentVariablesConfiguration"/>
</bean>
<bean id="propertyConfigurer"
	  class="org.jasypt.spring31.properties.EncryptablePropertyPlaceholderConfigurer">
	<constructor-arg ref="configurationEncryptor" />
	<property name="locations">
		<list>
			<value>classpath:jdbc.properties</value>
		</list>
	</property>
</bean>
```

在上述配置中，jasypt的bean指定了盐值和需要扫描的配置文件`jdbc.properties`。

### 获取密文串并配置到配置文件中

在jasypt-1.9.2.jar目录下执行下面命令来获取加密后的密文串：

```cmd
java -cp jasypt-1.9.2.jar org.jasypt.intf.cli.JasyptPBEStringEncryptionCLI algorithm=PBEWithMD5AndDES password=A1A26A54353E4BC5BDFCB355EF68FD99 input=密码明文
```

上诉命令中algorithm是加密算法，password是盐值，input是明文，执行后结果如下：

```cmd
D:\maven\repository\org\jasypt\jasypt\1.9.2>java -cp jasypt-1.9.2.jar org.jasypt.intf.cli.JasyptPBEStringEncryptionCLI algorithm=PBEWithMD5AndDES password=A1A26A54353E4BC5BDFCB355EF68FD99 input=test123

----ENVIRONMENT-----------------

Runtime: Oracle Corporation Java HotSpot(TM) 64-Bit Server VM 25.202-b08



----ARGUMENTS-------------------

input: test123
algorithm: PBEWithMD5AndDES
password: A1A26A54353E4BC5BDFCB355EF68FD99



----OUTPUT----------------------

fMrbHTmCSpwVP206IfjYkw==
```

`OUTPUT`即是输入的明文被加密后的密文，将密文配置到配置文件`jdbc.properties`中，用`ENC()`包括起来，取代原本的明文值：

```xml
jdbc.password=ENC(fMrbHTmCSpwVP206IfjYkw==)
```

这样jasypt的bean在扫描到指定的配置文件时，遇到被`ENC()`包括起来的密文值，会自动解密成明文；也就实现了敏感数据的脱敏。

### 解密密文得到明文

如果需要获取明文，可以用下面代码解密：

```java
// 加密时的盐值
String password = "A1A26A54353E4BC5BDFCB355EF68FD99";
// 密文
String encrypt = "fMrbHTmCSpwVP206IfjYkw==";
EnvironmentStringPBEConfig config = new EnvironmentStringPBEConfig();
config.setPassword(password);
StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
encryptor.setConfig(config);
String decrypt = encryptor.decrypt(encrypt);
System.out.println("解密后明文：" + decrypt);
```

结果为：

```
解密后明文：test123
```

## 查看类文件是加载的哪个jar包

通过jdk提供的接口可以打印出来类文件的加载路径：

```java
ProtectionDomain pd = Test.class.getProtectionDomain();
CodeSource codeSource = pd.getCodesource();
URL location = codeSource.getLocation();
System.out.println(location);
```

但是这个api对于系统类加载器加载的类会获取不到，报错NPE，比如String.class，对于这些类可以通过添加启动参数`-verbose`，在启动项目时打印出来所有被系统类加载器加载的类文件路径。

## 参考链接

* [8. Spring 表达式语言 (SpEL)](http://itmyhome.com/spring/expressions.html#expressions-operator-safe-navigation)
* [Spring MVC @PathVariable with dot (.) is getting truncated](https://stackoverflow.com/questions/16332092/spring-mvc-pathvariable-with-dot-is-getting-truncated)
* [java -cp jasypt_SpringBoot使用jasypt加解密密码的实现方法](https://blog.csdn.net/weixin_42364640/article/details/114707534)
* [查看java类是从哪个包加载，并找出包所在路径](https://blog.csdn.net/u013818525/article/details/78890258)