import { createStore, useStore } from 'zustand'
import {
  type ComponentType,
  type ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'

import './context-scope-demo.css'

type WorkspaceStore = {
  name: string
  theme: string
  draft: number
  ticks: number
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

type WorkspaceApi = ReturnType<typeof createWorkspaceStore>

const WorkspaceContext = createContext<WorkspaceApi | null>(null)

/** 按名称创建一份不带 Hook 的工作区 StoreApi。 */
function createWorkspaceStore(name: string) {
  return createStore<WorkspaceStore>()((set, get) => ({
    name,
    theme: '浅色',
    draft: 0,
    ticks: 0,
    /** 在浅色和深色之间切换主题。 */
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    /** 增加草稿计数。 */
    bumpDraft: () => set({ draft: get().draft + 1 }),
    /** 增加与主题、草稿无关的计数。 */
    tick: () => set({ ticks: get().ticks + 1 }),
  }))
}

/** 用 useState 留下同一份 api，再注入当前子树。 */
function WorkspaceProvider({ name, children }: { name: string; children: ReactNode }) {
  const [store] = useState(() => createWorkspaceStore(name))
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>
}

/** 取出当前子树的 api；没有 Provider 时返回 null。 */
function useWorkspaceApi() {
  return useContext(WorkspaceContext)
}

/** 先取出 api，再按选择函数订阅；没有 Provider 时抛错。 */
function useWorkspaceStore<T>(selector: (state: WorkspaceStore) => T): T {
  const store = useWorkspaceApi()
  if (!store) {
    throw new Error('缺少 WorkspaceContext.Provider')
  }
  return useStore(store, selector)
}

/** 用 useStore 只选择主题。 */
function ThemeSubscriber({ testId }: { testId: string }) {
  const theme = useWorkspaceStore((state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="context-panel" data-testid={`${testId}-theme-subscriber`}>
      <span>useStore 主题</span>
      <strong data-testid={`${testId}-theme`}>{theme}</strong>
      <p>
        渲染次数 <b data-testid={`${testId}-theme-render-count`}>{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 用 useStore 只选择草稿计数。 */
function DraftSubscriber({ testId }: { testId: string }) {
  const draft = useWorkspaceStore((state) => state.draft)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="context-panel" data-testid={`${testId}-draft-subscriber`}>
      <span>useStore 草稿</span>
      <strong data-testid={`${testId}-draft`}>{draft}</strong>
      <p>
        渲染次数 <b data-testid={`${testId}-draft-render-count`}>{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay({ testId }: { testId: string }) {
  const ticks = useWorkspaceStore((state) => state.ticks)

  return (
    <p className="context-ticks" aria-live="polite">
      无关计数 <strong data-testid={`${testId}-ticks`}>{ticks}</strong>
    </p>
  )
}

/** 从当前子树的 api 取出切换主题 Action。 */
function ThemeButton() {
  const store = useWorkspaceApi()
  if (!store) {
    return null
  }
  return (
    <button type="button" onClick={() => store.getState().toggleTheme()}>
      切换主题
    </button>
  )
}

/** 从当前子树的 api 取出增加草稿 Action。 */
function DraftButton() {
  const store = useWorkspaceApi()
  if (!store) {
    return null
  }
  return (
    <button type="button" onClick={() => store.getState().bumpDraft()}>
      增加草稿
    </button>
  )
}

/** 增加与主题、草稿无关的计数。 */
function TickButton() {
  const store = useWorkspaceApi()
  if (!store) {
    return null
  }
  return (
    <button type="button" onClick={() => store.getState().tick()}>
      增加无关计数
    </button>
  )
}

/** 展示一份被 Context 注入的工作区。 */
function WorkspacePane({ testId }: { testId: string }) {
  const name = useWorkspaceStore((state) => state.name)

  return (
    <section className="context-pane" data-testid={`${testId}-workspace`}>
      <h3>{name}</h3>
      <TicksDisplay testId={testId} />
      <div className="context-panels">
        <ThemeSubscriber testId={testId} />
        <DraftSubscriber testId={testId} />
      </div>
      <div className="context-actions">
        <ThemeButton />
        <DraftButton />
        <TickButton />
      </div>
    </section>
  )
}

/** 只调用 useContext，缺少 Provider 时不调用 useStore。 */
function MissingProviderProbe() {
  const store = useWorkspaceApi()

  return (
    <p className="context-probe" data-testid="missing-provider">
      树外探测{' '}
      <strong data-testid="missing-provider-status">{store ? '已注入' : '缺少 Provider'}</strong>
    </p>
  )
}

/** 展示两份 Context 作用域互不影响，树外不能订阅。 */
function ContextScopeDemo() {
  return (
    <section className="context-demo" data-testid="context-scope-demo">
      <header className="context-heading">
        <p>Zustand context scope</p>
        <h2>Provider 注入 StoreApi，useStore 仍按字段订阅</h2>
        <span>
          左右各一份 Provider。切换左侧主题不会改右侧。树外探测只显示缺少 Provider，不会调用
          useStore。
        </span>
      </header>

      <MissingProviderProbe />

      <div className="context-panes">
        <WorkspaceProvider name="左侧工作区">
          <WorkspacePane testId="left" />
        </WorkspaceProvider>
        <WorkspaceProvider name="右侧工作区">
          <WorkspacePane testId="right" />
        </WorkspaceProvider>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Context 作用域观察组件。 */
export function createContextScopeDemo(): ComponentType {
  return ContextScopeDemo
}
