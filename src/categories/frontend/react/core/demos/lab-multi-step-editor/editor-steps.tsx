import { useId } from 'react'
import type { ChangeEvent } from 'react'
import {
  AUDIENCE_OPTIONS,
  EDITOR_STEPS,
  type ArticleDraft,
  type Audience,
  type StepId,
} from './editor-data'

type BasicsStepProps = {
  readonly title: string
  readonly author: string
  readonly onTitleChange: (nextTitle: string) => void
  readonly onAuthorChange: (nextAuthor: string) => void
}

type PublishingStepProps = {
  readonly audience: Audience
  readonly summary: string
  readonly onAudienceChange: (nextAudience: Audience) => void
  readonly onSummaryChange: (nextSummary: string) => void
}

type StepNavigationProps = {
  readonly currentStepId: StepId
  readonly availability: Readonly<Record<StepId, boolean>>
  readonly completion: Readonly<Record<StepId, boolean>>
  readonly onStepChange: (nextStepId: StepId) => void
}

type EditorActionsProps = {
  readonly currentStepId: StepId
  readonly canContinue: boolean
  readonly onPrevious: () => void
  readonly onNext: () => void
  readonly onComplete: () => void
}

type DraftSummaryProps = {
  readonly draft: ArticleDraft
  readonly audienceLabel: string
}

type CompletionViewProps = DraftSummaryProps & {
  readonly onContinueEditing: () => void
}

/** 渲染受控的标题和作者字段。 */
export function BasicsStep({ title, author, onTitleChange, onAuthorChange }: BasicsStepProps) {
  const idPrefix = useId()
  const titleId = `${idPrefix}-title`
  const authorId = `${idPrefix}-author`

  /** 把标题输入框的最新字符串交给草稿所有者。 */
  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    onTitleChange(event.currentTarget.value)
  }

  /** 把作者输入框的最新字符串交给草稿所有者。 */
  function handleAuthorChange(event: ChangeEvent<HTMLInputElement>) {
    onAuthorChange(event.currentTarget.value)
  }

  return (
    <section className="multi-step-editor-panel" aria-labelledby={`${idPrefix}-heading`}>
      <div className="multi-step-editor-section-heading">
        <p>第一步</p>
        <h3 id={`${idPrefix}-heading`}>基本信息</h3>
      </div>

      <div className="multi-step-editor-field-row">
        <div className="multi-step-editor-field">
          <label htmlFor={titleId}>文章标题</label>
          <input
            id={titleId}
            value={title}
            onChange={handleTitleChange}
            placeholder="例如：React State 结构设计"
            aria-required="true"
          />
          <p>标题去除首尾空白后不能为空。</p>
        </div>

        <div className="multi-step-editor-field">
          <label htmlFor={authorId}>作者</label>
          <input
            id={authorId}
            value={author}
            onChange={handleAuthorChange}
            placeholder="例如：林同学"
            aria-required="true"
          />
          <p>作者去除首尾空白后不能为空。</p>
        </div>
      </div>
    </section>
  )
}

/** 渲染受控的目标读者和摘要字段。 */
export function PublishingStep({
  audience,
  summary,
  onAudienceChange,
  onSummaryChange,
}: PublishingStepProps) {
  const idPrefix = useId()
  const audienceId = `${idPrefix}-audience`
  const summaryId = `${idPrefix}-summary`

  /** 把目标读者的字符串联合值交给草稿所有者。 */
  function handleAudienceChange(event: ChangeEvent<HTMLSelectElement>) {
    onAudienceChange(event.currentTarget.value as Audience)
  }

  /** 把摘要输入框的最新字符串交给草稿所有者。 */
  function handleSummaryChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onSummaryChange(event.currentTarget.value)
  }

  return (
    <section className="multi-step-editor-panel" aria-labelledby={`${idPrefix}-heading`}>
      <div className="multi-step-editor-section-heading">
        <p>第二步</p>
        <h3 id={`${idPrefix}-heading`}>发布信息</h3>
      </div>

      <div className="multi-step-editor-field">
        <label htmlFor={audienceId}>目标读者</label>
        <select
          id={audienceId}
          value={audience}
          onChange={handleAudienceChange}
          aria-required="true"
        >
          <option value="">请选择目标读者</option>
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="multi-step-editor-field">
        <label htmlFor={summaryId}>文章摘要</label>
        <textarea
          id={summaryId}
          value={summary}
          onChange={handleSummaryChange}
          rows={5}
          placeholder="概括文章解决的问题和主要内容"
          aria-required="true"
        />
        <p>{summary.length} 个字符；摘要去除首尾空白后不能为空。</p>
      </div>
    </section>
  )
}

