import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'

import fixtureHtml from './hydration-fixture.html?raw'
import './hydrate-root-markup-identity-demo.css'

type HydrationScenario = 'match' | 'mismatch' | 'caught' | 'uncaught' | 'unmount'
type FixturePhase = 'loading' | 'static' | 'hydrating' | 'hydrated' | 'unmounted'
type ErrorChannel = 'recoverable' | 'caught' | 'uncaught'

type ErrorRecord = Readonly<{
  scenario: HydrationScenario
  channel: ErrorChannel
  name: string
  message: string
  componentStack: string
  hasCause: boolean
}>

type FixtureCommit = Readonly<{
  count: number
  rootLabel: string
  main: HTMLElement | null
  countButton: HTMLButtonElement | null
}>

type ErrorBoundaryState = Readonly<{
  failed: boolean
}>

type HydrationFixtureAppProps = Readonly<{
  scenario: HydrationScenario
  rootLabel: string
  onCommit: (commit: FixtureCommit) => void
  onEffectCleanup: () => void
  onEffectMount: () => void
}>

const scenarioLabels: Record<HydrationScenario, string> = {
  match: '匹配接管',
  mismatch: '可恢复 mismatch',
  caught: 'Boundary 捕获',
  uncaught: 'Root 未捕获',
  unmount: '卸载 Root',
}

const phaseLabels: Record<FixturePhase, string> = {
  loading: '正在载入独立文档',
  static: '静态标记已就绪，尚未接管',
  hydrating: '正在建立 hydration Root',
  hydrated: 'React 已接管当前标记',
  unmounted: 'Root 已卸载',
}

/** 把未知错误转换为结构化诊断记录。 */
function createErrorRecord(
  scenario: HydrationScenario,
  channel: ErrorChannel,
  error: unknown,
  errorInfo: { componentStack?: string },
): ErrorRecord {
  const errorObject = error instanceof Error ? error : null
  return {
    scenario,
    channel,
    name: errorObject?.name ?? typeof error,
    message: errorObject?.message ?? String(error),
    componentStack: errorInfo.componentStack ?? '',
    hasCause: Boolean(errorObject && 'cause' in errorObject),
  }
}

/** 在指定 render 中抛出可识别的应用错误。 */
function RenderFailure({ message }: { message: string }): never {
  throw new Error(message)
}

/** 捕获后代 render 错误，并把失败限制在局部 fallback。 */
class FixtureErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  /** 把后代错误转换为当前边界的 fallback 状态。 */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  /** 根据捕获状态显示原后代或局部 fallback。 */
  render(): ReactNode {
    if (this.state.failed) {
      return (
        <p className="hydration-fixture-fallback" role="alert" data-testid="caught-fallback">
          Error Boundary 已接管这块失败内容
        </p>
      )
    }
    return this.props.children
  }
}

