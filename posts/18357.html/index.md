# Java高并发秒杀API(二)之Service层

## **1. 设计前的分析**

>**分层的必要性**

* DAO层工作演变为:接口设计+SQL编写（不需要其他杂七杂八的功能）
* 代码和SQL的分离,方便review（浏览）
* DAO拼接等逻辑在Service层完成（DAO只需负责SQL语句，其他都由Service层完成）
<!--more-->

一些初学者容易出现的错误，就是喜欢在DAO层进行逻辑的编写，其实DAO就是数据访问的缩写，它只进行数据的访问操作。

>**业务接口的编写**

初学者总是关注细节，关注接口如何去实现，这样设计出来的接口往往比较冗余。业务接口的编写要站在“使用者”的角度定义，三个方面：方法定义的粒度、参数、返回值。

* 方法定义粒度：关注接口的功能本身，至于这个功能需要包含哪些步骤那是具体的实现，也就是说，功能明确而且单一。
* 参数：方法所需要的数据，供使用者传入，明确方法所需要的数据，而且尽可能友好，简练。
* 返回值：一般情况下，entity数据不够，需要自定义DTO,也有可能抛出异常，需要自定义异常，不管是DTO还是异常，尽可能将接口调用的信息返回给使用者，哪怕是失败信息。

>**DTO与entity的区别**

DTO数据传输层：用于Web层和Service层之间传递的数据封装。

entity：用于业务数据的封装，比如数据库中的数据。

>**关于秒杀地址的暴露**

1. 需要有专门一个方法实现秒杀地址输出，避免人为因素提前知道秒杀地址而出现漏洞。
2. 获取秒杀url时，如果不合法，则返回当前时间和秒杀项目的时间；如果合法，才返回md5加密后url，以避免url被提前获知。
3. 使用md5将url加密、校验，防止秒杀的url被篡改。

>**MD5加密**

Spring提供了MD5生成工具。代码如下：

```java
	DigestUtils.md5DigestAsHex();
```

MD5盐值字符串（salt），用于混淆MD5，添加MD5反编译难度

## **2. Service层的接口设计**

在`src/main/java`包下建立`com.lewis.service`包，用来存放Service接口；在`src/main/java`包下建立`com.lewis.exception`包，用来存放Service层出现的异常类：比如重复秒杀异常、秒杀已关闭异常；在`src/main/java`包下建立`com.lewis.dto`包，用来封装Web层和Service层之间传递的数据。

>**定义SeckillService接口**

```java	
	/**
	 * 业务接口:站在使用者(程序员)的角度设计接口 三个方面:1.方法定义粒度，方法定义的要非常清楚2.参数，要越简练越好 3.返回类型(return
	 * 类型一定要友好/或者return异常，我们允许的异常)
	 */
	public interface SeckillService {
	
		/**
		 * 查询全部的秒杀记录
		 * 
		 * @return
		 */
		List<Seckill> getSeckillList();
	
		/**
		 * 查询单个秒杀记录
		 * 
		 * @param seckillId
		 * @return
		 */
		Seckill getById(long seckillId);
	
		// 再往下，是我们最重要的行为的一些接口
	
		/**
		 * 在秒杀开启时输出秒杀接口的地址，否则输出系统时间和秒杀时间
		 * 
		 * @param seckillId 秒杀商品Id
		 * @return 根据对应的状态返回对应的状态实体
		 */
		Exposer exportSeckillUrl(long seckillId);
	
		/**
		 * 执行秒杀操作，有可能失败，有可能成功，所以要抛出我们允许的异常
		 * 
		 * @param seckillId 秒杀的商品ID
		 * @param userPhone 手机号码
		 * @param md5 md5加密值
		 * @return 根据不同的结果返回不同的实体信息
		 */
		SeckillExecution executeSeckill(long seckillId, long userPhone, String md5) throws SeckillException,
				RepeatKillException, SeckillCloseException;
	}
```

