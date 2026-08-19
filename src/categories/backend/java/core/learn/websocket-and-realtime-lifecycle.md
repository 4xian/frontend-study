---
id: backend.java.learn.advanced.websocket-and-realtime-lifecycle
type: lesson
title: WebSocket 会话、广播、心跳与回收
summary: 把握手、会话、逐连接发送、心跳与幂等回收组织成可验证的实时连接生命周期
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能区分 HTTP Upgrade、OPEN、CLOSING 与 CLOSED，并为每个状态规定允许动作。
  - 能用单 JVM registry 管理房间成员，同时解释弱一致遍历和逐目标广播结果。
  - 能为每个 Session 串行化发送、限制队列，并隔离慢客户端和失败客户端。
  - 能区分 Ping、Pong、idle timeout 与业务确认，并用可取消任务做活性检查。
  - 能使用正确关闭码、消息上限、Origin 与逐消息授权，并让所有终止路径幂等回收。
prerequisites:
  - backend.java.learn.advanced.concurrency-locks-and-shared-state
  - backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries
related: []
tags:
  - Java
  - WebSocket
  - RFC 6455
  - Jakarta WebSocket
  - WebSocketSession
  - 广播
  - Ping
  - Pong
  - 背压
  - 幂等回收
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Jakarta WebSocket 2.2 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / javax.websocket
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  jakartaWebSocket: 2.2.0
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  webSocketNamespace: javax.websocket
verifiedAt: 2026-08-10
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java 25 LTS
    claims:
      - Oracle 支持路线将 Java 25 列为 LTS
  - id: boot41-system-requirements
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 4.1.0 支持 Java 25 并要求 Spring Framework 7.0.8
  - id: rfc6455-opening-handshake
    title: RFC 6455 Section 4 - Opening Handshake
    url: https://www.rfc-editor.org/rfc/rfc6455.html#section-4
    sourceType: specification
    appliesTo: RFC 6455
    claims:
      - Upgrade 请求、101 响应、Sec-WebSocket-Accept 与 Origin 的协议合同
  - id: rfc6455-data-framing
    title: RFC 6455 Section 5 - Data Framing
    url: https://www.rfc-editor.org/rfc/rfc6455.html#section-5
    sourceType: specification
    appliesTo: RFC 6455
    claims:
      - 数据分片以及 Close、Ping、Pong 控制帧合同
  - id: rfc6455-closing-status-codes
    title: RFC 6455 Section 7 - Closing the Connection
    url: https://www.rfc-editor.org/rfc/rfc6455.html#section-7
    sourceType: specification
    appliesTo: RFC 6455
    claims:
      - Close handshake、关闭码语义与不能写入 wire 的保留值
  - id: jakarta-websocket22-release
    title: Jakarta WebSocket 2.2 Release
    url: https://jakarta.ee/specifications/websocket/2.2/
    sourceType: release-note
    appliesTo: Jakarta WebSocket 2.2 / API 2.2.0
    claims:
      - Jakarta WebSocket 2.2 的版本、Java 基线和 Maven 坐标
  - id: jakarta-websocket22-spec
    title: Jakarta WebSocket Specification 2.2
    url: https://jakarta.ee/specifications/websocket/2.2/jakarta-websocket-spec-2.2
    sourceType: specification
    appliesTo: Jakarta WebSocket 2.2
    claims:
      - endpoint 实例、回调并发、分片顺序和 javax 到 jakarta 的迁移合同
  - id: jakarta-websocket22-session
    title: Jakarta WebSocket 2.2 Session API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/session
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - Session 开放状态、关闭、idle timeout、缓冲上限与开放会话快照
  - id: jakarta-websocket22-endpoint
    title: Jakarta WebSocket 2.2 Endpoint API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/endpoint
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - onOpen、onClose、onError 与消息 handler 的生命周期
  - id: jakarta-websocket22-on-message
    title: Jakarta WebSocket 2.2 OnMessage API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/onmessage
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - whole、partial、stream、Pong 与 maxMessageSize 合同
  - id: jakarta-websocket22-basic-remote
    title: Jakarta WebSocket 2.2 RemoteEndpoint.Basic API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/remoteendpoint.basic
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - Basic 发送会阻塞且同一连接的重叠发送不受支持
  - id: jakarta-websocket22-async-remote
    title: Jakarta WebSocket 2.2 RemoteEndpoint.Async API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/remoteendpoint.async
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - Async 完成回调、发送 timeout 与非业务确认边界
  - id: jakarta-websocket22-close-codes
    title: Jakarta WebSocket 2.2 CloseReason.CloseCodes API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/closereason.closecodes
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - TOO_BIG、UNEXPECTED_CONDITION 与保留关闭码映射
  - id: jakarta-websocket22-server-configurator
    title: Jakarta WebSocket 2.2 ServerEndpointConfig.Configurator API
    url: https://jakarta.ee/specifications/websocket/2.2/apidocs/server/jakarta/websocket/server/serverendpointconfig.configurator
    sourceType: api-doc
    appliesTo: Jakarta WebSocket API 2.2.0
    claims:
      - checkOrigin、endpoint 实例创建与每 Session 握手属性边界
  - id: spring7-websocket-server-reference
    title: Spring Framework WebSocket API - Server
    url: https://docs.spring.io/spring-framework/reference/web/websocket/server.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8 current reference at verification
    claims:
      - HTTP handshake、标准容器配置与原生 WebSocketHandler 发送边界
  - id: spring708-websocket-handler
    title: Spring Framework 7.0.8 WebSocketHandler API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/WebSocketHandler.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 建连、消息、transport error、关闭回调及幂等清理要求
  - id: spring708-websocket-session
    title: Spring Framework 7.0.8 WebSocketSession API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/WebSocketSession.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - sendMessage 串行化、isOpen、关闭状态、Principal 与消息上限
  - id: spring708-concurrent-session-decorator
    title: Spring Framework 7.0.8 ConcurrentWebSocketSessionDecorator API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/handler/ConcurrentWebSocketSessionDecorator.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 单 Session 串行发送、send-time 与 buffer-size limit 及溢出策略
  - id: spring708-servlet-server-container
    title: Spring Framework 7.0.8 ServletServerContainerFactoryBean API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/server/standard/ServletServerContainerFactoryBean.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - async send、idle、文本和二进制缓冲上限配置
  - id: spring708-exception-handler-decorator
    title: Spring Framework 7.0.8 ExceptionWebSocketHandlerDecorator API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/handler/ExceptionWebSocketHandlerDecorator.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 未处理 handler 异常以 1011 关闭及异常观测边界
  - id: spring708-standard-client-source
    title: Spring Framework v7.0.8 StandardWebSocketClient Source
    url: https://github.com/spring-projects/spring-framework/blob/v7.0.8/spring-websocket/src/main/java/org/springframework/web/socket/client/standard/StandardWebSocketClient.java
    sourceType: source-code
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring 7 标准适配使用 jakarta.websocket 包
  - id: java25-concurrent-hash-map
    title: Java SE 25 ConcurrentHashMap API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 每 key happens-before、弱一致遍历与非原子聚合视图
  - id: java8-concurrent-hash-map
    title: Java SE 8 ConcurrentHashMap API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 可构建单 JVM registry，但不提供原子广播和自动回收
  - id: java25-array-blocking-queue
    title: Java SE 25 ArrayBlockingQueue API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 固定容量、offer 拒绝与 put 阻塞合同
  - id: java8-array-blocking-queue
    title: Java SE 8 ArrayBlockingQueue API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ArrayBlockingQueue.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 具有相同有界队列合同且不应在 I/O 回调无限等待
  - id: java25-scheduled-executor-service
    title: Java SE 25 ScheduledExecutorService API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 周期任务语义、异常抑制后续执行、取消与 shutdown
  - id: java8-scheduled-executor-service
    title: Java SE 8 ScheduledExecutorService API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ScheduledExecutorService.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 具有相同周期执行和资源关闭合同
  - id: java25-http-websocket
    title: Java SE 25 java.net.http.WebSocket API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/WebSocket.html
    sourceType: api-doc
    appliesTo: Java 25 client API, since Java 11
    claims:
      - 标准客户端的异步发送、输入输出关闭和 request 需求计数
  - id: java25-http-websocket-listener
    title: Java SE 25 WebSocket.Listener API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/WebSocket.Listener.html
    sourceType: api-doc
    appliesTo: Java 25 client API, since Java 11
    claims:
      - Listener 回调顺序、非重入、共享并发和回调需求边界
  - id: openjdk-jep321-http-client
    title: JEP 321 - HTTP Client Standard
    url: https://openjdk.org/jeps/321
    sourceType: official-reference
    appliesTo: Java 11 introduction
    claims:
      - java.net.http WebSocket 客户端在 Java 11 标准化
  - id: javaee7-javax-websocket-package
    title: Java EE 7 javax.websocket Package API
    url: https://docs.oracle.com/javaee/7/api/javax/websocket/package-summary.html
    sourceType: api-doc
    appliesTo: Java EE 7 / JSR 356 legacy namespace
    claims:
      - legacy endpoint、Session 与 RemoteEndpoint 位于 javax.websocket 且不属于 Java SE 8
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 需要 Java 8 并要求 Spring Framework 5.2.15
  - id: spring5215-websocket-reference
    title: Spring Framework 5.2.15 WebSocket Reference
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#websocket
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy 原生 WebSocketHandler、handshake、缓冲与 idle timeout
  - id: spring5215-websocket-session
    title: Spring Framework 5.2.15 WebSocketSession API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/WebSocketSession.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy sendMessage 串行化、isOpen、Principal 与输入消息上限
  - id: spring5215-concurrent-session-decorator
    title: Spring Framework 5.2.15 ConcurrentWebSocketSessionDecorator API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/handler/ConcurrentWebSocketSessionDecorator.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy 已有 send-time、buffer-size limit 和 overflow strategy
  - id: spring5215-servlet-server-container
    title: Spring Framework 5.2.15 ServletServerContainerFactoryBean API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/server/standard/ServletServerContainerFactoryBean.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy 可配置 async send、idle、文本和二进制缓冲上限
  - id: spring5215-standard-client-source
    title: Spring Framework v5.2.15 StandardWebSocketClient Source
    url: https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-websocket/src/main/java/org/springframework/web/socket/client/standard/StandardWebSocketClient.java
    sourceType: source-code
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Spring 5.2.15 标准适配使用 javax.websocket 包
  - id: owasp-websocket-security
    title: OWASP WebSocket Security Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: WebSocket applications, living document
    claims:
      - WSS、Origin、CSWSH、逐消息授权、限制与安全日志边界
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java
    symbol: com.tdh.bdzz.config.websocket.DzzzEndpointConfigure
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java
    symbol: com.tdh.bdzz.config.websocket.WebSocketConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.ClientZzWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.BlOperationWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.Voice2TextWsServer
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer
    usage: rejected
