# 分享一些有趣的前端图形和页面

## css绘制三角形

在盒子模型中border也占据了宽高，对于下面的样式：
```css
#div1{
    width: 100px;
    height: 100px;
    border-style: solid;
    border-width: 100px 100px 100px 100px;
    border-color: red forestgreen blue cyan;
}
```
<!--more-->

效果如下：
<style>
#div1{
    width: 100px;
    height: 100px;
    border-style: solid;
    border-width: 100px 100px 100px 100px;
    border-color: red forestgreen blue cyan;
}
</style>
<div id="div1"></div>

可以看到边框是由上下左右4个部分组成的，如果将div1的宽高设置为0，就变成如下效果：
<style>
#div2{
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 100px 100px 100px 100px;
    border-color: red forestgreen blue cyan;
}
</style>
<div id="div2"></div>

可以发现边框变成了4个等腰直角三角形，如果继续将上边框的宽度设置为0，如下：
```css
#div1{
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 100px 100px 100px;
    border-color: red forestgreen blue cyan;
}
```

<style>
#div3{
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 100px 100px 100px;
    border-color: red forestgreen blue cyan;
}
</style>
<div id="div3"></div>

可以看到，上面的三角形不见了，而左右两个三角形变小了，所以可以通过设置4个边框宽度来自由调整三角形的形状。如果只需要其中某个三角形，只要将不需要的三角形颜色设置为透明即可，如下：
```css

#div1{
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 100px 100px 100px;
    border-color: transparent transparent blue transparent;
}
```

效果如下：

<style>
#div4{
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 100px 100px 100px;
    border-color: transparent transparent blue transparent;
}
</style>
<div id="div4"></div>

还可以通过设置不同的`border-style`来得到其他特殊的图形：
<style>
#div5{
    width: 0;
    height: 0;
    border-style: double;
    border-width: 0 100px 100px 100px;
    border-color: transparent transparent blue transparent;
}
#div6{
    width: 0;
    height: 0;
    border-style: dotted;
    border-width: 0 50px 100px 50px;
    border-color: transparent transparent blue transparent;
}
#div7{
    width: 0;
    height: 0;
    border-style: groove;
    border-width: 0 100px 100px 100px;
    border-color: transparent transparent blue transparent;
}
</style>
<div style="display:flex;">
	<div id="div5"></div>
	<div id="div6"></div>
	<div id="div7"></div>
</div>

## css绘制小猪佩奇

偶然看到的大佬的作品，这是[效果页面](/funny/front-end/peppa_pig.html)，这是[源码页面](https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/funny/front-end/peppa_pig.html)。

<iframe src="/funny/front-end/peppa_pig.html" frameborder="none" name="peppa_pig" style="width:450px;height:500px;"></iframe>

## 好看的404页面

### 猴子动态SVG图

图片上方的文字我自己加的，可以无视之，关注本体的猴子动态图即可。

这是[效果页面](/404.html)，这是[源码页面](https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/404.html)。

<iframe src="/404.html" frameborder="none" name="404_monke" style="width:100%;height:600px;"></iframe>

## 参考链接

* [css如何将div画成三角形](https://www.cnblogs.com/v-weiwang/p/5057588.html)
* [用 CSS 画小猪佩奇，你就是下一个社会人！](https://www.v2ex.com/t/455807)
* [分享一个404页面（猴子动态SVG图）](https://blog.csdn.net/my_flash/article/details/79347810)