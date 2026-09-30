---
id: backend.java.learn.advanced.rabbitmq-message-send-receive
type: lesson
title: RabbitMQ 消息收发
summary: 使用 Spring AMQP 连接 RabbitMQ，声明交换机、队列与绑定，并用 RabbitTemplate 和 RabbitListener 完成真实消息收发
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 190
prerequisites:
  - backend.java.learn.advanced.message-queue-boundaries
objectives:
  - 能说明 RabbitMQ 连接、通道、交换机、队列和绑定在一次收发中的职责。
  - 能使用外部配置连接本机或容器中的 RabbitMQ，并避免把凭据写入源码。
  - 能用 Spring Bean 声明 durable direct exchange、queue 和 binding，并解释启动时的声明过程。
  - 能使用 RabbitTemplate 按 exchange 与 routing key 发布字符串消息。
  - 能使用 RabbitListener 注册消费者，并说明 listener container 如何持续拉取队列消息。
  - 能根据 direct、fanout 和 topic 的路由规则判断消息会进入哪些队列。
  - 能用 RabbitMQ 管理端口和命令检查交换机、队列、绑定以及 ready 消息数量。
  - 能在 Java 8 / Spring Boot 2.3.12 与 Java 25 / Spring Boot 4.1.1 之间保持同一收发合同。
recap:
  - RabbitTemplate 使用 Spring 的 ConnectionFactory 复用连接与通道；业务代码不应为每条消息新建连接。
  - producer 只能向 exchange 发布消息，binding 决定 routing key 是否把消息送入 queue。
  - Queue Bean 只描述声明参数，RabbitAdmin 或 Boot 自动配置负责把声明同步给 Broker。
  - RabbitListener 把 Spring Bean 方法交给 listener container，方法收到的是已转换的 payload。
  - direct 精确匹配 routing key，fanout 忽略 key 广播到所有绑定队列，topic 用 * 和 # 做模式匹配。
  - RabbitMQ 的 5672 是 AMQP 客户端端口，15672 是管理界面端口；两者不是同一个协议入口。
  - 发布到不存在的 exchange 会失败，发布到没有匹配 binding 的 exchange 可能没有队列接收；可靠确认留给后续课程。
  - Java 8 兼容线主要替换 Spring Boot 依赖版本，RabbitTemplate、QueueBuilder 和 RabbitListener 的基本用法不变。
related:
  - backend.java.learn.advanced.message-queue-boundaries
  - backend.java.learn.intermediate.spring-boot-and-configuration
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
tags:
  - Java
  - Spring Boot
  - RabbitMQ
  - Spring AMQP
  - RabbitTemplate
  - RabbitListener
  - Exchange
  - Queue
  - Binding
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring AMQP 4.1.1 / RabbitMQ 4.3 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring AMQP 2.2.18.RELEASE 兼容线
verifiedAt: 2026-08-31
sources:
  - id: spring-amqp-quick-tour
    title: Spring AMQP Quick Tour
    url: https://docs.spring.io/spring-amqp/reference/introduction/quick-tour.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - Spring AMQP 用 ConnectionFactory、RabbitAdmin、RabbitTemplate 和 Queue 完成最小收发。
      - RabbitTemplate 复用连接工厂提供的资源，并可使用默认 exchange 的队列名作为 routing key。
  - id: spring-amqp-abstractions
    title: Spring AMQP Abstractions
    url: https://docs.spring.io/spring-amqp/reference/amqp/abstractions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - Exchange、Queue 和 Binding Bean 描述 AMQP 路由对象，RabbitAdmin 可以把它们声明到 Broker。
      - 生产者向 exchange 发布，消费者从 queue 接收。
  - id: spring-amqp-listener-endpoints
    title: Spring AMQP Annotation-driven Listener Endpoints
    url: https://docs.spring.io/spring-amqp/reference/amqp/receiving-messages/async-annotation-driven.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - RabbitListener 把受管 Bean 方法暴露为 listener endpoint。
      - listener container 在后台调用监听方法，并要求目标 queue 已存在且绑定到 exchange。
  - id: spring-boot-amqp
    title: Spring Boot AMQP Support
    url: https://docs.spring.io/spring-boot/reference/messaging/amqp.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - spring-boot-starter-amqp 提供 RabbitMQ 集成，spring.rabbitmq.* 属性配置连接。
      - Boot 自动配置 AmqpTemplate、AmqpAdmin 和默认 listener container factory。
  - id: spring-amqp-connections
    title: Spring AMQP Connection and Resource Management
    url: https://docs.spring.io/spring-amqp/reference/amqp/connections.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - CachingConnectionFactory 通常复用一个连接并缓存通道，通道才是 AMQP 消息操作的工作单元。
      - 应用自行创建的通道必须可靠关闭，避免通道资源耗尽。
  - id: rabbitmq-hello-world-java
    title: RabbitMQ Hello World Tutorial
    url: https://www.rabbitmq.com/tutorials/tutorial-one-java
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - RabbitMQ 使用 AMQP 0-9-1，消息先进入 queue，再由 consumer 接收。
      - Java client 使用 exchange、queue、basicPublish 和 basicConsume 完成最小收发。
  - id: rabbitmq-routing-java
    title: RabbitMQ Routing Tutorial
    url: https://www.rabbitmq.com/tutorials/tutorial-four-java
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - direct exchange 只把消息路由到 binding key 精确等于 routing key 的队列。
      - 一个 routing key 可以绑定多个队列，从而把消息发送给多个匹配队列。
  - id: rabbitmq-publish-subscribe-java
    title: RabbitMQ Publish Subscribe Tutorial
    url: https://www.rabbitmq.com/tutorials/tutorial-three-java
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - fanout exchange 把消息广播到所有绑定队列并忽略 routing key。
      - 每个订阅者应使用自己的队列，以免消费者互相竞争同一份事件。
  - id: rabbitmq-topic-java
    title: RabbitMQ Topics Tutorial
    url: https://www.rabbitmq.com/tutorials/tutorial-five-java
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - topic exchange 使用点号分隔的 routing key，并用 * 和 # 进行模式匹配。
      - 一个队列可以通过多个 binding key 订阅不同主题。
  - id: rabbitmq-networking
    title: RabbitMQ Networking and Ports
    url: https://www.rabbitmq.com/docs/networking
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - AMQP 客户端默认使用 5672，管理插件的 HTTP UI 默认使用 15672。
  - id: spring-amqp-legacy-quick-tour
    title: Spring AMQP 2.2 Reference
    url: https://docs.spring.io/spring-amqp/docs/2.2.18.RELEASE/reference/html/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 2.2.18.RELEASE / Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线仍提供 RabbitTemplate、RabbitAdmin、Queue、Binding 与 RabbitListener 基本 API。
  - id: spring-boot-legacy-amqp
    title: Spring Boot 2.3 AMQP Support
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/using-spring-boot.html#using-boot-amqp
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线使用 spring.rabbitmq 属性和 spring-boot-starter-amqp 自动配置 RabbitMQ 基础设施。
---

