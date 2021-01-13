# 前端问题汇总

## 如何让input文本框和图片对齐

在默认情况下，input文本框和图片无法自然对齐，总会有所偏差，文本框往往会比图片要往下边一点，只要给元素添加`vertical-align:bottom`即可令两者底部水平对齐，代码如下：
```html
<input type="text" style="vertical-align:bottom">
<img src = "images/露琪亚.jpg" width = "50%" height = "50%" alt = "露琪亚" title = "死神里的露琪亚"  style="vertical-align:bottom">
```
<!--more-->

另外还可通过vertical-align的其他属性进行垂直布局。

## 如何设置透明度属性

```css
<!-- IE8 以及更早的版本 -->
filter:alpha(opacity=50);   
<!-- 火狐浏览器 -->
-moz-opacity:0.5;   
<!-- Konqueror浏览器 -->
-khtml-opacity: 0.5;   
<!-- 所有浏览器都支持的一个css属性 -->
opacity: 0.5;
```

## 如何通过选中文字来勾选/取消复选框

想要在选中文字的时候就自动勾选或取消复选框，有两种实现的方式：

### 方式一：在复选框的外边包上label标签

```html
<label><input type="checkbox">233333333</label>
```

### 方式二：通过label标签的for属性来联动某一个复选框

```html
<input type="checkbox" id="check1">
<label for="check1">55555555555</label>
```

另外，当复选框和文字无法对齐的时候，可以在复选框里添加`style="vertical-align: sub;"`来实现对齐。

## 如何屏蔽双击选中文本

IE浏览器可以通过在某个标签里添加`onselectstart="return false"`来屏蔽双击选中文本，该属性在火狐中无效，火狐需要用`style="-moz-user-select:none;"`。此外还可以在body里添加该属性来实现整个网页都无法选中文字。

类似的属性属性还有：

禁止鼠标右键：`oncontextmenu="return false"`
禁止拖放：`ondragstart="return false"`
禁止拷贝：`oncopy=document.selection.empty()`
禁止复制：`oncopy = "return false"`
禁止保存：`<noscript><iframe src="*.htm"></iframe></noscript>`，放在head里面。
禁止粘贴：`<input type=text onpaste="return false">`
禁止剪贴：`oncut = "return false"`
关闭输入法：`<input style="ime-mode:disabled">`

## 单词的自动换行问题

当行内出现很长的英文单词或者url的时候，会出现自动换行的问题，为了美化页面，往往会希望这些很长的英文单词或者url能够断开来，超出的部分换行到下一行。

可以通过使用两个属性来实现该需求：

```css
word-wrap:break-word;
word-break:break-all;
```

### word-wrap

`word-wrap`用来控制换行，有两种取值：
　　normal 
　　break-word（此值用来强制换行，内容将在边界内换行，中文没有任何问题，英文语句也没问题。但是对于长串的英文，就不起作用。）

### word-break

`word-break`用来控制断词，有三种取值：
　　normal
　　break-all（是断开单词。在单词到边界时，下个字母自动到下一行。主要解决了长串英文的问题。）
　　keep-all（是指Chinese, Japanese, and Korean不断词，一句话一行，可以用来排列古诗哟~）

## JS文件中的中文在网页上显示为乱码

如果页面已经设置了`<meta charset="utf-8">`，JS文件里的中文在网页上仍然显示为乱码，可能是由于JS文件的编码问题导致的。

JS文件本身的编码默认为`ANSI编码`，而引入该JS文件的页面则使用了`utf-8`编码，所以导致了中文乱码。解决方法是将该JS文件自身的编码改为`utf-8`编码，可以借助常用的编辑器比如`Nodepad++`或者`Editplus`等来修改JS文件自身的编码。

## 参考链接

* [解决文档中有url链接时被强制换行的问题](https://blog.csdn.net/u011565547/article/details/77198026)
* [JS文件中的中文在网页上显示为乱码](https://www.cnblogs.com/sharpest/p/7675856.html)