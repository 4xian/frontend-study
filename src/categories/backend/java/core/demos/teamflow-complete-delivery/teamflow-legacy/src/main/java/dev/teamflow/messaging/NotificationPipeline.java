package dev.teamflow.messaging;

import dev.teamflow.persistence.TeamFlowMapper;
import dev.teamflow.persistence.TeamFlowRows;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 用 outbox、发布确认和 inbox 唯一键连接任务事务与通知副作用。 */
@Component
public class NotificationPipeline {
  private static final int MAX_PUBLISH_ATTEMPTS = 3;
  private static final Logger log = LoggerFactory.getLogger(NotificationPipeline.class);

  private final TeamFlowMapper mapper;
  private final RabbitTemplate rabbitTemplate;

  /**
   * 注入 outbox 真相源与消息发布入口。
   *
   * @param mapper MyBatis 持久化入口
   * @param rabbitTemplate RabbitMQ 发布入口
   */
  public NotificationPipeline(TeamFlowMapper mapper, RabbitTemplate rabbitTemplate) {
    this.mapper = mapper;
    this.rabbitTemplate = rabbitTemplate;
  }

  /** 定期发布尚未确认的 outbox 事件。 */
  @Scheduled(fixedDelayString = "${teamflow.relay.delay-ms:500}")
  public void relayPendingEvents() {
    List<TeamFlowRows.OutboxRow> records = mapper.listPendingOutbox();
    for (TeamFlowRows.OutboxRow record : records) {
      publish(record);
    }
  }

  /**
   * 以 eventId 作为相关 ID 发布事件，并在 Broker 确认后更新 outbox。
   *
   * @param record 待发布 outbox 行
   */
  private void publish(TeamFlowRows.OutboxRow record) {
    try {
      CorrelationData correlationData = new CorrelationData(record.eventId);
      rabbitTemplate.convertAndSend(
          RabbitConfiguration.EXCHANGE,
          RabbitConfiguration.ROUTING_KEY,
          record.eventId + "|" + record.taskId,
          correlationData);
      CorrelationData.Confirm confirm = correlationData.getFuture().get(5, TimeUnit.SECONDS);
      if (!confirm.isAck()) {
        throw new IllegalStateException("RabbitMQ rejected event: " + confirm.getReason());
      }
      mapper.markOutboxPublished(record.eventId);
      log.info(
          "notification_publish traceId={} path=/outbox status=PUBLISHED eventId={} taskId={} attempts={} failureReason=none",
          java.util.UUID.randomUUID(),
          record.eventId,
          record.taskId,
          attempts(record.eventId));
    } catch (Exception exception) {
      int currentAttempts = attempts(record.eventId);
      String failureReason = exception.getClass().getSimpleName();
      if (currentAttempts >= MAX_PUBLISH_ATTEMPTS) {
        mapper.markOutboxDead(record.eventId, failureReason);
      } else {
        mapper.markOutboxRetry(record.eventId);
      }
      log.warn(
          "notification_publish traceId={} path=/outbox status={} eventId={} taskId={} attempts={} failureReason={}",
          java.util.UUID.randomUUID(),
          currentAttempts >= MAX_PUBLISH_ATTEMPTS ? "DEAD" : "RETRY_WAIT",
          record.eventId,
          record.taskId,
          currentAttempts,
          failureReason);
    }
  }

  /**
   * 用 inbox 唯一键吸收重复消息，并只创建一次通知。
   *
   * @param payload eventId 与 taskId 组成的消息
   */
  @RabbitListener(queues = RabbitConfiguration.QUEUE)
  @Transactional
  public void consumeTaskCompleted(String payload) {
    String[] parts = payload.split("\\|", -1);
    if (parts.length != 2) {
      log.warn(
          "notification_consume traceId={} path=/messages/task.completed status=400 eventId=unknown attempts=0 failureReason=INVALID_PAYLOAD",
          java.util.UUID.randomUUID());
      throw new IllegalArgumentException("Unexpected notification payload");
    }
    try {
      mapper.insertInbox(parts[0]);
    } catch (DuplicateKeyException duplicate) {
      log.info(
          "Notification event {} was already consumed traceId={} path=/messages/task.completed status=200 eventId={} attempts={} failureReason=none",
          parts[0],
          java.util.UUID.randomUUID(),
          parts[0],
          attempts(parts[0]));
      return;
    }
    mapper.insertNotification(parts[0], parts[1], "Task " + parts[1] + " completed");
    log.info(
        "notification_consume traceId={} path=/messages/task.completed status=200 eventId={} attempts={} failureReason=none",
        java.util.UUID.randomUUID(),
        parts[0],
        attempts(parts[0]));
  }

  /** 读取事件当前的 outbox 重试次数。 */
  private int attempts(String eventId) {
    return mapper.findOutboxAttempts(eventId);
  }
}
