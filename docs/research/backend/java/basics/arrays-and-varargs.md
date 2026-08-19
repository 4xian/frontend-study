# 数组、可变参数与索引边界研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.arrays-and-varargs`
- `title`：数组、可变参数与索引边界
- `required`：必修
- `estimatedMinutes`：`60`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`150`
- `prerequisites`：`[backend.java.learn.basics.methods-parameters-and-scope]`
- `唯一前置`：B-05；不得增加 B-04、B-07 或其他隐含前置
- `related`：`[]`
- `sourceCapabilityIds`：`[]`
- `necessaryPrerequisiteId`：`JAVA-PREREQ-005`
- `origin`：`[necessary-prerequisite]`
- `selectionReason`：字符串、I/O、校验器和二进制处理课程实际依赖数组与索引边界。
- `projectEvidence`：`[]`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8、Spring Boot 2.3.12.RELEASE legacy supplement only`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只建立零基础后续课程立即需要的数组与可变参数心智模型：数组类型、创建、初始化、
`length`、合法索引、默认初始化、元素读写、引用与别名、一维数组、最小二维/不规则数组，以及固定
参数之后的 varargs 声明和调用。索引越界异常属于本课边界；其他异常体系、数组协变和
`ArrayStoreException` 不进入正文。

当前课程正文的稳定 ID、标题和唯一前置与冻结合同一致，但 frontmatter 的
`estimatedMinutes: 50` 与本轮 Phase B 冻结的 60 分钟不一致；后续正文实施必须改为 60。本研究批次
只记录差异，不修改课程正文。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-14 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 已于 2025-09-16 GA |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE 只提供项目版本背景 |
| 项目证据 | 冻结矩阵中 `sourceCapabilityIds: []`、`projectEvidence: []` |
| 验证设计 | Eclipse Temurin 25.0.3+9 与 8u492-b09 固定 Docker 镜像 |

Oracle 支持路线图把 Java 25 列为 LTS；OpenJDK JDK 25 页面确认它是 Java SE 25 的参考实现并已
GA。本课选择 Java 25 作为当前受支持稳定 LTS 主线，并逐项回查 Java 8 对应规范；本课选定的数组与
varargs 合同在两个版本中一致。

## 结论与直接证据

| 结论 | 直接来源 | 页内范围 | 适用版本 | 验证设计 |
| --- | --- | --- | --- | --- |
| Java 25 是已 GA 的 Java SE 25 参考实现版本，也是 Oracle 支持路线中的 LTS | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)；[Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | Reference Implementation、General Availability；Java SE Product Releases | 2026-08-14 页面状态 | 与固定 JDK 25 镜像身份交叉核对 |
| 数组类型写作元素类型加 `[]`；数组变量保存数组对象的引用，单独声明变量不会创建数组对象 | [JLS 25 10.1、10.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.1)；[Dev.java Creating Arrays](https://dev.java/learn/language-basics/arrays) | Array Types；Array Variables；Declaring a Variable to Refer to an Array | Java 25 | 声明、创建并通过别名观察同一数组元素 |
| 数组由创建表达式或初始化器创建；新建数组组件先取得类型默认值，`length` 是保存组件数量的 `public final` 字段且可以为零 | [JLS 25 4.12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5)；[JLS 25 10.3、10.6、10.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.3)；[JLS 25 15.10.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.10.2) | Initial Values of Variables；Array Creation；Array Initializers；Array Members；Run-Time Evaluation | Java 25 | 读取 `new int[3]` 的默认零值并检查 `length` |
| 数组组件可读写；长度为 n 的数组合法索引是 `0` 到 `n-1`，负索引或大于等于 `length` 的索引在运行时抛出 `ArrayIndexOutOfBoundsException` | [JLS 25 10.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.4)；[JLS 25 15.10.3、15.10.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.10.3) | Array Access；Array Access Expressions；Run-Time Evaluation of Array Access | Java 25 | 写入首尾元素；以 `values[values.length]` 触发异常 |
| 数组可用索引循环或增强 `for` 逐项遍历；索引循环的继续条件必须保持小于 `length` | [JLS 25 10.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.4)；[JLS 25 14.14.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2)；[Dev.java Creating Arrays](https://dev.java/learn/language-basics/arrays) | Array Access；The enhanced `for` Statement；Looping Over Arrays and Different Types | Java 25 | 正向源码分别执行索引循环和增强 `for` |
| Java 的多维数组是数组的数组，各层数组长度不必相同 | [JLS 25 10.1、10.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.1)；[JLS 25 15.10.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.10.2)；[Dev.java Creating Arrays](https://dev.java/learn/language-basics/arrays) | 嵌套数组类型与初始化器；multidimensional array；Creating Multidimensional Arrays | Java 25 | 创建行长分别为 1 和 2 的 `int[][]` |
| varargs 用类型后的 `...` 声明；每个方法最多一个且只能位于参数列表末尾，前面的固定参数仍按声明顺序传入 | [JLS 25 8.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[Dev.java Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors) | Formal Parameters；Arbitrary Number of Arguments | Java 25 | 编译正确的“固定参数 + varargs”方法；错误位置和两个 varargs 均要求编译失败 |
| varargs 在方法体内具有数组类型；调用可以提供现成数组、若干独立实参或零个实参，`int...` 与 `int[]` 不能构成同名重载 | [JLS 25 8.4.1、8.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[JLS 25 15.12.2.4、15.12.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.4)；[Dev.java Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors) | Formal Parameters；Method Signature；Variable Arity Invocation；Arbitrary Number of Arguments | Java 25 | 正向调用多个值、零个值和现成数组；负向编译同名 `int...` / `int[]` 声明 |
| 上述数组、遍历与 varargs 子集在 Java 8 中合同一致；Java 8 的 varargs 语法产生式只允许末尾出现一个可变参数，调用时同样把额外实参结果放入数组 | [JLS 8 4.12.5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.12.5)；[JLS 8 Chapter 10](https://docs.oracle.com/javase/specs/jls/se8/html/jls-10.html)；[JLS 8 14.14.2](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.14.2)；[JLS 8 8.4.1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1)；[JLS 8 15.10、15.12](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.10) | 对应章节；The enhanced `for` Statement；FormalParameterList / LastFormalParameter / VariableArityParameter | Java 8 | 同一源码、同一正向输出和同类负向结果在 JDK 8 重跑 |

外部资料发现优先使用 Tavily，随后通过 Tavily Extract 打开并核对 Oracle JLS 25、JLS 8、
Dev.java、OpenJDK 和 Oracle 支持路线的直接正文。搜索摘要、社区文章和 AI 输出
均未作为最终结论证据。

## 逐知识点七段教学合同

以下 7 个知识点是后续课程正文的完整教学范围。每点都按模板固定为七段；示例外层类只用于让
`javac` 和 `java` 获得可执行入口，不在本课讲解类设计。

### 知识点 1：数组类型与变量声明

**它是什么：** `int[]` 是“组件类型为 `int` 的数组类型”，`int[] values` 声明一个能保存这种数组
引用的变量。空括号属于类型的一部分，数组长度不属于数组类型；单独声明变量不会创建数组。

**有什么作用：** 声明先约束变量以后可以引用哪种组件类型的数组，使编译器能够检查元素读写的
类型；创建数组对象则是下一知识点的独立动作。

**什么时候使用：** 需要为一组同类型值预留数组变量，或方法参数、局部变量需要表达“接收一个数组”
时使用。本课统一采用 `int[] values`，不扩展数组声明风格讨论。

**怎么使用：**

1. 先确定单个组件的类型，例如 `int`。
2. 在组件类型后写 `[]` 得到 `int[]`。
3. 写变量名完成声明；在读取变量前，再赋入一个实际数组引用。

**最小示例：**

```java
public final class ArrayDeclarationExample {
    /**
     * 展示数组变量声明与后续赋值。
     */
    public static void main(String[] args) {
        int[] values;
        values = new int[2];
        System.out.println(values.length);
    }
}
```

**运行结果：** 输出 `2`。声明只确定变量类型，后续的 `new int[2]` 才提供实际数组对象。

**常见误区：** 把 `int[] values;` 当成已经创建数组并可立即读取元素。局部变量必须先获得数组引用
才能使用；声明动作本身既不分配数组组件，也不产生长度。

### 知识点 2：数组创建、初始化与默认值

**它是什么：** `new int[3]` 创建长度为 3 的数组对象；`int[] initialized = {2, 3, 5}` 在声明处用
数组初始化器创建对象并提供初始值。所有新数组组件会先取得组件类型的默认值。

**有什么作用：** 数组把固定数量、同一组件类型的值放在一个对象中。默认初始化保证每个组件一开始
有确定值：整数为 `0`，浮点数为正零，`char` 为 `\u0000`，`boolean` 为 `false`，引用为 `null`。

**什么时候使用：** 已知需要固定长度且元素类型相同的数据时创建数组；已经知道全部初始值时可使用
初始化器。本课不把数组当成可增长容器，动态增删属于后续集合课程。

**怎么使用：**

1. 用 `new 元素类型[长度]` 创建数组并赋给已声明变量。
2. 需要立即提供全部值时，在变量声明处写 `{值1, 值2, ...}`。
3. 读取尚未显式写入的组件，确认它是该组件类型的默认值。

**最小示例：**

```java
public final class ArrayCreationExample {
    /**
     * 展示数组创建、默认值与初始化器。
     */
    public static void main(String[] args) {
        int[] created = new int[3];
        int[] initialized = {2, 3, 5};
        System.out.println(created[1] + ":" + initialized[1]);
    }
}
```

**运行结果：** 输出 `0:3`。`0` 来自 `int` 数组组件的默认值，`3` 来自初始化器的第二个值。

**常见误区：** 误以为数组创建后还能改变同一对象的长度。长度在创建时确定；变量以后可以改为
引用另一个数组，但原数组对象不会因此改变长度。

### 知识点 3：`length`、元素读写与索引边界

**它是什么：** `values[index]` 选择一个数组组件，`values.length` 给出组件数量。数组从 `0` 起算，
长度为 n 时合法索引只有 `0` 到 `n - 1`；`length` 是字段，不是方法。

**有什么作用：** 边界规则让程序能够定位首项和末项。运行时会检查每次数组访问；负索引
或大于等于 `length` 的索引会抛出 `ArrayIndexOutOfBoundsException`。

**什么时候使用：** 需要按位置读写元素、取得首项或末项时使用索引。空数组没有任何合法索引，因此
读取首末项前必须先判断长度。

**怎么使用：**

1. 用 `values[0]` 读写首项。
2. 先确认 `values.length > 0`，再用 `values[values.length - 1]` 读写末项。
3. 把任何待访问索引限制在 `0 <= index && index < values.length`。

**最小示例：**

```java
public final class ArrayBoundaryExample {
    /**
     * 展示数组首尾元素的合法读写。
     */
    public static void main(String[] args) {
        int[] values = {4, 6, 8};
        values[0] = 5;
        values[values.length - 1] = 9;
        System.out.println(values.length + ":" + values[0] + ":" + values[2]);
    }
}
```

**运行结果：** 输出 `3:5:9`，说明数组长度为 3，索引 `0` 与 `2` 是合法首尾位置。

**常见误区：** 把 `length` 当作最后一个合法索引。访问 `values[values.length]` 会在运行时失败，
而不是在编译时失败；负索引同样越界。

### 知识点 4：使用索引循环与增强 `for` 遍历

**它是什么：** 遍历是按顺序访问数组中的每个组件。索引 `for` 同时提供位置和值，增强 `for` 直接
提供当前组件的值。

**有什么作用：** 遍历避免为每个索引重复写访问语句，并把边界条件集中在循环结构中。

**什么时候使用：** 需要索引、修改指定组件或比较相邻位置时使用索引循环；只读处理每个值且不关心
位置时使用增强 `for`。

**怎么使用：**

1. 索引循环从 `0` 开始，并把继续条件写成 `index < values.length`。
2. 在循环体中使用 `values[index]` 读取当前组件。
3. 不需要索引时写 `for (int value : values)`，直接处理当前值。

**最小示例：**

```java
public final class ArrayTraversalExample {
    /**
     * 分别使用索引循环和增强 for 遍历数组。
     */
    public static void main(String[] args) {
        int[] values = {4, 6, 8};
        for (int index = 0; index < values.length; index++) {
            System.out.println(index + "=" + values[index]);
        }

        int total = 0;
        for (int value : values) {
            total += value;
        }
        System.out.println("total=" + total);
    }
}
```

**运行结果：** 依次输出 `0=4`、`1=6`、`2=8` 和 `total=18`；两个循环都只访问三个合法组件。

**常见误区：** 把索引循环条件写成 `index <= values.length`，导致最后一次迭代越界；或者在增强
`for` 中把局部变量 `value` 当成数组索引。

### 知识点 5：数组引用与别名

**它是什么：** 数组变量保存数组对象的引用。`int[] alias = values` 复制的是引用值，因此两个变量
可以指向同一个数组对象，而不是自动复制全部组件。

**有什么作用：** 这个模型解释了为什么方法参数或另一个变量通过某个引用修改组件后，原变量读取
时也能看到修改。

**什么时候使用：** 阅读数组赋值、把数组传给方法或排查“另一个变量为什么也变了”时使用这个最小
心智模型。本课不进入深浅复制、对象生命周期或并发共享。

**怎么使用：**

1. 创建一个数组并把它的引用赋给第二个数组变量。
2. 通过第二个变量修改某个合法索引。
3. 通过第一个变量读取同一索引，观察两个变量引用同一对象的结果。

**最小示例：**

```java
public final class ArrayAliasExample {
    /**
     * 展示两个变量引用同一个数组对象。
     */
    public static void main(String[] args) {
        int[] values = {1, 2};
        int[] alias = values;
        alias[1] = 9;
        System.out.println(values[1]);
    }
}
```

**运行结果：** 输出 `9`，因为 `alias[1]` 与 `values[1]` 选择的是同一个数组组件。

**常见误区：** 认为数组变量赋值会复制数组内容。本课只证明引用别名；需要独立副本时必须显式执行
复制，但具体复制 API 不在本课展开。

### 知识点 6：二维数组是数组的数组

**它是什么：** `int[][]` 表示外层组件类型为 `int[]` 的数组。所谓二维数组在 Java 中是“数组的
数组”，每个内层数组都拥有自己的 `length`，行长不必相同。

**有什么作用：** 这个心智模型能解释为什么既要检查外层索引，也要检查当前内层数组的索引，并能
正确读取不规则数组。

**什么时候使用：** 需要按“行 -> 行内元素”组织固定数组时使用。本课只建立两层结构，不讲矩阵
算法、更高维结构或内存布局。

**怎么使用：**

1. 用两对 `[]` 声明外层数组的组件仍是数组。
2. 先用 `rows.length` 判断外层合法索引。
3. 选中某行后，再用 `rows[row].length` 判断该行的合法索引。

**最小示例：**

```java
public final class NestedArrayExample {
    /**
     * 展示不规则二维数组的逐层长度。
     */
    public static void main(String[] args) {
        int[][] rows = {{1}, {2, 3}};
        System.out.println(rows.length + ":" + rows[0].length + ":" + rows[1].length);
    }
}
```

**运行结果：** 输出 `2:1:2`，表示外层有两行，第一行长度为 1，第二行长度为 2。

**常见误区：** 只检查 `rows.length` 就认为每一行都有相同长度。访问 `rows[row][column]` 前，列
边界必须依据当前 `rows[row].length`，不能借用其他行的长度。

### 知识点 7：varargs 与数组参数的关系

**它是什么：** `int... values` 是可变元数参数声明；它的声明类型是 `int[]`，方法体内按数组使用。
调用方既可传零个或多个独立 `int` 实参，也可传一个现成 `int[]`。

**有什么作用：** varargs 为“调用时数量不固定、类型相同的末尾实参”提供语法便利，省去调用方
手工创建数组的代码；它不是一种新的容器类型。

**什么时候使用：** 只有末尾同类型实参数量自然可变时使用。参数数量固定时继续使用固定参数；已经
持有数组时可以直接传数组，不需要拆成多个实参。

**怎么使用：**

1. 在固定参数之后声明至多一个 varargs，并保证它位于参数列表最后。
2. 在方法体内使用 `values.length`、索引或增强 `for` 读取它。
3. 分别用多个值、零个值和现成数组调用，确认三种调用都进入同一个方法。

**最小示例：**

```java
public final class VarargsArrayExample {
    /**
     * 返回可变参数的数量。
     */
    static int count(int... values) {
        return values.length;
    }

