# Hexo系列(1) - 简单搭建教程与远程部署

## 前言

搭建个人博客一般有两种选择，一个是使用WordPress，但是需要将博客搭建在服务器上，不过搭建好后写文章方便，适合没有程序基础的人使用。另一个是使用Hexo，相对简洁高效，不需要服务器，既可以部署在本地，也可以将博客部署到GitHub Pages上，支持Markdown语法，缺点是需要有Git基础，写文章比WordPress麻烦点。

初次使用Hexo来搭建个人博客，确实比较手忙脚乱，这里记录一下流程，希望对大家能有所帮助。
<!--more-->

（注：本文是只针对Windows平台的搭建教程）

有兴趣的可以戳下[这里](https://lewky.cn/)看看我的个人博客。

## How to play

本搭建教程一共分为3部分：

* 安装环境和本地搭建
* 博客的简单个性化配置
* 将博客部署到 GitHub Pages

请根据自身需要选择章节，以节省时间。

## 安装环境

* 安装Node.js
* 安装Git
* 安装Hexo

### 安装Node.js

Hexo是一个基于Node.js的快速、简洁且高效的静态站点生成框架，想要安装Hexo，需要先安装Node.js，官网的安装包有两种，一种是安装程序.msi文件，一种是.zip压缩包，这里选择.msi文件，安装后会自动配置好环境变量。

> [下载链接](https://nodejs.org/en/download/)

### 安装Git

Git就不多说了，作为开发者或多或少都会接触过吧，直接前往官网下载安装包即可。操作教程网上也是一堆，这里就不赘述了。

> [下载链接](https://git-scm.com/)

如果Git和Node.js的环境变量都配置好了，可以通过在cmd中确认安装结果。

```Bash
git --version
node -v
```
### 安装Hexo

安装好Node.js，就可以使用npm来安装Hexo

```Bash
npm install -g hexo-cli
```

安装完毕后，可以通过`hexo version`来确认是否安装成功。

## 开始搭建个人博客

千里之行，始于足下，在安装好所有的环境之后，我们终于可以开始搭建博客的第一步了。

### 初始化Hexo项目

首先是选择一个文件夹，用来给我们我们的个人博客的存放各种文件。接着进入该文件夹的路径，打开cmd命令窗口，这里有两种打开方式：

1. 按住Shift，同时点击鼠标右键，选择`在此处打开命令窗口`。
2. 在上方的地址栏里输入`cmd`，接着回车即可快速打开命令窗口。

当然，你也可以直接`Win+R`然后输入`cmd`来打开命令窗口，不过需要再通过cd命令将路径切换到你指定的文件夹。

接着输入指令来初始化你的博客

```Bash
hexo init
```

初始化成功后，你会看到

> Start blogging with Hexo!

### 生成静态页面文件

接下来，执行命令

```Bash
hexo g
```
该命令用来生成静态页面文件到public目录，Hexo会将 source 文件夹中除 posts 文件夹之外，以下划线`_`开头命名的文件或文件夹、以及隐藏的文件将会被忽略。Markdown 和 HTML 文件会被解析并放到 public 文件夹，而其他文件夹会被拷贝过去。

最后，我们只要启动Hexo服务器就行了。

### 本地启动Hexo服务器

```Bash
hexo s --debug
```

Hexo启动服务器的速度非常快，很快你就可以看到

> Hexo is running at http://localhost:4000/. Press Ctrl+C to stop.

恭喜你，你的个人博客已经搭建成功了，接下来只要在浏览器输入`http://localhost:4000/`就可以在本地访问你的博客了。

这里使用`hexo s`也可以启动服务器，只不过加上`--debug	`参数，如果运行中出错可以看到错误信息。

### 关闭Hexo服务器

要想关闭服务器，只需要在命令窗口按下`Ctrl+C`就可以了，这个组合键不仅仅用于关闭服务器，事实上你在cmd窗口中任何执行中的命令都可以用这个组合键来结束命令，只要连按两次该组合键就可以连输入Y或者N都不用。

## 常用的命令

```Bash
hexo new "postName"  #新建文章
hexo new page "pageName" # 新建页面
hexo generate # 生成静态页面至public目录
hexo server # 启动服务器(默认端口4000，'ctrl+c'关闭server)
hexo deploy # 项目部署
hexo help # 查看帮助
hexo version # 查看Hexo的版本
hexo clean # 清除Hexo的缓存
```

上边的一些命令可以使用简写

```Bash
hexo n
hexo g
hexo d
hexo s
```

### 本地调试三连

```bash
hexo clean
hexo g
hexo s --debug
```

### 远程部署三连

```bash
hexo clean
hexo g
hexo d
```

注：在使用部署命令时，需要先用npm安装 hexo-deployer-git 插件：

	npm install hexo-deployer-git --save

## 撰写第一篇博文

Hexo撰写博文也不难，分为 post 和 draft 两种，其中 post 存放在 source/_posts 目录下，draft 存放在 source/_drafts 目录下。

post 和 draft 的区别在于前者会被发布到博客，而后者不会被发布。

### 第一篇文章

```bash
hexo n post "my-first-post"
```

Hexo会自动在 source/_posts 目录下新建一个名为 my-first-post 的 .md 文件；打开该文件，可以看到：

```html
---
title: my-first-post
date: 2018-04-21 23:11:30
tags:
---
```

这是 post 模板自动生成的 YAML 文件头，title 是这篇 post 的标题，可以将其改为 My First Post；date 是创建的日期；tags 是该 post 的标签，可以添加自定义的标签：

```html
---
title: My First Post
date: 2018-04-21 23:11:30
tags:
	- demo
	- first-post
---
```

接着再进行本地调试三连，就可以看到刚刚写好的博文了。

```bash
hexo clean
hexo g
hexo s --debug
```

### 第一篇草稿

创建命令和前边类似：

```bash
hexo n draft "my-first-draft"
```

另外草稿的头文件是没有日期的：

```html
---
title: my-first-draft
tags:
---
```

草稿文件是不会被 `hexo g` 命令生成到public目录下的，也就是说这些草稿文件是无法在启动站点时被看见，你也可以直接在一篇不想要被展示的文章里加上`draft: true`到文件头里，以此避免被Hexo渲染到站点里。

接下来讲下博客的简单个性化配置，譬如站点的基本配置（语言、头像、站点图标等）、安装新的Hexo主题（NexT主题）以及主题的配置。

## 博客的简单个性化配置

打开站点配置文件 ，找到：

```html
# Site
title: Hexo
subtitle:
description:
keywords:
author: John Doe
language:
timezone:
```

根据自己的需要去修改上边的配置，这些配置的注释如下：

```html
# Site
# 站点标题
title: Hexo
# 站点副标题
subtitle:
# 站点描述
description:
# 站点关键词
keywords:
# 站点主人
author: John Doe
# 站点语言
language:
# 站点时区
timezone:
```

### language

目前 NexT 支持的语言如下：

|语言|language|
|-|-|
|English|en|
|简体中文|zh-Hans|
|Français|fr-FR|
|Português|pt或者pt-BR|
|繁體中文|zh-hk或者zh-tw|
|Русский язык|ru|
|Deutsch|de|
|日本語|ja|
|Indonesian|id|
|Korean|ko|

### timezone

Hexo 默认使用电脑的时区，也可以自己配置，比如：

	UTC+8

## 安装新主题

Hexo有很多大佬开发的主题，很多人使用的是NexT主题，该主题也确实挺简洁好看的，新版本的NexT主题还可以选择四个主题。

那么怎么安装新的Hexo主题呢？

在我们的Hexo项目路径下，可以看到有个 themes 文件夹，这个文件夹就是用于存放主题文件的。

### 下载 NexT 主题

首先在Hexo项目的路径下打开命令窗口，如果你没有配置好Git的环境变量，请使用Git Bash。

```bash
git clone https://github.com/iissnan/hexo-theme-NexT themes/NexT
```

注意，当前路径是你的Hexo项目根目录，使用上边的命令才能正确地将 NexT 主题clone到themes文件夹下的NexT文件夹里。

接下来你会看到 themes 下多了个 NexT 文件夹，点进去你会看到个`.git`文件夹，将该文件夹删掉，否则到时候你无法将整个完整的Hexo项目push到GitHub上。

### 启用 NexT 主题

在Hexo项目中，有两个重要的配置文件 `_config.yml`；这两个配置文件一个在项目根目录下，一个在主题目录下。

前者是站点配置文件，后者是主题配置文件，顾名思义，一个是Hexo项目的配置选项，一个是主题文件的配置选项。

打开站点配置文件，用Windows自带的笔记本是无法打开该文件的，请使用其他的编辑器来打开，常见的编辑器有Notepad++，UltraEdit，EditPlus等。

在站点配置文件中，找到：

```html
# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: landscape
```

默认的博客主题就是这个，我们将其修改为NexT；这里的主题是指在 themes 文件夹下的对应主题的文件夹名字。

<font color="red">**注意</font>，在配置文件中所有的属性的值，都必须和前边的 `:` 之间留一个空格。**比如下边的写法就是错误的，不加上空格的话会出错。

```html
theme:landscape
```

### 选择对应主题的外观 Scheme

打开主题配置文件，找到下边的选项：

```html
# ---------------------------------------------------------------
# Scheme Settings
# ---------------------------------------------------------------

# Schemes
scheme: Muse
#scheme: Mist
#scheme: Pisces
#scheme: Gemini
```

默认会使用Muse作为NexT主题的外观，通过将某个scheme前边的`#`去掉来启动某个外观，如下：

```html
# ---------------------------------------------------------------
# Scheme Settings
# ---------------------------------------------------------------

# Schemes
#scheme: Muse
#scheme: Mist
#scheme: Pisces
scheme: Gemini
```

### 验证新主题

依然是老操作——启动调试模式服务器：

```Bash
hexo s --debug
```

启动成功后，使用浏览器访问[`http://localhost:4000/`](http://localhost:4000/)，看看博客能否访问成功。

## 修改 NexT 主题配置

主题配置文件 `_config.yml` 位于 `themes\NexT` 之下。

### 3.1 头像设置

打开主题配置文件，找到如下：

```html
# 侧边栏头像
# Sidebar Avatar
# in theme directory(source/images): /images/avatar.gif
# in site  directory(source/uploads): /uploads/avatar.gif
# 头像的路径可以放在主题对应文件夹的source里，也可以放在站点根目录的source里，建议放在站点路径上
#avatar: /images/avatar.gif
```

将avatar前边的#去掉，接着配置图片的路径即可。

### 网站图标

打开主题配置文件，找到如下：

```html
# 将你的网站图标放到`{站点根目录}/source/` (推荐）或者`hexo-site/themes/NexT/source/images/`目录下
# 默认的NexT主题的网站图标放在`{站点根目录}/themes/NexT/source/images/`目录下
# 如果你想将自己的网站图标放到`{站点根目录}/source/`根目录下，必须将`/images`从路径中去掉
# 如果你将网站图标放到了`{站点根目录}/source/images`路径下，需要令网站图标的名字和`{站点根目录}/themes/NexT/source/images/`路径下的网站图标不同，否则网站图标会使用后者的同名图标
favicon:
  small: /images/favicon-16x16-NexT.png
  medium: /images/favicon-32x32-NexT.png
  apple_touch_icon: /images/apple-touch-icon-NexT.png
  safari_pinned_tab: /images/logo.svg
  #android_manifest: /images/manifest.json
  #ms_browserconfig: /images/browserconfig.xml
```

这里需要注意的是，网站图标一般是.ico或者.gif的类型，而且图标的大小一般只有几k而已，可以使用下边的网站制作个人的网站图标，建议先将原本的图标弄成正方形的。

> [在线制作ico图标](http://www.bitbug.net/)

### 菜单设置

打开主题配置文件，找到如下：

```html
# 如果该站点是运行在子目录之下（比如：domain.tld/blog；这里的blog就是指我们的博客，前边的是上一级的域名），需要将路径前的斜杠去掉（/archives -> archives；即是将原本的绝对路径改成了相对路径）。
# 用法：`Key：/link/ || 菜单图标`
# Key就是菜单名，如果对该菜单名进行了国际化，即将其翻译放到对应的languages文件夹中，将会根据你设置的语言进行加载对应的菜单名翻译；如果没有设置翻译，则会使用这里的Key作为菜单名。这里的Key是大小写敏感的。
# 在`||`分隔符之前的值是该菜单对应的路径
# 在`||`分隔符之后的值是FontAwesome的图标（不懂的请百度什么是FontAwesome以及其用法），如果不指定图标，将会自动使用question这个图标。

menu:
  home: / || home
  #about: /about/ || user
  #tags: /tags/ || tags
  #categories: /categories/ || th
  archives: /archives/ || archive
  #schedule: /schedule/ || calendar
  #sitemap: /sitemap.xml || sitemap
  #commonweal: /404/ || heartbeat
```

使用方法很简单，依然是将需要展示的菜单的前边的#去掉就行，更加具体的操作信息我已经在上边的注释中给出了。

### 标签分类

首先我们需要新建页面，在站点根目录打开命令窗口，分别输入命令：

```bash
hexo n page "categories"
hexo n page "tags"
hexo n page "about"
```

接着你会发现在根目录的 source 目录下多出了上边的三个文件夹，里面各自有一个 index.md 文件。如果之前我们将menu里的categories，tags，about三个菜单解开了封印，那么在创建好这三个页面后就可以成功访问到，否则会报404请求错误。

### 社交链接

```html
# 如果不指定图标，会默认使用globe图标
#social:
  #GitHub: https://github.com/yourname || github
  #E-Mail: mailto:yourname@gmail.com || envelope
  #Google: https://plus.google.com/yourname || google
  #Twitter: https://twitter.com/yourname || twitter
  #FB Page: https://www.facebook.com/yourname || facebook
  #VK Group: https://vk.com/yourname || vk
  #StackOverflow: https://stackoverflow.com/yourname || stack-overflow
  #YouTube: https://youtube.com/yourname || youtube
  #Instagram: https://instagram.com/yourname || instagram
  #Skype: skype:yourname?call|chat || skype
```

老规矩，去掉#注释就可以启动。最后介绍下如何将本地的个人项目远程部署到 GitHub Pages，涉及到GitHub的项目仓库、Git的使用，以及Hexo的远程部署等。

## 安装 `hexo-deployer-git` 插件

想要将Hexo项目部署到 GitHub上，需要先安装一个插件。在Hexo项目的根目录打开命令窗口，输入：

	npm install hexo-deployer-git --save

## GitHub上创建一个仓库

仓库的名字可以随便起，不过这个仓库是作为我们的博客仓库的，所以尽量将名字以 {username}.github.io 的形式来起。

比如，我的GitHub用户名是lewky，我就会把这个仓库命名为lewky.github.io。（为什么要这样起名，后面会说明）

## 修改本地的项目配置文件

在 _config.yml 找到如下：

```html
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type:
```

把刚刚我们新建的GitHub仓库链接配置进来：

```html
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: git
  repo: git@github.com:/{user}/{repository}.git
  branch: master
  message:
```

请注意，这里的仓库地址如果写成：`https://github.com/{user}/{repository}.git`可能会在后边的部署时无法成功，需要将`https://github.com`改成如下格式：

```bash
git@github.com:
```

另外这里的branch和message可以不填，branch会默认是master分支，message会默认用下边的格式模板：

```html
Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}
```

## SSH key的创建与配置

最关键的一步来了，我们需要生成一对密钥对，然后将公钥配置到GitHub账号上。

### 生成RSA密钥对

首先使用 Git Bash 输入：

```bash
cd ~/.ssh
```

`~` 指的是当前用户的根目录，即 `C:\Users\{user}\`；而 `.ssh` 目录下一般存放着公开的SSH key文件：

* id_dsa.pub
* id_ecdsa.pub
* id_ed25519.pub
* id_rsa.pub

此外还有个 `known_hosts` 文件，SSH会把我们每个访问过的计算机的公钥(public key)都记录在里面。

如果在使用了 `cd ~/.ssh` 后能找到路径，那就把该目录下的 id_rsa.pub 文件里的内容复制到剪切板。如果找不到路径，就执行命令：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

该命令会生成新的SSH key，这里的参数含义：

```html
-t: type，生成的密钥类型
-b: bits，指定密钥长度，对于RSA密钥，最小要求768位，默认是2048位。DSA密钥必须恰好是1024位，一般越长越安全。
-C: comment，提供一个新注释
```

接着会看到如下提示：

```bash
Enter file in which to save the key (/c/Users/123/.ssh/id_rsa):
```

这里按下回车，表示将SSH key保存到默认地址，即：`C:\Users\{user}\`

如果本身已经存在一个RSA私钥了，会提示你：

```bash
/c/Users/123/.ssh/id_rsa already exists.
Overwrite (y/n)?
```

这里输入 y 可以重新生成RSA密钥对；然后就会看到如下提示：

```bash
Enter passphrase (empty for no passphrase):
```

这里按下回车，表示不设置密码；接着会再提示你输入重复密码，依然是按下回车。

```bash
Enter same passphrase again:
```

这时候我们的SSH key就生成好了，去 `~/.ssh` 目录下将里边的 id_rsa.pub 文件里的内容复制到剪切板。

### 在 GitHub 上配置SSH key

接着登陆我们的 GitHub 账号：

* 进入 Settings 页面
* 选择 SSH and GPG keys
* 点击 New SSH key
* 填写 Title（用来给公钥起一个名字，以便和其他的公钥区分开来）
* 然后在 Key 里将我们刚刚复制的公钥复制进去
* 最后点击 Add SSH key，这时候 GitHub 会要你输入账号密码进行确认。

### 验证ssh连接

使用 Git Bash 输入：

```bash
ssh -T git@github.com
```

接着会看到：

```bash
The authenticity of host 'github.com (192.30.253.112)' can't be established.
RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
Are you sure you want to continue connecting (yes/no)?
```

输入 yes，会看到：

```bash
Warning: Permanently added 'github.com,192.30.253.112' (RSA) to the list of known hosts.
Hi lewky! You've successfully authenticated, but GitHub does not provide shell access.
```

这时候 github.com的公钥被保存到known_hosts文件里，如果我们再执行一次`ssh -T git@github.com`，就不需要输入yes了，会直接看到：

```bash
Hi lewky! You've successfully authenticated, but GitHub does not provide shell access.
```

### 部署到 GitHub Pages

输入命令：

```bash
hexo d
或者
hexo g -d
```

后一条命令表示生成静态页面并部署到远处仓库，第一次部署会久一点，部署成功后会看到：

```bash
 * [new branch]      HEAD -> master
INFO  Deploy done: git
```

接着登陆 GitHub 并进入我们的项目仓库，可以看到已经多出了很多文件，且其 message 都是默认的格式：
```html
Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}
```

接下来点击 Settings 进入该仓库的设置页面，找到 Github Pages 这一项，选择以 Master 分支作为 source，然后保存；接下来这个仓库就会被部署到 https://{username}.github.io/{仓库名}。

如果你希望直接通过 https://{username}.github.io/ 来访问你的博客，可以将仓库名改为 {username}.github.io；这样就不需要在url后边添加上仓库名来访问了。

接下来，开始享受你的个人博客吧 :)

