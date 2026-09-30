---
id: backend.java.learn.intermediate.database-transactions
type: lesson
title: 事务
summary: 用 Spring 声明式事务协调同一 MySQL 数据源中的项目状态与审计写入，并从最终数据证明提交、运行时异常回滚和 checked exception 回滚规则。
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 210
prerequisites:
  - backend.java.learn.intermediate.mybatis-plus-pagination-and-filtering
objectives:
  - 区分单条 SQL 成功与多步业务操作的原子性，把事务边界放在公开 Service 用例入口。
  - 解释 Spring 事务代理、TransactionInterceptor、事务管理器、连接与 MyBatis SqlSession 的协作过程。
  - 使用 Transactional 让项目状态更新和审计写入正常时共同提交、运行时异常时共同回滚。
  - 说明 RuntimeException、Error 和 checked exception 的默认回滚差异，并用 rollbackFor 表达明确规则。
  - 识别同类自调用、吞异常、手工控制受管 SqlSession 和在业务事务中执行 DDL 的风险。
  - 使用真实 MySQL 8.4 从事务外查询最终状态，而不是只看方法返回值或日志。
  - 分别运行 JDK 25 主线与 Java 8 兼容线，确认共同事务语义没有被依赖版本差异改变。
recap:
  - 事务把必须共同成功或失败的多条 DML 组成一个原子工作单元，单条 Mapper 调用不能代替业务事务边界。
  - 声明式事务依靠 Spring 代理拦截从外部进入的 Bean 方法，在调用前开始事务，并在返回或异常时提交或回滚。
  - 默认 Transactional 使用 REQUIRED；未处理的 RuntimeException 与 Error 回滚，checked exception 默认提交。
  - checked exception 需要回滚时优先使用类型安全的 rollbackFor，不依赖容易误匹配的异常名称字符串。
  - 异常必须越过事务拦截器；在事务方法内部吞掉异常并正常返回，默认会提交已经完成的写入。
  - 默认 proxy 模式不拦截同一对象内的 this 调用，事务入口应由另一个 Bean 从代理外部调用。
  - MyBatis-Spring 在同一 Spring 事务中复用受管 SqlSession，并在事务结束时统一提交或回滚。
  - MySQL 的 DDL 可能隐式提交，表结构迁移不应混进预期可整体回滚的业务 DML 事务。
  - 提交和回滚必须从事务外查询最终数据证明；日志、注解存在或方法抛错都不能单独证明结果。
related:
  - backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
  - backend.java.learn.intermediate.mybatis-plus-pagination-and-filtering
tags:
  - Spring Framework
  - Transactional
  - MyBatis-Spring
  - MySQL
  - InnoDB
  - 事务
  - 提交
  - 回滚
appliesTo: JDK 25、Spring Boot 4.1.0、Spring Framework 7.0.8、MyBatis Spring Boot Starter 4.1.0、MyBatis-Spring 4.1.0 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、Starter 2.1.4 与 MyBatis-Spring 2.0.6 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: spring-boot-41-system-requirements
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上
  - id: spring-transactional-annotations
    title: Spring Framework Using Transactional
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x
    claims:
      - 默认传播行为为 REQUIRED，注解本身是由事务基础设施消费的元数据
      - 默认 proxy 模式只拦截从代理外部进入的方法调用，同类自调用不会建立新的事务拦截
      - 命令式事务通常与当前执行线程绑定
  - id: spring-transaction-rollback
    title: Spring Framework Rolling Back a Declarative Transaction
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x
    claims:
      - 未处理的 RuntimeException 与 Error 默认触发回滚，checked exception 默认不触发回滚
      - rollbackFor 可以按异常类型定义回滚规则，类型规则比名称模式更安全
      - 声明式回滚优先于与 Spring API 耦合的手工 setRollbackOnly
  - id: spring-transaction-internals
    title: Spring Framework Declarative Transaction Implementation
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x
    claims:
      - 事务代理通过 TransactionInterceptor 与事务管理器围绕方法调用建立事务边界
      - PlatformTransactionManager 管理命令式事务
  - id: spring-boot-2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 要求 Java 8，并使用 Spring Framework 5.2.15.RELEASE 或以上
  - id: spring-5215-transactions
    title: Spring Framework 5.2.15.RELEASE Data Access
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/data-access.html#transaction-declarative-annotations
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线同样通过声明式事务、代理和 PlatformTransactionManager 管理本地事务
      - 事务策略与当前执行线程关联，默认 proxy 模式存在同类自调用边界
  - id: mybatis-spring-transactions
    title: MyBatis-Spring Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.1.0 与 2.0.6
    claims:
      - 同一 Spring 事务期间创建并复用一个 SqlSession，在事务完成时提交或回滚
      - 事务管理器与 SqlSessionFactory 必须使用同一个 DataSource
      - Spring 受管 SqlSession 不能由应用调用 commit、rollback 或 close
      - Mapper 在 Spring 事务外执行的数据操作会自动提交
  - id: mysql-84-commit-rollback
    title: MySQL 8.4 InnoDB Autocommit Commit and Rollback
    url: https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4 与 InnoDB
    claims:
      - COMMIT 使当前事务修改持久且对其他会话可见，ROLLBACK 取消当前事务修改
      - MySQL 连接默认启用 autocommit，多语句工作单元需要显式事务边界
      - 客户端会话异常结束时 MySQL 回滚尚未提交的事务
  - id: mysql-84-implicit-commit
    title: MySQL 8.4 Statements That Cause an Implicit Commit
    url: https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 多类 DDL 会在执行前隐式结束当前事务，很多语句执行后还会再次隐式提交
      - 普通 InnoDB CREATE TABLE 不能由用户 ROLLBACK 撤销
      - 事务控制语句不能用于建立真正的嵌套事务
  - id: community-spring-self-invocation-64610390
    title: Stack Overflow - Transactional Annotation Does Not Roll Back RuntimeException
    url: https://stackoverflow.com/questions/64610390/transactional-annotation-does-not-rollback-runtimeexception-even-if-enabletran
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring proxy 事务误用；结论已按 Spring 7.0.x 与 5.2.15 官方文档核验
    claims:
      - 同类方法直接调用导致事务注解未生效是可复现的真实误用
      - 把公开事务入口移动到独立 Service 能让边界更清楚并经过代理
