import { create } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './state-reset-demo.css'

type SessionState = {
  name: string
  theme: string
  extra: string
  ticks: number
}

type SessionActions = {
  rename: () => void
  toggleTheme: () => void
  setExtra: () => void
  resetMerge: () => void
  resetAll: () => void
  tick: () => void
}

type SessionStore = SessionState & SessionActions

const initialState = {
  name: '访客',
  theme: '浅色',
  ticks: 0,
}

const useSessionStore = create<SessionStore>()((set, _get, store) => ({
  ...initialState,
  extra: '',
  /** 把姓名改成固定演示值。 */
  rename: () => set({ name: '林间' }),
  /** 在浅色和深色之间切换主题。 */
  toggleTheme: () => set((state) => ({ theme: state.theme === '浅色' ? '深色' : '浅色' })),
  /** 写入不在 initialState 里的临时备注。 */
  setExtra: () => set({ extra: '草稿' }),
  /** 浅合并写回 initialState，额外字段保留。 */
  resetMerge: () => set(initialState),
  /** 用创建时的完整快照替换，清掉额外字段并保留 Action。 */
  resetAll: () => set(store.getInitialState(), true),
  /** 增加与会话无关的计数。 */
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

/** 只选择姓名。 */
function NameSubscriber() {
  const name = useSessionStore((state) => state.name)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="state-reset-panel" data-testid="name-subscriber">
      <span>姓名</span>
      <strong data-testid="state-reset-name">{name}</strong>
      <p>
        渲染次数 <b data-testid="name-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择主题。 */
function ThemeSubscriber() {
  const theme = useSessionStore((state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="state-reset-panel" data-testid="theme-subscriber">
      <span>主题</span>
      <strong data-testid="state-reset-theme">{theme}</strong>
      <p>
        渲染次数 <b data-testid="theme-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择临时备注。 */
function ExtraSubscriber() {
  const extra = useSessionStore((state) => state.extra)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="state-reset-panel" data-testid="extra-subscriber">
      <span>临时备注</span>
      <strong data-testid="state-reset-extra">{extra || '无'}</strong>
      <p>
        渲染次数 <b data-testid="extra-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 不传选择函数，任意字段变化都会重渲染。 */
function WholeStoreSubscriber() {
  const session = useSessionStore()
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="state-reset-panel" data-testid="whole-subscriber">
      <span>不传选择函数</span>
      <strong data-testid="state-reset-whole">
        {session.name} / {session.ticks}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择改名 Action。 */
function RenameButton() {
  const rename = useSessionStore((state) => state.rename)

  return (
    <button type="button" onClick={rename}>
      改名
    </button>
  )
}

/** 只选择切换主题 Action。 */
function ThemeButton() {
  const toggleTheme = useSessionStore((state) => state.toggleTheme)

  return (
    <button type="button" onClick={toggleTheme}>
      切换主题
    </button>
  )
}

/** 只选择写入备注 Action。 */
function ExtraButton() {
  const setExtra = useSessionStore((state) => state.setExtra)

  return (
    <button type="button" onClick={setExtra}>
      写备注
    </button>
  )
}

/** 只选择合并重置 Action。 */
function MergeResetButton() {
  const resetMerge = useSessionStore((state) => state.resetMerge)

  return (
    <button type="button" onClick={resetMerge}>
      合并重置
    </button>
  )
}

/** 只选择替换重置 Action。 */
function ReplaceResetButton() {
  const resetAll = useSessionStore((state) => state.resetAll)

  return (
    <button type="button" onClick={resetAll}>
      替换重置
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useSessionStore((state) => state.ticks)

  return (
    <p className="state-reset-ticks" aria-live="polite">
      无关计数 <strong data-testid="state-reset-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示合并重置保留额外字段、替换重置清掉额外字段。 */
function StateResetDemo() {
  const tick = useSessionStore((state) => state.tick)

  return (
    <section className="state-reset-demo" data-testid="state-reset-demo">
      <header className="state-reset-heading">
        <p>Zustand state reset</p>
        <h2>合并写回初始字段，替换清掉额外字段</h2>
        <span>写备注后合并重置，备注还在；替换重置会清掉备注，改名仍然可用。</span>
      </header>

      <TicksDisplay />

      <div className="state-reset-panels">
        <NameSubscriber />
        <ThemeSubscriber />
        <ExtraSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="state-reset-actions">
        <RenameButton />
        <ThemeButton />
        <ExtraButton />
        <MergeResetButton />
        <ReplaceResetButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供状态重置观察组件。 */
export function createStateResetDemo(): ComponentType {
  return StateResetDemo
}
