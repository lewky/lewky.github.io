# Hugo系列(2) - 通过配置文件来定制个人站点

## 前言

Hugo本身可以通过修改站点配置文件来完成页面的部分定制，如按钮、多语言等功能。本文基于`LoveIt`主题【v0.2.10】，且所使用的Hugo版本如下，不同版本且不同主题可能无法适用某些属性：
```cmd
>hugo version
Hugo Static Site Generator v0.74.2/extended windows/amd64 BuildDate: unknown
```

<!--more-->

## 配置文件

Hugo默认使用根目录下的`config.toml`、`config.yaml`或`config.json`中的某一个作为站点的配置文件，可以通过`--config`来配置读取一个或多个配置文件，如下：

```
hugo --config debugconfig.toml
hugo --config a.toml,b.toml,c.toml
```

## 配置文件的目录

除了使用单一的站点配置文件，还可以通过使用`configDir`变量（默认值为`config/`）来维护不同环境下的各组件的配置文件：
* 每个文件各自对应配置文件的根对象，比如`Params`, `Menus`, `Languages`等。
* 每个子目录对应不同的环境配置，类似于Maven的Profile功能。
* 这些文件可以应用国际化功能，即区分不同的语言版本。

下面是一个简单的例子：
```cmd
├── config
│   ├── _default
│   │   ├── config.toml
│   │   ├── languages.toml
│   │   ├── menus.en.toml
│   │   ├── menus.zh.toml
│   │   └── params.toml
│   ├── production
│   │   ├── config.toml
│   │   └── params.toml
│   └── staging
│       ├── config.toml
│       └── params.toml
```

可以发现上述的结构中，存在着三种不同的环境配置：`_default`默认环境、`production`生成环境、`staging`演示环境。`_default`下的配置是通用配置，Hugo每次生成站点时都会读取。如果运行`hugo --environment staging`，则还会额外合并`staging`的配置（会替换`_default`下冲突的配置）。

一般情况下我们用不到多环境的功能，只需要在站点根目录下存放一个`config.toml`文件，直接在该配置文件中指定各种属性，就可以实现相当程度的个性化了。下面是一些常用的配置文件的属性的用法，**这些属性都是配置在站点配置文件里的。**

## theme主题属性

