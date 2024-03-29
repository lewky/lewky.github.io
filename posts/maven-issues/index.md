# Maven问题汇总

## 设置阿里云国内镜像

从Maven的中央仓库下载jar包速度很慢，可以通过在`settings.xml`中配置一个国内镜像来提高下载速度，一般用阿里云镜像。**注意，如果你同时有多个配置文件，必须要修改当前用户目录下的`~/.m2`下的`settings.xml`才有效。**

```xml
<mirrors>  
    <mirror>  
        <id>alimaven</id>  
        <name>aliyun maven</name>  
        <url>http://maven.aliyun.com/nexus/content/groups/public/</url>  
        <mirrorOf>central</mirrorOf>          
    </mirror>  
</mirrors> 
```
<!--more-->

修改配置后，需要重新打开命令行窗口，或者重启IDE才能生效。通常公司会在内网中自己架设一个Nexus私服，项目成员将镜像节点配置为公司的私服，这样无需连接外网也可以下载Jar包，而且速度更快。阿里云镜像实际上就是一个对外公开的Nexus私服仓库。

## 指定编译的JDK版本

在`settings.xml`中配置如下：

```xml
<profiles>
	<profile>
		<id>jdk-1.8</id>
		<activation>
			<jdk>1.8</jdk>
			<activeByDefault>true</activeByDefault>
		</activation>
		<properties>
			<maven.compiler.source>1.8</maven.compiler.source>
			<maven.compiler.target>1.8</maven.compiler.target>
			<maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
		</properties>
	</profile>
</profiles>
```

这是一种全局配置，当Maven项目的pom中没有指定编译插件的jdk版本时，会自动使用全局配置的版本。

## offline节点的作用

企业项目通常更新很快，每天都会出一个snapshot包，在当天里第一次启动项目时，如果中央仓库里的snapshot包更新了，则会自动下载到本地。

如果你此时在本地更改了项目代码并打包过一次，在启动项目时恰巧中央仓库的jar包更新了，就会把本地打包好的jar包给替换掉了。此时必须重新打包一次，才能使用你之前修改的项目代码。为了避免这种情况，可以将`settings.xml`中的offline设为true。

```xml
<offline>true</offline>
```

离线模式下的Maven是不会自动帮你从远处库下载项目依赖，该配置只建议在本地使用，因为如果pom中引入了新的依赖，此时Maven无法自动下载该依赖，会导致项目编译报错，如下：

```java
Caused by: org.eclipse.aether.transfer.ArtifactNotFoundException: Cannot access spring-releases (https://repo.spring.io/libs-release) in offline mode and the artifact org.springframework.boot:spring-boot-loader-tools:jar:2.0.5.RELEASE has not been downloaded from it before.
```

这种时候需要重新将offline节点改为false。

## optional标签

当不需要将某个依赖向外传递时，可以通过将optional标签设置为true来实现，比如当前项目使用的Lombok依赖不需要被其他项目所使用到：

```java
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <version>1.18.16</version>
  <optional>true</optional>
</dependency>
```

## 编码GBK的不可映射字符

执行`mvn clean package`时报错：`编码GBK的不可映射字符`，该问题是因为字符集编码不同导致的，需要在pom中设置统一的编码：

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

## 打war包的方式

首先要了解Maven的流程：

* `mvn clean`：清除`target`目录
* `mvn compile`：编译文件
* `mvn package`：打包项目
* `mvn install`：把打包后的项目安装到本地仓库，包含了compile和package
* `mvn deploy`：把打包后的项目上传到远程仓库（比如自行搭建的私服），包含了install

关于打war包，有多种方式，如下：

* 使用Maven本身的打包方式，把`mvn packaging`设为`war`，即可使用package命令打成war包。
* 使用maven的war命令：`mvn war:exploded`或者`mvn war:war`，后一个命令会打包出一个war包以及war包解压后的目录文件，前一个命令只会打包出war包解压后的目录文件。
* 使用`tomcat7`插件命令打包：`mvn tomcat7:exec-war`或者`mvn tomcat7:exec-war-only`，如下：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.tomcat.maven</groupId>
            <artifactId>tomcat7-maven-plugin</artifactId>
            <version>2.2</version>
        </plugin>
    </plugins>