    /**
     * 使用独立实参与现成数组调用同一个方法。
     */
    public static void main(String[] args) {
        int[] ready = {7, 8};
        System.out.println(count(1, 2, 3) + ":" + count() + ":" + count(ready));
    }
}
```

**运行结果：** 输出 `3:0:2`。三个独立实参形成长度 3 的数组，零个 varargs 实参形成长度 0 的
数组，现成数组保持长度 2。

**常见误区：** 把 `int...` 与 `int[]` 当成可并存的同名重载。两者形成相同参数类型，声明
`receive(int...)` 后再声明 `receive(int[])` 会编译失败；此外，一个方法最多有一个 varargs，且它
必须最后出现。

## 从零跟着做冻结合同

后续正文必须使用下面 7 个真实 Markdown 有序列表项，每步承接上一步，并在最后恢复到可编译、可运行
的正确基线：

1. 在 `/tmp` 的 `mktemp` 目录创建 `ArraysVarargsFeedback.java`，写入带传统
   `main(String[] args)` 的最小外层类；外层类只承担运行入口，不讲类设计。
2. 在 `main` 中先声明 `int[] values`，再用 `new int[3]` 创建数组，读取一个尚未显式赋值的组件并
   打印 `length` 与默认值。
3. 用 `values[0]` 和 `values[values.length - 1]` 写入首尾组件，再用严格小于 `length` 的索引循环
   逐项读取。
4. 对同一数组增加增强 `for` 遍历并汇总元素；对照两种遍历，说明需要位置时用索引循环，只读每项时
   可用增强 `for`。
5. 把 `values` 赋给 `alias`，通过 `alias` 修改中间组件，再从 `values` 读取同一位置，观察引用别名。
6. 创建 `int[][] irregular = {{1}, {2, 3}}`，分别读取外层长度和两行长度，建立逐层检查边界的
   心智模型。
7. 新增一个末尾 `int...` 方法，依次用多个值、零个值和现成 `int[]` 调用；运行正确基线后，再分别
   触发索引越界、varargs 非末位、两个 varargs 和 `int...` / `int[]` 同签名负向案例，最后回到正确
   源码并重跑正向输出。

## Java 25 与 Java 8 边界

| 对比项 | Java 25 现代线 | Java 8 legacy 线 | 课程处理 |
| --- | --- | --- | --- |
| 数组类型、创建、初始化与默认值 | 本课合同适用 | 合同一致 | 同一 Java 8 兼容源码双版本编译运行 |
| `length`、零起点和越界异常 | `0..length-1`；越界抛出 `ArrayIndexOutOfBoundsException` | 合同一致 | 同一首尾写入和同一越界表达式验证 |
| 索引循环与增强 `for` 遍历 | 本课两种遍历方式适用 | 合同一致 | 同一正向源码同时执行两种遍历 |
| 数组引用、别名和数组的数组 | 本课最小模型适用 | 合同一致 | 只观察共享组件与不规则行长 |
| varargs 位置与数量 | JLS 25 明文规定最多一个且只能最后 | JLS 8 的语法产生式与正文限定最后一个可变参数 | 两个错误声明在两版均要求编译失败 |
| varargs 调用和方法体数组 | 可传现成数组、零个或多个末尾实参；方法体按数组使用 | 合同一致 | 精确输出覆盖现成数组、三个值与零个值 |
| `int...` / `int[]` 方法签名 | 参数调整后是同一数组类型，不能作为同名重载并存 | 合同一致 | 同一重复签名源码在两版均要求编译失败 |
| Spring Boot | 不参与语言合同 | 2.3.12.RELEASE 仅是冻结项目背景 | 不引入框架 API |

Java 25 在本课范围之外还有 Java 8 之后新增的语言能力，但它们不改变这里选定的稳定子集。本课不为
制造版本差异而引入后续主题。

## 易错点取证

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 使用 `length` 本身或负数作为索引 | 对长度为 n 的数组访问 `values[n]` 或负索引 | 合法索引只到 `n-1`，所有数组访问都会在运行时检查边界 | 抛出 `ArrayIndexOutOfBoundsException`，当前执行路径异常结束 | `values[values.length]` | 访问末项时使用 `values[values.length - 1]`，并先保证数组非空 | Java 8、Java 25 | 两个固定 JDK 运行同一越界分支，均要求非零且 stderr 含异常类名 | [JLS 25 10.4、15.10.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.4)；[JLS 8 10.4、15.10.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-10.html#jls-10.4) |
| varargs 后继续声明固定参数 | 可变参数没有位于参数列表末尾 | 可变参数负责接收前置固定参数之后的剩余实参，规范要求它只能最后出现 | 编译失败 | `notLast(int... values, String label)` | `notLast(String label, int... values)` | Java 8、Java 25 | 两个固定 JDK 均要求 `javac` 非零 | [JLS 25 8.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[JLS 8 8.4.1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1) |
| 一个方法声明两个 varargs 参数 | 参数列表中出现两个 `...` 参数 | 每个方法最多只能有一个可变参数，且该参数占据最后位置 | 编译失败 | `moreThanOne(int... left, int... right)` | 保留一个末尾 varargs；其他输入改为固定参数或显式数组 | Java 8、Java 25 | 两个固定 JDK 均要求 `javac` 非零 | [JLS 25 8.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[JLS 8 8.4.1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1) |
| 把 `int...` 与 `int[]` 当成可并存的同名重载 | 同一个类为同名方法分别声明 `int...` 与 `int[]` | varargs 参数的声明类型是数组类型，方法签名使用调整后的形式参数类型 | 编译失败，两个声明具有相同签名 | `receive(int...)` 与 `receive(int[])` 同时存在 | 二选一；调用方仍可向 varargs 方法传现成数组 | Java 8、Java 25 | 两个固定 JDK 编译 `DuplicateVarargsArray.java` 均要求非零 | [JLS 25 8.4.1、8.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1)；[JLS 8 8.4.1、8.4.2](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1) |

## 项目证据边界

冻结矩阵明确记录 `sourceCapabilityIds: []`、`necessaryPrerequisiteId: JAVA-PREREQ-005` 和
`projectEvidence: []`。本课由字符串、I/O、校验器和二进制处理课程的共同前置需要产生，不对应已
冻结的项目语言能力条目，也不登记 `dzzz-app` 文件、符号、命中数或推测场景。`dzzz-app` 只保留
Java 8 / Spring Boot 2.3.12.RELEASE 的版本背景；本研究不读取、运行或修改其源码，不补造项目
evidence。

## 可重复验证设计

验证设计固定以下镜像，不使用浮动 tag 作为最终复跑身份：

| 角色 | 固定镜像 | 预期工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

### 最终课程 Markdown 的唯一提取合同

最终课程正文的“如何验证”只能包含一个 `lang: bash` 且 `meta: b06-feedback-loop` 的 fenced code
节点，即下方带 `b06-feedback-loop` 元数据的 Bash 节点。验证器必须使用
`unified().use(remarkParse).parse()`
构建 Markdown AST，递归选择 `node.type === 'code' && node.lang === 'bash' &&
node.meta === 'b06-feedback-loop'` 的节点，断言数量严格等于 1，再把该节点的 `value` 交给 Bash。
禁止用正则、行号、首个 bash fence 或字符串切片提取，以免正文增加其他代码块后误执行。

AST 提取器的最小逻辑如下；实际验证时把 `documentPath` 指向最终课程 Markdown：

```js
import { readFileSync } from 'node:fs'
import { unified } from 'unified'
import remarkParse from 'remark-parse'

