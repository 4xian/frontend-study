export type SearchRecord = Readonly<{
  id: string
  title: string
  summary: string
  tags: readonly string[]
}>

type SearchGate = Readonly<{
  promise: Promise<readonly SearchRecord[]>
  resolve: (records: readonly SearchRecord[]) => void
  records: readonly SearchRecord[]
}>

type DetailGate = Readonly<{
  promise: Promise<void>
  resolve: () => void
}>

const searchCatalog: readonly SearchRecord[] = [
  {
    id: 'render-priority',
    title: '渲染优先级与可中断更新',
    summary: '让紧急输入先提交，把较重的结果视图交给 Transition 准备。',
    tags: ['Transition', 'render'],
  },
  {
    id: 'deferred-query',
    title: 'deferred 值与陈旧结果',
    summary: '输入保持最新，结果区可以暂时读取旧查询并明确标记 stale。',
    tags: ['useDeferredValue', 'stale'],
  },
  {
    id: 'suspense-reveal',
    title: 'Suspense 边界与渐进显示',
    summary: 'render 期间读取未完成资源时，由最近边界显示等待内容。',
    tags: ['Suspense', 'fallback'],
  },
  {
    id: 'activity-workspace',
    title: 'Activity 隐藏工作区',
    summary: '隐藏时清理 Effect，恢复时保留 State、未受控草稿和 DOM 身份。',
    tags: ['Activity', 'state'],
  },
  {
    id: 'resource-identity',
    title: '异步资源身份',
    summary: '用稳定的查询请求身份复用 Promise，避免 render 中反复创建异步任务。',
    tags: ['Promise', 'identity'],
  },
]

const searchRecordsById = new Map(searchCatalog.map((record) => [record.id, record]))

/** 按稳定 ID 返回搜索目录中的同一条记录。 */
export function getSearchRecord(recordId: string): SearchRecord | undefined {
  return searchRecordsById.get(recordId)
}

const searchGates = new Map<string, SearchGate>()
const detailGates = new Map<string, DetailGate>()

/** 根据固定目录计算一次查询的结果集合。 */
function findSearchRecords(query: string): readonly SearchRecord[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return searchCatalog

  return searchCatalog.filter((record) =>
    `${record.title} ${record.summary} ${record.tags.join(' ')}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  )
}

/** 创建一次由按钮显式放行的搜索资源。 */
function createSearchGate(query: string): SearchGate {
  let resolvePromise!: (records: readonly SearchRecord[]) => void
  const records = findSearchRecords(query)
  const promise = new Promise<readonly SearchRecord[]>((resolve) => {
    resolvePromise = resolve
  })

  return {
    promise,
    records,
    resolve: resolvePromise,
  }
}

/** 返回查询请求对应的稳定 Promise；同一请求身份只创建一次。 */
export function prepareSearchResource(
  requestId: string,
  query: string,
): Promise<readonly SearchRecord[]> {
  const existing = searchGates.get(requestId)
  if (existing) return existing.promise

  const gate = createSearchGate(query)
  searchGates.set(requestId, gate)
  return gate.promise
}

/** 读取已经登记的搜索 Promise，供 render 阶段的 use 调用。 */
export function getSearchPromise(requestId: string): Promise<readonly SearchRecord[]> {
  const gate = searchGates.get(requestId)
  if (!gate) throw new Error('搜索资源尚未登记')
  return gate.promise
}

/** 兑现指定搜索请求，让 Suspense 重试对应的结果子树。 */
export function resolveSearchResource(requestId: string): void {
  const gate = searchGates.get(requestId)
  if (!gate) return
  gate.resolve(gate.records)
}

/** 创建一次由按钮显式放行的详情选择 Transition。 */
export function prepareDetailTransition(transitionId: string): Promise<void> {
  const existing = detailGates.get(transitionId)
  if (existing) return existing.promise

  let resolvePromise!: () => void
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve
  })
  detailGates.set(transitionId, { promise, resolve: resolvePromise })
  return promise
}

/** 兑现指定详情 Transition 的 gate。 */
export function resolveDetailTransition(transitionId: string): void {
  detailGates.get(transitionId)?.resolve()
}

/** 清空当前实验的异步资源，供冷启动重建使用。 */
export function resetConcurrentSearchResources(): void {
  for (const gate of detailGates.values()) gate.resolve()
  searchGates.clear()
  detailGates.clear()
}
