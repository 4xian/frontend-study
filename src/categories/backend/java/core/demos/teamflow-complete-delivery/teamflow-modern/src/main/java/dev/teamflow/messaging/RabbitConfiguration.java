package dev.teamflow.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 声明 TeamFlow 通知链路使用的持久交换机、队列和绑定。 */
@Configuration
public class RabbitConfiguration {
  public static final String EXCHANGE = "teamflow.events";
  public static final String QUEUE = "teamflow.notification.task-completed";
  public static final String ROUTING_KEY = "task.completed";

  /** 返回通知事件交换机。 */
  @Bean
  public DirectExchange teamflowExchange() {
    return new DirectExchange(EXCHANGE, true, false);
  }

  /** 返回任务完成通知队列。 */
  @Bean
  public Queue taskCompletedQueue() {
    return QueueBuilder.durable(QUEUE).build();
  }

  /** 把任务完成路由键绑定到通知队列。 */
  @Bean
  public Binding taskCompletedBinding(DirectExchange teamflowExchange, Queue taskCompletedQueue) {
    return BindingBuilder.bind(taskCompletedQueue).to(teamflowExchange).with(ROUTING_KEY);
  }
}
