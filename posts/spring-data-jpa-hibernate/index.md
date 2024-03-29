# Spring Data JPA/Hibernate问题汇总

## 前言

本文基于如下版本的JPA和Hibernate：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
  <version>2.4.0</version>
</dependency>

<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-core</artifactId>
  <version>5.4.23.Final</version>
</dependency>
```

JPA本身提供的Repository功能比较简单，遇到一些复杂的查询无法胜任，这时可以使用第三方的增强库，比如Jinq或者QueryDSL。

<!--more-->
## 定义实体类相关的一些注解

实体类的字段不要使用基本数据类型，应该使用包装类。

`@Entity`：声明该类为一个实体类。

`@Table`：声明当前实体类对应数据库中的哪一张表。

### 一对一的关联关系

`@OneToOne`：定义两个实体间一对一的关联关系，通常和`@JoinColumn`搭配使用。比如下面的例子：一个商品只能有一个默认的采购记录，然后采购记录也关联这个商品，由于两者没有定义外键关系所以没有配置`mappedBy`：

```java
@Data
@Entity
@Table(name = "tb_item")
public class Item {

    @Id
    @GeneratedValue(generator = "jpa-uuid")
    @GenericGenerator(name = "jpa-uuid", strategy = "uuid")
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    // 在一对一或者多对一的关系中，@JoinColumn是拿自己表的字段去连接对方的字段，默认连接对方的id字段
    @JoinColumn(name = "default_sourcing_record_id")
    private SourcingRecord defaultSourcingRecord;

}

@Data
@Entity
@Table(name = "tb_sourcing_record")
public class SourcingRecord {

    @Id
    @GeneratedValue(generator = "jpa-uuid")
    @GenericGenerator(name = "jpa-uuid", strategy = "uuid")
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    // 在一对一或者多对一的关系中，@JoinColumn是拿自己表的字段（由name指定）去连接对方的字段，默认连接对方的id字段
    @JoinColumn(name = "item_id")
    private Item item;

}
```

### 一对多的关联关系

`@OneToMany`和`@ManyToOne`：定义两个实体间一对多的关联关系，多对一的那方需要指定`@JoinColumn`，为了保证数据一致性通常会设置外键关系，并通过`mappedBy`来对外键关系进行维护。

下面是一个一对多的例子，相当于父子关系，一个商品可以有不同的颜色方案：

```java
@Data
@Entity
@Table(name = "tb_item")
public class Item {

    // 这里没有指定mappedBy，因此使用了orphanRemoval来指明自动删除
    // 当集合中移除元素时自动删除多方表中对应的记录，如果不设置为true则只会将对应记录的外键设为null
    // 如果设置了mappedBy，则集合中移除元素将不会产生任何影响（即无法删掉或更新对应记录）
    // cascade是级联策略
    @OneToMany(fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    // 在一对多的关系中，@JoinColumn是拿自己表的id字段去连接对方的字段（由name指定）
    @JoinColumn(name = "item_id")
    @OrderBy(value = "colorSeq")
    private List<ItemColor> itemColorList;

}

@Data
@Entity
@Table(name = "tb_item_color")
public class ItemColor {

    // 外键
    @Column(name = "item_id")
    private String itemId;

}
```

### 多对多的关联关系

下面是一个多对多的例子，将多对多拆分成两个一对多，并额外定义一个中间表。供应商和工厂之间是多对多的关系，通过一个中间表来进行维护：

```java
@Data
@Entity
@Table(name = "tb_vendor")
public class Vendor {

    // 一对多的一方，不需要指定@JoinColumn，不负责维护外键关系，mappedBy指明由多方的vendor变量来维护外键关系
    @OneToMany(mappedBy = "vendor", fetch = FetchType.LAZY)
    @OrderBy(value = "internalSeqNo")
    private List<VendorFact> factList;

}


@Data
@Entity
@Table(name = "tb_vendor_fact")
public class VendorFact {

