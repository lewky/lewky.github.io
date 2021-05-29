# Hexo系列(2.0) - NexT主题美化与博客功能增强 · 第一章

## 前言

网上有不少相关的帖子，不过版本会比较旧，而不同版本可能存在代码不同的问题，不过大部分还是大同小异，本系列就不啰嗦重复了，基本只会按照本人所使用的版本以及个人所使用到的内容来进行介绍。

该系列是对我所使用的Next主题进行个性化定制，涉及到js和css等的修改，还有各种插件的使用，包括使用过程中的一些踩坑记录；另外也会对Next主题进行一些写作技巧的介绍与运用，希望能对大家有所帮助。有疑问的朋友可以给我留言，我会尽可能回复`O(∩_∩)O`。

<!--more-->

我所使用的Hexo和NexT的版本如下：

```bash
hexo: 3.7.1
next: 5.1.4
```

另外本文篇幅太长，阅读体验不好，将其进行分章如下：

* [Hexo系列(2.0) - NexT主题美化与博客功能增强 · 第一章](/posts/hexo-2.html/)
* [Hexo系列(2.1) - NexT主题美化与博客功能增强 · 第二章](/posts/hexo-2.1.html/)

## 关于配置文件

对于使用了Next主题的Hexo静态博客，存在着两个至关重要的配置文件`_config.yml`。在本系列中，统一将位于站点根目录下的该文件称为`站点配置文件`，将位于`themes\next`目录下的该文件称为`主题配置文件`。

## 准备工作：添加美化博客的相关文件

本系列会使用到大量的css与JavaScript的相关内容，为了更有效率与可观赏性的美化博客，我们将这些美化相关的东西都尽可能地写到一类文件中，方便日后查询与修改。譬如下边的几个文件里，就存放了博客的大部分美化内容：

1. themes/next/source/css/_custom/custom.styl
2. themes/next/source/js/src/custom.js
3. themes/next/layout/_partials/head/custom-head.swig
4. themes/next/layout/_custom/custom-foot.swig

除了第一个文件`custom.styl`保存的是css代码，另外三个文件都是保存的js代码。这几个文件分别会在页面的以下位置中被引入：

```html
<html>
  <head>
    ....
    {{ custom.styl }}  //css
    ....
    {{ custom-head.swig }}  //js
    ....
  </head>
  <body>
    ....
    ....
    {{ custom-foot.swig }}  //js
    {{ custom.js }}  //js
  </body>
</html>
```

这里的`custom.styl`，`custom-head.swig`是原本的NexT主题自带的，另外两个是我自己添加的，之所以又添加了另外两个js文件，是因为在页面的不同地方引入js文件会对页面产生不一样的效果与影响。

### 添加 custom-foot.swig 文件

在`themes/next/layout/_custom/`目录下添加`custom-foot.swig`文件，该文件内容如下：

```html
{#
Custom foot in body, Can add script here.
#}
<!-- 自定义的js文件 -->
<script type="text/javascript" src="/js/src/custom.js"></script>
```

接着修改`themes\next\layout\_layout.swig`，在body标签的闭合标签前添加一行代码，表示将我们新添加的`custom-foot.swig`文件包括进去：

```html
<body>
  ....

  {% include '_custom/custom-foot.swig' %}
</body>
</html>
```

这个文件的作用是负责引入我们想要的js文件，比如其他第三方js的cdn等等。因为页面在引入js文件时是阻塞式的，如果我们在页面的最开始就引入这些js文件，而这些文件又比较大，会造成页面在渲染时长时间处于白屏状态。

### 添加 custom.js 文件

在`themes/next/source/js/src`目录下添加`custom.js`文件，该文件用来存放我们自己写的js函数等等，需要注意的是，我们之前是在`custom-foot.swig`文件中的script标签里引入了该文件，也就是说，在该文件里，我们不能再自己添加script标签了，直接书写js函数就行了，如下所示：

```html
/* 返回随机颜色 */
function randomColor() {
	return "rgb("+~~(255*Math.random())+","+~~(255*Math.random())+","+~~(255*Math.random())+")";
}
```

