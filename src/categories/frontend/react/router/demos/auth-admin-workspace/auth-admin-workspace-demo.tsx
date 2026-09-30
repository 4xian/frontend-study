import { useEffect } from 'react'
import {
  Form,
  Link,
  Outlet,
  RouterProvider,
  createContext,
  createMemoryRouter,
  data,
  isRouteErrorResponse,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  useRouteError,
  useRouteLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
  type RouteObject,
  type UIMatch,
} from 'react-router'
import { createContext as createReactContext, useContext } from 'react'
import './auth-admin-workspace-demo.css'

type DemoUser = {
  id: string
  name: string
  role: string
  permissions: string[]
  active: boolean
}

type DemoSession = {
  userId: string | null
}

type DemoRuntime = {
  session: DemoSession
  users: DemoUser[]
  audit: {
    authChecks: number
    adminLoaderCalls: number
    usersLoaderCalls: number
  }
}

type AdminData = {
  user: DemoUser
  permissions: string[]
  loaderCalls: number
}

type UsersData = {
  users: DemoUser[]
  loaderCalls: number
}

type UserDetailData = {
  user: DemoUser
}

type FormResult = {
  message?: string
  errors?: Record<string, string>
}

type BreadcrumbHandle = {
  breadcrumb?: string | ((match: UIMatch) => string)
}

const currentUserContext = createContext<DemoUser | null>(null)
const runtimeContext = createReactContext<DemoRuntime | null>(null)

const initialUsers: DemoUser[] = [
  {
    id: 'u-lin',
    name: 'Lin',
    role: '内容编辑',
    permissions: ['users:read'],
    active: true,
  },
  {
    id: 'u-kai',
    name: 'Kai',
    role: '管理员',
    permissions: ['users:read', 'users:write', 'audit:read'],
    active: true,
  },
  {
    id: 'u-mei',
    name: 'Mei',
    role: '访客',
    permissions: [],
    active: false,
  },
]

const loginUsers: Record<string, DemoUser> = {
  editor: {
    id: 'u-editor',
    name: '编辑者 Lin',
    role: '编辑者',
    permissions: ['users:read'],
    active: true,
  },
  admin: {
    id: 'u-admin',
    name: '管理员 Kai',
    role: '管理员',
    permissions: ['users:read', 'users:write', 'audit:read'],
    active: true,
  },
}

/** 从用户输入中解析只允许站内管理路径的回跳目标。 */
function safeReturnToValue(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin'
  try {
    const target = new URL(value, 'https://demo.local')
    if (target.origin !== 'https://demo.local') return '/admin'
    if (target.pathname !== '/admin' && !target.pathname.startsWith('/admin/')) return '/admin'
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/admin'
  }
}

/** 从请求查询参数读取安全的登录后回跳地址。 */
function safeReturnTo(request: Request): string {
  return safeReturnToValue(new URL(request.url).searchParams.get('returnTo'))
}

/** 将受保护请求自身转换为登录页可接受的站内回跳地址。 */
function requestedAdminPath(request: Request): string {
  const url = new URL(request.url)
  return safeReturnToValue(`${url.pathname}${url.search}${url.hash}`)
}

/** 提供可取消的短延时，让 navigation 与 Fetcher pending 状态可观察。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在请求取消时释放当前计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 读取当前 Demo 的独立运行时。 */
function useDemoRuntime(): DemoRuntime {
  const runtime = useContext(runtimeContext)
  if (!runtime) throw new Error('鉴权管理后台 Demo 缺少运行时上下文')
  return runtime
}

/** 判断用户是否拥有指定权限。 */
function hasPermission(user: DemoUser | null, permission: string): boolean {
  return Boolean(user?.permissions.includes(permission))
}

/** 从 route error 中提取可读状态和消息。 */
function readRouteError(error: unknown): { status: number; message: string } {
  if (isRouteErrorResponse(error)) {
    return {
      status: error.status,
      message: typeof error.data === 'string' ? error.data : '路由数据请求失败。',
    }
  }
  return { status: 500, message: '后台暂时无法完成这次请求。' }
}

