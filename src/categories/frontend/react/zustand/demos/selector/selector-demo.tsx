import { create } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './selector-demo.css'

type FilterStatus = 'all' | 'open'

type FilterState = {
  keyword: string
  status: FilterStatus
  hits: number
}

type FilterActions = {
  setKeyword: (keyword: string) => void
  setStatus: (status: FilterStatus) => void
  bumpHits: () => void
  reset: () => void
}

type FilterStore = FilterState & FilterActions

const initialFilterState: FilterState = {
  keyword: '',
  status: 'all',
  hits: 0,
}

const useFilterStore = create<FilterStore>()((set) => ({
  ...initialFilterState,
  /** 写入当前关键词。 */
  setKeyword: (keyword: string) => set({ keyword }),
  /** 写入当前筛选状态。 */
  setStatus: (status: FilterStatus) => set({ status }),
  /** 把命中次数加一。 */
  bumpHits: () => set((state) => ({ hits: state.hits + 1 })),
  /** 恢复演示用的初始筛选条件。 */
  reset: () => set(initialFilterState),
}))

/** 只选择关键词，用来对照字段订阅范围。 */
function KeywordSubscriber() {
  const keyword = useFilterStore((state) => state.keyword)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="selector-panel" data-testid="keyword-subscriber">
      <span>选择 keyword</span>
      <strong data-testid="selector-keyword">{keyword || '空'}</strong>
      <p>
        渲染次数 <b data-testid="keyword-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择筛选状态，命中次数变化时不应增加渲染次数。 */
function StatusSubscriber() {
  const status = useFilterStore((state) => state.status)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="selector-panel" data-testid="status-subscriber">
      <span>选择 status</span>
      <strong data-testid="selector-status">{status}</strong>
      <p>
        渲染次数 <b data-testid="status-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 不传选择函数，任意字段变化都会重渲染。 */
function WholeStoreSubscriber() {
  const filter = useFilterStore()
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="selector-panel" data-testid="whole-subscriber">
      <span>不传选择函数</span>
      <strong data-testid="selector-whole">
        {filter.keyword || '空'} / {filter.status} / {filter.hits}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只负责改关键词，避免父组件订阅 keyword。 */
function KeywordEditor() {
  const keyword = useFilterStore((state) => state.keyword)
  const setKeyword = useFilterStore((state) => state.setKeyword)

  return (
    <label className="selector-field">
      <span>setKeyword(keyword)</span>
      <input
        value={keyword}
        aria-label="筛选关键词"
        onChange={(event) => setKeyword(event.target.value)}
      />
    </label>
  )
}

/** 只负责切换筛选状态，避免父组件订阅 status。 */
function StatusToggle() {
  const status = useFilterStore((state) => state.status)
  const setStatus = useFilterStore((state) => state.setStatus)

  return (
    <button
      type="button"
      aria-pressed={status === 'open'}
      onClick={() => setStatus(status === 'all' ? 'open' : 'all')}
    >
      切换状态
    </button>
  )
}

/** 展示按字段选择与整份 Store 订阅的渲染差异。 */
function SelectorDemo() {
  const bumpHits = useFilterStore((state) => state.bumpHits)
  const reset = useFilterStore((state) => state.reset)

  return (
    <section className="selector-demo" data-testid="selector-demo">
      <header className="selector-heading">
        <p>Zustand selector</p>
        <h2>选择函数决定订阅哪一块数据</h2>
        <span>只选择 keyword 或 status 的面板，不会因为 hits 变化而增加渲染次数。</span>
      </header>

      <div className="selector-panels">
        <KeywordSubscriber />
        <StatusSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="selector-controls">
        <KeywordEditor />

        <div className="selector-actions">
          <StatusToggle />
          <button type="button" onClick={bumpHits}>
            增加命中次数
          </button>
          <button type="button" onClick={reset}>
            重置筛选
          </button>
        </div>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Selector 观察组件。 */
export function createSelectorDemo(): ComponentType {
  return SelectorDemo
}
