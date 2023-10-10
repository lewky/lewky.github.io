# IDEA问题汇总

## 前言

本文基于2021-2版本的IDEA。

## 无法搜索或者下载插件

`File` -> `Settings...` -> `Plugins`可以打开插件市场，搜索想要下载的插件，但是可能由于网络问题而无法成功搜索或者下载插件。此时需要设置代理来解决。

点击插件界面里的齿轮图标（在Marketplace、Installed的右边），选择`HTTP Proxy Settings...`，勾选`Auto-detect proxy settings`以及`Automatic proxy configuration URL:`，然后点击最下方的`Check connection`，在弹出框里输入官方插件网站`https://plugins.jetbrains.com/idea`，点击`OK`，一般都是可以连接成功的。之后就可以正常的搜索和下载插件了。

<!--more-->
如果上述的代理设置也不能成功，那只能自己去官方的插件市场网站搜索下载插件了：https://plugins.jetbrains.com/idea

这个版本的IDEA已经自带了Lombok插件。

## 破解2021-2版本的IDEA

目前用的是无限重置30天试用的方法：

1. 去官网下载2021-2版本的IDEA：https://www.jetbrains.com/idea/download/
2. 如果有安装过旧版本的IDEA，要先卸载掉旧版本的，卸载时记得勾选删除旧版本IDEA的缓存和本地历史
3. 安装新版本的IDEA并运行
4. 初次运行时选择免费试用：`Evaluate for free` -> `Evaluate`，然后继续启动
5. 打开IDEA后新建一个Java项目，然后将无限重置30天试用期的补丁`ide-eval-resetter-2.1.6.zip`拖动到IDEA的界面中。补丁请去这篇文章中的公众号里下载：https://www.exception.site/essay/how-to-free-use-intellij-idea-2019-3
6. 安装补丁后重启IDEA，点击`Help`菜单，若列表中出现`Eval Reset`选项，则代表安装成功。每次启动IDEA时会自动重置试用期，也可以手动点击刚刚的选项来重置。
7. 该重置插件的作者会持续更新，可以在插件市场中更新该重置试用期的插件版本。

这里顺便提供个IDEA注册码的网站：http://idea.lanyus.com/

## 插件推荐

* Codota代码智能提示插件
* CodeGlance显示代码缩略图插件
* Lombok插件（新版本IDEA自带了）
* Alibaba Java Coding Guidelines 阿里巴巴代码规范检查插件
* MybatisX 高效操作Mybatis插件
* Save Actions格式化代码插件
* Rainbow Brackets彩虹括号插件

## 常用的快捷键

`shift shift` 连按两次`shift`键可以搜索文件，可以选择搜索范围。

`ctrl + h` 查找一个类的继承关系树。

`ctrl + d` 复制光标选中的文本。

`ctrl + y` 删除光标选中的行。

`ctrl + f` 在当前文件查找文本。

`ctrl + shift + f` 所有文件中查找文本，不包括jar包里的文件。

`ctrl + r` 在当前文件替换文本。

`alt + ←` 跳转到文件栏左边的文件。

`alt + →` 跳转到文件栏左边的文件。

`alt + shift + ←` 跳转到上一步操作。

`alt + shift + →` 跳转到下一步操作。

`shift + enter` 在光标所在行的下一行创建一行空白行。

`ctrl + /` 单行注释或多行注释或取消注释。

`ctrl + f12` 查看当前类的所有方法，可以选择显示父类的方法。

`ctrl + space` 基础代码补全。

`ctrl + g` 跳转到第几行代码。

`ctrl + alt + L`格式化代码。

## 启动时选择工作空间

`File` -> `Settings...` -> `Appearance & Behavior` -> `System Settings` -> 不勾选`Reopen projects on startup`

## 全局配置优化

### 优化导包

`File` -> `Settings...` -> `Editor` -> `General` -> `Auto import`：

* 勾选`Add unambiguous imports on the fly`（自动导包）
* 勾选`Optimize imports on the fly`（自动删除无用的包）

### 取消tab页单行显示

可以多行显示tab页，方便查看文件。

`File` -> `Settings...` -> `Editor` -> `General` -> `Editor Tabs` -> 取消勾选`Show tabs in one row`

### 代码提示、搜索时取消匹配大小写

在代码提示、搜索时默认匹配大小写，比如输入`s`是无法提示`String`的，需要取消匹配大小写：

`File` -> `Settings...` -> `Editor` -> `General` -> `Code completion` -> 取消勾选`Match Case:`

### 双斜杠注释改成紧跟代码头

`File` -> `Settings...` -> `Editor` -> `Code Style` -> `Java` -> `Code Generation` -> `Comment Code`：

* 取消勾选`Line comment at first column`
* Add a space at comment start

改完后使用双斜杠注释时，会跟在代码前面：

```java
public class Test {

    public static void main(String[] args) {
        // System.out.println("helloworld.");
    }
}
```

### 自定义live template代码模板

在Eclipse中输入`syso`加上回车键，就会自动输入`System.out.println();`，这个功能在IDEA中也可以实现：

`File` -> `Settings...` -> `Editor` -> `Live Templates`：

* 点击右边的加号`+`，可以选择新建一个分组或者新的模板，分组可以重命名。模板名字由`Abbreviation`决定，就是用来输入提示的字母组合。
* 这里输入`syso`，然后在`Template text:`里输入`System.out.println($END$);`
* 点击`Define`，勾选`Java`，这样在写Java代码时就可以通过输入`syso`来快速输入设定号的代码模板。

可以按照个人习惯多定义一些模板，如下：

