# cmd - 如何在bat文件中调用另一个bat文件

## **情景一：两个bat文件在同一个目录下**

有时候我们需要在一个bat文件中调用另一个bat文件，比如我们想在a.bat中调用b.bat，如下。

**a.bat**

```dos
@echo off
echo I am a.bat...
echo now run the b.bat
call b.bat
echo over
```
<!--more-->
**b.bat**

```dos
@echo off
echo I am b.bat...
```

在cmd窗口中执行a.bat，结果如下：

```dos
I am a.bat...
now run the b.bat
I am b.bat...
over
```

通过`call`命令，我们可以调用另一个bat文件，执行完会再返回到原本的bat文件中继续执行。但是这里有个问题，就是两个bat文件必须在同一个目录下，否则会找不到要call的bat文件。

## **情景二：两个bat文件不在同一个目录下**

假如要call的bat文件在其他目录，我们可以在call之前，先使用`cd /d 目录`来进入相应的目录，接着再call就行了，如下：

**a.bat**

```dos
@echo off
echo I am a.bat...
echo now run the b.bat
cd /d D:\test
call b.bat
echo over
```

**b.bat**

```dos
@echo off
echo I am b.bat...
```

执行后得到结果如下：

```dos
I am a.bat...
now run the b.bat
I am b.bat...
over
```

不过，这里需要注意的是，此时执行完命令的cmd窗口的当前目录是b.bat所在的目录了，而不是a.bat的目录。

## **情景三：开启一个新的cmd窗口来运行另一个bat文件**

假如我们希望另外启动一个新的cmd窗口来运行b.bat，可以通过`start cmd`命令来实现，如下：

**a.bat**

```dos
@echo off
echo I am a.bat...
echo now run the b.bat
cd /d D:\test
start "" cmd /k call b.bat
echo over
```

**b.bat**

```dos
@echo off
echo I am b.bat...
```

执行后得到结果如下：

原本的cmd窗口中：

```dos
I am a.bat...
now run the b.bat
over
```

新的cmd窗口中：

```dos
I am b.bat...
```

这里简单解释下该命令的参数：

```dos
start "" cmd /k call b.bat
```

`""`是一段字符串，代表新打开的cmd窗口的名字，可以随便起名。
`/k`是表示新打开的cmd窗口在执行完命令后保存打开状态，如果希望执行完就关闭窗口就使用`/c`
`call b.bat`表示call命令，即调用b.bat文件；该命令可以用`""`括起来，即：`"call b.bat"`

