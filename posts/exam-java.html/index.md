# Jave基础复习总纲

## Java语言有哪些特点？

1. 简单易学，有丰富的类库
2. 面向对象
3. 平台无关性，即跨平台
4. 可靠安全
5. 支持多线程

<!--more-->
## 面向对象和面向过程的区别

* 面向过程是一种较早的编程思想，属于面条式编程，站在过程的角度上思考问题。强调的是功能行为，功能的执行过程，按顺序一步步去实现功能的设计和调用。
* 面向对象是一种基于面向过程的新编程思想，站在对象的角度上思考问题。强调的是具备某些功能的对象，通过面向抽象编程来实现低耦合、高内聚。

## 面向对象的设计原则

面向对象程序设计有六大原则：

* 单一职责原则。第一个原则针对实现类，要求实现类的设计要遵循单一职责，不要负责多个职责，以此降低耦合。
* 里氏替换原则。第二个原则针对类的继承，要求不要破坏类的继承体系。子类应该尽量不要重写或者重载父类的行为（不包括抽象方法），这样子类才能安全地替换父类的所在。
* 依赖倒置原则。第三个原则针对抽象化，要求面向接口编程，面向抽象编程。不要依赖于具体，要依赖于抽象。
* 接口隔离原则。第四个原则针对接口，要求接口的设计要精简单一，类似于类的单一职责原则，不过一个是针对实现类，一个是针对接口。
* 迪米特法则，也叫最少知道原则。第五个原则针对对象间的关联关系，要求一个对象对于关联的其他对象要保持最少的了解。这样才能够保证低耦合，高内聚。
* 开闭原则。第六个原则是总纲，前面五个原则都是为了实现该原则，即对扩展开放，对修改关闭。Java的23个设计模式就是为了遵从面向对象程序设计的这六个原则。

## 什么是数据结构？

计算机保存、组织数据的方式。

## Java的数据结构有哪些？

1. 线性表（ArrayList）
2. 链表（LinkedList）
3. 栈（Stack）
4. 队列（Queue）
5. 图（Map）
6. 树（Tree）

## 什么是OOP？类与对象的关系？

Object Oriented Programming，面向对象编程。

类是对象的抽象，对象是类的具体。类是对象的模板，对象是类的实例。

## String 是最基本的数据类型吗？Java有几种基础数据类型

不是。JAVA基本数据类型一共八种：
byte（1字节）、short（2字节）、char（2字节）、int（4字节）、long（8字节）、float（4字节）、double（8字节）、boolean（1字节）

注：1个字节是8位，也就是8bit。

## 标识符的命名规则

标识符由26个英文字符大小写（a~z，A~Z）、数字(0~9)、下划线(_)和美元符号($)组成；
不能以数字开头，不能是关键字；
严格区分大小写；
标识符可以为任意长度；

## instanceof关键字作用，和isAssignableFrom区别

instanceof 严格来说是Java中的一个双目运算符，用来测试一个对象是否为一个类的实例。用法如：
```java
boolean result = obj instanceof Class
```

其中 obj 为一个对象（不能是基本数据类型），Class 表示一个类或者一个接口，当 obj 为 Class 的对象，或者是其直接或
间接子类，或者是其接口的实现类，结果result 都返回 true，否则返回false。

注意：编译器会检查 obj 是否能转换成右边的class类型，如果不能转换则直接报错，如果不能确定
类型，则通过编译，具体看运行时定。

该关键字和另一个API`isAssignableFrom()`类似，如下：
```java
List.class.isAssignableFrom(ArrayList.class);	//true
```

用来判断当前Class对象所表示的类或接口与指定的Class参数所表示的类或接口是否相同，或是否是其接口或者父类。如果是返回true，否则返回false。这个可以用来判断接口或者抽象类。

## 什么是隐式转换和显式转换

隐式转换和显式转换其实就是自动类型转换和强制类型转换。

## char类型能不能转成int类型？能不能转化成string类型，能不能转成double类型

char在java中是比较特殊的类型，它的int值从1开始，一共有2的16次方个数据；

char<int<long<float<double；Char类型可以隐式转成int,double类型，但是不能隐式转换成string；如果char类型转成byte，short类型的时候，需要强转。

## 什么是拆装箱？

这是jdk5提供的自动拆装箱特性，装箱就是自动把八种基本数据类型转换成对应的包装类，比如int->Integer，会调用Integer的`valueOf(int)`方法。

拆箱就是自动把包装类转换成对应的基本数据类型，比如Integer->int，会调用Integer的`intValue()`方法。

