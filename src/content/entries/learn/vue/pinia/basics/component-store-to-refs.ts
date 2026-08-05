/**
 * 课程：组件接入与 storeToRefs
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia / Vue 官方文档与固定 commit 源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const firstStoreId = 'vue.pinia.learn.basics.setup-first-store'
const stateId = 'vue.pinia.learn.basics.state-patch-reset'
const gettersId = 'vue.pinia.learn.basics.getters'
const actionsId = 'vue.pinia.learn.basics.actions-async'

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.basics.component-store-to-refs',
  type: 'lesson',
  title: '组件接入与 storeToRefs',
  summary: '在组件中安全解构 Store，让 state 与 getter 保持响应，同时直接调用 actions',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [firstStoreId, stateId, gettersId, actionsId],
  related: [
    actionsId,
    'vue.core.learn.basics.reactive-state',
    'vue.pinia.reference.stores.store-to-refs',
  ],
  tags: ['Pinia', 'storeToRefs', '响应式解构', 'actions', '插件 state'],
  sources: [
    {
      title: 'Pinia：Using the store',
      url: 'https://pinia.vuejs.org/core-concepts/#using-the-store',
    },
    {
      title: 'Pinia API：storeToRefs()',
      url: 'https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html',
    },
    {
      title: 'Pinia：Plugins / Adding new state',
      url: 'https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state',
    },
    {
      title: 'Vue：reactive() 的限制',
      url: 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive',
    },
    {
      title: 'Pinia 4.0.2 storeToRefs.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts',
    },
    {
      title: 'Pinia 4.0.2 storeToRefs.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 40,
})

export default defineLesson({
  meta,
  objectives: [
    '区分直接访问 Store 与直接解构 primitive 属性的响应性语义',
    '使用 storeToRefs() 解构 state、getter 和响应式插件字段',
    '把 action 直接从 Store 解构并保持所属 Store 上下文',
    '区分可提取的插件 ref 与可序列化插件 state',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content: '前置：请先完成建立 Store、State/Patch/Reset、Getters 与 Actions 四课。',
    },
    { type: 'heading', content: '响应式 Store 不等于可以随意解构' },
    {
      type: 'text',
      content:
        'Pinia Store 是响应式对象。模板持续读取 `store.count` 时，Vue 每次都能经过代理追踪依赖；`const { count } = store` 则只在解构当下取得一个 primitive 值，后续写入不会改变这个局部快照。getter 直接解构也有同样问题。',
    },
    {
      type: 'compare',
      labels: ['失去响应联系', '保持响应联系'],
      before: `const { count, doubleCount } = store`,
      after: `const { count, doubleCount } = storeToRefs(store)`,
    },
    { type: 'heading', content: 'State 和 getter 转 refs，action 直接解构' },
    {
      type: 'text',
      content:
        '`storeToRefs()` 专门遍历 Store 的响应式属性，返回 state、getters 和插件添加的响应式 state。methods 与普通非响应值会被忽略，因此 action 应直接从 Store 解构。Pinia 的 action wrapper 会在失去合格 `this` 时回到所属 Store。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const store = useCounterStore()
const { count, doubleCount } = storeToRefs(store)
const { increment } = store

/** 通过解构后的 Pinia action 修改同一个 Store。 */
function increase(): void {
  increment()
}`,
    },
    {
      type: 'table',
      headers: ['Store 属性', 'storeToRefs()', '组件内用法'],
      rows: [
        ['state ref/reactive', '提取', '解构 ref 后持续跟随'],
        ['getter/computed', '提取', '保留缓存与依赖'],
        ['插件返回的 ref/reactive', '提取', '仍需单独判断序列化所有权'],
        ['action/function', '忽略', '直接从 Store 解构'],
        ['普通插件值', '忽略', '按普通非响应属性读取'],
      ],
    },
    { type: 'heading', content: '插件字段只演示筛选，不提前讲持久化' },
    {
      type: 'text',
      content:
        '一个插件返回 ref 时，`storeToRefs()` 能发现它；返回普通字符串时则会忽略。能被提取只说明字段具有响应性，不等于它已经同步到 `store.$state`、可以参与 SSR 序列化或重置。完整插件 state 设计属于后续插件课程。',
    },
    { type: 'heading', content: '在同一次操作里对比四种结果' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.basics.component-store-to-refs.pinia-store-to-refs-lab-demo',
      description: '解构同一个 Store，观察快照、refs、action 与插件字段的差异',
      playground: true,
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. Raw Store 暴露原始响应容器',
          content:
            '`storeToRefs.ts` 先读取 raw Store，才能看到 Setup Store 返回的 ref/computed，而不是代理已经解包的当前值。',
        },
        {
          title: '2. 提取阶段保持 getter lazy',
          content:
            'computed 分支只创建代理 getter/setter，没有读取 `.value`；固定上游测试直接断言调用 `storeToRefs()` 不会立刻求值 getter。',
        },
        {
          title: '3. 响应形态决定插件字段是否出现',
          content:
            '同一插件返回的 ref 会进入结果，普通值不会，证明筛选依据是 computed/ref/reactive，而不是“来自插件”这个标签。',
        },
        {
          title: '4. Action wrapper 恢复所属 Store',
          content:
            '固定 `store.ts` 在 action 调用没有合格 Store `this` 时回退到闭包捕获的 Store，所以解构 action 仍能读写该实例。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '直接解构 primitive state',
          description: '解构只读取一次当前值，不再经过 Store proxy。',
          consequence: '界面继续显示旧值，与 Store 的最新 state 不一致。',
          wrong: { lang: 'ts', content: `const { count } = store` },
          correct: { lang: 'ts', content: `const { count } = storeToRefs(store)` },
        },
        {
          title: '直接解构 getter 当前值',
          description: 'Store getter 在解构时已经被读取为当前结果。',
          consequence: '依赖变化后局部值不再重新求值。',
          wrong: { lang: 'ts', content: `const { doubleCount } = store` },
          correct: { lang: 'ts', content: `const { doubleCount } = storeToRefs(store)` },
        },
        {
          title: '期待 storeToRefs() 返回 action ref',
          description: '该 API 明确忽略 methods，action 不是响应式数据。',
          consequence: '从结果读取 increment 得到 undefined。',
          wrong: { lang: 'ts', content: `const { increment } = storeToRefs(store)` },
          correct: { lang: 'ts', content: `const { increment } = store` },
        },
        {
          title: '把 action 解构归因于 JavaScript 自动绑定',
          description: '普通对象方法脱离对象后不会自动保留 this，这是 Pinia wrapper 的契约。',
          consequence: '把同样假设套到普通方法或插件方法上会读取错误上下文。',
          wrong: {
            lang: 'ts',
            content: `const { method } = plainObject