    // 多对一的一方需要指定@JoinColumn
    @ManyToOne(fetch = FetchType.LAZY)
    // 在一对一或者多对一的关系中，@JoinColumn是拿自己表的字段（由name指定）去连接对方的字段，默认连接对方的id字段
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    // 多对一的一方需要指定@JoinColumn
    @ManyToOne(fetch = FetchType.LAZY)
    // 在一对一或者多对一的关系中，@JoinColumn是拿自己表的字段（由name指定）去连接对方的字段，默认连接对方的id字段
    @JoinColumn(name = "fact_id")
    private Fact fact;

}

@Data
@Entity
@Table(name = "tb_fact")
public class Fact {

    // 一对多的一方，不需要指定@JoinColumn，不负责维护外键关系，mappedBy指明由多方的vendor变量来维护外键关系
    @OneToMany(mappedBy = "fact", fetch = FetchType.LAZY)
    @OrderBy(value = "internalSeqNo")
    private List<VendorFact> vendorList;

}
```

### 属性嵌入

如果实体类中需要定义一个对象属性，但该对象的字段来自于自身表的多个列，而非另一个表，则可以用`@Embedded`，`@Embeddable`，`@AttributeOverrides`和`@AttributeOverride`来实现。

比如供应商有一个国家变量，这个国家变量对应数据表中的三个列，现在希望把这三个列作为一个整体定义到实体类中，如下：

```java
@Data
@Entity
@Table(name = "tb_vendor")
public class Vendor {

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "code", column = @Column(name = "country")),
        @AttributeOverride(name = "name", column = @Column(name = "country_name")),
        @AttributeOverride(name = "version", column = @Column(name = "country_ver"))
    })
    private EmbedCodelist country;

}

@Data
@Embeddable
public class EmbedCodelist {
    private String code;
    private String name;
    private Integer version;
}
```

这里的`@AttributeOverrides`可以省略不写，效果是一样的，如下：

```java
@AttributeOverride(name = "code", column = @Column(name = "country"))
@AttributeOverride(name = "name", column = @Column(name = "country_name"))
@AttributeOverride(name = "version", column = @Column(name = "country_ver"))
private EmbedCodelist country;
```

## 建表策略

通常不使用hibernate的建表策略，避免把生产数据搞没了，在SpringBoot配置如下：

```
# common.jpa.hibernate.ddl-auto - available values are: create, create-drop, validate, update, none
spring.jpa.hibernate.ddl-auto=none
```

## id生成策略

通常情况下直接用下面的注解来标注一个pojo的id字段即可：

```java
@Entity
@Table(name = "TB_ITEM")
public class Item {

    @Id
    @GeneratedValue(generator = "jpa-uuid")
    @GenericGenerator(name = "jpa-uuid", strategy = "uuid")
    private String id;

}
```

`@Id`和`@GeneratedValue`是JPA规范的注解，`@GenericGenerator`是Hibernate的注解。

`@Id`指明当前字段是当前pojo的id主键，`@GeneratedValue`指明使用名为`jpa-uuid`的id生成器。

`@GenericGenerator`定义了一个名为`@GenericGenerator`的id生成器，使用的生成策略是`uuid`（32位16进制数字）。

Hibernate除了常见的uuid策略，还提供了其他常见的策略：sequence、identity等。

### sequence策略

使用底层数据库的序列机制生成id，换言之，必须用底层数据库支持序列才行。比如MySQL就不支持sequence，但是可以用identity。

支持序列的有Oracle、PostgreSQL等，使用该策略需要先在数据库创建序列。

### identity策略

identity同样是由数据库生成的，但该主键字段必须设置为自增长。使用该策略的前提是数据库要支持自动增长类型的字段，Oracle不支持该策略。

支持自增长的有MySQL、PostgreSQL等，在MySQL中需要将主键设为`auto_increment`，在PostgreSQL中需要将主键设为`serial4`或`serial8`，前者是32位长度，后者是64位长度。

### 其他的写法

如果不想混用Hibernate的注解，可以用JPA自身提供的生成器注解：`@TableGenerator`，`@SequenceGenerator`等，此时需要改变`@GeneratedValue`的策略。

下面是样例代码，具体可以参考这篇文章：[Hibernate学习笔记2.4（Hibernate的Id生成策略）](https://www.cnblogs.com/frankzone/p/9439143.html)

```java
// 自增长，适用于支持自增字段的数据库
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)

