# 由Java正则表达式的灾难性回溯引发的高CPU异常：java.util.regex.Pattern$Loop.match

## 问题与分析

某天领导report了一个问题：线上的CPU自从上一个版本迭代后就一直处于居高不下的状况，领导看着这段时间的曲线图判断是有两条线程在不停的死循环。

接到任务后去查看了AWS的CloudWatch，发现线上CPU确实一直居高不下，使用率基本是之前的两倍；另外发现线程使用率以比之前频繁很多。后来公司的大佬拿到dump后经过分析发现，是由正则表达式造成的CPU持续高使用率的问题。
<!--more-->

堆栈信息如下：
```java
at java.util.regex.Pattern$Loop.match(Pattern.java:4787)
	at java.util.regex.Pattern$GroupTail.match(Pattern.java:4719)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4281)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$GroupCurly.match0(Pattern.java:4487)
	at java.util.regex.Pattern$GroupCurly.match(Pattern.java:4407)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$GroupHead.match(Pattern.java:4660)
	at java.util.regex.Pattern$Loop.match(Pattern.java:4787)
	at java.util.regex.Pattern$GroupTail.match(Pattern.java:4719)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4281)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$GroupCurly.match0(Pattern.java:4487)
	at java.util.regex.Pattern$GroupCurly.match(Pattern.java:4407)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$GroupHead.match(Pattern.java:4660)
	at java.util.regex.Pattern$Loop.match(Pattern.java:4787)
	at java.util.regex.Pattern$GroupTail.match(Pattern.java:4719)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$GroupCurly.match0(Pattern.java:4487)
	at java.util.regex.Pattern$GroupCurly.match(Pattern.java:4407)
	at java.util.regex.Pattern$Curly.match0(Pattern.java:4274)
	at java.util.regex.Pattern$Curly.match(Pattern.java:4236)
	at java.util.regex.Pattern$GroupHead.match(Pattern.java:4660)
	at java.util.regex.Pattern$Loop.matchInit(Pattern.java:4803)
	at java.util.regex.Pattern$Prolog.match(Pattern.java:4743)
	at java.util.regex.Pattern$GroupCurly.match0(Pattern.java:4487)
	at java.util.regex.Pattern$GroupCurly.match(Pattern.java:4407)
	at java.util.regex.Pattern$GroupTail.match(Pattern.java:4719)
	at java.util.regex.Pattern$BranchConn.match(Pattern.java:4570)
	at java.util.regex.Pattern$BmpCharProperty.match(Pattern.java:3800)
	at java.util.regex.Pattern$Branch.match(Pattern.java:4606)
	at java.util.regex.Pattern$GroupHead.match(Pattern.java:4660)
	at java.util.regex.Pattern$Start.match(Pattern.java:3463)
	at java.util.regex.Matcher.search(Matcher.java:1248)
	at java.util.regex.Matcher.find(Matcher.java:637)
	at com.core.cbx.mybatis.plugin.sql.TableAliasParseInjector.getTableAlias(TableAliasParseInjector.java:48)
```

还是第一次知道正则表达式也会引发这种问题，网上查了下资料，原来有不少人也遇到同样的问题。而这个问题，是由正则表达式的灾难性回溯（Catastrophic Backtracking），或者说回溯陷阱造成的。

