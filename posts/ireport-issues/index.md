# iReport问题汇总

## iReport无法正常启动

最近需要用到iReport报表工具，但是在启动客户端时却发现会闪退，无法正常启动。查找了资料，发现是因为iReport无法支持jdk 1.8，必须要修改配置文件，将java版本指定为1.7或之前的版本。目前官网最新的版本是5.6.0，据说有外国大神说是下个版本将会支持jdk 1.8。
<!--more-->
找到iReport的安装目录，然后将`etc/ireport.conf`打开，可以看到有一行被注释的配置如下：

```
#jdkhome="path/to/jdk"
```

在这行注释下边加上一句：
```
jdkhome="C:\Program Files\Java\jdk1.7.0_25"
```

具体路径以本地安装的jdk目录为准，保存修改后重新启动iReport客户端即可。

另外补充一句，这个etc目录其实作用和Linux下的etc目录差不多，就是专门用来存放程序所需的整个文件系统的配置文件。etc不是什么缩写，是and so on的意思，来源于法语的`et cetera`，翻译成中文就是等等的意思。

## PDF导出中文不显示

iReport PDF导出时中文不显示，报错如下：

```java
Error exporting print... Could not load the following font : 
pdfFontName   : STSong-Light
pdfEncoding   : UniGB-UCS2-H
isPdfEmbedded : true
net.sf.jasperreports.engine.JRRuntimeException: Could not load the following font : 
pdfFontName   : STSong-Light
pdfEncoding   : UniGB-UCS2-H
isPdfEmbedded : true 
    at net.sf.jasperreports.engine.export.JRPdfExporter.getFont(JRPdfExporter.java:2117) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.getChunk(JRPdfExporter.java:1906) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.getPhrase(JRPdfExporter.java:1875) 
    at net.sf.jasperreports.engine.export.SimplePdfTextRenderer.getPhrase(SimplePdfTextRenderer.java:89) 
    at net.sf.jasperreports.engine.export.SimplePdfTextRenderer.render(SimplePdfTextRenderer.java:100) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.exportText(JRPdfExporter.java:2238) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.exportElements(JRPdfExporter.java:950) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.exportPage(JRPdfExporter.java:909) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.exportReportToStream(JRPdfExporter.java:786) 
    at net.sf.jasperreports.engine.export.JRPdfExporter.exportReport(JRPdfExporter.java:513) 
    at com.jaspersoft.ireport.designer.compiler.IReportCompiler.run(IReportCompiler.java:1174) 
    at org.openide.util.RequestProcessor$Task.run(RequestProcessor.java:572) 
    at org.openide.util.RequestProcessor$Processor.run(RequestProcessor.java:997)
```

这是因为使用到了宋体，而iReport的classpath中缺少了字体对应的jar包，需要加入到classpath中。iReport本身已经提供了这个jar包了，就在安装目录下：`ireport\modules\ext\iTextAsian.jar`

点击`工具` -> `选项` -> 选择`Classpath`页 -> `Add JAR`（由于屏幕分辨率的原因可能会看不到这个按钮，可以将当前的窗口页面往右边拉大出去，就会显示这些被隐藏了的按钮。）

选择上述提及的`iTextAsian.jar`并确定，接着在Classpath页面中将刚刚添加的jar包打钩，然后重启iReport即可。

如果在Web应用中需要导出PDF，同样需要把这个jar包添加到Web应用的`WEB_INF\lib`中。

## 参考链接

* [关于iReport5.6.0无法正常启动或者闪退或者JDK8不兼容的解决方案](https://blog.csdn.net/erlian1992/article/details/76359191)
* [linux下的etc是什么意思](https://zhidao.baidu.com/question/426469556.html)
* [iReport 5.6.0 PDF导出中文不显示问题 解决方案](https://www.cnblogs.com/miracle-luna/p/10568318.html)
* [Jaspersoft iReport Designer 4.7.0 导出pdf 中文不显示的解决办法](https://blog.csdn.net/aust_glj/article/details/52331766)