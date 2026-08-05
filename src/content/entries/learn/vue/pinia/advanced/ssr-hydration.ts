/**
 * 课程：SSR 与 Hydration
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia/Vue 官方文档、Pinia 固定 commit 源码与官方测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const outsideComponentsId = 'vue.pinia.learn.intermediate.outside-components-router'
const pluginsId = 'vue.pinia.learn.advanced.plugins-persistence'
const vueSsrId = 'vue.core.learn.advanced.ssr-hydration'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.store-composition',
  'vue.pinia.learn.intermediate.store-modeling',
  'vue.pinia.learn.intermediate.subscriptions-actions',
  outsideComponentsId,
  pluginsId,
  'vue.pinia.learn.advanced.store-testing',
  vueSsrId,
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.advanced.ssr-hydration',
  type: 'lesson',
  title: 'SSR 与 Hydration',
  summary: '按请求隔离 Pinia，在首个 useStore 前恢复状态，并划清真实 Hydration 证据边界',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'advanced',
  level: 'advanced',
  prerequisites,
  related: [outsideComponentsId, pluginsId, 'vue.pinia.reference.runtime.hydration'],
  tags: ['Pinia', 'SSR', 'Hydration', 'pinia.state.value', 'skipHydrate', 'shouldHydrate', 'XSS'],
  sources: [
    {
      title: 'Pinia：SSR',
      url: 'https://pinia.vuejs.org/ssr/',
    },
    {
      title: 'Pinia：Composables / SSR',
      url: 'https://pinia.vuejs.org/cookbook/composables.html#ssr',
    },
    {
      title: 'Pinia：Pinia.state',
      url: 'https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html#state',
    },
    {
      title: 'Pinia：skipHydrate()',
      url: 'https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html',
    },
    {
      title: 'Pinia：shouldHydrate()',
      url: 'https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html',
    },
    {
      title: 'Pinia 4.0.2 SSR guide',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/ssr/index.md',
    },
    {
      title: 'Pinia 4.0.2 rootStore.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 ssr.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts',
    },
    {
      title: 'Pinia 4.0.2 state.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts',
    },
    {
      title: 'Vue SSR：Cross-Request State Pollution',
      url: 'https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution',
    },
    {
      title: 'Vue SSR：Hydration Mismatch',
      url: 'https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch',
    },
    {
      title: 'Vue：Security',
      url: 'https://vuejs.org/guide/best-practices/security.html',
    },
  ],
  appliesTo: 'Pinia 4.0.2；当前项目为 SPA 内存实验',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 70,
})

export default defineLesson({
  meta,
  objectives: [
    '解释为什么 SSR 必须为每个 request 创建独立 app、router 与 Pinia',
    '在服务端渲染完成后读取 root state，并把传输与安全责任留给宿主',
    '在客户端首个 useStore 前恢复 pinia.state.value',
    '观察 Options Store 在正确与错误恢复顺序下的 direct/$state/root 差别',
    '区分 Setup Store 普通 ref 与顶层 skipHydrate ref 的水合行为',
    '区分 Pinia 内存恢复与真实 Vue DOM hydration 证据',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content:
        '前置：请先完成 L01-L12 和 Vue Core 的 SSR 与 Hydration。本课只运行 Pinia 4.0.2 的 SPA 内存 seam，不创建 SSR server/client 双入口。',
    },
    { type: 'heading', content: '请求级 Pinia 是隔离边界' },
    {
      type: 'text',
      content:
        'SSR 服务进程会复用模块。模块级 Pinia singleton 会让一个请求写入的用户状态有机会被下一个请求读到，因此宿主必须为每次 request 调用 app factory。组件外的 router、service 或 serverPrefetch 路径还应把本请求 Pinia 显式传给 useStore(pinia)，不能依赖进程级 active fallback。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 为单个请求创建彼此隔离的 Vue 与 Pinia 实例。 */
export function createRequestApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app, pinia }
}