# RabbitMQ 消息收发

前一课用内存队列建立了 producer、exchange、queue 和 consumer 的边界，但内存对象会随进程退出而消失，也没有跨进程的连接协议。
本课把同一个模型接到真实 RabbitMQ：先准备 Broker，再由 Spring AMQP 声明拓扑，最后让 `RabbitTemplate` 发布消息、`RabbitListener`
在另一个线程中消费消息。确认、重投、重试、死信和幂等故意留到后续课；本课只证明“消息确实经过 Broker 到达正确队列和监听方法”。

## 一、先建立连接和 Broker 的两个端口

### 1. AMQP 端口和管理端口不是一回事

RabbitMQ 的客户端通过 AMQP 协议连接默认的 `5672` 端口。管理插件提供 HTTP 管理界面，默认使用 `15672`。浏览器能打开管理页面，
并不代表 Java 客户端已经能连上 `5672`；反过来也一样。排查连接时要分别确认容器端口映射、用户名、密码和 virtual host。

可以用一个临时容器准备本课环境：

```bash
docker run --rm --name teamflow-rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=teamflow \
  -e RABBITMQ_DEFAULT_PASS=teamflow-secret \
  rabbitmq:4.3-management
```

容器日志出现启动完成后，管理页面是 `http://localhost:15672`，客户端地址仍是 `amqp://localhost:5672`。示例凭据只用于本机临时环境，
生产环境应由密钥或运行时环境注入，不能把密码提交到 `application.yml`。

### 2. Spring Boot 把连接参数外部化

`spring-boot-starter-amqp` 会自动配置 Spring AMQP 的连接工厂、模板、管理器和监听容器。连接信息放在配置文件的属性前缀下，代码只
依赖 `RabbitTemplate` 等抽象：

```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME}
    password: ${RABBITMQ_PASSWORD}
    virtual-host: ${RABBITMQ_VHOST:/}
```

启动前设置 `RABBITMQ_USERNAME=teamflow` 和 `RABBITMQ_PASSWORD=teamflow-secret`。如果 host、端口或凭据错误，连接工厂会在声明或收发时
报告连接异常；此时先核对端口和凭据，再检查 exchange 或 queue 名称，不能把所有失败都归因于监听器。

## 二、一次消息经过哪些对象

### 1. Connection、Channel 和模板

`Connection` 是客户端到 Broker 的长连接。一个连接可以创建多个 `Channel`，通道承载声明、发布和消费操作。RabbitMQ Java client 的
连接和通道都不是线程间随意共享的业务对象；Spring 的 `CachingConnectionFactory` 负责在合适的边界复用它们。业务方法只调用
`RabbitTemplate`，不要在每次 `send` 时执行 `new ConnectionFactory()`、`newConnection()` 和 `createChannel()`。

```java
ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.setHost("localhost");
try (Connection connection = connectionFactory.newConnection();
        Channel channel = connection.createChannel()) {
    channel.exchangeDeclare("report.direct", "direct", true);
    channel.queueDeclare("report-work", true, false, false, null);
    channel.queueBind("report-work", "report.direct", "report.request");
    channel.basicPublish("report.direct", "report.request", null, "job-42".getBytes("UTF-8"));
}
```

