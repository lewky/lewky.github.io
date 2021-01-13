# Maven - 关于编码GBK的不可映射字符的问题

## 问题与分析

之前都是用的Eclipse的Maven插件执行命令，后来偶然在最近完成的一个小项目的根目录里打开cmd，执行`mvn clean package`报`编码GBK的不可映射字符`的问题。

明明之前在Eclipse上打成war包没问题，为什么用cmd执行package命令就会报错？在网上查了下资料，是因为没有在pom.xml文件中添加编译插件的编码字符集，如下：
<!--more-->

```xml
<build>
	<finalName>demo</finalName>
	<plugins>
		<plugin>  
			<groupId>org.apache.maven.plugins</groupId>  
			<artifactId>maven-compiler-plugin</artifactId>  
			<configuration>  
				<source>1.7</source>  
				<target>1.7</target>  
				<encoding>utf8</encoding>    
			</configuration>  
		</plugin>
	</plugins>
</build>
```

这里的source和target的1.7指的是编译时使用jdk1.7版本；而encoding指定了utf8编码（我测试了下，发现写utf-8也可以）。

## 补充`mvn clean package`命令的执行顺序

1. 使用cmd的cd命令进入要打包的项目的根目录，也可以直接进入到该项目的根目录，然后按住Shift键+鼠标右键，选择`在此处打开命令窗口`
2. 接下来输入`mvn clean package`，这里的clean是为了在package之前清理掉已有的target目录。
3. 之后打包成功会出现`BUILD SUCCESS`的字样，而在打包过程中，会发现cmd的窗口出现一大堆东西，这里说一下这个`mvn clean package`命令的执行顺序。

### 执行顺序

1. 使用清理插件`maven-clean-plugin`清理已有的target目录（使用了clean才有这一步）
2. 使用资源插件`maven-resources-plugin`处理资源文件
3. 使用编译插件`maven-compiler-plugin`编译所有源文件生成class文件到target/classes目录下
4. 使用资源插件`maven-resources-plugin`处理测试用的资源文件
5. 使用编译插件`maven-compiler-plugin`编译测试用的源码正常class文件到target/test-classes目录下
6. 使用测试插件`maven-surefire-plugin`运行测试用例
7. 使用打包插件`maven-jar-plugin`对编译后生成的文件进行打包，包名和配置的finalName一致，打包后的文件存放在target目录下

**备注：**不管是compile、package还是install等前三个步骤都是必不可少的。

### 参考链接

1. http://www.cnblogs.com/frankyou/p/6062179.html
2. http://blog.csdn.net/zyf_balance/article/details/50910521
