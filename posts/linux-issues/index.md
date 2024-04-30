# Linux问题汇总

## bad interpreter: No such file or directory

在Windows环境下用Notepad++写了个shell脚本，上传到Linux平台后运行报错如下：

```shell
/bin/sh^M: bad interpreter: No such file or directory
```
<!--more-->

经过查阅资料才知道，这是文件格式导致的问题：使用vi/vim进入该shell文件，按下`:`进入末行模式，输入`set ff`查询文件格式，结果如下：

```shell
fileformat=dos
```

不同的操作系统使用了不同的符号来换行，可以简单参考下下面的表格：

|系统|换行符|
|:-:|:-:|
|DOS|CR/LF|
|UNIX|LF|
|MAC|CR|

如果通过Windows下的Git将文件提交到Linux上的服务器，也会收到换行符将被替换的消息通知。而解决方法也很简单，切换文件格式即可，如下：

通过vi/vim进入想要修改的文件，按下`:`进入末行模式，输入`set fileformat=unix`，接着按下`ZZ`或者按下`shift + z + z`或者输入`:x`或者`:wq`保存修改即可。

## 判断网络是否连通

### ssh命令

有个通用命令，Windows和Linux都能使用，如下：

```shell
ssh ip -v -p port
```

`-v`表示调试模式，会打印出具体日志。`-p`表示端口号。如果网络连通则会打印出来连接已建立`Connection established`。如下：

```shell
C:\Users\10191>ssh localhost -v -p 1313
OpenSSH_for_Windows_8.1p1, LibreSSL 3.0.2
debug1: Connecting to localhost [::1] port 1313.
debug1: connect to address ::1 port 1313: Connection refused
debug1: Connecting to localhost [127.0.0.1] port 1313.
debug1: Connection established.
debug1: identity file C:\\Users\\10191/.ssh/id_rsa type 0
debug1: identity file C:\\Users\\10191/.ssh/id_rsa-cert type -1
debug1: identity file C:\\Users\\10191/.ssh/id_dsa type -1
debug1: identity file C:\\Users\\10191/.ssh/id_dsa-cert type -1
debug1: identity file C:\\Users\\10191/.ssh/id_ecdsa type -1
debug1: identity file C:\\Users\\10191/.ssh/id_ecdsa-cert type -1
debug1: identity file C:\\Users\\10191/.ssh/id_ed25519 type -1
debug1: identity file C:\\Users\\10191/.ssh/id_ed25519-cert type -1
debug1: identity file C:\\Users\\10191/.ssh/id_xmss type -1
debug1: identity file C:\\Users\\10191/.ssh/id_xmss-cert type -1
debug1: Local version string SSH-2.0-OpenSSH_for_Windows_8.1
debug1: kex_exchange_identification: banner line 0: HTTP/1.1 400 Bad Request
debug1: kex_exchange_identification: banner line 1: Content-Type: text/plain; charset=utf-8
debug1: kex_exchange_identification: banner line 2: Connection: close
debug1: kex_exchange_identification: banner line 3:
kex_exchange_identification: Connection closed by remote host
```

### nc命令

如果服务器里无法使用ssh命令，可以使用下面的命令：

```shell
nc -vz -w 2 ip port
```

`-v`表示可视化，`-z`扫描时不发送数据，`-w`后面跟的数字表示超时几秒。用法如下：

```shell
// 端口能通
C:\Users\10191>nc -vz -w 2 1.2.3.70 8888
1.2.3.70 (1.2.3.70:8888) open

// 端口不能通
C:\Users\10191>nc -vz -w 2 1.2.3.70 8889
nc: 1.2.3.70 (1.2.3.70:8889): Operation timed out
```

## 查看端口是否启用

### lsof命令

该命令用于列出系统已经打开的所有文件，在Linux中任何事物都以文件形式存在，通过文件可以访问常规数据、网络连接和硬件等。但该命令需要访问核心内存和各种文件，因此需要root用户执行。

```shell
lsof -i:port

// 查39007端口是否启用
lsof -i:39007
```

### netstat命令

```shell
netstat -aptn

// 查39007端口是否启用
netstat -aptn | grep 39007
```

## 查看和修改Linux的时区

### 查看当前时区

```
date -R
```

### 修改设置Linux服务器时区

