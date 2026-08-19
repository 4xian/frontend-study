# 变量、类型、赋值与运算符研究记录

## 冻结课程合同

- Phase / batch：`Phase B / B-03`
- `courseId`：`backend.java.learn.basics.variables-types-and-operators`
- `title`：变量、类型、赋值与运算符
- 课程属性：必修
- `estimatedMinutes`：`60`
- 唯一前置：B-02，即
  `backend.java.learn.basics.packages-imports-and-source-structure`
- 现代基线：Java 25 LTS
- legacy 基线：Java 8；Spring Boot 2.3.12.RELEASE 只作为旧项目版本背景
- `verifiedAt`：`2026-08-14`

本批只研究 B-03。目标是让零基础学习者理解值如何放入有类型的变量、表达式如何先转换操作数再
产生结果，以及常用运算符的可观察边界。研究不会进入控制流语句、方法设计、对象与数组、集合、
`BigDecimal` 细节、位运算或性能优化；验证源码中的传统 `main` 只复用已经具备的编译运行入口。

## 调研方法与证据边界

1. 使用 Tavily 发现候选入口和章节名称。
2. 搜索结果曾混入 Java 26、Java 7 和 preview 页面，因此所有结论重新回到 Oracle JLS 25、
   Oracle JLS 8、Dev.java、OpenJDK JEP 286 与 Oracle 支持路线正文核验。
3. JEP 只证明能力的交付版本与设计范围；最终语言语义仍以对应 JLS 为准。
4. 搜索摘要、社区文章和 AI 输出均不作为证据。
5. 冻结合同没有 `projectEvidence`，本研究不从 `dzzz-app` 抽取代码或推导语言规则。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 实际核验日期 | 2026-08-14 |
| 现代主线 | Oracle 支持路线确认 Java 25 为 LTS；课程按冻结合同使用 Java 25 |
| legacy 补充 | Java 8；只说明本课共有规则和必要差异 |
| 规范正文 | JLS 25 与 JLS 8 的 3、4、5、14、15、16 章直接页面均可访问 |
| 教学参考 | Dev.java variables、primitive types、operators、var 直接页面均可访问 |
| 演进证据 | JEP 286 官方正文标记 `Closed / Delivered`、`Release 10` |
| 可执行环境 | 固定 Eclipse Temurin 25.0.3+9 与 8u492-b09 Docker 镜像 |

## 结论与直接证据