/** 生成与静态 fixture 首帧匹配的 React 树，并提供可控错误入口。 */
function HydrationFixtureApp({
  scenario,
  rootLabel,
  onCommit,
  onEffectCleanup,
  onEffectMount,
}: HydrationFixtureAppProps) {
  const mainRef = useRef<HTMLElement>(null)
  const countButtonRef = useRef<HTMLButtonElement>(null)
  const [count, setCount] = useState(0)
  const [caughtFailure, setCaughtFailure] = useState(false)
  const [uncaughtFailure, setUncaughtFailure] = useState(false)

  useEffect(() => {
    onEffectMount()
    return onEffectCleanup
  }, [onEffectCleanup, onEffectMount])

  useEffect(() => {
    onCommit({
      count,
      rootLabel,
      main: mainRef.current,
      countButton: countButtonRef.current,
    })
  }, [count, onCommit, rootLabel])

  /** 用 React State 更新同一个已接管按钮。 */
  function handleIncreaseCount(): void {
    setCount((current) => current + 1)
  }

  /** 只在 Boundary 场景中让受保护后代的下一次 render 失败。 */
  function handleCaughtFailure(): void {
    if (scenario === 'caught') setCaughtFailure(true)
  }

  /** 只在 Root 未捕获场景中让边界外后代的下一次 render 失败。 */
  function handleUncaughtFailure(): void {
    if (scenario === 'uncaught') setUncaughtFailure(true)
  }

  return (
    <main ref={mainRef} className="hydration-fixture-app" data-testid="fixture-main">
      <header className="hydration-fixture-heading">
        <span>about:srcdoc / static snapshot</span>
        <h1 data-testid="fixture-title">{scenario === 'mismatch' ? '客户端快照' : '静态快照'}</h1>
        <p>HTML 先存在；React 接管后，同一按钮才会执行组件中的事件处理。</p>
      </header>
      <section className="hydration-fixture-panel" aria-label="iframe 内的 hydration 操作区">
        <div className="hydration-fixture-count">
          <span>React State 计数</span>
          <strong data-testid="fixture-count">{count}</strong>
        </div>
        <div className="hydration-fixture-root-label">
          <span>root.render 标签</span>
          <strong data-testid="fixture-root-label">{rootLabel}</strong>
        </div>
        <div className="hydration-fixture-actions">
          <button
            ref={countButtonRef}
            type="button"
            data-testid="count-button"
            onClick={handleIncreaseCount}
          >
            计数 +1
          </button>
          <FixtureErrorBoundary>
            <div className="hydration-fixture-action-group">
              <button type="button" data-testid="caught-button" onClick={handleCaughtFailure}>
                触发 Boundary 错误
              </button>
              {caughtFailure ? <RenderFailure message="Boundary 内 render 失败" /> : null}
            </div>
          </FixtureErrorBoundary>
          <button type="button" data-testid="uncaught-button" onClick={handleUncaughtFailure}>
            触发 Root 错误
          </button>
          {uncaughtFailure ? <RenderFailure message="Root 未捕获 render 失败" /> : null}
        </div>
      </section>
    </main>
  )
}

/** 在宿主提交结束后释放离页时仍存活的嵌套 hydration Root。 */
function releaseRootAfterCommit(root: Root): void {
  queueMicrotask(() => root.unmount())
}

