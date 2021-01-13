# LeetCode - 136. Single Number

## 题目

Given a **non-empty** array of integers, every element appears twice except for one. Find that single one.

**Note:**

Your algorithm should have a linear runtime complexity. Could you implement it without using extra memory?
<!--more-->

**Example 1:**

```
Input: [2,2,1]
Output: 1
```

**Example 2:**

```
Input: [4,1,2,1,2]
Output: 4
```

## 解题思路

这道题要求我们使用线性的时间复杂度O(n)来解决，并且还不能申请额外的内存空间，一般看到这种要求，脑海里一下子就冒出来异或位运算，事实也是如此，这里可以利用异或位运算的性质来得出一个整型数组里单独的数字。
异或有以下性质：
1. 相同的两个数异或结果为0
2. 任何数与0异或结果还是其自身
3. 异或运算满足交换律和结合律

解决方案如下：
```java
class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int a : nums) {
            result ^= a;
        }
        return result;
    }
}
```

下面是时间与内存的消耗：
>Runtime: 0 ms
Memory Usage: 37.8 MB

## 相关链接

* [136. Single Number](https://leetcode.com/problems/single-number/)
