# cmd - 使用curl命令的注意点

## 前言

最近在cmd中使用curl命令来测试rest api，发现有不少问题，这里记录一下。
<!--more-->

## 在cmd中使用curl命令的注意事项

* json不能由单引号包括起来
* json数据里的双引号要用反斜杠`\`转义
* json数据里不能带有空格
* 如果想要在json数据里使用空格则必须用双引号将整个json数据包括起来
* `Content-type`要由双引号包括起来

比如下边的例子就是正确的格式：
```
curl -X POST localhost:8080/employees -H "Content-type:application/json" -d "{\"name\": \"Samwise Gamgee\", \"role\": \"gardener\"}"
```

总的来说，还是用postman来测试rest api方便快捷。

## 参考链接

* [使用curl post json到webApi](https://blog.csdn.net/programmeryu/article/details/52677563)
