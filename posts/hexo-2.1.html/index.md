# Hexo系列(2.1) - NexT主题美化与博客功能增强 · 第二章

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

## 添加评论系统

Hexo的NexT主题本身就集成了一些评论系统，多说啊之类的已经关闭服务的略过不提，目前比较多人用的有畅言、来必力livere、Gitment、Gitalk、Disqus等。

我刚用的评论系统的时候，网易云跟贴和多说已经gg了，畅言需要备案，Disqus需要FQ，Gitment和Gitalk类似，都需要GitHub账号。经过搜集资料和考虑，我最终还是决定使用Gitment。只是在用了一段时间后，终于还是放弃了Gitment，转而使用来必力livere。

### Gitment的优缺点

最初我选择使用Gitment的原因如下：

1. Gitment是一个基于GitHub的issue来开发的评论插件，本身很有创意，对于我这种没事看看GitHub的也很有吸引力。
2. 使用Gitment进行评论需要有GitHub账号，这无形中过滤掉了一些评论者，毕竟不是谁都有GitHub账号的，也不是谁都能登陆上GitHub的。
3. GitHub的评论数据存放在GitHub的issue里，基本不用担心数据丢失或者GitHub关闭服务，毕竟GitHub可是全球最大同性交友社区(滑稽)。

当我美滋滋地享受了Gitment一段时间后，开始发现一些问题：

1. GitHub是个神奇的网站，有时候会登陆不上去，这导致我的个人站点加载页面时无法把Gitment加载出来，这使得我的页面长时间处于一片空白的状态，用户体验极差，而且最后页面加载出来了，Gitment评论模块依然没有加载出来。
2. 我希望我的站点可以不分国界，所以我将站点分别部署到了Coding.net和GitHub上，这样可以国内外都快速访问到站点(这个需要域名才能实现)。由于国内有些地区在有些时段是无法访问到GitHub的，这将导致我的页面长时间假死。
3. Gitment的使用太繁琐，每一篇文章都必须先初始化一遍，才能使用评论系统，如果你有一百篇文章，你就需要手动初始化一百次！虽然后来有脚本一键初始化，但还是很麻烦。
4. issue的滥用。因为Gitment是建立的issue之上的，当你的文章越来越多，你会发现你的站点仓库里的issue会越来越多，这就不太友好了。

综上所述，我还是放弃了Gitment，转投了来必力的怀抱。虽然现在没有使用Gitment了，但这里还是记录下使用流程和当初遇到的问题，方便回顾或者大家解决类似的困难。

### 安装模块

使用Gitment需要安装模块：
```bash
npm i --save gitment
```
### 申请应用ID与密钥