const documentPath = process.argv[2]
const tree = unified().use(remarkParse).parse(readFileSync(documentPath, 'utf8'))
const matches = []

/**
 * 递归收集唯一标记的 Bash 代码节点。
 */
function collect(node) {
  if (node.type === 'code' && node.lang === 'bash' && node.meta === 'b06-feedback-loop') {
    matches.push(node.value)
  }
  for (const child of node.children ?? []) {
    collect(child)
  }
}

collect(tree)
if (matches.length !== 1) {
  throw new Error(`expected exactly one b06-feedback-loop node, received ${matches.length}`)
}
process.stdout.write(matches[0])
```

### 从零跟着做：唯一反馈环节点

该节点是后续课程“如何验证”的唯一可执行来源。它在宿主 `/tmp` 创建四份 Java 源码，并在每个固定
镜像自己的 `/tmp` 中编译运行；退出时只用 `find -depth -delete` 清理，不在仓库留下源码、class、
fixture 或测试文件。

```bash b06-feedback-loop
#!/usr/bin/env bash
set -euo pipefail

verify_dir="$(mktemp -d /tmp/b06-arrays-varargs.XXXXXX)"
modern_image='eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0'
legacy_image='eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b'

cleanup() {
  find "$verify_dir" -depth -delete
}
trap cleanup EXIT HUP INT TERM