// 使用表存储生成的主键，可以跨数据库。
// 每次需要主键值时，查询名为"hibernate_table"的表，查找主键列"gen_pk"值为"2"记录，得到这条记录的"gen_val"值，根据这个值，和allocationSize的值生成主键值。
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "ud")
@TableGenerator(name = "ud",
table = "hibernate_table",
pkColumnName = "gen_pk",
pkColumnValue = "2",
valueColumnName = "gen_val",
initialValue = 2,
allocationSize = 5)

// 使用序列
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ud")
@SequenceGenerator(name = "ud",
sequenceName = "hibernate_seq",
allocationSize = 1,
initialValue = 2)
```

## should be mapped with insert="false" update="false"

启动项目时报错`should be mapped with insert="false" update="false"`，这是因为实体类中定义了重复的映射字段，可能是`@Column`和`@JoinColumn`里指定的列名重复了。

解决方法有两个，要么去掉重复定义的，只留下唯一的映射字段；要么在重复的映射字段上添加`insertable = false, updatable = false`，如下：

```java
@Data
@Entity
@Table(name = "tb_member_rule")
public class MemberRule {

    private String accessObjectId;

    @OneToOne
    // 定义重复了映射字段
    @JoinColumn(name = "accessObjectId", referencedColumnName = "id", insertable = false, updatable = false)
    private AccessObject accessObject;

}
```

## 懒加载异常 - JsonMappingException: could not initialize proxy

查询数据时报懒加载异常：
```java
Caused by: org.hibernate.LazyInitializationException: could not initialize proxy [com.cbxsoftware.cbx.attachment.entity.RefAttachment#c109ec36e60c4a89a10eabc72416d984] - no Session
	at org.hibernate.proxy.AbstractLazyInitializer.initialize(AbstractLazyInitializer.java:169)
	at org.hibernate.proxy.AbstractLazyInitializer.getImplementation(AbstractLazyInitializer.java:309)
	at org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor.intercept(ByteBuddyInterceptor.java:45)
	at org.hibernate.proxy.ProxyConfiguration$InterceptorDispatcher.intercept(ProxyConfiguration.java:95)
```

报错很明显，是由于hibernate的懒加载引起的。项目使用的是SpringBoot框架，JPA默认使用的是hibernate的实现，而hibernate的懒加载机制其实就是延迟加载对象，如果没有在session关闭前使用到对象里除id以外的属性时，就只会返回一个没有初始化过的包含了id的代理类。很多时候，这个代理类会引发上述的异常。

简单说一下为什么会触发懒加载异常，首先hibernate开启一个session（会话），然后开启transaction（事务），接着发出sql找回数据并组装成pojo（或者说entity、model），这时候如果pojo里有懒加载的对象，并不会去发出sql查询db，而是直接返回一个懒加载的代理对象，这个对象里只有id。

如果接下来没有其他的操作去访问这个代理对象除了id以外的属性，就不会去初始化这个代理对象，也就不会去发出sql查找db。接着事务提交，session关闭。如果这时候再去访问代理对象除了id以外的属性时，就会报上述的懒加载异常，原因是这时候已经没有session了，无法初始化懒加载的代理对象。

### 解决方法一

如果是spring集成的hibernate，根据上述的原因，可以延长session的生命周期，但是这里用的是SpringBoot的JPA，处理方法不同，需要在`application.properties`配置下懒加载相关的东西：
```xml
spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true
```

进行该配置后，可以在session关闭时也能另外开启一个新的session和事务来访问db以取回懒加载对象的数据。

### 解决方法二

因为该懒加载异常是缺少session导致的，那么可以通过在方法前添加事务注解`@Transactional`的方式来解决，只要事务没有提交，session就不会关闭，自然就不会出现上述的懒加载异常。不过由于该事务注解是用Spring AOP实现的，存在着一些坑，比如类内直接调用无效或者对非public方法无效等，需要多加注意。

当使用了上述两种方法后，发现不再触发`LazyInitializationException`，但是却发生了另一个新的异常`InvalidDefinitionException`：
```java
com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor and no properties discovered to create BeanSerializer (to avoid exception, disable SerializationFeature.FAIL_ON_EMPTY_BEANS) (through reference chain: com.cbxsoftware.cbx.item.elasticsearch.entity.ItemEstc["mainEntity"]->com.cbxsoftware.cbx.item.entity.Item["image"]->com.cbxsoftware.cbx.image.entity.RefImage["propFormat"]->com.cbxsoftware.cbx.attachment.entity.RefAttachment$HibernateProxy$vTKSYzrN["hibernateLazyInitializer"])
	at com.fasterxml.jackson.databind.exc.InvalidDefinitionException.from(InvalidDefinitionException.java:77)
	at com.fasterxml.jackson.databind.SerializerProvider.reportBadDefinition(SerializerProvider.java:1191)
	at com.fasterxml.jackson.databind.DatabindContext.reportBadDefinition(DatabindContext.java:313)
	at com.fasterxml.jackson.databind.ser.impl.UnknownSerializer.failForEmpty(UnknownSerializer.java:71)
	at com.fasterxml.jackson.databind.ser.impl.UnknownSerializer.serialize(UnknownSerializer.java:33)
	at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:727)
	at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:719)
	...