---

# 事务

上一课已经能让数据库按筛选条件返回稳定分页，但一次业务操作经常不止一条 SQL。若“更新项目状态”成功，
“写入状态变更审计”却失败，系统就留下无法解释的半成品。事务要解决的正是这类必须共同成功或失败的多步写入。

本课继续使用一个 MySQL 数据源和 InnoDB 表，只学习 Spring 管理的本地事务。隔离级别、锁与死锁、重试、
可靠幂等、分布式事务和跨服务补偿都有独立复杂度，不在这里提前展开。下一课会把事务能力放入完整的项目与任务
持久化实战。

## 一、把多步写入看成一个工作单元

### 1. 单条 SQL 成功不代表用例完整

下面的状态变更包含两个独立写操作：

```text
UPDATE project_records SET status = 'ACTIVE' WHERE code = 'PRJ-100'
INSERT INTO transaction_audits (...) VALUES (...)
```

数据库可以先成功执行 UPDATE，再在 INSERT 时遇到异常。没有共同事务边界时，第一条已经提交，项目状态成为
ACTIVE，审计却不存在。每一条 SQL 都“按自身合同执行”，业务用例仍然失败。

事务把这两条 DML 组合为一个原子工作单元：

- 两条都完成且方法正常返回，执行 COMMIT。
- 任一关键步骤失败并满足回滚规则，执行 ROLLBACK。
- 事务外只能看到提交后的完整结果，看不到只成功一半的中间状态。

这里的“原子”只覆盖同一个事务管理器控制的数据库资源。向文件系统写文件、调用远程 HTTP 接口或向另一个
数据源写入，不会因为外层存在 `@Transactional` 就自动获得同一份原子性。

### 2. 事务边界属于完整业务用例

Mapper 知道如何执行一条 statement，却不知道“项目状态”和“审计记录”必须共同成功。公开 Service 方法掌握
完整用例，因此应由它承担事务边界：

```java
/** 在一个事务中修改项目状态并写入审计。 */
@Transactional
public void changeStatus(String code, String targetStatus) {
    updateStatusAndAudit(code, targetStatus);
}
```

Controller 若存在，只负责把请求转换为用例参数；Mapper 只负责 SQL。把注解放在单个 Mapper 调用上，会把一次
业务原子操作拆成多个事务。把事务放在 Controller 上，又会让 HTTP 读取、响应转换等不必要工作延长连接占用。

### 3. 最终数据才是提交或回滚证据

方法返回成功只说明调用路径没有向外抛错；日志写出“rollback”也不等于数据库真的回滚。可靠反馈环应在事务
方法结束后，从另一个非事务调用路径重新查询：

```text
COMMIT_SUCCESS status=ACTIVE audits=1
ROLLBACK_RUNTIME status=DRAFT audits=0
```

第一行证明状态和审计一起提交。第二行证明故障前已经执行的两条 DML 都被撤销。查询必须发生在事务完成之后，
否则只能证明当前事务能读到自己的修改。

## 二、理解声明式事务怎样运行

### 1. Transactional 是事务元数据

`@Transactional` 不会自己执行 COMMIT 或 ROLLBACK。Spring 在 Bean 外层创建代理，代理使用
`TransactionInterceptor` 读取注解，再让 `PlatformTransactionManager` 围绕真实方法调用管理事务：

```text
调用方
  -> Spring 代理
      -> 开始或加入事务
      -> 调用真实 Service 方法
      -> 正常返回：提交
      -> 异常越过边界：按回滚规则决定回滚或提交
```

Spring Boot 在单一 JDBC DataSource 场景中提供所需的事务基础设施，MyBatis Starter 让 Mapper 使用同一个
DataSource。课程项目不需要在业务类里获取 Connection，也不需要自己调用 JDBC 的 commit 或 rollback。

### 2. 默认 REQUIRED 会加入当前事务