Abbreviation: `apr`

Template text:
```
@Autowired
private $VAR$ $END$;
```

`$END$`表示光标的位置。

###  优化版本控制的目录颜色展示

代码改变时，目录颜色会跟着变化：

`File` -> `Settings...` -> `Version Control` -> 勾选`Show directories with changed descendants`

### 创建文件时，自动生成作者信息和日期等文本模板

`File` -> `Settings...` -> `Editor` -> `File and Code Templates` -> `Includes` -> `File Header`填写文本模板即可。默认提供的`File Header`模板，是在左边的`Files`页面里的Class、Interface等通过`#parse("File Header.java")`引入的。

可以依样画葫芦，自己定义一个模板文件，然后在想要引入的文件里通过`#parse`来引入。需要注意的是，最好在模板文件的最后一行多加一行空白行，不然在创建新类时，可能会报错而创建失败。下面是一个例子：

新建了一个模板文件`Comment Header`：

```
// Copyright (c) 1998-${YEAR} Core Solutions Limited. All rights reserved.
// ============================================================================
// CURRENT VERSION CNT.5.0.1
// ============================================================================
// CHANGE LOG
// CNT.5.0.1 : ${YEAR}-XX-XX, ${USER}, creation
// ============================================================================

```

修改`Files`页面里的Class为：

```
#parse("Comment Header.java")
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")
public class ${NAME} {
}

```

### 修改默认的${USER}的值

默认值是操作系统的当前用户名，可以指定为其他名字。

`Help` -> `Edit Custom VM Options...`，添加一行新的参数：`-Duser.name=lewis.liu`，这里的名字自行定义。

还可以在这里修改IDEA的内存参数：

```
-Xms1024m
-Xmx2010m
```

### 显示行号和方法分割线

`File` -> `Settings...` -> `Editor` -> `General` -> `Appearance`：

* 勾选`Show line numbers`
* 勾选`Show method separators`

## 编辑器中光标变为Insert状态

在编辑器中光标变为Insert状态，此时无法进行复制黏贴等操作。这个问题有两种可能性：

* 可能跟IDEA本身的配置有关：`File` -> `Settings...` -> `Editor` -> `General` -> `Appearance` -> 取消勾选`Use block caret`
* 也可能跟IdeaVim插件有关：`File` -> `Settings...` -> `Plugins` -> `Installed` -> 搜索ideavim，取消勾选该插件

## 分屏浏览两个文件

在文件栏里右键一个打开的文件标签，选择`Move Right`可以实现左右分屏浏览，选择`Move Down`可以实现上下分屏浏览。

## 鼠标悬停显示JavaDoc

连续按两下Shift打开搜索框，输入`Show quick documentation on mouse move`，这时候可以看到一个开关，打开这个开关即可。

## Command line is too long.

启动项目时报错如下：

```
Error running xxx. Command line is too long.
Shorten the command line via JAR manifest or via a classpath file and rerun.
```

该报错是因为项目启动时需要打印的环境变量太长，超过了限制，需要缩短命令行来启动项目。

按照报错提示，修改当前项目的配置：

在启动或者Debug图标左侧打开当前项目的配置页面，在`Configuration`页签里的`Shorten command line:`选项里选择`JAR manifest`或者`classpath file`，然后保存并重启项目即可。

## import语句去掉*

`File` -> `Settings...` -> `Editor` -> `Code Style` -> `Java` -> `Scheme:`选择`Default` -> 选择`Imports`这个tab：

* 找到`General`这一栏，勾选`Use single class import`
* 将`Class count to use import with '*'`改为较大的值，如99
* 将`Names count to use static import with '*'`改为较大的值，如99
* 找到`Package to Use import with '*'`这一栏，将里面勾选的选项全部取消掉

## 全局搜索不到真实存在的文件或文本内容

有时候idea无法搜索到一个真实存在的文件或者文本内容，是idea本身的缓存未刷新导致的，解决方法是使旧缓存失效并重启idea，这时候就可以搜索到了：

`File` -> `Invalidate Caches / Restart...`

## 参考链接

* [IDEA常用快捷键整理](https://www.cnblogs.com/tangxiaoyuan/p/14257563.html)
* [IntelliJ IDEA 2021.2激活破解教程（亲测有用，永久激活，长期更新）](https://www.exception.site/essay/how-to-free-use-intellij-idea-2019-3)
* [intellij idea 启动时怎么选择工作空间](https://zhidao.baidu.com/question/498068397998147524.html?qbl=relate_question_1&word=idea%D4%F5%C3%B4%D1%A1%B9%A4%D7%F7%BF%D5%BC%E4)
* [完美解决idea无法搜索下载插件的问题](https://www.jb51.net/article/195740.htm)
* [idea如何修改默认的${user}值](https://www.cnblogs.com/zhenhunfan2/p/13522995.html)
* [IntelliJ IDEA高效使用教程，让你的工作效率提升10倍！](https://mp.weixin.qq.com/s/cRWGkDUguX-vPPCVyF7D2Q)
* [idea编译器光标变为insert状态](https://blog.csdn.net/qingfengmuzhu1993/article/details/79496280)
* [idea 鼠标变量_IntelliJ IDEA鼠标悬停方法显示Java Doc](https://blog.csdn.net/weixin_39793420/article/details/111805787)
* [idea2021版本后项目运行报错——Error running xxx : Command line is too long.Shorten command line ..解决方法](https://blog.csdn.net/sinat_21843047/article/details/119331019)
* [idea import 去掉*](https://blog.csdn.net/tianzhonghaoqing/article/details/121559128)