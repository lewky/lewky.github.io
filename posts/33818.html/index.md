# Java高并发秒杀API(三)之Web层

## **1. 设计前的分析**

>**Web层内容相关**

* 前端交互设计
* Restful规范
* SpringMVC<!--more-->
* Bootstrap + jQuery

>**前端页面流程**

 ![前端页面流程](/images/posts/project/seckill/前端页面流程.jpg)

>**详情页流程逻辑**

 ![详情页流程逻辑](/images/posts/project/seckill/详情页流程逻辑.jpg)

>**为什么要获取标准系统时间（服务器的时间）**

用户可能处在不同时区，用户的电脑的系统时间可能不同。

>**Restful规范**

Restful规范是一种优雅的URI表达方式：/模块/资源/{标识}/集合1/···

GET -> 查询操作

POST -> 添加/修改操作（用于非幂等操作）

PUT -> 修改操作（用于幂等操作）

DELETE -> 删除操作

>**怎么实现Restful接口**

* @RequestMapping(value = "/path",<font color="red">method = RequestMethod.GET</font>)
* @RequestMapping(value = "/path",<font color="red">method = RequestMethod.POST</font>)
* @RequestMapping(value = "/path",<font color="red">method = RequestMethod.PUT</font>)
* @RequestMapping(value = "/path",<font color="red">method = RequestMethod.DELETE</font>)

>**非幂等操作和幂等操作**

幂等性（idempotency）意味着对同一URL的多个请求应该返回同样的结果。在Restful规范中，GET、PUT、DELETE是幂等操作，只有POST是非幂等操作。

POST和PUT都可以用来创建和更新资源，二者的区别就是前者用于非幂等操作，后者用于幂等操作。

简单来说，使用POST方法请求创建一个资源，如果将这条请求重复发送N次，就会创建出N个资源；而如果用GET方法请求创建一个资源，就算重复发送该请求N次，也只会创建一个资源（就算第一次请求创建出来的资源）。

