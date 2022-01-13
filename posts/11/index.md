# Java Servlet问题汇总


## Cannot forward after response has been committe

之前在使用Servlet的时候，总是在 doGet()/doPost() 的最后一行才使用请求转发或者重定向。如果需要根据条件来判断进行不同的请求转发或者重定向，代码如下：

```java
@Override
protected void doGet(final HttpServletRequest req, final HttpServletResponse resp)
        throws ServletException, IOException {

    if (req.getSession().getAttribute(AttrConsts.LOGIN_USER) == null) {
        req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.LOGIN_PAGE).forward(req, resp);
    }
    req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.MAIN_PAGE).forward(req, resp);
}
```
<!--more-->
上边的代码在执行后会报如下异常：

```java
java.lang.IllegalStateException: Cannot forward after response has been committe
...
```

报异常的原因是重复转发或者重定向了请求，如果有多个转发或者重定向，需要在每个转发或者重定向请求之后加上return语句(最后一个请求转发或者重定向不需要加return)，如下：

```java
@Override
protected void doGet(final HttpServletRequest req, final HttpServletResponse resp)
        throws ServletException, IOException {

    if (req.getSession().getAttribute(AttrConsts.LOGIN_USER) == null) {
        req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.LOGIN_PAGE).forward(req, resp);
        return;
    }
    req.getRequestDispatcher(PathConsts.PATH_PREFIX + PathConsts.MAIN_PAGE).forward(req, resp);
}
```

通过return语句确保在转发或者重定向请求之后返回，避免在执行上边的转发/重定向之后，接着继续往下执行转发/重定向请求，这样就不会再报这个异常了。