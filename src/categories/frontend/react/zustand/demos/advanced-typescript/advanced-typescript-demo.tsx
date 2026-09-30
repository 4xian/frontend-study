import { create, type ExtractState, useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { combine } from 'zustand/middleware'
import { type ComponentType } from 'react'

import './advanced-typescript-demo.css'

type EditorStore = {
  theme: string
  draft: number
  bumpDraft: () => void
}

const useCombinedStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  })),
)

type CombinedStore = ExtractState<typeof useCombinedStore>

const useTypedStore = create<EditorStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))

const vanillaEditorStore = createStore<EditorStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))

/** 无选择函数时返回整份 EditorStore。 */
function useVanillaEditorStore(): EditorStore
/** 按选择函数从 vanilla api 取出字段。 */
function useVanillaEditorStore<T>(selector: (state: EditorStore) => T): T
/** 把 vanilla api 收成 bounded Hook，选择规则与 create 相同。 */
function useVanillaEditorStore<T>(selector?: (state: EditorStore) => T) {
  return useStore(vanillaEditorStore, selector!)
}

/** 把 ExtractState 取出的形状写成可读标签。 */
function describeCombined(state: CombinedStore) {
  return `${state.theme} / ${state.draft}`
}

/** 观察 combine 推断：replace 为 true 时会删掉 Action。 */
function CombinedPane() {
  const theme = useCombinedStore((state) => state.theme)
  const draft = useCombinedStore((state) => state.draft)
  const bumpDraft = useCombinedStore((state) => state.bumpDraft)
  const actionStatus = typeof bumpDraft === 'function' ? '仍在' : '已丢失'

  return (
    <section className="advanced-ts-pane" data-testid="combined-pane">
      <h3>combine 推断</h3>
      <p className="advanced-ts-label" data-testid="combined-label">
        {describeCombined({ theme, draft, bumpDraft })}
      </p>
      <p className="advanced-ts-draft">
        草稿 <strong data-testid="combined-draft">{draft}</strong>
      </p>
      <p className="advanced-ts-action">
        Action <strong data-testid="combined-action">{actionStatus}</strong>
      </p>
      <div className="advanced-ts-actions">
        <button
          type="button"
          data-testid="combined-bump"
          disabled={typeof bumpDraft !== 'function'}
          onClick={() => {
            if (typeof bumpDraft === 'function') {
              bumpDraft()
            }
          }}
        >
          增加草稿
        </button>
        <button
          type="button"
          data-testid="combined-replace"
          onClick={() => {
            useCombinedStore.setState({ theme: '浅色', draft: 0 }, true)
          }}
        >
          replace 重置
        </button>
      </div>
    </section>
  )
}

/** 观察手写 create 泛型：浅合并重置只改数据字段。 */
function TypedPane() {
  const draft = useTypedStore((state) => state.draft)
  const bumpDraft = useTypedStore((state) => state.bumpDraft)
  const actionStatus = typeof bumpDraft === 'function' ? '仍在' : '已丢失'

  return (
    <section className="advanced-ts-pane" data-testid="typed-pane">
      <h3>create&lt;EditorStore&gt;()</h3>
      <p className="advanced-ts-draft">
        草稿 <strong data-testid="typed-draft">{draft}</strong>
      </p>
      <p className="advanced-ts-action">
        Action <strong data-testid="typed-action">{actionStatus}</strong>
      </p>
      <div className="advanced-ts-actions">
        <button type="button" data-testid="typed-bump" onClick={bumpDraft}>
          增加草稿
        </button>
        <button
          type="button"
          data-testid="typed-merge"
          onClick={() => {
            useTypedStore.setState({ theme: '浅色', draft: 0 })
          }}
        >
          浅合并重置
        </button>
      </div>
    </section>
  )
}

/** 观察 vanilla api 收成 bounded Hook 后的选择写法。 */
function VanillaPane() {
  const draft = useVanillaEditorStore((state) => state.draft)
  const bumpDraft = useVanillaEditorStore((state) => state.bumpDraft)
  const actionStatus = typeof bumpDraft === 'function' ? '仍在' : '已丢失'

  return (
    <section className="advanced-ts-pane" data-testid="vanilla-pane">
      <h3>bounded useStore</h3>
      <p className="advanced-ts-draft">
        草稿 <strong data-testid="vanilla-draft">{draft}</strong>
      </p>
      <p className="advanced-ts-action">
        Action <strong data-testid="vanilla-action">{actionStatus}</strong>
      </p>
      <div className="advanced-ts-actions">
        <button type="button" data-testid="vanilla-bump" onClick={bumpDraft}>
          增加草稿
        </button>
        <button
          type="button"
          data-testid="vanilla-merge"
          onClick={() => {
            vanillaEditorStore.setState({ theme: '浅色', draft: 0 })
          }}
        >
          浅合并重置
        </button>
      </div>
    </section>
  )
}

/** 对照 combine 的 replace、手写泛型的浅合并，以及 bounded Hook。 */
function AdvancedTypescriptDemo() {
  return (
    <section className="advanced-ts-demo" data-testid="advanced-typescript-demo">
      <header className="advanced-ts-heading">
        <p>Zustand TypeScript</p>
        <h2>combine 推断会放过 replace，手写泛型用浅合并保住 Action</h2>
        <span>
          左侧用 combine。点 replace 重置后 Action 变成已丢失，增加草稿不可用。中间手写
          EditorStore，浅合并重置后 Action 仍在。右侧把 vanilla api 收成 bounded Hook，选择写法与
          create 相同。
        </span>
      </header>

      <div className="advanced-ts-panes">
        <CombinedPane />
        <TypedPane />
        <VanillaPane />
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供高级 TypeScript 观察组件。 */
export function createAdvancedTypescriptDemo(): ComponentType {
  return AdvancedTypescriptDemo
}
