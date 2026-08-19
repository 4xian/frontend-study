import { Component, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode, RefObject } from 'react'
import { flushSync } from 'react-dom'

import './form-action-client-submission-demo.css'

type ActionPath = '父 form action' | '按钮 formAction'
type ActionOutcome = 'idle' | 'success' | 'rejected'

type SubmissionSnapshot = Readonly<{
  path: ActionPath
  content: string
  controlledNote: string
  includeExamples: boolean
  intent: string
  sequence: number
}>

type ActionGate = Readonly<{
  promise: Promise<void>
  resolve: () => void
  reject: (error: Error) => void
}>

type ActionFormProps = Readonly<{
  controlledNote: string
  onControlledNoteChange: (event: ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onRunAction: (path: ActionPath, formData: FormData) => Promise<void>
  isPending: boolean
}>

type ActionLedgerProps = Readonly<{
  snapshotRef: RefObject<SubmissionSnapshot | null>
  submissionCountRef: RefObject<number>
  pendingActionRef: RefObject<ActionPath | null>
  gateRef: RefObject<ActionGate | null>
  resetCount: number
  outcome: ActionOutcome
  errorMessage: string
  onResolve: () => void
  onReject: () => void
  onClear: () => void
  ledgerVersion: number
}>

type ActionBoundaryProps = Readonly<{
  onError: (error: unknown) => void
  onRecover: () => void
  children: ReactNode
}>

type ActionBoundaryState = Readonly<{
  hasError: boolean
}>

/** 只读取 FormData 中的文本字段，避免把 File 或 null 当成业务字符串。 */
function readTextValue(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** 将 Error Boundary 接收到的异常转换成可观察的简短文本。 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 在最近的边界内隔离 rejected Action，并提供一次明确的 remount 恢复。 */
class ActionErrorBoundary extends Component<ActionBoundaryProps, ActionBoundaryState> {
  state: ActionBoundaryState = { hasError: false }

  /** 把后代 Action 错误转换成边界 fallback 状态。 */
  static getDerivedStateFromError(): ActionBoundaryState {
    return { hasError: true }
  }

  /** 向边界外账本报告错误，区分 reject 与自动 reset。 */
  componentDidCatch(error: unknown): void {
    this.props.onError(error)
  }

  /** 渲染原表单或明确的 rejected fallback。 */
  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="form-action-client-boundary" role="alert">
        <p>Action rejected</p>
        <h3>保存失败，原 form 没有提交自动 reset</h3>
        <span>当前 fallback 由 Error Boundary 接管；恢复会创建一张新的表单。</span>
        <button type="button" onClick={this.props.onRecover}>
          恢复新表单
        </button>
      </div>
    )
  }
}

/** 渲染带父 Action 与覆盖 Action 的同源表单。 */
function ActionForm({
  controlledNote,
  onControlledNoteChange,
  onReset,
  onRunAction,
  isPending,
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null)

  // 原生 listener 只观察 React 成功提交触发的 reset，不主动重置表单。
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    form.addEventListener('reset', onReset)
    return () => form.removeEventListener('reset', onReset)
  }, [onReset])

  /** 把普通 publish submitter 交给父 form action。 */
  function publishAction(formData: FormData): Promise<void> {
    return onRunAction('父 form action', formData)
  }

  /** 用按钮 formAction 覆盖父 Action，且不声明自定义 name/value。 */
  function saveDraftAction(formData: FormData): Promise<void> {
    return onRunAction('按钮 formAction', formData)
  }

  return (
    <form
      ref={formRef}
      className="form-action-client-form"
      aria-label="客户端 Action 课程表单"
      action={publishAction}
    >
      <label htmlFor="form-action-content">提交正文（未受控 textarea）</label>
      <textarea
        id="form-action-content"
        data-testid="form-action-content"
        name="content"
        defaultValue=""
        placeholder="输入一段正文，然后观察 pending 与 reset"
      />

      <label htmlFor="form-action-note">审核备注（受控 State）</label>
      <input
        id="form-action-note"
        data-testid="form-action-note"
        name="controlledNote"
        value={controlledNote}
        onChange={onControlledNoteChange}
      />

      <label className="form-action-client-choice">
        <input
          data-testid="form-action-examples"
          name="includeExamples"
          type="checkbox"
          defaultChecked
        />
        <span>附带代码示例（未受控）</span>
      </label>

      <div className="form-action-client-actions">
        <button type="submit" name="intent" value="publish" disabled={isPending}>
          发布（父 action）
        </button>
        <button type="submit" formAction={saveDraftAction} disabled={isPending}>
          保存草稿（formAction）
        </button>
      </div>
    </form>
  )
}

