# MyBatis逆向工程中domainObjectRenamingRule报错或无效

##  使用domainObjectRenamingRule报错

在使用MyBatis逆向工程时报错如下：
```
org.mybatis.generator.exception.XMLParserException: XML Parser Error on line 43: 必须声明元素类型 "domainObjectRenamingRule"。
    at org.mybatis.generator.config.xml.ConfigurationParser.parseConfiguration(ConfigurationParser.java:121)
    at org.mybatis.generator.config.xml.ConfigurationParser.parseConfiguration(ConfigurationParser.java:82)
    at org.mybatis.generator.config.xml.ConfigurationParser.parseConfiguration(ConfigurationParser.java:74)
    at GeneratorSqlmap.generator(GeneratorSqlmap.java:22)
    at GeneratorSqlmap.main(GeneratorSqlmap.java:32)
```
<!--more-->

>domainObjectRenamingRule该功能项是在MBG 1.3.6中新增加的功能，用于定义实体的重命名规则，常见的用途是取消表前缀。类似于columnRenamingRule，前者是重命名生成的模型对象的名称，后者是重命名表字段的名称。
>如果在低于该版本的MBG中使用该功能，会出现如下错误XML Parser Error on line 59: 必须声明元素类型 "domainObjectRenamingRule"。

## 使用domainObjectRenamingRule无效

配置好了domainObjectRenamingRule后，运行逆向工程却无效果，原因是searchString的值配置不对。
根据表名来生成的类名是按照驼峰命名法，生成的类名首字母是大写的。而searchString是区分大小写的，并且它的值是Java里的正则表达式。

举个例子，现在有个表叫`tb_vq`，我希望生成的类名是Vq，而不是TbVq，可以通过`domainObjectRenamingRule`来实现这个功能，配置如下：
```xml
<table tableName="tb_vq" schema="" enableCountByExample="false"
enableDeleteByExample="false" enableUpdateByExample="false"
enableSelectByExample="false" selectByExampleQueryId="false">
    <domainObjectRenamingRule searchString="^Tb" replaceString="" />
</table>
```

需要注意的是，这里的searchString必须填`^Tb`，这是个Java正则表达式，这里不能写成`^tb`，必须首字母大写，否则匹配不上，另外为了避免匹配出错，这里使用了`^Tb`而不是`Tb`。

## 参考链接

* [mybatis.generator 1.3.6中添加的domainObjectRenamingRule说明](https://blog.csdn.net/sShadow_Hunter/article/details/79743910)
