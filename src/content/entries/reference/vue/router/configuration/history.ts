/**
 * Vue Router 参考：History、滚动行为与三种 history factory
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 API/Guide、本地 5.2.0 类型声明与固定 commit 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const setupEntryId = 'vue.router.learn.basics.setup-first-router'
const scrollEntryId = 'vue.router.learn.advanced.scroll-history-deployment'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.configuration.history',
  type: 'reference',
  title: 'History 与滚动行为',
  summary:
    '查阅 history state、底层适配器、滚动回调及 web、hash、memory 三种 history factory 的固定契约与选择边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'configuration',
  related: [setupEntryId, scrollEntryId],
  tags: [
    'Vue Router',
    'HistoryState',
    'RouterHistory',
    'RouterScrollBehavior',
    'createMemoryHistory',
    'createWebHashHistory',
    'createWebHistory',
    'scrollBehavior',
  ],
  sources: [
    {
      title: 'Vue Router API：HistoryState',
      url: 'https://router.vuejs.org/api/interfaces/historystate',
    },
    {
      title: 'Vue Router API：RouterHistory',
      url: 'https://router.vuejs.org/api/interfaces/routerhistory',
    },
    {
      title: 'Vue Router API：RouterScrollBehavior',
      url: 'https://router.vuejs.org/api/interfaces/routerscrollbehavior',
    },
    {
      title: 'Vue Router API：createMemoryHistory()',
      url: 'https://router.vuejs.org/api/functions/creatememoryhistory',
    },
    {
      title: 'Vue Router API：createWebHashHistory()',
      url: 'https://router.vuejs.org/api/functions/createwebhashhistory',
    },
    {
      title: 'Vue Router API：createWebHistory()',
      url: 'https://router.vuejs.org/api/functions/createwebhistory',
    },
    {
      title: 'Vue Router Guide：Scroll Behavior',
      url: 'https://router.vuejs.org/guide/advanced/scroll-behavior',
    },
    {
      title: 'Vue Router Guide：Different History modes',
      url: 'https://router.vuejs.org/guide/essentials/history-mode',
    },
    {
      title: 'Vue Router 5.2.0：history/common.ts',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/history/common.ts',
    },
    {
      title: 'Vue Router 5.2.0：history/memory.ts',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/history/memory.ts',
    },
    {
      title: 'Vue Router 5.2.0：history/hash.ts',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/history/hash.ts',
    },
    {
      title: 'Vue Router 5.2.0：history/html5.ts',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/history/html5.ts',
    },
    {
      title: 'Vue Router 5.2.0：scrollBehavior.ts',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/scrollBehavior.ts',
    },
    {
      title: 'Vue Router 5.2.0：router.ts',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts',
    },
    {
      title: 'Vue Router 常见误用：手工覆盖 history.state',
      url: 'https://github.com/vuejs/router/discussions/1649',
    },
    {
      title: 'Vue Router 常见误用：丢失 Router history state',
      url: 'https://github.com/vuejs/router/issues/366',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    'History State',
    'Router History',
    'Router Scroll Behavior',
    'Create Memory History',
    'Create Web Hash History',
    'Create Web History',
    '模式选择',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `type HistoryStateValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | HistoryState
  | HistoryStateValue[]

interface HistoryState {
  [key: number]: HistoryStateValue
  [key: string]: HistoryStateValue
}

type NavigationCallback = (
  to: string,
  from: string,
  information: {
    type: 'pop' | 'push'
    direction: 'back' | 'forward' | ''
    delta: number
  },
) => void

interface RouterHistory {
  readonly base: string
  readonly location: string
  readonly state: HistoryState
  push(to: string, data?: HistoryState): void
  replace(to: string, data?: HistoryState): void
  go(delta: number, triggerListeners?: boolean): void
  listen(callback: NavigationCallback): () => void
  createHref(location: string): string
  destroy(): void
}

type ScrollPosition =
  | { behavior?: ScrollBehavior; left?: number; top?: number }
  | { behavior?: ScrollBehavior; el: string | Element; left?: number; top?: number }

interface RouterScrollBehavior {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    savedPosition: { left: number; top: number; behavior?: ScrollBehavior } | null,
  ): ScrollPosition | false | void | PromiseLike<ScrollPosition | false | void>
}

declare function createMemoryHistory(base?: string): RouterHistory
declare function createWebHashHistory(base?: string): RouterHistory
declare function createWebHistory(base?: string): RouterHistory`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        'Vue Router 把“匹配哪条 route”与“位置保存在哪里”分开：Router 负责匹配和导航流程，`RouterHistory` 适配器负责 location、state、href 与前进后退。应用通常只需把一个 factory 的返回值交给 `createRouter({ history })`，再按运行环境决定 web、hash 或 memory 模式。',
    },
    {
      type: 'table',
      headers: ['入口', '稳定性', '主要问题'],
      rows: [
        ['`HistoryState`', 'public / merged', '某条 history entry 能保存哪些 state 值'],
        ['`RouterHistory`', 'alpha / detail', 'Router 对底层 history adapter 的接口要求'],
        ['`RouterScrollBehavior`', 'public / merged', '导航提交后返回什么滚动目标'],
        ['三个 history factory', 'public / detail', 'URL、初始位置和部署责任如何选择'],
      ],
    },
    { type: 'heading', content: 'History State' },
    {
      type: 'text',
      content:
        '`HistoryState` 描述可写入一条 history entry 的附加数据。5.2.0 类型值域是字符串、数字、布尔值、`null`、`undefined`、递归对象和数组；函数、Symbol 与响应式代理不属于该契约。通过 `router.push()` 或 `router.replace()` 的 `state` 传入时，web adapter 会把用户字段与自己的 `back`、`current`、`forward`、`position` 和滚动字段一起保存。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { HistoryState } from 'vue-router'

const state: HistoryState = {
  openedFrom: 'search',
  filters: ['published', 'featured'],
  page: 2,
}

await router.push({
  name: 'article',
  params: { id: '42' },
  state,
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '不要把 `history.state` 当成持久业务仓库。它跟随单条浏览历史记录，页面刷新后是否仍在取决于该记录是否保留；敏感数据、跨设备状态和需要查询的业务数据应放在对应的持久层。',
    },
    { type: 'heading', content: 'Router History' },
    {
      type: 'text',
      content:
        '`RouterHistory` 是 `createRouter()` 消费的底层 adapter 接口。它暴露当前 `base`、`location`、`state`，提供 `push()`、`replace()`、`go()`，允许 Router 监听外部 pop 导航、生成 href，并在销毁时清理监听器。三个官方 factory 都返回这个接口。',
    },
    {
      type: 'table',
      headers: ['成员', '契约'],
      rows: [
        ['`base`', '所有 href 的逻辑根路径，只读'],
        ['`location` / `state`', '当前适配器位置与当前 entry state，只读'],
        ['`push()` / `replace()`', '新增或替换当前位置，并可附带 HistoryState'],
        ['`go()`', '按 delta 遍历；可选择暂停本次 listener 通知'],
        ['`listen()`', '订阅外部位置变化，返回注销函数'],
        ['`createHref()`', '把内部 location 转成可用于链接的 href'],
        ['`destroy()`', '移除 adapter 持有的监听器；具体状态清理取决于实现'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouterHistory` 在 5.2.0 固定源码中带 `@alpha`。类型可用于接住 factory 返回值，但它不是鼓励普通应用自行实现 adapter 的稳定扩展承诺；常规浏览器、SSR 与测试应优先使用三个官方 factory。',
    },
    { type: 'heading', content: 'Router Scroll Behavior' },
    {
      type: 'text',
      content:
        '`RouterScrollBehavior` 是 `createRouter({ scrollBehavior })` 的回调类型。`to` 是目标标准化位置，`from` 是来源位置，`savedPosition` 在可恢复的 history entry 上提供坐标，否则为 `null`。回调可返回窗口坐标、带 `el` 的元素目标、`false`、`void`，也可返回这些值的 Promise-like 结果。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createRouter, createWebHistory } from 'vue-router'
import type { RouterScrollBehavior } from 'vue-router'

/** 为返回历史、页面锚点和普通导航选择滚动目标。 */
const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  if (savedPosition) return savedPosition
  if (to.hash) return { el: to.hash }
  return { left: 0, top: 0 }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior,
})`,
    },
    {
      type: 'text',
      content:
        '带 `el` 时可以传元素或选择器；`top`、`left` 表示相对目标元素的偏移。仅在 URL 中写入 `to.hash` 不会自动成为 Router 的滚动策略，应用仍需返回 `{ el: to.hash }`。返回 Promise 适合等待真实的页面过渡完成信号，但导航 Promise 与滚动 Promise 不是同一个完成点。',
    },
    { type: 'heading', content: 'Create Memory History' },
    {
      type: 'text',
      content:
        '`createMemoryHistory(base?)` 在内存队列中保存位置，不读取也不改写浏览器地址栏。它从特殊空位置开始，调用方必须用当前请求或测试目标主动完成首导航。`base` 仍会影响 `createHref()`，所以 memory 不等于“没有 base”或“没有可遍历队列”。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createMemoryHistory, createRouter } from 'vue-router'

/** 为当前 SSR 请求创建隔离 Router，并先导航到请求 URL。 */
async function createRequestRouter(requestUrl: string) {
  const router = createRouter({
    history: createMemoryHistory('/academy'),
    routes,
  })

  await router.push(requestUrl)
  await router.isReady()
  return router
}`,
    },
    { type: 'heading', content: 'Create Web Hash History' },
    {
      type: 'text',
      content:
        '`createWebHashHistory(base?)` 把 route location 放在第一个 `#` 后。fragment 不会发送给服务器，因此无法配置任意路径 fallback 时可使用它；代价是公开 URL 带 hash、传统页面锚点语义被占用，并且 SEO 表现与普通 pathname 不同。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const router = createRouter({
  history: createWebHashHistory('/academy/'),
  routes,
})