/** 在 form sibling 中渲染可独立刷新的 Action 观察账本。 */
function ActionLedger({
  snapshotRef,
  submissionCountRef,
  pendingActionRef,
  gateRef,
  resetCount,
  outcome,
  errorMessage,
  onResolve,
  onReject,
  onClear,
  ledgerVersion,
}: ActionLedgerProps) {
  const [normalCount, setNormalCount] = useState(0)
  const snapshot = snapshotRef.current
  const submissionCount = submissionCountRef.current
  const pendingAction = pendingActionRef.current
  const isPending = gateRef.current !== null

  /** 只重绘边界外账本，证明普通更新不会被 Action Promise 锁住。 */
  function incrementNormalCount(): void {
    setNormalCount((count) => count + 1)
  }

  /** 在 Action idle 时同时清空本地计数和边界外账本。 */
  function handleClearLedger(): void {
    if (isPending) return
    setNormalCount(0)
    onClear()
  }

  return (
    <aside className="form-action-client-result" data-ledger-version={ledgerVersion}>
      <div className="form-action-client-result-heading">
        <p>Action snapshot</p>
        <strong data-testid="form-action-outcome" role="status" aria-atomic="true">
          {isPending
            ? `${pendingAction} pending`
            : outcome === 'success'
              ? 'Action success'
              : outcome === 'rejected'
                ? 'Action rejected'
                : '等待提交'}
        </strong>
      </div>

      <dl>
        <div>
          <dt>Action 次数</dt>
          <dd data-testid="form-action-count">{submissionCount}</dd>
        </div>
        <div>
          <dt>调用路径</dt>
          <dd data-testid="form-action-path">{snapshot?.path ?? '尚未提交'}</dd>
        </div>
        <div>
          <dt>FormData content</dt>
          <dd data-testid="form-action-submitted-content">{snapshot?.content || '尚未提交'}</dd>
        </div>
        <div>
          <dt>submitter intent</dt>
          <dd data-testid="form-action-intent">
            {snapshot ? snapshot.intent || 'null（函数 formAction）' : '尚未提交'}
          </dd>
        </div>
        <div>
          <dt>受控备注快照</dt>
          <dd data-testid="form-action-submitted-note">{snapshot?.controlledNote || '尚未提交'}</dd>
        </div>
        <div>
          <dt>未受控 checkbox</dt>
          <dd data-testid="form-action-submitted-examples">
            {snapshot ? (snapshot.includeExamples ? '包含' : '不包含') : '尚未提交'}
          </dd>
        </div>
        <div>
          <dt>reset 事件</dt>
          <dd data-testid="form-action-reset-count">{resetCount}</dd>
        </div>
        <div>
          <dt>边界外普通计数</dt>
          <dd data-testid="form-action-normal-count">{normalCount}</dd>
        </div>
      </dl>

      <div className="form-action-client-settle" data-testid="form-action-settle">
        <p>边界外 settle 控件</p>
        <span>
          {isPending ? '当前输入仍在 pending；普通更新不会被锁住。' : '提交后选择成功或失败结局。'}
        </span>
        <div>
          <button type="button" onClick={onResolve} disabled={!isPending}>
            成功返回
          </button>
          <button type="button" className="is-danger" onClick={onReject} disabled={!isPending}>
            模拟失败
          </button>
          <button type="button" className="is-quiet" onClick={incrementNormalCount}>
            普通计数 +1
          </button>
        </div>
      </div>

      <p className="form-action-client-rule" data-testid="form-action-rule">
        {isPending
          ? 'Action Promise 尚未 settle：输入保持当前值，自动 reset 还没有发生。'
          : outcome === 'success'
            ? `第 ${snapshot?.sequence ?? 0} 次 Action 成功：reset=${resetCount}，受控备注仍由 State 保持。`
            : outcome === 'rejected'
              ? `reject 没有提交自动 reset（reset=${resetCount}）。${errorMessage}`
              : '修改正文后提交；pending 时先观察字段仍在，再由外部控件 settle。'}
      </p>

      <div className="form-action-client-ledger-actions">
        <button type="button" className="is-quiet" onClick={handleClearLedger} disabled={isPending}>
          清空观察账本
        </button>
      </div>
    </aside>
  )
}

