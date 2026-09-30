package dev.teamflow.web;

import dev.teamflow.application.TeamFlowBadRequestException;

/** 解析 Web 分页参数并把应用偏移量编码回公开 token。 */
final class PaginationSupport {
  private PaginationSupport() {}

  /**
   * 校验分页范围并解析当前资源集合的 token。
   *
   * @param pageSize 每页数量
   * @param pageToken 公开分页 token
   * @param prefix 当前资源 token 前缀
   * @return 应用层使用的零基偏移量
   */
  static int offset(int pageSize, String pageToken, String prefix) {
    if (pageSize < 1 || pageSize > 50) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_SIZE", "pageSize must be from 1 to 50");
    }
    if (pageToken == null) {
      return 0;
    }
    if (!pageToken.startsWith(prefix)) {
      throw invalidToken();
    }
    String positionText = pageToken.substring(prefix.length());
    try {
      int position = Integer.parseInt(positionText);
      if (!Integer.toString(position).equals(positionText) || position <= 1) {
        throw invalidToken();
      }
      return position - 1;
    } catch (NumberFormatException exception) {
      throw invalidToken();
    }
  }

  /** 编码应用层返回的下一页偏移量。 */
  static String nextToken(String prefix, Integer nextOffset) {
    return nextOffset == null ? null : prefix + (nextOffset + 1);
  }

  /** 创建稳定分页错误。 */
  private static TeamFlowBadRequestException invalidToken() {
    return new TeamFlowBadRequestException(
        "INVALID_PAGE_TOKEN", "pageToken does not belong to this resource collection");
  }
}
