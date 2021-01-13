# 快速删除node_modules文件夹

## 前言

当安装了较多模块后，node_modules目录下的文件会很多，直接删除整个目录会很慢，下面介绍些快速删除node_modules目录的方法。

## 方法一：使用rimraf模块的命令

<!--more-->
在全局安装rimraf模块，然后通过其命令来快速删除node_modules目录：
```
npm install rimraf -g
rimraf node_modules
```

## 方法二：使用命令来删除目录

### Windows下使用rmdir命令

首先在cmd窗口中进入到node_modules文件夹所在的路径，接着执行命令：
```
rmdir /s/q node_modules
```

### Linux下使用rm命令
```
rm -f /node_modules
```

## 参考链接

* [删除node_modules文件夹](https://blog.csdn.net/qq_33936481/article/details/73410481#commentBox)