method()`,
          },
          correct: {
            lang: 'ts',
            content: `const { increment } = store
increment()`,
          },
        },
        {
          title: '认为所有插件字段都会被提取',
          description: '固定实现只保留 computed、ref 或 reactive 属性。',
          consequence: '普通字符串或对象不会出现在返回结果。',
          wrong: { lang: 'ts', content: `pinia.use(() => ({ label: 'plain' }))` },
          correct: { lang: 'ts', content: `pinia.use(() => ({ status: ref('ready') }))` },
        },
        {
          title: '把被提取等同于可序列化',
          description: '插件 state 参与 SSR 还需要按插件指南同步进 store.$state。',
          consequence: '服务端与客户端得到不同初值，hydration 所有权不清。',
          wrong: {
            lang: 'ts',
            content: `return { status: ref('ready') }
// 假定自动进入 $state`,
          },
          correct: { lang: 'ts', content: `// 在插件课程中同时定义 store 与 store.$state 所有权` },
        },
        {
          title: '用 ref(store.count) 复制 state',
          description: 'ref() 只用当前值初始化一份新的独立状态。',
          consequence: '两份 state 后续各自变化，组件出现双重真相。',
          wrong: { lang: 'ts', content: `const count = ref(store.count)` },
          correct: { lang: 'ts', content: `const { count } = storeToRefs(store)` },
        },
      ],
    },
    {
      type: 'exercise',
      title: '观察解构边界',
      instructions:
        '连续调用三次解构 action，记录直接解构快照、state ref、getter ref 与插件 ref 的变化，再确认提取键中没有 action 和普通插件字段。',
    },
  ],
  recap: [
    '直接访问 Store 会持续经过响应式代理，直接解构 primitive state/getter 只留下快照。',
    'state、getter 与响应式插件字段使用 storeToRefs()；action 直接从 Store 解构。',
    '插件字段可被提取不代表已成为可序列化的正式 Store state。',
  ],
})