// 内部 route /guide/start 对应 /academy/#/guide/start
const href = router.resolve('/guide/start').href`,
    },
    {
      type: 'text',
      content:
        '有 host 时，未传 base 默认使用当前 `location.pathname + location.search`；传入的 base 若不含 `#`，5.2.0 会补上。`file://` 没有 host 时传入 base 会被忽略。页面存在 `<base>` 时，其 href 仍会影响底层 `pushState()`，应与显式参数在 `#` 前的部分保持一致。',
    },
    { type: 'heading', content: 'Create Web History' },
    {
      type: 'text',
      content:
        '`createWebHistory(base?)` 使用浏览器 History API，让 route 直接出现在 pathname 中，是普通 SPA 的首选。它读取当前浏览器 URL 作为初始位置；`base` 表示应用部署根路径，并参与当前 location 的剥离以及链接 href 的生成。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const router = createRouter({
  history: createWebHistory('/academy/'),
  routes,
})

// 内部 route /guide/start 对应 /academy/guide/start
const href = router.resolve('/guide/start').href`,
    },
    {
      type: 'text',
      content:
        '首次打开或刷新 `/academy/guide/start` 时，请求先到部署服务器，Vue Router 还没有运行。服务器必须保留真实文件和目录，再把 client paths rewrite 到 `/academy/` 下的 SPA 入口；应用内还要用 catch-all route 呈现 NotFound。rewrite 通常返回入口的 HTTP 200，不等于真实 HTTP 404。',
    },
    { type: 'heading', content: '模式选择' },
    {
      type: 'table',
      headers: ['factory', '位置来源与 URL', '适用场景', '必须承担的边界'],
      rows: [
        [
          '`createWebHistory()`',
          '浏览器当前 pathname；公开 URL 无 #',
          '可配置服务器的常规 SPA',
          '深链接 fallback；资源 base、history base 和 rewrite 前缀对齐',
        ],
        [
          '`createWebHashHistory()`',
          '第一个 # 后的 route fragment',
          '静态宿主、file URL 或不能配置 fallback',
          '接受 URL、锚点与 SEO 取舍，并校准 # 前的 base',
        ],
        [
          '`createMemoryHistory()`',
          '内部空位置与内存队列；不改地址栏',
          'SSR、测试、文档或受控嵌入环境',
          '每个上下文独立创建实例，并显式完成首导航',
        ],
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '手工 replaceState() 时覆盖 Router 保存的 state',
          description:
            'web/hash adapter 用同一条 `history.state` 保存 back、current、forward、position 与滚动信息。直接换成只含业务字段的新对象会丢掉这些必要字段。',
          consequence:
            '后续 push、back 或滚动恢复可能读不到当前位置与 position，出现错误 URL、方向误判或运行时异常。',
          wrong: {
            lang: 'ts',
            content: `window.history.replaceState({ panel: 'filters' }, '', window.location.href)`,
          },
          correct: {
            lang: 'ts',
            content: `window.history.replaceState(
  { ...window.history.state, panel: 'filters' },
  '',
  window.location.href,
)`,
          },
        },
        {
          title: '把 RouterHistory alpha 当成稳定自定义 adapter 扩展点',
          description:
            '5.2.0 固定声明明确把 `RouterHistory` 标为 alpha，自定义实现还必须正确处理监听、state、href、遍历和销毁。',
          consequence:
            '升级时可能面对未承诺兼容的接口变化，漏掉 listener 或 state 语义还会破坏 Router 导航。',
          wrong: {
            lang: 'ts',
            content: `const history = buildPartialCustomHistory()
