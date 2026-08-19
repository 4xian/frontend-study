import { useState } from 'react'
import './render-and-event-boundary-demo.css'

type PurchaseAction = 'add-to-cart' | 'checkout'

type Customer = Readonly<{
  id: string
  name: string
  initialNote: string
}>

type OrderSummary = Readonly<{
  subtotal: number
  discount: number
  total: number
}>

type ActionRecord = Readonly<{
  action: PurchaseAction
  customerName: string
}>

const UNIT_PRICE = 80

const CUSTOMERS: readonly Customer[] = [
  { id: 'lin', name: '林晓', initialNote: '' },
  { id: 'chen', name: '陈默', initialNote: '' },
]

const DEFAULT_CUSTOMER = CUSTOMERS[0]!

/** 根据当前单价和数量纯计算本次渲染需要的订单摘要。 */
function calculateOrderSummary(price: number, quantity: number): OrderSummary {
  const subtotal = price * quantity
  const discount = quantity >= 5 ? 20 : 0
  return { subtotal, discount, total: subtotal - discount }
}

/** 把业务动作转换为界面使用的中文标签。 */
function getActionLabel(action: PurchaseAction | null): string {
  if (action === 'add-to-cart') return '加入购物车'
  if (action === 'checkout') return '立即结算'
  return '尚未执行动作'
}

/** 渲染一个拥有局部草稿的订单编辑器，并在事件中通知父组件。 */
function OrderEditor({
  customer,
  onAction,
}: {
  customer: Customer
  onAction: (record: ActionRecord) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState(customer.initialNote)
  const summary = calculateOrderSummary(UNIT_PRICE, quantity)

  /** 把当前客户的明确购买动作直接交给父组件。 */
  function recordAction(action: PurchaseAction): void {
    onAction({ action, customerName: customer.name })
  }

  /** 恢复当前客户编辑器的局部草稿，不影响父组件动作记录。 */
  function handleResetEditor(): void {
    setQuantity(1)
    setNote(customer.initialNote)
  }

  return (
    <div className="unnecessary-effects-demo-editor" data-testid="unnecessary-order-editor">
      <header className="unnecessary-effects-demo-editor-heading">
        <p>当前编辑器</p>
        <h3 data-testid="unnecessary-customer-name">{customer.name}</h3>
        <span>切换客户会更换 key，草稿随新的编辑器身份重置。</span>
      </header>

      <div className="unnecessary-effects-demo-form">
        <label>
          <span>数量</span>
          <select
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            data-testid="unnecessary-quantity"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>订单备注</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：工作日送达"
            data-testid="unnecessary-note"
          />
        </label>
      </div>

      <div className="unnecessary-effects-demo-summary" aria-label="当前订单摘要">
        <div>
          <span>单价</span>
          <strong data-testid="unnecessary-unit-price">¥{UNIT_PRICE}</strong>
        </div>
        <div>
          <span>小计</span>
          <strong data-testid="unnecessary-subtotal">¥{summary.subtotal}</strong>
        </div>
        <div>
          <span>折扣</span>
          <strong data-testid="unnecessary-discount">-¥{summary.discount}</strong>
        </div>
        <div>
          <span>总价</span>
          <strong data-testid="unnecessary-total">¥{summary.total}</strong>
        </div>
      </div>

      <p className="unnecessary-effects-demo-note" data-testid="unnecessary-note-preview">
        {note ? `当前备注：${note}` : '当前备注：无'}
      </p>

      <div className="unnecessary-effects-demo-actions" aria-label="订单动作">
        <button type="button" onClick={() => recordAction('add-to-cart')}>
          加入购物车
        </button>
        <button type="button" onClick={() => recordAction('checkout')}>
          立即结算
        </button>
        <button type="button" onClick={handleResetEditor}>
          重置编辑器
        </button>
      </div>
    </div>
  )
}

/** 演示 render 派生、key 重置和事件中的父子通知边界。 */
export default function RenderAndEventBoundaryDemo() {
  const [customerId, setCustomerId] = useState(DEFAULT_CUSTOMER.id)
  const [latestAction, setLatestAction] = useState<ActionRecord | null>(null)
  const [actionCount, setActionCount] = useState(0)
  const customer = CUSTOMERS.find((item) => item.id === customerId) ?? DEFAULT_CUSTOMER

  /** 接收子组件事件并由父组件拥有动作记录。 */
  function handleAction(record: ActionRecord): void {
    setLatestAction(record)
    setActionCount((count) => count + 1)
  }

  /** 清除父组件拥有的动作记录，不改变当前编辑器草稿。 */
  function handleResetHistory(): void {
    setLatestAction(null)
    setActionCount(0)
  }

  return (
    <section className="unnecessary-effects-demo" data-testid="unnecessary-effects-demo">
      <header className="unnecessary-effects-demo-heading">
        <p>Render、事件与 State 边界</p>
        <h2>先判断为什么运行，再决定代码放在哪里</h2>
        <span>摘要来自当前输入，客户切换重置局部 State，业务动作由子组件事件直接通知父组件。</span>
      </header>

      <label className="unnecessary-effects-demo-customer-picker">
        <span>当前客户</span>
        <select
          value={customer.id}
          onChange={(event) => setCustomerId(event.target.value)}
          data-testid="unnecessary-customer-select"
        >
          {CUSTOMERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <p className="unnecessary-effects-demo-boundary" data-testid="unnecessary-customer-boundary">
        当前身份：{customer.name}。切换客户后，编辑器会以新的 key 重新建立局部草稿。
      </p>

      <OrderEditor key={customer.id} customer={customer} onAction={handleAction} />

      <div className="unnecessary-effects-demo-result" role="status">
        <span>父组件收到的最近动作</span>
        <strong data-testid="unnecessary-latest-action">
          {latestAction
            ? `${latestAction.customerName}：${getActionLabel(latestAction.action)}`
            : '尚未执行动作'}
        </strong>
        <small>
          已执行 <b data-testid="unnecessary-action-count">{actionCount}</b> 次明确业务动作
        </small>
      </div>

      <button
        type="button"
        onClick={handleResetHistory}
        className="unnecessary-effects-demo-history-reset"
      >
        清空父组件动作记录
      </button>
    </section>
  )
}
