# 博客园SimpleMemory皮肤定制化

## 前言

博客园支持皮肤的高度定制化，本文主要简单介绍下博客园的SimpleMemory皮肤的定制化。感谢皮肤作者以及定制化皮肤的作者！

个人使用的是`BNDong`大大开源的基于SimpleMemory原皮的定制化皮肤，下面是相关的一些链接。

* 项目地址：https://github.com/BNDong/Cnblogs-Theme-SimpleMemory
* 文档地址：https://bndong.github.io/Cnblogs-Theme-SimpleMemory/v2/#/
* 原作者：https://www.cnblogs.com/bndong/

<!--more-->
## 使用指南

官方文档里已经有很详细的教程了，这里只进行简单的记录，方便日后回顾。本文基于v2版本的安装配置教程。

使用该定制化皮肤，需要JS权限，这个要自行申请。申请也很简单，在博客园的设置中找到`申请JS权限`按钮，在弹窗里编写申请理由，下面是个简单的模板：

>尊敬的博客园管理员：
您好，我希望用JS美化下我的博客页面，麻烦通过下我的JS权限申请。
感谢您的帮助。

一般情况下，一小时内就能申请通过。

然后在设置中的`博客皮肤`要选择`SimpleMemory`，接着前往项目的[仓库地址](https://github.com/BNDong/Cnblogs-Theme-SimpleMemory)下载代码文件（是个ZIP文件），解压之后得到css文件：`/dist/simpleMemory.css`。将该文件的内容整个复制到博客园设置中的`页面定制CSS代码`框中，要勾选`禁用模板默认CSS`。

有能力的同学可以自己修改定制这里的CSS样式。

**该皮肤使用公告这个控件进行了功能扩展，所以需要在`选项`中的`侧边栏控件`的`公告`勾选上！**

下面则是个人的公告控件代码，用来填写在博客园设置中的`博客侧边栏公告`框中，以下代码仅供参考：

```javascript
<script type="text/javascript">
    window.cnblogsConfig = {
        info: {
            name: '雨临Lewis', // 用户名
            startDate: '2018-04-19', // 入园时间，年-月-日。入园时间查看方法：鼠标停留园龄时间上，会显示入园时间
            avatar: 'https://pic.cnblogs.com/avatar/1380444/20180423203245.png', // 用户头像
            blogIcon: 'https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/favicon.ico'
        },
        banner: {
            home: {
                title: [
                    '赵子龙一身是胆，程序猿遍体皆肝',
                    '不想当写手的码农不是好咸鱼_(xз」∠)_',
                    '男人至死都是少年'
                ],
                background: [
                    "https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/background/saber1.jpg",
                    "https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/background/saber2.jpg"
                ],
            }
        },
        sidebar: {
            infoBackground: 'https://cdn.jsdelivr.net/gh/lewky/lewky.github.io@master/images/background/wlop.jpg'
        },
        footer: {
            style: 1,
            text: {
                left: '好好学习',
                right: '天天摸鱼'
            }
        },
        links: {
            footer: [
                ["我的个人站点", 'https://lewky.cn/'],
                ["Java学习笔记", 'https://javanote.doc.lewky.cn/'],
                ["我的GitHub", 'https://github.com/lewky'],
                ["我的CSDN", 'https://blog.csdn.net/lewky_liu']
            ]
        },
        consoleList: [
            ["我的个人站点", 'https://lewky.cn/'],
            ["Java学习笔记", 'https://javanote.doc.lewky.cn/'],
            ["我的GitHub", 'https://github.com/lewky'],
            ["我的博客园", 'https://www.cnblogs.com/yulinlewis/'],
            ["我的CSDN", 'https://blog.csdn.net/lewky_liu'],
            ['我的Email', '1019175915@qq.com']
        ]
    }
</script>
<script src="https://cdn.jsdelivr.net/gh/BNDong/Cnblogs-Theme-SimpleMemory@v2.0.5/dist/simpleMemory.js" defer></script>
```

## 参考链接

* [SimpleMemory文档](https://bndong.github.io/Cnblogs-Theme-SimpleMemory/v2/#/Docs/GettingStarted/install)
* [博客园申请JS权限教程](https://www.cnblogs.com/maczhen/p/14372738.html)