---

# WebSocket 会话、广播、心跳与回收

## 为什么需要学习

普通 HTTP 请求通常在一次响应后结束；WebSocket 把连接保留数分钟或数小时。连接一旦长期存在，应用就要
同时管理协议状态、用户身份、房间成员、逐连接发送队列、心跳任务和关闭资源。只会在 `Map` 中保存
`Session`，无法回答慢客户端会怎样、重复关闭会不会减两次计数、进程停止后线程是否仍存活。

本课把实时通信当作一个生命周期问题。主线先建立协议和所有权，再实现单 JVM、可观测、可回收的最小
房间广播；可靠消息、STOMP、SockJS、跨节点 broker 与数据库分片不在本课范围。

## 学习目标

- 能画出从 HTTP handshake 到 CLOSED 的状态图。
- 能解释 registry 结构安全与广播原子性是两件事。
- 能为每条连接选择有界队列、串行发送和明确溢出策略。
- 能用匹配的 Ping/Pong、deadline 和可取消任务判断活性。
- 能让 close、error、send failure、idle 与 shutdown 汇入同一幂等回收入口。

## 前置术语

- **frame：** RFC 6455 的传输片段；一条应用消息可以由多个 frame 组成。
- **Session：** 一条已建立 WebSocket 连接在服务端的 API 句柄。
- **registry：** 应用维护的会话索引，例如房间 ID 到连接集合。
- **backpressure：** 下游消费更慢时，系统限制待发送数据并明确拒绝或降级的办法。
- **wire close code：** 双方在 Close frame 中交换的协议状态码；部分本地观察值不能发送到网络。

## 零基础知识点详解

### HTTP Upgrade 是连接准入边界

**它是什么：** 客户端先发送带 `Upgrade: websocket` 的 HTTP GET；服务端只有接受并返回 101 后才进入
WebSocket 协议。

**有什么作用：** 认证、Origin、路径、版本和子协议可以在业务 Session 建立前被拒绝。

**什么时候使用：** 每次建连都执行；拒绝时返回 HTTP 状态，不写入业务 registry。

**怎么使用：**

1. 先验证 TLS、认证信息、精确 Origin allowlist 和目标资源。
2. 再协商版本、子协议与扩展。
3. 只有 open 回调成功后才注册连接级资源。

**最小示例：** `if (!originPolicy.accept(origin)) return HTTP_403;` 表示仍在 HTTP 边界拒绝。

**运行结果：** 被拒绝请求没有业务 Session；被接受请求得到 101 并进入 open 回调。

**常见误区：** `Sec-WebSocket-Accept` 只证明握手计算正确，不证明用户拥有后续消息权限。

