package dev.teamflow.web;

/** TeamFlow 认证失败。 */
public class TeamFlowUnauthorizedException extends RuntimeException {
  /**
   * 创建认证失败异常。
   *
   * @param message 面向客户端的失败说明
   */
  public TeamFlowUnauthorizedException(String message) {
    super(message);
  }
}
