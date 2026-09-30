import { create, type StateCreator } from 'zustand'
import { type ComponentType, useEffect, useRef, useState } from 'react'

import './content-workspace-demo.css'

type DocumentItem = {
  id: string
  title: string
  status: 'draft' | 'published'
}

type CatalogSlice = {
  items: DocumentItem[]
  addDraft: () => void
  publishItem: (id: string) => void
  archiveItem: (id: string) => void
}

type LoadSlice = {
  loading: boolean
  error: string | null
  requestId: number
  loadCatalog: (mode: 'ok' | 'fail' | 'stale') => Promise<void>
}

type FilterSlice = {
  filter: 'all' | 'draft' | 'published'
  setFilter: (filter: FilterSlice['filter']) => void
}

type SharedSlice = {
  ticks: number
  tick: () => void
}

type BoundStore = CatalogSlice & LoadSlice & FilterSlice & SharedSlice

const seedItems: DocumentItem[] = [
  { id: 'note', title: '课堂笔记', status: 'draft' },
  { id: 'guide', title: '发布说明', status: 'published' },
]

const staleItems: DocumentItem[] = [{ id: 'late', title: '迟到的目录', status: 'published' }]

/** 等待指定毫秒，用来模拟网络延迟。 */
function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/** 按模式返回目录、失败或迟到的成功。 */
async function fakeFetch(mode: 'ok' | 'fail' | 'stale'): Promise<DocumentItem[]> {
  await wait(mode === 'stale' ? 900 : 250)
  if (mode === 'fail') throw new Error('加载失败')
  return (mode === 'stale' ? staleItems : seedItems).map((item) => ({ ...item }))
}

const createCatalogSlice: StateCreator<BoundStore, [], [], CatalogSlice> = (set) => ({
  items: [],
  /** 用展开追加一篇草稿，不改原数组。 */
  addDraft: () =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id: `draft-${state.items.length + 1}`,
          title: '新增草稿',
          status: 'draft',
        },
      ],
    })),
  /** 复制目标条目并改成已发布。 */
  publishItem: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, status: 'published' } : item)),
    })),
  /** 用 filter 得到去掉指定条目的新数组。 */
  archiveItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
})

const createLoadSlice: StateCreator<BoundStore, [], [], LoadSlice> = (set, get) => ({
  loading: false,
  error: null,
  requestId: 0,
  /** 发出一次加载，并用 requestId 丢掉过期结果。 */
  loadCatalog: async (mode) => {
    const requestId = get().requestId + 1
    set({ requestId, loading: true, error: null })
    try {
      const items = await fakeFetch(mode)
      if (get().requestId !== requestId) return
      set({ items, loading: false, error: null })
    } catch (error) {
      if (get().requestId !== requestId) return
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      })
    }
  },
})

const createFilterSlice: StateCreator<BoundStore, [], [], FilterSlice> = (set) => ({
  filter: 'all',
  /** 只更新筛选条件。 */
  setFilter: (filter) => set({ filter }),
})

const createSharedSlice: StateCreator<BoundStore, [], [], SharedSlice> = (set, get) => ({
  ticks: 0,
  /** 增加与目录无关的计数。 */
  tick: () => set({ ticks: get().ticks + 1 }),
})

const useWorkspaceStore = create<BoundStore>()((...a) => ({
  ...createCatalogSlice(...a),
  ...createLoadSlice(...a),
  ...createFilterSlice(...a),
  ...createSharedSlice(...a),
}))

