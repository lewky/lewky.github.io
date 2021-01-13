# $("body").animate({"scrollTop":top})无效的问题

## 问题

我在[个人站点的左下角和右下角](https://lewky.cn)各自使用了如下代码来将页面滚动到顶部和底部：

```javascript
$("body").animate({scrollTop:0},800);

$("body").animate({scrollTop:$(document).height()},800);
```
<!--more-->

最近才忽然发现在Chrome浏览器下，上面的代码没有问题，而在Firefox下却是无效的。百度后才知道，原来这是因为这两个浏览器自身的问题导致的。

对于Chrome而言，支持的是这种写法：
```javascript
$("body"）.animate({"scrollTop":top});
```

而对于Firefox，则是支持如下写法：
```javascript
$("html").animate({"scrollTop":top});
```

之前就一直耳闻前端开发需要兼容不同浏览器，非常地麻烦，今天算是见识到了冰山一角。

## 解决方法

既然这两个浏览器各自支持一种标签选择器，那么只要把两者统合起来即可实现兼容：
```javascript
$("html,body"）.animate({"scrollTop":top});
```

最终，将我的代码改成如下形式便没问题了：
```javascript
$("html,body").animate({scrollTop:0},800);

$("html,body").animate({scrollTop:$(document).height()},800);
```

## 参考链接

* [jQuery中animate()方法以及$('body').animate({"scrollTop":top})不被Firefox支持问题的解决](https://www.cnblogs.com/rachelch/p/7498966.html)
