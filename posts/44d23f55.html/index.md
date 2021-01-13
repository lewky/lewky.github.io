# StringUtils.split()和string.split()的区别

## 场景

出于业务考虑，将多个字符串拼接起来时，使用的分隔符是`;,;`。如果要将这样一个拼接来的字符串分割成原本的多个字符串时，就需要使用到jdk自带的split()方法。不过因为公司的编程规范，改为使用了Apache工具类的StringUtils.split()。

之后就发现，当被拼接的字符串里含有`;`或`,`时，就会出现分割不正确的问题。

<!--more-->
## 具体例子

下面的代码，使用了上述的两种split方法，猜猜结果是什么。
```java
public class Test {

    public static void main(final String[] args) {
        final String str = "老肥,老肥;是个,逗比";
        final String seperator = ";,;";
        //Apache工具类的split方法
        final String[] result1 = StringUtils.split(str, seperator);
        for (final String string : result1) {
            System.out.println(string);
        }

        System.out.println("############分割线###########");
        //jdk的split方法
        final String[] result2 = str.split(seperator);
        for (final String string : result2) {
            System.out.println(string);
        }
    }
}
```

分割的结果如下：
```java
老肥
老肥
是个
逗比
############分割线###########
老肥,老肥;是个,逗比
```

## StringUtils.split()和string.split()的区别

`StringUtils.split()`是把分隔符拆成一个个单独的字符，再用这些字符去把字符串进行分割的。只要匹配到了分隔符中的任意一个字符，就会进行分割。而`string.split()`是把分隔符作为一个整体来对字符串进行分割。

比如分隔符是`;,;`，那么在用`StringUtils.split()`时，只要被分割的字符串里遇到`;`或`,`，就会被分割。而在用`string.split()`时，必须被分割的字符串里遇到`;,;`时才会被分割。

另外`string.split()`的分隔符参数其实是正则表达式，而`StringUtils.split()`的分隔符参数就只是个普通的字符串。此外，`StringUtils.split()`是null-safe的，已经帮你判空了，这也是公司规范要我们使用Apache工具类的原因。不过由于这里的业务要求，最终还是选择使用`string.split()`。

最后附上`StringUtils.split()`的部分底层实现：
```
//standard case
while (i < len) {
    if (separatorChars.indexOf(str.charAt(i)) >= 0) {
        if (match || preserveAllTokens) {
            lastMatch = true;
            if (sizePlus1++ == max) {
                i = len;
                lastMatch = false;
            }
            list.add(str.substring(start, i));
            match = false;
        }
        start = ++i;
        continue;
    }
    lastMatch = false;
    match = true;
    i++;
}
```