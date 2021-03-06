# 页面的背景音乐加载很慢

## 问题

由于我在页面中使用了`<audio>`标签来播放一首背景音乐，该音频是一首大小为2.7MB的MP3文件。在第一次加载该页面时，需要花费相当长的一段时间去加载音频。
<!--more-->

## 解决方法

百度了下才知道，原来超过2MB的背景音乐其实是一个很巨大的文件了，如果网速稍微慢一些用户体验就会很差了。大概有几种解决的办法：
1. 把音乐加到FLASH里
2. 使用rm或wma格式的背景音乐
3. 降低MP3文件的音质

* 第一个就不说了，FLASH已经声名狼藉，注定凉凉了。
* 第二个出于不同浏览器的兼容性以及`<audio>`标签的兼容性，还是决定使用MP3文件。
* 最后就只能使用第三种方法了，通过MP3压缩软件，最后将该MP3音频压缩到了400KB左右，总算是马马虎虎实现了想要的效果。

这里说一下，我用的mp3压缩软件是RazorLame

## 参考链接

* [网页中背景音乐加在太慢](https://bbs.csdn.net/topics/380267348)
* [【工具分享】wav转mp3的强力软件RazorLame（强烈推荐）](https://tieba.baidu.com/p/2797296677?red_tag=2321846004)
* [RazorLame 完全攻略](http://www.wavecn.com/content.php?id=74)