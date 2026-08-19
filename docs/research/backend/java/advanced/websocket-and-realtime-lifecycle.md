# Java 高级第 6 门：WebSocket 会话、广播、心跳与回收研究

> 课程 ID：`backend.java.learn.advanced.websocket-and-realtime-lifecycle`
>
> 冻结顺序：550
>
> 研究日期：2026-08-10
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用任务冻结证据与现有 Phase 2 矩阵/清单，不读取、运行或修改 `dzzz-app`

## 冻结课程合同

- 标题：WebSocket 会话、广播、心跳与回收。
- 阶段：`advanced`，深度：`lesson`。
- 前置课程：
  1. `backend.java.learn.advanced.concurrency-locks-and-shared-state`。
  2. `backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`。
- 来源能力：
  1. `JAVA-FRAMEWORK-011`：WebSocket Endpoint 与 Spring 集成。
  2. `JAVA-ENGINEERING-028`：实时会话、广播与心跳。
  3. `JAVA-RISK-036`：实时会话回收、幂等与慢客户端隔离。
- 课程选择理由：冻结项目存在 WebSocket 端点与会话表；连接、慢客户端、回收和幂等必须作为一个
  生命周期理解。
- 冻结矩阵继续保持本课原有 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest、课程正文或 signoff。
- STOMP、SockJS、集群消息代理、可靠消息和第 7 课均不在本研究范围。Spring 来源只用于原生
  WebSocket API，不能把 STOMP/SockJS 的广播或心跳默认值移植到本课。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0、Spring Framework 7.0.8。
- Jakarta WebSocket 2.2 / API 2.2.0，使用 `jakarta.websocket.*`。
- Java 25 的 `java.net.http.WebSocket` 只作为标准客户端 API 的补充边界；服务端课程主线仍采用
  Jakarta WebSocket 2.2 与 Spring 原生 `WebSocketHandler`，不把两套 API 混写。
- Spring 当前 Reference 在核验日显示 7.0.8，但该入口会随维护版本更新；精确行为优先绑定
  `/docs/7.0.8/javadoc-api/` 和 `v7.0.8` 源码标签。

### 兼容线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Spring Framework 5.2.15 的标准 WebSocket 适配使用 `javax.websocket.*`；这属于 Java EE/JSR 356
  生态，不是 Java SE 8 自带的客户端 API。
- Java SE 标准 `java.net.http.WebSocket` 从 Java 11 开始，Java 8 示例不得调用它。
- 旧线只解释冻结项目语境。不能把 `jakarta.websocket.*`、Spring 7 类型或 Java 25 客户端 API
  回填到 Java 8 / Spring 5.2.15。

## 已核验的官方直接来源

以下 38 个唯一直接 URL 均先由 Tavily 定位，再回到官方规范、Javadoc、Reference 或精确源码标签核验；
2026-08-10 当前 HTTP 状态均为 200。没有使用社区文章、问答或搜索摘要支撑结论。

### 版本基线

1. **`oracle-java-support-roadmap`**
   - 标题：Oracle Java SE Support Roadmap。
   - URL：<https://www.oracle.com/java/technologies/java-se-support-roadmap.html>。
   - `sourceType: official-reference`；`appliesTo: Java 25 LTS`；`verifiedAt: 2026-08-10`。
   - `claims`：Oracle 支持路线把 Java 25 列为 LTS；本课现代 Java 基线固定为 25。
2. **`boot41-system-requirements`**
   - 标题：Spring Boot System Requirements。
   - URL：<https://docs.spring.io/spring-boot/system-requirements.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-10`。
   - `claims`：Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 以上；Java 25 在范围内。

### RFC 6455 协议合同

3. **`rfc6455-opening-handshake`**
   - 标题：RFC 6455 Section 4 - Opening Handshake。
   - URL：<https://www.rfc-editor.org/rfc/rfc6455.html#section-4>。
   - `sourceType: specification`；`appliesTo: RFC 6455`；`verifiedAt: 2026-08-10`。
   - `claims`：客户端以 HTTP/1.1 GET、`Upgrade: websocket`、`Connection: Upgrade`、版本 13 和
     `Sec-WebSocket-Key` 发起握手；服务端接受时返回 101 与校验后的 `Sec-WebSocket-Accept`；浏览器会发送
     `Origin`，服务端可在升级前拒绝来源、认证或资源不满足的请求。
4. **`rfc6455-data-framing`**
   - 标题：RFC 6455 Section 5 - Data Framing。
   - URL：<https://www.rfc-editor.org/rfc/rfc6455.html#section-5>。
   - `sourceType: specification`；`appliesTo: RFC 6455`；`verifiedAt: 2026-08-10`。
   - `claims`：消息可由多个 frame 分片且必须按序交付；应用不能依赖固定 frame 边界；Close、Ping、Pong
     控制帧不得分片且载荷不超过 125 字节；收到 Ping 后应尽快回复相同载荷的 Pong。
