# Hugo系列(3.3) - LoveIt主题美化与博客功能增强 · 第四章

## 前言

本博客使用的是Hugo的LoveIt主题，本文也是基于该主题而写的，不过Hugo的美化步骤应该大同小异，版本如下：
```
hugo: v0.74.2/extended windows/amd64 BuildDate: unknown

LoveIt: v0.2.10
```

**请注意，本文的所有功能都离不开两个新增加的文件：`_custom.scss`和`custom.js`，部分功能还需要`jquery`，在第一章中会提及如何引入。**

另外本文篇幅太长，阅读体验不好，将其进行分章如下：

* [Hugo系列(3.0) - LoveIt主题美化与博客功能增强 · 第一章](/posts/hugo-3.html/)
* [Hugo系列(3.1) - LoveIt主题美化与博客功能增强 · 第二章](/posts/hugo-3.1.html/)
* [Hugo系列(3.2) - LoveIt主题美化与博客功能增强 · 第三章](/posts/hugo-3.2.html/)
* [Hugo系列(3.3) - LoveIt主题美化与博客功能增强 · 第四章](/posts/hugo-3-3/)

<!--more-->

## 显示最近更新的十篇文章

在归档页面只能看到所有以创建时间递减排序的文章列表，可以用下面的方法在归档页面开头增添十篇最近更新的文章。

首先在配置文件`config.toml`中添加新的变量：

```
  [params.section]
    # 显示最近更新文章的数量
    lastUpdatedSize = 15
```

接着将`/themes/LoveIt/layouts/_default/section.html`拷贝到`/layouts/_default/section.html`，打开拷贝后的文件，找到如下：

```
{{- /* Paginate */ -}}
```

在这行代码的上方位置插入下面的代码：

```
{{- /* Last Modified */ -}}
{{- $lastUpdatedSize := .Site.Params.section.lastUpdatedSize -}}
{{- if $lastUpdatedSize -}}
	{{- if .Pages -}}
		{{- $pages := .Pages.ByLastmod.Reverse -}}
		<h3 class="group-title">最近更新 <sup>{{- $lastUpdatedSize -}}</sup></h3>
		{{- range first $lastUpdatedSize $pages -}}
			<article class="archive-item">
				<a href="{{ .RelPermalink }}" class="archive-item-link">
					{{- .Title -}}
				</a>
				<span class="archive-item-date2">
					{{- "2006-01-02" | .Lastmod.Format -}}
				</span>
			</article>
		{{- end -}}
	{{- end -}}
{{- end -}}
```

然后在`/assets/css/_custom.scss`中添加如下样式代码：

```css
.archive-item-date2 {
    color: #a9a9b3;
}
```

同时为了方便区分开创建时间和最近更新时间，在每篇文章中也新增了最近更新时间这个meta。将`/themes/LoveIt/layouts/posts/single.html`拷贝到`/layouts/posts/single.html`，打开拷贝后的文件，找到如下：

```
{{- with .Site.Params.dateformat | default "2006-01-02" | .PublishDate.Format -}}
    <i class="far fa-calendar-alt fa-fw"></i>&nbsp;<time datetime="{{ . }}">{{ . }}</time>&nbsp;
{{- end -}}
```

将上面的代码改为如下：

```
{{- with .Site.Params.dateformat | default "2006-01-02" | .PublishDate.Format -}}
    <i class="far fa-calendar fa-fw"></i>&nbsp;<time datetime="{{ . }}">{{ . }}</time>&nbsp;
{{- end -}}
{{- with .Site.Params.dateformat | default "2006-01-02" | .Lastmod.Format -}}
    <i class="far fa-calendar-plus fa-fw"></i>&nbsp;<time datetime="{{ . }}">{{ . }}</time>&nbsp;
{{- end -}}
```

## 添加抓住猫咪小游戏

在站点的`content`目录下新建一个文件夹，文件夹名字将被作为一个页面URL，然后在该文件夹下新建一个`index.md`文件，内容如下：