附：[《幂等和高并发在电商系统中的使用》](http://www.cnblogs.com/RunForLove/p/5640949.html)

>**秒杀API的URL设计**

 ![秒杀API的URL设计](/images/posts/project/seckill/秒杀API的URL设计.jpg)

>**@RequestMapping的映射技巧**

 ![注解映射技巧](/images/posts/project/seckill/注解映射技巧.jpg)

>**请求方法细节处理**

1. 请求参数绑定
2. 请求方法限制
3. 请求转发和重定向
4. 数据模型赋值
5. 返回json数据
6. Cookie访问

## **2. 整合配置SpringMVC框架**

### **2.1 配置web.xml**

```xml
	<web-app xmlns="http://java.sun.com/xml/ns/javaee"
	         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
	                      http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
	         version="3.0"
	         metadata-complete="true">
		<!--用maven创建的web-app需要修改servlet的版本为3.0 -->
		<!--配置DispatcherServlet -->
		<servlet>
			<servlet-name>seckill-dispatcher</servlet-name>
			<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
			<!-- 配置SpringMVC 需要配置的文件 spring-dao.xml，spring-service.xml,spring-web.xml 
				MyBatis -> Spring -> SpringMVC -->
			<init-param>
				<param-name>contextConfigLocation</param-name>
				<param-value>classpath:spring/spring-*.xml</param-value>
			</init-param>
		</servlet>
		<servlet-mapping>
			<servlet-name>seckill-dispatcher</servlet-name>
			<!--默认匹配所有请求 -->
			<url-pattern>/</url-pattern>
		</servlet-mapping>
	</web-app>
```

>**注意**

* 这里的Servlet版本是3.0，对应Tomcat7.0版本
* 由于我们的配置文件都是以`spring-`开头命名的，所以可以用通配符*一次性全部加载
* `url-pattern`设置为`/`，这是使用了Restful的规范；在使用Struts框架时我们配置的是*.do之类的，这是一种比较丑陋的表达方式

### **2.2 在`src/main/resources/spring`包下建立spring-web.xml**

```xml
	<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans"
	       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	       xmlns:context="http://www.springframework.org/schema/context"
	       xmlns:mvc="http://www.springframework.org/schema/mvc"
	       xsi:schemaLocation="http://www.springframework.org/schema/beans
	        http://www.springframework.org/schema/beans/spring-beans.xsd
	        http://www.springframework.org/schema/context
	        http://www.springframework.org/schema/context/spring-context.xsd
	        http://www.springframework.org/schema/mvc
	        http://www.springframework.org/schema/mvc/spring-mvc.xsd">
	
	    <!--配置spring mvc-->
	    <!--1,开启springmvc注解模式
	    a.自动注册DefaultAnnotationHandlerMapping,AnnotationMethodHandlerAdapter
	    b.默认提供一系列的功能:数据绑定，数字和日期的format@NumberFormat,@DateTimeFormat
	    c:xml,json的默认读写支持-->
	    <mvc:annotation-driven/>
	
	    <!--2.静态资源默认servlet配置-->
	    <!--
	        1).加入对静态资源处理：js,gif,png
	        2).允许使用 "/" 做整体映射
	    -->
	    <mvc:default-servlet-handler/>
	
	    <!--3：配置JSP 显示ViewResolver-->
	    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
	        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
	        <property name="prefix" value="/WEB-INF/jsp/"/>
	        <property name="suffix" value=".jsp"/>
	    </bean>
	
	    <!--4:扫描web相关的controller-->
	    <context:component-scan base-package="com.lewis.web"/>
	</beans>
```

## **3. Controller设计**

Controller中的每一个方法都对应我们系统中的一个资源URL，其设计应该遵循Restful接口的设计风格。

### **3.1 在java包下新建`com.lewis.web`包，在该包下新建SeckillController.java**

```java
	@Controller
	@RequestMapping("/seckill")//url:模块/资源/{}/细分
	public class SeckillController
	{
	    @Autowired
	    private SeckillService seckillService;
	
	    @RequestMapping(value = "/list",method = RequestMethod.GET)
	    public String list(Model model)
	    {
	        //list.jsp+mode=ModelAndView
	        //获取列表页
	        List<Seckill> list=seckillService.getSeckillList();
	        model.addAttribute("list",list);
	        return "list";
	    }
	
	    @RequestMapping(value = "/{seckillId}/detail",method = RequestMethod.GET)
	    public String detail(@PathVariable("seckillId") Long seckillId, Model model)
	    {
	        if (seckillId == null)
	        {
	            return "redirect:/seckill/list";
	        }
	
	        Seckill seckill=seckillService.getById(seckillId);
	        if (seckill==null)
	        {
	            return "forward:/seckill/list";
	        }
	
	        model.addAttribute("seckill",seckill);
	
	        return "detail";
	    }
	
	    //ajax ,json暴露秒杀接口的方法
	    @RequestMapping(value = "/{seckillId}/exposer",
	                    method = RequestMethod.GET,
	                    produces = {"application/json;charset=UTF-8"})
	    @ResponseBody
	    public SeckillResult<Exposer> exposer(@PathVariable("seckillId") Long seckillId)
	    {
	        SeckillResult<Exposer> result;
	        try{
	            Exposer exposer=seckillService.exportSeckillUrl(seckillId);
	            result=new SeckillResult<Exposer>(true,exposer);
	        }catch (Exception e)
	        {
	            e.printStackTrace();
	            result=new SeckillResult<Exposer>(false,e.getMessage());
	        }
	
	        return result;
	    }
	
	    @RequestMapping(value = "/{seckillId}/{md5}/execution",
	            method = RequestMethod.POST,
	            produces = {"application/json;charset=UTF-8"})
	    @ResponseBody
	    public SeckillResult<SeckillExecution> execute(@PathVariable("seckillId") Long seckillId,
	                                                   @PathVariable("md5") String md5,
	                                                   @CookieValue(value = "userPhone",required = false) Long userPhone)
	    {
	        if (userPhone==null)
	        {
	            return new SeckillResult<SeckillExecution>(false,"未注册");
	        }
	
	        try {
	            SeckillExecution execution = seckillService.executeSeckill(seckillId, userPhone, md5);
	            return new SeckillResult<SeckillExecution>(true, execution);
	        }catch (RepeatKillException e1)
	        {
	            SeckillExecution execution=new SeckillExecution(seckillId, SeckillStatEnum.REPEAT_KILL);
	            return new SeckillResult<SeckillExecution>(true,execution);
	        }catch (SeckillCloseException e2)
	        {
	            SeckillExecution execution=new SeckillExecution(seckillId, SeckillStatEnum.END);
	            return new SeckillResult<SeckillExecution>(true,execution);
	        }
	        catch (Exception e)
	        {
	            SeckillExecution execution=new SeckillExecution(seckillId, SeckillStatEnum.INNER_ERROR);
	            return new SeckillResult<SeckillExecution>(true,execution);
	        }
	    }
	
	    //获取系统时间
	    @RequestMapping(value = "/time/now",method = RequestMethod.GET)
	    @ResponseBody
	    public SeckillResult<Long> time()
	    {
	        Date now=new Date();
	        return new SeckillResult<Long>(true,now.getTime());
	    }
	}
```

>**注意**

SpringMVC在处理Cookie时有个小问题：如果找不到对应的Cookie会报错，所以设置为`required=false`，将Cookie是否存在的逻辑判断放到代码中来判断。

>**关于异常的捕捉**

Service层中的抛出异常是为了让Spring能够回滚，Controller层中捕获异常是为了将异常转换为对应的Json供前台使用，缺一不可。

### **3.2 在dto包下新建一个SeckillResult**

```java
	//将所有的ajax请求返回类型，全部封装成json数据
	public class SeckillResult<T> {
	
	    //请求是否成功
	    private boolean success;
	    private T data;
	    private String error;
	
	    public SeckillResult(boolean success, T data) {
	        this.success = success;
	        this.data = data;
	    }
	
	    public SeckillResult(boolean success, String error) {
	        this.success = success;
	        this.error = error;
	    }
	
	    public boolean isSuccess() {
	        return success;
	    }
	
	    public void setSuccess(boolean success) {
	        this.success = success;
	    }
	
	    public T getData() {
	        return data;
	    }
	
	    public void setData(T data) {
	        this.data = data;
	    }
	
	    public String getError() {
	        return error;
	    }
	
	    public void setError(String error) {
	        this.error = error;
	    }
	}
```

>**注意**

SeckillResult是一个VO类(View Object)，属于DTO层，用来封装json结果，方便页面取值；在这里，将其设计成泛型<T>，就可以和灵活地往里边封装各种类型的对象。

这里的success属性不是指秒杀执行的结果，而是指页面是否发送请求成功，至于秒杀之后是否成功的这个结果则是封装到了data属性里。

## **4. 基于Bootstrap开发页面**

由于项目的前端页面都是由Bootstrap开发的,所以需要先去下载Bootstrap或者是使用在线的CDN服务。而Bootstrap又是依赖于jQuery的，所以需要先引入jQuery。

### **4.1 在`webapp`下建立`resources`目录，接着建立`script`目录，建立seckill.js**

```js
	//存放主要交互逻辑的js代码
	// javascript 模块化(package.类.方法)
	
	var seckill = {
	
	    //封装秒杀相关ajax的url
	    URL: {
	        now: function () {
	            return '/seckill/seckill/time/now';
	        },
	        exposer: function (seckillId) {
	            return '/seckill/seckill/' + seckillId + '/exposer';
	        },
	        execution: function (seckillId, md5) {
	            return '/seckill/seckill/' + seckillId + '/' + md5 + '/execution';
	        }
	    },
	
	    //验证手机号
	    validatePhone: function (phone) {
	        if (phone && phone.length == 11 && !isNaN(phone)) {
	            return true;//直接判断对象会看对象是否为空,空就是undefine就是false; isNaN 非数字返回true
	        } else {
	            return false;
	        }
	    },
	
	    //详情页秒杀逻辑
	    detail: {
	        //详情页初始化
	        init: function (params) {
	            //手机验证和登录,计时交互
	            //规划我们的交互流程
	            //在cookie中查找手机号
	            var userPhone = $.cookie('userPhone');
	            //验证手机号
	            if (!seckill.validatePhone(userPhone)) {
	                //绑定手机 控制输出
	                var killPhoneModal = $('#killPhoneModal');
	                killPhoneModal.modal({
	                    show: true,//显示弹出层
	                    backdrop: 'static',//禁止位置关闭
	                    keyboard: false//关闭键盘事件
	                });
	
	                $('#killPhoneBtn').click(function () {
	                    var inputPhone = $('#killPhoneKey').val();
	                    console.log("inputPhone: " + inputPhone);
	                    if (seckill.validatePhone(inputPhone)) {
	                        //电话写入cookie(7天过期)
	                        $.cookie('userPhone', inputPhone, {expires: 7, path: '/seckill'});
	                        //验证通过　　刷新页面
	                        window.location.reload();
	                    } else {
	                        //todo 错误文案信息抽取到前端字典里
	                        $('#killPhoneMessage').hide().html('<label class="label label-danger">手机号错误!</label>').show(300);
	                    }
	                });
	            }
	
	            //已经登录
	            //计时交互
	            var startTime = params['startTime'];
	            var endTime = params['endTime'];
	            var seckillId = params['seckillId'];
	            $.get(seckill.URL.now(), {}, function (result) {
	                if (result && result['success']) {
	                    var nowTime = result['data'];
	                    //时间判断 计时交互
	                    seckill.countDown(seckillId, nowTime, startTime, endTime);
	                } else {
	                    console.log('result: ' + result);
	                    alert('result: ' + result);
	                }
	            });
	        }
	    },
	
	    handlerSeckill: function (seckillId, node) {
	        //获取秒杀地址,控制显示器,执行秒杀
	        node.hide().html('<button class="btn btn-primary btn-lg" id="killBtn">开始秒杀</button>');
	
	        $.get(seckill.URL.exposer(seckillId), {}, function (result) {
	            //在回调函数种执行交互流程
	            if (result && result['success']) {
	                var exposer = result['data'];
	                if (exposer['exposed']) {
	                    //开启秒杀
	                    //获取秒杀地址
	                    var md5 = exposer['md5'];
	                    var killUrl = seckill.URL.execution(seckillId, md5);
	                    console.log("killUrl: " + killUrl);
	                    //绑定一次点击事件
	                    $('#killBtn').one('click', function () {
	                        //执行秒杀请求
	                        //1.先禁用按钮
	                        $(this).addClass('disabled');//,<-$(this)===('#killBtn')->
	                        //2.发送秒杀请求执行秒杀
	                        $.post(killUrl, {}, function (result) {
	                            if (result && result['success']) {
	                                var killResult = result['data'];
	                                var state = killResult['state'];
	                                var stateInfo = killResult['stateInfo'];
	                                //显示秒杀结果
	                                node.html('<span class="label label-success">' + stateInfo + '</span>');
	                            }
	                        });
	                    });
	                    node.show();
	                } else {
	                    //未开启秒杀(浏览器计时偏差)
	                    var now = exposer['now'];
	                    var start = exposer['start'];
	                    var end = exposer['end'];
	                    seckill.countDown(seckillId, now, start, end);
	                }
	            } else {
	                console.log('result: ' + result);
	            }
	        });
	
	    },
	
	    countDown: function (seckillId, nowTime, startTime, endTime) {
	        console.log(seckillId + '_' + nowTime + '_' + startTime + '_' + endTime);
	        var seckillBox = $('#seckill-box');
	        if (nowTime > endTime) {
	            //秒杀结束
	            seckillBox.html('秒杀结束!');
	        } else if (nowTime < startTime) {
	            //秒杀未开始,计时事件绑定
	            var killTime = new Date(startTime + 1000);//todo 防止时间偏移
	            seckillBox.countdown(killTime, function (event) {
	                //时间格式
	                var format = event.strftime('秒杀倒计时: %D天 %H时 %M分 %S秒 ');
	                seckillBox.html(format);
	            }).on('finish.countdown', function () {
	                //时间完成后回调事件
	                //获取秒杀地址,控制现实逻辑,执行秒杀
	                console.log('______fininsh.countdown');
	                seckill.handlerSeckill(seckillId, seckillBox);
	            });
	        } else {
	            //秒杀开始
	            seckill.handlerSeckill(seckillId, seckillBox);
	        }
	    }
	};
```

>**脚本文件的技巧**

使用Json来讲JavaScript模块化（类似于Java的package），不要将js都写成一堆，不易维护，页不方便阅读。

>**特殊说明**

由于本人的Eclipse内嵌的Tomcat设置的原因，我需要在URL里的所有路径前加上`/seckill`（我的项目名）才可以正常映射到Controller里对应的方法，如下

```js
	//封装秒杀相关ajax的url
    URL: {
        now: function () {
            return '/seckill/seckill/time/now';
        },
        exposer: function (seckillId) {
            return '/seckill/seckill/' + seckillId + '/exposer';
        },
        execution: function (seckillId, md5) {
            return '/seckill/seckill/' + seckillId + '/' + md5 + '/execution';
        }
    },
```

如果有同学在后边测试页面时找不到路径，可以将这里的路径里的`/seckill`删掉

### **4.2 编写页面**

在`WEB-INF`目录下新建一个`jsp`目录，在这里存放我们的jsp页面，为了减少工作量，也为了方便，将每个页面都会使用到的头部文件和标签库分离出来，放到`common`目录下，在jsp页面中静态包含这两个公共页面就行了。

关于jsp页面请从源码中拷贝，实际开发中前端页面由前端工程师完成，但是后端工程师也应该了解jQuery和ajax，想要了解本项目的页面是如何实现的请观看慕课网的[Java高并发秒杀API之Web层](http://www.imooc.com/learn/630)。

>**静态包含和动态包含的区别**

静态包含会直接将页面包含进来，最终只生成一个Servlet；而动态包含会先将要包含进来的页面生成Servlet后再包含进来，最终会生成多个Servlet。

>**存在的坑**

在页面里不要写成`<script/>`，这样写会导致后边的js加载不了，所以要写成`<script></script>`。

>**EL表达式**

startTime是Date类型的，通过`${startTime.time}`来将Date转换成long类型的毫秒值。

### **4.3 测试页面**

先clean下Maven项目，接着编译Maven项目（`-X compile`命令），然后启动Tomcat，在浏览器输入`http://localhost:8080/seckill/seckill/list`，成功进入秒杀商品页面；输入`http://localhost:8080/seckill/seckill/1000/detail`成功进入详情页面。

>**配置使用jquery countdown插件**

1.pom.xml   

```xml
	<dependency>
	
	  <groupId>org.webjars.bower</groupId>
	
	  <artifactId>jquery.countdown</artifactId>
	
	  <version>2.1.0</version>
	
	 </dependency>
```

2.页面

```js
	   <script src="${pageContext.request.contextPath}/webjars/jquery.countdown/2.1.0/dist/jquery.countdown.min.js"></script>
```

>**其他问题**

关于显示`NaN天 NaN时 NaN分 NaN秒`的问题，原因是new Date(startTime + 1000)，startTime 被解释成一个字符串了。

解决办法：

1. new Date(startTime-0 + 1000);
2. new Date(Number(startTime) + 1000);

>**关于分布式环境下的几个问题以及慕课网张老师的回答**

* 根据系统标准时间判断，如果分布式环境下各机器时间不同步怎么办？同时发起的两次请求，可能一个活动开始，另一个提示没开始。

后端服务器需要做NTP时间同步，如每5分钟与NTP服务同步保证时间误差在微妙级以下。时间同步在业务需要或者活性检查场景很常见(如hbase的RegionServer)

* 如果判断逻辑都放到后端，遇到有刷子，后端处理这些请求扛不住了怎么办？可能活动没开始，服务器已经挂掉了。

秒杀开启判断在前端和后端都有，后端的判断比较简单取秒杀单做判断，这块的IO请求是DB主键查询很快，单DB就可以抗住几万QPS,后面也会加入redis缓存为DB减负。

* 负载均衡问题，比如根据地域在nginx哈希，怎样能较好的保证各机器秒杀成功的尽量分布均匀呢。

负载均衡包括nginx入口端和后端upstream服务，在入口端一般采用智能DNS解析请求就近进入nginx服务器。后端upstgream不建议采用一致性hash，防止请求不均匀。后端服务无状态可以简单使用轮训机制。nginx负载均衡本身过于简单，可以使用openresty自己实现或者nginx之后单独架设负载均衡服务如Netflix的Zuul等。

对于流量爆增的造成后端不可用情况，这门课程(Java高并发秒杀API)并没有做动态降级和弹性伸缩架构上的处理，后面受慕课邀请会做一个独立的实战课，讲解分布式架构，弹性容错，微服务相关的内容，到时会加入这方面的内容。

>**本节结语**

至此，关于Java高并发秒杀API的Web层的开发与测试已经完成，接下来进行对该秒杀系统进行高并发优化，详情可以参考下一篇文章。

上一篇文章：[**Java高并发秒杀API(二)之Service层**](http://blog.csdn.net/lewky_liu/article/details/78162149)

下一篇文章：[**Java高并发秒杀API(四)之高并发优化**](http://blog.csdn.net/lewky_liu/article/details/78166080)

