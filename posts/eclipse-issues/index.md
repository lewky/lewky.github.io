# Eclipse问题汇总

## Access restriction: The type 'JPEGCodec' is not API

导入项目时Eclipse报错如下：
```
Access restriction: The type 'JPEGCodec' is not API (restriction on required library 'C:\Program Files\Java\jdk1.8.0_191\jre\lib\rt.jar')
```

第一次遇到这种错误，百度了下，原来是因为Eclipse默认把访问受限的API设置成了Error级别，所以才会编译报错。
<!--more-->

### 解决方法一（推荐）

直接将项目的JRE给remove掉，然后再重新将JRE添加到项目中，操作如下：

1. 右键项目，选择Properties -> Java Build Path -> Libraries -> 选中JRE System Library [jdkxxxx] -> 选择`Remove`
2. 接着选择`Add Librariy...`，重新加入JRE

### 解决方法二

修改Eclipse中关于访问受限的API的编译级别：

Window -> Preferences -> Java -> Compiler -> Errors/Warnings，选择`Deprecated and restricted API`，将其中的`Forbidden reference(access rules)`的级别选为Warning。

## 缺少servlet-api.jar包

在Eclipse中缺省servlet-api.jar包，由于servlet-api.jar以及jsp-api.jar这两个jar包含在Apache Tomcat中，所以提示这两个包缺省而出现错误的情况下，执行Build Path -> Configure Build path -> Libraries -> Add Library -> server Runtime就可以了。

## 怎么设置在启动时提示选择工作空间

1. Window -> Preferences -> General -> Startup and Shutdown -> Workspaces
2. 勾选`Prompt for workspace on startup

## 如何在新的工作空间使用原来的配置(编码、视图、快捷键、插件设置等)

Eclipse如果更换一个新的工作空间，需要重新设置视图、配置等一系列东西，算是想到麻烦的一件事情，其实我们完全可以将旧的工作空间里的配置拷贝到新的工作空间里，这样就可以省去重新配置的麻烦了~ 

具体操作如下：

在`${workspace(你电脑里原本的工作空间目录)}/.metadata/.plugins`里有这样两个文件夹：`org.eclipse.core.runtime`和`org.eclipse.ui.workbench`，将新的工作空间里的同名文件夹删了，再将这两个文件夹复制到新的工作空间就行了！

`org.eclipse.core.runtime`：保存着Eclipse的用户配置，包括视图、编码、各种插件的配置(window下的preference里边的插件配置)等

`org.eclipse.ui.workbench`：保持着ui上的配置，包括上方的快捷工具栏和下方的view窗口等

如果不知道自己正在使用的工作空间在哪个目录下，请点击Eclipse左上角的`File→switch workspace→other`，显示的就是当前工作空间的目录。另外，在这里有个`copy setting`，可以选择转换到新的工作空间时拷贝原本的配置，但这里拷贝的其实只是`org.eclipse.ui.workbench`，缺少了`org.eclipse.core.runtime`，所以这种方法会丢失部分配置。

另外不要没事就随便转换工作空间，Eclipse容易崩溃_(:3」∠)_

## 接口实现类里使用@Override注解报错

@Override注解用来检测子类对父类或接口的方法的重写是否正确，但有一次我在Eclipse里对接口的实现类里使用@Override注解却报错，不过在父类的子类里使用该注解却是正常的。

百度了下才知道原来这是jdk1.5时的一个bug，在1.6时已经被修复；那么问题来了，我使用的jdk是1.8，为什么会报这个错误？明明之前也在接口的实现类里用过该注解，却没问题。由于Eclipse经常抽风，我怀疑是Eclipse的问题，经过排查确实如此，该项目使用的jdk版本不知道为什么变成了jdk1.5，导致出现了注解报错的问题。

### 解决方法

右键该项目，选择Properties，将Java Compiler和Java Facets里的jdk版本从1.5改为更高的版本，再刷新下项目重新编译就没问题了。`

## 修改默认编码为utf-8

一共需要设置三个地方：

1. Window -> Preferences -> General -> Content Type -> Text -> JSP，在 最下面设置为UTF-8
2. Window -> Preferences -> General -> Workspace，将`Text file encoding`设置为UTF-8
3. Window -> Preferences -> Web -> JSP Files，设置为`ISO 10646/Unicode(UTF-8)`

