# Log4j.xml中Filter的用法

## 前言

log4j中常用的Filter分为四种：DenyAllFilter、LevelMatchFilter、LevelRangeFilter、StringMatchFilter。
当appender匹配了某个Filter的时候，就不会继续匹配下一个filter，所以当需要配置多个filter时需要注意先后顺序，这样才能实现需要的效果。
这些filter有个共同的属性`AcceptOnMatch`，用来控制匹配到的appender是否打印日志。
<!--more-->

## 只打印指定level的日志

假如现在只希望打印INFO和ERROR级别的日志，可以这样配置：
```xml
<appender name="cntCorelog" class="org.apache.log4j.rolling.RollingFileAppender">
	......
	<filter class="org.apache.log4j.varia.LevelMatchFilter">
		<param name="LevelToMatch" value="INFO" />
		<param name="AcceptOnMatch" value="true"/>
	</filter>
	<filter class="org.apache.log4j.varia.LevelMatchFilter">
		<param name="LevelToMatch" value="ERROR" />
		<param name="AcceptOnMatch" value="true"/>
	</filter>
	<filter class="org.apache.log4j.varia.DenyAllFilter" />
</appender>
```
这里如果不配置最后一个filter，则会放行所有日志输出。

## 不打印指定level的日志

假如不希望打印DEBUG级别的日志，可以这样配置：
```xml
<filter class="org.apache.log4j.varia.LevelMatchFilter">
	<param name="LevelToMatch" value="ERROR" />
	<param name="AcceptOnMatch" value="false" />
</filter>
```

`AcceptOnMatch`表示是否输出日志，这里需要注意的是，一旦匹配了某个filter，就无法再匹配后续的filter了，如下：
```xml
<filter class="org.apache.log4j.varia.LevelMatchFilter">
	<param name="LevelToMatch" value="ERROR" />
	<param name="AcceptOnMatch" value="false" />
</filter>
<filter class="org.apache.log4j.varia.LevelMatchFilter">
	<param name="LevelToMatch" value="ERROR" />
	<param name="AcceptOnMatch" value="true" />
</filter>
```
对于上面的配置，ERROR级别的日志匹配了第一个filter后，结果是被过滤掉不被输出，于是第二个filter就不生效了。

如果将上边的配置颠倒过来，如下：
```xml
<filter class="org.apache.log4j.varia.LevelMatchFilter">
	<param name="LevelToMatch" value="ERROR" />
	<param name="AcceptOnMatch" value="true" />
</filter>
<filter class="org.apache.log4j.varia.LevelMatchFilter">
	<param name="LevelToMatch" value="ERROR" />
	<param name="AcceptOnMatch" value="false" />
</filter>
```
这时候ERROR级别的日志就依然能正常被打印出来。

## 只打印从level A到B之间的所有日志

假如现在只想要打印INFO到ERROR级别之间的日志，可以这样配置：
```xml
<filter class="org.apache.log4j.varia.LevelRangeFilter">
	<param name="LevelMin" value="INFO"/>
	<param name="LevelMax" value="ERROR"/>
	<param name="AcceptOnMatch" value="true" />
</filter>
```
需要注意的是，对于LevelRangeFilter，会匹配所有的appender，如果将该filter置于其他filter的前面，则会导致后续的filter无效。

## 只打印包含某些字符串的日志

假如只希望打印某些字符串的日志，可以这样配置：
```xml
<filter class="org.apache.log4j.varia.StringMatchFilter">
	<param name="StringToMatch" value="test" />
	<param name="AcceptOnMatch" value="true" />
</filter>
```

如上配置，如果日志里包含了`test`这个字符串就会被输出到日志了，如果是包含某些字符串就不打印出来，直接将`AcceptOnMatch`设成`false`就行。

如果不配置StringToMatch的value，该filter无效；如果将其value配置为`""`空字符串，该filter则会匹配所有日志。在StringMatchFilter的源码实现里，是通过`indexOf()`来判断是否包含指定字符串的。