</build>
```

`tomcat7`插件支持以下命令：

```
// 查看帮助信息
tomcat7:help

// 把WAR部署到Tomcat
tomcat7:deploy

// 把WAR部署到Tomcat，但是不管理包的生命周期
tomcat7:deploy-only

// 重新部署WAR到Tomcat
tomcat7:redeploy

// 重新部署WAR到Tomcat，但是不管理包的生命周期
tomcat7:redeploy-only

// 从Tomcat中卸载WAR
tomcat7:undeploy

// 使用内嵌的Tomcat服务把当前应用作为动态web应用运行
tomcat7:run

// 使用内嵌的Tomcat服务运行当前应用的打包文件war
tomcat7:run-war

// 使用内嵌的Tomcat服务运行当前应用的打包文件war，但是不管理包的生命周期
tomcat7:run-war-only

// 创建一个可执行的jar文件，其中包含了Apache Tomcat，只要执行java -jar xxx.jar即可运行web应用
tomcat7:exec-war

// 创建一个可执行的jar文件，但是不管理包的生命周期
tomcat7:exec-war-only

// 关闭所有的可执行的服务
tomcat7:shutdown

// 创建一个可执行的war文件
tomcat7:standalone-war

// 创建一个可执行的war文件
tomcat7:standalone-war-only
```

最后两个命令在`mvn tomcat7:help`中的解释是一模一样的，暂时不知道和`exec-war`有何区别。

## `mvn clean package`的执行顺序

1. 使用清理插件`maven-clean-plugin`清理已有的target目录（使用了clean才有这一步）
2. 使用资源插件`maven-resources-plugin`处理资源文件
3. 使用编译插件`maven-compiler-plugin`编译所有源文件生成class文件到target/classes目录下
4. 使用资源插件`maven-resources-plugin`处理测试用的资源文件
5. 使用编译插件`maven-compiler-plugin`编译测试用的源码正常class文件到target/test-classes目录下
6. 使用测试插件`maven-surefire-plugin`运行测试用例
7. 使用打包插件`maven-jar-plugin`对编译后生成的文件进行打包，包名和配置的finalName一致，打包后的文件存放在target目录下

不管是compile、package还是install等，前三个步骤都是必不可少的。

## 设置下载源码和文档

方法很多，这里说下3种。

### 使用Maven命令

在项目根目录下执行：

```bat
mvn dependency:sources
mvn dependency:resolve -Dclassifier=javadoc
```

### 修改配置文件进行全局配置

打开当前用户目录下的全局配置文件`/.m2/settings.xml`，添加如下配置：

```xml
<profiles>    
	<profile>    
	    <id>downloadSources</id>    
	    <properties>    
	        <downloadSources>true</downloadSources>    
	        <downloadJavadocs>true</downloadJavadocs>               
	    </properties>    
	</profile>    
</profiles>    
    
<activeProfiles>    
	<activeProfile>downloadSources</activeProfile>    
</activeProfiles>    
```

### 在IDE工具中配置

可以在IDE工具，诸如Eclipse、idea等中修改Maven插件的一些配置，在Eclipse中配置如下：

`Window` -> `Preferences` -> `Maven` -> 勾选`Download Artifact Sources`和`Download Artifact JavaDoc`

## Maven聚合工程怎么变回普通的Maven工程

Maven聚合工程的父工程的packaging是pom，如果我们将其改为jar，会立刻报错：

```java
Project build error: 'packaging' with value 'jar' is invalid. Aggregator projects require 'pom' as packaging.
```

对于聚合工程来说，所有的子工程会被放置到父工程的目录下，然后在父工程的pom文件里会有如下的节点：

```xml
<modules>
    <module>test-child</module>
