import { useEffect, useRef, useState, useTransition } from 'react'

import { createPendingActionGate } from './pending-action-gate'
import type { PendingActionGate } from './pending-action-gate'
import './use-transition-pending-action-demo.css'

type Panel = 'overview' | 'history' | 'review'
type ActionStage = 'idle' | 'waiting' | 'committing'

type CommitRecord = Readonly<{
  sequence: number
  panel: Panel
}>

const panelLabels: Record<Panel, string> = {
  overview: '概览面板',
  history: '历史面板',
  review: '复核面板',
}

const panelDescriptions: Record<Panel, string> = {
  overview: '查看当前工作区的摘要，等待选择下一步。',
  history: '同步 Action 已提交，可以回看最近的操作记录。',
  review: '异步 Action 已完成，最终复核内容已经显示。',
}

const actionStageLabels: Record<ActionStage, string> = {
  idle: 'idle：没有进行中的 Action',
  waiting: 'waiting：Action 正在等待继续',
  committing: 'committing：正在提交最终面板',
}

type PendingActionExperimentProps = Readonly<{
  onRebuild: () => void
}>

/** 演示同步与异步 Action、pending 生命周期和边界外普通更新。 */
function PendingActionExperiment({ onRebuild }: PendingActionExperimentProps) {
  const [isPending, startTransition] = useTransition()
  const [panel, setPanel] = useState<Panel>('overview')
  const [actionStage, setActionStage] = useState<ActionStage>('idle')
  const [actionCallCount, setActionCallCount] = useState(0)
  const [markerCount, setMarkerCount] = useState(0)
  const [commitHistory, setCommitHistory] = useState<CommitRecord[]>([])
  const activeGate = useRef<PendingActionGate<Panel> | null>(null)

  /** 在面板提交到 DOM 后记录结果，并确认异步 Action 已回到 idle。 */
  useEffect(() => {
    setCommitHistory((records) => [
      ...records,
      { sequence: (records.at(-1)?.sequence ?? 0) + 1, panel },
    ])

    if (panel === 'review') {
      activeGate.current = null
      setActionStage('idle')
    }
  }, [panel])

  /** 立即调用同步 Action，记录调用并安排历史面板更新。 */
  function openHistory(): void {
    startTransition(() => {
      setActionCallCount((count) => count + 1)
      setPanel('history')
    })
  }

  /** 创建本地 gate，并启动等待用户继续的异步 Action。 */
  function openReview(): void {
    const gate = createPendingActionGate<Panel>()
    activeGate.current = gate
    setActionStage('waiting')

    startTransition(async () => {
      setActionCallCount((count) => count + 1)
      const nextPanel = await gate.promise

      startTransition(() => {
        setPanel(nextPanel)
        setActionStage('committing')
      })
    })
  }

  /** 只兑现当前 gate，让等待中的异步 Action 自行恢复。 */
  function continueAction(): void {
    activeGate.current?.resolve('review')
  }

  /** 通过普通 State 更新即时标记现场，不进入 Transition。 */
  function markScene(): void {
    setMarkerCount((count) => count + 1)
  }

  const canStartAction = !isPending && actionStage === 'idle'
  const canOpenHistory = canStartAction && panel !== 'history'
  const canOpenReview = canStartAction && panel !== 'review'
  const canContinueAction = isPending && actionStage === 'waiting'

  return (
    <section className="pending-action-experiment">
      <div className="pending-action-controls" aria-label="Action 控制">
        <button type="button" onClick={openHistory} disabled={!canOpenHistory}>
          同步前往历史
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={openReview}
          disabled={!canOpenReview}
        >
          异步前往复核
        </button>
        <button type="button" className="is-marker" onClick={markScene}>
          标记现场
        </button>
        <button
          type="button"
          className="is-continue"
          onClick={continueAction}
          disabled={!canContinueAction}
        >
          继续 Action
        </button>
        <button type="button" className="is-quiet" onClick={onRebuild} disabled={!canStartAction}>
          重建实验
        </button>
      </div>

      <div className="pending-action-status" aria-live="polite">
        <div>
          <span>React pending</span>
          <strong data-testid="pending-state">{isPending ? 'pending' : 'idle'}</strong>
        </div>
        <div>
          <span>Action 阶段</span>
          <strong data-testid="action-stage">{actionStageLabels[actionStage]}</strong>
        </div>
        <div>
          <span>Action 调用</span>
          <strong data-testid="action-call-count">{actionCallCount} 次</strong>
        </div>
        <div>
          <span>普通标记</span>
          <strong data-testid="marker-count">{markerCount} 次</strong>
        </div>
      </div>

      <div className="pending-action-workspace">
        <article
          className={isPending ? 'pending-action-panel is-pending' : 'pending-action-panel'}
          data-testid="committed-panel"
        >
          <span>当前已提交面板</span>
          <h3>{panelLabels[panel]}</h3>
          <p>{panelDescriptions[panel]}</p>
          {isPending ? <small>旧面板保持可见，等待 Action 完成。</small> : null}
        </article>

        <section className="pending-action-history" aria-labelledby="pending-action-history-title">
          <header>
            <div>
              <span>最终提交历史</span>
              <h3 id="pending-action-history-title">DOM commit</h3>
            </div>
            <output>{commitHistory.length} 条</output>
          </header>
          <ol data-testid="commit-history">
            {commitHistory.map((record) => (
              <li key={record.sequence}>
                <span>#{record.sequence}</span>
                <strong>{panelLabels[record.panel]}</strong>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  )
}

/** 提供可重建的实验边界，让所有本地状态恢复到冷启动值。 */
export default function UseTransitionPendingActionDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 通过更换 key 重建实验组件。 */
  function rebuildExperiment(): void {
    setExperimentVersion((version) => version + 1)
  }

  return (
    <section
      className="use-transition-pending-action-demo"
      data-testid="use-transition-pending-action-demo"
    >
      <header className="pending-action-heading">
        <p>Pending Action</p>
        <h2>等待时保留旧面板，完成后提交复核</h2>
        <span>React 提供 pending；普通标记在 Action 等待期间仍然可用。</span>
      </header>

      <PendingActionExperiment key={experimentVersion} onRebuild={rebuildExperiment} />
    </section>
  )
}
