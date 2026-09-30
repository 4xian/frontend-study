import { create } from 'zustand'
import { type ComponentType } from 'react'

import './get-current-state-demo.css'

type DraftState = {
  title: string
  notes: string
  saveCount: number
  lastSnapshot: string
  statusMessage: string
}

type DraftActions = {
  rename: (title: string) => void
  updateNotes: (notes: string) => void
  captureSnapshot: () => void
  save: () => void
  publish: () => void
  reset: () => void
}

type DraftStore = DraftState & DraftActions

const initialDraftState: DraftState = {
  title: '未命名草稿',
  notes: '待补充发布说明',
  saveCount: 0,
  lastSnapshot: '尚未读取',
  statusMessage: '等待操作',
}

const useDraftStore = create<DraftStore>()((set, get) => ({
  ...initialDraftState,
  /** 用输入值更新当前草稿标题。 */
  rename: (title: string) => set({ title }),
  /** 用输入值更新当前备注。 */
  updateNotes: (notes: string) => set({ notes }),
  /** 在 Action 内调用 get，捕获调用当下的标题和备注。 */
  captureSnapshot: () => {
    const { title, notes } = get()
    set({
      lastSnapshot: `标题《${title}》· 备注 ${notes.length} 字`,
      statusMessage: 'get() 已读取当前草稿',
    })
  },
  /** 读取多个当前字段后累计保存次数。 */
  save: () => {
    const { title, notes, saveCount } = get()
    set({
      saveCount: saveCount + 1,
      statusMessage: `已保存《${title}》，备注 ${notes.length} 字`,
    })
  },
  /** 先转调 save，再重新 get 最新次数后写入发布文案。 */
  publish: () => {
    get().save()
    const { title, saveCount } = get()
    set({ statusMessage: `已发布《${title}》，保存 ${saveCount} 次` })
  },
  /** 恢复演示用的初始草稿。 */
  reset: () => set(initialDraftState),
}))

/** 展示 Action 如何用 get 读取当前 State 并转调其他 Action。 */
function GetCurrentStateDemo() {
  const title = useDraftStore((state) => state.title)
  const notes = useDraftStore((state) => state.notes)
  const saveCount = useDraftStore((state) => state.saveCount)
  const lastSnapshot = useDraftStore((state) => state.lastSnapshot)
  const statusMessage = useDraftStore((state) => state.statusMessage)
  const rename = useDraftStore((state) => state.rename)
  const updateNotes = useDraftStore((state) => state.updateNotes)
  const captureSnapshot = useDraftStore((state) => state.captureSnapshot)
  const save = useDraftStore((state) => state.save)
  const publish = useDraftStore((state) => state.publish)
  const reset = useDraftStore((state) => state.reset)

  return (
    <section className="get-state-demo" data-testid="get-state-demo">
      <header className="get-state-heading">
        <p>Zustand get</p>
        <h2>Action 读取调用当下的 Store 快照</h2>
        <span>get() 只在 Action 内使用，不代替组件订阅。</span>
      </header>

      <div className="get-state-status" aria-live="polite">
        <span>最近一次 Action</span>
        <strong data-testid="get-state-message">{statusMessage}</strong>
      </div>

      <div className="get-state-values" aria-label="当前 Store State">
        <div>
          <span>title</span>
          <strong data-testid="get-state-title">{title}</strong>
        </div>
        <div>
          <span>saveCount</span>
          <strong data-testid="get-state-count">{saveCount}</strong>
        </div>
        <div>
          <span>最近一次 get() 快照</span>
          <strong data-testid="get-state-snapshot">{lastSnapshot}</strong>
        </div>
      </div>

      <div className="get-state-controls">
        <label className="get-state-field">
          <span>rename(title)</span>
          <input
            value={title}
            aria-label="草稿标题"
            onChange={(event) => rename(event.target.value)}
          />
        </label>

        <label className="get-state-field">
          <span>updateNotes(notes)</span>
          <input
            value={notes}
            aria-label="草稿备注"
            onChange={(event) => updateNotes(event.target.value)}
          />
        </label>
      </div>

      <div className="get-state-actions">
        <button type="button" onClick={captureSnapshot}>
          读取当前状态
        </button>
        <button type="button" onClick={save}>
          保存当前草稿
        </button>
        <button type="button" onClick={publish}>
          发布并转调 save
        </button>
        <button type="button" onClick={reset}>
          重置草稿
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 get 当前状态观察组件。 */
export function createGetCurrentStateDemo(): ComponentType {
  return GetCurrentStateDemo
}