createRouter({ history, routes })`,
          },
          correct: {
            lang: 'ts',
            content: `const history = createWebHistory()
createRouter({ history, routes })`,
          },
        },
        {
          title: '假定 savedPosition 总有值，或 to.hash 会自动滚动',
          description:
            '`savedPosition` 只在存在可恢复坐标时提供，普通 programmatic push 通常得到 `null`；hash 也必须由回调显式转换为元素目标。',
          consequence: '读取 null 会报错，或 URL 已带锚点但视口仍停在旧位置。',
          wrong: {
            lang: 'ts',
            content: `/** 未处理 null，也没有返回 hash 元素目标。 */
const scrollBehavior: RouterScrollBehavior = (_to, _from, savedPosition) => ({
  top: savedPosition.top,
})`,
          },
          correct: {
            lang: 'ts',
            content: `/** 依次处理恢复坐标、锚点与普通新页面。 */
const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) =>
  savedPosition ?? (to.hash ? { el: to.hash } : { top: 0 })`,
          },
        },
        {
          title: '等待 memory history 自动读取当前 URL',
          description:
            '`createMemoryHistory()` 从特殊空位置开始，不读取浏览器 URL，也不知道 SSR 请求地址。',
          consequence:
            '首屏可能停在 START_LOCATION，RouterView 没有目标匹配或服务端渲染了错误页面。',
          wrong: {
            lang: 'ts',
            content: `const router = createRouter({ history: createMemoryHistory(), routes })
