import { type ChangeEvent, type ComponentType } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  createMemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
  useSearchParams,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './documentation-center-demo.css'

type DocumentationLanguage = 'zh' | 'en'
type DocumentView = 'article' | 'outline'

type DocumentationPage = {
  id: string
  title: string
  summary: string
  outline: readonly string[]
}

type DocumentationSection = {
  id: string
  title: string
  summary: string
  documents: readonly DocumentationPage[]
}

type DocumentationState = {
  from: string
  label: string
}

const sections: readonly DocumentationSection[] = [
  {
    id: 'foundations',
    title: '路由基础',
    summary: '从 URL、匹配分支和 Outlet 的关系建立文档站导航模型。',
    documents: [
      {
        id: 'route-tree',
        title: '设计路由树',
        summary: '把产品页面层级翻译成 parent、child 与 index route。',
        outline: ['识别共享外框', '划分 URL segment', '确认默认 child'],
      },
      {
        id: 'relative-links',
        title: '使用相对链接',
        summary: '让章节内部链接跟随 route hierarchy，而不是重复完整前缀。',
        outline: ['确定 route 上下文', '选择 route 或 path', '检查生成 href'],
      },
      {
        id: 'url-state',
        title: '安排 URL 状态',
        summary: '按恢复能力拆分 pathname、search 与 location state。',
        outline: ['资源身份放 pathname', '可分享视图放 search', '短期来源放 state'],
      },
    ],
  },
  {
    id: 'delivery',
    title: '交付检查',
    summary: '用深链、history 和未知路径检查文档中心的路由边界。',
    documents: [
      {
        id: 'deep-links',
        title: '验证深链',
        summary: '从独立入口打开章节和文档，确认页面不依赖前序点击。',
        outline: ['准备直接入口', '验证参数', '提供恢复链接'],
      },
      {
        id: 'history-entries',
        title: '检查历史记录',
        summary: '区分新 entry、替换当前 entry 与恢复旧 entry。',
        outline: ['观察 action', '比较 key', '限制 delta 返回'],
      },
    ],
  },
]

const initialEntry = '/docs/guides/foundations?q=路由'
const defaultSectionUrl = '/docs/guides/foundations'

/** 把可选语言参数转换成文档中心支持的语言。 */
function readLanguage(value: string | undefined): DocumentationLanguage | null {
  if (value === undefined || value === 'zh') return 'zh'
  return value === 'en' ? 'en' : null
}

/** 按稳定章节 ID 查找本地章节。 */
function findSection(sectionId: string | undefined): DocumentationSection | undefined {
  return sections.find((section) => section.id === sectionId)
}

/** 按章节与文档 ID 查找本地文档。 */
function findDocument(
  section: DocumentationSection | undefined,
  documentId: string | undefined,
): DocumentationPage | undefined {
  return section?.documents.find((document) => document.id === documentId)
}

/** 校验当前 history entry 中的短期来源信息。 */
function readDocumentationState(value: unknown): DocumentationState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<DocumentationState>
  if (typeof state.from !== 'string' || typeof state.label !== 'string') return null
  return { from: state.from, label: state.label }
}