/** 只选择加载中标记。 */
function LoadingSubscriber() {
  const loading = useWorkspaceStore((state) => state.loading)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="workspace-panel" data-testid="loading-subscriber">
      <span>加载片段</span>
      <strong data-testid="workspace-loading">{loading ? '是' : '否'}</strong>
      <p>
        渲染次数 <b data-testid="loading-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择错误文案。 */
function ErrorSubscriber() {
  const error = useWorkspaceStore((state) => state.error)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="workspace-panel" data-testid="error-subscriber">
      <span>错误</span>
      <strong data-testid="workspace-error">{error ?? '无'}</strong>
      <p>
        渲染次数 <b data-testid="error-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择筛选条件。 */
function FilterSubscriber() {
  const filter = useWorkspaceStore((state) => state.filter)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="workspace-panel" data-testid="filter-subscriber">
      <span>筛选片段</span>
      <strong data-testid="workspace-filter">
        {filter === 'all' ? '全部' : filter === 'draft' ? '草稿' : '已发布'}
      </strong>
      <p>
        渲染次数 <b data-testid="filter-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择目录条数这个稳定数字。 */
function CatalogSubscriber() {
  const count = useWorkspaceStore((state) => state.items.length)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="workspace-panel" data-testid="catalog-subscriber">
      <span>目录条数</span>
      <strong data-testid="workspace-count">{count}</strong>
      <p>
        渲染次数 <b data-testid="catalog-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 先取出源字段，再在渲染时过滤可见条目。 */
function VisibleList() {
  const items = useWorkspaceStore((state) => state.items)
  const filter = useWorkspaceStore((state) => state.filter)
  const visible = filter === 'all' ? items : items.filter((item) => item.status === filter)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="workspace-panel workspace-list-panel" data-testid="visible-subscriber">
      <span>可见列表</span>
      <strong data-testid="workspace-visible-count">{visible.length}</strong>
      <p>
        渲染次数 <b data-testid="visible-render-count">{renderCount.current}</b>
      </p>
      {visible.length === 0 ? (
        <p data-testid="workspace-visible-empty">没有可见条目</p>
      ) : (
        <ul data-testid="workspace-visible">
          {visible.map((item) => (
            <li key={item.id} data-testid={`workspace-item-${item.id}`}>
              {item.title}
              {item.status === 'draft' ? ' · 草稿' : ' · 已发布'}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

/** 用默认 subscribe 记录整份 state 通知，不经过 Store Hook 选择字段。 */
function ActivityLog() {
  const [listening, setListening] = useState(true)
  const [lines, setLines] = useState<string[]>([])
  const renderCount = useRef(0)
  renderCount.current += 1

  useEffect(() => {
    if (!listening) {
      return
    }
    return useWorkspaceStore.subscribe((state, prevState) => {
      setLines((current) => [
        ...current,
        `${prevState.items.length}→${state.items.length} / ${prevState.filter}→${state.filter} / ${prevState.loading}→${state.loading}`,
      ])
    })
  }, [listening])

  return (
    <article className="workspace-panel workspace-log-panel" data-testid="log-subscriber">
      <span>外部订阅</span>
      <strong data-testid="subscribe-status">{listening ? '监听中' : '已停止'}</strong>
      <p>
        通知次数 <b data-testid="subscribe-event-count">{lines.length}</b>
      </p>
      <pre data-testid="workspace-log">{lines.join('\n') || '空'}</pre>
      <p>
        渲染次数 <b data-testid="log-render-count">{renderCount.current}</b>
      </p>
      <div className="workspace-log-actions">
        <button type="button" onClick={() => setListening(true)} disabled={listening}>
          开始订阅
        </button>
        <button type="button" onClick={() => setListening(false)} disabled={!listening}>
          停止订阅
        </button>
      </div>
    </article>
  )
}

/** 只选择加载成功的 Action。 */
function LoadOkButton() {
  const loadCatalog = useWorkspaceStore((state) => state.loadCatalog)

  return (
    <button type="button" onClick={() => void loadCatalog('ok')}>
      加载目录
    </button>
  )
}

/** 只选择加载失败的 Action。 */
function LoadFailButton() {
  const loadCatalog = useWorkspaceStore((state) => state.loadCatalog)

  return (
    <button type="button" onClick={() => void loadCatalog('fail')}>
      模拟失败
    </button>
  )
}

/** 只选择发出慢请求的 Action。 */
function LoadStaleButton() {
  const loadCatalog = useWorkspaceStore((state) => state.loadCatalog)

  return (
    <button type="button" onClick={() => void loadCatalog('stale')}>
      发出慢请求
    </button>
  )
}

/** 只选择追加草稿的 Action。 */
function AddDraftButton() {
  const addDraft = useWorkspaceStore((state) => state.addDraft)

  return (
    <button type="button" onClick={addDraft}>
      追加草稿
    </button>
  )
}

/** 只选择发布指定条目的 Action。 */
function PublishButton() {
  const publishItem = useWorkspaceStore((state) => state.publishItem)

  return (
    <button type="button" onClick={() => publishItem('note')}>
      发布课堂笔记
    </button>
  )
}

/** 只选择归档指定条目的 Action。 */
function ArchiveButton() {
  const archiveItem = useWorkspaceStore((state) => state.archiveItem)

  return (
    <button type="button" onClick={() => archiveItem('note')}>
      归档课堂笔记
    </button>
  )
}

/** 只选择写入草稿筛选的 Action。 */
function DraftFilterButton() {
  const setFilter = useWorkspaceStore((state) => state.setFilter)

  return (
    <button type="button" onClick={() => setFilter('draft')}>
      只看草稿
    </button>
  )
}

/** 只选择写入已发布筛选的 Action。 */
function PublishedFilterButton() {
  const setFilter = useWorkspaceStore((state) => state.setFilter)

  return (
    <button type="button" onClick={() => setFilter('published')}>
      只看已发布
    </button>
  )
}

/** 只选择恢复全部筛选的 Action。 */
function AllFilterButton() {
  const setFilter = useWorkspaceStore((state) => state.setFilter)

  return (
    <button type="button" onClick={() => setFilter('all')}>
      查看全部
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useWorkspaceStore((state) => state.ticks)

  return (
    <p className="workspace-ticks" aria-live="polite">
      无关计数 <strong data-testid="workspace-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示切片合并、异步加载、不可变列表、派生筛选和外部订阅。 */
function ContentWorkspaceDemo() {
  const tick = useWorkspaceStore((state) => state.tick)

  return (
    <section className="workspace-demo" data-testid="content-workspace-demo">
      <header className="workspace-heading">
        <p>Zustand workspace</p>
        <h2>一份 Store 拆成片段，加载目录后再筛选和改条目</h2>
        <span>
          加载成功后能看到课堂笔记和发布说明；先发慢请求再失败时，迟到的目录不会覆盖错误。筛选只改展示，追加和归档都换新数组。
        </span>
      </header>

      <TicksDisplay />

      <div className="workspace-panels">
        <LoadingSubscriber />
        <ErrorSubscriber />
        <FilterSubscriber />
        <CatalogSubscriber />
        <VisibleList />
        <ActivityLog />
      </div>

      <div className="workspace-actions">
        <LoadOkButton />
        <LoadFailButton />
        <LoadStaleButton />
        <DraftFilterButton />
        <PublishedFilterButton />
        <AllFilterButton />
        <AddDraftButton />
        <PublishButton />
        <ArchiveButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供内容管理工作区观察组件。 */
export function createContentWorkspaceDemo(): ComponentType {
  return ContentWorkspaceDemo
}
