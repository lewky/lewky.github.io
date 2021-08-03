# Hugo系列(3.0) - LoveIt主题美化与博客功能增强 · 第一章

## 前言

本博客使用的是Hugo的LoveIt主题，本文也是基于该主题而写的，不过Hugo的美化步骤应该大同小异，版本如下：
```
hexo: 3.8.0

hugo: v0.74.2/extended windows/amd64 BuildDate: unknown

LoveIt: v0.2.10
```

**请注意，本文的所有功能都离不开两个新增加的文件：`_custom.scss`和`custom.js`，部分功能还需要`jquery`，在第一章中会提及如何引入。**

另外本文篇幅太长，阅读体验不好，将其进行分章如下：

* [Hugo系列(3.0) - LoveIt主题美化与博客功能增强 · 第一章](/posts/hugo-3.html/)
* [Hugo系列(3.1) - LoveIt主题美化与博客功能增强 · 第二章](/posts/hugo-3.1.html/)
* [Hugo系列(3.2) - LoveIt主题美化与博客功能增强 · 第三章](/posts/hugo-3.2.html/)

<!--more-->
## 添加自定义的`_custom.scss`

LoveIt主题提供了一个自定义的`_custom.scss`，可以在该文件里添加自定义的css样式。该文件目录位于`\themes\LoveIt\assets\css\_custom.scss`，不建议直接在该文件里写css代码。

Hugo在渲染页面时优先读取站点根目录下的同名字的目录和文件，所以可以利用这个特点来美化主题。**只需要把想修改的主题模板文件拷贝到根目录下同样的目录中并进行修改，这样就可以在不改动原本的主题文件的情况下实现主题美化。**

首先在站点根目录下创建一个自定义的文件：`\assets\css\_custom.scss`，这样Hugo就会最终以该文件来渲染页面的样式。