5. **`rfc6455-closing-status-codes`**
   - 标题：RFC 6455 Section 7 - Closing the Connection。
   - URL：<https://www.rfc-editor.org/rfc/rfc6455.html#section-7>。
   - `sourceType: specification`；`appliesTo: RFC 6455`；`verifiedAt: 2026-08-10`。
   - `claims`：发送 Close 后不得继续发送数据帧；双方交换 Close 后关闭底层连接；1000/1001/1002/1003/
     1007/1008/1009/1011 分别表达正常、离开、协议、类型、数据、策略、过大和服务端异常；1005/1006/1015
     是保留值，不能写入 wire Close 帧。

### Jakarta WebSocket 2.2

6. **`jakarta-websocket22-release`**
   - 标题：Jakarta WebSocket 2.2 Release。
   - URL：<https://jakarta.ee/specifications/websocket/2.2/>。
   - `sourceType: release-note`；`appliesTo: Jakarta WebSocket 2.2 / API 2.2.0`；
     `verifiedAt: 2026-08-10`。
   - `claims`：2.2 属于 Jakarta EE 11，最低 Java SE 8；Maven 坐标为
     `jakarta.websocket-api:2.2.0` 与 `jakarta.websocket-client-api:2.2.0`；本结论不表示 Java SE 8 自带该 API。
7. **`jakarta-websocket22-spec`**
   - 标题：Jakarta WebSocket Specification 2.2。
   - URL：<https://jakarta.ee/specifications/websocket/2.2/jakarta-websocket-spec-2.2>。
   - `sourceType: specification`；`appliesTo: Jakarta WebSocket 2.2`；`verifiedAt: 2026-08-10`。
   - `claims`：每个 peer 通常对应唯一 endpoint 实例；同一 peer 的 endpoint 回调最多由一个容器线程执行，
     分片消息回调必须顺序且不交错；共享 endpoint 或 handler 跨多个 Session 时仍可能并发；2.0 起包名由
     `javax.websocket.*` 迁到 `jakarta.websocket.*`，2.2 进一步澄清 Ping 责任和消息大小行为。
8. **`jakarta-websocket22-session`**
   - 标题：Jakarta WebSocket 2.2 Session API。
   - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/session>。
   - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
   - `claims`：`isOpen()`、`close()`、`getOpenSessions()`、idle timeout 与文本/二进制缓冲上限属于会话合同；
     inactivity 指没有任何消息收发；超出缓冲上限以 `TOO_BIG` 关闭；开放会话集合只是调用时快照。
9. **`jakarta-websocket22-endpoint`**
   - 标题：Jakarta WebSocket 2.2 Endpoint API。
   - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/endpoint>。
   - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
   - `claims`：程序化 endpoint 通过 `onOpen`、`onClose`、`onError` 参与连接生命周期；打开后注册消息
     handler，关闭后不再把 Session 当作可发送资源。
10. **`jakarta-websocket22-on-message`**
    - 标题：Jakarta WebSocket 2.2 OnMessage API。
    - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/onmessage>。
    - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
    - `claims`：文本、二进制与 Pong 每种原生类型最多一个消息方法；支持 whole、partial 或 stream 接收；
      `maxMessageSize` 是应用可接收的字节上限，默认 `-1` 表示未配置上限。
11. **`jakarta-websocket22-basic-remote`**
    - 标题：Jakarta WebSocket 2.2 RemoteEndpoint.Basic API。
    - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/remoteendpoint.basic>。
    - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
    - `claims`：Basic 发送阻塞到消息传输完成；同一连接已有发送进行时再次发送可能抛
      `IllegalStateException`；partial 消息必须按顺序并用 `isLast` 明确结束。
12. **`jakarta-websocket22-async-remote`**
    - 标题：Jakarta WebSocket 2.2 RemoteEndpoint.Async API。
    - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/remoteendpoint.async>。
    - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
    - `claims`：Async 通过 `Future` 或 `SendHandler` 报告发送完成/失败，可设置异步发送 timeout；零或负值
      表示不超时；完成只证明发送操作结果，不证明对端业务已消费或确认。
13. **`jakarta-websocket22-close-codes`**
    - 标题：Jakarta WebSocket 2.2 CloseReason.CloseCodes API。
    - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/client/jakarta/websocket/closereason.closecodes>。
    - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
    - `claims`：API 将 RFC 关闭语义映射为稳定枚举；`TOO_BIG` 为 1009、`UNEXPECTED_CONDITION` 为 1011；
      `CLOSED_ABNORMALLY`、`NO_STATUS_CODE` 与 TLS 失败等保留值不能作为 wire 状态码发送。
14. **`jakarta-websocket22-server-configurator`**
    - 标题：Jakarta WebSocket 2.2 ServerEndpointConfig.Configurator API。
    - URL：<https://jakarta.ee/specifications/websocket/2.2/apidocs/server/jakarta/websocket/server/serverendpointconfig.configurator>。
    - `sourceType: api-doc`；`appliesTo: Jakarta WebSocket API 2.2.0`；`verifiedAt: 2026-08-10`。
    - `claims`：`checkOrigin` 在 opening handshake 检查 `Origin`；每次连接可创建 endpoint 实例；握手属性
      必须形成每个 Session 独立副本。Origin 检查只是来源控制，不等同于身份认证和逐消息授权。

### Spring Framework 7.0.8

