---
id: backend.java.learn.basics.object-equals-and-hashcode
type: lesson
title: Object、equals 与 hashCode
summary: 理解 Object 的基础合同，为 TeamFlow 任务值对象实现一致的 equals 与 hashCode
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 95
prerequisites:
  - backend.java.learn.basics.polymorphism
objectives:
  - 能说明普通 Java 类为什么都能使用 Object 的实例方法。
  - 能区分 == 的对象身份比较与 equals 的逻辑相等比较。
  - 能按照 equals 的自反、对称、传递、一致和非空合同检查实现。
  - 能理解 equals 与 hashCode 必须成对重写的原因。
  - 能用 Objects.equals 和 Objects.hash 编写空值安全且一致的实现。
  - 能识别可变相等字段作为哈希键时的查找风险。
  - 能在 JDK 25 与 Java 8 中为 TeamFlow 任务标识运行完整程序。
recap:
  - Object 位于普通类继承树顶端，默认 equals 使用对象身份，默认 hashCode 与该身份语义配套。
  - 值对象需要按业务字段判断相等，实体对象通常保留自身身份语义。
  - equals 必须满足自反、对称、传递、一致以及对 null 返回 false。
  - 两个对象 equals 为 true 时 hashCode 必须相同；不相等对象允许发生哈希碰撞。
  - 重写 equals 必须同时重写 hashCode，Objects.equals 和 Objects.hash 可减少遗漏。
  - 放入哈希结构后不要修改参与相等和哈希计算的字段。
  - JDK 25 可以用模式 instanceof 简化类型转换，Java 8 使用判断后显式转换。