cat > "$verify_dir/ArraysVarargsFeedback.java" <<'JAVA'
public final class ArraysVarargsFeedback {
    /**
     * 汇总可变参数的数量与整数总和。
     */
    static String summarize(String label, int... values) {
        int total = 0;
        for (int index = 0; index < values.length; index++) {
            total += values[index];
        }
        return label + "=" + values.length + "/" + total;
    }

    /**
     * 使用增强 for 汇总数组元素。
     */
    static int sumValues(int[] values) {
        int total = 0;
        for (int value : values) {
            total += value;
        }
        return total;
    }

    /**
     * 触发一次越界访问，验证合法索引的上界。
     */
    static void triggerIndexFailure() {
        int[] values = {1};
        System.out.println(values[values.length]);
    }

    /**
     * 运行数组、遍历、别名、不规则数组与可变参数反馈环。
     */
    public static void main(String[] args) {
        if (args.length > 0) {
            triggerIndexFailure();
            return;
        }

        int[] values = new int[3];
        int defaultValue = values[1];
        values[0] = 4;
        values[values.length - 1] = 8;

        int[] alias = values;
        alias[1] = 6;

        int[] initialized = {2, 3, 5};
        int[][] irregular = {{1}, {2, 3}};

        System.out.println(
                "arrays|length="
                        + values.length
                        + "|default="
                        + defaultValue
                        + "|alias="
                        + values[1]
                        + "|ends="
                        + values[0]
                        + ","
                        + values[values.length - 1]
                        + "|literal="
                        + initialized[1]
                        + "|traversal="
                        + sumValues(values)
                        + "|rows="
                        + irregular.length
                        + ":"
                        + irregular[0].length
                        + ":"
                        + irregular[1].length
                        + "|"
                        + summarize("many", 2, 3, 5)
                        + "|"
                        + summarize("none")
                        + "|"
                        + summarize("array", initialized));
    }
}
JAVA

