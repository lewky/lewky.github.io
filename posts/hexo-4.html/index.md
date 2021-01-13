# Hexo系列(4) - NexT主题踩坑记录

## Coding Pages申请SSL/TLS证书错误

某天发现我的个人站点SSL/TLS证书到期，我的证书是由Coding Pages提供的，每次申请成功后有效期是三个月，证书到期后可以继续免费申请。但是当我登陆进入Coding Pages服务的后台并点击申请证书时，竟然报错了！！

我重新点了申请，几秒后依然报错，并提示我半小时只能申请一次。我查看了下报错的提示信息，如下：
<!--more-->

>urn:acme:error:unauthorized:Invalid response from http://exmaple.com/.well-known/acme-challenge/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx: xxxxxxxxx

一时间也不明白是怎么回事，因为我第一次申请的时候不用几秒钟就成功了，由于报错信息中包含了本静态博客的部署时间，我以为可能存在部署时间的校验，于是重新部署了一下，半小时后继续申请，依然报同样的错误。

之后百度发现了Coding Pages的官方文件：[Coding Pages 常见问题](https://coding.net/help/faq/pages/coding-pages-faq.html)

这时候按照官方文件的指引，找到了和我一样的错误信息的解决方案：
>错误原因：无法获取正确的域名验证信息
解决方式1：检查 DNS 的 CNAME 记录是否设置正确，静态 Pages 为 pages.coding.me，动态 Pages 为 pages.coding.io
解决方式2：检查域名的 DNS 是否将海外线路解析到 Coding Pages 的服务器

因为Coding Pages的静态Pages是免费的，而动态Pages是收费的，对于用Hexo搭建的静态站点，自然是选择免费的静态Pages服务就足够了。于是解决方式1对我来说就不存在了，接着联想到之前我对部署在GitHub Pages上的个人站点进行了自定义域名绑定+域名解析设置，有些豁然开朗的感觉。

由于我的个人站点是同时部署到GitHub Pages和Coding Pages上的，接着在阿里云域名解析里进行了配置：默认的解析线路将我的域名指向`pages.coding.me`，国外的解析路线则是指向了`lewky.github.io`。

之所以这样配置，是因为国内部分地区无法直接访问GitHub，自然就无法访问我部署在GitHub上的个人站点，于是我又选择了Coding.net的Pages服务，这样国内用户就可以快速访问到我部署在Coding Pages的个人站点，而国外用户则是快速访问到Coding Pages上的个人站点。

问题就出现在这里，因为我第一次申请SSL/TLS证书的时候，还没有解析境外的线路，所以很快就申请成功了。后来添加了国外线路的解析，这导致在Coding Pages的后台申请证书时无法通过验证，自然就申请失败了。

### 解决方法

由于我是在阿里云购买的域名，于是登陆到阿里云域名解析的后台系统，打开个人域名的解析设置，暂停对于境外线路的解析。这里暂停就行了，一般来说大概需要5分钟左右的生效时间，毕竟DNS解析是存在缓存的。

五分钟后，我又进入Coding Pages服务的后台，再一次申请SSL/TLS证书，果不其然，几秒钟后我申请证书成功，又给续了三个月。

最后，再次返回阿里云域名解析的后台，将境外解析的线路再次启用，嗯，完美。

这里顺便罗列下申请证书时所有可能遇到的错误与解决方案，以备不时之需。

### 错误类型：urn:acme:error:connection

1、错误信息：DNS problem: NXDOMAIN looking up A for example.com

>错误原因：域名不存在
解决方式1：检查域名是否填写正确
解决方式2：到域名注册商处检查是否设置了 DNS 服务器
解决方式3：咨询 DNS 服务商是否支持解析该域名

2、错误信息：DNS problem: SERVFAIL looking up A for exmaple.com

>错误原因：DNS 解析 A 记录出错
解决方式1：到域名注册商处检查是否设置了 DNS 服务器
解决方式2：咨询 DNS 服务商是否屏蔽了 Let’s Encrypt 的解析请求

3、错误信息：DNS problem: SERVFAIL looking up CAA for example.com

>错误原因：DNS 解析 CAA 记录出错
解决方式1：到域名注册商处检查是否设置了 DNS 服务器
解决方式2：咨询 DNS 服务商是否支持解析 CAA 记录

4、错误信息：DNS problem: query timed out looking up A for exmaple.com

>错误原因：DNS 解析超时
解决方式1：到域名注册商处检查是否设置了 DNS 服务器
解决方式2：咨询 DNS 服务商是否屏蔽了 Let’s Encrypt 的解析请求
解决方式3：重新申请
解决方式4：检查域名的 DNS 是否将海外线路解析到 Coding Pages 的服务器

5、错误信息：Fetching http://exmaple.com/.well-known/acme-challenge/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx: xxxxxxxx

>错误原因：获取域名验证信息失败
解决方式1：重新申请
解决方式2：请确认是否启动了 DNS 的分区解析。如果有则要把国外的解析记录也设置成 CNAME 至 pages.coding.me。SSL 证书是通过 Let’s Encrypt API 申请。申请证书前需要验证域名，而 Let’s Encrypt 位于国外，所以需要保证 Let’s Encrypt 能通过您的域名正常访问到 Coding Pages 服务器以读取验证信息。

### 错误类型：urn:acme:error:malformed

错误信息：Error creating new authz :: Name does not end in a public suffix

>错误原因：域名不以公共后缀结尾
解决方式：咨询域名注册商

### 错误类型：urn:acme:error:unauthorized

1、错误信息：Invalid response from http://exmaple.com/.well-known/acme-challenge/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx: xxxxxxxxx

>错误原因：无法获取正确的域名验证信息
解决方式1：检查 DNS 的 CNAME 记录是否设置正确，静态 Pages 为 pages.coding.me，动态 Pages 为 pages.coding.io
解决方式2：检查域名的 DNS 是否将海外线路解析到 Coding Pages 的服务器

2、错误信息：The key authorization file from the server did not match this challenge

>错误原因：无法获取正确的域名验证信息
解决方式1：检查 DNS 的 CNAME 记录是否设置正确，静态 Pages 为 pages.coding.me，动态 Pages 为 pages.coding.io
解决方式2：检查域名的 DNS 是否将海外线路解析到 Coding Pages 的服务器

3、错误信息：Error creating new authz :: “example.com” was considered an unsafe domain by a third-party API

>错误原因：无法获取正确的域名验证信息
解决方式：使用 https://transparencyreport.google.com/safe-browsing/search 查看域名存在的安全隐患，按照说明进行清理，清理完后到 https://www.stopbadware.org/ 提交审查请求。审查通过后，回到 Coding Pages 重新申请证书

### 错误类型：urn:acme:error:unknownHost

错误信息：No valid IP addresses found for example.com

>错误原因：找不到可用 IP 地址
解决方式1：检查 DNS 的 CNAME 记录是否设置正确，静态 Pages 为 pages.coding.me，动态 Pages 为 pages.coding.io
解决方式2：检查域名的 DNS 是否将海外线路解析到 Coding Pages 的服务器
解决方式3：咨询 DNS 服务商是否屏蔽了 Let’s Encrypt 的解析请求

### 错误类型：urn:acme:error:rateLimited

错误信息：Error creating new cert :: too many certificates already issued for exact set of domains: example.com

>错误原因：证书申请数目超出限制
解决方式：下周再重新申请，详情见 https://letsencrypt.org/docs/rate-limits/

### 错误类型：urn:acme:error:rejectedIdentifier

错误信息：Error creating new authz :: Policy forbids issuing for name

>错误原因：相关政策禁止为此域名签发证书

## hexo-neat插件踩坑记录

由于在使用hexo-neat插件时，可以在命令窗口中看到各个文件的压缩率，于是我就开始捣鼓跳过哪些文件可以让效率更高。在鼓捣了一段时间之后，记录下使用该插件的一些注意事项，避免日后重蹈覆辙，也希望能对各位看官有所帮助。

### 跳过压缩文件的正确配置方式

如果按照官方插件的文档说明来配置`exclude`，你会发现完全不起作用。这是因为配置的文件路径不对，压缩时找不到你配置的文件，自然也就无法跳过了。你需要给这些文件指定正确的路径，万能的配置方式如下：

```html
neat_css:
  enable: true
  exclude:
    - '**/*.min.css'
```

### 压缩html时不要跳过`.md`文件

`.md`文件就是我们写文章时的markdown文件，如果跳过压缩`.md`文件，而你又刚好在文章中使用到了NexT自带的tab标签，那么当hexo在生成静态页面时就会发生解析错误。这会导致使用到了tab标签的页面生成失败而无法访问。

当初为了找到这个原因花了我两个晚上的时间，简直是夜不能寐。

### 压缩html时不要跳过`.swig`文件

`.swig`文件是模板引擎文件，简单的说hexo可以通过这些文件来生成对应的页面。如果跳过这些文件，那么你将会发现，你的所有页面完全没有起到压缩的效果，页面源代码里依然存在着一大堆空白。

## 文章标题含有双引号"导致页面渲染失败无法打开

在用Hexo写文章时，如果文章标题含有双引号`"`，也就是说如果在文件头里的`title`出现双引号，如下：

```yml
---
title: Hexo - 文章标题含有双引号"导致页面渲染失败无法打开
---
```

由于这里的写法属于yml语法，双引号属于特殊符号，上述的title的写法就会在执行`hexo g`时报错，当我们在浏览器里打开这篇文章的页面时就会渲染失败无法打开。

### 解决方法

我们需要对这里的双引号进行转义，对于这些特殊字符，可以用对应的`HTML字符实体`来替换。

对于双引号，其字符实体是`&#34;`或者`&quot;`。

最终我们在hexo文章的文件头里，应该这样写：

```yml
---
title: Hexo - 文章标题含有双引号&#34;导致页面渲染失败无法打开
---
```

### 补充

当然，对于文件头之外的部分，则是属于markdown语法的部分，此外由于我们的文章会被swig渲染，同样有一些特殊字符，比如 &#123;&#123;&#125;&#125;，如果在代码块之外的地方使用到这些特殊字符，就会报错！对于不同的语言，各自的特殊字符是不一样的。

这里补充下各种常用到的特殊字符的字符实体：

```html
! &#33; — 惊叹号 Exclamation mark
" &#34; &quot; — 双引号 Quotation mark
# &#35; — 数字标志 Number sign
$ &#36; — 美元标志 Dollar sign
% &#37; — 百分号 Percent sign
& &#38; &amp; — 与符号(&) Ampersand
' &#39; — 单引号 Apostrophe
( &#40; — 小括号左边部分 Left parenthesis
) &#41; — 小括号右边部分 Right parenthesis
* &#42; — 星号 Asterisk
+ &#43; — 加号 Plus sign
< &#60; &lt; 小于号 Less than
= &#61; — 等于符号 Equals sign
- &#45; &minus; — 减号
> &#62; &gt; — 大于号 Greater than
? &#63; — 问号 Question mark
@ &#64; — Commercial at
[ &#91; — 中括号左边部分 Left square bracket
\ &#92; — 反斜杠 Reverse solidus (backslash)
] &#93; — 中括号右边部分 Right square bracket
{ &#123; — 大括号左边部分 Left curly brace
| &#124; — 竖线Vertical bar
} &#125; — 大括号右边部分 Right curly brace
```

如果想要在文章中使用空格，直接输入空格是没用的，同样可以使用字符实体来代替，即`&nbsp;`。这个代表不间断空格：non-breaking space。

## Hexo3.X.X版本无法生成baidusitemap

在安装了`hexo-generator-baidu-sitemap`后，运行`hexo g`报错如下：

![error.jpg](/images/posts/hexo/error.jpg)

到了作者的GitHub上发现也有人提了相关的issue，不过都过了相当一段时间了依然没有解决，最后还是自己动手丰衣足食，解决方法很简单，因为Hexo3.X.X版本改变了代码导致toArray()无法使用，我们直接将该方法去掉就行了。

打开 `node_modules\hexo-generator-baidu-sitemap\baidusitemap.ejs`，将这里边的 `post.tags.toArray()` 和 `post.categories.toArray()` 改成 `post.tags` 和 `post.categories`，简单的说就是把这里的 `toArray()` 去掉，新版本的Hexo的tags和categories可以直接遍历。

![code.jpg](/images/posts/hexo/code.jpg)

接下来重新运行 `hexo g` 和 `hexo s`，本地调试成功~

## CNAME文件在每次部署后就没了

一般我们会将Hexo博客搭建到Github上，如果在Github上为其配置一个自定义的域名时，会自动在项目仓库根目录下新添加一个`CNAME`文件。但是这里有个问题，如果将Hexo博客重新部署一遍后，Github仓库里的这个`CNAME`文件就会消失掉，又需要重新配置一遍。

其实这里有个技巧，我们可以将需要上传部署到Github的文件都放在`source`文件夹里，例如`CNAME`文件、`favicon.ico`、或者其他的图片等等，这样在执行`hexo d`这个命令之后，这些文件就不会被删除了。

Hexo在执行命令时是不会删除掉`source`目录下的文件的，我们可以在该目录下随意增加其他文件或者文件夹，建议在该目录下添加子文件夹，然后在子文件夹里添加文件，这样便于文件分档归类。

## Template render error unexpected token

发现在使用`hexo g`时报错如下：
```
FATAL Something's wrong. Maybe you can find the solution here: http://hexo.io/docs/troubleshooting.html
Template render error: unexpected token: }}
```

一时间很诧异，因为前几天还可以正常生成静态文件，现在忽然就挂了。看看报错的信息，说是模板渲染失败，因为出现了预期外的标志。因为我刚刚写了新的文章，就出现了这个错误，可以想象到，应该是文章中出现了特殊字符导致hexo命令执行失败了。

百度了下，确实如此。因为在Hexo中，有些特殊字符如果不进行转义的话，在渲染模板时就会报错。

如果遇到类似的报错，解决方法很简单，就是对这些特殊字符进行转义，需要使用转义标签来将这些特殊字符包括起来，如下：
```
{% raw %}
特殊字符
{% endraw %}

```

比如我的报错是因为使用`{% raw %}}}{% endraw %}`，那么就需要对这对大括号进行转义：
```
{% raw %}
{{ something... }}
{% endraw %}

```

如果是在引用块里，可以随便使用特殊字符；如果是行内引用块，就需要进行转义了。

## 记录一次Pages服务部署失败的原因

## 问题与分析

某天忽然发现，一直运行得好好的Pages服务部署失败了，GitHub Pages报错如下：
```
Your site is having problems building: The tag cq on line 3 in source/high/index.md is not a recognized Liquid tag.
For more information, see https://help.github.com/articles/page-build-failed-unknown-tag-error/. 
```

与此同时，Coding Pages同样也报错了：
```
 Starting jekyll build.
> jekyll build --safe
Configuration file: /usr/src/app/_config.yml
jekyll 3.6.2 | Error:  The next theme could not be found.
Jekyll build exit with code 1.
Fail to build jekyll site.
```

首先我使用的是Hexo的next主题，而根据GitHub Pages的报错信息来看，是说在`source/high/index.md`里使用到了一个不认识的`cq`标签。

这个标签是next主题自带的，使用该标签快一年了，还是第一次遇到报这个错。接着根据Coding Pages的报错来看，则是说`/usr/src/app/_config.yml`里找不到jekyll的主题。

这就很奇怪了，我使用的明明是hexo，怎么忽然就变成jekyll了？一阵瞎折腾过后，一直部署失败。我忽然想起来一个事情，我之前曾经拿本地的博客仓库的git配置练过手，难道和这个有关？

我开始查找本地博客仓库的git配置，我是使用`hexo-deployer-git`这个插件来将本地生成的静态博客发送到远程仓库的。

当我在本地在执行`hexo g`后，会在博客根目录下生成一个`public`文件夹，这个文件夹里的文件组合起来就是一个完整的静态博客。

接着如果执行`hexo d`，就会把这个`public`文件夹的东西完完整整拷贝到`.deploy_git`文件夹里，然后会把该文件夹里的所有文件全部推送push到远程库。之后会触发Pages服务的钩子去build项目，然后部署到网站上。

## 发现线索

我打开`public`文件夹，发现生成出来的文件很正常，接着打开`.deploy_git`文件夹，发现也很正常，接着查看远程库里的文件，终于发现了问题。

在远程库的分支里，根本就没有hexo相关的文件，至此算是找到原因了。

很显然，我在执行`hexo d`时出了问题，没能正常将文件push到远程库，于是部署就失败了。之前该命令是没问题的，可之前我曾经动过手脚，修改过博客项目里的git配置，手动修改了`.git`里的文件，莫非这就是问题的根源？

## 解决方法

基于以上的猜想，我直接删掉了本地博客项目的`.deploy_git`文件夹，重新执行命令：
```
hexo cl
hexo g -d
```

等待片刻后，我终于看到远程部署成功，我的个人站点再次运转成功！

皇天不负有心人啊！原因终于明了，是`.deploy_git`文件夹出现问题，删掉该文件夹，重新运行`hexo d`即可。

记录下这次的遭遇，遇到问题应该静下心来，仔细分析，才不容易瞎折腾~

## 参考链接

* Coding Pages的官方文件：[Coding Pages 常见问题](https://coding.net/help/faq/pages/coding-pages-faq.html)
* [Hexo 特殊符号的转义问题](https://wxnacy.com/2018/01/12/hexo-specific-symbol/)
* [HTML 字符实体](http://www.w3school.com.cn/html/html_entities.asp)
* [常用特殊符号的HTML代码(HTML字符实体)](https://www.cnblogs.com/xyyt/p/3515397.html)
* [Hexo的一个小BUG(Template render error)](https://www.jianshu.com/p/738ebe02029b)
* [Hexo 异常 - Template render error unexpected token](https://hoxis.github.io/hexo-unexpected-token.html)
