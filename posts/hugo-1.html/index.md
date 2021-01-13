# Hugo系列(1) - 简单搭建教程与远程部署

## 前言

使用Hexo搭建个人博客也有两年多时间了，当文章数量达到上百篇之后，开始发现Hexo生成文章的效率越来越慢，直到每次生成都需要至少五分钟的时间。我发现生成效率和文章涉及到的分类和标签有很大关系，由于文章数量多，每篇文章又都关联了若干个分类和标签，再加上我使用了压缩样式的插件，最终导致极其低下的生成效率。

在经过一段时间的考量后，决定将Hexo博客迁移到Hugo。Hugo是用go语言开发的，在用法上和Hexo类似，可以简单地把Hugo当成go语言版的Hexo，但是它拥有更快的生成效率。下面是官网的原话：
<!--more-->

>**The world’s fastest framework for building websites**
>
>Hugo is one of the most popular open-source static site generators. With its amazing speed and flexibility, Hugo makes building websites fun again.

## 安装

和Hexo不同，Hugo安装非常简单，只需要去[Hugo Release](https://github.com/gohugoio/hugo/releases)下载操作系统对应的二进制文件即可（`hugo`或者`hugo.exe`)。

对于Windows平台，一般是一个zip文件，解压后里面有个`hugo.exe`文件。将该文件所在目录添加到环境变量`path`里，即可在cmd里通过`hugo version`检测是否能正常运行hugo命令。

如下是我安装的hugo版本：
```cmd
>hugo version
Hugo Static Site Generator v0.74.2/extended windows/amd64 BuildDate: unknown
```

其他平台的安装方法可以参考官方文档：[Install Hugo](https://gohugo.io/getting-started/installing/)

## 创建站点

首先需要创建一个新的个人站点：
```cmd
hugo new site blog
```

`blog`就是你的博客站点所在的目录，也是这个站点的根目录，创建站点后目录结构如下：
```
archetypes/
content/
data/
layouts/
static/
themes/
config.toml
```

下面简单介绍下Hugo根目录下的各个文件目录的作用：
* `archetypes`存放创建文件时使用的模板，可以自定义`front matter`属性。
* `assets`存放需要被`Hugo Pipes`处理的文件，且只有使用了`.Permalink`或者`.RelPermalink`的文件才能被发布到`public`目录。
**注意，默认不会创建`assets`目录。**
* `config`是配置文件，可以有`JSON`、 `YAML`或者`TOML`三种格式，默认使用根目录下的`config.toml`、`config.yaml`或`config.json`中的某一个。可以通过`--config`来配置读取一个或多个配置文件，如：`hugo --config a.toml,b.toml,c.toml`。
**注意，默认不会创建`config`目录。**
* `content`存放的各种md文件用于部署站点，该目录下可以自行创建若干个子目录来便于对文章进行分类，这些子目录被称为`section`。
* `data`目录存放的是用于定义变量的模板文件，相当于Java里的常量类，这些文件有`JSON`、 `YAML`或者`TOML`三种格式，会在生成站点时被使用到。一般用不到该功能，具体用法可以参考：[data templates](https://gohugo.io/templates/data-templates/)
* `layouts`目录存放的模板文件用于渲染html页面，模板里可以定义不同页面的html代码。
* `static`目录存放的是静态内容：图片、CSS、JavaScript等。
* `resources`目录用于缓存某些文件来提高生成效率。
**注意，默认不会创建`resources`目录。**

## 添加主题

为新站点添加一个主题，以我使用的`LoveIt`主题为例，先将主题代码放置到`themes`目录下：
```cmd
cd blog
git init
git submodule add https://github.com/dillonzq/LoveIt.git themes/LoveIt
```

接着修改`config.toml`：
```
theme = "LoveIt"
```

这里的`LoveIt`对应`themes`目录下的主题的文件夹名字。

## 新建文章

新建一篇文章：
```cmd
hugo new posts/first.md
```

该命令会在`content/posts`目录下生成`first.md`文件，打开进行编辑：
```
---
title: "First"
date: 2020-09-08T21:57:28+08:00
draft: true
---
## First

First blog.
```

两行`---`里的属性是`front matter`，用来设置当前文章的属性配置。`front matter`的内容可以使用3种不同的格式来定义，两行`---`之间对应的是`YAML`格式，两行`+++`之间对应的是`TOML`格式，`{`和`}`之间对应的是`JSON`格式。

建议用`YAML`格式来定义，这样从Hexo迁移到Hugo的成本会更低。

下面是官方文档提供的3种不同格式的front matter的样例，有兴趣的可以了解下。

### TOML Example

```
+++
title = "spf13-vim 3.0 release and new website"
description = "spf13-vim is a cross platform distribution of vim plugins and resources for Vim."
tags = [ ".vimrc", "plugins", "spf13-vim", "vim" ]
date = "2012-04-06"
categories = [
  "Development",
  "VIM"
]
slug = "spf13-vim-3-0-release-and-new-website"
+++
Content of the file goes Here
```

### YAML Example

```
---
title: "spf13-vim 3.0 release and new website"
description: "spf13-vim is a cross platform distribution of vim plugins and resources for Vim."
tags: [ ".vimrc", "plugins", "spf13-vim", "vim" ]
lastmod: 2015-12-23
date: "2012-04-06"
categories:
  - "Development"
  - "VIM"
slug: "spf13-vim-3-0-release-and-new-website"
---

Content of the file goes Here
```

### JSON Example

```
{
    "title": "spf13-vim 3.0 release and new website",
    "description": "spf13-vim is a cross platform distribution of vim plugins and resources for Vim.",
    "tags": [ ".vimrc", "plugins", "spf13-vim", "vim" ],
    "date": "2012-04-06",
    "categories": [
        "Development",
        "VIM"
    ],
    "slug": "spf13-vim-3-0-release-and-new-website",
}

Content of the file goes Here
```

## 启动Hugo服务

输入命令：
```cmd
hugo server -D
```

在本地启动服务后可以在 http://localhost:1313/ 访问个人站点。该命令仅用于本地调试，支持热修改，也就是说在启动服务时修改文章会实时生效，但是该命令不会真正生成静态文件。

## 生成静态页面

输入命令：
```cmd
hugo -D
```

默认会在站点根目录的`public/`目录下生成对应的静态页面，可以通过在命令行指定`-d`或者`--destination`参数来改变静态页面的存放路径，也可以通过在配置文件中设置`publishDir`来指定。

该命令生成的静态页面文件是用来部署到pages服务的，比如GitHub pages或者Coding pages等。

另外，hugo允许对生成的静态页面设置特殊的参数，比如在文章的`front matter`里设置参数：`draft`, `publishdate`和`expirydate`。如下：
```
---
title: "First"
date: 2020-09-08T21:57:28+08:00
draft: true
publishdate: 2020-09-18T21:57:28+08:00
expirydate: 2020-09-28T21:57:28+08:00
---
```

`draft: true`表明该文章是草稿，如果在启用服务时不指定参数`-D`或`--buildDrafts`，或者在配置文件`config.toml`中配置`buildDrafts = true`，则会在生成文章时忽略草稿。如果不想指定该参数就生成文章，需要改为`draft: false`或者将其删去。

`publishdate: 2020-09-18T21:57:28+08:00`表示将来发布的时间，如果不指定参数`-F`或`--buildFuture`，或者在配置文件`config.toml`中配置`buildFuture = true`，则无法在规定的日期之前生成该文章。

`expirydate: 2020-09-28T21:57:28+08:00`表示过期时间，如果不指定参数`-E`或`--buildExpired`，或者在配置文件`config.toml`中配置`buildExpired = true`，则无法在规定的日期之后生成该文章。

## 远程部署到Pages服务

Hugo和Hexo一样是静态站点生成工具，不需要服务器即可进行部署运行，为了可以在网络上也访问到我们的博客，需要将静态博客部署到某些网站的pages服务上，借用人家的服务器进行托管。

常用的Pages服务有GitHub pages、Coding pages等，由于暂时没有找到好用的Hugo的远程部署插件，所以这里使用Git命令来进行远程部署。

**注意，所谓的远程部署，其实就是把`hugo`命令生成的`public`目录里的所有文件push到远程库，然后启用Pages服务进行静态网站的部署。这样，当有人访问静态站点的主页时，Pages服务就会去读取根目录下的`index.html`。**

本文以部署到GitHub Pages为例。

### 安装Git

首先要安装Git，Git是一个版本控制工具，可以用来帮忙管理我们的博客，直接前往官网下载安装包即可。

> [下载链接](https://git-scm.com/)

在安装的时候会问你是否安装git的cmd工具，把这个也一起安装了后就可以不需要配置环境变量了。这样就可以直接在cmd窗口里运行Git命令，如`git version`。

当然也可以直接使用安装时自带的Git Bash，个人更喜欢用Git Bash。

### 在GitHub上创建一个仓库

首先在GitHub上创建一个仓库，仓库的名字格式为`<username>.github.io`。比如我的GitHub用户名是lewky，那么这个仓库就命名为`lewky.github.io`。

之所以这样规定命名，是因为GitHub默认会把`<username>.github.io`的master分支的内容部署到GitHub Pages站点上。

### SSH key的创建与配置

因为要使用SSH的方式来和GitHub仓库进行交互，我们需要生成一对密钥对，然后将公钥配置到GitHub账号上。关于SSH key的创建与配置到GitHub，可以看我的另一篇文章的一个小章节：[#四、SSH key的创建与配置](https://lewky.cn/posts/1657.html/#四ssh-key的创建与配置) 的4.1 ~ 4.3的部分。

### 在本地关联GitHub的站点仓库

在本地创建一个新的文件夹，比如名为`hugo-deploy`。首先是初始化该文件夹为Git项目，命令如下：
```
git init
```

然后把本地的Hugo博客通过`hugo`命令生成的`public`目录下的所有文件都复制到这个新建的文件夹`hugo-deploy`里，然后用Git命令把这些复制过来的文件添加到本地仓库：
```
git add .
```

接着是提交修改，命令如下：
```
git commit -m "第一次提交"
```

`-m`参数代表提交信息，用于说明本次提交的目的，比如你发布了什么文章、修改了什么样式之类的信息说明。该参数不可以省略，不然会报错，另外要注意这里的双引号是**英文的双引号**。

接着把刚刚在GitHub上创建的仓库的SSH地址复制下来：点击GitHub仓库的`Code`绿色按钮，点击`SSH`就可以看到该仓库的SSH地址，然后点击地址后面的复制按钮即可。

用Git命令把这个SSH地址添加到我们的本地仓库，这样这个GitHub仓库就将作为我们的远程仓库，然后就可以通过Git命令把站点文件部署到GitHub上：
```
git remote add origin git@github.com:lewky/lewky.github.io.git
```

这里的`origin`是远程库的别名，后面是要关联的远程库SSH地址。

然后就是最后一步了，把我们刚刚提交到本地库的文件给推送到远程库。由于远程库刚刚创建，还不存在本地的分支（默认是master分支），所以第一次提交的命令要加是一个`-u`参数：
```
git push -u origin master
```

这样GitHub远程库上会创建出对应的`master`分支，以后推送文件的时候，就不需要再加上该参数了：
```
git push origin master
```

## 启用GitHub Pages服务

### 通过master分支来启用GitHub Pages

现在我们的GitHub仓库里已经有站点的文件了，接下来点击`Settings`进入该仓库的设置页面，找到`Github Pages`这一项，选择以`master`分支作为`Source`，然后保存；接下来这个仓库就会被部署到`https://{username}.github.io/{仓库名}`。

你会发现这里的url里多了子路径，但是如果仓库名是`{username}.github.io`的格式，那该url就会被简化为`https://{username}.github.io/`，这样就不需要在url后边添加上仓库名来访问个人站点了。

### 通过`gh-pages`分支来启用GitHub Pages

还有一种启用的方式是给仓库创建一个名为`gh-pages`的分支，然后把该分支设置为`Source`，同样可以让该仓库使用到GitHub Pages服务。

这种启用方式是只有当存在多个项目都要使用GitHub Pages才使用的，因为目前GitHub只允许一个仓库可以通过master分支来启用GitHub Pages。如果其他仓库也要使用GitHub Pages，就需要创建`gh-pages`分支来部署。

## 怎么同时部署到两个不同的Pages服务

进入本地仓库的目录，打开隐藏文件夹`.git`下的`config`文件，多添加一行`url = xxx`，如下：
```
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[remote "origin"]
	url = git@github.com:lewky/lewky.github.io.git
	url = git@e.coding.net:lewky/hugo-deploy/hugo-deploy.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[pull]
	rebase = true
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

此后只需要`git push origin master`就可以同时推送到多个远程库。


## 参考链接

* [Hugo Front Matter](https://www.gohugo.org/doc/content/front-matter/)
* [Hugo Quick Start](https://gohugo.io/getting-started/quick-start/)
* [Install Hugo](https://gohugo.io/getting-started/installing/)
* [Directory Structure Explained](https://gohugo.io/getting-started/directory-structure/)
* [Git的使用--如何将本地项目上传到Github](https://blog.csdn.net/zamamiro/article/details/70172900)
* [git push同时推送到两个远程仓库](https://www.jianshu.com/p/edc85a20ada9)
