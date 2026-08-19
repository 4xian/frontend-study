---
id: backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
type: lesson
title: 依赖注入
summary: 用构造器把 TeamFlow 的协作者交给 Spring 装配，并处理组件扫描与多实现选择
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.intermediate.spring-boot-and-configuration
objectives:
  - 能区分协作者、IoC、依赖注入、Bean 和容器的最低限度含义。
  - 能用 @Component、@Service 和 @Repository 让应用组件被扫描并注册。
  - 能用构造器注入表达必需依赖，并解释单构造器为何可以省略 @Autowired。
  - 能在接口只有一个实现或有多个实现时预测注入结果。
  - 能用 @Primary 表示默认候选，用 @Qualifier 表示注入点需要的具体角色。
  - 能说明字段注入隐藏的依赖，并把普通 Java 直接构造与 Spring 装配对应起来。
  - 能在 JDK 25 / Spring Boot 4.1.0 和 Java 8 / Spring Boot 2.3.12.RELEASE 工程中运行 TeamFlow 示例。
recap:
  - IoC 把对象的创建和连接交给容器，依赖注入是容器把协作者传入对象的具体方式。
  - 组件扫描会发现带 stereotype 注解的类；启动类包的位置决定默认扫描范围。
  - 构造器参数是必需依赖的公开合同，只有一个构造器时不必写 @Autowired。
  - 无候选会缺少 Bean，多候选会产生歧义；唯一的 @Primary 或注入点上的 @Qualifier 可以消除歧义。
  - Java 8 与 JDK 25 使用相同的 Spring 注入注解；两条线的真实差异主要是 JDK 与 Spring Boot 基线。
  - 直接 new 仍然适合纯 Java 测试，Spring 只负责在应用装配边界提供具体实现。
related:
  - backend.java.learn.intermediate.first-spring-boot-web-api
tags:
  - Java
  - Spring Boot
  - 依赖注入
  - IoC
  - 构造器注入
  - 组件扫描
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.0 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容工程
verifiedAt: 2026-08-18
sources:
  - id: spring-dependency-injection
    title: Spring Framework Dependency Injection
    url: https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 依赖注入让对象通过构造器参数、工厂方法参数或属性声明协作者，容器负责提供依赖。
      - 构造器适合表达必需依赖，业务对象不需要自己查找协作者。
  - id: spring-autowired
    title: Using @Autowired
    url: https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 目标 Bean 只有一个构造器时可以省略 @Autowired，多个构造器时需要明确选择规则。
      - '@Autowired 可以用于构造器和字段，但字段注入不会把依赖写入构造器合同。'
  - id: spring-autowired-primary
    title: Fine-tuning Annotation-based Autowiring with @Primary or @Fallback
    url: https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-primary.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@Primary 在单值注入有多个类型匹配候选时提供默认候选。'
      - 同一类型存在多个主候选时仍然不能唯一确定注入对象。
  - id: spring-autowired-qualifiers
    title: Fine-tuning Annotation-based Autowiring with Qualifiers
    url: https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-qualifiers.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@Qualifier 可以在类型匹配候选中进一步缩小选择范围。'
      - 限定符可以标在组件和构造器参数上，注入点的限定符表达调用方需要的角色。
  - id: spring-classpath-scanning
    title: Classpath Scanning and Managed Components
    url: https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@Component 是通用 stereotype，@Repository 和 @Service 是面向职责的特化注解。'
      - 未显式指定扫描包时，组件扫描从声明扫描配置的类所在包递归向下进行。
  - id: spring-boot-41-system-requirements
    title: 'System Requirements :: Spring Boot'
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 至少需要 Java 17，JDK 25 满足该基线。
  - id: spring-boot-2312-system-requirements
    title: Spring Boot Reference Documentation 2.3.12.RELEASE
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/htmlsingle
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 要求 Java 8。
---

# 依赖注入

TeamFlow 的团队服务需要发送通知。通知可以写到控制台，也可以暂时放进内存；服务本身不应该因为
选择了哪一种通道，就把具体类名和创建方式写死。依赖注入解决的正是“对象需要谁来协作”这个装配问题。

本课只关注把协作者交给 Spring：先让组件进入容器，再用构造器表达必需依赖，最后处理同一接口有多个实现
时的选择。Bean 的完整生命周期、作用域、事务代理和测试替身不在本课展开；这里先建立一个能够运行、能够
观察的装配模型。

## 一、先把依赖说清楚

### 1. 从协作者到依赖注入

一个对象完成工作时需要调用的另一个对象，可以称为协作者。例如 `TeamFlowService` 需要一个
`NotificationSender` 才能发送通知。这个需要被提供的对象就是依赖。

IoC（控制反转）描述的是控制权的变化：业务类不再负责决定协作者由哪个具体类创建，装配边界统一决定。
依赖注入（DI）是实现这种变化的一种具体方式，容器把协作者作为构造器参数、方法参数或属性传入对象。
学习本课时可以先记住一句更实用的话：**类声明它需要什么，容器负责把它接上。**

