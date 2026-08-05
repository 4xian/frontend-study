/**
 * 课程：HMR、Devtools 与维护
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方文档、固定 commit 源码与官方测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const subscriptionsId = 'vue.pinia.learn.intermediate.subscriptions-actions'
const testingId = 'vue.pinia.learn.advanced.store-testing'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.store-composition',
  'vue.pinia.learn.intermediate.store-modeling',
  subscriptionsId,
  'vue.pinia.learn.intermediate.outside-components-router',
  'vue.pinia.learn.advanced.plugins-persistence',
  testingId,
  'vue.pinia.learn.advanced.ssr-hydration',
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.advanced.hmr-devtools-maintenance',
  type: 'lesson',
  title: 'HMR、Devtools 与维护',
  summary: '区分组件、Store 与 Pinia 的寿命，并为 HMR 和 Devtools 保留真实证据边界',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'advanced',
  level: 'advanced',
  prerequisites,
  related: [subscriptionsId, testingId, 'vue.pinia.reference.runtime.hmr'],
  tags: ['Pinia', 'HMR', 'Devtools', '$dispose', 'disposePinia', 'lifecycle'],
  sources: [
    {
      title: 'Pinia：Hot Module Replacement',
      url: 'https://pinia.vuejs.org/cookbook/hot-module-replacement.html',
    },
    {
      title: 'Pinia：Store.$dispose()',
      url: 'https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#dispose',
    },
    {
      title: 'Pinia：disposePinia()',
      url: 'https://pinia.vuejs.org/api/pinia/functions/disposePinia.html',
    },
    {
      title: 'Pinia：Devtools 与 HMR 能力',
      url: 'https://pinia.vuejs.org/introduction.html',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 createPinia.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts',
    },
    {
      title: 'Pinia 4.0.2 hmr.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts',
    },
    {
      title: 'Pinia 4.0.2 store.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.spec.ts',
    },
    {
      title: 'Pinia 4.0.2 hmr.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts',
    },
    {
      title: 'Pinia 4.0.2 lifespan.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts',
    },
    {
      title: 'Pinia Issue #2611：Setup Store HMR shape',
      url: 'https://github.com/vuejs/pinia/issues/2611',
    },
    {
      title: 'Vite：HMR API',
      url: 'https://vite.dev/guide/api-hmr',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 65,
})

export default defineLesson({
  meta,
  objectives: [
    '区分消费组件、单个 Store 与整个 Pinia 的三层寿命',
    '解释 $dispose 后 root state 保留与 Store identity 重建',
    '写出真实 Vite Store module 的 HMR 接入边界',
    '准确描述 Options Store 与 Setup Store 的 shape 差异',
    '为 Devtools inspector、timeline 与 state edit 定义真实验收证据',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content:
        '前置：请先完成 L01-L13，尤其要理解 Setup Store scope、订阅归属、显式 Pinia、plugin cleanup 与 hydration 证据边界。',
    },
    { type: 'heading', content: '组件、Store 与 Pinia 是三层寿命' },
    {
      type: 'table',
      headers: ['操作', '公开可观察结果', '不要推导'],
      rows: [
        [
          '卸载消费组件',
          '组件 scope 内 observer 停止；Store action 仍可修改 state',
          '等同于 store.$dispose()',
        ],
        [
          'store.$dispose()',
          'Store scope 与订阅停止；同 ID root state 保留',
          '自动删除 state 或旧引用仍可长期使用',
        ],
        [
          '再次 useStore(pinia)',
          '得到不同 Store 对象，并从保留 state 起步',
          '旧 identity 或旧订阅被恢复',
        ],
        [
          'disposePinia(pinia)',
          '停止整个 effect scope，清理 Store、plugin 与 root state',
          '只是 $reset、logout 或可逆 pause',
        ],
      ],
    },
    {
      type: 'text',
      content:
        '这组结论只需要公开 seam：对象 identity、Store state、订阅计数、`pinia.state.value` 与再次调用 `useStore(pinia)` 的结果。内部 registry 可以解释实现，却不应成为应用代码或测试断言。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`$dispose()` 不删除 root state。dispose 后可用旧引用做一次受控 mutation，证明旧订阅已经停止；随后应放弃旧引用，由 `useStore(pinia)` 重建，或直接销毁整个 Pinia。',
    },
    { type: 'heading', content: 'HMR 需要真实 Store Module 边界' },
    {
      type: 'code',
      lang: 'ts',
      content: `import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({ userName: '' }),
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}`,
    },
    {
      type: 'text',
      content:
        '必须由真实 Vite watcher 发现文件变更，再经 module graph、WebSocket 与 accept boundary 把新 module 交给 Pinia。手工调用 helper callback 只能形成 unit model，不能证明浏览器里的 Store 保留了 state。生产分支返回 no-op，HMR 也不能替代 persistence schema migration。',
    },
    { type: 'heading', content: 'ID 稳定，Shape 不等于通用 Deep Merge' },
    {
      type: 'table',
      headers: ['变化', 'Pinia 4.0.2 固定行为', '维护策略'],
      rows: [
        ['顶层 state/action/getter', '按新 definition 增加或移除', '删除前检查所有调用方'],
        ['同名 state', '保留当前 runtime value', '不要依赖新默认值重置运行数据'],
        [
          'Options nested plain object',
          '以新 definition shape 为骨架，合入仍存在的旧 key',
          '明确写出 schema 变化',
        ],
        [
          'Setup ref object',
          '整体转移旧 runtime object，保留运行期新增属性',
          '不要套用 Options deep merge 解释',
        ],
        ['$subscribe/$onAction', '固定官方测试仍标为 todo', '更新后按未保证处理'],
      ],
    },
    {
      type: 'text',
      content:
        'Store ID 是 HMR identity，必须保持稳定。固定 helper 会先从新 module exports 中筛选当前 Pinia 已认识的 Store ID，再处理 identity；ID 不匹配可能跳过更新，也可能进入 invalidation，不能写成“改 ID 必然保留”或“改 ID 必然 reload”。Array、Map、Set、ref、reactive 与 plain object 也不能归纳成一种递归合并。',
    },
    { type: 'heading', content: 'Devtools 能力需要真实 Client 证据' },
    {
      type: 'table',
      headers: ['能力', '最低真实证据', '当前 P05 状态'],
      rows: [
        ['Store inspector', '真实 Vue Devtools client 能看到目标 Store', 'Deferred/not-run'],
        [
          'action/mutation timeline',
          '一次真实 action 与 mutation 出现在 timeline',
          'Deferred/not-run',
        ],
        ['state edit', '在 inspector 编辑后页面 state 同步变化', 'Deferred/not-run'],
        ['time travel/debugging', '真实客户端完成操作并记录版本与浏览器', 'Deferred/not-run'],
        ['dispose refresh', 'Store dispose 后 inspector 列表实际更新', 'Deferred/not-run'],
      ],
    },
    {
      type: 'text',
      content:
        '页面自己展示 state、固定说明文字或截图，都不能证明 Devtools inspector/timeline 收到了事件。Devtools 是开发客户端集成，不是生产页面需要调用的一组内部 API。',
    },
    { type: 'heading', content: 'Store Lifecycle 维护实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.advanced.hmr-devtools-maintenance.pinia-store-lifecycle-maintenance-lab-demo',
      description:
        '在独立 Pinia 与 mini-app 中观察 consumer 卸载、$dispose、重建 identity/state 与 disposePinia',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 建立基线',
          content:
            '确认首次与重复 useStore 返回 Store #1；运行 action 后四项当前计数变化，重建订阅仍为 0。',
        },
        {
          title: '2. 卸载 Consumer',
          content: '卸载 mini-app 后再运行 action；consumer observer 保持，Store state 继续增加。',
        },
        {
          title: '3. Dispose Store',
          content:
            '观察受控 action 仍改变 root state，但 Store scope、state 与 action 三类旧计数都保持。',
        },
        {
          title: '4. 重建 Store',
          content: '确认 identity 从 Store #1 变为 Store #2，起始 state 等于 dispose 后保留值。',
        },
        {
          title: '5. Dispose Pinia',
          content: '确认公开 root state 变为 `{}`，实例标记不可复用，只有重置实验仍可操作。',
        },
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. $dispose 停止 Store Scope',
          content:
            '固定 store.ts 清理 Store subscriptions/action subscriptions，但声明不删除 state。',
        },
        {
          title: '2. 重建产生新 Identity',
          content: '固定 store.spec.ts 证明 dispose 后再次 useStore 返回不同实例。',
        },
        {
          title: '3. disposePinia 清理整棵资源',
          content: 'createPinia.ts 与 lifespan.spec.ts 证明 root 与 effect scope 一起结束。',
        },
        {
          title: '4. HMR 以 Store ID 定位',
          content: '固定 hmr.ts 先筛选新 module Store exports，再决定更新或 invalidation。',
        },
        {
          title: '5. Options Shape 由新定义约束',
          content: '固定 hmr.spec.ts 覆盖 nested plain object 删除旧 key。',
        },
        {
          title: '6. Setup Ref 保留 Runtime Object',
          content: 'Issue #2611 与固定测试覆盖运行期新增 optional property。',
        },
        {
          title: '7. 订阅跨 HMR 尚未保证',
          content: '固定 hmr.spec.ts 对两类订阅保持仍是 todo，维护代码必须能重新注册。',
        },
        {
          title: '8. Devtools UI 证据独立',
          content: 'runtime 能力说明不能替代真实 client 的 inspector、timeline 与编辑记录。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '组件卸载等同 Store Dispose',
          description: '组件 observer 与 Store scope 所有者不同。',
          consequence: '误以为 Store state 与资源已经结束。',
          wrong: {
            lang: 'ts',
            content: `app.unmount()
// 假定 store 已销毁`,
          },
          correct: {
            lang: 'ts',
            content: `app.unmount()
store.$dispose()`,
          },
        },
        {
          title: '$dispose 自动删除 State',
          description: '同 ID root state 默认保留。',
          consequence: '重建 Store 从旧数据起步。',
          wrong: {
            lang: 'ts',
            content: `store.$dispose()
// 假定 state 不存在`,
          },
          correct: {
            lang: 'ts',
            content: `store.$dispose()
delete pinia.state.value[store.$id]`,
          },
        },
        {
          title: '长期使用已 Dispose 的引用',
          description: '旧对象已经退出受支持的活跃生命周期。',
          consequence: '订阅与 effect 已停止，行为难以维护。',
          wrong: {
            lang: 'ts',
            content: `store.$dispose()
store.save()`,
          },
          correct: {
            lang: 'ts',
            content: `store.$dispose()
const nextStore = useStore(pinia)`,
          },
        },
        {
          title: '复用已 Dispose 的 Pinia',
          description: 'disposePinia 使整个实例不可再使用。',
          consequence: '新 Store 落在已结束的 effect scope。',
          wrong: {
            lang: 'ts',
            content: `disposePinia(pinia)
useStore(pinia)`,
          },
          correct: {
            lang: 'ts',
            content: `disposePinia(pinia)
const nextPinia = createPinia()`,
          },
        },
        {
          title: '定义 Store 即自动接入 HMR',
          description: 'Store module 需要显式 self-accept 边界。',
          consequence: '文件更新时 state preservation 没有契约。',
          wrong: { lang: 'ts', content: `export const useStore = defineStore('main', {})` },
          correct: {
            lang: 'ts',
            content: `if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}`,
          },
        },
        {
          title: '用 HMR 代替数据迁移',
          description: 'HMR 是开发期 module update。',
          consequence: '生产持久化数据没有可执行迁移。',
          wrong: { lang: 'ts', content: `// 依赖 HMR 改 production schema` },
          correct: { lang: 'ts', content: `migratePersistedState(previousVersion)` },
        },
        {
          title: '把所有 Shape 当 Deep Merge',
          description: 'Options plain object 与 Setup ref object 路径不同。',
          consequence: '删除字段或 optional property 的预期错误。',
          wrong: { lang: 'ts', content: `deepMerge(oldState, nextState)` },
          correct: { lang: 'ts', content: `// 按 Store 风格与具体 state 类型逐项验证` },
        },
        {
          title: '页面卡片证明 Devtools',
          description: '普通 DOM 不是 Devtools client。',
          consequence: '把未运行的 inspector/timeline 报成 PASS。',
          wrong: { lang: 'ts', content: `status = 'PASS'` },
          correct: { lang: 'ts', content: `status = 'Deferred/not-run'` },
        },
      ],
    },
  ],
  exercises: [
    '列出临时 Store、消费组件和整个测试 Pinia 各自应由谁负责释放。',
    '为一次真实 HMR Gate 写出文件更新、浏览器 state 与订阅重新注册三项验收证据。',
  ],
  recap: [
    '消费组件卸载只结束组件 observer；Store 与 Pinia 仍有各自独立寿命。',
    '$dispose 停止 Store scope 但保留 root state；重建得到新 identity 且不继承旧订阅。',
    'disposePinia 清空整个实例并使其不可复用；继续实验必须 createPinia。',
    'HMR 需要真实 Vite update，Devtools 需要真实 client；P05 两项均为 Deferred/not-run。',
  ],
})