这段原生 client 代码能展示协议对象和资源关闭，但业务项目更适合让 Spring 管理连接。`try` 只保证这个临时程序结束时关闭资源，不能
被误解为每条业务消息都应新建一条连接。

### 2. Exchange、Queue 和 Binding

producer 不直接把消息交给 consumer，而是向 exchange 发布。exchange 根据类型和 binding key 选择 queue；consumer 只从 queue 领取。
声明的最小拓扑如下：

```text
RabbitTemplate
    -> report.direct (direct exchange)
        -> report.request binding
            -> report-work (durable queue)
                -> @RabbitListener
```

Queue 是 Broker 保存 ready 消息的地方。Binding 是 exchange 到 queue 的路由关系，routing key 是发布时携带的选择值。声明同名对象时，
类型、durable 和参数必须与 Broker 中已有对象相容；只改代码中的 durable 并不会自动把已存在队列改成另一种属性。

### 3. 三种常用 exchange 的选择

| exchange | 匹配规则 | 适合的消息意图 |
| --- | --- | --- |
| direct | routing key 与 binding key 精确相等 | 把一类命令送到指定工作队列 |
| fanout | 忽略 routing key，发送给所有绑定队列 | 广播一个事实给多个订阅者 |
| topic | `*` 匹配一段，`#` 匹配零到多段 | 按层级主题筛选事件 |

`direct` 的匹配发生在每条 binding 上，因此相同的 binding key 可以把一条消息送入多个队列；它不是“只能有一个
消费者”的开关。`fanout` 适合已经确定要广播的事实，不适合把所有命令都复制给所有服务。`topic` 的点号是主题的
分隔符，`audit.*` 能匹配 `audit.login`，但不能匹配 `audit.login.failed`；`audit.#` 可以匹配后者，也能匹配只有
`audit` 的键。

## 三、把拓扑声明交给 Spring

### 1. Bean 描述的是 Broker 上的对象

Spring AMQP 用 `Exchange`、`Queue` 和 `Binding` Bean 表达拓扑。下面的声明为报表命令建立一个 durable direct exchange、
一个命名 durable queue 和一条精确 binding：

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 声明报表命令使用的 RabbitMQ 拓扑。 */
@Configuration(proxyBeanMethods = false)
public class RabbitTopologyConfiguration {
    public static final String EXCHANGE = "teamflow.report";
    public static final String QUEUE = "teamflow.report.request";
    public static final String ROUTING_KEY = "report.request";

    /** 创建一个 durable direct exchange。 */
    @Bean
    public DirectExchange reportExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    /** 创建一个重启后仍保留的命名队列。 */
    @Bean
    public Queue reportQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    /** 把 report.request 绑定到报表队列。 */
    @Bean
    public Binding reportBinding(Queue reportQueue, DirectExchange reportExchange) {
        return BindingBuilder.bind(reportQueue).to(reportExchange).with(ROUTING_KEY);
    }
}
```

Bean 本身没有执行网络请求。Boot 自动配置的 `RabbitAdmin` 会在连接 Broker 后读取这些声明并执行相应的
`exchange.declare`、`queue.declare` 和 `queue.bind`。因此应用启动时，如果 Broker 中已经存在同名对象但 durable、类型或参数
不同，声明会因 `PRECONDITION_FAILED` 失败；这不是消费者业务异常，应该修正拓扑合同或清理本机临时对象。

### 2. durable、命名和消息持久化是三件事

`QueueBuilder.durable` 只决定队列元数据是否在 Broker 重启后保留。它不保证消息已经落盘，也不等价于 publisher confirm。
要让消息具备重启后的持久化条件，至少还要让发布消息使用 persistent delivery mode；消息确认和发布确认仍然是另外的交付语义。

命名 durable 队列适合多个应用实例共同消费。临时订阅可以使用 server-named、exclusive、auto-delete 队列，但该队列的生命周期
绑定在连接上，不能拿它承载需要恢复的报表命令。本课的工作队列固定使用命名 durable 队列，以便用管理命令观察 ready 消息。

### 3. 声明顺序不等于业务处理顺序

启动时通常先声明 exchange，再声明 queue，最后声明 binding；但这些声明只是让 Broker 拥有路由对象，不能代表任何消息已经被
处理。消费者是否注册成功要看 listener container 的状态，业务完成要看业务自己的状态记录。把“Spring context 启动成功”写成
“所有报表已完成”会再次混淆基础设施状态和业务状态。

## 四、让模板发布，让监听器消费

### 1. `RabbitTemplate` 只关心发布合同

`RabbitTemplate` 从 Spring 管理的 `ConnectionFactory` 获取连接和通道。发布类只传递 exchange、routing key 和 payload，不需要
自己创建连接，也不需要把 `Channel` 放进字段：

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/** 发布报表生成命令。 */
@Service
public class ReportCommandPublisher {
    private final RabbitTemplate rabbitTemplate;

    /** 注入由 Spring Boot 配置的消息模板。 */
    public ReportCommandPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /** 向报表交换机发布一个文本命令。 */
    public void publish(String jobId) {
        rabbitTemplate.convertAndSend(
                RabbitTopologyConfiguration.EXCHANGE,
                RabbitTopologyConfiguration.ROUTING_KEY,
                jobId);
    }
}
```

