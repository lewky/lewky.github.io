# Linux - 查看并修改当前的系统时间

转载自[Linux系统查看当前时间的命令](https://blog.csdn.net/evilcry2012/article/details/54315170)

## 查看和修改Linux的时区

### 查看当前时区

命令 ： `date -R`
<!--more-->
### 修改设置Linux服务器时区

方法 A

命令 ： `tzselect`

方法 B 仅限于RedHat Linux 和 CentOS

命令 ： `timeconfig`

方法 C 适用于Debian

命令 ： `dpkg-reconfigure tzdata`

### 复制相应的时区文件，替换系统时区文件；或者创建链接文件

`cp /usr/share/zoneinfo/$主时区/$次时区 /etc/localtime`

例如：在设置中国时区使用亚洲/上海(+8)

`cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime`

## 查看和修改Linux的时间

### 查看时间和日期

命令 ： `date`

### 设置时间和日期

例如：将系统日期设定成2009年11月3日的命令

命令 ： `date -s 11/03/2009`

将系统时间设定成下午5点55分55秒的命令

命令 ：`date -s 17:55:55`

### 将当前时间和日期写入BIOS，避免重启后失效

命令 ：`hwclock -w`

## 附注

`date`

不加参数可以直接看到当前日期时间

`cal`

不加参数可以直接看到本月月历