15. **`spring7-websocket-server-reference`**
    - 标题：Spring Framework WebSocket API - Server。
    - URL：<https://docs.spring.io/spring-framework/reference/web/websocket/server.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8 current reference at verification`；
      `verifiedAt: 2026-08-10`。
    - `claims`：HTTP request 先经 WebSocket handshake，再升级为长连接；底层 Jakarta 容器可配置输入缓冲与
      idle timeout；直接使用 `WebSocketHandler` 时应用必须同步发送，可使用并发 session decorator。
16. **`spring708-websocket-handler`**
    - 标题：Spring Framework 7.0.8 WebSocketHandler API。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/WebSocketHandler.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：生命周期回调为建立、消息、transport error 与关闭；关闭回调也可能发生在传输错误之后；
      到关闭回调时继续发送不受支持，因此 registry 移除必须可重复且不依赖发送成功。
17. **`spring708-websocket-session`**
    - 标题：Spring Framework 7.0.8 WebSocketSession API。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/WebSocketSession.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：`sendMessage` 明确要求同步底层标准会话的并发发送；`isOpen` 只是当前开放状态；`close()`
      使用 1000，亦可携带明确 `CloseStatus`；消息大小限制和 Principal 属于每会话属性。
18. **`spring708-concurrent-session-decorator`**
    - 标题：Spring Framework 7.0.8 ConcurrentWebSocketSessionDecorator API。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/handler/ConcurrentWebSocketSessionDecorator.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：decorator 保证同一时刻一个线程发送；慢发送时其余消息进入缓冲，并检查 send-time 与
      buffer-size limit；默认超限终止会话，也可显式选择 DROP。它提供单 session 有界策略，不是端到端背压。
19. **`spring708-servlet-server-container`**
    - 标题：Spring Framework 7.0.8 ServletServerContainerFactoryBean API。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/server/standard/ServletServerContainerFactoryBean.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：可显式配置 async send timeout、session idle timeout、文本与二进制缓冲上限；Javadoc
      类型使用 `jakarta.websocket.server.ServerContainer`，证明现代标准适配边界。
20. **`spring708-exception-handler-decorator`**
    - 标题：Spring Framework 7.0.8 ExceptionWebSocketHandlerDecorator API。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/handler/ExceptionWebSocketHandlerDecorator.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：handler 未处理异常会被捕获并以 1011 关闭 session；应用仍需记录失败阶段、session ID、
      close status 和清理结果，不能把“连接已关闭”当成异常已经观测。
21. **`spring708-standard-client-source`**
    - 标题：Spring Framework v7.0.8 StandardWebSocketClient Source。
    - URL：<https://github.com/spring-projects/spring-framework/blob/v7.0.8/spring-websocket/src/main/java/org/springframework/web/socket/client/standard/StandardWebSocketClient.java>。
    - `sourceType: source-code`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：精确标签源码导入 `jakarta.websocket.ClientEndpointConfig`、`Endpoint` 与
      `WebSocketContainer`；现代 Spring 标准适配不是 `javax.websocket`。

### Java 25 / Java 8 并发与客户端 API

22. **`java25-concurrent-hash-map`**
    - 标题：Java SE 25 ConcurrentHashMap API。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
    - `claims`：每 key 更新与读到该值之间有 happens-before；迭代器弱一致，聚合视图不是原子快照；
      并发 session registry 的结构安全不能推出广播成员或全员发送结果的一致性。
23. **`java8-concurrent-hash-map`**
    - 标题：Java SE 8 ConcurrentHashMap API。
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
    - `claims`：旧线已有每 key happens-before、弱一致遍历与 `newKeySet()`；可构建单 JVM 并发 registry，
      但仍不提供原子广播、跨 JVM 可见性或会话自动回收。
24. **`java25-array-blocking-queue`**
    - 标题：Java SE 25 ArrayBlockingQueue API。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
    - `claims`：固定容量创建后不可改变；`offer` 在满时返回 false，`put` 在满时阻塞；它可实现显式
      有界队列与拒绝策略，但队列本身不决定丢弃、关闭、重试或业务优先级。
25. **`java8-array-blocking-queue`**
    - 标题：Java SE 8 ArrayBlockingQueue API。
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ArrayBlockingQueue.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
    - `claims`：Java 8 具有相同的固定容量、阻塞 `put` 与非阻塞 `offer` 基本合同；legacy 示例可使用
      共同 API，但不能在容器 I/O 回调线程中无界等待慢客户端队列腾位。
26. **`java25-scheduled-executor-service`**
    - 标题：Java SE 25 ScheduledExecutorService API。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
    - `claims`：固定频率与固定延迟是不同调度语义；同一周期任务执行不会互相重叠；一次执行抛异常会
      抑制后续执行。心跳扫描必须隔离单 session 失败并保存可取消的 Future。
27. **`java8-scheduled-executor-service`**
    - 标题：Java SE 8 ScheduledExecutorService API。
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ScheduledExecutorService.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
    - `claims`：旧线具有相同的周期执行、异常终止与取消合同；应用自建 scheduler 仍必须在组件停止时
      cancel 周期任务并 shutdown executor，不能依赖 WebSocket container 自动回收。