`convertAndSend` 会使用消息转换器把字符串变成消息 body，并把 routing key 放进发布请求。它返回并不表示消费者已经执行完毕；
本课没有打开 publisher confirm，也没有把未路由消息转换成业务成功。下一课再建立发布和消费失败的恢复合同。

### 2. `@RabbitListener` 把 Bean 方法交给容器

监听器方法由 listener container 在后台线程调用。下面的 payload 类型是 `String`，正好对应发布端传入的字符串：

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/** 处理报表生成命令。 */
@Component
public class ReportCommandListener {
    /** 收到一条命令后记录本次处理。 */
    @RabbitListener(queues = RabbitTopologyConfiguration.QUEUE)
    public void receive(String jobId) {
        System.out.println("report received jobId=" + jobId);
    }
}
```

应用需要在配置类或启动类上启用 `@EnableRabbit`（Boot 版本通常会自动配置基础设施，但显式启用可以让示例的入口更清楚）：

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动 RabbitMQ 收发示例。 */
@SpringBootApplication
@EnableRabbit
public class RabbitMessagingApplication {
    /** 启动 Spring Boot 应用上下文。 */
    public static void main(String[] args) {
        SpringApplication.run(RabbitMessagingApplication.class, args);
    }
}
```

listener container 会保持消费循环，连接断开时按 Spring AMQP 的恢复策略重建资源；这不等于本课已经验证重试或幂等。监听器的
业务方法应该短而明确，耗时工作放到服务层，并把可重复执行作为下一课的前置思考。

### 3. payload、header 和原始消息要按需要选择

只需要字符串时，`String` 参数最直观；需要 routing key、delivery tag 或 headers 时，可以接收 `Message` 或使用
`@Header` 参数。不要为了打印一个 routing key 把所有业务方法都改成依赖底层 `Channel`，否则业务边界会被协议细节污染。

```java
/** 输出消息体和 routing key，仍不直接操作通道。 */
@RabbitListener(queues = RabbitTopologyConfiguration.QUEUE)
public void receiveWithMetadata(
        org.springframework.amqp.core.Message message,
        @org.springframework.messaging.handler.annotation.Header(
                org.springframework.amqp.support.AmqpHeaders.RECEIVED_ROUTING_KEY)
                String routingKey) {
    String body = new String(message.getBody(), java.nio.charset.StandardCharsets.UTF_8);
    System.out.println("routingKey=" + routingKey + " body=" + body);
}
```

本课的完整示例选择 `String` payload，使观察重点落在 exchange、queue 和 binding，而不是消息序列化格式。JSON、重试和死信
队列需要额外的消息合同，不能只把参数换成一个 DTO 就宣称已经可靠。

## 五、从 Broker 指标确认消息真的经过路由

### 1. 先检查监听器所依赖的对象

管理插件的 HTTP 端口用于浏览器，`rabbitmqctl` 则在 Broker 节点上查看对象。连接到容器后，可执行：

```bash
docker exec teamflow-rabbitmq rabbitmqctl list_exchanges name type durable
docker exec teamflow-rabbitmq rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
docker exec teamflow-rabbitmq rabbitmqctl list_bindings source destination routing_key
```

预期能看到 `teamflow.report` 的 `direct` exchange、`teamflow.report.request` 队列以及 `report.request` binding。发布一条命令后，
如果监听器已运行，`messages_ready` 通常会很快回到 `0`；如果停止监听器再发布，ready 数量会增加。`messages_unacknowledged` 是
尚未完成确认的在途消息，不应和 ready 消息混为一谈。

### 2. 用三种 routing key 预测结果

| 拓扑 | binding | 发布 key | 结果 |
| --- | --- | --- | --- |
| direct | `report.request` | `report.request` | 报表队列收到 |
| direct | `report.request` | `report.cancel` | 没有匹配队列 |
| fanout | 任意 | 任意，甚至空字符串 | 所有绑定队列各收到一份 |
| topic | `audit.*` | `audit.login` | 匹配 |
| topic | `audit.*` | `audit.login.failed` | 不匹配 |
| topic | `audit.#` | `audit.login.failed` | 匹配 |

发布到没有匹配 binding 的 exchange 时，Broker 可能接受并丢弃不可路由消息；没有 publisher confirm 或 mandatory-return 处理时，
调用端不能从普通 `convertAndSend` 返回值推断消息已经到达某个 queue。这里只用这条规则排查路由，可靠发布会在后续课单独实现。

### 3. 用一个最小原生客户端理解 Spring 下面的动作

Spring 的模板和监听器最终仍然调用 AMQP client。下面的片段把声明、发布和消费的协议动作放在一条可读链路中，适合对照 Broker
日志阅读；它不应被复制到每次业务请求里：

