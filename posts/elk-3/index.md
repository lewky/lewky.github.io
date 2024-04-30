# ELK系列(3) - Logstash问题汇总

## 启动参数

启动Logstash时可以指定一些参数：

```
-w # 指定线程,默认是cpu核数 
-f # 指定配置文件
-r # 启用热加载，可以在运行期间修改配置文件并生效
-t # 测试配置文件是否正常
-b # 执行filter模块之前最大能积累的日志，数值越大性能越好，同时越占内存
```
<!--more-->
## 关闭Logstash

如果将Logstash作为服务启动的，通过以下方式之一关闭：

```
// systemd
systemctl stop logstash

// upstart
initctl stop logstash

// sysv
/etc/init.d/logstash stop
```

如果是在POSIX系统的控制台中直接运行Logstash则这样关闭：

```
kill -TERM {logstash_pid}
```

或者在控制台中输入`Ctrl-C`。

## 启动、关闭脚本

下面是一个Logstash启动、关闭的ansible脚本，里面有几个环境变量（logstash_home，logstash_bin_folder，logstash_config）需要替换成对应的值才能作为一个完整的shell文件执行：

```shell
#!/bin/sh

#LOGSTASH_USAGE is the message if this script is called without any options
LOGSTASH_USAGE="Usage: $0 {start|stop|status|restart}"

#SHUTDOWN_WAIT is wait time in seconds for java proccess to stop
SHUTDOWN_WAIT=20

#------ private functions
logstash_pid() {
  echo `ps -fe | grep {{ logstash_home }} | grep -v grep | grep -v $0 | tr -s " "|cut -d" " -f2`
}

start() {
  pid=$(logstash_pid)
  if [ -n "$pid" ]
  then
    echo -e "Logstash is already running (pid: $pid)"
  else
    # Start Logstash
    echo -e "Starting Logstash"
    nohup sh {{ logstash_bin_folder }}/logstash -f {{ logstash_config }} &
  fi
  return 0
}

status(){
  pid=$(logstash_pid)
  if [ -n "$pid" ]; then echo -e "Logstash is running with pid: $pid"
  else echo -e "Logstash is not running"
  fi
}

stop() {
  pid=$(logstash_pid)
  if [ -n "$pid" ]
  then
    echo -e "Stoping Logstash [$pid]"
    kill -TERM $pid

    let kwait=$SHUTDOWN_WAIT
    count=0;
    until [ `ps -p $pid | grep -c $pid` = '0' ] || [ $count -gt $kwait ]
    do
      echo -n -e "\nwaiting for processes to exit";
      sleep 1
      let count=$count+1;
    done

    if [ $count -gt $kwait ]; then
      echo -n -e "\nkilling processes which didn't stop after $SHUTDOWN_WAIT seconds"
      kill -9 $pid
    fi
  else
    echo -e "Logstash is not running"
  fi

  return 0
}

#----- main program
case $1 in
  start)
    start
  ;;

  stop)
    stop
  ;;

  restart)
    stop
    start
  ;;

  status)
    status
  ;;

  *)
    echo -e $LOGSTASH_USAGE
  ;;
esac

exit 0
```

## 分割字符串并添加新的字段到Elasticsearch

有时需要对收集到的日志等信息进行分割，并且将分割后的字符作为新的字段index到Elasticsearch里。假定需求如下：

Logstash收集到的日志字段`message`的值是由多个字段拼接而成的，分隔符是`;,;`，如下：

```
{
    "message": "key_1=value_1;,;key_2=value_2"
}
```

现在想要将`message`的值拆分成2个新的字段：key_1、key_2，并且将它们index到ES里，可以借助Logstash的filter的插件来完成；这里提供两种解决方案。

### 方案一：使用mutate插件

```
filter {
    mutate {
        split => ["message",";,;"]
    }

    if [message][0] {
        mutate {                
            add_field =>   {
                "temp1" => "%{[message][0]}"
            }
        }
    }
    
    if [message][1] {
        mutate {                
            add_field =>   {
                "temp2" => "%{[message][1]}"
            }
        }
    }   

    if [temp1][1] {
        mutate {
            split => ["temp1","="]
            add_field =>   {
                "%{[temp1][0]}" => "%{[temp1][1]}"
            }
        }
    }
    
    if [temp2][1] {
        mutate {
            split => ["temp2","="]
            add_field =>   {
                "%{[temp2][0]}" => "%{[temp2][1]}"
            }
            remove_field => [ "temp1", "temp2", "message" ]
        }
    }
}
```

在filter里可以通过`if [varA]`来判断一个变量varA是否为空或null，如果需要取反则是`if ![varA]`。

从上面代码可以看出，这种做法很麻烦，也不利于日后的维护。每当`message`里被拼接的字段的数量增加时，就必须同步改动这里的filter逻辑，而且添加的代码量也是呈线性递增的。

此外，这里使用的诸如`temp1`等临时变量，可以用`[@metadata][temp1]`的写法来作为临时变量，这样就不需要去手动remove掉了。

### 方案二：使用ruby插件

```
filter {
	ruby {
		code => "
			array1 = event.get('message').split(';,;')
			array1.each do |temp1|
				if temp1.nil? then
					next
				end
				array2 = temp1.split('=')
				key = array2[0]
				value = array2[1]
				if key.nil? then
					next
				end
				event.set(key, value)
			end
		"
		remove_field => [ "message" ]
	}
}
```

ruby插件可以允许你使用ruby的语法来完成各种复杂的逻辑，使用这种方案可以完美解决方案一中的不足之处，便于日后的维护。

## block in multi_receive_encoded

测试坏境中Logstash总是会down掉，查看了下日志文件，发现报错如下：

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

其实这里的stdout插件是不必要的，之前只是在本地测试使用到的。而在测试环境下，并发量远非本地测试能比，此外将大量的message输出到console上也会对性能产生影响。可以说，这种配置等同于在Java代码中频繁使用`System.out.print()`语句来输出信息，应该去除掉，最终output的配置如下：

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

## 参考链接

* [Logstash事件字段遍历](https://blog.csdn.net/mvpboss1004/article/details/78069877)
* [Logstash详解之——filter模块](https://yq.aliyun.com/articles/154341)
* [logstash filter如何判断字段是够为空或者null](https://elasticsearch.cn/article/6192)
* [Shutting Down Logstash](https://www.elastic.co/guide/en/logstash/6.6/shutdown.html)