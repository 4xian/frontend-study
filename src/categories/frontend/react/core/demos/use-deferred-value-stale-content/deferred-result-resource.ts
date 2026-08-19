export type DeferredResult = Readonly<{
  id: string
  title: string
  summary: string
}>

export type DeferredResultResource = Readonly<{
  read: (query: string) => readonly DeferredResult[]
  release: (query: string) => void
  isReady: (query: string) => boolean
}>

type ResultGate = Readonly<{
  promise: Promise<void>
  resolve: () => void
}>

const resultCatalog: readonly DeferredResult[] = [
  {
    id: 'state-snapshot',
    title: 'React State 快照',
    summary: '区分事件读取的旧快照与下一次 render 使用的新 State。',
  },
  {
    id: 'hooks-rules',
    title: 'React Hooks 规则',
    summary: '在组件顶层稳定调用 Hook，并保持调用顺序一致。',
  },
  {
    id: 'suspense-boundary',
    title: 'Suspense fallback 边界',
    summary: '用最近边界协调挂起子树的 fallback 与内容显示。',
  },
  {
    id: 'effect-lifecycle',
    title: 'Effect 生命周期',
    summary: '把外部同步过程与组件的启动、更新和清理对应起来。',
  },
  {
    id: 'memo-rendering',
    title: 'memo 渲染优化',
    summary: '在已经测量到重复 render 时跳过未变化的子组件。',
  },
]

/** 把用户查询转换为稳定的本地匹配键。 */
function normalizeQuery(query: string): string {
  return query.trim().toLocaleLowerCase()
}

/** 从固定目录中计算当前查询对应的本地结果。 */
function findResults(query: string): readonly DeferredResult[] {
  const normalizedQuery = normalizeQuery(query)
  if (!normalizedQuery) return resultCatalog

  return resultCatalog.filter((result) =>
    `${result.title} ${result.summary}`.toLocaleLowerCase().includes(normalizedQuery),
  )
}

/** 创建一次可由界面显式推进的本地结果 gate。 */
function createResultGate(): ResultGate {
  let settlePromise!: () => void
  const promise = new Promise<void>((resolve) => {
    settlePromise = resolve
  })

  /** 兑现当前 gate，让挂起的结果 render 可以重试。 */
  function resolve(): void {
    settlePromise()
  }

  return { promise, resolve }
}

/** 创建仅属于一个实验实例的确定性结果资源。 */
export function createDeferredResultResource(initialQuery: string): DeferredResultResource {
  const readyQueries = new Set([normalizeQuery(initialQuery)])
  const pendingGates = new Map<string, ResultGate>()

  /** 读取已就绪结果；未就绪时用稳定 Promise 挂起当前 render。 */
  function read(query: string): readonly DeferredResult[] {
    const normalizedQuery = normalizeQuery(query)
    if (readyQueries.has(normalizedQuery)) return findResults(query)

    let gate = pendingGates.get(normalizedQuery)
    if (!gate) {
      gate = createResultGate()
      pendingGates.set(normalizedQuery, gate)
    }
    throw gate.promise
  }

  /** 标记目标查询已就绪，并推进已经创建的对应 gate。 */
  function release(query: string): void {
    const normalizedQuery = normalizeQuery(query)
    readyQueries.add(normalizedQuery)
    pendingGates.get(normalizedQuery)?.resolve()
    pendingGates.delete(normalizedQuery)
  }

  /** 查询目标是否已经可以同步读取。 */
  function isReady(query: string): boolean {
    return readyQueries.has(normalizeQuery(query))
  }

  return { read, release, isReady }
}
