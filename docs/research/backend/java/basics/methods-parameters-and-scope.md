# 方法、参数、返回值、作用域与值传递研究记录

## 冻结课程合同

- `phaseCourse`：`B-05`
- `courseId`：`backend.java.learn.basics.methods-parameters-and-scope`
- `title`：方法、参数、返回值、作用域与值传递
- `nature`：必修
- `estimatedMinutes`：`75`
- `stableIdPolicy`：复用现有稳定 ID，不更改 slug 或 URL
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`140`
- `prerequisites`：`backend.java.learn.basics.control-flow`
- `related`：为空
- `sourceCapabilityIds`：为空
- `necessaryPrerequisiteId`：`JAVA-PREREQ-004`
- `origin`：`necessary-prerequisite`
- `selectionReason`：3436 个项目文件的公开方法和调用关系无法在缺少方法基础时理解。
- `projectEvidence`：为空
- `modernBaseline`：研究时重新选择当前受支持稳定版本
- `legacyBaseline`：Java 8、Spring Boot 2.3.12.RELEASE，仅作 legacy 补充
- `sourcePlan`：JLS 当前稳定版与 Java 8 归档版；Dev.java Learn 与 OpenJDK 迁移资料
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本轮 Phase A 路线冻结将本课固定为 B-05，唯一前置是已关闭的 B-04。旧 Phase 2 字段仅作
历史来源追溯，不得覆盖 B-05 的 75 分钟、必修、稳定 ID 复用和唯一前置合同。

本课只建立方法声明、固定参数、实参、返回、重载、参数与块内局部变量作用域，以及 Java 按值传递的
基础心智模型。数组与 varargs 留给下一课；类设计、泛型、异常、lambda 和框架能力留给后续课程。
为解释引用值副本，验证代码只把前置已出现的 `String` 与 JDK 现成的 `StringBuilder` 当作
最小引用类型，不展开其 API、构造过程或对象设计。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-14 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 已于 2025-09-16 GA |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE 只提供项目版本背景 |
| 项目证据 | 冻结矩阵中 `sourceCapabilityIds: []`、`projectEvidence: []` |
| 验证设计 | Eclipse Temurin 25.0.3+9 与 8u492-b09 固定 Docker 镜像 |

Oracle 支持路线图将 Java 25 列为 LTS；OpenJDK JDK 25 页面确认它是 Java SE 25 的参考实现并已 GA。
本课的固定参数方法合同在 JLS 25 与 JLS 8 对应章节中一致，因此现代主线先按 Java 25 解释，再用
同一份 Java 8 兼容源码验证稳定边界。

## 结论与直接证据

