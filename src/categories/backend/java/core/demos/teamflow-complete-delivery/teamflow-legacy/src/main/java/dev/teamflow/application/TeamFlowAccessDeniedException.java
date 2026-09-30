package dev.teamflow.application;

/** 表示已认证主体不具备当前资源归属。 */
public class TeamFlowAccessDeniedException extends RuntimeException {

  /**
   * 创建资源访问拒绝异常。
   *
   * @param message 拒绝原因
   */
  public TeamFlowAccessDeniedException(String message) {
    super(message);
  }
}
