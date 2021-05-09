# GitHub使用技巧

## GitHub仓库怎么添加协议

如果一开始在GitHub上创建仓库时没有添加协议，可以用以下方式来重新添加相关的协议：

1. 打开GitHub上的某个仓库，点击`Create new file`；
2. 在新建文件的页面上，输入文件名`LICENSE`，这时候你会发现在标题的右边多出来一个按钮`Choose a license template`，点击该按钮；<!--more-->
3. 在新页面上选择一个你想要的协议，接着在最右边输入`Year`和`Full name`，你会发现中间板块的年份和名称会发生变化，这是协议的预览界面，确认无误后点击最右边的`Review and submit`；
4. 最后填写commit信息，点击`Commit changes`即可。

## 使用GitHub上的开源项目来引入各种图表和图标

GitHub上有一些有意思的开源项目，通过借助GitHub的api来获取数据并生成对应的图表或者小图标，这里推荐几个有意思的项目。

### githubchart-api

这个是项目地址：https://github.com/2016rshah/githubchart-api

该项目可以生成一个最近一年内的GitHub贡献图表，也就是GitHub首页上那个贡献日历表。用法很简单：
```
<img src="https://ghchart.rshah.org/lewky" />
```

`https://ghchart.rshah.org`是该项目的api地址，在后面加上GitHub的userId就能得到这个user当前一年的贡献图表。

此外该api还支持修改配色，在userId前加上十六进制颜色代码即可，如下：
```
<img src="https://ghchart.rshah.org/FFA500/lewky" />
```
效果如下：

![githubchart.jpg](/images/posts/github/githubchart.jpg)

### shields

* 这个是项目地址：https://github.com/badges/shields
* 这个是项目官网的使用说明：https://shields.io/

该项目可以生成各种小图标，不仅仅是GitHub相关的图标，还有其他平台的图标。官网里有很详细的分类，还有很友好的一键生成，包括Html、Markdown等格式。用法其实都是类似的，只需要修改url里的用户名或者仓库名字就行：
```
/* GitHub的follow人数 */
<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky?style=social">

/* 项目的star人数 */
<img src="https://img.shields.io/github/stars/lewky/lewky.github.io">
```

这些图标可以通过`?style=`参数来修改风格，`flat`是默认风格，不指定style参数会使用默认风格，一共支持如下几种风格：
* plastic
* flat
* flat-square
* for-the-badge
* social

此外，还支持通过`color`、`label`、`logo`、`logoColor`这4个参数来更详细的定制，如下：
```
<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky?style=plastic">

<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky">

<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky?style=flat-square">

<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky?style=for-the-badge">

<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky?style=social">

<img alt="GitHub followers" src="https://img.shields.io/github/followers/lewky?color=FFA500&label=Test&logo=skype&logoColor=FFA500&style=social">
```

具体效果如下：

![imgShields.jpg](/images/posts/github/imgShields.jpg)

### github-readme-stats

这个是项目地址：https://github.com/anuraghazra/github-readme-stats