```java
com.rabbitmq.client.ConnectionFactory factory = new com.rabbitmq.client.ConnectionFactory();
factory.setHost("localhost");
factory.setPort(5672);
try (com.rabbitmq.client.Connection connection = factory.newConnection();
        com.rabbitmq.client.Channel channel = connection.createChannel()) {
    channel.exchangeDeclare("teamflow.raw", "direct", true);
    channel.queueDeclare("teamflow.raw.queue", true, false, false, null);
    channel.queueBind("teamflow.raw.queue", "teamflow.raw", "raw.job");
    channel.basicPublish(
            "teamflow.raw", "raw.job", null, "job-42".getBytes(java.nio.charset.StandardCharsets.UTF_8));
    com.rabbitmq.client.DeliverCallback callback =
            (consumerTag, delivery) ->
                    System.out.println(new String(
                            delivery.getBody(), java.nio.charset.StandardCharsets.UTF_8));
    channel.basicConsume("teamflow.raw.queue", true, callback, consumerTag -> { });
    Thread.sleep(200);
}
```

原生片段中的 `true` 是自动确认参数，只用于让最小演示自动结束，不是可靠消费的推荐设置。连接和通道在 `try` 结束时关闭，
而长期运行的 Spring 应用让容器管理它们。RabbitMQ Java client 的版本由 Spring AMQP 传递管理，不能把 5.x client 和旧 Spring
AMQP 依赖随意拼到同一个 classpath。

## 六、完整 Spring Boot 工程：发布一条报表命令

### 1. 两条版本线使用各自的依赖集合

现代线以 JDK 25 和 Spring Boot 4.1.1 为主；Java 8 兼容线使用 Spring Boot 2.3.12.RELEASE 和 Spring AMQP 2.2.18.RELEASE。
两条线的业务类可以保持相同，但不能在同一个 Maven 工程中同时导入两套 Boot parent 或覆盖传递的 Spring Framework 版本。

:::compare{before="现代线" after="Java 8 兼容线"}
### 现代线

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion>
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.1</version>
  <relativePath/>
</parent>
<groupId>com.example</groupId>
<artifactId>teamflow-rabbit-demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
<properties>
  <java.version>25</java.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
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

### Java 8 兼容线

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
<groupId>com.example</groupId>
<artifactId>teamflow-rabbit-demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
<properties>
  <java.version>1.8</java.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
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

:::

两份 POM 都由 starter 传递 Rabbit Java client；现代线和兼容线的 Spring Framework、client 和 Boot 版本必须成套升级。课程中的
收发类只使用两条线都存在的 `RabbitTemplate`、`QueueBuilder` 和 `@RabbitListener` API，不把新版专属 API 混入兼容示例。

### 2. 两条版本线必须是独立工程

不要把两个 Boot parent 放进同一个 Maven 工程。按下面的目录分别创建两个项目，并将本节后面的相同
`src/main/java` 和 `src/main/resources` 文件复制到对应项目；每个项目只保留自己的 `pom.xml`：

```text
teamflow-rabbit-demo-modern/
  pom.xml
  mvnw  mvnw.cmd  .mvn/wrapper/
  src/main/java/...
  src/main/resources/application.yml
teamflow-rabbit-demo-legacy/
  pom.xml
  mvnw  mvnw.cmd  .mvn/wrapper/
  src/main/java/...
  src/main/resources/application.yml
```

在 IntelliJ IDEA 中分别打开两个目录作为项目，并完成同一套切换：现代工程的 Project SDK、模块 SDK 和
Maven Runner JRE 都选 JDK 25；兼容工程的三处都选 JDK 8。确认现代 `pom.xml` 的 `<java.version>` 为
`25`、兼容线为 `1.8`，然后在 Maven 面板点击 Reload。命令行也要在各自项目根目录检查
`java -version` 和 `mvn -v`，确保 Maven 使用的是同一 JDK。

`./mvnw` 只有在项目根目录存在 `mvnw`、`mvnw.cmd` 和 `.mvn/wrapper/` 时才可用；这些文件应由 Maven
Wrapper 生成并随该独立工程保存。若没有 wrapper，可在对应项目根目录使用已安装且 JRE 正确的
`mvn spring-boot:run`，不能把一个工程的 wrapper 或 `target` 目录混给另一条版本线。

### 3. 配置文件只保留环境变量入口

`src/main/resources/application.yml`：

```yaml
spring:
  application:
    name: teamflow-rabbit-demo
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME}
    password: ${RABBITMQ_PASSWORD}
    virtual-host: ${RABBITMQ_VHOST:/}
```

本机运行时可以临时设置 `RABBITMQ_USERNAME=teamflow` 和 `RABBITMQ_PASSWORD=teamflow-secret`。配置文件不写真实凭据；如果没有
提供凭据，应用会在连接 Broker 时失败，这是环境未准备好，不是拓扑声明代码的错误。

### 4. 启动时发布一次，监听器打印一次

下面四个类组成最小可运行工程。`ApplicationRunner` 只为了在启动后发布一条可观察消息，实际 Web 服务应由 Controller 或应用服务
调用 `ReportCommandPublisher`，不要把业务请求硬编码到启动回调中。

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动 TeamFlow RabbitMQ 示例。 */
@SpringBootApplication
@EnableRabbit
public class TeamFlowRabbitApplication {
    /** 启动应用上下文。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowRabbitApplication.class, args);
    }
}
```

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 为示例声明稳定的 direct 拓扑。 */
@Configuration(proxyBeanMethods = false)
public class TeamFlowRabbitTopology {
    public static final String EXCHANGE = "teamflow.demo";
    public static final String QUEUE = "teamflow.demo.jobs";
    public static final String KEY = "job.created";