## 改变页面的字体大小

打开 `themes\next\source\css\_variables\base.styl`，该文件保存了一些基础变量的值，我们找到`$font-size-base`，将值改为`16px`。

```html
// Font size
$font-size-base           = 16px
```

这个文件里定义了很多常量，有兴趣的可以自己去琢磨琢磨，修改一些其他的变量。

## 文章启用tags和categories

可能是该版本的NexT主题的关系，在我第一次使用NexT主题时，折腾了很久都没办法让菜单栏里的tags和categories的页面生效，一直显示白屏。后来终于在知乎找到答案，首先我们需要将某篇文章设置tags和categories，如下：

```html
---
title: Test
tags:
  - MyTag
categories:
  - MyCategory
date: 20xx-xx-xx xx:xx:xx
---
```

接下来是重点了，首先确定是否已经在主题配置文件中启用了tags和categories这两个菜单，如下：

```html
menu:
  home: / || fas fa-home
  archives: /archives/ || fas fa-archive
  categories: /categories/ || fas fa-th
  tags: /tags/ || fas fa-tags
```

接着确定是否在source目录下是否已经存在tags和categories这两个文件夹，如果不存在需要运行下边的命令：

```bash
hexo n page tags
hexo n page categories
```

运行之后会在source目录下生成对应的两个文件夹，在文件夹下会存在一个index.md文件，打开这两个index.md文件，分别添加`type: tags`和`type: categories`，如下：

```html
---
title: 标签
date: 20xx-xx-xx xx:xx:xx
type: tags
---
```

```html
---
title: 分类
date: 20xx-xx-xx xx:xx:xx
type: categories
---
```

接下来重新使用本地调试三连，就可以看到tags和categories这两个菜单的页面显示正常了。

## 去掉图片边框

NexT主题默认会有图片边框，不太好看，我们可以把边框去掉。打开 `themes\next\source\css\_custom\custom.styl`，添加如下CSS代码：

```css
/* 去掉图片边框 */
.posts-expand .post-body img {
    border: none;
    padding: 0px;
}
.post-gallery .post-gallery-img img {
    padding: 3px;
}
```

## 修改语法高亮的主题

语法高亮就是在引入代码时让代码呈现特定的样式，而在Markdown文件中语法高亮的使用方法是在引入代码的前一行添加三个反引号加上使用的语言名字，然后在引入代码的下一行使用三个反引号结尾。

如下所示的格式，就表示html代码的语法高亮：

```html
<h2>Hello World!</h2>
```

其源码如下：

```html
<h2>Hello World!</h2>
```

由于NexT默认的语法高亮的主题比较一般，我们可以换成其他的主题，比如我所使用的就是黑色的主题。

打开主题配置文件，修改如下配置：

```html
# 语法高亮主题
# Code Highlight theme
# Available value:
#    normal | night | night eighties | night blue | night bright
# https://github.com/chriskempson/tomorrow-theme
highlight_theme: night eighties
```

## 指定`Markdown`的解析器

上边我们设置了语法高亮后，虽然在本地调试没有问题，然而当我们将博客部署到`GitHub Pages`和 `Coding Pages`后却发现，前者的页面不支持语法高亮，而后者支持。百度后才知道原来是因为 GitHub 默认使用的 Markdown 解析器不支持语法高亮，解决方法如下：

打开站点配置文件`_config.yml`，在末尾添加如下内容：

```html
markdown: redcarpet
redcarpet:
    extensions: ["fenced_code_blocks", "autolink", "tables", "strikethrough"]
```

接下来重新执行部署三连命令，就会发现 `GitHub Pages` 上部署的页面语法高亮显示成功了。

## 添加背景图片轮播

### 动态背景图片插件`jquery-backstretch`

`jquery-backstretch`是一款简单的jQuery插件，可以用来设置动态的背景图片，以下是官方网站的介绍。	

>A simple jQuery plugin that allows you to add a dynamically-resized, slideshow-capable background image to any page or element.

