# Jackson问题汇总

## 前言

常见的json框架有：Jackson，FasJson（阿里的，万年没更新，积累了大量issue），Gson（谷歌的）。其中Jackson效率最高，性能最好，最为常用。本文基于`2.11.3`版本的Jackson。

Jackson在1.x版本使用的包名是`codehaus`，后来升级到2.x版本时，为了和旧版本区分开来，采用了新的包名`fasterxml`。有这种类似操作的还有Log4j和Log4j2，在使用时需要注意引入的包名，避免混用版本或误用版本。

Jackson可以轻松的将Java对象转换成json对象和xml文档（即序列化），同样也可以将json、xml转换成Java对象（即反序列化）。

<!--more-->

## 序列化日期字段的时区问题

在将日期转为字符串时会使用`@JsonFormat`注解，默认使用零时区，因此在使用时要注意时区问题。比如项目部署在中国境内的服务器（东八区时区），不注意时区问题可能会导致json中的时间和预期的差距8个小时。

实际开发中，假如存在多个不同时区的客户，通常是把客户所在的时区时间转换为零时区，然后存入到数据库中。这样项目从数据库读取到的时间就是零时区，再根据客户所在时区修改显示在前端页面的时间。这样比较灵活，不怕时间字段的值发生混乱，不易管理。

在格式化成json时注解如下：

```java
// 将日期格式化成ISO格式
// 这里转成零时区，北京时间东八区是GMT+8
@JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone="GMT")
private LocalDateTime updatedOn;
```

另外，`@DatetimeFormat`是spring提供的一个注解，用以将日期转为String，提供给前端使用。

## 序列化时重命名字段

可以使用`@JsonProperty`来重命名字段，`@JsonProperty`能够在序列化和反序列化时给字段映射到指定的名字：

```java
@JsonProperty("updatedBy")
private String updateUserName;
```

如上，`updateUserName`在序列化为json时会被重命名为`updatedBy`，在反序列化时json中`updatedBy`的值会被映射到`updateUserName`。

将这个注解和MapStruct映射框架结合起来，可以通过定义`@JsonProperty`来避免额外定义MapStruct框架的不同名字段映射规则；比如：`@Mapping(source = "updateUserName", target = "updatedBy")`

还有个类似的注解`@JsonAlias`，其作用是给字段起别名，只在**反序列化**阶段有效，可以让字段接受更多的映射名称：

```java
@JsonAlias("updatedBy")
private String updateUserName;
```

如上，在反序列化时，json中的`updatedBy`或者`updateUserName`都可以映射到pojo的`updateUserName`字段上。

## 序列化忽略指定的字段

### 按照字段进行忽略

可以使用`@JsonIgnore`或者`@JsonIgnoreProperties`来忽略字段，`@JsonIgnoreProperties`比前者多了一个使用方式，那就是加在类上：

```java
// 在使用JPA-hibernate的懒加载功能时，懒加载对象会多出来`hibernateLazyInitializer`字段，这里将其忽略掉
@JsonIgnoreProperties(value = { "hibernateLazyInitializer" })
public class Item {

    @JsonIgnore
    private String tag;

}
```

### 按照字段的值进行忽略

上述两个注解会直接忽略指定的字段，如果想忽略满足某个条件的字段，比如忽略值为null的字段，或者值为0的数值型字段等，可以用`@JsonInclude`注解。

`@JsonInclude`用来指定序列化时需要包括哪些字段，本身提供了多种策略：ALWAYS、NON_NULL、NON_EMPTY等。如果需要自定义包括字段的策略，方式如下：

```java
// 指定自定义的序列化策略，同时提供相关的值过滤类ValueFilter
@JsonInclude(value = Include.CUSTOM , valueFilter = ValueFilter.class)
public class Item {

    //...
}

// 自定义的过滤类
public class ValueFilter {

    @Override
    public  boolean equals(final Object obj){
        // return true表示将其过滤，即在序列化时将其忽略。
        // 这里将所有值为null、false、0的字段全部忽略
        if (obj == null) {
            return true;
        }
        if (obj.equals(Boolean.FALSE)) {
            return true;
        }
        if (obj.equals(Integer.valueOf(0))) {
            return true;
        }
        if (obj instanceof BigDecimal) {
            final BigDecimal value = (BigDecimal) obj;
            if (value.compareTo(BigDecimal.ZERO) == 0) {
                return true;
            }
        }

        return false;
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
```

