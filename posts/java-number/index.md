# Java数值问题汇总

## double转成BigDecimal的精度损失问题

如果直接用构造方法将double数值转成BigDecimal，可能存在损失精度的问题：

```java
final BigDecimal b1 =new BigDecimal(0.48);
final BigDecimal b2 = BigDecimal.valueOf(0.48);
// 0.479999999999999982236431605997495353221893310546875
System.out.println(b1);
// 0.48
System.out.println(b2);
```
<!--more-->
可以看到，第一种方式丢失了精度。原因是`0.48`这个浮点数实际上并不能非常精确的表示0.48这个double值，因为二进制表示的小数部分长度是有限的。

为了避免丢失精度，需要调用官方提供的`valueOf`方法，实际上底层是将浮点数先转成字符串，再转成BigDecimal：

```java
    public static BigDecimal valueOf(double val) {
        // Reminder: a zero double returns '0.0', so we cannot fastpath
        // to use the constant ZERO.  This might be important enough to
        // justify a factory approach, a cache, or a few private
        // constants, later.
        return new BigDecimal(Double.toString(val));
    }
```