`@Transactional` 的默认传播行为是 `REQUIRED`：当前调用链已有匹配事务时加入它，没有时创建一个。对本课的
单个 Service 入口而言，可以先理解成“整个公开用例共享一个事务”。传播行为更复杂的组合会改变物理事务与
逻辑范围，留到真正需要组合多个事务用例时再学习。

下面的私有辅助方法无需再加注解，它在已经由公开入口建立的事务中执行：

```java
/** 执行两次必须共同完成的数据库写入。 */
private void updateStatusAndAudit(String code, String targetStatus) {
    String previousStatus = projectMapper.findStatus(code);
    requireOneRow(projectMapper.updateStatus(code, targetStatus), "项目不存在");
    requireOneRow(
            auditMapper.insert(code, previousStatus, targetStatus),
            "审计写入失败");
}
```

这里没有试图建立“嵌套事务”。它只是把两个写入步骤组织在同一个已有事务范围内。

### 3. 命令式事务与当前线程绑定

本课使用普通阻塞式 Mapper，事务资源通常绑定到当前执行线程。若在事务方法内部自行启动新线程，新线程不会
自动继承这份事务；在线程池中执行的 SQL 也不能被当前线程的回滚保证覆盖。异步、响应式事务和线程上下文是
不同模型，本课不混用。

## 三、让 MyBatis 参加同一事务

### 1. 同一 DataSource 是参与条件

MyBatis-Spring 在 Spring 事务开始后，为当前事务取得一个 `SqlSession`。同一调用链中的 Mapper 调用使用这份
受管会话，底层连接由同一个事务管理器协调：

```text
ProjectTransactionService
  -> ProjectRecordMapper.updateStatus
  -> TransactionAuditMapper.insert
  -> 同一个 Spring 事务
  -> 同一个 DataSource
```

若事务管理器与 `SqlSessionFactory` 使用不同 DataSource，看起来都有 Bean，实际却不在同一资源边界。本课只
保留一个 DataSource，避免把本地事务误写成跨库保证。

### 2. 受管 SqlSession 不需要手工提交

通过 Spring 注入的 Mapper 或 `SqlSessionTemplate` 由框架管理。应用不能对受管 `SqlSession` 调用
`commit()`、`rollback()` 或 `close()`；这些方法会抛出 `UnsupportedOperationException`。正确写法是让公开
Service 方法正常返回或向外抛出符合规则的异常。

更隐蔽的错误是绕过受管 Mapper，自己执行 `sqlSessionFactory.openSession()`。新会话不会自动参加当前 Spring
事务，开发者还要处理提交、回滚和关闭，最终形成两个相互独立的边界。当前项目完全不需要这样做。

### 3. 事务外 Mapper 写入会自动提交

MyBatis-Spring 官方文档说明，Mapper 在 Spring 事务之外执行数据方法时会自动提交。单条写入因此通常可以
成功，但连续调用两个 Mapper 仍可能各自提交，无法共同回滚。这正是事务注解必须放在完整 Service 用例外层的
原因。

## 四、掌握异常与回滚规则

### 1. 运行时异常默认回滚

Spring 默认在未处理的 `RuntimeException` 或 `Error` 越过事务代理时回滚。下面的方法先完成两个写入，再故意
抛出运行时异常：

```java
/** 写入后故意抛出运行时异常，验证默认回滚。 */
@Transactional
public void changeWithRuntimeFailure(String code, String targetStatus) {
    updateStatusAndAudit(code, targetStatus);
    throw new IllegalStateException("runtime failure after writes");
}
```

事务外重新查询时，项目仍是原状态，审计数量仍为 0。异常发生在两条 SQL 之后，因此这个结果能证明回滚撤销
了已经执行的 DML，而不是证明代码根本没有运行。

### 2. checked exception 默认不回滚

继承 `Exception`、但不继承 `RuntimeException` 的异常属于 checked exception。Spring 的默认合同把它视为可能
由业务声明的受检失败，不自动回滚：

```java
/** 展示 checked exception 在默认规则下仍提交。 */
@Transactional
public void changeWithDefaultCheckedFailure(String code, String targetStatus)
        throws AuditExportException {
    updateStatusAndAudit(code, targetStatus);
    throw new AuditExportException("checked failure after writes");
}
```

调用方捕获异常后再查询，会看到状态和审计都已经提交。这个结果不是 Spring 忽略了异常，而是默认规则明确选择
不因 checked exception 回滚。

### 3. rollbackFor 明确受检异常规则

若业务合同要求 `AuditExportException` 发生时撤销数据库写入，应把异常类型写入 `rollbackFor`：

```java
/** 让指定 checked exception 也触发回滚。 */
@Transactional(rollbackFor = AuditExportException.class)
public void changeWithCheckedRollback(String code, String targetStatus)
        throws AuditExportException {
    updateStatusAndAudit(code, targetStatus);
    throw new AuditExportException("checked failure with rollback rule");
}
```

类型规则会匹配该类型及其子类，编译器也能检查类名。`rollbackForClassName` 使用字符串模式，可能意外匹配名称
相似的异常；能引用类型时优先使用 `rollbackFor`。

### 4. catch 以后仍要让事务知道失败

可以在事务方法中记录上下文，但若失败必须触发回滚，就要重新抛出异常，或把它转换成符合回滚规则的异常。
捕获后正常返回相当于告诉拦截器“方法成功完成”，默认结果是提交。

