# SmartGit - 选择秘钥时不支持OPENSSH格式

## 问题与解决方法

某天发现用Git Bash生成的SSH key无法被SmartGit识别，提示需要PEM格式，不支持OPENSSH格式。奇怪的是之前也用同样的方法生成的key是可以被识别的，猜测要么是SmartGit版本不同导致无法支持OPENSSH格式，要么是Git Bash版本不同导致默认生成的key格式发生了变化。

<!--more-->

用编辑器打开私钥可以发现开头是`BEGIN OPENSSH PRIVATE KEY`，既然SmartGit无法支持OPENSSH格式的key，可以改用下面的命令重新生成PEM格式的SSH key：
```
ssh-keygen -m PEM -t rsa -b 4096 -C "your_email@example.com"
```

## 参考链接

[ssh-keygen命令生成的以BEGIN OPENSSH PRIVATE KEY开头的密钥无法通过验证](http://www.panwenbin.com/ssh-keygen%E5%91%BD%E4%BB%A4%E7%94%9F%E6%88%90%E7%9A%84%E4%BB%A5BEGIN+OPENSSH+PRIVATE+KEY%E5%BC%80%E5%A4%B4%E7%9A%84%E5%AF%86%E9%92%A5%E6%97%A0%E6%B3%95%E9%80%9A%E8%BF%87%E9%AA%8C%E8%AF%81)