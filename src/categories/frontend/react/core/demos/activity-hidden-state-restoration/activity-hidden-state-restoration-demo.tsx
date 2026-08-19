import { Activity, useCallback, useEffect, useRef, useState } from 'react'

import './activity-hidden-state-restoration-demo.css'

type EffectEvent = 'setup' | 'cleanup'

type ActivityWorkspaceProps = Readonly<{
  revision: number
  onEffectEvent: (event: EffectEvent) => void
}>

/** 提供可隐藏的工作区，并把局部 State、未受控 DOM 与 Effect 生命周期留在边界内。 */
function ActivityWorkspace({ revision, onEffectEvent }: ActivityWorkspaceProps) {
  const [count, setCount] = useState(0)

  /** 把当前工作区的 Effect 建立与清理事件报告给边界外观察区。 */
  useEffect(() => {
    onEffectEvent('setup')
    return () => onEffectEvent('cleanup')
  }, [onEffectEvent])

  /** 修改边界内部的 React State，供恢复后核对。 */
  function incrementCount(): void {
    setCount((currentCount) => currentCount + 1)
  }

  return (
    <section
      id="activity-workspace"
      className="activity-workspace"
      data-testid="activity-workspace"
      data-revision={revision}
      aria-labelledby="activity-workspace-title"
    >
      <header className="activity-workspace-heading">
        <div>
          <span>边界内工作区</span>
          <h3 id="activity-workspace-title">发布草稿</h3>
        </div>
        <output data-testid="activity-workspace-revision">父级 revision {revision}</output>
      </header>

      <div className="activity-workspace-body">
        <article className="activity-counter-panel">
          <span>React State 计数</span>
          <strong data-testid="activity-count">{count}</strong>
          <button type="button" onClick={incrementCount}>
            计数 +1
          </button>
        </article>

        <label className="activity-draft-field">
          <span>未受控 DOM 草稿</span>
          <textarea
            defaultValue=""
            placeholder="记录一段待恢复的草稿"
            data-testid="activity-draft"
          />
        </label>
      </div>
    </section>
  )
}

type ActivityExperimentProps = Readonly<{
  onRebuild: () => void
}>

type EffectStats = Readonly<{
  setupCount: number
  cleanupCount: number
  latestEvent: string
}>

type DomSnapshot = Readonly<{
  connected: string
  display: string
  identity: string
  revision: string
  draftValue: string
}>

