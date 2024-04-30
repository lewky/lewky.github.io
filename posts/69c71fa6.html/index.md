# AngularJS - 入门小Demo

## AngularJS四大特效

MVC模式、模块化设计、自动化双向数据绑定、依赖注入

如果了解了后端开发知识，想必对这些词汇不会陌生，AngularJS融合了后端开发的一些思想，虽然身为前端框架，但与jQuery框架却是完全不相同的东西。

AngularJS分为几个模块，需要使用哪个模块的功能，就直接引入对应的模块，这种模块化设计具备高内聚、低耦合的特点。
官方提供的模块有：ng、ngRoute、ngAnimate
用户也可以自定义模块：angular.module('模块名', [])
这里的ng是引擎engine的缩写，类似于Nginx的Ngin也是engine的缩写(谐音？)
<!--more-->

## Demo1 - 表达式

在当前目录下新建一个demo-1.html文件，并将angular.min.js文件放置在同一目录下。

```html
<html>
<head>
	<title>AngularJS入门小Demo-1 表达式</title>
	<script src="angular.min.js"></script>
</head>
<body ng-app>
{{100+100}}
</body>
</html>
```

通过在html中引入`angular.min.js`，并在body标签中加入`ng-app`指令，则会对`{% raw %}{{}}{% endraw %}`里的表达式进行计算。双击打开这个html文件，会发现页面显示的是200，如果不加载ng-app指令，页面显示的则是`{% raw %}{{100+100}}{% endraw %}`。

## Demo2 - 双向绑定

```html
<html>
<head>
	<title>AngularJS入门小Demo-2 双向绑定</title>
	<script src="angular.min.js"></script>
</head>
<body ng-app>
请输入姓名：<input ng-model="name"><br>
请输入姓名：<input ng-model="name"><br>
{{name}}
</body>
</html>
```

通过`ng-model`来绑定变量，双击上边的页面文件，在任意一个输入框中输入字符，都会影响到绑定同一变量的标签元素。比起用js或者jQuery来实现这个功能，AngularJS的写法要简单快捷很多。

## Demo3 - 初始化指令

```html
<html>
<head>
	<title>AngularJS入门小Demo-3 初始化指令</title>
	<script src="angular.min.js"></script>
</head>
<body ng-app ng-init="name='JOJO'">
请输入姓名：<input ng-model="name"><br>
{{name}}
</body>
</html>
```

通过`ng-init`指令来对变量进行初始化，比如上边的html页面，在打开或刷新后，name变量的值会被初始化为JOJO。

## Demo4 - 控制器

```html
<html>
<head>
	<title>AngularJS入门小Demo-4 控制器</title>
	<script src="angular.min.js"></script>
	<script>
		//建立模块
		//第一个参数是自定义的模块名，第二个参数是引用的模块名
		var app = angular.module("myApp", []);
		//创建控制器
		app.controller("myController", function($scope){
			
			$scope.add = function() {
				return parseInt($scope.x) + parseInt($scope.y);
			}

		});
	</script>
</head>
<body ng-app="myApp" ng-controller="myController">
第一个数：<input ng-model="x"><br>
第二个数：<input ng-model="y">
结果：{{add()}}

</body>
</html>
```

自定义一个模块，为模块创建一个控制器，控制器里可以定义一些逻辑来处理绑定的变量。这里的控制器也有个参数$scope，这个参数表示作用域，可以通过该作用域来获取操作变量，它就是视图层和控制层交互数据的桥梁。