这个项目支持展示4种类型的数据图表和多种风格的主题，有兴趣的可以去项目原地址看，里面提供了非常详细的Demo。关于图表卡片里的排行分数的官方说明如下：
>Available ranks are S+ (top 1%), S (top 25%), A++ (top 45%), A+ (top 60%), and B+ (everyone).
The values are calculated by using the [cumulative distribution function](https://en.wikipedia.org/wiki/Cumulative_distribution_function) using commits, contributions, issues, stars, pull requests, followers, and owned repositories.

#### Stats Card

这个卡片用来展示GitHub用户的统计信息，官方称为`Stats Card`：
```markdown
![Lewky's github stats](https://github-readme-stats.vercel.app/api?username=lewky&show_icons=true)
```
效果如下：

![Stats-Card](/images/posts/github/Stats-Card.jpg)

可以通过`hide=`参数来选择隐藏统计项目，可选项有：`stars,commits,prs,issues,contribs`，如下：

```markdown
![Lewky's github stats](https://github-readme-stats.vercel.app/api?username=lewky&hide=contribs,prs)
```

在统计提交总数时，可以通过`count_private=true`参数来将私有仓库也纳入统计范围：
```markdown
![Lewky's github stats](https://github-readme-stats.vercel.app/api?username=lewky&count_private=true)
```

`show_icons=true`参数用来控制是否显示图标，`theme`参数控制图标的风格主题，目前支持的内建主题有：`dark, radical, merko, gruvbox, tokyonight, onedark, cobalt, synthwave, highcontrast, dracula`。用法如下：
```markdown
![Lewky's github stats](https://github-readme-stats.vercel.app/api?username=lewky&show_icons=true&theme=radical)
```

#### Repo Card

GitHub首页只支持展示最多6个项目仓库卡片，但是通过该项目提供的`Repo Card`，可以轻松突破这个展示上限。用法如下：
```markdown
[![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=lewky&repo=lewky.github.io)](https://github.com/lewky/lewky.github.io)
```
效果如下：

![Repo-Card](/images/posts/github/Repo-Card.jpg)

可以通过`show_owner`参数来决定是否在仓库名字前加上用户名。

#### Top Languages Card

这个卡片可以展示使用最多的语言，用法如下：
```markdown
[![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=lewky)](https://github.com/lewky)
```
效果如下：

![Top-Languages-Card](/images/posts/github/Top-Languages-Card.jpg)

* `exclude_repo=repo1,repo2`参数可以排除指定的仓库
* `hide=language1,language2`参数可以隐藏指定的语言
* `langs_count=`参数指定统计多少门语言
* `layout=compact`参数可以改变卡片布局为紧密布局

#### Wakatime Week Stats

这个卡片用来展示每周花在不同语言上的时间记录，用法如下：
```markdown
[![willianrod's wakatime stats](https://github-readme-stats.vercel.app/api/wakatime?username=lewky)](https://github.com/lewky)
```

这个卡片和GitHub没啥关系，需要另外去注册[wakatime](https://wakatime.com/)的账号，注册后会发给用户一个key，具体用法请自行百度。

#### 定制化

对于`Stats Card`和`Repo Card`，还可以在URL里使用以下参数来自定义图表样式。

- `title_color` - Card's title color _(hex color)_
- `text_color` - Body text color _(hex color)_
- `icon_color` - Icons color if available _(hex color)_
- `bg_color` - Card's background color _(hex color)_ **or** a gradient in the form of _angle,start,end_
- `hide_border` - Hides the card's border _(boolean)_
- `theme` - name of the theme, choose from [all available themes](https://github.com/anuraghazra/github-readme-stats/blob/master/themes/README.md)
- `cache_seconds` - set the cache header manually _(min: 1800, max: 86400)_
- `locale` - set the language in the card _(e.g. cn, de, es, etc.)_

对于`bg_color`参数，甚至还支持颜色渐变：
```html
&bg_color=DEG,COLOR1,COLOR2,COLOR3...COLOR10
```

### github-profile-trophy

这个是项目地址：https://github.com/ryo-ma/github-profile-trophy

这个项目可以展示GitHub用户统计信息，并表现为一系列奖杯。用法如下：
```markdown
[![trophy](https://github-profile-trophy.vercel.app/?username=lewky)](https://github.com/lewky)
```
效果如下：

![github-profile-trophy](/images/posts/github/github-profile-trophy.jpg)

* `theme=`参数可以改变主题风格：`flat、onedark、gruvbox、dracula、monokai、chalk、nord、alduin、darkhub`
* `title=`参数可以只显示对应名称的奖杯，比如`Stars Followers Commit Repositories Issues PullRequest`等，可以用英文逗号来多重指定值，如`title=Stars,Followers`
* `rank=`参数可以只显示对应排名的奖杯，比如`SECRET SSS SS S AAA AA A B C`等，可以用英文逗号来多重指定值，如`rank=S,AAA`
* `column=`参数可以指定一行展示多少个奖杯，默认值是6（即一行全部展示所有奖杯)
* `row=`参数可以指定最多可以用多少行展示奖杯，默认值是3（超出最大行数的奖杯会被隐藏)
* `margin-w=`参数可以改变外间距的宽度，默认值是0
* `margin-h=`参数可以改变外间距的高度，默认值是0

有兴趣的可以去项目原地址看看更具体的说明。

## 使用CDN加速GitHub的站点文件

jsdelivr为GitHub上的仓库文件做了CDN缓存，这是[官方文档地址](https://www.jsdelivr.com/?docs=gh)。可以通过下面的cdn地址格式来获取GitHub上的仓库文件：
```
// load any GitHub release, commit, or branch
https://cdn.jsdelivr.net/gh/user/repo@version/file
https://cdn.jsdelivr.net/gh/user/repo@branch/file

// add / at the end to get a directory listing
https://cdn.jsdelivr.net/gh/jquery/jquery/
```

cdn缓存的更新需要等一段时间，但是可以通过下面的url来清除缓存，达到更新cdn的目的。将cdn地址中的
```
https://cdn.jsdelivr.net/
```
替换成如下的
```
https://purge.jsdelivr.net/
```

## 添加GitHub Profile首页展示

在GitHub上创建一个和自己id同名的项目，新建一个`README.md`文档，该文档将作为你的GitHub首页来展示。可以利用上文提及的各种图表、图标等开源项目来渲染GitHub首页。

这里给个参考的例子：https://github.com/lewky/lewky

## 参考链接

* [如何为github已有仓库添加协议。](https://www.cnblogs.com/gwca/p/8341198.html)
* [怎么在博客网站等地方引用 Github 贡献图表](https://cloud.tencent.com/developer/article/1430371)
* [刷新 Jsdelivr 缓存](https://www.cnblogs.com/borber/p/purge_Jsdelivr.html)