/**
 * 课程：Store 建模
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方文档与固定 commit 源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const setupStoreId = 'vue.pinia.learn.intermediate.setup-stores'
const compositionId = 'vue.pinia.learn.intermediate.store-composition'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  setupStoreId,
  compositionId,
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.intermediate.store-modeling',
  type: 'lesson',
  title: 'Store 建模',
  summary: '按所有权、生命周期和复用范围区分局部 UI、业务状态与服务端权威数据',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites,
  related: [compositionId, setupStoreId, 'vue.pinia.reference.stores.define-store'],
  tags: ['Pinia', '状态建模', '职责', '生命周期', '客户端缓存'],
  sources: [
    {
      title: 'Pinia：What is a Store?',
      url: 'https://pinia.vuejs.org/getting-started.html#what-is-a-store',
    },
    {
      title: 'Pinia：Actions',
      url: 'https://pinia.vuejs.org/core-concepts/actions.html',
    },
    {
      title: 'Pinia 4.0.2 createPinia.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts',
    },
    {
      title: 'Pinia 4.0.2 rootState.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/rootState.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 40,
})

export default defineLesson({
  meta,
  objectives: [
    '用所有者、生命周期和复用范围判断状态放置位置',
    '区分 Store 的客户端缓存与服务端权威事实',
    '让拥有 state 的 Store action 负责修改',
    '把职责划分标为应用建议而不是 Pinia 强制规则',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content: '前置：请先完成 L01-L07，并能区分组件实例、Store registry 与独立 Pinia。',
    },
    { type: 'heading', content: '先问所有者，再选容器' },
    {
      type: 'text',
      content:
        'Pinia 官方把 Store 定义为脱离组件树的共享 state 与业务逻辑，适合应用多处访问或跨页面保留的数据；可以留在组件内的短命局部状态不应为了“统一”而进入 Store。下面的三分法是应用建模建议，不是 runtime 强制规则。',
    },
    {
      type: 'table',
      headers: ['判断', '组件本地', 'Pinia Store', '服务端/外部系统'],
      rows: [
        ['所有者', '当前视图实例', '一个业务职责', '外部权威源'],
        ['生命周期', '随组件重建', '随 Pinia/Store 实例', '独立于浏览器视图'],
        ['典型状态', 'panel、draft、hover', 'session、任务、跨步流程', '已持久化订单、权限事实'],
        ['副作用入口', '组件事件', '命名 action', 'API 或事务'],
      ],
    },
    { type: 'heading', content: '客户端缓存不是服务端真相' },
    {
      type: 'text',
      content:
        'Store 可以拥有响应数据的浏览器缓存、请求状态和乐观更新，但后端仍可能拥有最终业务事实。建模时分别写清“谁能修改客户端副本”和“谁能确认最终结果”，避免把一次 API 响应复制成第二份权威源。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export const useTaskStore = defineStore('task', {
  state: () => ({ tasks: [], cacheVersion: 0 }),
  actions: {
    /** 从服务端结果刷新客户端缓存。 */
    applyServerSnapshot(snapshot: TaskSnapshot): void {
      this.tasks = snapshot.tasks
      this.cacheVersion = snapshot.version
    },
  },
})`,
    },
    { type: 'heading', content: '生命周期与权威边界实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.intermediate.store-modeling.pinia-store-responsibility-lab-demo',
      description: '重挂载局部组件，比较局部 UI、业务 Store 与客户端缓存的存续差异',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        { title: '1. 修改三类状态', content: '打开面板、填写草稿、完成任务并刷新缓存。' },
        { title: '2. 重挂载组件', content: '观察 panel/draft 复位，而任务与缓存仍保留。' },
        { title: '3. 标注所有者', content: '为每项状态写出唯一修改入口和生命周期。' },
        { title: '4. 检查措辞', content: '确认服务端 fixture 仍被标为权威源。' },
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. registry 属于 Pinia 实例',
          content:
            'createPinia.ts 把 Store registry 放在 Pinia 上，因此组件卸载不会自动删除 Store。',
        },
        {
          title: '2. 多 Store 与多 Pinia 可以隔离',
          content:
            'rootState.spec.ts 证明同一 Pinia 可持有多个职责 Store，不同 Pinia 的 root state 互不共享。',
        },
        {
          title: '3. 官方边界是共享范围',
          content: 'Getting Started 推荐共享/跨页面状态进入 Store，并明确反对滥用局部可见性状态。',
        },
        {
          title: '4. action 是业务逻辑入口',
          content: 'Actions 指南支持用命名 action 修改业务 state，但协调者选择仍是应用设计。',
        },
        {
          title: '5. 缓存权威不是 Pinia API',
          content: '服务端与客户端责任需要业务定义，本课不会把建模建议写成 runtime 契约。',
        },
        {
          title: '6. 当前 Demo 的证据边界',
          content: '确定性 fixture 只展示所有权，不证明真实网络一致性或服务端事务。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把所有响应式值都放进 Pinia',
          description: '响应式能力不等于共享生命周期。',
          consequence: '短命 UI 状态跨页面残留。',
          wrong: { lang: 'ts', content: `store.hovered = true` },
          correct: { lang: 'ts', content: `const hovered = ref(false)` },
        },
        {
          title: '把组件卸载当成 Store 销毁',
          description: 'Store registry 属于 Pinia，不属于最后一个消费者。',
          consequence: '重挂载后的保留状态与预期不符。',
          wrong: { lang: 'ts', content: `onUnmounted(() => assumeStoreGone())` },
          correct: { lang: 'ts', content: `disposePinia(testPinia) // 明确实例所有者` },
        },
        {
          title: '按页面建立一个巨大 Store',
          description: '页面往往组合多个业务职责。',
          consequence: '修改规则和副作用失去明确所有者。',
          wrong: { lang: 'ts', content: `useDashboardEverythingStore()` },
          correct: { lang: 'ts', content: `useSessionStore(); useTaskStore()` },
        },
        {
          title: '让每个 endpoint 对应一个 Store',
          description: '传输结构不是业务职责。',
          consequence: '同一业务状态被拆成互相覆盖的副本。',
          wrong: { lang: 'ts', content: `useGetTasksApiStore()` },
          correct: { lang: 'ts', content: `useTaskStore()` },
        },
        {
          title: '把客户端缓存当成最终真相',
          description: 'Store 只拥有浏览器内的副本和请求状态。',
          consequence: '界面把未确认修改显示成已持久化事实。',
          wrong: { lang: 'ts', content: `store.saved = true // 未经服务端确认` },
          correct: { lang: 'ts', content: `store.cacheStatus = 'pending'` },
        },
        {
          title: '用订阅隐藏业务流程',
          description: '订阅更适合观察和集成。',
          consequence: '修改来源形成难追踪的反馈环。',
          wrong: { lang: 'ts', content: `a.$subscribe(() => b.save())` },
          correct: { lang: 'ts', content: `await workflow.saveTask()` },
        },
        {
          title: '让 Store 持有 DOM 生命周期',
          description: 'focus、hover 和节点引用属于组件。',
          consequence: '长期 Store 持有已卸载节点。',
          wrong: { lang: 'ts', content: `store.inputElement = input.value` },
          correct: { lang: 'ts', content: `const inputElement = useTemplateRef('input')` },
        },
        {
          title: '把职责矩阵写成强制架构',
          description: 'Pinia 没有规定唯一的分层或 Store 数量。',
          consequence: '团队把案例偏好误当成框架限制。',
          wrong: { lang: 'ts', content: `// Pinia 强制每个实体一个 Store` },
          correct: { lang: 'ts', content: `// 按当前应用的所有权与生命周期选择` },
        },
      ],
    },
  ],
  recap: [
    '局部短命 UI 通常留在组件，共享业务状态由 Store 拥有。',
    '客户端缓存和服务端权威事实必须分开命名与建模。',
    '职责矩阵是应用建议，不是 Pinia 强制分层规范。',
  ],
})