>**在dto包中创建Exposer.java，用于封装秒杀的地址信息**

```java
	/**
	 * 暴露秒杀地址(接口)DTO
	 */
	public class Exposer {
	
		// 是否开启秒杀
		private boolean exposed;
	
		// 加密措施
		private String md5;
	
		//id为seckillId的商品的秒杀地址
		private long seckillId;
	
		// 系统当前时间(毫秒)
		private long now;
	
		// 秒杀的开启时间
		private long start;
	
		// 秒杀的结束时间
		private long end;
	
		public Exposer(boolean exposed, String md5, long seckillId) {
			this.exposed = exposed;
			this.md5 = md5;
			this.seckillId = seckillId;
		}
	
		public Exposer(boolean exposed, long seckillId, long now, long start, long end) {
			this.exposed = exposed;
			this.seckillId = seckillId;
			this.now = now;
			this.start = start;
			this.end = end;
		}
	
		public Exposer(boolean exposed, long seckillId) {
			this.exposed = exposed;
			this.seckillId = seckillId;
		}
	
		public boolean isExposed() {
			return exposed;
		}
	
		public void setExposed(boolean exposed) {
			this.exposed = exposed;
		}
	
		public String getMd5() {
			return md5;
		}
	
		public void setMd5(String md5) {
			this.md5 = md5;
		}
	
		public long getSeckillId() {
			return seckillId;
		}
	
		public void setSeckillId(long seckillId) {
			this.seckillId = seckillId;
		}
	
		public long getNow() {
			return now;
		}
	
		public void setNow(long now) {
			this.now = now;
		}
	
		public long getStart() {
			return start;
		}
	
		public void setStart(long start) {
			this.start = start;
		}
	
		public long getEnd() {
			return end;
		}
	
		public void setEnd(long end) {
			this.end = end;
		}
	
		@Override
		public String toString() {
			return "Exposer{" + "exposed=" + exposed + ", md5='" + md5 + '\'' + ", seckillId=" + seckillId + ", now=" + now
					+ ", start=" + start + ", end=" + end + '}';
		}
	}
```

>**在dto包中创建SeckillExecution.java，用于封装秒杀是否成功的结果（该对象用来返回给页面）**

```java
	/**
	 * 封装执行秒杀后的结果:是否秒杀成功
	 */
	public class SeckillExecution {
	
	    private long seckillId;
	
	    //秒杀执行结果的状态
	    private int state;
	
	    //状态的明文标识
	    private String stateInfo;
	
	    //当秒杀成功时，需要传递秒杀成功的对象回去
	    private SuccessKilled successKilled;
	
	    //秒杀成功返回所有信息
	    public SeckillExecution(long seckillId, int state, String stateInfo, SuccessKilled successKilled) {
	        this.seckillId = seckillId;
	        this.state = state;
	        this.stateInfo = stateInfo;
	        this.successKilled = successKilled;
	    }
	
	    //秒杀失败
	    public SeckillExecution(long seckillId, int state, String stateInfo) {
	        this.seckillId = seckillId;
	        this.state = state;
	        this.stateInfo = stateInfo;
	    }
	
	    public long getSeckillId() {
	        return seckillId;
	    }
	
	    public void setSeckillId(long seckillId) {
	        this.seckillId = seckillId;
	    }
	
	    public int getState() {
	        return state;
	    }
	
	    public void setState(int state) {
	        this.state = state;
	    }
	
	    public String getStateInfo() {
	        return stateInfo;
	    }
	
	    public void setStateInfo(String stateInfo) {
	        this.stateInfo = stateInfo;
	    }
	
	    public SuccessKilled getSuccessKilled() {
	        return successKilled;
	    }
	
	    public void setSuccessKilled(SuccessKilled successKilled) {
	        this.successKilled = successKilled;
	    }
	}
```

在exception包中创建秒杀过程中可能出现的异常类