### 2. 普通 Java 写法和 Spring 写法

不使用 Spring 时，可以直接创建实现并把它传给服务：

```java
NotificationSender sender = new ConsoleNotificationSender();
TeamFlowService service = new TeamFlowService(sender);
service.prepare();
```

这里的依赖关系很清楚：`TeamFlowService` 的构造器需要 `NotificationSender`，调用方选择了
`ConsoleNotificationSender`。Spring 做的是把“选择和创建”集中到容器，而不是改变服务的方法调用方式。

使用 Spring 后，服务仍然保留同样的构造器：

```java
@Service
public final class TeamFlowService {
    private final NotificationSender sender;

    /**
     * 创建团队服务。
     *
     * @param sender 通知发送器
     */
    public TeamFlowService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 输出 TeamFlow 服务准备消息。
     */
    public void prepare() {
        sender.send("TeamFlow 服务准备就绪");
    }
}
```

容器发现 `TeamFlowService` 后，会寻找类型匹配的 `NotificationSender`，先创建发送器，再把它传给构造器。
服务不需要保存 `ApplicationContext`，也不需要在方法内部调用 `getBean`。

### 3. Bean 和容器只需要先理解到这里

在本课范围内，Bean 可以理解为“交给 Spring 容器管理的对象”。容器保存这些对象的创建和连接信息，启动
时根据类型和限定规则寻找依赖。`ApplicationContext` 是应用常用的容器入口，完整的工厂层次和生命周期
机制留到专门主题再学习。

当注入成功时，服务从第一次调用开始就拥有可用协作者；当依赖缺失或候选不唯一时，容器会在启动阶段给出
失败信息。这个结果比让字段保持 `null`、直到业务请求才失败更容易发现。

## 二、让组件进入容器

### 1. 三种 stereotype 的职责

Spring 的组件扫描会发现带 stereotype 注解的类。三种常用写法表达的重点不同：

- `@Component`：通用组件，没有更具体的层次语义时使用。
- `@Service`：服务层组件，表达它承载业务用例或流程。
- `@Repository`：持久化或数据访问组件，表达它负责访问数据边界。

它们都能让类成为扫描候选，但注解名称会帮助阅读者和工具理解职责。一个只负责业务流程的类使用
`@Service`，比把所有类都写成 `@Component` 更清楚。

```java
@Component
public final class TeamClock {
    /**
     * 返回固定的演示时间。
     *
     * @return 演示用时间文字
     */
    public String now() {
        return "当前时刻";
    }
}

@Repository
public final class InMemoryTeamRepository {
    /**
     * 返回演示团队名称。
     *
     * @return 团队名称
     */
    public String findTeamName() {
        return "平台团队";
    }
}
```

这里的两个类只是展示职责标记。真正的 TeamFlow 程序会使用两个 `NotificationSender` 实现，以便观察候选
选择；并不是每个普通值对象都应该注册成 Bean。

### 2. 扫描范围决定能否找到 Bean

`@SpringBootApplication` 默认会从启动类所在的包向下递归扫描。将启动类放在 `com.teamflow`，并把服务
放在 `com.teamflow.service`，两者处于同一包树中，服务就会成为扫描候选：

```text
com.teamflow
├── TeamFlowApplication.java
└── service
    └── TeamFlowService.java
```

如果把服务放到 `org.example.service`，它不在 `com.teamflow` 的向下包树中，启动类不会自动发现它。此时
`TeamFlowService` 没有 Bean，依赖它的对象也无法创建。初学阶段最简单的正确操作是让启动类位于项目包根，
而不是先到处添加扫描配置。

### 3. 从类文件到 Bean 的观察点

扫描发现的是类，容器管理的是实例。下面的流程可以作为检查顺序：

1. 类是否使用了合适的 stereotype 注解。
2. 类的包是否位于启动类包的下方。
3. 依赖参数的类型是否与扫描到的实现匹配。
4. 匹配后是否只剩一个可以注入的候选。

只要其中一项不满足，结果就不是“Spring 随便选一个”，而是启动失败或得到与预期不同的实现。把检查点
分开，能够避免把扫描错误误认为构造器注入错误。

## 三、用构造器表达必需依赖

### 1. 构造器就是对象的装配合同

如果服务没有通知发送器就无法工作，就把它放进构造器，并保存为 `final` 字段：

```java
@Service
public final class TeamFlowService {
    private final NotificationSender sender;

    /**
     * 创建必须拥有通知发送器的团队服务。
     *
     * @param sender 通知发送器
     */
    public TeamFlowService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送服务就绪消息。
     */
    public void prepare() {
        sender.send("TeamFlow 服务准备就绪");
    }
}
```

容器创建对象时必须先解决 `NotificationSender`，所以服务一旦创建就满足最低使用条件。普通 Java 代码也
可以直接 `new TeamFlowService(fakeSender)`，不需要启动 Spring 才能检查服务逻辑。

### 2. 单构造器可以省略 `@Autowired`

