# 接口、继承、抽象类型与多态研究记录

## 冻结课程合同

- `batch`：`B-08`
- `courseId`：`backend.java.learn.basics.interfaces-inheritance-and-polymorphism`
- `title`：接口、继承、抽象类型与多态
- `nature`：必修
- `estimatedMinutes`：`75`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- 唯一前置：B-07 `backend.java.learn.basics.classes-objects-and-immutability`
- `sourceCapabilityIds`：`[JAVA-LANG-003, JAVA-LANG-004, JAVA-LANG-012]`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8 legacy supplement only`
- `verifiedAt`：`2026-08-14`

Phase A live 冻结明确要求复用上述稳定 ID、标题、必修性质、75 分钟和唯一前置 B-07。本研究稿不
改变课程身份、URL、loader、track 或 signoff。

## 本批范围与验收条件

本课只到以下边界：

1. 接口作为行为合同，以及接口可扩展多个接口、类可实现多个接口。
2. 单类继承与 `super` 的最小使用。
3. 抽象类与抽象方法。
4. 实例方法覆写和 `@Override`。
5. 重载与覆写的阶段差异。
6. 抽象类型引用与运行时动态分派。
7. 必要的向上、向下转换，以及 Java 25 / Java 8 接口方法差异。

完成研究冻结必须同时满足：

- 面向零基础冻结 7 个相互独立知识点。
- 每个知识点完整回答“是什么、作用、场景、怎么用、最小示例、运行结果、常见误区”。
- 冻结恰好 7 步从零实践，不跳过创建文件、编译、运行、观察失败和恢复正确基线。
- 只使用一个 `/tmp` 目录完成 Java 25 / Java 8 正向与负向反馈环。
- 记录实际 JDK、退出码、正向输出、负向编译诊断类别和负向运行结果。
- Java 示例中的每个方法和显式构造器上方都有规范中文注释。

明确排除枚举、注解展开、异常设计、泛型、集合、Lambda、sealed、反射、框架代理、依赖注入和设计
模式。除把 `@Override` 当作编译期保护外，不讲注解模型。

## 核验基线

| 项目 | 本轮核验结果 |
| --- | --- |
| 核验日期 | 2026-08-14 |
| 现代主线 | Java 25；OpenJDK 页面确认 JDK 25 已 GA，Oracle 支持路线列为 LTS |
| legacy 补充 | Java 8；只说明本课相关差异 |
| 候选发现 | Tavily；结果只用于定位直接官方页面 |
| 直接证据 | JLS 25/8、Java SE 25/8 API、Dev.java、OpenJDK JEP / JDK 页面、Oracle 支持路线 |
| 官方直达页面 | 21 个去重 URL；搜索摘要、社区文章和 AI 输出均未作为结论 |
| 反馈环境 | Eclipse Temurin `javac 25.0.3` 与 `javac 1.8.0_492` 容器 |
| 临时资产 | 唯一目录 `/tmp/vue3-study-b08.YsYqkS`，完成后以 `find -depth -delete` 清理 |

OpenJDK JEP 213 直接正文用于确认私有接口方法在 Java 9 交付；JLS 25/8 的方法修饰符语法和本地双版本
编译结果用于确认课程需要展示的实际差异。搜索摘要没有进入下列结论。

## 官方来源卡与直接证据

| 冻结结论 | 直接官方来源 | 页内范围 | 适用版本 |
| --- | --- | --- | --- |
| 类类型和接口类型都是引用类型 | [JLS 25 §4.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.3) | Reference Types and Values | Java 25 |
| 向上转换、向下转换、显式 cast 与运行时检查 | [JLS 25 §5.1.5、§5.1.6、§5.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.5) | widening、narrowing、casting context | Java 25 |
| 抽象类不可实例化；普通类只有一个直接父类 | [JLS 25 §8.1.1.1、§8.1.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.1) | abstract classes、superclasses | Java 25 |
| 覆写和重载是不同规则 | [JLS 25 §8.4.8.1、§8.4.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.1) | overriding、overloading | Java 25 |
| 接口可多继承；接口方法有 abstract、default、static、private 等形态 | [JLS 25 §9.1.3、§9.4、§9.4.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.1.3) | superinterfaces、interface methods | Java 25 |
| 重载先在编译期决议，覆写实例方法再按实际对象动态查找 | [JLS 25 §15.12.2、§15.12.4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2) | method invocation | Java 25 |
| 错误向下转换抛出 `ClassCastException` | [Java SE 25 `ClassCastException`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassCastException.html) | class contract | Java 25 |
| `@Override` 标记的方法必须确实覆写或实现超类型方法 | [Java SE 25 `Override`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Override.html) | annotation contract | Java 25 |
| Java 8 的继承、覆写、重载和转换核心规则与本课主线一致 | [JLS 8 §5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html)、[§8](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html)、[§15](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html) | conversions、classes、method invocation | Java 8 |
| Java 8 接口支持 abstract、default、static，但不支持 private 接口方法 | [JLS 8 §9.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.4) | interface method modifiers and bodies | Java 8 |
| Java 8 的错误向下转换和 `@Override` 合同 | [Java SE 8 `ClassCastException`](https://docs.oracle.com/javase/8/docs/api/java/lang/ClassCastException.html)、[Java SE 8 `Override`](https://docs.oracle.com/javase/8/docs/api/java/lang/Override.html) | API contracts | Java 8 |
| 接口类型、抽象类、覆写和多态的零基础解释 | [Defining Interfaces](https://dev.java/learn/interfaces/defining-interfaces/)、[Using an Interface as a Type](https://dev.java/learn/interfaces/interfaces-as-a-type/)、[Abstract Methods and Classes](https://dev.java/learn/inheritance/abstract-classes/)、[Overriding](https://dev.java/learn/inheritance/overriding/)、[Polymorphism](https://dev.java/learn/inheritance/polymorphism/) | current tutorials | 当前 Dev.java |
| 私有接口方法最终在 Java 9 交付 | [OpenJDK JEP 213](https://openjdk.org/jeps/213) | Milling Project Coin，Closed / Delivered | Java 9+ |
| JDK 25 已 GA，Oracle 将 Java 25 列为 LTS | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)、[Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | release status、LTS list | Java 25 |

## 零基础知识点冻结

### 知识点 1：接口合同与 Java 25 / 8 接口方法

**是什么：** 接口是一种引用类型，用来声明“对象必须提供哪些行为”。接口本身不能直接创建对象。
普通类只能直接继承一个类，但可以实现多个接口；接口也可以扩展多个接口。Java 25 接口可声明抽象、
`default`、`static` 和 `private` 方法；Java 8 没有 `private` 接口方法。

**作用：** 调用方只依赖稳定行为，不必知道对象的具体类。这样可以让多个实现以同一种方式被调用，
同时把 Java 25 的接口内部复用与 Java 8 兼容边界说清楚。

**场景：** 多种通知渠道都需要 `send` 行为时用接口；只在接口多个默认方法确实需要共享内部辅助逻辑
时使用 Java 25 的 `private` 方法。不要为了“看起来抽象”给只有一个固定实现的局部代码增加接口。

**怎么用：**

1. 用 `interface` 声明行为签名。
2. 用 `implements` 让具体类实现合同。
3. 用 `default` 提供实现类可继承的默认行为，用 `InterfaceName.method()` 调用静态方法。
4. Java 25 可用 `private` 方法只复用接口内部实现；Java 8 兼容源码不得使用它。

**最小示例：**

```java
public final class InterfaceMethodsExample {
    interface Channel {
        /**
         * 返回原始渠道名称。
         */
        String name();