### Session 必须经过明确状态

**它是什么：** 一条连接至少经历 `HANDSHAKE -> OPEN -> CLOSING -> CLOSED`。

**有什么作用：** 每个入口可以先判断允许动作，避免 Close 后继续入队或发送。

**什么时候使用：** open、message、send completion、error、close、idle scan 与应用停止都要读取或推进状态。

**怎么使用：**

1. open 成功后一次性创建连接 owner。
2. 开始关闭时拒绝新消息并发出合法 Close。
3. CLOSED 阶段只允许幂等清理和观测。

**最小示例：**

```java
enum ConnectionPhase {
    HANDSHAKE, OPEN, CLOSING, CLOSED
}
```

**运行结果：** CLOSED 连接不会重新变成 OPEN，重复终止只得到“已处理”。

**常见误区：** `isOpen()` 是瞬时观察，不承诺检查后的下一次发送一定成功。

### Endpoint 回调保证有明确范围

**它是什么：** Jakarta 默认让一个 peer 对应一个 endpoint 实例，并串行调用同一 peer 的 endpoint 回调。

**有什么作用：** 单连接回调通常不用为容器自身重入加锁。

**什么时候使用：** 判断共享状态前先问“这个对象是否跨 Session、scheduler 或广播线程共享”。

**怎么使用：**

1. 把单连接状态放进连接 owner。
2. 把房间 registry 当共享并发状态设计。
3. 不让 Configurator 返回一个跨连接共享的可变 endpoint。

**最小示例：** `ConcurrentMap<String, Peer> peers` 是共享状态；一个 endpoint 字段不是全局事实。

**运行结果：** 容器回调与应用广播线程同时工作时，registry 仍由并发合同保护。

**常见误区：** “同一 endpoint 不并发”不能扩展成“整个应用所有 WebSocket 代码不并发”。

### Registry 只负责定位和所有权

**它是什么：** registry 把房间和 Session ID 映射到连接 owner，而不是把网络发送藏进一个全局锁。

**有什么作用：** open、broadcast、close 和 shutdown 能找到同一个 owner，并在空房间时移除 key。

**什么时候使用：** 单 JVM 内需要房间、用户或租户索引时使用；跨 JVM 需另行设计路由和消息传播。

**怎么使用：**

1. 使用稳定、受限长度的 room ID 和 session ID。
2. `computeIfAbsent` 创建房间集合。
3. close 时 `computeIfPresent` 删除成员并在空时返回 `null`。

**最小示例：**

```java
rooms.computeIfPresent(roomId, (key, peers) -> {
    peers.remove(sessionId);
    return peers.isEmpty() ? null : peers;
});
```

**运行结果：** 最后一个成员关闭后房间 key 同时消失。

**常见误区：** `ConcurrentHashMap` 的弱一致遍历不是“广播开始时全体成员”的原子快照。

### 同一 Session 的发送必须串行化

**它是什么：** Basic 发送和 Spring `sendMessage` 不支持同一底层连接被多个线程同时发送。

**有什么作用：** 保持消息边界与顺序，避免重叠发送异常。

**什么时候使用：** 广播线程、业务回调和心跳都可能向同一 Session 发送时使用。

**怎么使用：**

1. 为每个 Session 建立独立发送器。
2. 每次只允许一个远端 send 在途。
3. 完成或失败回调再推动下一条。

**最小示例：** `AtomicBoolean draining` 只属于单个 peer，不能替换成所有客户端共用的锁。

**运行结果：** 同一连接消息顺序稳定，不同连接之间互不等待。

**常见误区：** 一个全局 `synchronized` 虽能消除重叠，却会让最慢客户端阻塞所有人。

### 广播返回逐目标结果

**它是什么：** 广播是对成员逐个入队并收集 accepted、rejected、failed 的过程，不是协议原子操作。

**有什么作用：** 一个连接失败时仍能看到其他目标的结果，并只清理失败目标。

**什么时候使用：** 房间推送、状态更新和服务通知都应使用 per-session outcome。

**怎么使用：**

1. 在不持有 registry 锁时取得成员视图。
2. 对每个 peer 调用其发送器。
3. 分别记录入队、溢出、完成、timeout 与关闭。

**最小示例：**

```java
for (Peer peer : peers.values()) {
    outcomes.put(peer.id(), peer.enqueue(message));
}
```

**运行结果：** 结果可以是 `{fast-a=accepted, slow=rejected, fast-b=accepted}`。

**常见误区：** 一个 `boolean broadcast()` 会隐藏部分成功、重试范围和清理对象。

### 慢客户端需要有界队列

**它是什么：** 每个连接只有固定数量的待发送消息；队列满时立即执行选定策略。

**有什么作用：** 慢客户端不能把输入速率无限转换为 JVM 内存。

**什么时候使用：** 发送速率可能高于单个客户端网络或消费速率时必须使用。

**怎么使用：**

1. 根据受控负载选择容量，而不是复制固定“最佳值”。
2. I/O 回调使用 `offer`，不无限阻塞 `put`。
3. 满时选择关闭、丢弃可覆盖旧值、合并状态或返回拒绝。

**最小示例：** `if (!outbound.offer(message)) closeOnce(new CloseDecision(WireCloseCode.INTERNAL_ERROR, "send queue full"));`。

**运行结果：** 队列不超过上限；溢出产生可计数的 rejected/close outcome。

**常见误区：** `RemoteEndpoint.Async` 改变完成通知方式，不自动提供容量和端到端背压。

### 异步完成不是业务确认

**它是什么：** Async API 的 Future 或 callback 报告本地发送操作完成或失败。

**有什么作用：** 应用可以推进串行队列、记录耗时并处理超时，而不占住广播线程。

**什么时候使用：** 使用 Jakarta Async remote 或适配后的异步 Transport 时使用。

**怎么使用：**

1. 配置非零且经过验证的发送 timeout。
2. 成功时释放当前队列项并推进下一条。
3. 失败时记录 cause 并进入 `closeOnce`。

**最小示例：** `send(message).whenComplete((ignored, error) -> finishSend(error));`。

**运行结果：** callback 成功只表示发送操作完成；业务 ACK 需要应用协议另行定义。

**常见误区：** 把 Future 成功写成“浏览器已经渲染”或“消息可靠持久化”。

### Ping 与匹配 Pong 才形成探测

**它是什么：** 主动 Ping 携带 nonce；只有收到相同载荷的 Pong 才更新该次探测的确认时间。

**有什么作用：** 区分“服务端刚发过数据”和“对端确实响应了本次探测”。

**什么时候使用：** 需要发现半开连接或长时间无业务消息的连接时使用。

**怎么使用：**

1. 生成受限长度 nonce 并记录 deadline。
2. 发送 Ping，不用主动 Pong 冒充请求。
3. Pong payload 匹配后才清除 outstanding 状态。

