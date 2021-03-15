# Hugo系列(4) - 从Hexo迁移至Hugo以及使用LoveIt主题的踩坑记录

## 前言

本文主要记录从Hexo迁移至Hugo所遇到的一些坑，以及Hugo的LoveIt主题的一些bug之类的应对方案。下面是涉及到的Hexo、Hugo以及LoveIt各自的版本：

```
hexo: 3.8.0

hugo: v0.74.2/extended windows/amd64 BuildDate: unknown

LoveIt: v0.2.10
```

<!--more-->
## Hugo无法使用`abbrlink`导致的URL与原本Hexo的URL不同步

原本的Hexo博客使用了`hexo-abbrlink`插件，目的是为每篇文章生成由字母和数字组成的随机URL，这样有利于SEO。迁移到Hugo后没找到类似的插件，只能用自带的`slug`功能来代替。

原本的文章文件头里有一个abbrlink属性，如下：
```
---
abbrlink: 71bd19d3
---
```

为了让旧的文章url和以前保存一致，于是全部加上一个slug属性，如下：
```
---
abbrlink: 71bd19d3
slug: 71bd19d3
---
```

然后在站点配置文件里这样配置：
```
[permalinks]
  posts = "/posts/:slug.html"
```

这样就可以避免旧文章的URL在迁移后不一致的问题，但是这也引入了另一个问题，那就是每一篇新文章都要手动添加`slug`属性，否则就还是会直接拿文章标题来作为URL的一部分。

不过这点还是可以接受的，每篇文章额外配置slug也不算麻烦，毕竟博客园同样有提供这种给URL起别名的功能，可以把一系列的文章起一些比较接近的URL，更有利于访问。

## Valine评论功能无法使用

LoveIt主题的评论功能默认情况下是无法在本地使用的，除非修改模板渲染文件，或者启动本地服务时添加参数，如下：
```
hugo server -e production
```

这样就可以在本地调试时使用"评论系统", "CDN" 和 "fingerprint"。

但是对于`v0.2.10`版本的LoveIt主题，只是加入启动参数依然无法使用Valine评论功能，原因是评论功能的模板文件有问题，需要我们自己修改才能正常使用，如下：

1. 把`\themes\LoveIt\layouts\partials\comment.html`拷贝到站点根目录下的`\layouts\partials\comment.html`
2. 打开拷贝后的`comment.html`，找到`Valine`相关的代码，把`{{- if $valine.enable -}}`和`{{- end -}}`之间的代码改成如下：
```
{{- if $valine.enable -}}
    <div id="valine" class="comment"></div>
    <script src="//cdn1.lncld.net/static/js/3.0.4/av-min.js"></script>
	<script src='{{ $cdn.valineJS }}'></script>

	<script type="text/javascript">
		new Valine({
			el: '#valine' ,
			appId: '{{ $valine.appId }}',
			appKey: '{{ $valine.appKey }}',
			notify: '{{ $valine.notify }}', 
			verify: '{{ $valine.verify }}', 
			avatar:'{{ $valine.avatar }}', 
			placeholder: '{{ $valine.placeholder }}',
			visitor: '{{ $valine.visitor }}'
		});
	</script>
{{- end -}}
```

之后在站点配置文件里启用`valine`，然后填上从`LeanCloud`的应用中得到的`appId`和`appKey`就可以用了。并且在使用了`valine`的同时，还可以顺带启用阅读次数的统计功能。以前用Hexo的时候，就是用的`LeanCloud`来帮忙统计阅读次数的。

`LeanCloud`的使用也很简单，去官网注册个账号，然后创建一个应用，然后进入该应用的配置，选择`设置` -> `应用Keys`，然后复制该应用的`appId`和`appKey`到站点配置文件里就行了。

## lightgallery图片相册功能无法使用

在启用了lightgallery功能后无法触发，然后在LoveIt仓库里找到了类似的issue，发现必须使用带标题的图片才能使用相册功能，如下：
```
![Alt Text](/url/to/your/image "Title")
```

但是一般情况下在引入图片时都不会再特地起一个标题，尤其是原本就已经有大量文章里使用了不带标题的图片，想全部改过来是不可能的。

