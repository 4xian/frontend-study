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

import './course-center-demo.css'

type CourseLevel = 'beginner' | 'intermediate'
type CourseLevelFilter = 'all' | CourseLevel

type Course = {
  id: string
  title: string
  level: CourseLevel
  levelLabel: string
  estimatedMinutes: number
  summary: string
  outline: readonly string[]
}

type CourseCenterState = {
  from: string
  label: string
  canGoBack?: boolean
}

const courses: readonly Course[] = [
  {
    id: 'react-router-basics',
    title: 'React Router 基础',
    level: 'beginner',
    levelLabel: '基础',
    estimatedMinutes: 90,
    summary: '从路由对象开始，建立页面匹配、导航与 URL 状态的完整模型。',
    outline: ['配置 Data Router', '连接页面入口', '观察 Location 变化'],
  },
  {
    id: 'typescript-components',
    title: 'TypeScript 组件实践',
    level: 'beginner',
    levelLabel: '基础',
    estimatedMinutes: 75,
    summary: '用明确的 Props 和事件类型完成可维护的交互组件。',
    outline: ['定义 Props 合同', '处理 DOM 事件', '拆分组件职责'],
  },
  {
    id: 'react-state-architecture',
    title: 'React State 架构',
    level: 'intermediate',
    levelLabel: '中级',
    estimatedMinutes: 110,
    summary: '根据数据所有权安排 State、派生值与组件边界。',
    outline: ['识别最小 State', '确定共同所有者', '保持单向数据流'],
  },
]

const initialEntry = '/courses?level=beginner'
const defaultCatalogUrl = '/courses?level=all'

/** 判断查询参数是否属于课程中心支持的筛选值。 */
function isCourseLevelFilter(value: string | null): value is CourseLevelFilter {
  return value === 'all' || value === 'beginner' || value === 'intermediate'
}

/** 按稳定业务 ID 查找本地课程。 */
function findCourse(courseId: string | undefined): Course | undefined {
  return courses.find((course) => course.id === courseId)
}

/** 校验当前 history entry 中的短期来源信息。 */
function readCourseCenterState(value: unknown): CourseCenterState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<CourseCenterState>
  if (typeof state.from !== 'string' || typeof state.label !== 'string') return null
  if (state.canGoBack !== undefined && typeof state.canGoBack !== 'boolean') return null
  return { from: state.from, label: state.label, canGoBack: state.canGoBack }
}

/** 只允许返回课程目录中已知的筛选 URL。 */
function getSafeCatalogUrl(state: CourseCenterState | null): string {
  if (!state) return defaultCatalogUrl
  return /^\/courses\?level=(all|beginner|intermediate)$/.test(state.from)
    ? state.from
    : defaultCatalogUrl
}

/** 展示当前内存 Router 的 Location 与 history action。 */
function CourseCenterRouteStatus() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const state = readCourseCenterState(location.state)

  return (
    <section className="course-center-status" aria-label="当前路由状态">
      <div>
        <span>path</span>
        <strong data-testid="course-center-path">{location.pathname}</strong>
      </div>
      <div>
        <span>search</span>
        <strong data-testid="course-center-search">{location.search || '（空）'}</strong>
      </div>
      <div>
        <span>action</span>
        <strong data-testid="course-center-navigation-type">{navigationType}</strong>
      </div>
      <div>
        <span>key</span>
        <strong data-testid="course-center-location-key">{location.key}</strong>
      </div>
      <div>
        <span>state.from</span>
        <strong data-testid="course-center-state-from">{state?.from ?? '（无）'}</strong>
      </div>
    </section>
  )
}

/** 提供课程中心共享导航、状态观察区与页面插入点。 */
function CourseCenterLayout() {
  return (
    <section className="course-center-shell">
      <header className="course-center-header">
        <div>
          <p>Route workshop</p>
          <h2>多页面课程中心</h2>
        </div>
        <nav aria-label="课程中心导航">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/courses">课程</NavLink>
        </nav>
      </header>

      <CourseCenterRouteStatus />

      <main className="course-center-page">
        <Outlet />
      </main>
    </section>
  )
}

/** 渲染课程中心索引页和两个明确入口。 */
function CourseHomePage() {
  return (
    <section className="course-center-home">
      <p className="course-center-eyebrow">学习入口</p>
      <h1>选择下一门课程</h1>
      <p>首页只负责介绍和导航；课程筛选、详情与学习内容由各自页面承担。</p>
      <div className="course-center-actions">
        <Link to="/courses?level=beginner">浏览基础课程</Link>
        <Link
          to="/courses/react-router-basics"
          state={{ from: '/', label: '课程首页' } satisfies CourseCenterState}
        >
          查看精选课程
        </Link>
      </div>
    </section>
  )
}