不应为了“确保回滚”而给每个方法机械写 `rollbackFor = Exception.class`。先定义哪些异常代表用例失败，再让
注解与异常合同一致。无差别回滚可能把本应提交的业务结果也撤销。

## 五、划清数据库事务边界

### 1. InnoDB DML 可以提交和回滚

MySQL 连接默认启用 autocommit，独立 SQL 通常执行后立即提交。Spring 开始事务时会通过 JDBC 管理连接状态，
让多条 InnoDB DML 在同一个事务完成时统一提交或回滚。`COMMIT` 让修改持久并对其他会话可见，`ROLLBACK`
取消当前事务修改。

本课的 `project_records` 和 `transaction_audits` 都显式使用 `ENGINE=InnoDB`。若使用不支持事务的存储引擎，
外层注解不能凭空提供回滚能力。

### 2. DDL 可能隐式提交

`CREATE TABLE`、`ALTER TABLE`、`DROP TABLE` 等多类 MySQL DDL 会隐式结束当前事务。普通 InnoDB
`CREATE TABLE` 也不能由用户 ROLLBACK 撤销。因此不能把建表和业务 UPDATE 放进同一个方法，再期待抛异常后
一起消失。

课程把表结构放在应用启动的 `schema.sql` 中，在业务事务开始前完成。真实项目应继续使用前置课程介绍的迁移
工具管理 schema 演进，不把 DDL 混进日常 Service 用例。

### 3. 本地事务不覆盖外部副作用

下面这些动作不受本课事务直接控制：

- 已经写入磁盘或对象存储的文件。
- 已经发送到远程服务的 HTTP 请求。
- 使用另一个事务管理器或数据源完成的写入。
- 已经发送给不参与当前事务的消息系统的消息。

它们需要各自的一致性设计。这里只承诺同一 MySQL DataSource 内的两条 InnoDB DML 原子完成。

## 六、集中排查五个典型错误

**社区补充：** Stack Overflow 的真实问题展示了同类调用 `@Transactional` 方法后数据仍提交的现象。其核心
结论已按 Spring 7.0.x 与 5.2.15 官方代理合同复核：默认 proxy 模式必须经过代理才能拦截。

:::pitfalls
### 在同一个对象内调用事务方法

**触发条件：** 一个普通方法使用 `this.changeStatus(...)` 调用同类中带 `@Transactional` 的方法。

**原因：** 默认 proxy 模式只拦截从代理外部进入的调用；`this` 指向目标对象本身，调用不会再次经过代理。

**后果：** 注解存在但预期事务没有建立，后续写入失败时可能留下已经提交的状态。

**错误示例：**

```java
/** 绕过 Spring 代理调用同类事务方法。 */
public void importOne(String code) {
    this.changeStatus(code, "ACTIVE");
}
```

**正确写法：**

```java
/** 从独立调用方 Bean 进入事务 Service 代理。 */
public void importOne(String code) {
    projectTransactionService.changeStatus(code, "ACTIVE");
}
```

**验证方式：** 在第二次写入后故意抛出运行时异常，从事务外查询项目状态和审计数量；两者都保持原值才算通过。

### 吞掉异常后期待默认回滚

**触发条件：** 事务方法捕获 Mapper 或业务异常，只打印日志并正常返回。

**原因：** 异常没有越过 `TransactionInterceptor`，事务基础设施看到的是正常方法返回。

**后果：** 已完成的 DML 被提交，调用方还可能把半成品当成成功结果。

**错误示例：**

```java
/** 捕获失败后错误地报告成功。 */
@Transactional
public boolean changeStatus(String code, String targetStatus) {
    try {
        updateStatusAndAudit(code, targetStatus);
        return true;
    } catch (RuntimeException error) {
        return false;
    }
}
```

**正确写法：**

```java
/** 保留上下文后继续抛出运行时异常。 */
@Transactional
public void changeStatus(String code, String targetStatus) {
    try {
        updateStatusAndAudit(code, targetStatus);
    } catch (RuntimeException error) {
        throw new IllegalStateException("change status failed: " + code, error);
    }
}
```

**验证方式：** 让第二步稳定失败，确认异常越过代理，并从事务外查询第一步修改已回滚。

### 把 checked exception 当成默认回滚异常

**触发条件：** 事务方法完成写入后抛出自定义 `Exception` 子类，却没有声明回滚规则。

**原因：** Spring 默认只因未处理的 `RuntimeException` 和 `Error` 回滚，普通 checked exception 默认提交。

**后果：** 调用方收到失败异常，数据库却保留了状态和审计写入。

**错误示例：**

```java
/** checked exception 默认不会让当前写入回滚。 */
@Transactional
public void exportAfterChange(String code) throws AuditExportException {
    updateStatusAndAudit(code, "REVIEW");
    throw new AuditExportException("export failed");
}
```

**正确写法：**

```java
/** 用类型规则明确受检失败也要回滚。 */
@Transactional(rollbackFor = AuditExportException.class)
public void exportAfterChange(String code) throws AuditExportException {
    updateStatusAndAudit(code, "REVIEW");
    throw new AuditExportException("export failed");
}
```

