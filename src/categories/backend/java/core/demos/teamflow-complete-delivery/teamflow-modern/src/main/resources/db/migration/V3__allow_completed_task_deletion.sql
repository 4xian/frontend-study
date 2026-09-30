ALTER TABLE notification_outbox
  DROP FOREIGN KEY fk_outbox_task;

ALTER TABLE notification_outbox
  ADD CONSTRAINT fk_outbox_task
  FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE;

ALTER TABLE notification
  DROP FOREIGN KEY fk_notification_task;

ALTER TABLE notification
  ADD CONSTRAINT fk_notification_task
  FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE;