Spring 官方规则是：一个 Bean 类只有一个构造器时，这个构造器会被采用，即使没有写 `@Autowired`。因此上面
的代码不需要额外注解。为了突出“容器选择这个构造器”，也可以显式写出下面的等价形式：

```java
@Service
public final class TeamFlowService {
    private final NotificationSender sender;

    /**
     * 创建团队服务。
     *
     * @param sender 通知发送器
     */
    @Autowired
    public TeamFlowService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送服务就绪消息。
     */
    public void prepare() {
        sender.send("TeamFlow 服务准备就绪");
    }
}
```

新业务类可以优先省略单构造器上的 `@Autowired`，减少注解噪声；当一个类出现多个构造器时，必须按照官方
规则明确哪一个用于装配。不要在没有需求时增加无参构造器，否则会改变“必需依赖必须在创建时提供”的合同。

### 3. 字段注入为什么不适合作为主线

字段注入看起来更短，但依赖藏在类体内部：

```java
@Service
public final class HiddenDependencyService {
    @Autowired
    private NotificationSender sender;

    /**
     * 发送通知。
     */
    public void send() {
        sender.send("隐藏依赖的通知");
    }
}
```

这个类不能通过构造器看出必须有 `NotificationSender`，直接 `new HiddenDependencyService()` 后调用会得到
未装配的字段。构造器注入把依赖公开为类型合同，也让字段可以保持不可变；因此本课的 TeamFlow 主线只用
构造器注入。字段注入的存在并不意味着旧代码立刻不能运行，而是提醒我们在新代码中不要隐藏必需依赖。

## 四、同一接口有多个实现

### 1. 先按类型，再看候选数量

假设容器发现下面两个实现：

```java
public interface NotificationSender {
    /**
     * 发送通知文本。
     *
     * @param message 要发送的文本
     */
    void send(String message);
}

@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出控制台通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("控制台通道：" + message);
    }
}

@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出内存通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("内存通道：" + message);
    }
}
```

依赖解析的第一步是按 `NotificationSender` 类型找候选：

| 候选数量 | 结果 |
| ---: | --- |
| 0 | 必需依赖无法满足，常见现象是没有匹配 Bean |
| 1 | 直接注入这个实现 |
| 2 个或更多 | 单值注入产生歧义，必须提供选择规则 |

文件名、类的书写顺序和扫描返回顺序都不是选择合同。遇到多个候选时，必须明确表达“默认用谁”或“此处要
哪一种角色”。

### 2. `@Primary` 表示默认实现

当一个实现是大多数场景的默认选择，可以在它的类上标记 `@Primary`：

```java
@Primary
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出控制台通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("控制台通道：" + message);
    }
}
```

此时未限定的构造器参数 `NotificationSender sender` 会选择控制台实现，内存实现仍然存在，其他注入点仍可
明确选择它。一个类型只能有一个能够胜出的主候选；给两个实现都加 `@Primary` 不会让问题消失。

### 3. `@Qualifier` 表示注入点的角色

如果某个服务明确需要内存通道，不应该依赖默认值，而应在构造器参数上写限定符：

```java
@Service
public final class PreviewService {
    private final NotificationSender sender;

    /**
     * 创建使用内存通道的预览服务。
     *
     * @param sender 内存通知发送器
     */
    public PreviewService(@Qualifier("memory") NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送预览消息。
     */
    public void preview() {
        sender.send("TeamFlow 预览通知已准备");
    }
}
```

实现类需要带上同一个限定符：

```java
@Qualifier("memory")
@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出内存通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("内存通道：" + message);
    }
}
```

`@Qualifier` 的含义是先保留类型匹配的候选，再按角色继续缩小范围；它不是让业务类直接按字符串调用容器。
限定符拼写不一致、实现忘记标记或参数导入了错误注解时，都会导致没有匹配候选。

## 五、把装配放进 TeamFlow

### 1. 项目目录和启动类

在 IntelliJ IDEA 中创建两个彼此独立的 Maven Java 项目，GroupId 都使用 `com.teamflow`。现代工程的
ArtifactId 使用 `teamflow-di-jdk25`，兼容工程使用 `teamflow-di-java8`。两个目录各自拥有 `pom.xml`、
`src` 和 `target`，不能共用构建产物：

```text
teamflow-di-jdk25/
├── pom.xml
└── src/main/java/com/teamflow/...

teamflow-di-java8/
├── pom.xml
└── src/main/java/com/teamflow/...
```

两个工程的 `com/teamflow` 下都包含 `TeamFlowApplication.java`、`notification` 子包和 `service` 子包；
后面的完整工程会逐文件给出。目录分开后，IDEA 的 SDK、POM 目标和 Maven 输出也能独立核对。

这是一个普通 Java 项目：Maven 管理 Spring Boot 依赖，IntelliJ IDEA 负责编辑和运行配置，Spring 在程序
启动时负责发现组件并装配构造器参数。

### 2. 先用最小候选检查装配

