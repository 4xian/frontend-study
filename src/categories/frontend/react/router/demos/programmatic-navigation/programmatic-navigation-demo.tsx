import { type ComponentType, type ReactNode } from 'react'
import { createMemoryRouter, Outlet, useNavigate, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './programmatic-navigation-demo.css'

const initialStartEntry = '/workspace/start'
const initialEditorEntry = '/workspace/projects/aurora/tasks/42/edit'

type NavigationScreenProps = {
  eyebrow: string
  title: string
  memoryPath: string
  description: string
  command: string
  children: ReactNode
}

/** 以统一结构展示当前内存 URL、导航说明和可执行命令。 */
function NavigationScreen({
  eyebrow,
  title,
  memoryPath,
  description,
  command,
  children,
}: NavigationScreenProps) {
  return (
    <section className="programmatic-navigation-screen">
      <header className="programmatic-navigation-heading">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
      </header>

      <section
        className="programmatic-navigation-location"
        aria-labelledby="programmatic-navigation-location-title"
      >
        <div>
          <p>Memory Router</p>
          <h3 id="programmatic-navigation-location-title">当前内存 URL</h3>
        </div>
        <code data-testid="programmatic-memory-path" aria-live="polite">
          {memoryPath}
        </code>
        <span data-testid="programmatic-command">{command}</span>
      </section>

      <section
        className="programmatic-navigation-controls"
        aria-labelledby="programmatic-navigation-controls-title"
      >
        <h3 id="programmatic-navigation-controls-title">导航命令</h3>
        <div>{children}</div>
      </section>

      <footer>
        内存 Router 与学习站外层 URL 相互隔离；重新挂载 Demo 会恢复固定的两条初始 entry。
      </footer>
    </section>
  )
}

/** 为 workspace 下的 route component 提供同一个 Outlet。 */
function WorkspaceLayout() {
  return <Outlet />
}

/** 展示受控 history 的起点，并允许前进到已知的编辑 entry。 */
function StartPage() {
  const navigate = useNavigate()

  /** 前进一项，返回初始 history 中已知存在的编辑页。 */
  async function moveForward(): Promise<void> {
    await navigate(1)
  }

  return (
    <NavigationScreen
      eyebrow="History entry 0"
      title="受控导航起点"
      memoryPath={initialStartEntry}
      description="当前 history 的下一项是初始化时写入的编辑页，因此 navigate(1) 的目标可证明。"
      command="当前由 delta -1 到达；前进不会猜测 URL，而是移动到已有 entry。"
    >
      <button type="button" data-testid="navigate-forward" onClick={moveForward}>
        前进到编辑页
      </button>
    </NavigationScreen>
  )
}

/** 展示 push、delta 与两种相对解析的共同起点。 */
function EditorPage() {
  const navigate = useNavigate()

  /** 默认 push 一个预览 entry，并等待 Data Mode 导航完成。 */
  async function openPreview(): Promise<void> {
    await navigate('/workspace/preview')
  }

  /** 按 route hierarchy 返回多段编辑 route 的 parent。 */
  async function openRouteParent(): Promise<void> {
    await navigate('..')
  }

  /** 按 pathname 删除一个段，进入当前任务页。 */
  async function openPathParent(): Promise<void> {
    await navigate('..', { relative: 'path' })
  }

  /** 后退到初始化时已知存在的起点 entry。 */
  async function moveBack(): Promise<void> {
    await navigate(-1)
  }

  return (
    <NavigationScreen
      eyebrow="History entry 1"
      title="任务编辑页"
      memoryPath={initialEditorEntry}
      description="当前 child route pattern 一次贡献 projects/:projectId/tasks/:taskId/edit 多个段。"
      command="可观察默认 push、受控 delta，以及 route-relative 与 path-relative 的差异。"
    >
      <button type="button" data-testid="navigate-preview" onClick={openPreview}>
        Push 进入预览
      </button>
      <button type="button" data-testid="navigate-route-parent" onClick={openRouteParent}>
        Route 向上一级
      </button>
      <button type="button" data-testid="navigate-path-parent" onClick={openPathParent}>
        Path 删除一段
      </button>
      <button type="button" data-testid="navigate-back-start" onClick={moveBack}>
        后退到起点
      </button>
    </NavigationScreen>
  )
}

/** 展示 push 产生的临时预览 entry，并用对象目标完成 replace。 */
function PreviewPage() {
  const navigate = useNavigate()

  /** 用 pathname、search 与 hash 对象替换当前预览 entry。 */
  async function finishPreview(): Promise<void> {
    await navigate(
      {
        pathname: '/workspace/done',
        search: '?task=42',
        hash: '#result',
      },
      { replace: true },
    )
  }

  /** 后退到刚才保留在 history 中的编辑 entry。 */
  async function returnToEditor(): Promise<void> {
    await navigate(-1)
  }

  return (
    <NavigationScreen
      eyebrow="PUSH entry"
      title="任务预览页"
      memoryPath="/workspace/preview"
      description="从编辑页进入时，默认 navigate(to) 会在 history 尾部新增这一项。"
      command="完成操作使用对象目标，并以 replace 覆盖当前 preview entry。"
    >
      <button type="button" data-testid="navigate-finish" onClick={finishPreview}>
        Replace 完成
      </button>
      <button type="button" data-testid="navigate-back-editor" onClick={returnToEditor}>
        后退到编辑页
      </button>
    </NavigationScreen>
  )
}

/** 展示对象目标产生的完整 URL，以及 replace 后的 history 结果。 */
function DonePage() {
  const navigate = useNavigate()

  /** 后退一项，验证 preview 已被替换并直接返回编辑页。 */
  async function returnToEditor(): Promise<void> {
    await navigate(-1)
  }

  return (
    <NavigationScreen
      eyebrow="REPLACE entry"
      title="任务处理完成"
      memoryPath="/workspace/done?task=42#result"
      description="pathname、search 与 hash 来自同一个 To 对象，当前 entry 已替换 preview。"
      command="后退一项会直接回到 edit，不会再次经过已被替换的 preview。"
    >
      <button type="button" data-testid="navigate-back-after-replace" onClick={returnToEditor}>
        后退验证 Replace
      </button>
    </NavigationScreen>
  )
}

/** 展示默认 route-relative 上移后的 workspace parent。 */
function WorkspaceHomePage() {
  const navigate = useNavigate()

  /** 后退一项，返回刚才保留在 history 中的编辑 entry。 */
  async function restoreEditor(): Promise<void> {
    await navigate(-1)
  }

  return (
    <NavigationScreen
      eyebrow="relative: route"
      title="Workspace Parent"
      memoryPath="/workspace"
      description="默认 navigate('..') 按 route hierarchy 上移，移除了当前 child pattern 贡献的全部段。"
      command="结果是 parent route 的 /workspace，而不是只删除 URL 末尾的 edit。"
    >
      <button type="button" data-testid="restore-editor-from-workspace" onClick={restoreEditor}>
        恢复编辑场景
      </button>
    </NavigationScreen>
  )
}

/** 展示 path-relative 只删除 edit 段后的任务页面。 */
function TaskPage() {
  const navigate = useNavigate()

  /** 后退一项，返回刚才保留在 history 中的编辑 entry。 */
  async function restoreEditor(): Promise<void> {
    await navigate(-1)
  }

  return (
    <NavigationScreen
      eyebrow="relative: path"
      title="当前任务页面"
      memoryPath="/workspace/projects/aurora/tasks/42"
      description="relative: path 只按 pathname 删除一个段，因此只移除了末尾的 edit。"
      command="route tree 没有改变；变化的只是本次目标解析所采用的基准。"
    >
      <button type="button" data-testid="restore-editor-from-task" onClick={restoreEditor}>
        恢复编辑场景
      </button>
    </NavigationScreen>
  )
}

const routes = [
  {
    id: 'workspace',
    path: '/workspace',
    Component: WorkspaceLayout,
    children: [
      {
        id: 'workspace-index',
        index: true,
        Component: WorkspaceHomePage,
      },
      {
        id: 'workspace-start',
        path: 'start',
        Component: StartPage,
      },
      {
        id: 'workspace-editor',
        path: 'projects/:projectId/tasks/:taskId/edit',
        Component: EditorPage,
      },
      {
        id: 'workspace-task',
        path: 'projects/:projectId/tasks/:taskId',
        Component: TaskPage,
      },
      {
        id: 'workspace-preview',
        path: 'preview',
        Component: PreviewPage,
      },
      {
        id: 'workspace-done',
        path: 'done',
        Component: DonePage,
      },
    ],
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立受控 history 的编程式导航 Demo。 */
export function createProgrammaticNavigationDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialStartEntry, initialEditorEntry],
    initialIndex: 1,
  })

  /** 挂载本课独立的内存 Router。 */
  function ProgrammaticNavigationDemo() {
    return (
      <section className="programmatic-navigation-demo" data-testid="programmatic-navigation-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return ProgrammaticNavigationDemo
}