        /**
         * 返回规范化后的渠道名称。
         */
        default String label() {
            return normalize(name());
        }

        /**
         * 返回合同类别。
         */
        static String kind() {
            return "contract";
        }

        /**
         * 规范化接口内部文本。
         */
        private String normalize(String value) {
            return value.trim().toUpperCase();
        }
    }

    static final class EmailChannel implements Channel {
        /**
         * 返回邮件渠道名称。
         */
        @Override
        public String name() {
            return " email ";
        }
    }

    /**
     * 运行接口方法示例。
     */
    public static void main(String[] args) {
        Channel channel = new EmailChannel();
        System.out.println(channel.label() + "|" + Channel.kind());
    }
}
```

**运行结果：** Java 25 输出 `EMAIL|contract`。同一源码在 Java 8 编译失败，因为
`private String normalize(...)` 不属于 Java 8 的接口方法语法；删去接口私有方法或把辅助逻辑移到
实现类后，抽象、`default` 和 `static` 方法可继续用于 Java 8。

**常见误区：** 接口不是“只有常量和空方法”的旧式容器；另一方面，`default` 也不会让接口变成可
保存实例状态的类。`static` 和 `private` 接口方法不参与实现类的动态覆写。

### 知识点 2：单类继承与 `super`

**是什么：** 类继承表示子类从一个直接父类获得可继承成员，并可添加自己的行为。普通类声明只有一个
`extends ClassType`，所以没有多类继承；`super(...)` 调用父类构造器。

**作用：** 当两个类型确实具有稳定的“是一个”关系时，继承可以复用父类已经建立的状态和行为合同。

**场景：** 邮件标签确实是基础标签的一种，并且必须使用父类的前缀初始化规则时可以继承。仅仅因为两段
代码相似，或想绕过组合关系时，不应建立继承层级。

**怎么用：**

1. 在父类定义所有子类都成立的状态和行为。
2. 子类通过 `extends` 指定唯一直接父类。
3. 子类构造器用 `super(...)` 完成父类部分的初始化。
4. 通过子类对象调用继承的方法并观察结果。

**最小示例：**

```java
public final class SingleInheritanceExample {
    static class BaseLabel {
        private final String prefix;

