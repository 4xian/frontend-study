---
id: backend.java.learn.intermediate.service-design-patterns
type: lesson
title: 策略、模板方法、适配器与回调
summary: 用四种常见协作方式隔离变化、固定流程、转换接口并报告进度，同时避免为了模式而增加无用抽象
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
objectives:
  - 从变化点、固定步骤和外部接口差异判断是否需要设计模式
  - 用策略对象替换散落的业务分支，并把选择逻辑集中在组合边界
  - 用模板方法固定流程顺序，只开放必要且有合同的扩展步骤
  - 用适配器把旧接口或第三方接口转换为应用内部端口
  - 用回调报告进度或结果，并明确调用次数、顺序、线程和异常边界
prerequisites:
  - backend.java.learn.intermediate.lombok-and-generated-contracts
related: []
tags:
  - Java
  - 策略模式
  - 模板方法
  - 适配器
  - 回调
  - 依赖倒置
appliesTo: Java 25、Spring Boot 4.1.0 与 Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE 与 Spring Framework 5.2.15.RELEASE 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-16
sources:
  - id: jls25-interfaces
    title: JLS 25 - Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 接口声明、抽象方法、default 方法和函数式接口的语言合同
  - id: jls25-classes
    title: JLS 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 抽象类、方法覆写与 final 方法的语言规则
  - id: jls25-lambda
    title: JLS 25 - Lambda Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27
    sourceType: specification
    appliesTo: Java 25
    claims:
      - lambda 表达式的目标类型和函数式接口边界
  - id: java25-comparator
    title: Java 25 Comparator API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Comparator 是可替换比较函数的标准库实例
      - thenComparing 支持组合多个比较规则
  - id: java25-abstract-list
    title: Java 25 AbstractList API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/AbstractList.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - AbstractList 提供骨架实现并要求子类实现最小扩展方法
  - id: java25-consumer
    title: Java 25 Consumer API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Consumer.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Consumer 接收一个参数并通过副作用产生结果
      - andThen 的执行顺序与异常短路合同
  - id: java25-function
    title: Java 25 Function API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Function.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Function 表达输入到输出的转换，并支持 compose 与 andThen
  - id: java25-list-copyof
    title: Java 25 List copyOf API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 在流程边界创建不可修改列表快照
  - id: spring-jdbc-template-7
    title: Spring Framework 7.0.8 JdbcTemplate API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 模板负责 JDBC 资源生命周期并把变化操作交给回调
      - callback 可以返回领域对象或集合结果
  - id: jls8-interfaces
    title: JLS 8 - Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 已支持 default 方法和函数式接口
  - id: jls8-lambda
    title: JLS 8 - Lambda Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.27
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 lambda 同样依赖函数式接口目标类型
  - id: spring-jdbc-template-5
    title: Spring Framework 5.2.15.RELEASE JdbcTemplate API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧项目基线中的模板与回调核心合同
  - id: fowler-replace-conditional-polymorphism
    title: Martin Fowler - Replace Conditional with Polymorphism
    url: https://refactoring.com/catalog/replaceConditionalWithPolymorphism.html
    sourceType: engineering-reference
    appliesTo: 按类型形成多种独立行为的条件分支
    claims:
      - 可把按类型变化的分支移动到对应多态实现，但不表示所有条件都应替换
  - id: fowler-replace-subclass-delegate
    title: Martin Fowler - Replace Subclass with Delegate
    url: https://refactoring.com/catalog/replaceSubclassWithDelegate.html
    sourceType: engineering-reference
    appliesTo: 继承服务了错误变化轴或需要多个变化维度的场景
    claims:
      - 委托可替代不合适的继承，但不表示继承本身错误
  - id: fowler-dependency-injection
    title: Martin Fowler - Inversion of Control Containers and the Dependency Injection pattern
    url: https://martinfowler.com/articles/injection.html
    sourceType: engineering-reference
    appliesTo: 必需协作者由外部装配的场景
    claims:
      - 构造器注入让必需依赖在对象创建时显式可见
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java
    symbol: UploadUtil.upload
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/enums/StorageMode.java
    symbol: StorageMode
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/ClearExpiredDataController.java
    symbol: com.tdh.bdzz.timer.controller.ClearExpiredDataController
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/CustomMultipartFile.java
    symbol: com.tdh.bdzz.util.CustomMultipartFile
    usage: adapted
  - file: dzzz-app/src/main/java/com/tdh/bdzz/storage/StorageProcessListener.java
    symbol: com.tdh.bdzz.storage.StorageProcessListener
    usage: adapted
---

# 策略、模板方法、适配器与回调

## 为什么需要学习

后端服务经常遇到四类变化：同一个任务有多种算法、多个任务共享固定流程、外部组件接口与内部接口
不一致、长任务需要把进度告诉调用方。只使用越来越长的 `if/else`、复制粘贴流程、到处拼参数和直接
调用日志，代码很快就会互相牵连。设计模式不是必须背诵的类图，而是给这些协作关系起名字，并让变化
停留在明确边界。本课从一个可运行的配送与导入示例开始，逐步学习什么时候使用、怎么验证，以及什么
时候一个普通方法反而更简单。

## 学习目标

