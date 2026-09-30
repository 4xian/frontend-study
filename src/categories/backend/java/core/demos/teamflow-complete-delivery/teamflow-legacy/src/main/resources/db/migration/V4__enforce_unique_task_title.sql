ALTER TABLE task
  ADD CONSTRAINT uk_task_project_title UNIQUE (project_id, title);