```
// Linux通用
tzselect

// 仅限于RedHat Linux 和 CentOS
timeconfig

// 适用于Debian
dpkg-reconfigure tzdata
```

### 复制相应的时区文件，替换系统时区文件；或者创建链接文件

```
cp /usr/share/zoneinfo/$主时区/$次时区 /etc/localtime

// demo：设置中国时区使用亚洲/上海(+8)
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

## 查看和修改Linux的时间

### 查看时间和日期

```
date
```

### 设置时间和日期

```
// 将系统日期设定成2009年11月3日的命令
date -s 11/03/2009

// 将系统时间设定成下午5点55分55秒的命令
date -s 17:55:55
```

### 将当前时间和日期写入BIOS，避免重启后失效

```
hwclock -w
```

### 附注

```
// 不加参数可以直接看到当前日期时间
date

// 不加参数可以直接看到本月月历
cal
```

## vi/vim打开文件提示Found a swap file by the name

### swap文件来源

在使用vi或vim命令打开一个文件后，就会产生一个.(filename).swp的文件。如果编辑完成之后，正常退出，那么这个swp文件就会被自动删除。但是如果在操作该文件时发生了异常中断(非正常退出)，就会在当前目录下生成了一个对应的`swp`文件。

在Linux中，以`.`开头的文件都是隐藏文件，可以通过使用`ll -a`或者`ls -a`来查看。

而这种swp文件是隐藏文件，有两个作用：

* 避免用多个程序编辑同一个文件时，产生两个不同的版本。
* 非常规退出时，文件恢复。

### 删除swp文件

只要将swp文件删除，就不会再出现这个提示。可以通过`rm`命令来删除该文件。

### 禁止生成swp文件

如果想要禁止生成swp文件，可以通过修改vim的配置文件来实现。新建一个`~/.vimrc`文件，在文件中添加一行代码：

```bash
set noswapfile
```

这样该配置就只会对当前用户生效，你也可以直接修改`/etc/vimrc`文件，效果是一样的。

### 通过swp文件来恢复文件

swp文件可以用来恢复文件，假如你有一个swp文件`.my.ini.swp`，可以通过以下命令来恢复：

```bash
vi -r my.ini
```

恢复文件之后可以把swp文件删除，不然每次打开my.ini文件时都会提示。

## Linux命令英文全称

```
su：Swith user  切换用户，切换到root用户
cat: Concatenate  串联
uname: Unix name  系统名称
df: Disk free  空余硬盘
du: Disk usage 硬盘使用率
chown: Change owner 改变所有者
chgrp: Change group 改变用户组
ps：Process Status  进程状态
tar：Tape archive 解压文件
chmod: Change mode 改变模式
umount: Unmount 卸载
ldd：List dynamic dependencies 列出动态相依
insmod：Install module 安装模块
rmmod：Remove module 删除模块
lsmod：List module 列表模块
alias :Create your own name for a command
bash :GNU Bourne-Again Shell  linux内核 
grep:global regular expression print
httpd :Start Apache
ipcalc :Calculate IP information for a host
ping :Send ICMP ECHO_Request to network hosts
reboot: Restart your computer
sudo:Superuser do

