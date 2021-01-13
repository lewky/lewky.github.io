# Java - 静态代码块、构造代码块和代码块

## **静态代码块**

```java
static{
	//do something
}
```
<!--more-->

静态代码块如上所示，和静态变量和静态方法一样，在类被类加载器首次加载时被执行，之后就不会被再次执行了(除非类加载器卸载该类后重新加载这个类)。

当有多个静态代码块时按顺序执行。

## **构造代码块**

```java
public class Test{
	{
		//do something
	}
}
```

和静态代码块类似，但是没有`static`，只能出现在类中，若出现在某个方法中则是普通代码块。

构造代码块会在new实例对象时，优先于构造方法调用，也就是说，先执行完构造代码块，才会接着执行构造方法。如果在一个构造方法里调用了另一个构造方法，此时构造代码块只会被执行一次，而不是执行两次。

当有多个构造代码块时按顺序执行。

## **代码块**

```java
public class Test{
	public static void main(String[] args){
		{
			//do something
		}
	}
}
```

和构造代码块类似，但是只在方法或语句中出现，执行顺序和普通语句一样，先出现就先执行。

局部代码块是为了缩短变量的生命周期，定义在局部代码块中的变量在出了代码块之后就结束其生命周期，释放内存。

## **总结**

执行顺序：（优先级从高到低）

>静态代码块>main方法>构造代码块>构造方法

其中静态代码块只执行一次，构造代码块在每次创建对象是都会执行。

## **一道有意思的题目**

执行下边的Test类，其输出的结果是什么？

```java
public class Test{
	static Test test = new Test(1);

	static{
		System.out.println("static code block");
	}

	{
		System.out.println("constructor code block");
	}

	Test(){
		System.out.println("constrctor method");
		System.out.println("a=" + a + ",b=" + b);
		a++;
		b++;
	}

	Test(int a){
		this();
		this.a = a;
		System.out.println("constrctor method2");
		System.out.println("a=" + a + ",b=" + b);
	}

	public static void main(String[] args){
		{
			System.out.println("code block");
		}

		method();

		Test test2 = new Test();
		method();
	}

	public static void method(){
		System.out.println("static method");
	}

	int a = 10;
	static int b = 100;
}
```

## **答案**

```java
constructor code block
constrctor method
a=10,b=0
constrctor method2
a=1,b=1
static code block
code block
static method
constructor code block
constrctor method
a=10,b=100
static method
```