## 修改properties文件的编码

Eclipse的properties文件是默认ISO-8859-1编码的，如果在properties里输入中文会导致乱码，此时需要修改其编码为utf-8，具体步骤如下：

`Window -> Preferences -> General -> Content Types -> Text`，然后单击`Java Properties Files`，选定下方的`*.properties(locked)`，接着将最下方的ISO-8859-1改为utf-8，然后点击旁边的 `Update`，最后点击OK。

## 如何修改web项目的web module version

有时候我们想改变web项目的web module version，比如说原本是2.4版本，我们想改成3.0版本，通过右键项目名 -> Properties -> Project Facets，选中Dynamic Web Module后边的版本，将2.4改成3.0

这时候会报错误：`Cannot change version of project facet Dynamic Web Module to 3.0.`

而且这时候改动web.xml的文件头从2.4改成3.0版本的文件头也会报错。

### 解决办法

1. 这时候我们需要找到该项目的目录，进入.setting文件夹，打开org.eclipse.wst.common.project.facet.core.xml
2. 我们可以发现在这个xml文件中，有这样一个标签：
```xml
<installed facet="jst.web" version="2.4"/>
```
3. 将这里的version改成你想要的版本，比如改成3.0
4. 保存该文件的改动，接着刷新Eclipse中的该项目(左键选中项目名，按F5刷新项目)
5. 接着再去Properties -> Project Facets ， 将Dynamic Web Module改为3.0；然后将web.xml的文件头改为对应3.0版本的文件头；此时会发现可以修改成功而不会报错。

## Maven项目Update Project后jdk版本变成1.5

在Eclipse里对一个Maven项目进行Update Project(快捷键是 `Alt+F5`)，原本jdk为1.8的项目忽然就变成了1.5，于是就报了一些错误。

这跟Maven默认的jdk版本有关系，Maven项目如果不指定编译的jdk版本，就会默认为jdk1.5。查了下项目的pom文件，里边并没有指定编译的jdk版本，而Maven的配置文件settings.xml里也没有指明jdk版本，所以当Update Project后，这个Maven项目就会自动变成jdk1.5了。

有两种解决方法，一种是针对某个Maven项目而言，直接在pom文件中指明jdk版本；一种是全局设置，为所有Maven项目指明jdk版本。

### 方法一：在pom文件中指明jdk版本

在项目的pom.xml中的build节点里使用maven的编译插件来指定jdk版本，项目中通常使用这种方法来指定，因为比较灵活，可以随意指定版本，修改保存后即可生效。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.1</version>
            <configuration>
            <encoding>UTF-8</encoding>
            <source>1.8</source>
            <target>1.8</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 方法二：修改settings.xml文件

找到Maven的安装路径，打开`conf\settings.xml`，找到`profiles`节点，在该节点下添加一个`profile`节点：

```xml
<profile>
    <id>jdk-1.8</id>
    <activation>
    <jdk>1.8</jdk>
    <activeByDefault>true</activeByDefault>
    </activation>
    <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
    </properties>
</profile>
```

使用这种方法的好处是所有Maven项目都会按照这里的jdk版本来编译，当然如果在pom文件里也指定了jdk版本，则以pom里的为准。**这种全局修改的方法必须要重启Eclipse才有效果**。

个人建议就算是修改了全局配置，也要在每个Maven项目里指明jdk版本，这是种良好的规范，利于别人理解。

## 安装了jd-eclipse插件后依然无法反编译类文件

Eclipse在安装了jd-eclipse插件后依然无法反编译类文件，这个问题是因为没有修改默认的类文件查看器。需要修改默认的类文件查看器为jd-eclipse：
1. Window -> Preference -> General -> Editors -> File Associations
2. 选中`*.class`，将`Class File Editor`设置为默认(Default)
3. 选中`*.class without source`，将`Class File Editor`设置为默认(Default)；如果这一步操作只有`Class File Viewer`，则需要点击`Add`把`Class File Editor`添加进来并设置为默认(Default)

新版本的jd-eclipse的类文件查看器名字可能叫做JD Class File Viewer(总之，Class File Viewer是Eclipse自带的类文件查看器，安装插件后会出现新的类文件查看器)