        /**
         * 创建基础标签。
         */
        protected BaseLabel(String prefix) {
            this.prefix = prefix;
        }

        /**
         * 格式化编号。
         */
        public String format(String id) {
            return prefix + ":" + id;
        }
    }

    static final class EmailLabel extends BaseLabel {
        /**
         * 创建邮件标签。
         */
        private EmailLabel() {
            super("email");
        }
    }

    /**
     * 运行单类继承示例。
     */
    public static void main(String[] args) {
        System.out.println(new EmailLabel().format("42"));
    }
}
```

**运行结果：** 输出 `email:42`。子类对象执行的是从 `BaseLabel` 继承的 `format` 方法，前缀由
子类构造器调用 `super("email")` 初始化。

**常见误区：** Java 类不能同时 `extends A, B`。接口的多继承类型能力不等于类可以继承多份实例
状态；`super` 也不是另一个父类对象。

### 知识点 3：抽象类与部分实现

**是什么：** 抽象类用 `abstract class` 声明，可以同时包含没有方法体的抽象方法和已有实现的方法。
抽象类不能直接 `new`，具体子类必须实现仍未实现的抽象方法。

**作用：** 在一个明确的单继承族中，抽象类可以集中共享状态、初始化规则或部分实现，同时强制具体
子类补齐变化部分。

**场景：** 所有通知都需要同一审计格式，但各渠道发送逻辑不同，并且这些类型确实属于同一继承族时
使用。只有行为合同、不需要共享状态或实现时优先考虑接口。

**怎么用：**

1. 把共同实现放进抽象类的具体方法。
2. 把必须由子类决定的行为声明为抽象方法。
3. 让具体子类继承抽象类并覆写所有抽象方法。
4. 创建具体子类对象，而不是实例化抽象类。

**最小示例：**

```java
public final class AbstractClassExample {
    static abstract class BaseNotifier {
        /**
         * 发送通知。
         */
        public abstract String send(String id);