/** 渲染一次请求，并在渲染完成后取得最终 root state。 */
export async function renderRequest() {
  const { app, pinia } = createRequestApp()
  const html = await renderToString(app)
  return { html, rootState: pinia.state.value }
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '以上代码只说明官方顺序，省略了 URL、router ready、数据权限、错误边界和安全序列化。本课 Demo 不执行 createSSRApp() 或 renderToString()，因此不能把两个内存 Pinia 称为真实 HTTP request。',
    },
    { type: 'heading', content: 'Root State 不是传输与安全 API' },
    {
      type: 'text',
      content:
        'pinia.state.value 是服务端渲染后取得状态的公开入口，也是客户端恢复入口。Pinia 不负责选择可公开字段、序列化、HTML context escaping、CSP、payload 校验或 parser 配对，这些都属于 SSR 宿主。',
    },
    {
      type: 'table',
      headers: ['阶段', 'Pinia 提供', '宿主负责'],
      rows: [
        ['请求渲染', '独立 root state', 'request factory、数据与权限边界'],
        ['生成快照', 'pinia.state.value', '字段白名单，排除 secret'],
        ['序列化', '无内置 serializer', '选择 serializer 与对应 parser'],
        ['嵌入 HTML', '无内置注入或转义', '按具体 HTML context 防 XSS 并配置 CSP'],
        ['客户端恢复', '可整体赋 root state', '验证 payload，并在首个 useStore 前赋值'],
        ['DOM hydration', '一致的内存 state', '真实 server HTML、client hydrate 与 mismatch 采集'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'Pinia 官方推荐 SSR 环境考虑 devalue，但本仓库没有安装它。JSON-compatible fixture 的 stringify/parse 只能证明内存 round-trip，不能证明把结果原样放进 script 是安全的。',
    },
    { type: 'heading', content: '首个 useStore 是恢复顺序检查点' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 创建客户端 App 与 Pinia',
          content: '此时不要先创建任何 Store。',
        },
        {
          title: '2. 读取并验证宿主 Payload',
          content: 'serializer 与 parser 必须属于同一传输协议。',
        },
        {
          title: '3. 恢复 Root State',
          content: '把已解析状态赋给 pinia.state.value。',
        },
        {
          title: '4. 首次取得 Store',
          content: '此后才调用 useStore(pinia)，再 mount/hydrate。',
        },
      ],
    },
    {
      type: 'compare',
      labels: ['错误：先创建 Store', '正确：先恢复 Root'],
      before: `const pinia = createPinia()
const store = useRequestStore(pinia)
pinia.state.value = initialState

// Pinia 4.0.2：direct 仍可能连接旧对象
store.count !== store.$state.count`,
      after: `const pinia = createPinia()
pinia.state.value = initialState
const store = useRequestStore(pinia)

// direct、$state 与 root 指向同一份状态
store.count === store.$state.count`,
    },
    {
      type: 'text',
      content:
        '固定 4.0.2 的 Options Store 会在创建时对当时存在的 root state 建立 refs。若先创建 Store，再整体替换 root，direct property 仍连接旧对象，而 $state getter 和 pinia.state.value 已读取新 root；数值分叉正是错误顺序的可运行反例。',
    },
    { type: 'heading', content: 'Setup Store 先创建，再逐项决定是否水合' },
    {
      type: 'text',
      content:
        'Setup Store 必须执行 setup。固定 4.0.2 会把 initial state 写入普通顶层 ref，对顶层 reactive object 递归合并；若 shouldHydrate(property) 为 false，则保留客户端 setup 创建的值。最后这些属性仍会连接回 root state。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 创建同时包含普通状态和客户端专属状态的 Setup Store。 */
const useSessionStore = defineStore('session', () => {
  const userLabel = ref('client-default')
  const connection = skipHydrate(ref('client-connection'))
  return { userLabel, connection }
})

const pinia = createPinia()
pinia.state.value = {
  session: {
    userLabel: 'server-user',
    connection: 'server-placeholder',
  },
}
const store = useSessionStore(pinia)

// userLabel 使用 server-user；connection 保留 client-connection`,
    },
    {
      type: 'table',
      headers: ['能力', '准确边界'],
      rows: [
        ['普通顶层 ref', '接收对应 initial state'],
        ['skipHydrate(ref)', '被标记顶层对象保留 client setup 值'],
        ['shouldHydrate()', '普通对象为 true，标记对象为 false'],
        ['Options Store hydrate()', '只处理简单复制不够的特殊 composable'],
        ['序列化排除', 'skipHydrate 不会自动排除字段'],
        ['嵌套标记', '固定官方测试仍为 skipped，不承诺递归支持'],
      ],
    },
    { type: 'heading', content: 'Pinia SSR 与 Hydration 顺序实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.advanced.ssr-hydration.pinia-ssr-hydration-model-lab-demo',
      description: '对照 request A/B、客户端恢复前后顺序，以及 Setup Store 普通 ref/skipHydrate',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 修改 Request A',
          content: '确认 A 的 root state 改变，而使用相同 Store ID 的 B 保持原值。',
        },
        {
          title: '2. 重新克隆内存快照',
          content: '确认只处理 JSON-compatible state，安全 serializer 仍为 Deferred。',
        },
        {
          title: '3. 比较两个客户端顺序',
          content: '正确路径三处一致；错误路径 direct 与 $state/root 分叉。',
        },
        {
          title: '4. 运行 Setup Store 水合',
          content: '普通 ref 采用 server fixture，skipHydrate ref 保留 client fixture。',
        },
      ],
    },
    { type: 'heading', content: '证据边界' },
    {
      type: 'table',
      headers: ['能力', '本课证据', '状态'],
      rows: [
        ['两个 Pinia root state 隔离', '同进程、确定性 fixture', '可运行'],
        ['首个 useStore 前/后恢复差别', 'Pinia 4.0.2 内存行为', '可运行'],
        ['skipHydrate/shouldHydrate 顶层行为', '普通/标记 ref 对照', '可运行'],
        ['Node SSR request factory', '无 HTTP/Node server fixture', 'Deferred/not-run'],
        ['renderToString 后 snapshot', '当前 Demo 不执行 SSR renderer', 'Deferred/not-run'],
        [
          '安全 HTML 注入、XSS、CSP',
          '无 serializer package/HTML response',
          'Deferred/not-installed',
        ],
        [
          '浏览器 Vue hydration/mismatch',
          '无 server HTML + client hydrate 双入口',
          'Deferred/not-run',
        ],
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. createPinia 创建独立容器',
          content: '每次调用都有独立 effect scope、root state 与 Store registry。',
        },
        {
          title: '2. Root Store 警告 Active Fallback',
          content: 'SSR 组件外应显式传 Pinia，避免 cross-request pollution。',
        },
        {
          title: '3. SSR Guide 冻结恢复顺序',
          content: '渲染后读取 root，客户端首个 useStore 前恢复并安全转义。',
        },
        {
          title: '4. Options Store 在创建时连接 Root',
          content: '固定 store.ts 解释错误整体替换为何产生旧 direct ref 与新 root。',
        },
        {
          title: '5. Setup Store 逐项处理 Initial State',
          content: '普通 ref 接收值，顶层 shouldHydrate=false 的对象保留客户端值。',
        },
        {
          title: '6. skipHydrate 只检查对象自身标记',
          content: 'nested case 在固定 state.spec.ts 仍为 skipped，不能扩成递归保证。',
        },
        {
          title: '7. SSR 官方测试覆盖实例隔离',
          content: '上游测试不等于本项目已验证 HTML 注入、CSP 或浏览器 hydration。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '服务端共享模块级 Pinia',
          description: '服务模块通常跨请求复用。',
          consequence: '用户状态可能在请求之间污染。',
          wrong: { lang: 'ts', content: `export const pinia = createPinia()` },
          correct: {
            lang: 'ts',
            content: `/** 为当前请求创建独立 Pinia。 */
export function createRequestPinia() {
  return createPinia()
}`,
          },
        },
        {
          title: '组件外依赖 Active Pinia',
          description: '多实例环境中的 mutable fallback 不是 ownership 边界。',
          consequence: '代码可能取得另一个请求的 Store。',
          wrong: { lang: 'ts', content: `const store = useRequestStore()` },
          correct: { lang: 'ts', content: `const store = useRequestStore(requestPinia)` },
        },
        {
          title: '渲染前导出最终快照',
          description: 'setup/serverPrefetch 可能在 render 中继续写 state。',
          consequence: '客户端拿到缺字段或旧数据。',
          wrong: {
            lang: 'ts',
            content: `const snapshot = pinia.state.value
await renderToString(app)`,
          },
          correct: {
            lang: 'ts',
            content: `await renderToString(app)
const snapshot = pinia.state.value`,
          },
        },
        {
          title: '先创建 Store 再恢复 Root',
          description: 'Options Store direct refs 已连接旧 root。',
          consequence: 'direct 与 $state/root 读取不同对象。',
          wrong: {
            lang: 'ts',
            content: `const store = useStore(pinia)
pinia.state.value = initialState`,
          },
          correct: {
            lang: 'ts',
            content: `pinia.state.value = initialState
const store = useStore(pinia)`,
          },
        },
        {
          title: '把 JSON.stringify 当作 HTML Safe',
          description: 'JSON round-trip 不处理具体 HTML context。',
          consequence: '用户字符串可能形成 script 注入。',
          wrong: {
            lang: 'ts',
            content: `html += '<script>' + JSON.stringify(state) + '</script>'`,
          },
          correct: {
            lang: 'ts',
            content: `// 由宿主选择获批 serializer、配对 parser 与 HTML/CSP 策略`,
          },
        },
        {
          title: '把 skipHydrate 当成序列化过滤器',
          description: '它只改变 Setup Store 顶层属性接收 initial value 的决定。',
          consequence: '不应传输的字段仍可能进入 root snapshot。',
          wrong: { lang: 'ts', content: `// 假定标记字段不会进入 root state` },
          correct: { lang: 'ts', content: `// snapshot 阶段另做明确字段白名单` },
        },
        {
          title: '把内存 State 一致当成 DOM Hydration 通过',
          description: '当前没有 server HTML、client hydrate 或 mismatch 采集。',
          consequence: '报告夸大为真实 SSR/hydration Green。',
          wrong: { lang: 'ts', content: `status = 'Hydration PASS'` },
          correct: { lang: 'ts', content: `status = 'Deferred/not-run'` },
        },
      ],
    },
  ],
  exercises: [
    '画出 request A/B 从 createPinia 到 render 后 snapshot 的 ownership 图，并标出 singleton 风险点。',
    '解释为什么 skipHydrate 可以保留 client-only ref，却不能替代 serializer、字段白名单或 CSP。',
  ],
  recap: [
    'SSR 中每个 request 都拥有独立 Pinia；组件外 useStore 显式接收该实例。',
    '服务端渲染完成后读取 root，客户端在首个 useStore 前恢复 root。',
    'Options Store 的创建顺序决定 direct refs；Setup Store 对普通 ref 与 skipHydrate 分别处理。',
    'Pinia 内存恢复不等于安全 HTML 注入或 Vue DOM hydration，这些证据仍保持 Deferred。',
  ],
})