related: []
tags:
  - Java
  - Object
  - equals
  - hashCode
  - 值对象
  - 对象合同
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 只在 instanceof 模式写法存在差异的位置说明
verifiedAt: 2026-08-17
sources:
  - id: jdk25-object-api
    title: Object (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Object 位于普通 Java 类继承树顶端
      - equals 默认合同包含自反、对称、传递、一致和非空规则
      - equals 相等的对象必须返回相同 hashCode，允许不相等对象发生碰撞
  - id: jdk25-objects-api
    title: Objects (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Objects.equals 可以比较两个可能为 null 的引用
      - Objects.hash 可以为多个字段生成 hashCode
  - id: jls25-reference-equality
    title: Java Language Specification 25 - Equality Operators
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 引用类型的 == 比较对象身份而不是业务字段
  - id: jls8-reference-equality
    title: Java Language Specification 8 - Equality Operators
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.21.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的引用 == 同样比较对象身份
  - id: jdk8-object-api
    title: Object (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 Object equals 与 hashCode 合同与本课兼容
  - id: jdk8-objects-api
    title: Objects (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Objects.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 Objects.equals 与 Objects.hash
  - id: dev-java-object-superclass
    title: Object as a Superclass - Dev.java
    url: https://dev.java/learn/inheritance/objects
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 普通类继承 Object 的实例方法
      - 值相等不适合使用身份语义时应重写 equals 并同时重写 hashCode
      - getClass 返回运行时类且不可重写
  - id: dev-java-immutable-keys
    title: Choosing Immutable Types for Your Key - Dev.java
    url: https://dev.java/learn/api/collections-framework/choosing-keys
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 修改哈希结构中键的相等字段可能导致同一个键无法再被找到
  - id: baeldung-equals-hashcode-contracts
    title: Java equals() and hashCode() Contracts
    url: https://www.baeldung.com/java-equals-hashcode-contracts
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上的 equals/hashCode 初学者误区
    claims:
      - 继承层次中分别使用 instanceof 可能破坏 equals 对称性
      - 值对象通常按属性相等，实体通常保留身份语义
  - id: stackoverflow-mutable-hashcode
    title: HashCode for mutable object - Stack Overflow
    url: https://stackoverflow.com/questions/28247307/hashcode-for-mutable-object
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 哈希键可变字段的真实误区
    claims:
      - equals 使用会变化的字段时，hashCode 也会随状态变化
      - 修改哈希结构中的相等字段可能导致查找失败
---

# Object、equals 与 hashCode

上一课的多态让多个具体对象可以通过同一个父类型合同被调用。本课继续追问一个常见问题：两个分别创建的
`TaskKey` 对象，如果保存了同一个团队和任务编号，它们算不算同一个任务？Java 为所有普通类提供了
`Object` 的基础方法，但默认的相等判断关注对象身份，不会自动理解业务字段。

本课只建立对象合同的最小闭环：先认识 `Object`，再区分身份相等和值相等，最后把 `equals` 与 `hashCode`
一起实现。集合内部怎样分桶、排序和遍历留给后续课程；这里仅用一个短例子观察错误合同造成的查找结果。

## 一、认识所有类都继承的 Object

### 1. 普通类为什么能调用 Object 方法

除 `Object` 自身外，普通类都会直接或间接继承 `java.lang.Object`。因此即使类声明里没有写 `extends`，对象也
可以调用 `equals`、`hashCode`、`getClass` 和 `toString` 等方法：

```java
/** 展示普通类可以使用 Object 的基础方法。 */
final class TaskMarker {
}

TaskMarker marker = new TaskMarker();
System.out.println(marker.getClass().getSimpleName());
System.out.println(marker.equals(marker));
System.out.println(marker.hashCode());
```

第一行输出类名 `TaskMarker`，第二行一定是 `true`，第三行是一个整数。整数的具体数值不应写进业务合同，
因为默认 `hashCode` 只需要满足 Object 的合同，不保证跨进程或跨执行保持同一个数字。`getClass()` 返回对象
的运行时类，不能被子类重写；`toString()`、线程同步方法和复制方法本课只确认它们来自 Object，不展开其
独立主题。

### 2. 默认 equals 比较的是身份

创建两个内容相同但彼此独立的对象：

```java
/** 保存一个短任务标签。 */
final class TaskLabel {
    private final String text;

    /**
     * 创建任务标签。
     *
     * @param text 标签文本
     */
    public TaskLabel(String text) {
        this.text = text;
    }
}

TaskLabel first = new TaskLabel("复核接口");
TaskLabel second = new TaskLabel("复核接口");
System.out.println(first == second);
System.out.println(first.equals(second));
```

两行都是 `false`。`new` 执行了两次，所以 `first` 和 `second` 是两个不同对象；引用 `==` 比较它们是否指向
同一对象，而 `Object.equals` 的默认实现也采用这个身份语义。字符串内容相同并不会改变两个对象的身份。

这和下面的别名不同：

```java
TaskLabel alias = first;
System.out.println(first == alias);       // true
System.out.println(first.equals(alias));  // true
```

`alias` 只是复制了引用，三个变量中的两个引用指向同一个对象。身份相等适合需要区分“是不是同一个实体”的
场景；当业务关心“字段是否表达同一个值”时，就需要在类中重写 `equals`。

### 3. 先决定对象的相等语义

写 `equals` 之前先回答一个业务问题：对象的身份是否就是业务身份？TeamFlow 的任务键由 `teamId` 与
`taskId` 组成，同样的两项信息代表同一个任务键，即使它们来自两次不同的 `new`。这类对象可以按字段比较，
称为值对象。

相反，正在运行的通知连接、缓存会话或需要独立生命周期的对象，可能即使字段暂时相同也必须保持身份区分。
它们可以保留 Object 的默认实现。不要因为看到一个类就机械生成 `equals` 和 `hashCode`；先确定调用方真正
需要的相等含义。

## 二、实现 equals 的完整合同

### 1. 五条规则要同时成立

JDK 25 的 Object API 把 `equals` 描述为非空引用上的等价关系。把规则换成检查清单：

（1）**自反：** 非空对象必须等于自己，`x.equals(x)` 为 `true`。

（2）**对称：** `x.equals(y)` 为 `true` 当且仅当 `y.equals(x)` 也为 `true`。

（3）**传递：** 如果 `x` 等于 `y`，`y` 等于 `z`，那么 `x` 也必须等于 `z`。

（4）**一致：** 用于比较的字段没有变化时，重复调用结果不能因为时间、随机数或外部状态而改变。

（5）**非空：** 任何非空对象调用 `x.equals(null)` 都必须返回 `false`，不能抛出空指针异常。

这五条不是测试框架的额外约定，而是调用方可以依赖的 Java 对象合同。实现时应先写类型判断，再比较所有参与
业务相等的字段；遗漏字段会让两个实际不同的值被错误地视为相等。

### 2. 用 final 值对象写 JDK 25 版本

下面的 `TaskKey` 是 `final` 类，避免子类添加新的相等字段而破坏对称性。JDK 25 可以用模式
`instanceof` 在通过类型检查的同一分支中绑定变量：

```java
import java.util.Objects;

/** 用团队和任务编号表示不可变任务键。 */
final class TaskKey {
    private final String teamId;
    private final int taskId;

    /**
     * 创建任务键。
     *
     * @param teamId 团队标识
     * @param taskId 任务编号
     */
    public TaskKey(String teamId, int taskId) {
        this.teamId = teamId;
        this.taskId = taskId;
    }

    /**
     * 判断两个任务键是否代表同一个团队任务。
     *
     * @param obj 待比较对象
     * @return 团队标识和任务编号都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskKey other)) {
            return false;
        }
        return taskId == other.taskId && Objects.equals(teamId, other.teamId);
    }

    /**
     * 根据任务键字段计算哈希值。
     *
     * @return 与 equals 使用相同字段得到的哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, taskId);
    }
}
```

`this == obj` 是快速路径，也直接满足自反规则。模式匹配失败时包括 `obj == null`，所以返回 `false`；成功后
`other` 已经是 `TaskKey`，可以比较两个字段。`Objects.equals` 会把两个都为 `null` 的团队标识视为相等，
一个为 `null` 时返回 `false`，不会在比较位置抛出空指针异常。

`hashCode` 使用的字段集合必须和 `equals` 一致。这里不是要求不同对象一定得到不同整数，而是保证两个相等
任务键得到相同整数。

### 3. Java 8 的完整兼容写法

Java 8 没有模式 `instanceof`，因此先判断普通类型，再显式转换。合同和 `Objects.equals`、`Objects.hash`
的行为没有改变：

```java
import java.util.Objects;

/** 用团队和任务编号表示不可变任务键。 */
final class TaskKeyJava8 {
    private final String teamId;
    private final int taskId;

    /**
     * 创建 Java 8 任务键。
     *
     * @param teamId 团队标识
     * @param taskId 任务编号
     */
    public TaskKeyJava8(String teamId, int taskId) {
        this.teamId = teamId;
        this.taskId = taskId;
    }

    /**
     * 判断两个任务键是否代表同一个团队任务。
     *
     * @param obj 待比较对象
     * @return 团队标识和任务编号都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskKeyJava8)) {
            return false;
        }
        TaskKeyJava8 other = (TaskKeyJava8) obj;
        return taskId == other.taskId && Objects.equals(teamId, other.teamId);
    }

    /**
     * 根据任务键字段计算哈希值。
     *
     * @return 与 equals 使用相同字段得到的哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, taskId);
    }
}
```

这里没有把 `instanceof TaskKeyJava8 other` 强行改成 Java 8 不支持的语法。除此之外，`final` 类、字段和
`Objects` 辅助方法都可以直接在 Java 8 中使用。若一个值对象需要支持 Java 8，保留这份传统写法即可。

### 4. 让空值比较也遵守合同

当相等字段是引用类型时，直接写 `teamId.equals(other.teamId)` 假设了左侧永远非空。更稳妥的最小写法是：

```java
return taskId == other.taskId && Objects.equals(teamId, other.teamId);
```

`Objects.equals(a, b)` 的观察结果可以直接列出：

```java
System.out.println(Objects.equals(null, null));          // true
System.out.println(Objects.equals(null, "team-7"));     // false
System.out.println(Objects.equals("team-7", "team-7")); // true
```

这只是比较两个引用的辅助方法，不会把 `null` 变成某个业务字符串。真正的业务规则仍由 `equals` 决定：如果
`teamId` 不允许为空，应在构造器中拒绝它，而不是把空值解释成一个有效团队。

## 三、让 hashCode 与 equals 配对

### 1. 先记住 hashCode 的三条合同

`hashCode()` 返回一个 `int`，它不是对象的唯一编号，也不是要求“不同对象绝不相同”的指纹。需要记住三点：

（1）同一个对象在相等字段没有变化的执行期间重复调用，应返回同一个整数。

（2）如果 `x.equals(y)` 为 `true`，则 `x.hashCode() == y.hashCode()` 必须为 `true`。

（3）两个不相等对象可以得到相同整数，这叫哈希碰撞；实现应尽量减少碰撞，但不能把“哈希不同”当成
`equals` 为 `false` 的证明。

因此“只重写 equals，不重写 hashCode”是错误的。此时相等的两个对象仍可能保留不同的 Object 身份哈希，
哈希结构先根据哈希值定位，再调用 equals 复核，最终可能找不到本应相等的键。

### 2. 用相同字段生成哈希值

`Objects.hash(teamId, taskId)` 等价于把这两个字段组合成一个整数结果，最重要的不是具体乘数，而是字段集合
和 `equals` 对齐。下面的对照可以在不引入集合实现的情况下观察配对关系：

```java
TaskKey first = new TaskKey("team-7", 4201);
TaskKey same = new TaskKey("team-7", 4201);

System.out.println(first.equals(same));
System.out.println(first.hashCode() == same.hashCode());
```

输出是两次 `true`。第一次由 `equals` 确认业务字段相同，第二次由配对的 `hashCode` 确认合同没有被破坏。
即使未来某次碰撞让两个不相等对象 hashCode 相同，也不能反过来据此认为它们 equals。

### 3. 不要把可变字段随意当作哈希键的一部分

Object 的合同允许相等字段发生变化，只要变化前后分别遵守合同；但对象一旦作为哈希结构的键，修改这些字段
会让它所在的内部位置与新的哈希值不一致。下面只观察现象，不讲哈希表的分桶算法：

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/** 展示可变哈希键的风险。 */
final class MutableTaskKey {
    private String code;

    /**
     * 创建可变任务键。
     *
     * @param code 任务编码
     */
    public MutableTaskKey(String code) {
        this.code = code;
    }

    /**
     * 修改任务编码。
     *
     * @param code 新编码
     */
    public void setCode(String code) {
        this.code = code;
    }

    /**
     * 按任务编码比较键。
     *
     * @param obj 待比较对象
     * @return 编码相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof MutableTaskKey)) {
            return false;
        }
        MutableTaskKey other = (MutableTaskKey) obj;
        return Objects.equals(code, other.code);
    }

    /**
     * 根据任务编码计算哈希值。
     *
     * @return 任务编码哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(code);
    }
}

Map<MutableTaskKey, String> map = new HashMap<>();
MutableTaskKey key = new MutableTaskKey("task-4201");
map.put(key, "设计任务看板");
key.setCode("task-4202");
System.out.println(map.get(key));
```

这里常见的观察结果是 `null`，因为 `key` 的新哈希值不再对应它放入时的位置。这个结果不是说条目一定被
删除，而是当前键状态无法按原路径找到它。实际项目中优先使用创建后不改变相等字段的值对象；若对象必须
变化，先从哈希结构移除，再修改字段，最后按新状态重新放入。集合 API 的完整选择和操作留给后续课程。

### 4. `getClass` 与 `instanceof` 的选择边界

本课的 `TaskKey` 声明为 `final`，所以 `instanceof TaskKey` 不会遇到子类增加字段的问题。对于允许继承的
基类，`instanceof` 版本可能让父类认为子类相等，而子类又因为额外字段返回不相等，从而破坏对称性。严格按
运行时类比较的写法是：

```java
if (obj == null || getClass() != obj.getClass()) {
    return false;
}
TaskKey other = (TaskKey) obj;
```

这段写法适合把每个具体类当作独立值类型的设计；它不会让父类和子类混在同一个相等集合里。选择哪一种必须
和类是否允许继承、相等字段是否在层次中稳定这两个事实一起决定，不要只看代码长度。

## 四、在 TeamFlow 中串起对象合同

### 1. 先写清任务键的业务事实

TeamFlow 的通知、任务查询和审计记录都需要识别一个任务。这里不把整个任务对象拿来比较，而是抽出两个稳定
字段：团队标识 `teamId` 和任务编号 `taskId`。同样的二元组应得到相等结果，不同编号应得到不相等结果；两个
相等键作为 `Map` 的查询键时还应该查到同一条任务名称。

下面程序还打印 `==` 的结果，帮助观察“两个对象有同样内容”与“两个引用指向同一对象”是两件事。`HashMap`
只作为已实现合同的观察入口，本课不讲它的内部结构。

### 2. JDK 25 完整程序

在普通 Java 项目中创建 `TeamFlowObjectContractApplication.java`，写入以下完整内容：

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/** 运行 TeamFlow 任务键的 Object 合同示例。 */
public class TeamFlowObjectContractApplication {
    /**
     * 创建相等任务键、写入查询表并输出观察结果。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        TaskKey created = new TaskKey("team-7", 4201);
        TaskKey loaded = new TaskKey("team-7", 4201);
        TaskKey anotherTask = new TaskKey("team-7", 4202);

        Map<TaskKey, String> taskNames = new HashMap<>();
        taskNames.put(created, "设计任务看板");

        System.out.println("身份相等：" + (created == loaded));
        System.out.println("值相等：" + created.equals(loaded));
        System.out.println("相等对象哈希相同：" + (created.hashCode() == loaded.hashCode()));
        System.out.println("通过相等键查到：" + taskNames.get(loaded));
        System.out.println("不同任务相等：" + created.equals(anotherTask));
    }
}

/** 用团队和任务编号表示不可变 TeamFlow 任务键。 */
final class TaskKey {
    private final String teamId;
    private final int taskId;

    /**
     * 创建一个任务键。
     *
     * @param teamId 团队标识
     * @param taskId 任务编号
     */
    public TaskKey(String teamId, int taskId) {
        this.teamId = teamId;
        this.taskId = taskId;
    }

    /**
     * 判断两个任务键是否代表同一个团队任务。
     *
     * @param obj 待比较对象
     * @return 两个业务字段都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskKey other)) {
            return false;
        }
        return taskId == other.taskId && Objects.equals(teamId, other.teamId);
    }

    /**
     * 计算与 equals 字段一致的哈希值。
     *
     * @return 任务键哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, taskId);
    }
}
```

在 IDEA 中运行 `TeamFlowObjectContractApplication`。预期输出为：

```text
身份相等：false
值相等：true
相等对象哈希相同：true
通过相等键查到：设计任务看板
不同任务相等：false
```

第一行因为两个 `new` 产生两个对象而是 `false`；第二行通过重写 `equals` 比较团队和编号而是 `true`；第三行
证明配对的 `hashCode` 合同；第四行说明查询键可以使用另一个相等对象；最后一行的编号不同，所以业务相等为
`false`。`hashCode` 的具体整数没有输出，因为合同只要求关系，不要求某个固定数字。

### 3. Java 8 完整程序

在 Java 8 项目中创建同名的 `TeamFlowObjectContractApplication.java`，使用下面完整代码。不能把 JDK 25
版本中的模式变量直接复制进 Java 8 项目：

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/** 运行 TeamFlow 任务键的 Java 8 Object 合同示例。 */
public class TeamFlowObjectContractApplication {
    /**
     * 创建相等任务键、写入查询表并输出观察结果。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        TaskKeyJava8 created = new TaskKeyJava8("team-7", 4201);
        TaskKeyJava8 loaded = new TaskKeyJava8("team-7", 4201);
        TaskKeyJava8 anotherTask = new TaskKeyJava8("team-7", 4202);

        Map<TaskKeyJava8, String> taskNames = new HashMap<>();
        taskNames.put(created, "设计任务看板");

        System.out.println("身份相等：" + (created == loaded));
        System.out.println("值相等：" + created.equals(loaded));
        System.out.println("相等对象哈希相同：" + (created.hashCode() == loaded.hashCode()));
        System.out.println("通过相等键查到：" + taskNames.get(loaded));
        System.out.println("不同任务相等：" + created.equals(anotherTask));
    }
}

/** 用团队和任务编号表示不可变 TeamFlow Java 8 任务键。 */
final class TaskKeyJava8 {
    private final String teamId;
    private final int taskId;

    /**
     * 创建一个 Java 8 任务键。
     *
     * @param teamId 团队标识
     * @param taskId 任务编号
     */
    public TaskKeyJava8(String teamId, int taskId) {
        this.teamId = teamId;
        this.taskId = taskId;
    }

    /**
     * 判断两个任务键是否代表同一个团队任务。
     *
     * @param obj 待比较对象
     * @return 两个业务字段都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskKeyJava8)) {
            return false;
        }
        TaskKeyJava8 other = (TaskKeyJava8) obj;
        return taskId == other.taskId && Objects.equals(teamId, other.teamId);
    }

    /**
     * 计算与 equals 字段一致的哈希值。
     *
     * @return 任务键哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, taskId);
    }
}
```

Java 8 的预期控制台输出与上一段完全相同。两版的业务合同没有差异，真实差异只在类型判断语法：JDK 25
可以使用模式变量，Java 8 需要判断后显式转换。菱形运算符在 Java 8 已经可用，两版都保留 `new HashMap<>()`。

### 4. 两版运行步骤和核对位置

JDK 25 项目在 IDEA 的 Project SDK 选择 JDK 25，确认 `TeamFlowObjectContractApplication` 是运行类，
右键类名选择 Run；终端也可以在源文件目录执行 `javac TeamFlowObjectContractApplication.java` 后运行
`java TeamFlowObjectContractApplication`。JDK 25 的模式 `instanceof` 若被旧 SDK 标红，先核对项目 SDK、
模块 SDK 和运行配置的 JRE 是否仍指向 Java 8。

Java 8 项目在 IDEA 的 Project SDK 选择 JDK 8，并运行同名主类；终端使用 Java 8 的 `javac` 和 `java`。
如果终端能运行而 IDEA 不能，分别查看终端 `java -version`、`javac -version` 与 IDEA 的 Project SDK；这两
套 JDK 可以不同，不能用其中一处的版本推断另一处。

## 五、集中处理 equals 与 hashCode 的常见错误

**社区补充：** Baeldung 的可复现 Money/WrongVoucher 对照提醒：父类用 `instanceof` 接受子类，而子类把
额外字段也纳入比较时，父类到子类和子类到父类可能得出相反结果。相关 Java 合同仍以 Oracle Object API
为准；本节只保留如何避免初学者误用的边界。

### 六个典型错误

:::pitfalls
### 用 == 判断值对象是否相等

**触发条件：** 两次 `new TaskKey("team-7", 4201)` 得到相同业务字段，却用 `first == second` 判断任务是否相同。

**原因：** 引用 `==` 只比较两个引用是否指向同一个对象，不会调用 `TaskKey.equals`。

**后果：** 内容相同的任务键被误判为不同，缓存或查询逻辑可能重复创建同一任务的记录。

**错误示例：**

```java
TaskKey first = new TaskKey("team-7", 4201);
TaskKey second = new TaskKey("team-7", 4201);
System.out.println(first == second); // false
```

**正确写法：**

```java
TaskKey first = new TaskKey("team-7", 4201);
TaskKey second = new TaskKey("team-7", 4201);
System.out.println(first.equals(second)); // true
```

**验证方式：** 两个独立对象的 `==` 应为 `false`，重写后的 `equals` 应为 `true`；再把 `second` 作为主程序
查询键传入 `Map.get`，应查到与 `first` 写入的同一条任务名称。

### 只重写 equals 而遗漏 hashCode

**触发条件：** 类按业务字段重写了 `equals`，却继续继承 Object 的 `hashCode`。

**原因：** 默认 hashCode 与对象身份语义配套，不能自动知道新 equals 比较了哪些字段。

**后果：** 两个 equals 为 `true` 的对象可能拥有不同哈希值，作为哈希键时相等查询可能失败。

**错误示例：**

```java
import java.util.Objects;

/** 只重写 equals 的错误任务键。 */
final class BrokenTaskKey {
    private final String teamId;
    private final int taskId;

    /**
     * 创建错误任务键。
     *
     * @param teamId 团队标识
     * @param taskId 任务编号
     */
    public BrokenTaskKey(String teamId, int taskId) {
        this.teamId = teamId;
        this.taskId = taskId;
    }

    /**
     * 按业务字段比较任务键。
     *
     * @param obj 待比较对象
     * @return 字段相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof BrokenTaskKey)) {
            return false;
        }
        BrokenTaskKey other = (BrokenTaskKey) obj;
        return taskId == other.taskId && Objects.equals(teamId, other.teamId);
    }
}
```

**正确写法：** 在错误示例中补上使用同一字段集合的 `hashCode`：

```java
/** 根据 equals 字段返回哈希值。 */
@Override
public int hashCode() {
    return Objects.hash(teamId, taskId);
}
```

**验证方式：** 创建两个相同字段的 `BrokenTaskKey`，先确认 `equals` 为 `true`，再检查 `hashCode`；错误版本
不能把“可能相等”与“必须相同”的合同同时满足，修正后两次调用应得到相同整数。

### 把 equals 写成重载而不是重写

**触发条件：** 方法签名写成 `equals(TaskKey other)`，而不是 Object 合同要求的 `equals(Object obj)`。

**原因：** 参数类型变窄后只是新建了一个重载方法；通过 `Object` 引用调用时，Java 仍会选择继承来的
`equals(Object)`。

**后果：** 直接用具体类型调用看似返回 `true`，放进 `Map` 或通过 Object 引用调用却仍按身份比较。

**错误示例：**

```java
/** 错误地重载 equals 的任务键。 */
final class OverloadedTaskKey {
    private final int taskId;

    /**
     * 创建任务键。
     *
     * @param taskId 任务编号
     */
    public OverloadedTaskKey(int taskId) {
        this.taskId = taskId;
    }

    /**
     * 这是重载，不是 Object.equals 的重写。
     *
     * @param other 具体任务键
     * @return 编号相同则为 true
     */
    public boolean equals(OverloadedTaskKey other) {
        return other != null && taskId == other.taskId;
    }
}

Object first = new OverloadedTaskKey(4201);
Object second = new OverloadedTaskKey(4201);
System.out.println(first.equals(second)); // false
```

**正确写法：** 使用 `@Override` 让编译器核对 Object 的精确签名：

```java
/** 正确重写 Object.equals 的任务键。 */
final class CorrectTaskKey {
    private final int taskId;

    /**
     * 创建任务键。
     *
     * @param taskId 任务编号
     */
    public CorrectTaskKey(int taskId) {
        this.taskId = taskId;
    }

    /**
     * 按任务编号比较。
     *
     * @param obj 待比较对象
     * @return 编号相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof CorrectTaskKey)) {
            return false;
        }
        CorrectTaskKey other = (CorrectTaskKey) obj;
        return taskId == other.taskId;
    }

    /**
     * 按任务编号计算哈希值。
     *
     * @return 任务编号
     */
    @Override
    public int hashCode() {
        return Integer.hashCode(taskId);
    }
}
```

**验证方式：** JDK 25 和 Java 8 都应让 `@Override` 通过正确签名；把两个正确对象保存为 `Object` 后调用
`equals` 应为 `true`。错误版本通过 `Object` 调用应保持 `false`。

### 直接调用可为空字段的 equals

**触发条件：** `teamId` 允许为空，却写成 `teamId.equals(other.teamId)`。

**原因：** 当当前对象的 `teamId` 为 `null` 时，调用实例方法前没有可用接收者。

**后果：** 本应只是一次不相等判断，却在运行时抛出 `NullPointerException`。

**错误示例：**

```java
String teamId = null;
String otherTeamId = "team-7";
System.out.println(teamId.equals(otherTeamId));
```

**正确写法：**

```java
System.out.println(Objects.equals(teamId, otherTeamId)); // false
```

**验证方式：** 用 `null` 与非空团队标识运行错误版本应出现空指针异常；正确版本应稳定输出 `false`，两个参数
都为 `null` 时应输出 `true`。

### 修改哈希结构中的可变键

**触发条件：** 对象的 `equals` 和 `hashCode` 都依赖 `code`，放入 `HashMap` 后又调用 setter 修改 `code`。

**原因：** 键的新哈希值与放入时使用的内部位置不一致，当前对象不再能沿新路径找到原条目。

**后果：** `map.get(key)` 可能返回 `null`，看起来像条目丢失；实际条目仍可能占据旧位置。

**错误示例：**

```java
Map<MutableTaskKey, String> map = new HashMap<>();
MutableTaskKey key = new MutableTaskKey("task-4201");
map.put(key, "设计任务看板");
key.setCode("task-4202");
System.out.println(map.get(key)); // 常见结果：null
```

**正确写法：**

```java
Map<TaskKey, String> map = new HashMap<>();
TaskKey key = new TaskKey("team-7", 4201);
map.put(key, "设计任务看板");
System.out.println(map.get(new TaskKey("team-7", 4201))); // 设计任务看板
```

**验证方式：** 错误版本在同一个运行过程中先写入再修改并读取，观察 `null`；正确版本使用不可变
`TaskKey`，用另一个相等键读取，应输出“设计任务看板”。

### 让继承层次破坏 equals 对称性

**触发条件：** 可继承父类按 `instanceof` 比较基础字段，子类又按 `instanceof 子类` 比较并额外检查字段。

**原因：** 两个方向的可接受类型集合不同，父类可能忽略子类字段，子类却拒绝父类对象。

**后果：** `base.equals(child)` 与 `child.equals(base)` 得到不同结果，违反对称性。

**错误示例：**

```java
/** 只比较金额的父类。 */
class Amount {
    protected final int cents;

    /**
     * 创建金额。
     *
     * @param cents 金额分
     */
    public Amount(int cents) {
        this.cents = cents;
    }

    /**
     * 按金额比较。
     *
     * @param obj 待比较对象
     * @return 金额相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        return obj instanceof Amount && cents == ((Amount) obj).cents;
    }

    /**
     * 按金额计算哈希值。
     *
     * @return 金额哈希值
     */
    @Override
    public int hashCode() {
        return Integer.hashCode(cents);
    }
}

/** 把商店字段加入相等判断的子类。 */
final class Voucher extends Amount {
    private final String store;

    /**
     * 创建代金券。
     *
     * @param cents 金额分
     * @param store 商店名称
     */
    public Voucher(int cents, String store) {
        super(cents);
        this.store = store;
    }

    /**
     * 按金额和商店比较。
     *
     * @param obj 待比较对象
     * @return 仅另一个 Voucher 且字段相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        return obj instanceof Voucher
            && cents == ((Voucher) obj).cents
            && Objects.equals(store, ((Voucher) obj).store);
    }
}

Amount amount = new Amount(100);
Voucher voucher = new Voucher(100, "TeamFlow");
System.out.println(amount.equals(voucher));  // true
System.out.println(voucher.equals(amount));  // false
```

**正确写法：** 让值对象保持 `final`，或使用严格 `getClass()` 检查并重新设计继承边界；本课的 `TaskKey` 选择
前者，不允许子类添加新的相等字段。

```java
/** final 值对象不允许子类改变相等合同。 */
final class StableTaskKey {
    private final int taskId;

    /**
     * 创建稳定任务键。
     *
     * @param taskId 任务编号
     */
    public StableTaskKey(int taskId) {
        this.taskId = taskId;
    }

    /**
     * 按精确类和任务编号比较。
     *
     * @param obj 待比较对象
     * @return 类型和编号都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        StableTaskKey other = (StableTaskKey) obj;
        return taskId == other.taskId;
    }

    /**
     * 按任务编号计算哈希值。
     *
     * @return 任务编号哈希值
     */
    @Override
    public int hashCode() {
        return Integer.hashCode(taskId);
    }
}
```

**验证方式：** 错误版本应打印 `true`、`false`，直接证明对称性被破坏；正确版本因类为 `final`，不存在子类添加
字段的路径，反复调用和 null 比较应保持合同一致。
:::

## 六、练习：实现可比较的 TeamFlow 任务标签

### 1. 独立完成任务

:::exercise
### 为任务标签建立对象合同

**要求：** 创建一个 `final` 类 `TaskTag`，保存不可变的 `teamId` 与 `slug` 两个字符串字段；提供构造器、
`equals(Object)` 和 `hashCode()`。两个字段都相等时对象相等，任一字段不同或参数不是 `TaskTag` 时不相等。
JDK 25 使用模式 `instanceof`，Java 8 在同一位置使用传统判断和显式转换。使用 `Objects.equals` 与
`Objects.hash`，不要只重写其中一个方法，也不要使用 `==` 比较字符串内容。分别创建相等标签、不同 slug
标签和 null 参数，打印 `equals`、哈希相等性以及把标签作为 `HashMap` 查询键的结果。

**验收：**

```text
相等标签：true
不同标签：false
相等标签哈希相同：true
查询结果：任务看板
空值比较：false
```
:::

### 2. JDK 25 参考实现

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/** 运行 TaskTag 练习的 JDK 25 程序。 */
public class TeamFlowTaskTagExercise {
    /**
     * 创建标签并验证相等合同。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        TaskTag first = new TaskTag("team-7", "board");
        TaskTag same = new TaskTag("team-7", "board");
        TaskTag different = new TaskTag("team-7", "release");
        Map<TaskTag, String> labels = new HashMap<>();
        labels.put(first, "任务看板");

        System.out.println("相等标签：" + first.equals(same));
        System.out.println("不同标签：" + first.equals(different));
        System.out.println("相等标签哈希相同：" + (first.hashCode() == same.hashCode()));
        System.out.println("查询结果：" + labels.get(same));
        System.out.println("空值比较：" + first.equals(null));
    }
}

/** 用两个不可变字符串表示 TeamFlow 标签。 */
final class TaskTag {
    private final String teamId;
    private final String slug;

    /**
     * 创建任务标签。
     *
     * @param teamId 团队标识
     * @param slug 标签短名
     */
    public TaskTag(String teamId, String slug) {
        this.teamId = teamId;
        this.slug = slug;
    }

    /**
     * 判断两个标签是否具有相同字段。
     *
     * @param obj 待比较对象
     * @return 两个字段都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskTag other)) {
            return false;
        }
        return Objects.equals(teamId, other.teamId) && Objects.equals(slug, other.slug);
    }

    /**
     * 根据两个标签字段计算哈希值。
     *
     * @return 标签哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, slug);
    }
}
```

### 3. Java 8 参考实现

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/** 运行 TaskTag 练习的 Java 8 程序。 */
public class TeamFlowTaskTagExercise {
    /**
     * 创建标签并验证相等合同。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        TaskTagJava8 first = new TaskTagJava8("team-7", "board");
        TaskTagJava8 same = new TaskTagJava8("team-7", "board");
        TaskTagJava8 different = new TaskTagJava8("team-7", "release");
        Map<TaskTagJava8, String> labels = new HashMap<>();
        labels.put(first, "任务看板");

        System.out.println("相等标签：" + first.equals(same));
        System.out.println("不同标签：" + first.equals(different));
        System.out.println("相等标签哈希相同：" + (first.hashCode() == same.hashCode()));
        System.out.println("查询结果：" + labels.get(same));
        System.out.println("空值比较：" + first.equals(null));
    }
}

/** 用两个不可变字符串表示 TeamFlow Java 8 标签。 */
final class TaskTagJava8 {
    private final String teamId;
    private final String slug;

    /**
     * 创建 Java 8 任务标签。
     *
     * @param teamId 团队标识
     * @param slug 标签短名
     */
    public TaskTagJava8(String teamId, String slug) {
        this.teamId = teamId;
        this.slug = slug;
    }

    /**
     * 判断两个标签是否具有相同字段。
     *
     * @param obj 待比较对象
     * @return 两个字段都相同则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskTagJava8)) {
            return false;
        }
        TaskTagJava8 other = (TaskTagJava8) obj;
        return Objects.equals(teamId, other.teamId) && Objects.equals(slug, other.slug);
    }

    /**
     * 根据两个标签字段计算哈希值。
     *
     * @return 标签哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, slug);
    }
}
```

两版参考实现都输出练习验收中的五行结果。JDK 25 版本的 `TaskTag other` 只在模式匹配成功后存在；Java 8
版本先判断 `instanceof TaskTagJava8`，再用显式转换得到 `other`。其余对象合同完全相同。

### 4. 练习验收说明

先确认 `first.equals(same)` 为 `true`，再确认哈希相同，最后用 `same` 查询 `Map` 得到“任务看板”。这三步
分别证明值相等、hashCode 配对和哈希键可替换。`first.equals(null)` 为 `false` 证明非空合同；如果任一步
失败，应优先检查 `@Override`、参数是否为 `Object`、两个方法使用的字段是否一致，而不是先修改输出文字。

## 七、回顾与下一步边界

本课把 `Object` 提供的默认身份语义改造成了 TeamFlow 任务键的值语义：`equals` 定义“哪些字段代表同一个
值”，`hashCode` 为相等对象提供一致的整数关系。`==` 仍然只表示同一对象，不能替代业务相等；哈希结构中的
键也不应在放入后改变参与合同的字段。

JDK 25 的模式 `instanceof` 只是减少一次显式转换，Java 8 的传统写法仍能完整实现同一合同。本课没有讲
`record` 自动生成 equals/hashCode、集合类型的选择与遍历，也没有讲数据库实体或 ORM 的身份策略；这些主题
将在后续课程按计划展开。
