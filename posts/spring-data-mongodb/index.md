# Spring Data MongoDB问题汇总

## 前言

Spring Data除了常用的JPA（Hibernate）关系型数据库的模块外，还有其他用于非关系型数据库的数据交互模块：比如Redis、MongoDB、Elasticsearch等。

用法和JPA模块类似，都需要定义对应的POJO、Repository，同时也提供了对应的数据库工具模板类：如RedisTemplate、MongoTemplate等。

本文基于以下版本：

```
<!--  对应的是4.1.1版本的MongoDB -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
    <version>2.4.0</version>
</dependency>
```

这是MongoDB官网用户手册的翻译文档仓库：[MongoDB-4.2-Manual](https://github.com/mongodb-china/MongoDB-4.2-Manual)
<!--more-->
## 忽略某个字段

和JPA-Hibernate类似，使用`@Transient`即可。注意不能使用`javax.persistence.Transient`，这个是JPA规范的注解，对Spring Data MongoDB无效，需要使用`org.springframework.data.annotation.Transient`。

## 移除_class字段

Spring Data在查询MongoDB时会自动添加`_class`字段，可以用以下方式移除：

```java

@Configuration
public class MongoDBConfig {

    @Bean
    public MappingMongoConverter mappingMongoConverter(MongoDbFactory factory, MongoMappingContext context, BeanFactory beanFactory) {
        DbRefResolver dbRefResolver = new DefaultDbRefResolver(factory);
        MappingMongoConverter mappingConverter = new MappingMongoConverter(dbRefResolver, context);
        try {
            mappingConverter.setCustomConversions(beanFactory.getBean(CustomConversions.class));
        } catch (NoSuchBeanDefinitionException ignore) {
 
        }
        
        // 取消_class字段
        mappingConverter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return mappingConverter;
    }
}
```

## 不支持ZonedDateTime类型

MongoDB不支持ZonedDateTime，因此在读取和写入时需要转换为`java.util.Date`或LocalDateTime类型：

```java
@Configuration
public class MongoDBConfig {
    @Autowired
    MongoDbFactory mongoDbFactory;
    @Bean
    public MongoTemplate mongoTemplate() throws UnknownHostException {
        MappingMongoConverter converter = new MappingMongoConverter(new DefaultDbRefResolver(mongoDbFactory),
                new MongoMappingContext());
        converter.setCustomConversions(customConversions());
        converter.afterPropertiesSet();
        return new MongoTemplate(mongoDbFactory, converter);
    }
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(DateToZonedDateTimeConverter.INSTANCE);
        converters.add(ZonedDateTimeToDateConverter.INSTANCE);
        return new MongoCustomConversions(converters);
    }
    @ReadingConverter
    enum DateToZonedDateTimeConverter implements Converter<Date, ZonedDateTime> {
        INSTANCE;
        public ZonedDateTime convert(Date source) {
            return source == null ? null : ZonedDateTime.ofInstant(source.toInstant(), ZoneId.systemDefault());
        }
    }
    @WritingConverter
    enum ZonedDateTimeToDateConverter implements Converter<ZonedDateTime, LocalDateTime> {
        INSTANCE;
        public LocalDateTime convert(ZonedDateTime source) {
            return source == null ? null : LocalDateTime.ofInstant(source.toInstant(), ZoneId.systemDefault());
        }
    }
}
```

## The bean ‘xxx’, defined in null, could not be registered.

当同时使用了多个Spring Data模块时，比如混用了Spring Data JPA和Spring Data MongoDB时就会报这种错：

```
Description:
 
The bean 'itemMongoRepository', defined in null, could not be registered. A bean with that name has already been defined in null and overriding is disabled.
 
Action:
 
Consider renaming one of the beans or enabling overriding by setting spring.main.allow-bean-definition-overriding=true
```

原因很简单，这些Spring Data模块属于不同的jar，但用的是同一个接口，Spring在运行时不知道当前的bean是绑定的JPA的，还是MongoDB或者Elasticsearch的库。

此时需要使用注解来声明不同模块对应的包路径，以此区分开这些Repository的bean：

```java
@Configuration
@EnableMongoRepositories(basePackages = "test.repository.mongodb")
public class MongoConfig {

}

@Configuration
@EnableJpaRepositories(basePackages = "test.repository.jpa")
public class EntityConfig {

}

@Configuration
@EnableElasticsearchRepositories(basePackages = "test.repository.es")
public class ElasticSearchConfig {

}
```

## 整合多个数据库

现在有两个不同的功能模块，各自对应一个MongoDB，此时需要配置两个不同的数据库配置，并指定不同的MongoTemplate，然后通过调用不同的MongoTemplate来操作不同的MongoDB。

比如在配置文件中有如下两个数据库：

```
## Default MongoDB database
spring.data.mongodb.primary.uri=mongodb://localhost:27017/db1
## Secondary MongoDB database
spring.data.mongodb.secondary.uri=mongodb://localhost:27017/db2
```

此时定义两个MongoConfig的bean，各自对应上述两个不同的数据库。由于定义重复了相同类型的bean对象，需要用`@Primary`来指明默认注入哪个bean对象。

```java
@Configuration
@EnableMongoRepositories(basePackages = "test.repository.mongodb.primary",
        mongoTemplateRef = "primaryMongoTemplate")
public class PrimaryMongoConfig {

    private static final String ENTITY_MONGODB_URL = "spring.data.mongodb.primary.uri";

    @Bean(name = "primaryMongoTemplate")
    @Primary
    public MongoTemplate mongoTemplate(Environment env) {
        return new MongoTemplate(mongoFactory(env));
    }

    @Bean(name = "primaryMongoFactory")
    @Primary
    public MongoDatabaseFactory mongoFactory(Environment env) {
        return new SimpleMongoClientDatabaseFactory(env.getProperty(ENTITY_MONGODB_URL));
    }
}

@Configuration
@EnableMongoRepositories(basePackages = "test.repository.mongodb.secondary",
        mongoTemplateRef = "secondaryMongoTemplate")
public class SecondaryMongoConfig {

    private static final String ENTITY_MONGODB_URL = "spring.data.mongodb.secondary.uri";

    @Bean(name = "secondaryMongoTemplate")
    public MongoTemplate mongoTemplate(Environment env) {
        return new MongoTemplate(mongoFactory(env));
    }

    @Bean(name = "secondaryMongoFactory")
    public MongoDatabaseFactory mongoFactory(Environment env) {
        return new SimpleMongoClientDatabaseFactory(env.getProperty(ENTITY_MONGODB_URL));
    }
}
```

## 使用SPEL表达式来动态获取集合的值

Spring Data MongoDB的POJO需要用`@Document(collection = "xxx")`来指明映射数据库的某个集合（相当于JPA里的`@Table(name = "xxx")`），但有时不想要直接写死集合名字，可以用SPEL表达式来实现：

```java
// 将集合名字作为一个变量，存到一个bean对象中
// @Data是lombok的注解，用来自动生成setter和getter方法

@Bean(name = "entityMongoCollection")
public EntityMongoCollection getEntityMongoCollection() {
    return new EntityMongoCollection("myCollection");
}

@Data
@AllArgsConstructor
public class EntityMongoCollection {

    private String collectionName;

}

// 用SPEL表达式来获取这个bean里的变量值
@Data
@Document(collection = "#{@entityMongoCollection.getCollectionName()}")
public class EntityMongo implements Serializable {

    @Id
    @Field("id")
    private String id;

    @Field("ref_no")
    private String refNo;
    
    @Field("version")
    private Interger version;
}
```

## 查询数据库

可以用官方提供的MongoTemplate来查询数据，也可以使用MongoRepository和`@Query`注解来实现：

```java
public interface EntityMongoRepository extends MongoRepository<EntityMongo, String> {

    @Query("{'refNo':?0 , 'version':?1}")
    List<EntityMongo> findByRefNoAndVersion(final String refNo, final String version);

}
```

如果只需要查询部分字段，可以用MongoTemplate的Projection来实现：

```java
String collectionName = "test";

Query query = new Query();
query.fields().include("ref_no"); // 想查询的字段
query.fields().exclude("version");  // 不想查询的字段

final List<EntityMongo> list = mongoTemplate.find(query, EntityMongo.class, collectionName);
```

## 参考链接

* [Spring Data Mongo中@Transient无效的解决办法](https://www.jianshu.com/p/847cb7b8c458)
* [Spring 框架 MongoDB 去掉_class属性字段](https://blog.csdn.net/zhan107876/article/details/111597156)
* [Mongo Date Custom Converter not being called when save method of mongo repository is invoked](https://stackoverflow.com/questions/58537519/mongo-date-custom-converter-not-being-called-when-save-method-of-mongo-repositor)
* [The bean 'xxxxx', defined in null, could not be registered. A bean with that name has already ...](https://blog.csdn.net/lidai352710967/article/details/96307151)
* [SpringBoot整合MongoDB多数据源](https://blog.csdn.net/qq_28336351/article/details/94402768)
* [springboot整合MongoDB](https://www.jianshu.com/p/7cdf2761a9f3)
* [Cannot resolve bean in SpEL for Spring Data MongoDB collection name](https://stackoverflow.com/questions/41698445/cannot-resolve-bean-in-spel-for-spring-data-mongodb-collection-name)