package dev.teamflow.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/** 表示按两位小数保存的精确金额值。 */
public final class Money {
  private final String currency;
  private final BigDecimal amount;

  /**
   * 创建金额并统一到两位小数。
   *
   * @param currency 三位大写币种代码
   * @param amount 金额数值
   */
  public Money(String currency, BigDecimal amount) {
    if (currency == null || !currency.matches("[A-Z]{3}")) {
      throw new IllegalArgumentException("currency must be a three-letter uppercase code");
    }
    if (amount == null) {
      throw new IllegalArgumentException("amount cannot be null");
    }
    this.currency = currency;
    this.amount = amount.setScale(2, RoundingMode.HALF_UP);
  }

  /** @return 三位大写币种代码 */
  public String currency() {
    return currency;
  }

  /** @return 两位小数金额 */
  public BigDecimal amount() {
    return amount;
  }

  /**
   * 加上相同币种的金额。
   *
   * @param other 另一个金额
   * @return 相加后的金额
   */
  public Money add(Money other) {
    requireSameCurrency(other);
    return new Money(currency, amount.add(other.amount));
  }

  /**
   * 减去相同币种的金额。
   *
   * @param other 另一个金额
   * @return 相减后的金额
   */
  public Money subtract(Money other) {
    requireSameCurrency(other);
    return new Money(currency, amount.subtract(other.amount));
  }

  /** 按币种和数值判断金额相等，忽略 BigDecimal scale 差异。 */
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof Money)) {
      return false;
    }
    Money money = (Money) other;
    return currency.equals(money.currency) && amount.compareTo(money.amount) == 0;
  }

  /** @return 币种与金额的稳定哈希值 */
  @Override
  public int hashCode() {
    return Objects.hash(currency, amount.stripTrailingZeros());
  }

  /** @return 币种和两位金额文本 */
  @Override
  public String toString() {
    return currency + " " + amount.toPlainString();
  }

  /** 校验金额币种一致。 */
  private void requireSameCurrency(Money other) {
    if (other == null || !currency.equals(other.currency)) {
      throw new IllegalArgumentException("money currencies must match");
    }
  }
}
