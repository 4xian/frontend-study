import { create } from 'zustand'
import { type ComponentType } from 'react'

import './shopping-cart-demo.css'

type CartItem = {
  id: string
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartActions = {
  addItem: (id: string) => void
  increase: (id: string) => void
  decrease: (id: string) => void
  removeItem: (id: string) => void
  reset: () => void
}

type CartStore = CartState & CartActions

type CatalogProduct = {
  id: string
  title: string
  price: number
}

const catalogProducts: CatalogProduct[] = [
  { id: 'note', title: '课堂笔记夹', price: 12 },
  { id: 'pen', title: '标记笔', price: 6 },
  { id: 'sticker', title: '知识点贴纸', price: 4 },
]

const initialCartState: CartState = {
  items: [],
}

/** 按商品 ID 从只读目录读取展示信息。 */
function findProduct(id: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === id)
}

const useCartStore = create<CartStore>()((set, get) => ({
  ...initialCartState,
  /** 已存在则数量加一，否则追加新行。 */
  addItem: (id) => {
    const current = get().items.find((item) => item.id === id)
    if (current) {
      set({
        items: get().items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      })
      return
    }
    set({ items: [...get().items, { id, quantity: 1 }] })
  },
  /** 指定行数量加一。 */
  increase: (id) =>
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    }),
  /** 指定行数量减一，到 0 则移除。 */
  decrease: (id) =>
    set({
      items: get()
        .items.map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    }),
  /** 移除指定行。 */
  removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
  /** 清空购物车条目。 */
  reset: () => set(initialCartState),
}))

/** 只选择 addItem，展示只读目录。 */
function ProductCatalog() {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <section className="cart-panel" data-testid="product-catalog">
      <span>只读目录</span>
      <ul>
        {catalogProducts.map((product) => (
          <li key={product.id}>
            <span>
              {product.title} ¥{product.price}
            </span>
            <button type="button" onClick={() => addItem(product.id)}>
              加入{product.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** 选择条目与数量 Action，展示可编辑行。 */
function CartLines() {
  const items = useCartStore((state) => state.items)
  const increase = useCartStore((state) => state.increase)
  const decrease = useCartStore((state) => state.decrease)
  const removeItem = useCartStore((state) => state.removeItem)

  if (items.length === 0) {
    return (
      <section className="cart-panel" data-testid="cart-lines">
        <span>购物车条目</span>
        <p data-testid="empty-cart">购物车是空的</p>
      </section>
    )
  }

  return (
    <section className="cart-panel" data-testid="cart-lines">
      <span>购物车条目</span>
      <ul>
        {items.map((item) => {
          const product = findProduct(item.id)
          if (!product) return null
          return (
            <li key={item.id} data-testid={`cart-line-${item.id}`}>
              <span>
                {product.title} ×{item.quantity}
              </span>
              <div className="cart-line-actions">
                <button
                  type="button"
                  onClick={() => decrease(item.id)}
                  aria-label={`减少${product.title}`}
                >
                  减少
                </button>
                <button
                  type="button"
                  onClick={() => increase(item.id)}
                  aria-label={`增加${product.title}`}
                >
                  增加
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`移除${product.title}`}
                >
                  移除
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** 选择条目后派生件数与合计。 */
function CartSummary() {
  const items = useCartStore((state) => state.items)
  const count = items.reduce((total, item) => total + item.quantity, 0)
  const amount = items.reduce((total, item) => {
    const product = findProduct(item.id)
    return total + (product ? product.price * item.quantity : 0)
  }, 0)

  return (
    <article className="cart-panel" data-testid="cart-summary">
      <span>渲染时派生</span>
      <strong data-testid="cart-count">{count} 件</strong>
      <p data-testid="cart-amount">合计 ¥{amount}</p>
    </article>
  )
}

/** 展示购物车条目、数量更新、移除和汇总。 */
function ShoppingCartDemo() {
  const reset = useCartStore((state) => state.reset)

  return (
    <section className="cart-demo" data-testid="shopping-cart-demo">
      <header className="cart-heading">
        <p>购物车状态</p>
        <h2>Store 保存条目，合计在渲染时计算</h2>
        <span>目录不进 Store；加减和移除都走不可变数组更新。</span>
      </header>

      <div className="cart-panels">
        <ProductCatalog />
        <CartSummary />
      </div>

      <CartLines />

      <div className="cart-controls">
        <button type="button" onClick={reset}>
          清空购物车
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供购物车观察组件。 */
export function createShoppingCartDemo(): ComponentType {
  return ShoppingCartDemo
}