**验证方式：** 分别运行默认规则与 `rollbackFor` 版本；前者应提交两条写入，后者应回滚两条写入。

### 手工打开 SqlSession 混入受管事务

**触发条件：** Service 已通过注入 Mapper 参加 Spring 事务，又调用 `sqlSessionFactory.openSession()` 执行另一条 SQL。

**原因：** 手工会话不自动参加当前受管会话的生命周期，并引入独立提交、回滚和关闭责任。

**后果：** 两条 SQL 可能属于不同事务，或因会话未关闭产生连接泄漏；直接操作受管会话还会抛出不支持异常。

**错误示例：**

```java
/** 错误地创建第二个手工会话。 */
public void writeAuditManually() {
    SqlSession session = sqlSessionFactory.openSession();
    session.getMapper(TransactionAuditMapper.class).insert("PRJ-100", "DRAFT", "ACTIVE");
    session.commit();
}
```

**正确写法：**

```java
/** 使用 Spring 注入的受管 Mapper。 */
public void writeAudit(String code, String fromStatus, String toStatus) {
    auditMapper.insert(code, fromStatus, toStatus);
}
```

**验证方式：** 保持两个 Mapper 使用同一 DataSource，在外层事务故障后确认状态和审计一起回滚，不出现手工 commit。

### 在业务事务中执行 DDL

**触发条件：** 事务方法先执行 UPDATE，再执行 CREATE TABLE 或 ALTER TABLE，最后抛异常并期待全部撤销。

**原因：** MySQL 8.4 的多类 DDL 会在执行前隐式提交，普通 InnoDB 建表也不能由用户 ROLLBACK 撤销。

**后果：** 原业务事务被提前结束，数据或表结构部分保留，最终状态不再符合方法表面的原子范围。

**错误示例：**

```java
/** 把 schema 变更错误地混进业务用例。 */
@Transactional
public void changeSchemaAndData() {
    projectMapper.updateStatus("PRJ-100", "ACTIVE");
    jdbcTemplate.execute("ALTER TABLE project_records ADD COLUMN note VARCHAR(80)");
    throw new IllegalStateException("expected rollback");
}
```

**正确写法：**

```java
/** 业务事务只编排可共同提交或回滚的 DML。 */
@Transactional
public void changeData() {
    updateStatusAndAudit("PRJ-100", "ACTIVE");
}
```

**验证方式：** schema 变更先由迁移流程完成；业务故障探针只执行 InnoDB DML，并从事务外确认全部回滚。
:::

## 七、运行完整的现代版项目

### 1. 建立工程和依赖

新建独立目录 `teamflow-transactions/`，使用下面的完整 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
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

  <groupId>dev.teamflow</groupId>
  <artifactId>teamflow-transactions</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.mybatis.spring.boot</groupId>
      <artifactId>mybatis-spring-boot-starter</artifactId>
      <version>4.1.0</version>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
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

Starter 会组合 Spring JDBC、事务支持、MyBatis 与 Mapper 自动配置。项目显式固定 Starter `4.1.0`；
Spring Boot parent 管理 Spring Framework 与 Connector/J 版本。

### 2. 配置单一 MySQL 数据源

创建 `src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-transactions
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_TX_DB_URL}
spring.datasource.username=${TEAMFLOW_TX_DB_USER}
spring.datasource.password=${TEAMFLOW_TX_DB_PASSWORD}
spring.sql.init.mode=always
mybatis.configuration.map-underscore-to-camel-case=true
logging.level.root=WARN
```

三个环境变量必须显式提供。课程不在源码中保存真实凭据；后文密码只属于可删除的本地容器。

创建 `src/main/resources/schema.sql`：

```sql
DROP TABLE IF EXISTS transaction_audits;
DROP TABLE IF EXISTS project_records;

CREATE TABLE project_records (
  code VARCHAR(32) PRIMARY KEY,
  status VARCHAR(24) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE transaction_audits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_code VARCHAR(32) NOT NULL,
  from_status VARCHAR(24) NOT NULL,
  to_status VARCHAR(24) NOT NULL
) ENGINE=InnoDB;

INSERT INTO project_records (code, status) VALUES
  ('PRJ-100', 'DRAFT'),
  ('PRJ-200', 'DRAFT'),
  ('PRJ-300', 'DRAFT'),
  ('PRJ-400', 'DRAFT');
```

启动脚本中的 DDL 在业务探针之前执行。四个项目各自承担一个场景，场景之间不会靠重置数据掩盖结果。

### 3. 定义两个 Mapper

创建 `src/main/java/dev/teamflow/transactions/ProjectRecordMapper.java`：

```java
package dev.teamflow.transactions;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ProjectRecordMapper {
    /**
     * 按项目编码读取当前状态。
     *
     * @param code 项目编码
     * @return 当前状态；项目不存在时为 null
     */
    @Select("SELECT status FROM project_records WHERE code = #{code}")
    String findStatus(@Param("code") String code);

    /**
     * 更新项目状态。
     *
     * @param code 项目编码
     * @param status 目标状态
     * @return 受影响行数
     */
    @Update("UPDATE project_records SET status = #{status} WHERE code = #{code}")
    int updateStatus(@Param("code") String code, @Param("status") String status);
}
```