## pojo的循环依赖导致序列化时无限递归

当多个pojo之间存在循环依赖时，在序列化时会无限递归，最终堆栈溢出`StackOverflowError`。pojo如下：

```java
// 供应商Vendor，关联着中间表VendorFact
@Data
public class Vendor {

    private List<VendorFact> facts;

}

// 工厂Fact，关联着中间表VendorFact
@Data
public class Fact {

    private List<VendorFact> vendors;

}

// 中间表VendorFact，存放Vendor和Fact的关联关系（多对多）
@Data
public class VendorFact {

    private Fact fact;

    private Vendor vendor;

}
```

上述的pojo在序列化时会互相引用、无限递归，因此需要打断这个循环链。

经过本人测试，其他博客中提及的`@JsonManagedReference`和`@JsonBackReference`并无效果，至少在多对多的关联关系中不起效（一对多没有测试）。

### 使用`@JsonIgnore`

直接在其中一方的字段上加上`@JsonIgnore`，这样在序列化时该字段就会被忽略，自然也就不会互相引用无限递归了。比如对于Vendor的序列化，可以将VendorFact里的vendor变量忽略：

```java
@Data
public class VendorFact {

    private Fact fact;

    @JsonIgnore
    private Vendor vendor;

}
```

不过这个方案有个缺点，就是序列化后的json中只有一方持有另一方，在另一方的json中无法持有对方，在一对多或者多对多的情况中并不便利。比如上面的方式，虽然Vendor可以正常序列化了，但是Fact依然不能正常序列化。而在序列化VendorFact时，也缺少了vendor的信息。

当然有个方案是，为每一方都单独创建一套对应的dto来进行序列化，这样的话虽然类的数量变多了，但是可以解决多对多关系中只有一方能序列化的问题。比如上面的例子，需要两个VendorFact的dto类，各自对应Vendor和Fact。不过在序列化VendorFact时，依然缺少另一方的信息。不过正常情况下不会单独去序列化作为中间表的VendorFact，因此不予考虑这个缺点。

此外，和`@JsonIgnore`效果类似的`@JsonIgnoreProperties`，也能起到一样的效果，但是这个注解如果添加在集合变量上是无效的，如下：

```java
@Data
public class Vendor {

    // 不会起效，因为这里的json结构实际上是数组，对应的是List对象，而不是VendorFact
    // 需要将该注解添加在VendorFact类上
    @JsonIgnoreProperties("vendor")
    private List<VendorFact> facts;

}

@Data
// 上面的注解应该加在这里
@JsonIgnoreProperties("vendor")
public class VendorFact {

    private Fact fact;

    private Vendor vendor;

}
```

## 自定义对象的序列化和反序列化

有时候只靠默认的序列化方式，或者常规的json注解，难以实现某个对象的序列化要求。比如，现在需要对一个HashMap对象进行序列化，这个对象中的字段和类型是未知的，此时可以用`@JsonSerialize`和`@JsonDeserialize`来控制序列化和反序列化。

