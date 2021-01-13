# Windows下完全卸载node.js并安装node.js的多版本管理工具nvm-windows

## 前言

由于高版本的node.js导致gulp执行build命令失败，我需要在Windows下卸载掉已有的node.js并安装一个多版本管理工具`nvm-windows`，方便切换不同版本的node.js。

nvm是Linux下常用的一个node.js多版本管理工具，但是nvm不能在Windows下使用，在GitHub上有个项目叫`nvm-windows`，可以让我们在Windows下对node.js进行多版本管理。<!--more-->

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

## 参考链接

* [Window下完全卸载删除Nodejs](https://www.cnblogs.com/fighxp/p/7410235.html)
* [Windows上node.js的多版本管理工具](https://blog.csdn.net/kongxx/article/details/78421050)