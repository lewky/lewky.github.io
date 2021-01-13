# win10无法写入删改c盘文件的解决方法

## 前言

最近使用了win10系统，结果发现无法对c盘的文件进行写入删改，在网上到处搜集资料，终于找到了解决方法，这里总结一下。

首先，本文针对的是win10家庭版，家庭版默认是不提供组策略功能，而我们需要给家庭版添加组策略功能来获取修改c盘文件的权限。
<!--more-->

## 在win10家庭版添加组策略功能

在win10家庭版通过`win+R`打开运行，输入`gpedit.msc`，回车确定，会提示说`windows找不到文件'gpedit.msc'`。

我们可以自己添加组策略功能：首先新建一个txt文本，填入以下内容：
```
@echo off
pushd "%~dp0"
dir /b %systemroot%\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~3*.mum >gp.txt
dir /b  %systemroot%\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~3*.mum >>gp.txt
for /f %%i in ('findstr /i . gp.txt 2^>nul') do dism /online /norestart /add-package:"%systemroot%\servicing\Packages\%%i"
pause
```

将该txt文件保存后，修改文件后缀为`.bat`或者`.cmd`都行；或者直接将txt文件另存为所有文件类型，文件名随意，然后扩展名为`.bat`或者`.cmd`都可以。

这里为了方便日后查找，可以将文件命名为`gpedit.bat`。

接着右键以管理员身份运行这个文件，等待程序安装完毕，你会发现在该文件的目录下多出来一个`gp.txt`文件。这时候你再一次在cmd窗口中输入`gpedit.msc`，回车确定，你会发现亲爱的组策略编辑器又回来了。

这时候你可以将`gpedit.bat`和`gp.txt`文件都删了，或者保留起来也行，它们已经完成使命，可以功成身退了。

## 在组策略中禁用管理员批准模式

在cmd窗口中输入`gpedit.msc`，接着回车，进入组策略编辑器界面。

在`计算机配置 -> Windows设置 -> 安全设置 -> 本地策略 -> 安全选项`的目录中，找到`用户帐户控制: 以管理员批准模式运行所有管理员`这个策略，将安全设置更改为`已禁用`，重启电脑后便可以随意写入删改c盘文件。

下面附上大佬对于该选项的解释：

>用户帐户控制: 启用管理审批模式。
>此策略设置控制计算机的所有用户帐户控制(UAC)策略设置行为。如果更改此策略设置，则必须重新启动计算机。
>选项为:
>*  启用: (默认设置)启用管理审批模式。必须启用该策略并且相关的 UAC 策略设置还必须设置正确以允许内置管理员帐户以及是管理员组成员的所有其他用户在管理审批模式下运行。
>* 禁用: 禁用管理审批模式以及所有相关 UAC 策略设置。注意: 如果禁用此策略设置，则安全中心将通知你操作系统的总体安全性已降低。
>
>说白了就是uac关闭了，没有内置管理审批（管理），就可以随意操作电脑

## 参考链接

* [封印解除：如何在Win10家庭版中启用组策略](https://www.ithome.com/html/win10/324926.htm)
* [Win10家庭版找不到组策略gpedit.msc怎么办](https://jingyan.baidu.com/article/54b6b9c08b08382d593b4747.html)
* [【平凡666】win 10 C盘无法写入或者删除没有权限解决办法](http://www.meiriyixue.cn/post/610.html)