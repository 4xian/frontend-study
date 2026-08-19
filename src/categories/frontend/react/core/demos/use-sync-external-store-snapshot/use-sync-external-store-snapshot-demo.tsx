import { useEffect, useState, useSyncExternalStore } from 'react'

import './use-sync-external-store-snapshot-demo.css'

type ReaderId = 'alpha' | 'beta'

type StoreSnapshot = Readonly<{
  revision: number
  message: string
  identity: string
}>

type StoreDiagnostics = Readonly<{
  activeListeners: number
  subscribeCount: number
  cleanupCount: number
  notifyCount: number
  shellRenderCount: number
  readerGeneration: number
  readerEffectSetups: Readonly<Record<ReaderId, number>>
  snapshotRevision: number
  snapshotIdentity: string
  snapshotFrozen: boolean
  lastOperation: string
  lastIdentityEqual: boolean | null
}>

type DiagnosticObserver = (diagnostics: StoreDiagnostics) => void

const readerLabels: Record<ReaderId, string> = {
  alpha: 'Reader A',
  beta: 'Reader B',
}

/** 创建一份发布后不再改写的课程 store 快照。 */
function createSnapshot(revision: number): StoreSnapshot {
  return Object.freeze({
    revision,
    message: revision === 0 ? '等待第一份外部更新' : `已发布第 ${revision} 份快照`,
    identity: `snapshot-${revision}`,
  })
}

/** 持有 React 外部状态、稳定读取函数、订阅集合与只读诊断账本。 */
class CourseExternalStore {
  private snapshot = createSnapshot(0)
  private readonly listeners = new Set<() => void>()
  private readonly diagnosticObservers = new Set<DiagnosticObserver>()
  private subscribeCount = 0
  private cleanupCount = 0
  private notifyCount = 0
  private shellRenderCount = 0
  private readerGeneration = 1
  private readerEffectSetups: Record<ReaderId, number> = { alpha: 0, beta: 0 }
  private lastOperation = '冷启动'
  private lastIdentityEqual: boolean | null = null

  /** 返回当前缓存快照；读取本身不会创建新对象。 */
  readonly getSnapshot = (): StoreSnapshot => this.snapshot

  /** 注册 React 的失效通知，并返回对称的退订函数。 */
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    this.subscribeCount += 1
    this.lastOperation = 'Reader 已订阅'
    this.publishDiagnostics()

    /** 移除当前 listener，并刷新订阅清理账本。 */
    return () => {
      if (!this.listeners.delete(listener)) return
      this.cleanupCount += 1
      this.lastOperation = 'Reader 已 cleanup'
      this.publishDiagnostics()
    }
  }

  /** 创建下一份不可变快照，再通知所有 Reader 重新读取。 */
  publishNextSnapshot(): void {
    const previousSnapshot = this.snapshot
    this.snapshot = createSnapshot(previousSnapshot.revision + 1)
    this.lastOperation = `发布 ${this.snapshot.identity}`
    this.lastIdentityEqual = Object.is(previousSnapshot, this.snapshot)
    this.notifyReaders()
  }

  /** 重复通知当前快照，证明通知不等于必然 render。 */
  notifySameSnapshot(): void {
    const previousSnapshot = this.snapshot
    this.lastOperation = `重复通知 ${this.snapshot.identity}`
    this.lastIdentityEqual = Object.is(previousSnapshot, this.snapshot)
    this.notifyReaders()
  }

  /** 记录一次只属于 Demo 外壳的普通 React render。 */
  recordShellRender(): void {
    this.shellRenderCount += 1
    this.lastOperation = '仅更新 Demo 外壳'
    this.lastIdentityEqual = Object.is(this.snapshot, this.snapshot)
    this.publishDiagnostics()
  }

  /** 为重新挂载的 Reader 开启新代次，并重置本代 Effect setup 账本。 */
  beginReaderGeneration(): number {
    this.readerGeneration += 1
    this.readerEffectSetups = { alpha: 0, beta: 0 }
    this.lastOperation = `准备挂载第 ${this.readerGeneration} 代 Reader`
    this.lastIdentityEqual = Object.is(this.snapshot, this.snapshot)
    this.publishDiagnostics()
    return this.readerGeneration
  }

  /** 标记 Reader 区即将卸载，真实 listener 数由 cleanup 更新。 */
  markReadersUnmounting(): void {
    this.lastOperation = '准备卸载 Reader'
    this.lastIdentityEqual = Object.is(this.snapshot, this.snapshot)
    this.publishDiagnostics()
  }

  /** 记录指定代次 Reader 执行的一次提交后 Effect setup。 */
  recordReaderEffectSetup(readerId: ReaderId, generation: number): void {
    if (generation !== this.readerGeneration) return
    this.readerEffectSetups = {
      ...this.readerEffectSetups,
      [readerId]: this.readerEffectSetups[readerId] + 1,
    }
    this.publishDiagnostics()
  }

  /** 读取一份不参与 store snapshot 判断的诊断数据。 */
  readDiagnostics(): StoreDiagnostics {
    return Object.freeze({
      activeListeners: this.listeners.size,
      subscribeCount: this.subscribeCount,
      cleanupCount: this.cleanupCount,
      notifyCount: this.notifyCount,
      shellRenderCount: this.shellRenderCount,
      readerGeneration: this.readerGeneration,
      readerEffectSetups: Object.freeze({ ...this.readerEffectSetups }),
      snapshotRevision: this.snapshot.revision,
      snapshotIdentity: this.snapshot.identity,
      snapshotFrozen: Object.isFrozen(this.snapshot),
      lastOperation: this.lastOperation,
      lastIdentityEqual: this.lastIdentityEqual,
    })
  }

  /** 订阅只读诊断变化；它不参与 useSyncExternalStore 的数据合同。 */
  observeDiagnostics(observer: DiagnosticObserver): () => void {
    this.diagnosticObservers.add(observer)
    observer(this.readDiagnostics())

    /** 停止接收诊断账本变化。 */
    return () => {
      this.diagnosticObservers.delete(observer)
    }
  }

  /** 通知全部 Reader 重新读取当前缓存快照。 */
  private notifyReaders(): void {
    this.notifyCount += 1
    for (const listener of this.listeners) listener()
    this.publishDiagnostics()
  }

  /** 向诊断观察器发布最新计数，不触碰 store snapshot。 */
  private publishDiagnostics(): void {
    const diagnostics = this.readDiagnostics()
    for (const observer of this.diagnosticObservers) observer(diagnostics)
  }
}

