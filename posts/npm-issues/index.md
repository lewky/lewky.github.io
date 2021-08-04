# npm问题汇总

## 修改npm全局安装的路径

在cmd输入命令：

```cmd
npm config set prefix "D:\software\nodejs\node_global"
npm config set cache "D:\software\nodejs\node_cache"
```

之后可以执行`npm config ls`来查看是否设置成功了。

为了方便全局安装的模块能通过命令行来运行，可以将上述设置的两个路径添加到环境变量`PATH`中。

<!--more-->

## 配置淘宝npm镜像

官方的npm下载模块可能较慢，可以配置淘宝的npm镜像，之后就可以通过`cnpm install`来安装对应的模块：

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

## npm常用操作命令

```
// 安装模块到当前目录，但不写入package.json
npm install xx

// 安装全局模块
npm install -g xx

// 安装并写入package.json的"dependencies"中
npm install xx --save

// 安装并写入package.json的"devDependencies"中
npm install xx --save-dev

// 删除模块
npm uninstall xx

// 删除全局模块
npm uninstall -g xx
```

## `JavaScript heap out of memory`

用npm启动前端项目时报错如下：

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

这是npm在使用JavaScript时堆内存溢出了，需要增大内存，有两种方式。

### 方式一

在Node启动时调整内存大小：

```
node --max-old-space-size=1700 test.js // 单位为MB
// 或者
node --max-new-space-size=1024 test.js // 单位为KB
```

### 方式二

直接配置一个全局的环境变量`NODE_OPTIONS`，可以在cmd中输入如下命令：

```cmd
setx NODE_OPTIONS --max_old_space_size=4096
```

这里的单位为MB，新配置的环境变量要在新打开的cmd窗口中才能生效。

## 参考链接

* [修改npm全局安装模式的路径](https://www.cnblogs.com/Jimc/p/10194431.html)
* [致命错误：使用任何“NPM”命令时JavaScript堆将耗尽内存](https://cloud.tencent.com/developer/ask/216478)
* [基于node的前端项目编译时内存溢出问题](https://segmentfault.com/a/1190000010437948)
* [如果npm太慢，设置 淘宝npm镜像使用方法](https://www.cnblogs.com/zzp5980/p/7676344.html)