        /**
         * 返回共享审计结果。
         */
        public String audit(String id) {
            return "audit:" + id;
        }
    }

    static final class EmailNotifier extends BaseNotifier {
        /**
         * 使用邮件发送通知。
         */
        @Override
        public String send(String id) {
            return "email:" + id;
        }
    }

    /**
     * 运行抽象类示例。
     */
    public static void main(String[] args) {
        BaseNotifier notifier = new EmailNotifier();
        System.out.println(notifier.send("42") + "|" + notifier.audit("42"));
    }
}
```

**运行结果：** 输出 `email:42|audit:42`。抽象方法由 `EmailNotifier` 实现，共享审计方法直接来自
抽象父类。

**常见误区：** 抽象类可以有构造器和具体方法，但仍不能直接实例化。一个类没有抽象方法也可以被声明
为抽象类；不能反过来认为“有一个具体方法就不是抽象类”。

### 知识点 4：实例方法覆写与 `@Override`

**是什么：** 覆写是子类或实现类为超类型已有的实例方法提供新实现。方法要满足覆写签名和返回类型
规则，访问权限不能比被覆写方法更弱。`@Override` 让编译器检查开发者的覆写意图。

**作用：** 同一行为合同可由不同实际对象提供不同结果；签名写错时，`@Override` 会把静默偏差变成
编译错误。

**场景：** 子类确实需要改变继承来的实例行为，或实现接口抽象方法时使用。静态方法属于隐藏规则，
不作为本课动态覆写示例。

**怎么用：**

1. 保持方法名和参数列表满足覆写关系。
2. 在方法上写 `@Override`。
3. 保持或扩大可见性，不要把公开合同改成包可见或私有。
4. 编译后通过超类型引用调用，确认执行具体对象的实现。

**最小示例：**

```java
public final class OverrideExample {
    static class BaseNotifier {
        /**
         * 返回基础渠道。
         */
        public String channel() {
            return "base";
        }
    }

    static final class EmailNotifier extends BaseNotifier {
        /**
         * 返回邮件渠道。
         */
        @Override
        public String channel() {
            return "email";
        }
    }

    /**
     * 运行覆写示例。
     */
    public static void main(String[] args) {
        BaseNotifier notifier = new EmailNotifier();
        System.out.println(notifier.channel());
    }
}
```

**运行结果：** 输出 `email`。变量的声明类型是 `BaseNotifier`，实际对象是 `EmailNotifier`，
因此运行时选择覆写后的实例方法。

**常见误区：** 把参数从 `String` 改成 `Object` 不会“更宽松地覆写”，而是声明了另一个重载。
省略 `public` 实现接口公开方法会缩小可见性并导致编译失败。

### 知识点 5：重载与覆写的阶段差异

**是什么：** 重载是在同一可见范围内声明同名但参数列表不同的方法。编译器根据方法名、实参和编译期
类型选择具体签名；覆写则在选中实例方法签名后，由运行时实际对象决定执行哪个实现。

**作用：** 重载可以为同一动作提供不同输入入口；与覆写分开理解，才能解释“编译期选签名、运行期选
实现”的两阶段行为。

**场景：** 数字编号和字符串编号都需要调用同一发送行为时，可提供两个小而明确的重载。不要用大量
含义不同的重载制造模糊 API。

**怎么用：**

1. 保持方法名相同。
2. 让参数数量或参数类型不同。
3. 让一个重载委托给核心实现，避免重复逻辑。
4. 用不同静态类型的实参调用并核对输出。

**最小示例：**

```java
public final class OverloadExample {
    static final class Sender {
        /**
         * 按字符串编号发送。
         */
        public String send(String id) {
            return "text:" + id;
        }

        /**
         * 按数字编号发送。
         */
        public String send(int id) {
            return "number:" + id;
        }
    }