    /** 创建 durable direct exchange。 */
    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    /** 创建 durable 工作队列。 */
    @Bean
    public Queue queue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    /** 建立 job.created 路由。 */
    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(KEY);
    }
}
```

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 提供启动时的一次发布动作。 */
@Configuration(proxyBeanMethods = false)
public class DemoPublisherConfiguration {
    /** 创建发布器，验证模板与拓扑可以连通。 */
    @Bean
    public ApplicationRunner publishOnStartup(RabbitTemplate rabbitTemplate) {
        return args -> rabbitTemplate.convertAndSend(
                TeamFlowRabbitTopology.EXCHANGE,
                TeamFlowRabbitTopology.KEY,
                "job-42");
    }
}
```

```java
package com.example.teamflow.rabbit;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/** 消费启动时发布的报表任务。 */
@Component
public class DemoJobListener {
    /** 打印接收到的任务 ID。 */
    @RabbitListener(queues = TeamFlowRabbitTopology.QUEUE)
    public void receive(String jobId) {
        System.out.println("received jobId=" + jobId);
    }
}
```

设置环境变量后运行 `./mvnw spring-boot:run`，预期日志中出现 `received jobId=job-42`。如果只看到连接失败，先验证 `5672`、
用户名、密码和 virtual host；如果看到 `PRECONDITION_FAILED`，检查 Broker 中同名 exchange 或 queue 的现有参数；如果 ready
消息持续增加，检查 listener 是否监听了同一个队列名。示例没有把日志出现当作可靠完成证明，真正的业务状态仍应由应用记录。

### 5. Java 25 和 Java 8 的验证边界

Java 25 运行现代 Boot 工程时，验证重点是 starter、拓扑 Bean、模板和 listener 的实际版本 API；Java 8 运行兼容工程时，验证重点
是同一消息合同在旧依赖集合中仍能编译。两条线都不能只看 `mvn` 退出码，还要确认 Broker 中队列的 `messages_ready` 和监听器
输出与发布数量一致。若本机没有 RabbitMQ，可以先完成下一节的纯 Java 路由练习，但不能把练习通过冒充成真实 Broker 验证。

## 七、集中排查五个收发错误

:::pitfalls
### 把管理端口写成 AMQP 端口

**触发条件：** `spring.rabbitmq.port` 配置为 `15672`，浏览器却能打开管理页面。

**原因：** 15672 是管理插件的 HTTP 端口，Java 客户端需要通过 AMQP 连接 5672。

**后果：** 连接工厂收到协议或连接失败，listener container 无法启动。

**错误示例：**

```yaml
spring:
  rabbitmq:
    port: 15672
```

**正确写法：**

```yaml
spring:
  rabbitmq:
    port: 5672
```

**影响版本：** RabbitMQ 4.3、Spring Boot 4.1.1 和 2.3.12。

**验证方式：** 管理页面请求 `15672` 返回 HTTP，Java 客户端请求 `5672` 建立 AMQP 连接；两者分别检查。

### 直接把 queue 名当成 exchange 发布

**触发条件：** 调用 `convertAndSend("teamflow.demo.jobs", "job-42")`，却没有为默认 exchange 设计同名 routing key。

**原因：** `RabbitTemplate` 的两个参数重载会使用默认 exchange；显式拓扑的 queue 名并不会自动变成自定义 exchange 名。

**后果：** 消息没有进入预期的 `teamflow.demo` 路由，排查时只看到调用成功却没有消费者输出。

**错误示例：**

```java
/** 错把队列名称当成自定义 exchange。 */
rabbitTemplate.convertAndSend("teamflow.demo.jobs", "job-42");
```

**正确写法：**

```java
/** 明确传入 exchange、routing key 和消息体。 */
rabbitTemplate.convertAndSend("teamflow.demo", "job.created", "job-42");
```

**影响版本：** Spring AMQP 4.1.1 和 2.2.18.RELEASE。

**验证方式：** 用 `rabbitmqctl list_bindings` 核对 exchange 与 binding，再查看目标队列的 ready 数量。

### 只改代码，不处理已有对象参数冲突

**触发条件：** 代码把原来的 transient queue 改成 durable，直接重启应用。

**原因：** RabbitMQ 不允许声明同名但属性不同的对象，Spring 不能替换已存在的 queue 定义。

**后果：** 启动日志出现 `PRECONDITION_FAILED`，listener container 没有进入运行状态。

**错误示例：**

```java
/** 代码参数已改，但 Broker 中同名 queue 仍是另一种合同。 */
return new Queue("teamflow.demo.jobs", true);
```

**正确写法：**

```text
先用管理命令核对现有 queue 参数；确认是本机临时对象后再删除并按新合同重新声明。
生产环境使用新的队列名称或经过评审的迁移流程，不能让应用启动时随意删除业务队列。
```

