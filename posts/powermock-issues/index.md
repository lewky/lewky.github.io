# PowerMock问题汇总

## PowerMock报错导致无法运行测试类

在执行单元测试时报错如下：

```java
ScriptEngineManager providers.next(): javax.script.ScriptEngineFactory: Provider jdk.nashorn.api.scripting.NashornScriptEngineFactory not a subtype
```

在Stack Overflow上找到了同样的错误，该报错是在使用了PowerMock框架后发生的，奇怪的是，某些同样使用该框架的测试类却不会报错，暂时不明白抛出该异常的根本原因，先记录下解决方法。
<!--more-->
在当前测试类里加上一个忽略该异常的注解：`@PowerMockIgnore`，即可正常运行单元测试，如下：

```java
import org.powermock.core.classloader.annotations.PowerMockIgnore;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore({"javax.script.*"})
public class VendorTest {
//....
}
```

顺带一提，这里使用的PowerMock框架是2.0.2版本的。

## 参考链接

* [Powermock keeps throwing errors for ScriptEngineManager](https://stackoverflow.com/questions/44457080/powermock-keeps-throwing-errors-for-scriptenginemanager)