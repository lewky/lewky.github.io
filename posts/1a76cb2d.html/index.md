# MySQL - 8小时连接闲置超时

## 问题与分析

最近发现之前部署在阿里云的一个web项目，每过一段时间就会报错，但是刷新下页面就会显示正常；在过了比较长的一段时间后，又会报同样的错误，如下：
<!--more-->

```html
com.mysql.jdbc.exceptions.jdbc4.CommunicationsException: Communications link failure
The last packet sent successfully to the server was *,*** milliseconds ago. The driver has not received any packets from the server.
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:57)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:526)
	at com.mysql.jdbc.Util.handleNewInstance(Util.java:408)
	at com.mysql.jdbc.SQLError.createCommunicationsException(SQLError.java:1137)
```

在网上查了下资料，原来是因为项目中使用了连接池，由于连接池里的连接长时间闲置着，而MySQL默认的非交互式连接的闲置时间是8小时；也就是说，当连接池里的连接闲置超过8小时后就会被MySQL数据库自动断开而失效。

由于连接池并不知道连接已经失效了，依然保持着这些失效的连接，这导致web项目在一段时间后访问页面时报错，而在刷新页面后连接池重新获取了有效的连接，所以项目又可以正常访问了。

这里涉及到MySQL关于交互式连接和非交互式连接的概念。

### 交互式连接

>通俗的说，在cmd里直接和MySQL进行各种sql操作的连接方式就是交互式连接，这里走的是TCP协议。

### 非交互式连接

>而直接在项目中对MySQL进行sql操作的方式则是非交互式连接，我们的应用服务器通过Hibernate或者JDBC来实现和数据库的通信。

## 怎么解决连接闲置超时的问题？

这两种连接方式都有各自对应的一个超时时间属性，交互式连接是interactive_timeout；非交互式连接是wait_timeout。

既然是闲置超时，那么解决的办法也很简单，就是直接将这个时间设置得更长些；在MySQL中最多可以设置到365天(即31536000，默认单位是s)，有两种设置的方法。

### 第一种设置方式：修改配置文件`my.ini`文件

该配置文件在MySQL的安装目录下，如果没有此文件，可以复制`my-default.ini`文件，将生成的复件重命名成`my.ini`；然后在文件中添加如下语句：

```sql
wait_timeout=31536000  
interactive_timeout=31536000 
```

如果没有这两个语句则表示默认值是8小时(60*60*8=28800)；需要注意的是，wait_timeout的最大值分别是24天/365天(Windows/Linux)。

### 第二种设置方式：使用mysql命令进行修改

```sql
set global interactive_timeout=设置值
set global wait_timeout=设置值
```

不过闲置时间设置得过大并不好，MySQL里大量的SLEEP连接无法及时释放，拖累系统性能；设置得过小又容易产生如上所述的错误；由于我们的web项目中经常会使用到连接池技术，所以我们有更好的解决方法，那就是在项目中设置连接池的属性。

## 在项目中设置连接池的属性

我的项目是使用的c3p0，所以这里只介绍c3p0的设置方法，如下：

### 方法一：减少连接池内连接的生存周期

既然MySQL连接的默认闲置时间是8小时，那么只要将连接池内连接的生产周期设置得比8小时短就行了。

```xml
<bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource"> 
	<!-- 连接的最大空闲时间，若超过该时间还没被使用过则会自动断开，单位为s，默认为0(即永远不会断开) -->      
	<property name="maxIdleTime" value="1800"/>       
</bean> 
```

### 方法二：定期使用连接池内的连接

```xml
<bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">  
	<!-- 
    定义所有连接测试都执行的测试语句。在使用连接测试的情况下这个可以显著提高测试速度。
    注意：测试的表必须在初始数据源的时候就存在。Default:null 
    -->  
	<property name="preferredTestQuery" value="SELECT 1"/> 

	<!-- 每1800秒检查所有连接池中的空闲连接 -->
	<property name="idleConnectionTestPeriod" value="1800"/> 
	   
	<!-- 
    如果设置为true，则每次从池中取一个连接就做一下测试，使用automaticTestTable或者preferredTestQuery来做一条查询语句。
    看看连接好不好用，如果不好用就关闭它，接着重新从池中拿一个。 
    -->
	<property name="testConnectionOnCheckout" value="true"/>    
</bean>
```
