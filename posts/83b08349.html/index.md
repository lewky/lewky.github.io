# Maven - 使用阿里云国内镜像提高jar包下载速度

转载自：[maven(八)，阿里云国内镜像，提高jar包下载速度](https://blog.csdn.net/wangb_java/article/details/55653122)

## 镜像

由于Maven默认是从中央仓库去下载的jar包，该仓库在国外，且全世界都从该仓库下载，所以下载速度会很慢。镜像就相当于中央仓库的一个副本，内容和中央仓库完全一样，目前有不少国内镜像，其中阿里云算是比较稳定的，同时也能保证下载速度。
<!--more-->

## 配置方法

在Maven的安装目录下找到`conf/settings.xml`，打开该文件，找到`mirrors`节点，添加一个国内镜像。

```xml
<mirrors>  
    <mirror>  
        <id>alimaven</id>  
        <name>aliyun maven</name>  
        <url>http://maven.aliyun.com/nexus/content/groups/public/</url>  
        <mirrorOf>central</mirrorOf>          
    </mirror>  
</mirrors> 
```

添加之后，如果使用了Eclipse的话需要重启才能生效。使用了阿里云镜像后，jar包的下载速度会快很多。

## Nexus私服

在阿里云下载路径中，可以看到有一个Nexus，它实际上是一个Nexus私服。我们也可以在公司内网中部署一个这样的Nexus私服，项目成员可以直接从内网下载jar包，内网通常比从镜像下载速度更快，而且不用连外网。
