import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { type ComponentType, useEffect, useState } from 'react'

import './subscribe-with-selector-demo.css'

type PreferenceStore = {
  theme: string
  draft: number
  ticks: number
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  subscribeWithSelector((set, get) => ({
    theme: '浅色',
    draft: 0,
    ticks: 0,
    /** 在浅色和深色之间切换主题。 */
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    /** 增加草稿计数。 */
    bumpDraft: () => set({ draft: get().draft + 1 }),
    /** 增加与主题、草稿无关的计数。 */
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)

/** 只订阅主题切片，草稿和无关计数变化时不追加。 */
function ThemeSelectorLog() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    return usePreferenceStore.subscribe(
      (state) => state.theme,
      (theme, previousTheme) => {
        setLines((current) => [...current, `${previousTheme}→${theme}`])
      },
    )
  }, [])

  return (
    <section className="selector-sub-pane" data-testid="theme-log-pane">
      <h3>主题选择</h3>
      <p className="selector-sub-count">
        通知 <strong data-testid="theme-log-count">{lines.length}</strong>
      </p>
      <pre data-testid="theme-log">{lines.join('\n') || '空'}</pre>
    </section>
  )
}

/** 只订阅草稿切片，主题和无关计数变化时不追加。 */
function DraftSelectorLog() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    return usePreferenceStore.subscribe(
      (state) => state.draft,
      (draft, previousDraft) => {
        setLines((current) => [...current, `${previousDraft}→${draft}`])
      },
    )
  }, [])

  return (
    <section className="selector-sub-pane" data-testid="draft-log-pane">
      <h3>草稿选择</h3>
      <p className="selector-sub-count">
        通知 <strong data-testid="draft-log-count">{lines.length}</strong>
      </p>
      <pre data-testid="draft-log">{lines.join('\n') || '空'}</pre>
    </section>
  )
}

/** 订阅主题时立刻留下当前值，之后仍只在主题变化时追加。 */
function ImmediateThemeLog() {
  const [listening, setListening] = useState(true)
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    if (!listening) {
      return
    }
    return usePreferenceStore.subscribe(
      (state) => state.theme,
      (theme, previousTheme) => {
        setLines((current) => [...current, `${previousTheme}→${theme}`])
      },
      { fireImmediately: true },
    )
  }, [listening])

  return (
    <section className="selector-sub-pane" data-testid="immediate-log-pane">
      <h3>立即触发</h3>
      <p className="selector-sub-count">
        通知 <strong data-testid="immediate-log-count">{lines.length}</strong>
      </p>
      <pre data-testid="immediate-log">{lines.join('\n') || '空'}</pre>
      <div className="selector-sub-log-actions">
        <button
          type="button"
          data-testid="start-immediate"
          onClick={() => setListening(true)}
          disabled={listening}
        >
          开始订阅
        </button>
        <button
          type="button"
          data-testid="stop-immediate"
          onClick={() => setListening(false)}
          disabled={!listening}
        >
          停止订阅
        </button>
      </div>
    </section>
  )
}

/** 对照字段选择不会被无关写入叫醒，以及立即触发会先留下当前主题。 */
function SubscribeWithSelectorDemo() {
  const ticks = usePreferenceStore((state) => state.ticks)

  return (
    <section className="selector-sub-demo" data-testid="subscribe-with-selector-demo">
      <header className="selector-sub-heading">
        <p>Zustand subscribeWithSelector</p>
        <h2>选择切片后，无关写入不再叫醒 listener</h2>
        <span>
          左侧只订主题，中间只订草稿。切换主题或增加草稿时，对应日志才增加。增加无关计数时两份日志都不动。右侧订阅当下就会先留下当前主题。
        </span>
      </header>

      <p className="selector-sub-ticks">
        无关计数 <strong data-testid="selector-ticks">{ticks}</strong>
      </p>

      <div className="selector-sub-panes">
        <ThemeSelectorLog />
        <DraftSelectorLog />
        <ImmediateThemeLog />
      </div>

      <div className="selector-sub-actions">
        <button
          type="button"
          data-testid="toggle-theme"
          onClick={() => usePreferenceStore.getState().toggleTheme()}
        >
          切换主题
        </button>
        <button
          type="button"
          data-testid="bump-draft"
          onClick={() => usePreferenceStore.getState().bumpDraft()}
        >
          增加草稿
        </button>
        <button
          type="button"
          data-testid="bump-ticks"
          onClick={() => usePreferenceStore.getState().tick()}
        >
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 subscribeWithSelector 观察组件。 */
export function createSubscribeWithSelectorDemo(): ComponentType {
  return SubscribeWithSelectorDemo
}
