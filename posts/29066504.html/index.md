# Maven聚合工程怎么变回普通的Maven工程

## 问题

Maven聚合工程的父工程的packaging是pom，如果我们将其改为jar，会立刻报错：
```
Project build error: 'packaging' with value 'jar' is invalid. Aggregator projects require 'pom' as packaging.
```
<!--more-->

对于聚合工程来说，所有的子工程会被放置到父工程的目录下，然后在父工程的pom文件里会有如下的节点：
```
<modules>
    <module>test-child</module>
</modules>
```

这些modules节点正是引用了父工程pom文件的子工程。

## 解决方法

将父工程的modules节点全部去掉，注释掉也行，再将packaging的值从pom改成jar或者war，接着保存，修改成功。

虽然修改成功了，但是去父工程的目录下 ，你会发现那些子工程依然存在着。不过这些工程已经很父工程没有关系了，因为父工程已经不再是聚合工程了，可以将这些子工程移除掉。