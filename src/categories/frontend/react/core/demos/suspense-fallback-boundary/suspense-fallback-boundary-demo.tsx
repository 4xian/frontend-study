import { lazy, Suspense, useCallback, useState } from 'react'

import {
  getInspectorLoaderCallCount,
  getInspectorRevisionLoaderCallCount,
  getSummaryLoaderCallCount,
  loadSuspenseInspector,
  loadSuspenseInspectorRevision,
  loadSuspenseSummary,
  revealSuspenseInspector,
  revealSuspenseInspectorRevision,
  revealSuspenseSummary,
} from './suspense-gates'
import './suspense-fallback-boundary-demo.css'

const LazySuspenseSummary = lazy(loadSuspenseSummary)
const LazySuspenseInspector = lazy(loadSuspenseInspector)
const LazySuspenseInspectorRevision = lazy(loadSuspenseInspectorRevision)

type RevealStage =
  | 'idle'
  | 'outer-pending'
  | 'summary-releasing'
  | 'inner-pending'
  | 'inspector-releasing'
  | 'complete'
  | 'revision-pending'
  | 'revision-releasing'
  | 'revision-complete'

const stageLabels: Record<RevealStage, string> = {
  idle: '实验尚未开始',
  'outer-pending': '外层边界正在显示 fallback',
  'summary-releasing': '摘要已就绪，React 正在 reveal',
  'inner-pending': '摘要已 reveal，内层仍在等待',
  'inspector-releasing': '检查器已就绪，React 正在 reveal',
  complete: '两层内容均已 reveal',
  'revision-pending': '内层再次挂起，正在重显 fallback',
  'revision-releasing': '新版检查器已就绪，React 正在 reveal',
  'revision-complete': '新版检查器已 reveal，摘要始终可见',
}

/** 显示替换整个工作区内容的外层 fallback。 */
function OuterFallback() {
  return (
    <div
      className="suspense-boundary-fallback is-outer"
      role="status"
      data-testid="suspense-outer-fallback"
    >
      <span>最近边界：外层 Suspense</span>
      <strong>正在准备工作区...</strong>
      <p>摘要 loader 已调用 {getSummaryLoaderCallCount()} 次，边界外控制区仍可操作。</p>
    </div>
  )
}

/** 显示只替换检查器区域的内层 fallback。 */
function InnerFallback({ isRevision }: { isRevision: boolean }) {
  const loaderCallCount = isRevision
    ? getInspectorRevisionLoaderCallCount()
    : getInspectorLoaderCallCount()

  return (
    <div
      className="suspense-boundary-fallback is-inner"
      role="status"
      data-testid="suspense-inner-fallback"
    >
      <span>最近边界：内层 Suspense</span>
      <strong>{isRevision ? '正在准备新版检查器...' : '正在准备检查器...'}</strong>
      <p>当前检查器 loader 已调用 {loaderCallCount} 次，摘要继续保持可见。</p>
    </div>
  )
}

/** 重新加载当前页面以创建一组全新的本地 lazy gate。 */
function restartSuspenseExperiment(): void {
  window.location.reload()
}

/** 演示最近 Suspense 边界如何限定 fallback 与嵌套 reveal 范围。 */
export default function SuspenseFallbackBoundaryDemo() {
  const [started, setStarted] = useState(false)
  const [stage, setStage] = useState<RevealStage>('idle')
  const [showInspectorRevision, setShowInspectorRevision] = useState(false)

  /** 在摘要实际提交后同步当前可见阶段。 */
  const handleSummaryReveal = useCallback(() => {
    setStage('inner-pending')
  }, [])

  /** 在检查器实际提交后同步当前可见阶段。 */
  const handleInspectorReveal = useCallback(() => {
    setStage('complete')
  }, [])

  /** 在新版检查器实际提交后记录结构保护结果。 */
  const handleInspectorRevisionReveal = useCallback(() => {
    setStage('revision-complete')
  }, [])

  /** 启动外层与内层 lazy 子树的首次渲染。 */
  function startExperiment(): void {
    setStarted(true)
    setStage('outer-pending')
  }

  /** 放行摘要模块，让外层内容与内层 fallback 一起 reveal。 */
  function revealSummary(): void {
    revealSuspenseSummary()
    setStage('summary-releasing')
  }

  /** 放行检查器模块，完成最后一层 reveal。 */
  function revealInspector(): void {
    revealSuspenseInspector()
    setStage('inspector-releasing')
  }

  /** 切换到尚未就绪的新版检查器，使已显示的内层内容再次挂起。 */
  function startInspectorRevision(): void {
    setShowInspectorRevision(true)
    setStage('revision-pending')
  }

  /** 放行新版检查器模块，结束内层 fallback 的再次显示。 */
  function revealInspectorRevision(): void {
    revealSuspenseInspectorRevision()
    setStage('revision-releasing')
  }

  return (
    <section className="suspense-boundary-demo" data-testid="suspense-fallback-boundary-demo">
      <header className="suspense-boundary-heading">
        <p>Nested reveal</p>
        <h2>最近边界决定等待界面的范围</h2>
        <span>控制区始终位于 Suspense 之外，可以逐步放行三个本地 lazy 模块。</span>
      </header>

      <div className="suspense-boundary-controls" aria-label="Suspense reveal 控制">
        <button type="button" onClick={startExperiment} disabled={stage !== 'idle'}>
          开始加载
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={revealSummary}
          disabled={stage !== 'outer-pending'}
        >
          摘要就绪
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={revealInspector}
          disabled={stage !== 'inner-pending'}
        >
          检查器就绪
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={startInspectorRevision}
          disabled={stage !== 'complete'}
        >
          加载新版检查器
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={revealInspectorRevision}
          disabled={stage !== 'revision-pending'}
        >
          新版检查器就绪
        </button>
        <button type="button" className="is-quiet" onClick={restartSuspenseExperiment}>
          重新开始
        </button>
      </div>

      <div className="suspense-boundary-status" aria-live="polite">
        <span>当前可见阶段</span>
        <strong data-testid="suspense-stage">{stageLabels[stage]}</strong>
        <p>
          loader 调用：摘要 <output>{getSummaryLoaderCallCount()}</output> 次，检查器{' '}
          <output>{getInspectorLoaderCallCount()}</output> 次，新版检查器{' '}
          <output>{getInspectorRevisionLoaderCallCount()}</output> 次
        </p>
      </div>

      {started ? (
        <Suspense fallback={<OuterFallback />}>
          <div className="suspense-boundary-workspace" data-testid="suspense-workspace">
            <LazySuspenseSummary onReveal={handleSummaryReveal} />
            <Suspense fallback={<InnerFallback isRevision={showInspectorRevision} />}>
              {showInspectorRevision ? (
                <LazySuspenseInspectorRevision onReveal={handleInspectorRevisionReveal} />
              ) : (
                <LazySuspenseInspector onReveal={handleInspectorReveal} />
              )}
            </Suspense>
          </div>
        </Suspense>
      ) : (
        <div className="suspense-boundary-placeholder" data-testid="suspense-placeholder">
          <strong>工作区暂未挂载</strong>
          <p>开始后，摘要与初版检查器的 lazy loader 才会进入首次 render。</p>
        </div>
      )}
    </section>
  )
}
