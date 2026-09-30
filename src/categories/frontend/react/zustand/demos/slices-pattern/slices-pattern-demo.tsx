import { create, type StateCreator } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './slices-pattern-demo.css'

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type DraftSlice = {
  draft: number
  bumpDraft: () => void
}

type SharedSlice = {
  addThemeAndDraft: () => void
  tick: () => void
  ticks: number
}

type BoundStore = ThemeSlice & DraftSlice & SharedSlice

const createThemeSlice: StateCreator<BoundStore, [], [], ThemeSlice> = (set, get) => ({
  theme: '浅色',
  /** 只更新主题片段。 */
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const createDraftSlice: StateCreator<BoundStore, [], [], DraftSlice> = (set, get) => ({
  draft: 0,
  /** 只更新草稿片段。 */
  bumpDraft: () => set({ draft: get().draft + 1 }),
})

const createSharedSlice: StateCreator<BoundStore, [], [], SharedSlice> = (set, get) => ({
  ticks: 0,
  /** 依次调用两个片段已有的 Action。 */
  addThemeAndDraft: () => {
    get().toggleTheme()
    get().bumpDraft()
  },
  /** 增加与主题、草稿无关的计数。 */
  tick: () => set({ ticks: get().ticks + 1 }),
})

const useBoundStore = create<BoundStore>()((...a) => ({
  ...createThemeSlice(...a),
  ...createDraftSlice(...a),
  ...createSharedSlice(...a),
}))

/** 只选择主题。 */
function ThemeSubscriber() {
  const theme = useBoundStore((state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="slices-panel" data-testid="theme-subscriber">
      <span>主题片段</span>
      <strong data-testid="slices-theme">{theme}</strong>
      <p>
        渲染次数 <b data-testid="theme-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择草稿计数。 */
function DraftSubscriber() {
  const draft = useBoundStore((state) => state.draft)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="slices-panel" data-testid="draft-subscriber">
      <span>草稿片段</span>
      <strong data-testid="slices-draft">{draft}</strong>
      <p>
        渲染次数 <b data-testid="draft-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择切换主题 Action。 */
function ThemeButton() {
  const toggleTheme = useBoundStore((state) => state.toggleTheme)

  return (
    <button type="button" onClick={toggleTheme}>
      切换主题
    </button>
  )
}

/** 只选择增加草稿 Action。 */
function DraftButton() {
  const bumpDraft = useBoundStore((state) => state.bumpDraft)

  return (
    <button type="button" onClick={bumpDraft}>
      增加草稿
    </button>
  )
}

/** 只选择跨片段命令。 */
function SharedButton() {
  const addThemeAndDraft = useBoundStore((state) => state.addThemeAndDraft)

  return (
    <button type="button" onClick={addThemeAndDraft}>
      同时更新两段
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useBoundStore((state) => state.ticks)

  return (
    <p className="slices-ticks" aria-live="polite">
      无关计数 <strong data-testid="slices-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示多个 slice 合并成一份 Store 后仍按字段独立更新。 */
function SlicesPatternDemo() {
  const tick = useBoundStore((state) => state.tick)

  return (
    <section className="slices-demo" data-testid="slices-pattern-demo">
      <header className="slices-heading">
        <p>Zustand slices</p>
        <h2>多个 slice 展开成一份 Store，字段仍然独立更新</h2>
        <span>
          切换主题时草稿面板不重渲染；同时更新两段会改主题并给草稿加一。无关计数不带动这两个面板。
        </span>
      </header>

      <TicksDisplay />

      <div className="slices-panels">
        <ThemeSubscriber />
        <DraftSubscriber />
      </div>

      <div className="slices-actions">
        <ThemeButton />
        <DraftButton />
        <SharedButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Slices Pattern 观察组件。 */
export function createSlicesPatternDemo(): ComponentType {
  return SlicesPatternDemo
}
