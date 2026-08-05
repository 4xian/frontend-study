/**
 * 课程：Store 组合
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方文档与固定 commit 源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const setupStoreId = 'vue.pinia.learn.intermediate.setup-stores'
const actionsId = 'vue.pinia.learn.basics.actions-async'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  actionsId,
  'vue.pinia.learn.basics.component-store-to-refs',
  setupStoreId,
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.intermediate.store-composition',
  type: 'lesson',
  title: 'Store 组合',
  summary: '用 computed 与 action 延迟跨 Store 读取，建立可终止的依赖方向',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites,
  related: [setupStoreId, actionsId, 'vue.pinia.reference.stores.define-store'],
  tags: ['Pinia', 'Store 组合', 'computed', 'action', '循环依赖'],
  sources: [
    {
      title: 'Pinia：Composing Stores',
      url: 'https://pinia.vuejs.org/cookbook/composing-stores.html',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 combinedStores.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/combinedStores.spec.ts',
    },
    {
      title: 'Pinia 4.0.2 getters.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 42,
})

export default defineLesson({
  meta,
  objectives: [
    '在 getter、computed 与 action 中读取另一个 Store',
    '区分互相取得实例与 setup 创建期即时互读',
    '让跨 Store action 保留清晰的 state 所有者',
    '识别 SSR 异步 action 首个 await 前的取 Store 边界',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content: '前置：请先完成 L01-L06，尤其要理解 Setup Store、computed 和 action。',
    },
    { type: 'heading', content: '组合不等于取消边界' },
    {
      type: 'text',
      content:
        'Store 可以调用另一个 Store。关键不是禁止依赖，而是让状态仍由明确的 Store 拥有：派生展示放在 getter/computed，跨职责流程放在一个协调 action，被调用 Store 通过自己的 action 修改 state。',
    },
    {
      type: 'table',
      headers: ['位置', '适合做什么', '需要避免'],
      rows: [
        ['setup 顶层', '取得另一个 Store 实例', '双方立即读取对方 state'],
        ['getter / computed', '持续追踪另一个 Store 的响应式值', '两个 getter 互相求值'],
        ['action', '按用户操作协调多个职责', '无终止条件地互相调用'],
      ],
    },
    { type: 'heading', content: '循环边界在读取时机' },
    {
      type: 'text',
      content:
        '固定 4.0.2 源码会在执行 Setup Store 前先登记 partial store，因此 A、B 可以先互相取得实例；这不代表对方的返回属性已经初始化。双方都在 setup 创建期立即读取对方 state 会依赖不完整顺序，应把真实读取推迟到 computed 或 action。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export const useCartStore = defineStore('cart', () => {
  const session = useSessionStore()
  const items = ref<string[]>([])
  const summary = computed(() => \`${'${session.name}'} · ${'${items.value.length}'} 件\`)

  /** 由购物车自己修改商品列表。 */
  function addItem(item: string): void {
    items.value.push(item)
  }

  return { items, summary, addItem }
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '延迟读取不会自动消除所有递归。两个 computed 互相求值，或两个 action 无终止地互调，仍会形成运行时循环。',
    },
    { type: 'heading', content: '组合实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.intermediate.store-composition.pinia-store-composition-lab-demo',
      description: '观察 session/cart 互相取得实例后，computed 与 action 才读取对方 state',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        { title: '1. 观察创建阶段', content: '确认 setup 记录只有取得实例，没有读取对方 state。' },
        { title: '2. 修改两侧状态', content: '加入商品并切换会员，观察 computed 持续更新。' },
        { title: '3. 触发协调 action', content: '让 session action 在调用时读取 cart 当前数量。' },
        { title: '4. 画出依赖方向', content: '标明哪个 Store 拥有 state，哪个入口只负责协调。' },
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. partial store 先进入 registry',
          content:
            '固定 store.ts 先登记实例再执行 setup，所以互相取得 identity 可行；尚未返回的属性仍不可安全即时读取。',
        },
        {
          title: '2. 官方组合测试把读取放在 action',
          content: 'combinedStores.spec.ts 证明 A/B 可互相取得并在 action 执行期交互。',
        },
        {
          title: '3. computed 持续追踪跨 Store 依赖',
          content: 'getter 测试证明另一个 Store 更新后派生值会重新求值，而不是 setup 快照。',
        },
        {
          title: '4. action wrapper 会激活所属 Pinia',
          content: '这支持同步组合，但 SSR 异步流程仍应在首个 await 前取得所需 Store。',
        },
        {
          title: '5. 循环规则不等于目录规则',
          content: '官方约束读取时机与递归；文件拆分方式仍由应用职责决定。',
        },
        {
          title: '6. 当前 Demo 的证据边界',
          content: '它证明浏览器 SPA 内的隔离组合，不冒充真实 SSR 请求上下文。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把互相 useStore 当成绝对禁止',
          description: '双方可以先取得已登记的实例。',
          consequence: '为规避不存在的限制而合并成难维护的总 Store。',
          wrong: { lang: 'ts', content: `// A 与 B 永远不能互相取得实例` },
          correct: { lang: 'ts', content: `const other = useOtherStore() // 只取得实例` },
        },
        {
          title: '双方在 setup 顶层立即互读',
          description: '此时另一侧可能尚未完成初始化。',
          consequence: '读取 undefined 或进入不稳定的创建顺序。',
          wrong: { lang: 'ts', content: `const snapshot = other.count` },
          correct: { lang: 'ts', content: `const current = computed(() => other.count)` },
        },
        {
          title: '把一次读取当成持续派生',
          description: '普通赋值只保存当前值。',
          consequence: '另一个 Store 更新后界面仍显示旧快照。',
          wrong: { lang: 'ts', content: `const label = other.name` },
          correct: { lang: 'ts', content: `const label = computed(() => other.name)` },
        },
        {
          title: '认为 computed 能消除所有循环',
          description: 'computed 仍可能在求值时互相递归。',
          consequence: '读取派生值时堆栈溢出。',
          wrong: { lang: 'ts', content: `const a = computed(() => b.value + 1)` },
          correct: {
            lang: 'ts',
            content: `const total = computed(() => cart.subtotal - session.discount)`,
          },
        },
        {
          title: '跨 Store action 直接接管对方 state',
          description: '修改责任不再属于 state 的拥有者。',
          consequence: '业务规则散落在多个 Store。',
          wrong: { lang: 'ts', content: `other.items = []` },
          correct: { lang: 'ts', content: `other.clearItems()` },
        },
        {
          title: '让 action 无终止地互相调用',
          description: 'action 不会自动阻止运行时递归。',
          consequence: '用户操作导致无限调用。',
          wrong: { lang: 'ts', content: `a.run() // a.run 又调用 b.run` },
          correct: { lang: 'ts', content: `checkout.run() // 单一协调入口` },
        },
        {
          title: '在首个 await 后隐式取得 Store',
          description: 'SSR 恢复执行时 active Pinia 可能已经变化。',
          consequence: '并发请求可能读到错误实例。',
          wrong: {
            lang: 'ts',
            content: `await load()
const cart = useCartStore()`,
          },
          correct: {
            lang: 'ts',
            content: `const cart = useCartStore()
await load()`,
          },
        },
        {
          title: '为消除依赖而建立总 Store',
          description: '合并所有职责并没有修复读取时机。',
          consequence: '状态、派生值和副作用失去所有者。',
          wrong: { lang: 'ts', content: `useEverythingStore()` },
          correct: { lang: 'ts', content: `useSessionStore(); useCartStore()` },
        },
      ],
    },
  ],
  recap: [
    'Store 可以互相取得实例，限制在创建期即时互读和运行时递归。',
    '跨 Store 派生值用 getter/computed，业务流程用明确的协调 action。',
    'SSR 异步 action 在首个 await 前取得所需 Store。',
  ],
})
