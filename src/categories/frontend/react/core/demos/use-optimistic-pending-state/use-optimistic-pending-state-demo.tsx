import { startTransition, useEffect, useOptimistic, useRef, useState } from 'react'

import './use-optimistic-pending-state-demo.css'

type OptimisticItem = Readonly<{
  id: string
  label: string
  pending: boolean
}>

type OptimisticInput = Readonly<{
  id: string
  label: string
}>

type ActionStage = 'idle' | 'pending' | 'success' | 'rollback'

type PendingAction = Readonly<{
  promise: Promise<void>
  resolve: () => void
  reject: () => void
}>

const initialItems: readonly OptimisticItem[] = [
  { id: 'base', label: '已确认的基础条目', pending: false },
]

const optimisticInputs: readonly OptimisticInput[] = [
  { id: 'alpha', label: '甲：组件清单' },
  { id: 'beta', label: '乙：审核记录' },
]

const stageLabels: Record<ActionStage, string> = {
  idle: '空闲：尚未开始',
  pending: '等待中的 Action',
  success: '已确认：基础 State 已承接',
  rollback: '已回滚：显示当前基础值',
}

/** 创建一个由界面按钮手动结算的异步 Action。 */
function createPendingAction(): PendingAction {
  let resolvePromise!: () => void
  let rejectPromise!: (reason: Error) => void
  let settled = false

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  /** 只在首次调用时完成当前 Action。 */
  function resolve(): void {
    if (settled) return
    settled = true
    resolvePromise()
  }

  /** 只在首次调用时以业务失败结束当前 Action。 */
  function reject(): void {
    if (settled) return
    settled = true
    rejectPromise(new Error('保存未被确认'))
  }

  return { promise, resolve, reject }
}

/** 在当前 optimistic 列表后追加一条待确认项，不修改旧数组。 */
function updateFn(
  currentItems: readonly OptimisticItem[],
  input: OptimisticInput,
): readonly OptimisticItem[] {
  return [...currentItems, { ...input, pending: true }]
}

type OptimisticListProps = Readonly<{
  onReset: () => void
}>