```
---
title: '逮住那只猫!'
---
## 游戏规则

1. 点击小圆点，围住小猫。
2. 你点击一次，小猫走一次。
3. 直到你把小猫围住（赢），或者小猫走到边界并逃跑（输）。

---

<div align="center">
  <div id="catch-the-cat"></div>
</div>

<script src="//cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/js/catch-the-cat/phaser.min.js"></script>
<script src="//cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/js/catch-the-cat/catch-the-cat.js"></script>
<script defer="defer" src="//cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/js/catch-the-cat/game.js"></script>
```

如果文件夹命名为`catch-the-cat`，则可以通过`<你的站点地址>/catch-the-cat/`来访问到这个抓住猫咪的游戏页面。

上述index.md中引入的JavaScript文件，可以下载下来放到你的站点或者其他地方，然后在index.md中改成对应的地址。

## 添加鼠标点击文字特效

在custom.js中添加如下代码：

```
/* 鼠标点击文字特效 */
var a_idx = 0;
var a_click = 1;
var a = new Array("富强", "民主", "文明", "和谐", "自由", "平等", "公正" ,"法治", "爱国", "敬业", "诚信", "友善",
			"老哥稳", "带我飞", "厉害了word哥", "扎心了老铁", "蓝瘦香菇", "还有这种操作?", "就是有这种操作",
			"皮皮虾我们走", "笑到猪叫", "石乐志", "不存在的", "黑车!", "我要下车!", "他还只是个孩子", "请不要放过他",
			"惊不惊喜?", "意不意外?", "我有一个大胆的想法", "你的良心不会痛吗", "你心里就没点b数吗", "没有,我很膨胀",
			"秀", "天秀", "陈独秀", "蒂花之秀", "造化钟神秀", "我去买几个橘子", "你就站在此地", "不要走动",
			"我可能读了假书", "贫穷限制了我的想象力", "打call", "当然是选择原谅她啊", "你有freestyle吗",
			"北大还行撒贝宁", "不知妻美刘强东", "悔创阿里杰克马", "一无所有王健林", "普通家庭马化腾",
			"别点了", "求求你别点了", "你还点", "你再点!", "有本事继续点!", "你厉害", "我投翔",
			"w(·Д·)w", "(#`O′)", "（/TДT)/", "┭┮﹏┭┮", "_(:3」∠)_");
jQuery(document).ready(function($) {
    $("body").click(function(e) {
		/* 点击频率，点击几次就换文字 */
		var frequency = 2;
		if (a_click % frequency === 0) {
			
			var $i = $("<span/>").text(a[a_idx]);
			a_idx = (a_idx + 1) % a.length;
			var x = e.pageX,
			y = e.pageY;
			$i.css({
				"z-index": 9999,
				"top": y - 20,
				"left": x,
				"position": "absolute",
				"font-weight": "bold",
				"color": randomColor(),
				"-webkit-user-select": "none",
				"-moz-user-select": "none",
				"-ms-user-select": "none",
				"user-select": "none"
			});
			$("body").append($i);
			$i.animate({
				"top": y - 180,
				"opacity": 0
			},
			1500,
			function() {
				$i.remove();
			});
			
		}
	a_click ++;
		
    });
});
```

## 首页显示文章最近更新时间

将`/themes/LoveIt/layouts/_default/summary.html`拷贝到`/layouts/_default/summary.html`，打开拷贝后的文件，找到如下内容：

```
        {{- with .Site.Params.dateFormat | default "2006-01-02" | .PublishDate.Format -}}
            &nbsp;<span class="post-publish">
                {{- printf `<time datetime="%v">%v</time>` . . | dict "Date" | T "publishedOnDate" | safeHTML -}}
            </span>
        {{- end -}}
```

修改成如下：

```
        {{- with .Site.Params.dateFormat | default "2006-01-02" | .PublishDate.Format -}}
            &nbsp;<span class="post-publish">
                {{- printf `<time datetime="%v">%v</time>` . . | dict "Date" | T "publishedOnDate" | safeHTML -}}, 
            </span>
        {{- end -}}

        {{- with .Site.Params.dateFormat | default "2006-01-02" | .Lastmod.Format -}}
            &nbsp;<span class="post-publish">
                {{- printf `<time datetime="%v">%v</time>` . . | dict "Date" | T "updatedOnDate" | safeHTML -}}, 
            </span>
        {{- end -}}
```

## 参考链接

* [Lists of Content in Hugo](https://gohugo.io/templates/lists/)