type StoreReaderProps = Readonly<{
  generation: number
  readerId: ReaderId
  store: CourseExternalStore
}>

/** 用独立 Hook 调用点读取同一外部 store，并记录提交后的 Effect setup。 */
function StoreReader({ generation, readerId, store }: StoreReaderProps) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const readerLabel = readerLabels[readerId]

  /** 记录本 Reader 提交后执行的 Effect setup，不把它当作 render 次数。 */
  useEffect(() => {
    store.recordReaderEffectSetup(readerId, generation)
  })

  return (
    <article className="external-store-reader" data-testid={`${readerId}-reader`}>
      <span>
        {readerLabel} / 第 {generation} 代
      </span>
      <strong data-testid={`${readerId}-message`}>{snapshot.message}</strong>
      <dl>
        <div>
          <dt>revision</dt>
          <dd data-testid={`${readerId}-revision`}>{snapshot.revision}</dd>
        </div>
        <div>
          <dt>identity</dt>
          <dd data-testid={`${readerId}-identity`}>{snapshot.identity}</dd>
        </div>
      </dl>
    </article>
  )
}

type ReaderMountAreaProps = Readonly<{
  store: CourseExternalStore
}>

/** 管理两个真实 Reader 的卸载、重挂载与代次边界。 */
function ReaderMountArea({ store }: ReaderMountAreaProps) {
  const [readersMounted, setReadersMounted] = useState(true)
  const [generation, setGeneration] = useState(1)

  /** 卸载两个 Reader，或用新代次重新挂载它们。 */
  function handleToggleReaders(): void {
    if (readersMounted) {
      store.markReadersUnmounting()
      setReadersMounted(false)
      return
    }

    const nextGeneration = store.beginReaderGeneration()
    setGeneration(nextGeneration)
    setReadersMounted(true)
  }

  return (
    <section className="external-store-reader-area" aria-label="外部 store Reader">
      <div className="external-store-section-heading">
        <div>
          <span>Subscribed Readers</span>
          <h3>两个调用点读取同一份缓存快照</h3>
        </div>
        <button type="button" onClick={handleToggleReaders}>
          {readersMounted ? '卸载两个 Reader' : '重新挂载两个 Reader'}
        </button>
      </div>

      {readersMounted ? (
        <div className="external-store-readers" data-testid="reader-area">
          <StoreReader readerId="alpha" generation={generation} store={store} />
          <StoreReader readerId="beta" generation={generation} store={store} />
        </div>
      ) : (
        <p className="external-store-empty" data-testid="reader-area">
          Reader 已卸载；此时仍可发布新快照，旧 listener 不会响应。
        </p>
      )}
    </section>
  )
}

type StoreControlsProps = Readonly<{
  onRebuild: () => void
  onShellRender: () => void
  shellRevision: number
  store: CourseExternalStore
}>

/** 提供快照发布、同值通知、外壳 render 与完整重建命令。 */
function StoreControls({ onRebuild, onShellRender, shellRevision, store }: StoreControlsProps) {
  /** 发布一份引用不同的新快照。 */
  function handlePublishSnapshot(): void {
    store.publishNextSnapshot()
  }

  /** 只通知 Reader，继续复用当前快照引用。 */
  function handleNotifySameSnapshot(): void {
    store.notifySameSnapshot()
  }

  /** 更新实验外壳，让无关父级 render 经过两个 Reader，同时不改变 store 快照。 */
  function handleShellRender(): void {
    onShellRender()
  }

  return (
    <section className="external-store-controls" aria-label="快照实验控制">
      <div className="external-store-section-heading">
        <div>
          <span>Store Commands</span>
          <h3>通知 React 重新读取，再由 Object.is 判断</h3>
        </div>
        <strong data-testid="shell-revision">外壳 render：{shellRevision}</strong>
      </div>
      <div className="external-store-buttons">
        <button type="button" onClick={handlePublishSnapshot}>
          发布新快照
        </button>
        <button type="button" onClick={handleNotifySameSnapshot}>
          重复通知同一快照
        </button>
        <button type="button" onClick={handleShellRender}>
          只更新 Demo 外壳
        </button>
        <button type="button" className="is-quiet" onClick={onRebuild}>
          重建实验
        </button>
      </div>
    </section>
  )
}

