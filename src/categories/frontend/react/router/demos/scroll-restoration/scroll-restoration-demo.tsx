import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useNavigation,
  useNavigationType,
  type Location,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './scroll-restoration-demo.css'

const scrollStorageKey = 'react-router-scroll-restoration-demo'

type KeyMode = 'entry' | 'pathname'

const catalogItems = Array.from({ length: 36 }, (_, index) => ({
  id: index + 1,
  title: `课程资料条目 ${String(index + 1).padStart(2, '0')}`,
  summary:
    index % 3 === 0
      ? '保留当前阅读上下文，适合从长列表进入详情后再返回。'
      : '这是一段用于制造真实页面高度的目录摘要，帮助观察窗口滚动位置。',
}))

const helpSections = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  title: `滚动恢复说明 ${String(index + 1).padStart(2, '0')}`,
  body: '新页面导航通常从顶部开始；前进或后退时，Data Router 会尝试恢复对应历史条目的位置。',
}))

/** 按 pathname 归并滚动位置，用于比较同一路径不同查询参数的行为。 */
function getPathnameKey(location: Location): string {
  return location.pathname
}

/** 在 Demo 挂载期间将宽屏课程阅读区切换为页面滚动，确保 ScrollRestoration 使用窗口合同。 */
function usePageScrollContainer(): HTMLElement | null {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const demoContainer = document.querySelector<HTMLElement>('.react-demo-container')
    const readingContainer = demoContainer?.closest<HTMLElement>('.lesson-main') ?? null
    const layoutContainer = readingContainer?.closest<HTMLElement>('.content-layout') ?? null

    if (!readingContainer || !layoutContainer) return

    const original = {
      layoutHeight: layoutContainer.style.height,
      layoutOverflow: layoutContainer.style.overflow,
      readingHeight: readingContainer.style.height,
      readingOverflowY: readingContainer.style.overflowY,
    }

    layoutContainer.style.height = 'auto'
    layoutContainer.style.overflow = 'visible'
    readingContainer.style.height = 'auto'
    readingContainer.style.overflowY = 'visible'
    setScrollContainer(readingContainer)

    return () => {
      layoutContainer.style.height = original.layoutHeight
      layoutContainer.style.overflow = original.layoutOverflow
      readingContainer.style.height = original.readingHeight
      readingContainer.style.overflowY = original.readingOverflowY
      setScrollContainer(null)
    }
  }, [])

  return scrollContainer
}

/** 订阅窗口滚动并返回当前 scrollY，避免组件自行实现恢复逻辑。 */
function useWindowScrollY(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    /** 同步观察值，不改变 Router 的滚动策略。 */
    function updateScrollY(): void {
      setScrollY(window.scrollY)
    }

    updateScrollY()
    window.addEventListener('scroll', updateScrollY, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollY)
  }, [])

  return scrollY
}

/** 渲染目录页，提供普通导航、preventScrollReset 和 hash 三种滚动意图。 */
function CatalogPage(): ReactElement {
  const location = useLocation()
  const view = new URLSearchParams(location.search).get('view') ?? 'all'

  return (
    <article className="scroll-restoration-page">
      <header className="scroll-restoration-page-heading">
        <p className="scroll-restoration-eyebrow">Catalog route</p>
        <h2>长列表目录</h2>
        <p>
          当前视图：<strong>{view === 'compact' ? '紧凑摘要' : '完整摘要'}</strong>
          。先向下滚动，再使用下面的链接观察 新导航和历史恢复的区别。
        </p>
        <nav className="scroll-restoration-links" aria-label="目录导航">
          <Link to="?view=all">默认切换完整摘要</Link>
          <Link to="?view=compact" preventScrollReset>
            保持位置切换紧凑摘要
          </Link>
          <Link to="/catalog?view=all#catalog-notes">跳到目录锚点</Link>
        </nav>
      </header>

      <nav className="scroll-restoration-route-control" aria-label="目录快捷操作">
        <Link to="/help">进入帮助页并默认回顶</Link>
      </nav>

      <ol className="scroll-restoration-list">
        {catalogItems.map((item) => (
          <li key={item.id}>
            <div>
              <span className="scroll-restoration-item-index">
                {String(item.id).padStart(2, '0')}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </div>
            <span className="scroll-restoration-item-state">
              {view === 'compact' ? '摘要' : '完整'}
            </span>
          </li>
        ))}
      </ol>

      <section id="catalog-notes" className="scroll-restoration-anchor">
        <p className="scroll-restoration-eyebrow">Hash target</p>
        <h3>目录底部锚点</h3>
        <p>目标元素在导航完成后存在，ScrollRestoration 可以调用 scrollIntoView 定位到这里。</p>
      </section>
    </article>
  )
}