更多和$scope相关的，可以了解下这篇文章[关于AngularJS学习整理---浅谈$scope(作用域) 新手必备！](https://www.cnblogs.com/wlpower/p/6406890.html)。

## Demo5 - 事件指令

```html
<html>
<head>
	<title>AngularJS入门小Demo-5 事件指令</title>
	<script src="angular.min.js"></script>
	<script>
		//建立模块
		//第一个参数是自定义的模块名，第二个参数是引用的模块名
		var app = angular.module("myApp", []);
		//创建控制器
		app.controller("myController", function($scope){
			
			$scope.add = function() {
				return $scope.z = parseInt($scope.x) + parseInt($scope.y);
			}

		});
	</script>
</head>
<body ng-app="myApp" ng-controller="myController">
第一个数：<input ng-model="x"><br>
第二个数：<input ng-model="y">
<button ng-click="add()">运算</button><br>
结果：{{z}}

</body>
</html>
```

`ng-click`表示事件指令，类似于js里的绑定事件的用法。

## Demo6 - 循环数组

```html
<html>
<head>
	<title>AngularJS入门小Demo-6 循环数组</title>
	<script src="angular.min.js"></script>
	<script>
		//建立模块
		//第一个参数是自定义的模块名，第二个参数是引用的模块名
		var app = angular.module("myApp", []);
		//创建控制器
		app.controller("myController", function($scope){
			
			$scope.list = [101, 252, 345, 836];

		});
	</script>
</head>
<body ng-app="myApp" ng-controller="myController">
	<table>
		<tr ng-repeat="x in list">
			<td>{{x}}</td>
		</tr>
	</table>
</body>
</html>
```

使用`ng-repeat`来循环数组，类似于foreach的遍历操作。

## Demo7 - 循环对象数组(JSON)

```html
<html>
<head>
	<title>AngularJS入门小Demo-7 循环对象数组</title>
	<script src="angular.min.js"></script>
	<script>
		//建立模块
		//第一个参数是自定义的模块名，第二个参数是引用的模块名
		var app = angular.module("myApp", []);
		//创建控制器
		app.controller("myController", function($scope){
			
			$scope.list = [
				{name:'张三', math:99, chinese:88},
				{name:'李四', math:17, chinese:46},
				{name:'赵五', math:60, chinese:60}
			];

		});
	</script>
</head>
<body ng-app="myApp" ng-controller="myController">
	<table>
		<tr>
			<td>姓名</td>
			<td>学科</td>
			<td>分数</td>
		</tr>
		<tr ng-repeat="entity in list">
			<td>{{entity.name}}</td>
			<td>{{entity.math}}</td>
			<td>{{entity.chinese}}</td>
		</tr>
	</table>
</body>
</html>
```

实际应用中前后端一般通过JSON对象来交互，和上边的demo类似。

## Demo8 - 内置服务$http

前端数据一般从后端获得，我们一般使用AngularJS的内置服务$http来获取后端数据，下边的demo需要在容器中运行(比如Tomcat)。

首先建立一个demo-8.html文件，将页面和`angular.min.js`一起放置到web项目的`webapp`目录下。
```html
<html>
<head>
	<title>AngularJS入门小Demo-8 内置服务$http</title>
	<script src="angular.min.js"></script>
	<script>
		//建立模块
		//第一个参数是自定义的模块名，第二个参数是引用的模块名
		var app = angular.module("myApp", []);
		//创建控制器
		app.controller("myController", function($scope, $http){
			
			$scope.findList = function() {
			
				$http.get("data.json").success(
					function(response) {
						$scope.list = response;
					}
				);
			}

		});
	</script>
</head>
<body ng-app="myApp" ng-controller="myController" ng-init="findList()">
	<table>
		<tr>
			<td>姓名</td>
			<td>学科</td>
			<td>分数</td>
		</tr>
		<tr ng-repeat="entity in list">
			<td>{{entity.name}}</td>
			<td>{{entity.math}}</td>
			<td>{{entity.chinese}}</td>
		</tr>
	</table>
</body>
</html>
```

接着在同一目录下，新建一个`data.json`文件，内容如下：

```html
[
	{"name":"张三", "math":99, "chinese":88},
	{"name":"李四", "math":17, "chinese":46},
	{"name":"赵五", "math":60, "chinese":60}
]
```

需要注意的是，在`.json`文件中的数据必须严格遵守JSON的规范，所有key必须使用双引号，value除了数值型以外的类型也必须使用双引号。在Demo7中由于是在js中书写的，所以可以不必遵守严格的JSON格式。另外可以看到，这个`$http`的用法和AJAX很相似，其实其内部就是封装的AJAX。

本文最后附上所有demo源码，demo-8在里边的web项目里。可以通过`mvn tomcat7:run`来启动该web项目(或者双击源码里的start.bat来启动项目)，接着在浏览器地址栏输入`localhost:8080/demo-8.html`，即可得到该JSON数据。

## 项目相关

* [GitHub地址](https://github.com/lewky/AngularJS-demo)
* [下载地址](https://download.csdn.net/download/lewky_liu/10737742)
