import { create } from 'zustand'
import { type ComponentType, useEffect, useRef, useState } from 'react'

import './subscribe-demo.css'

type PreferenceState = {
  theme: string
  draft: number
  ticks: number
}

type PreferenceActions = {
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
  writeSame: () => void
}

type PreferenceStore = PreferenceState & PreferenceActions

const usePreferenceStore = create<PreferenceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  ticks: 0,
  /** 在浅色和深色之间切换主题。 */
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  /** 增加草稿计数。 */
  bumpDraft: () => set({ draft: get().draft + 1 }),
  /** 增加与偏好无关的计数。 */
  tick: () => set({ ticks: get().ticks + 1 }),
  /** 把当前引用原样写回，验证相同引用不会通知 listener。 */
  writeSame: () => set(get()),
}))

/** 只选择主题。 */
function ThemeSubscriber() {
  const theme = usePreferenceStore((state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="subscribe-panel" data-testid="theme-subscriber">
      <span>主题</span>
      <strong data-testid="subscribe-theme">{theme}</strong>
      <p>
        渲染次数 <b data-testid="theme-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择草稿计数。 */
function DraftSubscriber() {
  const draft = usePreferenceStore((state) => state.draft)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="subscribe-panel" data-testid="draft-subscriber">
      <span>草稿</span>
      <strong data-testid="subscribe-draft">{draft}</strong>
      <p>
        渲染次数 <b data-testid="draft-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 用默认 subscribe 记录整份 state 通知，不经过 Store Hook 选择字段。 */
function SubscribeLog() {
  const [listening, setListening] = useState(true)
  const [lines, setLines] = useState<string[]>([])
  const renderCount = useRef(0)
  renderCount.current += 1

  useEffect(() => {
    if (!listening) {
      return
    }
    return usePreferenceStore.subscribe((state, prevState) => {
      setLines((current) => [
        ...current,
        `${prevState.theme}→${state.theme} / ${prevState.draft}→${state.draft} / ${prevState.ticks}→${state.ticks}`,
      ])
    })
  }, [listening])

  return (
    <article className="subscribe-panel subscribe-log-panel" data-testid="log-subscriber">
      <span>外部订阅</span>
      <strong data-testid="subscribe-status">{listening ? '监听中' : '已停止'}</strong>
      <p>
        通知次数 <b data-testid="subscribe-event-count">{lines.length}</b>
      </p>
      <pre data-testid="subscribe-log">{lines.join('\n') || '空'}</pre>
      <p>
        渲染次数 <b data-testid="log-render-count">{renderCount.current}</b>
      </p>
      <div className="subscribe-log-actions">
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

/** 只选择切换主题 Action。 */
function ThemeButton() {
  const toggleTheme = usePreferenceStore((state) => state.toggleTheme)

  return (
    <button type="button" onClick={toggleTheme}>
      切换主题
    </button>
  )
}

/** 只选择增加草稿 Action。 */
function DraftButton() {
  const bumpDraft = usePreferenceStore((state) => state.bumpDraft)

  return (
    <button type="button" onClick={bumpDraft}>
      增加草稿
    </button>
  )
}

/** 只选择写入当前引用的 Action。 */
function WriteSameButton() {
  const writeSame = usePreferenceStore((state) => state.writeSame)

  return (
    <button type="button" onClick={writeSame}>
      写入相同引用
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = usePreferenceStore((state) => state.ticks)

  return (
    <p className="subscribe-ticks" aria-live="polite">
      无关计数 <strong data-testid="subscribe-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示默认 subscribe 接收整份更新，并与 Hook 渲染范围对照。 */
function SubscribeDemo() {
  const tick = usePreferenceStore((state) => state.tick)

  return (
    <section className="subscribe-demo" data-testid="subscribe-demo">
      <header className="subscribe-heading">
        <p>Zustand subscribe</p>
        <h2>外部回调听整份更新，组件 Hook 仍只选字段</h2>
        <span>
          增加无关计数时主题和草稿面板不重渲染，右侧日志仍会多一条；停止订阅或写入相同引用后，日志不再增加。
        </span>
      </header>

      <TicksDisplay />

      <div className="subscribe-panels">
        <ThemeSubscriber />
        <DraftSubscriber />
        <SubscribeLog />
      </div>

      <div className="subscribe-actions">
        <ThemeButton />
        <DraftButton />
        <WriteSameButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 subscribe 观察组件。 */
export function createSubscribeDemo(): ComponentType {
  return SubscribeDemo
}
