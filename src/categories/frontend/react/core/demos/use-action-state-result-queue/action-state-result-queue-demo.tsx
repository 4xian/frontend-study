import { startTransition, useActionState, useRef, useState } from 'react'

import './action-state-result-queue-demo.css'

type ReviewState = Readonly<{
  revision: number
  status: 'idle' | 'success' | 'invalid'
  decision: string
  note: string
  feedback: string
  history: readonly string[]
}>

type ActionPause = Readonly<{
  promise: Promise<void>
  resume: () => void
}>

const initialReviewState: ReviewState = {
  revision: 0,
  status: 'idle',
  decision: '等待第一次 Action',
  note: '还没有结果 State',
  feedback: '提交正常备注，或清空备注观察业务校验结果。',
  history: [],
}

/** 创建一个由按钮手动继续的本地 Promise。 */
function createActionPause(): ActionPause {
  let resumeAction!: () => void
  const promise = new Promise<void>((resolve) => {
    resumeAction = resolve
  })
  return { promise, resume: resumeAction }
}

/** 从 FormData 中读取本次表单提交的字符串字段。 */
function readFormValue(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

type ActionExperimentProps = Readonly<{
  onRebuild: () => void
}>

/** 展示 useActionState 的 previousState、排队 Action 和最终结果。 */
function ActionExperiment({ onRebuild }: ActionExperimentProps) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const pausesRef = useRef<ActionPause[]>([])
  const [draftNote, setDraftNote] = useState('课程审核')

  /** 让每次 Action 等待手动继续，并把前次版本串入下一结果。 */
  async function reviewAction(
    previousState: ReviewState,
    formData: FormData,
  ): Promise<ReviewState> {
    const pause = createActionPause()
    pausesRef.current.push(pause)
    await pause.promise

    const decision = readFormValue(formData, 'decision')
    const note = readFormValue(formData, 'note').trim()

    if (!note) {
      return {
        ...previousState,
        status: 'invalid',
        decision: decision || previousState.decision,
        note: '',
        feedback: '备注不能为空；这是 Action 返回的业务结果，不是抛出的异常。',
        history: [...previousState.history, `${previousState.revision} -> 校验失败`],
      }
    }

    return {
      revision: previousState.revision + 1,
      status: 'success',
      decision,
      note,
      feedback: `已确认 revision ${previousState.revision + 1}。`,
      history: [
        ...previousState.history,
        `${previousState.revision} -> ${previousState.revision + 1}`,
      ],
    }
  }

  const [state, dispatchAction, isPending] = useActionState(reviewAction, initialReviewState)

  /** 只继续当前 Action，让队列中的下一项随后开始。 */
  function continueNextAction(): void {
    const pause = pausesRef.current.shift()
    pause?.resume()
  }

  /** 在 Transition 中连续 dispatch 两个 payload，形成可重复的 Action State 队列。 */
  function enqueueTwoActions(): void {
    const form = formRef.current
    if (!form || isPending) return

    const firstPayload = new FormData(form)
    firstPayload.set('decision', '通过')
    const secondPayload = new FormData(form)
    secondPayload.set('decision', '需要修改')

    startTransition(() => {
      dispatchAction(firstPayload)
      dispatchAction(secondPayload)
    })
  }

  return (
    <section className="action-state-experiment">
      <form ref={formRef} className="action-state-form" action={dispatchAction}>
        <label htmlFor="action-state-note">本次备注（随 FormData 提交）</label>
        <input
          id="action-state-note"
          name="note"
          value={draftNote}
          onChange={(event) => setDraftNote(event.currentTarget.value)}
          placeholder="输入备注后连续提交"
          aria-describedby="action-state-feedback"
          aria-invalid={state.status === 'invalid'}
        />
        <div className="action-state-choices">
          <button type="submit" name="decision" value="通过">
            提交通过
          </button>
          <button type="submit" name="decision" value="需要修改" className="is-secondary">
            提交修改
          </button>
          <button
            type="button"
            className="is-queue"
            onClick={enqueueTwoActions}
            disabled={isPending}
          >
            连续排队两项
          </button>
        </div>
      </form>

      <div className="action-state-controls">
        <button type="button" onClick={continueNextAction} disabled={!isPending}>
          继续下一 Action
        </button>
        <button type="button" className="is-quiet" onClick={onRebuild} disabled={isPending}>
          重建实验
        </button>
      </div>

      <div className="action-state-status">
        <div>
          <span>结果 revision</span>
          <strong data-testid="action-state-revision">{state.revision}</strong>
        </div>
        <div>
          <span>React Action</span>
          <strong data-testid="action-state-pending">{isPending ? 'pending' : 'idle'}</strong>
        </div>
        <div>
          <span>结果类型</span>
          <strong data-testid="action-state-result-status">{state.status}</strong>
        </div>
      </div>

      <article className={`action-state-result${state.status === 'invalid' ? ' is-invalid' : ''}`}>
        <span>Action 返回的结果 State</span>
        <h3 data-testid="action-state-decision">{state.decision}</h3>
        <p data-testid="action-state-note">{state.note}</p>
        <p
          id="action-state-feedback"
          className="action-state-feedback"
          role="status"
          aria-atomic="true"
          data-testid="action-state-feedback"
        >
          {state.feedback}
        </p>
        <ol data-testid="action-state-history">
          {state.history.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ol>
      </article>
    </section>
  )
}

/** 通过 key 重建实验，确保每次浏览器验收从同一 initialState 开始。 */
export default function ActionStateResultQueueDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 递增版本以清空 Action State 队列和本地观察计数。 */
  function rebuildExperiment(): void {
    setExperimentVersion((version) => version + 1)
  }

  return (
    <section
      className="action-state-result-queue-demo"
      data-testid="action-state-result-queue-demo"
    >
      <header className="action-state-heading">
        <p>Action State</p>
        <h2>让下一次 Action 读取上一次结果</h2>
        <span>依次继续 Action，观察 FormData、previousState、结果类型和 isPending。</span>
      </header>
      <ActionExperiment key={experimentVersion} onRebuild={rebuildExperiment} />
    </section>
  )
}