这是我个人站点的[css文件](https://lewky.cn/css/style.min.css)，有兴趣的可以看看。

### 注意！！！

这里有个很关键的点，只有使用的是扩展版本的Hugo，才能令`_custom.scss`文件生效！！！因为原生的Hugo并不支持编译sass文件，必须使用扩展版本的Hugo才行。

所以请查看你所使用的Hugo版本，如果不是`hugo_extended`版本，请前往[Hugo Release页面](https://github.com/gohugoio/hugo/releases)下载你当前版本Hugo所对应的`hugo_extended`版本。

比如我原本使用的是`hugo_0.74.0_Windows-64bit.zip`，就需要改为使用`hugo_extended_0.74.0_Windows-64bit.zip`。

此外，本文会涉及多个文件的修改，包括hmtl、js、scss等文件类型，且由于**引入了中文字符**，可能导致页面**显示乱码**，这是因为文件的编码使用的是`ANSI`，**需要改为`UTF-8`的编码**。

## 添加自定义的`custom.js`

LoveIt主题并没有提供一个文件来让我们自定义JavaScript，所以需要自己创建一个js文件来自定义JavaScript。

首先在站点根目录下创建一个自定义的JavaScript文件：`\static\js\custom.js`。这个文件需要在body的闭合标签之前引入，并且要在`theme.min.js`的引入顺序之后。这样可以防止样式被其他文件覆盖，并且不会因为JavaScript文件假装太久导致页面长时间的空白。

对于LoveIt主题，`custom.js`添加在`\themes\LoveIt\layouts\partials\assets.html`里。

首先把该文件拷贝到根目录下的`\layouts\partials\assets.html`，然后打开拷贝后的文件，把自定义的JavaScript文件添加到最末尾的`{{- partial "plugin/analytics.html" . -}}`的上一行：
```html
{{- /* 自定义的js文件 */ -}}
<script type="text/javascript" src="/js/custom.js"></script>
```

由于本文提及的部分功能会用到jQuery，建议一起引入，最终如下：
```
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jquery@2.1.3/dist/jquery.min.js"></script>

{{- /* 自定义的js文件 */ -}}
<script type="text/javascript" src="/js/custom.js"></script>
```

如果有其他的JavaScript文件要引入，加在一样的地方就行，但是要放在自定义的`custom.js`之前。这是我的[custom.js文件]({{< param cdnPrefix >}}/js/custom.js)，有兴趣的可以看看。

## 添加全局cdn变量

对于一些静态资源，比如图片、音乐文件、第三方库等，如果有自己的cdn或者图床等，可以在站点配置文件自定义一个cdn变量，如下：
```
[params]
  # cdn变量，末尾不需要加/
  cdnPrefix = "http://xxxx"
```

接下来就可以在你需要的地方使用该变量，大概有如下3种用法。

### 在md文件中使用

在md文件中可以用内置的shortcodes来使用该变量：
```
{{</* param cdnPrefix */>}}

![avatar.jpg]({{</* param cdnPrefix */>}}/images/avatar.jpg)
```

### 在模板文件中使用

在`layouts`目录下有很多html文件，这些是用来渲染站点的模板文件，可以用Hugo的语法来引入该变量：
```
{{ .Site.Params.cdnPrefix }}
```

如果在一个模板文件里有多个地方使用到该变量，可以定义一个局部变量来使用：
```
{{- $cdn := .Site.Params.cdnPrefix -}}

/* 使用局部变量 */
{{ $cdn }}
```

### 在JavaScript文件中使用

由于JavaScript文件中不能使用上述的shortcodes或Hugo语法来引用变量，只能通过在`\layouts\partials\assets.html`中用JavaScript语法来引入该变量，如下：
```
/* 这是可以应用于JavaScript文件的全局变量 */
<script>
	/* cdn for some static resources */
	var $cdnPrefix = {{ .Site.Params.cdnPrefix }};
</script>
```

这样就可以在其他被引入的JavaScript文件中使用这个`$cdnPrefix`变量：
```javascript
$(function () {
	$.backstretch([
		  $cdnPrefix + "/images/background/saber1.jpg"
	], { duration: 60000, fade: 1500 });
});
```

如果是想在模板文件里引入某个自定义的JavaScript文件，如下：
```javascript
{{- /* 自定义的js文件 */ -}}
<script type="text/javascript" src="{{ .Site.Params.cdnPrefix }}/js/custom.js"></script>
```

## 主题自带的admonition样式

LoveIt提供了`admonition` shortcode，支持 **12** 种样式，可以在页面中插入提示的横幅。代码如下：
```
{{</* admonition */>}}
一个 **注意** 横幅
{{</* /admonition */>}}

{{</* admonition abstract */>}}
一个 **摘要** 横幅
{{</* /admonition */>}}

{{</* admonition info */>}}
一个 **信息** 横幅
{{</* /admonition */>}}

{{</* admonition tip */>}}
一个 **技巧** 横幅
{{</* /admonition */>}}

{{</* admonition success */>}}
一个 **成功** 横幅
{{</* /admonition */>}}

{{</* admonition question */>}}
一个 **问题** 横幅
{{</* /admonition */>}}

{{</* admonition warning */>}}
一个 **警告** 横幅
{{</* /admonition */>}}

{{</* admonition failure */>}}
一个 **失败** 横幅
{{</* /admonition */>}}

{{</* admonition danger */>}}
一个 **危险** 横幅
{{</* /admonition */>}}

{{</* admonition bug */>}}
一个 **Bug** 横幅
{{</* /admonition */>}}

{{</* admonition example */>}}
一个 **示例** 横幅
{{</* /admonition */>}}

{{</* admonition quote */>}}
一个 **引用** 横幅
{{</* /admonition */>}}
```

效果如下：
{{< admonition >}}
一个 **注意** 横幅
{{< /admonition >}}

{{< admonition abstract >}}
一个 **摘要** 横幅
{{< /admonition >}}

{{< admonition info >}}
一个 **信息** 横幅
{{< /admonition >}}

{{< admonition tip >}}
一个 **技巧** 横幅
{{< /admonition >}}

{{< admonition success >}}
一个 **成功** 横幅
{{< /admonition >}}

{{< admonition question >}}
一个 **问题** 横幅
{{< /admonition >}}

{{< admonition warning >}}
一个 **警告** 横幅
{{< /admonition >}}

{{< admonition failure >}}
一个 **失败** 横幅
{{< /admonition >}}

{{< admonition danger >}}
一个 **危险** 横幅
{{< /admonition >}}

{{< admonition bug >}}
一个 **Bug** 横幅
{{< /admonition >}}

{{< admonition example >}}
一个 **示例** 横幅
{{< /admonition >}}

{{< admonition quote >}}
一个 **引用** 横幅
{{< /admonition >}}

## 自定义404页面

主题默认的404页面太普通，可以通过新增`\layouts\404.html`来自定义自己想要的404页面。这是本站的[404页面](https://lewky.cn/404.html)，有兴趣的可以看看[源码页面](https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/404.html)。

## 添加背景图片轮播

这个功能需要引入图片轮播插件`jquery-backstretch`的cdn，并且该插件依赖于jQuery，需要在引入该插件之前引入jQuery。

打开`\layouts\partials\assets.html`，在你引入的`custom.js`的上面一行添加如下代码（必须要在custom.js之前引入这两个文件才有效果）：
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jquery@2.1.3/dist/jquery.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jquery-backstretch@2.1.18/jquery.backstretch.min.js"></script>
```

然后在`custom.js`里添加如下代码，具体想要轮播哪些图片可以自行修改，如下：
```javascript
/* 轮播背景图片 */
$(function () {
	$.backstretch([
		  "/images/background/saber1.jpg",
		  "/images/background/saber2.jpg",
		  "/images/background/wlop.jpg"
	], { duration: 60000, fade: 1500 });
});
```

## 添加搜索功能

`LoveIt`主题自带的搜索插件是`lunr`和`algolia`，这两个的使用都比较麻烦，后者甚至还想要去注册账号，虽然可以免费使用搜索服务，但是抓取收录时间好像是一小时一次，并且还有每月使用量的限制，太不便利了。

之前在Hexo那边用的是自带的搜索插件，是每次部署时自动为所有文章生成索引到一个文件里，然后直接搜索该文件来实现本地搜索功能。这个还是比较方便个人站点使用的，于是在网上找到了类似的一个Hugo专用的搜索插件[hugo-search-fuse-js](https://github.com/kaushalmodi/hugo-search-fuse-js)。

### 安装搜索插件hugo-search-fuse-js到本地

`hugo-search-fuse-js`并不是一个单独的主题，而是Hugo主题的一个组件：
1. 下载[hugo-search-fuse-js](https://github.com/kaushalmodi/hugo-search-fuse-js)到站点的主题目录`/themes/hugo-search-fuse-js`下，**注意，目录名必须是`hugo-search-fuse-js`**
2. 把该主题组件名字添加到站点配置文件里，**注意，搜索组件名字要在最前面，后面跟着的是你的主题的文件夹名字**：
```
theme = ["hugo-search-fuse-js", "my-theme"]
```
3. 新建一个`content/search.md`文件，内容如下：
```
+++
title = "Search"
layout = "search"
outputs = ["html", "json"]
[sitemap]
  priority = 0.1
+++
```

### 修改页面模板文件baseof.html

1. 把主题目录下的`\themes\LoveIt\layouts\_default\baseof.html`拷贝到站点根目录下的`\layouts\_default\baseof.html`
2. 在拷贝后的`baseof.html`的适当位置插入两段代码：`{{ block "main" . }}{{ end }}`和`{{ block "footer" . }}{{ end }}`，下面是一个修改后的样例：
```html
<div class="wrapper">
    {{- partial "header.html" . -}}
    <main class="main">
        <div class="container">
			{{ block "main" . }}{{ end }}
            {{- block "content" . }}{{ end -}}
        </div>
    </main>
    {{- partial "footer.html" . -}}
	{{ block "footer" . }}{{ end }}
</div>
```

### 添加搜索按钮

在站点配置文件里添加一个新的按钮给搜索功能使用，如下：
```
[menu]
  [[menu.main]]
    pre = "<i class='fas fa-fw fa-search'></i>"
    name = "搜索"
    weight = 7
    identifier = "search"
    url = "/search/"
```

如果你的配置文件里的菜单属性是多语言的，样例如下：
```
[languages]
  [languages.en]
    [languages.en.menu]
      [[languages.en.menu.main]]
	    pre = "<i class='fas fa-fw fa-search'></i>"
	    name = "Search"
	    weight = 7
	    identifier = "search"
	    url = "/search/"
```

### 关闭LoveIt主题默认的搜索插件

在站点配置文件里把默认的搜索插件关闭，如下：
```
[params]
  [params.app]
    [params.search]
      enable = false
```

如果你使用的是多语言的配置，则应该把每个语言的搜索插件都关闭，如下：
```
[languages]
  [languages.en]
    [languages.en.params]
      [languages.en.params.search]
        enable = false

  [languages.zh-cn]
    [languages.zh-cn.params]
      [languages.zh-cn.params.search]
        enable = false
```

### 修改搜索页面的样式

如果对该插件生成的搜索页面样式不满意，可以自行修改，下面是我的样式代码：
```css
/* 搜索页面 */
.search {
    position: relative;
    padding-top: 3.5rem;
    padding-bottom: 1rem;
    width: 57.5%;
    margin: 0 auto;
    background: white;
    opacity: .95;
}
[theme=dark] .search {
    background: #3a3535;
}

[theme=dark] .search header,
.search header {
    background-color: #f8f8f8;
}

[theme=dark] .search header:hover,
.search header:hover {
    -webkit-box-shadow: none;
    box-shadow: none;
}

.search header h1 {
    padding-left: 1rem;
    background: white;
}
[theme=dark] .search header h1 {
    background: #3a3535;
}

[theme=dark] .search input,
.search input {
	height: initial;
    width: initial;
    color: initial;
	background-color: white;
	margin: 0 0 0 1rem;
	border-width: 2px;
    border-style: inset;
    border-color: initial;
    border-image: initial;
	-webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
}

.search #search-results {
    padding-left: 1rem;
    padding-right: 1rem;
}

[theme=dark] a:active, [theme=dark] a:hover {
    color: #2d96bd;
}

.search hr {
    margin-left: 1rem;
    margin-right: 1rem;
}
```

### 优化中文搜索效果

这个搜索功能借助了Fuse.js模糊搜索引擎，为了更好的适配中文搜索结果，需要修改模糊搜索的相关参数，相对的会导致英文搜索结果变多，不过这个可以接受。因为搜索结果变多了，总好过搜索不出来想要的中文结果。而且可以通过设置搜索结果的权重来改变结果的排序，这样越前面的搜索结果就越是我们想要的。

打开`\themes\hugo-search-fuse-js\static\js\search.js`，这里面配置了fuse.js的搜索配置选项，可以参考下我的配置，我已经添加了部分中文注释：
```
// Options for fuse.js
let fuseOptions = {
  shouldSort: true, // 是否按分数对结果列表排序
  includeMatches: true, //  是否应将分数包含在结果集中。0分表示完全匹配，1分表示完全不匹配。
  tokenize: true,
  matchAllTokens: true,
  threshold: 0.2, // 匹配算法阈值。阈值为0.0需要完全匹配（字母和位置），阈值为1.0将匹配任何内容。
  location: 0, // 确定文本中预期找到的模式的大致位置。
  /**
   * 确定匹配与模糊位置（由位置指定）的距离。一个精确的字母匹配，即距离模糊位置很远的字符将被视为完全不匹配。
   *  距离为0要求匹配位于指定的准确位置，距离为100则要求完全匹配位于使用阈值0.2找到的位置的20个字符以内。
   */
  distance: 100,
  maxPatternLength: 64, // 模式的最大长度
  minMatchCharLength: 2, // 模式的最小字符长度
  keys: [
    {name:"title",weight:0.8},
    {name:"tags",weight:0.5},
    {name:"categories",weight:0.5},
    {name:"contents",weight:0.4}
  ]
};
```

这里和中文搜索有关的主要就3个选项：`threshold`，`location`，`distance`。

`threshold`是阈值，这个参数搭配`distance`使用。如果阈值填了`0.0`，相当于`distance`没有意义。`location`填0就行，`distance`填100就足够了，太大了会导致搜索到过多的结果。上面根据我个人的中文搜索测试结果，选择了这样的配置：
```
  threshold: 0.2,
  location: 0,
  distance: 100
```

可以根据个人情况来修改这几个参数的值，另外我还将`minMatchCharLength`的值改成了2，不过经过测试，和之前默认的`3`并没有什么差别。

## 如何添加自定义的页面

除了发布草稿和正文，我们还可以添加自定义的页面page。page不会像文章那样被渲染，而是被渲染成一个单独的页面，类似于你的文档、标签页面。

方法很简单：
1. 在站点根目录的`/content/`目录下，新建一个文件夹，比如`about`文件夹。然后在该文件夹里新建一个`index.md`文件，该文件将作为站点访问该目录的页面，你可以将其当成一篇特殊的文章。
2. 在`index.md`文件里加上下面的内容，实际上这里只需要`title`就够了，`date`这个日期属性可要可不要，因为page页面是看不到这个日期的：
	```html
	---
	title: "关于"
	date: 2018-04-24T22:01:44+08:00
	---
	```
3. 接下来你就可以像写普通文章一样，在这个`index.md`文件里随便写你想要展示的内容就行了。

## 添加友链页面

### 新建Page页面

首先在站点根目录的`/content/`目录下，新建一个`friends`文件夹。在该文件夹里新建一个`index.md`文件，内容如下：
```
---
title: "友链墙"
---
```

由于博主想要将友链分类，并能使用上目录，所以不使用这种page形式的友链页面，而是直接创建一篇文章作为友链使用，文件头如下：
```
title: "友链墙"
url: friends
hiddenFromHomePage: true
```

### 添加`friend.html`

我们通过自定义一个`shortcode`来实现该功能，以后就可以方便地通过这个`shortcode`快速新增友链到页面上。

在站点根目录下新增一个文件：`/layouts/shortcodes/friend.html`，其内容如下：
```html
{{ if .IsNamedParams }}
{{ $defaultImg := "https://sdn.geekzu.org/avatar/d41d8cd98f00b204e9800998ecf8427e?d=retro" }}
	<a target="_blank" href={{ .Get "url" }} title={{ .Get "name" }}---{{ .Get "word" }} class="friend url">
	  <div class="friend block whole {{ .Get "primary-color" | default "default"}} {{ .Get "border-animation" | default "shadow"}}">
		<div class="friend block left">
		  <img class="friend logo {{ .Get "img-animation" | default "rotate"}}" src={{ .Get "logo" }} onerror="this.src='{{ $defaultImg }}'" />
		</div>
		<div class="friend block right">
		  <div class="friend name">{{ .Get "name" }}</div>
		  <div class="friend info">"{{ .Get "word" }}"</div>
		</div>
	  </div>
	</a>
{{ end }}
```

### 添加样式文件并引入

在站点根目录下新增一个文件：`/assets/css/_partial/_single/_friend.scss`，内容如下：
```css
.friend.url {
    text-decoration: none !important;
    color: black;
}

.friend.logo {
    width: 56px !important;
    height: 56px !important;
    border-radius: 50%;
    border: 1px solid #ddd;
    padding: 2px;
    margin-top: 14px !important;
    margin-left: 14px !important;
    background-color: #fff;
}

.friend.block.whole {
    height: 92px;
    margin-top: 8px;
    margin-left: 4px;
    width: 31%;
    display: inline-flex !important;
    border-radius: 5px;
    background: rgba(14, 220, 220, 0.15);

    &.shadow {
        margin-right: 4px;
        box-shadow: 4px 4px 2px 1px rgba(0, 0, 255, 0.2);
    }
    &.borderFlash {
        border-width: 3.5px;
        border-style: solid;
        animation: borderFlash 2s infinite alternate;
    }
    &.led {
        animation: led 3s infinite alternate;
    }
    &.bln {
        animation: bln 3s infinite alternate;
    }
}

.friend.block.whole {
    &:hover {
        color: white;
        & .friend.info {
            color: white;
        }
    }

    &.default {
        --primary-color: #215bb3bf;
        &:hover {
            background: rgba(33, 91, 179, 0.75);
        }
    }
    &.red {
        --primary-color: #e72638;
        &:hover {
            background: rgba(231, 38, 56, 0.75);
        }
    }
    &.green {
        --primary-color: #2ec58d;
        &:hover {
            background: rgba(21, 167, 33, 0.75);
        }
    }
    &.blue {
        --primary-color: #2575fc;
        &:hover {
            background: rgba(37, 117, 252, 0.75);
        }
    }
    &.linear-red {
        --primary-color: #e72638;
        &:hover {
            background: linear-gradient(to right, #f9cdcd 0, #e72638 35%);
        }
    }
    &.linear-green {
        --primary-color: #2ec58d;
        &:hover {
            background: linear-gradient(to right, #1d7544 0, #2ec58d 35%);
        }
    }
    &.linear-blue {
        --primary-color: #2575fc;
        &:hover {
            background: linear-gradient(to right, #6a11cb 0, #2575fc 35%);
        }
    }
}

.friend.block.whole .friend.block.left img {
    &.auto_rotate_left {
        animation: auto_rotate_left 3s linear infinite;
    }
    &.auto_rotate_right {
        animation: auto_rotate_right 3s linear infinite;
    }
}
.friend.block.whole:hover .friend.block.left img {
    &.rotate {
        transition: 0.9s !important;
        -webkit-transition: 0.9s !important;
        -moz-transition: 0.9s !important;
        -o-transition: 0.9s !important;
        -ms-transition: 0.9s !important;
        transform: rotate(360deg) !important;
        -webkit-transform: rotate(360deg) !important;
        -moz-transform: rotate(360deg) !important;
        -o-transform: rotate(360deg) !important;
        -ms-transform: rotate(360deg) !important;
    }
}

.friend.block.left {
    width: 92px;
    min-width: 92px;
    float: left;
}

.friend.block.left {
    margin-right: 2px;
}

.friend.block.right {
    margin-top: 18px;
    margin-right: 18px;
}

.friend.name {
    overflow: hidden;
    font-weight: bolder;
    word-wrap:break-word;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.friend.info {
    margin-top: 3px;
    overflow: hidden;
    word-wrap:break-word;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: normal;
    font-size: 0.8rem;
    color: #7a7a7a;
}

@media screen and (max-width: 900px) {
    .friend.info {
        display: none;
    }
    .friend.block.whole {
        width: 45%;
    }
    .friend.block.left {
        width: 84px;
        margin-left: 15px;
    }
    .friend.block.right {
        height: 100%;
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .friend.name {
        font-size: 14px;
    }
}

@keyframes bln {
	0% {
		box-shadow: 0 0 5px grey,inset 0 0 5px grey,0 1px 0 grey;
		box-shadow: 0 0 5px var(--primary-color,grey),inset 0 0 5px var(--primary-color,grey),0 1px 0 var(--primary-color,grey)
	}

	to {
		box-shadow: 0 0 16px grey,inset 0 0 8px grey,0 1px 0 grey;
		box-shadow: 0 0 16px var(--primary-color,grey),inset 0 0 8px var(--primary-color,grey),0 1px 0 var(--primary-color,grey)
	}
}

@keyframes led {
	0% {
		box-shadow: 0 0 4px #ca00ff
	}

	25% {
		box-shadow: 0 0 16px #00b5e5
	}

	50% {
		box-shadow: 0 0 4px #00f
	}

	75% {
		box-shadow: 0 0 16px #b1da21
	}

	to {
		box-shadow: 0 0 4px red
	}
}

@keyframes borderFlash {
	0% {
		border-color: white;
	}

	to {
		border-color: grey;
		border-color: var(--primary-color,grey)
	}
}

@keyframes auto_rotate_left {
	0% {
		transform: rotate(0)
	}

	to {
		transform: rotate(-1turn)
	}
}

@keyframes auto_rotate_right {
	0% {
		transform: rotate(0)
	}

	to {
		transform: rotate(1turn)
	}
}
```

请注意，该文件是`.scss`文件，只有你使用的是扩展版本的Hugo时才能生效。

然后把`\themes\LoveIt\assets\css\_page\_single.scss`这个文件拷贝到`\assets\css\_page\_single.scss`，然后修改我们新增的`_single.scss`，在第一行加一行新代码：
```css
@import "../_partial/_single/friend";
```

这样Hugo就会用我们新增的这个文件来渲染友链页面了。

### 另一种添加样式文件并引入的方案

感谢`@kirito`的建议，原友链样式的方案会侵入原本的主题样式，并且也不是所有页面都需要这个友链样式，所以可以采用另一种方案来选择性地引入友链样式：即同样使用shortcode来引入。

首先创建一个`/assets/css/friend.scss`文件，内容跟上文的`_friend.scss`文件一样。然后新增一个`/layouts/shortcodes/friend-css.html`文件：

```html
{{ $options := (dict "targetPath" "/css/friend.css" "outputStyle" "compressed" "enableSourceMap" true) }}
{{ $style := resources.Get "css/friend.scss" | resources.ToCSS $options }}

<link rel="stylesheet" href="{{ $style.RelPermalink }}">
```

在需要使用友链的页面、文章中添加如下shortcode来引入友链样式即可：

```
{{</* friend-css */>}}
```

### 在菜单栏里新增一个友链按钮

打开站点配置文件`config.toml`，添加友链按钮：
```
# 菜单配置
[menu]
  [[menu.main]]
    pre = "<i class='fas fa-fw fa-fan fa-spin'></i>"
    name = "友链"
    identifier = "friends"
    url = "/friends/"
    weight = 6
```

### 使用示例和效果展示

在你想要引入友链的文章里使用下面的代码即可自动渲染成对应的友链：
```
{{</* friend
name="雨临Lewis的博客"
url="lewky.cn"
logo="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/avatar.jpg"
word="不想当写手的码农不是好咸鱼_(xз」∠)_"
*/>}}
```

上面代码里的四个属性为必填项，还可以额外指定三个不同的属性来选择友链内置的多种样式，如下：
```
//边框及鼠标悬停的背景颜色，允许设置渐变色
//支持7种：default、red、green、blue、linear-red、linear-green、linear-blue
primary-color="default"

//头像动画：rotate(鼠标悬停时旋转，此为默认效果)、auto_rotate_left(左旋转)、auto_rotate_right(右旋转)
img-animation="rotate"

//边框动画：shadow(阴影，此为默认效果)、borderFlash(边框闪现)、led(跑马灯)、bln(主颜色呼吸灯)
border-animation="shadow"
```

{{< friend-css >}}

{{< friend
name="雨临Lewis的博客"
url="lewky.cn"
logo="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/avatar.jpg"
word="不想当写手的码农不是好咸鱼_(xз」∠)_"
primary-color="linear-green"
img-animation="auto_rotate_right"
border-animation="led"
>}}

{{< friend
name="雨临Lewis的博客"
url="lewky.cn"
logo="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/avatar.jpg"
word="不想当写手的码农不是好咸鱼_(xз」∠)_"
primary-color="red"
img-animation="auto_rotate_left"
border-animation="borderFlash"
>}}

{{< friend
name="雨临Lewis的博客"
url="lewky.cn"
logo="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/avatar.jpg"
word="不想当写手的码农不是好咸鱼_(xз」∠)_"
>}}

如果友链的头像无法正常显示，会以一个默认的Gravatar头像显示。此外，在移动端会隐藏站点描述，只显示头像和站点名称，你可以通过将当前窗口缩小到宽度最小即可看到效果。

## 参考链接

* [自定义Hugo主题样式](https://sr-c.github.io/2020/07/21/Hugo-custom/)
* [kaushalmodi / hugo-search-fuse-js](https://github.com/kaushalmodi/hugo-search-fuse-js)
* [Hugo 篇四：添加友链卡片 shortcodes](https://blog.233so.com/2020/04/friend-link-shortcodes-for-hugo-loveit/)
* [img标签设置默认图片](https://www.cnblogs.com/wxcbg/p/7459022.html)
* [Fuse.js模糊搜索引擎](https://blog.csdn.net/weixin_46382477/article/details/108144964)
* [使用fuse.js进行搜索](https://www.jianshu.com/p/d0c8c3de8233)