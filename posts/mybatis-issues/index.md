# MyBatis问题汇总

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

domainObjectRenamingRule该功能项是在MBG 1.3.6中新增加的功能，用于定义实体的重命名规则，常见的用途是取消表前缀。类似于columnRenamingRule，前者是重命名生成的模型对象的名称，后者是重命名表字段的名称。

如果在低于该版本的MBG中使用该功能，会出现如下错误：

```
XML Parser Error on line 59: 必须声明元素类型 "domainObjectRenamingRule"。
```

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

## 插入null值时报错

当插入的数据包含null值时报错：

```
### Cause: org.apache.ibatis.type.TypeException: Error setting null for parameter #3 with JdbcType OTHER . Try setting a different JdbcType for this parameter or a different jdbcTypeForNull configuration property. Cause: java.sql.SQLException: 无效的列类型
	at org.apache.ibatis.exceptions.ExceptionFactory.wrapException(ExceptionFactory.java:26)
	...
```

这个报错是因为MyBatis无法识别null值的类型，有两种解决方案。

### 方法一

在MyBatis的配置文件中添加`jdbcTypeForNull`的配置，通过这个全局配置来指定null值的类型：

```xml
<configuration>
    <settings>
        <setting name="jdbcTypeForNull" value="NULL" />
    </settings>
</configuration>
```

如果是在SpringBoot中使用MyBatis-Plus，则在`application.yml`中配置如下：

```
mybatis-plus:
  configuration:
    jdbc-type-for-null: 'null' #注意：单引号
```

也可以直接定义一个Bean：

```java
    @Bean
    public ConfigurationCustomizer configurationCustomizer(){
        return new MybatisPlusCustomizers();
    }

    class MybatisPlusCustomizers implements ConfigurationCustomizer {

        @Override
        public void customize(org.apache.ibatis.session.Configuration configuration) {
            configuration.setJdbcTypeForNull(JdbcType.NULL);
        }
    }
```

### 方法二

在sql中为允许插入null值的column单独指定对应的类型，如下：

```xml
<insert id="save"  
        parameterType="com.test.entity.Student">
        insert into student values(
            student_seq.nextval,
            #{name,jdbcType=VARCHAR}
        )
</insert>
```

## 参考链接

* [mybatis.generator 1.3.6中添加的domainObjectRenamingRule说明](https://blog.csdn.net/sShadow_Hunter/article/details/79743910)
* [springboot 项目mybatis plus 设置 jdbcTypeForNull （oracle数据库需配置JdbcType.NULL, 默认是Other）](https://cloud.tencent.com/developer/article/1157332)
* [oracle: jdbcTypeForNull configuration property. Cause: java.sql.SQLException: 无效的列类型: 1111](https://www.cnblogs.com/achengmu/p/11171555.html)