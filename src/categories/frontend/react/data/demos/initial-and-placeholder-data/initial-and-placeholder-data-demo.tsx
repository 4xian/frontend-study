import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react'

import './initial-and-placeholder-data-demo.css'

type LessonTask = {
  id: string
  title: string
  owner: string
  detail: string
}

type SeedMode = 'initial' | 'placeholder' | 'keep'

type OwnerId = 'lin' | 'zhou'

type SeedQueryKey = readonly ['tasks', 'seed', SeedMode, number, OwnerId]

const previewTasks: LessonTask[] = [
  {
    id: 't-701',
    title: '核对初始标题',
    owner: '林晓',
    detail: '列表预览，不是完整数据',
  },
]

const fullTasks: LessonTask[] = [
  {
    id: 't-701',
    title: '核对初始标题',
    owner: '林晓',
    detail: '完整说明：初始数据会写入 Query 缓存。',
  },
  {
    id: 't-702',
    title: '区分占位画面',
    owner: '周宁',
    detail: '完整说明：占位数据不会写入缓存。',
  },
]

const linTasks: LessonTask[] = [fullTasks[0]!]
const zhouTasks: LessonTask[] = [fullTasks[1]!]

const fullTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullTasks))}`
const linTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(linTasks))}`
const zhouTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(zhouTasks))}`

const modeLabels: Record<SeedMode, string> = {
  initial: '初始数据',
  placeholder: '占位数据',
  keep: '保留上一份',
}

const ownerLabels: Record<OwnerId, string> = {
  lin: '林晓',
  zhou: '周宁',
}

/** 等待固定时长，让种子数据和真实请求的差别能被看清。 */
function waitForSeed(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 按当前模式读取完整任务；保留上一份时只返回对应负责人。 */
async function loadSeedTasks(mode: SeedMode, owner: OwnerId): Promise<LessonTask[]> {
  await waitForSeed(1400)
  const url = mode === 'keep' ? (owner === 'lin' ? linTasksUrl : zhouTasksUrl) : fullTasksUrl
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as LessonTask[]
}

/** 把身份、请求和种子选项收进同一份配置。 */
function seedOptions(queryKey: SeedQueryKey, mode: SeedMode, queryFn: () => Promise<LessonTask[]>) {
  if (mode === 'initial') {
    return queryOptions({
      queryKey,
      queryFn,
      retry: false,
      initialData: previewTasks,
    })
  }

  if (mode === 'placeholder') {
    return queryOptions({
      queryKey,
      queryFn,
      retry: false,
      placeholderData: previewTasks,
    })
  }

  return queryOptions({
    queryKey,
    queryFn,
    retry: false,
    placeholderData: keepPreviousData,
  })
}

/** 把毫秒时间戳收成短文本，占位期间会一直是 0。 */
function formatUpdatedAt(dataUpdatedAt: number): string {
  return dataUpdatedAt === 0 ? '0' : String(dataUpdatedAt)
}

/** 开始后才挂上 useQuery，避免未观察时就把 initialData 写进缓存。 */
function SeedObservedBoard({
  queryKey,
  mode,
  owner,
  requestCount,
  queryFn,
  renderActions,
}: {
  queryKey: SeedQueryKey
  mode: SeedMode
  owner: OwnerId
  requestCount: number
  queryFn: () => Promise<LessonTask[]>
  renderActions: (isFetching: boolean) => ReactNode
}): ReactElement {
  const queryClient = useQueryClient()
  const observer = useQuery(seedOptions(queryKey, mode, queryFn))
  const cacheState = queryClient.getQueryState<LessonTask[]>(queryKey)
  const cacheHasData = cacheState?.data !== undefined
  const observerTasks = observer.data ?? []

  return (
    <>
      <div className="initial-placeholder-metrics" aria-live="polite">
        <div>
          <span>模式</span>
          <strong data-testid="initial-placeholder-mode">{modeLabels[mode]}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="initial-placeholder-count">{requestCount}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="initial-placeholder-status">{observer.status}</strong>
        </div>
        <div>
          <span>isPlaceholderData</span>
          <strong data-testid="initial-placeholder-is-placeholder">
            {String(observer.isPlaceholderData)}
          </strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong data-testid="initial-placeholder-fetching">{String(observer.isFetching)}</strong>
        </div>
        <div>
          <span>缓存 data</span>
          <strong data-testid="initial-placeholder-cache-data">{cacheHasData ? '有' : '无'}</strong>
        </div>
        <div>
          <span>dataUpdatedAt</span>
          <strong data-testid="initial-placeholder-updated-at">
            {formatUpdatedAt(observer.dataUpdatedAt)}
          </strong>
        </div>
        <div>
          <span>当前 queryKey</span>
          <strong data-testid="initial-placeholder-owner">{ownerLabels[owner]}</strong>
        </div>
      </div>

      {renderActions(observer.isFetching)}

      <div className="initial-placeholder-columns">
        <section className="initial-placeholder-card">
          <h3>当前观察</h3>
          {mode === 'initial' && observer.isFetching && (
            <p className="initial-placeholder-message" role="status">
              初始数据已经写入缓存，所以一开始就是
              success。默认把它当成刚刚成功的数据，会立刻再请求。
            </p>
          )}
          {mode === 'placeholder' && observer.isPlaceholderData && (
            <p className="initial-placeholder-message" role="status">
              观察者在用占位数据，status 是 success，但缓存里还没有这份数据，dataUpdatedAt 为 0。
            </p>
          )}
          {mode === 'keep' && observer.isPlaceholderData && (
            <p className="initial-placeholder-message" role="status">
              queryKey 已换成{ownerLabels[owner]}
              ，仍显示上一份成功数据。这是观察者占位，不是新缓存。
            </p>
          )}
          {mode === 'keep' && !observer.isPlaceholderData && observer.isFetching && (
            <p className="initial-placeholder-message" role="status">
              正在读取{ownerLabels[owner]}的任务。还没有上一份成功数据时，不会出现占位。
            </p>
          )}
          {observer.isSuccess && !observer.isFetching && !observer.isPlaceholderData && (
            <p className="initial-placeholder-message" role="status">
              真实请求已经写进缓存。可以重置后再换一种种子方式，或在“保留上一份”里切换负责人。
            </p>
          )}
        </section>
        <section className="initial-placeholder-card" data-testid="initial-placeholder-tasks">
          <h3>观察者看到的任务</h3>
          {observerTasks.length === 0 && (
            <p className="initial-placeholder-message" role="status">
              观察者还没有可显示的数据。
            </p>
          )}
          {observerTasks.length > 0 && (
            <ul data-testid="initial-placeholder-task-list">
              {observerTasks.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner} / {task.detail}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

/** 对比初始数据、占位数据和切换 queryKey 时保留上一份。 */
function InitialPlaceholderPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<SeedMode>('initial')
  const [owner, setOwner] = useState<OwnerId>('lin')
  const [started, setStarted] = useState(false)
  const [revision, setRevision] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const queryKey = useMemo(
    (): SeedQueryKey => ['tasks', 'seed', mode, revision, owner],
    [mode, revision, owner],
  )

  /** 统计每次真实请求，避免在渲染期间同步更新次数。 */
  const loadObservedTasks = useCallback(async () => {
    queueMicrotask(() => {
      setRequestCount((count) => count + 1)
    })
    return loadSeedTasks(mode, owner)
  }, [mode, owner])

  /** 换种子方式时清掉当前查询，避免旧缓存干扰对比。 */
  function selectMode(nextMode: SeedMode): void {
    setMode(nextMode)
    setOwner('lin')
    setStarted(false)
    setRequestCount(0)
    setRevision((current) => current + 1)
    queryClient.clear()
  }

  /** 开始观察当前模式；保留上一份时已开始则只切换负责人。 */
  function startOrSwitchOwner(nextOwner: OwnerId): void {
    if (mode === 'keep' && started) {
      setOwner(nextOwner)
      return
    }
    setOwner(nextOwner)
    setStarted(true)
  }

  /** 换一份查询身份，清掉当前缓存记录，保留这次选择的模式。 */
  function resetQuery(): void {
    setStarted(false)
    setOwner('lin')
    setRequestCount(0)
    setRevision((current) => current + 1)
    queryClient.clear()
  }

  /** 按当前是否正在请求禁用按钮，避免父组件再订阅整份缓存。 */
  function renderActions(isFetching: boolean): ReactNode {
    return (
      <div className="initial-placeholder-actions">
        <button
          type="button"
          aria-pressed={mode === 'initial'}
          disabled={isFetching}
          onClick={() => selectMode('initial')}
        >
          初始数据
        </button>
        <button
          type="button"
          aria-pressed={mode === 'placeholder'}
          disabled={isFetching}
          onClick={() => selectMode('placeholder')}
        >
          占位数据
        </button>
        <button
          type="button"
          aria-pressed={mode === 'keep'}
          disabled={isFetching}
          onClick={() => selectMode('keep')}
        >
          保留上一份
        </button>
        {mode !== 'keep' && (
          <button
            type="button"
            data-kind="primary"
            disabled={isFetching || started}
            onClick={() => startOrSwitchOwner('lin')}
          >
            开始观察
          </button>
        )}
        {mode === 'keep' && (
          <>
            <button
              type="button"
              data-kind="primary"
              aria-pressed={started && owner === 'lin'}
              disabled={isFetching}
              onClick={() => startOrSwitchOwner('lin')}
            >
              看林晓
            </button>
            <button
              type="button"
              data-kind="primary"
              aria-pressed={started && owner === 'zhou'}
              disabled={isFetching || !started}
              onClick={() => startOrSwitchOwner('zhou')}
            >
              看周宁
            </button>
          </>
        )}
        <button type="button" disabled={isFetching} onClick={resetQuery}>
          重置
        </button>
      </div>
    )
  }

  return (
    <section className="initial-placeholder-demo" data-testid="initial-placeholder-demo">
      <header className="initial-placeholder-header">
        <span>TanStack Query</span>
        <h2>初始数据与占位数据</h2>
        <p>
          同一份列表预览，分别写成 initialData 和 placeholderData。请求约 1.4
          秒。对比缓存有没有被写入，以及切换林晓、周宁时能不能留下上一份画面。
        </p>
      </header>

      {!started && (
        <>
          <div className="initial-placeholder-metrics" aria-live="polite">
            <div>
              <span>模式</span>
              <strong data-testid="initial-placeholder-mode">{modeLabels[mode]}</strong>
            </div>
            <div>
              <span>请求次数</span>
              <strong data-testid="initial-placeholder-count">{requestCount}</strong>
            </div>
            <div>
              <span>status</span>
              <strong data-testid="initial-placeholder-status">无</strong>
            </div>
            <div>
              <span>isPlaceholderData</span>
              <strong data-testid="initial-placeholder-is-placeholder">false</strong>
            </div>
            <div>
              <span>isFetching</span>
              <strong data-testid="initial-placeholder-fetching">false</strong>
            </div>
            <div>
              <span>缓存 data</span>
              <strong data-testid="initial-placeholder-cache-data">无</strong>
            </div>
            <div>
              <span>dataUpdatedAt</span>
              <strong data-testid="initial-placeholder-updated-at">0</strong>
            </div>
            <div>
              <span>当前 queryKey</span>
              <strong data-testid="initial-placeholder-owner">{ownerLabels[owner]}</strong>
            </div>
          </div>
          {renderActions(false)}
          <div className="initial-placeholder-columns">
            <section className="initial-placeholder-card">
              <h3>当前观察</h3>
              <p className="initial-placeholder-message" role="status">
                查询尚未开始。先选种子方式，再开始观察。占位和初始都会先画出林晓的预览标题。
              </p>
            </section>
          </div>
        </>
      )}

      {started && (
        <SeedObservedBoard
          queryKey={queryKey}
          mode={mode}
          owner={owner}
          requestCount={requestCount}
          queryFn={loadObservedTasks}
          renderActions={renderActions}
        />
      )}
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function InitialPlaceholderDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <InitialPlaceholderPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册初始数据与占位数据 Demo。 */
export function createInitialAndPlaceholderDataDemo(): ComponentType {
  return InitialPlaceholderDemoRoot
}