>**定义一个基础的异常类SeckillException，继承自RuntimeException**

```java	
	/**
	 * 秒杀相关的所有业务异常
	 */
	public class SeckillException extends RuntimeException {
	    public SeckillException(String message) {
	        super(message);
	    }
	
	    public SeckillException(String message, Throwable cause) {
	        super(message, cause);
	    }
	}
```

>**重复秒杀异常，继承自SeckillException**

```java
	/**
	 * 重复秒杀异常，是一个运行期异常，不需要我们手动try catch
	 * Mysql只支持运行期异常的回滚操作
	 */
	public class RepeatKillException extends SeckillException {
	
	    public RepeatKillException(String message) {
	        super(message);
	    }
	
	    public RepeatKillException(String message, Throwable cause) {
	        super(message, cause);
	    }
	}
```

>**秒杀已关闭异常，继承自SeckillException**

```java
	/**
	 * 秒杀关闭异常，当秒杀结束时用户还要进行秒杀就会出现这个异常
	 */
	public class SeckillCloseException extends SeckillException{
	    public SeckillCloseException(String message) {
	        super(message);
	    }
	
	    public SeckillCloseException(String message, Throwable cause) {
	        super(message, cause);
	    }
	}
```

## **3. Service层接口的实现**

在`com.lewis.service`包下再建立`impl`包，用来存放接口的实现类`SeckillServiceImpl`

```java
	public class SeckillServiceImpl implements SeckillService
	{
	    //日志对象
	    private Logger logger= LoggerFactory.getLogger(this.getClass());
	
	    //加入一个混淆字符串(秒杀接口)的salt，为了我避免用户猜出我们的md5值，值任意给，越复杂越好
	    private final String salt="aksehiucka24sf*&%&^^#^%$";
	
	    //注入Service依赖
	    @Autowired //@Resource
	    private SeckillDao seckillDao;
	
	    @Autowired //@Resource
	    private SuccessKilledDao successKilledDao;
	
	    public List<Seckill> getSeckillList() {
	        return seckillDao.queryAll(0,4);
	    }
	
	    public Seckill getById(long seckillId) {
	        return seckillDao.queryById(seckillId);
	    }
	
	    public Exposer exportSeckillUrl(long seckillId) {
	        Seckill seckill=seckillDao.queryById(seckillId);
	        if (seckill==null) //说明查不到这个秒杀产品的记录
	        {
	            return new Exposer(false,seckillId);
	        }
	
	        //若是秒杀未开启
	        Date startTime=seckill.getStartTime();
	        Date endTime=seckill.getEndTime();
	        //系统当前时间
	        Date nowTime=new Date();
	        if (startTime.getTime()>nowTime.getTime() || endTime.getTime()<nowTime.getTime())
	        {
	            return new Exposer(false,seckillId,nowTime.getTime(),startTime.getTime(),endTime.getTime());
	        }
	
	        //秒杀开启，返回秒杀商品的id、用给接口加密的md5
	        String md5=getMD5(seckillId);
	        return new Exposer(true,md5,seckillId);
	    }
	
	    private String getMD5(long seckillId)
	    {
	        String base=seckillId+"/"+salt;
	        String md5= DigestUtils.md5DigestAsHex(base.getBytes());
	        return md5;
	    }
	
	    //秒杀是否成功，成功:减库存，增加明细；失败:抛出异常，事务回滚
	    public SeckillExecution executeSeckill(long seckillId, long userPhone, String md5)
	            throws SeckillException, RepeatKillException, SeckillCloseException {
	
	        if (md5==null||!md5.equals(getMD5(seckillId)))
	        {
	            throw new SeckillException("seckill data rewrite");//秒杀数据被重写了
	        }
	        //执行秒杀逻辑:减库存+增加购买明细
	        Date nowTime=new Date();
	
	        try{
	            //减库存
	            int updateCount=seckillDao.reduceNumber(seckillId,nowTime);
	            if (updateCount<=0)
	            {
	                //没有更新库存记录，说明秒杀结束
	                throw new SeckillCloseException("seckill is closed");
	            }else {
	                //否则更新了库存，秒杀成功,增加明细
	                int insertCount=successKilledDao.insertSuccessKilled(seckillId,userPhone);
	                //看是否该明细被重复插入，即用户是否重复秒杀
	                if (insertCount<=0)
	                {
	                    throw new RepeatKillException("seckill repeated");
	                }else {
	                    //秒杀成功,得到成功插入的明细记录,并返回成功秒杀的信息
	                    SuccessKilled successKilled=successKilledDao.queryByIdWithSeckill(seckillId,userPhone);
	                    return new SeckillExecution(seckillId,1,"秒杀成功",successKilled);
	                }
	            }
	
	        }catch (SeckillCloseException e1)
	        {
	            throw e1;
	        }catch (RepeatKillException e2)
	        {
	            throw e2;
	        }catch (Exception e)
	        {
	            logger.error(e.getMessage(),e);
	            //将编译期异常转化为运行期异常
	            throw new SeckillException("seckill inner error :"+e.getMessage());
	        }
	
	    }
	}
```