| 结论 | 官方直接来源与页内范围 | 适用版本 | 反馈环落点 |
| --- | --- | --- | --- |
| Java 类型分为 primitive type 与 reference type；变量是带编译期类型的存储位置 | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) 4.1、4.2、4.3、4.12 | Java 25 | 同时声明 primitive 变量与 `String` 引用变量 |
| 八种 primitive 是 `byte`、`short`、`int`、`long`、`char`、`float`、`double`、`boolean`；前五种是 integral，接着两种是 floating-point，`boolean` 只有 `true` / `false` | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) 4.2、4.2.1、4.2.3；[Dev.java Primitive Types](https://dev.java/learn/language-basics/primitive-types/) | Java 25；分类在 Java 8 相同 | 正向源码覆盖八种 primitive |
| primitive 变量保存该 primitive 的值；reference 变量保存引用或 `null`，本课只用 `String` 说明类别 | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) 4.12.1、4.12.2 | Java 25 | 输出 primitive 值与字符串，不展开对象行为 |
| 声明给出类型和名字；initializer 在声明执行时求值并赋给变量；后续 `=` 是赋值表达式 | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) 14.4、14.4.2；[JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.26 | Java 25 | `int score; score = 60; score = 80;` |
| 局部变量没有可供读取的自动默认值；每次读取前必须满足 definite assignment，否则编译失败 | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) 4.12.3、4.12.5；[JLS 25 Chapter 16](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) 开篇 | Java 25 | 未初始化读取失败，加入 initializer 后恢复 |
| 整数字面量默认是 `int`，`L` / `l` 后缀得到 `long`；浮点字面量默认是 `double`，`F` / `f` 后缀得到 `float`，`D` / `d` 可显式标记 `double` | [JLS 25 Chapter 3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html) 3.10.1、3.10.2 | Java 25 | 编译 `2_147_483_648L`、`1.5F`、`1.5` |
| `true` / `false`、字符、字符串和 `null` 也是 literal；数值下划线只能位于数字之间，本课只把它用于提高长数字可读性 | [JLS 25 Chapter 3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html) 3.10；[Dev.java Primitive Types](https://dev.java/learn/language-basics/primitive-types/) 的 Literals 与 Numeric Literals | Java 25；数值下划线在 Java 8 也可用 | 正向源码使用布尔、字符、字符串与带下划线整数 |
| assignment conversion 允许相同类型和 widening primitive conversion；可表示的 `int` 常量可直接赋给 `byte` / `short` / `char`，一般 narrowing 不会隐式发生 | [JLS 25 Chapter 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html) 5.1.2、5.2 | Java 25 | `byte small = 10` 成功，`int count = 2.5` 失败 |
| 数值运算先做 numeric promotion：有 `double` 则提升到 `double`，否则依次为 `float`、`long`、`int`；`byte` / `short` / `char` 的普通算术通常得到 `int` | [JLS 25 Chapter 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html) 5.6 | Java 25 | `byte + byte` 赋给 `byte` 失败，改为 `int` 后恢复 |
| cast 可显式请求 narrowing primitive conversion，但可能丢失大小、范围或精度；`(int) 2.9` 得到 `2`，不能把 cast 当成无损修复 | [JLS 25 Chapter 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html) 5.1.3、5.5 | Java 25 | 错误赋值分别用保留小数的 `double` 和明确截断的 cast 恢复 |
| `+ - * / %` 先按 numeric promotion 决定运算类型；整数除法向 0 取整，整数余数满足 `(a / b) * b + a % b == a`，余数符号跟随被除数 | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.17、15.18；[Dev.java Operators](https://dev.java/learn/language-basics/using-operators/) | Java 25 | 输出 `7 / 2 == 3`、`-7 / 3 == -2`、`-7 % 3 == -1` |
| 整数除数为 0 抛 `ArithmeticException`；最小整数除以 `-1` 的特殊溢出返回原被除数且不抛异常 | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.17.2 | Java 25 | 运行除零失败；短路检查后恢复 |
| 整数算术不会自动扩宽或报告一般溢出；要保留超出 `int` 的结果，必须在运算前把操作数扩宽为 `long` | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.17、15.18 | Java 25 | 对照 `Integer.MAX_VALUE + 1` 与 `(long) Integer.MAX_VALUE + 1` |
| `float` / `double` 对应 IEEE 754 binary32 / binary64，并包含 infinities 与 NaN；浮点除零不抛 `ArithmeticException`，非零有限数除以浮点零得到 infinity，零除以零得到 NaN | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) 4.2.3；[JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.17.2 | Java 25 | 输出 `Infinity` 与 `NaN`；不扩展十进制金额方案 |
| 数值 `< <= > >= == !=` 与布尔 `== !=` 的结果是 `boolean`；本课不讨论 reference equality | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.20.1、15.21.1、15.21.2 | Java 25 | 输出数值比较与布尔相等结果 |
| `&&` 仅在左侧为 `true` 时求值右侧，`||` 仅在左侧为 `false` 时求值右侧；`?:` 根据第一个布尔表达式只选择并求值另外两支之一 | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.23、15.24、15.25；[Dev.java Operators](https://dev.java/learn/language-basics/using-operators/) | Java 25 | 用零除数证明右侧被跳过，并输出条件表达式结果 |
| `x++` 与 `++x` 都把变量加 1；后缀表达式产生旧值，前缀表达式产生存回后的新值 | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.14.2、15.15.1；[Dev.java Operators](https://dev.java/learn/language-basics/using-operators/) | Java 25 | 对照 `postValue` / `preValue` 与最终变量值 |
| `E1 op= E2` 包含转换回左侧变量类型的隐式 cast，且左侧只求值一次；因此 `byteValue += 1` 与 `byteValue = byteValue + 1` 的编译合同不同 | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 15.26.2 | Java 25 | 前者成功，后者因 `int` 结果不能隐式赋给 `byte` 而失败 |
| `var` 从 Java 10 起用于带 initializer 的局部变量类型推断；推断后仍是固定静态类型，不能缺 initializer，也不能仅用 `null` 推断 | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) 14.4、14.4.1；[Dev.java Var](https://dev.java/learn/language-basics/using-var/)；[JEP 286](https://openjdk.org/jeps/286) | Java 10+ | Java 25 编译运行 `var count = 3`；Java 8 编译失败 |
| 上述基础类型、literal、赋值/转换、numeric promotion、运算符、整数与本课浮点观察在 Java 8 中均有对应合同；Java 8 不支持 Java 10 才交付的 `var` | [JLS 8 Chapter 3](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html)、[Chapter 4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html)、[Chapter 5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html)、[Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html)、[Chapter 15](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html)、[Chapter 16](https://docs.oracle.com/javase/specs/jls/se8/html/jls-16.html)；[JEP 286](https://openjdk.org/jeps/286) | Java 8 与 Java 25 | 同一显式类型源码双版本执行，`var` 单独走差异路径 |

## 零基础教学拆解

### 变量、值与类型

- **值**是表达式计算出来或变量当前保存的内容，例如整数 `7`、布尔值 `true`。
- **变量**是有名字、有编译期类型的存储位置。变量的值可以改变，但变量声明后不能换成另一种类型。
- **primitive type** 由语言直接定义；其变量保存对应 primitive value。
- **reference type** 的变量保存引用或 `null`。本课只用 `String title = "Java";` 建立类别概念，
  不讲对象创建、引用相等性或数组。

八种 primitive 的最低教学合同如下：

| 类型 | 基础含义 | 本课最小边界 |
| --- | --- | --- |
| `byte` | 8 位有符号整数，-128 到 127 | 普通算术先提升为 `int` |
| `short` | 16 位有符号整数，-32768 到 32767 | 普通算术先提升为 `int` |
| `int` | 32 位有符号整数 | 整数字面量和整数运算的常见类型 |
| `long` | 64 位有符号整数 | 常用整数字面量后缀是 `L` |
| `char` | 16 位无符号 UTF-16 code unit，0 到 65535 | 字符字面量用单引号；不展开编码细节 |
| `float` | IEEE 754 binary32 | 浮点字面量需要常用后缀 `F` |
| `double` | IEEE 754 binary64 | 浮点字面量默认类型 |
| `boolean` | 只有 `true` 与 `false` | 用于比较、短路和条件表达式 |

### 声明、初始化与赋值

1. `int score;` 声明变量，确定名字与编译期类型，但没有提供可读取的局部值。
2. `int score = 60;` 在声明时用 initializer 给出第一个值。
3. `score = 80;` 是后续赋值，变量仍是 `int`，只是保存的值变为 `80`。
4. definite assignment 是编译器的静态证明要求；它不等于“运行时大概会走到某次赋值”。
5. 字段和数组组件有规范定义的默认值，但它们不属于本课示例；不能把那套默认值迁移到普通局部变量。

### Literal 与常用数值后缀

| 写法 | 类型或含义 | 初学者边界 |
| --- | --- | --- |
| `42`、`2_147_483_647` | `int` literal | 下划线只分隔数字，不改变值 |
| `2_147_483_648L` | `long` literal | 大写 `L` 比小写 `l` 更易辨认 |
| `1.5`、`1.5D` | `double` literal | `D` 可省略 |
| `1.5F` | `float` literal | 没有 `F` 时 `1.5` 是 `double` |
| `true`、`false` | `boolean` literal | 不是字符串 |
| `'J'` | `char` literal | 单引号表示单个 `char` |
| `"Java"` | `String` literal | 只用于 reference type 示例 |
| `null` | null literal | 可作为引用的空值；不能单独让 `var` 推断类型 |

本课不展开二进制、八进制、十六进制字面量，也不把 suffix 写成类型转换；suffix 决定 literal 自身
的类型，cast 则显式转换一个已经有类型的表达式。

### 赋值转换、数值提升与 cast

1. assignment conversion 先检查右侧能否转换成左侧变量类型；`int` 可 widening 到 `long`。
2. 可表示的整数常量有窄化特例，因此 `byte small = 10;` 合法；变量表达式不能照搬这个特例。
3. 数值运算先做 numeric promotion。`byte left + byte right` 的结果是 `int`，不是 `byte`。
4. cast 允许显式窄化，例如 `(int) 2.9` 得到 `2`，但这代表主动接受信息丢失。
5. 为保留小数，应选择 `double value = 2.9;`；只有需求明确要截去小数时才使用 `(int) 2.9`。
6. 为避免整数溢出，应在运算前扩宽操作数：`(long) max + 1`；运算后再赋给 `long` 无法恢复高位。

### 常用运算符与基础边界

| 类别 | 运算符 | 本课只要求掌握的规则 |
| --- | --- | --- |
| 简单赋值 | `=` | 求右侧值，按赋值上下文转换后存入左侧变量 |
| 算术 | `+ - * / %` | 先 numeric promotion；整数 `/` 不保留小数，`%` 给出余数 |
| 数值比较 | `< <= > >= == !=` | 结果为 `boolean` |
| 布尔 | `! == != && \|\|` | `!` 取反；`&&` 与 `\|\|` 对右侧短路 |
| 条件 | `condition ? valueA : valueB` | 只求值被选中的一支并产生一个值 |
| 自增/自减 | `++ --` | 改写变量；前缀产生新值，后缀产生旧值 |
| 复合赋值 | `+= -= *= /= %=` | 运算后隐式转换回左侧类型，不能把它当作无风险简写 |

混合表达式可以用括号明确意图，但不要求背诵完整优先级表。位运算和移位即使出现在官方运算符总表
中，也不进入本课正文。

## 必须显式讲清的运行边界

### 整数除法、余数与溢出

- `7 / 2 == 3`，`-7 / 3 == -2`，因为整数除法向 0 取整。
- `-7 % 3 == -1`；余数不是“永远为正”，其符号跟随被除数。
- 整数除数为 0 抛 `ArithmeticException`。
- `Integer.MIN_VALUE / -1` 仍得到 `Integer.MIN_VALUE`，这个特殊溢出不抛异常。
- `Integer.MAX_VALUE + 1` 得到 `Integer.MIN_VALUE`；赋给 `long` 不会让已经发生的 `int` 溢出消失。

### 浮点只保留必要边界

- `float` / `double` 是二进制浮点，不把它们描述成任意精度十进制数。
- `7 / 2` 先得到整数 `3`，再赋给 `double` 只得到 `3.0`；必须在除法前让一个操作数成为
  浮点类型，例如 `(double) 7 / 2 == 3.5`。
- 浮点非零值除以 `0.0` 得到带符号 infinity，`0.0 / 0.0` 得到 NaN，不抛整数除零异常。
- Java 25 规范采用 IEEE 754-2019；Java 8 规范的历史表述与非 strict value set 规则不同。
  本课只承诺上述双版本实测结果，不展开 legacy 扩展指数值集，也不进入 `BigDecimal` 细节。

### 自增与复合赋值

- 独立语句 `count++;` 与 `++count;` 最终都加 1；放入更大表达式时，前者产生旧值、后者产生新值。
- `byte count = 1; count += 1;` 能编译，因为复合赋值隐式转换回 `byte`。
- `count = count + 1;` 不能编译，因为 `count + 1` 经 numeric promotion 得到 `int`。
- 隐式转换也可能溢出，因此复合赋值只讲合同，不包装成普遍推荐风格。

## Java 25 与 Java 8 合同

| 对比项 | Java 25 现代线 | Java 8 legacy 线 | 课程处理 |
| --- | --- | --- | --- |
| 八种 primitive 与 reference 基础 | 本课所列合同 | 本课范围相同 | 同一显式类型示例 |
| literal 与 `L` / `F` 后缀 | 本课所列合同 | 本课范围相同 | 同一源码双版本编译 |
| assignment conversion、numeric promotion、primitive cast | 本课所列合同 | 本课范围相同 | 同一成功/失败路径 |
| 算术、余数、比较、短路、条件、自增、复合赋值 | 本课所列合同 | 本课范围相同 | 同一输出与编译诊断 |
| 浮点规范历史背景 | IEEE 754-2019，始终严格求值 | 旧 IEEE 754 表述，并保留历史 value set 规则 | 只验证共有的 `3.5`、`Infinity`、`NaN` 观察 |
| 局部变量 `var` | 支持；必须能从 initializer 推断固定类型 | 不支持 Java 10 能力 | 现代差异单独验证，兼容恢复写显式类型 |

## `/tmp` 最小反馈环设计

验证固定使用已存在的不可变镜像身份：

| 角色 | 固定镜像 | 工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

所有 `.java`、`.class`、stdout 与 stderr 都放进 `mktemp -d /tmp/java-b03.XXXXXX`，结束时用
`find "$fixture_dir" -depth -delete` 删除，不在仓库保留测试或 fixture。

### 正向共享源码

共享源码必须覆盖八种 primitive、一个 reference、literal 后缀、promotion/cast、余数、比较、短路、
条件、自增、复合赋值、整数溢出和必要浮点边界，并在 Java 25 / 8 精确输出：

```text
types=1|2|7|2147483648|J|1.5|3.5|true|Java
ops=3|-2|-1|2/3|3/3|2|false|blocked|-2147483648|2147483648|Infinity|NaN
```

其中 `2/3` 表示后缀表达式得到旧值 2、变量随后为 3；`3/3` 表示前缀表达式与变量都为 3。

### 关键失败与恢复路径

| 路径 | 失败预期 | 恢复动作 | 恢复预期 |
| --- | --- | --- | --- |
| definite assignment | `int count;` 后读取，两个版本 `javac` 非零且包含“可能尚未初始化”语义 | 改为 `int count = 0;` | 两个版本编译运行，输出 `0` |
| narrowing assignment | `int count = 2.5;`，两个版本 `javac` 非零 | 需要保留小数时改 `double count = 2.5;`；明确截断时写 `(int) 2.5` | 分别输出 `2.5` 与 `2` |
| numeric promotion | 两个 `byte` 相加直接赋回 `byte`，两个版本 `javac` 非零 | 把结果声明为 `int` | 编译运行，输出数学和 |
| integer divide by zero | 运行期整数除零，两个版本运行非零且 stderr 含 `ArithmeticException: / by zero` | 先用 `divisor != 0 && ...` 短路保护 | 编译运行，输出 `false` |
| `var` 版本边界 | `var count = 3;` 在 Java 8 `javac` 非零 | 跨版本源码改为 `int count = 3;` | Java 25 与 8 均输出 `3` |

反馈环必须复制每个命令退出码后再断言，不依赖错误文本的本地化全文；错误文本只匹配稳定关键词。

### 2026-08-14 实际执行结果

| 检查 | Java 25 | Java 8 |
| --- | --- | --- |
| 工具版本 | `javac 25.0.3` | `javac 1.8.0_492` |
| 共享源码 | 两行精确输出匹配，退出 0 | 两行精确输出匹配，退出 0 |
| definite assignment 失败 | `javac` 退出 1 | `javac` 退出 1 |
| narrowing assignment 失败 | `javac` 退出 1 | `javac` 退出 1 |
| numeric promotion 失败 | `javac` 退出 1 | `javac` 退出 1 |
| 三条恢复路径 | `0`、`2.5\|2`、`3`，全部匹配 | `0`、`2.5\|2`、`3`，全部匹配 |
| 整数除零 | 运行退出 1，含 `ArithmeticException: / by zero` | 运行退出 1，含 `ArithmeticException: / by zero` |
| 短路恢复 | 输出 `false`，退出 0 | 输出 `false`，退出 0 |
| `var count = 3` | 编译运行，输出 `3` | `javac` 退出 1 |
| 显式类型恢复 | 输出 `3`，退出 0 | 输出 `3`，退出 0 |

这组结果只证明研究稿列出的最小合同，不替代正文、Catalog、页面或 signoff Gate。

## 正文 frontmatter 候选来源卡

以下来源卡只包含本研究实际核验并使用的直接页面，URL、类型、版本和 claims 可直接进入正文
frontmatter；正文应按篇幅合并重复 claims，但不得新增未经本批核验的链接。

```yaml
verifiedAt: 2026-08-14
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: 2026-08-14 页面状态
    claims:
      - Java 25 是 LTS 发布
  - id: jls-25-lexical-structure
    title: Java Language Specification 25 - Lexical Structure
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - literal 分类、整数字面量与浮点字面量的常用后缀
  - id: jls-25-types-values-variables
    title: Java Language Specification 25 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - primitive/reference 分类、八种 primitive、变量和值的合同
      - 局部变量与浮点值的必要边界
  - id: jls-25-conversions-promotions
    title: Java Language Specification 25 - Conversions and Contexts
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - assignment conversion、numeric promotion 与 primitive cast
  - id: jls-25-local-variable-declarations
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 局部变量声明、initializer 与 var 限制
  - id: jls-25-expressions
    title: Java Language Specification 25 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 算术、余数、比较、短路、条件、自增和复合赋值
      - 整数除法、整数溢出与浮点除零边界
  - id: jls-25-definite-assignment
    title: Java Language Specification 25 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 局部变量读取前必须 definite assignment
  - id: dev-java-variables
    title: Creating Variables and Naming Them
    url: https://dev.java/learn/language-basics/variables/
    sourceType: official-reference
    appliesTo: 当前 Dev.java 入门资料
    claims:
      - 面向初学者的变量与局部变量入口
  - id: dev-java-primitive-types
    title: Creating Primitive Type Variables in Your Programs
    url: https://dev.java/learn/language-basics/primitive-types/
    sourceType: official-reference
    appliesTo: 当前 Dev.java 入门资料
    claims:
      - 八种 primitive、声明初始化、literal 与数值下划线概览
  - id: dev-java-operators
    title: Using Operators in Your Programs
    url: https://dev.java/learn/language-basics/using-operators/
    sourceType: official-reference
    appliesTo: 当前 Dev.java 入门资料
    claims:
      - 常用算术、比较、短路、条件、自增和复合赋值入门语义
  - id: dev-java-var
    title: Using the Var Type Identifier
    url: https://dev.java/learn/language-basics/using-var/
    sourceType: official-reference
    appliesTo: Java 10 及以上
    claims:
      - var 的局部变量、initializer 与固定推断类型边界
  - id: jep-286-local-variable-type-inference
    title: JEP 286 - Local-Variable Type Inference
    url: https://openjdk.org/jeps/286
    sourceType: release-note
    appliesTo: Java 10
    claims:
      - 局部变量类型推断在 Java 10 交付
  - id: jls-8-lexical-structure
    title: Java Language Specification 8 - Lexical Structure
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - literal 与常用数值后缀的 Java 8 合同
  - id: jls-8-types-values-variables
    title: Java Language Specification 8 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - primitive/reference、变量与浮点基础的 Java 8 合同
  - id: jls-8-conversions-promotions
    title: Java Language Specification 8 - Conversions and Contexts
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - assignment conversion、numeric promotion 与 cast 的 Java 8 合同
  - id: jls-8-local-variable-declarations
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 局部变量声明要求显式类型
  - id: jls-8-expressions
    title: Java Language Specification 8 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - 本课常用运算符、整数与共有浮点观察的 Java 8 合同
  - id: jls-8-definite-assignment
    title: Java Language Specification 8 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-16.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - 局部变量读取前 definite assignment 的 Java 8 合同
projectEvidence: []
```

## 被排除或尚未证实的说法

- 不研究条件、分支、`switch` 或循环语句；`&&`、`||` 与 `?:` 只按表达式求值规则讲解。
- 不研究方法声明、参数、作用域设计或重载；验证中的 `main` 只是运行入口。
- 不研究对象创建、reference equality、数组、集合、泛型、装箱或拆箱。
- 不研究 `BigDecimal` 的构造、舍入或金额建模；只明确二进制浮点不是任意精度十进制。
- 不研究位运算、移位、性能优化或“较小 primitive 更快/更省”的泛化结论。
- 不把复合赋值的隐式 cast 描述成无损转换，也不把 `var` 描述成动态类型。
- 不从 `dzzz-app` 补造项目证据、业务常量或稳定符号。

## 发布自检

- [x] 冻结为 B-03、必修、60 分钟、稳定 ID 与唯一 B-02 前置。
- [x] 实际核验日期为 2026-08-14，现代 Java 25 在前，Java 8 隔离补充。
- [x] 值、变量、primitive/reference、八种 primitive、声明/初始化/赋值与 definite assignment 已覆盖。
- [x] literal、常用数值后缀、assignment conversion、numeric promotion 与 cast 已覆盖。
- [x] 算术、余数、比较、短路、条件、自增与复合赋值的基础边界已覆盖。
- [x] 整数除法、整数溢出与必要浮点边界已有规范证据和反馈环落点。
- [x] `var` 的 Java 10+ 语义和 Java 8 恢复路径已明确。
- [x] 18 个来源均为 Oracle、JLS、Dev.java 或 OpenJDK 官方直接页面，claims 可直接用于正文。
- [x] `/tmp` 反馈环包含成功输出、关键失败与恢复路径，不要求仓库持久测试。
- [x] 未进入后续课程、对象/数组/集合、`BigDecimal` 细节、位运算或性能优化。
