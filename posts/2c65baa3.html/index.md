# Log4j和Log4j2怎么动态加载配置文件

## 应用场景与问题

当项目在运行时，我们如果需要修改log4j 1.X或者log4j2的配置文件，一般来说我们是不能直接将项目停止运行再来修改文件重新部署的。于是就有这样一个问题：如何在不停止当前项目的运行的情况下，让系统能够自动地监控配置文件的修改状况，从而实现动态加载配置文件的功能？而log4j 1.X和log4j2的差别略大，各自应该怎么实现这个功能？
<!--more-->
## log4j 1.X动态加载配置文件

log4j 1.X提供了动态加载配置文件的方法：
```java
DOMConfigurator.configureAndWatch()
PropertyConfigurator.onfigureAndWatch()
```

`DOMConfigurator`对应的是xml配置文件，`PropertyConfigurator`对应的是properties配置文件。这两个类都有`configureAndWatch`这个方法，该方法有个重载方法，如下：
```java
configureAndWatch(String configFilename)
configureAndWatch(String configFilename, long delay)

```

`configureAndWatch`方法用来监控配置文件是否被改动，监控的时间间隔是`delay`参数来决定，如果不传入该参数则使用默认的时间间隔1分钟(60000L)。`configureAndWatch(String configFilename)`实际上还是调用的`configureAndWatch(String configFilename, long delay)`。

## log4j2动态加载配置文件

和log4j 1.X比起来，log4j2的动态加载配置很简单就能实现，不需要另外在代码中调用api，方法如下：
```xml
<configuration monitorInterval="30">
    ...
</configuration>
```

在log4j2.xml配置文件中的`configuration`节点添加`monitorInterval`的值，单位是秒，如果配置的值大于0，则会按照时间间隔来自动扫描配置文件是否被修改，并在修改后重新加载最新的配置文件。如果不配置该值，默认为0，即不扫描配置文件是否被修改。

## Log4j 1.X动态加载配置文件的底层实现原理
### DOMConfigurator#configureAndWatch源码解析

org.apache.log4j.xml.DOMConfigurator#configureAndWatch源码如下：
```java
static public void configureAndWatch(String configFilename, long delay) {
    XMLWatchdog xdog = new XMLWatchdog(configFilename);
    xdog.setDelay(delay);
    xdog.start();
}
```

这里new了一个XMLWatchdog对象，接着设置了delay参数，最后调用了start()方法。
watchdog是看门狗、检查者的意思，XMLWatchdog继承了FileWatchdog这个类，在XMLWatchdog中仅仅重写了doOnChange方法：
```java
public void doOnChange() {
    new DOMConfigurator().doConfigure(filename, LogManager.getLoggerRepository());
}
```

从方法名就可以看出来，如果XMLWatchdog监控到配置文件被改动了，就会调用这个doOnChange方法，用来重新加载配置文件。那么它又是怎么知道配置文件被改动过了呢？接着看其父类FileWatchdog的源码：
```java
public abstract class FileWatchdog extends Thread {

  /**
     The default delay between every file modification check, set to 60
     seconds.  */
  static final public long DEFAULT_DELAY = 60000; 
  /**
     The name of the file to observe  for changes.
   */
  protected String filename;
  
  /**
     The delay to observe between every check. By default set {@link
     #DEFAULT_DELAY}. */
  protected long delay = DEFAULT_DELAY; 
  
  File file;
  long lastModif = 0; 
  boolean warnedAlready = false;
  boolean interrupted = false;

  protected FileWatchdog(String filename) {
    super("FileWatchdog");
    this.filename = filename;
    file = new File(filename);
    setDaemon(true);
    checkAndConfigure();
  }

  /**
     Set the delay to observe between each check of the file changes.
   */
  public void setDelay(long delay) {
    this.delay = delay;
  }

  abstract protected void doOnChange();

  protected void checkAndConfigure() {
    boolean fileExists;
    try {
      fileExists = file.exists();
    } catch(SecurityException  e) {
      LogLog.warn("Was not allowed to read check file existance, file:["+
          filename+"].");
      interrupted = true; // there is no point in continuing
      return;
    }

    if(fileExists) {
      long l = file.lastModified(); // this can also throw a SecurityException
      if(l > lastModif) {           // however, if we reached this point this
    lastModif = l;              // is very unlikely.
    doOnChange();
    warnedAlready = false;
      }
    } else {
      if(!warnedAlready) {
    LogLog.debug("["+filename+"] does not exist.");
    warnedAlready = true;
      }
    }
  }

  public void run() {    
    while(!interrupted) {
      try {
        Thread.sleep(delay);
      } catch(InterruptedException e) {
    // no interruption expected
      }
      checkAndConfigure();
    }
  }
}
```