接着发现已经有人发起了PR修复了该issue，只是作者还没merge，所以只能把这段代码自行合并到自己的博客项目了。做法也很简单：
* 在站点根目录下创建的`/layouts/_default/_markup/render-image.html`
* 在新创建的这个`render-image.html`文件里黏贴下面的代码即可：

```html
{{ $figcap := or .Title .Text }}
{{ $caption := or .Text " " }}
{{- if eq $figcap $caption -}}
    {{ $caption = " " }}
{{- end -}}

{{- if $figcap -}}
    <figure>
        {{- dict "Src" .Destination "Title" $figcap "Caption" $caption "Linked" true "Resources" .Page.Resources | partial "plugin/image.html" -}}
        <figcaption class="image-caption">
            {{- $figcap | safeHTML -}}
        </figcaption>
    </figure>
{{- else -}}
    {{- dict "Src" .Destination "Title" (path.Base .Destination) "Resources" .Page.Resources | partial "plugin/image.html" -}}
{{- end -}}
```

另外，该做法会导致生成的图片下方多出一个`figcaption`标签，觉得这个图片名字标签太碍眼的，可以用下面的样式隐藏掉：
```css
/* 图片 */
figcaption {
    display: none !important;
}
```

## lightgallery启用时，第二次加载页面时图片会变小

