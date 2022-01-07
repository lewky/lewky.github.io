# lombok问题汇总

## Eclipse安装lombok插件

### 方式一

使用lombok框架开发可以减少大量重复性的代码，大大提高开发效率，但是Eclipse本身并不支持lombok，会编译报错。除了项目要导入lombok依赖，还需要为Eclipse安装该lombok插件。

安装方法很简单，找到你导入的lombok的jar包，双击运行该jar包，会出现一个安装界面。或者右键jar包，选择`打开方式`，接着选择`Java (TM) Platform SE binary`，会出现安装界面。

在安装界面选择当前的Eclipse进程，或者点击左下角的`Specify location...`选择你要安装插件的Eclipse，接着点右下角的`Install / Update`，很快就安装完毕，点击`Quit Installer`。

lombok的下载地址：https://projectlombok.org/downloads/lombok.jar
<!--more-->

### 方式二

通过jar包的方式来安装，实际上只是在eclipse的配置文件`eclipse.ini`中添加了一行启动参数，我们也可以自己手动添加来实现安装lombok插件的目的：

```
-javaagent:.\lombok-1.18.6.jar
```

这里的`-javaagent`参数后面是lombok的jar包目录。

## 在Eclipse里@Slf4j和@Data无效

在Eclipse安装好lombok之后，虽然能够正常识别@Slf4j注解生成的log变量，但@Data注解依然无效：在使用到了pojo类的私有变量时，依然会提示说缺少setter/getter方法。折腾了好久，才发现原来是因为Eclipse自动给我的pojo类的私有变量加上`final`修饰符，导致setter/getter方法注入失败了。

把pojo类的私有变量前边的final去掉后，@Data终于生效了。之所以会自动给变量加上final修饰符，是因为我设置了Save Action，Eclipse会自动在我保存代码的时候自动在私有变量、局部变量前加上final修饰符，这个是公司制定的代码编程规范。

## @EqualsAndHashCode

该注解默认使用当前类的非静态、非瞬态的属性来生成`equals(Object other)`和`hashCode()`方法，而`@Data`本身包括了这个`@EqualsAndHashCode`注解。

如果一个pojo继承了其他pojo，通常是需要使用到父类里的公共字段，这时候应该使用父类的字段来参与生成`equals(Object other)`和`hashCode()`方法，此时需要将`callSuper`设为true，如下：

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class ItemDto extends BaseEntityDto {

    private String name;

}
```

## 腾讯云声明

我的博客即将同步至腾讯云+社区，邀请大家一同入驻：https://cloud.tencent.com/developer/support-plan?invite_code=3paqcjjzio4k8

## 参考链接

* [lombok @EqualsAndHashCode 注解的影响](https://blog.csdn.net/zhanlanmg/article/details/50392266)