在以上代码中，我们捕获了运行时异常，原因是Spring的事务默认是发生了RuntimeException才会回滚，发生了其他异常不会回滚，所以在最后的catch块里通过`throw new SeckillException("seckill inner error :"+e.getMessage());`将编译期异常转化为运行期异常。

另外，在代码里还存在着硬编码的情况，比如秒杀结果返回的state和stateInfo参数信息是输出给前端的，这些字符串应该考虑用常量枚举类封装起来，方便重复利用，也易于维护。

>**在`src/main/java`包下新建一个枚举包`com.lewis.enums`包，在该包下创建一个枚举类型SeckillStatEnum**

```java
	public enum SeckillStatEnum {
	
	    SUCCESS(1,"秒杀成功"),
	    END(0,"秒杀结束"),
	    REPEAT_KILL(-1,"重复秒杀"),
	    INNER_ERROR(-2,"系统异常"),
	    DATE_REWRITE(-3,"数据篡改");
	
	    private int state;
	    private String info;
	
	    SeckillStatEnum(int state, String info) {
	        this.state = state;
	        this.info = info;
	    }
	
	    public int getState() {
	        return state;
	    }
	
	    public String getInfo() {
	        return info;
	    }
	
	    public static SeckillStatEnum stateOf(int index) {
	        for (SeckillStatEnum state : values()) {
	            if (state.getState()==index) {
	                return state;
	            }
	        }
			return null;
		}
	}
```

>**创建了枚举类型后，就需要修改之前硬编码的地方，修改`SeckillExecution`涉及到state和stateInfo参数的构造方法**

```java
	//秒杀成功返回所有信息
	 public SeckillExecution(long seckillId, SeckillStatEnum statEnum, SuccessKilled successKilled) {
	     this.seckillId = seckillId;
	     this.state = statEnum.getState();
	     this.stateInfo = statEnum.getInfo();
	     this.successKilled = successKilled;
	 }
	
	 //秒杀失败
	 public SeckillExecution(long seckillId, SeckillStatEnum statEnum) {
	     this.seckillId = seckillId;
	     this.state = statEnum.getState();
	     this.stateInfo = statEnum.getInfo();
	 }
```

接着把`SeckillServiceImpl`里返回的秒杀成功信息的`return new SeckillExecution(seckillId,1,"秒杀成功",successKilled);`改成`return new SeckillExecution(seckillId, SeckillStatEnum.SUCCESS,successKilled);`

## 4. 使用Spring进行Service层的配置

>**在之前创建的`spring`包下创建spring-service.xml**

