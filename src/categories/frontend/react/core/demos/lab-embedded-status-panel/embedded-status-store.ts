export type PanelStatus = 'healthy' | 'attention' | 'critical'

export type PanelSnapshot = Readonly<{
  revision: number
  status: PanelStatus
  activeServices: number
  label: string
  message: string
}>

export type StoreDiagnostics = Readonly<{
  activeListeners: number
  cleanupCount: number
  publishCount: number
  snapshot: PanelSnapshot
  subscribeCount: number
}>

type DiagnosticObserver = (diagnostics: StoreDiagnostics) => void

const panelStates = [
  {
    status: 'healthy',
    activeServices: 3,
    label: '运行正常',
    message: '三个核心服务均在目标范围内。',
  },
  {
    status: 'attention',
    activeServices: 2,
    label: '需要关注',
    message: '同步服务等待宿主确认。',
  },
  {
    status: 'critical',
    activeServices: 1,
    label: '需要处理',
    message: '处理队列已暂停，请检查运行状态。',
  },
] as const

/** 按单调 revision 创建当前循环状态对应的新冻结快照。 */
function createPanelSnapshot(revision: number): PanelSnapshot {
  const state = panelStates[revision % panelStates.length]!
  return Object.freeze({ revision, ...state })
}

const initialPanelSnapshot = createPanelSnapshot(0)

/** 保存宿主拥有的状态快照、React listeners 与只读诊断计数。 */
export class EmbeddedStatusStore {
  private snapshot = initialPanelSnapshot
  private readonly listeners = new Set<() => void>()
  private readonly observers = new Set<DiagnosticObserver>()
  private subscribeCount = 0
  private cleanupCount = 0
  private publishCount = 0

  /** 返回当前缓存快照；同一 revision 始终复用同一对象。 */
  readonly getSnapshot = (): PanelSnapshot => this.snapshot

  /** 返回静态宿主页对应的首份快照，供 hydration 首次读取。 */
  readonly getServerSnapshot = (): PanelSnapshot => initialPanelSnapshot

  /** 注册 React 的失效通知，并返回对称的订阅清理函数。 */
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    this.subscribeCount += 1
    this.publishDiagnostics()

    /** 删除当前 listener，并发布最新清理计数。 */
    return () => {
      if (!this.listeners.delete(listener)) return
      this.cleanupCount += 1
      this.publishDiagnostics()
    }
  }

  /** 发布循环中的下一份不可变快照，再通知全部 React Reader。 */
  publishNext(): void {
    this.snapshot = createPanelSnapshot(this.snapshot.revision + 1)
    this.publishCount += 1
    for (const listener of this.listeners) listener()
    this.publishDiagnostics()
  }

  /** 返回不参与业务快照比较的宿主诊断账本。 */
  readDiagnostics(): StoreDiagnostics {
    return Object.freeze({
      activeListeners: this.listeners.size,
      cleanupCount: this.cleanupCount,
      publishCount: this.publishCount,
      snapshot: this.snapshot,
      subscribeCount: this.subscribeCount,
    })
  }

  /** 订阅宿主诊断变化，并立即提供当前账本。 */
  observe(observer: DiagnosticObserver): () => void {
    this.observers.add(observer)
    observer(this.readDiagnostics())

    /** 停止向当前宿主观察器发布诊断。 */
    return () => {
      this.observers.delete(observer)
    }
  }

  /** 向全部宿主观察器发送最新诊断，不触发 Store Reader。 */
  private publishDiagnostics(): void {
    const diagnostics = this.readDiagnostics()
    for (const observer of this.observers) observer(diagnostics)
  }
}

/** 为每个独立宿主 Document 创建一份新的外部 Store。 */
export function createEmbeddedStatusStore(): EmbeddedStatusStore {
  return new EmbeddedStatusStore()
}