renderToString(app)`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({ history: createMemoryHistory(), routes })

app.use(router)
await router.push(request.url)
await router.isReady()
renderToString(app)`,
          },
        },
        {
          title: '把 hash history 当成没有取舍的 web history 替代品',
          description:
            'hash 模式确实减少 route fallback 要求，但 fragment 不发送给服务器，并占用 URL 的第一个 `#`。',
          consequence: '分享链接、页面内锚点、分析系统或 SEO 行为可能与产品要求不一致。',
          wrong: {
            lang: 'ts',
            content: `// 只为省去部署配置，未评估公开 URL 约束。
const history = createWebHashHistory()`,
          },
          correct: {
            lang: 'ts',
            content: `// 仅在接受 hash URL 取舍且无法提供 fallback 时选择。
const history = createWebHashHistory('/academy/')`,
          },
        },
        {
          title: '使用 web history 却没有配置深链接 fallback',
          description:
            '刷新和直接访问会先请求服务器；此时客户端 Router 尚未启动，无法替服务器返回 SPA 入口。',
          consequence: '站内导航正常，刷新 `/academy/guide/start` 却得到服务器 404。',
          wrong: {
            lang: 'nginx',
            content: `location /academy/ {
  try_files $uri $uri/ =404;
}`,
          },
          correct: {
            lang: 'nginx',
            content: `location /academy/ {
  try_files $uri $uri/ /academy/index.html;
}`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 先按稳定性选择依赖层级',
          content:
            '`history/common.ts` 定义共同 adapter 契约，并给 `RouterHistory` 标记 `@alpha`。应用可稳定使用三个 public factory；只有确有宿主集成需求且接受升级成本时，才评估直接依赖 alpha 接口。',
        },
        {
          title: '2. HistoryState 必须服从可克隆值域',
          content:
            '`HistoryStateValue` 只纳入基本值、递归对象与数组，并明确排除函数和 Symbol。`RouteLocationOptions.state` 还提示不能传响应式值，因此 entry-local 快照应先转为普通数据。',
        },
        {
          title: '3. memory 适合调用方拥有初始位置的环境',
          content:
            '`history/memory.ts` 用 `[["", {}]]` 初始化队列，location 不来自地址栏。SSR 可把每个请求 URL 主动 push 后等待 ready；测试可为每个用例创建并销毁独立实例。',
        },
        {
          title: '4. hash 适合服务器看不到 client route 的部署',
          content:
            '`history/hash.ts` 在有 host 时补齐包含 `#` 的 base，再委托 HTML5 adapter。服务器只接收 `#` 前的入口路径，所以通常无需为 fragment route 配置 fallback，但公开 URL 的取舍仍然存在。',
        },
        {
          title: '5. web 适合服务器能统一回退 SPA 入口的场景',
          content:
            '`history/html5.ts` 从 `window.location` 计算当前 route，并用 `pushState()` / `replaceState()` 更新 entry。首次深链接发生在这些代码运行之前，因此 rewrite、静态资源和 HTTP 状态仍由部署层负责。',
        },
        {
          title: '6. scrollBehavior 只在目标仍为 current 时应用结果',
          content:
            '`router.ts` 的 `handleScroll()` 在 `nextTick()` 后调用回调；5.2.0 在应用滚动结果和上报错误前都比较目标 route 是否仍为 `currentRoute`。这能丢弃过期导航的滚动结果，但不是通用任务取消协议。',
        },
        {
          title: '7. savedPosition 属于 history entry，而不是 route 名称',
          content:
            'Router 的 pop listener 按离开 entry 的 history position 与 fullPath 把当前坐标写入一次性 Map，`handleScroll()` 再按目标 entry 查找；web adapter 还会在 programmatic push 与 pagehide 时把坐标写入 `history.state.scroll` 作为恢复来源。它适合 back/forward 恢复，普通 push 应另给 `{ top: 0 }`、锚点或不滚动策略。',
        },
      ],
    },
  ],
})
