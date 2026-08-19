import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import './state-ownership-boundary-demo.css'

interface ReviewDocument {
  id: string
  title: string
  summary: string
}

type ReviewMode = 'reading' | 'commenting'

interface ReviewModeValue {
  mode: ReviewMode
  setMode: Dispatch<SetStateAction<ReviewMode>>
}

const reviewDocuments: readonly ReviewDocument[] = [
  {
    id: 'ownership',
    title: '所有权说明',
    summary: '每一份 State 都由一个明确组件拥有。',
  },
  {
    id: 'props',
    title: 'Props 路径',
    summary: '附近组件通过值 Props 和事件回调协调。',
  },
  {
    id: 'context',
    title: 'Context 路径',
    summary: 'Provider 让深层后代越过无关布局读取数据。',
  },
]

const ReviewModeContext = createContext<ReviewModeValue | null>(null)

/** 读取最近审阅模式 Provider 的值，并暴露缺失边界。 */
function useReviewMode(): ReviewModeValue {
  const value = useContext(ReviewModeContext)
  if (value === null) throw new Error('useReviewMode 必须在 ReviewModeProvider 内使用')
  return value
}

/** 把只影响当前编辑器的帮助开关保留为局部 State。 */
function InlineHelp() {
  const [open, setOpen] = useState(false)

  /** 切换当前帮助区域，不影响其他 State owner。 */
  function handleToggle() {
    setOpen((current) => !current)
  }

  return (
    <section className="react-boundary-example" aria-labelledby="react-boundary-local-title">
      <header>
        <span>01 / 局部</span>
        <h3 id="react-boundary-local-title">只有一个组件需要</h3>
        <p>帮助开关只影响当前编辑器，因此 State 留在组件内部。</p>
      </header>

      <div className="react-boundary-local-panel">
        <div>
          <strong>审阅备注</strong>
          <p>这里是当前文档的独立编辑区域。</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="react-boundary-local-help"
          data-testid="boundary-local-toggle"
          onClick={handleToggle}
        >
          {open ? '收起帮助' : '展开帮助'}
        </button>
      </div>

      <p
        id="react-boundary-local-help"
        className="react-boundary-local-help"
        data-testid="boundary-local-status"
        hidden={!open}
      >
        这段说明没有其他消费者，不需要提升或进入 Context。
      </p>
    </section>
  )
}

interface DocumentListProps {
  documents: readonly ReviewDocument[]
  selectedId: string
  onSelect: (id: string) => void
}

/** 通过 Props 显示共享选择，并把点击意图交回 State owner。 */
function DocumentList({ documents, selectedId, onSelect }: DocumentListProps) {
  return (
    <div className="react-boundary-document-list" aria-label="审阅文档">
      {documents.map((document) => (
        <button
          key={document.id}
          type="button"
          aria-pressed={document.id === selectedId}
          data-testid={`boundary-document-${document.id}`}
          onClick={() => onSelect(document.id)}
        >
          {document.title}
        </button>
      ))}
    </div>
  )
}

/** 显示共同父组件计算出的当前文档，不保存选择副本。 */
function DocumentPreview({ document }: { document: ReviewDocument }) {
  return (
    <article className="react-boundary-document-preview" aria-live="polite">
      <span>兄弟组件读取同一选择</span>
      <strong data-testid="boundary-preview-title">{document.title}</strong>
      <p>{document.summary}</p>
      <code data-testid="boundary-preview-id">selectedId: {document.id}</code>
    </article>
  )
}

/** 在两个兄弟组件的最近共同父级拥有唯一文档选择。 */
function ReviewWorkspace() {
  const [selectedId, setSelectedId] = useState(reviewDocuments[0]!.id)
  const selectedDocument =
    reviewDocuments.find((document) => document.id === selectedId) ?? reviewDocuments[0]!

  /** 把共享选择恢复为确定的初始文档。 */
  function handleReset() {
    setSelectedId(reviewDocuments[0]!.id)
  }

  return (
    <section className="react-boundary-example" aria-labelledby="react-boundary-lifted-title">
      <header>
        <span>02 / 提升</span>
        <h3 id="react-boundary-lifted-title">附近兄弟需要同一事实</h3>
        <p>最近共同父组件拥有选择，值向下传递，点击意图向上返回。</p>
      </header>

      <div className="react-boundary-shared-layout">
        <div>
          <DocumentList
            documents={reviewDocuments}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <button className="react-boundary-reset" type="button" onClick={handleReset}>
            重置选择
          </button>
        </div>
        <DocumentPreview document={selectedDocument} />
      </div>
    </section>
  )
}