开发时可以先只保留 `ConsoleNotificationSender`，启动 `TeamFlowApplication` 并调用服务。如果能看到控制台
通道消息，说明扫描、单构造器注入和调用链都已经接通。再加入 `MemoryNotificationSender`，未限定的服务
需要 `@Primary`，预览服务需要 `@Qualifier("memory")`；这样可以逐步观察候选数量变化带来的结果。

### 3. 终端和 IDEA 要核对同一套 JDK

运行前分别检查：

```bash
java -version
javac -version
mvn -version
```

IDEA 的 Project SDK、Module SDK、Maven Runner JRE 和终端 JDK 可能不是同一个。一个常见现象是终端能用
JDK 25，模块却仍选着旧 SDK；这时 Maven 和运行按钮可能出现不同结果。应在 Project Structure 的 Project
页面确认 Project SDK，在 Modules 页面确认 Module SDK，在 Settings 的 Maven Runner 中确认 JRE，再核对
`pom.xml` 的 `java.version`，Reload Maven 后回到终端重复 `java -version` 和 `mvn -version`。

## 六、常见错误

### 六个典型错误

下面的错误都围绕“组件是否进入容器”和“构造器参数最终对应哪个候选”。每项都给出可复制的错误与正确
写法，先看现象，再按验证方式重跑，不把错误扩展成完整的异常诊断课。

:::pitfalls
### 启动类包根放错

**现象：** 启动时报没有可用的 `TeamFlowService` Bean，依赖它的对象也无法创建。

**触发条件：** 启动类在 `com.example.app`，服务却在不属于它的 `org.teamflow.service` 包，且没有额外扫描配置。

**原因：** 默认组件扫描从启动类所在包递归向下，不会自动扫描平级或其他根包。

**后果：** 类文件虽然编译成功，运行时容器仍没有该 Bean，应用在创建依赖图时失败。

**错误示例：**

```java
package com.example.app;

@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}

package org.teamflow.service;

@Service
public final class TeamFlowService {
    /**
     * 返回服务名称。
     *
     * @return 服务名称
     */
    public String name() {
        return "TeamFlow";
    }
}
```

**正确写法：**

```java
package com.example.app.service;

@Service
public final class TeamFlowService {
    /**
     * 返回服务名称。
     *
     * @return 服务名称
     */
    public String name() {
        return "TeamFlow";
    }
}
```

**影响版本：** Spring Boot 4.1.0 和 2.3.12.RELEASE 都适用。

**验证方式：** 将服务移动到启动类包的子包后重新运行；应用应能创建 `TeamFlowService`，再观察其输出。

### 接口实现忘记注册

**现象：** 构造器需要 `NotificationSender`，但启动时提示没有匹配的 Bean。

**触发条件：** 实现类没有 `@Component`、`@Service` 或其他注册方式，或者类不在扫描范围内。

**原因：** 实现类只是普通 Java 类，容器不会因为它实现了接口就自动创建 Bean。

**后果：** 接口类型本身存在，但容器找不到可以注入的对象，服务无法创建。

**错误示例：**

```java
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}
```

**正确写法：**

```java
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}
```

**影响版本：** Spring Boot 4.1.0 和 2.3.12.RELEASE 都适用。

**验证方式：** 为实现增加 `@Service` 并确认包路径正确；重新启动后应从容器得到一个发送器。

### 两个实现没有选择规则

**现象：** 启动时报 `NoUniqueBeanDefinitionException`，异常中列出两个发送器 Bean 名称。

**触发条件：** 容器中有两个 `NotificationSender`，服务构造器只声明未限定的 `NotificationSender sender`。

**原因：** 类型匹配得到多个同等候选，Spring 不会依赖类名顺序随机选择。

**后果：** 依赖图无法确定，服务 Bean 创建失败，应用不能进入可用状态。

**错误示例：**

```java
@Service
public final class TeamFlowService {
    private final NotificationSender sender;

    /**
     * 创建团队服务。
     *
     * @param sender 通知发送器
     */
    public TeamFlowService(NotificationSender sender) {
        this.sender = sender;
    }
}
```

**正确写法：**

```java
@Primary
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出控制台通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("控制台通道：" + message);
    }
}
```

**影响版本：** Spring Boot 4.1.0 和 2.3.12.RELEASE 都适用。

**验证方式：** 保留两个实现并只给一个加 `@Primary`；重新启动后未限定服务应稳定使用该实现。

### 多个实现都标成 `@Primary`

**现象：** 增加 `@Primary` 后仍然报告候选不唯一。

**触发条件：** 同一种接口的两个实现都带有 `@Primary`，而注入点没有 `@Qualifier`。

**原因：** `@Primary` 只能在多个候选中提供唯一默认值，多个主候选仍然无法决胜。

**后果：** 启动失败，修改注解数量没有解决真正的候选选择问题。

**错误示例：**

```java
@Primary
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}

@Primary
@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}
```

**正确写法：**

```java
@Primary
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出默认通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}

@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出备用通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}
```

