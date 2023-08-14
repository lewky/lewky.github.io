# Hexo系列(3) - NexT主题和Markdown的写作技巧

## 前言

本系列主要介绍和hexo-NexT主题相关的一些写作技巧，可能会涉及到部分前端知识(不了解也没关系，能用就行)。我之所以选择hexo-NexT来搭建个人网站，一个很重要的原因就是因为简单、方便、快捷！不需要服务器，直接通过Markdown来进行写作，不仅文章布局美观，还可以节省大量的时间。

此外NexT主题很贴心地自带了一些样式，让你可以不需要自己写一大堆html标签就能得到美观的页面效果。
<!--more-->

>本系列针对的是`NexT 5.1.4`版本的样式，请到我的个人站点更加直观地看到页面效果，不便之处还请见谅。
[->这是本文在个人站点的链接<-](/posts/576ee548.html)

## 文本居中引用

该样式可以将一段文本居中显示，并在首尾各自生成一个引号图片，效果如下：

![hexo-write-1.jpg](/images/posts/hexo/writing/hexo-write-1.jpg)

源码如下：
```html
{% cq %}
人类的本质是复读机。

——**复读机**
{% endcq %}
```

原本该样式的字体是黑色的，我把它改成红色了。这里的cq是标签别名，也可以用完整的标签名：
```html
{% centerquote %}
人类的本质是复读机。

——**复读机**
{% endcenterquote %}
```

## 图片突破容器宽度限制

使用此标签引用图片时，图片将自动扩大 26%，并突破文章容器的宽度。 此标签使用于需要突出显示的图片, 图片的扩大与容器的偏差从视觉上提升图片的吸引力。效果如下：

附上一张wlop大大的saber~

![hexo-write-2.jpg](/images/posts/hexo/writing/hexo-write-2.jpg)

使用方式如下：
```html
{% fullimage /image-url, alt, title %}

<!-- 别名 -->
{% fi /image-url, alt, title %}
```

这里的alt和title可以不写，alt属性是找不到图片时显示的文本，title是鼠标停留在图片上时显示的文本。

## Note标签

本标签出自于Bootstrap，使用前需要先启用主题配置文件：
```yml
# 主题自带的标签样式，有 note、label、tabs 三种
# Note tag (bs-callout).
note:
  # Note tag style values:
  #  - simple    bs-callout old alert style. Default.
  #  - modern    bs-callout new (v2-v3) alert style.
  #  - flat      flat callout style with background, like on Mozilla or StackOverflow.
  #  - disabled  disable all CSS styles import of note tag.
  # Note标签的样式有四种：
  #  - simple：默认的样式，也是Bootstrap Callout旧版本的样式。
  #  - modern：Bootstrap Callout新版本(v2-v3)的样式。
  #  - flat：该样式会连同背景也一起渲染，如同Mozilla或者StackOverflow那样。
  #  - disabled：禁用本Note标签。
  style: flat
  icons: true
  border_radius: 3
  # Offset lighter of background in % for modern and flat styles (modern: -12 | 12; flat: -18 | 6).
  # Offset also applied to label tag variables. This option can work with disabled note tag.
  light_bg_offset: 0
```

效果如下：

![hexo-write-3.jpg](/images/posts/hexo/writing/hexo-write-3.jpg)

Note标签一共有以上六种类型：`default,primary,success,info,warning,danger`，源码如下：
```html
{% note default %}default{% endnote %}
{% note primary %}primary{% endnote %}
{% note success %}success{% endnote %}
{% note info %}info{% endnote %}
{% note warning %}warning{% endnote %}
{% note danger %}danger{% endnote %}
```

## Label标签

使用前同样需要启用配置：
```yml
# Label tag.
label: true
```

效果如下：
![hexo-write-4.jpg](/images/posts/hexo/writing/hexo-write-4.jpg)

和Note标签一样，同样是六种类型。@前面是类型，@后面是显示的文本内容。这个label标签的样式并不好看，我基本不用。

## Tab标签

这个标签和浏览器的tab是类似的，使用前也需要启用配置：
```yml
# Tabs tag.
tabs:
  enable: true
  transition:
    tabs: true
    labels: true
  border_radius: 3
```

效果如下：

![hexo-write-5.jpg](/images/posts/hexo/writing/hexo-write-5.jpg)

源码如下：
```html
{% tabs 贴吧, 1 %}
<!-- tab android开发吧 -->
有问题为什么不先问问隔壁Java吧呢？
<!-- endtab -->
<!-- tab java吧 -->
有问题为什么不先问问隔壁C++吧呢？
<!-- endtab -->
<!-- tab c++吧 -->
有问题为什么不先问问隔壁C语言吧呢？
<!-- endtab -->
<!-- tab c语言 -->
有问题为什么不先问问神奇海螺吧呢？
<!-- endtab -->
<!-- tab 神奇海螺 -->
有问必答不知道
<!-- endtab -->
{% endtabs %}
```

