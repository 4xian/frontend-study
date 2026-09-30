package dev.teamflow.application;

/** TeamFlow 应用输入不符合业务合同。 */
public class TeamFlowBadRequestException extends RuntimeException {
  private final String code;

  /**
   * 创建输入校验异常。
   *
   * @param code 稳定错误码
   * @param message 失败说明
   */
  public TeamFlowBadRequestException(String code, String message) {
    super(message);
    this.code = code;
  }

  /** @return 稳定错误码 */
  public String getCode() {
    return code;
  }
}
