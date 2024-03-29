# Windows下完全卸载node.js并安装node.js的多版本管理工具nvm-windows

## 前言

由于高版本的node.js导致gulp执行build命令失败，我需要在Windows下卸载掉已有的node.js并安装一个多版本管理工具`nvm-windows`，方便切换不同版本的node.js。

nvm是Linux下常用的一个node.js多版本管理工具，但是nvm不能在Windows下使用，在GitHub上有个项目叫`nvm-windows`，可以让我们在Windows下对node.js进行多版本管理。
<!--more-->

nvm-windows的下载地址：https://github.com/coreybutler/nvm-windows/releases

根据官方说明：

```
It comes with an installer (and uninstaller), because getting it should be easy. Please note, you need to uninstall any existing versions of node.js before installing NVM for Windows. Also delete any existing nodejs installation directories (e.g., "C:\Program Files\nodejs") that might remain. NVM's generated symlink will not overwrite an existing (even empty) installation directory.

You should also delete the existing npm install location (e.g. "C:\Users<user>\AppData\Roaming\npm") so that the nvm install location will be correctly used instead. After install, reinstalling global utilities (e.g. gulp) will have to be done for each installed version of node:
```

在安装nvm-windows前，如果以前安装过node，需要先卸载，并且要把目录清理干净。

## 在Windows下完全卸载已安装的node.js

1. 从卸载程序卸载程序和功能，也可以直接右键node.js的安装包并选择卸载。
2. 重新启动（或者重新启动任务管理器杀死所有与节点相关的进程）。
3. 从下列的目录中找到相关的内容并删除掉：
    1. `C:\Program Files (x86)\nodejs`
    2. `C:\Program Files\nodejs`
    3. `C:\Users\{User}\AppData\Roaming\npm`（或`%appdata%\npm`）
    4. `C:\Users\{User}\AppData\Roaming\npm-cache`（或`%appdata%\npm-cache`）
4. 检查`%PATH%`环境变量以确保没有引用Nodejs或npm存在。
5. 重新启动电脑。

## 安装`nvm-windows`并使用

到GitHub的[项目下载地址](https://github.com/coreybutler/nvm-windows/releases)，选择下载`nvm-setup.zip`，解压后双击使用安装程序即可。

**注意不要改变安装时默认安装的系统软连接路径`NVM_SYMLINK`的值，否则会使用不了nodejs**

### 查看已安装的nodejs版本

```
nvm list
```

如果是第一次安装，使用该命令结果如下：
```
C:\Users\Lewis>nvm list

No installations recognized.
```

### 查看可安装的nodejs版本

```
nvm list available
```

输入该命令结果如下：

```
C:\Users\Lewis>nvm list available

|   CURRENT    |     LTS      |  OLD STABLE  | OLD UNSTABLE |
|--------------|--------------|--------------|--------------|
|   11.10.0    |   10.15.1    |   0.12.18    |   0.11.16    |
|    11.9.0    |   10.15.0    |   0.12.17    |   0.11.15    |
|    11.8.0    |   10.14.2    |   0.12.16    |   0.11.14    |
|    11.7.0    |   10.14.1    |   0.12.15    |   0.11.13    |
|    11.6.0    |   10.14.0    |   0.12.14    |   0.11.12    |
|    11.5.0    |   10.13.0    |   0.12.13    |   0.11.11    |
|    11.4.0    |    8.15.0    |   0.12.12    |   0.11.10    |
|    11.3.0    |    8.14.1    |   0.12.11    |    0.11.9    |
|    11.2.0    |    8.14.0    |   0.12.10    |    0.11.8    |
|    11.1.0    |    8.13.0    |    0.12.9    |    0.11.7    |
|    11.0.0    |    8.12.0    |    0.12.8    |    0.11.6    |
|   10.12.0    |    8.11.4    |    0.12.7    |    0.11.5    |
|   10.11.0    |    8.11.3    |    0.12.6    |    0.11.4    |
|   10.10.0    |    8.11.2    |    0.12.5    |    0.11.3    |
|    10.9.0    |    8.11.1    |    0.12.4    |    0.11.2    |
|    10.8.0    |    8.11.0    |    0.12.3    |    0.11.1    |
|    10.7.0    |    8.10.0    |    0.12.2    |    0.11.0    |
|    10.6.0    |    8.9.4     |    0.12.1    |    0.9.12    |
|    10.5.0    |    8.9.3     |    0.12.0    |    0.9.11    |
|    10.4.1    |    8.9.2     |   0.10.48    |    0.9.10    |

This is a partial list. For a complete list, visit https://nodejs.org/download/release
```

### 安装指定版本的nodejs

```
nvm install 8.11.2 64-bit
```

安装成功后可以查询看看已安装的nodejs版本：

```
C:\Users\Lewis>nvm list

    8.11.2
```

有需要的话，可以继续安装其他版本的nodejs。

### 使用指定版本的nodejs

```
nvm use 8.11.2
```

安装成功后可以验证下版本：
```
C:\Users\Lewis>nvm list

  * 8.11.2 (Currently using 64-bit executable)

C:\Users\Lewis>node -v
v8.11.2
```

### 删除指定版本的nodejs
```
nvm uninstall 8.11.2
```

## 配置淘宝镜像

nvm默认的下载地址是 http://nodejs.org/dist/ ，速度很慢，可以改用淘宝的镜像，打开nvm安装路径下的`settings.txt`，添加如下内容：
```
node_mirror: https://npm.taobao.org/mirrors/node/
npm_mirror: https://npm.taobao.org/mirrors/npm/
```

然后打开C盘你的用户目录下的`.npmrc`文件，如果没有该文件可以自己创建一个，然后添加或修改如下内容：
```
registry=https://registry.npm.taobao.org/
cache=D:\software\nvm\npm-cache
prefix=D:\software\nvm\npm
```

这里的`cache`和`prefix`请自己填写想要存放的路径。

## 其他的npm镜像源

有些模块用淘宝镜像源不一定能下载下来，可以换成其他的镜像源：
```
npm config set registry https://registry.npmjs.org
```

如果不想每次都重新设置镜像源，也可以使用`nrm`来管理镜像源。

## 添加环境变量

做完上述步骤后已经可以直接在cmd中使用npm命令来安装模块，此时可以将`%NVM_HOME%\npm`添加到系统的`Path`变量中，方便在cmd中使用nvm安装目录下的npm全局安装的模块命令。

## 参考链接

* [Window下完全卸载删除Nodejs](https://www.cnblogs.com/fighxp/p/7410235.html)
* [Windows上node.js的多版本管理工具](https://blog.csdn.net/kongxx/article/details/78421050)
* [NVM的安装和NPM下载速度慢的问题](https://www.jianshu.com/p/0e4f2bfadf3e)