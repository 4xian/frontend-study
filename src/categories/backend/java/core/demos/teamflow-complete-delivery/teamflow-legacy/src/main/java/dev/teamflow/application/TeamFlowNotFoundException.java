package dev.teamflow.application;

/** TeamFlow 应用资源不存在。 */
public class TeamFlowNotFoundException extends RuntimeException {
  /**
   * 创建资源不存在异常。
   *
   * @param message 失败说明
   */
  public TeamFlowNotFoundException(String message) {
    super(message);
  }
}