可以直接在页面中引入该插件的cdn来调用函数，也可以直接下载下来使用，这是<a href="https://www.bootcdn.cn/jquery-backstretch/">官方地址</a>。

鉴于cdn的地址偶尔发发生改变，这里提供该插件的GitHub仓库地址：https://github.com/jquery-backstretch/jquery-backstretch

如果本文提及的cdn地址不正确，可能是发生了迁移，建议自行百度最新的cdn地址。

下面是jquery-backstretch的使用方法。

### 引入该插件的cdn

打开`themes\next\layout\_custom\custom-foot.swig`，引入该背景图片插件的cdn：

```html
{#
Custom foot in body, Can add script here.
#}
<!-- 图片轮播js文件cdn -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-backstretch/2.0.4/jquery.backstretch.min.js"></script>

<!-- 自定义的js文件 -->
<script type="text/javascript" src="/js/src/custom.js"></script>
```

需要注意的是，我们要引入的插件cdn，都需要在自定义的js文件`custom.js`之前引入才行！否则，插件会在访问页面时无法生效，可以在浏览器的控制台看到报错。

### 调用`backstretch`函数

在`themes\next\source\js\src\custom.js`中添加如下代码：

```html
/* 轮播背景图片 */
$(function () {
	$.backstretch([  
		  "/images/background/saber1.jpg",
		  "/images/background/saber2.jpg",
		  "/images/background/bg1.jpg"
	], { duration: 60000, fade: 1500 });  
});
```

这里可以随意添加你想要轮播的图片，但要确保图片路径是正确的，比如我的背景图片就存放在站点根目录下的`images/background/`目录下。

然后`duration`指的是轮换图片的时间，单位是毫秒，也就是说这里的代码表示一分钟就轮换到下一张图片；

`fade`指的是轮换图片时会有个渐进渐出的动作，而这个过程需要花费的时间单位也是毫秒，如果不加上这个参数，就表示离开轮换成下一张图片。

注意这里的`$.backstretch`指的是对整个页面设置背景图片，我们也可以专门给某个元素设置背景图片，如下：

```html
$(function () {
	$(".saber1").backstretch(["/images/background/saber1.jpg"]);  
	$(".saber2").backstretch(["/images/background/saber2.jpg"]);  
});
```

如果只有一张图片，就没必要设置`duration`和`fade`参数了。

### 为背景图片设置样式

虽然我们设置好了背景图片，但如果页面的许多元素是不透明的，背景图片可能并不能很好地被看见，所以我们可以对背景图片和其他的页面元素进行设置样式。

首先为背景图片设置透明度，因为有的图片颜色比较深厚，而页面多为白色，然后造成喧宾夺主的感觉。

```css file:themes\next\source\css\_custom\custom.styl
/* 背景图片透明度 */
.backstretch {
    opacity: .75;
}
```

接下来设置页面元素透明度，需要注意的是，如果我们在主题配置文件中启用了搜索功能，那么就不能简单粗暴地直接将整个页面都设置透明度，这会导致搜索框失效，无法正常使用。原因是因为搜索框是通过jQuery临时添加的，如果整个页面都设置了透明度，会导致搜索框的`z-index`失效而无法触发点击事件。

我在折腾了一段时间后，终于想到了个取巧的方法，那就是将搜索框的父元素设置为白色透明的，而其他页面元素则直接设置透明度，如下：

```css file:themes\next\source\css\_custom\custom.styl
/* 页面透明度 */
.content-wrap, .sidebar {
    opacity: .9 !important;
}
.header-inner {
    background: rgba(255, 255, 255, 0.9) !important;
}
```

## 添加GitHub彩带和GitHub Corner

### 页面右上角添加GitHub彩带

你可以在<a href="https://github.com/blog/273-github-ribbons" target="_blank">这里</a>找到一共12种样式的GitHub彩带，复制其中的超链代码。

在`themes\next\layout\_layout.swig`目录下找到头部彩带相关的代码：

```html
<div class="headband"></div>
```

在这里的div标签内部添加我们刚刚复制的超链代码，并修改超链指向你的GitHub地址：

