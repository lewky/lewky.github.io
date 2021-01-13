# 执行gulp build报错

## 问题与分析

在执行`gulp build`报错如下：
```
D:\coding\Resume\Resumes>gulp build
gulp build[5628]: src\node_contextify.cc:628: Assertion `args[1]->IsString()' failed.

D:\coding\Resume\Resumes>gulp -v
[22:00:13] CLI version 2.0.1
[22:00:13] Local version 3.9.1
```
<!--more-->

网上有很多人也遇到这个问题，到GitHub上的nodejs项目的issue里也可以找到该问题，[地址在这](https://github.com/nodejs/node/issues/20325)。

根据查阅的资料来看，这个问题是由于node升级到10.0.0后出现的，回退版本即可，按照GitHub上的答案选择使用8.11.2版本的node。

## 解决方法

不要使用改成10.0.0及以上版本的node，可以选择使用8.11.2版本的node。

如果确实有需要去使用高版本的node，可以选择nodejs的多版本管理工具，方便切换不同版本的node。这里推荐一个Windows下可以使用的node.js的多版本管理工具`nvm-windows`，可以参考下[这篇文章](https://lewky.cn/posts/1908545a.html)。

## 参考链接

* [gulp 报错](https://segmentfault.com/q/1010000014630331)
* [Github issue #20325](https://github.com/nodejs/node/issues/20325)