配置你的Hugo主题款式，本文基于[LoveIt](https://github.com/dillonzq/LoveIt)主题【v0.2.10】，所以配置是：
```
theme = "LoveIt"
```

## 网站路径相关的属性

### baseURL

网站的根路径，用法如下：
```
baseURL = "https://mySite.com/"
```

### disablePathToLower

是否禁止将网站路径转换成小写，建议设置成true：
```
disablePathToLower = true
```

### permalinks

生成的文章的路径，默认配置如下：
```
[permalinks]
  posts = "/:year/:month/:title/"
```

这里可以使用的变量如下：
`:year`：4位数的年份
`:month`：2位数的月份
`:monthname`：月份名字
`:day`：2位数的日期
`:weekday`：1位数，每周的第几天，星期日对应0
`:weekdayname`：星期几
`:yearday`：1到3位数，每年的第几天
`:section`：当前文章对应的section分类
`:sections`：当前文章对应的完整的section分类层次
`:title`：文章的标题
`:slug`：文章的slug，和title一样是定义在文件头里的属性，当没有定义slug时会使用title作为url
`:filename`：文章的文件名，不包括文件扩展名。

出于seo考虑，不建议在url里加上年月日之类的，由于标题大多有中文或者特殊字符，所以也不建议直接使用标题作为url的一部分。这里建议使用slug的方式，自己手动给每篇文章提取若干个关键词作为slug，以此作为url的一部分，如下：
```
[permalinks]
  posts = "/posts/:slug.html"
```

然后文章的slug可以这样配置**（`permalinks`是配置在站点配置文件里的，`slug`是配置在每篇文章的文件头里的）**：
```
---
title: 建站日志
slug: e62c38c45
---
```
我这里是因为文章是从hexo迁移过来的，hexo那边使用了abbrlink插件来生成随机且不重复的名字，为了和之前的文章url对齐就这样配置了。而hugo没有找到类似的插件，所以选择了slug来自定义url，这个功能倒是和博客园的自定义博文的url类似。

另外值得一提的是，默认用的是pretty Url的配置，所有url的末尾都有个`/`，而Hexo那边url末尾是没有这个`/`的，算是一点小小的不同。

### uglyurls

这个属性针对默认的pretty Url，比如有个url是`/posts/e62c38c45/`。如果设置了`uglyurls = true`，则会把末尾的`/`改成`.html`，新的url就变成了`/posts/e62c38c45.html`。但是这个属性有个问题，它会把文章以外的url也变成这种“丑陋”的格式，比如分类、标签等url，这样就不美观了。

所以不推荐使用该属性，如果希望文章的url不是纯目录格式的，可以像上文的`permalinks`那样配置。

## markup标记属性

配置markdown解析器、代码块高亮、文章目录等。

### markdown解析器

Hugo提供了`asciidocExt`、`blackFriday`和`goldmark`三种markdown解析器，默认使用`goldmark`来解析markdown，如下：
```
markup:
  asciidocExt:
    attributes: {}
    backend: html5
    extensions: []
    failureLevel: fatal
    noHeaderOrFooter: true
    safeMode: unsafe
    sectionNumbers: false
    trace: false
    verbose: false
    workingFolderCurrent: false
  blackFriday:
    angledQuotes: false
    extensions: null
    extensionsMask: null
    footnoteAnchorPrefix: ""
    footnoteReturnLinkContents: ""
    fractions: true
    hrefTargetBlank: false
    latexDashes: true
    nofollowLinks: false
    noreferrerLinks: false
    plainIDAnchors: true
    skipHTML: false
    smartDashes: true
    smartypants: true
    smartypantsQuotesNBSP: false
    taskLists: true
  defaultMarkdownHandler: goldmark
  goldmark:
    extensions:
      definitionList: true
      footnote: true
      linkify: true
      strikethrough: true
      table: true
      taskList: true
      typographer: true
    parser:
      attribute: true
      autoHeadingID: true
      autoHeadingIDType: github
    renderer:
      hardWraps: false
      unsafe: false
      xhtml: false
```

### Highlight代码高亮

hugo默认的配置如下：
```
markup:
  highlight:
    anchorLineNos: false
    codeFences: true
    guessSyntax: false
    hl_Lines: ""
    lineAnchors: ""
    lineNoStart: 1
    lineNos: false
    lineNumbersInTable: true
    noClasses: true
    style: monokai
    tabWidth: 4
```

`guessSyntax`：自动推断代码属于某种语言。
`hl_Lines`：仅在使用`goldmark`解析器时该属性才起效，表示对某几行代码进行高亮处理，比如：
&nbsp;&nbsp;&nbsp;&nbsp;`lineAnchors: "2"`表示第二行代码高亮；
&nbsp;&nbsp;&nbsp;&nbsp;`lineAnchors: "1-8"`表示第一到八行代码高亮；
&nbsp;&nbsp;&nbsp;&nbsp;`lineAnchors: "1 3"`表示第一行和第三行代码高亮。
`lineNoStart`：表示行数从多少开始计数。
`lineNos`：配置行数，`false`表示不显示行数。
`lineNumbersInTable`：值为`true`时可以在显示行数时提供友好的代码块复制黏贴功能。

### Table Of Contents文章目录

配置如下：
```
markup:
  tableOfContents:
    endLevel: 3
    ordered: false
    startLevel: 2
```

`startLevel`：从几级标题开始生成目录，值为2表示从`h2`开始生成目录。
`endLevel`：到几级标题为止生成目录，值为3表示大于`h3`的标题就不再生成目录。
`ordered`：是否生成排序目录，建议启用该功能，生成的目录会更为美观。

### 补充一个完整的toml格式的markup配置

上面分别给出了yaml格式的3种配置，下面是对应toml格式的完整配置：
```
[markup]
  defaultMarkdownHandler = "goldmark"
  [markup.asciidocExt]
    backend = "html5"
    extensions = []
    failureLevel = "fatal"
    noHeaderOrFooter = true
    safeMode = "unsafe"
    sectionNumbers = false
    trace = false
    verbose = false
    workingFolderCurrent = false
    [markup.asciidocExt.attributes]
  [markup.blackFriday]
    angledQuotes = false
    footnoteAnchorPrefix = ""
    footnoteReturnLinkContents = ""
    fractions = true
    hrefTargetBlank = false
    latexDashes = true
    nofollowLinks = false
    noreferrerLinks = false
    plainIDAnchors = true
    skipHTML = false
    smartDashes = true
    smartypants = true
    smartypantsQuotesNBSP = false
    taskLists = true
  [markup.goldmark]
    [markup.goldmark.extensions]
      definitionList = true
      footnote = true
      linkify = true
      strikethrough = true
      table = true
      taskList = true
      typographer = true
    [markup.goldmark.parser]
      attribute = true
      autoHeadingID = true
      autoHeadingIDType = "github"
    [markup.goldmark.renderer]
      hardWraps = false
      unsafe = false
      xhtml = false
  [markup.highlight]
    anchorLineNos = false
    codeFences = true
    guessSyntax = false
    hl_Lines = ""
    lineAnchors = ""
    lineNoStart = 1
    lineNos = false
    lineNumbersInTable = true
    noClasses = true
    style = "monokai"
    tabWidth = 4
  [markup.tableOfContents]
    endLevel = 3
    ordered = false
    startLevel = 2
```

## menu菜单属性

侧边栏菜单是在配置文件里配置的，如下：
```
[menu]

  [[menu.main]]
    identifier = "about"
    name = "<i class='fa fa-heart'></i>about hugo"
    url = "/about/"
    weight = -110

  [[menu.main]]
    identifier = "start"
    name = "getting started"
    post = "<span class='alert'>New!</span>"
    pre = "<i class='fa fa-road'></i>"
    url = "/getting-started/"
    weight = -100
```

`identifier`的值不能重复。
`weight`是比重，值越小则该菜单的位置越靠上面。
`name`是菜单名字。
`pre`和`post`分别对应当前菜单的前缀和后缀，可以定义fontawesome等图标。

## languages语言属性

该属性可以提供站点的国际化功能，即区分多语言版本的站点，比如若设定了en、zh两个语言，设定默认语言是zh；则默认的站点url的根目录后会加上`/zh/`，并可以通过站点首页的切换语言下拉框来切换到其他语音，如：`/en/`。

`languages`一般用来跟上面的`menu`一起配合使用，如下：
```
[Languages]
[Languages.en]
title = "Yulin Lewis' Blog"
weight = 1
languageName = "English"

[[Languages.en.menu.main]]
name = "<i class='fab fa-fw fa-github'></i> GitHub"
identifier = "github"
url = "https://github.com/lewky"
weight = 1

[Languages.zh]
title = "雨临Lewis的博客"
weight = 2
languageName = "简体中文"

[[Languages.zh.menu.main]]
name = "<i class='fab fa-fw fa-github'></i> GitHub"
identifier = "github"
url = "https://github.com/lewky"
weight = 1
```

此外，也可以将`languages`和`params`搭配使用，用法和上面类似，其实就是在这些属性的前面加上`languages`前缀而已。**但是不知道为什么，在本文背景里提及的hugo和LoveIt版本下，站点无法正常读取到多语言参数，比如`[languages.zh-cn.params]`这种属性会读取不了。**

## minify压缩属性

该属性用于压缩站点的各种静态资源，比如html、css、json、xml等，官方的默认配置如下：
```
[minify]
  disableCSS = false
  disableHTML = false
  disableJS = false
  disableJSON = false
  disableSVG = false
  disableXML = false
  minifyOutput = false
  [minify.tdewolff]
    [minify.tdewolff.css]
      decimals = -1
      keepCSS2 = true
    [minify.tdewolff.html]
      keepConditionalComments = true
      keepDefaultAttrVals = true
      keepDocumentTags = true
      keepEndTags = true
      keepQuotes = false
      keepWhitespace = false
    [minify.tdewolff.js]
    [minify.tdewolff.json]
    [minify.tdewolff.svg]
      decimals = -1
    [minify.tdewolff.xml]
      keepWhitespace = false
```

但实际上在配置文件中加入上述的配置并没有效果，也无法进行修改，这可能是个bug，因为和启用压缩的命令参数冲突了。不过从上面的配置可以看出，hugo自带的压缩功能是默认会压缩CSS、HTML、JS、JSON、SVG、XML；并且在压缩HTML的时候会保留注释、属性、文档标签和闭合标签，但是会去掉引号和空格。

如果想启用压缩功能，可以运行如下命令（记得运行前要先删掉`public`目录）：
```cmd
hugo --minify
```

也可以直接把这个参数配置到配置文件中，这样就可以不在运行命令时指定压缩参数：
```
minify = true
```

## 参考链接

* [Configure Hugo](https://gohugo.io/getting-started/configuration/)
* [Syntax Highlighting](https://gohugo.io/content-management/syntax-highlighting/#generate-syntax-highlighter-css)
* [Menus](https://gohugo.io/content-management/menus/#add-non-content-entries-to-a-menu)
* [Multilingual Mode](https://gohugo.io/content-management/multilingual/#configure-languages)