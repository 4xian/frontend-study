import { useCallback, useRef, useState } from 'react'
import { flushSync, useFormStatus } from 'react-dom'

import './use-form-status-parent-scope-demo.css'

type FormId = 'alpha' | 'beta'

type ClientAction = (formData: FormData) => Promise<void>

type DeferredGate = Readonly<{
  promise: Promise<void>
  resolve: () => void
}>

type SubmissionRecord = Readonly<{
  formId: FormId
  message: string
  method: string
  action: string
  stage: 'pending' | 'settled'
}>

const formLabels: Record<FormId, string> = {
  alpha: '甲',
  beta: '乙',
}

/** 创建一个只能结算一次的本地 Promise gate。 */
function createDeferredGate(): DeferredGate {
  let resolvePromise!: () => void
  let settled = false
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve
  })

  /** 首次调用时完成当前 Action 的等待。 */
  function resolve(): void {
    if (settled) return
    settled = true
    resolvePromise()
  }

  return { promise, resolve }
}

type StatusFieldsProps = Readonly<{
  label: string
  status: ReturnType<typeof useFormStatus>
  expectedAction?: ClientAction
  expectedActionLabel?: string
  testId: string
}>

/** 把 useFormStatus 的四个字段转换为稳定、可观察的文本。 */
function StatusFields({
  label,
  status,
  expectedAction,
  expectedActionLabel,
  testId,
}: StatusFieldsProps) {
  const message = status.pending ? String(status.data.get('message') ?? '') : 'null'
  const method = status.pending ? status.method : 'null'
  const action = status.pending
    ? status.action === expectedAction
      ? expectedActionLabel
      : '非预期 action'
    : 'null'

  return (
    <section
      className="form-status-readout"
      data-testid={testId}
      aria-label={label}
      role="status"
      aria-atomic="true"
    >
      <h4>{label}</h4>
      <dl>
        <div>
          <dt>pending</dt>
          <dd>{String(status.pending)}</dd>
        </div>
        <div>
          <dt>data.message</dt>
          <dd>{message}</dd>
        </div>
        <div>
          <dt>method</dt>
          <dd>{method}</dd>
        </div>
        <div>
          <dt>action</dt>
          <dd>{action}</dd>
        </div>
      </dl>
    </section>
  )
}

type DescendantStatusProps = Readonly<{
  formId: FormId
  expectedAction: ClientAction
}>

/** 在目标 form 的真正后代中读取最近父 form 的状态。 */
function DescendantStatus({ formId, expectedAction }: DescendantStatusProps) {
  const status = useFormStatus()
  const formLabel = formLabels[formId]

  return (
    <StatusFields
      label={`${formLabel} form 后代`}
      status={status}
      expectedAction={expectedAction}
      expectedActionLabel={`${formLabel} action`}
      testId={`${formId}-descendant-status`}
    />
  )
}

type SubmitButtonProps = Readonly<{
  blocked: boolean
  formLabel: string
}>

/** 根据父 form 的 pending 与兄弟表单状态控制提交按钮。 */
function SubmitButton({ blocked, formLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending || blocked}>
      {pending ? `${formLabel} Action 等待中` : `提交${formLabel}表单`}
    </button>
  )
}

type ScopedFormProps = Readonly<{
  formId: FormId
  action: ClientAction
  blocked: boolean
  onPrepare: (formId: FormId, form: HTMLFormElement) => void
}>

/** 声明一个 form，并并列展示同组件 probe 与真正的后代状态。 */
function ScopedForm({ formId, action, blocked, onPrepare }: ScopedFormProps) {
  const selfStatus = useFormStatus()
  const formLabel = formLabels[formId]

  return (
    <form
      className="scoped-form-card"
      action={action}
      onSubmit={(event) => onPrepare(formId, event.currentTarget)}
      data-testid={`${formId}-form`}
    >
      <StatusFields
        label={`${formLabel} form 同组件`}
        status={selfStatus}
        expectedAction={action}
        expectedActionLabel={`${formLabel} action`}
        testId={`${formId}-self-status`}
      />

      <div className="scoped-form-fields">
        <label htmlFor={`${formId}-message`}>{formLabel}表单消息</label>
        <input
          id={`${formId}-message`}
          name="message"
          defaultValue={`${formLabel}表单消息`}
          autoComplete="off"
        />
        <SubmitButton blocked={blocked} formLabel={formLabel} />
        <DescendantStatus formId={formId} expectedAction={action} />
      </div>
    </form>
  )
}

/** 在所有 form 外读取完整空闲状态，证明 Hook 不是全局监听器。 */
function OutsideStatus() {
  const status = useFormStatus()

  return <StatusFields label="表单外对照" status={status} testId="outside-status" />
}

type FormScopeExperimentProps = Readonly<{
  onRebuild: () => void
}>

