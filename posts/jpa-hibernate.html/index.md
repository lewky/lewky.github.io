# JPA/Hibernate问题汇总

## 懒加载异常 - JsonMappingException: could not initialize proxy

查询数据时报懒加载异常：
```java
Caused by: org.hibernate.LazyInitializationException: could not initialize proxy [com.cbxsoftware.cbx.attachment.entity.RefAttachment#c109ec36e60c4a89a10eabc72416d984] - no Session
	at org.hibernate.proxy.AbstractLazyInitializer.initialize(AbstractLazyInitializer.java:169)
	at org.hibernate.proxy.AbstractLazyInitializer.getImplementation(AbstractLazyInitializer.java:309)
	at org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor.intercept(ByteBuddyInterceptor.java:45)
	at org.hibernate.proxy.ProxyConfiguration$InterceptorDispatcher.intercept(ProxyConfiguration.java:95)
```

<!--more-->
报错很明显，是由于hibernate的懒加载引起的。项目使用的是SpringBoot框架，JPA默认使用的是hibernate的实现，而hibernate的懒加载机制其实就是延迟加载对象，如果没有在session关闭前使用到对象里除id以外的属性时，就只会返回一个没有初始化过的包含了id的代理类。很多时候，这个代理类会引发上述的异常。

简单说一下为什么会触发懒加载异常，首先hibernate开启一个session（会话），然后开启transaction（事务），接着发出sql找回数据并组装成pojo（或者说entity、model），这时候如果pojo里有懒加载的对象，并不会去发出sql查询db，而是直接返回一个懒加载的代理对象，这个对象里只有id。

如果接下来没有其他的操作去访问这个代理对象除了id以外的属性，就不会去初始化这个代理对象，也就不会去发出sql查找db。接着事务提交，session关闭。如果这时候再去访问代理对象除了id以外的属性时，就会报上述的懒加载异常，原因是这时候已经没有session了，无法初始化懒加载的代理对象。

### 解决方法一

如果是spring继承的hibernate，根据上述的原因，可以延长session的生命周期，但是这里用的是SpringBoot的JPA，处理方法不同，需要在`application.properties`配置下懒加载相关的东西：
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

## @JoinColumn注解无法找回数据导致报错

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

## 参考链接

* [springboot jpa 解决延迟加载问题](https://blog.csdn.net/hsz2568952354/article/details/82724719)
* [No serializer found for class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor](https://blog.csdn.net/weixin_43839457/article/details/90445950)
* [springboot集成jpa返回Json报错 com.fasterxml.jackson.databind.exc.InvalidDefinitionException:](https://blog.csdn.net/liu_yulong/article/details/84594771)
* [Hibernate和Spring整合出现懒加载异常：org.hibernate.LazyInitializationException: could not initialize proxy - no Session](https://www.cnblogs.com/TTTTT/p/6682798.html)
* [[JPA] javax.persistence.EntityNotFoundException: Unable to find XXXX with id 0 问题原因](https://blog.csdn.net/mamingjie12/article/details/25911967)
* [[转]cannot simultaneously fetch multiple bags 问题的解决办法](http://blog.sina.com.cn/s/blog_697b968901017w9p.html)