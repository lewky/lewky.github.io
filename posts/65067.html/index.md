# SSM实战项目 - Java高并发秒杀API

## 前言

 本文包括了项目的完整流程+开发过程中遇到的各种坑的总结+学习笔记和问题扩展

## 项目截图

### 秒杀列表

![秒杀列表](/images/posts/project/seckill/秒杀列表.jpg)
<!--more-->

### 秒杀详情页

![秒杀详情页](/images/posts/project/seckill/秒杀详情页.jpg)

### 错误提示

![错误提示](/images/posts/project/seckill/错误提示.jpg)

### 开始秒杀

![开始秒杀](/images/posts/project/seckill/开始秒杀.jpg)

### 秒杀成功

![秒杀成功](/images/posts/project/seckill/秒杀成功.jpg)

### 重复秒杀

![重复秒杀](/images/posts/project/seckill/重复秒杀.jpg)

### 秒杀倒计时

![秒杀倒计时](/images/posts/project/seckill/秒杀倒计时.jpg)

### 秒杀结束

![秒杀结束](/images/posts/project/seckill/秒杀结束.jpg)

## 项目介绍

>何为秒杀？

所谓“秒杀”，就是网络卖家发布一些超低价格的商品，所有买家在同一时间网上抢购的一种销售方式。由于商品价格低廉，往往一上架就被抢购一空，有时只用一秒钟。

>为何选择Java高并发秒杀作为实战项目？

* 秒杀业务场景具有典型事务特性
* 秒杀/红包类需求越来越常见

>为何使用SpringMVC+Spring+MyBatis框架

* 框架易于使用和轻量级
* 低代码侵入性
* 成熟的社区和用户群

>能从该项目得到什么收获？

* 框架的使用和整合技巧
* 秒杀分析过程与优化思路

>项目来源

这是慕课网上的一个免费项目教学视频，名为Java高并发秒杀API，一共有如下四节课程，附带视频传送门（在视频中老师是用IDEA，本文用的是Eclipse）

* [Java高并发秒杀API之业务分析与DAO层](http://www.imooc.com/learn/587)
* [Java高并发秒杀API之Service层](http://www.imooc.com/learn/631)
* [Java高并发秒杀API之Web层](http://www.imooc.com/learn/630)
* [Java高并发秒杀API之高并发优化](http://www.imooc.com/learn/632)

## 相关技术介绍

>MySQL

* 表设计
* SQL技巧
* 事务和行级锁

>MyBatis

* DAO层设计与开发
* MyBatis合理使用
* 与Spring整合

>Spring

* Spring IOC整合Service
* 声明式事务运用

>SpringMVC

* Restful借口设计和使用
* 框架运作流程
* Controller开发技巧

>前端

* 交互设计
* Bootstrap
* jQuery

>高并发

* 高并发点和高并发分析
* 优化思路并实现

## 开发环境

* **操作系统**：Windows 8
* **IDE工具**：Eclipse
* **JDK**：JDK1.7
* **中间件**：Tomcat 7.0
* **数据库**：MySQL 5.0
* **构建工具**：Maven
* **框架**：SSM

## 项目总结

>本文根据慕课网的视频教学进行了相应的学习总结，全文较长，分为四节，附带CSDN传送门

* [**Java高并发秒杀API(一)之业务分析与DAO层**](http://blog.csdn.net/lewky_liu/article/details/78159983)
* [**Java高并发秒杀API(二)之Service层**](http://blog.csdn.net/lewky_liu/article/details/78162149)
* [**Java高并发秒杀API(三)之Web层**](http://blog.csdn.net/lewky_liu/article/details/78162153)
* [**Java高并发秒杀API(四)之高并发优化**](http://blog.csdn.net/lewky_liu/article/details/78166080)

>项目源码

* [**源码下载**](http://download.csdn.net/download/lewky_liu/10013556)
* [**GitHub地址**](https://github.com/lewky/Seckill)