可以看到，FileWatchdog继承了Thread类，类里定义了几个成员变量，比如默认的监控时间间隔等。而在该类的构造方法中可以看到，首先该线程类将名字设定成`FileWatchdog`，接着根据传入的配置文件的路径new了一个File对象，然后该线程类又设置成了守护线程(daemon thread)，最后调用了`checkAndConfigure()`。

在`checkAndConfigure()`中，则是对new出来的配置文件File对象进行检查是否存在该文件，若不存在该文件则会设置成员变量的值，这样就不会去监控不存在的配置文件了。如果该配置文件存在，则通过`lastModified()`来获取文件的最后更新时间，和上次的更新时间作对比，如果比上次更新时间大则会调用`doOnChange()`来重新加载配置文件。

而在FileWatchdog的run方法中，则是在无限循环中先让线程睡眠设置好的监控时间间隔，然后调用`checkAndConfigure()`。

### 总结

可以看出，在log4j 1.X的DOMConfigurator中，是通过创建一个守护线程来不停地扫描配置文件的最后更新时间，并和上次的更新时间进行对比，如果最后更新时间大于上次更新时间则会重新加载配置文件。

### PropertyConfigurator#configureAndWatch源码解析

PropertyConfigurator的`configureAndWatch()`其实和DOMConfigurator差不多，区别是PropertyConfigurator在方法里new了一个PropertyWatchdog对象，PropertyWatchdog和XMLWatchdog一样继承了FileWatchdog，一样重写了doOnChange()方法。只是PropertyWatchdog是通过new PropertyConfigurator().doConfigure()来加载配置文件的。

从源码实现来看，无论是使用xml配置文件，还是使用properties配置文件，其动态加载配置文件的底层实现是基本一样的。可以通过解析配置文件的文件后缀来判断是xml还是properties文件，然后调用对应的方法即可，大概的思路如下：
```java
boolean flag = true;
boolean isXml = StringUtils.equalsIgnoreCase("xml", StringUtils.substringAfterLast(filepath, "."));
ling delay = 30000;

if (isXml) {
  if (flag) {
    DOMConfigurator.configureAndWatch(filepath, delay);
  } else {
    DOMConfigurator.configure(filepath);
  }
} else {
  if (flag) {
    PropertyConfigurator.configureAndWatch(filepath, delay);
  } else {
    PropertyConfigurator.configure(filepath);
  }
}
```

## log4j2底层实现动态加载配置文件的简单解析

虽然log4j2的动态加载配置很简单，但其底层实现比起log4j 1.X却要复杂很多，使用到了很多并发包下的类，具体也不是很了解，这里简单解释下流程。