```java
@Data
// 指定自定义的序列化器CustomTableDtoSerializer
@JsonSerialize(using = CustomTableDtoSerializer.class)
// 指定自定义的反序列化器CustomTableDtoDeserializer
@JsonDeserialize(using = CustomTableDtoDeserializer.class)
public class CustomTableDto {

    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private Map<String, Object> dynamicModelMap;
}

// 序列化器
public class CustomTableDtoSerializer extends JsonSerializer<CustomTableDto> {

    @Override
    public void serialize(final CustomTableDto customTable, final JsonGenerator gen,
                          final SerializerProvider serializers) throws IOException {
        final Map<String, Object> dynamicModelMap = customTable.getDynamicModelMap();
        if (dynamicModelMap != null) {
            gen.writeStartObject();
            for (final String key : dynamicModelMap.keySet()) {
                final Object value = dynamicModelMap.get(key);
                final Optional<CustomFieldType> typeOpt = CustomFieldType.findTypeByColumnName(key);

                if (typeOpt.isPresent() && value != null) {
                    writeType(gen, typeOpt.get(), key, value);
                }
            }
            gen.writeEndObject();
        } else {
            gen.writeNull();
        }
    }

    private static void writeType(final JsonGenerator gen, final CustomFieldType type,
                                  final String key, final Object value) throws IOException {
        final String jsonKey = StringUtils.replaceOnce(key, type.getColumnName(), type.getJsonName());

        // 根据不同的字段类型进行对应的业务处理
        // CustomFieldType是自定义的枚举类，这里就不写出来了
        switch (type) {
            case TEXT:
            case TEXT_AREA:
                gen.writeStringField(jsonKey, (String) value);
                break;
            case DATE:
                gen.writeStringField(jsonKey, CustomTableDto.DATE_FORMAT.format((LocalDate) value));
                break;
            case NUMBER:
                gen.writeNumberField(jsonKey, (Long) value);
                break;
            case DECIMAL:
                gen.writeNumberField(jsonKey, (BigDecimal) value);
                break;
            case CHECKBOX:
                gen.writeBooleanField(jsonKey, (Boolean) value);
                break;
            case CODELIST:
            case HCL_GROUP:
                gen.writeObjectField(jsonKey, value);
                break;
            default:
                //do nothing
        }
    }
}

// 反序列化器
public class CustomTableDtoDeserializer extends JsonDeserializer<CustomTableDto> {

    @Override
    public CustomTableDto deserialize(final JsonParser p, final DeserializationContext ctxt) throws IOException {
        final ObjectCodec oc = p.getCodec();
        final JsonNode root = oc.readTree(p);

        final Map<String, Object> dynamicModelMap = new HashMap<>();
        final Iterator<String> fieldIterator = root.fieldNames();

        while (fieldIterator.hasNext()) {
            final String jsonKey = fieldIterator.next();
            final JsonNode value = root.get(jsonKey);
            final Optional<CustomFieldType> typeOpt = CustomFieldType.findTypeByJsonName(jsonKey);

            if (typeOpt.isPresent() && value != null) {
                put(oc, dynamicModelMap, typeOpt.get(), jsonKey, value);
            }
        }

        final CustomTableDto customTableDto = new CustomTableDto();
        customTableDto.setDynamicModelMap(dynamicModelMap);
        return customTableDto;
    }

    private static void put(final ObjectCodec oc, final Map<String, Object> dynamicModelMap, final CustomFieldType type,
                            final String jsonKey, final JsonNode value) throws IOException {
        final String columnKey = StringUtils.replaceOnce(jsonKey, type.getJsonName(), type.getColumnName());

        // 根据不同的字段类型进行对应的业务处理
        // CustomFieldType是自定义的枚举类，这里就不写出来了
        switch (type) {
            case TEXT:
            case TEXT_AREA:
                dynamicModelMap.put(columnKey, value.textValue());
                break;
            case DATE:
                final String dateStr = value.textValue();
                dynamicModelMap.put(columnKey, LocalDate.from(CustomTableDto.DATE_FORMAT.parse(dateStr)));
                break;
            case NUMBER:
                dynamicModelMap.put(columnKey, value.longValue());
                break;
            case DECIMAL:
                dynamicModelMap.put(columnKey, value.decimalValue());
                break;
            case CHECKBOX:
                dynamicModelMap.put(columnKey, value.booleanValue());
                break;
            case CODELIST:
                dynamicModelMap.put(columnKey, oc.treeToValue(value, EmbedCodelist.class));
                break;
            case HCL_GROUP:
                dynamicModelMap.put(columnKey, oc.treeToValue(value, EmbedHcl.class));
                break;
            default:
                //do nothing
        }
    }
}
```

## 参考链接

* [java 关于时间返回结果与参数的注解@DatetimeFormat和@JsonFormat](https://blog.csdn.net/u013088495/article/details/80366147)
* [@JsonProperty和@JsonAlias的区别](https://blog.csdn.net/u010234516/article/details/84316340)
* [JPA中因双向依赖而造成的json怪相 相互访问造成溢出](https://blog.csdn.net/qq_29407009/article/details/78110052)