- 能指出一段服务代码中不变的职责和真正变化的部分。
- 能实现并选择两个策略，同时处理未知策略。
- 能固定模板方法的步骤顺序，并把变化限制在一个抽象步骤。
- 能用适配器完成参数、返回值和异常语义转换。
- 能定义可验证的回调次数、顺序和失败行为。
- 能判断何时不应引入模式，避免无意义的接口和继承层次。

## 前置术语

- **协作者**：一个对象完成任务时需要调用的另一个对象。
- **变化轴**：在同一业务目标下会独立变化的规则，例如配送渠道或文件存储供应商。
- **端口**：应用内部希望依赖的稳定接口，描述“需要什么”，不暴露外部实现细节。
- **组合边界**：创建对象并选择具体实现的位置，例如 Spring 配置类或应用启动代码。
- **骨架流程**：执行顺序固定、部分步骤允许替换的一组操作。
- **回调**：调用方先交给服务的函数或对象，服务在特定事件发生时反向调用它。
- **可观察合同**：调用方可以验证的输出、调用顺序、次数、异常或状态变化。

## 零基础知识点详解

下面的“什么时候使用”和“怎么使用”都有明确适用条件，它们是本课结合工程来源采用的教学取舍，
不是 Java 语法规定，也不表示任何项目看到同名结构都必须套用对应模式。

### 1. 设计模式是协作词汇，不是现成代码

1. **它是什么**：设计模式是对反复出现的对象协作问题及其常见解法的命名。
2. **有什么作用**：团队可以用“策略”或“适配器”快速描述变化位置，不必每次从类图讲起。
3. **什么时候使用**：同一种变化已经出现两次，或外部边界明确要求替换实现时再考虑。
4. **怎么使用**：先写出问题、变化点和验证结果，再选择最小模式；模式名称放在设计之后。
5. **最小示例**：配送渠道会变化，可以定义 `DeliveryStrategy`；只有一种固定配送时普通方法即可。
6. **运行结果**：增加新渠道主要新增实现并登记选择关系，原有渠道行为保持不变。
7. **常见误区**：看到一个 `if` 就创建接口、工厂和抽象类；条件稳定时这只会增加跳转成本。

### 2. 先找不变职责与变化轴

1. **它是什么**：不变职责是所有实现都必须完成的目标；变化轴是可以独立替换的具体规则。
2. **有什么作用**：防止把日志、校验、路由和供应商协议全塞进一个“万能策略”。
3. **什么时候使用**：准备拆分大方法或发现多个分支同时修改相同前后步骤时。
4. **怎么使用**：列出输入、输出、固定前置、变化算法和固定收尾，只有变化算法进入策略接口。
5. **最小示例**：订单 ID 和回执是稳定合同，`LOCAL` 与 `REMOTE` 的配送算法是变化轴。
6. **运行结果**：调用方只接收统一 `Receipt`，不需要理解每个供应商的内部字段。
7. **常见误区**：按现有类名拆分而不按变化原因拆分，最后每个实现仍依赖全部业务状态。

### 3. 用接口表达稳定端口

1. **它是什么**：接口只声明调用方需要的操作，具体类提供实现。
2. **有什么作用**：服务依赖业务语言的端口，而不是某个 SDK、数据库或旧工具类。
3. **什么时候使用**：实现需要替换、需要隔离外部类型，或测试要提供轻量替身时。
4. **怎么使用**：接口参数和返回值使用内部类型；在构造器中接收接口；由组合边界选择实现。
5. **最小示例**：`MessagePort.send(recipient, body)` 不暴露旧组件的单字符串 payload。
6. **运行结果**：业务服务只看见接收方、正文和回执，旧协议变化只修改适配器。
7. **常见误区**：把第三方接口原样复制成内部接口，表面多一层，业务仍被外部模型绑定。

### 4. 策略模式替换一种算法

1. **它是什么**：多个对象实现同一操作，每个对象封装一种可替换算法。
2. **有什么作用**：把散落在服务方法里的渠道分支移动到各自实现，便于独立阅读和验证。
3. **什么时候使用**：算法共享输入输出合同，但规则、依赖或发布节奏不同。
4. **怎么使用**：定义窄接口，实现每种策略，并让上层只调用接口方法。
5. **最小示例**：`DeliveryStrategy.deliver(request)` 可由本地配送和远端配送分别实现。
6. **运行结果**：同一个请求通过不同策略得到统一结构的回执，调用方代码不变。
7. **常见误区**：策略自己再次根据 channel 写完整 `if/else`，把选择和执行混回同一处。

### 5. 把策略选择集中在组合边界

1. **它是什么**：组合边界负责把业务键映射到具体策略对象。
2. **有什么作用**：未知键、重复键和默认策略只在一个位置处理，不在每个 Controller 重复。
3. **什么时候使用**：策略由配置、请求类型或业务状态选择，并且调用点不止一个。
4. **怎么使用**：构建 `Map<String, DeliveryStrategy>`，查找后先处理缺失，再调用策略。
5. **最小示例**：`strategies.get("LOCAL")` 得到本地策略；未知键抛出明确业务错误。
6. **运行结果**：每个请求只选择一次，错误信息包含不支持的业务键，不出现空指针异常。
7. **常见误区**：静默回退到任意默认实现，使配置错误被当成成功业务处理。

### 6. 策略可以是对象、lambda 或方法引用