另外，可以发现在jdk的JIRA里也有人提出了这个issue，不过目前依然还没有解决这个bug，下面是官方的issue链接：[StackOverflowError in java.util.regex.Pattern](https://bugs.openjdk.java.net/browse/JDK-6882582)

## 引擎与回溯

这里引用下一位老哥的原文，简单介绍下正则表达式的引擎和回溯机制。

>正则引擎主要可以分为基本不同的两大类：一种是DFA（确定型有穷自动机），另一种是NFA（不确定型有穷自动机）。简单来讲，NFA 对应的是正则表达式主导的匹配，而 DFA 对应的是文本主导的匹配。
>
>DFA从匹配文本入手，从左到右，每个字符不会匹配两次，它的时间复杂度是多项式的，所以通常情况下，它的速度更快，但支持的特性很少，不支持捕获组、各种引用等等；而NFA则是从正则表达式入手，不断读入字符，尝试是否匹配当前正则，不匹配则吐出字符重新尝试，通常它的速度比较慢，最优时间复杂度为多项式的，最差情况为指数级的。但NFA支持更多的特性，因而绝大多数编程场景下（包括java，js），我们面对的是NFA。

Java的正则表达式引擎用的是NFA算法，在根据正则表达式来匹配文本时，拥有回溯机制。在遇到以下字符时就有可能发生回溯：
1. `?`
2. `+`
3. `*`
4. `{min, max}`

以上四种默认是贪婪模式去匹配文本，也就是说，会尽可能多地去匹配更多的字符。在这个匹配的过程中，必然会一次次地匹配文本，一直到匹配不上时，才会回溯一次，重新用正则表达式的下一个字符去匹配回溯之前匹配不上的文本。

这里说的比较抽象，有兴趣的可以自行搜索下正则表达式的回溯以及贪婪模式、懒惰模式（也叫勉强模式）和独占模式（也叫侵占模式），下面附上一篇图文并茂的文章：[正则表达式三种模式：贪婪模式、懒惰模式、独占模式](https://blog.csdn.net/weixin_42516949/article/details/80858913)

总之，简单地说，由于正则表达式的回溯，如果我们的正则表达式写得不够好，并且被匹配的字符串文本又非常长，就有可能大量触发回溯，导致CPU飙升，甚至是堆栈溢出。这也就是所谓的灾难性回溯，或者说回溯陷阱。

这里还是拿上面文章里的例子来举例：为了校验马来西亚的商店名字，写了如下一条正则表达式：

```java
^([A-Za-z0-9._()&'\\- ]|[aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ])+$
```

这就是一个很简单的`^()+$`结构，由于校验允许使用英文字母大小写、数字、越南文和一些特殊字符如“&”，“-”，“_”等，于是直接把这些字符都塞到`[]`里，然后为了方便观看把越南文特地抽出来塞到另一个`[]`里，最后把这两个`[]`用`|`拼接起来。

看上去非常简单的结构，但却会在线上时不时引发CPU过高的问题，可以用下面的测试类简单跑一下看看：
```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Test {

    private static final String REGEX_TABLE_ALIAS = "^([A-Za-z0-9._()&'\\- ]|[aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ])+$";

    public static void main(final String[] args) {
        final String string = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!";
        final Pattern pattern = Pattern.compile(REGEX_TABLE_ALIAS);
        final Matcher matcher = pattern.matcher(string);
        final boolean result = matcher.find();
        System.out.println(result);
    }
}
```

你会发现，当在校验这个`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!`字符串时，竟然无法立刻打印出校验结果，需要等待相当长的一段时间。如果把这个字符串改成这个，`!aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`，就可以秒出结果。

这两个字符串是一样长，区别仅仅是`!`在首位和末位而已，但在校验时花费的时间却完全不同，原因是`!`是非法字符，但在末位时，会触发大量回溯，如果这个字符串文本有数百位，上千位，就很有可能会发生堆栈溢出。

原文作者的解决方法是把原来的正则表达式改为独占模式，也就是在`+`后加上`+`，将`^()+$`结构变成`^()++$`结构。这种做法我认为其实不太好，独占模式也是会尽可能地匹配更多的字符，但是却不会发生回溯，如果正则表达式写得不好，就可能会校验漏。

其实有个更好的改法，就是单纯把原来的表达式里的两个`[]`合并成一个`[]`，如下：
```java
^([A-Za-z0-9._()&'\\- aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ])+$
```

这时候再去跑上面的测试类，你会发现在校验上面的两个字符串文本时，都可以秒出校验结果。原因是新的表达式减少了回溯的机会，相当于把Java里连续多个if语句给合并成一个了，这样就减少了分支，自然就降低了灾难性回溯的可能性。

## 具体案例与解决方案

上面是其他人遇到的案例，这里说下博主遇到的case以及最终的解决方案。在系统中我们用的是自己魔改过的mybatis，其中有个正则表达式是用来获取sql中的表别名的，如下：
```java
(FROM|JOIN|,)(\\s)+([A-Z0-9_]+(\\s)+[A-Z0-9_]+(,| )*)+(\\s)+(JOIN|WHERE|INNER|LEFT|OUTER|ON|ORDER)
```

这个本来一直都没有问题，直到前段时间系统迭代后，有客户在页面上搜索了一段比较长的字符串。这个搜索的操作其实就是向db发出一条sql，用来模糊查询若干个字段是否含有用户搜索的这段字符串。然后在组装这条sql的时候，会使用到上述的正则表达式来获取表别名，具体组装逻辑这里就不说了。最后组装成的sql比较长，大概一万多个字符（已经简化过了）。之所以这么长，是因为我们会拿用户输入的字符串去挨个模糊查询数据表里的很多个字符类型的列，也就是说，会有大量的`like '%xxxx%'`的部分。

当这条很长的sql被上述的正则表达式匹配时，就会发生灾难性回溯，导致系统长时间假死。这里就不贴出来具体的sql了，就简单分析下上述正则表达式存在什么问题。

表达式分成了三块部分，第一部分是`(FROM|JOIN|,)(\\s)+`，第二部分是`([A-Z0-9_]+(\\s)+[A-Z0-9_]+(,| )*)+`，第三部分是`(JOIN|WHERE|INNER|LEFT|OUTER|ON|ORDER)`。这个很好理解，就是简单匹配下表别名，比如：`from Table_A a, Table_B b where ...`。 

可以发现，表达式的第一部分和第二部分都有`,`，而第二部分的末尾使用了`+`限定必须至少匹配一次，导致当sql过长时并存在大量逗号空格时，会触发大量回溯。为了避免这种情况，应当尽量把第二部分末尾的`+`去掉，如果可能的话，可以转换成`*`。

最终的修改方案是分为了两部分：
第一部分是简化sql，因为原本是直接拿组装后的sql去匹配，其实sql里大量的`like '%xxxx%'`部分毫无意义，因为目的只是拿到表别名而已。所以在匹配之前，把这些模糊匹配的部分直接去掉了。

第二部分是修改正则表达式，测试时直接拿简化前的sql去匹配，如果不会发生灾难性回溯就算过关了。最终修改后的样子如下：
```java
(FROM|JOIN)(\\s)+([A-Z0-9_]+(\\s)+[A-Z0-9_]+((\\s)*(,|JOIN)(\\s)*[A-Z0-9_]+(\\s)+[A-Z0-9_]+)*)(\\s)+(JOIN|WHERE|INNER|LEFT|OUTER|ON|ORDER)
```

这里推荐个在线检查正则表达式匹配字符串文本的网站，可以用来发现是否会触发灾难性回溯：[Online regex tester and debugger: PHP, PCRE, Python, Golang and JavaScript](https://regex101.com/)
关于这个网站的用法可以看看这篇文章的末尾部分：[一个正则表达式引发的血案，让线上CPU100%异常！](https://juejin.im/post/5b287ea6f265da596d04a324)

## 排查高CPU使用率的方法

1. 使用`top`命令查找在大量占用CPU的进程的PID
2. 使用`ps -mp pid -o THREAD,tid,time`定位到大量占用CPU的线程TID；也可以用这个命令直接排序下，更方便找到大量占用CPU的线程：`ps -mp pid -o THREAD,tid,time|uniq -c|sort -nr`
3. 将上述找到的线程TID转换成十六进制：`printf “%x\n” TID`，比如原本的线程TID是28802，可以用上面的命令转成十六进制数7082
4. 使用PID以及刚刚转成十六进制的TID来打印出该线程的堆栈信息：`jstack PID|grep TID -A 100`。也可以把完整的堆栈信息输入到一个log文件里，有两种方法：
    1. 方法一是用`kill -3 PID > threadDump.log 2>&1`，这种方法不适用于JDK1.6以上的版本
    2. 方法二是用`jstack -l PID > threadDump.log 2>&1`
5. 接下来就是分析堆栈信息，定位到问题代码的位置了。

下面简单介绍下上述命令的几个关键参数的含义：
```bat
ps命令：
-m 显示所有的执行者。
-p 指定进程的PID，并列出该进程的状况。
-o 用户自定义输出格式。

uniq命令：
-c 检查文件是否已经按照顺序排序，排序过为真

sort命令：
-n 按照数值大小进行排序
-r 以相反的顺序进行排序，即降序排序，从大排到小

jstack命令：
-l long listing. Prints additional information about locks，会打印出额外的锁信息，可以在发生死锁时用来观察锁持有情况
-m to print both java and native frames (mixed mode),不仅会输出Java堆栈信息，还会输出C/C++堆栈信息（比如Native方法）

kill命令：
-signal 指定发送的信号类型，比如：
-3是打印进程的线程信息，并不会终止进程；
-9是强制杀死进程，一般用于立即杀死无响应或者卡死的进程；
-15是柔和地终止进程，一般会在终止之前保存数据、关闭连接，需要经过一段时间后才会完全退出进程，效果等同于-TERM
```

## 参考链接

* [一个正则表达式引发的血案，让线上CPU100%异常！](https://juejin.im/post/5b287ea6f265da596d04a324)
* [正则表达式的失控——回溯循环](https://www.cnblogs.com/jackablack/p/10751914.html)
* [正则表达式：java.util.regex.Pattern matcher 循环导致高CPU](https://blog.csdn.net/lapush/article/details/92720184)
* [正则表达式三种模式：贪婪模式、懒惰模式、独占模式](https://blog.csdn.net/weixin_42516949/article/details/80858913)
* [StackOverflowError in java.util.regex.Pattern](https://bugs.openjdk.java.net/browse/JDK-6882582)
* [linux系统中,kill -3查看java进程状态无效的解决方法](https://blog.csdn.net/New_Objectc/article/details/50817893)
* [Win下，通过Jstack截取Java进程中的堆栈信息](https://www.cnblogs.com/jilodream/p/5107785.html)
* [linux ps 命令参数详解](https://www.cnblogs.com/jiqing9006/p/10036676.html)
* [Linux下面ps -o是什么意思](https://zhidao.baidu.com/question/560969810.html)
* [kill与kill -9的区别](https://blog.csdn.net/u010486679/article/details/78415666)
* [使用 kill 命令杀死 java进程，你用对了吗？](https://www.jianshu.com/p/77ca821e7151)
* [sort、uniq命令对文本进行排序、单一和重复操作](https://www.iteye.com/blog/langgufu-2277147)