```

这个异常是由于hibernate在代理类里添加了一个属性`hibernateLazyInitializer`，当该对象转换成json的时候就会报错。解决方法是将该属性过滤掉，可以在对应的类名或者公共类前加上如下注解：
```java
@JsonIgnoreProperties(value = { "hibernateLazyInitializer" })
```

### 懒加载源码分析

因为对懒加载异常的发生有些好奇，所以看了下hibernate的源码，这里简单分析下，另外我看的是两个源码包如下：
```
spring-orm-5.1.5.RELEASE.jar
hibernate-core-5.3.7.Final.jar
```

首先是关于`spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true`的配置，前面半截是因为JPA集成了hibernate的配置，所以在hibernate中，这个配置应该是`hibernate.enable_lazy_load_no_trans=true`。

在hibernate的一个常量接口`org.hibernate.cfg.AvailableSettings`中定义了各种配置常量，其中就包括上述这个配置：
```java
String ENABLE_LAZY_LOAD_NO_TRANS = "hibernate.enable_lazy_load_no_trans";
```

在启动项目的时候会读取配置文件，将其解析为一个`HashMap<K,V>`，这些参数在new`EntityManagerFactoryBuilderImpl`的时候被使用到，上面的常量会在`org.hibernate.boot.internal.SessionFactoryOptionsBuilder`里被拿来初始化：
```java
this.initializeLazyStateOutsideTransactions = cfgService.getSetting( ENABLE_LAZY_LOAD_NO_TRANS, BOOLEAN, false );
```

因为在配置文件里配置了该变量的值为true，所以这里在初始化的时候就会把`initializeLazyStateOutsideTransactions`的值设置为true。该变量由一个方法来判断其值是否为true：
```java
	@Override
	public boolean isInitializeLazyStateOutsideTransactionsEnabled() {
		return initializeLazyStateOutsideTransactions;
	}
```

接着在组装pojo时，会为懒加载对象创建对应的代理对象，当需要获取该代理对象除id以外的属性时，就会调用`AbstractLazyInitializer#initialize()`进行初始化，逻辑如下：
```java
	@Override
	public final void initialize() throws HibernateException {
		if ( !initialized ) {
			if ( allowLoadOutsideTransaction ) {
				permissiveInitialization();
			}
			else if ( session == null ) {
				throw new LazyInitializationException( "could not initialize proxy [" + entityName + "#" + id + "] - no Session" );
			}
			else if ( !session.isOpen() ) {
				throw new LazyInitializationException( "could not initialize proxy [" + entityName + "#" + id + "] - the owning Session was closed" );
			}
			else if ( !session.isConnected() ) {
				throw new LazyInitializationException( "could not initialize proxy [" + entityName + "#" + id + "] - the owning Session is disconnected" );
			}
			else {
				target = session.immediateLoad( entityName, id );
				initialized = true;
				checkTargetState(session);
			}
		}
		else {
			checkTargetState(session);
		}
	}
```