/** 在审阅功能子树内拥有模式 State，并通过 Context 提供当前值与更新入口。 */
function ReviewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ReviewMode>('reading')
  return <ReviewModeContext value={{ mode, setMode }}>{children}</ReviewModeContext>
}

/** 从深层工具栏读取 Context，并切换同一 Provider 拥有的模式。 */
function DeepModeToolbar() {
  const { mode, setMode } = useReviewMode()

  return (
    <div className="react-boundary-mode-picker" aria-label="审阅模式">
      <button
        type="button"
        aria-pressed={mode === 'reading'}
        data-testid="boundary-mode-reading"
        onClick={() => setMode('reading')}
      >
        阅读
      </button>
      <button
        type="button"
        aria-pressed={mode === 'commenting'}
        data-testid="boundary-mode-commenting"
        onClick={() => setMode('commenting')}
      >
        批注
      </button>
    </div>
  )
}

/** 从同一深层 Context 显示当前模式，证明消费者无需逐层接收 Props。 */
function DeepReviewSummary() {
  const { mode } = useReviewMode()
  const description =
    mode === 'reading' ? '专注阅读，不显示批注工具。' : '批注工具已对审阅子树开放。'

  return (
    <div className="react-boundary-mode-summary" aria-live="polite">
      <span>深层摘要读取</span>
      <strong data-testid="boundary-mode-summary">
        {mode === 'reading' ? '阅读模式' : '批注模式'}
      </strong>
      <p>{description}</p>
    </div>
  )
}

/** 模拟不理解审阅模式的中间布局，只负责组织 children。 */
function ReviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="react-boundary-context-layout">
      <div className="react-boundary-layout-label">WorkspaceShell / 未接收 mode Props</div>
      {children}
    </div>
  )
}

/** 展示 Provider 外不读取审阅模式的独立工作区工具。 */
function OutsideWorkspacePreview() {
  return (
    <aside className="react-boundary-outside" aria-label="Provider 外独立工作区工具">
      <span>Provider 外 / 独立工具</span>
      <strong data-testid="boundary-outside-status">常规视图</strong>
      <p>未读取审阅模式，切换上方模式时保持不变。</p>
    </aside>
  )
}

/** 把审阅模式限定在明确 Provider 子树，并组合两个深层消费者。 */
function ContextWorkspace() {
  return (
    <section className="react-boundary-example" aria-labelledby="react-boundary-context-title">
      <header>
        <span>03 / Context</span>
        <h3 id="react-boundary-context-title">深层后代穿过无关布局</h3>
        <p>Provider 仍拥有 State，Context 只把它送到审阅子树中的深层消费者。</p>
      </header>

      <ReviewModeProvider>
        <ReviewLayout>
          <DeepModeToolbar />
          <DeepReviewSummary />
        </ReviewLayout>
      </ReviewModeProvider>

      <OutsideWorkspacePreview />
    </section>
  )
}

/** 展示局部、提升与 Context 三种最小 State 所有权边界。 */
export default function StateOwnershipBoundaryDemo() {
  return (
    <section className="react-boundary-demo" data-testid="react-state-sharing-boundary-demo">
      <header className="react-boundary-heading">
        <p>State ownership map</p>
        <h2>文档审阅工作区</h2>
        <span>从真实消费者出发，为每一份 State 选择最小可解释边界。</span>
      </header>

      <div className="react-boundary-examples">
        <InlineHelp />
        <ReviewWorkspace />
        <ContextWorkspace />
      </div>
    </section>
  )
}