28. **`java25-http-websocket`**
    - 标题：Java SE 25 java.net.http.WebSocket API。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/WebSocket.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 client API, since Java 11`；`verifiedAt: 2026-08-10`。
    - `claims`：标准客户端发送返回 `CompletableFuture`；输入与输出侧分别关闭；`sendClose` 只关闭输出，
      输入继续等待 peer Close、error 或 `abort`；`request(n)` 控制 Listener 回调需求计数。
29. **`java25-http-websocket-listener`**
    - 标题：Java SE 25 WebSocket.Listener API。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/WebSocket.Listener.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 client API, since Java 11`；`verifiedAt: 2026-08-10`。
    - `claims`：同一 WebSocket 的 Listener 回调严格顺序且不重入，但一个 Listener 共享给多个连接时仍可
      并发；一次 `request` 计数对应一次回调而非完整消息；返回 Stage 主要约束缓冲回收，不是完整背压证明。
30. **`openjdk-jep321-http-client`**
    - 标题：JEP 321 - HTTP Client (Standard)。
    - URL：<https://openjdk.org/jeps/321>。
    - `sourceType: official-reference`；`appliesTo: Java 11 introduction`；`verifiedAt: 2026-08-10`。
    - `claims`：`java.net.http` HTTP Client 与 WebSocket API 在 Java 11 标准化；Java 8 不能直接编译该 API。
31. **`javaee7-javax-websocket-package`**
    - 标题：Java EE 7 javax.websocket Package API。
    - URL：<https://docs.oracle.com/javaee/7/api/javax/websocket/package-summary.html>。
    - `sourceType: api-doc`；`appliesTo: Java EE 7 / JSR 356 legacy namespace`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧标准 endpoint、Session、RemoteEndpoint 与生命周期 API 位于 `javax.websocket`；该包
      来自 Java EE，不应描述为 Java SE 8 标准库内置。

### Java 8 / Spring Boot 2.3.12 归档线

32. **`boot2312-system-requirements`**
    - 标题：Spring Boot 2.3.12 Getting Started - System Requirements。
    - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：Boot 2.3.12 需要 Java 8，最高兼容 Java 15，并要求 Spring Framework 5.2.15.RELEASE 以上。
33. **`spring5215-websocket-reference`**
    - 标题：Spring Framework 5.2.15 Web on Servlet Stack - WebSocket。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#websocket>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线已有原生 `WebSocketHandler`、HTTP handshake、标准容器消息缓冲与 idle timeout；
      Reference 中的 STOMP/SockJS 章节不作为本课原生 WebSocket 默认行为。
34. **`spring5215-websocket-session`**
    - 标题：Spring Framework 5.2.15 WebSocketSession API。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/WebSocketSession.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线同样要求同步底层标准会话的并发发送，提供 `isOpen`、关闭状态、Principal 与输入消息
      上限；核心生命周期合同可以兼容讲解，但不能声称跨大版本二进制兼容。
35. **`spring5215-concurrent-session-decorator`**
    - 标题：Spring Framework 5.2.15 ConcurrentWebSocketSessionDecorator API。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/handler/ConcurrentWebSocketSessionDecorator.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线已有单线程发送、send-time limit、buffer-size limit 与 5.1 起的 overflow strategy；
      legacy 示例仍必须显式选择超限终止或丢弃语义。
36. **`spring5215-servlet-server-container`**
    - 标题：Spring Framework 5.2.15 ServletServerContainerFactoryBean API。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/server/standard/ServletServerContainerFactoryBean.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线可配置 async send timeout、session idle timeout 与文本/二进制缓冲上限；这些共同 API
      可用于纠正 legacy 示例，不需要使用 Spring 7 类型。
37. **`spring5215-standard-client-source`**
    - 标题：Spring Framework v5.2.15.RELEASE StandardWebSocketClient Source。
    - URL：<https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-websocket/src/main/java/org/springframework/web/socket/client/standard/StandardWebSocketClient.java>。
    - `sourceType: source-code`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：精确标签源码导入 `javax.websocket.ClientEndpointConfig`、`Endpoint` 与
      `WebSocketContainer`；旧线不能只替换依赖版本而保留现代 Jakarta import。

### 安全标准

