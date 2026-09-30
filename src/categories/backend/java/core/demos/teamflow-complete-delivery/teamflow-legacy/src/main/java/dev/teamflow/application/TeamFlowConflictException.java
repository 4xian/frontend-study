package dev.teamflow.application;

/** TeamFlow 应用状态冲突。 */
public class TeamFlowConflictException extends RuntimeException {
  private final String code;
  private final boolean replayed;

  /**
   * 创建状态冲突异常。
   *
   * @param code 稳定错误码
   * @param message 失败说明
   */
  public TeamFlowConflictException(String code, String message) {
    this(code, message, false);
  }

  /** 创建可标记为幂等回放的状态冲突。 */
  public TeamFlowConflictException(String code, String message, boolean replayed) {
    super(message);
    this.code = code;
    this.replayed = replayed;
  }

  /** @return 稳定错误码 */
  public String getCode() {
    return code;
  }

  /** @return 是否来自已保存的幂等失败态 */
  public boolean isReplayed() {
    return replayed;
  }
}