    /**
     * 运行重载示例。
     */
    public static void main(String[] args) {
        Sender sender = new Sender();
        System.out.println(sender.send("7") + "|" + sender.send(7));
    }
}
```

**运行结果：** 输出 `text:7|number:7`。字符串实参选择 `send(String)`，整数实参选择
`send(int)`；这里没有父子类方法替换。

**常见误区：** “同名”不足以判断覆写。先看参数签名与类型层级：同名不同参数是重载，子类型对同一
实例方法签名提供实现才是覆写。

### 知识点 6：抽象类型引用与动态分派

**是什么：** 接口或抽象类变量可以引用具体实现对象。编译期类型决定当前表达式能调用哪些成员；运行
时实际对象决定被覆写实例方法执行哪个实现，这个查找过程就是本课的动态分派。

**作用：** 调用方可以用一段代码处理多个实现，不需要为每个具体类复制条件分支。

**场景：** 一个发送函数只关心 `Notifier.send`，调用时可传入邮件或短信实现。调用方需要实现类专属
方法时，说明抽象合同可能不足，应先重新检查边界。

**怎么用：**

1. 把变量、参数或返回值声明为接口或抽象类。
2. 在创建对象时提供具体实现。
3. 只调用抽象类型公开的行为。
4. 依次传入不同实现并观察覆写结果。

**最小示例：**

```java
public final class DispatchExample {
    interface Notifier {
        /**
         * 发送通知。
         */
        String send(String id);
    }

    static final class EmailNotifier implements Notifier {
        /**
         * 使用邮件发送通知。
         */
        @Override
        public String send(String id) {
            return "email:" + id;
        }
    }

    static final class SmsNotifier implements Notifier {
        /**
         * 使用短信发送通知。
         */
        @Override
        public String send(String id) {
            return "sms:" + id;
        }
    }

    /**
     * 通过抽象类型调用实际实现。
     */
    private static String dispatch(Notifier notifier, String id) {
        return notifier.send(id);
    }

    /**
     * 运行动态分派示例。
     */
    public static void main(String[] args) {
        System.out.println(
                dispatch(new EmailNotifier(), "42")
                        + "|"
                        + dispatch(new SmsNotifier(), "42"));
    }
}
```

**运行结果：** 输出 `email:42|sms:42`。两次调用的参数静态类型都为 `Notifier`，实际对象不同，
所以动态查找到不同覆写实现。

**常见误区：** 抽象类型引用不会把实际对象“变成接口”。动态分派只针对可覆写的实例方法；重载签名
仍然在编译期决定，静态方法也不按实际对象动态选择。

### 知识点 7：向上转换与必要的向下转换

**是什么：** 把具体子类引用赋给父类或接口变量是向上转换，通常隐式完成。把抽象类型表达式转回具体
子类是向下转换，需要显式 cast，并在运行时检查对象真实类型。

**作用：** 向上转换让调用方停留在稳定抽象上。向下转换只在边界确实需要实现类专属成员时恢复更具体
的静态类型；cast 不会改变对象的实际类型。

**场景：** 普通业务调用优先向上转换并只用接口。确需访问短信实现独有的供应商信息时，可先验证实际
类型再向下转换；如果频繁转换，应重新审视接口合同。

**怎么用：**

1. 直接写 `Notifier notifier = new SmsNotifier()` 完成向上转换。
2. 先用 `instanceof` 判断实际对象是否为目标类型。
3. 判断成立后再显式转换。
4. 不兼容对象不要强转；负向反馈环应观察 `ClassCastException`。

**最小示例：**

```java
public final class CastExample {
    interface Notifier {
        /**
         * 返回渠道名称。
         */
        String channel();
    }

    static final class SmsNotifier implements Notifier {
        /**
         * 返回短信渠道名称。
         */
        @Override
        public String channel() {
            return "sms";
        }

        /**
         * 返回短信供应商。
         */
        public String provider() {
            return "carrier";
        }
    }