jdk5之后，可以不需要new一个包装类，如下：
```java
Integer i = 10;
```

## Java中的包装类都是那些？

byte：Byte，short：Short，int：Integer，long：Long，float：Float，double：Double，char：
Character ，boolean：Boolean

## 一个Java类中包含哪些内容？

属性、方法、内部类、构造方法、代码块

## 针对浮点型数据运算出现的误差的问题，你怎么解决？

使用BigDecimal类进行浮点型数据的运算

## 面向对象的特征有哪些方面

1. 抽象：找共性，将一类对象的共同特征总结出来构造类的过程, 包括数据抽象和行为抽象两方面。抽象只关注对象有哪些属性和行为，并不关注这些行为的具体细节。
2. 继承：子类继承父类的所有属性和方法，可以重用，也可以覆盖。
3. 封装：把数据和操作数据的方法绑定起来，对数据的访问只能通过已定义的接口。隐藏一切可隐藏的东西，只向外界提供最简单的编程接口。
4. 多态性：分编译时的多态性和运行时的多态性。方法重载（overload）实现的是编译时的多态性（也称为前绑定），而方法重写（override）实现的是运行时的多态性（也称为后绑定）。
要实现运行时的多态要满足：
	* 方法重写，即子类重写父类的方法
	* 对象造型，即父类引用引用子类对象

## 访问修饰符public,private,protected,以及不写（默认）时的区别？

|修饰符|当前类|同包|子类|其他包|
|:-|:-|:-|:-|:-|
|public|√|√|√|√|
|protected|√|√|√|×|
|default|√|√|×|×|
|private|√|×|×|×|

类的成员不写访问修饰时默认为default。外部类的修饰符只能是public或默认，类的成员（包括内部类）的修饰符可以是以上四种。

## float f=3.4;是否正确？

不正确。3.4是双精度数，将双精度型（double）赋值给浮点型（float）属于向下转型（down-casting，也称为窄化），会造成精度损失，因此需要强制类型转换`float f =(float)3.4;` 或者写成`float f =3.4F;`。

## short s1 = 1; s1 = s1 + 1;有错吗?short s1 = 1; s1 += 1;有错吗？

对于`short s1 = 1; s1 = s1 + 1;`由于1是int类型，因此`s1+1`运算结果也是int 型，需要强制转换类型才能赋值给short型。而`short s1 = 1; s1 += 1;`可以正确编译，因为`s1+= 1;`相当于`s1 = (short)(s1 + 1);`其中有隐含的强制类型转换。

总结就是`+=`有隐式的强制类型转换。

## 重载和重写的区别

重载是编译时的多态性，是同名方法有着不同的参数列表（参数类型不同、参数个数不同甚至是参数顺序不同）。重载对返回类型没有要求，因为无法通过返回类型来判断是否发生了重载。

重写是运行时的多态性，要求子类覆盖父类的行为，并且要满足：
1. 方法名、参数列表、返回类型必须相同。子类重写的方法的返回类型可以是父类的返回类型的子类。
2. 访问修饰符的限制一定要大于被重写方法的访问修饰符（public>protected>default>private)
3. 重写方法一定不能抛出新的检查异常或者比被重写的方法申明更加宽泛的检查型异常

## equals与==的区别

==比较的是两个对象的内存地址，equals是比较两个对象的内容是否相等。

## ++i与i++的区别

* i++：先赋值，后计算
* ++i：先计算，后赋值

## 程序的结构有那些

* 顺序结构
* 选择结构
* 循环结构

## 数组实例化有几种方式

静态实例化：创建数组的时候已经指定数组中的元素。
```java
int [] a= new int[]{ 1 , 3 , 3}
```

动态实例化：实例化数组的时候，只指定了数组长度，数组中所有元素都是数组类型的默认值。

## Java中各种数据默认值

* byte,short,int,long默认是都是0
* boolean默认值是false
* char类型的默认值是''
* float与double类型的默认是0.0
* 对象类型的默认值是null

## Java常用包有那些

* java.lang
* java.io
* java.sql
* java.util
* java.net
* java.math

## Object类常用方法有那些

* equals
* hashcode
* toString
* wait
* notify
* clone
* getClass

## java中有没有指针

java里的引用就是指针








## Java的23个设计模式

分为创建型，结构型和行为型。分别对应对象的创建、对象间的联系和依赖传递，以及对象的行为。最常用的几个设计模式有：单例、工厂、模板方法、装饰者、代理、适配器等。

创建型：

结构型：

行为型：

## 