接着重启Eclipse后就可以正常地反编译类文件了，如果缺少上述的第三步操作，会有比较大的可能依然无法反编译类文件。

## Eclipse无法找到MapStruct生成的mapper实现类

Eclipse本身不支持MapStruct，除了需要安装较新版本的m2e插件，还要另外安装插件`m2e-apt`，该插件可以在Eclipse的Market里搜到。

接着在pom文件里添加：
```
<properties>
        <m2e.apt.activation>jdt_apt</m2e.apt.activation>
</properties>
```

然后maven update一下项目，重新编译后会在target目录下出现两个文件目录，里面存放的是MapStruct的生成类。

如果这时候还没效果，要手动打开apt的功能。邮件项目，选择`Properties` -> `Maven` -> `Annotation Processing` -> 勾选`Enable project specific settings` -> 选择第一个选项`Automatically config JDT APT` -> `Apply and Close`

## 弹窗提示 code recommenders cannot download its model repository index

原因是该插件的model地址`http://download.eclipse.org/recommenders/models/oxygen/`已经被移除了，且很久没有更新了，最新版的Eclipse里已经把该地址移除了，旧版本的需要自行移除：

`Window` -> `Preferences` -> `Code Recommenders` -> `Models` -> 选中这里面的地址，然后点击`Remove`即可。

## Eclipse无法搜索到本地仓库的jar包

某次忽然发现无法在Eclipse中搜索到刚刚install好的jar包，来回折腾了好久也无法解决。百度后才知道原因，其实每次打开Eclipse时都会自动更新index索引，可能是出了某种未知的问题，自动更新index失败了，由于index缺失导致无法定位到本地install的新jar包。所以我们需要在Eclipse里手动更新下maven的index索引。

解决方法如下：

1. 打开Eclipse的Maven仓库视图：`Window` -> `Show View` -> `Other...` -> `Maven Repositories`
2. 找到你的本地仓库并重建索引：`Local Repositories` -> `Local Repository` -> 右键，选择`Rebuild Index`
3. 更新完索引后就可以搜索到本地库里最新的jar包了

如果想搜索远程库的最新依赖(jar包)，操作类似：
1. 在Maven仓库视图里：`Global Repositories` -> 选定某个远程库 -> 右键，选择`Update Index`
2. 更新完索引后就可以搜索到远程库里最新的jar包了

## 启动SpringBoot项目报错： Error: Could not find or load main class

在Eclipse里对一个SpringBoot项目选择`Run As` -> `Maven clean`后，通过启动类启动该项目时报错如下：

```java
Error: Could not find or load main class
```

解决方法是clean该项目并重新编译，再次启动时选择`Run As` -> `Java Application`，启动成功。

还有另一个会触发该错误的方式：

在Eclipse里启动SpringBoot项目的时候，右键启动类，选择`Run As`，此时手误点成了`Run on Server`，之后就一直启动报错如下：

```java
Error: Could not find or load main class
```

解决方法同上。

## 参考链接

* [解决办法：Access restriction: The type JPEGImageEncoder is not accessible due to restriction](https://blog.csdn.net/free4294/article/details/7017442)
* [缺少servlet-api.jar包](http://blog.sina.com.cn/s/blog_6cfb18070100n7pu.html)
* [怎样设置Eclipse在启动时提示选择工作空间](https://jingyan.baidu.com/article/27fa732682e3f446f8271f26.html)
* [maven 修改默认的JDK版本](https://www.cnblogs.com/bianqi/p/6819074.html)
* [Maven管理项目的时候 Update Project后jre变成1.5](https://blog.csdn.net/Ashes18/article/details/70488617)
* [安装jadClipse插件后,还是不能反编译.class](https://zhidao.baidu.com/question/152315060.html)
* [mapstruct在eclipse生成不了mapper的实现类的问题](https://blog.csdn.net/u014519194/article/details/54410391)
* [eclipse 报错 code recommenders cannot download its model repository index-已解决](https://blog.csdn.net/sjc170/article/details/102961231)
* [在eclipse的maven插件中搜寻本地仓库中的jar搜索不到的解决方案](https://blog.csdn.net/weixin_34289744/article/details/86033158)