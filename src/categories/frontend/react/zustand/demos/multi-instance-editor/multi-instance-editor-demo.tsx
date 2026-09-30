import { createStore, useStore, type StateCreator } from 'zustand'
import { type ComponentType, type ReactNode, createContext, useContext, useState } from 'react'

import './multi-instance-editor-demo.css'

type EditorProps = {
  title: string
  body: string
}

type DocumentSlice = EditorProps & {
  appendLine: () => void
}

type CommandSlice = {
  resetEditor: () => void
}

type EditorStore = DocumentSlice & CommandSlice

type EditorApi = ReturnType<typeof createEditorStore>

const EditorContext = createContext<EditorApi | null>(null)

/** 用初始标题和正文构造正文切片。 */
function createDocumentSlice(
  initial: EditorProps,
): StateCreator<EditorStore, [], [], DocumentSlice> {
  return (set, get) => ({
    ...initial,
    /** 在当前正文末尾追加一行。 */
    appendLine: () => set({ body: `${get().body}新增一行。` }),
  })
}

/** 按当前实例的初始快照整份重置。 */
const createCommandSlice: StateCreator<EditorStore, [], [], CommandSlice> = (
  _set,
  _get,
  store,
) => ({
  /** 用创建时的快照替换当前实例。 */
  resetEditor: () => store.setState(store.getInitialState(), true),
})

/** 按初始标题和正文创建一份独立的编辑器 StoreApi。 */
function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    title: '未命名',
    body: '',
  }
  const initial = { ...DEFAULT_PROPS, ...initProps }
  return createStore<EditorStore>()((...args) => ({
    ...createDocumentSlice(initial)(...args),
    ...createCommandSlice(...args),
  }))
}

/** 用 useState 初始化器留下当前这份 api，再注入子树。 */
function EditorProvider({ title, body = '', children }: EditorProps & { children: ReactNode }) {
  const [store] = useState(() => createEditorStore({ title, body }))
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

/** 把是否改过写成是或否。 */
function formatDirty(dirty: boolean) {
  return dirty ? '是' : '否'
}

/** 展示一份独立编辑器的标题、正文、字数和说明。 */
function EditorPane({ testId }: { testId: string }) {
  const title = useEditorStore((state) => state.title)
  const body = useEditorStore((state) => state.body)
  const appendLine = useEditorStore((state) => state.appendLine)
  const resetEditor = useEditorStore((state) => state.resetEditor)
  const store = useEditorApi()
  const [helpOpen, setHelpOpen] = useState(false)
  const length = body.length
  const dirty = Boolean(store && body !== store.getInitialState().body)

  return (
    <section className="multi-editor-pane" data-testid={`${testId}-editor`}>
      <h3 data-testid={`${testId}-title`}>{title}</h3>
      <p>
        正文 <strong data-testid={`${testId}-body`}>{body || '空'}</strong>
      </p>
      <p>
        字数 <strong data-testid={`${testId}-length`}>{length}</strong>
      </p>
      <p>
        已改 <strong data-testid={`${testId}-dirty`}>{formatDirty(dirty)}</strong>
      </p>
      <p data-testid={`${testId}-help`}>{helpOpen ? '说明已打开' : '说明已收起'}</p>
      <div className="multi-editor-actions">
        <button type="button" data-testid={`${testId}-append`} onClick={appendLine}>
          追加一行
        </button>
        <button type="button" data-testid={`${testId}-reset`} onClick={resetEditor}>
          重置本文稿
        </button>
        <button
          type="button"
          data-testid={`${testId}-toggle-help`}
          onClick={() => setHelpOpen((open) => !open)}
        >
          {helpOpen ? '收起说明' : '打开说明'}
        </button>
      </div>
    </section>
  )
}

/** 对照左右两份独立编辑器。 */
function MultiInstanceEditorDemo() {
  return (
    <section className="multi-editor-demo" data-testid="multi-instance-editor-demo">
      <header className="multi-editor-heading">
        <p>Zustand 多实例编辑器</p>
        <h2>左右各一份 StoreApi，追加和重置互不影响</h2>
        <span>
          左侧从空正文追加一行，右侧仍是已有一句。重置左侧只清空左侧，打开过的说明不会被关掉。
        </span>
      </header>

      <div className="multi-editor-panes">
        <EditorProvider title="文稿甲" body="">
          <EditorPane testId="left" />
        </EditorProvider>
        <EditorProvider title="文稿乙" body="已有一句。">
          <EditorPane testId="right" />
        </EditorProvider>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供多实例编辑器观察组件。 */
export function createMultiInstanceEditorDemo(): ComponentType {
  return MultiInstanceEditorDemo
}
