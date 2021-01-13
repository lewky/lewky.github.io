# ELK系列(5) - Logstash怎么分割字符串并添加新的字段到Elasticsearch

## 问题

有时候我们想要在Logstash里对收集到的日志等信息进行分割，并且将分割后的字符作为新的字符来index到Elasticsearch里。假定需求如下：

Logstash收集到的日志字段`message`的值是由多个字段拼接而成的，分隔符是`;,;`，如下：
<!--more-->
```
{
    "message": "key_1=value_1;,;key_2=value_2"
}
```

现在想要将`message`的值拆分成2个新的字段：key_1、key_2，并且将它们index到ES里，可以借助Logstash的filter的插件来完成；这里提供两种解决方案。

## 方案一：使用mutate插件

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

看得出来，这种做法很麻烦，也不利于日后的维护。每当`message`里被拼接的字段的数量增加时，就必须同步改动这里的filter逻辑，而且添加的代码量也是呈线性递增的。

此外，这里使用的诸如`temp1`等临时变量，可以用`[@metadata][temp1]`的写法来作为临时变量，这样就不需要去手动remove掉了。

## 方案二：使用ruby插件

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

## 参考链接

* [Logstash事件字段遍历](https://blog.csdn.net/mvpboss1004/article/details/78069877)
* [Logstash详解之——filter模块](https://yq.aliyun.com/articles/154341)
* [logstash filter如何判断字段是够为空或者null](https://elasticsearch.cn/article/6192)