type DiagnosticsPanelProps = Readonly<{
  store: CourseExternalStore
}>

/** 观察外部 store 的计数与引用结果，不参与 Reader 的快照决策。 */
function DiagnosticsPanel({ store }: DiagnosticsPanelProps) {
  const [diagnostics, setDiagnostics] = useState(() => store.readDiagnostics())

  /** 挂载只读诊断观察器，并在离开实验时移除。 */
  useEffect(() => store.observeDiagnostics(setDiagnostics), [store])

  const identityResult =
    diagnostics.lastIdentityEqual === null
      ? '尚未比较'
      : diagnostics.lastIdentityEqual
        ? 'Object.is = true'
        : 'Object.is = false'

  return (
    <section className="external-store-diagnostics" aria-label="外部 store 诊断账本">
      <div className="external-store-section-heading">
        <div>
          <span>Contract Ledger</span>
          <h3>快照身份、通知与清理账本</h3>
        </div>
        <strong data-testid="last-operation">{diagnostics.lastOperation}</strong>
      </div>

      <dl className="external-store-diagnostic-list">
        <div>
          <dt>当前快照</dt>
          <dd data-testid="snapshot-diagnostic">
            revision {diagnostics.snapshotRevision} / {diagnostics.snapshotIdentity}
          </dd>
        </div>
        <div>
          <dt>不可变检查</dt>
          <dd data-testid="snapshot-frozen">
            Object.isFrozen = {String(diagnostics.snapshotFrozen)}
          </dd>
        </div>
        <div>
          <dt>最近身份比较</dt>
          <dd data-testid="identity-result">{identityResult}</dd>
        </div>
        <div>
          <dt>active listener</dt>
          <dd data-testid="active-listeners">{diagnostics.activeListeners}</dd>
        </div>
        <div>
          <dt>subscribe / cleanup</dt>
          <dd data-testid="subscription-counts">
            {diagnostics.subscribeCount} / {diagnostics.cleanupCount}
          </dd>
        </div>
        <div>
          <dt>notify</dt>
          <dd data-testid="notify-count">{diagnostics.notifyCount}</dd>
        </div>
        <div>
          <dt>当前 Reader 代次</dt>
          <dd data-testid="reader-generation">{diagnostics.readerGeneration}</dd>
        </div>
        <div>
          <dt>Reader Effect setup</dt>
          <dd data-testid="reader-effect-setup-counts">
            A {diagnostics.readerEffectSetups.alpha} / B {diagnostics.readerEffectSetups.beta}
          </dd>
        </div>
        <div>
          <dt>外壳 render</dt>
          <dd data-testid="shell-render-count">{diagnostics.shellRenderCount}</dd>
        </div>
      </dl>
    </section>
  )
}

type ExternalStoreExperimentProps = Readonly<{
  onRebuild: () => void
}>

/** 为一轮实验创建独立 store，并组合控制、Reader 与诊断区域。 */
function ExternalStoreExperiment({ onRebuild }: ExternalStoreExperimentProps) {
  const [store] = useState(() => new CourseExternalStore())
  const [shellRevision, setShellRevision] = useState(0)

  /** 更新实验外壳，驱动两个 Reader 经历一次无关父级 render。 */
  function handleShellRender(): void {
    setShellRevision((revision) => revision + 1)
    store.recordShellRender()
  }

  return (
    <div className="external-store-experiment">
      <StoreControls
        shellRevision={shellRevision}
        store={store}
        onRebuild={onRebuild}
        onShellRender={handleShellRender}
      />
      <ReaderMountArea store={store} />
      <DiagnosticsPanel store={store} />
    </div>
  )
}

/** 展示稳定订阅、缓存快照、同值通知跳过与卸载清理合同。 */
export default function UseSyncExternalStoreSnapshotDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 更换实验 key，清空 store、listener、Reader 代次与全部账本。 */
  function rebuildExperiment(): void {
    setExperimentVersion((version) => version + 1)
  }

  return (
    <section className="use-sync-external-store-demo" data-testid="external-store-demo">
      <header className="external-store-heading">
        <p>Subscribe + Snapshot</p>
        <h2>通知只负责叫醒 React，快照身份决定是否更新</h2>
        <span>两个 Reader 直接订阅同一个页面内外部 store。</span>
      </header>
      <ExternalStoreExperiment key={experimentVersion} onRebuild={rebuildExperiment} />
    </section>
  )
}
