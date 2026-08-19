import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'

import './react-root-lifecycle-demo.css'

type RootPhase = 'empty' | 'mounted' | 'updated' | 'unmounted'

const phaseLabels: Record<RootPhase, string> = {
  empty: '尚未创建 Root',
  mounted: 'Root 已首次 render',
  updated: '同一个 Root 已再次 render',
  unmounted: 'Root 已 unmount',
}

/** 把指定修订号渲染到受当前 Root 管理的容器中。 */
function renderRevision(root: Root, generation: number, revision: number): void {
  root.render(
    <section className="root-lifecycle-output" data-testid="root-lifecycle-output">
      <strong>Root #{generation}</strong>
      <span>render 修订 #{revision}</span>
    </section>,
  )
}

/** 将播放器退出时仍存活的嵌套 Root 安排到当前提交结束后释放。 */
function releaseRootAfterCommit(root: Root): void {
  queueMicrotask(() => root.unmount())
}

/** 展示 Root 的创建、重复 render、卸载、失效和重建生命周期。 */
export default function ReactRootLifecycleDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRootRef = useRef<Root | null>(null)
  const retiredRootRef = useRef<Root | null>(null)
  const generationRef = useRef(0)
  const revisionRef = useRef(0)
  const [phase, setPhase] = useState<RootPhase>('empty')
  const [message, setMessage] = useState('createRoot 只建立 Root；首次显示还需要 root.render。')

  // 播放器退出时释放仍存活的嵌套 Root。
  useEffect(() => {
    return () => {
      const activeRoot = activeRootRef.current
      activeRootRef.current = null
      if (activeRoot) releaseRootAfterCommit(activeRoot)
    }
  }, [])

  /** 为当前容器创建新 Root，并完成该 Root 的第一次 render。 */
  function handleCreateAndRender(): void {
    const container = containerRef.current
    if (!container || activeRootRef.current) return

    const root = createRoot(container)
    generationRef.current += 1
    revisionRef.current = 1
    activeRootRef.current = root
    retiredRootRef.current = null
    renderRevision(root, generationRef.current, revisionRef.current)
    setPhase('mounted')
    setMessage(`Root #${generationRef.current} 已取得容器所有权并完成首次 render。`)
  }

  /** 在不替换 Root 对象的前提下提交下一份 React node 描述。 */
  function handleUpdate(): void {
    const root = activeRootRef.current
    if (!root) return

    revisionRef.current += 1
    renderRevision(root, generationRef.current, revisionRef.current)
    setPhase('updated')
    setMessage(`仍是 Root #${generationRef.current}，当前为修订 #${revisionRef.current}。`)
  }

  /** 卸载当前 Root，并保留失效对象供下一步验证。 */
  function handleUnmount(): void {
    const root = activeRootRef.current
    if (!root) return

    root.unmount()
    activeRootRef.current = null
    retiredRootRef.current = root
    setPhase('unmounted')
    setMessage('容器内容已移除；旧 Root 已永久失效，但这个 DOM 容器可以创建新 Root。')
  }

  /** 捕获旧 Root 再次 render 时的运行时错误，避免污染 console。 */
  function handleVerifyRetiredRoot(): void {
    const retiredRoot = retiredRootRef.current
    if (!retiredRoot) return

    try {
      retiredRoot.render(<p>这段内容不应出现</p>)
      setMessage('未观察到预期错误。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  const hasActiveRoot = phase === 'mounted' || phase === 'updated'
  const hasRetiredRoot = phase === 'unmounted'

  return (
    <article className="root-lifecycle-demo" data-testid="root-lifecycle-demo">
      <header>
        <p>DOM container → Root → render → unmount</p>
        <h3>一个容器，一次只交给一个存活 Root</h3>
      </header>

      <div className="root-lifecycle-toolbar" aria-label="Root 生命周期操作">
        <button type="button" onClick={handleCreateAndRender} disabled={hasActiveRoot}>
          {phase === 'unmounted' ? '为同一容器创建新 Root' : '创建 Root 并首次 render'}
        </button>
        <button type="button" onClick={handleUpdate} disabled={!hasActiveRoot}>
          同 Root 再次 render
        </button>
        <button type="button" onClick={handleUnmount} disabled={!hasActiveRoot}>
          unmount
        </button>
        <button type="button" onClick={handleVerifyRetiredRoot} disabled={!hasRetiredRoot}>
          验证旧 Root 不可复用
        </button>
      </div>

      <dl className="root-lifecycle-facts">
        <div>
          <dt>当前阶段</dt>
          <dd data-testid="root-lifecycle-phase">{phaseLabels[phase]}</dd>
        </div>
        <div>
          <dt>Root 实例代次</dt>
          <dd data-testid="root-lifecycle-generation">{generationRef.current || '尚无'}</dd>
        </div>
      </dl>

      <div
        ref={containerRef}
        className="root-lifecycle-container"
        data-testid="root-lifecycle-container"
        aria-label="由嵌套 React Root 管理的 DOM 容器"
      />

      <p className="root-lifecycle-message" data-testid="root-lifecycle-message" aria-live="polite">
        {message}
      </p>
    </article>
  )
}