创建 `src/main/java/dev/teamflow/transactions/TransactionAuditMapper.java`：

```java
package dev.teamflow.transactions;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface TransactionAuditMapper {
    /**
     * 写入一次项目状态变更审计。
     *
     * @param code 项目编码
     * @param fromStatus 原状态
     * @param toStatus 目标状态
     * @return 受影响行数
     */
    @Insert("INSERT INTO transaction_audits "
            + "(project_code, from_status, to_status) "
            + "VALUES (#{code}, #{fromStatus}, #{toStatus})")
    int insert(
            @Param("code") String code,
            @Param("fromStatus") String fromStatus,
            @Param("toStatus") String toStatus);

    /**
     * 统计项目的审计记录数。
     *
     * @param code 项目编码
     * @return 审计数量
     */
    @Select("SELECT COUNT(*) FROM transaction_audits WHERE project_code = #{code}")
    int countByProject(@Param("code") String code);
}
```

Mapper 没有事务控制代码。它们只返回查询值或受影响行数，把用例原子性留给 Service。

### 4. 定义受检失败和事务 Service

创建 `src/main/java/dev/teamflow/transactions/AuditExportException.java`：

```java
package dev.teamflow.transactions;

public final class AuditExportException extends Exception {
    /**
     * 创建审计导出受检异常。
     *
     * @param message 失败说明
     */
    public AuditExportException(String message) {
        super(message);
    }
}
```

创建 `src/main/java/dev/teamflow/transactions/ProjectTransactionService.java`：

```java
package dev.teamflow.transactions;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectTransactionService {
    private final ProjectRecordMapper projectMapper;
    private final TransactionAuditMapper auditMapper;

    /**
     * 注入两个参加同一事务的 Mapper。
     *
     * @param projectMapper 项目 Mapper
     * @param auditMapper 审计 Mapper
     */
    public ProjectTransactionService(
            ProjectRecordMapper projectMapper,
            TransactionAuditMapper auditMapper) {
        this.projectMapper = projectMapper;
        this.auditMapper = auditMapper;
    }

    /**
     * 正常修改状态并提交审计。
     *
     * @param code 项目编码
     * @param targetStatus 目标状态
     */
    @Transactional
    public void changeAndCommit(String code, String targetStatus) {
        updateStatusAndAudit(code, targetStatus);
    }

    /**
     * 完成写入后抛出运行时异常，验证默认回滚。
     *
     * @param code 项目编码
     * @param targetStatus 目标状态
     */
    @Transactional
    public void changeWithRuntimeFailure(String code, String targetStatus) {
        updateStatusAndAudit(code, targetStatus);
        throw new IllegalStateException("runtime failure after writes");
    }

    /**
     * 完成写入后抛出 checked exception，展示默认提交规则。
     *
     * @param code 项目编码
     * @param targetStatus 目标状态
     * @throws AuditExportException 固定的受检失败
     */
    @Transactional
    public void changeWithDefaultCheckedFailure(String code, String targetStatus)
            throws AuditExportException {
        updateStatusAndAudit(code, targetStatus);
        throw new AuditExportException("checked failure after writes");
    }

    /**
     * 完成写入后抛出 checked exception，并按类型规则回滚。
     *
     * @param code 项目编码
     * @param targetStatus 目标状态
     * @throws AuditExportException 固定的受检失败
     */
    @Transactional(rollbackFor = AuditExportException.class)
    public void changeWithCheckedRollback(String code, String targetStatus)
            throws AuditExportException {
        updateStatusAndAudit(code, targetStatus);
        throw new AuditExportException("checked failure with rollback rule");
    }

    /** 执行两个必须共同成功的写入。 */
    private void updateStatusAndAudit(String code, String targetStatus) {
        String previousStatus = projectMapper.findStatus(code);
        if (previousStatus == null) {
            throw new IllegalArgumentException("project not found: " + code);
        }
        requireOneRow(projectMapper.updateStatus(code, targetStatus), "project update failed");
        requireOneRow(
                auditMapper.insert(code, previousStatus, targetStatus),
                "audit insert failed");
    }

    /** 校验一条且仅一条记录被修改。 */
    private static void requireOneRow(int rows, String message) {
        if (rows != 1) {
            throw new IllegalStateException(message + ": rows=" + rows);
        }
    }
}
```

四个公开方法都由外部 Bean 调用，因此会先经过 Spring 代理。私有辅助方法不需要代理，它只在已建立的事务中
组织两次 Mapper 调用。

### 5. 从事务外打印四种结果

创建 `src/main/java/dev/teamflow/transactions/TransactionApplication.java`：