    /**
     * 运行安全转换示例。
     */
    public static void main(String[] args) {
        Notifier notifier = new SmsNotifier();
        if (notifier instanceof SmsNotifier) {
            SmsNotifier sms = (SmsNotifier) notifier;
            System.out.println(sms.channel() + ":" + sms.provider());
        }
    }
}
```

**运行结果：** 输出 `sms:carrier`。反馈环中的反例把实际为 `SmsChannel` 的接口引用强转为
`EmailChannel`：Java 25 / 8 都能编译，但运行退出码为 1，并抛出 `ClassCastException`。

**常见误区：** cast 只改变当前表达式的编译期类型视图，不能把短信对象变成邮件对象。不要把
`instanceof` 加 cast 的长分支链当作多态本身。

## Java 25 / Java 8 接口方法差异冻结

| 对比项 | Java 25 | Java 8 | 本课处理 |
| --- | --- | --- | --- |
| 抽象接口方法 | 支持；未写访问修饰符时隐式 `public` | 支持；隐式 `public` | 两版本共享主线 |
| `default` 方法 | 支持，必须有方法体 | 支持，必须有方法体 | 两版本共享主线 |
| `static` 方法 | 支持，属于接口本身 | 支持，属于接口本身 | 两版本共享主线 |
| `private` 实例或静态方法 | 支持，必须有方法体，不被实现类继承或覆写 | 不支持 | 现代补充并做负向编译 |
| `strictfp` | 语法仍可出现，但已 obsolete，不改变运行时语义 | 仍有旧版浮点语义作用 | 不展开浮点规则，只记录边界 |

JEP 213 记录私有接口方法曾从 Java 8 候选中撤回，最终在 Java 9 交付。除这一接口方法能力差异外，
本课所用单类继承、抽象类、覆写、重载、动态分派和转换核心语义在 JLS 25 / 8 对应章节一致。

## 从零跟着做：7 步实践冻结

1. 创建唯一临时目录，并在其中建立 `Main.java`、四个负向源码和
   `PrivateInterfaceMethod.java`；确认所有资产都位于同一个 `/tmp` 目录。
2. 在 `Main.java` 声明 `Notifier` 接口，只保留带中文注释的 `channel()` 行为；此时接口是
   调用方能看到的最小合同。
3. 声明 `BaseNotifier` 抽象类，加入带中文注释的抽象 `send(String)`、重载
   `send(int)` 和共享 `audit(String)`；不得直接创建抽象类对象。
4. 声明 `EmailNotifier` 与 `SmsNotifier`，在每个实现方法上写 `@Override`，让二者分别返回
   `email:<id>` 与 `sms:<id>`。
5. 在 `main` 中用接口或抽象类引用保存具体对象，依次验证邮件、短信、共享审计和整数重载；预期
   完整输出为 `email:42|sms:42|audit:42|overload:email:7`。
6. 用 Temurin 25 与 8 容器编译运行同一正向源码，再分别编译错误覆写、缩小可见性、实例化抽象类，
   并编译后运行错误 cast；按退出码和诊断类别判断结果，不锁定整段诊断文案。
7. 用 Java 25 编译运行私有接口方法并观察 `EMAIL`，再用 Java 8 编译同一源码并观察失败；最后
   恢复共享源码基线，以 `find "$B08_TMP" -depth -delete` 清理唯一临时目录。

## 易错点与负向证据冻结

### 错误：把重载误认为覆写

- 触发条件：接口声明 `send(String)`，实现类误写 `send(Object)`。
- 原因：参数类型不同形成新重载，不满足覆写签名。
- 后果：实现类没有完成接口合同，且 `@Override` 触发编译错误。
- 正确写法：保留相同参数签名，并让编译器验证 `@Override`。
- Java 25 / 8 实测：编译退出码均为 1，各有 2 个诊断。

```java
interface DeliveryContract {
    /**
     * 按字符串编号发送。
     */
    void send(String id);
}