```html
<div class="headband">
    <a href="https://github.com/lewky"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png" alt="Fork me on GitHub"></a>
</div>
```

当然我本人并不是很推荐用这种方法，因为这个超链使用的图片有时候会加载很久，最后图片还是挂掉了，我是直接将图片保存到站点的images目录下，然后直接使用自己站点的图片，这样可以避免加载过久甚至图片挂掉的情况。

```html
<div class="headband">
	<a href="https://github.com/lewky" target="_blank"><img style="position: absolute; top: 0; right: 0; border: 0;" src="/images/headband/forkme_right_red.png" alt="Fork me on GitHub"></a>
</div>
```

我只找到了10张彩带图片，可以直接在我的<a href="https://github.com/lewky/lewky.github.io/tree/dev/source/images/headband" target="_blank">GitHub项目</a>中找到这些图片并复制到自己的站点上。

### 页面右上角添加GitHub Corner

这是我后来在其他博客中见到的，可能是6.x.x版本的NexT主题自带的，由于我使用的主题版本较低，只能自己添加了。

还是在`themes\next\layout\_layout.swig`目录下，找到如下代码：

```html
<header id="header" class="header" itemscope itemtype="http://schema.org/WPHeader">
    <div class="header-inner"> {%- include '_partials/header.swig' %} </div>
</header>
```

我们在这个header标签的下边，添加一个超链代码：

```html
<a href="https://github.com/lewky" class="github-corner" target="_blank" title="Follow me on GitHub" aria-label="Follow me on GitHub">
      <svg width="80" height="80" viewBox="0 0 250 250" style="fill:#222; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
	<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
      </svg>
</a>
```

将上边的超链的href改为自己的GitHub地址，然后我们需要修改这个超链的样式，在上文中提及的`themes/next/source/css/_custom/custom.styl`里添加如下代码：

```html
/* GitHub Cornor */
.github-corner :hover .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
}
@media (max-width: 991px) {
  .github-corner >svg {
    fill: #fff !important;
    color: #222 !important;
  }
  .github-corner .github-corner:hover .octo-arm {
    animation: none;
  }
  .github-corner .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
}
@-moz-keyframes octocat-wave {
  0%, 100% {
    -webkit-transform: rotate(0);
    -moz-transform: rotate(0);
    -ms-transform: rotate(0);
    -o-transform: rotate(0);
    transform: rotate(0);
  }
  20%, 60% {
    -webkit-transform: rotate(-25deg);
    -moz-transform: rotate(-25deg);
    -ms-transform: rotate(-25deg);
    -o-transform: rotate(-25deg);
    transform: rotate(-25deg);
  }
  40%, 80% {
    -webkit-transform: rotate(10deg);
    -moz-transform: rotate(10deg);
    -ms-transform: rotate(10deg);
    -o-transform: rotate(10deg);
    transform: rotate(10deg);
  }
}
@-webkit-keyframes octocat-wave {
  0%, 100% {
    -webkit-transform: rotate(0);
    -moz-transform: rotate(0);
    -ms-transform: rotate(0);
    -o-transform: rotate(0);
    transform: rotate(0);
  }
  20%, 60% {
    -webkit-transform: rotate(-25deg);
    -moz-transform: rotate(-25deg);
    -ms-transform: rotate(-25deg);
    -o-transform: rotate(-25deg);
    transform: rotate(-25deg);
  }
  40%, 80% {
    -webkit-transform: rotate(10deg);
    -moz-transform: rotate(10deg);
    -ms-transform: rotate(10deg);
    -o-transform: rotate(10deg);
    transform: rotate(10deg);
  }
}
@-o-keyframes octocat-wave {
  0%, 100% {
    -webkit-transform: rotate(0);
    -moz-transform: rotate(0);
    -ms-transform: rotate(0);
    -o-transform: rotate(0);
    transform: rotate(0);
  }
  20%, 60% {
    -webkit-transform: rotate(-25deg);
    -moz-transform: rotate(-25deg);
    -ms-transform: rotate(-25deg);
    -o-transform: rotate(-25deg);
    transform: rotate(-25deg);
  }
  40%, 80% {
    -webkit-transform: rotate(10deg);
    -moz-transform: rotate(10deg);
    -ms-transform: rotate(10deg);
    -o-transform: rotate(10deg);
    transform: rotate(10deg);
  }
}
@keyframes octocat-wave {
  0%, 100% {
    -webkit-transform: rotate(0);
    -moz-transform: rotate(0);
    -ms-transform: rotate(0);
    -o-transform: rotate(0);
    transform: rotate(0);
  }
  20%, 60% {
    -webkit-transform: rotate(-25deg);
    -moz-transform: rotate(-25deg);
    -ms-transform: rotate(-25deg);
    -o-transform: rotate(-25deg);
    transform: rotate(-25deg);
  }
  40%, 80% {
    -webkit-transform: rotate(10deg);
    -moz-transform: rotate(10deg);
    -ms-transform: rotate(10deg);
    -o-transform: rotate(10deg);
    transform: rotate(10deg);
  }
}
```