/** 展示 optimistic 输入、基础值变化、成功承接和失败回滚。 */
function OptimisticList({ onReset }: OptimisticListProps) {
  const activeAction = useRef<PendingAction | null>(null)
  const mounted = useRef(true)
  const [baseItems, setBaseItems] = useState(initialItems)
  const [optimisticItems, addOptimistic] = useOptimistic<
    readonly OptimisticItem[],
    OptimisticInput
  >(baseItems, updateFn)
  const [stage, setStage] = useState<ActionStage>('idle')
  const [outcome, setOutcome] = useState('尚未产生临时更新')
  const [noteCount, setNoteCount] = useState(0)
  const [baseUpdateCount, setBaseUpdateCount] = useState(0)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
      activeAction.current?.reject()
      activeAction.current = null
    }
  }, [])

  /** 在一个 Action 内按顺序派发甲、乙，并等待确认或失败。 */
  function beginAction(): void {
    if (activeAction.current || stage !== 'idle') return

    const action = createPendingAction()
    activeAction.current = action
    setStage('pending')
    setOutcome('甲、乙已加入 optimistic State，尚未写入基础 State')

    startTransition(async () => {
      optimisticInputs.forEach((input) => addOptimistic(input))

      try {
        await action.promise
        if (!mounted.current) return

        startTransition(() => {
          setBaseItems((currentItems) => [
            ...currentItems,
            ...optimisticInputs.map((input) => ({ ...input, pending: false })),
          ])
          setStage('success')
          setOutcome('成功：甲、乙已由基础 State 承接')
          activeAction.current = null
        })
      } catch {
        if (!mounted.current) return

        startTransition(() => {
          setStage('rollback')
          setOutcome('失败：甲、乙已撤销，当前显示回到基础 State')
          activeAction.current = null
        })
      }
    })
  }

  /** 完成当前 Action，让成功结果写入基础 State。 */
  function confirmAction(): void {
    if (stage !== 'pending') return
    activeAction.current?.resolve()
  }

  /** 结束当前 Action，让未确认的 optimistic 输入消失。 */
  function rejectAction(): void {
    if (stage !== 'pending') return
    activeAction.current?.reject()
  }

  /** 在等待期间增加一条独立的基础更新，观察 optimistic 输入的重放。 */
  function addConfirmedItem(): void {
    if (stage !== 'pending' || baseUpdateCount > 0) return

    setBaseItems((currentItems) => [
      ...currentItems,
      { id: 'confirmed-during-action', label: '等待期间确认的基础条目', pending: false },
    ])
    setBaseUpdateCount(1)
    setOutcome('基础 State 已变化，待确认输入仍按甲、乙顺序显示')
  }

  /** 用普通 State 记录等待期间的相邻交互。 */
  function addNote(): void {
    setNoteCount((count) => count + 1)
  }

  const isPending = stage === 'pending'
  const inputOrder = optimisticInputs.map((input) => input.label.slice(0, 1)).join(' -> ')

  return (
    <section className="optimistic-experiment">
      <div className="optimistic-controls" aria-label="乐观状态控制">
        <button type="button" onClick={beginAction} disabled={stage !== 'idle'}>
          开始待确认更新
        </button>
        <button type="button" className="is-confirm" onClick={confirmAction} disabled={!isPending}>
          确认成功
        </button>
        <button type="button" className="is-reject" onClick={rejectAction} disabled={!isPending}>
          拒绝并回滚
        </button>
        <button
          type="button"
          className="is-base"
          onClick={addConfirmedItem}
          disabled={!isPending || baseUpdateCount > 0}
        >
          加入已确认条目
        </button>
        <button type="button" className="is-note" onClick={addNote}>
          记录本地备注
        </button>
        <button type="button" className="is-quiet" onClick={onReset} disabled={isPending}>
          重新开始
        </button>
      </div>

      <div className="optimistic-status" aria-live="polite">
        <div>
          <span>Action 阶段</span>
          <strong data-testid="optimistic-stage">{stageLabels[stage]}</strong>
        </div>
        <div>
          <span>基础条目</span>
          <strong data-testid="base-count">{baseItems.length} 项</strong>
        </div>
        <div>
          <span>当前显示</span>
          <strong data-testid="visible-count">{optimisticItems.length} 项</strong>
        </div>
        <div>
          <span>输入顺序</span>
          <strong data-testid="input-order">{inputOrder}</strong>
        </div>
        <div>
          <span>基础值变化</span>
          <strong data-testid="base-update-count">{baseUpdateCount} 次</strong>
        </div>
        <div>
          <span>本地备注</span>
          <strong data-testid="note-count">{noteCount} 次</strong>
        </div>
      </div>

      <section className="optimistic-list" aria-labelledby="optimistic-list-title">
        <header>
          <div>
            <span>当前渲染值</span>
            <h3 id="optimistic-list-title">学习资料清单</h3>
          </div>
          <output>{optimisticItems.length} 项</output>
        </header>
        <ol data-testid="optimistic-items">
          {optimisticItems.map((item) => (
            <li key={item.id} className={item.pending ? 'is-pending' : undefined}>
              <span>{item.label}</span>
              <strong>{item.pending ? '待确认' : '已确认'}</strong>
            </li>
          ))}
        </ol>
      </section>

      <p className="optimistic-outcome" data-testid="optimistic-outcome" aria-live="polite">
        {outcome}
      </p>
    </section>
  )
}

/** 通过 key 重新建立基础值、Action 和相邻 State。 */
export default function UseOptimisticPendingStateDemo() {
  const [version, setVersion] = useState(1)

  /** 让下一次观察从同一个基础列表开始。 */
  function reset(): void {
    setVersion((currentVersion) => currentVersion + 1)
  }

  return (
    <section
      className="use-optimistic-pending-state-demo"
      data-testid="use-optimistic-pending-state-demo"
    >
      <header className="optimistic-heading">
        <p>Optimistic State</p>
        <h2>先显示临时输入，再由基础 State 决定去留</h2>
        <span>等待中的 Action 可以成功承接，也可以失败回到当前基础值。</span>
      </header>
      <OptimisticList key={version} onReset={reset} />
    </section>
  )
}