```java
package dev.teamflow.transactions;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;

@SpringBootApplication
public class TransactionApplication {
    /** 启动事务反馈应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TransactionApplication.class, args);
    }
}

@Component
class TransactionScenarioRunner implements CommandLineRunner {
    private final ProjectTransactionService service;
    private final ProjectRecordMapper projectMapper;
    private final TransactionAuditMapper auditMapper;

    /**
     * 注入代理 Service 和两个只读观察入口。
     *
     * @param service 事务 Service
     * @param projectMapper 项目 Mapper
     * @param auditMapper 审计 Mapper
     */
    TransactionScenarioRunner(
            ProjectTransactionService service,
            ProjectRecordMapper projectMapper,
            TransactionAuditMapper auditMapper) {
        this.service = service;
        this.projectMapper = projectMapper;
        this.auditMapper = auditMapper;
    }

    /** 按固定顺序运行提交与回滚场景。 */
    @Override
    public void run(String... args) throws Exception {
        expectRuntimeFailure();
        printState("ROLLBACK_RUNTIME", "PRJ-100");

        service.changeAndCommit("PRJ-200", "ACTIVE");
        printState("COMMIT_SUCCESS", "PRJ-200");

        expectDefaultCheckedFailure();
        printState("COMMIT_CHECKED_DEFAULT", "PRJ-300");

        expectCheckedRollback();
        printState("ROLLBACK_CHECKED_RULE", "PRJ-400");
    }

    /** 运行必须抛出运行时异常的场景。 */
    private void expectRuntimeFailure() {
        try {
            service.changeWithRuntimeFailure("PRJ-100", "ACTIVE");
            throw new AssertionError("runtime failure was not thrown");
        } catch (IllegalStateException expected) {
            if (!"runtime failure after writes".equals(expected.getMessage())) {
                throw expected;
            }
        }
    }

    /** 运行默认提交的 checked exception 场景。 */
    private void expectDefaultCheckedFailure() {
        try {
            service.changeWithDefaultCheckedFailure("PRJ-300", "REVIEW");
            throw new AssertionError("checked failure was not thrown");
        } catch (AuditExportException expected) {
            requireMessage(expected, "checked failure after writes");
        }
    }

    /** 运行配置为回滚的 checked exception 场景。 */
    private void expectCheckedRollback() {
        try {
            service.changeWithCheckedRollback("PRJ-400", "REVIEW");
            throw new AssertionError("checked rollback failure was not thrown");
        } catch (AuditExportException expected) {
            requireMessage(expected, "checked failure with rollback rule");
        }
    }

    /** 打印事务结束后的项目状态与审计数量。 */
    private void printState(String label, String code) {
        System.out.println(label
                + " status=" + projectMapper.findStatus(code)
                + " audits=" + auditMapper.countByProject(code));
    }

    /** 校验捕获的是预期受检失败。 */
    private static void requireMessage(Exception error, String expectedMessage) {
        if (!expectedMessage.equals(error.getMessage())) {
            throw new IllegalStateException("unexpected checked failure", error);
        }
    }
}
```

Runner 本身没有 `@Transactional`。每个 Service 调用返回或抛错时，对应事务已经结束，随后 Mapper 查询得到的
就是事务外最终状态。

### 6. 在真实 MySQL 中运行

先启动本课独占的 MySQL 8.4 网络、数据卷和数据库：

```bash
docker network create teamflow-transactions-net
docker volume create teamflow-transactions-data
docker volume create teamflow-transactions-m2

docker run -d \
  --name teamflow-transactions-db \
  --network teamflow-transactions-net \
  -v teamflow-transactions-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=local-root-pass \
  -e MYSQL_DATABASE=teamflow_transactions \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=local-teamflow-pass \
  mysql:8.4

until docker exec teamflow-transactions-db \
  mysql -h127.0.0.1 -uteamflow -plocal-teamflow-pass \
  teamflow_transactions -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
```

在 `teamflow-transactions/` 根目录运行现代工程：

```bash
docker run --rm \
  --network teamflow-transactions-net \
  -v "$PWD:/workspace" \
  -v teamflow-transactions-m2:/root/.m2 \
  -w /workspace \
  -e 'TEAMFLOW_TX_DB_URL=jdbc:mysql://teamflow-transactions-db:3306/teamflow_transactions?sslMode=DISABLED&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_TX_DB_USER=teamflow \
  -e TEAMFLOW_TX_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B spring-boot:run
```

预期四行业务输出为：

```text
ROLLBACK_RUNTIME status=DRAFT audits=0
COMMIT_SUCCESS status=ACTIVE audits=1
COMMIT_CHECKED_DEFAULT status=REVIEW audits=1
ROLLBACK_CHECKED_RULE status=DRAFT audits=0
```

再从独立 MySQL 客户端查询：

```bash
docker exec teamflow-transactions-db \
  mysql -h127.0.0.1 -uteamflow -plocal-teamflow-pass \
  teamflow_transactions \
  -e "SELECT code, status FROM project_records ORDER BY code; SELECT project_code, COUNT(*) AS audits FROM transaction_audits GROUP BY project_code ORDER BY project_code;"
```

结果中 PRJ-100、PRJ-400 保持 DRAFT 且没有审计，PRJ-200 为 ACTIVE、PRJ-300 为 REVIEW，后二者各有一条
审计。这份独立会话结果与应用四行输出共同证明提交和回滚。

## 八、运行 Java 8 兼容线

### 1. 事务语义不需要改写