/** 管理 Activity 模式、父级更新、Effect 记录与宿主 DOM 身份检查。 */
function ActivityExperiment({ onRebuild }: ActivityExperimentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [revision, setRevision] = useState(1)
  const [effectStats, setEffectStats] = useState<EffectStats>({
    setupCount: 0,
    cleanupCount: 0,
    latestEvent: '初始 hidden，Effect 尚未建立',
  })
  const [domSnapshot, setDomSnapshot] = useState<DomSnapshot>({
    connected: '待检查',
    display: '待检查',
    identity: '待建立可见节点基线',
    revision: '待检查',
    draftValue: '待检查',
  })
  const experimentRef = useRef<HTMLElement | null>(null)
  const baselineNodeRef = useRef<HTMLElement | null>(null)
  const mode = isVisible ? 'visible' : 'hidden'

  /** 记录边界后代 Effect 的 setup 与 cleanup 次数。 */
  const recordEffectEvent = useCallback((event: EffectEvent): void => {
    setEffectStats((currentStats) => ({
      setupCount: currentStats.setupCount + (event === 'setup' ? 1 : 0),
      cleanupCount: currentStats.cleanupCount + (event === 'cleanup' ? 1 : 0),
      latestEvent: event === 'setup' ? 'Effect 已建立' : 'Effect cleanup 已执行',
    }))
  }, [])

  /** 显示已预渲染的工作区，并允许其 Effect 建立。 */
  function showWorkspace(): void {
    setIsVisible(true)
  }

  /** 隐藏工作区，让 React 清理后代 Effect。 */
  function hideWorkspace(): void {
    setIsVisible(false)
  }

  /** 在 hidden 阶段更新父级 prop，观察后代最终以低优先级追上。 */
  function updateHiddenRevision(): void {
    setRevision(2)
  }

  /** 检查宿主节点身份、隐藏更新与浏览器保存的未受控草稿。 */
  function inspectWorkspaceDom(): void {
    const workspaceNode =
      experimentRef.current?.querySelector<HTMLElement>('[data-testid="activity-workspace"]') ??
      null
    const draftNode =
      workspaceNode?.querySelector<HTMLTextAreaElement>('[data-testid="activity-draft"]') ?? null

    if (workspaceNode && isVisible && !baselineNodeRef.current) {
      baselineNodeRef.current = workspaceNode
    }

    const identity = !baselineNodeRef.current
      ? '尚未在 visible 模式建立基线'
      : workspaceNode === baselineNodeRef.current
        ? '与首次可见时为同一节点'
        : '节点已更换'

    setDomSnapshot({
      connected: workspaceNode?.isConnected ? '节点仍连接' : '未找到已连接节点',
      display: workspaceNode ? window.getComputedStyle(workspaceNode).display : '不可读取',
      identity,
      revision: workspaceNode?.dataset.revision ?? '不可读取',
      draftValue: draftNode?.value || '空草稿',
    })
  }

  return (
    <section
      ref={experimentRef}
      className="activity-hidden-demo"
      data-testid="activity-hidden-state-restoration-demo"
    >
      <header className="activity-hidden-heading">
        <p>Activity lifecycle</p>
        <h2>隐藏 UI，保留 State 与 DOM</h2>
        <span>工作区从 hidden 冷状态开始，边界外的控制与观察始终可用。</span>
      </header>

      <div className="activity-hidden-controls" aria-label="Activity 显隐控制">
        <button
          type="button"
          aria-controls="activity-workspace"
          aria-expanded={isVisible}
          onClick={showWorkspace}
          disabled={isVisible}
        >
          显示工作区
        </button>
        <button
          type="button"
          className="is-secondary"
          aria-controls="activity-workspace"
          aria-expanded={isVisible}
          onClick={hideWorkspace}
          disabled={!isVisible}
        >
          隐藏工作区
        </button>
        <button
          type="button"
          className="is-revision"
          onClick={updateHiddenRevision}
          disabled={isVisible || revision === 2}
        >
          更新隐藏 revision
        </button>
        <button type="button" className="is-inspect" onClick={inspectWorkspaceDom}>
          检查 DOM
        </button>
        <button type="button" className="is-quiet" onClick={onRebuild}>
          重建实验
        </button>
      </div>

      <div className="activity-hidden-status" aria-live="polite">
        <div>
          <span>当前 mode</span>
          <strong data-testid="activity-mode">{mode}</strong>
        </div>
        <div>
          <span>父级 revision</span>
          <strong data-testid="activity-revision">{revision}</strong>
        </div>
        <div>
          <span>Effect setup</span>
          <strong data-testid="activity-effect-setup">{effectStats.setupCount}</strong>
        </div>
        <div>
          <span>Effect cleanup</span>
          <strong data-testid="activity-effect-cleanup">{effectStats.cleanupCount}</strong>
        </div>
      </div>

      <p className="activity-effect-event" role="status" data-testid="activity-effect-event">
        {effectStats.latestEvent}
      </p>

      <section className="activity-dom-snapshot" aria-label="DOM 检查快照">
        <div>
          <span>连接状态</span>
          <strong data-testid="activity-dom-connected">{domSnapshot.connected}</strong>
        </div>
        <div>
          <span>computed display</span>
          <strong data-testid="activity-dom-display">{domSnapshot.display}</strong>
        </div>
        <div>
          <span>节点身份</span>
          <strong data-testid="activity-dom-identity">{domSnapshot.identity}</strong>
        </div>
        <div>
          <span>子树 revision</span>
          <strong data-testid="activity-dom-revision">{domSnapshot.revision}</strong>
        </div>
        <div>
          <span>textarea current value</span>
          <strong data-testid="activity-dom-draft-value">{domSnapshot.draftValue}</strong>
        </div>
      </section>

      <Activity name="发布草稿工作区" mode={isVisible ? 'visible' : 'hidden'}>
        <ActivityWorkspace revision={revision} onEffectEvent={recordEffectEvent} />
      </Activity>
    </section>
  )
}

/** 提供按 key 重建的 Activity 实验，使所有证据回到 cold-hidden。 */
export default function ActivityHiddenStateRestorationDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 更换实验 key，创建全新的 Activity、State 与宿主 DOM。 */
  function rebuildExperiment(): void {
    setExperimentVersion((currentVersion) => currentVersion + 1)
  }

  return <ActivityExperiment key={experimentVersion} onRebuild={rebuildExperiment} />
}