/** 将活动匹配链中的 handle 转换为后台面包屑。 */
function Breadcrumbs() {
  const matches = useMatches()
  const items = matches.flatMap((match) => {
    const handle = match.handle as BreadcrumbHandle | undefined
    if (!handle?.breadcrumb) return []
    const label =
      typeof handle.breadcrumb === 'function' ? handle.breadcrumb(match) : handle.breadcrumb
    return [{ id: match.id, label }]
  })

  return (
    <nav className="auth-admin-breadcrumbs" aria-label="后台面包屑">
      <ol data-testid="auth-admin-breadcrumbs">
        {items.map((item, index) => (
          <li key={item.id}>
            <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** 呈现登录边界和 action 返回的表单错误。 */
function LoginPage() {
  const actionData = useActionData() as FormResult | undefined
  const location = useLocation()
  const navigation = useNavigation()
  const rawReturnTo = new URLSearchParams(location.search).get('returnTo')
  const target = safeReturnToValue(rawReturnTo)
  const isSubmitting = navigation.state === 'submitting'

  return (
    <section className="auth-admin-card" data-testid="auth-admin-login">
      <p className="auth-admin-eyebrow">Authentication boundary</p>
      <h3>登录管理后台</h3>
      <p>
        原入口：<code>{rawReturnTo ?? '未提供'}</code>；安全回跳：<code>{target}</code>
      </p>
      {actionData?.message ? <p role="alert">{actionData.message}</p> : null}
      {actionData?.errors?.username ? <p role="alert">{actionData.errors.username}</p> : null}
      <Form
        method="post"
        action={`${location.pathname}${location.search}`}
        className="auth-admin-form"
      >
        <input
          name="username"
          type="text"
          autoComplete="username"
          defaultValue="demo-user"
          className="auth-admin-visually-hidden"
          aria-hidden="true"
          tabIndex={-1}
          readOnly
        />
        <label>
          演示账号
          <select name="account" defaultValue="editor">
            <option value="editor">editor（只有 users:read）</option>
            <option value="admin">admin（包含 users:write）</option>
          </select>
        </label>
        <label>
          演示密码
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue="router-demo"
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登录中' : '登录并回跳'}
        </button>
      </Form>
      <p className="auth-admin-hint">密码必须是 router-demo；登录只是内存演示，不代表生产认证。</p>
      <nav className="auth-admin-subnav" aria-label="回跳安全示例">
        <Link to="/login?returnTo=https%3A%2F%2Fevil.example">演示外部 returnTo</Link>
        <Link to="/login?returnTo=%2Fadmin%2Fusers">恢复安全 returnTo</Link>
      </nav>
    </section>
  )
}

/** 呈现后台父布局、用户摘要、导航状态和登出 action。 */
function AdminLayout() {
  const data = useLoaderData() as AdminData
  const navigation = useNavigation()
  const runtime = useDemoRuntime()
  const matches = useMatches()
  const currentPath = matches.at(-1)?.pathname ?? '/admin'

  return (
    <section className="auth-admin-demo" data-testid="auth-admin-demo">
      <header className="auth-admin-header">
        <div>
          <p className="auth-admin-eyebrow">React Router Data Mode</p>
          <h2>鉴权管理后台</h2>
          <span>middleware 保护入口，loader/action 管理数据，Fetcher 负责局部操作。</span>
        </div>
        <Form method="post" action="/logout" replace>
          <button type="submit" name="intent" value="logout">
            登出
          </button>
        </Form>
      </header>
      <div className="auth-admin-observer" role="status" aria-live="polite">
        <span>当前地址</span>
        <code data-testid="auth-admin-location">{currentPath}</code>
        <span>导航</span>
        <code data-testid="auth-admin-navigation">{navigation.state}</code>
        <span>鉴权检查</span>
        <strong data-testid="auth-admin-auth-checks">{runtime.audit.authChecks}</strong>
      </div>
      <div className="auth-admin-userbar">
        <strong>{data.user.name}</strong>
        <span>{data.user.role}</span>
        <span>权限：{data.permissions.length ? data.permissions.join('、') : '无'}</span>
        <small>后台 loader 调用 {data.loaderCalls} 次</small>
      </div>
      <nav className="auth-admin-nav" aria-label="后台导航">
        <Link to="/admin/users">用户列表</Link>
        <Link to="/admin/forbidden">403 权限示例</Link>
      </nav>
      <Breadcrumbs />
      <main className="auth-admin-main" aria-busy={navigation.state !== 'idle'}>
        <Outlet />
      </main>
    </section>
  )
}

/** 呈现用户列表及每一行独立的 Fetcher 状态。 */
function UsersPage() {
  const data = useLoaderData() as UsersData
  const adminData = useRouteLoaderData('auth-admin-root') as AdminData | undefined
  const canWrite = hasPermission(adminData?.user ?? null, 'users:write')

  return (
    <section className="auth-admin-card" data-testid="auth-admin-users">
      <div className="auth-admin-section-heading">
        <div>
          <p className="auth-admin-eyebrow">Child loader</p>
          <h3>用户列表</h3>
        </div>
        <div>
          <small>列表 loader 调用 {data.loaderCalls} 次</small>
          <Link to="/admin/users/missing-user">打开不存在用户</Link>
        </div>
      </div>
      <ul className="auth-admin-user-list">
        {data.users.map((user) => (
          <UserRow key={user.id} user={user} canWrite={canWrite} />
        ))}
      </ul>
    </section>
  )
}

/** 为用户列表和详情分支提供共享 Outlet。 */
function UsersLayout() {
  return <Outlet />
}

type UserRowProps = {
  user: DemoUser
  canWrite: boolean
}

/** 为用户列表行提供不改变 URL 的启停 Fetcher 操作。 */
function UserRow({ user, canWrite }: UserRowProps) {
  const fetcher = useFetcher<{ ok: true; active: boolean; message: string }>()
  const isBusy = fetcher.state !== 'idle'
  return (
    <li className="auth-admin-user-row">
      <div>
        <Link to={`/admin/users/${user.id}`}>{user.name}</Link>
        <span>{user.role}</span>
      </div>
      <strong className={user.active ? 'is-active' : 'is-inactive'}>
        {user.active ? '启用' : '停用'}
      </strong>
      {canWrite ? (
        <fetcher.Form method="post" action={`/admin/users/${user.id}/status`}>
          <button type="submit" name="active" value={String(!user.active)} disabled={isBusy}>
            {isBusy ? `${fetcher.state}…` : user.active ? '停用账号' : '启用账号'}
          </button>
        </fetcher.Form>
      ) : (
        <span className="auth-admin-muted">需要 users:write</span>
      )}
      {fetcher.data?.message ? <small role="status">{fetcher.data.message}</small> : null}
    </li>
  )
}

/** 呈现用户详情、权限编辑入口和局部状态操作。 */
function UserDetailLayout() {
  const data = useLoaderData() as UserDetailData
  const adminData = useRouteLoaderData('auth-admin-root') as AdminData | undefined
  return (
    <section className="auth-admin-card" data-testid="auth-admin-user-detail">
      <p className="auth-admin-eyebrow">Parent loader + child route</p>
      <h3>{data.user.name} 的用户详情</h3>
      <dl className="auth-admin-detail-list">
        <div>
          <dt>角色</dt>
          <dd>{data.user.role}</dd>
        </div>
        <div>
          <dt>账号状态</dt>
          <dd>{data.user.active ? '启用' : '停用'}</dd>
        </div>
        <div>
          <dt>当前操作者</dt>
          <dd>{adminData?.user.name ?? '未知'}</dd>
        </div>
      </dl>
      <nav className="auth-admin-subnav" aria-label="用户详情导航">
        <Link to=".">概览</Link>
        <Link to="permissions">编辑权限</Link>
        <Link to="/admin/users">返回列表</Link>
      </nav>
      <Outlet />
    </section>
  )
}

/** 呈现用户详情的 404 或其他数据错误边界。 */
function UserDetailErrorBoundary() {
  const error = readRouteError(useRouteError())
  const title =
    error.status === 404
      ? '用户不存在'
      : error.status === 403
        ? '已登录，但没有修改权限'
        : '用户详情加载失败'
  return (
    <section className="auth-admin-card" role="alert" data-testid="auth-admin-user-error">
      <p className="auth-admin-eyebrow">Nearest ErrorBoundary</p>
      <h3>{title}</h3>
      <p>{error.message}</p>
      <strong>HTTP {error.status}</strong>
      <p>
        <Link to="/admin/users">返回用户列表</Link>
      </p>
    </section>
  )
}

/** 呈现权限编辑表单及 action 返回的 400 校验错误。 */
function PermissionsPage() {
  const data = useRouteLoaderData('auth-admin-user-detail') as UserDetailData
  const actionData = useActionData() as FormResult | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const selected = new Set(data.user.permissions)
  return (
    <section className="auth-admin-subpanel" data-testid="auth-admin-permissions">
      <h4>编辑权限</h4>
      {actionData?.message ? <p role="status">{actionData.message}</p> : null}
      {actionData?.errors?.permission ? <p role="alert">{actionData.errors.permission}</p> : null}
      <Form method="post" className="auth-admin-form">
        <input type="hidden" name="intent" value="save-permissions" />
        <label>
          <input
            type="checkbox"
            name="permissions"
            value="users:read"
            defaultChecked={selected.has('users:read')}
          />
          users:read
        </label>
        <label>
          <input
            type="checkbox"
            name="permissions"
            value="users:write"
            defaultChecked={selected.has('users:write')}
          />
          users:write
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '保存中' : '保存权限并返回详情'}
        </button>
      </Form>
    </section>
  )
}

/** 呈现已登录但无权访问时的 403 错误边界。 */
function AdminErrorBoundary() {
  const error = readRouteError(useRouteError())
  return (
    <section className="auth-admin-card" role="alert" data-testid="auth-admin-forbidden">
      <p className="auth-admin-eyebrow">Authorization boundary</p>
      <h3>{error.status === 403 ? '已登录，但没有权限' : '后台加载失败'}</h3>
      <p>{error.message}</p>
      <strong>HTTP {error.status}</strong>
      <p>
        <Link to="/admin/users">回到用户列表</Link>
      </p>
    </section>
  )
}

/** 显示公开页，证明公开路由不经过后台鉴权 middleware。 */
function PublicPage() {
  return (
    <section className="auth-admin-card" data-testid="auth-admin-public">
      <p className="auth-admin-eyebrow">Public route</p>
      <h3>公开入口</h3>
      <p>这是不读取后台数据的公开页面。</p>
      <Link to="/admin">进入管理后台</Link>
    </section>
  )
}

/** 为公开页、登录页和后台路由提供最外层 Outlet。 */
function DemoShell() {
  return (
    <div className="auth-admin-host">
      <Outlet />
    </div>
  )
}

/** 呈现用户详情默认说明。 */
function UserOverviewPage() {
  return <p>请选择“编辑权限”查看页面级 action。</p>
}

/** 创建本次 Demo 独享的内存 Router、session 与静态 route tree。 */
export function createAuthAdminWorkspaceDemo() {
  const runtime: DemoRuntime = {
    session: { userId: null },
    users: initialUsers.map((user) => ({ ...user, permissions: [...user.permissions] })),
    audit: { authChecks: 0, adminLoaderCalls: 0, usersLoaderCalls: 0 },
  }

  /** 读取当前 session 对应的用户。 */
  function currentUser(): DemoUser | null {
    if (!runtime.session.userId) return null
    if (runtime.session.userId === 'u-editor') return loginUsers.editor ?? null
    if (runtime.session.userId === 'u-admin') return loginUsers.admin ?? null
    return null
  }

  /** 在后台 route handler 前检查 session，并把用户写入 typed context。 */
  const authMiddleware: MiddlewareFunction = async ({ context, request }, next) => {
    runtime.audit.authChecks += 1
    const user = currentUser()
    if (!user) throw redirect(`/login?returnTo=${encodeURIComponent(requestedAdminPath(request))}`)
    context.set(currentUserContext, user)
    await next()
  }

  /** 返回后台父级用户摘要和权限，供布局消费。 */
  async function adminLoader({ context }: LoaderFunctionArgs): Promise<AdminData> {
    runtime.audit.adminLoaderCalls += 1
    const user = context.get(currentUserContext)
    if (!user) throw data('Unauthorized', { status: 401 })
    return { user, permissions: user.permissions, loaderCalls: runtime.audit.adminLoaderCalls }
  }

  /** 登出 action 清除演示 session，并导航回登录页。 */
  async function logoutAction({ request }: ActionFunctionArgs) {
    await waitForRequest(request.signal, 120)
    runtime.session.userId = null
    return redirect('/login?returnTo=%2Fadmin')
  }

  /** 登录 action 校验演示账号和密码，并只回跳到安全管理路径。 */
  async function loginAction({ request }: ActionFunctionArgs) {
    await waitForRequest(request.signal, 180)
    const formData = await request.formData()
    const username = String(formData.get('account') ?? '')
    const password = String(formData.get('password') ?? '')
    const user = loginUsers[username]
    if (!user || password !== 'router-demo') {
      return data(
        {
          message: '登录失败，请选择有效账号并输入 router-demo。',
          errors: { username: '账号或密码不正确' },
        } satisfies FormResult,
        { status: 400 },
      )
    }
    runtime.session.userId = user.id
    return redirect(safeReturnTo(request))
  }

  /** 加载用户列表，保持列表数据所有权在 users route。 */
  async function usersLoader({ context }: LoaderFunctionArgs): Promise<UsersData> {
    const user = context.get(currentUserContext)
    if (!user) throw data('Unauthorized', { status: 401 })
    if (!hasPermission(user, 'users:read')) throw data('需要 users:read 权限。', { status: 403 })
    runtime.audit.usersLoaderCalls += 1
    return { users: runtime.users, loaderCalls: runtime.audit.usersLoaderCalls }
  }

  /** 加载单个用户，找不到资源时抛出 404。 */
  async function userDetailLoader({
    context,
    params,
  }: LoaderFunctionArgs): Promise<UserDetailData> {
    const user = context.get(currentUserContext)
    if (!user) throw data('Unauthorized', { status: 401 })
    if (!hasPermission(user, 'users:read')) throw data('需要 users:read 权限。', { status: 403 })
    const record = runtime.users.find((candidate) => candidate.id === params.userId)
    if (!record) throw data('没有找到对应用户。', { status: 404 })
    return { user: record }
  }

  /** 保存用户权限，限制为管理员 action，并在成功后返回详情。 */
  async function permissionsAction({ context, params, request }: ActionFunctionArgs) {
    const actor = context.get(currentUserContext)
    if (!hasPermission(actor, 'users:write'))
      throw data('编辑权限需要 users:write。', { status: 403 })
    const formData = await request.formData()
    await waitForRequest(request.signal, 180)
    const permissions = formData.getAll('permissions').map(String)
    if (!permissions.includes('users:read')) {
      return data(
        { errors: { permission: '至少保留 users:read，避免账号失去基本读取能力。' } },
        { status: 400 },
      )
    }
    const record = runtime.users.find((candidate) => candidate.id === params.userId)
    if (!record) throw data('没有找到对应用户。', { status: 404 })
    record.permissions = permissions
    return redirect(`/admin/users/${record.id}`)
  }

  /** 通过 Fetcher 切换用户启停状态，成功后触发当前页面自动重新验证。 */
  async function statusAction({ context, params, request }: ActionFunctionArgs) {
    const actor = context.get(currentUserContext)
    if (!hasPermission(actor, 'users:write'))
      throw data('启停账号需要 users:write。', { status: 403 })
    const formData = await request.formData()
    await waitForRequest(request.signal, 180)
    const record = runtime.users.find((candidate) => candidate.id === params.userId)
    if (!record) throw data('没有找到对应用户。', { status: 404 })
    record.active = String(formData.get('active')) === 'true'
    return {
      ok: true as const,
      active: record.active,
      message: `${record.name} 已${record.active ? '启用' : '停用'}`,
    }
  }

  /** 加载权限拒绝示例，展示认证成功与授权失败的区别。 */
  async function forbiddenLoader({ context }: LoaderFunctionArgs) {
    const user = context.get(currentUserContext)
    if (!user) throw data('Unauthorized', { status: 401 })
    if (!hasPermission(user, 'audit:read'))
      throw data('当前账号没有 audit:read 权限。', { status: 403 })
    return { message: '管理员具备 audit:read，已通过权限检查。' }
  }

  /** 呈现通过权限检查的审计示例。 */
  function ForbiddenPage() {
    const result = useLoaderData() as { message: string }
    return (
      <section className="auth-admin-card" data-testid="auth-admin-forbidden-ok">
        <p className="auth-admin-eyebrow">Permission check</p>
        <h3>权限检查通过</h3>
        <p>{result.message}</p>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'auth-admin-shell',
      path: '/',
      Component: DemoShell,
      children: [
        { index: true, Component: PublicPage },
        { path: 'login', action: loginAction, Component: LoginPage },
        { path: 'logout', action: logoutAction },
        {
          id: 'auth-admin-root',
          path: 'admin',
          middleware: [authMiddleware],
          loader: adminLoader,
          Component: AdminLayout,
          ErrorBoundary: AdminErrorBoundary,
          handle: { breadcrumb: '管理后台' } satisfies BreadcrumbHandle,
          children: [
            { index: true, loader: () => redirect('/admin/users') },
            {
              id: 'auth-admin-users',
              path: 'users',
              Component: UsersLayout,
              handle: { breadcrumb: '用户管理' } satisfies BreadcrumbHandle,
              children: [
                { index: true, loader: usersLoader, Component: UsersPage },
                {
                  id: 'auth-admin-user-detail',
                  path: ':userId',
                  loader: userDetailLoader,
                  Component: UserDetailLayout,
                  ErrorBoundary: UserDetailErrorBoundary,
                  handle: {
                    breadcrumb: (match: UIMatch) => {
                      const data = match.loaderData as UserDetailData | undefined
                      return data?.user.name ?? '用户详情'
                    },
                  } satisfies BreadcrumbHandle,
                  children: [
                    { index: true, Component: UserOverviewPage },
                    { path: 'permissions', action: permissionsAction, Component: PermissionsPage },
                    { path: 'status', action: statusAction },
                  ],
                },
              ],
            },
            {
              path: 'forbidden',
              loader: forbiddenLoader,
              Component: ForbiddenPage,
              ErrorBoundary: AdminErrorBoundary,
            },
          ],
        },
      ],
    },
  ]

  const router = createMemoryRouter(routes, { initialEntries: ['/admin/users'] })
  return function AuthAdminWorkspaceDemo() {
    useEffect(() => () => router.dispose(), [router])
    return (
      <runtimeContext.Provider value={runtime}>
        <RouterProvider router={router} />
      </runtimeContext.Provider>
    )
  }
}