**影响版本：** Spring Boot 4.1.0 和 2.3.12.RELEASE 都适用。

**验证方式：** 只保留一个 `@Primary` 后重新启动；未限定构造器应获得唯一主候选，需要备用实现的位置再用限定符。

### 限定符名称前后不一致

**现象：** 明明存在内存实现，带 `@Qualifier("memory")` 的构造器仍然提示找不到匹配 Bean。

**触发条件：** 实现标记为 `@Qualifier("in-memory")`，构造器参数却写成 `@Qualifier("memory")`。

**原因：** 限定符是精确的角色值，类型匹配后还必须有相同限定符。

**后果：** 候选集合被缩小为空，服务不能创建。

**错误示例：**

```java
@Qualifier("in-memory")
@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出内存通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}

/**
 * 创建预览服务。
 *
 * @param sender 通知发送器
 */
public PreviewService(@Qualifier("memory") NotificationSender sender) {
    this.sender = sender;
}
```

**正确写法：**

```java
@Qualifier("memory")
@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出内存通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}
```

**影响版本：** Spring Boot 4.1.0 和 2.3.12.RELEASE 都适用。

**验证方式：** 让实现和构造器参数使用同一个 `memory` 值；重新启动并观察预览服务输出内存通道消息。

### 把字段注入类直接 `new` 出来

**现象：** 代码可以编译，但直接创建服务后调用方法时通知发送器为空。

**触发条件：** 类依赖字段上的 `@Autowired`，测试或命令行入口却使用无参构造器直接创建它。

**原因：** `@Autowired` 字段需要容器在实例化后处理；普通 `new` 不会触发 Spring 装配。

**后果：** 依赖直到第一次业务调用才暴露为空，问题远离了对象创建位置。

**错误示例：**

```java
@Service
public final class HiddenDependencyService {
    @Autowired
    private NotificationSender sender;

    /**
     * 发送通知。
     */
    public void send() {
        sender.send("通知");
    }
}

HiddenDependencyService service = new HiddenDependencyService();
service.send();
```

**正确写法：**

```java
public final class ExplicitDependencyService {
    private final NotificationSender sender;

    /**
     * 创建显式依赖服务。
     *
     * @param sender 通知发送器
     */
    public ExplicitDependencyService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送通知。
     */
    public void send() {
        sender.send("通知");
    }
}

ExplicitDependencyService service = new ExplicitDependencyService(new ConsoleNotificationSender());
service.send();
```

**影响版本：** Spring Boot 4.1.0 和 2.3.12.RELEASE 都适用。

**验证方式：** 不启动 Spring，直接传入一个 `NotificationSender` 创建正确写法；程序应立即输出通知，构造器也能让依赖缺失在创建处暴露。
:::

## 七、完整的 TeamFlow 首程序

下面的程序把组件扫描、单构造器注入、`@Primary` 和 `@Qualifier` 串成一条可运行链路。默认服务使用控制台
通道，预览服务明确选择内存通道。代码使用传统入口，JDK 25 和 Java 8 都能理解同一套 Spring 注入合同。

### 1. JDK 25 / Spring Boot 4.1.0 完整工程

`pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.0</version>
        <relativePath/>
    </parent>

    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-di-jdk25</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>25</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

`src/main/java/com/teamflow/notification/NotificationSender.java`：

```java
package com.teamflow.notification;

/**
 * 定义 TeamFlow 的通知发送能力。
 */
public interface NotificationSender {
    /**
     * 发送通知文本。
     *
     * @param message 要发送的文本
     */
    void send(String message);
}
```

`src/main/java/com/teamflow/notification/ConsoleNotificationSender.java`：

```java
package com.teamflow.notification;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * 使用控制台输出通知的默认实现。
 */
@Primary
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出控制台通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("控制台通道：" + message);
    }
}
```

`src/main/java/com/teamflow/notification/MemoryNotificationSender.java`：

```java
package com.teamflow.notification;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * 使用内存语义输出通知的备用实现。
 */
@Qualifier("memory")
@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出内存通道通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("内存通道：" + message);
    }
}
```

`src/main/java/com/teamflow/service/TeamFlowService.java`：

```java
package com.teamflow.service;

import com.teamflow.notification.NotificationSender;
import org.springframework.stereotype.Service;

/**
 * TeamFlow 的默认服务。
 */
@Service
public final class TeamFlowService {
    private final NotificationSender sender;

    /**
     * 创建默认通知服务。
     *
     * @param sender 通知发送器
     */
    public TeamFlowService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送服务准备消息。
     */
    public void prepare() {
        sender.send("TeamFlow 服务准备就绪");
    }
}
```

`src/main/java/com/teamflow/service/PreviewService.java`：

```java
package com.teamflow.service;

import com.teamflow.notification.NotificationSender;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * TeamFlow 的预览服务。
 */
@Service
public final class PreviewService {
    private final NotificationSender sender;