cat > "$verify_dir/InvalidVarargsPosition.java" <<'JAVA'
public final class InvalidVarargsPosition {
    /**
     * 错误示例：把可变参数放在固定参数之前。
     */
    static void notLast(int... values, String label) {}
}
JAVA

cat > "$verify_dir/InvalidVarargsCount.java" <<'JAVA'
public final class InvalidVarargsCount {
    /**
     * 错误示例：在同一个方法中声明两个可变参数。
     */
    static void moreThanOne(int... left, int... right) {}
}
JAVA

cat > "$verify_dir/DuplicateVarargsArray.java" <<'JAVA'
public final class DuplicateVarargsArray {
    /**
     * 接收可变参数。
     */
    static void receive(int... values) {}

    /**
     * 错误示例：显式数组参数与可变参数形成相同签名。
     */
    static void receive(int[] values) {}
}
JAVA

run_jdk() {
  local role="$1"
  local image="$2"
  local expected_compiler="$3"

  docker run --rm --interactive \
    --env B06_ROLE="$role" \
    --env B06_EXPECTED_COMPILER="$expected_compiler" \
    --volume "$verify_dir:/sources:ro" \
    "$image" sh -s <<'INNER'
set -eu

jdk_dir="$(mktemp -d /tmp/b06-jdk.XXXXXX)"
cleanup_jdk() {
  find "$jdk_dir" -depth -delete
}
trap cleanup_jdk EXIT HUP INT TERM

cp /sources/*.java "$jdk_dir"/
cd "$jdk_dir"

compiler_version="$(javac -version 2>&1)"
test "$compiler_version" = "$B06_EXPECTED_COMPILER"
javac ArraysVarargsFeedback.java
positive_stdout="$(java ArraysVarargsFeedback)"
expected_stdout='arrays|length=3|default=0|alias=6|ends=4,8|literal=3|traversal=18|rows=2:1:2|many=3/10|none=0/0|array=3/10'
test "$positive_stdout" = "$expected_stdout"

set +e
java ArraysVarargsFeedback fail > index.stdout 2> index.stderr
index_exit="$?"
javac InvalidVarargsPosition.java > position.stdout 2> position.stderr
position_exit="$?"
javac InvalidVarargsCount.java > count.stdout 2> count.stderr
count_exit="$?"
javac DuplicateVarargsArray.java > signature.stdout 2> signature.stderr
signature_exit="$?"
set -e

test "$index_exit" -ne 0
test ! -s index.stdout
grep -q 'java.lang.ArrayIndexOutOfBoundsException' index.stderr
test "$position_exit" -ne 0
test "$count_exit" -ne 0
test "$signature_exit" -ne 0
if test "$B06_ROLE" = 'modern'; then
  grep -q 'varargs parameter must be the last parameter' position.stderr
  grep -q 'varargs parameter must be the last parameter' count.stderr
else
  grep -q "')' expected" position.stderr
  grep -q "')' expected" count.stderr
fi
grep -q 'cannot declare both receive(int\[\]) and receive(int\.\.\.)' signature.stderr

if test "$B06_ROLE" = 'modern'; then
  printf '%s\n' 'JAVA25_ARRAYS_VARARGS_PASS'
else
  printf '%s\n' 'JAVA8_ARRAYS_VARARGS_PASS'
fi
INNER
}

run_jdk modern "$modern_image" 'javac 25.0.3'
run_jdk legacy "$legacy_image" 'javac 1.8.0_492'
printf '%s\n' \
  'NEGATIVE_INDEX_BOUNDARY_PASS' \
  'NEGATIVE_VARARGS_POSITION_PASS' \
  'NEGATIVE_VARARGS_COUNT_PASS' \
  'NEGATIVE_VARARGS_ARRAY_SIGNATURE_PASS' \
  'ARRAYS_VARARGS_FEEDBACK_PASS'
```

### 预期结果与证据映射

Java 25 与 Java 8 的正向运行都必须退出 0，并逐字得到：

```text
arrays|length=3|default=0|alias=6|ends=4,8|literal=3|traversal=18|rows=2:1:2|many=3/10|none=0/0|array=3/10
```

| 研究结论 | 正向或负向观察 | signoff 证据 |
| --- | --- | --- |
| 声明、创建、默认值、`length`、首尾读写和初始化器 | `length`、`default`、`ends`、`literal` 字段 | 两个 JDK 的整行精确 stdout |
| 索引循环与增强 `for` 均遍历合法组件 | `summarize` 使用索引循环，`sumValues` 使用增强 `for` | `traversal=18`、`many=3/10` |
| 数组引用可形成别名 | 通过 `alias` 写入并从 `values` 读取 | `alias=6` |
| 二维数组是可不规则的数组的数组 | 两行长度分别为 1 和 2 | `rows=2:1:2` |
| varargs 在方法体内按数组使用，可接收多个、零个实参或现成数组 | `summarize` 读取 `values.length` | `many=3/10`、`none=0/0` 与 `array=3/10` |
| 合法索引只到 `length-1` | 读取 `values[values.length]` | 两个 JDK 均非零、stdout 为空且 stderr 含异常类名 |
| varargs 必须最后且每个方法最多一个 | 两个独立错误声明 | 两个 JDK 共四次对应 `javac` 均非零 |
| `int...` 与 `int[]` 不能作为同名重载并存 | `DuplicateVarargsArray` 声明两种参数形式 | 两个 JDK 的 `signature` 编译均非零 |

成功时必须依次输出 `JAVA25_ARRAYS_VARARGS_PASS`、`JAVA8_ARRAYS_VARARGS_PASS`、
`NEGATIVE_INDEX_BOUNDARY_PASS`、`NEGATIVE_VARARGS_POSITION_PASS`、
`NEGATIVE_VARARGS_COUNT_PASS`、`NEGATIVE_VARARGS_ARRAY_SIGNATURE_PASS` 和
`ARRAYS_VARARGS_FEEDBACK_PASS`。索引异常消息和编译器完整诊断会随 JDK 版本变化，因此 signoff
只绑定固定版本下的异常类型、stdout 为空、非零退出和上表指定错误类别，不伪造跨版本完全相同的
全文。反馈环共定义 8 个 Java 方法，8 个方法定义上方均有规范中文注释，包括 `main`。

### 本轮研究反馈环结果

2026-08-14 从本研究稿 Markdown AST 中按 `lang: bash` 与 `meta: b06-feedback-loop` 提取，唯一命中
数为 1；提取内容直接交给 Bash 后实际通过：

1. modern 镜像精确核对 `javac 25.0.3`，正向输出逐字匹配，索引越界与三类负向编译均命中预期。
2. legacy 镜像精确核对 `javac 1.8.0_492`，同一正向输出逐字匹配，索引越界与三类负向编译均命中
   该版本的预期错误类别。
3. 实际输出完整包含上述 7 个成功标记，宿主 `/tmp` 中没有遗留 `b06-*` 临时目录。

这份结果证明研究稿中的反馈环可执行；后续正文完成后仍必须从最终课程 Markdown 的 AST 重新提取并
复跑，不能用本次研究结果代替正文 signoff。

## 被排除或尚未证实的说法

- 不讲泛型数组、类型擦除、heap pollution、`@SafeVarargs` 或其他注解。
- 不讲 `java.lang.reflect.Array`、反射式数组创建或访问。
- 不讲 Streams、Collections，也不深挖 `java.util.Arrays` 的排序、搜索、复制或比较 API。
- 不讲数组协变和 `ArrayStoreException`；它们不是本课后续前置所必需，加入会要求提前解释子类型与
  运行时存储检查。
- 不讲深浅复制、对象生命周期、并发共享、内存布局或性能结论。
- 不讲安全、框架 API、类设计、矩阵算法或第七课内容。
- 不把 Java 数组称为可变长度容器，不把 `length` 写成方法，也不把索引越界写成编译期错误。
- 不从 `dzzz-app` 抽取项目证据，不补造文件路径、符号、调用关系或能力 ID。

## 来源卡候选

下列 YAML 可作为后续课程 frontmatter 的候选；实施时只保留正文实际引用的卡片，并维持
`verifiedAt: 2026-08-14`。

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
    appliesTo: JDK 25 GA
    claims:
      - JDK 25 是 Java SE 25 的参考实现并已于 2025-09-16 GA
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: 2026-08-14 页面状态
    claims:
      - Java 25 是 LTS 发布
  - id: jls-25-types
    title: Java Language Specification 25 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 新数组组件的类型默认值
  - id: jls-25-arrays
    title: Java Language Specification 25 - Arrays
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 数组类型、创建、初始化、length、索引与数组的数组
  - id: jls-25-classes
    title: Java Language Specification 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - varargs 的末位、唯一性、数组声明类型与方法签名合同
  - id: jls-25-expressions
    title: Java Language Specification 25 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.10
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 数组创建与访问的运行时行为以及 varargs 调用合同
  - id: jls-25-statements
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 增强 for 对数组组件的逐项遍历合同
  - id: dev-java-arrays
    title: Creating Arrays in Your Programs
    url: https://dev.java/learn/language-basics/arrays
    sourceType: official-reference
    appliesTo: 2026-08-14 Dev.java 页面状态
    claims:
      - 数组声明、创建、初始化、遍历和二维数组的入门解释
  - id: dev-java-calling-methods
    title: Calling Methods and Constructors
    url: https://dev.java/learn/classes-objects/calling-methods-constructors
    sourceType: official-reference
    appliesTo: 2026-08-14 Dev.java 页面状态
    claims:
      - varargs 可接收零个或多个独立实参或现成数组
  - id: jls-8-types
    title: Java Language Specification 8 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.12.5
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 数组组件默认值合同
  - id: jls-8-arrays
    title: Java Language Specification 8 - Arrays
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-10.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 数组类型、length、索引与数组的数组合同
  - id: jls-8-classes
    title: Java Language Specification 8 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 varargs 声明、数组类型与方法签名合同
  - id: jls-8-expressions
    title: Java Language Specification 8 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.10
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 数组访问异常与 varargs 调用合同
  - id: jls-8-statements
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.14.2
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 增强 for 对数组组件的逐项遍历合同
projectEvidence: []
```

## 发布自检

- [x] 冻结课程身份、依赖、状态、snapshot 和 analysis 逐项保留。
- [x] `sourceCapabilityIds` 与 `projectEvidence` 均保持为空，必要前置准确记录为
  `JAVA-PREREQ-005`。
- [x] Java 25 当前受支持稳定 LTS 主线在前；Java 8 / Spring Boot 2.3.12.RELEASE 仅作 legacy
  补充。
- [x] 关键结论绑定已逐页核对的 JLS 25、JLS 8、Dev.java、Oracle、OpenJDK 直接页面。
- [x] 7 个独立知识点均具备七段教学合同，覆盖声明、创建与默认值、索引、遍历、别名、二维数组和
  varargs / 数组参数关系。
- [x] 易错点只保留索引边界和三条 varargs / 数组编译硬规则，并包含触发条件、原因、后果、修正、版本、
  验证方式和来源。
- [x] 唯一带 `b06-feedback-loop` 标记的 Bash 节点须经 unified / remark-parse AST 提取；双版本反馈环
  覆盖正向、索引异常和三类负向编译边界，8 个 Java 方法均有规范中文注释。
- [x] 数组协变、`ArrayStoreException`、泛型数组、反射 Array、Streams/Collections、Arrays API
  深挖、heap pollution、注解、安全、性能、框架、类设计和第七课内容均已排除。
- [x] 不读取、运行或修改 `dzzz-app`，不修改 Phase 2 冻结状态；本轮研究反馈环已实际通过，后续正文
  仍须从最终 Markdown AST 重新提取复跑。
