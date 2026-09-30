ALTER TABLE notification_outbox
  ADD COLUMN last_error VARCHAR(120) NULL;