38. **`owasp-websocket-security`**
    - 标题：OWASP WebSocket Security Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: WebSocket applications, living document`；
      `verifiedAt: 2026-08-10`。
    - `claims`：生产使用 WSS，握手逐次校验 Origin allowlist，cookie 登录需防 CSWSH；认证后仍逐消息授权；
      会话过期/登出时关闭连接；限制连接数、消息大小、频率和缓冲，使用 ping/pong 与 timeout 清理死连接；
      记录连接、认证、授权、限流、校验失败和异常关闭，但不记录 token、session ID 或完整敏感 payload。

## 协议与应用生命周期模型

### HTTP Upgrade 只负责建立连接

1. 客户端发送 HTTP/1.1 GET，包含 Host、Upgrade、Connection、版本和随机 key；浏览器还发送 Origin，
   也可能携带 cookie 或 HTTP 认证信息。
2. 服务端在仍处于 HTTP 边界时完成 TLS、认证、Origin allowlist、路径、版本、子协议与扩展选择；失败时
   返回 400/401/403/404/426 等 HTTP 响应，不创建业务 session registry 条目。
3. 接受时服务端返回 101、Upgrade、Connection 与计算出的 `Sec-WebSocket-Accept`；101 之后才进入
   WebSocket frame 协议和 endpoint open 回调。
4. `Sec-WebSocket-Accept` 证明服务端完成协议握手计算，不证明用户身份、权限、租户或后续消息合法。
5. 反向代理、负载均衡和应用服务器共同构成 server-side infrastructure；只验证应用 handler 被调用，
   不能推出上游代理的 idle timeout、Upgrade 转发和连接上限正确。

### 一条连接的状态与所有权

| 状态 | 可执行动作 | 应用所有权 | 禁止推断 |
| --- | --- | --- | --- |
| HTTP handshake | 认证、Origin、协议协商、拒绝 | 尚未注册业务 Session | 收到 GET 不等于连接开放 |
| OPEN | 注册 Session、收发消息、刷新 last-seen | registry、发送队列、心跳状态均有明确 owner | `isOpen()` 不保证下一次发送成功 |
| CLOSING | 发送或收到 Close，停止新数据帧 | 禁止新业务入队，等待/限定 drain，准备幂等清理 | 发出 Close 不等于 TCP 已关闭 |
| CLOSED/error | 移除 registry、取消任务、清空队列、记录原因 | `closeOnce` 或等价幂等入口收敛所有路径 | transport error 不保证只回调一次 |

Jakarta `Session`、Spring `WebSocketSession`、registry entry、发送队列、心跳状态和业务订阅不是同一个对象。
课程必须为它们指定一个连接级 owner，所有 open、close、error、send failure、idle scan 与应用停止路径最终
调用同一幂等清理操作。

## Endpoint 回调与线程安全边界

1. Jakarta 默认每个 peer 使用独立 endpoint 实例，并保证同一 peer 的 endpoint 不会同时由两个容器线程
   调用；同一消息的 partial 回调按序且不交错。
2. 该保证不覆盖应用自己启动的广播线程、scheduler、数据库回调或跨 Session 共享 handler。自定义
   Configurator 返回同一个 endpoint、一个 handler 注册到多个 Session，或 Spring singleton handler
   维护共享 registry 时，都需要应用自己的并发设计。
3. `ConcurrentHashMap`/`newKeySet()` 只保证集合操作可并发，不保证“遍历成员 -> 检查 open -> 发送 ->
   记录成功”成为原子事务。广播期间成员可以加入、关闭或被移除。
4. `isOpen()` 是瞬时观察。检查后连接仍可能关闭，发送必须捕获精确异常并进入该 Session 的失败/清理路径。
5. Basic send、Spring `sendMessage` 不能并发使用。每个 Session 需要单独串行化发送；一个全局锁会把全部
   客户端互相阻塞，也不能解决慢客户端队列增长。

## 广播、慢客户端与背压

### 广播不是一个原子操作

原生 Jakarta/Spring API 没有“全员一次成功”的广播原语。课程中的广播模型固定为：

1. 从单 JVM registry 获取弱一致成员视图。
2. 为每个目标复制不可变消息或稳定 bytes，避免调用方在异步发送完成前修改缓冲。
3. 逐 Session 进入其自己的串行发送器，不在持有 registry 锁时进行网络 I/O。
4. 分别记录 accepted、sent、dropped、timed-out、closed 与 failed；一个慢客户端不能阻止其他目标。
5. 发送失败只清理对应 Session。广播结果是 per-session outcome 集合，不是布尔“广播成功”。

### 有界队列与溢出策略

- `RemoteEndpoint.Async` 只把发送完成改为异步通知；它不自动提供容量上限、对端消费确认或端到端背压。
- Spring `ConcurrentWebSocketSessionDecorator` 可以把并发发送串行化，并用 send-time/buffer-size limit
  终止或丢弃；必须在课程中显式展示所选 overflow strategy 和可观察计数。
- 自定义 per-session queue 必须在创建时固定容量。`offer` 返回 false 时立即进入明确策略：关闭慢会话、
  丢弃允许丢失的旧更新、合并可覆盖的状态，或把拒绝返回调用方；不能悄悄改用无界队列。
- 不在 WebSocket I/O 回调线程使用无期限 `put`，否则单个满队列可能反向阻塞消息处理线程。
- 队列长度、最老消息等待时长、发送时长、drop/timeout/close 计数是验证指标；没有负载数据时不写固定
  容量或 timeout 是“最佳值”。

## Ping/Pong、idle timeout 与回收

### 协议心跳与业务心跳分开

1. RFC Ping 可用于 keepalive 或确认 peer 仍响应；收到 Ping 后协议实现回复 Pong，Pong 携带相同应用数据。
2. Jakarta 2.2 由实现承担自动 Pong。应用若主动发送 Ping，应为 payload 记录 nonce/时间，并只在匹配
   Pong 后更新确认状态；主动 Pong 不期待响应，不能用作双向探活证明。
3. idle timeout 的“inactive”是没有任何发送或接收。频繁服务端广播会刷新活动，因此单靠容器 idle
   timeout 不能证明客户端仍在处理消息。
4. 业务 last-seen、last-ping、last-matching-pong 和 deadline 应分字段记录。超过 deadline 后以明确
   CloseStatus 关闭，再由统一清理入口移除，不能只从 map 删除而留下底层连接。
5. 周期扫描任务内部隔离单 Session 异常；否则 `ScheduledExecutorService` 的一次未捕获异常会让整个周期
   任务停止，形成“心跳看似配置但不再运行”。
6. 应用停止时先停止接收新连接/新广播，再取消 scheduler，关闭各 Session，清空 registry 与队列，最后
   shutdown 自建 executor；容器不会替应用清理自建线程、Future 或外部资源。

## 关闭码、消息大小与分片

| 场景 | 建议协议状态 | 课程边界 |
| --- | --- | --- |
| 正常完成 | 1000 | 双方完成 Close handshake，不在 Close 后发送数据帧 |
| 服务停止/页面离开 | 1001 | 不表示应用错误，可用于有界重连策略的输入 |
| 协议错误 | 1002 | 不能用通用 1011 掩盖明确协议错误 |
| 不支持的数据类型 | 1003 | 与业务字段校验失败区分 |
| 非法文本数据 | 1007 | 文本整体必须是合法 UTF-8 |
| 授权/策略拒绝 | 1008 | reason 不泄露敏感策略细节 |
| 消息过大 | 1009 | 同时配置容器缓冲上限与应用 payload 限制 |
| handler 未预期异常 | 1011 | 记录异常 correlation，向客户端只给非敏感 reason |
| 未收到 Close 的异常中断 | 本地观察 1006 | 1006 不能写入 Close frame |

- frame 不是 message。一个 message 可以分片，控制帧可插入其中；课程必须按完整消息或 partial handler
  的真实合同计数，不能把每次 frame/回调都当作完整业务消息。
- RFC 允许非控制消息任意大小分片，不等于实现可以无限缓冲。Jakarta Session、`@OnMessage.maxMessageSize`
  与 Spring 容器配置分别限定 API/handler/容器边界，三者需按最小有效上限对齐。
- `InputStream`/partial handler 可以减少整条消息预缓冲，但仍要限制总字节数、片段数和处理时长；流式
  接口不是绕过 DoS 限制的理由。
- Async send completion、Pong 与 Close 只能证明各自协议事件，均不能替代业务 ACK、消息持久化或可靠投递。

## 异常观测与安全边界

### 异常观测

- 建连：记录 handshake accepted/rejected、非敏感 principal/tenant 标识、origin、subprotocol 和 session ID。
- 消息：记录消息类型、大小、处理时间、授权/校验结果与 correlation ID；不记录完整 payload、token、cookie、
  session ID 凭据或个人敏感数据。
- 发送：记录队列 accepted/drop、send duration、timeout、buffer overflow 和目标 Session，不把 Future 成功
  写成“客户端已处理”。
- 关闭：记录 initiator、close code、经过清洗的 reason、异常类型和清理是否首次执行；1006 与 1011 应有
  独立计数。
- 运行：记录 open sessions、每用户连接数、队列深度、oldest queued age、last matching pong、idle close 和
  scheduler last-success time；不能把一次 debug 输出完整 Session map 当作可观测性。

### 认证、授权与 Origin/CSRF

1. 生产使用 WSS；TLS 保护传输，不负责应用授权。
2. 浏览器会在握手中携带 cookie，因此必须每次握手精确匹配 Origin allowlist。Origin 不能被当作用户身份，
   非浏览器客户端还可能自定义该 header。
3. cookie 登录场景除 Origin 外还应采用合适的 SameSite/CSRF token 策略；token 不放 URL query，避免进入
   access log、代理日志和历史记录。
4. 握手认证只建立当前 principal。每条业务 action 仍按用户、租户、资源和动作授权；不能把“连接已认证”
   解释为该连接后续拥有全部权限。
5. session 过期、权限撤销或 logout 时主动关闭相关连接；长连接期间需要重新校验授权状态，而不是等待
   TCP 自然断开。
6. 对连接数、每用户连接数、消息频率、消息大小、解析深度、发送缓冲和 idle time 设置可观测限制；
   具体数值由负载验证决定，不直接复制 OWASP 示例阈值。

## Legacy 版本差异

| 主题 | Java 25 / Framework 7.0.8 / Jakarta 2.2 | Java 8 / Boot 2.3.12 / Framework 5.2.15 | 教学决策 |
| --- | --- | --- | --- |
| 标准服务端包 | `jakarta.websocket.*` | `javax.websocket.*` | 分开 import 与依赖，不声称二进制兼容 |
| Spring 标准适配 | Jakarta API 2.2.0 | javax WebSocket API 1.1 线 | 使用各自精确源码/Javadoc |
| Spring 原生抽象 | `org.springframework.web.socket.*` | 同名抽象已存在 | 共享生命周期概念，不跨版本复制实现 |
| 并发发送 | 必须串行化；现代 decorator 有有界策略 | 同样必须串行化；5.2.15 已有 decorator | 两线都不直接并发 send |
| 容器限制 | async send/idle/text/binary limit | 共同配置已存在 | legacy 不需要现代类型即可纠正 |
| Java 标准客户端 | `java.net.http.WebSocket`，Since 11 | Java SE 8 不包含 | 旧线用容器/第三方既有客户端边界，不回填 |
| 并发 registry | Java 25 CHM 弱一致 | Java 8 已有 `newKeySet()` 与弱一致 | 都只承诺单 JVM 结构安全 |
| 心跳调度 | ScheduledExecutorService | 同一基本合同 | 两线都处理任务异常并主动 shutdown |
| STOMP/SockJS | 不属于本课 | 不属于本课 | 不引用其 broker/25 秒默认值 |

## 冻结项目证据映射

以下 15 条代表映射完全来自冻结矩阵/清单，共 8 个唯一路径/稳定符号；不读取源码，不从类名推断实现细节。
三类能力的底层 `projectEvidenceCount` 分别为 22、9、6，这些计数可能指向重叠文件，不能相加后称为 37 个
唯一文件。

| sourceId | 冻结路径与稳定符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-FRAMEWORK-011` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java`；`com.tdh.bdzz.config.websocket.DzzzEndpointConfigure` | `observed` | 项目存在 endpoint 与容器集成候选，不能推出实例创建和依赖注入正确 |
| `JAVA-FRAMEWORK-011` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`；`com.tdh.bdzz.config.websocket.server.ClientZzWsServer` | `observed` | 项目存在 WebSocket endpoint 候选，不能推出 open/close/error 已幂等 |
| `JAVA-FRAMEWORK-011` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`；`com.tdh.bdzz.config.websocket.server.Voice2TextWsServer` | `observed` | 项目存在 WebSocket 生命周期候选，不能推出线程或发送安全 |
| `JAVA-FRAMEWORK-011` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java`；`com.tdh.bdzz.config.websocket.WebSocketConfig` | `observed` | 项目存在容器配置候选，不能推出配置已生效或值合理 |
| `JAVA-FRAMEWORK-011` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`；`com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer` | `observed` | 项目存在 endpoint 候选，不能推出认证授权或消息限制正确 |
| `JAVA-ENGINEERING-028` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`；`com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer` | `observed` | 项目存在实时会话/广播场景，不能推出广播原子或可靠 |
| `JAVA-ENGINEERING-028` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java`；`com.tdh.bdzz.config.websocket.server.BlOperationWsServer` | `observed` | 项目存在分组广播候选，不能推出成员快照一致 |
| `JAVA-ENGINEERING-028` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`；`com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer` | `observed` | 项目存在会话分组候选，不能推出并发发送安全 |
| `JAVA-ENGINEERING-028` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java`；`com.tdh.bdzz.config.websocket.WebSocketConfig` | `observed` | 项目存在 timeout/消息缓冲配置候选，不能推出实际默认值或生效状态 |
| `JAVA-ENGINEERING-028` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`；`com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer` | `observed` | 项目存在心跳/会话场景，不能推出活性判定正确 |
| `JAVA-RISK-036` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`；`com.tdh.bdzz.config.websocket.server.Voice2TextWsServer` | `rejected` | 冻结风险包含关闭后空组未移除或慢客户端隔离问题；旧写法不进入推荐示例 |
| `JAVA-RISK-036` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`；`com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer` | `rejected` | 只保留实时会话回收风险场景，不复制旧实现 |
| `JAVA-RISK-036` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`；`com.tdh.bdzz.config.websocket.server.ClientZzWsServer` | `rejected` | 只保留关闭遍历、日志暴露或幂等候选，不推断具体源码命中 |
| `JAVA-RISK-036` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`；`com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer` | `rejected` | 只保留慢客户端同步发送风险，不把旧广播方式写成正例 |
| `JAVA-RISK-036` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`；`com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer` | `rejected` | 只保留在线计数、重复 close/error 和空房间回收风险 |

## 不能推出的结论

- 不能由存在 endpoint 或 config 类推出该 endpoint 已部署、依赖注入生效、buffer/timeout 值有效或路由可达。
- 不能由 `ConcurrentHashMap`、`newKeySet()` 或 `getOpenSessions()` 推出广播是原子快照、全员成功、顺序一致、
  可重试、跨 JVM 可见或可靠投递。
- 不能由 `isOpen()` 推出下一次发送必然成功；不能由 async Future 成功推出对端业务已消费或确认。
- 不能由自动 Pong、周期 Ping 或 idle timeout 单独推出客户端存活、链路健康、重连正确或业务处理正常。
- 不能由容器关闭 Session 推出应用 registry、队列、scheduler、Future、线程池或外部订阅已经回收。
- 不能把 Origin allowlist 当身份认证，也不能把握手认证、WSS 或 CSRF token 当作逐消息授权。
- 不能把一个全局同步锁当慢客户端隔离；它会把不同 Session 的发送命运绑定在一起。
- 不能把 Spring `ConcurrentWebSocketSessionDecorator`、有界 queue 或 Java 25 `request(n)` 任一单点称为完整
  端到端背压；每个机制只覆盖自己的局部边界。
- 不能从冻结风险摘要反推具体源码行、运行拓扑、客户端数量、消息大小、网络延迟、泄露内容或事故结果。
- 不能给出没有 workload、队列分布、消息大小、容器配置和测量结果的吞吐、容量或 timeout 最佳值。

## 易错点取证与反馈环计划

正文至少覆盖以下可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 ->
影响版本 -> 验证方式 -> 来源”组织：

1. HTTP handshake 未完成就注册业务 Session，拒绝/失败后留下孤儿 registry 条目。
2. 把 `isOpen()` 当发送承诺，检查与 send 之间关闭后未隔离失败。
3. 多线程直接调用 Basic/Spring send，或使用全局锁使一个慢客户端阻塞全部广播。
4. `getOpenSessions()`/CHM 遍历被描述成原子广播，忽略成员并发变化和逐目标结果。
5. Async send 无 timeout、无容量上限、无完成回调，慢客户端导致内存持续增长。
6. 有界 queue 满后没有明确 drop/terminate/reject/coalesce 策略，或在 I/O 回调线程无期限 `put`。
7. 只发送主动 Pong、只看 TCP open 或只看 server outbound，把它们误作双向存活证明。
8. 心跳扫描某个 Session 抛异常后整个周期任务永久停止，且没有 last-success 监控。
9. close/error/send-failure/idle-timeout 分别减计数和删除，重复回调导致负数、空组残留或双重释放。
10. 消息上限只配置一层，分片/stream 路径绕过总字节、片段数或处理时长限制。
11. 把 1006 发送到 wire，或所有错误都使用 1000/1011，丢失协议与策略语义。
12. 只在握手认证，不校验 Origin、不处理 session 过期，也不逐消息授权。
13. 日志输出完整 Session map、query token 或 payload，造成凭据与业务数据暴露。
14. 现代 `jakarta.websocket` 与 legacy `javax.websocket` 混用，或在 Java 8 示例调用 `java.net.http.WebSocket`。

## 课程设计与验证合同

1. 正文顺序固定为：HTTP Upgrade -> endpoint/session 状态 -> 回调线程边界 -> 单 Session 串行发送 ->
   registry 与广播结果 -> 慢客户端有界策略 -> Ping/Pong 与 idle -> close code -> 消息大小/分片 ->
   认证授权/Origin -> 异常观测 -> 幂等回收 -> legacy 差异。
2. Java 25 / Framework 7.0.8 正例只使用 Spring 原生 `WebSocketHandler` 或 Jakarta 2.2 中一种清晰模型，
   不把两个 endpoint 模型塞进一个最小类；使用单 JVM registry、per-session 串行发送、有界缓冲和统一
   `closeOnce` 清理入口。
3. Java 8 / Framework 5.2.15 正例使用共同 Spring 抽象或 `javax.websocket` 1.1 语境，不调用 Jakarta 包、
   Java 25 客户端 API 或不存在的现代方法。
4. `/tmp` 中建立最小 fixture：握手成功/拒绝、并发发送串行化、两个快客户端加一个慢客户端广播、queue
   overflow、匹配/丢失 Pong、idle close、重复 close/error、消息过大 1009 与 shutdown 后零 registry/queue。
5. 现代线与 legacy 线各连续运行两次；若没有 Java 8 或兼容容器，legacy 行为标记 Deferred，不能用
   Java 25 或 Spring 7 结果替代。
6. 反馈环记录每目标发送 outcome、最大队列、drop/timeout、close code、cleanup invocation/first-cleanup、
   scheduler last-success 与最终线程/Session 数；没有测量时删除性能数字。
7. 所有 fixture、日志和 browser output 位于 `/tmp` 的 `mktemp` 目录；成功后删除并检查不存在，不在仓库
   留测试、demo、依赖、配置或生成物。
8. 本研究不添加课程正文、依赖、track/manifest 接线、页面证据或 signoff，也不开始第 7 课。

## 研究 Gate 自检

- [x] 课程 ID、顺序 550、两个前置、三个冻结来源能力和选择理由已核对。
- [x] 38 个唯一官方直接来源均记录稳定 ID、标题、URL、精确版本、`sourceType`、`appliesTo`、claims 与
  `verifiedAt: 2026-08-10`，当前 HTTP 均为 200。
- [x] 现代 Java 25、Boot 4.1.0、Framework 7.0.8、Jakarta WebSocket 2.2 与 legacy Java 8、Boot 2.3.12、
  Framework 5.2.15、`javax.websocket` 边界已分别核验。
- [x] 已覆盖 Upgrade/握手、endpoint 回调、Session 状态、并发发送、广播、慢客户端、Ping/Pong、idle、
  关闭码、消息大小/分片、异常观测、认证授权/Origin/CSRF、有界队列和资源回收。
- [x] 项目证据恰来自 `JAVA-FRAMEWORK-011`、`JAVA-ENGINEERING-028`、`JAVA-RISK-036` 的冻结矩阵/清单；
  15 条代表映射、8 个唯一稳定符号，未读取或运行 `dzzz-app`。
- [x] 未使用社区来源，未把 STOMP/SockJS 默认值、Java 25 客户端需求计数或局部队列包装成原生协议合同。
- [x] 未创建课程正文、manifest/track/signoff、后续课程、测试、demo 或生成文件。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 6 门课程的官方资料研究。课程正文、临时反馈环、发布接线、页面证据、独立
signoff 与双轴复审均未执行；不得据此开始 Java 高级第 7 门或任何后续课程。
