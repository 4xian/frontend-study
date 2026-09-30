package dev.teamflow.domain;

/** 限定任务从待开始到完成的有限状态。 */
public enum TaskStatus {
  BACKLOG,
  IN_PROGRESS,
  DONE
}
