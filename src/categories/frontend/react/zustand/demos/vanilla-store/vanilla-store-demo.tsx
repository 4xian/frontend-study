import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { type ComponentType, useEffect, useRef, useState } from 'react'

import './vanilla-store-demo.css'

type WorkspaceStore = {
  theme: string
  draft: number
  ticks: number
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
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

/** 用 useStore 只选择主题。 */
function ThemeSubscriber() {
  const theme = useStore(workspaceStore, (state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="vanilla-panel" data-testid="theme-subscriber">
      <span>useStore 主题</span>
      <strong data-testid="vanilla-theme">{theme}</strong>
      <p>
        渲染次数 <b data-testid="theme-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 用 useStore 只选择草稿计数。 */
function DraftSubscriber() {
  const draft = useStore(workspaceStore, (state) => state.draft)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="vanilla-panel" data-testid="draft-subscriber">
      <span>useStore 草稿</span>
      <strong data-testid="vanilla-draft">{draft}</strong>
      <p>
        渲染次数 <b data-testid="draft-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只在点击时调用 getState，展示一次性快照不会自动跟上后续写入。 */
function SnapshotPanel() {
  const [theme, setTheme] = useState(() => workspaceStore.getState().theme)
  const [draft, setDraft] = useState(() => workspaceStore.getState().draft)
  const renderCount = useRef(0)
  renderCount.current += 1

  /** 把当前 StoreApi 快照抄进组件本地 State。 */
  function readSnapshot() {
    const snapshot = workspaceStore.getState()
    setTheme(snapshot.theme)
    setDraft(snapshot.draft)
  }

  return (
    <article className="vanilla-panel" data-testid="snapshot-subscriber">
      <span>getState 快照</span>
      <strong data-testid="vanilla-snapshot">
        {theme} / {draft}
      </strong>
      <p>
        渲染次数 <b data-testid="snapshot-render-count">{renderCount.current}</b>
      </p>
      <button type="button" onClick={readSnapshot}>
        读取快照
      </button>
    </article>
  )
}

/** 用 StoreApi.subscribe 记录整份更新，不经过 useStore。 */
function ActivityLog() {
  const [listening, setListening] = useState(true)
  const [lines, setLines] = useState<string[]>([])
  const renderCount = useRef(0)
  renderCount.current += 1

  useEffect(() => {
    if (!listening) {
      return
    }
    return workspaceStore.subscribe((state, prevState) => {
      setLines((current) => [
        ...current,
        `${prevState.theme}→${state.theme} / ${prevState.draft}→${state.draft} / ${prevState.ticks}→${state.ticks}`,
      ])
    })
  }, [listening])

  return (
    <article className="vanilla-panel vanilla-log-panel" data-testid="log-subscriber">
      <span>外部订阅</span>
      <strong data-testid="subscribe-status">{listening ? '监听中' : '已停止'}</strong>
      <p>
        通知次数 <b data-testid="subscribe-event-count">{lines.length}</b>
      </p>
      <pre data-testid="vanilla-log">{lines.join('\n') || '空'}</pre>
      <p>
        渲染次数 <b data-testid="log-render-count">{renderCount.current}</b>
      </p>
      <div className="vanilla-log-actions">
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

/** 从 StoreApi 取出切换主题 Action，不经过 useStore。 */
function ThemeButton() {
  return (
    <button type="button" onClick={() => workspaceStore.getState().toggleTheme()}>
      切换主题
    </button>
  )
}

/** 从 StoreApi 取出增加草稿 Action。 */
function DraftButton() {
  return (
    <button type="button" onClick={() => workspaceStore.getState().bumpDraft()}>
      增加草稿
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useStore(workspaceStore, (state) => state.ticks)

  return (
    <p className="vanilla-ticks" aria-live="polite">
      无关计数 <strong data-testid="vanilla-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示 createStore 得到 StoreApi，useStore 才驱动渲染，getState 只读快照。 */
function VanillaStoreDemo() {
  return (
    <section className="vanilla-demo" data-testid="vanilla-store-demo">
      <header className="vanilla-heading">
        <p>Zustand vanilla store</p>
        <h2>createStore 留下对象 API，组件再用 useStore 订阅</h2>
        <span>
          切换主题走 getState().toggleTheme()。useStore 面板会更新，getState
          快照要再点一次才会跟上。增加无关计数时主题和草稿面板不重渲染，日志仍会多一条。
        </span>
      </header>

      <TicksDisplay />

      <div className="vanilla-panels">
        <ThemeSubscriber />
        <DraftSubscriber />
        <SnapshotPanel />
        <ActivityLog />
      </div>

      <div className="vanilla-actions">
        <ThemeButton />
        <DraftButton />
        <button type="button" onClick={() => workspaceStore.getState().tick()}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Vanilla Store 观察组件。 */
export function createVanillaStoreDemo(): ComponentType {
  return VanillaStoreDemo
}