```xml
	<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
		xmlns:context="http://www.springframework.org/schema/context"
		xmlns:tx="http://www.springframework.org/schema/tx"
		xsi:schemaLocation="http://www.springframework.org/schema/beans
	        http://www.springframework.org/schema/beans/spring-beans.xsd
	        http://www.springframework.org/schema/context 
	        http://www.springframework.org/schema/context/spring-context.xsd 
	        http://www.springframework.org/schema/tx 
	        http://www.springframework.org/schema/tx/spring-tx.xsd">
	
		<!--扫描service包下所有使用注解的类型 -->
		<context:component-scan base-package="com.lewis.service" />
	
		<!--配置事务管理器 -->
		<bean id="transactionManager"
			class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
			<!--注入数据库连接池 -->
			<property name="dataSource" ref="dataSource" />
		</bean>
	
		<!--配置基于注解的声明式事务 默认使用注解来管理事务行为 -->
		<tx:annotation-driven transaction-manager="transactionManager" />
	
	</beans>
```

>**事务管理器**

MyBatis采用的是JDBC的事务管理器

Hibernate采用的是Hibernate的事务管理器

>**通过注解的方式将Service的实现类（注意，不是Service接口）加入到Spring IoC容器中**

```java
	@Service
	public class SeckillServiceImpl implements SeckillService;
```

>**在需要进行事务声明的方法上加上事务的注解@Transactional**

```java	
	@Transactional
	public SeckillExecution executeSeckill(long seckillId, long userPhone, String md5)
			throws SeckillException, RepeatKillException, SeckillCloseException {}
```

>**Spring的声明式事务管理**

- 异常捕获机制

Java异常分编译期异常和运行期异常，运行期异常不需要手工try-catch，Spring的的声明式事务只接收运行期异常回滚策略，非运行期异常不会帮我们回滚。

- 事务传播行为

