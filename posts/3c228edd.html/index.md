# JIRA中的标记语言的语法参考

## 前言

看到网上有的文章说JIRA是使用Textile这门标记语言，有些语法和Wikitext和Markdown相像。JIRA在2017年进行了一次大更新，某些语法可能和以前不大一样，这里纪录一下常用的一些语法。

<!--more-->
## 标题

h1.一级标题
h2.二级标题
h3.三级标题
h4.四级标题
h5.五级标题

用法示例：
```
h1.ddd
```

一共有h1到h5这五种大小的标题，但是h6也是有效果的，不过h6起到的作用是将小写字母变成大写字母，示例如下：
```
h6.ddd
```
以上会得到`DDD`的输出。

## 字体

|用法|效果|
|--|--|
|`*黑体*`|**黑体**|
|`_斜体_`|*黑体*|
|`-删除线-`|~~删除线~~|
|`+下划线+`|<u>下划线</u>|
|`~下标~`|<sub>下标</sub>|
|`^上标^`|<sup>上标</sup>|

注意在使用上边这些字体效果的时候，`~`等字符需要和其他文本相隔一个空格，否则没有效果，如下：
```
H ~2~ O
```

## 换行

```
第一行
\\
第二行
```

通过`\\`来进行换行。

## 引用

```
bq. 这是引用，可以使用字体效果并进行换行。
```

通过`bq. `来引用一段文字或图片等，可以在引用段里使用字体效果并进行换行。

不过这个`bq. `用来比较麻烦，用另一种引用的语法`{quote}`更好，而且还可以使用其他更多的效果，如下：
```
{quote}
Perhaps the simplest way to convert to using Log4j 2 is to replace the log4j 1.x jar file with Log4j 2's log4j-1.2-api.jar. However, to use this successfully applications must meet the following requirements: 
 
# They must not access methods and classes internal to the Log4j 1.x implementation such as Appenders, LoggerRepository or Category's callAppenders method. 
# They must not programmatically configure Log4j. 
# They must not configure by calling the classes DOMConfigurator or PropertyConfigurator.
{quote}
```

## 附件

附件有两种方式：
```
[^xxxx.mp4]
或者
!xxxx.mp4!
```

`[^xxxx.mp4]`这种形式类似于超链，`!xxxx.mp4!`这种形式则可以将图片显示出来，或者将视频播放出来。

如果附件是图片，还可以使用以下写法：
```
显示图片的缩略图
!xxxx.jpg|thumbnail!

指定图片的大小
!xxxx.jpg|width=300,height=400!
```

如果附件是视频 ，还可以使用以下写法：
```
指定视频播放器的大小
!xxxx.mp4|width=300,height=400!
```

## 列表

第一种无序列表，会在每行最前边显示一个圆点
```
* 1
* 2
** 2.1
* 3
```

第二种无序列表，会在每行最前边显示一个方块
```
- 1
- 2
-- 2.1
- 3
```

有序列表
```
# 1
# 2
## 2.1
# 3
```

有序列表和无序列表可以混合使用，如下：
```
# 1
# 2
#* 2.1
# 3
```

## 表格

```
表头加粗写法：
||heading 1||heading 2||heading 3||
|col A1|col A2|col A3|
|col B1|col B2|col B3|

表头不加粗写法：
|heading 1|heading 2|heading 3||
|col A1|col A2|col A3|
|col B1|col B2|col B3|
```

## 超链

```
直接贴上一个超链：
[https://lewky.cn]

给超链起一个别名：
[233|https://lewky.cn]
```

此外，可以直接输入JIRA的issue id，会自动转换成特定的超链。

## 转义字符

有些特殊字符在JIRA中具有特殊效果，如果需要输入这些字符，需要进行转义。JIRA使用的转义字符是`\`，用法如下：
```
\{
```

## 表情符号

JIRA支持通过输入一些特定的组合字符来显示成对应的表情符号，比如：
```
:) :( :P :D ;) (y) (n) (i) (/) (x) (!)
(+) (-) (?) (on) (off) (*) (*r) (*g) (*b) (*y) (flag)
(flagoff)
```

## 高级文本格式

可以通过`{panel}`来显示一个模板块，如下：
```
{panel}
Some text
{panel}
```

可以给这个panel起标题：
```
{panel:title=My Title}
Some text with a title
{panel}
```

还可以给这个panel设置css属性：
```
{panel:title=My Title|borderStyle=dashed|borderColor=#ccc|titleBGColor=#F7D6C1|bgColor=#FFFFCE}
a block of text surrounded with a *panel*
yet _another_ line
{panel}
```

## 代码块

代码块通过`{code}`来使用：
```
{code:xml}
<test>
<another tag="attribute"/>
</test>
{code}
```

建议给代码块设置对应的语言，譬如上边的xml，这样写的好处是代码块可以自动使用对应语言的代码高亮，并且当代码过长时会自动生成滚动条，不至于让代码块占据页面的一大块地方。

同样可以给代码块设置标题和css属性：
```
{code:title=Bar.java|borderStyle=solid}
// Some comments here
public String getFoo()
{
return foo;
}
{code}
```

## 参考链接

* [JIRA issue 中的标记语言（Textile）](https://segmentfault.com/a/1190000004086559)
* [Text Formatting Notation Help](https://jira.cbxsoftware.com/secure/WikiRendererHelpAction.jspa?section=all)

