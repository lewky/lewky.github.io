# SSH命令问题汇总

## no matching host key type found. Their offer: ssh-dss

使用SSH登录时报错如下：

```
Unable to negotiate with 20.1.1.174 port 22: no matching host key type found. Their offer: ssh-dss
```

<!--more-->
报错原因是OpenSSH7.0之后不再支持`ssh-dss`算法，可以通过添加参数`-oHostKeyAlgorithms=+ssh-dss`来支持该算法：

```
sftp -oHostKeyAlgorithms=+ssh-dss -i id_rsa test@20.1.1.174
```

## Permissions 0644 for 'id_rsa' are too open

使用SSH登录时报错如下：

```
Permissions 0644 for 'id_rsa' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
```

这个报错是因为`id_rsa`是私钥文件，属于敏感文件，不能开放权限给其他用户组，哪怕是只读也不行，在缩小权限之前该私钥文件将一直被忽略。

通过赋予该文件400或600的权限即可成功登陆SSH：

```
chmod 400 id_rsa
chmod 600 id_rsa
```

## 参考链接

* [no matching host key type found. Their offer: ssh-dss,ssh-rsa](https://blog.csdn.net/W346850397/article/details/124826497)
* [【web渗透】私钥ssh远程登录报错：permission 0644 for ‘id_rsa‘ are too open](https://blog.csdn.net/m0_52640673/article/details/120584685)