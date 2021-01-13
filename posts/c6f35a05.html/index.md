# Maven - settings.xml里的offline节点的作用

## 场景

某天我在本地修改了某个子项目的代码，并进行了打包：`mvn clean install -DskipTests`，接着我运行父项目却发现自己刚刚的改动并没有生效，或者说，我刚刚打包好的子项目变回了打包前的代码。

通过cmd的输出我发现在运行父项目的时候，自动下载更新了远程依赖库的子项目，因此将我本地打包修改好的子项目依赖给更新成了远程库的，这就是为什么我明明打包了本地修改好的子项目代码却没有在父项目生效的原因。
<!--more-->

## 解决方法

在maven的配置文件`settings.xml`里有个offline节点，可以通过该节点来控制是否在编译项目时自动下载远程依赖库的最新版本。注意，如果你同时有多个配置文件，必须要修改`~/.m2`下的settings.xml才有效。

```
<!-- offline
| Determines whether maven should attempt to connect to the network when executing a build.
| This will have an effect on artifact downloads, artifact deployment, and others.
|
| Default: false
<offline>false</offline>
-->
```

将配置文件里的offline节点的注释去掉并改为true，或者自己加一个：
```
<offline>true</offline>
```

当然，这样做只是为了方便本地测试而已，如果测试完毕不需要再改代码了，最好还是将该节点改为false，否则你如果在pom文件里引入了本地仓库所没有的依赖时，是不会自动帮你从远处库下载依赖的！！

## 相关的问题

offline可能会导致启动mvn项目时报错：

```
Caused by: org.eclipse.aether.transfer.ArtifactNotFoundException: Cannot access spring-releases (https://repo.spring.io/libs-release) in offline mode and the artifact org.springframework.boot:spring-boot-loader-tools:jar:2.0.5.RELEASE has not been downloaded from it before.
```

因为offline mode导致无法从线上仓库下载依赖，将offline的值改为false就行了。