/** 展示既有标记、节点身份、事件接管、Root 更新、错误通道与卸载合同。 */
export default function HydrateRootMarkupIdentityDemo() {
  const rootRef = useRef<Root | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const originalMainRef = useRef<HTMLElement | null>(null)
  const originalCountButtonRef = useRef<HTMLButtonElement | null>(null)
  const commitCountRef = useRef(0)
  const mountedRef = useRef(true)
  const [scenario, setScenario] = useState<HydrationScenario>('match')
  const [frameGeneration, setFrameGeneration] = useState(1)
  const [phase, setPhase] = useState<FixturePhase>('loading')
  const [documentUrl, setDocumentUrl] = useState('等待 iframe Document')
  const [observedCount, setObservedCount] = useState(0)
  const [observedRootLabel, setObservedRootLabel] = useState('等待接管')
  const [commitCount, setCommitCount] = useState(0)
  const [effectMountCount, setEffectMountCount] = useState(0)
  const [effectCleanupCount, setEffectCleanupCount] = useState(0)
  const [mainIdentityPreserved, setMainIdentityPreserved] = useState<boolean | null>(null)
  const [buttonIdentityPreserved, setButtonIdentityPreserved] = useState<boolean | null>(null)
  const [errorRecords, setErrorRecords] = useState<ErrorRecord[]>([])
  const [fallbackVisible, setFallbackVisible] = useState(false)
  const [containerChildCount, setContainerChildCount] = useState(0)
  const [oldButtonConnected, setOldButtonConnected] = useState<boolean | null>(null)
  const [unmountReturnedUndefined, setUnmountReturnedUndefined] = useState<boolean | null>(null)
  const [retiredRootError, setRetiredRootError] = useState('尚未验证旧 Root。')
  const [detachedClickStable, setDetachedClickStable] = useState<boolean | null>(null)

  /** 记录当前 fixture App 的 Effect setup。 */
  const handleEffectMount = useCallback((): void => {
    if (mountedRef.current) setEffectMountCount((current) => current + 1)
  }, [])

  /** 记录当前 fixture App 的 Effect cleanup。 */
  const handleEffectCleanup = useCallback((): void => {
    if (mountedRef.current) setEffectCleanupCount((current) => current + 1)
  }, [])

  /** 保存真实提交后的计数与 hydration 前后 Node 身份。 */
  const handleFixtureCommit = useCallback((commit: FixtureCommit): void => {
    if (!mountedRef.current) return
    commitCountRef.current += 1
    setCommitCount(commitCountRef.current)
    setObservedCount(commit.count)
    setObservedRootLabel(commit.rootLabel)
    setMainIdentityPreserved(originalMainRef.current === commit.main)
    setButtonIdentityPreserved(originalCountButtonRef.current === commit.countButton)
    setPhase('hydrated')
    setContainerChildCount(containerRef.current?.childElementCount ?? 0)
  }, [])

  /** 把指定 Root 错误通道追加到结构化记录。 */
  const recordRootError = useCallback(
    (channel: ErrorChannel, error: unknown, errorInfo: { componentStack?: string }): void => {
      if (!mountedRef.current) return
      setErrorRecords((current) => [
        ...current,
        createErrorRecord(scenario, channel, error, errorInfo),
      ])
      queueMicrotask(() => {
        if (!mountedRef.current) return
        const currentDocument = containerRef.current?.ownerDocument
        setFallbackVisible(
          Boolean(currentDocument?.querySelector('[data-testid="caught-fallback"]')),
        )
        setContainerChildCount(containerRef.current?.childElementCount ?? 0)
      })
    },
    [scenario],
  )

  /** 记录被 Error Boundary 捕获的应用错误。 */
  const handleCaughtError = useCallback(
    (error: unknown, errorInfo: { componentStack?: string }): void => {
      recordRootError('caught', error, errorInfo)
    },
    [recordRootError],
  )

  /** 记录 React 已恢复的 hydration 错误。 */
  const handleRecoverableError = useCallback(
    (error: unknown, errorInfo: { componentStack?: string }): void => {
      recordRootError('recoverable', error, errorInfo)
    },
    [recordRootError],
  )

  /** 记录未被 Error Boundary 捕获的 Root 错误。 */
  const handleUncaughtError = useCallback(
    (error: unknown, errorInfo: { componentStack?: string }): void => {
      recordRootError('uncaught', error, errorInfo)
    },
    [recordRootError],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      const activeRoot = rootRef.current
      rootRef.current = null
      if (activeRoot) releaseRootAfterCommit(activeRoot)
    }
  }, [])

  /** 清空场景级证据，等待全新 iframe Document。 */
  function resetEvidence(): void {
    containerRef.current = null
    originalMainRef.current = null
    originalCountButtonRef.current = null
    commitCountRef.current = 0
    setPhase('loading')
    setDocumentUrl('等待 iframe Document')
    setObservedCount(0)
    setObservedRootLabel('等待接管')
    setCommitCount(0)
    setEffectMountCount(0)
    setEffectCleanupCount(0)
    setMainIdentityPreserved(null)
    setButtonIdentityPreserved(null)
    setErrorRecords([])
    setFallbackVisible(false)
    setContainerChildCount(0)
    setOldButtonConnected(null)
    setUnmountReturnedUndefined(null)
    setRetiredRootError('尚未验证旧 Root。')
    setDetachedClickStable(null)
  }

  /** 卸载当前 Root，并载入所选场景的全新静态文档。 */
  function beginScenario(nextScenario: HydrationScenario): void {
    const activeRoot = rootRef.current
    rootRef.current = null
    activeRoot?.unmount()
    resetEvidence()
    setScenario(nextScenario)
    setFrameGeneration((current) => current + 1)
  }

  /** 在 iframe load 后保存 hydration 前的真实 Node 对象。 */
  function handleFrameLoad(event: SyntheticEvent<HTMLIFrameElement>): void {
    const frameDocument = event.currentTarget.contentDocument
    const container = frameDocument?.getElementById('root') ?? null
    const main = frameDocument?.querySelector<HTMLElement>('[data-testid="fixture-main"]') ?? null
    const countButton =
      frameDocument?.querySelector<HTMLButtonElement>('[data-testid="count-button"]') ?? null
    if (!frameDocument || !container || !main || !countButton) return

    containerRef.current = container
    originalMainRef.current = main
    originalCountButtonRef.current = countButton
    setDocumentUrl(frameDocument.URL)
    setContainerChildCount(container.childElementCount)
    setOldButtonConnected(countButton.isConnected)
    setPhase('static')
  }

  /** 对当前独立文档的既有标记建立唯一 hydration Root。 */
  function handleHydrate(): void {
    const container = containerRef.current
    if (!container || rootRef.current || phase !== 'static') return
    setPhase('hydrating')
    rootRef.current = hydrateRoot(
      container,
      <HydrationFixtureApp
        scenario={scenario}
        rootLabel="初始树"
        onCommit={handleFixtureCommit}
        onEffectCleanup={handleEffectCleanup}
        onEffectMount={handleEffectMount}
      />,
      {
        onCaughtError: handleCaughtError,
        onRecoverableError: handleRecoverableError,
        onUncaughtError: handleUncaughtError,
      },
    )
  }

  /** 在 hydration 完成后更新同一 Root，并观察组件 State 是否保留。 */
  function handleRootRenderUpdate(): void {
    const activeRoot = rootRef.current
    if (!activeRoot || phase !== 'hydrated' || scenario !== 'match') return

    activeRoot.render(
      <HydrationFixtureApp
        scenario={scenario}
        rootLabel="更新树"
        onCommit={handleFixtureCommit}
        onEffectCleanup={handleEffectCleanup}
        onEffectMount={handleEffectMount}
      />,
    )
  }

  /** 卸载已接管 Root，并验证容器、旧 Node 与旧 Root 的终态。 */
  function handleUnmount(): void {
    const activeRoot = rootRef.current
    const container = containerRef.current
    const oldButton = originalCountButtonRef.current
    if (!activeRoot || !container || phase !== 'hydrated') return

    const commitsBeforeDetachedClick = commitCountRef.current
    const oldButtonText = oldButton?.textContent ?? ''
    rootRef.current = null
    const result = activeRoot.unmount()
    oldButton?.click()

    let nextRetiredRootError = '旧 Root 未抛出预期错误。'
    try {
      activeRoot.render(
        <HydrationFixtureApp
          scenario="match"
          rootLabel="卸载后的无效更新"
          onCommit={handleFixtureCommit}
          onEffectCleanup={handleEffectCleanup}
          onEffectMount={handleEffectMount}
        />,
      )
    } catch (error) {
      nextRetiredRootError = error instanceof Error ? error.message : String(error)
    }

    setPhase('unmounted')
    setUnmountReturnedUndefined(result === undefined)
    setContainerChildCount(container.childElementCount)
    setOldButtonConnected(oldButton?.isConnected ?? false)
    setRetiredRootError(nextRetiredRootError)
    setDetachedClickStable(
      commitCountRef.current === commitsBeforeDetachedClick &&
        oldButton?.textContent === oldButtonText,
    )
  }

  const recoverableRecords = errorRecords.filter((record) => record.channel === 'recoverable')
  const caughtRecords = errorRecords.filter((record) => record.channel === 'caught')
  const uncaughtRecords = errorRecords.filter((record) => record.channel === 'uncaught')
  const latestError = errorRecords.at(-1)
  const canHydrate = phase === 'static'
  const canUpdateRoot =
    scenario === 'match' &&
    phase === 'hydrated' &&
    observedCount === 1 &&
    observedRootLabel === '初始树'
  const canUnmount = scenario === 'unmount' && phase === 'hydrated' && observedCount === 1

  return (
    <section className="hydrate-root-demo" data-testid="hydrate-root-markup-identity-demo">
      <header className="hydrate-root-demo-heading">
        <p>Existing HTML → hydrateRoot → interactive React</p>
        <h2>在独立文档中观察标记接管与错误边界</h2>
        <span>每次切换场景都会卸载旧 Root，并重新载入同一份可信静态 fixture。</span>
      </header>

      <div className="hydrate-root-demo-body">
        <section className="hydrate-root-scenarios" aria-label="hydration 场景">
          <div className="hydrate-root-section-heading">
            <div>
              <span>Scenario</span>
              <h3>{scenarioLabels[scenario]}</h3>
            </div>
            <strong data-testid="fixture-phase">{phaseLabels[phase]}</strong>
          </div>
          <div className="hydrate-root-scenario-buttons" role="group" aria-label="选择实验场景">
            {(Object.keys(scenarioLabels) as HydrationScenario[]).map((scenarioId) => (
              <button
                key={scenarioId}
                type="button"
                className={scenario === scenarioId ? 'is-active' : ''}
                aria-pressed={scenario === scenarioId}
                onClick={() => beginScenario(scenarioId)}
              >
                {scenarioLabels[scenarioId]}
              </button>
            ))}
          </div>
          <div className="hydrate-root-primary-actions">
            <button type="button" disabled={!canHydrate} onClick={handleHydrate}>
              接管当前 fixture
            </button>
            <button type="button" disabled={!canUpdateRoot} onClick={handleRootRenderUpdate}>
              更新当前 Root
            </button>
            <button type="button" className="is-quiet" onClick={() => beginScenario(scenario)}>
              重建当前场景
            </button>
            <button
              type="button"
              className="is-danger"
              disabled={!canUnmount}
              onClick={handleUnmount}
            >
              卸载当前 Root
            </button>
          </div>
        </section>

        <section className="hydrate-root-stage" aria-label="独立 hydration 文档">
          <div className="hydrate-root-section-heading">
            <div>
              <span>Isolated document</span>
              <h3>静态 React-compatible 输入快照</h3>
            </div>
            <strong data-testid="fixture-document-url">{documentUrl}</strong>
          </div>
          <p className="hydrate-root-fixture-note">
            这份 HTML 由 iframe parser 先建立，不是本课运行时调用 React server API 生成的产物。
          </p>
          <iframe
            key={frameGeneration}
            className="hydrate-root-frame"
            title={`hydrateRoot ${scenarioLabels[scenario]} fixture`}
            srcDoc={fixtureHtml}
            onLoad={handleFrameLoad}
          />
        </section>

        <section className="hydrate-root-observations" aria-label="hydration 观察证据">
          <div className="hydrate-root-section-heading">
            <div>
              <span>Identity and lifecycle</span>
              <h3>节点、提交与卸载证据</h3>
            </div>
            <strong>{rootRef.current ? '1 个 live Root' : '0 个 live Root'}</strong>
          </div>
          <dl className="hydrate-root-facts">
            <div>
              <dt>Main Node 身份</dt>
              <dd data-testid="main-identity">
                {mainIdentityPreserved === null
                  ? '等待接管'
                  : mainIdentityPreserved
                    ? '严格相同'
                    : '已改变'}
              </dd>
            </div>
            <div>
              <dt>按钮 Node 身份</dt>
              <dd data-testid="button-identity">
                {buttonIdentityPreserved === null
                  ? '等待接管'
                  : buttonIdentityPreserved
                    ? '严格相同'
                    : '已改变'}
              </dd>
            </div>
            <div>
              <dt>React State / commit</dt>
              <dd data-testid="fixture-commit-evidence">
                {observedCount} / {commitCount}
              </dd>
            </div>
            <div>
              <dt>root.render 标签</dt>
              <dd data-testid="fixture-root-label-evidence">{observedRootLabel}</dd>
            </div>
            <div>
              <dt>Effect setup / cleanup</dt>
              <dd data-testid="fixture-effect-evidence">
                {effectMountCount} / {effectCleanupCount}
              </dd>
            </div>
            <div>
              <dt>容器 childElementCount</dt>
              <dd data-testid="fixture-child-count">{containerChildCount}</dd>
            </div>
            <div>
              <dt>局部 fallback</dt>
              <dd data-testid="fixture-fallback-visible">
                {fallbackVisible ? '已显示' : '未显示'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="hydrate-root-errors" aria-label="Root 错误通道">
          <div className="hydrate-root-section-heading">
            <div>
              <span>Root callbacks</span>
              <h3>三类错误通道分开记录</h3>
            </div>
            <strong>{errorRecords.length} 条记录</strong>
          </div>
          <div className="hydrate-root-error-row">
            <article className="is-recoverable">
              <span>onRecoverableError</span>
              <strong data-testid="recoverable-count">{recoverableRecords.length}</strong>
              <small>恢复不等于 mismatch 可忽略。</small>
            </article>
            <article className="is-caught">
              <span>onCaughtError</span>
              <strong data-testid="caught-count">{caughtRecords.length}</strong>
              <small>只记录被 Error Boundary 捕获的错误。</small>
            </article>
            <article className="is-uncaught">
              <span>onUncaughtError</span>
              <strong data-testid="uncaught-count">{uncaughtRecords.length}</strong>
              <small>记录越过全部 Error Boundary 的 Root 错误。</small>
            </article>
          </div>
          <div className="hydrate-root-latest-error" data-testid="latest-root-error">
            <span>最近诊断</span>
            <strong>
              {latestError
                ? `${latestError.channel} / ${latestError.name} / stack=${latestError.componentStack ? 'yes' : 'no'} / cause=${latestError.hasCause ? 'yes' : 'no'}`
                : '尚无 Root 错误。'}
            </strong>
            <small>{latestError?.message ?? '匹配场景应让三个通道都保持为 0。'}</small>
          </div>
        </section>

        <section className="hydrate-root-unmount-evidence" aria-label="Root 卸载证据">
          <div className="hydrate-root-section-heading">
            <div>
              <span>Terminal lifecycle</span>
              <h3>旧 Root 不可复用</h3>
            </div>
            <strong>{phase === 'unmounted' ? '生命周期已结束' : '等待卸载场景'}</strong>
          </div>
          <dl className="hydrate-root-facts">
            <div>
              <dt>unmount 返回 undefined</dt>
              <dd data-testid="unmount-result">
                {unmountReturnedUndefined === null
                  ? '未验证'
                  : unmountReturnedUndefined
                    ? '是'
                    : '否'}
              </dd>
            </div>
            <div>
              <dt>旧按钮 isConnected</dt>
              <dd data-testid="old-button-connected">
                {oldButtonConnected === null ? '未验证' : oldButtonConnected ? 'true' : 'false'}
              </dd>
            </div>
            <div>
              <dt>旧按钮点击无更新</dt>
              <dd data-testid="detached-click-stable">
                {detachedClickStable === null ? '未验证' : detachedClickStable ? '是' : '否'}
              </dd>
            </div>
          </dl>
          <p className="hydrate-root-retired-error" data-testid="retired-root-error">
            {retiredRootError}
          </p>
        </section>
      </div>
    </section>
  )
}