final class WrongDelivery implements DeliveryContract {
    /**
     * 错误地改变参数类型。
     */
    @Override
    public void send(Object id) {
    }
}
```

### 错误：缩小接口实现方法的可见性

- 触发条件：实现接口公开方法时省略 `public`。
- 原因：接口抽象方法隐式为 `public`，实现不能提供更弱访问权限。
- 后果：编译失败。
- 正确写法：实现方法显式声明 `public`。
- Java 25 / 8 实测：编译退出码均为 1，关键诊断为 `attempting to assign weaker access privileges`。

### 错误：直接实例化抽象类

- 触发条件：执行 `new AbstractTask()`，而 `AbstractTask` 被声明为 `abstract`。
- 原因：JLS 禁止创建抽象类实例。
- 后果：编译失败。
- 正确写法：创建已经实现全部抽象方法的具体子类。
- Java 25 / 8 实测：编译退出码均为 1，关键诊断为 `abstract; cannot be instantiated`。

### 错误：强制转换与实际对象不兼容

- 触发条件：接口引用实际指向 `SmsChannel`，却强转为 `EmailChannel`。
- 原因：编译期允许该缩窄引用转换，运行时仍检查实际对象。
- 后果：源码编译成功，运行抛出 `ClassCastException` 并非零退出。
- 正确写法：停留在接口合同；确需专属成员时先检查实际类型。
- Java 25 / 8 实测：编译退出码均为 0，运行退出码均为 1。

### 错误：把 Java 25 私有接口方法带回 Java 8

- 触发条件：Java 8 源码在接口中声明带方法体的 `private` 方法。
- 原因：Java 8 的接口方法修饰符不包含 `private`。
- 后果：Java 8 编译失败。
- 正确写法：Java 8 兼容源码把辅助实现放到实现类或抽象基类；Java 25 主线可在接口内部使用。
- 实测：Java 25 编译、运行均为 0 并输出 `EMAIL`；Java 8 编译退出码为 1，共 3 个诊断。

## 唯一 `/tmp` Java 25 / 8 反馈环

### 临时资产与命令

本轮只创建一个目录：`/tmp/vue3-study-b08.YsYqkS`。其中包含：

| 临时文件 | 验证合同 |
| --- | --- |
| `Main.java` | 接口、抽象类、两个实现、覆写、重载、抽象引用和动态分派 |
| `WrongOverride.java` | 参数类型变化不是覆写 |
| `NarrowVisibility.java` | 实现接口时不能缩小可见性 |
| `InstantiateAbstract.java` | 抽象类不可实例化 |
| `BadCast.java` | 不兼容向下转换编译成功、运行失败 |
| `PrivateInterfaceMethod.java` | Java 25 支持、Java 8 拒绝私有接口方法 |
| `verify.sh` | 顺序执行上述编译和运行，并输出版本、退出码和诊断 |

实际执行入口：

```bash
docker run --rm -v /tmp/vue3-study-b08.YsYqkS:/work -w /work \
  eclipse-temurin:25-jdk sh verify.sh 25
docker run --rm -v /tmp/vue3-study-b08.YsYqkS:/work -w /work \
  eclipse-temurin:8-jdk sh verify.sh 8
