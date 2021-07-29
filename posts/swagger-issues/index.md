# Swagger问题汇总

## 前言

SpringFox是一个开源的用于生成API文档接口的框架，支持多种API文档的格式。可以用SpringFox来整合Spring和Swagger，本文使用的Swagger和SpringFox版本如下：

```java
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger2</artifactId>
  <version>2.9.2</version>
</dependency>
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger-ui</artifactId>
  <version>2.9.2</version>
</dependency>
```

<!--more-->
## 隐藏指定的接口

### 使用`@ApiIgnore`

在想要隐藏的方法上添加`@ApiIgnore`注解即可，该注解还可以添加在类上和方法参数上。

### 使用SpringFox提供的Docket类的`paths()`来定制

`paths()`支持两种表达式，一种是Java的正则表达式，一种是Spring框架的Ant表达式。

通过Docket类的链式调用来实现：`new Docket().select().apis().paths().build()`。

```java
@Bean
public Docket api() {
    return new Docket(DocumentationType.SWAGGER_2)
        .groupName("api")
        .apiInfo(metaData())
        .ignoredParameterTypes(Authentication.class)
        .select()
        .apis(RequestHandlerSelectors.basePackage("com.test"))
        .paths(PathSelectors.regex("/api/.*"))
        .build()
        .securitySchemes(Collections.singletonList(securitySchema()))
        .securityContexts(Collections.singletonList(securityContext()));
}

private ApiInfo metaData() {
    return new ApiInfoBuilder()
        .title("Test API")
        .description("Test Application")
        .version("0.0.1")
        .contact(new Contact("Lewky", "lewky.cn", "lewky@test.com"))
        .build();
}

private OAuth securitySchema() {
    final List<AuthorizationScope> authorizationScopeList = new ArrayList<>();
    authorizationScopeList.add(new AuthorizationScope("read", "read all"));
    authorizationScopeList.add(new AuthorizationScope("trust", "trust all"));
    authorizationScopeList.add(new AuthorizationScope("write", "access all"));

    final List<GrantType> grantTypes = new ArrayList<>();
    final GrantType creGrant = new ResourceOwnerPasswordCredentialsGrant("/oauth/token");

    grantTypes.add(creGrant);

    return new OAuth("oauth2schema", authorizationScopeList, grantTypes);
}


private SecurityContext securityContext() {
    return SecurityContext.builder()
        .securityReferences(defaultAuth()).forPaths(PathSelectors.ant("/api/**"))
        .build();
}
```

下面是ant表达式的写法，用的是`AntPathMatcher`来匹配文档路径：

* `?`匹配一个字符
* `*`匹配0个或多个字符
* `**`匹配0个或多个目录

```java
@Bean
public Docket oauthApi() {
    return new Docket(DocumentationType.SWAGGER_2)
        .groupName("oauth")
        .apiInfo(metaData())
        .ignoredParameterTypes(Authentication.class)
        .select()
        .apis(RequestHandlerSelectors.any())
        .paths(PathSelectors.ant("/oauth/**"))
        .build()
        .securitySchemes(Collections.singletonList(securitySchema()))
        .securityContexts(Collections.singletonList(securityContext()));
}
```

## 定义Response中Model的map字段显示

Swagger2在显示一个接口的Response时，如果Model中存在map类型的字段（比如下面的`customFields`），则会在`Example Value`中显示为：

```java
"customFields": {
  "additionalProp1": {},
  "additionalProp2": {},
  "additionalProp3": {}
}
```

这个map里的字段是动态生成的，如果想要显示成对应的字段，需要实现`ModelPropertyBuilderPlugin`接口，然后重写`supports()`和`apply()`这两个方法，可以参考框架提供的实现类`ApiModelPropertyPropertyBuilder`来写。

对于自定义的类，需要注意的是注入的顺序，需要在框架的默认实现类之后注入。可以使用`@Order`来控制注入顺序，默认是最低优先级的注入顺序。

功能需求：map对象的字段是由Hibernate的hbm.xml配置的动态table，需要读取这个xml里的字段，然后将其转为对应的pojo中的字段。

Map对象的字段重写的具体思路如下：
* 在map字段上添加`@ApiModelProperty(notes = "xxx")`。使用`notes`属性的原因是，该字段被Swagger废弃了，这里用来实现自定义的功能就不会与原框架的功能产生冲突。
* 读取注解中notes的值，解析Hibernate的hbm.xml，根据notes值找到对应的结点并解析。
* 将解析得到的结点用javassist生成一个类，同一个类生成一次即可，别反复生成，浪费性能。
* 将生成的类作为当前map字段的解析类型，swagger是用的fasterxml来将pojo转化为json的。