    /**
     * 创建固定使用内存通道的预览服务。
     *
     * @param sender 内存通知发送器
     */
    public PreviewService(@Qualifier("memory") NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送预览消息。
     */
    public void preview() {
        sender.send("TeamFlow 预览通知已准备");
    }
}
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import com.teamflow.service.PreviewService;
import com.teamflow.service.TeamFlowService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 依赖注入示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动容器并观察两个注入点的通道选择。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TeamFlowApplication.class, args);
        TeamFlowService teamFlowService = context.getBean(TeamFlowService.class);
        PreviewService previewService = context.getBean(PreviewService.class);

        teamFlowService.prepare();
        previewService.preview();
        context.close();
    }
}
```

**在 IDEA 中运行：** 单独打开 `teamflow-di-jdk25`。在 Project Structure 的 Project 页面选择 JDK 25，
在 Modules 页面让 Module SDK 使用 Project SDK，在 Maven Runner 中选择 JDK 25，并确认 POM 的
`java.version` 为 `25`。执行 Maven Reload 后再运行 `TeamFlowApplication.main`。不要运行
`TeamFlowService`，它没有 `main` 入口。

**在终端中运行：** 在包含 `pom.xml` 的目录执行：

```bash
mvn spring-boot:run
```

也可以先打包再运行：

```bash
mvn package
java -jar target/teamflow-di-jdk25-0.0.1-SNAPSHOT.jar
```

预期输出中包含：

```text
控制台通道：TeamFlow 服务准备就绪
内存通道：TeamFlow 预览通知已准备
```

第一行来自没有限定符的 `TeamFlowService`：两个实现中只有控制台实现是 `@Primary`。第二行来自构造器参数
上的 `@Qualifier("memory")`，它明确选择内存实现。`context.getBean` 只出现在启动边界；业务服务本身仍只
持有构造器传入的接口。

### 2. Java 8 / Spring Boot 2.3.12.RELEASE 完整工程

Java 8 版本使用完整的传统入口和相同的包结构。`pom.xml` 需要明确使用兼容基线：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.12.RELEASE</version>
        <relativePath/>
    </parent>

    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-di-java8</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

`src/main/java/com/teamflow/notification/NotificationSender.java`：

```java
package com.teamflow.notification;

/**
 * 定义 TeamFlow 的通知发送能力。
 */
public interface NotificationSender {
    /**
     * 发送通知文本。
     *
     * @param message 要发送的文本
     */
    void send(String message);
}
```

`src/main/java/com/teamflow/notification/ConsoleNotificationSender.java`：

```java
package com.teamflow.notification;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * 使用控制台输出通知的默认实现。
 */
@Primary
@Service
public final class ConsoleNotificationSender implements NotificationSender {
    /**
     * 输出控制台通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("控制台通道：" + message);
    }
}
```

`src/main/java/com/teamflow/notification/MemoryNotificationSender.java`：

```java
package com.teamflow.notification;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * 使用内存语义输出通知的备用实现。
 */
@Qualifier("memory")
@Service
public final class MemoryNotificationSender implements NotificationSender {
    /**
     * 输出内存通道通知。
     *
     * @param message 要输出的文本
     */
    @Override
    public void send(String message) {
        System.out.println("内存通道：" + message);
    }
}
```

`src/main/java/com/teamflow/service/TeamFlowService.java`：

```java
package com.teamflow.service;

import com.teamflow.notification.NotificationSender;
import org.springframework.stereotype.Service;

/**
 * TeamFlow 的默认服务。
 */
@Service
public final class TeamFlowService {
    private final NotificationSender sender;

    /**
     * 创建默认通知服务。
     *
     * @param sender 通知发送器
     */
    public TeamFlowService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送服务准备消息。
     */
    public void prepare() {
        sender.send("TeamFlow 服务准备就绪");
    }
}
```

`src/main/java/com/teamflow/service/PreviewService.java`：

```java
package com.teamflow.service;

import com.teamflow.notification.NotificationSender;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * TeamFlow 的预览服务。
 */
@Service
public final class PreviewService {
    private final NotificationSender sender;

    /**
     * 创建固定使用内存通道的预览服务。
     *
     * @param sender 内存通知发送器
     */
    public PreviewService(@Qualifier("memory") NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送预览消息。
     */
    public void preview() {
        sender.send("TeamFlow 预览通知已准备");
    }
}
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import com.teamflow.service.PreviewService;
import com.teamflow.service.TeamFlowService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * 启动 TeamFlow 依赖注入示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动容器并观察两个注入点的通道选择。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TeamFlowApplication.class, args);
        TeamFlowService teamFlowService = context.getBean(TeamFlowService.class);
        PreviewService previewService = context.getBean(PreviewService.class);