/** 只接受文档中心内部的章节来源 URL。 */
function readSafeSectionUrl(state: DocumentationState | null): string | null {
  if (!state) return null
  return /^\/docs\/(?:zh\/|en\/)?guides\/[a-z-]+(?:\?q=[^#]*)?$/.test(state.from)
    ? state.from
    : null
}

/** 展示当前内存 Router 的 Location 与 history action。 */
function DocumentationRouteStatus() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const state = readDocumentationState(location.state)

  return (
    <section className="documentation-status" aria-label="当前路由状态">
      <div>
        <span>pathname</span>
        <strong data-testid="documentation-path">{location.pathname}</strong>
      </div>
      <div>
        <span>search</span>
        <strong data-testid="documentation-search">{location.search || '（空）'}</strong>
      </div>
      <div>
        <span>action</span>
        <strong data-testid="documentation-action">{navigationType}</strong>
      </div>
      <div>
        <span>key</span>
        <strong data-testid="documentation-key">{location.key}</strong>
      </div>
      <div>
        <span>state.from</span>
        <strong data-testid="documentation-state-from">{state?.from ?? '（无）'}</strong>
      </div>
    </section>
  )
}

/** 提供不增加 URL segment 的演示外框。 */
function DocumentationWorkshopFrame() {
  return (
    <section className="documentation-workshop-frame">
      <Outlet />
      <footer>独立 Memory Router · 外层学习站 URL 保持不变</footer>
    </section>
  )
}

/** 提供文档中心根布局、全局导航和第一个 Outlet。 */
function DocumentationLayout() {
  return (
    <section className="documentation-shell">
      <header className="documentation-header">
        <div>
          <p>Route handbook</p>
          <h2>嵌套文档中心</h2>
        </div>
        <nav aria-label="文档中心导航">
          <NavLink to="/docs" end>
            文档首页
          </NavLink>
          <NavLink to={defaultSectionUrl}>指南</NavLink>
          <NavLink to="/docs/archive/2025/release-notes">归档</NavLink>
        </nav>
      </header>

      <DocumentationRouteStatus />

      <main className="documentation-root-outlet">
        <Outlet />
      </main>
    </section>
  )
}

/** 渲染文档中心索引页并提供明确入口。 */
function DocumentationHomePage() {
  return (
    <section className="documentation-home">
      <p className="documentation-eyebrow">文档入口</p>
      <h1>从章节进入文档</h1>
      <p>根索引页只负责说明信息架构；章节布局负责目录，文档页负责具体内容。</p>
      <div className="documentation-actions">
        <Link to={defaultSectionUrl}>打开路由基础</Link>
        <Link to="/docs/en/guides/delivery">查看英文交付章节</Link>
      </div>
    </section>
  )
}

/** 提供语言与章节共享 UI，并通过第二个 Outlet 渲染默认页或文档页。 */
function GuideSectionLayout() {
  const { language: rawLanguage, sectionId } = useParams()
  const language = readLanguage(rawLanguage)
  const section = findSection(sectionId)
  const location = useLocation()

  if (!language || !section) {
    return (
      <section className="documentation-empty" data-testid="documentation-section-missing">
        <p className="documentation-eyebrow">未知章节</p>
        <h1>找不到这个文档章节</h1>
        <p>URL 已进入指南分支，但语言或章节 ID 不属于当前文档集合。</p>
        <Link to={defaultSectionUrl}>返回默认章节</Link>
      </section>
    )
  }

  const languagePrefix = rawLanguage ? `/${language}` : ''
  const sectionRootUrl = `/docs${languagePrefix}/guides/${section.id}`
  const sectionSourceState: DocumentationState | undefined =
    location.pathname === sectionRootUrl
      ? { from: `${location.pathname}${location.search}`, label: section.title }
      : undefined

  return (
    <section className="documentation-section-layout">
      <aside>
        <p className="documentation-eyebrow">{language === 'zh' ? '中文指南' : 'English guide'}</p>
        <h1>{section.title}</h1>
        <p>{section.summary}</p>

        <nav aria-label={`${section.title}目录`}>
          <NavLink to="." end relative="route">
            章节总览
          </NavLink>
          {section.documents.map((document) => (
            <NavLink key={document.id} to={document.id} relative="route" state={sectionSourceState}>
              {document.title}
            </NavLink>
          ))}
        </nav>

        <div className="documentation-language-links" aria-label="语言版本">
          <Link to={`/docs/guides/${section.id}`}>中文</Link>
          <Link to={`/docs/en/guides/${section.id}`}>English</Link>
        </div>
      </aside>

      <div className="documentation-section-outlet" data-testid="documentation-section-outlet">
        <Outlet />
      </div>
    </section>
  )
}

/** 从 search 读取筛选词并渲染章节的 Index Route 内容。 */
function SectionOverviewPage() {
  const { sectionId } = useParams()
  const section = findSection(sectionId)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const visibleDocuments = section
    ? section.documents.filter((document) =>
        `${document.title}${document.summary}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
      )
    : []

  /** 把可分享筛选词写回当前章节 URL，并替换本次输入 entry。 */
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextQuery = event.currentTarget.value
    const nextParams = new URLSearchParams(searchParams)
    if (nextQuery) nextParams.set('q', nextQuery)
    else nextParams.delete('q')
    void setSearchParams(nextParams, { replace: true })
  }

  if (!section) return null

  const sectionUrl = `${location.pathname}${location.search}`

  return (
    <section className="documentation-overview" data-testid="documentation-overview">
      <p className="documentation-eyebrow">章节 Index Route</p>
      <h2>章节总览</h2>
      <label htmlFor="documentation-query">筛选当前章节</label>
      <input
        id="documentation-query"
        data-testid="documentation-query"
        type="search"
        value={query}
        onChange={handleQueryChange}
        placeholder="输入标题或摘要"
      />
      <p aria-live="polite" data-testid="documentation-result-count">
        找到 {visibleDocuments.length} 篇文档
      </p>
      <div className="documentation-document-list">
        {visibleDocuments.map((document) => (
          <article key={document.id}>
            <h3>{document.title}</h3>
            <p>{document.summary}</p>
            <Link
              to={document.id}
              relative="route"
              state={{ from: sectionUrl, label: section.title } satisfies DocumentationState}
            >
              阅读文档
            </Link>
          </article>
        ))}
      </div>
      <div className="documentation-actions">
        <Link to="missing-document" relative="route">
          检查未知文档
        </Link>
      </div>
    </section>
  )
}

/** 渲染继承语言与章节参数的动态文档页。 */
function DocumentPage() {
  const { language: rawLanguage, sectionId, documentId } = useParams()
  const language = readLanguage(rawLanguage)
  const section = findSection(sectionId)
  const document = findDocument(section, documentId)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const state = readDocumentationState(location.state)
  const safeSectionUrl = readSafeSectionUrl(state)
  const view: DocumentView = searchParams.get('view') === 'outline' ? 'outline' : 'article'

  /** 在同一 pathname 上替换文档视图 search。 */
  function handleViewChange(nextView: DocumentView): void {
    const nextParams = new URLSearchParams(searchParams)
    if (nextView === 'article') nextParams.delete('view')
    else nextParams.set('view', nextView)
    void setSearchParams(nextParams, { replace: true, state: state ?? undefined })
  }

  /** 只在已验证来源 entry 存在时执行 delta 返回。 */
  async function handleHistoryBack(): Promise<void> {
    if (!safeSectionUrl) return
    await navigate(-1)
  }

  if (!language || !section || !document) {
    return (
      <section className="documentation-empty" data-testid="documentation-document-missing">
        <p className="documentation-eyebrow">未知文档</p>
        <h2>文档不存在</h2>
        <p>动态 route 已匹配，但当前章节中没有对应的文档 ID。</p>
        <Link to=".." relative="route">
          返回章节总览
        </Link>
      </section>
    )
  }

  return (
    <article className="documentation-article" data-testid="documentation-article">
      <p className="documentation-eyebrow">{language === 'zh' ? '中文文档' : 'English document'}</p>
      <h2>{document.title}</h2>
      <p>{document.summary}</p>

      <div className="documentation-view-switch" aria-label="文档视图">
        <button
          type="button"
          aria-pressed={view === 'article'}
          onClick={() => handleViewChange('article')}
        >
          正文
        </button>
        <button
          type="button"
          aria-pressed={view === 'outline'}
          onClick={() => handleViewChange('outline')}
        >
          大纲
        </button>
      </div>

      {view === 'article' ? (
        <section className="documentation-reading">
          <h3>当前路由上下文</h3>
          <dl>
            <div>
              <dt>language</dt>
              <dd>{language}</dd>
            </div>
            <div>
              <dt>sectionId</dt>
              <dd>{section.id}</dd>
            </div>
            <div>
              <dt>documentId</dt>
              <dd>{document.id}</dd>
            </div>
            <div>
              <dt>进入来源</dt>
              <dd>{state?.label ?? '直接访问'}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <ol className="documentation-outline" data-testid="documentation-outline">
          {document.outline.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )}

      <div className="documentation-actions">
        {safeSectionUrl ? (
          <button
            type="button"
            data-testid="documentation-history-back"
            onClick={handleHistoryBack}
          >
            返回筛选结果
          </button>
        ) : (
          <Link to=".." relative="route">
            返回章节总览
          </Link>
        )}
        <Link to=".." relative="route">
          查看章节默认页
        </Link>
      </div>
    </article>
  )
}

/** 渲染 archive splat 捕获的剩余路径。 */
function DocumentationArchivePage() {
  const { '*': archivePath } = useParams()

  return (
    <section className="documentation-archive" data-testid="documentation-archive">
      <p className="documentation-eyebrow">归档路径</p>
      <h1>文档归档</h1>
      <p>archive/* 保留后续任意层级，当前 splat 为：</p>
      <strong data-testid="documentation-splat">{archivePath || '（空）'}</strong>
      <div className="documentation-actions">
        <Link to="/docs/archive/2024/migration/v7">打开另一条归档深链</Link>
        <Link to={defaultSectionUrl}>返回指南</Link>
      </div>
    </section>
  )
}

/** 为 docs 子树内未匹配的路径提供恢复入口。 */
function DocumentationNotFoundPage() {
  const location = useLocation()

  return (
    <section className="documentation-empty" data-testid="documentation-not-found">
      <p className="documentation-eyebrow">未匹配路径</p>
      <h1>文档路径不存在</h1>
      <p className="documentation-mono">{location.pathname}</p>
      <Link to="/docs">返回文档首页</Link>
    </section>
  )
}

const routes = [
  {
    id: 'workshop-frame',
    Component: DocumentationWorkshopFrame,
    children: [
      {
        id: 'documentation',
        path: '/docs',
        Component: DocumentationLayout,
        children: [
          { id: 'documentation-index', index: true, Component: DocumentationHomePage },
          {
            id: 'guide-section',
            path: ':language?/guides/:sectionId',
            Component: GuideSectionLayout,
            children: [
              { id: 'section-index', index: true, Component: SectionOverviewPage },
              { id: 'document', path: ':documentId', Component: DocumentPage },
            ],
          },
          { id: 'archive', path: 'archive/*', Component: DocumentationArchivePage },
          { id: 'documentation-not-found', path: '*', Component: DocumentationNotFoundPage },
        ],
      },
    ],
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建独立的嵌套文档中心内存 history。 */
export function createDocumentationCenterDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  })

  /** 挂载文档中心自己的 RouterProvider。 */
  function DocumentationCenterDemo() {
    return (
      <section className="documentation-center-demo" data-testid="documentation-center-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return DocumentationCenterDemo
}
