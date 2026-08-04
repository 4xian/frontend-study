/**
 * 课程：路由 Meta 与导航守卫
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 Guide/API 与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const compositionEntryId = 'vue.router.learn.basics.composition-programmatic-navigation'
const configurationEntryId = 'vue.router.learn.intermediate.named-routes-redirects-aliases'
const viewsEntryId = 'vue.router.learn.intermediate.named-views-route-props'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.intermediate.meta-navigation-guards',
  type: 'lesson',
  title: '路由 Meta 与导航守卫',
  summary: '用类型化 Meta 表达访问约束，按导航阶段安排放行、取消和重定向',
  ecosystem: 'vue',
  module: 'router',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: [compositionEntryId, configurationEntryId, viewsEntryId],
  related: [compositionEntryId, configurationEntryId, viewsEntryId],
  tags: ['Vue Router', 'RouteMeta', 'navigation guards', 'authorization', 'guard order'],
  sources: [
    {
      title: 'Vue Router：Route Meta Fields',
      url: 'https://router.vuejs.org/guide/advanced/meta',
    },
    {
      title: 'Vue Router：Navigation Guards',
      url: 'https://router.vuejs.org/guide/advanced/navigation-guards',
    },
    {
      title: 'Vue Router API：RouteMeta',
      url: 'https://router.vuejs.org/api/interfaces/routemeta',
    },
    {
      title: 'Vue Router 5.2.0 navigationGuards.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts',
    },
    {
      title: 'Vue Router 5.2.0 router.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  estimatedMinutes: 65,
})

export default defineLesson({
  meta,
  objectives: [
    '为 RouteMeta 扩展项目内的访问约束类型',
    '区分 route.matched 的记录数组与 route.meta 的非递归浅合并',
    '按 global、per-route 和 in-component 阶段安排守卫',
    '用 return undefined、false 或 location 表达放行、取消与重定向',
    '识别 beforeResolve 与 afterEach 在导航管线中的不同职责',
  ],
  blocks: [
    { type: 'heading', content: 'Meta 描述记录，守卫执行决策' },
    {
      type: 'text',
      content:
        'meta 是 route record 上的任意结构数据，适合表达需要登录、必须具有某个角色、页面转场名等稳定属性。守卫读取 to.meta 后决定导航结果：不返回值或返回 true 放行，返回 false 取消，返回 route location 触发新的重定向。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.loggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiredRole && auth.role !== to.meta.requiredRole) {
    return false
  }
})`,
    },
    { type: 'heading', content: '用模块扩展固定 Meta 契约' },
    {
      type: 'text',
      content:
        'RouteMeta 默认可索引，但项目内应用模块扩展给常用字段加上可选性和联合类型。扩展文件必须被 tsconfig 包含，且至少有一个 import 或 export，才会被当成模块。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import 'vue-router'
export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiredRole?: 'member' | 'admin'
    area?: string
  }
}`,
    },
    { type: 'heading', content: 'route.meta 是父到子的非递归浅合并' },
    {
      type: 'text',
      content:
        'route.matched 保留所有命中记录，可以逐条查看原始 meta。route.meta 则从父记录到子记录用浅层 assign 合并：同名顶层 key 由子记录覆盖，嵌套对象不会递归合并。权限字段优先设计为独立顶层 key，避免无意丢失父级子字段。',
    },
    {
      type: 'compare',
      labels: ['matched 原始记录', '最终 route.meta'],
      before:
        '父：{ requiresAuth: true, policy: { audit: true } }\n子：{ requiredRole: admin, policy: { export: true } }',
      after:
        '{ requiresAuth: true, requiredRole: admin, policy: { export: true } }\npolicy.audit 不会被递归保留。',
    },
    { type: 'heading', content: '守卫顺序跟随记录的离开、复用与进入' },
    {
      type: 'table',
      headers: ['阶段', '运行时机', '常见职责'],
      rows: [
        ['beforeRouteLeave', '已激活组件将离开', '未保存更改'],
        ['beforeEach', '每次导航的全局前置', '登录与全局政策'],
        ['beforeRouteUpdate', '同记录组件复用', '参数变化校验'],
        ['beforeEnter', '第一次进入记录', '特定记录约束'],
        ['beforeRouteEnter', '新组件激活前', '视图级进入准备'],
        ['beforeResolve', '所有进入守卫通过后', '提交前最后校验'],
        ['afterEach', '导航已确认或失败', '分析、标题、结果观察'],
      ],
    },
    {
      type: 'text',
      content:
        'afterEach 是后置 hook，可接收 failure 观察已发生的结果，但不能再返回 false 阻止导航。新代码优先使用 return 风格；next 只作为兼容知识，一次守卫的每条可达分支都必须恰好调用一次。',
    },
    { type: 'heading', content: '用角色矩阵观察三种导航结果' },
    {
      type: 'text',
      content:
        '下面的 mini-app 在访客、成员和管理员三个角色下访问同一份嵌套报表。访客被重定向登录，成员被 false 取消，管理员按完整守卫顺序放行。可见区同时展示 matched meta 与浅合并后的 route.meta。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.intermediate.meta-navigation-guards.meta-navigation-guards-lab-demo',
      description: '用三种角色对比 redirect、cancel 和 allow 的守卫时间线',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '认为嵌套 meta 对象会深合并',
          description: 'route.meta 只对各 record.meta 执行顶层浅合并。',
          consequence: '子记录的 policy 整体覆盖父记录，权限约束意外丢失。',
          wrong: {
            lang: 'ts',
            content: `// 父 policy: { auth: true }；子 policy: { role: 'admin' }
to.meta.policy.auth // 误以为仍为 true`,
          },
          correct: {
            lang: 'ts',
            content: `// 使用独立顶层 key
meta: { requiresAuth: true, requiredRole: 'admin' }`,
          },
        },
        {
          title: '只检查最后一条 matched record',
          description: '父记录也可以携带必须继承的 meta 约束。',
          consequence: '子记录未重复声明 requiresAuth 时，登录检查被绕过。',
          wrong: {
            lang: 'ts',
            content: `to.matched.at(-1)?.meta.requiresAuth`,
          },
          correct: {
            lang: 'ts',
            content: `to.meta.requiresAuth`,
          },
        },
        {
          title: '在 afterEach 中返回 false 试图阻止导航',
          description: 'afterEach 运行时导航已经确认或已得到失败结果。',
          consequence: '返回值被忽略，受保护页面已经进入。',
          wrong: {
            lang: 'ts',
            content: `router.afterEach(() => false)`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach((to) => to.meta.blocked ? false : undefined)`,
          },
        },
        {
          title: '在同一守卫中同时 return 与调用 next',
          description: '两种风格都能表达结果，但同一函数混用会破坏单一结算点。',
          consequence: '导航可能被重复结算，或在某条分支悬挂。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach((to, from, next) => { next(); return false })`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach((to) => to.meta.blocked ? false : undefined)`,
          },
        },
        {
          title: '兼容 next 风格的分支调用两次',
          description: '一次守卫中，每条可达路径都必须恰好调用一次 next。',
          consequence: '路由器产生警告或不确定导航结果。',
          wrong: {
            lang: 'ts',
            content: `if (!ok) next('/login')
next()`,
          },
          correct: {
            lang: 'ts',
            content: `if (!ok) return next('/login')
next()`,
          },
        },
        {
          title: '重定向守卫没有排除登录页',
          description: '新的 location 会重新进入完整守卫管线。',
          consequence: '登录页也被判定为需登录，导航在同一目标之间无限重定向。',
          wrong: {
            lang: 'ts',
            content: `if (!loggedIn) return { name: 'login' }`,
          },
          correct: {
            lang: 'ts',
            content: `if (to.meta.requiresAuth && !loggedIn) return { name: 'login' }`,
          },
        },
        {
          title: '期望 beforeEnter 在参数变化时重新运行',
          description:
            'beforeEnter 只在进入新 record 时运行，同 record 的 params/query/hash 变化不会触发。',
          consequence: '从 /users/1 到 /users/2 时未执行预期校验。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/users/:id', beforeEnter: validateEveryIdChange }`,
          },
          correct: {
            lang: 'ts',
            content: `onBeforeRouteUpdate((to) => validateId(to.params.id))`,
          },
        },
        {
          title: '异步守卫忘记返回或等待决策',
          description: '导航在守卫 Promise 结算前保持 pending，决策必须沿返回值传回路由器。',
          consequence: '验证尚未完成就继续导航，或一直悬挂在 pending。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach(() => { checkAccess().then(ok => ok ? true : false) })`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach(async () => (await checkAccess()) || false)`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. meta 合并是顺序浅 assign',
          content:
            '解析后的 matched 记录从父到子遍历，每个 record.meta 浅层写入同一对象。需要保留每层原始结构时遍历 matched；需要最终政策时读 to.meta，并尽量使用扁平 key。',
        },
        {
          title: '2. 记录身份决定 leave/update/enter 队列',
          content:
            '路由器比较 from/to.matched 的记录身份，把它们分成 leaving、updating 和 entering。因此 beforeEnter 适合“第一次进入该记录”的约束，参数复用场景应放在 update guard。',
        },
        {
          title: '3. 守卫返回值被统一转换为 Promise',
          content:
            'guardToPromiseFn 把 return false、location、Error 以及无返回值转换为统一导航结果。新代码使用 return 能让每条分支只有一个结算值，比同时管理 next 回调更容易审查。',
        },
        {
          title: '4. afterEach 是观察点，不是决策点',
          content:
            '导航确认或失败后，router 才把 to/from/failure 交给 afterEach。这里适合记录分析、发送页面观察事件和读取 failure；需要改变结果的规则必须放在前置守卫。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '为嵌套管理页设计扁平 Meta',
      instructions:
        '父级所有页面需要登录，报表子页只允许 admin，并使用 reports 区域标记。写出记录 meta 与守卫。',
      answer: `// 父记录
meta: { requiresAuth: true }

// 报表子记录
meta: { requiredRole: 'admin', area: 'reports' }

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.loggedIn) return { name: 'login' }
  if (to.meta.requiredRole && auth.role !== to.meta.requiredRole) return false
})`,
    },
    {
      type: 'checklist',
      items: [
        { label: '使用模块扩展约束常用 RouteMeta 字段' },
        { label: 'route.meta 是父到子的非递归浅合并' },
        { label: '全局政策放 beforeEach，记录约束放 beforeEnter' },
        { label: '使用 return 表达 allow、cancel 和 redirect' },
        { label: 'afterEach 只观察最终结果，不阻止导航' },
        { label: '重定向守卫排除目标页，避免循环' },
      ],
    },
  ],
  exercises: ['依次使用访客、成员和管理员访问报表，解释每条时间线停在哪个守卫阶段。'],
  recap: [
    'RouteMeta 模块扩展让访问约束具有稳定类型。',
    'route.matched 保留原始记录，route.meta 是父到子的浅合并。',
    '守卫按离开、全局前置、复用、记录进入、组件进入、全局解析顺序执行。',
    'undefined/true、false 和 location 分别表达放行、取消和重定向。',
    'afterEach 观察已结算的导航，无法再改变结果。',
  ],
})
