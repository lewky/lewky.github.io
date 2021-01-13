# ELK系列(7) - 测试环境下Logstash异常退出：block in multi_receive_encoded

## 问题与分析

在本地测试无误后将ELK部署到了测试环境，结果第二天发现Logstash挂掉了，一开始以为是自动部署之类导致的问题。之后几天时间里Logstash总是会down掉，查看了下日志文件，发现报错如下：

```json
[2019-06-28T07:56:13,148][FATAL][logstash.runner          ] An unexpected error occurred!
{
	: error=>#<Errno: : EPIPE: Brokenpipe-<STDOUT>>,
	: backtrace=>["org/jruby/RubyIO.java:1457:in `write'",
	"org/jruby/RubyIO.java:1428:in `write'",
	"/home/cbx6/software/logstash-6.6.1/vendor/bundle/jruby/2.3.0/gems/logstash-output-stdout-3.1.4/lib/logstash/outputs/stdout.rb:43:in `block in multi_receive_encoded'",
	"org/jruby/RubyArray.java:1734:in `each'",
	"/home/cbx6/software/logstash-6.6.1/vendor/bundle/jruby/2.3.0/gems/logstash-output-stdout-3.1.4/lib/logstash/outputs/stdout.rb:42:in `multi_receive_encoded'",
	"/home/cbx6/software/logstash-6.6.1/logstash-core/lib/logstash/outputs/base.rb:87:in `multi_receive'",
	"org/logstash/config/ir/compiler/OutputStrategyExt.java:114:in `multi_receive'",
	"org/logstash/config/ir/compiler/AbstractOutputDelegatorExt.java:97:in `multi_receive'",
	"/home/cbx6/software/logstash-6.6.1/logstash-core/lib/logstash/pipeline.rb:390:in `block in output_batch'",
	"org/jruby/RubyHash.java:1343:in `each'",
	"/home/cbx6/software/logstash-6.6.1/logstash-core/lib/logstash/pipeline.rb:389:in `output_batch'",
	"/home/cbx6/software/logstash-6.6.1/logstash-core/lib/logstash/pipeline.rb:341:in `worker_loop'",
	"/home/cbx6/software/logstash-6.6.1/logstash-core/lib/logstash/pipeline.rb:304:in `block in start_workers'"]
}
```

<!--more-->
从堆栈信息里可以看到关键字眼：`block in multi_receive_encoded`，`block in output_batch`；另外，还可以发现这些错误信息都是由`logstash-output-stdout-3.1.4`这个插件引发的。

简单分析来看，应该是由于测试环境下同一时间内太多message要经由`logstash-output-stdout`输出到控制台造成的某种未知的并发问题。下面是对应的Logstash的output的配置：

```xml
output {
    stdout {
        codec => rubydebug
    }
    elasticsearch {
        hosts => ["{{ cbx_logstash_es_server }}"]
        index => "%{indexName}"
        action => "index"
    }
}
```

根据配置，并结合堆栈信息来分析，可以认为是Logstash的stdout插件在高并发状态下使用`rubydebug`进行编解码时抛出了异常。

其实这里的stdout插件是不必要的，之前只是在本地测试使用到的。而在测试环境下，并发量远非本地测试能比，此外将大量的message输出到console上也会对性能产生影响。可以说，这种配置等同于在Java代码中频繁使用`System.out.print()`语句来输出信息，并不推荐这种做法。

## 解决方案

将配置文件里的stdout插件去掉，最终output的配置如下：
```xml
output {
    elasticsearch {
        hosts => ["{{ cbx_logstash_es_server }}"]
        index => "%{indexName}"
        action => "index"
    }
}
```

将stdout插件的配置去除后，在之后的一段时间里，测试环境的Logstash不再发生异常退出，证实该issue确实是由`stdout`的`codec`所引发的。注意，不要在正式环境使用该插件来输出信息到控制台，有可能会引发类似的并发异常问题或者性能问题。
