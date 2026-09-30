package dev.teamflow.application;

/** 隐藏成员关系变更所需的授权缓存协调细节。 */
public interface MembershipAccessCache {
  /**
   * 在当前成员写事务中建立失败关闭护栏，并安排提交后的缓存失效。
   *
   * @param teamId 成员关系发生变化的团队 ID
   */
  void guardChange(String teamId);
}
