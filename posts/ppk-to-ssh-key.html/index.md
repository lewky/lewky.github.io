# Putty的ppk文件转成Xshell使用的key文件

## 问题与解决方案

key文件的格式有很多种，而putty的ppk文件是不能直接导入到xshell中来使用的，需要用puttygen将ppk文件转换成xshell支持的OPENSSH格式，操作如下：<!--more-->

>打开puttygen，打开菜单栏里的Conversions -> Import key，然后导入ppk文件，接着打开Conversions里的Export OpenSSH key，为这个要导出的文件起一个名字，该文件默认没有后缀名。可以选择设置密码，也可以不设置，如果不设置密码导出文件时会提示你，选是。这个key文件会被导出到和ppk文件相同的目录下。

>打开xshell，新建一个Session或修改已有的Session配置(Properties)，找到Connection -> Authentication，Method选择`Public Key`，`User Name`填写要登录的用户名，点击Browse按钮，然后Import刚才Putty导出的文件，由于这个文件我们刚才没有设置密码，所以Passphrase不用填，完成后如下。这样就由使用Putty登录转成使用自己熟悉的Xshell登录了。

## 参考链接

* [Putty的ppk文件转成Xshell使用的key文件](http://blog.csdn.net/daydreamingboy/article/details/8108853#insertcode)
