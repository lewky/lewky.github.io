# Apollo问题汇总

## Apollo简介

Apollo作为分布式配置中心，主要分为三个部分：客户端Client、服务端Server、管理门户Portal。Portal提供Web界面供用户管理配置。

Apollo涉及到3个进程，启动时需要按照configservice、adminservice、portal的顺序。

<!--more-->

## Apollo下发更新超时失败

项目使用Apollo来保存微服务接口的相关信息，做法是把部署在某个边车里的所有微服务接口信息都存到一个xml文件中，该文件会读取为一个字符串被保存到Apollo数据库release表的Configurations字段。每次改动某个接口时，都会触发一次xml文件的更新并下发到Apollo。

由于该字段是longtext类型，随着维护接口的数量增长，该字段要维护的xml文件越来越大，最大可达十几M，此时发现Apollo经常更新配置失败。

经过排查，发现Apollo底层用的Hibernate来将数据保存到数据库，由于没有给Apollo客户端设置超时时间，该参数底层默认值为`-1`。对于httpclient的sockettimeout参数，`-1`表示使用系统默认值，在部署的Linux机器上该默认值为5秒，因此下发数据时由于Configurations字段值很大导致超时失败。

这里分为两部分来优化，一个是将边车中部分接口迁移到其他边车，减少当前边车对应的xml文件大小；一个是调大Apollo客户端的读取超时时间为20s，经过测试差不多需要五秒多的时间才能将原本十几M的xml文件保存到数据库中。

```java
public static ApolloOpenApiClient getApolloPortalClient() {
        String portalUrl = ESCConfigUtil.getValue("esc.apollo.portal"); // portal url
        String token = ESCConfigUtil.getValue("esc.apollo.token"); // 申请的token
        return ApolloOpenApiClient.newBuilder()
                .withReadTimeout(20000)
                .withPortalUrl(portalUrl)
                .withToken(token)
                .build();
}
```

此外，频繁更新下发数据，会导致release表和releasehistory表数据量剧增，Apollo本身没有对此提供清理策略，需要自行设置定时任务去定时定量删除无效或者无意义的历史数据。

## `value too long. length limit`

在下发数据到Apollo时报错ApolloOpenApiException，错误信息显示`value too long. length limit:2000000`，这个是因为下发的value数据（一个xml字符串）太大，超过了默认的长度。

Apollo数据库`apolloconfig`的`serverconfig`表有个属性控制了value长度，将`item.value.length.limit`值改成更大的长度，再重启Apollo进程即可。

这里还有另一个属性`item.key.length.limit`用于控制key的长度，改动生效也同理。

## 参考链接

* [聊聊 分布式配置中心 Apollo](https://zhuanlan.zhihu.com/p/528233977)