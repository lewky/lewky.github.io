# cmd - bat文件如何关闭回显

## echo命令

>bat文件是dos下的批处理文件，可以一次性执行多条dos命令，其扩展名为.bat或.cmd，通过双击该文件或者在cmd窗口中输入该文件名可以在cmd窗口中按文件中的顺序执行多条dos命令。

`echo`是回显命令，会将echo后的内容输出到cmd窗口中，比如在一个`Test.bat`文件中输入如下命令：
<!--more-->

```cmd
echo hello!
```

执行该文件后，会在cmd窗口中输出：
```cmd
>C:\Users\123\Desktop>echo hello!
hello!
```

以上第一行是输出执行的echo命令，第二行是输出执行后的结果。

我们将`Test.bat`文件的内容改成：
```cmd
echo hello!
echo bye!
```

将得到如下的结果：
```cmd
>C:\Users\123\Desktop>echo hello!
hello!

>C:\Users\123\Desktop>echo bye!
bye!
```

我们可以发现，cmd窗口中将每条命令都给一起打印了出来，我们希望只输出要回显的内容，而不会包括命令本身，可以在命令的最前边加上`@`，如下：
```cmd
@echo hello!
@echo bye!
```

接着执行该bat文件，可以得到：
```cmd
>hello!
bye!
```

如果一个bat文件中有着几十条上百条命令，我们就需要一个个加上`@`，这样就太累了，我们可以通过`echo off`命令来实现，将bat文件改成如下：
```cmd
echo off
echo hello!
echo bye!
```

执行该bat文件，将得到如下结果：
```cmd
>C:\Users\123\Desktop>echo off
hello!
bye!
```

我们发现，虽然第二行和第三行关闭了命令回显，可是第一行的echo off命令被打印出来了，我们只需要在第一行加上`@`就可以了，如下：
```cmd
@echo off
echo hello!
echo bye!
```

现在再执行该bat文件，就可以关闭回显了：
```cmd
>hello!
bye!
```

这就是为什么很多bat文件一开始总是以这样的形式开头：
```cmd
@echo off
echo XXXXXX
```

对于被关闭的回显，可以通过`echo on`来恢复回显。
