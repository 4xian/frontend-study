import { create } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './selector-result-stability-demo.css'

type BoardState = {
  title: string
  tags: string[]
  ticks: number
}

type BoardActions = {
  rename: (title: string) => void
  addTag: (tag: string) => void
  tick: () => void
  reset: () => void
}

type BoardStore = BoardState & BoardActions

const initialBoardState: BoardState = {
  title: '迭代看板',
  tags: ['设计', '开发'],
  ticks: 0,
}

const useBoardStore = create<BoardStore>()((set) => ({
  ...initialBoardState,
  /** 写入新的看板标题。 */
  rename: (title) => set({ title }),
  /** 追加一个标签，换成新的数组引用。 */
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  /** 增加与标题、标签无关的计数。 */
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
  /** 恢复演示用的初始看板。 */
  reset: () =>
    set({
      title: initialBoardState.title,
      tags: [...initialBoardState.tags],
      ticks: initialBoardState.ticks,
    }),
}))

/** 只选择标题字符串，标签和无关计数变化时不应增加渲染次数。 */
function TitleSubscriber() {
  const title = useBoardStore((state) => state.title)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="result-stability-panel" data-testid="title-subscriber">
      <span>选择已有 title</span>
      <strong data-testid="result-stability-title">{title}</strong>
      <p>
        渲染次数 <b data-testid="title-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择已有标签数组，标题和无关计数变化时不应增加渲染次数。 */
function TagsSubscriber() {
  const tags = useBoardStore((state) => state.tags)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="result-stability-panel" data-testid="tags-subscriber">
      <span>选择已有 tags</span>
      <strong data-testid="result-stability-tags">{tags.join('、')}</strong>
      <p>
        渲染次数 <b data-testid="tags-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 选择标签数量这个数字，数组引用不变时结果保持稳定。 */
function TagCountSubscriber() {
  const tagCount = useBoardStore((state) => state.tags.length)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="result-stability-panel" data-testid="count-subscriber">
      <span>选择 tags.length</span>
      <strong data-testid="result-stability-count">{tagCount}</strong>
      <p>
        渲染次数 <b data-testid="count-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 不传选择函数，任意字段变化都会重渲染。 */
function WholeStoreSubscriber() {
  const board = useBoardStore()
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="result-stability-panel" data-testid="whole-subscriber">
      <span>不传选择函数</span>
      <strong data-testid="result-stability-whole">
        {board.title} / {board.tags.length}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择改标题的 Action，避免父组件订阅 title。 */
function RenameButton() {
  const rename = useBoardStore((state) => state.rename)

  return (
    <button type="button" onClick={() => rename('发布看板')}>
      修改标题
    </button>
  )
}

/** 只选择追加标签的 Action。 */
function AddTagButton() {
  const addTag = useBoardStore((state) => state.addTag)

  return (
    <button type="button" onClick={() => addTag('测试')}>
      追加标签
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useBoardStore((state) => state.ticks)

  return (
    <p className="result-stability-ticks" aria-live="polite">
      无关计数 <strong data-testid="result-stability-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示稳定选择结果与整份订阅在无关更新下的渲染差异。 */
function SelectorResultStabilityDemo() {
  const tick = useBoardStore((state) => state.tick)
  const reset = useBoardStore((state) => state.reset)

  return (
    <section className="result-stability-demo" data-testid="result-stability-demo">
      <header className="result-stability-heading">
        <p>Zustand selector result stability</p>
        <h2>选择结果要对 Object.is 稳定</h2>
        <span>增加无关计数时，只有不传选择函数的面板会增加渲染次数。</span>
      </header>

      <TicksDisplay />

      <div className="result-stability-panels">
        <TitleSubscriber />
        <TagsSubscriber />
        <TagCountSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="result-stability-actions">
        <RenameButton />
        <AddTagButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
        <button type="button" onClick={reset}>
          重置看板
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供选择结果稳定性观察组件。 */
export function createSelectorResultStabilityDemo(): ComponentType {
  return SelectorResultStabilityDemo
}
