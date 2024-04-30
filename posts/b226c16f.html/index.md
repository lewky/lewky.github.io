# 特殊的空格-ASCII码值160

## 问题与分析

最近遇到个问题，在页面的搜索框输入带有空格的字符串时，总是无法从db中搜索出来对应的数据，于是将db里的空格复制出来，发现其ASCII码值为160，这才知道，原来ASCII码中除了32之外还有160这个特殊的空格。下边是查看字符对应ASCII值的逻辑：

```java
final char c1 = ' '; //db里的空格
final char c2 = ' '; //手动输入的空格
System.out.println((int)c1); //160
System.out.println((int)c2); //32
```
<!--more-->

平时我们用键盘输入的空格的ASCII值是32，而这个ASCII值为160的空格，其实是不间断空格(non-breaking space)，是不是从来没听说过这东东？其实你平时一定也用过很多次的，就是页面上的`&nbsp;`所产生的空格。

不间断空格non-breaking space的缩写正是nbsp。这中空格的作用就是在页面换行时不被打断，如下：

```html
页面某一行的末尾是一个人名Zhang Xiaoming
```
我们希望在换行时人名不会被打断，导致Zhang 在第一行末尾，而Xiaoming跑到第二行开头，而是保持完整的人名在同一行的末尾，于是就有了不间断空格。(在word中也有这种空格的使用)

如果使用了平常的空格，就会被页面压缩，变成下边这样
```html
页面某一行的末尾是一个人名Zhang 
Xiaoming
```

## 不间断空格的去除

但是不间断空格有个问题，就是它无法被trim()所裁剪，也无法被正则表达式的`\s`所匹配，也无法被StringUtils的isBlank()所识别，也就是说，无法像裁剪寻常空格那样移除这个不间断空格。

我们可以利用不间断空格的Unicode编码来移除它，其编码为`\u00A0`。

解决办法如下：

```java
replace("\u00A0", "")
replaceAll("\\u00A0+", "")  //这是正则表达式的写法

String str = "aacsdfe ";  //包含了不间断空格的字符串
str = str.replace("\u00A0", "");
str = str.replaceAll("\\u00A0+", "");
```