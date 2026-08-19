import { useState } from 'react'
import {
  AUDIENCE_LABELS,
  EDITOR_STEPS,
  type ArticleDraft,
  type Audience,
  type StepId,
} from './editor-data'
import {
  BasicsStep,
  CompletionView,
  EditorActions,
  PublishingStep,
  ReviewStep,
  StepNavigation,
} from './editor-steps'

type EditorView =
  { readonly status: 'editing'; readonly stepId: StepId } | { readonly status: 'completed' }

type EditorWorkspaceProps = {
  readonly templateLabel: string
  readonly initialDraft: ArticleDraft
}

/** 保存单次编辑会话的草稿和流程视图，并派生全部步骤状态。 */
export function EditorWorkspace({ templateLabel, initialDraft }: EditorWorkspaceProps) {
  const [draft, setDraft] = useState<ArticleDraft>(() => ({ ...initialDraft }))
  const [view, setView] = useState<EditorView>({ status: 'editing', stepId: 'basics' })

  const basicsComplete = draft.title.trim().length > 0 && draft.author.trim().length > 0
  const publishingComplete = draft.audience !== '' && draft.summary.trim().length > 0
  const allComplete = basicsComplete && publishingComplete
  const audienceLabel = draft.audience === '' ? '尚未选择' : AUDIENCE_LABELS[draft.audience]

  const availability: Readonly<Record<StepId, boolean>> = {
    basics: true,
    publishing: basicsComplete,
    review: allComplete,
  }
  const completion: Readonly<Record<StepId, boolean>> = {
    basics: basicsComplete,
    publishing: publishingComplete,
    review: allComplete,
  }

  /** 不可变替换文章标题，并保留草稿中的其他字段。 */
  function handleTitleChange(nextTitle: string) {
    setDraft((previous) => ({ ...previous, title: nextTitle }))
  }

  /** 不可变替换作者，并保留草稿中的其他字段。 */
  function handleAuthorChange(nextAuthor: string) {
    setDraft((previous) => ({ ...previous, author: nextAuthor }))
  }

  /** 不可变替换目标读者，并保留草稿中的其他字段。 */
  function handleAudienceChange(nextAudience: Audience) {
    setDraft((previous) => ({ ...previous, audience: nextAudience }))
  }

  /** 不可变替换摘要，并保留草稿中的其他字段。 */
  function handleSummaryChange(nextSummary: string) {
    setDraft((previous) => ({ ...previous, summary: nextSummary }))
  }

  /** 在目标步骤已解锁时切换受控步骤。 */
  function handleStepChange(nextStepId: StepId) {
    if (availability[nextStepId]) {
      setView({ status: 'editing', stepId: nextStepId })
    }
  }

  /** 返回固定步骤序列中的上一项。 */
  function handlePrevious() {
    if (view.status !== 'editing') return

    const currentIndex = EDITOR_STEPS.findIndex((step) => step.id === view.stepId)
    const previousStep = EDITOR_STEPS[currentIndex - 1]
    if (previousStep) {
      setView({ status: 'editing', stepId: previousStep.id })
    }
  }

  /** 在当前步骤完成时进入固定步骤序列中的下一项。 */
  function handleNext() {
    if (view.status !== 'editing') return

    const currentCanContinue = view.stepId === 'basics' ? basicsComplete : publishingComplete
    const currentIndex = EDITOR_STEPS.findIndex((step) => step.id === view.stepId)
    const nextStep = EDITOR_STEPS[currentIndex + 1]
    if (currentCanContinue && nextStep) {
      setView({ status: 'editing', stepId: nextStep.id })
    }
  }

  /** 在全部字段完成且位于复核步骤时进入完成视图。 */
  function handleComplete() {
    if (view.status === 'editing' && view.stepId === 'review' && allComplete) {
      setView({ status: 'completed' })
    }
  }

  /** 从完成视图返回同一份草稿的复核步骤。 */
  function handleContinueEditing() {
    setView({ status: 'editing', stepId: 'review' })
  }

  if (view.status === 'completed') {
    return (
      <article className="multi-step-editor-workspace">
        <CompletionView
          draft={draft}
          audienceLabel={audienceLabel}
          onContinueEditing={handleContinueEditing}
        />
      </article>
    )
  }

  const currentStepIndex = EDITOR_STEPS.findIndex((step) => step.id === view.stepId)
  const canContinue =
    view.stepId === 'basics'
      ? basicsComplete
      : view.stepId === 'publishing'
        ? publishingComplete
        : allComplete

  return (
    <article className="multi-step-editor-workspace">
      <header className="multi-step-editor-workspace-heading">
        <div>
          <p>当前模板</p>
          <h2>{templateLabel}</h2>
        </div>
        <output aria-live="polite">
          第 {currentStepIndex + 1} 步，共 {EDITOR_STEPS.length} 步
        </output>
      </header>

      <StepNavigation
        currentStepId={view.stepId}
        availability={availability}
        completion={completion}
        onStepChange={handleStepChange}
      />

      {view.stepId === 'basics' && (
        <BasicsStep
          title={draft.title}
          author={draft.author}
          onTitleChange={handleTitleChange}
          onAuthorChange={handleAuthorChange}
        />
      )}
      {view.stepId === 'publishing' && (
        <PublishingStep
          audience={draft.audience}
          summary={draft.summary}
          onAudienceChange={handleAudienceChange}
          onSummaryChange={handleSummaryChange}
        />
      )}
      {view.stepId === 'review' && <ReviewStep draft={draft} audienceLabel={audienceLabel} />}

      <EditorActions
        currentStepId={view.stepId}
        canContinue={canContinue}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
      />
    </article>
  )
}
