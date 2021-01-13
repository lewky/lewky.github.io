# MarkdownPad - win10环境下无法渲染HTML问题

## 问题

在win10平台安装了MarkdownPad 2之后，发现在渲染md文件时报错，在预览页面无法正常渲染HTML：
![markdownpad_error.jpg](/images/posts/software/markdownpad_error.jpg)

<!--more-->
安装报错提示前往官网，可以看到如下的解决方法：

>*LivePreview is not working - it displays an error message stating* `This view has crashed!`
This issue has been specifically observed in Windows 8. You may see an error message as shown here, and no HTML will be rendered when you type in the Markdown Editor pane.

To fix this issue, please try installing the Awesomium 1.6.6 SDK.

If you continue to experience issues, please install Microsoft's DirectX End-User Runtimes (June 2010).


## 解决方法

1. 请尝试安装Awesomium 1.6.6 SDK，下载链接：[awesomium_v1.6.6_sdk_win.zip](https://download.csdn.net/download/lewky_liu/11475818)
2. 在安装之后依然有这个问题，请安装Microsoft's DirectX End-User Runtimes (June 2010)

## 参考链接

* [Frequently Asked Questions](http://markdownpad.com/faq.html#livepreview-directx)
* [升级win10后 MarkdownPad 2 无法实时渲染HTML页面问题](https://blog.csdn.net/apkeep/article/details/50965514)
