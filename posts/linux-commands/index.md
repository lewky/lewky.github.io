# Linux常用命令

## 常用命令
<!--more-->
```bash
# 查询系统信息
uname -a

# 查CPU信息
lscpu

# 查IP
hostname -I

# 查日期
date -R
# 修改日期
date -s 11/03/2023
date -s 17:55:55

# 查当前用户
whoami

# 切root用户，需要root用户密码
su - root
# 提升为root权限，需要输入当前用户的密码
sudo -i

# 查询内存
free -h // 显示内存单位
free -m // 以MB为单位

# 查询进程
jps
ps -ef|grep java
grep -v grep // 过滤掉grep自身
pgrep prometheus // 查询当前用户下的Prometheus进程号
ps -ef|grep prometheus.yml |grep -v grep //查询Prometheus进程

# 自动创建需要的上级目录
mkdir -p

# zip压缩
zip -p -r deploy.zip deploy/ // 压缩指定目录的文件
zip -p -r deploy.zip * // 压缩当前目录所有文件
# zip解压
unzip deploy.zip // 解压到当前目录
unzip deploy.zip -d deploy/ // 解压到指定目录

# tar压缩，-z表示gzip格式
tar zcvf smart-monitor.tar.gz ./smart-monitor
# tar解压，-z表示gzip格式
tar zxvf smart-monitor.tar.gz // 解压到当前目录
tar zxvf smart-monitor.tar.gz -C ./smart-monitor // 解压到指定目录

# gzip解压
gzip -d xx.gz

# 查询网络、端口
ssh -v ip -p port
nc -vz -w 2 ip port
telnet ip port
netstat -anp|grep port

# sftp，-r表示递归
sftp user@ip
cd xx // 切换到xx目录
put xx // 传输xx文件到远程机器当前目录
put -r deploy deploy // 将deploy目录的所有文件都传输到远程机器的deploy目录
get xx // 下载远程机器的xx文件到本地
exit // 退出sftp

# scp上传文件
scp test123.xml tempusr@9.9.9.9:/home/tempusr/test/

# 移动文件，可用于重命名
mv source target

# 删除文件
rm xx
rm -rf xx // 递归删除，慎用

# 复制
cp source target

# 搜索文本关键字
grep -rn apollo.token /home/test/apps/config/config.properties // 搜索到的关键字所在行会回显在控制台
grep -rl apollo.token /home/test/apps/config/config.properties // 只会把搜索到的文件名回显在控制台

# 搜索文件
find ./ -name client.jar*

# CPU时间使用统计
top // top里的时间是分:秒
ps -ef // ps里的时间是时:分:秒

# 挂起信号，让进程重新加载配置文件
kill -1 xxx
// 让进程退出，不要用-9
kill -15 xxx
kill -9 `ps -ef|grep prometheus-2.34.0.linux-amd64|grep -v grep|awk '{print $2}'` && sleep 10

# 查询使用过的命令
history
history|grep start

# 改权限
chmod -R 755 client.jar

# 安装，需root
yum install perl
// 卸载
yum remove perl
# 查看安装软件
yum list installed|grep perl

# curl，模拟HTTP发送请求
curl -H "Content-Type: application/json" -X GET -d '{"body":"test123"}' "http://localhost:1234/test"
curl -H "Content-Type: application/json" -X POST -d '{"body":"test123"}' "http://localhost:1234/test"
curl -H "Content-Type: application/json" -X POST -d @test.json "http://localhost:1234/test" // 读取指定文件内容作为body

# telnet，可模拟TCP发送报文
telnet ip port

# 实时日志
tail -f -n 50 xx.log

# 塞满磁盘
/dev/urandom // 伪随机，但不阻塞
/dev/random  // 真随机，但阻塞
/dev/zero // 初始化
dd if=/dev/zero of=/home/apps/logs/test/filldisk bs=1M count=1G // 用1G个1M大小的块文件塞满指定磁盘

# 查看磁盘
df -h
du -h
du -d 1 -h // 统计深度为1的目录大小

# 防火墙
firewall-cmd --state
systemctl start firewalld.service
systemctl stop firewalld.service
systemctl restart firewalld.service

# 查看文件编码
file -i common.log
# 进入vi后再查看编码
vi common.log
:set fileencoding

# docker，需root用户
docker ps // 查看docker内的进程
docker exec -it xxxx bash // 进入docker部署的进程

# 远程连接机器时指定秘钥算法
ssh -c 3des-cbc user@ip

# 查看系统日志
/var/log/messages // messages日志可能滚动成多个同名日志

# aix机器可以用bash来使用便捷命令
bash

# 统计行数
netstat -anp|grep 9080|grep ESTABLISHED|wc -l
netstat -anp|grep 9080|grep TIME_WAIT|wc -l

# 边车OOM无法新建SkyWalking进程
# 查看当前用户下的max user processes数量，改大为4096
ulimit -a
cd /etc/security/limits.d/ // 需要修改当前目录下的文件
ls
vi 90-nproc.conf
// 下面是文件内的内容
*       soft    nproc   4096
root    soft    nproc   unlimited

# 改密码，需要root
passwd
# 指定修改emsp用户的密码
passwd emsp

# 在根目录查看环境变量脚本（隐藏文件）
ls -lrta .bash_profile
# 设置环境变量
. .bash_profile
```