</modules>
```

这些modules节点正是引用了父工程pom文件的子工程。

### 解决方法

将父工程的modules节点全部去掉，注释掉也行，再将packaging的值从pom改成jar或者war，接着保存，修改成功。

虽然修改成功了，但是去父工程的目录下 ，你会发现那些子工程依然存在着。不过这些工程已经很父工程没有关系了，因为父工程已经不再是聚合工程了，可以将这些子工程移除掉。

## `java.lang.StackOverflowError`

服务器上的Jenkins在集成项目时报错如下：

```java
error compiling: java.lang.StackOverflowError -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
```

错误很明显，堆栈溢出，要么是jvm设置的线程栈太小，要么是代码有问题。而服务器每天晚上都会自动集成，jvm参数也不会有人去改过，很明显是最近提交的代码有问题。

审查了代码，发现是某个测试类中有段代码里调用了一个API，该API又调用了四百多个API。这个API的目的是检测pojo里的字段是否和数据库的字段匹配，一个字段对应一个API，总共有四百多字段。Jenkins在跑单元测试跑到这里就堆栈溢出了。

毕竟是测试类的代码，改动时逻辑照旧，只不过不继续在一个API去直接调用四百个API，而是将其分成两个新的方法，每个方法各自调用两百个API，然后原本的API调用新增的两个方法。

之后提交代码，重新让Jenkins集成代码，发现不再报错。

当然了，也可以直接在启动脚本里简单粗暴调大线程栈大小：

```bat
set MAVEN_OPTS=-Xss4096k
或者
set MAVEN_OPTS=-Xss2m
```

这里顺便贴一下项目脚本原本设置的参数：

```bat
echo off
setlocal
set MAVEN_DEBUG_OPTS=-Duser.timezone=GMT+8 -Xdebug -Xmx4096M -XX:PermSize=128M -XX:MaxPermSize=512M -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=8088,server=y,suspend=n
mvn spring-boot:run
endlocal
```

## 无法下载2.1.7.js7版本的itext依赖

编译项目时报错如下：

```java
Failed to collect dependencies at net.sf.jasperreports:jasperreports:jar:6.10.0
-> com.lowagie:itext:jar:2.1.7.js7: Failed to read artifact descriptor for com.lowagie:itext:jar:2.1.7.js7: 
Could not transfer artifact com.lowagie:itext:pom:2.1.7.js7
```

一开始以为是网络不好连接不上远程库，或者远程库没有该jar包，后来发现在Maven中央仓库里也没找到`2.1.7.js7`版本的`itext`依赖。在Stack Overflow上查询后发现有不少人遇到同样的问题，都是由于使用了某个版本的`jasperreports`，最终导致了该错误。

由于在jasperreports的pom文件里指定了`2.1.7.js7`版本的`itext`依赖，而目前的Maven中央仓库或其他镜像仓库里是不存在这种带有`js7`等后缀版本。该版本是jasperreports为了修复一些bug而打上了补丁的版本，但是并没有release到中央库里，不过这些bug在更高版本里也被修复了，可以使用更高版本的itext来避免这些bug。

### 解决方法

排除jasperreports中的itext依赖并自行指定版本，pom如下：

```
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>6.10.0</version>
    <exclusions>
        <exclusion>
            <groupId>com.lowagie</groupId>
            <artifactId>itext</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
  <groupId>com.lowagie</groupId>
  <artifactId>itext</artifactId>
  <version>2.1.7</version>
</dependency>
```

这里的itext版本根据自身实际情况指定，目前itext已停止维护，并从4.2.2之后的版本开始从`com.lowagie.itext`迁移到`com.itextpdf.itextpdf`，有需要的话可以使用更高版本的itextpdf依赖，pom如下：

```
<dependency>
    <groupId>jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>6.10.0</version> <!--(or higher)-->
    <exclusions>
        <exclusion>
            <groupId>com.lowagie</groupId>
            <artifactId>itext</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13</version> <!--(or higher)-->
