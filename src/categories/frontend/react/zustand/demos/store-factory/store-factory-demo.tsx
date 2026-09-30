import { createStore, useStore } from 'zustand'
import { type ComponentType, type ReactNode, createContext, useContext, useState } from 'react'

import './store-factory-demo.css'

type EditorProps = {
  name: string
  draft: number
}

type EditorStore = EditorProps & {
  bumpDraft: () => void
}

type EditorApi = ReturnType<typeof createEditorStore>

const EditorContext = createContext<EditorApi | null>(null)

/** 按初始名称和草稿创建一份独立的编辑器 StoreApi。 */
function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    name: '未命名',
    draft: 0,
  }
  return createStore<EditorStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    /** 增加当前实例的草稿计数。 */
    bumpDraft: () => set({ draft: get().draft + 1 }),
  }))
}

/** 用 useState 初始化器留下当前这份 api，再注入子树。 */
function EditorProvider({ name, draft = 0, children }: EditorProps & { children: ReactNode }) {
  const [store] = useState(() => createEditorStore({ name, draft }))
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}

/** 取出当前子树的 api；没有 Provider 时返回 null。 */
function useEditorApi() {
  return useContext(EditorContext)
}

/** 先取出 api，再按选择函数订阅；没有 Provider 时抛错。 */
function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const store = useEditorApi()
  if (!store) {
    throw new Error('缺少 EditorContext.Provider')
  }
  return useStore(store, selector)
}

/** 显示当前实例的名称和草稿。 */
function EditorPane({ testId }: { testId: string }) {
  const name = useEditorStore((state) => state.name)
  const draft = useEditorStore((state) => state.draft)
  const store = useEditorApi()

  return (
    <section className="factory-pane" data-testid={`${testId}-editor`}>
      <h3 data-testid={`${testId}-name`}>{name}</h3>
      <p className="factory-draft">
        草稿 <strong data-testid={`${testId}-draft`}>{draft}</strong>
      </p>
      <div className="factory-actions">
        <button
          type="button"
          onClick={() => {
            store?.getState().bumpDraft()
          }}
        >
          增加草稿
        </button>
      </div>
    </section>
  )
}

/** 展示同一创建函数造出的两份实例，以及换 key 才会用新 props 重建。 */
function StoreFactoryDemo() {
  const [templateName, setTemplateName] = useState('文稿丙')
  const [leftKey, setLeftKey] = useState(0)

  return (
    <section className="factory-demo" data-testid="store-factory-demo">
      <header className="factory-heading">
        <p>Zustand store factory</p>
        <h2>创建函数每次调用造一份 StoreApi</h2>
        <span>
          左右各调一次创建函数。增加左侧草稿不会改右侧。改模板名称不会改已有实例；按模板重建左侧才会换一份
          api。
        </span>
      </header>

      <div className="factory-toolbar">
        <label>
          模板名称
          <input
            data-testid="template-name"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
          />
        </label>
        <button
          type="button"
          data-testid="rebuild-left"
          onClick={() => setLeftKey((value) => value + 1)}
        >
          按模板重建左侧
        </button>
      </div>

      <div className="factory-panes">
        <EditorProvider key={leftKey} name={leftKey === 0 ? '文稿甲' : templateName} draft={0}>
          <EditorPane testId="left" />
        </EditorProvider>
        <EditorProvider name="文稿乙" draft={2}>
          <EditorPane testId="right" />
        </EditorProvider>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Store Factory 观察组件。 */
export function createStoreFactoryDemo(): ComponentType {
  return StoreFactoryDemo
}
