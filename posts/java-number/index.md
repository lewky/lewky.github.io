# Java数值问题汇总

## double转成BigDecimal的精度损失问题

如果直接用构造方法将double数值转成BigDecimal，可能存在损失精度的问题：

```java
final BigDecimal b1 = new BigDecimal(0.48);
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

因此，也可以直接传入字符串来构造BigDecimal：

```java
final BigDecimal b3 = new BigDecimal("0.48");
// 0.48
System.out.println(b3);
```

## 判断BigDecimal是否相等

在判断两个BigDecimal是否相等时，不能使用`equals()`，原因是`equals()`除了比较数值是否相等外，还会比较标度scale。从业务来考虑，通常只需要对比数值就行了，此时应该用`compareTo()`方法：

```java
public static void main(final String[] args) {
    BigDecimal a = new BigDecimal("0.1");
    BigDecimal b = new BigDecimal("0.10");
	// false
    System.out.println(a.equals(b));
	// 0
    System.out.println(a.compareTo(b));
}
```

`compareTo()`会返回-1,0和1，从上述代码可以看出来，a和b的标度不同，a的标度是0.1，b的标度是0.10，所以`equals()`返回的true，但是由于二者数值相同，所以`compareTo()`返回了0。
