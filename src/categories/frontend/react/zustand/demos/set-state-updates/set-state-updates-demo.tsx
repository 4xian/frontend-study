import { create } from 'zustand'
import { type ComponentType } from 'react'

import './set-state-updates-demo.css'

type ArticleState = {
  title: string
  saveCount: number
  isPublished: boolean
  statusMessage: string
}

type ArticleActions = {
  rename: (title: string) => void
  save: () => void
  togglePublished: () => void
  reset: () => void
}

type ArticleStore = ArticleState & ArticleActions

const initialArticleState: ArticleState = {
  title: '未命名文章',
  saveCount: 0,
  isPublished: false,
  statusMessage: '等待操作',
}

const useArticleStore = create<ArticleStore>()((set) => ({
  ...initialArticleState,
  /** 使用对象形式写入输入框提供的新标题。 */
  rename: (title: string) => set({ title, statusMessage: '对象更新：标题已改变' }),
  /** 使用函数式更新基于当前计数累计一次保存。 */
  save: () =>
    set((state) => ({
      saveCount: state.saveCount + 1,
      statusMessage: '函数式更新：保存次数 +1',
    })),
  /** 使用函数式更新翻转当前发布状态。 */
  togglePublished: () =>
    set((state) => ({
      isPublished: !state.isPublished,
      statusMessage: `函数式更新：${state.isPublished ? '已撤回发布' : '已发布'}`,
    })),
  /** 恢复演示用的初始文章状态。 */
  reset: () => set(initialArticleState),
}))

/** 展示 set 对象更新、函数式更新与顶层浅合并结果。 */
function SetStateUpdatesDemo() {
  const title = useArticleStore((state) => state.title)
  const saveCount = useArticleStore((state) => state.saveCount)
  const isPublished = useArticleStore((state) => state.isPublished)
  const statusMessage = useArticleStore((state) => state.statusMessage)
  const rename = useArticleStore((state) => state.rename)
  const save = useArticleStore((state) => state.save)
  const togglePublished = useArticleStore((state) => state.togglePublished)
  const reset = useArticleStore((state) => state.reset)

  return (
    <section className="set-updates-demo" data-testid="set-updates-demo">
      <header className="set-updates-heading">
        <p>Zustand set</p>
        <h2>部分更新，其他字段保持不变</h2>
        <span>对象形式写入新值，函数形式从前一个 State 计算下一值。</span>
      </header>

      <div className="set-updates-status" aria-live="polite">
        <span>最近一次更新</span>
        <strong data-testid="set-updates-message">{statusMessage}</strong>
      </div>

      <div className="set-updates-values" aria-label="当前 Store State">
        <div>
          <span>title</span>
          <strong data-testid="set-updates-title">{title}</strong>
        </div>
        <div>
          <span>saveCount</span>
          <strong data-testid="set-updates-count">{saveCount}</strong>
        </div>
        <div>
          <span>isPublished</span>
          <strong data-testid="set-updates-published">{isPublished ? 'true' : 'false'}</strong>
        </div>
      </div>

      <div className="set-updates-controls">
        <label className="set-updates-field">
          <span>对象更新：rename(title)</span>
          <input
            value={title}
            aria-label="文章标题"
            onChange={(event) => rename(event.target.value)}
          />
        </label>

        <div className="set-updates-group">
          <span>函数式更新：save()</span>
          <button type="button" onClick={save}>
            保存一次
          </button>
        </div>

        <div className="set-updates-group">
          <span>函数式更新：togglePublished()</span>
          <button type="button" onClick={togglePublished}>
            {isPublished ? '撤回发布' : '发布文章'}
          </button>
        </div>

        <div className="set-updates-group">
          <span>reset()</span>
          <button type="button" onClick={reset}>
            重置文章
          </button>
        </div>
      </div>

      <p className="set-updates-note">
        每次 Action 只返回需要改变的顶层字段，未返回的字段会被浅合并保留。
      </p>
    </section>
  )
}

/** 为 React Demo 宿主提供 set 状态更新观察组件。 */
export function createSetStateUpdatesDemo(): ComponentType {
  return SetStateUpdatesDemo
}
