import { useState } from 'react'
import './state-preservation-demo.css'

interface ScoreCardProps {
  person: string
  tone: 'calm' | 'strong'
  testId: string
}

interface Customer {
  id: string
  name: string
  email: string
  note: string
}

interface CustomerEditorProps {
  customer: Customer
  mode: 'preserve' | 'reset'
}

const customers: Customer[] = [
  {
    id: 'alice',
    name: 'Alice Chen',
    email: 'alice@example.com',
    note: '偏好邮件联系。',
  },
  {
    id: 'bob',
    name: 'Bob Lin',
    email: 'bob@example.com',
    note: '需要在周五前回访。',
  },
]

const firstCustomer = customers[0]!

/** 在当前组件身份位置保存一份独立分数。 */
function ScoreCard({ person, tone, testId }: ScoreCardProps) {
  const [score, setScore] = useState(0)

  return (
    <article className={`state-reset-score state-reset-score--${tone}`}>
      <p className="state-reset-kicker">{person}</p>
      <output aria-live="polite" data-testid={testId}>
        {score}
      </output>
      <button type="button" onClick={() => setScore((current) => current + 1)}>
        增加分数
      </button>
    </article>
  )
}

/** 在叶子组件中保存一份可观察的输入草稿。 */
function DraftField() {
  const [draft, setDraft] = useState('')

  return (
    <label className="state-reset-field">
      <span>当前草稿</span>
      <input
        data-testid="ancestor-draft"
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        placeholder="输入后切换包装类型"
      />
    </label>
  )
}

/** 保存当前客户的未提交编辑，并根据调用点对照 State 是否重置。 */
function CustomerEditor({ customer, mode }: CustomerEditorProps) {
  const [email, setEmail] = useState(customer.email)
  const [note, setNote] = useState(customer.note)
  const label = mode === 'preserve' ? '同位置，无 key：保留' : '同位置，稳定 key：重置'

  return (
    <article className={`state-reset-editor state-reset-editor--${mode}`}>
      <p className="state-reset-kicker">{label}</p>
      <h4>{customer.name}</h4>
      <label className="state-reset-field">
        <span>邮箱</span>
        <input
          aria-label={`${label}邮箱`}
          data-testid={`${mode}-email`}
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
      </label>
      <label className="state-reset-field">
        <span>备注</span>
        <textarea
          aria-label={`${label}备注`}
          data-testid={`${mode}-note`}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
          rows={3}
        />
      </label>
      <output aria-live="polite">当前对象：{customer.id}</output>
    </article>
  )
}

/** 提供一个稳定的客户选择位置，不保存编辑器内部草稿。 */
function CustomerSwitcher({
  selectedId,
  onSelect,
}: {
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="state-reset-switcher" aria-label="选择客户">
      <span>当前客户</span>
      <div className="state-reset-switcher-actions">
        {customers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            className={customer.id === selectedId ? 'is-selected' : undefined}
            aria-pressed={customer.id === selectedId}
            onClick={() => onSelect(customer.id)}
          >
            {customer.name}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 组合四组可观察的 State 保留、隔离、移除和 key 重置结果。 */
export default function StatePreservationDemo() {
  const [showTaylor, setShowTaylor] = useState(true)
  const [showSecond, setShowSecond] = useState(true)
  const [usesSection, setUsesSection] = useState(true)
  const [selectedId, setSelectedId] = useState(firstCustomer.id)
  const [refreshCount, setRefreshCount] = useState(0)
  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? firstCustomer

  return (
    <section className="state-reset-demo" data-testid="state-preservation-demo">
      <header className="state-reset-heading">
        <p>State identity</p>
        <h2>位置、类型与 key 的可观察差异</h2>
        <span>只改变输入、结构或身份，比较局部 State 是否继续。</span>
      </header>

      <section className="state-reset-observation">
        <header>
          <p>观察 1</p>
          <h3>同位置、同类型</h3>
        </header>
        <div className="state-reset-stage state-reset-stage--single">
          {showTaylor ? (
            <ScoreCard person="Taylor" tone="strong" testId="primary-score" />
          ) : (
            <ScoreCard person="Sarah" tone="calm" testId="primary-score" />
          )}
        </div>
        <div className="state-reset-actions">
          <button type="button" onClick={() => setShowTaylor((current) => !current)}>
            切换成员与外观
          </button>
        </div>
      </section>

      <section className="state-reset-observation">
        <header>
          <p>观察 2</p>
          <h3>并列位置与移除</h3>
        </header>
        <div className="state-reset-stage state-reset-stage--parallel">
          <div className="state-reset-slot">
            <ScoreCard person="左侧实例" tone="strong" testId="parallel-score-a" />
          </div>
          <div className="state-reset-slot">
            {showSecond && <ScoreCard person="右侧实例" tone="calm" testId="parallel-score-b" />}
          </div>
        </div>
        <div className="state-reset-actions">
          <button type="button" onClick={() => setShowSecond((current) => !current)}>
            {showSecond ? '移除右侧实例' : '重新添加右侧实例'}
          </button>
        </div>
      </section>

      <section className="state-reset-observation">
        <header>
          <p>观察 3</p>
          <h3>祖先类型改变</h3>
        </header>
        <div className="state-reset-stage">
          {usesSection ? (
            <section className="state-reset-ancestor" data-testid="ancestor-wrapper">
              <DraftField />
            </section>
          ) : (
            <div className="state-reset-ancestor" data-testid="ancestor-wrapper">
              <DraftField />
            </div>
          )}
        </div>
        <div className="state-reset-actions">
          <button type="button" onClick={() => setUsesSection((current) => !current)}>
            切换 section / div
          </button>
        </div>
      </section>

      <section className="state-reset-observation">
        <header>
          <p>观察 4</p>
          <h3>无 key 与稳定 key</h3>
        </header>
        <CustomerSwitcher selectedId={selectedId} onSelect={setSelectedId} />
        <div className="state-reset-actions">
          <button type="button" onClick={() => setRefreshCount((count) => count + 1)}>
            外层刷新（{refreshCount}）
          </button>
          <span>选择：{selectedCustomer.name}</span>
        </div>
        <div className="state-reset-editor-columns">
          <CustomerEditor customer={selectedCustomer} mode="preserve" />
          <CustomerEditor key={selectedCustomer.id} customer={selectedCustomer} mode="reset" />
        </div>
      </section>
    </section>
  )
}