find /tmp/vue3-study-b08.YsYqkS -depth -delete
```

### 实际结果

| 检查 | Java 25 真实结果 | Java 8 真实结果 |
| --- | --- | --- |
| 编译器 | `javac 25.0.3` | `javac 1.8.0_492` |
| 共享正向源码 | compile/run `0/0`；`email:42\|sms:42\|audit:42\|overload:email:7` | compile/run `0/0`；同一输出 |
| 错误 `@Override` | compile `1`；未实现 `send(String)`，且方法未覆写 | compile `1`；同类 2 个诊断 |
| 缩小可见性 | compile `1`；weaker access privileges | compile `1`；同类诊断 |
| 实例化抽象类 | compile `1`；abstract cannot be instantiated | compile `1`；同类诊断 |
| 错误 cast | compile `0`；run `1`；`ClassCastException` | compile `0`；run `1`；`ClassCastException` |
| 私有接口方法 | compile/run `0/0`；输出 `EMAIL` | compile `1`；private not allowed、abstract method has body 等 3 个诊断 |
| 容器命令 | host exit `0` | host exit `0` |
| 清理 | `find -depth -delete` 后路径不存在，`cleanup=passed` | 共用同一清理结果 |

诊断完整英文文案不是课程稳定合同；课程与后续验证应断言版本、成功/失败、退出码、错误类别和正向
输出，不锁定可能随编译器小版本变化的整段文字。

## `dzzz-app` 冻结选题证据

Phase 2 冻结 inventory 为本课提供两个低噪声选题样本，本轮不把项目现状当作语言规则：

| 冻结文件与符号 | 冻结 SHA-256 | usage | 只支持的结论 |
| --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/download/Downloader.java` / `com.tdh.bdzz.download.Downloader` | `a660b5d288741187eae5a43996d1ffa9dd1d720b5c8b835f393c5351551efe19` | `observed` | 项目需要接口合同与多个实现 |
| `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java` / `com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler` | `ee5de581ce3a3963c22bc20825d60cf91ff1108432f7a22b5bc6b1c318e6b3ba` | `observed` | 项目存在抽象基类与具体子类 |

当前工作区没有可重新直读的 `dzzz-app` checkout，因此本轮不声称重新核对外部仓库 HEAD 或文件
状态。上述证据只沿用冻结 inventory 决定选题优先级；语法与运行结论全部由本轮官方来源和临时反馈环
支持。字段注入、业务状态码、日志、下载逻辑和异常处理均不进入本课。

## 被排除或尚未证实的说法

- 不进入 B-09 枚举正文，也不创建或修改任何后续课程文件。
- 不展开注解；只使用 `@Override` 的编译期保护合同。
- 不讲异常设计、泛型、集合、Lambda、方法引用、sealed、反射、代理、框架或设计模式。
- 不把继承概括为“总能复用代码”，也不宣称接口永远优于抽象类。
- 不把频繁 `instanceof` 与强转分支包装成多态推荐写法。
- 不讨论未测量的性能结论。
- 不把 `dzzz-app` 旧实现直接复制成现代推荐示例。

## 官方来源清单

1. [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
2. [JLS 25 Chapter 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html)
3. [JLS 25 Chapter 8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
4. [JLS 25 Chapter 9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html)
5. [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html)
6. [JLS 8 Chapter 5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html)
7. [JLS 8 Chapter 8](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html)
8. [JLS 8 Chapter 9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html)
9. [JLS 8 Chapter 15](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html)
10. [Java SE 25 `ClassCastException`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassCastException.html)
11. [Java SE 8 `ClassCastException`](https://docs.oracle.com/javase/8/docs/api/java/lang/ClassCastException.html)
12. [Java SE 25 `Override`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Override.html)
13. [Java SE 8 `Override`](https://docs.oracle.com/javase/8/docs/api/java/lang/Override.html)
14. [Dev.java Defining Interfaces](https://dev.java/learn/interfaces/defining-interfaces/)
15. [Dev.java Using an Interface as a Type](https://dev.java/learn/interfaces/interfaces-as-a-type/)
16. [Dev.java Abstract Methods and Classes](https://dev.java/learn/inheritance/abstract-classes/)
17. [Dev.java Overriding and Hiding Methods](https://dev.java/learn/inheritance/overriding/)
18. [Dev.java Polymorphism](https://dev.java/learn/inheritance/polymorphism/)
19. [OpenJDK JEP 213](https://openjdk.org/jeps/213)
20. [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)
21. [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)

## Stop Boundary

本研究记录只授权 Phase B 当前唯一批次 B-08。研究完成不等于正文完成，也不授权修改正文、track、
loader 或 signoff。只有 B-08 后续正文、Java 25/8 反馈环、Catalog、搜索、进度、浏览器、全量 Gate、
独立 signoff 以及 Standards / Spec 全部通过，并获得明确授权后，才可进入 B-09。
