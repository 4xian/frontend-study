---
id: backend.java.learn.advanced.concurrent-updates-and-consistency
type: lesson
title: 并发更新与一致性
summary: 用版本条件更新、锁定读和明确事务边界处理 TeamFlow 的并发写入冲突
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 210
prerequisites:
  - backend.java.learn.advanced.reliable-consumption-and-idempotency
  - backend.java.learn.intermediate.database-transactions
  - backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
objectives:
  - 能用两个并发写者的时间线解释丢失更新，而不是只凭“加锁”判断安全性。
  - 能区分单 JVM 内的原子更新、数据库 version 条件更新和数据库锁定读的覆盖范围。
  - 能写出带 version 条件的 UPDATE，并根据受影响行数识别成功、冲突和目标不存在。
  - 能在同一事务中使用 SELECT FOR UPDATE，并说明锁的释放时刻、自动提交限制和死锁风险。
  - 能选择 READ COMMITTED、REPEATABLE READ 或 SERIALIZABLE 的适用边界，不把隔离级别当成业务冲突解决器。
  - 能为乐观冲突设计有上限的重新读取与重试，并区分冲突、校验失败和资源故障。
  - 能解释事务内本地状态与 HTTP、消息等外部副作用不能自动一起提交的原因。
  - 能在 Java 25 与 Java 8 的同一示例中观察一致的冲突结果和状态不变量。
recap:
  - 先读后写的两个事务如果没有条件或锁，后提交者可能覆盖先提交者，形成丢失更新。
  - AtomicReference 只保护同一 JVM 的引用；跨进程写入必须由数据库条件更新或锁来仲裁。
  - version 条件更新把读取到的版本放进 WHERE，affected rows 为 0 时必须重新读取并作出业务决定。
  - SELECT FOR UPDATE 只能在事务中保护后续读改写，提交或回滚后锁立即释放；它不是全局业务锁。
  - InnoDB 默认 REPEATABLE READ 提供快照读，但隔离级别不会替应用决定库存不足或状态冲突如何处理。
  - 每次乐观重试都要使用新的事务和最新数据，并设置次数上限；不能在同一失败事务里盲目循环。
  - 本地事务提交不等于远端 HTTP 或消息成功，外部副作用要有独立的幂等或重试合同。
  - Java 8 与 JDK 25 都支持本课的 AtomicReference、JDBC 和 MyBatis 控制流，差异只在工程依赖与工具链。
related:
  - backend.java.learn.intermediate.database-transactions
  - backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
  - backend.java.learn.advanced.reliable-consumption-and-idempotency
tags:
  - Java
  - Spring Boot
  - MyBatis
  - MySQL
  - 并发更新
  - 乐观锁
  - 悲观锁
  - 事务隔离
  - 一致性
