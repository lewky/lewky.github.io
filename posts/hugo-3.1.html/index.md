# Hugo系列(3.1) - LoveIt主题美化与博客功能增强 · 第二章

## 前言

本博客使用的是Hugo的LoveIt主题，本文也是基于该主题而写的，不过Hugo的美化步骤应该大同小异，版本如下：
```
hexo: 3.8.0

hugo: v0.74.2/extended windows/amd64 BuildDate: unknown

LoveIt: v0.2.10
```

**请注意，本文的所有功能都离不开两个新增加的文件：`_custom.scss`和`custom.js`，部分功能还需要`jquery`，下文会提及如何引入。**

另外本文篇幅太长，阅读体验不好，将其进行分章如下：

* [Hugo系列(3.0) - LoveIt主题美化与博客功能增强 · 第一章](/posts/hugo-3.html/)
* [Hugo系列(3.1) - LoveIt主题美化与博客功能增强 · 第二章](/posts/hugo-3.1.html/)
* [Hugo系列(3.2) - LoveIt主题美化与博客功能增强 · 第三章](/posts/hugo-3.2.html/)

<!--more-->

## Valine评论系统添加邮件通知和QQ提醒

LoveIt主题自带的Valine没有邮件通知和QQ提醒功能，所以需要额外使用Valine的增强版`Valine-Admin`来进行功能增强。网上有好几个版本，我这里选择了目前由@W4J1e维护的`Hexo-Valine-ASPush`项目，由于我需要自定义部分改动，所以自己fork了一份：[valine-admin-custom](https://github.com/lewky/valine-admin-custom)。如果需要进行自定义改动的，可以继续fork我的这个项目。

下面开始教程。这里默认你已经使用了Valine作为评论系统，如果还没有对应的LeanCloud应用请自行移步Valine的官方文档： [Valine快速开始](https://valine.js.org/quickstart.html)。

### 部署LeanCloud云引擎

登陆你的LeanCloud账号，进入你的应用，选择：`云引擎 -> 部署 -> Git部署`，然后输入下面的仓库地址：
```
https://github.com/lewky/valine-admin-custom.git
```

然后点击部署按钮，等待云引擎将上面的仓库代码克隆下来。接下来需要设置环境变量。

### 设置环境变量

点击`云引擎 -> 设置`，选择添加新变量，将下列变量一一加入。

变量 | 示例 | 说明
--- | ------ | ---------
SITE_NAME | xxx | [必填] 网站名称
SITE_URL  | https://xxx.com | [必填] 网站首页地址，地址末尾不要加/
SMTP_USER | xxxxxx@qq.com | [必填] SMTP登录用户，一般为邮箱地址
SMTP_PASS | ccxxxxxxxxch | [必填] SMTP授权码，不是邮箱的登陆密码，请自行查询对应邮件服务商授权码的获取方式
SMTP_SERVICE | QQ | [必填] 邮件服务提供商，支持 QQ、163、126、Gmail 以及 [更多](https://nodemailer.com/smtp/well-known/#supported-services)  
SENDER_NAME | xxx | [必填] 发件人 
SENDER_EMAIL | xxxxxx@qq.com | [必填] 发件邮箱
ADMIN_URL | https://xxx.leanapp.cn/ | [建议] Web主机二级域名（云引擎域名），用于自动唤醒 
BLOGGER_EMAIL | xxxxx@gmail.com | [可选] 博主通知收件地址，默认使用SENDER_EMAIL
AKISMET_KEY | xxxxxxxx | [可选] Akismet Key 用于垃圾评论检测，设为MANUAL_REVIEW开启人工审核，留空不使用反垃圾
TEMPLATE_NAME | default | [可选] 设置提醒邮件主题，目前内置了多款主题：default、rainbow、custom1、custom2
COMMENT | #post-comment | [可选] 评论 div 的 ID 名，直接跳转到评论位置

设置好变量后，需要重启实例。在部署页面点击重启按钮即可，每次更改变量后都需要重启才能生效。如果对应的Git仓库代码发生变更，需要清除部署，重新克隆代码才能生效。

### 后台评论管理

首先需要设置管理员信息。在部署云引擎成功后，访问管理员注册页面https://云引擎域名/sign-up，注册管理员登录信息，如：https://cloud.lewky.cn/sign-up

注册成功后可以在`存储 -> 结构化数据 -> _User`里看到多出来一条数据，正是刚刚我们注册成功的用户。

>注：使用原版Valine如果遇到注册页面不显示直接跳转至登录页的情况，请手动删除_User表中的全部数据。

注册成功后，就可以通过这个注册的用户访问后台评论管理页面：https://云引擎域名

### 配置QQ提醒

1. 前往[Qmsg酱官网](https://qmsg.zendee.cn/)，点击管理台登陆账号，选择其中任意一个你想使用的Qmsg酱(QQ机器人)，并加其为QQ好友
2. 点击菜单栏里`Qmsg酱`旁边的`QQ号码`，添加你想要接收信息推送的QQ号码
3. 点击
4. 菜单栏里的`KEY`，这里有一串字符串等下要添加到LeanCloud的环境变量里

官网里提供了所有的接口文档，你可以先行通过一个简单的测试来验证你的QQ能不能接收到推送，如下：
1. 在浏览器新打开一个页面，在地址栏里输入`https://qmsg.zendee.cn/send/`，然后把你管理台里的`KEY`添加到地址栏末尾，然后在末尾继续加上`?msg=test`，接着按下回车键，这里表示让Qmsg酱发送`test`给你的QQ号码
2. 如果发送成功，你会发现浏览器页面内容变成：
```
{"success":true,"reason":"操作成功","code":0,"info":{}}
```
3. 与此同时，你的QQ号码会收到你加的那个`Qmsg酱`QQ好友的消息。这表明推送正常，可以往下走了。

前面我们已经在LeanCloud云引擎里配置了一部分必须的环境变量，为了使用QQ提醒功能，还想要额外配置两个变量：

变量 | 示例 | 说明
--- | ------ | ---------
QMSG_KEY | xxxxxxx | [必填] Qmsg酱的KEY
QQ  | xxxxxxx | [必填] Qmsg酱发送的 qq，支持多个，用英文逗号分隔即可

### 解决云引擎休眠

LeanCloud云引擎有自动休眠机制，这是官方的说法：[点击查看](https://leancloud.cn/docs/leanengine_plan.html#hash633315134)

目前实现了两种云函数定时任务来解决云引擎休眠的问题：

- 自动唤醒，定时访问Web APP二级域名防止云引擎休眠；
- 每天定时检查过去24小时内漏发的邮件通知。

进入`云引擎 -> 定时任务`，创建两个定时任务：
1. 选择self-wake云函数，Cron表达式为`0 */25 7-23 * * ?`，表示每天早7点到晚12点每隔25分钟访问云引擎。
2. 选择resend-mails云函数，Cron表达式为`0 10 7 * * ?`，表示每天7点10分检查过去24小时内漏发的通知邮件并补发。

云引擎还有个国际版的，要注意表达式的时区问题，不过表达式填写后会显示每天几点操作，应该不会有人填错吧。

## 解决免费版云引擎流控问题

免费版云引擎会在达到最大启动时长限制（好像是持续运行18个小时），进入强制休眠状态。在休眠状态时无法通过我们定义的自动唤醒函数来自动重启，可以在日志里看到报错如下：
```
{"error":"因流控原因，通过定时任务唤醒体验版实例失败，建议升级至标准版云引擎实例避免休眠 https://url.leanapp.cn/dwAEksv"}
```
但是如果在休眠期间，云引擎又受到外界的一次访问，就可以再次激活进入启动状态，这时候就可以通过自动唤醒函数来每隔半小时自我唤醒一次了。也就是说，当云引擎进入强制休眠状态后，我们通过外部的定时任务，来每天定时访问云引擎绑定好的域名（**也就是你的后台评论管理页面地址**），就可以继续白嫖了。

那么去那里弄免费的外部定时任务呢？实现方案有不少，比如：

### 方案一：`GitHub + Actions`

借助`GitHub + Actions`，自动部署也是用这种方案，不过这种方案有个缺点，就是每次执行action都会生成一次对应的commit，对我来说不是理想方案，这里就不介绍了。有兴趣的可以参考[这篇文章](https://www.antmoe.com/posts/ff6aef7b#开始尝试)

### 方案二：借助国内其他的免费云函数或定时任务

利用国内的云函数，自己写一个脚本。然后定时监控即可。或者宝塔、自己服务器的定时任务都是可以的。说穿了，就是用其他的类似于LeanCloud云引擎类似的免费容器的云函数或者定时任务来唤醒LeanCloud的云引擎，那如果其他的免费容器也有类似的强制休眠机制怎么办呢？

很简单，互相套娃即可。让一个免费的容器A通过定时任务在非休眠期间去唤醒另一个强制休眠中的容器B，如果容器A强制休眠了就让另一个非休眠的容器B去唤醒。只要两个免费容器的强制休眠时间错开即可完成这一白嫖循环`O(∩_∩)O~`

### 方案三：`cloudflare`的`Workers`

`cloudflare`的`Workers`可以在线定义脚本，通过链接即可触发脚本，具体做法请参考[这篇文章](https://www.antmoe.com/posts/ff6aef7b#方案三)

### 方案四：借助`cron-job`平台进行每日定时唤醒

通过`cron-job`平台进行监控，这是[注册地址](https://cron-job.org/en/signup/)

本人使用的方案四，该方案其实和方案二是一回事。这里简单介绍下怎么用，注册该平台可能需要`tī zi`，请自行解决。

* 注册时，`Time zone`（也就是时区）请选择`Asia/Shanghai`，否则后续在定义cron表达式时需要自己换算时区时间。如果注册页面最下面的谷歌人机验证出不来，你懂的，请自行解决。
* 注册后需要登录邮箱通过邮件激活账号，没收到邮件的请检查你的垃圾箱，邮件可能在垃圾箱里。
* 激活账号后登录你的账号，访问这个地址：https://cron-job.org/en/members/jobs/
* 点击页面上的`Create cronjob`按钮，创建你的定时任务，各个必填配置项如下表：

变量 | 示例 | 说明
--- | ------ | ---------
Title | xxx | 定时任务名称
Address  | https://xxx.com | 访问的地址，请填写LeanCloud云引擎绑定的域名地址，也就是那个后台评论管理页面地址`https://云引擎域名`
Schedule | 按需选择 | 定时任务的执行时间和频率，这里建议使用第二种：`Every day at 6 : 50 `。具体每天几点执行请自行决定。
Notifications | 按需选择 | 执行失败时的通知提醒
Save responses | 按需选择 | 保存执行定时任务的日志

## 使用Waline替代Valine评论系统

鉴于Valine的安全问题，以及LeanCloud云引擎的限流问题，改用Waline + Vercel来作为评论系统，Waline是基于Valine进行开发的，所以迁移成本较低。这是Waline的[官方文档](https://waline.js.org/)，有很详细的配置、迁移等教程。

由于LoveIt主题没有引入Waline，所以这里记录下如何引入Waline，以及遇到的相关问题的解决方法。

### 站点配置文件添加相关变量

打开站点配置文件，找到Valine相关变量`[params.page.comment.valine]`，在该节点下面添加Waline相关的变量	`[params.page.comment.waline]`：
```
      # Waline comment config (https://waline.js.org/)
      # Waline 评论系统设置 (https://waline.js.org/)
      [params.page.comment.waline]
        enable = true
        #js = "https://cdn.jsdelivr.net/npm/@waline/client@latest"
        js = "https://cdn.jsdelivr.net/npm/@waline/client/dist/Waline.min.js"
        meta = ['nick','mail','link']                           # 评论者相关属性
        requiredFields = ['nick','mail']                        # 设置必填项，默认匿名
        placeholder = "提交评论较慢，请等待几秒~"              	# 评论框占位提示符
        serverURL = ""                 							# Waline的服务端地址（必填） 
        #imageHosting =                                         # 图床api，如果允许评论框上传图片
        avatar = "retro"                                        # Gravatar头像
        avatarCDN = "https://sdn.geekzu.org/avatar/"            # Gravatar头像CDN地址，不建议使用loli源
        pageSize = 10                                           # 评论列表分页，每页条数
        lang = "zh-CN"                                          # 多语言支持
        visitor = true                                          # 文章访问量统计
        highlight = true                                        # 代码高亮
```

记得把原本的评论系统的`enable`设置为false，改用新加的Waline。

### 修改comment.html模板文件

将`\themes\LoveIt\layouts\partials\comment.html`拷贝到`\layouts\partials\comment.html`，打开拷贝后的文件，找到Valine相关的代码部分，然后在其下方添加Waline的代码，如下：
```
        {{- /* Waline Comment System */ -}}
        {{- $waline := $comment.waline | default dict -}}
        {{- if $waline.enable -}}
            <div id="waline"></div>
			<script src='{{ $waline.js }}'></script>

			<script>
		    	new Waline({
		    	  el: '#waline',
				  meta: {{ $waline.meta }},
				  placeholder: {{ $waline.placeholder }},
		    	  serverURL: {{ $waline.serverURL }},
		    	  avatarCDN: {{ $waline.avatarCDN }},
		    	  requiredFields: {{ $waline.requiredFields }},
		    	  pageSize: {{ $waline.pageSize }},
		    	  avatar: {{ $waline.avatar }},
		    	  lang: {{ $waline.lang }},
				  visitor: {{ $waline.visitor }},
				  highlight: {{ $waline.highlight }}
		    	});
		    </script>
        {{- end -}}
```

Waline内置微博表情，如果想自定义表情包的，可以继续添加两个属性`emojiCDN`和`emojiMaps`到上面的代码里，具体做法可以参考[官方文档 - 自定义表情](https://waline.js.org/client/emoji.html)。

这里顺便介绍下@小康大佬整理的一个很方便的表情包站点：[表情速查](https://emotion.xiaokang.me/)，里面有很多类别的表情包，还有对应的快速引入语法链接，以及用于配置Valine、Waline等评论系统表情包映射的JSON！

### 添加评论统计到文章元数据

将`/themes/LoveIt/layouts/posts/single.html`拷贝到`/layouts/posts/single.html`，打开拷贝后的文件，找到如下：
```
            <div class="post-meta-line">
                {{- with .Site.Params.dateformat | default "2006-01-02" | .PublishDate.Format -}}
                    <i class="far fa-calendar-alt fa-fw"></i>&nbsp;<time datetime="{{ . }}">{{ . }}</time>&nbsp;
                {{- end -}}
                <i class="fas fa-pencil-alt fa-fw"></i>&nbsp;{{ T "wordCount" .WordCount }}&nbsp;
                <i class="far fa-clock fa-fw"></i>&nbsp;{{ T "readingTime" .ReadingTime }}&nbsp;
                {{- $comment := .Scratch.Get "comment" | default dict -}}
                {{- if $comment.enable | and $comment.valine.enable | and $comment.valine.visitor -}}
                    <span id="{{ .RelPermalink }}" class="leancloud_visitors" data-flag-title="{{ .Title }}">
                        <i class="far fa-eye fa-fw"></i>&nbsp;<span class=leancloud-visitors-count></span>&nbsp;{{ T "views" }}
                    </span>&nbsp;
                {{- end -}}
            </div>
```

将上面的代码改为如下代码：
```
            <div class="post-meta-line">
                {{- with .Site.Params.dateformat | default "2006-01-02" | .PublishDate.Format -}}
                    <i class="far fa-calendar-alt fa-fw"></i>&nbsp;<time datetime="{{ . }}">{{ . }}</time>&nbsp;
                {{- end -}}
                <i class="fas fa-pencil-alt fa-fw"></i>&nbsp;{{ T "wordCount" .WordCount }}
                <i class="far fa-clock fa-fw"></i>&nbsp;{{ T "readingTime" .ReadingTime }}&nbsp;
                {{- $comment := .Scratch.Get "comment" | default dict -}}
                {{- if $comment.enable | and $comment.valine.enable | and $comment.valine.visitor -}}
                    <span id="{{ .RelPermalink }}" class="leancloud_visitors" data-flag-title="{{ .Title }}">
                        <i class="far fa-eye fa-fw"></i>&nbsp;<span class=leancloud-visitors-count></span>&nbsp;{{ T "views" }}
                    </span>&nbsp;
                {{- end -}}
                {{- if $comment.enable | and $comment.waline.enable | and $comment.waline.visitor -}}
                    <span id="{{ .RelPermalink }}" class="leancloud_visitors" data-flag-title="{{ .Title }}">
                        <i class="far fa-eye fa-fw"></i>&nbsp;<span class=leancloud-visitors-count></span>&nbsp;{{ T "views" }}
                    </span>&nbsp;
					<a href="#comments" id="post-meta-vcount" title="{{ T `viewComments` }}">
						<i class="fas fa-comment fa-fw"></i>&nbsp;<span id="{{ .RelPermalink }}" class="waline-comment-count"></span>&nbsp;条评论
					</a>
                {{- end -}}
            </div>
```

### 添加样式

在`_custom.scss`里添加如下样式：
```css
/* 文章元数据meta */
.post-meta .post-meta-line:nth-child(2) i:nth-child(1) {
    margin-left: 0;
}
.post-meta .post-meta-line:nth-child(2) i {
    margin-left: 0.3rem;
}
.post-meta .post-meta-line:nth-child(2) span i {
    margin-left: 0.3rem !important;
}
.post-meta a#post-meta-vcount {
    color: #a9a9b3;
    &:hover {
        color: #2d96bd;
    }
}
```

### 部署到Vercel

这个部分直接参考[官方文档 - Vercel 部署](https://waline.js.org/quick-start.html#vercel-%E9%83%A8%E7%BD%B2)。实际上就是在GitHub上帮你创建了一个仓库，仓库里只有简单的几个文件，用于Vercel的部署。Vercel那边会和刚刚创建的GitHub仓库关联，然后部署到Vercel自己的服务器。

这里有个坑，之前用Valine的时候只需要用到LeanCloud的两个变量`APP ID`和`APP KEY`。但是对于Waline，必须要再用到第三个变量`Master Key`。也就是说，**对于Waline + Vercel，必须配置三个变量`LEAN_ID`、`LEAN_KEY`和`LEAN_MASTER_KEY`才能算部署成功。**

否则你会发现就算Vercel显示部署成功，一旦访问部署页面却会发现页面一片空白，具体可参考GitHub上的一个issue：[Vercel初始化后打开网址页面内容为空 #82](https://github.com/lizheming/waline/issues/82)

Waline还带有简单的后台，可以实现对评论的管理。部署完成后访问`<serverURL>/ui/register`进行注册，第一个注册的你会被设定成管理员。登录成功后就可以看到评论管理的界面了，大家可以收藏该地址方便后续使用。`serverURL`就是Vercel部署成功后提供给你的那几个访问域名。

如果原本使用的是Valine + LeanCloud云引擎，在改用Waline + Vercel后记得把LeanCloud云引擎的部署清除掉。

### 使用评论通知功能

Waline支持邮件、微信、QQ通知，想要使用通知功能，需要在Vercel那边配置环境变量。具体可参考[官方文档 - 评论通知](https://waline.js.org/server/notification.html#%E8%AF%84%E8%AE%BA%E9%80%9A%E7%9F%A5)。这些环境变量名字和Valine的配置是一样的，貌似只有QQ通知相关的一个变量名字不一样而已。

Vercel配置环境变量步骤：
1. 打开你在Vercel上创建的项目
2. 点击`Settings` -> `Environment Variables` -> 选择添加`Plaintext`类型的环境变量 -> 输入环境变量的`name`和`value` -> 点击`Save`

所有被添加的环境变量可以在下方看到，可以删除或修改已定义的环境变量。

### Waline + Vercel的使用体验

* 由于使用了LeanCloud作为存储，外加使用了反垃圾评论服务Akismet，所以在提交评论时会比较慢，大概需要等待个两三秒。这个耗时见仁见智，一方面确实慢，一方面可以有效避免被人恶意评论攻击。
* 据说部署在CloudBase的速度还行。
* Waline的机制好像是QQ提醒了邮件就不提醒，所以对于新评论，如果设置了QQ提醒就不会再收到邮件通知。对于回复的评论则是可以同时收到。
* Waline提供了一个很棒的后台管理，还支持其他人的注册和登陆。

## 添加百度统计

默认的统计功能只有`Google Analytics`和`Fathom Analytics`两种，想要使用百度统计需要自行修改配置文件和模板文件。

### 添加百度统计相关变量

在站点配置文件里找到统计相关的配置，如下：
```toml
  # Analytics config
  # 网站分析配置
  [params.analytics]
    enable = flase
    # Google Analytics
    [params.analytics.google]
      id = ""
      # whether to anonymize IP
      # 是否匿名化用户 IP
      anonymizeIP = true
    # Fathom Analytics
    [params.analytics.fathom]
      id = ""
      # server url for your tracker if you're self hosting
      # 自行托管追踪器时的主机路径
      server = ""
```

在这里的`[params.analytics.fathom]`后面添加一个新的变量给百度统计使用：
```toml
    # Baidu Analytics
    # 百度统计
    [params.analytics.baidu]
      id = ""
```

### 将百度统计的脚本代码添加到analytics.html里

首先拷贝`\themes\LoveIt\layouts\partials\plugin\analytics.html`到`\layouts\partials\plugin\analytics.html`。

打开拷贝后的analytics.html文件，在`Fathom Analytics`的代码下面加上如下内容：
```html
	{{- /* Baidu Analytics */ -}}
    {{- with $analytics.baidu.id -}}
		<script>
			var _hmt = _hmt || [];
			(function() {
			  var hm = document.createElement("script");
			  hm.src = "https://hm.baidu.com/hm.js?{{ . }}";
			  var s = document.getElementsByTagName("script")[0]; 
			  s.parentNode.insertBefore(hm, s);
			})();
		</script>
	{{- end -}}
```

### 启用百度统计

将统计功能的`enable = flase`改为`enable = true`。在新增的百度统计变量的`id`那里填上你的百度统计id值，也就是百度统计的脚本代码里`https://hm.baidu.com/hm.js?`后面跟着的那串很长的东东。如果不知道怎么查看这个百度统计id，请自行百度。

## 添加鼠标右键菜单

### 添加右键菜单的变量

打开站点配置文件，添加如下变量，可以自行定制菜单里的按钮，包括数量、名称、图片和地址：
```
  # Right click menu
  # 右键菜单
  [params.rightmenu]
    enable = true  # true or false  是否开启右键
    audio = false  # true or false 是否开启点击音乐
    [[params.rightmenu.layout]]
      # 按钮名称
      name = "首页"
      # 背景图片
      image = "/images/rightmenu/rightmenu1.jpg"
      # 跳转地址
      url = "/"
    [[params.rightmenu.layout]]
      name = "音乐游戏"
      image = "/images/rightmenu/rightmenu2.jpg"
      url = "/funny/mikutap/"
    [[params.rightmenu.layout]]
      name = "前方高能"
      image = "/images/rightmenu/rightmenu3.jpg"
      url = "/funny/high/"
    [[params.rightmenu.layout]]
      name = "建站日志"
      image = "/images/rightmenu/rightmenu4.jpg"
      url = "/posts/e62c38c4.html"
    [[params.rightmenu.layout]]
      name = "随笔"
      image = "/images/rightmenu/rightmenu5.jpg"
      url = "/posts/d65a1577.html"
    [[params.rightmenu.layout]]
      name = "友链"
      image = "/images/rightmenu/rightmenu6.jpg"
      url = "/friends/"
```

如果你有图床的话，还可以额外增加一个图床变量，这样可以去图床加载你的图片，可以参考前文的[添加全局cdn变量](http://localhost:1313/posts/hugo-3.html/#%E6%B7%BB%E5%8A%A0%E5%85%A8%E5%B1%80cdn%E5%8F%98%E9%87%8F)。

### 添加`rightmenu.html`文件

新建一个`layouts/partials/plugin/rightmenu.html`文件，内容如下：
```
{{- $rightmenu := .Site.Params.rightmenu -}}
{{- $cdn := .Site.Params.cdnPrefix -}}
{{- if $rightmenu.enable -}}
   	<div class="GalMenu GalDropDown">
	      <div class="circle" id="gal">
	        <div class="ring">
			{{- range $item := $rightmenu.layout -}}
			{{- $defaultURL := "/" -}}
			{{- $defaultName := "Home" -}}
			{{- $defaultImage := "https://gravatar.loli.net/avatar/c02f8b813aa4b7f72e32de5a48dc17a7?d=retro&v=1.4.14" -}}
	          <a href="{{- $item.url | default $defaultURL -}}" 
			  target="_blank" 
			{{- $itemImage := $item.image | default $defaultImage -}}
			{{- if strings.HasPrefix $item.image "http" -}}
			  style="background-image:url({{- $itemImage -}});" 
			{{- else if strings.HasPrefix $item.image "/" -}}
			  style="background-image:url({{- $cdn -}}{{- $itemImage -}});" 
			{{- else -}}
			  style="background-image:url({{- $itemImage -}});" 
			{{- end -}}
			  class="menuItem">{{- $item.name | default $defaultName -}}</a>
			{{- end -}}
			</div>
			{{- if $rightmenu.audio -}}
				<audio id="audio" src="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/audio/niconiconi.mp3"></audio>
	        {{- end -}}
		  </div>
	</div>
	<script type="text/javascript">
	var items = document.querySelectorAll('.menuItem'); 
	for (var i = 0, l = items.length; i < l; i++) {
        items[i].style.left = (50 - 35 * Math.cos( - 0.5 * Math.PI - 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
        items[i].style.top = (50 + 35 * Math.sin( - 0.5 * Math.PI - 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%"
      }
	</script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/css/GalMenu.css">
	<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/js/GalMenu.js"></script>
	<script type="text/javascript">
    	$(document).ready(function() {
        $('body').GalMenu({
          'menu': 'GalDropDown'
        })
      });
	</script>
{{- end -}}
```

这个模板代码里使用到了我项目里的`niconiconi.mp3`、`GalMenu.css`、`GalMenu.js`这三个文件，有兴趣的可以自己把文件保存到自己网站里，mp3文件可以自己修改为其他的音频文件。

### 修改`assets.html`文件

将主题的`\themes\LoveIt\layouts\partials\assets.html`拷贝一份到`\layouts\partials\assets.html`，在`{{- partial "plugin/analytics.html" . -}}`下添加如下内容：
```
{{- /* 右键菜单 */ -}}
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jquery@2.1.3/dist/jquery.min.js"></script>
{{- partial "plugin/rightmenu.html" . -}}
```

搞定，这个功能就完成了。

## 添加文章加密功能

将`\themes\LoveIt\layouts\posts\single.html`拷贝到`\layouts\posts\single.html`，打开拷贝后的文件，在`{{- $params := .Scratch.Get "params" -}}`的下一行添加如下代码：
```
    {{- $password := $params.password | default "" -}}
    {{- if ne $password "" -}}
		<script>
			(function(){
				if({{ $password }}){
					if (prompt('请输入文章密码') != {{ $password }}){
						alert('密码错误！');
						if (history.length === 1) {
							window.opener = null;
							window.open('', '_self');
							window.close();
						} else {
							history.back();
						}
					}
				}
			})();
		</script>
    {{- end -}}
```

之后只要在文章的头部加上`password`属性即可进行加密，只有输入了正确密码才能打开文章，否则会回退到之前的页面。用法如下：
```
---
title: 随笔
password: test
---
```

## 添加GitHub Corner

将`\themes\LoveIt\layouts\partials\header.html`拷贝到`\layouts\partials\header.html`，打开拷贝后的文件，在`<div class="header-wrapper">`的下一行添加一个超链代码：
```html
<a href="https://github.com/lewky" class="github-corner" target="_blank" title="Follow me on GitHub" aria-label="Follow me on GitHub"><svg width="3.5rem" height="3.5rem" viewBox="0 0 250 250" style="fill:#70B7FD; color:#fff; position: absolute; top: 0; border: 0; left: 0; transform: scale(-1, 1);" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a>
```

将上边的超链的href改为自己的GitHub地址，如果想调整图片大小，可以修改代码里的`svg`标签的`width`和`height`属性。

然后是添加样式代码到`_custom.scss`里：
```css
/* Github Corner */
.github-corner:hover .octo-arm {
	animation: octocat-wave 560ms ease-in-out
}

@keyframes octocat-wave {
	0%,100% {
		transform: rotate(0)
	}

	20%,60% {
		transform: rotate(-25deg)
	}

	40%,80% {
		transform: rotate(10deg)
	}
}

@media (max-width:500px) {
	.github-corner:hover .octo-arm {
		animation: none
	}

	.github-corner .octo-arm {
		animation: octocat-wave 560ms ease-in-out
	}
}
```

下面是GitHub Corner的项目地址，一共有10种颜色样式，随便挑！

* [GitHub Corners项目地址](https://tholman.com/github-corners/)

## 页面下方添加拉姆雷姆快捷跳转

将`\themes\LoveIt\layouts\_default\baseof.html`拷贝到`\layouts\_default\baseof.html`，打开拷贝后的`baseof.html`，在`{{- /* Load JavaScript scripts and CSS */ -}}`的上面一行添加如下代码：
```
<div class="sidebar_wo">
  <div id="leimu">
	<img src="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/b2t/leimuA.png" alt="雷姆" 
	onmouseover="this.src='https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/b2t/leimuB.png'" 
	onmouseout="this.src='https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/b2t/leimuA.png'" title="回到顶部">
  </div>
  <div class="sidebar_wo" id="lamu">
	<img src="https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/b2t/lamuA.png" alt="雷姆" 
	onmouseover="this.src='https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/b2t/lamuB.png'" 
	onmouseout="this.src='https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/b2t/lamuA.png'" title="回到底部">
  </div>
</div>
```

在`_custom.scss`里添加对应的css代码：
```css
/* 拉姆蕾姆回到顶部或底部按钮 */
.sidebar_wo {
    position:fixed;
    line-height:0;
    bottom:0;
    z-index:1000
}
#leimu {
    left:0;
    -webkit-transition:all .3s ease-in-out;
    transition:all .3s ease-in-out;
    -webkit-transform:translate(-7px,7px);
    -ms-transform:translate(-7px,7px);
    transform:translate(-7px,7px)
}
#lamu {
    -webkit-transition:all .3s ease-in-out;transition:all .3s ease-in-out;
    -webkit-transform:translate(7px,7px);
    -ms-transform:translate(7px,7px);
    transform:translate(7px,7px);
    right:0
}
#leimu:hover {
    -webkit-transform:translate(0,0);
    -ms-transform:translate(0,0);
    transform:translate(0,0)
}
#lamu:hover {
    -webkit-transform:translate(0,0);
    -ms-transform:translate(0,0);
    transform:translate(0,0)
}
.sidebar_wo img {
    cursor:pointer;
}
@media only screen and (max-width:1024px) {
    .sidebar_wo{display:none}
}
```

最后在`custom.js`里添加如下代码，注意，要先引入`jquery`才有效果，具体细节请看前文：
```
/* 拉姆蕾姆回到顶部或底部按钮 */
$(function() {
	$("#lamu img").eq(0).click(function() {
		$("html,body").animate({scrollTop:$(document).height()},800);
		return false;
	});
	$("#leimu img").eq(0).click(function() {
		$("html,body").animate({scrollTop:0},800);
		return false;
	});
});
```

## 添加首页头像挂件

这个功能分为四个部分：
* 首页头像的动画特效从浮动改为旋转，为了适配挂件还稍微缩小了头像大小
* 添加头像挂件（都是b站的挂件）
* 点击头像一点次数后随机刷新头像
* 加载首页时随机刷新头像（该功能可禁用）

### 修改站点配置文件

在站点配置文件里找到你配置首页头像的变量`avatarURL`，在其下方添加两个新的变量，内容如下：
```
      [params.home.profile]
        enable = true
        # 主页显示头像的 URL
        avatarURL = "/images/avatar.jpg"
        # 是否启用头像挂件
        avatarPluginURL = "/images/avatar-plug/bilibili_27.png"
        # 是否启用头像挂件自动刷新
        avatarPluginFlush = true
        # 点击频率，点击几次就换挂件
        avatarPluginFrequency = 1
        # 头像挂件总数
        avatarPluginCount = 128
```

如果你有自己的图床，还可以配置一个给头像挂件使用的图床地址，如下：
```
# 参数
[params]
  # 图床变量，末尾不需要加/
  cdnPrefix = "https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master"
```

这个变量不设置也没关系，不会影响挂件的功能。

### 修改模板文件profile.html

将`\themes\LoveIt\layouts\partials\home\profile.html`拷贝到`\layouts\partials\home\profile.html`，打开拷贝后的文件，找到下面的代码：
```
<a href="{{ $url }}"{{ with .Title | default .Name }} title="{{ . }}"{{ end }}{{ if (urls.Parse $url).Host }} rel="noopener noreffer" target="_blank"{{ end }}>
    {{- dict "Src" $avatar | partial "plugin/image.html" -}}
</a>
```

这是渲染首页头像的代码，将这段代码改成如下内容：
```
{{- if $profile.avatarPluginURL -}}
	<img class="site-avatar-plug-bilibili" />
	<a href="javascript:void(0);"{{ with .Title | default .Name }} title="Please click me~~"{{ end }}{{ if (urls.Parse $url).Host }} rel="noopener noreffer" target="_blank"{{ end }}>
		{{- dict "Src" $avatar "Title" "Please click me~~" | partial "plugin/image.html" -}}
	</a>
{{- else -}}
	<a href="{{ $url }}"{{ with .Title | default .Name }} title="{{ . }}"{{ end }}{{ if (urls.Parse $url).Host }} rel="noopener noreffer" target="_blank"{{ end }}>
		{{- dict "Src" $avatar | partial "plugin/image.html" -}}
	</a>
{{- end -}}
```

### 修改模板文件assets.html

打开`\layouts\partials\assets.html`，在你引入的`jquery`的下面添加如下代码，不知道怎么引入`jquery`的请看前文：
```
<!-- 头像挂件 -->
<script>
{{- $profile := .Site.Params.home.profile -}}
{{- $avatarPlugin := $profile.avatarPluginURL -}}
{{- $avatarPluginFrequency := $profile.avatarPluginFrequency -}}
{{- $avatarPluginCount := $profile.avatarPluginCount -}}
{{- $cdnPrefix := .Site.Params.cdnPrefix -}}
{{- if $avatarPlugin -}}
	/* 头像挂件自动刷新 */
	{{- if $profile.avatarPluginFlush -}}
		$(function () {
			$(".site-avatar-plug-bilibili").attr("src", "{{ $cdnPrefix }}/images/avatar-plug/bilibili_" + (~~({{ $avatarPluginCount }}*Math.random())+1) + ".png");
		});
	{{- else -}}
		$(function () {
			$(".site-avatar-plug-bilibili").attr("src", "{{ $cdnPrefix }}{{ $avatarPlugin }}");
		});
	{{- end -}}
	
	/* 点击头像更换b站挂件 */
	var avatar_plug = 0;
	var avatar_click = 1;
	jQuery(document).ready(function($) {
		/* 点击频率，点击几次就换挂件 */
		var frequency = {{ $avatarPluginFrequency }};
		/* 头像挂件总数 */
		var plug_count = {{ $avatarPluginCount }};
		$("div.home-avatar a").click(function(e) {
			if (avatar_click % frequency === 0) {
				avatar_plug ++;
				$(".site-avatar-plug-bilibili").attr("src", "{{ $cdnPrefix }}/images/avatar-plug/bilibili_" + avatar_plug + ".png");
			}		
			if (avatar_plug === plug_count) {
				avatar_plug = 0;
			}
			$("div.home-avatar a").attr("alt","再点击" + (frequency - avatar_click % frequency) + "次头像试试看~~");
			avatar_click ++;
		});
	});
{{- end -}}
</script>
```

### 添加css代码

在自定义的`_custom.scss`里添加如下代码：
```css
/* 首页头像 */
/* bilibili头像挂件 */
img.site-avatar-plug-bilibili {
    position: absolute;
    display: block;
    margin: -2rem !important;
    padding: 0;
    width: 9rem !important;
    max-width: 168px;
    height: auto;
    box-shadow: none !important;
    z-index: 1;
    pointer-events: none;
}

/* 头像旋转 */
.home .home-profile .home-avatar img {
    width: 5rem;

  /* 设置循环动画
  [animation: 
	(play)动画名称
	(2s)动画播放时长单位秒或微秒
	(ease-out)动画播放的速度曲线为以低速结束 
	(1s)等待1秒然后开始动画
	(1)动画播放次数(infinite为循环播放) ]*/
 
  /* 鼠标经过头像旋转360度 */
  -webkit-transition: -webkit-transform 1.0s ease-out;
  -moz-transition: -moz-transform 1.0s ease-out;
  transition: transform 1.0s ease-out;
    &:hover {
      /* 鼠标经过停止头像旋转 
      -webkit-animation-play-state:paused;
      animation-play-state:paused;*/

      /* 鼠标经过头像旋转360度 */
      -webkit-transform: rotateZ(360deg);
      -moz-transform: rotateZ(360deg);
      transform: rotateZ(360deg);
    }
}
/* Z 轴旋转动画 */
@-webkit-keyframes play {
  0% {
    -webkit-transform: rotateZ(0deg);
  }
  100% {
    -webkit-transform: rotateZ(-360deg);
  }
}
@-moz-keyframes play {
  0% {
    -moz-transform: rotateZ(0deg);
  }
  100% {
    -moz-transform: rotateZ(-360deg);
  }
}
@keyframes play {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(-360deg);
  }
}
```

头像和挂件的样式代码可能根据个人的定制化而需要微调下位置之类的。至于头像挂件这些图片请去我的站点里下载下来，下面是具体地址：
https://github.com/lewky/lewky.github.io/tree/master/images/avatar-plug

## 参考链接

* [DesertsP/Valine-Admin](https://github.com/DesertsP/Valine-Admin)
* [Hexo主题使用Valine-Admin管理评论和评论提醒](https://segmentfault.com/a/1190000021474516?utm_source=tag-newest)
* [最新版基于Leancloud或javascript推送Valine评论到QQ](https://w4j1e.xyz/posts/lpush.html)
* [优雅解决LeanCloud流控问题](https://www.antmoe.com/posts/ff6aef7b/)
* [cron-job.org](https://cron-job.org/en/members/jobs/)
* [Qmsg酱](https://qmsg.zendee.cn/)
* [hexo中添加鼠标右键功能](https://www.zyoushuo.cn/post/4445.html)
* [在搭配Volantis主题的hexo博客上使用waline](https://www.hin.cool/posts/waline.html)