如果在配置文件中设置了`spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true`，那么上述的`allowLoadOutsideTransaction`变量值就为true，则可以进入`permissiveInitialization()`方法另起session和事务，最终避免懒加载异常`LazyInitializationException`。如果没有配置该参数，那么就会由于session已关闭（即为null）而抛出`LazyInitializationException`。

## @JoinColumn无法找回数据导致报错

使用`@JoinColumn`时如果无法找到对应的record，就会报错导致查询失败：
```java
javax.persistence.EntityNotFoundException: Unable to find com.cbxsoftware.rest.entity.fact.Fact with id 4d644cfa243b493ab34d69e4207ee5f1
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl$JpaEntityNotFoundDelegate.handleEntityNotFound(EntityManagerFactoryBuilderImpl.java:163)
	at org.hibernate.proxy.AbstractLazyInitializer.checkTargetState(AbstractLazyInitializer.java:286)
	at org.hibernate.proxy.AbstractLazyInitializer.initialize(AbstractLazyInitializer.java:181)
	at org.hibernate.proxy.AbstractLazyInitializer.getImplementation(AbstractLazyInitializer.java:310)
	at org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor.intercept(ByteBuddyInterceptor.java:45)
	at org.hibernate.proxy.ProxyConfiguration$InterceptorDispatcher.intercept(ProxyConfiguration.java:95)
```

通过使用Hibernate提供的`@NotFound(action = NotFoundAction.IGNORE)`可以避免这个问题，该注解的默认值是`NotFoundAction.EXCEPTION`，所以hibernate在join表时查不到对应的数据就会抛出异常。

## 连表时指定额外的条件

连表时使用的`@JoinColumn`只能指定被连接的表的列，如果需要指定其他的条件，如`a inner join b on b.column_1 = 'xxx'`，需要使用`@JoinColumnsOrFormula`注解：

```java
@Data
@Entity
@Table(name = "navi")
public class Navi {
    @JsonUnwrapped
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumnsOrFormulas(value={
            @JoinColumnOrFormula(column=@JoinColumn(name="label",referencedColumnName="labelId")),
            @JoinColumnOrFormula(formula=@JoinFormula(value="'en_US'",referencedColumnName="locale"))
    })
    private Label label;
}

@Data
@Entity
@Table(name="label")
public class Label {
    private String labelId;
    private String locale;
}
```

上面的连表sql即为：`navi inner join label on navi.label = label.label_id and label.locale = 'en_US'`。

这里的`Formula`用来定义sql判断，`referencedColumnName`是被连接的表的字段名字（非数据库列名）。如果嫌麻烦，也可以不写`@JoinColumnsOrFormulas`，直接用简写的方式：

```java
@JsonUnwrapped
@OneToOne(fetch = FetchType.EAGER)
@JoinColumnOrFormula(column=@JoinColumn(name="label",referencedColumnName="labelId"))
@JoinColumnOrFormula(formula=@JoinFormula(value="'en_US'",referencedColumnName="locale"))
private Label label;
```

编译器会自动将多个`@JoinColumnOrFormula`注解包装成一个`@JoinColumnsOrFormulas`。

## 懒加载导致的N + 1问题

Hibernate的懒加载有个让人诟病的问题，就是所谓的N + 1问题：如果一个实体里存在一个懒加载的集合对象，在查询该实体时，会发出一条SQL。当触发查询该懒加载的集合时，则会发出N条SQL。

如果这个实体比较复杂，存在多个懒加载的集合，集合对象又各自关联了其他的懒加载的集合，如果触发查询这些集合，就会发出大量的SQL去查询，对DB造成较大的负荷。

解决方法有如下几种：
1. 取消懒加载，改为`FetchType.EAGER`。
2. 给集合对象添加`@Fetch(FetchMode.SUBSELECT)`，该注解会让Hibernate只会生成一条SQL去查询该集合。
3. 使用`@NamedEntityGraph`和`@EntityGraph`来解决懒加载时SQL查询过多的问题，但是这种方法比较复杂。