因为Gitment需要GitHub的授权，所以需要先去[New OAuth App](https://github.com/settings/applications/new)申请一个密钥，需要填写的内容如下：

```html
Application name:随便写
Homepage URL:这个也可以随意写,就写你的博客地址就行
Application description:描述,也可以随意写
Authorization callback URL:这个必须写你的博客地址
```

这里只有最后一个callback必须写准确，申请成功后你可以看到`ClientID`和`Client Secret`，这个会被使用到，另外注意不要把这个ID和密钥告诉别人--

### 在主题配置文件中启用

```yml
# Gitment
# Introduction: https://imsun.net/posts/gitment-introduction/
gitment:
  enable: true
  mint: true # RECOMMEND, A mint on Gitment, to support count, language and proxy_gateway
  count: true # Show comments count in post meta area
  lazy: false # Comments lazy loading with a button
  cleanly: false # Hide 'Powered by ...' on footer, and more
  language: # Force language, or auto switch by theme
  github_user: {you github user id}
  github_repo: 随便写一个你的公开的git仓库就行,到时候评论会作为那个项目的issue
  client_id: {刚才申请的ClientID}
  client_secret: {刚才申请的Client Secret}
  proxy_gateway: # Address of api proxy, See: https://github.com/aimingoo/intersect
  redirect_protocol: # Protocol of redirect_uri with force_redirect_protocol when mint enabled
```

这里的配置，只有`github_user`，`github_repo`，`client_id`，`client_secret`是必须填准确的，其他的可以不使用。

### 初始化Gitment

到这里为止已经全部配置完毕，接下来只需要登陆你的个人站点，然后手动给每篇文章初始化Gitment就行了。初始化也很简单，打开每篇文章，在下方的评论模块那里点一下初始化就行，以后就可以直接评论了。据说由一键初始化所有文章的脚本，我没用过，不清楚。 

### Gitment踩坑记录

这里说一下当初折腾了我很久的一个地方，在主题配置文件里有个`github_user`，这个由于注释写的是`Your Github ID`，我误以为是要填写的不是用户昵称，而是一串数字id。于是就去了GitHub的api里查看了自己的id，然后填了一串数字进去，之后花费了我几个小时的时间，始终有授权失败的错误，最后终于发现，这个ID其实是要填的用户昵称...orz

GitHub的api地址：https://api.github.com/users/xxx
把这里的xxx随便改成某个用户名，可以拿到对方的json数据，里边有各种用户首页上的数据信息。

更多Gitment踩坑相关的文章可以参考：[Gitment评论功能接入踩坑教程](https://www.jianshu.com/p/57afa4844aaa)

### 另一个评论系统：来必力livere的使用

来必力的使用就简单多了，直接去官网注册个账号，拿到来必力City版安装代码里的`data-uid`，把这个uid填写到主题配置文件里的`livere_uid`后就行，记得id要和前边的冒号之间有一个空格，否则在启用hexo服务的时候会解析出错。

这样我们的来必力就使用成功了，平时可以去来必力的后台系统查看站点的评论数据等。

如果不会注册安装来必力的，可以看看[这篇文章](https://www.jianshu.com/p/61abc6c43220)

## 如何令文章目录显示序号

NexT主题会自动为每一篇文章生成目录，这个目录可以通过配置来控制是否生成对应的序号。毕竟有时候我们会给文章的小标题写上序号，有时候又会懒得去写，这个时候这个配置就很重要了。

有两种方法来实现这个效果，一种是全局生效，一种是对具体某篇文章生效。

### 全局生效

在NexT的主题配置文件 `_config.yml`中启用如下配置：

```html
# Table Of Contents in the Sidebar
# 侧栏文章目录设置
toc:
  enable: true

  # Automatically add list number to toc.
  # 自动为文章目录添加行号
  number: true
```

设置为true后就可以对站点下所有文章自动添加序号，如果想取消这个功能，再设置为false即可。

### 对具体某篇文章生效

如果你在文章的小标题中已经使用了序号，那么自动为文章目录添加序号的功能会导致你的文章目录出现了赘余的序号，解决方法很简单，在你的文章的文件头添加一行代码即可，如下：

```html
---
title: XXX
date: XXX
toc_number: false
---
```

这样这篇文章就不会被自动添加序号到文章目录里了。

## 网页标题崩溃特效

该特效为：当用户离开站点相关的页面时，网页的标题会变成“已崩溃”，网站图标也会改变；当用户重新回到站点页面时才会恢复正常。

实现方式如下：

在`themes/next/source/js/src/custom.js`里加入如下代码：
```js
/* 离开当前页面时修改网页标题，回到当前页面时恢复原来标题 */
window.onload = function() {
  var OriginTitile = document.title;
  var titleTime;
  document.addEventListener('visibilitychange', function() {
    if(document.hidden) {
      $('[rel="icon"]').attr('href', "/failure.ico");
      $('[rel="shortcut icon"]').attr('href', "/failure.ico");
      document.title = '喔唷，崩溃啦！';
      clearTimeout(titleTime);
    } else {
      $('[rel="icon"]').attr('href', "/favicon-32x32.ico");
      $('[rel="shortcut icon"]').attr('href', "/favicon-32x32.ico");
      document.title = '咦，页面又好了！';
      titleTime = setTimeout(function() {
        document.title = OriginTitile;
      }, 2000);
	}
  });
}
```

然后在站点根目录的`/source`目录下添加`failure.ico`，作为网站崩溃时显示的图标；如下：

![failure.ico](/images/posts/hexo/failure.ico)

这里的`favicon-32x32.ico`是你个人站点的图标，改成你自己的图标就好。

## 对文章进行加密

### 添加JavaScript代码

打开 `themes\next\layout\_partials\head.swig`，在文件的开头位置找到如下代码：

```html
<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<meta name="theme-color" content="{{ theme.android_chrome_color }}">
```

在上边代码的末尾添加如下代码：

```html
<script>
    (function(){
        if('{{ page.password }}'){
            if (prompt('请输入文章密码') !== '{{ page.password }}'){
                alert('密码错误！');
				if (history.length === 1) {
				    window.opener = null;
				    window.open('', '_self');
				    window.close();
                } else {
                    history.back();
                }
            }
        }
    })();
</script>
```

注意：网上其他的帖子是在这里选择输入密码错误后进行回退历史的操作，代码如下：

```html
<script>
    (function(){
        if('{{ page.password }}'){
            if (prompt('请输入文章密码') !== '{{ page.password }}'){
                alert('密码错误！');
                history.back();
            }
        }
    })();
</script>
```

我经过测试发现，这段代码有问题：如果当前页面是新打开的窗口，其历史页面只有一个，也就是`history.length === 1`时，就算不输入密码或者输入错误的密码，也会在提示密码错误之后成功进入文章页面！！！

所以我们使用改良后的JS代码。

### 给某篇文章设置密码

添加完脚本代码，接下来在想要加密的文章的文件头加上 `password` 属性就行了，如下：

```html
---
title: XXX
date: XXX
tags:
  - XXX
categories:
  - XXX
password: 123
---
```

这样在打开这篇文章时只有输入了123这个密码才可以打开成功。

## 启用搜索功能

### 安装搜索插件

在站点根目录使用 `git bash` 执行命令：

```bash
npm install hexo-generator-searchdb --save
```

### 修改配置文件

打开主题配置文件 `_config.yml`，修改如下配置：

```html
# Local search
# Dependencies: https://github.com/flashlab/hexo-generator-search
# 本地搜索，需要安装 hexo-generator-search
# 站点根目录执行：npm install hexo-generator-searchdb --save
local_search:
  enable: true
  # if auto, trigger search by changing input
  # if manual, trigger search by pressing enter key or search button
  # auto表示改变输入就自动触发搜索
  # manual表示按下回车键或搜索按钮才触发搜索
  trigger: auto
  # show top n results per article, show all results by setting to -1
  # 这里的数字n表示显示每篇文章搜索到的n个结果
  # -1表示显示每篇文章搜索到的全部结果(不建议)
  top_n_per_article: 1
```

## 让所有的文章链接在新窗口打开

打开 `themes\next\layout\_macro\post-collapse.swig`，修改这里的超链的target：

```html
<a class="post-title-link" href="{{ url_for(post.path) }}" itemprop="url">
  {% if post.type === 'picture' %}
    {{ post.content }}
  {% else %}
    <span itemprop="name">{{ post.title | default(__('post.untitled')) }}</span>
  {% endif %}
</a>
```

接着打开 `themes\next\layout\_macro\post.swig`，修改这里的超链的target：

```html
	<a class="post-title-link" href="{{ url_for(post.path) }}" itemprop="url">{#
    #}{{ post.title | default(__('post.untitled'))}}{#
  #}</a>
```

在这两个超链里添加 `target="_blank"` ，最终修改如下：

![target_blank.jpg](/images/posts/next/target_blank.jpg)

## 使用FontAwesome 5

NexT主题集成的是4.6.2版本的fontawesome，现在已经出了更高版本的了，修改fontawesome的版本有两种方式。

### 方式一：直接修改主题配置文件

打开主题配置文件 `_config.yml`，修改如下配置：

```html
  # Internal version: 4.6.2
  # See: http://fontawesome.io/
  fontawesome:
```

在这里的 `fontawesome:` 后面直接添加上 fontawesome 的 CDN 就行了；不过不推荐这种改法，因为版本5的 fontawesome 改变了不少，直接在这里添加 fontawesome 5的 CDN 会导致原本的图标全部显示不出来。

推荐方式二的改法。

### 方式二：修改页面头文件的模板

打开 `themes\next\layout\_partials\head.swig`，找到如下代码：

```html
{% if theme.vendors.fontawesome %}
  {% set font_awesome_uri = theme.vendors.fontawesome %}
{% endif %}
<link href="{{ font_awesome_uri }}" rel="stylesheet" type="text/css" />
```

在上边的代码后插入 fontawesome 5 的 CDN：
```html
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">
```

如果这里的CDN链接无效，请去官网复制CDN链接：https://fontawesome.com/get-started

![fontawesome-CDN](/images/posts/next/fontawesome-CDN.jpg)

## 添加文章置顶功能

### 安装插件及其使用方法

在站点根目录执行命令：

```bash
npm uninstall hexo-generator-index --save
npm install hexo-generator-index-pin-top --save
```

接下来在需要置顶的文章头部添加 `top: true` 或者 `top: n`，这里的n是数字，数字越大表示置顶等级越高。

```html
title: XXX
tags:
  - XXX
categories:
  - XXX
date: XXX
top: 100
```

### 在文章标题下方添加置顶样式

打开 `themes/next/layout/_macro/post.swig`，在 `<div class="post-meta">` 下方添加如下代码：

```css
{% if post.top %}
	<span class="post-meta-item-icon">
	    <i class="fa fa-thumb-tack"></i>
	</span>
	<font color="red">置顶</font>
	<span class="post-meta-divider">|</span>
{% endif %}
```

![encrypt.jpg](/images/posts/next/encrypt.jpg)

## 文章启用字数统计、阅读时长

### 安装 wordcount 插件

在站点根目录打开 git bash，输入：

```bash
npm i --save hexo-wordcount
```

该插件的具体使用方法可以参考 GitHub 上的仓库：https://github.com/willin/hexo-wordcount

### 在主题配置文件启用该插件

NexT主题本身就集成了该插件，在安装了该插件后直接启用就行了。
进入主题配置文件 `_config.yml`，修改如下配置：

```html
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
  totalcount: false
  # 该post_wordcount的所有设置另起一行显示
  separated_meta: true
```

### 自定义字数计数的显示样式

启用了该插件后的显示样式也是可以自己修改的，进入 `themes\next\layout\post.swig`，找到如下代码，这里可以修改字数统计的样式：

```html
{% if not theme.post_wordcount.separated_meta %}
  <span class="post-meta-divider">|</span>
{% endif %}
<span class="post-meta-item-icon">
  <i class="fa fa-file-word-o"></i>
</span>
{% if theme.post_wordcount.item_text %}
  <span class="post-meta-item-text">{{ __('post.wordcount') }}&#58;</span>
{% endif %}
<span title="{{ __('post.wordcount') }}">
  {{ wordcount(post.content) }}
</span>
```

下边是阅读时长的代码：

```html
{% if theme.post_wordcount.min2read %}
  <span class="post-meta-item-icon">
    <i class="fa fa-clock-o"></i>
  </span>
  {% if theme.post_wordcount.item_text %}
    <span class="post-meta-item-text">{{ __('post.min2read') }} &asymp;</span>
  {% endif %}
  <span title="{{ __('post.min2read') }}">
    {{ min2read(post.content) }}
  </span>
{% endif %}
```

改完样式后，再去 `themes\next\languages` 目录下找到你所使用的语言对应的 `yml` 文件，修改要显示的文本。比如我使用的语言是 `zh-Hans`，就修改 `zh-Hans.yml`里的文本：

```html
post:
  wordcount: 本文共计
  min2read: 阅文耗时
  totalcount: Site words total count
```

## 修改行内代码块的样式

打开 `themes\next\source\css\_custom\custom.styl`，添加如下样式：

```css
/* 行内代码块的自定义样式 */
code {
    color: #d500fc;
    background: rgba(78, 240, 233, 0.42);
    margin: 2px;
    border: 1px solid #d6d6d6;
}
```

> 效果图

![code-block.jpg](/images/posts/next/code-block.jpg)

## 修改文章内的超链样式

打开 `themes\next\source\css\_custom\custom.styl`，添加如下样式：

```css
/* 文章内链接文本样式 */
.post-body p a,
.post-body li a {
  color: #0593d3;
  border-bottom: none;
  border-bottom: 1px solid #0593d3;
  &:hover {
    color: #fc6423;
    border-bottom: none;
    border-bottom: 1px solid #fc6423;
  }
}
```

这里选择 `.post-body p a` 是为了不影响文章标题和首页 `阅读全文》` 的样式，选择 `.post-body li a` 是为了对列表内的超链也有效果。

总之，我们可以随意定义这里的具体样式。

> `a:link` 效果图

![link.jpg](/images/posts/next/link.jpg)


> `a:hover` 效果图

![hover.jpg](/images/posts/next/hover.jpg)

## 修改永久链接的默认格式

Hexo的永久链接的默认格式是 `:year/:month/:day/:title/`，比如访问站点下某一篇文章时，其路径是 `2018/04/12/xxxx/`，如果我们的文章标题是中文的，那么该路径就会出现中文字符。在路径中出现了中文字符很容易引发各种问题，而且也不利于seo，因为路径包含了年月日三个层级，层级太深不利于百度蜘蛛抓取。

解决办法就是利用其它的插件来生成唯一的路径，这样就算我们的文件标题随意修改，而不会导致原本的链接失效而造成站点下存在大量的死链。

### 安装插件

在站点根目录使用 `git bash` 执行命令：

```bash
npm install hexo-abbrlink --save
```

### 修改站点配置文件

打开根目录下的 `_config.yml` 文件，修改如下配置：

```html
# permalink: :year/:month/:day/:title/
# permalink_defaults:
permalink: posts/:abbrlink.html
abbrlink:
  alg: crc32  # 算法：crc16(default) and crc32
  rep: hex    # 进制：dec(default) and hex
```

这里将页面都添加了 `.html` 的后缀，用来伪装成静态页面(虽说Hexo的页面本身就是静态页面)，这样可以直接从路径就知道这是个静态页面，方便seo。

接下来重新部署三连，可以看到我们的文章路径变成了 `/posts/xxxxx.html`，接下来就算我们将文字标题命名为中文也没问题了。

## 参考链接

* [Hexo 使用Gitment评论功能](https://sjq597.github.io/2018/05/18/Hexo-%E4%BD%BF%E7%94%A8Gitment%E8%AF%84%E8%AE%BA%E5%8A%9F%E8%83%BD/)
* [Gitalk：一个基于 Github Issue 和 Preact 开发的评论插件](https://www.v2ex.com/t/378728)
* [添加网易云跟帖(跟帖关闭，已失效，改为来必力)](https://segmentfault.com/a/1190000009544924#articleHeader20)