**影响版本：** RabbitMQ 4.3 和所有使用声明 API 的 Spring AMQP 版本。

**验证方式：** 让同名对象参数一致后重启，检查 `list_queues` 和 listener container 状态均正常。

### 每条消息都新建连接和通道

**触发条件：** Controller 的每次请求都执行 `newConnection()`、`createChannel()` 和 `close()`。

**原因：** 把长生命周期连接误当成一次性 HTTP 资源，忽略了 Spring 的连接工厂缓存。

**后果：** 高并发下握手、线程和通道数量快速增加，Broker 和应用都出现资源压力。

**错误示例：**

```java
/** 每条命令都创建连接，吞吐上升时资源会抖动。 */
try (com.rabbitmq.client.Connection connection = factory.newConnection()) {
    connection.createChannel().basicPublish(exchange, key, null, body);
}
```

**正确写法：**

```java
/** 业务只调用由 Spring 管理资源的模板。 */
rabbitTemplate.convertAndSend(exchange, key, body);
```

**影响版本：** RabbitMQ Java client 5.x、Spring AMQP 4.1.1 和 2.2.18.RELEASE。

**验证方式：** 观察 Broker connection/channel 指标；稳定发布过程中连接数应按应用实例数保持在可解释范围内，而不是随请求数增长。

### 让两个订阅者竞争同一个广播队列

**触发条件：** 审计和邮件两个 `@RabbitListener` 都监听 `teamflow.events` 一个队列。

**原因：** 同一 queue 的多个消费者是竞争关系，每条消息只会交给其中一个可用消费者。

**后果：** 一条事件只被审计或邮件处理，另一个订阅者随机漏掉事件。

**错误示例：**

```java
@RabbitListener(queues = "teamflow.events")
public void audit(String body) { }

@RabbitListener(queues = "teamflow.events")
public void email(String body) { }
```

**正确写法：** 为每个订阅者声明独立队列，并把两个队列分别绑定到 fanout exchange；命令型 direct 消息才使用竞争消费者。

```java
/** 审计和邮件各自监听 fanout exchange 的独立队列。 */
@RabbitListener(queues = "audit.events")
public void audit(String body) { }

/** 邮件订阅者不会与审计消费者竞争同一条消息。 */
@RabbitListener(queues = "email.events")
public void email(String body) { }
```

**影响版本：** RabbitMQ 4.3、Spring AMQP 4.1.1 和 2.2.18.RELEASE。

**验证方式：** 发布一条事件后，`audit.events` 与 `email.events` 各出现一条 ready 或消费记录，而不是两者合计一条。
:::

## 八、练习：把路由规则变成可运行反馈

:::exercise
### 实现 direct、fanout 和 topic 三种拓扑模拟

**要求：** 编写一个不依赖 Spring 或外部 RabbitMQ 的 Java 程序 `RabbitMqRoutingExercise`，用内存对象模拟 exchange、binding、queue 和 consumer。direct exchange 只把 `report.request` 发送到精确匹配的队列，且相同 key 绑定的两个队列都收到一份；fanout exchange 忽略 routing key，把 `invoice.created` 广播给 audit 与 email 两个独立队列；topic exchange 中 `audit.*` 匹配 `audit.login` 但不匹配 `audit.login.failed`，`audit.#` 能匹配后者。消费每个队列中的消息并打印队列名、payload 和接收数量，不实现 acknowledgement、重试、死信或 publisher confirm。代码只能使用 Java 8 已有语法和标准库，使 JDK 25 与 Java 8 运行同一份源码。

**验收：**

```text
direct.report=job-42
direct.audit=job-42
fanout.audit=invoice-7
fanout.email=invoice-7
topic.security=audit.login
topic.all=audit.login,audit.login.failed
direct.report.count=1
direct.audit.count=1
fanout.audit.count=1
fanout.email.count=1
topic.security.count=1
topic.all.count=2
```
:::

### 参考实现

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 用标准库模拟 RabbitMQ 三种 exchange 的路由规则。 */
public final class RabbitMqRoutingExercise {
    /** 运行三种 exchange 的最小路由反馈。 */
    public static void main(String[] args) {
        Exchange direct = new Exchange("direct", "direct");
        direct.bind("report", "report.request");
        direct.bind("audit", "report.request");
        direct.publish("report.request", "job-42");

        Exchange fanout = new Exchange("fanout", "fanout");
        fanout.bind("fanout.audit", "ignored");
        fanout.bind("fanout.email", "ignored");
        fanout.publish("anything", "invoice-7");

        Exchange topic = new Exchange("topic", "topic");
        topic.bind("topic.security", "audit.*");
        topic.bind("topic.all", "audit.#");
        topic.publish("audit.login", "audit.login");
        topic.publish("audit.login.failed", "audit.login.failed");

        List<String> directReportMessages = direct.take("report");
        List<String> directAuditMessages = direct.take("audit");
        List<String> fanoutAuditMessages = fanout.take("fanout.audit");
        List<String> fanoutEmailMessages = fanout.take("fanout.email");
        List<String> securityMessages = topic.take("topic.security");
        List<String> allMessages = topic.take("topic.all");
        print("direct.report", directReportMessages);
        print("direct.audit", directAuditMessages);
        print("fanout.audit", fanoutAuditMessages);
        print("fanout.email", fanoutEmailMessages);
        print("topic.security", securityMessages);
        print("topic.all", allMessages);
        System.out.println("direct.report.count=" + directReportMessages.size());
        System.out.println("direct.audit.count=" + directAuditMessages.size());
        System.out.println("fanout.audit.count=" + fanoutAuditMessages.size());
        System.out.println("fanout.email.count=" + fanoutEmailMessages.size());
        System.out.println("topic.security.count=" + securityMessages.size());
        System.out.println("topic.all.count=" + allMessages.size());
    }

