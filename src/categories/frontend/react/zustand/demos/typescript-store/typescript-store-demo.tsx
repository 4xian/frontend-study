import { create } from 'zustand'
import { type ComponentType } from 'react'

import './typescript-store-demo.css'

type NoteState = {
  title: string
  pinned: boolean
}

type NoteActions = {
  rename: (title: string) => void
  togglePinned: () => void
  reset: () => void
}

type NoteStore = NoteState & NoteActions

const initialNoteState: NoteState = {
  title: '课堂笔记',
  pinned: false,
}

const useNoteStore = create<NoteStore>()((set) => ({
  ...initialNoteState,
  /** 按字符串类型写入笔记标题。 */
  rename: (title) => set({ title }),
  /** 切换置顶标记。 */
  togglePinned: () => set((state) => ({ pinned: !state.pinned })),
  /** 恢复演示用的初始笔记数据。 */
  reset: () => set(initialNoteState),
}))

/** 只选择标题，展示类型化字段读取。 */
function TitlePanel() {
  const title = useNoteStore((state) => state.title)

  return (
    <article className="typed-store-panel" data-testid="title-panel">
      <span>state.title: string</span>
      <strong data-testid="note-title">{title}</strong>
    </article>
  )
}

/** 只选择置顶标记。 */
function PinnedPanel() {
  const pinned = useNoteStore((state) => state.pinned)

  return (
    <article className="typed-store-panel" data-testid="pinned-panel">
      <span>state.pinned: boolean</span>
      <strong data-testid="note-pinned">{pinned ? '已置顶' : '未置顶'}</strong>
    </article>
  )
}

/** 只负责编辑标题，避免父组件订阅 title。 */
function TitleEditor() {
  const title = useNoteStore((state) => state.title)
  const rename = useNoteStore((state) => state.rename)

  return (
    <label className="typed-store-field">
      <span>rename(title: string)</span>
      <input value={title} aria-label="笔记标题" onChange={(event) => rename(event.target.value)} />
    </label>
  )
}

/** 只负责切换置顶，避免父组件订阅 pinned。 */
function PinnedToggle() {
  const pinned = useNoteStore((state) => state.pinned)
  const togglePinned = useNoteStore((state) => state.togglePinned)

  return (
    <button type="button" aria-pressed={pinned} onClick={togglePinned}>
      切换置顶
    </button>
  )
}

/** 展示类型化 State 与 Action 的运行结果。 */
function TypescriptStoreDemo() {
  const reset = useNoteStore((state) => state.reset)

  return (
    <section className="typed-store-demo" data-testid="typed-store-demo">
      <header className="typed-store-heading">
        <p>Zustand TypeScript</p>
        <h2>create&lt;NoteStore&gt;() 固定 Store 形状</h2>
        <span>标题是 string，置顶是 boolean；Action 参数同样受类型约束。</span>
      </header>

      <div className="typed-store-panels">
        <TitlePanel />
        <PinnedPanel />
      </div>

      <div className="typed-store-controls">
        <TitleEditor />

        <div className="typed-store-actions">
          <PinnedToggle />
          <button type="button" onClick={reset}>
            重置笔记
          </button>
        </div>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 TypeScript Store 观察组件。 */
export function createTypescriptStoreDemo(): ComponentType {
  return TypescriptStoreDemo
}
