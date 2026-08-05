/**
 * 课程：Setup Store
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方文档与固定 commit 源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const firstStoreId = 'vue.pinia.learn.basics.setup-first-store'
const stateId = 'vue.pinia.learn.basics.state-patch-reset'
const gettersId = 'vue.pinia.learn.basics.getters'
const actionsId = 'vue.pinia.learn.basics.actions-async'
const storeToRefsId = 'vue.pinia.learn.basics.component-store-to-refs'

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.intermediate.setup-stores',
  type: 'lesson',
  title: 'Setup Store',
  summary: '用 ref、computed 与 function 定义 Store，并掌握返回面、reset 与 effect scope 边界',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: [firstStoreId, stateId, gettersId, actionsId, storeToRefsId],
  related: [
    storeToRefsId,
    'vue.core.learn.basics.watchers',
    'vue.core.learn.intermediate.composables',
    'vue.pinia.reference.stores.define-store',
  ],
  tags: ['Pinia', 'Setup Store', 'ref', 'computed', '$reset', '$dispose', 'watch'],
  sources: [
    {
      title: 'Pinia：Setup Stores',
      url: 'https://pinia.vuejs.org/core-concepts/#setup-stores',
    },
    {
      title: 'Pinia：Resetting the state',
      url: 'https://pinia.vuejs.org/core-concepts/state.html#resetting-the-state',
    },
    {
      title: 'Pinia：Dealing with Composables',
      url: 'https://pinia.vuejs.org/cookbook/composables.html',
    },
    {
      title: 'Pinia API：$dispose()',
      url: 'https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#dispose',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 storeSetup.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 45,
})

export default defineLesson({
  meta,
  objectives: [
    '把 ref/reactive、computed 与 function 分别建模为 state、getter 与 action',
    '返回全部应由 Pinia 管理的 state，并把外部注入留在使用点',
    '为 Setup Store 编写明确的 $reset() 实现',
    '区分消费组件卸载、store.$dispose() 与 disposePinia() 的生命周期',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content: '前置：请先完成 L01-L05，并理解 Vue 的 ref、computed、watch 与组合式函数。',
    },
    { type: 'heading', content: '返回值形态就是 Store 契约' },
    {
      type: 'text',
      content:
        'Setup Store 的定义函数运行在 Pinia 管理的 effect scope 中。Pinia 扫描返回对象：ref/reactive 归为 state，computed 归为 getter，function 归为 action。普通 primitive 或 plain object 只是普通公开属性，不进入 `$state`。',
    },
    {
      type: 'table',
      headers: ['Setup 返回值', 'Pinia 分类', '进入 $state'],
      rows: [
        ['ref() / reactive()', 'state', '是'],
        ['computed()', 'getter', '否'],
        ['function', 'action', '否'],
        ['ref(() => {})', 'state；payload 恰好是 function', '是'],
        ['普通 primitive / plain object', '普通公开属性', '否'],
      ],
    },
    { type: 'heading', content: '返回全部 state，并手写 reset' },
    {
      type: 'text',
      content:
        '所有希望由 Pinia 管理的响应式 state 都必须返回。隐藏 ref 或把返回 state 包成 readonly，会让 Pinia 无法完整处理 SSR、Devtools 和插件。Options Store 能重跑 `state()` 工厂，Setup Store 没有这个统一入口，因此必须自行声明并返回 `$reset()`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const page = ref(1)
  const normalizedQuery = computed(() => query.value.trim())

  /** 移动到下一页结果。 */
  function nextPage(): void {
    page.value++
  }

  /** 恢复当前 Store 明确拥有的全部 state。 */
  function $reset(): void {
    query.value = ''
    page.value = 1
  }

  return { query, page, normalizedQuery, nextPage, $reset }
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'Setup Store 可以使用 inject() 或 useRoute()，但不要把 route 或注入上下文本身作为 Store state 返回。P02 只说明 SSR 风险，不把当前 SPA 当作真实 hydration 证据。',
    },
    { type: 'heading', content: 'Store scope 不属于任一消费组件' },
    {
      type: 'text',
      content:
        'Setup Store 内同步创建的 watcher 由 Store effect scope 收集。卸载一个使用该 Store 的组件不会停止 watcher，也不会删除 Store。`store.$dispose()` 才会停止该 scope 并从 registry 移除实例，但保留 root state；整个隔离 Pinia 不再使用时再调用 `disposePinia()`。',
    },
    { type: 'heading', content: '对照映射、reset 与 dispose 边界' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.intermediate.setup-stores.pinia-setup-store-contract-lab-demo',
      description: '卸载消费组件后继续修改 Setup Store，再显式 dispose 并观察 watcher',
      playground: true,
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 返回对象是分类入口',
          content:
            '`store.ts` 在 Store scope 内执行 setup 后扫描返回对象；只有返回的 ref/reactive 才进入 root state 与 hydration 管理链。',
        },
        {
          title: '2. 容器形态优先于 payload 类型',
          content:
            '固定测试证明 `ref(() => {})` 仍然进入 `$state`，而 computed 和普通 function 不进入，分类不看业务命名。',
        },
        {
          title: '3. Setup reset 必须覆盖占位行为',
          content:
            '内建 reset 只在 Options Store 分支重跑 state factory；Setup Store 返回同名 action 后，才拥有真实的 `$reset()` 实现。',
        },
        {
          title: '4. Dispose 停 scope 但保留 state',
          content:
            '`$dispose()` 调用 `scope.stop()` 并移除 registry 实例，没有删除 root state，因此旧 Store 引用仍能改值，但内部 watcher 已停止。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 Setup Store 当作纯语法替换',
          description: '返回值的响应容器形态决定 Pinia 如何分类。',
          consequence: '普通值被误当成 state，序列化和更新预期失效。',
          wrong: { lang: 'ts', content: `return { count: 0, double: count * 2 }` },
          correct: {
            lang: 'ts',
            content: `return { count, double: computed(() => count.value * 2) }`,
          },
        },
        {
          title: '把 ref 内的 function 当作 action',
          description: 'ref 容器先命中 state 分类，与 payload 类型无关。',
          consequence: 'function payload 意外进入 root state。',
          wrong: { lang: 'ts', content: `const task = ref(() => run()) // 期待 action` },
          correct: {
            lang: 'ts',
            content: `/** 执行任务。 */
function runTask(): void {
  run()
}`,
          },
        },
        {
          title: '隐藏希望由 Pinia 管理的 state',
          description: 'Pinia 只能扫描 setup 返回对象。',
          consequence: 'SSR、Devtools 与插件看不到这部分 state。',
          wrong: {
            lang: 'ts',
            content: `const count = ref(0)
return { increment }`,
          },
          correct: { lang: 'ts', content: `return { count, increment }` },
        },
        {
          title: '返回 readonly Store state',
          description: '官方明确警告这会破坏 SSR、Devtools 与插件能力。',
          consequence: 'Pinia 无法按完整可写 state 契约管理它。',
          wrong: { lang: 'ts', content: `return { count: readonly(count) }` },
          correct: { lang: 'ts', content: `return { count, increment }` },
        },
        {
          title: '返回 route 或注入上下文',
          description: '这些对象不属于 Store，自身已有使用入口。',
          consequence: 'reactive 外部对象可能混入 root state 与 hydration。',
          wrong: {
            lang: 'ts',
            content: `const route = useRoute()
return { route }`,
          },
          correct: {
            lang: 'ts',
            content: `const route = useRoute()
const currentId = computed(() => route.params.id)`,
          },
        },
        {
          title: '依赖 Setup Store 自动 reset',
          description: 'Pinia 无法推导任意 setup 闭包的初始值。',
          consequence: '开发环境抛错，生产分支也不会完成预期重置。',
          wrong: {
            lang: 'ts',
            content: `const store = useSetupStore()
store.$reset() // 未自定义`,
          },
          correct: {
            lang: 'ts',
            content: `/** 恢复明确基线。 */
function $reset(): void {
  count.value = 0
}`,
          },
        },
        {
          title: '把组件卸载当成 Store dispose',
          description: 'Store scope 与任一消费组件的 scope 不同。',
          consequence: 'Store 内 watcher 继续运行，清理假设与事实不符。',
          wrong: {
            lang: 'ts',
            content: `onUnmounted(() => {
  // 假定 Store watcher 已停止
})`,
          },
          correct: {
            lang: 'ts',
            content: `onUnmounted(() => store.$dispose()) // 仅在该组件拥有 Store 时`,
          },
        },
        {
          title: '把 $dispose() 当作 reset',
          description: '$dispose() 停止 scope 并移除 registry，不删除已有 state。',
          consequence: '再次取得 Store 时可能继续使用旧 state。',
          wrong: {
            lang: 'ts',
            content: `store.$dispose()
// 假定 count 已回到 0`,
          },
          correct: {
            lang: 'ts',
            content: `store.$reset()
store.$dispose()`,
          },
        },
      ],
    },
    {
      type: 'exercise',
      title: '观察两个生命周期',
      instructions:
        '先修改 Setup Store 并卸载消费组件，再次修改后记录 watcher 次数；最后调用 $dispose() 并修改保留 state，确认数值变化但 watcher 次数不再增加。',
    },
  ],
  recap: [
    'Setup Store 按 ref/reactive、computed 与 function 分类 state、getter 与 action。',
    '返回全部 Store state，自定义 $reset()，不要返回 route 或注入上下文本身。',
    '消费组件卸载不结束 Store scope；$dispose() 停止 scope，但不删除已有 state。',
  ],
})
