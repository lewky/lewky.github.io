# shell脚本常用语法

## 常用语法

<!--more-->
```bash
# 脚本的第一行申明是bash脚本
#!/bin/bash

# 获取进程id
pid=$(ps -ef|grep -v grep|grep java|awk '{print $2}')

# echo，输出文本到控制台，-n表示输出末尾不换行
echo "flag is true"
echo -n "flag is true"

# 多行条件判断，-z表示值为空，-n表示值不为空
# [[]]是[]的扩展语法，支持一些更高级的功能，但需要在bash环境中（`#!/bin/bash`）使用
if [[ -n "$sys" ]]; then
    sysType="x86";
    sys=`uname -a |grep aarch64`
elif [[ -n "$sys" ]]; then
    sysType="aarch64";
    sys=`uname -a |grep AIX`
elif [[ -n "$sys" ]]; then
    sysType="aix";
fi

# 单行条件判断，&&逻辑与，后面可以接另一个命令
[[ $flag == true ]] && echo -n "flag is true"

# 循环
time=5
for ((i=1;i<=$time;i++)); do
    [[ $isEcho == true ]] && echo -n "$i秒"
    sleep 1
done

# 读取用户输入
while true
do
    read -p "请输入y/n，[y继续将忽略/n退出]：" inpt
    case $inpt in
        y)
            exit 0
        ;;
        n)
            exit 1
        ;;
        *)
            echo -n "输入错误"
        ;;
    esac
done

# 获取调用当前脚本时的输入参数，按顺序$1、$2、$3……
# $0：脚本本身的名字
# $@：传给脚本的所有参数的列表
# $$：脚本运行的当前进程ID号
# $?：显示最后命令的退出状态，0表示没有错误，其他表示有错误
deployEnv=$1;
systemId=$2;
terminalId=$3;

sh test.sh
[[ $? != 0 ]] && exit 1

# 字符串大小写转换
deployEnv="test";
# 首字母变为大写
deployEnv=${deployEnv^}
# 全部变为大写
deployEnv=${deployEnv^^}
# 首字母变为小写
deployEnv=${deployEnv,}
# 全部变为小写
deployEnv=${deployEnv,,}

# tr命令转换大小写
# 小写转大写
echo test|tr '[a-z]' '[A-Z]'
# 大写转小写
echo test|tr '[A-Z]' '[a-z]'

# awk配合toupper()或tolower()进行大小写转换
echo test|awk '{print toupper($0)}'
echo TEST|awk '{print tolower($0)}'

# 函数定义
APP_DIR=/test
APP=test.jar
checkpid() {
    javaps=`jps -l | grep $APP_DIR/$APP`
    if [ -n "$javaps" ]; then
        psid=`echo $javaps | awk '{print $1}'`
    else
        psid=0
    fi
}
# 函数调用
checkpid

```

## 参考链接

* [[Linux] shell编程之文本字母大小写转换【转载】](https://www.cnblogs.com/johnnyzen/p/17676971.html)