</dependency>
```

## `java.awt.FontFormatException: bad table, tag=`

Java加载外部字体时报错`FontFormatException`，Maven在编译项目时使用`-X`开启debug模式同样可以看到该异常。原因是使用了`resource`插件的`filtering`功能，`filtering`为`true`时可以使用系统变量或者启动参数来替换资源文件的占位符`${}`的值。但也会导致Maven打包时对资源文件重新进行编译，而这些资源文件自身有着特定的编码，被Maven重新编码后文件损坏，于是就会触发该异常。

处理方式很简单，不再过滤特定的资源文件，如字体、excel等，避免对其重新编码。下面是demo：

```xml
<plugins>
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-resources-plugin</artifactId>
        <configuration>
            <!-- 过滤后缀不需要转码的文件后缀名.crt/.ttf-->
            <nonFilteredFileExtensions>
                <nonFilteredFileExtension>ttf</nonFilteredFileExtension>
                <nonFilteredFileExtension>xlsx</nonFilteredFileExtension>
                <nonFilteredFileExtension>xls</nonFilteredFileExtension>
                <nonFilteredFileExtension>zip</nonFilteredFileExtension>
                <nonFilteredFileExtension>cer</nonFilteredFileExtension>
                <nonFilteredFileExtension>pfx</nonFilteredFileExtension>
                <nonFilteredFileExtension>py</nonFilteredFileExtension>
            </nonFilteredFileExtensions>
        </configuration>
    </plugin>
</plugins>
```

这个`nonFilteredFileExtensions`标签和`exclude`是不同的，前者依然会打包文件，只是不对其进行重新编译；后者是在打包时直接排除对应的文件。

`include`是指定打包时需要哪些文件，但`include`和`exclude`的配置冲突时，以后者为准。

## 引入本地jar包

两种方式，一种是把jar包安装到本地仓库后再引入；一种是直接用`systemPath`直接引入一个外部的jar包。如果只是本地开发，可以用前一种方式；如果是协同开发，个人更倾向于后一种方式。

### 方式一：安装到本地仓库

下面是将jar包安装到本地的命令：

```bat
mvn install:install-file -Dfile=D:\lib\test.jar -DgroupId=com.test -DartifactId=test -Dversion=0.0.1 -Dpackaging=jar
```

`-Dfile`指明需要被安装的jar包路径。

`-DgroupId`和`-DartifactId`指定jar包的唯一依赖路径，注意别跟其他的本地依赖路径冲突就行。

`-Dversion`指定依赖的版本。

`-Dpackaging`指明打包方式。

安装到本地仓库后可以像普通依赖那样引入：

```xml
<dependency>
    <groupId>com.test</groupId>
    <artifactId>test</artifactId>
    <version>0.0.1</version>
</dependency>
```

### 方式二：`systemPath`直接引入

```xml
<dependency>
    <groupId>com.test</groupId>
    <artifactId>test</artifactId>
    <scope>system</scope>
    <systemPath>${basedir}/src/main/resources/lib/test.jar</systemPath>
</dependency>
```

`${basedir}`是Maven的内置属性，代表项目根目录。

## 压缩js+css代码

借助`yuicompressor`插件来完成：

```xml
<!-- Maven全局属性，统一编码 -->
<properties>
 <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
