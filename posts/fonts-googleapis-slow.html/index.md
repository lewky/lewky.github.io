# fonts.googleapis.com访问太慢导致站点加载很慢

## 前言

有些网站需要加载谷歌字体，由于网络问题或者某些问题，`fonts.googleapis.com`访问太慢会导致站点加载很慢。虽然最后能看到网站，但实际上谷歌字体依然加载失败了，这个体验就非常差劲了。
<!--more-->
## 解决方法

实际上这个谷歌字体是可以不需要去访问的，当然有强迫症的可以靠fan qiang等某些操作来达到快速加载的目的。个人建议是直接屏蔽掉这个谷歌字体的访问，一般都会在浏览器安装`adblockplus`等广告拦截插件，可以在这些广告拦截插件添加新的拦截规则：
```
||fonts.googleapis.com
```

这样就可以拦截谷歌字体的访问，以避免访问站点过慢的问题。按照这个思路，理论上直接改hosts文件，把这个地址重定向到localhost应该也是可行的。

## 补充

如果是自己搭建的站点需要加载谷歌字体，那么有两种方法。

### 方法一

使用360提供的cdn，将需要加载的谷歌字体的url放到360的[Google 字体库](https://cdn.baomitu.com/index/fonts)搜索，会得到一串css代码，将代码拷贝到一个css文件中然后站点直接引入该css文件即可。

比如说，现在需要引入`https://fonts.googleapis.com/css?family=Roboto+Mono|Source+Sans+Pro:300,400,600`这个谷歌字体，那么前往360的Google 字体库搜索得到如下代码：
```css

/* roboto-mono-regular */
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: regular;
  src: url('//lib.baomitu.com/fonts/roboto-mono/roboto-mono-regular.eot'); /* IE9 Compat Modes */
  src: local('Roboto Mono'), local('RobotoMono-Normal'),
       url('//lib.baomitu.com/fonts/roboto-mono/roboto-mono-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('//lib.baomitu.com/fonts/roboto-mono/roboto-mono-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('//lib.baomitu.com/fonts/roboto-mono/roboto-mono-regular.woff') format('woff'), /* Modern Browsers */
       url('//lib.baomitu.com/fonts/roboto-mono/roboto-mono-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('//lib.baomitu.com/fonts/roboto-mono/roboto-mono-regular.svg#RobotoMono') format('svg'); /* Legacy iOS */
}
  
/* source-sans-pro-300 */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  src: url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-300.eot'); /* IE9 Compat Modes */
  src: local('Source Sans Pro'), local('SourceSans Pro-Normal'),
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-300.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-300.woff2') format('woff2'), /* Super Modern Browsers */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-300.woff') format('woff'), /* Modern Browsers */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-300.ttf') format('truetype'), /* Safari, Android, iOS */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-300.svg#SourceSans Pro') format('svg'); /* Legacy iOS */
}
  
/* source-sans-pro-regular */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: regular;
  src: url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-regular.eot'); /* IE9 Compat Modes */
  src: local('Source Sans Pro'), local('SourceSans Pro-Normal'),
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-regular.woff') format('woff'), /* Modern Browsers */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-regular.svg#SourceSans Pro') format('svg'); /* Legacy iOS */
}
  
/* source-sans-pro-600 */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  src: url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-600.eot'); /* IE9 Compat Modes */
  src: local('Source Sans Pro'), local('SourceSans Pro-Normal'),
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-600.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-600.woff2') format('woff2'), /* Super Modern Browsers */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-600.woff') format('woff'), /* Modern Browsers */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-600.ttf') format('truetype'), /* Safari, Android, iOS */
       url('//lib.baomitu.com/fonts/source-sans-pro/source-sans-pro-600.svg#SourceSans Pro') format('svg'); /* Legacy iOS */
}
```

将其拷贝到新建的css文件`fonts.css`中，然后在站点引入该css文件：
```html
<link rel="stylesheet" href="/fonts.css" >
```

### 方法二

跟方法一是一回事，只不过不是去360提供的Google 字体库获取代码，而是直接去谷歌字体的链接把代码下载下来，拷贝到一个css文件里。

甚至还可以将css文件里的字体文件`woff`或者`ttf`等下载下来，然后把css代码里的字体文件链接全改为本地的字体文件，之后依然是在站点中引入css文件即可。想看更具体的做法可以参考[这篇文章](https://blog.csdn.net/anqi114179/article/details/79581431)，当然了，对于懒人来说，直接不用谷歌字体就完事了，<s>比如说我</s>。

## 参考链接

* [fonts.googleapis.com访问速度巨慢,导致很多网站加载时间非常长,有什么解决的办法么?](https://www.v2ex.com/t/99445)
* [解决页面中引用了谷歌字体库访问缓慢的问题](https://blog.csdn.net/anqi114179/article/details/79581431)