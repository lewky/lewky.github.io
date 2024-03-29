# 建站日志

{{< admonition tip "Siting Log" >}}
<font color="red" size="4px">`o(*￣▽￣*)ブ` 持续更新中 </font><i class="fas fa-sync fa-spin"></i>
{{< /admonition >}}

<div align="center">
<a href="https://github.com/lewky/lewky.github.io" target="_blank">
  <img src="https://img.shields.io/github/watchers/lewky/lewky.github.io">
</a>
<a href="https://github.com/lewky/lewky.github.io" target="_blank">
  <img src="https://img.shields.io/github/stars/lewky/lewky.github.io">
</a>
<a href="https://github.com/lewky/lewky.github.io" target="_blank">
  <img src="https://img.shields.io/github/forks/lewky/lewky.github.io">
</a>
<a href="https://github.com/lewky/lewky.github.io" target="_blank">
  <img src="https://img.shields.io/github/last-commit/lewky/lewky.github.io?label=last%20updated">
</a>
</div>

## TODO LIST

>* 开源本站主题，主题名暂定为heap

<!--more-->

## 2021-08-23

添加打赏榜

## 2021-07-24

最近Waline评论被恶意攻击了，修改了配置：

* 评论之前必须先注册登录
* 评论需要经过审核才可发布

## 2021-06-05

* 菜单栏支持子菜单
* 将站点部署到Vercel（2021年Vercel的原国内服务器被墙了，换了个新的CNAME才解决）

## 2021-06-02

添加抓猫咪游戏

## 2021-04-24

添加文章top15页面

## 2021-04-20

* 添加下拉菜单
* 添加BBS，使用Artitalk作为公告栏

## 2021-04-17

* 站点底部添加站点运行时间
* 关于页面去除头部的站点运行时间

## 2021-02-17

* 将评论改为Waline，并部署在Vercel
* 评论添加自定义表情包
* 修改友链样式

## 2021-01-24

* 修改站内搜索fuse.js的参数，优化中文搜索效果
* 添加site.webmanifest
* 添加文章过期提醒
* 添加文章打赏

## 2021-01-17

首页头像添加b站挂件 

## 2021-01-16

页面下方添加拉姆雷姆快捷跳转功能

## 2021-01-15

添加文章加密功能

## 2021-01-13

重新启用阅读原始文档功能，并解决GitHub Pages服务由于原始文档里的某些特殊代码导致部署失败的问题

## 2021-01-10

* 添加右键菜单
* 评论区添加背景图片

## 2021-01-09

添加[Mikutap](https://github.com/HFIProgramming/mikutap)。

## 2020-12-29

解决LeanCloud流控问题。

## 2020-12-27

友链墙功能完成。

## 2020-12-23

Valine评论系统的邮件通知增强完成。

## **2020-12-20 ※**

正式加入【十年之约】！

要努力将个人站点维护十年以上！！有兴趣的朋友可以去[十年之约的官网](https://www.foreverblog.cn/)看看。

## 2020-10-14

修复`LoveIt`主题的部分bug，更改了部分样式，主要包括：
* 添加背景图片轮播
* 归档、分类页面添加了数量统计
* 修改了h2的样式
* 缩小目录的字体
* 修改了引用块样式

## **2020-10-09 ※**

开始将博客从Hexo迁移到Hugo，决定使用`LoveIt`主题，并正式将博客部署到了Pages上。

## 2018-12-19

最近发现打开页面略慢略卡，发现是jquery-backstretch的cdn加载不了，原本官网使用的cdn是cloudflare的，现在改成了另一个cdn地址。

于是将jquery-backstretch的cdn修改了官网上最新的，总算变快了。

## 2018-11-16

将鼠标点击产生的文字设为不可选定。

## 2018-11-10

解决在适配手机屏幕时，页面右上角的GitHub彩带被覆盖掉的问题。

## 2018-09-18

* 添加了图片懒加载插件`hexo-lazyload-image`
* 出于强迫症，还是关闭了不蒜子的统计功能，目的是为了解决下边的问题二。

## 2018-08-21

最近发现了两个问题：
1. 如果文章不写小标题，是不会生成文章目录的，如果启用了`leancloud`的阅读计数功能，这时候这篇文章的阅读页面的侧边栏就会失去`affix.js`的固定定位效果；(该bug在火狐浏览器下偶尔会触发，在360浏览器下百分百触发)
2. 如果启用了不蒜子计数，在360浏览器下如果滚动页面时，侧边栏的底部无法和正文模块的底部持平，侧边栏底部会比正文模块的短一些。该问题在火狐浏览器下不存在。

解决方案：
1. 问题一需要给每篇文章都起至少一个小标题，这样就会自动生成文章目录，也就不存在这个问题了。
也可以选择关闭`leancloud`的阅读计数功能，重新生成静态页面就行了。
2. 问题二对于强迫症来说很难受，要么关闭不蒜子计数，要么不使用360浏览器。

## 2018-08-18

修改了hexo-neat的压缩选项，优化页面的加载

## 2018-08-17

头像挂件添加自动刷新功能和彩蛋

## 2018-08-14

去掉了文本首行缩进，首行缩进有个问题：当一个段落内存在换行时，比如使用`<br>`，会导致换行后无法缩进，不太好看；找了好久也没找到解决的方法，只能取消文本的首行缩进了。

如果需要首行缩进还是自己手动添加`&emsp;&emsp;`(全角空格，即对应两个中文空格)……

## 2018-07-26

* 改善文章目录的换行问题
* 添加文章不在首页显示的功能：在文件头里添加`not_show: true`即可启用

## 2018-07-21

添加了404页面

## 2018-07-07

添加网页标题监听事件

## 2018-06-30

代码块添加复制按钮

## 2018-06-20

使用 `hexo-neat` 压缩博文插件，优化博客静态资源

## 2018-06-16

* 添加 `Font Awesome 4.6.2`的CDN，支持使用font awesome4或5
* 友情链接里添加恶搞页面
* 关于页面添加站点运行时间
* 添加站点背景图片轮播

## 2018-06-10

使用来必力作为评论系统

## 2018-06-03

添加头像挂件功能

## 2018-05-12

* 文章启用字数统计、阅读时长，修改其显示的样式
* 使用 `Font Awesome Free CDN ( upgrade from version 4 to 5 )`
* 添加文章加密功能
* 指定 `Markdown` 的解析器
* 修改 `Hexo` 永久链接的默认格式

## 2018-05-01

添加建站日志

## **2018-04-24 ※**

使用 `Hexo` 搭建个人博客