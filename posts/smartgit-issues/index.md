# SmartGit问题汇总

## 30天试用期到期解决方法

SmartGit可以免费试用三十天，三十天后可以通过删除配置文件来重复免费试用三十天的过程，不同版本需要删除的文件不同。

`win + R`组合键打开运行窗口，输入`%APPDATA%\syntevo\SmartGit\`然后回车会进入到SmartGit的安装路径，进入你当前使用的版本目录，如果是旧版的SmartGit（如17.2版本），删除当前的`settings.xml`文件，然后重启SmartGit即可。

如果找不到`settings.xml`文件，说明是新版本的SmartGit（如21.2版本），此时需要删除下面两个文件：

`license`和`preferences.yml`，然后重启SmartGit即可。

## 选择秘钥时不支持OPENSSH格式

某天发现用Git Bash生成的SSH key无法被SmartGit识别，提示需要PEM格式，不支持OPENSSH格式。奇怪的是之前也用同样的方法生成的key是可以被识别的，猜测要么是SmartGit版本不同导致无法支持OPENSSH格式，要么是Git Bash版本不同导致默认生成的key格式发生了变化。

<!--more-->

用编辑器打开私钥可以发现开头是`BEGIN OPENSSH PRIVATE KEY`，既然SmartGit无法支持OPENSSH格式的key，可以改用下面的命令重新生成PEM格式的SSH key：

```
ssh-keygen -m PEM -t rsa -b 4096 -C "your_email@example.com"
```

执行命令过程中一路按回车键即可。

## 参考链接

* [SmartGit一个月试用期过期的解决方法](https://blog.csdn.net/weixin_46054431/article/details/125778652?spm=1001.2101.3001.6650.5&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-125778652-blog-79452578.235%5Ev28%5Epc_relevant_t0_download&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-125778652-blog-79452578.235%5Ev28%5Epc_relevant_t0_download&utm_relevant_index=10)
* [ssh-keygen命令生成的以BEGIN OPENSSH PRIVATE KEY开头的密钥无法通过验证](http://www.panwenbin.com/ssh-keygen%E5%91%BD%E4%BB%A4%E7%94%9F%E6%88%90%E7%9A%84%E4%BB%A5BEGIN+OPENSSH+PRIVATE+KEY%E5%BC%80%E5%A4%B4%E7%9A%84%E5%AF%86%E9%92%A5%E6%97%A0%E6%B3%95%E9%80%9A%E8%BF%87%E9%AA%8C%E8%AF%81)