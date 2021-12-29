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

## 参考链接

* [Lists of Content in Hugo](https://gohugo.io/templates/lists/)