appliesTo: JDK 25 / Spring Boot 4.1.1 / MyBatis Spring Boot Starter 4.1.0 / MySQL 8.4 主线；Java 8 / Spring Boot 2.3.12.RELEASE / MyBatis Spring Boot Starter 2.1.4 兼容线
verifiedAt: 2026-08-31
sources:
  - id: mysql-locking-reads
    title: MySQL 8.4 Reference Manual - Locking Reads
    url: https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4 InnoDB
    claims:
      - SELECT FOR UPDATE 锁定搜索到的索引记录，锁在事务提交或回滚时释放。
      - 锁定读需要关闭自动提交或显式开启事务，普通快照读不会获得同样的写保护。
  - id: mysql-isolation-levels
    title: MySQL 8.4 Reference Manual - Transaction Isolation Levels
    url: https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4 InnoDB
    claims:
      - InnoDB 支持 READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ 和 SERIALIZABLE，默认是 REPEATABLE READ。
      - 普通一致性读使用事务快照，锁定读、UPDATE 和 DELETE 使用不同的锁策略。
  - id: spring-transaction-propagation
    title: Spring Framework Reference - Transaction Propagation
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7 / Spring Boot 4.1.1；兼容语义适用于 Spring Framework 5.2
    claims:
      - PROPAGATION_REQUIRED 默认加入当前物理事务，REQUIRES_NEW 使用独立物理事务。
      - 独立事务会占用新的连接，连接池容量不足时可能导致等待或死锁。
  - id: spring-transaction-isolation
    title: Spring Framework Javadoc - Isolation
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Isolation.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7
    claims:
      - Isolation 枚举对应 JDBC 隔离级别，并明确各级别对 dirty、non-repeatable 和 phantom read 的限制。
  - id: spring-data-locking
    title: Spring Data JPA Reference - Locking
    url: https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Data JPA 当前参考线
    claims:
      - Spring Data 可以用 @Lock 为查询方法指定 LockModeType，锁模式仍受底层数据库和事务范围约束。
  - id: java25-atomic-reference
    title: AtomicReference (Java SE 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicReference.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - compareAndSet 在当前引用等于期望引用时原子替换，并返回是否成功。
  - id: java8-atomic-reference
    title: AtomicReference (Java SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicReference.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 具有同一 compareAndSet 原子替换合同，可运行本课的纯 Java 练习。
  - id: mybatis-xml-mapper
    title: MyBatis 3 Reference - XML Mapper
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5
    claims:
      - update 映射语句可以绑定参数并由调用方读取受影响行数。
      - SQL 的 WHERE 条件可以把业务判断放在数据库的单条更新操作中。
---

# 并发更新与一致性

上一课解决了消息可能重复消费的问题，但“同一条消息只处理一次”并不等于“两个请求不会覆盖彼此的修改”。例如两个成员同时编辑同一个任务：
两人都读到 `version=7`，甲把标题改成“上线”，乙把负责人改成“林”，如果最后执行的 UPDATE 没有任何条件，甲的标题或乙的负责人就可能被静默覆盖。

本课只处理共享数据的并发写入。你会先用时间线定位丢失更新，再比较单 JVM 原子更新、数据库 version 条件更新和锁定读；最后把冲突重试、事务边界和外部副作用
放进一个可以观察的 TeamFlow 服务。课程不引入分布式锁产品、XA 或完整 JPA 映射，避免把不同一致性问题混成一个“万能锁”。

## 一、从两次读写看见丢失更新

### 1. 后提交不代表后意图

假设 `task` 表中有一行：

```sql
id | title | assignee | version
42 | 草稿  | 林       | 7
```

两个事务分别执行同一个读改写流程：

```text
事务 A                         事务 B
SELECT version=7               SELECT version=7
修改 title=上线                修改 assignee=周
UPDATE task                    UPDATE task
提交                           提交
```

如果 UPDATE 只按 `id=42` 定位，B 的整行对象可能把 A 的标题写回“草稿”，最终数据库只留下最后一次提交的快照。数据库没有违反 SQL 语法，应用却丢失了一个已经成功提交的业务意图。

### 2. 受影响行数是数据库给出的冲突信号

把读取到的版本也放进条件，更新就变成一次数据库内的比较与替换：

```sql
UPDATE task
SET title = ?, version = version + 1
WHERE id = ? AND version = ?;
```

调用方应把结果解释成三种状态：

| affected rows | 解释 | 下一步 |
| --- | --- | --- |
| `1` | 找到目标且版本仍匹配，更新成功 | 提交当前事务 |
| `0` | 目标不存在，或版本已被其他写者推进 | 重新读取并返回冲突/不存在 |
| 执行异常 | 连接、约束或 SQL 失败 | 回滚，按故障类别决定是否重试 |

`0` 不是“更新成功但没有变化”。如果 SQL 还把 `version=version+1` 写入，匹配成功必然会影响 1 行；因此不要忽略 MyBatis `update` 返回值，也不要把 0 行当成可以继续 ack 的成功。

### 3. 业务意图决定是否能够自动合并

版本冲突只说明“读取依据过期”，不会告诉应用两个修改能否合并。把标题和负责人分别作为独立列更新，应用也许可以重新读取后只重放自己的字段；如果两人修改同一标题，
就必须让调用方选择覆盖、合并或放弃。冲突检测和冲突解决是两个不同职责：前者由数据库条件完成，后者属于业务规则。

## 二、先确定并发控制的边界

### 1. 单 JVM 的 compare-and-set 不会跨进程

Java 的 `AtomicReference` 适合保护内存中的一个引用。它的 compare-and-set 只有在当前引用仍等于期望引用时才替换：

```java
import java.util.concurrent.atomic.AtomicReference;

/** 观察单 JVM 内的一次条件替换。 */
public class AtomicUpdateDemo {
    /** 执行一次成功和一次失败的 compare-and-set。 */
    public static void main(String[] args) {
        AtomicReference<String> state = new AtomicReference<>("draft");
        boolean first = state.compareAndSet("draft", "published");
        boolean second = state.compareAndSet("draft", "archived");
        System.out.println(first + " " + second + " " + state.get());
    }
}
```

输出为：

```text
true false published
```

第二次失败是因为同一 JVM 中的当前引用已经不是期望值。若应用有两个实例，每个实例各自维护一个 `AtomicReference`，它们并不知道对方的内存变化；共享数据库仍需要 version 或锁。

### 2. 三种策略的覆盖范围不同

| 策略 | 仲裁位置 | 适合场景 | 不能解决 |
| --- | --- | --- | --- |
| CAS / 原子类型 | 单 JVM 内存 | 短小的内存状态转换 | 跨进程、重启后的状态和数据库写入 |
| version 条件更新 | 数据库单条 UPDATE | 冲突较少、可以重新计算意图 | 自动合并业务字段、外部副作用 |
| `SELECT ... FOR UPDATE` | 数据库事务锁 | 热点行、必须在锁内读取并决定 | 忘记事务、锁顺序不一致和长事务 |

选择策略时先问“谁能看见这次写入”。如果写入者可能来自多个进程，不能只在服务对象上加 `synchronized`；如果冲突很少且请求可以重新读取，乐观更新通常更容易水平扩展；如果同一行几乎总是被竞争，锁定读可能减少反复失败，但要严格控制持锁时间。

## 三、用 version 条件更新发现冲突

### 1. 表结构让版本成为持久化状态

```sql
CREATE TABLE task (
    id BIGINT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    assignee VARCHAR(64) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

`version` 是数据库状态的一部分，不是只在 Java 对象中递增的计数。任何写入口都必须遵守同一个条件；如果有一条后台 SQL 绕过 `version`，应用就重新出现静默覆盖。

### 2. MyBatis Mapper 要返回 affected rows

```java
package com.example.teamflow.task;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 提供带版本条件的任务更新。 */
@Mapper
public interface TaskMapper {
    /** 只在版本仍匹配时更新标题并推进版本。 */
    @Update("UPDATE task SET title = #{title}, version = version + 1 "
            + "WHERE id = #{id} AND version = #{expectedVersion}")
    int updateTitle(
            @Param("id") long id,
            @Param("title") String title,
            @Param("expectedVersion") long expectedVersion);

    /** 读取任务的当前版本，供新的事务尝试重新计算。 */
    @Select("SELECT version FROM task WHERE id = #{id}")
    Long findVersion(@Param("id") long id);
}
```

`int` 返回值是 Mapper 与业务服务之间的重要合同。它不是 JDBC 的“提示信息”，而是并发判断的输入：1 表示条件成功，0 表示必须重新读取。使用 XML 时同样保留 `resultType` 默认的 affected rows，不要把更新方法声明成只返回 `void`。

### 3. 服务层把冲突转成稳定结果

```java
package com.example.teamflow.task;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** 表示调用方携带的版本已经过期。 */
@ResponseStatus(HttpStatus.CONFLICT)
public final class ConcurrentUpdateException extends RuntimeException {
    /** 创建带任务 ID 的并发冲突异常。 */
    public ConcurrentUpdateException(long taskId) {
        super("task version conflict: " + taskId);
    }
}
```

```java
package com.example.teamflow.task;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 负责校验版本并执行任务更新。 */
@Service
public class TaskUpdateService {
    private final TaskMapper taskMapper;

    /** 创建任务更新服务。 */
    public TaskUpdateService(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    /** 在当前事务中执行一次不可覆盖旧版本的更新。 */
    @Transactional
    public void rename(long taskId, String title, long expectedVersion) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("title is required");
        }
        int affected = taskMapper.updateTitle(taskId, title, expectedVersion);
        if (affected == 0) {
            if (taskMapper.findVersion(taskId) == null) {
                throw new TaskNotFoundException(taskId);
            }
            throw new ConcurrentUpdateException(taskId);
        }
    }
}
```

```java
package com.example.teamflow.task;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** 表示任务不存在，不能被当成版本冲突。 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public final class TaskNotFoundException extends RuntimeException {
    /** 创建带任务 ID 的不存在异常。 */
    public TaskNotFoundException(long taskId) {
        super("task not found: " + taskId);
    }
}
```

`affected=0` 时，服务在同一事务中重新读取版本：读不到行就抛出 `TaskNotFoundException`（HTTP 404），读到行才抛出 `ConcurrentUpdateException`（HTTP 409）。两个异常上的 `@ResponseStatus` 让控制器保持 204 成功路径，同时给冲突和不存在返回稳定状态；不能把 0 行改成 200，也不能在没有重新读取的情况下再次提交同一组旧参数。

### 4. 版本条件不是完整的业务校验

`WHERE id=? AND version=?` 只证明这行仍是你读到的版本。库存不能为负、状态只能从 `READY` 到 `DONE` 等规则仍应写入同一条 SQL 条件或在同一事务中校验：

```sql
UPDATE inventory
SET available = available - 1,
    version = version + 1
WHERE sku = ?
  AND version = ?
  AND available > 0;
```

这里的 0 行可能同时表示版本冲突或库存不足。若客户端需要区分两种提示，服务应在事务中重新读取当前行后再决定返回 `409` 还是“库存不足”，不能只凭 affected rows 猜原因。

## 四、用锁定读保护读改写事务

### 1. `FOR UPDATE` 锁住的是事务内的后续窗口

```sql
START TRANSACTION;
SELECT available FROM inventory WHERE sku = ? FOR UPDATE;
UPDATE inventory SET available = available - 1 WHERE sku = ?;
COMMIT;
```

InnoDB 会锁定搜索遇到的索引记录，其他事务对这些记录的更新通常需要等待。锁在提交或回滚时释放，因此事务必须尽量短：不要在持锁期间调用远程 HTTP、等待用户输入或执行大批量无关查询。

`FOR UPDATE` 不是给普通 SELECT 加一层永久保护。自动提交开启时，SELECT 执行完语句就结束事务，锁无法覆盖后续独立 UPDATE；Spring 的 `@Transactional` 或显式 JDBC 事务必须包住完整读改写流程。

### 2. MyBatis 查询和更新必须共享同一事务

```java
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 提供锁定读库存的 Mapper。 */
@Mapper
public interface InventoryMapper {
    /** 在当前事务中读取并锁定库存行。 */
    @Select("SELECT available FROM inventory WHERE sku = #{sku} FOR UPDATE")
    Integer findAvailableForUpdate(@Param("sku") String sku);

    /** 扣减已经锁定的库存行。 */
    @Update("UPDATE inventory SET available = available - 1 WHERE sku = #{sku}")
    int decrement(@Param("sku") String sku);
}
```

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 以锁定读完成一次库存扣减。 */
@Service
public class InventoryService {
    private final InventoryMapper inventoryMapper;

    /** 创建库存服务。 */
    public InventoryService(InventoryMapper inventoryMapper) {
        this.inventoryMapper = inventoryMapper;
    }

    /** 在一个短事务中读取、校验并扣减库存。 */
    @Transactional
    public void reserve(String sku) {
        Integer available = inventoryMapper.findAvailableForUpdate(sku);
        if (available == null) {
            throw new IllegalArgumentException("sku not found: " + sku);
        }
        if (available <= 0) {
            throw new IllegalStateException("out of stock: " + sku);
        }
        if (inventoryMapper.decrement(sku) != 1) {
            throw new IllegalStateException("inventory update failed: " + sku);
        }
    }
}
```

锁定读和更新使用同一事务连接时，第二个 `reserve` 会在第一笔提交后读取最新库存。若两个服务方法分别开启事务，锁在第一次方法返回时已经释放，代码看似使用 `FOR UPDATE`，实际仍存在读改写窗口。

### 3. 锁顺序和事务时间决定死锁风险

事务 A 先锁 `task=1` 再锁 `task=2`，事务 B 先锁 `task=2` 再锁 `task=1`，就可能互相等待。数据库会选择一个事务回滚并报告死锁；这是可恢复的并发结果，不应通过无限重试掩盖。

工程上应让批量操作按稳定的主键顺序取得锁，缩短事务，记录死锁异常和事务标识，并为重试设置很小的上限。不能为了“避免冲突”把所有请求改为串行全表锁，那会让吞吐和故障恢复都不可控。

## 五、隔离级别与冲突重试各自负责什么

### 1. 隔离级别是读写可见性合同

InnoDB 支持四个标准隔离级别，默认是 `REPEATABLE READ`：

| 级别 | 主要保证 | 仍需应用处理 |
| --- | --- | --- |
| READ UNCOMMITTED | 可以读到未提交变化 | 脏读、非重复读和业务覆盖 |
| READ COMMITTED | 普通读只看到已提交变化 | 同一事务两次读可能不同，写冲突仍需条件或锁 |
| REPEATABLE READ | 同一事务普通读保持快照一致 | 业务状态转换、热点写和外部副作用 |
| SERIALIZABLE | 对范围读施加更严格的串行化约束 | 吞吐下降、等待、死锁和业务冲突决定 |

隔离级别不会替代 version 条件。即使使用 `SERIALIZABLE`，服务仍需判断“状态是否允许迁移”和“库存是否足够”；即使使用默认级别，单条条件 UPDATE 也能明确发现旧版本。

### 2. 冲突重试必须重新开启事务

一次乐观重试的正确时间线是：

```text
事务 1：读取 version=7 -> UPDATE 0 行 -> 回滚并结束
事务 2：重新读取 version=8 -> 重新计算业务意图 -> UPDATE 1 行 -> 提交
```

失败事务可能已经被数据库标记为 rollback-only，持久化上下文也可能保留旧对象。把循环写在同一个 `@Transactional` 方法中，捕获异常后继续调用 Mapper，往往仍使用旧快照，甚至在方法结束时抛出意外回滚。

可以让外层方法控制次数，内层方法每次开一笔独立事务：

```java
package com.example.teamflow.task;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** 演示有界的独立事务重试边界。 */
@Service
public class RetryingTaskUpdateService {
    private final TaskUpdateAttempt attempt;

    /** 创建重试服务。 */
    public RetryingTaskUpdateService(TaskUpdateAttempt attempt) {
        this.attempt = attempt;
    }

    /** 最多执行三笔独立事务，冲突耗尽后交给调用方。 */
    public void renameWithRetry(long taskId, String title, long expectedVersion) {
        long version = expectedVersion;
        for (int attemptNumber = 1; attemptNumber <= 3; attemptNumber++) {
            try {
                attempt.rename(taskId, title, version);
                return;
            } catch (ConcurrentUpdateException conflict) {
                if (attemptNumber == 3) {
                    throw conflict;
                }
                version = attempt.readCurrentVersion(taskId);
            }
        }
    }

    /** 为每次尝试建立独立事务，避免复用失败事务。 */
    @Service
    public static class TaskUpdateAttempt {
        private final TaskMapper taskMapper;

        /** 创建一次更新尝试。 */
        public TaskUpdateAttempt(TaskMapper taskMapper) {
            this.taskMapper = taskMapper;
        }

        /** 在独立事务中执行一次带版本的更新。 */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void rename(long taskId, String title, long expectedVersion) {
            int affected = taskMapper.updateTitle(taskId, title, expectedVersion);
            if (affected == 0) {
                if (taskMapper.findVersion(taskId) == null) {
                    throw new TaskNotFoundException(taskId);
                }
                throw new ConcurrentUpdateException(taskId);
            }
        }

        /** 读取数据库中的最新版本。 */
        @Transactional(readOnly = true)
        public long readCurrentVersion(long taskId) {
            Long currentVersion = taskMapper.findVersion(taskId);
            if (currentVersion == null) {
                throw new TaskNotFoundException(taskId);
            }
            return currentVersion;
        }
    }
}
```

示例用于说明事务边界，`findVersion` 代表一个返回当前版本的查询 Mapper。真实系统应在每次重试前重新读取足以决定业务的完整数据，而不是只替换一个数字。

### 3. 只重试可恢复的冲突

| 结果 | 是否自动重试 | 原因 |
| --- | --- | --- |
| version 冲突 | 可以，有次数上限 | 重新读取后业务意图仍可能成立 |
| 死锁/瞬时连接故障 | 可以，小次数退避 | 当前事务已回滚，需要全新事务 |
| 参数无效、无权限、库存不足 | 不应重试 | 重试不会改变业务事实 |
| 目标不存在 | 不应盲目重试 | 应返回明确的不存在结果 |

固定无延迟的重试会把热点行变成更大的热点。每次冲突至少记录实体 ID、旧版本、新版本、尝试次数和最终结果；退避时间和上限应由系统负载验证，不在本课虚构一个对所有服务都适用的毫秒数。

### 4. 本地提交不包含远端副作用

```text
数据库事务：UPDATE task ... COMMIT
                         |
                         +-- HTTP 通知 / 消息发布（另一个系统）
```

`@Transactional` 只管理配置的本地事务资源。数据库提交后 HTTP 可能超时，或者消息发布成功后进程在记录发送结果前崩溃；数据库不会自动回滚远端已经观察到的动作。外部动作要使用幂等键、可重试协议或上一课的可靠消费合同，不能把“本地更新成功”直接记录为“通知已送达”。

## 六、完整 Spring Boot 工程：让两个写者产生可解释结果

### 1. 两条版本线只替换工程依赖

现代工程使用 JDK 25、Spring Boot 4.1.1 和 MyBatis Spring Boot Starter 4.1.0：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.1</version>
</parent>
  <groupId>com.example</groupId>
  <artifactId>concurrent-update-demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
<properties>
  <java.version>25</java.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
  </dependency>
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

兼容工程使用同一 Java 8 控制流，但依赖入口独立：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.3.12.RELEASE</version>
</parent>
  <groupId>com.example</groupId>
  <artifactId>concurrent-update-demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
<properties>
  <java.version>1.8</java.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
  </dependency>
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

两条工程都应把 Project SDK、模块 SDK、Maven Runner JRE 和 POM 目标设为同一条版本线，再 Reload Maven。不要用现代工程的 `--release 8` 代替真正的 Java 8 工程启动。

### 2. 配置数据库与 Mapper 扫描

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/teamflow?useSSL=false&serverTimezone=UTC
    username: ${TEAMFLOW_DB_USER}
    password: ${TEAMFLOW_DB_PASSWORD}
mybatis:
  mapper-locations: classpath:/mapper/*.xml
  type-aliases-package: com.example.teamflow.task
```

```java
package com.example.teamflow;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动并发更新示例应用。 */
@SpringBootApplication
@MapperScan("com.example.teamflow.task")
public class ConcurrentUpdateApplication {
    /** 启动 Spring Boot 上下文。 */
    public static void main(String[] args) {
        SpringApplication.run(ConcurrentUpdateApplication.class, args);
    }
}
```

不要把账号密码写进仓库。启动失败时先确认环境变量、数据库连接和表结构，再判断 Mapper；不要为了绕过连接问题把并发结果改成内存变量。

### 3. 给客户端返回版本并把冲突映射成 409

```java
package com.example.teamflow.task;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** 接收带版本的任务修改请求。 */
@RestController
public class TaskController {
    private final TaskUpdateService taskUpdateService;

    /** 创建任务控制器。 */
    public TaskController(TaskUpdateService taskUpdateService) {
        this.taskUpdateService = taskUpdateService;
    }

    /** 使用请求中的 expectedVersion 执行一次更新。 */
    @PatchMapping("/api/tasks/{id}/title")
    public ResponseEntity<Void> rename(
            @PathVariable long id, @RequestBody RenameTaskRequest request) {
        taskUpdateService.rename(id, request.title(), request.expectedVersion());
        return ResponseEntity.noContent().build();
    }

    /** 表示标题和客户端读取到的版本。 */
    public record RenameTaskRequest(String title, long expectedVersion) {}
}
```

JDK 25 可以使用 record；如果该控制器要编译在 Java 8 兼容工程中，把请求对象改成带 `private final` 字段、构造器和读取方法的普通类，服务的 version 合同不变。控制器不应从请求头自行“刷新”版本，也不应在 409 后隐式覆盖其他人的修改。

Java 8 兼容线使用下面的 DTO，并把控制器中的 `request.title()`、`request.expectedVersion()` 替换成 `request.getTitle()`、`request.getExpectedVersion()`：

```java
package com.example.teamflow.task;

/** Java 8 兼容的任务重命名请求对象。 */
public final class RenameTaskRequest {
    private final String title;
    private final long expectedVersion;

    /** 创建任务重命名请求。 */
    public RenameTaskRequest(String title, long expectedVersion) {
        this.title = title;
        this.expectedVersion = expectedVersion;
    }

    /** 返回标题。 */
    public String getTitle() {
        return title;
    }

    /** 返回客户端读取到的版本。 */
    public long getExpectedVersion() {
        return expectedVersion;
    }
}
```

### 4. 用两个请求复现冲突

先读取任务，假定响应包含 `version=7`，再从两个终端几乎同时发送：

```bash
curl -X PATCH http://localhost:8080/api/tasks/42/title \
  -H 'Content-Type: application/json' \
  -d '{"title":"上线","expectedVersion":7}'

curl -X PATCH http://localhost:8080/api/tasks/42/title \
  -H 'Content-Type: application/json' \
  -d '{"title":"归档","expectedVersion":7}'
```

预期一个请求得到 `204`，另一个得到 `409`；数据库的 `version` 从 7 变为 8，标题只被成功请求写入一次。日志至少记录 taskId、expectedVersion、actualVersion（若已重新读取）、attempt 和 outcome，不打印数据库密码或完整授权头。

## 七、集中排查五个一致性错误

:::pitfalls
### 让后提交者无条件覆盖整行

**触发条件：** 先 SELECT，再执行 `UPDATE task SET title=?, assignee=? WHERE id=?`，没有携带读取到的版本。

**原因：** 数据库只按主键定位，无法知道当前对象来自哪个快照。

**后果：** 两个合法修改中较早提交的字段可能被静默覆盖，日志却显示两次请求都成功。

**错误示例：**

```sql
UPDATE task SET title = ?, assignee = ? WHERE id = ?;
```

**正确写法：**

```sql
UPDATE task
SET title = ?, assignee = ?, version = version + 1
WHERE id = ? AND version = ?;
```

**验证方式：** 两个写者都携带 `version=7`，断言最多一个 UPDATE 影响 1 行，另一个影响 0 行且返回冲突。

### 忽略 Mapper 的 0 行结果

**触发条件：** 更新方法返回 0 仍继续返回 204，或继续发送“更新成功”消息。

**原因：** 0 行是版本不匹配或目标不存在的唯一可观察信号，void 返回值把它丢掉了。

**后果：** 客户端以为修改已保存，后续读取却发现旧数据；外部副作用还可能与未提交的业务状态不一致。

**错误示例：**

```java
taskMapper.updateTitle(id, title, expectedVersion);
return ResponseEntity.noContent().build();
```

**正确写法：**

```java
int affected = taskMapper.updateTitle(id, title, expectedVersion);
if (affected == 0) {
    throw new ConcurrentUpdateException(id);
}
return ResponseEntity.noContent().build();
```

**验证方式：** 使用过期版本请求，确认响应为 409、数据库版本不再推进，且没有发布成功通知。

### 把 FOR UPDATE 放在自动提交的独立查询里

**触发条件：** 先调用一个查询方法执行 `SELECT ... FOR UPDATE`，返回后再由另一个事务执行 UPDATE。

**原因：** 自动提交让锁定读语句立即结束事务，锁不能覆盖后续业务判断。

**后果：** 代码看似加锁，两个请求仍可同时读到相同库存并产生错误结果。

**错误示例：**

```java
Integer available = inventoryMapper.findAvailableForUpdate(sku);
// 查询方法已经返回，锁可能已经释放
inventoryMapper.decrement(sku);
```

**正确写法：**

```java
@Transactional
public void reserve(String sku) {
    Integer available = inventoryMapper.findAvailableForUpdate(sku);
    if (available == null || available <= 0) {
        throw new IllegalStateException("not reservable");
    }
    inventoryMapper.decrement(sku);
}
```

**验证方式：** 并发扣减只有一笔可以把库存从 1 变为 0，另一笔等待后读取到 0 并返回库存不足。

### 在失败事务里继续复用旧对象重试

**触发条件：** 捕获 `ConcurrentUpdateException` 后在同一个 `@Transactional` 方法中再次调用 update，仍传入旧版本。

**原因：** 失败事务需要回滚，旧对象和旧版本不代表数据库当前状态。

**后果：** 重试持续得到 0 行，或者方法结束时触发意外回滚；无界循环还会放大数据库压力。

**错误示例：**

```java
@Transactional
public void retry(long id, String title, long version) {
    for (;;) {
        try {
            update(id, title, version);
            return;
        } catch (ConcurrentUpdateException conflict) {
            // 继续使用同一个失败事务和旧 version
        }
    }
}
```

**正确写法：**

```java
for (int attempt = 1; attempt <= 3; attempt++) {
    try {
        updateInNewTransaction(id, title, readCurrentVersion(id));
        return;
    } catch (ConcurrentUpdateException conflict) {
        if (attempt == 3) {
            throw conflict;
        }
    }
}
```

**验证方式：** 让另一个写者持续推进版本，确认本请求最多执行 3 次独立尝试并最终返回冲突，不出现无限 SQL 日志。

### 把本地事务当成远程调用的事务

**触发条件：** 数据库 UPDATE 成功后直接调用 HTTP，并在 HTTP 超时后把数据库状态回滚当成必然结果。

**原因：** Spring 本地事务只管理已配置的数据库资源，远端服务不加入同一提交协议。

**后果：** 远端可能已经处理成功而本地回滚，或本地已提交而远端未收到；状态和副作用无法靠一次 rollback 对齐。

**错误示例：**

```java
@Transactional
public void renameAndNotify(Task task) {
    taskMapper.updateTitle(task.id(), task.title(), task.version());
    httpClient.post("/notifications", task.id());
}
```

**正确写法：**

```java
@Transactional
public void rename(Task task) {
    taskMapper.updateTitle(task.id(), task.title(), task.version());
    notificationOutbox.record(task.id(), task.version() + 1);
}
```

**验证方式：** 让通知端超时，确认任务更新和 outbox 记录仍在同一数据库事务中提交，后续发送器可按幂等键重试。
:::

## 八、练习：模拟两个写者的版本仲裁

:::exercise
### 用 Java 8 标准库复现一次成功和一次冲突

**要求：** 创建一个不连接数据库的 `VersionedTaskExercise`，使用 `AtomicReference<TaskState>` 保存 `id`、`title` 和 `version`。启动两个线程，各自读取同一个旧快照并通过 `compareAndSet` 提交修改；成功者只能推进一次 version，失败者输出 `conflict`，不得用 `synchronized` 或无限重试掩盖冲突。代码必须在 Java 8 语法下可编译，并能在 JDK 25 运行。

**验收：**
```text
successes=1 conflicts=1 finalVersion=1
```
:::

### 参考实现

```java
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/** 模拟数据库 version 条件更新的内存练习。 */
public class VersionedTaskExercise {
    /** 表示一次不可变的任务快照。 */
    private static final class TaskState {
        private final long id;
        private final String title;
        private final long version;

        /** 创建任务快照。 */
        private TaskState(long id, String title, long version) {
            this.id = id;
            this.title = title;
            this.version = version;
        }
    }

    /** 执行两个写者的单次条件更新。 */
    public static void main(String[] args) throws InterruptedException {
        AtomicReference<TaskState> state = new AtomicReference<>(
                new TaskState(42L, "草稿", 0L));
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger conflicts = new AtomicInteger();
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch snapshotsReady = new CountDownLatch(2);
        CountDownLatch commit = new CountDownLatch(1);
        Thread first = writer(state, successes, conflicts, start, snapshotsReady, commit, "上线");
        Thread second = writer(state, successes, conflicts, start, snapshotsReady, commit, "归档");
        first.start();
        second.start();
        start.countDown();
        snapshotsReady.await();
        commit.countDown();
        first.join();
        second.join();
        System.out.println("successes=" + successes.get()
                + " conflicts=" + conflicts.get()
                + " finalVersion=" + state.get().version);
    }

    /** 创建一个读取旧快照后只尝试一次 CAS 的写者。 */
    private static Thread writer(
            AtomicReference<TaskState> state,
            AtomicInteger successes,
            AtomicInteger conflicts,
            CountDownLatch start,
            CountDownLatch snapshotsReady,
            CountDownLatch commit,
            String title) {
        return new Thread(() -> {
            try {
                start.await();
                TaskState expected = state.get();
                TaskState replacement = new TaskState(
                        expected.id, title, expected.version + 1L);
                snapshotsReady.countDown();
                commit.await();
                if (state.compareAndSet(expected, replacement)) {
                    successes.incrementAndGet();
                } else {
                    conflicts.incrementAndGet();
                }
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("writer interrupted", interrupted);
            }
        });
    }
}
```

运行结果固定满足 `successes=1`、`conflicts=1`、`finalVersion=1`，但最终标题可能是“上线”或“归档”，因为两个线程谁先 CAS 成功是不确定的。这里验证的是版本仲裁和状态不变量，不应把线程调度顺序当作业务结果。

Java 8 与 JDK 25 都可以直接编译这份练习：

```bash
javac -Xlint:all -Werror VersionedTaskExercise.java
java VersionedTaskExercise
```

在真正的数据库实现中，`compareAndSet` 对应 `UPDATE ... WHERE version=?`，`conflicts=1` 对应 affected rows 为 0。跨进程时不要把这份内存 fixture 当成数据库锁的证明。

本课的判断顺序应固定为：先确认数据边界，再选择单 JVM 原子更新、version 条件或事务锁；每次写入检查 affected rows；冲突只按有界次数重新读取；本地事务与外部副作用分别观察。这样“最终一致”不再是模糊口号，而是每个边界都有可验证的状态和失败结果。