1. **它是什么**：只有一个抽象方法的接口可以作为 lambda 的目标类型。
2. **有什么作用**：无状态且很短的策略不必创建单独类；复杂策略仍可使用命名对象和构造器依赖。
3. **什么时候使用**：规则只有几行、没有独立生命周期，也不需要多个辅助方法时使用 lambda。
4. **怎么使用**：先定义函数式接口，再把 lambda 放到注册表；复杂后立即提升为命名类。
5. **最小示例**：`request -> new Receipt("local", request.id())` 是一个短策略。
6. **运行结果**：lambda 与普通实现都通过同一接口调用，测试不依赖实现形式。
7. **常见误区**：把数十行业务逻辑塞进 lambda，导致断点、命名和异常处理都难以理解。

### 7. 模板方法固定流程顺序

1. **它是什么**：父类中的最终方法定义固定骨架，并调用一个或多个可覆写步骤。
2. **有什么作用**：所有任务都按校验、转换、保存的顺序运行，同时允许转换规则不同。
3. **什么时候使用**：流程顺序和资源管理必须统一，但少数步骤确实需要子类定制。
4. **怎么使用**：把骨架方法标为 `final`，固定步骤保持 private，只把变化步骤设为 protected abstract。
5. **最小示例**：`execute()` 固定调用 `validate -> transform -> save`，子类只实现 `transform`。
6. **运行结果**：无论哪个子类运行，校验一定在转换前，保存一定在转换后。
7. **常见误区**：让子类覆写整个 `execute()`，结果流程顺序和资源清理再次失去保证。

### 8. 只开放必要的模板扩展点

1. **它是什么**：扩展点是模板允许子类定制的方法，也称 hook；不是所有步骤都应可覆写。
2. **有什么作用**：减少子类能破坏的不变量，让模板合同可以被测试。
3. **什么时候使用**：至少存在两个合法实现，并且步骤输入、输出和失败规则已经明确。
4. **怎么使用**：优先一个抽象步骤；可选 hook 提供安全默认实现；在注释中写清调用次数和时机。
5. **最小示例**：本课只开放 `transform(List<String>)`，校验和保存不开放。
6. **运行结果**：子类可以改变文本转换，但不能绕过空行校验或返回可变保存结果。
7. **常见误区**：为“以后可能需要”把每个 protected 方法都开放，形成脆弱父类。

### 9. 组合式模板与继承式模板如何选择

1. **它是什么**：继承式模板由子类覆写步骤；组合式模板把步骤作为 `Function`、`Consumer` 或端口注入。
2. **有什么作用**：组合式实现可在运行时替换步骤，继承式实现可直观表达稳定骨架。
3. **什么时候使用**：步骤需要独立复用或组合时选组合；类型层次稳定且骨架强约束时可选继承。
4. **怎么使用**：先尝试普通服务方法加注入函数；只有父类不变量清晰时再使用抽象类。
5. **最小示例**：`Function<Input, Output>` 可注入转换步骤，而 `ImportTemplate` 固定完整导入骨架。
6. **运行结果**：两种写法都必须产生相同可观察步骤顺序，选择依据是职责而不是个人偏好。
7. **常见误区**：为了复用两行代码建立深继承树，子类被迫继承无关状态和方法。

### 10. 适配器转换接口与协议

1. **它是什么**：适配器实现内部端口，并把调用转换成旧组件或第三方组件理解的形式。
2. **有什么作用**：把外部参数名、返回类型和调用方式限制在基础设施边界。
3. **什么时候使用**：不能修改旧组件，或外部 SDK 的接口不适合直接进入业务层。
4. **怎么使用**：适配器持有被适配对象，转换输入，调用外部接口，再把结果转换回内部类型。
5. **最小示例**：`LegacySenderAdapter` 把 `recipient` 与 `body` 组合成旧组件的 payload。
6. **运行结果**：业务端口返回统一回执；替换旧组件只需替换适配器实现。
7. **常见误区**：适配器内部加入审批、计费等业务决定，使基础设施层掌握不属于它的规则。

### 11. 适配器必须转换语义，不只是改方法名

1. **它是什么**：语义转换包括单位、空值、错误、超时、编码和资源所有权，而不只是参数排列。
2. **有什么作用**：调用方可以依赖统一合同，不会意外继承外部组件的模糊行为。
3. **什么时候使用**：内外两侧对成功、失败或数据格式的定义不同。
4. **怎么使用**：逐项写出输入映射、输出映射、异常映射和不可恢复错误；不能可靠映射时直接失败。
5. **最小示例**：旧组件返回空字符串代表失败时，适配器应转换为明确异常或失败结果。
6. **运行结果**：调用方只处理内部定义的成功与失败，不再检查供应商特有魔法值。
7. **常见误区**：捕获所有异常后返回 null，既丢失原因，也让上层在更远位置失败。

### 12. 回调把事件交回调用方

1. **它是什么**：调用方提供一个接口实现或 lambda，服务在进度、完成或失败时调用它。
2. **有什么作用**：核心流程不依赖控制台、WebSocket 或 UI，却仍能报告事件。
3. **什么时候使用**：同步长任务需要进度，或基础设施需要在固定时机通知结果。
4. **怎么使用**：定义窄回调接口，传入服务，明确事件数据和调用时机。
5. **最小示例**：`ProgressListener.onProgress("saved")` 通知保存步骤已完成。
6. **运行结果**：测试 listener 收到 `validated`、`transformed`、`saved` 三个独立事件。
7. **常见误区**：把“注册回调”理解为自动异步；普通方法调用仍在当前线程同步执行。