| 结论 | 直接来源 | 页内范围 | 适用版本 | 验证设计 |
| --- | --- | --- | --- | --- |
| Java 25 是已 GA 的 Java SE 25 参考实现版本，也是 Oracle 支持路线中的 LTS | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)；[Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | Reference Implementation、General Availability；Oracle Java SE Product Releases | 2026-08-14 页面状态 | 与固定 JDK 25 镜像版本交叉核对 |
| 方法声明在本课范围内由返回类型、方法名、圆括号中的固定参数列表和方法体构成；无参数仍保留空圆括号 | [JLS 25 8.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4)；[Dev.java Defining Methods](https://dev.java/learn/classes-objects/defining-methods/) | Method Declaration；Defining a Method | Java 25 | 编译有参、无参和 `void` 方法 |
| 参数是声明中的变量，实参是调用处的表达式；调用前，实参值初始化新建的参数变量 | [JLS 25 8.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[Dev.java Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors/) | Formal Parameters；Passing Information to a Method or a Constructor | Java 25 | 运行固定参数方法并检查结果 |
| 在本课非泛型固定参数范围内，方法签名由方法名和有序参数类型决定；返回类型不参与签名，也不能单独区分重载 | [JLS 25 8.4.2、8.4.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.2)；[Dev.java Defining Methods](https://dev.java/learn/classes-objects/defining-methods/) | Method Signature；Overloading；Overloading Methods | Java 25 | 正向重载运行；仅返回类型不同要求编译失败 |
| 非 `void` 方法的返回表达式必须可赋给声明的返回类型，方法体不能从末尾正常完成；`return` 将控制权和可选值交回调用方 | [JLS 25 8.4.5、8.4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.5)；[JLS 25 14.17](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.17) | Method Result；Method Body；The `return` Statement | Java 25 | 正常返回通过；缺失返回要求编译失败 |
| 方法参数作用域覆盖整个方法体；块内局部变量从自身 initializer 起覆盖所在块剩余部分 | [JLS 25 6.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.3) | Scope of a Declaration | Java 25 | 正向块作用域运行；块外读取局部变量要求编译失败 |
| 当前方法体的普通局部块内不能再声明与参数同名的局部变量 | [JLS 25 6.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.4) | Shadowing | Java 25 | 参数同名局部变量要求编译失败 |
| Java 对 primitive value 和 reference value 都按值传递；引用形参获得的是引用值副本，不是调用方变量本身 | [JLS 25 8.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[JLS 25 15.12.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.2)；[Dev.java Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors/) | 新建参数变量；Evaluate Arguments；Passing Primitive/Reference Data Type Arguments | Java 25 | 对照 primitive 形参赋值、对象修改和引用形参重新赋值 |
| 上述固定参数、签名、重载、返回、作用域、shadowing 与按值传递合同在 Java 8 中同样成立 | [JLS 8 6.3、6.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html)；[JLS 8 8.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4)；[JLS 8 14.17](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.17)；[JLS 8 15.12.4.2](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.12.4.2) | 对应章节 | Java 8 | 同一源码与负向案例在 JDK 8 重跑 |

外部资料发现使用 Tavily，随后逐页打开或提取 Oracle JLS 25、JLS 8、Dev.java、OpenJDK 和 Oracle
支持路线图正文。搜索摘要、社区文章和 AI 输出均未作为结论证据。

## 正文七个知识点冻结合同

正文必须用七个独立三级标题按下列顺序教学。下列片段在正文中必须放入同一个可编译的
最小类或独立易错点中，不得把不完整片段冒充可直接编译的整个文件。

### 1. 方法声明的组成

**它是什么：** 方法声明为一段可调用行为给出名称与边界。本课可见组成是必要的返回类型或 `void`、
方法名、圆括号内的固定参数列表和花括号方法体；示例还使用前置已见的 `static`。

**有什么作用：** 调用方可以用稳定名称重复执行一段行为，而不必复制语句。

**什么时候使用：** 当一段计算有明确输入、结果或可观察行为时使用；本课不讨论方法应归属哪个类。

**怎么使用：** 先写返回类型，再写名称和圆括号，最后在方法体内写语句；无参数时仍保留 `()`。

**最小示例：**

```java
/**
 * 返回反馈环标识。
 */
static String banner() {
    return "methods";
}
```

**运行结果：** 调用 `banner()` 得到 `methods`。

**常见误区：** 无参数不等于可以省略圆括号；泛型类型参数和 `throws` 属于完整语法的其他组成，
但由 B-10、B-12 讲解。

### 2. 形参、实参与固定参数对应

**它是什么：** 形参是方法声明中的输入变量，实参是调用处提供的表达式或值。

**有什么作用：** 形参让同一方法处理不同输入；实参为某一次调用提供具体输入。

**什么时候使用：** 当计算需要从调用处接收数据时使用固定参数；可变参数留给 B-06。

**怎么使用：** 在声明的圆括号中按顺序写“类型 + 形参名”，调用时按对应顺序给出实参。

**最小示例：**

```java
/**
 * 返回两个整数之和。
 */
static int add(int left, int right) {
    return left + right;
}
```

**运行结果：** `add(2, 3)` 精确返回 `5`；`left` 和 `right` 是形参，`2` 和 `3` 是实参。

**常见误区：** 参数名不参与调用处的对应，数量、顺序和可适用类型才是调用合同。

### 3. `void`、返回值与正常完成路径

**它是什么：** `void` 方法不产生结果值；声明其他返回类型的方法需通过 `return` 交回可赋给该类型的值。

**有什么作用：** `void` 用于只需执行行为的方法；返回值让调用方继续使用计算结果。

**什么时候使用：** 需要向调用方交回数据时声明精确返回类型；只改变方法内参数副本的演示方法用 `void`。

**怎么使用：** 对非 `void` 方法，让每条能正常走到末尾的路径在此前执行兼容的 `return`。

**最小示例：**

```java
/**
 * 按条件返回数值。
 */
static int choose(boolean ready) {
    if (ready) {
        return 1;
    }
    return 0;
}
```

**运行结果：** `choose(true)` 返回 `1`，`choose(false)` 返回 `0`；两条正常路径都交回整数。

**常见误区：** “打印了一个值”不等于“返回了一个值”；非 `void` 方法存在缺少返回的正常路径时应编译失败。

### 4. 方法签名与无歧义重载选择

**它是什么：** 在本课非泛型固定参数范围内，方法签名由方法名与有序参数类型决定；返回类型不参与。

**有什么作用：** 签名区分同名方法，重载让同一行为名称接收不同类型的明确输入。

**什么时候使用：** 只在同一概念行为确实需要不同参数类型时使用；示例只提供精确匹配的 `int` 和 `String`。

**怎么使用：** 保持方法名一致，让参数类型列表不同；调用时提供无歧义的精确类型。

**最小示例：**

```java
/**
 * 返回整数参数的描述。
 */
static String describe(int value) {
    return "number:" + value;
}

/**
 * 返回文本参数的描述。
 */
static String describe(String value) {
    return "text:" + value;
}
```

**运行结果：** `describe(3)` 返回 `number:3`，`describe("ok")` 返回 `text:ok`。

**常见误区：** 只改返回类型不会形成新重载；完整重载解析阶段、类型转换优先级、overriding 和 hiding 均不在本课。

### 5. 方法参数的作用域与同名边界

**它是什么：** 方法参数的作用域覆盖整个方法体，方法体内的普通局部块不能再声明同名局部变量。

**有什么作用：** 该边界决定方法体内哪些位置能用简单名称访问参数，并避免同一方法内名称混淆。

**什么时候使用：** 阅读或编写方法体内的条件块时，必须先确认参数名仍在作用域内。

**怎么使用：** 在方法体任何嵌套普通块内继续使用参数名；若需要中间结果，起一个不同的局部变量名。

**最小示例：**

```java
/**
 * 在整个方法体中使用参数。
 */
static int normalize(int count) {
    if (count < 0) {
        count = 0;
    }
    return count;
}
```

**运行结果：** `normalize(-1)` 返回 `0`；嵌套 `if` 块仍能访问参数 `count`。

**常见误区：** 不能在方法体的普通嵌套块中再写 `int count = 1`；字段遮蔽、嵌套类和 lambda 的名称规则不在本课。

### 6. 块内局部变量的作用域与重复声明

**它是什么：** 本课的块内局部变量从自身 initializer 开始到直接包围它的块结束为止；作用域内不能重复声明同名局部变量。

**有什么作用：** 该边界把临时名称限制在真正需要它的代码块中，并让编译器拒绝越界访问。

**什么时候使用：** 只有某个 `if` 块需要的中间值应声明在该块中；块外也需使用的结果应在外层先声明。

**怎么使用：** 在最小必要块中声明局部变量，并在该块右花括号前完成所有访问。

**最小示例：**

```java
/**
 * 只在直接包围块内使用临时变量。
 */
static int countWithinBlock(boolean enabled) {
    int total = 1;
    if (enabled) {
        int extra = 2;
        total += extra;
    }
    return total;
}
```

**运行结果：** `countWithinBlock(true)` 返回 `3`；`extra` 只在 `if` 块内可访问。

**常见误区：** 在右花括号之后读取 `extra` 会编译失败；不要把“值仍然有意义”误当成“变量名仍在作用域内”。

### 7. primitive value 与 reference value 都按值传递

**它是什么：** 每次调用都新建参数变量，并用实参值初始化。primitive 实参复制 primitive value；引用类型实参复制 reference value。

**有什么作用：** 这个心智模型能预测“给参数重新赋值”与“通过两个相同引用值观察同一对象”的不同结果。

**什么时候使用：** 只要向方法传参就用这个模型；本课只用 `int`、`String` 和 `StringBuilder` 建立最小对照。

**怎么使用：** 先区分调用方变量与新建参数变量，再判断复制的是 primitive value 还是 reference value；不使用“对象按引用传递”的说法。

**最小示例：**

```java
/**
 * 只修改 primitive 参数变量的副本。
 */
static void changeNumber(int value) {
    value = 99;
}

/**
 * 只重新绑定 String 参数变量。
 */
static void changeText(String value) {
    value = "after";
}

/**
 * 先修改共同引用的现成对象，再只重新绑定参数。
 */
static void changeBuilder(StringBuilder value) {
    value.append("-changed");
    value = new StringBuilder("local");
}
```

**运行结果：** 调用后调用方的 `number` 仍为 `3`，`text` 仍为 `before`；原 `StringBuilder` 显示 `before-changed`，但没有被替换成 `local`。

**常见误区：** 能通过参数观察到现成对象的变化，不证明 Java 按引用传递；`StringBuilder` 只是反馈环的现成引用类型，类、对象、构造和封装统一留给 B-07。

## 从零跟着做冻结合同

正文的“从零跟着做”必须是七个真实 Markdown 有序列表项，不得合并成一段：

1. 在 `/tmp` 的 `mktemp` 目录中新建 `MethodsScopePositive.java`，先放入类声明和传统 `main(String[] args)` 运行入口；明确 `args` 只是运行器必需签名，不教数组。
2. 加入 `banner()`、`add(int, int)` 与无歧义的两个 `describe(...)` 重载，每个方法上方写规范中文注释。
3. 加入 `choose(boolean)` 与 `countWithinBlock(boolean)`，确认非 `void` 的每条正常路径都返回值，且 `extra` 只在 `if` 块内使用。
4. 加入 `changeNumber(int)`、`changeText(String)` 与 `changeBuilder(StringBuilder)`，分别观察参数重新赋值和现成对象变化。
5. 在 `main` 中按固定顺序调用方法，组合出唯一精确输出 `methods|5|number:3|text:ok|1|3|number:3|text:before|builder:before-changed`。
6. 分别用固定 Temurin 25 和 Temurin 8 镜像编译运行同一源码，对工具版本和标准输出做精确比较。
7. 再分别编译四个独立错误源码，确认仅返回类型不同、非 `void` 缺返回、参数同名重声明和块外访问均非零退出；最后用 `find <临时目录> -depth -delete` 清理所有资产。

## 现代主线结论

### 方法声明、参数与返回

1. 方法把一段行为放在稳定名称之后。调用方通过方法名和圆括号发起调用；声明中的参数提供方法体可用
   的输入变量，调用处的实参表达式先求值，再把结果交给对应参数。
2. 本课只讲固定参数。参数的数量、顺序和类型是调用合同的一部分；参数名帮助阅读方法体，但不属于
   本课非泛型方法签名。
3. `void` 表示方法不产生返回值；其他返回类型要求返回表达式可赋给该类型。非 `void` 方法不能沿着
   可正常完成的路径直接走到方法体末尾。
4. 调用方法得到的返回值可继续用于赋值或表达式。不要把“方法打印了内容”和“方法返回了值”视为
   同一件事。

### 方法签名与重载

1. JLS 的完整签名定义还处理类型参数与类型适配；泛型不在本课范围。本课的非泛型固定参数示例可按
   “方法名 + 有序参数类型”识别签名。
2. 同名方法只有在签名不等价时才能形成重载。示例使用 `describe(int)` 与 `describe(String)`，让
   编译器按实参的编译期类型选择目标。
3. 返回类型不参与重载选择。两个方法若同名且参数类型完全相同，仅把 `int` 返回改成 `long` 仍是
   冲突声明。
4. 本课不展开完整重载解析算法、继承中的 overriding/hiding 或类型转换优先级。课程示例只使用无歧义
   的精确参数类型，避免把复杂解析规则伪装成“总会选最像的那个”。

### 参数与局部作用域

| 变量种类 | 本课使用的作用域规则 | 同名时的处理 |
| --- | --- | --- |
| 方法参数 | 整个方法体 | 当前方法体的普通局部块内不能再声明同名局部变量 |
| 块内局部变量 | 从声明自己的 initializer 起，到直接包围它的块结束 | 作用域外不可读取；作用域内不能再次声明同名局部变量 |

课程只用方法参数和块内局部变量建立作用域边界，不延伸到字段、继承、嵌套类或 lambda 的名称解析。

### Java 按值传递

1. 调用方法时，每个形参都是新建的参数变量，并由对应实参值初始化。这是 primitive 和 reference
   参数共同的起点。
2. primitive 实参把 primitive value 复制给参数。方法体给参数重新赋值，不会改变调用方变量。
3. reference 实参复制的是 reference value。`String` 参数重新赋值不会改变调用方变量；调用方
   变量和 `StringBuilder` 参数起初可以引用同一个现成对象，所以通过参数对它作最小修改会被调用方观察到。
4. 给引用参数重新赋一个新引用，只改变参数变量；调用方变量仍保存原来的引用。因此 Java 不是把调用方
   变量本身“按引用传入”。

## Java 25 与 Java 8 边界

| 对比项 | Java 25 现代线 | Java 8 legacy 线 | 课程处理 |
| --- | --- | --- | --- |
| 固定参数方法声明与调用 | 本课合同适用 | 本课合同一致 | 使用同一源码双版本编译运行 |
| 非泛型方法签名与重载 | 名称和有序参数类型决定本课签名；返回类型不参与 | 合同一致 | 不虚构版本差异 |
| 返回与局部作用域 | 本课所用规则稳定 | 合同一致 | 同一正向与负向反馈环 |
| primitive/reference 按值传递 | 两类值均初始化新参数变量 | 合同一致 | 对象修改与参数重新赋值分开观察 |
| Spring Boot | 不参与语言合同 | 2.3.12.RELEASE 仅是冻结项目背景 | 不引入框架 API |

Java 25 包含 Java 8 之后新增的其他语言能力，但它们不改变本课选定的稳定子集。本课不借版本对比提前
介绍数组、varargs、泛型、异常、lambda、紧凑源码文件或实例 `main` 方法。

## 易错点取证

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 仅改变返回类型来重载 | 声明两个同名且参数类型相同的方法 | 返回类型不参与方法签名或重载选择 | 编译失败 | 两个 `convert(int)` 分别返回 `int` 与 `long` | 改变有实际语义差异的参数列表，或使用不同名称 | Java 8、Java 25 | 两个固定 JDK 均要求 `javac` 非零 | [JLS 25 8.4.2、8.4.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.2)；[JLS 8 8.4.2、8.4.9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.2) |
| 非 `void` 方法遗漏返回 | 存在一条可正常走到方法体末尾的路径 | 有返回类型的方法体不能正常完成 | 编译失败 | 只在 `ready == true` 分支返回 `int` | 让每条正常路径返回兼容值 | Java 8、Java 25 | 两个固定 JDK 均要求 `javac` 非零 | [JLS 25 8.4.7、14.17](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.7)；[JLS 8 8.4.7、14.17](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.7) |
| 在方法体普通局部块重新声明同名参数 | 局部变量名与当前方法参数相同 | 参数作用域覆盖整个方法体，规范禁止该局部重声明 | 编译失败 | 参数为 `count`，方法体普通局部块再次声明局部 `count` | 继续使用参数或给局部中间结果起不同名称 | Java 8、Java 25 | 两个固定 JDK 均要求 `javac` 非零 | [JLS 25 6.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.4)；[JLS 8 6.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.4) |
| 在块外读取块内局部变量 | 变量声明在 `if` 块内，读取发生在右花括号之后 | 局部变量作用域在直接包围它的块结束时终止 | 编译失败 | 块后读取 `extra` | 在作用域内使用，或把确需共享的结果声明在外层 | Java 8、Java 25 | 两个固定 JDK 均要求 `javac` 非零 | [JLS 25 6.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.3)；[JLS 8 6.3](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.3) |
| 误以为重新赋引用参数会替换调用方变量 | 方法体把 `String` 或 `StringBuilder` 参数赋为另一个引用值 | 参数是由引用值初始化的新变量，重新赋值只改变该参数 | 调用方变量仍保存原引用值，结果与“按引用传递”的错误预期不符 | 方法内执行 `value = "after"` 或 `value = new StringBuilder("local")` | 分别观察参数重新赋值与对现成对象的最小修改 | Java 8、Java 25 | 共享正向程序精确输出 `text:before|builder:before-changed` | [JLS 25 8.4.1、15.12.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[Dev.java Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors/) |

## 项目证据边界

冻结矩阵明确记录 `sourceCapabilityIds: []`、`necessaryPrerequisiteId: JAVA-PREREQ-004` 和
`projectEvidence: []`。本课由阅读公开方法与调用关系所必需的基础知识产生，不对应已冻结的语言能力
条目，也不登记 `dzzz-app` 文件、符号或观察计数。`dzzz-app` 只保留 Java 8 / Spring Boot
2.3.12.RELEASE 的版本背景；本研究不运行、读取或修改其源码，不把项目方法写法升级为语言合同。

## 可重复验证设计

验证设计固定以下镜像，不使用浮动 tag 作为最终复跑身份：

| 角色 | 固定镜像 | 预期工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

### 正向设计

在 `/tmp` 的 `mktemp` 目录创建一份 Java 8 兼容源码，分别在两个镜像中编译运行；传统
`main(String[] args)` 只作为临时运行入口，不作为数组课程内容：

```java
public final class MethodsScopePositive {
    /**
     * 返回反馈环标识。
     */
    static String banner() {
        return "methods";
    }

    /**
     * 返回两个整数之和。
     */
    static int add(int left, int right) {
        return left + right;
    }

    /**
     * 返回整数参数的描述。
     */
    static String describe(int value) {
        return "number:" + value;
    }

    /**
     * 返回文本参数的描述。
     */
    static String describe(String value) {
        return "text:" + value;
    }

    /**
     * 按条件返回数值。
     */
    static int choose(boolean ready) {
        if (ready) {
            return 1;
        }
        return 0;
    }

    /**
     * 只修改 primitive 参数变量的副本。
     */
    static void changeNumber(int value) {
        value = 99;
    }

    /**
     * 只重新绑定 String 参数变量。
     */
    static void changeText(String value) {
        value = "after";
    }

    /**
     * 先修改共同引用的现成对象，再只重新绑定参数。
     */
    static void changeBuilder(StringBuilder value) {
        value.append("-changed");
        value = new StringBuilder("local");
    }

    /**
     * 验证局部变量只在直接包围它的块内使用。
     */
    static int countWithinBlock(boolean enabled) {
        int total = 1;
        if (enabled) {
            int extra = 2;
            total += extra;
        }
        return total;
    }

    /**
     * 运行方法、重载、作用域与按值传递反馈环。
     */
    public static void main(String[] args) {
        int number = 3;
        changeNumber(number);

        String text = "before";
        changeText(text);

        StringBuilder builder = new StringBuilder("before");
        changeBuilder(builder);

        System.out.println(
                banner()
                        + "|"
                        + add(2, 3)
                        + "|"
                        + describe(number)
                        + "|"
                        + describe("ok")
                        + "|"
                        + choose(true)
                        + "|"
                        + countWithinBlock(true)
                        + "|"
                        + "number:"
                        + number
                        + "|text:"
                        + text
                        + "|builder:"
                        + builder);
    }
}
```

Java 25 与 Java 8 都应编译、运行退出 0，并精确输出：

```text
methods|5|number:3|text:ok|1|3|number:3|text:before|builder:before-changed
```

这一个输出同时证明：无参数、固定参数、返回与重载的正向路径可执行；primitive 参数重新赋值没有
改变 `number`；`String` 参数重新赋值没有改变调用方的 `text`；现成 `StringBuilder` 对象修改可见，但引用参数重新赋值没有替换调用方的 `builder`；块内局部变量按预期解析。

### 负向编译设计

每个案例使用独立临时源码，类中每个方法定义上方继续保留规范中文注释：

| 案例 | 最小触发 | Java 25 预期 | Java 8 预期 |
| --- | --- | --- | --- |
| 仅返回类型不同 | 两个同名方法都接收一个 `int`，分别返回 `int` 与 `long` | `javac` 非零 | `javac` 非零 |
| 缺失返回 | 返回 `int` 的方法只在一个 `if` 分支返回，另一条路径可到达方法体末尾 | `javac` 非零 | `javac` 非零 |
| 参数重声明 | 方法参数名为 `count`，方法体再次声明局部变量 `count` | `javac` 非零 | `javac` 非零 |
| 块外访问 | 在 `if` 块内声明 `extra`，离开块后读取它 | `javac` 非零 | `javac` 非零 |

正向源码、负向源码和所有 class 只写入 `/tmp` 的同一 `mktemp` 目录。每次复制命令退出码、精确标准
输出和必要错误类别，结束时对该临时目录执行 `find <临时目录> -depth -delete`；仓库中不保留 Java
源码、class、fixture 或测试文件。

### 最终 Markdown 可提取合同

1. 正文 `## 如何验证` 必须包含一个自包含 `bash` fenced code block，首行为
   `# B05_METHODS_SCOPE_FEEDBACK_START`，末行为 `# B05_METHODS_SCOPE_FEEDBACK_END`。
2. 提取器只允许在“如何验证”标题与下一个二级标题之间选取该唯一代码块，同时校验首尾标记；不从其他 Java 代码块拼装脚本。
3. 脚本自行创建 `/tmp` 的 `mktemp` 目录，写入一份正向源码与四份负向源码，并通过 `trap` 与 `find -depth -delete` 保证正常或异常退出都会清理。
4. 脚本必须先精确核对 `javac 25.0.3` 和 `javac 1.8.0_492`，再编译运行同一正向源码，两个镜像的标准输出都必须逐字节等于
   `methods|5|number:3|text:ok|1|3|number:3|text:before|builder:before-changed`。
5. 四个负向案例在两个镜像中都必须非零退出，并分别命中“重复方法”、“缺少返回”、“参数同名局部重复声明”与“找不到块内变量”错误类别；不能只检查任意编译失败。
6. 成功时依次输出 `JAVA25_METHODS_SCOPE_PASS`、`JAVA8_METHODS_SCOPE_PASS`、
   `NEGATIVE_RETURN_TYPE_PASS`、`NEGATIVE_MISSING_RETURN_PASS`、
   `NEGATIVE_PARAMETER_REDECLARATION_PASS`、`NEGATIVE_BLOCK_SCOPE_PASS` 和
   `METHODS_SCOPE_FEEDBACK_PASS`。

研究批次使用同一源码与负向断言实际运行反馈环；正文完成后还必须从最终 Markdown 重新提取并复跑，
不能用本研究结果代替最终正文验收。

## 被排除或尚未证实的说法

- 不讲数组、varargs 或索引边界；传统 `main` 的参数只属于临时运行器。
- 不讲类职责、构造过程、封装、不可变性、继承、overriding 或 hiding。
- 不讲泛型方法、类型擦除、重载解析的完整阶段或方法引用。
- 不讲异常声明、异常传播、lambda 或闭包捕获规则。
- 不把“修改引用指向的对象”误写成按引用传递，也不声称重新赋引用参数能替换调用方变量。
- 不引入 Spring Boot 或其他框架 API，不提供性能或安全结论。
- 不从 `dzzz-app` 抽取项目证据，不补造 `sourceCapabilityIds`、文件路径或稳定符号。

## 正文 frontmatter `sources` 候选

```yaml
verifiedAt: 2026-08-14
modernBaseline:
  java: "25"
legacyBaseline:
  java: "8"
  springBoot: "2.3.12.RELEASE"
sources:
  - id: openjdk-jdk-25
    title: OpenJDK JDK 25
    url: https://openjdk.org/projects/jdk/25/
    sourceType: release-note
    appliesTo: JDK 25
    claims:
      - JDK 25 是 Java SE 25 参考实现，并于 2025-09-16 GA
  - id: oracle-java-se-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: 2026-08-14 页面状态
    claims:
      - Java SE 25 在 Oracle 支持路线中是 LTS
  - id: jls25-method-declarations
    title: JLS 25 - 8.4 Method Declarations
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 方法声明、形参、签名、返回类型、方法体与重载的语言规则
      - 实参值初始化新建参数变量
  - id: jls25-scope
    title: JLS 25 - 6.3 Scope of a Declaration
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.3
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 方法参数与块内局部变量的作用域
  - id: jls25-shadowing
    title: JLS 25 - 6.4 Shadowing and Obscuring
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.4
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 参数与局部变量的同名重复声明边界
  - id: jls25-return-statement
    title: JLS 25 - 14.17 The return Statement
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.17
    sourceType: specification
    appliesTo: Java 25
    claims:
      - return 语句向调用方交回控制权与可选结果值
  - id: jls25-evaluate-arguments
    title: JLS 25 - 15.12.4.2 Evaluate Arguments
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.2
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 实参表达式求值为参数值，每个值对应一个形参
  - id: dev-java-defining-methods
    title: Dev.java - Defining Methods
    url: https://dev.java/learn/classes-objects/defining-methods/
    sourceType: official-reference
    appliesTo: Java 25 学习资料
    claims:
      - 方法声明组成、方法签名与重载的官方教学解释
  - id: dev-java-calling-methods
    title: Dev.java - Calling Methods and Constructors
    url: https://dev.java/learn/classes-objects/calling-methods-constructors/
    sourceType: official-reference
    appliesTo: Java 25 学习资料
    claims:
      - 形参与实参的区别、顺序合同与 primitive/reference 参数说明
  - id: jls8-method-declarations
    title: JLS 8 - 8.4 Method Declarations
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的固定参数、签名、返回、方法体与重载合同
  - id: jls8-scope
    title: JLS 8 - 6.3 Scope of a Declaration
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.3
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的参数与局部变量作用域合同
  - id: jls8-shadowing
    title: JLS 8 - 6.4 Shadowing
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.4
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的参数与局部变量同名边界
  - id: jls8-return-statement
    title: JLS 8 - 14.17 The return Statement
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.17
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的 return 语句合同
  - id: jls8-evaluate-arguments
    title: JLS 8 - 15.12.4.2 Evaluate Arguments
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.12.4.2
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的实参求值与参数值传递合同
projectEvidence: []
```

`projectEvidence` 固定为空数组。正文可直接复用上述 14 张来源卡；若删除某结论，必须同步删除不再支持实际正文的来源卡。

## 官方直接 URL 清单

以下按完整 URL（含章节 fragment）去重，共 21 个；全部是实际支持本研究结论的官方原始页或精确章节：

- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)
- [JLS 25 8.4 Method Declarations](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4)
- [JLS 25 8.4.1 Formal Parameters](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)
- [JLS 25 8.4.2 Method Signature](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.2)
- [JLS 25 8.4.5 Method Result](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.5)
- [JLS 25 8.4.7 Method Body](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.7)
- [JLS 25 6.3 Scope of a Declaration](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.3)
- [JLS 25 6.4 Shadowing and Obscuring](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.4)
- [JLS 25 14.17 The return Statement](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.17)
- [JLS 25 15.12.4.2 Evaluate Arguments](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.2)
- [Dev.java Defining Methods](https://dev.java/learn/classes-objects/defining-methods/)
- [Dev.java Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors/)
- [JLS 8 8.4 Method Declarations](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4)
- [JLS 8 8.4.2 Method Signature](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.2)
- [JLS 8 8.4.7 Method Body](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.7)
- [JLS 8 Chapter 6 Names](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html)
- [JLS 8 6.3 Scope of a Declaration](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.3)
- [JLS 8 6.4 Shadowing](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.4)
- [JLS 8 14.17 The return Statement](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.17)
- [JLS 8 15.12.4.2 Evaluate Arguments](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.12.4.2)

## 发布自检

- [x] 冻结 B-05 必修身份、`75` 分钟、唯一前置 B-04、稳定 ID 复用、snapshot 和 analysis。
- [x] `sourceCapabilityIds` 与 `projectEvidence` 均保持为空，必要前置准确记录为 `JAVA-PREREQ-004`。
- [x] Java 25 现代主线在前；Java 8 / Spring Boot 2.3.12.RELEASE 仅作 legacy 补充。
- [x] 关键结论绑定已逐页核对的 JLS 25、JLS 8、Dev.java、OpenJDK 或 Oracle 直接页面。
- [x] 正文七个知识点均包含“是什么/作用/场景/用法/最小示例/运行结果/常见误区”合同，从零步骤为七个独立有序项。
- [x] 每个易错点包含触发条件、原因、后果、修正、影响版本、验证方式和来源。
- [x] 正文 frontmatter 可复用 14 张来源卡，官方直接 URL 清单按完整 URL 去重。
- [x] 共享正向反馈环与负向编译设计均使用固定 JDK 身份，方法定义上方都有规范中文注释，且本轮反馈环已实际通过。
- [x] 本轮实际输出为 `methods|5|number:3|text:ok|1|3|number:3|text:before|builder:before-changed`，Java 25/8 均通过；四个负向编译类别均命中。
- [x] 不提前讲数组/varargs、类设计、泛型、异常、lambda 或框架能力。
- [x] 不运行或修改 `dzzz-app`，不修改 Phase 2 冻结状态。
