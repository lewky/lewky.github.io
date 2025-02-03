# cmd - 常用命令

## 常用命令
<!--more-->
# 删除目录下的所有文件（无法删除文件夹）
del /q D:\projects\lewky\hugo-deploy

# 删除目录下所有文件和文件夹（无法删除隐藏文件夹）
rd /s /q D:\projects\lewky\lewky-hugo\public

# 拷贝文件夹下所有文件到另一个目录
xcopy .\public D:\projects\lewky\hugo-deploy /e /y /h /q
```