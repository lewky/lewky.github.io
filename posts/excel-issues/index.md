# Excel问题汇总

## 使用公式将秒转换为分+秒

现在有个需求：将Excel里的时间转换为分+秒的格式，如下：

|time(second)|time(min+second)|
|-|-|
|482.712|XXmin,XXs|
|480.737|XXmin,XXs|

对于这种场景，可以通过Excel的公式来实现。
<!--more-->

假设现在的`time(second)`是单元格的A1位置，我们需要对A2、A3等等这一列转换到B这一列。先在B1单元格输入以下公式：

```
=INT(A2/60)&"min,"&ROUND(MOD(A2,60),0)&"s"
```

输入之后，你会发现该单元格的内容就变成了`8min,3s`。

这里的`INT(a)`表示将数值a向下取整为最接近的整数，`ROUND(a, b)`表示按照b的位数来将a四舍五入，`MOD(a, b)`表示a除以b的余数，`&`表示拼接字符串。

现在可以对一个单元格进行公式求值了，接着按住该单元格的右下角，鼠标会变成一个+号，按住不放向其它方向拖动，可以将对应的单元格自动填充该公式。

如果希望在单元格内进行换行，在需要换行的地方按下Alt + Enter组合键即可。