/** 显示当前草稿的同步复核结果。 */
export function ReviewStep({ draft, audienceLabel }: DraftSummaryProps) {
  return (
    <section className="multi-step-editor-panel" aria-labelledby="multi-step-review-heading">
      <div className="multi-step-editor-section-heading">
        <p>第三步</p>
        <h3 id="multi-step-review-heading">复核内容</h3>
      </div>
      <DraftSummary draft={draft} audienceLabel={audienceLabel} />
    </section>
  )
}

/** 显示完成状态，并允许返回同一份草稿继续修改。 */
export function CompletionView({ draft, audienceLabel, onContinueEditing }: CompletionViewProps) {
  return (
    <section className="multi-step-editor-completion" aria-live="polite">
      <p className="multi-step-editor-completion-label">编辑已完成</p>
      <h3>{draft.title.trim()}</h3>
      <DraftSummary draft={draft} audienceLabel={audienceLabel} />
      <button type="button" onClick={onContinueEditing}>
        继续修改
      </button>
    </section>
  )
}

/** 渲染受控步骤导航，并用文字说明每一步的当前状态。 */
export function StepNavigation({
  currentStepId,
  availability,
  completion,
  onStepChange,
}: StepNavigationProps) {
  return (
    <nav className="multi-step-editor-steps" aria-label="编辑步骤">
      <ol>
        {EDITOR_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStepId
          const isAvailable = availability[step.id]
          const isComplete = completion[step.id]
          const status = isCurrent
            ? '当前'
            : isComplete
              ? '已完成'
              : isAvailable
                ? '可访问'
                : '未解锁'

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                disabled={!isAvailable}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="multi-step-editor-step-number">{index + 1}</span>
                <span className="multi-step-editor-step-copy">
                  <strong>{step.label}</strong>
                  <small>{status}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** 渲染当前步骤允许执行的上一项、下一项或完成命令。 */
export function EditorActions({
  currentStepId,
  canContinue,
  onPrevious,
  onNext,
  onComplete,
}: EditorActionsProps) {
  const isFirstStep = currentStepId === 'basics'
  const isReviewStep = currentStepId === 'review'

  return (
    <div className="multi-step-editor-actions">
      <button type="button" onClick={onPrevious} disabled={isFirstStep}>
        上一步
      </button>
      {isReviewStep ? (
        <button type="button" className="is-primary" onClick={onComplete} disabled={!canContinue}>
          完成编辑
        </button>
      ) : (
        <button type="button" className="is-primary" onClick={onNext} disabled={!canContinue}>
          下一步
        </button>
      )}
    </div>
  )
}

/** 用定义列表展示草稿，不保存复核或完成副本。 */
function DraftSummary({ draft, audienceLabel }: DraftSummaryProps) {
  return (
    <dl className="multi-step-editor-summary">
      <div>
        <dt>标题</dt>
        <dd>{draft.title.trim()}</dd>
      </div>
      <div>
        <dt>作者</dt>
        <dd>{draft.author.trim()}</dd>
      </div>
      <div>
        <dt>目标读者</dt>
        <dd>{audienceLabel}</dd>
      </div>
      <div className="is-wide">
        <dt>摘要</dt>
        <dd>{draft.summary.trim()}</dd>
      </div>
    </dl>
  )
}
