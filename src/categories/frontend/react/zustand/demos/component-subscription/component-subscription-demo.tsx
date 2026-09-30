import { create } from 'zustand'
import { type ComponentType, useRef, useState } from 'react'

import './component-subscription-demo.css'

type BoardState = {
  title: string
  visits: number
}

type BoardActions = {
  rename: (title: string) => void
  visit: () => void
  reset: () => void
}

type BoardStore = BoardState & BoardActions

const initialBoardState: BoardState = {
  title: '产品看板',
  visits: 0,
}

const useBoardStore = create<BoardStore>()((set) => ({
  ...initialBoardState,
  /** 更新当前看板标题。 */
  rename: (title: string) => set({ title }),
  /** 把访问次数加一。 */
  visit: () => set((state) => ({ visits: state.visits + 1 })),
  /** 恢复演示用的初始看板。 */
  reset: () => set(initialBoardState),
}))

/** 只订阅标题，并用渲染次数观察订阅范围。 */
function TitleSubscriber() {
  const title = useBoardStore((state) => state.title)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="subscription-panel" data-testid="title-subscriber">
      <span>订阅 title</span>
      <strong data-testid="subscription-title">{title}</strong>
      <p>
        渲染次数 <b data-testid="title-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只订阅访问次数，卸载后不再增加渲染计数。 */
function VisitsSubscriber() {
  const visits = useBoardStore((state) => state.visits)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="subscription-panel" data-testid="visits-subscriber">
      <span>订阅 visits</span>
      <strong data-testid="subscription-visits">{visits}</strong>
      <p>
        渲染次数 <b data-testid="visits-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只订阅标题输入，避免父组件因 title 变化而带动其他面板重渲染。 */
function TitleEditor() {
  const title = useBoardStore((state) => state.title)
  const rename = useBoardStore((state) => state.rename)

  return (
    <label className="subscription-field">
      <span>rename(title)</span>
      <input value={title} aria-label="看板标题" onChange={(event) => rename(event.target.value)} />
    </label>
  )
}

/** 展示组件订阅、按字段重渲染以及卸载边界。 */
function ComponentSubscriptionDemo() {
  const visit = useBoardStore((state) => state.visit)
  const reset = useBoardStore((state) => state.reset)
  const [showVisits, setShowVisits] = useState(true)

  return (
    <section className="subscription-demo" data-testid="subscription-demo">
      <header className="subscription-heading">
        <p>Zustand subscription</p>
        <h2>组件挂载时订阅，卸载时结束</h2>
        <span>选择 title 的面板不会因为 visits 变化而增加渲染次数。</span>
      </header>

      <div className="subscription-panels">
        <TitleSubscriber />
        {showVisits ? <VisitsSubscriber /> : null}
      </div>

      <div className="subscription-controls">
        <TitleEditor />

        <div className="subscription-actions">
          <button type="button" onClick={visit}>
            增加访问次数
          </button>
          <button
            type="button"
            aria-pressed={!showVisits}
            onClick={() => setShowVisits((value) => !value)}
          >
            {showVisits ? '卸载访问次数面板' : '重新挂载访问次数面板'}
          </button>
          <button type="button" onClick={reset}>
            重置看板
          </button>
        </div>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供组件订阅观察组件。 */
export function createComponentSubscriptionDemo(): ComponentType {
  return ComponentSubscriptionDemo
}
