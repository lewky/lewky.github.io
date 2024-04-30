# js、css外部文件的相对路径问题

如果js、css外部文件有使用到相对路径时，需要注意其相对路径的基准是不一样的。

比如说，在index.html中引用到了外部的js和css文件，这两个文件都通过相对路径引用了某一张图片；这些文件所在的目录如下：

```html
.
├── js
|   └── index.js
├── css
|   └── index.css
├── images
|   └── bg.jpg
└── index.html

```
<!--more-->

js文件的相对路径是以引用该js文件的页面为基准，所以在js文件中的相对路径是：

```html
function changeImage(){
    document.body.style.backgroundImage="url(images/bg.jpg)";
}
```

css文件的相对路径是以自身的位置为基准，所以在css文件中的相对路径是：

```html
.index_bg {
    background-image: url(../images/bg.jpg);
}
```

index.html的代码如下：

```html
<!DOCTYPE html>
<html>
<head> 
<meta charset="utf-8"> 
<title>index</title>
<link rel="stylesheet" href="css/index.css" type="text/css">
</head>
<body>

<h1>Hello World!</h1>
<div class="index_bg"></div>
<br>
<button type="button" onclick="changeImage()">设置背景图片</button>

<script src="js/index.js"></script>
</body>
</html>
```

> 总结

* js文件的相对路径是以引用该js文件的页面为基准
* css文件的相对路径是以自身的位置为基准