/** 驱动两个兄弟 form 的独立 Action、gate 与提交账本。 */
function FormScopeExperiment({ onRebuild }: FormScopeExperimentProps) {
  const activeGate = useRef<(DeferredGate & { formId: FormId; method: string }) | null>(null)
  const experimentEpoch = useRef(0)
  const [activeForm, setActiveForm] = useState<FormId | null>(null)
  const [record, setRecord] = useState<SubmissionRecord | null>(null)
  const [callCounts, setCallCounts] = useState<Record<FormId, number>>({ alpha: 0, beta: 0 })

  /** 在提交事件中建立 gate 与即时账本，使命令区在 Action 等待时可用。 */
  const prepareFormAction = useCallback((formId: FormId, form: HTMLFormElement): void => {
    if (activeGate.current) return

    const gate = createDeferredGate()
    const formData = new FormData(form)
    const message = String(formData.get('message') ?? '')
    activeGate.current = { ...gate, formId, method: form.method }
    setActiveForm(formId)
    setRecord({ formId, message, method: form.method, action: '等待 Action', stage: 'pending' })
  }, [])

  /** 读取指定表单已经建立的 gate，并等待命令区手工完成。 */
  const runFormAction = useCallback(async (formId: FormId, formData: FormData): Promise<void> => {
    const gate = activeGate.current
    if (!gate || gate.formId !== formId) return

    const epoch = experimentEpoch.current
    const message = String(formData.get('message') ?? '')
    flushSync(() => {
      setCallCounts((counts) => ({ ...counts, [formId]: counts[formId] + 1 }))
      setRecord({
        formId,
        message,
        method: gate.method,
        action: `${formLabels[formId]} action 已匹配`,
        stage: 'pending',
      })
    })

    await gate.promise
    if (experimentEpoch.current !== epoch) return

    activeGate.current = null
    setActiveForm(null)
    setRecord({
      formId,
      message,
      method: gate.method,
      action: `${formLabels[formId]} action 已匹配`,
      stage: 'settled',
    })
  }, [])

  /** 把甲表单的 FormData 交给共享 Action 驱动器。 */
  const alphaAction = useCallback(
    async (formData: FormData) => runFormAction('alpha', formData),
    [runFormAction],
  )

  /** 把乙表单的 FormData 交给共享 Action 驱动器。 */
  const betaAction = useCallback(
    async (formData: FormData) => runFormAction('beta', formData),
    [runFormAction],
  )

  /** 完成当前唯一 active Action。 */
  function settleCurrentAction(): void {
    activeGate.current?.resolve()
  }

  /** 终止旧实验纪元并从全新组件实例重建全部状态。 */
  function rebuildExperiment(): void {
    experimentEpoch.current += 1
    activeGate.current?.resolve()
    activeGate.current = null
    onRebuild()
  }

  const activeLabel = activeForm ? `${formLabels[activeForm]}表单` : '无'
  const recordLabel = record
    ? `${formLabels[record.formId]} / ${record.message} / ${record.method} / ${record.action} / ${record.stage}`
    : '尚无提交'

  return (
    <section className="form-scope-experiment">
      <OutsideStatus />

      <div className="sibling-forms" data-testid="sibling-forms">
        <ScopedForm
          formId="alpha"
          action={alphaAction}
          blocked={activeForm !== null && activeForm !== 'alpha'}
          onPrepare={prepareFormAction}
        />
        <ScopedForm
          formId="beta"
          action={betaAction}
          blocked={activeForm !== null && activeForm !== 'beta'}
          onPrepare={prepareFormAction}
        />
      </div>

      <section className="form-command-bar" aria-label="Action 命令区">
        <div aria-live="polite">
          <span>当前 active</span>
          <strong data-testid="active-form">{activeLabel}</strong>
        </div>
        <div>
          <span>Action 调用</span>
          <strong data-testid="action-counts">
            甲 {callCounts.alpha} 次 / 乙 {callCounts.beta} 次
          </strong>
        </div>
        <div>
          <span>最近提交</span>
          <strong data-testid="submission-record">{recordLabel}</strong>
        </div>
        <div className="form-command-actions">
          <button type="button" onClick={settleCurrentAction} disabled={!activeForm}>
            完成当前 Action
          </button>
          <button type="button" className="is-quiet" onClick={rebuildExperiment}>
            重建实验
          </button>
        </div>
      </section>
    </section>
  )
}

/** 提供可重建边界，确保每轮作用域实验从完整冷态开始。 */
export default function UseFormStatusParentScopeDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 更换组件 key，清空表单、gate、status 与账本。 */
  function rebuildExperiment(): void {
    setExperimentVersion((version) => version + 1)
  }

  return (
    <section className="use-form-status-parent-scope-demo" data-testid="form-status-demo">
      <header className="form-status-heading">
        <p>Parent Form Scope</p>
        <h2>只有 form 内后代读取当前提交</h2>
        <span>甲乙互相隔离；同组件和表单外对照始终保持 idle。</span>
      </header>
      <FormScopeExperiment key={experimentVersion} onRebuild={rebuildExperiment} />
    </section>
  )
}