**最小示例：** `if (pongNonce.equals(outstandingNonce)) lastMatchingPong = clock.millis();`。

**运行结果：** 不匹配或迟到 Pong 不会错误延长当前 deadline。

**常见误区：** Jakarta 自动回复收到的 Ping，不等于应用发出的 Ping 已得到匹配响应。

### Idle timeout 与业务 deadline 不相同

**它是什么：** 容器 idle timeout 观察是否有任何消息收发；业务 deadline 观察特定活性证据。

**有什么作用：** 服务端持续广播时，仍能发现从未返回匹配 Pong 的客户端。

**什么时候使用：** 出站流量会刷新容器活动时间，或业务需要比 TCP 活性更严格的判断时使用。

**怎么使用：**

1. 分别记录 lastSeen、lastPing 和 lastMatchingPong。
2. 以单调时钟或注入 Clock 计算 deadline。
3. 超时后先关闭底层连接，再由统一入口移除 registry。

**最小示例：** `expired = outstanding && now >= pongDeadline;`。

**运行结果：** 普通广播不会误清除 outstanding Ping。

**常见误区：** `isOpen()`、idle timeout 和业务存活是三个不同观察。

### 心跳扫描必须隔离单连接异常

**它是什么：** scheduler 周期遍历连接，每个连接的 Ping、timeout 和关闭错误分别处理。

**有什么作用：** 一个 Session 抛异常不会终止整个周期任务。

**什么时候使用：** 所有自建心跳、idle 清理或超时扫描都必须这样做。

**怎么使用：**

1. 保存 `ScheduledFuture` 以便停止。
2. 每个 peer 使用独立 try/catch 并记录失败。
3. 保存 last-success 指标，停止时 cancel 并 shutdown executor。

**最小示例：**

```java
for (Peer peer : allPeers()) {
    try {
        peer.checkHeartbeat(now);
    } catch (RuntimeException error) {
peer.closeOnce(new CloseDecision(WireCloseCode.INTERNAL_ERROR, "heartbeat failed"));
    }
}
```

**运行结果：** 下一周期仍执行，失败只影响对应 peer。

**常见误区：** 周期任务抛出的未捕获异常会抑制后续执行，不能只看“启动时已 schedule”。

### 关闭码表达终止原因

**它是什么：** RFC 6455 用 1000、1001、1002、1003、1007、1008、1009、1011 等状态区分终止原因。

**有什么作用：** 客户端能选择是否重连，服务端指标也能区分正常、策略、过大和内部异常。

**什么时候使用：** 主动关闭、消息验证失败、授权拒绝、消息过大和 handler 异常时使用。

**怎么使用：**

1. 选择最具体且允许写入 wire 的状态码。
2. reason 只包含无敏感信息的短语。
3. 发出 Close 后停止新数据帧并等待有界关闭流程。

**最小示例：** `closeOnce(new CloseDecision(WireCloseCode.TOO_BIG, "message too large"));`。

**运行结果：** 过大消息产生 1009；未预期服务端异常产生 1011。

**常见误区：** 1005、1006、1015 是保留观察值，不能发送到 Close frame。

### 消息大小必须跨层限制

**它是什么：** 容器缓冲、Session 输入限制、`@OnMessage.maxMessageSize` 和业务 payload 都有自己的边界。

**有什么作用：** 分片或 stream 接收不会绕过总字节、片段数和处理时长限制。

**什么时候使用：** 文本、二进制、partial handler 和 InputStream handler 都要使用。

**怎么使用：**

1. 配置容器文本/二进制缓冲上限。
2. 配置 handler 和业务 schema 上限。
3. 超限时停止读取并以 1009 关闭。

**最小示例：** `@OnMessage(maxMessageSize = 65536L)` 只表示教学占位，上线值必须由负载验证。

**运行结果：** 任一层超过较小有效上限都拒绝，而不是继续把整条消息放入内存。

**常见误区：** frame 不是 message；允许分片不等于允许无限总大小。

### Origin、认证和逐消息授权分层

**它是什么：** Origin 控制浏览器来源，认证建立 principal，授权决定该 principal 能否执行具体 action。

**有什么作用：** 防止跨站 WebSocket 劫持和“连接一次后拥有所有资源”的越权。

**什么时候使用：** 握手、每条业务消息、会话过期、权限撤销和 logout 都要使用。

**怎么使用：**

1. 生产使用 WSS，并精确匹配 Origin allowlist。
2. token 不放 URL query；cookie 登录增加 CSRF/CSWSH 防护。
3. 每条 action 按用户、租户、资源和动作重新授权。

**最小示例：** `authorizer.require(principal, tenantId, resourceId, action);`。

**运行结果：** 已认证但无资源权限的连接得到策略拒绝，不执行 handler。

**常见误区：** Origin 不是身份，WSS 也不会自动提供应用授权。

### 异常观测只记录必要上下文

**它是什么：** 建连、消息、发送、关闭和 scheduler 分别记录可聚合结果，不输出完整 Session map 或 payload。

**有什么作用：** 能定位失败阶段，同时避免 token、cookie、个人数据和业务正文进入日志。

**什么时候使用：** handshake rejection、validation、send timeout、queue overflow、1006/1011 与 cleanup 都使用。

**怎么使用：**

1. 使用非敏感 correlation、session ID 摘要、close code 和异常类型。
2. 记录 queue depth、drop、timeout、cleanup-first 与 scheduler last-success。
3. 对 reason 和业务字段先清洗再记录。

**最小示例：** `log.warn("ws_send_failed session={} type={}", safeId, error.getClass().getSimpleName());`。

**运行结果：** 日志能关联一次失败，但不包含 token、query string 或完整 payload。

**常见误区：** debug 输出整个会话 Map 既昂贵，也可能泄露身份和业务数据。

### 所有终止路径汇入 closeOnce

**它是什么：** `AtomicBoolean` 或等价状态只允许第一个终止调用执行资源释放。

**有什么作用：** close、error、send failure、idle timeout 和 shutdown 不会重复减计数、关资源或残留空房间。

**什么时候使用：** 每条连接从 open 起就建立，所有异常和正常关闭都调用它。

**怎么使用：**

1. CAS 从 OPEN/CLOSING 推到 CLOSED。
2. 首次执行时拒绝新入队、清空队列、关闭 transport、移除 registry。
3. 后续调用只返回 false，并保留首次 close code 与原因。

**最小示例：** `if (!closed.compareAndSet(false, true)) return false;`。

**运行结果：** 并发调用 N 次，cleanup invocation 可以是 N，但 first-cleanup 恰好为 1。

**常见误区：** 在 `onError` 与 `onClose` 分别写一套删除和计数逻辑会产生漂移。

## 现代版本中的正确用法