<!-- 构建相关配置  -->
<build>
 <!-- maven插件配置 -->
 <plugins>
   <plugin>
     <!-- YUI Compressor Maven压缩插件 -->
     <groupId>net.alchim31.maven</groupId>
     <artifactId>yuicompressor-maven-plugin</artifactId>
     <version>1.3.0</version>
     <configuration>
       <!-- 读取js,css文件采用UTF-8编码 -->
       <encoding>UTF-8</encoding>
       <!-- 不显示js可能的错误 -->
       <jswarn>false</jswarn>
       <!-- 若存在已压缩的文件，会先对比源文件是否有改动。有改动便压缩，无改动就不压缩 -->
       <force>false</force>
       <!-- 在指定的列号后插入新行 -->
       <linebreakpos>-1</linebreakpos>
       <!-- 压缩之前先执行聚合文件操作 -->
       <preProcessAggregates>true</preProcessAggregates>
       <!-- 压缩后保存文件后缀 -->
       <suffix>.min</suffix>
       <!-- 源目录，即需压缩的根目录 -->
       <sourceDirectory>${basedir}/mobile</sourceDirectory>
       <!-- 压缩js和css文件 -->
       <includes>
         <include>**/*.js</include>
         <include>**/*.css</include>
       </includes>
       <!-- 以下目录和文件不会被压缩 -->
       <excludes>
         <exclude>**/*.min.js</exclude>
         <exclude>**/*.min.css</exclude>
         <exclude>scripts/data/*.js</exclude>
       </excludes>
       <!-- 压缩后输出文件目录 -->
       <outputDirectory>${basedir}/mobile</outputDirectory>
       <!-- 聚合文件 -->
       <aggregations>
         <aggregation>
           <!-- 合并每一个文件后插入一新行 -->
           <insertNewLine>true</insertNewLine>
           <!-- 需合并文件的根文件夹 -->
           <inputDir>${basedir}/mobile/scripts</inputDir>
           <!-- 最终合并的输出文件 -->
           <output>${basedir}/mobile/scripts/app/app.js</output>
           <!-- 把以下js文件合并成一个js文件，是按顺序合并的 -->
           <includes>
             <include>app/core.js</include>
             <include>app/mlmanager.js</include>
             <include>app/tmpl.js</include>
             <include>app/ui.js</include>
           </includes>
         </aggregation>
       </aggregations>
     </configuration>
   </plugin>
 </plugins>
</build>
```

## 跳过测试案例

有两种方式，一个是启动时添加参数：`-DskipTests`；一种是添加参数`-Dmaven.test.skip=true`。

前者不执行测试用例，但是会编译测试类到`target/test-classes`目录。

后者既不执行测试用例，也不编译测试类。

## 参考链接

* [maven(八)，阿里云国内镜像，提高jar包下载速度](https://blog.csdn.net/wangb_java/article/details/55653122)
* [Maven命令行使用：mvn clean package（打包）](https://www.cnblogs.com/frankyou/p/6062179.html)
* [maven 编码GBK的不可映射字符](http://blog.csdn.net/zyf_balance/article/details/50910521)
* [Maven执行install命令出现Exception in thread "main" java.lang.StackOverflowError](https://juejin.im/post/5ae4218a6fb9a07ac90cf586)
* [java读取字体文件tff，报错java.awt.FontFormatException: bad table, tag=一串数字](https://lisheng0305.blog.csdn.net/article/details/115235477)
* [人生苦短，你需要maven，resource、filter、include、exclude简单说明及使用](https://blog.csdn.net/u012643122/article/details/95030849)
* [maven设置下载源码](https://blog.csdn.net/ljxbbss/article/details/78060636)
* [Dependency error in jasper-reports from itext](https://stackoverflow.com/questions/31314373/dependency-error-in-jasper-reports-from-itext)
* [IText, A Free Java PDF Library](https://mvnrepository.com/artifact/com.lowagie/itext)
* [在maven中引入本地jar包的方法](https://www.cnblogs.com/guojuncheng/p/9149151.html)
* [maven实现JS+CSS自动压缩](https://www.cnblogs.com/lorence/articles/2750001.html)
* [eclipse maven 打war包的几种方式](https://www.cnblogs.com/qlqwjy/p/8231032.html)
* [Maven之Tomcat](https://blog.csdn.net/qq_34017326/article/details/78591632)
* [Maven中-DskipTests和-Dmaven.test.skip=true的区别](https://www.cnblogs.com/wangcp-2014/p/6211439.html)