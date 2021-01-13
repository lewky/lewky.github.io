# Log4j2中LevelRangeFilter的注意点

## LevelRangeFilter的注意点

在log4j2中，LevelRangeFilter的minLevel，maxLevel的配置是和log4j 1.x相反的；minLevel需要配置的是高级别，maxLevel配置的是低级别，如下：

```xml
<LevelRangeFilter minLevel="fatal" maxLevel="info" onMatch="ACCEPT" onMismatch="DENY"/>
```

如上边的配置，是打印info到fatal级别的log，**如果配置反过来，则不会输出任何log。**

如果不配置minLevel、maxLevel、onMatch和onMismatch的值，则会为其设置默认值，在LevelRangeFilter中的源码实现如下：<!--more-->
```java
@PluginFactory
public static LevelRangeFilter createFilter(
	// @formatter:off
	@PluginAttribute("minLevel") final Level minLevel,
	@PluginAttribute("maxLevel") final Level maxLevel,
	@PluginAttribute("onMatch") final Result match,
	@PluginAttribute("onMismatch") final Result mismatch) {
	// @formatter:on
	final Level actualMinLevel = minLevel == null ? Level.ERROR : minLevel;
	final Level actualMaxLevel = maxLevel == null ? Level.ERROR : maxLevel;
	final Result onMatch = match == null ? Result.NEUTRAL : match;
	final Result onMismatch = mismatch == null ? Result.DENY : mismatch;
	return new LevelRangeFilter(actualMinLevel, actualMaxLevel, onMatch, onMismatch);
}
```

至于为什么把最大最小level的值配置反了就会无法输出，是因为在LevelRangeFilter中的源码实现如下：
```java
private Result filter(final Level level) {
	return level.isInRange(this.minLevel, this.maxLevel) ? onMatch : onMismatch;
}
```

可以看到，在调用filter方法进行过滤时，是调用了`level#isInRange()`来判断是否匹配该filter的。而在该方法中，实现如下：
```java
public boolean isInRange(final Level minLevel, final Level maxLevel) {
	return this.intLevel >= minLevel.intLevel && this.intLevel <= maxLevel.intLevel;
}
```

这里通过对比Level对象的intLevel值(int)来判断是否匹配，而这些Level对象也在Level这个类里进行里实例化：
```java
static {
	OFF = new Level("OFF", StandardLevel.OFF.intLevel());
	FATAL = new Level("FATAL", StandardLevel.FATAL.intLevel());
	ERROR = new Level("ERROR", StandardLevel.ERROR.intLevel());
	WARN = new Level("WARN", StandardLevel.WARN.intLevel());
	INFO = new Level("INFO", StandardLevel.INFO.intLevel());
	DEBUG = new Level("DEBUG", StandardLevel.DEBUG.intLevel());
	TRACE = new Level("TRACE", StandardLevel.TRACE.intLevel());
	ALL = new Level("ALL", StandardLevel.ALL.intLevel());
}
```

可以看到，这些Level对象的intLevel值是由另一个枚举类`StandardLevel`来提供的：
```java
/**
* No events will be logged.
*/
OFF(0),

/**
* A severe error that will prevent the application from continuing.
*/
FATAL(100),

/**
* An error in the application, possibly recoverable.
*/
ERROR(200),

/**
* An event that might possible lead to an error.
*/
WARN(300),

/**
* An event for informational purposes.
*/
INFO(400),

/**
* A general debugging event.
*/
DEBUG(500),

/**
* A fine-grained debug message, typically capturing the flow through the application.
*/
TRACE(600),

/**
* All events should be logged.
*/
ALL(Integer.MAX_VALUE);
```

可以看到，Level级别越高，其对应的intLevel值越小，可以这样理解：级别越高，能打印出来的日志信息就越少，所以其intLevel值就越小。

如果我们把LevelRangeFilter的minLevel、maxLevel配置反了，会导致`level#isInRange()`返回false，最终也就没有任何日志得以输出了。
