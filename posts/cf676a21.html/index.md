# 解读ping -n 4 127.1 >nul 2>nul

## 命令解读

ping是Windows、Unix和Linux系统下的一个命令。ping也属于一个通信协议，是TCP/IP协议的一部分。利用“ping”命令可以检查网络是否连通，可以很好地帮助我们分析和判定网络故障。应用格式是ping空格ip地址，可以附带参数，可以直接在cmd中输入`ping`然后回车来得到具体的帮助信息。

127.1是127.0.0.1，通常被称为本地回环地址(Loop back address)，不属于任何一个有类别地址类。它代表设备的本地虚拟接口，所以默认被看作是永远不会宕掉的接口。在windows操作系统中也有相似的定义，所以通常在安装网卡前就可以ping通这个本地回环地址。一般都会用来检查本地网络协议、基本数据接口等是否正常的。
<!--more-->
`-n 4`表示ping几次，ping一次大概一秒钟，如果不加这个参数去使用ping命令，默认会ping4次。

`>nul`表示不显示ping的结果，但是不能隐藏错误信息。`2>null`表示隐藏错误信息。

于是最后这句命令就变成了延迟命令，表示等待4秒钟，你会看到光标闪烁了四下，一般用来延迟后面的代码的执行，或者说，用来让程序等待N秒钟(取决于-n后面的数值)。

## 补充

这里的`>`是重定向符，表示将输出重定向到指定的文件。如果该指定文件原本已存在，也会被覆盖掉。如果不希望覆盖掉原本的文件，可以用`>>`重定向符。

我们输入的命令默认会重定向到控制台，也就是cmd窗口。比如你在命令提示符窗口键入`dir`会在控制台打印出目录文件，这时候其实运行的是`dir >con`，con就是指的console控制台。`>nul`表示将输出重定向到空设备nul，也就是不显示输出。

至于`2>nul`的2，指的是stderr标准错误输出流，是用来输出错误信息的，这里就表示不输出错误信息。对应的，还有`0>nul`,`1>nul`。0表示stdin标准输入流，就是在控制台键入的信息。1表示stdout标准输出流，也就是正常输出的信息。`1>nul`其实就是`>nul`。

## 参考链接

* [ping （网络诊断工具）](https://baike.baidu.com/item/ping/6235?fr=aladdin)
* [本地回环地址](https://baike.baidu.com/item/%E6%9C%AC%E5%9C%B0%E5%9B%9E%E7%8E%AF%E5%9C%B0%E5%9D%80/6817765?fr=aladdin)
* [ping -n 10 127.1>nul是什么意思](https://zhidao.baidu.com/question/425629110826832532.html?qbl=relate_question_6&word=bat%B5%C4-z%BA%CD-n%CA%C7%CA%B2%C3%B4)
* [批处理 ping命令 ping -n 4 127.1 >nul 2>nul exit 什么意思啊？谢谢](https://zhidao.baidu.com/question/461943604.html)
* [批处理：其中的>NUL作用是什么？](https://zhidao.baidu.com/question/503850835.html)
* [bat语句中“1>&2”是什么意思？](https://zhidao.baidu.com/question/509215245.html)