### 13. 回调需要次数、顺序、线程和异常合同

1. **它是什么**：回调合同不仅是方法签名，还包括何时调用、最多几次、在哪个线程以及失败怎么处理。
2. **有什么作用**：防止重复进度、乱序完成和回调异常吞掉主任务结果。
3. **什么时候使用**：调用方会修改状态、发送网络消息或完成异步结果时必须明确。
4. **怎么使用**：把成功路径事件列成有序序列；为失败路径指定最后一个允许事件和异常传播规则。
5. **最小示例**：本课同步回调严格三次；listener 抛异常时 `execute()` 立即失败且不进入下一步。
6. **运行结果**：断言完整事件列表，而不是只断言“至少调用过一次”。
7. **常见误区**：在重试循环内重复发“完成”事件，调用方把一个任务结算多次。

### 14. 用构造器注入模式协作者

1. **它是什么**：服务通过构造器接收策略、端口或回调发布器，而不是在方法内部 `new` 具体实现。
2. **有什么作用**：依赖在对象创建时可见，生产配置和测试都能选择合法实现。
3. **什么时候使用**：协作者是服务完成职责所必需，并且生命周期由外部容器管理。
4. **怎么使用**：构造器参数使用窄接口；在 Spring 配置或普通 main 中创建具体实现并传入。
5. **最小示例**：`new DeliveryService(strategyRegistry)` 比服务内部创建 `S3Uploader` 更清晰。
6. **运行结果**：测试传入内存实现即可观察选择和调用，不需要启动外部系统。
7. **常见误区**：为了可替换把每个纯值对象也变成 Bean，增加容器配置却没有变化收益。

### 15. 模式可以协作，但不要混成一个万能对象

1. **它是什么**：一个用例可以用模板固定流程、用策略执行变化步骤、用适配器访问外部系统、用回调报告事件。
2. **有什么作用**：每种模式只承担一种变化原因，组合后仍能逐层验证。
3. **什么时候使用**：四种独立需求真实存在，并且每一层都能用一句话说明职责。
4. **怎么使用**：按调用方向排列：模板调用策略，策略依赖端口，端口由适配器实现，模板触发回调。
5. **最小示例**：导入模板选择解析策略，通过存储适配器保存，并发送三个进度事件。
6. **运行结果**：替换解析算法不修改存储协议；替换存储供应商不修改流程顺序。
7. **常见误区**：创建 `PatternManager` 同时负责注册、路由、执行、转换、重试和通知。

### 16. 用可观察结果验证模式价值

1. **它是什么**：验证模式不是断言类名存在，而是断言替换实现后合同仍成立。
2. **有什么作用**：避免“结构看起来像模式，但未知键、顺序或错误处理仍然错误”。
3. **什么时候使用**：新增实现、修改注册表、升级外部 SDK 或调整回调时。
4. **怎么使用**：分别验证每种策略、未知键、模板顺序、适配转换、回调序列和异常传播。
5. **最小示例**：反馈环固定输出 `strategy=2 template=1 adapter=1 callback=3`。
6. **运行结果**：Java 25 与 Java 8 都通过同一核心合同，class major 分别为 69 与 52。
7. **常见误区**：只用 mock 验证内部方法名，重构实现后测试失败却没有任何用户行为变化。

## 本课现代主线的建模约定

1. 先用普通方法写出最小正确流程，确认真实变化轴后再抽取接口。
2. Java 25 可用 record 表达策略输入与回执，用 `Map.of` 建立小型不可变注册表。
3. 无状态短策略可以使用 lambda；有依赖、状态或复杂错误处理时使用命名类。
4. 模板骨架只开放必要步骤，并用 `final` 保护不能改变的执行顺序。
5. 适配器在基础设施边界完成参数、结果和异常转换，业务层只依赖内部端口。
6. 回调先定义次数、顺序、线程和异常合同，再选择 `Consumer`、自定义函数式接口或事件机制。
7. Spring 只负责装配这些协作者；`@Component` 本身不会让一个大分支自动变成好策略。

## 基本语法或核心接口

四种模式最小骨架如下。接口名称使用业务动作，不使用模糊的 `Manager` 或 `Processor`。

```java
@FunctionalInterface
interface DeliveryStrategy {
    /**
     * 执行配送算法。
     *
     * @param request 配送请求
     * @return 配送回执
     */
    Receipt deliver(DeliveryRequest request);
}

abstract class ImportTemplate {
    /**
     * 按固定顺序执行导入。
     *
     * @param input 原始输入
     * @return 导入结果
     */
    public final Result execute(Input input) {
        validate(input);
        Result result = transform(input);
        save(result);
        return result;
    }

    /**
     * 实现可变化的转换步骤。
     *
     * @param input 已校验输入
     * @return 转换结果
     */
    protected abstract Result transform(Input input);
}

interface MessagePort {
    /**
     * 发送内部消息。
     *
     * @param recipient 接收方
     * @param body 正文
     * @return 发送回执
     */
    String send(String recipient, String body);
}

interface ProgressListener {
    /**
     * 接收一个已完成步骤。
     *
     * @param step 步骤名称
     */
    void onProgress(String step);
}
```

