# Prometheus简易入门

## 前言

APM系统即Application Performance Management应用性能管理，目的是对企业的关键业务系统进行实时性能监控和故障管理，主要有以下三个维度：日志聚合Logs、业务指标Metrics、链路跟踪Traces。

在现今很流行的分布式架构微服务系统中，主流的APM系统组件：日志聚合可以使用ELK Stack，业务指标采用Prometheus，链路跟踪使用SkyWalking。比如新时代的银行业务系统需要上云，日志往往采用云服务商提供的日志聚合平台（如阿里云的SLS、腾讯云的CLS）。

## 架构理解

Prometheus基于HTTP的Pull方式采集时序数据，由Go语言编写，其总体架构分为三层：采集层、存储计算层、应用层。

这里的Pull指的是指标抓取模型，还有对应的Push模型，其区别在于被监控服务是否主动将指标数据推送到监控服务。

在Prometheus的Pull模型中，每一个被Prometheus监控的服务都是一个job。被监控服务一般通过主动暴露metrics端口，或通过exporter方式暴露指标metrics_path，监控服务通过服务发现模块发现被监控服务，从而定期抓取业务指标（如性能，交易量，交易成功率等）。

### 存储计算层

分为两部分：Prometheus server服务端，Service discovery服务发现。

**Prometheus server**：存储计算层的核心，包含了存储引擎和计算引擎，有以下三大组件。

* **Retrieval**：取数组件，会主动从Pushgateway或者jobs/exporters拉取指标数据。
* **TSDB**：时间序列数据库，属于内存数据库，负责存储采集到的时序数据。指标数据以时间序列的形式保存在内存中，并且定时刷到磁盘节点（HDD/SSD）上，默认是两个小时回刷一次。并且为了防止Prometheus发生崩溃或重启时能够恢复数据，Prometheus也提供了类似MySQL中binlog一样的预写日志，当Prometheus崩溃重启时，会读这个预写日志来恢复数据。
* **HTTP server**：对外提供HTTP服务。

**Service discovery**：可以动态发现要监控的目标，支持多种服务发现协议：kubernetes_sd、file_sd等。

### 采集层

分为两类：一类生命周期较短的作业，一类生命周期较长的作业。

1）短作业：直接通过API（比如Java的MetricsServlet），在退出时（比如Flink）将指标推送给Pushgateway，Retrieval组件再从Pushgateway拉取指标数据。

2）长作业：Retrieval组件直接从jobs或exporters拉取指标数据，jobs或exporters在Prometheus中属于targets，即采集目标。

### 应用层

分为两种：负责数据可视化、导出的Prometheus web UI，负责告警的Alertmanager。

1）Alertmanager：当PromeQL查询的指标超过Rules文件定义的阈值时，Prometheus会发出一条告警到Alertmanager，manager会将告警下发到配置好的钉钉、微信、邮件等进行告警。

2）Prometheus web UI：官方提供的可视化界面，通过PromQL查询语言来查询指标。也可以使用其他组件进行查询，如Grafana、API Clients。

## 安装与配置

可以从官网下载自己需要的组件服务：https://prometheus.io/download/

prometheus是必备的服务（即Prometheus server），其他的诸如告警alertmanager、采集blackbox_exporter / node_exporter / pushgateway等自行选择是否需要下载安装，下载后解压开来即可使用。

prometheus服务只有一个配置文件`prometheus.yml`，初始配置分为三部分：

1）`global`全局配置模块：

* `scrape_interval`：拉取数据的时间间隔，默认为1分钟。
* `evaluation_interval`：规则验证（生成alert）的时间间隔，默认为1分钟。

2）`alerting`和`rule_files`告警配置模块。

3）`scrape_configs`抓取配置模块。Prometheus自身运行信息可以通过HTTP访问，所以Prometheus可以监控自身的运行数据。

* `job_name`：监控作业的名称。
* `static_configs`：静态目标配置，固定从某个target拉取数据。
* `targets`：指定监控的目标，Prometheus会从配置的target采集指标数据。

Prometheus支持动态更新配置，在启动Prometheus时添加`--web.enable-lifecycle`启动参数即可开启该功能：

```
prometheus --config.file=/usr/local/etc/prometheus.yml --web.enable-lifecycle
```

之后无需重启Prometheus，可以通过HTTP服务来通知Prometheus重新加载最新配置：

```cmd
curl -v --request POST 'http://localhost:9090/-/reload'
```

## PromQL

### 查询时间序列

### 范围查询

### 时间位移操作

### 聚合操作

### 标量和字符串

### 合法的PromQL表达式

### 操作符

## 参考链接

* [【尚硅谷】Prometheus+Grafana+睿象云的监控告警系统](https://www.bilibili.com/video/BV1HT4y1Z7vR/?p=1)
* [监控神器：Prometheus 轻松入门，真香！](https://mp.weixin.qq.com/s?__biz=MzI4Njc5NjM1NQ==&mid=2247524071&idx=1&sn=2b687afad4fa96bcaa2f7ac6f7af9085&chksm=ebd5a1cbdca228dda7e4b5bc5c9217f83c96735fe343228e263ceddc53ae0c125d6a4104661d&scene=27)