/** 渲染高度足够的帮助页，让新页面回顶与 POP 恢复可被直接对照。 */
function HelpPage(): ReactElement {
  return (
    <article className="scroll-restoration-page">
      <header className="scroll-restoration-page-heading">
        <p className="scroll-restoration-eyebrow">Help route</p>
        <h2>帮助页</h2>
        <p>
          这是另一条拥有独立历史 entry 的页面。进入时默认回顶，返回目录时应恢复目录离开前的位置。
        </p>
        <nav className="scroll-restoration-links" aria-label="帮助页导航">
          <Link to="/catalog?view=all">返回目录</Link>
          <Link to="/catalog?view=all#catalog-notes">返回目录锚点</Link>
        </nav>
      </header>

      <ol className="scroll-restoration-list scroll-restoration-help-list">
        {helpSections.map((section) => (
          <li key={section.id}>
            <div>
              <span className="scroll-restoration-item-index">
                {String(section.id).padStart(2, '0')}
              </span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}

/** 渲染全局观察台，展示 location、导航类型、key 策略和窗口滚动值。 */
function ScrollRestorationShell({
  keyMode,
  onKeyModeChange,
}: {
  keyMode: KeyMode
  onKeyModeChange: (mode: KeyMode) => void
}): ReactElement {
  const location = useLocation()
  const navigation = useNavigation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  usePageScrollContainer()
  const scrollY = useWindowScrollY()
  const keyLabel =
    keyMode === 'entry' ? 'location.key（每条历史记录独立）' : 'pathname（同路径共享）'

  /** 在内存 history 中后退，触发 POP 滚动恢复。 */
  function goBack(): void {
    void navigate(-1)
  }

  /** 在内存 history 中前进，触发对应历史 entry 的恢复。 */
  function goForward(): void {
    void navigate(1)
  }

  /** 手动回到顶部，便于对照 Router 的自动滚动结果。 */
  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <>
      <ScrollRestoration
        getKey={keyMode === 'entry' ? undefined : getPathnameKey}
        storageKey={scrollStorageKey}
      />
      {location.pathname === '/help' ? (
        <aside className="scroll-restoration-pop-control" aria-label="滚动恢复快捷操作">
          <span>帮助页已打开</span>
          <button type="button" onClick={goBack}>
            后退并恢复
          </button>
        </aside>
      ) : null}
      <section className="scroll-restoration-demo" data-testid="scroll-restoration-demo">
        <header className="scroll-restoration-header">
          <div>
            <p className="scroll-restoration-eyebrow">React Router Data Mode</p>
            <h1>滚动恢复观察台</h1>
            <p>用同一个根级 ScrollRestoration 对照新导航、POP、hash 和查询参数切换。</p>
          </div>
          <nav className="scroll-restoration-global-links" aria-label="全局路由导航">
            <Link to="/catalog?view=all">目录</Link>
            <Link to="/help">帮助</Link>
          </nav>
        </header>

        <section className="scroll-restoration-inspector" aria-label="滚动恢复状态">
          <div>
            <span>当前 location</span>
            <strong data-testid="scroll-restoration-location">
              {location.pathname}
              {location.search}
              {location.hash}
            </strong>
          </div>
          <div>
            <span>window.scrollY</span>
            <strong data-testid="scroll-restoration-scroll-y">{scrollY}px</strong>
          </div>
          <div>
            <span>navigation</span>
            <strong data-testid="scroll-restoration-navigation">
              {navigationType} / {navigation.state}
            </strong>
          </div>
          <div>
            <span>key 策略</span>
            <strong data-testid="scroll-restoration-key-mode">{keyLabel}</strong>
          </div>
        </section>

        <section
          className="scroll-restoration-controls"
          aria-labelledby="scroll-restoration-controls-title"
        >
          <div>
            <p className="scroll-restoration-eyebrow">Policy switch</p>
            <h2 id="scroll-restoration-controls-title">位置策略与历史操作</h2>
          </div>
          <div className="scroll-restoration-control-row">
            <button
              type="button"
              aria-pressed={keyMode === 'entry'}
              onClick={() => onKeyModeChange('entry')}
            >
              entry key
            </button>
            <button
              type="button"
              aria-pressed={keyMode === 'pathname'}
              onClick={() => onKeyModeChange('pathname')}
            >
              pathname key
            </button>
            <button type="button" onClick={goBack}>
              后退并恢复
            </button>
            <button type="button" onClick={goForward}>
              前进并恢复
            </button>
            <button type="button" onClick={scrollToTop}>
              手动回到顶部
            </button>
          </div>
          <p className="scroll-restoration-control-note">
            entry key 区分每条历史记录；pathname key
            会让同一路径的查询参数共享位置。按钮只用于观察，不替代 Router 的恢复实现。
          </p>
        </section>

        <main className="scroll-restoration-main">
          <Outlet />
        </main>
      </section>
    </>
  )
}

/** 为每次 Demo 挂载创建独立的 Memory Router 和 key 策略状态。 */
export function createScrollRestorationDemo(): ComponentType {
  const router = createMemoryRouter(
    [
      {
        id: 'scroll-root',
        path: '/',
        /** 保存根路由的 key 策略状态，并保证 ScrollRestoration 只有一个实例。 */
        Component: function RootRoute(): ReactElement {
          const [keyMode, setKeyMode] = useState<KeyMode>('entry')
          return <ScrollRestorationShell keyMode={keyMode} onKeyModeChange={setKeyMode} />
        },
        children: [
          { id: 'catalog', path: 'catalog', Component: CatalogPage },
          { id: 'help', path: 'help', Component: HelpPage },
        ],
      },
    ] satisfies RouteObject[],
    { initialEntries: ['/catalog?view=all'] },
  )

  return function ScrollRestorationDemo(): ReactElement {
    const isMounted = useRef(false)

    useEffect(() => {
      isMounted.current = true

      return () => {
        isMounted.current = false

        // StrictMode 会立即重跑 effect；真实卸载后才释放本次 Router。
        queueMicrotask(() => {
          if (!isMounted.current) router.dispose()
        })
      }
    }, [])

    return <RouterProvider router={router} />
  }
}
