import { useActionState, useEffect, useOptimistic, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useFormStatus } from 'react-dom'

import './lab-action-review-queue-demo.css'

type ReviewStatus = 'awaiting' | 'approved' | 'changes-requested'
type ReviewDecision = 'approve' | 'request-changes'
type ReviewResolution = 'success' | 'invalid' | 'cancelled'

type ReviewItem = Readonly<{
  id: string
  title: string
  owner: string
  status: ReviewStatus
}>

type OptimisticReviewItem = ReviewItem &
  Readonly<{
    pendingDecision?: ReviewDecision
  }>

type ReviewIntent = Readonly<{
  reviewId: string
  decision: ReviewDecision
}>

type ReviewResult = Readonly<{
  revision: number
  kind: 'idle' | 'success' | 'invalid'
  reviewId: string | null
  fieldError: 'note' | null
  message: string
}>

type PendingReviewAction = Readonly<{
  promise: Promise<ReviewResolution>
  settle: (resolution: ReviewResolution) => void
}>

const initialReviews: readonly ReviewItem[] = [
  {
    id: 'component-library',
    title: '组件库升级说明',
    owner: '林青',
    status: 'awaiting',
  },
  {
    id: 'access-policy',
    title: '访问规则变更',
    owner: '周宁',
    status: 'awaiting',
  },
  {
    id: 'release-notes',
    title: '版本发布记录',
    owner: '许言',
    status: 'awaiting',
  },
]

const initialResult: ReviewResult = {
  revision: 0,
  kind: 'idle',
  reviewId: null,
  fieldError: null,
  message: '尚未提交审核结果',
}

const statusLabels: Record<ReviewStatus, string> = {
  awaiting: '待审核',
  approved: '已通过',
  'changes-requested': '需修改',
}

const decisionLabels: Record<ReviewDecision, string> = {
  approve: '通过',
  'request-changes': '退回修改',
}