Spring一共有7个事务传播行为，默认的事务传播行为是`PROPAGATION_REQUIRED`，详情可以参考[这篇文章](http://blog.csdn.net/it_wangxiangpan/article/details/24180085)

>**使用注解控制事务方法的优点（对于秒杀这种对事务延迟要求高的业务场景尤为重要）**

 * 1.开发团队达成一致约定，明确标注事务方法的编程风格
 * 2.保证事务方法的执行时间尽可能短，不要穿插其他网络操作RPC/HTTP请求或者剥离到事务方法外部（保证事务方法里面是很干净的/效率的）
 * 3.不是所有的方法都需要事务，如只有一条修改操作、只读操作不要事务控制（MYSQL 表级锁、行级锁）

>**为什么使用IoC（控制反转）**

1. 对象创建统一托管。
2. 规范的生命周期管理。
3. 灵活的依赖注入。
4. 一致的对象获取方式。

>**Spring基于注解的事务操作**

* 在Spring早期版本中是使用ProxyFactoryBean+XMl方式来配置事务。
* 在Spring配置文件使用tx:advice+aop命名空间，好处就是一次配置永久生效，你无须去关心中间出的问题，不过出错了你很难找出来在哪里出了问题。
* 注解@Transactional的方式，注解可以在方法定义、接口定义、类定义、public方法上，但是不能注解在private、final、static等方法上，因为Spring的事务管理默认是使用Cglib动态代理的：
	* private方法因为访问权限限制，无法被子类覆盖
	* final方法无法被子类覆盖
	* static是类级别的方法，无法被子类覆盖
	* protected方法可以被子类覆盖，因此可以被动态字节码增强

>**不能被Spring AOP事务增强的方法**

|序号|动态代理策略|不能被事务增强的方法|
|-|-|-|
|1|基于接口的动态代理|除了public以外的所有方法，并且public static的方法也不能被增强|
|2|基于Cglib的动态代理|private、static、final的方法|

>**关于Spring的组件注解、注入注解**

* @Component：标识一个组件，当不知道是什么组件，或者该组件不好归类时使用该注解
* @Service：标识业务层组件
* @Repository：标识DAO层组件
* @Controller：标识控制层组件

通过Spring提供的组件自动扫描机制，可以在类路径下寻找标注了上述注解的类，并把这些类纳入进spring容器中管理，这些注解的作用和在xml文件中使用bean节点配置组件时一样的。

```xml
	<context:component-scan base-package=”xxx.xxx.xxx”>
```

`component-scan`标签默认情况下自动扫描指定路径下的包(含所有子包)，将带有@Component、@Repository、@Service、@Controller标签的类自动注册到spring容器。getBean的默认名称是类名（头字母小写），如果想自定义，可以@Service(“aaaaa”)这样来指定。这种bean默认是“singleton”的，如果想改变，可以使用@Scope(“prototype”)来改变。

当使用`<context:component-scan/>`后，就可以将`<context:annotation-config/>`移除了，前者包含了后者。

另外，@Resource，@Inject 是J2EE规范的一些注解

@Autowired是Spring的注解，可以对类成员变量、方法及构造函数进行标注，完成自动装配的工作。通过 @Autowired的使用来消除setter/getter方法，默认按类型装配，如果想使用名称装配可以结合@Qualifier注解进行使用，如下：

```java
	@Autowired() @Qualifier("baseDao")     
	private BaseDao baseDao; 
```

与@Autowired类似的是@Resource，@Resource属于J2EE规范，默认安照名称进行装配，名称可以通过name属性进行指定，如果没有指定name属性，当注解写在字段上时，默认取字段名进行按照名称查找，如果注解写在setter方法上默认取属性名进行装配。当找不到与名称匹配的bean时才按照类型进行装配。但是需要注意的是，如果name属性一旦指定，就只会按照名称进行装配。

```java
	@Resource(name="baseDao")     
	private BaseDao baseDao; 
```

而@Inject与@Autowired类似，也是根据类型注入，也可以通过@Named注解来按照name注入，此时只会按照名称进行装配。

```java
	@Inject @Named("baseDao")
	private BaseDao baseDao; 
```

## **5. 进行Service层的集成测试**

>**使用logback来输出日志信息，在`resources`包下创建logback.xml**

```xml
	<?xml version="1.0" encoding="UTF-8"?>
	<configuration>
	  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
	    <!-- encoders are assigned the type
	         ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
	    <encoder>
	      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
	    </encoder>
	  </appender>
	
	  <root level="debug">
	    <appender-ref ref="STDOUT" />
	  </root>
	</configuration>
```

>**通过IDE工具快速生成Junit单元测试，然后在各个方法里写测试代码。**

```java
	@RunWith(SpringJUnit4ClassRunner.class)
	//告诉junit spring的配置文件
	@ContextConfiguration({"classpath:spring/spring-dao.xml",
	                        "classpath:spring/spring-service.xml"})
	public class SeckillServiceTest {
	
	    private final Logger logger= LoggerFactory.getLogger(this.getClass());
	
	    @Autowired
	    private SeckillService seckillService;
	
	    @Test
	    public void testGetSeckillList() throws Exception {
	        List<Seckill> list=seckillService.getSeckillList();
	        logger.info("list={}", list);
	    }
	
	    @Test
	    public void testGetById() throws Exception {
	        long seckillId=1000;
	        Seckill seckill=seckillService.getById(seckillId);
	        logger.info("seckill={}", seckill);
	    }

	}
```

在测试通过了这两个方法后，开始对后两个业务逻辑方法的测试，首先测试`testExportSeckillUrl()`

```java
	@Test
	public void testExportSeckillUrl() throws Exception {
		long seckillId=1000;
		Exposer exposer=seckillService.exportSeckillUrl(seckillId);
		logger.info("exposer={}", exposer);
	}
```

会发现没有返回商品的秒杀地址，因为我们数据库的秒杀时间和结束秒杀时间没有修改，所以判断当前商品的秒杀已结束。将数据库中的秒杀时间和结束秒杀时间修改成满足我们当前的时间的范围，重新测试该方法，可以获取到该商品的秒杀地址。而第四个方法的测试需要使用到该地址（md5），将该值传入到`testExecuteSeckill()`中进行测试：

```java
	@Test
	public void testExecuteSeckill() throws Exception {
		long seckillId=1000;
		long userPhone=13476191876L;
		String md5="70b9564762568e9ff29a4a949f8f6de4";
		
		SeckillExecution execution=seckillService.executeSeckill(seckillId,userPhone,md5);
		logger.info("result={}", execution);
	}
```

需要注意的是，该方法是会产生异常的，比如我们重复运行该方法，会报错，因为用户进行了重复秒杀，所以我们需要手动try-catch，将程序允许的异常包起来而不去向上抛给junit，更改测试代码如下:

```java
	@Test
	public void testExecuteSeckill() throws Exception {
		long seckillId=1000;
		long userPhone=13476191876L;
		String md5="70b9564762568e9ff29a4a949f8f6de4";
		
		try {
			SeckillExecution execution = seckillService.executeSeckill(seckillId, userPhone, md5);
			logger.info("result={}", execution);
		}catch (RepeatKillException e)
		{
			logger.error(e.getMessage());
		}catch (SeckillCloseException e1)
		{
			logger.error(e1.getMessage());
		}
	}
```

在测试过程中，第四个方法使用到了第三个方法返回的秒杀地址，在实际开发中，我们需要将第三个和第四个方法合并成一个完整逻辑的方法：

```java
	//集成测试代码完整逻辑，注意可重复执行
	@Test
    public void testSeckillLogic() throws Exception {
        long seckillId=1000;
        Exposer exposer=seckillService.exportSeckillUrl(seckillId);
        if (exposer.isExposed())
        {
            logger.info("exposer={}", exposer);
            long userPhone=13476191876L;
            String md5=exposer.getMd5();

            try {
                SeckillExecution execution = seckillService.executeSeckill(seckillId, userPhone, md5);
                logger.info("result={}", execution);
            }catch (RepeatKillException e)
            {
                logger.error(e.getMessage());
            }catch (SeckillCloseException e1)
            {
                logger.error(e1.getMessage());
            }
        }else {
            //秒杀未开启
            logger.warn("exposer={}", exposer);
        }
    }
```

>**我们可以在SeckillServiceTest类里面加上@Transational注解，原因是：**

@Transactional注解是表明此测试类的事务启用，这样所有的测试方案都会自动的 rollback，即不用自己清除自己所做的任何对数据库的变更了。

>**日志无法打印的问题**

在pom.xml中加上

```xml
	<dependency>

      <groupId>ch.qos.logback</groupId>

      <artifactId>logback-classic</artifactId>

      <version>1.1.9</version>

    </dependency>
```

>**存在的坑**

* 关于同类中调用事务方法的时候有个坑，同学们需要注意下AOP切不到调用事务方法。事务不会生效，解决办法有几种，可以搜一下，找一下适合自己的方案。本质问题是类内部调用时AOP不会用代理调用内部方法。
* 没有引入AOP的xsd会报错

```xml
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance
	
			http://www.springmodules.org/schema/cache/springmodules-cache.xsd 
	
			http://www.springmodules.org/schema/cache/springmodules-ehcache.xsd"
```

>**相关链接**

[Spring事务异常回滚，捕获异常不抛出就不会回滚](http://blog.csdn.net/yipanbo/article/details/46048413)

>**本节结语**

至此，关于Java高并发秒杀API的Service层的开发与测试已经完成，接下来进行Web层的开发，详情请参考下一篇文章。

上一篇文章：[**Java高并发秒杀API(一)之业务分析与DAO层**](http://blog.csdn.net/lewky_liu/article/details/78159983)

下一篇文章：[**Java高并发秒杀API(三)之Web层**](http://blog.csdn.net/lewky_liu/article/details/78162153)

