package dev.teamflow.domain;

/** 集中执行领域对象共享的最小文本校验。 */
final class DomainValues {
  private DomainValues() {}

  /**
   * 校验并清理稳定标识。
   *
   * @param value 原始标识
   * @param field 字段名称
   * @return 清理后的标识
   */
  static String identifier(String value, String field) {
    return text(value, field, 40);
  }

  /**
   * 校验并清理领域文本。
   *
   * @param value 原始文本
   * @param field 字段名称
   * @param maxLength 最大长度
   * @return 清理后的文本
   */
  static String text(String value, String field, int maxLength) {
    if (value == null) {
      throw new IllegalArgumentException(field + " cannot be null");
    }
    String normalized = value.trim();
    if (normalized.isEmpty() || normalized.length() > maxLength) {
      throw new IllegalArgumentException(
          field + " must contain 1 to " + maxLength + " characters");
    }
    return normalized;
  }
}
