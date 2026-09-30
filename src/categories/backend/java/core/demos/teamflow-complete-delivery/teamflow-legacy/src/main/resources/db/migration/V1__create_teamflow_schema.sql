CREATE TABLE directory_sequence (
  resource_type VARCHAR(24) PRIMARY KEY,
  next_value BIGINT NOT NULL
);

CREATE TABLE teamflow_user (
  id VARCHAR(40) PRIMARY KEY,
  display_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL,
  CONSTRAINT uk_teamflow_user_email UNIQUE (email)
);

CREATE TABLE team (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(120) NOT NULL
);

CREATE TABLE team_member (
  id VARCHAR(40) PRIMARY KEY,
  team_id VARCHAR(40) NOT NULL,
  user_id VARCHAR(40) NOT NULL,
  role VARCHAR(40) NOT NULL,
  CONSTRAINT uk_team_member_user UNIQUE (team_id, user_id),
  CONSTRAINT fk_team_member_team FOREIGN KEY (team_id) REFERENCES team (id),
  CONSTRAINT fk_team_member_user FOREIGN KEY (user_id) REFERENCES teamflow_user (id)
);

CREATE TABLE project (
  id VARCHAR(40) PRIMARY KEY,
  team_id VARCHAR(40) NOT NULL,
  name VARCHAR(120) NOT NULL,
  CONSTRAINT fk_project_team FOREIGN KEY (team_id) REFERENCES team (id)
);

CREATE TABLE task (
  id VARCHAR(40) PRIMARY KEY,
  project_id VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  due_at VARCHAR(40) NOT NULL,
  assignee VARCHAR(80) NOT NULL,
  status VARCHAR(24) NOT NULL,
  version BIGINT NOT NULL,
  CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES project (id)
);

CREATE INDEX ix_task_project_status ON task (project_id, status, id);

CREATE TABLE notification_outbox (
  event_id VARCHAR(40) PRIMARY KEY,
  task_id VARCHAR(40) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  status VARCHAR(24) NOT NULL,
  attempts INT NOT NULL,
  CONSTRAINT fk_outbox_task FOREIGN KEY (task_id) REFERENCES task (id)
);

CREATE TABLE notification_inbox (
  event_id VARCHAR(40) PRIMARY KEY,
  consumed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(40) NOT NULL,
  task_id VARCHAR(40) NOT NULL,
  message VARCHAR(240) NOT NULL,
  CONSTRAINT uk_notification_event UNIQUE (event_id),
  CONSTRAINT fk_notification_task FOREIGN KEY (task_id) REFERENCES task (id)
);