/** 从 URL 读取筛选条件并渲染派生课程列表。 */
function CourseCatalogPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawLevel = searchParams.get('level')
  const level = isCourseLevelFilter(rawLevel) ? rawLevel : 'all'
  const visibleCourses =
    level === 'all' ? courses : courses.filter((course) => course.level === level)
  const catalogUrl = `${location.pathname}${location.search}`

  /** 把新的课程等级写回 URL，而不是建立第二份本地筛选 State。 */
  function handleLevelChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextLevel = event.target.value
    if (!isCourseLevelFilter(nextLevel)) return
    void setSearchParams({ level: nextLevel })
  }

  return (
    <section className="course-center-catalog">
      <p className="course-center-eyebrow">课程目录</p>
      <h1>课程目录</h1>
      <p>筛选条件保存在 search 中，课程身份保存在详情页 pathname 中。</p>

      <div className="course-center-filter">
        <label htmlFor="course-center-level">课程等级</label>
        <select
          id="course-center-level"
          data-testid="course-level-filter"
          value={level}
          onChange={handleLevelChange}
        >
          <option value="all">全部课程</option>
          <option value="beginner">基础课程</option>
          <option value="intermediate">中级课程</option>
        </select>
        <span aria-live="polite" data-testid="course-count">
          当前显示 {visibleCourses.length} 门
        </span>
      </div>

      <div className="course-center-course-list">
        {visibleCourses.map((course) => (
          <article className="course-center-card" key={course.id}>
            <div>
              <span>{course.levelLabel}</span>
              <span>{course.estimatedMinutes} 分钟</span>
            </div>
            <h2>{course.title}</h2>
            <p>{course.summary}</p>
            <Link
              to={`/courses/${course.id}`}
              state={{ from: catalogUrl, label: '课程目录' } satisfies CourseCenterState}
              data-testid={`course-card-${course.id}`}
            >
              查看课程
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

/** 渲染动态课程详情，并按当前课程决定学习页目标。 */
function CourseDetailPage() {
  const { courseId } = useParams()
  const course = findCourse(courseId)
  const location = useLocation()
  const navigate = useNavigate()
  const state = readCourseCenterState(location.state)
  const catalogUrl = getSafeCatalogUrl(state)

  /** 将已确认存在的课程写入下一条学习页 entry。 */
  async function handleStartCourse(): Promise<void> {
    if (!course) return
    await navigate(`/learning/${course.id}`, {
      state: {
        from: `/courses/${course.id}`,
        label: course.title,
        canGoBack: true,
      } satisfies CourseCenterState,
    })
  }

  if (!course) {
    return (
      <section className="course-center-empty" data-testid="course-missing">
        <p className="course-center-eyebrow">未知课程</p>
        <h1>课程不存在</h1>
        <p>这个 URL 匹配了详情路由，但本地课程数据中没有对应 ID。</p>
        <Link to={defaultCatalogUrl}>返回课程目录</Link>
      </section>
    )
  }

  return (
    <article className="course-center-detail">
      <p className="course-center-eyebrow">课程详情</p>
      <h1>{course.title}</h1>
      <p>{course.summary}</p>
      <dl>
        <div>
          <dt>等级</dt>
          <dd>{course.levelLabel}</dd>
        </div>
        <div>
          <dt>预计时长</dt>
          <dd>{course.estimatedMinutes} 分钟</dd>
        </div>
        <div>
          <dt>进入来源</dt>
          <dd>{state?.label ?? '直接访问'}</dd>
        </div>
      </dl>
      <div className="course-center-actions">
        <button type="button" data-testid="course-start" onClick={handleStartCourse}>
          开始学习
        </button>
        <Link to={catalogUrl}>返回课程目录</Link>
      </div>
    </article>
  )
}

/** 渲染静态学习大纲，并只在受控来源存在时提供 delta 返回。 */
function CourseLearningPage() {
  const { courseId } = useParams()
  const course = findCourse(courseId)
  const location = useLocation()
  const navigate = useNavigate()
  const state = readCourseCenterState(location.state)
  const canGoBack = Boolean(course && state?.canGoBack && state.from === `/courses/${course.id}`)

  /** 返回受控流程中已经存在的详情 entry。 */
  async function handleBack(): Promise<void> {
    if (!canGoBack) return
    await navigate(-1)
  }

  if (!course) {
    return (
      <section className="course-center-empty">
        <p className="course-center-eyebrow">未知课程</p>
        <h1>学习内容不存在</h1>
        <Link to={defaultCatalogUrl}>返回课程目录</Link>
      </section>
    )
  }

  return (
    <article className="course-center-learning">
      <p className="course-center-eyebrow">学习页面</p>
      <h1>正在学习：{course.title}</h1>
      <p>这里使用固定大纲观察页面切换，不加载远程数据，也不保存学习进度。</p>
      <ol>
        {course.outline.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <div className="course-center-actions">
        {canGoBack ? (
          <button type="button" data-testid="course-back" onClick={handleBack}>
            返回上一页
          </button>
        ) : (
          <Link to={`/courses/${course.id}`}>查看课程详情</Link>
        )}
        <Link to={defaultCatalogUrl}>课程目录</Link>
      </div>
    </article>
  )
}

/** 为 Demo 内未匹配的路径渲染可恢复空态。 */
function CourseNotFoundPage() {
  const location = useLocation()

  return (
    <section className="course-center-empty" data-testid="course-center-not-found">
      <p className="course-center-eyebrow">未匹配路径</p>
      <h1>页面不存在</h1>
      <p className="course-center-mono">{location.pathname}</p>
      <Link to={defaultCatalogUrl}>返回课程目录</Link>
    </section>
  )
}

const routes = [
  {
    id: 'course-center',
    path: '/',
    Component: CourseCenterLayout,
    children: [
      { index: true, id: 'home', Component: CourseHomePage },
      { path: 'courses', id: 'catalog', Component: CourseCatalogPage },
      { path: 'courses/:courseId', id: 'detail', Component: CourseDetailPage },
      { path: 'learning/:courseId', id: 'learning', Component: CourseLearningPage },
      { path: '*', id: 'not-found', Component: CourseNotFoundPage },
    ],
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建独立的课程中心内存 history。 */
export function createCourseCenterDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  })

  /** 挂载课程中心自己的 RouterProvider。 */
  function CourseCenterDemo() {
    return (
      <section className="course-center-demo" data-testid="course-center-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return CourseCenterDemo
}
