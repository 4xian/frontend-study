import type { ReactElement } from 'react'

import { useShoppingCartDispatch, useShoppingCartSelector } from '../../app/hooks'
import {
  cartCleared,
  cartReset,
  couponChanged,
  productAdded,
  productRemoved,
  quantityDecremented,
  quantityIncremented,
  selectCartDiscount,
  selectCartLines,
  selectCartPayable,
  selectCartQuantity,
  selectCartSubtotal,
  selectCouponCode,
  type CouponCode,
} from './cartSlice'
import { getProductById, products, type ProductId } from './products'

/** 把以分保存的整数金额格式化为人民币。 */
function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amountInCents / 100)
}

/** 显示商品目录、购物车条目与派生金额。 */
export function CartPanel(): ReactElement {
  const dispatch = useShoppingCartDispatch()
  const lines = useShoppingCartSelector(selectCartLines)
  const quantity = useShoppingCartSelector(selectCartQuantity)
  const subtotal = useShoppingCartSelector(selectCartSubtotal)
  const discount = useShoppingCartSelector(selectCartDiscount)
  const payable = useShoppingCartSelector(selectCartPayable)
  const couponCode = useShoppingCartSelector(selectCouponCode)

  /** 派发商品加入购物车 action。 */
  function addProduct(productId: ProductId): void {
    dispatch(productAdded(productId))
  }

  /** 派发购物车条目数量增加 action。 */
  function incrementQuantity(productId: ProductId): void {
    dispatch(quantityIncremented(productId))
  }

  /** 派发购物车条目数量减少 action。 */
  function decrementQuantity(productId: ProductId): void {
    dispatch(quantityDecremented(productId))
  }

  /** 派发购物车条目移除 action。 */
  function removeProduct(productId: ProductId): void {
    dispatch(productRemoved(productId))
  }

  /** 在无优惠和九折优惠之间切换。 */
  function toggleCoupon(): void {
    const nextCoupon: CouponCode = couponCode === 'SAVE10' ? 'none' : 'SAVE10'
    dispatch(couponChanged(nextCoupon))
  }

  /** 派发购物车清空 action。 */
  function clearCart(): void {
    dispatch(cartCleared())
  }

  /** 派发购物车重置 action。 */
  function resetCart(): void {
    dispatch(cartReset())
  }

  return (
    <section className="shopping-cart-center" aria-label="购物车状态中心">
      <header className="shopping-cart-header">
        <div>
          <span>features/cart</span>
          <h2>购物车状态中心</h2>
        </div>
        <strong data-testid="cart-quantity">{quantity} 件商品</strong>
      </header>

      <section className="shopping-cart-catalog" aria-labelledby="cart-catalog-title">
        <div className="shopping-cart-section-heading">
          <h3 id="cart-catalog-title">商品目录</h3>
          <span>目录数据不重复写入 cart state</span>
        </div>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.description}</span>
              </div>
              <div className="shopping-cart-product-action">
                <b>{formatCurrency(product.priceCents)}</b>
                <button
                  type="button"
                  data-testid={`cart-add-${product.id}`}
                  onClick={() => addProduct(product.id)}
                >
                  加入
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="shopping-cart-lines" aria-labelledby="cart-lines-title">
        <div className="shopping-cart-section-heading">
          <h3 id="cart-lines-title">购物车明细</h3>
          <span>{lines.length} 个条目</span>
        </div>
        {lines.length === 0 ? (
          <p className="shopping-cart-empty" data-testid="cart-empty">
            购物车为空，可以从商品目录重新加入
          </p>
        ) : (
          <ul>
            {lines.map((line) => {
              const product = getProductById(line.productId)
              return (
                <li key={line.productId} data-testid={`cart-line-${line.productId}`}>
                  <div className="shopping-cart-line-info">
                    <strong>{product.name}</strong>
                    <span>{formatCurrency(product.priceCents * line.quantity)}</span>
                  </div>
                  <div
                    className="shopping-cart-quantity-control"
                    aria-label={`${product.name}数量`}
                  >
                    <button
                      type="button"
                      aria-label={`减少${product.name}数量`}
                      data-testid={`cart-decrement-${line.productId}`}
                      onClick={() => decrementQuantity(line.productId)}
                    >
                      −
                    </button>
                    <output aria-label={`${product.name}当前数量`}>{line.quantity}</output>
                    <button
                      type="button"
                      aria-label={`增加${product.name}数量`}
                      data-testid={`cart-increment-${line.productId}`}
                      onClick={() => incrementQuantity(line.productId)}
                    >
                      +
                    </button>
                    <button
                      className="shopping-cart-remove"
                      type="button"
                      data-testid={`cart-remove-${line.productId}`}
                      onClick={() => removeProduct(line.productId)}
                    >
                      移除
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="shopping-cart-summary" aria-label="订单汇总">
        <dl>
          <div>
            <dt>商品小计</dt>
            <dd data-testid="cart-subtotal">{formatCurrency(subtotal)}</dd>
          </div>
          <div>
            <dt>优惠</dt>
            <dd data-testid="cart-discount">−{formatCurrency(discount)}</dd>
          </div>
          <div className="shopping-cart-payable">
            <dt>应付金额</dt>
            <dd data-testid="cart-payable">{formatCurrency(payable)}</dd>
          </div>
        </dl>
        <div className="shopping-cart-actions">
          <button
            type="button"
            aria-pressed={couponCode === 'SAVE10'}
            data-testid="cart-coupon"
            onClick={toggleCoupon}
          >
            {couponCode === 'SAVE10' ? '移除 SAVE10' : '使用 SAVE10'}
          </button>
          <button type="button" data-testid="cart-clear" onClick={clearCart}>
            清空购物车
          </button>
          <button type="button" data-testid="cart-reset" onClick={resetCart}>
            恢复初始状态
          </button>
        </div>
      </section>
    </section>
  )
}