该issue可见于[lightgallery启用时，图片会显示得很小，是设计如此还是bug#311](https://github.com/dillonzq/LoveIt/issues/311?tdsourcetag=s_pctim_aiomsg)

这是lazysizes的问题，具体参见[aFarkas/lazysizes#508]，解决方法是修改样式：
```css
img[data-sizes="auto"] {
    display: block;
    width: 100%;
}
```

如果觉得100%太大可以改成别的比例，我用的是`width: 50%;`。

## 翻页后首页的图片显示不了

首页的头像和文章图片显示正常，但是点击跳转到第二页或者其他除第一页以外的页数时，所有的图片全部显示不了。按下F12查看显示不了的图片的url，可以发现图片的地址不正确，并没有附加上正确的网站地址前缀。

这个是因为图片的url配置不正确导致的。整个网站所使用的图片，其url要以`/`开头！这个涉及到站点的相对路径和绝对路径。

比如站点头像，是在站点配置文件里的`avatarURL`属性决定的。如果你的头像是存放在`images/avatar.jpg`，那么就要配置成`avatarURL = "/images/avatar.jpg"`。

其他图片同理，在文章里插入图片一般用法如下：
```md
![avatar](/images/avatar.jpg)
```

当然了，如果你有图床之类的，直接写完整的地址也不会出现这个问题，如：
```md
![avatar](https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/avatar.jpg)
```

## 自定义样式文件`_custom.scss`无法生效

LoveIt主题有提供`\themes\LoveIt\assets\css\_custom.scss`，可以在该文件内自定义页面的样式，但是经过测试并无法生效。不过最终还是在stackoverflow上找到了答案：
>You can use hugo's extended (like https://github.com/gohugoio/hugo/releases/download/v0.53/hugo_extended_0.53_Windows-64bit.zip) version which automatically compiles SCSS to CSS for you. You can then customize all the setup. If you don't want to/aren't using the extended version, then ofc you will have to go old school with a watcher like ruby SASS or Gulp, etc.

简单的说，只有使用的是扩展版本的Hugo，才能令`_custom.scss`文件生效！！！因为原生的Hugo并不支持编译sass文件，必须使用扩展版本的Hugo才行。

所以请查看你所使用的Hugo版本，如果不是`hugo_extended`版本，请前往[Hugo Release页面](https://github.com/gohugoio/hugo/releases)下载你当前版本Hugo所对应的`hugo_extended`版本。

比如我原本使用的是`hugo_0.74.0_Windows-64bit.zip`，就需要改为使用`hugo_extended_0.74.0_Windows-64bit.zip`。

## 无法直接自定义JavaScript

LoveIt主题没有直接提供自定义JavaScript的文件，只能通过修改页面的模板文件来引入自定义的JavaScript文件，具体做法可以参考[Hugo系列(3) - LoveIt主题美化与博客功能增强#添加自定义的custom.js](https://lewky.cn/posts/hugo-3.html/#添加自定义的customjs)。

## 文章摘要标志不生效

和Hexo不同，Hugo的文章摘要标志必须是`<!--more-->`，在`more`的两边不能有任何空格，且必须全小写，否则便不会生效。用法如下：
```
## Title

Content.
<!--more-->
```

## 文章标题里的特殊符号不需要使用字符实体

在Hexo里，如果文章的标题里存在英文的双引号、冒号等特定的符号，必须使用字符实体来替代，否则就会报错。而在Hugo里，则没有这个需要，直接使用原本的符号就行。如果在标题里使用字符实体，并不会被自动解析成对应的字符。

## Console报错找不到`/site.webmanifest`

该文件和`Progressive web applications (PWA) `有关，通过添加PWA到Hugo站点，可以实现离线访问的功能，也就是说断网状态下依然可以访问到你之前访问过的网页，换言之就是通过PWA来将访问过的网页资源缓存到了本地，所以断网下仍然可以继续访问网站。当然，恢复网络时会自动更新最新的页面资源。

有兴趣的可以去看看下面这几个网站：
* [Add PWA to your Hugo site](https://techformist.com/add-pwa-hugo/)
* [改造你的网站，变身 PWA](https://www.jianshu.com/p/7546527a786d)
* [基于Service Worker 的XSS攻击面拓展](https://bbs.ichunqiu.com/thread-39418-1-1.html)

后来又在LoveIt主题作者的一篇文章中找到了答案，如下：
>强烈建议你把:
>
* apple-touch-icon.png (180x180)
* favicon-32x32.png (32x32)
* favicon-16x16.png (16x16)
* mstile-150x150.png (150x150)
* android-chrome-192x192.png (192x192)
* android-chrome-512x512.png (512x512)
放在	`/static`目录. 利用 https://realfavicongenerator.net/ 可以很容易地生成这些文件.
>
>可以自定义`browserconfig.xml`和`site.webmanifest`文件来设置`theme-color`和`background-color`.

打开上面提及的网站，上传你想要作为网站图标的图片，按照提示走，会生成上述提及的所有文件，最后再下载下来，解压后将所有文件放置到站点根目录下的`/static`目录里即可。

记得把`site.webmanifest`的`name`和`short_name`填上你的网站名字。

## 远程部署到GitHub Pages后build失败

在本地调试没问题，部署到Coding Pages也没问题，偏偏部署到GitHub Pages 就一直build失败，并一直发送邮件，可以从邮件里看到报错的原因，如下：

```
The page build failed for the `master` branch with the following error:

Page build failed. For more information, see https://docs.github.com/github/working-with-github-pages/troubleshooting-jekyll-build-errors-for-github-pages-sites#troubleshooting-build-errors.

For information on troubleshooting Jekyll see:

  https://docs.github.com/articles/troubleshooting-jekyll-builds

If you have any questions you can submit a request on the Contact GitHub page at https://support.github.com/contact?repo_id=130235157&page_build_id=208464262
```

可以看到报错说是`Page build failed.`，描述太过模糊不清，我只能一篇篇文章的排查测试。最终发现，问题出在了某篇文章里的代码块，如下：

```html
<body>
  ....

  {% include '_custom/custom-foot.swig' %}
</body>
</html>
```

问题就出在了这个`{%  %}`上，经过几番测试，发现一旦启用了`LoveIt`主题的Markdown输出功能（即将每篇文章link到原本的Markdown文件），就会造成GitHub Pages服务build失败。

### 全局禁用Markdown输出功能

由于不想把这些造成问题的代码块删掉，于是最佳的解决方案就变成了禁用Markdown输出功能，在站点配置文件如下：
```
[params]
  [params.page]
    # whether to show link to Raw Markdown content of the content
    # 是否显示原始 Markdown 文档内容的链接
    linkToMarkdown = false

# Options to make output .md files
# 用于输出 Markdown 格式文档的设置
#[mediaTypes]
#  [mediaTypes."text/plain"]
#    suffixes = ["md"]

# Options to make output .md files
# 用于输出 Markdown 格式文档的设置
#[outputFormats.MarkDown]
#  mediaType = "text/plain"
#  isPlainText = true
#  isHTML = false

# Options to make hugo output files
# 用于 Hugo 输出文档的设置
[outputs]
  home = ["HTML", "RSS", "JSON"]
#  page = ["HTML", "MarkDown"]
  page = ["HTML"]
  section = ["HTML", "RSS"]
  taxonomy = ["HTML", "RSS"]
  taxonomyTerm = ["HTML"]
```

在站点配置文件了将`linkToMarkdown`配置为`false`，并将对应的三项Markdown输出的属性注释掉，终于解决了GitHub Pages编译失败的问题。

这个做法属于一刀切，后面考虑到依然需要输出md文件，于是想到了另一个解决方法，那就是把某些在GitHub Pages解析有问题的md文件给干掉，让这些引入了“问题”代码块的md文件不生成即可。

### 局部禁用Markdown输出功能

首先要改模板文件，将`\themes\LoveIt\layouts\_default\single.md`拷贝到`\layouts\_default\single.md`，打开拷贝后的文件修改成如下内容：
```
{{- $params := .Scratch.Get "params" -}}
{{- if $params.linkToMarkdown -}}
# {{ .Title }}

{{ .RawContent }}
{{- end -}}
```

然后在不想生成md文件的文章头里加上`linkToMarkdown: false`，如下：
```
---
title: Hexo系列(3) - NexT主题和Markdown的写作技巧
tags:
  - Hexo
  - NexT主题
  - 写作技巧
categories:
  - Hexo系列
abbrlink: 576ee548
slug: hexo-3
date: 2018-07-19T23:00:36+08:00
linkToMarkdown: false
---
```

这样就不会生成对应的md文件，也不会在页面尾部有`阅读原始文档`这个链接。

## 网站配置了keywords没有生效

在 https://seo.chinaz.com 里查询站点时发现页面TDK信息里的关键词(KeyWords)为空，然而站点配置文件里是有配置的，如下：
```
  # 网站关键词
  keywords = "雨临Lewis,Java,hugo,hexo,博客"
```

F12查看网站源码后发现缺少keywords这个meta标签，检查了模板文件后发现是LoveIt没有引入该标签，需要修改模板才行。

将`\themes\LoveIt\layouts\partials\head\meta.html`拷贝到`\layouts\partials\head\meta.html`，打开该文件并在`<meta name="Description" content="{{ $params.description | default .Site.Params.description }}">`上方加上如下代码：
```
<meta name="keywords" content="{{ $params.keywords | default .Site.Params.keywords }}">
```

## 配置文件里的`license`不生效

这个是模板文件有问题，拷贝`\themes\LoveIt\layouts\partials\single\footer.html`到`\layouts\partials\single\footer.html`，打开拷贝后的文件，找到如下内容：
```md
<div class="post-info-license">
    {{- with $params.license | string -}}
        <span>
            {{- . | safeHTML -}}
        </span>
    {{- end -}}
</div>
```

改成如下：
```md
<div class="post-info-license">
    {{- with $params.license | default .Site.Params.footer.license | string -}}
        <span>
            {{- . | safeHTML -}}
        </span>
    {{- end -}}
</div>
```

## 参考链接

* [add more markdown images to gallery when lightgallery is enabled](https://github.com/dillonzq/LoveIt/pull/522)
* [Valine中文文档](https://valine.js.org/configuration.html)
* [How to setup SCSS with Hugo](https://stackoverflow.com/questions/54057291/how-to-setup-scss-with-hugo)
* [Hugo Release - 0.74.0](https://github.com/gohugoio/hugo/releases/tag/v0.74.0)
* [lightgallery启用时，图片会显示得很小，是设计如此还是bug#311](https://github.com/dillonzq/LoveIt/issues/311?tdsourcetag=s_pctim_aiomsg)
* [主题文档 - 基本概念](https://hugoloveit.com/zh-cn/theme-documentation-basics)