        teamFlowService.prepare();
        previewService.preview();
        context.close();
    }
}
```

**在 IDEA 中运行：** 单独打开 `teamflow-di-java8`。在 Project Structure 的 Project 页面选择 JDK 8，
在 Modules 页面让 Module SDK 使用 Project SDK，在 Maven Runner 中选择 JDK 8，并确认 POM 的
`java.version` 为 `1.8`。执行 Maven Reload 后运行 `TeamFlowApplication.main`。不要只切换 Project SDK
却继续用 JDK 25 执行 Maven，也不要把两个工程的 `target` 目录混用。

**在终端中运行：** 使用 JDK 8 的终端进入兼容工程目录，执行同样的命令：

```bash
mvn spring-boot:run
```

或：

```bash
mvn package
java -jar target/teamflow-di-java8-0.0.1-SNAPSHOT.jar
```

预期输出仍然是：

```text
控制台通道：TeamFlow 服务准备就绪
内存通道：TeamFlow 预览通知已准备
```

这里没有为了制造差异而改写注入代码：`@Service`、`@Primary`、`@Qualifier`、单构造器规则和传统 `main`
入口在两条线都可用。真实差异是 Boot 4.1.0 以 JDK 25 为教学主线，而兼容工程固定在 Java 8 与 Boot
2.3.12.RELEASE；切换时必须同时核对 IDEA SDK、Maven Runner JRE、终端 JDK 和 POM 版本。

## 八、练习：为 TeamFlow 增加成员欢迎通知

:::exercise
### 练习要求

**要求：** 在完整工程中新增 `MemberWelcomeService`，让它通过构造器接收 `NotificationSender`，并新增
`welcome(String memberName)` 方法。默认欢迎通知使用控制台实现；再新增一个 `MemoryWelcomeService`，在
构造器参数上使用 `@Qualifier("memory")`，让它明确使用内存实现。不要在服务中保存 `ApplicationContext`，
不要使用字段注入，也不要创建第三个 `NotificationSender` 实现。

**验收：** 启动程序后能分别看到控制台和内存两条欢迎消息；删除 `@Primary` 时默认服务应出现多候选错误，
恢复后再次运行成功；直接用 `new MemberWelcomeService(new ConsoleNotificationSender())` 也能在不启动 Spring
的情况下调用 `welcome("小林")`。Java 8 版本继续使用完整工程中的传统入口和 Boot 2.3.12.RELEASE POM。

**完成标准：** 两个服务的依赖都出现在构造器中，限定符值前后一致，运行输出中的成员姓名与传入值一致。
:::

### 1. 完整参考实现

下面的新增文件可以直接放进前面的目录。它同时适用于 JDK 25 / Boot 4.1.0 和 Java 8 / Boot 2.3.12.RELEASE；
两条线只需分别使用前面对应的完整 `pom.xml`，Java 源码不需要改写。

`src/main/java/com/teamflow/service/MemberWelcomeService.java`：

```java
package com.teamflow.service;

import com.teamflow.notification.NotificationSender;
import org.springframework.stereotype.Service;

/**
 * 使用默认通知通道发送成员欢迎消息。
 */
@Service
public final class MemberWelcomeService {
    private final NotificationSender sender;

    /**
     * 创建成员欢迎服务。
     *
     * @param sender 默认通知发送器
     */
    public MemberWelcomeService(NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送成员欢迎消息。
     *
     * @param memberName 成员名称
     */
    public void welcome(String memberName) {
        sender.send("欢迎加入 TeamFlow：" + memberName);
    }
}
```

`src/main/java/com/teamflow/service/MemoryWelcomeService.java`：

```java
package com.teamflow.service;

import com.teamflow.notification.NotificationSender;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * 使用内存通道发送成员欢迎消息。
 */
@Service
public final class MemoryWelcomeService {
    private final NotificationSender sender;

    /**
     * 创建内存通道欢迎服务。
     *
     * @param sender 内存通知发送器
     */
    public MemoryWelcomeService(@Qualifier("memory") NotificationSender sender) {
        this.sender = sender;
    }

