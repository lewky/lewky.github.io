# 嵌套循环的优化

## 需求背景

今天拿到这样一个需求：有Map A和Map B，这两个Map都持有着一个同样的key——id，其对应的value可能相同，也可能不相同。现在需要对两个Map中该key对应的value相同的键值对做些特殊的操作。

这是个很简单的需求，代码很简单，我直接一个循环里嵌套另一个循环去实现这个功能需求：<!--more-->

```java
for(Map.Entry<String, String> entry : mapA.entrySet()) {
    //do something，需要循环10次
    for(Map.Entry<String, String> entry : mapB.entrySet()){
          //do something，需要循环1000次
    }
}
```

写的时候也没有考虑太多，提交代码给组长review的时候，组长表示这里的循环嵌套这样写不好，因为在实际业务中，集合B会比较大，假设mapA的size是10，mapB的size是1000，这样写就需要循环10*1000次，毕竟循环的时候需要进行一系列操作，假如有很多人同时通过ui来触发这段逻辑，就可能存在性能上的问题，对于用户来说，如果点击ui上的一个按钮需要等待个十来秒才有结果，那简直是毁灭性的用户体验。

所以遇到这种需要嵌套循环的时候，应该尽量减少循环的次数；此外，一般情况下将大循环放到内部，将小循环放在外部，也会提高性能。

## 一种优化思路

根据组长的建议，我可以将内部的大循环的循环次数尽量降低，原本是n*m的总循环次数，可以根据业务需求尽量拆分成n+m的总循环次数。当然，不太可能真的拆分成n+m，只是尽量往这个方向靠拢。

想要实现这个优化，就只能对内部的大循环进行分组。具体怎么分组呢？可以new一个新的map，然后按照id分组(这里是因为我的业务需求中id会重复，所以将id作为分组依据)。将id相同的数据分成一组，然后存放到一个ArrayList中；然后这个id作为key存入map里，而这个ArrayList则作为value存入map里。

假设原本内部大循环的集合size是1000，我们将其分成了10组，而外部小循环的集合size是10，那么原本的10*1000总循环次数就可以变形成1000+10*10次。如下：

```java
for(Map.Entry<String, String> entry : mapB.entrySet()){
     //先对大集合Map B进行分组，并存入一个Map C中，需要循环1000次
}
for(Map.Entry<String, String> entry : mapA.entrySet()) {
    //do something，需要循环10次
    for(Map.Entry<String, String> entry : mapC.entrySet()){
          //do something，需要循环10次
    }
}
```
当然了，这种优化思路是在特定的功能需求下才能实现的，具体问题具体分析，因为组长的提醒，我才知道原来嵌套循环还可以这样来优化，代码之道果然是要日积月累才行。

另外关于大循环在内小循环在外的写法的具体分析，可以看看这篇文章：[for循环嵌套的效率](https://blog.csdn.net/gudongxian/article/details/50392274)

可惜暂时我还看不懂。。