先为连接定义 owner，再选择 Jakarta endpoint 或 Spring `WebSocketHandler` 之一。Spring handler 可以用
`ConcurrentWebSocketSessionDecorator` 提供单 Session 串行发送和有界缓冲；自定义发送器也必须具有相同
可观察合同。不要同时维护“容器 Session 集合”和“业务 Map”却没有统一清理 owner。

## 基本语法与核心接口

即时广播结果只能说明目标是否接受入队；最终结果由独立 `CompletionStage` 表达。关闭入口不接收任意
`int`，而使用只包含允许写入 wire 的 `WireCloseCode`，从类型上排除 1006 等保留值。完整示例中的
`DeliveryResult` 同时区分入队拒绝、已发送、发送失败、发送超时、关闭前未发送和溢出丢弃。

## 完整示例

下面文件只使用 Java 8 与 Java 25 共有的标准库。真实适配器分别包裹 Jakarta Async remote 或 Spring
`WebSocketSession`；临时 Maven fixture 会用 Java 25/Jakarta 2.2 与 Java 8/`javax.websocket` 各编译运行两次。

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
public final class RealtimeRoomExample {
    enum DeliveryResult { REJECTED, SENT, FAILED, TIMED_OUT, CLOSED, DROPPED }
    enum WireCloseCode { NORMAL, GOING_AWAY, POLICY_VIOLATION, TOO_BIG, INTERNAL_ERROR }
    static final class CloseDecision {
        private final WireCloseCode code;
        private final String reason;
        /** 创建经过类型约束的关闭决定。 */
        CloseDecision(WireCloseCode code, String reason) { this.code = code; this.reason = reason; }
    }
    static final class DeliveryAttempt {
        private final boolean accepted;
        private final CompletableFuture<DeliveryResult> completion = new CompletableFuture<>();
        /** 创建一次接受或拒绝的逐目标发送尝试。 */
        DeliveryAttempt(boolean accepted) {
            this.accepted = accepted;
            if (!accepted) completion.complete(DeliveryResult.REJECTED);
        }
        /** 返回消息是否已经进入该连接的发送器。 */
        boolean accepted() { return accepted; }
        /** 返回 rejected、sent、failed、timed-out、closed 或 dropped 最终结果。 */
        CompletionStage<DeliveryResult> completion() { return completion; }
        /** 只记录第一个最终结果。 */
        void complete(DeliveryResult result) { completion.complete(result); }
    }
    interface TextTransport {
        /** 异步发送文本并在发送操作结束时完成 stage。 */
        CompletionStage<Void> sendText(String message);
        /** 发送带唯一载荷的协议 Ping。 */
        void sendPing(String nonce);
        /** 使用经过类型约束的决定关闭连接。 */
        void close(CloseDecision decision);
    }
    static final class PendingSend {
        private final String message;
        private final DeliveryAttempt attempt;
        /** 保存一条待发送消息及其最终结果。 */
        PendingSend(String message, DeliveryAttempt attempt) {
            this.message = message;
            this.attempt = attempt;
        }
    }
    static final class PeerConnection {
        private final Object stateLock = new Object();
        private final String id;
        private final ArrayBlockingQueue<PendingSend> outbound;
        private final TextTransport transport;
        private final Runnable removeFromRegistry;
        private final ScheduledExecutorService scheduler;
        private final long sendTimeoutMillis;
        private PendingSend inFlight;
        private boolean sending;
        private boolean closed;
        private volatile RuntimeException closeFailure;
        private volatile RuntimeException cleanupFailure;
        /** 创建具有独立有界队列和发送超时的连接 owner。 */
        PeerConnection(
            String id, int capacity, TextTransport transport, Runnable remove,
            ScheduledExecutorService scheduler, long sendTimeoutMillis
        ) {
            this.id = id;
            this.outbound = new ArrayBlockingQueue<>(capacity);
            this.transport = transport;
            this.removeFromRegistry = remove;
            this.scheduler = scheduler;
            this.sendTimeoutMillis = sendTimeoutMillis;
        }
        /** 原子决定接受、拒绝或因队列溢出开始关闭。 */
        DeliveryAttempt enqueue(String message) {
            DeliveryAttempt attempt = new DeliveryAttempt(true);
            boolean overflow = false;
            boolean start = false;
            synchronized (stateLock) {
                if (closed) return new DeliveryAttempt(false);
                if (!outbound.offer(new PendingSend(message, attempt))) overflow = true;
                else if (!sending) {
                    sending = true;
                    start = true;
                }
            }
            if (overflow) {
                close(new CloseDecision(WireCloseCode.INTERNAL_ERROR, "send queue full"),
                    DeliveryResult.DROPPED);
                return new DeliveryAttempt(false);
            }
            if (start) sendNext();
            return attempt;
        }
        /** 在连接锁内选择队首并启动唯一一个异步发送。 */
        private void sendNext() {
            PendingSend pending;
            CompletionStage<Void> operation = null;
            synchronized (stateLock) {
                if (closed) {
                    sending = false;
                    return;
                }
                pending = outbound.poll();
                if (pending == null) {
                    sending = false;
                    return;
                }
                inFlight = pending;
                try {
                    operation = withTimeout(transport.sendText(pending.message));
                } catch (RuntimeException error) {
                    inFlight = null;
                }
            }
            if (operation == null) {
                pending.attempt.complete(DeliveryResult.FAILED);
                closeOnce(new CloseDecision(WireCloseCode.INTERNAL_ERROR, "send start failed"));
                return;
            }
            PendingSend current = pending;
            // 完成回调只写当前目标结果，并在成功后推进当前连接。
            operation.whenComplete((ignored, error) -> {
                synchronized (stateLock) {
                    if (inFlight == current) inFlight = null;
                }
                current.attempt.complete(error == null
                    ? DeliveryResult.SENT
                    : isTimeout(error) ? DeliveryResult.TIMED_OUT : DeliveryResult.FAILED);
                if (error == null) sendNext();
                else closeOnce(new CloseDecision(WireCloseCode.INTERNAL_ERROR, "send failed"));
            });
        }
        /** 识别异步发送的 timeout cause。 */
        private boolean isTimeout(Throwable error) {
            return error instanceof TimeoutException || error.getCause() instanceof TimeoutException;
        }
        /** 用可取消的 scheduler 把永不完成的发送转换成 timeout。 */
        private CompletionStage<Void> withTimeout(CompletionStage<Void> operation) {
            CompletableFuture<Void> result = new CompletableFuture<>();
            ScheduledFuture<?> timeout = scheduler.schedule(
                () -> result.completeExceptionally(new TimeoutException("send timeout")),
                sendTimeoutMillis,
                TimeUnit.MILLISECONDS
            );
            // 原发送完成时取消 timeout，并把相同结果转交给统一 stage。
            operation.whenComplete((ignored, error) -> {
                timeout.cancel(false);
                if (error == null) result.complete(null);
                else result.completeExceptionally(error);
            });
            return result;
        }
        /** 只允许第一个终止路径关闭连接。 */
        boolean closeOnce(CloseDecision decision) { return close(decision, DeliveryResult.CLOSED); }
        /** 在连接锁内启动真实 Ping，发送异常仍汇入 closeOnce。 */
        boolean sendPing(String nonce) {
            try {
                synchronized (stateLock) {
                    if (closed || sending || !outbound.isEmpty()) return false;
                    transport.sendPing(nonce);
                    return true;
                }
            } catch (RuntimeException error) {
                closeOnce(new CloseDecision(WireCloseCode.INTERNAL_ERROR, "ping failed"));
                return false;
            }
        }
        /** 锁内取出在途和等待项，锁外完成结果、移除 registry 并关闭 transport。 */
        private boolean close(CloseDecision decision, DeliveryResult result) {
            List<PendingSend> pending = new ArrayList<>();
            synchronized (stateLock) {
                if (closed) return false;
                closed = true;
                sending = false;
                if (inFlight != null) {
                    pending.add(inFlight);
                    inFlight = null;
                }
                outbound.drainTo(pending);
            }
            for (PendingSend item : pending) item.attempt.complete(result);
            try { transport.close(decision); } catch (RuntimeException error) { closeFailure = error; }
            try { removeFromRegistry.run(); } catch (RuntimeException error) { cleanupFailure = error; }
            return true;
        }
        /** 过大消息以 1009 汇入同一个首次关闭入口。 */
        boolean acceptMessageBytes(int bytes, int maximumBytes) {
            if (bytes <= maximumBytes) return true;
            closeOnce(new CloseDecision(WireCloseCode.TOO_BIG, "message too big"));
            return false;
        }
        /** 返回稳定连接标识。 */
        String id() { return id; }
        /** 返回等待队列长度，不包含在途发送。 */
        int queueDepth() { return outbound.size(); }
    }
    static final class RoomRegistry {
        private final Object registryLock = new Object();
        private final Map<String, Map<String, PeerConnection>> rooms = new LinkedHashMap<>();
        private final ScheduledExecutorService scheduler;
        private final long sendTimeoutMillis;
        private boolean shuttingDown;
        /** 创建由同一 scheduler 管理发送 timeout 的 registry。 */
        RoomRegistry(ScheduledExecutorService scheduler, long sendTimeoutMillis) {
            this.scheduler = scheduler;
            this.sendTimeoutMillis = sendTimeoutMillis;
        }
        /** 在 open 成功后创建并登记连接 owner。 */
        PeerConnection join(String roomId, String peerId, int capacity, TextTransport transport) {
            synchronized (registryLock) {
                if (shuttingDown) throw new IllegalStateException("registry is shutting down");
                Map<String, PeerConnection> peers = rooms.computeIfAbsent(roomId,
                    ignored -> new LinkedHashMap<>());
                if (peers.containsKey(peerId)) throw new IllegalStateException("duplicate peer");
                PeerConnection peer = new PeerConnection(peerId, capacity, transport,
                    () -> leave(roomId, peerId), scheduler, sendTimeoutMillis);
                peers.put(peerId, peer);
                return peer;
            }
        }
        /** 返回每个目标的接受状态和异步最终结果。 */
        Map<String, DeliveryAttempt> broadcast(String roomId, String message) {
            List<PeerConnection> snapshot;
            synchronized (registryLock) {
                if (shuttingDown) return Collections.emptyMap();
                Map<String, PeerConnection> peers = rooms.get(roomId);
                if (peers == null) return Collections.emptyMap();
                snapshot = new ArrayList<>(peers.values());
            }
            Map<String, DeliveryAttempt> outcomes = new LinkedHashMap<>();
            for (PeerConnection peer : snapshot) outcomes.put(peer.id(), peer.enqueue(message));
            return outcomes;
        }
        /** 移除成员并在集合为空时回收房间 key。 */
        private void leave(String roomId, String peerId) {
            synchronized (registryLock) {
                Map<String, PeerConnection> peers = rooms.get(roomId);
                if (peers == null) return;
                peers.remove(peerId);
                if (peers.isEmpty()) rooms.remove(roomId);
            }
        }
        /** 先封住新连接和广播，再关闭快照中的全部连接并清空 registry。 */
        void shutdown() {
            List<PeerConnection> snapshot = new ArrayList<>();
            synchronized (registryLock) {
                if (shuttingDown) return;
                shuttingDown = true;
                for (Map<String, PeerConnection> peers : rooms.values()) snapshot.addAll(peers.values());
                rooms.clear();
            }
            for (PeerConnection peer : snapshot)
                peer.closeOnce(new CloseDecision(WireCloseCode.GOING_AWAY, "shutdown"));
        }
        /** 返回当前非空房间数。 */
        int roomCount() { synchronized (registryLock) { return rooms.size(); } }
    }
    static final class HeartbeatState {
        private final PeerConnection peer;
        private final Object heartbeatLock = new Object();
        private String expectedPong;
        private long pongDeadline;
        private long lastActivityAt;
        private long lastPingAt;
        private long lastMatchingPongAt;
        /** 创建一条连接的心跳状态。 */
        HeartbeatState(PeerConnection peer, long now) { this.peer = peer; this.lastActivityAt = now; }
        /** 记录任意业务消息或控制帧的实际收发活动。 */
        void activity(long now) { synchronized (heartbeatLock) { lastActivityAt = now; } }
        /** 建立一次不覆盖现有探测的 Ping 与 deadline。 */
        boolean ping(String nonce, long now, long timeout) {
            synchronized (heartbeatLock) {
                if (expectedPong != null) return false;
                expectedPong = nonce;
                pongDeadline = now + timeout;
            }
            if (!peer.sendPing(nonce)) {
                synchronized (heartbeatLock) {
                    if (nonce.equals(expectedPong)) expectedPong = null;
                }
                return false;
            }
            synchronized (heartbeatLock) {
                lastPingAt = now;
                lastActivityAt = now;
            }
            return true;
        }
        /** 只让载荷匹配的 Pong 确认当前探测。 */
        boolean pong(String nonce, long now) {
            synchronized (heartbeatLock) {
                lastActivityAt = now;
                if (!nonce.equals(expectedPong) || now >= pongDeadline) return false;
                expectedPong = null;
                lastMatchingPongAt = now;
                return true;
            }
        }
        /** 关闭缺失匹配 Pong 或超过 idle deadline 的连接。 */
        boolean scan(long now, long idleLimit) {
            boolean pongMissing;
            boolean idle;
            synchronized (heartbeatLock) {
                pongMissing = expectedPong != null && now >= pongDeadline;
                idle = now - lastActivityAt >= idleLimit;
            }
            if (!pongMissing && !idle) return false;
            return peer.closeOnce(
                new CloseDecision(WireCloseCode.GOING_AWAY, pongMissing ? "pong timeout" : "idle")
            );
        }
    }
}
```

临时 runner 分别注入立即完成和永不完成的 transport；运行结果为
`fast=true slow=false pong=true ping=true missing=true idle=true timeout=true oversized=false rooms=0 joinRejected=true queues=0`。
`slow=false` 是第三次广播的即时拒绝；每个已接受目标仍需读取自己的 `completion()`，才能区分
`SENT`、`FAILED`、`TIMED_OUT`、`CLOSED` 与 `DROPPED`。示例中的 1011 是“溢出后终止慢连接”的教学选择；
允许丢失的状态流也可选择 DROP 或 coalesce，但必须另外定义容量、顺序、丢弃语义和指标，不能静默改成无界队列。

## 从零跟着做

1. 在 `/tmp` 创建 modern 与 legacy 两个独立 Maven fixture。
2. 两条线共享纯 Java `PeerConnection`，但分别编译 Jakarta 与 javax endpoint 适配器。
3. 打开两个快连接和一个不完成发送的慢连接，向房间连续广播。
4. 断言快连接继续完成，慢连接到容量上限后以 1011 关闭。
5. 并发调用 close/error，断言首次 cleanup 恰好一次且房间数归零。
6. 模拟匹配和缺失 Pong、消息过大 1009、scheduler 单 peer 异常与应用 shutdown。

## 如何使用

先画出连接 owner 拥有的资源：底层 Session、registry entry、发送队列、心跳状态、调度 Future 与业务订阅。
每增加一个退出路径，都只调用 `closeOnce`；每增加一个生产消息的入口，都只能进入同一个有界发送器。

## 适用与不适用场景

- 适合：单 JVM 中的通知、房间状态、协作信号和低延迟双向连接。
- 不适合：需要离线补发、跨节点可靠顺序或事务消息时，原生广播不能替代 broker 和持久化协议。
- 需要另行设计：跨 JVM session 路由、负载均衡粘性、broker fan-out 和可靠 ACK。

## 当前项目补充

冻结矩阵只证明项目有 endpoint、容器配置、房间/分组广播与心跳候选。课程保留这些场景，但拒绝复制
同步 BasicRemote 广播、空房间残留、完整 Session map 日志或重复 close/error 计数等风险模式。不能由类名
或风险摘要推断实际部署、连接数、消息大小和事故结果。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 可复用 `ConcurrentHashMap`、`ArrayBlockingQueue`、`CompletionStage`、`AtomicBoolean` 和
`ScheduledExecutorService`。Spring 5.2.15 也已有 WebSocketSession、并发发送 decorator 与容器限制。
差异集中在标准 API 包名和 Java SE 客户端能力：旧线使用 `javax.websocket.*`，不能调用
`java.net.http.WebSocket`。

## 新旧版本差异

| 对比项 | 现代稳定版本 | Java 8 / Spring 5.2.15 | 迁移注意 |
| --- | --- | --- | --- |
| 标准服务端包 | `jakarta.websocket.*` | `javax.websocket.*` | 分开依赖与 import，不做字符串替换式迁移 |
| Spring 标准适配 | Jakarta WebSocket 2.2 | javax WebSocket API 线 | 以精确容器和 Spring 版本验证 |
| Java SE 客户端 | `java.net.http.WebSocket` | 不存在 | Java 8 不能编译现代客户端 API |
| 单 Session 发送 | 必须串行化并有界 | 同样要求 | 共同核心可复用，适配器分开 |
| 心跳 scheduler | 显式 cancel/shutdown | 同样要求 | 容器不管理应用自建线程 |

## 易错点

### 错误：握手完成前注册业务 Session

- **现象：** 被拒绝连接仍留下房间成员。
- **触发条件：** 收到 Upgrade GET 就写 registry，随后认证或 Origin 失败。
- **原因：** HTTP handshake 与 endpoint OPEN 被混成一步。
- **后果：** 孤儿成员、错误在线数和无效广播目标。
- **错误示例：** 在 handshake interceptor 验证前执行 `rooms.add(id)`。
- **正确写法：** 所有准入检查通过并进入 open 回调后再创建 owner。
- **影响版本：** RFC 6455、Jakarta 与 Spring 两条线。
- **验证方式：** 分别模拟 403 与 101，断言只有 101 增加成员。
- **来源：** `rfc6455-opening-handshake`、`spring7-websocket-server-reference`。

### 错误：把 isOpen 当发送承诺

- **现象：** 日志先显示 open，下一行发送仍失败。
- **触发条件：** check 与 send 之间对端关闭或 transport error。
- **原因：** 状态检查是瞬时观察，不与后续网络操作组成原子事务。
- **后果：** 未处理异常、残留队列或重复重试。
- **错误示例：** `if (session.isOpen()) session.sendMessage(message);` 且不捕获失败。
- **正确写法：** 仍可快速检查，但发送失败必须进入该 peer 的 `closeOnce`。
- **影响版本：** Jakarta 2.2、Spring 7.0.8 与 5.2.15。
- **验证方式：** 在检查后关闭 fake transport，断言失败只清理一次。
- **来源：** `jakarta-websocket22-session`、`spring708-websocket-session`。

### 错误：并发发送或使用全局锁

- **现象：** 出现重叠发送异常，或一个慢客户端冻结整个房间。
- **触发条件：** 多线程直接调用 Basic/sendMessage，或所有 Session 共用同一锁。
- **原因：** 同一 Session 需要串行化，但不同 Session 不应共享等待命运。
- **后果：** 消息边界破坏、延迟扩散和线程堆积。
- **错误示例：** `synchronized (rooms) { for (...) session.sendMessage(message); }`。
- **正确写法：** 每个 Session 一个发送器，registry 锁外入队。
- **影响版本：** Jakarta 2.2、Spring 7.0.8 与 5.2.15。
- **验证方式：** 三个连接中让一个 send 不完成，断言另外两个继续完成。
- **来源：** `jakarta-websocket22-basic-remote`、`spring708-concurrent-session-decorator`。

### 错误：把成员遍历当作原子广播

- **现象：** 指标声称“全员成功”，实际成员在广播期间加入或退出。
- **触发条件：** CHM 遍历后只返回一个 boolean。
- **原因：** 弱一致视图与逐连接网络结果都不是事务。
- **后果：** 无法判断部分成功、清理和重试目标。
- **错误示例：** `return sessions.stream().allMatch(this::send);`。
- **正确写法：** 返回每个 session 的 accepted/sent/rejected/failed outcome。
- **影响版本：** Java 25 与 Java 8 registry 都成立。
- **验证方式：** 广播时并发 open/close，核对 outcome key 集合而非全局布尔。
- **来源：** `java25-concurrent-hash-map`、`java8-concurrent-hash-map`。

### 错误：异步发送使用无界缓冲

- **现象：** 慢连接的待发送消息和内存持续增长。
- **触发条件：** 只调用 Async send 或把失败消息追加到无界 List。
- **原因：** 异步 API 没有替应用决定容量和溢出策略。
- **后果：** 内存耗尽、GC 压力与其他连接受影响。
- **错误示例：** `pending.add(message);` 且没有上限、timeout 或 callback。
- **正确写法：** 固定容量 `offer`，满时执行可观测的 terminate/drop/coalesce/reject。
- **影响版本：** Jakarta/Spring 两条线与 Java 有界队列共同合同。
- **验证方式：** 让 transport 永不完成并生产 N 条消息，断言 queue 不超过容量。
- **来源：** `jakarta-websocket22-async-remote`、`java25-array-blocking-queue`。

### 错误：单个心跳异常终止整个扫描

- **现象：** 启动时有心跳日志，某次异常后永久消失。
- **触发条件：** 周期 Runnable 把 Session 异常抛到 scheduler 顶层。
- **原因：** 周期任务的一次异常会抑制后续执行。
- **后果：** 死连接不再回收，registry 和队列持续增长。
- **错误示例：** 循环内不捕获 `peer.sendPing()` 的异常。
- **正确写法：** 每 peer 隔离异常，并监控 scheduler last-success；停止时 cancel/shutdown。
- **影响版本：** Java 25 与 Java 8。
- **验证方式：** 第一个 peer 抛异常，断言后续 peer 和下一周期仍执行。
- **来源：** `java25-scheduled-executor-service`、`java8-scheduled-executor-service`。

### 错误：close 与 error 分别清理

- **现象：** 在线数变成负数，或房间只剩空集合。
- **触发条件：** transport error 后又收到 close，两条路径各自减计数。
- **原因：** 没有连接级幂等终止 owner。
- **后果：** 统计漂移、重复释放和静态 Map key 残留。
- **错误示例：** `onError` 与 `onClose` 各写一份 `count--` 和 `remove`。
- **正确写法：** 两者都调用同一个 CAS `closeOnce`，最后成员移除时删除房间。
- **影响版本：** 所有服务端实现。
- **验证方式：** 并发调用 close/error/send-failure，断言 first-cleanup 为 1、room count 为 0。
- **来源：** `spring708-websocket-handler`、`JAVA-RISK-036`。

### 错误：消息限制只配置一层

- **现象：** whole handler 被限制，partial 或 stream 仍累计无限总字节。
- **触发条件：** 只设置 `@OnMessage.maxMessageSize`，未限制容器和业务聚合。
- **原因：** frame、容器缓冲、handler 与业务 payload 是不同边界。
- **后果：** 内存、CPU 或解析资源耗尽。
- **错误示例：** 收到分片就追加到无界 `ByteArrayOutputStream`。
- **正确写法：** 对齐容器、Session、handler、总字节、片段数和处理 deadline。
- **影响版本：** RFC 6455、Jakarta 与 Spring 两条线。
- **验证方式：** whole 与 partial 各发送上限加一字节，断言以 1009 关闭。
- **来源：** `rfc6455-data-framing`、`jakarta-websocket22-on-message`。

### 错误：发送保留关闭码或统一使用 1000

- **现象：** 客户端无法区分异常，或 wire Close 使用非法 1006。
- **触发条件：** 所有终止都写 1000/1011，或把本地异常观察值直接发出。
- **原因：** 未区分协议、策略、大小、内部异常和保留状态。
- **后果：** 重连策略错误，协议不合规，监控失去分类。
- **错误示例：** `close(1006, "abnormal")`。
- **正确写法：** 过大用 1009、策略用 1008、内部异常用 1011；1006 只本地记录。
- **影响版本：** RFC 6455 所有实现。
- **验证方式：** 参数化检查允许和保留状态，并解析 Close frame。
- **来源：** `rfc6455-closing-status-codes`、`jakarta-websocket22-close-codes`。

### 错误：只在握手认证且记录敏感 payload

- **现象：** 已登录连接可操作别的租户，日志还包含 token 或完整消息。
- **触发条件：** open 后不再授权，并打印 query、cookie、Session map 或 payload。
- **原因：** Origin、认证、逐消息授权和安全日志被混成一个动作。
- **后果：** CSWSH、越权和凭据/业务数据泄露。
- **错误示例：** `log.info("ws {} {}", request.getQueryString(), payload);`。
- **正确写法：** 精确 Origin、逐 action 授权、会话撤销关闭和去敏结构化日志。
- **影响版本：** 所有 WebSocket 应用。
- **验证方式：** 跨 Origin、跨租户、过期会话和日志敏感词四组负例。
- **来源：** `jakarta-websocket22-server-configurator`、`owasp-websocket-security`。

## 安全与性能边界

生产使用 WSS；Origin allowlist 不能替代身份，认证不能替代每条消息的资源授权。连接数、消息频率、大小、
队列深度、最老待发送时长和 idle deadline 都要有可观测限制。没有 workload、消息分布、网络延迟和容器
配置时，本课不提供“最佳”队列容量、心跳间隔或 timeout 数字。

## 如何验证

在 `/tmp` 的两个固定版本 fixture 中，连续两次验证握手成功/拒绝、单 Session 串行发送、两个快连接加一个
慢连接、队列 overflow、匹配/缺失 Pong、idle close、重复 close/error、1009 和 shutdown 后零资源。再运行
内容结构、Catalog 冷启动三次、Phase 2、根质量门和双视口页面检查；成功后删除全部临时资产。

## 练习

:::exercise
### 练习：为三人房间设计可回收广播

**要求：** 两个客户端立即完成发送，一个客户端永不完成；容量为 1。写出第三次广播后的逐目标结果、
慢连接关闭码、首次 cleanup 次数和最终空房间条件。

**验收：** 快客户端不被阻塞；慢客户端 outcome 为 rejected 并以 1011 关闭；close/error 重放不增加首次
cleanup；最后一个成员关闭后 room key 不存在。

**参考答案：** 每个 peer 独立发送器；第一次让慢连接占用在途，第二次占用队列，第三次触发容量拒绝；
所有终止路径调用 `closeOnce`，registry 用 `computeIfPresent` 在集合为空时返回 `null`。
:::

## 本节小结

- Upgrade 成功后才创建业务 Session owner；Origin、认证和逐消息授权是三个边界。
- Registry 提供单 JVM 定位，不提供原子广播；结果必须逐目标记录。
- 同一 Session 串行发送且有界，慢客户端不能阻塞或耗尽其他连接资源。
- Ping/Pong、idle、Close code、消息上限和异常观测各有独立合同。
- close、error、send failure、idle 与 shutdown 必须汇入同一幂等回收入口。
