import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'

import hostHtml from './embedded-status-host.html?raw'
import {
  EmbeddedStatusPanel,
  type CommandEvidence,
  type EmbeddedStatusPanelHandle,
  type PanelCommit,
  type PanelMeasurement,
} from './embedded-status-panel'
import {
  createEmbeddedStatusStore,
  type EmbeddedStatusStore,
  type StoreDiagnostics,
} from './embedded-status-store'
import './lab-embedded-status-panel-demo.css'

type HostPhase = 'loading' | 'static' | 'hydrating' | 'hydrated' | 'unmounted'

type HostResources = Readonly<{
  metadata: number
  theme: number
  mainDocument: number
}>

const phaseLabels: Record<HostPhase, string> = {
  loading: '正在创建宿主 Document',
  static: '静态面板已就绪',
  hydrating: '正在接管静态面板',
  hydrated: 'React 已接管面板',
  unmounted: 'React Root 已卸载',
}

const initialResources: HostResources = {
  metadata: 0,
  theme: 0,
  mainDocument: 0,
}

/** 在外层 React 提交结束后释放仍存活的嵌套 Root。 */
function releaseRootAfterCommit(root: Root): void {
  queueMicrotask(() => root.unmount())
}

/** 展示宿主静态页面、Hydration、外部 Store、命令、测量与清理的完整状态机。 */
export default function LabEmbeddedStatusPanelDemo() {
  const rootRef = useRef<Root | null>(null)
  const storeRef = useRef<EmbeddedStatusStore | null>(null)
  const stopObservingStoreRef = useRef<(() => void) | null>(null)
  const frameDocumentRef = useRef<Document | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const originalPanelRef = useRef<HTMLElement | null>(null)
  const originalPrimaryActionRef = useRef<HTMLButtonElement | null>(null)
  const panelHandleRef = useRef<EmbeddedStatusPanelHandle>(null)
  const mountedRef = useRef(true)
  const [phase, setPhase] = useState<HostPhase>('loading')
  const [frameGeneration, setFrameGeneration] = useState(1)
  const [diagnostics, setDiagnostics] = useState<StoreDiagnostics | null>(null)
  const [measurement, setMeasurement] = useState<PanelMeasurement | null>(null)
  const [resources, setResources] = useState<HostResources>(initialResources)
  const [panelIdentityPreserved, setPanelIdentityPreserved] = useState<boolean | null>(null)
  const [buttonIdentityPreserved, setButtonIdentityPreserved] = useState<boolean | null>(null)
  const [recoverableErrors, setRecoverableErrors] = useState(0)
  const [rootErrors, setRootErrors] = useState<string[]>([])
  const [handleKeys, setHandleKeys] = useState('尚未建立 handle')
  const [handleAvailable, setHandleAvailable] = useState(false)
  const [focusOwner, setFocusOwner] = useState('尚未执行聚焦命令')
  const [commandEvidence, setCommandEvidence] = useState<CommandEvidence | null>(null)
  const [containerChildCount, setContainerChildCount] = useState(0)

  /** 读取 iframe 宿主资源与主 Document 污染计数。 */
  const readHostResources = useCallback((): HostResources => {
    const frameDocument = frameDocumentRef.current
    return {
      metadata:
        frameDocument?.querySelectorAll('[data-embedded-status-resource="metadata"]').length ?? 0,
      theme: frameDocument?.querySelectorAll('[data-embedded-status-resource="theme"]').length ?? 0,
      mainDocument: document.querySelectorAll('[data-embedded-status-resource]').length,
    }
  }, [])

  /** 保存面板提交后的节点身份和受限 handle 形状。 */
  const handlePanelCommit = useCallback((commit: PanelCommit): void => {
    if (!mountedRef.current) return
    const handle = panelHandleRef.current
    setPanelIdentityPreserved(originalPanelRef.current === commit.panel)
    setButtonIdentityPreserved(originalPrimaryActionRef.current === commit.primaryAction)
    setHandleAvailable(Boolean(handle))
    setHandleKeys(handle ? Object.keys(handle).sort().join(', ') : 'handle 当前为空')
    setContainerChildCount(containerRef.current?.childElementCount ?? 0)
    setPhase('hydrated')
  }, [])

  /** 保存组件在 layout effect 中测得的有限尺寸证据。 */
  const handlePanelMeasurement = useCallback((nextMeasurement: PanelMeasurement): void => {
    if (mountedRef.current) setMeasurement(nextMeasurement)
  }, [])

  /** 把 Root 错误转换为 Demo 内的可见记录，避免依赖控制台分类。 */
  const recordRootError = useCallback((error: unknown): void => {
    if (!mountedRef.current) return
    setRootErrors((current) => [...current, error instanceof Error ? error.message : String(error)])
  }, [])

  /** 记录任何可恢复 hydration 错误；匹配路径必须保持为零。 */
  const recordRecoverableError = useCallback(
    (error: unknown): void => {
      if (!mountedRef.current) return
      setRecoverableErrors((current) => current + 1)
      recordRootError(error)
    },
    [recordRootError],
  )

  /** 在 Demo 离页时释放诊断观察器与嵌套 React Root。 */
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopObservingStoreRef.current?.()
      stopObservingStoreRef.current = null
      const activeRoot = rootRef.current
      rootRef.current = null
      if (activeRoot) releaseRootAfterCommit(activeRoot)
    }
  }, [])

  /** 清空上一代宿主的观察证据，等待新的 iframe Document。 */
  function resetEvidence(): void {
    frameDocumentRef.current = null
    containerRef.current = null
    originalPanelRef.current = null
    originalPrimaryActionRef.current = null
    panelHandleRef.current = null
    setPhase('loading')
    setDiagnostics(null)
    setMeasurement(null)
    setResources(initialResources)
    setPanelIdentityPreserved(null)
    setButtonIdentityPreserved(null)
    setRecoverableErrors(0)
    setRootErrors([])
    setHandleKeys('尚未建立 handle')
    setHandleAvailable(false)
    setFocusOwner('尚未执行聚焦命令')
    setCommandEvidence(null)
    setContainerChildCount(0)
  }

  /** 卸载旧 Root 和 Store 观察器，再创建全新的宿主 Document。 */
  function rebuildHostDocument(): void {
    const activeRoot = rootRef.current
    rootRef.current = null
    activeRoot?.unmount()
    stopObservingStoreRef.current?.()
    stopObservingStoreRef.current = null
    storeRef.current = null
    resetEvidence()
    setFrameGeneration((current) => current + 1)
  }

  /** 在 iframe load 后保存静态节点，并为该宿主创建外部 Store。 */
  function handleFrameLoad(event: SyntheticEvent<HTMLIFrameElement>): void {
    const frameDocument = event.currentTarget.contentDocument
    const container = frameDocument?.getElementById('embedded-status-root') ?? null
    const panel = frameDocument?.querySelector<HTMLElement>('[data-testid="embedded-status-panel"]')
    const primaryAction =
      frameDocument?.querySelector<HTMLButtonElement>('[data-testid="panel-primary-action"]') ??
      null
    if (!frameDocument || !container || !panel || !primaryAction) return

    stopObservingStoreRef.current?.()
    const store = createEmbeddedStatusStore()
    storeRef.current = store
    stopObservingStoreRef.current = store.observe((nextDiagnostics) => {
      if (mountedRef.current) setDiagnostics(nextDiagnostics)
    })
    frameDocumentRef.current = frameDocument
    containerRef.current = container
    originalPanelRef.current = panel
    originalPrimaryActionRef.current = primaryAction
    setContainerChildCount(container.childElementCount)
    setResources(readHostResources())
    setPhase('static')
  }

  /** 用首份宿主快照接管当前静态面板，并配置结构化错误通道。 */
  function hydrateStaticPanel(): void {
    const container = containerRef.current
    const store = storeRef.current
    if (!container || !store || rootRef.current || phase !== 'static') return

    setPhase('hydrating')
    rootRef.current = hydrateRoot(
      container,
      <EmbeddedStatusPanel
        ref={panelHandleRef}
        store={store}
        onCommit={handlePanelCommit}
        onMeasurement={handlePanelMeasurement}
      />,
      {
        onCaughtError: recordRootError,
        onRecoverableError: recordRecoverableError,
        onUncaughtError: recordRootError,
      },
    )
  }

  /** 从宿主外部发布下一份快照，驱动已接管面板更新。 */
  function publishNextStatus(): void {
    if (phase === 'hydrated') storeRef.current?.publishNext()
  }

  /** 通过有限 handle 聚焦内部主按钮，并验证焦点所在 Document。 */
  function focusPanelAction(): void {
    const handle = panelHandleRef.current
    const frameDocument = frameDocumentRef.current
    if (!handle || !frameDocument) return
    const evidence = handle.focusPrimaryAction()
    setCommandEvidence(evidence)
    setFocusOwner(
      frameDocument.activeElement?.getAttribute('data-testid') === 'panel-primary-action'
        ? 'iframe Document / panel-primary-action'
        : '焦点未进入面板主按钮',
    )
  }

  /** 通过有限 handle 安排下一次提交后的布局测量。 */
  function remeasurePanel(): void {
    const handle = panelHandleRef.current
    if (!handle) return
    setCommandEvidence(handle.remeasure())
  }

  /** 卸载 React Root，并重新读取订阅、handle、容器和宿主资源终态。 */
  function unmountPanelRoot(): void {
    const activeRoot = rootRef.current
    if (!activeRoot || phase !== 'hydrated') return
    rootRef.current = null
    activeRoot.unmount()
    setPhase('unmounted')
    setHandleAvailable(Boolean(panelHandleRef.current))
    setHandleKeys(panelHandleRef.current ? '错误：旧 handle 仍可用' : 'ref.current = null')
    setContainerChildCount(containerRef.current?.childElementCount ?? 0)
    setResources(readHostResources())
    setCommandEvidence(null)
    setFocusOwner('Root 已卸载，命令不可调用')
  }

  const measurementLabel = measurement
    ? `${measurement.width} x ${measurement.height}px / revision ${measurement.revision}`
    : '尚未取得提交后尺寸'
  /** 把三态身份比较结果转换为稳定的界面文字。 */
  const identityLabel = (value: boolean | null): string =>
    value === null ? '尚未比较' : value ? '保持同一 Node' : 'Node 已被替换'

  return (
    <section className="embedded-status-demo" data-testid="embedded-status-demo">
      <header className="embedded-status-demo__heading">
        <p>Host integration contract</p>
        <h2>嵌入式状态面板</h2>
        <span>宿主拥有 Document、外部 Store 和 head 资源；React 只接管面板容器。</span>
      </header>

      <div className="embedded-status-demo__body">
        <section className="embedded-status-demo__controls" aria-label="宿主集成控制">
          <div className="embedded-status-demo__section-heading">
            <div>
              <span>当前阶段</span>
              <strong data-testid="embedded-host-phase">{phaseLabels[phase]}</strong>
            </div>
            <button
              type="button"
              className="embedded-status-demo__rebuild"
              aria-label="重建宿主 Document"
              title="重建宿主 Document"
              onClick={rebuildHostDocument}
            >
              <span aria-hidden="true">&#x21bb;</span>
            </button>
          </div>

          <div className="embedded-status-demo__actions">
            <button type="button" onClick={hydrateStaticPanel} disabled={phase !== 'static'}>
              接管静态面板
            </button>
            <button type="button" onClick={publishNextStatus} disabled={phase !== 'hydrated'}>
              发布下一状态
            </button>
            <button type="button" onClick={focusPanelAction} disabled={phase !== 'hydrated'}>
              聚焦面板主按钮
            </button>
            <button type="button" onClick={remeasurePanel} disabled={phase !== 'hydrated'}>
              重新测量
            </button>
            <button
              type="button"
              className="is-danger"
              onClick={unmountPanelRoot}
              disabled={phase !== 'hydrated'}
            >
              卸载 React Root
            </button>
          </div>
        </section>

        <section className="embedded-status-demo__stage" aria-label="独立宿主页面">
          <div className="embedded-status-demo__section-heading">
            <div>
              <span>独立同源 Document</span>
              <strong>静态 HTML 先显示，React 后接管同一节点</strong>
            </div>
            <span data-testid="embedded-frame-generation">Document {frameGeneration}</span>
          </div>
          <iframe
            key={frameGeneration}
            title="嵌入式状态面板独立宿主页"
            srcDoc={hostHtml}
            onLoad={handleFrameLoad}
          />
        </section>

        <section className="embedded-status-demo__evidence" aria-label="集成合同证据">
          <div className="embedded-status-demo__section-heading">
            <div>
              <span>Contract evidence</span>
              <strong>身份、订阅、命令、测量与资源所有权</strong>
            </div>
            <span data-testid="embedded-root-errors">
              recoverable {recoverableErrors} / root {rootErrors.length}
            </span>
          </div>

          <dl className="embedded-status-demo__facts">
            <div>
              <dt>静态面板身份</dt>
              <dd data-testid="embedded-panel-identity">{identityLabel(panelIdentityPreserved)}</dd>
            </div>
            <div>
              <dt>静态按钮身份</dt>
              <dd data-testid="embedded-button-identity">
                {identityLabel(buttonIdentityPreserved)}
              </dd>
            </div>
            <div>
              <dt>Store snapshot</dt>
              <dd data-testid="embedded-store-snapshot">
                {diagnostics
                  ? `${diagnostics.snapshot.status} / revision ${diagnostics.snapshot.revision}`
                  : '等待宿主 Store'}
              </dd>
            </div>
            <div>
              <dt>active listener</dt>
              <dd data-testid="embedded-active-listeners">{diagnostics?.activeListeners ?? 0}</dd>
            </div>
            <div>
              <dt>subscribe / cleanup</dt>
              <dd data-testid="embedded-subscription-counts">
                {diagnostics
                  ? `${diagnostics.subscribeCount} / ${diagnostics.cleanupCount}`
                  : '0 / 0'}
              </dd>
            </div>
            <div>
              <dt>Root 容器子节点</dt>
              <dd data-testid="embedded-container-children">{containerChildCount}</dd>
            </div>
            <div>
              <dt>公开 handle</dt>
              <dd data-testid="embedded-handle-keys">{handleKeys}</dd>
            </div>
            <div>
              <dt>handle 可用</dt>
              <dd data-testid="embedded-handle-available">{String(handleAvailable)}</dd>
            </div>
            <div>
              <dt>最近命令</dt>
              <dd data-testid="embedded-command-result">
                {commandEvidence
                  ? `${commandEvidence.command} / ${commandEvidence.result}`
                  : '尚未执行命令'}
              </dd>
            </div>
            <div>
              <dt>焦点 owner</dt>
              <dd data-testid="embedded-focus-owner">{focusOwner}</dd>
            </div>
            <div>
              <dt>提交后测量</dt>
              <dd data-testid="embedded-layout-measurement">{measurementLabel}</dd>
            </div>
            <div>
              <dt>宿主 meta / style</dt>
              <dd data-testid="embedded-host-resources">
                {resources.metadata} / {resources.theme}
              </dd>
            </div>
            <div>
              <dt>主 Document 污染</dt>
              <dd data-testid="embedded-main-document-resources">{resources.mainDocument}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  )
}