/** 验证客户端 Form Action 的 FormData、pending、成功 reset 与 reject 边界。 */
export default function FormActionClientSubmissionDemo() {
  const [controlledNote, setControlledNote] = useState('受控备注')
  const [resetCount, setResetCount] = useState(0)
  const [outcome, setOutcome] = useState<ActionOutcome>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [boundaryKey, setBoundaryKey] = useState(0)
  const [ledgerVersion, setLedgerVersion] = useState(0)
  const snapshotRef = useRef<SubmissionSnapshot | null>(null)
  const submissionCountRef = useRef(0)
  const pendingActionRef = useRef<ActionPath | null>(null)
  const gateRef = useRef<ActionGate | null>(null)

  /** 冻结提交快照并创建由边界外 settle 控件释放的 Promise。 */
  function beginAction(path: ActionPath, formData: FormData): Promise<void> {
    const currentGate = gateRef.current
    if (currentGate) return currentGate.promise

    const nextSequence = submissionCountRef.current + 1
    submissionCountRef.current = nextSequence
    snapshotRef.current = {
      path,
      content: readTextValue(formData, 'content'),
      controlledNote: readTextValue(formData, 'controlledNote'),
      includeExamples: formData.has('includeExamples'),
      intent: readTextValue(formData, 'intent'),
      sequence: nextSequence,
    }
    pendingActionRef.current = path

    let resolveGate!: () => void
    let rejectGate!: (error: Error) => void
    const promise = new Promise<void>((resolve, reject) => {
      resolveGate = resolve
      rejectGate = reject
    })
    gateRef.current = { promise, resolve: resolveGate, reject: rejectGate }

    // Action 内 State 更新属于同一 Transition；同步刷新账本后，pending 与 settle 控件立即可读。
    flushSync(() => setLedgerVersion((version) => version + 1))
    return promise
  }

  /** 同步更新受控备注，证明自动 reset 不会改写 React State。 */
  function handleControlledNoteChange(event: ChangeEvent<HTMLInputElement>): void {
    setControlledNote(event.currentTarget.value)
  }

  /** 接收成功 reset 事件，只有这条路径才结束 pending 并累计 reset。 */
  function handleFormReset(): void {
    setResetCount((count) => count + 1)
    pendingActionRef.current = null
    setOutcome('success')
  }

  /** 让当前 Action 成功返回，交给 React 提交自动 reset。 */
  function resolveCurrentAction(): void {
    const gate = gateRef.current
    if (!gate) return
    gateRef.current = null
    gate.resolve()
  }

  /** 让当前 Action rejected，验证 Error Boundary 路径没有自动 reset。 */
  function rejectCurrentAction(): void {
    const gate = gateRef.current
    if (!gate) return
    gateRef.current = null
    gate.reject(new Error('课程保存被 Demo 主动拒绝'))
  }

  /** 记录 rejected 结果并保留边界外的 reset 账本。 */
  function handleActionError(error: unknown): void {
    pendingActionRef.current = null
    setOutcome('rejected')
    setErrorMessage(getErrorMessage(error))
  }

  /** 通过新的 boundary key 创建新表单，明确区分 remount 与 reset。 */
  function recoverBoundary(): void {
    setBoundaryKey((key) => key + 1)
    setOutcome('idle')
    setErrorMessage('')
  }

  /** 在没有待完成 Action 时清空观察账本，不改变当前表单字段。 */
  function clearLedger(): void {
    if (gateRef.current) return
    snapshotRef.current = null
    submissionCountRef.current = 0
    pendingActionRef.current = null
    setResetCount(0)
    setOutcome('idle')
    setErrorMessage('')
  }

  return (
    <section className="form-action-client-demo" data-testid="form-action-client-demo">
      <header className="form-action-client-heading">
        <p>Client form action</p>
        <h2>pending 保留输入，成功才提交自动 reset</h2>
        <span>
          父 action、按钮 formAction、成功 reset 与 rejected fallback 都由同一张表单观察。
        </span>
      </header>

      <div className="form-action-client-columns">
        <div className="form-action-client-form-host">
          <ActionErrorBoundary
            key={boundaryKey}
            onError={handleActionError}
            onRecover={recoverBoundary}
          >
            <ActionForm
              controlledNote={controlledNote}
              onControlledNoteChange={handleControlledNoteChange}
              onReset={handleFormReset}
              onRunAction={beginAction}
              isPending={gateRef.current !== null}
            />
          </ActionErrorBoundary>
        </div>

        <ActionLedger
          snapshotRef={snapshotRef}
          submissionCountRef={submissionCountRef}
          pendingActionRef={pendingActionRef}
          gateRef={gateRef}
          resetCount={resetCount}
          outcome={outcome}
          errorMessage={errorMessage}
          onResolve={resolveCurrentAction}
          onReject={rejectCurrentAction}
          onClear={clearLedger}
          ledgerVersion={ledgerVersion}
        />
      </div>
    </section>
  )
}
