# Spring Data Redis问题汇总


## 前言

本文基于以下版本：

```xml
<!--  对应的是3.3.0版本的jedis（redis的java客户端） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <version>2.4.0</version>
</dependency>
```
<!--more-->
## SpringBoot配置Redis

```
## 配置redis连接
spring.redis.host=localhost
spring.redis.port=6379

## 是否使用redis作为cache
#spring.cache.type=none
spring.cache.type=redis

## 默认情况下redis中的数据永不过期
#spring.cache.redis.time-to-live=30s

## 是否存储null值
#spring.cache.redis.cache-null-values=false

## key是否使用前缀
#spring.cache.redis.use-key-prefix=true
#spring.cache.redis.key-prefix=tb-
```

## RedisTemplate存储数据到Redis后key值出现`\xac\xed\x00\x05`

由于SpringData的redis模块用的是jedis包，因此在使用RedisTemplate操作数据时，默认使用的是JDK的序列化器`JdkSerializationRedisSerializer`。当存入数据到Redis后，原本的String类型或者Hash类型的key值就会变成带有`\xac\xed\x00\x05`前缀的值。

建议对于String、hash类型的值，使用String序列化器：

```java
@EnableCaching
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(final RedisConnectionFactory redisConnectionFactory) {
        final RedisTemplate<String, Object> template = new RedisTemplate<String, Object>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setEnableDefaultSerializer(false);
        template.setKeySerializer(RedisSerializer.string());
        template.setValueSerializer(RedisSerializer.java());
        template.setHashKeySerializer(RedisSerializer.string());
        template.setHashValueSerializer(RedisSerializer.string());
        template.afterPropertiesSet();

        return template;
    }

}
```

## Redis宕机导致@Cacheable直接抛出异常，服务不可用

当使用@Cacheable来将数据存入Redis时，如果Redis服务器不可达会导致系统直接抛出异常，从而使得服务不可用，正常来说就算Redis挂了也不应该影响原本的业务逻辑的正常运行下去。

需要写一个CacheErrorHandler来对上述异常进行处理：

```java
@EnableCaching
@Configuration
@Slf4j
public class RedisConfig extends CachingConfigurerSupport {

    /*
     * (non-Javadoc)
     * @see org.springframework.cache.annotation.CachingConfigurerSupport#errorHandler()
     */
    @Override
    public CacheErrorHandler errorHandler() {

        return new CacheErrorHandler() {

            @Override
            public void handleCachePutError(final RuntimeException exception, final Cache cache, final Object key, final Object value) {
                log.error("Failed to put key '{}' into Redis Cache: {}.", key, cache.getName(), exception);
            }

            @Override
            public void handleCacheGetError(final RuntimeException exception, final Cache cache, final Object key) {
                log.error("Failed to get key '{}' from Redis Cache: {}.", key, cache.getName(), exception);
            }

            @Override
            public void handleCacheEvictError(final RuntimeException exception, final Cache cache, final Object key) {
                log.error("Failed to evict key '{}' from Redis Cache: {}.", key, cache.getName(), exception);
                throw exception;
            }

            @Override
            public void handleCacheClearError(final RuntimeException exception, final Cache cache) {
                log.error("Failed to clear Redis Cache: {}.", cache.getName(), exception);
            }
        };
    }
}
```

## 参考链接

* [RedisTemplate写入Redis数据出现无意义乱码前缀\xac\xed\x00\x05](https://blog.csdn.net/hunger_wang/article/details/118713579)
* [Spring @Cacheable redis异常不影响正常业务方案](https://www.jb51.net/article/205878.htm)