简单介绍下常规用法：
1. 源码第一行的数字表示默认显示哪一个tab页面，如果是-1则表示隐藏所有tab页面内容。
2. 如果不为每个tab单独制定名字，则会以第一行源码的名字为每个tab命名，并自动在名字后加上`1,2,3...`以示区分。
3. tab的名字支持fontawesome图标，使用方法是@加上图标的名字，例如`@home`，注意该图标需要添加在tab名字的最后，渲染时图标会自动放在名字最前面，比如：`<!-- tab android开发吧@home -->`

更多用法可以参考[该文章](https://almostover.ru/2016-01/hexo-theme-next-test/#Tab-tag-test)

## 按钮标签样式

这个样式和阅读全文那个按钮一样，效果如下：

![hexo-write-6.jpg](/images/posts/hexo/writing/hexo-write-6.jpg)

源码如下：

```html
{% btn https://www.baidu.com, 点击前往百度, download fa-lg fa-fw %}
```

更多用法可以参考[该文章](https://almostover.ru/2016-01/hexo-theme-next-test/#Button-tag-test)
此外还有其他的标签样式的使用方法，请参考本文末尾的参考链接文章。

## 如何在文章中插入图片

网上有不少办法，有的是启用配置文件中的属性，有的则是安装插件，这里只介绍最简单的一种方法。

* 在 source/ 目录下新建一个文件夹，比如 images；在该文件夹下存放各种图片资源，比如 test.jpg；
* 新建一篇文章，在文章中使用markdown的插入图片语法：

```html
![test](/images/test.jpg)
```

* 这里使用的是绝对路径，如果使用相对路径比如`images/test.jpg`可能会无法访问到该图片资源。建议在博客或者配置中都使用绝对路径。

## 修改默认的post和draft的模板

通过`hexo n post XXX`或者`hexo n draft XXX`所生成的文章或草稿是根据默认的模板来生成的，我们可以自己来定制想要的模板。

在站点根目录下的 scaffolds 文件夹下，存放着 `draft.md`， `page.md` 和 `post.md`这三个文件夹，一般我们只需要修改draft和post这两个模板就行了。

我们可以在模板的文件头里添加自己想要的格式，如下：

```html
---
title: {{ title }}
date: {{ date }}
tags:
categories:
---
```

这样使用命令生成的draft或post都会默认带有上边的文件头了。

## 添加新的模板来生成定制的post

我们还可以在 scaffolds 目录下添加新的模板文件，比如 `Hexo.md`，其模板内容如下：

```html
---
title: {{ title }}
date: {{ date }}
tags:
  - Hexo
categories:
  - Hexo
---
```

然后通过命令：

```bash
hexo n hexo XXX
```

注意，这里的第二个 hexo 指的是我们刚刚新添加的模板文件 `hexo.md` 的文件名；这里的文件名和命令都是大小写不敏感的。

执行完命令会在 source/_posts 目录下生成与 `hexo.md` 模板相对应的文章。

##  如何使用上标、下标

Markdown可以和HTML的语法兼容，可以通过HTML的上标和下标标签来实现效果：

|标签|写法|效果|
|--|--|--|
|上标|`2<sup>10</sup>`|2<sup>10</sup>|
|下标|`H<sub>2</sub>O`|H<sub>2</sub>O|

<!--more-->
这里解释下，sup指的是superscript上标，sub指的是subscript下标。

## 如何给文本加下划线

Markdown可以和HTML的语法兼容，可以通过HTML的`<u>`标签来实现效果：

|写法|效果|
|--|--|
|`<u>下划线</u>`|<u>下划线</u>|

这里解释下，u指的是underline下划线。

**注意**：尽量不要给文本加下划线，因为这会和超链的表现形式混淆，会被误以为是个超链。

## 如何给文本加删除线

用Html的`<s>`来实现：

```
<s>这段文字已经被删除</s>
```

也可以用`~~`来实现：

```
~~这段文字已经被删除~~
```

效果如下：

<s>这段文字已经被删除</s>

## 如何添加分隔线

连续使用三个相同的星号、下划线或者中划线即可，符号之间可以有空格，如下：
```
***

* * *

 ** *
```

效果如下：

下面是分隔线
***
上面是分隔线

## 参考链接

* 官方文档：[内置标签 - NexT 使用文档](https://theme-next.iissnan.com/tag-plugins.html)
* [打造个性超赞博客Hexo+NexT+GitHubPages的超深度优化](https://reuixiy.github.io/technology/computer/computer-aided-art/2017/06/09/hexo-next-optimization.html#好玩的写作样式)
* [样式汇总](https://qianling.pw/style/#TOC数字块)
* [在markdown中如何加入上标、下标？](https://www.jianshu.com/p/13b3366f0260)
* [HTML`<u>`标签](http://www.w3school.com.cn/tags/tag_u.asp)