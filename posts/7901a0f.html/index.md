# LeetCode - 344. Reverse String

## 题目

Write a function that reverses a string. The input string is given as an array of characters char[].

Do not allocate extra space for another array, you must do this by **modifying the input array in-place** with O(1) extra memory.
<!--more-->

You may assume all the characters consist of printable ascii characters.

**Example 1:**

```
Input: ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
```

**Example 2:**

```
Input: ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
```

## 解题思路

这是一道经典的反转字符串题目，难点在于要求不能申请额外的内存空间，并且要求时间复杂度为O(1)。第一次接触过这种类型的同学大概会懵逼，这道题其实可以转变成另一道题：

>如何在不占用任何额外空间的情况下交换x、y两个数的值？

这里可以利用到异或运算来解决，异或有以下性质：
1. 相同的两个数异或结果为0
2. 任何数与0异或结果还是其自身
3. 异或运算满足交换律和结合律

于是就有了这样一种思路：将字符串的首尾字符通过异或运算来相互调换位置，比如第一个和最后一个字符互换位置，第二个和最后第二个互换位置，一共循环字符串长度/2的次数，这样就可以实现题目想要的效果。代码如下：
```java
class Solution {
    public void reverseString(char[] s) {
        int size = s.length;
        int a = size / 2;
        int last;
        for (int i = 0; i < a; i++) {
            last = size - 1 - i;
            s[i] ^= s[last];
            s[last] ^= s[i];
            s[i] ^= s[last];
        }
    }
}
```

下面是时间与内存的消耗：
>Runtime: 1 ms
Memory Usage: 51.6 MB

## 相关链接

* [344. Reverse String](https://leetcode.com/problems/reverse-string/)