```java
@Component
@Order
@Slf4j
public class HashMapModelPropertyBuilder implements ModelPropertyBuilderPlugin {
    @Autowired
    private TypeResolver typeResolver;

    @Override
    public boolean supports(final DocumentationType delimiter) {
        return true;
    }

    @Override
    public void apply(final ModelPropertyContext context) {
        Optional<ApiModelProperty> annotation = Optional.absent();

        if (context.getAnnotatedElement().isPresent()) {
          annotation = annotation.or(findApiModePropertyAnnotation(context.getAnnotatedElement().get()));
        }
        if (context.getBeanPropertyDefinition().isPresent()) {
          annotation = annotation.or(findPropertyAnnotation(
              context.getBeanPropertyDefinition().get(),
              ApiModelProperty.class));
        }

		// 只有在map类型的字段上使用了ApiModelProperty注解，并使用了notes属性才进行字段的解析
        if (annotation.isPresent() && context.getBeanPropertyDefinition().isPresent()) {
            final String tableName = annotation.get().notes();
            if (StringUtils.isBlank(applyToEntity)) {
                return;
            }

            final BeanPropertyDefinition beanPropertyDefinition = context.getBeanPropertyDefinition().get();
            if (!HashMap.class.equals(beanPropertyDefinition.getField().getRawType())) {
                return;
            }

			// 最关键的功能实现：解析xml并生成对应的类，再设置为当前的Map字段的解析类型
            context.getBuilder().type(typeResolver.resolve(createRefModel(tableName)));
        }
    }

    // Dynamic generated class package prefix for HashMap model.
    private final static String BASE_PACKAGE_RPEFIX = "com.test.swagger.model.";

    private Class createRefModel(final String name) {
        final ClassPool pool = ClassPool.getDefault();
        final String className = BASE_PACKAGE_RPEFIX + name;
        CtClass ctClass = pool.getOrNull(className);
        Class result = null;

        if (ctClass == null) {
            // Create new public class.
            ctClass = pool.makeClass(BASE_PACKAGE_RPEFIX + name);
            ctClass = loadCustomTableHbmXml(name, ctClass);
            try {
                result = ctClass.toClass();
            } catch (final CannotCompileException e) {
                log.error("Cannot create ref model.", e);
            }
        } else {
            try {
                result = Class.forName(className);
            } catch (final ClassNotFoundException e) {
                log.error("Cannot load Class: {}.", className, e);
            }
        }

        return result;
    }

    private CtClass loadCustomTableHbmXml(final String entityName, final CtClass ctClass) {
		// 解析hbm.xml
        final Resource resource = new ClassPathResource("hibernate/CustomTable.hbm.xml");
        final SAXReader saxReader = new SAXReader();
        Document doc = null;
        try {
            doc = saxReader.read(resource.getInputStream());
        } catch (final Exception e) {
            log.error("Failed to read CustomTable.hbm.xml.", e);
        }
        final Element rootElement = doc.getRootElement();

        final Iterator<Element> iterator = rootElement.elementIterator("class");
        Element target = null;
        while(iterator.hasNext()) {
            final Element element = iterator.next();
            if (StringUtils.equals(entityName, element.attributeValue("entity-name", StringUtils.EMPTY))) {
                target = element;
                break;
            }
        }
        if (target == null) {
            return ctClass;
        }

        List<Element> elements = new ArrayList<>();
        final List<Element> properties = target.elements("property");
        final List<Element> components = target.elements("component");
        elements.addAll(properties);
        elements.addAll(components);
        try {
            for (final Element element : elements) {
                createField(element, ctClass);
            }
        } catch (final Exception e) {
            log.error("Cannot create ref model.", e);
        }

        return ctClass;
    }

    private CtField createField(final Element element, final CtClass ctClass) throws NotFoundException, CannotCompileException {
        final String key = element.attributeValue("name", StringUtils.EMPTY);
		// 过滤掉一些不需要的结点
        if (IsIgnoreElement(key)) {
            return null;
        }

		// 属于业务逻辑，获取到字段的类型：String、LocalDate等
        final CustomFieldType customFieldType = CustomFieldType.findTypeByColumnName(key).orElse(null);
        if (customFieldType == null) {
            return null;
        }

        CtClass fieldType = null;
        CtField ctField = null;
        final ClassPool pool = ClassPool.getDefault();
		// 这里可以根据需要将字段名字替换为其他名字
        final String jsonKey = key;

        switch (customFieldType) {
        case SELECTION:
            fieldType = pool.get(EmbedCodelistListDemo.class.getName());
            break;

        default:
            fieldType = pool.get(customFieldType.getType().getName());
            break;
        }

        ctField = new CtField(fieldType, jsonKey, ctClass);
        ctField.setModifiers(Modifier.PUBLIC);
        ctClass.addField(ctField);

        return ctField;
    }

    private boolean IsIgnoreElement(final String key) {
        boolean result = false;
        switch (key) {
        case "domain_id":
        case "ref_entity_name":
            result = true;
            break;
        default:
            break;
        }
        return result;
    }

    // Demo model
    static class EmbedCodelistListDemo extends ArrayList<EmbedCodelist> {
        private static final long serialVersionUID = 1L;
    }

}
```

这里唯一需要强调的一点是：如果Map中存在List类型的字段，比如`List<xxDto>`，若要在Swagger的文档中也将这个`xxDto`也显示到Example Value里，可以定义一个类，继承`List<xxDto>`，如上述代码中最后定义的静态内部类`EmbedCodelistListDemo`。

之所以这样实现是因为javassist来生成一个泛型List太困难（可能是我没找到正确的接口），还是直接定义这样一个类，让Java自己帮我们搞定类型来得更简单准确。

## 参考链接

* [重新认识Swagger和Springfox](https://www.cnblogs.com/jason1990/archive/2020/03/27/12581773.html)
* [Swagger2 @ApiIgnore注解忽略接口在swagger-ui.html中显示](https://www.cnblogs.com/jichuang/p/11733131.html)
* [spring boot集成swagger之springfox-boot-starter配置指定paths()（四）](https://blog.csdn.net/hhjyan/article/details/117229253)