* [解决JPA懒加载典型的N+1问题-注解@NamedEntityGraph](https://blog.csdn.net/ahilll/article/details/83107982)

## cannot simultaneously fetch multiple bags异常

应用启动时报错：`org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags`，该异常由Hibernate引发，当一个实体中定义了两个及两个以上的非懒加载的集合时，即`fetch = FetchType.EAGER`，这些集合又可能关联其他的对象。Hibernate实现的JPA，默认最高抓取深度含本身级为四级(它有个属性配置是0-3)，若多方(第二级)存在重复值，则第三级中抓取的值就无法映射，就会出现 multiple bags。

简单来说，Hibernate默认会用一条SQL直接把`FetchType.EAGER`的集合也一起left join进来，如果这些集合允许重复值，且存在两个及两个以上的这些集合，而集合又可能关联其他的对象。一旦出现这种情况，Hibernate就会无法区分清楚查询回来的结果集。

解决方法有如下几种：

1. 改用懒加载`FetchType.LAZY`来加载这些集合对象。
2. 给集合对象添加`@Fetch(FetchMode.SUBSELECT)`，该注解会让Hibernate另外生成一条SQL去查询该集合。效果类似于懒加载，也是用分开的SQL去查询，区别是这个是非懒加载。
3. 使用Set集合来替代List集合。
4. 使用`@IndexColumn`，该注解允许你指明存放索引值的字段，目的跟Set容器不允许重复元素的道理一样。但是该注解以废弃，官方推荐使用的是JPA规范的`@OrderColumn`。

前两种方法比较常用，不过第二个方法是Hibernate自身的规范。

## UnexpectedRollbackException异常

在使用事务时发生异常，事务回滚时报错：

```java
org.springframework.transaction.UnexpectedRollbackException: Transaction rolled back because it has been marked as rollback-only
```

这是事务传播行为导致的，JPA默认的事务传播级别是`PROPAGATION_REQUIRED`：如果当前存在事务则加入该事务，否则新建一个事务。

于是当一个事务方法A去调用了另一个事务方法B时，不指明事务传播级别，那么事务方法B依然使用方法A的事务。此时如果方法B抛出异常，触发事务回滚，而在方法A调用方法B的地方使用try-catch捕获发生的异常，理论上方法A应该继续正常执行，实际上却不是这样。

当方法A继续执行完毕，在最后提交事务时，会发现当前事务已经被标记为`rollback-only`状态，于是整个事务回滚并抛出`UnexpectedRollbackException`异常。

在这种情况下，一般有两种处理场景：
* 只有方法B在遇到异常时事务回滚，且不影响到方法A的事务提交，那么此时方法B的事务要指明为`PROPAGATION_NESTED`。但是，**JPA默认实现是Hibernate，而Hibernate不提供事务嵌套**。对于这种情况，要么使用其他的JPA实现，要么在方法B中将可能发生的异常try-catch并且不往外抛出，但此时方法B将不能自动事务回滚。
* 方法B发生异常时，和方法A一起事务回滚。这种场景需要在方法A调用方法B的地方使用try-catch捕获发生的异常，并且将该异常重新往外抛出，这样就可以让方法A事务回滚，且得到的异常也是真正的异常，而不是UnexpectedRollbackException异常。

## JPA Projection不支持新的日期类LocalDate、LocalDateTime

JPA的Projection有个坑：不支持LocalDate、LocalDateTime这两个类型。代码如下：

```java
@Query(value = "select ibs.sequence as sequence, ibs.inspect_booking_id as inspectBookingId, ibs.date as date "
        + "from CNT_INSPECT_BOOKING_SCHEDULED ibs where ibs.inspector_id = :inspectorId", nativeQuery = true)
List<SimpleInspectBookingScheduled> findInspectBookingIdByInspectorId(@Param(value = "inspectorId")final String inspectorId);

interface SimpleInspectBookingScheduled {
    Long getSequence();

    String getInspectBookingId();

    LocalDate getDate();
}
```

当调用该方法时会抛出如下异常：

```java
java.lang.IllegalArgumentException: Projection type must be an interface!
	at org.springframework.util.Assert.isTrue(Assert.java:121)
	at org.springframework.data.projection.ProxyProjectionFactory.createProjection(ProxyProjectionFactory.java:105)
	at org.springframework.data.projection.SpelAwareProxyProjectionFactory.createProjection(SpelAwareProxyProjectionFactory.java:45)
	at org.springframework.data.projection.ProjectingMethodInterceptor.getProjection(ProjectingMethodInterceptor.java:160)
	at org.springframework.data.projection.ProjectingMethodInterceptor.potentiallyConvertResult(ProjectingMethodInterceptor.java:108)
	at org.springframework.data.projection.ProjectingMethodInterceptor.invoke(ProjectingMethodInterceptor.java:85)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
	at org.springframework.data.projection.ProxyProjectionFactory$TargetAwareMethodInterceptor.invoke(ProxyProjectionFactory.java:250)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
	at org.springframework.data.projection.DefaultMethodInvokingMethodInterceptor.invoke(DefaultMethodInvokingMethodInterceptor.java:80)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:215)
	at com.sun.proxy.$Proxy611.getDate(Unknown Source)
```

在使用JPA Projection时，对于日期类型必须使用`java.sql`包下的Date或Timestamp。如果强行使用Java 8新增的日期类，则会抛出上述诡异的异常。将接口改为如下则调用正常：

```java
import java.sql.Date;

interface SimpleInspectBookingScheduled {
    Long getSequence();

    String getInspectBookingId();

    Date getDate();
}
```

此外，`java.sql`包下的类和新的日期类的转换方式可以参考[这篇文章](https://lewky.cn/posts/java-date-issues.html/#javasql包下的类和新的日期类的转换)

## operator does not exist: character varying = bytea

当使用JPA的`@Query`查询数据库时，此时`@Query`里自定义的sql会用到参数绑定，如下：

```
@Query(value = "SELECT * "
            + "from tb_test test "
            + "where test.domain_id = :domainId", nativeQuery = true)
List<Test> test(@Param(value = "domainId") final String domainId);
```

如果被绑定的参数值是`null`，而被查询的数据库是PostgreSQL，那么上述SQL在执行时就会报错：

```
Caused by: org.postgresql.util.PSQLException: ERROR: operator does not exist: character varying = bytea
  Hint: No operator matches the given name and argument types. You might need to add explicit type casts.
  Position: 145
```

原因是PostgreSQL驱动把null值识别成了bytea类型，在进行参数绑定时，由于当前字段是varchar类型（character varying），会认为需要进行显示类型转换。如果直接把下述SQL去PostgreSQL 12查询，是不会报错的：

```
SELECT * from tb_test test where test.domain_id = null;
```

这里报错是因为JPA使用了参数绑定的方式：

```
SELECT * from tb_test test where test.domain_id = ?;
```

解决这个问题，需要处理参数值是null的情况，由于业务需求，这个参数值不能为null，我需要在参数值不为null时才能调用这个方法，这样就不会触发这个问题。

如果是需要按照参数值是否为null来作为查询条件，可以这样写：

```java
@Query(value = "SELECT * "
            + "from tb_test test "
            + "where test.domain_id is null or test.domain_id = cast(:domainId as text)", nativeQuery = true)
List<Test> test(@Param(value = "domainId") final String domainId);
```

## 忽略某个字段

有时候需要在pojo中定义一个常量字段，仅用于业务逻辑，且不希望该字段被映射到数据库中，也就是说这个字段的值不需要被持久化的数据库中。

这时候可以使用`@Transient`注解（包路径是`javax.persistence.Transient`）。

## SpringBoot打印Hibernate的sql

```
# 控制台打印sql语句
spring.jpa.show-sql=true

# 格式化sql语句
spring.jpa.properties.hibernate.format_sql=false

# 指出是什么操作生成了该sql语句
spring.jpa.properties.hibernate.use_sql_comments=false
spring.jpa.properties.hibernate.generate_statistics=false
```

如果想把sql也打印的log文件中，logger的配置如下：

```xml
<!-- Use DEBUG level to print sql and sql-parameters, change to INFO level will not print them. -->
<Logger name="org.hibernate.SQL" level="DEBUG" additivity="true">
</Logger>
<Logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="INFO" additivity="true">
</Logger>
```

## detached entity passed to persist

不要手动设置id的值，如果有其他实体需要用到这个id的值，可以直接getId()来获取id（尽管此时id还没有被hibernate生成出来），hibernate会在commit到db的时候获取到id。

jpa的Repository的save()有个返回值，返回值是保存之后的对象，虽然此时还没commit到db，但可以通过这个返回值来获取到一些需要提交到db才会生成的数据，如id等。

## nativeQuery

有时候用hql来查询一个复杂的sql会比较麻烦，可以用`nativeQuery = true`来使用原生sql查询数据：

```java
@Query(value = "SELECT * "
            + "from tb_test test "
            + "where test.domain_id is null or test.domain_id = cast(:domainId as text)", nativeQuery = true)
List<Test> test(@Param(value = "domainId") final String domainId);
```

## 事务提交成功才能执行其他操作

有些业务可能需要在事务提交之后才能执行，可以使用TransactionSynchronizationManager来实现：

```java
public void afterCommitProcess() throws Exception {
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
        @Override
        public void afterCommit() {
            System.out.println("after transaction commit...");
        }
    });
}
```

TransactionSynchronizationAdapter在Spring5.3之后被废弃了，直接改用其继承的接口`org.springframework.transaction.support.TransactionSynchronization`就行。

TransactionSynchronization中可以重写`beforeCommit(boolean readOnly)`、`afterCommit()`等方法来控制事务的生命周期，比如想要在事务提交后发邮件通知，就可以重写`afterCommit()`，添加发生邮件的功能。

## 参考链接

* [springboot jpa 解决延迟加载问题](https://blog.csdn.net/hsz2568952354/article/details/82724719)
* [No serializer found for class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor](https://blog.csdn.net/weixin_43839457/article/details/90445950)
* [springboot集成jpa返回Json报错 com.fasterxml.jackson.databind.exc.InvalidDefinitionException:](https://blog.csdn.net/liu_yulong/article/details/84594771)
* [Hibernate和Spring整合出现懒加载异常：org.hibernate.LazyInitializationException: could not initialize proxy - no Session](https://www.cnblogs.com/TTTTT/p/6682798.html)
* [[JPA] javax.persistence.EntityNotFoundException: Unable to find XXXX with id 0 问题原因](https://blog.csdn.net/mamingjie12/article/details/25911967)
* [[转]cannot simultaneously fetch multiple bags 问题的解决办法](http://blog.sina.com.cn/s/blog_697b968901017w9p.html)
* [UnexpectedRollbackException解决方案](https://segmentfault.com/a/1190000016418596?utm_source=tag-newest)
* [import java.sql.date_Java8中 LocalDate和java.sql.Date的相互转换操作](https://blog.csdn.net/weixin_33526828/article/details/114507298?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_title~default-0.essearch_pc_relevant&spm=1001.2101.3001.4242)
* [PostgreSQL错误处理“operator does not exist: character varying = bytea at character”](https://www.it610.com/article/1289093039972753408.htm)
* [Hibernate在控制台打印sql语句以及参数](https://blog.csdn.net/Randy_Wang_/article/details/79460306)
* [detached entity passed to persist 错误的引起的原因和解决办法](https://blog.csdn.net/remote_roamer/article/details/5680445)
* [postgresql如何设置自动增长](https://blog.csdn.net/qing_gee/article/details/84655167)
* [Hibernate学习笔记2.4（Hibernate的Id生成策略）](https://www.cnblogs.com/frankzone/p/9439143.html)
* [Hibernate oneToOne join with additional criteria](https://stackoverflow.com/questions/39892267/hibernate-onetoone-join-with-additional-criteria)
* [Hibernate实体基本注解，ManyToOne,OneToMany,cascade,orphanRemoval等说明](https://blog.csdn.net/marsedely/article/details/47092581)
* [如何在数据库事务提交成功后进行异步操作](https://segmentfault.com/a/1190000004235193)