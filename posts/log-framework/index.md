# 日志框架与门面模式

## 日志框架

目前的日志框架可以分为两种：一种是jdk自带的，一种是第三方实现的。

第三方的日志框架除了提供具体的日志实现外，也有的会提供自身框架的接口。此外，有些日志框架仅仅提供了一套统一的接口，不包含具体的日志实现，可以通过一些桥接包来调用其他的日志框架。（即日志的门面模式）

<!--more-->
### jdk自带的日志框架

jdk自带的日志是jdk-logging，简称jul（java.util.logging包的简称）。

Tomcat本身的日志实现是`tomcat-juli.jar`，从jar名就可以看出来，它是对jul的实现，内部对jul进行了一定的封装。

jul的配置文件是`logging.properties`。下面是jul的一个简单demo，jul的日志级别和第三方的日志框架不太相同：

```java
import java.util.logging.Level;
import java.util.logging.Logger;

public class Hello {
    public static void main(String[] args) {
        Logger logger = Logger.getGlobal();
        logger.info("start process...");
        logger.warning("memory is running out...");
        logger.fine("ignored.");
        logger.severe("process will be terminated...");
    }
}
```

### 第三方的日志框架

常见的有logback、log4j、log4j2这三大日志框架，其中log4j2是log4j 1.x的升级版，因为改动很大，所以作为一个新的日志框架独立使用。

logback的配置文件是`logback.xml`，log4j的配置文件是`log4j.xml`，log4j2的配置文件是`log4j2.xml`。有的日志框架的配置文件也可以是xml以外的文件，比如yaml文件、propertites文件，不过通常会使用xml文件（因人而异）。

### 日志门面commons-logging

门面模式（也叫外观模式），由于市面上的第三方框架较多，往往一个项目中可能引入多种日志（比如使用了某个第三方的库，该库又使用了与项目不同的日志），为了方便管理，同时也是为了面向接口编程，于是不再直接使用某个具体的日志实现，而是借由统一的日志接口来调用具体的日志实现，这样就可以实现项目与日志的解耦。而在使用统一的日志接口时，项目中只能引入一种具体的日志实现框架（即门面模式的应用，此时项目不能同时混用多种日志实现，如果是第三方库引入的日志实现则没事），否则门面接口无法知道项目具体应该使用哪一种日志实现，会抛异常。

最早的日志门面是Apache的commons-logging（简称为jcl），日志门面的用法即为：使用门面接口的API来打印日志，项目会通过Java的SPI机制来自动找到对应的日志实现来完成打印日志的功能：

```java
<dependency>
	<groupId>commons-logging</groupId>
	<artifactId>commons-logging</artifactId>
	<version>1.2</version>
</dependency>
<dependency>
	<groupId>log4j</groupId>
	<artifactId>log4j</artifactId>
	<version>1.2.17</version>
</dependency>

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class Test {
	private final static Log logger = LogFactory.getLog(getClass());
 
	public static void main(String[] args) {
		logger.debug("DEBUG ...");
		logger.info("INFO ...");
		logger.error("ERROR ...");
	}
}
```

通常在导入门面接口和具体的日志实现两个依赖后，再添加对应日志框架的配置文件即可。在集成不同的日志实现时，有的可能需要引入额外的桥接包，因为并不是所有日志实现直接实现了门面接口，可能存在着其他的接口，此时需要通过额外的桥接包来将两者适配起来，相当于一个适配器，比如在集成log4j2的时候就需要额外引入`log4j-jcl`的jar。

可以看到，项目中无需出现具体的日志框架的代码即可完成日志打印，这意味着在切换日志框架时成本很低，完全不需要改动代码，只需要改变具体的日志依赖和对应的配置文件即可。

此外，jcl可以有自身的配置文件`commons-logging.properties`，一般不用这个。因为不同的日志框架有各自不同的特性与优势，最好是使用对应的独立的配置文件来实现解耦。

### 日志门面slf4j

slf4j是Simple Logging Facade for Java，即简单日志门面，是目前较为流行的门面接口，用法和jcl一样，即使用slf4j自身提供的接口来打印日志：

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Test {
  public static void main(String[] args) {
    Logger logger = LoggerFactory.getLogger(getClass());
    logger.info("Test");
  }
}
```

目前很流行的Lombok框架，可以通过一个简单的`@Slf4j`注解来更为简洁方便地来使用Slf4j打印日志：

```java
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <version>1.18.16</version>
  <optional>true</optional>
</dependency>

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Test {
  public static void main(String[] args) {
    log.info("Test");
  }
}
```

无需导包也无需书写Slf4j的接口代码，直接使用`log`变量即可打印日志。

## 参考链接
  
* [使用JDK Logging](https://www.liaoxuefeng.com/wiki/1252599548343744/1264738568571776)
* [jdk-logging、log4j、logback日志介绍及原理](https://my.oschina.net/pingpangkuangmo/blog/406618)