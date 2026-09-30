import type { ComponentType, ReactNode } from 'react'
import {
  createMemoryRouter,
  NavLink,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './nav-link-state-demo.css'

interface NavLinkStatePageProps {
  eyebrow: string
  title: string
  summary: string
  memoryPath: string
  initialHostUrl: string
  children: ReactNode
}

/** 等待短暂的可取消延迟，让 Data Router 的 pending 状态可观察。 */
function waitForDetail(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在导航取消时同步释放计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, 850)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 为详情 route 提供真实异步导航窗口。 */
async function taskDetailLoader({ request }: LoaderFunctionArgs) {
  await waitForDetail(request.signal)
  return null
}

/** 根据详情链接状态返回稳定的可见文案。 */
function getDetailStatus(isActive: boolean, isPending: boolean): string {
  if (isPending) return '正在加载'
  if (isActive) return '当前页面'
  return '可前往'
}

/** 渲染共享导航，并同时演示默认状态类与 children 回调。 */
function PrimaryNavigation() {
  return (
    <nav className="nav-link-state-navigation" aria-label="Demo 页面导航">
      <NavLink className="nav-link-state-item" data-testid="nav-link-home" to="/">
        <span>概览</span>
        <small>根路径</small>
      </NavLink>
      <NavLink className="nav-link-state-item" data-testid="nav-link-tasks" end to="/tasks">
        <span>任务列表</span>
        <small>使用 end</small>
      </NavLink>
      <NavLink className="nav-link-state-item" data-testid="nav-link-detail" to="/tasks/42">
        {({ isActive, isPending }) => (
          <>
            <span>任务详情</span>
            <small data-testid="nav-link-detail-status" aria-live="polite">
              {getDetailStatus(isActive, isPending)}
            </small>
          </>
        )}
      </NavLink>
    </nav>
  )
}

/** 统一展示内存地址、宿主地址、导航状态与当前页面。 */
function NavLinkStatePage({
  eyebrow,
  title,
  summary,
  memoryPath,
  initialHostUrl,
  children,
}: NavLinkStatePageProps) {
  return (
    <section className="nav-link-state-page">
      <div className="nav-link-state-addresses" aria-label="路由地址对照">
        <div>
          <span>内存地址</span>
          <code data-testid="nav-link-memory-path">{memoryPath}</code>
        </div>
        <div>
          <span>宿主初始地址</span>
          <code data-testid="nav-link-host-initial">{initialHostUrl}</code>
        </div>
        <div>
          <span>宿主当前地址</span>
          <code data-testid="nav-link-host-current">{window.location.href}</code>
        </div>
      </div>

      <PrimaryNavigation />

      <section className="nav-link-state-content" aria-labelledby="nav-link-state-page-title">
        <p>{eyebrow}</p>
        <h3 id="nav-link-state-page-title" data-testid="nav-link-page-title">
          {title}
        </h3>
        <span>{summary}</span>
        {children}
      </section>
    </section>
  )
}

/** 为每次宿主挂载创建独立的 NavLink 内存路由 Demo。 */
export function createNavLinkStateDemo(): ComponentType {
  const initialHostUrl = window.location.href

  /** 展示根目标只在根地址 active。 */
  function OverviewPage() {
    return (
      <NavLinkStatePage
        eyebrow="Active state"
        title="课程概览"
        summary="根目标本身是特例，只在内存根地址标记为当前页面。"
        memoryPath="/"
        initialHostUrl={initialHostUrl}
      >
        <p>选择“任务列表”继续观察叶子页面的精确匹配。</p>
      </NavLinkStatePage>
    )
  }

  /** 展示叶子链接的 active 类与自动 aria-current。 */
  function TaskListPage() {
    return (
      <NavLinkStatePage
        eyebrow="Active state"
        title="任务列表"
        summary="任务列表链接现在是 active，并自动具有 aria-current=page。"
        memoryPath="/tasks"
        initialHostUrl={initialHostUrl}
      >
        <p>选择“任务详情”，在短暂等待中观察目标链接的 pending 状态。</p>
      </NavLinkStatePage>
    )
  }

  /** 展示 loader 完成后 pending 转为 active 的结果。 */
  function TaskDetailPage() {
    return (
      <NavLinkStatePage
        eyebrow="Pending to active"
        title="检查任务 #42"
        summary="详情 loader 已完成；详情链接现在是当前页面。"
        memoryPath="/tasks/42"
        initialHostUrl={initialHostUrl}
      >
        <p>任务列表使用 end，因此不会在详情地址继续保持 active。</p>
      </NavLinkStatePage>
    )
  }

  const routes = [
    { id: 'overview', path: '/', Component: OverviewPage },
    { id: 'tasks', path: '/tasks', Component: TaskListPage },
    {
      id: 'task-detail',
      path: '/tasks/42',
      loader: taskDetailLoader,
      Component: TaskDetailPage,
    },
  ] satisfies RouteObject[]
  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })

  /** 挂载隔离的 RouterProvider，并保持学习站 URL 不变。 */
  function NavLinkStateDemo() {
    return (
      <section className="nav-link-state-demo" data-testid="nav-link-state-demo">
        <header className="nav-link-state-heading">
          <p>NavLink state observer</p>
          <h2>当前目标与待进入目标</h2>
          <span>内存 Router 负责 Demo 导航，外层学习站地址不参与匹配。</span>
        </header>
        <div className="nav-link-state-viewport">
          <RouterProvider router={router} />
        </div>
      </section>
    )
  }

  return NavLinkStateDemo
}