    /**
     * 发送内存通道欢迎消息。
     *
     * @param memberName 成员名称
     */
    public void welcome(String memberName) {
        sender.send("欢迎加入 TeamFlow：" + memberName);
    }
}
```

JDK 25 工程使用下面完整的 `src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import com.teamflow.service.MemberWelcomeService;
import com.teamflow.service.MemoryWelcomeService;
import com.teamflow.service.PreviewService;
import com.teamflow.service.TeamFlowService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * 启动 TeamFlow 依赖注入练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动容器并依次调用四个服务。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TeamFlowApplication.class, args);
        TeamFlowService teamFlowService = context.getBean(TeamFlowService.class);
        PreviewService previewService = context.getBean(PreviewService.class);
        MemberWelcomeService memberWelcomeService = context.getBean(MemberWelcomeService.class);
        MemoryWelcomeService memoryWelcomeService = context.getBean(MemoryWelcomeService.class);

        teamFlowService.prepare();
        previewService.preview();
        memberWelcomeService.welcome("小林");
        memoryWelcomeService.welcome("小林");
        context.close();
    }
}
```

在 IDEA 中单独打开 `teamflow-di-jdk25`，确认 Project SDK、Module SDK 和 Maven Runner JRE 都是
JDK 25，POM 的 `java.version` 是 `25`。Maven Reload 后运行 `TeamFlowApplication.main`。也可以在该工程
包含 `pom.xml` 的目录执行：

```bash
mvn spring-boot:run
```

Java 8 工程必须保留完整传统入口，使用下面完整的
`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import com.teamflow.service.MemberWelcomeService;
import com.teamflow.service.MemoryWelcomeService;
import com.teamflow.service.PreviewService;
import com.teamflow.service.TeamFlowService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * 启动 TeamFlow 依赖注入练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动容器并依次调用四个服务。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TeamFlowApplication.class, args);
        TeamFlowService teamFlowService = context.getBean(TeamFlowService.class);
        PreviewService previewService = context.getBean(PreviewService.class);
        MemberWelcomeService memberWelcomeService = context.getBean(MemberWelcomeService.class);
        MemoryWelcomeService memoryWelcomeService = context.getBean(MemoryWelcomeService.class);

        teamFlowService.prepare();
        previewService.preview();
        memberWelcomeService.welcome("小林");
        memoryWelcomeService.welcome("小林");
        context.close();
    }
}
```

在 IDEA 中单独打开 `teamflow-di-java8`，确认 Project SDK、Module SDK 和 Maven Runner JRE 都是 JDK 8，
POM 的 `java.version` 是 `1.8`。Maven Reload 后运行 `TeamFlowApplication.main`。也可以使用 JDK 8 的终端
进入该工程包含 `pom.xml` 的目录执行：

```bash
mvn spring-boot:run
```

两个版本都应依次出现下面四行课程输出：

```text
控制台通道：TeamFlow 服务准备就绪
内存通道：TeamFlow 预览通知已准备
控制台通道：欢迎加入 TeamFlow：小林
内存通道：欢迎加入 TeamFlow：小林
```

容器先按类型取得四个服务。没有限定符的服务使用唯一的 `@Primary` 控制台实现，带
`@Qualifier("memory")` 的服务使用内存实现；四次调用完成后，`context.close()` 关闭本次启动的容器。

JDK 25 工程再创建完整的 `src/main/java/com/teamflow/DirectConstructionCheck.java`，单独验证服务可以脱离
Spring 容器直接构造：

```java
package com.teamflow;

import com.teamflow.notification.ConsoleNotificationSender;
import com.teamflow.service.MemberWelcomeService;

/**
 * 直接构造成员欢迎服务并验证依赖合同。
 */
public final class DirectConstructionCheck {
    /**
     * 不启动 Spring 容器，直接创建并调用服务。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        MemberWelcomeService service = new MemberWelcomeService(new ConsoleNotificationSender());
        service.welcome("小林");
    }
}
```

在 `teamflow-di-jdk25` 中保持前面的 JDK 25 配置，直接运行 `DirectConstructionCheck.main`。控制台只出现
下面一行课程输出，且不会出现 Spring Boot 启动日志：

```text
控制台通道：欢迎加入 TeamFlow：小林
```

Java 8 工程也创建完整的 `src/main/java/com/teamflow/DirectConstructionCheck.java`：

```java
package com.teamflow;

import com.teamflow.notification.ConsoleNotificationSender;
import com.teamflow.service.MemberWelcomeService;

/**
 * 直接构造成员欢迎服务并验证依赖合同。
 */
public final class DirectConstructionCheck {
    /**
     * 不启动 Spring 容器，直接创建并调用服务。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        MemberWelcomeService service = new MemberWelcomeService(new ConsoleNotificationSender());
        service.welcome("小林");
    }
}
```

在 `teamflow-di-java8` 中保持前面的 JDK 8 配置，直接运行 `DirectConstructionCheck.main`，预期输出同样是：

```text
控制台通道：欢迎加入 TeamFlow：小林
```

这项练习没有引入 Java 8 不支持的语言写法，也没有使用 Spring Boot 版本专属注解，所以两个服务类、Spring
入口和直接构造入口在两条线相同；工程的 POM、IDEA SDK 和 Maven Runner JRE 仍必须分别匹配各自版本，不能
把 Java 8 POM 换成 Boot 4.1.0。

## 九、本课小结

- 依赖是对象完成工作所需要的协作者，IoC 把创建和连接的控制权交给容器，DI 把协作者传入对象。
- `@Component`、`@Service` 和 `@Repository` 让职责明确的类成为组件扫描候选，包结构决定默认扫描范围。
- 构造器注入让必需依赖在对象创建时就可见；单构造器不需要 `@Autowired`，字段注入不作为本课主线。
- 一个实现可以直接注入；没有实现会缺 Bean；多个实现必须用唯一 `@Primary` 或 `@Qualifier` 选择。
- TeamFlow 的完整程序证明了默认候选和限定候选分别如何输出，普通 Java 直接构造也能复用同一服务。
- JDK 25 / Boot 4.1.0 与 Java 8 / Boot 2.3.12.RELEASE 的注入源码相同，版本切换时要同时核对 POM、IDEA 和终端 JDK。