`Input`、`Result` 和 `Receipt` 是示意类型；“从零跟着做”给出可直接编译的完整文件。

## 从零跟着做

### 第一步：创建临时源码

1. 执行 `fixture_dir=$(mktemp -d /tmp/java-service-patterns.XXXXXX)`。
2. 执行 `cd "$fixture_dir"`。
3. 新建 `ServicePatternsFeedback.java`。
4. 输入下面完整源码，不需要 Maven 或第三方依赖。

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class ServicePatternsFeedback {
    /**
     * 禁止创建反馈环工具对象。
     */
    private ServicePatternsFeedback() {}

    record DeliveryRequest(String id, String channel) {}
    record Receipt(String provider, String reference) {}

    @FunctionalInterface
    interface DeliveryStrategy {
        /**
         * 执行一种配送算法。
         *
         * @param request 配送请求
         * @return 配送回执
         */
        Receipt deliver(DeliveryRequest request);
    }

    interface ProgressListener {
        /**
         * 接收流程进度。
         *
         * @param step 已完成步骤
         */
        void onProgress(String step);
    }

    interface MessagePort {
        /**
         * 使用内部协议发送消息。
         *
         * @param recipient 接收方
         * @param body 正文
         * @return 发送回执
         */
        String send(String recipient, String body);
    }

    static final class LegacySender {
        /**
         * 调用旧组件协议。
         *
         * @param payload 旧协议载荷
         * @return 旧组件回执
         */
        String transmit(String payload) {
            return "legacy:" + payload;
        }
    }

    static final class LegacySenderAdapter implements MessagePort {
        private final LegacySender sender;

        /**
         * 创建适配器。
         *
         * @param sender 被适配组件
         */
        LegacySenderAdapter(LegacySender sender) {
            this.sender = sender;
        }

        /**
         * 转换参数并调用旧组件。
         *
         * @param recipient 接收方
         * @param body 正文
         * @return 旧组件回执
         */
        @Override
        public String send(String recipient, String body) {
            return sender.transmit(recipient + "|" + body);
        }
    }

    abstract static class ImportTemplate {
        /**
         * 按固定顺序执行导入。
         *
         * @param input 原始输入
         * @param listener 进度监听器
         * @return 不可修改结果
         */
        final List<String> execute(List<String> input, ProgressListener listener) {
            List<String> checked = List.copyOf(input);
            listener.onProgress("validated");
            List<String> transformed = transform(checked);
            listener.onProgress("transformed");
            List<String> saved = List.copyOf(transformed);
            listener.onProgress("saved");
            return saved;
        }

        /**
         * 转换已校验输入。
         *
         * @param checked 已校验输入
         * @return 转换结果
         */
        protected abstract List<String> transform(List<String> checked);
    }

    static final class UppercaseImport extends ImportTemplate {
        /**
         * 把文本转换为大写。
         *
         * @param checked 已校验输入
         * @return 大写结果
         */
        @Override
        protected List<String> transform(List<String> checked) {
            return checked.stream().map(String::toUpperCase).toList();
        }
    }

    /**
     * 按业务键选择策略。
     *
     * @param request 配送请求
     * @return 配送回执
     */
    private static Receipt route(DeliveryRequest request) {
        Map<String, DeliveryStrategy> strategies = Map.of(
                "LOCAL", value -> new Receipt("local", value.id()),
                "REMOTE", value -> new Receipt("remote", value.id()));
        DeliveryStrategy strategy = strategies.get(request.channel());
        if (strategy == null) {
            throw new IllegalArgumentException("unsupported channel: " + request.channel());
        }
        return strategy.deliver(request);
    }

    /**
     * 运行四种协作方式的反馈环。
     *
     * @param args 可选的待验证渠道
     */
    public static void main(String[] args) {
        if (args.length == 1) {
            route(new DeliveryRequest("probe", args[0]));
            return;
        }
        Receipt localReceipt = route(new DeliveryRequest("o-1", "LOCAL"));
        Receipt remoteReceipt = route(new DeliveryRequest("o-2", "REMOTE"));
        require("local".equals(localReceipt.provider()), "local strategy failed");
        require("remote".equals(remoteReceipt.provider()), "remote strategy failed");

        List<String> progress = new ArrayList<>();
        List<String> result = new UppercaseImport().execute(List.of("order"), progress::add);
        require(result.equals(List.of("ORDER")), "template failed");
        require(progress.equals(List.of("validated", "transformed", "saved")),
                "callback failed");

        MessagePort port = new LegacySenderAdapter(new LegacySender());
        require("legacy:user-1|done".equals(port.send("user-1", "done")),
                "adapter failed");
        System.out.println(
                "SERVICE_PATTERNS_PASS strategy=2 template=1 adapter=1 callback="
                        + progress.size());
    }

    /**
     * 检查反馈环条件。
     *
     * @param condition 必须成立的条件
     * @param message 失败信息
     */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

### 第二步：编译并运行现代版本

1. 使用 Java 25 执行 `javac -Xlint:all -Werror --release 25 ServicePatternsFeedback.java`。
2. 执行 `java ServicePatternsFeedback`。
3. 预期输出：`SERVICE_PATTERNS_PASS strategy=2 template=1 adapter=1 callback=3`。
4. 执行 `javap -verbose ServicePatternsFeedback.class`，确认 `major version: 69`。

### 第三步：主动验证失败边界

1. 执行 `java ServicePatternsFeedback UNKNOWN`。
2. 确认进程以非零状态结束。
3. 预期得到 `IllegalArgumentException: unsupported channel: UNKNOWN`。
4. 不带参数重新运行，确认固定 PASS 输出仍然成立。

### 第四步：清理临时目录

1. 退出临时目录。
2. 删除 `fixture_dir` 指向的 `/tmp` 目录。
3. 使用 `test ! -e "$fixture_dir"` 确认没有遗留课程 fixture。

## 如何使用

1. 写下一句话业务目标，例如“根据渠道配送订单并返回统一回执”。
2. 列出固定输入输出、变化算法、固定步骤、外部协议和需要通知的事件。
3. 一个变化轴只选择一种主要边界：算法用策略，流程骨架用模板，协议不兼容用适配器，反向通知用回调。
4. 在组合边界创建实现和注册表，通过构造器把窄接口传给服务。
5. 对未知选择、步骤顺序、转换结果、回调次数和异常传播写最小反馈环。
6. 新增实现前检查旧合同是否无需修改；若每次都要改所有层，边界仍然过宽。

## 本课适用与不适用场景

适合使用：

1. 两种以上算法共享稳定输入输出，并且会独立演进。
2. 多个任务必须共享不能打乱的资源或业务步骤。
3. 外部 SDK、旧工具或供应商接口不能直接进入业务层。
4. 核心流程需要报告进度，但不应依赖具体展示或传输技术。

不适合直接使用：

1. 条件只有两行且长期稳定，普通 `if` 更直接。
2. 所谓策略的输入输出完全不同，强行统一只会产生大量 null 和类型判断。
3. 流程没有稳定骨架，模板父类会频繁变化并牵连所有子类。
4. 适配器只是无语义的一行转发，内部端口与外部接口完全相同。
5. 调用方真正需要的是持久事件、重试或跨进程消息，此时普通内存回调不够。

:::tip
先用一条可观察测试证明变化能独立替换，再给结构命名。模式的价值是缩小修改范围，不是增加类的数量。
:::

## 当前项目补充

冻结审计记录了文件上传链中的 `UploadUtil.upload -> StorageMode -> Uploader.upload`，它证明项目存在按
存储方式选择实现的需求；静态证据不证明远端上传成功，也不表示“带行为的枚举”就是现代默认写法。
课程将 `StorageMode` 标为 `corrected`；为控制示例变量，fixture 把选择集中在注册表中，但不据此
断言冻结项目或所有生产服务都应采用同一结构。

`ClearExpiredDataController` 代表共享任务骨架场景，`CustomMultipartFile` 代表接口适配场景，
`StorageProcessListener` 代表进度回调场景。课程只使用这些稳定符号说明能力，不复制业务字段、地址、
凭据或供应商配置，也不从静态源码推断运行时线程、重试或成功结果。

## Java 8 / Spring Boot 2.3 兼容写法

四种模式在 Java 8 已可实现：接口、抽象类、default 方法、函数式接口和 lambda 都已存在。主要差异是
不能使用 record、`Map.of`、`List.of`、`List.copyOf` 和 `Stream.toList()`。

1. record 改为 final 类、final 字段、构造器和 getter。
2. `Map.of` 改为构造 `HashMap` 后登记策略，再通过只读视图暴露。
3. `List.copyOf` 改为 `Collections.unmodifiableList(new ArrayList<>(source))`，先复制再包装。
4. 短策略仍可用 lambda；复杂策略继续使用命名类。
5. Spring Framework 5.2.15.RELEASE 的 `JdbcTemplate` 仍体现模板负责资源、回调负责变化操作的合同。
6. 使用 Java 8 容器编译后，反馈输出为
   `SERVICE_PATTERNS_LEGACY_PASS strategy=2 template=1 adapter=1 callback=3`，class major 为 52。

下面是与现代反馈环保持同一可观察合同的 Java 8 完整文件。它把 `record`、`Map.of`、`List.of`、
`List.copyOf` 和 `Stream.toList()` 改成 Java 8 已有的类、集合和循环写法。

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class ServicePatternsLegacyFeedback {
    /**
     * 禁止创建反馈环工具对象。
     */
    private ServicePatternsLegacyFeedback() {}

    interface DeliveryStrategy {
        /**
         * 执行一种配送算法。
         *
         * @param id 配送标识
         * @return 配送提供方
         */
        String deliver(String id);
    }

    interface ProgressListener {
        /**
         * 接收流程进度。
         *
         * @param step 已完成步骤
         */
        void onProgress(String step);
    }

    interface MessagePort {
        /**
         * 使用内部协议发送消息。
         *
         * @param recipient 接收方
         * @param body 正文
         * @return 发送回执
         */
        String send(String recipient, String body);
    }

    static final class LegacySender {
        /**
         * 调用旧组件协议。
         *
         * @param payload 旧协议载荷
         * @return 旧组件回执
         */
        String transmit(String payload) {
            return "legacy:" + payload;
        }
    }

    static final class LegacySenderAdapter implements MessagePort {
        private final LegacySender sender;

        /**
         * 创建适配器。
         *
         * @param sender 被适配组件
         */
        LegacySenderAdapter(LegacySender sender) {
            this.sender = sender;
        }

        /**
         * 转换参数并调用旧组件。
         *
         * @param recipient 接收方
         * @param body 正文
         * @return 旧组件回执
         */
        @Override
        public String send(String recipient, String body) {
            return sender.transmit(recipient + "|" + body);
        }
    }

    abstract static class ImportTemplate {
        /**
         * 按固定顺序执行导入。
         *
         * @param input 原始输入
         * @param listener 进度监听器
         * @return 不可修改结果
         */
        final List<String> execute(List<String> input, ProgressListener listener) {
            List<String> checked = new ArrayList<String>(input);
            listener.onProgress("validated");
            List<String> transformed = transform(checked);
            listener.onProgress("transformed");
            List<String> saved = Collections.unmodifiableList(
                    new ArrayList<String>(transformed));
            listener.onProgress("saved");
            return saved;
        }

        /**
         * 转换已校验输入。
         *
         * @param checked 已校验输入
         * @return 转换结果
         */
        protected abstract List<String> transform(List<String> checked);
    }

    static final class UppercaseImport extends ImportTemplate {
        /**
         * 把文本转换为大写。
         *
         * @param checked 已校验输入
         * @return 大写结果
         */
        @Override
        protected List<String> transform(List<String> checked) {
            List<String> result = new ArrayList<String>();
            for (String item : checked) {
                result.add(item.toUpperCase());
            }
            return result;
        }
    }

    /**
     * 创建 Java 8 策略注册表。
     *
     * @return 只读策略注册表
     */
    private static Map<String, DeliveryStrategy> strategies() {
        Map<String, DeliveryStrategy> strategies = new HashMap<String, DeliveryStrategy>();
        strategies.put("LOCAL", id -> "local:" + id);
        strategies.put("REMOTE", id -> "remote:" + id);
        return Collections.unmodifiableMap(strategies);
    }

    /**
     * 运行 Java 8 兼容反馈环。
     *
     * @param args 未使用的命令行参数
     */
    public static void main(String[] args) {
        Map<String, DeliveryStrategy> strategies = strategies();
        require("local:o-1".equals(strategies.get("LOCAL").deliver("o-1")),
                "local strategy failed");
        require("remote:o-2".equals(strategies.get("REMOTE").deliver("o-2")),
                "remote strategy failed");

        final List<String> progress = new ArrayList<String>();
        ProgressListener listener = step -> progress.add(step);
        List<String> result = new UppercaseImport().execute(
                Arrays.asList("order"), listener);
        require(result.equals(Arrays.asList("ORDER")), "template failed");
        require(progress.equals(Arrays.asList("validated", "transformed", "saved")),
                "callback failed");

        MessagePort port = new LegacySenderAdapter(new LegacySender());
        require("legacy:user-1|done".equals(port.send("user-1", "done")),
                "adapter failed");
        System.out.println(
                "SERVICE_PATTERNS_LEGACY_PASS strategy=2 template=1 adapter=1 callback="
                        + progress.size());
    }

    /**
     * 检查反馈环条件。
     *
     * @param condition 必须成立的条件
     * @param message 失败信息
     */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

## 新旧版本差异

| 对比项 | Java 25 / Spring Framework 7.0.8 | Java 8 / Spring Framework 5.2.15.RELEASE |
| --- | --- | --- |
| 数据载体 | record 可表达请求与回执 | final 类、构造器和 getter |
| 小型注册表 | `Map.of` | `HashMap` 后只读包装 |
| 列表快照 | `List.copyOf` | `new ArrayList` 后 `unmodifiableList` |
| 函数式接口 | lambda、方法引用、`Consumer`、`Function` | 核心能力已存在，语法合同一致 |
| 模板与回调 | `JdbcTemplate` 7.0.8 作为框架实例 | `JdbcTemplate` 5.2.15.RELEASE 兼容实例 |
| 课程定位 | 现代简洁数据类型与显式边界 | 保持相同设计合同的旧版实现 |

## 易错点

### 易错点 1：策略注册表对未知键返回 null

1. **现象**：业务请求在 `strategy.deliver()` 处抛出没有上下文的空指针异常。
2. **触发条件**：注册表没有请求键，调用方没有先检查查找结果。
3. **原因**：`Map.get` 对缺失键返回 null，策略接口不会自动提供错误处理。
4. **后果**：配置错误被延迟，日志无法说明不支持的是哪个业务键。
5. **错误示例**：`strategies.get(channel).deliver(request)`。
6. **正确写法**：查找后立即抛出包含去敏业务键的明确异常，或返回稳定失败结果。
7. **影响版本**：Java 25 与 Java 8 都适用。
8. **验证方式**：传入 `UNKNOWN`，断言异常类型和消息；恢复合法键后重新 PASS。
9. **来源依据**：`java25-comparator` 证明策略对象合同；缺失键行为由实际反馈环验证。

### 易错点 2：模板开放了整个执行方法

1. **现象**：某个子类跳过校验或保存，另一个子类交换了步骤顺序。
2. **触发条件**：骨架方法可覆写，或所有步骤都暴露为 protected。
3. **原因**：父类没有保护真正的不变量，子类可以替换整个流程。
4. **后果**：不同任务产生不同资源、事务或数据完整性行为。
5. **错误示例**：子类覆写 `execute()` 并只调用 `transform()`。
6. **正确写法**：骨架方法使用 `final`，只开放具有明确输入输出合同的变化步骤。
7. **影响版本**：Java 25 与 Java 8 的 final/override 规则一致。
8. **验证方式**：断言完整事件序列固定为校验、转换、保存；编译期禁止覆写 final 方法。
9. **来源依据**：`jls25-classes`、`java25-abstract-list`。

### 易错点 3：适配器吞掉外部异常并返回 null

1. **现象**：业务层稍后在无关位置空指针失败，原始供应商错误已丢失。
2. **触发条件**：适配器使用 `catch (Exception) { return null; }`。
3. **原因**：适配器没有定义内部失败语义，只追求让方法签名能调用。
4. **后果**：无法区分输入错误、超时、认证失败和远端不可用，也无法制定重试策略。
5. **错误示例**：捕获所有异常并返回空回执。
6. **正确写法**：只捕获需要翻译的已知异常，保留 cause，转换为稳定内部错误。
7. **影响版本**：与 Java 版本无关，所有外部适配器都适用。
8. **验证方式**：让旧组件抛出固定异常，断言内部异常类型、cause 和消息均保留。
9. **来源依据**：本课适配器合同与可重复负向反馈环；不把项目静态写法当通用事实。

### 易错点 4：把同步回调当成异步事件

1. **现象**：慢回调阻塞主流程，或回调异常让主任务提前失败。
2. **触发条件**：服务直接调用 listener，却假设它会在其他线程执行。
3. **原因**：函数式接口只定义调用形状，不提供线程切换、队列、重试或持久化。
4. **后果**：延迟、事务边界和异常传播与调用方预期不一致。
5. **错误示例**：在事务内回调远端网络并假设不会影响提交。
6. **正确写法**：明确同步合同；真正跨进程时选择事务后事件、消息队列或受控执行器。
7. **影响版本**：Java 25 与 Java 8 的普通方法调用都同步执行。
8. **验证方式**：用记录线程名和事件顺序的 listener 断言实际行为。
9. **来源依据**：`jls25-lambda`、`java25-consumer`、`jls8-lambda`。

### 易错点 5：为了模式创建只有一个实现的空接口

1. **现象**：每个调用要跳过接口、实现和工厂，却没有任何实现替换或边界转换。
2. **触发条件**：先决定“使用模式”，再寻找可以包装的类。
3. **原因**：抽象没有对应真实变化轴，只复制了原方法签名。
4. **后果**：阅读和修改范围增大，测试仍只能依赖同一个具体行为。
5. **错误示例**：`OrderManagerInterface` 只有一个 `OrderManagerImpl`，两者职责完全相同。
6. **正确写法**：保留普通命名类；出现独立实现、外部端口或测试替身需求后再抽取窄接口。
7. **影响版本**：与 Java 版本无关。
8. **验证方式**：删除接口后运行同一行为反馈环；若能力和替换边界不变，抽象没有提供价值。
9. **来源依据**：工程判断以真实变化与反馈环为准，不把语言支持接口等同于必须创建接口。

## 如何验证

1. 在 `/tmp` 创建现代和 Java 8 两个独立目录，仓库内不保留测试文件。
2. Java 25 使用 `-Xlint:all -Werror --release 25` 编译，运行后必须得到固定 PASS 输出。
3. Java 8 使用 `-Xlint:all -Werror` 编译兼容实现，运行后必须得到固定 legacy PASS 输出。
4. 使用 `javap -verbose` 验证 class major：Java 25 为 69，Java 8 为 52。
5. 负向检查未知策略键，确认得到包含业务键的明确异常，而不是空指针异常。
6. 检查模板事件精确等于三个按序事件，不能只检查最终结果。
7. 检查适配器得到 `legacy:user-1|done`，证明两参数内部协议确实转换成旧载荷。
8. 清理两个临时目录并确认不存在，再运行 Catalog、知识路径、格式、工程与页面 Gate。

## 练习

:::exercise
### 练习：为通知服务设计可替换边界

**要求：** 定义 `NotificationStrategy`，实现邮件与站内信两个策略；用注册表按 `EMAIL`、`INBOX`
选择；为只接收一个拼接字符串的旧发送器编写适配器；每次成功后调用一次 `ProgressListener`。

**验收：** 两个合法键得到统一回执；`UNKNOWN` 得到明确异常；适配器输出包含接收方和正文；成功回调
精确一次，策略失败时不得发送成功回调。

**参考答案：** 把选择放在组合边界，策略只执行通知算法，适配器只做协议转换，服务在策略返回成功后
调用 listener。分别断言两个成功路径、未知键和一个失败路径，不断言私有方法名。
:::

## 本节小结

- 策略隔离可替换算法，选择逻辑集中在组合边界。
- 模板方法固定不能打乱的流程，只开放真实变化步骤。
- 适配器转换内部端口与外部协议，包括参数、结果和错误语义。
- 回调必须明确次数、顺序、线程和异常边界；普通回调不会自动异步。
- 四种模式可以组合，但每个对象只承担一种变化原因。
- 先用可观察反馈环证明边界价值；简单且稳定的问题继续使用普通方法。
