# 条件、switch 与循环控制研究记录

## 冻结课程合同

- Phase / batch：`Phase B / B-04`
- `courseId`：`backend.java.learn.basics.control-flow`
- `title`：条件、switch 与循环控制
- 课程属性：必修
- `estimatedMinutes`：`60`
- `sequence`：`130`
- 唯一前置：B-03，即 `backend.java.learn.basics.variables-types-and-operators`
- `related`：为空
- `sourceCapabilityIds`：`JAVA-LANG-010`、`JAVA-LANG-011`（冻结矩阵候选；本课只实际冻结
  `switch`，增强 `for` 延后，不在本课示例或验证中展开）
- `necessaryPrerequisiteId`：`JAVA-PREREQ-003`
- `projectEvidence`：空数组；冻结矩阵观察计数只作选题背景，不在本课登记
- `modernBaseline`：Java 25 LTS
- `legacyBaseline`：Java 8；Spring Boot 2.3.12.RELEASE 仅作 legacy 背景
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`

本课只建立顺序、分支、重复和跳转四类控制流心智模型。覆盖 `if/else`、`else if` 条件链、传统
`switch`、Java 25 的 `switch` expression/arrow/`yield`、`while`、`do-while`、传统计数
`for`、`break`、`continue` 和必要的标签边界。增强 `for`、数组与 `Iterable` 消费方式不在本课
正文或验证中，避免提前引入后续数据结构；方法设计、对象、Spring API 和其他课程能力同样不进入本批。
验证入口只复用已经具备的 `main` 编译运行方式，不讲方法设计。

## 调研方法与证据边界

1. 使用 Tavily 发现候选入口、章节名称和版本资料。
2. 搜索结果只作为线索；最终逐页核对 Oracle JLS、Oracle Java SE Support Roadmap、Dev.java
   和 OpenJDK JEP 正文。
3. JEP 只证明能力的交付版本与设计范围；最终语言语义以对应 JLS 为准。
4. 搜索摘要、社区文章和 AI 输出均不作为课程结论。
5. `dzzz-app` 只决定选题优先级；本课冻结 `projectEvidence: []`，不抽取业务代码或把旧写法
   推导为公共规则。

## 核验基线与直接证据

| 项目 | 核验结果 |
| --- | --- |
| 实际核验日期 | 2026-08-14 |
| 现代主线 | Oracle 支持路线确认 Java 25 为 LTS；课程按冻结合同使用 Java 25 |
| legacy 补充 | Java 8；只说明本课共有规则和必要差异 |
| 规范正文 | JLS 25/8 的 Chapter 14、Chapter 15 §15.28、Chapter 16 直接页面均可访问 |
| 教学参考 | Dev.java 控制流、传统 switch、switch expression 直接页面均可访问 |
| 演进证据 | JEP 361 标记 `Closed / Delivered`、`Release 14` |
| 可执行环境 | 固定 Eclipse Temurin 25.0.3+9 与 8u492-b09 Docker 镜像 |
| 官方直接 URL | 10 个唯一官方直接页面；OpenJDK JEP 361 命令行返回 403，但 Tavily 已抽取其官方正文 |

| 结论 | 官方直接来源与页内范围 | 适用版本 | 反馈环落点 |
| --- | --- | --- | --- |
| `if`、`else if`、`else` 是条件语句；条件表达式必须是 `boolean` 或 `Boolean`，一次判断只执行一条可达分支 | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §14.9；[JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) §14.9；[Dev.java Control Flow Statements](https://dev.java/learn/language-basics/controlling-flow) | Java 25 / Java 8 | `ControlFlowShared` 的条件链输出 `B`；非布尔条件双版本编译非零 |
| 分支外读取局部变量前，赋值必须覆盖每条可达路径；否则是 compile-time error | [JLS 25 Chapter 16](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) 开篇；[JLS 8 Chapter 16](https://docs.oracle.com/javase/specs/jls/se8/html/jls-16.html) 开篇 | Java 25 / Java 8 | `UninitializedBranch` 双版本编译非零 |
| 传统 `switch` 通过 selector 匹配 `case`/`default`；冒号 case 的语句组可以正常完成并贯穿，`break` 退出当前 switch | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §14.11；[JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) §14.11；[Dev.java Branching with Switch Statements](https://dev.java/learn/branching-with-switch-statements) | Java 25 / Java 8 | `FallThrough` 双版本输出 `one|two`；共享示例显式 `break` 输出 `weekday` |
| `switch` expression 是产生一个值的表达式，必须穷尽所有可能结果；`case L ->` 规则不隐式贯穿 | [JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28) §15.28；[JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §14.11；[JEP 361](https://openjdk.org/jeps/361)；[Dev.java Branching with Switch Expressions](https://dev.java/learn/branching-with-switch-expressions) | Java 25（Java 14 交付后稳定） | `SwitchExpressionModern` Java 25 输出 `weekday|weekend`，Java 8 编译非零 |
| `yield` 从当前 `switch` expression 产生值；块形式每条可达规则必须能 `yield` 或 abrupt complete | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §14.21；[JLS 25 Chapter 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28) §15.28；[JEP 361](https://openjdk.org/jeps/361) | Java 25（Java 14 交付后稳定） | `SwitchExpressionModern` 的 `default -> { yield ...; }` 正常运行 |
| `while` 先判断，`do-while` 先执行后判断，传统 `for` 依次处理初始化、条件和更新；循环需要可观察的退出进展 | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §§14.12–14.14；[JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) §§14.12–14.14；[Dev.java Control Flow Statements](https://dev.java/learn/language-basics/controlling-flow) | Java 25 / Java 8 | 共享示例输出 `while=2`、`do=1`、`for` 累加 `4` |
| 无标签 `break` 作用于最近的传统 switch statement 或 while/do/for；无标签 `continue` 进入当前循环下一次迭代 | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §§14.15–14.16；[JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) §§14.15–14.16；[Dev.java Control Flow Statements](https://dev.java/learn/language-basics/controlling-flow) | Java 25 / Java 8 | 共享示例 `breakAt=3`、`for` 中 `continue` 后总和为 `4` |
| 标签只改变跳转目标：labeled `break` 指向同名的包围语句，labeled `continue` 的目标必须是包围它的 while/do/for | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) §§14.7、14.15–14.16；[JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) §§14.7、14.15–14.16 | Java 25 / Java 8 | 共享示例用 `continue outer` 与 `break outer`，标签计数为 `2`；不运行无界或非法跳转 |

## 现代主线结论

1. `if` 的条件使用 `boolean`/`Boolean` 表达式；按业务顺序组织 `if/else if/else`，一旦某个条件
   成立，后续条件不会继续求值。课程 house style 始终使用大括号，代价是少量额外行数，换取分支
   边界不依赖缩进。
2. `if/else` 适合范围、顺序或复合条件；有限常量选择可用传统 `switch`。冒号 case 的贯穿是语言
   合同，不应称为语法错误；推荐示例显式写 `break` 或改用 arrow rule。
3. Java 25 的 `switch` expression 选择一个值，必须 exhaustive；`case L ->` 右侧可为表达式、块
   或 `throw`，块用 `yield` 返回值。JEP 361 记录该能力在 Java 14 成为标准，Java 8 不支持。
4. `while`、`do-while` 和传统计数 `for` 的差异在于条件检查和更新位置；每个循环都要能指出初始
   状态、继续条件以及让条件最终变假的进展。
5. `break` 表示离开当前目标，`continue` 表示结束当前迭代；标签只在确实需要从嵌套循环跳到外层
   时使用，并且目标必须是包围跳转语句的合法语句。
6. 本课不引入 pattern matching for `switch`、`null`/pattern label、preview 语法、增强 `for`、
   数组、`Iterable`、方法设计或 Spring API。

## 逐小点冻结（供正文逐项展开）

每个小点必须按“是什么、作用、场景、怎么用、最小示例、运行结果、常见误区”展开；下面的示例和
结果是正文的最小合同，不是可省略的提示。

### `if/else` 与条件链

- **是什么：** `if` 先求值一个 `boolean`/`Boolean` 条件；`else` 是条件为假时的替代块；
  `else if` 是按顺序嵌套的下一条件。
- **作用：** 根据范围或复合条件选择一条执行路径，并把分支后的状态保持为可证明的值。
- **场景：** 分数分级、输入状态门槛和有优先级的互斥判断；有限常量选择交给 `switch`。
- **怎么用：** 先写最具体或优先级最高的条件；每个分支使用大括号；分支外要读取的局部变量在
  每条可达路径赋值。
- **最小示例：**

  ```java
  int score = 85;
  String grade;
  if (score >= 90) {
      grade = "A";
  } else if (score >= 80) {
      grade = "B";
  } else {
      grade = "C";
  }
  System.out.println(grade);
  ```

- **运行结果：** `B`；第一个条件为假，第二个条件为真，后面的 `else` 不执行。
- **常见误区：** 把 `1` 当作真值、遗漏大括号，或只在一个分支给变量赋值后立即读取；前者编译
  失败，后两者会造成错误路径或 definite assignment 编译失败。

### 传统 `switch` 语句

- **是什么：** 对 selector 与 `case`/`default` 标签进行有限选择的语句；本课只用 `int` selector。
- **作用：** 让多个常量分支集中表达，避免重复的相等判断。
- **场景：** 有限整数代码或状态编号；范围判断仍使用 `if/else`。
- **怎么用：** 写出每个 case 的动作；冒号 case 在不 `break` 时会贯穿；用 `default` 处理剩余值。
- **最小示例：**

  ```java
  int day = 2;
  String type;
  switch (day) {
      case 1:
      case 2:
          type = "weekday";
          break;
      default:
          type = "other";
  }
  System.out.println(type);
  ```

- **运行结果：** `weekday`；`day=2` 命中第二个标签，共享语句组执行后由 `break` 离开 switch。
- **常见误区：** 把忘写 `break` 当成编译器会自动修复，或把合法贯穿说成错误；贯穿是合同，只有
  意外贯穿才是缺陷风险。

### Java 25 `switch` expression、arrow 与 `yield`

- **是什么：** `switch` expression 是产生值的表达式；arrow rule 用 `case L ->`，代码块需要
  `yield` 给当前表达式一个值。
- **作用：** 把有限选择直接绑定到一个值，避免传统语句先声明变量再赋值。
- **场景：** 分支只计算一个分类、标签或结果值；复杂业务动作不在本课展开。
- **怎么用：** 覆盖所有可能结果；简单分支用箭头表达式，多语句分支用箭头块和 `yield`；目标为
  Java 8 的共享源码必须改回传统 `switch`。
- **最小示例：**

  ```java
  String weekday = switch (2) {
      case 1, 2, 3, 4, 5 -> "weekday";
      default -> "weekend";
  };
  String weekend = switch (7) {
      case 1, 2, 3, 4, 5 -> "weekday";
      default -> {
          String result = "weekend";
          yield result;
      }
  };
  System.out.println(weekday + "|" + weekend);
  ```

- **运行结果：** `weekday|weekend`；两个 expression 都产生一个 String，第二个通过块中的 `yield`
  返回值。
- **常见误区：** 把 expression 当作 Java 8 语法、漏掉 exhaustive 分支，或在 arrow rule 期待传统
  贯穿；Java 8 编译非零，非穷尽 expression 也会被编译器拒绝。

### `while`

- **是什么：** 先求值条件，条件为真才执行循环体。
- **作用：** 在不知道固定次数、但有明确继续条件的情况下重复执行。
- **场景：** 尝试次数、状态轮询或输入尚未满足条件的受控重复；本课不接入 I/O。
- **怎么用：** 初始化控制变量；在头部写继续条件；在循环体中推进变量或受控 `break`。
- **最小示例：**

  ```java
  int count = 0;
  while (count < 2) {
      count++;
  }
  System.out.println(count);
  ```

- **运行结果：** `2`；条件先后为真、真、假，循环体执行两次。
- **常见误区：** 忘记更新控制变量导致无界循环；本课只人工审查错误版本，不运行无界程序。

### `do-while`

- **是什么：** 先执行循环体，再求值条件；因此至少执行一次。
- **作用：** 首次动作无论条件如何都必须发生的受控重复。
- **场景：** 首次建立状态后再决定是否继续；条件从未执行前无法计算时使用。
- **怎么用：** 用 `do { ... } while (condition);`，注意末尾分号并保证后续迭代有退出进展。
- **最小示例：**

  ```java
  int count = 0;
  do {
      count++;
  } while (count < 1);
  System.out.println(count);
  ```

- **运行结果：** `1`；第一次执行后条件变假，循环不会再次执行。
- **常见误区：** 把 `do-while` 当成先判断的 `while`，或漏写尾部 `;`；前者会错误预测零次执行，
  后者编译失败。

### 传统计数 `for`

- **是什么：** 把初始化、继续条件和每轮更新放在一个头部的循环语句。
- **作用：** 当计数起点、上限和更新规则明确时，集中表达迭代合同。
- **场景：** 固定次数或连续整数范围；不在此处讨论数组、`Iterable` 或增强 `for`。
- **怎么用：** 先写初始化，再写仍应执行的条件，最后写一定会发生的更新；循环体内只保留本点所需
  的控制动作。
- **最小示例：**

  ```java
  int total = 0;
  for (int index = 1; index <= 3; index++) {
      if (index == 2) {
          continue;
      }
      total += index;
  }
  System.out.println(total);
  ```

- **运行结果：** `4`；累加 `1` 和 `3`，`continue` 跳过 `2` 的本轮剩余语句，更新仍会发生。
- **常见误区：** 把条件写成永远为真，或用 `continue` 跳过唯一更新动作；前者无界，后者可能让
  循环永远无法结束。

### `break`、`continue` 与必要标签边界

- **是什么：** 无标签 `break` 离开最近的 loop 或传统 switch statement；无标签 `continue` 结束当前迭代；
  标签为跳转指定同名外层语句。
- **作用：** 在找到结果时提前停止，或在当前输入不需要处理时跳过本轮。
- **场景：** 单层循环优先无标签；只有确实需要从嵌套循环跳到外层时才使用标签。
- **怎么用：** 先确认最近的隐式目标；标签 `break outer` 必须指向包围它的带标签语句；标签
  `continue outer` 的目标必须是包围它的 `while`、`do` 或 `for`。
- **最小示例：**

  ```java
  int breakAt = 0;
  for (int index = 0; index < 10; index++) {
      if (index == 3) {
          break;
      }
      breakAt++;
  }

  int visits = 0;
  outer:
  for (int row = 0; row < 3; row++) {
      for (int column = 0; column < 3; column++) {
          if (row == 0 && column == 1) {
              continue outer;
          }
          if (row == 1 && column == 1) {
              break outer;
          }
          visits++;
      }
  }
  System.out.println(breakAt + "|" + visits);
  ```

- **运行结果：** `3|2`；无标签 `break` 在 index 为 `3` 时离开该 for，标签跳转分别进入下一轮和
  离开外层 for。
- **常见误区：** 把 `continue` 当成 `break`、以为无标签跳转会离开所有外层循环，或给 `continue`
  指向非循环标签；前两者会产生错误输出，最后一种是编译错误。

## Java 25 与 Java 8 合同

| 对比项 | Java 25 现代线 | Java 8 legacy 线 | 课程处理 |
| --- | --- | --- | --- |
| `if/else if/else`、`while`、`do-while`、传统计数 `for` | 支持 | 支持 | 同一显式语法双版本反馈环 |
| 传统 `switch` 语句与冒号 case 贯穿 | 支持 | 支持 | 先教共同合同，推荐示例显式 `break` |
| 无标签/标签 `break` 与 `continue` | 支持 | 支持 | 双版本共享输出和标签边界审查 |
| `switch` expression、arrow rule、`yield` | Java 14 交付后稳定，Java 25 支持 | 不支持 | Java 25 正向运行；Java 8 负向编译 |
| pattern matching、`null` label 和 preview 语法 | 现代语言另有课程边界 | 不适用 | 明确排除，不在本课提前教授 |

Spring Boot 2.3.12.RELEASE 不参与 Java 控制流语义，只作为冻结项目版本背景；本课不引入框架 API。

## 项目证据边界

冻结矩阵把本课与 `JAVA-LANG-010`（传统 switch）和 `JAVA-LANG-011`（增强 for）关联，并记录项目
观察计数；本批只冻结 `switch` 和传统计数 `for`，不登记项目证据，不抽取 `dzzz-app` 业务代码。
`JAVA-LANG-011` 的增强 `for` 留作后续数据结构/迭代课程的候选，不在本课正文、示例或验证中兑现。

## `/tmp` 最小双 JDK 反馈环

验证固定使用本机已有的不可变镜像身份，不使用浮动 tag 作为最终证据：

| 角色 | 固定镜像 | 实际工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

所有 `.java`、`.class` 和输出只留在 `mktemp -d /tmp` 目录，完成后使用
`find <temporary-directory> -depth -delete` 清理；仓库没有新增测试或 fixture。

### 实际执行矩阵（2026-08-14）

| 检查 | Java 25 | Java 8 |
| --- | --- | --- |
| 共享 `ControlFlowShared` 编译运行 | PASS；`B|weekday|2|1|4|3|2` | PASS；`B|weekday|2|1|4|3|2` |
| 传统 `FallThrough` 编译运行 | PASS；`one|two` | PASS；`one|two` |
| `SwitchExpressionModern` 箭头与 `yield` | PASS；`weekday|weekend` | 预期非零编译拒绝 |
| `UninitializedBranch` definite assignment | 预期非零编译拒绝 | 预期非零编译拒绝 |
| `NonBooleanCondition` 条件类型 | 预期非零编译拒绝 | 预期非零编译拒绝 |
| 反馈环总退出码 | `0`（`JAVA25_CONTROL_FLOW_PASS`） | `0`（`JAVA8_CONTROL_FLOW_PASS`） |

负向编译非零是成功的版本/规则断言，不应写成反馈环失败；无界循环错误版本只做源码审查，没有运行。

## 正文 frontmatter 候选来源卡

以下 10 张来源卡只包含本研究实际核验并使用的官方直接页面；`claims` 按逐条结论绑定，实施批次可
原样写入课程 frontmatter。正文不得再增加参考资料章节。

~~~yaml
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Oracle Java SE 发布支持状态，核验于 2026-08-14
    claims:
      - Java SE 25 是 LTS 发布。
      - Java SE 8 是本课 legacy 语言基线对应的 LTS 发布。
  - id: jls-25-statements
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html
    sourceType: specification
    appliesTo: Java SE 25，§14.7、§14.9、§14.11～§14.16、§14.21
    claims:
      - if 条件、else-if 条件链和分支块的执行规则。
      - 传统 switch 标签、语句组完成和贯穿规则。
      - while、do-while 和传统 for 的求值顺序。
      - 无标签及带标签 break/continue 的目标规则与 yield 语句边界。
  - id: jls-25-switch-expression
    title: Java Language Specification 25 - switch Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28
    sourceType: specification
    appliesTo: Java SE 25，§15.28
    claims:
      - switch expression 产生一个值，并接受穷尽性与正常完成检查。
      - switch rule 的表达式或块决定箭头分支或 yield 产生的值。
  - id: jls-25-definite-assignment
    title: Java Language Specification 25 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html
    sourceType: specification
    appliesTo: Java SE 25，Chapter 16
    claims:
      - 读取局部变量前必须满足 definite assignment。
      - 分支分析要求到达读取点的每条可能路径都完成赋值。
  - id: jls-8-statements
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html
    sourceType: specification
    appliesTo: Java SE 8，§14.7、§14.9～§14.16
    claims:
      - Java 8 支持本课共享的 if、传统 switch、while、do-while、传统 for、break 和 continue 合同。
      - Java 8 带标签 break/continue 的目标遵守包围语句规则。
  - id: jls-8-definite-assignment
    title: Java Language Specification 8 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-16.html
    sourceType: specification
    appliesTo: Java SE 8，Chapter 16
    claims:
      - Java 8 要求读取局部变量前满足 definite assignment。
  - id: dev-java-control-flow
    title: Control Flow Statements
    url: https://dev.java/learn/language-basics/controlling-flow
    sourceType: official-reference
    appliesTo: Dev.java Java 语言基础，核验于 2026-08-14
    claims:
      - if/else 条件链、while、do-while、for、break、continue 和 yield 的入门解释。
  - id: dev-java-switch-statements
    title: Branching with Switch Statements
    url: https://dev.java/learn/branching-with-switch-statements
    sourceType: official-reference
    appliesTo: Dev.java Java 语言基础，传统 switch
    claims:
      - selector 与 case/default 标签共同选择执行路径。
      - 冒号 case 会贯穿，直到 break 或 switch 正常完成。
  - id: dev-java-switch-expressions
    title: Branching with Switch Expressions
    url: https://dev.java/learn/branching-with-switch-expressions
    sourceType: official-reference
    appliesTo: Dev.java Java 语言基础，switch expression
    claims:
      - arrow rule 不发生隐式贯穿。
      - switch expression 必须穷尽，冒号块使用 yield 产生值。
  - id: jep-361-switch-expressions
    title: JEP 361 - Switch Expressions
    url: https://openjdk.org/jeps/361
    sourceType: release-note
    appliesTo: Java 14 已交付语言特性
    claims:
      - switch expression 与 yield 在 Java 14 成为正式、永久能力。
      - switch expression 必须穷尽，控制转移语句不能穿过它。
~~~

## 发布自检（研究批次）

- [x] B-04 身份、必修属性、60 分钟、唯一前置、Java 25/8 基线和项目证据边界已冻结。
- [x] `if/else`、条件链、传统 switch、现代 switch expression/arrow/`yield`、三种循环、
  `break`/`continue` 和必要标签边界均有逐小点合同。
- [x] Java 25 与 Java 8 的共有规则、版本差异和 Java 14 交付边界已有直接官方证据。
- [x] 10 个唯一官方直接 URL 的来源卡逐项绑定 claims；Tavily 摘要未作为结论。
- [x] 双 JDK 临时反馈环实际通过，负向编译已区分为预期结果，临时资产已清理。
- [x] 未提前教授方法、数组、对象、增强 `for` 或 Spring API；未登记 `projectEvidence`。
- [ ] 正文、loader、track、Catalog、浏览器、独立复审和 signoff 不属于本研究批次，未执行且未授权。
