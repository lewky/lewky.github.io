# LeetCode - 412. Fizz Buzz

## 题目

Write a program that outputs the string representation of numbers from 1 to n.

But for multiples of three it should output “Fizz” instead of the number and for the multiples of five output “Buzz”. For numbers which are multiples of both three and five output “FizzBuzz”.
<!--more-->

**Example:**

```
n = 15,

Return:
[
    "1",
    "2",
    "Fizz",
    "4",
    "Buzz",
    "Fizz",
    "7",
    "8",
    "Fizz",
    "Buzz",
    "11",
    "Fizz",
    "13",
    "14",
    "FizzBuzz"
]
```

## 常规思路

题目很简单，就是n为3倍数时输出`Fizz`，n为5倍数时输出`Buzz`，n同时为3或5倍数时输出`FizzBuzz`。也就是说，在判断条件时，应该先判断n是否为15的倍数，接着再判断是否为3或者5的倍数来决定输出什么。代码如下：
```java
class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> list = new ArrayList<>(n);
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) {
                list.add("FizzBuzz");
            } else if (i % 3 == 0) {
                list.add("Fizz");
            } else if (i % 5 == 0) {
                list.add("Buzz");
            } else {
                list.add(i + "");
            }
        }
        return list;
    }
}
```

这里说一句，好像LeetCode在代码中使用了List时是不需要导包的，我试了下不管在第一行加不加`import java.util.*;`都没问题。

下面是时间与内存的消耗：
>Runtime: 1 ms
Memory Usage: 37.2 MB

## 特殊思路

上边是通过`%`进行了取模运算来实现的，看了评论区有人认为：
>一般来说，对于CPU取余数的运算相对来说效率很低，如果可以避免使用大量的求余数操作，可以提升程序的性能。

于是就有了不使用`%`的写法：
```java
public class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> ret = new ArrayList<String>(n);
        for(int i=1,fizz=0,buzz=0;i<=n ;i++){
            fizz++;
            buzz++;
            if(fizz==3 && buzz==5){
                ret.add("FizzBuzz");
                fizz=0;
                buzz=0;
            }else if(fizz==3){
                ret.add("Fizz");
                fizz=0;
            }else if(buzz==5){
                ret.add("Buzz");
                buzz=0;
            }else{
                ret.add(String.valueOf(i));
            }
        } 
        return ret;
    }
}
```

下面是时间与内存的消耗：
>Runtime: 1 ms
Memory Usage: 37.3 MB

这个方案里需要对两个变量进行重复的自增和重新赋值为0，可以用下边的方案来减少这些操作：
```java
public class Solution {
    public List<String> fizzBuzz(int n) {
        
        List<String> result = new ArrayList<>();
        
        if(n < 1) return result;
        
        for(int i = 1, fizz = 3, buzz = 5; i <= n; i++) {
        
            String addVal = null;
            
            if(i == fizz && i == buzz) {
                addVal = "FizzBuzz"; 
                fizz += 3;
                buzz += 5;
            } else if(i == fizz) {
                addVal = "Fizz";
                fizz += 3;
            } else if(i == buzz) {
                addVal ="Buzz";
                buzz += 5;
            } else
                addVal = String.valueOf(i);
            
            result.add(addVal); 
        }
        
        return result;
    }
}
```

下面是时间与内存的消耗：
>Runtime: 1 ms
Memory Usage: 37.1 MB

## 补充：`i+""`和`String.valueOf(i)`

在评论区里有人问到：
>which is better between
list.add( "" + i );
and
addStr = String.valueOf(i); list.add(addStr)？

我认为后者的写法更好，因为`i+""`实际上会new一个StringBuilder去拼接`i`和`""`，然后再调用toString()来得到字符串。而`String.valueOf(i)`在底层是调用了`Integer.toString(i)`来得到字符串。

## 相关链接

* [412. Fizz Buzz](https://leetcode.com/problems/fizz-buzz/)
* [Java 4ms solution , Not using "%" operation
](https://leetcode.com/problems/fizz-buzz/discuss/89931/Java-4ms-solution-Not-using-%22%22-operation)