    /** 输出一个队列当前收到的消息。 */
    private static void print(String name, List<String> messages) {
        System.out.println(name + "=" + join(messages));
    }

    /** 把消息列表按验收格式连接起来。 */
    private static String join(List<String> messages) {
        StringBuilder result = new StringBuilder();
        for (String message : messages) {
            if (result.length() > 0) {
                result.append(',');
            }
            result.append(message);
        }
        return result.toString();
    }

    /** 表示一个 exchange 及其 binding。 */
    private static final class Exchange {
        private final String type;
        private final Map<String, List<Binding>> bindings = new LinkedHashMap<String, List<Binding>>();
        private final Map<String, Deque<String>> queues = new LinkedHashMap<String, Deque<String>>();

        /** 创建指定类型的内存 exchange。 */
        private Exchange(String name, String type) {
            this.type = type;
        }

        /** 为队列添加一条 binding。 */
        private void bind(String queue, String key) {
            queues.put(queue, new ArrayDeque<String>());
            List<Binding> queueBindings = bindings.get(queue);
            if (queueBindings == null) {
                queueBindings = new ArrayList<Binding>();
                bindings.put(queue, queueBindings);
            }
            queueBindings.add(new Binding(key));
        }

        /** 根据 exchange 类型把消息复制到匹配队列。 */
        private void publish(String routingKey, String payload) {
            for (Map.Entry<String, List<Binding>> entry : bindings.entrySet()) {
                boolean matched = false;
                for (Binding binding : entry.getValue()) {
                    if (matches(binding.key, routingKey)) {
                        matched = true;
                        break;
                    }
                }
                if (matched) {
                    queues.get(entry.getKey()).addLast(payload);
                }
            }
        }

        /** 取出一个队列当前的所有消息。 */
        private List<String> take(String queue) {
            List<String> result = new ArrayList<String>();
            Deque<String> messages = queues.get(queue);
            while (messages != null && !messages.isEmpty()) {
                result.add(messages.removeFirst());
            }
            return result;
        }

        /** 按 direct、fanout 或 topic 规则匹配 binding。 */
        private boolean matches(String bindingKey, String routingKey) {
            if ("fanout".equals(type)) {
                return true;
            }
            if ("direct".equals(type)) {
                return bindingKey.equals(routingKey);
            }
            return topicMatches(bindingKey, routingKey);
        }

        /** 执行 topic 的 * 和 # 匹配。 */
        private boolean topicMatches(String pattern, String routingKey) {
            String[] patternParts = pattern.split("\\.");
            String[] keyParts = routingKey.split("\\.");
            return topicMatches(patternParts, 0, keyParts, 0);
        }

        /** 递归消费一段 topic 模式。 */
        private boolean topicMatches(String[] pattern, int patternIndex, String[] key, int keyIndex) {
            if (patternIndex == pattern.length) {
                return keyIndex == key.length;
            }
            String token = pattern[patternIndex];
            if ("#".equals(token)) {
                if (topicMatches(pattern, patternIndex + 1, key, keyIndex)) {
                    return true;
                }
                return keyIndex < key.length && topicMatches(pattern, patternIndex, key, keyIndex + 1);
            }
            if (keyIndex == key.length) {
                return false;
            }
            return ("*".equals(token) || token.equals(key[keyIndex]))
                    && topicMatches(pattern, patternIndex + 1, key, keyIndex + 1);
        }
    }

    /** 保存一条 binding key。 */
    private static final class Binding {
        private final String key;

        /** 创建 binding。 */
        private Binding(String key) {
            this.key = key;
        }
    }
}
```

在临时目录执行 `javac RabbitMqRoutingExercise.java && java RabbitMqRoutingExercise`，再用同一文件在 Java 8 环境运行。
如果输出顺序或数量不符，先检查 topic 的 `#` 是否允许匹配零段、fanout 是否错误比较 routing key，以及同一消息是否被复制
到所有匹配队列。这个练习只验证路由模型，不能替代本课真实 Spring Boot + RabbitMQ 的连接验证。

本课完成后，学习者应该能从一个 exchange、queue、binding 和 listener 的实际配置解释消息去向，并能用管理端口、Broker 命令和
应用日志定位“连不上”“声明冲突”“没有路由”和“两个订阅者互相抢消息”四类问题。确认、重投、重试、死信、幂等以及数据库
outbox 会在下一课建立可恢复的消费合同。