Spring Boot `2.3.12.RELEASE` 使用 Spring Framework `5.2.15.RELEASE`，MyBatis Starter `2.1.4` 使用
MyBatis-Spring `2.0.6`。它们同样支持默认 proxy 声明式事务、运行时异常回滚、checked exception 默认提交和
`rollbackFor`。

本课 Java 源码只使用 Java 8 已支持的类、注解、字符串拼接与构造器注入，因此五个 Java 文件可以原样复制到
独立的 `teamflow-transactions-java8/`。不要让两条线共用 `target/`。

### 2. 使用完整 Java 8 POM 和属性

兼容工程的 `pom.xml` 为：

```xml
<?xml version="1.0" encoding="UTF-8"?>
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

  <groupId>dev.teamflow</groupId>
  <artifactId>teamflow-transactions-java8</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.mybatis.spring.boot</groupId>
      <artifactId>mybatis-spring-boot-starter</artifactId>
      <version>2.1.4</version>
    </dependency>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <scope>runtime</scope>
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

Java 8 工程的 `application.properties` 只把初始化属性改为旧版名称：

```properties
spring.application.name=teamflow-transactions-java8
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_TX_DB_URL}
spring.datasource.username=${TEAMFLOW_TX_DB_USER}
spring.datasource.password=${TEAMFLOW_TX_DB_PASSWORD}
spring.datasource.initialization-mode=always
mybatis.configuration.map-underscore-to-camel-case=true
logging.level.root=WARN
```

`schema.sql` 和全部 Java 源码与现代工程完全相同。属性名与 MySQL driver 坐标是依赖基线差异，事务业务合同
没有分叉。

### 3. 用独立 JDK 8 容器复跑

创建独立缓存卷后，在 Java 8 工程根目录执行：

```bash
docker volume create teamflow-transactions-java8-m2

docker run --rm \
  --network teamflow-transactions-net \
  -v "$PWD:/workspace" \
  -v teamflow-transactions-java8-m2:/root/.m2 \
  -w /workspace \
  -e 'TEAMFLOW_TX_DB_URL=jdbc:mysql://teamflow-transactions-db:3306/teamflow_transactions?useSSL=false&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_TX_DB_USER=teamflow \
  -e TEAMFLOW_TX_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-8 \
  mvn -B spring-boot:run
```

预期仍输出相同四行。现代与兼容工程都会在启动时重建教学表，所以两次运行必须串行，不要让两个应用同时执行
`schema.sql`。

## 九、练习：增加项目归档事务

:::exercise
### 让归档状态和审计继续共同提交或回滚

**要求：** 在完整项目中增加公开 `archive` 方法，复用现有两个 Mapper。方法把 PRJ-100 改为 ARCHIVED 并写入
审计；`failAfterWrites=true` 时在两次写入后抛出运行时异常。第一次以 true 调用并确认状态仍为 DRAFT、审计为
0；第二次以 false 调用并确认状态为 ARCHIVED、审计为 1。归档方法必须由 Runner 通过注入的 Service 调用，
不能使用 `this` 自调用，也不能手工操作 SqlSession。

**验收：** 先输出 `ARCHIVE_ROLLBACK status=DRAFT audits=0`，再输出
`ARCHIVE_COMMIT status=ARCHIVED audits=1`；JDK 25 与 Java 8 结果一致。
:::

### 1. 完整参考实现

在 `ProjectTransactionService` 中加入：

```java
/**
 * 归档项目，并按参数在写入后触发运行时失败。
 *
 * @param code 项目编码
 * @param failAfterWrites 是否在两次写入后失败
 */
@Transactional
public void archive(String code, boolean failAfterWrites) {
    updateStatusAndAudit(code, "ARCHIVED");
    if (failAfterWrites) {
        throw new IllegalStateException("archive failure after writes");
    }
}
```

在 Runner 的 `run` 末尾加入：

```java
try {
    service.archive("PRJ-100", true);
    throw new AssertionError("archive failure was not thrown");
} catch (IllegalStateException expected) {
    if (!"archive failure after writes".equals(expected.getMessage())) {
        throw expected;
    }
}
printState("ARCHIVE_ROLLBACK", "PRJ-100");

service.archive("PRJ-100", false);
printState("ARCHIVE_COMMIT", "PRJ-100");
```

其余 POM、属性、schema、Mapper、异常类和启动类保持第七章完整实现。第一次调用在两次 DML 后抛出运行时异常，
所以最终仍是 DRAFT 和 0；第二次正常返回，状态和一条审计一起提交。用两条版本线的原运行命令重新执行，新增
输出应逐字满足验收合同。

## 十、本课小结

事务不是给单条 SQL 增加一个注解，而是为完整业务用例定义“共同提交或共同回滚”的边界。公开 Service 方法
通过 Spring 代理进入事务，MyBatis-Spring 让同一 DataSource 的 Mapper 共享受管 SqlSession，InnoDB 执行
真正的 DML 提交与回滚。

默认规则只因未处理的运行时异常和 Error 回滚；checked exception 需要按业务合同使用类型安全的
`rollbackFor`。同类自调用、吞异常、手工会话和 DDL 隐式提交都会让表面注解与实际边界分离。最终判断必须
来自事务外数据查询。下一课会把这些规则用于项目与任务持久化实战。
