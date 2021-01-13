# LeetCode - 771. Jewels and Stones

## 题目

You're given strings `J` representing the types of stones that are jewels, and `S ` representing the stones you have.  Each character in S is a type of stone you have.  You want to know how many of the stones you have are also jewels.

The letters in `J` are guaranteed distinct, and all characters in `J` and `S` are letters. Letters are case sensitive, so `"a"` is considered a different type of stone from `"A"`.
<!--more-->

**Example 1:**

```
Input: J = "aA", S = "aAAbbbb"
Output: 3
```

**Example 2:**

```
Input: J = "z", S = "ZZ"
Output: 0
```

**Note:**

`S` and `J` will consist of letters and have length at most 50.
The characters in `J` are distinct.

## 常规思路

题目可能有点绕，其实简化一下，就是说有两个字符串`J`和`S`，两个字符串都是由字母构成的，并且区分大小写，而`J`里的字母是不重复的，`S`则是有可能重复的。请找出在`S`里有多少个字母是与`J`的字母相同的。

思路很简单，就是遍历`S`里的每一个字符是否存在于`J`中，每存在一个就累计一次。代码如下：
```java
class Solution {
    public int numJewelsInStones(String J, String S) {
        int count = 0;
        for (int i = 0; i < S.length(); i++) {
            if (J.indexOf(S.charAt(i)) >= 0)
                count++;
        }
        return count;
    }
}
```

## 另辟蹊径

在讨论区里见到了一个很骚的做法，只有一行代码就可以得到想要的结果，如下：
```java
class Solution {
    public int numJewelsInStones(String J, String S) {
        return S.replaceAll("[^" + J + "]", "").length();
    }
}
```

这种思路是利用了正则表达式，把`S`里凡是不属于`J`的字符全部替换成空字符串`""`，然后剩下的字符串的长度就是最终的答案。

至于这两种思路哪个更好就见仁见智了，下面是两个思路各自花费的时间和内存：

**常规思路：**
>Runtime: 1 ms
Memory Usage: 33.7 MB

**特殊思路：**
>Runtime: 7 ms
Memory Usage: 34.9 MB

## 相关链接

* [771. Jewels and Stones](https://leetcode.com/problems/jewels-and-stones/)