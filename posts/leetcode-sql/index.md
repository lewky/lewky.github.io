# LeetCode - SQL题目

## 627. Swap Salary

### 题目

https://leetcode.com/problems/swap-salary/description/

```
Salary table:
+----+------+-----+--------+
| id | name | sex | salary |
+----+------+-----+--------+
| 1  | A    | m   | 2500   |
| 2  | B    | f   | 1500   |
| 3  | C    | m   | 5500   |
| 4  | D    | f   | 500    |
+----+------+-----+--------+

Result table:
+----+------+-----+--------+
| id | name | sex | salary |
+----+------+-----+--------+
| 1  | A    | f   | 2500   |
| 2  | B    | m   | 1500   |
| 3  | C    | f   | 5500   |
| 4  | D    | m   | 500    |
+----+------+-----+--------+
(1, A) and (3, C) were changed from 'm' to 'f'.
(2, B) and (4, D) were changed from 'f' to 'm'.
```

sex字段是枚举类型，只有m和f两种值，现在要求只能用一个简单的update语句来将表中数据的sex字段的值对调，即m变为f，f变为m；不允许使用select之类的语句。
<!--more-->
### 答案

有两种思路，一种是常规的，也是实践项目中常用的`case when`写法，个人更推荐这种：

```sql
UPDATE salary
SET sex = (CASE WHEN sex = "m" 
                THEN "f" 
                ELSE "m"
           END);
```

一种是使用异或来实现，两个相等的数异或的结果为 0，而 0 与任何一个数异或的结果为这个数。这种做法需要先把sex字段的值转换为ASCII码再异或，最后再转为字符：

```sql
UPDATE salary
SET sex = CHAR ( ASCII(sex) ^ ASCII( 'm' ) ^ ASCII( 'f' ) );
```

## 620. Not Boring Movies

### 题目

https://leetcode.com/problems/not-boring-movies/description/

```
Cinema table:
+----+------------+-------------+--------+
| id | movie      | description | rating |
+----+------------+-------------+--------+
| 1  | War        | great 3D    | 8.9    |
| 2  | Science    | fiction     | 8.5    |
| 3  | irish      | boring      | 6.2    |
| 4  | Ice song   | Fantacy     | 8.6    |
| 5  | House card | Interesting | 9.1    |
+----+------------+-------------+--------+

Result table:
+----+------------+-------------+--------+
| id | movie      | description | rating |
+----+------------+-------------+--------+
| 5  | House card | Interesting | 9.1    |
| 1  | War        | great 3D    | 8.9    |
+----+------------+-------------+--------+

Write an SQL query to report the movies with an odd-numbered ID and a description that is not "boring".

Return the result table in descending order by rating.
```

获取奇数id、描述不为无聊且按照等级倒序排序。

### 答案

```sql
select * from Cinema where id % 2 = 1 and description != 'boring' order by rating desc;
```

## 184. Department Highest Salary

### 题目

https://leetcode.com/problems/department-highest-salary/description/

```
Employee table:
+----+-------+--------+--------------+
| Id | Name  | Salary | DepartmentId |
+----+-------+--------+--------------+
| 1  | Joe   | 70000  | 1            |
| 2  | Jim   | 90000  | 1            |
| 3  | Henry | 80000  | 2            |
| 4  | Sam   | 60000  | 2            |
| 5  | Max   | 90000  | 1            |
+----+-------+--------+--------------+

Department table:
+----+----------+
| Id | Name     |
+----+----------+
| 1  | IT       |
| 2  | Sales    |
+----+----------+

Write a SQL query to find employees who have the highest salary in each of the departments. For the above tables, your SQL query should return the following rows (order of rows does not matter).
+------------+----------+--------+
| Department | Employee | Salary |
+------------+----------+--------+
| IT         | Max      | 90000  |
| IT         | Jim      | 90000  |
| Sales      | Henry    | 80000  |
+------------+----------+--------+
```

查找每个部门中收入最高者的信息。

### 答案

需要先创建临时表，再查找每个部门中收入最高者的信息。

```sql
SELECT
    D.NAME Department,
    E.NAME Employee,
    E.Salary
FROM
    Employee E,
    Department D,
    ( SELECT DepartmentId, MAX( Salary ) Salary 
     FROM Employee 
     GROUP BY DepartmentId ) M
WHERE
    E.DepartmentId = D.Id
    AND E.DepartmentId = M.DepartmentId
    AND E.Salary = M.Salary;
```

## 参考链接

* [SQL 练习](http://www.cyc2018.xyz/%E6%95%B0%E6%8D%AE%E5%BA%93/SQL%20%E7%BB%83%E4%B9%A0.html#_595-big-countries)