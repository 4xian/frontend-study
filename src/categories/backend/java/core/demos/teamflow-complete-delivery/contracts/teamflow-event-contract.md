# TeamFlow 事件合同

## `TaskCompleted`

任务完成事务提交后，在 `notification_outbox` 中写入一条事件，并由 relay 发布到 RabbitMQ。

| 字段 | 类型 | 合同 |
| --- | --- | --- |
| `eventId` | string | UUID，outbox 主键、RabbitMQ correlation id 和 inbox 唯一键使用同一值 |
| `taskId` | string | 已完成任务的 ID |
| `eventType` | string | 固定为 `TaskCompleted` |
| `status` | string | outbox 初始为 `NEW`，发布成功为 `PUBLISHED`，失败重试为 `RETRY_WAIT` |
| `attempts` | integer | 发布失败重试次数，初始为 `0` |

RabbitMQ 使用持久 Direct exchange `teamflow.events`、队列
`teamflow.notification.task-completed` 和 routing key `task.completed`。当前版本的消息体是
`eventId|taskId`，字段顺序固定；`eventId` 不得在 relay 重试时重新生成。

消费者先在 `notification_inbox` 写入 `eventId`。唯一键命中时确认并跳过通知副作用；首次消费才在
`notification` 中写入一条通知。该合同保证重复投递不会重复创建通知，但不承诺跨数据库和 Broker 的全局
exactly-once。
