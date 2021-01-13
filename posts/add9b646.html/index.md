# Java反编译工具JD-GUI以及Eclipse的反编译插件

## 什么是反编译

>高级语言源程序经过编译变成可执行文件，反编译就是逆过程。但是通常不能把可执行文件变成高级语言源代码，只能转换成汇编程序。

<!--more-->

>反编译是一个复杂的过程,所以越是高级语言,就越难于反编译,但目前还是有许许多多的反编译软件:通过对他人软件的目标程序（可执行程序）进行“逆向分析、研究”工作，以推导出他人的软件产品所使用的思路、原理、结构、算法、处理过程、运行方法等设计要素，作为自己开发软件时的参考，或者直接用于自己的软件产品中。所以现在大家写的东西就想办法保护，不被侵权！

总之，有时候我们想要阅读代码，但是只有jar包却没有源码，就需要用到反编译工具了。

## Java反编译工具JD-GUI

Github上的官方下载地址：https://github.com/java-decompiler/jd-gui/releases

有多种平台的安装版本，可以自己选择下载安装，也可以直接下载JAR包，然后用`java -jar`进行运行，如下：

```cmd
java -jar jd-gui-1.4.0.jar
```

## 安装Eclipse的反编译插件

### jd-eclipse

`jd-gui`在Eclipse上也有对应的反编译插件`jd-eclipse`，安装方式如下：

* 打开Eclipse -> Help -> Install New Software... -> Add...
* 在弹出的窗口中输入Name和Location，Name可以随意取，Location要填写反编译插件的下载地址：http://jd.benow.ca/jd-eclipse/update （该地址可能已经过期，需要去官网下载jd-eclipse，地址：http://java-decompiler.github.io/ ）
* 填写完毕后会加载该插件的相关信息，勾选该插件，一路Next安装下去即可。
* 重启Eclipse该插件即可生效。

不过安装插件后Eclipse可能继续使用着默认的class查看器，我们可以把它改成我们新安装的jd查看器：

* Window -> Preference -> General -> Editors -> File Associations
* 选中*.class文件 -> 将Class File Editor设置为默认(Default)
* 最后确定修改，无需重启Eclipse即可生效。

新版本的jd-eclipse的类文件查看器名字可能叫做JD Class File Viewer(总之，Class File Viewer是Eclipse自带的类文件查看器，安装插件后会出现新的类文件查看器)

### Enhanced Class Decompiler 3.0.0

上边的反编译插件`jd-eclipse`可能在安装并修改了class查看器后依然无效，可能是由于Eclipse版本不兼容或者其他的原因，这时候可以安装另一个反编译插件，安装步骤如下：

* 打开Eclipse -> Help -> Eclipse Marketplace...
* 在弹窗的搜索框中输入Decompiler，选择安装Enhanced Class Decompiler 3.0.0
* 安装工程中有Next选Next，中间需要选择接受安装协议，最后点击Finish
* 安装结束后重启Eclipse生效

## 参考链接

1. [反编译是什么意思](https://zhidao.baidu.com/question/301510653.html)
2. [Java反编译工具-JD-GUI](https://www.cnblogs.com/EasonJim/p/7788659.html)
3. [jd-eclipse反编译插件的在线安装和使用](https://blog.csdn.net/try_try_try/article/details/77853784)
4. [关于Eclipse安装了反编译插件,无法查看源码问题](https://blog.csdn.net/qq_36506444/article/details/78711224)