/bin = BINaries 
/dev = DEVices 
/etc = ETCetera 
/lib = LIBrary 
/proc = PROCesses 
/sbin = Superuser BINaries 
/tmp = TeMPorary 
/usr = Unix Shared Resources 
/var = VARiable ? 
FIFO = First In, First Out 
GRUB = GRand Unified Bootloader 
IFS = Internal Field Seperators 
LILO = LInux LOader 
PS = Prompt String 
Perl = "Pratical Extraction and Report Language" = "Pathologically Eclectic Rubbish Lister" 
Tcl = Tool Command Language 
Tk = ToolKit 
VT = Video Terminal 
YaST = Yet Another Setup Tool 
apt = Advanced Packaging Tool 
ar = archiver 
as = assembler 
bash = Bourne Again SHell 
bc = Basic (Better) Calculator 
bg = BackGround 
cal = CALendar 
cat = CATenate 
cd = Change Directory 
chgrp = CHange GRouP 
chmod = CHange MODe 
chown = CHange OWNer 
chsh = CHange SHell 
cmp = compare 
cobra = Common Object Request Broker Architecture 
comm = common 
cp = CoPy 
cpio = CoPy In and Out 
cpp = C Pre Processor 
cups = Common Unix Printing System 
cvs = Current Version System 
dc = Desk Calculator 
dd = Disk Dump 
df = Disk Free 
diff = DIFFerence 
dmesg = diagnostic message 
du = Disk Usage 
ed = editor 
egrep = Extended GREP 
elf = Extensible Linking Format 
elm = ELectronic Mail 
emacs = Editor MACroS 
eval = EVALuate 
ex = EXtended 
exec = EXECute 
fd = file descriptors 
fg = ForeGround 
fgrep = Fixed GREP 
fmt = format 
fsck = File System ChecK 
fstab = FileSystem TABle 
fvwm = F*** Virtual Window Manager 
gawk = GNU AWK 
gpg = GNU Privacy Guard 
groff = GNU troff 
hal = Hardware Abstraction Layer 
joe = Joe's Own Editor 
ksh = Korn SHell 
lame = Lame Ain't an MP3 Encoder 
lex = LEXical analyser 
lisp = LISt Processing = Lots of Irritating Superfluous Parentheses 
ln = LiNk 
lpr = Line PRint 
ls = list 
lsof = LiSt Open Files 
m4 = Macro processor Version 4 
man = MANual pages 
mawk = Mike Brennan's AWK 
mc = Midnight Commander 
mkfs = MaKe FileSystem 
mknod = MaKe NODe 
motd = Message of The Day 
mozilla = MOsaic GodZILLa 
mtab = Mount TABle 
mv = MoVe 
nano = Nano's ANOther editor 
nawk = New AWK 
nl = Number of Lines 
nm = names 
nohup = No HangUP 
nroff = New ROFF 
od = Octal Dump 
passwd = PASSWorD 
pg = pager 
pico = PIne's message COmposition editor 
pine = "Program for Internet News & Email" = "Pine is not Elm" 
ping =  Packet InterNet Grouper 
pirntcap = PRINTer CAPability 
popd = POP Directory 
pr = pre 
printf = PRINT Formatted 
ps = Processes Status 
pty = pseudo tty 
pushd = PUSH Directory 
pwd = Print Working Directory 
rc = runcom = run command, shell 
rev = REVerse 
rm = ReMove 
rn = Read News 
roff = RunOFF 
rpm = RPM Package Manager = RedHat Package Manager 
rsh, rlogin, = Remote 
rxvt = ouR XVT 
sed = Stream EDitor 
seq = SEQuence 
shar = SHell ARchive 
slrn = S-Lang rn 
ssh = Secure SHell 
ssl = Secure Sockets Layer 
stty = Set TTY 
su = Substitute User 
svn = SubVersioN 
tar = Tape ARchive 
tcsh = TENEX C shell 
telnet = TEminaL over Network 
termcap = terminal capability 
terminfo = terminal information 
tr = traslate 
troff = Typesetter new ROFF 
tsort = Topological SORT 
tty = TeleTypewriter 
twm = Tom's Window Manager 
tz = TimeZone 
udev = Userspace DEV 
ulimit = User's LIMIT 
umask = User's MASK 
uniq = UNIQue 
vi = VIsual = Very Inconvenient 
vim = Vi IMproved 
wall = write all 
wc = Word Count 
wine = WINE Is Not an Emulator 
xargs = eXtended ARGuments 
xdm = X Display Manager 
xlfd = X Logical Font Description 
xmms = X Multimedia System 
xrdb = X Resources DataBase 
xwd = X Window Dump 
yacc = yet another compiler compiler
```

## 参考链接

* [bash: ./a.sh: /bin/bash^M: bad interpreter: No such file or directory的解决方法](https://blog.csdn.net/youzhouliu/article/details/79051516)
* [DOS、Mac 和 Unix 文件格式+ UltraEdit使用](https://www.cnblogs.com/yelongsan/p/10025134.html)
* [DOS文件转换成UNIX文件格式详解](https://www.cnblogs.com/chengd/p/7809430.html)
* [Linux系统查看当前时间的命令](https://blog.csdn.net/evilcry2012/article/details/54315170)
* [linux下vi操作Found a swap file by the name](http://chenzhou123520.iteye.com/blog/1313585)
* [非正常关闭vi编辑器时会生成一个.swp文件](https://www.cnblogs.com/quchunhui/p/7513586.html)
* [Linux怎么查看端口是否启用](https://m.php.cn/article/490780.html)