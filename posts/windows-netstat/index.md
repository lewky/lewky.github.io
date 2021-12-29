# Windows查询被占用的端口

## 查询被占用的端口

假如被占用的是61613端口号（activemq的），在cmd窗口中执行如下命令：

```cmd
netstat -aon|findstr "61613"
```

<!--more-->
可以看到结果如下：

```cmd
C:\Users\lewis.liu>netstat -aon|findstr "61613"
  TCP    0.0.0.0:61613          0.0.0.0:0              LISTENING       30400
  TCP    [::]:61613             [::]:0                 LISTENING       30400
```

这说明61613端口号被PID为30400的进程占用了。

## 查看指定PID的进程

可以查询是哪个进程或者程序占用了该端口：

```cmd
tasklist|findstr "30400"
```

可以看到结果如下：

```cmd
C:\Users\lewis.liu>tasklist|findstr "30400"
java.exe                     30400 Console                    5    198,396 K
```

## 杀死指定PID的进程

强制（/F参数）杀死PID为30400的所有进程包括子进程（/T参数）：

```cmd
taskkill /T /F /PID 30400
```

也可以在任务管理器里借助PID来找到对应的进程或程序，然后手动点结束进程。

## 参考链接

* [Windows下如何查看某个端口被谁占用](https://www.runoob.com/w3cnote/windows-finds-port-usage.html)