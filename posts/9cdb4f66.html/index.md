# Google hosts - 简单介绍与使用方法

## 什么是Hosts

百度百科：

>Hosts是一个没有扩展名的系统文件，可以用记事本等工具打开，其作用就是将一些常用的网址域名与其对应的IP地址建立一个关联“数据库”，当用户在浏览器中输入一个需要登录的网址时，系统会首先自动从Hosts文件中寻找对应的IP地址，一旦找到，系统会立即打开对应网页，如果没有找到，则系统会再将网址提交DNS域名解析服务器进行IP地址的解析。
>
>需要注意的是，Hosts文件配置的映射是静态的，如果网络上的计算机更改了请及时更新IP地址，否则将不能访问。

<!--more-->

## Hosts所在文件夹

* Windows系统hosts位于 `C:\Windows\System32\drivers\etc\hosts`
* Android（安卓）、Mac（苹果电脑）iPhone（iOS）、Linux 、绝大多数Unix等系统hosts都是位于 `/etc/hosts`
* Android（安卓）iPhone（iOS）修改hosts 需要Root或越狱。

## Hosts的作用

1. 加快域名解析
2. 方便局域网用户
3. 屏蔽网站（域名重定向）
4. 顺利连接系统
5. 虚拟域名

更加具体的说明请参考百度百科。

## 使用步骤

### 获取最新的hosts文件

可以自己百度`Google hosts`寻找最新的hosts文件，获取前往GitHub上由大佬们维护的项目获取：https://github.com/googlehosts/hosts

附上项目的镜像地址，访问不了GitHub的同学可以访问这个：https://coding.net/u/scaffrey/p/hosts/git

在上述的项目地址中找到hosts文件(无后缀名)，也可以直接在线浏览该文件的内容，下边附上链接：https://raw.githubusercontent.com/googlehosts/hosts/master/hosts-files/hosts

同样附上国内镜像的浏览链接：https://coding.net/u/scaffrey/p/hosts/git/raw/master/hosts-files/hosts

### 修改本地hosts文件

从上边的项目地址将hosts文件下载到本地，直接替换掉本地的hosts文件，建议替换之前先备份原本的hosts文件。

或者直接在线浏览文件内容，将内容拷贝到本地的hosts文件的末尾。

这里说明一下，文件里的#开头表示注释，也就是说那一行没有效果，只是起到说明作用。

### 刷新本地dns

修改了hosts文件后不需要重启电脑，直接在本地刷新dns的缓存即可生效：

#### Windows

1. `win+R`组合键启动运行，输入`cmd`
2. 在cmd界面输入`ipconfig /flushdns`，然后回车
3. 接下来你会看到`已成功刷新 DNS 解析缓存。`

#### Linux

* 终端输入`sudo rcnscd restart`
* 对于systemd发行版，输入`sudo systemctl restart NetworkManager`
* 如果不懂请都尝试下。

#### Mac OS X

终端输入`sudo killall -HUP mDNSResponder`

#### Android

开启飞行模式 -> 关闭飞行模式

#### 通用方法

1. 拔网线(断网) -> 插网线(重新连接网络)
2. 如不行请清空浏览器缓存
3. 再不行请重启电脑

## 相关事项说明

<div class="note info">注意事项</div>

* 本文提供的hosts链接仅限于方便学习使用
* hosts里不会添加屏蔽广告条目，也不会劫持任何网站
* 您现在的hosts能使用，就没必要经常更新！

<div class="note warning">版权声明</div>

Github项目的所有代码除另有说明外,均按照 MIT License 发布。

Github项目的hosts，README.MD， wiki等资源基于 CC BY-NC-SA 4.0 这意味着你可以拷贝、并再发行本项目的内容， 但是你将必须同样提供原作者信息以及协议声明。同时你也不能将本项目用于商业用途，按照我们狭义的理解 (增加附属条款)，凡是任何盈利的活动皆属于商业用途。

<div class="note primary">感谢大佬们的无私奉献</div>