这段长长的css代码是令这个GitHub Corner能够呈现出响应式的效果，当你缩放页面的时候，你会发现页面右上角的GitHub的吉祥物——章鱼猫(Octocat)会随着页面的大小变化而变化！

此外，当我们将鼠标移动到GitHub Corner的上方时，章鱼猫的手臂还会摆动一下哦~

下边是GitHub Corner的项目地址，一共有10种颜色样式，任君选择！
* [GitHub Corners项目地址](http://tholman.com/github-corners/)

## 站点首页不显示文章全文

### 文章摘要设置

打开主题配置文件 _config.yml 文件，找到如下：

```html
# Automatically Excerpt. Not recommend.
# Please use <!-- more --> in the post to control excerpt accurately.
auto_excerpt:
  enable: false
  length: 150
```

把这里的false改为true就可以了在首页启动显示文章预览了，length是显示预览的长度。

这里我们可以通过在文章使用`<!-- more -->`标志来精确控制文章的摘要预览，比如这篇文章就是在这个段落的末尾添加了该标志，所以本文在首页的预览就会显示到这个段落为止。

强烈推荐使用该`<!-- more -->`标志来控制文章的摘要预览，因为这种方式可以让摘要也按照css文件中的样式来渲染。如果使用了自动摘要的功能，你会发现文章摘要是一大团没有样式的文本，很是难看。

### 其他的文章配置

```html
# ---------------------------------------------------------------
# Post Settings
# ---------------------------------------------------------------

# Automatically scroll page to section which is under <!-- more --> mark.
# 自动将页面滚动到<!-- more -->标记下的地方。
scroll_to_more: false

# Automatically saving scroll position on each post/page in cookies.
# 自动保存每篇文章或页面上一次滚动的地方。
save_scroll: false

# Automatically excerpt description in homepage as preamble text.
# 自动在首页对文章进行摘要描述作为前言文本。
excerpt_description: true

# Automatically Excerpt. Not recommend.
# Please use <!-- more --> in the post to control excerpt accurately.
# 不推荐使用自动摘要。
# 请在文章中使用<!-- more -->标志来精确控制摘要长度。
auto_excerpt:
  enable: true
  length: 200

# Post meta display settings
# 文章元数据展示设置
post_meta:
  # 文本显示
  item_text: true
  # 创建时间
  created_at: true
  # 更新时间
  # 这个更新时间有点问题，因为每次重新生成文章/部署时都会刷新更新时间，不建议使用
  updated_at: false
  # 目录分类
  categories: true

# Post wordcount display settings
# Dependencies: https://github.com/willin/hexo-wordcount
# 文章字数展示设置
post_wordcount:
  # 文本显示
  item_text: true
  # 文章字数统计
  wordcount: true
  # 阅读时长
  min2read: true
  # 站点总字数统计
  totalcount: true
  # 该post_wordcount的所有设置另起一行显示
  separated_meta: true
```

## 使用hexo-neat插件压缩页面静态资源

### 为什么要压缩页面静态资源

对于个人博客来说，优化页面的访问速度是很有必要的，如果打开你的个人站点，加载个首页就要十几秒，页面长时间处于空白状态，想必没什么人能够忍受得了吧。我个人觉得，如果能把页面的加载时间控制在三四秒内，就很不错了。

那么怎么提高hexo这个静态博客的页面加载速度呢？可以从以下的几个方面去入手：

1. 将js文件尽可能放置到body的闭合标签之前，因为在加载或者引入js文件时是阻塞式的，如果我们在页面的最开始就引入这些js文件，而这些文件又比较大，会造成页面在渲染时长时间处于白屏状态。
2. 尽量避免去引用访问速度非常低下的cdn或者图片，可以改用访问速度更快的cdn，或者将难以迅速加载的图片保存到自己的站点目录下，以免在加载图片时耗费了大量的时间，最后还加载不出来。
3. 对页面的静态资源进行压缩，包括css、js和html等文件。我们自己添加的css和js文件为了可读性，往往会有很多换行和空格，这些对于浏览器来说并没什么卵用，甚至还会降低渲染页面的速度。至于html文件，由于Markdown转成html的bug，会导致页面存在大量的空白，如果你查看下页面的源代码，就会发现这些大量的空白符，十分难看。这也会造成页面渲染的性能问题。

### hexo的压缩静态资源插件

网上有很多相关的博文，常规的做法是使用`gulp`来进行压缩，`gulp`是`Node.js`下的自动构建工具，通过一列的task执行步骤进行自动流程化处理。

使用这种方法会比较麻烦，每次压缩时还需要输入额外的命令，比较繁琐，个人不是很喜欢，有兴趣的可以去自己了解下[相关的东西](https://segmentfault.com/a/1190000009544924#articleHeader8)。这篇教程里很多详细的说明，里边有说到gulp的使用，绝对的精品文章。

这里我选择的是由rozbo大佬开发的`hexo-neat`压缩插件，配置简单，无需额外命令，你只要使用原本的调试三连或者部署三连就可以自动帮你完成静态资源的压缩！

### 如何使用hexo-neat

首先在站点根目录下安装hexo-neat，如下：

```bash
npm install hexo-neat --save
```

接着为站点配置文件添加相关配置，下边是我自己站点的相关配置，直接添加到站点配置文件`_config.yml`的末尾就可以。可以安装自己的需求去自定义配置，不过有些注意事项，可以参考我后文的踩坑记录。

```html
# hexo-neat
# 博文压缩
neat_enable: true
# 压缩html
neat_html:
  enable: true
  exclude:
# 压缩css  
neat_css:
  enable: true
  exclude:
    - '**/*.min.css'
# 压缩js
neat_js:
  enable: true
  mangle: true
  output:
  compress:
  exclude:
    - '**/*.min.js'
    - '**/jquery.fancybox.pack.js'
    - '**/index.js'  
```

## 将博客同时部署到Github和Coding

由于本人只是将Hexo博客同时部署到 Github 和 Coding.net ，所以这里只介绍怎么同时部署到这两个网站的pages。  
之所以选择这两个网站，是因为国外用户可以访问 Github，而国内用户可以访问 Coding.net。另外，Coding.net可以拥有自己的私人仓库。

### 修改站点配置文件

在站点根目录下找到 `_config.yml`文件，将里边的deploy节点修改成下边的形式：

```html
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: git
  repo:
    github: git@github.com:{username}/{repository}.git,master
    coding: git@git.coding.net:{username}/{repository}.git,master
```

将上边的仓库url的{username}/{repository}改成自己的项目地址，这里使用的是SSH协议的Git仓库地址，即：

```html
git@{domain}:{username}/{repository}.git
```

还有一种是HTTPS协议的Git仓库地址，即：

```html
https://{domain}/{username}/{repository}.git
```

一般推荐使用SSH协议的地址，因为可以免去每次push都要输入账号密码的繁琐，而且也够安全。

### 在 Github 和 Coding.net 上各自创建一个仓库

如果我们只是将项目部署到某一个代码托管站点而已，那么该项目仓库的名字可以随便起；但是现在我们需要将项目同时部署到 Github 和 Coding.net 上，那就不能随意命名了。  

我们需要采用特定的命名方式，才能正确将Hexo博客同时部署到这两个站点上；否则很可能会导致只有博客的主页能访问到，而其他的路径全部失效。

不同Pages服务对仓库的命名要求可能不同。对于 Coding.net，你可以选择建立一个私人仓库来部署自己的Hexo博客，不过和 Github 不同的地方在于：

Github 的仓库名要命名为：

```html
{username}.github.io
```

而 Coding.net 的仓库名要命名为：

```html
{username}
```

这里的 username 指的是你在这两个网站上的用户名，只有以这种命名形式的仓库，才能够不通过子域名的形式来访问我们的博客。

比如说，我的 Github 和Coding.net 的账号都是lewky，那么在部署博客成功后，我就可以通过下边的url来访问我的Hexo博客：

```html
https://lewky.github.io/
https://lewky.coding.me/
```

如果将仓库名命名为其他的形式，比如：hexo-blog，那么要访问该博客，就需要输入下边的url：

```html
https://lewky.github.io/hexo-blog
https://lewky.coding.me/hexo-blog
```

这里的仓库名hexo-blog就变成了子域名，于是问题就来了，对于存在子域名的Hexo博客，需要在站点配置文件里配置url节点：

```html
# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
url: http://yoursite.com
root: /
permalink: :year/:month/:day/:title/
permalink_defaults:
```

如果不配置这里的url节点，会导致除了首页以外的所有页面都请求404；但是我们由于是同时部署在两个网站上，其父域名是不一样的，那么这里的url节点也就只能配置一个而牺牲另一个了；但是如果你有自己的域名，就可以解决这个问题了：直接在这里配置自己的域名就行了。

### 创建RSA密钥对

使用 Git Bash 生成RSA密钥对：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

看到提示就按一次回车，在连续三次回车后，就表示创建成功了。

接着将 ~/.ssh 目录下将里边的 id_rsa.pub 文件里的内容复制到剪切板。

### Github 配置 SSH key

登陆 Github 的账号：
* 进入 Settings 页面
* 选择 SSH and GPG keys
* 点击 New SSH key
* 填写 Title（用来给公钥起一个名字，以便和其他的公钥区分开来）
* 然后在 Key 里将我们刚刚复制的公钥复制进去
* 最后点击 Add SSH key，这时候 GitHub 会要你输入账号密码进行确认。

### Coding.net 配置 SSH key

Coding.net 和 Github 有些不一样，Coding.net存在账户公钥和部署公钥；
* 账户公钥配置后拥有账户下所有项目的读写权限
* 部署公钥配置后默认拥有该项目的只读权限，如果需要获取推送权限，需要勾选部署公钥设置里的『授予推送权限』

登陆 Coding.net 的账号：
* 进入个人设置
* 选择 SSH 公钥
* 选择新增公钥
* 填写公钥名称和内容
* 添加后输入输入账号密码进行确认

### 验证 SSH 连接

使用 Git Bash 输入：

```bash
ssh -T git@github.com
```

第一次连接时会问你是否继续连接，输入 yes 即可；接下来验证 Coding.net 的ssh连接：

```bash
ssh -T git@git.coding.net
```

同样输入 yes 即可。

如果按照前边说的来配置，这里的 SSH 验证应该都是没问题的。

接下来只要撰写博文，然后使用命令进行部署就行了：

```bash
hexo clean
hexo g -d
```

## 参考链接

* [hexo的next主题个性化配置教程](https://segmentfault.com/a/1190000009544924)
* [打造个性超赞博客Hexo+NexT+GithubPages的超深度优化](https://reuixiy.github.io/technology/computer/computer-aided-art/2017/06/09/hexo-next-optimization.html)
* [hexo-neat项目地址](https://github.com/rozbo/hexo-neat)
* [hexo博客压缩优化](https://segmentfault.com/a/1190000008082288)
* [Hexo-Neat介绍](https://segmentfault.com/a/1190000005799759)