/** 从 FormData 中读取字符串字段，忽略 File 和缺失值。 */
function readFormValue(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** 判断字符串是否是审核表单允许提交的决策。 */
function isReviewDecision(value: string): value is ReviewDecision {
  return value === 'approve' || value === 'request-changes'
}

/** 从父 form 的提交状态中读取有效审核意图。 */
function readPendingReviewIntent(pending: boolean, formData: FormData | null): ReviewIntent | null {
  if (!pending || !formData) return null

  const reviewId = readFormValue(formData, 'reviewId')
  const decision = readFormValue(formData, 'decision')
  return reviewId && isReviewDecision(decision) ? { reviewId, decision } : null
}

/** 创建一个由结果控制区手动结算的本地异步 Action。 */
function createPendingReviewAction(): PendingReviewAction {
  let settlePromise!: (resolution: ReviewResolution) => void
  let settled = false
  const promise = new Promise<ReviewResolution>((resolve) => {
    settlePromise = resolve
  })

  /** 只接受第一次结算，避免重复按钮改变同一 Action。 */
  function settle(resolution: ReviewResolution): void {
    if (settled) return
    settled = true
    settlePromise(resolution)
  }

  return { promise, settle }
}

/** 在目标审核行上增加临时决策，不修改基础数组或旧对象。 */
function updateOptimisticQueue(
  currentReviews: readonly OptimisticReviewItem[],
  intent: ReviewIntent,
): readonly OptimisticReviewItem[] {
  return currentReviews.map((review) =>
    review.id === intent.reviewId ? { ...review, pendingDecision: intent.decision } : review,
  )
}

type ReviewSubmitControlsProps = Readonly<{
  blocked: boolean
}>

/** 读取父 form 状态，并把本次 FormData 与提交按钮保持在同一作用域。 */
function ReviewSubmitControls({ blocked }: ReviewSubmitControlsProps) {
  const status = useFormStatus()
  const pendingIntent = readPendingReviewIntent(status.pending, status.data)

  return (
    <div className="review-submit-area">
      <div className="review-submit-buttons">
        <button type="submit" name="decision" value="approve" disabled={blocked || status.pending}>
          {pendingIntent?.decision === 'approve' ? '正在提交通过' : '提交通过'}
        </button>
        <button
          type="submit"
          name="decision"
          value="request-changes"
          className="is-secondary"
          disabled={blocked || status.pending}
        >
          {pendingIntent?.decision === 'request-changes' ? '正在提交退回' : '提交退回'}
        </button>
      </div>
      <p
        className="review-form-status"
        data-testid="review-form-status"
        role="status"
        aria-atomic="true"
      >
        {pendingIntent
          ? `pending=true；记录=${pendingIntent.reviewId}；决策=${pendingIntent.decision}`
          : 'pending=false；当前父表单空闲'}
      </p>
    </div>
  )
}

type ReviewSettlementControlsProps = Readonly<{
  onSettle: (resolution: 'success' | 'invalid') => void
}>

/** 使用父 form 的提交数据展示当前异步结算控制。 */
function ReviewSettlementControls({ onSettle }: ReviewSettlementControlsProps) {
  const status = useFormStatus()
  const pendingIntent = readPendingReviewIntent(status.pending, status.data)

  return (
    <div className="review-settlement" aria-label="异步结果控制">
      <span>当前异步结果</span>
      <strong data-testid="review-active-intent">
        {pendingIntent
          ? `${pendingIntent.reviewId} / ${decisionLabels[pendingIntent.decision]}`
          : '没有待结算审核'}
      </strong>
      <div>
        <button type="button" onClick={() => onSettle('success')} disabled={!pendingIntent}>
          返回成功
        </button>
        <button
          type="button"
          className="is-danger"
          onClick={() => onSettle('invalid')}
          disabled={!pendingIntent}
        >
          返回业务失败
        </button>
      </div>
    </div>
  )
}

type ReviewWorkspaceProps = Readonly<{
  onReset: () => void
}>

/** 组合审核队列、表单提交、业务结果和临时队列。 */
function ReviewWorkspace({ onReset }: ReviewWorkspaceProps) {
  const activeAction = useRef<PendingReviewAction | null>(null)
  const mounted = useRef(true)
  const [reviews, setReviews] = useState(initialReviews)
  const [selectedId, setSelectedId] = useState(initialReviews[0]!.id)
  const [note, setNote] = useState('内容与变更记录一致')
  const [optimisticReviews, addOptimisticReview] = useOptimistic<
    readonly OptimisticReviewItem[],
    ReviewIntent
  >(reviews, updateOptimisticQueue)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
      activeAction.current?.settle('cancelled')
      activeAction.current = null
    }
  }, [])

  /** 提交审核意图，等待业务结算，并返回新的 Action 结果 State。 */
  async function reviewAction(
    previousState: ReviewResult,
    formData: FormData,
  ): Promise<ReviewResult> {
    const reviewId = readFormValue(formData, 'reviewId')
    const decision = readFormValue(formData, 'decision')
    const submittedNote = readFormValue(formData, 'note').trim()
    const review = reviews.find((item) => item.id === reviewId)

    if (!review || review.status !== 'awaiting' || !isReviewDecision(decision)) {
      return {
        ...previousState,
        kind: 'invalid',
        reviewId: reviewId || null,
        fieldError: null,
        message: '审核目标或决策已经失效',
      }
    }

    if (!submittedNote) {
      return {
        ...previousState,
        kind: 'invalid',
        reviewId,
        fieldError: 'note',
        message: '审核备注不能为空',
      }
    }

    const intent = { reviewId, decision } satisfies ReviewIntent
    const pendingAction = createPendingReviewAction()
    activeAction.current = pendingAction
    addOptimisticReview(intent)

    const resolution = await pendingAction.promise
    if (!mounted.current || resolution === 'cancelled') return previousState

    activeAction.current = null

    if (resolution === 'invalid') {
      return {
        ...previousState,
        kind: 'invalid',
        reviewId,
        fieldError: null,
        message: '规则版本已变化，请核对备注后重新提交',
      }
    }

    setReviews((currentReviews) =>
      currentReviews.map((item) =>
        item.id === reviewId
          ? {
              ...item,
              status: decision === 'approve' ? 'approved' : 'changes-requested',
            }
          : item,
      ),
    )

    return {
      revision: previousState.revision + 1,
      kind: 'success',
      reviewId,
      fieldError: null,
      message: `${review.title}已确认：${decisionLabels[decision]}`,
    }
  }

  const [result, submitReview, isActionPending] = useActionState(reviewAction, initialResult)
  const selectedReview = reviews.find((review) => review.id === selectedId) ?? reviews[0]!
  const awaitingCount = reviews.filter((review) => review.status === 'awaiting').length
  const pendingCount = optimisticReviews.filter((review) => review.pendingDecision).length

  /** 切换当前审核记录，提交期间保持 FormData 目标稳定。 */
  function selectReview(reviewId: string): void {
    if (isActionPending) return
    setSelectedId(reviewId)
  }

  /** 更新受控备注，成功和业务失败后都由当前 State 保留。 */
  function updateNote(event: ChangeEvent<HTMLTextAreaElement>): void {
    setNote(event.currentTarget.value)
  }

  /** 手动返回成功或业务失败结果，结束当前 Action。 */
  function settleReview(resolution: 'success' | 'invalid'): void {
    activeAction.current?.settle(resolution)
  }

  return (
    <section className="review-workspace">
      <div className="review-summary" aria-label="审核队列摘要">
        <div>
          <span>基础待审核</span>
          <strong data-testid="review-awaiting-count">{awaitingCount} 项</strong>
        </div>
        <div>
          <span>临时决策</span>
          <strong data-testid="review-optimistic-count">{pendingCount} 项</strong>
        </div>
        <div>
          <span>Action State</span>
          <strong data-testid="review-action-pending">
            {isActionPending ? 'pending' : 'idle'}
          </strong>
        </div>
        <div>
          <span>结果 revision</span>
          <strong data-testid="review-result-revision">{result.revision}</strong>
        </div>
      </div>

      <div className="review-main">
        <section className="review-queue" aria-labelledby="review-queue-title">
          <header>
            <div>
              <span>基础与临时状态</span>
              <h3 id="review-queue-title">审核记录</h3>
            </div>
            <output>{reviews.length} 项</output>
          </header>
          <ul data-testid="review-queue-items">
            {optimisticReviews.map((review) => (
              <li
                key={review.id}
                data-review-id={review.id}
                className={review.id === selectedId ? 'is-selected' : undefined}
              >
                <button
                  type="button"
                  aria-pressed={review.id === selectedId}
                  onClick={() => selectReview(review.id)}
                  disabled={isActionPending}
                >
                  <span>
                    <strong>{review.title}</strong>
                    <small>{review.owner}</small>
                  </span>
                  <em data-testid={`review-status-${review.id}`}>
                    {review.pendingDecision
                      ? `等待确认：${decisionLabels[review.pendingDecision]}`
                      : statusLabels[review.status]}
                  </em>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="review-editor" aria-labelledby="review-editor-title">
          <header>
            <span>当前记录</span>
            <h3 id="review-editor-title">{selectedReview.title}</h3>
            <p>{selectedReview.owner} 提交</p>
          </header>

          <form action={submitReview} aria-label="审核决策表单">
            <input type="hidden" name="reviewId" value={selectedReview.id} />
            <label htmlFor="review-note">审核备注</label>
            <textarea
              id="review-note"
              name="note"
              rows={4}
              value={note}
              onChange={updateNote}
              required
              aria-invalid={result.fieldError === 'note'}
              data-testid="review-note"
            />
            <ReviewSubmitControls blocked={selectedReview.status !== 'awaiting'} />
            <ReviewSettlementControls onSettle={settleReview} />
          </form>
        </section>
      </div>

      <div
        className={`review-result is-${result.kind}`}
        role="status"
        aria-atomic="true"
        data-testid="review-result"
      >
        <span>Action 返回结果</span>
        <strong data-testid="review-result-kind">{result.kind}</strong>
        <p data-testid="review-result-message">{result.message}</p>
      </div>

      <button type="button" className="review-reset" onClick={onReset} disabled={isActionPending}>
        重建审核队列
      </button>
    </section>
  )
}

/** 通过 key 重建队列、表单状态、Action 结果和临时状态。 */
export default function LabActionReviewQueueDemo() {
  const [version, setVersion] = useState(1)

  /** 递增版本，让整组审核状态回到固定初始值。 */
  function resetWorkspace(): void {
    setVersion((currentVersion) => currentVersion + 1)
  }

  return (
    <section className="lab-action-review-queue-demo" data-testid="lab-action-review-queue-demo">
      <header className="review-heading">
        <p>Action Review Queue</p>
        <h2>提交审核决定，同时区分基础、临时、结果和表单状态</h2>
        <span>每次只处理一条记录；异步结果可返回成功或业务失败。</span>
      </header>
      <ReviewWorkspace key={version} onReset={resetWorkspace} />
    </section>
  )
}
