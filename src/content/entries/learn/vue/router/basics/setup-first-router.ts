/**
 * 课程：建立第一个路由器
 * 查证日期：2026-08-03
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 Guide/API 与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.basics.setup-first-router',
  type: 'lesson',
  title: '建立第一个路由器',
  summary: '从路由表、history 和插件安装开始，建立一份不会混淆 router 与 route 的最小配置',
  ecosystem: 'vue',
  module: 'router',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [],
  related: ['vue.core.reference.application.create-app', 'vue.core.learn.basics.component-basics'],
  tags: ['Vue Router', 'createRouter', 'createMemoryHistory', 'route record', '插件'],
  sources: [
    {
      title: 'Vue Router：Getting Started',
      url: 'https://router.vuejs.org/guide/',
    },
    {
      title: 'Vue Router：History modes',
      url: 'https://router.vuejs.org/guide/essentials/history-mode',
    },
    {
      title: 'Vue Router API：createRouter()',
      url: 'https://router.vuejs.org/api/functions/createrouter',
    },
    {
      title: 'Vue Router API：createMemoryHistory()',
      url: 'https://router.vuejs.org/api/functions/creatememoryhistory',
    },
    {
      title: 'Vue Router 5.2.0 router.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts',
    },
    {
      title: 'Vue Router 5.2.0 index.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/index.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-03',
  estimatedMinutes: 35,
})

export default defineLesson({
  meta,
  objectives: [
    '区分 routes、history、router 和当前 route 的职责',
    '使用 createRouter() 创建包含两条静态记录的路由器',
    '根据运行环境选择 web、hash 或 memory history',
    '在 mount() 前通过 app.use(router) 安装插件',
    '为 memory history 显式发起首次导航并观察 currentRoute',
  ],
  blocks: [
    { type: 'heading', content: '先认识四个不同对象' },
    {
      type: 'text',
      content:
        '路由配置不是一个神秘的全局开关。routes 是可匹配的记录集合，history 负责承载位置，router 组合匹配、导航与插件能力，而 route 是某一次导航解析后的当前位置。先把四者分开，后续学习参数、守卫和嵌套出口时才不会把读取状态与发出命令混为一谈。',
    },
    {
      type: 'table',
      headers: ['对象', '主要职责', '常见操作'],
      rows: [
        ['routes', '声明路径与页面组件的对应关系', '定义 RouteRecordRaw[]'],
        ['history', '保存和切换位置', '选择 web、hash 或 memory 模式'],
        ['router', '匹配、导航并安装 Vue 插件', 'push、replace、app.use'],
        ['route', '描述当前已解析的位置', '读取 path、name、matched'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'router 是长期存在的命令与协调对象；route 是会随导航变化的状态。命名时保留这个差异，比使用含糊的 routerInfo 更容易读懂。',
    },
    { type: 'heading', content: '用三项配置创建 router' },
    {
      type: 'text',
      content:
        'createRouter() 的最小配置包含 history 和 routes。每条 route record 至少需要 path，并通过 component 指定匹配后渲染的页面。根级路径以 / 开头；组件可以是直接导入的组件，也可以在后续懒加载课程中改为返回 import() 的函数。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})`,
    },
    {
      type: 'text',
      content:
        'createRouter() 会用 routes 建立 matcher，并保存传入的 history。它只创建路由器实例，不会自动把 RouterView、RouterLink、$router 或组合式 API 注入任何 Vue 应用；安装插件是下一步。',
    },
    { type: 'heading', content: '按运行环境选择 history' },
    {
      type: 'table',
      headers: ['模式', '地址栏表现', '适合场景', '额外责任'],
      rows: [
        ['createWebHistory()', '/courses/vue', '常规浏览器 SPA', '服务器需回退到 index.html'],
        ['createWebHashHistory()', '/#/courses/vue', '无法配置服务器回退', 'hash 不会发送给服务器'],
        [
          'createMemoryHistory()',
          '不改变浏览器 URL',
          'SSR、测试、嵌入式 Demo',
          'SSR 与隔离场景应显式导航',
        ],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'memory history 很适合本课的隔离 Demo，但不是普通浏览器站点的默认选择。它不会读取地址栏，也不会替你建立可用的浏览器前进后退记录。',
    },
    { type: 'heading', content: '先安装插件，再挂载应用' },
    {
      type: 'text',
      content:
        'app.use(router) 会调用 router 的 install seam：注册 RouterLink 和 RouterView，提供 $router/$route 与组合式 API 所需的注入，并触发初始路由解析。Vue 插件必须在 app.mount() 之前安装，否则已经挂载的组件拿不到这些能力。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')`,
    },
    {
      type: 'text',
      content:
        'web 与 hash history 会从浏览器当前地址开始解析，memory history 则从一个特殊的 nowhere 位置开始且不读取地址栏。浏览器中 app.use(router) 会尝试导航到 memory history 的当前内部位置；SSR 不会自动启动这次导航。测试、SSR 或独立 Demo 仍应在安装插件后显式调用 push() 或 replace()，让首个位置不依赖运行环境与空位置的归一化结果。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const app = createApp(App)
app.use(router)

await router.push('/')
await router.isReady()

app.mount('#app')`,
    },
    { type: 'heading', content: '在隔离 Demo 中观察 currentRoute' },
    {
      type: 'text',
      content:
        '下面的运行区创建自己的 Vue mini-app、memory history 和两条静态 route。按钮只调用这份独立 router；页面同时展示 currentRoute 的 path、name 与 matched 名称，并记录宿主课程页 URL，验证示例导航没有污染站点路由。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.basics.setup-first-router.first-router-lab-demo',
      description: '在独立 memory history 中初始化首页并切换两条静态路由',
      playground: true,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '调试时先看 router.currentRoute.value，而不是只看 window.location。memory history 的当前 route 会变化，浏览器地址栏保持不变，这正是隔离测试和嵌入式示例需要的行为。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在 mount() 之后才安装 router',
          description:
            '插件安装负责提供路由组件、全局属性和注入。根组件开始 setup 后再 use(router)，已经发生的依赖解析不会倒退重来。',
          consequence:
            'RouterView、useRouter() 或 $route 在首轮渲染时不可用，初始导航也可能错过正确时机。',
          wrong: {
            lang: 'ts',
            content: `const app = createApp(App)
app.mount('#app')
app.use(router)`,
          },
          correct: {
            lang: 'ts',
            content: `const app = createApp(App)
app.use(router)
app.mount('#app')`,
          },
        },
        {
          title: '省略 history，认为 router 会自动选择',
          description:
            'history 是 createRouter() 的必需选项，决定位置如何保存以及是否连接浏览器 URL；Vue Router 不替应用猜测部署方式。',
          consequence: '开发模式直接抛出缺少 history 的错误，类型检查也无法通过 RouterOptions。',
          wrong: {
            lang: 'ts',
            content: `const router = createRouter({
  routes,
})`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({
  history: createWebHistory(),
  routes,
})`,
          },
        },
        {
          title: '把 memory history 的首个位置交给隐式默认值',
          description:
            'createMemoryHistory() 从 nowhere 位置开始且不读取地址栏。浏览器安装 router 时会尝试导航到它的当前内部位置，SSR 则不会自动启动导航，因此不能把两种环境当成同一时序。',
          consequence:
            '浏览器可能把空内部位置归一化为 /，SSR 仍停在 START_LOCATION；当首屏目标不是根路径时，渲染结果还会与应用意图不一致。',
          wrong: {
            lang: 'ts',
            content: `const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

app.use(router)
app.mount('#app')`,
          },
          correct: {
            lang: 'ts',
            content: `app.use(router)
await router.replace('/')
await router.isReady()
app.mount('#app')`,
          },
        },
        {
          title: '把 router 与当前 route 当成同一个对象',
          description:
            'router 提供 push/replace 等命令，currentRoute.value 才是当前解析结果。把两者混用会让读取和导航代码难以判断。',
          consequence:
            '读取 router.path 得到 undefined，或试图修改 route 来发起导航却没有任何效果。',
          wrong: {
            lang: 'ts',
            content: `console.log(router.path)
router.path = '/about'`,
          },
          correct: {
            lang: 'ts',
            content: `console.log(router.currentRoute.value.path)
await router.push('/about')`,
          },
        },
        {
          title: '用 memory history 导航后检查 window.location',
          description:
            'memory history 故意不连接浏览器地址栏。它的状态保存在内存中，当前结果应从 router.currentRoute 观察。',
          consequence: '测试会误判导航没有发生，或者为了让断言通过而错误地改用宿主 web history。',
          wrong: {
            lang: 'ts',
            content: `await router.push('/about')
expect(window.location.pathname).toBe('/about')`,
          },
          correct: {
            lang: 'ts',
            content: `await router.push('/about')
expect(router.currentRoute.value.path).toBe('/about')`,
          },
        },
        {
          title: '让嵌入式 Demo 复用站点 router',
          description:
            '同一个 router 持有 matcher、history listener 和当前 route。示例注册记录或导航时会直接影响课程站点本身。',
          consequence:
            '点击 Demo 会改写详情页 URL、滚动与返回栈，离开页面后还可能残留路由记录或守卫。',
          wrong: {
            lang: 'ts',
            content: `import siteRouter from '@/router'

await siteRouter.push('/about')`,
          },
          correct: {
            lang: 'ts',
            content: `const demoRouter = createRouter({
  history: createMemoryHistory(),
  routes: demoRoutes,
})

await demoRouter.push('/')`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '把 router 创建集中在单一模块',
          content:
            'createRouter() 会立即建立 matcher、回调集合和 currentRoute。应用入口只导入并安装同一实例，可避免页面各自创建互不相通的导航状态。',
        },
        {
          title: '让 history 选择反映部署责任',
          content:
            'history 是显式依赖而不是环境猜测。可配置 SPA fallback 时选 web；无法配置时评估 hash；无浏览器 URL 或必须隔离时选 memory。',
        },
        {
          title: '用独立 memory router 测试导航规则',
          content:
            'memory history 不写地址栏，适合组件测试、SSR 和文档 Demo。测试直接断言 currentRoute 与渲染结果，不需要伪造真实浏览器历史。',
        },
        {
          title: '把 app.use() 看成能力安装边界',
          content:
            'install seam 同时注册组件、全局属性与注入。插件依赖应在 mount 前一次性完成，根组件之后只消费已经建立的应用上下文。',
        },
        {
          title: '显式提交 memory history 的首个位置',
          content:
            'nowhere 起点让服务端和测试自行决定初始 URL。先 push/replace，再等待 isReady，可让首屏渲染和断言从确定状态开始。',
        },
        {
          title: '用 currentRoute 连接命令与可观察结果',
          content:
            'push/replace 是输入，currentRoute 是导航提交后的公开状态。记录 path、name 与 matched 能帮助排查“地址改变但记录未命中”等配置问题。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '建立一个只在内存中导航的帮助中心',
      instructions:
        '创建包含 / 与 /faq 两条静态记录的 router，使用 createMemoryHistory()。在 app.use(router) 后 replace 到 /，等待 isReady 再挂载；导航到 /faq 后分别记录 currentRoute.value.path 与 window.location.pathname，解释二者为何不同。',
      answer: `const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/faq', component: FaqView },
  ],
})

const app = createApp(App)
app.use(router)
await router.replace('/')
await router.isReady()
app.mount('#app')

await router.push('/faq')
console.log(router.currentRoute.value.path) // /faq
console.log(window.location.pathname) // 宿主页面路径，不会被 memory history 改写`,
    },
    {
      type: 'checklist',
      items: [
        { label: 'createRouter() 同时收到明确的 history 和 routes' },
        { label: 'router 在 app.mount() 之前通过 app.use() 安装' },
        { label: 'memory history 显式提交首个真实位置' },
        { label: '导航命令由 router 发出，当前状态从 currentRoute 读取' },
        { label: '嵌入式 Demo 和测试不复用宿主 router' },
      ],
    },
  ],
  exercises: ['把第二条记录改成 /help，确认 routes、按钮目标和 currentRoute 断言同步更新。'],
  recap: [
    'routes 声明可匹配记录，history 承载位置，router 负责导航，route 描述当前位置。',
    'createRouter() 必须显式接收 history；浏览器 SPA 通常使用 web history。',
    'app.use(router) 必须早于 mount()，它负责注册组件、全局属性与组合式 API 注入。',
    'memory history 不连接地址栏且从 nowhere 开始；显式首导航可统一浏览器、测试与 SSR 的初始状态。',
    '嵌入式示例和测试应创建独立 router，并通过 currentRoute 观察导航结果。',
  ],
})