对于log4j2.xml文件，对应的是`org.apache.logging.log4j.core.config.xml.XmlConfiguration`这个类。如果在log4j2.xml里配置了monitorInterval，在构建XmlConfiguration时会根据该值来走一段特定的逻辑：
```java
for (final Map.Entry<String, String> entry : attrs.entrySet()) {
    final String key = entry.getKey();
    final String value = getStrSubstitutor().replace(entry.getValue());
    if ("status".equalsIgnoreCase(key)) {
        statusConfig.withStatus(value);
    } else if ("dest".equalsIgnoreCase(key)) {
        statusConfig.withDestination(value);
    } else if ("shutdownHook".equalsIgnoreCase(key)) {
        isShutdownHookEnabled = !"disable".equalsIgnoreCase(value);
    } else if ("shutdownTimeout".equalsIgnoreCase(key)) {
        shutdownTimeoutMillis = Long.parseLong(value);
    } else if ("verbose".equalsIgnoreCase(key)) {
        statusConfig.withVerbosity(value);
    } else if ("packages".equalsIgnoreCase(key)) {
        pluginPackages.addAll(Arrays.asList(value.split(Patterns.COMMA_SEPARATOR)));
    } else if ("name".equalsIgnoreCase(key)) {
        setName(value);
    } else if ("strict".equalsIgnoreCase(key)) {
        strict = Boolean.parseBoolean(value);
    } else if ("schema".equalsIgnoreCase(key)) {
        schemaResource = value;
    } else if ("monitorInterval".equalsIgnoreCase(key)) {
        final int intervalSeconds = Integer.parseInt(value);
        if (intervalSeconds > 0) {
            getWatchManager().setIntervalSeconds(intervalSeconds);
            if (configFile != null) {
                final FileWatcher watcher = new ConfiguratonFileWatcher(this, listeners);
                getWatchManager().watchFile(configFile, watcher);
            }
        }
    } else if ("advertiser".equalsIgnoreCase(key)) {
        createAdvertiser(value, configSource, buffer, "text/xml");
    }
}
```

可以看到，如果monitorInterval的值大于0，则会拿到WatchManager并设置扫描配置文件的时间间隔，如果配置文件存在，则会new一个ConfiguratonFileWatcher对象，并将配置文件和该对象一起传递给WatchManager的watchFile方法。这两个方法的底层实现很绕，比起log4j 1.X要复杂得多，不容易看懂。不过最终实现的效果还是一样的，依然会开启一个守护线程来监控配置文件是否被改动。

区别在于，log4j2使用线程池来启动线程，在`WatchManager#start()`里实现的：
```java
@Override
public void start() {
    super.start();
    if (intervalSeconds > 0) {
        future = scheduler.scheduleWithFixedDelay(new WatchRunnable(), intervalSeconds, intervalSeconds,
                TimeUnit.SECONDS);
    }
}
```

而该方法则是在启动配置文件时被调用的，`AbstractConfiguration#start()`：
```java
/**
 * Start the configuration.
 */
@Override
public void start() {
    // Preserve the prior behavior of initializing during start if not initialized.
    if (getState().equals(State.INITIALIZING)) {
        initialize();
    }
    LOGGER.debug("Starting configuration {}", this);
    this.setStarting();
    if (watchManager.getIntervalSeconds() > 0) {
        watchManager.start();
    }
    ...
}
```

这里只是简单解析了下主要的流程，具体的实现细节目前还看不太懂，有兴趣的可以自己去看看log4j2的源码。另外我在官方文档里看到说`monitorInterval`的最小值是5，但是在源码里也没看到这个，我觉得只要配置值大于0应该就是可以的。有不对之处，欢迎指出。

这是官方原文：
>###Automatic Reconfiguration
When configured from a File, Log4j has the ability to automatically detect changes to the configuration file and reconfigure itself. If the monitorInterval attribute is specified on the configuration element and is set to a non-zero value then the file will be checked the next time a log event is evaluated and/or logged and the monitorInterval has elapsed since the last check. The example below shows how to configure the attribute so that the configuration file will be checked for changes only after at least 30 seconds have elapsed. The minimum interval is 5 seconds.

## 参考链接

* [Log4j 2.0 的新特性](https://www.oschina.net/translate/the-new-log4j-2-0?lang=chs&p=1)
* [Log4j – Configuring Log4j 2 - Apache Log4j 2](http://logging.apache.org/log4j/2.x/manual/configuration.html#AutomaticConfiguration)