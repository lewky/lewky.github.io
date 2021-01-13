# PostgreSQL - N''和::bpchar

## N''和::bpchar的区别

N''的效果和::bpchar效果类似，都表示定长字符串。比如下边的sql：

```sql
select n'233' as num;
select '233'::bpchar as num;
select '233' as num;
```
<!--more-->

以上sql都会得到'233'的结果集，但是对于前两条sql拿到的字符串是bpchar类型，相当于MySQL的char类型；而第三条sql拿到的字符串是text类型。

VARCHAR(n) varchar 指定了最大长度，变长字符串，不足定义长度的部分不补齐。
CHAR(n) bpchar 定长字符串，实际数据不足定义长度时，以空格补齐。
TEXT text 没有特别的上限限制（仅受行的最大长度限制）

对于::bpchar，其实更多表示的是转型，比起N''，还可以这样使用：

```sql
select 233 as num;
select 233::bpchar as num;
```
第一条sql拿到的是数值类型，第二条sql拿到的是字符串，233这个数值被转型成bpchar类型。

