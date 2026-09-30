import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
  type ReactElement,
} from 'react'
import {
  createMemoryRouter,
  Link,
  type LoaderFunctionArgs,
  Outlet,
  useBlocker,
  useLocation,
  type BlockerFunction,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './navigation-blocking-demo.css'

/** 把 Blocker 状态转换成适合观察台显示的中文标签。 */
function getBlockerStateLabel(state: 'unblocked' | 'blocked' | 'proceeding'): string {
  if (state === 'blocked') return 'blocked：正在等待你的选择'
  if (state === 'proceeding') return 'proceeding：正在完成原导航'
  return 'unblocked：没有待确认导航'
}

/** 根据草稿内容返回可见且可读的保存状态。 */
function getDraftStateLabel(isDirty: boolean): string {
  return isDirty ? '有未保存草稿' : '没有未保存草稿'
}

/** 在目标 route 加入可取消的短加载期，让 proceeding 状态可被稳定观察。 */
async function loadWorkspace({ request }: LoaderFunctionArgs): Promise<null> {
  await new Promise<void>((resolve) => {
    const timerId = window.setTimeout(finish, 700)

    /** 清除本次等待资源，并完成或取消当前 loader。 */
    function finish(): void {
      window.clearTimeout(timerId)
      request.signal.removeEventListener('abort', finish)
      resolve()
    }

    request.signal.addEventListener('abort', finish, { once: true })
  })
  return null
}

/** 渲染编辑路由，并在未保存草稿离开时显示确认区。 */
function DraftEditor(): ReactElement {
  const [draft, setDraft] = useState('')
  const isDirty = draft.trim().length > 0
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
    [isDirty],
  )
  const blocker = useBlocker(shouldBlock)

  /** 模拟当前草稿已被保存，使后续导航不再需要确认。 */
  function saveDraft(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    clearDraft()
  }

  /** 清空草稿，并在有待确认导航时明确收束为留在当前页面。 */
  function clearDraft(): void {
    setDraft('')
    if (blocker.state === 'blocked') blocker.reset()
  }

  /** 取消当前待确认导航，并把用户留在编辑路由。 */
  function stayOnEditor(): void {
    if (blocker.state === 'blocked') blocker.reset()
  }

  /** 放行当前待确认导航，保留用户最初发起的导航语义。 */
  function leaveEditor(): void {
    if (blocker.state === 'blocked') blocker.proceed()
  }

  return (
    <article className="navigation-blocking-page">
      <div className="navigation-blocking-page-heading">
        <div>
          <p className="navigation-blocking-eyebrow">Editor route</p>
          <h2>草稿编辑器</h2>
          <p>输入任意内容后尝试离开，观察 Router 暂缓导航并等待确认。</p>
        </div>
        <Link className="navigation-blocking-link" to="/workspace">
          前往工作区概览
        </Link>
      </div>

      <section className="navigation-blocking-inspector" aria-label="草稿与导航阻止状态">
        <div>
          <span>草稿状态</span>
          <strong data-testid="navigation-blocking-dirty">{getDraftStateLabel(isDirty)}</strong>
        </div>
        <div>
          <span>Blocker state</span>
          <strong data-testid="navigation-blocking-state">
            {getBlockerStateLabel(blocker.state)}
          </strong>
        </div>
      </section>

      <form className="navigation-blocking-form" onSubmit={saveDraft}>
        <label htmlFor="navigation-blocking-draft">课程草稿</label>
        <textarea
          id="navigation-blocking-draft"
          data-testid="navigation-blocking-draft"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder="输入未保存的标题或正文"
          rows={7}
        />
        <div className="navigation-blocking-form-actions">
          <button type="submit">保存草稿</button>
          <button
            type="button"
            className="navigation-blocking-secondary-button"
            onClick={clearDraft}
          >
            清空草稿
          </button>
        </div>
      </form>

      {blocker.state === 'blocked' ? (
        <section
          className="navigation-blocking-confirmation"
          data-testid="navigation-blocking-confirmation"
          aria-live="assertive"
          aria-labelledby="navigation-blocking-confirmation-title"
        >
          <p className="navigation-blocking-eyebrow">Navigation paused</p>
          <h3 id="navigation-blocking-confirmation-title">草稿尚未保存</h3>
          <p>
            你准备前往 <strong>{blocker.location.pathname}</strong>
            。选择继续编辑会保留草稿，选择离开会完成 原来的导航。
          </p>
          <div className="navigation-blocking-confirmation-actions">
            <button
              type="button"
              className="navigation-blocking-secondary-button"
              onClick={stayOnEditor}
            >
              继续编辑
            </button>
            <button
              type="button"
              className="navigation-blocking-danger-button"
              onClick={leaveEditor}
            >
              放弃草稿并离开
            </button>
          </div>
        </section>
      ) : null}
    </article>
  )
}

/** 渲染目标路由，作为已放行或直接导航后的可观察结果。 */
function WorkspacePage(): ReactElement {
  return (
    <article className="navigation-blocking-page navigation-blocking-workspace-page">
      <div className="navigation-blocking-page-heading">
        <div>
          <p className="navigation-blocking-eyebrow">Workspace route</p>
          <h2>工作区概览</h2>
          <p>当前导航已经提交。返回编辑器后可以从空草稿重新开始观察。</p>
        </div>
        <Link className="navigation-blocking-link" to="/editor">
          返回草稿编辑器
        </Link>
      </div>
      <section className="navigation-blocking-workspace-summary">
        <h3>导航已通过</h3>
        <p>无脏状态时，Link 会直接完成导航；有脏状态时，只有调用 `proceed()` 才会到达这里。</p>
      </section>
    </article>
  )
}

/** 渲染共享观察台，展示当前已提交的内存路由位置。 */
function NavigationBlockingShell(): ReactElement {
  const location = useLocation()

  return (
    <section className="navigation-blocking-demo" data-testid="navigation-blocking-demo">
      <header className="navigation-blocking-header">
        <div>
          <p className="navigation-blocking-eyebrow">React Router Data Mode</p>
          <h1>导航阻止观察台</h1>
          <p>让未保存草稿暂缓一次内部导航，再由用户决定留下或继续离开。</p>
        </div>
        <div className="navigation-blocking-location" aria-label="当前路由位置">
          <span>当前 location</span>
          <strong data-testid="navigation-blocking-location">{location.pathname}</strong>
        </div>
      </header>
      <main className="navigation-blocking-main">
        <Outlet />
      </main>
    </section>
  )
}

/** 为每次宿主挂载创建独立的内存 Router，并在真实卸载后释放资源。 */
export function createNavigationBlockingDemo(): ComponentType {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: NavigationBlockingShell,
        children: [
          { index: true, Component: DraftEditor },
          { path: 'editor', Component: DraftEditor },
          { path: 'workspace', loader: loadWorkspace, Component: WorkspacePage },
        ],
      },
    ] satisfies RouteObject[],
    { initialEntries: ['/editor'] },
  )

  return function NavigationBlockingDemo(): ReactElement {
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
