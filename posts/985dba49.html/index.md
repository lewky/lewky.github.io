# LeetCode - 709. To Lower Case

## 题目

Implement function ToLowerCase() that has a string parameter str, and returns the same string in lowercase.

**Example 1:**
<!--more-->

```
Input: "Hello"
Output: "hello"
```

**Example 2:**

```
Input: "here"
Output: "here"
```

**Example 3:**

```
Input: "LOVELY"
Output: "lovely"
```

## 解题思路

这道题很简单，就是单纯遍历字符串的每个字符，如果是大写字母就变成小写字母，每个小写字母都比对应的大写字母的ASCII码大32。代码如下：
```java
class Solution {
    public String toLowerCase(String str) {
        if (str == null || "".equals(str)) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (char c : str.toCharArray()) {
            if (c >= 65 && c <= 90) {
                c += 32;
            }
            sb.append(c);
        }
        return sb.toString();
    }
}
```

如果不记得`A`或者`Z`的ASCII码是多少，也可以直接写成下面这样：
```java
class Solution {
    public String toLowerCase(String str) {
        if (str == null || "".equals(str)) {
            return "";
        }
        int n = 'a' - 'A';
        StringBuilder sb = new StringBuilder();
        for (char c : str.toCharArray()) {
            if (c >= 'A' && c <= 'Z') {
                c += n;
            }
            sb.append(c);
        }
        return sb.toString();
    }
}
```

下面是时间与内存的消耗：
>Runtime: 0 ms
Memory Usage: 33.1 MB

## 相关链接

* [709. To Lower Case](https://leetcode.com/problems/to-lower-case/) 